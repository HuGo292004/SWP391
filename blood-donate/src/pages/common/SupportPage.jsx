import React from 'react';
import { Typography, Form, Input, Button, Card, Row, Col, Space } from 'antd';
import {
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import '../../styles/SupportPage.css';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const SupportPage = () => {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log('Form values:', values);
    // Xử lý gửi form ở đây
    form.resetFields();
  };

  const contactInfo = [
    {
      icon: <PhoneOutlined />,
      title: "Đường dây nóng",
      content: ["1900 1234", "0123 456 789"],
      iconClass: "phone"
    },
    {
      icon: <MailOutlined />,
      title: "Email",
      content: ["support@blooddonate.com", "info@blooddonate.com"],
      iconClass: "email"
    },
    {
      icon: <EnvironmentOutlined />,
      title: "Địa chỉ",
      content: ["123 Đường ABC, Quận XYZ", "Thành phố Hồ Chí Minh"],
      iconClass: "location"
    },
    {
      icon: <ClockCircleOutlined />,
      title: "Giờ làm việc",
      content: ["Thứ 2 - Thứ 6: 8:00 - 17:00", "Thứ 7: 8:00 - 12:00"],
      iconClass: "clock"
    }
  ];

  return (
    <div className="support-page">
      {/* Header Section */}
      <div className="support-header">
        <div className="support-header-content">
          <h1 className="support-title">
            <MessageOutlined style={{ marginRight: '12px' }} />
            Liên hệ & Hỗ trợ
          </h1>
          <p className="support-subtitle">
            Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7. Hãy liên hệ với chúng tôi nếu bạn cần giúp đỡ.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="support-container">
        <div className="support-main-content">
          {/* Contact Info Cards */}
          <div className="contact-info-grid">
            {contactInfo.map((info, index) => (
              <div key={index} className="contact-info-card">
                <div className={`contact-icon ${info.iconClass}`}>
                  {info.icon}
                </div>
                <h3 className="contact-title">{info.title}</h3>
                <div className="contact-content">
                  {info.content.map((text, idx) => (
                    <span key={idx} className="contact-text">
                      {text}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Contact Form Section */}
          <div className="contact-form-section">
            <Row gutter={24}>
              <Col xs={24} lg={12}>
                <div className="form-header">
                  <h2 className="form-title">Gửi tin nhắn cho chúng tôi</h2>
                  <p className="form-description">
                    Điền vào form bên dưới, chúng tôi sẽ phản hồi trong thời gian sớm nhất
                  </p>
                </div>
                
                <div className="form-content">
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    className="support-form"
                  >
                    <div className="form-row">
                      <Form.Item
                        name="name"
                        label={<span className="form-label">Họ và tên</span>}
                        rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                        className="form-group"
                      >
                        <Input size="large" placeholder="Nhập họ và tên" />
                      </Form.Item>
                      
                      <Form.Item
                        name="email"
                        label={<span className="form-label">Email</span>}
                        rules={[
                          { required: true, message: 'Vui lòng nhập email' },
                          { type: 'email', message: 'Email không hợp lệ' }
                        ]}
                        className="form-group"
                      >
                        <Input size="large" placeholder="Nhập email" />
                      </Form.Item>
                    </div>

                    <Form.Item
                      name="phone"
                      label={<span className="form-label">Số điện thoại</span>}
                      rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                      className="form-group"
                    >
                      <Input size="large" placeholder="Nhập số điện thoại" />
                    </Form.Item>

                    <Form.Item
                      name="subject"
                      label={<span className="form-label">Tiêu đề</span>}
                      rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
                      className="form-group"
                    >
                      <Input size="large" placeholder="Nhập tiêu đề" />
                    </Form.Item>

                    <Form.Item
                      name="message"
                      label={<span className="form-label">Nội dung</span>}
                      rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
                      className="form-group"
                    >
                      <TextArea
                        rows={4}
                        placeholder="Nhập nội dung tin nhắn"
                        size="large"
                      />
                    </Form.Item>

                    <Form.Item>
                      <Button 
                        type="primary" 
                        htmlType="submit" 
                        size="large"
                        className="submit-btn"
                      >
                        Gửi tin nhắn
                      </Button>
                    </Form.Item>
                  </Form>
                </div>
              </Col>

              <Col xs={24} lg={12}>
                <div className="map-container">
                  <div className="map-placeholder">
                    🗺️ Bản đồ Google Maps<br/>
                    <small>Vị trí trung tâm hiến máu</small>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage; 