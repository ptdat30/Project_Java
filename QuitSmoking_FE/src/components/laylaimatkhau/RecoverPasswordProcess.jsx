// src/components/laylaimatkhau/RecoverPasswordProcess.jsx
import React, { useState } from 'react';

// Đảm bảo đường dẫn đúng cho các components con (nếu chúng nằm cùng cấp với RecoverPasswordProcess.jsx)
import LayLaiMatKhau1 from './laylaimatkhau1';
import LayLaiMatKhau2 from './laylaimatkhau2';
import LayLaiMatKhau3 from './laylaimatkhau3';

const RecoverPasswordProcess = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const handleNext = () => {
    setCurrentStep(prevStep => prevStep + 1);
  };

  const handleGoToLogin = () => {
    console.log("Điều hướng đến trang đăng nhập");
    setCurrentStep(1);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <LayLaiMatKhau1 onNext={handleNext} onGoToLogin={handleGoToLogin} />;
      case 2:
        return <LayLaiMatKhau2 onNext={handleNext} onGoToLogin={handleGoToLogin} />;
      case 3:
        return <LayLaiMatKhau3 onGoToLogin={handleGoToLogin} />;
      default:
        return <LayLaiMatKhau1 onNext={handleNext} onGoToLogin={handleGoToLogin} />;
    }
  };

  return (
    <div className="recover-password-container">
      {renderStep()}
    </div>
  );
};

export default RecoverPasswordProcess;