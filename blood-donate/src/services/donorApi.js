const API_BASE_URL = 'http://localhost:7262/api';

// Generate UUID function
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// API request helper
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Get token from localStorage - check all possible key names  
  // Priority: userToken (used by authApi.js) first
  const token = localStorage.getItem('userToken') ||
                localStorage.getItem('token') || 
                localStorage.getItem('authToken') || 
                localStorage.getItem('accessToken') ||
                localStorage.getItem('user-token') ||
                localStorage.getItem('jwt') ||
                localStorage.getItem('bearerToken');
  
  // Debug: log token info
  console.log('Available localStorage keys:', Object.keys(localStorage));
  console.log('Found token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
  
  // Check if in demo mode
  const isDemo = token === 'demo-token';
  console.log('Demo mode:', isDemo);
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      // Don't send Authorization header for demo token to avoid 401
      ...(token && !isDemo && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  console.log(`Making ${config.method || 'GET'} request to:`, url);
  if (config.body) {
    console.log('Request body:', JSON.parse(config.body));
  }

  try {
    const response = await fetch(url, config);
    console.log('Response status:', response.status);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = await response.text();
        errorMessage = errorData || errorMessage;
      } catch (e) {
        console.error('Error reading response:', e);
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('API Response:', result);
    return result;
  } catch (error) {
    console.error('API request failed:', error);
    
    // Better error handling for common issues
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra server có đang chạy không?');
    } else if (error.name === 'TypeError' && error.message.includes('ERR_CONNECTION_REFUSED')) {
      throw new Error('Server từ chối kết nối. Vui lòng kiểm tra server có đang chạy trên port 7262 không?');
    } else if (error.message.includes('CORS')) {
      throw new Error('Lỗi CORS. Server cần cấu hình cho phép frontend truy cập.');
    } else if (error.message.includes('Token is missing') || error.message.includes('Unauthorized') || error.message.includes('User not logged in')) {
      // Debug info for token issues
      const currentToken = localStorage.getItem('userToken');
      const isDemo = currentToken === 'demo-token';
      
      console.log('Debug - Current token:', currentToken);
      console.log('Debug - Is demo mode:', isDemo);
      
      if (isDemo) {
        // Demo mode - create mock response instead of throwing error
        console.log('Demo mode detected - creating mock response');
        throw new Error('Demo mode: Tính năng này cần kết nối server thực để hoạt động.');
      } else {
        throw new Error('Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.');
      }
    }
    
    throw error;
  }
};

// Blood Donation API functions
export const donorApi = {
  // Register blood donation appointment
  registerBloodDonation: async (formData) => {
    try {
      // Check if in demo mode
      const currentToken = localStorage.getItem('userToken');
      const isDemo = currentToken === 'demo-token';
      
      if (isDemo) {
        // Demo mode - return mock success response
        console.log('Demo mode: Simulating successful blood donation registration');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
        
        return {
          success: true,
          donationId: generateUUID(),
          message: 'Đăng ký hiến máu thành công (Demo mode)',
          data: {
            fullName: formData.fullName,
            phone: formData.phone,
            email: formData.email,
            appointmentDate: formData.appointmentDate?.format('YYYY-MM-DD'),
            quantity: formData.quantity || 450,
            bloodType: formData.bloodType,
            status: formData.status || 'Pending',
            notes: formData.notes || '',
            createdAt: new Date().toISOString()
          }
        };
      }
      
      // Format data for API based on actual API structure
      const appointmentData = {
        donationId: generateUUID(),
        donorId: generateUUID(),
        requestId: generateUUID(),
        donationDate: formData.appointmentDate?.format('YYYY-MM-DD'),
        quantity: parseInt(formData.quantity) || 450,
        bloodType: formData.bloodType || "string",
        notes: formData.notes || "string",
        status: formData.status || "Pending",
        certificateId: generateUUID(),
        fullName: formData.fullName || "string",
        phoneNumber: formData.phone || "string",
        email: formData.email || "string",
        address: formData.address || "string",
        dateOfBirth: formData.dateOfBirth?.format('YYYY-MM-DD') || "2025-06-30",
        lastDonationDate: formData.lastDonation?.format('YYYY-MM-DD') || "2025-06-30",
        currentMedications: formData.currentMedications || "string",
        donorName: formData.fullName || "string",
        requestDescription: `Đăng ký hiến máu tại hệ thống. Số lượng: ${formData.quantity || 450}ml. Ghi chú: ${formData.notes || 'Không có'}`
      };

      return await apiRequest('/BloodDonation', {
        method: 'POST',
        body: JSON.stringify(appointmentData),
      });
    } catch (error) {
      // Check if demo mode for better error message
      const currentToken = localStorage.getItem('userToken');
      const isDemo = currentToken === 'demo-token';
      
      if (isDemo && error.message.includes('Demo mode')) {
        throw new Error('Demo mode: Tính năng đăng ký hiến máu sẽ hoạt động khi kết nối server thực.');
      }
      
      throw new Error(`Đăng ký hiến máu thất bại: ${error.message}`);
    }
  },

  // Get blood donation appointments
  getBloodDonations: async () => {
    try {
      return await apiRequest('/BloodDonation');
    } catch (error) {
      throw new Error(`Lấy danh sách lịch hẹn thất bại: ${error.message}`);
    }
  },

  // Get blood donation by ID
  getBloodDonationById: async (id) => {
    try {
      return await apiRequest(`/BloodDonation/${id}`);
    } catch (error) {
      throw new Error(`Lấy thông tin lịch hẹn thất bại: ${error.message}`);
    }
  },

  // Update blood donation status
  updateBloodDonationStatus: async (id, status) => {
    try {
      return await apiRequest(`/BloodDonation/${id}/status/${status}`, {
        method: 'PATCH',
      });
    } catch (error) {
      throw new Error(`Cập nhật trạng thái thất bại: ${error.message}`);
    }
  },

  // Delete blood donation appointment
  deleteBloodDonation: async (id) => {
    try {
      return await apiRequest(`/BloodDonation/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw new Error(`Xóa lịch hẹn thất bại: ${error.message}`);
    }
  },

  // Sync blood donations (if there's a sync endpoint)
  syncBloodDonations: async () => {
    try {
      return await apiRequest('/BloodDonation/sync', {
        method: 'POST',
      });
    } catch (error) {
      throw new Error(`Đồng bộ dữ liệu thất bại: ${error.message}`);
    }
  },

  // Get donor statistics
  getDonorStatistics: async (donorId) => {
    try {
      return await apiRequest(`/BloodDonation/donor/${donorId}/statistics`);
    } catch (error) {
      throw new Error(`Lấy thống kê thất bại: ${error.message}`);
    }
  },
};

export default donorApi; 