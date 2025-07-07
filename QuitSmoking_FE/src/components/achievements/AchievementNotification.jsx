import React from 'react';

const AchievementNotification = ({ achievement, onClose }) => {
  if (!achievement) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center shadow-xl">
        {/* Achievement Icon */}
        <div className="text-8xl mb-4 animate-bounce">
          {achievement.iconUrl || achievement.achievementIconUrl || "🏆"}
        </div>
        
        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Chúc mừng!
        </h2>
        
        {/* Achievement Name */}
        <h3 className="text-xl font-semibold text-blue-600 mb-3">
          {achievement.name || achievement.achievementName || "Huy hiệu mới"}
        </h3>
        
        {/* Description */}
        <p className="text-gray-600 mb-6">
          {achievement.description || achievement.achievementDescription || ""}
        </p>
        
        {/* Badge Color */}
        <div className="inline-block px-4 py-2 rounded-full text-sm font-medium border-2 mb-6 bg-yellow-100 text-yellow-800 border-yellow-300">
          {achievement.badgeColor || achievement.achievementBadgeColor || ""}
        </div>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Tuyệt vời!
        </button>
      </div>
    </div>
  );
};

export default AchievementNotification; 