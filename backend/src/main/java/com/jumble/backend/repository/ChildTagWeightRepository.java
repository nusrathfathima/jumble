package com.jumble.backend.repository;

import com.jumble.backend.model.ChildTagWeight;
import com.jumble.backend.model.ChildTagWeightId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChildTagWeightRepository extends JpaRepository<ChildTagWeight, ChildTagWeightId> {
}
