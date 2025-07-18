import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Tag,
  Modal,
  message,
  Tabs,
  Empty,
  Popconfirm,
  Input,
  Select,
} from "antd";
import donorApi from "../../services/donorApi";
import HealthCheckApi from "../../services/healthCheckApi";
import { UserAPI } from "../../services/userApi";
import bloodDonationApi from "../../services/bloodDonationApi";
import "./BloodDonationManagement.css";

const healthCheckApi = new HealthCheckApi();

const BloodDonationManagement = () => {
  const [loading, setLoading] = useState(false);
  const [donations, setDonations] = useState([]);
  const [donors, setDonors] = useState([]);
  const [users, setUsers] = useState([]);
  const [healthChecks, setHealthChecks] = useState([]);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [donationRes, donorRes, userRes, healthCheckRes] =
        await Promise.all([
          bloodDonationApi.getAllBloodDonations(),
          donorApi.getAllDonors(),
          UserAPI.getAllUsers(),
          healthCheckApi.getAllHealthChecks(),
        ]);
      console.log("BloodDonation API response:", donationRes);
      console.log("Donor API response:", donorRes);
      console.log("User API response:", userRes);
      console.log("HealthCheck API response:", healthCheckRes);

      // Get donations and sort by registration date (most recent first)
      const donationsData = Array.isArray(donationRes?.data)
        ? donationRes.data
        : Array.isArray(donationRes)
        ? donationRes
        : [];

      const sortedDonations = donationsData.sort((a, b) => {
        // Try multiple date field names that might exist
        const aDate =
          a.donationDate || a.registrationDate || a.createdAt || a.dateCreated;
        const bDate =
          b.donationDate || b.registrationDate || b.createdAt || b.dateCreated;

        if (!aDate && !bDate) return 0;
        if (!aDate) return 1;
        if (!bDate) return -1;

        // Convert to Date objects for comparison
        return new Date(bDate) - new Date(aDate);
      });

      console.log("Sorted donations (most recent first):", sortedDonations);

      const healthChecksData = Array.isArray(healthCheckRes?.data)
        ? healthCheckRes.data
        : Array.isArray(healthCheckRes)
        ? healthCheckRes
        : [];

      // Data validation: Check for inconsistent states
      const inconsistentData = sortedDonations.filter((donation) => {
        const donationStatus = (donation.status || "").toLowerCase();
        if (donationStatus === "completed") {
          const healthStatus = getHealthCheckStatusForValidation(
            donation.donorId,
            healthChecksData
          );
          return healthStatus !== "approved";
        }
        return false;
      });

      setDonations(sortedDonations);
      setDonors(
        Array.isArray(donorRes?.data)
          ? donorRes.data
          : Array.isArray(donorRes)
          ? donorRes
          : []
      );
      setUsers(
        Array.isArray(userRes?.data)
          ? userRes.data
          : Array.isArray(userRes)
          ? userRes
          : []
      );
      setHealthChecks(healthChecksData);
    } catch (err) {
      message.error("Lỗi khi tải dữ liệu!");
      console.error("Lỗi khi tải dữ liệu:", err);
    }
    setLoading(false);
  };

  // Helper function for validation during data loading
  const getHealthCheckStatusForValidation = (donorId, healthChecksArray) => {
    const valid = healthChecksArray.filter((hc) => {
      const status = (
        hc.status ||
        hc.healthCheckStatus ||
        hc.HealthCheck_Status ||
        ""
      ).toLowerCase();
      return hc.donorId === donorId && status !== "used";
    });

    if (
      valid.some(
        (hc) =>
          (
            hc.status ||
            hc.healthCheckStatus ||
            hc.HealthCheck_Status ||
            ""
          ).toLowerCase() === "approved"
      )
    ) {
      return "approved";
    }
    if (
      valid.some(
        (hc) =>
          (
            hc.status ||
            hc.healthCheckStatus ||
            hc.HealthCheck_Status ||
            ""
          ).toLowerCase() === "pending"
      )
    ) {
      return "pending";
    }
    if (
      valid.some(
        (hc) =>
          (
            hc.status ||
            hc.healthCheckStatus ||
            hc.HealthCheck_Status ||
            ""
          ).toLowerCase() === "rejected"
      )
    ) {
      return "rejected";
    }
    return "none";
  };

  // Helper: Lấy donor info
  const getDonor = (donorId) => donors.find((d) => d.donorId === donorId) || {};
  // Helper: Lấy user info
  const getUser = (userId) => users.find((u) => u.userId === userId) || {};
  // Helper: Lấy healthCheck hợp lệ với validation logic
  const getHealthCheckStatus = (donorId, donationStatus = null) => {
    const valid = healthChecks.filter((hc) => {
      const status = (
        hc.status ||
        hc.healthCheckStatus ||
        hc.HealthCheck_Status ||
        ""
      ).toLowerCase();
      return hc.donorId === donorId && status !== "used";
    });

    // Check for approved status first
    const hasApproved = valid.some(
      (hc) =>
        (
          hc.status ||
          hc.healthCheckStatus ||
          hc.HealthCheck_Status ||
          ""
        ).toLowerCase() === "approved"
    );

    if (hasApproved) {
      return "approved";
    }

    // Check for pending status
    const hasPending = valid.some(
      (hc) =>
        (
          hc.status ||
          hc.healthCheckStatus ||
          hc.HealthCheck_Status ||
          ""
        ).toLowerCase() === "pending"
    );

    if (hasPending) {
      return "pending";
    }

    // Check for rejected status
    const hasRejected = valid.some(
      (hc) =>
        (
          hc.status ||
          hc.healthCheckStatus ||
          hc.HealthCheck_Status ||
          ""
        ).toLowerCase() === "rejected"
    );

    if (hasRejected) {
      return "rejected";
    }

    return "none";
  };

  // Helper: render object as table
  const renderDetailTable = (obj, fieldLabels = {}) => (
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        background: "#fff",
        borderRadius: 10,
        boxShadow: "0 2px 8px #e3e8ee",
        fontSize: 15,
      }}
    >
      <tbody>
        {Object.entries(obj).map(([key, value]) => (
          <tr key={key}>
            <td
              style={{
                fontWeight: 600,
                color: "#1976D2",
                padding: "8px 12px",
                borderBottom: "1px solid #f0f0f0",
                width: 160,
              }}
            >
              {fieldLabels[key] || key}
            </td>
            <td
              style={{
                padding: "8px 12px",
                borderBottom: "1px solid #f0f0f0",
                color: "#263238",
              }}
            >
              {String(value) || "-"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

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

  const getBloodTypeLabel = (bloodTypeId) => {
    const found = BLOOD_TYPES.find((t) => t.id === bloodTypeId);
    return found ? found.label : bloodTypeId || "N/A";
  };

  // Table columns
  const columns = [
    {
      title: "Họ tên",
      dataIndex: "donorId",
      key: "donorId",
      render: (donorId) => getDonor(donorId).fullName || "N/A",
    },
    {
      title: "Nhóm máu",
      dataIndex: "donorId",
      key: "bloodType",
      render: (donorId) => getBloodTypeLabel(getDonor(donorId).bloodTypeId),
    },
    {
      title: "Ngày đăng ký",
      dataIndex: "donationDate",
      key: "donationDate",
      render: (donationDate, record) => {
        // Try multiple date field names
        const date =
          donationDate ||
          record.registrationDate ||
          record.createdAt ||
          record.dateCreated;
        if (!date) return "N/A";

        try {
          const formattedDate = new Date(date).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          });
          return formattedDate;
        } catch (error) {
          return date;
        }
      },
      sorter: (a, b) => {
        const aDate =
          a.donationDate || a.registrationDate || a.createdAt || a.dateCreated;
        const bDate =
          b.donationDate || b.registrationDate || b.createdAt || b.dateCreated;

        if (!aDate && !bDate) return 0;
        if (!aDate) return 1;
        if (!bDate) return -1;

        return new Date(bDate) - new Date(aDate);
      },
      defaultSortOrder: "descend",
    },
    {
      title: "Trạng thái phiếu sức khỏe",
      dataIndex: "donorId",
      key: "healthCheck",
      render: (donorId, record) => {
        const status = getHealthCheckStatus(donorId);
        // Logic validation: If donation is completed, health check must be approved
        if (
          record.status?.toLowerCase() === "completed" &&
          status !== "approved"
        ) {
          console.warn(
            `Inconsistent data: Donation ${record.donationId} is completed but health check is not approved`
          );
        }

        if (status === "approved")
          return <Tag color="green">PHIẾU ĐÃ DUYỆT</Tag>;
        if (status === "pending") return <Tag color="orange">CHỜ DUYỆT</Tag>;
        if (status === "rejected") return <Tag color="red">BỊ TỪ CHỐI</Tag>;
        return <Tag color="default">CHƯA CÓ PHIẾU</Tag>;
      },
      sorter: (a, b) => {
        const statusA = getHealthCheckStatus(a.donorId);
        const statusB = getHealthCheckStatus(b.donorId);

        // Define sort order: approved > pending > rejected > none
        const order = { approved: 4, pending: 3, rejected: 2, none: 1 };
        return (order[statusB] || 0) - (order[statusA] || 0);
      },
      filters: [
        { text: "Phiếu đã duyệt", value: "approved" },
        { text: "Chờ duyệt", value: "pending" },
        { text: "Bị từ chối", value: "rejected" },
        { text: "Chưa có phiếu", value: "none" },
      ],
      onFilter: (value, record) =>
        getHealthCheckStatus(record.donorId) === value,
    },
    {
      title: "Trạng thái đơn",
      dataIndex: "status",
      key: "status",
      render: (status, record) => {
        const s = (status || "").toLowerCase();
        const healthStatus = getHealthCheckStatus(record.donorId);

        // Logic validation: If status is completed, health check should be approved
        if (s === "completed" && healthStatus !== "approved") {
          console.warn(
            `Data inconsistency: Donation ${record.donationId} is completed but health check status is ${healthStatus}`
          );
          // Optionally show a warning in UI
          return (
            <div>
              <Tag color="blue">ĐÃ HOÀN THÀNH</Tag>
              <Tag color="orange" style={{ fontSize: "10px", marginLeft: 4 }}>
                !
              </Tag>
            </div>
          );
        }

        if (s === "completed") return <Tag color="blue">ĐÃ HOÀN THÀNH</Tag>;
        if (s === "approved") return <Tag color="green">ĐÃ DUYỆT</Tag>;
        if (s === "pending") return <Tag color="orange">CHỜ DUYỆT</Tag>;
        if (s === "rejected") return <Tag color="red">BỊ TỪ CHỐI</Tag>;
        return <Tag color="default">KHÁC</Tag>;
      },
      sorter: (a, b) => {
        const statusA = (a.status || "").toLowerCase();
        const statusB = (b.status || "").toLowerCase();

        // Define sort order: completed > approved > pending > rejected > other
        const order = { completed: 5, approved: 4, pending: 3, rejected: 2 };
        return (order[statusB] || 1) - (order[statusA] || 1);
      },
      filters: [
        { text: "Đã hoàn thành", value: "completed" },
        { text: "Đã duyệt", value: "approved" },
        { text: "Chờ duyệt", value: "pending" },
        { text: "Bị từ chối", value: "rejected" },
        { text: "Khác", value: "other" },
      ],
      onFilter: (value, record) => {
        const status = (record.status || "").toLowerCase();
        if (value === "other") {
          return !["completed", "approved", "pending", "rejected"].includes(
            status
          );
        }
        return status === value;
      },
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => {
        // Lấy healthCheck hợp lệ cho donor này
        const donorId = record.donorId;
        const validHealthCheck = healthChecks.find((hc) => {
          const status = (
            hc.status ||
            hc.healthCheckStatus ||
            hc.HealthCheck_Status ||
            ""
          ).toLowerCase();
          return hc.donorId === donorId && status !== "used";
        });
        const status = validHealthCheck
          ? (
              validHealthCheck.status ||
              validHealthCheck.healthCheckStatus ||
              validHealthCheck.HealthCheck_Status ||
              ""
            ).toLowerCase()
          : "none";
        // Handler
        const handleApprove = async () => {
          try {
            console.log("Starting approval process...");
            console.log("Health check to approve:", validHealthCheck);
            console.log("Blood donation to approve:", record);

            // Step 1: Approve health check
            try {
              await healthCheckApi.approveHealthCheck(
                validHealthCheck.healthCheckId || validHealthCheck.id
              );
              console.log("Health check approved successfully");
            } catch (healthCheckError) {
              console.error("Health check approval failed:", healthCheckError);
              // Check if it was already approved
              if (
                healthCheckError.message?.includes("already") ||
                healthCheckError.message?.includes("đã")
              ) {
                console.log(
                  "Health check may already be approved, continuing..."
                );
              } else {
                throw healthCheckError; // Re-throw if it's a real error
              }
            }

            // Step 2: Approve blood donation
            try {
              await bloodDonationApi.approveBloodDonation({
                bloodDonationId: record.donationId,
              });
              console.log("Blood donation approved successfully");
            } catch (bloodDonationError) {
              console.error(
                "Blood donation approval failed:",
                bloodDonationError
              );
              // Check if it was already approved
              if (
                bloodDonationError.message?.includes("already") ||
                bloodDonationError.message?.includes("đã")
              ) {
                console.log(
                  "Blood donation may already be approved, continuing..."
                );
              } else {
                throw bloodDonationError; // Re-throw if it's a real error
              }
            }

            message.success("Duyệt phiếu sức khỏe và đơn hiến máu thành công!");
            await fetchAllData();
          } catch (err) {
            console.error("Approval process failed:", err);

            // Always reload data to check actual status
            await fetchAllData();

            // More detailed error message
            const errorMessage = err.message || "Unknown error";
            if (
              errorMessage.includes("already") ||
              errorMessage.includes("đã duyệt") ||
              errorMessage.includes("đã")
            ) {
              message.success("Phiếu sức khỏe và đơn hiến máu đã được xử lý!");
            } else if (
              errorMessage.includes("401") ||
              errorMessage.includes("unauthorized")
            ) {
              message.error(
                "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
              );
            } else if (
              errorMessage.includes("network") ||
              errorMessage.includes("fetch")
            ) {
              message.warning(
                "Có lỗi kết nối. Vui lòng kiểm tra lại trạng thái sau khi reload trang."
              );
            } else {
              message.error(`Duyệt phiếu thất bại: ${errorMessage}`);
            }
          }
        };
        const handleReject = async () => {
          try {
            await healthCheckApi.rejectHealthCheck(
              validHealthCheck.healthCheckId || validHealthCheck.id
            );
            message.success("Từ chối phiếu sức khỏe thành công!");
            fetchAllData();
          } catch (err) {
            message.error("Từ chối phiếu sức khỏe thất bại!");
          }
        };
        return (
          <div style={{ display: "flex", gap: 8 }}>
            <Button
              className="management-action-btn"
              onClick={() => {
                setSelectedDonation(record);
                setModalVisible(true);
              }}
            >
              Chi tiết
            </Button>
            {/* Nếu chưa có phiếu sức khỏe */}
            {status === "none" && (
              <Button
                className="management-action-btn primary"
                type="primary"
                onClick={() =>
                  (window.location.href = "/staff/create-health-forms")
                }
              >
                Tạo phiếu sức khỏe
              </Button>
            )}
            {/* Nếu phiếu chờ duyệt */}
            {status === "pending" && (
              <>
                <Button className="management-action-btn primary" type="primary" onClick={handleApprove}>
                  Duyệt
                </Button>
                <Popconfirm
                  title="Bạn chắc chắn muốn từ chối phiếu sức khỏe này?"
                  onConfirm={handleReject}
                  okText="Từ chối"
                  cancelText="Hủy"
                >
                  <Button className="management-action-btn danger" danger>Từ chối</Button>
                </Popconfirm>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="blood-donation-management-container">
      <h2 className="management-title">Quản lý yêu cầu hiến máu</h2>
      <Table
        rowKey="donationId"
        loading={loading}
        columns={columns}
        dataSource={donations}
        pagination={{ pageSize: 10 }}
      />
      <Modal
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        title={
          <div
            style={{
              fontWeight: 700,
              fontSize: 24,
              color: "#fff",
              background: "#1976D2",
              borderRadius: "12px 12px 0 0",
              padding: "18px 0 18px 32px",
              margin: "-24px -24px 24px -24px",
            }}
          >
            Chi tiết yêu cầu hiến máu
          </div>
        }
        footer={null}
        styles={{
          body: {
            background: "#f8fafc",
            borderRadius: "0 0 12px 12px",
            padding: 0,
          }
        }}
        style={{ borderRadius: 16, overflow: "hidden", minWidth: 700 }}
      >
        {selectedDonation && (
          <Tabs
            defaultActiveKey="donation"
            style={{ padding: "0 24px 16px 24px" }}
            tabBarStyle={{ fontWeight: 600, fontSize: 18 }}
          >
            <Tabs.TabPane
              tab={<span style={{ fontWeight: 600 }}>Đơn hiến máu</span>}
              key="donation"
            >
              <div
                style={{
                  background: "#fff",
                  borderRadius: 10,
                  padding: 32,
                  boxShadow: "0 2px 8px #e3e8ee",
                  fontSize: 15,
                  maxHeight: 600,
                  overflow: "auto",
                }}
              >
                {renderDetailTable(selectedDonation, {
                  donationId: "Mã đơn",
                  donorId: "Mã người hiến",
                  fullName: "Họ tên",
                  phoneNumber: "Số điện thoại",
                  email: "Email",
                  address: "Địa chỉ",
                  userIdCard: "CCCD/CMND",
                  bloodType: "Nhóm máu",
                  donationDate: "Ngày hiến máu",
                  status: "Trạng thái",
                  notes: "Ghi chú",
                  requestDescription: "Mô tả yêu cầu",
                })}
              </div>
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={<span style={{ fontWeight: 600 }}>Phiếu sức khỏe</span>}
              key="healthcheck"
            >
              {(() => {
                const donorId = selectedDonation.donorId;
                const validHealthCheck = healthChecks.find((hc) => {
                  const status = (
                    hc.status ||
                    hc.healthCheckStatus ||
                    hc.HealthCheck_Status ||
                    ""
                  ).toLowerCase();
                  return hc.donorId === donorId && status !== "used";
                });
                if (!validHealthCheck) {
                  return (
                    <div
                      style={{
                        background: "#fff",
                        borderRadius: 10,
                        padding: 32,
                        textAlign: "center",
                        color: "#888",
                        fontSize: 16,
                        boxShadow: "0 2px 8px #e3e8ee",
                      }}
                    >
                      Chưa có phiếu sức khỏe cho đơn này
                      <br />
                      <Button
                        type="primary"
                        style={{ marginTop: 16 }}
                        onClick={() =>
                          (window.location.href = "/staff/create-health-forms")
                        }
                      >
                        Tạo phiếu sức khỏe
                      </Button>
                    </div>
                  );
                }
                const status = (
                  validHealthCheck.status ||
                  validHealthCheck.healthCheckStatus ||
                  validHealthCheck.HealthCheck_Status ||
                  ""
                ).toLowerCase();
                const handleApprove = async () => {
                  try {
                    console.log(
                      "Approving health check:",
                      validHealthCheck.healthCheckId || validHealthCheck.id
                    );
                    const result = await healthCheckApi.approveHealthCheck(
                      validHealthCheck.healthCheckId || validHealthCheck.id
                    );
                    console.log("Health check approval result:", result);

                    message.success("Duyệt phiếu sức khỏe thành công!");
                    await fetchAllData();
                  } catch (err) {
                    console.error("Health check approval error:", err);

                    // Always reload to check actual status
                    await fetchAllData();

                    // Check if it was already approved
                    const errorMsg = err.message || err.toString();
                    if (
                      errorMsg.includes("already") ||
                      errorMsg.includes("đã duyệt") ||
                      errorMsg.includes("đã")
                    ) {
                      message.success("Phiếu sức khỏe đã được duyệt!");
                    } else {
                      message.error(
                        `Duyệt phiếu sức khỏe thất bại: ${errorMsg}`
                      );
                    }
                  }
                };
                const handleReject = async () => {
                  try {
                    await healthCheckApi.rejectHealthCheck(
                      validHealthCheck.healthCheckId || validHealthCheck.id
                    );
                    message.success("Từ chối phiếu sức khỏe thành công!");
                    fetchAllData();
                  } catch (err) {
                    message.error("Từ chối phiếu sức khỏe thất bại!");
                  }
                };
                return (
                  <div
                    style={{
                      background: "#fff",
                      borderRadius: 10,
                      padding: 32,
                      boxShadow: "0 2px 8px #e3e8ee",
                      fontSize: 15,
                      maxHeight: 600,
                      overflow: "auto",
                    }}
                  >
                    {renderDetailTable(validHealthCheck, {
                      healthCheckId: "Mã phiếu",
                      donorId: "Mã người hiến",
                      weight: "Cân nặng (kg)",
                      height: "Chiều cao (cm)",
                      heartRate: "Nhịp tim",
                      temperature: "Nhiệt độ",
                      bloodPressure: "Huyết áp",
                      medicalHistory: "Tiền sử bệnh",
                      currentMedications: "Thuốc đang dùng",
                      healthCheckDate: "Ngày khám",
                      healthCheckStatus: "Trạng thái",
                    })}
                    <div style={{ marginTop: 24, textAlign: "right" }}>
                      {status !== "approved" && (
                        <Button
                          type="primary"
                          onClick={handleApprove}
                          style={{ marginRight: 12 }}
                        >
                          Duyệt phiếu sức khỏe
                        </Button>
                      )}
                      {status !== "rejected" && (
                        <Popconfirm
                          title="Bạn chắc chắn muốn từ chối phiếu sức khỏe này?"
                          onConfirm={handleReject}
                          okText="Từ chối"
                          cancelText="Hủy"
                        >
                          <Button danger>Từ chối phiếu sức khỏe</Button>
                        </Popconfirm>
                      )}
                    </div>
                  </div>
                );
              })()}
            </Tabs.TabPane>
          </Tabs>
        )}
      </Modal>
    </div>
  );
};

export default BloodDonationManagement;
