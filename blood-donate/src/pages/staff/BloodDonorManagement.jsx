// Import các thư viện React và hooks cần thiết
import React, { useState } from "react";

// Import các component từ Ant Design
import {
  Card, // Component card container
  Table, // Component bảng dữ liệu
  Button, // Component nút bấm
  Typography, // Component typography
  Space, // Component khoảng cách
  Tag, // Component tag
  Input, // Component input
  Select, // Component select
  Row, // Component hàng grid
  Col, // Component cột grid
  Statistic, // Component thống kê
  Modal, // Component modal
  Descriptions, // Component mô tả
  Form, // Component form
  DatePicker, // Component chọn ngày
  TimePicker, // Component chọn giờ
  message, // Service thông báo
  Avatar, // Component avatar
  Tooltip, // Component tooltip
} from "antd";

// Import các icon từ Ant Design
import {
  UserOutlined, // Icon người dùng
  CalendarOutlined, // Icon lịch
  SearchOutlined,
  FilterOutlined,
  HeartFilled,
  PlusOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import moment from "moment";
import "../../styles/pages.css";

const { Title, Text } = Typography;

const { Search } = Input;

const BloodDonorManagement = () => {
  const [searchText, setSearchText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [appointmentModalVisible, setAppointmentModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Mock data - Registered donors
  const donorsData = [
    {
      key: "1",
      id: 1,
      username: "member1",
      fullName: "Nguyễn Văn A",
      email: "nguyenvana@gmail.com",
      phone: "0123456789",
      bloodType: "O+",
      gender: "Nam",
      dateOfBirth: "1990-05-15",
      registrationDate: "2024-12-01",
      lastDonation: "2024-11-15",
      totalDonations: 5,
      status: "active",
      nextEligibleDate: "2025-02-15",
      healthStatus: "good",
      address: "Hà Nội",
    },
    {
      key: "2",
      id: 2,
      username: "member2",
      fullName: "Trần Thị B",
      email: "tranthib@gmail.com",
      phone: "0987654321",
      bloodType: "A+",
      gender: "Nữ",
      dateOfBirth: "1992-08-20",
      registrationDate: "2024-11-20",
      lastDonation: "2024-10-20",
      totalDonations: 3,
      status: "active",
      nextEligibleDate: "2025-01-20",
      healthStatus: "good",
      address: "TP.HCM",
    },
    {
      key: "3",
      id: 3,
      username: "member3",
      fullName: "Lê Văn C",
      email: "levanc@gmail.com",
      phone: "0369852147",
      bloodType: "B+",
      gender: "Nam",
      dateOfBirth: "1988-12-10",
      registrationDate: "2024-10-15",
      lastDonation: "2024-12-10",
      totalDonations: 7,
      status: "temporarily_ineligible",
      nextEligibleDate: "2025-03-10",
      healthStatus: "recovering",
      address: "Đà Nẵng",
    },
    {
      key: "4",
      id: 4,
      username: "member4",
      fullName: "Phạm Thị D",
      email: "phamthid@gmail.com",
      phone: "0456789123",
      bloodType: "AB+",
      gender: "Nữ",
      dateOfBirth: "1995-03-25",
      registrationDate: "2024-12-15",
      lastDonation: null,
      totalDonations: 0,
      status: "new",
      nextEligibleDate: "2025-01-15",
      healthStatus: "good",
      address: "Hải Phòng",
    },
  ];

  // Filter data based on search and status
  const filteredData = donorsData.filter((donor) => {
    const matchSearch =
      donor.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
      donor.email.toLowerCase().includes(searchText.toLowerCase()) ||
      donor.phone.includes(searchText);
    const matchStatus =
      selectedStatus === "all" || donor.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "green";
      case "temporarily_ineligible":
        return "orange";
      case "new":
        return "blue";
      case "inactive":
        return "red";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "active":
        return "Đang hoạt động";
      case "temporarily_ineligible":
        return "tạm thời không đủ điều kiện";
      case "new":
        return "Thành viên mới";
      case "inactive":
        return "Không hoạt động";
      default:
        return "Không xác định";
    }
  };

  const handleViewDetails = (donor) => {
    setSelectedDonor(donor);
    setModalVisible(true);
  };

  const handleBookAppointment = (donor) => {
    setSelectedDonor(donor);
    setAppointmentModalVisible(true);
  };

  const handleSubmitAppointment = (values) => {
    console.log("Booking appointment for:", selectedDonor.fullName, values);
    message.success(
      `Đã đặt lịch hẹn cho ${selectedDonor.fullName} thành công!`
    );
    setAppointmentModalVisible(false);
    form.resetFields();
  };

  const columns = [
    {
      title: "Thành viên",
      dataIndex: "fullName",
      key: "fullName",
      render: (text, record) => (
        <Space>
          <Avatar
            icon={<UserOutlined />}
            style={{ backgroundColor: "#1976d2" }}
          />
          <div>
            <div style={{ fontWeight: 600 }}>{text}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.username} • {record.bloodType}
            </Text>
          </div>
        </Space>
      ),
      width: 200,
    },
    {
      title: "Liên hệ",
      dataIndex: "contact",
      key: "contact",
      render: (_, record) => (
        <div>
          <div>{record.email}</div>
          <Text type="secondary">{record.phone}</Text>
        </div>
      ),
      width: 200,
    },
    {
      title: "Thống kê hiến máu",
      dataIndex: "donations",
      key: "donations",
      render: (_, record) => (
        <div>
          <div>
            <strong>{record.totalDonations}</strong> lần hiến
          </div>
          <Text type="secondary">
            Lần cuối:{" "}
            {record.lastDonation
              ? moment(record.lastDonation).format("DD/MM/YYYY")
              : "Chưa hiến"}
          </Text>
        </div>
      ),
      width: 150,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
      width: 150,
    },
    {
      title: "Ngày có thể hiến tiếp",
      dataIndex: "nextEligibleDate",
      key: "nextEligibleDate",
      render: (date) => moment(date).format("DD/MM/YYYY"),
      width: 150,
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Đặt lịch hẹn">
            <Button
              type="text"
              icon={<CalendarOutlined />}
              onClick={() => handleBookAppointment(record)}
              disabled={record.status === "temporarily_ineligible"}
            />
          </Tooltip>
        </Space>
      ),
      width: 100,
    },
  ];

  const stats = [
    {
      title: "Tổng thành viên",
      value: donorsData.length,
      icon: <TeamOutlined />,
      color: "#1976d2",
    },
    {
      title: "Đang hoạt động",
      value: donorsData.filter((d) => d.status === "active").length,
      icon: <CheckCircleOutlined />,
      color: "#16a34a",
    },
    {
      title: "Thành viên mới",
      value: donorsData.filter((d) => d.status === "new").length,
      icon: <PlusOutlined />,
      color: "#0ea5e9",
    },
    {
      title: "Tạm không đủ ĐK",
      value: donorsData.filter((d) => d.status === "temporarily_ineligible")
        .length,
      icon: <ClockCircleOutlined />,
      color: "#f59e0b",
    },
  ];

  return (
    <div className="donor-management-page">
      <div className="page-header">
        <div className="header-content">
          <Title level={2} className="page-title">
            <TeamOutlined className="title-icon" />
            Quản Lý Người Hiến Máu
          </Title>
          <Text className="page-description">
            Quản lý danh sách và đặt lịch hẹn cho các thành viên đã đăng ký hiến
            máu
          </Text>
        </div>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {stats.map((stat, index) => (
          <Col xs={12} sm={6} key={index}>
            <Card className="stat-card">
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={
                  <span style={{ color: stat.color, fontSize: 20 }}>
                    {stat.icon}
                  </span>
                }
                valueStyle={{ color: stat.color, fontWeight: 600 }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Search and Filter */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Tìm kiếm theo tên, email, SĐT..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              value={selectedStatus}
              onChange={setSelectedStatus}
              style={{ width: "100%" }}
              prefix={<FilterOutlined />}
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="active">Đang hoạt động</Option>
              <Option value="new">Thành viên mới</Option>
              <Option value="temporarily_ineligible">Tạm không đủ ĐK</Option>
              <Option value="inactive">Không hoạt động</Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} md={10}>
            <Text type="secondary">
              Hiển thị {filteredData.length} / {donorsData.length} thành viên
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Donors Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredData}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Tổng ${total} thành viên`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Donor Details Modal */}
      <Modal
        title={
          <Space>
            <UserOutlined />
            <span>Chi tiết thành viên</span>
          </Space>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            Đóng
          </Button>,
          <Button
            key="appointment"
            type="primary"
            icon={<CalendarOutlined />}
            onClick={() => {
              setModalVisible(false);
              handleBookAppointment(selectedDonor);
            }}
            disabled={selectedDonor?.status === "temporarily_ineligible"}
          >
            Đặt lịch hẹn
          </Button>,
        ]}
        width={700}
      >
        {selectedDonor && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="Họ tên" span={2}>
              {selectedDonor.fullName}
            </Descriptions.Item>
            <Descriptions.Item label="Tên đăng nhập">
              {selectedDonor.username}
            </Descriptions.Item>
            <Descriptions.Item label="Nhóm máu">
              <Tag color="red">{selectedDonor.bloodType}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {selectedDonor.email}
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              {selectedDonor.phone}
            </Descriptions.Item>
            <Descriptions.Item label="Giới tính">
              {selectedDonor.gender}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày sinh">
              {moment(selectedDonor.dateOfBirth).format("DD/MM/YYYY")}
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ">
              {selectedDonor.address}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày đăng ký">
              {moment(selectedDonor.registrationDate).format("DD/MM/YYYY")}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={getStatusColor(selectedDonor.status)}>
                {getStatusText(selectedDonor.status)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Tổng số lần hiến">
              <strong>{selectedDonor.totalDonations}</strong> lần
            </Descriptions.Item>
            <Descriptions.Item label="Lần hiến cuối">
              {selectedDonor.lastDonation
                ? moment(selectedDonor.lastDonation).format("DD/MM/YYYY")
                : "Chưa hiến"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày có thể hiến tiếp" span={2}>
              {moment(selectedDonor.nextEligibleDate).format("DD/MM/YYYY")}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Appointment Booking Modal */}
      <Modal
        title={
          <Space>
            <CalendarOutlined />
            <span>Đặt lịch hẹn cho {selectedDonor?.fullName}</span>
          </Space>
        }
        open={appointmentModalVisible}
        onCancel={() => {
          setAppointmentModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitAppointment}
          autoComplete="off"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="appointmentType"
                label="Loại lịch hẹn"
                rules={[
                  { required: true, message: "Vui lòng chọn loại lịch hẹn!" },
                ]}
              >
                <Select placeholder="Chọn loại lịch hẹn">
                  <Option value="regular">Hiến máu định kỳ</Option>
                  <Option value="health-check">Khám sức khỏe</Option>
                  <Option value="emergency">Hiến máu khẩn cấp</Option>
                  <Option value="follow-up">Tái khám</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="donationType"
                label="Loại hiến máu"
                rules={[
                  { required: true, message: "Vui lòng chọn loại hiến máu!" },
                ]}
              >
                <Select placeholder="Chọn loại hiến máu">
                  <Option value="whole-blood">Máu toàn phần</Option>
                  <Option value="platelets">Tiểu cầu</Option>
                  <Option value="red-cells">Hồng cầu</Option>
                  <Option value="plasma">Huyết tương</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="appointmentDate"
                label="Ngày hẹn"
                rules={[{ required: true, message: "Vui lòng chọn ngày hẹn!" }]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  disabledDate={(current) =>
                    current && current < moment().startOf("day")
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="appointmentTime"
                label="Thời gian"
                rules={[
                  { required: true, message: "Vui lòng chọn thời gian!" },
                ]}
              >
                <TimePicker
                  style={{ width: "100%" }}
                  format="HH:mm"
                  minuteStep={15}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="location"
            label="Địa điểm"
            rules={[{ required: true, message: "Vui lòng chọn địa điểm!" }]}
          >
            <Select placeholder="Chọn địa điểm">
              <Option value="bv-dhy">Bệnh viện Đại học Y Hà Nội</Option>
              <Option value="tt-huyethhoc">Trung tâm Huyết học</Option>
              <Option value="bv-bachmai">Bệnh viện Bạch Mai</Option>
              <Option value="bv-vietduc">Bệnh viện Việt Đức</Option>
            </Select>
          </Form.Item>

          <Form.Item name="note" label="Ghi chú">
            <Input.TextArea
              rows={3}
              placeholder="Ghi chú cho lịch hẹn (tùy chọn)"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<CheckCircleOutlined />}
              >
                Đặt lịch hẹn
              </Button>
              <Button
                onClick={() => {
                  setAppointmentModalVisible(false);
                  form.resetFields();
                }}
              >
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BloodDonorManagement;
