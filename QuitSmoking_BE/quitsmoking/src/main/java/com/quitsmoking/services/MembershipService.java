package com.quitsmoking.services;

import com.quitsmoking.model.User;
import com.quitsmoking.reponsitories.UserDAO;
import com.quitsmoking.model.MembershipTransaction;
import com.quitsmoking.model.MembershipPlan; // <-- Đảm bảo đây là MembershipPlan entity
import com.quitsmoking.model.MembershipPlanType; // <-- Vẫn giữ nếu bạn muốn cung cấp các loại gói enum
import com.quitsmoking.reponsitories.MembershipPlanRepository; // <-- Repository cho MembershipPlan entity
import com.quitsmoking.reponsitories.MembershipTransactionRepository; // <-- Rất quan trọng: cần cho MembershipTransaction
import com.quitsmoking.dto.request.MembershipUpgradeRequest;
import com.quitsmoking.dto.response.AuthResponse;
import com.quitsmoking.dto.response.MembershipPlanResponse;
import com.quitsmoking.dto.response.PaymentResponse;
import com.quitsmoking.dto.response.UpgradeMembershipResponse;
import com.quitsmoking.exceptions.ResourceNotFoundException; // Custom exception
import com.quitsmoking.exceptions.BadRequestException;
import com.quitsmoking.model.Role;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;
// import java.util.Map;
// import java.util.Optional;
// import java.util.HashMap;
import java.util.ArrayList; // Dùng cho dữ liệu giả lập
import java.util.UUID;
import java.math.BigDecimal; // Đảm bảo có import này cho BigDecimal

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
/**
 * Service quản lý gói thành viên và thanh toán
 */
@Service
@Transactional
public class MembershipService {

    private static final Logger logger = LoggerFactory.getLogger(MembershipService.class);
    
    @Autowired
    private UserDAO userDAO;

    @Autowired
    private MembershipPlanRepository membershipPlanRepository; // Sử dụng để tương tác với MembershipPlan entity

    @Autowired
    private MembershipTransactionRepository membershipTransactionRepository; // <-- THÊM: Repository cho MembershipTransaction

    /**
     * Lấy thông tin gói thành viên hiện tại của người dùng
     */
    public User getCurrentMembership(String userId) {
        return userDAO.findByIdWithMembership(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + userId));
    }

    /**
     * Lấy danh sách các gói thành viên có sẵn (từ database)
     * Phương thức này sẽ lấy các gói thành viên (entity) đang hoạt động từ DB
     */
    public List<MembershipPlan> getAvailablePlans() {
        return membershipPlanRepository.findByIsActiveTrue();
    }

    public List<MembershipPlanType> getAllMembershipPlanTypes() {
        return List.of(MembershipPlanType.values());
    }

    /**
     * Đăng ký gói "Trãi Nghiệm" miễn phí cho người dùng.
     * Người dùng chỉ có thể đăng ký gói này một lần.
     */
    public User claimFreeMembership(String userId) {
        User user = getCurrentMembership(userId); // Sẽ throw ResourceNotFoundException nếu không tìm thấy user

        // 1. Kiểm tra xem người dùng đã từng đăng ký gói FREE chưa
        if (user.isFreePlanClaimed()) {
            throw new BadRequestException("Bạn đã đăng ký gói 'Trãi Nghiệm' miễn phí này rồi và chỉ có thể đăng ký một lần.");
        }

        // 1.2 Kiểm tra vai trò của người dùng
        if (user.getRole() == Role.MEMBER) {
             throw new BadRequestException("Bạn đã là thành viên. Không thể đăng ký gói dùng thử.");
        }

        // 2. Tìm gói "Trãi Nghiệm" từ database BẰNG ENUM TYPE
        MembershipPlan freePlan = membershipPlanRepository.findByPlanType(MembershipPlanType.THIRTY_DAYS_TRIAL) // <-- ĐÃ SỬA ĐỔI Ở ĐÂY
                .orElseThrow(() -> new ResourceNotFoundException("Gói 'Trãi Nghiệm' (THIRTY_DAYS_TRIAL) không tìm thấy trong hệ thống. Vui lòng liên hệ quản trị viên để cấu hình gói này."));

        // 3. Đảm bảo gói "Trãi Nghiệm" có giá 0
        if (freePlan.getPrice().compareTo(BigDecimal.ZERO) != 0) {
            throw new BadRequestException("Cấu hình gói 'Trãi Nghiệm' bị lỗi. Giá không phải là 0.");
        }

        // 4. Cập nhật thông tin gói thành viên cho người dùng
        user.setCurrentMembershipPlan(freePlan);
        user.setMembershipStartDate(LocalDate.now());
        user.setMembershipEndDate(LocalDate.now().plusDays(freePlan.getDurationDays()));
        user.setFreePlanClaimed(true); // Đánh dấu đã claim gói FREE

        // 4.1 Cập nhật vai trò của người 
        user.setRole(Role.MEMBER);

        // 5. Lưu lại thông tin người dùng đã cập nhật
        User updatedUser = userDAO.save(user);

        // 6. Ghi lại giao dịch (Transaction) cho gói miễn phí
        MembershipTransaction transaction = new MembershipTransaction();
        // transaction.setId(UUID.randomUUID().toString());
        transaction.setUser(user);
        transaction.setMembershipPlan(freePlan);
        transaction.setAmount(BigDecimal.ZERO); // Giá là 0
        transaction.setDiscountAmount(BigDecimal.ZERO); // Không có discount
        transaction.setFinalAmount(BigDecimal.ZERO); // Final amount là 0
        transaction.setPaymentStatus(MembershipTransaction.PaymentStatus.COMPLETED); // Trạng thái là COMPLETED ngay lập tức
        transaction.setTransactionType(MembershipTransaction.TransactionType.FREE_TRIAL); // Loại giao dịch mới
        transaction.setCreatedAt(LocalDateTime.now());
        transaction.setCompletedAt(LocalDateTime.now()); // Thời gian hoàn thành

        membershipTransactionRepository.save(transaction);

        return updatedUser;
    }

    /**
     * Nâng cấp gói thành viên
     */
    @Transactional
    public UpgradeMembershipResponse upgradeMembership(String userId, MembershipUpgradeRequest request) {
        User user = getCurrentMembership(userId);

        MembershipPlan newPlan = membershipPlanRepository.findById(request.getPlanId())
                .orElseThrow(() -> new ResourceNotFoundException("Gói thành viên không hợp lệ hoặc không tìm thấy."));

        if (user.getCurrentMembershipPlan() != null && user.getCurrentMembershipPlan().getPlanType().getPriority() >= newPlan.getPlanType().getPriority()) {
            throw new BadRequestException("Bạn không thể nâng cấp xuống gói thấp hơn hoặc gói hiện tại.");
        }

        if (newPlan.getPlanType() == MembershipPlanType.THIRTY_DAYS_TRIAL) {
            throw new BadRequestException("Không thể nâng cấp lên gói 'Trải Nghiệm' thông qua chức năng nâng cấp. Vui lòng sử dụng chức năng đăng ký gói miễn phí.");
        }

        BigDecimal originalPrice = newPlan.getPrice();
        BigDecimal discountAmount = request.getDiscountCode() != null ?
                calculateDiscount(request.getDiscountCode(), originalPrice) : BigDecimal.ZERO;
        BigDecimal finalAmount = originalPrice.subtract(discountAmount);

        MembershipTransaction transaction = new MembershipTransaction();
        transaction.setUser(user);
        transaction.setMembershipPlan(newPlan);
        transaction.setAmount(originalPrice);
        transaction.setDiscountAmount(discountAmount);
        transaction.setFinalAmount(finalAmount);
        // transaction.setPaymentStatus(MembershipTransaction.PaymentStatus.PENDING);
        transaction.setPaymentStatus(MembershipTransaction.PaymentStatus.COMPLETED); // Thanh toán hoàn thành ngay lập tức
        transaction.setTransactionType(MembershipTransaction.TransactionType.UPGRADE);
        transaction.setCreatedAt(LocalDateTime.now());
        transaction.setCompletedAt(LocalDateTime.now()); // Thời gian hoàn thành ngay lập tức
        transaction.setPaymentGatewayReference("DIRECT_UPGRADE_NO_PAYMENT_" + UUID.randomUUID().toString()); // Giả định không cần thanh toán qua cổng thanh toán
        membershipTransactionRepository.save(transaction);

        user.setCurrentMembershipPlan(newPlan);
        if (user.getMembershipEndDate() != null && user.getMembershipEndDate().isAfter(LocalDate.now())) {
            // Nếu gói hiện tại vẫn còn hạn, cộng thêm ngày vào ngày kết thúc hiện tại
            user.setMembershipStartDate(user.getMembershipEndDate());
            user.setMembershipEndDate(user.getMembershipEndDate().plusDays(newPlan.getDurationDays()));
        } else {
            // Nếu gói hiện tại đã hết hạn hoặc không có, bắt đầu từ hôm nay
            user.setMembershipStartDate(LocalDate.now());
            user.setMembershipEndDate(LocalDate.now().plusDays(newPlan.getDurationDays()));
        }
        user.setRole(Role.MEMBER); // Đảm bảo vai trò là MEMBER
        User savedUser = userDAO.save(user);

        // Tải lại người dùng với membership được tải đầy đủ để đảm bảo trạng thái chính xác cho AuthResponse
        User fullyLoadedUser = userDAO.findByIdWithMembership(savedUser.getId())
                                     .orElseThrow(() -> new ResourceNotFoundException("User not found after update: " + savedUser.getId()));

        logger.info("Đã tạo giao dịch nâng cấp gói {} cho user {}. Final Amount: {}", newPlan.getPlanName(), userId, finalAmount);

        // PaymentResponse paymentResponse = new PaymentResponse();
        // paymentResponse.setTransactionId(transaction.getId());
        // paymentResponse.setPaymentUrl("https://your-payment-gateway.com/initiate/" + transaction.getId()); // URL giả định
        // paymentResponse.setStatus(transaction.getPaymentStatus().name());
        // paymentResponse.setAmount(finalAmount);
        // paymentResponse.setMembershipPlan(newPlan.getPlanName());
        
        // // Tạo AuthResponse
        // AuthResponse authResponse = new AuthResponse(null, user);

        // // Tạo UpgradeMembershipResponse và trả về
        // UpgradeMembershipResponse upgradeMembershipResponse = new UpgradeMembershipResponse();
        // upgradeMembershipResponse.setPaymentResponse(paymentResponse);
        // upgradeMembershipResponse.setAuthResponse(authResponse);

        // return upgradeMembershipResponse;

        // Chuẩn bị PaymentResponse (mang tính chất thông báo thành công)
        PaymentResponse paymentResponse = new PaymentResponse();
        paymentResponse.setTransactionId(transaction.getId());
        paymentResponse.setPaymentUrl("N/A - Direct Upgrade"); // URL không áp dụng
        paymentResponse.setStatus(transaction.getPaymentStatus().name()); // Sẽ là COMPLETED
        paymentResponse.setAmount(finalAmount);
        paymentResponse.setMembershipPlan(newPlan.getPlanName());

        // Chuẩn bị AuthResponse với thông tin người dùng đã cập nhật
        AuthResponse authResponse = new AuthResponse(null, fullyLoadedUser);

        // Tạo UpgradeMembershipResponse và trả về
        UpgradeMembershipResponse upgradeMembershipResponse = new UpgradeMembershipResponse();
        upgradeMembershipResponse.setPaymentResponse(paymentResponse);
        upgradeMembershipResponse.setAuthResponse(authResponse);

        return upgradeMembershipResponse;
    }


    /**
     * Phương thức xử lý callback từ cổng thanh toán sau khi thanh toán thành công.
     * Cần được gọi bởi một webhook hoặc endpoint sau khi cổng thanh toán xác nhận thành công.
     */
    @Transactional
    public User completePaymentAndActivateMembership(String transactionId, String paymentGatewayReference) {
        MembershipTransaction transaction = membershipTransactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Giao dịch không tìm thấy với ID: " + transactionId));

        // Kiểm tra nếu giao dịch đã hoàn thành bởi luồng trực tiếp (không qua thanh toán)
        // hoặc bởi cổng thanh toán thật.
        if (transaction.getPaymentStatus() == MembershipTransaction.PaymentStatus.COMPLETED) {
            logger.warn("Giao dịch {} đã ở trạng thái COMPLETED. Không cần xử lý lại.", transactionId);
            return transaction.getUser(); // Trả về user hiện tại của giao dịch
        }

        // Đảm bảo giao dịch đang ở trạng thái PENDING trước khi hoàn thành
        if (!transaction.getPaymentStatus().equals(MembershipTransaction.PaymentStatus.PENDING)) {
            logger.warn("Giao dịch {} không ở trạng thái PENDING. Trạng thái hiện tại: {}", transactionId, transaction.getPaymentStatus());
            throw new BadRequestException("Giao dịch này không hợp lệ để hoàn thành.");
        }

        transaction.setPaymentStatus(MembershipTransaction.PaymentStatus.COMPLETED);
        transaction.setCompletedAt(LocalDateTime.now());
        transaction.setPaymentGatewayReference(paymentGatewayReference);
        membershipTransactionRepository.save(transaction);

        User user = transaction.getUser();
        MembershipPlan plan = transaction.getMembershipPlan();

        user.setCurrentMembershipPlan(plan);
        if (user.getMembershipEndDate() != null && user.getMembershipEndDate().isAfter(LocalDate.now())) {
            user.setMembershipEndDate(user.getMembershipEndDate().plusDays(plan.getDurationDays()));
        } else {
            user.setMembershipEndDate(LocalDate.now().plusDays(plan.getDurationDays()));
        }
        user.setRole(Role.MEMBER);

        User updatedUser = userDAO.save(user);
        logger.info("Giao dịch {} hoàn thành. Gói thành viên {} đã được kích hoạt cho user {}", transactionId, plan.getPlanName(), user.getId());
        return updatedUser;
    }

    // --- Các phương thức khác ---

    private BigDecimal calculateDiscount(String discountCode, BigDecimal originalPrice) {
        if ("DISCOUNT10".equals(discountCode)) {
            return originalPrice.multiply(BigDecimal.valueOf(0.10));
        }
        return BigDecimal.ZERO;
    }

    public User getUserWithMembership(String userId) {
        return userDAO.findByIdWithMembership(userId).orElse(null);
    }

    @Transactional(readOnly = true)
    public List<MembershipTransaction> getMembershipTransactions(String userId) {
        return membershipTransactionRepository.findByUser_Id(userId); // Giờ đã JOIN FETCH
    }

    @Transactional(readOnly = true)
    public MembershipTransaction checkPaymentStatus(String userId, String transactionId) {
        MembershipTransaction transaction = membershipTransactionRepository.findByIdAndUser_Id(transactionId, userId) // Giờ đã JOIN FETCH
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giao dịch với ID: " + transactionId));

        if (!transaction.getUser().getId().equals(userId)) {
            throw new BadRequestException("Giao dịch không thuộc về người dùng này.");
        }
        return transaction;
    }

    public User cancelMembership(String userId) {
        User user = getCurrentMembership(userId);
        MembershipPlan defaultFreePlan = membershipPlanRepository.findByPlanType(MembershipPlanType.THIRTY_DAYS_TRIAL)
                .orElseThrow(() -> new ResourceNotFoundException("Gói 'Trãi Nghiệm' mặc định không tìm thấy. Vui lòng liên hệ quản trị viên để cấu hình gói này."));
        user.setCurrentMembershipPlan(defaultFreePlan);
        user.setMembershipEndDate(null); // Hoặc bạn có thể đặt ngày kết thúc gói dùng thử nếu muốn
        return userDAO.save(user);
    }

    public PaymentResponse renewMembership(String userId, MembershipUpgradeRequest request) {
        User user = getCurrentMembership(userId);
        MembershipPlan newPlan = membershipPlanRepository.findById(request.getPlanId())
                .orElseThrow(() -> new ResourceNotFoundException("Gói thành viên không hợp lệ."));

        if (user.getCurrentMembershipPlan() == null || !user.getCurrentMembershipPlan().getId().equals(newPlan.getId())) {
            throw new BadRequestException("Bạn chỉ có thể gia hạn gói hiện tại.");
        }

        BigDecimal planPrice = newPlan.getPrice();
        BigDecimal discountAmount = request.getDiscountCode() != null ?
                calculateDiscount(request.getDiscountCode(), planPrice) : BigDecimal.ZERO;
        
        // Tạo giao dịch và đặt trạng thái LÀ COMPLETED ngay lập tức cho gia hạn
        MembershipTransaction transaction = new MembershipTransaction();
        transaction.setUser(user);
        transaction.setMembershipPlan(newPlan);
        transaction.setAmount(planPrice);
        transaction.setDiscountAmount(discountAmount);
        transaction.setFinalAmount(transaction.getAmount().subtract(transaction.getDiscountAmount()));
        transaction.setPaymentStatus(MembershipTransaction.PaymentStatus.COMPLETED); // <-- TRẠNG THÁI HOÀN THÀNH NGAY
        transaction.setTransactionType(MembershipTransaction.TransactionType.RENEWAL);
        transaction.setCreatedAt(LocalDateTime.now());
        transaction.setCompletedAt(LocalDateTime.now()); // <-- Thời gian hoàn thành
        transaction.setPaymentGatewayReference("DIRECT_RENEWAL_NO_PAYMENT_" + UUID.randomUUID().toString()); // Tham chiếu giả lập
        membershipTransactionRepository.save(transaction);

        // Kích hoạt gói thành viên cho người dùng ngay lập tức (gia hạn)
        if (user.getMembershipEndDate() != null && user.getMembershipEndDate().isAfter(LocalDate.now())) {
            // Nếu gói hiện tại vẫn còn hạn, cộng thêm ngày vào ngày kết thúc hiện tại
            user.setMembershipEndDate(user.getMembershipEndDate().plusDays(newPlan.getDurationDays()));
        } else {
            // Nếu gói hiện tại đã hết hạn hoặc không có, bắt đầu từ hôm nay
            user.setMembershipEndDate(LocalDate.now().plusDays(newPlan.getDurationDays()));
        }
        // user.setRole(Role.MEMBER); // Vai trò đã là MEMBER nên không cần thay đổi
        userDAO.save(user);

        PaymentResponse response = new PaymentResponse();
        response.setTransactionId(transaction.getId());
        response.setPaymentUrl("N/A - Direct Renewal"); // URL không áp dụng
        response.setStatus(transaction.getPaymentStatus().name()); // Sẽ là COMPLETED
        response.setAmount(transaction.getFinalAmount());
        response.setMembershipPlan(newPlan.getPlanName());
        return response;
    }

    public List<Object> getAvailableDiscounts(String userId) {
        List<Object> discounts = new ArrayList<>();
        return discounts;
    }

    public Object applyDiscount(String userId, String discountCode) {
        return "Mã giảm giá đã được áp dụng: " + discountCode;
    }

    public User getUserById(String userId) {
        return userDAO.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }
}