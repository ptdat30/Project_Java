--
 Database Schema cho Smoking Cessation Support Platform
-- Tạo database
CREATE DATABASE IF NOT EXISTS smoking_cessation_db;
USE smoking_cessation_db;
-- Bảng users (đã có sẵn, cải tiến)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255),
    email VARCHAR(100) UNIQUE NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    google_id VARCHAR(100),
    picture_url TEXT,
    auth_provider ENUM('LOCAL', 'GOOGLE') DEFAULT 'LOCAL',
    role ENUM('GUEST', 'MEMBER', 'COACH', 'ADMIN') NOT NULL,
    user_type VARCHAR(31) NOT NULL, -- For JPA inheritance
    membership_plan ENUM('FREE', 'BASIC', 'PREMIUM', 'VIP'),
    membership_end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
-- Bảng smoking_status - Ghi nhận tình trạng hút thuốc hiện tại
CREATE TABLE IF NOT EXISTS smoking_status (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    cigarettes_per_day INT NOT NULL,
    smoking_frequency VARCHAR(50), -- 'DAILY', 'WEEKLY', 'OCCASIONALLY'
    cost_per_pack DECIMAL(10,2),
    packs_per_day DECIMAL(5,2),
    years_smoking INT,
    brand VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
-- Bảng quit_plans - Kế hoạch cai thuốc
CREATE TABLE IF NOT EXISTS quit_plans (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    reason TEXT NOT NULL,
    start_date DATE NOT NULL,
    target_quit_date DATE NOT NULL,
    plan_type ENUM('GRADUAL', 'COLD_TURKEY', 'NICOTINE_REPLACEMENT') DEFAULT 'GRADUAL',
    status ENUM('PLANNING', 'ACTIVE', 'COMPLETED', 'PAUSED', 'FAILED') DEFAULT 'PLANNING',
    daily_reduction_goal INT, -- Số điếu giảm mỗi ngày
    milestones TEXT, -- JSON string cho các mốc quan trọng
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
-- Bảng daily_progress - Tiến trình hàng ngày
CREATE TABLE IF NOT EXISTS daily_progress (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    quit_plan_id VARCHAR(36),
    date DATE NOT NULL,
    cigarettes_smoked INT DEFAULT 0,
    mood_rating INT CHECK (mood_rating >= 1 AND mood_rating <= 10),
    stress_level INT CHECK (stress_level >= 1 AND stress_level <= 10),
    cravings_intensity INT CHECK (cravings_intensity >= 1 AND cravings_intensity <= 10),
    notes TEXT,
    money_saved DECIMAL(10,2) DEFAULT 0,
    health_improvements TEXT, -- JSON string
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (quit_plan_id) REFERENCES quit_plans(id) ON DELETE SET NULL,
    UNIQUE KEY unique_user_date (user_id, date)
);
-- Bảng achievements - Huy hiệu thành tích
CREATE TABLE IF NOT EXISTS achievements (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url TEXT,
    criteria_type ENUM('DAYS_SMOKE_FREE', 'MONEY_SAVED', 'CIGARETTES_AVOIDED', 'MILESTONES') NOT NULL,
    criteria_value INT NOT NULL, -- Giá trị cần đạt
    badge_color VARCHAR(20) DEFAULT 'GOLD',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Bảng user_achievements - Thành tích của người dùng
CREATE TABLE IF NOT EXISTS user_achievements (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    achievement_id VARCHAR(36) NOT NULL,
    earned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_shared BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_achievement (user_id, achievement_id)
);
-- Bảng community_posts - Chia sẻ cộng đồng
CREATE TABLE IF NOT EXISTS community_posts (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    post_type ENUM('ACHIEVEMENT_SHARE', 'MOTIVATION', 'QUESTION', 'ADVICE') NOT NULL,
    achievement_id VARCHAR(36), -- Nếu là chia sẻ thành tích
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE SET NULL
);
-- Bảng community_comments - Bình luận bài viết
CREATE TABLE IF NOT EXISTS community_comments (
    id VARCHAR(36) PRIMARY KEY,
    post_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    content TEXT NOT NULL,
    parent_comment_id VARCHAR(36), -- Cho reply
    likes_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES community_comments(id) ON DELETE CASCADE
);
-- Bảng coach_consultations - Tư vấn với huấn luyện viên
CREATE TABLE IF NOT EXISTS coach_consultations (
    id VARCHAR(36) PRIMARY KEY,
    member_id VARCHAR(36) NOT NULL,
    coach_id VARCHAR(36) NOT NULL,
    session_type ENUM('CHAT', 'VIDEO_CALL', 'PHONE_CALL') DEFAULT 'CHAT',
    status ENUM('SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED') DEFAULT 'SCHEDULED',
    scheduled_time TIMESTAMP,
    duration_minutes INT,
    notes TEXT,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    cost DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (coach_id) REFERENCES users(id) ON DELETE CASCADE
);
-- Bảng chat_messages - Tin nhắn tư vấn
CREATE TABLE IF NOT EXISTS chat_messages (
    id VARCHAR(36) PRIMARY KEY,
    consultation_id VARCHAR(36) NOT NULL,
    sender_id VARCHAR(36) NOT NULL,
    message_type ENUM('TEXT', 'IMAGE', 'FILE') DEFAULT 'TEXT',
    content TEXT NOT NULL,
    file_url TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (consultation_id) REFERENCES coach_consultations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);
-- Bảng membership_plans - Gói thành viên
CREATE TABLE IF NOT EXISTS membership_plans (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    duration_months INT NOT NULL,
    features TEXT, -- JSON string cho danh sách tính năng
    max_coach_sessions INT,
    priority_support BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Bảng notifications - Hệ thống thông báo
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    notification_type ENUM('MOTIVATION', 'ACHIEVEMENT', 'REMINDER', 'SYSTEM') NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    scheduled_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
-- Bảng leaderboard - Bảng xếp hạng
CREATE TABLE IF NOT EXISTS leaderboard (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    score INT DEFAULT 0,
    days_smoke_free INT DEFAULT 0,
    money_saved DECIMAL(10,2) DEFAULT 0,
    total_achievements INT DEFAULT 0,
    rank_position INT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_leaderboard (user_id)
);
-- Thêm dữ liệu mẫu cho achievements
INSERT INTO achievements (id, name, description, criteria_type, criteria_value, badge_color) VALUES
(UUID(), 'First Day Smoke-Free', 'Hoàn thành ngày đầu tiên không hút thuốc', 'DAYS_SMOKE_FREE', 1, 'BRONZE'),
(UUID(), 'One Week Champion', 'Không hút thuốc trong 1 tuần', 'DAYS_SMOKE_FREE', 7, 'SILVER'),
(UUID(), 'One Month Hero', 'Không hút thuốc trong 1 tháng', 'DAYS_SMOKE_FREE', 30, 'GOLD'),
(UUID(), 'Money Saver 100K', 'Tiết kiệm được 100,000 VND', 'MONEY_SAVED', 100000, 'GOLD'),
(UUID(), 'Money Saver 500K', 'Tiết kiệm được 500,000 VND', 'MONEY_SAVED', 500000, 'DIAMOND'),
(UUID(), 'Cigarette Avoider 100', 'Tránh được 100 điếu thuốc', 'CIGARETTES_AVOIDED', 100, 'SILVER'),
(UUID(), 'Cigarette Avoider 1000', 'Tránh được 1000 điếu thuốc', 'CIGARETTES_AVOIDED', 1000, 'GOLD');
-- Thêm dữ liệu mẫu cho membership plans
INSERT INTO membership_plans (id, name, description, price, duration_months, features, max_coach_sessions) VALUES
(UUID(), 'FREE', 'Gói miễn phí cơ bản', 0, 1, '["Theo dõi tiến trình", "Cộng đồng cơ bản"]', 0),
(UUID(), 'BASIC', 'Gói cơ bản với tư vấn', 99000, 1, '["Theo dõi tiến trình", "Tư vấn với coach", "Thống kê chi tiết"]', 2),
(UUID(), 'PREMIUM', 'Gói cao cấp', 199000, 1, '["Tất cả tính năng BASIC", "Tư vấn ưu tiên", "Kế hoạch cá nhân hóa"]', 5),
(UUID(), 'VIP', 'Gói VIP đầy đủ tính năng', 399000, 1, '["Tất cả tính năng", "Tư vấn 24/7", "Hỗ trợ cá nhân"]', 999);
-- Tạo user admin mặc định
INSERT INTO users (id, username, password, email, first_name, last_name, role, user_type, created_at) VALUES 
('admin-uuid-123', 'admin', '$2a$10$example.hash.here', 'admin@quitsmoking.com', 'Admin', 'User', 'ADMIN', 'Admin', NOW());