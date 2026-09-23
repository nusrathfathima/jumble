package com.jumble.backend.controller;

import com.jumble.backend.model.Parent;
import com.jumble.backend.repository.ParentRepository;
import com.jumble.backend.security.JwtService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

/**
 * The real signup/login endpoints — the ones TestDataController's
 * /api/test/parents was always a stand-in for. Two differences that
 * actually matter: passwords are BCrypt-hashed here rather than stored as
 * the literal string "not-a-real-password-hash", and a successful call
 * returns a JWT the frontend then attaches to every later request.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final ParentRepository parentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(
            ParentRepository parentRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.parentRepository = parentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public record SignupRequest(
            @NotBlank @Email String email,
            @NotBlank @Size(min = 8, message = "Password must be at least 8 characters") String password,
            String displayName) {
    }

    public record LoginRequest(
            @NotBlank @Email String email,
            @NotBlank String password) {
    }

    public record AuthResponse(String token, Long parentId, String email, String displayName) {
    }

    public record ErrorResponse(String message) {
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest request) {
        if (parentRepository.findByEmail(request.email()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ErrorResponse("An account with this email already exists"));
        }

        String hashedPassword = passwordEncoder.encode(request.password());
        Parent parent = new Parent(request.email(), hashedPassword, request.displayName());
        parentRepository.save(parent);

        String token = jwtService.generateToken(parent.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new AuthResponse(token, parent.getId(), parent.getEmail(), parent.getDisplayName()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        Parent parent = parentRepository.findByEmail(request.email()).orElse(null);

        // Deliberately the same error message whether the email doesn't
        // exist or the password is wrong. Distinguishing the two would tell
        // an attacker which emails have accounts on this system.
        if (parent == null || !passwordEncoder.matches(request.password(), parent.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("Invalid email or password"));
        }

        String token = jwtService.generateToken(parent.getId());
        return ResponseEntity.ok(new AuthResponse(token, parent.getId(), parent.getEmail(), parent.getDisplayName()));
    }
}
