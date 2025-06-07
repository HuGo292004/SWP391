import React, { useState, useEffect } from 'react';
import { Carousel, Container, Row, Col, Button, Badge, Card } from 'react-bootstrap';
import { HeartFilled, GiftOutlined, MedicineBoxOutlined, SafetyOutlined } from '@ant-design/icons';
import styles from './BenefitsSlider.module.css';

const BenefitsSlider = () => {
  const [index, setIndex] = useState(0);

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex);
  };
  const benefits = [    {
      id: 1,
      title: "Quyền lợi của người hiến máu",
      subtitle: "Người hiến máu tình nguyện sẽ được những quyền lợi sau:",
      backgroundImage: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?q=80&w=1920&auto=format&fit=crop",
      textColor: "#ffffff",
      type: "intro",
      icon: <HeartFilled style={{ fontSize: '4rem', color: '#E53E3E' }} />
    },    {
      id: 2,
      title: "Được bồi dưỡng trực tiếp",
      backgroundImage: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=1920&auto=format&fit=crop",
      textColor: "#ffffff",
      type: "content",
      icon: <GiftOutlined style={{ fontSize: '3rem', color: '#FFD54F' }} />,
      content: [
        {
          text: "Ăn nhẹ, nước uống tại chỗ: tương đương 30.000 đồng",
          detail: "(1 chai trà xanh không độ, 01 hộp chocopie 66gram, 01 hộp bánh Goute 35,5gram)"
        },
        {
          text: "Hỗ trợ chi phí đi lại (bằng tiền mặt): 50.000 đồng",
          detail: ""
        },
        {
          text: "Nhận phần quà tặng gia trị tương đương:",
          detail: "",
          subItems: [
            "100.000đ khi hiến máu 250ml",
            "150.000đ khi hiến máu 350ml", 
            "180.000đ khi hiến máu 450ml"
          ]
        }
      ]
    },    {
      id: 3,
      title: "Chăm sóc sức khỏe miễn phí",
      backgroundImage: "https://images.unsplash.com/photo-1551190822-a9333d879b1f?q=80&w=1920&auto=format&fit=crop",
      textColor: "#ffffff",
      type: "content",
      icon: <MedicineBoxOutlined style={{ fontSize: '3rem', color: '#ffffff' }} />,
      content: [
        {
          text: "Khám sức khỏe định kỳ miễn phí",
          detail: "Được khám sàng lọc trước khi hiến máu"
        },
        {
          text: "Xét nghiệm máu cơ bản miễn phí",
          detail: "Kiểm tra các chỉ số sức khỏe quan trọng"
        },
        {
          text: "Tư vấn sức khỏe từ các chuyên gia",
          detail: "Hỗ trợ 24/7 qua hotline"
        },
        {
          text: "Ưu tiên khám chữa bệnh tại các cơ sở y tế",
          detail: "Mạng lưới bệnh viện đối tác trên toàn quốc"
        }
      ]
    },    {
      id: 4,
      title: "Ưu đãi đặc biệt",
      backgroundImage: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?q=80&w=1920&auto=format&fit=crop",
      textColor: "#ffffff",
      type: "content",
      icon: <SafetyOutlined style={{ fontSize: '3rem', color: '#FFD54F' }} />,
      content: [
        {
          text: "Miễn phí máu khi cần thiết",
          detail: "Người hiến máu và gia đình được ưu tiên"
        },
        {
          text: "Bảo hiểm y tế bổ sung",
          detail: "Hỗ trợ chi phí y tế bất ngờ"
        },
        {
          text: "Tham gia các sự kiện đặc biệt",
          detail: "Hội thảo, workshop về sức khỏe"
        },
        {
          text: "Nhận giấy khen và bằng chứng nhận",
          detail: "Ghi nhận đóng góp tích cực cho cộng đồng"
        }
      ]
    }
  ];  const renderIntroSlide = (benefit) => (
    <div 
      className={styles.introSlide}
      style={{ 
        backgroundImage: `url(${benefit.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: benefit.textColor,
        height: '80vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative'
      }}
    >
      <div 
        className={`position-absolute top-0 start-0 w-100 h-100 ${styles.gradientOverlay}`}
        style={{
          background: 'rgba(0,0,0,0.5)',
          opacity: 0.8
        }}
      />
      <Container fluid className="h-100 position-relative" style={{ zIndex: 2 }}>
        <Row className="justify-content-center align-items-center h-100">
          <Col lg={6} xl={5} className="text-center">
            <div className="mb-4">
              {benefit.icon}
            </div>            <h1 className={`display-5 fw-bold mb-3 ${styles.textShadow}`}>
              {benefit.title}
            </h1>
            <p className={`lead fs-4 mb-4 ${styles.textShadow}`}>
              {benefit.subtitle}
            </p>
            <div className="d-flex justify-content-center">
              <div className="position-relative">
                <img 
                  src="https://images.unsplash.com/photo-1615461066841-6116e61058f4?q=80&w=500&auto=format&fit=crop"
                  alt="Hiến máu"
                  className={`rounded-circle shadow-lg ${styles.heartImage}`}
                  style={{ 
                    width: '200px', 
                    height: '200px', 
                    objectFit: 'cover',
                    border: '3px solid rgba(255,255,255,0.3)'
                  }}
                />
                <div 
                  className="position-absolute top-50 start-50 translate-middle"
                  style={{
                    width: '215px',
                    height: '215px',
                    border: '2px solid rgba(255,255,255,0.5)',
                    borderRadius: '50%',
                    animation: 'pulse 3s infinite'
                  }}
                />
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );  const renderContentSlide = (benefit) => (
    <div 
      className={styles.contentSlide}
      style={{ 
        backgroundImage: `url(${benefit.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: benefit.textColor,
        height: '80vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative'
      }}
    >
      <div 
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{
          background: 'rgba(0,0,0,0.6)',
          opacity: 0.8
        }}
      />      <Container fluid className="position-relative" style={{ zIndex: 2 }}>
        <Row className="justify-content-center align-items-center h-100">
          <Col lg={10} xl={9}>
            <Card className="border-0 shadow-lg bg-transparent" style={{ backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
              <Card.Body className="p-4">
                <div className="text-center mb-4">
                  <div className="mb-3">
                    {benefit.icon}
                  </div>
                  <h2 className="display-6 fw-bold text-white mb-0 text-shadow">{benefit.title}</h2>
                </div>
                
                <Row className="g-4">
                  {benefit.content.map((item, idx) => (
                    <Col lg={6} key={idx}>
                      <Card className="h-100 border-0 shadow benefit-item" style={{ backgroundColor: 'rgba(255,255,255,0.95)' }}>
                        <Card.Body className="p-4">
                          <div className="d-flex align-items-start">
                            <Badge bg="primary" className="me-3 mt-1 fs-6 rounded-pill px-3 py-2">
                              {idx + 1}
                            </Badge>
                            <div className="flex-grow-1">
                              <h5 className="fw-bold text-dark mb-3" style={{ lineHeight: '1.4' }}>
                                {item.text}
                              </h5>
                              {item.detail && (
                                <p className="text-muted mb-3" style={{ fontSize: '0.95rem' }}>
                                  <i className="bi bi-info-circle me-2"></i>
                                  {item.detail}
                                </p>
                              )}
                              {item.subItems && (
                                <div className="mt-3">
                                  {item.subItems.map((subItem, subIdx) => (
                                    <div key={subIdx} className="d-flex align-items-center mb-2">
                                      <Badge bg="success" className="me-3 rounded-pill">
                                        <i className="bi bi-arrow-right"></i>
                                      </Badge>
                                      <span className="text-success fw-semibold">
                                        {subItem}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );return (
    <div className="benefits-slider-wrapper">
      <Carousel 
        activeIndex={index} 
        onSelect={handleSelect}
        interval={5000}
        pause="hover"
        controls={true}
        indicators={true}
        fade={true}
        className="benefits-carousel"
      >
        {benefits.map((benefit) => (
          <Carousel.Item key={benefit.id}>
            {benefit.type === 'intro' 
              ? renderIntroSlide(benefit)
              : renderContentSlide(benefit)
            }
          </Carousel.Item>
        ))}
      </Carousel>
    </div>
  );
};

export default BenefitsSlider;
