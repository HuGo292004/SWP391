// Quy tắc chuyển trạng thái hợp lệ cho các yêu cầu khẩn cấp
const STATUS_TRANSITIONS = {
  Pending: ["Opened", "Approved", "Rejected", "Done", "Closed"],
  Opened: ["Pending", "Approved", "Rejected", "Done", "Closed"],
  Approved: ["Closed"],
  Rejected: ["Closed"],
};

// Import các thư viện React và hooks cần thiết
import React, { useEffect, useState } from "react";

// Import các component từ Ant Design
import {
  Table, // Component bảng dữ liệu
  Tag, // Component tag trạng thái
  Typography, // Component typography
  Spin, // Component loading spinner
  Button, // Component nút bấm
  Modal, // Component modal
  InputNumber, // Component input số
  Select, // Component select dropdown
  Form, // Component form
  message, // Service thông báo
  Row, // Component row layout
  Col, // Component column layout  
  Card, // Component card
  Descriptions, // Component descriptions
  Badge, // Component badge
  Space, // Component space layout
  Alert, // Component alert
  List, // Component list
  Checkbox, // Component checkbox
  Divider, // Component divider
} from "antd";

// Import icons
import { ExportOutlined } from "@ant-design/icons";

// Import API service cho emergency requests
import { getAllBloodRequests } from "../../services/emergencyRequestApi";
import { bloodManagementApi } from "../../services/bloodManagementApi";
import { getCompatibleDonorBloodTypeIDs, getBloodTypeFromID } from "../../utils/bloodTypeCompatibility";

const { Title } = Typography;

// ===== Constants =====
const STATUS_ENUM = {
  Draft: 1,
  Pending: 2,
  Approved: 3,
  Done: 4,
  Rejected: 5,
  Closed: 6,
  Opened: 7,
};

const BLOOD_TYPE_MAP = {
  "11111111-1111-1111-1111-111111111001": "A+",
  "11111111-1111-1111-1111-111111111002": "A-",
  "11111111-1111-1111-1111-111111111003": "B+",
  "11111111-1111-1111-1111-111111111004": "B-",
  "11111111-1111-1111-1111-111111111005": "AB+",
  "11111111-1111-1111-1111-111111111006": "AB-",
  "11111111-1111-1111-1111-111111111007": "O+",
  "11111111-1111-1111-1111-111111111008": "O-",
};

const STATUS_OPTIONS = [
  { value: "Opened", label: "Cần hỗ trợ" },
  { value: "Pending", label: "Chờ xử lý" },
  { value: "Approved", label: "Đã duyệt" },
  { value: "Rejected", label: "Từ chối" },
  { value: "Done", label: "Hoàn thành" },
  { value: "Closed", label: "Đã đóng" },
];

const STATUS_COLORS = {
  Opened: "red",
  Pending: "gold",
  Closed: "green",
};

// ===== Helpers =====
const getAuthToken = () => {
  const keys = ["userToken", "token", "authToken", "jwtToken", "accessToken"];
  for (const key of keys) {
    const token = localStorage.getItem(key) || sessionStorage.getItem(key);
    if (token?.startsWith("eyJ") && token.length > 100) return token;
  }
  return "";
};

const getRequestUser = async (requestId) => {
  try {
    const res = await fetch(
      `http://localhost:7262/api/BloodRequest/get-request-user/${requestId}`,
      {
        headers: {
          "Content-Type": "application/json",
          ...(getAuthToken() && { Authorization: `Bearer ${getAuthToken()}` }),
        },
      }
    );
    const text = await res.text();
    const result = JSON.parse(text);
    return result?.data?.fullName || null;
  } catch {
    return null;
  }
};

// Component mapping helper
const getComponentText = (componentId) => {
  const componentMap = {
    "321FC094-8CBA-4351-8F21-167D8D974DF2": "Bạch cầu",
    "80BFD932-0D38-46DA-AD65-176CA398B66F": "Huyết tương", 
    "EEC9ADCB-1189-4647-8763-32FCE9A628C6": "Máu toàn phần",
    "349DBBD3-C98C-4D03-93A2-6692E07E3A25": "Hồng cầu",
    "2086DB63-1BA1-4AD5-9BEA-7EF69F1C1F67": "Tủa lạnh",
    "6CDE6913-37CA-41F2-B7D8-F88E8CB23E93": "Tiểu cầu",
  };
  
  const textMap = {
    "whole_blood": "Máu toàn phần",
    "red_blood_cells": "Hồng cầu", 
    "plasma": "Huyết tương",
    "platelets": "Tiểu cầu",
    "white_blood_cells": "Bạch cầu",
    "cryoprecipitate": "Tủa lạnh",
    "fresh_frozen_plasma": "Huyết tương tươi đông lạnh",
  };

  return componentMap[componentId] || textMap[componentId] || componentId;
};

// ===== Component =====
const EmergencyRequestManagement = () => {
  const [requests, setRequests] = useState([]);
  const [userNames, setUserNames] = useState({});
  const [loading, setLoading] = useState(false);
  const [detailModal, setDetailModal] = useState({
    open: false,
    data: null,
    loading: false,
  });
  const [editModal, setEditModal] = useState({
    open: false,
    data: null,
    loading: false,
  });
  const [bloodExportModal, setBloodExportModal] = useState({
    open: false,
    data: null,
    loading: false,
    availableUnits: [],
    selectedUnits: [],
  });
  const [editForm] = Form.useForm();

  // Load danh sách yêu cầu và tên người dùng
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getAllBloodRequests();
        const reqs = Array.isArray(data) ? data : [];
        setRequests(reqs);

        const names = {};
        await Promise.all(
          reqs.map(async (r) => {
            const name = await getRequestUser(r.requestId);
            if (name) names[r.requestId] = name;
          })
        );
        setUserNames(names);
      } catch {
        setRequests([]);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleViewDetail = async (record) => {
    setDetailModal({ open: true, data: null, loading: true });
    try {
      const res = await fetch(
        `http://localhost:7262/api/BloodRequest/get-request-user/${record.requestId}`,
        {
          headers: {
            "Content-Type": "application/json",
            ...(getAuthToken() && {
              Authorization: `Bearer ${getAuthToken()}`,
            }),
          },
        }
      );
      const text = await res.text();
      const result = JSON.parse(text);
      setDetailModal({
        open: true,
        data: result?.data || null,
        loading: false,
      });
    } catch {
      message.error("Không lấy được chi tiết yêu cầu");
      setDetailModal({ open: true, data: null, loading: false });
    }
  };

  const handleEdit = (record) => {
    setEditModal({ open: true, data: { ...record }, loading: false });
    editForm.setFieldsValue({
      quantityNeeded: record.quantityNeeded,
      status: record.status,
    });
  };

  const handleEditSave = async () => {
    try {
      setEditModal((prev) => ({ ...prev, loading: true }));
      const values = await editForm.validateFields();
      const old = editModal.data;

      let res;
      if (
        values.quantityNeeded === old.quantityNeeded &&
        values.status !== old.status
      ) {
        res = await fetch(
          `http://localhost:7262/api/BloodRequest/update-emergency-status/${old.requestId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              ...(getAuthToken() && {
                Authorization: `Bearer ${getAuthToken()}`,
              }),
            },
            body: JSON.stringify({
              requestId: old.requestId,
              newStatus: STATUS_ENUM[values.status],
            }),
          }
        );
      } else {
        const payload = { ...old, ...values };
        if (typeof payload.status === "string") {
          payload.status = STATUS_ENUM[payload.status];
        }
        res = await fetch(
          `http://localhost:7262/api/BloodRequest/Update-Blood-Requests/${old.requestId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              ...(getAuthToken() && {
                Authorization: `Bearer ${getAuthToken()}`,
              }),
            },
            body: JSON.stringify(payload),
          }
        );
      }

      if (!res.ok) throw new Error();
      message.success("Cập nhật thành công");
      setEditModal({ open: false, data: null, loading: false });

      setLoading(true);
      const data = await getAllBloodRequests();
      setRequests(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch {
      message.error("Cập nhật thất bại");
      setEditModal((prev) => ({ ...prev, loading: false }));
    }
  };

  // Xử lý xuất kho máu
  const handleBloodExport = async (record) => {
    try {
      setBloodExportModal({
        open: true,
        data: record,
        loading: true,
        availableUnits: [],
        selectedUnits: [],
      });

      // Lấy danh sách các nhóm máu tương thích có thể hiến cho yêu cầu này
      const compatibleBloodTypeIDs = getCompatibleDonorBloodTypeIDs(record.bloodTypeRequired);
      
      // Lấy tất cả blood units available
      const allUnits = await bloodManagementApi.getAllBloodUnits();
      
      // Lọc chỉ các units có trạng thái available và nhóm máu tương thích
      const availableUnits = allUnits.filter(unit => {
        return unit.status === 'available' && 
               compatibleBloodTypeIDs.includes(unit.bloodTypeId);
      });

      // Sắp xếp theo ngày hết hạn (ưu tiên các unit sắp hết hạn trước)
      availableUnits.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

      setBloodExportModal({
        open: true,
        data: record,
        loading: false,
        availableUnits,
        selectedUnits: [],
      });
    } catch (error) {
      console.error("Error loading blood units:", error);
      message.error("Không thể tải danh sách đơn vị máu");
      setBloodExportModal({
        open: false,
        data: null,
        loading: false,
        availableUnits: [],
        selectedUnits: [],
      });
    }
  };

  // Xử lý chọn/bỏ chọn blood unit
  const handleSelectUnit = (unitId, checked) => {
    setBloodExportModal(prev => ({
      ...prev,
      selectedUnits: checked 
        ? [...prev.selectedUnits, unitId]
        : prev.selectedUnits.filter(id => id !== unitId)
    }));
  };

  // Xác nhận xuất kho
  const handleConfirmExport = async () => {
    try {
      const { data: request, selectedUnits, availableUnits } = bloodExportModal;
      
      if (selectedUnits.length === 0) {
        message.warning("Vui lòng chọn ít nhất một đơn vị máu");
        return;
      }

      // Tính tổng số lượng máu được chọn
      const selectedUnitsData = availableUnits.filter(unit => selectedUnits.includes(unit.unitId));
      const totalExportQuantity = selectedUnitsData.reduce((sum, unit) => sum + (unit.quantity || 0), 0);

      if (totalExportQuantity > request.quantityNeeded) {
        message.warning(`Tổng số lượng xuất (${totalExportQuantity}ml) vượt quá nhu cầu (${request.quantityNeeded}ml)`);
        return;
      }

      setBloodExportModal(prev => ({ ...prev, loading: true }));

      // Cập nhật từng blood unit được chọn
      const updatePromises = selectedUnitsData.map(unit => 
        bloodManagementApi.updateBloodUnit(unit.unitId, {
          ...unit,
          status: 'used',
          requestId: request.requestId,
        })
      );

      await Promise.all(updatePromises);

      // Nếu tổng số lượng xuất >= nhu cầu, cập nhật trạng thái yêu cầu thành "Done"
      if (totalExportQuantity >= request.quantityNeeded) {
        await fetch(
          `http://localhost:7262/api/BloodRequest/update-emergency-status/${request.requestId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              ...(getAuthToken() && {
                Authorization: `Bearer ${getAuthToken()}`,
              }),
            },
            body: JSON.stringify({
              requestId: request.requestId,
              newStatus: STATUS_ENUM["Done"],
            }),
          }
        );
      }

      message.success(`Đã xuất thành công ${selectedUnits.length} đơn vị máu (${totalExportQuantity}ml)`);
      
      // Đóng modal và reload dữ liệu
      setBloodExportModal({
        open: false,
        data: null,
        loading: false,
        availableUnits: [],
        selectedUnits: [],
      });

      // Reload danh sách yêu cầu
      setLoading(true);
      const data = await getAllBloodRequests();
      setRequests(Array.isArray(data) ? data : []);
      setLoading(false);

    } catch (error) {
      console.error("Error exporting blood:", error);
      message.error("Xuất kho thất bại. Vui lòng thử lại.");
      setBloodExportModal(prev => ({ ...prev, loading: false }));
    }
  };

  const columns = [
    {
      title: "Mã yêu cầu",
      dataIndex: "requestId",
      key: "requestId",
      width: 120,
      ellipsis: true,
      render: (id) => (
        <span style={{ display: "flex", alignItems: "center" }}>
          <Button
            size="small"
            type="link"
            style={{ padding: 0, marginRight: 6 }}
            onClick={() => {
              navigator.clipboard.writeText(id);
              message.success("Đã copy mã yêu cầu");
            }}
          >
            Copy
          </Button>
          <span style={{ wordBreak: "break-word" }}>{id}</span>
        </span>
      ),
    },
    {
      title: "Tên bệnh nhân",
      dataIndex: "requestId",
      key: "userName",
      width: 170,
      render: (id) => userNames[id] || "---",
    },
    {
      title: "Nhóm máu",
      dataIndex: "bloodTypeRequired",
      key: "bloodTypeRequired",
      width: 90,
      render: (id) => BLOOD_TYPE_MAP[id] || id,
    },
    {
      title: "Số lượng (ml)",
      dataIndex: "quantityNeeded",
      key: "quantityNeeded",
      width: 110,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        const label =
          STATUS_OPTIONS.find((s) => s.value === status)?.label || status;
        return <Tag color={STATUS_COLORS[status] || "default"}>{label}</Tag>;
      },
    },
    {
      title: "Ngày yêu cầu",
      dataIndex: "requestDate",
      key: "requestDate",
      width: 140,
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 220,
      render: (_, record) => (
        <Space size="small" wrap>
          <Button
            size="small"
            onClick={() => handleViewDetail(record)}
          >
            Xem chi tiết
          </Button>
          <Button
            size="small"
            type="primary"
            onClick={() => handleEdit(record)}
          >
            Chỉnh sửa
          </Button>
          {(record.status === "Opened" || record.status === "Pending" || record.status === "Approved") && (
            <Button
              size="small"
              type="default"
              icon={<ExportOutlined />}
              style={{ 
                backgroundColor: "#52c41a", 
                borderColor: "#52c41a", 
                color: "white" 
              }}
              onClick={() => handleBloodExport(record)}
            >
              Xuất kho máu
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 32 }}>
      <Title level={3}>Quản lý yêu cầu khẩn cấp</Title>
      <Spin spinning={loading} tip="Đang tải dữ liệu...">
        <Table
          dataSource={requests}
          columns={columns}
          rowKey="requestId"
          bordered
          pagination={{ pageSize: 10 }}
        />
      </Spin>

      {/* Modal chi tiết */}
      <Modal
        open={detailModal.open}
        title="Chi tiết yêu cầu khẩn cấp"
        onCancel={() =>
          setDetailModal({ open: false, data: null, loading: false })
        }
        footer={null}
        width={480}
      >
        {detailModal.loading ? (
          <Spin />
        ) : detailModal.data ? (
          <div>
            <p>
              <b>Họ tên:</b> {detailModal.data.fullName}
            </p>
            <p>
              <b>Email:</b> {detailModal.data.email}
            </p>
            <p>
              <b>SĐT:</b> {detailModal.data.phone}
            </p>
            <p>
              <b>CMND/CCCD:</b> {detailModal.data.userIdCard}
            </p>
            <p>
              <b>Ngày sinh:</b> {detailModal.data.dateOfBirth}
            </p>
            <p>
              <b>Trạng thái:</b> {detailModal.data.status}
            </p>
            <p>
              <b>Mô tả:</b> {detailModal.data.description}
            </p>
            <p>
              <b>Số lượng cần (ml):</b> {detailModal.data.quantityNeeded}
            </p>
            <p>
              <b>Ngày yêu cầu:</b> {detailModal.data.requestDate}
            </p>
          </div>
        ) : (
          <div>Không có dữ liệu</div>
        )}
      </Modal>

      {/* Modal chỉnh sửa */}
      <Modal
        open={editModal.open}
        title="Chỉnh sửa yêu cầu khẩn cấp"
        onCancel={() =>
          setEditModal({ open: false, data: null, loading: false })
        }
        onOk={handleEditSave}
        confirmLoading={editModal.loading}
        width={400}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            label="Số lượng cần (ml)"
            name="quantityNeeded"
            rules={[
              { required: true, message: "Vui lòng nhập số lượng máu cần" },
            ]}
          >
            <InputNumber min={1} max={10000} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            label="Trạng thái"
            name="status"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
          >
            <Select
              options={
                STATUS_TRANSITIONS[editModal.data?.status]
                  ? STATUS_TRANSITIONS[editModal.data.status]
                      .filter(
                        (s) =>
                          s !== editModal.data.status &&
                          s !== "Done" &&
                          s !== "Approved" &&
                          s !== "Rejected"
                      )
                      .map((s) => STATUS_OPTIONS.find((opt) => opt.value === s))
                      .filter(Boolean)
                  : STATUS_OPTIONS.filter(
                      (opt) =>
                        opt.value !== "Done" &&
                        opt.value !== "Approved" &&
                        opt.value !== "Rejected"
                    )
              }
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal xuất kho máu */}
      <Modal
        open={bloodExportModal.open}
        title={
          <div>
            <span style={{ marginRight: 16 }}>Xuất kho máu</span>
            {bloodExportModal.data && (
              <Tag color="blue">
                Yêu cầu {getBloodTypeFromID(bloodExportModal.data.bloodTypeRequired)} - {bloodExportModal.data.quantityNeeded}ml
              </Tag>
            )}
          </div>
        }
        onCancel={() =>
          setBloodExportModal({
            open: false,
            data: null,
            loading: false,
            availableUnits: [],
            selectedUnits: [],
          })
        }
        onOk={handleConfirmExport}
        confirmLoading={bloodExportModal.loading}
        width={800}
        okText="Xác nhận xuất kho"
        cancelText="Hủy"
      >
        {bloodExportModal.loading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>Đang tải danh sách đơn vị máu...</div>
          </div>
        ) : (
          <div>
            {bloodExportModal.data && (
              <Card style={{ marginBottom: 16 }}>
                <Descriptions title="Thông tin yêu cầu" size="small" column={2}>
                  <Descriptions.Item label="Mã yêu cầu">
                    {bloodExportModal.data.requestId}
                  </Descriptions.Item>
                  <Descriptions.Item label="Nhóm máu cần">
                    <Tag color="red">
                      {getBloodTypeFromID(bloodExportModal.data.bloodTypeRequired)}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Số lượng cần">
                    {bloodExportModal.data.quantityNeeded} ml
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái">
                    <Tag color={STATUS_COLORS[bloodExportModal.data.status] || "default"}>
                      {STATUS_OPTIONS.find(s => s.value === bloodExportModal.data.status)?.label || bloodExportModal.data.status}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}

            {bloodExportModal.selectedUnits.length > 0 && (
              <Alert
                message={`Đã chọn ${bloodExportModal.selectedUnits.length} đơn vị máu - Tổng: ${
                  bloodExportModal.availableUnits
                    .filter(unit => bloodExportModal.selectedUnits.includes(unit.unitId))
                    .reduce((sum, unit) => sum + (unit.quantity || 0), 0)
                }ml`}
                type="info"
                style={{ marginBottom: 16 }}
              />
            )}

            <Divider>Danh sách đơn vị máu có sẵn</Divider>

            {bloodExportModal.availableUnits.length === 0 ? (
              <Alert
                message="Không có đơn vị máu phù hợp"
                description="Hiện tại không có đơn vị máu nào có trạng thái available và nhóm máu tương thích với yêu cầu này."
                type="warning"
                showIcon
              />
            ) : (
              <List
                dataSource={bloodExportModal.availableUnits}
                renderItem={(unit) => {
                  const isSelected = bloodExportModal.selectedUnits.includes(unit.unitId);
                  const daysToExpiry = Math.ceil((new Date(unit.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <List.Item
                      style={{
                        backgroundColor: isSelected ? "#f6ffed" : "white",
                        border: isSelected ? "1px solid #52c41a" : "1px solid #f0f0f0",
                        borderRadius: 8,
                        marginBottom: 8,
                        padding: "12px 16px",
                      }}
                    >
                      <Row style={{ width: "100%" }} align="middle">
                        <Col span={2}>
                          <Checkbox
                            checked={isSelected}
                            onChange={(e) => handleSelectUnit(unit.unitId, e.target.checked)}
                          />
                        </Col>
                        <Col span={5}>
                          <div>
                            <div style={{ fontWeight: "bold" }}>{unit.unitId}</div>
                            <div style={{ fontSize: "12px", color: "#666" }}>
                              {unit.donationId}
                            </div>
                          </div>
                        </Col>
                        <Col span={4}>
                          <Tag color="blue">
                            {getBloodTypeFromID(unit.bloodTypeId)}
                          </Tag>
                        </Col>
                        <Col span={3}>
                          <Badge count={`${unit.quantity}ml`} color="#108ee9" />
                        </Col>
                        <Col span={4}>
                          <Tag color="purple" size="small">
                            {getComponentText(unit.componentType)}
                          </Tag>
                        </Col>
                        <Col span={4}>
                          <div style={{ fontSize: "12px" }}>
                            HSD: {unit.expiryDate}
                          </div>
                          {daysToExpiry <= 7 && (
                            <Tag color={daysToExpiry <= 3 ? "red" : "orange"} size="small">
                              Còn {daysToExpiry} ngày
                            </Tag>
                          )}
                        </Col>
                        <Col span={3}>
                          <Tag color="green" size="small">
                            {unit.status}
                          </Tag>
                        </Col>
                      </Row>
                    </List.Item>
                  );
                }}
              />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EmergencyRequestManagement;
