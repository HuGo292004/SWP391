// Member User API Service
// Uses Get-All-User and Get-User-By-Role endpoints that might work for Members

import axios from 'axios';

const API_BASE_URL = 'http://localhost:7262/api';

// Get user information using Get-All-User endpoint
const getUserFromAllUsers = async () => {
  const token = localStorage.getItem('userToken');
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');
  
  if (!token || token === 'demo-token') {
    throw new Error('No valid token available');
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  try {
    const response = await axios.get(`${API_BASE_URL}/User/Get-All-User`, { headers });
    
    if (Array.isArray(response.data) && response.data.length > 0) {
      // Find current user in the list
      const currentUser = response.data.find(user => 
        user.userID === userId || 
        user.userId === userId ||
        user.username === username ||
        user.Username === username
      );
      
      if (currentUser) {
        return {
          success: true,
          source: 'Get-All-User',
          data: currentUser
        };
      } else {
        return {
          success: false,
          message: 'User not found in list',
          source: 'Get-All-User'
        };
      }
    } else {
      return {
        success: false,
        message: 'No users data received',
        source: 'Get-All-User'
      };
    }
  } catch (error) {
    throw error;
  }
};

// Get user information using Get-User-By-Role endpoint
const getUserFromMemberRole = async () => {
  const token = localStorage.getItem('userToken');
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');
  
  if (!token || token === 'demo-token') {
    throw new Error('No valid token available');
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  try {
    const response = await axios.get(`${API_BASE_URL}/User/Get-User-By-Role/Member`, { headers });
    
    if (Array.isArray(response.data) && response.data.length > 0) {
      // Find current user in the member list
      const currentUser = response.data.find(user => 
        user.userID === userId || 
        user.userId === userId ||
        user.username === username ||
        user.Username === username
      );
      
      if (currentUser) {
        return {
          success: true,
          source: 'Get-User-By-Role/Member',
          data: currentUser
        };
      } else {
        return {
          success: false,
          message: 'User not found in member list',
          source: 'Get-User-By-Role/Member'
        };
      }
    } else {
      return {
        success: false,
        message: 'No member data received',
        source: 'Get-User-By-Role/Member'
      };
    }
  } catch (error) {
    throw error;
  }
};

// Format user data from API response
const formatUserData = (userData, source) => {
  if (!userData) return null;
  
  // Handle different field name variations
  const formatted = {
    userID: userData.userID || userData.userId || userData.id,
    userId: userData.userID || userData.userId || userData.id,
    username: userData.username || userData.Username,
    email: userData.email || userData.Email,
    
    // Try different case variations for names
    fullName: userData.fullName || userData.FullName || userData.displayName || userData.DisplayName,
    
    // Try different case variations for phone
    phone: userData.phone || userData.phoneNumber || userData.PhoneNumber || userData.Phone,
    
    // Try different case variations for ID card
    userIdCard: userData.userIdCard || userData.IdCard || userData.UserIdCard || userData.idCard,
    
    // Try different case variations for date of birth
    dateOfBirth: userData.dateOfBirth || userData.DateOfBirth,
    
    // Role info
    role: userData.role || userData.Role || 'Member',
    
    // Additional info
    address: userData.address || userData.Address,
    gender: userData.gender || userData.Gender,
    avatar: userData.avatar || userData.Avatar,
    
    // Metadata
    dataSource: source,
    lastUpdated: new Date().toISOString()
  };
  
  // Clean up undefined values
  Object.keys(formatted).forEach(key => {
    if (formatted[key] === undefined || formatted[key] === null) {
      delete formatted[key];
    }
  });
  
  return formatted;
};

export const MemberUserAPI = {
  // Get current user information for Member
  getCurrentUser: async () => {
    const attempts = [
      { name: 'Get-User-By-Role/Member', func: getUserFromMemberRole },
      { name: 'Get-All-User', func: getUserFromAllUsers }
    ];
    
    for (const attempt of attempts) {
      try {
        const result = await attempt.func();
        
        if (result.success && result.data) {
          const formatted = formatUserData(result.data, result.source);
          return formatted;
        }
      } catch (error) {
        // Check if it's specifically a 403 error
        if (error.response?.status === 403) {
          continue;
        }
        
        // For other errors, continue to next method
        continue;
      }
    }
    
    // If all methods failed
    throw new Error('All user data retrieval methods failed for Member');
  },

  // Update user information using PUT endpoint
  updateUser: async (userId, userData) => {
    const token = localStorage.getItem('userToken');
    
    if (!token || token === 'demo-token') {
      throw new Error('No valid token available');
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    try {
      const response = await axios.put(`${API_BASE_URL}/User/Update-User/${userId}`, userData, { headers });
      
      return {
        success: true,
        data: response.data,
        source: 'Update-User API',
        message: 'Cập nhật thông tin thành công'
      };
    } catch (error) {
      
      if (error.response?.status === 403) {
        throw new Error('Không có quyền cập nhật thông tin người dùng');
      } else if (error.response?.status === 404) {
        throw new Error('Không tìm thấy người dùng');
      } else {
        throw new Error(`Cập nhật thất bại: ${error.message}`);
      }
    }
  },


};



export default MemberUserAPI; 