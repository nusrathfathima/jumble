package com.jumble.backend.model;

import jakarta.persistence.*;

/** Which tags an activity belongs to — read by the suggestions query and the activity-detail endpoint. */
@Entity
@Table(name = "activity_tag")
@IdClass(ActivityTagId.class)
public class ActivityTag {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "activity_id", nullable = false)
    private Activity activity;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tag_id", nullable = false)
    private Tag tag;

    protected ActivityTag() {
    }

    public Activity getActivity() {
        return activity;
    }

    public Tag getTag() {
        return tag;
    }
}
