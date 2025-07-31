/**
 * API Service cho Yêu Cầu Khẩn Cấp (Emergency Request)
 * Xử lý các chức năng liên quan đến yêu cầu máu khẩn cấp
 * Bao gồm: tạo yêu cầu, cập nhật trạng thái, tìm kiếm người dùng, authentication
 */

// Cập nhật trạng thái yêu cầu khẩn cấp
export const updateEmergencyRequestStatus = async (requestId, newStatus) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/BloodRequest/update-status/${requestId}`,
      {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ status: newStatus }),
      }
    );
    if (!response.ok) throw new Error("Cập nhật trạng thái thất bại");
    const responseText = await response.text();
    return responseText?.trim() ? JSON.parse(responseText) : null;
  } catch (error) {
    throw error;
  }
};
// Lấy tổng số lượng máu khả dụng theo bloodTypeId (dùng cho kiểm tra tồn kho trước khi tạo yêu cầu khẩn)
export const getAvailableQuantityByBloodType = async (bloodTypeId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/BloodUnit/Get-BloodUnit-by-blood-type/${bloodTypeId}`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );
    if (response.ok) {
      const responseText = await response.text();
      const units = responseText?.trim() ? JSON.parse(responseText) : [];
      // Chỉ tính các đơn vị máu có status === 'available'
      const availableUnits = units.filter(
        (unit) => unit.status === "available"
      );
      return availableUnits.reduce(
        (sum, unit) => sum + (unit.quantity || 0),
        0
      );
    }
    return 0;
  } catch {
    return 0;
  }
};
// Emergency Request API - Production Version
// Handles emergency blood requests, user search, and authentication

const API_BASE_URL = "http://localhost:7262/api";

// Get auth token for API requests
export const refreshAuthToken = async () => {
  try {
    const testCredentials = {
      email: "staff@gmail.com",
      password: "staff123",
    };

    const response = await fetch(`${API_BASE_URL}/Auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testCredentials),
    });

    if (response.ok) {
      const responseText = await response.text();
      if (!responseText || responseText.trim() === "") return null;

      const data = JSON.parse(responseText);
      if (data.token) {
        const allTokenKeys = [
          "userToken",
          "token",
          "authToken",
          "jwtToken",
          "accessToken",
          "auth_token",
        ];
        allTokenKeys.forEach((key) => {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        });

        localStorage.setItem("userToken", data.token);

        try {
          const payload = JSON.parse(atob(data.token.split(".")[1]));
          const userRole =
            payload[
              "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
            ] || "Staff";
          const username =
            payload[
              "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
            ] || testCredentials.email;

          localStorage.setItem("userRole", userRole);
          localStorage.setItem("username", username);
          localStorage.setItem("userEmail", testCredentials.email);
        } catch (e) {}

        return data.token;
      }
    }

    return null;
  } catch {
    return null;
  }
};

const getAuthToken = () => {
  const tokenKeys = [
    "userToken",
    "token",
    "authToken",
    "jwtToken",
    "accessToken",
  ];
  for (const key of tokenKeys) {
    const token = localStorage.getItem(key);
    if (token?.startsWith("eyJ") && token.length > 100) return token;
  }
  for (const key of tokenKeys) {
    const token = sessionStorage.getItem(key);
    if (token?.startsWith("eyJ") && token.length > 100) return token;
  }
  return "";
};

const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return !(payload.exp && payload.exp < currentTime);
  } catch {
    return false;
  }
};

const getHeaders = () => {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token && isTokenValid(token) && { Authorization: `Bearer ${token}` }),
  };
};

export const cleanupTokens = () => {
  const allTokenKeys = [
    "userToken",
    "token",
    "authToken",
    "jwtToken",
    "accessToken",
    "auth_token",
  ];
  const validTokens = [];

  allTokenKeys.forEach((key) => {
    const localToken = localStorage.getItem(key);
    const sessionToken = sessionStorage.getItem(key);
    if (
      localToken &&
      localToken.startsWith("eyJ") &&
      isTokenValid(localToken)
    ) {
      validTokens.push({ key, token: localToken, storage: "localStorage" });
    }
    if (
      sessionToken &&
      sessionToken.startsWith("eyJ") &&
      isTokenValid(sessionToken)
    ) {
      validTokens.push({ key, token: sessionToken, storage: "sessionStorage" });
    }
  });

  allTokenKeys.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });

  if (validTokens.length > 0) {
    const bestToken = validTokens[0];
    localStorage.setItem("userToken", bestToken.token);
    return bestToken.token;
  }

  return null;
};

const BLOOD_TYPE_IDS = {
  "A+": "11111111-1111-1111-1111-111111111001",
  "A-": "11111111-1111-1111-1111-111111111002",
  "B+": "11111111-1111-1111-1111-111111111003",
  "B-": "11111111-1111-1111-1111-111111111004",
  "AB+": "11111111-1111-1111-1111-111111111005",
  "AB-": "11111111-1111-1111-1111-111111111006",
  "O+": "11111111-1111-1111-1111-111111111007",
  "O-": "11111111-1111-1111-1111-111111111008",
};

export const getBloodTypeId = (bloodType) => BLOOD_TYPE_IDS[bloodType];

export const searchUserByIdCard = async (userIdCard) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/User/get-by-idcard/${userIdCard}`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    if (response.ok) {
      const responseText = await response.text();
      return responseText?.trim() ? JSON.parse(responseText) : null;
    } else if (response.status === 404 || response.status === 401) {
      return null;
    } else {
      throw new Error(`API Error: ${response.status}`);
    }
  } catch (error) {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error(
        "Không thể kết nối tới server. Vui lòng kiểm tra kết nối mạng."
      );
    }
    throw error;
  }
};

export const createEmergencyRequest = async (requestData) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/BloodRequest/register-emergency`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(requestData),
      }
    );

    if (response.ok) {
      const responseText = await response.text();
      return responseText?.trim()
        ? JSON.parse(responseText)
        : { success: true, message: "Request created successfully" };
    } else if (response.status === 401) {
      throw new Error("Bạn cần đăng nhập để thực hiện chức năng này");
    } else {
      throw new Error(`Lỗi API: ${response.status}`);
    }
  } catch (error) {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error(
        "Không thể kết nối tới server. Vui lòng kiểm tra kết nối mạng."
      );
    }
    throw error;
  }
};

export const getAllBloodRequests = async () => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/BloodRequest/Get-All-Request`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    if (response.ok) {
      const responseText = await response.text();
      return responseText?.trim() ? JSON.parse(responseText) : [];
    }

    return [];
  } catch {
    return [];
  }
};

export const getBloodRequestsByStatus = async (status) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/BloodRequest/Get-Request-By-status/${status}`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    if (response.ok) {
      const responseText = await response.text();
      return responseText?.trim() ? JSON.parse(responseText) : [];
    }

    return [];
  } catch {
    return [];
  }
};

// ✅ Đặt alias SAU khi hàm đã được khai báo
export const getEmergencyRequestsByStatus = getBloodRequestsByStatus;

export const getCurrentUser = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/User/current`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (response.ok) {
      const responseText = await response.text();
      return responseText?.trim() ? JSON.parse(responseText) : null;
    }

    return null;
  } catch {
    return null;
  }
};
