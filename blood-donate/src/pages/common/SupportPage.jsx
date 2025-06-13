import React from 'react';
import { Typography, Form, Input, Button, Card, Row, Col, Space } from 'antd';
import {
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  MessageOutlined,
} from '@ant-design/icons';

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
      color: "#1976D2"
    },
    {
      icon: <MailOutlined />,
      title: "Email",
      content: ["support@blooddonate.com", "info@blooddonate.com"],
      color: "#E91E63"
    },
    {
      icon: <EnvironmentOutlined />,
      title: "Địa chỉ",
      content: ["123 Đường ABC, Quận XYZ", "Thành phố Hồ Chí Minh"],
      color: "#2E7D32"
    },
    {
      icon: <ClockCircleOutlined />,
      title: "Giờ làm việc",
      content: ["Thứ 2 - Thứ 6: 8:00 - 17:00", "Thứ 7: 8:00 - 12:00"],
      color: "#F57C00"
    }
  ];

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Title level={1} style={{ color: '#1976D2' }}>
            <MessageOutlined style={{ marginRight: '12px' }} />
            Liên hệ & Hỗ trợ
          </Title>
          <Paragraph style={{ fontSize: '16px', maxWidth: '800px', margin: '0 auto' }}>
            Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7. Hãy liên hệ với chúng tôi nếu bạn cần giúp đỡ.
          </Paragraph>
        </div>

        <Row gutter={[24, 24]}>
          {contactInfo.map((info, index) => (
            <Col xs={24} sm={12} md={6} key={index}>
              <Card
                style={{
                  height: '100%',
                  textAlign: 'center',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}
              >
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div
                    style={{
                      fontSize: '24px',
                      color: info.color,
                      marginBottom: '16px'
                    }}
                  >
                    {info.icon}
                  </div>
                  <Title level={4} style={{ margin: '0 0 8px 0' }}>
                    {info.title}
                  </Title>
                  {info.content.map((text, idx) => (
                    <Text key={idx} style={{ display: 'block', color: '#666' }}>
                      {text}
                    </Text>
                  ))}
                </Space>
              </Card>
            </Col>
          ))}
        </Row>

        <Card
          style={{
            marginTop: '40px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}
        >
          <Row gutter={24}>
            <Col xs={24} lg={12}>
              <div style={{ padding: '20px 0' }}>
                <Title level={3}>Gửi tin nhắn cho chúng tôi</Title>
                <Paragraph type="secondary">
                  Điền vào form bên dưới, chúng tôi sẽ phản hồi trong thời gian sớm nhất
                </Paragraph>

                <Form
                  form={form}
                  layout="vertical"
                  onFinish={onFinish}
                  style={{ marginTop: '24px' }}
                >
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="name"
                        label="Họ và tên"
                        rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                      >
                        <Input size="large" placeholder="Nhập họ và tên" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                          { required: true, message: 'Vui lòng nhập email' },
                          { type: 'email', message: 'Email không hợp lệ' }
                        ]}
                      >
                        <Input size="large" placeholder="Nhập email" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="phone"
                    label="Số điện thoại"
                    rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                  >
                    <Input size="large" placeholder="Nhập số điện thoại" />
                  </Form.Item>

                  <Form.Item
                    name="subject"
                    label="Tiêu đề"
                    rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
                  >
                    <Input size="large" placeholder="Nhập tiêu đề" />
                  </Form.Item>

                  <Form.Item
                    name="message"
                    label="Nội dung"
                    rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
                  >
                    <TextArea
                      rows={4}
                      placeholder="Nhập nội dung tin nhắn"
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button type="primary" htmlType="submit" size="large">
                      Gửi tin nhắn
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            </Col>

            <Col xs={24} lg={12}>
              <div style={{ height: '100%', minHeight: '400px', background: '#f5f5f5', borderRadius: '8px' }}>
                {/* Đây là nơi để nhúng bản đồ Google Maps */}
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#999',
                    fontSize: '14px'
                  }}
                >
                  [Bản đồ Google Maps]
                </div>
              </div>
            </Col>
          </Row>
        </Card>
      </Space>
    </div>
  );
};

export default SupportPage; 