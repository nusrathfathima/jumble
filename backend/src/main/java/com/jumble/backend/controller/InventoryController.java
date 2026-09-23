package com.jumble.backend.controller;

import com.jumble.backend.model.Material;
import com.jumble.backend.model.Parent;
import com.jumble.backend.model.ParentInventory;
import com.jumble.backend.repository.MaterialRepository;
import com.jumble.backend.repository.ParentInventoryRepository;
import com.jumble.backend.repository.ParentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

/**
 * The logged-in parent's household inventory — which materials they have
 * on hand, used by the (not-yet-built) suggestions query to filter out
 * activities requiring supplies they don't have.
 */
@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final ParentRepository parentRepository;
    private final MaterialRepository materialRepository;
    private final ParentInventoryRepository inventoryRepository;

    public InventoryController(
            ParentRepository parentRepository,
            MaterialRepository materialRepository,
            ParentInventoryRepository inventoryRepository) {
        this.parentRepository = parentRepository;
        this.materialRepository = materialRepository;
        this.inventoryRepository = inventoryRepository;
    }

    public record UpdateInventoryRequest(List<Short> materialIds) {
    }

    private Long currentParentId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    @GetMapping
    public List<Short> getInventory() {
        return inventoryRepository.findByParentId(currentParentId()).stream()
                .map(pi -> pi.getMaterial().getId())
                .toList();
    }

    /**
     * Replaces the parent's entire inventory with exactly the set of
     * material ids submitted, rather than exposing separate add/remove
     * endpoints. A checklist UI naturally produces "here is the full set
     * that should now be checked" on every save, so matching that shape
     * here means the frontend never has to diff against what it thinks
     * the server currently has — it just PUTs its current checkbox state,
     * every time.
     */
    @PutMapping
    @Transactional
    public ResponseEntity<List<Short>> updateInventory(@RequestBody UpdateInventoryRequest request) {
        Parent parent = parentRepository.findById(currentParentId())
                .orElseThrow(() -> new IllegalStateException("Authenticated parent not found"));

        inventoryRepository.deleteByParentId(parent.getId());

        List<Short> requestedIds = request.materialIds() == null ? List.of() : request.materialIds();
        Set<Short> validIds = materialRepository.findAll().stream()
                .map(Material::getId)
                .filter(requestedIds::contains)
                .collect(java.util.stream.Collectors.toSet());

        for (Material material : materialRepository.findAll()) {
            if (validIds.contains(material.getId())) {
                inventoryRepository.save(new ParentInventory(parent, material));
            }
        }

        return ResponseEntity.ok(List.copyOf(validIds));
    }
}
