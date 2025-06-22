import axios from "axios";
import config from "../config/config";

// Tạo axios instance với base configuration
const apiClient = axios.create({
  baseURL: config.API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Định nghĩa các khóa lưu trữ trong localStorage
const TOKEN_KEY = "jwt_token"; // Đổi tên cho rõ ràng
const USER_KEY = "user_data"; // Đổi tên cho rõ ràng

// Hàm tiện ích để lưu token vào localStorage
const setToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    console.log("authService: Đã lưu 'token' vào localStorage.");
  } else {
    localStorage.removeItem(TOKEN_KEY); // Xóa nếu token là null/undefined
    console.log(
      "authService: Không có token để lưu hoặc token rỗng. Đã xóa token."
    );
  }
};

// Hàm tiện ích để lấy token từ localStorage
const getToken = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  console.log(
    "authService: Đang lấy 'token' từ localStorage:",
    token ? "Có" : "Không"
  );
  // Token thường là chuỗi, không cần parse JSON trừ khi bạn chắc chắn nó là JSON string.
  // Giữ đơn giản trả về chuỗi thô.
  return token;
};

// Hàm tiện ích để lưu thông tin người dùng vào localStorage
const setCurrentUser = (user) => {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    console.log("authService: Đã lưu 'user' vào localStorage:", user);
  } else {
    localStorage.removeItem(USER_KEY);
    console.log(
      "authService: Không có user để lưu hoặc user rỗng. Đã xóa user."
    );
  }
};

// Hàm tiện ích để lấy thông tin người dùng từ localStorage
const getCurrentUser = () => {
  const userStr = localStorage.getItem(USER_KEY);
  console.log(
    "authService: Đang cố gắng lấy 'user' từ localStorage. Giá trị thô:",
    userStr
  );
  if (userStr) {
    try {
      const parsedUser = JSON.parse(userStr);
      // Ensure that parsedUser has all expected fields, provide defaults if missing
      const userWithDefaults = {
        id: parsedUser.id || null, // Sử dụng null cho id nếu không có
        username: parsedUser.username || "",
        email: parsedUser.email || "",
        role: parsedUser.role || "GUEST", // Mặc định là GUEST nếu không có vai trò
        firstName: parsedUser.firstName || "",
        lastName: parsedUser.lastName || "",
        pictureUrl: parsedUser.pictureUrl || "",
        membership: parsedUser.membership || null,
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
      localStorage.removeItem(USER_KEY); // Xóa user lỗi
      return null;
    }
  }
  console.log("authService: Không tìm thấy 'user' trong localStorage.");
  return null;
};

// Hàm tiện ích để xóa token khỏi localStorage
const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  console.log("authService: Đã xóa token khỏi localStorage.");
};

// Hàm tiện ích để xóa user khỏi localStorage
const removeCurrentUser = () => {
  localStorage.removeItem(USER_KEY);
  console.log("authService: Đã xóa user khỏi localStorage.");
};

// Request interceptor để thêm JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken(); // Sử dụng hàm tiện ích
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
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      console.warn(
        "authService (Interceptor): Nhận phản hồi 401/403 Unauthorized/Forbidden. Đang xóa token và user từ localStorage."
      );
      // *** HÀM ĐANG GỌI LOGOUT Ở ĐÂY! ***
      authService.logout(); // <-- Dòng này cần được kiểm tra
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
        setToken(response.data.token); // Sử dụng hàm tiện ích

        // SỬA LỖI ÁNH XẠ: Đảm bảo các trường được gán đúng
        const user = {
          id: response.data.userId || null, // Lấy userId từ backend
          username: response.data.username || "", // Lấy username từ backend
          email: response.data.email || "",
          role: response.data.role || "GUEST", // Lấy role từ backend
          firstName: response.data.firstName || "",
          lastName: response.data.lastName || "",
          pictureUrl: response.data.pictureUrl || "",
          membership: response.data.membership || null,
        };
        setCurrentUser(user); // Sử dụng hàm tiện ích
        console.log(
          "authService: Đã lưu token và user vào localStorage (local login) với ánh xạ chính xác:",
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

  // Đăng ký
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
      // Nếu đăng ký tự động đăng nhập và trả về token, lưu nó
      if (response.data.token) {
        setToken(response.data.token);
        const user = {
          id: response.data.userId || null,
          username: response.data.username || "",
          email: response.data.email || "",
          role: response.data.role || "GUEST",
          firstName: response.data.firstName || "",
          lastName: response.data.lastName || "",
          pictureUrl: response.data.pictureUrl || "",
          membership: response.data.membership || null,
        };
        setCurrentUser(user);
        console.log(
          "authService: Đã lưu token và user vào localStorage (register):",
          user
        );
        return {
          ...user,
          token: response.data.token,
        };
      }
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
        setToken(response.data.token); // Sử dụng hàm tiện ích

        // ÁNH XẠ CHO GOOGLE LOGIN:
        // Ưu tiên dữ liệu từ backend, nếu thiếu thì lấy từ decodedIdToken
        const user = {
          id: response.data.userId || decodedIdToken?.sub || null, // userId từ backend, fallback sub từ token
          username:
            response.data.username ||
            decodedIdToken?.name ||
            decodedIdToken?.email ||
            "", // username từ backend, fallback name/email từ token
          email: response.data.email || decodedIdToken?.email || "", // email từ backend, fallback email từ token
          role: response.data.role || "GUEST", // role từ backend, mặc định là GUEST
          firstName:
            response.data.firstName || decodedIdToken?.given_name || "", // firstName từ backend, fallback given_name từ token
          lastName: response.data.lastName || decodedIdToken?.family_name || "", // lastName từ backend, fallback family_name từ token
          pictureUrl: response.data.pictureUrl || decodedIdToken?.picture || "", // pictureUrl từ backend, fallback từ token
          membership: response.data.membership || null,
        };
        setCurrentUser(user); // Sử dụng hàm tiện ích
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
    removeToken(); // Sử dụng hàm tiện ích
    removeCurrentUser(); // Sử dụng hàm tiện ích
    // KHÔNG CÒN window.location.href ở đây.
    // AuthContext sẽ xử lý việc cập nhật trạng thái và ProtectedRoute sẽ điều hướng.
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
    return !!getToken() && !!getCurrentUser()?.id; // Kiểm tra cả token và user.id
  },

  // Lấy thông tin user hiện tại
  getCurrentUser: getCurrentUser, // Trả về hàm tiện ích
  // Lấy token hiện tại
  getToken: getToken, // Trả về hàm tiện ích
  // EXPORT setCurrentUser
  setCurrentUser: setCurrentUser,
};

export default authService;
export { apiClient };
