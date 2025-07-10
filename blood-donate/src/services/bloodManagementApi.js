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

    // Check if response has content
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      if (!text.trim()) {
        return {}; // Return empty object for empty responses
      }
      throw new Error('Response is not valid JSON');
    }

    const text = await response.text();
    if (!text.trim()) {
      return {}; // Return empty object for empty responses
    }

    const data = JSON.parse(text);
    console.log('API Response:', data);
    return data;
  } catch (error) {
    console.error('API Request failed:', error);
    if (error.name === 'SyntaxError' && error.message.includes('JSON')) {
      throw new Error('Server trả về dữ liệu không hợp lệ');
    }
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
  },

  // Blood Unit Management API functions
  // Get all blood units
  getAllBloodUnits: async () => {
    try {
      return await apiRequest('/BloodUnit/Get-All-BloodUnit');
    } catch (error) {
      console.error('Error getting all blood units:', error);
      throw new Error(`Không thể tải danh sách đơn vị máu: ${error.message}`);
    }
  },

  // Get blood unit by ID
  getBloodUnitById: async (id) => {
    try {
      return await apiRequest(`/BloodUnit/Get-BloodUnit-By-id/${id}`);
    } catch (error) {
      console.error('Error getting blood unit by ID:', error);
      throw new Error(`Không thể tải thông tin đơn vị máu: ${error.message}`);
    }
  },

  // Get blood units by blood type
  getBloodUnitsByBloodType: async (bloodTypeId) => {
    try {
      return await apiRequest(`/BloodUnit/Get-BloodUnit-by-blood-type/${bloodTypeId}`);
    } catch (error) {
      console.error('Error getting blood units by blood type:', error);
      throw new Error(`Không thể tải đơn vị máu theo nhóm máu: ${error.message}`);
    }
  },

  // Get blood units by component
  getBloodUnitsByComponent: async (componentId) => {
    try {
      return await apiRequest(`/BloodUnit/Get-BloodUnit-by-component/${componentId}`);
    } catch (error) {
      console.error('Error getting blood units by component:', error);
      throw new Error(`Không thể tải đơn vị máu theo thành phần: ${error.message}`);
    }
  },

  // Get blood units by status
  getBloodUnitsByStatus: async (status) => {
    try {
      return await apiRequest(`/BloodUnit/Get-BloodUnit-by-status/${status}`);
    } catch (error) {
      console.error('Error getting blood units by status:', error);
      throw new Error(`Không thể tải đơn vị máu theo trạng thái: ${error.message}`);
    }
  },

  // Get expired blood units
  getExpiredBloodUnits: async () => {
    try {
      return await apiRequest('/BloodUnit/Get-BloodUnit-expired');
    } catch (error) {
      console.error('Error getting expired blood units:', error);
      throw new Error(`Không thể tải đơn vị máu hết hạn: ${error.message}`);
    }
  },

  // Update blood unit
  updateBloodUnit: async (id, bloodUnitData) => {
    try {
      return await apiRequest(`/BloodUnit/Update-Blood-Unit/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(bloodUnitData),
      });
    } catch (error) {
      console.error('Error updating blood unit:', error);
      throw new Error(`Không thể cập nhật đơn vị máu: ${error.message}`);
    }
  },

  // Create new blood unit (if endpoint exists)
  createBloodUnit: async (bloodUnitData) => {
    try {
      return await apiRequest('/BloodUnit/Create-Blood-Unit', {
        method: 'POST',
        body: JSON.stringify(bloodUnitData),
      });
    } catch (error) {
      console.error('Error creating blood unit:', error);
      throw new Error(`Không thể tạo đơn vị máu: ${error.message}`);
    }
  }
};
