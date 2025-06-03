package com.example.quitsmoking.services;

// import com.smokingcessation.model.Admin; // Import Admin nếu bạn cần kiểm tra quyền của admin
import com.example.quitsmoking.model.Role;
import com.example.quitsmoking.model.User;
import com.example.quitsmoking.reponsitories.UserDAO; // Tiêm UserDAO
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service // Đánh dấu đây là một Spring Service
public class AdminService {

    private final UserDAO userDAO;
    private final AuthService authService; // Tiêm AuthService vào AdminService
    private final UserService userService; // Tiêm UserService vào AdminService

    // Constructor để tiêm các dependencies
    public AdminService(UserDAO userDAO, AuthService authService, UserService userService) {
        this.userDAO = userDAO;
        this.authService = authService;
        this.userService = userService;
    }

    // Phương thức để Admin tạo tài khoản mới
    public User createAccountByAdmin(String adminId, String username, String rawPassword, String email, String firstName, String lastName, Role role) {
        // Logic kiểm tra quyền của Admin (ví dụ: tìm adminId, kiểm tra role = ADMIN)
        Optional<User> adminUserOptional = userDAO.findById(adminId);
        if (adminUserOptional.isEmpty() || adminUserOptional.get().getRole() != Role.ADMIN) {
            System.err.println("Permission denied: Only Admin can create accounts.");
            return null; // Hoặc ném AccessDeniedException
        }

        // Gọi AuthService để đăng ký tài khoản (AuthService chứa logic đăng ký cơ bản)
        // Lưu ý: Có thể cần điều chỉnh phương thức register của AuthService để chấp nhận vai trò
        // hoặc tạo một phương thức riêng trong AuthService cho admin tạo user.
        return authService.register(username, rawPassword, email, firstName, lastName, role);
    }

    // Phương thức để Admin thay đổi vai trò của người dùng
    public boolean changeUserRoleByAdmin(String adminId, String targetUserId, Role newRole) {
        // Logic kiểm tra quyền của Admin
        Optional<User> adminUserOptional = userDAO.findById(adminId);
        if (adminUserOptional.isEmpty() || adminUserOptional.get().getRole() != Role.ADMIN) {
            System.err.println("Permission denied: Only Admin can change user roles.");
            return false; // Hoặc ném AccessDeniedException
        }

        // Gọi AuthService để thay đổi vai trò
        User updatedUser = authService.changeUserRole(targetUserId, newRole);
        return updatedUser != null;
    }

    // Các phương thức quản lý người dùng khác mà Admin có thể làm
    public User viewUserDetails(String adminId, String targetUserId) {
        // Kiểm tra quyền admin
        // ...
        return userService.getUserById(targetUserId); // Gọi UserService để lấy chi tiết
    }

    // public void updateUserDetails(String adminId, String targetUserId, User updatedUserInfo) { ... }
    // public void deleteUser(String adminId, String targetUserId) { ... }
    // public void resetUserPassword(String adminId, String targetUserId) { ... }
    // public void banUser(String adminId, String targetUserId) { ... }
}