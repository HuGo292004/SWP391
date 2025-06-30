import React, { useState } from 'react';
import { 
  Calendar, 
  Badge, 
  Card, 
  Row, 
  Col, 
  Typography, 
  Button, 
  Space, 
  Modal, 
  Descriptions, 
  Tag,
  Empty,
  Table
} from 'antd';
import { 
  CalendarOutlined, 
  ClockCircleOutlined, 
  HeartFilled, 
  CheckCircleOutlined,
  PlusOutlined 
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import moment from 'moment';
import 'moment/locale/vi';
import '../../styles/pages.css';

const { Title, Text } = Typography;

const AppointmentPage = () => {
  // States
  const [calendarValue, setCalendarValue] = useState(moment());
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Get user role
  const getUserRole = () => {
    const pathRole = location.pathname.split('/')[1];
    if (['admin', 'staff', 'member'].includes(pathRole)) {
      return pathRole;
    }
    return localStorage.getItem('userRole') || 'guest';
  };

  const currentRole = getUserRole();
  const currentUser = localStorage.getItem('username') || 'user';

  // Mock appointments data
  const allAppointments = [
    {
      id: 1,
      memberUsername: 'member1',
      memberName: 'Nguyễn Văn A',
      date: '2025-01-25',
      time: '08:00',
      type: 'Hiến máu định kỳ',
      location: 'Bệnh viện Đại học Y Hà Nội',
      status: 'confirmed',
      donationType: 'Máu toàn phần'
    },
    {
      id: 2,
      memberUsername: 'member1',
      memberName: 'Nguyễn Văn A',
      date: '2025-01-27',
      time: '14:30',
      type: 'Khám sức khỏe',
      location: 'Trung tâm Huyết học',
      status: 'pending',
      donationType: 'Tiểu cầu'
    },
    {
      id: 3,
      memberUsername: 'member2',
      memberName: 'Trần Thị B',
      date: '2025-01-28',
      time: '09:15',
      type: 'Hiến máu khẩn cấp',
      location: 'Bệnh viện Bạch Mai',
      status: 'completed',
      donationType: 'Hồng cầu'
    }
  ];

  // Filter appointments by role
  const appointments = currentRole === 'member' 
    ? allAppointments.filter(apt => apt.memberUsername === currentUser)
    : allAppointments;

  // Status utilities
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

  // Panel change handler
  const onPanelChange = (value, mode) => {
    console.log(value.format('YYYY-MM-DD'), mode);
    setCalendarValue(value);
  };

  // Cell render for appointments
  const dateCellRender = (current) => {
    const dateStr = current.format('YYYY-MM-DD');
    const dayAppointments = appointments.filter(apt => apt.date === dateStr);

    if (dayAppointments.length === 0) return null;

    return (
      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        {dayAppointments.map((apt, idx) => (
          <li 
            key={apt.id} 
            style={{ cursor: 'pointer', marginBottom: 2 }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedAppointment(apt);
              setModalVisible(true);
            }}
          >
            <Badge
              color={getStatusColor(apt.status)}
              text={
                <span style={{ fontSize: 11 }}>
                  {idx + 1}. {apt.time} - {apt.type}
                </span>
              }
            />
          </li>
        ))}
      </ul>
    );
  };

  // Get upcoming appointments
  const getUpcomingAppointments = () => {
    const today = moment();
    return appointments
      .filter(apt => moment(apt.date + ' ' + apt.time, 'YYYY-MM-DD HH:mm').isAfter(today))
      .slice(0, 3);
  };

  // Page title based on role
  const getPageTitle = () => {
    switch (currentRole) {
      case 'member': return 'Lịch Hẹn Của Bạn';
      case 'staff': return 'Quản Lý Lịch Hẹn';
      case 'admin': return 'Quản Lý Lịch Hẹn Hệ Thống';
      default: return 'Lịch Hẹn Hiến Máu';
    }
  };

  // Table columns
  const columns = [
    {
      title: 'STT',
      render: (_, __, idx) => idx + 1,
      width: 60,
      align: 'center',
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      render: (date) => moment(date).format('DD/MM/YYYY'),
      width: 120,
    },
    {
      title: 'Giờ',
      dataIndex: 'time',
      width: 80,
    },
    {
      title: 'Loại lịch hẹn',
      dataIndex: 'type',
      width: 160,
    },
    {
      title: 'Địa điểm',
      dataIndex: 'location',
      width: 180,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 120,
      align: 'center',
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
  ];

  return (
    <div className="appointment-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <Title level={2} className="page-title">
            <CalendarOutlined className="title-icon" />
            {getPageTitle()}
          </Title>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={() => navigate('/blood-donation-register')}
          className="book-appointment-btn"
        >
          Đặt Lịch Mới
        </Button>
      </div>

      <Row gutter={[24, 24]}>
        {/* Calendar */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <Space>
                <CalendarOutlined />
                <span>Lịch Hẹn Tháng {moment().format('MM/YYYY')}</span>
              </Space>
            }
            className="calendar-card"
          >
            <Calendar />
            
            {/* Appointment Table */}
            <div style={{ marginTop: 32 }}>
              <Title level={4} style={{ marginBottom: 16 }}>
                <CalendarOutlined style={{ marginRight: 8 }} />
                Danh Sách Lịch Hẹn
              </Title>
              <Table
                columns={columns}
                dataSource={appointments.map((apt, idx) => ({ ...apt, key: apt.id }))}
                pagination={{ pageSize: 5, showSizeChanger: false }}
                size="middle"
                locale={{
                  emptyText: <Empty description="Không có lịch hẹn" />
                }}
              />
            </div>
          </Card>
        </Col>

        {/* Sidebar */}
        <Col xs={24} lg={8}>
          {/* Upcoming Appointments */}
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
                {getUpcomingAppointments().map((appointment, idx) => (
                  <div
                    key={appointment.id}
                    className="upcoming-item"
                    onClick={() => {
                      setSelectedAppointment(appointment);
                      setModalVisible(true);
                    }}
                    style={{ 
                      cursor: 'pointer', 
                      padding: 16, 
                      border: '1px solid #f0f0f0', 
                      borderRadius: 8, 
                      marginBottom: 12 
                    }}
                  >
                    <Text strong>{idx + 1}. {appointment.type}</Text>
                    <br />
                    <Text>{moment(appointment.date).format('DD/MM')} - {appointment.time}</Text>
                    <br />
                    <Text type="secondary">{appointment.location}</Text>
                    <br />
                    <Tag color={getStatusColor(appointment.status)} size="small">
                      {getStatusText(appointment.status)}
                    </Tag>
                  </div>
                ))}
              </div>
            ) : (
              <Empty description="Không có lịch hẹn sắp tới" />
            )}
          </Card>

          {/* Quick Stats */}
          <Card style={{ marginTop: 24 }}>
            <Row gutter={16}>
              <Col span={12}>
                <div style={{ textAlign: 'center' }}>
                  <HeartFilled style={{ fontSize: 24, color: '#52c41a' }} />
                  <div>
                    <Text strong style={{ fontSize: 18 }}>
                      {appointments.filter(apt => apt.status === 'completed').length}
                    </Text>
                  </div>
                  <Text type="secondary">Đã hoàn thành</Text>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ textAlign: 'center' }}>
                  <CheckCircleOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                  <div>
                    <Text strong style={{ fontSize: 18 }}>
                      {appointments.filter(apt => apt.status === 'confirmed').length}
                    </Text>
                  </div>
                  <Text type="secondary">Đã xác nhận</Text>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Appointment Detail Modal */}
      <Modal
        title="Chi Tiết Lịch Hẹn"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={600}
      >
        {selectedAppointment && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Trạng thái">
              <Tag color={getStatusColor(selectedAppointment.status)}>
                {getStatusText(selectedAppointment.status)}
              </Tag>
            </Descriptions.Item>
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
            {currentRole !== 'member' && (
              <Descriptions.Item label="Thành viên">
                {selectedAppointment.memberName}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default AppointmentPage;