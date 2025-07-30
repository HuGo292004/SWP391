// API Test Functions
// Bạn có thể chạy các function này trong browser console để test API

import {
  testApiConnection,
  testSearchEndpoints,
  checkAvailableEndpoints,
  searchUserByName,
  getAllUsers,
  getCurrentUserRole,
  hasValidToken,
} from "../services/userManagementApi.js";

// Test basic API connection
export const testBasicConnection = async () => {
  console.log("=== Testing Basic API Connection ===");
  try {
    const result = await testApiConnection();
    console.log("Basic connection test result:", result);
    return result;
  } catch (error) {
    console.error("Basic connection test failed:", error);
    return { success: false, error: error.message };
  }
};

// Test search endpoints with different names
export const testSearchFunctions = async () => {
  console.log("=== Testing Search Functions ===");
  const testNames = ["Giao", "Admin", "Test", "User"];

  for (const testName of testNames) {
    console.log(`\n--- Testing search with: "${testName}" ---`);
    try {
      const results = await searchUserByName(testName);
      console.log(`Search results for "${testName}":`, results);
      console.log(
        `Found ${Array.isArray(results) ? results.length : "unknown"} users`
      );
    } catch (error) {
      console.error(`Search failed for "${testName}":`, error);
    }
  }
};

// Test search endpoints availability
export const testSearchEndpointsAvailability = async () => {
  console.log("=== Testing Search Endpoints Availability ===");
  try {
    const results = await testSearchEndpoints("Giao");
    console.log("Search endpoints test results:", results);

    const workingEndpoints = results.filter((r) => r.success);
    const failedEndpoints = results.filter((r) => !r.success);

    console.log(
      `Working endpoints (${workingEndpoints.length}):`,
      workingEndpoints
    );
    console.log(
      `Failed endpoints (${failedEndpoints.length}):`,
      failedEndpoints
    );

    return results;
  } catch (error) {
    console.error("Search endpoints test failed:", error);
    return [];
  }
};

// Check available endpoints
export const testAvailableEndpoints = async () => {
  console.log("=== Testing Available Endpoints ===");
  try {
    const results = await checkAvailableEndpoints();
    console.log("Available endpoints test results:", results);

    const workingEndpoints = results.filter((r) => r.success);
    const failedEndpoints = results.filter((r) => !r.success);

    console.log(
      `Working base endpoints (${workingEndpoints.length}):`,
      workingEndpoints
    );
    console.log(
      `Failed base endpoints (${failedEndpoints.length}):`,
      failedEndpoints
    );

    return results;
  } catch (error) {
    console.error("Available endpoints test failed:", error);
    return [];
  }
};

// Test get all users
export const testGetAllUsers = async () => {
  console.log("=== Testing Get All Users ===");
  try {
    const users = await getAllUsers();
    console.log("All users result:", users);
    console.log(
      `Total users: ${Array.isArray(users) ? users.length : "unknown format"}`
    );

    if (Array.isArray(users) && users.length > 0) {
      console.log("Sample user structure:", users[0]);
    }

    return users;
  } catch (error) {
    console.error("Get all users failed:", error);
    return null;
  }
};

// Test authentication status
export const testAuthStatus = () => {
  console.log("=== Testing Authentication Status ===");

  const hasToken = hasValidToken();
  const userRole = getCurrentUserRole();

  console.log("Has valid token:", hasToken);
  console.log("Current user role:", userRole);

  // Check localStorage for tokens
  const tokens = {
    userToken: localStorage.getItem("userToken"),
    token: localStorage.getItem("token"),
    authToken: localStorage.getItem("authToken"),
    userRole: localStorage.getItem("userRole"),
    role: localStorage.getItem("role"),
    userInfo: localStorage.getItem("userInfo"),
  };

  console.log("LocalStorage tokens:", tokens);

  return { hasToken, userRole, tokens };
};

// Run all tests
export const runAllTests = async () => {
  console.log("🚀 Starting comprehensive API tests...\n");

  const results = {};

  // Test 1: Auth status
  results.authStatus = testAuthStatus();
  console.log("\n");

  // Test 2: Available endpoints
  results.availableEndpoints = await testAvailableEndpoints();
  console.log("\n");

  // Test 3: Basic connection
  results.basicConnection = await testBasicConnection();
  console.log("\n");

  // Test 4: Get all users
  results.allUsers = await testGetAllUsers();
  console.log("\n");

  // Test 5: Search endpoints availability
  results.searchEndpoints = await testSearchEndpointsAvailability();
  console.log("\n");

  // Test 6: Search functions
  await testSearchFunctions();
  console.log("\n");

  console.log("🏁 All tests completed!");
  console.log("Summary results:", results);

  return results;
};

// Instructions for manual testing
export const getTestInstructions = () => {
  const instructions = `
🔧 API Testing Instructions:

1. Open browser console (F12)
2. Navigate to your app
3. Make sure you're logged in
4. Copy and paste these commands one by one:

// Import the test functions (if using modules)
import('./debug/apiTest.js').then(module => {
  window.apiTest = module;
  console.log('API test functions loaded. Use window.apiTest.runAllTests()');
});

// Or if already imported:
window.apiTest.runAllTests();

// Individual tests:
window.apiTest.testAuthStatus();
window.apiTest.testBasicConnection();
window.apiTest.testGetAllUsers();
window.apiTest.testSearchEndpointsAvailability();
window.apiTest.testSearchFunctions();

5. Check the console output for detailed results
6. Look for any errors or failed endpoints
7. Report the results to the developer

📝 What to look for:
- ✅ Green success messages
- ❌ Red error messages
- 🔍 Search results count
- 🔑 Authentication status
- 🌐 API endpoint responses
`;

  console.log(instructions);
  return instructions;
};

// Export for global access
if (typeof window !== "undefined") {
  window.apiTest = {
    testBasicConnection,
    testSearchFunctions,
    testSearchEndpointsAvailability,
    testAvailableEndpoints,
    testGetAllUsers,
    testAuthStatus,
    runAllTests,
    getTestInstructions,
  };
}
