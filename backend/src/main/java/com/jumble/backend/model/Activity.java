package com.jumble.backend.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

/**
 * A library item — a single kid activity, with the constraints the
 * suggestions query filters on (age range, duration, mess level, location)
 * baked in as real columns rather than free text, per the schema doc.
 *
 * min_age_years, max_age_years, duration_minutes, and mess_level are all
 * Short, not Integer — every one of them is SMALLINT in the database (see
 * V1__initial_schema.sql). Tag.java and Material.java hit this exact
 * mismatch already; see their comments for the full story on why Hibernate
 * cares about the distinction even though both would hold the same values.
 */
@Entity
@Table(name = "activity")
public class Activity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String summary;

    @Column(name = "cover_image_url")
    private String coverImageUrl;

    @Column(name = "cover_image_alt")
    private String coverImageAlt;

    @Column(name = "min_age_years", nullable = false)
    private Short minAgeYears;

    @Column(name = "max_age_years", nullable = false)
    private Short maxAgeYears;

    // Realistic total time INCLUDING setup and cleanup — see the schema
    // doc's note on why this matters for the product's credibility.
    @Column(name = "duration_minutes", nullable = false)
    private Short durationMinutes;

    // 1 none, 2 some, 3 significant — enforced by chk_mess_level at the
    // database level, so no Java-side enum duplicates that check.
    @Column(name = "mess_level", nullable = false)
    private Short messLevel;

    // INDOOR | OUTDOOR | EITHER — enforced by chk_location.
    @Column(name = "location_type", nullable = false)
    private String locationType;

    @Column(name = "needs_adult", nullable = false)
    private boolean needsAdult;

    @Column(name = "is_active", nullable = false)
    private boolean isActive;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    protected Activity() {
    }

    public Long getId() {
        return id;
    }

    public String getSlug() {
        return slug;
    }

    public String getTitle() {
        return title;
    }

    public String getSummary() {
        return summary;
    }

    public String getCoverImageUrl() {
        return coverImageUrl;
    }

    public String getCoverImageAlt() {
        return coverImageAlt;
    }

    public Short getMinAgeYears() {
        return minAgeYears;
    }

    public Short getMaxAgeYears() {
        return maxAgeYears;
    }

    public Short getDurationMinutes() {
        return durationMinutes;
    }

    public Short getMessLevel() {
        return messLevel;
    }

    public String getLocationType() {
        return locationType;
    }

    public boolean isNeedsAdult() {
        return needsAdult;
    }

    public boolean isActive() {
        return isActive;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}
