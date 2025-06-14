package com.quitsmoking.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.quitsmoking.services.AuthService;

import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory; // Add this import

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtRequestFilter.class); // Use SLF4J logger

    private final AuthService authService;
    private final JwtUtil jwtUtil;

    public JwtRequestFilter(AuthService authService, JwtUtil jwtUtil) {
        this.authService = authService;
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        
        String requestURI = request.getRequestURI();
        String requestMethod = request.getMethod();

        logger.debug("JwtRequestFilter: Processing request for URI: {} and Method: {}", requestURI, requestMethod);

        // 1. BỎ QUA CÁC YÊU CẦU OPTIONS (PREFLIGHT)
        if ("OPTIONS".equalsIgnoreCase(requestMethod)) {
            response.setStatus(HttpServletResponse.SC_OK); // Trả về 200 OK cho OPTIONS
            logger.debug("JwtRequestFilter: Handled OPTIONS request for URI: {}", requestURI);
            return; // Dừng xử lý filter chain ở đây
        }

        // 2. BỎ QUA CÁC ĐƯỜNG DẪN AUTHENTICATION VÀ REGISTER VÀ OAUTH2
        if (requestURI.startsWith("/api/auth/login") ||
            requestURI.startsWith("/api/auth/register") ||
            requestURI.startsWith("/oauth2/authorization") ||
            requestURI.startsWith("/oauth2/code") || // <-- SỬA TỪ "/oauth2/callback" THÀNH "/oauth2/code"
            requestURI.startsWith("/login/oauth2") // <-- Đảm bảo bao gồm cả /login/oauth2/** (ví dụ: /login/oauth2/code/google)
            ) {
            logger.debug("JwtRequestFilter: Skipping authentication for public/auth/oauth2 URI: {}", requestURI);
            chain.doFilter(request, response);
            return;
        }

        // 3. XỬ LÝ CÁC YÊU CẦU KHÁC (YÊU CẦU CÓ JWT)
        logger.debug("JwtRequestFilter: Proceeding with JWT authentication for: {}", requestURI);
        // Logic xử lý JWT token (chỉ chạy cho các request khác)
        final String authorizationHeader = request.getHeader("Authorization");

        String username = null;
        String jwt = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            try {
                username = jwtUtil.extractUsername(jwt);
            } catch (Exception e) { // Catch more specific exceptions if needed (ExpiredJwtException, SignatureException, etc.)
                logger.warn("Error extracting username from JWT for URI {}: {}", requestURI, e.getMessage());
            }
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.authService.loadUserByUsername(username);

            if (jwtUtil.validateToken(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                usernamePasswordAuthenticationToken
                        .setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
                logger.debug("JWT authenticated user: {}", username);
            } else {
                logger.warn("JWT Token validation failed for user: {}", username);
            }
        }
        chain.doFilter(request, response);
    }
}