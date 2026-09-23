package com.jumble.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.function.Function;

/**
 * Everything to do with JWTs lives in this one class: issuing a token when
 * a parent signs up or logs in, and reading one back on every later request
 * to find out who's making it.
 *
 * A JWT is not a session id that points at server-side state — it *is* the
 * state, signed so it can't be tampered with. That's what "stateless auth"
 * means in practice: this class never talks to a database or a session
 * store. Given a valid token, it can tell you the parent's id and know the
 * token hasn't been forged or expired, purely by checking the signature and
 * the embedded expiry, both done in memory.
 */
@Service
public class JwtService {

    // Signing secret and token lifetime both come from application
    // properties (themselves backed by environment variables in
    // production) rather than being hard-coded here — the same reasoning
    // as the database credentials: a secret checked into GitHub is a
    // secret that no longer protects anything.
    private final SecretKey signingKey;
    private final long expirationMs;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration-ms}") long expirationMs) {
        this.signingKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
        this.expirationMs = expirationMs;
    }

    /**
     * Issues a new token for a parent who just signed up or logged in
     * successfully. The parent's id becomes the token's "subject" — the one
     * piece of identity everything else is built on.
     */
    public String generateToken(Long parentId) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .subject(String.valueOf(parentId))
                .issuedAt(now)
                .expiration(expiry)
                .signWith(signingKey)
                .compact();
    }

    /** Pulls the parent id back out of a token, once it's confirmed valid. */
    public Long extractParentId(String token) {
        return Long.valueOf(extractClaim(token, Claims::getSubject));
    }

    /**
     * True only if the token's signature checks out against our secret and
     * its expiry hasn't passed. Anything else — tampered, expired, garbage
     * input — throws inside extractAllClaims, which callers (JwtAuthFilter)
     * treat the same way: as "not authenticated," not a server error.
     */
    public boolean isTokenValid(String token) {
        Date expiration = extractClaim(token, Claims::getExpiration);
        return expiration.after(new Date());
    }

    private <T> T extractClaim(String token, Function<Claims, T> resolver) {
        Claims claims = Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return resolver.apply(claims);
    }
}
