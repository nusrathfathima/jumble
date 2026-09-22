package com.jumble.backend.controller;

import com.jumble.backend.model.Child;
import com.jumble.backend.model.Parent;
import com.jumble.backend.repository.ChildRepository;
import com.jumble.backend.repository.ParentRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * TEMPORARY — exists only to prove, tonight, that the Parent and Child
 * entities actually read and write real rows in Neon through the
 * repository layer. This is not how the finished app creates accounts or
 * child profiles: there's no password hashing, no validation, and no
 * authentication check gating any of this, all of which are needed before
 * this could be real.
 *
 * This whole file gets deleted once proper signup and child-profile
 * endpoints exist — it's scaffolding for tonight's verification, not
 * product code.
 */
@RestController
@RequestMapping("/api/test")
public class TestDataController {

    private final ParentRepository parentRepository;
    private final ChildRepository childRepository;

    public TestDataController(ParentRepository parentRepository, ChildRepository childRepository) {
        this.parentRepository = parentRepository;
        this.childRepository = childRepository;
    }

    public record CreateParentRequest(String email, String displayName) {}
    public record CreateChildRequest(Long parentId, String name, int birthYear, int birthMonth) {}
    public record ParentView(Long id, String email, String displayName) {}
    public record ChildView(Long id, Long parentId, String name, int age) {}

    @PostMapping("/parents")
    public ParentView createParent(@RequestBody CreateParentRequest request) {
        // "not-a-real-password-hash" stands in for what will later be a
        // properly BCrypt-hashed password, once real signup exists.
        Parent parent = new Parent(request.email(), "not-a-real-password-hash", request.displayName());
        parentRepository.save(parent);
        return new ParentView(parent.getId(), parent.getEmail(), parent.getDisplayName());
    }

    @GetMapping("/parents")
    public List<ParentView> listParents() {
        return parentRepository.findAll().stream()
                .map(p -> new ParentView(p.getId(), p.getEmail(), p.getDisplayName()))
                .toList();
    }

    @PostMapping("/children")
    public ChildView createChild(@RequestBody CreateChildRequest request) {
        Parent parent = parentRepository.findById(request.parentId())
                .orElseThrow(() -> new RuntimeException("No parent with id " + request.parentId()));
        // Day is always the 1st — see the comment on Child.birthDate for why.
        LocalDate birthDate = LocalDate.of(request.birthYear(), request.birthMonth(), 1);
        Child child = new Child(parent, request.name(), birthDate);
        childRepository.save(child);
        return new ChildView(child.getId(), parent.getId(), child.getName(), child.getAge());
    }

    @GetMapping("/parents/{parentId}/children")
    public List<ChildView> listChildren(@PathVariable Long parentId) {
        return childRepository.findByParentId(parentId).stream()
                .map(c -> new ChildView(c.getId(), parentId, c.getName(), c.getAge()))
                .toList();
    }
}
