const API_BASE_URL = 'http://localhost:7262/api';

// API request helper
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Get token from localStorage
  const token = localStorage.getItem('userToken') ||
                localStorage.getItem('token') || 
                localStorage.getItem('authToken') || 
                localStorage.getItem('accessToken');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && token !== 'demo-token' && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  console.log(`Making ${config.method || 'GET'} request to:`, url);

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error (${response.status}):`, errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('API Response:', data);
    return data;
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
};

// Blood Management API functions
export const bloodManagementApi = {
  // Get all blood types
  getBloodTypes: async () => {
    try {
      return await apiRequest('/BloodManagement/Get-Blood-types');
    } catch (error) {
      console.error('Error getting blood types:', error);
      throw new Error(`Không thể tải danh sách nhóm máu: ${error.message}`);
    }
  },

  // Get specific blood type by ID
  getBloodTypeById: async (id) => {
    try {
      return await apiRequest(`/BloodManagement/Get-blood-types/${id}`);
    } catch (error) {
      console.error('Error getting blood type by ID:', error);
      throw new Error(`Không thể tải thông tin nhóm máu: ${error.message}`);
    }
  },

  // Get all blood components
  getBloodComponents: async () => {
    try {
      return await apiRequest('/BloodManagement/Get-blood-components');
    } catch (error) {
      console.error('Error getting blood components:', error);
      throw new Error(`Không thể tải danh sách thành phần máu: ${error.message}`);
    }
  },

  // Get specific blood component by ID
  getBloodComponentById: async (id) => {
    try {
      return await apiRequest(`/BloodManagement/Get-blood-components/${id}`);
    } catch (error) {
      console.error('Error getting blood component by ID:', error);
      throw new Error(`Không thể tải thông tin thành phần máu: ${error.message}`);
    }
  },

  // Get blood type compatibility
  getBloodTypeCompatibility: async (bloodType) => {
    try {
      return await apiRequest(`/BloodManagement/Get-blood-type-Compatibility/${bloodType}`);
    } catch (error) {
      console.error('Error getting blood type compatibility:', error);
      throw new Error(`Không thể tải thông tin tương thích nhóm máu: ${error.message}`);
    }
  },

  // Get component compatibility
  getComponentCompatibility: async (componentType) => {
    try {
      return await apiRequest(`/BloodManagement/Get-component-Compatibility/${componentType}`);
    } catch (error) {
      console.error('Error getting component compatibility:', error);
      throw new Error(`Không thể tải thông tin tương thích thành phần: ${error.message}`);
    }
  }
};
