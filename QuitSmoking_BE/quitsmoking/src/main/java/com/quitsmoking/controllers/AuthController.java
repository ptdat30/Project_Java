package com.quitsmoking.controllers;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.quitsmoking.config.JwtUtil;
import com.quitsmoking.dto.request.AuthRequest;
import com.quitsmoking.dto.request.RegisterRequest;
import com.quitsmoking.dto.response.AuthResponse;
import com.quitsmoking.exceptions.EmailAlreadyExistsException; 
import com.quitsmoking.exceptions.UserAlreadyExistsException;
// import com.quitsmoking.model.AuthProvider;
// import com.quitsmoking.model.GoogleUser;
// import com.quitsmoking.model.LocalUser;
// import com.quitsmoking.model.Role;
import com.quitsmoking.model.User;
import com.quitsmoking.reponsitories.UserDAO;
import com.quitsmoking.services.AuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
// import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.validation.BindingResult; // Thêm import này
import org.springframework.validation.FieldError; // Thêm import này
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
// import java.util.Optional;
import java.util.stream.Collectors; // Thêm import này

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:4173", "http://localhost:3000", "http://localhost:5173"})
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final AuthService authService;
    private final JwtUtil jwtUtil;
    private final UserDAO userDAO;

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;

    @Autowired
    public AuthController(
            AuthenticationManager authenticationManager,
            AuthService authService,
            JwtUtil jwtUtil,
            UserDAO userDAO
    ) {
        this.authenticationManager = authenticationManager;
        this.authService = authService;
        this.jwtUtil = jwtUtil;
        this.userDAO = userDAO;
    }

    @PostMapping("/login")
    public ResponseEntity<?> createAuthenticationToken(@RequestBody AuthRequest authenticationRequest) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            authenticationRequest.getUsername(),
                            authenticationRequest.getPassword()
                    )
            );
        } catch (BadCredentialsException e) {
            logger.warn("Authentication failed for user {}: Incorrect username or password", authenticationRequest.getUsername());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Incorrect username or password"));
        }

        final UserDetails userDetails = authService.loadUserByUsername(authenticationRequest.getUsername());
        final String jwt = jwtUtil.generateToken(userDetails);

        User user = userDAO.findByEmailOrUsername(authenticationRequest.getUsername())
                           .orElseThrow(() -> new UsernameNotFoundException("User not found after successful authentication. This should not happen."));

        return ResponseEntity.ok(new AuthResponse(jwt, user.getId() ,user.getUsername(), user.getRole().name()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest, BindingResult bindingResult) {
        // --- BẮT ĐẦU: Xử lý lỗi validation ---
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = bindingResult.getFieldErrors().stream()
                    .collect(Collectors.toMap(FieldError::getField, FieldError::getDefaultMessage));
            logger.warn("Dang ky that bai do validation: {}", errors);
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Du lieu dang ky khong hop le", "errors", errors));
        }
        // --- KẾT THÚC: Xử lý lỗi validation ---

        
        try {
            // **CHUYỂN GIAO LOGIC TẠO USER CHO AUTHSERVICE**
            authService.registerNewUser(registerRequest);

            logger.info("Nguoi dung {} dang ky thanh cong voi email: {}", registerRequest.getUsername(), registerRequest.getEmail());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("success", true, "message", "Nguoi dung da dang ky thanh cong!"));
        } catch (UserAlreadyExistsException | EmailAlreadyExistsException e) { // Bắt các ngoại lệ tùy chỉnh
            logger.warn("Dang ky that bai: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            logger.error("Dang ky that bai cho nguoi dung {}: {}", registerRequest.getUsername(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Da xay ra loi khong mong muon: " + e.getMessage()));
        }
    }

    @PostMapping("/google-login")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> payload) {
        String idTokenString = payload.get("idToken");

        logger.info("Da nhan yeu cau dang nhap Google.");

        if (idTokenString == null) {
            logger.warn("ID Token bi thieu trong payload.");
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "ID Token bi thieu."));
        }

        logger.info("Đang xac minh Google ID Token. Client ID duoc xu dung de xac minh: {}", googleClientId);
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                .setAudience(Collections.singletonList(googleClientId))
                .build();

        GoogleIdToken idToken;
        try {
            idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                logger.warn("Xac minh Google ID Token that bai: idToken la null.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "message", "ID Token không hợp lệ."));
            }
            logger.info("Xac minh Google ID Token thanh cong. Email: {}", idToken.getPayload().getEmail());
        } catch (GeneralSecurityException | IOException e) {
            logger.error("Loi trong qua trinh xac minh Google ID Token: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "message", "ID Token không hợp lệ."));
        }

        // Lấy thông tin từ Payload
        GoogleIdToken.Payload googlePayload = idToken.getPayload();
        String email = googlePayload.getEmail();
        String name = (String) googlePayload.get("name");
        String pictureUrl = (String) googlePayload.get("picture");
        String googleId = googlePayload.getSubject();

        logger.info("Dang xu li nguoi dung voi email: {} va Google ID: {}", email, googleId);

        // Tách firstName và lastName
        String firstName = null;
        String lastName = null;
        if (name != null) {
            String[] nameParts = name.split(" ", 2);
            firstName = nameParts[0];
            if (nameParts.length > 1) {
                lastName = nameParts[1];
            }
        }

        // Tìm hoặc tạo người dùng
        // Optional<User> existingUser = userDAO.findByGoogleId(googleId);
        User user;

        try {
            // **CHUYỂN GIAO LOGIC TẠO/CẬP NHẬT GOOGLE USER CHO AUTHSERVICE**
            user = authService.processGoogleLogin(email, firstName, lastName, googleId, pictureUrl);
        } catch (EmailAlreadyExistsException e) { // Bắt ngoại lệ nếu email đã được sử dụng với nhà cung cấp khác
            logger.warn("Dang nhap voi Google that bai: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT) // 409 Conflict
                    .body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            logger.error("Loi khi xu li nguoi dung google: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Da xay ra loi khi xu li tai khoan Google cua ban."));
        }

        // Tạo Authentication
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                user,
                null,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name().toUpperCase()))
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Tạo JWT
        final String jwt = jwtUtil.generateToken(user);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Dang nhap thanh cong!");
        response.put("token", jwt);
        response.put("email", user.getEmail());
        response.put("userId", user.getId());
        response.put("username", user.getUsername());
        response.put("role", user.getRole().name());
        logger.info("Nguoi dung {} da dang nhap thanh cong, JWT da duoc tao.", user.getEmail());
        return ResponseEntity.ok(response);
    }
}