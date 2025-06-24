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

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import com.quitsmoking.model.interfaces.iAuthenticatable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.slf4j.Logger; 
import org.slf4j.LoggerFactory;
import com.quitsmoking.config.JwtUtil;

import java.util.Collections;
import java.util.regex.Pattern;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService implements iRegistrableService, UserDetailsService {
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class); // Khởi tạo logger

    private final UserDAO userDAO;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

        // Thêm các dependency mới
    @Autowired
    private EmailService emailService;

    @Autowired
    private OtpManagementService otpService;

    public AuthService(UserDAO userDAO, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userDAO = userDAO;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
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
        Optional<User> userOptional = userDAO.findByEmailOrUsername(identifier);

        if (userOptional.isEmpty()) {
            if (isValidUUID(identifier)) {
                userOptional = userDAO.findByIdWithMembership(identifier);
            }
        }

        User user = userOptional.orElseThrow(() -> new UsernameNotFoundException("User not found with identifier: " + identifier));

        logger.info("AuthService: Successfully loaded user details for '{}'. User ID: {}, Role: {}", identifier, user.getId(), user.getRole().name());
        return user; 
    }

    // Hàm kiểm tra xem một chuỗi có phải là UUID hợp lệ hay không
    private boolean isValidUUID(String str) {
        try {
            UUID.fromString(str);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
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
        Optional<User> userOpt = userDAO.findByGoogleId(googleId);
        User user;
        if (userOpt.isPresent()) {
            user = userOpt.get();
            
    
            // Chỉ cập nhật nếu trường đó đang null/rỗng
            if (user.getFirstName() == null || user.getFirstName().isEmpty()) {
                user.setFirstName(firstName);
            }
            if (user.getLastName() == null || user.getLastName().isEmpty()) {
                user.setLastName(lastName);
            }
            if (user.getPictureUrl() == null || user.getPictureUrl().isEmpty()) {
                user.setPictureUrl(pictureUrl);
            }
            // Có thể cập nhật googleId/email nếu muốn
            user.setGoogleId(googleId);
            user.setEmail(email);
            userDAO.save(user);
        } else {
            // Tạo user mới từ Google info
            user = new GoogleUser(email, firstName, lastName, googleId, pictureUrl, AuthProvider.GOOGLE, Role.MEMBER);
            userDAO.save(user);
        }
        return user;
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
    public String generateJwtToken(User user) {
        return jwtUtil.generateToken(user);
    }
}