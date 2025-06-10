package com.quitsmoking.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException; // Thêm import này
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
// import org.springframework.security.core.GrantedAuthority; // Bỏ comment nếu bạn muốn claim 'authorities'
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.security.Key;
import java.util.Date;
// import java.util.stream.Collectors; // Bỏ comment nếu bạn muốn claim 'authorities'

@Component
public class JwtTokenProvider {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    @Value("${app.jwtSecret}")
    private String jwtSecret;

    @Value("${app.jwtExpirationInMs}")
    private int jwtExpirationInMs;

    private Key key;

    @PostConstruct
    public void init() {
        // Tạo key từ jwtSecret. Đảm bảo jwtSecret đủ mạnh.
        // Keys.secretKeyFor(SignatureAlgorithm.HS512) sẽ tạo key an toàn nếu bạn không muốn dùng chuỗi tùy chỉnh.
        // Tuy nhiên, để đảm bảo key giống nhau mỗi khi ứng dụng khởi động lại (cần thiết để xác thực token đã tạo trước đó),
        // chúng ta sẽ tạo key từ byte của jwtSecret.
        this.key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    // Phương thức generateToken như bạn đã gọi trong AuthController
    public String generateToken(Authentication authentication, Long userId, String email, String roleName) {
        // String username = authentication.getName(); // Hoặc email trực tiếp
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationInMs);

        // Bạn có thể thêm các claims tùy chỉnh khác nếu muốn
        return Jwts.builder()
                .setSubject(email) // Đặt email làm subject của token
                .claim("userId", userId)
                .claim("role", roleName) // Vai trò của người dùng
                // Nếu bạn muốn claim chi tiết các quyền (authorities):
                // .claim("authorities", authentication.getAuthorities().stream()
                //                        .map(GrantedAuthority::getAuthority)
                //                        .collect(Collectors.toList()))
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS512) // Sử dụng HS512 và key đã tạo
                .compact();
    }

    // Phương thức để lấy email (subject) từ JWT
    public String getUsernameFromJWT(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
    }

    // Phương thức để lấy userId từ JWT (nếu bạn đã claim nó)
    public Long getUserIdFromJWT(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
        // Lấy userId. Nếu không tìm thấy hoặc kiểu không đúng, có thể trả về null hoặc throw exception.
        return claims.get("userId", Long.class);
    }

    // Phương thức để xác thực JWT
    public boolean validateToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(authToken);
            return true;
        } catch (SignatureException ex) {
            logger.error("Invalid JWT signature");
        } catch (MalformedJwtException ex) {
            logger.error("Invalid JWT token");
        } catch (ExpiredJwtException ex) {
            logger.error("Expired JWT token");
        } catch (UnsupportedJwtException ex) {
            logger.error("Unsupported JWT token");
        } catch (IllegalArgumentException ex) {
            logger.error("JWT claims string is empty.");
        }
        return false;
    }

    // Phương thức để JwtAuthenticationFilter có thể lấy key (nếu cần parse claims trực tiếp)
    public Key getKey() {
        return this.key;
    }
}