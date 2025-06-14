import React from 'react';
import { Typography, Button as AntButton, Statistic, Space } from 'antd';
import { 
  HeartOutlined, 
  CalendarOutlined, 
  SearchOutlined, 
  AlertOutlined,   BarChartOutlined, 
  TeamOutlined,  MedicineBoxOutlined 
}from '@ant-design/icons';
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
    switch(userRole) {      case 'staff':
        return (
          <section className="cta-section bg-white">
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
          <section className="cta-section bg-white">
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
          <section className="cta-section bg-white">
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
    <div className="homepage bg-white">
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
      </section>      {/* Statistics Section */}      <section className="statistics-section py-2 bg-white">
        <Container>
          <Row className="text-center mb-2">
            <Col lg={8} className="mx-auto">
              <div className="section-header-animated">
                <div className="section-icon-wrapper mb-1">
                  <BarChartOutlined className="section-main-icon" style={{ fontSize: '24px' }} />
                </div>                <h2 className="statistics-title-enhanced mb-1">

                  <span className="title-main">Thống Kê Hệ Thống</span>
                  <span className="title-highlight">�</span>
                </h2>
                <div className="title-underline"></div>                <p className="statistics-subtitle-enhanced small">
                  Những con số ấn tượng về hoạt động hiến máu nhân đạo
                </p>
              </div>
            </Col>
          </Row>
          
          <Row className="g-2 justify-content-center">            <Col lg={3} md={6} sm={6}>
              <Card className="statistics-card border-0 shadow h-100">
                <Card.Body className="text-center p-2">
                  <div className="statistics-icon-wrapper mb-1">
                    <div className="statistics-icon bg-danger">
                      <HeartOutlined style={{ fontSize: '18px' }} />
                    </div>
                  </div>
                  <h4 className="statistics-number text-danger mb-1">15,420</h4>
                  <h6 className="statistics-label text-muted mb-0 small">Người hiến máu</h6>
                  <div className="statistics-decoration"></div>
                </Card.Body>
              </Card>
            </Col>            <Col lg={3} md={6} sm={6}>
              <Card className="statistics-card border-0 shadow h-100">
                <Card.Body className="text-center p-2">
                  <div className="statistics-icon-wrapper mb-1">
                    <div className="statistics-icon bg-primary">
                      <MedicineBoxOutlined style={{ fontSize: '18px' }} />
                    </div>
                  </div>
                  <h4 className="statistics-number text-primary mb-1">28,750</h4>
                  <h6 className="statistics-label text-muted mb-0 small">Đơn vị máu</h6>
                  <div className="statistics-decoration"></div>
                </Card.Body>
              </Card>
            </Col>            <Col lg={3} md={6} sm={6}>
              <Card className="statistics-card border-0 shadow h-100">
                <Card.Body className="text-center p-2">
                  <div className="statistics-icon-wrapper mb-1">
                    <div className="statistics-icon bg-success">
                      <TeamOutlined style={{ fontSize: '18px' }} />
                    </div>
                  </div>
                  <h4 className="statistics-number text-success mb-1">8,960</h4>
                  <h6 className="statistics-label text-muted mb-0 small">Người thụ hưởng</h6>
                  <div className="statistics-decoration"></div>
                </Card.Body>
              </Card>
            </Col>            <Col lg={3} md={6} sm={6}>
              <Card className="statistics-card border-0 shadow h-100">
                <Card.Body className="text-center p-2">
                  <div className="statistics-icon-wrapper mb-1">
                    <div className="statistics-icon bg-warning">
                      <BarChartOutlined style={{ fontSize: '18px' }} />
                    </div>
                  </div>
                  <h4 className="statistics-number text-warning mb-1">97.2%</h4>
                  <h6 className="statistics-label text-muted mb-0 small">Tỷ lệ thành công</h6>
                  <div className="statistics-decoration"></div>
                </Card.Body>
              </Card>
            </Col>
          </Row>        </Container>
      </section>      {/* Benefits Slider Section */}      <section className="benefits-section-enhanced py-5 bg-white">
        <Container>
          <Row>
            <Col>
              <div className="benefits-slider-wrapper">
                <BenefitsSlider />
              </div>
            </Col>
          </Row>
        </Container>
      </section>      {/* Blood Type Information Section */}
      <section className="blood-type-information-section py-3 bg-white">        <Container>
          <Row className="text-center mb-3">
            <Col lg={8} className="mx-auto">
              <div className="section-header-animated">
                <div className="section-icon-wrapper mb-2">
                  <MedicineBoxOutlined className="section-main-icon pulse-icon" />
                </div>
                <h2 className="blood-type-title-enhanced mb-2">
                  <span className="title-main">Thông Tin Nhóm Máu</span>
                </h2>
                <div className="title-underline blood-type-underline"></div>
                <p className="blood-type-subtitle-enhanced lead">
                  Hiểu rõ về các nhóm máu và khả năng tương thích trong việc hiến và nhận máu
                  <span className="subtitle-icon">�</span>
                </p>
              </div>
            </Col>
          </Row>
            <Row className="g-3">
            {bloodTypeCards.map((card, index) => (
              <Col lg={3} md={6} key={index}>
                <Card className="blood-type-card-modern h-100 border-0 shadow">
                  <Card.Body className="text-center p-3">
                    <div className="blood-type-icon-wrapper mb-3">
                      <div className="blood-type-icon">
                        {card.icon}
                      </div>
                    </div>
                    <Card.Title className="blood-type-name h6 mb-2 fw-bold">
                      {card.title}
                    </Card.Title>
                    <Card.Text className="blood-type-description text-muted small">
                      {card.description}
                    </Card.Text>
                    <div className="blood-type-compatibility mt-2">
                      <Badge bg="primary" className="compatibility-badge">
                        Tương thích cao
                      </Badge>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>      {/* Donation Standards Section */}
      <section className="donation-standards-section py-5 bg-white">
        <Container>
          <Row className="text-center mb-5">
            <Col lg={10} className="mx-auto">
              <div className="section-header-animated">
                <div className="section-icon-wrapper mb-3">
                  <i className="bi bi-shield-check section-main-icon shield-icon"></i>
                </div>                <h2 className="standards-title-enhanced display-4 fw-bold mb-4">
                  <span className="title-highlight">�</span>
                  <span className="title-main text-gradient">Tiêu Chuẩn Hiến Máu</span>

                </h2>
                <div className="title-underline standards-underline"></div>
                <p className="standards-subtitle-enhanced lead fs-4 mb-5">

                  Đáp ứng các tiêu chuẩn dưới đây để trở thành người hùng cứu người

                </p>
              </div>
            </Col>
          </Row>

          <Row className="g-4 mb-5">
            {/* Age Requirement */}
            <Col lg={3} md={6}>
              <Card className="standard-card h-100 border-0">
                <Card.Body className="text-center p-4">                  <div className="standard-icon mb-4">
                    <div className="icon-wrapper age-icon">
                      <i className="bi bi-calendar-check fs-1"></i>
                    </div>
                  </div>
                  <h4 className="standard-title mb-3">Độ tuổi</h4>
                  <div className="standard-range mb-3">
                    <span className="range-number">18-60</span>
                    <span className="range-unit">tuổi</span>
                  </div>
                  <p className="standard-note">
                    Lần đầu hiến máu: tối đa 55 tuổi
                  </p>
                </Card.Body>
              </Card>
            </Col>

            {/* Weight Requirement */}
            <Col lg={3} md={6}>
              <Card className="standard-card h-100 border-0">
                <Card.Body className="text-center p-4">                  <div className="standard-icon mb-4">
                    <div className="icon-wrapper weight-icon">
                      <i className="bi bi-person-standing fs-1"></i>
                    </div>
                  </div>
                  <h4 className="standard-title mb-3">Cân nặng</h4>                  <div className="standard-details">
                    <div className="weight-item mb-2">
                      <i className="bi bi-person-arms-up text-primary me-2"></i>
                      <Badge bg="primary" className="me-2">Nam</Badge>
                      <span className="weight-value">≥ 45kg</span>
                    </div>
                    <div className="weight-item">
                      <i className="bi bi-person-dress text-danger me-2"></i>
                      <Badge bg="danger" className="me-2">Nữ</Badge>
                      <span className="weight-value">≥ 42kg</span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Health Requirement */}
            <Col lg={3} md={6}>
              <Card className="standard-card h-100 border-0">
                <Card.Body className="text-center p-4">                  <div className="standard-icon mb-4">
                    <div className="icon-wrapper health-icon">
                      <i className="bi bi-shield-check fs-1"></i>
                    </div>
                  </div>
                  <h4 className="standard-title mb-3">Sức khỏe</h4>
                  <div className="health-indicators">
                    <div className="health-item mb-2">
                      <i className="bi bi-check-circle text-success me-2"></i>
                      <span>Không mắc bệnh truyền nhiễm</span>
                    </div>
                    <div className="health-item">
                      <i className="bi bi-check-circle text-success me-2"></i>
                      <span>Sức khỏe tốt</span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Frequency Requirement */}
            <Col lg={3} md={6}>
              <Card className="standard-card h-100 border-0">
                <Card.Body className="text-center p-4">                  <div className="standard-icon mb-4">
                    <div className="icon-wrapper frequency-icon">
                      <i className="bi bi-arrow-repeat fs-1"></i>
                    </div>
                  </div>
                  <h4 className="standard-title mb-3">Tần suất</h4>
                  <div className="frequency-info">
                    <div className="frequency-number mb-2">
                      <span className="number">12</span>
                      <span className="unit">tuần</span>
                    </div>
                    <p className="frequency-note">
                      Khoảng cách tối thiểu giữa 2 lần hiến máu
                    </p>
                  </div>
                </Card.Body>
              </Card>            </Col>
          </Row>

          {/* Call to Action */}
          <Row className="justify-content-center">
            <Col lg={8} className="text-center">
              <div className="cta-wrapper">
                <h3 className="cta-title mb-4">Bạn đã sẵn sàng trở thành người hùng?</h3>
                <p className="cta-description mb-4">
                  Mỗi lần hiến máu của bạn có thể cứu sống tới 3 người. Hãy kiểm tra xem bạn có đủ điều kiện không!
                </p>                <div className="cta-buttons">
                  <Button variant="danger" size="lg" className="me-3 cta-primary-btn">
                    <i className="bi bi-heart-fill me-2"></i>
                    Đăng ký hiến máu ngay
                  </Button>
                  <Button variant="outline-primary" size="lg" className="cta-secondary-btn">
                    <i className="bi bi-info-circle me-2"></i>
                    Tìm hiểu thêm
                  </Button>
                </div>
              </div>
            </Col>
          </Row>        </Container>
      </section>
    </div>
  );
};

export default HomePage;
