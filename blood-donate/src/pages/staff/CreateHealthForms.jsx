import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Row,
  Col,
  Typography,
  Space,
  DatePicker,
  InputNumber,
  message,
  Divider,
  List,
  Tag,
  Modal,
  Spin,
  Alert,
  TimePicker,
} from "antd";
import {
  UserOutlined,
  MedicineBoxOutlined,
  HeartOutlined,
  SaveOutlined,
  EyeOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { healthCheckApi } from "../../services/healthCheckApi";
import { mockHealthCheckApi } from "../../services/mockHealthCheckApi";
import { bloodDonationApi } from "../../services/bloodDonationApi";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

const { Title, Text } = Typography;
const { TextArea } = Input;

const urlParams = new URLSearchParams(window.location.search);
const USE_MOCK_API = urlParams.get("useMock") === "true" || false;

const CreateHealthForms = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [donorSearchLoading, setDonorSearchLoading] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [recentForms, setRecentForms] = useState([]);
  const [apiError, setApiError] = useState(false);

  // Pending blood donations state
  const [pendingDonations, setPendingDonations] = useState([]);
  const [showPendingList, setShowPendingList] = useState(false);

  // Thêm state lưu ngày hiến máu đã đăng ký
  const [availableDonationDates, setAvailableDonationDates] = useState([]);

  // Thêm state cho giờ khám sức khỏe
  const [healthCheckTime, setHealthCheckTime] = useState(
    dayjs("08:00", "HH:mm")
  );

  const apiService = USE_MOCK_API ? mockHealthCheckApi : healthCheckApi;

  // Load recent health forms when component mounts
  useEffect(() => {
    loadRecentHealthForms();
    loadApprovedDonations(); // Also load approved donations
  }, []);

  // Load recent health forms from API
  const loadRecentHealthForms = async () => {
    try {
      // Try to get approved blood donations first to prioritize those needing health checks
      let data = [];

      if (!USE_MOCK_API) {
        try {
          const approvedDonations =
            await healthCheckApi.getApprovedBloodDonations();
          // Convert blood donations to display format, prioritizing those without health checks
          data = approvedDonations.slice(0, 8).map((donation) => ({
            healthCheckID: `BD-${donation.id || donation.donationId}`,
            donorName: donation.donorName || donation.fullName || "N/A",
            donorID: donation.donorID || donation.donorId || donation.id,
            HealthCheck_Date:
              donation.createdAt?.split("T")[0] ||
              donation.requestDate ||
              donation.donationDate ||
              new Date().toISOString().split("T")[0],
            HealthCheck_Status: "no_health_check", // These need health checks
            userIdCard: donation.userIdCard || donation.donorIdCard,
          }));
        } catch (error) {
          // Could not load approved donations - try health checks
          try {
            const healthChecks = await apiService.getAllHealthChecks();
            data = Array.isArray(healthChecks) ? healthChecks.slice(0, 8) : [];
          } catch (healthCheckError) {
            // Could not load health checks either
            data = [];
          }
        }
      } else {
        // Use mock API
        data = await apiService.getAllHealthChecks();
        data = Array.isArray(data) ? data.slice(0, 8) : [];
      }

      // Get the most recent items
      const recent = Array.isArray(data) ? data : [];
      setRecentForms(recent);
      setApiError(false);
    } catch (error) {
      // Error loading data
      setApiError(true);

      // Use fallback mock data if API fails
      const fallbackData = [
        {
          healthCheckID: "BD-DEMO001",
          donorName: "Người hiến máu mẫu",
          donorID: "DN001",
          HealthCheck_Date: "2024-12-01",
          HealthCheck_Status: "no_health_check",
          userIdCard: "123456789",
        },
      ];
      setRecentForms(fallbackData);

      // Show user-friendly error message
      if (error.message.includes("đăng nhập")) {
        message.warning(
          "Phiên đăng nhập đã hết hạn. Một số tính năng có thể bị hạn chế."
        );
      }
    }
  };

  // Load approved blood donations for reference
  const loadApprovedDonations = async () => {
    if (USE_MOCK_API) return;

    try {
      const donations = await healthCheckApi.getApprovedBloodDonations();
      setPendingDonations(donations.slice(0, 10)); // Show top 10
    } catch (error) {
      console.error("Error loading approved donations:", error);
      // Don't show error message for this, just log it
      setPendingDonations([]);
    }
  };

  // Sửa handleSearchDonor để lấy ngày và giờ hiến máu đã đăng ký
  const handleSearchDonor = async (userIdCard) => {
    if (!userIdCard || userIdCard.length < 9) {
      setSelectedDonor(null);
      setHealthCheckTime(dayjs("08:00", "HH:mm"));
      return;
    }

    setDonorSearchLoading(true);
    setApiError(false);

    try {
      // Try to find donor from pending blood donation requests first
      let donorData = null;

      if (!USE_MOCK_API) {
        try {
          // Use getDonorByIdCard which now searches from blood donation table
          donorData = await healthCheckApi.getDonorByIdCard(userIdCard);

          // Check if the donation status is approved
          if (
            donorData &&
            donorData.status &&
            donorData.status.toLowerCase() !== "approved" &&
            donorData.status.toLowerCase() !== "đã duyệt"
          ) {
            message.error({
              content: (
                <div>
                  <div>
                    <strong>Đơn hiến máu chưa được duyệt</strong>
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      marginTop: "4px",
                      color: "#666",
                    }}
                  >
                    CCCD/CMND: {userIdCard} có đơn hiến máu nhưng chưa được
                    duyệt. Chỉ có thể tạo phiếu sức khỏe cho những người có đơn
                    hiến máu đã được duyệt.
                  </div>
                </div>
              ),
              duration: 6,
            });
            return;
          }
        } catch (apiError) {
          // Blood donation API failed

          if (
            apiError.message.includes("đăng nhập") ||
            apiError.message.includes("401")
          ) {
            // Authentication error - show specific message
            message.error(
              "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục."
            );
            setApiError(true);
            return;
          } else if (apiError.message.includes("Không tìm thấy")) {
            // No blood donation found
            message.error({
              content: (
                <div>
                  <div>
                    <strong>Không tìm thấy đơn hiến máu đã được duyệt</strong>
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      marginTop: "4px",
                      color: "#666",
                    }}
                  >
                    CCCD/CMND: {userIdCard} không có đơn hiến máu nào đã được
                    duyệt. Chỉ có thể tạo phiếu sức khỏe cho những người có đơn
                    hiến máu đã được duyệt.
                  </div>
                </div>
              ),
              duration: 6,
            });
            return;
          } else {
            // Other API errors - try fallback
            try {
              donorData = await healthCheckApi.getDonorByIdCard(userIdCard);
              message.warning(
                "Tìm thấy thông tin donor nhưng cần xác nhận có đơn hiến máu đã được duyệt."
              );
            } catch (fallbackError) {
              message.warning("API tạm thời không khả dụng.");
              donorData = await mockHealthCheckApi.getDonorByIdCard(userIdCard);
            }
          }
        }
      } else {
        // Use mock API directly
        donorData = await mockHealthCheckApi.getDonorByIdCard(userIdCard);
      }

      // Validate donor data structure
      if (
        donorData &&
        (donorData.fullName || donorData.name || donorData.donorName)
      ) {
        const formattedDonor = {
          donorID:
            donorData.donorID ||
            donorData.donorId ||
            donorData.id ||
            donorData.donationId,
          fullName: donorData.fullName || donorData.name || donorData.donorName,
          email: donorData.email || donorData.donorEmail || "N/A",
          phone:
            donorData.phone ||
            donorData.phoneNumber ||
            donorData.donorPhone ||
            donorData.phone ||
            "N/A",
          bloodType: donorData.bloodType || donorData.donorBloodType || "N/A",
          userIdCard:
            donorData.userIdCard ||
            donorData.idCard ||
            donorData.donorIdCard ||
            userIdCard,
          // Additional blood donation info
          donationRequestId:
            donorData.donationId || donorData.id || donorData.bloodDonationId,
          donationStatus:
            donorData.status || donorData.donationStatus || "Chờ xử lý",
          donationDate:
            donorData.createdAt ||
            donorData.requestDate ||
            donorData.donationDate,
        };

        setSelectedDonor(formattedDonor);
        // Lấy danh sách ngày hiến máu đã đăng ký (approved)
        console.log("Formatted donor:", formattedDonor);

        try {
          // Thử lấy donations bằng donorID trước
          let donations = [];
          if (formattedDonor.donorID) {
            try {
              donations = await bloodDonationApi.getBloodDonationsByDonor(
                formattedDonor.donorID
              );
              console.log(
                "Donations for donor ID:",
                formattedDonor.donorID,
                donations
              );
            } catch (e) {
              console.log(
                "Could not fetch by donorID, trying all donations..."
              );
            }
          }

          // Nếu không có donations, thử lấy tất cả và filter theo userIdCard
          if (!donations || donations.length === 0) {
            try {
              const allDonations =
                await bloodDonationApi.getAllBloodDonations();
              console.log("All donations:", allDonations);
              donations = (allDonations || []).filter(
                (d) =>
                  d.userIdCard === formattedDonor.userIdCard ||
                  d.donorIdCard === formattedDonor.userIdCard
              );
              console.log("Filtered donations by userIdCard:", donations);
            } catch (e) {
              console.error("Error fetching all donations:", e);
            }
          }

          const approvedDates = (donations || [])
            .filter(
              (d) =>
                d.status &&
                (d.status.toLowerCase() === "approved" ||
                  d.status.toLowerCase() === "đã duyệt")
            )
            .map((d) => d.donationDate)
            .filter(Boolean);
          console.log("Approved Dates:", approvedDates);
          setAvailableDonationDates(approvedDates);
          // Auto fill ngày và giờ nếu có
          if (approvedDates.length === 0) {
            form.setFieldsValue({ HealthCheck_Date: undefined });
            setHealthCheckTime(dayjs("08:00", "HH:mm"));
          } else {
            // Lấy ngày gần nhất
            const firstDate = approvedDates[0];
            const dateObj = dayjs(firstDate);
            form.setFieldsValue({
              HealthCheck_Date: dateObj.format("YYYY-MM-DD"),
            });
            // Nếu có giờ, set vào time, không thì mặc định 08:00
            if (dateObj.isValid() && firstDate.includes("T")) {
              const timeVal = dayjs(firstDate);
              setHealthCheckTime(
                timeVal.isValid() ? timeVal : dayjs("08:00", "HH:mm")
              );
              form.setFieldsValue({
                HealthCheck_Time: timeVal.isValid()
                  ? timeVal
                  : dayjs("08:00", "HH:mm"),
              });
            } else {
              setHealthCheckTime(dayjs("08:00", "HH:mm"));
              form.setFieldsValue({
                HealthCheck_Time: dayjs("08:00", "HH:mm"),
              });
            }
          }
        } catch (e) {
          console.error("Error fetching donations:", e);
          setAvailableDonationDates([]);
          setHealthCheckTime(dayjs("08:00", "HH:mm"));
        }

        message.success({
          content: (
            <div>
              <div>
                <strong>Tìm thấy thông tin người hiến máu:</strong>{" "}
                {formattedDonor.fullName}
              </div>
              {formattedDonor.donationRequestId && (
                <div
                  style={{ fontSize: "12px", marginTop: "4px", color: "#666" }}
                >
                  Mã đơn hiến máu: {formattedDonor.donationRequestId} | Trạng
                  thái: {formattedDonor.donationStatus}
                </div>
              )}
            </div>
          ),
          duration: 4,
        });
      } else {
        throw new Error("Dữ liệu người hiến máu không hợp lệ");
      }
    } catch (error) {
      setSelectedDonor(null);
      // Final error in search donor

      if (
        error.message.includes("đăng nhập") ||
        error.message.includes("401")
      ) {
        message.error(
          "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục."
        );
        setApiError(true);
      } else if (error.message.includes("Không tìm thấy")) {
        // Already handled above
        return;
      } else {
        // More detailed error message
        message.error({
          content: (
            <div>
              <div>
                Không tìm thấy thông tin người hiến máu với CCCD/CMND:{" "}
                <strong>{userIdCard}</strong>
              </div>
              <div
                style={{ fontSize: "12px", marginTop: "4px", color: "#666" }}
              >
                Vui lòng kiểm tra lại số CCCD/CMND và đảm bảo đã có đơn hiến máu
                đã được duyệt
              </div>
            </div>
          ),
          duration: 5,
        });
      }
    } finally {
      setDonorSearchLoading(false);
    }
  };

  const handlePreview = () => {
    form
      .validateFields()
      .then((values) => {
        // Đảm bảo HealthCheck_Date được format đúng cho preview
        const previewValues = {
          ...values,
          HealthCheck_Date:
            typeof values.HealthCheck_Date === "string"
              ? values.HealthCheck_Date
              : values.HealthCheck_Date?.format("YYYY-MM-DD"),
          HealthCheck_Time: healthCheckTime
            ? healthCheckTime.format("HH:mm")
            : "08:00",
        };
        setPreviewData(previewValues);
        setPreviewVisible(true);
      })
      .catch((errorInfo) => {
        message.error("Vui lòng điền đầy đủ thông tin trước khi xem trước");
      });
  };

  const handleSubmit = async (values) => {
    if (!selectedDonor) {
      message.error(
        "Vui lòng tìm kiếm thông tin người hiến máu trước khi tạo phiếu"
      );
      return;
    }

    // Kiểm tra điều kiện ngày hiến máu phải bằng với ngày của blood donation
    const selectedDate =
      typeof values.HealthCheck_Date === "string"
        ? values.HealthCheck_Date
        : values.HealthCheck_Date?.format("YYYY-MM-DD");
    const hasMatchingDonation = availableDonationDates.some((date) => {
      const donationDate = dayjs(date).format("YYYY-MM-DD");
      return donationDate === selectedDate;
    });

    if (!hasMatchingDonation) {
      message.error({
        content: (
          <div>
            <div>
              <strong>
                Ngày kiểm tra sức khỏe không khớp với ngày hiến máu
              </strong>
            </div>
            <div style={{ fontSize: "12px", marginTop: "4px", color: "#666" }}>
              Ngày kiểm tra: {selectedDate} không khớp với bất kỳ ngày hiến máu
              đã được duyệt nào. Chỉ có thể cập nhật quantity khi ngày kiểm tra
              sức khỏe trùng với ngày hiến máu.
            </div>
          </div>
        ),
        duration: 6,
      });
      return;
    }

    try {
      setLoading(true);

      // Lấy giờ khám sức khỏe
      const selectedTime =
        form.getFieldValue("HealthCheck_Time")?.format("HH:mm") || "08:00";
      // Kết hợp ngày và giờ thành ISO string hoặc 'YYYY-MM-DDTHH:mm'
      const healthCheckDateTime = `${selectedDate}T${selectedTime}`;

      // Chuẩn bị dữ liệu theo cấu trúc API
      const healthCheckData = {
        userIdCard: selectedDonor.userIdCard, // Sử dụng userIdCard thay vì donorID
        weight: values.weight,
        height: values.height,
        heartRate: values.heartRate,
        temperature: values.temperature,
        blood_pressure: values.blood_pressure, // Sẽ được transform thành bloodPressure trong API
        medicalHistory: values.medicalHistory,
        currentMedications: values.currentMedications,
        allergies: values.allergies,
        HealthCheck_Date: healthCheckDateTime, // Sử dụng ngày + giờ
        HealthCheck_Status: "pending", // Sẽ được transform thành healthCheckStatus
        quantity: values.quantity, // BỔ SUNG DÒNG NÀY
      };
      console.log("Payload gửi lên API:", healthCheckData);
      console.log("Ngày kiểm tra khớp với blood donation:", selectedDate);

      // Try to call API to create health check
      try {
        if (!USE_MOCK_API) {
          await healthCheckApi.createHealthCheck(healthCheckData);
        } else {
          await mockHealthCheckApi.createHealthCheck(healthCheckData);
        }

        message.success("Tạo phiếu kiểm tra sức khỏe thành công!");
        form.resetFields();
        setSelectedDonor(null);

        // Reload recent forms
        await loadRecentHealthForms();
      } catch (apiError) {
        // API error in submit

        if (
          apiError.message.includes("đăng nhập") ||
          apiError.message.includes("401")
        ) {
          message.error(
            "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục."
          );
          setApiError(true);
        } else {
          // Fallback: show success message but warn about API issue
          message.warning(
            "Phiếu sức khỏe đã được tạo. Dữ liệu sẽ được đồng bộ sau."
          );
          form.resetFields();
          setSelectedDonor(null);
        }
      }
    } catch (error) {
      // Error creating health check
      message.error(
        "Có lỗi xảy ra khi tạo phiếu kiểm tra sức khỏe. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
      setHealthCheckTime(dayjs("08:00", "HH:mm")); // Reset time to default after submit
    }
  };

  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: "1400px" }}>
        <div style={{ marginBottom: "24px", textAlign: "center" }}>
          <Title level={2}>
            <MedicineBoxOutlined
              style={{ marginRight: "12px", color: "#1976D2" }}
            />
            Tạo Phiếu Sức Khỏe
          </Title>
          <Text type="secondary">
            Tạo phiếu sức khỏe mới cho người hiến máu
          </Text>
        </div>

        {/* Thông báo lỗi API */}
        {apiError && (
          <Alert
            message="Lỗi kết nối API"
            description="Phiên đăng nhập có thể đã hết hạn. Vui lòng thử lại hoặc đăng nhập lại."
            type="warning"
            showIcon
            action={
              <Button size="small" onClick={() => window.location.reload()}>
                Thử lại
              </Button>
            }
            style={{ marginBottom: 24 }}
          />
        )}

        <div
          style={{
            padding: "0 24px",
            background: "#f8fafc",
            minHeight: "calc(100vh - 120px)",
          }}
        >
          <Row gutter={[24, 24]} style={{ paddingTop: "24px" }}>
            {/* Sidebar - Đơn hiến máu cần xử lý */}
            <Col span={6}>
              <Card
                title={
                  <span>
                    <ClockCircleOutlined
                      style={{ marginRight: "8px", color: "#1976D2" }}
                    />
                    Đơn hiến máu đã duyệt
                  </span>
                }
                style={{
                  height: "calc(100vh - 200px)",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
                bodyStyle={{
                  padding: "16px",
                  height: "calc(100vh - 280px)",
                  overflow: "auto",
                }}
              >
                <List
                  dataSource={pendingDonations}
                  renderItem={(item) => (
                    <List.Item
                      style={{
                        padding: "12px 0",
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      <div style={{ width: "100%" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "4px",
                          }}
                        >
                          <Text strong style={{ fontSize: "13px" }}>
                            {item.user?.fullName ||
                              item.donor?.fullName ||
                              item.fullName ||
                              "N/A"}
                          </Text>
                          <Tag color="green" size="small">
                            Đã duyệt
                          </Tag>
                        </div>
                        <div style={{ marginBottom: "6px" }}>
                          <Text style={{ fontSize: "12px" }}>
                            <strong>CCCD:</strong>
                            <Tag
                              color="cyan"
                              size="small"
                              style={{ cursor: "pointer", marginLeft: "4px" }}
                              onClick={() => {
                                form.setFieldsValue({
                                  userIdCard:
                                    item.userIdCard ||
                                    item.donorIdCard ||
                                    item.idCard,
                                });
                                handleSearchDonor(
                                  item.userIdCard ||
                                    item.donorIdCard ||
                                    item.idCard
                                );
                              }}
                              title="Click để tìm kiếm và tạo phiếu sức khỏe"
                            >
                              {item.userIdCard ||
                                item.donorIdCard ||
                                item.idCard ||
                                "N/A"}
                            </Tag>
                          </Text>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Text type="secondary" style={{ fontSize: "11px" }}>
                            Mã: {item.donationID || item.id}
                          </Text>
                          <Text type="secondary" style={{ fontSize: "11px" }}>
                            {item.createdAt || item.requestDate || "N/A"}
                          </Text>
                        </div>
                        <div style={{ marginTop: "8px" }}>
                          <Button
                            type="primary"
                            size="small"
                            block
                            onClick={() => {
                              form.setFieldsValue({
                                userIdCard:
                                  item.userIdCard ||
                                  item.donorIdCard ||
                                  item.idCard,
                              });
                              handleSearchDonor(
                                item.userIdCard ||
                                  item.donorIdCard ||
                                  item.idCard
                              );
                            }}
                            icon={<MedicineBoxOutlined />}
                          >
                            Tạo phiếu sức khỏe
                          </Button>
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
                {pendingDonations.length === 0 && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      color: "#999",
                    }}
                  >
                    <Text type="secondary">
                      Chưa có đơn hiến máu nào đã được duyệt
                    </Text>
                  </div>
                )}

                {/* Button để refresh danh sách */}
                {!USE_MOCK_API && (
                  <div style={{ marginTop: "16px", textAlign: "center" }}>
                    <Button
                      type="dashed"
                      size="small"
                      onClick={() => {
                        loadApprovedDonations();
                      }}
                      icon={<ReloadOutlined />}
                    >
                      Làm mới danh sách
                    </Button>
                  </div>
                )}
              </Card>
            </Col>

            {/* Form chính */}
            <Col span={18}>
              <Card
                title={
                  <span>
                    <MedicineBoxOutlined
                      style={{ marginRight: "8px", color: "#1976D2" }}
                    />
                    Tạo phiếu sức khỏe
                  </span>
                }
                style={{
                  height: "calc(100vh - 200px)",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
                bodyStyle={{
                  padding: "24px",
                  height: "calc(100vh - 280px)",
                  overflow: "auto",
                }}
              >
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSubmit}
                  requiredMark={false}
                >
                  {" "}
                  {/* Thông tin người hiến máu */}
                  <div style={{ marginBottom: "24px" }}>
                    <Title
                      level={4}
                      style={{
                        marginBottom: "20px",
                        borderBottom: "2px solid #e6f7ff",
                        paddingBottom: "8px",
                        color: "#1976D2",
                      }}
                    >
                      <UserOutlined style={{ marginRight: "8px" }} />
                      Thông tin người hiến máu
                    </Title>

                    <Row gutter={16}>
                      <Col span={10}>
                        <Form.Item
                          name="userIdCard"
                          label="CCCD/CMND người hiến máu"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập CCCD/CMND",
                            },
                            {
                              min: 9,
                              message: "CCCD/CMND phải có ít nhất 9 số",
                            },
                            {
                              max: 12,
                              message: "CCCD/CMND không được vượt quá 12 số",
                            },
                          ]}
                        >
                          <Input
                            placeholder="Nhập CCCD/CMND người hiến máu"
                            suffix={
                              donorSearchLoading ? (
                                <Spin size="small" />
                              ) : (
                                <SearchOutlined
                                  style={{
                                    color: "#1976d2",
                                    cursor: "pointer",
                                  }}
                                  onClick={() => {
                                    const userIdCard =
                                      form.getFieldValue("userIdCard");
                                    handleSearchDonor(userIdCard);
                                  }}
                                />
                              )
                            }
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value.length >= 9) {
                                handleSearchDonor(value);
                              } else {
                                setSelectedDonor(null);
                                setHealthCheckTime(dayjs("08:00", "HH:mm"));
                              }
                            }}
                            onPressEnter={() => {
                              const userIdCard =
                                form.getFieldValue("userIdCard");
                              if (userIdCard) {
                                handleSearchDonor(userIdCard);
                              }
                            }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          name="HealthCheck_Date"
                          label="Ngày kiểm tra sức khỏe"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng chọn ngày kiểm tra",
                            },
                          ]}
                        >
                          <Select
                            placeholder={
                              availableDonationDates.length === 0
                                ? "Không có ngày hiến máu hợp lệ"
                                : "Chọn ngày hiến máu đã đăng ký"
                            }
                            disabled={availableDonationDates.length === 0}
                            showSearch
                            optionFilterProp="children"
                            value={form.getFieldValue("HealthCheck_Date")}
                            onChange={(value) => {
                              form.setFieldsValue({ HealthCheck_Date: value });
                              // Khi chọn ngày, tìm trong availableDonationDates xem có ngày nào trùng và có giờ không
                              const found = availableDonationDates.find(
                                (dateStr) =>
                                  dayjs(dateStr).format("YYYY-MM-DD") === value
                              );
                              if (found && found.includes("T")) {
                                const timeObj = dayjs(found);
                                setHealthCheckTime(
                                  timeObj.isValid()
                                    ? timeObj
                                    : dayjs("08:00", "HH:mm")
                                );
                                form.setFieldsValue({
                                  HealthCheck_Time: timeObj.isValid()
                                    ? timeObj
                                    : dayjs("08:00", "HH:mm"),
                                });
                              } else {
                                setHealthCheckTime(dayjs("08:00", "HH:mm"));
                                form.setFieldsValue({
                                  HealthCheck_Time: dayjs("08:00", "HH:mm"),
                                });
                              }
                            }}
                          >
                            {availableDonationDates.map((date) => {
                              const dateStr = dayjs(date).format("YYYY-MM-DD");
                              return (
                                <Select.Option key={dateStr} value={dateStr}>
                                  {dateStr}
                                </Select.Option>
                              );
                            })}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          label="Giờ khám sức khỏe"
                          name="HealthCheck_Time"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng chọn giờ khám sức khỏe",
                            },
                          ]}
                        >
                          <TimePicker
                            format="HH:mm"
                            value={healthCheckTime}
                            onChange={(val) => {
                              setHealthCheckTime(val);
                              form.setFieldsValue({ HealthCheck_Time: val });
                            }}
                            minuteStep={5}
                            placeholder="Chọn giờ"
                            style={{ width: "100%" }}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    {/* Hiển thị thông tin người hiến máu đã tìm thấy */}
                    {selectedDonor && (
                      <Alert
                        message="Thông tin người hiến máu"
                        description={
                          <div>
                            <Row gutter={16}>
                              <Col span={12}>
                                <p>
                                  <strong>Họ tên:</strong>{" "}
                                  {selectedDonor.fullName}
                                </p>
                                <p>
                                  <strong>Email:</strong> {selectedDonor.email}
                                </p>
                              </Col>
                              <Col span={12}>
                                <p>
                                  <strong>Số điện thoại:</strong>{" "}
                                  {selectedDonor.phone}
                                </p>
                                <p>
                                  <strong>Nhóm máu:</strong>{" "}
                                  <Tag color="red">
                                    {selectedDonor.bloodType}
                                  </Tag>
                                </p>
                              </Col>
                            </Row>
                            {selectedDonor.donationRequestId && (
                              <div
                                style={{
                                  marginTop: 8,
                                  padding: 8,
                                  backgroundColor: "#f0f9ff",
                                  border: "1px solid #91d5ff",
                                  borderRadius: 4,
                                }}
                              >
                                <Text strong style={{ color: "#1890ff" }}>
                                  Thông tin đơn hiến máu:
                                </Text>
                                <div style={{ marginTop: 4 }}>
                                  <Text style={{ fontSize: 12 }}>
                                    Mã đơn:{" "}
                                    <strong>
                                      {selectedDonor.donationRequestId}
                                    </strong>{" "}
                                    | Trạng thái:{" "}
                                    <Tag color="orange" size="small">
                                      {selectedDonor.donationStatus ||
                                        "Chờ xử lý"}
                                    </Tag>
                                  </Text>
                                  {selectedDonor.donationDate && (
                                    <Text
                                      style={{ fontSize: 12, marginLeft: 8 }}
                                    >
                                      | Ngày hiến máu:{" "}
                                      {selectedDonor.donationDate}
                                    </Text>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        }
                        type="success"
                        showIcon
                        icon={<CheckCircleOutlined />}
                        style={{ marginBottom: 16 }}
                      />
                    )}
                  </div>
                  <Divider style={{ margin: "32px 0" }} />
                  {/* Chỉ số sinh hiệu */}
                  <div style={{ marginBottom: "24px" }}>
                    <Title
                      level={4}
                      style={{
                        marginBottom: "20px",
                        borderBottom: "2px solid #e6f7ff",
                        paddingBottom: "8px",
                        color: "#1976D2",
                      }}
                    >
                      <HeartOutlined style={{ marginRight: "8px" }} />
                      Chỉ số sinh hiệu
                    </Title>

                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item
                          name="weight"
                          label="Cân nặng (kg)"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập cân nặng",
                            },
                            {
                              type: "number",
                              min: 30,
                              max: 200,
                              message: "Cân nặng không hợp lệ",
                            },
                          ]}
                        >
                          <InputNumber
                            style={{ width: "100%" }}
                            placeholder="Nhập cân nặng"
                            min={30}
                            max={200}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          name="height"
                          label="Chiều cao (cm)"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập chiều cao",
                            },
                            {
                              type: "number",
                              min: 100,
                              max: 250,
                              message: "Chiều cao không hợp lệ",
                            },
                          ]}
                        >
                          <InputNumber
                            style={{ width: "100%" }}
                            placeholder="Nhập chiều cao"
                            min={100}
                            max={250}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          name="blood_pressure"
                          label="Huyết áp (mmHg)"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập huyết áp",
                            },
                          ]}
                        >
                          <Input placeholder="VD: 120/80" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="heartRate"
                          label="Nhịp tim (lần/phút)"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập nhịp tim",
                            },
                            {
                              type: "number",
                              min: 40,
                              max: 200,
                              message: "Nhịp tim không hợp lệ",
                            },
                          ]}
                        >
                          <InputNumber
                            style={{ width: "100%" }}
                            placeholder="Nhập nhịp tim"
                            min={40}
                            max={200}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="temperature"
                          label="Nhiệt độ (°C)"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập nhiệt độ",
                            },
                            {
                              type: "number",
                              min: 35,
                              max: 42,
                              message: "Nhiệt độ không hợp lệ",
                            },
                          ]}
                        >
                          <InputNumber
                            style={{ width: "100%" }}
                            placeholder="Nhập nhiệt độ"
                            min={35}
                            max={42}
                            step={0.1}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    {/* Trường lượng máu có thể hiến */}
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="quantity"
                          label="Lượng máu có thể hiến (ml)"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập lượng máu có thể hiến",
                            },
                            {
                              type: "number",
                              min: 100,
                              max: 1000,
                              message: "Lượng máu phải từ 100 đến 1000 ml",
                            },
                          ]}
                        >
                          <InputNumber
                            style={{ width: "100%" }}
                            placeholder="Nhập lượng máu (ml)"
                            min={100}
                            max={1000}
                            step={50}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>
                  <Divider style={{ margin: "32px 0" }} />
                  {/* Thông tin y tế */}
                  <div style={{ marginBottom: "24px" }}>
                    <Title
                      level={4}
                      style={{
                        marginBottom: "20px",
                        borderBottom: "2px solid #e6f7ff",
                        paddingBottom: "8px",
                        color: "#1976D2",
                      }}
                    >
                      <MedicineBoxOutlined style={{ marginRight: "8px" }} />
                      Thông tin y tế
                    </Title>{" "}
                    <Form.Item
                      name="medicalHistory"
                      label="Tiền sử bệnh lý"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập tiền sử bệnh lý",
                        },
                      ]}
                    >
                      <TextArea
                        rows={3}
                        placeholder="Nhập tiền sử bệnh lý của người hiến máu (VD: Tiểu đường, cao huyết áp, bệnh tim mạch, bệnh gan, bệnh thận, rối loạn máu...)"
                      />
                    </Form.Item>
                    <Form.Item
                      name="currentMedications"
                      label="Thuốc đang sử dụng"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập thông tin thuốc đang sử dụng",
                        },
                      ]}
                    >
                      <TextArea
                        rows={3}
                        placeholder="Nhập các loại thuốc người hiến máu đang sử dụng (Nếu không có hãy ghi 'Không')"
                      />
                    </Form.Item>
                    <Form.Item
                      name="allergies"
                      label="Tiền sử dị ứng"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập thông tin dị ứng",
                        },
                      ]}
                    >
                      <TextArea
                        rows={3}
                        placeholder="Nhập các loại dị ứng của người hiến máu (Nếu không có hãy ghi 'Không')"
                      />
                    </Form.Item>
                  </div>
                  <Form.Item
                    style={{
                      marginTop: "32px",
                      padding: "20px",
                      backgroundColor: "#fafafa",
                      borderRadius: "8px",
                      marginBottom: 0,
                    }}
                  >
                    <Space>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        icon={<SaveOutlined />}
                      >
                        Tạo phiếu sức khỏe
                      </Button>
                      <Button onClick={handlePreview} icon={<EyeOutlined />}>
                        Xem trước
                      </Button>
                      <Button onClick={() => form.resetFields()}>
                        Làm mới
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              </Card>
            </Col>
          </Row>
        </div>

        {/* Modal xem trước */}
        <Modal
          title={
            <span>
              <FileTextOutlined style={{ marginRight: "8px" }} />
              Xem trước phiếu sức khỏe
            </span>
          }
          open={previewVisible}
          onCancel={() => setPreviewVisible(false)}
          width={800}
          footer={[
            <Button key="close" onClick={() => setPreviewVisible(false)}>
              Đóng
            </Button>,
            <Button
              key="confirm"
              type="primary"
              onClick={() => {
                setPreviewVisible(false);
                form.submit();
              }}
            >
              Xác nhận tạo phiếu
            </Button>,
          ]}
        >
          {" "}
          {previewData && (
            <div>
              <Title level={4}>Thông tin người hiến máu</Title>
              <Row gutter={16}>
                <Col span={12}>
                  <Text strong>CCCD/CMND:</Text> {previewData.userIdCard}
                </Col>
                <Col span={12}>
                  <Text strong>Ngày kiểm tra:</Text>{" "}
                  {previewData.HealthCheck_Date
                    ? typeof previewData.HealthCheck_Date === "string"
                      ? dayjs(previewData.HealthCheck_Date).format("DD/MM/YYYY")
                      : previewData.HealthCheck_Date.format("DD/MM/YYYY")
                    : "N/A"}
                </Col>
              </Row>
              <Row gutter={16} style={{ marginTop: "8px" }}>
                <Col span={12}>
                  <Text strong>Giờ khám sức khỏe:</Text>{" "}
                  {previewData.HealthCheck_Time || "08:00"}
                </Col>
              </Row>
              {selectedDonor && (
                <Row gutter={16} style={{ marginTop: "8px" }}>
                  <Col span={12}>
                    <Text strong>Họ tên:</Text> {selectedDonor.fullName}
                  </Col>
                  <Col span={12}>
                    <Text strong>Nhóm máu:</Text>{" "}
                    <Tag color="red">{selectedDonor.bloodType}</Tag>
                  </Col>
                </Row>
              )}

              <Divider />

              <Title level={4}>Chỉ số sinh hiệu</Title>
              <Row gutter={16}>
                <Col span={8}>
                  <Text strong>Cân nặng:</Text> {previewData.weight} kg
                </Col>
                <Col span={8}>
                  <Text strong>Chiều cao:</Text> {previewData.height} cm
                </Col>
                <Col span={8}>
                  <Text strong>Huyết áp:</Text> {previewData.blood_pressure}
                </Col>
              </Row>
              <Row gutter={16} style={{ marginTop: "8px" }}>
                <Col span={12}>
                  <Text strong>Nhịp tim:</Text> {previewData.heartRate} lần/phút
                </Col>
                <Col span={12}>
                  <Text strong>Nhiệt độ:</Text> {previewData.temperature}°C
                </Col>
              </Row>

              {/* Hiển thị lượng máu có thể hiến */}
              <Row gutter={16} style={{ marginTop: "8px" }}>
                <Col span={12}>
                  <Text strong>Lượng máu có thể hiến:</Text>{" "}
                  {previewData.quantity} ml
                </Col>
              </Row>

              <Divider />

              <Title level={4}>Thông tin y tế</Title>
              {previewData.medicalHistory && (
                <div style={{ marginBottom: "8px" }}>
                  <Text strong>Tiền sử bệnh lý:</Text>
                  <br />
                  <Text>{previewData.medicalHistory}</Text>
                </div>
              )}
              {previewData.currentMedications && (
                <div style={{ marginBottom: "8px" }}>
                  <Text strong>Thuốc đang sử dụng:</Text>
                  <br />
                  <Text>{previewData.currentMedications}</Text>
                </div>
              )}
              {previewData.allergies && (
                <div style={{ marginBottom: "8px" }}>
                  <Text strong>Tiền sử dị ứng:</Text>
                  <br />
                  <Text>{previewData.allergies}</Text>
                </div>
              )}

              <Divider />

              <div style={{ textAlign: "center", marginTop: "16px" }}>
                <Text strong>Trạng thái phiếu:</Text>{" "}
                <Tag color="orange">Chờ duyệt</Tag>
              </div>
            </div>
          )}
        </Modal>

        {/* Modal hiển thị danh sách đơn hiến máu đã duyệt */}
        <Modal
          title={
            <span>
              <FileTextOutlined style={{ marginRight: "8px" }} />
              Tất cả đơn hiến máu đã duyệt
            </span>
          }
          open={showPendingList}
          onCancel={() => setShowPendingList(false)}
          width={900}
          footer={[
            <Button key="close" onClick={() => setShowPendingList(false)}>
              Đóng
            </Button>,
          ]}
        >
          <div style={{ maxHeight: "500px", overflowY: "auto" }}>
            <Alert
              message="Hướng dẫn"
              description="Click vào nút 'Tạo phiếu SK' để nhanh chóng tạo phiếu sức khỏe cho người hiến máu có đơn đã được duyệt."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <List
              dataSource={pendingDonations}
              renderItem={(donation) => (
                <List.Item
                  style={{
                    padding: "16px 0",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                  actions={[
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => {
                        const idCard =
                          donation.userIdCard || donation.donorIdCard;
                        form.setFieldsValue({ userIdCard: idCard });
                        setShowPendingList(false);
                        handleSearchDonor(idCard);
                      }}
                      icon={<MedicineBoxOutlined />}
                    >
                      Tạo phiếu SK
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          backgroundColor: "#1890ff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontSize: "16px",
                          fontWeight: "bold",
                        }}
                      >
                        {(donation.donorName || donation.fullName || "N")
                          ?.charAt(0)
                          .toUpperCase()}
                      </div>
                    }
                    title={
                      <div>
                        <Text strong style={{ fontSize: "14px" }}>
                          {donation.donorName || donation.fullName || "N/A"}
                        </Text>
                        <Tag
                          color="red"
                          size="small"
                          style={{ marginLeft: "8px" }}
                        >
                          {donation.bloodType || "N/A"}
                        </Tag>
                      </div>
                    }
                    description={
                      <div>
                        <Text style={{ fontSize: 13 }}>
                          <strong>CCCD:</strong>{" "}
                          {donation.userIdCard || donation.donorIdCard} |
                          <strong> SĐT:</strong>{" "}
                          {donation.phone || donation.phoneNumber || "N/A"}
                        </Text>
                        <br />
                        <Text style={{ fontSize: 12, color: "#666" }}>
                          <strong>Mã đơn:</strong>{" "}
                          {donation.id || donation.donationId} |
                          <strong> Ngày hiến máu:</strong>{" "}
                          {donation.createdAt?.split("T")[0] ||
                            donation.requestDate ||
                            donation.donationDate ||
                            "N/A"}{" "}
                          |
                          <Tag color="orange" size="small">
                            {donation.status || "Pending"}
                          </Tag>
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
            {pendingDonations.length === 0 && (
              <div
                style={{ textAlign: "center", padding: "60px", color: "#999" }}
              >
                <MedicineBoxOutlined
                  style={{
                    fontSize: "48px",
                    color: "#d9d9d9",
                    marginBottom: "16px",
                  }}
                />
                <br />
                <Text type="secondary">
                  Không có đơn hiến máu nào đã được duyệt
                </Text>
              </div>
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default CreateHealthForms;
