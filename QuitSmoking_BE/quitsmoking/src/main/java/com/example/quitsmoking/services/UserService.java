package com.example.quitsmoking.services;

import com.example.quitsmoking.model.User; // Đảm bảo import lớp User
import com.example.quitsmoking.reponsitories.UserDAO; // Đảm bảo import UserDAO
import org.springframework.stereotype.Service;

import java.util.Optional; // Cần thiết nếu UserDAO trả về Optional

@Service // Đảm bảo lớp này được đánh dấu là Spring Service
public class UserService {

    private final UserDAO userDAO;

    public UserService(UserDAO userDAO) {
        this.userDAO = userDAO;
    }

    // ... (Các phương thức khác của UserService, ví dụ update, delete, v.v.) ...

    /**
     * Lấy thông tin người dùng dựa trên ID của họ.
     *
     * @param userId ID của người dùng.
     * @return Đối tượng User nếu tìm thấy, hoặc null nếu không tìm thấy.
     */
    public User getUserById(String userId) { // <-- THÊM PHƯƠNG THỨC NÀY VÀO ĐÂY
        Optional<User> userOptional = userDAO.findById(userId);
        return userOptional.orElse(null); // Trả về User hoặc null nếu không tìm thấy
        // Hoặc có thể ném UserNotFoundException nếu bạn muốn xử lý lỗi rõ ràng hơn
    }

    // ... (Các phương thức quản lý người dùng khác) ...

    /*
    // Ví dụ các phương thức khác có thể có trong UserService
    public User updateUser(String userId, User updatedUserInfo) {
        Optional<User> existingUserOptional = userDAO.findById(userId);
        if (existingUserOptional.isEmpty()) {
            System.err.println("User not found for update: " + userId);
            return null; // Hoặc ném UserNotFoundException
        }
        User existingUser = existingUserOptional.get();

        // Cập nhật thông tin (ví dụ: email, firstName, lastName)
        existingUser.setEmail(updatedUserInfo.getEmail());
        existingUser.setFirstName(updatedUserInfo.getFirstName());
        existingUser.setLastName(updatedUserInfo.getLastName());
        // Không nên cập nhật mật khẩu ở đây, hãy dùng AuthService cho mật khẩu.
        // Không nên thay đổi vai trò ở đây, hãy dùng AdminService/AuthService cho vai trò.

        return userDAO.save(existingUser); // Lưu lại thay đổi
    }

    public void deleteUser(String userId) {
        // Kiểm tra user có tồn tại không trước khi xóa nếu cần
        if (userDAO.existsById(userId)) {
            userDAO.deleteById(userId);
            System.out.println("User with ID " + userId + " deleted successfully.");
        } else {
            System.err.println("User with ID " + userId + " not found for deletion.");
        }
    }

    public void banUser(String userId) {
        // Có thể thêm logic ban/unban vào đây
        // Ví dụ: user.setActive(false); userDAO.save(user);
        System.out.println("User with ID " + userId + " banned.");
    }
    */
}