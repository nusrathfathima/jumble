package com.jumble.backend.service;

import com.jumble.backend.model.WeatherCache;
import com.jumble.backend.repository.WeatherCacheRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Today's weather for a parent's location, from Open-Meteo (free, no API
 * key), cached in weather_cache so each neighbourhood costs at most one
 * upstream call per day, however many suggestion requests come in. This
 * is spec section 8's "called once per parent location per day and
 * cached server-side": the same cost discipline as budgeting AI tokens,
 * applied to API calls instead.
 *
 * Weather is a nice-to-have, never a blocker. If the parent has no
 * location saved, or Open-Meteo is slow or down, getToday returns empty
 * and suggestions simply run without weather filtering, instead of the
 * whole "get a suggestion" request failing.
 */
@Service
public class WeatherService {

    private static final Logger log = LoggerFactory.getLogger(WeatherService.class);

    /** Daily max chance of precipitation, in percent, at or above which a day counts as wet. */
    private static final int RAIN_CHANCE_THRESHOLD = 50;

    private final WeatherCacheRepository weatherCacheRepository;
    private final RestClient restClient;

    public WeatherService(WeatherCacheRepository weatherCacheRepository) {
        this.weatherCacheRepository = weatherCacheRepository;

        // Short timeouts on purpose: weather is decoration on top of the
        // suggestions request, so a slow weather API should cost a parent
        // a few seconds at most, not hang the whole page.
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(3));
        requestFactory.setReadTimeout(Duration.ofSeconds(5));

        this.restClient = RestClient.builder()
                .baseUrl("https://api.open-meteo.com")
                .requestFactory(requestFactory)
                .build();
    }

    public record TodayWeather(
            String condition, BigDecimal tempC, Short precipitationChance, boolean outdoorFriendly) {
    }

    public Optional<TodayWeather> getToday(BigDecimal latitude, BigDecimal longitude) {
        if (latitude == null || longitude == null) {
            return Optional.empty();
        }

        BigDecimal roundedLat = latitude.setScale(1, RoundingMode.HALF_UP);
        BigDecimal roundedLon = longitude.setScale(1, RoundingMode.HALF_UP);
        String locationKey = roundedLat.toPlainString() + "," + roundedLon.toPlainString();
        LocalDate today = LocalDate.now();

        Optional<WeatherCache> cached = weatherCacheRepository.findByLocationKeyAndForecastDate(locationKey, today);
        if (cached.isPresent()) {
            return Optional.of(toView(cached.get()));
        }

        WeatherCache fresh;
        try {
            fresh = fetchFromOpenMeteo(roundedLat, roundedLon, locationKey, today);
        } catch (RuntimeException e) {
            log.warn("Weather lookup failed for {}: {}", locationKey, e.getMessage());
            return Optional.empty();
        }

        try {
            weatherCacheRepository.save(fresh);
        } catch (DataIntegrityViolationException e) {
            // Two requests for the same neighbourhood raced each other and
            // the other one saved today's row first. The data is identical,
            // so there's nothing to do but use what was just fetched.
        }
        return Optional.of(toView(fresh));
    }

    private TodayWeather toView(WeatherCache row) {
        return new TodayWeather(
                row.getCondition(), row.getTempC(), row.getPrecipitationChance(), row.getOutdoorFriendly());
    }

    /**
     * Asks for one day of daily values, in the location's own timezone:
     * the WMO weather code, the high temperature, and the highest chance
     * of precipitation. Deliberately requested with the ROUNDED
     * coordinates, not the parent's exact ones, since that's all the
     * cache key distinguishes anyway.
     */
    private WeatherCache fetchFromOpenMeteo(
            BigDecimal lat, BigDecimal lon, String locationKey, LocalDate today) {

        Map<?, ?> body = restClient.get()
                .uri(uri -> uri.path("/v1/forecast")
                        .queryParam("latitude", lat.toPlainString())
                        .queryParam("longitude", lon.toPlainString())
                        .queryParam("daily", "weather_code,temperature_2m_max,precipitation_probability_max")
                        .queryParam("timezone", "auto")
                        .queryParam("forecast_days", 1)
                        .build())
                .retrieve()
                .body(Map.class);

        if (body == null || !(body.get("daily") instanceof Map<?, ?> daily)) {
            throw new IllegalStateException("Open-Meteo response had no daily block");
        }

        Number code = firstNumber(daily, "weather_code");
        Number tempMax = firstNumber(daily, "temperature_2m_max");
        Number rainChance = firstNumber(daily, "precipitation_probability_max");

        int weatherCode = code == null ? 0 : code.intValue();
        boolean wetCode = isWetCode(weatherCode);
        boolean likelyRain = rainChance != null && rainChance.intValue() >= RAIN_CHANCE_THRESHOLD;

        String condition;
        if (wetCode) {
            condition = describe(weatherCode);
        } else if (likelyRain) {
            condition = "High chance of rain";
        } else {
            condition = describe(weatherCode);
        }

        return new WeatherCache(
                locationKey,
                today,
                !wetCode && !likelyRain,
                condition,
                tempMax == null ? null : BigDecimal.valueOf(tempMax.doubleValue()).setScale(1, RoundingMode.HALF_UP),
                rainChance == null ? null : (short) rainChance.intValue());
    }

    /** Open-Meteo returns each daily value as a one-item array (one per forecast day). */
    private Number firstNumber(Map<?, ?> daily, String key) {
        if (daily.get(key) instanceof List<?> values && !values.isEmpty() && values.get(0) instanceof Number n) {
            return n;
        }
        return null;
    }

    /**
     * WMO weather codes that mean something is falling from the sky:
     * drizzle (51-57), rain and freezing rain (61-67), snow (71-77),
     * rain and snow showers (80-86), and thunderstorms (95-99).
     */
    private boolean isWetCode(int code) {
        return (code >= 51 && code <= 67)
                || (code >= 71 && code <= 77)
                || (code >= 80 && code <= 86)
                || code >= 95;
    }

    private String describe(int code) {
        if (code == 0) return "Clear skies";
        if (code <= 2) return "Partly cloudy";
        if (code == 3) return "Cloudy";
        if (code == 45 || code == 48) return "Fog";
        if (code >= 51 && code <= 57) return "Drizzle";
        if (code == 66 || code == 67) return "Freezing rain";
        if (code >= 61 && code <= 65) return "Rain";
        if (code >= 71 && code <= 77) return "Snow";
        if (code >= 80 && code <= 82) return "Rain showers";
        if (code == 85 || code == 86) return "Snow showers";
        if (code >= 95) return "Thunderstorms";
        return "Mixed weather";
    }
}
