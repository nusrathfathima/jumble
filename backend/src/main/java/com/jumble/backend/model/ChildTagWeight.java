package com.jumble.backend.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

/**
 * The learned per-(child, tag) affinity score — the actual ranking input
 * the (not-yet-built) suggestions query reads from. One row per tag exists
 * for every child from the moment they're created: 1.5 for tags the parent
 * declared as an interest, 1.0 for everything else. Feedback later nudges
 * these up or down (+0.30 loved, +0.05 ok, -0.20 skipped, clamped to
 * [0.2, 3.0] — see schema doc section 5); none of that logic exists yet,
 * so for now this class only supports the seeding step.
 */
@Entity
@Table(name = "child_tag_weight")
@IdClass(ChildTagWeightId.class)
public class ChildTagWeight {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "child_id", nullable = false)
    private Child child;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tag_id", nullable = false)
    private Tag tag;

    @Column(nullable = false)
    private float weight;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    protected ChildTagWeight() {
    }

    public ChildTagWeight(Child child, Tag tag, float weight) {
        this.child = child;
        this.tag = tag;
        this.weight = weight;
    }

    @PrePersist
    protected void onCreate() {
        this.updatedAt = OffsetDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }

    public Child getChild() {
        return child;
    }

    public Tag getTag() {
        return tag;
    }

    public float getWeight() {
        return weight;
    }

    public void setWeight(float weight) {
        this.weight = weight;
    }
}
