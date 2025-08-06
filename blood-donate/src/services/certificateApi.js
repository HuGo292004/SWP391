/**
 * API Service cho Quản Lý Chứng Chỉ Hiến Máu
 * Xử lý các chức năng liên quan đến chứng chỉ: lấy danh sách, tạo mới, xem chi tiết
 */

// URL cơ sở của API
const API_BASE_URL = "http://localhost:7262/api";

/**
 * Lấy auth token từ localStorage
 * @returns {string|null} Auth token
 */
const getAuthToken = () => {
  return (
    localStorage.getItem("userToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken")
  );
};

/**
 * Tạo auth headers cho API request
 * @returns {Object} Headers object
 */
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token &&
      token !== "demo-token" && { Authorization: `Bearer ${token}` }),
  };
};

/**
 * Xử lý response từ API
 * @param {Response} response - Fetch response object
 * @returns {Promise<Object|null>} Parsed response data
 */
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "API error");
  }
  if (response.status === 204) return null;
  return await response.json();
};

export const certificateApi = {
  // GET /api/Certificate
  getAll: async () => {
    const res = await fetch(`${API_BASE_URL}/Certificate`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  // GET /api/Certificate/{id}
  getById: async (id) => {
    const res = await fetch(`${API_BASE_URL}/Certificate/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  // POST /api/Certificate
  create: async (data) => {
    const res = await fetch(`${API_BASE_URL}/Certificate`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  // PUT /api/Certificate/{id}
  update: async (id, data) => {
    const res = await fetch(`${API_BASE_URL}/Certificate/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  // DELETE /api/Certificate/{id}
  delete: async (id) => {
    const res = await fetch(`${API_BASE_URL}/Certificate/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
};
