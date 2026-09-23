package com.jumble.backend.model;

import java.io.Serializable;
import java.util.Objects;

/** Composite primary key (child_id, tag_id) for child_tag_weight. */
public class ChildTagWeightId implements Serializable {

    private Long child;
    private Short tag;

    public ChildTagWeightId() {
    }

    public ChildTagWeightId(Long child, Short tag) {
        this.child = child;
        this.tag = tag;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ChildTagWeightId that)) return false;
        return Objects.equals(child, that.child) && Objects.equals(tag, that.tag);
    }

    @Override
    public int hashCode() {
        return Objects.hash(child, tag);
    }
}
