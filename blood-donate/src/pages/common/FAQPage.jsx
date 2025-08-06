// Import React và các component cần thiết
import React from "react";

// Import components từ Ant Design
import { Typography, Collapse, Space } from "antd";

// Import icon từ Ant Design
import { QuestionCircleOutlined } from "@ant-design/icons";

// Import CSS styles
import "../../styles/SupportPage.css";

// Destructure Typography và Collapse components
const { Title, Paragraph } = Typography;
const { Panel } = Collapse;

/**
 * Component trang FAQ (Câu hỏi thường gặp)
 * Hiển thị các câu hỏi và câu trả lời thường gặp về hiến máu
 */
const FAQPage = () => {
  // Dữ liệu FAQ được tổ chức theo danh mục
  const faqData = [
    {
      category: "Thông tin cơ bản về hiến máu",
      questions: [
        {
          question: "Ai có thể hiến máu?",
          answer:
            "Người từ 18-60 tuổi, cân nặng trên 45kg, không mắc các bệnh truyền nhiễm, có sức khỏe tốt đều có thể hiến máu.",
        },
        {
          question: "Tôi cần chuẩn bị gì trước khi hiến máu?",
          answer:
            "Ngủ đủ giấc, ăn nhẹ và uống đủ nước. Không uống rượu bia, không hút thuốc trước khi hiến máu. Mang theo CMND/CCCD.",
        },
        {
          question: "Hiến máu có đau không?",
          answer:
            "Hiến máu chỉ gây đau nhẹ như khi tiêm thông thường. Quy trình được thực hiện bởi nhân viên y tế chuyên nghiệp.",
        },
      ],
    },
    {
      category: "Quy trình hiến máu",
      questions: [
        {
          question: "Quy trình hiến máu diễn ra như thế nào?",
          answer:
            "Quy trình gồm: đăng ký, khám sàng lọc, xét nghiệm nhóm máu, hiến máu, nghỉ ngơi và được phục vụ đồ ăn nhẹ.",
        },
        {
          question: "Hiến máu mất bao lâu?",
          answer:
            "Thời gian hiến máu thực tế chỉ khoảng 7-10 phút. Toàn bộ quy trình có thể mất 30-45 phút.",
        },
        {
          question: "Sau khi hiến máu cần lưu ý gì?",
          answer:
            "Nghỉ ngơi 10-15 phút tại chỗ, uống nhiều nước, tránh vận động mạnh, không hút thuốc trong vài giờ đầu.",
        },
      ],
    },
    {
      category: "Lợi ích và an toàn",
      questions: [
        {
          question: "Hiến máu có lợi ích gì?",
          answer:
            "Hiến máu giúp cơ thể sản sinh tế bào máu mới, giảm nguy cơ bệnh tim mạch, được kiểm tra sức khỏe miễn phí.",
        },
        {
          question: "Hiến máu có an toàn không?",
          answer:
            "Hoàn toàn an toàn. Dụng cụ vô trùng, dùng một lần. Quy trình được giám sát chặt chẽ bởi chuyên gia y tế.",
        },
        {
          question: "Sau bao lâu có thể hiến máu lại?",
          answer:
            "Nam giới có thể hiến máu lại sau 3 tháng, nữ giới sau 4 tháng. Không hiến quá 4 lần/năm với nam và 3 lần/năm với nữ.",
        },
      ],
    },
  ];

  return (
    <div className="support-page">
      {/* Header Section */}
      <div className="support-header">
        <div className="support-header-content">
          <Title
            level={1}
            className="support-title"
            style={{
              color: "white",
              fontSize: "3.5rem",
              fontWeight: 800,
              fontFamily: "'Poppins', sans-serif",
              margin: "0 0 1rem 0",
              textShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              letterSpacing: "-0.02em",
            }}
          >
            <QuestionCircleOutlined
              style={{ marginRight: "1rem", color: "white", fontSize: "3rem" }}
            />
            Câu hỏi thường gặp
          </Title>
          <Paragraph
            className="support-subtitle"
            style={{
              color: "white",
              fontSize: "1.3rem",
              fontWeight: 400,
              opacity: 0.95,
              margin: "0 auto",
              lineHeight: 1.6,
              maxWidth: "600px",
            }}
          >
            Tìm hiểu thông tin chi tiết về hiến máu nhân đạo thông qua các câu
            hỏi thường gặp dưới đây
          </Paragraph>
        </div>
      </div>

      {/* Main Content */}
      <div className="support-container">
        <div className="support-main-content">
          <div
            style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}
          >
            {faqData.map((category, index) => (
              <div
                key={index}
                style={{
                  borderBottom:
                    index < faqData.length - 1
                      ? "1px solid rgba(25, 118, 210, 0.1)"
                      : "none",
                  paddingBottom: index < faqData.length - 1 ? "2.5rem" : "0",
                  marginBottom: index < faqData.length - 1 ? "2.5rem" : "0",
                }}
              >
                <div
                  style={{
                    marginBottom: "1.5rem",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: "4px",
                      background:
                        "linear-gradient(135deg, #1976D2 0%, #42A5F5 100%)",
                      borderRadius: "2px",
                    }}
                  ></div>
                  <h2
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: "1.5rem",
                      fontWeight: 600,
                      color: "#1976D2",
                      margin: "0 0 0 1.5rem",
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    {category.category}
                  </h2>
                </div>
                <div style={{ marginLeft: "1.5rem" }}>
                  <Collapse
                    bordered={false}
                    defaultActiveKey={["0"]}
                    expandIconPosition="end"
                    style={{ background: "transparent" }}
                  >
                    {category.questions.map((item, qIndex) => (
                      <Panel
                        header={
                          <span
                            style={{
                              fontFamily: "'Poppins', sans-serif",
                              fontSize: "1.1rem",
                              fontWeight: 600,
                              color: "#263238",
                              lineHeight: "1.5",
                            }}
                          >
                            {item.question}
                          </span>
                        }
                        key={qIndex}
                        style={{
                          marginBottom: "1rem",
                          background: "rgba(255, 255, 255, 0.8)",
                          backdropFilter: "blur(10px)",
                          border: "1px solid rgba(25, 118, 210, 0.1)",
                          borderRadius: "16px",
                          overflow: "hidden",
                          transition: "all 0.3s ease",
                        }}
                      >
                        <Paragraph
                          style={{
                            fontSize: "1rem",
                            lineHeight: "1.7",
                            color: "#455A64",
                            margin: 0,
                            textAlign: "justify",
                          }}
                        >
                          {item.answer}
                        </Paragraph>
                      </Panel>
                    ))}
                  </Collapse>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
