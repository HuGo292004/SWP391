/**
 * Test validation cho input số lượng máu cần
 * Kiểm tra các trường hợp edge cases
 */

console.log("🩸 KIỂM TRA VALIDATION SỐ LƯỢNG MÁU");
console.log("=" * 50);

// Test cases cho validation
const testCases = [
  // Valid cases
  { value: "250", expected: "✅ VALID", reason: "Tối thiểu cho phép" },
  { value: "450", expected: "✅ VALID", reason: "1 đơn vị máu tiêu chuẩn" },
  { value: "900", expected: "✅ VALID", reason: "2 đơn vị máu" },
  { value: "1500", expected: "✅ VALID", reason: "Trong giới hạn cho phép" },
  { value: "2000", expected: "✅ VALID", reason: "Tối đa cho phép" },
  
  // Invalid cases - Empty/null
  { value: "", expected: "❌ INVALID", reason: "Không được để trống" },
  { value: null, expected: "❌ INVALID", reason: "Giá trị null" },
  { value: undefined, expected: "❌ INVALID", reason: "Giá trị undefined" },
  
  // Invalid cases - Not positive integer
  { value: "0", expected: "❌ INVALID", reason: "Bằng 0" },
  { value: "-100", expected: "❌ INVALID", reason: "Số âm" },
  { value: "150.5", expected: "❌ INVALID", reason: "Số thập phân" },
  { value: "abc", expected: "❌ INVALID", reason: "Không phải số" },
  
  // Invalid cases - Below minimum
  { value: "100", expected: "❌ INVALID", reason: "Dưới tối thiểu 250ml" },
  { value: "249", expected: "❌ INVALID", reason: "Dưới tối thiểu 1ml" },
  
  // Invalid cases - Above maximum  
  { value: "2001", expected: "❌ INVALID", reason: "Vượt tối đa 1ml" },
  { value: "5000", expected: "❌ INVALID", reason: "Vượt tối đa rất nhiều" },
  { value: "10000", expected: "❌ INVALID", reason: "Vượt tối đa quá mức" }
];

// Validation function (giống logic trong code)
function validateQuantity(value) {
  // Check required
  if (!value || value === "" || value === null || value === undefined) {
    return { valid: false, error: "Số lượng máu cần là bắt buộc" };
  }
  
  // Parse to integer
  const quantity = parseInt(value);
  
  // Check positive integer
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return { valid: false, error: "Số lượng máu phải là số nguyên dương" };
  }
  
  // Check minimum
  if (quantity < 250) {
    return { valid: false, error: "Tối thiểu cần 250ml máu" };
  }
  
  // Check maximum
  if (quantity > 2000) {
    return { valid: false, error: "Không được yêu cầu quá 2000ml máu" };
  }
  
  return { valid: true, error: null };
}

console.log("\nKết quả kiểm tra validation:");
console.log("-".repeat(80));

testCases.forEach((testCase, index) => {
  const result = validateQuantity(testCase.value);
  const actualResult = result.valid ? "✅ VALID" : "❌ INVALID";
  const isCorrect = actualResult === testCase.expected;
  
  console.log(`Test ${index + 1}: ${testCase.value || 'empty'}`);
  console.log(`  Mong đợi: ${testCase.expected}`);
  console.log(`  Thực tế: ${actualResult}`);
  console.log(`  Lý do: ${testCase.reason}`);
  if (!result.valid) {
    console.log(`  Lỗi: ${result.error}`);
  }
  console.log(`  Kết quả: ${isCorrect ? '✅ ĐÚNG' : '❌ SAI'}`);
  console.log('');
});

console.log("=" * 50);
console.log("📋 TÓM TẮT QUY TẮC VALIDATION:");
console.log("1. Bắt buộc nhập - Không được để trống");
console.log("2. Phải là số nguyên dương - Chỉ chấp nhận số nguyên > 0");
console.log("3. Tối thiểu 250ml - Tương đương ≈ 0.5 đơn vị máu");
console.log("4. Tối đa 2000ml - Tương đương ≈ 4.4 đơn vị máu");
console.log("=" * 50);

// Test edge cases around boundaries
console.log("\n🔍 KIỂM TRA BIÊN (BOUNDARY TESTING):");
console.log("-".repeat(50));

const boundaryTests = [
  { value: "249", shouldPass: false, note: "1ml dưới tối thiểu" },
  { value: "250", shouldPass: true, note: "Đúng tối thiểu" },
  { value: "251", shouldPass: true, note: "1ml trên tối thiểu" },
  { value: "1999", shouldPass: true, note: "1ml dưới tối đa" },
  { value: "2000", shouldPass: true, note: "Đúng tối đa" },
  { value: "2001", shouldPass: false, note: "1ml trên tối đa" }
];

boundaryTests.forEach((test, index) => {
  const result = validateQuantity(test.value);
  const passed = result.valid === test.shouldPass;
  
  console.log(`Boundary Test ${index + 1}: ${test.value}ml`);
  console.log(`  ${test.note}`);
  console.log(`  Kết quả: ${result.valid ? 'PASS' : 'FAIL'}`);
  console.log(`  Mong đợi: ${test.shouldPass ? 'PASS' : 'FAIL'}`);
  console.log(`  Status: ${passed ? '✅ ĐÚNG' : '❌ SAI'}`);
  if (!result.valid) {
    console.log(`  Lỗi: ${result.error}`);
  }
  console.log('');
});

console.log("✅ VALIDATION TESTING COMPLETED!");
