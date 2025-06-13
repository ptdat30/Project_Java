package com.quitsmoking.services; // Đảm bảo đúng package của bạn

import com.quitsmoking.dto.request.SmokingStatusRequest;
import com.quitsmoking.model.SmokingStatus;
import com.quitsmoking.model.User; // Cần thiết để liên kết trạng thái với User
import com.quitsmoking.reponsitories.SmokingStatusDAO;
import com.quitsmoking.reponsitories.UserDAO; // Để tìm User
import org.springframework.stereotype.Service;

// import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class SmokingStatusService {

    private final SmokingStatusDAO smokingStatusDAO;
    private final UserDAO userDAO; // Inject UserDAO để tìm User

    public SmokingStatusService(SmokingStatusDAO smokingStatusDAO, UserDAO userDAO) {
        this.smokingStatusDAO = smokingStatusDAO;
        this.userDAO = userDAO;
    }

    // Thêm bản ghi tình trạng hút thuốc mới
    public SmokingStatus addSmokingStatus(String userId, SmokingStatusRequest request) {
        // Tìm User theo ID
        User user = userDAO.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        // Kiểm tra xem đã có bản ghi cho ngày hôm nay chưa (tùy chọn, nếu bạn muốn chỉ có 1 bản ghi/ngày)
        // Nếu muốn cho phép nhiều bản ghi trong một ngày, hãy bỏ qua phần kiểm tra này
        Optional<SmokingStatus> existingStatus = smokingStatusDAO.findByUserAndRecordDate(user, request.getRecordDate());
        if (existingStatus.isPresent()) {
            // Bạn có thể chọn ném lỗi, hoặc cập nhật bản ghi hiện có
            throw new RuntimeException("Smoking status already recorded for this user on this date. Consider updating instead.");
        }


        SmokingStatus newStatus = new SmokingStatus();
        newStatus.setUser(user);
        newStatus.setNumberOfCigarettes(request.getNumberOfCigarettes());
        newStatus.setFrequency(request.getFrequency());
        newStatus.setCostPerPack(request.getCostPerPack());
        newStatus.setRecordDate(request.getRecordDate());

        return smokingStatusDAO.save(newStatus);
    }

    // Lấy tất cả bản ghi tình trạng hút thuốc của một người dùng
    public List<SmokingStatus> getAllSmokingStatusesByUser(String userId) {
        User user = userDAO.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        return smokingStatusDAO.findByUser(user);
    }

    // Lấy một bản ghi tình trạng hút thuốc theo ID
    public Optional<SmokingStatus> getSmokingStatusById(Long id) {
        return smokingStatusDAO.findById(id);
    }

    // Cập nhật bản ghi tình trạng hút thuốc
    public SmokingStatus updateSmokingStatus(Long statusId, SmokingStatusRequest request) {
        SmokingStatus existingStatus = smokingStatusDAO.findById(statusId)
                .orElseThrow(() -> new RuntimeException("Smoking status not found with ID: " + statusId));

        existingStatus.setNumberOfCigarettes(request.getNumberOfCigarettes());
        existingStatus.setFrequency(request.getFrequency());
        existingStatus.setCostPerPack(request.getCostPerPack());
        existingStatus.setRecordDate(request.getRecordDate()); // Cập nhật ngày ghi nhận nếu cần

        return smokingStatusDAO.save(existingStatus);
    }

    // Xóa bản ghi tình trạng hút thuốc
    public void deleteSmokingStatus(Long id) {
        smokingStatusDAO.deleteById(id);
    }
}