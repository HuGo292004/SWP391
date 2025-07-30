// Import các component và thư viện cần thiết
import EmergencyRequestsList from "../../components/ui/EmergencyRequestsList"; // Component danh sách yêu cầu khẩn cấp
import React, { useState, useEffect } from "react"; // React hooks
import { useNavigate, useLocation, Link } from "react-router-dom"; // Router hooks và components
import { Typography, Button as AntButton, Statistic, Space, Modal } from "antd"; // Ant Design components
import { Card, Row, Col, Container, Badge, Button } from "react-bootstrap"; // Bootstrap components
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
  ThunderboltOutlined,
  RocketOutlined,
  SecurityScanOutlined,
  CloudOutlined,
  DatabaseOutlined,
  ApiOutlined,
  DashboardOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  GlobalOutlined,
} from "@ant-design/icons"; // Import các icon từ Ant Design
import { BenefitsSlider } from "../../components/ui"; // Component slider hiển thị lợi ích
import {
  getUserRoleFromPath,
  createRoleBasedPath,
} from "../../utils/roleUtils"; // Utility functions cho vai trò người dùng
// Import các file CSS
import "../../styles/SystemExcellence.css";
import "../../styles/HomePage.css";
import "../../styles/banners.css";
import "../../styles/pages.css";
import "../../styles/criteria-fix.css"; // CSS fixes cho danh sách tiêu chí

// Destructure Typography components từ Ant Design
const { Title, Paragraph } = Typography;

// Hàm cuộn mượt xuống phần thông tin nhóm máu
const scrollToBloodTypeSection = () => {
  // Tìm element có id 'blood-type-section'
  const element = document.getElementById("blood-type-section");
  if (element) {
    // Cuộn mượt đến vị trí element
    element.scrollIntoView({
      behavior: "smooth", // Cuộn mượt
      block: "start", // Căn chỉnh đầu element với đầu viewport
    });
  }
};

// Dữ liệu chi tiết về các nhóm máu ABO
const bloodTypeData = [
  {
    // Nhóm máu A
    type: "A", // Loại nhóm máu
    percentage: "32%", // Tỷ lệ trong dân số Việt Nam
    globalPercentage: "31%", // Tỷ lệ toàn cầu
    asiaPercentage: "25-30%", // Tỷ lệ trong dân số châu Á
    population: "Phổ biến thứ 2", // Mức độ phổ biến
    canDonateTo: ["A", "AB"], // Có thể hiến cho nhóm máu nào
    canReceiveFrom: ["A", "O"], // Có thể nhận từ nhóm máu nào
    characteristics: [
      "Có kháng nguyên A",
      "Có kháng thể anti-B",
      "Có thể tạo cục máu nếu nhận sai nhóm",
    ], // Đặc điểm sinh học
    rareLevel: "Phổ biến", // Mức độ hiếm
    specialNote: "Tương thích tốt với nhóm AB", // Ghi chú đặc biệt
    demandLevel: "Cao - cần thiết thường xuyên", // Mức độ nhu cầu
    importance: "Cao - phù hợp cho nhiều ca phẫu thuật", // Tầm quan trọng
    color: "#1677ff", // Màu chủ đạo
    bgColor: "#e6f4ff", // Màu nền
    gradient: "linear-gradient(135deg, #1677ff 0%, #4096ff 100%)", // Gradient màu

    // Thông tin y khoa chi tiết
    medicalInfo: {
      antigens: "A", // Kháng nguyên
      antibodies: "Anti-B", // Kháng thể
      rhFactor: "+/- (Có thể dương tính hoặc âm tính)", // Yếu tố Rh
      donationFrequency: "Mỗi 8-12 tuần", // Tần suất hiến máu
      storageTime: "35-42 ngày (ở 2-6°C)", // Thời gian bảo quản
      uses: [
        "Phẫu thuật tim mạch",
        "Điều trị bệnh máu",
        "Cấp cứu tai nạn",
        "Điều trị ung thư máu",
        "Phẫu thuật ghép tạng",
      ], // Ứng dụng y khoa

      // Các thành phần máu và công dụng
      components: {
        wholeBlood: "Máu toàn phần - sử dụng trong cấp cứu",
        redCells: "Hồng cầu - điều trị thiếu máu",
        plasma: "Huyết tương - điều trị rối loạn đông máu",
        platelets: "Tiểu cầu - điều trị xuất huyết",
      },

      // Các xét nghiệm bắt buộc
      testingRequired: [
        "HIV",
        "Hepatitis B",
        "Hepatitis C",
        "Syphilis",
        "HTLV",
        "Malaria (nếu cần)",
      ],

      // Quy trình chuẩn bị hiến máu
      preparation: {
        before:
          "Ăn no, uống đủ nước, ngủ đủ giấc, không uống rượu bia 24h trước",
        during: "Thời gian hiến máu khoảng 8-10 phút",
        after: "Nghỉ ngơi 10-15 phút, uống nước, tránh hoạt động nặng",
      },
    },

    // Lời khuyên về sức khỏe
    healthTips: [
      "Kiểm tra sức khỏe định kỳ và xét nghiệm máu 3-6 tháng/lần",
      "Uống đủ 2-3 lít nước/ngày, đặc biệt trước và sau hiến máu",
      "Bổ sung sắt từ thực phẩm: thịt đỏ, gan, rau xanh, đậu",
      "Tránh căng thẳng, ngủ đủ 7-8 tiếng/đêm",
      "Tập thể dục nhẹ nhàng sau hiến máu",
      "Không hút thuốc và hạn chế caffeine",
    ],

    // Lời khuyên về dinh dưỡng
    nutritionAdvice: [
      "Vitamin C: Cam, chanh, ổi để tăng hấp thu sắt",
      "Protein: Thịt, cá, trứng, đậu phụ để tái tạo hồng cầu",
      "Folate: Rau xanh, gan, đậu để sản xuất DNA",
      "Vitamin B12: Thịt, cá, sữa để tạo hồng cầu khỏe mạnh",
    ],

    // Những sự thật thú vị
    funFacts: [
      "Chiếm khoảng 32% dân số Việt Nam và 42% dân số thế giới",
      "Tương thích với cả hai nhóm máu A và AB",
      "Có nguồn gốc tiến hóa từ thời nông nghiệp (20.000-25.000 năm trước)",
      "Thường có tính cách cẩn thận, tỉ mỉ và có trách nhiệm",
      "Có khả năng chống lại một số bệnh nhiễm trùng đường ruột",
      "Thường có nguy cơ mắc bệnh tim mạch cao hơn nhóm O",
    ],

    // Thống kê quan trọng
    statistics: {
      globalPercentage: "42%",
      asianPercentage: "25-30%",
      donationDemand: "Cao - cần thiết cho nhiều ca phẫu thuật",
      emergencyUse: "Trung bình - có thể sử dụng cho nhóm A và AB",
    },
  },
  {
    type: "B",
    percentage: "12%",
    globalPercentage: "11%",
    asiaPercentage: "20-25%",
    population: "Ít phổ biến",
    canDonateTo: ["B", "AB"],
    canReceiveFrom: ["B", "O"],
    characteristics: [
      "Có kháng nguyên B",
      "Có kháng thể anti-A",
      "Khả năng thích ứng cao",
    ],
    rareLevel: "Trung bình",
    specialNote: "Cần thiết cho bệnh nhân nhóm B",
    demandLevel: "Rất cao - khan hiếm trên toàn cầu",
    importance: "Cao - cần thiết cho nhiều ca đặc biệt",
    color: "#13a8a8",
    bgColor: "#e6fffb",
    gradient: "linear-gradient(135deg, #13a8a8 0%, #36cfc9 100%)",
    medicalInfo: {
      antigens: "B",
      antibodies: "Anti-A",
      rhFactor: "+/- (Có thể dương tính hoặc âm tính)",
      donationFrequency: "Mỗi 8-12 tuần",
      storageTime: "35-42 ngày (ở 2-6°C)",
      uses: [
        "Điều trị ung thư",
        "Phẫu thuật ghép tạng",
        "Bệnh lý máu hiếm",
        "Điều trị bệnh thận",
        "Phẫu thuật não",
      ],
      components: {
        wholeBlood: "Máu toàn phần - ưu tiên cho cấp cứu khẩn cấp",
        redCells: "Hồng cầu - điều trị thiếu máu mãn tính",
        plasma: "Huyết tương - sản xuất thuốc miễn dịch",
        platelets: "Tiểu cầu - điều trị bệnh máu ác tính",
      },
      testingRequired: [
        "HIV",
        "Hepatitis B",
        "Hepatitis C",
        "Syphilis",
        "HTLV",
        "CMV (nếu cần)",
      ],
      preparation: {
        before: "Nghỉ ngơi đầy đủ, không căng thẳng, ăn uống điều độ",
        during: "Quy trình hiến máu an toàn với thiết bị vô trùng",
        after: "Theo dõi sức khỏe, bổ sung dinh dưỡng",
      },
    },
    healthTips: [
      "Tăng cường vitamin B12 và folate từ thực phẩm tự nhiên",
      "Duy trì chế độ ăn cân bằng với đầy đủ protein và vitamin",
      "Tập thể dục đều đặn 30 phút/ngày, 5 ngày/tuần",
      "Kiểm tra chỉ số máu và sức khỏe định kỳ 6 tháng/lần",
      "Hạn chế stress, thực hành thiền định hoặc yoga",
      "Bổ sung omega-3 từ cá và hạt chia",
    ],
    nutritionAdvice: [
      "Thịt đỏ và gan: Nguồn vitamin B12 và sắt dồi dào",
      "Rau xanh đậm: Spinach, cải xoăn giàu folate",
      "Hải sản: Cung cấp kẽm và selen tăng miễn dịch",
      "Hạt và đậu: Protein thực vật và chất xơ",
    ],
    funFacts: [
      "Chỉ chiếm 12% dân số Việt Nam, khá hiếm trên thế giới",
      "Có thể hiến cho nhóm B và AB, rất quý giá",
      "Xuất hiện khoảng 10.000-15.000 năm trước tại vùng núi",
      "Thường có tính cách sáng tạo, linh hoạt và thích khám phá",
      "Có khả năng chống lại một số virus và vi khuẩn",
      "Thường có hệ tiêu hóa mạnh, thích ứng tốt với môi trường",
    ],
    statistics: {
      globalPercentage: "11%",
      asianPercentage: "20-25%",
      donationDemand: "Rất cao - khan hiếm trên toàn cầu",
      emergencyUse: "Cao - cần thiết cho nhiều ca đặc biệt",
    },
  },
  {
    type: "AB",
    percentage: "4%",
    globalPercentage: "4%",
    asiaPercentage: "5-10%",
    population: "Hiếm nhất",
    canDonateTo: ["AB"],
    canReceiveFrom: ["A", "B", "AB", "O"],
    characteristics: [
      "Có cả kháng nguyên A và B",
      "Không có kháng thể",
      "Người nhận máu toàn năng",
    ],
    rareLevel: "Hiếm",
    specialNote: "Người nhận máu toàn năng",
    demandLevel: "Cực kỳ cao - quý giá nhất",
    importance: "Cực kỳ quan trọng - không thể thay thế",
    color: "#08979c",
    bgColor: "#e6f7ff",
    gradient: "linear-gradient(135deg, #08979c 0%, #13c2c2 100%)",
    medicalInfo: {
      antigens: "A và B",
      antibodies: "Không có",
      rhFactor: "+/- (Có thể dương tính hoặc âm tính)",
      donationFrequency: "Mỗi 8-12 tuần",
      storageTime: "35-42 ngày (ở 2-6°C)",
      uses: [
        "Cấp cứu khẩn cấp",
        "Điều trị bệnh hiếm",
        "Nghiên cứu y học",
        "Điều trị bệnh tự miễn",
        "Liệu pháp tế bào gốc",
      ],
      components: {
        wholeBlood: "Hiếm, chỉ dùng trong trường hợp đặc biệt",
        redCells: "Hồng cầu - cho bệnh nhân nhóm AB",
        plasma: "Huyết tương quý giá - tương thích với mọi nhóm",
        platelets: "Tiểu cầu - rất quan trọng cho nhóm AB",
      },
      testingRequired: [
        "HIV",
        "Hepatitis B",
        "Hepatitis C",
        "Syphilis",
        "HTLV",
        "Toàn bộ panel bệnh nhiễm trùng",
      ],
      preparation: {
        before: "Tư vấn kỹ lưỡng, đánh giá sức khỏe toàn diện",
        during: "Giám sát chặt chẽ, quy trình đặc biệt",
        after: "Theo dõi sát sao, chăm sóc đặc biệt",
      },
    },
    healthTips: [
      "Cần chú ý đặc biệt đến sức khỏe vì tính hiếm của nhóm máu",
      "Uống nhiều nước (3-4 lít/ngày) và nghỉ ngơi đầy đủ",
      "Tham khảo bác sĩ chuyên khoa trước khi hiến máu",
      "Theo dõi các chỉ số sức khỏe thường xuyên",
      "Duy trì lối sống lành mạnh, tránh các yếu tố nguy cơ",
      "Tham gia cộng đồng hiến máu để được hỗ trợ",
    ],
    nutritionAdvice: [
      "Đa dạng thực phẩm: Kết hợp ưu điểm của nhóm A và B",
      "Protein chất lượng: Cá, đậu phụ, thịt nạc",
      "Chất chống oxy hóa: Berry, trà xanh, rau màu tối",
      "Bổ sung vitamin tổng hợp theo chỉ định bác sĩ",
    ],
    funFacts: [
      "Hiếm nhất trên thế giới - chỉ 4% dân số Việt Nam",
      'Có thể nhận máu từ tất cả nhóm máu - "Universal Recipient"',
      'Nhóm máu "mới nhất" trong tiến hóa (1.000-1.200 năm)',
      "Thường có khả năng thích ứng cao và tư duy đa chiều",
      "Huyết tương AB+ có thể hiến cho tất cả nhóm máu",
      "Có đặc điểm miễn dịch đặc biệt, chống lại nhiều bệnh",
      "Thường có IQ cao và khả năng sáng tạo xuất sắc",
    ],
    statistics: {
      globalPercentage: "4%",
      asianPercentage: "5-10%",
      donationDemand: "Cực kỳ cao - quý giá nhất",
      emergencyUse: "Cực kỳ quan trọng - không thể thay thế",
    },
  },
  {
    type: "O",
    percentage: "52%",
    globalPercentage: "45%",
    asiaPercentage: "40-50%",
    population: "Phổ biến nhất",
    canDonateTo: ["A", "B", "AB", "O"],
    canReceiveFrom: ["O"],
    characteristics: [
      "Không có kháng nguyên",
      "Có cả kháng thể anti-A và anti-B",
      "Người cho máu toàn năng",
    ],
    rareLevel: "Rất phổ biến",
    specialNote: "Người cho máu toàn năng",
    demandLevel: "Cực kỳ cao - luôn thiếu hụt",
    importance: "Cao nhất - không thể thiếu trong cấp cứu",
    color: "#0958d9",
    bgColor: "#f0f5ff",
    gradient: "linear-gradient(135deg, #0958d9 0%, #1890ff 100%)",
    medicalInfo: {
      antigens: "Không có",
      antibodies: "Anti-A và Anti-B",
      rhFactor: "+/- (Có thể dương tính hoặc âm tính)",
      donationFrequency: "Mỗi 8-12 tuần",
      storageTime: "35-42 ngày (ở 2-6°C)",
      uses: [
        "Cấp cứu khẩn cấp",
        "Phẫu thuật lớn",
        "Truyền máu đại trà",
        "Tai nạn giao thông",
        "Thiên tai, chiến tranh",
      ],
      components: {
        wholeBlood: "Máu toàn phần - ưu tiên số 1 trong cấp cứu",
        redCells: "Hồng cầu - tương thích với mọi nhóm máu",
        plasma: "Huyết tương - chỉ cho nhóm O",
        platelets: "Tiểu cầu - có thể cho tất cả nhóm máu",
      },
      testingRequired: [
        "HIV",
        "Hepatitis B",
        "Hepatitis C",
        "Syphilis",
        "HTLV",
        "Panel bệnh nhiễm trùng đầy đủ",
      ],
      preparation: {
        before: "Chuẩn bị tốt vì là nguồn máu quý giá nhất",
        during: "Quy trình chuẩn với đặc biệt chú ý chất lượng",
        after: "Chăm sóc đặc biệt, khuyến khích hiến máu thường xuyên",
      },
    },
    healthTips: [
      "Duy trì chế độ ăn giàu protein để tái tạo hồng cầu",
      "Tập thể dục thường xuyên để duy trì sức khỏe tim mạch",
      "Kiểm tra sức khỏe định kỳ 3-6 tháng/lần",
      "Hiến máu thường xuyên để giúp đỡ cộng đồng",
      "Bổ sung sắt và vitamin C đầy đủ",
      "Tránh stress, duy trì tinh thần tích cực",
    ],
    nutritionAdvice: [
      "Thịt đỏ: Nguồn sắt heme dễ hấp thu nhất",
      "Rau xanh: Spinach, cải bó xôi giàu sắt thực vật",
      "Vitamin C: Cam, ổi, cà chua tăng hấp thu sắt",
      "Protein đầy đủ: Cá, trứng, đậu để tái tạo máu",
    ],
    funFacts: [
      "Phổ biến nhất - 52% dân số Việt Nam và 45% thế giới",
      'Có thể hiến cho tất cả nhóm máu - "Universal Donor"',
      'Nhóm máu "cổ xưa" nhất, có từ 60.000 năm trước',
      "Thường có sức khỏe tốt, hệ miễn dịch mạnh và năng động",
      'Được gọi là "vàng đỏ" trong y học cấp cứu',
      "Có khả năng chống lại một số bệnh tim mạch",
      "Thường có tính cách lãnh đạo và quyết đoán mạnh mẽ",
    ],
    statistics: {
      globalPercentage: "45%",
      asianPercentage: "40-50%",
      donationDemand: "Cực kỳ cao - luôn thiếu hụt",
      emergencyUse: "Cao nhất - không thể thiếu trong cấp cứu",
    },
  },
];

// Component chính của trang Home
const HomePage = () => {
  // Hooks để điều hướng và lấy thông tin location
  const navigate = useNavigate();
  const location = useLocation();

  // State quản lý trạng thái đăng nhập
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Kiểm tra trạng thái đăng nhập khi component mount
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("userToken");
      const username = localStorage.getItem("username");
      const role = localStorage.getItem("userRole");

      // Cập nhật trạng thái đăng nhập
      setIsAuthenticated(!!(token && username && role));
    };

    checkAuth();

    // Lắng nghe thay đổi localStorage
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  // Hàm xử lý khi người dùng bấm nút hỗ trợ khẩn cấp
  const handleSupportEmergency = (requestId) => {
    // Điều hướng đến trang đăng ký hiến máu với ID yêu cầu khẩn cấp
    navigate(
      `/member/blood-donation-registration?emergencyRequestId=${requestId}`
    );
  };

  // Hàm xử lý navigation với kiểm tra đăng nhập
  const handleNavigation = (path) => {
    // Kiểm tra nếu chưa đăng nhập thì chuyển đến trang login
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // Nếu đã đăng nhập thì điều hướng bình thường
    navigate(path);
  };

  // Hàm lấy vai trò thực tế của người dùng
  // Ưu tiên lấy từ localStorage trước, nếu không có thì từ đường dẫn
  const getActualRole = () => {
    const roleFromStorage = localStorage.getItem("userRole");
    if (roleFromStorage) {
      return roleFromStorage.toLowerCase();
    }
    return getUserRoleFromPath(location.pathname);
  };

  // Lấy vai trò người dùng hiện tại
  const userRole = getActualRole();

  // Log thông tin debug về vai trò người dùng
  console.log("HomePage - Current role:", userRole);
  console.log(
    "HomePage - Role from localStorage:",
    localStorage.getItem("userRole")
  );
  console.log("HomePage - Current path:", location.pathname);

  // State quản lý modal chi tiết nhóm máu
  const [selectedBloodType, setSelectedBloodType] = useState(null); // Nhóm máu được chọn
  const [isModalVisible, setIsModalVisible] = useState(false); // Trạng thái hiển thị modal

  // Hàm hiển thị chi tiết nhóm máu trong modal
  const showBloodTypeDetails = (bloodType) => {
    setSelectedBloodType(bloodType);
    setIsModalVisible(true);
  };

  // Hàm đóng modal chi tiết nhóm máu
  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedBloodType(null);
  };

  // Hàm render nút chính dựa trên vai trò người dùng
  const renderPrimaryButton = () => {
    switch (userRole) {
      case "staff":
        // Nút cho nhân viên - Yêu cầu khẩn cấp
        return (
          <Button
            variant="danger"
            size="lg"
            as={Link}
            to={createRoleBasedPath("/emergency-request", userRole)}
            className="d-flex align-items-center gap-2 px-4 py-3"
          >
            <AlertOutlined style={{ fontSize: "18px" }} />
            Yêu cầu khẩn cấp
          </Button>
        );

      case "admin":
        // Admin chỉ có tìm kiếm nhóm máu, không hiển thị nút chính
        return null;

      default: // guest hoặc member
        // Nút cho khách và thành viên - Đăng ký hiến máu
        return (
          <Button
            variant="primary"
            size="lg"
            onClick={() =>
              handleNavigation(
                createRoleBasedPath("/blood-donation-register", userRole)
              )
            }
            className="d-flex align-items-center gap-2 px-4 py-3"
          >
            <HeartOutlined style={{ fontSize: "18px" }} />
            Đăng ký hiến máu
          </Button>
        );
    }
  };

  // Hàm render phần Call-to-Action dựa trên vai trò người dùng
  const renderCTASection = () => {
    switch (userRole) {
      case "staff":
        // Phần CTA dành cho nhân viên
        return (
          <section className="cta-section bg-white">
            <Container>
              <Row className="justify-content-center text-center">
                <Col lg={8}>
                  <div className="cta-content">
                    <h2 className="cta-title text-danger">
                      Xử lý yêu cầu khẩn cấp?
                    </h2>
                    <p className="cta-description">
                      Truy cập hệ thống để xử lý các yêu cầu hiến máu khẩn cấp
                      một cách nhanh chóng và hiệu quả.
                    </p>
                    <Button
                      variant="danger"
                      size="lg"
                      as={Link}
                      to={createRoleBasedPath("/emergency-request", userRole)}
                      className="cta-button d-flex align-items-center gap-2 mx-auto"
                    >
                      <AlertOutlined style={{ fontSize: "18px" }} />
                      Yêu cầu khẩn cấp
                    </Button>
                  </div>
                </Col>
              </Row>
            </Container>
          </section>
        );

      case "admin":
        // Phần CTA dành cho quản trị viên
        return (
          <section className="cta-section bg-white">
            <Container>
              <Row className="justify-content-center text-center">
                <Col lg={8}>
                  <div className="cta-content">
                    <h2 className="cta-title text-primary">
                      Quản lý hệ thống hiến máu
                    </h2>
                    <p className="cta-description">
                      Truy cập bảng điều khiển quản trị để giám sát và quản lý
                      toàn bộ hệ thống hiến máu.
                    </p>
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={scrollToBloodTypeSection}
                      className="cta-button d-flex align-items-center gap-2 mx-auto"
                    >
                      <SearchOutlined style={{ fontSize: "18px" }} />
                      Tìm kiếm nhóm máu
                    </Button>
                  </div>
                </Col>
              </Row>
            </Container>
          </section>
        );

      default: // guest hoặc member
        // Phần CTA dành cho khách và thành viên
        return (
          <section className="cta-section bg-white">
            <Container>
              <Row className="justify-content-center text-center">
                <Col lg={8}>
                  <div className="cta-content">
                    <h2 className="cta-title text-danger">
                      Sẵn sàng hiến máu?
                    </h2>
                    <p className="cta-description">
                      Đăng ký ngay hôm nay và trở thành một phần của cộng đồng
                      hiến máu cứu người.
                    </p>
                    <Button
                      variant="danger"
                      size="lg"
                      onClick={() =>
                        handleNavigation(
                          createRoleBasedPath(
                            "/blood-donation-register",
                            userRole
                          )
                        )
                      }
                      className="cta-button d-flex align-items-center justify-content-center gap-2 mx-auto"
                    >
                      <HeartOutlined style={{ fontSize: "18px" }} />
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
  // Return JSX - Render giao diện trang chủ
  return (
    <div className="homepage bg-white">
      {/* Phần Hero Banner - Banner chính của trang */}
      <section className="hero-banner-new">
        {/* Container chứa ảnh nền */}
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
                {/* Tiêu đề chính thay đổi theo vai trò người dùng */}
                <h1 className="hero-banner-title-red mb-4">
                  {userRole === "staff"
                    ? "Quản lý hiến máu"
                    : userRole === "admin"
                    ? "Quản trị hệ thống"
                    : "Hiến máu nhân đạo"}
                  <span className="title-highlight-red">
                    {userRole === "staff"
                      ? "Khu vực dành cho nhân viên"
                      : userRole === "admin"
                      ? "Khu vực quản trị viên"
                      : userRole === "member"
                      ? "Khu vực thành viên"
                      : "Phần mềm hỗ trợ hiến máu"}
                  </span>
                </h1>

                {/* Mô tả phụ */}
                <p className="hero-banner-subtitle-red mb-5">
                  Nỗ lực nhỏ của bạn có thể cho người khác cơ hội thứ hai để
                  sống.
                  <br />
                  Hãy gia nhập cộng đồng hiến máu nhân đạo, lan tỏa yêu thương.
                </p>

                {/* Các nút hành động */}
                <div className="hero-banner-buttons-new">
                  {/* Nút đăng ký hiến máu - ẩn với nhân viên */}
                  {userRole !== "staff" && (
                    <Button
                      variant="danger"
                      size="lg"
                      onClick={() =>
                        handleNavigation(
                          createRoleBasedPath(
                            "/blood-donation-register",
                            userRole
                          )
                        )
                      }
                      className="hero-cta-btn-new me-3 mb-3"
                    >
                      <HeartOutlined className="me-2" />
                      Đăng Ký Hiến Máu
                    </Button>
                  )}
                  {/* Nút tìm kiếm nhóm máu - ẩn với nhân viên */}
                  {userRole !== "staff" && (
                    <Button
                      variant="light"
                      size="lg"
                      onClick={scrollToBloodTypeSection}
                      className="hero-cta-btn-new hero-cta-btn-white mb-3"
                      style={{
                        backgroundColor: "white",
                        color: "#dc3545",
                        border: "2px solid white",
                        fontWeight: "600",
                      }}
                    >
                      <SearchOutlined className="me-2" />
                      Tìm Kiếm Nhóm Máu
                    </Button>
                  )}
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
      {/* Phần danh sách yêu cầu khẩn cấp - chỉ hiển thị cho thành viên */}
      {/* Đặt sau hero banner, trước phần thành tựu */}
      {userRole === "member" && (
        <section className="emergency-requests-section py-5 bg-white">
          <Container>
            <Row>
              <Col lg={10} className="mx-auto">
                <h3 className="mb-4 text-danger text-center">
                  Các trường hợp khẩn cấp cần hỗ trợ
                </h3>
                {/* Component hiển thị danh sách yêu cầu khẩn cấp */}
                <EmergencyRequestsList onSupport={handleSupportEmergency} />
              </Col>
            </Row>
          </Container>
        </section>
      )}
      {/* Phần tác động của việc hiến máu - Thành tựu hệ thống */}
      <section className="system-excellence-section py-5 bg-gradient-to-br from-blue-50 to-indigo-100">
        <Container>
          {/* Header của phần */}
          <Row className="text-center mb-5">
            <Col lg={8} className="mx-auto">
              <div className="section-header-excellence">
                {/* Icon chính */}
                <div className="excellence-icon-main mb-3">
                  <HeartOutlined
                    className="main-icon text-primary"
                    style={{ fontSize: "48px" }}
                  />
                </div>
                {/* Tiêu đề chính */}
                <h2 className="excellence-title mb-3">
                  <span
                    style={{
                      color: "#1e40af",
                      WebkitTextFillColor: "#1e40af",
                      fontSize: "2.5rem",
                      fontWeight: "700",
                    }}
                  >
                    Thành Tựu Hiến Máu
                  </span>
                </h2>
                {/* Mô tả phụ */}
                <p className="excellence-subtitle">
                  Những con số ấn tượng và câu chuyện cảm động về tác động tích
                  cực của việc hiến máu đối với cộng đồng
                </p>
              </div>
            </Col>
          </Row>

          {/* Các lĩnh vực tác động chính */}
          <Row className="g-4 mb-5">
            {/* Card 1: Cứu sống mạng người */}
            <Col lg={4} md={6}>
              <Card className="excellence-card h-100 border-0 shadow-lg">
                <Card.Body className="p-4 text-center">
                  <div className="feature-icon-wrapper mb-3">
                    <div className="feature-icon bg-gradient-primary">
                      <TeamOutlined
                        style={{ fontSize: "24px", color: "white" }}
                      />
                    </div>
                  </div>
                  <h4 className="feature-title mb-3">
                    Cứu Sống Hàng Nghìn Mạng Người
                  </h4>
                  <p className="feature-description mb-3">
                    Mỗi năm, chúng tôi đã giúp cứu sống hơn 25,000 người bệnh
                    thông qua việc kết nối người hiến máu với những ai cần giúp
                    đỡ khẩn cấp.
                  </p>
                  <div className="feature-badges">
                    <Badge bg="primary" className="me-2">
                      25,000+ Người được cứu
                    </Badge>
                    <Badge bg="success">100% An toàn</Badge>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Card 2: Hỗ trợ y tế khẩn cấp */}
            <Col lg={4} md={6}>
              <Card className="excellence-card h-100 border-0 shadow-lg">
                <Card.Body className="p-4 text-center">
                  <div className="feature-icon-wrapper mb-3">
                    <div className="feature-icon bg-gradient-success">
                      <MedicineBoxOutlined
                        style={{ fontSize: "24px", color: "white" }}
                      />
                    </div>
                  </div>
                  <h4 className="feature-title mb-3">Hỗ Trợ Y Tế Khẩn Cấp</h4>
                  <p className="feature-description mb-3">
                    Cung cấp máu khẩn cấp cho các ca phẫu thuật lớn, tai nạn
                    giao thông, và điều trị các bệnh lý máu hiếm gặp trong thời
                    gian ngắn nhất.
                  </p>
                  <div className="feature-badges">
                    <Badge bg="warning" className="me-2">
                      24/7 Ứng cứu
                    </Badge>
                    <Badge bg="info">95% Đáp ứng kịp thời</Badge>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Card 3: Cộng đồng tình nguyện */}
            <Col lg={4} md={6}>
              <Card className="excellence-card h-100 border-0 shadow-lg">
                <Card.Body className="p-4 text-center">
                  <div className="feature-icon-wrapper mb-3">
                    <div className="feature-icon bg-gradient-danger">
                      <StarOutlined
                        style={{ fontSize: "24px", color: "white" }}
                      />
                    </div>
                  </div>
                  <h4 className="feature-title mb-3">
                    Cộng Đồng Tình Nguyện Mạnh Mẽ
                  </h4>
                  <p className="feature-description mb-3">
                    Xây dựng cộng đồng hơn 15,000 tình nguyện viên hiến máu
                    thường xuyên, tạo nên mạng lưới sẻ chia yêu thương trên toàn
                    quốc.
                  </p>
                  <div className="feature-badges">
                    <Badge bg="primary" className="me-2">
                      15,000+ Tình nguyện viên
                    </Badge>
                    <Badge bg="success">Tăng 20% mỗi năm</Badge>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Các danh mục tác động */}
          <Row className="mb-5">
            <Col lg={12}>
              <div className="tech-stack-section">
                {/* Header danh mục */}
                <div className="tech-header text-center mb-4">
                  <h3 className="tech-title">
                    <TrophyOutlined className="me-2" />
                    Những Tác Động Tích Cực
                  </h3>
                  <p className="tech-subtitle">
                    Hiến máu không chỉ cứu sống mà còn mang lại hy vọng và sức
                    khỏe cho cộng đồng
                  </p>
                </div>

                {/* Grid các tác động */}
                <Row className="g-3">
                  {/* Cấp cứu khẩn cấp */}
                  <Col lg={3} md={6} sm={6}>
                    <div className="tech-card">
                      <div className="tech-icon">
                        <UserOutlined />
                      </div>
                      <div className="tech-info">
                        <h5>Cấp Cứu Khẩn Cấp</h5>
                        <span>Tai nạn & Phẫu thuật</span>
                      </div>
                    </div>
                  </Col>

                  {/* Điều trị ung thư */}
                  <Col lg={3} md={6} sm={6}>
                    <div className="tech-card">
                      <div className="tech-icon">
                        <HeartOutlined />
                      </div>
                      <div className="tech-info">
                        <h5>Điều Trị Ung Thư</h5>
                        <span>Hỗ trợ hóa trị & xạ trị</span>
                      </div>
                    </div>
                  </Col>

                  {/* Bệnh lý máu */}
                  <Col lg={3} md={6} sm={6}>
                    <div className="tech-card">
                      <div className="tech-icon">
                        <MedicineBoxOutlined />
                      </div>
                      <div className="tech-info">
                        <h5>Bệnh Lý Máu</h5>
                        <span>Thalassemia & Bạch cầu</span>
                      </div>
                    </div>
                  </Col>

                  {/* Sản khoa */}
                  <Col lg={3} md={6} sm={6}>
                    <div className="tech-card">
                      <div className="tech-icon">
                        <CalendarOutlined />
                      </div>
                      <div className="tech-info">
                        <h5>Sản Khoa</h5>
                        <span>An toàn mẹ và bé</span>
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>

          {/* Thống kê thành tựu */}
          <Row className="justify-content-center">
            <Col lg={10}>
              <div className="achievement-section">
                {/* Header thành tựu */}
                <div className="achievement-header text-center mb-4">
                  <TrophyOutlined
                    className="achievement-main-icon"
                    style={{ fontSize: "36px", color: "#ffd700" }}
                  />
                  <h3 className="achievement-title mt-2">Thành Tựu Nổi Bật</h3>
                </div>

                {/* Grid thống kê */}
                <Row className="g-4">
                  {/* Đơn vị máu hiến tặng */}
                  <Col lg={3} md={6}>
                    <div className="achievement-card">
                      <div className="achievement-number">28,750</div>
                      <div className="achievement-label">
                        Đơn vị máu hiến tặng
                      </div>
                      <div className="achievement-icon">
                        <MedicineBoxOutlined />
                      </div>
                    </div>
                  </Col>

                  {/* Người hiến máu tích cực */}
                  <Col lg={3} md={6}>
                    <div className="achievement-card">
                      <div className="achievement-number">15,420</div>
                      <div className="achievement-label">
                        Người hiến máu tích cực
                      </div>
                      <div className="achievement-icon">
                        <HeartOutlined />
                      </div>
                    </div>
                  </Col>

                  {/* Mạng sống được cứu */}
                  <Col lg={3} md={6}>
                    <div className="achievement-card">
                      <div className="achievement-number">25,000+</div>
                      <div className="achievement-label">
                        Mạng sống được cứu
                      </div>
                      <div className="achievement-icon">
                        <TeamOutlined />
                      </div>
                    </div>
                  </Col>

                  {/* Tỷ lệ thành công */}
                  <Col lg={3} md={6}>
                    <div className="achievement-card">
                      <div className="achievement-number">97.8%</div>
                      <div className="achievement-label">Tỷ lệ thành công</div>
                      <div className="achievement-icon">
                        <CheckCircleOutlined />
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
      {/* Phần Benefits Slider - Slider hiển thị lợi ích */}
      <section className="benefits-section-enhanced py-5 bg-white">
        <Container>
          <Row>
            <Col>
              <div className="benefits-slider-wrapper">
                {/* Component slider hiển thị các lợi ích của việc hiến máu */}
                <BenefitsSlider />
              </div>
            </Col>
          </Row>
        </Container>
      </section>
      {/* Phần thông tin nhóm máu - Thiết kế sạch sẽ - ẩn với nhân viên */}
      {userRole !== "staff" && (
        <section
          id="blood-type-section"
          style={{
            padding: "4rem 0",
            background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
          }}
        >
          <Container>
            {/* Header phần nhóm máu */}
            <Row className="text-center mb-4">
              <Col lg={8} className="mx-auto">
                <div style={{ marginBottom: "2rem" }}>
                  {/* Icon chính */}
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "80px",
                      height: "80px",
                      background:
                        "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                      borderRadius: "50%",
                      margin: "0 auto 1rem auto",
                      boxShadow: "0 10px 25px rgba(59, 130, 246, 0.3)",
                    }}
                  >
                    <MedicineBoxOutlined
                      style={{
                        fontSize: "48px",
                        color: "white",
                      }}
                    />
                  </div>
                  {/* Tiêu đề */}
                  <h2
                    style={{
                      color: "#1e40af",
                      fontWeight: "700",
                      fontSize: "2.5rem",
                      marginBottom: "1rem",
                    }}
                  >
                    Thông Tin Nhóm Máu
                  </h2>
                  {/* Mô tả */}
                  <p
                    style={{
                      fontSize: "1.1rem",
                      color: "#475569",
                      lineHeight: "1.6",
                      maxWidth: "600px",
                      margin: "0 auto",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Hiểu rõ về các nhóm máu ABO và khả năng tương thích để hiến
                    máu hiệu quả
                  </p>
                </div>
              </Col>
            </Row>

            {/* Cards hiển thị các nhóm máu */}
            <Row className="g-3 mb-4">
              {bloodTypeData.map((bloodType, index) => (
                <Col lg={6} xl={3} md={6} key={index}>
                  <Card className="blood-type-card-simple h-100 border-0 shadow-sm">
                    <Card.Body className="p-3 text-center">
                      {/* Icon nhóm máu */}
                      <div
                        className="blood-type-icon-simple mb-2"
                        style={{ background: bloodType.gradient }}
                      >
                        <span className="blood-type-letter-simple">
                          {bloodType.type}
                        </span>
                      </div>

                      {/* Tên nhóm máu */}
                      <h5 className="blood-type-name-simple mb-2">
                        Nhóm {bloodType.type}
                      </h5>

                      {/* Tỷ lệ dân số */}
                      <div className="percentage-display mb-2">
                        <span className="percentage-number">
                          {bloodType.percentage}
                        </span>
                        <span className="percentage-label">dân số</span>
                      </div>

                      {/* Nút xem chi tiết */}
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
            </Row>
          </Container>
        </section>
      )}
      {/* Modal chi tiết nhóm máu - ẩn với nhân viên */}
      {userRole !== "staff" && (
        <Modal
          title={null}
          open={isModalVisible}
          onCancel={handleCloseModal}
          footer={null}
          width={700}
          className="blood-type-modal"
          closeIcon={
            <CloseOutlined style={{ fontSize: "16px", color: "#595959" }} />
          }
        >
          {selectedBloodType && (
            <div className="blood-type-detail-content">
              {/* Header của modal */}
              <div
                className="modal-header-gradient mb-4"
                style={{ background: selectedBloodType.gradient }}
              >
                {/* Icon nhóm máu trong modal */}
                <div className="modal-blood-icon">
                  <span className="modal-blood-letter">
                    {selectedBloodType.type}
                  </span>
                </div>
                {/* Tiêu đề modal */}
                <h3 className="modal-blood-title">
                  Nhóm Máu {selectedBloodType.type}
                </h3>
                {/* Tỷ lệ dân số */}
                <div className="modal-percentage">
                  {selectedBloodType.percentage} dân số Việt Nam
                </div>
              </div>

              {/* Nội dung chính của modal */}
              <div className="modal-body-content">
                <Row className="g-4">
                  {/* Thông tin cơ bản */}
                  <Col md={6}>
                    <div className="info-section">
                      <h5 className="info-section-title">
                        <UserOutlined className="me-2" />
                        Thông Tin Cơ Bản
                      </h5>
                      <div className="info-item">
                        <span className="info-label">Tỷ lệ dân số:</span>
                        <span className="info-value">
                          {selectedBloodType.population}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Mức độ hiếm:</span>
                        <span className="info-value">
                          {selectedBloodType.rareLevel}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Đặc điểm:</span>
                        <span className="info-value">
                          {selectedBloodType.specialNote}
                        </span>
                      </div>
                    </div>
                  </Col>

                  {/* Khả năng tương thích */}
                  <Col md={6}>
                    <div className="info-section">
                      <h5 className="info-section-title">
                        <HeartOutlined className="me-2" />
                        Khả Năng Tương Thích
                      </h5>
                      <div className="compatibility-detail">
                        {/* Có thể hiến cho */}
                        <div className="compatibility-group donate-group">
                          <div className="compatibility-group-label">
                            <HeartOutlined className="me-1" />
                            Có thể hiến cho:
                          </div>
                          <div className="blood-tags-modal">
                            {selectedBloodType.canDonateTo.map((type, idx) => (
                              <span
                                key={idx}
                                className="blood-tag-modal donate-tag-modal"
                              >
                                {type}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Có thể nhận từ */}
                        <div className="compatibility-group receive-group">
                          <div className="compatibility-group-label">
                            <MedicineBoxOutlined className="me-1" />
                            Có thể nhận từ:
                          </div>
                          <div className="blood-tags-modal">
                            {selectedBloodType.canReceiveFrom.map(
                              (type, idx) => (
                                <span
                                  key={idx}
                                  className="blood-tag-modal receive-tag-modal"
                                >
                                  {type}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>{" "}
                {/* Thông tin y khoa chi tiết */}
                <div className="medical-info-section mt-4">
                  <h5 className="info-section-title">
                    <ExperimentOutlined className="me-2" />
                    Thông Tin Y Khoa Chi Tiết
                  </h5>
                  <Row className="g-3">
                    <Col md={6}>
                      <div className="medical-card">
                        <div className="medical-item">
                          <strong>Kháng nguyên:</strong>{" "}
                          {selectedBloodType.medicalInfo.antigens}
                        </div>
                        <div className="medical-item">
                          <strong>Kháng thể:</strong>{" "}
                          {selectedBloodType.medicalInfo.antibodies}
                        </div>
                        <div className="medical-item">
                          <strong>Yếu tố Rh:</strong>{" "}
                          {selectedBloodType.medicalInfo.rhFactor}
                        </div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="medical-card">
                        <div className="medical-item">
                          <strong>Tần suất hiến:</strong>{" "}
                          {selectedBloodType.medicalInfo.donationFrequency}
                        </div>
                        <div className="medical-item">
                          <strong>Thời gian bảo quản:</strong>{" "}
                          {selectedBloodType.medicalInfo.storageTime}
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
                {/* Thành phần máu và ứng dụng */}
                <div className="components-section mt-4">
                  <h5 className="info-section-title">
                    <MedicineBoxOutlined className="me-2" />
                    Thành Phần Máu & Ứng Dụng
                  </h5>
                  <Row className="g-3">
                    {/* Map qua các thành phần máu */}
                    {Object.entries(
                      selectedBloodType.medicalInfo.components
                    ).map(([key, value], idx) => (
                      <Col md={6} key={idx}>
                        <div className="component-card">
                          <div className="component-icon">
                            <div className="component-bullet"></div>
                          </div>
                          <div className="component-content">
                            <strong>
                              {key === "wholeBlood"
                                ? "Máu toàn phần"
                                : key === "redCells"
                                ? "Hồng cầu"
                                : key === "plasma"
                                ? "Huyết tương"
                                : "Tiểu cầu"}
                              :
                            </strong>
                            <span className="component-desc">{value}</span>
                          </div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </div>
                {/* Xét nghiệm bắt buộc */}
                <div className="testing-section mt-4">
                  <h5 className="info-section-title">
                    <SafetyCertificateOutlined className="me-2" />
                    Xét Nghiệm Bắt Buộc
                  </h5>
                  <div className="testing-grid">
                    {/* Map qua các xét nghiệm bắt buộc */}
                    {selectedBloodType.medicalInfo.testingRequired.map(
                      (test, idx) => (
                        <div key={idx} className="test-item">
                          <div className="test-icon">
                            <SafetyCertificateOutlined />
                          </div>
                          <span>{test}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
                {/* Ứng dụng y khoa */}
                <div className="uses-section mt-4">
                  <h5 className="info-section-title">
                    <MedicineBoxOutlined className="me-2" />
                    Ứng Dụng Y Khoa
                  </h5>
                  <div className="uses-list">
                    {/* Map qua các ứng dụng y khoa */}
                    {selectedBloodType.medicalInfo.uses.map((use, idx) => (
                      <div key={idx} className="use-item">
                        <div className="use-bullet"></div>
                        <span>{use}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Quy trình chuẩn bị hiến máu */}
                <div className="preparation-section mt-4">
                  <h5 className="info-section-title">
                    <ClockCircleOutlined className="me-2" />
                    Quy Trình Hiến Máu
                  </h5>
                  <Row className="g-3">
                    {/* Trước khi hiến */}
                    <Col md={4}>
                      <div className="prep-card prep-before">
                        <h6 className="prep-title">Trước khi hiến</h6>
                        <p className="prep-content">
                          {selectedBloodType.medicalInfo.preparation.before}
                        </p>
                      </div>
                    </Col>
                    {/* Trong quá trình hiến */}
                    <Col md={4}>
                      <div className="prep-card prep-during">
                        <h6 className="prep-title">Trong quá trình</h6>
                        <p className="prep-content">
                          {selectedBloodType.medicalInfo.preparation.during}
                        </p>
                      </div>
                    </Col>
                    {/* Sau khi hiến */}
                    <Col md={4}>
                      <div className="prep-card prep-after">
                        <h6 className="prep-title">Sau khi hiến</h6>
                        <p className="prep-content">
                          {selectedBloodType.medicalInfo.preparation.after}
                        </p>
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
                {/* Thống kê quan trọng */}
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
                            <span className="stat-value">
                              {selectedBloodType.statistics.globalPercentage}
                            </span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">Tỷ lệ châu Á:</span>
                            <span className="stat-value">
                              {selectedBloodType.statistics.asianPercentage}
                            </span>
                          </div>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="stat-card">
                          <div className="stat-item">
                            <span className="stat-label">
                              Nhu cầu hiến máu:
                            </span>
                            <span className="stat-value">
                              {selectedBloodType.statistics.donationDemand}
                            </span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">Tầm quan trọng:</span>
                            <span className="stat-value">
                              {selectedBloodType.statistics.emergencyUse}
                            </span>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>
                )}
                {/* Đặc điểm sinh học */}
                <div className="characteristics-section mt-4">
                  <h5 className="info-section-title">
                    <StarOutlined className="me-2" />
                    Đặc Điểm Sinh Học
                  </h5>
                  <div className="characteristics-list">
                    {/* Map qua các đặc điểm */}
                    {selectedBloodType.characteristics.map((char, idx) => (
                      <div key={idx} className="characteristic-item">
                        <div className="characteristic-bullet"></div>
                        <span>{char}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Những điều thú vị */}
                <div className="fun-facts-section mt-4">
                  <h5 className="info-section-title">
                    <BulbOutlined className="me-2" />
                    Những Điều Thú Vị
                  </h5>
                  <div className="facts-grid">
                    {/* Map qua các sự thật thú vị */}
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
        </Modal>
      )}
      {/* Phần tiêu chuẩn hiến máu */}
      <section className="donation-standards-section bg-gradient-light mt-5">
        <Container>
          {/* Header phần tiêu chuẩn */}
          <Row className="text-center mb-3">
            <Col lg={10} className="mx-auto">
              <div className="section-header-modern">
                {/* Icon chính */}
                <div className="section-icon-modern mb-2">
                  <SafetyCertificateOutlined className="main-icon" />
                </div>
                {/* Tiêu đề */}
                <h2
                  style={{
                    color: "#1e40af",
                    fontWeight: 700,
                    fontSize: "2.5rem",
                  }}
                  className="mb-2"
                >
                  Tiêu Chuẩn Hiến Máu
                </h2>
                {/* Mô tả */}
                <p
                  className="section-subtitle-modern mb-3"
                  style={{ whiteSpace: "nowrap" }}
                >
                  Đáp ứng các tiêu chuẩn dưới đây để trở thành người hùng cứu
                  người
                </p>
              </div>
            </Col>
          </Row>

          {/* Grid các tiêu chuẩn */}
          <Row className="g-3 mb-4">
            {/* Yêu cầu về độ tuổi */}
            <Col lg={3} md={6}>
              <Card className="standards-card h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-3">
                  {/* Icon wrapper */}
                  <div className="standards-icon-wrapper mb-2">
                    <div className="standards-icon age-gradient">
                      <CalendarOutlined />
                    </div>
                  </div>
                  {/* Tiêu đề card */}
                  <h4 className="standards-card-title mb-2">Độ tuổi</h4>
                  {/* Hiển thị khoảng tuổi */}
                  <div className="standards-range mb-2">
                    <div className="range-display">
                      <span className="range-number">18</span>
                      <span className="range-separator">-</span>
                      <span className="range-number">60</span>
                      <span className="range-unit">tuổi</span>
                    </div>
                  </div>
                  {/* Ghi chú */}
                  <div className="standards-note">
                    <div className="note-icon">
                      <InfoCircleOutlined />
                    </div>
                    <span>Lần đầu hiến máu: tối đa 55 tuổi</span>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Yêu cầu về cân nặng */}
            <Col lg={3} md={6}>
              <Card className="standards-card h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  {/* Icon wrapper */}
                  <div className="standards-icon-wrapper mb-3">
                    <div className="standards-icon weight-gradient">
                      <UserOutlined />
                    </div>
                  </div>
                  {/* Tiêu đề */}
                  <h4 className="standards-card-title mb-3">Cân nặng</h4>
                  {/* Yêu cầu cân nặng theo giới tính */}
                  <div className="weight-requirements mb-3">
                    {/* Nam giới */}
                    <div className="weight-item male-weight">
                      <div className="gender-icon male-icon">
                        <UserOutlined />
                      </div>
                      <div className="weight-info">
                        <span className="gender-label">Nam</span>
                        <span className="weight-value">≥ 45kg</span>
                      </div>
                    </div>
                    {/* Nữ giới */}
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

            {/* Yêu cầu về sức khỏe */}
            <Col lg={3} md={6}>
              <Card className="standards-card h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  {/* Icon wrapper */}
                  <div className="standards-icon-wrapper mb-3">
                    <div className="standards-icon health-gradient">
                      <HeartOutlined />
                    </div>
                  </div>
                  {/* Tiêu đề */}
                  <h4 className="standards-card-title mb-3">Sức khỏe</h4>
                  {/* Danh sách yêu cầu sức khỏe */}
                  <div className="health-requirements mb-3">
                    {/* Không mắc bệnh truyền nhiễm */}
                    <div className="health-item">
                      <div className="check-icon">
                        <SafetyCertificateOutlined />
                      </div>
                      <span>Không mắc bệnh truyền nhiễm</span>
                    </div>
                    {/* Sức khỏe tổng quát tốt */}
                    <div className="health-item">
                      <div className="check-icon">
                        <HeartOutlined />
                      </div>
                      <span>Sức khỏe tổng quát tốt</span>
                    </div>
                    {/* Không dùng thuốc cấm */}
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

            {/* Yêu cầu về tần suất */}
            <Col lg={3} md={6}>
              <Card className="standards-card h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  {/* Icon wrapper */}
                  <div className="standards-icon-wrapper mb-3">
                    <div className="standards-icon frequency-gradient">
                      <ClockCircleOutlined />
                    </div>
                  </div>
                  {/* Tiêu đề */}
                  <h4 className="standards-card-title mb-3">Tần suất</h4>
                  {/* Hiển thị tần suất */}
                  <div className="frequency-display mb-3">
                    <div className="frequency-circle">
                      <span className="frequency-number">12</span>
                      <span className="frequency-unit">tuần</span>
                    </div>
                    <div className="frequency-description">
                      Khoảng cách tối thiểu
                    </div>
                  </div>
                  {/* Ghi chú */}
                  <div className="standards-note">
                    <div className="note-icon">
                      <AlertOutlined />
                    </div>
                    <span>Giữa 2 lần hiến máu</span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

// Export component để sử dụng ở nơi khác
export default HomePage;
