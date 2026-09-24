package com.jumble.backend.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

/**
 * A record that a child did an activity, with a rating — the feedback loop
 * the whole recommendation system has been waiting on. Two things read
 * this table once rows exist: the suggestions query's repeat-suppression
 * NOT EXISTS (schema doc section 6, already written and just sitting idle
 * until now), and CompletionRepository's weight-adjustment update (schema
 * doc section 5), which is what actually makes suggestions get smarter
 * over time instead of only reflecting declared interests forever.
 *
 * rating is a plain String, not a Java enum, matching the same choice
 * already made for Activity.locationType — the schema doc explicitly
 * prefers a checked VARCHAR over a native Postgres enum (see schema doc
 * section 2), and @Enumerated(EnumType.STRING) would just be extra
 * ceremony around the same three literal values (LOVED, OK, SKIPPED),
 * validated at the controller with the same @Pattern approach already
 * used elsewhere in this project.
 */
@Entity
@Table(name = "completion")
public class Completion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "child_id", nullable = false)
    private Child child;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "activity_id", nullable = false)
    private Activity activity;

    @Column(name = "completed_at", nullable = false)
    private OffsetDateTime completedAt;

    @Column(nullable = false)
    private String rating;

    @Column
    private String note;

    protected Completion() {
    }

    public Completion(Child child, Activity activity, String rating, String note) {
        this.child = child;
        this.activity = activity;
        this.rating = rating;
        this.note = note;
    }

    @PrePersist
    protected void onCreate() {
        this.completedAt = OffsetDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Child getChild() {
        return child;
    }

    public Activity getActivity() {
        return activity;
    }

    public OffsetDateTime getCompletedAt() {
        return completedAt;
    }

    public String getRating() {
        return rating;
    }

    public String getNote() {
        return note;
    }
}
