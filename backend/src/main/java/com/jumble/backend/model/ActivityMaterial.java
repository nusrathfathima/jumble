package com.jumble.backend.model;

import jakarta.persistence.*;

/**
 * What an activity needs. is_optional is the field that matters most here:
 * the availability filter in the suggestions query only enforces
 * non-optional rows, so an activity needing glitter as a nice-to-have
 * isn't hidden from every household without glitter.
 */
@Entity
@Table(name = "activity_material")
@IdClass(ActivityMaterialId.class)
public class ActivityMaterial {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "activity_id", nullable = false)
    private Activity activity;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "material_id", nullable = false)
    private Material material;

    @Column(name = "is_optional", nullable = false)
    private boolean isOptional;

    protected ActivityMaterial() {
    }

    public Activity getActivity() {
        return activity;
    }

    public Material getMaterial() {
        return material;
    }

    public boolean isOptional() {
        return isOptional;
    }
}
