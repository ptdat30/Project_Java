package com.quitsmoking.controllers;

import com.quitsmoking.model.CoachConsultation;
import com.quitsmoking.services.CoachConsultationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/coach-consultations")
@CrossOrigin(origins = {"http://localhost:4173", "http://localhost:3000", "http://localhost:5173"})
public class CoachConsultationController {
    @Autowired
    private CoachConsultationService consultationService;

    @Autowired
    private com.quitsmoking.reponsitories.UserDAO userDAO;

    @GetMapping
    @PreAuthorize("hasAnyRole('MEMBER', 'ADMIN', 'COACH')")
    public ResponseEntity<?> getConsultationSessions(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String coachId
    ) {
        // Trường hợp: chỉ truyền coachId (coach lấy tất cả session của mình)
        if (coachId != null && userId == null) {
            var sessions = consultationService.getConsultationsByCoachId(coachId)
                .stream()
                .map(CoachConsultation::toDTO)
                .toList();
            return ResponseEntity.ok(sessions);
        }
        // Trường hợp: truyền cả userId và coachId (lấy session giữa user và coach)
        if (userId != null && coachId != null) {
            Optional<CoachConsultation> session = consultationService.getConsultationByMemberAndCoachWithDetails(userId, coachId);
            return session.map(value -> ResponseEntity.ok(value.toDTO()))
                          .orElseGet(() -> ResponseEntity.ok(null));
        }
        // Trường hợp không truyền đủ param
        return ResponseEntity.badRequest().body("Thiếu tham số userId hoặc coachId");
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MEMBER', 'ADMIN', 'COACH')")
    public ResponseEntity<?> createConsultationSession(@RequestBody java.util.Map<String, Object> payload) {
        String userId = (String) payload.get("userId");
        String coachId = (String) payload.get("coachId");
        String sessionTypeStr = (String) payload.getOrDefault("sessionType", "CHAT");

        if (userId == null || coachId == null) {
            return ResponseEntity.badRequest().body("userId và coachId là bắt buộc");
        }

        // Kiểm tra đã có session chưa
        java.util.Optional<CoachConsultation> existing = consultationService.getConsultationByMemberAndCoach(userId, coachId);
        if (existing.isPresent()) {
            return ResponseEntity.ok(existing.get().toDTO());
        }

        // Lấy User từ DB
        com.quitsmoking.model.User member = userDAO.findById(userId).orElse(null);
        com.quitsmoking.model.User coach = userDAO.findById(coachId).orElse(null);
        if (member == null || coach == null) {
            return ResponseEntity.badRequest().body("Không tìm thấy user hoặc coach");
        }

        CoachConsultation.SessionType sessionType = CoachConsultation.SessionType.valueOf(sessionTypeStr);
        CoachConsultation consultation = new CoachConsultation();
        consultation.setMember(member);
        consultation.setCoach(coach);
        consultation.setSessionType(sessionType);
        // Có thể set thêm các trường khác nếu FE gửi lên

        CoachConsultation created = consultationService.createConsultation(consultation);
        return ResponseEntity.ok(created.toDTO());
    }
} 