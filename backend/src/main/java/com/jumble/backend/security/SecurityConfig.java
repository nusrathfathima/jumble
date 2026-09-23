package com.jumble.backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Wires JWT auth into Spring Security. Three decisions worth calling out:
 *
 * 1. SessionCreationPolicy.STATELESS — Spring Security is told never to
 *    create or read an HttpSession. Combined with JwtAuthFilter, this is
 *    what makes the API genuinely stateless: identity lives entirely in the
 *    token the client sends, not in anything the server remembers between
 *    requests. This matters concretely for this project because the
 *    frontend (Vercel) and backend (Render) are different origins — a
 *    stateless, header-based token sidesteps the cross-origin cookie/
 *    SameSite complications a session cookie would run into.
 *
 * 2. CSRF is disabled. CSRF protection exists to stop a browser from being
 *    tricked into replaying a cookie it's already holding. There's no
 *    cookie here for that trick to exploit — the browser never
 *    automatically attaches a Bearer token the way it does a cookie — so
 *    the protection has nothing to protect.
 *
 * 3. CORS is configured explicitly (allowedOrigins) rather than left open,
 *    because a stateless Bearer-token API otherwise has no origin check at
 *    all guarding which frontends can call it.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Signup/login must be reachable with no token — that's
                        // the whole point of them. The health check stays public
                        // too, since it's what the frontend polls to show
                        // "backend status: ok" before anyone has logged in.
                        .requestMatchers("/api/auth/**", "/api/health").permitAll()
                        // TEMPORARY: left open while TestDataController still
                        // exists for manual verification against Neon. Remove
                        // this line in the same change that deletes
                        // TestDataController — every other endpoint in the
                        // real API surface requires a valid token.
                        .requestMatchers("/api/test/**").permitAll()
                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Local Vite dev server plus the deployed Vercel frontend. Update
        // the second entry once the real Vercel URL is known.
        configuration.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "https://jumble.vercel.app"
        ));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
