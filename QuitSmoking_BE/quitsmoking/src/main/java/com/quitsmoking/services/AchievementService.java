package com.quitsmoking.services;
import com.quitsmoking.model.Achievement;
import com.quitsmoking.model.User;
import com.quitsmoking.model.UserAchievement;
import com.quitsmoking.reponsitories.AchievementRepository;
import com.quitsmoking.reponsitories.DailyProgressRepository;
import com.quitsmoking.reponsitories.UserAchievementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
@Service

public class AchievementService {
    @Autowired
    private AchievementRepository achievementRepository;
    @Autowired
    private UserAchievementRepository userAchievementRepository;
    @Autowired
    private DailyProgressRepository dailyProgressRepository;
    @Autowired
    private NotificationService notificationService;
    public List<Achievement> getAllAchievements() {
        return achievementRepository.findAll();
    }
    public List<UserAchievement> getUserAchievements(User user) {
        return userAchievementRepository.findByUserOrderByEarnedDateDesc(user);
    }
    public void checkAndAwardAchievements(User user) {
        // Kiểm tra achievements cho số ngày không hút thuốc
        checkSmokeFreeeDaysAchievements(user);
        
        // Kiểm tra achievements cho tiền tiết kiệm
        checkMoneySavedAchievements(user);
        
        // Kiểm tra achievements cho số điếu tránh được
        checkCigarettesAvoidedAchievements(user);
    }
    private void checkSmokeFreeeDaysAchievements(User user) {
        Long smokeFreeeDays = dailyProgressRepository.getSmokeFreeeDays(user);
        if (smokeFreeeDays == null) smokeFreeeDays = 0L;
        List<Achievement> dayAchievements = achievementRepository
            .findByCriteriaTypeAndCriteriaValueLessThanEqual(
                Achievement.CriteriaType.DAYS_SMOKE_FREE, smokeFreeeDays.intValue());
        for (Achievement achievement : dayAchievements) {
            awardAchievementIfNotEarned(user, achievement);
        }
    }
    private void checkMoneySavedAchievements(User user) {
        Double totalMoneySaved = dailyProgressRepository.getTotalMoneySaved(user);
        if (totalMoneySaved == null) totalMoneySaved = 0.0;
        List<Achievement> moneyAchievements = achievementRepository
            .findByCriteriaTypeAndCriteriaValueLessThanEqual(
                Achievement.CriteriaType.MONEY_SAVED, totalMoneySaved.intValue());
        for (Achievement achievement : moneyAchievements) {
            awardAchievementIfNotEarned(user, achievement);
        }
    }
    private void checkCigarettesAvoidedAchievements(User user) {
        // Tính số điếu tránh được = (số ngày không hút * 20) - tổng số điếu đã hút
        Long smokeFreeeDays = dailyProgressRepository.getSmokeFreeeDays(user);
        Long totalSmoked = dailyProgressRepository.getTotalCigarettesSmoked(user);
        
        if (smokeFreeeDays == null) smokeFreeeDays = 0L;
        if (totalSmoked == null) totalSmoked = 0L;
        
        long cigarettesAvoided = (smokeFreeeDays * 20) - totalSmoked;
        if (cigarettesAvoided < 0) cigarettesAvoided = 0;
        List<Achievement> cigaretteAchievements = achievementRepository
            .findByCriteriaTypeAndCriteriaValueLessThanEqual(
                Achievement.CriteriaType.CIGARETTES_AVOIDED, (int) cigarettesAvoided);
        for (Achievement achievement : cigaretteAchievements) {
            awardAchievementIfNotEarned(user, achievement);
        }
    }
    private void awardAchievementIfNotEarned(User user, Achievement achievement) {
        if (!userAchievementRepository.existsByUserAndAchievement(user, achievement)) {
            UserAchievement userAchievement = new UserAchievement(user, achievement);
            userAchievementRepository.save(userAchievement);
            
            // Gửi thông báo về achievement mới
            notificationService.sendAchievementNotification(user, achievement);
        }
    }
    public UserAchievement shareAchievement(User user, String achievementId) {
        Achievement achievement = achievementRepository.findById(achievementId)
            .orElseThrow(() -> new RuntimeException("Achievement not found"));
        
        UserAchievement userAchievement = userAchievementRepository
            .findByUserAndAchievement(user, achievement)
            .orElseThrow(() -> new RuntimeException("User has not earned this achievement"));
        
        userAchievement.setShared(true);
        return userAchievementRepository.save(userAchievement);
    }
    public List<UserAchievement> getSharedAchievements() {
        return userAchievementRepository.findByIsSharedTrueOrderByEarnedDateDesc();
    }
    public Long getUserAchievementCount(User user) {
        return userAchievementRepository.countByUser(user);
    }
    public List<UserAchievement> getUserSharedAchievements(User user) {
        return userAchievementRepository.findSharedAchievementsByUser(user);
    }
    // Tạo achievement mới (dành cho admin)
    public Achievement createAchievement(String name, String description, 
                                       Achievement.CriteriaType criteriaType, 
                                       int criteriaValue, String badgeColor) {
        Achievement achievement = new Achievement(name, description, criteriaType, criteriaValue);
        achievement.setBadgeColor(badgeColor);
        return achievementRepository.save(achievement);
    }
}