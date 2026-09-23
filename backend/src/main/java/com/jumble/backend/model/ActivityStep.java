package com.jumble.backend.model;

import jakarta.persistence.*;

/**
 * One ordered step of an activity's how-to. step_number is Short (SMALLINT
 * in the database), same reasoning as everywhere else this pattern shows
 * up — see Activity.java's class comment.
 */
@Entity
@Table(name = "activity_step")
public class ActivityStep {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "activity_id", nullable = false)
    private Activity activity;

    @Column(name = "step_number", nullable = false)
    private Short stepNumber;

    @Column(name = "short_text", nullable = false)
    private String shortText;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "image_alt")
    private String imageAlt;

    protected ActivityStep() {
    }

    public Long getId() {
        return id;
    }

    public Activity getActivity() {
        return activity;
    }

    public Short getStepNumber() {
        return stepNumber;
    }

    public String getShortText() {
        return shortText;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public String getImageAlt() {
        return imageAlt;
    }
}
