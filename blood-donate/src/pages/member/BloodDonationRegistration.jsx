/**
 * Trang Đăng Ký Hiến Máu
 *
 * CẬP NHẬT GẦN ĐÂY: Tích hợp BloodManagement API và Enhanced Donor API (4 tháng 7, 2025)
 * - Tích hợp BloodManagement API để load động các loại nhóm máu
 * - Tạo enhancedDonorApi để lưu địa chỉ và thuốc đang dùng vào bảng Donor
 * - Cập nhật luồng dữ liệu để đảm bảo địa chỉ và thuốc được lưu trong bảng Donor, không phải BloodDonation
 *
 * Tích Hợp API:
 * - BloodManagement API: /api/BloodManagement/Get-Blood-types (nhóm máu động)
 * - Enhanced Donor API: Tạo/cập nhật hồ sơ donor với địa chỉ và thuốc đang dùng
 * - BloodDonation API: /api/BloodDonation (bản ghi hiến máu chỉ có ghi chú)
 *
 * Kiến Trúc Dữ Liệu:
 * - Thông tin cá nhân người dùng (tên, email, SĐT, ngày sinh) được lưu trong bảng User
 * - Hồ sơ donor (donorId, userId, bloodTypeId, địa chỉ, thuốc đang dùng, isAvailable) được lưu trong bảng Donor
 * - Bản ghi hiến máu (ngày hiến, ghi chú, trạng thái) được lưu trong bảng BloodDonation
 * - Địa chỉ và thuốc đang dùng giờ được lưu trong bảng Donor (theo yêu cầu)
 * - Trường ghi chú chỉ dành cho các nhận xét bổ sung
 *
 * Quy Trình:
 * 1. Load các nhóm máu động từ BloodManagement API
 * 2. Lấy thông tin user từ User API để hiển thị trong bước xác nhận
 * 3. Submit đăng ký hiến máu và cập nhật hồ sơ Donor với địa chỉ/thuốc
 * 4. Bản ghi hiến máu lưu ngày hiến, ghi chú, trạng thái trong bảng BloodDonation
 * 5. Hồ sơ donor lưu địa chỉ, thuốc đang dùng, bloodTypeId trong bảng Donor
 *
 * Quan trọng: Địa chỉ và Thuốc đang dùng giờ được lưu vào bảng Donor, Ghi chú dành cho nhận xét bổ sung
 */

import React, { useState, useEffect } from "react";

// Import các component từ Ant Design
import {
  Form,
  Input,
  Button,
  Typography,
  Alert,
  Space,
  Row,
  Col,
  Select,
  DatePicker,
  Radio,
  Checkbox,
  Card,
  Steps,
  TimePicker,
  Divider,
  Tag,
} from "antd";

// Import các icon từ Ant Design
import {
  HeartFilled, // Icon trái tim đầy
  CalendarOutlined, // Icon lịch
  ClockCircleOutlined, // Icon đồng hồ
  EnvironmentOutlined, // Icon địa điểm
  SafetyCertificateOutlined, // Icon chứng chỉ an toàn
  MedicineBoxOutlined, // Icon hộp thuốc
  UserOutlined, // Icon người dùng
  PhoneOutlined, // Icon điện thoại
  MailOutlined, // Icon email
} from "@ant-design/icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { donorApi } from "../../services/donorApi";
import { enhancedDonorApi } from "../../services/enhancedDonorApi";
import { bloodManagementApi } from "../../services/bloodManagementApi";
import { bloodDonationApi } from "../../services/bloodDonationApi";
import { UserAPI } from "../../services/userApi";
import { getAllBloodRequests } from "../../services/emergencyRequestApi";
import { 
  canDonateBloodTo, 
  getBloodTypeFromID, 
  getCompatibleRecipientBloodTypes 
} from "../../utils/bloodTypeCompatibility";
import "../../styles/BloodDonationRegistration.css";

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { TextArea } = Input;
const { Option } = Select;

const BloodDonationRegistration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [userInfo, setUserInfo] = useState(null);
  const [loadingUserInfo, setLoadingUserInfo] = useState(false);
  const [agreement, setAgreement] = useState(false);
  const [formData, setFormData] = useState({}); // Store form data between steps
  const [bloodTypes, setBloodTypes] = useState([]); // Dynamic blood types from API
  const [loadingBloodTypes, setLoadingBloodTypes] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [autoBloodType, setAutoBloodType] = useState("");
  const [autoAddress, setAutoAddress] = useState("");
  
  // Emergency request support states
  const [emergencyRequest, setEmergencyRequest] = useState(null);
  const [loadingEmergencyRequest, setLoadingEmergencyRequest] = useState(false);
  const [bloodTypeCompatibilityWarning, setBloodTypeCompatibilityWarning] = useState("");
  
  // Business rule: minimum 12 weeks between donations
  const [minNextDonationDate, setMinNextDonationDate] = useState(null);
  // Load blood types from API on component mount
  useEffect(() => {
    // Initialize with static blood types first
    setBloodTypes(getStaticBloodTypes());
    // Then try to load from API
    loadBloodTypes();
    // Check if user already has pending/approved donation
    checkExistingDonation();
    // Check last successful donation for 12-week rule
    fetchLastSuccessfulDonation();
    // Load emergency request if provided in URL
    loadEmergencyRequestIfPresent();
  }, []);

  // Load emergency request information if emergencyRequestId is in URL
  const loadEmergencyRequestIfPresent = async () => {
    const emergencyRequestId = searchParams.get('emergencyRequestId');
    if (!emergencyRequestId) return;

    setLoadingEmergencyRequest(true);
    try {
      console.log('Loading emergency request:', emergencyRequestId);
      
      // Get all emergency requests and find the specific one
      const allRequests = await getAllBloodRequests();
      const targetRequest = allRequests.find(req => 
        req.requestId === emergencyRequestId || 
        req.id === emergencyRequestId
      );

      if (targetRequest) {
        setEmergencyRequest(targetRequest);
        console.log('Emergency request loaded:', targetRequest);
        
        // Show info message that user is supporting an emergency request
        setSuccess(`Bạn đang hỗ trợ yêu cầu khẩn cấp cho nhóm máu ${getBloodTypeFromID(targetRequest.bloodTypeRequired) || targetRequest.bloodTypeRequired}. Vui lòng chọn nhóm máu tương thích.`);
      } else {
        console.warn('Emergency request not found:', emergencyRequestId);
        setError('Không tìm thấy yêu cầu khẩn cấp. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error loading emergency request:', error);
      setError('Không thể tải thông tin yêu cầu khẩn cấp.');
    } finally {
      setLoadingEmergencyRequest(false);
    }
  };

  // Check blood type compatibility with emergency request
  const checkBloodTypeCompatibility = (selectedBloodTypeID) => {
    if (!emergencyRequest || !selectedBloodTypeID) {
      setBloodTypeCompatibilityWarning("");
      return true;
    }

    const selectedBloodType = convertBloodTypeIDToString(selectedBloodTypeID);
    const neededBloodType = getBloodTypeFromID(emergencyRequest.bloodTypeRequired) || emergencyRequest.bloodTypeRequired;
    
    if (!selectedBloodType || !neededBloodType) {
      setBloodTypeCompatibilityWarning("");
      return true;
    }

    // Check if selected blood type can donate to needed blood type
    const isCompatible = canDonateBloodTo(selectedBloodType, neededBloodType);
    
    if (!isCompatible) {
      // Show which blood types can help this emergency
      const compatibleDonors = getCompatibleRecipientBloodTypes(selectedBloodType);
      const canHelpBloodTypes = compatibleDonors.join(", ");
      
      // Get which blood types can help the emergency request
      const { getCompatibleDonorBloodTypes } = require("../../utils/bloodTypeCompatibility");
      const canHelpEmergency = getCompatibleDonorBloodTypes(neededBloodType);
      
      setBloodTypeCompatibilityWarning(
        `⚠️ CẢNH BÁO: Nhóm máu ${selectedBloodType} không thể hỗ trợ cho nhóm máu ${neededBloodType}. ` +
        `\n\n📋 Nhóm máu ${selectedBloodType} chỉ có thể hỗ trợ cho: ${canHelpBloodTypes}` +
        `\n\n🩸 Yêu cầu khẩn cấp ${neededBloodType} có thể nhận từ: ${canHelpEmergency.join(", ")}` +
        `\n\n💡 Vui lòng chọn một trong các nhóm máu tương thích hoặc huỷ hỗ trợ yêu cầu này.`
      );
      return false;
    } else {
      setBloodTypeCompatibilityWarning("");
      setSuccess(`✅ Nhóm máu ${selectedBloodType} có thể hỗ trợ cho yêu cầu khẩn cấp ${neededBloodType}!`);
      return true;
    }
  };

  // Lấy lần hiến máu thành công gần nhất để tính ngày có thể đăng ký tiếp theo
  const fetchLastSuccessfulDonation = async () => {
    try {
      // Ưu tiên lấy donorId từ profile nếu có
      let donorId = null;
      try {
        const donorProfile = await donorApi.checkDonorProfile(true);
        if (donorProfile && donorProfile.exists && donorProfile.donorID) {
          donorId = donorProfile.donorID;
        }
      } catch (e) {}

      let data = [];
      if (donorId) {
        // Đúng chuẩn API: lấy theo donorId
        data = await bloodDonationApi.getBloodDonationsByDonor(donorId);
      } else {
        // Fallback: lấy theo userId nếu chưa có donorId
        const userId = localStorage.getItem("userId");
        if (!userId) return;
        data = await bloodDonationApi.getBloodDonationsByDonor(userId);
      }
      // Tìm lần hiến máu gần nhất có status là 'completed' hoặc 'success'
      const completedDonations = data
        .filter((donation) =>
          ["completed", "success", "thành công", "hoàn thành"].includes(
            (donation.status || "").toLowerCase()
          )
        )
        .sort((a, b) => new Date(b.donationDate) - new Date(a.donationDate));
      if (completedDonations.length > 0) {
        const lastDonationDate = new Date(completedDonations[0].donationDate);
        // Cộng thêm 12 tuần (84 ngày)
        const nextAllowed = new Date(
          lastDonationDate.getTime() + 84 * 24 * 60 * 60 * 1000
        );
        setMinNextDonationDate(nextAllowed);
      } else {
        setMinNextDonationDate(null);
      }
    } catch (error) {
      setMinNextDonationDate(null);
    }
  };

  // useEffect để auto fill khi user đã đăng nhập
  useEffect(() => {
    const fetchDonorProfile = async () => {
      const donorProfile = await donorApi.checkDonorProfile(true);
      if (donorProfile && donorProfile.exists && donorProfile.donorID) {
        const donorDetail = await donorApi.getDonorProfileById(
          donorProfile.donorID
        );
        const bloodTypeId = donorDetail.bloodTypeId || donorDetail.bloodTypeID;
        const address = donorDetail.address || donorDetail.Address || "";
        setAutoBloodType(bloodTypeId || "");
        setAutoAddress(address);
        form.setFieldsValue({
          bloodTypeID: bloodTypeId || "",
          address: address,
        });
        form.validateFields(["bloodTypeID"]);
        
        // Check compatibility with emergency request if present
        if (bloodTypeId) {
          const isCompatible = checkBloodTypeCompatibility(bloodTypeId);
          if (!isCompatible && emergencyRequest) {
            // If auto-filled blood type is not compatible, show warning but don't prevent usage
            setTimeout(() => {
              setError(
                `Nhóm máu trong hồ sơ của bạn (${convertBloodTypeIDToString(bloodTypeId)}) không tương thích với yêu cầu khẩn cấp. ` +
                `Bạn có thể thay đổi nhóm máu hoặc huỷ hỗ trợ yêu cầu này.`
              );
            }, 1000);
          }
        }
      }
    };
    fetchDonorProfile();
  }, [bloodTypes, emergencyRequest]); // Add emergencyRequest as dependency

  // Sau khi setAutoAddress trong useEffect, đồng bộ lại form nếu autoAddress thay đổi
  useEffect(() => {
    if (autoAddress) {
      form.setFieldsValue({ address: autoAddress });
    }
  }, [autoAddress]);

  // Check if user already has pending or approved donation
  const checkExistingDonation = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      const data = await bloodDonationApi.getBloodDonationsByDonor(userId);
      const existingDonation = data.find(
        (donation) =>
          donation.status === "pending" || donation.status === "approved"
      );

      if (existingDonation) {
        setError(
          "Bạn đã có đơn hiến máu đang xử lý. Vui lòng chờ xác nhận hoặc hoàn thành đơn hiện tại."
        );
        // Redirect to blood donation profile after 3 seconds
        setTimeout(() => {
          navigate("/member/blood-donation-profile");
        }, 3000);
      }
    } catch (error) {
      console.error("Error checking existing donation:", error);
    }
  };

  const loadBloodTypes = async () => {
    setLoadingBloodTypes(true);
    try {
      const response = await bloodManagementApi.getBloodTypes();

      // Format blood types data - handle multiple possible response formats
      let formattedBloodTypes = [];

      if (Array.isArray(response)) {
        formattedBloodTypes = response;
      } else if (response && Array.isArray(response.data)) {
        formattedBloodTypes = response.data;
      } else if (response && Array.isArray(response.bloodTypes)) {
        formattedBloodTypes = response.bloodTypes;
      } else if (response && typeof response === "object") {
        // Try to find any array property
        const arrayKeys = Object.keys(response).filter((key) =>
          Array.isArray(response[key])
        );
        if (arrayKeys.length > 0) {
          formattedBloodTypes = response[arrayKeys[0]];
        }
      }

      if (formattedBloodTypes.length > 0) {
        setBloodTypes(formattedBloodTypes);
      }
    } catch (error) {
      console.error("Error loading blood types from API:", error);
      // Keep static blood types if API fails
    } finally {
      setLoadingBloodTypes(false);
    }
  };

  // Static blood types as fallback
  const getStaticBloodTypes = () => [
    {
      bloodTypeID: "11111111-1111-1111-1111-111111111001",
      aboType: "A",
      rhFactor: "+",
      description: "Nhóm máu A Rh dương",
    },
    {
      bloodTypeID: "11111111-1111-1111-1111-111111111002",
      aboType: "A",
      rhFactor: "-",
      description: "Nhóm máu A Rh âm",
    },
    {
      bloodTypeID: "11111111-1111-1111-1111-111111111003",
      aboType: "B",
      rhFactor: "+",
      description: "Nhóm máu B Rh dương",
    },
    {
      bloodTypeID: "11111111-1111-1111-1111-111111111004",
      aboType: "B",
      rhFactor: "-",
      description: "Nhóm máu B Rh âm",
    },
    {
      bloodTypeID: "11111111-1111-1111-1111-111111111005",
      aboType: "AB",
      rhFactor: "+",
      description: "Nhóm máu AB Rh dương",
    },
    {
      bloodTypeID: "11111111-1111-1111-1111-111111111006",
      aboType: "AB",
      rhFactor: "-",
      description: "Nhóm máu AB Rh âm",
    },
    {
      bloodTypeID: "11111111-1111-1111-1111-111111111007",
      aboType: "O",
      rhFactor: "+",
      description: "Nhóm máu O Rh dương",
    },
    {
      bloodTypeID: "11111111-1111-1111-1111-111111111008",
      aboType: "O",
      rhFactor: "-",
      description: "Nhóm máu O Rh âm",
    },
  ];

  // Fetch current user information
  const fetchUserInfo = async () => {
    setLoadingUserInfo(true);
    try {
      console.log("BloodDonationRegistration - Fetching user info...");
      const userResponse = await UserAPI.getCurrentUser();
      console.log("BloodDonationRegistration - User response:", userResponse);

      const userData = userResponse.data || userResponse;
      setUserInfo(userData);
      console.log("BloodDonationRegistration - User info set:", userData);
    } catch (error) {
      console.error(
        "BloodDonationRegistration - Error fetching user info:",
        error
      );
      setError("Không thể tải thông tin người dùng. Vui lòng thử lại.");

      // Fallback to localStorage data for demo purposes
      const fallbackUserInfo = {
        fullName: localStorage.getItem("username") || "Người dùng",
        username: localStorage.getItem("username") || "user",
        email: "member@example.com",
        phone: "Chưa cập nhật",
        userIdCard: "Chưa cập nhật",
        dateOfBirth: null,
        role: localStorage.getItem("userRole") || "Member",
        userId: localStorage.getItem("userId") || "temp-user-id",
      };

      console.log(
        "BloodDonationRegistration - Using fallback user info:",
        fallbackUserInfo
      );
      setUserInfo(fallbackUserInfo);
    } finally {
      setLoadingUserInfo(false);
    }
  };

  // Helper function to validate blood type ID
  const isValidBloodTypeID = (bloodTypeID) => {
    if (
      !bloodTypeID ||
      bloodTypeID === "unknown" ||
      bloodTypeID === "undefined"
    ) {
      return false;
    }
    // Check if the bloodTypeID exists in our bloodTypes array (supports multiple field name formats)
    return bloodTypes.some(
      (type) =>
        type.bloodTypeId === bloodTypeID || // API uses lowercase 'd'
        type.bloodTypeID === bloodTypeID ||
        type.BloodTypeID === bloodTypeID ||
        type.id === bloodTypeID
    );
  };

  // Helper function to convert bloodTypeID to bloodType string for API
  const convertBloodTypeIDToString = (bloodTypeID) => {
    if (!bloodTypeID) return null;

    const selectedBloodType = bloodTypes.find(
      (type) =>
        type.bloodTypeId === bloodTypeID || // API uses lowercase 'd'
        type.bloodTypeID === bloodTypeID ||
        type.BloodTypeID === bloodTypeID ||
        type.id === bloodTypeID
    );

    if (selectedBloodType) {
      const aboType =
        selectedBloodType.aboType || selectedBloodType.AboType || "";
      const rhFactor =
        selectedBloodType.rhFactor || selectedBloodType.RhFactor || "";
      return `${aboType}${rhFactor}`; // e.g., "A+", "B-", "AB+", "O-"
    }

    return null;
  };

  const onFinish = async (values) => {
    // Only proceed with submission if we're on the final step and user clicked submit
    if (currentStep !== steps.length - 1) {
      return;
    }

    // Check agreement before submitting
    if (!agreement) {
      setError("Vui lòng đồng ý với điều khoản trước khi đăng ký.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Get current form values first, then merge with stored data
      const currentFormValues = form.getFieldsValue();
      const formValues = { ...formData, ...currentFormValues };

      // Validate required fields
      if (!formValues.donationDate) {
        setError("Vui lòng chọn ngày hiến máu!");
        return;
      }

      if (!isValidBloodTypeID(formValues.bloodTypeID)) {
        setError("Vui lòng chọn nhóm máu hợp lệ!");
        return;
      }

      if (!formValues.address || !formValues.address.trim()) {
        setError("Vui lòng nhập địa chỉ!");
        return;
      }

      // Convert bloodTypeID to bloodType string for API
      const bloodTypeString = convertBloodTypeIDToString(
        formValues.bloodTypeID
      );
      if (!bloodTypeString) {
        setError("Không thể xác định nhóm máu. Vui lòng chọn lại!");
        return;
      }

      const donationData = {
        donorID: null, // Let backend set this based on authenticated user
        donationDate:
          formValues.donationDate && formValues.donationTime
            ? dayjs(
                formValues.donationDate.format("YYYY-MM-DD") +
                  "T" +
                  formValues.donationTime.format("HH:mm")
              )
                .add(7, "hour")
                .toISOString()
            : null,
        bloodTypeID: formValues.bloodTypeID || null, // Keep for internal tracking
        bloodType: bloodTypeString, // Send this to API (e.g., "A+", "B-")
        status: "Pending",
        address: formValues.address || "",
        currentMedications: formValues.currentMedications || "",
        notes: formValues.notes || "",
        certificateID: null,
      };

      // Use enhanced API that saves address and currentMedications to donor table
      const result = await enhancedDonorApi.registerBloodDonationWithDonor(
        donationData
      );

      // Show success message
      let successMessage =
        "Đăng ký hiến máu thành công! Chúng tôi sẽ liên hệ với bạn để xác nhận lịch hẹn.";

      // Check if we have additional info about donor profile
      if (result && result.donorProfileInfo) {
        const { action, error, errorDetails } = result.donorProfileInfo;
        if (action === "created") {
          successMessage +=
            " Hồ sơ hiến máu của bạn đã được tạo mới với thông tin địa chỉ và thuốc đang sử dụng.";
        } else if (action === "updated") {
          successMessage +=
            " Hồ sơ hiến máu của bạn đã được cập nhật với thông tin địa chỉ và thuốc đang sử dụng.";
        } else if (action === "failed" || action === "failed_creation") {
          successMessage +=
            " Tuy nhiên, có lỗi khi cập nhật hồ sơ hiến máu. Vui lòng liên hệ hỗ trợ để cập nhật thông tin.";

          // Show a separate warning alert
          setTimeout(() => {
            setError(
              `Cảnh báo: Không thể cập nhật hồ sơ hiến máu. Chi tiết lỗi: ${
                errorDetails || error
              }`
            );
          }, 3000);
        }
      }

      setSuccess(successMessage);

      // Clear any cached profile data to force refresh
      const keysToRemove = [
        "cachedUserProfile",
        "cachedDonorProfile",
        "profileCache",
        "userProfileCache",
        "donorProfileCache",
      ];

      keysToRemove.forEach((key) => {
        localStorage.removeItem(key);
      });

      // Dispatch a custom event to notify Profile component to refresh
      const profileRefreshEvent = new CustomEvent("profileDataChanged", {
        detail: {
          reason: "blood_donation_registration",
          newDonorProfile: true,
          bloodTypeUpdated: true,
        },
      });
      window.dispatchEvent(profileRefreshEvent);

      // Reset form after success
      setTimeout(() => {
        form.resetFields();
        setFormData({});
        setCurrentStep(0);
        setAgreement(false);
        navigate("/");
      }, 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    setError("Vui lòng kiểm tra lại thông tin đăng ký.");
  };

  const steps = [
    {
      title: "Thông tin hiến máu",
      description: "Ngày hiến máu, nhóm máu và thông tin y tế",
    },
    {
      title: "Xác nhận đăng ký",
      description: "Kiểm tra thông tin và hoàn tất",
    },
  ];

  const nextStep = () => {
    const fieldsToValidate =
      currentStep === 0
        ? ["donationDate", "bloodTypeID", "address", "currentMedications"]
        : [];

    form
      .validateFields(fieldsToValidate)
      .then((values) => {
        // Get all form values, including optional ones like notes
        const allFormValues = form.getFieldsValue();

        // Additional validation for bloodTypeID and conversion
        const bloodTypeIDToValidate =
          values.bloodTypeID || allFormValues.bloodTypeID;
        if (currentStep === 0 && !isValidBloodTypeID(bloodTypeIDToValidate)) {
          setError("Vui lòng chọn nhóm máu hợp lệ!");
          return;
        }

        // Additional validation: check if we can convert bloodTypeID to string
        if (currentStep === 0) {
          const bloodTypeString = convertBloodTypeIDToString(
            bloodTypeIDToValidate
          );
          if (!bloodTypeString) {
            setError("Không thể xác định nhóm máu. Vui lòng chọn lại!");
            return;
          }

          // Check blood type compatibility with emergency request
          if (!checkBloodTypeCompatibility(bloodTypeIDToValidate)) {
            setError("Nhóm máu bạn chọn không tương thích với yêu cầu khẩn cấp. Vui lòng chọn nhóm máu tương thích hoặc huỷ hỗ trợ yêu cầu này.");
            return;
          }
        }

        // Validate required fields for step 0
        if (currentStep === 0) {
          if (!allFormValues.address || !allFormValues.address.trim()) {
            setError("Vui lòng nhập địa chỉ!");
            return;
          }
        }

        // Store form data - merge with existing data
        const newFormData = {
          ...formData,
          ...values,
          ...allFormValues, // This ensures we capture all fields including optional ones
        };

        setFormData(newFormData);

        if (currentStep === 0) {
          // When moving to confirmation step, fetch user info
          fetchUserInfo();
        }
        setCurrentStep(currentStep + 1);
        setError("");
      })
      .catch((error) => {
        setError("Vui lòng điền đầy đủ thông tin bắt buộc.");
      });
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    setError("");
  };

  // Chặn chọn ngày hiến máu vi phạm quy tắc 12 tuần
  const disabledDate = (current) => {
    if (!current) return false;
    if (minNextDonationDate) {
      // Chỉ cho phép chọn ngày >= minNextDonationDate
      return (
        current &&
        current.startOf("day") < dayjs(minNextDonationDate).startOf("day")
      );
    }
    return false;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Card title="Thông tin hiến máu" className="step-card">
            <Form.Item
              label="Ngày hiến máu"
              name="donationDate"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn ngày hiến máu mong muốn!",
                },
              ]}
            >
              <DatePicker
                placeholder="Chọn ngày hiến máu"
                className="modern-input"
                style={{ width: "70%" }}
                format="DD/MM/YYYY"
                suffixIcon={<CalendarOutlined />}
                disabledDate={disabledDate}
              />
            </Form.Item>
            <Form.Item
              label="Giờ hiến máu"
              name="donationTime"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn giờ hiến máu mong muốn!",
                },
              ]}
            >
              <TimePicker
                placeholder="Chọn giờ hiến máu"
                className="modern-input"
                style={{ width: "50%" }}
                format="HH:mm"
                minuteStep={5}
                suffixIcon={<ClockCircleOutlined />}
                disabledHours={() => [
                  ...Array(8).keys(), // 0-7
                  ...Array.from({ length: 24 - 17 }, (_, i) => i + 18), // 18-23 (chỉ cho phép đến 17:00)
                ]}
                hideDisabledOptions={true}
              />
            </Form.Item>

            <Form.Item
              label="Nhóm máu"
              name="bloodTypeID"
              rules={[
                { required: true, message: "Vui lòng chọn nhóm máu!" },
                {
                  validator: (_, value) => {
                    if (!isValidBloodTypeID(value)) {
                      return Promise.reject(
                        new Error("Vui lòng chọn nhóm máu hợp lệ!")
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Select
                placeholder={
                  loadingBloodTypes
                    ? "Đang tải nhóm máu..."
                    : "Chọn nhóm máu của bạn"
                }
                className="modern-input"
                showSearch
                loading={loadingBloodTypes}
                disabled={loadingBloodTypes || bloodTypes.length === 0}
                filterOption={(input, option) => {
                  const searchText = option?.searchText || "";
                  return searchText
                    .toLowerCase()
                    .includes(input.toLowerCase());
                }}
                notFoundContent={
                  loadingBloodTypes
                    ? "Đang tải..."
                    : "Không tìm thấy nhóm máu"
                }
                onChange={(value) => {
                  const selectedType = bloodTypes.find(
                    (type) =>
                      type.bloodTypeId === value || // API uses lowercase 'd' - check first
                      type.bloodTypeID === value ||
                      type.BloodTypeID === value ||
                      type.id === value
                  );

                  // Update both the form value and the formData state
                  setFormData((prev) => ({
                    ...prev,
                    bloodTypeID: value,
                  }));

                  // Also update the Ant Design form field
                  form.setFieldsValue({
                    bloodTypeID: value,
                  });

                  // Check compatibility with emergency request if present
                  checkBloodTypeCompatibility(value);
                }}
                // KHÔNG dùng defaultValue hoặc value ở đây
              >
                {bloodTypes.map((type, index) => {
                  const key =
                    type.bloodTypeId ||
                    type.bloodTypeID ||
                    type.BloodTypeID ||
                    type.id ||
                    `type-${index}`;
                  const aboType = type.aboType || type.AboType || "";
                  const rhFactor = type.rhFactor || type.RhFactor || "";
                  const description =
                    type.description ||
                    type.Description ||
                    `Nhóm máu ${aboType} Rh ${
                      rhFactor === "+" ? "dương" : "âm"
                    }`;
                  return (
                    <Option
                      key={key}
                      value={key}
                      searchText={`${aboType}${rhFactor} ${description}`}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Tag color="red" style={{ margin: 0 }}>
                          {aboType}
                          {rhFactor}
                        </Tag>
                        <span style={{ fontSize: "12px", color: "#666" }}>
                          {description}
                        </span>
                      </div>
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>

            <Form.Item
              label="Địa chỉ"
              name="address"
              rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
            >
              <TextArea
                placeholder="Nhập địa chỉ hiện tại của bạn"
                rows={2}
                className="modern-input"
              />
            </Form.Item>
            <Form.Item label="Ghi chú" name="notes">
              <TextArea
                placeholder="Ghi chú thêm (tùy chọn)"
                rows={2}
                className="modern-input"
              />
            </Form.Item>

            {/* Emergency Request Information */}
            {emergencyRequest && (
              <Alert
                message="Thông tin yêu cầu khẩn cấp"
                description={
                  <div>
                    <p><strong>Bệnh nhân:</strong> {emergencyRequest.patientName}</p>
                    <p><strong>Nhóm máu cần:</strong> {getBloodTypeFromID(emergencyRequest.bloodTypeRequired) || emergencyRequest.bloodTypeRequired}</p>
                    <p><strong>Số lượng cần:</strong> {emergencyRequest.quantityNeeded}ml</p>
                    {(() => {
                      try {
                        const { getCompatibleDonorBloodTypes } = require("../../utils/bloodTypeCompatibility");
                        const neededBloodType = getBloodTypeFromID(emergencyRequest.bloodTypeRequired) || emergencyRequest.bloodTypeRequired;
                        const compatibleDonors = getCompatibleDonorBloodTypes(neededBloodType);
                        return (
                          <p><strong>Nhóm máu có thể hỗ trợ:</strong> {compatibleDonors.join(", ")}</p>
                        );
                      } catch (e) {
                        return null;
                      }
                    })()}
                    {emergencyRequest.description && (
                      <p><strong>Mô tả:</strong> {emergencyRequest.description}</p>
                    )}
                  </div>
                }
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            {/* Blood Type Compatibility Warning */}
            {bloodTypeCompatibilityWarning && (
              <Alert
                message="Cảnh báo tương thích nhóm máu"
                description={bloodTypeCompatibilityWarning}
                type="error"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}
          </Card>
        );

      case 1:
        return (
          <Card title="Xác nhận thông tin đăng ký" className="step-card">
            <div className="confirmation-content">
              {loadingUserInfo ? (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <Text>Đang tải thông tin cá nhân...</Text>
                </div>
              ) : (
                <>
                  <Divider orientation="left">Thông tin cá nhân</Divider>

                  {userInfo ? (
                    <Row gutter={[16, 16]}>
                      <Col span={24}>
                        <div className="confirm-item">
                          <Text strong>Họ và tên:</Text>
                          <Text>{userInfo.fullName || "Chưa cập nhật"}</Text>
                        </div>
                      </Col>
                      <Col span={24}>
                        <div className="confirm-item">
                          <Text strong>Email:</Text>
                          <Text>{userInfo.email || "Chưa cập nhật"}</Text>
                        </div>
                      </Col>
                      <Col span={11}>
                        <div className="confirm-item">
                          <Text strong>Số điện thoại:</Text>
                          <Text>{userInfo.phone || "Chưa cập nhật"}</Text>
                        </div>
                      </Col>
                      <Col span={13}>
                        <div className="confirm-item">
                          <Text strong>Số CMND/CCCD:</Text>
                          <Text>{userInfo.userIdCard || "Chưa cập nhật"}</Text>
                        </div>
                      </Col>
                      <Col span={24}>
                        <div className="confirm-item">
                          <Text strong>Ngày sinh:</Text>
                          <Text>
                            {userInfo.dateOfBirth
                              ? dayjs(userInfo.dateOfBirth).format("DD/MM/YYYY")
                              : "Chưa cập nhật"}
                          </Text>
                        </div>
                      </Col>
                    </Row>
                  ) : (
                    <Alert
                      message="Không thể tải thông tin cá nhân"
                      description="Vui lòng kiểm tra kết nối và thử lại."
                      type="warning"
                      showIcon
                    />
                  )}

                  <Divider orientation="left">Thông tin hiến máu</Divider>

                  <Row gutter={[16, 16]}>
                    <Col span={24}>
                      <div className="confirm-item">
                        <Text strong>Ngày hiến máu :</Text>
                        <Text>
                          {formData.donationDate
                            ? formData.donationDate.format("DD/MM/YYYY")
                            : "Chưa chọn"}
                          {formData.donationTime ? (
                            <>
                              {" "}
                              <Text strong> Giờ: </Text>
                              {formData.donationTime.format("HH:mm")}
                            </>
                          ) : null}
                        </Text>
                      </div>
                    </Col>
                    <Col span={24}>
                      <div className="confirm-item">
                        <Text strong>Nhóm máu:</Text>
                        <Text>
                          {(() => {
                            const selectedBloodTypeID = formData.bloodTypeID;
                            const selectedBloodType = bloodTypes.find(
                              (type) =>
                                type.bloodTypeId === selectedBloodTypeID || // API uses lowercase 'd' - check first
                                type.bloodTypeID === selectedBloodTypeID ||
                                type.BloodTypeID === selectedBloodTypeID ||
                                type.id === selectedBloodTypeID
                            );

                            return selectedBloodType ? (
                              <Tag color="red">
                                {selectedBloodType.aboType ||
                                  selectedBloodType.AboType}
                                {selectedBloodType.rhFactor ||
                                  selectedBloodType.RhFactor}
                              </Tag>
                            ) : (
                              "Chưa chọn"
                            );
                          })()}
                        </Text>
                      </div>
                    </Col>
                  </Row>

                  <Row gutter={[16, 16]}>
                    <Col span={24}>
                      <div className="confirm-item">
                        <Text strong>Địa chỉ:</Text>
                        <Text>{formData.address || "Chưa điền"}</Text>
                      </div>
                    </Col>
                  </Row>

                  {formData.notes && (
                    <Row gutter={[16, 16]}>
                      <Col span={24}>
                        <div className="confirm-item">
                          <Text strong>Ghi chú:</Text>
                          <Text>{formData.notes}</Text>
                        </div>
                      </Col>
                    </Row>
                  )}

                  <Divider />

                  <div style={{ marginBottom: "16px" }}>
                    <Checkbox
                      checked={agreement}
                      onChange={(e) => setAgreement(e.target.checked)}
                    >
                      <Text>Xác nhận đơn đăng ký</Text>
                    </Checkbox>
                  </div>

                  <Alert
                    message="Lưu ý quan trọng"
                    description="Sau khi đăng ký thành công, vui lòng vào hồ sơ hiến máu để cập nhật thông báo mới nhất về tình trạng đơn đăng ký và lịch hiến máu của bạn."
                    type="info"
                    showIcon
                  />

                  {/* Temporarily hidden until donor profile endpoints are ready */}
                  {/* {userInfo && !userInfo.hasDonorProfile && (
                    <Alert
                      message="Đăng ký lần đầu"
                      description="Đây là lần đầu bạn đăng ký hiến máu. Hệ thống sẽ tự động tạo hồ sơ hiến máu cho bạn. Hồ sơ này sẽ được sử dụng cho các lần hiến máu tiếp theo."
                      type="warning"
                      showIcon
                      style={{ marginTop: '16px' }}
                    />
                  )}

                  {userInfo && userInfo.hasDonorProfile && userInfo.donorID && (
                    <Alert
                      message="Hồ sơ hiến máu đã có"
                      description={`Bạn đã có hồ sơ hiến máu (ID: ${userInfo.donorID.substring(0, 8)}...). Đăng ký này sẽ được liên kết với hồ sơ hiện tại.`}
                      type="success"
                      showIcon
                      style={{ marginTop: '16px' }}
                    />
                  )} */}
                </>
              )}
            </div>
          </Card>
        );

      default:
        return null;
    }
  };

  const initialValues = {
    bloodTypeID: autoBloodType || undefined,
    address: autoAddress || undefined,
  };

  return (
    <div className="blood-donation-registration-container">
      <div className="registration-header">
        <div className="header-content">
          <HeartFilled className="header-icon" />
          <Title level={2} className="header-title">
            Đăng ký hiến máu
          </Title>
          <Paragraph className="header-subtitle">
            Cùng chung tay cứu sống những người cần được giúp đỡ
          </Paragraph>
        </div>
      </div>

      <div className="registration-content">
        <Form
          form={form}
          name="bloodDonationRegistration"
          className="blood-donation-form"
          layout="vertical"
          size="large"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <div className="form-content">{renderStepContent()}</div>

          {minNextDonationDate && (
            <Alert
              message={`Bạn chỉ có thể đăng ký hiến máu sau ngày ${dayjs(
                minNextDonationDate
              ).format(
                "DD/MM/YYYY"
              )}. (Khoảng cách tối thiểu giữa hai lần hiến là 12 tuần)`}
              type="info"
              showIcon
              className="alert-message"
              style={{ marginBottom: 16 }}
            />
          )}

          {/* Emergency Request Cancel Option */}
          {emergencyRequest && (
            <Alert
              message="Hỗ trợ yêu cầu khẩn cấp"
              description={
                <div>
                  <p>Bạn đang hỗ trợ yêu cầu khẩn cấp cho bệnh nhân <strong>{emergencyRequest.patientName}</strong>.</p>
                  <Button 
                    type="link" 
                    onClick={() => {
                      navigate('/member/blood-donation-registration');
                      setEmergencyRequest(null);
                      setBloodTypeCompatibilityWarning("");
                      setSuccess("");
                    }}
                    style={{ paddingLeft: 0 }}
                  >
                    Huỷ hỗ trợ và đăng ký hiến máu bình thường
                  </Button>
                </div>
              }
              type="warning"
              showIcon
              className="alert-message"
              style={{ marginBottom: 16 }}
            />
          )}

          {(error || success) && (
            <Alert
              message={error || success}
              type={error ? "error" : "success"}
              showIcon
              className="alert-message"
            />
          )}

          <div className="form-actions">
            {currentStep > 0 && (
              <Button onClick={prevStep} className="prev-btn" size="large">
                Quay lại
              </Button>
            )}

            {currentStep < steps.length - 1 ? (
              <Button
                type="primary"
                onClick={nextStep}
                className="next-btn"
                size="large"
              >
                Tiếp theo
              </Button>
            ) : (
              <Button
                type="primary"
                onClick={() => {
                  if (!agreement) {
                    setError(
                      "Vui lòng đồng ý với điều khoản trước khi đăng ký."
                    );
                    return;
                  }
                  onFinish(formData);
                }}
                loading={loading}
                className="submit-btn"
                size="large"
                icon={<HeartFilled />}
              >
                {loading ? "Đang xử lý..." : "Đăng ký hiến máu"}
              </Button>
            )}
          </div>
        </Form>
      </div>

      <div className="info-cards">
        <Row gutter={16}>
          <Col span={8}>
            <Card className="info-card">
              <SafetyCertificateOutlined className="info-icon" />
              <Title level={4}>An toàn tuyệt đối</Title>
              <Text>
                Quy trình hiến máu đạt chuẩn quốc tế, đảm bảo an toàn cho người
                hiến
              </Text>
            </Card>
          </Col>
          <Col span={8}>
            <Card className="info-card">
              <MedicineBoxOutlined className="info-icon" />
              <Title level={4}>Khám sức khỏe miễn phí</Title>
              <Text>
                Được khám sức khỏe tổng quát miễn phí trước khi hiến máu
              </Text>
            </Card>
          </Col>
          <Col span={8}>
            <Card className="info-card">
              <HeartFilled className="info-icon" />
              <Title level={4}>Cứu sống người khác</Title>
              <Text>
                Mỗi lần hiến máu có thể cứu sống 3 người cần truyền máu
              </Text>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default BloodDonationRegistration;
