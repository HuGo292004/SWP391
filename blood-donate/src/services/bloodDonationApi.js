// Blood Donation API Service
const BASE_URL = 'http://localhost:7262/api';

// Helper function to get auth token
const getAuthToken = () => {
  // Try different possible storage locations for auth token
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

export const bloodDonationApi = {
  // GET /api/BloodDonation - Lấy tất cả đơn hiến máu
  getAllBloodDonations: async () => {
    try {
      const response = await fetch(`${BASE_URL}/BloodDonation`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching blood donations:', error);
      throw error;
    }
  },

  // GET /api/BloodDonation/{id} - Lấy chi tiết đơn hiến máu
  getBloodDonationById: async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/BloodDonation/${id}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching blood donation by ID:', error);
      throw error;
    }
  },

  // GET /api/BloodDonation/donor/{donorId} - Lấy đơn hiến máu theo donor
  getBloodDonationsByDonor: async (donorId) => {
    try {
      const response = await fetch(`${BASE_URL}/BloodDonation/donor/${donorId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching blood donations by donor:', error);
      throw error;
    }
  },

  // POST /api/BloodDonation - Tạo đơn hiến máu mới
  createBloodDonation: async (bloodDonationData) => {
    try {
      const response = await fetch(`${BASE_URL}/BloodDonation`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(bloodDonationData)
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error creating blood donation:', error);
      throw error;
    }
  },

  // PUT /api/BloodDonation/{id} - Cập nhật đơn hiến máu
  updateBloodDonation: async (id, bloodDonationData) => {
    try {
      const response = await fetch(`${BASE_URL}/BloodDonation/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(bloodDonationData)
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error updating blood donation:', error);
      throw error;
    }
  },

  // DELETE /api/BloodDonation/{id} - Xóa đơn hiến máu
  deleteBloodDonation: async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/BloodDonation/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error deleting blood donation:', error);
      throw error;
    }
  },

  // PATCH /api/BloodDonation/{id}/status/{status} - Cập nhật trạng thái
  updateBloodDonationStatus: async (id, status) => {
    try {
      const response = await fetch(`${BASE_URL}/BloodDonation/${id}/status/${status}`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error updating blood donation status:', error);
      throw error;
    }
  },

  // POST /api/BloodDonation/approve-blood-donation - Duyệt đơn hiến máu
  approveBloodDonation: async (approvalData) => {
    try {
      const response = await fetch(`${BASE_URL}/BloodDonation/approve-blood-donation`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(approvalData)
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error approving blood donation:', error);
      throw error;
    }
  },

  // POST /api/BloodDonation/reject-blood-donation - Từ chối đơn hiến máu
  rejectBloodDonation: async (rejectionData) => {
    try {
      const response = await fetch(`${BASE_URL}/BloodDonation/reject-blood-donation`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(rejectionData)
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error rejecting blood donation:', error);
      throw error;
    }
  },

  // POST /api/BloodDonation/sync - Đồng bộ dữ liệu
  syncBloodDonations: async () => {
    try {
      const response = await fetch(`${BASE_URL}/BloodDonation/sync`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error syncing blood donations:', error);
      throw error;
    }
  }
};

export default bloodDonationApi;
