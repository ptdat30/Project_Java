// src/components/laylaimatkhau/RecoverPasswordProcess.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LayLaiMatKhau1 from './laylaimatkhau1';
import LayLaiMatKhau2 from './laylaimatkhau2';
import LayLaiMatKhau3 from './laylaimatkhau3';
import './RecoverPasswordProcess.css';

const RecoverPasswordProcess = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState('');
  const [resetStatus, setResetStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const location = useLocation();
  const navigate = useNavigate();

  // Kiểm tra nếu có email được truyền qua state (từ trang khác)
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
      if (location.state.step) {
        setCurrentStep(location.state.step);
      }
    }
  }, [location]);

  const handleEmailSubmitted = (submittedEmail) => {
    setEmail(submittedEmail);
    setCurrentStep(2); // Chuyển đến bước nhập OTP
  };

  const handlePasswordResetSuccess = () => {
    setResetStatus('success');
    setCurrentStep(3);
  };

  const handlePasswordResetError = (error) => {
    setResetStatus('error');
    setErrorMessage(error);
    // Không chuyển step, để user thử lại ở step 2
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  const handleStartOver = () => {
    setCurrentStep(1);
    setEmail('');
    setResetStatus(null);
    setErrorMessage('');
    navigate('/forgot-password', { replace: true });
  };

  const handleBackToStep1 = () => {
    setCurrentStep(1);
    setEmail('');
    setErrorMessage('');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
            <LayLaiMatKhau1
                onEmailSubmitted={handleEmailSubmitted}
                onGoToLogin={handleGoToLogin}
            />
        );
      case 2:
        return (
            <LayLaiMatKhau2
                email={email}
                onPasswordResetSuccess={handlePasswordResetSuccess}
                onPasswordResetError={handlePasswordResetError}
                onGoToLogin={handleGoToLogin}
                onBackToStep1={handleBackToStep1}
                errorMessage={errorMessage}
            />
        );
      case 3:
        return (
            <LayLaiMatKhau3
                status={resetStatus}
                errorMessage={errorMessage}
                onGoToLogin={handleGoToLogin}
                onStartOver={handleStartOver}
            />
        );
      default:
        return (
            <LayLaiMatKhau1
                onEmailSubmitted={handleEmailSubmitted}
                onGoToLogin={handleGoToLogin}
            />
        );
    }
  };

  return (
      <div className="recover-password-container">
        <div className="step-indicator">
          <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
            <span>1</span>
            <p>Nhập Email</p>
          </div>
          <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
            <span>2</span>
            <p>Xác thực OTP</p>
          </div>
          <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
            <span>3</span>
            <p>Hoàn thành</p>
          </div>
        </div>
        {renderStep()}
      </div>
  );
};

export default RecoverPasswordProcess;