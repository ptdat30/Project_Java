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

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureException;

import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtRequestFilter.class);

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

        // Bỏ qua logging cho các request không quan trọng
        if (!requestURI.startsWith("/ws") && !requestURI.startsWith("/static") && !requestURI.startsWith("/favicon")) {
            logger.debug("JwtRequestFilter: Processing request for URI: {} and Method: {}", requestURI, requestMethod);
        }

        // 1. Bỏ qua các yêu cầu OPTIONS (preflight)
        if ("OPTIONS".equalsIgnoreCase(requestMethod)) {
            chain.doFilter(request, response);
            return;
        }

        // 2. Bỏ qua xác thực cho các endpoint public
        if (requestURI.startsWith("/api/auth/") ||
                requestURI.startsWith("/oauth2/") ||
                requestURI.startsWith("/login/oauth2") ||
                (requestURI.startsWith("/api/community/comments/post/") && "GET".equalsIgnoreCase(requestMethod))) {
            chain.doFilter(request, response);
            return;
        }

        // 3. Xử lý JWT cho các request cần xác thực
        final String authorizationHeader = request.getHeader("Authorization");

        String username = null;
        String jwt = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            try {
                username = jwtUtil.extractUsername(jwt);
                logger.debug("Extracted username from JWT: {}", username);
            } catch (ExpiredJwtException e) {
                logger.warn("JWT Token expired for URI {}: {}", requestURI, e.getMessage());
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "JWT Token expired");
                return;
            } catch (Exception e) {
                logger.warn("Invalid JWT Token for URI {}: {}", requestURI, e.getMessage());
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid JWT Token");
                return;
            }
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                UserDetails userDetails = this.authService.loadUserByUsername(username);
                if (jwtUtil.validateToken(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                    logger.debug("Authenticated user: {}", username);
                }
            } catch (Exception e) {
                logger.error("Error loading user details: {}", e.getMessage());
            }
        }

        chain.doFilter(request, response);
    }
}