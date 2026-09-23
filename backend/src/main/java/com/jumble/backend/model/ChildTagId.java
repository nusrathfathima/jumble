package com.jumble.backend.model;

import java.io.Serializable;
import java.util.Objects;

/**
 * The composite primary key (child_id, tag_id) for child_tag, matching the
 * schema's PRIMARY KEY (child_id, tag_id). JPA requires this to be its own
 * class — implementing equals()/hashCode() correctly is what makes
 * Hibernate able to tell two composite keys apart, so both fields are
 * included in each, deliberately.
 */
public class ChildTagId implements Serializable {

    private Long child;
    private Short tag;

    public ChildTagId() {
    }

    public ChildTagId(Long child, Short tag) {
        this.child = child;
        this.tag = tag;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ChildTagId that)) return false;
        return Objects.equals(child, that.child) && Objects.equals(tag, that.tag);
    }

    @Override
    public int hashCode() {
        return Objects.hash(child, tag);
    }
}
