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
      fullName: 'Nguyễn Văn An',
      idCard: '123456789012',
      phone: '0901234567',
      bloodType: 'A+',
      age: 28,
      gender: 'Nam',
      submittedDate: '2024-12-15 09:30',
      status: 'pending'
    },
    {
      id: 2,
      fullName: 'Trần Thị Bình',
      idCard: '987654321098',
      phone: '0912345678',
      bloodType: 'O-',
      age: 32,
      gender: 'Nữ',
      submittedDate: '2024-12-15 10:15',
      status: 'approved'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAlert, setShowAlert] = useState({ show: false, type: '', message: '' });

  const filteredForms = healthForms.filter(form => {
    const matchesSearch = form.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.idCard.includes(searchTerm);
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
    <Container fluid className="p-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <h2 className="text-primary mb-2">
            <FaClipboardList className="me-2" />
            Duyệt Phiếu Sức Khỏe
          </h2>
          <p className="text-muted mb-0">Quản lý và duyệt các phiếu khám sức khỏe của người hiến máu</p>
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
                  placeholder="Tìm theo tên, CCCD..."
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
                <th>Họ tên</th>
                <th>CCCD/CMND</th>
                <th>Nhóm máu</th>
                <th>Số điện thoại</th>
                <th>Ngày nộp</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredForms.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center text-muted">
                    Không tìm thấy phiếu sức khỏe nào
                  </td>
                </tr>
              ) : (
                filteredForms.map((form, index) => (
                  <tr key={form.id}>
                    <td>{index + 1}</td>
                    <td>
                      <div>
                        <strong>{form.fullName}</strong>
                        <br />
                        <small className="text-muted">{form.age} tuổi - {form.gender}</small>
                      </div>
                    </td>
                    <td>{form.idCard}</td>
                    <td>
                      <Badge bg="danger">{form.bloodType}</Badge>
                    </td>
                    <td>{form.phone}</td>
                    <td>{form.submittedDate}</td>
                    <td>{getStatusBadge(form.status)}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button 
                          variant="outline-info" 
                          size="sm"
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
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ApproveHealthForms;
