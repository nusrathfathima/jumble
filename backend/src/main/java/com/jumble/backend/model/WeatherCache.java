package com.jumble.backend.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

/**
 * One day of weather for one coarse location — the weather_cache table
 * from V1__initial_schema.sql. The table has existed since the very first
 * migration; this is just the first time anything reads or writes it.
 *
 * locationKey is latitude/longitude rounded to 1 decimal place (about
 * 11 km), so every parent in the same neighbourhood shares one row and
 * one upstream API call per day.
 *
 * precipitationChance is Short, not Integer, because its column is
 * SMALLINT (see the Short vs Integer note in README.md).
 */
@Entity
@Table(name = "weather_cache")
public class WeatherCache {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "location_key", nullable = false)
    private String locationKey;

    @Column(name = "forecast_date", nullable = false)
    private LocalDate forecastDate;

    @Column(name = "outdoor_friendly", nullable = false)
    private Boolean outdoorFriendly;

    private String condition;

    @Column(name = "temp_c")
    private BigDecimal tempC;

    @Column(name = "precipitation_chance")
    private Short precipitationChance;

    @Column(name = "fetched_at", nullable = false)
    private OffsetDateTime fetchedAt;

    protected WeatherCache() {
    }

    public WeatherCache(
            String locationKey,
            LocalDate forecastDate,
            boolean outdoorFriendly,
            String condition,
            BigDecimal tempC,
            Short precipitationChance) {
        this.locationKey = locationKey;
        this.forecastDate = forecastDate;
        this.outdoorFriendly = outdoorFriendly;
        this.condition = condition;
        this.tempC = tempC;
        this.precipitationChance = precipitationChance;
    }

    @PrePersist
    protected void onCreate() {
        this.fetchedAt = OffsetDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getLocationKey() {
        return locationKey;
    }

    public LocalDate getForecastDate() {
        return forecastDate;
    }

    public Boolean getOutdoorFriendly() {
        return outdoorFriendly;
    }

    public String getCondition() {
        return condition;
    }

    public BigDecimal getTempC() {
        return tempC;
    }

    public Short getPrecipitationChance() {
        return precipitationChance;
    }

    public OffsetDateTime getFetchedAt() {
        return fetchedAt;
    }
}
