package com.jumble.backend.controller;

import com.jumble.backend.model.Child;
import com.jumble.backend.repository.ChildRepository;
import com.jumble.backend.repository.CompletionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;

/**
 * Spec section 3, item 8's "simple stats" half of history — the log itself
 * (GET /api/children/{id}/completions) already existed from the feedback
 * loop work; this is the aggregate view on top of it: "14 activities this
 * month, favourite category: crafts". Everything here reads from the same
 * completion rows the feedback loop already writes, so there's no new
 * table and no new data to keep in sync — just four counts and a
 * favourite-tag lookup against history that's already there.
 */
@RestController
@RequestMapping("/api/children/{childId}/stats")
public class StatsController {

    private final ChildRepository childRepository;
    private final CompletionRepository completionRepository;

    public StatsController(ChildRepository childRepository, CompletionRepository completionRepository) {
        this.childRepository = childRepository;
        this.completionRepository = completionRepository;
    }

    public record FavoriteTagView(String slug, String displayName, long completionCount) {
    }

    public record StatsResponse(
            long totalCompletions,
            long completionsThisMonth,
            long lovedCount,
            long okCount,
            long skippedCount,
            FavoriteTagView favoriteTag) {
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
    public ResponseEntity<?> getStats(@PathVariable Long childId) {
        if (ownedChildOrNull(childId) == null) {
            return ResponseEntity.notFound().build();
        }

        // Calendar-month boundary, not a rolling 30 days — "this month"
        // reads naturally on a stats card and resets on a date a parent
        // can predict, the same way a bank statement or a phone bill does.
        OffsetDateTime startOfMonth = OffsetDateTime.now()
                .withDayOfMonth(1)
                .truncatedTo(ChronoUnit.DAYS);

        long total = completionRepository.countByChildId(childId);
        long thisMonth = completionRepository.countByChildIdAndCompletedAtGreaterThanEqual(childId, startOfMonth);
        long loved = completionRepository.countByChildIdAndRating(childId, "LOVED");
        long ok = completionRepository.countByChildIdAndRating(childId, "OK");
        long skipped = completionRepository.countByChildIdAndRating(childId, "SKIPPED");

        FavoriteTagView favoriteTag = completionRepository
                .findTopTag(childId)
                .map(row -> new FavoriteTagView(row.getSlug(), row.getDisplayName(), row.getCompletionCount()))
                // No completions yet, or every completed activity happens to
                // carry no tags at all — either way there's nothing to name
                // as a favourite, so this comes back null rather than a
                // fabricated "favourite" out of zero data.
                .orElse(null);

        return ResponseEntity.ok(
                new StatsResponse(total, thisMonth, loved, ok, skipped, favoriteTag));
    }
}
