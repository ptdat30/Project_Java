import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../../config/config.js";
const SettingsPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    notifications: {
      dailyReminder: true,
      weeklyReport: true,
      achievementAlert: true,
      motivationalMessage: true,
      reminderTime: "09:00",
    },
    privacy: {
      profileVisibility: "PUBLIC",
      shareAchievements: true,
      allowCoachContact: true,
    },
    preferences: {
      language: "vi",
      theme: "light",
      currency: "VND",
      dateFormat: "DD/MM/YYYY",
    },
  });
  const [saving, setSaving] = useState(false);
  const [changePasswordData, setChangePasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});
  useEffect(() => {
    fetchUserSettings();
  }, []);
  const fetchUserSettings = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      // Fetch user profile
      const userResponse = await axios.get(
        `${config.API_BASE_URL}${config.endpoints.userProfile}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUser(userResponse.data);
      // Fetch user settings
      try {
        const settingsResponse = await axios.get(
          `${config.API_BASE_URL}/api/users/settings`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSettings((prev) => ({
          ...prev,
          ...settingsResponse.data,
        }));
      } catch (settingsError) {
        console.log("Sử dụng cài đặt mặc định");
      }
    } catch (error) {
      console.error("Lỗi khi tải cài đặt:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };
  const handleSettingChange = (category, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };
  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${config.API_BASE_URL}/api/users/settings`, settings, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Cài đặt đã được lưu thành công!");
    } catch (error) {
      console.error("Lỗi khi lưu cài đặt:", error);
      alert("Có lỗi xảy ra khi lưu cài đặt. Vui lòng thử lại!");
    } finally {
      setSaving(false);
    }
  };
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setChangePasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };
  const validatePassword = () => {
    const errors = {};
    if (!changePasswordData.currentPassword) {
      errors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
    }
    if (!changePasswordData.newPassword) {
      errors.newPassword = "Vui lòng nhập mật khẩu mới";
    } else if (changePasswordData.newPassword.length < 6) {
      errors.newPassword = "Mật khẩu mới phải có ít nhất 6 ký tự";
    }
    if (!changePasswordData.confirmPassword) {
      errors.confirmPassword = "Vui lòng xác nhận mật khẩu mới";
    } else if (
      changePasswordData.newPassword !== changePasswordData.confirmPassword
    ) {
      errors.confirmPassword = "Xác nhận mật khẩu không khớp";
    }
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!validatePassword()) {
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${config.API_BASE_URL}/api/users/change-password`,
        {
          currentPassword: changePasswordData.currentPassword,
          newPassword: changePasswordData.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Đổi mật khẩu thành công!");
      setShowChangePassword(false);
      setChangePasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Lỗi khi đổi mật khẩu:", error);
      if (error.response?.status === 400) {
        setPasswordErrors({ currentPassword: "Mật khẩu hiện tại không đúng" });
      } else {
        alert("Có lỗi xảy ra khi đổi mật khẩu. Vui lòng thử lại!");
      }
    }
  };
  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác!"
    );

    if (!confirmDelete) return;
    const finalConfirm = window.prompt(
      'Để xác nhận xóa tài khoản, vui lòng nhập "XOA TAI KHOAN":'
    );
    if (finalConfirm !== "XOA TAI KHOAN") {
      alert("Xác nhận không đúng. Hủy xóa tài khoản.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${config.API_BASE_URL}/api/users/delete-account`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Tài khoản đã được xóa thành công.");
      localStorage.removeItem("token");
      navigate("/");
    } catch (error) {
      console.error("Lỗi khi xóa tài khoản:", error);
      alert("Có lỗi xảy ra khi xóa tài khoản. Vui lòng thử lại!");
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải cài đặt...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Cài đặt</h1>
          <p className="text-gray-600 mt-2">
            Quản lý thông tin và tùy chọn tài khoản của bạn
          </p>
        </div>
        {/* Notifications Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🔔 Thông báo
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">
                  Nhắc nhở hàng ngày
                </h3>
                <p className="text-sm text-gray-600">
                  Nhận thông báo động viên và nhắc nhở mỗi ngày
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.dailyReminder}
                  onChange={(e) =>
                    handleSettingChange(
                      "notifications",
                      "dailyReminder",
                      e.target.checked
                    )
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Báo cáo hàng tuần</h3>
                <p className="text-sm text-gray-600">
                  Nhận tổng kết tiến trình cai thuốc hàng tuần
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.weeklyReport}
                  onChange={(e) =>
                    handleSettingChange(
                      "notifications",
                      "weeklyReport",
                      e.target.checked
                    )
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">
                  Thông báo huy hiệu
                </h3>
                <p className="text-sm text-gray-600">
                  Nhận thông báo khi đạt được huy hiệu mới
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.achievementAlert}
                  onChange={(e) =>
                    handleSettingChange(
                      "notifications",
                      "achievementAlert",
                      e.target.checked
                    )
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">
                  Tin nhắn động viên
                </h3>
                <p className="text-sm text-gray-600">
                  Nhận câu nói tích cực và động viên
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.motivationalMessage}
                  onChange={(e) =>
                    handleSettingChange(
                      "notifications",
                      "motivationalMessage",
                      e.target.checked
                    )
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">
                  Thời gian nhắc nhở
                </h3>
                <p className="text-sm text-gray-600">
                  Thời gian nhận thông báo hàng ngày
                </p>
              </div>
              <input
                type="time"
                value={settings.notifications.reminderTime}
                onChange={(e) =>
                  handleSettingChange(
                    "notifications",
                    "reminderTime",
                    e.target.value
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
        {/* Privacy Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🔒 Quyền riêng tư
          </h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Hiển thị hồ sơ</h3>
              <select
                value={settings.privacy.profileVisibility}
                onChange={(e) =>
                  handleSettingChange(
                    "privacy",
                    "profileVisibility",
                    e.target.value
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="PUBLIC">Công khai</option>
                <option value="FRIENDS">Chỉ bạn bè</option>
                <option value="PRIVATE">Riêng tư</option>
              </select>
              <p className="text-sm text-gray-600 mt-1">
                Ai có thể xem hồ sơ của bạn trong cộng đồng
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Chia sẻ huy hiệu</h3>
                <p className="text-sm text-gray-600">
                  Cho phép chia sẻ huy hiệu thành tích với cộng đồng
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.privacy.shareAchievements}
                  onChange={(e) =>
                    handleSettingChange(
                      "privacy",
                      "shareAchievements",
                      e.target.checked
                    )
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">
                  Cho phép huấn luyện viên liên hệ
                </h3>
                <p className="text-sm text-gray-600">
                  Huấn luyện viên có thể chủ động liên hệ tư vấn
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.privacy.allowCoachContact}
                  onChange={(e) =>
                    handleSettingChange(
                      "privacy",
                      "allowCoachContact",
                      e.target.checked
                    )
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
        {/* Preferences */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            ⚙️ Tùy chọn
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Ngôn ngữ</h3>
              <select
                value={settings.preferences.language}
                onChange={(e) =>
                  handleSettingChange("preferences", "language", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Giao diện</h3>
              <select
                value={settings.preferences.theme}
                onChange={(e) =>
                  handleSettingChange("preferences", "theme", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="light">Sáng</option>
                <option value="dark">Tối</option>
                <option value="auto">Tự động</option>
              </select>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Đơn vị tiền tệ</h3>
              <select
                value={settings.preferences.currency}
                onChange={(e) =>
                  handleSettingChange("preferences", "currency", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="VND">VND (₫)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Định dạng ngày</h3>
              <select
                value={settings.preferences.dateFormat}
                onChange={(e) =>
                  handleSettingChange(
                    "preferences",
                    "dateFormat",
                    e.target.value
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </div>
        {/* Security */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🔐 Bảo mật
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Đổi mật khẩu</h3>
                <p className="text-sm text-gray-600">
                  Cập nhật mật khẩu để bảo mật tài khoản
                </p>
              </div>
              <button
                onClick={() => setShowChangePassword(!showChangePassword)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {showChangePassword ? "Hủy" : "Đổi mật khẩu"}
              </button>
            </div>
            {showChangePassword && (
              <form
                onSubmit={handleChangePassword}
                className="border-t pt-4 space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mật khẩu hiện tại
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={changePasswordData.currentPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      passwordErrors.currentPassword
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {passwordErrors.currentPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {passwordErrors.currentPassword}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mật khẩu mới
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={changePasswordData.newPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      passwordErrors.newPassword
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {passwordErrors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {passwordErrors.newPassword}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Xác nhận mật khẩu mới
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={changePasswordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      passwordErrors.confirmPassword
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {passwordErrors.confirmPassword}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Cập nhật mật khẩu
                </button>
              </form>
            )}
          </div>
        </div>
        {/* Danger Zone */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border-red-200 border">
          <h2 className="text-xl font-semibold text-red-600 mb-4">
            ⚠️ Vùng nguy hiểm
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Xóa tài khoản</h3>
                <p className="text-sm text-gray-600">
                  Xóa vĩnh viễn tài khoản và toàn bộ dữ liệu. Hành động này
                  không thể hoàn tác!
                </p>
              </div>
              <button
                onClick={handleDeleteAccount}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Xóa tài khoản
              </button>
            </div>
          </div>
        </div>
        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              saving
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {saving ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang lưu...
              </div>
            ) : (
              "Lưu cài đặt"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
export default SettingsPage;
