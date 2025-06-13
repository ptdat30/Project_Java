package com.example.quitsmoking.controllers;

import org.springframework.web.bind.annotation.GetMapping; // Để xử lý yêu cầu GET
import org.springframework.web.bind.annotation.RestController; // Để đánh dấu đây là REST Controller

@RestController // <-- Đánh dấu lớp này là một REST Controller
public class HomeController {

    @GetMapping("/") // <-- Ánh xạ phương thức này tới yêu cầu GET trên URL gốc "/"
    public String home() {
        return "Welcome to Smoking Cessation Application Backend!"; // Trả về một chuỗi đơn giản
    }

    // Bạn có thể thêm các endpoint khác ở đây, ví dụ:
    // @GetMapping("/hello")
    // public String hello() {
    //     return "Hello from Spring Boot!";
    // }
}