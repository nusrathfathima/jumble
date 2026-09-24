package com.jumble.backend.repository;

import com.jumble.backend.model.Completion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface CompletionRepository extends JpaRepository<Completion, Long> {

    List<Completion> findByChildIdOrderByCompletedAtDesc(Long childId);

    // The four counts StatsController needs. Plain Spring-Data-derived
    // queries rather than one hand-rolled aggregate query — each one maps
    // to a single COUNT(*) with a WHERE clause Spring Data can build from
    // the method name alone, and there are only four of them, so nothing
    // here is complex enough to earn a native @Query the way the ranking
    // and weight-adjustment queries elsewhere in this project do.
    long countByChildId(Long childId);

    long countByChildIdAndCompletedAtGreaterThanEqual(Long childId, OffsetDateTime from);

    long countByChildIdAndRating(Long childId, String rating);

    /**
     * The tag this child's completed activities lean on most, for the
     * "favourite category" stat from spec section 3, item 8. Counts once
     * per (completion, tag) pair, so an activity tagged both CRAFT and
     * QUIET contributes to both tallies rather than forcing a single
     * "primary" tag that the schema doesn't actually have a concept of.
     * A native query rather than a JPQL one because there's no JPA
     * association from Completion straight through to Tag to walk —
     * activity_tag sits in between as its own join entity — so this is a
     * plain three-table join expressed the same way the schema doc's own
     * queries are.
     */
    @Query(
            value =
                    """
            SELECT t.slug AS slug, t.display_name AS displayName, COUNT(*) AS completionCount
            FROM completion cp
            JOIN activity_tag at ON at.activity_id = cp.activity_id
            JOIN tag t ON t.id = at.tag_id
            WHERE cp.child_id = :childId
            GROUP BY t.slug, t.display_name
            ORDER BY completionCount DESC, t.display_name
            LIMIT 1
            """,
            nativeQuery = true)
    Optional<TagCountProjection> findTopTag(@Param("childId") Long childId);

    interface TagCountProjection {
        String getSlug();

        String getDisplayName();

        long getCompletionCount();
    }

    /**
     * Schema doc section 5, ported as-is: every tag this activity belongs
     * to gets its weight nudged by delta for this child, clamped to
     * [0.2, 3.0] — the same range chk_weight_range enforces at the
     * database level, so this can never actually violate that constraint,
     * but computing the clamp here too (rather than relying on the
     * database to reject an out-of-range write) means a LOVED streak just
     * stops moving the needle at 3.0 instead of erroring out.
     *
     * A plain UPDATE has no result set to map, so this is @Modifying
     * rather than returning a projection like the two queries in
     * ActivityRepository — the caller needs @Transactional (Spring Data
     * requires a transaction for any modifying query), which
     * CompletionController provides around the whole feedback operation.
     */
    @Modifying
    @Query(value = """
            UPDATE child_tag_weight w
            SET weight     = LEAST(3.0, GREATEST(0.2, w.weight + :delta)),
                updated_at = now()
            WHERE w.child_id = :childId
              AND w.tag_id IN (SELECT tag_id FROM activity_tag WHERE activity_id = :activityId)
            """, nativeQuery = true)
    void adjustTagWeights(
            @Param("childId") Long childId,
            @Param("activityId") Long activityId,
            @Param("delta") float delta);
}
