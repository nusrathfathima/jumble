package com.jumble.backend.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * A parent (or caregiver) account.
 *
 * This class is a JPA entity: @Entity tells Spring "rows in a database
 * table map to instances of this class." @Table pins down exactly which
 * table (parent, defined in V1__initial_schema.sql) — without it, JPA
 * would guess the table name from the class name, which happens to match
 * here anyway, but being explicit avoids any ambiguity as more entities
 * are added.
 *
 * Every field below corresponds to one column. Getters and setters are
 * written out by hand rather than generated with a library like Lombok,
 * on purpose — one less dependency to explain, and it keeps the mapping
 * between field and column fully visible in this file.
 */
@Entity
@Table(name = "parent")
public class Parent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "display_name")
    private String displayName;

    // Coarse location for weather lookups. Nullable: a parent who hasn't
    // set a location yet simply gets no weather-based filtering, rather
    // than the app breaking.
    private java.math.BigDecimal latitude;
    private java.math.BigDecimal longitude;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    // The other side of the one-to-many relationship declared on Child.
    // mappedBy = "parent" means: the foreign key lives on the Child table,
    // not here — this list is just a convenient Java-side view of it.
    // cascade = ALL means deleting a Parent deletes their Children too,
    // matching the ON DELETE CASCADE already defined in the database
    // schema itself — this keeps the Java-level behavior consistent with
    // what the database would enforce anyway.
    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Child> children = new ArrayList<>();

    // JPA requires a no-argument constructor — it builds an empty instance
    // first, then fills in fields itself when loading a row from the database.
    protected Parent() {
    }

    public Parent(String email, String passwordHash, String displayName) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.displayName = displayName;
    }

    // Automatically fills in createdAt/updatedAt right before this entity
    // is first saved, so calling code never has to remember to set them.
    @PrePersist
    protected void onCreate() {
        this.createdAt = OffsetDateTime.now();
        this.updatedAt = OffsetDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public java.math.BigDecimal getLatitude() {
        return latitude;
    }

    public void setLatitude(java.math.BigDecimal latitude) {
        this.latitude = latitude;
    }

    public java.math.BigDecimal getLongitude() {
        return longitude;
    }

    public void setLongitude(java.math.BigDecimal longitude) {
        this.longitude = longitude;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public List<Child> getChildren() {
        return children;
    }
}
