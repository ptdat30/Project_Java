import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import apiService from "../../services/apiService";
import AchievementNotification from "./AchievementNotification";
import achievementNotificationService from "../../services/achievementNotificationService";

const Achievements = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [userAchievements, setUserAchievements] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newAchievement, setNewAchievement] = useState(null);
  const [userStats, setUserStats] = useState({
    daysSmokeFreeDays: 0,
    moneySaved: 0,
    cigarettesAvoided: 0,
    totalAchievements: 0,
  });

  const achievementCategories = {
    ALL: "Tất cả",
    DAYS_SMOKE_FREE: "Ngày không hút",
    MONEY_SAVED: "Tiết kiệm tiền",
    CIGARETTES_AVOIDED: "Tránh thuốc lá",
    MILESTONES: "Mốc quan trọng",
  };

  useEffect(() => {
    // Kiểm tra quyền truy cập
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Kiểm tra nếu user là Guest
    if (user && user.role === 'GUEST') {
      setLoading(false);
      return;
    }
    
    loadAchievements();
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    // Set up listener for new achievements
    const handleNewAchievement = (achievement) => {
      setNewAchievement(achievement);
    };

    achievementNotificationService.addListener(handleNewAchievement);

    // Cleanup listener on unmount
    return () => {
      achievementNotificationService.removeListener(handleNewAchievement);
    };
  }, []);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all achievements
      const allAchievements = await apiService.getAllAchievements();
      setAchievements(allAchievements);

      // Load user achievements
      const userAchievementsData = await apiService.getUserAchievements();
      setUserAchievements(userAchievementsData);

      // Load user stats
      const stats = await apiService.getAchievementStats();
      setUserStats({
        daysSmokeFreeDays: stats.daysSmokeFreeDays || 0,
        moneySaved: stats.moneySaved || 0,
        cigarettesAvoided: stats.cigarettesAvoided || 0,
        totalAchievements: userAchievementsData.length
      });

      // Check for new achievements from server (nếu chỉ để backend tự động cập nhật)
      await apiService.checkAchievements();

    } catch (err) {
      setError("Không thể tải dữ liệu huy hiệu. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const isAchievementEarned = (achievementId) => {
    return userAchievements.some((ua) => ua.achievementId === achievementId);
  };

  const isAchievementUnlockable = (achievement) => {
    // Nếu đã earn rồi thì không thể unlock
    if (isAchievementEarned(achievement.id)) {
      return false;
    }
    
    switch (achievement.criteriaType) {
      case "DAYS_SMOKE_FREE":
        return userStats.daysSmokeFreeDays >= achievement.criteriaValue;
      case "MONEY_SAVED":
        return userStats.moneySaved >= achievement.criteriaValue;
      case "CIGARETTES_AVOIDED":
        return userStats.cigarettesAvoided >= achievement.criteriaValue;
      default:
        return false;
    }
  };

  const getProgressPercentage = (achievement) => {
    let current = 0;
    switch (achievement.criteriaType) {
      case "DAYS_SMOKE_FREE":
        current = userStats.daysSmokeFreeDays;
        break;
      case "MONEY_SAVED":
        current = userStats.moneySaved;
        break;
      case "CIGARETTES_AVOIDED":
        current = userStats.cigarettesAvoided;
        break;
      default:
        return 0;
    }
    return Math.min((current / achievement.criteriaValue) * 100, 100);
  };

  // Sort achievements by priority: earned first, then high progress, then others
  const getSortedAchievements = (achievementsList) => {
    return achievementsList.sort((a, b) => {
      const aEarned = isAchievementEarned(a.id);
      const bEarned = isAchievementEarned(b.id);
      
      // Earned achievements first
      if (aEarned && !bEarned) return -1;
      if (!aEarned && bEarned) return 1;
      
      // If both earned or both not earned, sort by progress
      const aProgress = getProgressPercentage(a);
      const bProgress = getProgressPercentage(b);
      
      return bProgress - aProgress;
    });
  };

  const filteredAchievements = getSortedAchievements(
    filter === "ALL"
      ? achievements
      : achievements.filter(
          (achievement) => achievement.criteriaType === filter
        )
  );

  const getBadgeColorClass = (color, earned) => {
    if (!earned) return "bg-gray-100 text-gray-400 border-gray-200";

    const colors = {
      BRONZE: "bg-amber-100 text-amber-800 border-amber-300",
      SILVER: "bg-gray-100 text-gray-800 border-gray-300",
      GOLD: "bg-yellow-100 text-yellow-800 border-yellow-300",
      DIAMOND: "bg-blue-100 text-blue-800 border-blue-300",
      LEGENDARY: "bg-purple-100 text-purple-800 border-purple-300",
    };
    return colors[color] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      EASY: "text-green-600",
      MEDIUM: "text-yellow-600",
      HARD: "text-orange-600",
      EXPERT: "text-red-600",
      LEGENDARY: "text-purple-600",
    };
    return colors[difficulty] || "text-gray-600";
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatCriteria = (achievement) => {
    switch (achievement.criteriaType) {
      case "DAYS_SMOKE_FREE":
        return `${achievement.criteriaValue} ngày`;
      case "MONEY_SAVED":
        return formatCurrency(achievement.criteriaValue);
      case "CIGARETTES_AVOIDED":
        return `${achievement.criteriaValue} điếu`;
      default:
        return achievement.criteriaValue;
    }
  };

  const handleShareAchievement = async (achievementId) => {
    try {
      await apiService.shareAchievement(achievementId);
      
      // Update local state
      setUserAchievements(prev => 
        prev.map(ua => 
          ua.achievementId === achievementId
            ? { ...ua, isShared: true }
            : ua
        )
      );

      // Show success message
      alert("Đã chia sẻ thành tích với cộng đồng!");
    } catch (err) {
      alert("Không thể chia sẻ thành tích. Vui lòng thử lại sau.");
    }
  };

  const handleUnlockAchievement = async (achievementId) => {
    try {
      // Gọi API unlock và nhận về object thành tựu vừa unlock
      const unlocked = await apiService.unlockAchievement(achievementId);
      
      // Reload achievements để cập nhật danh sách
      await loadAchievements();
      // Hiển thị modal thông báo với thành tựu vừa unlock
      setNewAchievement(unlocked);
      // Không cần alert nữa vì đã có modal
    } catch (err) {
      let errorMessage = "Không thể mở khóa huy hiệu. Vui lòng thử lại sau.";
      if (err.response?.data) {
        const errorData = err.response.data;
        if (typeof errorData === 'string') {
          if (errorData.includes("already earned")) {
            errorMessage = "Bạn đã đạt được huy hiệu này rồi!";
          } else if (errorData.includes("does not meet the criteria")) {
            errorMessage = "Bạn chưa đủ điều kiện để mở khóa huy hiệu này.";
          } else if (errorData.includes("not found")) {
            errorMessage = "Không tìm thấy huy hiệu này.";
          } else {
            errorMessage = errorData;
          }
        }
      }
      alert(errorMessage);
    }
  };

  const handleRefreshStats = async () => {
    try {
      // Reload toàn bộ dữ liệu
      await loadAchievements();
      
    } catch (err) {
      alert('Có lỗi khi làm mới dữ liệu. Vui lòng thử lại.');
    }
  };

  // Kiểm tra nếu user là Guest
  if (user && user.role === 'GUEST') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-6">🏆</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Tính năng dành cho thành viên
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Huy hiệu thành tích là tính năng đặc biệt dành cho thành viên. 
              Hãy nâng cấp gói thành viên để trải nghiệm đầy đủ tính năng này!
            </p>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                🎯 Lợi ích khi nâng cấp:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">🏆</div>
                  <div>
                    <div className="font-medium text-gray-900">Huy hiệu thành tích</div>
                    <div className="text-sm text-gray-600">Theo dõi và chia sẻ thành tựu</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">📊</div>
                  <div>
                    <div className="font-medium text-gray-900">Thống kê chi tiết</div>
                    <div className="text-sm text-gray-600">Phân tích tiến trình cai thuốc</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">👥</div>
                  <div>
                    <div className="font-medium text-gray-900">Cộng đồng hỗ trợ</div>
                    <div className="text-sm text-gray-600">Kết nối với người cùng mục tiêu</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">🎁</div>
                  <div>
                    <div className="font-medium text-gray-900">Phần thưởng đặc biệt</div>
                    <div className="text-sm text-gray-600">Nhận quà khi đạt mốc quan trọng</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={() => navigate('/membership')}
                className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition duration-300 shadow-lg"
              >
                🚀 Nâng cấp ngay
              </button>
              <div>
                <button
                  onClick={() => navigate('/')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  ← Quay về trang chủ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải huy hiệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadAchievements}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              🏆 Huy hiệu thành tích
            </h1>
            <button
              onClick={handleRefreshStats}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              🔄 Làm mới
            </button>
          </div>
          <p className="text-gray-600 mb-6">
            Thể hiện thành tựu trong hành trình cai thuốc của bạn
          </p>

          {/* User Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {userStats.daysSmokeFreeDays}
              </div>
              <div className="text-sm text-blue-600">Ngày không hút</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(userStats.moneySaved)}
              </div>
              <div className="text-sm text-green-600">Tiền tiết kiệm</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {userStats.cigarettesAvoided}
              </div>
              <div className="text-sm text-red-600">Điếu tránh được</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {userStats.totalAchievements}
              </div>
              <div className="text-sm text-purple-600">Huy hiệu đạt được</div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="flex flex-wrap">
            {Object.entries(achievementCategories).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-6 py-3 font-medium border-b-2 ${
                  filter === key
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.map((achievement) => {
            const earned = isAchievementEarned(achievement.id);
            const unlockable = isAchievementUnlockable(achievement);
            const progress = getProgressPercentage(achievement);
            const userAchievement = userAchievements.find(
              ua => ua.achievementId === achievement.id
            );

            return (
              <div
                key={achievement.id}
                className={`bg-white rounded-lg shadow-sm p-6 border-2 ${
                  earned
                    ? "border-yellow-300 bg-gradient-to-br from-yellow-50 to-white"
                    : unlockable
                    ? "border-green-300 bg-gradient-to-br from-green-50 to-white"
                    : "border-gray-200"
                }`}
              >
                {/* Achievement Header */}
                <div className="text-center mb-4">
                  <div
                    className={`text-6xl mb-2 ${
                      earned ? "grayscale-0" : "grayscale filter opacity-50"
                    }`}
                  >
                    {achievement.iconUrl || "🏆"}
                  </div>
                  <h3
                    className={`text-lg font-bold ${
                      earned ? "text-gray-900" : "text-gray-500"
                    }`}
                  >
                    {achievement.name}
                  </h3>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium border-2 ${getBadgeColorClass(
                      achievement.badgeColor,
                      earned
                    )}`}
                  >
                    {achievement.badgeColor}
                  </span>
                </div>

                {/* Description */}
                <p
                  className={`text-sm text-center mb-4 ${
                    earned ? "text-gray-700" : "text-gray-500"
                  }`}
                >
                  {achievement.description}
                </p>

                {/* Criteria */}
                <div className="text-center mb-4">
                  <span className="text-sm text-gray-600">Yêu cầu: </span>
                  <span className="font-semibold text-gray-900">
                    {formatCriteria(achievement)}
                  </span>
                </div>

                {/* Progress Bar (if not earned) */}
                {!earned && achievement.criteriaType !== "MILESTONES" && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Tiến độ</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          unlockable ? "bg-green-500" : "bg-blue-500"
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Difficulty */}
                <div className="text-center mb-4">
                  <span className="text-xs text-gray-500">Độ khó: </span>
                  <span
                    className={`text-xs font-medium ${getDifficultyColor(
                      achievement.difficulty || "MEDIUM"
                    )}`}
                  >
                    {achievement.difficulty || "MEDIUM"}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="text-center space-y-2">
                  {earned ? (
                    <>
                      <div className="text-green-600 font-medium text-sm">
                        ✅ Đã đạt được
                        {userAchievement?.earnedDate && (
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(userAchievement.earnedDate).toLocaleDateString('vi-VN')}
                          </div>
                        )}
                      </div>
                      {userAchievement && !userAchievement.isShared && (
                        <button
                          onClick={() => handleShareAchievement(achievement.id)}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                        >
                          📤 Chia sẻ thành tích
                        </button>
                      )}
                      {userAchievement?.isShared && (
                        <div className="text-blue-600 font-medium text-sm">
                          📤 Đã chia sẻ
                        </div>
                      )}
                    </>
                  ) : unlockable ? (
                    <>
                      <div className="text-green-600 font-medium text-sm">
                        🎯 Sẵn sàng mở khóa!
                      </div>
                      <button
                        onClick={() => handleUnlockAchievement(achievement.id)}
                        className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm"
                      >
                        🔓 Mở khóa huy hiệu
                      </button>
                    </>
                  ) : (
                    <div className="text-gray-500 text-sm">
                      🔒 Chưa đạt được
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredAchievements.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Chưa có huy hiệu nào
            </h3>
            <p className="text-gray-600">
              Hãy tiếp tục hành trình cai thuốc để nhận được huy hiệu đầu tiên!
            </p>
          </div>
        )}
      </div>

      {/* Achievement Notification */}
      <AchievementNotification 
        achievement={newAchievement} 
        onClose={() => setNewAchievement(null)} 
      />
    </div>
  );
};

export default Achievements;
