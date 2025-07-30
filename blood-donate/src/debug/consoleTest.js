// API Debug Console Script
// Copy và paste đoạn code này vào browser console để test API

console.log("🔧 API Debug Script Loaded");

// Function để test search với client-side filtering
async function testClientSideSearch(searchTerm = "Giao") {
  console.log(`\n=== Testing Client-Side Search for "${searchTerm}" ===`);

  try {
    // Import API functions dynamically
    const userManagementApi = await import(
      "/src/services/userManagementApi.js"
    );

    console.log("✅ API module imported successfully");

    // Test get all users first
    console.log("\n--- Testing getAllUsers ---");
    const allUsers = await userManagementApi.getAllUsers();
    console.log("All users result:", allUsers);
    console.log(
      `Found ${Array.isArray(allUsers) ? allUsers.length : "unknown"} users`
    );

    if (Array.isArray(allUsers) && allUsers.length > 0) {
      console.log("Sample user structure:", allUsers[0]);

      // Show all available field names in the first user
      const fields = Object.keys(allUsers[0]);
      console.log("Available fields in user objects:", fields);
    }

    // Test search function
    console.log(`\n--- Testing searchUserByName for "${searchTerm}" ---`);
    const searchResults = await userManagementApi.searchUserByName(searchTerm);
    console.log("Search results:", searchResults);
    console.log(
      `Found ${
        Array.isArray(searchResults) ? searchResults.length : "unknown"
      } matching users`
    );

    if (Array.isArray(searchResults) && searchResults.length > 0) {
      console.log("Sample search result:", searchResults[0]);
    }

    return { allUsers, searchResults };
  } catch (error) {
    console.error("❌ Error in test:", error);
    return null;
  }
}

// Function để test authentication
function testAuth() {
  console.log("\n=== Testing Authentication ===");

  const tokens = {
    userToken: localStorage.getItem("userToken"),
    token: localStorage.getItem("token"),
    authToken: localStorage.getItem("authToken"),
    userRole: localStorage.getItem("userRole"),
    role: localStorage.getItem("role"),
    userInfo: localStorage.getItem("userInfo"),
  };

  console.log("LocalStorage tokens:", tokens);

  // Parse userInfo if available
  if (tokens.userInfo) {
    try {
      const userInfo = JSON.parse(tokens.userInfo);
      console.log("Parsed userInfo:", userInfo);
    } catch (error) {
      console.error("Failed to parse userInfo:", error);
    }
  }

  return tokens;
}

// Function để test các endpoints trực tiếp
async function testEndpointsDirectly() {
  console.log("\n=== Testing Endpoints Directly ===");

  const API_BASE_URL = "http://localhost:7262";

  // Get auth token
  const token =
    localStorage.getItem("userToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken");
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  console.log("Using headers:", headers);

  const endpointsToTest = [
    { name: "Get All Users", url: `${API_BASE_URL}/api/User/Get-All-User` },
    { name: "Get All Users (alternative)", url: `${API_BASE_URL}/api/User` },
    {
      name: "Search by name",
      url: `${API_BASE_URL}/api/User/Search-User-By-Name?name=Giao`,
    },
  ];

  const results = [];

  for (const endpoint of endpointsToTest) {
    try {
      console.log(`\nTesting: ${endpoint.name}`);
      console.log(`URL: ${endpoint.url}`);

      const response = await fetch(endpoint.url, {
        method: "GET",
        headers: headers,
      });

      const result = {
        name: endpoint.name,
        url: endpoint.url,
        status: response.status,
        ok: response.ok,
        statusText: response.statusText,
      };

      if (response.ok) {
        try {
          const data = await response.json();
          result.dataType = Array.isArray(data) ? "Array" : typeof data;
          result.dataLength = Array.isArray(data) ? data.length : "N/A";
          result.sample =
            Array.isArray(data) && data.length > 0 ? data[0] : data;
          console.log(`✅ Success:`, result);
        } catch (jsonError) {
          result.error = "Failed to parse JSON response";
          console.log(`⚠️ Success but JSON error:`, result);
        }
      } else {
        try {
          const errorData = await response.json();
          result.errorData = errorData;
        } catch (jsonError) {
          result.errorData = "Could not parse error response";
        }
        console.log(`❌ Failed:`, result);
      }

      results.push(result);
    } catch (error) {
      const result = {
        name: endpoint.name,
        url: endpoint.url,
        error: error.message,
      };
      console.log(`💥 Network error:`, result);
      results.push(result);
    }
  }

  return results;
}

// Function để chạy tất cả tests
async function runAllDebugTests() {
  console.log("🚀 Starting Complete API Debug Tests\n");

  const results = {};

  // Test 1: Authentication
  results.auth = testAuth();

  // Test 2: Direct endpoint testing
  results.endpoints = await testEndpointsDirectly();

  // Test 3: Client-side search testing
  results.search = await testClientSideSearch("Giao");

  console.log("\n🏁 All debug tests completed!");
  console.log("=== SUMMARY ===");
  console.log("Full results:", results);

  return results;
}

// Auto-run the debug test
console.log("🎯 To run debug tests, use these commands:");
console.log("- runAllDebugTests() - Run all tests");
console.log("- testAuth() - Test authentication only");
console.log("- testEndpointsDirectly() - Test endpoints directly");
console.log('- testClientSideSearch("searchterm") - Test search function');

// Make functions available globally
window.runAllDebugTests = runAllDebugTests;
window.testAuth = testAuth;
window.testEndpointsDirectly = testEndpointsDirectly;
window.testClientSideSearch = testClientSideSearch;

console.log("\n✨ Ready! Type runAllDebugTests() to start testing.");
