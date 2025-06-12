import React from 'react';
import { Typography, Card, Tag, Space, Button } from 'antd';
import { 
  NotificationOutlined, 
  CalendarOutlined,
  UserOutlined,
  EyeOutlined,
  MedicineBoxOutlined,
  AlertOutlined,
  HeartOutlined
} from '@ant-design/icons';
import { Container, Row, Col } from 'react-bootstrap';

const { Title, Paragraph, Text } = Typography;

const StaffNews = () => {
  const newsItems = [
    {
      id: 1,
      title: 'Cập nhật quy trình kiểm tra sức khỏe mới',
      summary: 'Hướng dẫn áp dụng quy trình kiểm tra sức khỏe cập nhật theo tiêu chuẩn mới từ Bộ Y tế',
      date: '2024-12-15',
      author: 'Ban Quản Lý',
      category: 'Quy trình',
      priority: 'high',
      views: 145
    },
    {
      id: 2,
      title: 'Thông báo lịch nghỉ và ca trực cuối năm',
      summary: 'Lịch phân công ca trực và nghỉ phép trong dịp Tết Nguyên Đán 2024',
      date: '2024-12-10',
      author: 'Phòng Nhân Sự',
      category: 'Thông báo',
      priority: 'normal',
      views: 89
    },
    {
      id: 3,
      title: 'Chiến dịch hiến máu mùa đông - Kế hoạch tổ chức',
      summary: 'Chi tiết kế hoạch và phân công nhiệm vụ cho chiến dịch hiến máu mùa đông 2024',
      date: '2024-12-08',
      author: 'Phòng Tổ Chức',
      category: 'Chiến dịch',
      priority: 'high',
      views: 203
    },
    {
      id: 4,
      title: 'Cập nhật phần mềm quản lý hiến máu phiên bản 2.1',
      summary: 'Hướng dẫn sử dụng các tính năng mới và thay đổi trong phiên bản cập nhật',
      date: '2024-12-05',
      author: 'Phòng CNTT',
      category: 'Công nghệ',
      priority: 'normal',
      views: 67
    },
    {
      id: 5,
      title: 'Báo cáo kết quả hoạt động tháng 11/2024',
      summary: 'Tổng kết số liệu hiến máu, đánh giá hiệu quả và kế hoạch cải thiện',
      date: '2024-12-01',
      author: 'Ban Giám Đốc',
      category: 'Báo cáo',
      priority: 'normal',
      views: 156
    }
  ];

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return '#f5222d';
      case 'normal': return '#1890ff';
      default: return '#52c41a';
    }
  };

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'Quy trình': return <MedicineBoxOutlined />;
      case 'Thông báo': return <NotificationOutlined />;
      case 'Chiến dịch': return <HeartOutlined />;
      case 'Công nghệ': return <AlertOutlined />;
      case 'Báo cáo': return <CalendarOutlined />;
      default: return <NotificationOutlined />;
    }
  };

  return (
    <div style={{ padding: '40px 0', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Container>
        {/* Header */}
        <Row className="mb-5">
          <Col>
            <div className="text-center">
              <Space direction="vertical" size="small">
                <NotificationOutlined style={{ fontSize: '48px', color: '#1976D2' }} />
                <Title level={1} style={{ color: '#1976D2', margin: 0 }}>
                  Tin Tức & Thông Báo Nội Bộ
                </Title>
                <Paragraph style={{ fontSize: '18px', color: '#666', maxWidth: '600px', margin: '0 auto' }}>
                  Cập nhật thông tin mới nhất về quy trình, chính sách và hoạt động của trung tâm
                </Paragraph>
              </Space>
            </div>
          </Col>
        </Row>

        {/* News Categories */}
        <Row className="mb-4">
          <Col>
            <Card>
              <Space wrap>
                <Tag color="red" style={{ padding: '4px 12px', fontSize: '14px' }}>
                  <MedicineBoxOutlined /> Quy trình
                </Tag>
                <Tag color="blue" style={{ padding: '4px 12px', fontSize: '14px' }}>
                  <NotificationOutlined /> Thông báo
                </Tag>
                <Tag color="pink" style={{ padding: '4px 12px', fontSize: '14px' }}>
                  <HeartOutlined /> Chiến dịch
                </Tag>
                <Tag color="orange" style={{ padding: '4px 12px', fontSize: '14px' }}>
                  <AlertOutlined /> Công nghệ
                </Tag>
                <Tag color="green" style={{ padding: '4px 12px', fontSize: '14px' }}>
                  <CalendarOutlined /> Báo cáo
                </Tag>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* News List */}
        <Row>
          <Col>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {newsItems.map(news => (
                <Card 
                  key={news.id}
                  hoverable
                  style={{ borderLeft: `4px solid ${getPriorityColor(news.priority)}` }}
                >
                  <Row align="middle">
                    <Col xs={24} lg={18}>
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <div>
                          <Space>
                            <Tag 
                              icon={getCategoryIcon(news.category)}
                              color={news.priority === 'high' ? 'red' : 'blue'}
                            >
                              {news.category}
                            </Tag>
                            {news.priority === 'high' && (
                              <Tag color="red">Ưu tiên cao</Tag>
                            )}
                          </Space>
                        </div>
                        <Title level={4} style={{ margin: 0, color: '#1976D2' }}>
                          {news.title}
                        </Title>
                        <Paragraph style={{ margin: 0, color: '#666' }}>
                          {news.summary}
                        </Paragraph>
                        <Space>
                          <Text type="secondary">
                            <CalendarOutlined /> {news.date}
                          </Text>
                          <Text type="secondary">
                            <UserOutlined /> {news.author}
                          </Text>
                          <Text type="secondary">
                            <EyeOutlined /> {news.views} lượt xem
                          </Text>
                        </Space>
                      </Space>
                    </Col>
                    <Col xs={24} lg={6} className="text-end mt-3 mt-lg-0">
                      <Button type="primary" size="large">
                        Đọc chi tiết
                      </Button>
                    </Col>
                  </Row>
                </Card>
              ))}
            </Space>
          </Col>
        </Row>

        {/* Quick Links */}
        <Row className="mt-5">
          <Col>
            <Card style={{ backgroundColor: '#f6ffed', border: '1px solid #b7eb8f' }}>
              <Title level={4} style={{ color: '#52c41a', textAlign: 'center', marginBottom: '20px' }}>
                Liên Kết Nhanh
              </Title>
              <Row gutter={[16, 16]}>
                <Col xs={12} md={6}>
                  <Button block>
                    <MedicineBoxOutlined /> Quy trình SOP
                  </Button>
                </Col>
                <Col xs={12} md={6}>
                  <Button block>
                    <CalendarOutlined /> Lịch công tác
                  </Button>
                </Col>
                <Col xs={12} md={6}>
                  <Button block>
                    <NotificationOutlined /> Thông báo khẩn
                  </Button>
                </Col>
                <Col xs={12} md={6}>
                  <Button block>
                    <HeartOutlined /> Kho máu
                  </Button>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default StaffNews;
