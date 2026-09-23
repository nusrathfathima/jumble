package com.jumble.backend.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

/**
 * What a household has on hand. Belongs to the parent, not the child — per
 * the schema doc, supplies are a household resource, and modelling them
 * per-child would duplicate rows and create contradictions between
 * siblings (does the glue exist for one kid but not the other?).
 */
@Entity
@Table(name = "parent_inventory")
@IdClass(ParentInventoryId.class)
public class ParentInventory {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id", nullable = false)
    private Parent parent;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "material_id", nullable = false)
    private Material material;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    protected ParentInventory() {
    }

    public ParentInventory(Parent parent, Material material) {
        this.parent = parent;
        this.material = material;
    }

    @PrePersist
    protected void onCreate() {
        this.updatedAt = OffsetDateTime.now();
    }

    public Parent getParent() {
        return parent;
    }

    public Material getMaterial() {
        return material;
    }
}
