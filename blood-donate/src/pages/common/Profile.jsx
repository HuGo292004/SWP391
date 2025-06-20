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
import '../../styles/pages.css';
import '../../styles/Profile.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Mock user data based on role
  const getMockUserData = () => {
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('userRole');
    
    const baseInfo = {
      username: username || 'user123',
      role: role || 'Member',
      avatar: null,
      joinDate: '2023-01-15',
      lastActive: dayjs().format('YYYY-MM-DD HH:mm:ss')
    };    if (role === 'Member') {
      return {
        ...baseInfo,
        userID: 'MB001', // Mã người dùng cho Member
        fullName: 'Nguyễn Văn An',
        email: 'nguyenvanan@email.com',phone: '0912345678',
        citizenId: '079090001234',
        address: '123 Đường ABC, Quận 1, TP.HCM',
        birthDate: '1990-05-15',
        gender: 'Nam',
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
      };    } else if (role === 'Staff') {
      return {
        ...baseInfo,
        staffID: 'ST001', // Đổi từ staffId thành staffID theo database
        fullName: 'Trần Thị Bình',
        email: 'tranthibinh@bloodbank.vn',        phone: '0923456789',
        citizenId: '079085001122',
        address: '456 Đường XYZ, Quận 3, TP.HCM',
        birthDate: '1985-03-20',
        gender: 'Nữ',        role: 'Nhân viên y tế', // Role từ database  
        position: 'Nhân viên y tế',
        shift: 'Ca sáng', // Thêm ca làm việc
        specialization: 'Thu thập máu', // Thêm chuyên môn
        workingHours: '8:00 - 17:00',
        certification: 'Chứng chỉ hành nghề Y tế',
        workLocation: 'Trung tâm hiến máu TP.HCM',
        status: 'Đang hoạt động',
        hireDate: '2019-03-15' // Ngày vào làm
      };
    } else if (role === 'Admin') {
      return {
        ...baseInfo,
        fullName: 'Lê Văn Cường',
        email: 'levancuong@bloodbank.vn',        phone: '0934567890',
        citizenId: '079080005566',
        address: '789 Đường GHI, Quận 5, TP.HCM',
        birthDate: '1980-12-10',
        gender: 'Nam',        department: 'Phòng Quản lý',
        position: 'Quản trị viên hệ thống',
        staffID: 'AD001', // Đổi từ staffId thành staffID
        workingHours: '8:00 - 17:00',
        accessLevel: 'Toàn quyền',
        managedSystems: ['Quản lý người dùng', 'Quản lý kho máu', 'Báo cáo thống kê'],
        hireDate: '2015-01-10' // Thêm ngày vào làm
      };
    }

    return baseInfo;
  };

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('userToken');
    if (!token) {
      navigate('/login');
      return;
    }

    // Simulate loading user data
    setTimeout(() => {
      const userData = getMockUserData();
      setUserInfo(userData);
      form.setFieldsValue(userData);
      setLoading(false);
    }, 1000);  }, [navigate, form]);

  const handleEditProfile = () => {
    // Set initial values cho form, đặc biệt là DatePicker
    const formValues = {
      ...userInfo,
      birthDate: userInfo.birthDate ? dayjs(userInfo.birthDate) : null
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
      
      // Convert dayjs object to string for birthDate
      const processedValues = {
        ...values,
        birthDate: values.birthDate ? values.birthDate.format('YYYY-MM-DD') : userInfo.birthDate
      };
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const updatedInfo = { ...userInfo, ...processedValues };
      setUserInfo(updatedInfo);
      setEditModalVisible(false);
      message.success('Cập nhật thông tin thành công!');
    } catch (error) {
      message.error('Có lỗi xảy ra khi cập nhật thông tin!');
    } finally {
      setLoading(false);
    }
  };
  const renderPersonalInfo = () => (
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
    >      <Descriptions column={2} className="profile-descriptions">
        <Descriptions.Item label="Mã người dùng">
          <Space>
            <SafetyCertificateOutlined style={{ color: '#1976D2' }} />
            {userInfo.role === 'Member' ? (userInfo.userID || 'MB001') : 
             userInfo.role === 'Staff' ? (userInfo.staffID || 'ST001') :
             (userInfo.staffID || 'AD001')}
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="Họ và tên">{userInfo.fullName}</Descriptions.Item>
        <Descriptions.Item label="Tên đăng nhập">{userInfo.username}</Descriptions.Item>
        <Descriptions.Item label="Email">
          <Space>
            <MailOutlined style={{ color: '#1976D2' }} />
            {userInfo.email}
          </Space>
        </Descriptions.Item>        <Descriptions.Item label="Số điện thoại">
          <Space>
            <PhoneOutlined style={{ color: '#1976D2' }} />
            {userInfo.phone}
          </Space>
        </Descriptions.Item>        <Descriptions.Item label="Căn cước công dân">
          <Space>
            <SafetyCertificateOutlined style={{ color: '#1976D2' }} />
            {userInfo.citizenId}
          </Space>
        </Descriptions.Item>        <Descriptions.Item label="Ngày sinh">
          <Space>
            <CalendarOutlined style={{ color: '#1976D2' }} />
            {dayjs(userInfo.birthDate).format('DD/MM/YYYY')}
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="Giới tính">{userInfo.gender}</Descriptions.Item>
        
        {/* Hiển thị địa chỉ cho tất cả role */}
        <Descriptions.Item label="Địa chỉ" span={2}>
          <Space>
            <EnvironmentOutlined style={{ color: '#1976D2' }} />
            {userInfo.address}
          </Space>
        </Descriptions.Item>
        
        {/* Hiển thị liên hệ khẩn cấp chỉ cho Member */}
        {userInfo.role === 'Member' && (
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
                  {userInfo.donationCount}
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
                  {userInfo.totalVolume}ml
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
                  {dayjs(userInfo.nextEligibleDate).format('DD/MM/YYYY')}
                </div>
                <div className="blood-info-label">Lần tiếp theo</div>
              </Card>
            </Col>
          </Row>

          <Divider />

          <Descriptions column={2} labelStyle={{ fontWeight: 'bold', color: '#666' }}>
            <Descriptions.Item label="Cân nặng">{userInfo.weight} kg</Descriptions.Item>
            <Descriptions.Item label="Chiều cao">{userInfo.height} cm</Descriptions.Item>
            <Descriptions.Item label="Tình trạng sức khỏe">
              <Tag color="green">{userInfo.healthStatus}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Lần hiến máu cuối">
              {dayjs(userInfo.lastDonation).format('DD/MM/YYYY')}
            </Descriptions.Item>
            <Descriptions.Item label="Tiền sử bệnh lý" span={2}>
              {userInfo.medicalHistory}
            </Descriptions.Item>
            <Descriptions.Item label="Liên hệ khẩn cấp" span={2}>
              {userInfo.emergencyContact}
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
                dataSource={userInfo.achievements}
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
                items={userInfo.donationHistory.map(donation => ({
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
                }))}
              />
            </Card>
          </Col>
        </Row>
      </>
    );
  };

  const renderStaffAdminInfo = () => {
    if (userInfo.role === 'Member') return null;    return (
      <Card 
        className="profile-card work-info-card"
        title={
          <Space>
            <SafetyCertificateOutlined style={{ color: '#1976D2' }} />
            <span>Thông tin công việc</span>
          </Space>
        }
      >        <Descriptions column={2} className="profile-descriptions">
          <Descriptions.Item label="Mã nhân viên">{userInfo.staffID}</Descriptions.Item>
          <Descriptions.Item label="Chức vụ">{userInfo.position}</Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color="green">{userInfo.status}</Tag>
          </Descriptions.Item>
            {userInfo.role === 'Staff' && (
            <>
              <Descriptions.Item label="Ca làm việc">{userInfo.shift}</Descriptions.Item>
              <Descriptions.Item label="Chuyên môn">{userInfo.specialization}</Descriptions.Item>
              <Descriptions.Item label="Chứng chỉ" span={2}>{userInfo.certification}</Descriptions.Item>
              <Descriptions.Item label="Nơi làm việc" span={2}>{userInfo.workLocation}</Descriptions.Item>
            </>
          )}            {userInfo.role === 'Admin' && (
            <>
              <Descriptions.Item label="Cấp độ truy cập">{userInfo.accessLevel}</Descriptions.Item>
              <Descriptions.Item label="Hệ thống quản lý" span={2}>
                <Space wrap>
                  {userInfo.managedSystems.map(system => (
                    <Tag key={system} color="blue">{system}</Tag>
                  ))}
                </Space>
              </Descriptions.Item>
            </>
          )}
        </Descriptions>
      </Card>
    );
  };
  if (loading) {
    return (
      <div className="profile-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="profile-error">
        <Title level={4}>Không thể tải thông tin người dùng</Title>
        <Button type="primary" onClick={() => navigate('/')}>
          Về trang chủ
        </Button>
      </div>
    );
  }
  return (
    <div className="profile-container">
      <div className="profile-content">        {/* Header Section */}
        <Card className="profile-header-card">
          <Row align="middle" gutter={[24, 24]}>
            <Col xs={24} sm={6} style={{ textAlign: 'center' }}>
              <Avatar 
                size={120} 
                icon={<UserOutlined />} 
                src={userInfo.avatar}
                className="profile-avatar"
              />
            </Col>
            <Col xs={24} sm={18}>
              <Title level={2} className="profile-header-title">
                {userInfo.fullName}
              </Title>
              <Text type="secondary" className="profile-username">
                @{userInfo.username}
              </Text>
              <div style={{ marginTop: '12px' }}>
                <Tag 
                  color={userInfo.role === 'Admin' ? 'red' : userInfo.role === 'Staff' ? 'blue' : 'green'}
                  className="profile-role-tag"
                >
                  {userInfo.role}
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
                  name="citizenId"
                  rules={[
                    { required: true, message: 'Vui lòng nhập số CCCD!' },
                    { pattern: /^[0-9]{12}$/, message: 'CCCD phải có 12 chữ số!' }
                  ]}
                >
                  <Input maxLength={12} />
                </Form.Item>
              </Col>              <Col xs={24} sm={12}>
                <Form.Item 
                  label="Giới tính" 
                  name="gender"
                >
                  <Select>
                    <Option value="Nam">Nam</Option>
                    <Option value="Nữ">Nữ</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item 
                  label="Ngày sinh" 
                  name="birthDate"
                >
                  <DatePicker 
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    placeholder="Chọn ngày sinh"
                  />
                </Form.Item>
              </Col>              <Col xs={24}>
                <Form.Item 
                  label="Địa chỉ" 
                  name="address"
                  rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
                >
                  <Input.TextArea rows={3} />
                </Form.Item>
              </Col>

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
