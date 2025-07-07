import React, { useState, useEffect } from "react";
import apiService from "../../services/apiService";

const AchievementSummary = () => {
  const [userAchievements, setUserAchievements] = useState([]);
  const [totalAchievements, setTotalAchievements] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievementSummary();
  }, []);

  const loadAchievementSummary = async () => {
    try {
      setLoading(true);
      const userAchievementsData = await apiService.getUserAchievements();
      setUserAchievements(userAchievementsData);
      setTotalAchievements(userAchievementsData.length);
    } catch (err) {
      console.error("Error loading achievement summary:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Get recent achievements (last 3)
  const recentAchievements = userAchievements.slice(0, 3);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          🏆 Huy hiệu thành tích
        </h3>
        <span className="text-sm text-gray-500">
          {totalAchievements} huy hiệu
        </span>
      </div>

      {totalAchievements === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🏆</div>
          <p className="text-gray-600 text-sm">
            Chưa có huy hiệu nào. Hãy tiếp tục hành trình cai thuốc!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Recent Achievements */}
          <div className="grid grid-cols-3 gap-3">
            {recentAchievements.map((userAchievement) => {
              const achievement = userAchievement.achievement;
              if (!achievement) return null;

              return (
                <div
                  key={userAchievement.id}
                  className="text-center p-3 bg-gradient-to-br from-yellow-50 to-white rounded-lg border border-yellow-200"
                >
                  <div className="text-2xl mb-1">
                    {achievement.iconUrl || "🏆"}
                  </div>
                  <div className="text-xs font-medium text-gray-900 truncate">
                    {achievement.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(userAchievement.earnedDate).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              );
            })}
          </div>

          {/* View All Button */}
          {totalAchievements > 3 && (
            <div className="text-center pt-2">
              <button
                onClick={() => window.location.href = '/achievements'}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Xem tất cả huy hiệu →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AchievementSummary; 