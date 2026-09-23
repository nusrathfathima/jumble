package com.jumble.backend.controller;

import com.jumble.backend.model.Tag;
import com.jumble.backend.repository.TagRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Lets the frontend fetch the current tag taxonomy instead of hard-coding
 * the 7 MVP interests into the signup/add-child form — so adding an 8th
 * tag later (see V2__seed_tags.sql's comment) only ever requires a
 * migration, never a frontend deploy too.
 */
@RestController
@RequestMapping("/api/tags")
public class TagController {

    private final TagRepository tagRepository;

    public TagController(TagRepository tagRepository) {
        this.tagRepository = tagRepository;
    }

    public record TagView(Short id, String slug, String displayName) {
    }

    @GetMapping
    public List<TagView> listTags() {
        return tagRepository.findAll().stream()
                .map(t -> new TagView(t.getId(), t.getSlug(), t.getDisplayName()))
                .toList();
    }
}
