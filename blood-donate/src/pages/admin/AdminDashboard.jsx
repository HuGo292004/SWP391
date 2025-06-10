import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Typography, 
  Space, 
  Table, 
  Tag, 
  Button,
  Progress,
  List,
  Avatar
} from 'antd';
import { 
  UserOutlined, 
  HeartFilled, 
  TeamOutlined, 
  MedicineBoxOutlined,
  TrophyOutlined,
  BellOutlined,
  SettingOutlined,
  BarChartOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const AdminDashboard = () => {
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    // Get user info from localStorage
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('userRole');
    setUserInfo({ username, role });
  }, []);

  // Mock data for admin dashboard
  const systemStats = [
    {
      title: "Tổng người dùng",
      value: 12847,
      prefix: <UserOutlined />,
      suffix: "người",
      status: "success"
    },
    {
      title: "Đơn vị máu thu được",
      value: 45623,
      prefix: <HeartFilled />,
      suffix: "đơn vị",
      status: "processing"
    },
    {
      title: "Số ca cấp cứu",
      value: 234,
      prefix: <MedicineBoxOutlined />,
      suffix: "ca",
      status: "warning"
    },
    {
      title: "Nhân viên hoạt động",
      value: 156,
      prefix: <TeamOutlined />,
      suffix: "người",
      status: "success"
    }
  ];

  const recentActivities = [
    {
      id: 1,
      action: "Người dùng mới đăng ký",
      user: "Nguyễn Văn A",
      time: "5 phút trước",
      type: "success"
    },
    {
      id: 2,
      action: "Hiến máu thành công",
      user: "Trần Thị B",
      time: "15 phút trước",
      type: "info"
    },
    {
      id: 3,
      action: "Yêu cầu máu khẩn cấp",
      user: "Bệnh viện C",
      time: "30 phút trước",
      type: "error"
    },
    {
      id: 4,
      action: "Cập nhật hồ sơ",
      user: "Lê Văn D",
      time: "1 giờ trước",
      type: "warning"
    }
  ];

  const bloodInventory = [
    { type: 'A+', quantity: 245, target: 300, percentage: 82 },
    { type: 'A-', quantity: 89, target: 150, percentage: 59 },
    { type: 'B+', quantity: 198, target: 250, percentage: 79 },
    { type: 'B-', quantity: 67, target: 100, percentage: 67 },
    { type: 'AB+', quantity: 134, target: 180, percentage: 74 },
    { type: 'AB-', quantity: 45, target: 80, percentage: 56 },
    { type: 'O+', quantity: 312, target: 400, percentage: 78 },
    { type: 'O-', quantity: 156, target: 200, percentage: 78 }
  ];

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0, color: '#1976D2' }}>
              🏥 Admin Dashboard
            </Title>
            <Text type="secondary">
              Chào mừng, {userInfo?.username} - Quản trị viên hệ thống
            </Text>
          </Col>
          <Col>
            <Space>
              <Button icon={<BellOutlined />} type="text">
                Thông báo (3)
              </Button>
              <Button icon={<SettingOutlined />} type="text">
                Cài đặt
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* System Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        {systemStats.map((stat, index) => (
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
        {/* Blood Inventory */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <BarChartOutlined />
                <span>Tình trạng kho máu</span>
              </Space>
            }
            extra={<Button type="link">Xem chi tiết</Button>}
          >
            <List
              itemLayout="horizontal"
              dataSource={bloodInventory}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar style={{ backgroundColor: '#f56a00' }}>{item.type}</Avatar>}
                    title={`Nhóm máu ${item.type}`}
                    description={
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text>{item.quantity}/{item.target} đơn vị</Text>
                        <Progress 
                          percent={item.percentage} 
                          size="small"
                          status={item.percentage < 60 ? 'exception' : item.percentage < 80 ? 'active' : 'success'}
                        />
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Recent Activities */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <BellOutlined />
                <span>Hoạt động gần đây</span>
              </Space>
            }
            extra={<Button type="link">Xem tất cả</Button>}
          >
            <List
              itemLayout="horizontal"
              dataSource={recentActivities}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        style={{ 
                          backgroundColor: 
                            item.type === 'success' ? '#52c41a' :
                            item.type === 'error' ? '#ff4d4f' :
                            item.type === 'warning' ? '#faad14' : '#1890ff'
                        }}
                      >
                        {item.user[0]}
                      </Avatar>
                    }
                    title={item.action}
                    description={
                      <Space>
                        <Text strong>{item.user}</Text>
                        <Text type="secondary">• {item.time}</Text>
                      </Space>
                    }
                  />
                  <Tag color={
                    item.type === 'success' ? 'green' :
                    item.type === 'error' ? 'red' :
                    item.type === 'warning' ? 'orange' : 'blue'
                  }>
                    {item.type === 'success' ? 'Thành công' :
                     item.type === 'error' ? 'Khẩn cấp' :
                     item.type === 'warning' ? 'Cảnh báo' : 'Thông tin'}
                  </Tag>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Card title="Thao tác nhanh" style={{ marginTop: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Button type="primary" block size="large" icon={<UserOutlined />}>
              Quản lý người dùng
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button type="default" block size="large" icon={<HeartFilled />}>
              Quản lý hiến máu
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button type="default" block size="large" icon={<MedicineBoxOutlined />}>
              Yêu cầu máu
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button type="default" block size="large" icon={<BarChartOutlined />}>
              Báo cáo thống kê
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default AdminDashboard; 