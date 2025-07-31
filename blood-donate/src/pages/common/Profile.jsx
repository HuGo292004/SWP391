// Import các thư viện React và hooks cần thiết
import React, { useState, useEffect } from "react";

// Import các component từ Ant Design
import {
  Card, // Component card container
  Row, // Component hàng grid
  Col, // Component cột grid
  Typography, // Component typography
  Avatar, // Component avatar
  Button, // Component button
  Descriptions, // Component mô tả chi tiết
  Tag, // Component tag
  Space, // Component khoảng cách
  Divider, // Component phân cách
  Modal, // Component modal
  Form, // Component form
  Input, // Component input
  DatePicker, // Component chọn ngày
  Select, // Component select
  message, // Service thông báo
  Spin, // Component loading spinner
  Switch, // Component switch
  InputNumber, // Component input số
  Alert, // Component thông báo
} from "antd";

// Import các icon từ Ant Design
import {
  UserOutlined, // Icon người dùng
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  SafetyCertificateOutlined,
  HeartOutlined,
  MedicineBoxOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { UserAPI } from "../../services/userApi";
import { donorApi } from "../../services/donorApi";
import {
  generateDonorID,
  createDonorProfile,
  updateDonorProfile,
} from "../../services/userManagementApi";
import "../../styles/pages.css";
import "../../styles/Profile.css";

const { Title, Text, Paragraph } = Typography;

// Hàm lấy tên nhóm máu từ bloodTypeID
const getBloodTypeName = (bloodTypeID) => {
  if (!bloodTypeID) {
    return "Chưa xác định";
  }

  const bloodTypeMap = {
    "11111111-1111-1111-1111-111111111001": "A+ (A Rh dương)",
    "11111111-1111-1111-1111-111111111002": "A- (A Rh âm)",
    "11111111-1111-1111-1111-111111111003": "B+ (B Rh dương)",
    "11111111-1111-1111-1111-111111111004": "B- (B Rh âm)",
    "11111111-1111-1111-1111-111111111005": "AB+ (AB Rh dương)",
    "11111111-1111-1111-1111-111111111006": "AB- (AB Rh âm)",
    "11111111-1111-1111-1111-111111111007": "O+ (O Rh dương)",
    "11111111-1111-1111-1111-111111111008": "O- (O Rh âm)",
  };

  // Try direct lookup first
  let result = bloodTypeMap[bloodTypeID];
  if (result) {
    return result;
  }

  // Try normalized versions
  const normalizedID = String(bloodTypeID).toUpperCase();
  result = bloodTypeMap[normalizedID];
  if (result) {
    return result;
  }

  const lowerID = String(bloodTypeID).toLowerCase();
  result = bloodTypeMap[lowerID];
  if (result) {
    return result;
  }

  return "Chưa xác định";
};

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Fetch user data from API
  const fetchUserData = async () => {
    try {
      setLoading(true);

      // Check if this is a demo account
      const token = localStorage.getItem("userToken");
      const userEmail =
        localStorage.getItem("userEmail") || localStorage.getItem("username");

      // Only use demo data for Member (not Staff or Admin)
      if (token === "demo-token" && userEmail === "member@example.com") {
        const mockData = getMockUserData();
        setUserInfo(mockData);

        const formValues = {
          ...mockData,
          dateOfBirth: mockData.dateOfBirth
            ? dayjs(mockData.dateOfBirth)
            : null,
        };
        form.setFieldsValue(formValues);
        return;
      }

      // Get current user data from API
      const userData = await UserAPI.getCurrentUser();

      // Check if userData is valid
      if (!userData) {
        throw new Error("No user data received from API");
      }

      // Process the data based on what we receive from API
      let processedUserData = {
        userID: userData.userId || userData.userID || "",
        username: userData.username || "",
        fullName: userData.fullName || userData.username || "Chưa cập nhật",
        email: userData.email || "",
        phone:
          userData.phone && userData.phone.trim() !== ""
            ? userData.phone
            : "Chưa cập nhật",
        userIdCard:
          userData.userIdCard && userData.userIdCard.trim() !== ""
            ? userData.userIdCard
            : "Chưa cập nhật",
        dateOfBirth: userData.dateOfBirth || null,
        role: userData.role || "",
        avatar: userData.avatar || null,
      };

      // Nếu là Member, thêm các field mặc định và lấy thông tin donor profile từ API
      if (userData.role === "Member") {
        try {
          // Lấy thông tin donor profile từ donorApi thay vì userManagementApi

          let donorProfile = null;

          try {
            // Sử dụng checkDonorProfile từ donorApi với forceRefresh khi cần
            const forceRefresh = true; // Always force refresh to get latest data
            const donorCheckResult = await donorApi.checkDonorProfile(
              forceRefresh
            );

            if (donorCheckResult.exists && donorCheckResult.donorID) {
              // Lấy thông tin chi tiết donor profile
              try {
                donorProfile = await donorApi.getDonorProfileById(
                  donorCheckResult.donorID
                );
              } catch (detailError) {
                // Tạo mock donor profile từ check result
                donorProfile = {
                  donorId: donorCheckResult.donorID,
                  userId: userData.userId || userData.userID,
                  bloodTypeId: null, // Will be null if not set
                  isAvailable: true,
                };
              }
            }
          } catch (donorApiError) {
            // Fallback: sử dụng getDonorProfileByUserId từ userManagementApi
            const { getDonorProfileByUserId } = await import(
              "../../services/userManagementApi"
            );
            donorProfile = await getDonorProfileByUserId(
              userData.userId || userData.userID || userData.id
            );
          }

          if (donorProfile && (donorProfile.donorID || donorProfile.donorId)) {
            // Đã có hồ sơ hiến máu - sử dụng thông tin thực tế từ database
            const bloodTypeID =
              donorProfile.bloodTypeId ||
              donorProfile.bloodTypeID ||
              donorProfile.BloodTypeId ||
              donorProfile.BloodTypeID;
            const userId =
              donorProfile.userId ||
              donorProfile.userID ||
              donorProfile.UserId ||
              donorProfile.UserID;
            const address =
              donorProfile.Address ||
              donorProfile.address ||
              userData.address ||
              ""; // Ưu tiên Address (viết hoa) từ database

            processedUserData = {
              ...processedUserData,
              donorID: donorProfile.donorId || donorProfile.donorID,
              bloodTypeID: bloodTypeID,
              bloodType: getBloodTypeName(bloodTypeID),
              isAvailable:
                donorProfile.isAvailable !== undefined
                  ? donorProfile.isAvailable
                  : true,
              lastDonationDate:
                donorProfile.lastDonationDate || donorProfile.LastDonationDate,
              nextEligibleDate:
                donorProfile.nextEligibleDate || donorProfile.NextEligibleDate,
              currentMedications:
                donorProfile.currentMedications ||
                donorProfile.CurrentMedications ||
                "",
              address: address, // Sử dụng address đã mapping từ Address
              hasDonorProfile: true,
              donorUserId: userId, // Lưu userID từ donor profile để debug
            };
          } else {
            // Chưa có hồ sơ hiến máu - hiển thị thông tin mặc định
            processedUserData = {
              ...processedUserData,
              donorID: null, // Chưa có mã hiến máu
              bloodTypeID: null,
              bloodType: null,
              isAvailable: true,
              lastDonationDate: null,
              nextEligibleDate: null,
              currentMedications: "",
              address: userData.address || "",
              hasDonorProfile: false,
            };
          }
        } catch (donorError) {
          // Không có hồ sơ hiến máu hoặc lỗi API - sử dụng thông tin mặc định
          processedUserData = {
            ...processedUserData,
            donorID: null, // Chưa có mã hiến máu
            bloodTypeID: null,
            bloodType: null,
            isAvailable: true,
            lastDonationDate: null,
            nextEligibleDate: null,
            currentMedications: "",
            address: userData.address || "",
            hasDonorProfile: false,
          };
        }
      }

      setUserInfo(processedUserData);

      // Set form values, ensuring dateOfBirth is properly handled
      const formValues = {
        ...processedUserData,
        dateOfBirth: processedUserData.dateOfBirth
          ? dayjs(processedUserData.dateOfBirth)
          : null,
      };
      form.setFieldsValue(formValues);
    } catch (error) {
      console.error("Profile.jsx - Error loading user data:", error);

      // Show different messages based on error type
      const isTokenIssue =
        error.message.includes("404") ||
        error.message.includes("getCurrentUser");
      if (isTokenIssue) {
        message.warning(
          "Không thể tải đầy đủ thông tin từ server. Hiển thị thông tin cơ bản."
        );
      } else {
        message.error(
          "Không thể tải thông tin người dùng. Sử dụng dữ liệu mẫu."
        );
      }

      // Fallback to mock data if API fails
      const mockData = getMockUserData();
      setUserInfo(mockData);
      form.setFieldsValue(mockData);
    } finally {
      setLoading(false);
    }
  };

  // Mock user data as fallback
  const getMockUserData = () => {
    const username = localStorage.getItem("username") || "user123";
    const role = localStorage.getItem("userRole") || "Member";
    const userId =
      localStorage.getItem("userId") ||
      (role === "Member" ? "MB001" : role === "Staff" ? "ST001" : "AD001");
    const userEmail = localStorage.getItem("userEmail") || "";

    const baseInfo = {
      userID: userId,
      username: username,
      fullName:
        username ||
        (role === "Member"
          ? "Nguyễn Văn An"
          : role === "Staff"
          ? "Trần Thị Bình"
          : "Lê Văn Cường"),
      email:
        userEmail ||
        (role === "Member"
          ? "nguyenvanan@email.com"
          : role === "Staff"
          ? "tranthibinh@bloodbank.vn"
          : "levancuong@bloodbank.vn"),
      phone:
        role === "Member"
          ? "0912345678"
          : role === "Staff"
          ? "0923456789"
          : "0934567890",
      userIdCard:
        role === "Member"
          ? "079090001234"
          : role === "Staff"
          ? "079085001122"
          : "079080005566",
      dateOfBirth:
        role === "Member"
          ? "1990-05-15"
          : role === "Staff"
          ? "1985-03-20"
          : "1980-12-10",
      role: role,
      avatar: null,
    };

    if (role === "Member") {
      return {
        ...baseInfo,
        address: "123 Đường ABC, Quận 1, TP.HCM",
        // Thông tin hiến máu mẫu (chỉ dùng khi API không hoạt động)
        donorID: "DN001",
        bloodTypeID: "44C1A0F7-92B9-4E1B-A628-03447F5B86D7", // O+ GUID
        bloodType: "O+ (O Rh dương)",
        isAvailable: true,
        lastDonationDate: "2024-02-15",
        nextEligibleDate: "2024-08-15",
        currentMedications: "Không có thuốc đang sử dụng",
        hasDonorProfile: true, // Mock data có donor profile
      };
    }

    return baseInfo;
  };

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("userToken");

    if (!token) {
      navigate("/login");
      return;
    }

    // Fetch user data from API
    fetchUserData();
  }, [navigate]);

  // Override body background color for this page
  useEffect(() => {
    // Set white background for this page
    document.body.style.background = "#ffffff";
    document.body.style.backgroundColor = "#ffffff";

    // Cleanup function to reset background when component unmounts
    return () => {
      document.body.style.background = "";
      document.body.style.backgroundColor = "";
    };
  }, []);

  // Listen for profile data change events (e.g., after blood donation registration)
  useEffect(() => {
    const handleProfileDataChanged = (event) => {
      if (event.detail?.reason === "blood_donation_registration") {
        // Wait a moment for backend to process, then refresh
        setTimeout(() => {
          fetchUserData();
        }, 1000);
      }
    };

    // Add event listener
    window.addEventListener("profileDataChanged", handleProfileDataChanged);

    // Cleanup
    return () => {
      window.removeEventListener(
        "profileDataChanged",
        handleProfileDataChanged
      );
    };
  }, []); // Empty dependency array since we want this to run only once

  // Add error boundary
  if (error) {
    return (
      <div className="profile-error">
        <Title level={4}>Có lỗi xảy ra</Title>
        <p>{error}</p>
        <Space>
          <Button
            type="primary"
            onClick={() => {
              setError(null);
              fetchUserData();
            }}
          >
            Thử lại
          </Button>
          <Button onClick={() => navigate("/")}>Về trang chủ</Button>
        </Space>
      </div>
    );
  }

  const handleEditProfile = () => {
    // Set initial values cho form, đặc biệt là DatePicker
    const formValues = {
      ...userInfo,
      dateOfBirth: userInfo.dateOfBirth ? dayjs(userInfo.dateOfBirth) : null,
      lastDonationDate: userInfo.lastDonationDate
        ? dayjs(userInfo.lastDonationDate)
        : null,
      nextEligibleDate: userInfo.nextEligibleDate
        ? dayjs(userInfo.nextEligibleDate)
        : null,
    };
    form.setFieldsValue(formValues);
    setEditModalVisible(true);
  };

  const handleCancelEdit = () => {
    form.resetFields();
    setEditModalVisible(false);
  };

  const handleSaveProfile = async (values) => {
    try {
      setLoading(true);

      // Convert dayjs object to string for dates
      const processedValues = {
        ...values,
        dateOfBirth: values.dateOfBirth
          ? values.dateOfBirth.format("YYYY-MM-DD")
          : userInfo.dateOfBirth,
        lastDonationDate: values.lastDonationDate
          ? values.lastDonationDate.format("YYYY-MM-DD")
          : userInfo.lastDonationDate,
        nextEligibleDate: values.nextEligibleDate
          ? values.nextEligibleDate.format("YYYY-MM-DD")
          : userInfo.nextEligibleDate,
      };

      // Tính toán nextEligibleDate tự động nếu có lastDonationDate mới (chỉ khi nextEligibleDate không được set thủ công)
      if (
        processedValues.lastDonationDate &&
        userInfo.role === "Member" &&
        !values.nextEligibleDate
      ) {
        const lastDate = dayjs(processedValues.lastDonationDate);
        const nextDate = lastDate.add(12, "week"); // 12 tuần sau lần hiến cuối
        processedValues.nextEligibleDate = nextDate.format("YYYY-MM-DD");
      }

      // Call API to update user basic info
      const updateResult = await UserAPI.updateUser(
        userInfo.userID,
        processedValues
      );

      // Check if update was saved locally for Member
      const isLocalSave = updateResult?.source === "localStorage";

      // Update donor profile if user is Member with donor profile
      if (
        userInfo.role === "Member" &&
        userInfo.hasDonorProfile &&
        userInfo.donorID
      ) {
        try {
          const donorData = {
            donorID: userInfo.donorID,
            userID: userInfo.userID,
            bloodTypeID: userInfo.bloodTypeID,
            isAvailable: userInfo.isAvailable,
            lastDonationDate: processedValues.lastDonationDate,
            nextEligibleDate: processedValues.nextEligibleDate,
            currentMedications:
              processedValues.currentMedications ||
              userInfo.currentMedications ||
              "",
            address: processedValues.address,
          };

          await updateDonorProfile(userInfo.donorID, donorData);
        } catch (donorError) {
          // Ignore donor profile update errors for Member
        }
      }

      const updatedInfo = { ...userInfo, ...processedValues };
      setUserInfo(updatedInfo);
      setEditModalVisible(false);

      // Show success message
      message.success("Cập nhật thông tin thành công!");

      // Refresh data from server (this will also merge localStorage data for Member)
      await fetchUserData();
    } catch (error) {
      console.error("Error updating profile:", error);
      message.error("Có lỗi xảy ra khi cập nhật thông tin!");
    } finally {
      setLoading(false);
    }
  };
  const renderPersonalInfo = () => {
    try {
      return (
        <Card
          className="profile-card"
          title={
            <Space>
              <UserOutlined style={{ color: "#1976D2" }} />
              <span>Thông tin cá nhân</span>
            </Space>
          }
          extra={
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={handleEditProfile}
              className="profile-edit-btn"
            >
              Chỉnh sửa
            </Button>
          }
        >
          <Descriptions column={2} className="profile-descriptions">
            <Descriptions.Item label="Mã người dùng">
              <Space>
                <SafetyCertificateOutlined style={{ color: "#1976D2" }} />
                {userInfo?.userID || "N/A"}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Họ và tên">
              {userInfo?.fullName || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Tên đăng nhập">
              {userInfo?.username || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              <Space>
                <MailOutlined style={{ color: "#1976D2" }} />
                {userInfo?.email || "N/A"}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              <Space>
                <PhoneOutlined style={{ color: "#1976D2" }} />
                {userInfo?.phone || "N/A"}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Căn cước công dân">
              <Space>
                <SafetyCertificateOutlined style={{ color: "#1976D2" }} />
                {userInfo?.userIdCard || "N/A"}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày sinh">
              <Space>
                <CalendarOutlined style={{ color: "#1976D2" }} />
                {userInfo?.dateOfBirth
                  ? dayjs(userInfo.dateOfBirth).format("DD/MM/YYYY")
                  : "N/A"}
              </Space>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      );
    } catch (error) {
      console.error("Error rendering personal info:", error);
      return (
        <Card title="Thông tin cá nhân">
          <p>Có lỗi khi hiển thị thông tin cá nhân</p>
        </Card>
      );
    }
  };

  // Render thông tin gộp header và personal info
  const renderCombinedProfileInfo = () => {
    try {
      return (
        <Card
          className="profile-card combined-profile-card"
          title={
            <Space>
              <UserOutlined style={{ color: "#1976D2" }} />
              <span>Thông tin cá nhân</span>
            </Space>
          }
          extra={
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={handleEditProfile}
              className="profile-edit-btn"
            >
              Chỉnh sửa
            </Button>
          }
        >
          {/* Header Section với Avatar và thông tin cơ bản */}
          <Row
            align="middle"
            gutter={[12, 12]}
            style={{
              marginBottom: "8px",
              paddingBottom: "8px",
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            <Col xs={24} sm={6} style={{ textAlign: "center" }}>
              <Avatar
                size={100}
                icon={<UserOutlined />}
                src={userInfo?.avatar}
                className="profile-avatar"
              />
            </Col>
            <Col xs={24} sm={18}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  width: "100%",
                }}
              >
                <div>
                  <Title level={2} className="profile-header-title">
                    {userInfo?.fullName || "Không có tên"}
                  </Title>
                  <Text type="secondary" className="profile-username">
                    @{userInfo?.username || "unknown"}
                  </Text>
                  <div style={{ marginTop: "4px" }}>
                    <Tag
                      color={
                        userInfo?.role === "Admin"
                          ? "red"
                          : userInfo?.role === "Staff"
                          ? "blue"
                          : "green"
                      }
                      className="profile-role-tag"
                    >
                      {userInfo?.role || "Unknown"}
                    </Tag>
                  </div>
                </div>
              </div>
            </Col>
          </Row>

          {/* Thông tin chi tiết */}
          <Descriptions column={2} className="profile-descriptions">
            <Descriptions.Item label="Mã người dùng">
              <Space>
                <SafetyCertificateOutlined style={{ color: "#1976D2" }} />
                {userInfo?.userID || "N/A"}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Họ và tên">
              {userInfo?.fullName || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Tên đăng nhập">
              {userInfo?.username || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              <Space>
                <MailOutlined style={{ color: "#1976D2" }} />
                {userInfo?.email || "N/A"}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              <Space>
                <PhoneOutlined style={{ color: "#1976D2" }} />
                {userInfo?.phone || "N/A"}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Căn cước công dân">
              <Space>
                <SafetyCertificateOutlined style={{ color: "#1976D2" }} />
                {userInfo?.userIdCard || "N/A"}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày sinh">
              <Space>
                <CalendarOutlined style={{ color: "#1976D2" }} />
                {userInfo?.dateOfBirth
                  ? dayjs(userInfo.dateOfBirth).format("DD/MM/YYYY")
                  : "N/A"}
              </Space>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      );
    } catch (error) {
      console.error("Error rendering combined profile info:", error);
      return (
        <Card title="Thông tin cá nhân">
          <p>Có lỗi khi hiển thị thông tin cá nhân</p>
        </Card>
      );
    }
  };

  const renderMemberSpecificInfo = () => {
    return null;
  };

  const renderStaffAdminInfo = () => {
    if (userInfo.role === "Member") return null;

    // Chỉ hiển thị thông tin cơ bản từ database cho Staff/Admin
    return null;
  };
  if (loading) {
    return (
      <div
        className="profile-loading"
        style={{ padding: "50px", textAlign: "center" }}
      >
        <Spin size="large" />
        <p style={{ marginTop: "16px" }}>Đang tải thông tin...</p>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div
        className="profile-error"
        style={{ padding: "50px", textAlign: "center" }}
      >
        <Title level={4}>Không thể tải thông tin người dùng</Title>
        <Space>
          <Button type="primary" onClick={fetchUserData} loading={loading}>
            Thử lại
          </Button>
          <Button onClick={() => navigate("/")}>Về trang chủ</Button>
        </Space>
      </div>
    );
  }
  return (
    <div className="profile-container">
      <div className="profile-content">
        {/* Combined Profile Info - Header + Personal Info */}
        {renderCombinedProfileInfo()}
        {renderStaffAdminInfo()}
        {renderMemberSpecificInfo()}
        {/* Edit Modal */}{" "}
        <Modal
          title="Chỉnh sửa thông tin cá nhân"
          open={editModalVisible}
          onCancel={handleCancelEdit}
          footer={null}
          width={600}
          style={{ borderRadius: "12px" }}
        >
          <Form form={form} layout="vertical" onFinish={handleSaveProfile}>
            <Row gutter={[16, 0]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Họ và tên"
                  name="fullName"
                  rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: "Vui lòng nhập email!" },
                    { type: "email", message: "Email không hợp lệ!" },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>{" "}
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Số điện thoại"
                  name="phone"
                  rules={[
                    { required: true, message: "Vui lòng nhập số điện thoại!" },
                    {
                      pattern: /^[0-9]{10,11}$/,
                      message: "Số điện thoại phải có 10-11 chữ số!",
                    },
                  ]}
                >
                  <Input placeholder="Nhập số điện thoại" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Căn cước công dân"
                  name="userIdCard"
                  rules={[
                    { required: true, message: "Vui lòng nhập số CCCD!" },
                    {
                      pattern: /^[0-9]{12}$/,
                      message: "CCCD phải có 12 chữ số!",
                    },
                  ]}
                >
                  <Input maxLength={12} />
                </Form.Item>
              </Col>{" "}
              <Col xs={24} sm={12}>
                <Form.Item label="Ngày sinh" name="dateOfBirth">
                  <DatePicker
                    style={{ width: "100%" }}
                    format="DD/MM/YYYY"
                    placeholder="Chọn ngày sinh"
                  />
                </Form.Item>
              </Col>
              {/* Đã ẩn toàn bộ phần "Thông tin hiến máu" trong edit modal theo yêu cầu */}
            </Row>
            <div className="profile-form-actions">
              <Space>
                <Button
                  onClick={handleCancelEdit}
                  icon={<CloseOutlined />}
                  className="profile-cancel-btn"
                >
                  Hủy
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<SaveOutlined />}
                  className="profile-save-btn"
                >
                  Lưu thay đổi
                </Button>
              </Space>
            </div>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default Profile;
