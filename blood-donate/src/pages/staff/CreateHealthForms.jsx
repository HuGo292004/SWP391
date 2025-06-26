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

  // Thông tin nhân viên hiện tại (lấy từ hệ thống)
  const currentStaff = {
    staffID: 'STAFF001',
    staffName: 'BS. Trần Văn Nam',
    department: 'Khoa Huyết học',
    position: 'Bác sĩ'
  };

  // Mock data - các phiếu sức khỏe đã tạo gần đây
  const recentForms = [
    {
      id: 'HC001',
      donorName: 'Nguyễn Văn An',
      donorID: 'DN001',
      createdAt: '2024-01-15'
    },
    {
      id: 'HC002',
      donorName: 'Trần Thị Bình',
      donorID: 'DN002', 
      createdAt: '2024-01-14'
    },
    {
      id: 'HC003',
      donorName: 'Lê Văn Cường',
      donorID: 'DN003',
      createdAt: '2024-01-13'
    },
  ];

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
      
      // Thêm thông tin nhân viên tạo phiếu vào dữ liệu
      const formDataWithStaff = {
        ...values,
        createdBy: {
          staffID: currentStaff.staffID,
          staffName: currentStaff.staffName,
          department: currentStaff.department,
          position: currentStaff.position
        },
        createdAt: new Date().toISOString()
      };
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Dữ liệu phiếu sức khỏe:', formDataWithStaff);
      
      message.success('Tạo phiếu kiểm tra sức khỏe thành công!');
      form.resetFields();
    } catch (error) {
      message.error('Có lỗi xảy ra khi tạo phiếu kiểm tra sức khỏe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '24px', 
      backgroundColor: '#f5f5f5', 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <div style={{ width: '100%', maxWidth: '1400px' }}>
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <Title level={2}>
            <MedicineBoxOutlined style={{ marginRight: '12px', color: '#1976D2' }} />
            Tạo Phiếu Sức Khỏe
          </Title>
          <Text type="secondary">Tạo phiếu sức khỏe mới cho người hiến máu</Text>
        </div>

        {/* Thông tin nhân viên tạo phiếu */}
        <Card style={{ marginBottom: '24px', backgroundColor: '#f8f9fa', border: '1px solid #e9ecef' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <Title level={5} style={{ margin: 0, color: '#1976D2' }}>
                <UserOutlined style={{ marginRight: '8px' }} />
                Thông tin nhân viên tạo phiếu
              </Title>
              <div style={{ marginTop: '8px' }}>
                <Text><strong>ID nhân viên:</strong> {currentStaff.staffID}</Text>
                <span style={{ margin: '0 16px', color: '#d9d9d9' }}>|</span>
                <Text><strong>Họ tên:</strong> {currentStaff.staffName}</Text>
                <span style={{ margin: '0 16px', color: '#d9d9d9' }}>|</span>
                <Text><strong>Chức vụ:</strong> {currentStaff.position}</Text>
              </div>
            </div>
          </div>
        </Card>

      <Row gutter={[24, 24]}>
        {/* Form chính */}
        <Col span={18}>
          <Card>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              requiredMark={false}
            >              {/* Thông tin người hiến máu */}
              <Title level={4}>
                <UserOutlined style={{ marginRight: '8px' }} />
                Thông tin người hiến máu
              </Title>
              
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="donorID"
                    label="ID người hiến máu"
                    rules={[{ required: true, message: 'Vui lòng nhập ID người hiến máu' }]}
                  >
                    <Input placeholder="Nhập ID người hiến máu" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="HealthCheck_Date"
                    label="Ngày kiểm tra sức khỏe"
                    rules={[{ required: true, message: 'Vui lòng chọn ngày kiểm tra' }]}
                  >
                    <DatePicker style={{ width: '100%' }} placeholder="Chọn ngày kiểm tra" />
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              {/* Chỉ số sinh hiệu */}
              <Title level={4}>
                <HeartOutlined style={{ marginRight: '8px' }} />
                Chỉ số sinh hiệu
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
                    name="blood_pressure"
                    label="Huyết áp (mmHg)"
                    rules={[{ required: true, message: 'Vui lòng nhập huyết áp' }]}
                  >
                    <Input placeholder="VD: 120/80" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
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
                <Col span={12}>
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
              </Row>

              <Divider />

              {/* Thông tin y tế */}
              <Title level={4}>
                <MedicineBoxOutlined style={{ marginRight: '8px' }} />
                Thông tin y tế
              </Title>              <Form.Item
                name="medicalHistory"
                label="Tiền sử bệnh lý"
              >
                <TextArea 
                  rows={4}
                  placeholder="Nhập tiền sử bệnh lý của người hiến máu (VD: Tiểu đường, cao huyết áp, bệnh tim mạch, bệnh gan, bệnh thận, rối loạn máu...)" 
                />
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
                    </div>
                    <div style={{ marginBottom: '4px' }}>
                      <Text>{item.donorName}</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {item.createdAt}
                      </Text>
                      <Tag color="blue">{item.donorID}</Tag>
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
      >        {previewData && (
          <div>
            <Title level={4}>Thông tin người hiến máu</Title>
            <Row gutter={16}>
              <Col span={12}><Text strong>ID người hiến máu:</Text> {previewData.donorID}</Col>
              <Col span={12}><Text strong>Ngày kiểm tra:</Text> {previewData.HealthCheck_Date?.format('DD/MM/YYYY')}</Col>
            </Row>

            <Divider />

            <Title level={4}>Chỉ số sinh hiệu</Title>
            <Row gutter={16}>
              <Col span={8}><Text strong>Cân nặng:</Text> {previewData.weight} kg</Col>
              <Col span={8}><Text strong>Chiều cao:</Text> {previewData.height} cm</Col>
              <Col span={8}><Text strong>Huyết áp:</Text> {previewData.blood_pressure}</Col>
            </Row>
            <Row gutter={16} style={{ marginTop: '8px' }}>
              <Col span={12}><Text strong>Nhịp tim:</Text> {previewData.heartRate} lần/phút</Col>
              <Col span={12}><Text strong>Nhiệt độ:</Text> {previewData.temperature}°C</Col>
            </Row>

            <Divider />

            <Title level={4}>Thông tin y tế</Title>
            {previewData.medicalHistory && (
              <div style={{ marginTop: '8px' }}>
                <Text strong>Tiền sử bệnh lý:</Text> {previewData.medicalHistory}
              </div>
            )}

            <Divider />

            <Title level={4}>Thông tin nhân viên tạo phiếu</Title>
            <Row gutter={16}>
              <Col span={12}><Text strong>ID nhân viên:</Text> {currentStaff.staffID}</Col>
              <Col span={12}><Text strong>Họ tên:</Text> {currentStaff.staffName}</Col>
            </Row>
            <Row gutter={16} style={{ marginTop: '8px' }}>
              <Col span={12}><Text strong>Chức vụ:</Text> {currentStaff.position}</Col>
            </Row>
          </div>
        )}
      </Modal>
      </div>
    </div>
  );
};

export default CreateHealthForms;
