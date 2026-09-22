package com.jumble.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Allows the React frontend (running on a different port during local
 * development, and a different domain entirely once deployed) to call this
 * API from the browser.
 *
 * Without this, the browser's own security model — the "same-origin
 * policy" — blocks JavaScript on one origin (http://localhost:5173, where
 * Vite serves the frontend) from reading responses from another origin
 * (http://localhost:8080, where Spring Boot serves the API), even though
 * both are running on your own machine. This is CORS: Cross-Origin
 * Resource Sharing. The browser still lets the request go out; it just
 * refuses to hand the response back to your JavaScript unless the server
 * explicitly says "this origin is allowed."
 *
 * allowedOriginPatterns lists exactly which origins are trusted. Once the
 * frontend is deployed to Vercel, its real URL is added alongside the
 * local development ones — never use "*" (allow everyone) on an API that
 * has user accounts and passwords behind it.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOriginPatterns(
                        "http://localhost:5173",
                        "http://localhost:3000"
                        // Add the deployed Vercel URL here once the frontend is live,
                        // e.g. "https://jumble.vercel.app"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowCredentials(true);
    }
}
