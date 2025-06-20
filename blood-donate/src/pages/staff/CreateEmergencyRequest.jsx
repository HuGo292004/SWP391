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

const CreateEmergencyRequest = () => {  const [formData, setFormData] = useState({
    patientName: '',
    patientAge: '',
    patientGender: '',
    bloodType: '',
    unitsNeeded: '',
    doctorName: '',
    contactPhone: '',
    medicalCondition: '',
    deadline: '',
    additionalNotes: ''
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [savedRequests, setSavedRequests] = useState([
    {
      id: 1,
      patientName: 'Nguyễn Văn A',
      bloodType: 'O-',
      unitsNeeded: 3,
      urgencyLevel: 'critical',
      hospital: 'Bệnh viện Chợ Rẫy',
      deadline: '2024-12-16 14:00',
      status: 'active',
      createdAt: '2024-12-15 10:30'
    },
    {
      id: 2,
      patientName: 'Trần Thị B',
      bloodType: 'AB+',
      unitsNeeded: 2,
      urgencyLevel: 'high',
      hospital: 'Bệnh viện Bạch Mai',
      deadline: '2024-12-17 09:00',
      status: 'fulfilled',
      createdAt: '2024-12-15 08:15'
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
    const requiredFields = ['patientName', 'bloodType', 'unitsNeeded', 'doctorName', 'contactPhone', 'deadline'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      alert('Vui lòng điền đầy đủ các trường bắt buộc');
      return;
    }    // Create new request
    const newRequest = {
      id: savedRequests.length + 1,
      patientName: formData.patientName,
      bloodType: formData.bloodType,
      unitsNeeded: parseInt(formData.unitsNeeded),
      urgencyLevel: 'high', // Default urgency level for all emergency requests
      hospital: 'N/A', // Default value since hospital info is removed
      deadline: formData.deadline,
      status: 'active',
      createdAt: new Date().toLocaleString('vi-VN'),
      ...formData
    };

    setSavedRequests(prev => [newRequest, ...prev]);
    setShowSuccess(true);    // Reset form
    setFormData({
      patientName: '',
      patientAge: '',
      patientGender: '',
      bloodType: '',
      unitsNeeded: '',
      doctorName: '',
      contactPhone: '',
      medicalCondition: '',
      deadline: '',
      additionalNotes: ''
    });

    setTimeout(() => setShowSuccess(false), 3000);
  };

  const getUrgencyBadgeVariant = (level) => {
    switch (level) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'info';
      default: return 'secondary';
    }
  };

  const getUrgencyText = (level) => {
    switch (level) {
      case 'critical': return 'Cấp cứu';
      case 'high': return 'Khẩn cấp';
      case 'medium': return 'Ưu tiên';
      default: return 'Bình thường';
    }
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
      case 'active': return 'Đang tìm';
      case 'fulfilled': return 'Đã có máu';
      case 'expired': return 'Hết hạn';
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
                {/* Patient Information */}
                <div className="mb-4">
                  <h6 className="text-primary mb-3">
                    <FaUser className="me-2" />
                    Thông tin bệnh nhân
                  </h6>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Họ và tên bệnh nhân *</Form.Label>
                        <Form.Control
                          type="text"
                          name="patientName"
                          value={formData.patientName}
                          onChange={handleInputChange}
                          placeholder="Nhập họ tên bệnh nhân"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group className="mb-3">
                        <Form.Label>Tuổi</Form.Label>
                        <Form.Control
                          type="number"
                          name="patientAge"
                          value={formData.patientAge}
                          onChange={handleInputChange}
                          placeholder="Tuổi"
                          min="1"
                          max="120"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group className="mb-3">
                        <Form.Label>Giới tính</Form.Label>
                        <Form.Select
                          name="patientGender"
                          value={formData.patientGender}
                          onChange={handleInputChange}
                        >
                          <option value="">Chọn giới tính</option>
                          <option value="male">Nam</option>
                          <option value="female">Nữ</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                {/* Blood Requirements */}
                <div className="mb-4">
                  <h6 className="text-primary mb-3">
                    <FaHeart className="me-2" />
                    Yêu cầu về máu
                  </h6>                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Nhóm máu *</Form.Label>
                        <Form.Select
                          name="bloodType"
                          value={formData.bloodType}
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
                        <Form.Label>Số đơn vị cần *</Form.Label>
                        <Form.Control
                          type="number"
                          name="unitsNeeded"
                          value={formData.unitsNeeded}
                          onChange={handleInputChange}
                          placeholder="Số đơn vị"
                          min="1"
                          required
                        />
                      </Form.Group>
                    </Col>                  </Row>
                </div>

                {/* Contact Information */}
                <div className="mb-4">
                  <h6 className="text-primary mb-3">
                    <FaPhone className="me-2" />
                    Thông tin liên hệ
                  </h6>
                  <Row>                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Nhân viên phụ trách *</Form.Label>
                        <Form.Control
                          type="text"
                          name="doctorName"
                          value={formData.doctorName}
                          onChange={handleInputChange}
                          placeholder="Tên nhân viên"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Số điện thoại liên hệ *</Form.Label>
                        <Form.Control
                          type="tel"
                          name="contactPhone"
                          value={formData.contactPhone}
                          onChange={handleInputChange}
                          placeholder="Số điện thoại"
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                {/* Medical Details */}
                <div className="mb-4">
                  <h6 className="text-primary mb-3">
                    <FaMedkit className="me-2" />
                    Chi tiết y tế
                  </h6>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Tình trạng bệnh lý</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          name="medicalCondition"
                          value={formData.medicalCondition}
                          onChange={handleInputChange}
                          placeholder="Mô tả tình trạng bệnh lý của bệnh nhân"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Ghi chú thêm</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          name="additionalNotes"
                          value={formData.additionalNotes}
                          onChange={handleInputChange}
                          placeholder="Thông tin bổ sung khác"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                {/* Deadline */}
                <div className="mb-4">
                  <h6 className="text-primary mb-3">
                    <FaClock className="me-2" />
                    Thời hạn
                  </h6>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Thời hạn cần máu *</Form.Label>
                        <Form.Control
                          type="datetime-local"
                          name="deadline"
                          value={formData.deadline}
                          onChange={handleInputChange}
                          required
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
                    <div key={request.id} className="request-item mb-3 p-3 border rounded">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <strong>{request.patientName}</strong>
                        <Badge bg={getStatusBadgeVariant(request.status)}>
                          {getStatusText(request.status)}
                        </Badge>
                      </div>                      <div className="mb-1">
                        <Badge bg="danger" className="me-2">{request.bloodType}</Badge>
                        <Badge bg="warning">Khẩn cấp</Badge>
                      </div>
                      <div className="small text-muted mb-2">
                        <div>Cần: {request.unitsNeeded} đơn vị</div>
                        <div>Hạn: {request.deadline}</div>
                        <div>Tạo: {request.createdAt}</div>
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
            
            <Row>
              <Col md={6}>
                <div className="mb-3">
                  <strong>Bệnh nhân:</strong> {formData.patientName || 'Chưa nhập'}
                </div>
                <div className="mb-3">
                  <strong>Tuổi:</strong> {formData.patientAge || 'Chưa nhập'}
                </div>
                <div className="mb-3">
                  <strong>Nhóm máu:</strong> 
                  {formData.bloodType && (
                    <Badge bg="danger" className="ms-2">{formData.bloodType}</Badge>
                  )}
                </div>
                <div className="mb-3">
                  <strong>Số đơn vị cần:</strong> {formData.unitsNeeded || 'Chưa nhập'}
                </div>
              </Col>              <Col md={6}>
                <div className="mb-3">
                  <strong>Nhân viên phụ trách:</strong> {formData.doctorName || 'Chưa nhập'}
                </div>
                <div className="mb-3">
                  <strong>SĐT liên hệ:</strong> {formData.contactPhone || 'Chưa nhập'}
                </div>
                <div className="mb-3">
                  <strong>Thời hạn:</strong> {formData.deadline || 'Chưa nhập'}
                </div>
              </Col>
            </Row>

            {formData.medicalCondition && (
              <div className="mb-3">
                <strong>Tình trạng bệnh lý:</strong>
                <p className="mt-1">{formData.medicalCondition}</p>
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
