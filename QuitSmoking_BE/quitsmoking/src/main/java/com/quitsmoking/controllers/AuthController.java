package com.quitsmoking.controllers;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.quitsmoking.config.JwtUtil;
import com.quitsmoking.dto.request.AuthRequest;
import com.quitsmoking.dto.request.RegisterRequest;
import com.quitsmoking.dto.response.AuthResponse;
import com.quitsmoking.model.AuthProvider;
import com.quitsmoking.model.GoogleUser;
import com.quitsmoking.model.LocalUser;
import com.quitsmoking.model.Role;
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
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.validation.BindingResult; // Thêm import này
import org.springframework.validation.FieldError; // Thêm import này
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
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

        User user = authService.findByUsername(authenticationRequest.getUsername());

        return ResponseEntity.ok(new AuthResponse(jwt, user.getUsername(), user.getRole().name()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest, BindingResult bindingResult) {
        // --- BẮT ĐẦU: Xử lý lỗi validation ---
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = bindingResult.getFieldErrors().stream()
                    .collect(Collectors.toMap(FieldError::getField, FieldError::getDefaultMessage));
            logger.warn("Đăng ký thất bại do validation: {}", errors);
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Dữ liệu đăng ký không hợp lệ", "errors", errors));
        }
        // --- KẾT THÚC: Xử lý lỗi validation ---

        try {
            // Kiểm tra email hoặc username đã tồn tại
            if (userDAO.findByEmail(registerRequest.getEmail()).isPresent()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("success", false, "message", "Email đã được sử dụng."));
            }
            if (userDAO.findByUsername(registerRequest.getUsername()).isPresent()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("success", false, "message", "Tên đăng nhập đã được sử dụng."));
            }

            // Tạo LocalUser
            LocalUser user = new LocalUser(
                    registerRequest.getUsername(),
                    authService.encodePassword(registerRequest.getPassword()), // Mã hóa mật khẩu
                    registerRequest.getEmail(),
                    registerRequest.getFirstName(),
                    registerRequest.getLastName(),
                    Role.MEMBER // Mặc định là MEMBER
            );

            // Lưu vào cơ sở dữ liệu
            userDAO.save(user);

            logger.info("Người dùng đã đăng ký thành công: {}", registerRequest.getEmail());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("success", true, "message", "Người dùng đã đăng ký thành công!"));
        } catch (Exception e) {
            logger.error("Đăng ký thất bại cho người dùng {}: {}", registerRequest.getUsername(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Đã xảy ra lỗi không mong muốn: " + e.getMessage()));
        }
    }

    @PostMapping("/google-login")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> payload) {
        String idTokenString = payload.get("idToken");

        logger.info("Đã nhận yêu cầu đăng nhập Google.");

        if (idTokenString == null) {
            logger.warn("ID Token bị thiếu trong payload.");
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "ID Token bị thiếu."));
        }

        logger.info("Đang xác minh Google ID Token. Client ID được sử dụng để xác minh: {}", googleClientId);
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                .setAudience(Collections.singletonList(googleClientId))
                .build();

        GoogleIdToken idToken;
        try {
            idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                logger.warn("Xác minh Google ID Token thất bại: idToken là null.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "message", "ID Token không hợp lệ."));
            }
            logger.info("Xác minh Google ID Token thành công. Email: {}", idToken.getPayload().getEmail());
        } catch (GeneralSecurityException | IOException e) {
            logger.error("Lỗi trong quá trình xác minh Google ID Token: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "message", "ID Token không hợp lệ."));
        }

        // Lấy thông tin từ Payload
        GoogleIdToken.Payload googlePayload = idToken.getPayload();
        String email = googlePayload.getEmail();
        String name = (String) googlePayload.get("name");
        String pictureUrl = (String) googlePayload.get("picture");
        String googleId = googlePayload.getSubject();

        logger.info("Đang xử lý người dùng với email: {} và Google ID: {}", email, googleId);

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
        Optional<User> existingUser = userDAO.findByGoogleId(googleId);
        User user;

        if (existingUser.isPresent()) {
            user = existingUser.get();
            // Cập nhật thông tin
            user.setEmail(email);
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setPictureUrl(pictureUrl);
            user.setAuthProvider(AuthProvider.GOOGLE);
            user.setGoogleId(googleId);

            logger.info("Đã tìm thấy và cập nhật người dùng hiện có: {}", user.getEmail());
        } else {
            // Kiểm tra email đã tồn tại
            Optional<User> existingUserByEmail = userDAO.findByEmail(email);
            if (existingUserByEmail.isPresent()) {
                user = existingUserByEmail.get();
                if (user.getAuthProvider().equals(AuthProvider.LOCAL)) {
                    // Liên kết tài khoản local với Google
                    user.setFirstName(firstName);
                    user.setLastName(lastName);
                    user.setPictureUrl(pictureUrl);
                    user.setGoogleId(googleId);
                    user.setAuthProvider(AuthProvider.GOOGLE);
                    logger.info("Đã liên kết người dùng LOCAL hiện có với Google: {}", user.getEmail());
                } else {
                    throw new OAuth2AuthenticationException("Email đã đăng ký với tài khoản " +
                            user.getAuthProvider() + ". Vui lòng sử dụng tài khoản " + user.getAuthProvider() +
                            " của bạn để đăng nhập.");
                }
            } else {
                // Tạo GoogleUser mới
                user = new GoogleUser(
                        email,
                        firstName,
                        lastName,
                        googleId,
                        pictureUrl,
                        AuthProvider.GOOGLE,
                        Role.MEMBER // Mặc định là MEMBER
                );
                logger.info("Đã tạo người dùng Google mới: {}", user.getEmail());
            }
        }
        userDAO.save(user);

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
        response.put("message", "Đăng nhập thành công!");
        response.put("token", jwt);
        response.put("email", user.getEmail());
        response.put("userId", user.getId());
        response.put("role", user.getRole().name());
        logger.info("Người dùng {} đã đăng nhập thành công, JWT đã được tạo.", user.getEmail());
        return ResponseEntity.ok(response);
    }
}