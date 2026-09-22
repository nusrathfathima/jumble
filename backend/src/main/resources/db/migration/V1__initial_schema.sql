-- Jumble initial schema
-- Generated from docs/jumble-schema.md section 3, validated against a real
-- PostgreSQL 16 instance during the schema-design step (see that doc's
-- section 8 for the validation results). Applied automatically by Flyway
-- the first time the backend connects to a fresh database.

-- ---------------------------------------------------------------
-- Accounts
-- ---------------------------------------------------------------
CREATE TABLE parent (
    id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email          VARCHAR(255) NOT NULL UNIQUE,
    password_hash  VARCHAR(100) NOT NULL,
    display_name   VARCHAR(100),
    -- Coarse location for weather; NULL disables weather filtering
    latitude       NUMERIC(8,5),
    longitude      NUMERIC(8,5),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE child (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    parent_id   BIGINT NOT NULL REFERENCES parent(id) ON DELETE CASCADE,
    name        VARCHAR(80) NOT NULL,
    -- Month/year only; day is always stored as 01
    birth_date  DATE NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_child_parent ON child(parent_id);

-- ---------------------------------------------------------------
-- Taxonomy
-- ---------------------------------------------------------------
CREATE TABLE tag (
    id            SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    slug          VARCHAR(40) NOT NULL UNIQUE,
    display_name  VARCHAR(60) NOT NULL
);

-- A child's declared starting interests, captured at onboarding.
-- Used to seed child_tag_weight; feedback takes over from there.
CREATE TABLE child_tag (
    child_id  BIGINT   NOT NULL REFERENCES child(id) ON DELETE CASCADE,
    tag_id    SMALLINT NOT NULL REFERENCES tag(id)   ON DELETE CASCADE,
    PRIMARY KEY (child_id, tag_id)
);

-- Learned affinity. One row per (child, tag), seeded at child creation.
CREATE TABLE child_tag_weight (
    child_id    BIGINT   NOT NULL REFERENCES child(id) ON DELETE CASCADE,
    tag_id      SMALLINT NOT NULL REFERENCES tag(id)   ON DELETE CASCADE,
    weight      REAL     NOT NULL DEFAULT 1.0,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (child_id, tag_id),
    CONSTRAINT chk_weight_range CHECK (weight >= 0.2 AND weight <= 3.0)
);

-- ---------------------------------------------------------------
-- Activity library
-- ---------------------------------------------------------------
CREATE TABLE activity (
    id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    slug              VARCHAR(80)  NOT NULL UNIQUE,
    title             VARCHAR(140) NOT NULL,
    summary           VARCHAR(300) NOT NULL,
    -- Card/hero image; the how-to detail now lives in activity_step below
    cover_image_url   VARCHAR(500),
    cover_image_alt   VARCHAR(200),
    min_age_years     SMALLINT     NOT NULL,
    max_age_years     SMALLINT     NOT NULL,
    -- Realistic total time INCLUDING setup and cleanup
    duration_minutes  SMALLINT     NOT NULL,
    mess_level        SMALLINT     NOT NULL,   -- 1 none, 2 some, 3 significant
    location_type     VARCHAR(10)  NOT NULL,   -- INDOOR | OUTDOOR | EITHER
    needs_adult       BOOLEAN      NOT NULL DEFAULT false,
    is_active         BOOLEAN      NOT NULL DEFAULT true,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT chk_age_range   CHECK (min_age_years <= max_age_years),
    CONSTRAINT chk_mess_level  CHECK (mess_level BETWEEN 1 AND 3),
    CONSTRAINT chk_location    CHECK (location_type IN ('INDOOR','OUTDOOR','EITHER')),
    CONSTRAINT chk_duration    CHECK (duration_minutes > 0)
);

CREATE INDEX idx_activity_active ON activity(is_active)
    WHERE is_active;

CREATE TABLE activity_tag (
    activity_id  BIGINT   NOT NULL REFERENCES activity(id) ON DELETE CASCADE,
    tag_id       SMALLINT NOT NULL REFERENCES tag(id)      ON DELETE CASCADE,
    PRIMARY KEY (activity_id, tag_id)
);

CREATE INDEX idx_activity_tag_tag ON activity_tag(tag_id);

-- The step-by-step "how to actually do this" walkthrough.
-- One activity has many ordered steps, each with its own short text and image.
CREATE TABLE activity_step (
    id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    activity_id  BIGINT   NOT NULL REFERENCES activity(id) ON DELETE CASCADE,
    step_number  SMALLINT NOT NULL,
    short_text   VARCHAR(300) NOT NULL,
    image_url    VARCHAR(500),
    image_alt    VARCHAR(200),
    CONSTRAINT uq_activity_step UNIQUE (activity_id, step_number),
    CONSTRAINT chk_step_number  CHECK (step_number > 0),
    -- An image without alt text is an accessibility gap, not just a missing caption
    CONSTRAINT chk_step_image_alt CHECK (image_url IS NULL OR image_alt IS NOT NULL)
);

CREATE INDEX idx_activity_step_activity ON activity_step(activity_id, step_number);

-- ---------------------------------------------------------------
-- Materials and household inventory
-- ---------------------------------------------------------------
CREATE TABLE material (
    id            SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    slug          VARCHAR(50) NOT NULL UNIQUE,
    display_name  VARCHAR(80) NOT NULL,
    category      VARCHAR(30) NOT NULL,  -- KITCHEN | CRAFT | RECYCLING | OUTDOOR | OTHER
    -- Pre-ticked during onboarding so parents aren't faced with 80 checkboxes
    is_common     BOOLEAN     NOT NULL DEFAULT false,
    CONSTRAINT chk_material_category
        CHECK (category IN ('KITCHEN','CRAFT','RECYCLING','OUTDOOR','OTHER'))
);

CREATE TABLE activity_material (
    activity_id  BIGINT   NOT NULL REFERENCES activity(id) ON DELETE CASCADE,
    material_id  SMALLINT NOT NULL REFERENCES material(id) ON DELETE RESTRICT,
    -- Optional materials do NOT block a suggestion
    is_optional  BOOLEAN  NOT NULL DEFAULT false,
    PRIMARY KEY (activity_id, material_id)
);

CREATE INDEX idx_activity_material_material ON activity_material(material_id);

CREATE TABLE parent_inventory (
    parent_id    BIGINT   NOT NULL REFERENCES parent(id)   ON DELETE CASCADE,
    material_id  SMALLINT NOT NULL REFERENCES material(id) ON DELETE CASCADE,
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (parent_id, material_id)
);

-- ---------------------------------------------------------------
-- History and feedback
-- ---------------------------------------------------------------
CREATE TABLE completion (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    child_id      BIGINT      NOT NULL REFERENCES child(id)    ON DELETE CASCADE,
    activity_id   BIGINT      NOT NULL REFERENCES activity(id) ON DELETE RESTRICT,
    completed_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    rating        VARCHAR(10) NOT NULL,   -- LOVED | OK | SKIPPED
    note          VARCHAR(500),
    CONSTRAINT chk_rating CHECK (rating IN ('LOVED','OK','SKIPPED'))
);

-- Serves the repeat-suppression subquery and the history screen
CREATE INDEX idx_completion_child_recent
    ON completion(child_id, completed_at DESC);
CREATE INDEX idx_completion_child_activity
    ON completion(child_id, activity_id);

-- ---------------------------------------------------------------
-- Weather cache
-- ---------------------------------------------------------------
-- One row per coarse location per day. location_key is lat/lon rounded
-- to 1 decimal place (~11km), which collapses a whole neighbourhood into
-- a single upstream API call.
CREATE TABLE weather_cache (
    id                   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    location_key         VARCHAR(20) NOT NULL,
    forecast_date        DATE        NOT NULL,
    outdoor_friendly     BOOLEAN     NOT NULL,
    condition            VARCHAR(40),
    temp_c               NUMERIC(4,1),
    precipitation_chance SMALLINT,
    fetched_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_weather UNIQUE (location_key, forecast_date)
);
