package com.jumble.backend.repository;

import com.jumble.backend.model.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ActivityRepository extends JpaRepository<Activity, Long> {

    List<Activity> findByIsActiveTrue();

    /**
     * A ranked projection an activity row plus its score, not a full
     * Activity entity — this is the shape a native query can populate
     * directly. Spring Data matches each getter to a column alias in the
     * SELECT list below (case-insensitive, so "durationMinutes" the alias
     * maps to getDurationMinutes()).
     */
    interface SuggestionProjection {
        Long getId();
        String getTitle();
        Short getDurationMinutes();
        Double getScore();
    }

    /**
     * This is schema doc section 6, ported essentially verbatim — the CTE
     * for the child's age, the age/duration/mess/location filters, the
     * repeat-suppression NOT EXISTS, and the "relational division"
     * NOT EXISTS for material availability. It's a native query rather
     * than JPQL because JPQL has no clean way to express a correlated
     * double-negative NOT EXISTS subquery or a CTE, and hand-translating
     * this into method-chained Criteria API calls would make the
     * connection to the documented, validated SQL much harder to see (and
     * to keep in sync if the schema doc's query is ever revised).
     *
     * Note on repeat suppression: it references the completion table,
     * which nothing writes to yet (the loved/meh/skip feedback loop is a
     * later feature) — so that NOT EXISTS simply never excludes anything
     * right now. It's already correct and ready for when completions
     * exist; nothing here needs to change later.
     */
    @Query(value = """
            WITH ctx AS (
                SELECT c.id        AS child_id,
                       c.parent_id AS parent_id,
                       EXTRACT(YEAR FROM age(current_date, c.birth_date))::int AS age_years
                FROM child c
                WHERE c.id = :childId
            )
            SELECT a.id AS id,
                   a.title AS title,
                   a.duration_minutes AS durationMinutes,
                   /* Cast explicitly: SUM(real) returns real in Postgres, not
                      double precision, and leaving that implicit risks the
                      same kind of type mismatch that bit Tag/Material/Activity
                      id mapping earlier in this project. Pinning the SQL type
                      here avoids relying on the JDBC driver and the
                      projection mapping to agree on a Float-vs-Double
                      conversion. No apostrophes in this comment on purpose:
                      one inside a comment previously confused Spring Data
                      query parsing into thinking a quote was left open. */
                   CAST(COALESCE(SUM(w.weight), 0) AS double precision) AS score
            FROM activity a
            CROSS JOIN ctx
            LEFT JOIN activity_tag at ON at.activity_id = a.id
            LEFT JOIN child_tag_weight w ON w.tag_id = at.tag_id AND w.child_id = ctx.child_id
            WHERE a.is_active
              AND ctx.age_years BETWEEN a.min_age_years AND a.max_age_years
              AND a.duration_minutes <= :availableMinutes
              AND a.mess_level       <= :maxMessLevel
              AND (:locationType = 'EITHER'
                   OR a.location_type = 'EITHER'
                   OR a.location_type = :locationType)
              AND NOT EXISTS (
                    SELECT 1 FROM completion cp
                    WHERE cp.child_id = ctx.child_id
                      AND cp.activity_id = a.id
                      AND cp.completed_at > now() - make_interval(days => :repeatWindowDays)
              )
              AND NOT EXISTS (
                    SELECT 1
                    FROM activity_material am
                    WHERE am.activity_id = a.id
                      AND NOT am.is_optional
                      AND NOT EXISTS (
                            SELECT 1 FROM parent_inventory pi
                            WHERE pi.parent_id   = ctx.parent_id
                              AND pi.material_id = am.material_id
                      )
              )
            GROUP BY a.id, a.title, a.duration_minutes
            ORDER BY score DESC, random()
            LIMIT 5
            """, nativeQuery = true)
    List<SuggestionProjection> findSuggestions(
            @Param("childId") Long childId,
            @Param("availableMinutes") int availableMinutes,
            @Param("maxMessLevel") int maxMessLevel,
            @Param("locationType") String locationType,
            @Param("repeatWindowDays") int repeatWindowDays);

    /**
     * "Show what's missing" — for when findSuggestions comes back empty.
     * Same age/duration/mess/location/repeat filters as findSuggestions,
     * but instead of excluding an activity for missing a required
     * material, this deliberately keeps it and reports exactly which
     * material(s) are missing, so the empty-state screen can say
     * something actionable ("you're missing 2 things for X") instead of
     * just "nothing matched, try loosening filters."
     *
     * missingMaterials comes back as one comma-separated string rather
     * than a Postgres array: mapping a native-query TEXT/VARCHAR column
     * to a Java String is the same well-trodden path every other
     * projection here already uses, whereas mapping a Postgres array
     * type needs extra Hibernate type configuration this project doesn't
     * have set up — not worth the risk for a details field. The
     * controller splits the string back into a list before it reaches
     * the frontend.
     */
    interface NearMissProjection {
        Long getId();
        String getTitle();
        Short getDurationMinutes();
        String getMissingMaterials();
        Long getMissingCount();
    }

    @Query(value = """
            WITH ctx AS (
                SELECT c.id        AS child_id,
                       c.parent_id AS parent_id,
                       EXTRACT(YEAR FROM age(current_date, c.birth_date))::int AS age_years
                FROM child c
                WHERE c.id = :childId
            ),
            candidate AS (
                SELECT a.id, a.title, a.duration_minutes
                FROM activity a
                CROSS JOIN ctx
                WHERE a.is_active
                  AND ctx.age_years BETWEEN a.min_age_years AND a.max_age_years
                  AND a.duration_minutes <= :availableMinutes
                  AND a.mess_level       <= :maxMessLevel
                  AND (:locationType = 'EITHER'
                       OR a.location_type = 'EITHER'
                       OR a.location_type = :locationType)
                  AND NOT EXISTS (
                        SELECT 1 FROM completion cp
                        WHERE cp.child_id = ctx.child_id
                          AND cp.activity_id = a.id
                          AND cp.completed_at > now() - make_interval(days => :repeatWindowDays)
                  )
            ),
            missing AS (
                SELECT c.id AS activity_id, c.title, c.duration_minutes, m.display_name AS missing_material
                FROM candidate c
                CROSS JOIN ctx
                JOIN activity_material am ON am.activity_id = c.id AND NOT am.is_optional
                JOIN material m ON m.id = am.material_id
                WHERE NOT EXISTS (
                        SELECT 1 FROM parent_inventory pi
                        WHERE pi.parent_id   = ctx.parent_id
                          AND pi.material_id = am.material_id
                )
            )
            SELECT activity_id AS id,
                   title AS title,
                   duration_minutes AS durationMinutes,
                   string_agg(missing_material, ', ' ORDER BY missing_material) AS missingMaterials,
                   COUNT(*) AS missingCount
            FROM missing
            GROUP BY activity_id, title, duration_minutes
            ORDER BY missingCount ASC, title ASC
            LIMIT 5
            """, nativeQuery = true)
    List<NearMissProjection> findNearMisses(
            @Param("childId") Long childId,
            @Param("availableMinutes") int availableMinutes,
            @Param("maxMessLevel") int maxMessLevel,
            @Param("locationType") String locationType,
            @Param("repeatWindowDays") int repeatWindowDays);
}
