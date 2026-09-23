package com.jumble.backend.controller;

import com.jumble.backend.model.*;
import com.jumble.backend.repository.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * The real child-profile endpoints — what TestDataController's
 * /api/test/children was always standing in for, now with the interest
 * taxonomy wired in and ownership enforced by the logged-in parent's JWT
 * rather than a trusting URL parameter.
 */
@RestController
@RequestMapping("/api/children")
public class ChildController {

    private final ChildRepository childRepository;
    private final ParentRepository parentRepository;
    private final TagRepository tagRepository;
    private final ChildTagRepository childTagRepository;
    private final ChildTagWeightRepository childTagWeightRepository;

    public ChildController(
            ChildRepository childRepository,
            ParentRepository parentRepository,
            TagRepository tagRepository,
            ChildTagRepository childTagRepository,
            ChildTagWeightRepository childTagWeightRepository) {
        this.childRepository = childRepository;
        this.parentRepository = parentRepository;
        this.tagRepository = tagRepository;
        this.childTagRepository = childTagRepository;
        this.childTagWeightRepository = childTagWeightRepository;
    }

    public record CreateChildRequest(
            @NotBlank String name,
            @Min(2000) @Max(2026) int birthYear,
            @Min(1) @Max(12) int birthMonth,
            // Slugs from the tag table (e.g. "art", "outdoor"). Anything
            // not recognised is silently ignored rather than rejected —
            // see the comment in createChild for why.
            List<String> interestTagSlugs) {
    }

    public record ChildView(Long id, String name, int age, List<String> interestTagSlugs) {
    }

    /**
     * Whoever the JWT says is making this request. JwtAuthFilter has
     * already verified the token and put the parent's id here as the
     * authentication's principal — this is what makes ownership
     * "impossible to get wrong from a URL," per the spec's non-functional
     * section: a parent can never pass someone else's id in, because it's
     * never accepted as input in the first place.
     */
    private Long currentParentId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    @GetMapping
    public List<ChildView> listChildren() {
        return childRepository.findByParentId(currentParentId()).stream()
                .map(this::toView)
                .toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChildView> getChild(@PathVariable Long id) {
        Child child = childRepository.findById(id).orElse(null);

        // Same response — 404 — whether the child doesn't exist at all or
        // belongs to a different parent. Returning 403 for "exists but
        // isn't yours" would confirm to a caller that a given id is a real
        // child record, which is more than they're entitled to know.
        if (child == null || !child.getParent().getId().equals(currentParentId())) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(toView(child));
    }

    /**
     * Creates the child, then seeds child_tag and child_tag_weight in the
     * same transaction — per schema doc section 4, a child with no
     * child_tag_weight rows would never receive any suggestions later, so
     * this can't be a follow-up step; it has to happen atomically with
     * child creation.
     */
    @PostMapping
    @Transactional
    public ResponseEntity<ChildView> createChild(@Valid @RequestBody CreateChildRequest request) {
        Parent parent = parentRepository.findById(currentParentId())
                .orElseThrow(() -> new IllegalStateException("Authenticated parent not found"));

        LocalDate birthDate = LocalDate.of(request.birthYear(), request.birthMonth(), 1);
        Child child = new Child(parent, request.name(), birthDate);
        childRepository.save(child);

        List<Tag> allTags = tagRepository.findAll();

        // Unrecognised slugs (a stale frontend, a typo) are dropped rather
        // than causing the whole request to fail — better to create the
        // child with fewer declared interests than to block account setup
        // over a client/server taxonomy mismatch.
        List<String> requestedSlugs = request.interestTagSlugs() == null
                ? List.of()
                : request.interestTagSlugs();
        Set<String> selectedSlugs = allTags.stream()
                .map(Tag::getSlug)
                .filter(requestedSlugs::contains)
                .collect(Collectors.toSet());

        for (Tag tag : allTags) {
            boolean isInterest = selectedSlugs.contains(tag.getSlug());

            if (isInterest) {
                childTagRepository.save(new ChildTag(child, tag));
            }

            // 1.5 for a declared interest, 1.0 otherwise — schema doc
            // section 4, chosen so a brand-new child gets sensible
            // suggestions immediately instead of a cold start, while
            // leaving room for real feedback to move the weight further.
            float startingWeight = isInterest ? 1.5f : 1.0f;
            childTagWeightRepository.save(new ChildTagWeight(child, tag, startingWeight));
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(toView(child));
    }

    private ChildView toView(Child child) {
        List<String> interestSlugs = childTagRepository.findByChildId(child.getId()).stream()
                .map(ct -> ct.getTag().getSlug())
                .toList();
        return new ChildView(child.getId(), child.getName(), child.getAge(), interestSlugs);
    }
}
