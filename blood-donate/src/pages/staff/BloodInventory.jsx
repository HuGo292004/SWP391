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
  Progress,
  Tabs,
  Descriptions,
  Badge
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  PlusOutlined,
  MinusOutlined,
  ExportOutlined,
  ImportOutlined,
  DatabaseOutlined,
  DropboxOutlined,
  AlertOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const BloodInventory = () => {
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [addStockVisible, setAddStockVisible] = useState(false);
  const [removeStockVisible, setRemoveStockVisible] = useState(false);
  const [form] = Form.useForm();

  // Mock data - Kho máu
  const [bloodInventory, setBloodInventory] = useState([
    {
      id: 'INV001',
      bloodType: 'A+',
      currentStock: 15,
      minStock: 10,
      maxStock: 50,
      status: 'normal',
      lastUpdated: '2024-01-15',
      expiryDate: '2024-02-15',
      location: 'Kho A - Tủ 1',
      donations: [
        { donorId: 'D001', donorName: 'Nguyễn Văn An', date: '2024-01-10', quantity: 450 },
        { donorId: 'D002', donorName: 'Trần Thị Bình', date: '2024-01-12', quantity: 450 }
      ]
    },
    {
      id: 'INV002',
      bloodType: 'O+',
      currentStock: 25,
      minStock: 15,
      maxStock: 60,
      status: 'normal',
      lastUpdated: '2024-01-14',
      expiryDate: '2024-02-14',
      location: 'Kho A - Tủ 2',
      donations: [
        { donorId: 'D003', donorName: 'Lê Văn Cường', date: '2024-01-08', quantity: 450 },
        { donorId: 'D004', donorName: 'Phạm Thị Dung', date: '2024-01-11', quantity: 450 }
      ]
    },
    {
      id: 'INV003',
      bloodType: 'B+',
      currentStock: 5,
      minStock: 10,
      maxStock: 40,
      status: 'low',
      lastUpdated: '2024-01-13',
      expiryDate: '2024-02-13',
      location: 'Kho B - Tủ 1',
      donations: [
        { donorId: 'D005', donorName: 'Hoàng Văn Em', date: '2024-01-05', quantity: 450 }
      ]
    },
    {
      id: 'INV004',
      bloodType: 'AB+',
      currentStock: 8,
      minStock: 8,
      maxStock: 30,
      status: 'critical',
      lastUpdated: '2024-01-12',
      expiryDate: '2024-02-12',
      location: 'Kho B - Tủ 2',
      donations: [
        { donorId: 'D006', donorName: 'Vũ Thị Giang', date: '2024-01-07', quantity: 450 }
      ]
    },
    {
      id: 'INV005',
      bloodType: 'O-',
      currentStock: 12,
      minStock: 12,
      maxStock: 35,
      status: 'normal',
      lastUpdated: '2024-01-16',
      expiryDate: '2024-02-16',
      location: 'Kho C - Tủ 1',
      donations: [
        { donorId: 'D007', donorName: 'Đặng Văn Hải', date: '2024-01-09', quantity: 450 }
      ]
    },
    {
      id: 'INV006',
      bloodType: 'A-',
      currentStock: 3,
      minStock: 8,
      maxStock: 25,
      status: 'critical',
      lastUpdated: '2024-01-11',
      expiryDate: '2024-02-11',
      location: 'Kho C - Tủ 2',
      donations: []
    }
  ]);

  // Thống kê tổng quan
  const totalStock = bloodInventory.reduce((sum, item) => sum + item.currentStock, 0);
  const lowStockCount = bloodInventory.filter(item => item.status === 'low' || item.status === 'critical').length;
  const normalStockCount = bloodInventory.filter(item => item.status === 'normal').length;

  // Lọc dữ liệu
  const filteredData = bloodInventory.filter(item => {
    const matchesSearch = item.bloodType.toLowerCase().includes(searchText.toLowerCase()) ||
                         item.location.toLowerCase().includes(searchText.toLowerCase());
    const matchesType = filterType === 'all' || item.bloodType === filterType;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'normal': return 'green';
      case 'low': return 'orange';
      case 'critical': return 'red';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'normal': return 'Bình thường';
      case 'low': return 'Thấp';
      case 'critical': return 'Thiếu hụt';
      default: return status;
    }
  };

  const getStockProgress = (current, min, max) => {
    const percentage = (current / max) * 100;
    let status = 'normal';
    
    if (current <= min * 0.5) {
      status = 'exception';
    } else if (current <= min) {
      status = 'active';
    }
    
    return { percentage, status };
  };

  const handleAddStock = async (values) => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update inventory
      setBloodInventory(prev => prev.map(item => 
        item.id === selectedRecord.id 
          ? { ...item, currentStock: item.currentStock + values.quantity, lastUpdated: dayjs().format('YYYY-MM-DD') }
          : item
      ));
      
      message.success('Thêm tồn kho thành công!');
      setAddStockVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Có lỗi xảy ra khi thêm tồn kho');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStock = async (values) => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update inventory
      setBloodInventory(prev => prev.map(item => 
        item.id === selectedRecord.id 
          ? { ...item, currentStock: Math.max(0, item.currentStock - values.quantity), lastUpdated: dayjs().format('YYYY-MM-DD') }
          : item
      ));
      
      message.success('Xuất kho thành công!');
      setRemoveStockVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Có lỗi xảy ra khi xuất kho');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Mã kho',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Nhóm máu',
      dataIndex: 'bloodType',
      key: 'bloodType',
      width: 120,
      render: (text) => (
        <Tag color="blue" style={{ fontSize: '14px', fontWeight: 'bold' }}>
          {text}
        </Tag>
      )
    },
    {
      title: 'Tồn kho hiện tại',
      dataIndex: 'currentStock',
      key: 'currentStock',
      width: 150,
      render: (value, record) => {
        const { percentage, status } = getStockProgress(value, record.minStock, record.maxStock);
        return (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
              <Text strong style={{ marginRight: '8px' }}>{value} đơn vị</Text>
              <Tag color={getStatusColor(record.status)}>
                {getStatusText(record.status)}
              </Tag>
            </div>
            <Progress
              percent={percentage}
              status={status}
              size="small"
              showInfo={false}
            />
          </div>
        );
      }
    },
    {
      title: 'Mức tối thiểu',
      dataIndex: 'minStock',
      key: 'minStock',
      width: 120,
      render: (text) => `${text} đơn vị`
    },
    {
      title: 'Vị trí',
      dataIndex: 'location',
      key: 'location',
      width: 150
    },
    {
      title: 'Ngày hết hạn',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 120,
      render: (text) => dayjs(text).format('DD/MM/YYYY')
    },
    {
      title: 'Cập nhật cuối',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      width: 120,
      render: (text) => dayjs(text).format('DD/MM/YYYY')
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedRecord(record);
              setDetailVisible(true);
            }}
          >
            Chi tiết
          </Button>
          <Button
            type="link"
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedRecord(record);
              setAddStockVisible(true);
            }}
          >
            Nhập
          </Button>
          <Button
            type="link"
            icon={<MinusOutlined />}
            onClick={() => {
              setSelectedRecord(record);
              setRemoveStockVisible(true);
            }}
          >
            Xuất
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <DatabaseOutlined style={{ marginRight: '12px', color: '#1976D2' }} />
          Quản Lý Kho Máu
        </Title>
        <Text type="secondary">Quản lý tồn kho và nhập xuất máu</Text>
      </div>

      {/* Thống kê tổng quan */}
      <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng tồn kho"
              value={totalStock}
              suffix="đơn vị"
              prefix={<DropboxOutlined style={{ color: '#1976D2' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Kho bình thường"
              value={normalStockCount}
              suffix="nhóm máu"
              prefix={<Badge status="success" />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Kho thiếu hụt"
              value={lowStockCount}
              suffix="nhóm máu"
              prefix={<AlertOutlined style={{ color: '#ff4d4f' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tỷ lệ đầy kho"
              value={Math.round((totalStock / (bloodInventory.length * 50)) * 100)}
              suffix="%"
              prefix={<DatabaseOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Bộ lọc và tìm kiếm */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Input
              placeholder="Tìm kiếm theo nhóm máu hoặc vị trí..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col>
            <Select
              placeholder="Lọc theo nhóm máu"
              value={filterType}
              onChange={setFilterType}
              style={{ width: 150 }}
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
          <Col>
            <Select
              placeholder="Lọc theo trạng thái"
              value={filterStatus}
              onChange={setFilterStatus}
              style={{ width: 150 }}
            >
              <Option value="all">Tất cả</Option>
              <Option value="normal">Bình thường</Option>
              <Option value="low">Thấp</Option>
              <Option value="critical">Thiếu hụt</Option>
            </Select>
          </Col>
          <Col>
            <Button
              icon={<FilterOutlined />}
              onClick={() => {
                setSearchText('');
                setFilterType('all');
                setFilterStatus('all');
              }}
            >
              Xóa lọc
            </Button>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={() => setLoading(true)}
            >
              Làm mới
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Bảng dữ liệu */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} mục`
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Modal chi tiết */}
      <Modal
        title={
          <span>
            <EyeOutlined style={{ marginRight: '8px' }} />
            Chi tiết kho máu - {selectedRecord?.bloodType}
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
        {selectedRecord && (
          <Tabs defaultActiveKey="1">
            <TabPane tab="Thông tin kho" key="1">
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Mã kho">{selectedRecord.id}</Descriptions.Item>
                <Descriptions.Item label="Nhóm máu">
                  <Tag color="blue">{selectedRecord.bloodType}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Tồn kho hiện tại">
                  {selectedRecord.currentStock} đơn vị
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag color={getStatusColor(selectedRecord.status)}>
                    {getStatusText(selectedRecord.status)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Mức tối thiểu">
                  {selectedRecord.minStock} đơn vị
                </Descriptions.Item>
                <Descriptions.Item label="Mức tối đa">
                  {selectedRecord.maxStock} đơn vị
                </Descriptions.Item>
                <Descriptions.Item label="Vị trí lưu trữ">
                  {selectedRecord.location}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày hết hạn">
                  {dayjs(selectedRecord.expiryDate).format('DD/MM/YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Cập nhật cuối" span={2}>
                  {dayjs(selectedRecord.lastUpdated).format('DD/MM/YYYY')}
                </Descriptions.Item>
              </Descriptions>
              
              <div style={{ marginTop: '16px' }}>
                <Title level={5}>Biểu đồ tồn kho</Title>
                <Progress
                  percent={(selectedRecord.currentStock / selectedRecord.maxStock) * 100}
                  status={selectedRecord.status === 'critical' ? 'exception' : 
                           selectedRecord.status === 'low' ? 'active' : 'normal'}
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                />
              </div>
            </TabPane>
            
            <TabPane tab="Lịch sử hiến máu" key="2">
              <Table
                dataSource={selectedRecord.donations}
                columns={[
                  {
                    title: 'Mã người hiến',
                    dataIndex: 'donorId',
                    key: 'donorId'
                  },
                  {
                    title: 'Tên người hiến',
                    dataIndex: 'donorName',
                    key: 'donorName'
                  },
                  {
                    title: 'Ngày hiến',
                    dataIndex: 'date',
                    key: 'date',
                    render: (text) => dayjs(text).format('DD/MM/YYYY')
                  },
                  {
                    title: 'Số lượng (ml)',
                    dataIndex: 'quantity',
                    key: 'quantity'
                  }
                ]}
                pagination={false}
                size="small"
              />
            </TabPane>
          </Tabs>
        )}
      </Modal>

      {/* Modal nhập kho */}
      <Modal
        title={
          <span>
            <ImportOutlined style={{ marginRight: '8px' }} />
            Nhập kho - {selectedRecord?.bloodType}
          </span>
        }
        open={addStockVisible}
        onCancel={() => setAddStockVisible(false)}
        onOk={() => form.submit()}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical" onFinish={handleAddStock}>
          <Form.Item
            name="quantity"
            label="Số lượng nhập (đơn vị)"
            rules={[
              { required: true, message: 'Vui lòng nhập số lượng' },
              { type: 'number', min: 1, message: 'Số lượng phải lớn hơn 0' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Nhập số lượng"
              min={1}
            />
          </Form.Item>
          
          <Form.Item
            name="reason"
            label="Lý do nhập kho"
            rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}
          >
            <Input.TextArea rows={3} placeholder="Nhập lý do nhập kho..." />
          </Form.Item>
          
          <Form.Item
            name="date"
            label="Ngày nhập"
            rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
            initialValue={dayjs()}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal xuất kho */}
      <Modal
        title={
          <span>
            <ExportOutlined style={{ marginRight: '8px' }} />
            Xuất kho - {selectedRecord?.bloodType}
          </span>
        }
        open={removeStockVisible}
        onCancel={() => setRemoveStockVisible(false)}
        onOk={() => form.submit()}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical" onFinish={handleRemoveStock}>
          <Form.Item
            name="quantity"
            label="Số lượng xuất (đơn vị)"
            rules={[
              { required: true, message: 'Vui lòng nhập số lượng' },
              { type: 'number', min: 1, max: selectedRecord?.currentStock, 
                message: `Số lượng phải từ 1 đến ${selectedRecord?.currentStock}` }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Nhập số lượng"
              min={1}
              max={selectedRecord?.currentStock}
            />
          </Form.Item>
          
          <Form.Item
            name="recipient"
            label="Người/Đơn vị nhận"
            rules={[{ required: true, message: 'Vui lòng nhập thông tin người nhận' }]}
          >
            <Input placeholder="Nhập tên người/đơn vị nhận..." />
          </Form.Item>
          
          <Form.Item
            name="reason"
            label="Lý do xuất kho"
            rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}
          >
            <Input.TextArea rows={3} placeholder="Nhập lý do xuất kho..." />
          </Form.Item>
          
          <Form.Item
            name="date"
            label="Ngày xuất"
            rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
            initialValue={dayjs()}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BloodInventory;
