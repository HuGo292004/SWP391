import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert, Spin, Space, Row, Col, message } from 'antd';
import { UserOutlined, LockOutlined, HeartFilled, SafetyCertificateOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/LoginPage.css';

const { Title, Text, Paragraph } = Typography;

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { login } = useAuth();

  // Demo accounts
  const demoAccounts = {
    member: { username: 'member123', password: 'member123', role: 'Member' },
    staff: { username: 'staff123', password: 'staff123', role: 'Staff' },
    admin: { username: 'admin123', password: 'admin123', role: 'Admin' }
  };

  const onFinish = async (values) => {
    setLoading(true);
    setError('');
    
    try {
      // Check demo accounts
      const account = Object.values(demoAccounts).find(
        acc => acc.username === values.username && acc.password === values.password
      );      if (account) {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Store user info
        localStorage.setItem('userToken', 'demo-token');
        localStorage.setItem('userRole', account.role);
        localStorage.setItem('username', account.username);
        
        // Update AuthContext
        login({
          username: account.username,
          role: account.role,
          token: 'demo-token'
        });
        
        // Trigger storage event to update header
        window.dispatchEvent(new Event('storage'));
        
        // Show success message
        message.success({
          content: `Chào mừng ${account.username} đã quay trở lại!`,
          duration: 3,
          style: {
            marginTop: '2vh',
          },
        });

        // Navigate to home after login
        navigate('/');
      } else {
        setError('Tên đăng nhập hoặc mật khẩu không đúng!');
      }
      
    } catch (err) {
      setError('Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
    setError('Vui lòng kiểm tra lại thông tin đăng nhập.');
  };

  const fillDemoAccount = (accountType) => {
    const account = demoAccounts[accountType];
    form.setFieldsValue({
      username: account.username,
      password: account.password
    });
  };

  return (
    <div className="modern-login-container">
      {/* Left Side - Login Form */}
      <div className="login-left-panel">
        <div className="login-form-container">
          <div className="form-header">
            <Title level={2} className="form-title">Đăng nhập</Title>
            <Text className="form-subtitle">Chào mừng bạn trở lại hệ thống BloodDonate</Text>
          </div>

          {/* Quick Access Demo Accounts */}
          <div className="quick-access">
            <Text className="quick-title">Truy cập nhanh:</Text>
            <Space size="small" wrap>
              <Button 
                size="small" 
                onClick={() => fillDemoAccount('member')}
                className="quick-btn member-quick"
              >
                Member
              </Button>
              <Button 
                size="small" 
                onClick={() => fillDemoAccount('staff')}
                className="quick-btn staff-quick"
              >
                Staff
              </Button>
              <Button 
                size="small" 
                onClick={() => fillDemoAccount('admin')}
                className="quick-btn admin-quick"
              >
                Admin
              </Button>
            </Space>
          </div>

          <Form
            name="login"
            form={form}
            className="modern-login-form"
            layout="vertical"
            size="large"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            <Form.Item
              label="Tên đăng nhập"
              name="username"
              rules={[
                { required: true, message: 'Vui lòng nhập tên đăng nhập!' },
                { min: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự!' },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Nhập tên đăng nhập"
                className="modern-input"
              />
            </Form.Item>

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu!' },
                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Nhập mật khẩu"
                className="modern-input"
              />
            </Form.Item>

            {error && (
              <Alert
                message={error}
                type="error"
                showIcon
                className="error-alert"
              />
            )}

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                className="modern-submit-btn"
              >
                {loading ? 'Đang xử lý...' : 'Đăng nhập'}
              </Button>
            </Form.Item>
          </Form>

          <div className="form-footer">
            <div className="footer-register">
              <Text type="secondary" className="footer-note">
                Chưa có tài khoản?{' '}
                <Link to="/register" className="register-link">Đăng ký ngay</Link>
              </Text>
            </div>
            
            <div className="footer-terms">
              <Text type="secondary" className="footer-terms-text">
                Bằng việc đăng nhập, bạn đồng ý với{' '}
                <a href="#terms">Điều khoản sử dụng</a> và{' '}
                <a href="#privacy">Chính sách bảo mật</a>
              </Text>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Branding */}
      <div className="login-right-panel">
        <div className="brand-section">
          <div className="brand-logo">
            <HeartFilled className="brand-heart" />
          </div>
          <Title level={1} className="brand-title">BloodDonate</Title>
          <Paragraph className="brand-subtitle">
            Kết nối yêu thương - Cứu sống hy vọng
          </Paragraph>
          
          <div className="features-list">
            <div className="feature-item">
              <SafetyCertificateOutlined className="feature-icon" />
              <div className="feature-content">
                <div className="feature-title">Bảo mật tuyệt đối</div>
                <div className="feature-description">Thông tin được mã hóa SSL 256-bit</div>
              </div>
            </div>
            <div className="feature-item">
              <ThunderboltOutlined className="feature-icon" />
              <div className="feature-content">
                <div className="feature-title">Xử lý nhanh chóng</div>
                <div className="feature-description">Hệ thống phản hồi trong 0.5 giây</div>
              </div>
            </div>
            <div className="feature-item">
              <HeartFilled className="feature-icon" />
              <div className="feature-content">
                <div className="feature-title">Cứu sống con người</div>
                <div className="feature-description">Mỗi lần hiến máu cứu được 3 người</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="stats-section">
          <Row gutter={24}>
            <Col span={8}>
              <div className="stat-item">
                <div className="stat-number">12,500+</div>
                <div className="stat-label">Người hiến máu</div>
              </div>
            </Col>
            <Col span={8}>
              <div className="stat-item">
                <div className="stat-number">45,000+</div>
                <div className="stat-label">Đơn vị máu</div>
              </div>
            </Col>
            <Col span={8}>
              <div className="stat-item">
                <div className="stat-number">99.9%</div>
                <div className="stat-label">Độ tin cậy</div>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 