// Import các thư viện React và hooks cần thiết
import React, { useState, useEffect } from "react";

// Import các component từ Ant Design
import {
  Card, // Component card container
  Table, // Component bảng dữ liệu
  Input, // Component input nhập liệu
  Select, // Component dropdown select
  Button, // Component nút bấm
  Row, // Component hàng grid
  Col, // Component cột grid
  Typography, // Component typography
  Space, // Component khoảng cách
  Tag, // Component tag hiển thị trạng thái
  Modal, // Component modal popup
  Form, // Component form
  InputNumber, // Component input số
  DatePicker, // Component chọn ngày
  message, // Service thông báo
  Statistic, // Component hiển thị thống kê
  Tabs, // Component tab
  Descriptions, // Component mô tả chi tiết
  Badge, // Component badge
  Alert, // Component thông báo cảnh báo
} from "antd";

// Import các icon từ Ant Design
import {
  SearchOutlined, // Icon tìm kiếm
  FilterOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  ExportOutlined,
  DatabaseOutlined,
  DropboxOutlined,
  AlertOutlined,
  ReloadOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { bloodManagementApi } from "../../services/bloodManagementApi";
import { bloodDonationApi } from "../../services/bloodDonationApi";
import userApi from "../../services/userApi";
import "../../styles/BloodInventory.css";

const { Title, Text } = Typography;
const { Option } = Select;

// Map bloodTypeID (UUID) to bloodTypeName and description
const bloodTypeMap = {
  "11111111-1111-1111-1111-111111111001": {
    name: "A+",
    description: "Nhóm máu A Rh dương",
  },
  "11111111-1111-1111-1111-111111111002": {
    name: "A-",
    description: "Nhóm máu A Rh âm",
  },
  "11111111-1111-1111-1111-111111111003": {
    name: "B+",
    description: "Nhóm máu B Rh dương",
  },
  "11111111-1111-1111-1111-111111111004": {
    name: "B-",
    description: "Nhóm máu B Rh âm",
  },
  "11111111-1111-1111-1111-111111111005": {
    name: "AB+",
    description: "Nhóm máu AB Rh dương",
  },
  "11111111-1111-1111-1111-111111111006": {
    name: "AB-",
    description: "Nhóm máu AB Rh âm",
  },
  "11111111-1111-1111-1111-111111111007": {
    name: "O+",
    description: "Nhóm máu O Rh dương",
  },
  "11111111-1111-1111-1111-111111111008": {
    name: "O-",
    description: "Nhóm máu O Rh âm",
  },
};

// Thêm mapping componentId -> componentName
const componentMap = {
  "321FC094-8CBA-4351-8F21-167D8D974DF2": "Bạch cầu",
  "80BFD932-0D38-46DA-AD65-176CA398B66F": "Huyết tương",
  "EEC9ADCB-1189-4647-8763-32FCE9A628C6": "Máu toàn phần",
  "349DBBD3-C98C-4D03-93A2-6692E07E3A25": "Hồng cầu",
  "2086DB63-1BA1-4AD5-9BEA-7EF69F1C1F67": "Tủa lạnh",
  "6CDE6913-37CA-41F2-B7D8-F88E8CB23E93": "Tiểu cầu",
};

const BloodInventory = () => {
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterBloodType, setFilterBloodType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterComponent, setFilterComponent] = useState("all");
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [updateVisible, setUpdateVisible] = useState(false);
  const [addVisible, setAddVisible] = useState(false);
  const [form] = Form.useForm();
  const [addForm] = Form.useForm();
  const [bloodUnits, setBloodUnits] = useState([]);
  const [bloodTypes, setBloodTypes] = useState([]);
  const [error, setError] = useState(null);
  const [bloodTypeQuantities, setBloodTypeQuantities] = useState([]);

  // Load data from API
  const loadBloodUnits = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await bloodManagementApi.getAllBloodUnits();
      console.log("Blood units response:", response);

      // Handle empty or invalid response
      if (!response || !Array.isArray(response)) {
        console.warn("API returned invalid data:", response);
        setBloodUnits([]);
        return;
      }

      // Lấy tất cả thông tin donations để tạo map lookup
      let donationMap = {};
      try {
        const allDonations = await bloodDonationApi.getAllBloodDonations();
        console.log("All donations response:", allDonations);
        if (Array.isArray(allDonations)) {
          donationMap = allDonations.reduce((map, donation) => {
            const donationId = donation.donationId || donation.id;
            console.log("Processing donation:", donationId, donation);
            map[donationId] = donation;
            return map;
          }, {});
          console.log("Donation map created:", donationMap);
        }
      } catch (error) {
        console.warn("Could not fetch donations for donor lookup:", error);
      }

      // Map response data to include derived fields for display
      const formattedUnits = response.map((unit, idx) => {
        console.log("Processing blood unit:", unit);
        const bloodType = bloodTypeMap[unit.bloodTypeId] || {
          name: `ID-${unit.bloodTypeId}`,
          description: "",
        };
        // Nếu có requestId thì luôn là 'used', ngược lại chuẩn hóa status
        let normalizedStatus = unit.status;
        if (unit.requestId) {
          normalizedStatus = "used";
        } else if (typeof normalizedStatus === "string") {
          normalizedStatus = normalizedStatus.toLowerCase();
        }

        // Lấy thông tin người hiến máu từ donation map
        let donorName = "Không có thông tin";
        if (unit.donationId && donationMap[unit.donationId]) {
          const donation = donationMap[unit.donationId];
          console.log("Found donation for unit:", unit.donationId, donation);
          donorName =
            donation.donorName ||
            donation.fullName ||
            donation.userName ||
            donation.name ||
            "Không có thông tin";
          console.log("Extracted donor name:", donorName);
        } else {
          console.log(
            "No donation found for unit:",
            unit.donationId,
            "Available donations:",
            Object.keys(donationMap)
          );
        }

        // Thử lấy donor name từ các field khác có thể có trong unit
        const finalDonorName =
          unit.donorName ||
          unit.donor?.name ||
          unit.donor?.fullName ||
          unit.donorFullName ||
          unit.memberName ||
          unit.userName ||
          unit.fullName ||
          donorName;

        console.log("Final donor name for unit:", unit.unitId, finalDonorName);

        // Nếu vẫn không có thông tin, thử tạo tên dummy dựa trên donationId
        const displayDonorName =
          finalDonorName !== "Không có thông tin"
            ? finalDonorName
            : unit.donationId
            ? `Người hiến ${unit.donationId.substring(0, 8)}`
            : "Không có thông tin";

        return {
          ...unit,
          status: normalizedStatus,
          bloodTypeName: bloodType.name,
          bloodTypeDescription: bloodType.description,
          donorName: displayDonorName,
          donationDate:
            unit.donationDate ||
            unit.createdDate ||
            new Date().toISOString().split("T")[0],
          location: unit.location || "Không xác định",
          createdDate:
            unit.createdDate || new Date().toISOString().split("T")[0],
          uniqueKey:
            unit.unitId ||
            (unit.donationId && unit.bloodTypeId && unit.componentType
              ? `${unit.donationId}-${unit.bloodTypeId}-${unit.componentType}`
              : `row-${idx}`),
        };
      });
      setBloodUnits(formattedUnits);
    } catch (error) {
      console.error("Error loading blood units:", error);
      setError(error.message);

      // Fallback to empty array if API fails
      setBloodUnits([]);
    } finally {
      setLoading(false);
    }
  };

  // Load blood types for filters and forms
  const loadBloodTypes = async () => {
    try {
      const response = await bloodManagementApi.getBloodTypes();

      // Handle empty or invalid response
      if (!response || !Array.isArray(response)) {
        console.warn("Blood types API returned invalid data:", response);
        throw new Error("Invalid blood types data");
      }

      setBloodTypes(response);
    } catch (error) {
      console.error("Error loading blood types:", error);
      // Set default blood types if API fails
      setBloodTypes([
        {
          bloodTypeId: "11111111-1111-1111-1111-111111111001",
          aboType: "A",
          rhFactor: "+",
        },
        {
          bloodTypeId: "11111111-1111-1111-1111-111111111002",
          aboType: "A",
          rhFactor: "-",
        },
        {
          bloodTypeId: "11111111-1111-1111-1111-111111111003",
          aboType: "B",
          rhFactor: "+",
        },
        {
          bloodTypeId: "11111111-1111-1111-1111-111111111004",
          aboType: "B",
          rhFactor: "-",
        },
        {
          bloodTypeId: "11111111-1111-1111-1111-111111111005",
          aboType: "O",
          rhFactor: "+",
        },
        {
          bloodTypeId: "11111111-1111-1111-1111-111111111006",
          aboType: "O",
          rhFactor: "-",
        },
        {
          bloodTypeId: "11111111-1111-1111-1111-111111111007",
          aboType: "AB",
          rhFactor: "+",
        },
        {
          bloodTypeId: "11111111-1111-1111-1111-111111111008",
          aboType: "AB",
          rhFactor: "-",
        },
      ]);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadBloodUnits();
    loadBloodTypes();
    // Gọi API tổng lượng máu từng loại
    bloodManagementApi.getQuantitiesByType().then((res) => {
      let result = [];
      // Nếu là object dạng {A+: 1000, ...}
      if (res && !Array.isArray(res) && typeof res === "object") {
        result = Object.entries(res).map(([bloodType, quantity]) => ({
          bloodType,
          quantity,
        }));
      }
      // Nếu là array dạng [{ bloodTypeId, aboType, rhFactor, totalUnits }]
      else if (Array.isArray(res) && res.length && res[0].aboType) {
        result = res.map((item) => ({
          bloodType: (item.aboType || "") + (item.rhFactor || ""),
          quantity: item.totalUnits || 0,
        }));
      }
      // Nếu là array dạng [{ bloodType, quantity }]
      else if (
        Array.isArray(res) &&
        res.length &&
        res[0].bloodType &&
        res[0].quantity !== undefined
      ) {
        result = res;
      }
      setBloodTypeQuantities(result);
    });
  }, []);

  // Thống kê dữ liệu
  const totalUnits = bloodUnits.length;
  const availableUnits = bloodUnits.filter(
    (unit) => unit.status === "available"
  ).length;
  const usedUnits = bloodUnits.filter((unit) => unit.status === "used").length;
  const reservedUnits = bloodUnits.filter(
    (unit) => unit.status === "reserved"
  ).length;
  const expiredUnits = bloodUnits.filter(
    (unit) => unit.status === "expired"
  ).length;
  const quarantineUnits = bloodUnits.filter(
    (unit) => unit.status === "quarantine"
  ).length;
  const totalQuantity = bloodUnits
    .filter((unit) => unit.status === "available")
    .reduce((sum, unit) => sum + unit.quantity, 0);
  const expiringSoon = bloodUnits.filter((unit) => {
    const expiry = dayjs(unit.expiryDate);
    const today = dayjs();
    return expiry.diff(today, "day") <= 7 && unit.status === "available";
  }).length;

  // Lọc dữ liệu, ẩn các bloodUnit có trạng thái 'used'
  const filteredData = bloodUnits.filter((unit) => {
    if (unit.status === "used") return false; // Ẩn các đơn vị đã sử dụng
    const matchesSearch =
      (unit.unitId &&
        unit.unitId.toLowerCase().includes(searchText.toLowerCase())) ||
      (unit.donationId &&
        unit.donationId.toLowerCase().includes(searchText.toLowerCase())) ||
      (unit.bloodTypeName &&
        unit.bloodTypeName.toLowerCase().includes(searchText.toLowerCase())) ||
      (unit.donorName &&
        unit.donorName.toLowerCase().includes(searchText.toLowerCase()));
    const matchesBloodType =
      filterBloodType === "all" || unit.bloodTypeId === filterBloodType;
    const matchesStatus =
      filterStatus === "all" || unit.status === filterStatus;
    const matchesComponent =
      filterComponent === "all" || unit.componentType === filterComponent;
    return (
      matchesSearch && matchesBloodType && matchesStatus && matchesComponent
    );
  });

  // Helper functions
  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "green";
      case "used":
        return "blue";
      case "reserved":
        return "orange";
      case "expired":
        return "red";
      case "damaged":
        return "volcano";
      case "quarantine":
        return "purple";
      case "testing":
        return "geekblue";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "available":
        return "Có sẵn";
      case "used":
        return "Đã sử dụng";
      case "expired":
        return "Hết hạn";
      default:
        return status;
    }
  };

  const getComponentText = (type) => {
    switch (type) {
      case "whole_blood":
        return "Máu toàn phần";
      case "red_blood_cells":
        return "Hồng cầu";
      case "plasma":
        return "Huyết tương";
      case "platelets":
        return "Tiểu cầu";
      case "white_blood_cells":
        return "Bạch cầu";
      case "cryoprecipitate":
        return "Tủa lạnh";
      case "fresh_frozen_plasma":
        return "Huyết tương tươi đông lạnh";
      default:
        return type;
    }
  };

  const getComponentColor = (type) => {
    switch (type) {
      case "whole_blood":
        return "red";
      case "red_blood_cells":
        return "volcano";
      case "plasma":
        return "gold";
      case "platelets":
        return "lime";
      case "white_blood_cells":
        return "geekblue";
      case "cryoprecipitate":
        return "purple";
      case "fresh_frozen_plasma":
        return "cyan";
      default:
        return "default";
    }
  };

  const checkExpiryStatus = (expiryDate) => {
    const expiry = dayjs(expiryDate);
    const today = dayjs();
    const daysLeft = expiry.diff(today, "day");

    if (daysLeft < 0)
      return { type: "expired", text: "Đã hết hạn", color: "red" };
    if (daysLeft <= 3)
      return { type: "critical", text: `Còn ${daysLeft} ngày`, color: "red" };
    if (daysLeft <= 7)
      return { type: "warning", text: `Còn ${daysLeft} ngày`, color: "orange" };
    return { type: "normal", text: `Còn ${daysLeft} ngày`, color: "green" };
  };

  // Event handlers
  const handleUpdateUnit = async (values) => {
    try {
      setLoading(true);
      
      // Prepare data for API
      const updateData = {
        ...values,
        expiryDate: values.expiryDate
          ? values.expiryDate.format("YYYY-MM-DD")
          : values.expiryDate,
      };
      
      // Call API to update blood unit
      await bloodManagementApi.updateBloodUnit(selectedUnit.unitId, updateData);
      
      // Update local state
      setBloodUnits((prev) =>
        prev.map((unit) => {
          if (unit.unitId === selectedUnit.unitId) {
            return { ...unit, ...updateData };
          }
          return unit;
        })
      );
      
      message.success("Cập nhật đơn vị máu thành công!");
      setUpdateVisible(false);
      form.resetFields();
      setSelectedUnit(null);
    } catch (error) {
      console.error("Error updating blood unit:", error);
      message.error("Không thể cập nhật đơn vị máu. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Event handlers
  const handleAddUnit = async (values) => {
    try {
      setLoading(true);

      // Prepare data for API
      const newUnitData = {
        donationId: values.donationId,
        bloodTypeId: values.bloodTypeId,
        componentType: values.componentType,
        expiryDate: values.expiryDate.format("YYYY-MM-DD"),
        status: "available",
        quantity: values.quantity,
        requestId: null,
      };

      // Call API to create blood unit
      const createdUnit = await bloodManagementApi.createBloodUnit(newUnitData);

      // Map bloodTypeID to bloodTypeName for display
      const bloodTypeMap = {
        1: "A+",
        2: "A-",
        3: "B+",
        4: "B-",
        5: "O+",
        6: "O-",
        7: "AB+",
        8: "AB-",
      };

      // Format the created unit for display
      const formattedUnit = {
        ...createdUnit,
        bloodTypeName:
          bloodTypeMap[createdUnit.bloodTypeId] ||
          `ID-${createdUnit.bloodTypeId}`,
        donorName: createdUnit.donorName || "Không có thông tin",
        donationDate:
          createdUnit.donationDate || values.donationDate.format("YYYY-MM-DD"),
        location: createdUnit.location || "Không xác định",
        createdDate: createdUnit.createdDate || dayjs().format("YYYY-MM-DD"),
        uniqueKey:
          createdUnit.unitId ||
          (createdUnit.donationId &&
          createdUnit.bloodTypeId &&
          createdUnit.componentType
            ? `${createdUnit.donationId}-${createdUnit.bloodTypeId}-${createdUnit.componentType}`
            : `row-${bloodUnits.length}`), // Ensure unique key for new units
      };

      // Update local state
      setBloodUnits((prev) => [...prev, formattedUnit]);

      message.success(
        `Thêm đơn vị máu ${createdUnit.unitId || "mới"} thành công!`
      );
      setAddVisible(false);
      addForm.resetFields();
    } catch (error) {
      console.error("Error creating blood unit:", error);
      message.error("Không thể thêm đơn vị máu. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Table columns
  const columns = [
    // Ẩn cột mã đơn vị
    // {
    //   title: 'Mã đơn vị',
    //   dataIndex: 'unitId',
    //   key: 'unitId',
    //   width: 120,
    //   fixed: 'left',
    //   render: (text) => <Text strong style={{ color: '#1890ff' }}>{text}</Text>
    // },
    {
      title: "Nhóm máu",
      dataIndex: "bloodTypeName",
      key: "bloodTypeName",
      width: 100,
      render: (text, record) => (
        <Tag
          color="blue"
          style={{ fontWeight: "bold", fontSize: "13px" }}
          title={record.bloodTypeDescription}
        >
          {text}
        </Tag>
      ),
    },
    {
      title: "Thành phần",
      dataIndex: "componentType",
      key: "componentType",
      width: 140,
      render: (text) => {
        // Normalize to string and uppercase for ID lookup, fallback to code string
        const idKey = String(text).toUpperCase();
        return (
          <Tag color={getComponentColor(text)}>
            {componentMap[idKey] || getComponentText(text) || text}
          </Tag>
        );
      },
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      render: (value) => `${value} ml`,
      sorter: (a, b) => a.quantity - b.quantity,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: "Ngày hết hạn",
      dataIndex: "expiryDate",
      key: "expiryDate",
      width: 140,
      render: (date, record) => {
        const expiryStatus = checkExpiryStatus(date);
        return (
          <div>
            <div>{dayjs(date).format("DD/MM/YYYY")}</div>
            <Text
              type={
                expiryStatus.type === "normal"
                  ? "success"
                  : expiryStatus.type === "warning"
                  ? "warning"
                  : "danger"
              }
              style={{ fontSize: "12px" }}
            >
              {expiryStatus.text}
            </Text>
          </div>
        );
      },
      sorter: (a, b) => dayjs(a.expiryDate).unix() - dayjs(b.expiryDate).unix(),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            size="small"
            title="Xem chi tiết"
            style={{ color: "#1890ff" }}
            onClick={() => {
              setSelectedUnit(record);
              setDetailVisible(true);
            }}
          />
          <Button
            type="link"
            icon={<EditOutlined />}
            size="small"
            title="Chỉnh sửa"
            style={{ color: record.status === "used" ? "#d9d9d9" : "#52c41a" }}
            onClick={() => {
              console.log("Edit button clicked for:", record.unitId);
              setSelectedUnit(record);
              // Format dữ liệu cho form
              const formData = {
                ...record,
                expiryDate: dayjs(record.expiryDate),
              };
              console.log("Form data:", formData);
              form.setFieldsValue(formData);
              setUpdateVisible(true);
            }}
            disabled={record.status === "used"}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="blood-inventory-container">
      {/* Header */}
      <div className="blood-inventory-header">
        <div className="blood-inventory-header-title-group">
          <Title level={2} className="blood-inventory-title">
            <DatabaseOutlined
              style={{ marginRight: "12px", color: "#1890ff" }}
            />
            Quản Lý Kho Máu
          </Title>
        </div>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} className="blood-inventory-stats">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng đơn vị"
              value={totalUnits}
              prefix={<DropboxOutlined style={{ color: "#1890ff" }} />}
              suffix="đơn vị"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Có sẵn"
              value={availableUnits}
              prefix={<DatabaseOutlined style={{ color: "#52c41a" }} />}
              suffix="đơn vị"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng số lượng"
              value={Math.round((totalQuantity / 1000) * 10) / 10}
              prefix={<DatabaseOutlined style={{ color: "#722ed1" }} />}
              suffix="lít"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Sắp hết hạn"
              value={expiringSoon}
              prefix={<AlertOutlined style={{ color: "#faad14" }} />}
              suffix="đơn vị"
            />
          </Card>
        </Col>
      </Row>

      {/* Tổng lượng máu từng nhóm máu */}
      <Title
        level={4}
        style={{ margin: "24px 0 8px 0", color: "#1976D2", fontWeight: 700 }}
      >
        Tổng lượng máu theo từng nhóm máu
      </Title>
      <Row gutter={[16, 16]} className="blood-inventory-quantities">
        {bloodTypeQuantities.length === 0 ? (
          <Col span={24}>
            <Alert
              type="info"
              message="Không có dữ liệu tổng hợp nhóm máu."
              showIcon
            />
          </Col>
        ) : (
          bloodTypeQuantities.map((item) => (
            <Col xs={12} sm={8} md={6} lg={4} key={item.bloodType}>
              <Card
                bordered={false}
                style={{
                  textAlign: "center",
                  borderRadius: 12,
                  boxShadow: "0 2px 8px #e3e8ee",
                }}
              >
                <Tag
                  color="red"
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    borderRadius: 8,
                    marginBottom: 8,
                  }}
                >
                  {item.bloodType}
                </Tag>
                <div
                  style={{ fontSize: 20, fontWeight: 700, color: "#1976D2" }}
                >
                  {item.quantity.toLocaleString()} ml
                </div>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* Filters */}
      <Card className="blood-inventory-filters">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} lg={8}>
            <Input
              placeholder="Tìm kiếm mã đơn vị, mã hiến máu, nhóm máu..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} sm={6} lg={4}>
            <Select
              placeholder="Nhóm máu"
              value={filterBloodType}
              onChange={setFilterBloodType}
              style={{ width: "100%" }}
            >
              <Option value="all">Tất cả</Option>
              {bloodTypes.map((type) => (
                <Option key={type.bloodTypeId} value={type.bloodTypeId}>
                  {bloodTypeMap[type.bloodTypeId]?.name ||
                    type.aboType + type.rhFactor}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} sm={6} lg={4}>
            <Select
              placeholder="Trạng thái"
              value={filterStatus}
              onChange={setFilterStatus}
              style={{ width: "100%" }}
            >
              <Option value="all">Tất cả</Option>
              <Option value="available">Có sẵn</Option>
              <Option value="used">Đã sử dụng</Option>
              <Option value="expired">Hết hạn</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} lg={4}>
            <Select
              placeholder="Thành phần"
              value={filterComponent}
              onChange={setFilterComponent}
              style={{ width: "100%" }}
            >
              <Option value="all">Tất cả</Option>
              <Option value="whole_blood">Máu toàn phần</Option>
              <Option value="red_blood_cells">Hồng cầu</Option>
              <Option value="plasma">Huyết tương</Option>
              <Option value="platelets">Tiểu cầu</Option>
              <Option value="white_blood_cells">Bạch cầu</Option>
              <Option value="cryoprecipitate">Tủa lạnh</Option>
              <Option value="fresh_frozen_plasma">
                Huyết tương tươi đông lạnh
              </Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} lg={4}>
            <Space>
              <Button
                icon={<FilterOutlined />}
                onClick={() => {
                  setSearchText("");
                  setFilterBloodType("all");
                  setFilterStatus("all");
                  setFilterComponent("all");
                }}
              >
                Xóa bộ lọc
              </Button>
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={() => {
                  loadBloodUnits();
                  loadBloodTypes();
                }}
                loading={loading}
              >
                Làm mới
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert
          message="Không thể kết nối với máy chủ"
          description="Vui lòng kiểm tra kết nối mạng và thử lại sau."
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          action={
            <Button
              size="small"
              onClick={() => {
                loadBloodUnits();
                loadBloodTypes();
              }}
            >
              Thử lại
            </Button>
          }
          style={{ marginBottom: "16px" }}
        />
      )}

      {/* No Data Alert */}
      {!loading && !error && bloodUnits.length === 0 && (
        <Alert
          message="Chưa có dữ liệu"
          description="Hiện tại chưa có đơn vị máu nào trong hệ thống. Bạn có thể thêm mới bằng nút 'Thêm đơn vị máu' ở trên."
          type="info"
          showIcon
          style={{ marginBottom: "16px" }}
        />
      )}

      {/* Alerts for expired units */}
      {expiringSoon > 0 && (
        <Alert
          message={`Cảnh báo: Có ${expiringSoon} đơn vị máu sắp hết hạn trong 7 ngày tới!`}
          type="warning"
          showIcon
          closable
          style={{ marginBottom: "16px" }}
        />
      )}

      {/* Table */}
      <Card className="blood-inventory-table">
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="uniqueKey"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} đơn vị`,
          }}
          size="middle"
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <span>
            <EyeOutlined style={{ marginRight: "8px" }} />
            Chi tiết đơn vị máu - {selectedUnit?.unitId}
          </span>
        }
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            Đóng
          </Button>,
        ]}
      >
        {selectedUnit && (
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="Mã đơn vị">
              {selectedUnit.unitId}
            </Descriptions.Item>
            <Descriptions.Item label="Mã hiến máu">
              {selectedUnit.donationId}
            </Descriptions.Item>
            <Descriptions.Item label="Nhóm máu">
              <Tag color="blue">{selectedUnit.bloodTypeName}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Thành phần">
              <Tag color={getComponentColor(selectedUnit.componentType)}>
                {componentMap[
                  String(selectedUnit.componentType).toUpperCase()
                ] ||
                  getComponentText(selectedUnit.componentType) ||
                  selectedUnit.componentType}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Số lượng">
              {selectedUnit.quantity} ml
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={getStatusColor(selectedUnit.status)}>
                {getStatusText(selectedUnit.status)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày hết hạn">
              {dayjs(selectedUnit.expiryDate).format("DD/MM/YYYY")}
            </Descriptions.Item>
            <Descriptions.Item label="Mã yêu cầu">
              {selectedUnit.requestId || "Không có"}
            </Descriptions.Item>
            <Descriptions.Item label="Người hiến máu" span={2}>
              {selectedUnit.donorName}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Update Modal */}
      <Modal
        title={
          <span>
            <EditOutlined style={{ marginRight: "8px" }} />
            Cập nhật đơn vị máu - {selectedUnit?.unitId}
          </span>
        }
        open={updateVisible}
        onCancel={() => {
          setUpdateVisible(false);
          form.resetFields();
          setSelectedUnit(null);
        }}
        onOk={() => form.submit()}
        confirmLoading={loading}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdateUnit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[
                  { required: true, message: "Vui lòng chọn trạng thái" },
                ]}
              >
                <Select 
                  placeholder="Chọn trạng thái"
                  onChange={(value) => {
                    // Tự động set ngày hết hạn thành hôm nay khi chọn "Hết hạn"
                    if (value === "expired") {
                      form.setFieldsValue({
                        expiryDate: dayjs()
                      });
                    }
                  }}
                >
                  <Option value="available">Có sẵn</Option>
                  <Option value="used">Đã sử dụng</Option>
                  <Option value="expired">Hết hạn</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="expiryDate"
                label="Ngày hết hạn"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày hết hạn" },
                ]}
              >
                <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="componentType"
                label="Thành phần máu"
                rules={[
                  { required: true, message: "Vui lòng chọn thành phần máu" },
                ]}
              >
                <Select placeholder="Chọn thành phần máu">
                  <Option value="321FC094-8CBA-4351-8F21-167D8D974DF2">
                    Bạch cầu
                  </Option>
                  <Option value="80BFD932-0D38-46DA-AD65-176CA398B66F">
                    Huyết tương
                  </Option>
                  <Option value="EEC9ADCB-1189-4647-8763-32FCE9A628C6">
                    Máu toàn phần
                  </Option>
                  <Option value="349DBBD3-C98C-4D03-93A2-6692E07E3A25">
                    Hồng cầu
                  </Option>
                  <Option value="2086DB63-1BA1-4AD5-9BEA-7EF69F1C1F67">
                    Tủa lạnh
                  </Option>
                  <Option value="6CDE6913-37CA-41F2-B7D8-F88E8CB23E93">
                    Tiểu cầu
                  </Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Add New Unit Modal */}
      <Modal
        title={
          <span>
            <PlusOutlined style={{ marginRight: "8px" }} />
            Thêm đơn vị máu mới
          </span>
        }
        open={addVisible}
        onCancel={() => {
          setAddVisible(false);
          addForm.resetFields();
        }}
        onOk={() => addForm.submit()}
        confirmLoading={loading}
        width={800}
      >
        <Form
          form={addForm}
          layout="vertical"
          onFinish={handleAddUnit}
          initialValues={{
            donationDate: dayjs(),
            expiryDate: dayjs().add(35, "day"), // Default 35 days for whole blood
            status: "available",
          }}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="donationId"
                label="Mã hiến máu"
                rules={[
                  { required: true, message: "Vui lòng nhập mã hiến máu" },
                ]}
              >
                <Input placeholder="VD: DON011" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="bloodTypeId"
                label="ID nhóm máu"
                rules={[
                  { required: true, message: "Vui lòng chọn ID nhóm máu" },
                ]}
              >
                <Select placeholder="Chọn ID nhóm máu">
                  {bloodTypes.map((type) => (
                    <Option key={type.bloodTypeId} value={type.bloodTypeId}>
                      {type.bloodTypeId} ({type.aboType}
                      {type.rhFactor})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="componentType"
                label="Thành phần"
                rules={[
                  { required: true, message: "Vui lòng chọn thành phần" },
                ]}
              >
                <Select
                  placeholder="Chọn thành phần"
                  onChange={(value) => {
                    // Auto-set expiry date based on component type
                    const expiryDays = {
                      whole_blood: 35,
                      red_blood_cells: 42,
                      plasma: 365,
                      platelets: 5,
                      cryoprecipitate: 365,
                      fresh_frozen_plasma: 365,
                    };
                    addForm.setFieldsValue({
                      expiryDate: dayjs().add(expiryDays[value] || 35, "day"),
                    });
                  }}
                >
                  <Option value="whole_blood">Máu toàn phần</Option>
                  <Option value="red_blood_cells">Hồng cầu</Option>
                  <Option value="plasma">Huyết tương</Option>
                  <Option value="platelets">Tiểu cầu</Option>
                  <Option value="white_blood_cells">Bạch cầu</Option>
                  <Option value="cryoprecipitate">Tủa lạnh</Option>
                  <Option value="fresh_frozen_plasma">
                    Huyết tương tươi đông lạnh
                  </Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="quantity"
                label="Số lượng (ml)"
                rules={[
                  { required: true, message: "Vui lòng nhập số lượng" },
                  {
                    type: "number",
                    min: 1,
                    message: "Số lượng phải lớn hơn 0",
                  },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="VD: 450"
                  min={1}
                  max={1000}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="donationDate"
                label="Ngày hiến máu"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày hiến máu" },
                ]}
              >
                <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="expiryDate"
                label="Ngày hết hạn"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày hết hạn" },
                ]}
              >
                <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
          </Row>

          <Alert
            message="Hướng dẫn"
            description="Mã đơn vị máu sẽ được tự động tạo theo định dạng UNIT###. Thông tin người hiến và vị trí lưu trữ sẽ được lấy từ mã hiến máu."
            type="info"
            showIcon
            style={{ marginTop: "16px" }}
          />
        </Form>
      </Modal>
    </div>
  );
};

export default BloodInventory;
