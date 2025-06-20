// com.quitsmoking.reponsitories.MembershipTransactionRepository.java
package com.quitsmoking.reponsitories;

import com.quitsmoking.model.MembershipTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MembershipTransactionRepository extends JpaRepository<MembershipTransaction, String> {
    // Phương thức tùy chỉnh để tìm giao dịch theo ID người dùng
    List<MembershipTransaction> findByUser_Id(String userId);
}