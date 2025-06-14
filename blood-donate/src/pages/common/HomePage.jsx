import React from 'react';
import { Typography, Button as AntButton, Statistic, Space } from 'antd';
import { 
  HeartOutlined, 
  CalendarOutlined, 
  SearchOutlined, 
  AlertOutlined, 
  BarChartOutlined, 
  TeamOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import { BenefitsSlider } from '../../components/ui';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Badge,
  OverlayTrigger,
  Tooltip
} from 'react-bootstrap';
import { getUserRoleFromPath, createRoleBasedPath } from '../../utils/roleUtils';
import '../../styles/HomePage.css';
import '../../styles/banners.css';
import '../../styles/RedBanner.css';
import '../../styles/GoldenBanner.css';
import '../../styles/pages.css';
import '../../styles/criteria-fix.css'; // Import the CSS fixes for criteria list


const { Title, Paragraph } = Typography;

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
  const location = useLocation();
  const userRole = getUserRoleFromPath(location.pathname);

  // Function to render primary button based on user role
  const renderPrimaryButton = () => {
    switch(userRole) {
      case 'staff':
        return (
          <Button 
            variant="danger" 
            size="lg" 
            as={Link} 
            to={createRoleBasedPath("/emergency-request", userRole)}
            className="d-flex align-items-center gap-2 px-4 py-3"
          >
            <AlertOutlined style={{ fontSize: '18px' }} />
            Yêu cầu khẩn cấp
          </Button>
        );
      
      case 'admin':
        // Admin chỉ có tìm kiếm nhóm máu, không hiển thị primary button
        return null;
      
      default: // guest hoặc member
        return (
          <Button 
            variant="primary" 
            size="lg" 
            as={Link} 
            to={createRoleBasedPath("/blood-donation-register", userRole)}
            className="d-flex align-items-center gap-2 px-4 py-3"
          >
            <HeartOutlined style={{ fontSize: '18px' }} />
            Đăng ký hiến máu
          </Button>
        );
    }
  };
  
  // Function to render CTA section based on user role
  const renderCTASection = () => {
    switch(userRole) {
      case 'staff':
        return (
          <section className="cta-section bg-light">
            <Container>
              <Row className="justify-content-center text-center">
                <Col lg={8}>
                  <div className="cta-content">
                    <h2 className="cta-title text-danger">Xử lý yêu cầu khẩn cấp?</h2>
                    <p className="cta-description">
                      Truy cập hệ thống để xử lý các yêu cầu hiến máu khẩn cấp một cách nhanh chóng và hiệu quả.
                    </p>
                    <Button 
                      variant="danger" 
                      size="lg" 
                      as={Link} 
                      to={createRoleBasedPath("/emergency-request", userRole)}
                      className="cta-button d-flex align-items-center gap-2 mx-auto"
                    >
                      <AlertOutlined style={{ fontSize: '18px' }} />
                      Yêu cầu khẩn cấp
                    </Button>
                  </div>
                </Col>
              </Row>
            </Container>
          </section>
        );
      
      case 'admin':
        return (
          <section className="cta-section bg-light">
            <Container>
              <Row className="justify-content-center text-center">
                <Col lg={8}>
                  <div className="cta-content">
                    <h2 className="cta-title text-primary">Quản lý hệ thống hiến máu</h2>
                    <p className="cta-description">
                      Truy cập bảng điều khiển quản trị để giám sát và quản lý toàn bộ hệ thống hiến máu.
                    </p>
                    <Button 
                      variant="primary" 
                      size="lg" 
                      as={Link} 
                      to={createRoleBasedPath("/search-blood", userRole)}
                      className="cta-button d-flex align-items-center gap-2 mx-auto"
                    >
                      <SearchOutlined style={{ fontSize: '18px' }} />
                      Tìm kiếm nhóm máu
                    </Button>
                  </div>
                </Col>
              </Row>
            </Container>
          </section>
        );
      
      default: // guest hoặc member
        return (
          <section className="cta-section bg-light">
            <Container>
              <Row className="justify-content-center text-center">
                <Col lg={8}>
                  <div className="cta-content">
                    <h2 className="cta-title text-danger">Sẵn sàng hiến máu?</h2>
                    <p className="cta-description">
                      Đăng ký ngay hôm nay và trở thành một phần của cộng đồng hiến máu cứu người.
                    </p>
                    <Button 
                      variant="danger" 
                      size="lg" 
                      as={Link} 
                      to={createRoleBasedPath("/blood-donation-register", userRole)}
                      className="cta-button d-flex align-items-center justify-content-center gap-2 mx-auto"
                    >
                      <HeartOutlined style={{ fontSize: '18px' }} />
                      <span>Đăng ký hiến máu</span>
                    </Button>
                  </div>
                </Col>
              </Row>
            </Container>
          </section>
        );
    }
  };

  return (
    <div className="homepage">
      {/* Hero Banner Section */}
      <section className="hero-banner-new">
        <div className="banner-image-container">
          <img 
            src="https://images.unsplash.com/photo-1615461066841-6116e61058f4?q=80&w=1920&h=1080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
            alt="Blood Donation" 
            className="banner-image"
          />
        </div>
        
        <Container>
          <Row className="align-items-center min-vh-75">
            <Col lg={8} className="mx-auto text-center">
              <div className="hero-banner-content">
                <h1 className="hero-banner-title-red mb-4">
                  Hiến máu nhân đạo
                  <span className="title-highlight-red">Phần mềm hỗ trợ hiến máu</span>
                </h1>
                <p className="hero-banner-subtitle-red mb-5">
                  Nỗ lực nhỏ của bạn có thể cho người khác cơ hội thứ hai để sống.
                  <br />
                  Hãy gia nhập cộng đồng hiến máu nhân đạo, lan tỏa yêu thương.
                </p>
                
                <div className="hero-banner-buttons-new">
                  <Button 
                    variant="danger" 
                    size="lg" 
                    as={Link} 
                    to={createRoleBasedPath("/blood-donation-register", userRole)}
                    className="hero-cta-btn-new me-3 mb-3"
                  >
                    <HeartOutlined className="me-2" />
                    Đăng Ký Hiến Máu
                  </Button>
                  
                  <Button 
                    variant="light" 
                    size="lg" 
                    as={Link} 
                    to={createRoleBasedPath("/search-blood", userRole)}
                    className="hero-cta-btn-new hero-cta-btn-white mb-3"
                    style={{ 
                      backgroundColor: 'white',
                      color: '#dc3545',
                      border: '2px solid white',
                      fontWeight: '600'
                    }}
                  >
                    <SearchOutlined className="me-2" />
                    Tìm Kiếm Nhóm Máu
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Statistics Section */}
      <section className="statistics-section py-5 bg-light">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 className="section-title mb-4">Thống kê hệ thống</h2>
              <p className="section-subtitle">
                Những con số ấn tượng về hoạt động hiến máu
              </p>
            </Col>
          </Row>
          
          <Row className="justify-content-center">
            <Col md={3} sm={6} className="mb-4">
              <Card className="stat-card text-center h-100 border-0 shadow-sm">
                <Card.Body>
                  <div className="stat-icon text-danger mb-3">
                    <HeartOutlined style={{ fontSize: '48px' }} />
                  </div>
                  <Statistic
                    title={<span className="stat-title">Người hiến máu</span>}
                    value={15420}
                    valueStyle={{ color: '#dc3545', fontSize: '2.5rem', fontWeight: 'bold' }}
                  />
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={3} sm={6} className="mb-4">
              <Card className="stat-card text-center h-100 border-0 shadow-sm">
                <Card.Body>
                  <div className="stat-icon text-primary mb-3">
                    <MedicineBoxOutlined style={{ fontSize: '48px' }} />
                  </div>
                  <Statistic
                    title={<span className="stat-title">Đơn vị máu</span>}
                    value={28750}
                    valueStyle={{ color: '#0d6efd', fontSize: '2.5rem', fontWeight: 'bold' }}
                  />
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={3} sm={6} className="mb-4">
              <Card className="stat-card text-center h-100 border-0 shadow-sm">
                <Card.Body>
                  <div className="stat-icon text-success mb-3">
                    <TeamOutlined style={{ fontSize: '48px' }} />
                  </div>
                  <Statistic
                    title={<span className="stat-title">Người thụ hưởng</span>}
                    value={8960}
                    valueStyle={{ color: '#198754', fontSize: '2.5rem', fontWeight: 'bold' }}
                  />
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={3} sm={6} className="mb-4">
              <Card className="stat-card text-center h-100 border-0 shadow-sm">
                <Card.Body>
                  <div className="stat-icon text-warning mb-3">
                    <BarChartOutlined style={{ fontSize: '48px' }} />
                  </div>
                  <Statistic
                    title={<span className="stat-title">Tỷ lệ thành công</span>}
                    value={97.2}
                    suffix="%"
                    valueStyle={{ color: '#fd7e14', fontSize: '2.5rem', fontWeight: 'bold' }}
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Blood Type Information Section */}
      <section className="blood-type-section py-5">
        <Container>
          <Row className="mb-5">
            <Col lg={8} className="mx-auto text-center">
              <h2 className="section-title mb-4">Thông tin nhóm máu</h2>
              <p className="section-subtitle">
                Hiểu rõ về các nhóm máu và khả năng tương thích trong việc hiến và nhận máu
              </p>
            </Col>
          </Row>
          
          <Row>
            {bloodTypeCards.map((card, index) => (
              <Col lg={3} md={6} className="mb-4" key={index}>
                <Card className="blood-type-card h-100 border-0 shadow-sm">
                  <Card.Body className="text-center">
                    <div className="mb-3">
                      {card.icon}
                    </div>
                    <Card.Title className="mb-3">{card.title}</Card.Title>
                    <Card.Text className="text-muted">
                      {card.description}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Benefits Slider Section */}
      <section className="benefits-section py-5 bg-light">
        <Container>
          <Row className="mb-5">
            <Col lg={8} className="mx-auto text-center">
              <h2 className="section-title mb-4">Lợi ích của việc hiến máu</h2>
              <p className="section-subtitle">
                Hiến máu không chỉ cứu sống người khác mà còn mang lại nhiều lợi ích cho bản thân bạn
              </p>
            </Col>
          </Row>
          
          <Row>
            <Col>
              <BenefitsSlider />
            </Col>
          </Row>
        </Container>
      </section>

      {/* Donation Criteria Section */}
      <section className="criteria-section py-5">
        <Container>
          <Row>
            <Col lg={6} className="mb-4">
              <h2 className="section-title mb-4">Tiêu chí hiến máu</h2>
              <div className="criteria-list">
                <div className="criteria-item">
                  <Badge bg="success" className="criteria-badge">✓</Badge>
                  <span>Tuổi từ 18-60 (lần đầu hiến máu tối đa 55 tuổi)</span>
                </div>
                <div className="criteria-item">
                  <Badge bg="success" className="criteria-badge">✓</Badge>
                  <span>Cân nặng tối thiểu 45kg đối với nam, 42kg đối với nữ</span>
                </div>
                <div className="criteria-item">
                  <Badge bg="success" className="criteria-badge">✓</Badge>
                  <span>Huyết áp trong khoảng 90-160 mmHg (tâm thu)</span>
                </div>
                <div className="criteria-item">
                  <Badge bg="success" className="criteria-badge">✓</Badge>
                  <span>Không mắc các bệnh truyền nhiễm qua đường máu</span>
                </div>
                <div className="criteria-item">
                  <Badge bg="success" className="criteria-badge">✓</Badge>
                  <span>Khoảng cách giữa 2 lần hiến máu tối thiểu 12 tuần</span>
                </div>
                <div className="criteria-item">
                  <Badge bg="success" className="criteria-badge">✓</Badge>
                  <span>Sức khỏe tốt, không trong thời kỳ mang thai hoặc cho con bú</span>
                </div>
              </div>
            </Col>
            
            <Col lg={6}>
              <h2 className="section-title mb-4">Yếu tố Rh</h2>
              <p className="mb-4">
                Yếu tố Rh là một protein có thể có hoặc không có trên bề mặt tế bào hồng cầu. 
                Điều này quyết định nhóm máu của bạn là Rh dương tính (+) hay Rh âm tính (-).
              </p>
              
              <div className="rh-info">
                <div className="rh-legend">
                  <div className="legend-item">
                    <Badge bg="success" className="legend-badge">Rh+</Badge>
                    <span>Có protein Rh trên bề mặt hồng cầu</span>
                  </div>
                  <div className="legend-item">
                    <Badge bg="warning" className="legend-badge">Rh-</Badge>
                    <span>Không có protein Rh trên bề mặt hồng cầu</span>
                  </div>
                  <div className="legend-item">
                    <Badge bg="info" className="legend-badge">Lưu ý</Badge>
                    <span>Yếu tố Rh quyết định khả năng tương thích khi truyền máu</span>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      {renderCTASection()}
    </div>
  );
};

export default HomePage;
