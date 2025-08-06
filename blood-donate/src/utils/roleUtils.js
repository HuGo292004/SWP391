/**
 * Utility functions cho role-based routing
 * Các hàm hỗ trợ quản lý routing dựa trên vai trò người dùng
 */

/**
 * Lấy role của user từ đường dẫn URL
 * @param {string} pathname - Đường dẫn URL hiện tại
 * @returns {string|null} - Role của user hoặc null nếu không xác định được
 */
export const getUserRoleFromPath = (pathname) => {
  const pathSegments = pathname.split("/");
  const role = pathSegments[1]; // Lấy segment đầu tiên sau domain

  // Kiểm tra role có hợp lệ không
  if (["admin", "staff", "member"].includes(role)) {
    return role;
  }

  return null; // Không có role hoặc role không hợp lệ
};

/**
 * Lấy base path dựa trên role
 * @param {string} role - Role của user (admin/staff/member)
 * @returns {string} - Base path cho role đó
 */
export const getBasePath = (role) => {
  if (!role || !["admin", "staff", "member"].includes(role)) {
    return ""; // Trả về empty string cho guest user
  }
  return `/${role}`; // Trả về path với prefix role
};

/**
 * Tạo đường dẫn dựa trên role của user
 * @param {string} path - Đường dẫn gốc
 * @param {string} role - Role của user (admin/staff/member)
 * @returns {string} - Đường dẫn đã được thêm prefix role
 */
export const createRoleBasedPath = (path, role) => {
  if (!role || !["admin", "staff", "member"].includes(role)) {
    return path; // Trả về path gốc nếu không có role hợp lệ
  }

  // Nếu path đã có role prefix, trả về như cũ
  if (path.startsWith(`/${role}`)) {
    return path;
  }

  // Nếu path là root, trả về base path của role
  if (path === "/") {
    return `/${role}`;
  }

  // Thêm role prefix vào path
  return `/${role}${path}`;
};
