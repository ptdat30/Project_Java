// src/components/laylaimatkhau/laylaimatkhau3.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
// Thêm onGoToLogin vào props
const LayLaiMatKhau3 = ({ onGoToLogin }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsActive(false);
  };

  const handleMouseDown = () => {
    setIsActive(true);
  };

  const handleMouseUp = () => {
    setIsActive(false);
  };

  return (
    <div className="min-h-screen w-full bg-[#ffe8d6] flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-lg p-8 shadow-sm">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <h1 className="text-3xl font-bold">Thành công</h1>
            <span className="text-green-500 text-4xl">
              <i className="fas fa-check-circle"></i>
            </span>
          </div>

          <p className="text-gray-700 mb-2">
            Mật khẩu của bạn đã được thay đổi.
          </p>

          <p className="text-gray-700 mb-6">
            Vui lòng bấm{" "}
            <span
              className="text-green-500 cursor-pointer"
              onClick={onGoToLogin}
            >
              vào đây
            </span>{" "}
            để quay lại trang đăng nhập. {/* <-- THÊM DÒNG NÀY */}
          </p>

          <Link // <--- CHANGE FROM <div> TO <Link>
            to="/login" // <--- Specify the path to your login page route
            className={`bg-[#fffbe5] py-3 px-4 rounded-md transition-all duration-300 cursor-pointer flex items-center justify-center ${
              isHovered ? "bg-[#f7f3d7]" : ""
            } ${isActive ? "bg-[#f0ecc8] transform scale-[0.98]" : ""}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            // onClick={onGoToLogin} // <--- Remove this onClick if using Link for navigation
          >
            {/* The content of the link */}
            <span
              className={`text-green-500 font-medium whitespace-nowrap ${
                isHovered ? "text-green-600" : ""
              } ${isActive ? "text-green-700" : ""}`}
            >
              Đi đến trang đăng nhập.
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LayLaiMatKhau3;
