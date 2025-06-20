import React, { createContext, useContext, useReducer, useEffect } from "react";
import authService from "../services/authService"; // Đảm bảo đường dẫn này đúng
import apiService from "../services/apiService"; // Import apiService để fetch user profile

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
      const userPayload = action.payload;
      const newState = {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: {
          id: userPayload.userId,
          username: userPayload.username,
          email: userPayload.email,
          role: userPayload.role,
          firstName: userPayload.firstName,
          lastName: userPayload.lastName,
          pictureUrl: userPayload.pictureUrl,
        },
        token: userPayload.token,
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
        user: { ...state.user, ...action.payload },
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
  loading: true,
  error: null,
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = authService.getToken(); // Lấy token từ localStorage
        let storedUser = authService.getCurrentUser(); // Lấy user từ localStorage

        console.log("AuthContext (useEffect): Token khi khởi tạo:", token);
        console.log(
          "AuthContext (useEffect): User từ localStorage khi khởi tạo:",
          storedUser
        );

        // Nếu có token nhưng user là null hoặc thiếu thông tin, thử fetch user profile từ API
        if (
          token &&
          (!storedUser ||
            !storedUser.id ||
            !storedUser.username ||
            !storedUser.role)
        ) {
          console.log(
            "AuthContext (useEffect): Có token nhưng user không hợp lệ/thiếu. Đang cố gắng fetch User Profile..."
          );
          try {
            const userProfile = await apiService.getUserProfile(); // Gọi API để lấy user profile
            // Cập nhật storedUser với dữ liệu từ API
            storedUser = {
              id: userProfile.id,
              username: userProfile.username,
              email: userProfile.email,
              role: userProfile.role,
              firstName: userProfile.firstName || "",
              lastName: userProfile.lastName || "",
              pictureUrl: userProfile.pictureUrl || "",
            };
            localStorage.setItem("user", JSON.stringify(storedUser)); // Lưu lại user mới vào localStorage
            console.log(
              "AuthContext (useEffect): Đã fetch và lưu User Profile thành công:",
              storedUser
            );
          } catch (profileError) {
            console.error(
              "AuthContext (useEffect): Lỗi khi fetch User Profile:",
              profileError
            );
            // Nếu không fetch được profile, có thể token đã hết hạn hoặc không hợp lệ
            authService.logout(); // Đăng xuất để xóa token cũ
            dispatch({ type: "SET_LOADING", payload: false });
            return; // Dừng lại ở đây
          }
        }

        if (
          token &&
          storedUser &&
          storedUser.id &&
          storedUser.username &&
          storedUser.role
        ) {
          console.log(
            "AuthContext (useEffect): Đã tìm thấy token và user hợp lệ. Đang dispatch LOGIN_SUCCESS."
          );
          dispatch({
            type: "LOGIN_SUCCESS",
            payload: {
              token: token,
              userId: storedUser.id,
              username: storedUser.username,
              email: storedUser.email,
              role: storedUser.role,
              firstName: storedUser.firstName,
              lastName: storedUser.lastName,
              pictureUrl: storedUser.pictureUrl,
            },
          });
        } else {
          console.log(
            "AuthContext (useEffect): Không tìm thấy token hoặc user hợp lệ trong localStorage. Đặt loading = false."
          );
          dispatch({ type: "SET_LOADING", payload: false });
        }
      } catch (error) {
        console.error(
          "AuthContext (useEffect): Lỗi khi khởi tạo authentication:",
          error
        );
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      dispatch({ type: "LOGIN_START" });
      const response = await authService.login(credentials);
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: response,
      });
      return response;
    } catch (error) {
      dispatch({
        type: "LOGIN_FAILURE",
        payload: error.message || "Đăng nhập thất bại",
      });
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const response = await authService.register(userData);
      dispatch({ type: "SET_LOADING", payload: false });
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
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: response,
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
    authService.logout();
    dispatch({ type: "LOGOUT" });
  };

  const updateUser = (userData) => {
    dispatch({
      type: "UPDATE_USER",
      payload: userData,
    });
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      localStorage.setItem(
        "user",
        JSON.stringify({ ...currentUser, ...userData })
      );
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
