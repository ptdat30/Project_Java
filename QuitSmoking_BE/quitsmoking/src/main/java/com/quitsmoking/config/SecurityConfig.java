package com.quitsmoking.config;

import com.quitsmoking.security.JwtAuthenticationEntryPoint;
import com.quitsmoking.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
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

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(securedEnabled = true, jsr250Enabled = true)
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationEntryPoint unauthorizedHandler;

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    // Không cần CustomUserDetailsService nếu JwtAuthenticationFilter của bạn
    // tạo Authentication principal trực tiếp từ claims trong JWT (ví dụ: role)
    // và không cần truy vấn DB để lấy UserDetails.

    @Bean
    public PasswordEncoder passwordEncoder() {
        // Dùng BCrypt cho việc mã hóa mật khẩu (nếu bạn có chức năng đăng ký mật khẩu truyền thống)
        // Mặc dù Google login không dùng trực tiếp, Spring Security thường yêu cầu bean này.
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Cho phép request từ frontend (thay đổi nếu frontend của bạn ở địa chỉ khác)
        configuration.setAllowedOrigins(List.of("http://localhost:5174"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Cache-Control", "Content-Type", "X-Requested-With"));
        configuration.setAllowCredentials(true); // Quan trọng nếu bạn muốn gửi cookie hoặc Authorization header
        configuration.setMaxAge(3600L); // Thời gian pre-flight request được cache (giây)

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // Áp dụng cấu hình CORS cho tất cả các path
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // Kích hoạt và sử dụng cấu hình CORS đã định nghĩa
                .csrf(csrf -> csrf.disable()) // Vô hiệu hóa CSRF vì dùng JWT và không dùng session cookies cho auth
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(unauthorizedHandler) // Xử lý lỗi khi xác thực thất bại (ví dụ: token không hợp lệ)
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS) // Không tạo hoặc sử dụng HTTP session phía server
                )
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/api/auth/**").permitAll() // Cho phép tất cả request đến /api/auth/** (đăng nhập, đăng ký, etc.)
                        // Ví dụ: cho phép truy cập các file static nếu có
                        // .requestMatchers("/public/**", "/static/**", "/index.html", "/").permitAll()
                        .anyRequest().authenticated() // Tất cả các request khác đều yêu cầu xác thực (phải có JWT hợp lệ)
                );

        // Thêm JWT filter của bạn vào trước filter UsernamePasswordAuthenticationFilter mặc định của Spring
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}