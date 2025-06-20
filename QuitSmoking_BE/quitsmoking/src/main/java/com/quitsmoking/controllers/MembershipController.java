package com.quitsmoking.controllers;
import com.quitsmoking.model.User;
import com.quitsmoking.model.MembershipPlan;
import com.quitsmoking.model.MembershipPlanType;
import com.quitsmoking.model.MembershipTransaction;
import com.quitsmoking.services.MembershipService;
import com.quitsmoking.dto.request.MembershipUpgradeRequest;
import com.quitsmoking.dto.response.PaymentResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;
/**
 * Controller quản lý gói thành viên
 */
@RestController
@RequestMapping("/api/membership")
@CrossOrigin(origins = "*")
public class MembershipController {
    @Autowired
    private MembershipService membershipService;
    /**
     * Lấy thông tin gói thành viên hiện tại
     */
    @GetMapping("/current")
    public ResponseEntity<User> getCurrentMembership(@AuthenticationPrincipal User user) {
        User currentUser = membershipService.getCurrentMembership(user.getId());
        return ResponseEntity.ok(currentUser);
    }
    /**
     * Lấy danh sách các gói thành viên khả dụng
     */
    @GetMapping("/plans")
    public ResponseEntity<List<MembershipPlan>> getAvailablePlans() {
        List<MembershipPlan> plans = membershipService.getAvailablePlans();
        return ResponseEntity.ok(plans);
    }
    /**
     * Nâng cấp gói thành viên
     */
    @PostMapping("/upgrade")
    public ResponseEntity<PaymentResponse> upgradeMembership(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody MembershipUpgradeRequest request) {
        
        PaymentResponse response = membershipService.upgradeMembership(user.getId(), request);
        return ResponseEntity.ok(response);
    }
    /**
     * Lấy lịch sử giao dịch membership
     */
    @GetMapping("/transactions")
    public ResponseEntity<List<MembershipTransaction>> getMembershipTransactions(
            @AuthenticationPrincipal User user) {
        
        List<MembershipTransaction> transactions = membershipService.getMembershipTransactions(user.getId());
        return ResponseEntity.ok(transactions);
    }
    /**
     * Kiểm tra trạng thái thanh toán
     */
    @GetMapping("/payment-status/{transactionId}")
    public ResponseEntity<MembershipTransaction> checkPaymentStatus(
            @AuthenticationPrincipal User user,
            @PathVariable String transactionId) {
        
        MembershipTransaction transaction = membershipService.checkPaymentStatus(user.getId(), transactionId);
        return ResponseEntity.ok(transaction);
    }
    /**
     * Hủy gói thành viên (downgrade về FREE)
     */
    @PostMapping("/cancel")
    public ResponseEntity<User> cancelMembership(@AuthenticationPrincipal User user) {
        User updatedUser = membershipService.cancelMembership(user.getId());
        return ResponseEntity.ok(updatedUser);
    }
    /**
     * Gia hạn gói thành viên
     */
    @PostMapping("/renew")
    public ResponseEntity<PaymentResponse> renewMembership(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody MembershipUpgradeRequest request) {
        
        PaymentResponse response = membershipService.renewMembership(user.getId(), request);
        return ResponseEntity.ok(response);
    }
    /**
     * Kiểm tra ưu đãi/discount
     */
    @GetMapping("/discounts")
    public ResponseEntity<List<Object>> getAvailableDiscounts(@AuthenticationPrincipal User user) {
        List<Object> discounts = membershipService.getAvailableDiscounts(user.getId());
        return ResponseEntity.ok(discounts);
    }
    /**
     * Áp dụng mã giảm giá
     */
    @PostMapping("/apply-discount")
    public ResponseEntity<Object> applyDiscount(
            @AuthenticationPrincipal User user,
            @RequestBody String discountCode) {
        
        Object discount = membershipService.applyDiscount(user.getId(), discountCode);
        return ResponseEntity.ok(discount);
    }
}