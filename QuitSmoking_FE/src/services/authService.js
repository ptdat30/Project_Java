import axios from "axios";
import config from "../config/config";

// Tạo axios instance với base configuration
const apiClient = axios.create({
  baseURL: config.API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor để thêm JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor để xử lý token hết hạn
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.warn(
        "authService (Interceptor): Nhận phản hồi 401/403 Unauthorized/Forbidden. Đang xóa token và user từ localStorage."
      );
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Hàm tiện ích để giải mã JWT (Id Token của Google)
const decodeJwt = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Lỗi khi giải mã JWT:", e);
    return null;
  }
};

const authService = {
  // Đăng nhập (Local login)
  login: async (credentials) => {
    try {
      console.log(
        "authService: Đang gửi yêu cầu đăng nhập local với:",
        credentials
      );
      const response = await apiClient.post(
        config.endpoints.login,
        credentials
      );
      console.log(
        "authService: Phản hồi thành công từ backend (login):",
        response.data
      );
      if (response.data.token) {
        const user = {
          id: response.data.username, // Lấy ID thực tế từ trường 'username' của backend
          username: response.data.role, // Lấy USERNAME thực tế từ trường 'role' của backend
          role: response.data.userId, // Lấy ROLE thực tế từ trường 'userId' của backend
          email: response.data.email || "", // Email có thể được trả về hoặc không
          firstName: response.data.firstName || "",
          lastName: response.data.lastName || "",
          pictureUrl: response.data.pictureUrl || "",
        };
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(user));
        console.log(
          "authService: Đã lưu token và user vào localStorage (local login) với ánh xạ điều chỉnh:",
          user
        );
      }
      return response.data;
    } catch (error) {
      console.error(
        "authService: Lỗi khi đăng nhập local:",
        error.response?.data || error.message,
        "Status:",
        error.response?.status
      );
      throw error.response?.data || error.message;
    }
  },

  // Đăng ký (giữ nguyên)
  register: async (userData) => {
    try {
      console.log("authService: Đang gửi yêu cầu đăng ký với:", userData);
      const response = await apiClient.post(
        config.endpoints.register,
        userData
      );
      console.log(
        "authService: Phản hồi từ backend (register):",
        response.data
      );
      return response.data;
    } catch (error) {
      console.error(
        "authService: Lỗi khi đăng ký:",
        error.response?.data || error.message
      );
      throw error.response?.data || error.message;
    }
  },

  // Đăng nhập Google
  googleLogin: async (idTokenFromGoogle) => {
    try {
      console.log(
        "authService: Đang gửi ID Token Google đến backend:",
        idTokenFromGoogle
      );

      // Thử giải mã ID Token để lấy thông tin trực tiếp từ Google
      const decodedIdToken = decodeJwt(idTokenFromGoogle);
      console.log("authService: Đã giải mã ID Token Google:", decodedIdToken);

      const response = await apiClient.post(config.endpoints.googleLogin, {
        idToken: idTokenFromGoogle,
      });
      console.log(
        "authService: Phản hồi thành công từ backend (googleLogin):",
        response.data
      );

      if (response.data.token) {
        // ÁNH XẠ CHO GOOGLE LOGIN:
        // Ưu tiên dữ liệu từ backend, nếu thiếu thì lấy từ decodedIdToken
        const user = {
          id: response.data.userId || decodedIdToken?.sub || "", // userId từ backend, fallback sub từ token
          username:
            response.data.username ||
            decodedIdToken?.name ||
            decodedIdToken?.email ||
            "", // username từ backend, fallback name/email từ token
          email: response.data.email || decodedIdToken?.email || "", // email từ backend, fallback email từ token
          role: response.data.role || "GUEST", // role từ backend, mặc định là GUEST
          firstName:
            response.data.given_name || decodedIdToken?.given_name || "",
          lastName:
            response.data.family_name || decodedIdToken?.family_name || "",
          pictureUrl: response.data.pictureUrl || decodedIdToken?.picture || "", // pictureUrl từ backend, fallback từ token
        };
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(user));
        console.log(
          "authService: Đã lưu token và user vào localStorage (Google login) với ánh xạ hỗn hợp:",
          user
        );
      }
      return response.data;
    } catch (error) {
      console.error(
        "authService: Lỗi khi đăng nhập Google:",
        error.response?.data || error.message,
        "Status:",
        error.response?.status
      );
      throw error.response?.data || error.message;
    }
  },

  // Đăng xuất
  logout: () => {
    console.log(
      "authService: Đang thực hiện đăng xuất. Xóa token và user từ localStorage."
    );
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  },

  // Quên mật khẩu
  forgotPassword: async (email) => {
    try {
      const response = await apiClient.post(config.endpoints.forgotPassword, {
        email,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Đặt lại mật khẩu
  resetPassword: async (token, newPassword) => {
    try {
      const response = await apiClient.post(config.endpoints.resetPassword, {
        token,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Kiểm tra authentication
  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  // Lấy thông tin user hiện tại
  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    console.log(
      "authService: Đang cố gắng lấy 'user' từ localStorage. Giá trị thô:",
      userStr
    );
    if (userStr) {
      try {
        const parsedUser = JSON.parse(userStr);
        // Ensure that parsedUser has all expected fields, provide defaults if missing
        const userWithDefaults = {
          id: parsedUser.id || "",
          username: parsedUser.username || "",
          email: parsedUser.email || "",
          role: parsedUser.role || "",
          firstName: parsedUser.firstName || "",
          lastName: parsedUser.lastName || "",
          pictureUrl: parsedUser.pictureUrl || "",
        };
        console.log(
          "authService: 'user' đã parse từ localStorage (có defaults):",
          userWithDefaults
        );
        return userWithDefaults;
      } catch (e) {
        console.error(
          "authService: Lỗi khi parse 'user' từ localStorage:",
          e,
          "Giá trị lỗi:",
          userStr
        );
        localStorage.removeItem("user");
        return null;
      }
    }
    console.log("authService: Không tìm thấy 'user' trong localStorage.");
    return null;
  },

  // Lấy token hiện tại
  getToken: () => {
    const tokenStr = localStorage.getItem("token");
    if (tokenStr) {
      try {
        const parsedToken = JSON.parse(tokenStr);
        if (typeof parsedToken === "object" && parsedToken.token) {
          console.log(
            "authService: Đang lấy 'token' từ localStorage (parsed from object):",
            parsedToken.token ? "Có" : "Không"
          );
          return parsedToken.token;
        }
        console.log(
          "authService: Đang lấy 'token' từ localStorage (direct string or other parsed):",
          tokenStr ? "Có" : "Không"
        );
        return tokenStr;
      } catch (e) {
        console.log(
          "authService: Đang lấy 'token' từ localStorage (direct string - parse error):",
          tokenStr ? "Có" : "Không"
        );
        return tokenStr;
      }
    }
    console.log("authService: Đang lấy 'token' từ localStorage: Không");
    return null;
  },
};

export default authService;
export { apiClient };
