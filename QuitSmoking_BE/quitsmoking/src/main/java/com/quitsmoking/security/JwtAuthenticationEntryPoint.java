package com.quitsmoking.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component // Đảm bảo rằng lớp này được đánh dấu là một Spring Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    // @Autowired (Không cần thiết ở đây, nó sẽ được inject vào SecurityConfig)

    @Override
    public void commence(HttpServletRequest httpServletRequest,
                         HttpServletResponse httpServletResponse,
                         AuthenticationException e) throws IOException, ServletException {
        // Đây là nơi bạn sẽ xử lý các request không được xác thực (ví dụ: gửi 401 Unauthorized)
        // Khi người dùng cố gắng truy cập một tài nguyên bảo vệ mà không có thông tin xác thực hợp lệ
        // hoặc token hết hạn/không hợp lệ, phương thức này sẽ được gọi.

        httpServletResponse.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
        // Bạn có thể tùy chỉnh thông báo lỗi hoặc chuyển hướng đến một trang lỗi cụ thể
        // Ví dụ:
        // httpServletResponse.setContentType("application/json");
        // httpServletResponse.getWriter().write("{ \"error\": \"Unauthorized\", \"message\": \"" + e.getMessage() + "\" }");
    }
}