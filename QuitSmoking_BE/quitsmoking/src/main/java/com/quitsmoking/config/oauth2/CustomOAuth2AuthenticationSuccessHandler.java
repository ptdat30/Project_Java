// Trong CustomOAuth2AuthenticationSuccessHandler.java
package com.quitsmoking.config.oauth2;

import com.quitsmoking.config.JwtUtil;
// import com.quitsmoking.model.Role;
import com.quitsmoking.model.User;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Arrays;
import java.util.Optional; // Thêm import này
import java.util.List; // Thêm import này

@Component
public class CustomOAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Value("${app.oauth2.redirectUri}")
    private String authorizedRedirectUrisConfig;

    private final JwtUtil jwtUtil;

    public CustomOAuth2AuthenticationSuccessHandler(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        CustomOAuth2User customOAuth2User = (CustomOAuth2User) authentication.getPrincipal();
        User user = customOAuth2User.getUser();

        String userRole = user.getRole().name();

        String jwt = jwtUtil.generateToken(user);

        // Lấy redirect URI từ tham số trong request (nếu frontend đã gửi)
        String targetUrl = determineTargetUrl(request, jwt, userRole);

        System.out.println("OAuth2 Login Success! Redirecting to: " + targetUrl);

        if (response.isCommitted()) {
            logger.debug("Response has already been committed. Unable to redirect to " + targetUrl);
            return;
        }

        clearAuthenticationAttributes(request); // Xóa các thuộc tính tạm thời của Spring Security

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    protected String determineTargetUrl(HttpServletRequest request, String jwt, String userRole) {
        // Lấy `redirect_uri` từ tham số trong request. Đây là URI frontend mong muốn được chuyển hướng đến.
        // Frontend của bạn cần gửi tham số này khi bắt đầu luồng OAuth2 (ví dụ: /oauth2/authorization/google?redirect_uri=...)
        String frontendRedirectUriParam = request.getParameter("redirect_uri");

        // Phân tách các URI hợp lệ từ cấu hình
        List<String> authorizedUris = Arrays.asList(authorizedRedirectUrisConfig.split(","));

        // Xác thực frontendRedirectUriParam.
        // Nếu frontend gửi một URI hợp lệ, sử dụng nó.
        // Nếu không, mặc định hoặc ném lỗi.
        String targetFrontendRedirectUri = null;
        if (frontendRedirectUriParam != null && !frontendRedirectUriParam.isEmpty()) {
            Optional<String> matchedUri = authorizedUris.stream()
                .filter(uri -> uri.trim().equals(frontendRedirectUriParam.trim()))
                .findFirst();

            if (matchedUri.isPresent()) {
                targetFrontendRedirectUri = matchedUri.get();
            } else {
                // Nếu frontend gửi một URI không hợp lệ, bạn có thể ném lỗi hoặc chuyển hướng đến một trang lỗi mặc định.
                logger.error("Invalid redirect_uri received from frontend: " + frontendRedirectUriParam);
                // Ví dụ: return UriComponentsBuilder.fromUriString("/error").queryParam("error", "invalid_redirect_uri").build().toUriString();
                throw new IllegalArgumentException("Unauthorized Redirect URI: " + frontendRedirectUriParam);
            }
        } else {
            // Nếu frontend không gửi redirect_uri, bạn phải chọn một URI mặc định từ danh sách.
            // Đây là tình huống bạn đã cố gắng xử lý trước đó.
            // Để đơn giản, hãy sử dụng URI đầu tiên trong danh sách cấu hình.
            if (!authorizedUris.isEmpty()) {
                targetFrontendRedirectUri = authorizedUris.get(0).trim();
                logger.warn("No redirect_uri param from frontend. Using first configured URI: " + targetFrontendRedirectUri);
            } else {
                throw new IllegalArgumentException("No authorized redirect URIs configured.");
            }
        }

        // Xây dựng URL cuối cùng với token
        return UriComponentsBuilder.fromUriString(targetFrontendRedirectUri)
                .queryParam("token", jwt)
                .queryParam("role", userRole)
                .build().toUriString();
    }
}