package com.eexample.quitsmoking.configurations;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.http.HttpStatus;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(authorize -> authorize
                // Cho phép truy cập vào các trang public và tài nguyên tĩnh
                .requestMatchers("/", "/login.html", "/sign_up.html", "/reset_pass_1.html", "/reset_pass_2.html", "/success_change.html", "/assets/**").permitAll() // Cho phép truy cập vào tài nguyên tĩnh và các trang HTML cụ thể
                .anyRequest().authenticated() // Tất cả các yêu cầu khác đều yêu cầu xác thực
            )
            .oauth2Login(oauth2 -> oauth2
                .loginPage("/login") // Chuyển hướng đến trang đăng nhập tùy chỉnh của bạn
                .defaultSuccessUrl("/home", true) // Chuyển hướng đến /home sau khi đăng nhập thành công
                .failureUrl("/login?error") // Chuyển hướng đến trang đăng nhập khi đăng nhập thất bại
            )
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)) // Xử lý khi người dùng chưa được xác thực
            )
            .logout(logout -> logout
                .logoutSuccessUrl("/login") // Chuyển hướng đến trang đăng nhập sau khi đăng xuất
                .permitAll()
            );
        return http.build();
    }
    
}
