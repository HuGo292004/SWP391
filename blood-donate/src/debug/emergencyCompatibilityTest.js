/**
 * Test script để kiểm tra chức năng hỗ trợ yêu cầu khẩn cấp với validation nhóm máu
 * Test cases cho tính tương thích nhóm máu
 */

import { 
  canDonateBloodTo, 
  getCompatibleDonorBloodTypes,
  getCompatibleRecipientBloodTypes,
  getBloodTypeFromID 
} from '../utils/bloodTypeCompatibility.js';

console.log('🧪 TESTING EMERGENCY REQUEST BLOOD TYPE COMPATIBILITY');
console.log('=' * 60);

// Mock emergency requests for testing
const mockEmergencyRequests = [
  {
    requestId: "EMR001",
    patientName: "Nguyễn Văn A",
    bloodTypeRequired: "11111111-1111-1111-1111-111111111001", // A+
    quantityNeeded: 500,
    description: "Phẫu thuật khẩn cấp"
  },
  {
    requestId: "EMR002", 
    patientName: "Trần Thị B",
    bloodTypeRequired: "11111111-1111-1111-1111-111111111006", // AB-
    quantityNeeded: 450,
    description: "Tai nạn giao thông"
  },
  {
    requestId: "EMR003",
    patientName: "Lê Văn C", 
    bloodTypeRequired: "11111111-1111-1111-1111-111111111008", // O-
    quantityNeeded: 300,
    description: "Biến chứng sinh con"
  }
];

// Test user blood types
const userBloodTypes = [
  { bloodType: "A+", id: "11111111-1111-1111-1111-111111111001" },
  { bloodType: "A-", id: "11111111-1111-1111-1111-111111111002" },
  { bloodType: "B+", id: "11111111-1111-1111-1111-111111111003" },
  { bloodType: "B-", id: "11111111-1111-1111-1111-111111111004" },
  { bloodType: "AB+", id: "11111111-1111-1111-1111-111111111005" },
  { bloodType: "AB-", id: "11111111-1111-1111-1111-111111111006" },
  { bloodType: "O+", id: "11111111-1111-1111-1111-111111111007" },
  { bloodType: "O-", id: "11111111-1111-1111-1111-111111111008" }
];

// Test each combination
mockEmergencyRequests.forEach((emergency, i) => {
  const neededBloodType = getBloodTypeFromID(emergency.bloodTypeRequired);
  const compatibleDonors = getCompatibleDonorBloodTypes(neededBloodType);
  
  console.log(`\n🚨 Emergency Request ${i + 1}: ${emergency.patientName}`);
  console.log(`   Cần nhóm máu: ${neededBloodType}`);
  console.log(`   Số lượng: ${emergency.quantityNeeded}ml`);
  console.log(`   Nhóm máu có thể hỗ trợ: ${compatibleDonors.join(", ")}`);
  console.log(`   ----- Test tương thích -----`);
  
  userBloodTypes.forEach(user => {
    const canHelp = canDonateBloodTo(user.bloodType, neededBloodType);
    const status = canHelp ? "✅ CÓ THỂ HỖ TRỢ" : "❌ KHÔNG TƯƠNG THÍCH";
    const userCanHelp = getCompatibleRecipientBloodTypes(user.bloodType);
    
    console.log(`   ${user.bloodType} → ${neededBloodType}: ${status}`);
    if (!canHelp) {
      console.log(`      → ${user.bloodType} chỉ có thể hỗ trợ: ${userCanHelp.join(", ")}`);
    }
  });
});

// Test URL scenarios
console.log(`\n🔗 URL TEST SCENARIOS`);
console.log(`=' * 40`);

const urlScenarios = [
  {
    url: "/member/blood-donation-registration?emergencyRequestId=EMR001",
    description: "User clicks 'Tôi muốn hỗ trợ' for A+ emergency",
    emergencyId: "EMR001"
  },
  {
    url: "/member/blood-donation-registration?emergencyRequestId=EMR002", 
    description: "User clicks 'Tôi muốn hỗ trợ' for AB- emergency",
    emergencyId: "EMR002"
  },
  {
    url: "/member/blood-donation-registration",
    description: "Normal blood donation registration",
    emergencyId: null
  }
];

urlScenarios.forEach((scenario, i) => {
  console.log(`\n${i + 1}. ${scenario.description}`);
  console.log(`   URL: ${scenario.url}`);
  if (scenario.emergencyId) {
    const emergency = mockEmergencyRequests.find(e => e.requestId === scenario.emergencyId);
    if (emergency) {
      const neededType = getBloodTypeFromID(emergency.bloodTypeRequired);
      console.log(`   Emergency: ${emergency.patientName} cần ${neededType}`);
      console.log(`   Compatible donors: ${getCompatibleDonorBloodTypes(neededType).join(", ")}`);
    }
  } else {
    console.log(`   No emergency request - normal registration`);
  }
});

// Expected behavior
console.log(`\n📋 EXPECTED BEHAVIOR`);
console.log(`=' * 40`);
console.log(`1. When user clicks "Tôi muốn hỗ trợ":`);
console.log(`   - Navigate to: /member/blood-donation-registration?emergencyRequestId=<ID>`);
console.log(`   - Load emergency request info`);
console.log(`   - Show emergency request details`);
console.log(`   - Auto-fill user's blood type from profile`);

console.log(`\n2. Blood type selection validation:`);
console.log(`   - If compatible: Show success message, allow next step`);
console.log(`   - If incompatible: Show warning, block next step`);
console.log(`   - Show which blood types can help the emergency`);
console.log(`   - Show which blood types the user can help`);

console.log(`\n3. Warning message format:`);
console.log(`   "⚠️ CẢNH BÁO: Nhóm máu X không thể hỗ trợ cho nhóm máu Y."`);
console.log(`   "📋 Nhóm máu X chỉ có thể hỗ trợ cho: [list]"`);
console.log(`   "🩸 Yêu cầu khẩn cấp Y có thể nhận từ: [list]"`);
console.log(`   "💡 Vui lòng chọn một trong các nhóm máu tương thích..."`);

console.log(`\n4. Auto-fill behavior:`);
console.log(`   - If user's profile blood type is compatible: Auto-fill and show success`);
console.log(`   - If user's profile blood type is incompatible: Auto-fill but show warning`);
console.log(`   - User can still change blood type to compatible one`);

console.log(`\n✅ Test completed!`);
