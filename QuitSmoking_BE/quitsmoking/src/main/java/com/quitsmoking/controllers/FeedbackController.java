package com.quitsmoking.controllers;

import com.quitsmoking.dto.request.FeedbackRequest;
import com.quitsmoking.dto.response.FeedbackResponse;
import com.quitsmoking.services.FeedbackService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
// Cấu hình CORS cho Controller này. Tốt hơn nên cấu hình toàn cục trong WebConfig.java
// @CrossOrigin(origins = "http://localhost:5173") // Thay bằng domain frontend của bạn

public class FeedbackController {
    private static final Logger logger = LoggerFactory.getLogger(FeedbackController.class);

    private final FeedbackService feedbackService;

    @Autowired
    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    /**
     * Endpoint để lấy feedback hiện tại của người dùng đã đăng nhập.
     * @return ResponseEntity với FeedbackResponse nếu có, hoặc 404 nếu chưa có feedback.
     */
    @GetMapping("/my-feedback")
    public ResponseEntity<FeedbackResponse> getMyFeedback() {
        logger.debug("Received GET request to /api/feedback/my-feedback");
        try {
            FeedbackResponse response = feedbackService.getMyFeedback();
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            logger.warn("User has no feedback yet: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Endpoint để admin lấy tất cả feedback.
     * @return ResponseEntity với danh sách FeedbackResponse.
     */
    @GetMapping("/admin/all")
    public ResponseEntity<List<FeedbackResponse>> getAllFeedbacks() {
        logger.debug("Received GET request to /api/feedback/admin/all");
        List<FeedbackResponse> responses = feedbackService.getAllFeedbacks();
        return ResponseEntity.ok(responses);
    }

    /**
     * Endpoint để lấy feedback theo ID (cho admin).
     * @param id ID của feedback cần lấy.
     * @return ResponseEntity với FeedbackResponse.
     */
    @GetMapping("/admin/{id}")
    public ResponseEntity<FeedbackResponse> getFeedbackById(@PathVariable Long id) {
        logger.debug("Received GET request to /api/feedback/admin/{}", id);
        try {
            FeedbackResponse response = feedbackService.getFeedbackById(id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            logger.warn("Feedback not found with ID: {}", id);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Endpoint để người dùng gửi phản hồi/đánh giá.
     * @param feedbackRequest DTO chứa rating và nội dung phản hồi.
     * @return ResponseEntity với FeedbackResponse và HttpStatus.CREATED nếu thành công.
     */
    @PostMapping
    public ResponseEntity<FeedbackResponse> submitFeedback(@Valid @RequestBody FeedbackRequest feedbackRequest) {
        logger.debug("Received POST request to /api/feedback with data: {}", feedbackRequest);
        FeedbackResponse response = feedbackService.submitFeedback(feedbackRequest);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // Bạn có thể thêm các endpoint khác ở đây, ví dụ để lấy danh sách feedback (chỉ cho Admin)
    /*
    @GetMapping
    public ResponseEntity<List<FeedbackResponse>> getAllFeedbacks() {
        // Đây là ví dụ, bạn cần tạo phương thức trong FeedbackService để lấy và chuyển đổi Feedback sang FeedbackResponse
        // List<Feedback> feedbacks = feedbackRepository.findAll();
        // List<FeedbackResponse> responses = feedbacks.stream()
        //                                            .map(feedback -> FeedbackResponse.builder()
        //                                                .id(feedback.getId())
        //                                                .rating(feedback.getRating())
        //                                                .feedbackContent(feedback.getFeedbackContent())
        //                                                .submissionTime(feedback.getSubmissionTime())
        //                                                .build())
        //                                            .collect(Collectors.toList());
        // return ResponseEntity.ok(responses);
    }
    */
}
