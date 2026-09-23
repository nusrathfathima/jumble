package com.jumble.backend.model;

import java.io.Serializable;
import java.util.Objects;

/** Composite primary key (activity_id, tag_id) for activity_tag. */
public class ActivityTagId implements Serializable {

    private Long activity;
    private Short tag;

    public ActivityTagId() {
    }

    public ActivityTagId(Long activity, Short tag) {
        this.activity = activity;
        this.tag = tag;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ActivityTagId that)) return false;
        return Objects.equals(activity, that.activity) && Objects.equals(tag, that.tag);
    }

    @Override
    public int hashCode() {
        return Objects.hash(activity, tag);
    }
}
