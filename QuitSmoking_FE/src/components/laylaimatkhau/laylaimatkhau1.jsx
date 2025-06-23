// src/components/laylaimatkhau/laylaimatkhau1.jsx
import React, { useState } from 'react';
import { passwordResetAPI } from '../../services/passwordResetAPI';

const LayLaiMatKhau1 = ({ onEmailSubmitted, onGoToLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (!email.trim()) {
      setError('Vui lòng nhập email');
      return;
    }

    if (!validateEmail(email)) {
      setError('Email không hợp lệ');
      return;
    }

    setLoading(true);

    try {
      const response = await passwordResetAPI.sendResetOTP(email);

      if (response.success) {
        // Chuyển sang bước 2 với email đã nhập
        onEmailSubmitted(email);
      } else {
        if (response.errors) {
          setFieldErrors(response.errors);
        } else {
          setError(response.message || 'Có lỗi xảy ra, vui lòng thử lại');
        }
      }
    } catch (error) {
      setError(error.message || 'Không thể kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="password-reset-step">
        <div className="reset-form-container">
          <h2>Quên mật khẩu</h2>
          <p className="instruction">
            Nhập email của bạn để nhận mã OTP đặt lại mật khẩu
          </p>

          <form onSubmit={handleSubmit} className="reset-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email của bạn"
                  disabled={loading}
                  className={error || fieldErrors.email ? 'error' : ''}
              />
              {fieldErrors.email && (
                  <span className="field-error">{fieldErrors.email}</span>
              )}
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
                type="submit"
                className="submit-btn"
                disabled={loading}
            >
              {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
            </button>
          </form>

          <div className="form-footer">
            <button
                type="button"
                className="link-btn"
                onClick={onGoToLogin}
            >
              Quay lại đăng nhập
            </button>
          </div>
        </div>
      </div>
  );
};

export default LayLaiMatKhau1;
