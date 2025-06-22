package com.quitsmoking.controllers;

import com.quitsmoking.model.User;
import com.quitsmoking.reponsitories.UserDAO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = {"http://localhost:4173", "http://localhost:3000", "http://localhost:5173"})
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);
    private final UserDAO userDAO;

    @Autowired
    public UserController(UserDAO userDAO) {
        this.userDAO = userDAO;
    }

    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    @Transactional
    public ResponseEntity<?> getUserProfile() {
        try {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

            String identifier;
            if (principal instanceof UserDetails) {
                identifier = ((UserDetails) principal).getUsername();
            } else if (principal instanceof User) {
                identifier = ((User) principal).getEmail();
            } else {
                logger.warn("Unexpected principal type: {}", principal.getClass().getName());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                     .body(Map.of("message", "Không thể xác định người dùng đã xác thực."));
            }

            // User user = userDAO.findByEmailOrUsername(identifier)
            //     .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng với định danh: " + identifier));


            // Tạo đối tượng profile để trả về
            User user = userDAO.findByEmailOrUsernameWithMembership(identifier) // <--- DÙNG PHƯƠNG THỨC NÀY
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng với định danh: " + identifier));

            Map<String, Object> profile = new HashMap<>();
            profile.put("id", user.getId());
            profile.put("username", user.getUsername());
            profile.put("email", user.getEmail());
            profile.put("firstName", user.getFirstName());
            profile.put("lastName", user.getLastName());
            profile.put("role", user.getRole().name());
            profile.put("pictureUrl", user.getPictureUrl());

            
            if (user.getCurrentMembershipPlan() != null) {
                Map<String, Object> membershipDetails = new HashMap<>();
                membershipDetails.put("planName", user.getCurrentMembershipPlan().getPlanName());
                membershipDetails.put("startDate", user.getMembershipStartDate());
                membershipDetails.put("endDate", user.getMembershipEndDate());
                profile.put("membership", membershipDetails);
            } else {
                profile.put("membership", null);
            }
            profile.put("freePlanClaimed", user.isFreePlanClaimed());

            logger.info("Đã lấy thành công profile người dùng: {}", user.getUsername());
            return ResponseEntity.ok(profile);

            // profile.put("id", userWithMembership.getId());
            // profile.put("username", userWithMembership.getUsername());
            // profile.put("email", userWithMembership.getEmail());
            // profile.put("firstName", userWithMembership.getFirstName());
            // profile.put("lastName", userWithMembership.getLastName());
            // profile.put("role", userWithMembership.getRole().name());
            // profile.put("pictureUrl", userWithMembership.getPictureUrl());

            // if (userWithMembership.getCurrentMembershipPlan() != null) {
            //     Map<String, Object> membershipDetails = new HashMap<>();
            //     membershipDetails.put("planName", userWithMembership.getCurrentMembershipPlan().getPlanName());
            //     membershipDetails.put("startDate", userWithMembership.getMembershipStartDate());
            //     membershipDetails.put("endDate", userWithMembership.getMembershipEndDate());
            //     profile.put("membership", membershipDetails);
            // } else {
            //     profile.put("membership", null);
            // }
            // profile.put("freePlanClaimed", userWithMembership.isFreePlanClaimed());

            // logger.info("Đã lấy thành công profile người dùng: {}", userWithMembership.getUsername());
            // return ResponseEntity.ok(profile);

        } catch (UsernameNotFoundException e) {
            logger.warn("Yêu cầu profile người dùng nhưng không tìm thấy: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            logger.error("Lỗi khi lấy profile người dùng đã xác thực: {}", e.getMessage(), e);
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body(Map.of("message", "Đã xảy ra lỗi nội bộ khi lấy profile người dùng. Vui lòng thử lại sau."));
        }
    }
}