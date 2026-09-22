package com.jumble.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * A minimal endpoint whose only job is to prove the backend is alive.
 *
 * This is deliberately the very first controller in the project. Before
 * writing anything that touches the database or the recommendation logic,
 * it's worth being able to answer one simple question: is the server
 * actually running and reachable? The React frontend's starter page calls
 * this endpoint for exactly that reason — its "Backend status" line is
 * reading the response from here.
 *
 * @RestController tells Spring that every method in this class handles an
 * HTTP request and returns data directly (as JSON, by default) rather than
 * the name of a page template to render.
 */
@RestController
public class HealthController {

    @GetMapping("/api/health")
    public Map<String, String> health() {
        return Map.of(
                "status", "ok",
                "service", "jumble-backend"
        );
    }
}
