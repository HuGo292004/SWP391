import React, { useState, useEffect } from 'react';
import { Carousel, Container, Row, Col, Button, Badge } from 'react-bootstrap';
import { GiftOutlined, MedicineBoxOutlined, SafetyOutlined, TrophyFilled } from '@ant-design/icons';
import '../../styles/BenefitsSlider.css';

const BenefitsSlider = () => {
  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex);
  };

  // Auto-advance with pause on hover
  useEffect(() => {
    if (!isHovered) {
      const interval = setInterval(() => {
        setIndex((prevIndex) => (prevIndex + 1) % benefits.length);
      }, 5000); // 5 seconds interval

      return () => clearInterval(interval);
    }
  }, [isHovered, index]);  const benefits = [    {
      id: 1,
      title: "Quyền lợi của người hiến máu",
      subtitle: "Người hiến máu tình nguyện sẽ được những quyền lợi sau:",
      backgroundImage: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      textColor: "#ffffff",
      type: "intro",
      icon: <TrophyFilled style={{ fontSize: '4rem', color: '#FFD700' }} />
    },{
      id: 2,
      title: "Được bồi dưỡng trực tiếp",
      backgroundImage: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
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
      backgroundImage: "https://images.unsplash.com/photo-1551190822-a9333d879b1f?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
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
      backgroundImage: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
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
      className="intro-slide"
      style={{ 
        backgroundImage: `url(${benefit.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        color: benefit.textColor,
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}
    >      <div
        className="position-absolute top-0 start-0 w-100 h-100 gradient-overlay"
        style={{
          background: 'rgba(0,0,0,0.4)',
          opacity: 0.9
        }}
      />      <Container fluid className="h-100 position-relative" style={{ zIndex: 2 }}>
        <Row className="justify-content-center align-items-center h-100">
          <Col lg={6} xl={5} className="text-center">
            <div className="mb-4">
              {benefit.icon}
            </div>
            <h1 className="display-5 fw-bold mb-3 text-shadow">
              {benefit.title}
            </h1>
            <p className="lead fs-4 mb-4 text-shadow">
              {benefit.subtitle}
            </p>
          </Col>
        </Row>
      </Container>
    </div>
  );  const renderContentSlide = (benefit) => (
    <div 
      className="content-slide"
      style={{ 
        backgroundImage: `url(${benefit.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: benefit.textColor,
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        position: 'relative'
      }}
    >
      <div 
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{
          background: 'rgba(0,0,0,0.6)',
          opacity: 0.9
        }}
      />
      <Container fluid className="position-relative" style={{ zIndex: 2 }}>
        <Row className="justify-content-center align-items-center h-100">
          <Col lg={11} xl={10}>
            <div className="text-center mb-5">
              <div className="mb-4">
                {benefit.icon}
              </div>
              <h2 className="display-5 fw-bold text-white mb-0 text-shadow-light">{benefit.title}</h2>
            </div>
            
            <Row className="g-4 justify-content-center">
              {benefit.content.map((item, idx) => (
                <Col lg={6} xl={5} key={idx}>
                  <div className="benefit-content-item">
                    <div className="d-flex align-items-start mb-3">
                      <div className="benefit-number">
                        {idx + 1}
                      </div>
                      <div className="benefit-text">
                        <h4 className="benefit-title text-white mb-3">
                          {item.text}
                        </h4>
                        {item.detail && (
                          <p className="benefit-detail text-light mb-3">
                            <i className="bi bi-info-circle me-2"></i>
                            {item.detail}
                          </p>
                        )}
                        {item.subItems && (
                          <div className="benefit-subitems mt-3">
                            {item.subItems.map((subItem, subIdx) => (
                              <div key={subIdx} className="benefit-subitem">
                                <div className="benefit-arrow">
                                  <i className="bi bi-arrow-right"></i>
                                </div>
                                <span className="benefit-subtext">
                                  {subItem}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      </Container>
    </div>
  );return (
    <div 
      className="benefits-slider-wrapper"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Carousel 
        activeIndex={index} 
        onSelect={handleSelect}
        interval={isHovered ? null : 5000}
        pause={false}
        controls={true}
        indicators={true}
        fade={true}
        className="benefits-carousel"
        touch={true}
        wrap={true}
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
