// Emergency Request API - Production Version
// Handles emergency blood requests, user search, and authentication
const API_BASE_URL = 'http://localhost:7262/api';

// Get auth token for API requests
export const refreshAuthToken = async () => {
  try {
    const testCredentials = {
      email: 'staff@gmail.com',
      password: 'staff123'
    };
    
    const response = await fetch(`${API_BASE_URL}/Auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testCredentials)
    });
    
    if (response.ok) {
      const responseText = await response.text();
      if (!responseText || responseText.trim() === '') {
        return null;
      }
      
      try {
        const data = JSON.parse(responseText);
        
        if (data.token) {
          const allTokenKeys = ['userToken', 'token', 'authToken', 'jwtToken', 'accessToken', 'auth_token'];
          allTokenKeys.forEach(key => {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
          });
          
          localStorage.setItem('userToken', data.token);
          
          try {
            const payload = JSON.parse(atob(data.token.split('.')[1]));
            const userRole = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'Staff';
            const username = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || testCredentials.email;
            
            localStorage.setItem('userRole', userRole);
            localStorage.setItem('username', username);
            localStorage.setItem('userEmail', testCredentials.email);
          } catch (e) {
            // Silent fail for token decode
          }
          
          return data.token;
        }
      } catch (jsonError) {
        return null;
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
};

// Get auth token from localStorage or sessionStorage
const getAuthToken = () => {
  const tokenKeys = ['userToken', 'token', 'authToken', 'jwtToken', 'accessToken'];
  
  // Check localStorage first
  for (const key of tokenKeys) {
    const token = localStorage.getItem(key);
    if (token && token.startsWith('eyJ') && token.length > 100) {
      return token;
    }
  }
  
  // Check sessionStorage as fallback
  for (const key of tokenKeys) {
    const token = sessionStorage.getItem(key);
    if (token && token.startsWith('eyJ') && token.length > 100) {
      return token;
    }
  }
  
  return '';
};

// Decode JWT token to check if it's valid and not expired
const isTokenValid = (token) => {
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    if (payload.exp && payload.exp < currentTime) {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
};

// Common headers with auth
const getHeaders = () => {
  const token = getAuthToken();
  const tokenValid = isTokenValid(token);
  
  return {
    'Content-Type': 'application/json',
    ...(token && tokenValid && { 'Authorization': `Bearer ${token}` })
  };
};

// Clean up old tokens and keep only the valid one
export const cleanupTokens = () => {
  const allTokenKeys = ['userToken', 'token', 'authToken', 'jwtToken', 'accessToken', 'auth_token'];
  const validTokens = [];
  
  allTokenKeys.forEach(key => {
    const localToken = localStorage.getItem(key);
    const sessionToken = sessionStorage.getItem(key);
    
    if (localToken && localToken.startsWith('eyJ') && isTokenValid(localToken)) {
      validTokens.push({ key, token: localToken, storage: 'localStorage' });
    }
    if (sessionToken && sessionToken.startsWith('eyJ') && isTokenValid(sessionToken)) {
      validTokens.push({ key, token: sessionToken, storage: 'sessionStorage' });
    }
  });
  
  if (validTokens.length > 0) {
    const bestToken = validTokens[0];
    
    allTokenKeys.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    
    localStorage.setItem('userToken', bestToken.token);
    return bestToken.token;
  } else {
    allTokenKeys.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    
    return null;
  }
};

// Blood Type ID mapping
const BLOOD_TYPE_IDS = {
  'A+': '11111111-1111-1111-1111-111111111001',
  'A-': '11111111-1111-1111-1111-111111111002',
  'B+': '11111111-1111-1111-1111-111111111003',
  'B-': '11111111-1111-1111-1111-111111111004',
  'AB+': '11111111-1111-1111-1111-111111111005',
  'AB-': '11111111-1111-1111-1111-111111111006',
  'O+': '11111111-1111-1111-1111-111111111007',
  'O-': '11111111-1111-1111-1111-111111111008'
};

// Get blood type ID from display name
export const getBloodTypeId = (bloodType) => {
  return BLOOD_TYPE_IDS[bloodType];
};

// Search user by ID Card
export const searchUserByIdCard = async (userIdCard) => {
  try {
    const response = await fetch(`${API_BASE_URL}/User/get-by-idcard/${userIdCard}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (response.ok) {
      const responseText = await response.text();
      if (!responseText || responseText.trim() === '') {
        return null;
      }
      
      try {
        return JSON.parse(responseText);
      } catch (jsonError) {
        return null;
      }
    } else if (response.status === 404) {
      return null; // User not found
    } else if (response.status === 401) {
      return null; // Return null instead of throwing error for auth issues
    } else {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status}`);
    }
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Không thể kết nối tới server. Vui lòng kiểm tra kết nối mạng.');
    }
    throw error;
  }
};

// Create emergency blood request
export const createEmergencyRequest = async (requestData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/BloodRequest/register-emergency`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(requestData),
    });

    if (response.ok) {
      const responseText = await response.text();
      if (!responseText || responseText.trim() === '') {
        return { success: true, message: 'Request created successfully' };
      }
      
      try {
        return JSON.parse(responseText);
      } catch (jsonError) {
        return { success: true, message: 'Request created successfully' };
      }
    } else if (response.status === 401) {
      throw new Error('Bạn cần đăng nhập để thực hiện chức năng này');
    } else {
      const errorData = await response.text();
      throw new Error(`Lỗi API: ${response.status}`);
    }
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Không thể kết nối tới server. Vui lòng kiểm tra kết nối mạng.');
    }
    throw error;
  }
};

// Get all blood requests
export const getAllBloodRequests = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/BloodRequest/Get-All-Request`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (response.ok) {
      const responseText = await response.text();
      
      if (!responseText || responseText.trim() === '') {
        return [];
      }
      
      try {
        return JSON.parse(responseText);
      } catch (jsonError) {
        return [];
      }
    } else if (response.status === 401) {
      return []; // Return empty array instead of throwing error
    } else {
      const errorText = await response.text();
      return []; // Return empty array instead of throwing error
    }
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return []; // Return empty array for network errors
    }
    return []; // Return empty array instead of throwing error
  }
};

// Get blood requests by status
export const getBloodRequestsByStatus = async (status) => {
  try {
    const response = await fetch(`${API_BASE_URL}/BloodRequest/Get-Request-By-status/${status}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (response.ok) {
      const responseText = await response.text();
      if (!responseText || responseText.trim() === '') {
        return [];
      }
      
      try {
        return JSON.parse(responseText);
      } catch (jsonError) {
        return [];
      }
    } else if (response.status === 401) {
      return [];
    } else {
      const errorText = await response.text();
      return [];
    }
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return [];
    }
    return [];
  }
};

// Get current user info
export const getCurrentUser = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/User/current`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (response.ok) {
      const responseText = await response.text();
      if (!responseText || responseText.trim() === '') {
        return null;
      }
      
      try {
        return JSON.parse(responseText);
      } catch (jsonError) {
        return null;
      }
    } else if (response.status === 401) {
      return null;
    } else {
      const errorText = await response.text();
      return null;
    }
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return null;
    }
    return null;
  }
};
