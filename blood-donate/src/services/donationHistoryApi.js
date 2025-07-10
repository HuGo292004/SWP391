// Donation History API Service
const BASE_URL = 'http://localhost:7262/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('userToken') || 
         localStorage.getItem('token') || 
         localStorage.getItem('authToken') ||
         localStorage.getItem('accessToken') ||
         sessionStorage.getItem('userToken') ||
         sessionStorage.getItem('token') ||
         sessionStorage.getItem('authToken') ||
         sessionStorage.getItem('accessToken');
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    }
    const errorData = await response.text();
    throw new Error(errorData || `HTTP error! status: ${response.status}`);
  }
  
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  return await response.text();
};

export const donationHistoryApi = {
  // GET /api/DonationHistory - Lấy tất cả lịch sử hiến máu
  getAllDonationHistory: async () => {
    try {
      const response = await fetch(`${BASE_URL}/DonationHistory`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching donation history:', error);
      throw error;
    }
  },

  // GET /api/DonationHistory/{id} - Lấy chi tiết lịch sử hiến máu theo ID
  getDonationHistoryById: async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/DonationHistory/${id}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching donation history by ID:', error);
      throw error;
    }
  },

  // GET /api/DonationHistory/donor/{donorId} - Lấy lịch sử hiến máu theo donor
  getDonationHistoryByDonor: async (donorId) => {
    try {
      const response = await fetch(`${BASE_URL}/DonationHistory/donor/${donorId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching donation history by donor:', error);
      throw error;
    }
  },

  // POST /api/DonationHistory - Tạo lịch sử hiến máu mới
  createDonationHistory: async (historyData) => {
    try {
      const response = await fetch(`${BASE_URL}/DonationHistory`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(historyData)
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error creating donation history:', error);
      throw error;
    }
  },

  // PUT /api/DonationHistory/{id} - Cập nhật lịch sử hiến máu
  updateDonationHistory: async (id, historyData) => {
    try {
      const response = await fetch(`${BASE_URL}/DonationHistory/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(historyData)
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error updating donation history:', error);
      throw error;
    }
  },

  // DELETE /api/DonationHistory/{id} - Xóa lịch sử hiến máu
  deleteDonationHistory: async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/DonationHistory/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error deleting donation history:', error);
      throw error;
    }
  }
};

export default donationHistoryApi; 