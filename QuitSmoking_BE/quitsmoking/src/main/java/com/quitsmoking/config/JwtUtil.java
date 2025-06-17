package com.quitsmoking.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys; // This import is correct for newer versions
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {

    // Secret key for JWT signing, loaded from application.properties
    @Value("${jwt.secret}")
    private String SECRET_KEY;

    // Token expiration time: 10 hours in milliseconds
    public static final long JWT_TOKEN_VALIDITY = 10 * 60 * 60 * 1000; // 10 hours in milliseconds

    /**
     * Extracts the username (subject) from the given JWT token.
     *
     * @param token The JWT token string.
     * @return The username.
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extracts the expiration date from the given JWT token.
     *
     * @param token The JWT token string.
     * @return The expiration Date.
     */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Extracts a specific claim from the JWT token using a claims resolver function.
     *
     * @param token The JWT token string.
     * @param claimsResolver A function to resolve the specific claim from Claims.
     * @param <T> The type of the claim.
     * @return The extracted claim.
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Extracts all claims (payload) from the given JWT token.
     *
     * @param token The JWT token string.
     * @return The Claims object containing all payload data.
     */
    private Claims extractAllClaims(String token) {
        // Jwts.parserBuilder() is available in JJWT 0.10.0 and later
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey()) // Set the signing key
                .build()
                .parseClaimsJws(token) // Parse the JWT
                .getBody(); // Get the claims body
    }

    /**
     * Checks if the JWT token is expired.
     *
     * @param token The JWT token string.
     * @return True if the token is expired, false otherwise.
     */
    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * Generates a JWT token for the given UserDetails.
     *
     * @param userDetails The UserDetails object representing the user.
     * @return The generated JWT token string.
     */
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        // You can add additional claims here if needed, e.g., user roles
        return createToken(claims, userDetails.getUsername());
    }

    /**
     * Builds and signs the JWT token.
     *
     * @param claims Additional claims to be included in the token.
     * @param subject The subject of the token (typically the username).
     * @return The compact JWT token string.
     */
    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims) // Set custom claims
                .setSubject(subject) // Set the subject (username)
                .setIssuedAt(new Date(System.currentTimeMillis())) // Set issued at time
                .setExpiration(new Date(System.currentTimeMillis() + JWT_TOKEN_VALIDITY)) // Set expiration time
                .signWith(getSigningKey(), SignatureAlgorithm.HS256) // Sign the token with and secret key
                .compact(); // Compact the token to a URL-safe string
    }

    /**
     * Validates the given JWT token against the UserDetails.
     *
     * @param token The JWT token string.
     * @param userDetails The UserDetails object for validation.
     * @return True if the token is valid (username matches and not expired), false otherwise.
     */
    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    /**
     * Decodes the base64 secret key and creates an HMAC-SHA key.
     *
     * @return The Key object used for signing and verifying tokens.
     */
    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
