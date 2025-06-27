import axios from 'axios';

// Base URL cho API - có thể cấu hình trong file .env
// Vite sử dụng import.meta.env thay vì process.env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7262';

// Tạo axios instance với cấu hình mặc định
const userApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm token vào header
userApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý response và error
userApi.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API Error:', error);
    
    // Xử lý lỗi 401 (Unauthorized) - nhưng không redirect nếu là demo token
    if (error.response?.status === 401) {
      const token = localStorage.getItem('userToken');
      if (token !== 'demo-token') {
        localStorage.removeItem('userToken');
        localStorage.removeItem('username');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// User API methods
export const UserAPI = {
  // Lấy tất cả user
  getAllUsers: () => {
    return userApi.get('/api/User/Get-All-User');
  },

  // Lấy user theo role
  getUsersByRole: (role) => {
    return userApi.get(`/api/User/Get-User-By-Role/${role}`);
  },

  // Tìm kiếm user theo tên
  searchUserByName: (name) => {
    return userApi.get('/api/User/Search-User-By-Name', {
      params: { name }
    });
  },

  // Cập nhật thông tin user
  updateUser: (id, userData) => {
    return userApi.put(`/api/User/Update-User/${id}`, userData);
  },

  // Lấy chi tiết user theo ID
  getUserDetail: (id) => {
    return userApi.get(`/api/User/Get-User-Detail/${id}`);
  },

  // Lấy thông tin user hiện tại (dựa vào userID trong localStorage)
  getCurrentUser: async () => {
    console.log('UserAPI.getCurrentUser called');
    
    // Check if this is a demo account
    const token = localStorage.getItem('userToken');
    if (token === 'demo-token') {
      console.log('Demo token detected, cannot call real API');
      throw new Error('Demo account - API not available');
    }
    
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    
    console.log('Current localStorage values:', { userId, username });
    
    try {
      if (userId) {
        console.log('Fetching user by ID:', userId);
        // Nếu có userId, lấy chi tiết user theo ID
        const response = await userApi.get(`/api/User/Get-User-Detail/${userId}`);
        console.log('User detail response:', response);
        return response;
      } else if (username) {
        console.log('Fetching user by username:', username);
        // Nếu không có userId, tìm theo username
        const response = await userApi.get('/api/User/Search-User-By-Name', {
          params: { name: username }
        });
        console.log('Search user response:', response);
        
        // Nếu tìm thấy user, lưu userId vào localStorage
        if (response && response.userID) {
          localStorage.setItem('userId', response.userID);
          console.log('Saved userId to localStorage:', response.userID);
        }
        return response;
      } else {
        console.log('No userId or username found in localStorage');
        throw new Error('No user information found in localStorage');
      }
    } catch (error) {
      console.error('getCurrentUser error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  },

  // Lấy thông tin Donor cho Member (nếu có)
  getDonorInfo: async (userId) => {
    console.log('UserAPI.getDonorInfo called with userId:', userId);
    try {
      const response = await userApi.get(`/api/Donor/Get-Donor-By-UserID/${userId}`);
      console.log('Donor info response:', response);
      return response;
    } catch (error) {
      console.log('No donor info found for user:', error);
      return null; // Không phải lỗi, chỉ là user chưa đăng ký làm donor
    }
  },

  // Lấy thông tin BloodType
  getBloodTypes: async () => {
    try {
      const response = await userApi.get('/api/BloodType/Get-All-BloodType');
      return response;
    } catch (error) {
      console.log('Error fetching blood types:', error);
      return [];
    }
  }
};

export default userApi;
