package com.example.quitsmoking.model;
import jakarta.persistence.Entity;
import jakarta.persistence.DiscriminatorValue;
// import jakarta.persistence.Column;

@Entity // <-- Đánh dấu đây là một Entity
@DiscriminatorValue("MEMBER") // <-- Giá trị cho cột 'user_type' trong bảng 'users'
public class Member extends User implements iAuthenticatable {

    protected Member() {
        // Constructor mặc định để JPA sử dụng
        super();
    }

    public Member(String id, String userName, String passWord, String email, String firstName, String lastName) {
        super(id, userName, passWord, email, firstName, lastName, Role.MEMBER);
    }

    @Override
    public void login() {
        // Logic đăng nhập thành công
        System.out.println("Member " + getUserName() + " logged in successfully.");
    }

    @Override
    public Role getRole() {
        return super.getRole();
    }

    
}
