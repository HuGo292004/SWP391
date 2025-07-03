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
  OverlayTrigger,
  Tooltip,
  Spinner
} from 'react-bootstrap';
import { 
  FaSearch, 
  FaCheck, 
  FaTimes, 
  FaEye, 
  FaUser, 
  FaCalendarAlt, 
  FaHeart, 
  FaShieldAlt,
  FaFilter,
  FaClock,
  FaMapMarkerAlt,
  FaEnvelope,
  FaIdCard,
  FaSync
} from 'react-icons/fa';
import { bloodDonationApi } from '../../services/bloodDonationApi';

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
  const [showAlert, setShowAlert] = useState({ show: false, message: '', type: 'success' });

  // Load requests when component mounts
  useEffect(() => {
    loadRequests();
  }, []);

  // Show alert message
  const showMessage = (message, type = 'success') => {
    setShowAlert({ show: true, message, type });
    setTimeout(() => setShowAlert({ show: false, message: '', type: 'success' }), 5000);
  };

  // Handle API errors
  const handleApiError = (error, defaultMessage = 'Đã xảy ra lỗi') => {
    console.error('API Error:', error);
    let errorMessage = defaultMessage;
    
    if (error.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    showMessage(errorMessage, 'danger');
  };

  // Load blood donation requests from API
  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await bloodDonationApi.getAllBloodDonations();
      
      // Format data to match UI structure
      const formattedRequests = Array.isArray(data) ? data.map(formatBloodDonationData) : [];
      setRequests(formattedRequests);
      
    } catch (error) {
      handleApiError(error, 'Không thể tải danh sách đơn hiến máu');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // Format blood donation data from API
  const formatBloodDonationData = (donation) => {
    return {
      id: donation.donationId || donation.id || donation.ID,
      requesterId: donation.donorId || donation.userID || donation.UserID,
      requesterName: donation.fullName || donation.donorName || donation.name || 'N/A',
      requesterEmail: donation.email || 'N/A',
      requesterPhone: donation.phoneNumber || donation.phone || 'Chưa cập nhật',
      idCard: donation.userIdCard || donation.idCard || 'Chưa cập nhật',
      bloodType: donation.bloodType || 'N/A',
      requestType: donation.isEmergency ? 'emergency' : 'regular',
      requestDate: donation.registrationDate || donation.requestDate || donation.createdDate || '',
      preferredDate: donation.donationDate || donation.preferredDate || '',
      location: donation.address || donation.location || 'N/A',
      status: mapApiStatus(donation.status),
      healthInfo: {
        weight: donation.weight || 'N/A',
        height: donation.height || 'N/A',
        lastDonation: donation.lastDonationDate || 'N/A',
        chronicDiseases: donation.chronicDiseases || 'Không',
        currentMedications: donation.currentMedications || donation.notes || 'Không',
        allergies: donation.allergies || 'Không'
      },
      emergencyContact: donation.emergencyContact || {},
      notes: donation.notes || donation.requestDescription || '',
      rejectReason: donation.rejectReason || '',
      dateOfBirth: donation.dateOfBirth || '',
      role: donation.role || ''
    };
  };

  // Map API status to UI status
  const mapApiStatus = (apiStatus) => {
    if (!apiStatus) return 'pending';
    
    const status = apiStatus.toLowerCase();
    switch (status) {
      case 'pending':
      case 'waiting':
      case 'submitted':
        return 'pending';
      case 'approved':
      case 'accepted':
        return 'approved';
      case 'rejected':
      case 'declined':
        return 'rejected';
      default:
        return 'pending';
    }
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
      showMessage('Vui lòng nhập lý do từ chối', 'danger');
      return;
    }

    setLoading(true);
    try {
      if (approvalAction === 'approve') {
        // Call approve API
        const approvalData = {
          id: selectedRequest.id,
          donorId: selectedRequest.requesterId,
          approvedDate: new Date().toISOString(),
          notes: 'Đã duyệt đơn hiến máu'
        };
        
        await bloodDonationApi.approveBloodDonation(approvalData);
        showMessage('Đã duyệt đơn hiến máu thành công', 'success');
        
      } else if (approvalAction === 'reject') {
        // Call reject API
        const rejectionData = {
          id: selectedRequest.id,
          donorId: selectedRequest.requesterId,
          rejectionReason: rejectReason,
          rejectedDate: new Date().toISOString()
        };
        
        await bloodDonationApi.rejectBloodDonation(rejectionData);
        showMessage('Đã từ chối đơn hiến máu', 'warning');
      }

      // Reload requests to get updated data
      await loadRequests();
      
    } catch (error) {
      handleApiError(error, 'Lỗi khi xử lý đơn hiến máu');
    } finally {
      setLoading(false);
      setShowApprovalModal(false);
      setSelectedRequest(null);
      setRejectReason('');
    }
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
            <div>
              <Button 
                variant="outline-primary" 
                onClick={loadRequests}
                disabled={loading}
                className="d-flex align-items-center"
              >
                <FaSync className={`me-2 ${loading ? 'fa-spin' : ''}`} />
                {loading ? 'Đang tải...' : 'Làm mới'}
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Alert Messages */}
      {showAlert.show && (
        <Row className="mb-3">
          <Col>
            <Alert 
              variant={showAlert.type} 
              dismissible 
              onClose={() => setShowAlert({ show: false, message: '', type: 'success' })}
            >
              {showAlert.message}
            </Alert>
          </Col>
        </Row>
      )}

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
            <Table striped hover className="mb-0">
              <thead>
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
                  </tr>
                ) : filteredRequests.length === 0 ? (
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
                          {request.requesterPhone && request.requesterPhone !== 'N/A' && request.requesterPhone !== 'Chưa cập nhật' && (
                            <>
                              <br />
                              <small className="text-muted">{request.requesterPhone}</small>
                            </>
                          )}
                        </div>
                      </td>
                      <td>
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
            <div className="mb-3">
              <Row>
                <Col md={6}>
                  <div className="info-item mb-3">
                    <strong>Họ và tên:</strong>
                    <span className="ms-2">{selectedRequest.requesterName}</span>
                  </div>
                  <div className="info-item mb-3">
                    <strong>Email:</strong>
                    <span className="ms-2">{selectedRequest.requesterEmail}</span>
                  </div>
                  <div className="info-item mb-3">
                    <strong>Số điện thoại:</strong>
                    <span className="ms-2">
                      {selectedRequest.requesterPhone && selectedRequest.requesterPhone !== 'Chưa cập nhật' && selectedRequest.requesterPhone !== 'N/A' 
                        ? selectedRequest.requesterPhone 
                        : 'Chưa cập nhật'}
                    </span>
                  </div>
                  <div className="info-item mb-3">
                    <strong>CCCD/CMND:</strong>
                    <span className="ms-2">
                      {selectedRequest.idCard && selectedRequest.idCard !== 'Chưa cập nhật' && selectedRequest.idCard !== 'N/A'
                        ? selectedRequest.idCard
                        : 'Chưa cập nhật'}
                    </span>
                  </div>
                  {selectedRequest.dateOfBirth && (
                    <div className="info-item mb-3">
                      <strong>Ngày sinh:</strong>
                      <span className="ms-2">{selectedRequest.dateOfBirth}</span>
                    </div>
                  )}
                </Col>
                <Col md={6}>
                  <div className="info-item mb-3">
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
              </Row>
              <div className="info-item mb-3">
                <strong>Địa chỉ:</strong>
                <span className="ms-2">{selectedRequest.location}</span>
              </div>
              <div className="info-item mb-3">
                <strong>Tiền sử bệnh lý và thuốc đang sử dụng:</strong>
                <p className="mt-2">{selectedRequest.notes}</p>
              </div>
              {selectedRequest.status === 'rejected' && selectedRequest.rejectReason && (
                <Alert variant="danger">
                  <strong>Lý do từ chối:</strong> {selectedRequest.rejectReason}
                </Alert>
              )}
            </div>
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
          <Button 
            variant="secondary" 
            onClick={() => setShowApprovalModal(false)}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button 
            variant={approvalAction === 'approve' ? 'success' : 'danger'}
            onClick={handleApproval}
            disabled={loading}
            className="d-flex align-items-center"
          >
            {loading && <Spinner size="sm" className="me-2" />}
            {approvalAction === 'approve' ? 'Xác nhận duyệt' : 'Xác nhận từ chối'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ApproveDonationRequests;
