import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Avatar, 
  Button, 
  Descriptions, 
  Tag, 
  Space, 
  Divider,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  message,
  Spin,
  Progress,
  Badge,
  List,
  Timeline
} from 'antd';
import {
  UserOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  HeartOutlined,
  MedicineBoxOutlined,
  TrophyOutlined,
  HistoryOutlined,
  GiftOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { UserAPI } from '../../services/userApi';
import '../../styles/pages.css';
import '../../styles/Profile.css';

const { Title, Text, Paragraph } = Typography;


const Profile = () => {
  console.log('Profile component mounting...');
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Fetch user data from API
  const fetchUserData = async () => {
    console.log('fetchUserData called...');
    try {
      setLoading(true);
      
      // Check if this is a demo account
      const token = localStorage.getItem('userToken');
      const userEmail = localStorage.getItem('userEmail') || localStorage.getItem('username');
      
      // Only use demo data for Member (not Staff or Admin)
      if (token === 'demo-token' && userEmail === 'member@example.com') {
        console.log('Demo Member account detected, using mock data...');
        const mockData = getMockUserData();
        console.log('Using mock data for demo account:', mockData);
        setUserInfo(mockData);
        
        const formValues = {
          ...mockData,
          dateOfBirth: mockData.dateOfBirth ? dayjs(mockData.dateOfBirth) : null
        };
        form.setFieldsValue(formValues);
        return;
      }
      
      console.log('Calling UserAPI.getCurrentUser...');
      
      // Get current user data from API
      const userData = await UserAPI.getCurrentUser();
      console.log('UserAPI response:', userData);
      
      // Check if userData is valid
      if (!userData) {
        throw new Error('No user data received from API');
      }
      
      // Process the data based on what we receive from API
      let processedUserData = {
        userID: userData.userId || userData.userID || '',
        username: userData.username || '',
        fullName: userData.fullName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        userIdCard: userData.userIdCard || '',
        dateOfBirth: userData.dateOfBirth || null,
        role: userData.role || '',
        avatar: userData.avatar || null,
      };
      
      // Nếu là Member, thêm các field mặc định
      if (userData.role === 'Member') {
        console.log('User is Member, adding default fields...');
        processedUserData = {
          ...processedUserData,
          // Dữ liệu mặc định cho Member (chưa có API Donor)
          address: '',
          bloodType: 'O+',
          weight: 65,
          height: 170,
          medicalHistory: 'Không có tiền sử bệnh lý',
          emergencyContact: '',
          donationCount: 0,
          totalVolume: 0,
          nextEligibleDate: null,
          healthStatus: 'Chưa đăng ký hiến máu',
          lastDonation: null,
          achievements: [],
          donationHistory: []
        };
      }
      
      setUserInfo(processedUserData);
      console.log('User info set:', processedUserData);
      
      // Set form values, ensuring dateOfBirth is properly handled
      const formValues = {
        ...processedUserData,
        dateOfBirth: processedUserData.dateOfBirth ? dayjs(processedUserData.dateOfBirth) : null
      };
      form.setFieldsValue(formValues);
      
    } catch (error) {
      console.error('Error fetching user data:', error);
      message.error('Không thể tải thông tin người dùng. Sử dụng dữ liệu mẫu.');
      
      // Fallback to mock data if API fails
      const mockData = getMockUserData();
      console.log('Using mock data:', mockData);
      setUserInfo(mockData);
      form.setFieldsValue(mockData);
    } finally {
      console.log('fetchUserData finished, setting loading to false');
      setLoading(false);
    }
  };

  // Mock user data as fallback
  const getMockUserData = () => {
    const username = localStorage.getItem('username') || 'user123';
    const role = localStorage.getItem('userRole') || 'Member';
    
    const baseInfo = {
      userID: role === 'Member' ? 'MB001' : role === 'Staff' ? 'ST001' : 'AD001',
      username: username,
      fullName: role === 'Member' ? 'Nguyễn Văn An' : role === 'Staff' ? 'Trần Thị Bình' : 'Lê Văn Cường',
      email: role === 'Member' ? 'nguyenvanan@email.com' : role === 'Staff' ? 'tranthibinh@bloodbank.vn' : 'levancuong@bloodbank.vn',
      phone: role === 'Member' ? '0912345678' : role === 'Staff' ? '0923456789' : '0934567890',
      userIdCard: role === 'Member' ? '079090001234' : role === 'Staff' ? '079085001122' : '079080005566',
      dateOfBirth: role === 'Member' ? '1990-05-15' : role === 'Staff' ? '1985-03-20' : '1980-12-10',
      role: role,
      avatar: null
    };

    if (role === 'Member') {
      return {
        ...baseInfo,
        address: '123 Đường ABC, Quận 1, TP.HCM',
        bloodType: 'O+',
        weight: 65,
        height: 170,
        medicalHistory: 'Không có tiền sử bệnh lý',
        emergencyContact: 'Nguyễn Thị B - 0987654321',
        donationCount: 5,
        totalVolume: 2500,
        nextEligibleDate: '2024-08-15',
        healthStatus: 'Tốt',
        lastDonation: '2024-02-15',
        achievements: [
          { title: 'Người hiến máu tích cực', date: '2024-01-01', type: 'bronze' },
          { title: 'Hiến máu 5 lần', date: '2024-02-15', type: 'silver' }
        ],
        donationHistory: [
          { date: '2024-02-15', volume: 450, location: 'Bệnh viện ABC', status: 'Hoàn thành' },
          { date: '2023-11-10', volume: 450, location: 'Trung tâm hiến máu XYZ', status: 'Hoàn thành' },
          { date: '2023-08-05', volume: 450, location: 'Bệnh viện DEF', status: 'Hoàn thành' }
        ]
      };
    }

    return baseInfo;
  };

  useEffect(() => {
    console.log('=== Profile useEffect START ===');
    console.log('Current location:', window.location.href);
    console.log('Profile useEffect triggered');
    
    // Debug localStorage
    console.log('=== DEBUG localStorage ===');
    console.log('userToken:', localStorage.getItem('userToken'));
    console.log('userId:', localStorage.getItem('userId'));
    console.log('username:', localStorage.getItem('username'));
    console.log('userRole:', localStorage.getItem('userRole'));
    console.log('userEmail:', localStorage.getItem('userEmail'));
    console.log('===========================');
    
    // Check if user is logged in
    const token = localStorage.getItem('userToken');
    console.log('Token found:', !!token);
    console.log('Token value:', token);
    
    if (!token) {
      console.log('No token, redirecting to login');
      console.log('Current path:', window.location.pathname);
      navigate('/login');
      return;
    }

    // Fetch user data from API
    console.log('Token found, fetching user data...');
    fetchUserData();
    console.log('=== Profile useEffect END ===');
  }, [navigate]);

  // Add error boundary
  if (error) {
    return (
      <div className="profile-error">
        <Title level={4}>Có lỗi xảy ra</Title>
        <p>{error}</p>
        <Space>
          <Button type="primary" onClick={() => {
            setError(null);
            fetchUserData();
          }}>
            Thử lại
          </Button>
          <Button onClick={() => navigate('/')}>
            Về trang chủ
          </Button>
        </Space>
      </div>
    );
  }

  const handleEditProfile = () => {
    // Set initial values cho form, đặc biệt là DatePicker
    const formValues = {
      ...userInfo,
      dateOfBirth: userInfo.dateOfBirth ? dayjs(userInfo.dateOfBirth) : null
    };
    form.setFieldsValue(formValues);
    setEditModalVisible(true);
  };

  const handleCancelEdit = () => {
    form.resetFields();
    setEditModalVisible(false);
  };

  const handleSaveProfile = async (values) => {
    try {
      setLoading(true);
      
      // Convert dayjs object to string for dateOfBirth
      const processedValues = {
        ...values,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : userInfo.dateOfBirth
      };
      
      // Call API to update user
      await UserAPI.updateUser(userInfo.userID, processedValues);
      
      const updatedInfo = { ...userInfo, ...processedValues };
      setUserInfo(updatedInfo);
      setEditModalVisible(false);
      message.success('Cập nhật thông tin thành công!');
      
      // Refresh data from server
      await fetchUserData();
      
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Có lỗi xảy ra khi cập nhật thông tin!');
    } finally {
      setLoading(false);
    }
  };
  const renderPersonalInfo = () => {
    try {
      return (
        <Card 
          className="profile-card"
          title={
            <Space>
              <UserOutlined style={{ color: '#1976D2' }} />
              <span>Thông tin cá nhân</span>
            </Space>
          }
          extra={
            <Button 
              type="primary" 
              icon={<EditOutlined />} 
              onClick={handleEditProfile}
              className="profile-edit-btn"
            >
              Chỉnh sửa
            </Button>
          }
        >
          <Descriptions column={2} className="profile-descriptions">
            <Descriptions.Item label="Mã nhân viên">
              <Space>
                <SafetyCertificateOutlined style={{ color: '#1976D2' }} />
                {userInfo?.userID || 'N/A'}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Họ và tên">{userInfo?.fullName || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Tên đăng nhập">{userInfo?.username || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Email">
              <Space>
                <MailOutlined style={{ color: '#1976D2' }} />
                {userInfo?.email || 'N/A'}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              <Space>
                <PhoneOutlined style={{ color: '#1976D2' }} />
                {userInfo?.phone || 'N/A'}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Căn cước công dân">
              <Space>
                <SafetyCertificateOutlined style={{ color: '#1976D2' }} />
                {userInfo?.userIdCard || 'N/A'}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày sinh">
              <Space>
                <CalendarOutlined style={{ color: '#1976D2' }} />
                {userInfo?.dateOfBirth ? dayjs(userInfo.dateOfBirth).format('DD/MM/YYYY') : 'N/A'}
              </Space>
            </Descriptions.Item>
            
            {/* Hiển thị địa chỉ chỉ cho Member */}
            {userInfo?.role === 'Member' && userInfo?.address && (
              <Descriptions.Item label="Địa chỉ" span={2}>
                <Space>
                  <EnvironmentOutlined style={{ color: '#1976D2' }} />
                  {userInfo.address}
                </Space>
              </Descriptions.Item>
            )}
            
            {/* Hiển thị liên hệ khẩn cấp chỉ cho Member */}
            {userInfo?.role === 'Member' && userInfo?.emergencyContact && (
              <Descriptions.Item label="Liên hệ khẩn cấp" span={2}>
                <Space>
                  <PhoneOutlined style={{ color: '#1976D2' }} />
                  {userInfo.emergencyContact}
                </Space>
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>
      );
    } catch (error) {
      console.error('Error rendering personal info:', error);
      return (
        <Card title="Thông tin cá nhân">
          <p>Có lỗi khi hiển thị thông tin cá nhân</p>
        </Card>
      );
    }
  };

  const renderMemberSpecificInfo = () => {
    if (userInfo.role !== 'Member') return null;

    return (
      <>        <Card 
          className="profile-card"
          title={
            <Space>
              <HeartOutlined style={{ color: '#E91E63' }} />
              <span>Thông tin hiến máu</span>
            </Space>
          }
        >
          <Row gutter={[24, 24]} className="blood-info-cards">
            <Col xs={24} sm={12} md={6}>
              <Card 
                size="small" 
                className="blood-info-card blood-type-card"
              >
                <HeartOutlined className="blood-info-icon" style={{ color: '#E91E63' }} />
                <div className="blood-info-value" style={{ color: '#E91E63' }}>
                  {userInfo.bloodType}
                </div>
                <div className="blood-info-label">Nhóm máu</div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card 
                size="small" 
                className="blood-info-card donation-count-card"
              >
                <GiftOutlined className="blood-info-icon" style={{ color: '#52c41a' }} />
                <div className="blood-info-value" style={{ color: '#52c41a' }}>
                  {userInfo.donationCount || 0}
                </div>
                <div className="blood-info-label">Lần hiến máu</div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card 
                size="small" 
                className="blood-info-card total-volume-card"
              >
                <MedicineBoxOutlined className="blood-info-icon" style={{ color: '#1976D2' }} />
                <div className="blood-info-value" style={{ color: '#1976D2' }}>
                  {userInfo.totalVolume || 0}ml
                </div>
                <div className="blood-info-label">Tổng lượng máu</div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card 
                size="small" 
                className="blood-info-card next-eligible-card"
              >
                <CalendarOutlined className="blood-info-icon" style={{ color: '#fa8c16' }} />
                <div className="blood-info-value" style={{ color: '#fa8c16', fontSize: '16px' }}>
                  {userInfo.nextEligibleDate ? dayjs(userInfo.nextEligibleDate).format('DD/MM/YYYY') : 'N/A'}
                </div>
                <div className="blood-info-label">Lần tiếp theo</div>
              </Card>
            </Col>
          </Row>

          <Divider />

          <Descriptions column={2} labelStyle={{ fontWeight: 'bold', color: '#666' }}>
            <Descriptions.Item label="Cân nặng">{userInfo.weight || 'N/A'} kg</Descriptions.Item>
            <Descriptions.Item label="Chiều cao">{userInfo.height || 'N/A'} cm</Descriptions.Item>
            <Descriptions.Item label="Tình trạng sức khỏe">
              <Tag color="green">{userInfo.healthStatus || 'N/A'}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Lần hiến máu cuối">
              {userInfo.lastDonation ? dayjs(userInfo.lastDonation).format('DD/MM/YYYY') : 'Chưa hiến máu'}
            </Descriptions.Item>
            <Descriptions.Item label="Tiền sử bệnh lý" span={2}>
              {userInfo.medicalHistory || 'Không có thông tin'}
            </Descriptions.Item>
            <Descriptions.Item label="Liên hệ khẩn cấp" span={2}>
              {userInfo.emergencyContact || 'Chưa cập nhật'}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Row gutter={[24, 24]}>          <Col xs={24} lg={12}>
            <Card 
              className="profile-card achievement-card"
              title={
                <Space>
                  <TrophyOutlined style={{ color: '#faad14' }} />
                  <span>Thành tích</span>
                </Space>
              }
            >
              <List
                dataSource={userInfo.achievements || []}
                locale={{ emptyText: 'Chưa có thành tích nào' }}
                renderItem={(item) => (
                  <List.Item className="achievement-item">
                    <List.Item.Meta
                      avatar={
                        <div className={`achievement-icon ${item.type}`}>
                          <TrophyOutlined />
                        </div>
                      }
                      title={item.title}
                      description={`Đạt được ngày ${dayjs(item.date).format('DD/MM/YYYY')}`}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card 
              className="profile-card donation-history-card"
              title={
                <Space>
                  <HistoryOutlined style={{ color: '#1976D2' }} />
                  <span>Lịch sử hiến máu</span>
                </Space>
              }
            >
              <Timeline
                className="donation-timeline"
                items={(userInfo.donationHistory || []).length > 0 ? 
                  userInfo.donationHistory.map(donation => ({
                    color: 'green',
                    children: (
                      <div>
                        <div className="donation-date">
                          {dayjs(donation.date).format('DD/MM/YYYY')}
                        </div>
                        <div className="donation-details">{donation.volume}ml - {donation.location}</div>
                        <Tag color="green" className="donation-status-tag">{donation.status}</Tag>
                      </div>
                    )
                  })) : 
                  [{
                    color: 'gray',
                    children: <div>Chưa có lịch sử hiến máu</div>
                  }]
                }
              />
            </Card>
          </Col>
        </Row>
      </>
    );
  };

  const renderStaffAdminInfo = () => {
    if (userInfo.role === 'Member') return null;

    // Chỉ hiển thị thông tin cơ bản từ database cho Staff/Admin
    return null;
  };
  if (loading) {
    console.log('Profile component: showing loading...');
    return (
      <div className="profile-loading" style={{ padding: '50px', textAlign: 'center' }}>
        <Spin size="large" />
        <p style={{ marginTop: '16px' }}>Đang tải thông tin...</p>
      </div>
    );
  }

  if (!userInfo) {
    console.log('Profile component: no user info...');
    return (
      <div className="profile-error" style={{ padding: '50px', textAlign: 'center' }}>
        <Title level={4}>Không thể tải thông tin người dùng</Title>
        <Space>
          <Button type="primary" onClick={fetchUserData} loading={loading}>
            Thử lại
          </Button>
          <Button onClick={() => navigate('/')}>
            Về trang chủ
          </Button>
        </Space>
      </div>
    );
  }
  return (
    <div className="profile-container">
      <div className="profile-content">
        {/* Header Section */}
        <Card className="profile-header-card">
          <Row align="middle" gutter={[24, 24]}>
            <Col xs={24} sm={6} style={{ textAlign: 'center' }}>
              <Avatar 
                size={120} 
                icon={<UserOutlined />} 
                src={userInfo?.avatar}
                className="profile-avatar"
              />
            </Col>
            <Col xs={24} sm={18}>
              <Title level={2} className="profile-header-title">
                {userInfo?.fullName || 'Không có tên'}
              </Title>
              <Text type="secondary" className="profile-username">
                @{userInfo?.username || 'unknown'}
              </Text>
              <div style={{ marginTop: '12px' }}>
                <Tag 
                  color={userInfo?.role === 'Admin' ? 'red' : userInfo?.role === 'Staff' ? 'blue' : 'green'}
                  className="profile-role-tag"
                >
                  {userInfo?.role || 'Unknown'}
                </Tag>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Main Content */}
        {renderPersonalInfo()}
        {renderStaffAdminInfo()}
        {renderMemberSpecificInfo()}

        {/* Edit Modal */}        <Modal
          title="Chỉnh sửa thông tin cá nhân"
          open={editModalVisible}
          onCancel={handleCancelEdit}
          footer={null}
          width={600}
          style={{ borderRadius: '12px' }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSaveProfile}
          >
            <Row gutter={[16, 0]}>
              <Col xs={24} sm={12}>
                <Form.Item 
                  label="Họ và tên" 
                  name="fullName"
                  rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item 
                  label="Email" 
                  name="email"
                  rules={[
                    { required: true, message: 'Vui lòng nhập email!' },
                    { type: 'email', message: 'Email không hợp lệ!' }
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>              <Col xs={24} sm={12}>
                <Form.Item 
                  label="Số điện thoại" 
                  name="phone"
                  rules={[
                    { required: true, message: 'Vui lòng nhập số điện thoại!' },
                    { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại phải có 10-11 chữ số!' }
                  ]}
                >
                  <Input placeholder="Nhập số điện thoại" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item 
                  label="Căn cước công dân" 
                  name="userIdCard"
                  rules={[
                    { required: true, message: 'Vui lòng nhập số CCCD!' },
                    { pattern: /^[0-9]{12}$/, message: 'CCCD phải có 12 chữ số!' }
                  ]}
                >
                  <Input maxLength={12} />
                </Form.Item>
              </Col>              <Col xs={24} sm={12}>
                <Form.Item 
                  label="Ngày sinh" 
                  name="dateOfBirth"
                >
                  <DatePicker 
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    placeholder="Chọn ngày sinh"
                  />
                </Form.Item>
              </Col>

              {/* Hiển thị trường địa chỉ chỉ cho Member */}
              {userInfo.role === 'Member' && (
                <Col xs={24}>
                  <Form.Item 
                    label="Địa chỉ" 
                    name="address"
                    rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
                  >
                    <Input.TextArea rows={3} />
                  </Form.Item>
                </Col>
              )}

              {/* Hiển thị trường liên hệ khẩn cấp chỉ cho Member */}
              {userInfo.role === 'Member' && (
                <Col xs={24}>
                  <Form.Item 
                    label="Liên hệ khẩn cấp" 
                    name="emergencyContact"
                    rules={[{ required: true, message: 'Vui lòng nhập thông tin liên hệ khẩn cấp!' }]}
                  >
                    <Input placeholder="Ví dụ: Nguyễn Văn A - 0987654321" />
                  </Form.Item>
                </Col>
              )}
            </Row>            
            <div className="profile-form-actions">
              <Space>                <Button 
                  onClick={handleCancelEdit}
                  icon={<CloseOutlined />}
                  className="profile-cancel-btn"
                >
                  Hủy
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  loading={loading}
                  icon={<SaveOutlined />}
                  className="profile-save-btn"
                >
                  Lưu thay đổi
                </Button>
              </Space>
            </div>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default Profile;
