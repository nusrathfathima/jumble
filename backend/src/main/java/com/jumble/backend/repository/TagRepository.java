package com.jumble.backend.repository;

import com.jumble.backend.model.Tag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TagRepository extends JpaRepository<Tag, Short> {
    List<Tag> findBySlugIn(List<String> slugs);
}
