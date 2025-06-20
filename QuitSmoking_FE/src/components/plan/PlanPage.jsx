import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../../config/config.js";
import { Link } from "react-router-dom";
const PlanPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [smokingStatus, setSmokingStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [formData, setFormData] = useState({
    reason: "",
    startDate: "",
    targetQuitDate: "",
    planType: "GRADUAL",
    dailyReductionGoal: "",
    milestones: [],
  });
  const [errors, setErrors] = useState({});
  const planTypes = [
    {
      id: "GRADUAL",
      name: "Giảm dần",
      description: "Giảm số lượng thuốc từ từ theo thời gian",
      icon: "📉",
      suitable: "Phù hợp với người hút nhiều, muốn thay đổi từ từ",
    },
    {
      id: "COLD_TURKEY",
      name: "Ngưng hoàn toàn",
      description: "Dừng hút thuốc ngay lập tức",
      icon: "🛑",
      suitable: "Phù hợp với người có ý chí mạnh mẽ",
    },
    {
      id: "NICOTINE_REPLACEMENT",
      name: "Thay thế nicotine",
      description: "Sử dụng kẹo cao su, miếng dán nicotine",
      icon: "🍬",
      suitable: "Phù hợp với người muốn giảm cơn thèm nicotine",
    },
  ];
  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
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
      // Fetch current plan
      try {
        const planResponse = await axios.get(
          `${config.API_BASE_URL}/api/quit-plans/current`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCurrentPlan(planResponse.data);
      } catch (planError) {
        // Nếu không có plan hiện tại, không cần xử lý lỗi
        console.log("Không có kế hoạch hiện tại");
      }
      // Fetch smoking status
      try {
        const statusResponse = await axios.get(
          `${config.API_BASE_URL}/api/smoking-status/current`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSmokingStatus(statusResponse.data);
      } catch (statusError) {
        console.log("Chưa có thông tin tình trạng hút thuốc");
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error khi user nhập
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };
  const handleMilestoneChange = (index, field, value) => {
    const newMilestones = [...formData.milestones];
    newMilestones[index] = {
      ...newMilestones[index],
      [field]: value,
    };
    setFormData((prev) => ({
      ...prev,
      milestones: newMilestones,
    }));
  };
  const addMilestone = () => {
    setFormData((prev) => ({
      ...prev,
      milestones: [
        ...prev.milestones,
        { date: "", description: "", targetCigarettes: "" },
      ],
    }));
  };
  const removeMilestone = (index) => {
    setFormData((prev) => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index),
    }));
  };
  const validateForm = () => {
    const newErrors = {};
    if (!formData.reason.trim()) {
      newErrors.reason = "Vui lòng nhập lý do cai thuốc";
    }
    if (!formData.startDate) {
      newErrors.startDate = "Vui lòng chọn ngày bắt đầu";
    }
    if (!formData.targetQuitDate) {
      newErrors.targetQuitDate = "Vui lòng chọn ngày dự kiến cai được thuốc";
    }
    if (formData.startDate && formData.targetQuitDate) {
      const startDate = new Date(formData.startDate);
      const targetDate = new Date(formData.targetQuitDate);

      if (targetDate <= startDate) {
        newErrors.targetQuitDate = "Ngày dự kiến phải sau ngày bắt đầu";
      }
    }
    if (formData.planType === "GRADUAL" && !formData.dailyReductionGoal) {
      newErrors.dailyReductionGoal = "Vui lòng nhập mục tiêu giảm hàng ngày";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const submitData = {
        ...formData,
        milestones: JSON.stringify(formData.milestones),
      };
      const response = await axios.post(
        `${config.API_BASE_URL}/api/quit-plans`,
        submitData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Tạo kế hoạch cai thuốc thành công!");
      setShowCreatePlan(false);
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Lỗi khi tạo kế hoạch:", error);
      alert("Có lỗi xảy ra khi tạo kế hoạch. Vui lòng thử lại!");
    }
  };
  const calculateDaysLeft = (targetDate) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  const calculateProgress = (plan) => {
    if (!plan) return 0;

    const startDate = new Date(plan.startDate);
    const targetDate = new Date(plan.targetQuitDate);
    const today = new Date();

    const totalDays =
      (targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const passedDays =
      (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

    return Math.min(Math.max((passedDays / totalDays) * 100, 0), 100);
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải kế hoạch...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Kế hoạch cai thuốc
          </h1>
          <p className="text-lg text-gray-600">
            Lập kế hoạch và theo dõi hành trình cai thuốc của bạn
          </p>
        </div>
        {/* Current Plan */}
        {currentPlan ? (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Kế hoạch hiện tại
              </h2>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  currentPlan.status === "ACTIVE"
                    ? "bg-green-100 text-green-800"
                    : currentPlan.status === "PLANNING"
                    ? "bg-blue-100 text-blue-800"
                    : currentPlan.status === "COMPLETED"
                    ? "bg-purple-100 text-purple-800"
                    : currentPlan.status === "PAUSED"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {currentPlan.status === "ACTIVE"
                  ? "Đang thực hiện"
                  : currentPlan.status === "PLANNING"
                  ? "Đang lập kế hoạch"
                  : currentPlan.status === "COMPLETED"
                  ? "Hoàn thành"
                  : currentPlan.status === "PAUSED"
                  ? "Tạm dừng"
                  : "Thất bại"}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-gray-900">Ngày bắt đầu</h3>
                <p className="text-2xl font-bold text-blue-600 mt-2">
                  {new Date(currentPlan.startDate).toLocaleDateString("vi-VN")}
                </p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-gray-900">Ngày dự kiến</h3>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  {new Date(currentPlan.targetQuitDate).toLocaleDateString(
                    "vi-VN"
                  )}
                </p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-gray-900">Còn lại</h3>
                <p className="text-2xl font-bold text-purple-600 mt-2">
                  {calculateDaysLeft(currentPlan.targetQuitDate)} ngày
                </p>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Tiến độ
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round(calculateProgress(currentPlan))}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${calculateProgress(currentPlan)}%` }}
                ></div>
              </div>
            </div>
            {/* Plan Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Lý do cai thuốc
                </h3>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {currentPlan.reason}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Phương pháp
                </h3>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="font-medium">
                    {planTypes.find((t) => t.id === currentPlan.planType)?.name}
                  </span>
                  {currentPlan.dailyReductionGoal && (
                    <p className="text-sm text-gray-600 mt-1">
                      Mục tiêu giảm: {currentPlan.dailyReductionGoal} điếu/ngày
                    </p>
                  )}
                </div>
              </div>
            </div>
            {/* Action Buttons */}
            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => navigate("/dashboard")}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Theo dõi tiến độ
              </button>
              <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                Chỉnh sửa kế hoạch
              </button>
            </div>
          </div>
        ) : (
          /* No Current Plan */
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
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
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Bạn chưa có kế hoạch cai thuốc
            </h2>
            <p className="text-gray-600 mb-6">
              Tạo kế hoạch cai thuốc để bắt đầu hành trình sống khỏe mạnh của
              bạn
            </p>
            <button
              onClick={() => setShowCreatePlan(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tạo kế hoạch mới
            </button>
          </div>
        )}
        {/* Smoking Status Warning */}
        {!smokingStatus && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <div className="flex">
              <svg
                className="w-5 h-5 text-yellow-400 mt-0.5 mr-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="text-yellow-800 font-medium">
                  Chưa có thông tin tình trạng hút thuốc
                </p>
                <p className="text-yellow-700 text-sm mt-1">
                  Vui lòng ghi nhận tình trạng hút thuốc hiện tại để tạo kế
                  hoạch phù hợp.
                </p>
                <Link
                  to="/quit-status"
                  className="text-yellow-800 underline text-sm mt-2 hover:text-yellow-900"
                >
                  Ghi nhận ngay →
                </Link>
              </div>
            </div>
          </div>
        )}
        {/* Create Plan Form */}
        {showCreatePlan && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Tạo kế hoạch cai thuốc mới
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lý do cai thuốc *
                </label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.reason ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Ví dụ: Vì sức khỏe, tiết kiệm tiền, gia đình..."
                />
                {errors.reason && (
                  <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
                )}
              </div>
              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày bắt đầu *
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split("T")[0]}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.startDate ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.startDate && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.startDate}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày dự kiến cai được thuốc *
                  </label>
                  <input
                    type="date"
                    name="targetQuitDate"
                    value={formData.targetQuitDate}
                    onChange={handleInputChange}
                    min={
                      formData.startDate ||
                      new Date().toISOString().split("T")[0]
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.targetQuitDate
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.targetQuitDate && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.targetQuitDate}
                    </p>
                  )}
                </div>
              </div>
              {/* Plan Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Phương pháp cai thuốc *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {planTypes.map((type) => (
                    <label
                      key={type.id}
                      className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
                        formData.planType === type.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name="planType"
                        value={type.id}
                        checked={formData.planType === type.id}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <div className="text-2xl mb-2">{type.icon}</div>
                        <h3 className="font-medium text-gray-900 mb-1">
                          {type.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {type.description}
                        </p>
                        <p className="text-xs text-gray-500">{type.suitable}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              {/* Daily Reduction Goal (for Gradual plan) */}
              {formData.planType === "GRADUAL" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mục tiêu giảm mỗi ngày (điếu) *
                  </label>
                  <input
                    type="number"
                    name="dailyReductionGoal"
                    value={formData.dailyReductionGoal}
                    onChange={handleInputChange}
                    min="1"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.dailyReductionGoal
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Ví dụ: 2"
                  />
                  {errors.dailyReductionGoal && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.dailyReductionGoal}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    Số điếu thuốc bạn sẽ cố gắng giảm mỗi ngày
                  </p>
                </div>
              )}
              {/* Milestones */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Các mốc quan trọng (tùy chọn)
                  </label>
                  <button
                    type="button"
                    onClick={addMilestone}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    + Thêm mốc
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.milestones.map((milestone, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                          type="date"
                          placeholder="Ngày"
                          value={milestone.date}
                          onChange={(e) =>
                            handleMilestoneChange(index, "date", e.target.value)
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <input
                          type="text"
                          placeholder="Mô tả mốc"
                          value={milestone.description}
                          onChange={(e) =>
                            handleMilestoneChange(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <div className="flex space-x-2">
                          <input
                            type="number"
                            placeholder="Mục tiêu (điếu)"
                            value={milestone.targetCigarettes}
                            onChange={(e) =>
                              handleMilestoneChange(
                                index,
                                "targetCigarettes",
                                e.target.value
                              )
                            }
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => removeMilestone(index)}
                            className="px-3 py-2 text-red-600 hover:text-red-800"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Tạo kế hoạch
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreatePlan(false)}
                  className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        )}
        {/* Tips Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            💡 Mẹo để có kế hoạch cai thuốc thành công
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700">
                  Đặt mục tiêu thực tế và có thể đạt được
                </span>
              </div>
              <div className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700">
                  Tìm hiểu những yếu tố kích thích bạn hút thuốc
                </span>
              </div>
              <div className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700">
                  Chuẩn bị các hoạt động thay thế
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700">
                  Tìm kiếm sự hỗ trợ từ gia đình và bạn bè
                </span>
              </div>
              <div className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700">
                  Ghi chép tiến trình và cảm xúc hàng ngày
                </span>
              </div>
              <div className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700">
                  Thưởng cho bản thân khi đạt được mốc quan trọng
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default PlanPage;
