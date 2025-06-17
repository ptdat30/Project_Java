import React, {useEffect, useState} from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../config/config";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [authMessage, setAuthMessage] = useState("");

  // Hàm kiểm tra định dạng email cơ bản
  const isValidEmail = (email) => {
    // Regex này chỉ là một kiểm tra cơ bản, không hoàn hảo cho mọi trường hợp
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setAuthMessage("");

    if (
      !username ||
      !email ||
      !firstName ||
      !lastName ||
      !password ||
      !confirmPassword
    ) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Email không hợp lệ. Vui lòng nhập đúng định dạng.");
      return;
    }

    const MIN_PASSWORD_LENGTH = 6; // Đặt một hằng số cho dễ quản lý
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự.`);
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      const response = await axios.post(
        `${config.API_BASE_URL}${config.endpoints.register}`,
        {
          username,
          email,
          firstName,
          lastName,
          password,
        }
      );

      if (response.data.success) {
        setAuthMessage("Đăng ký thành công! Vui lòng đăng nhập.");
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    } catch (err) {
      console.error("Lỗi đăng ký từ Backend:", err.response);

      // Lấy thông báo lỗi từ backend
      const backendErrorMessage = err.response?.data?.message;
      const backendErrors = err.response?.data?.errors;

      if (backendErrors) {
        const errorMessages = Object.values(backendErrors).join(" | ");
        setError(`Lỗi từ máy chủ: ${errorMessages}`);
      } else if (backendErrorMessage) {
        setError(backendErrorMessage);
      } else {
        setError("Đã có lỗi xảy ra khi đăng ký.");
      }
    }
  };

  useEffect(() => {
    document.getElementById("title").innerText="RegisterPage";
  }, []);

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-4"
      style={{
        backgroundImage: "url('/images/21.png')", // Đảm bảo hình ảnh này nằm trong thư mục public/images
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl ">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Đăng ký tài khoản
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <strong className="font-bold">Lỗi! </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          {authMessage && (
            <div
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <span className="block sm:inline">{authMessage}</span>
            </div>
          )}

          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tên đăng nhập
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Nhập tên đăng nhập"
              required
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Nhập email của bạn"
              required
            />
          </div>

          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Họ
            </label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Nhập họ"
              required
            />
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tên
            </label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Nhập tên"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Mật khẩu
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Nhập mật khẩu"
              required
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Nhập lại mật khẩu"
              required
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full bg-gray-700 text-shadow-black py-2 px-4 rounded-md  hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-[#d9c7a8] transition duration-200 !rounded-button whitespace-nowrap cursor-pointer"
            >
              Đăng ký
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Đã có tài khoản?{" "}
            <Link
              to="/"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
