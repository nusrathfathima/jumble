package com.jumble.backend.controller;

import com.jumble.backend.model.Activity;
import com.jumble.backend.model.Child;
import com.jumble.backend.model.Completion;
import com.jumble.backend.repository.ActivityRepository;
import com.jumble.backend.repository.ChildRepository;
import com.jumble.backend.repository.CompletionRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * The feedback loop — schema doc sections 5 and 6 finally wired up to real
 * requests. Recording a completion does two things in one transaction:
 * inserts the history row (which is what the suggestions query's repeat
 * suppression has been silently checking against since the very first
 * version of that query), and nudges the child's tag weights up or down
 * depending on the rating (schema doc section 5), which is what makes
 * later suggestions actually reflect what a child enjoyed rather than only
 * their declared interests from signup.
 */
@RestController
@RequestMapping("/api/children/{childId}/completions")
public class CompletionController {

    // Schema doc section 5's adjustment table, verbatim.
    private static final float DELTA_LOVED = 0.30f;
    private static final float DELTA_OK = 0.05f;
    private static final float DELTA_SKIPPED = -0.20f;

    private final ChildRepository childRepository;
    private final ActivityRepository activityRepository;
    private final CompletionRepository completionRepository;

    public CompletionController(
            ChildRepository childRepository,
            ActivityRepository activityRepository,
            CompletionRepository completionRepository) {
        this.childRepository = childRepository;
        this.activityRepository = activityRepository;
        this.completionRepository = completionRepository;
    }

    public record RecordCompletionRequest(
            @NotNull Long activityId,
            // @NotBlank first so a missing/blank rating gets that specific
            // message rather than falling through to the @Pattern one —
            // both run either way, but this keeps the 400 body readable.
            @NotBlank
                    @Pattern(regexp = "LOVED|OK|SKIPPED", message = "rating must be one of LOVED, OK, SKIPPED")
                    String rating,
            @Size(max = 500) String note) {
    }

    public record CompletionView(
            Long id, Long activityId, String activityTitle, String rating, String note, OffsetDateTime completedAt) {
    }

    public record ErrorResponse(String message) {
    }

    private Long currentParentId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    /** Same ownership-derived-from-JWT pattern as every other child-scoped endpoint in this project. */
    private Child ownedChildOrNull(Long childId) {
        Child child = childRepository.findById(childId).orElse(null);
        if (child == null || !child.getParent().getId().equals(currentParentId())) {
            return null;
        }
        return child;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<?> listCompletions(@PathVariable Long childId) {
        if (ownedChildOrNull(childId) == null) {
            return ResponseEntity.notFound().build();
        }

        List<CompletionView> views = completionRepository.findByChildIdOrderByCompletedAtDesc(childId).stream()
                .map(this::toView)
                .toList();

        return ResponseEntity.ok(views);
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> recordCompletion(
            @PathVariable Long childId, @Valid @RequestBody RecordCompletionRequest request) {
        Child child = ownedChildOrNull(childId);
        if (child == null) {
            return ResponseEntity.notFound().build();
        }

        Activity activity = activityRepository.findById(request.activityId()).orElse(null);
        if (activity == null) {
            return ResponseEntity.badRequest().body(new ErrorResponse("No activity with that id."));
        }

        Completion completion = new Completion(child, activity, request.rating(), request.note());
        completionRepository.save(completion);

        float delta =
                switch (request.rating()) {
                    case "LOVED" -> DELTA_LOVED;
                    case "OK" -> DELTA_OK;
                    case "SKIPPED" -> DELTA_SKIPPED;
                    // Unreachable: @Pattern on the request already restricts
                    // rating to exactly these three values before this method
                    // runs, and @Valid rejects anything else with a 400.
                    default -> 0f;
                };
        completionRepository.adjustTagWeights(childId, activity.getId(), delta);

        return ResponseEntity.status(HttpStatus.CREATED).body(toView(completion));
    }

    private CompletionView toView(Completion completion) {
        return new CompletionView(
                completion.getId(),
                completion.getActivity().getId(),
                completion.getActivity().getTitle(),
                completion.getRating(),
                completion.getNote(),
                completion.getCompletedAt());
    }
}
