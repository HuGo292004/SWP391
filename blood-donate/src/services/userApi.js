import axios from 'axios';
import { authAPI } from './authApi';
import { MemberUserAPI } from './memberUserApi';

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
  updateUser: async (id, userData) => {
    const userRole = localStorage.getItem('userRole');
    
    // For Member role, use MemberUserAPI
    if (userRole === 'Member') {
      console.log('Member: Using MemberUserAPI for update...');
      return await MemberUserAPI.updateUser(id, userData);
    } else {
      // For Staff/Admin, use standard API call
      try {
        console.log('Staff/Admin: Attempting API update...');
        const response = await userApi.put(`/api/User/Update-User/${id}`, userData);
        console.log('Staff/Admin profile updated via API successfully:', response);
        return response;
      } catch (error) {
        console.log('Staff/Admin API update failed:', error);
        throw error;
      }
    }
  },



  // Lấy chi tiết user theo ID
  getUserDetail: (id) => {
    return userApi.get(`/api/User/Get-User-Detail/${id}`);
  },

  // Helper function to decode JWT token
  decodeJWTToken: (token) => {
    try {
      if (!token || token === 'demo-token') return null;
      
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding JWT token:', error);
      return null;
    }
  },

  // Extract user info from JWT token
  getUserInfoFromToken: (token) => {
    const payload = UserAPI.decodeJWTToken(token);
    if (!payload) return null;

    console.log('JWT payload extracted:', payload);

    return {
      userID: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || '',
      userId: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || '',
      username: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || '',
      email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || '',
      fullName: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || '', // Fallback to username for fullName
      role: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'Member',
      phone: '', // Not available in JWT
      userIdCard: '', // Not available in JWT
      dateOfBirth: null, // Not available in JWT
      avatar: null
    };
  },

  // Lấy thông tin user hiện tại (dựa vào token hoặc userID trong localStorage)
  getCurrentUser: async () => {
    console.log('UserAPI.getCurrentUser called');
    
    // Check if this is a demo account
    const token = localStorage.getItem('userToken');
    if (token === 'demo-token') {
      console.log('Demo token detected, cannot call real API');
      throw new Error('Demo account - API not available');
    }
    
    const userRole = localStorage.getItem('userRole');
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    
    console.log('Current localStorage values:', { userRole, userId, username });
    
    // Extract userId from JWT token for later use
    let extractedUserId = userId;
    if (token && !extractedUserId) {
      const tokenUserInfo = UserAPI.getUserInfoFromToken(token);
      if (tokenUserInfo && tokenUserInfo.userId) {
        extractedUserId = tokenUserInfo.userId;
        localStorage.setItem('userId', extractedUserId);
        console.log('Extracted and saved userId from JWT token:', extractedUserId);
      }
    }
    
    try {
      // Try the correct API endpoint: /api/User/current for all users
      console.log('Trying /api/User/current endpoint...');
      const response = await userApi.get('/api/User/current');
      
      if (response) {
        console.log('Successfully got user data from /api/User/current:', response);
        
        // Save userID if we got it from response
        const responseUserId = response.userID || response.userId;
        if (responseUserId && !extractedUserId) {
          localStorage.setItem('userId', responseUserId);
          console.log('Saved userId to localStorage from API response:', responseUserId);
          extractedUserId = responseUserId;
        }
        
        // Format the response to match our expected structure
        const formattedResponse = {
          userID: response.userID || response.userId || extractedUserId,
          userId: response.userID || response.userId || extractedUserId,
          username: response.username,
          email: response.email,
          fullName: response.fullName || response.username, // Prioritize fullName but fallback to username
          phone: response.phone || '',
          userIdCard: response.userIdCard || '',
          dateOfBirth: response.dateOfBirth,
          role: response.role,
          avatar: response.avatar || null
        };
        
        console.log('Using /api/User/current data:', formattedResponse);
        return formattedResponse;
      } else {
        console.log('/api/User/current returned empty response');
        throw new Error('Empty response from /api/User/current');
      }
    } catch (apiError) {
      console.log('/api/User/current failed, error:', apiError);
      
      // First fallback: Try Get-User-Detail only for Staff/Admin (Member doesn't have permission)
      if (extractedUserId && userRole && (userRole === 'Staff' || userRole === 'Admin')) {
        try {
          console.log(`Staff/Admin: Trying /api/User/Get-User-Detail/${extractedUserId} as fallback...`);
          const response = await userApi.get(`/api/User/Get-User-Detail/${extractedUserId}`);
          console.log('User detail fallback successful for Staff/Admin:', response);
          
          // Format response to match expected structure
          const formattedResponse = {
            userID: response.userID || response.userId || extractedUserId,
            userId: response.userID || response.userId || extractedUserId,
            username: response.username,
            email: response.email,
            fullName: response.fullName || response.username,
            phone: response.phone || '',
            userIdCard: response.userIdCard || '',
            dateOfBirth: response.dateOfBirth,
            role: response.role,
            avatar: response.avatar || null
          };
          
          console.log('Staff/Admin: Using Get-User-Detail data:', formattedResponse);
          return formattedResponse;
        } catch (detailError) {
          console.log('Staff/Admin: User detail fallback also failed:', detailError);
        }
      }
      
      // Second fallback: For Member role, use MemberUserAPI
      if (userRole === 'Member' && token) {
        console.log('Member role: Using MemberUserAPI...');
        
        try {
          const memberApiData = await MemberUserAPI.getCurrentUser();
          if (memberApiData) {
            console.log('✅ Using MemberUserAPI data for Member:', memberApiData);
            return memberApiData;
          }
        } catch (memberApiError) {
          console.log('MemberUserAPI failed, falling back to JWT token:', memberApiError);
          
          // Final JWT token fallback
          const tokenUserInfo = UserAPI.getUserInfoFromToken(token);
          if (tokenUserInfo) {
            console.log('Using JWT token fallback for Member:', tokenUserInfo);
            return tokenUserInfo;
          }
        }
      }
      
      // Third fallback: Try search by username for Staff/Admin
      if (username && (userRole === 'Staff' || userRole === 'Admin')) {
        try {
          console.log('Trying search by username fallback for Staff/Admin:', username);
          const response = await userApi.get('/api/User/Search-User-By-Name', {
            params: { name: username }
          });
          console.log('Search user response:', response);
          
          // Save userID if found
          if (response && response.userID) {
            localStorage.setItem('userId', response.userID);
            console.log('Saved userId to localStorage:', response.userID);
          }
          return response;
        } catch (searchError) {
          console.error('Search by username fallback failed:', searchError);
        }
      }
      
      // Final fallback: create basic user info from localStorage and JWT token
      console.log('All API methods failed, creating fallback user info...');
      
      // Try to get info from JWT token as last resort
      let jwtUserInfo = null;
      if (token) {
        jwtUserInfo = UserAPI.getUserInfoFromToken(token);
        console.log('JWT fallback info:', jwtUserInfo);
      }
      
      const fallbackUserInfo = {
        userID: extractedUserId || jwtUserInfo?.userId || 'unknown',
        userId: extractedUserId || jwtUserInfo?.userId || 'unknown',
        username: jwtUserInfo?.username || username || 'unknown',
        email: jwtUserInfo?.email || localStorage.getItem('userEmail') || '',
        fullName: jwtUserInfo?.fullName || jwtUserInfo?.username || username || 'Người dùng',
        role: jwtUserInfo?.role || userRole || 'Member',
        phone: '',
        userIdCard: '',
        dateOfBirth: null,
        avatar: null
      };
      
      console.log('Using fallback user info:', fallbackUserInfo);
      return fallbackUserInfo;
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
