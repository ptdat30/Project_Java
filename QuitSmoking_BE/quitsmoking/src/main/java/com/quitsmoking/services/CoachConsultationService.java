package com.quitsmoking.services;

import com.quitsmoking.model.CoachConsultation;
import com.quitsmoking.model.User;
import com.quitsmoking.reponsitories.CoachConsultationRepository;
import com.quitsmoking.reponsitories.UserDAO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CoachConsultationService {
    
    @Autowired
    private CoachConsultationRepository consultationRepository;
    
    @Autowired
    private UserDAO userDAO;
    
    public CoachConsultation createConsultation(CoachConsultation consultation) {
        consultation.setCreatedAt(LocalDateTime.now());
        consultation.setStatus(CoachConsultation.ConsultationStatus.SCHEDULED);
        return consultationRepository.save(consultation);
    }
    
    public Optional<CoachConsultation> getConsultationById(String id) {
        return consultationRepository.findById(id);
    }
    
    public Page<CoachConsultation> getConsultationsByMember(String memberId, Pageable pageable) {
        return consultationRepository.findByMemberIdOrderByCreatedAtDesc(memberId, pageable);
    }
    
    public Page<CoachConsultation> getConsultationsByCoach(String coachId, Pageable pageable) {
        return consultationRepository.findByCoachIdOrderByCreatedAtDesc(coachId, pageable);
    }
    
    public List<CoachConsultation> getActiveConsultations() {
        return consultationRepository.findByStatus(CoachConsultation.ConsultationStatus.ACTIVE);
    }
    
    public CoachConsultation updateConsultationStatus(String id, CoachConsultation.ConsultationStatus status) {
        CoachConsultation consultation = consultationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Consultation not found"));
        consultation.setStatus(status);
        consultation.setUpdatedAt(LocalDateTime.now());
        return consultationRepository.save(consultation);
    }
    
    public CoachConsultation updateConsultation(CoachConsultation consultation) {
        consultation.setUpdatedAt(LocalDateTime.now());
        return consultationRepository.save(consultation);
    }
    
    public void deleteConsultation(String id) {
        consultationRepository.deleteById(id);
    }
    
    public CoachConsultation rateConsultation(String id, Integer rating, String feedback) {
        CoachConsultation consultation = consultationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Consultation not found"));
        consultation.setRating(rating);
        consultation.setFeedback(feedback);
        consultation.setUpdatedAt(LocalDateTime.now());
        return consultationRepository.save(consultation);
    }
    
    public List<CoachConsultation> getConsultationsByStatus(CoachConsultation.ConsultationStatus status) {
        return consultationRepository.findByStatus(status);
    }
    
    public Page<CoachConsultation> getAllConsultations(Pageable pageable) {
        return consultationRepository.findAllByOrderByCreatedAtDesc(pageable);
    }
    
    public Optional<CoachConsultation> getConsultationByMemberAndCoach(String memberId, String coachId) {
        List<CoachConsultation> list = consultationRepository.findByMemberIdAndCoachId(memberId, coachId);
        if (list != null && !list.isEmpty()) {
            return Optional.of(list.get(0)); // Lấy session mới nhất
        }
        return Optional.empty();
    }
    
    // Lấy tất cả session theo coachId (không phân trang)
    public List<CoachConsultation> getConsultationsByCoachId(String coachId) {
        // Sử dụng method với JOIN FETCH để tránh LazyInitializationException
        return consultationRepository.findByCoachIdWithMemberAndCoach(coachId);
    }
    
    // Thêm method mới để lấy consultation với member và coach đã được load
    public List<CoachConsultation> getConsultationsByMemberId(String memberId) {
        return consultationRepository.findByMemberIdWithMemberAndCoach(memberId);
    }
    
    public Optional<CoachConsultation> getConsultationByMemberAndCoachWithDetails(String memberId, String coachId) {
        List<CoachConsultation> list = consultationRepository.findByMemberIdAndCoachIdWithMemberAndCoach(memberId, coachId);
        if (list != null && !list.isEmpty()) {
            return Optional.of(list.get(0)); // Lấy session mới nhất
        }
        return Optional.empty();
    }
}
