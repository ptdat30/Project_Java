package com.quitsmoking.model;

import jakarta.persistence.Entity;
import jakarta.persistence.DiscriminatorValue;

@Entity
@DiscriminatorValue("ADMIN")
public class Admin extends User implements iAuthenticatable, iProfileManageable, iUserManageable {

    protected Admin() {
        // Constructor mặc định để JPA sử dụng
        super();
        this.setRole(Role.ADMIN); // Đặt vai trò là ADMIN
    }
    
    public Admin(String id, String username, String password, String email, String firstName, String lastName) {
        // Gọi constructor của lớp cha User, truyền Role.ADMIN vào tham số cuối cùng
        super(id, username, password, email, firstName, lastName, Role.ADMIN);
        // this.authService = authService;
        // this.userService = userService;
    }

    @Override
    public void login() {
        System.out.println("Admin " + getUsername() + " has successfully logged in to the administration panel.");
    }

    // --- Triển khai phương thức từ ProfileManageable ---
    @Override
    public void displayDashboard() {
        System.out.println("Displaying admin dashboard for " + getUsername());
        // Logic để hiển thị dashboard cho Admin
        // Có thể bao gồm các thông tin quản lý người dùng, báo cáo, v.v.
    }

    @Override
    public String toString() {
        return "Admin{" +
                "username='" + username + '\'' +
                ", email='" + email + '\'' +
                ", firstname='" + firstName + '\'' +
                ", lastname='" + lastName + '\'' +
                ", role=" + role +
                '}';
    }
    
    @Override
    public void viewUserDetails(String userId) {
        System.out.println("Admin " + getUsername() + " is viewing details for user ID: " + userId);
        // Gọi userService.getUserById(userId);
    }

    @Override
    public void updateUserDetails(String userId, User updatedUser) {
        System.out.println("Admin " + getUsername() + " is updating user ID: " + userId);
        // Gọi userService.updateUser(userId, updatedUser);
    }

    @Override
    public void deleteUser(String userId) {
        System.out.println("Admin " + getUsername() + " is deleting user ID: " + userId);
        // Gọi userService.deleteUser(userId);
    }

    @Override
    public void resetUserPassword(String userId) {
        System.out.println("Admin " + getUsername() + " is resetting password for user ID: " + userId);
        // Gọi authService.resetPassword(userId);
    }

    @Override
    public void banUser(String userId) {
        System.out.println("Admin " + getUsername() + " is banning user ID: " + userId);
        // Gọi userService.banUser(userId);
    }

    @Override
    public User createUserAccount(String username, String rawPassword, String email, String firstName, String lastName, Role role) {
        System.out.println("Admin " + getUsername() + " is creating new user account with role: " + role.getRoleName());
        return null;
    }

    @Override
    public boolean changeUserRole(String userId, Role newRole) {
        System.out.println("Admin " + getUsername() + " is changing role for user ID: " + userId + " to " + newRole.getRoleName());
        return false;
    }
}
