package com.jumble.backend.repository;

import com.jumble.backend.model.WeatherCache;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface WeatherCacheRepository extends JpaRepository<WeatherCache, Long> {

    // Backed by the uq_weather unique constraint on (location_key,
    // forecast_date), so this lookup is an index hit, not a table scan.
    Optional<WeatherCache> findByLocationKeyAndForecastDate(String locationKey, LocalDate forecastDate);
}
