package com.jumble.backend.repository;

import com.jumble.backend.model.ChildTag;
import com.jumble.backend.model.ChildTagId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ChildTagRepository extends JpaRepository<ChildTag, ChildTagId> {

    @Query("select ct from ChildTag ct where ct.child.id = :childId")
    List<ChildTag> findByChildId(Long childId);
}
