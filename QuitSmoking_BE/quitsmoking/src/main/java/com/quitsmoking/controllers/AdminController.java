package com.quitsmoking.controllers;
import com.quitsmoking.model.User;
import com.quitsmoking.services.AdminService;
import com.quitsmoking.dto.response.AdminStatsResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
/**
 * Controller cho các chức năng quản trị hệ thống
 * Chỉ cho phép ADMIN truy cập
 */
@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    @Autowired
    private AdminService adminService;
    /**
     * Lấy thống kê tổng quan hệ thống
     */
    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getSystemStats() {
        AdminStatsResponse stats = adminService.getSystemStats();
        return ResponseEntity.ok(stats);
    }
    /**
     * Quản lý người dùng - Lấy danh sách tất cả người dùng
     */
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String search) {
        
        List<User> users = adminService.getAllUsers(page, size, sortBy, sortDir, search);
        return ResponseEntity.ok(users);
    }
    /**
     * Lấy thông tin chi tiết người dùng
     */
    @GetMapping("/users/{userId}")
    public ResponseEntity<User> getUserDetails(@PathVariable String userId) {
        User user = adminService.getUserDetails(userId);
        return ResponseEntity.ok(user);
    }
    /**
     * Khóa/Mở khóa tài khoản người dùng
     */
    @PostMapping("/users/{userId}/ban")
    public ResponseEntity<Map<String, Object>> banUser(@PathVariable String userId) {
        Map<String, Object> result = adminService.banUser(userId);
        return ResponseEntity.ok(result);
    }
    @PostMapping("/users/{userId}/unban")
    public ResponseEntity<Map<String, Object>> unbanUser(@PathVariable String userId) {
        Map<String, Object> result = adminService.unbanUser(userId);
        return ResponseEntity.ok(result);
    }
    /**
     * Nâng cấp/Hạ cấp vai trò người dùng
     */
    @PostMapping("/users/{userId}/promote")
    public ResponseEntity<User> promoteUser(
            @PathVariable String userId,
            @RequestBody Map<String, String> request) {
        
        String newRole = request.get("role");
        User user = adminService.updateUserRole(userId, newRole);
        return ResponseEntity.ok(user);
    }
    /**
     * Quản lý huấn luyện viên - Lấy danh sách
     */
    @GetMapping("/coaches")
    public ResponseEntity<List<User>> getAllCoaches() {
        List<User> coaches = adminService.getAllCoaches();
        return ResponseEntity.ok(coaches);
    }
    /**
     * Thêm huấn luyện viên mới
     */
    @PostMapping("/coaches")
    public ResponseEntity<User> addCoach(@RequestBody Map<String, Object> coachData) {
        User coach = adminService.addCoach(coachData);
        return ResponseEntity.ok(coach);
    }
    /**
     * Cập nhật thông tin huấn luyện viên
     */
    @PutMapping("/coaches/{coachId}")
    public ResponseEntity<User> updateCoach(
            @PathVariable String coachId,
            @RequestBody Map<String, Object> coachData) {
        
        User coach = adminService.updateCoach(coachId);
        return ResponseEntity.ok(coach);
    }
    /**
     * Xóa huấn luyện viên
     */
    @DeleteMapping("/coaches/{coachId}")
    public ResponseEntity<Map<String, Object>> removeCoach(@PathVariable String coachId) {
        Map<String, Object> result = adminService.removeCoach(coachId);
        return ResponseEntity.ok(result);
    }
    /**
     * Báo cáo hệ thống
     */
    @GetMapping("/reports")
    public ResponseEntity<List<Object>> getSystemReports(
            @RequestParam(required = false) String reportType,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        List<Object> reports = adminService.getSystemReports(reportType, startDate, endDate);
        return ResponseEntity.ok(reports);
    }
    /**
     * Báo cáo doanh thu
     */
    @GetMapping("/reports/revenue")
    public ResponseEntity<Map<String, Object>> getRevenueReport(
            @RequestParam(required = false) String period) {
        
        Map<String, Object> revenueReport = adminService.getRevenueReport(period);
        return ResponseEntity.ok(revenueReport);
    }
    /**
     * Báo cáo người dùng hoạt động
     */
    @GetMapping("/reports/user-activity")
    public ResponseEntity<Map<String, Object>> getUserActivityReport(
            @RequestParam(required = false) String period) {
        
        Map<String, Object> activityReport = adminService.getUserActivityReport(period);
        return ResponseEntity.ok(activityReport);
    }
    /**
     * Lấy phản hồi từ người dùng
     */
    @GetMapping("/feedbacks")
    public ResponseEntity<List<Object>> getAllFeedbacks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        List<Object> feedbacks = adminService.getAllFeedbacks(page, size);
        return ResponseEntity.ok(feedbacks);
    }
    /**
     * Trả lời phản hồi
     */
    @PostMapping("/feedbacks/{feedbackId}/reply")
    public ResponseEntity<Object> replyToFeedback(
            @PathVariable String feedbackId,
            @RequestBody Map<String, String> reply,
            @AuthenticationPrincipal User admin) {
        
        Object result = adminService.replyToFeedback(feedbackId, reply.get("message"), admin.getId());
        return ResponseEntity.ok(result);
    }
    /**
     * Cài đặt hệ thống
     */
    @GetMapping("/system/settings")
    public ResponseEntity<Map<String, Object>> getSystemSettings() {
        AdminStatsResponse statsResponse = adminService.getSystemStats();
        Map<String, Object> settings = Map.of(
            "totalUsers", statsResponse.getTotalUsers(),
            "activeUsers", statsResponse.getActiveUsers(),
            "totalRevenue", statsResponse.getTotalRevenue()
            // Add other fields as needed
        );
        return ResponseEntity.ok(settings);
    }
    @PostMapping("/system/settings")
    public ResponseEntity<Map<String, Object>> updateSystemSettings(
            @RequestBody Map<String, Object> settings) {
        
        Map<String, Object> result = adminService.updateSystemSettings(settings);
        return ResponseEntity.ok(result);
    }
    /**
     * Backup dữ liệu
     */
    @PostMapping("/system/backup")
    public ResponseEntity<Map<String, Object>> createBackup() {
        Map<String, Object> result = adminService.createBackup();
        return ResponseEntity.ok(result);
    }
    /**
     * Thống kê theo thời gian thực
     */
    @GetMapping("/stats/realtime")
    public ResponseEntity<Map<String, Object>> getRealtimeStats() {
        Map<String, Object> stats = adminService.getRealtimeStats();
        return ResponseEntity.ok(stats);
    }
    /**
     * Log hệ thống
     */
    @GetMapping("/system/logs")
    public ResponseEntity<List<Object>> getSystemLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) String level) {
        
        List<Object> logs = adminService.getSystemReports(page, size, level);
        return ResponseEntity.ok(logs);
    }
}