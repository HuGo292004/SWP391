/**
 * Test file để kiểm tra blood type compatibility logic
 * Chạy file này để verify logic tương thích nhóm máu
 */

import {
  getCompatibleDonorBloodTypes,
  canMemberDonateForEmergency,
  BLOOD_TYPE_MAP,
  BLOOD_TYPE_ID_MAP,
  getBloodTypeFromID,
  getBloodTypeID
} from '../utils/bloodTypeCompatibility.js';

// Test cases
const testCases = [
  {
    name: "O- Universal Donor",
    donorBloodType: "O-",
    compatibleRecipients: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    shouldWork: true
  },
  {
    name: "AB+ Universal Recipient", 
    recipientBloodType: "AB+",
    compatibleDonors: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    shouldWork: true
  },
  {
    name: "A+ can receive from A+, A-, O+, O-",
    recipientBloodType: "A+", 
    compatibleDonors: ["A+", "A-", "O+", "O-"],
    incompatibleDonors: ["B+", "B-", "AB+", "AB-"],
    shouldWork: true
  },
  {
    name: "B- can only receive from B-, O-",
    recipientBloodType: "B-",
    compatibleDonors: ["B-", "O-"],
    incompatibleDonors: ["A+", "A-", "B+", "AB+", "AB-", "O+"],
    shouldWork: true
  }
];

console.log("🧪 Testing Blood Type Compatibility Logic");
console.log("=" * 50);

// Test mapping functions
console.log("\n📋 Testing Blood Type Mapping:");
console.log("A+ ID:", getBloodTypeID("A+"));
console.log("O- from ID:", getBloodTypeFromID("11111111-1111-1111-1111-111111111008"));

// Test compatibility logic
testCases.forEach((testCase, index) => {
  console.log(`\n🔬 Test ${index + 1}: ${testCase.name}`);
  
  if (testCase.recipientBloodType && testCase.compatibleDonors) {
    const actualCompatible = getCompatibleDonorBloodTypes(testCase.recipientBloodType);
    const expectedSet = new Set(testCase.compatibleDonors);
    const actualSet = new Set(actualCompatible);
    
    const isCorrect = expectedSet.size === actualSet.size && 
                     [...expectedSet].every(type => actualSet.has(type));
    
    console.log(`  Recipients can receive from: ${actualCompatible.join(", ")}`);
    console.log(`  Expected: ${testCase.compatibleDonors.join(", ")}`);
    console.log(`  ✅ ${isCorrect ? "PASS" : "❌ FAIL"}`);
    
    // Test incompatible donors if provided
    if (testCase.incompatibleDonors) {
      testCase.incompatibleDonors.forEach(donorType => {
        const canDonate = actualCompatible.includes(donorType);
        console.log(`  ${donorType} → ${testCase.recipientBloodType}: ${canDonate ? "❌ SHOULD NOT WORK" : "✅ CORRECTLY BLOCKED"}`);
      });
    }
  }
});

// Test emergency request scenario
console.log("\n🚨 Testing Emergency Request Scenarios:");

const emergencyScenarios = [
  {
    memberBloodType: "O-",
    neededBloodType: "A+", 
    canHelp: true,
    description: "O- can help A+ (universal donor)"
  },
  {
    memberBloodType: "A+", 
    neededBloodType: "B+",
    canHelp: false,
    description: "A+ cannot help B+ (incompatible)"
  },
  {
    memberBloodType: "AB+",
    neededBloodType: "O+", 
    canHelp: false,
    description: "AB+ cannot help O+ (AB+ can only help AB+)"
  },
  {
    memberBloodType: "O+",
    neededBloodType: "AB-",
    canHelp: false, 
    description: "O+ cannot help AB- (Rh mismatch)"
  }
];

emergencyScenarios.forEach((scenario, index) => {
  const memberTypeID = getBloodTypeID(scenario.memberBloodType);
  const neededTypeID = getBloodTypeID(scenario.neededBloodType);
  
  const canHelp = canMemberDonateForEmergency(memberTypeID, neededTypeID);
  const result = canHelp === scenario.canHelp ? "✅ CORRECT" : "❌ WRONG";
  
  console.log(`  Scenario ${index + 1}: ${scenario.description}`);
  console.log(`    Member: ${scenario.memberBloodType} → Emergency: ${scenario.neededBloodType}`);
  console.log(`    Can help: ${canHelp} (expected: ${scenario.canHelp}) ${result}`);
});

console.log("\n🎯 Blood Type Compatibility Tests Complete!");

export { testCases };
