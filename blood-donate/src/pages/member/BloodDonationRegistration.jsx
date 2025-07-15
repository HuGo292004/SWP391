/*
 * Blood Donation Registration Page
 * 
 * RECENT UPDATES: Integrated BloodManagement API and Enhanced Donor API (July 4, 2025)
 * - Integrated BloodManagement API for dynamic blood types loading
 * - Created enhancedDonorApi to save address and currentMedications to Donor table
 * - Updated data flow to ensure address and medications are stored in Donor table, not BloodDonation table
 * 
 * API Integration:
 * - BloodManagement API: /api/BloodManagement/Get-Blood-types (dynamic blood types)
 * - Enhanced Donor API: Creates/updates donor profile with address and currentMedications
 * - BloodDonation API: /api/BloodDonation (blood donation records with notes only)
 * 
 * Data Architecture:
 * - User personal information (name, email, phone, DOB) is stored in the User table
 * - Donor profile (donorId, userId, bloodTypeId, address, currentMedications, isAvailable) is stored in the Donor table  
 * - Blood donation records (donationDate, notes, status) are stored in the BloodDonation table
 * - Address and currentMedications are now stored in Donor table (as requested)
 * - Notes field is for additional comments only
 * 
 * Process:
 * 1. Load blood types dynamically from BloodManagement API
 * 2. Fetch user info from User API for display in confirmation step
 * 3. Submit blood donation registration and update Donor profile with address/medications
 * 4. Blood donation record stores donationDate, notes, status in BloodDonation table
 * 5. Donor profile stores address, currentMedications, bloodTypeId in Donor table
 * 
 * Important: Address and CurrentMedications are now saved to Donor table, Notes is for additional comments
 */

import React, { useState, useEffect } from 'react';
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
import { enhancedDonorApi } from '../../services/enhancedDonorApi';
import { bloodManagementApi } from '../../services/bloodManagementApi';
import { bloodDonationApi } from '../../services/bloodDonationApi';
import { UserAPI } from '../../services/userApi';
import '../../styles/BloodDonationRegistration.css';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { TextArea } = Input;
const { Option } = Select;

const BloodDonationRegistration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [userInfo, setUserInfo] = useState(null);
  const [loadingUserInfo, setLoadingUserInfo] = useState(false);
  const [agreement, setAgreement] = useState(false);
  const [formData, setFormData] = useState({}); // Store form data between steps
  const [bloodTypes, setBloodTypes] = useState([]); // Dynamic blood types from API
  const [loadingBloodTypes, setLoadingBloodTypes] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Load blood types from API on component mount
  useEffect(() => {
    // Initialize with static blood types first
    setBloodTypes(getStaticBloodTypes());
    // Then try to load from API
    loadBloodTypes();
    // Check if user already has pending/approved donation
    checkExistingDonation();
  }, []);

  // Check if user already has pending or approved donation
  const checkExistingDonation = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return;

      const data = await bloodDonationApi.getBloodDonationsByDonor(userId);
      const existingDonation = data.find(donation => 
        donation.status === 'pending' || donation.status === 'approved'
      );

      if (existingDonation) {
        setError('Bạn đã có đơn hiến máu đang xử lý. Vui lòng chờ xác nhận hoặc hoàn thành đơn hiện tại.');
        // Redirect to blood donation profile after 3 seconds
        setTimeout(() => {
          navigate('/member/blood-donation-profile');
        }, 3000);
      }
    } catch (error) {
      console.error('Error checking existing donation:', error);
    }
  };

  const loadBloodTypes = async () => {
    setLoadingBloodTypes(true);
    try {
      const response = await bloodManagementApi.getBloodTypes();
      
      // Format blood types data - handle multiple possible response formats
      let formattedBloodTypes = [];
      
      if (Array.isArray(response)) {
        formattedBloodTypes = response;
      } else if (response && Array.isArray(response.data)) {
        formattedBloodTypes = response.data;
      } else if (response && Array.isArray(response.bloodTypes)) {
        formattedBloodTypes = response.bloodTypes;
      } else if (response && typeof response === 'object') {
        // Try to find any array property
        const arrayKeys = Object.keys(response).filter(key => Array.isArray(response[key]));
        if (arrayKeys.length > 0) {
          formattedBloodTypes = response[arrayKeys[0]];
        }
      }
      
      if (formattedBloodTypes.length > 0) {
        setBloodTypes(formattedBloodTypes);
      }
      
    } catch (error) {
      console.error('Error loading blood types from API:', error);
      // Keep static blood types if API fails
    } finally {
      setLoadingBloodTypes(false);
    }
  };

  // Static blood types as fallback
  const getStaticBloodTypes = () => [
    
    { bloodTypeID: '11111111-1111-1111-1111-111111111001', aboType: 'A', rhFactor: '+', description: 'Nhóm máu A Rh dương' },
    { bloodTypeID: '11111111-1111-1111-1111-111111111002', aboType: 'A', rhFactor: '-', description: 'Nhóm máu A Rh âm' },
    { bloodTypeID: '11111111-1111-1111-1111-111111111003', aboType: 'B', rhFactor: '+', description: 'Nhóm máu B Rh dương' },
    { bloodTypeID: '11111111-1111-1111-1111-111111111004', aboType: 'B', rhFactor: '-', description: 'Nhóm máu B Rh âm' },
    { bloodTypeID: '11111111-1111-1111-1111-111111111005', aboType: 'AB', rhFactor: '+', description: 'Nhóm máu AB Rh dương' },
    { bloodTypeID: '11111111-1111-1111-1111-111111111006', aboType: 'AB', rhFactor: '-', description: 'Nhóm máu AB Rh âm' },
    { bloodTypeID: '11111111-1111-1111-1111-111111111007', aboType: 'O', rhFactor: '+', description: 'Nhóm máu O Rh dương' },
    { bloodTypeID: '11111111-1111-1111-1111-111111111008', aboType: 'O', rhFactor: '-', description: 'Nhóm máu O Rh âm' },
  ];

  // Fetch current user information
  const fetchUserInfo = async () => {
    setLoadingUserInfo(true);
    try {
      console.log('BloodDonationRegistration - Fetching user info...');
      const userResponse = await UserAPI.getCurrentUser();
      console.log('BloodDonationRegistration - User response:', userResponse);
      
      const userData = userResponse.data || userResponse;
      setUserInfo(userData);
      console.log('BloodDonationRegistration - User info set:', userData);
      
    } catch (error) {
      console.error('BloodDonationRegistration - Error fetching user info:', error);
      setError('Không thể tải thông tin người dùng. Vui lòng thử lại.');
      
      // Fallback to localStorage data for demo purposes
      const fallbackUserInfo = {
        fullName: localStorage.getItem('username') || 'Người dùng',
        username: localStorage.getItem('username') || 'user',
        email: 'member@example.com',
        phone: 'Chưa cập nhật',
        userIdCard: 'Chưa cập nhật',
        dateOfBirth: null,
        role: localStorage.getItem('userRole') || 'Member',
        userId: localStorage.getItem('userId') || 'temp-user-id'
      };
      
      console.log('BloodDonationRegistration - Using fallback user info:', fallbackUserInfo);
      setUserInfo(fallbackUserInfo);
    } finally {
      setLoadingUserInfo(false);
    }
  };

  // Helper function to validate blood type ID
  const isValidBloodTypeID = (bloodTypeID) => {
    if (!bloodTypeID || bloodTypeID === 'unknown' || bloodTypeID === 'undefined') {
      return false;
    }
    // Check if the bloodTypeID exists in our bloodTypes array (supports multiple field name formats)
    return bloodTypes.some(type => 
      (type.bloodTypeId === bloodTypeID) || // API uses lowercase 'd'
      (type.bloodTypeID === bloodTypeID) || 
      (type.BloodTypeID === bloodTypeID) || 
      (type.id === bloodTypeID)
    );
  };

  // Helper function to convert bloodTypeID to bloodType string for API
  const convertBloodTypeIDToString = (bloodTypeID) => {
    if (!bloodTypeID) return null;
    
    const selectedBloodType = bloodTypes.find(type => 
      (type.bloodTypeId === bloodTypeID) || // API uses lowercase 'd'
      (type.bloodTypeID === bloodTypeID) || 
      (type.BloodTypeID === bloodTypeID) || 
      (type.id === bloodTypeID)
    );
    
    if (selectedBloodType) {
      const aboType = selectedBloodType.aboType || selectedBloodType.AboType || '';
      const rhFactor = selectedBloodType.rhFactor || selectedBloodType.RhFactor || '';
      return `${aboType}${rhFactor}`; // e.g., "A+", "B-", "AB+", "O-"
    }
    
    return null;
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

      if (!formValues.address || !formValues.address.trim()) {
        setError('Vui lòng nhập địa chỉ!');
        return;
      }

      if (!formValues.currentMedications || !formValues.currentMedications.trim()) {
        setError('Vui lòng điền thông tin thuốc đang sử dụng!');
        return;
      }
      
      // Convert bloodTypeID to bloodType string for API
      const bloodTypeString = convertBloodTypeIDToString(formValues.bloodTypeID);
      if (!bloodTypeString) {
        setError('Không thể xác định nhóm máu. Vui lòng chọn lại!');
        return;
      }
      
      const donationData = {
        donorID: null, // Let backend set this based on authenticated user
        requestID: formValues.requestID || null,
        donationDate: formValues.donationDate ? formValues.donationDate.format('YYYY-MM-DD') : null,
        bloodTypeID: formValues.bloodTypeID || null, // Keep for internal tracking
        bloodType: bloodTypeString, // Send this to API (e.g., "A+", "B-")
        status: 'Pending',
        address: formValues.address || '',
        currentMedications: formValues.currentMedications || '',
        notes: formValues.notes || '',
        certificateID: null
      };
      
      // Use enhanced API that saves address and currentMedications to donor table
      const result = await enhancedDonorApi.registerBloodDonationWithDonor(donationData);
      
      // Show success message
      let successMessage = 'Đăng ký hiến máu thành công! Chúng tôi sẽ liên hệ với bạn để xác nhận lịch hẹn.';
      
      // Check if we have additional info about donor profile
      if (result && result.donorProfileInfo) {
        const { action, error, errorDetails } = result.donorProfileInfo;
        if (action === 'created') {
          successMessage += ' Hồ sơ hiến máu của bạn đã được tạo mới với thông tin địa chỉ và thuốc đang sử dụng.';
        } else if (action === 'updated') {
          successMessage += ' Hồ sơ hiến máu của bạn đã được cập nhật với thông tin địa chỉ và thuốc đang sử dụng.';
        } else if (action === 'failed' || action === 'failed_creation') {
          successMessage += ' Tuy nhiên, có lỗi khi cập nhật hồ sơ hiến máu. Vui lòng liên hệ hỗ trợ để cập nhật thông tin.';
          
          // Show a separate warning alert
          setTimeout(() => {
            setError(`Cảnh báo: Không thể cập nhật hồ sơ hiến máu. Chi tiết lỗi: ${errorDetails || error}`);
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
      description: 'Ngày hiến máu, nhóm máu và thông tin y tế'
    },
    {
      title: 'Xác nhận đăng ký',
      description: 'Kiểm tra thông tin và hoàn tất'
    }
  ];

  const nextStep = () => {
    const fieldsToValidate = currentStep === 0 
      ? ['donationDate', 'bloodTypeID', 'address', 'currentMedications'] 
      : [];
      
    form.validateFields(fieldsToValidate).then((values) => {
      // Get all form values, including optional ones like notes and requestID
      const allFormValues = form.getFieldsValue();
      
      // Additional validation for bloodTypeID and conversion
      const bloodTypeIDToValidate = values.bloodTypeID || allFormValues.bloodTypeID;
      if (currentStep === 0 && !isValidBloodTypeID(bloodTypeIDToValidate)) {
        setError('Vui lòng chọn nhóm máu hợp lệ!');
        return;
      }
      
      // Additional validation: check if we can convert bloodTypeID to string
      if (currentStep === 0) {
        const bloodTypeString = convertBloodTypeIDToString(bloodTypeIDToValidate);
        if (!bloodTypeString) {
          setError('Không thể xác định nhóm máu. Vui lòng chọn lại!');
          return;
        }
      }
      
      // Validate required fields for step 0
      if (currentStep === 0) {
        if (!allFormValues.address || !allFormValues.address.trim()) {
          setError('Vui lòng nhập địa chỉ!');
          return;
        }
        if (!allFormValues.currentMedications || !allFormValues.currentMedications.trim()) {
          setError('Vui lòng điền thông tin thuốc đang sử dụng!');
          return;
        }
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
                    placeholder={loadingBloodTypes ? "Đang tải nhóm máu..." : "Chọn nhóm máu của bạn"}
                    className="modern-input"
                    showSearch
                    loading={loadingBloodTypes}
                    disabled={loadingBloodTypes || bloodTypes.length === 0}
                    filterOption={(input, option) => {
                      const searchText = option?.searchText || '';
                      return searchText.toLowerCase().includes(input.toLowerCase());
                    }}
                    notFoundContent={loadingBloodTypes ? "Đang tải..." : "Không tìm thấy nhóm máu"}
                    onChange={(value) => {
                      const selectedType = bloodTypes.find(type => 
                        (type.bloodTypeId === value) ||  // API uses lowercase 'd' - check first
                        (type.bloodTypeID === value) || 
                        (type.BloodTypeID === value) || 
                        (type.id === value)
                      );
                      
                      // Update both the form value and the formData state
                      setFormData(prev => ({
                        ...prev,
                        bloodTypeID: value
                      }));
                      
                      // Also update the Ant Design form field
                      form.setFieldsValue({
                        bloodTypeID: value
                      });
                    }}
                    onOpenChange={(open) => {
                      // Optional: Trigger reload when dropdown opens
                    }}
                  >
                    {bloodTypes.map((type, index) => {
                      // Use consistent field order - prioritize API field name (bloodTypeId with lowercase 'd')
                      const key = type.bloodTypeId || type.bloodTypeID || type.BloodTypeID || type.id || `type-${index}`;
                      const aboType = type.aboType || type.AboType || '';
                      const rhFactor = type.rhFactor || type.RhFactor || '';
                      const description = type.description || type.Description || `Nhóm máu ${aboType} Rh ${rhFactor === '+' ? 'dương' : 'âm'}`;
                      
                      return (
                        <Option 
                          key={key} 
                          value={key}
                          searchText={`${aboType}${rhFactor} ${description}`}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Tag color="red" style={{ margin: 0 }}>
                              {aboType}{rhFactor}
                            </Tag>
                            <span style={{ fontSize: '12px', color: '#666' }}>
                              {description}
                            </span>
                          </div>
                        </Option>
                      );
                    })}
                  </Select>
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
              label="Địa chỉ"
              name="address"
              rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
            >
              <TextArea
                placeholder="Nhập địa chỉ hiện tại của bạn"
                rows={2}
                className="modern-input"
              />
            </Form.Item>

            <Form.Item
              label="Thuốc đang sử dụng"
              name="currentMedications"
              rules={[{ required: true, message: 'Vui lòng điền thông tin thuốc đang sử dụng!' }]}
            >
              <TextArea
                placeholder="Vui lòng mô tả các loại thuốc đang sử dụng. Nếu không có, hãy ghi 'Không có'."
                rows={3}
                className="modern-input"
              />
            </Form.Item>

            <Form.Item
              label="Ghi chú"
              name="notes"
            >
              <TextArea
                placeholder="Ghi chú thêm (tùy chọn)"
                rows={2}
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
                          <Text>{userInfo.fullName || 'Chưa cập nhật'}</Text>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div className="confirm-item">
                          <Text strong>Email:</Text>
                          <Text>{userInfo.email || 'Chưa cập nhật'}</Text>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div className="confirm-item">
                          <Text strong>Số điện thoại:</Text>
                          <Text>{userInfo.phone || 'Chưa cập nhật'}</Text>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div className="confirm-item">
                          <Text strong>Số CMND/CCCD:</Text>
                          <Text>{userInfo.userIdCard || 'Chưa cập nhật'}</Text>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div className="confirm-item">
                          <Text strong>Ngày sinh:</Text>
                          <Text>
                            {userInfo.dateOfBirth 
                              ? dayjs(userInfo.dateOfBirth).format('DD/MM/YYYY')
                              : 'Chưa cập nhật'
                            }
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
                        <Text>
                          {(() => {
                            const selectedBloodTypeID = formData.bloodTypeID;
                            const selectedBloodType = bloodTypes.find(type => 
                              (type.bloodTypeId === selectedBloodTypeID) || // API uses lowercase 'd' - check first
                              (type.bloodTypeID === selectedBloodTypeID) || 
                              (type.BloodTypeID === selectedBloodTypeID) || 
                              (type.id === selectedBloodTypeID)
                            );
                            
                            return selectedBloodType ? (
                              <Tag color="red">
                                {selectedBloodType.aboType || selectedBloodType.AboType}
                                {selectedBloodType.rhFactor || selectedBloodType.RhFactor}
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
                        <Text strong>Địa chỉ:</Text>
                        <Text>{formData.address || 'Chưa điền'}</Text>
                      </div>
                    </Col>
                  </Row>

                  <Row gutter={[16, 16]}>
                    <Col span={24}>
                      <div className="confirm-item">
                        <Text strong>Thuốc đang sử dụng:</Text>
                        <Text>{formData.currentMedications || 'Chưa điền'}</Text>
                      </div>
                    </Col>
                  </Row>

                  {formData.notes && (
                    <Row gutter={[16, 16]}>
                      <Col span={24}>
                        <div className="confirm-item">
                          <Text strong>Ghi chú:</Text>
                          <Text>{formData.notes}</Text>
                        </div>
                      </Col>
                    </Row>
                  )}

                  {formData.requestID && (
                    <Row gutter={[16, 16]}>
                      <Col span={24}>
                        <div className="confirm-item">
                          <Text strong>Mã hỗ trợ khẩn cấp:</Text>
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
                      <Text>Xác nhận đơn đăng ký</Text>
                    </Checkbox>
                  </div>

                  <Alert
                    message="Lưu ý quan trọng"
                    description="Sau khi đăng ký thành công, vui lòng vào hồ sơ hiến máu để cập nhật thông báo mới nhất về tình trạng đơn đăng ký và lịch hiến máu của bạn."
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