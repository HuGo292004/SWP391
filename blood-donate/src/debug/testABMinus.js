/**
 * Kiểm tra vấn đề AB- compatibility
 */

// Mock compatibility data
const compatibilityMap = {
  "O-": ["O-"],
  "O+": ["O-", "O+"],
  "A-": ["O-", "A-"],
  "A+": ["O-", "O+", "A-", "A+"],
  "B-": ["O-", "B-"],
  "B+": ["O-", "O+", "B-", "B+"],
  "AB-": ["O-", "A-", "B-", "AB-"],
  "AB+": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"]
};

function getCompatibleDonorBloodTypes(bloodType) {
  return compatibilityMap[bloodType] || [];
}

console.log("🔍 PHÂN TÍCH VẤN ĐỀ AB- TRONG ẢNH");
console.log("=" * 50);

// Dữ liệu từ ảnh
const testCase = {
  neededType: "AB-",
  neededQuantity: 450,
  availableBlood: [
    { type: "B-", quantity: 550, status: "available" },
    { type: "O-", quantity: 550, status: "available" },
    { type: "O-", quantity: 350, status: "available" },
    { type: "AB-", quantity: 300, status: "available" }
  ]
};

const compatible = getCompatibleDonorBloodTypes(testCase.neededType);

console.log("Nhóm máu cần:", testCase.neededType);
console.log("Có thể nhận từ:", compatible.join(", "));
console.log("Số lượng cần:", testCase.neededQuantity + "ml");

console.log("\nPhân tích từng đơn vị máu:");
console.log("-" * 40);

let totalCompatible = 0;
testCase.availableBlood.forEach((unit, i) => {
  const isCompatible = compatible.includes(unit.type);
  const isAvailable = unit.status === "available";
  
  console.log(`${i+1}. ${unit.type}: ${unit.quantity}ml (${unit.status})`);
  console.log(`   Tương thích với AB-?: ${isCompatible ? "✅ CÓ" : "❌ KHÔNG"}`);
  console.log(`   Trạng thái available?: ${isAvailable ? "✅ CÓ" : "❌ KHÔNG"}`);
  
  if (isCompatible && isAvailable) {
    totalCompatible += unit.quantity;
    console.log(`   → Cộng vào tổng: +${unit.quantity}ml`);
  } else {
    console.log(`   → Không tính vào tổng`);
  }
  console.log("");
});

console.log("=" * 50);
console.log("KẾT QUẢ PHÂN TÍCH:");
console.log(`Tổng máu tương thích: ${totalCompatible}ml`);
console.log(`Lượng cần: ${testCase.neededQuantity}ml`);
console.log(`Đủ không?: ${totalCompatible >= testCase.neededQuantity ? "✅ ĐỦ" : "❌ THIẾU"}`);
console.log(`Status nên là: ${totalCompatible >= testCase.neededQuantity ? "PENDING" : "OPENED"}`);

console.log("\n❗ NGUYÊN NHÂN CÓ THỂ:");
console.log("1. Yêu cầu được tạo TRƯỚC KHI cập nhật logic mới");
console.log("2. Browser cache hoặc server cache kết quả cũ");
console.log("3. Code chưa được deploy hoặc server chưa restart");
console.log("4. Logic mới chưa được áp dụng cho yêu cầu này");

console.log("\n🔧 CÁCH KIỂM TRA:");
console.log("1. Tạo yêu cầu mới với AB- 450ml");
console.log("2. Mở Developer Tools và xem Console");
console.log("3. Kiểm tra log từ getAvailableQuantityByCompatibleBloodTypes");
console.log("4. Xem status của yêu cầu mới");

console.log("\n✅ LOGIC ĐÚNG:");
console.log(`AB- có thể nhận từ: ${compatible.join(", ")}`);
console.log(`Với ${totalCompatible}ml có sẵn, yêu cầu ${testCase.neededQuantity}ml nên là PENDING!`);
