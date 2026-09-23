package com.jumble.backend.controller;

import com.jumble.backend.model.Material;
import com.jumble.backend.repository.MaterialRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** The full material catalog — what the inventory screen's checklist is built from. */
@RestController
@RequestMapping("/api/materials")
public class MaterialController {

    private final MaterialRepository materialRepository;

    public MaterialController(MaterialRepository materialRepository) {
        this.materialRepository = materialRepository;
    }

    public record MaterialView(Short id, String slug, String displayName, String category, boolean isCommon) {
    }

    @GetMapping
    public List<MaterialView> listMaterials() {
        return materialRepository.findAll().stream()
                .map(m -> new MaterialView(m.getId(), m.getSlug(), m.getDisplayName(), m.getCategory(), m.isCommon()))
                .toList();
    }
}
