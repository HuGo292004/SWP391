// Import các thư viện React và hooks cần thiết
import React, { useState, useEffect } from "react";

// Import các component từ Ant Design
import {
  Card, // Component card container
  Steps, // Component hiển thị các bước
  Typography, // Component typography
  Table, // Component bảng dữ liệu
  Tag, // Component tag trạng thái
  Empty, // Component hiển thị khi không có dữ liệu
  Spin, // Component loading spinner
  Alert, // Component thông báo
  Row, // Component hàng grid
  Col, // Component cột grid
  Avatar, // Component avatar
  Statistic, // Component thống kê
  Divider, // Component phân cách
  List, // Component danh sách
  Button, // Component nút bấm
  message, // Service thông báo
  Modal, // Component modal
  Input, // Component input
} from "antd";

// Import các icon từ Ant Design
import {
  FileTextOutlined, // Icon file text
  SolutionOutlined, // Icon giải pháp
  ClockCircleOutlined, // Icon đồng hồ
  StarOutlined,
  HeartOutlined,
  CheckCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { bloodDonationApi } from "../../services/bloodDonationApi";
import { healthCheckApi } from "../../services/healthCheckApi";
import { donationHistoryApi } from "../../services/donationHistoryApi";
// Helper function to get auth token
const getAuthToken = () => {
  return (
    localStorage.getItem("userToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("userToken") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("authToken") ||
    sessionStorage.getItem("accessToken")
  );
};
// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};
import { useLocation } from "react-router-dom";
import "./BloodDonationProfile.css";

const { Title, Text } = Typography;

// Đặt biến này thành false để dùng dữ liệu thật từ API
const USE_MOCK = false;

const mockData = [
  // Đơn đang chờ xác nhận
  {
    id: "D001",
    donorId: "U001",
    bloodType: "A+",
    requestType: "regular",
    status: "pending",
    requestDate: new Date().toISOString(),
    healthCheckDate: null,
    donationDate: null,
    location: "Bệnh viện A",
    notes: "",
    requestId: null,
    rejectionReason: null,
    healthCheckStatus: "N/A",
  },
  // Đơn đã được duyệt, có lịch khám
  {
    id: "D002",
    donorId: "U001",
    bloodType: "B-",
    requestType: "regular",
    status: "approved",
    requestDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    healthCheckDate: new Date(Date.now() + 86400000).toISOString(),
    donationDate: null,
    location: "Bệnh viện B",
    notes: "",
    requestId: null,
    rejectionReason: null,
    healthCheckStatus: "pending",
  },
  // Đơn đã hoàn thành
  {
    id: "D003",
    donorId: "U001",
    bloodType: "O+",
    requestType: "emergency",
    status: "completed",
    requestDate: new Date(Date.now() - 86400000 * 10).toISOString(),
    healthCheckDate: new Date(Date.now() - 86400000 * 8).toISOString(),
    donationDate: new Date(Date.now() - 86400000 * 7).toISOString(),
    location: "Bệnh viện C",
    notes: "",
    requestId: "REQ123",
    rejectionReason: null,
    healthCheckStatus: "approved",
  },
];

// Helper để chuyển đổi trạng thái khám sức khỏe sang thông báo thân thiện
const getHealthCheckStatusText = (status) => {
  if (!status || status === "N/A") return "Chưa có hồ sơ khám sức khỏe";
  const s = status.toLowerCase();
  if (s === "pending") return "Hồ sơ sức khỏe của bạn đang được xem xét";
  if (s === "approved") return "Đã khám sức khỏe, đủ điều kiện hiến máu";
  if (s === "rejected") return "Không đủ điều kiện hiến máu";
  if (s === "used") return "Chưa có hồ sơ khám sức khỏe mới"; // Phiếu cũ đã được sử dụng
  return status;
};

// Mapping bloodTypeID sang tên nhóm máu
const BLOOD_TYPES = [
  { id: "11111111-1111-1111-1111-111111111001", label: "A+" },
  { id: "11111111-1111-1111-1111-111111111002", label: "A-" },
  { id: "11111111-1111-1111-1111-111111111003", label: "B+" },
  { id: "11111111-1111-1111-1111-111111111004", label: "B-" },
  { id: "11111111-1111-1111-1111-111111111005", label: "AB+" },
  { id: "11111111-1111-1111-1111-111111111006", label: "AB-" },
  { id: "11111111-1111-1111-1111-111111111007", label: "O+" },
  { id: "11111111-1111-1111-1111-111111111008", label: "O-" },
];
const getBloodTypeLabel = (id) =>
  BLOOD_TYPES.find((bt) => bt.id === id)?.label || "N/A";

const BloodDonationProfile = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDonation, setCurrentDonation] = useState(null);
  const [completedDonations, setCompletedDonations] = useState([]);
  const [healthChecks, setHealthChecks] = useState([]);
  const [donationHistory, setDonationHistory] = useState([]);
  const location = useLocation();
  // Thêm state viewStep để điều khiển bước đang xem
  const [viewStep, setViewStep] = useState(0);
  // Thêm state donorProfile
  const [donorProfile, setDonorProfile] = useState(null);

  // Get current user info
  const getCurrentUser = () => {
    const userId = localStorage.getItem("userId");
    const username = localStorage.getItem("username");
    const email = localStorage.getItem("email");
    console.log("DEBUG: Current user info:", { userId, username, email });
    return { userId, username, email };
  };

  const { userId, username, email } = getCurrentUser();

  // Clear cache khi component mount
  useEffect(() => {
    // Xóa cache cũ để đảm bảo lấy dữ liệu mới
    localStorage.removeItem("donorId");
    console.log("DEBUG: Cleared donorId cache for userId:", userId);
  }, [userId]);

  // Hàm lấy donorId hiện tại
  const getCurrentDonorId = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return null;

    // Xóa donorId cũ để tránh cache sai
    localStorage.removeItem("donorId");

    try {
      // Sử dụng endpoint GET /api/Donor để lấy tất cả donors
      const res = await fetch(`http://localhost:7262/api/Donor`, {
        headers: getAuthHeaders(),
      });
      const donors = await res.json();
      console.log("DEBUG: All donors from API:", donors);

      if (Array.isArray(donors) && donors.length > 0) {
        // Tìm donor record đúng cho user hiện tại
        const currentUserDonor = donors.find(
          (donor) =>
            donor.userId === userId ||
            donor.UserId === userId ||
            donor.userID === userId
        );

        if (currentUserDonor) {
          const donorId = currentUserDonor.donorId || currentUserDonor.id;
          setDonorProfile(currentUserDonor); // Lưu donorProfile vào state
          console.log("DEBUG: Found donorId for userId", userId, ":", donorId);
          console.log("DEBUG: Full donor record:", currentUserDonor);
          return donorId;
        } else {
          console.log(
            "DEBUG: No donor found for userId",
            userId,
            "in donors array"
          );
          console.log(
            "DEBUG: Available donors:",
            donors.map((d) => ({ userId: d.userId, donorId: d.donorId }))
          );
          return null; // Không có donor cho user này
        }
      }
    } catch (e) {
      console.error("Không lấy được donorId từ API:", e);
    }
    return null;
  };

  // Load user's blood donations
  useEffect(() => {
    if (USE_MOCK) {
      // Dùng mock data
      const formattedDonations = mockData.map(formatDonationData);
      setDonations(formattedDonations);
      // Lấy đơn active (approved ưu tiên, nếu không có thì pending)
      const activeDonation =
        formattedDonations.find((d) => d.status === "approved") ||
        formattedDonations.find((d) => d.status === "pending");
      setCurrentDonation(activeDonation);
      // Lấy đơn completed cho lịch sử
      const completed = formattedDonations.filter(
        (d) => d.status === "completed"
      );
      setCompletedDonations(completed);
      setLoading(false);
      return;
    }
    loadUserDonations();
  }, [userId]); // Thêm userId làm dependency để tải lại khi đổi tài khoản

  const loadUserDonations = async () => {
    setLoading(true);
    console.log("DEBUG: Loading donations for userId:", userId);
    console.log("DEBUG: Current user email:", email);
    const donorId = await getCurrentDonorId();
    console.log("DEBUG: Retrieved donorId:", donorId);
    if (!donorId) {
      console.log("DEBUG: No donor found for user, showing empty state");
      setDonations([]);
      setCurrentDonation(null);
      setCompletedDonations([]);
      setLoading(false);
      return;
    }

    try {
      // Fetch blood donations
      console.log("DEBUG: Fetching blood donations for donorId:", donorId);
      const donationData = await bloodDonationApi.getBloodDonationsByDonor(
        donorId
      );
      console.log("DEBUG: Raw donation data from API:", donationData);
      const formattedDonations = Array.isArray(donationData)
        ? donationData.map(formatDonationData)
        : [];
      console.log("DEBUG: Formatted donations:", formattedDonations);
      setDonations(formattedDonations);

      // Fetch health checks for this donor
      let donorHealthChecks = [];
      try {
        const healthCheckData = await healthCheckApi.getAllHealthChecks();
        console.log("DEBUG: All health checks from API:", healthCheckData);

        donorHealthChecks = Array.isArray(healthCheckData)
          ? healthCheckData.filter(
              (hc) =>
                hc.donorId === donorId ||
                hc.DonorId === donorId ||
                hc.donorID === donorId
            )
          : [];
        setHealthChecks(donorHealthChecks);
        console.log(
          "DEBUG: Filtered health checks for donor:",
          donorHealthChecks
        );
        console.log("DEBUG: Looking for donorId:", donorId);
      } catch (healthCheckError) {
        console.error("Error loading health checks:", healthCheckError);
        setHealthChecks([]);
      }

      // Find current active donation (pending or approved, case-insensitive)
      const activeDonation =
        formattedDonations.find(
          (d) => d.status && d.status.toLowerCase() === "pending"
        ) ||
        formattedDonations.find(
          (d) => d.status && d.status.toLowerCase() === "approved"
        );

      // Merge health check data with active donation
      if (activeDonation) {
        console.log("DEBUG: Active donation:", activeDonation);
        console.log("DEBUG: Available health checks:", donorHealthChecks);

        // Try to find related health check by multiple possible relationships
        // Filter out "used" health checks as they are old records from previous donations
        const relatedHealthCheck = donorHealthChecks.find((hc) => {
          const status = (
            hc.healthCheckStatus ||
            hc.HealthCheckStatus ||
            hc.status ||
            ""
          ).toLowerCase();
          return (
            status !== "used" &&
            (hc.donationId === activeDonation.id ||
              hc.DonationId === activeDonation.id ||
              hc.bloodDonationId === activeDonation.id ||
              hc.bloodDonationID === activeDonation.id ||
              hc.donationID === activeDonation.id)
          );
        });

        if (relatedHealthCheck) {
          activeDonation.healthCheckStatus =
            relatedHealthCheck.healthCheckStatus ||
            relatedHealthCheck.HealthCheckStatus ||
            "N/A";
          activeDonation.healthCheckDate =
            relatedHealthCheck.healthCheckDate ||
            relatedHealthCheck.HealthCheckDate;
          activeDonation.healthCheckId =
            relatedHealthCheck.healthCheckId ||
            relatedHealthCheck.HealthCheckId;
          console.log("DEBUG: Merged health check data:", {
            donationId: activeDonation.id,
            healthCheckStatus: activeDonation.healthCheckStatus,
            healthCheckDate: activeDonation.healthCheckDate,
            relatedHealthCheck: relatedHealthCheck,
          });
        } else {
          // If no direct relationship found, try to use the most recent valid health check for this donor
          // Filter out "used" health checks as they are old records from previous donations
          const validHealthChecks = donorHealthChecks.filter((hc) => {
            const status = (
              hc.healthCheckStatus ||
              hc.HealthCheckStatus ||
              hc.status ||
              ""
            ).toLowerCase();
            return status !== "used";
          });

          const mostRecentHealthCheck = validHealthChecks
            .filter((hc) => hc.healthCheckDate || hc.HealthCheckDate)
            .sort(
              (a, b) =>
                new Date(b.healthCheckDate || b.HealthCheckDate) -
                new Date(a.healthCheckDate || a.HealthCheckDate)
            )[0];

          if (mostRecentHealthCheck) {
            activeDonation.healthCheckStatus =
              mostRecentHealthCheck.healthCheckStatus ||
              mostRecentHealthCheck.HealthCheckStatus ||
              "N/A";
            activeDonation.healthCheckDate =
              mostRecentHealthCheck.healthCheckDate ||
              mostRecentHealthCheck.HealthCheckDate;
            activeDonation.healthCheckId =
              mostRecentHealthCheck.healthCheckId ||
              mostRecentHealthCheck.HealthCheckId;
            console.log("DEBUG: Using most recent valid health check:", {
              donationId: activeDonation.id,
              healthCheckStatus: activeDonation.healthCheckStatus,
              healthCheckDate: activeDonation.healthCheckDate,
              mostRecentHealthCheck: mostRecentHealthCheck,
            });
          } else {
            console.log(
              "DEBUG: No valid health check found for donation:",
              activeDonation.id
            );
            // Set status to indicate no valid health check
            activeDonation.healthCheckStatus = "N/A";
            activeDonation.healthCheckDate = null;
            activeDonation.healthCheckId = null;
          }
        }
      }

      setCurrentDonation(activeDonation);

      // Get completed donations for history
      const completed = formattedDonations.filter(
        (d) => d.status === "completed"
      );
      setCompletedDonations(completed);

      // Load donation history from DonationHistory API
      try {
        console.log("DEBUG: Loading donation history for donorId:", donorId);
        const historyData = await donationHistoryApi.getAllDonationHistory();
        console.log("DEBUG: Raw donation history data:", historyData);

        // Filter history for current donor
        const donorHistory = Array.isArray(historyData)
          ? historyData.filter(
              (history) =>
                history.donorID === donorId || history.donorId === donorId
            )
          : [];

        console.log(
          "DEBUG: Filtered donation history for donor:",
          donorHistory
        );
        setDonationHistory(donorHistory);
      } catch (historyError) {
        console.error("Error loading donation history:", historyError);
        setDonationHistory([]);
      }
    } catch (error) {
      console.error("Error loading user donations:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDonationData = (donation) => {
    return {
      id:
        donation.DonationId ||
        donation.donationID ||
        donation.donationId ||
        donation.id ||
        "--",
      donorId:
        donation.DonorId ||
        donation.donorId ||
        donation.donorID ||
        donation.userId ||
        "N/A",
      bloodType: donation.bloodType || donation.bloodTypeName || "N/A",
      requestType: donation.requestType || "regular",
      status: donation.Status || donation.status || "pending",
      requestDate: donation.requestDate || donation.createdAt,
      healthCheckDate: donation.HealthCheckDate || donation.healthCheckDate,
      donationDate: donation.donationDate,
      location: donation.location || "N/A",
      notes: donation.Notes || donation.notes || "",
      requestId: donation.requestId || null,
      rejectionReason: donation.rejectionReason,
      healthCheckStatus:
        donation.HealthCheckStatus || donation.healthCheckStatus || "N/A",
      certificateId: donation.CertificateId || donation.certificateId || null,
    };
  };

  const formatDonationHistoryData = (history) => {
    return {
      id: history.historyID || history.id || "--",
      donorId: history.donorID || history.donorId || "N/A",
      donationDate: history.donationDate,
      quantity: history.quantity || "N/A",
      healthStatus: history.healthStatus || "N/A",
      nextEligibleDate: history.nextEligibleDate,
      certificateId: history.certificateID || history.certificateId || null,
    };
  };

  // Determine current step based on donation status and health check status
  const getCurrentStep = () => {
    if (!currentDonation) return 0;
    const status = currentDonation.status
      ? currentDonation.status.toLowerCase()
      : "";
    const healthCheckStatus = currentDonation.healthCheckStatus
      ? currentDonation.healthCheckStatus.toLowerCase()
      : "";

    if (status === "pending") return 0;

    if (status === "approved") {
      // Nếu đã có hồ sơ sức khỏe hợp lệ (approved, pending), chuyển qua bước 2
      if (healthCheckStatus === "approved" || healthCheckStatus === "pending")
        return 2;
      // Nếu chưa có hồ sơ hoặc hồ sơ là "used", ở bước 1 (chờ lịch khám sức khỏe)
      if (healthCheckStatus === "used" || healthCheckStatus === "n/a") return 1;
      return 1;
    }

    // Chỉ khi status là completed VÀ healthCheckStatus là approved mới cho sang bước cuối
    if (status === "completed" && healthCheckStatus === "approved") return 2;
    // Nếu completed mà chưa approved healthCheck hoặc healthCheck là "used", vẫn ở bước 1 (chờ khám sức khỏe)
    if (status === "completed") return 1;
    return 0;
  };

  // Check if user has health check scheduled
  const hasHealthCheckScheduled = () => {
    return currentDonation && currentDonation.healthCheckDate;
  };

  const donationProcess = [
    {
      title:
        currentDonation?.status?.toLowerCase() === "approved"
          ? "Chờ ngày hiến máu"
          : "Chờ xác nhận",
      icon: <FileTextOutlined />,
      description:
        currentDonation?.status?.toLowerCase() === "approved"
          ? "Đơn đăng ký của bạn đã được duyệt, chờ lịch khám sức khỏe."
          : "Đơn đăng ký của bạn đang chờ xác nhận.",
    },
    {
      title: "Lịch Khám sức khỏe",
      icon: <SolutionOutlined />,
      description: hasHealthCheckScheduled()
        ? `Khám sức khỏe vào ngày ${new Date(
            currentDonation.healthCheckDate
          ).toLocaleDateString("vi-VN")}`
        : "Bạn sẽ được khám sức khỏe trước khi hiến máu.",
    },
    {
      title: "Chờ kết quả",
      icon: <ClockCircleOutlined />,
      description: "Chờ thông báo kết quả nhóm máu và lời cảm ơn.",
    },
    {
      title: "Nhận certificate",
      icon: <StarOutlined />,
      description: "Nhận chứng nhận hiến máu.",
    },
  ];

  // Table columns for donation history
  const columns = [
    {
      title: "Ngày hiến máu",
      dataIndex: "donationDate",
      key: "donationDate",
      render: (date) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "N/A",
    },
    {
      title: "Lượng máu (ml)",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity) => (quantity ? `${quantity} ml` : "N/A"),
    },
    {
      title: "Tình trạng sức khỏe",
      dataIndex: "healthStatus",
      key: "healthStatus",
      render: (status) => {
        const color =
          status === "Good" ? "green" : status === "Fair" ? "orange" : "red";
        return <Tag color={color}>{status || "N/A"}</Tag>;
      },
    },
    {
      title: "Ngày hiến máu tiếp theo",
      dataIndex: "nextEligibleDate",
      key: "nextEligibleDate",
      render: (date) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "N/A",
    },
    {
      title: "Chứng chỉ",
      dataIndex: "certificateId",
      key: "certificateId",
      render: (certId) =>
        certId ? (
          <a href={`/member/certificate?certificateId=${certId}`}>
            <button
              style={{
                background: "#1976D2",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "4px 12px",
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Xem chứng chỉ
            </button>
          </a>
        ) : (
          "N/A"
        ),
    },
  ];

  useEffect(() => {
    // Khi currentDonation thay đổi, cập nhật viewStep về bước hiện tại
    setViewStep(getCurrentStep());
  }, [currentDonation]);

  if (loading) {
    return (
      <div className="profile-loading">
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Đang tải thông tin hiến máu...</div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="profile-alert">
        <Alert
          message="Vui lòng đăng nhập"
          description="Bạn cần đăng nhập để xem hồ sơ hiến máu."
          type="warning"
          showIcon
        />
      </div>
    );
  }

  // Tổng số lần hiến và tổng lượng máu
  const totalDonations = donationHistory.length;
  const totalQuantity = donationHistory.reduce(
    (sum, d) => sum + (parseInt(d.quantity) || 0),
    0
  );
  // Ưu tiên lấy bloodTypeID, nếu không có thì lấy bloodType string, nếu không có nữa thì lấy từ donorProfile
  const bloodTypeId =
    donationHistory[0]?.bloodTypeID ||
    donationHistory[0]?.bloodTypeId ||
    currentDonation?.bloodTypeID ||
    currentDonation?.bloodTypeId ||
    donorProfile?.bloodTypeId;
  const bloodType = bloodTypeId
    ? getBloodTypeLabel(bloodTypeId)
    : donationHistory[0]?.bloodType || currentDonation?.bloodType || "N/A";

  return (
    <div className="profile-container">
      {/* Card thông tin cá nhân */}
      <Card className="profile-card" bordered={false}>
        <div className="profile-header">
          <div className="profile-avatar-section">
            <Avatar
              size={120}
              icon={<UserOutlined />}
              style={{
                background: "linear-gradient(135deg, #1976D2 0%, #1565C0 100%)",
                boxShadow: "0 4px 16px rgba(25, 118, 210, 0.3)",
              }}
            />
            <div className="profile-badge">
              <Tag color="red" className="blood-type-tag">
                {bloodType}
              </Tag>
            </div>
          </div>

          <div className="profile-info-section">
            <div className="profile-name">
              <Title level={2} style={{ marginBottom: 8, color: "#1e293b" }}>
                {username}
              </Title>
              <Text style={{ color: "#64748b", fontSize: 16 }}>
                Người hiến máu tình nguyện
              </Text>
            </div>

            <div className="profile-stats">
              <div className="stat-item">
                <div className="stat-icon">
                  <HeartOutlined style={{ color: "#1976D2", fontSize: 24 }} />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{totalDonations}</div>
                  <div className="stat-label">Tổng số lần hiến</div>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-icon">
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      background:
                        "linear-gradient(135deg, #1976D2 0%, #1565C0 100%)",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      style={{
                        color: "#fff",
                        fontSize: 12,
                        fontWeight: "bold",
                      }}
                    >
                      ml
                    </span>
                  </div>
                </div>
                <div className="stat-content">
                  <div className="stat-value">
                    {totalQuantity.toLocaleString()}
                  </div>
                  <div className="stat-label">Tổng lượng máu (ml)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
      <Divider />
      {/* Quy trình hiến máu hiện tại */}
      {currentDonation && (
        <Card className="profile-process-card" style={{ marginBottom: 32 }}>
          <div style={{ marginBottom: 16 }}>
            <Title level={4}>
              <FileTextOutlined style={{ marginRight: 8 }} />
              Quy trình hiến máu hiện tại
              {currentDonation.id && (
                <span
                  style={{ fontSize: 15, marginLeft: 16, color: "#1976D2" }}
                >
                  (ID: <b>{currentDonation.id}</b>)
                </span>
              )}
            </Title>
            {currentDonation.requestId && (
              <Alert
                message="Yêu cầu khẩn cấp"
                description={`Request ID: ${currentDonation.requestId}`}
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}
          </div>

          {/* Custom Stepper */}
          <div className="custom-stepper">
            {/* Bước 1: Lịch hẹn hiến máu */}
            <div
              className={`stepper-step ${viewStep === 0 ? "active" : ""}`}
              onClick={() => setViewStep(0)}
            >
              <div
                className={`stepper-circle ${
                  viewStep === 0
                    ? "active"
                    : getCurrentStep() > 0
                    ? "completed"
                    : "inactive"
                }`}
              >
                {getCurrentStep() > 0 ? (
                  <CheckCircleOutlined
                    style={{ fontSize: 28, color: "#fff" }}
                  />
                ) : (
                  <FileTextOutlined
                    style={{
                      fontSize: 28,
                      color: viewStep === 0 ? "#fff" : "#999",
                    }}
                  />
                )}
              </div>
              <div
                className={`stepper-title ${
                  viewStep === 0
                    ? "active"
                    : getCurrentStep() > 0
                    ? "completed"
                    : "inactive"
                }`}
              >
                Lịch hẹn hiến máu
              </div>
            </div>

            {/* Line */}
            <div
              className={`stepper-line ${
                getCurrentStep() > 0 ? "completed" : "inactive"
              }`}
            />

            {/* Bước 2: Khám sức khỏe & Hiến máu */}
            <div
              className={`stepper-step ${
                getCurrentStep() >= 1 ? "" : "disabled"
              }`}
              onClick={getCurrentStep() >= 1 ? () => setViewStep(1) : undefined}
            >
              <div
                className={`stepper-circle ${
                  viewStep === 1
                    ? "active"
                    : getCurrentStep() > 1
                    ? "completed"
                    : getCurrentStep() >= 1
                    ? "pending"
                    : "inactive"
                }`}
              >
                {getCurrentStep() > 1 ? (
                  <CheckCircleOutlined
                    style={{ fontSize: 28, color: "#fff" }}
                  />
                ) : (
                  <SolutionOutlined
                    style={{
                      fontSize: 28,
                      color: getCurrentStep() >= 1 ? "#fff" : "#999",
                    }}
                  />
                )}
              </div>
              <div
                className={`stepper-title ${
                  viewStep === 1
                    ? "active"
                    : getCurrentStep() > 1
                    ? "completed"
                    : getCurrentStep() >= 1
                    ? "pending"
                    : "inactive"
                }`}
              >
                Khám sức khỏe & Hiến máu
              </div>
            </div>

            {/* Line */}
            <div
              className={`stepper-line ${
                getCurrentStep() > 1 ? "completed" : "inactive"
              }`}
            />

            {/* Bước 3: Nhận certificate */}
            <div
              className={`stepper-step ${
                getCurrentStep() >= 2 ? "" : "disabled"
              }`}
              onClick={getCurrentStep() >= 2 ? () => setViewStep(2) : undefined}
            >
              <div
                className={`stepper-circle ${
                  viewStep === 2
                    ? "active"
                    : getCurrentStep() > 2
                    ? "completed"
                    : getCurrentStep() >= 2
                    ? "pending"
                    : "inactive"
                }`}
              >
                {getCurrentStep() > 2 ? (
                  <CheckCircleOutlined
                    style={{ fontSize: 28, color: "#fff" }}
                  />
                ) : (
                  <StarOutlined
                    style={{
                      fontSize: 28,
                      color: getCurrentStep() >= 2 ? "#fff" : "#999",
                    }}
                  />
                )}
              </div>
              <div
                className={`stepper-title ${
                  viewStep === 2
                    ? "active"
                    : getCurrentStep() > 2
                    ? "completed"
                    : getCurrentStep() >= 2
                    ? "pending"
                    : "inactive"
                }`}
              >
                Nhận certificate
              </div>
              {viewStep >= 2 &&
                currentDonation &&
                currentDonation.bloodType && (
                  <div
                    style={{
                      fontSize: 13,
                      color: "#1976D2",
                      marginTop: 8,
                      fontWeight: 600,
                      background: "rgba(25, 118, 210, 0.1)",
                      padding: "4px 8px",
                      borderRadius: "6px",
                    }}
                  >
                    Nhóm máu: <b>{currentDonation.bloodType}</b>
                    <br />
                    <span>Cảm ơn bạn đã hiến máu!</span>
                  </div>
                )}
            </div>
          </div>

          {/* Additional Info */}
          <div className="detail-section">
            <div className="detail-title">
              <FileTextOutlined style={{ color: "#1976D2" }} />
              Thông tin chi tiết
            </div>
            <div className="detail-content">
              {/* Hiển thị chi tiết theo viewStep */}
              {viewStep === 0 && (
                <>
                  {/* Bước 1: Chờ xác nhận */}
                  <br />
                  {currentDonation.status &&
                  currentDonation.status.toLowerCase() === "pending" ? (
                    <div className="status-notification warning">
                      <Text
                        style={{
                          color: "#faad14",
                          fontWeight: 600,
                          fontSize: 16,
                        }}
                      >
                        ⏳ Chờ đến ngày hiến máu & khám sức khỏe.
                      </Text>
                    </div>
                  ) : null}
                  {currentDonation.donationDate && (
                    <>
                      <Text>
                        Ngày khám sức khỏe và hiến máu:{" "}
                        {new Date(
                          currentDonation.donationDate
                        ).toLocaleDateString("vi-VN")}
                      </Text>
                    </>
                  )}

                  {/* Nếu bị từ chối ở bước này */}
                  {currentDonation.status &&
                    currentDonation.status.toLowerCase() === "rejected" && (
                      <div style={{ textAlign: "center", marginTop: 16 }}>
                        <a href="/member/blood-donation-register">
                          <button
                            style={{
                              background: "#E91E63",
                              color: "#fff",
                              border: "none",
                              borderRadius: 6,
                              padding: "8px 20px",
                              fontSize: 16,
                              cursor: "pointer",
                              fontWeight: 500,
                            }}
                            onClick={() => setViewStep(0)}
                          >
                            Đăng ký hiến máu lại
                          </button>
                        </a>
                      </div>
                    )}
                </>
              )}
              {viewStep === 1 && (
                <>
                  {/* Bước 2: Khám sức khỏe & Hiến máu */}
                  {currentDonation.healthCheckDate ? (
                    <>
                      <Text>
                        Ngày khám sức khỏe:{" "}
                        {new Date(
                          currentDonation.healthCheckDate
                        ).toLocaleDateString("vi-VN")}
                      </Text>
                      <br />
                    </>
                  ) : currentDonation.donationDate ? (
                    <>
                      <Text>
                        Lịch Khám sức khỏe & Hiến máu:{" "}
                        {new Date(
                          currentDonation.donationDate
                        ).toLocaleDateString("vi-VN")}
                      </Text>
                      <br />
                    </>
                  ) : (
                    <>
                      <Text>
                        Lịch khám sức khỏe:{" "}
                        <span style={{ color: "#1976D2", fontWeight: 500 }}>
                          Đang chờ lịch hẹn
                        </span>
                      </Text>
                      <br />
                    </>
                  )}
                  {/* Trạng thái khám sức khỏe */}
                  <Text>
                    Trạng thái khám sức khỏe:
                    <Tag
                      color={
                        currentDonation.healthCheckStatus === "pending"
                          ? "orange"
                          : currentDonation.healthCheckStatus === "approved"
                          ? "green"
                          : currentDonation.healthCheckStatus === "rejected"
                          ? "red"
                          : currentDonation.healthCheckStatus === "used"
                          ? "default"
                          : "default"
                      }
                      style={{ marginLeft: 8 }}
                    >
                      {getHealthCheckStatusText(
                        currentDonation.healthCheckStatus
                      )}
                    </Tag>
                  </Text>
                  <br />

                  {/* Thông báo khi đã có hồ sơ sức khỏe hợp lệ */}
                  {(currentDonation.healthCheckStatus === "pending" ||
                    currentDonation.healthCheckStatus === "approved") && (
                    <div className="status-notification success">
                      <Text strong style={{ color: "#52c41a", fontSize: 16 }}>
                        ✅ Hồ sơ sức khỏe đã được tạo
                      </Text>
                      <br />
                      <Text
                        style={{
                          color: "#389e0d",
                          marginTop: 8,
                          display: "block",
                        }}
                      >
                        {currentDonation.healthCheckStatus === "pending"
                          ? "Hồ sơ sức khỏe của bạn đang được xem xét."
                          : "Hồ sơ sức khỏe của bạn đã được duyệt, đủ điều kiện hiến máu."}
                      </Text>
                    </div>
                  )}

                  {/* Nếu bị từ chối hoặc phiếu đã được sử dụng ở bước này */}
                  {(currentDonation.healthCheckStatus &&
                    currentDonation.healthCheckStatus.toLowerCase() ===
                      "rejected") ||
                  (currentDonation.healthCheckStatus &&
                    currentDonation.healthCheckStatus.toLowerCase() ===
                      "used") ? (
                    <div style={{ textAlign: "center", marginTop: 16 }}>
                      <a href="/member/blood-donation-register">
                        <button
                          style={{
                            background: "#E91E63",
                            color: "#fff",
                            border: "none",
                            borderRadius: 6,
                            padding: "8px 20px",
                            fontSize: 16,
                            cursor: "pointer",
                            fontWeight: 500,
                          }}
                          onClick={() => setViewStep(0)}
                        >
                          Đăng ký hiến máu lại
                        </button>
                      </a>
                    </div>
                  ) : null}
                </>
              )}
              {viewStep === 2 && (
                <>
                  {/* Bước 3: Nhận certificate */}
                  {currentDonation.donationDate && (
                    <>
                      <Text>
                        Ngày hiến máu:{" "}
                        {new Date(
                          currentDonation.donationDate
                        ).toLocaleDateString("vi-VN")}
                      </Text>
                      <br />
                    </>
                  )}
                  <Text>
                    Trạng thái khám sức khỏe:
                    <Tag
                      color={
                        currentDonation.healthCheckStatus === "pending"
                          ? "orange"
                          : currentDonation.healthCheckStatus === "approved"
                          ? "green"
                          : currentDonation.healthCheckStatus === "rejected"
                          ? "red"
                          : currentDonation.healthCheckStatus === "used"
                          ? "default"
                          : "default"
                      }
                      style={{ marginLeft: 8 }}
                    >
                      {getHealthCheckStatusText(
                        currentDonation.healthCheckStatus
                      )}
                    </Tag>
                  </Text>
                  <br />
                  {currentDonation.certificateId && (
                    <div
                      className="status-notification success"
                      style={{ textAlign: "center" }}
                    >
                      <Text strong style={{ fontSize: 18, color: "#1976D2" }}>
                        🎉 Chúc mừng bạn đã nhận được chứng chỉ hiến máu!
                      </Text>
                      <div style={{ margin: "16px 0" }}>
                        <span
                          style={{
                            color: "#4CAF50",
                            fontWeight: 600,
                            fontSize: 16,
                          }}
                        >
                          Cảm ơn bạn đã tham gia hiến máu và lan tỏa nghĩa cử
                          cao đẹp!
                        </span>
                      </div>
                      <a href="/member/certificate">
                        <button
                          className="profile-register-btn"
                          onClick={() => setViewStep(0)}
                        >
                          Xem Chứng nhận đăng ký hiến máu
                        </button>
                      </a>
                    </div>
                  )}
                  {/* Nếu bị từ chối hoặc phiếu đã được sử dụng ở bước này */}
                  {(currentDonation.status &&
                    currentDonation.status.toLowerCase() === "rejected") ||
                  (currentDonation.healthCheckStatus &&
                    currentDonation.healthCheckStatus.toLowerCase() ===
                      "rejected") ||
                  (currentDonation.healthCheckStatus &&
                    currentDonation.healthCheckStatus.toLowerCase() ===
                      "used") ? (
                    <div style={{ textAlign: "center", marginTop: 16 }}>
                      <a href="/member/blood-donation-register">
                        <button
                          style={{
                            background: "#E91E63",
                            color: "#fff",
                            border: "none",
                            borderRadius: 6,
                            padding: "8px 20px",
                            fontSize: 16,
                            cursor: "pointer",
                            fontWeight: 500,
                          }}
                          onClick={() => setViewStep(0)}
                        >
                          Đăng ký hiến máu lại
                        </button>
                      </a>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </Card>
      )}
      {/* Lịch sử hiến máu */}
      <Card className="profile-history-card" title="Lịch sử hiến máu">
        {donationHistory.length > 0 ? (
          <Table
            columns={columns}
            dataSource={donationHistory.map((history, index) => ({
              ...formatDonationHistoryData(history),
              key: history.historyID || history.id || index,
            }))}
            pagination={false}
            locale={{
              emptyText: <Empty description="Chưa có lịch sử hiến máu" />,
            }}
          />
        ) : (
          <div className="profile-empty-history">
            <Empty description={null} />
            <div style={{ marginTop: 16, fontSize: 16 }}>
              Bạn chưa từng hiến máu. Hãy đăng ký hiến máu tại đây
            </div>
            <a href="/member/blood-donation-register">
              <button className="profile-register-btn">Đăng ký hiến máu</button>
            </a>
          </div>
        )}
      </Card>
      {/* No Donations Message */}
      {donations.length === 0 && (
        <Card className="profile-no-donation">
          <Empty
            description="Bạn chưa có đơn hiến máu nào"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      )}
    </div>
  );
};

export default BloodDonationProfile;
