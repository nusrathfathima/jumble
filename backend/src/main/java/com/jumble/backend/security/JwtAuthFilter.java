package com.jumble.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Runs once per incoming request, before it reaches any controller. Its one
 * job: look for "Authorization: Bearer <token>", and if there's a valid
 * token, tell Spring Security who's making this request.
 *
 * This is what makes the API stateless — nothing here reads or writes a
 * session. Every request carries its own proof of identity in the header,
 * checked fresh each time against JwtService.
 *
 * A missing or invalid token isn't rejected here. This filter just leaves
 * the request unauthenticated and lets it continue down the chain;
 * SecurityConfig is what actually decides whether an unauthenticated
 * request is allowed to reach a given endpoint (e.g. /api/auth/** is fine
 * with no token, /api/children is not).
 */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            try {
                if (jwtService.isTokenValid(token)) {
                    Long parentId = jwtService.extractParentId(token);

                    // The "principal" here is just the parent's id (a Long),
                    // not a full user-details object — every controller that
                    // needs to know who's calling can pull it straight off
                    // the SecurityContext without a database lookup, which
                    // is the whole point of encoding it in the token.
                    var authentication = new UsernamePasswordAuthenticationToken(
                            parentId, null, List.of());
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } catch (Exception ex) {
                // Any parsing/signature/expiry failure lands here. We
                // deliberately swallow it rather than throwing: leaving the
                // SecurityContext empty means the request proceeds as
                // unauthenticated, and SecurityConfig's access rules take
                // it from there (typically a 401/403, not a 500).
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }
}
