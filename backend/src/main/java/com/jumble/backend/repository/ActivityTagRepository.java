package com.jumble.backend.repository;

import com.jumble.backend.model.ActivityTag;
import com.jumble.backend.model.ActivityTagId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ActivityTagRepository extends JpaRepository<ActivityTag, ActivityTagId> {

    @Query("select at from ActivityTag at where at.activity.id = :activityId")
    List<ActivityTag> findByActivityId(Long activityId);
}
