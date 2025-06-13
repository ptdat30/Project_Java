package com.quitsmoking.config.oauth2;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
// import java.util.Arrays; // <--- Thêm import này
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


@Component
public class CustomOAuth2LoginFailureHandler implements AuthenticationFailureHandler {

    private static final Logger logger = LoggerFactory.getLogger(CustomOAuth2LoginFailureHandler.class);

    @Value("${app.oauth2.authorizedRedirectUris}")
    private String authorizedRedirectUrisConfig; // Đổi tên để phản ánh là config string

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, AuthenticationException exception) throws IOException, ServletException {
        logger.error("OAuth2 Login Failed: {}", exception.getMessage(), exception);

        // Lấy thông báo lỗi
        String errorMessage = exception.getMessage();
        if (errorMessage == null || errorMessage.isEmpty()) {
            errorMessage = "Authentication failed.";
        }
        // Mã hóa thông báo lỗi để truyền qua URL
        // KHÔNG mã hóa toàn bộ chuỗi lỗi nếu nó chứa các ký tự đặc biệt của URL
        // Chỉ mã hóa phần giá trị của tham số
        String encodedErrorMessage = UriComponentsBuilder.fromUriString("").queryParam("error", errorMessage).build().encode().getQuery();


        // Phân tách chuỗi cấu hình thành một mảng các URI
        String[] uris = authorizedRedirectUrisConfig.split(",");
        String targetFrontendRedirectUri = null;

        // Chọn URI frontend phù hợp, ưu tiên localhost:5500
        for (String uri : uris) {
            String trimmedUri = uri.trim();
            if (trimmedUri.startsWith("http://localhost:5500/oauth2/redirect") ||
                trimmedUri.startsWith("http://127.0.0.1:5500/oauth2/redirect")) {
                targetFrontendRedirectUri = trimmedUri;
                break;
            }
        }

        if (targetFrontendRedirectUri == null) {
            // Fallback nếu không tìm thấy URI ưu tiên, sử dụng URI đầu tiên
            if (uris.length > 0) {
                targetFrontendRedirectUri = uris[0].trim();
                logger.warn("Warning: Specific frontend redirect URI not found in config for failure handler, using first available: {}", targetFrontendRedirectUri);
            } else {
                logger.error("No authorized redirect URIs configured for frontend in failure handler.");
                // Trong trường hợp cực đoan này, bạn có thể chuyển hướng về trang gốc hoặc trang lỗi mặc định
                response.sendRedirect("/");
                return;
            }
        }


        // Xây dựng URL cuối cùng
        String redirectUrl = UriComponentsBuilder.fromUriString(targetFrontendRedirectUri)
                .queryParam("error", encodedErrorMessage) // Truyền thông báo lỗi đã mã hóa
                .build().toUriString();

        logger.info("Redirecting to failure URL: {}", redirectUrl);
        response.sendRedirect(redirectUrl);
    }
}