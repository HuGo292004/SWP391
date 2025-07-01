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
  Switch,
  InputNumber
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
  SafetyCertificateOutlined,
  HeartOutlined,
  MedicineBoxOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { UserAPI } from '../../services/userApi';
import { 
  getDonorProfileByUserId, 
  generateDonorID,
  createDonorProfile,
  updateDonorProfile 
} from '../../services/userManagementApi';
import '../../styles/pages.css';
import '../../styles/Profile.css';

const { Title, Text, Paragraph } = Typography;

// Hàm lấy tên nhóm máu từ bloodTypeID
const getBloodTypeName = (bloodTypeID) => {
  console.log('==== getBloodTypeName DEBUG ====');
  console.log('Input bloodTypeID:', bloodTypeID);
  console.log('Type of bloodTypeID:', typeof bloodTypeID);
  console.log('Is null/undefined?', bloodTypeID == null);
  
  if (!bloodTypeID) {
    console.log('No bloodTypeID provided, returning "Chưa xác định"');
    return 'Chưa xác định';
  }
  
  const bloodTypeMap = {
    '44C1A0F7-92B9-4E1B-A628-03447F5B86D7': 'O+ (O Rh dương)',
    '5BB618E3-25CE-45D8-B980-03D532EC2293': 'B- (B Rh âm)',
    '11111111-1111-1111-1111-111111111111': 'A+ (A Rh dương)',
    '11111111-1111-1111-1111-111111111002': 'A- (A Rh âm)',
    '11111111-1111-1111-1111-111111111003': 'B+ (B Rh dương)',
    '11111111-1111-1111-1111-111111111004': 'B- (B Rh âm)',
    '11111111-1111-1111-1111-111111111005': 'AB+ (AB Rh dương)',
    '11111111-1111-1111-1111-111111111006': 'AB- (AB Rh âm)',
    '11111111-1111-1111-1111-111111111007': 'O+ (O Rh dương)',
    '11111111-1111-1111-1111-111111111008': 'O- (O Rh âm)',
    'FE6B963D-65ED-4681-96FF-213E2B9D7E9B': 'O- (O Rh âm)',
    'B0B93608-6EA7-4F3E-8B24-37B66BF00C82': 'A+ (A Rh dương)',
    'C070228E-DA24-4CD8-8286-84C2226674A3': 'B+ (B Rh dương)',
    '5D60875F-D7DE-4DFE-A057-F8F433A7A932': 'AB- (AB Rh âm)',
    'A12373C7-3BFC-496E-8021-C0031B9BCDD8': 'A- (A Rh âm)',
    '5AE0C996-2594-48D2-8023-FD80676E4BCC': 'AB+ (AB Rh dương)'
  };
  
  // Chuẩn hóa bloodTypeID (uppercase)
  const normalizedID = String(bloodTypeID).toUpperCase();
  console.log('Normalized bloodTypeID:', normalizedID);
  console.log('Available keys in bloodTypeMap:', Object.keys(bloodTypeMap));
  console.log('Is key found in map?', normalizedID in bloodTypeMap);
  
  const result = bloodTypeMap[normalizedID] || 'Chưa xác định';
  console.log('Blood type mapping result:', result);
  console.log('==== END getBloodTypeName DEBUG ====');
  
  return result;
};

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
      
      // Nếu là Member, thêm các field mặc định và lấy thông tin donor profile từ API
      if (userData.role === 'Member') {
        console.log('User is Member, fetching donor profile from API...');
        
        try {
          // Lấy thông tin donor profile từ API
          const donorProfile = await getDonorProfileByUserId(userData.userId || userData.userID || userData.id);
          console.log('Donor profile from API:', donorProfile);
          console.log('Donor profile keys:', donorProfile ? Object.keys(donorProfile) : 'null');
          
          if (donorProfile && (donorProfile.donorID || donorProfile.donorId)) {
            // Đã có hồ sơ hiến máu - sử dụng thông tin thực tế từ database
            const bloodTypeID = donorProfile.bloodTypeId || donorProfile.bloodTypeID || donorProfile.BloodTypeId || donorProfile.BloodTypeID;
            const userId = donorProfile.userId || donorProfile.userID || donorProfile.UserId || donorProfile.UserID;
            const address = donorProfile.Address || donorProfile.address || userData.address || ''; // Ưu tiên Address (viết hoa) từ database
            
            console.log('Donor profile bloodTypeID from database:', bloodTypeID);
            console.log('Donor profile userID from database:', userId);
            console.log('Donor profile Address from database:', address);
            console.log('Raw donor profile from API:', donorProfile);
            console.log('All donor profile fields:', Object.keys(donorProfile));
            
            processedUserData = {
              ...processedUserData,
              donorID: donorProfile.donorId || donorProfile.donorID,
              bloodTypeID: bloodTypeID,
              bloodType: getBloodTypeName(bloodTypeID),
              isAvailable: donorProfile.isAvailable !== undefined ? donorProfile.isAvailable : true,
              lastDonationDate: donorProfile.lastDonationDate || donorProfile.LastDonationDate,
              nextEligibleDate: donorProfile.nextEligibleDate || donorProfile.NextEligibleDate,
              currentMedications: donorProfile.currentMedications || donorProfile.CurrentMedications || '',
              address: address, // Sử dụng address đã mapping từ Address
              hasDonorProfile: true,
              donorUserId: userId // Lưu userID từ donor profile để debug
            };
            console.log('User has donor profile from API:', processedUserData);
            console.log('Blood type mapped to:', processedUserData.bloodType);
            console.log('Final bloodTypeID value:', processedUserData.bloodTypeID);
            console.log('Final address value:', processedUserData.address);
            console.log('Donor userID value:', processedUserData.donorUserId);
          } else {
            // Chưa có hồ sơ hiến máu - hiển thị thông tin mặc định
            processedUserData = {
              ...processedUserData,
              donorID: null, // Chưa có mã hiến máu
              bloodTypeID: null,
              bloodType: null,
              isAvailable: true,
              lastDonationDate: null,
              nextEligibleDate: null,
              currentMedications: '',
              address: userData.address || '',
              hasDonorProfile: false
            };
            console.log('User has NO donor profile, using defaults:', processedUserData);
          }
        } catch (donorError) {
          console.log('Error fetching donor profile from API:', donorError.message);
          // Không có hồ sơ hiến máu hoặc lỗi API - sử dụng thông tin mặc định
          processedUserData = {
            ...processedUserData,
            donorID: null, // Chưa có mã hiến máu
            bloodTypeID: null,
            bloodType: null,
            isAvailable: true,
            lastDonationDate: null,
            nextEligibleDate: null,
            currentMedications: '',
            address: userData.address || '',
            hasDonorProfile: false
          };
          console.log('Using default values due to API error:', processedUserData);
        }
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
        // Thông tin hiến máu mẫu (chỉ dùng khi API không hoạt động)
        donorID: 'DN001',
        bloodTypeID: '44C1A0F7-92B9-4E1B-A628-03447F5B86D7', // O+ GUID
        bloodType: 'O+ (O Rh dương)',
        isAvailable: true,
        lastDonationDate: '2024-02-15',
        nextEligibleDate: '2024-08-15',
        currentMedications: 'Không có thuốc đang sử dụng',
        hasDonorProfile: true // Mock data có donor profile
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
      dateOfBirth: userInfo.dateOfBirth ? dayjs(userInfo.dateOfBirth) : null,
      lastDonationDate: userInfo.lastDonationDate ? dayjs(userInfo.lastDonationDate) : null,
      nextEligibleDate: userInfo.nextEligibleDate ? dayjs(userInfo.nextEligibleDate) : null
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
      
      // Convert dayjs object to string for dates
      const processedValues = {
        ...values,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : userInfo.dateOfBirth,
        lastDonationDate: values.lastDonationDate ? values.lastDonationDate.format('YYYY-MM-DD') : userInfo.lastDonationDate,
        nextEligibleDate: values.nextEligibleDate ? values.nextEligibleDate.format('YYYY-MM-DD') : userInfo.nextEligibleDate
      };
      
      // Tính toán nextEligibleDate tự động nếu có lastDonationDate mới (chỉ khi nextEligibleDate không được set thủ công)
      if (processedValues.lastDonationDate && userInfo.role === 'Member' && !values.nextEligibleDate) {
        const lastDate = dayjs(processedValues.lastDonationDate);
        const nextDate = lastDate.add(12, 'week'); // 12 tuần sau lần hiến cuối
        processedValues.nextEligibleDate = nextDate.format('YYYY-MM-DD');
      }
      
      // Call API to update user basic info
      await UserAPI.updateUser(userInfo.userID, processedValues);
      
      // Nếu là Member và có thông tin donor profile, cập nhật hoặc tạo mới donor profile
      if (userInfo.role === 'Member' && userInfo.hasDonorProfile && userInfo.donorID) {
        try {
          // Cập nhật donor profile hiện có
          const donorData = {
            donorID: userInfo.donorID,
            userID: userInfo.userID, // Quan trọng: phải có userID để không bị mất liên kết
            bloodTypeID: userInfo.bloodTypeID, // Giữ nguyên bloodTypeID hiện tại
            isAvailable: userInfo.isAvailable,
            lastDonationDate: processedValues.lastDonationDate,
            nextEligibleDate: processedValues.nextEligibleDate,
            currentMedications: processedValues.currentMedications || userInfo.currentMedications || '',
            address: processedValues.address // Cập nhật địa chỉ từ form
          };
          
          console.log('=== DONOR PROFILE UPDATE DEBUG ===');
          console.log('Updating donor profile with data:', donorData);
          console.log('userInfo.userID:', userInfo.userID);
          console.log('userInfo.donorID:', userInfo.donorID);
          console.log('processedValues.address:', processedValues.address);
          console.log('Request will send Address (capital A) to API');
          console.log('===================================');
          
          await updateDonorProfile(userInfo.donorID, donorData);
          console.log('Donor profile updated successfully');
        } catch (donorError) {
          console.error('Error updating donor profile:', donorError);
          message.warning('Cập nhật thông tin cá nhân thành công, nhưng không thể cập nhật hồ sơ hiến máu');
        }
      }
      
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
            <Descriptions.Item label="Mã người dùng">
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

    // Nếu chưa có hồ sơ hiến máu, hiển thị nút đăng ký
    if (!userInfo.hasDonorProfile || !userInfo.donorID) {
      return (
        <Card 
          className="profile-card"
          title={
            <Space>
              <HeartOutlined style={{ color: '#E91E63' }} />
              <span>Hồ sơ hiến máu</span>
            </Space>
          }
        >
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <HeartOutlined style={{ fontSize: '48px', color: '#E91E63', marginBottom: '16px' }} />
            <Title level={4}>Bạn chưa đăng ký hiến máu</Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: '24px' }}>
              Đăng ký để trở thành người hiến máu và cứu sống nhiều người
            </Text>
            <Button 
              type="primary" 
              size="large" 
              icon={<HeartOutlined />}
              style={{ backgroundColor: '#E91E63', borderColor: '#E91E63' }}
              onClick={() => {
                // Navigate to blood donation registration page
                navigate('/member/blood-donation-register');
              }}
            >
              Đăng ký hiến máu
            </Button>
          </div>
        </Card>
      );
    }

    // Tính toán trạng thái hiến máu
    const getAvailabilityStatus = () => {
      if (!userInfo.isAvailable) {
        return { status: 'Không khả dụng', color: 'red', icon: <CloseCircleOutlined /> };
      }
      
      if (userInfo.nextEligibleDate) {
        const nextDate = dayjs(userInfo.nextEligibleDate);
        const today = dayjs();
        
        if (nextDate.isAfter(today)) {
          return { 
            status: 'Chờ đến ngày có thể hiến tiếp', 
            color: 'orange', 
            icon: <WarningOutlined /> 
          };
        }
      }
      
      return { status: 'Sẵn sàng hiến máu', color: 'green', icon: <CheckCircleOutlined /> };
    };

    const availabilityStatus = getAvailabilityStatus();

    return (
      <Card 
        className="profile-card"
        title={
          <Space>
            <HeartOutlined style={{ color: '#E91E63' }} />
            <span>Hồ sơ hiến máu</span>
            {userInfo.donorID && (
              <Tag color="blue" style={{ marginLeft: '8px' }}>
                ID: {userInfo.donorID}
              </Tag>
            )}
            {userInfo.hasDonorProfile && (
              <Tag color="green" style={{ marginLeft: '4px', fontSize: '11px' }}>
                Đã đồng bộ
              </Tag>
            )}
          </Space>
        }
        extra={
          <Tag 
            color={availabilityStatus.color}
            icon={availabilityStatus.icon}
            style={{ fontSize: '14px', padding: '4px 12px' }}
          >
            {availabilityStatus.status}
          </Tag>
        }
      >
        <Row gutter={[24, 24]}>
          {/* Thông tin cơ bản hiến máu */}
          <Col xs={24} lg={12}>
            <Card 
              size="small" 
              title="Thông tin cơ bản"
              className="blood-info-sub-card"
            >
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Mã hồ sơ hiến máu">
                  <Space>
                    <SafetyCertificateOutlined style={{ color: '#E91E63' }} />
                    <Tag color="blue" style={{ fontSize: '12px', fontWeight: 'bold' }}>
                      {userInfo.donorID || 'Chưa có mã'}
                    </Tag>
                  </Space>
                </Descriptions.Item>
                
                <Descriptions.Item label="Nhóm máu">
                  <Space>
                    <HeartOutlined style={{ color: '#E91E63' }} />
                    <Tag color="red" style={{ fontSize: '14px', fontWeight: 'bold' }}>
                      {userInfo.bloodType || 'Chưa xác định'}
                    </Tag>
                  </Space>
                </Descriptions.Item>
                
                <Descriptions.Item label="Trạng thái sẵn sàng">
                  <Switch 
                    checked={userInfo.isAvailable}
                    disabled
                    checkedChildren="Có thể hiến"
                    unCheckedChildren="Không thể hiến"
                  />
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* Lịch trình hiến máu */}
          <Col xs={24} lg={12}>
            <Card 
              size="small" 
              title="Lịch trình hiến máu"
              className="blood-schedule-sub-card"
            >
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Lần hiến máu cuối">
                  <Space>
                    <CalendarOutlined style={{ color: '#1976D2' }} />
                    {userInfo.lastDonationDate ? 
                      dayjs(userInfo.lastDonationDate).format('DD/MM/YYYY') : 
                      'Chưa hiến máu lần nào'
                    }
                  </Space>
                </Descriptions.Item>
                
                <Descriptions.Item label="Có thể hiến tiếp theo">
                  <Space>
                    <CalendarOutlined style={{ color: '#52c41a' }} />
                    {userInfo.nextEligibleDate ? 
                      dayjs(userInfo.nextEligibleDate).format('DD/MM/YYYY') : 
                      'Có thể hiến ngay'
                    }
                  </Space>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* Địa chỉ từ hồ sơ hiến máu */}
          <Col xs={24}>
            <Card 
              size="small" 
              title="Địa chỉ liên hệ"
              className="address-sub-card"
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space>
                  <EnvironmentOutlined style={{ color: '#1976D2' }} />
                  <Text strong>Địa chỉ:</Text>
                </Space>
                <Paragraph style={{ margin: 0, padding: '8px 12px', backgroundColor: '#f6f6f6', borderRadius: '6px' }}>
                  {userInfo.address || 'Chưa cập nhật địa chỉ'}
                </Paragraph>
              </Space>
            </Card>
          </Col>

          {/* Thuốc đang sử dụng */}
          <Col xs={24}>
            <Card 
              size="small" 
              title="Thuốc đang sử dụng"
              className="medication-sub-card"
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space>
                  <MedicineBoxOutlined style={{ color: '#fa8c16' }} />
                  <Text strong>Thuốc hiện tại:</Text>
                </Space>
                <Paragraph style={{ margin: 0, padding: '8px 12px', backgroundColor: '#f6f6f6', borderRadius: '6px' }}>
                  {userInfo.currentMedications || 'Không có thuốc đang sử dụng'}
                </Paragraph>
              </Space>
            </Card>
          </Col>
        </Row>
      </Card>
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

              {/* Chỉ hiển thị địa chỉ và thông tin hiến máu cho Member có mã hiến máu */}
              {userInfo.role === 'Member' && userInfo.hasDonorProfile && userInfo.donorID && (
                <>
                  <Col xs={24}>
                    <Divider orientation="left">Thông tin liên hệ và hiến máu</Divider>
                  </Col>
                  
                  <Col xs={24}>
                    <Form.Item 
                      label="Địa chỉ" 
                      name="address"
                      rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
                    >
                      <Input.TextArea rows={3} placeholder="Nhập địa chỉ liên hệ" />
                    </Form.Item>
                  </Col>
                  

                  
                  <Col xs={24}>
                    <Form.Item 
                      label="Thuốc đang sử dụng" 
                      name="currentMedications"
                    >
                      <Input.TextArea 
                        rows={2} 
                        placeholder="Nhập thông tin về thuốc đang sử dụng (nếu có)" 
                      />
                    </Form.Item>
                  </Col>
                </>
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
