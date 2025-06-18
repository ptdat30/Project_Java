// src/components/laylaimatkhau/laylaimatkhau1.jsx
import React, { useState } from 'react';

// Thêm onNext và onGoToLogin vào props
const LayLaiMatKhau1 = ({ onNext, onGoToLogin }) => {
  const [email, setEmail] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');

  return (
    <div className="min-h-screen w-full bg-[#ffe8d9] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-center mb-4">Lấy lại mật khẩu</h1>

        <p className="text-gray-700 mb-6">
          Đừng lo lắng, giờ bạn chỉ cần điền email và nhận chữ lấy mã, sau đó chúng tôi sẽ gửi một đoạn mã đến email của bạn để khôi phục mật khẩu.
        </p>

        <div className="mb-6">
          <label className="block text-gray-800 font-semibold mb-2">
            Nhập email của bạn
          </label>
          <input
            type="email"
            className="w-full px-4 py-3 bg-[#fffbe5] border-none rounded focus:outline-none focus:ring-2 focus:ring-[#d9b38c]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
          />
        </div>

        <div className="mb-8">
          <label className="block text-gray-800 font-semibold mb-2">
            Mã khôi phục mật khẩu
          </label>
          <div className="flex items-center">
            <input
              type="text"
              className="flex-grow px-4 py-3 bg-[#fffbe5] border-none rounded-l focus:outline-none focus:ring-2 focus:ring-[#d9b38c]"
              value={recoveryCode}
              onChange={(e) => setRecoveryCode(e.target.value)}
              placeholder="Nhập mã khôi phục"
            />
            <button
              className="whitespace-nowrap cursor-pointer !rounded-button bg-[#d9b38c] hover:bg-[#c9a37c] active:bg-[#b99368] active:scale-95 transition-all duration-150 text-gray-800 font-medium px-4 py-3 rounded-r flex items-center"
              // Bạn có thể thêm logic lấy mã ở đây
            >
              <i className="fas fa-code mr-2"></i>
              Lấy mã
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <button
            className="w-full whitespace-nowrap cursor-pointer !rounded-button bg-[#d9b38c] hover:bg-[#c9a37c] active:bg-[#b99368] active:scale-95 transition-all duration-150 text-gray-800 font-medium px-6 py-3 rounded"
            onClick={onNext} // <-- THÊM DÒNG NÀY
          >
            Tiếp theo
          </button>

          <a
            href="#"
            className="text-green-600 hover:text-green-800 hover:underline active:text-green-900 active:scale-95 transition-all duration-150 cursor-pointer"
            onClick={onGoToLogin} // <-- THÊM DÒNG NÀY
          >
            Đi đến trang đăng nhập
          </a>
        </div>
      </div>
    </div>
  );
};

export default LayLaiMatKhau1;