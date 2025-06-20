import React, { useState, useEffect } from "react";
const Achievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [userAchievements, setUserAchievements] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [userStats, setUserStats] = useState({
    daysSmokeFreeDays: 25,
    moneySaved: 750000,
    cigarettesAvoided: 500,
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
    // Mock data - all achievements
    const allAchievements = [
      // Days Smoke Free
      {
        id: "1",
        name: "First Day Champion",
        description: "Hoàn thành ngày đầu tiên không hút thuốc",
        icon: "🥉",
        criteriaType: "DAYS_SMOKE_FREE",
        criteriaValue: 1,
        badgeColor: "BRONZE",
        difficulty: "EASY",
      },
      {
        id: "2",
        name: "One Week Hero",
        description: "Không hút thuốc trong 1 tuần",
        icon: "🥈",
        criteriaType: "DAYS_SMOKE_FREE",
        criteriaValue: 7,
        badgeColor: "SILVER",
        difficulty: "MEDIUM",
      },
      {
        id: "3",
        name: "One Month Master",
        description: "Không hút thuốc trong 1 tháng",
        icon: "🥇",
        criteriaType: "DAYS_SMOKE_FREE",
        criteriaValue: 30,
        badgeColor: "GOLD",
        difficulty: "HARD",
      },
      {
        id: "4",
        name: "Three Month Legend",
        description: "Không hút thuốc trong 3 tháng",
        icon: "💎",
        criteriaType: "DAYS_SMOKE_FREE",
        criteriaValue: 90,
        badgeColor: "DIAMOND",
        difficulty: "EXPERT",
      },
      {
        id: "5",
        name: "One Year God",
        description: "Không hút thuốc trong 1 năm",
        icon: "👑",
        criteriaType: "DAYS_SMOKE_FREE",
        criteriaValue: 365,
        badgeColor: "LEGENDARY",
        difficulty: "LEGENDARY",
      },
      // Money Saved
      {
        id: "6",
        name: "Money Saver 100K",
        description: "Tiết kiệm được 100,000 VND",
        icon: "💰",
        criteriaType: "MONEY_SAVED",
        criteriaValue: 100000,
        badgeColor: "BRONZE",
        difficulty: "EASY",
      },
      {
        id: "7",
        name: "Money Saver 500K",
        description: "Tiết kiệm được 500,000 VND",
        icon: "💎",
        criteriaType: "MONEY_SAVED",
        criteriaValue: 500000,
        badgeColor: "SILVER",
        difficulty: "MEDIUM",
      },
      {
        id: "8",
        name: "Money Saver 1M",
        description: "Tiết kiệm được 1,000,000 VND",
        icon: "🏆",
        criteriaType: "MONEY_SAVED",
        criteriaValue: 1000000,
        badgeColor: "GOLD",
        difficulty: "HARD",
      },
      // Cigarettes Avoided
      {
        id: "9",
        name: "Cigarette Avoider 100",
        description: "Tránh được 100 điếu thuốc",
        icon: "🚭",
        criteriaType: "CIGARETTES_AVOIDED",
        criteriaValue: 100,
        badgeColor: "BRONZE",
        difficulty: "EASY",
      },
      {
        id: "10",
        name: "Cigarette Avoider 500",
        description: "Tránh được 500 điếu thuốc",
        icon: "🛡️",
        criteriaType: "CIGARETTES_AVOIDED",
        criteriaValue: 500,
        badgeColor: "SILVER",
        difficulty: "MEDIUM",
      },
      {
        id: "11",
        name: "Cigarette Avoider 1000",
        description: "Tránh được 1000 điếu thuốc",
        icon: "⭐",
        criteriaType: "CIGARETTES_AVOIDED",
        criteriaValue: 1000,
        badgeColor: "GOLD",
        difficulty: "HARD",
      },
      // Milestones
      {
        id: "12",
        name: "First Post Sharer",
        description: "Chia sẻ bài viết đầu tiên trong cộng đồng",
        icon: "📝",
        criteriaType: "MILESTONES",
        criteriaValue: 1,
        badgeColor: "BRONZE",
        difficulty: "EASY",
      },
      {
        id: "13",
        name: "Community Helper",
        description: "Giúp đỡ 10 thành viên trong cộng đồng",
        icon: "🤝",
        criteriaType: "MILESTONES",
        criteriaValue: 10,
        badgeColor: "SILVER",
        difficulty: "MEDIUM",
      },
      {
        id: "14",
        name: "Motivation Master",
        description: "Nhận 100 lượt thích từ cộng đồng",
        icon: "❤️",
        criteriaType: "MILESTONES",
        criteriaValue: 100,
        badgeColor: "GOLD",
        difficulty: "HARD",
      },
    ];
    setAchievements(allAchievements);
    // Mock user achievements (earned achievements)
    const earned = [
      { achievementId: "1", earnedDate: "2024-01-01", isShared: true },
      { achievementId: "2", earnedDate: "2024-01-07", isShared: true },
      { achievementId: "6", earnedDate: "2024-01-10", isShared: false },
      { achievementId: "9", earnedDate: "2024-01-15", isShared: true },
      { achievementId: "7", earnedDate: "2024-01-20", isShared: false },
      { achievementId: "10", earnedDate: "2024-01-25", isShared: true },
      { achievementId: "12", earnedDate: "2024-01-05", isShared: true },
    ];
    setUserAchievements(earned);
    setUserStats((prev) => ({ ...prev, totalAchievements: earned.length }));
  }, []);
  const isAchievementEarned = (achievementId) => {
    return userAchievements.some((ua) => ua.achievementId === achievementId);
  };
  const isAchievementUnlockable = (achievement) => {
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
  const filteredAchievements =
    filter === "ALL"
      ? achievements
      : achievements.filter(
          (achievement) => achievement.criteriaType === filter
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
  const handleShareAchievement = (achievementId) => {
    // Simulate sharing to community
    alert("Đã chia sẻ thành tích với cộng đồng!");
  };
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🏆 Huy hiệu thành tích
          </h1>
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
                    {achievement.icon}
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
                      achievement.difficulty
                    )}`}
                  >
                    {achievement.difficulty}
                  </span>
                </div>
                {/* Action Buttons */}
                <div className="text-center">
                  {earned ? (
                    <div className="space-y-2">
                      <div className="text-green-600 font-medium text-sm">
                        ✅ Đã đạt được
                      </div>
                      <button
                        onClick={() => handleShareAchievement(achievement.id)}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                      >
                        📤 Chia sẻ thành tích
                      </button>
                    </div>
                  ) : unlockable ? (
                    <div className="text-green-600 font-medium text-sm">
                      🎯 Sẵn sàng mở khóa!
                    </div>
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
        {/* Motivational Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">🎯 Tiếp tục hành trình!</h2>
          <p className="text-lg mb-6">
            Mỗi huy hiệu là một dấu mốc quan trọng trong hành trình cai thuốc
            của bạn
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl mb-2">🔥</div>
              <div className="font-semibold">Kiên trì</div>
              <div className="text-sm opacity-90">Mỗi ngày đều quan trọng</div>
            </div>
            <div>
              <div className="text-3xl mb-2">💪</div>
              <div className="font-semibold">Quyết tâm</div>
              <div className="text-sm opacity-90">Vượt qua mọi thử thách</div>
            </div>
            <div>
              <div className="text-3xl mb-2">🏆</div>
              <div className="font-semibold">Thành công</div>
              <div className="text-sm opacity-90">Mục tiêu trong tầm tay</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Achievements;
