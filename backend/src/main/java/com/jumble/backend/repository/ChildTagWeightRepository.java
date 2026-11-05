package com.jumble.backend.repository;

import com.jumble.backend.model.ChildTagWeight;
import com.jumble.backend.model.ChildTagWeightId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ChildTagWeightRepository extends JpaRepository<ChildTagWeight, ChildTagWeightId> {

    // Used to build each suggestion's "why this was picked" explanation —
    // the highest-weighted tags a suggested activity shares with the
    // child are what get named as the reason.
    // join fetch: loads each weight's tag in the same query, so reading
    // tag names afterwards costs no extra database round trips.
    @Query("select w from ChildTagWeight w join fetch w.tag where w.child.id = :childId")
    List<ChildTagWeight> findByChildId(Long childId);
}
