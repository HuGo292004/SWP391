const API_BASE_URL = 'http://localhost:7262/api';

// Function to get auth token (you'll need to implement this based on your auth system)
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

  // Approve health check
  async approveHealthCheck(healthCheckId, approvalData = {}) {
    try {
      console.log('Attempting to approve health check:', healthCheckId, approvalData);
      
      // Try multiple endpoint patterns
      const endpoints = [
        // Pattern 1: Similar to BloodDonation
        { url: `${API_BASE_URL}/HealthCheck/${healthCheckId}/status/approved`, method: 'PATCH' },
        { url: `${API_BASE_URL}/HealthCheck/${healthCheckId}/status/Approved`, method: 'PATCH' },
        { url: `${API_BASE_URL}/HealthCheck/approve-health-check`, method: 'POST' },
        { url: `${API_BASE_URL}/HealthCheck/${healthCheckId}/approve`, method: 'POST' },
        { url: `${API_BASE_URL}/HealthCheck/${healthCheckId}/status`, method: 'PATCH' }
      ];

      let lastError = null;
      
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying ${endpoint.method} ${endpoint.url}`);
          
          let body;
          if (endpoint.method === 'POST' && endpoint.url.includes('approve-health-check')) {
            body = JSON.stringify({
              healthCheckId: healthCheckId,
              ...approvalData
            });
          } else if (endpoint.method === 'PATCH' && endpoint.url.includes('/status')) {
            body = JSON.stringify({
              status: 'approved',
              healthCheckStatus: 'approved',
              ...approvalData
            });
          } else {
            body = JSON.stringify(approvalData);
          }

          const response = await fetch(endpoint.url, {
            method: endpoint.method,
            headers: getAuthHeaders(),
            body: body,
          });

          if (response.ok) {
            console.log('Health check approval successful with endpoint:', endpoint);
            return await response.json();
          } else if (response.status === 401) {
            throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          } else if (response.status !== 404 && response.status !== 405) {
            // If it's not 404 or 405, it might be a real error
            const errorText = await response.text();
            lastError = new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            throw lastError;
          }
        } catch (error) {
          if (error.message.includes('đăng nhập')) {
            throw error; // Re-throw auth errors immediately
          }
          lastError = error;
          console.log(`Endpoint ${endpoint.url} failed:`, error.message);
          continue; // Try next endpoint
        }
      }

      // If all endpoints failed, try updating via PUT
      console.log('All PATCH/POST endpoints failed, trying PUT update...');
      return await this.updateHealthCheckStatus(healthCheckId, 'approved', approvalData);
      
    } catch (error) {
      console.error('Error approving health check:', error);
      throw error;
    }
  }

  // Reject health check
  async rejectHealthCheck(healthCheckId, rejectionData = {}) {
    try {
      console.log('Attempting to reject health check:', healthCheckId, rejectionData);
      
      // Try multiple endpoint patterns
      const endpoints = [
        // Pattern 1: Similar to BloodDonation
        { url: `${API_BASE_URL}/HealthCheck/${healthCheckId}/status/rejected`, method: 'PATCH' },
        { url: `${API_BASE_URL}/HealthCheck/${healthCheckId}/status/Rejected`, method: 'PATCH' },
        { url: `${API_BASE_URL}/HealthCheck/reject-health-check`, method: 'POST' },
        { url: `${API_BASE_URL}/HealthCheck/${healthCheckId}/reject`, method: 'POST' },
        { url: `${API_BASE_URL}/HealthCheck/${healthCheckId}/status`, method: 'PATCH' }
      ];

      let lastError = null;
      
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying ${endpoint.method} ${endpoint.url}`);
          
          let body;
          if (endpoint.method === 'POST' && endpoint.url.includes('reject-health-check')) {
            body = JSON.stringify({
              healthCheckId: healthCheckId,
              ...rejectionData
            });
          } else if (endpoint.method === 'PATCH' && endpoint.url.includes('/status')) {
            body = JSON.stringify({
              status: 'rejected',
              healthCheckStatus: 'rejected',
              ...rejectionData
            });
          } else {
            body = JSON.stringify(rejectionData);
          }

          const response = await fetch(endpoint.url, {
            method: endpoint.method,
            headers: getAuthHeaders(),
            body: body,
          });

          if (response.ok) {
            console.log('Health check rejection successful with endpoint:', endpoint);
            return await response.json();
          } else if (response.status === 401) {
            throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          } else if (response.status !== 404 && response.status !== 405) {
            // If it's not 404 or 405, it might be a real error
            const errorText = await response.text();
            lastError = new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            throw lastError;
          }
        } catch (error) {
          if (error.message.includes('đăng nhập')) {
            throw error; // Re-throw auth errors immediately
          }
          lastError = error;
          console.log(`Endpoint ${endpoint.url} failed:`, error.message);
          continue; // Try next endpoint
        }
      }

      // If all endpoints failed, try updating via PUT
      console.log('All PATCH/POST endpoints failed, trying PUT update...');
      return await this.updateHealthCheckStatus(healthCheckId, 'rejected', rejectionData);
      
    } catch (error) {
      console.error('Error rejecting health check:', error);
      throw error;
    }
  }

  // Fallback method to update health check status using PUT
  async updateHealthCheckStatus(healthCheckId, status, additionalData = {}) {
    try {
      // First get the current health check data
      const currentData = await this.getHealthCheckById(healthCheckId);
      
      // Update the status and merge with additional data
      const updatedData = {
        ...currentData,
        healthCheckStatus: status,
        ...additionalData
      };

      const response = await fetch(`${API_BASE_URL}/HealthCheck/${healthCheckId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating health check status:', error);
      throw error;
    }
  }
}

export const healthCheckApi = new HealthCheckApi();
