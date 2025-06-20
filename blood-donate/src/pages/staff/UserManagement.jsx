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
  Nav,
  Tab,
  Tabs,
  OverlayTrigger,
  Tooltip
} from 'react-bootstrap';
import { 
  FaSearch, 
  FaEdit, 
  FaEye, 
  FaUser, 
  FaUsers, 
  FaCog, 
  FaPhone, 
  FaHome, 
  FaIdCard, 
  FaCalendarAlt, 
  FaHeart, 
  FaMedkit, 
  FaShieldAlt,
  FaUserMd,
  FaUserFriends,
  FaChartBar,
  FaFilter,
  FaTimes,
  FaCheck
} from 'react-icons/fa';
import '../../styles/UserManagementBootstrap.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchType, setSearchType] = useState('fullName'); // 'fullName', 'username', 'idCard'
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterBloodType, setFilterBloodType] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showAlert, setShowAlert] = useState({ show: false, message: '', type: 'success' });
  
  // State cho modal xem chi tiết
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);

  // Hàm hiển thị thông báo
  const showMessage = (message, type = 'success') => {
    setShowAlert({ show: true, message, type });
    setTimeout(() => setShowAlert({ show: false, message: '', type: 'success' }), 3000);
  };

  // Mock data - chỉ hiển thị Staff và Member (không hiển thị Admin)
  const mockUsers = [
    {
      id: 2,
      username: 'staff01',
      email: 'staff01@blooddonate.com',
      fullName: 'Trần Thị Staff',
      role: 'Staff',
      status: 'active',
      createdAt: '2024-02-10',
      lastLogin: '2024-12-19',
      // Thông tin bổ sung
      phone: '0987654321',
      address: '123 Đường ABC, Quận 1, TP.HCM',
      dateOfBirth: '1990-05-15',
      gender: 'Nữ',
      idCard: '123456789012',
      bloodType: 'A+',
      emergencyContact: '0901234567',
      department: 'Phòng Kỹ thuật',
      position: 'Nhân viên',
      salary: '15,000,000 VND',
      startDate: '2024-02-10',
      permissions: ['Quản lý người dùng', 'Theo dõi hiến máu'],
      // Thông tin hiến máu cho Staff
      donationCount: 2,
      lastDonationDate: '2024-09-15',
      nextEligibleDate: '2024-12-15'
    },
    {
      id: 3,
      username: 'member01',
      email: 'member01@gmail.com',
      fullName: 'Lê Văn Member',
      role: 'Member',
      status: 'active',
      createdAt: '2024-03-05',
      lastLogin: '2024-12-18',
      // Thông tin bổ sung
      phone: '0912345678',
      address: '456 Đường XYZ, Quận 3, TP.HCM',
      dateOfBirth: '1995-08-20',
      gender: 'Nam',
      idCard: '987654321098',
      bloodType: 'O+',
      emergencyContact: '0908765432',
      weight: '70kg',
      height: '175cm',
      medicalHistory: 'Không có bệnh lý đặc biệt',
      donationCount: 5,
      lastDonationDate: '2024-10-15',
      nextEligibleDate: '2025-01-15'
    },
    {
      id: 4,
      username: 'member02',
      email: 'member02@gmail.com',
      fullName: 'Phạm Thị Hoa',
      role: 'Member',
      status: 'inactive',
      createdAt: '2024-04-12',
      lastLogin: '2024-11-20',
      // Thông tin bổ sung
      phone: '0923456789',
      address: '789 Đường DEF, Quận 7, TP.HCM',
      dateOfBirth: '1988-12-03',
      gender: 'Nữ',
      idCard: '456789123456',
      bloodType: 'B+',
      emergencyContact: '0934567890',
      weight: '55kg',
      height: '160cm',
      medicalHistory: 'Từng bị thiếu máu nhẹ',
      donationCount: 2,
      lastDonationDate: '2024-08-10',
      nextEligibleDate: '2024-11-10',
      reasonInactive: 'Tạm ngưng theo yêu cầu cá nhân'
    },
    {
      id: 5,
      username: 'staff02',
      email: 'staff02@blooddonate.com',
      fullName: 'Hoàng Văn Staff',
      role: 'Staff',
      status: 'active',
      createdAt: '2024-05-08',
      lastLogin: '2024-12-15',
      // Thông tin bổ sung cho Staff
      phone: '0945678912',
      address: '321 Đường Staff, Quận 5, TP.HCM',
      dateOfBirth: '1987-11-22',
      gender: 'Nam',
      idCard: '654321987654',
      bloodType: 'B+',
      emergencyContact: '0956789123',
      department: 'Phòng Hành chính',
      position: 'Trưởng phòng',
      salary: '20,000,000 VND',
      startDate: '2024-05-08',
      permissions: ['Quản lý tài khoản', 'Báo cáo thống kê'],
      // Thông tin hiến máu cho Staff
      donationCount: 4,
      lastDonationDate: '2024-11-05',
      nextEligibleDate: '2025-02-05'
    },
    {
      id: 6,
      username: 'member03',
      email: 'member03@gmail.com',
      fullName: 'Nguyễn Thị Mai',
      role: 'Member',
      status: 'active',
      createdAt: '2024-06-01',
      lastLogin: '2024-12-16',
      // Thông tin bổ sung cho Member
      phone: '0934567891',
      address: '159 Đường GHI, Quận 10, TP.HCM',
      dateOfBirth: '1992-03-14',
      gender: 'Nữ',
      idCard: '789123456789',
      bloodType: 'AB+',
      emergencyContact: '0967891234',
      weight: '52kg',
      height: '158cm',
      medicalHistory: 'Không có vấn đề sức khỏe',
      donationCount: 3,
      lastDonationDate: '2024-09-20',
      nextEligibleDate: '2024-12-20'
    },
    {
      id: 7,
      username: 'staff03',
      email: 'staff03@blooddonate.com',
      fullName: 'Lê Văn Nam',
      role: 'Staff',
      status: 'inactive',
      createdAt: '2024-07-15',
      lastLogin: '2024-10-30',
      // Thông tin bổ sung cho Staff
      phone: '0978912345',
      address: '753 Đường Staff3, Quận 4, TP.HCM',
      dateOfBirth: '1985-07-08',
      gender: 'Nam',
      idCard: '147258369147',
      bloodType: 'O-',
      emergencyContact: '0989123456',
      department: 'Phòng Y tế',
      position: 'Bác sĩ',
      salary: '25,000,000 VND',
      startDate: '2024-07-15',
      permissions: ['Khám sàng lọc', 'Tư vấn y tế'],
      reasonInactive: 'Nghỉ thai sản',
      donationCount: 1,
      lastDonationDate: '2024-06-20',
      nextEligibleDate: '2024-09-20'
    }
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Giả lập API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUsers(mockUsers);
    } catch (error) {
      showMessage('Không thể tải danh sách người dùng', 'danger');
    } finally {
      setLoading(false);
    }
  };
  const handleSearch = (value) => {
    setSearchText(value);
    console.log('Search triggered:', { searchType, value });
  };
  const handleSearchTypeChange = (type) => {
    console.log('Dropdown clicked, changing search type to:', type);
    setSearchType(type);
    console.log('Search type changed to:', type);
    // Clear search text when changing search type
    if (searchText) {
      setSearchText('');
      console.log('Search text cleared');
    }
  };

  const handleRoleFilter = (value) => {
    setFilterRole(value);
  };

  const handleStatusFilter = (value) => {
    setFilterStatus(value);
  };

  const handleBloodTypeFilter = (value) => {
    setFilterBloodType(value);
  };

  // Logic tìm kiếm và lọc
  const filteredUsers = users.filter(user => {
    let matchSearch = false;
    
    if (searchText) {
      switch (searchType) {
        case 'id':
          matchSearch = user.id.toString().includes(searchText);
          break;
        case 'fullName':
          matchSearch = user.fullName.toLowerCase().includes(searchText.toLowerCase());
          break;
        case 'username':
          matchSearch = user.username.toLowerCase().includes(searchText.toLowerCase());
          break;
        case 'idCard':
          matchSearch = user.idCard && user.idCard.includes(searchText);
          break;
        default:
          matchSearch = true;
      }
    } else {
      matchSearch = true;
    }

    const matchRole = filterRole === 'all' || user.role === filterRole;
    const matchStatus = filterStatus === 'all' || user.status === filterStatus;
    const matchBloodType = filterBloodType === 'all' || user.bloodType === filterBloodType;
    
    return matchSearch && matchRole && matchStatus && matchBloodType;
  });

  const showUserDetail = (user) => {
    setViewingUser(user);
    setShowDetailModal(true);
  };
  
  const handleDetailCancel = () => {
    setShowDetailModal(false);
    setViewingUser(null);
  };

  const showEditModal = (user) => {
    // Chỉ cho phép sửa thông tin Member, không cho phép sửa Staff
    if (user.role === 'Staff') {
      showMessage('Bạn không có quyền chỉnh sửa thông tin của Staff khác', 'warning');
      return;
    }
    
    setEditingUser(user);
    setShowModal(true);
  };

  const handleCancel = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const values = Object.fromEntries(formData.entries());
    
    try {
      // Xử lý dữ liệu trước khi lưu
      const processedValues = {
        ...values,
        // Xử lý weight và height - thêm đơn vị nếu cần
        weight: values.weight ? `${values.weight}kg` : '',
        height: values.height ? `${values.height}cm` : '',
        // Chuyển donationCount về number
        donationCount: parseInt(values.donationCount) || 0
      };
      
      // Chỉ cập nhật thông tin Member
      const updatedUsers = users.map(user => 
        user.id === editingUser.id ? { ...user, ...processedValues } : user
      );
      setUsers(updatedUsers);
      showMessage('Cập nhật thông tin người dùng thành công');
      setShowModal(false);
      setEditingUser(null);
    } catch (error) {
      showMessage('Có lỗi xảy ra khi cập nhật thông tin', 'danger');
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      // Tìm user để kiểm tra role
      const targetUser = users.find(user => user.id === userId);
      
      // Kiểm tra quyền: Staff không được vô hiệu hóa Staff khác
      if (targetUser && targetUser.role === 'Staff') {
        showMessage('Bạn không có quyền thay đổi trạng thái của Staff khác', 'warning');
        return;
      }
      
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const updatedUsers = users.map(user =>
        user.id === userId ? { ...user, status: newStatus } : user
      );
      setUsers(updatedUsers);
      showMessage(`${newStatus === 'active' ? 'Kích hoạt' : 'Vô hiệu hóa'} người dùng thành công`);
    } catch (error) {
      showMessage('Không thể thay đổi trạng thái người dùng', 'danger');
    }
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'Admin': return 'danger';
      case 'Staff': return 'primary';
      case 'Member': return 'success';
      default: return 'secondary';
    }
  };

  const getStatusBadgeVariant = (status) => {
    return status === 'active' ? 'success' : 'danger';
  };

  // Thống kê
  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    staff: users.filter(u => u.role === 'Staff').length,
    member: users.filter(u => u.role === 'Member').length,
  };

  // Debug useEffect
  useEffect(() => {
    console.log('Filter states updated:', { 
      searchType, 
      searchText, 
      filterRole, 
      filterStatus, 
      filterBloodType 
    });
  }, [searchType, searchText, filterRole, filterStatus, filterBloodType]);

  return (
    <Container fluid className="user-management-container">
      {/* Thông báo */}
      {showAlert.show && (
        <Alert variant={showAlert.type} className="mb-3" dismissible onClose={() => setShowAlert({ show: false, message: '', type: 'success' })}>
          {showAlert.message}
        </Alert>
      )}      {/* Header */}
      <div className="d-flex align-items-center justify-content-center mb-4">
        <FaUsers className="me-2 text-primary" size={28} />
        <h2 className="mb-0">Quản lý người dùng</h2>
      </div>

      {/* Thống kê */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3">
          <Card className="stats-card h-100">
            <Card.Body className="text-center">
              <div className="d-flex align-items-center justify-content-center mb-2">
                <FaUser className="me-2 text-primary" size={24} />
                <h5 className="mb-0">Tổng số người dùng</h5>
              </div>
              <h3 className="text-primary mb-0">{stats.total}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="stats-card h-100">
            <Card.Body className="text-center">
              <div className="d-flex align-items-center justify-content-center mb-2">
                <FaCheck className="me-2 text-success" size={24} />
                <h5 className="mb-0">Đang hoạt động</h5>
              </div>
              <h3 className="text-success mb-0">{stats.active}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="stats-card h-100">
            <Card.Body className="text-center">
              <div className="d-flex align-items-center justify-content-center mb-2">
                <FaUserMd className="me-2 text-info" size={24} />
                <h5 className="mb-0">Staff</h5>
              </div>
              <h3 className="text-info mb-0">{stats.staff}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="stats-card h-100">
            <Card.Body className="text-center">
              <div className="d-flex align-items-center justify-content-center mb-2">
                <FaUserFriends className="me-2 text-success" size={24} />
                <h5 className="mb-0">Member</h5>
              </div>
              <h3 className="text-success mb-0">{stats.member}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>      {/* Bộ lọc và tìm kiếm */}
      <Card className="search-filter-section mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col lg={5} md={12} className="mb-3 mb-lg-0">
              <InputGroup>
                <DropdownButton
                  variant="outline-secondary"
                  title={
                    searchType === 'id' ? 'ID' :
                    searchType === 'fullName' ? 'Họ và tên' :
                    searchType === 'username' ? 'Username' :
                    searchType === 'idCard' ? 'CMND/CCCD' :
                    'Chọn loại tìm kiếm'
                  }
                  id="search-type-dropdown"
                >
                  <Dropdown.Item 
                    onClick={() => handleSearchTypeChange('id')}
                    active={searchType === 'id'}
                  >
                    ID
                  </Dropdown.Item>
                  <Dropdown.Item 
                    onClick={() => handleSearchTypeChange('fullName')}
                    active={searchType === 'fullName'}
                  >
                    Họ và tên
                  </Dropdown.Item>                  <Dropdown.Item 
                    onClick={() => handleSearchTypeChange('username')}
                    active={searchType === 'username'}
                  >
                    Username
                  </Dropdown.Item>
                  <Dropdown.Item 
                    onClick={() => handleSearchTypeChange('idCard')}
                    active={searchType === 'idCard'}
                  >
                    CMND/CCCD
                  </Dropdown.Item>
                </DropdownButton>
                <Form.Control
                  type="text"
                  placeholder={
                    searchType === 'id' ? 'Nhập ID người dùng...' :
                    searchType === 'fullName' ? 'Nhập họ và tên...' :
                    searchType === 'username' ? 'Nhập username...' :
                    searchType === 'idCard' ? 'Nhập số CMND/CCCD...' :
                    'Nhập từ khóa tìm kiếm...'
                  }
                  value={searchText}
                  onChange={(e) => handleSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch(e.target.value)}
                />
                <Button variant="primary" onClick={() => handleSearch(searchText)}>
                  <FaSearch />
                </Button>
              </InputGroup>
            </Col>
            <Col lg={2} md={4} className="mb-3 mb-lg-0">
              <Form.Select value={filterRole} onChange={(e) => handleRoleFilter(e.target.value)}>
                <option value="all">Tất cả vai trò</option>
                <option value="Staff">Staff</option>
                <option value="Member">Member</option>
              </Form.Select>
            </Col>
            <Col lg={2} md={4} className="mb-3 mb-lg-0">
              <Form.Select value={filterStatus} onChange={(e) => handleStatusFilter(e.target.value)}>
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Không hoạt động</option>
              </Form.Select>
            </Col>
            <Col lg={3} md={4} className="mb-3 mb-lg-0">
              <Form.Select value={filterBloodType} onChange={(e) => handleBloodTypeFilter(e.target.value)}>
                <option value="all">Tất cả nhóm máu</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Bảng dữ liệu */}
      <Card>
        <Card.Body>
          <div className="table-responsive">
            <Table striped bordered hover className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên đăng nhập</th>
                  <th>Họ và tên</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th>Nhóm máu</th>
                  <th>Ngày có thể hiến máu gần nhất</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="text-center">
                      <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center text-muted">
                      Không có dữ liệu phù hợp
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.username}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FaUser className="me-2 text-muted" />
                          {user.fullName}
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <Badge bg={getRoleBadgeVariant(user.role)}>
                          {user.role}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={getStatusBadgeVariant(user.status)}>
                          {user.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                        </Badge>
                      </td>                      <td>
                        {user.role === 'Staff' ? (
                          <Badge bg="secondary">N/A</Badge>
                        ) : (
                          <Badge bg="danger" className="blood-type-badge">
                            {user.bloodType || 'Chưa xác định'}
                          </Badge>
                        )}
                      </td>
                      <td>
                        {user.role === 'Staff' ? (
                          <Badge bg="secondary">N/A</Badge>
                        ) : (
                          <Badge bg={
                            user.nextEligibleDate && new Date(user.nextEligibleDate) <= new Date() 
                              ? 'success' : 'warning'
                          }>
                            {user.nextEligibleDate || 'Chưa xác định'}
                          </Badge>
                        )}
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
                              onClick={() => showUserDetail(user)}
                            >
                              <FaEye />
                            </Button>
                          </OverlayTrigger>
                          
                          {user.role === 'Member' && (
                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip>Chỉnh sửa</Tooltip>}
                            >
                              <Button
                                variant="outline-warning"
                                size="sm"
                                onClick={() => showEditModal(user)}
                              >
                                <FaEdit />
                              </Button>
                            </OverlayTrigger>
                          )}
                          
                          {user.role === 'Member' && (
                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip>{user.status === 'active' ? 'Vô hiệu hóa' : 'Kích hoạt'}</Tooltip>}
                            >
                              <Button
                                variant={user.status === 'active' ? 'outline-danger' : 'outline-success'}
                                size="sm"
                                onClick={() => toggleUserStatus(user.id, user.status)}
                              >
                                {user.status === 'active' ? <FaTimes /> : <FaCheck />}
                              </Button>
                            </OverlayTrigger>
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

      {/* Modal xem chi tiết */}
      <Modal show={showDetailModal} onHide={handleDetailCancel} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaUser className="me-2" />
            Chi tiết người dùng
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewingUser && (
            <Tabs defaultActiveKey="personal" id="user-detail-tabs">
              <Tab eventKey="personal" title={
                <span><FaUser className="me-2" />Thông tin cá nhân</span>
              }>
                <div className="mt-3">
                  <Row>
                    <Col md={6}>
                      <div className="info-item">
                        <strong>Họ và tên:</strong>
                        <span>{viewingUser.fullName}</span>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="info-item">
                        <strong>Username:</strong>
                        <span>{viewingUser.username}</span>
                      </div>
                    </Col>
                  </Row>
                  
                  <Row>
                    <Col md={6}>
                      <div className="info-item">
                        <strong>Email:</strong>
                        <span>{viewingUser.email}</span>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="info-item">
                        <strong>
                          <FaPhone className="me-2" />
                          Số điện thoại:
                        </strong>
                        <span>{viewingUser.phone || 'Chưa cập nhật'}</span>
                      </div>
                    </Col>
                  </Row>
                  
                  <Row>
                    <Col md={12}>
                      <div className="info-item">
                        <strong>
                          <FaHome className="me-2" />
                          Địa chỉ:
                        </strong>
                        <span>{viewingUser.address || 'Chưa cập nhật'}</span>
                      </div>
                    </Col>
                  </Row>
                  
                  <Row>
                    <Col md={4}>
                      <div className="info-item">
                        <strong>Ngày sinh:</strong>
                        <span>{viewingUser.dateOfBirth || 'Chưa cập nhật'}</span>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="info-item">
                        <strong>Giới tính:</strong>
                        <span>{viewingUser.gender || 'Chưa cập nhật'}</span>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="info-item">
                        <strong>
                          <FaIdCard className="me-2" />
                          CMND/CCCD:
                        </strong>
                        <span>{viewingUser.idCard || 'Chưa cập nhật'}</span>
                      </div>
                    </Col>
                  </Row>
                  
                  <Row>
                    <Col md={6}>
                      <div className="info-item">
                        <strong>
                          <FaPhone className="me-2 text-danger" />
                          Liên hệ khẩn cấp:
                        </strong>
                        <span>{viewingUser.emergencyContact || 'Chưa cập nhật'}</span>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="info-item">
                        <strong>Vai trò:</strong>
                        <Badge bg={getRoleBadgeVariant(viewingUser.role)} className="ms-2">
                          {viewingUser.role}
                        </Badge>
                      </div>
                    </Col>
                  </Row>
                  
                  <Row>
                    <Col md={6}>
                      <div className="info-item">
                        <strong>Trạng thái:</strong>
                        <Badge bg={getStatusBadgeVariant(viewingUser.status)} className="ms-2">
                          {viewingUser.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                        </Badge>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Tab>
              
              <Tab eventKey="system" title={
                <span><FaCog className="me-2" />Thông tin hệ thống</span>
              }>
                <div className="mt-3">
                  <Row>
                    <Col md={6}>
                      <div className="info-item">
                        <strong>Ngày tạo tài khoản:</strong>
                        <span>{viewingUser.createdAt}</span>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="info-item">
                        <strong>Lần đăng nhập cuối:</strong>
                        <span>{viewingUser.lastLogin}</span>
                      </div>
                    </Col>
                  </Row>
                  
                  {viewingUser.role === 'Staff' && (
                    <>
                      <Row>
                        <Col md={6}>
                          <div className="info-item">
                            <strong>Phòng ban:</strong>
                            <span>{viewingUser.department || 'Chưa phân công'}</span>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="info-item">
                            <strong>Chức vụ:</strong>
                            <span>{viewingUser.position || 'Chưa xác định'}</span>
                          </div>
                        </Col>
                      </Row>
                      
                      <Row>
                        <Col md={6}>
                          <div className="info-item">
                            <strong>Ngày bắt đầu làm việc:</strong>
                            <span>{viewingUser.startDate || 'Chưa cập nhật'}</span>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="info-item">
                            <strong>Mức lương:</strong>
                            <span>{viewingUser.salary || 'Bảo mật'}</span>
                          </div>
                        </Col>
                      </Row>
                      
                      <Row>
                        <Col md={12}>
                          <div className="info-item">
                            <strong>Quyền hạn:</strong>
                            <div className="mt-2">
                              {viewingUser.permissions?.map((permission, index) => (
                                <Badge key={index} bg="info" className="me-2 mb-1">
                                  {permission}
                                </Badge>
                              )) || 'Chưa phân quyền'}
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </>
                  )}
                  
                  {viewingUser.status === 'inactive' && viewingUser.reasonInactive && (
                    <Row>
                      <Col md={12}>
                        <div className="info-item">
                          <strong>Lý do vô hiệu hóa:</strong>
                          <Badge bg="warning" className="ms-2">
                            {viewingUser.reasonInactive}
                          </Badge>
                        </div>
                      </Col>
                    </Row>
                  )}
                </div>
              </Tab>
              
              {viewingUser.role === 'Member' && (
                <Tab eventKey="medical" title={
                  <span><FaHeart className="me-2" />Thông tin y tế</span>
                }>
                  <div className="mt-3">
                    <Row>
                      <Col md={4}>
                        <div className="info-item">
                          <strong>Nhóm máu:</strong>
                          <Badge bg="danger" className="ms-2 blood-type-badge">
                            {viewingUser.bloodType || 'Chưa xác định'}
                          </Badge>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="info-item">
                          <strong>Cân nặng:</strong>
                          <span>{viewingUser.weight || 'Chưa cập nhật'}</span>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="info-item">
                          <strong>Chiều cao:</strong>
                          <span>{viewingUser.height || 'Chưa cập nhật'}</span>
                        </div>
                      </Col>
                    </Row>
                    
                    <Row>
                      <Col md={4}>
                        <div className="info-item">
                          <strong>Số lần hiến máu:</strong>
                          <Badge bg="success" className="ms-2">
                            {viewingUser.donationCount || 0}
                          </Badge>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="info-item">
                          <strong>Lần hiến máu cuối:</strong>
                          <span>{viewingUser.lastDonationDate || 'Chưa hiến máu'}</span>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="info-item">
                          <strong>Ngày có thể hiến tiếp:</strong>
                          <Badge bg={
                            viewingUser.nextEligibleDate && new Date(viewingUser.nextEligibleDate) <= new Date() 
                              ? 'success' : 'warning'
                          } className="ms-2">
                            {viewingUser.nextEligibleDate || 'Chưa xác định'}
                          </Badge>
                        </div>
                      </Col>
                    </Row>
                    
                    <Row>
                      <Col md={12}>
                        <div className="info-item">
                          <strong>
                            <FaMedkit className="me-2" />
                            Tiền sử bệnh:
                          </strong>
                          <span>{viewingUser.medicalHistory || 'Không có thông tin'}</span>
                        </div>
                      </Col>
                    </Row>
                    
                    <hr />
                    
                    <Row>
                      <Col md={4}>
                        <Card className="text-center">
                          <Card.Body>
                            <FaHeart className="text-danger mb-2" size={24} />
                            <h5>Tổng lần hiến</h5>
                            <h3 className="text-danger">{viewingUser.donationCount || 0}</h3>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={4}>
                        <Card className="text-center">
                          <Card.Body>
                            <FaMedkit className="text-primary mb-2" size={24} />
                            <h5>Lượng máu đã hiến</h5>
                            <h3 className="text-primary">{(viewingUser.donationCount || 0) * 350}ml</h3>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={4}>
                        <Card className="text-center">
                          <Card.Body>
                            <FaCheck className={`mb-2 ${
                              viewingUser.nextEligibleDate && new Date(viewingUser.nextEligibleDate) <= new Date()
                                ? 'text-success' : 'text-danger'
                            }`} size={24} />
                            <h5>Trạng thái hiến máu</h5>
                            <h6 className={
                              viewingUser.nextEligibleDate && new Date(viewingUser.nextEligibleDate) <= new Date()
                                ? 'text-success' : 'text-danger'
                            }>
                              {viewingUser.nextEligibleDate && new Date(viewingUser.nextEligibleDate) <= new Date()
                                ? 'Có thể hiến'
                                : 'Chưa đủ thời gian'
                              }
                            </h6>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </div>
                </Tab>
              )}
            </Tabs>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleDetailCancel}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal chỉnh sửa */}
      <Modal show={showModal} onHide={handleCancel} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaEdit className="me-2" />
            Chỉnh sửa thông tin người dùng
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {editingUser && (
              <Tabs defaultActiveKey="basic" id="edit-user-tabs">
                <Tab eventKey="basic" title={
                  <span><FaUser className="me-2" />Thông tin cơ bản</span>
                }>
                  <div className="mt-3">
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Tên đăng nhập</Form.Label>
                          <Form.Control
                            type="text"
                            name="username"
                            defaultValue={editingUser.username}
                            disabled
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Họ và tên *</Form.Label>
                          <Form.Control
                            type="text"
                            name="fullName"
                            defaultValue={editingUser.fullName}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Email *</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        defaultValue={editingUser.email}
                        required
                      />
                    </Form.Group>
                    
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Số điện thoại</Form.Label>
                          <Form.Control
                            type="tel"
                            name="phone"
                            defaultValue={editingUser.phone || ''}
                            pattern="[0-9]{10,11}"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Liên hệ khẩn cấp</Form.Label>
                          <Form.Control
                            type="tel"
                            name="emergencyContact"
                            defaultValue={editingUser.emergencyContact || ''}
                            pattern="[0-9]{10,11}"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Địa chỉ</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        name="address"
                        defaultValue={editingUser.address || ''}
                      />
                    </Form.Group>
                    
                    <Row>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Ngày sinh</Form.Label>
                          <Form.Control
                            type="date"
                            name="dateOfBirth"
                            defaultValue={editingUser.dateOfBirth || ''}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Giới tính</Form.Label>
                          <Form.Select name="gender" defaultValue={editingUser.gender || ''}>
                            <option value="">Chọn giới tính</option>
                            <option value="Nam">Nam</option>
                            <option value="Nữ">Nữ</option>
                            <option value="Khác">Khác</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>CMND/CCCD</Form.Label>
                          <Form.Control
                            type="text"
                            name="idCard"
                            defaultValue={editingUser.idCard || ''}
                            pattern="[0-9]{9,12}"
                            disabled
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Vai trò</Form.Label>
                          <Form.Select name="role" defaultValue={editingUser.role} disabled>
                            <option value="Member">Member</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Trạng thái *</Form.Label>
                          <Form.Select name="status" defaultValue={editingUser.status} required>
                            <option value="active">Hoạt động</option>
                            <option value="inactive">Không hoạt động</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Lý do vô hiệu hóa (nếu có)</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        name="reasonInactive"
                        defaultValue={editingUser.reasonInactive || ''}
                      />
                    </Form.Group>
                  </div>
                </Tab>
                
                <Tab eventKey="medical" title={
                  <span><FaHeart className="me-2" />Thông tin y tế</span>
                }>
                  <div className="mt-3">
                    <Row>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Nhóm máu</Form.Label>
                          <Form.Select name="bloodType" defaultValue={editingUser.bloodType || ''}>
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
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Cân nặng (kg)</Form.Label>
                          <Form.Control
                            type="number"
                            name="weight"
                            defaultValue={editingUser.weight ? editingUser.weight.replace('kg', '') : ''}
                            min="30"
                            max="200"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Chiều cao (cm)</Form.Label>
                          <Form.Control
                            type="number"
                            name="height"
                            defaultValue={editingUser.height ? editingUser.height.replace('cm', '') : ''}
                            min="120"
                            max="250"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Row>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Số lần hiến máu</Form.Label>
                          <Form.Control
                            type="number"
                            name="donationCount"
                            defaultValue={editingUser.donationCount || 0}
                            min="0"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Lần hiến máu cuối</Form.Label>
                          <Form.Control
                            type="date"
                            name="lastDonationDate"
                            defaultValue={editingUser.lastDonationDate || ''}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Ngày có thể hiến tiếp</Form.Label>
                          <Form.Control
                            type="date"
                            name="nextEligibleDate"
                            defaultValue={editingUser.nextEligibleDate || ''}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Tiền sử bệnh</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="medicalHistory"
                        defaultValue={editingUser.medicalHistory || ''}
                      />
                    </Form.Group>
                  </div>
                </Tab>
              </Tabs>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCancel}>
              Hủy
            </Button>
            <Button variant="primary" type="submit">
              Lưu thay đổi
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default UserManagement;
