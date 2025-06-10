import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Typography, 
  Space, 
  Button,
  Table,
  Tag,
  Progress,
  Calendar,
  Badge,
  List,
  Avatar
} from 'antd';
import { 
  HeartFilled, 
  CalendarOutlined, 
  UserOutlined, 
  MedicineBoxOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const StaffDashboard = () => {
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    // Get user info from localStorage
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('userRole');
    setUserInfo({ username, role });
  }, []);

  // Mock data for staff dashboard
  const todayStats = [
    {
      title: "Lượt hiến máu hôm nay",
      value: 23,
      prefix: <HeartFilled />,
      suffix: "lượt",
      status: "success"
    },
    {
      title: "Người đăng ký mới",
      value: 8,
      prefix: <UserOutlined />,
      suffix: "người",
      status: "processing"
    },
    {
      title: "Cuộc hẹn đã hoàn thành",
      value: 18,
      prefix: <CheckCircleOutlined />,
      suffix: "cuộc",
      status: "success"
    },
    {
      title: "Đang chờ xử lý",
      value: 5,
      prefix: <ClockCircleOutlined />,
      suffix: "yêu cầu",
      status: "warning"
    }
  ];

  const todayAppointments = [
    {
      id: 1,
      time: "09:00",
      donor: "Nguyễn Văn A",
      bloodType: "O+",
      status: "completed",
      phone: "0901234567"
    },
    {
      id: 2,
      time: "10:30",
      donor: "Trần Thị B",
      bloodType: "A+",
      status: "in-progress",
      phone: "0912345678"
    },
    {
      id: 3,
      time: "14:00",
      donor: "Lê Văn C",
      bloodType: "B-",
      status: "scheduled",
      phone: "0923456789"
    },
    {
      id: 4,
      time: "15:30",
      donor: "Phạm Thị D",
      bloodType: "AB+",
      status: "scheduled",
      phone: "0934567890"
    },
    {
      id: 5,
      time: "16:45",
      donor: "Hoàng Văn E",
      bloodType: "O-",
      status: "scheduled",
      phone: "0945678901"
    }
  ];

  const urgentRequests = [
    {
      id: 1,
      hospital: "Bệnh viện Bạch Mai",
      bloodType: "O-",
      quantity: 5,
      urgency: "critical",
      time: "30 phút trước"
    },
    {
      id: 2,
      hospital: "Bệnh viện Việt Đức",
      bloodType: "AB+",
      quantity: 3,
      urgency: "high",
      time: "1 giờ trước"
    },
    {
      id: 3,
      hospital: "Bệnh viện K",
      bloodType: "A+",
      quantity: 8,
      urgency: "medium",
      time: "2 giờ trước"
    }
  ];

  const appointmentColumns = [
    {
      title: 'Thời gian',
      dataIndex: 'time',
      key: 'time',
      render: (time) => <Text strong>{time}</Text>
    },
    {
      title: 'Người hiến',
      dataIndex: 'donor',
      key: 'donor',
      render: (name, record) => (
        <Space>
          <Avatar style={{ backgroundColor: '#1976D2' }}>
            {name.charAt(0)}
          </Avatar>
          <div>
            <div>{name}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>{record.phone}</Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Nhóm máu',
      dataIndex: 'bloodType',
      key: 'bloodType',
      render: (type) => (
        <Tag color="red" style={{ fontWeight: 'bold' }}>{type}</Tag>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          completed: { color: 'green', text: 'Hoàn thành' },
          'in-progress': { color: 'blue', text: 'Đang thực hiện' },
          scheduled: { color: 'orange', text: 'Đã lên lịch' }
        };
        return (
          <Tag color={statusConfig[status].color}>
            {statusConfig[status].text}
          </Tag>
        );
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          {record.status === 'scheduled' && (
            <Button type="link" size="small">Bắt đầu</Button>
          )}
          {record.status === 'in-progress' && (
            <Button type="link" size="small">Hoàn thành</Button>
          )}
          <Button type="link" size="small">Chi tiết</Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0, color: '#1976D2' }}>
          🩺 Staff Dashboard
        </Title>
        <Text type="secondary">
          Chào mừng, {userInfo?.username} - Nhân viên y tế
        </Text>
      </div>

      {/* Today Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        {todayStats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.prefix}
                suffix={stat.suffix}
                valueStyle={{ 
                  color: stat.status === 'success' ? '#3f8600' : 
                         stat.status === 'warning' ? '#cf1322' : '#1976D2' 
                }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        {/* Today's Appointments */}
        <Col xs={24} lg={16}>
          <Card 
            title={
              <Space>
                <CalendarOutlined />
                <span>Lịch hiến máu hôm nay</span>
              </Space>
            }
            extra={<Button type="link">Xem tất cả</Button>}
          >
            <Table
              dataSource={todayAppointments}
              columns={appointmentColumns}
              pagination={false}
              size="small"
              rowKey="id"
            />
          </Card>
        </Col>

        {/* Urgent Requests */}
        <Col xs={24} lg={8}>
          <Card 
            title={
              <Space>
                <ExclamationCircleOutlined />
                <span>Yêu cầu khẩn cấp</span>
              </Space>
            }
            extra={<Button type="link">Xem tất cả</Button>}
          >
            <List
              itemLayout="vertical"
              size="small"
              dataSource={urgentRequests}
              renderItem={item => (
                <List.Item
                  extra={
                    <Tag color={
                      item.urgency === 'critical' ? 'red' :
                      item.urgency === 'high' ? 'orange' : 'blue'
                    }>
                      {item.urgency === 'critical' ? 'Cực kỳ khẩn cấp' :
                       item.urgency === 'high' ? 'Khẩn cấp' : 'Bình thường'}
                    </Tag>
                  }
                >
                  <List.Item.Meta
                    title={item.hospital}
                    description={
                      <Space direction="vertical" size="small">
                        <Text>
                          <Text strong>Nhóm máu:</Text> {item.bloodType} - {item.quantity} đơn vị
                        </Text>
                        <Text type="secondary">{item.time}</Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24} lg={16}>
          <Card title="Thao tác nhanh">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Button type="primary" block size="large" icon={<HeartFilled />}>
                  Đăng ký hiến máu
                </Button>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Button type="default" block size="large" icon={<CalendarOutlined />}>
                  Xem lịch hẹn
                </Button>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Button type="default" block size="large" icon={<MedicineBoxOutlined />}>
                  Kiểm tra kho máu
                </Button>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Button type="default" block size="large" icon={<FileTextOutlined />}>
                  Báo cáo
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Mục tiêu hôm nay">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text>Lượt hiến máu:</Text>
                <Progress percent={92} strokeColor="#52c41a" />
                <Text type="secondary">23/25 lượt</Text>
              </div>
              <div>
                <Text>Hoàn thành cuộc hẹn:</Text>
                <Progress percent={78} strokeColor="#1890ff" />
                <Text type="secondary">18/23 cuộc</Text>
              </div>
              <div>
                <Text>Chất lượng dịch vụ:</Text>
                <Progress percent={95} strokeColor="#faad14" />
                <Text type="secondary">4.8/5.0 sao</Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StaffDashboard; 