// SIMPLE API TEST - Copy và paste vào browser console

// Test 1: Check authentication
console.log("=== AUTH TEST ===");
const token =
  localStorage.getItem("userToken") ||
  localStorage.getItem("token") ||
  localStorage.getItem("authToken");
console.log("Token found:", !!token);
console.log(
  "Token preview:",
  token ? token.substring(0, 20) + "..." : "No token"
);

// Test 2: Test API directly
console.log("\n=== DIRECT API TEST ===");
async function quickApiTest() {
  const API_BASE_URL = "http://localhost:7262";
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  try {
    console.log("Testing get all users...");
    const response = await fetch(`${API_BASE_URL}/api/User/Get-All-User`, {
      method: "GET",
      headers: headers,
    });

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);

    if (response.ok) {
      const data = await response.json();
      console.log("Data received:", data);
      console.log("Data type:", Array.isArray(data) ? "Array" : typeof data);
      console.log("Data length:", Array.isArray(data) ? data.length : "N/A");

      if (Array.isArray(data) && data.length > 0) {
        console.log("Sample user:", data[0]);
        console.log("User fields:", Object.keys(data[0]));

        // Test search by filtering
        const searchTerm = "Giao";
        const filtered = data.filter((user) => {
          const fullName = (
            user.fullName ||
            user.FullName ||
            user.name ||
            ""
          ).toLowerCase();
          const username = (user.username || user.userName || "").toLowerCase();
          const email = (user.email || user.Email || "").toLowerCase();
          return (
            fullName.includes(searchTerm.toLowerCase()) ||
            username.includes(searchTerm.toLowerCase()) ||
            email.includes(searchTerm.toLowerCase())
          );
        });

        console.log(`Filtered results for "${searchTerm}":`, filtered);
        console.log(`Found ${filtered.length} matches`);
      }
    } else {
      const errorText = await response.text();
      console.log("Error response:", errorText);
    }
  } catch (error) {
    console.error("API test failed:", error);
  }
}

// Run the test
quickApiTest();
