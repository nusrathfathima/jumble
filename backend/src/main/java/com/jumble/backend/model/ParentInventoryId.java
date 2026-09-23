package com.jumble.backend.model;

import java.io.Serializable;
import java.util.Objects;

/** Composite primary key (parent_id, material_id) for parent_inventory. */
public class ParentInventoryId implements Serializable {

    private Long parent;
    private Short material;

    public ParentInventoryId() {
    }

    public ParentInventoryId(Long parent, Short material) {
        this.parent = parent;
        this.material = material;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ParentInventoryId that)) return false;
        return Objects.equals(parent, that.parent) && Objects.equals(material, that.material);
    }

    @Override
    public int hashCode() {
        return Objects.hash(parent, material);
    }
}
