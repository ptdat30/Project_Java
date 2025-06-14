package com.quitsmoking.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate; // Để lưu ngày tháng

@Entity
@Table(name = "smoking_status") // Tên bảng trong database
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SmokingStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // ID tự động tăng
    private Long id;

    // Mối quan hệ Many-to-One với User
    @ManyToOne(fetch = FetchType.LAZY) // Lazy loading: chỉ load User khi cần thiết
    @JoinColumn(name = "user_id", nullable = false) // Tên cột khóa ngoại trong bảng smoking_status
    private User user; // Đối tượng User mà bản ghi này thuộc về

    @Column(name = "soluongdieuthuoc", nullable = false)
    private Integer numberOfCigarettes; // Số lượng điếu thuốc hút

    @Column(name = "tansuat", nullable = false)
    private String frequency; // Tần suất hút (ví dụ: "daily", "weekly", "occasionally")

    @Column(name = "giatien") // Có thể null nếu người dùng không muốn nhập
    private Double costPerPack; // Giá tiền mỗi gói thuốc (ví dụ: VND)

    @Column(name = "tinhtrang", nullable = false)
    private LocalDate recordDate; // Ngày ghi nhận tình trạng

    // Có thể thêm các trường khác nếu cần thiết, ví dụ:
    // private String notes;
}