package com.jumble.backend.config;

import org.springframework.beans.factory.annotation.Value;
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

    // Same CORS_ALLOWED_ORIGINS setting SecurityConfig reads, so the two
    // can never disagree about who is allowed in.
    private final String[] allowedOrigins;

    public WebConfig(@Value("${cors.allowed-origins}") String[] allowedOrigins) {
        this.allowedOrigins = allowedOrigins;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigins)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowCredentials(true);
    }
}
