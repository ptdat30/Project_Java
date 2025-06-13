package com.quitsmoking.controllers;

import com.quitsmoking.dto.request.QuitPlanRequest;
import com.quitsmoking.dto.response.QuitPlanResponse;
import com.quitsmoking.services.QuitPlanService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.prepost.PreAuthorize; // Để phân quyền
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/quit-plans") // Base URL cho các API liên quan đến kế hoạch cai thuốc
public class QuitPlanController {

    private final QuitPlanService quitPlanService;

    public QuitPlanController(QuitPlanService quitPlanService) {
        this.quitPlanService = quitPlanService;
    }

    // Tạo kế hoạch cai thuốc mới
    @PostMapping
    @PreAuthorize("hasAnyRole('GUEST', 'MEMBER', 'COACH', 'ADMIN')") // Cho phép các vai trò này tạo kế hoạch
    public ResponseEntity<QuitPlanResponse> createQuitPlan(@RequestBody QuitPlanRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName(); // Lấy username của người dùng đang đăng nhập

        QuitPlanResponse response = quitPlanService.createQuitPlan(username, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Lấy kế hoạch cai thuốc đang hoạt động của người dùng hiện tại
    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('GUEST', 'MEMBER', 'COACH', 'ADMIN')")
    public ResponseEntity<QuitPlanResponse> getActiveQuitPlan() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        Optional<QuitPlanResponse> response = quitPlanService.getActiveQuitPlan(username);
        return response.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    // Lấy tất cả các kế hoạch cai thuốc của người dùng hiện tại (bao gồm cả lịch sử)
    @GetMapping
    @PreAuthorize("hasAnyRole('GUEST', 'MEMBER', 'COACH', 'ADMIN')")
    public ResponseEntity<List<QuitPlanResponse>> getAllQuitPlansForCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        List<QuitPlanResponse> responses = quitPlanService.getAllQuitPlansForUser(username);
        return ResponseEntity.ok(responses);
    }

    // Cập nhật một kế hoạch cai thuốc cụ thể
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('GUEST', 'MEMBER', 'COACH', 'ADMIN')") // Hoặc chỉ MEMBER, tùy yêu cầu
    public ResponseEntity<QuitPlanResponse> updateQuitPlan(@PathVariable String id, @RequestBody QuitPlanRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        QuitPlanResponse response = quitPlanService.updateQuitPlan(id, username, request);
        return ResponseEntity.ok(response);
    }

    // Xóa một kế hoạch cai thuốc cụ thể
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('GUEST', 'MEMBER', 'COACH', 'ADMIN')") // Hoặc chỉ MEMBER, tùy yêu cầu
    public ResponseEntity<Void> deleteQuitPlan(@PathVariable String id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        quitPlanService.deleteQuitPlan(id, username);
        return ResponseEntity.noContent().build();
    }
}
