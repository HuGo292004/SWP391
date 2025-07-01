// Environment detection and API configuration
const getApiBaseUrl = () => {
  // For Vite
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:7262';
  }
  
  // For Create React App or polyfilled process
  if (typeof process !== 'undefined' && process.env) {
    return process.env.REACT_APP_API_BASE_URL || 'http://localhost:7262';
  }
  
  // Fallback
  return 'http://localhost:7262';
};

const API_BASE_URL = getApiBaseUrl();

// Debug helper
const debugLog = (message, data = null) => {
  // Check if we're in development mode
  const isDevelopment = 
    (typeof import.meta !== 'undefined' && import.meta.env?.DEV) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.MODE === 'development') ||
    (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') ||
    window.location.hostname === 'localhost';
  
  if (isDevelopment) {
    console.log(`[UserManagementAPI] ${message}`, data);
  }
};

// Helper function để handle response
const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  
  if (!response.ok) {
    // Handle specific error cases
    switch (response.status) {
      case 401:
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      case 403:
        throw new Error('Bạn không có quyền thực hiện thao tác này. Chỉ Admin và Staff mới có thể chỉnh sửa thông tin người dùng. Vui lòng liên hệ quản trị viên hệ thống để được cấp quyền.');
      case 404:
        throw new Error('Không tìm thấy người dùng.');
      case 400:
        throw new Error(data.message || data.Message || 'Dữ liệu không hợp lệ.');
      default:
        throw new Error(data.message || data.Message || `Lỗi server: ${response.status}`);
    }
  }
  
  // Handle different response structures from the API
  // Some endpoints might return { data: [...] } or direct array
  if (data.data) {
    return data.data;
  }
  
  // If it's a direct array or object, return as is
  return data;
};

// Helper function để tạo headers
const createHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = localStorage.getItem('userToken') || localStorage.getItem('token') || localStorage.getItem('authToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      debugLog('Warning: No authentication token found');
    }
  }
  
  return headers;
};

// Helper function để kiểm tra quyền hiện tại
export const getCurrentUserRole = () => {
  try {
    const userRole = localStorage.getItem('userRole') || localStorage.getItem('role');
    const userInfo = localStorage.getItem('userInfo');
    
    if (userInfo) {
      const parsed = JSON.parse(userInfo);
      return parsed.role || parsed.Role;
    }
    
    return userRole;
  } catch (error) {
    debugLog('Error getting current user role:', error);
    return null;
  }
};

// Helper function để kiểm tra có token không
export const hasValidToken = () => {
  const token = localStorage.getItem('userToken') || localStorage.getItem('token') || localStorage.getItem('authToken');
  return !!token;
};

// API: Lấy tất cả người dùng
export const getAllUsers = async () => {
  try {
    debugLog('Fetching all users...');
    const response = await fetch(`${API_BASE_URL}/api/User/Get-All-User`, {
      method: 'GET',
      headers: createHeaders(),
    });
    const data = await handleResponse(response);
    debugLog('All users fetched successfully', data);
    return data;
  } catch (error) {
    debugLog('Error fetching all users', error);
    console.error('Error fetching all users:', error);
    throw error;
  }
};

// API: Lấy người dùng theo vai trò
export const getUsersByRole = async (role) => {
  try {
    debugLog(`Fetching users by role: ${role}`);
    const response = await fetch(`${API_BASE_URL}/api/User/Get-User-By-Role/${encodeURIComponent(role)}`, {
      method: 'GET',
      headers: createHeaders(),
    });
    const data = await handleResponse(response);
    debugLog(`Users by role ${role} fetched successfully`, data);
    return data;
  } catch (error) {
    debugLog(`Error fetching users by role ${role}`, error);
    console.error(`Error fetching users by role ${role}:`, error);
    throw error;
  }
};

// API: Tìm kiếm người dùng theo tên
export const searchUserByName = async (name) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/User/Search-User-By-Name?name=${encodeURIComponent(name)}`, {
      method: 'GET',
      headers: createHeaders(),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error(`Error searching users by name ${name}:`, error);
    throw error;
  }
};

// API: Cập nhật thông tin người dùng
export const updateUser = async (id, userData) => {
  try {
    debugLog(`Updating user ${id}`, userData);
    const response = await fetch(`${API_BASE_URL}/api/User/Update-User/${id}`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify(userData),
    });
    const data = await handleResponse(response);
    debugLog(`User ${id} updated successfully`, data);
    return data;
  } catch (error) {
    debugLog(`Error updating user ${id}`, error);
    console.error(`Error updating user ${id}:`, error);
    throw error;
  }
};

// API: Lấy chi tiết người dùng
export const getUserDetail = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/User/Get-User-Detail/${id}`, {
      method: 'GET',
      headers: createHeaders(),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error(`Error fetching user detail ${id}:`, error);
    throw error;
  }
};

// Test API connection
export const testApiConnection = async () => {
  try {
    debugLog('Testing API connection...');
    const response = await fetch(`${API_BASE_URL}/api/User/Get-All-User`, {
      method: 'GET',
      headers: createHeaders(),
    });
    
    if (response.ok) {
      debugLog('API connection successful');
      return { success: true, message: 'API connection successful' };
    } else {
      debugLog('API connection failed', response.status);
      return { success: false, message: `API connection failed with status: ${response.status}` };
    }
  } catch (error) {
    debugLog('API connection error', error);
    return { success: false, message: `API connection error: ${error.message}` };
  }
};

// Utility function: Mapping role cho API
export const mapRoleForApi = (role) => {
  const roleMapping = {
    'all': null,
    'Staff': 'Staff',
    'Member': 'Member',
    'Admin': 'Admin'
  };
  return roleMapping[role] || role;
};

// Utility function: Format dữ liệu user để hiển thị
export const formatUserData = (apiUser) => {
  if (!apiUser) return null;
  
  return {
    id: apiUser.id || apiUser.userId || apiUser.ID,
    username: apiUser.username || apiUser.userName || apiUser.Username,
    email: apiUser.email || apiUser.Email,
    fullName: apiUser.fullName || apiUser.FullName || `${apiUser.firstName || apiUser.FirstName || ''} ${apiUser.lastName || apiUser.LastName || ''}`.trim(),
    role: apiUser.role || apiUser.roleName || apiUser.Role || apiUser.RoleName,
    status: apiUser.status || apiUser.Status || (apiUser.isActive !== undefined ? (apiUser.isActive ? 'active' : 'inactive') : 'active'),
    createdAt: apiUser.createdAt || apiUser.createDate || apiUser.CreatedAt || apiUser.CreateDate,
    lastLogin: apiUser.lastLogin || apiUser.lastLoginDate || apiUser.LastLogin || apiUser.LastLoginDate,
    phone: apiUser.phone || apiUser.phoneNumber || apiUser.Phone || apiUser.PhoneNumber,
    address: apiUser.address || apiUser.Address,
    dateOfBirth: apiUser.dateOfBirth || apiUser.birthDate || apiUser.DateOfBirth || apiUser.BirthDate,
    gender: apiUser.gender || apiUser.Gender,
    userIdCard: apiUser.userIdCard || apiUser.idCard || apiUser.identityNumber || apiUser.IdCard || apiUser.IdentityNumber,
    bloodType: apiUser.bloodType || apiUser.bloodGroup || apiUser.BloodType || apiUser.BloodGroup,
    emergencyContact: apiUser.emergencyContact || apiUser.EmergencyContact,
    // Staff specific fields
    staffID: apiUser.staffId || apiUser.staffID || apiUser.StaffId || apiUser.StaffID,
    department: apiUser.department || apiUser.Department,
    position: apiUser.position || apiUser.Position,
    salary: apiUser.salary || apiUser.Salary,
    startDate: apiUser.startDate || apiUser.workStartDate || apiUser.StartDate || apiUser.WorkStartDate,
    permissions: apiUser.permissions || apiUser.Permissions || [],
    // Member specific fields
    userID: apiUser.userId || apiUser.userID || apiUser.UserId || apiUser.UserID,
    weight: apiUser.weight || apiUser.Weight,
    height: apiUser.height || apiUser.Height,
    medicalHistory: apiUser.medicalHistory || apiUser.MedicalHistory,
    donationCount: apiUser.donationCount || apiUser.DonationCount || 0,
    lastDonationDate: apiUser.lastDonationDate || apiUser.LastDonationDate,
    nextEligibleDate: apiUser.nextEligibleDate || apiUser.NextEligibleDate,
    reasonInactive: apiUser.reasonInactive || apiUser.inactiveReason || apiUser.ReasonInactive || apiUser.InactiveReason
  };
};

// Utility function: Format dữ liệu để gửi lên API
export const formatUserDataForApi = (formData) => {
  // Xóa các field undefined/null để tránh gửi data không cần thiết
  const cleanData = {};
  
  // Basic fields
  if (formData.username) cleanData.username = formData.username;
  if (formData.email) cleanData.email = formData.email;
  if (formData.fullName) cleanData.fullName = formData.fullName;
  if (formData.phone) cleanData.phone = formData.phone;
  if (formData.address) cleanData.address = formData.address;
  if (formData.dateOfBirth) cleanData.dateOfBirth = formData.dateOfBirth;
  if (formData.gender) cleanData.gender = formData.gender;
  if (formData.userIdCard) cleanData.userIdCard = formData.userIdCard;
  if (formData.bloodType) cleanData.bloodType = formData.bloodType;
  if (formData.emergencyContact) cleanData.emergencyContact = formData.emergencyContact;
  if (formData.status !== undefined) cleanData.status = formData.status;
  
  // Staff specific fields
  if (formData.department) cleanData.department = formData.department;
  if (formData.position) cleanData.position = formData.position;
  if (formData.salary) cleanData.salary = formData.salary;
  if (formData.startDate) cleanData.startDate = formData.startDate;
  if (formData.permissions) cleanData.permissions = formData.permissions;
  
  // Member specific fields
  if (formData.weight) cleanData.weight = formData.weight;
  if (formData.height) cleanData.height = formData.height;
  if (formData.medicalHistory) cleanData.medicalHistory = formData.medicalHistory;
  if (formData.lastDonationDate) cleanData.lastDonationDate = formData.lastDonationDate;
  if (formData.nextEligibleDate) cleanData.nextEligibleDate = formData.nextEligibleDate;
  if (formData.reasonInactive) cleanData.reasonInactive = formData.reasonInactive;
  
  return cleanData;
};
