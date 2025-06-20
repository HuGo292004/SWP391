import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Row,
  Col,
  Typography,
  Space,
  DatePicker,
  InputNumber,
  Checkbox,
  message,
  Divider,
  List,
  Tag,
  Modal
} from 'antd';
import {
  UserOutlined,
  MedicineBoxOutlined,
  HeartOutlined,
  SaveOutlined,
  EyeOutlined,
  FileTextOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const CreateHealthForms = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  // Mock data - các phiếu sức khỏe đã tạo gần đây
  const recentForms = [
    {
      id: 'HF001',
      patientName: 'Nguyễn Văn An',
      createdAt: '2024-01-15',
      status: 'approved',
      bloodType: 'A+',
    },
    {
      id: 'HF002',
      patientName: 'Trần Thị Bình',
      createdAt: '2024-01-14',
      status: 'pending',
      bloodType: 'O+',
    },
    {
      id: 'HF003',
      patientName: 'Lê Văn Cường',
      createdAt: '2024-01-13',
      status: 'rejected',
      bloodType: 'B+',
    },
  ];

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handlePreview = () => {
    form.validateFields()
      .then((values) => {
        setPreviewData(values);
        setPreviewVisible(true);
      })
      .catch((errorInfo) => {
        message.error('Vui lòng điền đầy đủ thông tin trước khi xem trước');
      });
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      message.success('Tạo phiếu sức khỏe thành công!');
      form.resetFields();
    } catch (error) {
      message.error('Có lỗi xảy ra khi tạo phiếu sức khỏe');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'green';
      case 'pending': return 'orange';
      case 'rejected': return 'red';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'Đã duyệt';
      case 'pending': return 'Chờ duyệt';
      case 'rejected': return 'Từ chối';
      default: return status;
    }
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <MedicineBoxOutlined style={{ marginRight: '12px', color: '#1976D2' }} />
          Tạo Phiếu Sức Khỏe
        </Title>
        <Text type="secondary">Tạo phiếu sức khỏe mới cho người hiến máu</Text>
      </div>

      <Row gutter={[24, 24]}>
        {/* Form chính */}
        <Col span={18}>
          <Card>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              requiredMark={false}
            >
              {/* Thông tin cá nhân */}
              <Title level={4}>
                <UserOutlined style={{ marginRight: '8px' }} />
                Thông tin cá nhân
              </Title>
              
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="fullName"
                    label="Họ và tên"
                    rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
                  >
                    <Input placeholder="Nhập họ và tên" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="idCard"
                    label="CCCD/CMND"
                    rules={[
                      { required: true, message: 'Vui lòng nhập CCCD/CMND' },
                      { pattern: /^\d{9,12}$/, message: 'CCCD/CMND không hợp lệ' }
                    ]}
                  >
                    <Input placeholder="Nhập CCCD/CMND" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="birthDate"
                    label="Ngày sinh"
                    rules={[{ required: true, message: 'Vui lòng chọn ngày sinh' }]}
                  >
                    <DatePicker style={{ width: '100%' }} placeholder="Chọn ngày sinh" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="gender"
                    label="Giới tính"
                    rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
                  >
                    <Select placeholder="Chọn giới tính">
                      <Option value="male">Nam</Option>
                      <Option value="female">Nữ</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="bloodType"
                    label="Nhóm máu"
                    rules={[{ required: true, message: 'Vui lòng chọn nhóm máu' }]}
                  >
                    <Select placeholder="Chọn nhóm máu">
                      {bloodTypes.map(type => (
                        <Option key={type} value={type}>{type}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="phone"
                    label="Số điện thoại"
                    rules={[
                      { required: true, message: 'Vui lòng nhập số điện thoại' },
                      { pattern: /^0\d{9}$/, message: 'Số điện thoại không hợp lệ' }
                    ]}
                  >
                    <Input placeholder="Nhập số điện thoại" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: 'Vui lòng nhập email' },
                      { type: 'email', message: 'Email không hợp lệ' }
                    ]}
                  >
                    <Input placeholder="Nhập email" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="address"
                label="Địa chỉ"
                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
              >
                <TextArea rows={2} placeholder="Nhập địa chỉ đầy đủ" />
              </Form.Item>

              <Divider />

              {/* Chỉ số sinh hiệu và tiền sử bệnh */}
              <Title level={4}>
                <HeartOutlined style={{ marginRight: '8px' }} />
                Chỉ số sinh hiệu và tiền sử bệnh
              </Title>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="weight"
                    label="Cân nặng (kg)"
                    rules={[
                      { required: true, message: 'Vui lòng nhập cân nặng' },
                      { type: 'number', min: 30, max: 200, message: 'Cân nặng không hợp lệ' }
                    ]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="Nhập cân nặng"
                      min={30}
                      max={200}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="height"
                    label="Chiều cao (cm)"
                    rules={[
                      { required: true, message: 'Vui lòng nhập chiều cao' },
                      { type: 'number', min: 100, max: 250, message: 'Chiều cao không hợp lệ' }
                    ]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="Nhập chiều cao"
                      min={100}
                      max={250}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="bloodPressure"
                    label="Huyết áp (mmHg)"
                    rules={[{ required: true, message: 'Vui lòng nhập huyết áp' }]}
                  >
                    <Input placeholder="VD: 120/80" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="heartRate"
                    label="Nhịp tim (lần/phút)"
                    rules={[
                      { required: true, message: 'Vui lòng nhập nhịp tim' },
                      { type: 'number', min: 40, max: 200, message: 'Nhịp tim không hợp lệ' }
                    ]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="Nhập nhịp tim"
                      min={40}
                      max={200}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="temperature"
                    label="Nhiệt độ (°C)"
                    rules={[
                      { required: true, message: 'Vui lòng nhập nhiệt độ' },
                      { type: 'number', min: 35, max: 42, message: 'Nhiệt độ không hợp lệ' }
                    ]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="Nhập nhiệt độ"
                      min={35}
                      max={42}
                      step={0.1}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="hemoglobin"
                    label="Hemoglobin (g/dL)"
                    rules={[{ required: true, message: 'Vui lòng nhập Hemoglobin' }]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="Nhập Hemoglobin"
                      min={8}
                      max={20}
                      step={0.1}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="medicalHistory"
                label="Tiền sử bệnh lý"
              >
                <Checkbox.Group>
                  <Row>
                    <Col span={8}><Checkbox value="diabetes">Tiểu đường</Checkbox></Col>
                    <Col span={8}><Checkbox value="hypertension">Cao huyết áp</Checkbox></Col>
                    <Col span={8}><Checkbox value="heart_disease">Tim mạch</Checkbox></Col>
                    <Col span={8}><Checkbox value="liver_disease">Gan</Checkbox></Col>
                    <Col span={8}><Checkbox value="kidney_disease">Thận</Checkbox></Col>
                    <Col span={8}><Checkbox value="blood_disease">Máu</Checkbox></Col>
                  </Row>
                </Checkbox.Group>
              </Form.Item>

              <Form.Item
                name="otherMedicalHistory"
                label="Tiền sử bệnh khác (nếu có)"
              >
                <TextArea rows={3} placeholder="Mô tả chi tiết các bệnh lý khác..." />
              </Form.Item>

              <Form.Item
                name="lastDonation"
                label="Lần hiến máu gần nhất"
              >
                <DatePicker style={{ width: '100%' }} placeholder="Chọn ngày hiến máu gần nhất" />
              </Form.Item>

              <Form.Item
                name="notes"
                label="Ghi chú thêm"
              >
                <TextArea rows={3} placeholder="Ghi chú thêm về tình trạng sức khỏe..." />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
                    Tạo phiếu sức khỏe
                  </Button>
                  <Button onClick={handlePreview} icon={<EyeOutlined />}>
                    Xem trước
                  </Button>
                  <Button onClick={() => form.resetFields()}>
                    Làm mới
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Sidebar - Phiếu đã tạo gần đây */}
        <Col span={6}>
          <Card title={
            <span>
              <ClockCircleOutlined style={{ marginRight: '8px' }} />
              Phiếu đã tạo gần đây
            </span>
          }>
            <List
              dataSource={recentForms}
              renderItem={(item) => (
                <List.Item style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <Text strong>{item.id}</Text>
                      <Tag color={getStatusColor(item.status)}>
                        {getStatusText(item.status)}
                      </Tag>
                    </div>
                    <div style={{ marginBottom: '4px' }}>
                      <Text>{item.patientName}</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {item.createdAt}
                      </Text>
                      <Tag color="blue">{item.bloodType}</Tag>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Modal xem trước */}
      <Modal
        title={
          <span>
            <FileTextOutlined style={{ marginRight: '8px' }} />
            Xem trước phiếu sức khỏe
          </span>
        }
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            Đóng
          </Button>,
          <Button key="confirm" type="primary" onClick={() => {
            setPreviewVisible(false);
            form.submit();
          }}>
            Xác nhận tạo phiếu
          </Button>
        ]}
      >
        {previewData && (
          <div>
            <Title level={4}>Thông tin cá nhân</Title>
            <Row gutter={16}>
              <Col span={12}><Text strong>Họ và tên:</Text> {previewData.fullName}</Col>
              <Col span={12}><Text strong>CCCD/CMND:</Text> {previewData.idCard}</Col>
            </Row>
            <Row gutter={16} style={{ marginTop: '8px' }}>
              <Col span={8}><Text strong>Ngày sinh:</Text> {previewData.birthDate?.format('DD/MM/YYYY')}</Col>
              <Col span={8}><Text strong>Giới tính:</Text> {previewData.gender === 'male' ? 'Nam' : 'Nữ'}</Col>
              <Col span={8}><Text strong>Nhóm máu:</Text> {previewData.bloodType}</Col>
            </Row>
            <Row gutter={16} style={{ marginTop: '8px' }}>
              <Col span={12}><Text strong>Điện thoại:</Text> {previewData.phone}</Col>
              <Col span={12}><Text strong>Email:</Text> {previewData.email}</Col>
            </Row>
            <div style={{ marginTop: '8px' }}>
              <Text strong>Địa chỉ:</Text> {previewData.address}
            </div>

            <Divider />

            <Title level={4}>Chỉ số sinh hiệu</Title>
            <Row gutter={16}>
              <Col span={8}><Text strong>Cân nặng:</Text> {previewData.weight} kg</Col>
              <Col span={8}><Text strong>Chiều cao:</Text> {previewData.height} cm</Col>
              <Col span={8}><Text strong>Huyết áp:</Text> {previewData.bloodPressure}</Col>
            </Row>
            <Row gutter={16} style={{ marginTop: '8px' }}>
              <Col span={8}><Text strong>Nhịp tim:</Text> {previewData.heartRate} lần/phút</Col>
              <Col span={8}><Text strong>Nhiệt độ:</Text> {previewData.temperature}°C</Col>
              <Col span={8}><Text strong>Hemoglobin:</Text> {previewData.hemoglobin} g/dL</Col>
            </Row>

            {previewData.medicalHistory && previewData.medicalHistory.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <Text strong>Tiền sử bệnh:</Text> {previewData.medicalHistory.join(', ')}
              </div>
            )}

            {previewData.otherMedicalHistory && (
              <div style={{ marginTop: '8px' }}>
                <Text strong>Tiền sử bệnh khác:</Text> {previewData.otherMedicalHistory}
              </div>
            )}

            {previewData.lastDonation && (
              <div style={{ marginTop: '8px' }}>
                <Text strong>Lần hiến máu gần nhất:</Text> {previewData.lastDonation.format('DD/MM/YYYY')}
              </div>
            )}

            {previewData.notes && (
              <div style={{ marginTop: '8px' }}>
                <Text strong>Ghi chú:</Text> {previewData.notes}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CreateHealthForms;
