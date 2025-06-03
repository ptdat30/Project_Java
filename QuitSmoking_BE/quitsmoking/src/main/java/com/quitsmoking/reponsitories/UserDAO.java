package com.quitsmoking.reponsitories;

// import com.smokingcessation.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.quitsmoking.model.User;

import java.util.Optional;

@Repository // Đánh dấu đây là một Spring Data Repository
public interface UserDAO extends JpaRepository<User, String> { // Kế thừa JpaRepository cho CRUD cơ bản

    Optional<User> findByUsername(String username); // Spring Data JPA tự tạo phương thức này
    Optional<User> findByEmail(String email); // Tìm kiếm theo email
    Optional<User> findById(String id); // Tìm kiếm theo ID

    // Phương thức để cập nhật vai trò (ví dụ: sau khi Guest thanh toán)
    // Bạn cần @Modifying và @Transactional nếu không dùng save() cho việc update
    // @Modifying
    // @Transactional
    // @Query("UPDATE User u SET u.role = ?2 WHERE u.id = ?1")
    // int updateUserRole(String userId, Role newRole);
}
