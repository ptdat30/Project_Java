package com.example.quitsmoking.services;

import com.example.quitsmoking.dto.request.AuthRequest;
import com.example.quitsmoking.model.*; // Import tất cả các lớp model của bạn (User, Guest, Member, Admin, Coach, Role)
import com.example.quitsmoking.services.interfaces.iRegistrableService; // Interface RegistrableService (nếu bạn đã di chuyển nó)
// import org.springframework.data.jpa.repository.JpaRepository;
// import org.springframework.stereotype.Repository;
import com.example.quitsmoking.reponsitories.UserDAO; // DAO để truy cập dữ liệu người dùng

import java.util.UUID; // Để tạo ID duy nhất

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

// import java.util.ArrayList;
import java.util.Optional; 
// import org.springframework.security.crypto.password.PasswordEncoder; // Ví dụ dùng Spring Security cho băm mật khẩu

/**
 * AuthService chịu trách nhiệm xử lý các nghiệp vụ liên quan đến
 * đăng ký tài khoản, đăng nhập người dùng và quản lý cơ bản các vai trò.
 */
@Service
public class AuthService implements iRegistrableService, UserDetailsService { // Triển khai interface RegistrableService

    private final UserDAO userDAO;
    
    public AuthService(UserDAO userDAO /*, PasswordEncoder passwordEncoder */) {
        this.userDAO = userDAO;
        // this.passwordEncoder = passwordEncoder;
    }

    public User findByUsername(String username) {
        return userDAO.findByUserName(username) // Giả sử UserDAO có phương thức findByUsername trả về Optional<User>
                  .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Đảm bảo dùng findByUserName khớp với tên thuộc tính trong User.java
        User user = userDAO.findByUserName(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
        // Chuyển đổi đối tượng User của bạn thành UserDetails của Spring Security
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUserName())
                .password(user.getPassWord()) // Mật khẩu đã được mã hóa trong DB
                .roles(user.getRole().name()) // Chuyển Enum sang String
                .build();
    }

    /**
     * Xử lý quá trình đăng ký một tài khoản người dùng mới.
     * Mọi tài khoản đăng ký công khai sẽ ban đầu là vai trò GUEST.
     *
     * @param userName Tên đăng nhập người dùng muốn đăng ký.
     * @param rawPassword Mật khẩu thô (chưa được băm) của người dùng.
     * @param email Email của người dùng.
     * @param firstName Tên.
     * @param lastName Họ.
     * @param requestedRole Vai trò mà người dùng yêu cầu (sẽ được ghi đè thành GUEST cho đăng ký công khai).
     * @return Đối tượng User (Guest) đã được tạo nếu thành công, hoặc null nếu có lỗi.
     */
    @Override
    public User register(String userName, String rawPassword, String email, String firstName, String lastName, Role requestedRole) {
        // // 1. Kiểm tra tính hợp lệ của dữ liệu đầu vào (có thể dùng validation framework)
        // if (userName == null || userName.trim().isEmpty() || rawPassword == null || rawPassword.isEmpty() || email == null || email.trim().isEmpty()) {
        //     System.err.println("Registration failed: Missing required fields.");
        //     return null; // Hoặc ném InvalidInputException
        // }

        // // 2. Kiểm tra xem tên đăng nhập hoặc email đã tồn tại chưa
        // if (userDAO.findByUserName(userName).isPresent()) {
        //     System.err.println("Registration failed: Username '" + userName + "' already exists.");
        //     return null; 
        // }
        // if (userDAO.findByEmail(email).isPresent()) {
        //     System.err.println("Registration failed: Email '" + email + "' already exists.");
        //     return null; 
        // }

        // // 4. Tạo một ID duy nhất cho người dùng mới
        // String id = UUID.randomUUID().toString();

        // // 5. Luôn gán vai trò ban đầu là GUEST cho đăng ký công khai
        // // Role initialRole = Role.GUEST;

        // // 6. Tạo đối tượng Guest mới
        // // Constructor của Guest sẽ gán role là GUEST
        // Guest newGuest = new Guest(id, userName, rawPassword, email, firstName, lastName);// Đang dùng mk chưa dc băm

        // // 7. Lưu người dùng vào cơ sở dữ liệu thông qua DAO
        // userDAO.save(newGuest);

        // System.out.println("User " + userName + " registered successfully as " + newGuest.getRole().getRoleName() + " (ID: " + newGuest.getId() + ").");
        // return newGuest;
        return null; // Chuyển sang phương thức registerNewUser
    }

    public User registerNewUser(AuthRequest registerRequest) {
        // 1. Kiểm tra tính hợp lệ của dữ liệu đầu vào
        if (registerRequest.getUsername() == null || registerRequest.getUsername().trim().isEmpty() ||
            registerRequest.getPassword() == null || registerRequest.getPassword().isEmpty() ||
            registerRequest.getEmail() == null || registerRequest.getEmail().trim().isEmpty()) {
            System.err.println("Registration failed: Missing required fields (username, password, email).");
            // NÊN NÉM MỘT NGOẠI LỆ ĐỂ CONTROLLER CÓ THỂ XỬ LÝ
            throw new IllegalArgumentException("Missing required registration fields.");
        }

        // 2. Kiểm tra xem tên đăng nhập hoặc email đã tồn tại chưa
        if (userDAO.findByUserName(registerRequest.getUsername()).isPresent()) {
            System.err.println("Registration failed: Username '" + registerRequest.getUsername() + "' already exists.");
            throw new IllegalArgumentException("Username '" + registerRequest.getUsername() + "' already exists.");
        }
        if (userDAO.findByEmail(registerRequest.getEmail()).isPresent()) {
            System.err.println("Registration failed: Email '" + registerRequest.getEmail() + "' already exists.");
            throw new IllegalArgumentException("Email '" + registerRequest.getEmail() + "' already exists.");
        }

        // 3. Mã hóa mật khẩu
        // String encodedPassword = passwordEncoder.encode(registerRequest.getPassword()); // SỬ DỤNG PASSWORD ENCODER

        // 4. Tạo một ID duy nhất
        String id = UUID.randomUUID().toString();

        // 5. Tạo đối tượng Guest mới
        // AuthRequest của bạn có thể không có firstName, lastName. Bạn cần đảm bảo DTO phù hợp.
        // Giả sử AuthRequest có getFirstName() và getLastName()
        Guest newGuest = new Guest(id,
                                    registerRequest.getUsername(),
                                //    encodedPassword, // Dùng mật khẩu đã mã hóa
                                    registerRequest.getPassword(), // Minh họa, THAY THẾ BẰNG MÃ HÓA THẬT!
                                    registerRequest.getEmail(),
                                    registerRequest.getFirstName(), // Bạn cần thêm các trường này vào AuthRequest nếu cần
                                    registerRequest.getLastName()); // Bạn cần thêm các trường này vào AuthRequest nếu cần

        // 6. Lưu người dùng vào cơ sở dữ liệu
        userDAO.save(newGuest);

        System.out.println("User " + newGuest.getUserName() + " registered successfully as " + newGuest.getRole().getRoleName() + " (ID: " + newGuest.getId() + ").");
        return newGuest;
    }

    /**
     * Xử lý quá trình đăng nhập người dùng.
     *
     * @param userName Tên đăng nhập của người dùng.
     * @param rawPassword Mật khẩu thô mà người dùng nhập vào.
     * @return Đối tượng User đã đăng nhập nếu xác thực thành công, hoặc null nếu thất bại.
     */
    // Phương thức này có thể được định nghĩa trong một interface AuthenticatableService riêng biệt
    public User login(String userName, String rawPassword) {
        // 1. Tìm người dùng trong cơ sở dữ liệu bằng username
        Optional<User> userOptional = userDAO.findByUserName(userName);

        if (userOptional.isEmpty()) { // KIỂM TRA OPTIONAL CÓ RỖNG KHÔNG
            System.err.println("Login failed: User '" + userName + "' not found.");
            return null;
        }
        User user = userOptional.get(); // LẤY USER TỪ OPTIONAL

        // 2. Xác thực mật khẩu
        // Bạn sẽ so sánh mật khẩu thô sau khi băm với mật khẩu đã băm trong DB
        // boolean passwordMatches = passwordEncoder.matches(rawPassword, user.getPassWord());
        boolean passwordMatches = user.getPassWord().equals(rawPassword + "_hashed"); // Minh họa, THAY THẾ BẰNG BĂM THẬT!

        if (!passwordMatches) {
            System.err.println("Login failed: Incorrect password for user '" + userName + "'.");
            return null; // Hoặc ném InvalidCredentialsException
        }

        // 3. (Tùy chọn) Kiểm tra trạng thái tài khoản (ví dụ: đã kích hoạt, không bị khóa)
        // if (!user.isActive()) {
        //     System.err.println("Login failed: Account is inactive.");
        //     return null;
        // }

        // 4. Nếu xác thực thành công, thực hiện hành vi login của đối tượng (nếu có)
        if (user instanceof iAuthenticatable) {
            ((iAuthenticatable) user).login(); // Ví dụ: Admin/Member/Coach in thông báo login riêng
        } else {
            // Đối với Guest sau khi đăng nhập, nếu vẫn là Guest, có thể thông báo cần nâng cấp
            System.out.println("Guest " + user.getUserName() + " accessed public content. Please upgrade to Member for full features.");
        }

        // 5. Trong ứng dụng web thực tế:
        //    - Tạo và trả về một JWT (JSON Web Token) cho frontend
        //    - Hoặc quản lý session trên server
        System.out.println("User " + user.getUserName() + " logged in successfully with role: " + user.getRole().getRoleName() + ".");
        return user;
    }

    /**
     * Nâng cấp vai trò của một người dùng từ GUEST lên MEMBER sau khi thanh toán thành công.
     *
     * @param userId ID của người dùng cần nâng cấp.
     * @return Đối tượng Member đã được nâng cấp nếu thành công, hoặc null nếu không thành công.
     */
    public Member upgradeGuestToMember(String userId) {
        // 1. Tìm người dùng bằng ID
        Optional<User> userOptional = userDAO.findById(userId);
        if (userOptional.isEmpty()) { // Kiểm tra rỗng
            System.err.println("Upgrade failed: User with ID '" + userId + "' not found.");
            return null;
        }
        
        User user = userOptional.get(); 

        if (user.getRole() != Role.GUEST) {
            System.err.println("Upgrade failed: User '" + user.getUserName() + "' is not a GUEST (current role: " + user.getRole().getRoleName() + ").");
            return null;
        }

        // 3. Tạo một đối tượng Member mới từ thông tin của Guest
        // Điều này đảm bảo rằng đối tượng đã có đúng kiểu và vai trò.
        Member newMember = new Member(
            user.getId(),
            user.getUserName(),
            user.getPassWord(), // Mật khẩu đã băm từ khi đăng ký
            user.getEmail(),
            user.getFirstName(),
            user.getLastName()
            // Constructor của Member sẽ tự động gán Role.MEMBER
        );


        System.out.println("User " + user.getUserName() + " (ID: " + user.getId() + ") successfully upgraded to MEMBER.");
        return newMember;
    }

    /**
     * Thay đổi vai trò của một người dùng hiện có (chỉ dành cho Admin).
     *
     * @param userId ID của người dùng cần thay đổi vai trò.
     * @param newRole Vai trò mới (ví dụ: COACH, ADMIN).
     * @return Đối tượng User đã được cập nhật vai trò, hoặc null nếu thất bại.
     */
    public User changeUserRole(String userId, Role newRole) {
        // 1. Tìm người dùng
        Optional<User> userOptional = userDAO.findById(userId);

        if (userOptional.isEmpty()) { // Sử dụng .isEmpty() để kiểm tra Optional rỗng
            System.err.println("Change role failed: User with ID '" + userId + "' not found.");
            return null; // Hoặc ném UserNotFoundException
        }

        User user = userOptional.get(); // Lấy đối tượng User từ Optional

        // 2. Ngăn chặn thay đổi vai trò của GUEST nếu đây là logic của admin (được handle bởi upgradeGuestToMember)
        if (user.getRole() == Role.GUEST && newRole != Role.MEMBER) {
            System.err.println("Change role failed: Cannot directly change GUEST to non-MEMBER role via this method.");
            return null;
        }
        // Có thể thêm logic kiểm tra: Admin không thể hạ cấp chính mình, Admin không thể thay đổi vai trò của Admin khác nếu không có quyền cao hơn, v.v.
        user.setRole(newRole);
        
        User updatedUser = userDAO.save(user); // Lưu cập nhật vào cơ sở dữ liệu

        System.out.println("User '" + user.getUserName() + "' (ID: " + userId + ") role changed from " + user.getRole().getRoleName() + " to " + newRole.getRoleName() + ".");
        return updatedUser; // Trả về đối tượng User đã được cập nhật
    }
}