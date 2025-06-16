import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import config from "../config/config";

const LoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleRememberMeChange = () => {
    setRememberMe(!rememberMe);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!username || !password) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${config.API_BASE_URL}${config.endpoints.login}`,
        {
          username,
          password,
        }
      );

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        navigate("/home"); // Đã thay đổi từ '/dashboard' thành '/home'
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Đã có lỗi xảy ra khi đăng nhập."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post(
        `${config.API_BASE_URL}${config.endpoints.googleLogin}`,
        {
          idToken: credentialResponse.credential,
        }
      );

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        navigate("/home"); // Đã thay đổi từ '/dashboard' thành '/home'
      }
    } catch (err) {
      setError(err.response?.data?.message || "Đăng nhập với Google thất bại.");
    }
  };

  const handleGoogleError = () => {
    setError("Đăng nhập với Google thất bại. Vui lòng thử lại.");
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div
        className="min-h-screen w-full flex items-center justify-center bg-neutral-100 px-4"
        style={{
          backgroundImage: "url('images/background_login.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-semibold text-center text-gray-800 mb-2">
            Đăng nhập
          </h1>

          <p className="text-center text-sm text-gray-600 mb-6">
            bạn chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="text-blue-500 hover:underline cursor-pointer"
            >
              Tạo tài khoản ngay
            </Link>
          </p>

          <form onSubmit={handleSubmit}>
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
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700 cursor-pointer"
                >
                  Duy trì đăng nhập
                </label>
              </div>
              <div className="text-sm">
                <a
                  href="#"
                  className="text-blue-500 hover:underline cursor-pointer"
                >
                  Quên mật khẩu?
                </a>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#e6d5b8] text-gray-800 py-2 px-4 rounded-md hover:bg-[#d9c7a8] focus:outline-none focus:ring-2 focus:ring-[#d9c7a8] transition duration-200 !rounded-button whitespace-nowrap cursor-pointer"
            >
              Đăng nhập
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Hoặc bạn có thể đăng nhập với Google
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              {/* COMPONENT GoogleLogin:
                  Đây là component từ thư viện `@react-oauth/google`.
                  Nó sẽ tự hiển thị nút "Sign in with Google" và xử lý quá trình OAuth.
                  Nếu không thấy nút, hãy kiểm tra lại GOOGLE_CLIENT_ID và kết nối internet.
              */}
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap // Bỏ thuộc tính này nếu không muốn dùng tính năng One-tap
              />
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default LoginPage;
