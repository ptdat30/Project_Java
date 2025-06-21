// src/components/laylaimatkhau/laylaimatkhau3.jsx
import React from 'react';

const LayLaiMatKhau3 = ({ status, errorMessage, onGoToLogin, onStartOver }) => {
  const isSuccess = status === 'success';

  return (
      <div className="password-reset-step">
        <div className="reset-form-container">
          <div className={`result-container ${isSuccess ? 'success' : 'error'}`}>
            <div className="result-icon">
              {isSuccess ? '✅' : '❌'}
            </div>

            <h2>
              {isSuccess ? 'Thành công!' : 'Có lỗi xảy ra'}
            </h2>

            <p className="result-message">
              {isSuccess
                  ? 'Mật khẩu của bạn đã được đặt lại thành công. Bạn có thể đăng nhập với mật khẩu mới.'
                  : errorMessage || 'Không thể đặt lại mật khẩu. Vui lòng thử lại hoặc liên hệ hỗ trợ.'
              }
            </p>

            <div className="result-actions">
              <button
                  type="button"
                  className="submit-btn"
                  onClick={onGoToLogin}
              >
                {isSuccess ? 'Đăng nhập ngay' : 'Quay lại đăng nhập'}
              </button>

              {!isSuccess && (
                  <button
                      type="button"
                      className="link-btn"
                      onClick={onStartOver}
                  >
                    Thử lại từ đầu
                  </button>
              )}
            </div>
          </div>
        </div>
      </div>
  );
};

export default LayLaiMatKhau3;