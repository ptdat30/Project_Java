// src/components/laylaimatkhau/laylaimatkhau2.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";

// Đảm bảo nhận các props onNext và onGoToLogin
const LayLaiMatKhau2 = ({ onNext, onGoToLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberLogin, setRememberLogin] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Xử lý logic đặt lại mật khẩu ở đây
    console.log("Đặt lại mật khẩu:", password, confirmPassword);
    // Sau khi xử lý xong, chuyển sang bước tiếp theo
    if (onNext) {
      // Kiểm tra xem prop onNext có tồn tại không
      onNext();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#ffe6d5] p-4">
      <div className="bg-white rounded-lg shadow-md w-full max-w-md p-8">
        <h1 className="text-3xl font-bold mb-4">Lấy lại mật khẩu</h1>

        <p className="text-gray-700 mb-6">
          Đừng lo lắng, giờ bạn chỉ cần nhập mã tài khoản của bạn, sau đó chúng
          tôi sẽ gửi một đoạn mã đến email của bạn để khôi phục mật khẩu.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Mật khẩu mới */}
          <div className="mb-4">
            <label htmlFor="password" className="block text-lg font-bold mb-2">
              Mật khẩu mới
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="w-full py-3 px-4 bg-[#fffde7] border-none focus:outline-none focus:ring-2 focus:ring-[#f0b27a] text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button" // Luôn là type="button" để không submit form
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                <i
                  className={`fas ${
                    showPassword ? "fa-eye-slash" : "fa-eye"
                  } text-gray-600`}
                ></i>
                <span className="ml-2 text-gray-600">hiển thị</span>
              </button>
            </div>
          </div>

          {/* Nhập lại mật khẩu */}
          <div className="mb-6">
            <label
              htmlFor="confirmPassword"
              className="block text-lg font-bold mb-2"
            >
              Nhập lại mật khẩu
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                className="w-full py-3 px-4 bg-[#fffde7] border-none focus:outline-none focus:ring-2 focus:ring-[#f0b27a] text-sm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button" // Luôn là type="button" để không submit form
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label="Toggle password visibility"
              >
                <i
                  className={`fas ${
                    showConfirmPassword ? "fa-eye-slash" : "fa-eye"
                  } text-gray-600`}
                ></i>
                <span className="ml-2 text-gray-600">hiển thị</span>
              </button>
            </div>
          </div>

          {/* Duy trì đăng nhập */}
          <div className="mb-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only" // Ẩn checkbox mặc định
                checked={rememberLogin}
                onChange={() => setRememberLogin(!rememberLogin)}
              />
              {/* Custom checkbox visual */}
              <div
                className={`w-5 h-5 ${
                  rememberLogin ? "bg-[#f0b27a]" : "bg-[#fffde7]"
                } border border-gray-300 mr-2 flex items-center justify-center`}
              >
                {rememberLogin && (
                  <i className="fas fa-check text-white text-xs"></i>
                )}
              </div>
              <span className="text-lg font-bold">Duy trì đăng nhập</span>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <button
              type="submit" // Giữ type submit nếu bạn muốn gửi form
              className="bg-[#c8a79b] hover:bg-[#b3937f] active:bg-[#a58474] text-white py-3 px-8 rounded-md mb-4 sm:mb-0 cursor-pointer whitespace-nowrap !rounded-button"
            >
              Tiếp theo
            </button>
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
        </form>
      </div>
    </div>
  );
};

export default LayLaiMatKhau2;
