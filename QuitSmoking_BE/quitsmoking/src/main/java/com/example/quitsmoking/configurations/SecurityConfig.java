package com.example.quitsmoking.configurations;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Cấu hình CSRF:
                // Nếu bạn đang xây dựng một ứng dụng web truyền thống (server-side rendering với Thymeleaf),
                // bạn NÊN bật CSRF để bảo vệ khỏi các cuộc tấn công CSRF.
                // Nếu bạn đang xây dựng một REST API với frontend riêng biệt (ví dụ: React, Vue)
                // và sử dụng JWT hoặc token khác, bạn có thể tắt CSRF.
                // Hiện tại, tôi giữ nguyên disable như bạn đã có, nhưng hãy cân nhắc bật nó nếu cần.
                .csrf(csrf -> csrf.disable()) // Để tắt CSRF protection

                // Cấu hình các yêu cầu HTTP (phân quyền)
                .authorizeHttpRequests(authorize -> authorize
                        // Cho phép truy cập CÔNG KHAI vào các đường dẫn sau
                        // Quan trọng: /login cần được permitAll() để trang đăng nhập hiển thị
                        // / là trang gốc mà bạn muốn chuyển hướng
                        // Các file HTML của bạn (login.html, sign_up.html, v.v.) cần được permitAll()
                        // Các tài nguyên tĩnh (CSS, JS, Images) cần được permitAll()
                        .requestMatchers(
                                "/", // Trang gốc
                                "/login", // Endpoint của trang login (quan trọng)
                                "/sign_up", // Endpoint của trang đăng ký
                                "/reset_pass_1", // Endpoint đặt lại mật khẩu bước 1
                                "/reset_pass_2", // Endpoint đặt lại mật khẩu bước 2
                                "/success_change", // Endpoint đổi mật khẩu thành công
                                "/assets/**", // Các tài nguyên trong thư mục assets
                                "/css/**",    // Các file CSS
                                "/js/**",     // Các file JavaScript
                                "/images/**"  // Các file hình ảnh
                        ).permitAll() // Cho phép tất cả mọi người truy cập không cần xác thực
                        .anyRequest().authenticated() // Tất cả các yêu cầu khác đều yêu cầu xác thực
                )

                // Cấu hình đăng nhập bằng OAuth2 (ví dụ: Google)
                .oauth2Login(oauth2 -> oauth2
                        .loginPage("/login")
                        .defaultSuccessUrl("/home", true)
                        .failureUrl("/login?error=oauth2_failure")
                )

                .formLogin(form -> form
                                .loginPage("/login") // Sử dụng trang đăng nhập tùy chỉnh của bạn
                                .permitAll() // Cho phép truy cập vào form login (quan trọng)
                                .defaultSuccessUrl("/home", true)
                                .failureUrl("/login?error=form_failure")

                )

                // Xử lý ngoại lệ (khi người dùng cố gắng truy cập tài nguyên bảo vệ mà chưa đăng nhập)
                .exceptionHandling(exception -> exception
                        // Trả về mã trạng thái 401 UNAUTHORIZED khi chưa được xác thực
                        .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
                )

                // Cấu hình đăng xuất
                .logout(logout -> logout
                        .logoutUrl("/logout") // (Tùy chọn) URL để đăng xuất
                        .logoutSuccessUrl("/login?logout") // Chuyển hướng đến trang đăng nhập sau khi đăng xuất thành công
                        .permitAll() // Cho phép truy cập vào URL đăng xuất
                );

        return http.build();
    }
}