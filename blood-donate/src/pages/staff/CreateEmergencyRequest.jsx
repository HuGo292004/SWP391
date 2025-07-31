// Import các thư viện React và hooks cần thiết
import React, { useState, useEffect, useRef } from "react";

// Import các component từ React Bootstrap
import {
  Container, // Container layout
  Row, // Row grid
  Col, // Column grid
  Card, // Card component
  Form, // Form component
  Button, // Button component
  Alert, // Alert component
  Badge, // Badge component
  Modal, // Modal component
  Table, // Table component
  Spinner, // Loading spinner
} from "react-bootstrap";

// Import các icon từ Font Awesome
import {
  FaExclamationTriangle, // Icon cảnh báo
  FaHeart, // Icon trái tim
  FaMedkit, // Icon y tế
  FaUser, // Icon người dùng
  FaPhone, // Icon điện thoại
  FaCalendarAlt, // Icon lịch
  FaClock, // Icon đồng hồ
  FaSave, // Icon lưu
  FaPlus, // Icon thêm
  FaEye, // Icon xem
  FaEdit,
  FaTrash,
  FaSearch,
} from "react-icons/fa";
import {
  searchUserByIdCard,
  createEmergencyRequest,
  getAllBloodRequests,
  getBloodTypeId,
  cleanupTokens,
  refreshAuthToken,
  getAvailableQuantityByBloodType,
} from "../../services/emergencyRequestApi";
import "../../styles/EmergencyRequest.css";

const CreateEmergencyRequest = () => {
  const [formData, setFormData] = useState({
    patientName: "",
    email: "",
    userIdCard: "",
    phone: "",
    dateOfBirth: "",
    bloodTypeRequired: "",
    quantityNeeded: "",
    urgencyLevel: "HIGH", // Default to HIGH for emergency
    medicalCondition: "",
    contactInfo: "",
    description: "",
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchingUser, setIsSearchingUser] = useState(false);
  const [userFound, setUserFound] = useState(null);
  // const [savedRequests, setSavedRequests] = useState([]); // Removed: no emergency list
  const [authStatus, setAuthStatus] = useState("checking"); // checking, authenticated, unauthenticated

  const modalRef = useRef(null);

  // Removed debug useEffect for showPreview

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const validToken = cleanupTokens();

      if (validToken) {
        setAuthStatus("authenticated");
      } else {
        setAuthStatus("unauthenticated");
      }
    };

    checkAuth();

    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener("storage", handleStorageChange);

    // Also check periodically in case token is set by JavaScript
    const intervalId = setInterval(checkAuth, 2000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(intervalId);
    };
  }, []);

  // Removed: loadRecentRequests and related useEffect (no emergency list)

  // Refresh authentication token
  const handleRefreshAuth = async () => {
    setAuthStatus("checking");
    try {
      const newToken = await refreshAuthToken();
      if (newToken) {
        setAuthStatus("authenticated");
        setErrorMessage("");
        setShowError(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        setAuthStatus("unauthenticated");
        setErrorMessage("Không thể làm mới token. Vui lòng đăng nhập lại.");
        setShowError(true);
      }
    } catch (error) {
      setAuthStatus("unauthenticated");
      setErrorMessage("Lỗi khi làm mới xác thực: " + error.message);
      setShowError(true);
    }
  };

  // Search user by ID Card
  const handleSearchUser = async () => {
    if (!formData.userIdCard) {
      setErrorMessage("Vui lòng nhập số CCCD/CMND");
      setShowError(true);
      return;
    }

    setIsSearchingUser(true);
    try {
      const user = await searchUserByIdCard(formData.userIdCard);
      if (user) {
        // User found - auto-fill form
        setUserFound(user);
        setFormData((prev) => ({
          ...prev,
          patientName: user.fullName || "",
          email: user.email || "",
          phone: user.phone || "",
          dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
        }));
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        // User not found or auth issue
        setUserFound(null);
        setErrorMessage(
          "Không tìm thấy tài khoản với CCCD/CMND này hoặc bạn chưa đăng nhập. Hệ thống sẽ tự động tạo tài khoản mới khi tạo yêu cầu."
        );
        setShowError(true);
        setTimeout(() => setShowError(false), 5000);
      }
    } catch (error) {
      setErrorMessage(error.message || "Lỗi khi tìm kiếm thông tin người dùng");
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    } finally {
      setIsSearchingUser(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Reset user found status when ID card changes
    if (name === "userIdCard") {
      setUserFound(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate required fields
    const requiredFields = [
      "patientName",
      "email",
      "userIdCard",
      "phone",
      "dateOfBirth",
      "bloodTypeRequired",
      "quantityNeeded",
    ];
    const missingFields = requiredFields.filter((field) => !formData[field]);
    if (missingFields.length > 0) {
      setErrorMessage("Vui lòng điền đầy đủ các trường bắt buộc");
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    setIsLoading(true);
    try {
      // 1. Lấy bloodTypeId và số lượng cần
      const bloodTypeId = getBloodTypeId(formData.bloodTypeRequired);
      const quantityNeeded = parseInt(formData.quantityNeeded);

      // 2. Kiểm tra số lượng máu trong kho
      const availableQuantity = await getAvailableQuantityByBloodType(
        bloodTypeId
      );

      // 3. Xác định trạng thái
      let status = "Opened";
      if (availableQuantity >= quantityNeeded) {
        status = "Pending";
      }

      // 4. Chuẩn bị dữ liệu gửi lên API
      const requestData = {
        patientName: formData.patientName,
        email: formData.email,
        userIdCard: formData.userIdCard,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        bloodTypeRequired: bloodTypeId, // Convert to blood type ID
        quantityNeeded,
        urgencyLevel: "HIGH",
        medicalCondition: formData.description,
        contactInfo: formData.phone,
        description: formData.description,
        status, // Thêm trạng thái vào request
      };

      const result = await createEmergencyRequest(requestData);
      if (result) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        // Reset form
        setFormData({
          patientName: "",
          email: "",
          userIdCard: "",
          phone: "",
          dateOfBirth: "",
          bloodTypeRequired: "",
          quantityNeeded: "",
          urgencyLevel: "HIGH",
          medicalCondition: "",
          contactInfo: "",
          description: "",
        });
        setUserFound(null);
      }
    } catch (error) {
      setErrorMessage("Lỗi khi tạo yêu cầu khẩn cấp: " + error.message);
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // Removed: getStatusBadgeVariant, getStatusText, formatDate (no emergency list)

  return (
    <Container fluid className="p-4">
      {/* Header */}
      <Row justify="center" className="mb-4">
        <Col>
          <div style={{ textAlign: "center" }}>
            <h2 className="text-danger mb-2">
              <FaExclamationTriangle className="me-2" />
              Tạo Yêu Cầu Hiến Máu Khẩn Cấp
            </h2>
            <p className="text-muted mb-0">
              Tạo yêu cầu hiến máu khẩn cấp cho các trường hợp cần máu gấp
            </p>
          </div>
        </Col>
      </Row>

      {/* Success Alert */}
      {showSuccess && (
        <Alert
          variant="success"
          dismissible
          onClose={() => setShowSuccess(false)}
        >
          <FaHeart className="me-2" />
          {userFound
            ? "Đã tìm thấy thông tin người dùng và tự động điền vào form!"
            : "Yêu cầu khẩn cấp đã được tạo thành công!"}
        </Alert>
      )}

      {/* Error Alert */}
      {showError && (
        <Alert
          variant="warning"
          dismissible
          onClose={() => setShowError(false)}
        >
          <FaExclamationTriangle className="me-2" />
          {errorMessage}
        </Alert>
      )}

      {/* Info Alert for Authentication */}
      {authStatus === "unauthenticated" && (
        <Alert variant="warning" className="mb-4">
          <FaExclamationTriangle className="me-2" />
          <strong>Cảnh báo:</strong> Bạn chưa đăng nhập hoặc token không hợp lệ.
          Vui lòng đăng nhập lại.
          <div className="mt-2">
            <Button
              variant="outline-success"
              size="sm"
              className="me-2"
              onClick={handleRefreshAuth}
            >
              <FaHeart className="me-1" />
              Làm mới Token
            </Button>
            <Button
              variant="outline-primary"
              size="sm"
              className="me-2"
              onClick={() => {
                cleanupTokens();
                window.location.reload();
              }}
            >
              Làm sạch Token
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => window.location.reload()}
            >
              Làm mới trang
            </Button>
          </div>
        </Alert>
      )}

      <Row>
        {/* Form Section - now full width */}
        <Col lg={{ span: 8, offset: 2 }}>
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
                    <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label>Họ và tên bệnh nhân *</Form.Label>
                        <Form.Control
                          type="text"
                          name="patientName"
                          value={formData.patientName}
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
                        <Form.Label>Email *</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Nhập địa chỉ email"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>CCCD/CMND *</Form.Label>
                        <div className="d-flex gap-2">
                          <Form.Control
                            type="text"
                            name="userIdCard"
                            value={formData.userIdCard}
                            onChange={handleInputChange}
                            placeholder="Nhập số CCCD hoặc CMND"
                            required
                          />
                          <Button
                            variant="outline-primary"
                            onClick={handleSearchUser}
                            disabled={isSearchingUser || !formData.userIdCard}
                          >
                            {isSearchingUser ? (
                              <Spinner animation="border" size="sm" />
                            ) : (
                              <FaSearch />
                            )}
                          </Button>
                        </div>
                        {userFound && (
                          <Form.Text className="text-success">
                            ✓ Đã tìm thấy tài khoản: {userFound.fullName}
                          </Form.Text>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Số điện thoại *</Form.Label>
                        <Form.Control
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Nhập số điện thoại bệnh nhân"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Ngày sinh *</Form.Label>
                        <Form.Control
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
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
                        <Form.Label>Số lượng cần (ml) *</Form.Label>
                        <Form.Control
                          type="number"
                          name="quantityNeeded"
                          value={formData.quantityNeeded}
                          onChange={handleInputChange}
                          placeholder="Số ml (VD: 5000)"
                          min="100"
                          step="100"
                          required
                        />
                        <Form.Text className="text-muted">
                          Đơn vị tính: ml (1 đơn vị máu ≈ 450ml)
                        </Form.Text>
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
                <div className="d-flex justify-content-end gap-3">
                  <Button variant="danger" type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Spinner
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Đang tạo yêu cầu...
                      </>
                    ) : (
                      <>
                        <FaSave className="me-2" />
                        Tạo yêu cầu khẩn cấp
                      </>
                    )}
                  </Button>
                </div>
              </Form>

              {/* Xem trước ngoài form */}
              <div className="mt-3 d-flex justify-content-end gap-2">
                <Button
                  variant="outline-info"
                  type="button"
                  onClick={() => setShowPreview(true)}
                >
                  <FaEye className="me-2" />
                  Xem trước
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Preview Modal */}
      <Modal
        ref={modalRef}
        show={showPreview === true}
        onHide={() => setShowPreview(false)}
        size="lg"
        backdrop="static"
        keyboard={false}
        centered
        data-bs-backdrop="static"
        data-bs-keyboard="false"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FaEye className="me-2" />
            Xem trước yêu cầu khẩn cấp
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="p-3">
            <h5 className="text-danger mb-3">Thông tin yêu cầu khẩn cấp</h5>
            <div className="mb-3">
              <strong>Họ tên bệnh nhân:</strong>{" "}
              {formData.patientName || (
                <span className="text-muted">(Chưa nhập)</span>
              )}
            </div>
            <div className="mb-3">
              <strong>Email:</strong>{" "}
              {formData.email || (
                <span className="text-muted">(Chưa nhập)</span>
              )}
            </div>
            <div className="mb-3">
              <strong>Số điện thoại:</strong>{" "}
              {formData.phone || (
                <span className="text-muted">(Chưa nhập)</span>
              )}
            </div>
            <div className="mb-3">
              <strong>Ngày sinh:</strong>{" "}
              {formData.dateOfBirth || (
                <span className="text-muted">(Chưa nhập)</span>
              )}
            </div>
            <div className="mb-3">
              <strong>Nhóm máu cần:</strong>{" "}
              {formData.bloodTypeRequired || (
                <span className="text-muted">(Chưa chọn)</span>
              )}
            </div>
            <div className="mb-3">
              <strong>Số lượng cần:</strong>{" "}
              {formData.quantityNeeded ? (
                `${formData.quantityNeeded} ml (≈ ${Math.round(
                  formData.quantityNeeded / 450
                )} đơn vị)`
              ) : (
                <span className="text-muted">(Chưa nhập)</span>
              )}
            </div>
            <div className="mb-3">
              <strong>Mức độ khẩn cấp:</strong> <Badge bg="danger">HIGH</Badge>
            </div>
            <div className="mb-3">
              <strong>Mô tả chi tiết:</strong>{" "}
              {formData.description ? (
                <span>{formData.description}</span>
              ) : (
                <span className="text-muted">(Không có)</span>
              )}
            </div>
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
