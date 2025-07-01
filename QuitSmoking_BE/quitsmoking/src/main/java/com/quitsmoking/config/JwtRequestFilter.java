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

        // Chỉ log cho các request quan trọng, không log cho WebSocket và static resources
        if (!requestURI.startsWith("/ws") && !requestURI.startsWith("/static") && !requestURI.startsWith("/favicon")) {
            logger.debug("JwtRequestFilter: Processing request for URI: {} and Method: {}", requestURI, requestMethod);
        }

        // 1. BỎ QUA CÁC YÊU CẦU OPTIONS (PREFLIGHT)
        if ("OPTIONS".equalsIgnoreCase(requestMethod)) {
            response.setStatus(HttpServletResponse.SC_OK); // Trả về 200 OK cho OPTIONS
            return; // Dừng xử lý filter chain ở đây
        }

        // 2. BỎ QUA CÁC ĐƯỜNG DẪN AUTHENTICATION VÀ REGISTER VÀ OAUTH2
        if (requestURI.startsWith("/api/auth/login") ||
            requestURI.startsWith("/api/auth/register") ||
            requestURI.startsWith("/oauth2/authorization") ||
            requestURI.startsWith("/oauth2/code") || // <-- SỬA TỪ "/oauth2/callback" THÀNH "/oauth2/code"
            requestURI.startsWith("/login/oauth2") // <-- Đảm bảo bao gồm cả /login/oauth2/** (ví dụ: /login/oauth2/code/google)
            ) {
            chain.doFilter(request, response);
            return;
        }

        // 3. XỬ LÝ CÁC YÊU CẦU KHÁC (YÊU CẦU CÓ JWT)
        // Logic xử lý JWT token (chỉ chạy cho các request khác)
        final String authorizationHeader = request.getHeader("Authorization");

        String username = null;
        String jwt = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            try {
                username = jwtUtil.extractUsername(jwt);
            } catch (ExpiredJwtException e) {
                logger.warn("JWT Token đã hết hạn cho URI {}: {}", requestURI, e.getMessage());
                // Token hết hạn, đặt trạng thái phản hồi là 401 và dừng xử lý filter này
                // Spring Security's exceptionHandling().authenticationEntryPoint sẽ xử lý 401 sau đó nếu ngữ cảnh không được đặt.
                // Hoặc bạn có thể gọi response.sendError ở đây nếu muốn bỏ qua các filter tiếp theo:
                // response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "JWT Token đã hết hạn");
                // return;
            } catch (SignatureException e) {
                logger.warn("Chữ ký JWT Token không hợp lệ cho URI {}: {}", requestURI, e.getMessage());
                // Chữ ký không hợp lệ, token bị giả mạo hoặc sai khóa bí mật.
                // response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Chữ ký JWT Token không hợp lệ");
                // return;
            } catch (MalformedJwtException e) {
                logger.warn("JWT Token bị định dạng sai cho URI {}: {}", requestURI, e.getMessage());
                // Token bị định dạng sai
                // response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "JWT Token bị định dạng sai");
                // return;
            } catch (IllegalArgumentException e) {
                logger.warn("JWT Token không bắt đầu bằng chuỗi Bearer hoặc không thể phân tích cho URI {}: {}", requestURI, e.getMessage());
                // Định dạng header không hợp lệ hoặc claims rỗng
            } catch (Exception e) { // Bắt bất kỳ ngoại lệ không mong muốn nào khác
                logger.error("Đã xảy ra lỗi không mong muốn trong quá trình xử lý JWT cho URI {}: {}", requestURI, e.getMessage(), e);
            }
        } else {
            // Chỉ log cho các request quan trọng, không log cho WebSocket
            if (!requestURI.startsWith("/ws")) {
                logger.debug("Không có header Authorization hoặc không phải là token Bearer cho URI: {}", requestURI);
            }
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = null;
            try {
                userDetails = this.authService.loadUserByUsername(username);
            } catch (Exception e) {
                logger.error("Không thể tải thông tin chi tiết người dùng cho tên người dùng '{}': {}", username, e.getMessage());
                // Nếu không thể tải thông tin chi tiết người dùng (ví dụ: không tìm thấy người dùng trong DB), coi như chưa được xác thực
            }


            if (userDetails != null && jwtUtil.validateToken(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                usernamePasswordAuthenticationToken
                        .setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
                logger.debug("Người dùng đã được JWT xác thực: {} và đã được đặt trong SecurityContext.", username);
            } else {
                logger.warn("Xác thực JWT Token thất bại sau khi tải thông tin chi tiết người dùng cho người dùng: {}", username);
            }
        }

        chain.doFilter(request, response);
    }
}