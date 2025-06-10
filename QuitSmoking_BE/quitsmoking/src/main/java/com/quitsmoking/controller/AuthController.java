package com.quitsmoking.controller;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.quitsmoking.model.Role;
import com.quitsmoking.model.User;
import com.quitsmoking.repository.RoleRepository;
import com.quitsmoking.repository.UserRepository;
import com.quitsmoking.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger; // THÊM DÒNG NÀY
import org.slf4j.LoggerFactory; // THÊM DÒNG NÀY

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class); // THÊM DÒNG NÀY

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthController(UserRepository userRepository, RoleRepository roleRepository, JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @PostMapping("/google-login")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> payload) {
        String idTokenString = payload.get("idToken");

        logger.info("Received Google login request."); // THÊM DÒNG NÀY

        if (idTokenString == null) {
            logger.warn("ID Token is missing from the payload."); // THÊM DÒNG NÀY
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "ID Token is missing."));
        }

        logger.info("Verifying Google ID Token. Client ID used for verification: {}", googleClientId); // THÊM DÒNG NÀY
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                .setAudience(Collections.singletonList(googleClientId))
                .build();

        GoogleIdToken idToken;
        try {
            idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                logger.warn("Google ID Token verification failed: idToken is null."); // THÊM DÒNG NÀY
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "message", "Invalid ID Token."));
            }
            logger.info("Google ID Token verification successful. Email: {}", idToken.getPayload().getEmail()); // THÊM DÒNG NÀY
            logger.debug("Google ID Token payload: {}", idToken.getPayload().toString()); // THÊM DÒNG NÀY để debug payload

        } catch (GeneralSecurityException | IOException e) {
            logger.error("Error during Google ID Token verification: {}", e.getMessage(), e); // THÊM DÒNG NÀY (quan trọng là có `e` cuối cùng để in stack trace)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "message", "Invalid ID Token."));
        }

        // Bước 2: Lấy thông tin từ Payload của ID Token
        GoogleIdToken.Payload googlePayload = idToken.getPayload();
        String email = googlePayload.getEmail();
        String name = (String) googlePayload.get("name");
        String picture = (String) googlePayload.get("picture");
        String googleId = googlePayload.getSubject();

        logger.info("Processing user with email: {} and Google ID: {}", email, googleId); // THÊM DÒNG NÀY

        // Bước 3: Tìm kiếm hoặc tạo người dùng trong cơ sở dữ liệu của bạn
        Optional<User> existingUser = userRepository.findByProviderAndProviderId("google", googleId);
        User user;

        if (existingUser.isPresent()) {
            user = existingUser.get();
            user.setEmail(email);
            user.setName(name);
            user.setPicture(picture);
            logger.info("Existing user found: {}", user.getEmail()); // THÊM DÒNG NÀY
        } else {
            user = new User();
            user.setEmail(email);
            user.setName(name);
            user.setPicture(picture);
            user.setProvider("google");
            user.setProviderId(googleId);

            Role defaultRole = roleRepository.findByName("Member")
                    .orElseThrow(() -> {
                        logger.error("Default role 'Member' not found in database!"); // THÊM DÒNG NÀY
                        return new RuntimeException("Default role 'Member' not found!");
                    });
            user.setRole(defaultRole);
            logger.info("New user created: {}", user.getEmail()); // THÊM DÒNG NÀY
        }
        userRepository.save(user);

        // ... các bước còn lại như cũ
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                user.getEmail(),
                null,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().getName().toUpperCase()))
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = jwtTokenProvider.generateToken(authentication, user.getId(), user.getEmail(), user.getRole().getName());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Đăng nhập thành công!");
        response.put("token", jwt);
        response.put("email", user.getEmail());
        response.put("userId", user.getId());
        response.put("role", user.getRole().getName());
        logger.info("User {} logged in successfully, JWT generated.", user.getEmail()); // THÊM DÒNG NÀY
        return ResponseEntity.ok(response);
    }
}