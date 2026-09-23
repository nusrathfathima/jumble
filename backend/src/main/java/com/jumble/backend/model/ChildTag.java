package com.jumble.backend.model;

import jakarta.persistence.*;

/**
 * A child's declared starting interests, captured once at child creation
 * (this is distinct from ChildTagWeight, the *learned* affinity score that
 * feedback later adjusts — see the schema doc section 1). child_tag exists
 * mainly to seed child_tag_weight at 1.5 instead of the default 1.0; the
 * suggestions query itself reads only from ChildTagWeight, never this
 * table directly.
 */
@Entity
@Table(name = "child_tag")
@IdClass(ChildTagId.class)
public class ChildTag {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "child_id", nullable = false)
    private Child child;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tag_id", nullable = false)
    private Tag tag;

    protected ChildTag() {
    }

    public ChildTag(Child child, Tag tag) {
        this.child = child;
        this.tag = tag;
    }

    public Child getChild() {
        return child;
    }

    public Tag getTag() {
        return tag;
    }
}
