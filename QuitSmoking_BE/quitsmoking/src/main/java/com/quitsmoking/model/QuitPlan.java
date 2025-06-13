//liên kết với User và chứa các thông tin về kế hoạch cai thuốc của họ.
package com.quitsmoking.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "Quit_Plans")
public class QuitPlan {

    @Id
    private String id;

    @ManyToOne(fetch = FetchType.LAZY) // Một người dùng có nhiều kế hoạch, một kế hoạch thuộc về một người dùng
    @JoinColumn(name = "user_id", nullable = false) // Tên cột khóa ngoại trong bảng quit_plans
    private User user; // Liên kết với User entity

    @Column(nullable = false)
    private String reason; // Lý do cai thuốc (ví do: Sức khỏe, Gia đình, Tiền bạc)

    @Column(nullable = false)
    private LocalDate startDate; // Thời điểm bắt đầu thực hiện kế hoạch

    @Column(nullable = false)
    private LocalDate targetQuitDate; // Thời điểm dự kiến cai được thuốc hoàn toàn

    @Column(nullable = true)
    private String initialSmokingHabit; // Tình trạng hút thuốc ban đầu (VD: 20 điếu/ngày)

    @Column(nullable = true)
    private String quittingPhases; // Các giai đoạn cai thuốc (có thể là JSON String hoặc Text dài)

    @Column(columnDefinition = "boolean default false")
    private boolean active; // Kế hoạch hiện tại có đang hoạt động không (một người dùng chỉ có 1 kế hoạch active)

    // Constructor
    public QuitPlan() {
        this.id = UUID.randomUUID().toString(); // Tự động tạo ID
        this.active = true; // Mặc định là active khi tạo mới
    }

    public QuitPlan(User user, String reason, LocalDate startDate, LocalDate targetQuitDate, String initialSmokingHabit, String quittingPhases) {
        this(); // Call default constructor to initialize id and active
        this.user = user;
        this.reason = reason;
        this.startDate = startDate;
        this.targetQuitDate = targetQuitDate;
        this.initialSmokingHabit = initialSmokingHabit;
        this.quittingPhases = quittingPhases;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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
