package com.example.quitsmoking.model;

import jakarta.persistence.Entity;
import jakarta.persistence.DiscriminatorValue;

@Entity // <-- Đánh dấu đây là một Entity
@DiscriminatorValue("GUEST") // <-- Giá trị cho cột 'user_type' trong bảng 'users'
public class Guest extends User implements  iProfileManageable, iAuthenticatable{

    protected Guest() {
        // Constructor mặc định để JPA sử dụng
        super();
    }
    
    public Guest(String id, String userName, String passWord, String email, String firstName, String lastName) {
        // Gọi constructor của lớp cha User, truyền Role.COACH vào tham số cuối cùng
        super(id, userName, passWord, email, firstName, lastName, Role.GUEST);
    }


    // --- Triển khai từ ProfileManageable ---
    @Override
    public void login() {
        System.out.println("Guest " + getUserName() + " has successfully logged in.");
    }

    @Override
    public void displayDashboard() {
        // Hiển thị dashboard cho Guest
        System.out.println("--- Guest Dashboard ---");
        System.out.println("Welcome, Guest " + getName() + "!");
        System.out.println("- Explore available courses.");
        System.out.println("- Register for an account to access more features.");
        System.out.println("-------------------------");
    }

    // --- Triển khai từ Registrable ---
    @Override
    public String toString(){
        return "Guest{" +
                "id='" + id + '\'' +
                ", userName='" + userName + '\'' +
                ", email='" + email + '\'' +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", role=" + role +
                '}';
    }
}
