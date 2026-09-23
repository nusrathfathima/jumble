package com.jumble.backend.controller;

import com.jumble.backend.model.Activity;
import com.jumble.backend.repository.ActivityMaterialRepository;
import com.jumble.backend.repository.ActivityRepository;
import com.jumble.backend.repository.ActivityStepRepository;
import com.jumble.backend.repository.ActivityTagRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Browsing the activity library — the card list and each activity's full how-to detail. */
@RestController
@RequestMapping("/api/activities")
public class ActivityController {

    private final ActivityRepository activityRepository;
    private final ActivityTagRepository activityTagRepository;
    private final ActivityMaterialRepository activityMaterialRepository;
    private final ActivityStepRepository activityStepRepository;

    public ActivityController(
            ActivityRepository activityRepository,
            ActivityTagRepository activityTagRepository,
            ActivityMaterialRepository activityMaterialRepository,
            ActivityStepRepository activityStepRepository) {
        this.activityRepository = activityRepository;
        this.activityTagRepository = activityTagRepository;
        this.activityMaterialRepository = activityMaterialRepository;
        this.activityStepRepository = activityStepRepository;
    }

    public record ActivitySummaryView(
            Long id, String slug, String title, String summary,
            short minAgeYears, short maxAgeYears, short durationMinutes,
            short messLevel, String locationType, boolean needsAdult) {
    }

    public record MaterialRequirementView(String slug, String displayName, boolean isOptional) {
    }

    public record ActivityStepView(short stepNumber, String shortText, String imageUrl, String imageAlt) {
    }

    public record ActivityDetailView(
            Long id, String slug, String title, String summary,
            short minAgeYears, short maxAgeYears, short durationMinutes,
            short messLevel, String locationType, boolean needsAdult,
            List<String> tagSlugs, List<MaterialRequirementView> materials, List<ActivityStepView> steps) {
    }

    @GetMapping
    public List<ActivitySummaryView> listActivities() {
        return activityRepository.findByIsActiveTrue().stream()
                .map(a -> new ActivitySummaryView(
                        a.getId(), a.getSlug(), a.getTitle(), a.getSummary(),
                        a.getMinAgeYears(), a.getMaxAgeYears(), a.getDurationMinutes(),
                        a.getMessLevel(), a.getLocationType(), a.isNeedsAdult()))
                .toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ActivityDetailView> getActivity(@PathVariable Long id) {
        Activity activity = activityRepository.findById(id).orElse(null);
        if (activity == null || !activity.isActive()) {
            return ResponseEntity.notFound().build();
        }

        List<String> tagSlugs = activityTagRepository.findByActivityId(id).stream()
                .map(at -> at.getTag().getSlug())
                .toList();

        List<MaterialRequirementView> materials = activityMaterialRepository.findByActivityId(id).stream()
                .map(am -> new MaterialRequirementView(
                        am.getMaterial().getSlug(), am.getMaterial().getDisplayName(), am.isOptional()))
                .toList();

        List<ActivityStepView> steps = activityStepRepository.findByActivityIdOrderByStepNumberAsc(id).stream()
                .map(s -> new ActivityStepView(s.getStepNumber(), s.getShortText(), s.getImageUrl(), s.getImageAlt()))
                .toList();

        return ResponseEntity.ok(new ActivityDetailView(
                activity.getId(), activity.getSlug(), activity.getTitle(), activity.getSummary(),
                activity.getMinAgeYears(), activity.getMaxAgeYears(), activity.getDurationMinutes(),
                activity.getMessLevel(), activity.getLocationType(), activity.isNeedsAdult(),
                tagSlugs, materials, steps));
    }
}
