/**
 * Blood Donation API Service
 * Service để xử lý các API liên quan đến hiến máu
 */

// Base URL cho Blood Donation API
const BASE_URL = "http://localhost:7262/api";

/**
 * Helper function để lấy auth token từ storage
 * Kiểm tra nhiều vị trí có thể lưu token
 * @returns {string|null} Auth token hoặc null nếu không tìm thấy
 */
const getAuthToken = () => {
  // Thử các vị trí có thể lưu auth token
  return (
    localStorage.getItem("userToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("userToken") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("authToken") ||
    sessionStorage.getItem("accessToken")
  );
};

/**
 * Helper function để tạo auth headers cho API requests
 * @returns {Object} Headers object với Authorization nếu có token
 */
const getAuthHeaders = () => {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  console.log("API Response status:", response.status);
  console.log("API Response ok:", response.ok);

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    }
    const errorData = await response.text();
    console.log("Error response:", errorData);
    throw new Error(errorData || `HTTP error! status: ${response.status}`);
  }

  const contentType = response.headers.get("content-type");
  console.log("Response content-type:", contentType);

  if (contentType && contentType.includes("application/json")) {
    const jsonData = await response.json();
    console.log("JSON response:", jsonData);
    return jsonData;
  }

  // For successful responses without JSON (like 200 OK with plain text)
  const textData = await response.text();
  console.log("Text response:", textData);

  // If it's a successful response, return success object
  if (response.status >= 200 && response.status < 300) {
    return {
      success: true,
      message: textData || "Success",
      status: response.status,
    };
  }

  return textData;
};

export const bloodDonationApi = {
  // GET /api/BloodDonation - Lấy tất cả đơn hiến máu
  getAllBloodDonations: async () => {
    try {
      const response = await fetch(`${BASE_URL}/BloodDonation`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error("Error fetching blood donations:", error);
      throw error;
    }
  },

  // GET /api/BloodDonation/{id} - Lấy chi tiết đơn hiến máu
  getBloodDonationById: async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/BloodDonation/${id}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error("Error fetching blood donation by ID:", error);
      throw error;
    }
  },

  // GET /api/BloodDonation/donor/{donorId} - Lấy đơn hiến máu theo donor
  getBloodDonationsByDonor: async (donorId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/BloodDonation/donor/${donorId}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );
      return await handleResponse(response);
    } catch (error) {
      console.error("Error fetching blood donations by donor:", error);
      throw error;
    }
  },

  // POST /api/BloodDonation - Tạo đơn hiến máu mới
  createBloodDonation: async (bloodDonationData) => {
    try {
      const response = await fetch(`${BASE_URL}/BloodDonation`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(bloodDonationData),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error("Error creating blood donation:", error);
      throw error;
    }
  },

  // PUT /api/BloodDonation/{id} - Cập nhật đơn hiến máu
  updateBloodDonation: async (id, bloodDonationData) => {
    try {
      const response = await fetch(`${BASE_URL}/BloodDonation/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(bloodDonationData),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error("Error updating blood donation:", error);
      throw error;
    }
  },

  // DELETE /api/BloodDonation/{id} - Xóa đơn hiến máu
  deleteBloodDonation: async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/BloodDonation/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error("Error deleting blood donation:", error);
      throw error;
    }
  },

  // PATCH /api/BloodDonation/{id}/status/{status} - Cập nhật trạng thái
  updateBloodDonationStatus: async (id, status) => {
    try {
      const response = await fetch(
        `${BASE_URL}/BloodDonation/${id}/status/${status}`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
        }
      );
      return await handleResponse(response);
    } catch (error) {
      console.error("Error updating blood donation status:", error);
      throw error;
    }
  },

  // POST /api/BloodDonation/approve-blood-donation - Duyệt đơn hiến máu
  approveBloodDonation: async (approvalData) => {
    try {
      console.log("Approving blood donation with data:", approvalData);

      const response = await fetch(
        `${BASE_URL}/BloodDonation/approve-blood-donation`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(approvalData),
        }
      );

      console.log("Blood donation approval response status:", response.status);

      if (response.status === 409) {
        // Conflict - might already be approved
        const errorText = await response.text();
        console.log("Conflict response:", errorText);
        if (errorText.includes("already") || errorText.includes("đã duyệt")) {
          console.log("Blood donation already approved");
          return { success: true, message: "Blood donation already approved" };
        } else {
          // Trả về lỗi conflict khác
          return { success: false, message: errorText, status: 409 };
        }
      }

      // Nếu response không phải JSON, handleResponse sẽ trả về object hợp lệ
      if (response.ok) {
        const result = await handleResponse(response);
        console.log("Blood donation approval result:", result);
        return result;
      } else {
        // Nếu không ok và không phải 409, trả về lỗi chung
        const errorText = await response.text();
        return { success: false, message: errorText, status: response.status };
      }
    } catch (error) {
      console.error("Error approving blood donation:", error);

      // Re-throw with more specific error message
      if (
        error.message &&
        (error.message.includes("already") || error.message.includes("đã"))
      ) {
        // Already approved - this is actually success
        console.log("Blood donation was already approved");
        return { success: true, message: "Blood donation already approved" };
      }

      throw error;
    }
  },

  // POST /api/BloodDonation/reject-blood-donation - Từ chối đơn hiến máu
  rejectBloodDonation: async (rejectionData) => {
    try {
      const response = await fetch(
        `${BASE_URL}/BloodDonation/reject-blood-donation`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(rejectionData),
        }
      );
      return await handleResponse(response);
    } catch (error) {
      console.error("Error rejecting blood donation:", error);
      throw error;
    }
  },

  // POST /api/BloodDonation/sync - Đồng bộ dữ liệu
  syncBloodDonations: async () => {
    try {
      const response = await fetch(`${BASE_URL}/BloodDonation/sync`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error("Error syncing blood donations:", error);
      throw error;
    }
  },
};

export default bloodDonationApi;
