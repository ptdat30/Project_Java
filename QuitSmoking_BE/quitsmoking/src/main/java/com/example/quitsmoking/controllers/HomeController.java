package com.example.quitsmoking.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    // Đối với các "trang" như đăng nhập hoặc đăng ký, một API có thể trả về trạng thái
    // hoặc một thông báo đơn giản cho biết thành công/thất bại của một hành động.
    // Nếu đây thực sự là các trang tĩnh, frontend sẽ xử lý việc định tuyến.


    @PostMapping({"/login","/"})
    public ResponseEntity<String> loginPage() {
        return new ResponseEntity<>("Đã truy cập điểm cuối đăng nhập.", HttpStatus.OK);
    }

    @GetMapping("/sign_up")
    public ResponseEntity<String> signUpPage() {
        return new ResponseEntity<>("Đã truy cập điểm cuối đăng ký.", HttpStatus.OK);
    }

    @GetMapping("/reset_pass_1")
    public ResponseEntity<String> resetPass1Page() {
        return new ResponseEntity<>("Đã truy cập điểm cuối đặt lại mật khẩu bước 1.", HttpStatus.OK);
    }

    @GetMapping("/reset_pass_2")
    public ResponseEntity<String> resetPass2Page() {
        return new ResponseEntity<>("Đã truy cập điểm cuối đặt lại mật khẩu bước 2.", HttpStatus.OK);
    }

    @GetMapping("/success_change")
    public ResponseEntity<String> successChangePage() {
        return new ResponseEntity<>("Đã thay đổi mật khẩu thành công.", HttpStatus.OK);
    }

    @GetMapping("/home")
    public ResponseEntity<String> homePage() {
        return new ResponseEntity<>("Chào mừng đến với trang chủ (dữ liệu API sẽ ở đây).", HttpStatus.OK);
    }



}