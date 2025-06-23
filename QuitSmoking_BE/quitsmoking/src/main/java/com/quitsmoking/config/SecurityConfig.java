package com.quitsmoking.config;

import com.quitsmoking.services.AuthService;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    // --- TIÊM CÁC THÀNH PHẦN CẦN THIẾT CHO OAUTH2 VÀ JWT ---
    

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    @SuppressWarnings("deprecation")
    public DaoAuthenticationProvider authenticationProvider(AuthService authService) {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(authService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
        HttpSecurity http,
        JwtRequestFilter jwtRequestFilter
        
    ) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(org.springframework.security.config.Customizer.withDefaults())
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                // Cho phép các endpoint xác thực cục bộ (đăng nhập, đăng ký)
                .requestMatchers("/api/auth/**").permitAll()
                // Cho phép truy cập các file trong thư mục uploads (PUBLIC)
                .requestMatchers("/uploads/**").permitAll()
                // Cho phép truy cập endpoint profile
                .requestMatchers("/api/user/profile").authenticated()
                // Endpoint free-trial yêu cầu vai trò GUEST
                .requestMatchers(HttpMethod.POST, "/api/membership/free-trial").hasAnyRole("GUEST")
                // Endpoint upgrade yêu cầu các vai trò này
                .requestMatchers(HttpMethod.POST, "/api/membership/upgrade").hasAnyRole("GUEST", "MEMBER", "ADMIN", "COACH")

                // Bất kỳ yêu cầu nào khác đến /api/** đều yêu cầu được xác thực
                .requestMatchers("/api/**").authenticated()
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
            )
            .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class)
            .logout(logout -> logout
                .logoutUrl("/api/auth/logout")
                .logoutSuccessHandler((request, response, authentication) -> response.setStatus(HttpStatus.OK.value()))
                .permitAll()
            );
            

        return http.build();
    }


    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowCredentials(true);
        configuration.setAllowedOrigins(List.of(
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5500",
            "http://localhost:5500",
                "http://localhost:4173/",
                "http://localhost:5173/"

        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of(
            "Authorization", "Content-Type", "Accept", "X-Requested-With"
        ));
        configuration.setMaxAge(3600L);

        source.registerCorsConfiguration("/**", configuration);
        System.out.println("CorsConfigurationSource bean is being initialized!");
        return source;
    }
}