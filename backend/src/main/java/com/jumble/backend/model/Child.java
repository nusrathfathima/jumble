package com.jumble.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.Period;

/**
 * A child belonging to a Parent.
 *
 * Two things worth reading the comments on below, not just the code:
 * how age is calculated, and how birthDate is deliberately incomplete.
 */
@Entity
@Table(name = "child")
public class Child {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The other side of Parent.children. @ManyToOne + @JoinColumn is what
    // actually creates the foreign key column (parent_id) on this table —
    // this is the "owning" side of the relationship; Parent's @OneToMany
    // just reads it.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id", nullable = false)
    private Parent parent;

    @Column(nullable = false)
    private String name;

    // Deliberately stores month and year only — the day is always
    // hard-coded to the 1st when a child profile is created, so no exact
    // date of birth is ever held in the database. This mirrors the
    // decision recorded in docs/jumble-schema.md section 2: a privacy
    // choice as much as a data-modeling one.
    @Column(name = "birth_date", nullable = false)
    private LocalDate birthDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    protected Child() {
    }

    public Child(Parent parent, String name, LocalDate birthDate) {
        this.parent = parent;
        this.name = name;
        this.birthDate = birthDate;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = OffsetDateTime.now();
        this.updatedAt = OffsetDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }

    /**
     * Age in whole years, computed from birthDate rather than stored.
     *
     * This is the Java-side equivalent of the age(current_date, birth_date)
     * calculation in the suggestions SQL query from the schema doc — it
     * exists here too because age needs to be readable from ordinary Java
     * code (for example, an endpoint that just displays a child's profile),
     * not only from that one recommendation query.
     *
     * Computing it on every call, rather than caching it on the object,
     * is deliberate: a cached value would silently go stale the moment a
     * birthday passes while the object sits in memory or in a UI the
     * parent has open.
     */
    @Transient
    public int getAge() {
        return Period.between(birthDate, LocalDate.now()).getYears();
    }

    public Long getId() {
        return id;
    }

    public Parent getParent() {
        return parent;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public LocalDate getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(LocalDate birthDate) {
        this.birthDate = birthDate;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }
}
