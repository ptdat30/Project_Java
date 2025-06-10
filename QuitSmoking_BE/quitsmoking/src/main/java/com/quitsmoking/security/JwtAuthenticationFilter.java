package com.quitsmoking.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections; // Thêm import này

@Component // Đánh dấu là một Spring component để có thể inject
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtTokenProvider tokenProvider;

    // Bạn sẽ cần một UserDetailsService để tải thông tin người dùng dựa trên email/username từ JWT
    // Điều này quan trọng để Spring Security có thể quản lý Principal (người dùng đã xác thực)
    // Nếu bạn không muốn query DB mỗi lần, bạn có thể mã hóa thêm thông tin role vào JWT
    // và tạo UserDetails trực tiếp từ JWT.
    @Autowired
    private UserDetailsService userDetailsService; // Ví dụ: CustomUserDetailsService

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            String jwt = getJwtFromRequest(request);

            if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
                String username = tokenProvider.getUsernameFromJWT(jwt); // Lấy username (ví dụ: email)

                // Tải thông tin UserDetails từ username (email)
                // UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                // Thay vì loadUserByUsername, chúng ta có thể tạo UserDetails trực tiếp
                // nếu role đã có trong token và không cần thêm thông tin từ DB ở bước này.
                // Ví dụ, nếu bạn đã claim "role" trong JWT:
                Claims claims = Jwts.parserBuilder().setSigningKey(tokenProvider.getKey()).build().parseClaimsJws(jwt).getBody();
                String roleName = claims.get("role", String.class); // Giả sử bạn đã claim "role"

                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        username, // Principal có thể là email hoặc User object tùy bạn muốn
                        null,
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + roleName.toUpperCase()))
                );
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception ex) {
            // logger.error("Could not set user authentication in security context", ex);
            // Không nên throw lỗi ở đây, cứ để request đi tiếp,
            // nếu không có authentication thì AccessDeniedHandler hoặc AuthenticationEntryPoint sẽ xử lý
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}