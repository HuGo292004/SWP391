import React, { useState } from 'react';
import { Typography, Button as AntButton, Statistic, Space, Modal } from 'antd';
import { 
  HeartOutlined, 
  CalendarOutlined, 
  SearchOutlined, 
  AlertOutlined,   
  BarChartOutlined, 
  TeamOutlined,  
  MedicineBoxOutlined,
  UserOutlined,
  StarOutlined,
  InfoCircleOutlined,
  CloseOutlined,
  ExperimentOutlined,
  SafetyCertificateOutlined,
  ClockCircleOutlined,
  BulbOutlined,
  ThunderboltOutlined
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
import '../../styles/pages.css';
import '../../styles/criteria-fix.css'; // Import the CSS fixes for criteria list


const { Title, Paragraph } = Typography;

// Hàm cuộn xuống phần thông tin nhóm máu
const scrollToBloodTypeSection = () => {
  const element = document.getElementById('blood-type-section');
  if (element) {
    element.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  }
};

const bloodTypeData = [{
    type: 'A',
    percentage: '32%',
    globalPercentage: '31%',
    asiaPercentage: '25-30%',
    population: 'Phổ biến thứ 2',
    canDonateTo: ['A', 'AB'],
    canReceiveFrom: ['A', 'O'],
    characteristics: ['Có kháng nguyên A', 'Có kháng thể anti-B', 'Có thể tạo cục máu nếu nhận sai nhóm'],
    rareLevel: 'Phổ biến',
    specialNote: 'Tương thích tốt với nhóm AB',
    demandLevel: 'Cao - cần thiết thường xuyên',
    importance: 'Cao - phù hợp cho nhiều ca phẫu thuật',
    color: '#1677ff',
    bgColor: '#e6f4ff',
    gradient: 'linear-gradient(135deg, #1677ff 0%, #4096ff 100%)',
    medicalInfo: {
      antigens: 'A',
      antibodies: 'Anti-B',
      rhFactor: '+/- (Có thể dương tính hoặc âm tính)',
      donationFrequency: 'Mỗi 8-12 tuần',
      storageTime: '35-42 ngày (ở 2-6°C)',
      uses: ['Phẫu thuật tim mạch', 'Điều trị bệnh máu', 'Cấp cứu tai nạn', 'Điều trị ung thư máu', 'Phẫu thuật ghép tạng'],
      components: {
        wholeBlood: 'Máu toàn phần - sử dụng trong cấp cứu',
        redCells: 'Hồng cầu - điều trị thiếu máu',
        plasma: 'Huyết tương - điều trị rối loạn đông máu',
        platelets: 'Tiểu cầu - điều trị xuất huyết'
      },
      testingRequired: ['HIV', 'Hepatitis B', 'Hepatitis C', 'Syphilis', 'HTLV', 'Malaria (nếu cần)'],
      preparation: {
        before: 'Ăn no, uống đủ nước, ngủ đủ giấc, không uống rượu bia 24h trước',
        during: 'Thời gian hiến máu khoảng 8-10 phút',
        after: 'Nghỉ ngơi 10-15 phút, uống nước, tránh hoạt động nặng'
      }
    },
    healthTips: [
      'Kiểm tra sức khỏe định kỳ và xét nghiệm máu 3-6 tháng/lần',
      'Uống đủ 2-3 lít nước/ngày, đặc biệt trước và sau hiến máu',
      'Bổ sung sắt từ thực phẩm: thịt đỏ, gan, rau xanh, đậu',
      'Tránh căng thẳng, ngủ đủ 7-8 tiếng/đêm',
      'Tập thể dục nhẹ nhàng sau hiến máu',
      'Không hút thuốc và hạn chế caffeine'
    ],
    nutritionAdvice: [
      'Vitamin C: Cam, chanh, ổi để tăng hấp thu sắt',
      'Protein: Thịt, cá, trứng, đậu phụ để tái tạo hồng cầu',
      'Folate: Rau xanh, gan, đậu để sản xuất DNA',
      'Vitamin B12: Thịt, cá, sữa để tạo hồng cầu khỏe mạnh'
    ],
    funFacts: [
      'Chiếm khoảng 32% dân số Việt Nam và 42% dân số thế giới',
      'Tương thích với cả hai nhóm máu A và AB',
      'Có nguồn gốc tiến hóa từ thời nông nghiệp (20.000-25.000 năm trước)',
      'Thường có tính cách cẩn thận, tỉ mỉ và có trách nhiệm',
      'Có khả năng chống lại một số bệnh nhiễm trùng đường ruột',
      'Thường có nguy cơ mắc bệnh tim mạch cao hơn nhóm O'
    ],
    statistics: {
      globalPercentage: '42%',
      asianPercentage: '25-30%',
      donationDemand: 'Cao - cần thiết cho nhiều ca phẫu thuật',
      emergencyUse: 'Trung bình - có thể sử dụng cho nhóm A và AB'
    }
  },  {
    type: 'B',
    percentage: '12%',
    globalPercentage: '11%',
    asiaPercentage: '20-25%',
    population: 'Ít phổ biến',
    canDonateTo: ['B', 'AB'],
    canReceiveFrom: ['B', 'O'],
    characteristics: ['Có kháng nguyên B', 'Có kháng thể anti-A', 'Khả năng thích ứng cao'],
    rareLevel: 'Trung bình',
    specialNote: 'Cần thiết cho bệnh nhân nhóm B',
    demandLevel: 'Rất cao - khan hiếm trên toàn cầu',
    importance: 'Cao - cần thiết cho nhiều ca đặc biệt',
    color: '#13a8a8',
    bgColor: '#e6fffb',
    gradient: 'linear-gradient(135deg, #13a8a8 0%, #36cfc9 100%)',
    medicalInfo: {
      antigens: 'B',
      antibodies: 'Anti-A',
      rhFactor: '+/- (Có thể dương tính hoặc âm tính)',
      donationFrequency: 'Mỗi 8-12 tuần',
      storageTime: '35-42 ngày (ở 2-6°C)',
      uses: ['Điều trị ung thư', 'Phẫu thuật ghép tạng', 'Bệnh lý máu hiếm', 'Điều trị bệnh thận', 'Phẫu thuật não'],
      components: {
        wholeBlood: 'Máu toàn phần - ưu tiên cho cấp cứu khẩn cấp',
        redCells: 'Hồng cầu - điều trị thiếu máu mãn tính',
        plasma: 'Huyết tương - sản xuất thuốc miễn dịch',
        platelets: 'Tiểu cầu - điều trị bệnh máu ác tính'
      },
      testingRequired: ['HIV', 'Hepatitis B', 'Hepatitis C', 'Syphilis', 'HTLV', 'CMV (nếu cần)'],
      preparation: {
        before: 'Nghỉ ngơi đầy đủ, không căng thẳng, ăn uống điều độ',
        during: 'Quy trình hiến máu an toàn với thiết bị vô trùng',
        after: 'Theo dõi sức khỏe, bổ sung dinh dưỡng'
      }
    },
    healthTips: [
      'Tăng cường vitamin B12 và folate từ thực phẩm tự nhiên',
      'Duy trì chế độ ăn cân bằng với đầy đủ protein và vitamin',
      'Tập thể dục đều đặn 30 phút/ngày, 5 ngày/tuần',
      'Kiểm tra chỉ số máu và sức khỏe định kỳ 6 tháng/lần',
      'Hạn chế stress, thực hành thiền định hoặc yoga',
      'Bổ sung omega-3 từ cá và hạt chia'
    ],
    nutritionAdvice: [
      'Thịt đỏ và gan: Nguồn vitamin B12 và sắt dồi dào',
      'Rau xanh đậm: Spinach, cải xoăn giàu folate',
      'Hải sản: Cung cấp kẽm và selen tăng miễn dịch',
      'Hạt và đậu: Protein thực vật và chất xơ'
    ],
    funFacts: [
      'Chỉ chiếm 12% dân số Việt Nam, khá hiếm trên thế giới',
      'Có thể hiến cho nhóm B và AB, rất quý giá',
      'Xuất hiện khoảng 10.000-15.000 năm trước tại vùng núi',
      'Thường có tính cách sáng tạo, linh hoạt và thích khám phá',
      'Có khả năng chống lại một số virus và vi khuẩn',
      'Thường có hệ tiêu hóa mạnh, thích ứng tốt với môi trường'
    ],
    statistics: {
      globalPercentage: '11%',
      asianPercentage: '20-25%',
      donationDemand: 'Rất cao - khan hiếm trên toàn cầu',
      emergencyUse: 'Cao - cần thiết cho nhiều ca đặc biệt'
    }
  },  {
    type: 'AB',
    percentage: '4%',
    globalPercentage: '4%',
    asiaPercentage: '5-10%',
    population: 'Hiếm nhất',
    canDonateTo: ['AB'],
    canReceiveFrom: ['A', 'B', 'AB', 'O'],
    characteristics: ['Có cả kháng nguyên A và B', 'Không có kháng thể', 'Người nhận máu toàn năng'],
    rareLevel: 'Hiếm',
    specialNote: 'Người nhận máu toàn năng',
    demandLevel: 'Cực kỳ cao - quý giá nhất',
    importance: 'Cực kỳ quan trọng - không thể thay thế',
    color: '#08979c',
    bgColor: '#e6f7ff',
    gradient: 'linear-gradient(135deg, #08979c 0%, #13c2c2 100%)',
    medicalInfo: {
      antigens: 'A và B',
      antibodies: 'Không có',
      rhFactor: '+/- (Có thể dương tính hoặc âm tính)',
      donationFrequency: 'Mỗi 8-12 tuần',
      storageTime: '35-42 ngày (ở 2-6°C)',
      uses: ['Cấp cứu khẩn cấp', 'Điều trị bệnh hiếm', 'Nghiên cứu y học', 'Điều trị bệnh tự miễn', 'Liệu pháp tế bào gốc'],
      components: {
        wholeBlood: 'Hiếm, chỉ dùng trong trường hợp đặc biệt',
        redCells: 'Hồng cầu - cho bệnh nhân nhóm AB',
        plasma: 'Huyết tương quý giá - tương thích với mọi nhóm',
        platelets: 'Tiểu cầu - rất quan trọng cho nhóm AB'
      },
      testingRequired: ['HIV', 'Hepatitis B', 'Hepatitis C', 'Syphilis', 'HTLV', 'Toàn bộ panel bệnh nhiễm trùng'],
      preparation: {
        before: 'Tư vấn kỹ lưỡng, đánh giá sức khỏe toàn diện',
        during: 'Giám sát chặt chẽ, quy trình đặc biệt',
        after: 'Theo dõi sát sao, chăm sóc đặc biệt'
      }
    },
    healthTips: [
      'Cần chú ý đặc biệt đến sức khỏe vì tính hiếm của nhóm máu',
      'Uống nhiều nước (3-4 lít/ngày) và nghỉ ngơi đầy đủ',
      'Tham khảo bác sĩ chuyên khoa trước khi hiến máu',
      'Theo dõi các chỉ số sức khỏe thường xuyên',
      'Duy trì lối sống lành mạnh, tránh các yếu tố nguy cơ',
      'Tham gia cộng đồng hiến máu để được hỗ trợ'
    ],
    nutritionAdvice: [
      'Đa dạng thực phẩm: Kết hợp ưu điểm của nhóm A và B',
      'Protein chất lượng: Cá, đậu phụ, thịt nạc',
      'Chất chống oxy hóa: Berry, trà xanh, rau màu tối',
      'Bổ sung vitamin tổng hợp theo chỉ định bác sĩ'
    ],
    funFacts: [
      'Hiếm nhất trên thế giới - chỉ 4% dân số Việt Nam',
      'Có thể nhận máu từ tất cả nhóm máu - "Universal Recipient"',
      'Nhóm máu "mới nhất" trong tiến hóa (1.000-1.200 năm)',
      'Thường có khả năng thích ứng cao và tư duy đa chiều',
      'Huyết tương AB+ có thể hiến cho tất cả nhóm máu',
      'Có đặc điểm miễn dịch đặc biệt, chống lại nhiều bệnh',
      'Thường có IQ cao và khả năng sáng tạo xuất sắc'
    ],
    statistics: {
      globalPercentage: '4%',
      asianPercentage: '5-10%',
      donationDemand: 'Cực kỳ cao - quý giá nhất',
      emergencyUse: 'Cực kỳ quan trọng - không thể thay thế'
    }
  },  {
    type: 'O',
    percentage: '52%',
    globalPercentage: '45%',
    asiaPercentage: '40-50%',
    population: 'Phổ biến nhất',
    canDonateTo: ['A', 'B', 'AB', 'O'],
    canReceiveFrom: ['O'],
    characteristics: ['Không có kháng nguyên', 'Có cả kháng thể anti-A và anti-B', 'Người cho máu toàn năng'],
    rareLevel: 'Rất phổ biến',
    specialNote: 'Người cho máu toàn năng',
    demandLevel: 'Cực kỳ cao - luôn thiếu hụt',
    importance: 'Cao nhất - không thể thiếu trong cấp cứu',
    color: '#0958d9',
    bgColor: '#f0f5ff',
    gradient: 'linear-gradient(135deg, #0958d9 0%, #1890ff 100%)',
    medicalInfo: {
      antigens: 'Không có',
      antibodies: 'Anti-A và Anti-B',
      rhFactor: '+/- (Có thể dương tính hoặc âm tính)',
      donationFrequency: 'Mỗi 8-12 tuần',
      storageTime: '35-42 ngày (ở 2-6°C)',
      uses: ['Cấp cứu khẩn cấp', 'Phẫu thuật lớn', 'Truyền máu đại trà', 'Tai nạn giao thông', 'Thiên tai, chiến tranh'],
      components: {
        wholeBlood: 'Máu toàn phần - ưu tiên số 1 trong cấp cứu',
        redCells: 'Hồng cầu - tương thích với mọi nhóm máu',
        plasma: 'Huyết tương - chỉ cho nhóm O',
        platelets: 'Tiểu cầu - có thể cho tất cả nhóm máu'
      },
      testingRequired: ['HIV', 'Hepatitis B', 'Hepatitis C', 'Syphilis', 'HTLV', 'Panel bệnh nhiễm trùng đầy đủ'],
      preparation: {
        before: 'Chuẩn bị tốt vì là nguồn máu quý giá nhất',
        during: 'Quy trình chuẩn với đặc biệt chú ý chất lượng',
        after: 'Chăm sóc đặc biệt, khuyến khích hiến máu thường xuyên'
      }
    },
    healthTips: [
      'Duy trì chế độ ăn giàu protein để tái tạo hồng cầu',
      'Tập thể dục thường xuyên để duy trì sức khỏe tim mạch',
      'Kiểm tra sức khỏe định kỳ 3-6 tháng/lần',
      'Hiến máu thường xuyên để giúp đỡ cộng đồng',
      'Bổ sung sắt và vitamin C đầy đủ',
      'Tránh stress, duy trì tinh thần tích cực'
    ],
    nutritionAdvice: [
      'Thịt đỏ: Nguồn sắt heme dễ hấp thu nhất',
      'Rau xanh: Spinach, cải bó xôi giàu sắt thực vật',
      'Vitamin C: Cam, ổi, cà chua tăng hấp thu sắt',
      'Protein đầy đủ: Cá, trứng, đậu để tái tạo máu'
    ],
    funFacts: [
      'Phổ biến nhất - 52% dân số Việt Nam và 45% thế giới',
      'Có thể hiến cho tất cả nhóm máu - "Universal Donor"',
      'Nhóm máu "cổ xưa" nhất, có từ 60.000 năm trước',
      'Thường có sức khỏe tốt, hệ miễn dịch mạnh và năng động',
      'Được gọi là "vàng đỏ" trong y học cấp cứu',
      'Có khả năng chống lại một số bệnh tim mạch',
      'Thường có tính cách lãnh đạo và quyết đoán mạnh mẽ'
    ],
    statistics: {
      globalPercentage: '45%',
      asianPercentage: '40-50%',
      donationDemand: 'Cực kỳ cao - luôn thiếu hụt',
      emergencyUse: 'Cao nhất - không thể thiếu trong cấp cứu'
    }
  },
];

const HomePage = () => {
  const location = useLocation();
  const userRole = getUserRoleFromPath(location.pathname);
  
  // State for blood type detail modal
  const [selectedBloodType, setSelectedBloodType] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Function to show blood type details
  const showBloodTypeDetails = (bloodType) => {
    setSelectedBloodType(bloodType);
    setIsModalVisible(true);
  };

  // Function to close modal
  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedBloodType(null);
  };

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
                    </p>                    <Button 
                      variant="primary" 
                      size="lg" 
                      onClick={scrollToBloodTypeSection}
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
                    onClick={scrollToBloodTypeSection}
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
                <div className="section-icon-wrapper mb-1">                  <BarChartOutlined className="section-main-icon" style={{ fontSize: '24px' }} />
                </div>                <h2 className="statistics-title-enhanced mb-1">
                  <span className="title-main">Thống Kê Hệ Thống</span>
                </h2>
                <p className="statistics-subtitle-enhanced small">
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
      </section>      {/* Blood Type Information Section - Modern Design */}
      <section id="blood-type-section" className="blood-type-modern-section py-4 bg-gradient-light">
        <Container>
          <Row className="text-center mb-4">
            <Col lg={8} className="mx-auto">
              <div className="section-header-modern">
                <div className="section-icon-modern mb-2">
                  <MedicineBoxOutlined className="main-icon" />
                </div>
                <h2 className="section-title-modern mb-2">
                  Thông Tin Nhóm Máu
                </h2>
                <div className="title-underline-modern"></div>
                <p className="section-subtitle-modern mb-3">
                  Hiểu rõ về các nhóm máu ABO và khả năng tương thích để hiến máu hiệu quả
                </p>
              </div>
            </Col>
          </Row>

          {/* Blood Type Cards */}
          <Row className="g-3 mb-4">
            {bloodTypeData.map((bloodType, index) => (
              <Col lg={6} xl={3} md={6} key={index}>
                <Card className="blood-type-card-simple h-100 border-0 shadow-sm">
                  <Card.Body className="p-3 text-center">
                    <div 
                      className="blood-type-icon-simple mb-2"
                      style={{ background: bloodType.gradient }}
                    >
                      <span className="blood-type-letter-simple">
                        {bloodType.type}
                      </span>
                    </div>
                    
                    <h5 className="blood-type-name-simple mb-2">
                      Nhóm {bloodType.type}
                    </h5>
                    
                    <div className="percentage-display mb-2">
                      <span className="percentage-number">{bloodType.percentage}</span>
                      <span className="percentage-label">dân số</span>
                    </div>
                    
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      className="detail-btn"
                      onClick={() => showBloodTypeDetails(bloodType)}
                    >
                      <InfoCircleOutlined className="me-1" />
                      Chi tiết
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row></Container>
      </section>

      {/* Blood Type Detail Modal */}          <Modal
            title={null}
            open={isModalVisible}
            onCancel={handleCloseModal}
            footer={null}
            width={700}
            className="blood-type-modal"
            closeIcon={<CloseOutlined style={{ fontSize: '16px', color: '#595959' }} />}
          >
            {selectedBloodType && (
              <div className="blood-type-detail-content">
                {/* Modal Header */}
                <div 
                  className="modal-header-gradient mb-4"
                  style={{ background: selectedBloodType.gradient }}
                >
                  <div className="modal-blood-icon">
                    <span className="modal-blood-letter">
                      {selectedBloodType.type}
                    </span>
                  </div>
                  <h3 className="modal-blood-title">
                    Nhóm Máu {selectedBloodType.type}
                  </h3>
                  <div className="modal-percentage">
                    {selectedBloodType.percentage} dân số Việt Nam
                  </div>
                </div>

                {/* Modal Body */}
                <div className="modal-body-content">
                  <Row className="g-4">
                    {/* Basic Info */}
                    <Col md={6}>
                      <div className="info-section">
                        <h5 className="info-section-title">
                          <UserOutlined className="me-2" />
                          Thông Tin Cơ Bản
                        </h5>
                        <div className="info-item">
                          <span className="info-label">Tỷ lệ dân số:</span>
                          <span className="info-value">{selectedBloodType.population}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Mức độ hiếm:</span>
                          <span className="info-value">{selectedBloodType.rareLevel}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Đặc điểm:</span>
                          <span className="info-value">{selectedBloodType.specialNote}</span>
                        </div>
                      </div>
                    </Col>

                    {/* Compatibility */}
                    <Col md={6}>
                      <div className="info-section">
                        <h5 className="info-section-title">
                          <HeartOutlined className="me-2" />
                          Khả Năng Tương Thích
                        </h5>
                        <div className="compatibility-detail">
                          <div className="compatibility-group donate-group">
                            <div className="compatibility-group-label">
                              <HeartOutlined className="me-1" />
                              Có thể hiến cho:
                            </div>
                            <div className="blood-tags-modal">
                              {selectedBloodType.canDonateTo.map((type, idx) => (
                                <span key={idx} className="blood-tag-modal donate-tag-modal">
                                  {type}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div className="compatibility-group receive-group">
                            <div className="compatibility-group-label">
                              <MedicineBoxOutlined className="me-1" />
                              Có thể nhận từ:
                            </div>
                            <div className="blood-tags-modal">
                              {selectedBloodType.canReceiveFrom.map((type, idx) => (
                                <span key={idx} className="blood-tag-modal receive-tag-modal">
                                  {type}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Col>
                  </Row>                  {/* Medical Information */}
                  <div className="medical-info-section mt-4">
                    <h5 className="info-section-title">
                      <ExperimentOutlined className="me-2" />
                      Thông Tin Y Khoa Chi Tiết
                    </h5>
                    <Row className="g-3">
                      <Col md={6}>
                        <div className="medical-card">
                          <div className="medical-item">
                            <strong>Kháng nguyên:</strong> {selectedBloodType.medicalInfo.antigens}
                          </div>
                          <div className="medical-item">
                            <strong>Kháng thể:</strong> {selectedBloodType.medicalInfo.antibodies}
                          </div>
                          <div className="medical-item">
                            <strong>Yếu tố Rh:</strong> {selectedBloodType.medicalInfo.rhFactor}
                          </div>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="medical-card">
                          <div className="medical-item">
                            <strong>Tần suất hiến:</strong> {selectedBloodType.medicalInfo.donationFrequency}
                          </div>
                          <div className="medical-item">
                            <strong>Thời gian bảo quản:</strong> {selectedBloodType.medicalInfo.storageTime}
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>

                  {/* Blood Components */}
                  <div className="components-section mt-4">
                    <h5 className="info-section-title">
                      <MedicineBoxOutlined className="me-2" />
                      Thành Phần Máu & Ứng Dụng
                    </h5>
                    <Row className="g-3">
                      {Object.entries(selectedBloodType.medicalInfo.components).map(([key, value], idx) => (
                        <Col md={6} key={idx}>
                          <div className="component-card">
                            <div className="component-icon">
                              <div className="component-bullet"></div>
                            </div>
                            <div className="component-content">
                              <strong>{key === 'wholeBlood' ? 'Máu toàn phần' : 
                                      key === 'redCells' ? 'Hồng cầu' :
                                      key === 'plasma' ? 'Huyết tương' : 'Tiểu cầu'}:</strong>
                              <span className="component-desc">{value}</span>
                            </div>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </div>

                  {/* Testing Required */}
                  <div className="testing-section mt-4">
                    <h5 className="info-section-title">
                      <SafetyCertificateOutlined className="me-2" />
                      Xét Nghiệm Bắt Buộc
                    </h5>
                    <div className="testing-grid">
                      {selectedBloodType.medicalInfo.testingRequired.map((test, idx) => (
                        <div key={idx} className="test-item">
                          <div className="test-icon">
                            <SafetyCertificateOutlined />
                          </div>
                          <span>{test}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Medical Uses */}
                  <div className="uses-section mt-4">
                    <h5 className="info-section-title">
                      <MedicineBoxOutlined className="me-2" />
                      Ứng Dụng Y Khoa
                    </h5>
                    <div className="uses-list">
                      {selectedBloodType.medicalInfo.uses.map((use, idx) => (
                        <div key={idx} className="use-item">
                          <div className="use-bullet"></div>
                          <span>{use}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Preparation Process */}
                  <div className="preparation-section mt-4">
                    <h5 className="info-section-title">
                      <ClockCircleOutlined className="me-2" />
                      Quy Trình Hiến Máu
                    </h5>
                    <Row className="g-3">
                      <Col md={4}>
                        <div className="prep-card prep-before">
                          <h6 className="prep-title">Trước khi hiến</h6>
                          <p className="prep-content">{selectedBloodType.medicalInfo.preparation.before}</p>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="prep-card prep-during">
                          <h6 className="prep-title">Trong quá trình</h6>
                          <p className="prep-content">{selectedBloodType.medicalInfo.preparation.during}</p>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="prep-card prep-after">
                          <h6 className="prep-title">Sau khi hiến</h6>
                          <p className="prep-content">{selectedBloodType.medicalInfo.preparation.after}</p>
                        </div>
                      </Col>
                    </Row>
                  </div>

                  {/* Health Tips */}
                  <div className="health-tips-section mt-4">
                    <h5 className="info-section-title">
                      <HeartOutlined className="me-2" />
                      Lời Khuyên Sức Khỏe
                    </h5>
                    <div className="tips-grid">
                      {selectedBloodType.healthTips.map((tip, idx) => (
                        <div key={idx} className="tip-item">
                          <ThunderboltOutlined className="tip-icon" />
                          <span>{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Nutrition Advice */}
                  {selectedBloodType.nutritionAdvice && (
                    <div className="nutrition-section mt-4">
                      <h5 className="info-section-title">
                        <StarOutlined className="me-2" />
                        Dinh Dưỡng Khuyến Nghị
                      </h5>
                      <div className="nutrition-grid">
                        {selectedBloodType.nutritionAdvice.map((advice, idx) => (
                          <div key={idx} className="nutrition-item">
                            <div className="nutrition-icon">
                              <StarOutlined />
                            </div>
                            <span>{advice}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Statistics */}
                  {selectedBloodType.statistics && (
                    <div className="statistics-section mt-4">
                      <h5 className="info-section-title">
                        <BarChartOutlined className="me-2" />
                        Thống Kê Quan Trọng
                      </h5>
                      <Row className="g-3">
                        <Col md={6}>
                          <div className="stat-card">
                            <div className="stat-item">
                              <span className="stat-label">Tỷ lệ toàn cầu:</span>
                              <span className="stat-value">{selectedBloodType.statistics.globalPercentage}</span>
                            </div>
                            <div className="stat-item">
                              <span className="stat-label">Tỷ lệ châu Á:</span>
                              <span className="stat-value">{selectedBloodType.statistics.asianPercentage}</span>
                            </div>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="stat-card">
                            <div className="stat-item">
                              <span className="stat-label">Nhu cầu hiến máu:</span>
                              <span className="stat-value">{selectedBloodType.statistics.donationDemand}</span>
                            </div>
                            <div className="stat-item">
                              <span className="stat-label">Tầm quan trọng:</span>
                              <span className="stat-value">{selectedBloodType.statistics.emergencyUse}</span>
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  )}

                  {/* Characteristics */}
                  <div className="characteristics-section mt-4">
                    <h5 className="info-section-title">
                      <StarOutlined className="me-2" />
                      Đặc Điểm Sinh Học
                    </h5>
                    <div className="characteristics-list">
                      {selectedBloodType.characteristics.map((char, idx) => (
                        <div key={idx} className="characteristic-item">
                          <div className="characteristic-bullet"></div>
                          <span>{char}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Fun Facts */}
                  <div className="fun-facts-section mt-4">
                    <h5 className="info-section-title">
                      <BulbOutlined className="me-2" />
                      Những Điều Thú Vị
                    </h5>
                    <div className="facts-grid">
                      {selectedBloodType.funFacts.map((fact, idx) => (
                        <div key={idx} className="fact-item">
                          <div className="fact-number">{idx + 1}</div>
                          <span>{fact}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Modal>      {/* Donation Standards Section */}
      <section className="donation-standards-section bg-gradient-light">
        <Container>
          <Row className="text-center mb-3">
            <Col lg={10} className="mx-auto">
              <div className="section-header-modern">
                <div className="section-icon-modern mb-2">
                  <SafetyCertificateOutlined className="main-icon" />
                </div>
                <h2 className="section-title-modern mb-2">
                  Tiêu Chuẩn Hiến Máu
                </h2>
                <div className="title-underline-modern"></div>
                <p className="section-subtitle-modern mb-3">
                  Đáp ứng các tiêu chuẩn dưới đây để trở thành người hùng cứu người
                </p>
              </div>
            </Col>
          </Row>          <Row className="g-3 mb-4">
            {/* Age Requirement */}            <Col lg={3} md={6}>
              <Card className="standards-card h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-3">
                  <div className="standards-icon-wrapper mb-2">
                    <div className="standards-icon age-gradient">
                      <CalendarOutlined />
                    </div>
                  </div>
                  <h4 className="standards-card-title mb-2">Độ tuổi</h4>
                  <div className="standards-range mb-2">
                    <div className="range-display">
                      <span className="range-number">18</span>
                      <span className="range-separator">-</span>
                      <span className="range-number">60</span>
                      <span className="range-unit">tuổi</span>
                    </div>
                  </div>
                  <div className="standards-note">
                    <div className="note-icon">
                      <InfoCircleOutlined />
                    </div>
                    <span>Lần đầu hiến máu: tối đa 55 tuổi</span>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Weight Requirement */}
            <Col lg={3} md={6}>
              <Card className="standards-card h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="standards-icon-wrapper mb-3">
                    <div className="standards-icon weight-gradient">
                      <UserOutlined />
                    </div>
                  </div>
                  <h4 className="standards-card-title mb-3">Cân nặng</h4>
                  <div className="weight-requirements mb-3">
                    <div className="weight-item male-weight">
                      <div className="gender-icon male-icon">
                        <UserOutlined />
                      </div>
                      <div className="weight-info">
                        <span className="gender-label">Nam</span>
                        <span className="weight-value">≥ 45kg</span>
                      </div>
                    </div>
                    <div className="weight-item female-weight">
                      <div className="gender-icon female-icon">
                        <UserOutlined />
                      </div>
                      <div className="weight-info">
                        <span className="gender-label">Nữ</span>
                        <span className="weight-value">≥ 42kg</span>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Health Requirement */}
            <Col lg={3} md={6}>
              <Card className="standards-card h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="standards-icon-wrapper mb-3">
                    <div className="standards-icon health-gradient">
                      <HeartOutlined />
                    </div>
                  </div>
                  <h4 className="standards-card-title mb-3">Sức khỏe</h4>
                  <div className="health-requirements mb-3">
                    <div className="health-item">
                      <div className="check-icon">
                        <SafetyCertificateOutlined />
                      </div>
                      <span>Không mắc bệnh truyền nhiễm</span>
                    </div>
                    <div className="health-item">
                      <div className="check-icon">
                        <HeartOutlined />
                      </div>
                      <span>Sức khỏe tổng quát tốt</span>
                    </div>
                    <div className="health-item">
                      <div className="check-icon">
                        <MedicineBoxOutlined />
                      </div>
                      <span>Không dùng thuốc cấm</span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Frequency Requirement */}
            <Col lg={3} md={6}>
              <Card className="standards-card h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="standards-icon-wrapper mb-3">
                    <div className="standards-icon frequency-gradient">
                      <ClockCircleOutlined />
                    </div>
                  </div>
                  <h4 className="standards-card-title mb-3">Tần suất</h4>
                  <div className="frequency-display mb-3">
                    <div className="frequency-circle">
                      <span className="frequency-number">12</span>
                      <span className="frequency-unit">tuần</span>
                    </div>
                    <div className="frequency-description">
                      Khoảng cách tối thiểu
                    </div>
                  </div>
                  <div className="standards-note">
                    <div className="note-icon">
                      <AlertOutlined />
                    </div>
                    <span>Giữa 2 lần hiến máu</span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>          {/* Enhanced Call to Action */}
          <Row className="justify-content-center">
            <Col lg={10} className="text-center">
              <div className="cta-modern-wrapper">
                <div className="cta-background">
                  <div className="cta-icon-large mb-4">
                    <HeartOutlined />
                  </div>
                  <h3 className="cta-modern-title mb-3">Bạn đã sẵn sàng trở thành người hùng?</h3>
                  <p className="cta-modern-description mb-4">
                    Mỗi lần hiến máu của bạn có thể cứu sống tới 3 người. 
                    Hãy kiểm tra xem bạn có đủ điều kiện không!
                  </p>
                  <div className="cta-stats mb-4">
                    <Row>
                      <Col md={4}>
                        <div className="cta-stat">
                          <div className="stat-number">1</div>
                          <div className="stat-label">Lần hiến máu</div>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="cta-stat">
                          <div className="stat-number">3</div>
                          <div className="stat-label">Mạng sống được cứu</div>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="cta-stat">
                          <div className="stat-number">450ml</div>
                          <div className="stat-label">Máu hiến</div>
                        </div>
                      </Col>
                    </Row>
                  </div>
                  <div className="cta-modern-buttons">
                    <Button variant="danger" size="lg" className="me-3 cta-primary-modern">
                      <HeartOutlined className="me-2" />
                      Đăng ký hiến máu ngay
                    </Button>
                    <Button variant="outline-primary" size="lg" className="cta-secondary-modern">
                      <InfoCircleOutlined className="me-2" />
                      Tìm hiểu thêm
                    </Button>
                  </div>
                </div>
              </div>
            </Col>
          </Row></Container>
      </section>
    </div>
  );
};

export default HomePage;
