import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation, Navigate, useNavigate } from "react-router-dom";
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
import Feedback from "./components/feedback/feedback";
import '@fortawesome/fontawesome-free/css/all.min.css';

// --- Components để bảo vệ Routes ---

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Đang tải...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const GuestOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Đang tải...
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Không hiển thị Navigation trên các trang auth
  const hideNavigation = ["/login", "/register", "/recover-password"].includes(
    location.pathname
  );

  // --- SỬA ĐOẠN NÀY: Lưu trạng thái theo từng user ---
  const [hasRecordedStatus, setHasRecordedStatus] = useState(false);

  useEffect(() => {
    if (user && user.id) {
      const savedStatus = localStorage.getItem(`hasRecordedStatus_${user.id}`);
      setHasRecordedStatus(savedStatus === 'true');
    }
  }, [user]);

  // Khi hoàn thành ghi nhận tình trạng, lưu trạng thái theo user
  const handleStatusRecorded = () => {
    if (user && user.id) {
      localStorage.setItem(`hasRecordedStatus_${user.id}`, 'true');
      setHasRecordedStatus(true);
      navigate('/plan');
    }
  };

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
            hasRecordedStatus ? (
              <PlanPage />
            ) : (
              <GhiNhanTinhTrang onComplete={handleStatusRecorded} />
            )
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
        <Route
          path="/ghinhantinhtrang"
          element={
            <ProtectedRoute>
              {hasRecordedStatus ? (
                <Navigate to="/plan" replace />
              ) : (
                <GhiNhanTinhTrang onComplete={handleStatusRecorded} />
              )}
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/feedback"
          element={
            <ProtectedRoute allowedRoles={["MEMBER"]}>
              <Feedback />
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