import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const MembershipPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [currentPlan, setCurrentPlan] = useState("FREE");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [processing, setProcessing] = useState(false);

  const membershipPlans = [
    {
      id: "FREE",
      name: "Miễn Phí",
      price: 0,
      originalPrice: 0,
      duration: "Vĩnh viễn",
      features: [
        "✅ Ghi nhận tình trạng hút thuốc cơ bản",
        "✅ Tạo kế hoạch cai thuốc đơn giản", 
        "✅ Thống kê cơ bản",
        "✅ Truy cập cộng đồng hạn chế",
        "❌ Tư vấn chuyên gia",
        "❌ Báo cáo chi tiết"
      ],
      color: "border-gray-200 bg-gray-50",
      buttonColor: "bg-gray-500 hover:bg-gray-600",
      textColor: "text-gray-600",
      popular: false,
      badge: null
    },
    {
      id: "BASIC", 
      name: "Cơ Bản",
      price: 99000,
      originalPrice: 149000,
      duration: "1 tháng",
      features: [
        "✅ Tất cả tính năng gói miễn phí",
        "✅ Kế hoạch cai thuốc nâng cao",
        "✅ Thống kê và báo cáo chi tiết",
        "✅ Thông báo động viên thông minh",
        "✅ Truy cập đầy đủ cộng đồng",
        "✅ Huy hiệu thành tích",
        "✅ Tư vấn chat cơ bản"
      ],
      color: "border-blue-200 bg-blue-50",
      buttonColor: "bg-blue-600 hover:bg-blue-700",
      textColor: "text-blue-600",
      popular: false,
      badge: "TIẾT KIỆM 33%"
    },
    {
      id: "PREMIUM",
      name: "Cao Cấp", 
      price: 249000,
      originalPrice: 399000,
      duration: "3 tháng",
      features: [
        "✅ Tất cả tính năng gói cơ bản",
        "✅ Tư vấn 1:1 với chuyên gia",
        "✅ Kế hoạch cá nhân hóa cao cấp",
        "✅ Phân tích tâm lý chuyên sâu",
        "✅ Ưu tiên hỗ trợ 24/7",
        "✅ Truy cập nội dung độc quyền",
        "✅ Chương trình coaching riêng",
        "✅ Báo cáo sức khỏe chi tiết"
      ],
      color: "border-green-300 bg-gradient-to-br from-green-50 to-green-100",
      buttonColor: "bg-green-600 hover:bg-green-700",
      textColor: "text-green-600",
      popular: true,
      badge: "PHỔ BIẾN NHẤT"
    },
    {
      id: "VIP",
      name: "VIP",
      price: 599000,
      originalPrice: 999000,
      duration: "1 năm",
      features: [
        "✅ Tất cả tính năng gói cao cấp",
        "✅ Mentor cá nhân chuyên nghiệp",
        "✅ Chương trình detox toàn diện",
        "✅ Khám sức khỏe định kỳ miễn phí",
        "✅ Dinh dưỡng và thể dục cá nhân hóa",
        "✅ Cộng đồng VIP độc quyền",
        "✅ Sự kiện offline premium",
        "✅ Bảo hành thành công 100%"
      ],
      color: "border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50",
      buttonColor: "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
      textColor: "text-purple-600",
      popular: false,
      badge: "TIẾT KIỆM 40%"
    }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleSelectPlan = (plan) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (plan.id === currentPlan) {
      return; // Already on this plan
    }
    
    setSelectedPlan(plan);
    if (plan.price === 0) {
      // Free plan - activate immediately
      handleUpgrade(plan);
    } else {
      setShowPaymentModal(true);
    }
  };

  const handleUpgrade = async (plan) => {
    setProcessing(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setCurrentPlan(plan.id);
      setShowPaymentModal(false);
      
      // Show success message
      alert(`Chúc mừng! Bạn đã nâng cấp thành công lên gói ${plan.name}`);
      
    } catch (error) {
      alert('Có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
            💎 Chọn Gói Thành Viên
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Nâng cao hành trình cai nghiện thuốc lá của bạn với các gói dịch vụ được thiết kế đặc biệt. 
            Từ cơ bản đến VIP, chúng tôi có giải pháp phù hợp cho mọi nhu cầu.
          </p>
          
          {isAuthenticated && (
            <div className="mt-8 p-4 bg-white rounded-lg shadow-md inline-block">
              <p className="text-gray-600">Gói hiện tại của bạn: 
                <span className="font-bold text-green-600 ml-2">
                  {membershipPlans.find(p => p.id === currentPlan)?.name}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {membershipPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl shadow-lg ${plan.color} border-2 transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                plan.popular ? 'transform scale-105 border-green-400' : ''
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-green-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                    ⭐ {plan.badge}
                  </span>
                </div>
              )}

              {plan.badge && !plan.popular && (
                <div className="absolute -top-3 -right-3">
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="p-8">
                {/* Plan Name */}
                <h3 className={`text-2xl font-bold ${plan.textColor} mb-2`}>
                  {plan.name}
                </h3>

                {/* Price */}
                <div className="mb-6">
                  {plan.price === 0 ? (
                    <div className="text-3xl font-bold text-gray-600">Miễn Phí</div>
                  ) : (
                    <div>
                      <div className="flex items-baseline">
                        <span className="text-3xl font-bold text-gray-800">
                          {formatCurrency(plan.price)}
                        </span>
                        <span className="text-gray-500 ml-2">/{plan.duration}</span>
                      </div>
                      {plan.originalPrice > plan.price && (
                        <div className="text-lg text-gray-400 line-through">
                          {formatCurrency(plan.originalPrice)}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <span className="text-sm text-gray-700 leading-relaxed">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={plan.id === currentPlan}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 shadow-lg ${
                    plan.id === currentPlan
                      ? 'bg-gray-400 cursor-not-allowed'
                      : plan.buttonColor
                  }`}
                >
                  {plan.id === currentPlan ? '✅ Đang Sử Dụng' : 
                   plan.price === 0 ? 'Sử Dụng Miễn Phí' : 'Nâng Cấp Ngay'}
                </button>

                {plan.id === currentPlan && (
                  <p className="text-center text-sm text-gray-500 mt-3">
                    Gói hiện tại của bạn
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Features Comparison */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            🔍 So Sánh Chi Tiết Các Gói
          </h2>
          
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-green-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left">Tính Năng</th>
                    <th className="px-6 py-4 text-center">Miễn Phí</th>
                    <th className="px-6 py-4 text-center">Cơ Bản</th>
                    <th className="px-6 py-4 text-center">Cao Cấp</th>
                    <th className="px-6 py-4 text-center">VIP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {[
                    ['Theo dõi tiến trình cơ bản', '✅', '✅', '✅', '✅'],
                    ['Kế hoạch cai thuốc nâng cao', '❌', '✅', '✅', '✅'],
                    ['Tư vấn chuyên gia', '❌', 'Chat', '1:1', 'Mentor cá nhân'],
                    ['Báo cáo chi tiết', '❌', '✅', '✅', '✅'],
                    ['Hỗ trợ 24/7', '❌', '❌', '✅', '✅'],
                    ['Khám sức khỏe', '❌', '❌', '❌', '✅'],
                    ['Cộng đồng VIP', '❌', '❌', '❌', '✅']
                  ].map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-800">{row[0]}</td>
                      <td className="px-6 py-4 text-center">{row[1]}</td>
                      <td className="px-6 py-4 text-center">{row[2]}</td>
                      <td className="px-6 py-4 text-center">{row[3]}</td>
                      <td className="px-6 py-4 text-center">{row[4]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            ❓ Câu Hỏi Thường Gặp
          </h2>
          
          <div className="max-w-4xl mx-auto space-y-6">
            {[
              {
                q: "Tôi có thể thay đổi gói membership bất cứ lúc nào không?",
                a: "Có, bạn có thể nâng cấp hoặc hạ cấp gói membership bất cứ lúc nào. Số tiền còn lại sẽ được tính theo tỷ lệ."
              },
              {
                q: "Gói VIP có đảm bảo thành công 100% không?",
                a: "Chúng tôi cam kết hỗ trợ tối đa với gói VIP. Nếu không đạt mục tiêu sau 6 tháng, bạn sẽ được hoàn tiền hoặc gia hạn miễn phí."
              },
              {
                q: "Tôi có thể hủy subscription không?",
                a: "Có, bạn có thể hủy bất cứ lúc nào từ trang cài đặt. Dịch vụ sẽ tiếp tục cho đến hết chu kỳ đã thanh toán."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-bold text-gray-800 mb-3">{faq.q}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              Thanh Toán Gói {selectedPlan.name}
            </h3>
            
            <div className="mb-6">
              <div className="text-lg">
                <span className="text-gray-600">Tổng tiền: </span>
                <span className="font-bold text-green-600 text-xl">
                  {formatCurrency(selectedPlan.price)}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                Chu kỳ: {selectedPlan.duration}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Phương thức thanh toán
              </label>
              <div className="space-y-3">
                {[
                  { id: 'credit_card', label: '💳 Thẻ tín dụng/ghi nợ' },
                  { id: 'momo', label: '📱 MoMo' },
                  { id: 'banking', label: '🏦 Chuyển khoản ngân hàng' }
                ].map((method) => (
                  <label key={method.id} className="flex items-center">
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    {method.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition duration-300"
                disabled={processing}
              >
                Hủy
              </button>
              <button
                onClick={() => handleUpgrade(selectedPlan)}
                disabled={processing}
                className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition duration-300 disabled:opacity-50"
              >
                {processing ? 'Đang xử lý...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembershipPage;
