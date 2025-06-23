import React from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
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
import MembershipPage from "./components/membership/MembershipPage";
import SettingsPage from "./components/settings/SettingsPage";
import AdminPanel from "./components/admin/AdminPanel";
import DailyProgressPage from "./components/progress/DailyProgressPage";
import GhiNhanTinhTrang from "./components/ghinhantinhtrang";

// --- Components để bảo vệ Routes ---

// ProtectedRoute: Chỉ cho phép người dùng đã đăng nhập truy cập
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    // Hiển thị một cái gì đó trong khi đang kiểm tra trạng thái xác thực
    return (
      <div className="flex justify-center items-center h-screen">
        Đang tải...
      </div>
    );
  }

  if (!isAuthenticated) {
    // Nếu chưa xác thực, chuyển hướng về trang đăng nhập
    console.log(
      "ProtectedRoute: Người dùng chưa xác thực. Chuyển hướng đến /login."
    );
    return <Navigate to="/login" replace />;
  }

  // Kiểm tra vai trò nếu được cung cấp
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    console.warn(
      `ProtectedRoute: Người dùng ${user.username} không có quyền truy cập.`
    );
    // Chuyển hướng đến trang không có quyền truy cập hoặc trang dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children; // Nếu đã xác thực và có quyền, cho phép truy cập
};

// GuestOnlyRoute: Chỉ cho phép người dùng CHƯA đăng nhập truy cập
const GuestOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    // Hiển thị một cái gì đó trong khi đang kiểm tra trạng thái xác thực
    return (
      <div className="flex justify-center items-center h-screen">
        Đang tải...
      </div>
    );
  }

  if (isAuthenticated) {
    // Nếu đã xác thực, chuyển hướng về trang dashboard (hoặc trang chính)
    console.log(
      "GuestOnlyRoute: Người dùng đã xác thực. Chuyển hướng đến HomePage."
    );
    return <Navigate to="/" replace />;
  }
  return children; // Nếu chưa xác thực, cho phép truy cập
};

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
        <Route
          path="/login"
          element={
            <GuestOnlyRoute>
              <LoginPage />
            </GuestOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestOnlyRoute>
              <RegisterPage />
            </GuestOnlyRoute>
          }
        />
        <Route
          path="/recover-password"
          element={
            <GuestOnlyRoute>
              <RecoverPasswordProcess />
            </GuestOnlyRoute>
          }
        />

        {/* Các ProtectedRoute, ví dụ: */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/community"
          element={
            <ProtectedRoute>
              <Community />
            </ProtectedRoute>
          }
        />
        <Route
          path="/coach-consultation"
          element={
            <ProtectedRoute>
              <CoachConsultation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/achievements"
          element={
            <ProtectedRoute>
              <Achievements />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/plan"
          element={
            <ProtectedRoute>
              <PlanPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/membership"
          element={
            <ProtectedRoute>
              <MembershipPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/daily-progress"
          element={
            <ProtectedRoute>
              <DailyProgressPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quit-status"
          element={
            <ProtectedRoute>
              <GhiNhanTinhTrang />
            </ProtectedRoute>
          }
        />

        {/* Admin route - chỉ admin mới có quyền truy cập */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
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
