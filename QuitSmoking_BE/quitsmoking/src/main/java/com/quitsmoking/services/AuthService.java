package com.quitsmoking.services;

import com.quitsmoking.dto.request.RegisterRequest;
import com.quitsmoking.model.*;
import com.quitsmoking.reponsitories.UserDAO;
import com.quitsmoking.services.interfaces.iRegistrableService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import com.quitsmoking.model.interfaces.iAuthenticatable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Optional;
// import java.util.UUID;

@Service
public class AuthService implements iRegistrableService, UserDetailsService {

    private final UserDAO userDAO;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserDAO userDAO, PasswordEncoder passwordEncoder) {
        this.userDAO = userDAO;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        User user = userDAO.findByEmailOrUsername(identifier)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with identifier: " + identifier));
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                Collections.singleton(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
    }

    public User findByUsername(String identifier) {
        return userDAO.findByEmailOrUsername(identifier)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with identifier: " + identifier));
    }

    @Override
    public User register(String username, String rawPassword, String email, String firstName, String lastName, Role requestedRole) {
        // Kiểm tra dữ liệu đầu vào
        if (username == null || username.trim().isEmpty() ||
                rawPassword == null || rawPassword.isEmpty() ||
                email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Missing required registration fields.");
        }

        // Kiểm tra username hoặc email đã tồn tại
        if (userDAO.findByUsername(username).isPresent()) {
            throw new IllegalArgumentException("Username '" + username + "' already exists.");
        }
        if (userDAO.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email '" + email + "' already exists.");
        }

        // Mã hóa mật khẩu
        String encodedPassword = passwordEncoder.encode(rawPassword);

        // Tạo LocalUser
        LocalUser user = new LocalUser(
                username,
                encodedPassword,
                email,
                firstName != null ? firstName : "",
                lastName != null ? lastName : "",
                Role.MEMBER // Mặc định là MEMBER
        );

        // Lưu vào cơ sở dữ liệu
        return userDAO.save(user);
    }

    public User registerNewUser(RegisterRequest registerRequest) {
        // Gọi phương thức register để tái sử dụng logic
        return register(
                registerRequest.getUsername(),
                registerRequest.getPassword(),
                registerRequest.getEmail(),
                registerRequest.getFirstName(),
                registerRequest.getLastName(),
                Role.MEMBER
        );
    }

    public String encodePassword(String rawPassword) {
        return passwordEncoder.encode(rawPassword);
    }

    public User login(String username, String rawPassword) {
        Optional<User> userOptional = userDAO.findByEmailOrUsername(username);

        if (userOptional.isEmpty()) {
            System.err.println("Login failed: User '" + username + "' not found.");
            return null;
        }

        User user = userOptional.get();

        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            System.err.println("Login failed: Incorrect password for user '" + username + "'.");
            return null;
        }

        if (user instanceof iAuthenticatable) {
            ((iAuthenticatable) user).login();
        } else {
            System.out.println("User " + user.getUsername() + " accessed content.");
        }

        System.out.println("User " + user.getUsername() + " logged in successfully with role: " + user.getRole().name());
        return user;
    }

    public Member upgradeGuestToMember(String userId) {
        Optional<User> userOptional = userDAO.findById(userId);
        if (userOptional.isEmpty()) {
            System.err.println("Upgrade failed: User with ID '" + userId + "' not found.");
            return null;
        }

        User user = userOptional.get();

        if (user.getRole() != Role.GUEST) {
            System.err.println("Upgrade failed: User '" + user.getUsername() + "' is not a GUEST (current role: " + user.getRole().name() + ").");
            return null;
        }

        // Cập nhật vai trò
        user.setRole(Role.MEMBER);
        userDAO.save(user);

        System.out.println("User " + user.getUsername() + " (ID: " + user.getId() + ") successfully upgraded to MEMBER.");
        return (Member) user;
    }

    public User changeUserRole(String userId, Role newRole) {
        Optional<User> userOptional = userDAO.findById(userId);

        if (userOptional.isEmpty()) {
            System.err.println("Change role failed: User with ID '" + userId + "' not found.");
            return null;
        }

        User user = userOptional.get();

        if (user.getRole() == Role.GUEST && newRole != Role.MEMBER) {
            System.err.println("Change role failed: Cannot directly change GUEST to non-MEMBER role via this method.");
            return null;
        }

        user.setRole(newRole);
        User updatedUser = userDAO.save(user);

        System.out.println("User '" + user.getUsername() + "' (ID: " + userId + ") role changed to " + newRole.name() + ".");
        return updatedUser;
    }
}