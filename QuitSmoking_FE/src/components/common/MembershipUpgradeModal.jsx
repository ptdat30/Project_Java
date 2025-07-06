import React from 'react';
import { useNavigate } from 'react-router-dom';

const MembershipUpgradeModal = ({ isOpen, onClose, message = "Bạn cần nâng cấp lên thành viên để truy cập tính năng này" }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleUpgrade = () => {
    onClose();
    navigate('/membership');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="text-center">
          {/* Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
            <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            🔒 Truy cập bị hạn chế
          </h3>

          {/* Message */}
          <p className="text-gray-600 mb-6">
            {message}
          </p>

          {/* Features list */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h4 className="font-medium text-gray-900 mb-2">Nâng cấp để được:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✅ Truy cập đầy đủ tính năng</li>
              <li>✅ Tư vấn chuyên gia</li>
              <li>✅ Báo cáo chi tiết</li>
              <li>✅ Cộng đồng hỗ trợ</li>
              <li>✅ Nội dung premium</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition duration-300"
            >
              Để sau
            </button>
            <button
              onClick={handleUpgrade}
              className="flex-1 py-2 px-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition duration-300 shadow-md"
            >
              Nâng cấp ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipUpgradeModal; 