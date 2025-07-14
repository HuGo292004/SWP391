import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  List,
  Tag,
  Space,
  Divider,
  Modal,
  Badge,
  Alert,
  Spin,
  Empty
} from 'antd';
import {
  DownloadOutlined,
  EyeOutlined,
  CalendarOutlined,
  HeartOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  TrophyOutlined,
  PrinterOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { certificateApi } from '../../services/certificateApi';
import { UserAPI } from '../../services/userApi';

const { Title, Text, Paragraph } = Typography;

const Certificate = () => {
  const [loading, setLoading] = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);

  // Mock user data - in real app, get from auth context
  const userInfo = {
    fullName: localStorage.getItem('userFullName') || 'Nguyễn Văn An',
    userId: localStorage.getItem('userId') || 'USER001',
    memberSince: '2023-01-15'
  };

  // Mock certificates data - replace with API call
  const mockCertificates = [
    {
      id: 'CERT001',
      donationId: 'DON001',
      donationDate: '2024-01-15',
      bloodType: 'A+',
      volume: 450,
      location: 'Trung tâm Hiến máu Quận 1',
      certificateNumber: 'HM2024001',
      status: 'issued',
      issueDate: '2024-01-16',
      validUntil: '2026-01-16',
      type: 'donation'
    },
    {
      id: 'CERT002',
      donationId: 'DON005',
      donationDate: '2024-03-20',
      bloodType: 'A+',
      volume: 450,
      location: 'Bệnh viện Chợ Rẫy',
      certificateNumber: 'HM2024005',
      status: 'issued',
      issueDate: '2024-03-21',
      validUntil: '2026-03-21',
      type: 'donation'
    },
    {
      id: 'CERT003',
      achievementType: 'milestone',
      title: 'Người hiến máu tình nguyện xuất sắc',
      description: 'Đã hiến máu 5 lần trong năm 2024',
      donationCount: 5,
      certificateNumber: 'KT2024001',
      status: 'issued',
      issueDate: '2024-12-01',
      validUntil: 'permanent',
      type: 'achievement'
    }
  ];

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      // Lấy user hiện tại
      let currentUser = null;
      try {
        currentUser = await UserAPI.getCurrentUser();
      } catch (e) {
        // fallback nếu lỗi
        currentUser = {
          userId: localStorage.getItem('userId'),
          fullName: localStorage.getItem('userFullName')
        };
      }
      // Gọi API lấy tất cả certificates
      const apiCertificates = await certificateApi.getAll();
      // Map dữ liệu từ API sang format UI
      const mapped = (Array.isArray(apiCertificates) ? apiCertificates : []).map((c) => ({
        id: c.certificateId || c.id,
        certificateNumber: c.certificateNumber,
        issueDate: c.issueDate,
        type: c.certificateType === 'Blood Donation' ? 'donation' : 'achievement',
        bloodType: c.bloodType,
        bloodDonationDate: c.bloodDonationDate,
        fullName: c.fullName,
        address: c.address,
        donationId: c.donationId,
        donorId: c.donorId,
        userId: c.userId,
        status: 'issued',
      }));
      // Lọc chỉ giữ certificate của user hiện tại
      let filtered = mapped;
      if (currentUser && (currentUser.userId || currentUser.fullName)) {
        filtered = mapped.filter(c =>
          (c.donorId && c.donorId === currentUser.userId) ||
          (c.userId && c.userId === currentUser.userId) ||
          (c.fullName && c.fullName === currentUser.fullName)
        );
      }
      setCertificates(filtered);
    } catch (error) {
      console.error('Error loading certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'issued': return 'green';
      case 'pending': return 'orange';
      case 'expired': return 'red';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'issued': return 'Đã cấp';
      case 'pending': return 'Đang xử lý';
      case 'expired': return 'Hết hạn';
      default: return status;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'donation': return <FileTextOutlined style={{ color: '#1890ff' }} />;
      case 'achievement': return <TrophyOutlined style={{ color: '#faad14' }} />;
      default: return <SafetyCertificateOutlined />;
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'donation': return 'Chứng nhận hiến máu';
      case 'achievement': return 'Giấy khen';
      default: return 'Chứng chỉ';
    }
  };

  const handleDownload = (certificate) => {
    // Simulate certificate download
    const element = document.createElement('a');
    const content = `Chứng nhận hiến máu
    
Họ và tên: ${userInfo.fullName}
Số chứng nhận: ${certificate.certificateNumber}
${certificate.type === 'donation' ? 
  `Ngày hiến máu: ${dayjs(certificate.bloodDonationDate).format('DD/MM/YYYY')}
Nhóm máu: ${certificate.bloodType}
Thể tích: ${certificate.volume}ml
Địa điểm: ${certificate.address}` :
  `Thành tích: ${certificate.title}
Mô tả: ${certificate.description}
Số lần hiến máu: ${certificate.donationCount}`
}

Ngày cấp: ${dayjs(certificate.issueDate).format('DD/MM/YYYY')}
Hiệu lực đến: ${certificate.validUntil === 'permanent' ? 'Vĩnh viễn' : dayjs(certificate.validUntil).format('DD/MM/YYYY')}`;
    
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `Certificate_${certificate.certificateNumber}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePreview = (certificate) => {
    setSelectedCertificate(certificate);
    setPreviewVisible(true);
  };

  const renderCertificatePreview = () => {
    if (!selectedCertificate) return null;

    return (
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '40px',
        borderRadius: '12px',
        color: 'white',
        textAlign: 'center',
        minHeight: '500px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        <div style={{ marginBottom: '30px' }}>
          <Title level={2} style={{ color: 'white', marginBottom: '8px' }}>
            {getTypeText(selectedCertificate.type)}
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px' }}>
            Hệ thống quản lý hiến máu BloodDonate
          </Text>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <Title level={4} style={{ color: 'white', marginBottom: '20px' }}>
            Chứng nhận cho
          </Title>
          <Title level={3} style={{ color: '#ffd700', marginBottom: '0' }}>
            {selectedCertificate.fullName || userInfo.fullName}
          </Title>
        </div>

        {selectedCertificate.type === 'donation' ? (
          <div style={{ marginBottom: '30px' }}>
            <Row gutter={[16, 16]} justify="center">
              <Col span={12}>
                <Text style={{ color: 'rgba(255,255,255,0.8)' }}>Ngày hiến máu:</Text>
                <br />
                <Text strong style={{ color: 'white', fontSize: '16px' }}>
                  {dayjs(selectedCertificate.bloodDonationDate).format('DD/MM/YYYY')}
                </Text>
              </Col>
              <Col span={12}>
                <Text style={{ color: 'rgba(255,255,255,0.8)' }}>Nhóm máu:</Text>
                <br />
                <Text strong style={{ color: '#ff6b6b', fontSize: '18px' }}>
                  {selectedCertificate.bloodType}
                </Text>
              </Col>
            </Row>
            <Row gutter={[16, 16]} justify="center" style={{ marginTop: '16px' }}>
              <Col span={12}>
                <Text style={{ color: 'rgba(255,255,255,0.8)' }}>Thể tích:</Text>
                <br />
                <Text strong style={{ color: 'white', fontSize: '16px' }}>
                  {selectedCertificate.volume} ml
                </Text>
              </Col>
              <Col span={12}>
                <Text style={{ color: 'rgba(255,255,255,0.8)' }}>Địa điểm:</Text>
                <br />
                <Text strong style={{ color: 'white', fontSize: '14px' }}>
                  {selectedCertificate.address}
                </Text>
              </Col>
            </Row>
          </div>
        ) : (
          <div style={{ marginBottom: '30px' }}>
            <Title level={4} style={{ color: '#ffd700', marginBottom: '16px' }}>
              {selectedCertificate.title}
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', display: 'block', marginBottom: '16px' }}>
              {selectedCertificate.description}
            </Text>
            <Text strong style={{ color: '#ff6b6b', fontSize: '18px' }}>
              {selectedCertificate.donationCount} lần hiến máu
            </Text>
          </div>
        )}

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: '20px' }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>
                Số chứng nhận: {selectedCertificate.certificateNumber}
              </Text>
            </Col>
            <Col>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>
                Ngày cấp: {dayjs(selectedCertificate.issueDate).format('DD/MM/YYYY')}
              </Text>
            </Col>
          </Row>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ marginBottom: '8px' }}>
          <SafetyCertificateOutlined style={{ marginRight: '12px', color: '#1890ff' }} />
          Chứng Chỉ & Giấy Khen
        </Title>
        <Text type="secondary">Quản lý các chứng nhận hiến máu và giấy khen của bạn</Text>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <FileTextOutlined style={{ fontSize: '24px', color: '#1890ff', marginBottom: '8px' }} />
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                {certificates.filter(c => c.type === 'donation').length}
              </div>
              <div style={{ color: '#666' }}>Chứng nhận hiến máu</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <TrophyOutlined style={{ fontSize: '24px', color: '#faad14', marginBottom: '8px' }} />
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>
                {certificates.filter(c => c.type === 'achievement').length}
              </div>
              <div style={{ color: '#666' }}>Giấy khen</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <SafetyCertificateOutlined style={{ fontSize: '24px', color: '#52c41a', marginBottom: '8px' }} />
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                {certificates.filter(c => c.status === 'issued').length}
              </div>
              <div style={{ color: '#666' }}>Đã cấp</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Info Alert */}
      <Alert
        message="Thông tin quan trọng"
        description="Các chứng nhận sẽ được tự động tạo sau khi bạn hoàn thành hiến máu. Bạn có thể tải xuống và in chứng nhận để lưu trữ."
        type="info"
        showIcon
        style={{ marginBottom: '24px' }}
      />

      {/* Certificates List */}
      <Card title="Danh sách chứng chỉ" loading={loading}>
        {certificates.length === 0 && !loading ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Chưa có chứng chỉ nào"
            style={{ margin: '40px 0' }}
          >
            <Text type="secondary">
              Chứng chỉ sẽ được tạo tự động sau khi bạn hoàn thành hiến máu
            </Text>
          </Empty>
        ) : (
          <List
            dataSource={certificates}
            renderItem={(certificate) => (
              <List.Item
                actions={[
                  <Button
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={() => handlePreview(certificate)}
                  >
                    Xem trước
                  </Button>,
                  <Button
                    type="text"
                    icon={<DownloadOutlined />}
                    onClick={() => handleDownload(certificate)}
                  >
                    Tải xuống
                  </Button>,
                  <Button
                    type="text"
                    icon={<PrinterOutlined />}
                    onClick={() => {
                      handlePreview(certificate);
                      setTimeout(() => window.print(), 500);
                    }}
                  >
                    In
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <div style={{ 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '8px', 
                      background: certificate.type === 'donation' ? '#e6f7ff' : '#fff7e6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px'
                    }}>
                      {getTypeIcon(certificate.type)}
                    </div>
                  }
                  title={
                    <div>
                      <Space>
                        <Text strong>{getTypeText(certificate.type)}</Text>
                        <Tag color={getStatusColor(certificate.status)}>
                          {getStatusText(certificate.status)}
                        </Tag>
                      </Space>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        #{certificate.certificateNumber}
                      </Text>
                    </div>
                  }
                  description={
                    <div>
                      {certificate.type === 'donation' ? (
                        <div>
                          <Text>
                            <CalendarOutlined style={{ marginRight: '4px' }} />
                            {dayjs(certificate.bloodDonationDate).format('DD/MM/YYYY')}
                          </Text>
                          <Divider type="vertical" />
                          <Text>
                            <HeartOutlined style={{ marginRight: '4px', color: '#ff4d4f' }} />
                            {certificate.bloodType}
                          </Text>
                          <Divider type="vertical" />
                          <Text>{certificate.volume}ml</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {certificate.address}
                          </Text>
                        </div>
                      ) : (
                        <div>
                          <Text strong style={{ color: '#faad14' }}>
                            {certificate.title}
                          </Text>
                          <br />
                          <Text type="secondary">{certificate.description}</Text>
                        </div>
                      )}
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Cấp ngày: {dayjs(certificate.issueDate).format('DD/MM/YYYY')}
                        {certificate.validUntil !== 'permanent' && 
                          ` • Hết hạn: ${dayjs(certificate.validUntil).format('DD/MM/YYYY')}`
                        }
                      </Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>

      {/* Preview Modal */}
      <Modal
        title={
          <span>
            <FileTextOutlined style={{ marginRight: '8px' }} />
            Xem trước chứng chỉ
          </span>
        }
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        width={800}
        footer={[
          <Button key="print" icon={<PrinterOutlined />} onClick={() => window.print()}>
            In chứng chỉ
          </Button>,
          <Button key="download" type="primary" icon={<DownloadOutlined />} onClick={() => handleDownload(selectedCertificate)}>
            Tải xuống
          </Button>,
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            Đóng
          </Button>
        ]}
      >
        {renderCertificatePreview()}
      </Modal>
    </div>
  );
};

export default Certificate; 