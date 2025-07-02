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

    // Handle 204 No Content responses (successful but no body)
    if (response.status === 204) {
      console.log('API Response: 204 No Content - Success');
      return { success: true, message: 'Update successful' };
    }

    // Try to parse JSON response
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const result = await response.json();
      console.log('API Response:', result);
      return result;
    } else {
      // Non-JSON response
      const textResult = await response.text();
      console.log('API Response (text):', textResult);
      return { success: true, data: textResult };
    }
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
  registerBloodDonation: async (donationData) => {
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
            donorID: generateUUID(),
            requestID: donationData.requestID,
            donationDate: donationData.donationDate,
            bloodTypeID: donationData.bloodTypeID,
            status: donationData.status,
            notes: donationData.notes,
            certificateID: null,
            createdAt: new Date().toISOString()
          }
        };
      }

      console.log('=== BLOOD DONATION REGISTRATION ===');
      console.log('Original donation data:', donationData);
      
      // Step 1: Check if donor profile exists and create/update if needed
      let donorProfileResult = null;
      try {
        console.log('Step 1: Checking/creating donor profile with bloodTypeID...');
        donorProfileResult = await donorApi.ensureDonorProfileWithBloodType(donationData.bloodTypeID);
        console.log('Donor profile result:', donorProfileResult);
        
        if (!donorProfileResult.success) {
          console.warn('Donor profile creation/update failed, but continuing...');
        }
      } catch (donorError) {
        console.error('Failed to create/update donor profile:', donorError.message);
        // Create a default result so we can still proceed
        donorProfileResult = {
          success: false,
          action: 'error',
          error: donorError.message
        };
      }
      
      // Step 2: Register blood donation
      console.log('Step 2: Registering blood donation...');
      const apiData = {
        donorID: donationData.donorID, // Will be set by backend based on authenticated user
        requestID: donationData.requestID || null,
        donationDate: donationData.donationDate,
        bloodTypeID: donationData.bloodTypeID,
        status: donationData.status,
        notes: donationData.notes,
        certificateID: donationData.certificateID || null
      };

      console.log('Blood donation API data:', apiData);
      
      const result = await apiRequest('/BloodDonation', {
        method: 'POST',
        body: JSON.stringify(apiData),
      });
      
      console.log('Blood donation registration result:', result);
      console.log('=== REGISTRATION COMPLETE ===');
      
      // Return combined result with donor profile info
      return {
        ...result,
        donorProfileInfo: donorProfileResult
      };
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

  // Check if user has donor profile
  checkDonorProfile: async (forceRefresh = false) => {
    try {
      const currentToken = localStorage.getItem('userToken');
      const isDemo = currentToken === 'demo-token';
      
      if (isDemo) {
        // Demo mode - return mock response (assume no donor profile for first time)
        console.log('Demo mode: Checking donor profile');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Simulate sometimes having donor profile, sometimes not
        const hasProfile = Math.random() > 0.7; // 30% chance of having profile
        
        if (hasProfile) {
          return {
            exists: true,
            donorID: generateUUID(),
            registrationDate: new Date().toISOString()
          };
        } else {
          return {
            exists: false,
            donorID: null
          };
        }
      }
      
      // Try to get donor profile by current user ID
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        console.log('No user ID found in localStorage');
        return {
          exists: false,
          donorID: null
        };
      }
      
      try {
        console.log(`Checking for donor profile for userId: ${userId}, forceRefresh: ${forceRefresh}`);
        
        // Add cache busting parameter if force refresh is requested
        const endpoint = forceRefresh ? `/Donor?_t=${Date.now()}` : `/Donor`;
        
        // Get all donors and find the one with matching userID
        const allDonors = await apiRequest(endpoint);
        const donorProfile = allDonors.find(donor => donor.userID === userId || donor.userId === userId);
        
        if (donorProfile) {
          console.log('Found donor profile with forceRefresh =', forceRefresh, ':', donorProfile);
          return {
            exists: true,
            donorID: donorProfile.donorID || donorProfile.id || donorProfile.donorId,
            registrationDate: donorProfile.registrationDate || donorProfile.createdAt
          };
        } else {
          console.log('No donor profile found for this user (forceRefresh =', forceRefresh, ')');
          return {
            exists: false,
            donorID: null
          };
        }
      } catch (error) {
        // If that fails, assume no donor profile exists
        console.log('No donor profile found for current user:', error.message);
        return {
          exists: false,
          donorID: null
        };
      }
    } catch (error) {
      // If error is about validation or bad request, assume no profile exists
      if (error.message.includes('400') || error.message.includes('404') || 
          error.message.includes('not found') || error.message.includes('validation')) {
        return {
          exists: false,
          donorID: null
        };
      }
      throw new Error(`Kiểm tra hồ sơ hiến máu thất bại: ${error.message}`);
    }
  },

  // Create donor profile for first-time registration
  createDonorProfile: async (donorData) => {
    try {
      const currentToken = localStorage.getItem('userToken');
      const isDemo = currentToken === 'demo-token';
      
      if (isDemo) {
        // Demo mode - return mock donor profile
        console.log('Demo mode: Creating donor profile');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
          success: true,
          donorID: generateUUID(),
          message: 'Hồ sơ hiến máu đã được tạo thành công (Demo mode)',
          data: {
            donorID: generateUUID(),
            userID: donorData.userID,
            registrationDate: new Date().toISOString(),
            bloodTypeID: donorData.bloodTypeID,
            status: 'Active'
          }
        };
      }
      
      return await apiRequest('/Donor', {
        method: 'POST',
        body: JSON.stringify(donorData),
      });
    } catch (error) {
      throw new Error(`Tạo hồ sơ hiến máu thất bại: ${error.message}`);
    }
  },

  // Ensure donor profile exists with bloodTypeID (for blood donation registration)
  ensureDonorProfileWithBloodType: async (bloodTypeID) => {
    try {
      const currentToken = localStorage.getItem('userToken');
      const isDemo = currentToken === 'demo-token';
      
      if (isDemo) {
        console.log('Demo mode: Ensuring donor profile with bloodTypeID');
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
          success: true,
          action: 'created',
          donorID: generateUUID(),
          bloodTypeID: bloodTypeID
        };
      }

      console.log('Checking if donor profile exists...');
      
      // Try to get existing donor profile using the correct endpoint
      let existingDonor = null;
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        throw new Error('User ID not found in localStorage');
      }
      
      try {
        console.log(`Checking for existing donor profile for userId: ${userId}`);
        // Get all donors and find the one with matching userID
        const allDonors = await apiRequest(`/Donor`);
        existingDonor = allDonors.find(donor => donor.userID === userId || donor.userId === userId);
        
        if (existingDonor) {
          console.log('Found existing donor via donor list search:', existingDonor);
        } else {
          console.log('No donor profile found for this user in donor list');
        }
      } catch (error) {
        console.log('No existing donor profile found:', error.message);
        existingDonor = null;
      }

      if (existingDonor && (existingDonor.donorID || existingDonor.id)) {
        // Donor profile exists - update bloodTypeID if different
        const currentBloodTypeID = existingDonor.bloodTypeID || existingDonor.bloodTypeId;
        const donorID = existingDonor.donorID || existingDonor.id;
        
        console.log('Existing donor found with ID:', donorID);
        console.log('Current bloodTypeID:', currentBloodTypeID);
        console.log('New bloodTypeID:', bloodTypeID);
        
        if (currentBloodTypeID !== bloodTypeID) {
          console.log('Updating donor profile with new bloodTypeID and latest personal info...');
          
          // Get latest user details for update
          let userDetails = null;
          try {
            console.log('Fetching latest user info for donor profile update...');
            const { UserAPI } = await import('./userApi');
            userDetails = await UserAPI.getCurrentUser();
            console.log('Latest user details for update:', userDetails);
          } catch (userError) {
            console.warn('Could not fetch latest user info for update:', userError.message);
          }
          
          const updateData = {
            donorID: donorID,
            userID: existingDonor.userID || existingDonor.userId,
            bloodTypeID: bloodTypeID,
            isAvailable: existingDonor.isAvailable !== undefined ? existingDonor.isAvailable : true,
            lastDonationDate: existingDonor.lastDonationDate,
            nextEligibleDate: existingDonor.nextEligibleDate,
            currentMedications: existingDonor.currentMedications,
            Address: userDetails?.address || existingDonor.Address || existingDonor.address
          };
          
          console.log('Updating donor profile with basic data (avoiding 500 error):', updateData);
          
          const updateResult = await apiRequest(`/Donor/${donorID}`, {
            method: 'PUT',
            body: JSON.stringify(updateData),
          });
          
          console.log('Donor profile updated with new bloodTypeID:', updateResult);
          
          return {
            success: true,
            action: 'updated',
            donorID: donorID,
            bloodTypeID: bloodTypeID,
            result: updateResult
          };
        } else {
          console.log('Donor profile already has correct bloodTypeID, no update needed');
          return {
            success: true,
            action: 'no_change',
            donorID: donorID,
            bloodTypeID: bloodTypeID
          };
        }
      } else {
        // No donor profile exists - create new one
        console.log('No donor profile exists, creating new one...');
        
        // Get current user info for donor profile creation
        const userInfo = {
          userId: localStorage.getItem('userId'),
          username: localStorage.getItem('username'),
          userEmail: localStorage.getItem('userEmail'),
          userToken: localStorage.getItem('userToken')
        };
        
        // Get detailed user information from UserAPI
        let userDetails = null;
        try {
          console.log('Fetching detailed user info for donor profile creation...');
          const { UserAPI } = await import('./userApi');
          userDetails = await UserAPI.getCurrentUser();
          console.log('User details for donor profile:', userDetails);
        } catch (userError) {
          console.warn('Could not fetch detailed user info:', userError.message);
        }
        
        const createData = {
          userID: userInfo.userId, // Link to user account
          bloodTypeID: bloodTypeID,
          isAvailable: true,
          lastDonationDate: null,
          nextEligibleDate: null,
          currentMedications: null,
          Address: userDetails?.address || null // Use user's address if available, note capital A
        };
        
        console.log('Creating basic donor profile with minimal data (avoiding 500 error):', createData);
        console.log('User info for donor profile:', userInfo);
        
        try {
          const createResult = await apiRequest('/Donor', {
            method: 'POST',
            body: JSON.stringify(createData),
          });
          
          console.log('Basic donor profile created successfully:', createResult);
          const donorID = createResult.donorId || createResult.donorID;
          
          // Note: Personal information is managed via User table and fetched via UserAPI
          // The Donor table only supports: donorId, userId, bloodTypeId, isAvailable
          console.log('✅ Donor profile created with bloodTypeID:', bloodTypeID);
          console.log('ℹ️ Personal info is available via User table and will be displayed in registration preview');
          
          return {
            success: true,
            action: 'created',
            donorID: donorID,
            bloodTypeID: bloodTypeID,
            result: createResult
          };
        } catch (createError) {
          console.error('Error creating donor profile:', createError);
          console.error('Create data that failed:', createData);
          console.error('Full error details:', JSON.stringify(createError, null, 2));
          
          // Try to extract more detailed error information
          let errorDetails = createError.message;
          try {
            const errorObj = JSON.parse(createError.message);
            if (errorObj.errors) {
              errorDetails = Object.entries(errorObj.errors)
                .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
                .join('; ');
            }
          } catch (e) {
            // If parsing fails, use original message
          }
          
          console.error('Detailed error:', errorDetails);
          
          // For now, return success but log the error so blood donation can still proceed
          console.warn('Donor profile creation failed, but continuing with blood donation...');
          return {
            success: true, // Mark as success to allow blood donation to proceed
            action: 'failed_creation',
            donorID: null,
            bloodTypeID: bloodTypeID,
            error: createError.message,
            errorDetails: errorDetails
          };
        }
      }
    } catch (error) {
      console.error('Error ensuring donor profile with bloodTypeID:', error);
      throw new Error(`Không thể tạo/cập nhật hồ sơ hiến máu: ${error.message}`);
    }
  },

  // Get donor profile by donorId to verify bloodTypeID
  // Note: Now also storing personal info (fullName, email, phoneNumber, dateOfBirth) in Donor table
  // Donor table stores: userID, donorID, bloodTypeID, isAvailable, lastDonationDate, nextEligibleDate, currentMedications, Address, FullName, Email, PhoneNumber, etc.
  getDonorProfileById: async (donorId) => {
    try {
      console.log(`Getting donor profile details for donorId: ${donorId}`);
      
      const result = await apiRequest(`/Donor/${donorId}`, {
        method: 'GET'
      });
      
      console.log('Donor profile details:', result);
      return result;
    } catch (error) {
      console.error('Error getting donor profile by ID:', error);
      throw new Error(`Không thể lấy thông tin donor profile: ${error.message}`);
    }
  },

  // Verify donor profile creation/update after registration
  verifyDonorProfile: async (userId, expectedBloodTypeID) => {
    try {
      console.log(`Verifying donor profile for userId: ${userId}`);
      
      // Get all donors and find the one with matching userID
      const allDonors = await apiRequest(`/Donor`);
      const donorProfile = allDonors.find(donor => donor.userID === userId || donor.userId === userId);
      
      if (!donorProfile) {
        console.error('Donor profile not found after registration');
        return { success: false, message: 'Donor profile not found' };
      }
      
      console.log('Donor profile verification result:', donorProfile);
      
      // Check if bloodTypeID was saved correctly
      const actualBloodTypeID = donorProfile.bloodTypeID || donorProfile.bloodTypeId;
      if (actualBloodTypeID === expectedBloodTypeID) {
        console.log('✅ BloodTypeID saved correctly:', actualBloodTypeID);
      } else {
        console.error('❌ BloodTypeID mismatch. Expected:', expectedBloodTypeID, 'Actual:', actualBloodTypeID);
      }
      
      // Note: Personal information is stored in User table, not Donor table
      console.log('ℹ️ Donor table contains: donorId, userId, bloodTypeId, isAvailable');
      
      return {
        success: true,
        donorProfile: donorProfile,
        bloodTypeIDCorrect: actualBloodTypeID === expectedBloodTypeID,
        message: 'Donor profile verified successfully'
      };
      
    } catch (error) {
      console.error('Error verifying donor profile:', error);
      return { success: false, message: error.message };
    }
  },

};

export default donorApi;