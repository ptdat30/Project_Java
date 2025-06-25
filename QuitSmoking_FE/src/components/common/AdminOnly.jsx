import React from 'react';
import { useAdminAuth } from '../../hooks/useAdminAuth';

/**
 * Component wrapper để bảo vệ các component chỉ dành cho admin
 * @param {React.ReactNode} children - Component con cần bảo vệ
 * @param {React.ReactNode} fallback - Component hiển thị khi không phải admin (optional)
 * @returns {React.ReactNode}
 */
const AdminOnly = ({ children, fallback = null }) => {
  const { isAdmin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return fallback;
  }

  return children;
};

export default AdminOnly; 