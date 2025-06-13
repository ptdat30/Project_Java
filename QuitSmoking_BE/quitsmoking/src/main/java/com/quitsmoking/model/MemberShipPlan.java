package com.quitsmoking.model;

public enum MemberShipPlan {
    // Thời hạn được tính bằng số ngày
    THIRTY_DAYS_TRIAL("30-day Trial", 30),
    THIRTY_DAYS("30-day Plan", 30),
    SIXTY_DAYS("60-day Plan", 60),
    NINETY_DAYS("90-day Plan", 90);

    private final String displayName;
    private final int durationDays;

    MemberShipPlan(String displayName, int durationDays) {
        this.displayName = displayName;
        this.durationDays = durationDays;
    }

    public String getDisplayName() {
        return displayName;
    }

    public int getDurationDays() {
        return durationDays;
    }
}
