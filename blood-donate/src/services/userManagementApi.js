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
    reasonInactive: apiUser.reasonInactive || apiUser.inactiveReason || apiUser.ReasonInactive || apiUser.InactiveReason,
    // Donor profile fields
    donorID: apiUser.donorID || apiUser.donorId || apiUser.DonorID || apiUser.DonorId,
    bloodTypeID: apiUser.bloodTypeID || apiUser.bloodTypeId || apiUser.BloodTypeID || apiUser.BloodTypeId,
    isAvailable: apiUser.isAvailable !== undefined ? apiUser.isAvailable : 
                 apiUser.IsAvailable !== undefined ? apiUser.IsAvailable : true,
    currentMedications: apiUser.currentMedications || apiUser.CurrentMedications
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
  
  // Donor profile fields
  if (formData.donorID) cleanData.donorID = formData.donorID;
  if (formData.bloodTypeID) cleanData.bloodTypeID = formData.bloodTypeID; // Giữ nguyên GUID
  if (formData.isAvailable !== undefined) cleanData.isAvailable = formData.isAvailable === 'true' || formData.isAvailable === true;
  if (formData.currentMedications) cleanData.currentMedications = formData.currentMedications;
  
  return cleanData;
};

// API: Tạo hồ sơ hiến máu mới
export const createDonorProfile = async (userId, donorData) => {
  try {
    // Tạo donorID đồng bộ với backend
    const donorID = donorData.donorID || generateDonorID(userId);
    
    debugLog(`Creating donor profile for user ${userId} with donorID ${donorID}`);
    
    const response = await fetch(`${API_BASE_URL}/api/Donor`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({
        userID: userId,
        donorID: donorID,
        bloodTypeID: donorData.bloodTypeID,
        isAvailable: donorData.isAvailable !== undefined ? donorData.isAvailable : true,
        lastDonationDate: donorData.lastDonationDate || null,
        nextEligibleDate: donorData.nextEligibleDate || null,
        currentMedications: donorData.currentMedications || null,
        Address: donorData.address || null // Sử dụng Address (viết hoa) theo database
      })
    });

    const data = await handleResponse(response);
    
    debugLog(`Donor profile created successfully for user ${userId}`, data);
    return data;
  } catch (error) {
    debugLog(`Error creating donor profile for user ${userId}`, error);
    console.error(`Error creating donor profile for user ${userId}:`, error);
    throw error;
  }
};

// API: Cập nhật hồ sơ hiến máu
export const updateDonorProfile = async (donorId, donorData) => {
  try {
    debugLog(`Updating donor profile ${donorId}`, donorData);
    
    const response = await fetch(`${API_BASE_URL}/api/Donor/${donorId}`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify({
        donorID: donorData.donorID,
        userID: donorData.userID, // Quan trọng: phải có userID để không bị mất liên kết
        bloodTypeID: donorData.bloodTypeID,
        isAvailable: donorData.isAvailable,
        lastDonationDate: donorData.lastDonationDate,
        nextEligibleDate: donorData.nextEligibleDate,
        currentMedications: donorData.currentMedications,
        Address: donorData.address // Sử dụng Address (viết hoa) theo database
      })
    });

    const data = await handleResponse(response);
    
    debugLog(`Donor profile ${donorId} updated successfully`, data);
    return data;
  } catch (error) {
    debugLog(`Error updating donor profile ${donorId}`, error);
    console.error(`Error updating donor profile ${donorId}:`, error);
    throw error;
  }
};

// API: Lấy hồ sơ hiến máu theo userId
export const getDonorProfileByUserId = async (userId) => {
  try {
    debugLog(`Fetching donor profile for user ${userId}`);
    
    // Lấy tất cả donors và filter theo userID
    const response = await fetch(`${API_BASE_URL}/api/Donor`, {
      method: 'GET', 
      headers: createHeaders(),
    });
    
    if (!response.ok) {
      debugLog(`Failed to fetch donors list: ${response.status}`);
      return null;
    }
    
    const allDonors = await handleResponse(response);
    debugLog(`All donors fetched, filtering for user ${userId}`, allDonors);
    
    // Tìm donor có userID khớp
    let foundDonor = null;
    let donorsList = [];
    
    // Xử lý các format response khác nhau
    if (Array.isArray(allDonors)) {
      donorsList = allDonors;
    } else if (allDonors && allDonors.data && Array.isArray(allDonors.data)) {
      donorsList = allDonors.data;
    } else if (allDonors && typeof allDonors === 'object') {
      // Có thể response là object chứa donors
      donorsList = Object.values(allDonors).find(val => Array.isArray(val)) || [];
    }
    
    // Tìm donor với userID khớp (thử nhiều format khác nhau)
    foundDonor = donorsList.find(donor => {
      if (!donor) return false;
      
      const donorUserID = donor.userID || donor.userId || donor.UserID || donor.UserId;
      return donorUserID === userId;
    });
    
    if (foundDonor) {
      debugLog(`Found donor profile for user ${userId}`, foundDonor);
      return foundDonor;
    } else {
      debugLog(`No donor profile found for user ${userId} in ${donorsList.length} donors`);
      return null;
    }
    
  } catch (error) {
    debugLog(`Error fetching donor profile for user ${userId}`, error);
    console.error(`Error fetching donor profile for user ${userId}:`, error);
    return null; // Trả về null thay vì throw error để không crash app
  }
};

// API: Lấy hồ sơ hiến máu theo donorId
export const getDonorProfileByDonorId = async (donorId) => {
  try {
    debugLog(`Fetching donor profile ${donorId}`);
    const response = await fetch(`${API_BASE_URL}/api/Donor/${donorId}`, {
      method: 'GET',
      headers: createHeaders(),
    });
    const data = await handleResponse(response);
    debugLog(`Donor profile ${donorId} fetched successfully`, data);
    return data;
  } catch (error) {
    debugLog(`Error fetching donor profile ${donorId}`, error);
    console.error(`Error fetching donor profile ${donorId}:`, error);
    throw error;
  }
};

// Utility function: Tạo donorID đồng bộ với backend
export const generateDonorID = (userID) => {
  if (!userID) return null;
  
  // Logic tạo donorID giống như backend:
  // Lấy 6 ký tự cuối của userID (bỏ dấu gạch ngang) và thêm prefix "DN"
  const shortId = userID.replace(/-/g, '').slice(-6).toUpperCase();
  return `DN${shortId}`;
};

// Utility function: Kiểm tra format donorID có hợp lệ không
export const isValidDonorID = (donorID) => {
  if (!donorID) return false;
  // Format: DN + 6 ký tự alphanumeric
  return /^DN[A-Z0-9]{6}$/.test(donorID);
};
