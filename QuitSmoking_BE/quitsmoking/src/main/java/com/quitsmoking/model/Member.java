package com.quitsmoking.model;
import jakarta.persistence.Entity;
import jakarta.persistence.DiscriminatorValue;
// import jakarta.persistence.Column;

@Entity 
@DiscriminatorValue("MEMBER") 
public class Member extends User implements iAuthenticatable {

    protected Member() {
        // Constructor mặc định để JPA sử dụng
        super();
        this.setRole(Role.MEMBER);
    }

    public Member(String id, String username, String password, String email, String firstName, String lastName) {
        super(id, username, password, email, firstName, lastName, Role.MEMBER);
    }

    @Override
    public void login() {
        // Logic đăng nhập thành công
        System.out.println("Member " + getUsername() + " logged in successfully.");
    }

    @Override
    public Role getRole() {
        return super.getRole();
    }

    
}
