package com.jumble.backend.repository;

import com.jumble.backend.model.ActivityTag;
import com.jumble.backend.model.ActivityTagId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;

import java.util.List;

public interface ActivityTagRepository extends JpaRepository<ActivityTag, ActivityTagId> {

    @Query("select at from ActivityTag at where at.activity.id = :activityId")
    List<ActivityTag> findByActivityId(Long activityId);

    /**
     * The tags of several activities in ONE query, with each tag loaded in
     * the same round trip (join fetch). Used by the suggestions endpoint
     * instead of one query per suggestion plus one per tag.
     */
    @Query("select at from ActivityTag at join fetch at.tag where at.activity.id in :activityIds")
    List<ActivityTag> findWithTagsByActivityIdIn(@Param("activityIds") Collection<Long> activityIds);
}
