package com.quitsmoking.services;

import com.quitsmoking.model.User;
import com.quitsmoking.reponsitories.UserDAO;
import com.quitsmoking.model.MembershipTransaction;
import com.quitsmoking.model.MembershipPlan; // <-- Đảm bảo đây là MembershipPlan entity
import com.quitsmoking.model.MembershipPlanType; // <-- Vẫn giữ nếu bạn muốn cung cấp các loại gói enum
import com.quitsmoking.reponsitories.MembershipPlanRepository; // <-- Repository cho MembershipPlan entity
import com.quitsmoking.reponsitories.MembershipTransactionRepository; // <-- Rất quan trọng: cần cho MembershipTransaction
import com.quitsmoking.dto.request.MembershipUpgradeRequest;
import com.quitsmoking.dto.response.PaymentResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.ArrayList; // Dùng cho dữ liệu giả lập
import java.util.UUID;
import java.math.BigDecimal; // Đảm bảo có import này cho BigDecimal

/**
 * Service quản lý gói thành viên và thanh toán
 */
@Service
@Transactional
public class MembershipService {
    @Autowired
    private UserDAO userDAO;

    @Autowired
    private MembershipPlanRepository MembershipPlanRepository; // Sử dụng để tương tác với MembershipPlan entity

    @Autowired
    private MembershipTransactionRepository membershipTransactionRepository; // <-- THÊM: Repository cho MembershipTransaction

    /**
     * Lấy thông tin gói thành viên hiện tại của người dùng
     */
    public User getCurrentMembership(String userId) {
        return userDAO.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + userId));
    }

    /**
     * Lấy danh sách các gói thành viên có sẵn (từ database)
     * Phương thức này sẽ lấy các gói thành viên (entity) đang hoạt động từ DB
     */
    public List<MembershipPlan> getAvailablePlans() {
        return MembershipPlanRepository.findByIsActiveTrue();
    }

    // Nếu bạn muốn cung cấp danh sách các loại gói Enum (không phải Entity từ DB), bạn có thể giữ phương thức này:
    public List<MembershipPlanType> getAllMembershipPlanTypes() {
        return List.of(MembershipPlanType.values());
    }

    /**
     * Nâng cấp gói thành viên
     */
    public PaymentResponse upgradeMembership(String userId, MembershipUpgradeRequest request) {
        User user = getCurrentMembership(userId);

        // **Quan trọng:** Tìm MembershipPlan entity từ database bằng ID trong request.
        // request.getPlanId() phải là ID của MembershipPlan (ví dụ: UUID)
        MembershipPlan targetPlan = MembershipPlanRepository.findById(request.getPlanId())
                .orElseThrow(() -> new RuntimeException("Gói thành viên không tìm thấy với ID: " + request.getPlanId()));

        // Lấy thông tin giá từ MembershipPlan entity
        BigDecimal planPrice = targetPlan.getPrice();

        // Tạo transaction
        MembershipTransaction transaction = new MembershipTransaction();
        transaction.setId(UUID.randomUUID().toString()); // Tạo ID duy nhất cho giao dịch
        transaction.setUser(user); // Gán người dùng
        transaction.setMembershipPlan(targetPlan); // <-- Gán MembershipPlan entity (đối tượng)
        transaction.setAmount(planPrice);
        transaction.setPaymentStatus(MembershipTransaction.PaymentStatus.PENDING);
        transaction.setCreatedAt(LocalDateTime.now());
        transaction.setTransactionType(MembershipTransaction.TransactionType.UPGRADE);
        transaction.setFinalAmount(transaction.getAmount().subtract(
            transaction.getDiscountAmount() != null ? transaction.getDiscountAmount() : BigDecimal.ZERO
        ));

        // Lưu transaction vào database
        membershipTransactionRepository.save(transaction); // <-- Lưu giao dịch

        // Cập nhật gói thành viên hiện tại của người dùng (nếu cần)
        // Ví dụ: user.setCurrentMembershipPlan(targetPlan);
        // user.setMembershipEndDate(LocalDateTime.now().plusDays(targetPlan.getDurationDays()));
        // userDAO.save(user); // Lưu lại thông tin người dùng đã cập nhật

        // Tạo response thanh toán
        PaymentResponse response = new PaymentResponse();
        response.setTransactionId(transaction.getId());
        response.setPaymentUrl("https://payment.example.com/pay/" + transaction.getId());
        response.setStatus(transaction.getPaymentStatus().name());
        response.setAmount(transaction.getFinalAmount());
        response.setMembershipPlan(targetPlan.getPlanName()); // Lấy tên gói từ entity

        return response;
    }

    /**
     * Lấy lịch sử giao dịch thành viên
     */
    public List<MembershipTransaction> getMembershipTransactions(String userId) {
        // Thực tế: Lấy từ database thông qua MembershipTransactionRepository
        return membershipTransactionRepository.findByUser_Id(userId);
    }

    /**
     * Kiểm tra trạng thái thanh toán
     */
    public MembershipTransaction checkPaymentStatus(String userId, String transactionId) {
        // Thực tế: Lấy từ database và có thể gọi cổng thanh toán để xác nhận
        Optional<MembershipTransaction> transactionOpt = membershipTransactionRepository.findById(transactionId);
        if (transactionOpt.isPresent()) {
            MembershipTransaction transaction = transactionOpt.get();
            // TODO: Logic để kiểm tra trạng thái từ cổng thanh toán và cập nhật transaction
            // Ví dụ: if (externalPaymentGateway.getStatus(transactionId) == "SUCCESS") {
            //     transaction.setPaymentStatus(MembershipTransaction.PaymentStatus.COMPLETED);
            //     transaction.setCompletedAt(LocalDateTime.now());
            //     membershipTransactionRepository.save(transaction);
            // }
            return transaction;
        }
        throw new RuntimeException("Không tìm thấy giao dịch với ID: " + transactionId);
    }

    /**
     * Hủy gói thành viên
     */
    public User cancelMembership(String userId) {
        User user = getCurrentMembership(userId);
        // TODO: Logic hủy gói thành viên - cập nhật trạng thái gói của người dùng
        // Ví dụ: user.setCurrentMembershipPlan(null);
        // user.setMembershipEndDate(null);
        // userDAO.save(user);
        return user;
    }

    /**
     * Gia hạn gói thành viên
     */
    public PaymentResponse renewMembership(String userId, MembershipUpgradeRequest request) {
        // Logic tương tự như nâng cấp nhưng cho gia hạn
        return upgradeMembership(userId, request);
    }

    /**
     * Lấy danh sách ưu đãi có sẵn
     */
    public List<Object> getAvailableDiscounts(String userId) {
        // Dữ liệu giả lập hoặc lấy từ DB thực tế
        List<Object> discounts = new ArrayList<>();
        // Ví dụ: discounts.add(new DiscountDTO("WELCOME10", "10% off for new members"));
        return discounts;
    }

    /**
     * Áp dụng mã giảm giá
     */
    public Object applyDiscount(String userId, String discountCode) {
        // TODO: Logic kiểm tra và áp dụng mã giảm giá
        return "Mã giảm giá đã được áp dụng: " + discountCode;
    }
}