package com.quitsmoking.model;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorColumn; // Cần thiết cho SINGLE_TABLE
import jakarta.persistence.DiscriminatorType; // Cần thiết cho SINGLE_TABLE
import jakarta.persistence.Entity; // <-- QUAN TRỌNG: Đánh dấu là Entity
import jakarta.persistence.EnumType; // Để ánh xạ Enum
import jakarta.persistence.Enumerated; // Để ánh xạ Enum
import jakarta.persistence.Id; // <-- QUAN TRỌNG: Khóa chính
import jakarta.persistence.Inheritance; // Cấu hình kế thừa
import jakarta.persistence.InheritanceType; // Cấu hình kế thừa
import jakarta.persistence.Table; // Để đặt tên bảng (tùy chọn)
import java.util.Collection; 
import java.util.Collections; 
// import jakarta.persistence.GeneratedValue; // Tùy chọn: Để tự động tạo ID
// import jakarta.persistence.GenerationType; // Tùy chọn: Loại tạo ID
// import jakarta.persistence.DiscriminatorValue; // Cần thiết cho SINGLE_TABLE trên các lớp con

// Import Lombok nếu bạn đang sử dụng nó để tự động tạo getter/setter/constructor
// import lombok.Data; // Bao gồm @Getter, @Setter, @RequiredArgsConstructor, @ToString, @EqualsAndHashCode
// import lombok.NoArgsConstructor; // Constructor không đối số
// import lombok.AllArgsConstructor; // Constructor với tất cả các đối số

@Entity // <-- Đánh dấu lớp này là một thực thể JPA
@Table(name = "users") // <-- Ánh xạ lớp này tới bảng có tên "users" trong cơ sở dữ liệu
@Inheritance(strategy = InheritanceType.SINGLE_TABLE) // <-- Sử dụng chiến lược một bảng cho tất cả các lớp con
@DiscriminatorColumn(name = "user_type", discriminatorType = DiscriminatorType.STRING) // <-- Thêm cột "user_type" để phân biệt loại người dùng
public abstract class User implements UserDetails { // Abstract vì bạn sẽ không tạo trực tiếp đối tượng User

    @Id
    @Column(name = "id", unique = true, nullable = false)
    protected String id;

    @Column(name = "username", unique = true, nullable = false) 
    protected String username; 

    @Column(name = "password", nullable = false)
    protected String password; 

    @Column(name = "email", unique = true, nullable = false)
    protected String email;

    @Column(name = "first_name")
    protected String firstName;

    @Column(name = "last_name")
    protected String lastName;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    protected Role role;

    protected User() {
        // Constructor mặc định cần thiết cho JPA
    }

    public User(String id, String username, String password, String email, String firstName, String lastName, Role role) {
        this.id = id;
        this.username = username; 
        this.password = password; 
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
    }

    // Getters and Setters
    // (Nếu dùng Lombok, bạn có thể xóa tất cả các getter/setter này và dùng @Data hoặc @Getter/@Setter)
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    @Override // BẮT BUỘC từ UserDetails
    public String getPassword() { return password; } // Trả về trường 'password'
    public void setPassword(String password) { this.password = password; }

    @Override // BẮT BUỘC từ UserDetails
    public String getUsername() { return username; } // Trả về trường 'username'
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getName() { return firstName + " " + lastName; }
    public Role getRole() { return this.role; }
    public void setRole(Role role) { this.role = role; }


    public boolean verifypassWord(String rawPassWord) {
        // Trong ứng dụng thực tế, bạn sẽ sử dụng PasswordEncoder ở đây!
        // return passwordEncoder.matches(rawPassWord, this.passWord);
        return this.password.equals(rawPassWord);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Trả về một Collection các quyền/vai trò của người dùng.
        // Trong trường hợp đơn giản, bạn có thể chỉ có một vai trò cho mỗi người dùng.
        // "ROLE_" là tiền tố tiêu chuẩn mà Spring Security mong đợi cho các vai trò.
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + this.role.name()));
    }

    @Override
    public boolean isAccountNonExpired() {
        // Trả về true nếu tài khoản không hết hạn (luôn true trừ khi bạn có logic quản lý hết hạn)
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        // Trả về true nếu tài khoản không bị khóa (luôn true trừ khi bạn có logic khóa tài khoản)
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        // Trả về true nếu thông tin đăng nhập (mật khẩu) không hết hạn (luôn true trừ khi bạn có logic đổi mật khẩu định kỳ)
        return true;
    }

    @Override
    public boolean isEnabled() {
        // Trả về true nếu tài khoản được kích hoạt (luôn true trừ khi bạn có logic kích hoạt tài khoản)
        return true;
    }
}