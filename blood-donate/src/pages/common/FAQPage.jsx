import React from 'react';
import { Typography, Collapse, Card, Space } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;
const { Panel } = Collapse;

const FAQPage = () => {
  const faqData = [
    {
      category: "Thông tin cơ bản về hiến máu",
      questions: [
        {
          question: "Ai có thể hiến máu?",
          answer: "Người từ 18-60 tuổi, cân nặng trên 45kg, không mắc các bệnh truyền nhiễm, có sức khỏe tốt đều có thể hiến máu."
        },
        {
          question: "Tôi cần chuẩn bị gì trước khi hiến máu?",
          answer: "Ngủ đủ giấc, ăn nhẹ và uống đủ nước. Không uống rượu bia, không hút thuốc trước khi hiến máu. Mang theo CMND/CCCD."
        },
        {
          question: "Hiến máu có đau không?",
          answer: "Hiến máu chỉ gây đau nhẹ như khi tiêm thông thường. Quy trình được thực hiện bởi nhân viên y tế chuyên nghiệp."
        }
      ]
    },
    {
      category: "Quy trình hiến máu",
      questions: [
        {
          question: "Quy trình hiến máu diễn ra như thế nào?",
          answer: "Quy trình gồm: đăng ký, khám sàng lọc, xét nghiệm nhóm máu, hiến máu, nghỉ ngơi và được phục vụ đồ ăn nhẹ."
        },
        {
          question: "Hiến máu mất bao lâu?",
          answer: "Thời gian hiến máu thực tế chỉ khoảng 7-10 phút. Toàn bộ quy trình có thể mất 30-45 phút."
        },
        {
          question: "Sau khi hiến máu cần lưu ý gì?",
          answer: "Nghỉ ngơi 10-15 phút tại chỗ, uống nhiều nước, tránh vận động mạnh, không hút thuốc trong vài giờ đầu."
        }
      ]
    },
    {
      category: "Lợi ích và an toàn",
      questions: [
        {
          question: "Hiến máu có lợi ích gì?",
          answer: "Hiến máu giúp cơ thể sản sinh tế bào máu mới, giảm nguy cơ bệnh tim mạch, được kiểm tra sức khỏe miễn phí."
        },
        {
          question: "Hiến máu có an toàn không?",
          answer: "Hoàn toàn an toàn. Dụng cụ vô trùng, dùng một lần. Quy trình được giám sát chặt chẽ bởi chuyên gia y tế."
        },
        {
          question: "Sau bao lâu có thể hiến máu lại?",
          answer: "Nam giới có thể hiến máu lại sau 3 tháng, nữ giới sau 4 tháng. Không hiến quá 4 lần/năm với nam và 3 lần/năm với nữ."
        }
      ]
    }
  ];

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Title level={1} style={{ color: '#1976D2' }}>
            <QuestionCircleOutlined style={{ marginRight: '12px' }} />
            Câu hỏi thường gặp
          </Title>
          <Paragraph style={{ fontSize: '16px', maxWidth: '800px', margin: '0 auto' }}>
            Tìm hiểu thông tin chi tiết về hiến máu nhân đạo thông qua các câu hỏi thường gặp dưới đây
          </Paragraph>
        </div>

        {faqData.map((category, index) => (
          <Card 
            key={index}
            title={category.category}
            style={{ 
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}
            headStyle={{ 
              backgroundColor: '#f5f5f5',
              borderTopLeftRadius: '12px',
              borderTopRightRadius: '12px'
            }}
          >
            <Collapse 
              bordered={false}
              defaultActiveKey={['0']}
              expandIconPosition="end"
              style={{ background: 'white' }}
            >
              {category.questions.map((item, qIndex) => (
                <Panel 
                  header={item.question} 
                  key={qIndex}
                  style={{
                    marginBottom: '8px',
                    background: '#fafafa',
                    borderRadius: '8px',
                    border: '1px solid #f0f0f0'
                  }}
                >
                  <Paragraph style={{ margin: 0 }}>
                    {item.answer}
                  </Paragraph>
                </Panel>
              ))}
            </Collapse>
          </Card>
        ))}
      </Space>
    </div>
  );
};

export default FAQPage; 