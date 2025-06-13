package com.quitsmoking.config.oauth2;

import com.quitsmoking.model.User; // Import User entity của bạn
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.Map;
// import java.util.Set;

public class CustomOAuth2User implements OAuth2User {

    private User user;
    private Map<String, Object> attributes;
    private Collection<? extends GrantedAuthority> authorities;

    public CustomOAuth2User(User user, Map<String, Object> attributes, Collection<? extends GrantedAuthority> authorities) {
        this.user = user;
        this.attributes = attributes;
        this.authorities = authorities;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getName() {
        // Tên của người dùng, thường là email hoặc ID
        return user.getEmail();
    }

    // Các phương thức tùy chỉnh để truy cập thông tin User của bạn
    public String getEmail() {
        return user.getEmail();
    }

    public String getId() {
        return user.getId();
    }

    public String getFirstName() {
        return user.getFirstName();
    }

    public String getLastName() {
        return user.getLastName();
    }

    public String getPictureUrl() {
        return user.getPictureUrl();
    }

    // Nếu bạn muốn truy cập toàn bộ đối tượng User
    public User getUser() {
        return user;
    }
}