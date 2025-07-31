// Import axios để thực hiện HTTP requests
import axios from "axios";

/**
 * Service API cho authentication
 * Xử lý các chức năng đăng nhập, đăng ký, logout
 */

// Tạo axios instance với cấu hình cơ bản
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:7262", // Base URL từ env hoặc localhost
  timeout: 10000, // Timeout 10 giây
  headers: {
    "Content-Type": "application/json", // Header mặc định
  },
});

// Request interceptor để tự động thêm token vào header
api.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage
    const token = localStorage.getItem("userToken");
    if (token && token !== "demo-token") {
      // Thêm Bearer token vào Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor để xử lý lỗi global
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Xử lý lỗi 401 (Unauthorized) - token hết hạn
    if (error.response?.status === 401) {
      // Xóa thông tin auth và redirect về login
      localStorage.removeItem("userToken");
      localStorage.removeItem("userRole");
      localStorage.removeItem("username");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Object chứa các API functions cho authentication
export const authAPI = {
  /**
   * API đăng nhập
   * @param {Object} credentials - Thông tin đăng nhập {email, password}
   * @returns {Promise} Response từ server
   */
  login: async (credentials) => {
    try {
      console.log(
        "authAPI.login - Request URL:",
        `${import.meta.env.VITE_API_BASE_URL}/api/Auth/login`
      );
      console.log("authAPI.login - Request body:", credentials);

      // Đảm bảo format chính xác như API test tool
      const requestBody = {
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password,
      };

      console.log("authAPI.login - Cleaned request body:", requestBody);

      const response = await api.post("/api/Auth/login", requestBody);
      console.log("authAPI.login - Success response:", response.data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.log("authAPI.login - Error details:", error);
      console.log("authAPI.login - Error response:", error.response?.data);
      console.log("authAPI.login - Error status:", error.response?.status);

      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Đăng nhập thất bại",
      };
    }
  },

  // Đăng ký (nếu cần)
  register: async (userData) => {
    try {
      const response = await api.post("/api/Auth/register", userData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message || error.message || "Đăng ký thất bại",
      };
    }
  },

  // Đăng xuất
  logout: async () => {
    try {
      await api.post("/api/Auth/logout");
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Lấy thông tin user hiện tại
  getCurrentUser: async () => {
    try {
      console.log("authAPI.getCurrentUser - Calling /api/User/current...");
      const response = await api.get("/api/User/current");
      console.log("authAPI.getCurrentUser - Success response:", response.data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("authAPI.getCurrentUser - Error:", error);
      console.error("authAPI.getCurrentUser - Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });

      return {
        success: false,
        error: error.response?.data?.message || error.message,
        status: error.response?.status,
      };
    }
  },
};

export default api;
