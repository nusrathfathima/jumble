package com.jumble.backend.repository;

import com.jumble.backend.model.ActivityMaterial;
import com.jumble.backend.model.ActivityMaterialId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ActivityMaterialRepository extends JpaRepository<ActivityMaterial, ActivityMaterialId> {

    @Query("select am from ActivityMaterial am where am.activity.id = :activityId")
    List<ActivityMaterial> findByActivityId(Long activityId);
}
