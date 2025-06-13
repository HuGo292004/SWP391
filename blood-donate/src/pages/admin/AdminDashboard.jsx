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
  Avatar,
  Tabs,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Badge
} from 'antd';
import { 
  UserOutlined, 
  HeartFilled, 
  TeamOutlined, 
  MedicineBoxOutlined,
  TrophyOutlined,
  BellOutlined,
  SettingOutlined,
  BarChartOutlined,
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  DashboardOutlined,
  DropboxOutlined,
  FileTextOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const AdminDashboard = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('1');
  const [isRequestModalVisible, setIsRequestModalVisible] = useState(false);
  const [isInventoryModalVisible, setIsInventoryModalVisible] = useState(false);
  const [form] = Form.useForm();

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

  // Blood donation request management
  const donationRequests = [
    {
      id: 1,
      hospital: 'Bệnh viện Chợ Rẫy',
      bloodType: 'A+',
      quantity: 5,
      status: 'pending',
      date: '2024-03-20',
      priority: 'high'
    },
    // Add more mock data as needed
  ];

  const requestColumns = [
    {
      title: 'Bệnh viện',
      dataIndex: 'hospital',
      key: 'hospital',
    },
    {
      title: 'Nhóm máu',
      dataIndex: 'bloodType',
      key: 'bloodType',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'pending' ? 'orange' :
          status === 'approved' ? 'green' :
          status === 'rejected' ? 'red' : 'blue'
        }>
          {status === 'pending' ? 'Chờ duyệt' :
           status === 'approved' ? 'Đã duyệt' :
           status === 'rejected' ? 'Từ chối' : 'Hoàn thành'}
        </Tag>
      )
    },
    {
      title: 'Ngày yêu cầu',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="primary" size="small" icon={<EditOutlined />}>
            Duyệt
          </Button>
          <Button type="default" size="small" icon={<DeleteOutlined />}>
            Từ chối
          </Button>
        </Space>
      ),
    },
  ];

  // User profiles and donation history
  const userProfiles = [
    {
      id: 1,
      name: 'Nguyễn Văn A',
      bloodType: 'A+',
      lastDonation: '2024-02-15',
      totalDonations: 5,
      status: 'eligible'
    },
    // Add more mock data as needed
  ];

  const userColumns = [
    {
      title: 'Họ tên',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Nhóm máu',
      dataIndex: 'bloodType',
      key: 'bloodType',
    },
    {
      title: 'Lần hiến gần nhất',
      dataIndex: 'lastDonation',
      key: 'lastDonation',
    },
    {
      title: 'Tổng số lần hiến',
      dataIndex: 'totalDonations',
      key: 'totalDonations',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'eligible' ? 'green' : 'red'}>
          {status === 'eligible' ? 'Đủ điều kiện' : 'Không đủ điều kiện'}
        </Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="primary" size="small" icon={<EditOutlined />}>
            Chi tiết
          </Button>
        </Space>
      ),
    },
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

      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab} 
        style={{ 
          marginTop: '24px',
          background: '#fff',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
        tabBarStyle={{
          marginBottom: '20px',
          borderBottom: '2px solid #f0f0f0'
        }}
        items={[
          {
            key: '1',
            label: (
              <Space>
                <DashboardOutlined style={{ fontSize: '18px', color: '#1976D2' }} />
                <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Tổng quan</span>
              </Space>
            ),
            children: (
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
            )
          },
          {
            key: '2',
            label: (
              <Space>
                <FileTextOutlined style={{ fontSize: '18px', color: '#52c41a' }} />
                <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Quản lý yêu cầu máu</span>
                <Badge count={5} style={{ backgroundColor: '#52c41a' }} />
              </Space>
            ),
            children: (
              <Card
                title={
                  <Space>
                    <FileTextOutlined style={{ fontSize: '20px', color: '#52c41a' }} />
                    <span style={{ fontSize: '18px' }}>Danh sách yêu cầu máu</span>
                  </Space>
                }
                extra={
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsRequestModalVisible(true)}>
                    Thêm yêu cầu mới
                  </Button>
                }
              >
                <Table columns={requestColumns} dataSource={donationRequests} />
              </Card>
            )
          },
          {
            key: '3',
            label: (
              <Space>
                <DropboxOutlined style={{ fontSize: '18px', color: '#722ed1' }} />
                <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Quản lý kho máu</span>
              </Space>
            ),
            children: (
              <Card
                title={
                  <Space>
                    <DropboxOutlined style={{ fontSize: '20px', color: '#722ed1' }} />
                    <span style={{ fontSize: '18px' }}>Tình trạng kho máu</span>
                  </Space>
                }
                extra={
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsInventoryModalVisible(true)}>
                    Cập nhật kho máu
                  </Button>
                }
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
            )
          },
          {
            key: '4',
            label: (
              <Space>
                <TeamOutlined style={{ fontSize: '18px', color: '#fa8c16' }} />
                <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Quản lý người hiến máu</span>
              </Space>
            ),
            children: (
              <Card
                title={
                  <Space>
                    <TeamOutlined style={{ fontSize: '20px', color: '#fa8c16' }} />
                    <span style={{ fontSize: '18px' }}>Danh sách người hiến máu</span>
                  </Space>
                }
                extra={
                  <Space>
                    <Input.Search 
                      placeholder="Tìm kiếm..." 
                      style={{ width: 200 }}
                      prefix={<SearchOutlined />}
                    />
                    <Button type="primary" icon={<PlusOutlined />}>
                      Thêm người hiến mới
                    </Button>
                  </Space>
                }
              >
                <Table columns={userColumns} dataSource={userProfiles} />
              </Card>
            )
          }
        ]}
      />

      {/* Blood Request Modal */}
      <Modal
        title="Thêm yêu cầu máu mới"
        visible={isRequestModalVisible}
        onCancel={() => setIsRequestModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="hospital" label="Bệnh viện" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="bloodType" label="Nhóm máu" rules={[{ required: true }]}>
            <Select>
              <Option value="A+">A+</Option>
              <Option value="A-">A-</Option>
              <Option value="B+">B+</Option>
              <Option value="B-">B-</Option>
              <Option value="AB+">AB+</Option>
              <Option value="AB-">AB-</Option>
              <Option value="O+">O+</Option>
              <Option value="O-">O-</Option>
            </Select>
          </Form.Item>
          <Form.Item name="quantity" label="Số lượng" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="priority" label="Mức độ ưu tiên" rules={[{ required: true }]}>
            <Select>
              <Option value="high">Cao</Option>
              <Option value="medium">Trung bình</Option>
              <Option value="low">Thấp</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Thêm yêu cầu
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Inventory Update Modal */}
      <Modal
        title="Cập nhật kho máu"
        visible={isInventoryModalVisible}
        onCancel={() => setIsInventoryModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="bloodType" label="Nhóm máu" rules={[{ required: true }]}>
            <Select>
              <Option value="A+">A+</Option>
              <Option value="A-">A-</Option>
              <Option value="B+">B+</Option>
              <Option value="B-">B-</Option>
              <Option value="AB+">AB+</Option>
              <Option value="AB-">AB-</Option>
              <Option value="O+">O+</Option>
              <Option value="O-">O-</Option>
            </Select>
          </Form.Item>
          <Form.Item name="quantity" label="Số lượng cập nhật" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="expiryDate" label="Ngày hết hạn" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Cập nhật
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminDashboard; 