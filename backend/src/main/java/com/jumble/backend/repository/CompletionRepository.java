package com.jumble.backend.repository;

import com.jumble.backend.model.Completion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CompletionRepository extends JpaRepository<Completion, Long> {

    List<Completion> findByChildIdOrderByCompletedAtDesc(Long childId);

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
