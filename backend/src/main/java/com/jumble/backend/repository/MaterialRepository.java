package com.jumble.backend.repository;

import com.jumble.backend.model.Material;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MaterialRepository extends JpaRepository<Material, Short> {
}
