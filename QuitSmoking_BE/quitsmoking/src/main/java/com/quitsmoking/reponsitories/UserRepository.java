package com.quitsmoking.reponsitories;

import com.quitsmoking.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Repository interface cho User entity
 */
@Repository
public interface UserRepository extends JpaRepository<User, String> {

    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByGoogleId(String googleId);
    Optional<User> findById(String id);

    // Sửa phương thức tìm kiếm bằng email hoặc username
    @Query("SELECT u FROM User u WHERE u.email = :identifier OR u.username = :identifier")
    Optional<User> findByEmailOrUsername(String identifier);

    // Phương thức cập nhật vai trò
    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.role = :newRole WHERE u.id = :userId")
    void updateUserRole(String userId, String newRole);

    @Query("SELECT u FROM User u WHERE u.username = :userName")
    User getUserByUsername(String userName);
}