import React, { useState } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Typography, 
  Alert, 
  Space, 
  Row, 
  Col, 
  Select, 
  DatePicker, 
  Radio, 
  Checkbox, 
  Card, 
  Steps,
  TimePicker,
  Divider,
  Tag
} from 'antd';
import { 
  HeartFilled, 
  CalendarOutlined, 
  ClockCircleOutlined, 
  EnvironmentOutlined,
  SafetyCertificateOutlined,
  MedicineBoxOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { donorApi } from '../../services/donorApi';
import '../../styles/BloodDonationRegistration.css';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { TextArea } = Input;

const BloodDonationRegistration = () => {
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
      // Call API through donorApi service
      const result = await donorApi.registerBloodDonation(values);
      
      console.log('Registration successful:', result);
      setSuccess('Đăng ký hiến máu thành công! Chúng tôi sẽ liên hệ với bạn để xác nhận lịch hẹn.');
      
      // Reset form after success
      setTimeout(() => {
        form.resetFields();
        setCurrentStep(0);
        navigate('/');
      }, 3000);
      
    } catch (err) {
      console.error('Blood donation registration error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
    setError('Vui lòng kiểm tra lại thông tin đăng ký.');
  };

  const steps = [
    {
      title: 'Thông tin cá nhân',
      description: 'Thông tin liên hệ và y tế'
    },
    {
      title: 'Lịch hẹn hiến máu',
      description: 'Chọn ngày giờ và số lượng'
    }
  ];

  const nextStep = () => {
    form.validateFields().then(() => {
      setCurrentStep(currentStep + 1);
      setError('');
    }).catch(() => {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc.');
    });
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    setError('');
  };

  const disabledDate = (current) => {
    // Cannot select dates before today and more than 30 days from now
    return current && (current < dayjs().endOf('day') || current > dayjs().add(30, 'day'));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Card title="Thông tin cá nhân" className="step-card">
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
              </Col>
            </Row>

            <Row gutter={16}>
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
              <Col span={12}>
                <Form.Item
                  label="Ngày sinh"
                  name="dateOfBirth"
                  rules={[
                    { required: true, message: 'Vui lòng chọn ngày sinh!' }
                  ]}
                >
                  <DatePicker
                    placeholder="Chọn ngày sinh"
                    className="modern-input"
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    disabledDate={(current) => {
                      // Cannot select dates after today or before 100 years ago
                      return current && (current > dayjs().endOf('day') || current < dayjs().subtract(100, 'year'));
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Nhóm máu"
                  name="bloodType"
                  rules={[{ required: true, message: 'Vui lòng chọn nhóm máu!' }]}
                >
                  <Select 
                    placeholder="Chọn nhóm máu" 
                    className="modern-input"
                    options={bloodTypes.map(type => ({
                      label: <Tag color="red">{type}</Tag>,
                      value: type
                    }))}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Lần hiến máu gần nhất"
                  name="lastDonation"
                >
                  <DatePicker
                    placeholder="Chọn ngày hiến máu gần nhất (nếu có)"
                    className="modern-input"
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
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
              <TextArea
                placeholder="Nhập địa chỉ chi tiết"
                rows={2}
                className="modern-input"
              />
            </Form.Item>

            <Form.Item
              label="Thuốc đang sử dụng"
              name="currentMedications"
            >
              <TextArea
                placeholder="Danh sách thuốc đang sử dụng (nếu có)"
                rows={2}
                className="modern-input"
              />
            </Form.Item>
          </Card>
        );

      case 1:
        return (
          <Card title="Lịch hẹn hiến máu" className="step-card">
            <Form.Item
              label="Ngày hiến máu"
              name="appointmentDate"
              rules={[{ required: true, message: 'Vui lòng chọn ngày hiến máu!' }]}
            >
              <DatePicker
                placeholder="Chọn ngày hiến máu"
                className="modern-input"
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                disabledDate={disabledDate}
                suffixIcon={<CalendarOutlined />}
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Trạng thái đăng ký"
                  name="status"
                  initialValue="Pending"
                >
                  <Select
                    placeholder="Chọn trạng thái"
                    className="modern-input"
                    options={[
                      { value: 'Pending', label: 'Chờ xử lý' },
                      { value: 'Confirmed', label: 'Đã xác nhận' },
                      { value: 'Completed', label: 'Hoàn thành' },
                      { value: 'Cancelled', label: 'Đã hủy' }
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Số lượng (ml)"
                  name="quantity"
                  rules={[
                    { required: true, message: 'Vui lòng nhập số lượng!' },
                    { pattern: /^[0-9]{2,3}$/, message: 'Số lượng phải từ 250-500ml!' }
                  ]}
                  initialValue="450"
                >
                  <Input
                    placeholder="Nhập số lượng máu hiến"
                    className="modern-input"
                    suffix="ml"
                    type="number"
                    min={250}
                    max={500}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Ghi chú"
              name="notes"
            >
              <TextArea
                placeholder="Ghi chú hoặc yêu cầu đặc biệt (nếu có)"
                rows={2}
                className="modern-input"
              />
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
                <Text>
                  Tôi đồng ý với{' '}
                  <a href="#terms" target="_blank">điều khoản hiến máu</a> và{' '}
                  <a href="#privacy" target="_blank">chính sách bảo mật</a>
                </Text>
              </Checkbox>
            </Form.Item>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="blood-donation-registration-container">
      <div className="registration-header">
        <div className="header-content">
          <HeartFilled className="header-icon" />
          <Title level={2} className="header-title">Đăng ký hiến máu</Title>
          <Paragraph className="header-subtitle">
            Cùng chung tay cứu sống những người cần được giúp đỡ
          </Paragraph>
        </div>
      </div>

      <div className="registration-content">
        <div className="steps-container">
          <Steps current={currentStep} size="default">
            {steps.map((step, index) => (
              <Step 
                key={index} 
                title={step.title} 
                description={step.description}
                icon={index === 0 ? <UserOutlined /> : <CalendarOutlined />}
              />
            ))}
          </Steps>
        </div>

        <Form
          form={form}
          name="bloodDonationRegistration"
          className="blood-donation-form"
          layout="vertical"
          size="large"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <div className="form-content">
            {renderStepContent()}
          </div>

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
              <Button onClick={prevStep} className="prev-btn" size="large">
                Quay lại
              </Button>
            )}
            
            {currentStep < steps.length - 1 ? (
              <Button type="primary" onClick={nextStep} className="next-btn" size="large">
                Tiếp theo
              </Button>
            ) : (
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="submit-btn"
                size="large"
                icon={<HeartFilled />}
              >
                {loading ? 'Đang xử lý...' : 'Đăng ký hiến máu'}
              </Button>
            )}
          </div>
        </Form>
      </div>

      <div className="info-cards">
        <Row gutter={16}>
          <Col span={8}>
            <Card className="info-card">
              <SafetyCertificateOutlined className="info-icon" />
              <Title level={4}>An toàn tuyệt đối</Title>
              <Text>Quy trình hiến máu đạt chuẩn quốc tế, đảm bảo an toàn cho người hiến</Text>
            </Card>
          </Col>
          <Col span={8}>
            <Card className="info-card">
              <MedicineBoxOutlined className="info-icon" />
              <Title level={4}>Khám sức khỏe miễn phí</Title>
              <Text>Được khám sức khỏe tổng quát miễn phí trước khi hiến máu</Text>
            </Card>
          </Col>
          <Col span={8}>
            <Card className="info-card">
              <HeartFilled className="info-icon" />
              <Title level={4}>Cứu sống người khác</Title>
              <Text>Mỗi lần hiến máu có thể cứu sống 3 người cần truyền máu</Text>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default BloodDonationRegistration; 