import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  // Lấy thông tin user, isAuthenticated, và logout từ AuthContext
  const {
    isAuthenticated,
    user,
    logout,
    loading: authLoading,
    error: authError,
  } = useAuth();

  // LOG MỚI: Ghi lại trạng thái mà Navigation nhận được từ AuthContext
  useEffect(() => {
    console.log(
      "Navigation: Trạng thái AuthContext nhận được - isAuthenticated:",
      isAuthenticated,
      "User:",
      user,
      "Loading:",
      authLoading,
      "Error:",
      authError
    );
    // Thêm log để kiểm tra đối tượng user ngay khi nó được cập nhật trong Navigation
    if (user) {
      console.log("Navigation useEffect: Đối tượng User nhận được:", user);
      console.log("Navigation useEffect: user.id:", user.id);
      console.log("Navigation useEffect: user.username:", user.username);
      console.log("Navigation useEffect: user.role:", user.role);
    }
  }, [isAuthenticated, user, authLoading, authError]);

  // Navigation items dành cho người dùng đã đăng nhập
  const authNavigationItems = [
    { name: "Trang chủ", href: "/", icon: "🏠" },
    { name: "Dashboard", href: "/dashboard", icon: "📊" },
    { name: "Kế hoạch", href: "/plan", icon: "📋" },
    { name: "Cộng đồng", href: "/community", icon: "👥" },
    { name: "Tư vấn Coach", href: "/coach-consultation", icon: "👨‍⚕️" },
    { name: "Huy hiệu", href: "/achievements", icon: "🏆" },
  ];

  // Navigation items dành cho người dùng chưa đăng nhập
  const publicNavigationItems = [
    { name: "Trang chủ", href: "/", icon: "🏠" },
    { name: "Cộng đồng", href: "/community", icon: "👥" },
  ];

  const navigationItems = isAuthenticated
    ? [...authNavigationItems]
    : [...publicNavigationItems];

  // Thêm menu Admin nếu user là admin
  if (isAuthenticated && user?.role === "ADMIN") {
    navigationItems.push({ name: "Quản trị", href: "/admin", icon: "⚙️" });
  }

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  // Hàm lấy chữ cái đầu tiên của tên người dùng
  const getUserInitial = () => {
    if (!user) return "?";
    // Ưu tiên firstName, sau đó là username, cuối cùng là email
    if (
      user.firstName &&
      typeof user.firstName === "string" &&
      user.firstName.length > 0
    )
      return user.firstName.charAt(0).toUpperCase();
    if (
      user.username &&
      typeof user.username === "string" &&
      user.username.length > 0
    )
      return user.username.charAt(0).toUpperCase();
    if (user.email && typeof user.email === "string" && user.email.length > 0)
      return user.email.charAt(0).toUpperCase();
    return "U";
  };

  // Hàm lấy tên hiển thị của người dùng
  const getUserDisplayName = () => {
    if (!user) return "User";

    // Thêm log bên trong hàm để kiểm tra giá trị của user tại thời điểm này
    console.log("getUserDisplayName: user object:", user);
    console.log("getUserDisplayName: user.firstName:", user.firstName);
    console.log("getUserDisplayName: user.lastName:", user.lastName);
    console.log("getUserDisplayName: user.username:", user.username);
    console.log("getUserDisplayName: user.email:", user.email);

    // Ưu tiên firstName + lastName, sau đó là username, cuối cùng là email
    if (
      user.firstName &&
      user.lastName &&
      typeof user.firstName === "string" &&
      typeof user.lastName === "string"
    ) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.username && typeof user.username === "string")
      return user.username;
    if (user.email && typeof user.email === "string") return user.email;
    return "User";
  };

  return (
    <nav className="bg-white shadow-lg border-b-2 border-green-100">
      {/* Top Bar cho thông báo và trạng thái đăng nhập/đăng ký */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-sm">
          {/* Phần bên trái: Luôn hiển thị thông báo "Đăng ký ngay..." */}
          <span className="font-medium">
            Đăng ký ngay để nhận tư vấn miễn phí từ chuyên gia
          </span>

          {/* Phần bên phải: Logic hiển thị dựa trên trạng thái đăng nhập */}
          <div className="flex items-center gap-4">
            {authLoading ? (
              <span className="font-medium">Đang tải...</span>
            ) : isAuthenticated ? (
              <>
                {/* Thêm log ngay trước khi hiển thị để kiểm tra giá trị cuối cùng */}
                {console.log(
                  "Navigation Render: Display Name:",
                  getUserDisplayName(),
                  "Role:",
                  user?.role
                )}
                <span className="font-medium">
                  Xin chào, {getUserDisplayName()} ({user?.role})
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-1 rounded-full bg-white text-emerald-600 hover:bg-gray-100 transition-all font-medium text-xs"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              // Nếu chưa đăng nhập
              <>
                <Link
                  to="/login"
                  className="px-4 py-1 rounded-full bg-white text-emerald-600 hover:bg-gray-100 transition-all font-medium text-xs"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1 rounded-full bg-emerald-600 border border-white text-white hover:bg-emerald-700 transition-all font-medium text-xs"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo và Brand */}
          <div className="flex items-center">
            <Link
              to="/"
              className="flex items-center hover:opacity-80 transition duration-300"
            >
              <span className="text-2xl mr-2">🚭</span>
              <span className="text-xl font-bold text-green-700">
                QuitSmoking
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isActive(item.href)
                    ? "bg-green-100 text-green-700 shadow-md"
                    : "text-gray-600 hover:text-green-700 hover:bg-green-50"
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </div>

          {/* User Menu hoặc Auth Buttons (đã chuyển lên top bar) */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Phần này hiển thị avatar và dropdown menu cho người dùng đã đăng nhập */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 hover:bg-green-50 p-2 transition duration-300"
                >
                  {user?.pictureUrl ? (
                    <img
                      src={user.pictureUrl}
                      alt="User Avatar"
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-sm">
                        {getUserInitial()}
                      </span>
                    </div>
                  )}
                  <span className="ml-2 text-gray-700 font-medium">
                    {getUserDisplayName()}
                  </span>
                  <svg
                    className="ml-1 h-4 w-4 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {isUserMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-2">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {getUserDisplayName()}
                        </p>
                        <p className="text-sm text-gray-500">
                          {user?.email || "No email"}
                        </p>
                      </div>

                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition duration-300"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <span className="mr-3">👤</span>
                        Hồ sơ cá nhân
                      </Link>
                      <Link
                        to="/daily-progress"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition duration-300"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <span className="mr-3">📈</span>
                        Tiến trình hàng ngày
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition duration-300"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <span className="mr-3">⚙️</span>
                        Cài đặt
                      </Link>
                      <Link
                        to="/membership"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition duration-300"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <span className="mr-3">💎</span>
                        Gói thành viên
                      </Link>

                      <div className="border-t border-gray-100 mt-2"></div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition duration-300"
                      >
                        <span className="mr-3">🚪</span>
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-green-700 focus:outline-none focus:text-green-700 transition duration-300"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    isMenuOpen
                      ? "M6 18L18 6M6 6l12 12"
                      : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-green-100">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-green-50">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-3 rounded-lg text-base font-medium transition-all duration-300 ${
                    isActive(item.href)
                      ? "bg-green-100 text-green-700 shadow-md"
                      : "text-gray-600 hover:text-green-700 hover:bg-white"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              ))}

              {/* Mobile User Menu */}
              {isAuthenticated ? (
                <div className="border-t border-green-200 pt-4 mt-4">
                  <div className="flex items-center px-3 py-2">
                    {user?.pictureUrl ? (
                      <img
                        src={user.pictureUrl}
                        alt="User Avatar"
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center shadow-md">
                        <span className="text-white font-bold text-sm">
                          {getUserInitial()}
                        </span>
                      </div>
                    )}
                    <span className="ml-2 text-gray-700 font-medium">
                      {getUserDisplayName()}
                    </span>
                  </div>

                  <Link
                    to="/profile"
                    className="flex items-center px-3 py-3 text-base font-medium text-gray-600 hover:text-green-700 hover:bg-white rounded-lg transition duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="mr-3">👤</span>
                    Hồ sơ cá nhân
                  </Link>
                  <Link
                    to="/daily-progress"
                    className="flex items-center px-3 py-3 text-base font-medium text-gray-600 hover:text-green-700 hover:bg-white rounded-lg transition duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="mr-3">📈</span>
                    Tiến trình hàng ngày
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center px-3 py-3 text-base font-medium text-gray-600 hover:text-green-700 hover:bg-white rounded-lg transition duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="mr-3">⚙️</span>
                    Cài đặt
                  </Link>
                  <Link
                    to="/membership"
                    className="flex items-center px-3 py-3 text-base font-medium text-gray-600 hover:text-green-700 hover:bg-white rounded-lg transition duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="mr-3">💎</span>
                    Gói thành viên
                  </Link>

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center w-full text-left px-3 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg transition duration-300"
                  >
                    <span className="mr-3">🚪</span>
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <div className="border-t border-green-200 pt-4 mt-4 space-y-2">
                  <Link
                    to="/login"
                    className="flex items-center px-3 py-3 text-base font-medium text-green-600 hover:text-green-700 hover:bg-white rounded-lg transition duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="mr-3">🔑</span>
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center px-3 py-3 text-base font-medium bg-green-600 text-white hover:bg-green-700 rounded-lg transition duration-300 shadow-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="mr-3">✨</span>
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
