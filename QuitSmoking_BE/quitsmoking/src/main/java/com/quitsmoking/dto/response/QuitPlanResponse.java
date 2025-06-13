package com.quitsmoking.dto.response;

import java.time.LocalDate;

public class QuitPlanResponse {
    private String id;
    private String userId; // ID của người dùng sở hữu kế hoạch
    private String reason;
    private LocalDate startDate;
    private LocalDate targetQuitDate;
    private String initialSmokingHabit;
    private String quittingPhases;
    private boolean active;

    // Constructor
    public QuitPlanResponse(String id, String userId, String reason, LocalDate startDate, LocalDate targetQuitDate, String initialSmokingHabit, String quittingPhases, boolean active) {
        this.id = id;
        this.userId = userId;
        this.reason = reason;
        this.startDate = startDate;
        this.targetQuitDate = targetQuitDate;
        this.initialSmokingHabit = initialSmokingHabit;
        this.quittingPhases = quittingPhases;
        this.active = active;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getTargetQuitDate() {
        return targetQuitDate;
    }

    public void setTargetQuitDate(LocalDate targetQuitDate) {
        this.targetQuitDate = targetQuitDate;
    }

    public String getInitialSmokingHabit() {
        return initialSmokingHabit;
    }

    public void setInitialSmokingHabit(String initialSmokingHabit) {
        this.initialSmokingHabit = initialSmokingHabit;
    }

    public String getQuittingPhases() {
        return quittingPhases;
    }

    public void setQuittingPhases(String quittingPhases) {
        this.quittingPhases = quittingPhases;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
