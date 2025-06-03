package com.example.quitsmoking.controllers;

import com.example.quitsmoking.dto.response.AuthResponse;
import com.example.quitsmoking.dto.request.AuthRequest;
import com.example.quitsmoking.configurations.JwtUtil;
import com.example.quitsmoking.services.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus; 
import java.util.Map;

import com.example.quitsmoking.model.User;

@RestController
@RequestMapping("/api/auth") // Tất cả các API auth sẽ nằm dưới /api/auth
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final AuthService authService; // UserDetailsService
    private final JwtUtil jwtUtil;

    public AuthController(AuthenticationManager authenticationManager, AuthService authService, JwtUtil jwtUtil) {
        this.authenticationManager = authenticationManager;
        this.authService = authService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<?> createAuthenticationToken(@RequestBody AuthRequest authenticationRequest) throws Exception {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authenticationRequest.getUsername(), authenticationRequest.getPassword())
            );
        } catch (BadCredentialsException e) {
            // throw new Exception("Incorrect username or password", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Incorrect username or password"));
        }

        final UserDetails userDetails = authService.loadUserByUsername(authenticationRequest.getUsername());
        final String jwt = jwtUtil.generateToken(userDetails);

        // Trả về phản hồi với JWT và thông tin người dùng
        User user = authService.findByUsername(authenticationRequest.getUsername()); //

        // Trả về phản hồi AuthResponse với JWT, username và role
        return ResponseEntity.ok(new AuthResponse(jwt, user.getUserName(), user.getRole().name()));
    }

     @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody AuthRequest registerRequest) { // Giả sử AuthRequest đủ cho đăng ký
        try {
            // Đây là nơi bạn sẽ gọi service để đăng ký người dùng
            // Trong AuthService, bạn sẽ có một phương thức để tạo người dùng mới
            // và mã hóa mật khẩu trước khi lưu vào cơ sở dữ liệu.
            authService.registerNewUser(registerRequest); // Bạn cần triển khai phương thức này trong AuthService

            // Nếu đăng ký thành công, trả về phản hồi thành công (ví dụ: HTTP 200 OK hoặc 201 Created)
            // return ResponseEntity.status(HttpStatus.CREATED).body("User registered successfully!");
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "User registered successfully!"));
        } catch (Exception e) {
            // Xử lý các lỗi có thể xảy ra trong quá trình đăng ký (ví dụ: username/email đã tồn tại)
            // return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Registration failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "An unexpected error occurred: " + e.getMessage()));
        }
    }
}