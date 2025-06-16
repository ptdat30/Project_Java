package com.quitsmoking.controllers;

import com.quitsmoking.model.User;
import com.quitsmoking.reponsitories.UserDAO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = {"http://localhost:4173", "http://localhost:3000", "http://localhost:5173"})
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);
    private final UserDAO userDAO;

    @Autowired
    public UserController(UserDAO userDAO) {
        this.userDAO = userDAO;
    }

    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()") // Yêu cầu người dùng phải được xác thực để truy cập
    @Transactional
    public ResponseEntity<?> getUserProfile() {
        try {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

            String identifier; // Đây sẽ là username hoặc email mà người dùng đã dùng để đăng nhập
            if (principal instanceof UserDetails) {
                identifier = ((UserDetails) principal).getUsername();
            } else if (principal instanceof User) {
                // Nếu bạn đã tùy chỉnh Spring Security để Principal là User entity của bạn
                // và ID là định danh chính, thì sử dụng getId().
                // Nếu UserDetails vẫn trả về username/email, thì hãy giữ nguyên logic UserDetails.
                identifier = ((User) principal).getId(); // Chỉ dùng nếu User.getId() khớp với Principal.getName()
            } else {
                logger.warn("Unexpected principal type: {}", principal.getClass().getName());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Không thể xác định người dùng đã xác thực."));
            }

            // --- ĐIỂM CHỈNH SỬA QUAN TRỌNG NHẤT ---
            // SỬ DỤNG findByEmailOrUsername CỦA BẠN!
            User user = userDAO.findByEmailOrUsername(identifier)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng với định danh: " + identifier));

            // Tạo Map chứa thông tin profile
            Map<String, Object> profile = new HashMap<>();
            profile.put("id", user.getId());
            profile.put("username", user.getUsername());
            profile.put("email", user.getEmail());
            profile.put("firstName", user.getFirstName());
            profile.put("lastName", user.getLastName());
            profile.put("role", user.getRole().name());
            profile.put("pictureUrl", user.getPictureUrl());

            // Thêm các trường khác nếu cần, ví dụ:
            // profile.put("membershipPlan", user.getMembershipPlan() != null ? user.getMembershipPlan().name() : null);
            // profile.put("membershipEndDate", user.getMembershipEndDate());

            logger.info("Đã lấy thành công profile người dùng: {}", user.getUsername());
            return ResponseEntity.ok(profile);

        } catch (UsernameNotFoundException e) {
            logger.warn("Yêu cầu profile người dùng nhưng không tìm thấy: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            logger.error("Lỗi khi lấy profile người dùng đã xác thực: {}", e.getMessage(), e);
            // Log chi tiết lỗi (stack trace) để dễ debug hơn
            e.printStackTrace(); // In stack trace ra console/log
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Đã xảy ra lỗi nội bộ khi lấy profile người dùng. Vui lòng thử lại sau."));
        }
    }
}