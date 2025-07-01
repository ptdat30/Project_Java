import React, { useState, useEffect } from "react";
import axios from "axios";
import config from "../../config/config.js";
import { useAuth } from "../../context/AuthContext";
import websocketService from "../../services/websocketService";

const AdminPanel = () => {
  const { token, loading: authLoading, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsersThisMonth: 0,
    totalPlans: 0,
    successfulQuits: 0,
    totalRevenue: 0,
    totalCoaches: 0,
    activeCoaches: 0,
    totalPosts: 0,
    totalComments: 0,
    bannedUsers: 0,
    totalTransactions: 0,
    monthlyRevenue: 0,
    yearlyRevenue: 0,
    dailyActiveUsers: 0,
    weeklyActiveUsers: 0,
    monthlyActiveUsers: 0,
    totalAchievements: 0,
    achievementsEarned: 0,
    totalConsultations: 0,
    activeDiscussions: 0,
    freeMembers: 0,
    basicMembers: 0,
    premiumMembers: 0,
    vipMembers: 0,
    activePlans: 0,
    completedPlans: 0,
    systemHealth: "UNKNOWN",
    systemUptime: 0,
    lastBackup: null,
  });
  const [users, setUsers] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [reports, setReports] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [userStatuses, setUserStatuses] = useState(new Map());

  // Pagination states for UsersTab
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(6); // Display 6 users per page

  // Đặt các state điều khiển modal/chỉnh role ở ngoài map
  const [editRoleId, setEditRoleId] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [showDetailId, setShowDetailId] = useState(null);
  const [userDetail, setUserDetail] = useState(null);

  const tabs = [
    { id: "dashboard", name: "Tổng quan", icon: "📊" },
    { id: "users", name: "Quản lý người dùng", icon: "👥" },
    { id: "coaches", name: "Quản lý huấn luyện viên", icon: "🎓" },
    { id: "reports", name: "Báo cáo", icon: "📈" },
    { id: "feedback", name: "Phản hồi", icon: "💬" },
    { id: "system", name: "Hệ thống", icon: "⚙️" },
  ];

  // Debug token
  useEffect(() => {
    console.log("AdminPanel: Token received:", token ? "Present" : "Missing");
    console.log("AdminPanel: Auth loading:", authLoading);
  }, [token, authLoading]);

  // WebSocket connection for user status
  useEffect(() => {
    if (token && !authLoading && user) {
      // Connect to WebSocket for user status updates using actual user ID
      websocketService.connect(
        user.id, // Use actual user ID instead of 'admin'
        'admin-panel', 
        handleUserStatusUpdate
      );

      // Listen for user status updates via custom events
      const handleStatusUpdate = (event) => {
        const statusUpdate = event.detail;
        console.log('AdminPanel: Received user status update:', statusUpdate);
        setUserStatuses(prev => new Map(prev.set(statusUpdate.userId, statusUpdate)));
        // Cập nhật luôn trường online của user trong state users
        setUsers(prevUsers => prevUsers.map(u =>
          u.id === statusUpdate.userId ? { ...u, online: statusUpdate.online } : u
        ));
      };

      window.addEventListener('userStatusUpdate', handleStatusUpdate);

      return () => {
        window.removeEventListener('userStatusUpdate', handleStatusUpdate);
        websocketService.disconnect();
      };
    }
  }, [token, authLoading, user]);

  const handleUserStatusUpdate = (statusUpdate) => {
    console.log('User status update:', statusUpdate);
    setUserStatuses(prev => new Map(prev.set(statusUpdate.userId, statusUpdate)));
  };

  // Fetch data khi component mount và khi tab thay đổi
  useEffect(() => {
    if (token && !authLoading) {
      console.log("AdminPanel: Fetching data with token");
      fetchData();
    }
  }, [activeTab, token, authLoading]);

  const fetchData = async () => {
    try {
      if (!token) {
        console.error("AdminPanel: No token available");
        setLoading(false);
        return;
      }

      console.log("AdminPanel: Starting fetchData for tab:", activeTab);

      switch (activeTab) {
        case "dashboard":
          await fetchDashboardStats();
          break;
        case "users":
          await fetchUsers();
          break;
        case "coaches":
          await fetchCoaches();
          break;
        case "reports":
          await fetchReports();
          break;
        case "feedback":
          await fetchFeedbacks();
          break;
      }
      setLoading(false);
    } catch (error) {
      console.error("AdminPanel: Lỗi khi tải dữ liệu:", error);
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    const response = await axios.get(`${config.API_BASE_URL}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setStats(response.data);
  };
  
  const fetchUsers = async () => {
    const response = await axios.get(`${config.API_BASE_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUsers(response.data);
  };
  
  const fetchCoaches = async () => {
    const response = await axios.get(
      `${config.API_BASE_URL}/api/admin/coaches`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setCoaches(response.data);
  };
  
  const fetchReports = async () => {
    const response = await axios.get(
      `${config.API_BASE_URL}/api/admin/reports`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setReports(response.data);
  };
  
  const fetchFeedbacks = async () => {
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
      await axios.post(
        `${config.API_BASE_URL}/api/admin/users/${userId}/${action}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`${action === "ban" ? "Khóa" : "Mở khóa"} người dùng thành công!`);
      fetchUsers(); // Refetch users after action
    } catch (error) {
      console.error("Lỗi khi thực hiện hành động:", error);
      alert("Có lỗi xảy ra. Vui lòng thử lại!");
    }
  };

  // Quick action handlers
  const handleQuickAction = (action) => {
    switch (action) {
      case "manageUsers":
        setActiveTab("users");
        break;
      case "viewReports":
        setActiveTab("reports");
        break;
      case "viewFeedback":
        setActiveTab("feedback");
        break;
      case "systemSettings":
        setActiveTab("system");
        break;
      case "createBackup":
        handleCreateBackup();
        break;
      case "viewCoaches":
        setActiveTab("coaches");
        break;
      default:
        break;
    }
  };

  const handleCreateBackup = async () => {
    try {
      const response = await axios.post(
        `${config.API_BASE_URL}/api/admin/backup/create`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        alert("Tạo backup thành công!");
      } else {
        alert("Có lỗi khi tạo backup!");
      }
    } catch (error) {
      console.error("Lỗi khi tạo backup:", error);
      alert("Có lỗi xảy ra khi tạo backup!");
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

  // Hàm xử lý lưu role mới
  const handleSaveRole = async (userId) => {
    try {
      const response = await axios.post(
        `${config.API_BASE_URL}/api/admin/users/${userId}/update-role`, 
        { role: selectedRole }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.status === 200) {
        setUsers(prevUsers => prevUsers.map(u =>
          u.id === userId ? { ...u, role: selectedRole } : u
        ));
        setEditRoleId(null);
        alert('Cập nhật vai trò thành công!');
      }
    } catch (err) {
      console.error('Error updating role:', err);
      
      if (err.response?.status === 401) {
        // Token hết hạn, logout và redirect
        alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      
      alert('Lỗi khi cập nhật role: ' + (err.response?.data?.message || err.message));
    }
  };

  // Hàm xử lý xem chi tiết user
  const handleShowDetail = async (userId) => {
    try {
      const res = await axios.get(
        `${config.API_BASE_URL}/api/admin/users/${userId}`, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserDetail(res.data);
      setShowDetailId(userId);
    } catch (err) {
      alert('Không thể tải thông tin chi tiết!');
    }
  };

  // Kiểm tra và refresh token nếu cần
  const checkAndRefreshToken = () => {
    if (!token) return;
    
    try {
      // Decode JWT token để lấy thời gian hết hạn
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const timeUntilExpiry = expTime - currentTime;
      
      // Nếu token sẽ hết hạn trong 5 phút tới, refresh
      if (timeUntilExpiry < 300000) { // 5 minutes = 300000ms
        console.log('Token will expire soon, refreshing...');
        // Có thể thêm logic refresh token ở đây
        // Hoặc logout user để đăng nhập lại
        alert('Phiên đăng nhập sắp hết hạn. Vui lòng đăng nhập lại!');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Error checking token expiry:', error);
    }
  };

  // Kiểm tra token mỗi phút
  useEffect(() => {
    const tokenCheckInterval = setInterval(checkAndRefreshToken, 60000); // 1 minute
    return () => clearInterval(tokenCheckInterval);
  }, [token]);

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
                {(stats.totalUsers || 0).toLocaleString()}
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
                {(stats.activeUsers || 0).toLocaleString()}
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
                {(stats.totalPlans || 0).toLocaleString()}
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
                {(stats.successfulQuits || 0).toLocaleString()}
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
                {formatCurrency(stats.totalRevenue || 0)}
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
                {(stats.newUsersThisMonth || 0).toLocaleString()}
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
          <button 
            onClick={() => handleQuickAction("manageUsers")}
            className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className="text-2xl mb-2">👥</div>
            <div className="text-sm font-medium">Quản lý người dùng</div>
          </button>
          <button 
            onClick={() => handleQuickAction("viewReports")}
            className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className="text-2xl mb-2">📊</div>
            <div className="text-sm font-medium">Xem báo cáo</div>
          </button>
          <button 
            onClick={() => handleQuickAction("viewFeedback")}
            className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className="text-2xl mb-2">💬</div>
            <div className="text-sm font-medium">Phản hồi mới</div>
          </button>
          <button 
            onClick={() => handleQuickAction("systemSettings")}
            className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className="text-2xl mb-2">⚙️</div>
            <div className="text-sm font-medium">Cài đặt hệ thống</div>
          </button>
          <button 
            onClick={() => handleQuickAction("viewCoaches")}
            className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className="text-2xl mb-2">🎓</div>
            <div className="text-sm font-medium">Quản lý huấn luyện viên</div>
          </button>
          <button 
            onClick={() => handleQuickAction("createBackup")}
            className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className="text-2xl mb-2">💾</div>
            <div className="text-sm font-medium">Tạo backup</div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Hoạt động gần đây
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${
                stats.systemHealth === "HEALTHY" ? "bg-green-500" : 
                stats.systemHealth === "WARNING" ? "bg-yellow-500" : "bg-red-500"
              }`}></div>
              <span className="text-sm text-gray-700">
                Hệ thống: {stats.systemHealth === "HEALTHY" ? "Hoạt động bình thường" : 
                             stats.systemHealth === "WARNING" ? "Cảnh báo" : "Có vấn đề"}
              </span>
            </div>
            <span className="text-xs text-gray-500">Vừa xong</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
              <span className="text-sm text-gray-700">
                {(stats.newUsersThisMonth || 0)} người dùng mới đăng ký tháng này
              </span>
            </div>
            <span className="text-xs text-gray-500">Tháng này</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
              <span className="text-sm text-gray-700">
                {(stats.totalPlans || 0)} kế hoạch cai thuốc tổng cộng
              </span>
            </div>
            <span className="text-xs text-gray-500">Tổng cộng</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-sm text-gray-700">
                {(stats.successfulQuits || 0)} người cai thuốc thành công
              </span>
            </div>
            <span className="text-xs text-gray-500">Tổng cộng</span>
          </div>
          {stats.lastBackup && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">
                  Backup cuối cùng: {new Date(stats.lastBackup).toLocaleString('vi-VN')}
                </span>
              </div>
              <span className="text-xs text-gray-500">Backup</span>
            </div>
          )}
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
                Vai trò
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                Online Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentUsers.map((user) => {
              const userStatus = userStatuses.get(user.id);
              const isOnline = userStatus ? userStatus.online : user.online;
              
              return (
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
                        user.membershipPlanName === "VIP"
                          ? "bg-purple-100 text-purple-800"
                          : user.membershipPlanName === "PREMIUM"
                          ? "bg-yellow-100 text-yellow-800"
                          : user.membershipPlanName === "BASIC"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user.membershipPlanName || "Chưa đăng ký"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200 text-sm">
                    {editRoleId === user.id ? (
                      <div className="flex items-center space-x-2">
                        <select 
                          value={selectedRole} 
                          onChange={(e) => setSelectedRole(e.target.value)}
                          className="border rounded px-2 py-1 text-xs"
                        >
                          <option value="GUEST">Khách</option>
                          <option value="MEMBER">Thành viên</option>
                          <option value="COACH">Huấn luyện viên</option>
                        </select>
                        <button 
                          onClick={() => handleSaveRole(user.id)} 
                          className="px-2 py-1 bg-green-500 text-white rounded text-xs"
                        >
                          Lưu
                        </button>
                        <button 
                          onClick={() => setEditRoleId(null)} 
                          className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs"
                        >
                          Hủy
                        </button>
                      </div>
                    ) : (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        {user.role === "GUEST" ? "Khách" : user.role === "MEMBER" ? "Thành viên" : user.role === "COACH" ? "Huấn luyện viên" : user.role}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.online
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user.online ? "Online" : "Offline"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      {(user.role === "GUEST" || user.role === "MEMBER" || user.role === "COACH") && (
                        <button
                          onClick={() => {
                            setEditRoleId(user.id);
                            setSelectedRole(user.role);
                          }}
                          className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium hover:bg-yellow-200"
                        >
                          Chỉnh sửa Role
                        </button>
                      )}
                      <button 
                        onClick={() => handleShowDetail(user.id)}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium hover:bg-blue-200"
                      >
                        Xem chi tiết
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
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
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Quản lý huấn luyện viên</h3>
      </div>
      <div className="p-6">
        <p className="text-gray-600">Tính năng quản lý huấn luyện viên đang được phát triển...</p>
      </div>
    </div>
  );

  const ReportsTab = () => (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Báo cáo hệ thống</h3>
      </div>
      <div className="p-6">
        <p className="text-gray-600">Tính năng báo cáo đang được phát triển...</p>
      </div>
    </div>
  );

  const FeedbackTab = () => (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Phản hồi từ người dùng</h3>
      </div>
      <div className="p-6">
        <p className="text-gray-600">Tính năng quản lý phản hồi đang được phát triển...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-sm text-gray-600">Quản lý hệ thống và người dùng</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Content */}
        {!loading && (
          <div className="space-y-6">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === "dashboard" && <DashboardTab />}
            {activeTab === "users" && <UsersTab />}
            {activeTab === "coaches" && <CoachesTab />}
            {activeTab === "reports" && <ReportsTab />}
            {activeTab === "feedback" && <FeedbackTab />}
          </div>
        )}
      </div>

      {/* Modal xem chi tiết user */}
      {showDetailId && userDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl font-bold"
              onClick={() => {
                setShowDetailId(null);
                setUserDetail(null);
              }}
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-6 text-gray-800">Thông tin chi tiết người dùng</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Thông tin cơ bản */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Thông tin cơ bản</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">ID:</label>
                    <p className="text-sm text-gray-800 font-mono bg-gray-50 p-2 rounded">{userDetail.id}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Username:</label>
                    <p className="text-sm text-gray-800">{userDetail.username || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Email:</label>
                    <p className="text-sm text-gray-800">{userDetail.email}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Họ và tên:</label>
                    <p className="text-sm text-gray-800">
                      {userDetail.firstName || ''} {userDetail.lastName || ''}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Vai trò:</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      userDetail.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                      userDetail.role === 'COACH' ? 'bg-blue-100 text-blue-800' :
                      userDetail.role === 'MEMBER' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {userDetail.role === "GUEST" ? "Khách" : 
                       userDetail.role === "MEMBER" ? "Thành viên" : 
                       userDetail.role === "COACH" ? "Huấn luyện viên" : 
                       userDetail.role === "ADMIN" ? "Quản trị viên" : userDetail.role}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Thông tin bổ sung */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Thông tin bổ sung</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Nhà cung cấp xác thực:</label>
                    <p className="text-sm text-gray-800">{userDetail.authProvider || 'LOCAL'}</p>
                  </div>
                  
                  {userDetail.googleId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Google ID:</label>
                      <p className="text-sm text-gray-800 font-mono bg-gray-50 p-2 rounded text-xs">{userDetail.googleId}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Số điện thoại:</label>
                    <p className="text-sm text-gray-800">{userDetail.phoneNumber || 'Chưa cập nhật'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Giới tính:</label>
                    <p className="text-sm text-gray-800">{userDetail.gender || 'Chưa cập nhật'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Ngày sinh:</label>
                    <p className="text-sm text-gray-800">
                      {userDetail.dateOfBirth ? new Date(userDetail.dateOfBirth).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Thông tin thành viên */}
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Thông tin thành viên</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Gói thành viên hiện tại:</label>
                  <p className="text-sm text-gray-800">
                    {userDetail.currentMembershipPlan ? userDetail.currentMembershipPlan.planName : 'Chưa đăng ký'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600">Đã sử dụng gói miễn phí:</label>
                  <p className="text-sm text-gray-800">
                    {userDetail.freePlanClaimed ? 'Có' : 'Chưa'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600">Ngày bắt đầu thành viên:</label>
                  <p className="text-sm text-gray-800">
                    {userDetail.membershipStartDate ? new Date(userDetail.membershipStartDate).toLocaleDateString('vi-VN') : 'N/A'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600">Ngày kết thúc thành viên:</label>
                  <p className="text-sm text-gray-800">
                    {userDetail.membershipEndDate ? new Date(userDetail.membershipEndDate).toLocaleDateString('vi-VN') : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Thông tin tài khoản */}
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Trạng thái tài khoản</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Tài khoản kích hoạt:</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    userDetail.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {userDetail.enabled ? 'Có' : 'Không'}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600">Tài khoản khóa:</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    userDetail.accountNonLocked ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {userDetail.accountNonLocked ? 'Không' : 'Có'}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600">Tài khoản hết hạn:</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    userDetail.accountNonExpired ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {userDetail.accountNonExpired ? 'Không' : 'Có'}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600">Mật khẩu hết hạn:</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    userDetail.credentialsNonExpired ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {userDetail.credentialsNonExpired ? 'Không' : 'Có'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Thông tin thời gian */}
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Thông tin thời gian</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Ngày tạo tài khoản:</label>
                  <p className="text-sm text-gray-800">
                    {userDetail.createdAt ? new Date(userDetail.createdAt).toLocaleString('vi-VN') : 'N/A'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600">Cập nhật lần cuối:</label>
                  <p className="text-sm text-gray-800">
                    {userDetail.updatedAt ? new Date(userDetail.updatedAt).toLocaleString('vi-VN') : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Avatar */}
            {userDetail.pictureUrl && (
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Ảnh đại diện</h3>
                <div className="flex justify-center">
                  <img 
                    src={userDetail.pictureUrl} 
                    alt="Avatar" 
                    className="w-24 h-24 rounded-full border-4 border-gray-200"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;