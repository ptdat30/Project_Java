package com.quitsmoking.dto.response;

// Đảm bảo bạn có import cho Role enum của mình
// import com.quitsmoking.model.Role; // Hoặc đường dẫn đúng đến enum Role của bạn
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data // Tự động tạo getters, setters, equals, hashCode, toString
@NoArgsConstructor // Tạo constructor không đối số
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String username; // Có thể thêm username nếu muốn hiển thị ở frontend
    private String role; 
    private String userId;      

    // public AuthResponse(String token) {
    //     this.token = token;
    // }

    // public AuthResponse(String token, String userId , String username, String role) { // Constructor mới
    //     this.token = token;
    //     this.userId = userId;
    //     this.username = username;
    //     this.role = role;
    // }

    // // Getters
    // public String getToken() {
    //     return token;
    // }

    // public String getUsername() {
    //     return username;
    // }

    // public String getRole() { // Getter cho Role
    //     return role;
    // }

    // // Setters (nếu cần, nhưng thường không cần cho response DTO)
    // public void setToken(String token) {
    //     this.token = token;
    // }

    // public void setUsername(String username) {
    //     this.username = username;
    // }

    // public void setRole(String role) { // Setter cho Role
    //     this.role = role;
    // }
}