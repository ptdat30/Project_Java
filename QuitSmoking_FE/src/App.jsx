import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./auth/LoginPage";
import RegisterPage from "./auth/RegisterPage";
import HomePage from "./components/HomePage.jsx";
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
import AiChatWidget from "./components/AiChatBox/AiChatWidget";
import PostDetail from "./components/community/PostDetail"; // Add this import
import '@fortawesome/fontawesome-free/css/all.min.css';
import apiService from "./services/apiService";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import notificationService from "./services/notificationService";
import globalMessageListener from "./services/globalMessageListener";
import DashboardMembers from "./components/dashboard/DashboardMembers";

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

  // Reset notification cooldown khi chuyển trang
  useEffect(() => {
    // Reset cooldown khi chuyển từ trang chat sang trang khác
    if (location.pathname !== '/coach-consultation') {
      notificationService.resetCooldown();
    }
  }, [location.pathname]);

  // Khởi tạo GlobalMessageListener cho coach
  useEffect(() => {
    if (user && user.id) {
      const isCoach = user.role === 'COACH';
      console.log('App: Initializing GlobalMessageListener for user:', user.id, 'isCoach:', isCoach);
      globalMessageListener.connect(user.id, isCoach);
      
      // Cleanup khi component unmount
      return () => {
        globalMessageListener.disconnect();
      };
    }
  }, [user]);

  // --- Trạng thái kiểm tra backend ---
  const [hasRecordedStatus, setHasRecordedStatus] = useState(false);
  const [hasPlan, setHasPlan] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      if (user && user.id) {
        setCheckingStatus(true);
        try {
          // Kiểm tra ghi nhận tình trạng
          const statuses = await apiService.getSmokingStatus(user.id);
          console.log("Smoking status API result:", statuses);
          setHasRecordedStatus(Array.isArray(statuses) && statuses.length > 0);
          // Kiểm tra kế hoạch
          const plans = await apiService.getQuitPlans();
          console.log("Quit plans API result:", plans);
          if (Array.isArray(plans)) {
            setHasPlan(plans.length > 0);
          } else if (plans && typeof plans === 'object') {
            setHasPlan(true); // Có 1 object kế hoạch
          } else {
            setHasPlan(false);
          }
        } catch (e) {
          setHasRecordedStatus(false);
          setHasPlan(false);
        } finally {
          setCheckingStatus(false);
        }
      } else {
        setHasRecordedStatus(false);
        setHasPlan(false);
        setCheckingStatus(false);
      }
    };
    fetchStatus();
  }, [user]);

  // Khi hoàn thành ghi nhận tình trạng, kiểm tra lại trạng thái từ backend và chuyển sang PlanPage
  const handleStatusRecorded = async () => {
    if (user && user.id) {
      setCheckingStatus(true);
      try {
        const statuses = await apiService.getSmokingStatus(user.id);
        setHasRecordedStatus(Array.isArray(statuses) && statuses.length > 0);
      } catch (e) {
        setHasRecordedStatus(true); // fallback
      } finally {
        setCheckingStatus(false);
        navigate('/plan', { replace: true });
      }
    }
  };

  // Khi hoàn thành lập kế hoạch, kiểm tra lại trạng thái từ backend và chuyển sang dashboard
  const handlePlanCreated = async () => {
    setCheckingStatus(true);
    try {
      const plans = await apiService.getQuitPlans();
      if (Array.isArray(plans)) {
        setHasPlan(plans.length > 0);
      } else if (plans && typeof plans === 'object') {
        setHasPlan(true); // Có 1 object kế hoạch
      } else {
        setHasPlan(false);
      }
    } catch (e) {
      setHasPlan(true); // fallback
    } finally {
      setCheckingStatus(false);
      navigate('/dashboard', { replace: true });
    }
  };

  // --- Route /plan logic ---
  const renderPlanRoute = () => {
    if (checkingStatus) {
      return <div>Đang kiểm tra trạng thái ghi nhận...</div>;
    }
    if (!hasRecordedStatus) {
      // Chưa ghi nhận tình trạng
      return <GhiNhanTinhTrang onComplete={handleStatusRecorded} />;
    }
    if (!hasPlan) {
      // Đã ghi nhận tình trạng nhưng chưa lập kế hoạch
      return <PlanPage onComplete={handlePlanCreated} />;
    }
    // Đã có kế hoạch
    return <Navigate to="/dashboard" replace />;
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
          element={renderPlanRoute()}
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
        <Route
          path="/dashboard-members"
          element={
            <ProtectedRoute allowedRoles={["COACH"]}>
              <DashboardMembers />
            </ProtectedRoute>
          }
        />
      </Routes>
      <AiChatWidget />
      
      {/* Toast Container for global notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
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