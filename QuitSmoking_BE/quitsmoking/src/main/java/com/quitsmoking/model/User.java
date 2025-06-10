package com.quitsmoking.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "users") // Tên bảng trong MySQL
@Data // Lombok: Generates getters, setters, toString, equals, and hashCode
@NoArgsConstructor // Lombok: Generates no-argument constructor
@AllArgsConstructor // Lombok: Generates constructor with all fields
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    // --- Bổ sung trường password ---
    // Trường này là cần thiết cho đăng nhập truyền thống (email/password)
    // Nếu bạn chỉ dùng OAuth2, hãy xem Giải pháp 2
    @Column(nullable = true) // Có thể nullable nếu người dùng chỉ đăng nhập qua OAuth2
    private String password; // Mật khẩu đã được mã hóa

    private String name;
    private String picture; // URL ảnh đại diện từ Google
    private String provider; // Ví dụ: "google"
    private String providerId; // ID duy nhất từ nhà cung cấp (Google ID)

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role; // Quan hệ với bảng Roles

    // Thêm các trường khác tùy theo lược đồ Users của bạn nếu cần
    // Ví dụ: private String phone;
    // Ví dụ: private Date dateOfBirth;
}