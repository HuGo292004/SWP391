import React from 'react';
import { Typography, Card, Collapse, Space } from 'antd';
import { 
  QuestionCircleOutlined, 
  MedicineBoxOutlined,
  HeartOutlined,
  AlertOutlined 
} from '@ant-design/icons';
import { Container, Row, Col } from 'react-bootstrap';

const { Title, Paragraph } = Typography;
const { Panel } = Collapse;

const StaffFAQ = () => {
  const staffFAQs = [
    {
      key: '1',
      question: 'Làm thế nào để xử lý yêu cầu hiến máu khẩn cấp?',
      answer: 'Khi nhận được yêu cầu khẩn cấp, hãy kiểm tra ngay tình trạng kho máu, liên hệ với những người hiến máu phù hợp trong danh sách ưu tiên, và báo cáo cho quản lý ngay lập tức.'
    },
    {
      key: '2',
      question: 'Quy trình kiểm tra sức khỏe người hiến máu như thế nào?',
      answer: 'Bao gồm: đo huyết áp, kiểm tra mạch, cân nặng, xét nghiệm nhanh hemoglobin, và hỏi về tiền sử bệnh án. Tất cả phải đạt tiêu chuẩn trước khi cho phép hiến máu.'
    },
    {
      key: '3',
      question: 'Khi nào cần từ chối người hiến máu?',
      answer: 'Từ chối khi: sức khỏe không đảm bảo, chưa đủ thời gian nghỉ giữa 2 lần hiến, có dấu hiệu bệnh lý, hoặc không đáp ứng tiêu chuẩn an toàn.'
    },
    {
      key: '4',
      question: 'Cách xử lý khi có phản ứng bất lợi sau hiến máu?',
      answer: 'Ngay lập tức: đặt người hiến nằm nghỉ, kiểm tra dấu hiệu sinh tồn, cung cấp nước và thực phẩm nhẹ. Nếu nghiêm trọng, gọi y tế cấp cứu và thông báo bác sĩ.'
    },
    {
      key: '5',
      question: 'Quy trình bảo quản và vận chuyển máu?',
      answer: 'Máu phải được bảo quản ở nhiệt độ 2-6°C, sử dụng hộp bảo quản chuyên dụng khi vận chuyển, và ghi nhận đầy đủ thông tin theo dõi chuỗi lạnh.'
    }
  ];

  return (
    <div style={{ padding: '40px 0', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Container>
        {/* Header */}
        <Row className="mb-5">
          <Col>
            <div className="text-center">
              <Space direction="vertical" size="small">
                <QuestionCircleOutlined style={{ fontSize: '48px', color: '#1976D2' }} />
                <Title level={1} style={{ color: '#1976D2', margin: 0 }}>
                  Hỏi & Đáp Dành Cho Nhân Viên
                </Title>
                <Paragraph style={{ fontSize: '18px', color: '#666', maxWidth: '600px', margin: '0 auto' }}>
                  Tổng hợp các câu hỏi thường gặp và hướng dẫn xử lý trong công việc hiến máu
                </Paragraph>
              </Space>
            </div>
          </Col>
        </Row>

        {/* Quick Stats */}
        <Row className="mb-5">
          <Col md={4} className="mb-3">
            <Card className="text-center" style={{ height: '100%' }}>
              <Space direction="vertical">
                <MedicineBoxOutlined style={{ fontSize: '32px', color: '#52c41a' }} />
                <Title level={3} style={{ margin: 0, color: '#52c41a' }}>25+</Title>
                <Paragraph style={{ margin: 0 }}>Quy trình chuẩn</Paragraph>
              </Space>
            </Card>
          </Col>
          <Col md={4} className="mb-3">
            <Card className="text-center" style={{ height: '100%' }}>
              <Space direction="vertical">
                <HeartOutlined style={{ fontSize: '32px', color: '#f5222d' }} />
                <Title level={3} style={{ margin: 0, color: '#f5222d' }}>100%</Title>
                <Paragraph style={{ margin: 0 }}>An toàn</Paragraph>
              </Space>
            </Card>
          </Col>
          <Col md={4} className="mb-3">
            <Card className="text-center" style={{ height: '100%' }}>
              <Space direction="vertical">
                <AlertOutlined style={{ fontSize: '32px', color: '#fa8c16' }} />
                <Title level={3} style={{ margin: 0, color: '#fa8c16' }}>24/7</Title>
                <Paragraph style={{ margin: 0 }}>Hỗ trợ khẩn cấp</Paragraph>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* FAQ Section */}
        <Row>
          <Col>
            <Card>
              <Title level={2} style={{ textAlign: 'center', marginBottom: '30px', color: '#1976D2' }}>
                Câu Hỏi Thường Gặp
              </Title>
              <Collapse accordion size="large">
                {staffFAQs.map(faq => (
                  <Panel 
                    header={faq.question} 
                    key={faq.key}
                    style={{ fontSize: '16px', fontWeight: '500' }}
                  >
                    <Paragraph style={{ fontSize: '15px', lineHeight: '1.6' }}>
                      {faq.answer}
                    </Paragraph>
                  </Panel>
                ))}
              </Collapse>
            </Card>
          </Col>
        </Row>

        {/* Emergency Contact */}
        <Row className="mt-5">
          <Col>
            <Card style={{ backgroundColor: '#fff2e8', border: '1px solid #ffd591' }}>
              <div className="text-center">
                <Space direction="vertical">
                  <AlertOutlined style={{ fontSize: '32px', color: '#fa8c16' }} />
                  <Title level={3} style={{ color: '#fa8c16', margin: 0 }}>
                    Liên Hệ Khẩn Cấp
                  </Title>
                  <Paragraph style={{ margin: 0, fontSize: '16px' }}>
                    Hotline 24/7: <strong style={{ color: '#fa8c16' }}>1900-1234</strong>
                  </Paragraph>
                  <Paragraph style={{ margin: 0 }}>
                    Email hỗ trợ: <strong>support@blooddonate.vn</strong>
                  </Paragraph>
                </Space>
              </div>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default StaffFAQ;
