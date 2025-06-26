import React, { useState } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Table, 
  Button, 
  Form, 
  InputGroup,
  Badge,
  Modal,
  Alert
} from 'react-bootstrap';
import { 
  FaSearch, 
  FaEye, 
  FaCheck, 
  FaTimes, 
  FaFilter,
  FaUserMd,
  FaHeartbeat,
  FaClipboardList
} from 'react-icons/fa';

const ApproveHealthForms = () => {
  const [healthForms, setHealthForms] = useState([
    {
      id: 1,
      healthCheckID: 'HC001',
      userID: 'USER001',
      fullName: 'Nguyễn Văn An',
      idCard: '123456789012',
      phone: '0901234567',
      bloodType: 'A+',
      age: 28,
      gender: 'Nam',
      submittedDate: '2024-12-15 09:30',
      status: 'pending',
      createdBy: {
        staffID: 'STAFF001',
        staffName: 'BS. Trần Văn Nam',
        position: 'Bác sĩ'
      }
    },
    {
      id: 2,
      healthCheckID: 'HC002',
      userID: 'USER002',
      fullName: 'Trần Thị Bình',
      idCard: '987654321098',
      phone: '0912345678',
      bloodType: 'O-',
      age: 32,
      gender: 'Nữ',
      submittedDate: '2024-12-15 10:15',
      status: 'approved',
      createdBy: {
        staffID: 'STAFF002',
        staffName: 'ThS. Lê Thị Hoa',
        position: 'Y tá trưởng'
      }
    }
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAlert, setShowAlert] = useState({ show: false, type: '', message: '' });
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);

  const filteredForms = healthForms.filter(form => {
    const matchesSearch = form.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.idCard.includes(searchTerm) ||
                         form.userID.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.healthCheckID.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || form.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const handleApprove = (formId) => {
    setHealthForms(prev => 
      prev.map(form => 
        form.id === formId ? { ...form, status: 'approved' } : form
      )
    );
    setShowAlert({
      show: true,
      type: 'success',
      message: 'Phiếu sức khỏe đã được duyệt!'
    });
    setTimeout(() => setShowAlert({ show: false, type: '', message: '' }), 3000);
  };

  const handleViewDetails = (form) => {
    setSelectedForm(form);
    setShowDetailModal(true);
  };

  const handleReject = (formId) => {
    setHealthForms(prev => 
      prev.map(form => 
        form.id === formId ? { ...form, status: 'rejected' } : form
      )
    );
    setShowAlert({
      show: true,
      type: 'warning',
      message: 'Phiếu sức khỏe đã bị từ chối!'
    });
    setTimeout(() => setShowAlert({ show: false, type: '', message: '' }), 3000);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge bg="warning">Chờ duyệt</Badge>;
      case 'approved':
        return <Badge bg="success">Đã duyệt</Badge>;
      case 'rejected':
        return <Badge bg="danger">Từ chối</Badge>;
      default:
        return <Badge bg="secondary">Không xác định</Badge>;
    }
  };

  return (
    <Container fluid className="p-4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh' }}>
      <div style={{ width: '100%', maxWidth: '1400px' }}>
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <h2 className="text-primary mb-2 text-center">
            <FaClipboardList className="me-2" />
            Duyệt Phiếu Sức Khỏe
          </h2>
          <p className="text-muted mb-0 text-center">Quản lý và duyệt các phiếu khám sức khỏe của người hiến máu</p>
        </Col>
      </Row>

      {/* Alert */}
      {showAlert.show && (
        <Alert variant={showAlert.type} dismissible onClose={() => setShowAlert({ show: false, type: '', message: '' })}>
          {showAlert.message}
        </Alert>
      )}

      {/* Filters and Search */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Tìm theo tên, CCCD, ID người dùng, mã phiếu sức khỏe..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text>
                  <FaFilter />
                </InputGroup.Text>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="pending">Chờ duyệt</option>
                  <option value="approved">Đã duyệt</option>
                  <option value="rejected">Từ chối</option>
                </Form.Select>
              </InputGroup>
            </Col>
            <Col md={2}>
              <div className="text-muted">
                Hiển thị: {filteredForms.length} phiếu
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Health Forms Table */}
      <Card>
        <Card.Body>
          <Table responsive hover>
            <thead className="table-light">
              <tr>
                <th>STT</th>
                <th>ID người dùng</th>
                <th>Họ tên</th>
                <th>CCCD/CMND</th>
                <th>Nhóm máu</th>
                <th>Số điện thoại</th>
                <th>Trạng thái</th>
                <th>Ngày nộp</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredForms.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center text-muted">
                    Không tìm thấy phiếu sức khỏe nào
                  </td>
                </tr>
              ) : (
                filteredForms.map((form, index) => (
                  <tr key={form.id}>
                    <td>{index + 1}</td>
                    <td>
                      <Badge bg="primary">{form.userID}</Badge>
                    </td>
                    <td>
                      <div>
                        <strong>{form.fullName}</strong>
                      </div>
                    </td>
                    <td>{form.idCard}</td>
                    <td>
                      <Badge bg="danger">{form.bloodType}</Badge>
                    </td>
                    <td>{form.phone}</td>
                    <td>{getStatusBadge(form.status)}</td>
                    <td>{form.submittedDate}</td>
                    <td>
                      <div className="d-flex gap-2">                        <Button 
                          variant="outline-info" 
                          size="sm"
                          onClick={() => handleViewDetails(form)}
                        >
                          <FaEye />
                        </Button>
                        {form.status === 'pending' && (
                          <>
                            <Button 
                              variant="outline-success" 
                              size="sm"
                              onClick={() => handleApprove(form.id)}
                            >
                              <FaCheck />
                            </Button>
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => handleReject(form.id)}
                            >
                              <FaTimes />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>        </Card.Body>
      </Card>

      {/* Modal Chi tiết Phiếu Sức khỏe */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaClipboardList className="me-2" />
            Chi tiết Phiếu Sức khỏe - {selectedForm?.healthCheckID}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedForm && (
            <Row>
              <Col md={6}>
                <Card className="mb-3">
                  <Card.Header>
                    <FaUserMd className="me-2" />
                    Thông tin cá nhân
                  </Card.Header>
                  <Card.Body>
                    <p><strong>ID người dùng:</strong> <Badge bg="primary">{selectedForm.userID}</Badge></p>
                    <p><strong>Họ và tên:</strong> {selectedForm.fullName}</p>
                    <p><strong>CCCD/CMND:</strong> {selectedForm.idCard}</p>
                    <p><strong>Ngày sinh:</strong> {selectedForm.dateOfBirth || selectedForm.age}</p>
                    <p><strong>Số điện thoại:</strong> {selectedForm.phone}</p>
                    <p><strong>Nhóm máu:</strong> <Badge bg="danger">{selectedForm.bloodType}</Badge></p>
                    <p><strong>Trạng thái:</strong> {getStatusBadge(selectedForm.status)}</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="mb-3">
                  <Card.Header>
                    <FaHeartbeat className="me-2" />
                    Chỉ số sinh hiệu
                  </Card.Header>
                  <Card.Body>
                    <p><strong>Cân nặng:</strong> {selectedForm.weight || '65'} kg</p>
                    <p><strong>Chiều cao:</strong> {selectedForm.height || '170'} cm</p>
                    <p><strong>Huyết áp:</strong> {selectedForm.bloodPressure || '120/80'} mmHg</p>
                    <p><strong>Nhịp tim:</strong> {selectedForm.heartRate || '72'} lần/phút</p>
                    <p><strong>Nhiệt độ:</strong> {selectedForm.temperature || '36.5'}°C</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={12}>
                <Card>
                  <Card.Header>
                    <FaClipboardList className="me-2" />
                    Tiền sử bệnh lý và ghi chú
                  </Card.Header>
                  <Card.Body>
                    <p><strong>Tiền sử bệnh lý:</strong></p>
                    <p className="text-muted">
                      {selectedForm.medicalHistory || 'Không có tiền sử bệnh lý đặc biệt'}
                    </p>
                    <p><strong>Lần hiến máu gần nhất:</strong> {selectedForm.lastDonation || 'Chưa từng hiến máu'}</p>
                    <p><strong>Ghi chú thêm:</strong></p>
                    <p className="text-muted">
                      {selectedForm.notes || 'Không có ghi chú thêm'}
                    </p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={12}>
                <Card className="mt-3">
                  <Card.Header>
                    <FaUserMd className="me-2" />
                    Thông tin tạo phiếu
                  </Card.Header>
                  <Card.Body>
                    <p><strong>Mã phiếu sức khỏe:</strong> <Badge bg="success">{selectedForm.healthCheckID}</Badge></p>
                    <p><strong>ID nhân viên:</strong> <Badge bg="info">{selectedForm.createdBy?.staffID || 'Không có thông tin'}</Badge></p>
                    <p><strong>Người tạo:</strong> {selectedForm.createdBy?.staffName || 'Không có thông tin'}</p>
                    <p><strong>Chức vụ:</strong> {selectedForm.createdBy?.position || 'Không có thông tin'}</p>
                    <p><strong>Ngày nộp:</strong> {selectedForm.submittedDate}</p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedForm?.status === 'pending' && (
            <>
              <Button 
                variant="success" 
                onClick={() => {
                  handleApprove(selectedForm.id);
                  setShowDetailModal(false);
                }}
              >
                <FaCheck className="me-2" />
                Duyệt
              </Button>
              <Button 
                variant="danger" 
                onClick={() => {
                  handleReject(selectedForm.id);
                  setShowDetailModal(false);
                }}
              >
                <FaTimes className="me-2" />
                Từ chối
              </Button>
            </>
          )}
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
      </div>
    </Container>
  );
};

export default ApproveHealthForms;
