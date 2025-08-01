/**
 * Test script để kiểm tra logic tương thích nhóm máu mới
 * Chạy script này để xem logic hoạt động như thế nào
 */

import { 
  getCompatibleDonorBloodTypes, 
  getCompatibleDonorBloodTypeIDs,
  getBloodTypeFromID 
} from '../utils/bloodTypeCompatibility.js';

// Test scenarios
const testScenarios = [
  {
    neededBloodType: "A+",
    description: "A+ cần máu - có thể nhận từ: O-, O+, A-, A+"
  },
  {
    neededBloodType: "A-", 
    description: "A- cần máu - có thể nhận từ: O-, A-"
  },
  {
    neededBloodType: "B+",
    description: "B+ cần máu - có thể nhận từ: O-, O+, B-, B+"
  },
  {
    neededBloodType: "B-",
    description: "B- cần máu - có thể nhận từ: O-, B-"
  },
  {
    neededBloodType: "AB+",
    description: "AB+ cần máu - có thể nhận từ tất cả nhóm máu (universal recipient)"
  },
  {
    neededBloodType: "AB-",
    description: "AB- cần máu - có thể nhận từ: O-, A-, B-, AB-"
  },
  {
    neededBloodType: "O+",
    description: "O+ cần máu - có thể nhận từ: O-, O+"
  },
  {
    neededBloodType: "O-",
    description: "O- cần máu - chỉ có thể nhận từ: O-"
  }
];

console.log("🩸 KIỂM TRA LOGIC TƯƠNG THÍCH NHÓM MÁU MỚI");
console.log("=".repeat(60));

testScenarios.forEach((scenario, index) => {
  console.log(`\n${index + 1}. ${scenario.description}`);
  
  // Lấy danh sách nhóm máu tương thích
  const compatibleBloodTypes = getCompatibleDonorBloodTypes(scenario.neededBloodType);
  console.log(`   Các nhóm máu có thể hiến: ${compatibleBloodTypes.join(", ")}`);
  
  // Chuyển đổi sang blood type IDs
  const bloodTypeID = "11111111-1111-1111-1111-111111111001"; // Giả sử là A+ ID
  const compatibleIDs = getCompatibleDonorBloodTypeIDs(bloodTypeID);
  
  console.log(`   Số lượng nhóm máu tương thích: ${compatibleBloodTypes.length}`);
  console.log(`   IDs tương thích: ${compatibleIDs.length} nhóm`);
});

console.log("\n" + "=".repeat(60));
console.log("📊 VÍ DỤ TÍNH TOÁN TRONG THỰC TẾ:");
console.log("=".repeat(60));

// Ví dụ thực tế
const exampleScenarios = [
  {
    needed: "A-",
    neededQuantity: 900,
    availableStock: {
      "O-": 200,
      "A-": 300,
      "O+": 500,  // Không tương thích với A-
      "A+": 400   // Không tương thích với A-
    },
    expectedCompatibleTotal: 500, // O- + A- = 200 + 300
    shouldBeStatus: "Opened" // Vì 500 < 900
  },
  {
    needed: "AB+",
    neededQuantity: 1000,
    availableStock: {
      "O-": 200,
      "O+": 300,
      "A-": 150,
      "A+": 250,
      "B-": 100,
      "B+": 200,
      "AB-": 50,
      "AB+": 100
    },
    expectedCompatibleTotal: 1350, // Tất cả nhóm máu
    shouldBeStatus: "Pending" // Vì 1350 >= 1000
  },
  {
    needed: "O-",
    neededQuantity: 500,
    availableStock: {
      "O-": 300,
      "O+": 1000, // Không tương thích với O-
      "A+": 500   // Không tương thích với O-
    },
    expectedCompatibleTotal: 300, // Chỉ O-
    shouldBeStatus: "Opened" // Vì 300 < 500
  }
];

exampleScenarios.forEach((example, index) => {
  console.log(`\nVí dụ ${index + 1}: Bệnh nhân cần ${example.needed} - ${example.neededQuantity}ml`);
  
  const compatibleTypes = getCompatibleDonorBloodTypes(example.needed);
  console.log(`   Nhóm máu tương thích: ${compatibleTypes.join(", ")}`);
  
  let totalCompatible = 0;
  console.log(`   Kho máu hiện có:`);
  
  Object.entries(example.availableStock).forEach(([bloodType, quantity]) => {
    const isCompatible = compatibleTypes.includes(bloodType);
    if (isCompatible) {
      totalCompatible += quantity;
      console.log(`     ${bloodType}: ${quantity}ml ✅ (tương thích)`);
    } else {
      console.log(`     ${bloodType}: ${quantity}ml ❌ (không tương thích)`);
    }
  });
  
  console.log(`   Tổng máu tương thích: ${totalCompatible}ml`);
  console.log(`   Cần: ${example.neededQuantity}ml`);
  console.log(`   Đủ không? ${totalCompatible >= example.neededQuantity ? "✅ ĐỦ" : "❌ THIẾU"}`);
  console.log(`   Status sẽ là: ${totalCompatible >= example.neededQuantity ? "Pending" : "Opened"}`);
  console.log(`   Kết quả mong đợi: ${example.shouldBeStatus}`);
  
  const isCorrect = (totalCompatible >= example.neededQuantity ? "Pending" : "Opened") === example.shouldBeStatus;
  console.log(`   Kết quả: ${isCorrect ? "✅ ĐÚNG" : "❌ SAI"}`);
});

console.log("\n" + "=".repeat(60));
console.log("🎯 KẾT LUẬN:");
console.log("Logic mới sẽ kiểm tra tổng số lượng từ TẤT CẢ nhóm máu tương thích");
console.log("thay vì chỉ kiểm tra nhóm máu cần thiết như trước đây.");
console.log("Điều này giúp tận dụng tối đa nguồn máu có sẵn!");
console.log("=".repeat(60));
