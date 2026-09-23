package com.jumble.backend.repository;

import com.jumble.backend.model.ActivityStep;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ActivityStepRepository extends JpaRepository<ActivityStep, Long> {
    List<ActivityStep> findByActivityIdOrderByStepNumberAsc(Long activityId);
}
