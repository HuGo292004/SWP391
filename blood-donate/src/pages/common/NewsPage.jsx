import React from 'react';
import { Typography, Card, Row, Col, Tag, Space, Button, Divider } from 'antd';
import { CalendarOutlined, UserOutlined, RightOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Meta } = Card;

const NewsPage = () => {
  const newsData = [
    {
      id: 1,
      title: "Chiến dịch hiến máu tình nguyện 'Giọt hồng yêu thương'",
      summary: "Hơn 1000 người đã tham gia hiến máu trong chiến dịch, góp phần quan trọng vào nguồn máu dự trữ cho điều trị.",
      image: "https://example.com/blood-donation-1.jpg",
      date: "20/03/2024",
      author: "Nguyễn Văn A",
      category: "Chiến dịch",
      tags: ["Hiến máu tình nguyện", "Cộng đồng"]
    },
    {
      id: 2,
      title: "Kỹ thuật mới trong bảo quản máu kéo dài thời gian sử dụng",
      summary: "Các nhà khoa học đã phát triển phương pháp mới giúp kéo dài thời gian bảo quản máu lên đến 56 ngày.",
      image: "https://example.com/blood-storage.jpg",
      date: "18/03/2024",
      author: "Trần Thị B",
      category: "Khoa học",
      tags: ["Công nghệ", "Nghiên cứu"]
    },
    {
      id: 3,
      title: "Hướng dẫn dinh dưỡng cho người hiến máu",
      summary: "Chế độ ăn uống khoa học giúp người hiến máu phục hồi nhanh chóng và duy trì sức khỏe tốt.",
      image: "https://example.com/nutrition.jpg",
      date: "15/03/2024",
      author: "Lê Văn C",
      category: "Sức khỏe",
      tags: ["Dinh dưỡng", "Sức khỏe"]
    },
    {
      id: 4,
      title: "Ngân hàng máu di động - Mô hình mới trong thu gom máu",
      summary: "Xe ngân hàng máu lưu động được trang bị đầy đủ thiết bị, giúp việc hiến máu thuận tiện hơn.",
      image: "https://example.com/mobile-bank.jpg",
      date: "12/03/2024",
      author: "Phạm Thị D",
      category: "Công nghệ",
      tags: ["Đổi mới", "Tiện ích"]
    }
  ];

  const getCategoryColor = (category) => {
    const colors = {
      'Chiến dịch': '#1976D2',
      'Khoa học': '#2E7D32',
      'Sức khỏe': '#E91E63',
      'Công nghệ': '#F57C00'
    };
    return colors[category] || '#1976D2';
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Title level={1} style={{ color: '#1976D2' }}>
            Tin tức & Sự kiện
          </Title>
          <Paragraph style={{ fontSize: '16px', maxWidth: '800px', margin: '0 auto' }}>
            Cập nhật những tin tức mới nhất về hoạt động hiến máu và các sự kiện sắp diễn ra
          </Paragraph>
        </div>

        <Row gutter={[24, 24]}>
          {newsData.map(news => (
            <Col xs={24} sm={12} lg={8} key={news.id}>
              <Card
                hoverable
                cover={
                  <div style={{ 
                    height: '200px', 
                    background: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#999',
                    fontSize: '14px'
                  }}>
                    [Hình ảnh tin tức]
                  </div>
                }
                style={{ 
                  height: '100%',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}
              >
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Tag color={getCategoryColor(news.category)} style={{ borderRadius: '4px' }}>
                    {news.category}
                  </Tag>
                  
                  <Title level={4} style={{ margin: '8px 0' }}>
                    {news.title}
                  </Title>
                  
                  <Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ margin: '0 0 12px 0' }}>
                    {news.summary}
                  </Paragraph>
                  
                  <Space split={<Divider type="vertical" />} style={{ fontSize: '13px', color: '#666' }}>
                    <Space>
                      <CalendarOutlined /> {news.date}
                    </Space>
                    <Space>
                      <UserOutlined /> {news.author}
                    </Space>
                  </Space>
                  
                  <div style={{ marginTop: '16px' }}>
                    {news.tags.map(tag => (
                      <Tag key={tag} style={{ marginBottom: '8px', borderRadius: '4px' }}>
                        {tag}
                      </Tag>
                    ))}
                  </div>
                  
                  <Button type="link" style={{ padding: 0, height: 'auto', marginTop: '8px' }}>
                    Đọc thêm <RightOutlined />
                  </Button>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Button type="primary" size="large" style={{ borderRadius: '8px' }}>
            Xem thêm tin tức
          </Button>
        </div>
      </Space>
    </div>
  );
};

export default NewsPage; 