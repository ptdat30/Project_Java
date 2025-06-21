// src/components/laylaimatkhau/laylaimatkhau2.jsx
import React, { useState, useEffect } from 'react';
import { passwordResetAPI } from '../../services/passwordResetAPI';

const LayLaiMatKhau2 = ({
                          email,
                          onPasswordResetSuccess,
                          onPasswordResetError,
                          onGoToLogin,
                          onBackToStep1,
                          errorMessage
                        }) => {
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [countdown, setCountdown] = useState(300); // 5 phút = 300 giây

  // Đếm ngược thời gian hết hạn OTP
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Hiển thị error từ parent component
  useEffect(() => {
    if (errorMessage) {
      setError(errorMessage);
    }
  }, [errorMessage]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!otp.trim()) {
      newErrors.otp = 'Vui lòng nhập mã OTP';
    } else if (otp.length !== 6) {
      newErrors.otp = 'Mã OTP phải có 6 chữ số';
    }

    if (!password.trim()) {
      newErrors.password = 'Vui lòng nhập mật khẩu mới';
    } else if (password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    if (countdown <= 0) {
      setError('Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.');
      return;
    }

    setLoading(true);

    try {
      const response = await passwordResetAPI.verifyOTPAndResetPassword(email, otp, password);

      if (response.success) {
        onPasswordResetSuccess();
      } else {
        if (response.errors) {
          setFieldErrors(response.errors);
        } else {
          const errorMessage = response.message || 'Có lỗi xảy ra khi đặt lại mật khẩu';
          setError(errorMessage);
          onPasswordResetError(errorMessage);
        }
      }
    } catch (error) {
      const errorMessage = error.message || 'Không thể kết nối đến server';
      setError(errorMessage);
      onPasswordResetError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setLoading(true);
      const response = await passwordResetAPI.sendResetOTP(email);

      if (response.success) {
        setCountdown(300); // Reset countdown
        setError('');
        alert('Đã gửi lại mã OTP mới!');
      } else {
        setError(response.message || 'Không thể gửi lại mã OTP');
      }
    } catch (error) {
      setError('Không thể gửi lại mã OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="password-reset-step">
        <div className="reset-form-container">
          <h2>Xác thực OTP</h2>
          <p className="instruction">
            Mã OTP đã được gửi đến: <strong>{email}</strong>
          </p>

          <div className="countdown">
            <p>Mã OTP sẽ hết hạn sau: <strong>{formatTime(countdown)}</strong></p>
          </div>

          <form onSubmit={handleSubmit} className="reset-form">
            <div className="form-group">
              <label htmlFor="otp">Mã OTP (6 chữ số)</label>
              <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Nhập mã OTP"
                  disabled={loading}
                  className={fieldErrors.otp ? 'error' : ''}
                  maxLength="6"
              />
              {fieldErrors.otp && (
                  <span className="field-error">{fieldErrors.otp}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">Mật khẩu mới</label>
              <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                  disabled={loading}
                  className={fieldErrors.password ? 'error' : ''}
              />
              {fieldErrors.password && (
                  <span className="field-error">{fieldErrors.password}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
              <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  disabled={loading}
                  className={fieldErrors.confirmPassword ? 'error' : ''}
              />
              {fieldErrors.confirmPassword && (
                  <span className="field-error">{fieldErrors.confirmPassword}</span>
              )}
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
                type="submit"
                className="submit-btn"
                disabled={loading || countdown <= 0}
            >
              {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
            </button>
          </form>

          <div className="form-footer">
            <button
                type="button"
                className="link-btn"
                onClick={handleResendOTP}
                disabled={loading || countdown > 240} // Chỉ cho phép gửi lại sau 1 phút
            >
              Gửi lại mã OTP
            </button>
            <button
                type="button"
                className="link-btn"
                onClick={onBackToStep1}
            >
              Thay đổi email
            </button>
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

export default LayLaiMatKhau2;