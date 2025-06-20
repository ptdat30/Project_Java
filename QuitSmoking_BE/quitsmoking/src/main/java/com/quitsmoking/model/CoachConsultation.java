package com.quitsmoking.model;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
@Entity
@Table(name = "coach_consultations")
@Getter
@Setter
@NoArgsConstructor
public class CoachConsultation {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "VARCHAR(36)")
    private String id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private User member;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coach_id", nullable = false)
    private User coach;
    @Enumerated(EnumType.STRING)
    @Column(name = "session_type")
    private SessionType sessionType = SessionType.CHAT;
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private ConsultationStatus status = ConsultationStatus.SCHEDULED;
    @Column(name = "scheduled_time")
    private LocalDateTime scheduledTime;
    @Column(name = "duration_minutes")
    private int durationMinutes;
    @Column(columnDefinition = "TEXT")
    private String notes;
    @Column
    private int rating; // 1-5
    @Column(columnDefinition = "TEXT")
    private String feedback;
    @Column(precision = 10, scale = 2)
    private BigDecimal cost;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    @PrePersist
    protected void onCreate() {
        if (this.id == null || this.id.isEmpty()) {
            this.id = UUID.randomUUID().toString();
        }
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    public CoachConsultation(User member, User coach, SessionType sessionType) {
        this.member = member;
        this.coach = coach;
        this.sessionType = sessionType;
    }
    public enum SessionType {
        CHAT,
        VIDEO_CALL,
        PHONE_CALL
    }
    public enum ConsultationStatus {
        SCHEDULED,
        ACTIVE,
        COMPLETED,
        CANCELLED
    }
}
