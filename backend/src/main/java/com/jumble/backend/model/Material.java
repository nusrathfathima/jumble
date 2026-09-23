package com.jumble.backend.model;

import jakarta.persistence.*;

/**
 * A supply item a household might have on hand — flour, glue, a cardboard
 * box. Like Tag, this is a lookup table (not free text) so activities can
 * reference materials consistently and the availability filter in the
 * suggestions query can join cleanly.
 *
 * id is Short, not Integer — material.id is SMALLINT in the database (see
 * V1__initial_schema.sql), and Hibernate's schema validation checks the
 * exact column type. Tag.java hit this same mismatch first; see its
 * comment for the full explanation.
 */
@Entity
@Table(name = "material")
public class Material {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Short id;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(name = "display_name", nullable = false)
    private String displayName;

    // KITCHEN | CRAFT | RECYCLING | OUTDOOR | OTHER — enforced by the
    // database's chk_material_category constraint, so no Java-side enum
    // validation is duplicated here; a bad value fails at the database
    // rather than silently succeeding with an unrecognised category.
    @Column(nullable = false)
    private String category;

    @Column(name = "is_common", nullable = false)
    private boolean isCommon;

    protected Material() {
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

    public String getCategory() {
        return category;
    }

    public boolean isCommon() {
        return isCommon;
    }
}
