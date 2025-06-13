package com.example.quitsmoking.model;

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
public abstract class User { // Abstract vì bạn sẽ không tạo trực tiếp đối tượng User

    @Id // <-- Đánh dấu trường này là khóa chính
    // Nếu bạn muốn ID được tạo tự động (ví dụ, là UUID), bạn có thể dùng @GeneratedValue
    // @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", unique = true, nullable = false) // Tên cột trong DB và ràng buộc
    protected String id; // ID kiểu String

    @Column(name = "username", unique = true, nullable = false)
    protected String userName;

    @Column(name = "password", nullable = false)
    protected String passWord;

    @Column(name = "email", unique = true, nullable = false)
    protected String email;

    @Column(name = "first_name") // Sử dụng snake_case cho tên cột trong DB
    protected String firstName;

    @Column(name = "last_name") // Sử dụng snake_case cho tên cột trong DB
    protected String lastName;

    @Enumerated(EnumType.STRING) // <-- Lưu trữ Enum Role dưới dạng chuỗi trong DB
    @Column(name = "role", nullable = false)
    protected Role role;

    // JPA yêu cầu một constructor không đối số (default constructor).
    // Nếu dùng Lombok, bạn có thể dùng @NoArgsConstructor.
    protected User() {
        // Constructor mặc định cần thiết cho JPA
    }

    public User(String id, String userName, String passWord, String email, String firstName, String lastName, Role role) {
        this.id = id;
        this.userName = userName;
        this.passWord = passWord;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
    }

    // Getters and Setters
    // (Nếu dùng Lombok, bạn có thể xóa tất cả các getter/setter này và dùng @Data hoặc @Getter/@Setter)
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getPassWord() { return passWord; }
    public void setPassWord(String passWord) { this.passWord = passWord; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
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
        return this.passWord.equals(rawPassWord);
    }
}