package com.jumble.backend.model;

import java.io.Serializable;
import java.util.Objects;

/** Composite primary key (activity_id, material_id) for activity_material. */
public class ActivityMaterialId implements Serializable {

    private Long activity;
    private Short material;

    public ActivityMaterialId() {
    }

    public ActivityMaterialId(Long activity, Short material) {
        this.activity = activity;
        this.material = material;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ActivityMaterialId that)) return false;
        return Objects.equals(activity, that.activity) && Objects.equals(material, that.material);
    }

    @Override
    public int hashCode() {
        return Objects.hash(activity, material);
    }
}
