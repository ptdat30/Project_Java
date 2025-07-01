CREATE TABLE smoking_status (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    loaithuoc VARCHAR(50) NOT NULL,
    hieuthuoc VARCHAR(100),
    `soluongdieuthuoc/ngay` INT NOT NULL,
    donvi VARCHAR(20),
    `giatien/goi` DECIMAL(10,2),
    timedudung INT,
    tinhtrangSucKhoe VARCHAR(200),
    ghinhantinhtrang DATE NOT NULL,
    capnhattinhtrang DATE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
