import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
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
        <Route path="/plan" element={<PlanPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/membership" element={<MembershipPage />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/daily-progress" element={<DailyProgressPage />} />
        <Route path="/quit-status" element={<GhiNhanTinhTrang />} />
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
