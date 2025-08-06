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

// Enhanced Donor API functions that include address and currentMedications
export const enhancedDonorApi = {
  // Create or update donor profile with address and medications
  createOrUpdateDonorProfile: async (donorData) => {
    try {
      // Check if in demo mode
      const currentToken = localStorage.getItem('userToken');
      const isDemo = currentToken === 'demo-token';
      
      if (isDemo) {
        console.log('Demo mode: Simulating donor profile creation/update');
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
          success: true,
          action: 'created',
          donorId: 'DEMO-' + Math.random().toString(36).substr(2, 9),
          message: 'Donor profile created successfully (Demo mode)'
        };
      }

      console.log('Creating/updating donor profile with data:', donorData);
      
      // Structure for donor table with correct field names (matching API expectations)
      const apiData = {
        bloodType: donorData.bloodType || null, // API expects bloodType as string (e.g., "A+", "B-")
        isAvailable: donorData.isAvailable !== undefined ? donorData.isAvailable : true,
        Address: donorData.address || '', // Use uppercase 'Address' to match database
        CurrentMedications: donorData.currentMedications || '', // Use uppercase 'CurrentMedications' 
        lastDonationDate: donorData.lastDonationDate || null,
        nextEligibleDate: donorData.nextEligibleDate || null
      };

      // Try to create/update donor profile
      const result = await apiRequest('/Donor', {
        method: 'POST',
        body: JSON.stringify(apiData),
      });
      
      return {
        success: true,
        action: result.action || 'created',
        donorId: result.donorId || result.id,
        data: result,
        message: 'Donor profile processed successfully'
      };
    } catch (error) {
      console.error('Error creating/updating donor profile:', error);
      return {
        success: false,
        action: 'failed',
        error: error.message,
        message: `Failed to create/update donor profile: ${error.message}`
      };
    }
  },

  // Register blood donation with donor profile update
  registerBloodDonationWithDonor: async (donationData) => {
    try {
      // Check if in demo mode
      const currentToken = localStorage.getItem('userToken');
      const isDemo = currentToken === 'demo-token';
      
      if (isDemo) {
        console.log('Demo mode: Simulating blood donation registration with donor update');
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
          success: true,
          donationId: 'DEMO-DONATION-' + Math.random().toString(36).substr(2, 9),
          donorId: 'DEMO-DONOR-' + Math.random().toString(36).substr(2, 9),
          message: 'Blood donation registered successfully (Demo mode)',
          donorProfileInfo: {
            success: true,
            action: 'updated',
            message: 'Donor profile updated with address and medications'
          }
        };
      }

      // OPTION 1: Try to send everything in a single blood donation request with extended data
      const extendedDonationData = {
        donorID: null, // Backend will set based on authenticated user
        donationDate: donationData.donationDate,
        bloodType: donationData.bloodType, // Use bloodType instead of bloodTypeID
        status: donationData.status || 'Pending',
        notes: donationData.notes || '',
        certificateID: null,
        // Include donor profile fields
        Address: donationData.address || '',
        CurrentMedications: donationData.currentMedications || ''
      };

      try {
        // Try single API call first
        const donationResult = await apiRequest('/BloodDonation', {
          method: 'POST',
          body: JSON.stringify(extendedDonationData),
        });
        
        return {
          success: true,
          donationId: donationResult.donationId || donationResult.id,
          message: 'Blood donation registered successfully with donor profile data',
          donationInfo: donationResult,
          donorProfileInfo: {
            success: true,
            action: 'included_in_donation',
            message: 'Donor profile data included in blood donation request'
          }
        };
        
      } catch (singleRequestError) {
        console.warn('Single-request approach failed, falling back to separate API calls:', singleRequestError.message);
        
        // OPTION 2: Fallback to separate API calls
        const donorProfileData = {
          bloodType: donationData.bloodType, // Use bloodType instead of bloodTypeID
          isAvailable: true,
          address: donationData.address, // This will be converted to uppercase in createOrUpdateDonorProfile
          currentMedications: donationData.currentMedications, // This will be converted to uppercase in createOrUpdateDonorProfile
          lastDonationDate: null, // Will be updated after successful donation
          nextEligibleDate: null
        };
        
        const donorResult = await enhancedDonorApi.createOrUpdateDonorProfile(donorProfileData);
        
        // Step 2: Register blood donation (without duplicate donor info)
        const bloodDonationData = {
          donorID: null, // Backend will set based on authenticated user
          donationDate: donationData.donationDate,
          bloodType: donationData.bloodType, // Use bloodType instead of bloodTypeID
          status: donationData.status || 'Pending',
          notes: donationData.notes || '',
          certificateID: null
          // NO ADDRESS/MEDICATIONS HERE - already handled in donor profile
        };

        const donationResult = await apiRequest('/BloodDonation', {
          method: 'POST',
          body: JSON.stringify(bloodDonationData),
        });
        
        return {
          success: true,
          donationId: donationResult.donationId || donationResult.id,
          donorId: donorResult.donorId,
          message: 'Blood donation registered successfully with donor profile updated',
          donorProfileInfo: donorResult,
          donationInfo: donationResult
        };
      }
      
    } catch (error) {
      console.error('Error in enhanced blood donation registration:', error);
      throw new Error(`Đăng ký hiến máu thất bại: ${error.message}`);
    }
  }
};
