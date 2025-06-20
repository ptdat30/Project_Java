package com.quitsmoking.controllers;
import com.quitsmoking.model.Achievement;
import com.quitsmoking.model.User;
import com.quitsmoking.model.UserAchievement;
import com.quitsmoking.services.AchievementService;
import com.quitsmoking.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController

@RequestMapping("/api/achievements")
@CrossOrigin(origins = "http://localhost:3000")
public class AchievementController {
    @Autowired
    private AchievementService achievementService;
    @Autowired
    private UserService userService;
    @GetMapping("/all")
    public ResponseEntity<?> getAllAchievements() {
        try {
            List<Achievement> achievements = achievementService.getAllAchievements();
            return ResponseEntity.ok(achievements);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }
    @GetMapping("/my")
    public ResponseEntity<?> getMyAchievements(Authentication authentication) {
        try {
            User user = userService.findByUsername(authentication.getName());
            List<UserAchievement> userAchievements = achievementService.getUserAchievements(user);
            return ResponseEntity.ok(userAchievements);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }
    @PostMapping("/share/{achievementId}")
    public ResponseEntity<?> shareAchievement(
            @PathVariable String achievementId,
            Authentication authentication) {
        try {
            User user = userService.findByUsername(authentication.getName());
            UserAchievement sharedAchievement = achievementService.shareAchievement(user, achievementId);
            return ResponseEntity.ok(sharedAchievement);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }
    @GetMapping("/shared")
    public ResponseEntity<?> getSharedAchievements() {
        try {
            List<UserAchievement> sharedAchievements = achievementService.getSharedAchievements();
            return ResponseEntity.ok(sharedAchievements);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }
    @GetMapping("/my/shared")
    public ResponseEntity<?> getMySharedAchievements(Authentication authentication) {
        try {
            User user = userService.findByUsername(authentication.getName());
            List<UserAchievement> mySharedAchievements = achievementService.getUserSharedAchievements(user);
            return ResponseEntity.ok(mySharedAchievements);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }
    @GetMapping("/count")
    public ResponseEntity<?> getMyAchievementCount(Authentication authentication) {
        try {
            User user = userService.findByUsername(authentication.getName());
            Long count = achievementService.getUserAchievementCount(user);
            return ResponseEntity.ok().body("{\"count\": " + count + "}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }
    @PostMapping("/check")
    public ResponseEntity<?> checkAchievements(Authentication authentication) {
        try {
            User user = userService.findByUsername(authentication.getName());
            achievementService.checkAndAwardAchievements(user);
            return ResponseEntity.ok().body("Đã kiểm tra achievements");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }
    // Admin endpoints
    @PostMapping("/create")
    public ResponseEntity<?> createAchievement(
            @RequestBody CreateAchievementRequest request,
            Authentication authentication) {
        try {
            // Kiểm tra quyền admin (có thể implement sau)
            Achievement achievement = achievementService.createAchievement(
                request.getName(),
                request.getDescription(),
                request.getCriteriaType(),
                request.getCriteriaValue(),
                request.getBadgeColor()
            );
            return ResponseEntity.ok(achievement);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }
    // DTO class cho tạo achievement
    public static class CreateAchievementRequest {
        private String name;
        private String description;
        private Achievement.CriteriaType criteriaType;
        private int criteriaValue;
        private String badgeColor;
        // Constructors
        public CreateAchievementRequest() {}
        // Getters and Setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public Achievement.CriteriaType getCriteriaType() { return criteriaType; }
        public void setCriteriaType(Achievement.CriteriaType criteriaType) { this.criteriaType = criteriaType; }
        public int getCriteriaValue() { return criteriaValue; }
        public void setCriteriaValue(int criteriaValue) { this.criteriaValue = criteriaValue; }
        public String getBadgeColor() { return badgeColor; }
        public void setBadgeColor(String badgeColor) { this.badgeColor = badgeColor; }
    }
}