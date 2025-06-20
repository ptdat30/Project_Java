import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // navigate vẫn cần cho useLocation, nhưng sẽ không dùng trực tiếp
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  // Thay đổi: navigate giờ chỉ được dùng để có trong dependency array của useEffect
  // Không còn gọi navigate trực tiếp nữa
  const actualNavigate = useNavigate();
  const {
    login,
    googleLogin,
    loading: authLoading,
    error: authError,
    isAuthenticated,
  } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [localError, setLocalError] = useState("");
  const [formProcessing, setFormProcessing] = useState(false);

  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleRememberMeChange = () => {
    setRememberMe(!rememberMe);
  };

  const validateUsername = (inputUsername) => {
    if (!inputUsername.trim()) {
      return "Tài khoản không được để trống.";
    }
    return "";
  };

  const validatePassword = (inputPassword) => {
    if (!inputPassword.trim()) {
      return "Mật khẩu không được để trống.";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    setFormProcessing(true);

    const usernameError = validateUsername(usernameInput);
    const passwordError = validatePassword(passwordInput);

    if (usernameError || passwordError) {
      setLocalError(usernameError || passwordError);
      setFormProcessing(false);
      return;
    }

    try {
      await login({ username: usernameInput, password: passwordInput });
    } catch (err) {
      const errorMessage =
        authError || err.message || "Tài khoản hoặc mật khẩu không đúng.";
      setLocalError(errorMessage);
    } finally {
      setFormProcessing(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLocalError("");
    setFormProcessing(true);

    try {
      await googleLogin(credentialResponse.credential);
    } catch (err) {
      const errorMessage =
        authError || err.message || "Đăng nhập với Google thất bại.";
      setLocalError(errorMessage);
    } finally {
      setFormProcessing(false);
    }
  };

  const handleGoogleError = (errorResponse) => {
    console.error("LoginPage: Đăng nhập với Google thất bại:", errorResponse);
    setLocalError("Đăng nhập với Google thất bại. Vui lòng thử lại.");
    setFormProcessing(false);
  };

  useEffect(() => {
    document.getElementById("title").innerText = "LoginPage";
  }, []);

  // Đã cập nhật useEffect để điều hướng bằng window.location.replace
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      console.log(
        "LoginPage useEffect: Đã xác thực thành công. Đang điều hướng bằng window.location.replace."
      );
      // SỬ DỤNG window.location.replace('/') để buộc tải lại trang
      // Đây là một bước chẩn đoán, không phải giải pháp SPA cuối cùng
      window.location.replace("/");
    }
  }, [isAuthenticated, authLoading]); // actualNavigate không cần trong dependency array nếu không dùng nó

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-neutral-100 px-4"
      style={{
        backgroundImage: "url('images/1.png')",
        backgroundSize: "cover",
        backgroundPosition: "start",
      }}
    >
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-semibold text-center text-gray-800 mb-2">
          ĐĂNG NHẬP
        </h1>

        <p className="text-center text-sm text-gray-600 mb-6">
          Bạn chưa có tài khoản?{" "}
          <Link
            to="/register"
            className="text-blue-500 hover:underline cursor-pointer"
          >
            Tạo tài khoản ngay!
          </Link>
        </p>

        <form onSubmit={handleSubmit}>
          {(localError || authError) && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
              role="alert"
            >
              <span className="block sm:inline">{localError || authError}</span>
            </div>
          )}

          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tài khoản
            </label>
            <input
              id="username"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Mật khẩu
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                onClick={togglePasswordVisibility}
              >
                <i
                  className={`fas ${
                    showPassword ? "fa-eye-slash" : "fa-eye"
                  } text-gray-400`}
                ></i>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded cursor-pointer"
                checked={rememberMe}
                onChange={handleRememberMeChange}
              />
              <label
                htmlMớifor="remember-me"
                className="ml-2 block text-sm text-gray-700 cursor-pointer"
              >
                Duy trì đăng nhập
              </label>
            </div>
            <div className="text-sm">
              <Link
                to="/recover-password"
                className="text-blue-500 hover:underline cursor-pointer"
              >
                Quên mật khẩu?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gray-700 text-gray-300 text-shadow-black py-2 px-4 rounded-md hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-[#d9c7a8] transition duration-200 !rounded-button whitespace-nowrap cursor-pointer"
            disabled={formProcessing || authLoading}
          >
            {formProcessing || authLoading ? "Đang xử lý..." : "Đăng Nhập"}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Đăng Nhập Theo Phương Thức Khác
              </span>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
