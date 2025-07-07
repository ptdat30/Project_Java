import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../../config/config.js";
import authService from "../../services/authService";
import AvatarFromName from '../common/AvatarFromName';
import apiService from "../../services/apiService";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
    avatar: null,
  });
  const [errors, setErrors] = useState({});
  const [sharedAchievements, setSharedAchievements] = useState([]);

  useEffect(() => {
    if (!loading && (!isAuthenticated || !user)) {
      navigate("/login");
      return;
    }
    
    // Refetch profile from backend when page loads (only once)
    const fetchProfile = async () => {
      try {
        const latestProfile = await apiService.getUserProfile();
        if (latestProfile) {
          updateUser(latestProfile); // Update AuthContext and localStorage
        }
      } catch (e) {
        // ignore
      }
    };
    
    // Only fetch if we have a user (to avoid unnecessary calls)
    if (user) {
      fetchProfile();
    }

    // Load shared achievements
    apiService.getMySharedAchievements && apiService.getMySharedAchievements().then(setSharedAchievements);
  }, []); // Empty dependency array - only run once when component mounts

  // Separate useEffect to update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        dateOfBirth: user.dateOfBirth || "",
        gender: user.gender || "",
        avatar: null, // Không set avatar file, chỉ dùng khi upload mới
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Xóa lỗi khi user bắt đầu nhập
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Kiểm tra định dạng file
      const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!allowedTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          avatar: "Chỉ chấp nhận file ảnh định dạng JPG, PNG, GIF",
        }));
        return;
      }

      // Kiểm tra kích thước file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          avatar: "Kích thước file không được vượt quá 5MB",
        }));
        return;
      }
      setFormData((prev) => ({
        ...prev,
        avatar: file,
      }));
      setErrors((prev) => ({
        ...prev,
        avatar: "",
      }));
    }
  };
  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) {
      newErrors.firstName = "Tên không được để trống";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Họ không được để trống";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email không được để trống";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const token = authService.getToken();
      const submitData = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== "") {
          if (key === "dateOfBirth") {
            const date = new Date(formData.dateOfBirth);
            const yyyyMMdd = date.toISOString().slice(0, 10);
            submitData.append("dateOfBirth", yyyyMMdd);
          } else {
            submitData.append(key, formData[key]);
          }
        }
      });
      const response = await axios.put(
        `${config.API_BASE_URL}${config.endpoints.updateProfile}`,
        submitData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      updateUser(response.data); // Cập nhật lại context và localStorage
      setEditing(false);
      alert("Cập nhật thông tin thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật profile:", error);
      alert("Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại!");
    }
  };
  const cancelEdit = () => {
    setEditing(false);
    setFormData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
      dateOfBirth: user?.dateOfBirth || "",
      gender: user?.gender || "",
      avatar: null,
    });
    setErrors({});
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full flex items-center justify-center">
                {user?.pictureUrl ? (
                  <img
                  src={
                    user.pictureUrl.startsWith("http")
                      ? user.pictureUrl
                      : `http://localhost:8080${user.pictureUrl}`
                  }
                  alt="Avatar"
                  className="h-16 w-16 rounded-full object-cover"
                />
                ) : (
                  <AvatarFromName 
                    firstName={user?.firstName} 
                    lastName={user?.lastName} 
                    size={64}
                  />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {user?.firstName} {user?.lastName}
                </h1>
                <p className="text-gray-600">{user?.email}</p>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user?.membership?.planName === "Gói 90 Ngày"
                      ? "bg-violet-500 text-white"
                      : user?.membership?.planName === "Gói 60 Ngày"
                      ? "bg-yellow-500 text-white"
                      : user?.membership?.planName === "Gói 30 Ngày"
                      ? "bg-gray-500 text-white"
                      : "bg-green-500 text-white"
                  }`}
                >
                  {(() => {
                    const planName = user?.membership?.planName;
                    if (planName === "Gói 30 Ngày") return "Gói thành viên 1";
                    if (planName === "Gói 60 Ngày") return "Gói thành viên 2";
                    if (planName === "Gói 90 Ngày") return "Gói thành viên 3";
                    return planName || "FREE";
                  })()}
                </span>
              </div>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Chỉnh sửa
              </button>
            )}
          </div>
        </div>
        {/* Vùng thành tựu đã chia sẻ */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-bold mb-4 text-blue-700">Các thành tựu đã chia sẻ</h2>
          {sharedAchievements.length === 0 ? (
            <div className="text-gray-500">Bạn chưa chia sẻ thành tựu nào.</div>
          ) : (
            <div className="flex flex-wrap gap-4">
              {sharedAchievements.map((ach) => (
                <div
                  key={ach.achievementId}
                  className="flex flex-col items-center"
                  title={ach.achievementName}
                >
                  <span className="text-3xl mb-1">{ach.achievementIconUrl || "🏆"}</span>
                  <span className="text-xs text-gray-700 text-center">{ach.achievementName}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Profile Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Thông tin cá nhân
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Họ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    editing
                      ? "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      : "border-gray-200 bg-gray-50"
                  } ${errors.lastName ? "border-red-500" : ""}`}
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                )}
              </div>
              {/* Tên */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    editing
                      ? "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      : "border-gray-200 bg-gray-50"
                  } ${errors.firstName ? "border-red-500" : ""}`}
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.firstName}
                  </p>
                )}
              </div>
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    editing
                      ? "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      : "border-gray-200 bg-gray-50"
                  } ${errors.email ? "border-red-500" : ""}`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
              {/* Số điện thoại */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    editing
                      ? "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      : "border-gray-200 bg-gray-50"
                  }`}
                />
              </div>
              {/* Ngày sinh */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày sinh
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    editing
                      ? "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      : "border-gray-200 bg-gray-50"
                  }`}
                />
              </div>
              {/* Giới tính */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giới tính
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    editing
                      ? "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <option value="">Chọn giới tính</option>
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>
            </div>
            {/* Avatar upload */}
            {editing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ảnh đại diện
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Chấp nhận file JPG, PNG, GIF. Tối đa 5MB.
                </p>
                {errors.avatar && (
                  <p className="mt-1 text-sm text-red-600">{errors.avatar}</p>
                )}
              </div>
            )}
            {/* Action buttons */}
            {editing && (
              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Lưu thay đổi
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Hủy
                </button>
              </div>
            )}
          </form>
        </div>
        {/* Membership Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Thông tin thành viên
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900">Gói hiện tại</h3>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                {(() => {
                  const planName = user?.membership?.planName;
                  if (planName === "Gói 30 Ngày") return "Gói thành viên 1";
                  if (planName === "Gói 60 Ngày") return "Gói thành viên 2";
                  if (planName === "Gói 90 Ngày") return "Gói thành viên 3";
                  return planName || "FREE";
                })()}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900">Ngày hết hạn</h3>
              <p className="text-lg text-red-600 mt-2">
                {user?.membership?.membershipEndDate
                  ? (() => {
                      const date = new Date(user.membership.membershipEndDate);
                      return !isNaN(date)
                        ? `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
                            .toString()
                            .padStart(2, "0")}/${date.getFullYear()}`
                        : user.membership.membershipEndDate;
                    })()
                  : "Không giới hạn"}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900">Vai trò</h3>
              <p className="text-lg text-green-600 mt-2">
                {user?.role || "MEMBER"}
              </p>
            </div>
          </div>
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate("/membership")}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              Nâng cấp gói thành viên
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProfilePage;
