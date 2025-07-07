import React, { useState, useEffect } from "react";
import axios from "axios";
import config from "../../config/config.js";
import { useAuth } from "../../context/AuthContext";
import websocketService from "../../services/websocketService";
import AvatarFromName from '../common/AvatarFromName';

const AdminPanel = () => {
  const { token, loading: authLoading, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [dashboardStats, setDashboardStats] = useState({});
  const [users, setUsers] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [reports, setReports] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [userRoleFilter, setUserRoleFilter] = useState("");
  const [userNameFilter, setUserNameFilter] = useState("");
  const [editRoleId, setEditRoleId] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [userDetail, setUserDetail] = useState(null);
  const [showDetailId, setShowDetailId] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [encryptionStats, setEncryptionStats] = useState({ unencryptedCount: 0, totalCount: 0 });
  const [migrationStatus, setMigrationStatus] = useState({ isRunning: false, message: '', migratedCount: 0 });
  const [userStatuses, setUserStatuses] = useState(new Map());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConsultationId, setDeleteConsultationId] = useState(null);
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState("");
  const [showRoleUpdateModal, setShowRoleUpdateModal] = useState(false);
  const [roleUpdateMessage, setRoleUpdateMessage] = useState("");
  const [roleUpdateSuccess, setRoleUpdateSuccess] = useState(true);

  const tabs = [
    { id: "dashboard", name: "Tổng quan", icon: "📊" },
    { id: "users", name: "Quản lý người dùng", icon: "👥" },
    { id: "conversations", name: "Quản lý trò chuyện", icon: "💬" },
    { id: "encryption", name: "Mã hóa tin nhắn", icon: "🔐" },
    { id: "reports", name: "Báo cáo", icon: "📈" },
    { id: "feedback", name: "Phản hồi", icon: "💬" },
    { id: "system", name: "Hệ thống", icon: "⚙️" },
  ];

  useEffect(() => {
    console.log("AdminPanel: Token received:", token ? "Present" : "Missing");
    console.log("AdminPanel: Auth loading:", authLoading);
  }, [token, authLoading]);

  useEffect(() => {
    if (token && !authLoading && user) {
      websocketService.connect(
        user.id,
        'admin-panel', 
        handleUserStatusUpdate
      );

      const handleStatusUpdate = (event) => {
        const statusUpdate = event.detail;
        console.log('AdminPanel: Received user status update:', statusUpdate);
        setUserStatuses(prev => new Map(prev.set(statusUpdate.userId, statusUpdate)));
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

  useEffect(() => {
    if (token && !authLoading) {
      console.log("AdminPanel: Fetching data with token");
      fetchData();
      if (activeTab === "conversations") fetchConsultations();
      if (activeTab === "encryption") checkUnencryptedMessages();
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
    setDashboardStats(response.data);
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
  
  const fetchConsultations = async () => {
    try {
      const response = await axios.get(`${config.API_BASE_URL}/api/coach-consultations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConsultations(response.data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách cuộc trò chuyện:', error);
      setConsultations([]);
    }
  };
  
  const handleUserAction = async (userId, action) => {
    try {
      await axios.post(
        `${config.API_BASE_URL}/api/admin/users/${userId}/${action}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`${action === "ban" ? "Khóa" : "Mở khóa"} người dùng thành công!`);
      fetchUsers();
    } catch (error) {
      console.error("Lỗi khi thực hiện hành động:", error);
      alert("Có lỗi xảy ra. Vui lòng thử lại!");
    }
  };

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

  const filteredUsers = users.filter(user => {
    const matchRole = userRoleFilter ? user.role === userRoleFilter : true;
    const matchName = userNameFilter ? (
      (user.username && user.username.toLowerCase().includes(userNameFilter.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(userNameFilter.toLowerCase()))
    ) : true;
    return matchRole && matchName;
  });

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
        setRoleUpdateMessage('Cập nhật vai trò thành công!');
        setRoleUpdateSuccess(true);
        setShowRoleUpdateModal(true);
      }
    } catch (err) {
      console.error('Error updating role:', err);
      if (err.response?.status === 401) {
        setRoleUpdateMessage('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
        setRoleUpdateSuccess(false);
        setShowRoleUpdateModal(true);
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }, 1500);
        return;
      }
      setRoleUpdateMessage('Lỗi khi cập nhật role: ' + (err.response?.data?.message || err.message));
      setRoleUpdateSuccess(false);
      setShowRoleUpdateModal(true);
    }
  };

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

  const checkAndRefreshToken = () => {
    if (!token) return;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expTime = payload.exp * 1000;
      const currentTime = Date.now();
      const timeUntilExpiry = expTime - currentTime;
      
      if (timeUntilExpiry < 300000) {
        console.log('Token will expire soon, refreshing...');
        alert('Phiên đăng nhập sắp hết hạn. Vui lòng đăng nhập lại!');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Error checking token expiry:', error);
    }
  };

  useEffect(() => {
    const tokenCheckInterval = setInterval(checkAndRefreshToken, 60000);
    return () => clearInterval(tokenCheckInterval);
  }, [token]);

  const handleDeleteConsultation = async (consultationId) => {
    try {
      await axios.delete(`${config.API_BASE_URL}/api/coach-consultations/${consultationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchConsultations();
    } catch (error) {
      console.error('Lỗi khi xóa cuộc trò chuyện:', error);
    }
  };

  const checkUnencryptedMessages = async () => {
    try {
      const response = await axios.get(`${config.API_BASE_URL}/api/admin/chat-migration/check`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEncryptionStats({
        unencryptedCount: response.data.unencryptedCount,
        totalCount: response.data.unencryptedCount
      });
    } catch (error) {
      console.error('Lỗi khi kiểm tra tin nhắn chưa mã hóa:', error);
    }
  };

  const runMigration = async () => {
    try {
      setMigrationStatus({ isRunning: true, message: 'Đang mã hóa tin nhắn...', migratedCount: 0 });
      const response = await axios.post(`${config.API_BASE_URL}/api/admin/chat-migration/migrate`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMigrationStatus({
        isRunning: false,
        message: response.data.message,
        migratedCount: response.data.migratedCount
      });
      checkUnencryptedMessages();
    } catch (error) {
      setMigrationStatus({
        isRunning: false,
        message: 'Lỗi khi mã hóa: ' + error.message,
        migratedCount: 0
      });
      console.error('Lỗi khi chạy migration:', error);
    }
  };

  const DashboardTab = () => (
    <div className="space-y-6">
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
                {(dashboardStats.totalUsers || 0).toLocaleString()}
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
                {(dashboardStats.activeUsers || 0).toLocaleString()}
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
                {(dashboardStats.totalPlans || 0).toLocaleString()}
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
                {(dashboardStats.successfulQuits || 0).toLocaleString()}
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
                {formatCurrency(dashboardStats.totalRevenue || 0)}
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
                {(dashboardStats.newUsersThisMonth || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
      
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

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Hoạt động gần đây
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${
                dashboardStats.systemHealth === "HEALTHY" ? "bg-green-500" : 
                dashboardStats.systemHealth === "WARNING" ? "bg-yellow-500" : "bg-red-500"
              }`}></div>
              <span className="text-sm text-gray-700">
                Hệ thống: {dashboardStats.systemHealth === "HEALTHY" ? "Hoạt động bình thường" : 
                             dashboardStats.systemHealth === "WARNING" ? "Cảnh báo" : "Có vấn đề"}
              </span>
            </div>
            <span className="text-xs text-gray-500">Vừa xong</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
              <span className="text-sm text-gray-700">
                {(dashboardStats.newUsersThisMonth || 0)} người dùng mới đăng ký tháng này
              </span>
            </div>
            <span className="text-xs text-gray-500">Tháng này</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
              <span className="text-sm text-gray-700">
                {(dashboardStats.totalPlans || 0)} kế hoạch cai thuốc tổng cộng
              </span>
            </div>
            <span className="text-xs text-gray-500">Tổng cộng</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-sm text-gray-700">
                {(dashboardStats.successfulQuits || 0)} người cai thuốc thành công
              </span>
            </div>
            <span className="text-xs text-gray-500">Tổng cộng</span>
          </div>
          {dashboardStats.lastBackup && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">
                  Backup cuối cùng: {new Date(dashboardStats.lastBackup).toLocaleString('vi-VN')}
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
        <div className="flex flex-wrap gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lọc theo vai trò:</label>
            <select
              value={userRoleFilter}
              onChange={e => { setUserRoleFilter(e.target.value); setCurrentPage(1); }}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="">Tất cả</option>
              <option value="GUEST">Khách</option>
              <option value="MEMBER">Thành viên</option>
              <option value="COACH">Huấn luyện viên</option>
              <option value="ADMIN">Quản trị viên</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm tên hoặc username hoặc email:</label>
            <input
              type="text"
              value={userNameFilter}
              onChange={e => { setUserNameFilter(e.target.value); setCurrentPage(1); }}
              placeholder="Nhập tên hoặc username..."
              className="border rounded px-2 py-1 text-sm"
            />
          </div>
        </div>
      </div>
      <div className="overflow-x-auto w-full">
        <table className="min-w-[900px] w-full divide-y divide-gray-200">
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
                      <AvatarFromName 
                        firstName={user.firstName}
                        lastName={user.lastName}
                        size={40}
                      />
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
      <div className="py-3 px-6 flex justify-between items-center bg-gray-50 border-t border-gray-200">
        <div className="text-sm text-gray-700">
          Hiển thị {indexOfFirstUser + 1} đến {Math.min(indexOfLastUser, filteredUsers.length)} của {filteredUsers.length} người dùng
        </div>
        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
          {Array.from({ length: Math.ceil(filteredUsers.length / usersPerPage) }, (_, i) => (
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

  const FeedbackTab = () => {
    return (
        <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Phản hồi từ người dùng</h3>
            </div>
            <div className="overflow-x-auto w-full">
                <table className="min-w-[900px] w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Người dùng
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Đánh giá
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nội dung phản hồi
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Thời gian gửi
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Hành động
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {feedbacks && feedbacks.length > 0 ? (
                            feedbacks.map((feedback) => (
                                <tr key={feedback.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                                <span className="text-green-600 font-medium text-sm">
                                                    {feedback.userName ? feedback.userName.substring(0, 2).toUpperCase() : 'U'}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{feedback.userName || 'N/A'}</div>
                                                <div className="text-gray-500 text-xs">{feedback.userEmail || 'N/A'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div className="flex items-center">
                                            <span className="text-yellow-400 mr-1">
                                                {feedback.rating !== null ? '⭐'.repeat(feedback.rating) : 'N/A'}
                                            </span>
                                            <span className="text-gray-500 text-xs">({feedback.rating}/5)</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                                        <div className="max-h-20 overflow-y-auto">
                                            {feedback.feedbackContent || "Không có nội dung"}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {feedback.submissionTime ? new Date(feedback.submissionTime).toLocaleString('vi-VN') : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <button
                                            onClick={() => {
                                                setSelectedFeedback(feedback);
                                                setShowFeedbackModal(true);
                                            }}
                                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium hover:bg-blue-200"
                                        >
                                            Xem chi tiết
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                    Không có phản hồi nào.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const ConversationsTab = () => (
  <div className="bg-white rounded-lg shadow-sm">
    <div className="px-6 py-4 border-b border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900">Quản lý các cuộc trò chuyện</h3>
    </div>
    <div className="overflow-x-auto w-full">
      <table className="min-w-[900px] w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thành viên</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Huấn luyện viên</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại phiên</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {consultations.length > 0 ? consultations.map((c) => (
            <tr key={c.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <AvatarFromName firstName={c.memberFirstName} lastName={c.memberLastName} size={32} />
                  <div className="ml-2">
                    <div className="text-sm font-medium text-gray-900">{c.memberFirstName} {c.memberLastName}</div>
                    <div className="text-xs text-gray-500">{c.memberUsername} / {c.memberEmail}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <AvatarFromName firstName={c.coachFirstName} lastName={c.coachLastName} size={32} />
                  <div className="ml-2">
                    <div className="text-sm font-medium text-gray-900">{c.coachFirstName} {c.coachLastName}</div>
                    <div className="text-xs text-gray-500">{c.coachUsername} / {c.coachEmail}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{c.sessionType}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{c.status}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{c.createdAt ? new Date(c.createdAt).toLocaleString('vi-VN') : ''}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => {
                    setDeleteConsultationId(c.id);
                    setShowDeleteModal(true);
                  }}
                  className="px-3 py-1 bg-red-100 text-red-800 rounded text-xs font-medium hover:bg-red-200"
                >Xóa</button>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan="6" className="px-6 py-4 text-center text-gray-500">Không có cuộc trò chuyện nào.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const EncryptionTab = () => (
  <div className="bg-white rounded-lg shadow-sm">
    <div className="px-6 py-4 border-b border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900">Quản lý mã hóa tin nhắn chat</h3>
      <p className="text-sm text-gray-600 mt-1">
        Mã hóa tất cả tin nhắn chat để bảo vệ quyền riêng tư của người dùng
      </p>
    </div>
    
    <div className="p-6 space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-lg font-medium text-blue-900 mb-2">Thống kê mã hóa</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <div className="text-2xl font-bold text-blue-600">{encryptionStats.unencryptedCount}</div>
            <div className="text-sm text-blue-700">Tin nhắn chưa mã hóa</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-green-100">
            <div className="text-2xl font-bold text-green-600">
              {encryptionStats.totalCount - encryptionStats.unencryptedCount}
            </div>
            <div className="text-sm text-green-700">Tin nhắn đã mã hóa</div>
          </div>
        </div>
      </div>

      {migrationStatus.message && (
        <div className={`border rounded-lg p-4 ${
          migrationStatus.isRunning ? 'bg-yellow-50 border-yellow-200' :
          migrationStatus.migratedCount > 0 ? 'bg-green-50 border-green-200' :
          'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center">
            {migrationStatus.isRunning && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
            )}
            <span className={`text-sm font-medium ${
              migrationStatus.isRunning ? 'text-yellow-800' :
              migrationStatus.migratedCount > 0 ? 'text-green-800' :
              'text-red-800'
            }`}>
              {migrationStatus.message}
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={checkUnencryptedMessages}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          🔍 Kiểm tra tin nhắn chưa mã hóa
        </button>
        
        <button
          onClick={runMigration}
          disabled={migrationStatus.isRunning || encryptionStats.unencryptedCount === 0}
          className={`flex-1 font-medium py-2 px-4 rounded-lg transition-colors ${
            migrationStatus.isRunning || encryptionStats.unencryptedCount === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {migrationStatus.isRunning ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Đang mã hóa...
            </>
          ) : (
            '🔐 Mã hóa tất cả tin nhắn'
          )}
        </button>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-lg font-medium text-gray-900 mb-2">Thông tin bảo mật</h4>
        <ul className="text-sm text-gray-700 space-y-2">
          <li>• Sử dụng thuật toán AES-256 để mã hóa tin nhắn</li>
          <li>• Khóa mã hóa được lưu trữ an toàn trong cấu hình hệ thống</li>
          <li>• Tin nhắn được tự động giải mã khi hiển thị cho người dùng</li>
          <li>• Quá trình mã hóa không ảnh hưởng đến hiệu suất hệ thống</li>
        </ul>
      </div>
    </div>
  </div>
);

  return (
    <div className="min-h-screen bg-gray-50 max-w-full overflow-x-hidden">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {!loading && (
          <div className="space-y-6">
            {/* Tabs */}
            <div className="border-b border-gray-200 overflow-x-auto w-full">
              <nav className="-mb-px flex flex-nowrap space-x-4 sm:space-x-8 hide-scrollbar">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-2 sm:px-3 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
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

            {activeTab === "dashboard" && <DashboardTab />}
            {activeTab === "users" && <UsersTab />}
            {activeTab === "coaches" && <CoachesTab />}
            {activeTab === "reports" && <ReportsTab />}
            {activeTab === "feedback" && <FeedbackTab />}
            {activeTab === "conversations" && <ConversationsTab />}
            {activeTab === "encryption" && <EncryptionTab />}
          </div>
        )}
      </div>

      {showDetailId && userDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 px-2">
          <div className="bg-white rounded-lg shadow-lg p-2 sm:p-4 md:p-6 w-full max-w-lg md:max-w-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-500 hover:text-gray-700 text-xl font-bold"
              onClick={() => {
                setShowDetailId(null);
                setUserDetail(null);
              }}
            >
              ×
            </button>
            <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-gray-800">Thông tin chi tiết người dùng</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
            <div className="mt-4 sm:mt-6 space-y-4">
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
            <div className="mt-4 sm:mt-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Ảnh đại diện</h3>
              <div className="flex justify-center">
                {userDetail.pictureUrl ? (
                  <img 
                    src={userDetail.pictureUrl} 
                    alt="Avatar" 
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-gray-200 object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <AvatarFromName 
                    firstName={userDetail.firstName} 
                    lastName={userDetail.lastName} 
                    size={80}
                    className="border-4 border-gray-200"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal xem chi tiết feedback */}
      {showFeedbackModal && selectedFeedback && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl mx-4 relative overflow-y-auto" style={{maxHeight: '95vh'}}>
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Chi tiết phản hồi</h3>
                <button
                  onClick={() => {
                    setShowFeedbackModal(false);
                    setSelectedFeedback(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="px-6 py-4 space-y-6">
              {/* Thông tin người dùng */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-md font-semibold text-gray-700 mb-3">Thông tin người dùng</h4>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-green-600 font-medium text-sm">
                      {selectedFeedback.userName ? selectedFeedback.userName.substring(0, 2).toUpperCase() : 'U'}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-lg">{selectedFeedback.userName || 'N/A'}</div>
                    <div className="text-gray-500">{selectedFeedback.userEmail || 'N/A'}</div>
                    <div className="text-gray-400 text-sm">ID: {selectedFeedback.userId || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Đánh giá */}
              <div className="bg-yellow-50 rounded-lg p-4">
                <h4 className="text-md font-semibold text-gray-700 mb-3">Đánh giá</h4>
                <div className="flex items-center">
                  <span className="text-yellow-400 text-2xl mr-3">
                    {selectedFeedback.rating !== null ? '⭐'.repeat(selectedFeedback.rating) : 'N/A'}
                  </span>
                  <span className="text-gray-700 font-medium">({selectedFeedback.rating}/5)</span>
                </div>
              </div>

              {/* Nội dung phản hồi */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="text-md font-semibold text-gray-700 mb-3">Nội dung phản hồi</h4>
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <p className="text-gray-800 leading-relaxed">
                    {selectedFeedback.feedbackContent || "Không có nội dung"}
                  </p>
                </div>
              </div>

              {/* Thông tin thời gian */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-md font-semibold text-gray-700 mb-3">Thông tin thời gian</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-500 text-sm">Thời gian gửi:</span>
                    <div className="font-medium text-gray-900">
                      {selectedFeedback.submissionTime ? new Date(selectedFeedback.submissionTime).toLocaleString('vi-VN') : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">ID phản hồi:</span>
                    <div className="font-medium text-gray-900">{selectedFeedback.id}</div>
                  </div>
                </div>
              </div>

              {/* Thông báo */}
              {selectedFeedback.message && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="text-md font-semibold text-gray-700 mb-3">Thông báo</h4>
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <p className="text-gray-800">{selectedFeedback.message}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowFeedbackModal(false);
                  setSelectedFeedback(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  // Có thể thêm chức năng trả lời feedback ở đây
                  console.log("Trả lời feedback:", selectedFeedback.id);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Trả lời
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa cuộc trò chuyện */}
      {showDeleteModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-4 relative">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Xác nhận xóa cuộc trò chuyện</h3>
            <p className="mb-6 text-gray-700">Bạn có chắc chắn muốn xóa cuộc trò chuyện này? Hành động này không thể hoàn tác.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConsultationId(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={async () => {
                  if (deleteConsultationId) {
                    await handleDeleteConsultation(deleteConsultationId);
                    setShowDeleteModal(false);
                    setDeleteConsultationId(null);
                    setDeleteSuccessMessage("Đã xóa cuộc trò chuyện thành công!");
                    setTimeout(() => setDeleteSuccessMessage(""), 2500);
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Thông báo xóa thành công */}
      {deleteSuccessMessage && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[100]">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in">
            {deleteSuccessMessage}
          </div>
        </div>
      )}

      {/* Modal thông báo cập nhật role */}
      {showRoleUpdateModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-4 relative">
            <h3 className={`text-lg font-semibold mb-4 ${roleUpdateSuccess ? 'text-green-700' : 'text-red-700'}`}>{roleUpdateSuccess ? 'Thành công' : 'Lỗi'}</h3>
            <p className="mb-6 text-gray-700">{roleUpdateMessage}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowRoleUpdateModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;

/* CSS ẩn thanh cuộn ngang cho tabs */
<style jsx global>{`
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`}</style>