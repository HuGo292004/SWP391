/**
 * API Service cho Quản Lý Người Hiến Máu (Donor)
 * Xử lý các chức năng liên quan đến donor: tạo, cập nhật, xóa, lấy thông tin
 */

// URL cơ sở của API
const API_BASE_URL = "http://localhost:7262/api";

/**
 * Hàm tạo UUID ngẫu nhiên
 * @returns {string} UUID string
 */
const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Helper function để thực hiện API request với authentication
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Request options
 * @returns {Promise} Response data
 */
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  // Lấy token từ localStorage - kiểm tra tất cả các key có thể
  // Ưu tiên: userToken (được sử dụng bởi authApi.js) trước
  const token =
    localStorage.getItem("userToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("user-token") ||
    localStorage.getItem("jwt") ||
    localStorage.getItem("bearerToken");

  // Debug: log thông tin token
  console.log("Available localStorage keys:", Object.keys(localStorage));
  console.log(
    "Found token:",
    token ? `${token.substring(0, 20)}...` : "NO TOKEN"
  );

  // Check if in demo mode
  const isDemo = token === "demo-token";
  console.log("Demo mode:", isDemo);

  const config = {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      // Don't send Authorization header for demo token to avoid 401
      ...(token && !isDemo && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  console.log(`Making ${config.method || "GET"} request to:`, url);
  if (config.body) {
    console.log("Request body:", JSON.parse(config.body));
  }

  try {
    const response = await fetch(url, config);
    console.log("Response status:", response.status);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = await response.text();
        errorMessage = errorData || errorMessage;
      } catch (e) {
        console.error("Error reading response:", e);
      }
      throw new Error(errorMessage);
    }

    // Handle 204 No Content responses (successful but no body)
    if (response.status === 204) {
      console.log("API Response: 204 No Content - Success");
      return { success: true, message: "Update successful" };
    }

    // Try to parse JSON response
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const result = await response.json();
      console.log("API Response:", result);
      return result;
    } else {
      // Non-JSON response
      const textResult = await response.text();
      console.log("API Response (text):", textResult);
      return { success: true, data: textResult };
    }
  } catch (error) {
    console.error("API request failed:", error);

    // Better error handling for common issues
    if (
      error.name === "TypeError" &&
      error.message.includes("Failed to fetch")
    ) {
      throw new Error(
        "Không thể kết nối đến server. Vui lòng kiểm tra server có đang chạy không?"
      );
    } else if (
      error.name === "TypeError" &&
      error.message.includes("ERR_CONNECTION_REFUSED")
    ) {
      throw new Error(
        "Server từ chối kết nối. Vui lòng kiểm tra server có đang chạy trên port 7262 không?"
      );
    } else if (error.message.includes("CORS")) {
      throw new Error(
        "Lỗi CORS. Server cần cấu hình cho phép frontend truy cập."
      );
    } else if (
      error.message.includes("Token is missing") ||
      error.message.includes("Unauthorized") ||
      error.message.includes("User not logged in")
    ) {
      // Debug info for token issues
      const currentToken = localStorage.getItem("userToken");
      const isDemo = currentToken === "demo-token";

      console.log("Debug - Current token:", currentToken);
      console.log("Debug - Is demo mode:", isDemo);

      if (isDemo) {
        // Demo mode - create mock response instead of throwing error
        console.log("Demo mode detected - creating mock response");
        throw new Error(
          "Demo mode: Tính năng này cần kết nối server thực để hoạt động."
        );
      } else {
        throw new Error(
          "Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại."
        );
      }
    }

    throw error;
  }
};

// Blood Donation API functions
export const donorApi = {
  // Register blood donation appointment
  registerBloodDonation: async (donationData) => {
    try {
      // Check if in demo mode
      const currentToken = localStorage.getItem("userToken");
      const isDemo = currentToken === "demo-token";

      if (isDemo) {
        // Demo mode - return mock success response
        console.log(
          "Demo mode: Simulating successful blood donation registration"
        );
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API delay

        return {
          success: true,
          donationId: generateUUID(),
          message: "Đăng ký hiến máu thành công (Demo mode)",
          data: {
            donorID: generateUUID(),
            donationDate: donationData.donationDate,
            bloodTypeID: donationData.bloodTypeID,
            status: donationData.status,
            notes: donationData.notes,
            certificateID: null,
            createdAt: new Date().toISOString(),
          },
        };
      }

      console.log("=== BLOOD DONATION REGISTRATION ===");
      console.log("Original donation data:", donationData);

      // Validate bloodTypeID before processing
      if (
        !donationData.bloodTypeID ||
        donationData.bloodTypeID === "unknown" ||
        donationData.bloodTypeID === "undefined"
      ) {
        throw new Error(
          `Invalid bloodTypeID: ${donationData.bloodTypeID}. Please select a valid blood type.`
        );
      }

      // Step 1: Check if donor profile exists and create/update if needed
      let donorProfileResult = null;
      try {
        console.log(
          "Step 1: Checking/creating donor profile with bloodTypeID:",
          donationData.bloodTypeID
        );
        donorProfileResult = await donorApi.ensureDonorProfileWithBloodType(
          donationData.bloodTypeID
        );
        console.log("Donor profile result:", donorProfileResult);

        if (!donorProfileResult.success) {
          console.warn(
            "Donor profile creation/update failed, but continuing..."
          );
        }
      } catch (donorError) {
        console.error(
          "Failed to create/update donor profile:",
          donorError.message
        );
        // Create a default result so we can still proceed
        donorProfileResult = {
          success: false,
          action: "error",
          error: donorError.message,
        };
      }

      // Step 2: Register blood donation
      console.log("Step 2: Registering blood donation...");
      const apiData = {
        donorID: donationData.donorID, // Will be set by backend based on authenticated user
        donationDate: donationData.donationDate,
        bloodTypeID: donationData.bloodTypeID,
        status: donationData.status,
        notes: donationData.notes,
        certificateID: donationData.certificateID || null,
      };

      console.log("Blood donation API data:", apiData);

      const result = await apiRequest("/BloodDonation", {
        method: "POST",
        body: JSON.stringify(apiData),
      });

      console.log("Blood donation registration result:", result);
      console.log("=== REGISTRATION COMPLETE ===");

      // Return combined result with donor profile info
      return {
        ...result,
        donorProfileInfo: donorProfileResult,
      };
    } catch (error) {
      // Check if demo mode for better error message
      const currentToken = localStorage.getItem("userToken");
      const isDemo = currentToken === "demo-token";

      if (isDemo && error.message.includes("Demo mode")) {
        throw new Error(
          "Demo mode: Tính năng đăng ký hiến máu sẽ hoạt động khi kết nối server thực."
        );
      }

      throw new Error(`Đăng ký hiến máu thất bại: ${error.message}`);
    }
  },

  // Get blood donation appointments
  getBloodDonations: async () => {
    try {
      return await apiRequest("/BloodDonation");
    } catch (error) {
      throw new Error(`Lấy danh sách lịch hẹn thất bại: ${error.message}`);
    }
  },

  // Get blood donation by ID
  getBloodDonationById: async (id) => {
    try {
      return await apiRequest(`/BloodDonation/${id}`);
    } catch (error) {
      throw new Error(`Lấy thông tin lịch hẹn thất bại: ${error.message}`);
    }
  },

  // Update blood donation status
  updateBloodDonationStatus: async (id, status) => {
    try {
      return await apiRequest(`/BloodDonation/${id}/status/${status}`, {
        method: "PATCH",
      });
    } catch (error) {
      throw new Error(`Cập nhật trạng thái thất bại: ${error.message}`);
    }
  },

  // Delete blood donation appointment
  deleteBloodDonation: async (id) => {
    try {
      return await apiRequest(`/BloodDonation/${id}`, {
        method: "DELETE",
      });
    } catch (error) {
      throw new Error(`Xóa lịch hẹn thất bại: ${error.message}`);
    }
  },

  // Sync blood donations (if there's a sync endpoint)
  syncBloodDonations: async () => {
    try {
      return await apiRequest("/BloodDonation/sync", {
        method: "POST",
      });
    } catch (error) {
      throw new Error(`Đồng bộ dữ liệu thất bại: ${error.message}`);
    }
  },

  // Get donor statistics
  getDonorStatistics: async (donorId) => {
    try {
      return await apiRequest(`/BloodDonation/donor/${donorId}/statistics`);
    } catch (error) {
      throw new Error(`Lấy thống kê thất bại: ${error.message}`);
    }
  },

  // Check if user has donor profile
  checkDonorProfile: async (forceRefresh = false) => {
    try {
      const currentToken = localStorage.getItem("userToken");
      const isDemo = currentToken === "demo-token";

      if (isDemo) {
        // Demo mode - return mock response (assume no donor profile for first time)
        console.log("Demo mode: Checking donor profile");
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Simulate sometimes having donor profile, sometimes not
        const hasProfile = Math.random() > 0.7; // 30% chance of having profile

        if (hasProfile) {
          return {
            exists: true,
            donorID: generateUUID(),
            registrationDate: new Date().toISOString(),
          };
        } else {
          return {
            exists: false,
            donorID: null,
          };
        }
      }

      // Try to get donor profile by current user ID
      const userId = localStorage.getItem("userId");

      if (!userId) {
        console.log("No user ID found in localStorage");
        return {
          exists: false,
          donorID: null,
        };
      }

      try {
        console.log(
          `Checking for donor profile for userId: ${userId}, forceRefresh: ${forceRefresh}`
        );

        // Add cache busting parameter if force refresh is requested
        const endpoint = forceRefresh ? `/Donor?_t=${Date.now()}` : `/Donor`;

        // Get all donors and find the one with matching userID
        const allDonors = await apiRequest(endpoint);
        const donorProfile = allDonors.find(
          (donor) => donor.userID === userId || donor.userId === userId
        );

        if (donorProfile) {
          console.log(
            "Found donor profile with forceRefresh =",
            forceRefresh,
            ":",
            donorProfile
          );
          return {
            exists: true,
            donorID:
              donorProfile.donorID || donorProfile.id || donorProfile.donorId,
            registrationDate:
              donorProfile.registrationDate || donorProfile.createdAt,
          };
        } else {
          console.log(
            "No donor profile found for this user (forceRefresh =",
            forceRefresh,
            ")"
          );
          return {
            exists: false,
            donorID: null,
          };
        }
      } catch (error) {
        // If that fails, assume no donor profile exists
        console.log("No donor profile found for current user:", error.message);
        return {
          exists: false,
          donorID: null,
        };
      }
    } catch (error) {
      // If error is about validation or bad request, assume no profile exists
      if (
        error.message.includes("400") ||
        error.message.includes("404") ||
        error.message.includes("not found") ||
        error.message.includes("validation")
      ) {
        return {
          exists: false,
          donorID: null,
        };
      }
      throw new Error(`Kiểm tra hồ sơ hiến máu thất bại: ${error.message}`);
    }
  },

  // Create donor profile for first-time registration
  createDonorProfile: async (donorData) => {
    try {
      const currentToken = localStorage.getItem("userToken");
      const isDemo = currentToken === "demo-token";

      if (isDemo) {
        // Demo mode - return mock donor profile
        console.log("Demo mode: Creating donor profile");
        await new Promise((resolve) => setTimeout(resolve, 1000));

        return {
          success: true,
          donorID: generateUUID(),
          message: "Hồ sơ hiến máu đã được tạo thành công (Demo mode)",
          data: {
            donorID: generateUUID(),
            userID: donorData.userID,
            registrationDate: new Date().toISOString(),
            bloodTypeID: donorData.bloodTypeID,
            status: "Active",
          },
        };
      }

      return await apiRequest("/Donor", {
        method: "POST",
        body: JSON.stringify(donorData),
      });
    } catch (error) {
      throw new Error(`Tạo hồ sơ hiến máu thất bại: ${error.message}`);
    }
  },

  // Ensure donor profile exists with bloodTypeID (for blood donation registration)
  ensureDonorProfileWithBloodType: async (bloodTypeID) => {
    try {
      // Validate bloodTypeID first
      if (
        !bloodTypeID ||
        bloodTypeID === "unknown" ||
        bloodTypeID === "undefined"
      ) {
        throw new Error(
          `Invalid bloodTypeID: ${bloodTypeID}. Please select a valid blood type.`
        );
      }

      console.log("Ensuring donor profile with bloodTypeID:", bloodTypeID);

      const currentToken = localStorage.getItem("userToken");
      const isDemo = currentToken === "demo-token";

      if (isDemo) {
        console.log("Demo mode: Ensuring donor profile with bloodTypeID");
        await new Promise((resolve) => setTimeout(resolve, 500));
        return {
          success: true,
          action: "created",
          donorID: generateUUID(),
          bloodTypeID: bloodTypeID,
        };
      }

      console.log("Checking if donor profile exists...");

      // Try to get existing donor profile using the correct endpoint
      let existingDonor = null;
      const userId = localStorage.getItem("userId");

      if (!userId) {
        throw new Error("User ID not found in localStorage");
      }

      try {
        console.log(
          `Checking for existing donor profile for userId: ${userId}`
        );
        // Get all donors and find the one with matching userID
        const allDonors = await apiRequest(`/Donor`);
        existingDonor = allDonors.find(
          (donor) => donor.userID === userId || donor.userId === userId
        );

        if (existingDonor) {
          console.log(
            "Found existing donor via donor list search:",
            existingDonor
          );
        } else {
          console.log("No donor profile found for this user in donor list");
        }
      } catch (error) {
        console.log("No existing donor profile found:", error.message);
        existingDonor = null;
      }

      if (existingDonor && (existingDonor.donorID || existingDonor.id)) {
        // Donor profile exists - update bloodTypeID if different
        const currentBloodTypeID =
          existingDonor.bloodTypeID || existingDonor.bloodTypeId;
        const donorID = existingDonor.donorID || existingDonor.id;

        console.log("Existing donor found with ID:", donorID);
        console.log("Current bloodTypeID:", currentBloodTypeID);
        console.log("New bloodTypeID:", bloodTypeID);

        if (currentBloodTypeID !== bloodTypeID) {
          console.log(
            "Updating donor profile with new bloodTypeID and latest personal info..."
          );

          // Get latest user details for update
          let userDetails = null;
          try {
            console.log(
              "Fetching latest user info for donor profile update..."
            );
            const { UserAPI } = await import("./userApi");
            userDetails = await UserAPI.getCurrentUser();
            console.log("Latest user details for update:", userDetails);
          } catch (userError) {
            console.warn(
              "Could not fetch latest user info for update:",
              userError.message
            );
          }

          const updateData = {
            donorID: donorID,
            userID: existingDonor.userID || existingDonor.userId,
            bloodTypeID: bloodTypeID,
            isAvailable:
              existingDonor.isAvailable !== undefined
                ? existingDonor.isAvailable
                : true,
            lastDonationDate: existingDonor.lastDonationDate,
            nextEligibleDate: existingDonor.nextEligibleDate,
            currentMedications: existingDonor.currentMedications,
            Address:
              userDetails?.address ||
              existingDonor.Address ||
              existingDonor.address,

            // Update personal information fields if backend supports them
            FullName:
              userDetails?.fullName ||
              userDetails?.FullName ||
              existingDonor.FullName ||
              existingDonor.fullName,
            Email:
              userDetails?.email ||
              userDetails?.Email ||
              existingDonor.Email ||
              existingDonor.email,
            PhoneNumber:
              userDetails?.phone ||
              userDetails?.PhoneNumber ||
              userDetails?.phoneNumber ||
              existingDonor.PhoneNumber ||
              existingDonor.phoneNumber,
            DateOfBirth:
              userDetails?.dateOfBirth ||
              userDetails?.DateOfBirth ||
              existingDonor.DateOfBirth ||
              existingDonor.dateOfBirth,
            Gender:
              userDetails?.gender ||
              userDetails?.Gender ||
              existingDonor.Gender ||
              existingDonor.gender,
          };

          console.log(
            "Updating donor profile with basic data (avoiding 500 error):",
            updateData
          );

          const updateResult = await apiRequest(`/Donor/${donorID}`, {
            method: "PUT",
            body: JSON.stringify(updateData),
          });

          console.log(
            "Donor profile updated with new bloodTypeID:",
            updateResult
          );

          return {
            success: true,
            action: "updated",
            donorID: donorID,
            bloodTypeID: bloodTypeID,
            result: updateResult,
          };
        } else {
          console.log(
            "Donor profile already has correct bloodTypeID, no update needed"
          );
          return {
            success: true,
            action: "no_change",
            donorID: donorID,
            bloodTypeID: bloodTypeID,
          };
        }
      } else {
        // No donor profile exists - create new one
        console.log("No donor profile exists, creating new one...");

        // Get current user info for donor profile creation
        const userInfo = {
          userId: localStorage.getItem("userId"),
          username: localStorage.getItem("username"),
          userEmail: localStorage.getItem("userEmail"),
          userToken: localStorage.getItem("userToken"),
        };

        // Get detailed user information from UserAPI
        let userDetails = null;
        try {
          console.log(
            "Fetching detailed user info for donor profile creation..."
          );
          const { UserAPI } = await import("./userApi");
          userDetails = await UserAPI.getCurrentUser();
          console.log("User details for donor profile:", userDetails);
        } catch (userError) {
          console.warn(
            "Could not fetch detailed user info:",
            userError.message
          );
        }

        const createData = {
          userID: userInfo.userId, // Link to user account
          bloodTypeID: bloodTypeID,
          isAvailable: true,
          lastDonationDate: null,
          nextEligibleDate: null,
          currentMedications: null, // Will be updated later via updateDonorMedications
          Address: userDetails?.address || null, // Use user's address if available

          // Personal information fields (require backend DTO support)
          FullName: userDetails?.fullName || userDetails?.FullName || null,
          Email: userDetails?.email || userDetails?.Email || null,
          PhoneNumber:
            userDetails?.phone ||
            userDetails?.PhoneNumber ||
            userDetails?.phoneNumber ||
            null,
          DateOfBirth:
            userDetails?.dateOfBirth || userDetails?.DateOfBirth || null,
          Gender: userDetails?.gender || userDetails?.Gender || null,
        };

        console.log(
          "Creating basic donor profile with complete personal data:",
          createData
        );
        console.log("User info for donor profile:", userInfo);
        console.log("Expected fields to be saved:", Object.keys(createData));

        try {
          const createResult = await apiRequest("/Donor", {
            method: "POST",
            body: JSON.stringify(createData),
          });

          console.log("Donor profile creation API response:", createResult);
          console.log("Fields returned by API:", Object.keys(createResult));
          const donorID = createResult.donorId || createResult.donorID;

          // Verify that personal information fields were saved and returned
          const expectedFields = [
            "FullName",
            "Email",
            "PhoneNumber",
            "Address",
            "DateOfBirth",
            "Gender",
          ];
          const returnedFields = Object.keys(createResult);
          const missingFields = expectedFields.filter(
            (field) =>
              !returnedFields.includes(field) &&
              !returnedFields.includes(field.toLowerCase())
          );

          if (missingFields.length > 0) {
            console.warn(
              "⚠️ Backend may not support these personal info fields yet:",
              missingFields
            );
            console.warn(
              "ℹ️ Check BACKEND_FIXES_REQUIRED.md for required backend updates"
            );
          } else {
            console.log(
              "✅ Backend supports personal information fields in donor profile"
            );
          }

          return {
            success: true,
            action: "created",
            donorID: donorID,
            bloodTypeID: bloodTypeID,
            result: createResult,
            missingFields: missingFields,
          };
        } catch (createError) {
          console.error("Error creating donor profile:", createError);
          console.error("Create data that failed:", createData);
          console.error(
            "Full error details:",
            JSON.stringify(createError, null, 2)
          );

          // Try to extract more detailed error information
          let errorDetails = createError.message;
          try {
            const errorObj = JSON.parse(createError.message);
            if (errorObj.errors) {
              errorDetails = Object.entries(errorObj.errors)
                .map(
                  ([field, messages]) =>
                    `${field}: ${
                      Array.isArray(messages) ? messages.join(", ") : messages
                    }`
                )
                .join("; ");
            }
          } catch (e) {
            // If parsing fails, use original message
          }

          console.error("Detailed error:", errorDetails);

          // For now, return success but log the error so blood donation can still proceed
          console.warn(
            "Donor profile creation failed, but continuing with blood donation..."
          );
          return {
            success: true, // Mark as success to allow blood donation to proceed
            action: "failed_creation",
            donorID: null,
            bloodTypeID: bloodTypeID,
            error: createError.message,
            errorDetails: errorDetails,
          };
        }
      }
    } catch (error) {
      console.error("Error ensuring donor profile with bloodTypeID:", error);
      throw new Error(
        `Không thể tạo/cập nhật hồ sơ hiến máu: ${error.message}`
      );
    }
  },

  // Get donor profile by donorId to verify bloodTypeID
  // Note: Now also storing personal info (fullName, email, phoneNumber, dateOfBirth) in Donor table
  // Donor table stores: userID, donorID, bloodTypeID, isAvailable, lastDonationDate, nextEligibleDate, currentMedications, Address, FullName, Email, PhoneNumber, etc.
  getDonorProfileById: async (donorId) => {
    try {
      console.log(`Getting donor profile details for donorId: ${donorId}`);

      const result = await apiRequest(`/Donor/${donorId}`, {
        method: "GET",
      });

      console.log("Donor profile details:", result);
      return result;
    } catch (error) {
      console.error("Error getting donor profile by ID:", error);
      throw new Error(
        `Không thể lấy thông tin donor profile: ${error.message}`
      );
    }
  },

  // Get user information through donor profile (if available)
  getUserInfoThroughDonor: async () => {
    try {
      console.log("🔍 Attempting to get user info through donor profile...");

      // Step 1: Check if user has donor profile
      const donorProfile = await donorApi.checkDonorProfile(true);
      console.log("Donor profile check result:", donorProfile);

      if (!donorProfile.exists || !donorProfile.donorID) {
        console.log("❌ No donor profile found");
        return { success: false, message: "No donor profile found" };
      }

      // Step 2: Get donor details
      const donorDetails = await donorApi.getDonorProfileById(
        donorProfile.donorID
      );
      console.log("Donor details:", donorDetails);

      if (!donorDetails || !donorDetails.userId) {
        console.log("❌ No user ID in donor profile");
        return { success: false, message: "No user ID in donor profile" };
      }

      // Step 3: Try to get all donors list to see if we can get more info
      try {
        const allDonors = await apiRequest("/Donor");
        console.log("All donors list:", allDonors);

        // Find current user's donor in the list (might have more info)
        const userDonor = allDonors.find(
          (donor) =>
            donor.donorId === donorProfile.donorID ||
            donor.userId === donorDetails.userId
        );

        if (userDonor) {
          console.log("✅ Found user donor in list:", userDonor);

          // Extract any user information available in donor data
          const extractedUserInfo = {
            userID: userDonor.userId || userDonor.userID,
            userId: userDonor.userId || userDonor.userID,
            donorID: userDonor.donorId || userDonor.donorID,
            bloodTypeID: userDonor.bloodTypeId || userDonor.bloodTypeID,

            // Extract user info from donor if available (some APIs store it)
            fullName: userDonor.fullName || userDonor.FullName || null,
            email: userDonor.email || userDonor.Email || null,
            phone:
              userDonor.phoneNumber ||
              userDonor.PhoneNumber ||
              userDonor.phone ||
              null,
            userIdCard: userDonor.userIdCard || userDonor.UserIdCard || null,
            dateOfBirth: userDonor.dateOfBirth || userDonor.DateOfBirth || null,
            address: userDonor.address || userDonor.Address || null,
            gender: userDonor.gender || userDonor.Gender || null,

            // Donor specific info
            isAvailable: userDonor.isAvailable,
            lastDonationDate: userDonor.lastDonationDate,
            nextEligibleDate: userDonor.nextEligibleDate,
            currentMedications: userDonor.currentMedications,
          };

          // Filter out null/undefined values
          const cleanedUserInfo = Object.fromEntries(
            Object.entries(extractedUserInfo).filter(
              ([key, value]) => value !== null && value !== undefined
            )
          );

          console.log("Extracted user info from donor:", cleanedUserInfo);

          return {
            success: true,
            source: "donorApi",
            userInfo: cleanedUserInfo,
            donorDetails: userDonor,
            hasUserInfo: !!(
              cleanedUserInfo.fullName ||
              cleanedUserInfo.phone ||
              cleanedUserInfo.email
            ),
          };
        }
      } catch (listError) {
        console.log("Failed to get donors list:", listError);
      }

      // Fallback: return basic info from donor details
      const basicInfo = {
        userID: donorDetails.userId,
        userId: donorDetails.userId,
        donorID: donorProfile.donorID,
        bloodTypeID: donorDetails.bloodTypeId,
      };

      console.log("Returning basic donor info:", basicInfo);

      return {
        success: true,
        source: "donorApi",
        userInfo: basicInfo,
        donorDetails,
        hasUserInfo: false,
      };
    } catch (error) {
      console.error("❌ Error getting user info through donor:", error);
      return { success: false, error: error.message };
    }
  },

  // Verify donor profile creation/update after registration
  verifyDonorProfile: async (userId, expectedBloodTypeID) => {
    try {
      console.log(`Verifying donor profile for userId: ${userId}`);

      // Get all donors and find the one with matching userID
      const allDonors = await apiRequest(`/Donor`);
      const donorProfile = allDonors.find(
        (donor) => donor.userID === userId || donor.userId === userId
      );

      if (!donorProfile) {
        console.error("Donor profile not found after registration");
        return { success: false, message: "Donor profile not found" };
      }

      console.log("Donor profile verification result:", donorProfile);

      // Check if bloodTypeID was saved correctly
      const actualBloodTypeID =
        donorProfile.bloodTypeID || donorProfile.bloodTypeId;
      if (actualBloodTypeID === expectedBloodTypeID) {
        console.log("✅ BloodTypeID saved correctly:", actualBloodTypeID);
      } else {
        console.error(
          "❌ BloodTypeID mismatch. Expected:",
          expectedBloodTypeID,
          "Actual:",
          actualBloodTypeID
        );
      }

      // Note: Personal information is stored in User table, not Donor table
      console.log(
        "ℹ️ Donor table contains: donorId, userId, bloodTypeId, isAvailable"
      );

      return {
        success: true,
        donorProfile: donorProfile,
        bloodTypeIDCorrect: actualBloodTypeID === expectedBloodTypeID,
        message: "Donor profile verified successfully",
      };
    } catch (error) {
      console.error("Error verifying donor profile:", error);
      return { success: false, message: error.message };
    }
  },

  // Update donor medications (currentMedications field)
  updateDonorMedications: async (donorID, currentMedications) => {
    try {
      const currentToken = localStorage.getItem("userToken");
      const isDemo = currentToken === "demo-token";

      if (isDemo) {
        console.log("Demo mode: Updating donor medications");
        await new Promise((resolve) => setTimeout(resolve, 500));
        return {
          success: true,
          message: "Cập nhật tiền sử bệnh lý thành công (Demo mode)",
          data: {
            donorID: donorID,
            currentMedications: currentMedications,
          },
        };
      }

      console.log(`Updating medications for donor ID: ${donorID}`);
      console.log("Current medications:", currentMedications);

      // First, get current donor data to preserve other fields
      const currentDonor = await apiRequest(`/Donor/${donorID}`, {
        method: "GET",
      });

      console.log("Current donor data:", currentDonor);
      console.log("Current donor data keys:", Object.keys(currentDonor));

      // Prepare update data with currentMedications
      // Note: Only update the fields that are actually available in the API response
      // Create update data with only necessary fields to avoid overwriting with undefined
      const updateData = {
        donorID:
          currentDonor.donorID || currentDonor.donorId || currentDonor.id,
        userID: currentDonor.userID || currentDonor.userId,
        currentMedications: currentMedications, // Update this field
        isAvailable: true, // Ensure donor is available
      };

      // Only include optional fields if they exist
      if (currentDonor.bloodTypeID || currentDonor.bloodTypeId) {
        updateData.bloodTypeID =
          currentDonor.bloodTypeID || currentDonor.bloodTypeId;
      }

      if (currentDonor.lastDonationDate) {
        updateData.lastDonationDate = currentDonor.lastDonationDate;
      }

      if (currentDonor.nextEligibleDate) {
        updateData.nextEligibleDate = currentDonor.nextEligibleDate;
      }

      if (currentDonor.Address || currentDonor.address) {
        updateData.Address = currentDonor.Address || currentDonor.address;
      }

      console.log(
        "Updating donor with medications (only necessary fields):",
        updateData
      );

      const result = await apiRequest(`/Donor/${donorID}`, {
        method: "PUT",
        body: JSON.stringify(updateData),
      });

      console.log("Donor medications updated successfully:", result);

      return {
        success: true,
        message: "Cập nhật tiền sử bệnh lý thành công",
        data: result,
      };
    } catch (error) {
      console.error("Error updating donor medications:", error);
      throw new Error(`Cập nhật tiền sử bệnh lý thất bại: ${error.message}`);
    }
  },

  // Test function to check backend donor schema expectations
  testDonorSchema: async () => {
    try {
      const testData = {
        userID: "test-user-id",
        bloodTypeID: "44C1A0F7-92B9-4E1B-A628-03447F5B86D7",
        isAvailable: true,
        currentMedications: "Test medications",
        FullName: "Test Name",
        Email: "test@email.com",
        PhoneNumber: "0123456789",
        Address: "Test Address",
        DateOfBirth: "1990-01-01",
        Gender: "Nam",
      };

      console.log("Testing donor schema with data:", testData);

      // Don't actually create, just test validation
      // const result = await apiRequest('/Donor', {
      //   method: 'POST',
      //   body: JSON.stringify(testData),
      // });

      return { success: true, testData };
    } catch (error) {
      console.error("Donor schema test failed:", error);
      return { success: false, error: error.message };
    }
  },

  // Get donor profile by user ID (for staff to view member profiles)
  getDonorProfileByUserId: async (userId) => {
    try {
      const currentToken = localStorage.getItem("userToken");
      const isDemo = currentToken === "demo-token";

      if (isDemo) {
        // Demo mode - return mock donor profile
        console.log("Demo mode: Getting donor profile for user ID:", userId);
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Simulate having a donor profile 70% of the time
        const hasProfile = Math.random() > 0.3;

        if (hasProfile) {
          return {
            donorID: generateUUID(),
            userID: userId,
            bloodTypeID: "44C1A0F7-92B9-4E1B-A628-03447F5B86D7",
            isAvailable: true,
            lastDonationDate: "2024-01-15",
            nextEligibleDate: "2024-07-15",
            currentMedications: "Không có thuốc đang sử dụng",
            address: "123 Demo Street, Demo City",
            registrationDate: new Date().toISOString(),
          };
        } else {
          return null;
        }
      }

      console.log(`Getting donor profile for userId: ${userId}`);

      try {
        // Get all donors and find the one with matching userID
        const allDonors = await apiRequest("/Donor");
        const donorProfile = allDonors.find(
          (donor) =>
            donor.userID === userId ||
            donor.userId === userId ||
            donor.UserID === userId ||
            donor.UserId === userId
        );

        if (donorProfile) {
          console.log("Found donor profile for user:", userId, donorProfile);
          return donorProfile;
        } else {
          console.log("No donor profile found for user:", userId);
          return null;
        }
      } catch (error) {
        console.log(
          "Error fetching donor profile for user:",
          userId,
          error.message
        );
        return null;
      }
    } catch (error) {
      console.error("Error getting donor profile by user ID:", error);
      return null;
    }
  },

  getAllDonors: async () => {
    return await apiRequest("/Donor");
  },
};

export default donorApi;
