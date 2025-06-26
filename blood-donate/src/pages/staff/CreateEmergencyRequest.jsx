import React, { useState } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Form, 
  Button, 
  Alert,
  Badge,
  Modal,
  Table
} from 'react-bootstrap';
import { 
  FaExclamationTriangle, 
  FaHeart, 
  FaMedkit, 
  FaUser,
  FaPhone,
  FaCalendarAlt,
  FaClock,
  FaSave,
  FaPlus,
  FaEye,
  FaEdit,
  FaTrash
} from 'react-icons/fa';

const CreateEmergencyRequest = () => {
  // Mock thông tin nhân viên hiện tại - trong thực tế sẽ lấy từ context hoặc API
  const currentStaff = {
    staffID: 'STF001',
    fullName: 'Nguyễn Văn Nam',
    position: 'Nhân viên y tế',
    phone: '0123456789',
    email: 'nguyen.van.nam@hospital.com'
  };

  const [formData, setFormData] = useState({
    recipientName: '',
    recipientCCCD: '',
    recipientBirthDate: '',
    recipientPhone: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    bloodTypeRequired: '',
    quantityNeeded: '',
    description: '',
    staffID: currentStaff.staffID, // Tự động gán
    staffName: currentStaff.fullName // Tự động gán
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [savedRequests, setSavedRequests] = useState([
    {
      requestID: 'REQ001',
      recipientID: 'RCP001',
      recipientName: 'Nguyễn Văn Đức',
      recipientCCCD: '001234567890',
      recipientBirthDate: '1985-03-15',
      recipientPhone: '0987654321',
      emergencyContactName: 'Nguyễn Thị Lan',
      emergencyContactPhone: '0912345678',
      bloodTypeRequired: 'O-',
      quantityNeeded: 3,
      requestDate: '2024-12-15 10:30',
      status: 'pending',
      description: 'Bệnh nhân cần máu khẩn cấp sau tai nạn giao thông',
      staffID: 'STF002',
      staffName: 'Trần Thị Lan',
      createdBy: 'Trần Thị Lan'
    },
    {
      requestID: 'REQ002',
      recipientID: 'RCP002',
      recipientName: 'Lê Thị Mai',
      recipientCCCD: '002345678901',
      recipientBirthDate: '1990-07-22',
      recipientPhone: '0123456789',
      emergencyContactName: 'Lê Văn Minh',
      emergencyContactPhone: '0934567890',
      bloodTypeRequired: 'AB+',
      quantityNeeded: 2,
      requestDate: '2024-12-15 08:15',
      status: 'fulfilled',
      description: 'Phẫu thuật tim cần máu AB+',
      staffID: 'STF001',
      staffName: 'Nguyễn Văn Nam',
      createdBy: 'Nguyễn Văn Nam'
    }
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate required fields
    const requiredFields = ['recipientName', 'recipientCCCD', 'recipientBirthDate', 'recipientPhone', 'emergencyContactName', 'emergencyContactPhone', 'bloodTypeRequired', 'quantityNeeded'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      alert('Vui lòng điền đầy đủ các trường bắt buộc');
      return;
    }

    // Auto-generate recipient ID
    const recipientID = `RCP${String(savedRequests.length + 1).padStart(3, '0')}`;

    // Create new request
    const newRequest = {
      requestID: `REQ${String(savedRequests.length + 1).padStart(3, '0')}`,
      recipientID: recipientID,
      recipientName: formData.recipientName,
      recipientCCCD: formData.recipientCCCD,
      recipientBirthDate: formData.recipientBirthDate,
      recipientPhone: formData.recipientPhone,
      emergencyContactName: formData.emergencyContactName,
      emergencyContactPhone: formData.emergencyContactPhone,
      bloodTypeRequired: formData.bloodTypeRequired,
      quantityNeeded: parseInt(formData.quantityNeeded),
      requestDate: new Date().toLocaleString('vi-VN'),
      status: 'pending',
      description: formData.description || 'Yêu cầu máu khẩn cấp',
      staffID: currentStaff.staffID,
      staffName: currentStaff.fullName,
      createdBy: currentStaff.fullName
    };

    setSavedRequests(prev => [newRequest, ...prev]);
    setShowSuccess(true);

    // Reset form
    setFormData({
      recipientName: '',
      recipientCCCD: '',
      recipientBirthDate: '',
      recipientPhone: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      bloodTypeRequired: '',
      quantityNeeded: '',
      description: '',
      staffID: currentStaff.staffID, // Giữ nguyên thông tin nhân viên
      staffName: currentStaff.fullName // Giữ nguyên thông tin nhân viên
    });

    setTimeout(() => setShowSuccess(false), 3000);
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'fulfilled': return 'primary';
      case 'expired': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'fulfilled': return 'Đã có máu';
      case 'cancelled': return 'Đã hủy';
      default: return 'Không xác định';
    }
  };

  return (
    <Container fluid className="p-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="text-danger mb-2">
                <FaExclamationTriangle className="me-2" />
                Tạo Yêu Cầu Hiến Máu Khẩn Cấp
              </h2>
              <p className="text-muted mb-0">Tạo yêu cầu hiến máu khẩn cấp cho các trường hợp cần máu gấp</p>
            </div>
          </div>
        </Col>
      </Row>

      {/* Success Alert */}
      {showSuccess && (
        <Alert variant="success" dismissible onClose={() => setShowSuccess(false)}>
          <FaHeart className="me-2" />
          Yêu cầu khẩn cấp đã được tạo thành công!
        </Alert>
      )}

      <Row>
        {/* Form Section */}
        <Col lg={8}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-danger text-white">
              <h5 className="mb-0">
                <FaPlus className="me-2" />
                Thông tin yêu cầu khẩn cấp
              </h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                {/* Staff Information - Auto-filled */}
                <div className="mb-4">
                  <h6 className="text-primary mb-3">
                    <FaUser className="me-2" />
                    Nhân viên trách nhiệm
                  </h6>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Mã nhân viên</Form.Label>
                        <Form.Control
                          type="text"
                          value={currentStaff.staffID}
                          disabled
                          style={{ backgroundColor: '#f8f9fa' }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Tên nhân viên</Form.Label>
                        <Form.Control
                          type="text"
                          value={currentStaff.fullName}
                          disabled
                          style={{ backgroundColor: '#f8f9fa' }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Chức vụ</Form.Label>
                        <Form.Control
                          type="text"
                          value={currentStaff.position}
                          disabled
                          style={{ backgroundColor: '#f8f9fa' }}
                        />
                      </Form.Group>
                    </Col>

                  </Row>
                </div>

                {/* Recipient Information */}
                <div className="mb-4">
                  <h6 className="text-primary mb-3">
                    <FaUser className="me-2" />
                    Thông tin bệnh nhân
                  </h6>
                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label>Họ và tên bệnh nhân *</Form.Label>
                        <Form.Control
                          type="text"
                          name="recipientName"
                          value={formData.recipientName}
                          onChange={handleInputChange}
                          placeholder="Nhập họ và tên đầy đủ của bệnh nhân"
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>CCCD/CMND *</Form.Label>
                        <Form.Control
                          type="text"
                          name="recipientCCCD"
                          value={formData.recipientCCCD}
                          onChange={handleInputChange}
                          placeholder="Nhập số CCCD hoặc CMND"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Ngày sinh *</Form.Label>
                        <Form.Control
                          type="date"
                          name="recipientBirthDate"
                          value={formData.recipientBirthDate}
                          onChange={handleInputChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Số điện thoại *</Form.Label>
                        <Form.Control
                          type="tel"
                          name="recipientPhone"
                          value={formData.recipientPhone}
                          onChange={handleInputChange}
                          placeholder="Nhập số điện thoại bệnh nhân"
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                {/* Emergency Contact Information */}
                <div className="mb-4">
                  <h6 className="text-primary mb-3">
                    <FaPhone className="me-2" />
                    Thông tin người thân
                  </h6>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Họ và tên người thân *</Form.Label>
                        <Form.Control
                          type="text"
                          name="emergencyContactName"
                          value={formData.emergencyContactName}
                          onChange={handleInputChange}
                          placeholder="Nhập họ và tên người thân"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Số điện thoại người thân *</Form.Label>
                        <Form.Control
                          type="tel"
                          name="emergencyContactPhone"
                          value={formData.emergencyContactPhone}
                          onChange={handleInputChange}
                          placeholder="Nhập số điện thoại người thân"
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                {/* Blood Requirements */}
                <div className="mb-4">
                  <h6 className="text-primary mb-3">
                    <FaHeart className="me-2" />
                    Yêu cầu về máu
                  </h6>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Nhóm máu cần *</Form.Label>
                        <Form.Select
                          name="bloodTypeRequired"
                          value={formData.bloodTypeRequired}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Chọn nhóm máu</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Số lượng cần *</Form.Label>
                        <Form.Control
                          type="number"
                          name="quantityNeeded"
                          value={formData.quantityNeeded}
                          onChange={handleInputChange}
                          placeholder="Số đơn vị"
                          min="1"
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <h6 className="text-primary mb-3">
                    <FaMedkit className="me-2" />
                    Mô tả yêu cầu
                  </h6>
                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label>Mô tả chi tiết</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={4}
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          placeholder="Mô tả chi tiết về yêu cầu máu (lý do, tình trạng bệnh nhân, ghi chú đặc biệt...)"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                {/* Action Buttons */}
                <div className="d-flex gap-3">
                  <Button 
                    variant="outline-info" 
                    type="button"
                    onClick={() => setShowPreview(true)}
                  >
                    <FaEye className="me-2" />
                    Xem trước
                  </Button>
                  <Button variant="danger" type="submit">
                    <FaSave className="me-2" />
                    Tạo yêu cầu khẩn cấp
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Recent Requests */}
        <Col lg={4}>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h6 className="mb-0">
                <FaClock className="me-2" />
                Yêu cầu gần đây
              </h6>
            </Card.Header>
            <Card.Body>
              {savedRequests.length === 0 ? (
                <div className="text-center text-muted">
                  Chưa có yêu cầu nào
                </div>
              ) : (
                <div className="request-list" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                  {savedRequests.map(request => (
                    <div key={request.requestID} className="request-item mb-3 p-3 border rounded">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <strong>{request.requestID}</strong>
                        <Badge bg={getStatusBadgeVariant(request.status)}>
                          {getStatusText(request.status)}
                        </Badge>
                      </div>
                      <div className="mb-1">
                        <Badge bg="danger" className="me-2">{request.bloodTypeRequired}</Badge>
                      </div>
                      <div className="small text-muted mb-2">
                        <div>Bệnh nhân: {request.recipientName}</div>
                        <div>CCCD: {request.recipientCCCD}</div>
                        <div>SĐT: {request.recipientPhone}</div>
                        <div>Người thân: {request.emergencyContactName}</div>
                        <div>SĐT người thân: {request.emergencyContactPhone}</div>
                        <div>Cần: {request.quantityNeeded} đơn vị</div>
                        <div>Tạo bởi: {request.createdBy}</div>
                        <div>Thời gian: {request.requestDate}</div>
                      </div>
                      <div className="d-flex gap-2">
                        <Button variant="outline-info" size="sm">
                          <FaEye />
                        </Button>
                        <Button variant="outline-warning" size="sm">
                          <FaEdit />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Preview Modal */}
      <Modal show={showPreview} onHide={() => setShowPreview(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaEye className="me-2" />
            Xem trước yêu cầu khẩn cấp
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="preview-content">
            <h5 className="text-danger mb-3">
              <FaExclamationTriangle className="me-2" />
              YÊU CẦU HIẾN MÁU KHẨN CẤP
            </h5>
            
            {/* Staff Information */}
            <div className="mb-4 p-3 bg-light rounded">
              <h6 className="text-primary mb-2">Nhân viên trách nhiệm</h6>
              <Row>
                <Col md={6}>
                  <div><strong>Mã NV:</strong> {currentStaff.staffID}</div>
                  <div><strong>Họ tên:</strong> {currentStaff.fullName}</div>
                </Col>
                <Col md={6}>
                  <div><strong>Chức vụ:</strong> {currentStaff.position}</div>
                </Col>
              </Row>
            </div>
            
            <Row>
              <Col md={6}>
                <div className="mb-3">
                  <strong>Họ và tên:</strong> {formData.recipientName || 'Chưa nhập'}
                </div>
                <div className="mb-3">
                  <strong>CCCD/CMND:</strong> {formData.recipientCCCD || 'Chưa nhập'}
                </div>
                <div className="mb-3">
                  <strong>Ngày sinh:</strong> {formData.recipientBirthDate || 'Chưa nhập'}
                </div>
                <div className="mb-3">
                  <strong>Số điện thoại:</strong> {formData.recipientPhone || 'Chưa nhập'}
                </div>
                <div className="mb-3">
                  <strong>Người thân:</strong> {formData.emergencyContactName || 'Chưa nhập'}
                </div>
                <div className="mb-3">
                  <strong>SĐT người thân:</strong> {formData.emergencyContactPhone || 'Chưa nhập'}
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <strong>Nhóm máu cần:</strong> 
                  {formData.bloodTypeRequired && (
                    <Badge bg="danger" className="ms-2">{formData.bloodTypeRequired}</Badge>
                  )}
                </div>
                <div className="mb-3">
                  <strong>Số lượng cần:</strong> {formData.quantityNeeded || 'Chưa nhập'} đơn vị
                </div>
                <div className="mb-3">
                  <strong>ID sẽ tự tạo:</strong> <Badge bg="info">Tự động</Badge>
                </div>
              </Col>
            </Row>

            {formData.description && (
              <div className="mb-3">
                <strong>Mô tả:</strong>
                <p className="mt-1">{formData.description}</p>
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPreview(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CreateEmergencyRequest;
