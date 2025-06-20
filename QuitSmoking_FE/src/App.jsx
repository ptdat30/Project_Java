import React, { useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import LoginPage from "./auth/LoginPage";
import RegisterPage from "./auth/RegisterPage";
import HomePage from "./components/HomePage_New";
import RecoverPasswordProcess from "./components/laylaimatkhau/RecoverPasswordProcess";
import Dashboard from "./components/dashboard/Dashboard";
import Community from "./components/community/Community";
import CoachConsultation from "./components/coach/CoachConsultation";
import Achievements from "./components/achievements/Achievements";
import Navigation from "./components/layout/Navigation";
import ProfilePage from "./components/profile/ProfilePage";
import PlanPage from "./components/plan/PlanPage";
import MembershipPage from "./components/membership/MembershipPage_New";
import SettingsPage from "./components/settings/SettingsPage";
import AdminPanel from "./components/admin/AdminPanel";
import DailyProgressPage from "./components/progress/DailyProgressPage";
import GhiNhanTinhTrang from "./components/ghinhantinhtrang";

const AppContent = () => {
  const location = useLocation();

  // Không hiển thị Navigation trên các trang auth
  const hideNavigation = ["/login", "/register", "/recover-password"].includes(
    location.pathname
  );


  // Trạng thái để kiểm tra xem người dùng đã ghi nhận tình trạng chưa
  // Sử dụng localStorage để giữ trạng thái này ngay cả khi refresh trình duyệt
  const [hasRecordedStatus, setHasRecordedStatus] = useState(() => {
    const savedStatus = localStorage.getItem('hasRecordedStatus');
    // Chuyển đổi chuỗi "true" thành boolean true, nếu không có thì mặc định là false
    return savedStatus === 'true';
  });

  // Hàm này sẽ được gọi từ GhiNhanTinhTrang khi người dùng hoàn thành form
  const handleStatusRecorded = () => {
    setHasRecordedStatus(true); // Cập nhật trạng thái trong component
    localStorage.setItem('hasRecordedStatus', 'true'); // Lưu trạng thái vào localStorage
    navigate('/plan'); // Điều hướng trở lại trang /plan (lúc này sẽ hiển thị PlanPage)
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {!hideNavigation && <Navigation />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/recover-password" element={<RecoverPasswordProcess />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/community" element={<Community />} />
        <Route path="/coach-consultation" element={<CoachConsultation />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/profile" element={<ProfilePage />} />
        {/* Dựa vào hasRecordedStatus để quyết định hiển thị trang nào */}
        <Route
          path="/plan"
          element={
            hasRecordedStatus ? (
              <PlanPage />
            ) : (
              <GhiNhanTinhTrang onComplete={handleStatusRecorded} /> // Truyền hàm xử lý hoàn thành
            )
          }
        />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/membership" element={<MembershipPage />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/daily-progress" element={<DailyProgressPage />} />
        {/* <Route path="/quit-status" element={<GhiNhanTinhTrang />} /> */}
      </Routes>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
