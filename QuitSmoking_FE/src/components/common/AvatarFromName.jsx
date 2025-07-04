import React from 'react';

const AvatarFromName = ({ firstName, lastName, size = 40, className = "" }) => {
  // Lấy chữ cái đầu của firstName và lastName
  const getInitials = () => {
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    return firstInitial + lastInitial;
  };

  // Tạo màu gradient dựa trên tên
  const getGradientColors = () => {
    const name = (firstName + lastName).toLowerCase();
    const colors = [
      'from-green-500 to-green-600',
      'from-emerald-500 to-emerald-600',
      'from-teal-500 to-teal-600',
      'from-green-400 to-green-500',
      'from-emerald-400 to-emerald-500',
      'from-teal-400 to-teal-500',
      'from-green-600 to-green-700',
      'from-emerald-600 to-emerald-700',
      'from-teal-600 to-teal-700',
      'from-green-300 to-green-400'
    ];
    
    // Tạo hash đơn giản từ tên để chọn màu
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const initials = getInitials();
  const gradientColors = getGradientColors();

  return (
    <div 
      className={`rounded-full bg-gradient-to-r ${gradientColors} flex items-center justify-center text-white font-bold shadow-md ${className}`}
      style={{ 
        width: `${size}px`, 
        height: `${size}px`,
        fontSize: `${Math.max(size * 0.4, 12)}px`
      }}
    >
      {initials || 'U'}
    </div>
  );
};

export default AvatarFromName; 