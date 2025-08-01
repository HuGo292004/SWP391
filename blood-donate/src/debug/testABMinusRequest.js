/**
 * Test tạo emergency request để debug vấn đề AB-
 * Mô phỏng việc tạo yêu cầu AB- 450ml
 */

import { 
  getAvailableQuantityByCompatibleBloodTypes,
  createEmergencyRequest,
  getBloodTypeId 
} from '../services/emergencyRequestApi.js';

const testCreateABMinusRequest = async () => {
  console.log('🧪 TESTING AB- EMERGENCY REQUEST CREATION');
  console.log('=' * 50);
  
  try {
    // Test data giống trong ảnh
    const formData = {
      patientName: "Test Patient AB-",
      email: "test@example.com", 
      userIdCard: "123456789",
      phone: "0123456789",
      dateOfBirth: "1990-01-01",
      bloodTypeRequired: "AB-",
      quantityNeeded: "450",
      description: "Test emergency request for AB- compatibility"
    };

    console.log('📋 Form data:', formData);

    // 1. Lấy bloodTypeId
    const bloodTypeId = getBloodTypeId(formData.bloodTypeRequired);
    const quantityNeeded = parseInt(formData.quantityNeeded);
    
    console.log('🔍 Blood type ID:', bloodTypeId);
    console.log('📊 Quantity needed:', quantityNeeded + 'ml');

    // 2. Kiểm tra số lượng máu tương thích  
    console.log('\n🩸 Checking compatible blood availability...');
    const availableQuantity = await getAvailableQuantityByCompatibleBloodTypes(bloodTypeId);
    
    console.log('✅ Available compatible blood:', availableQuantity + 'ml');

    // 3. Xác định status
    let status = "Opened";
    if (availableQuantity >= quantityNeeded) {
      status = "Pending";
    }
    
    console.log('📈 Calculated status:', status);
    console.log('📊 Logic: ' + availableQuantity + 'ml >= ' + quantityNeeded + 'ml ? ' + (availableQuantity >= quantityNeeded));

    // 4. Tạo request data
    const requestData = {
      patientName: formData.patientName,
      email: formData.email,
      userIdCard: formData.userIdCard,
      phone: formData.phone,
      dateOfBirth: formData.dateOfBirth,
      bloodTypeRequired: bloodTypeId,
      quantityNeeded,
      urgencyLevel: "HIGH",
      medicalCondition: formData.description,
      contactInfo: formData.phone,
      description: formData.description,
      status
    };

    console.log('\n📤 Request data to be sent to backend:');
    console.log(JSON.stringify(requestData, null, 2));

    // 5. Gửi request (comment out để tránh tạo thật)
    console.log('\n🚀 Would send request to backend...');
    console.log('⚠️  Uncomment the line below to actually create the request');
    
    // const result = await createEmergencyRequest(requestData);
    // console.log('✅ Backend response:', result);

  } catch (error) {
    console.error('❌ Error during test:', error);
  }
};

// Export để có thể import từ nơi khác
export { testCreateABMinusRequest };

// Uncomment để chạy test trực tiếp
// testCreateABMinusRequest();
