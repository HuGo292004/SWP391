// Dashboard API Service
const API_BASE_URL = 'http://localhost:7262/api';

// Helper function to get auth token
const getAuthToken = () => {
  return (
    localStorage.getItem('userToken') ||
    localStorage.getItem('token') ||
    localStorage.getItem('authToken') ||
    localStorage.getItem('accessToken') ||
    sessionStorage.getItem('userToken') ||
    sessionStorage.getItem('token') ||
    sessionStorage.getItem('authToken') ||
    sessionStorage.getItem('accessToken')
  );
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (token && token !== 'demo-token') {
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
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }

  return await response.text();
};

// Dashboard API endpoints
export const dashboardApi = {
  // GET /api/Dashboard/blood-inventory - Lấy thông tin kho máu
  getBloodInventory: async () => {
    try {
      console.log('Fetching blood inventory dashboard data...');
      const response = await fetch(`${API_BASE_URL}/Dashboard/blood-inventory`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await handleResponse(response);
      console.log('Blood inventory data received:', data);
      return data;
    } catch (error) {
      console.error('Error fetching blood inventory:', error);
      throw error; // Re-throw error instead of returning mock data
    }
  },

  // GET /api/Dashboard/donation-stats - Lấy thống kê hiến máu
  getDonationStats: async () => {
    try {
      console.log('Fetching donation statistics...');
      const response = await fetch(`${API_BASE_URL}/Dashboard/donation-stats`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await handleResponse(response);
      console.log('Donation stats data received:', data);
      return data;
    } catch (error) {
      console.error('Error fetching donation stats:', error);
      throw error; // Re-throw error instead of returning mock data
    }
  },

  // GET /api/Dashboard/request-stats - Lấy thống kê yêu cầu máu
  getRequestStats: async () => {
    try {
      console.log('Fetching request statistics...');
      const response = await fetch(`${API_BASE_URL}/Dashboard/request-stats`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await handleResponse(response);
      console.log('Request stats data received:', data);
      return data;
    } catch (error) {
      console.error('Error fetching request stats:', error);
      throw error; // Re-throw error instead of returning mock data
    }
  },

  // GET /api/Dashboard/donor-stats - Lấy thống kê người hiến máu
  getDonorStats: async () => {
    try {
      console.log('Fetching donor statistics...');
      const response = await fetch(`${API_BASE_URL}/Dashboard/donor-stats`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await handleResponse(response);
      console.log('Donor stats data received:', data);
      return data;
    } catch (error) {
      console.error('Error fetching donor stats:', error);
      throw error; // Re-throw error instead of returning mock data
    }
  },

  // GET /api/Dashboard/summary - Lấy tổng quan hệ thống
  getSummary: async () => {
    try {
      console.log('Fetching dashboard summary...');
      const response = await fetch(`${API_BASE_URL}/Dashboard/summary`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await handleResponse(response);
      console.log('Summary data received:', data);
      return data;
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      throw error; // Re-throw error instead of returning mock data
    }
  },

  // Lấy tất cả dữ liệu dashboard cùng lúc
  getAllDashboardData: async () => {
    try {
      console.log('Fetching all dashboard data...');
      const [bloodInventory, donationStats, requestStats, donorStats, summary] = await Promise.all([
        dashboardApi.getBloodInventory(),
        dashboardApi.getDonationStats(),
        dashboardApi.getRequestStats(),
        dashboardApi.getDonorStats(),
        dashboardApi.getSummary()
      ]);

      return {
        bloodInventory,
        donationStats,
        requestStats,
        donorStats,
        summary
      };
    } catch (error) {
      console.error('Error fetching all dashboard data:', error);
      throw error;
    }
  }
};

export default dashboardApi;
