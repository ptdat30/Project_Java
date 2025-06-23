package com.quitsmoking.dto.response;

import com.quitsmoking.dto.response.AuthResponse;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpgradeMembershipResponse {
    private PaymentResponse paymentResponse;
    private AuthResponse authResponse;
}
