import React, { useState, useEffect } from 'react';
import { Card, Steps, Typography, Table, Tag, Empty, Spin, Alert, Row, Col, Avatar, Statistic, Divider, List } from 'antd';
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
import { healthCheckApi } from '../../services/healthCheckApi';
import { donationHistoryApi } from '../../services/donationHistoryApi';
// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('userToken') || 
         localStorage.getItem('token') || 
         localStorage.getItem('authToken') ||
         localStorage.getItem('accessToken') ||
         sessionStorage.getItem('userToken') ||
         sessionStorage.getItem('token') ||
         sessionStorage.getItem('authToken') ||
         sessionStorage.getItem('accessToken');
};
// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};
import { useLocation } from 'react-router-dom';
import './BloodDonationProfile.css';

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

// Helper để chuyển đổi trạng thái khám sức khỏe sang thông báo thân thiện
const getHealthCheckStatusText = (status) => {
  if (!status || status === 'N/A') return 'Chưa có hồ sơ khám sức khỏe';
  const s = status.toLowerCase();
  if (s === 'pending') return 'Hồ sơ sức khỏe của bạn đang được xem xét';
  if (s === 'approved') return 'Đã khám sức khỏe, đủ điều kiện hiến máu';
  if (s === 'rejected') return 'Không đủ điều kiện hiến máu';
  return status;
};

const BloodDonationProfile = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDonation, setCurrentDonation] = useState(null);
  const [completedDonations, setCompletedDonations] = useState([]);
  const [healthChecks, setHealthChecks] = useState([]);
  const [donationHistory, setDonationHistory] = useState([]);
  const location = useLocation();
  // Thêm state viewStep để điều khiển bước đang xem
  const [viewStep, setViewStep] = useState(0);

  // Get current user info
  const getCurrentUser = () => {
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    const email = localStorage.getItem('email');
    console.log('DEBUG: Current user info:', { userId, username, email });
    return { userId, username, email };
  };

  const { userId, username, email } = getCurrentUser();

  // Clear cache khi component mount
  useEffect(() => {
    // Xóa cache cũ để đảm bảo lấy dữ liệu mới
    localStorage.removeItem('donorId');
    console.log('DEBUG: Cleared donorId cache for userId:', userId);
  }, [userId]);

  // Hàm lấy donorId hiện tại
  const getCurrentDonorId = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) return null;
    
    // Xóa donorId cũ để tránh cache sai
    localStorage.removeItem('donorId');
    
    try {
      // Sử dụng endpoint GET /api/Donor để lấy tất cả donors
      const res = await fetch(`http://localhost:7262/api/Donor`, { headers: getAuthHeaders() });
      const donors = await res.json();
      console.log('DEBUG: All donors from API:', donors);
      
      if (Array.isArray(donors) && donors.length > 0) {
        // Tìm donor record đúng cho user hiện tại
        const currentUserDonor = donors.find(donor => 
          donor.userId === userId || 
          donor.UserId === userId ||
          donor.userID === userId
        );
        
        if (currentUserDonor) {
          const donorId = currentUserDonor.donorId || currentUserDonor.id;
          console.log('DEBUG: Found donorId for userId', userId, ':', donorId);
          console.log('DEBUG: Full donor record:', currentUserDonor);
          return donorId;
        } else {
          console.log('DEBUG: No donor found for userId', userId, 'in donors array');
          console.log('DEBUG: Available donors:', donors.map(d => ({ userId: d.userId, donorId: d.donorId })));
          return null; // Không có donor cho user này
        }
      }
    } catch (e) {
      console.error('Không lấy được donorId từ API:', e);
    }
    return null;
  };

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
  }, [userId]); // Thêm userId làm dependency để tải lại khi đổi tài khoản

  const loadUserDonations = async () => {
    setLoading(true);
    console.log('DEBUG: Loading donations for userId:', userId);
    console.log('DEBUG: Current user email:', email);
    const donorId = await getCurrentDonorId();
    console.log('DEBUG: Retrieved donorId:', donorId);
    if (!donorId) {
      console.log('DEBUG: No donor found for user, showing empty state');
      setDonations([]);
      setCurrentDonation(null);
      setCompletedDonations([]);
      setLoading(false);
      return;
    }

    try {
      // Fetch blood donations
      console.log('DEBUG: Fetching blood donations for donorId:', donorId);
      const donationData = await bloodDonationApi.getBloodDonationsByDonor(donorId);
      console.log('DEBUG: Raw donation data from API:', donationData);
      const formattedDonations = Array.isArray(donationData) ? donationData.map(formatDonationData) : [];
      console.log('DEBUG: Formatted donations:', formattedDonations);
      setDonations(formattedDonations);

      // Fetch health checks for this donor
      let donorHealthChecks = [];
      try {
        const healthCheckData = await healthCheckApi.getAllHealthChecks();
        console.log('DEBUG: All health checks from API:', healthCheckData);
        
        donorHealthChecks = Array.isArray(healthCheckData) ? healthCheckData.filter(hc => 
          hc.donorId === donorId || hc.DonorId === donorId || hc.donorID === donorId
        ) : [];
        setHealthChecks(donorHealthChecks);
        console.log('DEBUG: Filtered health checks for donor:', donorHealthChecks);
        console.log('DEBUG: Looking for donorId:', donorId);
      } catch (healthCheckError) {
        console.error('Error loading health checks:', healthCheckError);
        setHealthChecks([]);
      }

      // Find current active donation (pending or approved, case-insensitive)
      const activeDonation = formattedDonations.find(d => 
        d.status && d.status.toLowerCase() === 'pending'
      ) || formattedDonations.find(d => 
        d.status && d.status.toLowerCase() === 'approved'
      );
      
      // Merge health check data with active donation
      if (activeDonation) {
        console.log('DEBUG: Active donation:', activeDonation);
        console.log('DEBUG: Available health checks:', donorHealthChecks);
        
        // Try to find related health check by multiple possible relationships
        const relatedHealthCheck = donorHealthChecks.find(hc => 
          hc.donationId === activeDonation.id || 
          hc.DonationId === activeDonation.id ||
          hc.bloodDonationId === activeDonation.id ||
          hc.bloodDonationID === activeDonation.id ||
          hc.donationID === activeDonation.id
        );
        
        if (relatedHealthCheck) {
          activeDonation.healthCheckStatus = relatedHealthCheck.healthCheckStatus || relatedHealthCheck.HealthCheckStatus || 'N/A';
          activeDonation.healthCheckDate = relatedHealthCheck.healthCheckDate || relatedHealthCheck.HealthCheckDate;
          activeDonation.healthCheckId = relatedHealthCheck.healthCheckId || relatedHealthCheck.HealthCheckId;
          console.log('DEBUG: Merged health check data:', {
            donationId: activeDonation.id,
            healthCheckStatus: activeDonation.healthCheckStatus,
            healthCheckDate: activeDonation.healthCheckDate,
            relatedHealthCheck: relatedHealthCheck
          });
        } else {
          // If no direct relationship found, try to use the most recent health check for this donor
          const mostRecentHealthCheck = donorHealthChecks
            .filter(hc => hc.healthCheckDate || hc.HealthCheckDate)
            .sort((a, b) => new Date(b.healthCheckDate || b.HealthCheckDate) - new Date(a.healthCheckDate || a.HealthCheckDate))[0];
          
          if (mostRecentHealthCheck) {
            activeDonation.healthCheckStatus = mostRecentHealthCheck.healthCheckStatus || mostRecentHealthCheck.HealthCheckStatus || 'N/A';
            activeDonation.healthCheckDate = mostRecentHealthCheck.healthCheckDate || mostRecentHealthCheck.HealthCheckDate;
            activeDonation.healthCheckId = mostRecentHealthCheck.healthCheckId || mostRecentHealthCheck.HealthCheckId;
            console.log('DEBUG: Using most recent health check:', {
              donationId: activeDonation.id,
              healthCheckStatus: activeDonation.healthCheckStatus,
              healthCheckDate: activeDonation.healthCheckDate,
              mostRecentHealthCheck: mostRecentHealthCheck
            });
          } else {
            console.log('DEBUG: No health check found for donation:', activeDonation.id);
          }
        }
      }
      
      setCurrentDonation(activeDonation);

      // Get completed donations for history
      const completed = formattedDonations.filter(d => d.status === 'completed');
      setCompletedDonations(completed);

      // Load donation history from DonationHistory API
      try {
        console.log('DEBUG: Loading donation history for donorId:', donorId);
        const historyData = await donationHistoryApi.getAllDonationHistory();
        console.log('DEBUG: Raw donation history data:', historyData);
        
        // Filter history for current donor
        const donorHistory = Array.isArray(historyData) ? historyData.filter(history => 
          history.donorID === donorId || history.donorId === donorId
        ) : [];
        
        console.log('DEBUG: Filtered donation history for donor:', donorHistory);
        setDonationHistory(donorHistory);
      } catch (historyError) {
        console.error('Error loading donation history:', historyError);
        setDonationHistory([]);
      }

    } catch (error) {
      console.error('Error loading user donations:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDonationData = (donation) => {
    return {
      id: donation.DonationId || donation.donationID || donation.donationId || donation.id || '--',
      donorId: donation.DonorId || donation.donorId || donation.donorID || donation.userId || 'N/A',
      bloodType: donation.bloodType || donation.bloodTypeName || 'N/A',
      requestType: donation.requestType || 'regular',
      status: donation.Status || donation.status || 'pending',
      requestDate: donation.requestDate || donation.createdAt,
      healthCheckDate: donation.HealthCheckDate || donation.healthCheckDate,
      donationDate: donation.donationDate,
      location: donation.location || 'N/A',
      notes: donation.Notes || donation.notes || '',
      requestId: donation.requestId || null,
      rejectionReason: donation.rejectionReason,
      healthCheckStatus: donation.HealthCheckStatus || donation.healthCheckStatus || 'N/A',
      certificateId: donation.CertificateId || donation.certificateId || null
    };
  };

  const formatDonationHistoryData = (history) => {
    return {
      id: history.historyID || history.id || '--',
      donorId: history.donorID || history.donorId || 'N/A',
      donationDate: history.donationDate,
      quantity: history.quantity || 'N/A',
      healthStatus: history.healthStatus || 'N/A',
      nextEligibleDate: history.nextEligibleDate,
      certificateId: history.certificateID || history.certificateId || null
    };
  };

  // Determine current step based on donation status and health check status
  const getCurrentStep = () => {
    if (!currentDonation) return 0;
    const status = currentDonation.status ? currentDonation.status.toLowerCase() : '';
    const healthCheckStatus = currentDonation.healthCheckStatus ? currentDonation.healthCheckStatus.toLowerCase() : '';
    
    if (status === 'pending') return 0;
    if (status === 'approved') {
      // Nếu phiếu sức khỏe đã được approved thì chuyển sang bước cuối
      if (healthCheckStatus === 'approved') return 2;
      // Nếu chưa approved thì ở bước khám sức khỏe
      return 1;
    }
    if (status === 'completed') return 2;
    return 0;
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
      title: 'Lượng máu (ml)',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity) => quantity ? `${quantity} ml` : 'N/A',
    },
    {
      title: 'Tình trạng sức khỏe',
      dataIndex: 'healthStatus',
      key: 'healthStatus',
      render: (status) => {
        const color = status === 'Good' ? 'green' : status === 'Fair' ? 'orange' : 'red';
        return <Tag color={color}>{status || 'N/A'}</Tag>;
      },
    },
    {
      title: 'Ngày hiến máu tiếp theo',
      dataIndex: 'nextEligibleDate',
      key: 'nextEligibleDate',
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A',
    },
    {
      title: 'Chứng chỉ',
      dataIndex: 'certificateId',
      key: 'certificateId',
      render: (certId) =>
        certId ? (
          <a href={`/member/certificate?certificateId=${certId}`}>
            <button style={{
              background: '#1976D2',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '4px 12px',
              fontSize: 14,
              cursor: 'pointer'
            }}>
              Xem chứng chỉ
            </button>
          </a>
        ) : 'N/A',
    },
  ];

  useEffect(() => {
    // Khi currentDonation thay đổi, cập nhật viewStep về bước hiện tại
    setViewStep(getCurrentStep());
  }, [currentDonation]);

  if (loading) {
    return (
      <div className="profile-loading">
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Đang tải thông tin hiến máu...</div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="profile-alert">
        <Alert
          message="Vui lòng đăng nhập"
          description="Bạn cần đăng nhập để xem hồ sơ hiến máu."
          type="warning"
          showIcon
        />
      </div>
    );
  }

  // Tổng số lần hiến và tổng lượng máu
  const totalDonations = donationHistory.length;
  const totalQuantity = donationHistory.reduce((sum, d) => sum + (parseInt(d.quantity) || 0), 0);
  const bloodType = (donationHistory[0]?.bloodType || currentDonation?.bloodType || 'N/A');

  return (
    <div className="profile-container">
      {/* Card thông tin cá nhân */}
      <Card className="profile-card" bordered={false}>
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={6} className="profile-avatar-col">
            <Avatar size={100} icon={<UserOutlined />} style={{ background: '#1976D2' }} />
          </Col>
          <Col xs={24} md={18} className="profile-info-col">
            <Title level={3} style={{ marginBottom: 0 }}>{username}</Title>
            <div style={{ margin: '8px 0' }}>
              <Tag color="red" style={{ fontSize: 16 }}>{bloodType}</Tag>
            </div>
            <Row gutter={16}>
              <Col span={8}><Statistic title="Tổng số lần hiến" value={totalDonations} prefix={<HeartOutlined />} /></Col>
              <Col span={8}><Statistic title="Tổng lượng máu (ml)" value={totalQuantity} /></Col>
              <Col span={8}><Statistic title="Trạng thái" value={currentDonation?.status || 'N/A'} prefix={<CheckCircleOutlined />} /></Col>
            </Row>
          </Col>
        </Row>
      </Card>
      <Divider />
      {/* Quy trình hiến máu hiện tại */}
      {currentDonation && (
        <Card className="profile-process-card" style={{ marginBottom: 32 }}>
          <div style={{ marginBottom: 16 }}>
            <Title level={4}>
              <FileTextOutlined style={{ marginRight: 8 }} />
              Quy trình hiến máu hiện tại
              {currentDonation.id && (
                <span style={{ fontSize: 15, marginLeft: 16, color: '#1976D2' }}>
                  (ID: <b>{currentDonation.id}</b>)
                </span>
              )}
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
            <div
              style={{ flex: 1, textAlign: 'center', opacity: 1, cursor: 'pointer' }}
              onClick={() => setViewStep(0)}
            >
              <div style={{
                width: 56, height: 56, margin: '0 auto', borderRadius: '50%',
                background: viewStep === 0 ? '#1976D2' : (viewStep > 0 ? '#4CAF50' : '#e0e0e0'),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 32, border: viewStep === 0 ? '3px solid #1976D2' : 'none',
                boxShadow: viewStep === 0 ? '0 0 0 4px #1976d233' : 'none',
                position: 'relative',
                transition: 'all 0.2s',
              }}>
                {viewStep > 0 ? <CheckCircleOutlined style={{ fontSize: 32, color: '#fff' }} /> : <FileTextOutlined />}
              </div>
              <div style={{ marginTop: 8, fontWeight: viewStep === 0 ? 700 : 400, color: viewStep === 0 ? '#1976D2' : '#888' }}>
                Chờ xác nhận
              </div>
            </div>
            {/* Line */}
            <div style={{ width: 40, height: 3, background: viewStep > 0 ? '#4CAF50' : '#e0e0e0', marginTop: 26 }} />
            {/* Bước 2: Khám sức khỏe & Hiến máu */}
            <div
              style={{ flex: 1, textAlign: 'center', opacity: viewStep >= 1 ? 1 : 0.5, cursor: getCurrentStep() >= 1 ? 'pointer' : 'not-allowed' }}
              onClick={getCurrentStep() >= 1 ? () => setViewStep(1) : undefined}
            >
              <div style={{
                width: 56, height: 56, margin: '0 auto', borderRadius: '50%',
                background: viewStep === 1 ? '#1976D2' : (viewStep > 1 ? '#4CAF50' : '#e0e0e0'),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 32, border: viewStep === 1 ? '3px solid #1976D2' : 'none',
                boxShadow: viewStep === 1 ? '0 0 0 4px #1976d233' : 'none',
                position: 'relative',
                transition: 'all 0.2s',
              }}>
                {viewStep > 1 ? <CheckCircleOutlined style={{ fontSize: 32, color: '#fff' }} /> : <SolutionOutlined />}
              </div>
              <div style={{ marginTop: 8, fontWeight: viewStep === 1 ? 700 : 400, color: viewStep === 1 ? '#1976D2' : '#888' }}>
                Khám sức khỏe & Hiến máu
              </div>
            </div>
            {/* Line */}
            <div style={{ width: 40, height: 3, background: viewStep > 1 ? '#4CAF50' : '#e0e0e0', marginTop: 26 }} />
            {/* Bước 3: Nhận certificate */}
            <div
              style={{ flex: 1, textAlign: 'center', opacity: viewStep === 2 ? 1 : (viewStep > 2 ? 1 : 0.5), cursor: getCurrentStep() >= 2 ? 'pointer' : 'not-allowed' }}
              onClick={getCurrentStep() >= 2 ? () => setViewStep(2) : undefined}
            >
              <div style={{
                width: 56, height: 56, margin: '0 auto', borderRadius: '50%',
                background: viewStep === 2 ? '#1976D2' : (viewStep > 2 ? '#4CAF50' : '#e0e0e0'),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 32, border: viewStep === 2 ? '3px solid #1976D2' : 'none',
                boxShadow: viewStep === 2 ? '0 0 0 4px #1976d233' : 'none',
                position: 'relative',
                transition: 'all 0.2s',
              }}>
                {viewStep > 2 ? <CheckCircleOutlined style={{ fontSize: 32, color: '#fff' }} /> : <StarOutlined />}
              </div>
              <div style={{ marginTop: 8, fontWeight: viewStep === 2 ? 700 : 400, color: viewStep === 2 ? '#1976D2' : '#888' }}>
                Nhận certificate
              </div>
              {viewStep >= 2 && currentDonation && currentDonation.bloodType && (
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
              {/* Hiển thị chi tiết theo viewStep */}
              {viewStep === 0 && (
                <>
                  {/* Bước 1: Chờ xác nhận */}
                  <Text>Loại yêu cầu: 
                    <Tag color={currentDonation.requestType === 'emergency' ? 'red' : 'blue'} style={{ marginLeft: 8 }}>
                      {currentDonation.requestType === 'emergency' ? 'Khẩn cấp' : 'Thường'}
                    </Tag>
                  </Text>
                  <br />
                  {currentDonation.status && currentDonation.status.toLowerCase() === 'pending' ? (
                    <div style={{ color: '#faad14', fontWeight: 500, margin: '8px 0' }}>
                      Đơn đăng ký hiến máu của bạn đang được chờ để xử lý.
                    </div>
                  ) : currentDonation.status && currentDonation.status.toLowerCase() === 'approved' ? (
                    <div style={{ color: '#1976D2', fontWeight: 500, margin: '8px 0' }}>
                      Đơn đăng ký hiến máu của bạn đã được duyệt.
                    </div>
                  ) : (
                    <>
                      <Text>Trạng thái hiến máu: 
                        <Tag color={
                          currentDonation.status && currentDonation.status.toLowerCase() === 'approved' ? 'blue' : 
                          currentDonation.status && currentDonation.status.toLowerCase() === 'completed' ? 'green' : 'red'
                        } style={{ marginLeft: 8 }}>
                          {currentDonation.status}
                        </Tag>
                      </Text>
                      <br />
                    </>
                  )}
                  {currentDonation.donationDate && (
                    <>
                      <Text>Ngày hiến máu dự định: {new Date(currentDonation.donationDate).toLocaleDateString('vi-VN')}</Text>
                    </>
                  )}
                  {/* Nếu bị từ chối ở bước này */}
                  {(currentDonation.status && currentDonation.status.toLowerCase() === 'rejected') && (
                    <div style={{ textAlign: 'center', marginTop: 16 }}>
                      <a href="/member/blood-donation-register">
                        <button
                          style={{
                            background: '#E91E63',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 6,
                            padding: '8px 20px',
                            fontSize: 16,
                            cursor: 'pointer',
                            fontWeight: 500
                          }}
                          onClick={() => setViewStep(0)}
                        >
                          Đăng ký hiến máu lại
                        </button>
                      </a>
                    </div>
                  )}
                </>
              )}
              {viewStep === 1 && (
                <>
                  {/* Bước 2: Khám sức khỏe & Hiến máu */}
                  {currentDonation.healthCheckDate ? (
                    <>
                      <Text>Ngày khám sức khỏe: {new Date(currentDonation.healthCheckDate).toLocaleDateString('vi-VN')}</Text>
                      <br />
                    </>
                  ) : currentDonation.donationDate ? (
                    <>
                      <Text>Lịch Khám sức khỏe & Hiến máu: {new Date(currentDonation.donationDate).toLocaleDateString('vi-VN')}</Text>
                      <br />
                    </>
                  ) : null}
                  {/* Trạng thái khám sức khỏe */}
                  <Text>Trạng thái khám sức khỏe: 
                    <Tag color={
                      currentDonation.healthCheckStatus === 'pending' ? 'orange' : 
                      currentDonation.healthCheckStatus === 'approved' ? 'green' : 
                      currentDonation.healthCheckStatus === 'rejected' ? 'red' : 'default'
                    } style={{ marginLeft: 8 }}>
                      {getHealthCheckStatusText(currentDonation.healthCheckStatus)}
                    </Tag>
                  </Text>
                  <br />
                  {/* Nếu bị từ chối ở bước này */}
                  {(currentDonation.healthCheckStatus && currentDonation.healthCheckStatus.toLowerCase() === 'rejected') && (
                    <div style={{ textAlign: 'center', marginTop: 16 }}>
                      <a href="/member/blood-donation-register">
                        <button
                          style={{
                            background: '#E91E63',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 6,
                            padding: '8px 20px',
                            fontSize: 16,
                            cursor: 'pointer',
                            fontWeight: 500
                          }}
                          onClick={() => setViewStep(0)}
                        >
                          Đăng ký hiến máu lại
                        </button>
                      </a>
                    </div>
                  )}
                </>
              )}
              {viewStep === 2 && (
                <>
                  {/* Bước 3: Nhận certificate */}
                  {currentDonation.donationDate && (
                    <>
                      <Text>Ngày hiến máu: {new Date(currentDonation.donationDate).toLocaleDateString('vi-VN')}</Text>
                      <br />
                    </>
                  )}
                  <Text>Trạng thái khám sức khỏe: 
                    <Tag color={
                      currentDonation.healthCheckStatus === 'pending' ? 'orange' : 
                      currentDonation.healthCheckStatus === 'approved' ? 'green' : 
                      currentDonation.healthCheckStatus === 'rejected' ? 'red' : 'default'
                    } style={{ marginLeft: 8 }}>
                      {getHealthCheckStatusText(currentDonation.healthCheckStatus)}
                    </Tag>
                  </Text>
                  <br />
                  {currentDonation.certificateId && (
                    <div style={{ marginTop: 16, textAlign: 'center' }}>
                      <Text strong style={{ fontSize: 16, color: '#1976D2' }}>
                        Chúc mừng bạn đã nhận được chứng chỉ hiến máu!
                      </Text>
                      <div style={{ margin: '12px 0' }}>
                        <span style={{ color: '#4CAF50', fontWeight: 500 }}>
                          Cảm ơn bạn đã tham gia hiến máu và lan tỏa nghĩa cử cao đẹp!
                        </span>
                      </div>
                      <a href="/member/certificate">
                        <button
                          style={{
                            background: '#1976D2',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 6,
                            padding: '8px 20px',
                            fontSize: 16,
                            cursor: 'pointer',
                            fontWeight: 500
                          }}
                          onClick={() => setViewStep(0)}
                        >
                          Xem Chứng nhận đăng ký hiến máu
                        </button>
                      </a>
                    </div>
                  )}
                  {/* Nếu bị từ chối ở bước này */}
                  {(currentDonation.status && currentDonation.status.toLowerCase() === 'rejected') || (currentDonation.healthCheckStatus && currentDonation.healthCheckStatus.toLowerCase() === 'rejected') ? (
                    <div style={{ textAlign: 'center', marginTop: 16 }}>
                      <a href="/member/blood-donation-register">
                        <button
                          style={{
                            background: '#E91E63',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 6,
                            padding: '8px 20px',
                            fontSize: 16,
                            cursor: 'pointer',
                            fontWeight: 500
                          }}
                          onClick={() => setViewStep(0)}
                        >
                          Đăng ký hiến máu lại
                        </button>
                      </a>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </Card>
      )}
      {/* Lịch sử hiến máu */}
      <Card className="profile-history-card" title="Lịch sử hiến máu">
        {donationHistory.length > 0 ? (
          <Table
            columns={columns}
            dataSource={donationHistory.map((history, index) => ({ 
              ...formatDonationHistoryData(history), 
              key: history.historyID || history.id || index 
            }))}
            pagination={false}
            locale={{
              emptyText: <Empty description="Chưa có lịch sử hiến máu" />
            }}
          />
        ) : (
          <div className="profile-empty-history">
            <Empty description={null} />
            <div style={{ marginTop: 16, fontSize: 16 }}>
              Bạn chưa từng hiến máu. Hãy đăng ký hiến máu tại đây
            </div>
            <a href="/member/blood-donation-register">
              <button className="profile-register-btn">
                Đăng ký hiến máu
              </button>
            </a>
          </div>
        )}
      </Card>
      {/* No Donations Message */}
      {donations.length === 0 && (
        <Card className="profile-no-donation">
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