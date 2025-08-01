/**
 * Blood Type Compatibility Utils
 * Xác định tính tương thích giữa các nhóm máu cho việc hiến máu
 */

// Mapping bloodTypeID to blood type string
export const BLOOD_TYPE_MAP = {
  "11111111-1111-1111-1111-111111111001": "A+",
  "11111111-1111-1111-1111-111111111002": "A-",
  "11111111-1111-1111-1111-111111111003": "B+",
  "11111111-1111-1111-1111-111111111004": "B-",
  "11111111-1111-1111-1111-111111111005": "AB+",
  "11111111-1111-1111-1111-111111111006": "AB-",
  "11111111-1111-1111-1111-111111111007": "O+",
  "11111111-1111-1111-1111-111111111008": "O-",
};

// Reverse mapping from blood type string to ID
export const BLOOD_TYPE_ID_MAP = {
  "A+": "11111111-1111-1111-1111-111111111001",
  "A-": "11111111-1111-1111-1111-111111111002",
  "B+": "11111111-1111-1111-1111-111111111003",
  "B-": "11111111-1111-1111-1111-111111111004",
  "AB+": "11111111-1111-1111-1111-111111111005",
  "AB-": "11111111-1111-1111-1111-111111111006",
  "O+": "11111111-1111-1111-1111-111111111007",
  "O-": "11111111-1111-1111-1111-111111111008",
};

/**
 * Xác định các nhóm máu có thể hiến cho nhóm máu cần thiết
 * Theo quy tắc: Người có nhóm máu X có thể nhận từ những nhóm máu nào
 * @param {string} neededBloodType - Nhóm máu cần thiết (ví dụ: "A+", "B-")
 * @returns {string[]} - Danh sách các nhóm máu có thể hiến
 */
export const getCompatibleDonorBloodTypes = (neededBloodType) => {
  const compatibilityMap = {
    "O-": ["O-"],
    "O+": ["O-", "O+"],
    "A-": ["O-", "A-"],
    "A+": ["O-", "O+", "A-", "A+"],
    "B-": ["O-", "B-"],
    "B+": ["O-", "O+", "B-", "B+"],
    "AB-": ["O-", "A-", "B-", "AB-"],
    "AB+": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"], // Universal recipient
  };

  return compatibilityMap[neededBloodType] || [];
};

/**
 * Xác định các nhóm máu có thể nhận từ nhóm máu hiến
 * Theo quy tắc: Người có nhóm máu X có thể cho cho những nhóm máu nào
 * @param {string} donorBloodType - Nhóm máu của người hiến (ví dụ: "O+")
 * @returns {string[]} - Danh sách các nhóm máu có thể nhận
 */
export const getCompatibleRecipientBloodTypes = (donorBloodType) => {
  const compatibilityMap = {
    "O-": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"], // Universal donor
    "O+": ["O+", "A+", "B+", "AB+"],
    "A-": ["A-", "A+", "AB-", "AB+"],
    "A+": ["A+", "AB+"],
    "B-": ["B-", "B+", "AB-", "AB+"],
    "B+": ["B+", "AB+"],
    "AB-": ["AB-", "AB+"],
    "AB+": ["AB+"], // Can only donate to AB+
  };

  return compatibilityMap[donorBloodType] || [];
};

/**
 * Kiểm tra xem một nhóm máu có thể hiến cho nhóm máu khác không
 * @param {string} donorBloodType - Nhóm máu của người hiến
 * @param {string} recipientBloodType - Nhóm máu của người nhận
 * @returns {boolean} - true nếu tương thích
 */
export const canDonateBloodTo = (donorBloodType, recipientBloodType) => {
  const compatibleDonors = getCompatibleDonorBloodTypes(recipientBloodType);
  return compatibleDonors.includes(donorBloodType);
};

/**
 * Chuyển đổi bloodTypeID thành blood type string
 * @param {string} bloodTypeID - ID của nhóm máu
 * @returns {string} - Blood type string (ví dụ: "A+")
 */
export const getBloodTypeFromID = (bloodTypeID) => {
  return BLOOD_TYPE_MAP[bloodTypeID] || bloodTypeID;
};

/**
 * Chuyển đổi blood type string thành bloodTypeID
 * @param {string} bloodType - Blood type string (ví dụ: "A+")
 * @returns {string} - Blood type ID
 */
export const getBloodTypeID = (bloodType) => {
  return BLOOD_TYPE_ID_MAP[bloodType] || bloodType;
};

/**
 * Lấy danh sách bloodTypeID tương thích với nhóm máu cần thiết
 * @param {string} neededBloodTypeID - ID nhóm máu cần thiết
 * @returns {string[]} - Danh sách bloodTypeID có thể hiến
 */
export const getCompatibleDonorBloodTypeIDs = (neededBloodTypeID) => {
  const neededBloodType = getBloodTypeFromID(neededBloodTypeID);
  const compatibleBloodTypes = getCompatibleDonorBloodTypes(neededBloodType);
  return compatibleBloodTypes.map(bloodType => getBloodTypeID(bloodType));
};

/**
 * Kiểm tra xem member có nhóm máu tương thích với yêu cầu khẩn cấp không
 * @param {string} memberBloodTypeID - Blood type ID của member
 * @param {string} neededBloodTypeID - Blood type ID cần thiết trong yêu cầu khẩn cấp
 * @returns {boolean} - true nếu member có thể hiến cho yêu cầu này
 */
export const canMemberDonateForEmergency = (memberBloodTypeID, neededBloodTypeID) => {
  const memberBloodType = getBloodTypeFromID(memberBloodTypeID);
  const neededBloodType = getBloodTypeFromID(neededBloodTypeID);
  
  return canDonateBloodTo(memberBloodType, neededBloodType);
};

/**
 * Lấy tên nhóm máu thân thiện với người dùng
 * @param {string} bloodTypeID - ID nhóm máu
 * @returns {string} - Tên nhóm máu đẹp
 */
export const getBloodTypeDisplayName = (bloodTypeID) => {
  const bloodType = getBloodTypeFromID(bloodTypeID);
  return bloodType || "Chưa xác định";
};
