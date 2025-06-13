package com.quitsmoking.services;

import com.quitsmoking.dto.request.RegisterRequest;
import com.quitsmoking.model.*;
import com.quitsmoking.reponsitories.UserDAO;
import com.quitsmoking.services.interfaces.iRegistrableService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import com.quitsmoking.exceptions.EmailAlreadyExistsException; 
import com.quitsmoking.exceptions.UserAlreadyExistsException;
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
            throw new UserAlreadyExistsException("Ten dang nhap '" + username + "' da ton tai.");
        }
        if (userDAO.findByEmail(email).isPresent()) {
            throw new EmailAlreadyExistsException("Email '" + email + "' da duoc su dung.");
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
                Role.GUEST // Mặc định là GUEST
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
                Role.GUEST
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

    public User processGoogleLogin(String email, String firstName, String lastName, String googleId, String pictureUrl) {
        Optional<User> existingUser = userDAO.findByGoogleId(googleId);
        User user;

        if (existingUser.isPresent()) {
            user = existingUser.get();
            // Cập nhật thông tin người dùng Google hiện có
            user.setEmail(email);
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setPictureUrl(pictureUrl);
            user.setAuthProvider(AuthProvider.GOOGLE);
            // GoogleId không cần cập nhật vì nó là key chính để tìm
            System.out.println("Đã tìm thấy và cập nhật người dùng Google hiện có: " + user.getEmail());
        } else {
            // Kiểm tra email đã tồn tại với tài khoản LOCAL
            Optional<User> existingUserByEmail = userDAO.findByEmail(email);
            if (existingUserByEmail.isPresent()) {
                user = existingUserByEmail.get();
                if (user.getAuthProvider().equals(AuthProvider.LOCAL)) {
                    // Liên kết tài khoản Local hiện có với Google
                    user.setFirstName(firstName);
                    user.setLastName(lastName);
                    user.setPictureUrl(pictureUrl);
                    user.setGoogleId(googleId); // Cập nhật GoogleId
                    user.setAuthProvider(AuthProvider.GOOGLE); // Cập nhật AuthProvider
                    System.out.println("Da lien ket nguoi dung hien co voi Google: " + user.getEmail());
                } else {
                    // Nếu email đã đăng ký với nhà cung cấp khác (không phải LOCAL và không phải GoogleId hiện tại)
                    throw new EmailAlreadyExistsException("Email '" + email + "' da dang ky voi tai khoan " +
                            user.getAuthProvider() + ". Vui long su dung tai khoan " + user.getAuthProvider() +
                            " cua ban de dang nhap.");
                }
            } else {
                // Tạo GoogleUser mới
                user = new GoogleUser(
                        email,
                        firstName,
                        lastName,
                        googleId,
                        pictureUrl,
                        AuthProvider.GOOGLE,
                        Role.GUEST // Mặc định là GUEST cho người dùng mới qua Google
                );
                System.out.println("Da tao nguoi dung Google moi: " + user.getEmail());
            }
        }
        return userDAO.save(user); // Lưu hoặc cập nhật người dùng
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