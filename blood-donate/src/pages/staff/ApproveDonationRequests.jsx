import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Table, 
  Button, 
  Form, 
  Modal, 
  Badge, 
  Alert,
  InputGroup,
  Dropdown,
  DropdownButton,
  Tab,
  Tabs,
  OverlayTrigger,
  Tooltip
} from 'react-bootstrap';
import { 
  FaSearch, 
  FaCheck, 
  FaTimes, 
  FaEye, 
  FaUser, 
  FaCalendarAlt, 
  FaHeart, 
  FaMedkit, 
  FaShieldAlt,
  FaFilter,
  FaClock,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaIdCard,
  FaWeight,
  FaRuler
} from 'react-icons/fa';

const ApproveDonationRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRequestType, setFilterRequestType] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  // Mock data for demonstration
  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {      const mockRequests = [        {
          id: 1,
          requesterId: 'U001',
          requesterName: 'Nguyễn Văn An',
          requesterEmail: 'nguyen.van.an@email.com',
          requesterPhone: '0123456789',
          idCard: '001234567890',
          bloodType: 'O+',
          requestType: 'emergency',
          requestDate: '2024-12-15',
          preferredDate: '2024-12-20',
          location: 'Bệnh viện Chợ Rẫy',
          status: 'pending',
          healthInfo: {
            weight: '65kg',
            height: '170cm',
            lastDonation: '2024-06-15',
            chronicDiseases: 'Không',
            currentMedications: 'Không',
            allergies: 'Không'          },
          emergencyContact: {
            name: 'Nguyễn Thị Mai',
            relationship: 'Mẹ',
            phone: '0123456788'
          },
          notes: 'Muốn hiến máu để giúp đỡ bệnh nhân cần máu khẩn cấp'
        },
        {
          id: 2,
          requesterId: 'U002',
          requesterName: 'Trần Thị Bình',
          requesterEmail: 'tran.thi.binh@email.com',
          requesterPhone: '0987654321',
          idCard: '098765432111',
          bloodType: 'A+',
          requestType: 'regular',
          requestDate: '2024-12-14',
          preferredDate: '2024-12-19',
          location: 'Bệnh viện Bạch Mai',
          status: 'approved',
          healthInfo: {
            weight: '58kg',
            height: '165cm',
            lastDonation: '2024-09-10',
            chronicDiseases: 'Không',
            currentMedications: 'Không',
            allergies: 'Không'          },
          emergencyContact: {
            name: 'Trần Văn Hùng',
            relationship: 'Chồng',
            phone: '0987654320'
          },
          notes: 'Đã từng hiến máu 3 lần, muốn tiếp tục đóng góp'
        },
        {
          id: 3,
          requesterId: 'U003',
          requesterName: 'Lê Minh Cường',
          requesterEmail: 'le.minh.cuong@email.com',
          requesterPhone: '0369258147',
          idCard: '036925814788',
          bloodType: 'B+',
          requestType: 'regular',
          requestDate: '2024-12-13',
          preferredDate: '2024-12-18',
          location: 'Bệnh viện Thống Nhất',
          status: 'rejected',
          healthInfo: {
            weight: '72kg',
            height: '175cm',
            lastDonation: '2024-11-10',
            chronicDiseases: 'Không',
            currentMedications: 'Thuốc huyết áp',
            allergies: 'Penicillin'          },
          emergencyContact: {
            name: 'Lê Thị Lan',
            relationship: 'Chị gái',
            phone: '0369258146'
          },
          notes: 'Muốn hiến máu thường xuyên',
          rejectReason: 'Khoảng cách hiến máu chưa đủ 12 tuần'
        }
      ];
      setRequests(mockRequests);
      setLoading(false);
    }, 1000);
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      default: return 'secondary';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Chờ duyệt';
      case 'approved': return 'Đã duyệt';
      case 'rejected': return 'Từ chối';
      default: return 'Không xác định';
    }
  };

  const getRequestTypeText = (type) => {
    switch (type) {
      case 'regular': return 'Hiến máu thường';
      case 'emergency': return 'Hiến máu khẩn cấp';
      default: return 'Không xác định';
    }
  };

  const getRequestTypeBadgeVariant = (type) => {
    switch (type) {
      case 'regular': return 'primary';
      case 'emergency': return 'danger';
      default: return 'secondary';
    }
  };
  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.requesterName.toLowerCase().includes(searchText.toLowerCase()) ||
                         request.requesterEmail.toLowerCase().includes(searchText.toLowerCase()) ||
                         request.bloodType.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesRequestType = filterRequestType === 'all' || request.requestType === filterRequestType;
    
    return matchesSearch && matchesStatus && matchesRequestType;
  });

  const showRequestDetail = (request) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const showApprovalConfirm = (request, action) => {
    setSelectedRequest(request);
    setApprovalAction(action);
    setRejectReason('');
    setShowApprovalModal(true);
  };

  const handleApproval = async () => {
    if (approvalAction === 'reject' && !rejectReason.trim()) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }

    // Simulate API call
    const updatedRequests = requests.map(request => {
      if (request.id === selectedRequest.id) {
        return {
          ...request,
          status: approvalAction === 'approve' ? 'approved' : 'rejected',
          ...(approvalAction === 'reject' && { rejectReason })
        };
      }
      return request;
    });

    setRequests(updatedRequests);
    setShowApprovalModal(false);
    setSelectedRequest(null);
  };

  return (
    <Container fluid className="p-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="text-primary mb-2">
                <FaHeart className="me-2" />
                Duyệt Đơn Hiến Máu
              </h2>
              <p className="text-muted mb-0">Quản lý và duyệt các đơn đăng ký hiến máu</p>
            </div>
          </div>
        </Col>
      </Row>

      {/* Filters and Search */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row className="g-3">
            <Col lg={4} md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Tìm kiếm theo tên, email, nhóm máu..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </InputGroup>            </Col>
            <Col lg={3} md={6}>
              <Form.Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="pending">Chờ duyệt</option>
                <option value="approved">Đã duyệt</option>
                <option value="rejected">Từ chối</option>
              </Form.Select>
            </Col>
            <Col lg={3} md={6}>
              <Form.Select
                value={filterRequestType}
                onChange={(e) => setFilterRequestType(e.target.value)}
              >
                <option value="all">Tất cả loại đơn</option>
                <option value="regular">Hiến máu thường</option>
                <option value="emergency">Hiến máu khẩn cấp</option>
              </Form.Select>
            </Col>
            <Col lg={2} md={6}>
              <Button variant="outline-primary" className="w-100">
                <FaFilter className="me-2" />
                Lọc
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Statistics */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3">
          <Card className="text-center border-warning">
            <Card.Body>
              <FaClock className="text-warning mb-2" size={24} />
              <h4 className="text-warning">
                {requests.filter(r => r.status === 'pending').length}
              </h4>
              <small className="text-muted">Chờ duyệt</small>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="text-center border-success">
            <Card.Body>
              <FaCheck className="text-success mb-2" size={24} />
              <h4 className="text-success">
                {requests.filter(r => r.status === 'approved').length}
              </h4>
              <small className="text-muted">Đã duyệt</small>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="text-center border-danger">
            <Card.Body>
              <FaTimes className="text-danger mb-2" size={24} />
              <h4 className="text-danger">
                {requests.filter(r => r.status === 'rejected').length}
              </h4>
              <small className="text-muted">Từ chối</small>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="text-center border-primary">
            <Card.Body>
              <FaHeart className="text-primary mb-2" size={24} />
              <h4 className="text-primary">{requests.length}</h4>
              <small className="text-muted">Tổng đơn</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Requests Table */}
      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white">
          <h5 className="mb-0">
            <FaHeart className="me-2" />
            Danh sách đơn hiến máu ({filteredRequests.length})
          </h5>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table striped hover className="mb-0">              <thead>
                <tr>
                  <th>ID</th>
                  <th>Người đăng ký</th>
                  <th>Nhóm máu</th>
                  <th>Loại đơn</th>
                  <th>Ngày đăng ký</th>
                  <th>Ngày mong muốn</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center">
                      <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center text-muted">
                      Không có dữ liệu phù hợp
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map(request => (
                    <tr key={request.id}>
                      <td>#{request.id}</td>
                      <td>
                        <div>
                          <strong>{request.requesterName}</strong>
                          <br />
                          <small className="text-muted">{request.requesterEmail}</small>
                        </div>
                      </td>                      <td>
                        <Badge bg="danger" className="blood-type-badge">
                          {request.bloodType}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={getRequestTypeBadgeVariant(request.requestType)}>
                          {getRequestTypeText(request.requestType)}
                        </Badge>
                      </td>
                      <td>{request.requestDate}</td>
                      <td>{request.preferredDate}</td>
                      <td>
                        <Badge bg={getStatusBadgeVariant(request.status)}>
                          {getStatusText(request.status)}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Xem chi tiết</Tooltip>}
                          >
                            <Button
                              variant="outline-info"
                              size="sm"
                              onClick={() => showRequestDetail(request)}
                            >
                              <FaEye />
                            </Button>
                          </OverlayTrigger>
                          
                          {request.status === 'pending' && (
                            <>
                              <OverlayTrigger
                                placement="top"
                                overlay={<Tooltip>Duyệt đơn</Tooltip>}
                              >
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  onClick={() => showApprovalConfirm(request, 'approve')}
                                >
                                  <FaCheck />
                                </Button>
                              </OverlayTrigger>
                              
                              <OverlayTrigger
                                placement="top"
                                overlay={<Tooltip>Từ chối</Tooltip>}
                              >
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => showApprovalConfirm(request, 'reject')}
                                >
                                  <FaTimes />
                                </Button>
                              </OverlayTrigger>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Detail Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaUser className="me-2" />
            Chi tiết đơn hiến máu #{selectedRequest?.id}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest && (
            <Tabs defaultActiveKey="personal" className="mb-3">
              <Tab eventKey="personal" title={
                <span><FaUser className="me-2" />Thông tin cá nhân</span>
              }>
                <Row>
                  <Col md={6}>
                    <div className="info-item mb-3">
                      <strong>Họ và tên:</strong>
                      <span className="ms-2">{selectedRequest.requesterName}</span>
                    </div>
                    <div className="info-item mb-3">
                      <strong>Email:</strong>
                      <span className="ms-2">{selectedRequest.requesterEmail}</span>
                    </div>                    <div className="info-item mb-3">
                      <strong>Số điện thoại:</strong>
                      <span className="ms-2">{selectedRequest.requesterPhone}</span>
                    </div>
                    <div className="info-item mb-3">
                      <strong>CCCD/CMND:</strong>
                      <span className="ms-2">{selectedRequest.idCard}</span>
                    </div>
                  </Col>
                  <Col md={6}>                    <div className="info-item mb-3">
                      <strong>Nhóm máu:</strong>
                      <Badge bg="danger" className="ms-2">
                        {selectedRequest.bloodType}
                      </Badge>
                    </div>
                    <div className="info-item mb-3">
                      <strong>Loại đơn:</strong>
                      <Badge bg={getRequestTypeBadgeVariant(selectedRequest.requestType)} className="ms-2">
                        {getRequestTypeText(selectedRequest.requestType)}
                      </Badge>
                    </div>
                    <div className="info-item mb-3">
                      <strong>Ngày đăng ký:</strong>
                      <span className="ms-2">{selectedRequest.requestDate}</span>
                    </div>
                    <div className="info-item mb-3">
                      <strong>Ngày mong muốn:</strong>
                      <span className="ms-2">{selectedRequest.preferredDate}</span>
                    </div>
                  </Col>
                </Row>                <div className="info-item mb-3">
                  <strong>Địa chỉ:</strong>
                  <span className="ms-2">{selectedRequest.location}</span>
                </div>
                <div className="info-item mb-3">
                  <strong>Ghi chú:</strong>
                  <p className="mt-2">{selectedRequest.notes}</p>
                </div>
                {selectedRequest.status === 'rejected' && selectedRequest.rejectReason && (
                  <Alert variant="danger">
                    <strong>Lý do từ chối:</strong> {selectedRequest.rejectReason}
                  </Alert>
                )}
              </Tab>
              
              <Tab eventKey="health" title={
                <span><FaMedkit className="me-2" />Thông tin sức khỏe</span>
              }>                <Row>
                  <Col md={4}>
                    <div className="info-item mb-3">
                      <strong>Cân nặng:</strong>
                      <span className="ms-2">{selectedRequest.healthInfo.weight}</span>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="info-item mb-3">
                      <strong>Chiều cao:</strong>
                      <span className="ms-2">{selectedRequest.healthInfo.height}</span>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="info-item mb-3">
                      <strong>Lần hiến máu cuối:</strong>
                      <span className="ms-2">{selectedRequest.healthInfo.lastDonation}</span>
                    </div>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6}>
                    <div className="info-item mb-3">
                      <strong>Bệnh mãn tính:</strong>
                      <span className="ms-2">{selectedRequest.healthInfo.chronicDiseases}</span>
                    </div>
                  </Col>                </Row>
              </Tab>
              
              <Tab eventKey="emergency" title={
                <span><FaPhone className="me-2" />Thông tin người thân</span>
              }>
                <div className="mt-3">
                  {selectedRequest.emergencyContact ? (
                    <Row>
                      <Col md={4}>
                        <div className="info-item mb-3">
                          <strong>Họ và tên:</strong>
                          <span className="ms-2">{selectedRequest.emergencyContact.name}</span>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="info-item mb-3">
                          <strong>Mối quan hệ:</strong>
                          <span className="ms-2">{selectedRequest.emergencyContact.relationship}</span>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="info-item mb-3">
                          <strong>Số điện thoại:</strong>
                          <span className="ms-2">{selectedRequest.emergencyContact.phone}</span>
                        </div>
                      </Col>
                    </Row>
                  ) : (
                    <div className="text-muted text-center">
                      Chưa có thông tin người thân
                    </div>
                  )}
                </div>
              </Tab>
            </Tabs>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Đóng
          </Button>
          {selectedRequest?.status === 'pending' && (
            <>
              <Button 
                variant="success" 
                onClick={() => {
                  setShowDetailModal(false);
                  showApprovalConfirm(selectedRequest, 'approve');
                }}
              >
                <FaCheck className="me-2" />
                Duyệt đơn
              </Button>
              <Button 
                variant="danger"
                onClick={() => {
                  setShowDetailModal(false);
                  showApprovalConfirm(selectedRequest, 'reject');
                }}
              >
                <FaTimes className="me-2" />
                Từ chối
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>

      {/* Approval Confirmation Modal */}
      <Modal show={showApprovalModal} onHide={() => setShowApprovalModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {approvalAction === 'approve' ? (
              <>
                <FaCheck className="me-2 text-success" />
                Xác nhận duyệt đơn
              </>
            ) : (
              <>
                <FaTimes className="me-2 text-danger" />
                Xác nhận từ chối
              </>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Bạn có chắc chắn muốn {approvalAction === 'approve' ? 'duyệt' : 'từ chối'} đơn hiến máu của{' '}
            <strong>{selectedRequest?.requesterName}</strong>?
          </p>
          
          {approvalAction === 'reject' && (
            <Form.Group className="mt-3">
              <Form.Label>Lý do từ chối *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Nhập lý do từ chối đơn hiến máu..."
              />
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowApprovalModal(false)}>
            Hủy
          </Button>
          <Button 
            variant={approvalAction === 'approve' ? 'success' : 'danger'}
            onClick={handleApproval}
          >
            {approvalAction === 'approve' ? 'Xác nhận duyệt' : 'Xác nhận từ chối'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ApproveDonationRequests;
