import axios from 'axios';

// Tạo axios instance với base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:7262',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor để thêm token nếu có
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('userToken');
    if (token && token !== 'demo-token') {
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
    if (error.response?.status === 401) {
      // Token hết hạn, xóa localStorage và redirect
      localStorage.removeItem('userToken');
      localStorage.removeItem('userRole');
      localStorage.removeItem('username');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  // Đăng nhập
  login: async (credentials) => {
    try {
      console.log('authAPI.login - Request URL:', `${import.meta.env.VITE_API_BASE_URL}/api/Auth/login`);
      console.log('authAPI.login - Request body:', credentials);
      
      // Đảm bảo format chính xác như API test tool
      const requestBody = {
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password
      };
      
      console.log('authAPI.login - Cleaned request body:', requestBody);
      
      const response = await api.post('/api/Auth/login', requestBody);
      console.log('authAPI.login - Success response:', response.data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.log('authAPI.login - Error details:', error);
      console.log('authAPI.login - Error response:', error.response?.data);
      console.log('authAPI.login - Error status:', error.response?.status);
      
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Đăng nhập thất bại'
      };
    }
  },

  // Đăng ký (nếu cần)
  register: async (userData) => {
    try {
      const response = await api.post('/api/Auth/register', userData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Đăng ký thất bại'
      };
    }
  },

  // Đăng xuất
  logout: async () => {
    try {
      await api.post('/api/Auth/logout');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Lấy thông tin user hiện tại
  getCurrentUser: async () => {
    try {
      console.log('authAPI.getCurrentUser - Calling /api/User/current...');
      const response = await api.get('/api/User/current');
      console.log('authAPI.getCurrentUser - Success response:', response.data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('authAPI.getCurrentUser - Error:', error);
      console.error('authAPI.getCurrentUser - Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        status: error.response?.status
      };
    }
  }
};

export default api; 