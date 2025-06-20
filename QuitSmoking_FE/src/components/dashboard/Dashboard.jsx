import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // Mock data for demo
    setTimeout(() => {
      setStats({
        quitDate: "2024-01-15",
        daysWithoutSmoking: 157,
        moneySaved: 3140000,
        cigarettesNotSmoked: 3140,
        healthImprovements: [
          { milestone: "20 phút", description: "Nhịp tim và huyết áp trở về bình thường", achieved: true },
          { milestone: "12 giờ", description: "Nồng độ CO trong máu giảm về mức bình thường", achieved: true },
          { milestone: "2 tuần", description: "Tuần hoàn máu cải thiện và phổi hoạt động tốt hơn", achieved: true },
          { milestone: "1 tháng", description: "Cơn ho và khó thở giảm đáng kể", achieved: true },
          { milestone: "1 năm", description: "Nguy cơ bệnh tim giảm 50%", achieved: false },
          { milestone: "5 năm", description: "Nguy cơ đột quỵ giảm về mức như người không hút thuốc", achieved: false }
        ],
        weeklyProgress: [
          { day: "T2", mood: 8, cravings: 2, exercise: true },
          { day: "T3", mood: 7, cravings: 3, exercise: false },
          { day: "T4", mood: 9, cravings: 1, exercise: true },
          { day: "T5", mood: 8, cravings: 2, exercise: true },
          { day: "T6", mood: 6, cravings: 4, exercise: false },
          { day: "T7", mood: 9, cravings: 1, exercise: true },
          { day: "CN", mood: 10, cravings: 0, exercise: true }
        ],
        recentAchievements: [
          { title: "100 Ngày Sạch", icon: "🎯", date: "Hôm qua", color: "bg-green-100 text-green-700" },
          { title: "Tiết Kiệm 3 Triệu", icon: "💰", date: "3 ngày trước", color: "bg-yellow-100 text-yellow-700" },
          { title: "Tuần Hoàn Tốt", icon: "❤️", date: "1 tuần trước", color: "bg-red-100 text-red-700" }
        ],
        todayStatus: {
          mood: 8,
          cravings: 2,
          exercise: true,
          water: 6,
          sleep: 7
        }
      });
      setLoading(false);
    }, 1000);
  }, [isAuthenticated, navigate]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const calculateTimeSince = (quitDate) => {
    const quit = new Date(quitDate);
    const now = new Date();
    const diffTime = Math.abs(now - quit);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    const days = diffDays % 30;
    
    if (years > 0) return `${years} năm, ${months} tháng, ${days} ngày`;
    if (months > 0) return `${months} tháng, ${days} ngày`;
    return `${diffDays} ngày`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tải dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="container mx-auto px-6">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
            Chào mừng trở lại, {user?.firstName || user?.username || "Bạn"}! 👋
          </h1>
          <p className="text-xl text-gray-600">
            Bạn đã không hút thuốc được {calculateTimeSince(stats.quitDate)}. Thật tuyệt vời! 🎉
          </p>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ngày không hút thuốc</p>
                <p className="text-3xl font-bold text-green-600">{stats.daysWithoutSmoking}</p>
              </div>
              <div className="text-4xl">🗓️</div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tiền tiết kiệm</p>
                <p className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.moneySaved)}</p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Điếu thuốc tránh được</p>
                <p className="text-3xl font-bold text-blue-600">{stats.cigarettesNotSmoked.toLocaleString()}</p>
              </div>
              <div className="text-4xl">🚭</div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cảm giác hôm nay</p>
                <p className="text-3xl font-bold text-purple-600">{stats.todayStatus.mood}/10</p>
              </div>
              <div className="text-4xl">😊</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Health Progress */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">🏥 Cải thiện sức khỏe</h2>
              <div className="space-y-4">
                {stats.healthImprovements.map((improvement, index) => (
                  <div key={index} className={`p-4 rounded-lg border-l-4 ${
                    improvement.achieved ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-300'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-800">{improvement.milestone}</h3>
                        <p className="text-gray-600">{improvement.description}</p>
                      </div>
                      <div className="text-2xl">
                        {improvement.achieved ? '✅' : '⏳'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Progress Chart */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Tiến trình tuần này</h2>
              <div className="space-y-6">
                {/* Mood Chart */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Tâm trạng (1-10)</h3>
                  <div className="flex items-end space-x-2 h-40">
                    {stats.weeklyProgress.map((day, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div 
                          className="bg-blue-500 rounded-t-lg w-full transition-all duration-500 hover:bg-blue-600"
                          style={{ height: `${(day.mood / 10) * 100}%` }}
                        ></div>
                        <span className="text-sm text-gray-600 mt-2">{day.day}</span>
                        <span className="text-xs text-gray-500">{day.mood}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cravings Chart */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Mức độ thèm thuốc (0-5)</h3>
                  <div className="flex items-end space-x-2 h-32">
                    {stats.weeklyProgress.map((day, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div 
                          className="bg-red-500 rounded-t-lg w-full transition-all duration-500 hover:bg-red-600"
                          style={{ height: `${(day.cravings / 5) * 100}%` }}
                        ></div>
                        <span className="text-sm text-gray-600 mt-2">{day.day}</span>
                        <span className="text-xs text-gray-500">{day.cravings}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today Status */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">📋 Trạng thái hôm nay</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Tâm trạng</span>
                  <div className="flex items-center space-x-1">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className={`w-3 h-3 rounded-full ${
                        i < stats.todayStatus.mood ? 'bg-blue-500' : 'bg-gray-200'
                      }`}></div>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Mức thèm thuốc</span>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`w-3 h-3 rounded-full ${
                        i < stats.todayStatus.cravings ? 'bg-red-500' : 'bg-gray-200'
                      }`}></div>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Tập thể dục</span>
                  <span className="text-2xl">{stats.todayStatus.exercise ? '✅' : '❌'}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Nước uống (ly)</span>
                  <span className="font-bold text-blue-600">{stats.todayStatus.water}/8</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Chất lượng ngủ</span>
                  <span className="font-bold text-purple-600">{stats.todayStatus.sleep}/10</span>
                </div>
              </div>
              
              <Link 
                to="/daily-progress"
                className="w-full mt-4 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition duration-300 text-center block"
              >
                Cập nhật tiến trình
              </Link>
            </div>

            {/* Recent Achievements */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">🏆 Thành tích gần đây</h3>
              <div className="space-y-3">
                {stats.recentAchievements.map((achievement, index) => (
                  <div key={index} className={`p-3 rounded-lg ${achievement.color}`}>
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{achievement.icon}</span>
                      <div>
                        <h4 className="font-semibold">{achievement.title}</h4>
                        <p className="text-sm opacity-75">{achievement.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <Link 
                to="/achievements"
                className="w-full mt-4 bg-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-700 transition duration-300 text-center block"
              >
                Xem tất cả
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">⚡ Hành động nhanh</h3>
              <div className="space-y-3">
                <Link 
                  to="/plan"
                  className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition duration-300"
                >
                  <span className="text-2xl mr-3">📋</span>
                  <span className="font-medium text-blue-700">Xem kế hoạch</span>
                </Link>
                
                <Link 
                  to="/community"
                  className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition duration-300"
                >
                  <span className="text-2xl mr-3">👥</span>
                  <span className="font-medium text-green-700">Cộng đồng</span>
                </Link>
                
                <Link 
                  to="/coach-consultation"
                  className="flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition duration-300"
                >
                  <span className="text-2xl mr-3">👨‍⚕️</span>
                  <span className="font-medium text-purple-700">Tư vấn coach</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
