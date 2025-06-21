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
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Collections;
import java.util.Optional;

@Service
public class AuthService implements iRegistrableService, UserDetailsService {

    private final UserDAO userDAO;
    private final PasswordEncoder passwordEncoder;
    
    // Thêm các dependency mới
    @Autowired
    private EmailService emailService;

    @Autowired
    private OtpManagementService otpService;

    public AuthService(UserDAO userDAO, PasswordEncoder passwordEncoder) {
        this.userDAO = userDAO;
        this.passwordEncoder = passwordEncoder;
    }

    // Thêm methods cho reset password
    public void sendPasswordResetOtp(String email) {
        User user = userDAO.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng với email: " + email));
        
        String otp = otpService.generateOtp(email);
        emailService.sendOtpEmail(email, otp);
    }

    public void resetPassword(String email, String otp, String newPassword) {
        if (!otpService.validateOtp(email, otp)) {
            throw new IllegalArgumentException("Mã OTP không hợp lệ hoặc đã hết hạn");
        }
        
        User user = userDAO.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng với email: " + email));
        
        user.setPassword(passwordEncoder.encode(newPassword));
        userDAO.save(user);
    }

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        // Sử dụng phương thức findByEmailOrUsername đã được tạo trong UserDAO
        Optional<User> userOptional = userDAO.findByEmailOrUsername(identifier);

        User user = userOptional.orElseThrow(() -> new UsernameNotFoundException("User not found with identifier: " + identifier));

        // --- ĐIỂM SỬA ĐỔI QUAN TRỌNG NHẤT ---
        // Đảm bảo mật khẩu và vai trò không bao giờ là null
        String password = user.getPassword();
        if (password == null || password.isEmpty()) {
            // Đối với người dùng OAuth2 (Google), họ không có mật khẩu trong DB của bạn.
            // Spring Security vẫn yêu cầu một chuỗi mật khẩu không null.
            // Sử dụng một placeholder hoặc chuỗi rỗng an toàn.
            // Chuỗi "N/A" hoặc "{noop}N/A" thường được dùng, hoặc đơn giản là một chuỗi trống
            password = ""; // Hoặc "{noop}password_placeholder" nếu bạn không muốn mã hóa
        }

        String role = user.getRole() != null ? user.getRole().name() : "USER"; // Đặt vai trò mặc định nếu null

        // Dòng 39 (hoặc tương tự) sẽ nằm ở đây:
        return new org.springframework.security.core.userdetails.User(
            user.getUsername(), // Hoặc user.getEmail() tùy vào cách bạn muốn Spring Security định danh
            password,
            Collections.singleton(new SimpleGrantedAuthority(role))
        );
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

        System.out.println("User " + user.getUsername() + " (ID: " + userId + ") successfully upgraded to MEMBER.");
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