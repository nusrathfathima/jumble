package com.jumble.backend.controller;

import com.jumble.backend.model.Child;
import com.jumble.backend.model.ChildTagWeight;
import com.jumble.backend.model.Parent;
import com.jumble.backend.repository.*;
import com.jumble.backend.service.WeatherService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * The centrepiece endpoint — schema doc section 6's query, wired up to a
 * real child and a real household. Everything else built so far (child
 * profiles and their tag weights, the material catalog, household
 * inventory, the activity library) exists to feed this one endpoint.
 */
@RestController
@RequestMapping("/api/children/{childId}/suggestions")
public class SuggestionController {

    private static final Set<String> VALID_LOCATIONS = Set.of("INDOOR", "OUTDOOR", "EITHER");

    private final ChildRepository childRepository;
    private final ActivityRepository activityRepository;
    private final ActivityTagRepository activityTagRepository;
    private final ChildTagWeightRepository childTagWeightRepository;
    private final ParentRepository parentRepository;
    private final WeatherService weatherService;

    public SuggestionController(
            ChildRepository childRepository,
            ActivityRepository activityRepository,
            ActivityTagRepository activityTagRepository,
            ChildTagWeightRepository childTagWeightRepository,
            ParentRepository parentRepository,
            WeatherService weatherService) {
        this.childRepository = childRepository;
        this.activityRepository = activityRepository;
        this.activityTagRepository = activityTagRepository;
        this.childTagWeightRepository = childTagWeightRepository;
        this.parentRepository = parentRepository;
        this.weatherService = weatherService;
    }

    public record SuggestionView(
            Long activityId, String title, short durationMinutes, double score, String explanation) {
    }

    /**
     * "Show what's missing" — populated only when suggestions comes back
     * empty. Each entry is an activity that would otherwise have
     * qualified (right age, fits the time/mess/location given) except
     * for one or more required materials not currently in the household
     * inventory, closest matches (fewest missing items) first.
     */
    public record NearMissView(
            Long activityId, String title, short durationMinutes, List<String> missingMaterials) {
    }

    /**
     * weatherWarning is only ever set in one situation: the forecast is
     * wet AND the parent explicitly picked Outdoor. Their choice is
     * respected (maybe the plan is puddle jumping in rain boots), but they
     * get a heads-up. Otherwise it is null.
     */
    public record SuggestionsResponse(
            List<SuggestionView> suggestions, List<NearMissView> nearMisses, String weatherWarning) {
    }

    public record ErrorResponse(String message) {
    }

    private Long currentParentId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    @GetMapping
    public ResponseEntity<?> getSuggestions(
            @PathVariable Long childId,
            @RequestParam(defaultValue = "30") int availableMinutes,
            @RequestParam(defaultValue = "3") int maxMessLevel,
            @RequestParam(defaultValue = "EITHER") String locationType,
            // Default matches the schema doc's own chosen default (section 0)
            @RequestParam(defaultValue = "14") int repeatWindowDays) {

        Child child = childRepository.findById(childId).orElse(null);
        // Same "404 either way" ownership pattern as ChildController: a
        // child that exists but belongs to someone else looks identical
        // to one that doesn't exist at all.
        if (child == null || !child.getParent().getId().equals(currentParentId())) {
            return ResponseEntity.notFound().build();
        }

        if (!VALID_LOCATIONS.contains(locationType)) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse("locationType must be one of INDOOR, OUTDOOR, EITHER"));
        }
        if (maxMessLevel < 1 || maxMessLevel > 3) {
            return ResponseEntity.badRequest().body(new ErrorResponse("maxMessLevel must be between 1 and 3"));
        }
        if (availableMinutes <= 0) {
            return ResponseEntity.badRequest().body(new ErrorResponse("availableMinutes must be positive"));
        }

        // Weather-aware filtering (spec section 3, item 9). Only kicks in
        // when the parent has saved a location and today looks wet:
        //   - "No preference" (EITHER) quietly becomes INDOOR, which the
        //     query already treats as "INDOOR or EITHER activities", so
        //     only the outdoor-only ones drop out. No SQL change needed.
        //   - An explicit OUTDOOR is respected, with a warning attached.
        //   - An explicit INDOOR is unaffected either way.
        // If the weather can't be fetched, nothing changes at all.
        Parent parent = parentRepository.findById(currentParentId()).orElse(null);
        Optional<WeatherService.TodayWeather> weather = parent == null
                ? Optional.empty()
                : weatherService.getToday(parent.getLatitude(), parent.getLongitude());
        boolean wetDay = weather.map(w -> !w.outdoorFriendly()).orElse(false);

        String effectiveLocation = locationType;
        String weatherWarning = null;
        if (wetDay && "EITHER".equals(locationType)) {
            effectiveLocation = "INDOOR";
        } else if (wetDay && "OUTDOOR".equals(locationType)) {
            weatherWarning = "Heads up: " + weather.get().condition().toLowerCase()
                    + " in today's forecast. Showing outdoor ideas anyway, since you picked Outdoor.";
        }

        // The child's current weight for every tag, keyed by tag id — used
        // below to name which of the child's interests each suggestion
        // actually matches, per the schema doc's "explain this suggestion"
        // feature (section 7).
        Map<Short, ChildTagWeight> weightsByTagId = childTagWeightRepository.findByChildId(childId).stream()
                .collect(Collectors.toMap(w -> w.getTag().getId(), w -> w));

        List<ActivityRepository.SuggestionProjection> rows = activityRepository.findSuggestions(
                childId, availableMinutes, maxMessLevel, effectiveLocation, repeatWindowDays);

        List<SuggestionView> views = rows.stream()
                .map(row -> new SuggestionView(
                        row.getId(),
                        row.getTitle(),
                        row.getDurationMinutes(),
                        roundScore(row.getScore()),
                        buildExplanation(row, weightsByTagId, availableMinutes, maxMessLevel)))
                .toList();

        // Only spend the extra query when there's actually nothing to
        // show — this is purely an empty-state helper, not something
        // that runs on every successful search.
        List<NearMissView> nearMisses = views.isEmpty()
                ? activityRepository
                        .findNearMisses(childId, availableMinutes, maxMessLevel, effectiveLocation, repeatWindowDays)
                        .stream()
                        .map(row -> new NearMissView(
                                row.getId(),
                                row.getTitle(),
                                row.getDurationMinutes(),
                                Arrays.asList(row.getMissingMaterials().split(", "))))
                        .toList()
                : List.of();

        return ResponseEntity.ok(new SuggestionsResponse(views, nearMisses, weatherWarning));
    }

    /**
     * SUM(real) in Postgres, once it comes through the JDBC driver as a
     * Java double, prints ugly artifacts like 3.5999999046325684 instead
     * of 3.6 — harmless for the ranking itself (ORDER BY isn't affected
     * by trailing float noise), but not something to show a parent in
     * the UI. Rounding to 2 decimal places here, right before the value
     * leaves the API, keeps the internal computation exact while making
     * the number that's actually displayed clean.
     */
    private double roundScore(double score) {
        return Math.round(score * 100.0) / 100.0;
    }

    /**
     * Assembles the explanation entirely from facts already in hand — no
     * extra queries beyond the one tag lookup — so it's a faithful
     * description of the computation the score came from, not a
     * plausible-sounding story invented after the fact. Weather is not
     * mentioned per card; it is shown once, in the weather line above the
     * suggestion form, instead of being repeated on every card.
     */
    private String buildExplanation(
            ActivityRepository.SuggestionProjection row,
            Map<Short, ChildTagWeight> weightsByTagId,
            int availableMinutes,
            int maxMessLevel) {

        List<String> matchedTagNames = activityTagRepository.findByActivityId(row.getId()).stream()
                .map(at -> weightsByTagId.get(at.getTag().getId()))
                .filter(w -> w != null && w.getWeight() > 1.0f)
                .sorted(Comparator.comparingDouble(ChildTagWeight::getWeight).reversed())
                .limit(2)
                .map(w -> w.getTag().getDisplayName())
                .toList();

        StringBuilder explanation = new StringBuilder();
        if (!matchedTagNames.isEmpty()) {
            explanation.append("Matches an interest in ").append(String.join(" and ", matchedTagNames)).append(". ");
        }
        explanation.append("Fits your ").append(availableMinutes).append("-minute window");
        if (maxMessLevel < 3) {
            explanation.append(" and mess-level limit");
        }
        explanation.append(". You have everything needed for it.");

        return explanation.toString();
    }
}
