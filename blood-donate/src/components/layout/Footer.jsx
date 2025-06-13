import React from 'react';
import { Layout, Row, Col, Typography, Space, Divider, Input, Button } from 'antd';
import { 
  HeartOutlined, 
  FacebookOutlined, 
  TwitterOutlined, 
  InstagramOutlined, 
  YoutubeOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  SendOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

const AppFooter = () => {
  return (
    <Footer className="app-footer" style={{ padding: '50px 0 0 0', textAlign: 'left' }}>
      <div className="container">
        <Row gutter={[32, 24]}>
          <Col xs={24} sm={12} md={6}>
            <div style={{ marginBottom: '20px', marginTop: '32px' }}>
              <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
                <HeartOutlined style={{ fontSize: '28px', color: '#E91E63' }} />
                <Title level={3} style={{ color: '#fff', margin: '0' }}>BloodDonate</Title>
              </Link>
            </div>
            <Paragraph style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Hệ thống quản lý hiến máu và tìm kiếm nhóm máu, kết nối người hiến máu với những người cần máu trong trường hợp khẩn cấp.
            </Paragraph>
            <Space size="large">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                <FacebookOutlined style={{ fontSize: '24px', color: '#fff' }} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <TwitterOutlined style={{ fontSize: '24px', color: '#fff' }} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                <InstagramOutlined style={{ fontSize: '24px', color: '#fff' }} />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
                <YoutubeOutlined style={{ fontSize: '24px', color: '#fff' }} />
              </a>
            </Space>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Title level={4} style={{ color: '#fff' }}>Liên kết nhanh</Title>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '10px' }}>
                <Link to="/blood-donation-register" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Đăng ký hiến máu</Link>
              </li>
              <li style={{ marginBottom: '10px' }}>
                <Link to="/search-blood" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Tìm kiếm nhóm máu</Link>
              </li>
              <li style={{ marginBottom: '10px' }}>
                <Link to="/emergency-request" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Yêu cầu khẩn cấp</Link>
              </li>
              <li style={{ marginBottom: '10px' }}>
                <Link to="/donor-guide" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Hướng dẫn hiến máu</Link>
              </li>
              <li style={{ marginBottom: '10px' }}>
                <Link to="/blood-banks" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Ngân hàng máu</Link>
              </li>
            </ul>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Title level={4} style={{ color: '#fff' }}>Thông tin</Title>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '10px' }}>
                <Link to="/about" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Về chúng tôi</Link>
              </li>
              <li style={{ marginBottom: '10px' }}>
                <Link to="/faq" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Câu hỏi thường gặp</Link>
              </li>
              <li style={{ marginBottom: '10px' }}>
                <Link to="/privacy" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Chính sách bảo mật</Link>
              </li>
              <li style={{ marginBottom: '10px' }}>
                <Link to="/terms" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Điều khoản sử dụng</Link>
              </li>
              <li style={{ marginBottom: '10px' }}>
                <Link to="/contact" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Liên hệ</Link>
              </li>
            </ul>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Title level={4} style={{ color: '#fff' }}>Liên hệ</Title>
            <div style={{ marginBottom: '16px' }}>
              <Space>
                <EnvironmentOutlined style={{ color: '#E91E63' }} />
                <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>123 Đường Nguyễn Huệ, Q.1, TP.HCM</Text>
              </Space>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Space>
                <PhoneOutlined style={{ color: '#E91E63' }} />
                <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>+84 123 456 789</Text>
              </Space>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Space>
                <MailOutlined style={{ color: '#E91E63' }} />
                <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>contact@blooddonate.vn</Text>
              </Space>
            </div>
            <Title level={5} style={{ color: '#fff', marginTop: '20px' }}>Đăng ký nhận thông tin</Title>
            <Space.Compact style={{ width: '100%' }}>
              <Input placeholder="Email của bạn" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#fff', borderColor: 'rgba(255, 255, 255, 0.3)' }} />
              <Button type="primary" icon={<SendOutlined />} style={{ backgroundColor: '#E91E63', borderColor: '#E91E63' }} />
            </Space.Compact>
          </Col>
        </Row>
        
        <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.2)', margin: '30px 0 20px' }} />
        
        <div style={{ textAlign: 'center', paddingBottom: '20px' }}>
          <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            &copy; {new Date().getFullYear()} BloodDonate. Tất cả các quyền được bảo lưu.
          </Text>
        </div>
      </div>
    </Footer>
  );
};

export default AppFooter; 
