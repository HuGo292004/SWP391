/*
 * Blood Donation Registration Page
 * 
 * RECENT FIX: Updated bloodTypeID values to match actual database (July 3, 2025)
 * - Fixed bloodTypeID mismatch that was causing 500 errors during donor profile creation
 * - Updated IDs like 44C1ADF7 -> 44C1A0F7, 55B618E3-250E -> 55B618E3-25CE, etc.
 * 
 * Data Architecture:
 * - User personal information (name, email, phone, DOB, address) is stored in the User table
 * - Donor profile (donorId, userId, bloodTypeId, isAvailable) is stored in the Donor table  
 * - Blood donation records (donationDate, notes, status) are stored in the BloodDonation table linked to the donor profile
 * - Medical history ("Tiền sử bệnh lý và thuốc đang sử dụng") is stored in BloodDonation.notes
 * 
 * Process:
 * 1. Fetch user info from User API for display in confirmation step
 * 2. Submit blood donation registration to BloodDonation table (donationDate, notes, status)
 * 3. After successful registration, create/update Donor profile with bloodTypeId only
 * 4. Medical history is stored in BloodDonation.notes, not in Donor table
 * 
 * Important: "Tiền sử bệnh lý và thuốc đang sử dụng" field maps to BloodDonation.notes
 * Note: Personal info stays in User table (optimal design - no duplication needed).
 * Frontend fetches personal info via User API and donor-specific info via Donor API.
 */

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
import { UserAPI } from '../../services/userApi';
import '../../styles/BloodDonationRegistration.css';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { TextArea } = Input;

const BloodDonationRegistration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [userInfo, setUserInfo] = useState(null);
  const [loadingUserInfo, setLoadingUserInfo] = useState(false);
  const [agreement, setAgreement] = useState(false);
  const [formData, setFormData] = useState({}); // Store form data between steps
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Blood types from database - updated with correct IDs from actual database
  const bloodTypes = [
    { bloodTypeID: '44C1A0F7-92B9-4E1B-A628-03447F5B86D7', aboType: 'O', rhFactor: '+', description: 'Nhóm máu O Rh dương' },
    { bloodTypeID: '55B618E3-25CE-45D8-B980-03D532EC2293', aboType: 'B', rhFactor: '-', description: 'Nhóm máu B Rh âm' },
    { bloodTypeID: '11111111-1111-1111-1111-111111111001', aboType: 'A', rhFactor: '+', description: 'Nhóm máu A Rh dương' },
    { bloodTypeID: '11111111-1111-1111-1111-111111111002', aboType: 'A', rhFactor: '-', description: 'Nhóm máu A Rh âm' },
    { bloodTypeID: '11111111-1111-1111-1111-111111111003', aboType: 'B', rhFactor: '+', description: 'Nhóm máu B Rh dương' },
    { bloodTypeID: '11111111-1111-1111-1111-111111111004', aboType: 'B', rhFactor: '-', description: 'Nhóm máu B Rh âm' },
    { bloodTypeID: '11111111-1111-1111-1111-111111111005', aboType: 'AB', rhFactor: '+', description: 'Nhóm máu AB Rh dương' },
    { bloodTypeID: '11111111-1111-1111-1111-111111111006', aboType: 'AB', rhFactor: '-', description: 'Nhóm máu AB Rh âm' },
    { bloodTypeID: '11111111-1111-1111-1111-111111111007', aboType: 'O', rhFactor: '+', description: 'Nhóm máu O Rh dương' },
    { bloodTypeID: '11111111-1111-1111-1111-111111111008', aboType: 'O', rhFactor: '-', description: 'Nhóm máu O Rh âm' },
    { bloodTypeID: 'FE6B963D-65ED-4681-96FF-213E2B9D7E9B', aboType: 'O', rhFactor: '-', description: 'Nhóm máu O Rh âm' },
    { bloodTypeID: 'B0B93608-6EA7-4F3E-8B2A-37B66BF0CC82', aboType: 'A', rhFactor: '+', description: 'Nhóm máu A Rh dương' },
    { bloodTypeID: 'C07C228E-DA24-4DD8-B2B5-64CE22B674A3', aboType: 'B', rhFactor: '+', description: 'Nhóm máu B Rh dương' },
    { bloodTypeID: '5060875F-D7D5-40FD-8FCD-75F843A71A32', aboType: 'AB', rhFactor: '-', description: 'Nhóm máu AB Rh âm' },
    { bloodTypeID: 'A12373C7-3BFC-496E-8021-C0031B9BC0D8', aboType: 'A', rhFactor: '-', description: 'Nhóm máu A Rh âm' },
    { bloodTypeID: '5AE0C996-2594-48D2-8023-FD80676E4BCC', aboType: 'AB', rhFactor: '+', description: 'Nhóm máu AB Rh dương' }
  ];

  // Fetch current user information
  const fetchUserInfo = async () => {
    setLoadingUserInfo(true);
    try {
      const userResponse = await UserAPI.getCurrentUser();
      setUserInfo(userResponse.data || userResponse);
      
    } catch (error) {
      setError('Không thể tải thông tin người dùng. Vui lòng thử lại.');
    } finally {
      setLoadingUserInfo(false);
    }
  };

  // Helper function to validate blood type ID
  const isValidBloodTypeID = (bloodTypeID) => {
    if (!bloodTypeID || bloodTypeID === 'unknown' || bloodTypeID === 'undefined') {
      return false;
    }
    // Check if the bloodTypeID exists in our bloodTypes array
    return bloodTypes.some(type => type.bloodTypeID === bloodTypeID);
  };

  const onFinish = async (values) => {
    // Only proceed with submission if we're on the final step and user clicked submit
    if (currentStep !== steps.length - 1) {
      return;
    }

    // Check agreement before submitting
    if (!agreement) {
      setError('Vui lòng đồng ý với điều khoản trước khi đăng ký.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Get current form values first, then merge with stored data
      const currentFormValues = form.getFieldsValue();
      const formValues = { ...formData, ...currentFormValues };
      
      // Validate required fields
      if (!formValues.donationDate) {
        setError('Vui lòng chọn ngày hiến máu!');
        return;
      }
      
      if (!isValidBloodTypeID(formValues.bloodTypeID)) {
        setError('Vui lòng chọn nhóm máu hợp lệ!');
        return;
      }

      if (!formValues.notes) {
        setError('Vui lòng điền thông tin tiền sử bệnh lý và thuốc đang sử dụng!');
        return;
      }
      
      const donationData = {
        donorID: null, // Let backend set this based on authenticated user
        requestID: formValues.requestID || null,
        donationDate: formValues.donationDate ? formValues.donationDate.format('YYYY-MM-DD') : null,
        bloodTypeID: formValues.bloodTypeID || null, // Ensure this is not undefined
        status: 'Pending',
        notes: formValues.notes || '',
        certificateID: null
      };
      
      // Separate data for updating donor profile (only bloodTypeID, no medications in Donor table)
      const donorUpdateData = {
        bloodTypeID: formValues.bloodTypeID || null,
        isAvailable: true
      };
      
      // Step 1: Call API to register blood donation
      const result = await donorApi.registerBloodDonation(donationData);
      
      // Show success message
      let successMessage = 'Đăng ký hiến máu thành công! Chúng tôi sẽ liên hệ với bạn để xác nhận lịch hẹn.';
      
      // Check if we have additional info about donor profile
      if (result && result.donorProfileInfo) {
        const { action, error, errorDetails } = result.donorProfileInfo;
        if (action === 'created') {
          successMessage += ' Hồ sơ hiến máu của bạn đã được tạo mới.';
        } else if (action === 'updated') {
          successMessage += ' Hồ sơ hiến máu của bạn đã được cập nhật với nhóm máu mới.';
        } else if (action === 'failed_creation') {
          successMessage += ' Tuy nhiên, có lỗi khi tạo hồ sơ hiến máu. Vui lòng liên hệ hỗ trợ để cập nhật thông tin nhóm máu.';
          
          // Show a separate warning alert
          setTimeout(() => {
            setError(`Cảnh báo: Không thể tạo hồ sơ hiến máu. Chi tiết lỗi: ${errorDetails || error}`);
          }, 3000);
        }
      }
      
      setSuccess(successMessage);
      
      // Clear any cached profile data to force refresh
      const keysToRemove = [
        'cachedUserProfile',
        'cachedDonorProfile', 
        'profileCache',
        'userProfileCache',
        'donorProfileCache'
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      // Dispatch a custom event to notify Profile component to refresh
      const profileRefreshEvent = new CustomEvent('profileDataChanged', {
        detail: { 
          reason: 'blood_donation_registration',
          newDonorProfile: true,
          bloodTypeUpdated: true
        }
      });
      window.dispatchEvent(profileRefreshEvent);
      
      // Reset form after success
      setTimeout(() => {
        form.resetFields();
        setFormData({});
        setCurrentStep(0);
        setAgreement(false);
        navigate('/');
      }, 4000);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    setError('Vui lòng kiểm tra lại thông tin đăng ký.');
  };

  const steps = [
    {
      title: 'Thông tin hiến máu',
      description: 'Ngày hiến máu và nhóm máu'
    },
    {
      title: 'Xác nhận đăng ký',
      description: 'Kiểm tra thông tin và hoàn tất'
    }
  ];

  const nextStep = () => {
    const fieldsToValidate = currentStep === 0 
      ? ['donationDate', 'bloodTypeID', 'notes'] 
      : [];
      
    form.validateFields(fieldsToValidate).then((values) => {
      // Get all form values, including optional ones like notes and requestID
      const allFormValues = form.getFieldsValue();
      
      // Additional validation for bloodTypeID
      const bloodTypeIDToValidate = values.bloodTypeID || allFormValues.bloodTypeID;
      if (currentStep === 0 && !isValidBloodTypeID(bloodTypeIDToValidate)) {
        setError('Vui lòng chọn nhóm máu hợp lệ!');
        return;
      }
      
      // Store form data - merge with existing data
      const newFormData = { 
        ...formData, 
        ...values,
        ...allFormValues // This ensures we capture all fields including optional ones
      };
      
      setFormData(newFormData);
      
      if (currentStep === 0) {
        // When moving to confirmation step, fetch user info
        fetchUserInfo();
      }
      setCurrentStep(currentStep + 1);
      setError('');
    }).catch((error) => {
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
          <Card title="Thông tin hiến máu" className="step-card">
            <Form.Item
              label="Ngày hiến máu mong muốn"
              name="donationDate"
              rules={[{ required: true, message: 'Vui lòng chọn ngày hiến máu mong muốn!' }]}
            >
              <DatePicker
                placeholder="Chọn ngày hiến máu mong muốn"
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
                  label="Nhóm máu"
                  name="bloodTypeID"
                  rules={[
                    { required: true, message: 'Vui lòng chọn nhóm máu!' },
                    { 
                      validator: (_, value) => {
                        if (!isValidBloodTypeID(value)) {
                          return Promise.reject(new Error('Vui lòng chọn nhóm máu hợp lệ!'));
                        }
                        return Promise.resolve();
                      }
                    }
                  ]}
                >
                  <Select
                    placeholder="Chọn nhóm máu của bạn"
                    className="modern-input"
                    showSearch
                    filterOption={(input, option) =>
                      option?.label?.toLowerCase().includes(input.toLowerCase())
                    }
                    options={bloodTypes.map(type => ({
                      label: (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Tag color="red" style={{ margin: 0 }}>
                            {type.aboType}{type.rhFactor}
                          </Tag>
                          <span style={{ fontSize: '12px', color: '#666' }}>
                            {type.description}
                          </span>
                        </div>
                      ),
                      value: type.bloodTypeID,
                      searchText: `${type.aboType}${type.rhFactor} ${type.description}`
                    }))}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Mã hỗ trợ khẩn cấp (nếu có)"
                  name="requestID"
                  tooltip="Nếu bạn hiến máu để đáp ứng yêu cầu khẩn cấp, hãy nhập mã yêu cầu"
                >
                  <Input
                    placeholder="Nhập mã hỗ trợ khẩn cấp (tùy chọn)"
                    className="modern-input"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Tiền sử bệnh lý và thuốc đang sử dụng"
              name="notes"
              rules={[{ required: true, message: 'Vui lòng điền thông tin tiền sử bệnh lý và thuốc đang sử dụng!' }]}
            >
              <TextArea
                placeholder="Vui lòng mô tả tiền sử bệnh lý (nếu có) và các loại thuốc đang sử dụng. Nếu không có, hãy ghi 'Không có'."
                rows={4}
                className="modern-input"
              />
            </Form.Item>
          </Card>
        );

      case 1:
        return (
          <Card title="Xác nhận thông tin đăng ký" className="step-card">
            <div className="confirmation-content">
              {loadingUserInfo ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Text>Đang tải thông tin cá nhân...</Text>
                </div>
              ) : (
                <>
                  <Divider orientation="left">Thông tin cá nhân</Divider>
                  
                  {userInfo ? (
                    <Row gutter={[16, 16]}>
                      <Col span={12}>
                        <div className="confirm-item">
                          <Text strong>Họ và tên:</Text>
                          <br />
                          <Text>{userInfo.fullName || 'Chưa cập nhật'}</Text>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div className="confirm-item">
                          <Text strong>Tên đăng nhập:</Text>
                          <br />
                          <Text>{userInfo.username || 'Chưa cập nhật'}</Text>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div className="confirm-item">
                          <Text strong>Email:</Text>
                          <br />
                          <Text>{userInfo.email || 'Chưa cập nhật'}</Text>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div className="confirm-item">
                          <Text strong>Số điện thoại:</Text>
                          <br />
                          <Text>{userInfo.phone || 'Chưa cập nhật'}</Text>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div className="confirm-item">
                          <Text strong>Số CMND/CCCD:</Text>
                          <br />
                          <Text>{userInfo.userIdCard || 'Chưa cập nhật'}</Text>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div className="confirm-item">
                          <Text strong>Ngày sinh:</Text>
                          <br />
                          <Text>
                            {userInfo.dateOfBirth 
                              ? dayjs(userInfo.dateOfBirth).format('DD/MM/YYYY')
                              : 'Chưa cập nhật'
                            }
                          </Text>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div className="confirm-item">
                          <Text strong>Vai trò:</Text>
                          <br />
                          <Tag color="blue">
                            {userInfo.role === 'Member' ? 'Thành viên' : 
                             userInfo.role === 'Staff' ? 'Nhân viên' :
                             userInfo.role === 'Admin' ? 'Quản trị viên' :
                             userInfo.role || 'Chưa xác định'}
                          </Tag>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div className="confirm-item">
                          <Text strong>Mã người dùng:</Text>
                          <br />
                          <Text style={{ fontSize: '12px', color: '#666' }}>
                            {userInfo.userId || 'Chưa có'}
                          </Text>
                        </div>
                      </Col>
                    </Row>
                  ) : (
                    <Alert
                      message="Không thể tải thông tin cá nhân"
                      description="Vui lòng kiểm tra kết nối và thử lại."
                      type="warning"
                      showIcon
                    />
                  )}

                  <Divider orientation="left">Thông tin hiến máu</Divider>
                  
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <div className="confirm-item">
                        <Text strong>Ngày hiến máu mong muốn:</Text>
                        <br />
                        <Text>
                          {formData.donationDate 
                            ? formData.donationDate.format('DD/MM/YYYY')
                            : 'Chưa chọn'
                          }
                        </Text>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div className="confirm-item">
                        <Text strong>Nhóm máu:</Text>
                        <br />
                        <Text>
                          {(() => {
                            const selectedBloodTypeID = formData.bloodTypeID;
                            const selectedBloodType = bloodTypes.find(type => type.bloodTypeID === selectedBloodTypeID);
                            return selectedBloodType ? (
                              <Tag color="red">
                                {selectedBloodType.aboType}{selectedBloodType.rhFactor}
                              </Tag>
                            ) : 'Chưa chọn';
                          })()}
                        </Text>
                      </div>
                    </Col>
                  </Row>

                  <Row gutter={[16, 16]}>
                    <Col span={24}>
                      <div className="confirm-item">
                        <Text strong>Tiền sử bệnh lý và thuốc đang sử dụng:</Text>
                        <br />
                        <Text>{formData.notes || 'Chưa điền'}</Text>
                      </div>
                    </Col>
                  </Row>

                  {formData.requestID && (
                    <Row gutter={[16, 16]}>
                      <Col span={24}>
                        <div className="confirm-item">
                          <Text strong>Mã hỗ trợ khẩn cấp:</Text>
                          <br />
                          <Text>{formData.requestID}</Text>
                        </div>
                      </Col>
                    </Row>
                  )}

                  <Divider />

                  <div style={{ marginBottom: '16px' }}>
                    <Checkbox 
                      checked={agreement}
                      onChange={(e) => setAgreement(e.target.checked)}
                    >
                      <Text>
                        Tôi đồng ý với{' '}
                        <a href="#terms" target="_blank">điều khoản hiến máu</a> và{' '}
                        <a href="#privacy" target="_blank">chính sách bảo mật</a>
                      </Text>
                    </Checkbox>
                  </div>

                  <Alert
                    message="Lưu ý quan trọng"
                    description="Sau khi đăng ký thành công, bạn sẽ nhận được thông báo xác nhận qua email/SMS. Vui lòng đến đúng thời gian đã đăng ký và mang theo CMND/CCCD."
                    type="info"
                    showIcon
                  />

                  {/* Temporarily hidden until donor profile endpoints are ready */}
                  {/* {userInfo && !userInfo.hasDonorProfile && (
                    <Alert
                      message="Đăng ký lần đầu"
                      description="Đây là lần đầu bạn đăng ký hiến máu. Hệ thống sẽ tự động tạo hồ sơ hiến máu cho bạn. Hồ sơ này sẽ được sử dụng cho các lần hiến máu tiếp theo."
                      type="warning"
                      showIcon
                      style={{ marginTop: '16px' }}
                    />
                  )}

                  {userInfo && userInfo.hasDonorProfile && userInfo.donorID && (
                    <Alert
                      message="Hồ sơ hiến máu đã có"
                      description={`Bạn đã có hồ sơ hiến máu (ID: ${userInfo.donorID.substring(0, 8)}...). Đăng ký này sẽ được liên kết với hồ sơ hiện tại.`}
                      type="success"
                      showIcon
                      style={{ marginTop: '16px' }}
                    />
                  )} */}
                </>
              )}
            </div>
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
                icon={index === 0 ? <MedicineBoxOutlined /> : <SafetyCertificateOutlined />}
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
                onClick={() => {
                  if (!agreement) {
                    setError('Vui lòng đồng ý với điều khoản trước khi đăng ký.');
                    return;
                  }
                  
                  // Use stored form data for submission
                  
                  // Call onFinish directly with stored form data
                  onFinish(formData);
                }}
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