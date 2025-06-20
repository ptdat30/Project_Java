package com.quitsmoking.controllers;
import com.quitsmoking.model.DailyProgress;
import com.quitsmoking.model.User;
import com.quitsmoking.services.DailyProgressService;
import com.quitsmoking.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
@RestController
@RequestMapping("/api/progress")
@CrossOrigin(origins = "http://localhost:3000")
public class DailyProgressController {
    @Autowired
    private DailyProgressService dailyProgressService;
    @Autowired
    private UserService userService;
    @PostMapping("/today")
    public ResponseEntity<?> updateTodayProgress(
            @RequestBody UpdateProgressRequest request,
            Authentication authentication) {
        try {
            User user = userService.findByUsername(authentication.getName());
            
            DailyProgress progress = dailyProgressService.createOrUpdateTodayProgress(
                user, 
                request.getCigarettesSmoked(),
                request.getMoodRating(),
                request.getStressLevel(),
                request.getCravingsIntensity(),
                request.getNotes()
            );
            
            return ResponseEntity.ok(progress);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }
    @GetMapping("/today")
    public ResponseEntity<?> getTodayProgress(Authentication authentication) {
        try {
            User user = userService.findByUsername(authentication.getName());
            Optional<DailyProgress> progress = dailyProgressService.getProgressByDate(user, LocalDate.now());
            
            if (progress.isPresent()) {
                return ResponseEntity.ok(progress.get());
            } else {
                return ResponseEntity.ok().body("Chưa có dữ liệu cho ngày hôm nay");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }
    @GetMapping("/history")
    public ResponseEntity<?> getProgressHistory(Authentication authentication) {
        try {
            User user = userService.findByUsername(authentication.getName());
            List<DailyProgress> progressList = dailyProgressService.getUserProgress(user);
            return ResponseEntity.ok(progressList);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }
    @GetMapping("/range")
    public ResponseEntity<?> getProgressInRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Authentication authentication) {
        try {
            User user = userService.findByUsername(authentication.getName());
            List<DailyProgress> progressList = dailyProgressService.getProgressInDateRange(user, startDate, endDate);
            return ResponseEntity.ok(progressList);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }
    @GetMapping("/statistics")
    public ResponseEntity<?> getStatistics(Authentication authentication) {
        try {
            User user = userService.findByUsername(authentication.getName());
            DailyProgressService.ProgressStatistics stats = dailyProgressService.getProgressStatistics(user);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }
    @GetMapping("/recent/{days}")
    public ResponseEntity<?> getRecentProgress(
            @PathVariable int days,
            Authentication authentication) {
        try {
            User user = userService.findByUsername(authentication.getName());
            List<DailyProgress> progressList = dailyProgressService.getRecentProgress(user, days);
            return ResponseEntity.ok(progressList);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }
    // DTO class cho request
    public static class UpdateProgressRequest {
        private int cigarettesSmoked;
        private int moodRating;
        private int stressLevel;
        private int cravingsIntensity;
        private String notes;
        // Constructors
        public UpdateProgressRequest() {}
        // Getters and Setters
        public int getCigarettesSmoked() { return cigarettesSmoked; }
        public void setCigarettesSmoked(int cigarettesSmoked) { this.cigarettesSmoked = cigarettesSmoked; }
        public int getMoodRating() { return moodRating; }
        public void setMoodRating(int moodRating) { this.moodRating = moodRating; }
        public int getStressLevel() { return stressLevel; }
        public void setStressLevel(int stressLevel) { this.stressLevel = stressLevel; }
        public int getCravingsIntensity() { return cravingsIntensity; }
        public void setCravingsIntensity(int cravingsIntensity) { this.cravingsIntensity = cravingsIntensity; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }
}