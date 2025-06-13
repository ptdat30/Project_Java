package com.quitsmoking.dto.request;

import java.time.LocalDate;

public class QuitPlanRequest {
    private String reason;
    private LocalDate startDate;
    private LocalDate targetQuitDate;
    private String initialSmokingHabit;
    private String quittingPhases;
    // Có thể thêm một trường để xác định đây có phải là kế hoạch kích hoạt ngay không,
    // hoặc logic đó sẽ được xử lý trong service.

    // Constructor
    public QuitPlanRequest() {}

    public QuitPlanRequest(String reason, LocalDate startDate, LocalDate targetQuitDate, String initialSmokingHabit, String quittingPhases) {
        this.reason = reason;
        this.startDate = startDate;
        this.targetQuitDate = targetQuitDate;
        this.initialSmokingHabit = initialSmokingHabit;
        this.quittingPhases = quittingPhases;
    }

    // Getters and Setters
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
}
