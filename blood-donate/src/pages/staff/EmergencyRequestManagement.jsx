// Quy tắc chuyển trạng thái hợp lệ cho các yêu cầu khẩn cấp
const STATUS_TRANSITIONS = {
  Pending: ["Opened", "Approved", "Rejected", "Done", "Closed"],
  Opened: ["Pending", "Approved", "Rejected", "Done", "Closed"],
  Approved: ["Closed"],
  Rejected: ["Closed"],
};

// Import các thư viện React và hooks cần thiết
import React, { useEffect, useState } from "react";

// Import CSS
import "../../styles/EmergencyRequestManagement.css";

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
  Input, // Component input
  DatePicker, // Component date picker
  Statistic, // Component statistic
} from "antd";

// Import icons
import {
  ExportOutlined,
  SearchOutlined,
  ReloadOutlined,
  FilterOutlined,
} from "@ant-design/icons";

// Import API service cho emergency requests
import { getAllBloodRequests } from "../../services/emergencyRequestApi";
import { bloodManagementApi } from "../../services/bloodManagementApi";
import {
  getCompatibleDonorBloodTypeIDs,
  getBloodTypeFromID,
} from "../../utils/bloodTypeCompatibility";

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

// Component mapping helper với thông tin chi tiết
const getComponentText = (componentId) => {
  // Chuyển componentId về uppercase để đồng nhất
  const normalizedId = componentId ? componentId.toUpperCase() : "";

  const componentMap = {
    "321FC094-8CBA-4351-8F21-167D8D974DF2": "Bạch cầu",
    "80BFD932-0D38-46DA-AD65-176CA398B66F": "Huyết tương",
    "EEC9ADCB-1189-4647-8763-32FCE9A628C6": "Máu toàn phần",
    "349DBBD3-C98C-4D03-93A2-6692E07E3A25": "Hồng cầu",
    "2086DB63-1BA1-4AD5-9BEA-7EF69F1C1F67": "Tủa lạnh",
    "6CDE6913-37CA-41F2-B7D8-F88E8CB23E93": "Tiểu cầu",
  };

  const textMap = {
    whole_blood: "Máu toàn phần",
    red_blood_cells: "Hồng cầu",
    plasma: "Huyết tương",
    platelets: "Tiểu cầu",
    white_blood_cells: "Bạch cầu",
    cryoprecipitate: "Tủa lạnh",
    fresh_frozen_plasma: "Huyết tương tươi đông lạnh",
  };

  // Tìm kiếm theo normalizedId trước
  const result =
    componentMap[normalizedId] || textMap[normalizedId.toLowerCase()];

  if (result) {
    return result;
  }

  // Nếu không tìm thấy, tìm kiếm trong tất cả keys với case-insensitive
  for (const [key, value] of Object.entries(componentMap)) {
    if (key.toUpperCase() === normalizedId) {
      return value;
    }
  }

  return componentId;
};

// Hàm lấy thông tin chi tiết về thành phần máu
const getComponentDetails = (componentId) => {
  // Chuyển componentId về uppercase để đồng nhất
  const normalizedId = componentId ? componentId.toUpperCase() : "";

  const componentDetails = {
    "321FC094-8CBA-4351-8F21-167D8D974DF2": {
      name: "Bạch cầu",
      compatibility:
        "Ít khi truyền do nguy cơ phản ứng miễn dịch. Dành cho bệnh nhân suy giảm miễn dịch nghiêm trọng.",
      storage: "Phải dùng ngay sau khi tách, không bảo quản lâu dài.",
      color: "volcano",
    },
    "80BFD932-0D38-46DA-AD65-176CA398B66F": {
      name: "Huyết tương",
      compatibility:
        "Có thể truyền cho bất kỳ nhóm máu nào nếu đã được tách đông lạnh. Ưu tiên cùng nhóm.",
      storage: "Bảo quản ở -18°C hoặc thấp hơn, tối đa 1 năm.",
      color: "cyan",
    },
    "EEC9ADCB-1189-4647-8763-32FCE9A628C6": {
      name: "Máu toàn phần",
      compatibility: "Phù hợp với người cùng nhóm máu ABO và Rh.",
      storage: "Bảo quản ở nhiệt độ 1-6°C trong vòng 35 ngày.",
      color: "red",
    },
    "349DBBD3-C98C-4D03-93A2-6692E07E3A25": {
      name: "Hồng cầu",
      compatibility:
        "Thích hợp cho người thiếu máu hoặc mất máu nhiều. Cần tương thích nhóm máu ABO và Rh.",
      storage: "Bảo quản ở 1-6°C, sử dụng trong 42 ngày.",
      color: "magenta",
    },
    "2086DB63-1BA1-4AD5-9BEA-7EF69F1C1F67": {
      name: "Tủa lạnh",
      compatibility:
        "Dùng để điều trị rối loạn đông máu. Ưu tiên tương thích ABO.",
      storage: "Bảo quản ở -18°C hoặc thấp hơn, dùng trong vòng 1 năm.",
      color: "blue",
    },
    "6CDE6913-37CA-41F2-B7D8-F88E8CB23E93": {
      name: "Tiểu cầu",
      compatibility:
        "Tương thích với hệ thống ABO; không cần Rh. Dành cho bệnh nhân chảy máu hoặc giảm tiểu cầu.",
      storage: "Bảo quản ở 20-24°C và lắc nhẹ liên tục, dùng trong 5 ngày.",
      color: "orange",
    },
  };

  // Tìm kiếm component theo normalizedId
  const foundComponent =
    componentDetails[normalizedId] ||
    Object.values(componentDetails).find((comp) =>
      Object.keys(componentDetails).some(
        (key) => key.toUpperCase() === normalizedId
      )
    );

  if (foundComponent) {
    return foundComponent;
  }

  // Nếu không tìm thấy, trả về thông tin mặc định
  return {
    name: getComponentText(componentId) || componentId,
    compatibility: "Thông tin chưa có",
    storage: "Thông tin chưa có",
    color: "default",
  };
};

// ===== Component =====
const EmergencyRequestManagement = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [userNames, setUserNames] = useState({});
  const [loading, setLoading] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    status: "",
    bloodType: "",
    patientName: "",
    dateRange: null,
  });

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

  // Hàm lọc dữ liệu
  const applyFilters = (requestsData = requests, filtersData = filters) => {
    let filtered = [...requestsData];

    // Lọc theo trạng thái
    if (filtersData.status) {
      filtered = filtered.filter((req) => req.status === filtersData.status);
    }

    // Lọc theo nhóm máu
    if (filtersData.bloodType) {
      filtered = filtered.filter(
        (req) => req.bloodTypeRequired === filtersData.bloodType
      );
    }

    // Lọc theo tên bệnh nhân
    if (filtersData.patientName) {
      filtered = filtered.filter((req) => {
        const patientName = userNames[req.requestId]?.toLowerCase() || "";
        return patientName.includes(filtersData.patientName.toLowerCase());
      });
    }

    // Lọc theo khoảng thời gian
    if (filtersData.dateRange && filtersData.dateRange.length === 2) {
      const [startDate, endDate] = filtersData.dateRange;
      filtered = filtered.filter((req) => {
        const reqDate = new Date(req.requestDate);
        return reqDate >= startDate && reqDate <= endDate;
      });
    }

    setFilteredRequests(filtered);
  };

  // Hàm reset filter
  const resetFilters = () => {
    const emptyFilters = {
      status: "",
      bloodType: "",
      patientName: "",
      dateRange: null,
    };
    setFilters(emptyFilters);
    applyFilters(requests, emptyFilters);
  };

  // Hàm xử lý thay đổi filter
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    applyFilters(requests, newFilters);
  };

  // Hàm refresh dữ liệu
  const refreshData = async () => {
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
      applyFilters(reqs, filters);
    } catch {
      setRequests([]);
      setFilteredRequests([]);
    }
    setLoading(false);
  };

  // Load danh sách yêu cầu và tên người dùng
  useEffect(() => {
    refreshData();
  }, []);

  // Apply filters when userNames change
  useEffect(() => {
    applyFilters();
  }, [userNames]);

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

      await refreshData();
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
      const compatibleBloodTypeIDs = getCompatibleDonorBloodTypeIDs(
        record.bloodTypeRequired
      );

      // Lấy tất cả blood units available
      const allUnits = await bloodManagementApi.getAllBloodUnits();

      // Lọc chỉ các units có trạng thái available và nhóm máu tương thích
      const availableUnits = allUnits.filter((unit) => {
        return (
          unit.status === "available" &&
          compatibleBloodTypeIDs.includes(unit.bloodTypeId)
        );
      });

      // Sắp xếp theo ngày hết hạn (ưu tiên các unit sắp hết hạn trước)
      availableUnits.sort(
        (a, b) => new Date(a.expiryDate) - new Date(b.expiryDate)
      );

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
    setBloodExportModal((prev) => ({
      ...prev,
      selectedUnits: checked
        ? [...prev.selectedUnits, unitId]
        : prev.selectedUnits.filter((id) => id !== unitId),
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
      const selectedUnitsData = availableUnits.filter((unit) =>
        selectedUnits.includes(unit.unitId)
      );
      const totalExportQuantity = selectedUnitsData.reduce(
        (sum, unit) => sum + (unit.quantity || 0),
        0
      );

      setBloodExportModal((prev) => ({ ...prev, loading: true }));

      // Cập nhật từng blood unit được chọn
      const updatePromises = selectedUnitsData.map((unit) =>
        bloodManagementApi.updateBloodUnit(unit.unitId, {
          ...unit,
          status: "used",
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

      message.success(
        `Đã xuất thành công ${selectedUnits.length} đơn vị máu (${totalExportQuantity}ml)`
      );

      // Đóng modal và reload dữ liệu
      setBloodExportModal({
        open: false,
        data: null,
        loading: false,
        availableUnits: [],
        selectedUnits: [],
      });

      // Reload danh sách yêu cầu
      await refreshData();
    } catch (error) {
      console.error("Error exporting blood:", error);
      message.error("Xuất kho thất bại. Vui lòng thử lại.");
      setBloodExportModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const columns = [
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
          <Button size="small" onClick={() => handleViewDetail(record)}>
            Xem chi tiết
          </Button>
          <Button
            size="small"
            type="primary"
            onClick={() => handleEdit(record)}
          >
            Chỉnh sửa
          </Button>
          {(record.status === "Opened" ||
            record.status === "Pending" ||
            record.status === "Approved") && (
            <Button
              size="small"
              type="default"
              icon={<ExportOutlined />}
              style={{
                backgroundColor: "#52c41a",
                borderColor: "#52c41a",
                color: "white",
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
    <div className="emergency-management-container">
      {/* Header Section */}
      <div className="emergency-header">
        <Title level={2} className="page-title">
          <span className="title-icon">🚨</span>
          Quản lý yêu cầu khẩn cấp
        </Title>

        {/* Statistics Cards */}
        <Row gutter={16} className="stats-row">
          <Col xs={12} sm={12} md={6} lg={6}>
            <Card className="stat-card stat-total">
              <Statistic
                title="Tổng yêu cầu"
                value={requests.length}
                prefix="📋"
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} md={6} lg={6}>
            <Card className="stat-card stat-pending">
              <Statistic
                title="Chờ xử lý"
                value={
                  requests.filter(
                    (r) => r.status === "Pending" || r.status === "Opened"
                  ).length
                }
                prefix="⏳"
                valueStyle={{ color: "#faad14" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} md={6} lg={6}>
            <Card className="stat-card stat-done">
              <Statistic
                title="Hoàn thành"
                value={requests.filter((r) => r.status === "Done").length}
                prefix="🎉"
                valueStyle={{ color: "#13c2c2" }}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Filter Section */}
      <Card className="filter-card">
        <div className="filter-header">
          <Space align="center">
            <FilterOutlined style={{ fontSize: "16px", color: "#1890ff" }} />
            <span className="filter-title">Bộ lọc tìm kiếm</span>
          </Space>
          <Button
            type="link"
            onClick={resetFilters}
            className="reset-filter-btn"
          >
            Xóa bộ lọc
          </Button>
        </div>

        <Row gutter={[16, 20]} className="filter-row">
          <Col xs={24} sm={12} md={6} lg={6}>
            <div className="filter-item">
              <label className="filter-label">Trạng thái</label>
              <Select
                placeholder="Chọn trạng thái"
                value={filters.status}
                onChange={(value) => handleFilterChange("status", value)}
                allowClear
                className="filter-select"
                suffixIcon={<SearchOutlined />}
                dropdownStyle={{
                  borderRadius: "10px",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
                }}
              >
                {STATUS_OPTIONS.map((option) => (
                  <Select.Option key={option.value} value={option.value}>
                    <Tag
                      color={STATUS_COLORS[option.value] || "default"}
                      size="small"
                    >
                      {option.label}
                    </Tag>
                  </Select.Option>
                ))}
              </Select>
            </div>
          </Col>

          <Col xs={24} sm={12} md={6} lg={6}>
            <div className="filter-item">
              <label className="filter-label">Nhóm máu</label>
              <Select
                placeholder="Chọn nhóm máu"
                value={filters.bloodType}
                onChange={(value) => handleFilterChange("bloodType", value)}
                allowClear
                className="filter-select"
                suffixIcon={<SearchOutlined />}
                dropdownStyle={{
                  borderRadius: "10px",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
                }}
              >
                {Object.entries(BLOOD_TYPE_MAP).map(([id, type]) => (
                  <Select.Option key={id} value={id}>
                    <Tag color="red" size="small">
                      {type}
                    </Tag>
                  </Select.Option>
                ))}
              </Select>
            </div>
          </Col>

          <Col xs={24} sm={12} md={6} lg={6}>
            <div className="filter-item">
              <label className="filter-label">Tên bệnh nhân</label>
              <Input
                placeholder="Tìm theo tên bệnh nhân"
                value={filters.patientName}
                onChange={(e) =>
                  handleFilterChange("patientName", e.target.value)
                }
                allowClear
                className="filter-input"
                prefix={<SearchOutlined />}
              />
            </div>
          </Col>

          <Col xs={24} sm={12} md={6} lg={6}>
            <div className="filter-item">
              <label className="filter-label">Khoảng thời gian</label>
              <DatePicker.RangePicker
                value={filters.dateRange}
                onChange={(dates) => handleFilterChange("dateRange", dates)}
                placeholder={["Từ ngày", "Đến ngày"]}
                className="filter-date-picker"
                format="DD/MM/YYYY"
                dropdownClassName="filter-date-dropdown"
              />
            </div>
          </Col>
        </Row>

        <div className="filter-actions">
          <Space>
            <span className="filter-result">
              Hiển thị {filteredRequests.length} / {requests.length} yêu cầu
            </span>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={refreshData}
              loading={loading}
              className="refresh-btn"
            >
              Làm mới
            </Button>
          </Space>
        </div>
      </Card>

      {/* Table Section */}
      <Card className="table-card">
        <Spin spinning={loading} tip="Đang tải dữ liệu...">
          <Table
            dataSource={filteredRequests}
            columns={columns}
            rowKey="requestId"
            bordered={false}
            pagination={{
              pageSize: 10,
              showSizeChanger: false,
              showQuickJumper: false,
              showTotal: false,
              responsive: true,
            }}
            className="emergency-table"
            scroll={{ x: 1000 }}
          />
        </Spin>
      </Card>

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
                Yêu cầu{" "}
                {getBloodTypeFromID(bloodExportModal.data.bloodTypeRequired)} -{" "}
                {bloodExportModal.data.quantityNeeded}ml
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
            <div style={{ marginTop: 16 }}>
              Đang tải danh sách đơn vị máu...
            </div>
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
                      {getBloodTypeFromID(
                        bloodExportModal.data.bloodTypeRequired
                      )}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Số lượng cần">
                    {bloodExportModal.data.quantityNeeded} ml
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái">
                    <Tag
                      color={
                        STATUS_COLORS[bloodExportModal.data.status] || "default"
                      }
                    >
                      {STATUS_OPTIONS.find(
                        (s) => s.value === bloodExportModal.data.status
                      )?.label || bloodExportModal.data.status}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}

            {bloodExportModal.selectedUnits.length > 0 && (
              <Alert
                message={`Đã chọn ${
                  bloodExportModal.selectedUnits.length
                } đơn vị máu - Tổng: ${bloodExportModal.availableUnits
                  .filter((unit) =>
                    bloodExportModal.selectedUnits.includes(unit.unitId)
                  )
                  .reduce((sum, unit) => sum + (unit.quantity || 0), 0)}ml`}
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
                  const isSelected = bloodExportModal.selectedUnits.includes(
                    unit.unitId
                  );
                  const daysToExpiry = Math.ceil(
                    (new Date(unit.expiryDate) - new Date()) /
                      (1000 * 60 * 60 * 24)
                  );
                  const componentDetails = getComponentDetails(
                    unit.componentType
                  );

                  return (
                    <List.Item
                      style={{
                        backgroundColor: isSelected ? "#f6ffed" : "white",
                        border: isSelected
                          ? "2px solid #52c41a"
                          : "1px solid #f0f0f0",
                        borderRadius: 12,
                        marginBottom: 12,
                        padding: "16px 20px",
                        transition: "all 0.3s ease",
                        boxShadow: isSelected
                          ? "0 4px 12px rgba(82, 196, 26, 0.2)"
                          : "0 2px 8px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      <Row
                        style={{ width: "100%" }}
                        align="middle"
                        gutter={[8, 8]}
                      >
                        <Col span={3}>
                          <Checkbox
                            checked={isSelected}
                            onChange={(e) =>
                              handleSelectUnit(unit.unitId, e.target.checked)
                            }
                            style={{ transform: "scale(1.2)" }}
                          />
                        </Col>

                        <Col span={5}>
                          <Tag
                            color="blue"
                            style={{ fontWeight: "bold", fontSize: "14px" }}
                          >
                            {getBloodTypeFromID(unit.bloodTypeId)}
                          </Tag>
                        </Col>

                        <Col span={4}>
                          <Badge
                            count={`${unit.quantity}ml`}
                            color="#108ee9"
                            style={{ fontWeight: "bold", fontSize: "14px" }}
                          />
                        </Col>

                        <Col span={6}>
                          <Tag
                            color={componentDetails.color}
                            size="default"
                            style={{ fontWeight: "600", fontSize: "13px" }}
                            title={`${componentDetails.compatibility}\n\nBảo quản: ${componentDetails.storage}`}
                          >
                            {componentDetails.name}
                          </Tag>
                        </Col>

                        <Col span={6}>
                          <Tag
                            color="green"
                            size="default"
                            style={{
                              fontWeight: "600",
                              textTransform: "capitalize",
                              fontSize: "13px",
                            }}
                          >
                            {unit.status === "available"
                              ? "Sẵn sàng"
                              : unit.status}
                          </Tag>
                          {daysToExpiry <= 7 && (
                            <div style={{ marginTop: "6px" }}>
                              <Tag
                                color={daysToExpiry <= 3 ? "red" : "orange"}
                                size="small"
                                style={{
                                  fontWeight: "bold",
                                  animation:
                                    daysToExpiry <= 3
                                      ? "pulse-warning 1.5s infinite"
                                      : "none",
                                }}
                              >
                                {daysToExpiry <= 0
                                  ? "Hết hạn"
                                  : `Còn ${daysToExpiry} ngày`}
                              </Tag>
                            </div>
                          )}
                        </Col>
                      </Row>

                      {/* Thông tin chi tiết khi được chọn */}
                      {isSelected && (
                        <div
                          style={{
                            marginTop: "12px",
                            padding: "12px",
                            backgroundColor: "rgba(82, 196, 26, 0.05)",
                            borderRadius: "8px",
                            borderLeft: "4px solid #52c41a",
                          }}
                        >
                          <Row gutter={[16, 8]}>
                            <Col span={12}>
                              <div style={{ fontSize: "12px" }}>
                                <strong style={{ color: "#52c41a" }}>
                                  Tương thích:
                                </strong>
                                <div
                                  style={{ color: "#666", marginTop: "4px" }}
                                >
                                  {componentDetails.compatibility}
                                </div>
                              </div>
                            </Col>
                            <Col span={12}>
                              <div style={{ fontSize: "12px" }}>
                                <strong style={{ color: "#52c41a" }}>
                                  Bảo quản:
                                </strong>
                                <div
                                  style={{ color: "#666", marginTop: "4px" }}
                                >
                                  {componentDetails.storage}
                                </div>
                              </div>
                            </Col>
                          </Row>
                        </div>
                      )}
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
