package com.example.quitsmoking.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ViewController {
     @GetMapping("/login")
    public String loginPage() {
        return "login.html"; // Tên file HTML trong src/main/resources/static hoặc templates
    }

    @GetMapping("/sign_up")
    public String signUpPage() {
        return "sign_up.html";
    }

    @GetMapping("/reset_pass_1")
    public String resetPass1Page() {
        return "reset_pass_1.html";
    }

    @GetMapping("/reset_pass_2")
    public String resetPass2Page() {
        return "reset_pass_2.html";
    }

    @GetMapping("/success_change")
    public String successChangePage() {
        return "success_change.html";
    }

    // Trang ví dụ sau khi đăng nhập thành công
    @GetMapping("/home")
    public String homePage() {
        return "home.html"; // Bạn sẽ cần tạo file home.html này
    }

    // Chuyển hướng URL gốc đến trang đăng nhập
    @GetMapping("/")
    public String root() {
        return "redirect:/login"; // Chuyển hướng mặc định đến trang đăng nhập
    }
}
