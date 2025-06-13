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
import '../../styles/BloodDonationRegistration.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
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
  
  const donationCenters = [
    { value: 'center1', label: 'Trung tâm Hiến máu TP.HCM - Quận 1' },
    { value: 'center2', label: 'Trung tâm Hiến máu TP.HCM - Quận 3' },
    { value: 'center3', label: 'Bệnh viện Chợ Rẫy - Quận 5' },
    { value: 'center4', label: 'Bệnh viện Đại học Y Dược - Quận 10' },
    { value: 'center5', label: 'Trung tâm Y tế Quận 7' }
  ];

  const onFinish = async (values) => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Format datetime for appointment
      const appointmentData = {
        ...values,
        appointmentDate: values.appointmentDate?.format('YYYY-MM-DD'),
        appointmentTime: values.appointmentTime?.format('HH:mm'),
        registrationDate: dayjs().format('YYYY-MM-DD HH:mm:ss')
      };
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Blood donation registration data:', appointmentData);
      
      setSuccess('Đăng ký hiến máu thành công! Chúng tôi sẽ liên hệ với bạn để xác nhận lịch hẹn.');
      
      // Reset form after success
      setTimeout(() => {
        form.resetFields();
        setCurrentStep(0);
        navigate('/');
      }, 3000);
      
    } catch (err) {
      setError('Đăng ký hiến máu thất bại. Vui lòng thử lại.');
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
      title: 'Thông tin liên hệ',
      description: 'Xác nhận thông tin cá nhân'
    },
    {
      title: 'Thông tin y tế',
      description: 'Tình trạng sức khỏe'
    },
    {
      title: 'Lịch hẹn',
      description: 'Chọn ngày giờ hiến máu'
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
          <Card title="Xác nhận thông tin liên hệ" className="step-card">
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
                  label="Tuổi"
                  name="age"
                  rules={[
                    { required: true, message: 'Vui lòng nhập tuổi!' },
                    { pattern: /^[0-9]{2}$/, message: 'Tuổi phải từ 18-65!' }
                  ]}
                >
                  <Input
                    placeholder="Nhập tuổi"
                    className="modern-input"
                    suffix="tuổi"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
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
              <Col span={12}>
                <Form.Item
                  label="Cân nặng"
                  name="weight"
                  rules={[
                    { required: true, message: 'Vui lòng nhập cân nặng!' },
                    { pattern: /^[0-9]{2,3}$/, message: 'Cân nặng phải từ 45-150kg!' }
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
              label="Địa chỉ"
              name="address"
              rules={[
                { required: true, message: 'Vui lòng nhập địa chỉ!' },
                { min: 10, message: 'Địa chỉ phải có ít nhất 10 ký tự!' }
              ]}
            >
              <TextArea
                placeholder="Nhập địa chỉ chi tiết"
                rows={3}
                className="modern-input"
              />
            </Form.Item>
          </Card>
        );

      case 1:
        return (
          <Card title="Thông tin y tế và sức khỏe" className="step-card">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Nhóm máu"
                  name="bloodType"
                  rules={[{ required: true, message: 'Vui lòng chọn nhóm máu!' }]}
                >
                  <Select placeholder="Chọn nhóm máu" className="modern-input">
                    {bloodTypes.map(type => (
                      <Option key={type} value={type}>
                        <Tag color="red">{type}</Tag>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Lần hiến máu gần nhất"
                  name="lastDonation"
                >
                  <DatePicker
                    placeholder="Chọn ngày hiến máu gần nhất"
                    className="modern-input"
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Tiền sử bệnh án"
              name="medicalHistory"
            >
              <TextArea
                placeholder="Mô tả tiền sử bệnh án (nếu có)"
                rows={3}
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

            <Divider>Xác nhận tình trạng sức khỏe</Divider>

            <Form.Item
              name="healthConditions"
              valuePropName="checked"
              rules={[
                { 
                  validator: (_, value) => {
                    if (!value || value.length < 4) {
                      return Promise.reject(new Error('Vui lòng xác nhận tất cả các điều kiện sức khỏe!'));
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <Checkbox.Group>
                <Space direction="vertical" size="middle">
                  <Checkbox value="noHeartDisease">
                    <Text>Tôi không mắc bệnh tim mạch trong 6 tháng qua</Text>
                  </Checkbox>
                  <Checkbox value="noInfectiousDisease">
                    <Text>Tôi không mắc bệnh truyền nhiễm (HIV, Viêm gan B/C, Giang mai)</Text>
                  </Checkbox>
                  <Checkbox value="noBloodDisorder">
                    <Text>Tôi không mắc rối loạn máu hoặc thiếu máu</Text>
                  </Checkbox>
                  <Checkbox value="notPregnant">
                    <Text>Tôi không trong thời kỳ mang thai hoặc cho con bú (đối với nữ)</Text>
                  </Checkbox>
                  <Checkbox value="noAlcohol">
                    <Text>Tôi không sử dụng rượu bia trong 24 giờ qua</Text>
                  </Checkbox>
                </Space>
              </Checkbox.Group>
            </Form.Item>
          </Card>
        );

      case 2:
        return (
          <Card title="Chọn lịch hẹn hiến máu" className="step-card">
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="Trung tâm hiến máu"
                  name="donationCenter"
                  rules={[{ required: true, message: 'Vui lòng chọn trung tâm hiến máu!' }]}
                >
                  <Select 
                    placeholder="Chọn trung tâm hiến máu" 
                    className="modern-input"
                    showSearch
                    optionFilterProp="children"
                  >
                    {donationCenters.map(center => (
                      <Option key={center.value} value={center.value}>
                        <Space>
                          <EnvironmentOutlined />
                          {center.label}
                        </Space>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
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
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Giờ hiến máu"
                  name="appointmentTime"
                  rules={[{ required: true, message: 'Vui lòng chọn giờ hiến máu!' }]}
                >
                  <TimePicker
                    placeholder="Chọn giờ hiến máu"
                    className="modern-input"
                    style={{ width: '100%' }}
                    format="HH:mm"
                    minuteStep={30}
                    suffixIcon={<ClockCircleOutlined />}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Loại hiến máu"
              name="donationType"
              rules={[{ required: true, message: 'Vui lòng chọn loại hiến máu!' }]}
            >
              <Radio.Group className="modern-radio-group">
                <Space direction="vertical">
                  <Radio value="whole">
                    <Space direction="vertical" size={0}>
                      <Text strong>Hiến máu toàn phần</Text>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Hiến 350-450ml máu, chu kỳ 3 tháng
                      </Text>
                    </Space>
                  </Radio>
                  <Radio value="plasma">
                    <Space direction="vertical" size={0}>
                      <Text strong>Hiến huyết tương</Text>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Hiến chỉ huyết tương, chu kỳ 2 tuần
                      </Text>
                    </Space>
                  </Radio>
                  <Radio value="platelets">
                    <Space direction="vertical" size={0}>
                      <Text strong>Hiến tiểu cầu</Text>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Hiến tiểu cầu, chu kỳ 2 tuần
                      </Text>
                    </Space>
                  </Radio>
                </Space>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              label="Ghi chú"
              name="notes"
            >
              <TextArea
                placeholder="Ghi chú hoặc yêu cầu đặc biệt (nếu có)"
                rows={3}
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
                icon={index === 0 ? <UserOutlined /> : 
                     index === 1 ? <MedicineBoxOutlined /> : 
                     <CalendarOutlined />}
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