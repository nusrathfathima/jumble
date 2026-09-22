package com.jumble.backend.repository;

import com.jumble.backend.model.Parent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * The layer that actually talks to the database for Parent rows.
 *
 * Extending JpaRepository is enough on its own to get save(), findById(),
 * findAll(), deleteById(), and more, all implemented for you — Spring
 * generates the actual implementation of this interface at startup, so
 * there is no method body to write for those.
 *
 * findByEmail below is a second kind of feature this interface gives you:
 * write a method signature following Spring Data's naming convention
 * (findBy + a field name), and Spring writes the query for you from the
 * name alone — no SQL, no annotation, in this simple case.
 */
public interface ParentRepository extends JpaRepository<Parent, Long> {
    Optional<Parent> findByEmail(String email);
}
