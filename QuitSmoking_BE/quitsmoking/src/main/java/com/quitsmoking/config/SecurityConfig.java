package com.quitsmoking.config;

import com.quitsmoking.services.AuthService;
import com.quitsmoking.services.CustomOAuth2UserService;
import com.quitsmoking.config.oauth2.CustomOAuth2AuthenticationSuccessHandler;
import com.quitsmoking.config.oauth2.CustomOAuth2LoginFailureHandler;

import org.springframework.beans.factory.annotation.Autowired; // Giữ lại nếu bạn vẫn cần cho CustomOAuth2UserService
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
// import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
// import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
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
    @Autowired
    private CustomOAuth2UserService customOAuth2UserService; // Giữ lại cái này, nó không gây vòng lặp trực tiếp ở đây

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
        JwtRequestFilter jwtRequestFilter,
        CustomOAuth2AuthenticationSuccessHandler customOAuth2LoginSuccessHandler,
        CustomOAuth2LoginFailureHandler customOAuth2LoginFailureHandler
    ) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(org.springframework.security.config.Customizer.withDefaults())
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                // Cho phép các endpoint xác thực cục bộ (đăng nhập, đăng ký)
                .requestMatchers("/api/auth/**").permitAll()
                // Sử dụng chuỗi trực tiếp cho requestMatchers để tránh cảnh báo deprecated
                .requestMatchers(
                    "/oauth2/**",
                    "/login/oauth2/code/*", // giữ lại cái này nếu nó là redirect_uri tiềm năng
                    "/login/oauth2/**",
                    "/oauth2-redirect.html",
                    "/error" // Đảm bảo trang /error cũng được phép truy cập công khai
                ).permitAll()
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
            )
            .oauth2Login(oauth2 -> oauth2
                .authorizationEndpoint(authorization -> authorization
                    .baseUri("/oauth2/authorization") // Đây là endpoint mà frontend sẽ gọi để bắt đầu luồng OAuth2
                )
                .redirectionEndpoint(redirection -> redirection
                    .baseUri("/oauth2/code/*") // Endpoint nơi Google sẽ gửi code xác thực
                )
                .userInfoEndpoint(userInfo -> userInfo
                    .userService(customOAuth2UserService)
                )
                .successHandler(customOAuth2LoginSuccessHandler)
                .failureHandler(customOAuth2LoginFailureHandler)
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