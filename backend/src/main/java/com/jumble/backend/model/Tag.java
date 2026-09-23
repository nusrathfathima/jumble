package com.jumble.backend.model;

import jakarta.persistence.*;

/**
 * The controlled vocabulary of activity/interest categories — art, science,
 * outdoor, building, pretend play, cooking, quiet/reading for the MVP (seeded
 * by V2__seed_tags.sql). A lookup table rather than free text on Child or
 * Activity, per the schema doc: it's what lets child_tag_weight join
 * cleanly, lets a tag be renamed in one place, and stops typos from
 * fragmenting the taxonomy into near-duplicate tags.
 */
@Entity
@Table(name = "tag")
public class Tag {

    // Short, not Integer: the tag table's id column is SMALLINT in the
    // database (there will only ever be a few dozen tags at most), and
    // Hibernate's schema validation checks the Java type against the exact
    // database column type — Integer maps to INTEGER and fails validation
    // against a SMALLINT column, even though both would work fine in
    // practice.
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Short id;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(name = "display_name", nullable = false)
    private String displayName;

    protected Tag() {
    }

    public Tag(String slug, String displayName) {
        this.slug = slug;
        this.displayName = displayName;
    }

    public Short getId() {
        return id;
    }

    public String getSlug() {
        return slug;
    }

    public String getDisplayName() {
        return displayName;
    }
}
