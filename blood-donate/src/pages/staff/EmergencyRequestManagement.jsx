import React, { useEffect, useState } from 'react';
import {
  Table,
  Tag,
  Typography,
  Spin,
  Button,
  Modal,
  InputNumber,
  Select,
  Form,
  message,
} from 'antd';
import { getAllBloodRequests } from '../../services/emergencyRequestApi';

const { Title } = Typography;

// ===== Constants =====
const STATUS_ENUM = {
  Draft: 1,
  Pending: 2,
  Approved: 3,
  Done: 4,
  Rejected: 5,
  Closed: 6,
  Opened: 7,
};

const BLOOD_TYPE_MAP = {
  '11111111-1111-1111-1111-111111111001': 'A+',
  '11111111-1111-1111-1111-111111111002': 'A-',
  '11111111-1111-1111-1111-111111111003': 'B+',
  '11111111-1111-1111-1111-111111111004': 'B-',
  '11111111-1111-1111-1111-111111111005': 'AB+',
  '11111111-1111-1111-1111-111111111006': 'AB-',
  '11111111-1111-1111-1111-111111111007': 'O+',
  '11111111-1111-1111-1111-111111111008': 'O-',
};

const STATUS_OPTIONS = [
  { value: 'Opened', label: 'Cần hỗ trợ' },
  { value: 'Pending', label: 'Chờ xử lý' },
  { value: 'Closed', label: 'Đã đóng' },
];

const STATUS_COLORS = {
  Opened: 'red',
  Pending: 'gold',
  Closed: 'green',
};

// ===== Helpers =====
const getAuthToken = () => {
  const keys = ['userToken', 'token', 'authToken', 'jwtToken', 'accessToken'];
  for (const key of keys) {
    const token = localStorage.getItem(key) || sessionStorage.getItem(key);
    if (token?.startsWith('eyJ') && token.length > 100) return token;
  }
  return '';
};

const getRequestUser = async (requestId) => {
  try {
    const res = await fetch(`http://localhost:7262/api/BloodRequest/get-request-user/${requestId}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(getAuthToken() && { Authorization: `Bearer ${getAuthToken()}` }),
      },
    });
    const text = await res.text();
    const result = JSON.parse(text);
    return result?.data?.fullName || null;
  } catch {
    return null;
  }
};

// ===== Component =====
const EmergencyRequestManagement = () => {
  const [requests, setRequests] = useState([]);
  const [userNames, setUserNames] = useState({});
  const [loading, setLoading] = useState(false);
  const [detailModal, setDetailModal] = useState({ open: false, data: null, loading: false });
  const [editModal, setEditModal] = useState({ open: false, data: null, loading: false });
  const [editForm] = Form.useForm();

  // Load danh sách yêu cầu và tên người dùng
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getAllBloodRequests();
        const reqs = Array.isArray(data) ? data : [];
        setRequests(reqs);

        const names = {};
        await Promise.all(reqs.map(async (r) => {
          const name = await getRequestUser(r.requestId);
          if (name) names[r.requestId] = name;
        }));
        setUserNames(names);
      } catch {
        setRequests([]);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleViewDetail = async (record) => {
    setDetailModal({ open: true, data: null, loading: true });
    try {
      const res = await fetch(`http://localhost:7262/api/BloodRequest/get-request-user/${record.requestId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(getAuthToken() && { Authorization: `Bearer ${getAuthToken()}` }),
        },
      });
      const text = await res.text();
      const result = JSON.parse(text);
      setDetailModal({ open: true, data: result?.data || null, loading: false });
    } catch {
      message.error('Không lấy được chi tiết yêu cầu');
      setDetailModal({ open: true, data: null, loading: false });
    }
  };

  const handleEdit = (record) => {
    setEditModal({ open: true, data: { ...record }, loading: false });
    editForm.setFieldsValue({
      quantityNeeded: record.quantityNeeded,
      status: record.status,
    });
  };

  const handleEditSave = async () => {
    try {
      setEditModal((prev) => ({ ...prev, loading: true }));
      const values = await editForm.validateFields();
      const old = editModal.data;

      let res;
      if (values.quantityNeeded === old.quantityNeeded && values.status !== old.status) {
        res = await fetch(`http://localhost:7262/api/BloodRequest/update-emergency-status/${old.requestId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(getAuthToken() && { Authorization: `Bearer ${getAuthToken()}` }),
          },
          body: JSON.stringify({ requestId: old.requestId, newStatus: STATUS_ENUM[values.status] }),
        });
      } else {
        const payload = { ...old, ...values };
        if (typeof payload.status === 'string') {
          payload.status = STATUS_ENUM[payload.status];
        }
        res = await fetch(`http://localhost:7262/api/BloodRequest/Update-Blood-Requests/${old.requestId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(getAuthToken() && { Authorization: `Bearer ${getAuthToken()}` }),
          },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) throw new Error();
      message.success('Cập nhật thành công');
      setEditModal({ open: false, data: null, loading: false });

      setLoading(true);
      const data = await getAllBloodRequests();
      setRequests(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch {
      message.error('Cập nhật thất bại');
      setEditModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const columns = [
    {
      title: 'Mã yêu cầu',
      dataIndex: 'requestId',
      key: 'requestId',
      width: 120,
      ellipsis: true,
      render: (id) => (
        <span style={{ display: 'flex', alignItems: 'center' }}>
          <Button size="small" type="link" style={{ padding: 0, marginRight: 6 }}
            onClick={() => {
              navigator.clipboard.writeText(id);
              message.success('Đã copy mã yêu cầu');
            }}>
            Copy
          </Button>
          <span style={{ wordBreak: 'break-word' }}>{id}</span>
        </span>
      ),
    },
    {
      title: 'Tên bệnh nhân',
      dataIndex: 'requestId',
      key: 'userName',
      width: 170,
      render: (id) => userNames[id] || '---',
    },
    {
      title: 'Nhóm máu',
      dataIndex: 'bloodTypeRequired',
      key: 'bloodTypeRequired',
      width: 90,
      render: (id) => BLOOD_TYPE_MAP[id] || id,
    },
    {
      title: 'Số lượng (ml)',
      dataIndex: 'quantityNeeded',
      key: 'quantityNeeded',
      width: 110,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const label = STATUS_OPTIONS.find((s) => s.value === status)?.label || status;
        return <Tag color={STATUS_COLORS[status] || 'default'}>{label}</Tag>;
      },
    },
    {
      title: 'Ngày yêu cầu',
      dataIndex: 'requestDate',
      key: 'requestDate',
      width: 140,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <>
          <Button size="small" onClick={() => handleViewDetail(record)} style={{ marginRight: 8 }}>
            Xem chi tiết
          </Button>
          <Button size="small" type="primary" onClick={() => handleEdit(record)}>
            Chỉnh sửa
          </Button>
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: 32 }}>
      <Title level={3}>Quản lý yêu cầu khẩn cấp</Title>
      <Spin spinning={loading} tip="Đang tải dữ liệu...">
        <Table
          dataSource={requests}
          columns={columns}
          rowKey="requestId"
          bordered
          pagination={{ pageSize: 10 }}
        />
      </Spin>

      {/* Modal chi tiết */}
      <Modal
        open={detailModal.open}
        title="Chi tiết yêu cầu khẩn cấp"
        onCancel={() => setDetailModal({ open: false, data: null, loading: false })}
        footer={null}
        width={480}
      >
        {detailModal.loading ? (
          <Spin />
        ) : detailModal.data ? (
          <div>
            <p><b>Họ tên:</b> {detailModal.data.fullName}</p>
            <p><b>Email:</b> {detailModal.data.email}</p>
            <p><b>SĐT:</b> {detailModal.data.phone}</p>
            <p><b>CMND/CCCD:</b> {detailModal.data.userIdCard}</p>
            <p><b>Ngày sinh:</b> {detailModal.data.dateOfBirth}</p>
            <p><b>Trạng thái:</b> {detailModal.data.status}</p>
            <p><b>Mô tả:</b> {detailModal.data.description}</p>
            <p><b>Số lượng cần (ml):</b> {detailModal.data.quantityNeeded}</p>
            <p><b>Ngày yêu cầu:</b> {detailModal.data.requestDate}</p>
          </div>
        ) : (
          <div>Không có dữ liệu</div>
        )}
      </Modal>

      {/* Modal chỉnh sửa */}
      <Modal
        open={editModal.open}
        title="Chỉnh sửa yêu cầu khẩn cấp"
        onCancel={() => setEditModal({ open: false, data: null, loading: false })}
        onOk={handleEditSave}
        confirmLoading={editModal.loading}
        width={400}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            label="Số lượng cần (ml)"
            name="quantityNeeded"
            rules={[{ required: true, message: 'Vui lòng nhập số lượng máu cần' }]}
          >
            <InputNumber min={1} max={10000} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            label="Trạng thái"
            name="status"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select options={STATUS_OPTIONS} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EmergencyRequestManagement;
