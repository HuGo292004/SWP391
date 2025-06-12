import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert } from 'react-bootstrap';
import { 
  PhoneOutlined, 
  MailOutlined, 
  MessageOutlined, 
  ClockCircleOutlined,
  UserOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import { Typography } from 'antd';

const { Title } = Typography;

const StaffSupport = () => {
  const [formData, setFormData] = useState({
    subject: '',
    priority: 'normal',
    description: '',
    contactMethod: 'email'
  });
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    console.log('Support request submitted:', formData);
    setShowSuccessAlert(true);
    
    // Reset form
    setFormData({
      subject: '',
      priority: 'normal',
      description: '',
      contactMethod: 'email'
    });

    // Hide success alert after 5 seconds
    setTimeout(() => {
      setShowSuccessAlert(false);
    }, 5000);
  };

  const supportContacts = [
    {
      title: 'Hỗ trợ kỹ thuật',
      phone: '1900-888-111',
      email: 'tech.support@bloodbank.vn',
      hours: '24/7',
      icon: <AlertOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
    },
    {
      title: 'Hỗ trợ y tế',
      phone: '1900-888-222', 
      email: 'medical.support@bloodbank.vn',
      hours: '6:00 - 22:00',
      icon: <UserOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
    },
    {
      title: 'Hỗ trợ chung',
      phone: '1900-888-333',
      email: 'general.support@bloodbank.vn', 
      hours: '8:00 - 17:00',
      icon: <QuestionCircleOutlined style={{ fontSize: '24px', color: '#faad14' }} />
    }
  ];

  const faqItems = [
    {
      question: 'Làm sao để đặt lại mật khẩu tài khoản staff?',
      answer: 'Liên hệ với bộ phận IT qua email tech.support@bloodbank.vn hoặc gọi 1900-888-111. Cung cấp mã số nhân viên và thông tin định danh để được hỗ trợ.'
    },
    {
      question: 'Quy trình xử lý yêu cầu khẩn cấp khi hết giờ làm việc?',
      answer: 'Đối với các trường hợp khẩn cấp ngoài giờ, liên hệ ngay hotline 1900-888-222. Luôn có nhân viên y tế trực để xử lý các tình huống cấp bách.'
    },
    {
      question: 'Cách báo cáo sự cố kỹ thuật trong hệ thống?',
      answer: 'Sử dụng form báo cáo bên dưới hoặc gọi trực tiếp hotline kỹ thuật 1900-888-111. Mô tả chi tiết sự cố và thời gian xảy ra để được hỗ trợ nhanh nhất.'
    },
    {
      question: 'Thời gian phản hồi của bộ phận hỗ trợ?',
      answer: 'Hỗ trợ kỹ thuật: 15-30 phút. Hỗ trợ y tế: 5-15 phút. Hỗ trợ chung: 1-4 giờ làm việc. Các trường hợp khẩn cấp được ưu tiên xử lý ngay lập tức.'
    }
  ];

  return (
    <div className="staff-support-page">
      <Container className="py-5">
        {/* Page Header */}
        <div className="page-header text-center mb-5">
          <Title level={2} style={{ color: '#dc3545', marginBottom: '16px' }}>
            <MessageOutlined className="me-3" />
            Hỗ trợ nhân viên y tế
          </Title>
          <p className="lead text-muted">
            Chúng tôi luôn sẵn sàng hỗ trợ bạn trong quá trình làm việc
          </p>
        </div>

        {/* Success Alert */}
        {showSuccessAlert && (
          <Alert variant="success" className="mb-4 d-flex align-items-center">
            <CheckCircleOutlined className="me-2" style={{ fontSize: '18px' }} />
            Yêu cầu hỗ trợ đã được gửi thành công! Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.
          </Alert>
        )}

        <Row className="g-4">
          {/* Contact Information */}
          <Col lg={4}>
            <Card className="h-100 shadow-sm">
              <Card.Header className="bg-danger text-white">
                <h5 className="mb-0">
                  <PhoneOutlined className="me-2" />
                  Thông tin liên hệ
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="contact-list">
                  {supportContacts.map((contact, index) => (
                    <div key={index} className="contact-item mb-4 pb-3" style={{ borderBottom: index < supportContacts.length - 1 ? '1px solid #eee' : 'none' }}>
                      <div className="d-flex align-items-center mb-2">
                        {contact.icon}
                        <h6 className="mb-0 ms-2">{contact.title}</h6>
                      </div>
                      <div className="contact-details">
                        <div className="d-flex align-items-center mb-1">
                          <PhoneOutlined className="me-2 text-muted" />
                          <span>{contact.phone}</span>
                        </div>
                        <div className="d-flex align-items-center mb-1">
                          <MailOutlined className="me-2 text-muted" />
                          <span className="text-break">{contact.email}</span>
                        </div>
                        <div className="d-flex align-items-center">
                          <ClockCircleOutlined className="me-2 text-muted" />
                          <span>{contact.hours}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Support Request Form */}
          <Col lg={8}>
            <Card className="shadow-sm">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">
                  <MessageOutlined className="me-2" />
                  Gửi yêu cầu hỗ trợ
                </h5>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Chủ đề *</Form.Label>
                        <Form.Select
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Chọn chủ đề</option>
                          <option value="technical">Sự cố kỹ thuật</option>
                          <option value="medical">Hỗ trợ y tế</option>
                          <option value="account">Tài khoản và phân quyền</option>
                          <option value="training">Đào tạo và hướng dẫn</option>
                          <option value="other">Khác</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Mức độ ưu tiên *</Form.Label>
                        <Form.Select
                          name="priority"
                          value={formData.priority}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="low">Thấp</option>
                          <option value="normal">Bình thường</option>
                          <option value="high">Cao</option>
                          <option value="urgent">Khẩn cấp</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Phương thức liên hệ ưu tiên</Form.Label>
                    <Form.Select
                      name="contactMethod"
                      value={formData.contactMethod}
                      onChange={handleInputChange}
                    >
                      <option value="email">Email</option>
                      <option value="phone">Điện thoại</option>
                      <option value="both">Cả hai</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Mô tả chi tiết *</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={6}
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Mô tả chi tiết vấn đề bạn gặp phải, bao gồm thời gian xảy ra, các bước đã thực hiện..."
                      required
                    />
                  </Form.Group>

                  <div className="d-flex gap-2">
                    <Button 
                      type="submit" 
                      variant="primary"
                      className="d-flex align-items-center gap-2"
                    >
                      <MessageOutlined />
                      Gửi yêu cầu
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline-secondary"
                      onClick={() => setFormData({
                        subject: '',
                        priority: 'normal',
                        description: '',
                        contactMethod: 'email'
                      })}
                    >
                      Đặt lại
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* FAQ Section */}
        <Row className="mt-5">
          <Col>
            <Card className="shadow-sm">
              <Card.Header className="bg-warning text-dark">
                <h5 className="mb-0">
                  <QuestionCircleOutlined className="me-2" />
                  Câu hỏi thường gặp
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="faq-list">
                  {faqItems.map((item, index) => (
                    <div key={index} className="faq-item mb-4 pb-3" style={{ borderBottom: index < faqItems.length - 1 ? '1px solid #eee' : 'none' }}>
                      <h6 className="text-primary mb-2">
                        <QuestionCircleOutlined className="me-2" />
                        {item.question}
                      </h6>
                      <p className="text-muted mb-0">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Emergency Contact */}
        <Row className="mt-4">
          <Col>
            <Alert variant="danger" className="d-flex align-items-center">
              <AlertOutlined className="me-2" style={{ fontSize: '20px' }} />
              <div>
                <strong>Trường hợp khẩn cấp:</strong> Gọi ngay hotline <strong>1900-888-222</strong> hoặc <strong>911</strong> nếu cần hỗ trợ y tế khẩn cấp.
              </div>
            </Alert>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default StaffSupport;
