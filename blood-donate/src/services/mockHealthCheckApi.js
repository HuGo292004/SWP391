// Mock API service for testing without authentication
class MockHealthCheckApi {
  // Mock donor data
  mockDonors = [
    {
      donorID: 1,
      fullName: 'Nguyễn Văn An',
      email: 'nguyenvana@gmail.com',
      phone: '0123456789',
      bloodType: 'A+',
      userIdCard: '123456789012'
    },
    {
      donorID: 2, 
      fullName: 'Trần Thị Bình',
      email: 'tranthib@gmail.com',
      phone: '0987654321',
      bloodType: 'O+',
      userIdCard: '333333335112'
    },
    {
      donorID: 3,
      fullName: 'Lê Văn Cường', 
      email: 'levanc@gmail.com',
      phone: '0369852147',
      bloodType: 'B+',
      userIdCard: '987654321098'
    }
  ];

  // Mock health checks
  mockHealthChecks = [
    {
      healthCheckID: 'HC001',
      donorID: 1,
      donorName: 'Nguyễn Văn An',
      weight: 65,
      height: 170,
      heartRate: 72,
      temperature: 36.5,
      blood_pressure: '120/80',
      medicalHistory: 'Không có tiền sử bệnh lý đặc biệt',
      currentMedications: 'Không',
      allergies: 'Không',
      HealthCheck_Date: '2024-12-15',
      HealthCheck_Status: 'pending'
    },
    {
      healthCheckID: 'HC002',
      donorID: 2,
      donorName: 'Trần Thị Bình',
      weight: 55,
      height: 165,
      heartRate: 68,
      temperature: 36.3,
      blood_pressure: '110/70',
      medicalHistory: 'Không có',
      currentMedications: 'Vitamin C',
      allergies: 'Dị ứng tôm cua',
      HealthCheck_Date: '2024-12-14',
      HealthCheck_Status: 'approved'
    }
  ];

  async getAllHealthChecks() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.mockHealthChecks;
  }

  async createHealthCheck(healthCheckData) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newHealthCheck = {
      healthCheckID: `HC${Date.now()}`,
      ...healthCheckData,
      createdAt: new Date().toISOString()
    };
    
    this.mockHealthChecks.unshift(newHealthCheck);
    return newHealthCheck;
  }

  async getDonorByIdCard(userIdCard) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const donor = this.mockDonors.find(d => d.userIdCard === userIdCard);
    if (!donor) {
      throw new Error('Không tìm thấy thông tin người hiến máu với CCCD/CMND này');
    }
    
    return donor;
  }

  async getHealthCheckById(id) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const healthCheck = this.mockHealthChecks.find(h => h.healthCheckID === id);
    if (!healthCheck) {
      throw new Error('Không tìm thấy phiếu sức khỏe');
    }
    return healthCheck;
  }

  async updateHealthCheck(id, healthCheckData) {
    await new Promise(resolve => setTimeout(resolve, 800));
    const index = this.mockHealthChecks.findIndex(h => h.healthCheckID === id);
    if (index === -1) {
      throw new Error('Không tìm thấy phiếu sức khỏe để cập nhật');
    }
    
    this.mockHealthChecks[index] = { ...this.mockHealthChecks[index], ...healthCheckData };
    return this.mockHealthChecks[index];
  }

  async deleteHealthCheck(id) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = this.mockHealthChecks.findIndex(h => h.healthCheckID === id);
    if (index === -1) {
      throw new Error('Không tìm thấy phiếu sức khỏe để xóa');
    }
    
    this.mockHealthChecks.splice(index, 1);
    return true;
  }

  async getAvailableDonorIds() {
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.mockDonors.map(d => ({
      donorID: d.donorID,
      fullName: d.fullName,
      userIdCard: d.userIdCard
    }));
  }
}

export const mockHealthCheckApi = new MockHealthCheckApi();
