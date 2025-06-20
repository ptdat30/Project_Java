import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../../config/config.js";
const MembershipPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);
  const membershipPlans = [
    {
      id: "FREE",
      name: "Miễn phí",
      price: 0,
      duration: "Vĩnh viễn",
      features: [
        "Ghi nhận tình trạng hút thuốc cơ bản",
        "Tạo kế hoạch cai thuốc đơn giản",
        "Thống kê cơ bản",
        "Truy cập community hạn chế",
      ],
      color: "border-gray-300",
      buttonColor: "bg-gray-500 hover:bg-gray-600",
      popular: false,
    },
    {
      id: "BASIC",
      name: "Cơ bản",
      price: 99000,
      duration: "1 tháng",
      features: [
        "Tất cả tính năng gói miễn phí",
        "Kế hoạch cai thuốc nâng cao",
        "Thống kê chi tiết",
        "Nhận thông báo động viên",
        "Truy cập đầy đủ community",
        "Huy hiệu thành tích",
      ],
      color: "border-blue-300",
      buttonColor: "bg-blue-600 hover:bg-blue-700",
      popular: false,
    },
    {
      id: "PREMIUM",
      name: "Cao cấp",
      price: 249000,
      duration: "3 tháng",
      features: [
        "Tất cả tính năng gói cơ bản",
        "Tư vấn với huấn luyện viên",
        "Kế hoạch cá nhân hóa",
        "Báo cáo sức khỏe chi tiết",
        "Ưu tiên hỗ trợ khách hàng",
        "Tính năng nhắc nhở thông minh",
      ],
      color: "border-yellow-400",
      buttonColor: "bg-yellow-500 hover:bg-yellow-600",
      popular: true,
    },
    {
      id: "VIP",
      name: "VIP",
      price: 799000,
      duration: "1 năm",
      features: [
        "Tất cả tính năng gói cao cấp",
        "Tư vấn 1-1 với chuyên gia",
        "Chương trình cai thuốc cá nhân",
        "Theo dõi sức khỏe toàn diện",
        "Ưu tiên cao nhất trong hỗ trợ",
        "Truy cập sớm tính năng mới",
        "Quà tặng và voucher độc quyền",
      ],
      color: "border-purple-400",
      buttonColor: "bg-purple-600 hover:bg-purple-700",
      popular: false,
    },
  ];
  useEffect(() => {
    fetchUserProfile();
  }, []);
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const response = await axios.get(
        `${config.API_BASE_URL}${config.endpoints.userProfile}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUser(response.data);
    } catch (error) {
      console.error("Lỗi khi tải thông tin người dùng:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };
  const handleSelectPlan = (plan) => {
    if (plan.id === user?.membershipPlan) {
      return; // Không cho phép chọn gói hiện tại
    }
    setSelectedPlan(plan);
  };
  const handlePayment = async () => {
    if (!selectedPlan || !paymentMethod) {
      alert("Vui lòng chọn gói và phương thức thanh toán");
      return;
    }
    setProcessingPayment(true);
    try {
      const token = localStorage.getItem("token");
      const paymentData = {
        membershipPlan: selectedPlan.id,
        paymentMethod: paymentMethod,
        amount: selectedPlan.price,
      };
      const response = await axios.post(
        `${config.API_BASE_URL}/api/membership/upgrade`,
        paymentData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success) {
        alert("Thanh toán thành công! Gói thành viên đã được nâng cấp.");
        setSelectedPlan(null);
        setPaymentMethod("");
        fetchUserProfile(); // Refresh user data
      } else {
        alert("Thanh toán thất bại. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Lỗi thanh toán:", error);
      alert("Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.");
    } finally {
      setProcessingPayment(false);
    }
  };
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Chọn gói thành viên phù hợp
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Nâng cấp trải nghiệm cai thuốc của bạn với các tính năng cao cấp và
            hỗ trợ chuyên nghiệp
          </p>
        </div>
        {/* Current Plan */}
        {user?.membershipPlan && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Gói hiện tại
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <span
                  className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    user.membershipPlan === "VIP"
                      ? "bg-purple-100 text-purple-800"
                      : user.membershipPlan === "PREMIUM"
                      ? "bg-yellow-100 text-yellow-800"
                      : user.membershipPlan === "BASIC"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {membershipPlans.find((p) => p.id === user.membershipPlan)
                    ?.name || user.membershipPlan}
                </span>
                {user.membershipEndDate && (
                  <p className="text-gray-600 mt-1">
                    Hết hạn:{" "}
                    {new Date(user.membershipEndDate).toLocaleDateString(
                      "vi-VN"
                    )}
                  </p>
                )}
              </div>
              <button
                onClick={() => navigate("/profile")}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Xem chi tiết →
              </button>
            </div>
          </div>
        )}
        {/* Membership Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {membershipPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-lg shadow-sm border-2 transition-all duration-200 ${
                plan.color
              } ${
                selectedPlan?.id === plan.id
                  ? "border-blue-500 shadow-lg transform scale-105"
                  : ""
              } ${
                plan.id === user?.membershipPlan
                  ? "opacity-60"
                  : "hover:shadow-lg cursor-pointer"
              }`}
              onClick={() => handleSelectPlan(plan)}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-yellow-400 text-yellow-900 px-3 py-1 text-xs font-bold rounded-full">
                    PHỔ BIẾN NHẤT
                  </span>
                </div>
              )}

              {plan.id === user?.membershipPlan && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-green-500 text-white px-3 py-1 text-xs font-bold rounded-full">
                    ĐANG SỬ DỤNG
                  </span>
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900">
                    {plan.price === 0 ? "Miễn phí" : formatPrice(plan.price)}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-gray-600 ml-2">
                      / {plan.duration}
                    </span>
                  )}
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg
                        className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    plan.id === user?.membershipPlan
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : selectedPlan?.id === plan.id
                      ? "bg-blue-600 text-white"
                      : plan.buttonColor + " text-white"
                  }`}
                  disabled={plan.id === user?.membershipPlan}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectPlan(plan);
                  }}
                >
                  {plan.id === user?.membershipPlan
                    ? "Đang sử dụng"
                    : selectedPlan?.id === plan.id
                    ? "Đã chọn"
                    : plan.price === 0
                    ? "Sử dụng miễn phí"
                    : "Chọn gói này"}
                </button>
              </div>
            </div>
          ))}
        </div>
        {/* Payment Section */}
        {selectedPlan && selectedPlan.price > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Thanh toán
            </h2>

            {/* Selected Plan Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Gói đã chọn</h3>
              <div className="flex justify-between items-center">
                <span>
                  {selectedPlan.name} - {selectedPlan.duration}
                </span>
                <span className="font-bold text-lg">
                  {formatPrice(selectedPlan.price)}
                </span>
              </div>
            </div>
            {/* Payment Methods */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Phương thức thanh toán
              </h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="MOMO"
                    checked={paymentMethod === "MOMO"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex items-center">
                    <img
                      src="/api/placeholder/24/24"
                      alt="MoMo"
                      className="w-6 h-6 mr-2"
                    />
                    <span>Ví MoMo</span>
                  </div>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="ZALOPAY"
                    checked={paymentMethod === "ZALOPAY"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex items-center">
                    <img
                      src="/api/placeholder/24/24"
                      alt="ZaloPay"
                      className="w-6 h-6 mr-2"
                    />
                    <span>ZaloPay</span>
                  </div>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="BANK_TRANSFER"
                    checked={paymentMethod === "BANK_TRANSFER"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex items-center">
                    <svg
                      className="w-6 h-6 mr-2 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                      <path
                        fillRule="evenodd"
                        d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                      />
                    </svg>
                    <span>Chuyển khoản ngân hàng</span>
                  </div>
                </label>
              </div>
            </div>
            {/* Payment Button */}
            <div className="flex space-x-4">
              <button
                onClick={handlePayment}
                disabled={!paymentMethod || processingPayment}
                className={`flex-1 py-3 px-6 rounded-lg font-medium ${
                  !paymentMethod || processingPayment
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                } transition-colors`}
              >
                {processingPayment ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang xử lý...
                  </div>
                ) : (
                  `Thanh toán ${formatPrice(selectedPlan.price)}`
                )}
              </button>
              <button
                onClick={() => {
                  setSelectedPlan(null);
                  setPaymentMethod("");
                }}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
            </div>
          </div>
        )}
        {/* Free Plan Selection */}
        {selectedPlan && selectedPlan.price === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Xác nhận chọn gói miễn phí
            </h2>
            <p className="text-gray-600 mb-6">
              Bạn đang chọn gói miễn phí. Bạn có thể nâng cấp lên các gói cao
              hơn bất cứ lúc nào.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => handlePayment()}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Xác nhận chọn gói miễn phí
              </button>
              <button
                onClick={() => setSelectedPlan(null)}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default MembershipPage;
