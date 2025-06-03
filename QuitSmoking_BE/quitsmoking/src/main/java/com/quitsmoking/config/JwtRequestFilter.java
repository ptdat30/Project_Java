package com.quitsmoking.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
// import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.quitsmoking.services.AuthService;

// import com.quitsmoking.services.AuthService;

import java.io.IOException;
// import java.security.AuthProvider;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    private final AuthService authService;
    private final JwtUtil jwtUtil;

    public JwtRequestFilter(AuthService authService, JwtUtil jwtUtil) {
        this.authService = authService;
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        // In ra thông tin URI và Method của request để debug
        System.out.println("JwtRequestFilter: Processing request for URI: " + request.getRequestURI() + " and Method: " + request.getMethod());
        // 1. BỎ QUA CÁC YÊU CẦU OPTIONS (PREFLIGHT)
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK); // Trả về 200 OK cho OPTIONS
            return; // Dừng xử lý filter chain ở đây
        }

        // 2. BỎ QUA CÁC ĐƯỜNG DẪN AUTHENTICATION VÀ REGISTER
        String requestURI = request.getRequestURI();
        if (requestURI.startsWith("/api/auth/login") || requestURI.startsWith("/api/auth/register")) {
            System.out.println("JwtRequestFilter: Skipping authentication for auth URI: " + requestURI);
            chain.doFilter(request, response); // Cho phép các yêu cầu này đi tiếp mà không cần JWT
            return; // Dừng xử lý filter chain ở đây
        }
        // 3. XỬ LÝ CÁC YÊU CẦU KHÁC (YÊU CẦU CÓ JWT)
        System.out.println("JwtRequestFilter: Proceeding with JWT authentication for: " + requestURI);
        // Logic xử lý JWT token (chỉ chạy cho các request khác)
        final String authorizationHeader = request.getHeader("Authorization");

        String username = null;
        String jwt = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            username = jwtUtil.extractUsername(jwt);
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.authService.loadUserByUsername(username);

            if (jwtUtil.validateToken(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                usernamePasswordAuthenticationToken
                        .setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
            }
        }
        chain.doFilter(request, response);
    }
}