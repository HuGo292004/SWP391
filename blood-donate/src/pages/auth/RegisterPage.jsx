import React, { useState } from 'react';
import { Form, Input, Button, Typography, Alert, Space, Row, Col, Select, DatePicker, Radio, Checkbox, Card, Steps } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, IdcardOutlined, HeartFilled, SafetyCertificateOutlined, ThunderboltOutlined, MedicineBoxOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import '../../styles/RegisterPage.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Step } = Steps;

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const onFinish = async (values) => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Registration data:', values);
      
      setSuccess('Đăng ký tài khoản thành công! Chào mừng bạn đến với cộng đồng hiến máu.');
      
      // Redirect to login after success
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      setError('Đăng ký tài khoản thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
    setError('Vui lòng kiểm tra lại thông tin đăng ký tài khoản.');
  };

  const steps = [
    {
      title: 'Thông tin cơ bản',
      description: 'Tài khoản & liên hệ'
    },
    {
      title: 'Thông tin cá nhân',
      description: 'Chi tiết cá nhân'
    },
    {
      title: 'Thông tin y tế',
      description: 'Lịch sử sức khỏe'
    }
  ];

  const nextStep = () => {
    form.validateFields().then(() => {
      setCurrentStep(currentStep + 1);
    }).catch(() => {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc.');
    });
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    setError('');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Tên đăng nhập"
                  name="username"
                  rules={[
                    { required: true, message: 'Vui lòng nhập tên đăng nhập!' },
                    { min: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự!' },
                    { pattern: /^[a-zA-Z0-9_]+$/, message: 'Chỉ được sử dụng chữ cái, số và dấu gạch dưới!' }
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Nhập tên đăng nhập"
                    className="modern-input"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: 'Vui lòng nhập email!' },
                    { type: 'email', message: 'Email không hợp lệ!' }
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="Nhập địa chỉ email"
                    className="modern-input"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Mật khẩu"
                  name="password"
                  rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu!' },
                    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
                    { pattern: /^(?=.*[A-Za-z])(?=.*\d)/, message: 'Mật khẩu phải chứa ít nhất 1 chữ cái và 1 số!' }
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Nhập mật khẩu"
                    className="modern-input"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Xác nhận mật khẩu"
                  name="confirmPassword"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Xác nhận mật khẩu"
                    className="modern-input"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Số điện thoại"
              name="phone"
              rules={[
                { required: true, message: 'Vui lòng nhập số điện thoại!' },
                { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' }
              ]}
            >
              <Input
                prefix={<PhoneOutlined />}
                placeholder="Nhập số điện thoại"
                className="modern-input"
              />
            </Form.Item>
          </>
        );

      case 1:
        return (
          <>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Họ và tên"
                  name="fullName"
                  rules={[
                    { required: true, message: 'Vui lòng nhập họ và tên!' },
                    { min: 2, message: 'Họ và tên phải có ít nhất 2 ký tự!' }
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Nhập họ và tên đầy đủ"
                    className="modern-input"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Giới tính"
                  name="gender"
                  rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
                >
                  <Radio.Group className="modern-radio-group">
                    <Radio value="male">Nam</Radio>
                    <Radio value="female">Nữ</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Ngày sinh"
                  name="dateOfBirth"
                  rules={[{ required: true, message: 'Vui lòng chọn ngày sinh!' }]}
                >
                  <DatePicker
                    placeholder="Chọn ngày sinh"
                    className="modern-input"
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="CMND/CCCD"
                  name="idNumber"
                  rules={[
                    { required: true, message: 'Vui lòng nhập số CMND/CCCD!' },
                    { pattern: /^[0-9]{9,12}$/, message: 'Số CMND/CCCD không hợp lệ!' }
                  ]}
                >
                  <Input
                    prefix={<IdcardOutlined />}
                    placeholder="Nhập số CMND/CCCD"
                    className="modern-input"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Địa chỉ"
              name="address"
              rules={[
                { required: true, message: 'Vui lòng nhập địa chỉ!' },
                { min: 10, message: 'Địa chỉ phải có ít nhất 10 ký tự!' }
              ]}
            >
              <Input.TextArea
                placeholder="Nhập địa chỉ chi tiết"
                rows={3}
                className="modern-input"
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Tỉnh/Thành phố"
                  name="city"
                  rules={[{ required: true, message: 'Vui lòng chọn tỉnh/thành phố!' }]}
                >
                  <Select placeholder="Chọn tỉnh/thành phố" className="modern-input">
                    <Option value="hanoi">Hà Nội</Option>
                    <Option value="hcm">TP. Hồ Chí Minh</Option>
                    <Option value="danang">Đà Nẵng</Option>
                    <Option value="haiphong">Hải Phòng</Option>
                    <Option value="cantho">Cần Thơ</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Nghề nghiệp"
                  name="occupation"
                  rules={[{ required: true, message: 'Vui lòng nhập nghề nghiệp!' }]}
                >
                  <Input
                    placeholder="Nhập nghề nghiệp"
                    className="modern-input"
                  />
                </Form.Item>
              </Col>
            </Row>
          </>
        );

      case 2:
        return (
          <>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Nhóm máu"
                  name="bloodType"
                  rules={[{ required: true, message: 'Vui lòng chọn nhóm máu!' }]}
                >
                  <Select placeholder="Chọn nhóm máu" className="modern-input">
                    {bloodTypes.map(type => (
                      <Option key={type} value={type}>{type}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Cân nặng (kg)"
                  name="weight"
                  rules={[
                    { required: true, message: 'Vui lòng nhập cân nặng!' },
                    { pattern: /^[0-9]{2,3}$/, message: 'Cân nặng phải từ 10-999kg!' }
                  ]}
                >
                  <Input
                    placeholder="Nhập cân nặng"
                    className="modern-input"
                    suffix="kg"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Tiền sử bệnh án"
              name="medicalHistory"
            >
              <Input.TextArea
                placeholder="Mô tả tiền sử bệnh án (nếu có)"
                rows={3}
                className="modern-input"
              />
            </Form.Item>

            <Form.Item
              label="Thuốc đang sử dụng"
              name="currentMedications"
            >
              <Input.TextArea
                placeholder="Danh sách thuốc đang sử dụng (nếu có)"
                rows={2}
                className="modern-input"
              />
            </Form.Item>

            <Form.Item
              name="conditions"
              valuePropName="checked"
            >
              <Checkbox.Group>
                <Space direction="vertical">
                  <Checkbox value="noHeartDisease">Tôi không mắc bệnh tim mạch</Checkbox>
                  <Checkbox value="noInfectiousDisease">Tôi không mắc bệnh truyền nhiễm</Checkbox>
                  <Checkbox value="noBloodDisorder">Tôi không mắc rối loạn máu</Checkbox>
                  <Checkbox value="notPregnant">Tôi không trong thời kỳ mang thai (đối với nữ)</Checkbox>
                </Space>
              </Checkbox.Group>
            </Form.Item>

            <Form.Item
              name="agreement"
              valuePropName="checked"
              rules={[
                { 
                  validator: (_, value) =>
                    value ? Promise.resolve() : Promise.reject(new Error('Vui lòng đồng ý với điều khoản!'))
                }
              ]}
            >
              <Checkbox>
                Tôi đồng ý với{' '}
                <a href="#terms" target="_blank">Điều khoản sử dụng</a> và{' '}
                <a href="#privacy" target="_blank">Chính sách bảo mật</a>
              </Checkbox>
            </Form.Item>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="modern-register-container">
      {/* Left Side - Registration Form */}
      <div className="register-left-panel">
        <div className="register-form-container">
          <div className="form-header">
            <Title level={2} className="form-title">Đăng ký tài khoản</Title>
            <Text className="form-subtitle">Tạo tài khoản để tham gia cộng đồng hiến máu</Text>
          </div>

          {/* Steps */}
          <div className="steps-container">
            <Steps current={currentStep} size="small">
              {steps.map((step, index) => (
                <Step key={index} title={step.title} description={step.description} />
              ))}
            </Steps>
          </div>

          <Form
            form={form}
            name="register"
            className="modern-register-form"
            layout="vertical"
            size="large"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            {renderStepContent()}

            {(error || success) && (
              <Alert
                message={error || success}
                type={error ? "error" : "success"}
                showIcon
                className="alert-message"
              />
            )}

            <div className="form-actions">
              {currentStep > 0 && (
                <Button onClick={prevStep} className="prev-btn">
                  Quay lại
                </Button>
              )}
              
              {currentStep < steps.length - 1 ? (
                <Button type="primary" onClick={nextStep} className="next-btn">
                  Tiếp theo
                </Button>
              ) : (
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="submit-btn"
                >
                  {loading ? 'Đang xử lý...' : 'Tạo tài khoản'}
                </Button>
              )}
            </div>
          </Form>

          <div className="form-footer">
            <Text type="secondary" className="footer-note">
              Đã có tài khoản?{' '}
              <Link to="/login" className="login-link">Đăng nhập ngay</Link>
            </Text>
          </div>
        </div>
      </div>

      {/* Right Side - Branding */}
      <div className="register-right-panel">
        <div className="brand-section">
          <div className="brand-logo">
            <HeartFilled className="brand-heart" />
          </div>
          <Title level={1} className="brand-title">BloodDonate</Title>
          <Paragraph className="brand-subtitle">
            Mỗi giọt máu - Một sự sống
          </Paragraph>
          
          <div className="features-list">
            <div className="feature-item">
              <SafetyCertificateOutlined className="feature-icon" />
              <div className="feature-content">
                <div className="feature-title">An toàn tuyệt đối</div>
                <div className="feature-description">Quy trình hiến máu đạt chuẩn quốc tế</div>
              </div>
            </div>
            <div className="feature-item">
              <MedicineBoxOutlined className="feature-icon" />
              <div className="feature-content">
                <div className="feature-title">Chăm sóc sức khỏe</div>
                <div className="feature-description">Khám sức khỏe miễn phí trước khi hiến</div>
              </div>
            </div>
            <div className="feature-item">
              <HeartFilled className="feature-icon" />
              <div className="feature-content">
                <div className="feature-title">Cứu sống người khác</div>
                <div className="feature-description">Mỗi lần hiến máu giúp cứu sống 3 người</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="stats-section">
          <Row gutter={24}>
            <Col span={8}>
              <div className="stat-item">
                <div className="stat-number">15,000+</div>
                <div className="stat-label">Người đăng ký</div>
              </div>
            </Col>
            <Col span={8}>
              <div className="stat-item">
                <div className="stat-number">50,000+</div>
                <div className="stat-label">Đơn vị máu</div>
              </div>
            </Col>
            <Col span={8}>
              <div className="stat-item">
                <div className="stat-number">100%</div>
                <div className="stat-label">An toàn</div>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 