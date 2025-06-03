// package com.smokingcessation.model;
package com.example.quitsmoking.model;

// Đảm bảo các interface này được import hoặc nằm trong cùng package model
// import com.smokingcessation.model.Authenticatable;
// import com.smokingcessation.model.DashboardDisplayable;
// import com.smokingcessation.model.ProfileManageable;
import jakarta.persistence.Entity;
import jakarta.persistence.DiscriminatorValue;

@Entity
@DiscriminatorValue("COACH")
public class Coach extends User implements iAuthenticatable, iProfileManageable { // Coach cũng cần implements các interface này nếu nó có các khả năng đó

    // Constructor của Coach
    protected Coach() {
        // Constructor mặc định để JPA sử dụng
        super();
    }
    // Thêm tham số 'id' và đảm bảo tên các tham số khớp với User
    public Coach(String id, String userName, String passWord, String email, String firstName, String lastName) {
        // Gọi constructor của lớp cha User, truyền Role.COACH vào tham số cuối cùng
        super(id, userName, passWord, email, firstName, lastName, Role.COACH);
    }

    // --- Triển khai từ Authenticatable ---
    @Override
    public void login() {
        System.out.println("Coach " + getUserName() + " has successfully logged in to their coaching portal.");
    }

    // --- Triển khai từ DashboardDisplayable ---
    @Override
    public void displayDashboard() {
        // Hiển thị dashboard cho Coach
        System.out.println("--- Coach Dashboard ---");
        System.out.println("Welcome, Coach " + getName() + "!");
        System.out.println("- View assigned members' progress.");
        System.out.println("- Manage coaching sessions.");
        System.out.println("- Access coaching resources.");
        System.out.println("-------------------------");
    }

    // Các phương thức riêng của Coach (ví dụ: quản lý member)
    public void viewMemberProgress(String memberId) {
        System.out.println("Coach " + getUserName() + " is viewing progress for member ID: " + memberId);
        // Logic để truy xuất và hiển thị dữ liệu tiến độ của thành viên
    }

    public void assignCourseToMember(String memberId, String courseId) {
        System.out.println("Coach " + getUserName() + " is assigning course " + courseId + " to member ID: " + memberId);
        // Logic để gán khóa học
    }


    @Override
    public String toString() {
        return "Coach{" +
                "id='" + id + '\'' +
                ", userName='" + userName + '\'' +
                ", email='" + email + '\'' +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", role=" + role +
                '}';
    }
}