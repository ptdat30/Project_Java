import React, { createContext, useContext, useReducer, useEffect } from "react";
import authService from "../services/authService"; // Đảm bảo đường dẫn này đúng
import apiService from "../services/apiService"; // Import apiService để fetch user profile
import websocketService from "../services/websocketService"; // Import WebSocket service

const AuthContext = createContext();

const authReducer = (state, action) => {
  console.log(
    "AuthContext (Reducer): Hành động được gửi đi:",
    action.type,
    "Payload:",
    action.payload
  );
  switch (action.type) {
    case "LOGIN_START":
      return {
        ...state,
        loading: true,
        error: null,
      };
    case "LOGIN_SUCCESS":
      const userPayload = action.payload; // userPayload sẽ là đối tượng chứa token và các trường của user
      const newState = {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: {
          // Ánh xạ trực tiếp từ userPayload (phản hồi từ backend hoặc storedUser)
          id: userPayload.id,
          username: userPayload.username,
          email: userPayload.email,
          role: userPayload.role,
          firstName: userPayload.firstName,
          lastName: userPayload.lastName,
          pictureUrl: userPayload.pictureUrl,
          membership: userPayload.membership || null,
          phoneNumber: userPayload.phoneNumber || "",
          gender: userPayload.gender || "",
          dateOfBirth: userPayload.dateOfBirth || "",
        },
        token: userPayload.token, // Lấy token từ payload
        error: null,
      };
      console.log(
        "AuthContext (Reducer): LOGIN_SUCCESS - Trạng thái mới:",
        newState
      );
      return newState;
    case "LOGIN_FAILURE":
      const failureState = {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload,
      };
      console.log(
        "AuthContext (Reducer): LOGIN_FAILURE - Trạng thái mới:",
        failureState
      );
      return failureState;
    case "LOGOUT":
      const logoutState = {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null,
      };
      console.log(
        "AuthContext (Reducer): LOGOUT - Trạng thái mới:",
        logoutState
      );
      return logoutState;
    case "UPDATE_USER":
      const updatedUserState = {
        ...state,
        user: { ...state.user, ...action.payload }, // Cập nhật các trường user hiện có
      };
      console.log(
        "AuthContext (Reducer): UPDATE_USER - Trạng thái mới:",
        updatedUserState
      );
      return updatedUserState;
    case "SET_LOADING":
      const loadingState = { ...state, loading: action.payload };
      console.log(
        "AuthContext (Reducer): SET_LOADING - Trạng thái mới:",
        loadingState
      );
      return loadingState;
    case "SET_ERROR":
      const errorState = { ...state, error: action.payload, loading: false };
      console.log(
        "AuthContext (Reducer): SET_ERROR - Trạng thái mới:",
        errorState
      );
      return errorState;
    case "CLEAR_ERROR":
      const clearedErrorState = { ...state, error: null };
      console.log(
        "AuthContext (Reducer): CLEAR_ERROR - Trạng thái mới:",
        clearedErrorState
      );
      return clearedErrorState;
    default:
      return state;
  }
};

const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true, // Bắt đầu với loading: true để chờ kiểm tra xác thực
  error: null,
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  // Helper function để kiểm tra đồng bộ state vs localStorage
  const checkAuthSync = () => {
    const token = authService.getToken();
    const user = authService.getCurrentUser();

    console.log(
      "AuthContext: Kiểm tra đồng bộ - State isAuthenticated:",
      state.isAuthenticated
    );
    console.log(
      "AuthContext: Kiểm tra đồng bộ - Token trong localStorage:",
      token ? "Có" : "Không"
    );
    console.log(
      "AuthContext: Kiểm tra đồng bộ - User trong localStorage:",
      user ? "Có" : "Không"
    );

    // Nếu state nghĩ đã login nhưng không có token/user → logout
    if (state.isAuthenticated && (!token || !user)) {
      console.warn("AuthContext: Phát hiện mất đồng bộ - logout tự động");
      dispatch({ type: "LOGOUT" });
    }
    // Nếu có token/user nhưng state chưa login → login
    else if (!state.isAuthenticated && token && user) {
      console.log(
        "AuthContext: Phát hiện có token/user mà chưa login - đồng bộ state"
      );
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { ...user, token },
      });
    }
  };

  // useEffect để kiểm tra đồng bộ định kỳ
  useEffect(() => {
    if (!state.loading) {
      // Chỉ check khi không loading
      checkAuthSync();
    }
  }, [state.isAuthenticated, state.loading]);
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = authService.getToken();
        if (token) {
          // Luôn fetch user profile mới nhất từ backend
          try {
            const userProfile = await apiService.getUserProfile();
            const userData = {
              id: userProfile.id,
              username: userProfile.username,
              email: userProfile.email,
              role: userProfile.role,
              firstName: userProfile.firstName || "",
              lastName: userProfile.lastName || "",
              pictureUrl: userProfile.pictureUrl || "",
              membership: userProfile.membership || null,
              phoneNumber: userProfile.phoneNumber || "",
              gender: userProfile.gender || "",
              dateOfBirth: userProfile.dateOfBirth || "",
              // Thêm các trường khác nếu backend trả về
            };
            // Lưu vào localStorage
            authService.setCurrentUser(userData);
            // Cập nhật context
            dispatch({
              type: "LOGIN_SUCCESS",
              payload: {
                token: token,
                ...userData,
              },
            });
          } catch (profileError) {
            // Nếu lỗi, logout
            authService.logout();
            dispatch({ type: "SET_LOADING", payload: false });
          }
        } else {
          dispatch({ type: "SET_LOADING", payload: false });
        }
      } catch (error) {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    dispatch({ type: "LOGIN_START" });
    try {
      const response = await authService.login(credentials);
      console.log("AuthContext: Login response:", response);

      if (response.success) {
        const userData = response.user;
        const token = response.token;

        // Lưu vào localStorage
        authService.setToken(token);
        authService.setCurrentUser(userData);

        // Cập nhật context
        dispatch({
          type: "LOGIN_SUCCESS",
          payload: {
            token: token,
            ...userData,
          },
        });

        // Connect to WebSocket for user activity tracking
        if (userData.id) {
          websocketService.connect(
            userData.id,
            'user-activity',
            (message) => {
              console.log('User activity message:', message);
            }
          );
        }

        return { success: true };
      } else {
        dispatch({
          type: "LOGIN_FAILURE",
          payload: response.message || "Đăng nhập thất bại",
        });
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error("AuthContext: Login error:", error);
      dispatch({
        type: "LOGIN_FAILURE",
        payload: error.message || "Đăng nhập thất bại",
      });
      return { success: false, message: error.message };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const response = await authService.register(userData);
      dispatch({ type: "SET_LOADING", payload: false });
      // Nếu đăng ký tự động đăng nhập, có thể dispatch LOGIN_SUCCESS ở đây
      if (response.token && response.userId) {
        // Kiểm tra token và userId có trong response
        dispatch({
          type: "LOGIN_SUCCESS",
          payload: {
            token: response.token,
            id: response.userId,
            username: response.username,
            email: response.email,
            role: response.role,
            firstName: response.firstName,
            lastName: response.lastName,
            pictureUrl: response.pictureUrl,
            membership: response.membership,
          },
        });
      }
      return response;
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error.message || "Đăng ký thất bại",
      });
      throw error;
    }
  };

  const googleLogin = async (token) => {
    try {
      dispatch({ type: "LOGIN_START" });
      const response = await authService.googleLogin(token);
      // Sau khi Google login thành công, fetch lại profile mới nhất
      const userProfile = await apiService.getUserProfile();
      const userData = {
        id: userProfile.id,
        username: userProfile.username,
        email: userProfile.email,
        role: userProfile.role,
        firstName: userProfile.firstName || "",
        lastName: userProfile.lastName || "",
        pictureUrl: userProfile.pictureUrl || "",
        membership: userProfile.membership || null,
        phoneNumber: userProfile.phoneNumber || "",
        gender: userProfile.gender || "",
        dateOfBirth: userProfile.dateOfBirth || "",
        // Thêm các trường khác nếu backend trả về
      };
      authService.setCurrentUser(userData);
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          token: response.token,
          ...userData,
        },
      });
      return response;
    } catch (error) {
      dispatch({
        type: "LOGIN_FAILURE",
        payload: error.message || "Đăng nhập Google thất bại",
      });
      throw error;
    }
  };

  const logout = () => {
    // Disconnect WebSocket
    websocketService.disconnect();
    
    // Clear localStorage
    authService.logout();
    
    // Update context
    dispatch({ type: "LOGOUT" });
  };

  const updateUser = (userData) => {
    dispatch({
      type: "UPDATE_USER",
      payload: userData,
    });
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      // SỬA: Cập nhật localStorage bằng hàm tiện ích của authService
      authService.setCurrentUser({ ...currentUser, ...userData });
    }
  };

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  const forgotPassword = async (email) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const response = await authService.forgotPassword(email);
      dispatch({ type: "SET_LOADING", payload: false });
      return response;
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error.message || "Gửi email thất bại",
      });
      throw error;
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const response = await authService.resetPassword(token, newPassword);
      dispatch({ type: "SET_LOADING", payload: false });
      return response;
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error.message || "Đặt lại mật khẩu thất bại",
      });
      throw error;
    }
  };

  const value = {
    ...state,
    login,
    register,
    googleLogin,
    logout,
    updateUser,
    clearError,
    forgotPassword,
    resetPassword,
    checkAuthSync,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
