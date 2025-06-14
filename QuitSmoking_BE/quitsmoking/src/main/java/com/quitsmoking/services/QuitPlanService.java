package com.quitsmoking.services;

import com.quitsmoking.model.QuitPlan;
import com.quitsmoking.model.User;
import com.quitsmoking.reponsitories.QuitPlanDAO;
import com.quitsmoking.reponsitories.UserDAO;
import com.quitsmoking.dto.request.QuitPlanRequest;
import com.quitsmoking.dto.response.QuitPlanResponse;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class QuitPlanService {

    private final QuitPlanDAO quitPlanDAO;
    private final UserDAO userDAO; // Cần UserDAO để tìm User theo username

    public QuitPlanService(QuitPlanDAO quitPlanDAO, UserDAO userDAO) {
        this.quitPlanDAO = quitPlanDAO;
        this.userDAO = userDAO;
    }

    @Transactional // Đảm bảo toàn bộ hoạt động được thực hiện trong một transaction
    public QuitPlanResponse createQuitPlan(String username, QuitPlanRequest request) {
        // Tìm người dùng bằng username
        User user = userDAO.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));

        // Vô hiệu hóa các kế hoạch cũ đang hoạt động của người dùng này (nếu có)
        Optional<QuitPlan> existingActivePlan = quitPlanDAO.findByUserAndActiveTrue(user);
        existingActivePlan.ifPresent(plan -> {
            plan.setActive(false);
            quitPlanDAO.save(plan);
        });

        // Tạo kế hoạch mới
        QuitPlan newPlan = new QuitPlan(
                user,
                request.getReason(),
                request.getStartDate(),
                request.getTargetQuitDate(),
                request.getInitialSmokingHabit(),
                request.getQuittingPhases()
        );
        newPlan.setActive(true); // Đảm bảo kế hoạch mới là active

        QuitPlan savedPlan = quitPlanDAO.save(newPlan);

        return convertToResponse(savedPlan);
    }

    public Optional<QuitPlanResponse> getActiveQuitPlan(String username) {
        User user = userDAO.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
        return quitPlanDAO.findByUserAndActiveTrue(user)
                .map(this::convertToResponse);
    }

    public List<QuitPlanResponse> getAllQuitPlansForUser(String username) {
        User user = userDAO.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
        List<QuitPlan> plans = quitPlanDAO.findByUser(user);
        return plans.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public QuitPlanResponse updateQuitPlan(String planId, String username, QuitPlanRequest request) {
        User user = userDAO.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));

        QuitPlan existingPlan = quitPlanDAO.findById(planId)
                .orElseThrow(() -> new RuntimeException("Quit Plan not found with ID: " + planId));

        // Đảm bảo người dùng hiện tại là chủ sở hữu của kế hoạch
        if (!existingPlan.getUser().getId().equals(user.getId())) {
            throw new SecurityException("User is not authorized to update this quit plan.");
        }

        // Cập nhật thông tin từ request
        existingPlan.setReason(request.getReason());
        existingPlan.setStartDate(request.getStartDate());
        existingPlan.setTargetQuitDate(request.getTargetQuitDate());
        existingPlan.setInitialSmokingHabit(request.getInitialSmokingHabit());
        existingPlan.setQuittingPhases(request.getQuittingPhases());

        // Lưu và trả về response
        QuitPlan updatedPlan = quitPlanDAO.save(existingPlan);
        return convertToResponse(updatedPlan);
    }

    @Transactional
    public void deleteQuitPlan(String planId, String username) {
        User user = userDAO.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));

        QuitPlan planToDelete = quitPlanDAO.findById(planId)
                .orElseThrow(() -> new RuntimeException("Quit Plan not found with ID: " + planId));

        // Đảm bảo người dùng hiện tại là chủ sở hữu của kế hoạch
        if (!planToDelete.getUser().getId().equals(user.getId())) {
            throw new SecurityException("User is not authorized to delete this quit plan.");
        }
        quitPlanDAO.delete(planToDelete);
    }

    // Helper method to convert Entity to Response DTO
    private QuitPlanResponse convertToResponse(QuitPlan plan) {
        return new QuitPlanResponse(
                plan.getId(),
                plan.getUser().getId(), // Lấy ID của người dùng
                plan.getReason(),
                plan.getStartDate(),
                plan.getTargetQuitDate(),
                plan.getInitialSmokingHabit(),
                plan.getQuittingPhases(),
                plan.isActive()
        );
    }
}
