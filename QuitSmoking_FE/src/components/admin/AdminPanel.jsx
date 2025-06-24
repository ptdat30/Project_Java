import React, { useState, useEffect } from "react";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import axios from "axios";
import config from "../../config/config.js";

const AdminPanel = () => {
  const { user, loading: authLoading } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalPlans: 0,
    successfulQuits: 0,
    totalRevenue: 0,
    newUsersThisMonth: 0,
  });
  const [users, setUsers] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [reports, setReports] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);

  // Pagination states for UsersTab
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(6); // Display 6 users per page

  const tabs = [
    { id: "dashboard", name: "Tổng quan", icon: "📊" },
    { id: "users", name: "Quản lý người dùng", icon: "👥" },
    { id: "coaches", name: "Quản lý huấn luyện viên", icon: "🎓" },
    { id: "reports", name: "Báo cáo", icon: "📈" },
    { id: "feedback", name: "Phản hồi", icon: "💬" },
    { id: "system", name: "Hệ thống", icon: "⚙️" },
  ];

  // Fetch data khi component mount và khi tab thay đổi
  useEffect(() => {
    if (!authLoading) {
      fetchData();
    }
  }, [activeTab, authLoading]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");

      switch (activeTab) {
        case "dashboard":
          await fetchDashboardStats(token);
          break;
        case "users":
          await fetchUsers(token);
          break;
        case "coaches":
          await fetchCoaches(token);
          break;
        case "reports":
          await fetchReports(token);
          break;
        case "feedback":
          await fetchFeedbacks(token);
          break;
      }
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      setLoading(false);
    }
  };

  const fetchDashboardStats = async (token) => {
    const response = await axios.get(`${config.API_BASE_URL}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setStats(response.data);
  };
  const fetchUsers = async (token) => {
    const response = await axios.get(`${config.API_BASE_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUsers(response.data);
  };
  const fetchCoaches = async (token) => {
    const response = await axios.get(
      `${config.API_BASE_URL}/api/admin/coaches`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setCoaches(response.data);
  };
  const fetchReports = async (token) => {
    const response = await axios.get(
      `${config.API_BASE_URL}/api/admin/reports`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setReports(response.data);
  };
  const fetchFeedbacks = async (token) => {
    const response = await axios.get(
      `${config.API_BASE_URL}/api/admin/feedbacks`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setFeedbacks(response.data);
  };
  const handleUserAction = async (userId, action) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${config.API_BASE_URL}/api/admin/users/${userId}/${action}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`${action === "ban" ? "Khóa" : "Mở khóa"} người dùng thành công!`);
      fetchUsers(token); // Refetch users after action
    } catch (error) {
      console.error("Lỗi khi thực hiện hành động:", error);
      alert("Có lỗi xảy ra. Vui lòng thử lại!");
    }
  };
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Get current users for pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const DashboardTab = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Tổng người dùng
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                {stats.totalUsers.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Người dùng hoạt động
              </h3>
              <p className="text-3xl font-bold text-green-600">
                {stats.activeUsers.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Kế hoạch cai thuốc
              </h3>
              <p className="text-3xl font-bold text-purple-600">
                {stats.totalPlans.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Cai thuốc thành công
              </h3>
              <p className="text-3xl font-bold text-yellow-600">
                {stats.successfulQuits.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Tổng doanh thu
              </h3>
              <p className="text-3xl font-bold text-red-600">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <svg
                className="w-6 h-6 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Người dùng mới (tháng này)
              </h3>
              <p className="text-3xl font-bold text-indigo-600">
                {stats.newUsersThisMonth.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Hành động nhanh
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-2xl mb-2">👥</div>
            <div className="text-sm font-medium">Quản lý người dùng</div>
          </button>
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-2xl mb-2">📊</div>
            <div className="text-sm font-medium">Xem báo cáo</div>
          </button>
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-2xl mb-2">💬</div>
            <div className="text-sm font-medium">Phản hồi mới</div>
          </button>
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-2xl mb-2">⚙️</div>
            <div className="text-sm font-medium">Cài đặt hệ thống</div>
          </button>
        </div>
      </div>
    </div>
  );
  const UsersTab = () => (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Quản lý người dùng
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                Người dùng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                Gói thành viên
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                Ngày tham gia
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentUsers.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-semibold">
                        {user.firstName?.charAt(0)}
                        {user.lastName?.charAt(0)}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.username}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.membershipPlan === "VIP"
                        ? "bg-purple-100 text-purple-800"
                        : user.membershipPlan === "PREMIUM"
                        ? "bg-yellow-100 text-yellow-800"
                        : user.membershipPlan === "BASIC"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {user.membershipPlan || "FREE"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.status === "ACTIVE"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.status === "ACTIVE" ? "Hoạt động" : "Bị khóa"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                  {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex space-x-2">
                    <button
                      onClick={() =>
                        handleUserAction(
                          user.id,
                          user.status === "ACTIVE" ? "ban" : "unban"
                        )
                      }
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        user.status === "ACTIVE"
                          ? "bg-red-100 text-red-800 hover:bg-red-200"
                          : "bg-green-100 text-green-800 hover:bg-green-200"
                      }`}
                    >
                      {user.status === "ACTIVE" ? "Khóa" : "Mở khóa"}
                    </button>
                    <button className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium hover:bg-blue-200">
                      Xem chi tiết
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      <div className="py-3 px-6 flex justify-between items-center bg-gray-50 border-t border-gray-200">
        <div className="text-sm text-gray-700">
          Hiển thị {indexOfFirstUser + 1} đến {Math.min(indexOfLastUser, users.length)} của {users.length} người dùng
        </div>
        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
          {Array.from({ length: Math.ceil(users.length / usersPerPage) }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => paginate(i + 1)}
              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                currentPage === i + 1
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
  const CoachesTab = () => (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Quản lý huấn luyện viên
          </h3>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Thêm huấn luyện viên
          </button>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coaches.map((coach) => (
            <div
              key={coach.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {coach.firstName?.charAt(0)}
                    {coach.lastName?.charAt(0)}
                  </span>
                </div>
                <div className="ml-3">
                  <h4 className="font-semibold text-gray-900">
                    {coach.firstName} {coach.lastName}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {coach.specialization}
                  </p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Đánh giá:</span>
                  <span className="font-medium">{coach.rating}/5 ⭐</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số buổi tư vấn:</span>
                  <span className="font-medium">{coach.totalSessions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Trạng thái:</span>
                  <span
                    className={`font-medium ${
                      coach.isAvailable ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {coach.isAvailable ? "Có sẵn" : "Bận"}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex space-x-2">
                <button className="flex-1 bg-blue-100 text-blue-800 py-1 px-3 rounded text-sm hover:bg-blue-200">
                  Xem chi tiết
                </button>
                <button className="flex-1 bg-gray-100 text-gray-800 py-1 px-3 rounded text-sm hover:bg-gray-200">
                  Chỉnh sửa
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  return (
    <div className="min-h-screen bg-gray-50">
      {authLoading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang kiểm tra quyền truy cập...</p>
          </div>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Bảng điều khiển quản trị
            </h1>
            <p className="text-gray-600 mt-2">
              Quản lý toàn bộ hệ thống nền tảng cai thuốc
            </p>
            {user && (
              <p className="text-sm text-gray-500 mt-1">
                Xin chào, {user.firstName} {user.lastName} ({user.email})
              </p>
            )}
          </div>
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
          {/* Tab Content */}
          <div>
            {activeTab === "dashboard" && <DashboardTab />}
            {activeTab === "users" && <UsersTab />}
            {activeTab === "coaches" && <CoachesTab />}
            {activeTab === "reports" && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Báo cáo hệ thống
                </h3>
                <p className="text-gray-600">
                  Tính năng báo cáo đang được phát triển...
                </p>
              </div>
            )}
            {activeTab === "feedback" && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Phản hồi từ người dùng
                </h3>
                <p className="text-gray-600">
                  Tính năng quản lý phản hồi đang được phát triển...
                </p>
              </div>
            )}
            {activeTab === "system" && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Cài đặt hệ thống
                </h3>
                <p className="text-gray-600">
                  Tính năng cài đặt hệ thống đang được phát triển...
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminPanel;