import React from 'react';
import { Typography, Button, Row, Col, Card, Statistic, Carousel, Divider, Space } from 'antd';
import { 
  HeartOutlined, 
  CalendarOutlined, 
  SearchOutlined, 
  AlertOutlined, 
  BarChartOutlined, 
  TeamOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';


const { Title, Paragraph } = Typography;
const { Meta } = Card;

// Carousel images - base64 encoded placeholders (thay thế với URL thực tế khi có thể)
const carouselImages = [
  {
    url: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?q=80&w=1470&auto=format&fit=crop",
    alt: "Người hiến máu",
    caption: "Mỗi giọt máu là một món quà quý giá"
  },
  {
    url: "https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=1470&auto=format&fit=crop",
    alt: "Túi máu hiến tặng",
    caption: "Hiến máu cứu người - Một nghĩa cử cao đẹp"
  },
  {
    url: "https://images.unsplash.com/photo-1631815588090-d1bcbe9d4881?q=80&w=1471&auto=format&fit=crop",
    alt: "Bác sĩ và bệnh nhân",
    caption: "Chung tay vì sức khỏe cộng đồng"
  }
];

const bloodTypeCards = [
  {
    title: 'Nhóm máu A',
    description: 'Có thể cho máu cho nhóm A và AB. Có thể nhận máu từ nhóm A và O.',
    icon: <HeartOutlined style={{ fontSize: '32px', color: '#f5222d' }} />,
  },
  {
    title: 'Nhóm máu B',
    description: 'Có thể cho máu cho nhóm B và AB. Có thể nhận máu từ nhóm B và O.',
    icon: <HeartOutlined style={{ fontSize: '32px', color: '#f5222d' }} />,
  },
  {
    title: 'Nhóm máu AB',
    description: 'Có thể cho máu cho nhóm AB. Có thể nhận máu từ tất cả các nhóm.',
    icon: <HeartOutlined style={{ fontSize: '32px', color: '#f5222d' }} />,
  },
  {
    title: 'Nhóm máu O',
    description: 'Có thể cho máu cho tất cả các nhóm. Chỉ có thể nhận máu từ nhóm O.',
    icon: <HeartOutlined style={{ fontSize: '32px', color: '#f5222d' }} />,
  },
];

const HomePage = () => {
  // TODO: Replace with actual authentication context/hook
  // For now, using fallback to prevent crashes
  const user = null; // This should come from authentication context
  
  // Function to render primary button based on user role
  const renderPrimaryButton = () => {
    const userRole = user?.role;
    
    switch(userRole) {
      case 'staff':
        return (
          <Button type="primary" size="large" icon={<AlertOutlined />} style={{ fontSize: '18px', height: 'auto', padding: '10px 20px', background: '#f5222d', borderColor: '#f5222d' }}>
            <Link to="/emergency-request">Yêu cầu khẩn cấp</Link>
          </Button>
        );
      
      case 'admin':
        // Admin chỉ có tìm kiếm nhóm máu, không hiển thị primary button
        return null;
      
      default: // guest hoặc member
        return (
          <Button type="primary" size="large" icon={<HeartOutlined />} style={{ fontSize: '18px', height: 'auto', padding: '10px 20px' }}>
            <Link to="/register-donor">Đăng ký hiến máu</Link>
          </Button>
        );
    }
  };

  // Function to render CTA section based on user role
  const renderCTASection = () => {
    const userRole = user?.role;
    
    switch(userRole) {
      case 'staff':
        return (
          <div style={{ width: '100%', textAlign: 'center', padding: '60px 0', margin: '40px 0 0 0', background: '#f5f5f5' }}>
            <Title level={2} style={{ fontSize: '38px', marginBottom: '20px' }}>Xử lý yêu cầu khẩn cấp?</Title>
            <Paragraph style={{ fontSize: '20px', margin: '20px auto', maxWidth: '800px', padding: '0 20px' }}>
              Truy cập hệ thống để xử lý các yêu cầu hiến máu khẩn cấp một cách nhanh chóng và hiệu quả.
            </Paragraph>
            <Button type="primary" size="large" icon={<AlertOutlined />} style={{ fontSize: '18px', height: 'auto', padding: '12px 24px', marginTop: '20px', background: '#f5222d', borderColor: '#f5222d' }}>
              <Link to="/emergency-request">Yêu cầu khẩn cấp</Link>
            </Button>
          </div>
        );
      
      case 'admin':
        return (
          <div style={{ width: '100%', textAlign: 'center', padding: '60px 0', margin: '40px 0 0 0', background: '#f5f5f5' }}>
            <Title level={2} style={{ fontSize: '38px', marginBottom: '20px' }}>Quản lý hệ thống hiến máu</Title>
            <Paragraph style={{ fontSize: '20px', margin: '20px auto', maxWidth: '800px', padding: '0 20px' }}>
              Truy cập bảng điều khiển quản trị để giám sát và quản lý toàn bộ hệ thống hiến máu.
            </Paragraph>
            <Button type="primary" size="large" icon={<SearchOutlined />} style={{ fontSize: '18px', height: 'auto', padding: '12px 24px', marginTop: '20px' }}>
              <Link to="/search-blood">Tìm kiếm nhóm máu</Link>
            </Button>
          </div>
        );
      
      default: // guest hoặc member
        return (
          <div style={{ width: '100%', textAlign: 'center', padding: '60px 0', margin: '40px 0 0 0', background: '#f5f5f5' }}>
            <Title level={2} style={{ fontSize: '38px', marginBottom: '20px' }}>Sẵn sàng hiến máu?</Title>
            <Paragraph style={{ fontSize: '20px', margin: '20px auto', maxWidth: '800px', padding: '0 20px' }}>
              Đăng ký ngay hôm nay và trở thành một phần của cộng đồng hiến máu cứu người.
            </Paragraph>
            <Button type="primary" size="large" icon={<HeartOutlined />} style={{ fontSize: '18px', height: 'auto', padding: '12px 24px', marginTop: '20px' }}>
              <Link to="/register-donor">Đăng ký hiến máu</Link>
            </Button>
          </div>
        );
    }
  };

  return (
    <div style={{ width: '100%', padding: 0, margin: 0, overflow: 'hidden' }}>
      {/* Hero Carousel Section */}
      <Carousel autoplay effect="fade" style={{ width: '100%' }}>
        {carouselImages.map((image, index) => (
          <div key={index}>
            <div style={{ 
              height: '500px', 
              background: `url(${image.url}) center center / cover no-repeat`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              position: 'relative'
            }}>
              <div style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: '100%', 
                height: '100%', 
                backgroundColor: 'rgba(0,0,0,0.4)'
              }}></div>
              <div style={{ 
                zIndex: 1, 
                color: '#fff', 
                textAlign: 'center',
                padding: '0 20px'
              }}>
                <Title style={{ color: '#fff', marginBottom: '20px', fontSize: '52px' }}>Hiến Máu Cứu Người</Title>
                <Paragraph style={{ color: '#fff', fontSize: '22px', maxWidth: '800px', marginBottom: '30px' }}>
                  {image.caption}
                </Paragraph>
                <Space size="large">
                  {renderPrimaryButton()}
                  {/* <Button size="large" icon={<MedicineBoxOutlined />} style={{ background: '#e91e63', color: '#fff', fontSize: '18px', height: 'auto', padding: '10px 20px' }}>
                    <Link to="/request-blood" style={{ color: '#fff' }}>Đăng ký nhận máu</Link>
                  </Button> */}
                  <Button size="large" icon={<SearchOutlined />} style={{ background: 'rgba(255,255,255,0.9)', fontSize: '18px', height: 'auto', padding: '10px 20px' }}>
                    <Link to="/search-blood">Tìm kiếm nhóm máu</Link>
                  </Button>
                </Space>
              </div>
            </div>
          </div>
        ))}
      </Carousel>

      {/* Statistics Section */}
      <div style={{ width: '100%', margin: '40px 0', padding: 0, background: '#f5f5f5' }}>
        <Row gutter={[16, 16]} justify="center" style={{ margin: 0, padding: '20px' }}>
          <Col xs={24} sm={12} md={6} style={{ padding: '10px' }}>
            <Card variant="borderless" style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
              <Statistic 
                title={<span style={{ fontSize: '18px' }}>Người hiến máu</span>}
                value={2500}
                valueStyle={{ color: '#f5222d', fontSize: '28px' }}
                prefix={<TeamOutlined style={{ fontSize: '24px' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6} style={{ padding: '10px' }}>
            <Card variant="borderless" style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
              <Statistic 
                title={<span style={{ fontSize: '18px' }}>Đơn vị máu</span>}
                value={3750}
                valueStyle={{ color: '#f5222d', fontSize: '28px' }}
                prefix={<HeartOutlined style={{ fontSize: '24px' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6} style={{ padding: '10px' }}>
            <Card variant="borderless" style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
              <Statistic 
                title={<span style={{ fontSize: '18px' }}>Người được cứu</span>}
                value={7800}
                valueStyle={{ color: '#f5222d', fontSize: '28px' }}
                prefix={<TeamOutlined style={{ fontSize: '24px' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6} style={{ padding: '10px' }}>
            <Card variant="borderless" style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
              <Statistic 
                title={<span style={{ fontSize: '18px' }}>Yêu cầu khẩn cấp</span>}
                value={15}
                valueStyle={{ color: '#f5222d', fontSize: '28px' }}
                prefix={<AlertOutlined style={{ fontSize: '24px' }} />}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Features Section */}
      <div style={{ width: '100%', margin: '40px 0', padding: '40px 0', background: '#fff' }}>
        <Title level={2} style={{ textAlign: 'center', margin: '0 0 30px 0', fontSize: '36px' }}>
          Tính năng chính
        </Title>
        <Row gutter={[24, 24]} style={{ margin: 0, padding: '0 20px' }}>
          <Col xs={24} sm={12} md={8} style={{ padding: '10px' }}>
            <Card className="feature-card" variant="borderless" style={{ margin: 0, borderRadius: '8px', height: '100%', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
              <HeartOutlined className="feature-icon" style={{ fontSize: '42px' }} />
              <Meta
                title={<span style={{ fontSize: '20px', marginBottom: '10px', display: 'block' }}>Đăng ký hiến máu</span>}
                description={<span style={{ fontSize: '16px' }}>Đăng ký nhóm máu và thời điểm sẵn sàng để hiến máu, thông tin sẽ được lưu trong hệ thống.</span>}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} style={{ padding: '10px' }}>
            <Card className="feature-card" variant="borderless" style={{ margin: 0, borderRadius: '8px', height: '100%', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
              <MedicineBoxOutlined className="feature-icon" style={{ fontSize: '42px', color: '#e91e63' }} />
              <Meta
                title={<span style={{ fontSize: '20px', marginBottom: '10px', display: 'block' }}>Đăng ký nhận máu</span>}
                description={<span style={{ fontSize: '16px' }}>Đăng ký nhu cầu nhận máu với đầy đủ thông tin y tế để tìm kiếm nguồn máu phù hợp.</span>}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} style={{ padding: '10px' }}>
            <Card className="feature-card" variant="borderless" style={{ margin: 0, borderRadius: '8px', height: '100%', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
              <SearchOutlined className="feature-icon" style={{ fontSize: '42px' }} />
              <Meta
                title={<span style={{ fontSize: '20px', marginBottom: '10px', display: 'block' }}>Tìm kiếm nhóm máu</span>}
                description={<span style={{ fontSize: '16px' }}>Tìm kiếm thông tin về các nhóm máu phù hợp cho việc truyền máu và các thành phần máu.</span>}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} style={{ padding: '10px' }}>
            <Card className="feature-card" variant="borderless" style={{ margin: 0, borderRadius: '8px', height: '100%', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
              <AlertOutlined className="feature-icon" style={{ fontSize: '42px' }} />
              <Meta
                title={<span style={{ fontSize: '20px', marginBottom: '10px', display: 'block' }}>Yêu cầu khẩn cấp</span>}
                description={<span style={{ fontSize: '16px' }}>Đăng ký các trường hợp cần máu khẩn cấp để tìm kiếm người hiến máu nhanh chóng.</span>}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} style={{ padding: '10px' }}>
            <Card className="feature-card" variant="borderless" style={{ margin: 0, borderRadius: '8px', height: '100%', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
              <BarChartOutlined className="feature-icon" style={{ fontSize: '42px' }} />
              <Meta
                title={<span style={{ fontSize: '20px', marginBottom: '10px', display: 'block' }}>Quản lý đơn vị máu</span>}
                description={<span style={{ fontSize: '16px' }}>Quản lý số lượng các đơn vị máu của cơ sở y tế và theo dõi tình trạng hiện tại.</span>}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} style={{ padding: '10px' }}>
            <Card className="feature-card" variant="borderless" style={{ margin: 0, borderRadius: '8px', height: '100%', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
              <CalendarOutlined className="feature-icon" style={{ fontSize: '42px' }} />
              <Meta
                title={<span style={{ fontSize: '20px', marginBottom: '10px', display: 'block' }}>Nhắc nhở phục hồi</span>}
                description={<span style={{ fontSize: '16px' }}>Nhắc nhở thời gian phục hồi giữa các lần hiến máu để đảm bảo sức khỏe người hiến.</span>}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} style={{ padding: '10px' }}>
            <Card className="feature-card" variant="borderless" style={{ margin: 0, borderRadius: '8px', height: '100%', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
              <TeamOutlined className="feature-icon" style={{ fontSize: '42px' }} />
              <Meta
                title={<span style={{ fontSize: '20px', marginBottom: '10px', display: 'block' }}>Quản lý hồ sơ</span>}
                description={<span style={{ fontSize: '16px' }}>Quản lý hồ sơ người dùng và lịch sử hiến máu, theo dõi các thông tin quan trọng.</span>}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Blood Types Section */}
      <div style={{ width: '100%', margin: '40px 0', padding: '20px 0', background: '#fff1f0' }}>
        <Title level={2} style={{ textAlign: 'center', margin: '0 0 30px 0', padding: '20px 0', fontSize: '36px' }}>
          Thông tin về các nhóm máu
        </Title>
        <Row gutter={[16, 16]} style={{ margin: 0, padding: '0 20px' }}>
          {bloodTypeCards.map((card, index) => (
            <Col key={index} xs={24} sm={12} md={6} style={{ padding: '10px' }}>
              <Card
                variant="borderless"
                style={{ textAlign: 'center', height: '100%', margin: 0, borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}
                cover={
                  <div style={{ padding: '30px', background: '#fff' }}>
                    {React.cloneElement(card.icon, { style: { fontSize: '48px', color: '#f5222d' } })}
                  </div>
                }
              >
                <Meta 
                  title={<span style={{ fontSize: '22px', marginBottom: '10px', display: 'block' }}>{card.title}</span>} 
                  description={<span style={{ fontSize: '16px' }}>{card.description}</span>} 
                />
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* CTA Section */}
      {renderCTASection()}
    </div>
  );
};

export default HomePage; 
