// Đây là interface thể hiện các phương thức cần thiết để quản lý hồ sơ người dùng trong hệ thống.
package com.example.quitsmoking.model;

public interface iProfileManageable {
    /**
     * Phương thức này chịu trách nhiệm hiển thị giao diện dashboard chính
     * cho thực thể. Việc triển khai cụ thể sẽ phụ thuộc vào vai trò của thực thể
     * và thông tin cần hiển thị.
     */
    void displayDashboard();
}
