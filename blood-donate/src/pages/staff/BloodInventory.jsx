import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Input,
  Select,
  Button,
  Row,
  Col,
  Typography,
  Space,
  Tag,
  Modal,
  Form,
  InputNumber,
  DatePicker,
  message,
  Statistic,
  Tabs,
  Descriptions,
  Badge,
  Alert
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  ExportOutlined,
  DatabaseOutlined,
  DropboxOutlined,
  AlertOutlined,
  ReloadOutlined,
  PlusOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const { TabPane } = Tabs;

const BloodInventory = () => {
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterBloodType, setFilterBloodType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterComponent, setFilterComponent] = useState('all');
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [updateVisible, setUpdateVisible] = useState(false);
  const [addVisible, setAddVisible] = useState(false);
  const [form] = Form.useForm();
  const [addForm] = Form.useForm();

  // Mock data từ database BloodUnit (cấu trúc chính xác theo schema)
  const [bloodUnits, setBloodUnits] = useState([
    {
      unitID: 'UNIT001',
      donationID: 'DON001',
      bloodTypeID: 1, // A+
      componentType: 'whole_blood',
      expiryDate: '2025-02-15',
      status: 'available',
      quantity: 450,
      requestID: null,
      // Thông tin bổ sung từ JOIN với các bảng liên quan
      bloodTypeName: 'A+',
      donorName: 'Nguyễn Văn An',
      donationDate: '2025-01-15',
      location: 'Kho A-01',
      createdDate: '2025-01-15'
    },
    {
      unitID: 'UNIT002',
      donationID: 'DON001',
      bloodTypeID: 1,
      componentType: 'red_blood_cells',
      expiryDate: '2025-03-01',
      status: 'available',
      quantity: 200,
      requestID: null,
      bloodTypeName: 'A+',
      donorName: 'Nguyễn Văn An',
      donationDate: '2025-01-15',
      location: 'Kho A-02',
      createdDate: '2025-01-15'
    },
    {
      unitID: 'UNIT003',
      donationID: 'DON002',
      bloodTypeID: 5, // O+
      componentType: 'whole_blood',
      expiryDate: '2025-02-20',
      status: 'available',
      quantity: 450,
      requestID: null,
      bloodTypeName: 'O+',
      donorName: 'Trần Thị Bình',
      donationDate: '2025-01-20',
      location: 'Kho B-01',
      createdDate: '2025-01-20'
    },
    {
      unitID: 'UNIT004',
      donationID: 'DON003',
      bloodTypeID: 3, // B+
      componentType: 'plasma',
      expiryDate: '2025-04-15',
      status: 'reserved',
      quantity: 250,
      requestID: 'REQ001',
      bloodTypeName: 'B+',
      donorName: 'Lê Văn Cường',
      donationDate: '2025-01-10',
      location: 'Kho C-01',
      createdDate: '2025-01-10'
    },
    {
      unitID: 'UNIT005',
      donationID: 'DON004',
      bloodTypeID: 7, // AB+
      componentType: 'platelets',
      expiryDate: '2025-01-25',
      status: 'expired',
      quantity: 300,
      requestID: null,
      bloodTypeName: 'AB+',
      donorName: 'Phạm Thị Dung',
      donationDate: '2024-12-20',
      location: 'Kho D-01',
      createdDate: '2024-12-20'
    },
    {
      unitID: 'UNIT006',
      donationID: 'DON005',
      bloodTypeID: 6, // O-
      componentType: 'whole_blood',
      expiryDate: '2025-02-28',
      status: 'used',
      quantity: 450,
      requestID: 'REQ002',
      bloodTypeName: 'O-',
      donorName: 'Hoàng Văn Em',
      donationDate: '2025-01-28',
      location: 'Kho E-01',
      createdDate: '2025-01-28'
    },
    {
      unitID: 'UNIT007',
      donationID: 'DON006',
      bloodTypeID: 2, // A-
      componentType: 'plasma',
      expiryDate: '2025-03-10',
      status: 'available',
      quantity: 280,
      requestID: null,
      bloodTypeName: 'A-',
      donorName: 'Võ Thị Giang',
      donationDate: '2025-01-25',
      location: 'Kho F-01',
      createdDate: '2025-01-25'
    },
    {
      unitID: 'UNIT008',
      donationID: 'DON007',
      bloodTypeID: 4, // B-
      componentType: 'red_blood_cells',
      expiryDate: '2025-02-25',
      status: 'available',
      quantity: 180,
      requestID: null,
      bloodTypeName: 'B-',
      donorName: 'Đặng Văn Hải',
      donationDate: '2025-01-18',
      location: 'Kho G-01',
      createdDate: '2025-01-18'
    },
    {
      unitID: 'UNIT009',
      donationID: 'DON008',
      bloodTypeID: 8, // AB-
      componentType: 'platelets',
      expiryDate: '2025-01-30',
      status: 'quarantine',
      quantity: 320,
      requestID: null,
      bloodTypeName: 'AB-',
      donorName: 'Bùi Thị Lan',
      donationDate: '2025-01-22',
      location: 'Kho H-01',
      createdDate: '2025-01-22'
    },
    {
      unitID: 'UNIT010',
      donationID: 'DON009',
      bloodTypeID: 5, // O+
      componentType: 'cryoprecipitate',
      expiryDate: '2025-12-15',
      status: 'available',
      quantity: 150,
      requestID: null,
      bloodTypeName: 'O+',
      donorName: 'Ngô Văn Minh',
      donationDate: '2025-01-12',
      location: 'Kho I-01',
      createdDate: '2025-01-12'
    }
  ]);

  // Thống kê dữ liệu
  const totalUnits = bloodUnits.length;
  const availableUnits = bloodUnits.filter(unit => unit.status === 'available').length;
  const usedUnits = bloodUnits.filter(unit => unit.status === 'used').length;
  const reservedUnits = bloodUnits.filter(unit => unit.status === 'reserved').length;
  const expiredUnits = bloodUnits.filter(unit => unit.status === 'expired').length;
  const quarantineUnits = bloodUnits.filter(unit => unit.status === 'quarantine').length;
  const totalQuantity = bloodUnits
    .filter(unit => unit.status === 'available')
    .reduce((sum, unit) => sum + unit.quantity, 0);
  const expiringSoon = bloodUnits.filter(unit => {
    const expiry = dayjs(unit.expiryDate);
    const today = dayjs();
    return expiry.diff(today, 'day') <= 7 && unit.status === 'available';
  }).length;

  // Lọc dữ liệu
  const filteredData = bloodUnits.filter(unit => {
    const matchesSearch = unit.unitID.toLowerCase().includes(searchText.toLowerCase()) ||
                         unit.donationID.toLowerCase().includes(searchText.toLowerCase()) ||
                         unit.bloodTypeName.toLowerCase().includes(searchText.toLowerCase()) ||
                         unit.donorName?.toLowerCase().includes(searchText.toLowerCase());
    const matchesBloodType = filterBloodType === 'all' || unit.bloodTypeName === filterBloodType;
    const matchesStatus = filterStatus === 'all' || unit.status === filterStatus;
    const matchesComponent = filterComponent === 'all' || unit.componentType === filterComponent;
    return matchesSearch && matchesBloodType && matchesStatus && matchesComponent;
  });

  // Helper functions
  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'green';
      case 'used': return 'blue';
      case 'reserved': return 'orange';
      case 'expired': return 'red';
      case 'damaged': return 'volcano';
      case 'quarantine': return 'purple';
      case 'testing': return 'geekblue';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'available': return 'Có sẵn';
      case 'used': return 'Đã sử dụng';
      case 'reserved': return 'Đã đặt trước';
      case 'expired': return 'Hết hạn';
      case 'damaged': return 'Hư hỏng';
      case 'quarantine': return 'Cách ly';
      case 'testing': return 'Đang kiểm tra';
      default: return status;
    }
  };

  const getComponentText = (type) => {
    switch (type) {
      case 'whole_blood': return 'Máu toàn phần';
      case 'red_blood_cells': return 'Hồng cầu';
      case 'plasma': return 'Huyết tương';
      case 'platelets': return 'Tiểu cầu';
      case 'white_blood_cells': return 'Bạch cầu';
      case 'cryoprecipitate': return 'Tủa lạnh';
      case 'fresh_frozen_plasma': return 'Huyết tương tươi đông lạnh';
      default: return type;
    }
  };

  const getComponentColor = (type) => {
    switch (type) {
      case 'whole_blood': return 'red';
      case 'red_blood_cells': return 'volcano';
      case 'plasma': return 'gold';
      case 'platelets': return 'lime';
      case 'white_blood_cells': return 'geekblue';
      case 'cryoprecipitate': return 'purple';
      case 'fresh_frozen_plasma': return 'cyan';
      default: return 'default';
    }
  };

  const checkExpiryStatus = (expiryDate) => {
    const expiry = dayjs(expiryDate);
    const today = dayjs();
    const daysLeft = expiry.diff(today, 'day');
    
    if (daysLeft < 0) return { type: 'expired', text: 'Đã hết hạn', color: 'red' };
    if (daysLeft <= 3) return { type: 'critical', text: `Còn ${daysLeft} ngày`, color: 'red' };
    if (daysLeft <= 7) return { type: 'warning', text: `Còn ${daysLeft} ngày`, color: 'orange' };
    return { type: 'normal', text: `Còn ${daysLeft} ngày`, color: 'green' };
  };

  // Event handlers
  const handleUpdateUnit = async (values) => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setBloodUnits(prev => prev.map(unit => 
        unit.unitID === selectedUnit.unitID 
          ? { ...unit, ...values }
          : unit
      ));
      
      message.success('Cập nhật đơn vị máu thành công!');
      setUpdateVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Có lỗi xảy ra khi cập nhật');
    } finally {
      setLoading(false);
    }
  };

  // Event handlers
  const handleAddUnit = async (values) => {
    try {
      setLoading(true);
      
      // Generate new unit ID
      const nextUnitNumber = String(bloodUnits.length + 1).padStart(3, '0');
      const newUnitID = `UNIT${nextUnitNumber}`;
      
      // Map bloodTypeID to bloodTypeName
      const bloodTypeMap = {
        1: 'A+', 2: 'A-', 3: 'B+', 4: 'B-',
        5: 'O+', 6: 'O-', 7: 'AB+', 8: 'AB-'
      };
      
      // Auto-generate donor info and location based on donationID
      // In real app, this would be fetched from database
      const donorNames = [
        'Nguyễn Văn Nam', 'Trần Thị Lan', 'Lê Văn Hoàng', 'Phạm Thị Mai',
        'Hoàng Văn Tuấn', 'Vũ Thị Hương', 'Đặng Văn Phúc', 'Bùi Thị Thảo'
      ];
      const locations = ['Kho A-01', 'Kho A-02', 'Kho B-01', 'Kho B-02', 'Kho C-01'];
      
      const randomDonorName = donorNames[Math.floor(Math.random() * donorNames.length)];
      const randomLocation = locations[Math.floor(Math.random() * locations.length)];
      
      // Create new blood unit
      const newUnit = {
        unitID: newUnitID,
        donationID: values.donationID,
        bloodTypeID: values.bloodTypeID,
        componentType: values.componentType,
        expiryDate: values.expiryDate.format('YYYY-MM-DD'),
        status: 'available',
        quantity: values.quantity,
        requestID: null,
        // Auto-generated info
        bloodTypeName: bloodTypeMap[values.bloodTypeID],
        donorName: randomDonorName,
        donationDate: values.donationDate.format('YYYY-MM-DD'),
        location: randomLocation,
        createdDate: dayjs().format('YYYY-MM-DD')
      };
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setBloodUnits(prev => [...prev, newUnit]);
      
      message.success(`Thêm đơn vị máu ${newUnitID} thành công!`);
      setAddVisible(false);
      addForm.resetFields();
    } catch (error) {
      message.error('Có lỗi xảy ra khi thêm đơn vị máu');
    } finally {
      setLoading(false);
    }
  };

  // Table columns
  const columns = [
    {
      title: 'Mã đơn vị',
      dataIndex: 'unitID',
      key: 'unitID',
      width: 120,
      fixed: 'left',
      render: (text) => <Text strong style={{ color: '#1890ff' }}>{text}</Text>
    },
    {
      title: 'Mã hiến máu',
      dataIndex: 'donationID',
      key: 'donationID',
      width: 120,
      render: (text) => <Text code>{text}</Text>
    },
    {
      title: 'Nhóm máu',
      dataIndex: 'bloodTypeName',
      key: 'bloodTypeName',
      width: 100,
      render: (text) => (
        <Tag color="blue" style={{ fontWeight: 'bold', fontSize: '13px' }}>
          {text}
        </Tag>
      )
    },
    {
      title: 'Thành phần',
      dataIndex: 'componentType',
      key: 'componentType',
      width: 140,
      render: (text) => (
        <Tag color={getComponentColor(text)}>
          {getComponentText(text)}
        </Tag>
      )
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (value) => `${value} ml`,
      sorter: (a, b) => a.quantity - b.quantity
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: 'Ngày hết hạn',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 140,
      render: (date, record) => {
        const expiryStatus = checkExpiryStatus(date);
        return (
          <div>
            <div>{dayjs(date).format('DD/MM/YYYY')}</div>
            <Text type={expiryStatus.type === 'normal' ? 'success' : 
                      expiryStatus.type === 'warning' ? 'warning' : 'danger'}
                  style={{ fontSize: '12px' }}>
              {expiryStatus.text}
            </Text>
          </div>
        );
      },
      sorter: (a, b) => dayjs(a.expiryDate).unix() - dayjs(b.expiryDate).unix()
    },
    {
      title: 'Vị trí',
      dataIndex: 'location',
      key: 'location',
      width: 100
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            size="small"
            title="Xem chi tiết"
            style={{ color: '#1890ff' }}
            onClick={() => {
              setSelectedUnit(record);
              setDetailVisible(true);
            }}
          />
          <Button
            type="link"
            icon={<EditOutlined />}
            size="small"
            title="Chỉnh sửa"
            style={{ color: record.status === 'used' ? '#d9d9d9' : '#52c41a' }}
            onClick={() => {
              console.log('Edit button clicked for:', record.unitID);
              setSelectedUnit(record);
              // Format dữ liệu cho form
              const formData = {
                ...record,
                expiryDate: dayjs(record.expiryDate)
              };
              console.log('Form data:', formData);
              form.setFieldsValue(formData);
              setUpdateVisible(true);
            }}
            disabled={record.status === 'used'}
          />
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ marginBottom: '8px' }}>
            <DatabaseOutlined style={{ marginRight: '12px', color: '#1890ff' }} />
            Quản Lý Kho Máu
          </Title>
          <Text type="secondary">Quản lý đơn vị máu theo database BloodUnit</Text>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={() => setAddVisible(true)}
          style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
        >
          Thêm đơn vị máu
        </Button>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng đơn vị"
              value={totalUnits}
              prefix={<DropboxOutlined style={{ color: '#1890ff' }} />}
              suffix="đơn vị"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Có sẵn"
              value={availableUnits}
              prefix={<DatabaseOutlined style={{ color: '#52c41a' }} />}
              suffix="đơn vị"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng số lượng"
              value={Math.round(totalQuantity / 1000 * 10) / 10}
              prefix={<DatabaseOutlined style={{ color: '#722ed1' }} />}
              suffix="lít"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Sắp hết hạn"
              value={expiringSoon}
              prefix={<AlertOutlined style={{ color: '#faad14' }} />}
              suffix="đơn vị"
            />
          </Card>
        </Col>
      </Row>

      {/* Secondary Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title="Đã sử dụng"
              value={usedUnits}
              prefix={<Badge status="processing" />}
              suffix="đơn vị"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title="Đã đặt trước"
              value={reservedUnits}
              prefix={<Badge status="warning" />}
              suffix="đơn vị"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title="Cách ly"
              value={quarantineUnits}
              prefix={<Badge status="default" />}
              suffix="đơn vị"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title="Hết hạn"
              value={expiredUnits}
              prefix={<Badge status="error" />}
              suffix="đơn vị"
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} lg={8}>
            <Input
              placeholder="Tìm kiếm mã đơn vị, mã hiến máu, nhóm máu..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} sm={6} lg={4}>
            <Select
              placeholder="Nhóm máu"
              value={filterBloodType}
              onChange={setFilterBloodType}
              style={{ width: '100%' }}
            >
              <Option value="all">Tất cả</Option>
              <Option value="A+">A+</Option>
              <Option value="A-">A-</Option>
              <Option value="B+">B+</Option>
              <Option value="B-">B-</Option>
              <Option value="AB+">AB+</Option>
              <Option value="AB-">AB-</Option>
              <Option value="O+">O+</Option>
              <Option value="O-">O-</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} lg={4}>
            <Select
              placeholder="Trạng thái"
              value={filterStatus}
              onChange={setFilterStatus}
              style={{ width: '100%' }}
            >
              <Option value="all">Tất cả</Option>
              <Option value="available">Có sẵn</Option>
              <Option value="used">Đã sử dụng</Option>
              <Option value="reserved">Đã đặt trước</Option>
              <Option value="expired">Hết hạn</Option>
              <Option value="quarantine">Cách ly</Option>
              <Option value="testing">Đang kiểm tra</Option>
              <Option value="damaged">Hư hỏng</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} lg={4}>
            <Select
              placeholder="Thành phần"
              value={filterComponent}
              onChange={setFilterComponent}
              style={{ width: '100%' }}
            >
              <Option value="all">Tất cả</Option>
              <Option value="whole_blood">Máu toàn phần</Option>
              <Option value="red_blood_cells">Hồng cầu</Option>
              <Option value="plasma">Huyết tương</Option>
              <Option value="platelets">Tiểu cầu</Option>
              <Option value="white_blood_cells">Bạch cầu</Option>
              <Option value="cryoprecipitate">Tủa lạnh</Option>
              <Option value="fresh_frozen_plasma">Huyết tương tươi đông lạnh</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} lg={4}>
            <Space>
              <Button
                icon={<FilterOutlined />}
                onClick={() => {
                  setSearchText('');
                  setFilterBloodType('all');
                  setFilterStatus('all');
                  setFilterComponent('all');
                }}
              >
                Xóa bộ lọc
              </Button>
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={() => window.location.reload()}
              >
                Làm mới
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Alerts for expired units */}
      {expiringSoon > 0 && (
        <Alert
          message={`Cảnh báo: Có ${expiringSoon} đơn vị máu sắp hết hạn trong 7 ngày tới!`}
          type="warning"
          showIcon
          closable
          style={{ marginBottom: '16px' }}
        />
      )}

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="unitID"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} đơn vị`
          }}
          size="middle"
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <span>
            <EyeOutlined style={{ marginRight: '8px' }} />
            Chi tiết đơn vị máu - {selectedUnit?.unitID}
          </span>
        }
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            Đóng
          </Button>
        ]}
      >
        {selectedUnit && (
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="Mã đơn vị">{selectedUnit.unitID}</Descriptions.Item>
            <Descriptions.Item label="Mã hiến máu">{selectedUnit.donationID}</Descriptions.Item>
            <Descriptions.Item label="ID nhóm máu">{selectedUnit.bloodTypeID}</Descriptions.Item>
            <Descriptions.Item label="Nhóm máu">
              <Tag color="blue">{selectedUnit.bloodTypeName}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Thành phần">
              <Tag color={getComponentColor(selectedUnit.componentType)}>
                {getComponentText(selectedUnit.componentType)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Số lượng">{selectedUnit.quantity} ml</Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={getStatusColor(selectedUnit.status)}>
                {getStatusText(selectedUnit.status)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày hết hạn">
              {dayjs(selectedUnit.expiryDate).format('DD/MM/YYYY')}
            </Descriptions.Item>
            <Descriptions.Item label="Mã yêu cầu">
              {selectedUnit.requestID || 'Không có'}
            </Descriptions.Item>
            <Descriptions.Item label="Người hiến máu" span={2}>
              {selectedUnit.donorName}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày hiến máu" span={2}>
              {dayjs(selectedUnit.donationDate).format('DD/MM/YYYY')}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Update Modal */}
      <Modal
        title={
          <span>
            <EditOutlined style={{ marginRight: '8px' }} />
            Cập nhật đơn vị máu - {selectedUnit?.unitID}
          </span>
        }
        open={updateVisible}
        onCancel={() => {
          setUpdateVisible(false);
          form.resetFields();
          setSelectedUnit(null);
        }}
        onOk={() => form.submit()}
        confirmLoading={loading}
        width={600}
        destroyOnClose={true}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdateUnit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
              >
                <Select placeholder="Chọn trạng thái">
                  <Option value="available">Có sẵn</Option>
                  <Option value="reserved">Đã đặt trước</Option>
                  <Option value="used">Đã sử dụng</Option>
                  <Option value="expired">Hết hạn</Option>
                  <Option value="quarantine">Cách ly</Option>
                  <Option value="testing">Đang kiểm tra</Option>
                  <Option value="damaged">Hư hỏng</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="expiryDate"
                label="Ngày hết hạn"
                rules={[{ required: true, message: 'Vui lòng chọn ngày hết hạn' }]}
              >
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="requestID"
            label="Mã yêu cầu (nếu có)"
          >
            <Input placeholder="Nhập mã yêu cầu..." />
          </Form.Item>
          <Form.Item
            name="location"
            label="Vị trí lưu trữ"
          >
            <Input placeholder="Nhập vị trí lưu trữ..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Add New Unit Modal */}
      <Modal
        title={
          <span>
            <PlusOutlined style={{ marginRight: '8px' }} />
            Thêm đơn vị máu mới
          </span>
        }
        open={addVisible}
        onCancel={() => {
          setAddVisible(false);
          addForm.resetFields();
        }}
        onOk={() => addForm.submit()}
        confirmLoading={loading}
        width={800}
        destroyOnClose={true}
      >
        <Form 
          form={addForm} 
          layout="vertical" 
          onFinish={handleAddUnit}
          initialValues={{
            donationDate: dayjs(),
            expiryDate: dayjs().add(35, 'day'), // Default 35 days for whole blood
            status: 'available'
          }}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="donationID"
                label="Mã hiến máu"
                rules={[{ required: true, message: 'Vui lòng nhập mã hiến máu' }]}
              >
                <Input placeholder="VD: DON011" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="bloodTypeID"
                label="ID nhóm máu"
                rules={[{ required: true, message: 'Vui lòng chọn ID nhóm máu' }]}
              >
                <Select placeholder="Chọn ID nhóm máu">
                  <Option value={1}>1 (A+)</Option>
                  <Option value={2}>2 (A-)</Option>
                  <Option value={3}>3 (B+)</Option>
                  <Option value={4}>4 (B-)</Option>
                  <Option value={5}>5 (O+)</Option>
                  <Option value={6}>6 (O-)</Option>
                  <Option value={7}>7 (AB+)</Option>
                  <Option value={8}>8 (AB-)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="componentType"
                label="Thành phần"
                rules={[{ required: true, message: 'Vui lòng chọn thành phần' }]}
              >
                <Select 
                  placeholder="Chọn thành phần"
                  onChange={(value) => {
                    // Auto-set expiry date based on component type
                    const expiryDays = {
                      'whole_blood': 35,
                      'red_blood_cells': 42,
                      'plasma': 365,
                      'platelets': 5,
                      'cryoprecipitate': 365,
                      'fresh_frozen_plasma': 365
                    };
                    addForm.setFieldsValue({ 
                      expiryDate: dayjs().add(expiryDays[value] || 35, 'day') 
                    });
                  }}
                >
                  <Option value="whole_blood">Máu toàn phần</Option>
                  <Option value="red_blood_cells">Hồng cầu</Option>
                  <Option value="plasma">Huyết tương</Option>
                  <Option value="platelets">Tiểu cầu</Option>
                  <Option value="white_blood_cells">Bạch cầu</Option>
                  <Option value="cryoprecipitate">Tủa lạnh</Option>
                  <Option value="fresh_frozen_plasma">Huyết tương tươi đông lạnh</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="quantity"
                label="Số lượng (ml)"
                rules={[
                  { required: true, message: 'Vui lòng nhập số lượng' },
                  { type: 'number', min: 1, message: 'Số lượng phải lớn hơn 0' }
                ]}
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  placeholder="VD: 450"
                  min={1}
                  max={1000}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="donationDate"
                label="Ngày hiến máu"
                rules={[{ required: true, message: 'Vui lòng chọn ngày hiến máu' }]}
              >
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="expiryDate"
                label="Ngày hết hạn"
                rules={[{ required: true, message: 'Vui lòng chọn ngày hết hạn' }]}
              >
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
          </Row>

          <Alert
            message="Hướng dẫn"
            description="Mã đơn vị máu sẽ được tự động tạo theo định dạng UNIT###. Thông tin người hiến và vị trí lưu trữ sẽ được lấy từ mã hiến máu."
            type="info"
            showIcon
            style={{ marginTop: '16px' }}
          />
        </Form>
      </Modal>
    </div>
  );
};

export default BloodInventory;
