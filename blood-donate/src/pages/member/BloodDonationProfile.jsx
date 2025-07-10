import React, { useState, useEffect } from 'react';
import { Card, Steps, Typography, Table, Tag, Empty, Spin, Alert } from 'antd';
import { 
  FileTextOutlined, 
  SolutionOutlined, 
  ClockCircleOutlined, 
  StarOutlined,
  HeartOutlined,
  CheckCircleOutlined,
  UserOutlined
} from '@ant-design/icons';
import { bloodDonationApi } from '../../services/bloodDonationApi';
import { useLocation } from 'react-router-dom';

const { Title, Text } = Typography;

// Đặt biến này thành false để dùng dữ liệu thật từ API
const USE_MOCK = false;

const mockData = [
  // Đơn đang chờ xác nhận
  {
    id: 'D001',
    donorId: 'U001',
    bloodType: 'A+',
    requestType: 'regular',
    status: 'pending',
    requestDate: new Date().toISOString(),
    healthCheckDate: null,
    donationDate: null,
    location: 'Bệnh viện A',
    notes: '',
    requestId: null,
    rejectionReason: null,
    healthCheckStatus: 'N/A',
  },
  // Đơn đã được duyệt, có lịch khám
  {
    id: 'D002',
    donorId: 'U001',
    bloodType: 'B-',
    requestType: 'regular',
    status: 'approved',
    requestDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    healthCheckDate: new Date(Date.now() + 86400000).toISOString(),
    donationDate: null,
    location: 'Bệnh viện B',
    notes: '',
    requestId: null,
    rejectionReason: null,
    healthCheckStatus: 'pending',
  },
  // Đơn đã hoàn thành
  {
    id: 'D003',
    donorId: 'U001',
    bloodType: 'O+',
    requestType: 'emergency',
    status: 'completed',
    requestDate: new Date(Date.now() - 86400000 * 10).toISOString(),
    healthCheckDate: new Date(Date.now() - 86400000 * 8).toISOString(),
    donationDate: new Date(Date.now() - 86400000 * 7).toISOString(),
    location: 'Bệnh viện C',
    notes: '',
    requestId: 'REQ123',
    rejectionReason: null,
    healthCheckStatus: 'approved',
  },
];

const BloodDonationProfile = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDonation, setCurrentDonation] = useState(null);
  const [completedDonations, setCompletedDonations] = useState([]);
  const location = useLocation();

  // Get current user info
  const getCurrentUser = () => {
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    return { userId, username };
  };

  const { userId, username } = getCurrentUser();

  // Load user's blood donations
  useEffect(() => {
    if (USE_MOCK) {
      // Dùng mock data
      const formattedDonations = mockData.map(formatDonationData);
      setDonations(formattedDonations);
      // Lấy đơn active (approved ưu tiên, nếu không có thì pending)
      const activeDonation = formattedDonations.find(d => d.status === 'approved')
        || formattedDonations.find(d => d.status === 'pending');
      setCurrentDonation(activeDonation);
      // Lấy đơn completed cho lịch sử
      const completed = formattedDonations.filter(d => d.status === 'completed');
      setCompletedDonations(completed);
      setLoading(false);
      return;
    }
    loadUserDonations();
  }, []);

  const loadUserDonations = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const data = await bloodDonationApi.getBloodDonationsByDonor(userId);
      const formattedDonations = Array.isArray(data) ? data.map(formatDonationData) : [];
      setDonations(formattedDonations);

      // Find current active donation (pending or approved)
      const activeDonation = formattedDonations.find(d => 
        d.status === 'pending' || d.status === 'approved'
      );
      setCurrentDonation(activeDonation);

      // Get completed donations for history
      const completed = formattedDonations.filter(d => d.status === 'completed');
      setCompletedDonations(completed);

    } catch (error) {
      console.error('Error loading user donations:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDonationData = (donation) => {
    return {
      id: donation.id,
      donorId: donation.donorId || donation.userId || 'N/A',
      bloodType: donation.bloodType || 'N/A',
      requestType: donation.requestType || 'regular',
      status: donation.status || 'pending',
      requestDate: donation.requestDate || donation.createdAt,
      healthCheckDate: donation.healthCheckDate,
      donationDate: donation.donationDate,
      location: donation.location || 'N/A',
      notes: donation.notes || '',
      requestId: donation.requestId || null, // For emergency requests
      rejectionReason: donation.rejectionReason,
      healthCheckStatus: donation.healthCheckStatus || 'N/A'
    };
  };

  // Determine current step based on donation status
  const getCurrentStep = () => {
    if (!currentDonation) return 0;
    
    switch (currentDonation.status) {
      case 'pending': return 0;
      case 'approved': return 1;
      case 'completed': return 3;
      default: return 0;
    }
  };

  // Check if user has health check scheduled
  const hasHealthCheckScheduled = () => {
    return currentDonation && currentDonation.healthCheckDate;
  };

  const donationProcess = [
    {
      title: 'Chờ xác nhận',
      icon: <FileTextOutlined />,
      description: 'Đơn đăng ký của bạn đang chờ xác nhận.'
    },
    {
      title: 'Lịch Khám sức khỏe',
      icon: <SolutionOutlined />,
      description: hasHealthCheckScheduled() 
        ? `Khám sức khỏe vào ngày ${new Date(currentDonation.healthCheckDate).toLocaleDateString('vi-VN')}`
        : 'Bạn sẽ được khám sức khỏe trước khi hiến máu.'
    },
    {
      title: 'Chờ kết quả',
      icon: <ClockCircleOutlined />,
      description: 'Chờ thông báo kết quả nhóm máu và lời cảm ơn.'
    },
    {
      title: 'Nhận certificate',
      icon: <StarOutlined />,
      description: 'Nhận chứng nhận hiến máu.'
    }
  ];

  // Table columns for donation history
  const columns = [
    {
      title: 'Ngày hiến máu',
      dataIndex: 'donationDate',
      key: 'donationDate',
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A',
    },
    {
      title: 'Nhóm máu',
      dataIndex: 'bloodType',
      key: 'bloodType',
      render: (bloodType) => <Tag color="red">{bloodType}</Tag>,
    },
    {
      title: 'Loại hiến máu',
      dataIndex: 'requestType',
      key: 'requestType',
      render: (type) => {
        const color = type === 'emergency' ? 'red' : type === 'regular' ? 'blue' : 'green';
        const text = type === 'emergency' ? 'Khẩn cấp' : type === 'regular' ? 'Định kỳ' : 'Tình nguyện';
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Địa điểm',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color="green">Đã hoàn thành</Tag>,
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Đang tải thông tin hiến máu...</div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div style={{ padding: 24 }}>
        <Alert
          message="Vui lòng đăng nhập"
          description="Bạn cần đăng nhập để xem hồ sơ hiến máu."
          type="warning"
          showIcon
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <Title level={2}>
          <HeartOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          Hồ sơ hiến máu
        </Title>
        <Text type="secondary">
          <UserOutlined style={{ marginRight: 4 }} />
          {username}
        </Text>
      </div>

      {/* Current Donation Process */}
      {currentDonation ? (
        <Card style={{ marginBottom: 32 }}>
          <div style={{ marginBottom: 16 }}>
            <Title level={4}>
              <FileTextOutlined style={{ marginRight: 8 }} />
              Quy trình hiến máu hiện tại
            </Title>
            {currentDonation.requestId && (
              <Alert
                message="Yêu cầu khẩn cấp"
                description={`Request ID: ${currentDonation.requestId}`}
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}
          </div>

          {/* Custom Stepper */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            margin: '32px 0 24px 0',
            padding: '0 12px',
          }}>
            {/* Bước 1: Chờ xác nhận */}
            <div style={{ flex: 1, textAlign: 'center', opacity: 1 }}>
              <div style={{
                width: 56, height: 56, margin: '0 auto', borderRadius: '50%',
                background: getCurrentStep() === 0 ? '#1976D2' : (getCurrentStep() > 0 ? '#4CAF50' : '#e0e0e0'),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 32, border: getCurrentStep() === 0 ? '3px solid #1976D2' : 'none',
                boxShadow: getCurrentStep() === 0 ? '0 0 0 4px #1976d233' : 'none',
                position: 'relative',
              }}>
                {getCurrentStep() > 0 ? <CheckCircleOutlined style={{ fontSize: 32, color: '#fff' }} /> : <FileTextOutlined />}
              </div>
              <div style={{ marginTop: 8, fontWeight: getCurrentStep() === 0 ? 700 : 400, color: getCurrentStep() === 0 ? '#1976D2' : '#888' }}>
                Chờ xác nhận
              </div>
            </div>
            {/* Line */}
            <div style={{ width: 40, height: 3, background: getCurrentStep() > 0 ? '#4CAF50' : '#e0e0e0', marginTop: 26 }} />
            {/* Bước 2: Khám sức khỏe & Hiến máu */}
            <div style={{ flex: 1, textAlign: 'center', opacity: getCurrentStep() >= 1 ? 1 : 0.5 }}>
              <div style={{
                width: 56, height: 56, margin: '0 auto', borderRadius: '50%',
                background: getCurrentStep() === 1 ? '#1976D2' : (getCurrentStep() > 1 ? '#4CAF50' : '#e0e0e0'),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 32, border: getCurrentStep() === 1 ? '3px solid #1976D2' : 'none',
                boxShadow: getCurrentStep() === 1 ? '0 0 0 4px #1976d233' : 'none',
                position: 'relative',
              }}>
                {getCurrentStep() > 1 ? <CheckCircleOutlined style={{ fontSize: 32, color: '#fff' }} /> : <SolutionOutlined />}
              </div>
              <div style={{ marginTop: 8, fontWeight: getCurrentStep() === 1 ? 700 : 400, color: getCurrentStep() === 1 ? '#1976D2' : '#888' }}>
                Khám sức khỏe & Hiến máu
              </div>
              {getCurrentStep() >= 1 && currentDonation.healthCheckDate && (
                <div style={{ fontSize: 13, color: '#1976D2', marginTop: 4 }}>
                  Ngày khám: {new Date(currentDonation.healthCheckDate).toLocaleDateString('vi-VN')}
                </div>
              )}
            </div>
            {/* Line */}
            <div style={{ width: 40, height: 3, background: getCurrentStep() > 1 ? '#4CAF50' : '#e0e0e0', marginTop: 26 }} />
            {/* Bước 3: Nhận certificate */}
            <div style={{ flex: 1, textAlign: 'center', opacity: getCurrentStep() === 2 ? 1 : (getCurrentStep() > 2 ? 1 : 0.5) }}>
              <div style={{
                width: 56, height: 56, margin: '0 auto', borderRadius: '50%',
                background: getCurrentStep() === 2 ? '#1976D2' : (getCurrentStep() > 2 ? '#4CAF50' : '#e0e0e0'),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 32, border: getCurrentStep() === 2 ? '3px solid #1976D2' : 'none',
                boxShadow: getCurrentStep() === 2 ? '0 0 0 4px #1976d233' : 'none',
                position: 'relative',
              }}>
                {getCurrentStep() > 2 ? <CheckCircleOutlined style={{ fontSize: 32, color: '#fff' }} /> : <StarOutlined />}
              </div>
              <div style={{ marginTop: 8, fontWeight: getCurrentStep() === 2 ? 700 : 400, color: getCurrentStep() === 2 ? '#1976D2' : '#888' }}>
                Nhận certificate
              </div>
              {getCurrentStep() >= 2 && currentDonation.bloodType && (
                <div style={{ fontSize: 13, color: '#1976D2', marginTop: 4 }}>
                  Nhóm máu: <b>{currentDonation.bloodType}</b><br />
                  <span>Cảm ơn bạn đã hiến máu!</span>
                </div>
              )}
            </div>
          </div>

          {/* Additional Info */}
          <div style={{ marginTop: 24, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
            <Text strong>Thông tin chi tiết:</Text>
            <div style={{ marginTop: 8 }}>
              <Text>Donor ID: <Tag color="blue">{currentDonation.donorId}</Tag></Text>
              <br />
              <Text>Donation ID: <Tag color="purple">{currentDonation.id}</Tag></Text>
              <br />
              <Text>Nhóm máu: <Tag color="red">{currentDonation.bloodType}</Tag></Text>
              <br />
              <Text>Loại yêu cầu: 
                <Tag color={currentDonation.requestType === 'emergency' ? 'red' : 'blue'} style={{ marginLeft: 8 }}>
                  {currentDonation.requestType === 'emergency' ? 'Khẩn cấp' : 'Thường'}
                </Tag>
              </Text>
              <br />
              <Text>Trạng thái hiến máu: 
                <Tag color={
                  currentDonation.status === 'pending' ? 'orange' : 
                  currentDonation.status === 'approved' ? 'blue' : 
                  currentDonation.status === 'completed' ? 'green' : 'red'
                } style={{ marginLeft: 8 }}>
                  {currentDonation.status === 'pending' ? 'Chờ xác nhận' : 
                   currentDonation.status === 'approved' ? 'Đã xác nhận' : 
                   currentDonation.status === 'completed' ? 'Đã hoàn thành' : 
                   currentDonation.status === 'rejected' ? 'Đã từ chối' : currentDonation.status}
                </Tag>
              </Text>
              <br />
              <Text>Trạng thái khám sức khỏe: 
                <Tag color={
                  currentDonation.healthCheckStatus === 'pending' ? 'orange' : 
                  currentDonation.healthCheckStatus === 'approved' ? 'green' : 
                  currentDonation.healthCheckStatus === 'rejected' ? 'red' : 'default'
                } style={{ marginLeft: 8 }}>
                  {currentDonation.healthCheckStatus === 'pending' ? 'Chờ xác nhận' : 
                   currentDonation.healthCheckStatus === 'approved' ? 'Đã xác nhận' : 
                   currentDonation.healthCheckStatus === 'rejected' ? 'Đã từ chối' : 
                   currentDonation.healthCheckStatus === 'N/A' ? 'Chưa có' : currentDonation.healthCheckStatus}
                </Tag>
              </Text>
              <br />
              <Text>Ngày đăng ký: {new Date(currentDonation.requestDate).toLocaleDateString('vi-VN')}</Text>
              {currentDonation.healthCheckDate && (
                <>
                  <br />
                  <Text>Lịch khám sức khỏe: {new Date(currentDonation.healthCheckDate).toLocaleDateString('vi-VN')}</Text>
                </>
              )}
              {currentDonation.donationDate && (
                <>
                  <br />
                  <Text>Lịch hiến máu: {new Date(currentDonation.donationDate).toLocaleDateString('vi-VN')}</Text>
                </>
              )}
            </div>
          </div>
        </Card>
      ) : (
        <Card style={{ marginBottom: 32 }}>
          <Empty
            description="Bạn chưa có đơn hiến máu nào đang xử lý"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      )}

      {/* Donation History */}
      <Card title="Lịch sử hiến máu">
        {completedDonations.length > 0 ? (
          <Table
            columns={columns}
            dataSource={completedDonations.map((donation, index) => ({ ...donation, key: donation.id }))}
            pagination={false}
            locale={{
              emptyText: <Empty description="Chưa có lịch sử hiến máu" />
            }}
          />
        ) : (
          <Empty description="Chưa có lịch sử hiến máu" />
        )}
      </Card>

      {/* No Donations Message */}
      {donations.length === 0 && (
        <Card>
          <Empty
            description="Bạn chưa có đơn hiến máu nào"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      )}
    </div>
  );
};

export default BloodDonationProfile; 