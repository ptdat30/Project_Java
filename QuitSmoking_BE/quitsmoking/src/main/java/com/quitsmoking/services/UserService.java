package com.quitsmoking.services;

import org.springframework.stereotype.Service;
import org.springframework.security.core.userdetails.UserDetailsService; // <-- THÊM DÒNG IMPORT NÀY
import org.springframework.security.core.userdetails.UserDetails; // <-- THÊM DÒNG IMPORT NÀY
import org.springframework.security.core.userdetails.UsernameNotFoundException; // <-- THÊM DÒNG IMPORT NÀY


import com.quitsmoking.model.User; // Class User của bạn
import com.quitsmoking.reponsitories.UserDAO; // Repository của bạn

import java.util.Optional;


@Service
public class UserService implements UserDetailsService { // <-- THÊM 'implements UserDetailsService' VÀO ĐÂY

    private final UserDAO userDAO;

    public UserService(UserDAO userDAO) {
        this.userDAO = userDAO;
    }

    // <-- ĐÂY LÀ PHƯƠNG THỨC BẮT BUỘC KHI IMPLEMENT UserDetailsService -->
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Tìm người dùng trong cơ sở dữ liệu bằng username
        User user = userDAO.findByUsername(username)
                           .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));

        // Chuyển đổi đối tượng User của bạn sang đối tượng UserDetails của Spring Security.
        // org.springframework.security.core.userdetails.User là một implementation tiện lợi của UserDetails.
        return new org.springframework.security.core.userdetails.User(
            user.getUsername(),              // Username
            user.getPassword(),              // Mật khẩu (đã được mã hóa)
            user.getAuthorities()            // Danh sách các quyền/vai trò (GrantedAuthority) của người dùng
        );
    }

    /**
     * Lấy thông tin người dùng dựa trên ID của họ.
     *
     * @param userId ID của người dùng.
     * @return Đối tượng User nếu tìm thấy, hoặc null nếu không tìm thấy.
     */
    public User getUserById(String userId) {
        Optional<User> userOptional = userDAO.findById(userId);
        return userOptional.orElse(null);
    }

    // ... (Các phương thức quản lý người dùng khác của bạn) ...
}