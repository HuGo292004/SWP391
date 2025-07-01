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
  Tooltip,
  Spinner
} from 'react-bootstrap';
import { 
  FaSearch, 
  FaEdit, 
  FaEye, 
  FaUser, 
  FaUsers, 
  FaPhone, 
  FaHome, 
  FaIdCard, 
  FaCalendarAlt, 
  FaHeart, 
  FaMedkit, 
  FaUserMd,
  FaUserFriends,
  FaFilter,
  FaSync,
  FaInfoCircle
} from 'react-icons/fa';
import '../../styles/UserManagementBootstrap.css';
import { 
  getAllUsers, 
  getUsersByRole, 
  searchUserByName, 
  updateUser, 
  getUserDetail,
  formatUserData,
  formatUserDataForApi,
  mapRoleForApi,
  getCurrentUserRole,
  hasValidToken,
  createDonorProfile,
  updateDonorProfile,
  getDonorProfileByUserId,
  getDonorProfileByDonorId,
  generateDonorID,
  isValidDonorID
} from '../../services/userManagementApi';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchType, setSearchType] = useState('fullName'); // 'fullName', 'username', 'userIdCard'
  const [filterRole, setFilterRole] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showAlert, setShowAlert] = useState({ show: false, message: '', type: 'success' });
  
  // State cho modal xem chi tiết
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  
  // State cho việc cập nhật user
  const [updating, setUpdating] = useState(false);
  
  // State cho kiểm tra quyền
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [canEdit, setCanEdit] = useState(false);

  // Kiểm tra quyền khi component mount
  useEffect(() => {
    const role = getCurrentUserRole();
    setCurrentUserRole(role);
    // Staff và Admin đều có thể chỉnh sửa thông tin Member
    setCanEdit(role === 'Admin' || role === 'Staff');
  }, []);

  // Load users khi component mount
  useEffect(() => {
    loadUsers();
  }, []);

  // Hàm hiển thị thông báo
  const showMessage = (message, type = 'success') => {
    setShowAlert({ show: true, message, type });
    setTimeout(() => setShowAlert({ show: false, message: '', type: 'success' }), 3000);
  };

  // Hàm tải danh sách người dùng từ API
  const loadUsers = async () => {
    setLoading(true);
    try {
      let userData;
      
      // Nếu có filter role và không phải 'all', sử dụng API lọc theo role
      if (filterRole && filterRole !== 'all') {
        const apiRole = mapRoleForApi(filterRole);
        userData = await getUsersByRole(apiRole);
      } else {
        // Ngược lại, lấy tất cả user
        userData = await getAllUsers();
      }
      
      // Handle different response formats
      let usersArray = [];
      if (Array.isArray(userData)) {
        usersArray = userData;
      } else if (userData && userData.users && Array.isArray(userData.users)) {
        usersArray = userData.users;
      } else if (userData && userData.data && Array.isArray(userData.data)) {
        usersArray = userData.data;
      } else if (userData && typeof userData === 'object') {
        // If it's an object, try to find array property
        const possibleArrays = Object.values(userData).filter(val => Array.isArray(val));
        if (possibleArrays.length > 0) {
          usersArray = possibleArrays[0];
        }
      }
      
      // Format dữ liệu từ API
      const formattedUsers = usersArray.map(formatUserData);
      
      // Lọc bỏ Admin nếu cần thiết (tùy theo business logic)
      const filteredUsers = formattedUsers.filter(user => user.role !== 'Admin');
      
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      showMessage(`Không thể tải danh sách người dùng: ${error.message}`, 'danger');
      // Fallback to empty array
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Hàm tìm kiếm người dùng
  const performSearch = async (searchValue) => {
    if (!searchValue.trim()) {
      // Nếu không có text tìm kiếm, load lại tất cả users
      loadUsers();
      return;
    }

    setLoading(true);
    try {
      let userData;
      
      if (searchType === 'fullName') {
        // Sử dụng API tìm kiếm theo tên
        userData = await searchUserByName(searchValue);
      } else {
        // Đối với các loại tìm kiếm khác, vẫn lấy tất cả rồi filter client-side
        userData = await getAllUsers();
      }
      
      // Handle different response formats
      let usersArray = [];
      if (Array.isArray(userData)) {
        usersArray = userData;
      } else if (userData && userData.users && Array.isArray(userData.users)) {
        usersArray = userData.users;
      } else if (userData && userData.data && Array.isArray(userData.data)) {
        usersArray = userData.data;
      } else if (userData && typeof userData === 'object') {
        // If it's an object, try to find array property
        const possibleArrays = Object.values(userData).filter(val => Array.isArray(val));
        if (possibleArrays.length > 0) {
          usersArray = possibleArrays[0];
        }
      }
      
      const formattedUsers = usersArray.map(formatUserData);
      
      // Filter client-side cho các loại tìm kiếm không có API riêng
      let filteredUsers = formattedUsers;
      
      if (searchType !== 'fullName') {
        filteredUsers = formattedUsers.filter(user => {
          switch (searchType) {
            case 'username':
              return user.username && user.username.toLowerCase().includes(searchValue.toLowerCase());
            case 'userIdCard':
              return user.userIdCard && user.userIdCard.includes(searchValue);
            default:
              return true;
          }
        });
      }
      
      // Lọc bỏ Admin
      filteredUsers = filteredUsers.filter(user => user.role !== 'Admin');
      
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error searching users:', error);
      showMessage(`Lỗi tìm kiếm: ${error.message}`, 'danger');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
    // Debounce search - thực hiện tìm kiếm sau 300ms
    const timeoutId = setTimeout(() => {
      performSearch(value);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  };

  const handleSearchTypeChange = (type) => {
    setSearchType(type);
    // Clear search text when changing search type
    if (searchText) {
      setSearchText('');
      performSearch(''); // Reset to all users
    }
  };

  const handleRoleFilter = (value) => {
    setFilterRole(value);
    // Reload users with new filter
    setTimeout(() => {
      loadUsers();
    }, 100);
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
        case 'userIdCard':
          matchSearch = user.userIdCard && user.userIdCard.includes(searchText);
          break;
        default:
          matchSearch = true;
      }
    } else {
      matchSearch = true;
    }

    const matchRole = filterRole === 'all' || user.role === filterRole;
    
    return matchSearch && matchRole;
  });

  const showUserDetail = async (user) => {
    setLoadingDetail(true);
    try {
      // Lấy chi tiết đầy đủ từ API
      const detailData = await getUserDetail(user.id);
      let formattedDetail = formatUserData(detailData);
      
      // Nếu là Member, cố gắng lấy thêm thông tin hồ sơ hiến máu
      if (user.role === 'Member') {
        try {
          const donorProfile = await getDonorProfileByUserId(user.id);
          console.log('Donor profile response for user detail:', donorProfile);
          
          if (donorProfile && (donorProfile.donorID || donorProfile.donorId || donorProfile.DonorID)) {
            // ĐÃ CÓ hồ sơ hiến máu - hiển thị thông tin thực tế
            formattedDetail = {
              ...formattedDetail,
              donorID: donorProfile.donorID || donorProfile.donorId || donorProfile.DonorID,
              bloodTypeID: donorProfile.bloodTypeID || donorProfile.bloodTypeId || donorProfile.BloodTypeID,
              isAvailable: donorProfile.isAvailable !== undefined ? donorProfile.isAvailable : 
                          (donorProfile.IsAvailable !== undefined ? donorProfile.IsAvailable : true),
              lastDonationDate: donorProfile.lastDonationDate || donorProfile.LastDonationDate,
              nextEligibleDate: donorProfile.nextEligibleDate || donorProfile.NextEligibleDate,
              currentMedications: donorProfile.currentMedications || donorProfile.CurrentMedications,
              hasDonorProfile: true // Đánh dấu đã có hồ sơ
            };
            console.log('User has donor profile, displaying:', formattedDetail.donorID);
          } else {
            // CHƯA CÓ hồ sơ hiến máu - hiển thị donorID sẽ được tạo
            const autoDonorID = generateDonorID(user.id);
            formattedDetail = {
              ...formattedDetail,
              donorID: `${autoDonorID} (Sẽ được tạo)`,
              isAvailable: true, // Mặc định có thể hiến máu
              hasDonorProfile: false // Đánh dấu chưa có hồ sơ
            };
            console.log('User has NO donor profile, will create:', formattedDetail.donorID);
          }
        } catch (donorError) {
          console.log('Error getting donor profile for user:', user.id, donorError);
          // CHƯA CÓ hồ sơ hiến máu - hiển thị donorID sẽ được tạo
          const autoDonorID = generateDonorID(user.id);
          formattedDetail = {
            ...formattedDetail,
            donorID: `${autoDonorID} (Sẽ được tạo)`,
            isAvailable: true, // Mặc định có thể hiến máu
            hasDonorProfile: false // Đánh dấu chưa có hồ sơ
          };
          console.log('Error getting donor profile, will create:', formattedDetail.donorID);
        }
      }
      
      setViewingUser(formattedDetail);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error fetching user detail:', error);
      showMessage(`Không thể tải chi tiết người dùng: ${error.message}`, 'danger');
      // Fallback to current user data
      setViewingUser(user);
      setShowDetailModal(true);
    } finally {
      setLoadingDetail(false);
    }
  };
  
  const handleDetailCancel = () => {
    setShowDetailModal(false);
    setViewingUser(null);
  };

  const showEditModal = async (user) => {
    // Kiểm tra quyền trước khi cho phép edit
    if (!canEdit) {
      showMessage('Bạn không có quyền chỉnh sửa thông tin người dùng. Chỉ Admin và Staff mới có thể thực hiện thao tác này.', 'danger');
      return;
    }
    
    if (!hasValidToken()) {
      showMessage('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 'danger');
      return;
    }
    
    // Kiểm tra quyền chỉnh sửa theo role
    if (user.role === 'Staff') {
      // Staff không được chỉnh sửa Staff khác (chỉ Admin mới được)
      if (currentUserRole === 'Staff') {
        showMessage('Staff không có quyền chỉnh sửa thông tin của Staff khác', 'warning');
        return;
      }
    }
    
    // Admin có thể chỉnh sửa Admin khác, nhưng Staff thì không
    if (user.role === 'Admin') {
      if (currentUserRole !== 'Admin') {
        showMessage('Bạn không có quyền chỉnh sửa thông tin của Admin', 'warning');
        return;
      }
    }
    
    setLoadingDetail(true);
    try {
      // Lấy chi tiết đầy đủ từ API trước khi edit
      const detailData = await getUserDetail(user.id);
      let formattedDetail = formatUserData(detailData);
      
      // Nếu là Member, cố gắng lấy thêm thông tin hồ sơ hiến máu
      if (user.role === 'Member') {
        try {
          const donorProfile = await getDonorProfileByUserId(user.id);
          console.log('Donor profile response for edit modal:', donorProfile);
          
          if (donorProfile && (donorProfile.donorID || donorProfile.donorId)) {
            // ĐÃ CÓ hồ sơ hiến máu - sử dụng thông tin thực tế
            formattedDetail = {
              ...formattedDetail,
              donorID: donorProfile.donorID || donorProfile.donorId,
              bloodTypeID: donorProfile.bloodTypeID || donorProfile.bloodTypeId,
              isAvailable: donorProfile.isAvailable !== undefined ? donorProfile.isAvailable : true,
              lastDonationDate: donorProfile.lastDonationDate || donorProfile.LastDonationDate,
              nextEligibleDate: donorProfile.nextEligibleDate || donorProfile.NextEligibleDate,
              currentMedications: donorProfile.currentMedications || donorProfile.CurrentMedications,
              hasDonorProfile: true // Đánh dấu đã có hồ sơ
            };
            console.log('Edit modal: User has donor profile, using:', formattedDetail.donorID);
          } else {
            // CHƯA CÓ hồ sơ hiến máu - tạo donorID tự động cho preview
            const autoDonorID = generateDonorID(user.id);
            formattedDetail = {
              ...formattedDetail,
              donorID: autoDonorID, // Tự động tạo donorID (không hiển thị "sẽ được tạo" trong form edit)
              isAvailable: true, // Mặc định có thể hiến máu
              hasDonorProfile: false // Đánh dấu chưa có hồ sơ
            };
            console.log('Edit modal: User has NO donor profile, will create:', formattedDetail.donorID);
          }
        } catch (donorError) {
          console.log('No donor profile found for user (edit):', user.id, donorError.message);
          // CHƯA CÓ hồ sơ hiến máu - tạo donorID tự động cho preview  
          const autoDonorID = generateDonorID(user.id);
          formattedDetail = {
            ...formattedDetail,
            donorID: autoDonorID, // Tự động tạo donorID
            isAvailable: true, // Mặc định có thể hiến máu
            hasDonorProfile: false // Đánh dấu chưa có hồ sơ
          };
          console.log('Edit modal: Error getting donor profile, will create:', formattedDetail.donorID);
        }
      }
      
      setEditingUser(formattedDetail);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching user detail for edit:', error);
      showMessage(`Không thể tải thông tin chi tiết: ${error.message}`, 'warning');
      // Fallback to current user data
      setEditingUser(user);
      setShowModal(true);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Kiểm tra quyền trước khi thực hiện
    if (!canEdit) {
      showMessage('Bạn không có quyền chỉnh sửa thông tin người dùng. Chỉ Admin và Staff mới có thể thực hiện thao tác này.', 'danger');
      return;
    }
    
    if (!hasValidToken()) {
      showMessage('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 'danger');
      return;
    }
    
    setUpdating(true);
    
    const formData = new FormData(e.target);
    const values = Object.fromEntries(formData.entries());
    
    try {
      // Xử lý dữ liệu trước khi gửi API
      const processedValues = formatUserDataForApi(values);
      
      // Gọi API cập nhật thông tin cơ bản
      await updateUser(editingUser.id, processedValues);
      
      // Nếu là Member, xử lý hồ sơ hiến máu
      if (editingUser.role === 'Member') {
        // Tự động tạo donorID dựa trên userID
        const autoDonorID = generateDonorID(editingUser.id);
        
        const donorData = {
          donorID: autoDonorID, // Sử dụng donorID tự động tạo đồng bộ
          bloodTypeID: values.bloodTypeID || null, // Giữ nguyên GUID
          isAvailable: values.isAvailable === 'true',
          lastDonationDate: values.lastDonationDate || null,
          nextEligibleDate: values.nextEligibleDate || null,
          currentMedications: values.currentMedications || null
        };
        
        // Kiểm tra xem đã có hồ sơ hiến máu chưa
        try {
          const existingDonorProfile = await getDonorProfileByUserId(editingUser.id);
          
          if (existingDonorProfile && existingDonorProfile.donorID) {
            // Đã có hồ sơ - cập nhật (giữ nguyên donorID hiện tại)
            donorData.donorID = existingDonorProfile.donorID;
            await updateDonorProfile(existingDonorProfile.donorID, donorData);
            showMessage('Cập nhật thông tin người dùng và hồ sơ hiến máu thành công');
          } else {
            // Chưa có hồ sơ - tạo mới với donorID tự động
            await createDonorProfile(editingUser.id, donorData);
            showMessage('Cập nhật thông tin người dùng và tạo hồ sơ hiến máu thành công');
          }
        } catch (donorError) {
          // API lỗi hoặc chưa có hồ sơ hiến máu, tạo mới
          console.log('Creating new donor profile due to error or no existing profile:', donorError.message);
          try {
            await createDonorProfile(editingUser.id, donorData);
            showMessage('Cập nhật thông tin người dùng và tạo hồ sơ hiến máu thành công');
          } catch (createError) {
            console.error('Error creating donor profile:', createError);
            showMessage('Cập nhật thông tin người dùng thành công, nhưng không thể tạo hồ sơ hiến máu. Vui lòng thử lại.', 'warning');
          }
        }
      } else {
        showMessage('Cập nhật thông tin người dùng thành công');
      }
      
      // Reload danh sách users
      await loadUsers();
      
      setShowModal(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
      showMessage(`Lỗi cập nhật: ${error.message}`, 'danger');
    } finally {
      setUpdating(false);
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

  // Hàm lấy tên nhóm máu từ bloodTypeID
  const getBloodTypeName = (bloodTypeID) => {
    console.log('==== UserManagement getBloodTypeName DEBUG ====');
    console.log('Input bloodTypeID:', bloodTypeID);
    console.log('Type of bloodTypeID:', typeof bloodTypeID);
    console.log('Is null/undefined?', bloodTypeID == null);
    
    const bloodTypeMap = {
      '44C1A0F7-92B9-4E1B-A628-03447F5B86D7': 'O+ (O Rh dương)',
      '5BB618E3-25CE-45D8-B980-03D532EC2293': 'B- (B Rh âm)',
      '11111111-1111-1111-1111-111111111111': 'A+ (A Rh dương)',
      '11111111-1111-1111-1111-111111111002': 'A- (A Rh âm)',
      '11111111-1111-1111-1111-111111111003': 'B+ (B Rh dương)',
      '11111111-1111-1111-1111-111111111004': 'B- (B Rh âm)',
      '11111111-1111-1111-1111-111111111005': 'AB+ (AB Rh dương)',
      '11111111-1111-1111-1111-111111111006': 'AB- (AB Rh âm)',
      '11111111-1111-1111-1111-111111111007': 'O+ (O Rh dương)',
      '11111111-1111-1111-1111-111111111008': 'O- (O Rh âm)',
      'FE6B963D-65ED-4681-96FF-213E2B9D7E9B': 'O- (O Rh âm)',
      'B0B93608-6EA7-4F3E-8B24-37B66BF00C82': 'A+ (A Rh dương)',
      'C070228E-DA24-4CD8-8286-84C2226674A3': 'B+ (B Rh dương)',
      '5D60875F-D7DE-4DFE-A057-F8F433A7A932': 'AB- (AB Rh âm)',
      'A12373C7-3BFC-496E-8021-C0031B9BCDD8': 'A- (A Rh âm)',
      '5AE0C996-2594-48D2-8023-FD80676E4BCC': 'AB+ (AB Rh dương)'
    };
    
    // Chuẩn hóa bloodTypeID (uppercase)  
    const normalizedID = String(bloodTypeID).toUpperCase();
    console.log('Normalized bloodTypeID:', normalizedID);
    console.log('Available keys in bloodTypeMap:', Object.keys(bloodTypeMap));
    console.log('Is key found in map?', normalizedID in bloodTypeMap);
    
    const result = bloodTypeMap[normalizedID] || 'Chưa xác định';
    console.log('Blood type mapping result:', result);
    console.log('==== END UserManagement getBloodTypeName DEBUG ====');
    
    return result;
  };

  // Thống kê
  const stats = {
    total: users.length,
    staff: users.filter(u => u.role === 'Staff').length,
    member: users.filter(u => u.role === 'Member').length,
  };

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
        <Col lg={4} md={6} className="mb-3">
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
        <Col lg={4} md={6} className="mb-3">
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
        <Col lg={4} md={6} className="mb-3">
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
            <Col lg={7} md={8} className="mb-3 mb-lg-0">
              <InputGroup>
                <DropdownButton
                  variant="outline-secondary"
                  title={
                    searchType === 'id' ? 'ID' :
                    searchType === 'fullName' ? 'Họ và tên' :
                    searchType === 'username' ? 'Username' :
                    searchType === 'userIdCard' ? 'CMND/CCCD' :
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
                    onClick={() => handleSearchTypeChange('userIdCard')}
                    active={searchType === 'userIdCard'}
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
                    searchType === 'userIdCard' ? 'Nhập số CMND/CCCD...' :
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
            <Col lg={5} md={4} className="mb-3 mb-lg-0 d-flex gap-2 align-items-center">
              <Button 
                variant="outline-primary" 
                onClick={loadUsers}
                disabled={loading}
                className="me-2"
                title="Refresh danh sách"
              >
                {loading ? <Spinner animation="border" size="sm" /> : <FaSync />}
              </Button>
              <Form.Select value={filterRole} onChange={(e) => handleRoleFilter(e.target.value)} style={{minWidth: '150px'}}>
                <option value="all">Tất cả vai trò</option>
                <option value="Staff">Staff</option>
                <option value="Member">Member</option>
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
                  <th>Họ và tên</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center">
                      <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-muted">
                      Không có dữ liệu phù hợp
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
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
                          
                          {/* Hiển thị nút chỉnh sửa dựa trên quyền */}
                          {((user.role === 'Member') || 
                            (user.role === 'Staff' && currentUserRole === 'Admin') ||
                            (user.role === 'Admin' && currentUserRole === 'Admin')) && (
                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip>{canEdit ? 'Chỉnh sửa' : 'Chỉ Admin và Staff có quyền chỉnh sửa'}</Tooltip>}
                            >
                              <Button
                                variant="outline-warning"
                                size="sm"
                                onClick={() => showEditModal(user)}
                                disabled={!canEdit}
                              >
                                <FaEdit />
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
            {loadingDetail && <Spinner animation="border" size="sm" className="ms-2" />}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingDetail ? (
            <div className="text-center p-4">
              <Spinner animation="border" />
              <p className="mt-2">Đang tải thông tin chi tiết...</p>
            </div>
          ) : viewingUser && (
            <Tabs defaultActiveKey="personal" id="user-detail-tabs">
              <Tab eventKey="personal" title={
                <span><FaUser className="me-2" />Thông tin cá nhân</span>
              }>                <div className="mt-3">
                  <Row>
                    <Col md={6}>
                      <div className="info-item">
                        <strong>Mã người dùng:</strong>
                        <span>
                          {viewingUser.role === 'Member' ? (viewingUser.userID || viewingUser.id) : 
                           viewingUser.role === 'Staff' ? (viewingUser.staffID || viewingUser.id) :
                           viewingUser.id}
                        </span>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="info-item">
                        <strong>Họ và tên:</strong>
                        <span>{viewingUser.fullName}</span>
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
                    <Col md={6}>
                      <div className="info-item">
                        <strong>
                          <FaIdCard className="me-2" />
                          CCCD/CMND:
                        </strong>
                        <span>{viewingUser.userIdCard || 'Chưa cập nhật'}</span>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="info-item">
                        <strong>Ngày sinh:</strong>
                        <span>{viewingUser.dateOfBirth || 'Chưa cập nhật'}</span>
                      </div>
                    </Col>
                  </Row>
                  
                  {/* Chỉ hiển thị cho Member */}
                  {viewingUser.role === 'Member' && (
                    <>
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
                    </>
                  )}
                  
                  <Row>
                    <Col md={6}>
                      <div className="info-item">
                        <strong>Vai trò:</strong>
                        <Badge bg={getRoleBadgeVariant(viewingUser.role)} className="ms-2">
                          {viewingUser.role}
                        </Badge>
                      </div>
                    </Col>
                  </Row></div>
              </Tab>
              
              {viewingUser.role === 'Member' && (
                <Tab eventKey="medical" title={
                  <span><FaHeart className="me-2" />Hồ sơ hiến máu</span>
                }>
                  <div className="mt-3">
                    <Row>
                      <Col md={6}>
                        <Card className="h-100">
                          <Card.Header className="bg-light">
                            <h6 className="mb-0 text-primary">
                              <FaUser className="me-2" />
                              Thông tin cơ bản
                            </h6>
                          </Card.Header>
                          <Card.Body>
                            <div className="info-item mb-3">
                              <strong>Mã hồ sơ hiến máu (donorID):</strong>
                              {viewingUser.hasDonorProfile ? (
                                <Badge bg="success" className="ms-2">
                                  {viewingUser.donorID}
                                </Badge>
                              ) : (
                                <Badge bg="warning" className="ms-2">
                                  {viewingUser.donorID}
                                </Badge>
                              )}
                            </div>
                            <div className="info-item mb-3">
                              <strong>Nhóm máu (bloodType):</strong>
                              <span className="ms-2">
                                {viewingUser.bloodTypeID ? getBloodTypeName(viewingUser.bloodTypeID) : 'Chưa xác định'}
                              </span>
                            </div>
                            <div className="info-item mb-3">
                              <strong>Trạng thái sẵn sàng (isAvailable):</strong>
                              <Badge 
                                bg={viewingUser.isAvailable !== false ? 'success' : 'warning'} 
                                className="ms-2"
                              >
                                {viewingUser.isAvailable !== false ? 'Có thể hiến máu' : 'Không thể hiến máu'}
                              </Badge>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={6}>
                        <Card className="h-100">
                          <Card.Header className="bg-light">
                            <h6 className="mb-0 text-info">
                              <FaCalendarAlt className="me-2" />
                              Lịch trình hiến máu
                            </h6>
                          </Card.Header>
                          <Card.Body>
                            <div className="info-item mb-3">
                              <strong>
                                <FaCalendarAlt className="me-2" />
                                Lần hiến máu cuối (lastDonationDate):
                              </strong>
                              <span className="ms-2">{viewingUser.lastDonationDate || 'Chưa hiến máu lần nào'}</span>
                            </div>
                            <div className="info-item mb-3">
                              <strong>
                                <FaCalendarAlt className="me-2" />
                                Có thể hiến tiếp theo (nextEligibleDate):
                              </strong>
                              <span className="ms-2">{viewingUser.nextEligibleDate || 'Có thể hiến ngay'}</span>
                            </div>
                            <div className="info-item mb-3">
                              <strong>
                                <FaHome className="me-2" />
                                Địa chỉ:
                              </strong>
                              <span className="ms-2">{viewingUser.address || 'Chưa cập nhật địa chỉ'}</span>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                    
                    <Row className="mt-3">
                      <Col md={12}>
                        <Card>
                          <Card.Header className="bg-light">
                            <h6 className="mb-0 text-warning">
                              <FaMedkit className="me-2" />
                              Thuốc đang sử dụng (currentMedications):
                            </h6>
                          </Card.Header>
                          <Card.Body>
                            <div className="info-item">
                              <span>{viewingUser.currentMedications || 'Không có thuốc đang sử dụng'}</span>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                    
                    <hr />
                    
                    <Row>
                      <Col md={6}>                          <Card className="text-center">
                            <Card.Body>
                              <FaHeart className="text-danger mb-2" size={24} />
                              <h5>Trạng thái đăng ký</h5>
                              <h3 className={`${viewingUser.hasDonorProfile ? 'text-success' : 'text-warning'}`}>
                                {viewingUser.hasDonorProfile ? 'Đã đăng ký' : 'Chưa đăng ký'}
                              </h3>
                              {!viewingUser.hasDonorProfile && (
                                <small className="text-muted">
                                  Sử dụng chức năng "Chỉnh sửa" để tạo hồ sơ hiến máu
                                </small>
                              )}
                            </Card.Body>
                          </Card>
                      </Col>
                      <Col md={6}>
                        <Card className="text-center">
                          <Card.Body>
                            <FaMedkit className="text-primary mb-2" size={24} />
                            <h5>Tình trạng sức khỏe</h5>
                            <h3 className={`${viewingUser.isAvailable !== false ? 'text-success' : 'text-warning'}`}>
                              {viewingUser.isAvailable !== false ? 'Khỏe mạnh' : 'Cần kiểm tra'}
                            </h3>
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
                }>                  <div className="mt-3">
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Mã người dùng</Form.Label>
                          <Form.Control
                            type="text"
                            value={editingUser.role === 'Member' ? (editingUser.userID || editingUser.id) : 
                                   editingUser.role === 'Staff' ? (editingUser.staffID || editingUser.id) :
                                   editingUser.id}
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
                    
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Email *</Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            defaultValue={editingUser.email}
                            required
                          />
                        </Form.Group>
                      </Col>
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
                    </Row>
                    
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>CCCD/CMND</Form.Label>
                          <Form.Control
                            type="text"
                            name="userIdCard"
                            defaultValue={editingUser.userIdCard || ''}
                            pattern="[0-9]{9,12}"
                            disabled
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Ngày sinh</Form.Label>
                          <Form.Control
                            type="date"
                            name="dateOfBirth"
                            defaultValue={editingUser.dateOfBirth || ''}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    {/* Chỉ hiển thị cho Member */}
                    {editingUser?.role === 'Member' && (
                      <Form.Group className="mb-3">
                        <Form.Label>Địa chỉ</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          name="address"
                          defaultValue={editingUser.address || ''}
                        />
                      </Form.Group>
                    )}
                    
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Vai trò</Form.Label>
                          <Form.Select name="role" defaultValue={editingUser.role} disabled>
                            <option value="Member">Member</option>
                            <option value="Staff">Staff</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>
                </Tab>
                
                {/* Chỉ hiển thị tab hồ sơ hiến máu cho Member */}
                {editingUser.role === 'Member' && (
                  <Tab eventKey="medical" title={
                    <span><FaHeart className="me-2" />Hồ sơ hiến máu</span>
                  }>
                    <div className="mt-3">
                      <Alert variant="info" className="mb-3">
                        <h6 className="mb-1">
                          <FaHeart className="me-2" />
                          Hướng dẫn tạo/chỉnh sửa hồ sơ hiến máu
                        </h6>
                        <small>
                          • <strong>Mã hồ sơ hiến máu (donorID)</strong> sẽ được hệ thống tự động tạo dựa trên ID người dùng<br/>
                          • Hệ thống sẽ tự động tạo hồ sơ mới nếu member chưa có hồ sơ hiến máu<br/>
                          • Nếu đã có hồ sơ, hệ thống sẽ cập nhật thông tin hiện có
                        </small>
                      </Alert>
                      <Card className="mb-3">
                        <Card.Header className="bg-light">
                          <h6 className="mb-0 text-primary">
                            <FaUser className="me-2" />
                            Thông tin cơ bản
                          </h6>
                        </Card.Header>
                        <Card.Body>
                          <Row>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Mã hồ sơ hiến máu (donorID)</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="donorID"
                                  value={editingUser.donorID || `DN${editingUser.id.split('-').pop().substring(0, 6).toUpperCase()}`}
                                  disabled
                                  className="bg-light"
                                />
                                <Form.Text className="text-muted">
                                  <strong>Tự động:</strong> Hệ thống sẽ tự động tạo hoặc sử dụng mã hồ sơ hiến máu hiện có.
                                </Form.Text>
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>ID nhóm máu (bloodTypeID)</Form.Label>
                                <Form.Select name="bloodTypeID" defaultValue={editingUser.bloodTypeID || ''}>
                                  <option value="">Chọn nhóm máu</option>
                                  <option value="44C1A0F7-92B9-4E1B-A628-03447F5B86D7">O+ (Nhóm máu O Rh dương)</option>
                                  <option value="5BB618E3-25CE-45D8-B980-03D532EC2293">B- (Nhóm máu B Rh âm)</option>
                                  <option value="11111111-1111-1111-1111-111111111111">A+ (Nhóm máu A Rh dương)</option>
                                  <option value="11111111-1111-1111-1111-111111111002">A- (Nhóm máu A Rh âm)</option>
                                  <option value="11111111-1111-1111-1111-111111111003">B+ (Nhóm máu B Rh dương)</option>
                                  <option value="11111111-1111-1111-1111-111111111004">B- (Nhóm máu B Rh âm)</option>
                                  <option value="11111111-1111-1111-1111-111111111005">AB+ (Nhóm máu AB Rh dương)</option>
                                  <option value="11111111-1111-1111-1111-111111111006">AB- (Nhóm máu AB Rh âm)</option>
                                  <option value="11111111-1111-1111-1111-111111111007">O+ (Nhóm máu O Rh dương)</option>
                                  <option value="11111111-1111-1111-1111-111111111008">O- (Nhóm máu O Rh âm)</option>
                                  <option value="FE6B963D-65ED-4681-96FF-213E2B9D7E9B">O- (Nhóm máu O Rh âm)</option>
                                  <option value="B0B93608-6EA7-4F3E-8B24-37B66BF00C82">A+ (Nhóm máu A Rh dương)</option>
                                  <option value="C070228E-DA24-4CD8-8286-84C2226674A3">B+ (Nhóm máu B Rh dương)</option>
                                  <option value="5D60875F-D7DE-4DFE-A057-F8F433A7A932">AB- (Nhóm máu AB Rh âm)</option>
                                  <option value="A12373C7-3BFC-496E-8021-C0031B9BCDD8">A- (Nhóm máu A Rh âm)</option>
                                  <option value="5AE0C996-2594-48D2-8023-FD80676E4BCC">AB+ (Nhóm máu AB Rh dương)</option>
                                </Form.Select>
                                <Form.Text className="text-muted">
                                  Chọn nhóm máu ABO và Rh của người hiến máu
                                </Form.Text>
                              </Form.Group>
                            </Col>
                          </Row>
                          <Row>
                            <Col md={12}>
                              <Form.Group className="mb-3">
                                <Form.Label>Trạng thái sẵn sàng (isAvailable)</Form.Label>
                                <Form.Select name="isAvailable" defaultValue={editingUser.isAvailable !== false ? 'true' : 'false'}>
                                  <option value="true">Có thể hiến máu</option>
                                  <option value="false">Không thể hiến máu</option>
                                </Form.Select>
                              </Form.Group>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                      
                      <Card className="mb-3">
                        <Card.Header className="bg-light">
                          <h6 className="mb-0 text-info">
                            <FaCalendarAlt className="me-2" />
                            Lịch trình hiến máu
                          </h6>
                        </Card.Header>
                        <Card.Body>
                          <Row>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Lần hiến máu cuối (lastDonationDate)</Form.Label>
                                <Form.Control
                                  type="date"
                                  name="lastDonationDate"
                                  defaultValue={editingUser.lastDonationDate || ''}
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Có thể hiến tiếp theo (nextEligibleDate)</Form.Label>
                                <Form.Control
                                  type="date"
                                  name="nextEligibleDate"
                                  defaultValue={editingUser.nextEligibleDate || ''}
                                />
                                <Form.Text className="text-muted">
                                  Thường là 12 tuần sau lần hiến cuối
                                </Form.Text>
                              </Form.Group>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                      
                      <Card className="mb-3">
                        <Card.Header className="bg-light">
                          <h6 className="mb-0 text-warning">
                            <FaMedkit className="me-2" />
                            Thông tin y tế
                          </h6>
                        </Card.Header>
                        <Card.Body>
                          <Form.Group className="mb-3">
                            <Form.Label>Thuốc đang sử dụng (currentMedications)</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={3}
                              name="currentMedications"
                              defaultValue={editingUser.currentMedications || ''}
                              placeholder="Mô tả các loại thuốc đang sử dụng hoặc ghi 'Không có thuốc đang sử dụng'"
                            />
                          </Form.Group>
                        </Card.Body>
                      </Card>
                    </div>
                  </Tab>
                )}
              </Tabs>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCancel} disabled={updating}>
              Hủy
            </Button>
            <Button variant="primary" type="submit" disabled={updating}>
              {updating ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Đang cập nhật...
                </>
              ) : (
                'Lưu thay đổi'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default UserManagement;
