// Import các thư viện React và Ant Design cần thiết
import React, { useState, useEffect } from "react";
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
  Badge,
  Spin,
  Alert,
} from "antd";

// Import các icon từ Ant Design
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
  FileTextOutlined,
  ReloadOutlined,
  WarningOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";

// Import Dashboard API service
import { dashboardApi } from "../../services/dashboardApi";

// Destructure các component từ Typography và Tabs
const { Title, Text } = Typography;
const { Option } = Select;

/**
 * Component Dashboard dành cho Admin
 * Hiển thị tổng quan hệ thống, thống kê và quản lý các chức năng chính
 */
const AdminDashboard = () => {
  // State quản lý thông tin người dùng hiện tại
  const [userInfo, setUserInfo] = useState(null);

  // State quản lý tab đang được chọn
  const [activeTab, setActiveTab] = useState("1");

  // State quản lý hiển thị modal tạo yêu cầu khẩn cấp
  const [isRequestModalVisible, setIsRequestModalVisible] = useState(false);

  // State quản lý hiển thị modal quản lý kho máu
  const [isInventoryModalVisible, setIsInventoryModalVisible] = useState(false);
  const [form] = Form.useForm();

  // State cho dashboard data từ API
  const [dashboardData, setDashboardData] = useState({
    bloodInventory: null,
    donationStats: null,
    requestStats: null,
    donorStats: null,
    summary: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get user info from localStorage
    const username = localStorage.getItem("username");
    const role = localStorage.getItem("userRole");
    setUserInfo({ username, role });

    // Load dashboard data
    loadDashboardData();
  }, []);

  // Function to load all dashboard data
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Loading dashboard data...");
      
      const data = await dashboardApi.getAllDashboardData();
      console.log("Dashboard data loaded:", data);
      
      setDashboardData(data);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setError(error.message);
      // Clear dashboard data when API fails - no fallback mock data
      setDashboardData({
        bloodInventory: null,
        donationStats: null,
        requestStats: null,
        donorStats: null,
        summary: null,
      });
    } finally {
      setLoading(false);
    }
  };

  // Get system statistics from loaded data
  const getSystemStats = () => {
    const { summary, donationStats, requestStats, donorStats } = dashboardData;
    
    if (!summary) return [];

    return [
      {
        title: "Tổng người hiến máu",
        value: summary.totalDonors || 0,
        prefix: <UserOutlined />,
        suffix: "người",
        status: "success",
      },
      {
        title: "Tổng lần hiến máu",
        value: summary.totalDonations || 0,
        prefix: <HeartFilled />,
        suffix: "lần",
        status: "processing",
      },
      {
        title: "Yêu cầu chờ xử lý",
        value: summary.pendingRequests || 0,
        prefix: <MedicineBoxOutlined />,
        suffix: "yêu cầu",
        status: "warning",
      },
      {
        title: "Nhóm máu",
        value: summary.availableBloodUnits || 0,
        prefix: <TeamOutlined />,
        suffix: "nhóm máu",
        status: "success",
      },
    ];
  };

  const systemStats = getSystemStats();

  // Transform blood inventory data from API format
  const getBloodInventoryData = () => {
    if (!dashboardData.bloodInventory?.bloodTypeQuantities) return [];
    
    const bloodTypeQuantities = dashboardData.bloodInventory.bloodTypeQuantities;
    const bloodTypes = Object.entries(bloodTypeQuantities).map(([type, quantity]) => {
      // Set target based on blood type according to hospital requirements (in ml)
      // Mỗi túi máu thông thường chứa khoảng 450ml
      const targets = {
        'O+': 54000,    // 120 túi x 450ml - Nhóm phổ biến nhất, dùng khẩn cấp
        'A+': 45000,    // 100 túi x 450ml - Rất phổ biến tại VN
        'B+': 36000,    // 80 túi x 450ml - Phổ biến
        'AB+': 18000,   // 40 túi x 450ml - Hiếm hơn
        'O-': 6750,     // 15 túi x 450ml - Dùng cho mọi nhóm trong cấp cứu
        'A-': 4500,     // 10 túi x 450ml - Khá hiếm
        'B-': 3600,     // 8 túi x 450ml - Rất hiếm
        'AB-': 2250     // 5 túi x 450ml - Hiếm nhất
      };
      const target = targets[type] || 22500; // Default fallback (50 túi x 450ml)
      const percentage = Math.round((quantity / target) * 100);
      const status = quantity === 0 ? 'critical' : 
                    percentage < 30 ? 'low' : 
                    percentage < 70 ? 'medium' : 'good';
      
      return {
        type,
        quantity,
        target,
        percentage: Math.min(percentage, 100),
        status
      };
    });
    
    return bloodTypes;
  };

  // Get blood inventory data
  const bloodInventory = getBloodInventoryData();
  
  // Transform recent activities from API format
  const getRecentActivities = () => {
    if (!dashboardData.summary?.recentActivities) return [];
    
    const activities = dashboardData.summary.recentActivities;
    return activities.map((activity, index) => {
      // Transform description to Vietnamese
      let action = activity.description;
      let user = 'Hệ thống';
      
      if (action.includes('Blood donation by ')) {
        user = action.split('Blood donation by ')[1];
        action = action.replace('Blood donation by ', 'Hiến máu bởi ');
      } else if (action.includes('Blood request from ')) {
        user = action.split('Blood request from ')[1];
        action = action.replace('Blood request from ', 'Yêu cầu khẩn cấp từ ');
      } else if (action.includes('by ')) {
        user = action.split('by ')[1];
      } else if (action.includes('from ')) {
        user = action.split('from ')[1];
      }
      
      return {
        id: index + 1,
        action: action,
        user: user,
        time: new Date(activity.date).toLocaleDateString('vi-VN'),
        type: activity.activityType === 'Donation' ? 'success' : 
              activity.activityType === 'Request' ? 'error' : 'info'
      };
    });
  };

  const recentActivities = getRecentActivities();

  return (
    <div style={{ padding: "24px", background: "#f5f5f5", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0, color: "#1976D2" }}>
              🏥 Admin Dashboard
            </Title>
            <Text type="secondary">
              Chào mừng, {userInfo?.username} - Quản trị viên hệ thống
            </Text>
          </Col>
          <Col>
            <Space>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={loadDashboardData}
                loading={loading}
                type="default"
              >
                Làm mới
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert
          message="Lỗi tải dữ liệu từ API"
          description={`Không thể kết nối đến API Dashboard: ${error}. Vui lòng kiểm tra kết nối mạng và đảm bảo backend server đang chạy tại http://localhost:7262`}
          type="error"
          showIcon
          icon={<WarningOutlined />}
          style={{ marginBottom: "16px" }}
          closable
          onClose={() => setError(null)}
          action={
            <Button size="small" danger onClick={loadDashboardData}>
              Thử lại
            </Button>
          }
        />
      )}

      {/* Loading Spinner */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "100px 0" }}>
          <Spin size="large" />
          <div style={{ marginTop: "16px" }}>
            <Text>Đang tải dữ liệu dashboard từ API...</Text>
          </div>
        </div>
      ) : error ? (
        <div style={{ textAlign: "center", padding: "100px 0" }}>
          <div style={{ marginBottom: "16px" }}>
            <Text type="secondary" style={{ fontSize: "16px" }}>
              Không thể tải dữ liệu từ API. Vui lòng kiểm tra kết nối backend.
            </Text>
          </div>
          <Button type="primary" onClick={loadDashboardData}>
            Thử tải lại
          </Button>
        </div>
      ) : (
        <>
          {/* System Statistics */}
          <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
            {systemStats.map((stat, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card>
                  <Statistic
                    title={stat.title}
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    valueStyle={{
                      color:
                        stat.status === "success"
                          ? "#3f8600"
                          : stat.status === "warning"
                          ? "#cf1322"
                          : "#1976D2",
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
              marginTop: "24px",
              background: "#fff",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
            tabBarStyle={{
              marginBottom: "20px",
              borderBottom: "2px solid #f0f0f0",
            }}
            items={[
              {
                key: "1",
                label: (
                  <Space>
                    <DashboardOutlined
                      style={{ fontSize: "18px", color: "#1976D2" }}
                    />
                    <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                      Tổng quan
                    </span>
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
                        
                      >
                        <List
                          itemLayout="horizontal"
                          dataSource={bloodInventory}
                          renderItem={(item) => (
                            <List.Item>
                              <List.Item.Meta
                                avatar={
                                  <Avatar style={{ 
                                    backgroundColor: item.status === 'critical' ? '#ff4d4f' : 
                                                   item.status === 'low' ? '#faad14' : 
                                                   item.status === 'medium' ? '#1890ff' : '#52c41a'
                                  }}>
                                    {item.type}
                                  </Avatar>
                                }
                                title={`Nhóm máu ${item.type}`}
                                description={
                                  <Space
                                    direction="vertical"
                                    style={{ width: "100%" }}
                                  >
                                    <Text>
                                      {item.quantity}/{item.target} ml
                                    </Text>
                                    <Progress
                                      percent={item.percentage}
                                      size="small"
                                      status={
                                        item.percentage < 60
                                          ? "exception"
                                          : item.percentage < 80
                                          ? "active"
                                          : "success"
                                      }
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
                        
                      >
                        <List
                          itemLayout="horizontal"
                          dataSource={recentActivities}
                          renderItem={(item) => (
                            <List.Item>
                              <List.Item.Meta
                                avatar={
                                  <Avatar
                                    style={{
                                      backgroundColor:
                                        item.type === "success"
                                          ? "#52c41a"
                                          : item.type === "error"
                                          ? "#ff4d4f"
                                          : item.type === "warning"
                                          ? "#faad14"
                                          : "#1890ff",
                                    }}
                                  >
                                    {item.user ? item.user[0] : "?"}
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
                              <Tag
                                color={
                                  item.type === "success"
                                    ? "green"
                                    : item.type === "error"
                                    ? "red"
                                    : item.type === "warning"
                                    ? "orange"
                                    : "blue"
                                }
                              >
                                {item.type === "success"
                                  ? "Thành công"
                                  : item.type === "error"
                                  ? "Khẩn cấp"
                                  : item.type === "warning"
                                  ? "Cảnh báo"
                                  : "Thông tin"}
                              </Tag>
                            </List.Item>
                          )}
                        />
                      </Card>
                    </Col>
                  </Row>
                ),
              },
              {
                key: "2",
                label: (
                  <Space>
                    <HeartFilled
                      style={{ fontSize: "18px", color: "#52c41a" }}
                    />
                    <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                      Thống kê hiến máu
                    </span>
                    <Badge 
                      count={dashboardData.donationStats?.pendingDonations || 0} 
                      style={{ backgroundColor: "#52c41a" }} 
                    />
                  </Space>
                ),
                children: (
                  <Row gutter={[16, 16]}>
                    {/* Donation Statistics Cards */}
                    <Col xs={24}>
                      <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
                        <Col xs={24} sm={8} lg={6}>
                          <Card>
                            <Statistic
                              title="Tổng đơn hiến máu"
                              value={dashboardData.donationStats?.totalDonations || 0}
                              prefix={<HeartFilled style={{ color: "#1890ff" }} />}
                              valueStyle={{ color: "#1890ff" }}
                            />
                          </Card>
                        </Col>
                        <Col xs={24} sm={8} lg={6}>
                          <Card>
                            <Statistic
                              title="Hiến máu hoàn thành"
                              value={dashboardData.donationStats?.completedDonations || 0}
                              prefix={<HeartFilled style={{ color: "#52c41a" }} />}
                              valueStyle={{ color: "#52c41a" }}
                            />
                          </Card>
                        </Col>
                        <Col xs={24} sm={8} lg={6}>
                          <Card>
                            <Statistic
                              title="Chờ duyệt"
                              value={dashboardData.donationStats?.pendingDonations || 0}
                              prefix={<HeartFilled style={{ color: "#faad14" }} />}
                              valueStyle={{ color: "#faad14" }}
                            />
                          </Card>
                        </Col>
                        <Col xs={24} sm={8} lg={6}>
                          <Card>
                            <Statistic
                              title="Đã duyệt"
                              value={dashboardData.donationStats?.donationsByStatus?.Approved || 0}
                              prefix={<HeartFilled style={{ color: "#52c41a" }} />}
                              valueStyle={{ color: "#52c41a" }}
                            />
                          </Card>
                        </Col>
                      </Row>
                    </Col>

                    {/* Top Blood Types Chart */}
                    <Col xs={24} lg={12}>
                      <Card title="Hiến máu theo nhóm máu">
                        <List
                          dataSource={Object.entries(dashboardData.donationStats?.donationsByBloodType || {}).map(([type, count]) => ({
                            type,
                            count
                          }))}
                          renderItem={(item, index) => (
                            <List.Item>
                              <List.Item.Meta
                                avatar={
                                  <Avatar style={{ backgroundColor: "#f56a00" }}>
                                    {item.type}
                                  </Avatar>
                                }
                                title={`Nhóm máu ${item.type}`}
                                description={`${item.count} lần hiến máu`}
                              />
                              <div>{item.count} lần</div>
                            </List.Item>
                          )}
                        />
                      </Card>
                    </Col>

                    {/* Donation Status Distribution */}
                    <Col xs={24} lg={12}>
                      <Card title="Phân bố theo trạng thái">
                        <List
                          dataSource={Object.entries(dashboardData.donationStats?.donationsByStatus || {}).map(([status, count]) => ({
                            status,
                            count,
                            color: status === 'Completed' ? '#52c41a' : 
                                   status === 'Approved' ? '#1890ff' : 
                                   status === 'Pending' ? '#faad14' : 
                                   status === 'Canceled' ? '#ff4d4f' : '#722ed1'
                          }))}
                          renderItem={(item) => (
                            <List.Item>
                              <List.Item.Meta
                                avatar={
                                  <Avatar style={{ backgroundColor: item.color }}>
                                    {item.count}
                                  </Avatar>
                                }
                                title={item.status}
                                description={`${item.count} đơn hiến máu`}
                              />
                            </List.Item>
                          )}
                        />
                      </Card>
                    </Col>
                  </Row>
                ),
              },
              {
                key: "3",
                label: (
                  <Space>
                    <FileTextOutlined
                      style={{ fontSize: "18px", color: "#722ed1" }}
                    />
                    <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                      Thống kê yêu cầu máu
                    </span>
                    <Badge 
                      count={dashboardData.requestStats?.pendingRequests || 0} 
                      style={{ backgroundColor: "#ff4d4f" }} 
                    />
                  </Space>
                ),
                children: (
                  <Row gutter={[16, 16]}>
                    {/* Request Statistics Cards */}
                    <Col xs={24}>
                      <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
                        <Col xs={24} sm={8} lg={6}>
                          <Card>
                            <Statistic
                              title="Tổng yêu cầu"
                              value={dashboardData.requestStats?.totalRequests || 0}
                              prefix={<FileTextOutlined style={{ color: "#1890ff" }} />}
                              valueStyle={{ color: "#1890ff" }}
                            />
                          </Card>
                        </Col>
                        <Col xs={24} sm={8} lg={6}>
                          <Card>
                            <Statistic
                              title="Chờ xử lý"
                              value={dashboardData.requestStats?.pendingRequests || 0}
                              prefix={<WarningOutlined style={{ color: "#faad14" }} />}
                              valueStyle={{ color: "#faad14" }}
                            />
                          </Card>
                        </Col>
                        <Col xs={24} sm={8} lg={6}>
                          <Card>
                            <Statistic
                              title="Đã hoàn thành"
                              value={dashboardData.requestStats?.fulfilledRequests || 0}
                              prefix={<FileTextOutlined style={{ color: "#52c41a" }} />}
                              valueStyle={{ color: "#52c41a" }}
                            />
                          </Card>
                        </Col>
                        <Col xs={24} sm={8} lg={6}>
                          <Card>
                            <Statistic
                              title="Đã đóng"
                              value={dashboardData.requestStats?.requestsByStatus?.Closed || 0}
                              prefix={<InfoCircleOutlined style={{ color: "#722ed1" }} />}
                              valueStyle={{ color: "#722ed1" }}
                            />
                          </Card>
                        </Col>
                      </Row>
                    </Col>

                    {/* Request Performance */}
                    <Col xs={24} lg={12}>
                      <Card title="Yêu cầu theo nhóm máu">
                        <List
                          dataSource={Object.entries(dashboardData.requestStats?.requestsByBloodType || {}).map(([type, count]) => ({
                            type,
                            count
                          }))}
                          renderItem={(item) => (
                            <List.Item>
                              <List.Item.Meta
                                avatar={
                                  <Avatar style={{ backgroundColor: "#722ed1" }}>
                                    {item.type}
                                  </Avatar>
                                }
                                title={`Nhóm máu ${item.type}`}
                                description={`${item.count} yêu cầu`}
                              />
                            </List.Item>
                          )}
                        />
                      </Card>
                    </Col>

                    {/* Emergency Requests */}
                    <Col xs={24} lg={12}>
                      <Card 
                        title="Yêu cầu khẩn cấp gần đây"
                      >
                        <List
                          dataSource={dashboardData.requestStats?.emergencyRequests?.slice(0, 5) || []}
                          renderItem={(item) => (
                            <List.Item>
                              <List.Item.Meta
                                title={`Nhóm máu ${item.bloodType}`}
                                description={
                                  <Space>
                                    <Text>{item.quantityNeeded}ml cần thiết</Text>
                                    <Text type="secondary">• {new Date(item.date).toLocaleDateString('vi-VN')}</Text>
                                  </Space>
                                }
                              />
                              <Tag color="red">Khẩn cấp</Tag>
                            </List.Item>
                          )}
                        />
                      </Card>
                    </Col>
                  </Row>
                ),
              },
              {
                key: "4",
                label: (
                  <Space>
                    <TeamOutlined style={{ fontSize: "18px", color: "#fa8c16" }} />
                    <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                      Thống kê người hiến máu
                    </span>
                  </Space>
                ),
                children: (
                  <Row gutter={[16, 16]}>
                    {/* Donor Statistics Cards */}
                    <Col xs={24}>
                      <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
                        <Col xs={24} sm={8} lg={6}>
                          <Card>
                            <Statistic
                              title="Tổng người hiến máu"
                              value={dashboardData.donorStats?.totalDonors || 0}
                              prefix={<TeamOutlined style={{ color: "#1890ff" }} />}
                              valueStyle={{ color: "#1890ff" }}
                            />
                          </Card>
                        </Col>
                        <Col xs={24} sm={8} lg={6}>
                          <Card>
                            <Statistic
                              title="Đang hoạt động"
                              value={dashboardData.donorStats?.activeDonors || 0}
                              prefix={<TeamOutlined style={{ color: "#52c41a" }} />}
                              valueStyle={{ color: "#52c41a" }}
                            />
                          </Card>
                        </Col>
                        
                        <Col xs={24} sm={8} lg={6}>
                          <Card>
                            <Statistic
                              title="Người hiến nhiều nhất"
                              value={dashboardData.donorStats?.topDonors?.length || 0}
                              prefix={<TeamOutlined style={{ color: "#52c41a" }} />}
                              valueStyle={{ color: "#52c41a" }}
                            />
                          </Card>
                        </Col>
                      </Row>
                    </Col>

                    {/* Top Donors */}
                    <Col xs={24} lg={12}>
                      <Card title="Người hiến máu tích cực">
                        <List
                          dataSource={dashboardData.donorStats?.topDonors || []}
                          renderItem={(item) => (
                            <List.Item>
                              <List.Item.Meta
                                avatar={
                                  <Avatar style={{ backgroundColor: "#52c41a" }}>
                                    {item.donorName ? item.donorName[0] : "?"}
                                  </Avatar>
                                }
                                title={item.donorName}
                                description={
                                  <Space>
                                    <Tag color="blue">{item.bloodType}</Tag>
                                    <Text>{item.totalDonations} lần hiến</Text>
                                    <Text type="secondary">• Lần cuối: {new Date(item.lastDonationDate).toLocaleDateString('vi-VN')}</Text>
                                  </Space>
                                }
                              />
                            </List.Item>
                          )}
                        />
                      </Card>
                    </Col>

                    {/* Donor Status Distribution */}
                    <Col xs={24} lg={12}>
                      <Card title="Thống kê người hiến máu">
                        <div style={{ padding: "16px" }}>
                          <div style={{ marginBottom: "16px" }}>
                            <Text strong>Tổng số người hiến máu: </Text>
                            <Text>{dashboardData.donorStats?.totalDonors || 0} người</Text>
                          </div>
                          
                          <div style={{ marginBottom: "16px" }}>
                            <Text strong>Đang hoạt động: </Text>
                            <Text>{dashboardData.donorStats?.activeDonors || 0} người</Text>
                          </div>

                          
                        </div>
                      </Card>
                    </Col>

                    {/* Blood Type Distribution for Donors */}
                    <Col xs={24}>
                      <Card title="Phân bố nhóm máu của người hiến máu">
                        <Row gutter={[16, 16]}>
                          {Object.entries(dashboardData.donorStats?.donorsByBloodType || {}).map(([bloodType, count]) => (
                            <Col xs={12} sm={8} lg={6} key={bloodType}>
                              <Card size="small">
                                <Statistic
                                  title={`Nhóm máu ${bloodType}`}
                                  value={count}
                                  prefix={
                                    <Avatar style={{ backgroundColor: "#1890ff", fontSize: "12px" }}>
                                      {bloodType}
                                    </Avatar>
                                  }
                                  suffix="người"
                                  valueStyle={{ fontSize: "20px" }}
                                />
                              </Card>
                            </Col>
                          ))}
                        </Row>
                      </Card>
                    </Col>
                  </Row>
                ),
              },
              {
                key: "5",
                label: (
                  <Space>
                    <DropboxOutlined
                      style={{ fontSize: "18px", color: "#722ed1" }}
                    />
                    <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                      Quản lý kho máu
                    </span>
                  </Space>
                ),
                children: (
                  <Card
                    title={
                      <Space>
                        <DropboxOutlined
                          style={{ fontSize: "20px", color: "#722ed1" }}
                        />
                        <span style={{ fontSize: "18px" }}>Tình trạng kho máu chi tiết</span>
                      </Space>
                    }
                    
                  >
                    <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
                      <Col xs={24} sm={12} lg={6}>
                        <Card>
                          <Statistic
                            title="Tổng đơn vị"
                            value={dashboardData.bloodInventory?.totalUnits || 0}
                            prefix={<DropboxOutlined style={{ color: "#1890ff" }} />}
                            suffix="ml"
                            valueStyle={{ color: "#1890ff" }}
                          />
                        </Card>
                      </Col>
                      <Col xs={24} sm={12} lg={6}>
                        <Card>
                          <Statistic
                            title="Sẵn có"
                            value={dashboardData.bloodInventory?.availableUnits || 0}
                            prefix={<DropboxOutlined style={{ color: "#52c41a" }} />}
                            suffix="ml"
                            valueStyle={{ color: "#52c41a" }}
                          />
                        </Card>
                      </Col>
                      <Col xs={24} sm={12} lg={6}>
                        <Card>
                          <Statistic
                            title="Sắp hết hạn"
                            value={dashboardData.bloodInventory?.expiringSoonUnits || 0}
                            prefix={<WarningOutlined style={{ color: "#faad14" }} />}
                            suffix="ml"
                            valueStyle={{ color: "#faad14" }}
                          />
                        </Card>
                      </Col>
                      <Col xs={24} sm={12} lg={6}>
                        <Card>
                          <Statistic
                            title="Thiếu nghiêm trọng"
                            value={bloodInventory.filter(item => item.status === 'critical').length || 0}
                            prefix={<WarningOutlined style={{ color: "#ff4d4f" }} />}
                            valueStyle={{ color: "#ff4d4f" }}
                          />
                        </Card>
                      </Col>
                    </Row>

                    <List
                      itemLayout="horizontal"
                      dataSource={bloodInventory}
                      renderItem={(item) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={
                              <Avatar style={{ 
                                backgroundColor: item.status === 'critical' ? '#ff4d4f' : 
                                               item.status === 'low' ? '#faad14' : 
                                               item.status === 'medium' ? '#1890ff' : '#52c41a'
                              }}>
                                {item.type}
                              </Avatar>
                            }
                            title={`Nhóm máu ${item.type}`}
                            description={
                              <Space direction="vertical" style={{ width: "100%" }}>
                                <Space>
                                  <Text strong>
                                    {item.quantity}/{item.target} ml
                                  </Text>
                                  <Tag color={
                                    item.status === 'critical' ? 'red' : 
                                    item.status === 'low' ? 'orange' : 
                                    item.status === 'medium' ? 'blue' : 'green'
                                  }>
                                    {item.status === 'critical' ? 'Thiếu nghiêm trọng' :
                                     item.status === 'low' ? 'Thiếu' :
                                     item.status === 'medium' ? 'Trung bình' : 'Đầy đủ'}
                                  </Tag>
                                </Space>
                                <Progress
                                  percent={item.percentage}
                                  size="small"
                                  status={
                                    item.percentage < 60
                                      ? "exception"
                                      : item.percentage < 80
                                      ? "active"
                                      : "success"
                                  }
                                />
                              </Space>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  </Card>
                ),
              },
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
              <Form.Item
                name="hospital"
                label="Bệnh viện"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="bloodType"
                label="Nhóm máu"
                rules={[{ required: true }]}
              >
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
              <Form.Item
                name="quantity"
                label="Số lượng"
                rules={[{ required: true }]}
              >
                <Input type="number" />
              </Form.Item>
              <Form.Item
                name="priority"
                label="Mức độ ưu tiên"
                rules={[{ required: true }]}
              >
                <Select>
                  <Option value="high">Cao</Option>
                  <Option value="medium">Trung bình</Option>
                  <Option value="low">Thấp</Option>
                </Select>
              </Form.Item>
              
            </Form>
          </Modal>

      
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
