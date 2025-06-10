package com.quitsmoking.service;

import com.quitsmoking.model.Role;
import com.quitsmoking.model.User;
import com.quitsmoking.repository.RoleRepository;
import com.quitsmoking.repository.UserRepository;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository; // Cần Repository cho Role

    public CustomOAuth2UserService(UserRepository userRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        // Lấy thông tin từ Google
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");
        String provider = userRequest.getClientRegistration().getRegistrationId(); // "google"
        String providerId = oAuth2User.getName(); // ID duy nhất của người dùng từ Google (sub)

        Optional<User> existingUser = userRepository.findByProviderAndProviderId(provider, providerId);
        User user;

        if (existingUser.isPresent()) {
            // Người dùng đã tồn tại, cập nhật thông tin
            user = existingUser.get();
            user.setName(name);
            user.setEmail(email); // Cập nhật email nếu có thay đổi
            user.setPicture(picture);
        } else {
            // Người dùng mới, tạo bản ghi mới
            user = new User();
            user.setEmail(email);
            user.setName(name);
            user.setPicture(picture);
            user.setProvider(provider);
            user.setProviderId(providerId);

            // Gán vai trò mặc định, ví dụ 'Member' cho người dùng mới
            Role defaultRole = roleRepository.findByName("Member")
                    .orElseThrow(() -> new RuntimeException("Default role 'Member' not found!"));
            user.setRole(defaultRole);
        }
        userRepository.save(user);

        // Trả về OAuth2User mặc định hoặc một CustomUserDetails (tùy chỉnh nếu cần)
        return oAuth2User;
    }
}