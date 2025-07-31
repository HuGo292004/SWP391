/**
 * Utility functions để debug authentication
 * Giúp kiểm tra trạng thái xác thực và debug các vấn đề liên quan đến auth
 */

/**
 * Debug helper để kiểm tra trạng thái authentication
 * In ra console tất cả thông tin auth trong localStorage và sessionStorage
 */
export const debugAuth = () => {
  console.log("=== Auth Debug Info ===");

  // Kiểm tra localStorage
  console.log("localStorage keys:", Object.keys(localStorage));
  console.log("localStorage authToken:", localStorage.getItem("authToken"));
  console.log("localStorage token:", localStorage.getItem("token"));
  console.log("localStorage accessToken:", localStorage.getItem("accessToken"));

  // Kiểm tra sessionStorage
  console.log("sessionStorage keys:", Object.keys(sessionStorage));
  console.log("sessionStorage authToken:", sessionStorage.getItem("authToken"));
  console.log("sessionStorage token:", sessionStorage.getItem("token"));
  console.log(
    "sessionStorage accessToken:",
    sessionStorage.getItem("accessToken")
  );

  // Kiểm tra dữ liệu user có tồn tại không
  console.log("localStorage user:", localStorage.getItem("user"));
  console.log("localStorage userData:", localStorage.getItem("userData"));
  console.log("sessionStorage user:", sessionStorage.getItem("user"));

  console.log("=== End Auth Debug ===");
};

/**
 * Function để set token test cho việc debug
 * @param {string} token - Token để test
 */
export const setTestToken = (token) => {
  localStorage.setItem("authToken", token);
  console.log("Test token set:", token);
};

/**
 * Function để xóa tất cả dữ liệu auth
 * Hữu ích khi cần reset trạng thái đăng nhập
 */
export const clearAuth = () => {
  // Danh sách các key liên quan đến authentication
  const authKeys = ["authToken", "token", "accessToken", "user", "userData"];

  // Xóa từ cả localStorage và sessionStorage
  authKeys.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });

  console.log("All auth data cleared");
};
