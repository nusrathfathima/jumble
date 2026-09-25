package com.jumble.backend.controller;

import com.jumble.backend.model.Parent;
import com.jumble.backend.repository.ParentRepository;
import com.jumble.backend.service.WeatherService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Optional;

/**
 * The parent-facing side of weather-aware filtering:
 *
 *   PUT    /api/me/location   save the parent's location (from the browser's "Use my location")
 *   DELETE /api/me/location   forget it, which turns weather filtering off again
 *   GET    /api/weather/today today's weather for the saved location, for the line above the form
 *
 * The actual filtering happens in SuggestionController; this controller
 * only manages the location and reports what the weather is.
 */
@RestController
@RequestMapping("/api")
public class WeatherController {

    private final ParentRepository parentRepository;
    private final WeatherService weatherService;

    public WeatherController(ParentRepository parentRepository, WeatherService weatherService) {
        this.parentRepository = parentRepository;
        this.weatherService = weatherService;
    }

    public record LocationRequest(
            @NotNull @DecimalMin("-90") @DecimalMax("90") BigDecimal latitude,
            @NotNull @DecimalMin("-180") @DecimalMax("180") BigDecimal longitude) {
    }

    /**
     * locationSet false: no location saved yet, so the frontend can nudge
     * the parent toward Settings. available false: a location is saved but
     * the weather could not be fetched right now, so there is nothing to show.
     */
    public record TodayWeatherResponse(
            boolean locationSet,
            boolean available,
            String condition,
            BigDecimal tempC,
            Short precipitationChance,
            Boolean outdoorFriendly) {
    }

    private Parent currentParent() {
        Long parentId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return parentRepository.findById(parentId).orElseThrow();
    }

    @PutMapping("/me/location")
    @Transactional
    public ResponseEntity<Void> saveLocation(@Valid @RequestBody LocationRequest request) {
        Parent parent = currentParent();
        // Stored rounded to 2 decimal places (about 1 km) rather than the
        // exact GPS fix the browser hands over. That is plenty for a
        // weather forecast, and it means Jumble never keeps a precise home
        // address for a family with young children.
        parent.setLatitude(request.latitude().setScale(2, RoundingMode.HALF_UP));
        parent.setLongitude(request.longitude().setScale(2, RoundingMode.HALF_UP));
        parentRepository.save(parent);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/me/location")
    @Transactional
    public ResponseEntity<Void> clearLocation() {
        Parent parent = currentParent();
        parent.setLatitude(null);
        parent.setLongitude(null);
        parentRepository.save(parent);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/weather/today")
    public TodayWeatherResponse today() {
        Parent parent = currentParent();
        if (parent.getLatitude() == null || parent.getLongitude() == null) {
            return new TodayWeatherResponse(false, false, null, null, null, null);
        }

        Optional<WeatherService.TodayWeather> weather =
                weatherService.getToday(parent.getLatitude(), parent.getLongitude());

        return weather
                .map(w -> new TodayWeatherResponse(
                        true, true, w.condition(), w.tempC(), w.precipitationChance(), w.outdoorFriendly()))
                .orElseGet(() -> new TodayWeatherResponse(true, false, null, null, null, null));
    }
}
