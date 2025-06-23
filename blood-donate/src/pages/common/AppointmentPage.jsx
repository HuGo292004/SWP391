import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Typography, 
  Row, 
  Col, 
  Calendar, 
  Badge, 
  Modal, 
  Descriptions, 
  Tag, 
  Empty,
  Space,
  Tooltip,
  Form,
  Select,
  DatePicker,
  TimePicker,
  Input,
  message
} from 'antd';
import { 
  CalendarOutlined, 
  ClockCircleOutlined, 
  UserOutlined, 
  HeartFilled,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  TeamOutlined,
  EditOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import moment from 'moment';
import '../../styles/pages.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const AppointmentPage = () => {
  const [selectedDate, setSelectedDate] = useState(moment());
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy role từ URL hoặc localStorage
  const getUserRole = () => {
    const pathRole = location.pathname.split('/')[1];
    if (['admin', 'staff', 'member'].includes(pathRole)) {
      return pathRole;
    }
    return localStorage.getItem('userRole') || 'guest';
  };

  const currentRole = getUserRole();
  const currentUser = localStorage.getItem('username') || 'user';

  // Mock data - Members đã đăng ký hiến máu
  const registeredMembers = [
    { id: 1, username: 'member1', fullName: 'Nguyễn Văn A', email: 'nguyenvana@gmail.com', phone: '0123456789' },
    { id: 2, username: 'member2', fullName: 'Trần Thị B', email: 'tranthib@gmail.com', phone: '0987654321' },
    { id: 3, username: 'member3', fullName: 'Lê Văn C', email: 'levanc@gmail.com', phone: '0369852147' },
  ];

  // Mock data - Appointments (phân theo role)
  const allAppointments = [
    {
      id: 1,
      memberUsername: 'member1',
      memberName: 'Nguyễn Văn A',
      date: '2025-01-25',
      time: '08:00',
      type: 'Hiến máu định kỳ',
      location: 'Bệnh viện Đại học Y Hà Nội',
      address: '1 Tôn Thất Tùng, Đống Đa, Hà Nội',
      status: 'confirmed',
      donationType: 'Máu toàn phần',
      note: 'Nhớ ăn sáng đầy đủ trước khi đến',
      bookedBy: 'staff1'
    },
    {
      id: 2,
      memberUsername: 'member1',
      memberName: 'Nguyễn Văn A',
      date: '2025-02-15',
      time: '14:30',
      type: 'Khám sức khỏe',
      location: 'Trung tâm Huyết học',
      address: '78 Giải Phóng, Hai Bà Trưng, Hà Nội',
      status: 'pending',
      donationType: 'Tiểu cầu',
      note: 'Kiểm tra tình trạng sức khỏe định kỳ',
      bookedBy: 'staff1'
    },
    {
      id: 3,
      memberUsername: 'member2',
      memberName: 'Trần Thị B',
      date: '2025-03-10',
      time: '09:15',
      type: 'Hiến máu khẩn cấp',
      location: 'Bệnh viện Bạch Mai',
      address: '78 Giải Phóng, Hai Bà Trưng, Hà Nội',
      status: 'completed',
      donationType: 'Hồng cầu',
      note: 'Đã hoàn thành hiến máu',
      bookedBy: 'staff2'
    }
  ];

  // Filter appointments theo role
  const getFilteredAppointments = () => {
    if (currentRole === 'member') {
      // Member chỉ xem lịch hẹn của mình
      return allAppointments.filter(apt => apt.memberUsername === currentUser);
    } else if (currentRole === 'staff' || currentRole === 'admin') {
      // Staff/Admin xem tất cả lịch hẹn
      return allAppointments;
    }
    return allAppointments; // Guest xem tất cả (demo)
  };

  const appointments = getFilteredAppointments();

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'blue';
      case 'pending': return 'orange';
      case 'completed': return 'green';
      case 'cancelled': return 'red';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'Đã xác nhận';
      case 'pending': return 'Chờ xác nhận';
      case 'completed': return 'Đã hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return 'Không xác định';
    }
  };

  const dateCellRender = (value) => {
    const dateStr = value.format('YYYY-MM-DD');
    const dayAppointments = appointments.filter(apt => apt.date === dateStr);
    
    return (
      <ul className="appointment-list">
        {dayAppointments.map(apt => (
          <li key={apt.id}>
            <Badge 
              status={getStatusColor(apt.status)} 
              text={
                <span className="appointment-badge-text">
                  {apt.time} - {currentRole === 'member' ? apt.type : `${apt.memberName} - ${apt.type}`}
                </span>
              }
            />
          </li>
        ))}
      </ul>
    );
  };

  const onSelectDate = (value) => {
    setSelectedDate(value);
  };

  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
    setModalVisible(true);
  };

  const handleBookNewAppointment = () => {
    if (currentRole === 'member') {
      navigate('/blood-donation-register');
    } else if (currentRole === 'staff') {
      setBookingModalVisible(true);
    }
  };

  const handleBookAppointment = (values) => {
    console.log('Booking appointment:', values);
    message.success('Đặt lịch hẹn thành công!');
    setBookingModalVisible(false);
    form.resetFields();
    // TODO: Call API to create appointment
  };

  const getUpcomingAppointments = () => {
    const today = moment();
    return appointments
      .filter(apt => moment(apt.date).isAfter(today))
      .sort((a, b) => moment(a.date).diff(moment(b.date)))
      .slice(0, 3);
  };

  const getPageTitle = () => {
    switch (currentRole) {
      case 'member':
        return 'Lịch Hẹn Của Bạn';
      case 'staff':
        return 'Quản Lý Lịch Hẹn';
      case 'admin':
        return 'Quản Lý Lịch Hẹn Hệ Thống';
      default:
        return 'Lịch Hẹn Hiến Máu';
    }
  };

  const getPageDescription = () => {
    switch (currentRole) {
      case 'member':
        return 'Theo dõi các lịch hẹn hiến máu của bạn';
      case 'staff':
        return 'Đặt lịch hẹn và quản lý lịch hẹn cho các thành viên';
      case 'admin':
        return 'Quản lý và giám sát tất cả lịch hẹn trong hệ thống';
      default:
        return 'Quản lý và theo dõi các lịch hẹn hiến máu';
    }
  };

  const getBookButtonText = () => {
    switch (currentRole) {
      case 'member':
        return 'Đăng Ký Hiến Máu';
      case 'staff':
        return 'Đặt Lịch Cho Member';
      default:
        return 'Đặt Lịch Mới';
    }
  };

  return (
    <div className="appointment-page">
      <div className="page-header">
        <div className="header-content">
          <Title level={2} className="page-title">
            <CalendarOutlined className="title-icon" />
            {getPageTitle()}
          </Title>
          <Paragraph className="page-description">
            {getPageDescription()}
          </Paragraph>
        </div>
        <Button 
          type="primary" 
          size="large" 
          icon={currentRole === 'staff' ? <TeamOutlined /> : <PlusOutlined />}
          onClick={handleBookNewAppointment}
          className="book-appointment-btn"
        >
          {getBookButtonText()}
        </Button>
      </div>

      <Row gutter={[24, 24]}>
        {/* Calendar Section */}
        <Col xs={24} lg={16}>
          <Card 
            title={
              <Space>
                <CalendarOutlined />
                <span>
                  Lịch Hẹn Tháng {selectedDate.format('MM/YYYY')}
                  {currentRole !== 'member' && (
                    <Text type="secondary" style={{ marginLeft: 8, fontSize: 14 }}>
                      ({appointments.length} lịch hẹn)
                    </Text>
                  )}
                </span>
              </Space>
            }
            className="calendar-card"
          >
            <Calendar
              value={selectedDate}
              onSelect={onSelectDate}
              dateCellRender={dateCellRender}
              headerRender={({ value, type, onChange, onTypeChange }) => (
                <div className="calendar-header">
                  <div className="calendar-title">
                    {value.format('MMMM YYYY')}
                  </div>
                  <Space>
                    <Button 
                      size="small" 
                      onClick={() => onChange(value.clone().subtract(1, 'month'))}
                    >
                      ‹
                    </Button>
                    <Button 
                      size="small" 
                      onClick={() => onChange(moment())}
                    >
                      Hôm nay
                    </Button>
                    <Button 
                      size="small" 
                      onClick={() => onChange(value.clone().add(1, 'month'))}
                    >
                      ›
                    </Button>
                  </Space>
                </div>
              )}
            />
          </Card>
        </Col>

        {/* Upcoming Appointments */}
        <Col xs={24} lg={8}>
          <Card 
            title={
              <Space>
                <ClockCircleOutlined />
                <span>Lịch Hẹn Sắp Tới</span>
              </Space>
            }
            className="upcoming-card"
          >
            {getUpcomingAppointments().length > 0 ? (
              <div className="upcoming-list">
                {getUpcomingAppointments().map(appointment => (
                  <div 
                    key={appointment.id}
                    className="upcoming-item"
                    onClick={() => handleAppointmentClick(appointment)}
                  >
                    <div className="upcoming-date">
                      <Text className="date-day">
                        {moment(appointment.date).format('DD')}
                      </Text>
                      <Text className="date-month">
                        Tháng {moment(appointment.date).format('MM')}
                      </Text>
                    </div>
                    <div className="upcoming-info">
                      <Text strong className="upcoming-type">
                        {appointment.type}
                      </Text>
                      {currentRole !== 'member' && (
                        <Text className="upcoming-member">
                          <UserOutlined /> {appointment.memberName}
                        </Text>
                      )}
                      <Text className="upcoming-time">
                        <ClockCircleOutlined /> {appointment.time}
                      </Text>
                      <Text className="upcoming-location" ellipsis>
                        {appointment.location}
                      </Text>
                      <Tag color={getStatusColor(appointment.status)} size="small">
                        {getStatusText(appointment.status)}
                      </Tag>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty 
                description={
                  currentRole === 'member' 
                    ? "Bạn chưa có lịch hẹn nào sắp tới" 
                    : "Không có lịch hẹn nào sắp tới"
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>

          {/* Quick Stats */}
          <Card className="stats-card" style={{ marginTop: 24 }}>
            <Row gutter={16}>
              <Col span={12}>
                <div className="stat-item">
                  <HeartFilled className="stat-icon completed" />
                  <div className="stat-info">
                    <Text className="stat-number">
                      {appointments.filter(apt => apt.status === 'completed').length}
                    </Text>
                    <Text className="stat-label">Đã hoàn thành</Text>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div className="stat-item">
                  <CheckCircleOutlined className="stat-icon confirmed" />
                  <div className="stat-info">
                    <Text className="stat-number">
                      {appointments.filter(apt => apt.status === 'confirmed').length}
                    </Text>
                    <Text className="stat-label">Đã xác nhận</Text>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Appointment Detail Modal */}
      <Modal
        title={
          <Space>
            <CalendarOutlined />
            <span>Chi Tiết Lịch Hẹn</span>
          </Space>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            Đóng
          </Button>,
          selectedAppointment?.status === 'confirmed' && currentRole === 'staff' && (
            <Button key="edit" type="primary" icon={<EditOutlined />}>
              Chỉnh Sửa
            </Button>
          )
        ]}
        width={600}
      >
        {selectedAppointment && (
          <Descriptions column={1} bordered>
            <Descriptions.Item 
              label="Trạng thái"
            >
              <Tag color={getStatusColor(selectedAppointment.status)}>
                {getStatusText(selectedAppointment.status)}
              </Tag>
            </Descriptions.Item>
            {currentRole !== 'member' && (
              <Descriptions.Item label="Thành viên">
                {selectedAppointment.memberName} ({selectedAppointment.memberUsername})
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Ngày hẹn">
              {moment(selectedAppointment.date).format('DD/MM/YYYY')}
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian">
              {selectedAppointment.time}
            </Descriptions.Item>
            <Descriptions.Item label="Loại lịch hẹn">
              {selectedAppointment.type}
            </Descriptions.Item>
            <Descriptions.Item label="Loại hiến máu">
              {selectedAppointment.donationType}
            </Descriptions.Item>
            <Descriptions.Item label="Địa điểm">
              {selectedAppointment.location}
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ">
              {selectedAppointment.address}
            </Descriptions.Item>
            <Descriptions.Item label="Ghi chú">
              {selectedAppointment.note}
            </Descriptions.Item>
            {currentRole !== 'member' && (
              <Descriptions.Item label="Được đặt bởi">
                {selectedAppointment.bookedBy}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* Staff Booking Modal */}
      {currentRole === 'staff' && (
        <Modal
          title={
            <Space>
              <TeamOutlined />
              <span>Đặt Lịch Hẹn Cho Member</span>
            </Space>
          }
          open={bookingModalVisible}
          onCancel={() => {
            setBookingModalVisible(false);
            form.resetFields();
          }}
          footer={null}
          width={700}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleBookAppointment}
            autoComplete="off"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="memberId"
                  label="Chọn Member"
                  rules={[{ required: true, message: 'Vui lòng chọn member!' }]}
                >
                  <Select placeholder="Chọn member đã đăng ký hiến máu">
                    {registeredMembers.map(member => (
                      <Option key={member.id} value={member.id}>
                        {member.fullName} ({member.username})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="appointmentType"
                  label="Loại lịch hẹn"
                  rules={[{ required: true, message: 'Vui lòng chọn loại lịch hẹn!' }]}
                >
                  <Select placeholder="Chọn loại lịch hẹn">
                    <Option value="regular">Hiến máu định kỳ</Option>
                    <Option value="health-check">Khám sức khỏe</Option>
                    <Option value="emergency">Hiến máu khẩn cấp</Option>
                    <Option value="follow-up">Tái khám</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="appointmentDate"
                  label="Ngày hẹn"
                  rules={[{ required: true, message: 'Vui lòng chọn ngày hẹn!' }]}
                >
                  <DatePicker 
                    style={{ width: '100%' }} 
                    format="DD/MM/YYYY"
                    disabledDate={(current) => current && current < moment().startOf('day')}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="appointmentTime"
                  label="Thời gian"
                  rules={[{ required: true, message: 'Vui lòng chọn thời gian!' }]}
                >
                  <TimePicker 
                    style={{ width: '100%' }} 
                    format="HH:mm"
                    minuteStep={15}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="donationType"
                  label="Loại hiến máu"
                  rules={[{ required: true, message: 'Vui lòng chọn loại hiến máu!' }]}
                >
                  <Select placeholder="Chọn loại hiến máu">
                    <Option value="whole-blood">Máu toàn phần</Option>
                    <Option value="platelets">Tiểu cầu</Option>
                    <Option value="red-cells">Hồng cầu</Option>
                    <Option value="plasma">Huyết tương</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="location"
                  label="Địa điểm"
                  rules={[{ required: true, message: 'Vui lòng chọn địa điểm!' }]}
                >
                  <Select placeholder="Chọn địa điểm">
                    <Option value="bv-dhy">Bệnh viện Đại học Y Hà Nội</Option>
                    <Option value="tt-huyethhoc">Trung tâm Huyết học</Option>
                    <Option value="bv-bachmai">Bệnh viện Bạch Mai</Option>
                    <Option value="bv-vietduc">Bệnh viện Việt Đức</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="note"
              label="Ghi chú"
            >
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
                  Đặt Lịch Hẹn
                </Button>
                <Button onClick={() => {
                  setBookingModalVisible(false);
                  form.resetFields();
                }}>
                  Hủy
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      )}
    </div>
  );
};

export default AppointmentPage; 