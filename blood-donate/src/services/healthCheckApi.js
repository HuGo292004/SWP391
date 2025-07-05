const API_BASE_URL = 'http://localhost:7262/api';

// Function to get auth token (you'll need to implement this based on your auth system)
const getAuthToken = () => {
  // Try different possible storage locations for auth token
  return localStorage.getItem('authToken') || 
         localStorage.getItem('token') || 
         localStorage.getItem('accessToken') ||
         sessionStorage.getItem('authToken') ||
         sessionStorage.getItem('token') ||
         sessionStorage.getItem('accessToken');
};

// Function to get auth headers
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

class HealthCheckApi {
  async getAllHealthChecks() {
    try {
      const response = await fetch(`${API_BASE_URL}/HealthCheck`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching health checks:', error);
      throw error;
    }
  }

  async createHealthCheck(healthCheckData) {
    try {
      // Transform data to match API schema
      const apiData = {
        userIdCard: healthCheckData.userIdCard || '',
        weight: healthCheckData.weight,
        height: healthCheckData.height,
        heartRate: healthCheckData.heartRate,
        temperature: healthCheckData.temperature,
        bloodPressure: healthCheckData.blood_pressure, // API uses bloodPressure, not blood_pressure
        medicalHistory: healthCheckData.medicalHistory,
        currentMedications: healthCheckData.currentMedications,
        allergies: healthCheckData.allergies,
        healthCheckDate: healthCheckData.HealthCheck_Date, // API uses healthCheckDate
        healthCheckStatus: healthCheckData.HealthCheck_Status || 'pending' // API uses healthCheckStatus
      };

      const response = await fetch(`${API_BASE_URL}/HealthCheck`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating health check:', error);
      throw error;
    }
  }

  async getHealthCheckById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/HealthCheck/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching health check by ID:', error);
      throw error;
    }
  }

  async updateHealthCheck(id, healthCheckData) {
    try {
      const response = await fetch(`${API_BASE_URL}/HealthCheck/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(healthCheckData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating health check:', error);
      throw error;
    }
  }

  async deleteHealthCheck(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/HealthCheck/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.ok;
    } catch (error) {
      console.error('Error deleting health check:', error);
      throw error;
    }
  }

  async getAvailableDonorIds() {
    try {
      const response = await fetch(`${API_BASE_URL}/HealthCheck/available-donor-ids`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching available donor IDs:', error);
      throw error;
    }
  }

  async getDonorByIdCard(userIdCard) {
    try {
      // Try multiple possible endpoints to find donor by ID card
      const possibleEndpoints = [
        `${API_BASE_URL}/User/by-idcard/${userIdCard}`,
        `${API_BASE_URL}/User/search-by-idcard/${userIdCard}`,
        `${API_BASE_URL}/Donor/by-idcard/${userIdCard}`,
        `${API_BASE_URL}/User?idCard=${userIdCard}`,
        `${API_BASE_URL}/User/search?idCard=${userIdCard}`
      ];

      let lastError = null;

      for (const endpoint of possibleEndpoints) {
        try {
          const response = await fetch(endpoint, {
            method: 'GET',
            headers: getAuthHeaders(),
          });

          if (response.ok) {
            const data = await response.json();
            // Handle different response formats
            if (Array.isArray(data) && data.length > 0) {
              return data[0]; // Return first match if array
            } else if (data && typeof data === 'object') {
              return data; // Return object directly
            }
          } else if (response.status === 401) {
            throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          }
        } catch (error) {
          lastError = error;
          if (error.message.includes('đăng nhập')) {
            throw error; // Re-throw auth errors immediately
          }
          continue; // Try next endpoint
        }
      }

      // If all endpoints failed, throw the last error or a generic one
      throw lastError || new Error('Không tìm thấy thông tin người hiến máu với CCCD/CMND này');
      
    } catch (error) {
      console.error('Error fetching donor by ID card:', error);
      throw error;
    }
  }

  // Get donor from blood donation requests by checking all blood donations
  async getDonorFromBloodDonation(userIdCard) {
    try {
      // Get all blood donations first, then filter by userIdCard on frontend
      const response = await fetch(`${API_BASE_URL}/BloodDonation`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } else if (response.status === 404) {
          throw new Error('Không tìm thấy đơn hiến máu chờ xử lý cho CCCD/CMND này');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const allDonations = await response.json();
      
      // Filter donations by userIdCard and pending status
      const matchingDonation = allDonations.find(donation => 
        (donation.userIdCard === userIdCard || donation.donorIdCard === userIdCard) &&
        (donation.status === 'pending' || donation.status === 'Pending' || donation.donationStatus === 'pending')
      );

      if (!matchingDonation) {
        throw new Error('Không tìm thấy đơn hiến máu chờ xử lý cho CCCD/CMND này');
      }

      return matchingDonation;
    } catch (error) {
      console.error('Error fetching donor from blood donation:', error);
      throw error;
    }
  }

  // Get pending blood donation requests
  async getPendingBloodDonations() {
    try {
      const response = await fetch(`${API_BASE_URL}/BloodDonation`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const allDonations = await response.json();
      
      // Filter only pending donations
      const pendingDonations = allDonations.filter(donation => 
        donation.status === 'pending' || donation.status === 'Pending' || donation.donationStatus === 'pending'
      );

      return pendingDonations;
    } catch (error) {
      console.error('Error fetching pending blood donations:', error);
      throw error;
    }
  }
}

export const healthCheckApi = new HealthCheckApi();
