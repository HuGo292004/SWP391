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
import { Link } from 'react-router-dom';
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
  // TODO: Replace with actual authentication context/hook
  // For now, using fallback to prevent crashes
  const user = null; // This should come from authentication context
    // Function to render primary button based on user role
  const renderPrimaryButton = () => {
    const userRole = user?.role;
    
    switch(userRole) {
      case 'staff':
        return (
          <Button 
            variant="danger" 
            size="lg" 
            as={Link} 
            to="/emergency-request"
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
            to="/register"
            className="d-flex align-items-center gap-2 px-4 py-3"
          >
            <HeartOutlined style={{ fontSize: '18px' }} />
            Đăng ký hiến máu
          </Button>
        );
    }
  };  // Function to render CTA section based on user role
  const renderCTASection = () => {
    const userRole = user?.role;
    
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
                      to="/emergency-request"
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
                      to="/search-blood"
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
                    </p>                    <Button 
                      variant="danger" 
                      size="lg" 
                      as={Link} 
                      to="/register"
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
    }  };return (
    <div className="homepage">      {/* Hero Banner Section */}
      <section className="hero-banner-new">        <div className="banner-image-container">
          <img 
            src="https://images.unsplash.com/photo-1615461066841-6116e61058f4?q=80&w=1920&h=1080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
            alt="Blood Donation" 
            className="banner-image"
          />
        </div>
        
        <Container>
          <Row className="align-items-center min-vh-75">
            <Col lg={8} className="mx-auto text-center">              <div className="hero-banner-content">                <h1 className="hero-banner-title-red mb-4">
                  Hiến máu nhân đạo
                  <span className="title-highlight-red">Phần mềm hỗ trợ hiến máu</span>
                </h1><p className="hero-banner-subtitle-red mb-5">
                  Nỗ lực nhỏ của bạn có thể cho người khác cơ hội thứ hai để sống.
                  <br />
                  Hãy gia nhập cộng đồng hiến máu nhân đạo, lan tỏa yêu thương.
                </p>
                
                <div className="hero-banner-buttons-new">
                  <Button 
                    variant="danger" 
                    size="lg" 
                    as={Link} 
                    to="/register"
                    className="hero-cta-btn-new me-3 mb-3"
                  >
                    <HeartOutlined className="me-2" />
                    Đăng Ký Hiến Máu
                  </Button>
                  
                  <Button 
                    variant="outline-danger" 
                    size="lg" 
                    as={Link} 
                    to="/search-blood"
                    className="hero-cta-btn-new mb-3"
                  >
                    <SearchOutlined className="me-2" />
                    Tìm Kiếm Nhóm Máu
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>{/* Statistics Section */}
      <section className="statistics-section">
        <Container>
          <Row className="g-4">
            <Col md={6} lg={3}>
              <Card className="statistics-card hover-card">
                <Card.Body>
                  <div className="statistics-icon">
                    <TeamOutlined style={{ fontSize: '32px', color: 'white' }} />
                  </div>
                  <div className="statistics-number">2,500</div>
                  <p className="statistics-label">Người hiến máu</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={3}>
              <Card className="statistics-card hover-card">
                <Card.Body>
                  <div className="statistics-icon">
                    <HeartOutlined style={{ fontSize: '32px', color: 'white' }} />
                  </div>
                  <div className="statistics-number">3,750</div>
                  <p className="statistics-label">Đơn vị máu</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={3}>
              <Card className="statistics-card hover-card">
                <Card.Body>
                  <div className="statistics-icon">
                    <TeamOutlined style={{ fontSize: '32px', color: 'white' }} />
                  </div>
                  <div className="statistics-number">7,800</div>
                  <p className="statistics-label">Người được cứu</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={3}>
              <Card className="statistics-card hover-card">
                <Card.Body>
                  <div className="statistics-icon">
                    <AlertOutlined style={{ fontSize: '32px', color: 'white' }} />
                  </div>
                  <div className="statistics-number">15</div>
                  <p className="statistics-label">Yêu cầu khẩn cấp</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Benefits Slider Section */}
      <BenefitsSlider />      {/* Eligibility Criteria Section */}      <section className="eligibility-section">
        <Container>
          <div className="section-header-modern">
            <div className="section-badge">
              <MedicineBoxOutlined style={{ fontSize: '18px' }} />
              <span>Tiêu chuẩn</span>
            </div>
            <h2 className="section-title-modern">Tiêu chuẩn tham gia hiến máu</h2>
            <p className="section-subtitle-modern">
              Đảm bảo an toàn cho người hiến và người nhận máu
            </p>
          </div>
          
          <Row className="g-3 d-flex align-items-stretch">
            <Col lg={6}>
              <Card className="eligibility-card eligibility-allowed">
                <Card.Body>
                  <div className="eligibility-header">
                    <div className="eligibility-icon">
                      <HeartOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
                    </div>
                    <h5 className="eligibility-title">Được phép hiến máu</h5>
                  </div>                  <div className="eligibility-content">
                    <div className="criteria-group">
                      <h6 className="criteria-title">Điều kiện cơ bản</h6>
                      <ul className="criteria-list">
                        <li>Nam: 18-60 tuổi, ≥ 45kg</li>
                        <li>Nữ: 18-55 tuổi, ≥ 45kg</li>
                        <li>Khỏe mạnh, không sốt, không mệt mỏi</li>
                      </ul>
                    </div>
                    
                    <div className="criteria-group">
                      <h6 className="criteria-title">Các chỉ số sức khỏe</h6>
                      <ul className="criteria-list">
                        <li>Huyết áp: 100-160/60-100 mmHg</li>
                        <li>Mạch: 60-100 lần/phút</li>
                        <li>Hemoglobin: Nam ≥125g/L, Nữ ≥120g/L</li>
                      </ul>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={6}>
              <Card className="eligibility-card eligibility-restricted">
                <Card.Body>
                  <div className="eligibility-header">
                    <div className="eligibility-icon">
                      <AlertOutlined style={{ fontSize: '24px', color: '#ff4d4f' }} />
                    </div>
                    <h5 className="eligibility-title">Không được hiến máu khi</h5>
                  </div>                  <div className="eligibility-content">
                    <div className="criteria-group">
                      <h6 className="criteria-title">Vấn đề sức khỏe</h6>
                      <ul className="criteria-list">
                        <li>Bệnh tim mạch, huyết áp cao, tiểu đường</li>
                        <li>Đang mắc bệnh cấp tính hoặc mãn tính</li>
                        <li>Vừa phẫu thuật hoặc đang dùng kháng sinh</li>
                        <li>Bệnh gan, thận mãn tính</li>
                      </ul>
                    </div>
                    
                    <div className="criteria-group">
                      <h6 className="criteria-title">Các trường hợp đặc biệt</h6>
                      <ul className="criteria-list">
                        <li>Phụ nữ đang mang thai hoặc cho con bú</li>
                        <li>Uống rượu trong vòng 24h trước hiến máu</li>
                        <li>Tiêm vaccine trong vòng 7-14 ngày</li>
                        <li>Có nguy cơ cao về HIV hoặc viêm gan</li>
                      </ul>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
            <Row className="mt-4">
            <Col>
              <div className="eligibility-note">
                <div className="note-icon">
                  <MedicineBoxOutlined style={{ fontSize: '20px', color: 'white' }} />
                </div>
                <div className="note-content">
                  <h6>Lưu ý quan trọng</h6>
                  <p>
                    <strong>Khoảng cách giữa các lần hiến máu:</strong> Nam tối thiểu 12 tuần, nữ tối thiểu 16 tuần.
                  </p>
                  <p>
                    <strong>Hồi phục sau hiến máu:</strong> Uống nhiều nước, nghỉ ngơi đủ, tránh các hoạt động gắng sức trong 24 giờ.
                  </p>
                  <p>
                    <strong>Xét nghiệm sàng lọc:</strong> Trước khi hiến máu, bạn sẽ được kiểm tra các chỉ số sức khỏe và xét nghiệm sàng lọc các bệnh lây truyền qua đường máu.
                  </p>
                  <p>
                    <strong>Lượng máu hiến:</strong> Mỗi lần hiến máu toàn phần là 250-450ml tùy theo cân nặng và thể trạng.
                  </p>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Blood Types Section - Redesigned */}
      <section className="blood-types-section-new">
        <Container>
          <div className="section-header-modern">
            <div className="section-badge">
              <MedicineBoxOutlined style={{ fontSize: '20px' }} />
              <span>Kiến thức y tế</span>
            </div>
            <h2 className="section-title-modern">Thông tin các nhóm máu</h2>
            <p className="section-subtitle-modern">
              Khám phá sự tương thích và đặc điểm độc đáo của từng nhóm máu
            </p>
          </div>
          
          <Row className="g-4 blood-type-grid">
            <Col md={6} lg={3}>
              <div className="blood-type-card-modern blood-type-a">
                <div className="card-background-pattern"></div>
                <div className="blood-type-header">
                  <div className="blood-type-symbol">A</div>
                  <div className="blood-type-rh">
                    <span className="rh-positive">Rh+</span>
                    <span className="rh-negative">Rh-</span>
                  </div>
                </div>
                <div className="blood-type-content">
                  <h4 className="blood-type-name">Nhóm máu A</h4>
                  <div className="compatibility-info">
                    <div className="can-donate">
                      <div className="compatibility-label">Có thể cho:</div>
                      <div className="compatibility-types">A, AB</div>
                    </div>
                    <div className="can-receive">
                      <div className="compatibility-label">Có thể nhận:</div>
                      <div className="compatibility-types">A, O</div>
                    </div>
                  </div>
                  <div className="blood-type-stats">
                    <div className="stat-item">
                      <div className="stat-number">42%</div>
                      <div className="stat-label">Dân số</div>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
            
            <Col md={6} lg={3}>
              <div className="blood-type-card-modern blood-type-b">
                <div className="card-background-pattern"></div>
                <div className="blood-type-header">
                  <div className="blood-type-symbol">B</div>
                  <div className="blood-type-rh">
                    <span className="rh-positive">Rh+</span>
                    <span className="rh-negative">Rh-</span>
                  </div>
                </div>
                <div className="blood-type-content">
                  <h4 className="blood-type-name">Nhóm máu B</h4>
                  <div className="compatibility-info">
                    <div className="can-donate">
                      <div className="compatibility-label">Có thể cho:</div>
                      <div className="compatibility-types">B, AB</div>
                    </div>
                    <div className="can-receive">
                      <div className="compatibility-label">Có thể nhận:</div>
                      <div className="compatibility-types">B, O</div>
                    </div>
                  </div>
                  <div className="blood-type-stats">
                    <div className="stat-item">
                      <div className="stat-number">10%</div>
                      <div className="stat-label">Dân số</div>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
            
            <Col md={6} lg={3}>
              <div className="blood-type-card-modern blood-type-ab">
                <div className="card-background-pattern"></div>
                <div className="blood-type-header">
                  <div className="blood-type-symbol">AB</div>
                  <div className="blood-type-rh">
                    <span className="rh-positive">Rh+</span>
                    <span className="rh-negative">Rh-</span>
                  </div>
                </div>
                <div className="blood-type-content">
                  <h4 className="blood-type-name">Nhóm máu AB</h4>
                  <div className="compatibility-info">
                    <div className="can-donate">
                      <div className="compatibility-label">Có thể cho:</div>
                      <div className="compatibility-types">AB</div>
                    </div>
                    <div className="can-receive">
                      <div className="compatibility-label">Có thể nhận:</div>
                      <div className="compatibility-types">Tất cả</div>
                    </div>
                  </div>
                  <div className="blood-type-stats">
                    <div className="stat-item">
                      <div className="stat-number">4%</div>
                      <div className="stat-label">Dân số</div>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
            
            <Col md={6} lg={3}>
              <div className="blood-type-card-modern blood-type-o">
                <div className="card-background-pattern"></div>
                <div className="blood-type-header">
                  <div className="blood-type-symbol">O</div>
                  <div className="blood-type-rh">
                    <span className="rh-positive">Rh+</span>
                    <span className="rh-negative">Rh-</span>
                  </div>
                </div>
                <div className="blood-type-content">
                  <h4 className="blood-type-name">Nhóm máu O</h4>
                  <div className="compatibility-info">
                    <div className="can-donate">
                      <div className="compatibility-label">Có thể cho:</div>
                      <div className="compatibility-types">Tất cả</div>
                    </div>
                    <div className="can-receive">
                      <div className="compatibility-label">Có thể nhận:</div>
                      <div className="compatibility-types">O</div>
                    </div>
                  </div>
                  <div className="blood-type-stats">
                    <div className="stat-item">
                      <div className="stat-number">44%</div>
                      <div className="stat-label">Dân số</div>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
          
          <div className="blood-type-legend">
            <Container>
              <Row className="justify-content-center">
                <Col lg={10}>
                  <div className="legend-content">
                    <h5 className="legend-title">
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Thông tin về yếu tố Rh trong máu</Tooltip>}
                      >
                        <span>Tìm hiểu về yếu tố Rh <AlertOutlined /></span>
                      </OverlayTrigger>
                    </h5>
                    <div className="legend-items">
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
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      {renderCTASection()}
    </div>
  );
};

export default HomePage;
