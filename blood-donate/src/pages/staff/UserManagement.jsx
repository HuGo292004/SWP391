// Import các thư viện React và hooks
import React, { useState, useEffect } from "react";

// Import các component từ React Bootstrap
import {
  Container, // Container để layout
  Row, // Row cho grid system
  Col, // Column cho grid system
  Card, // Card component
  Table, // Table component
  Button, // Button component
  Form, // Form component
  Modal, // Modal component
  Badge, // Badge component
  Alert, // Alert component
  InputGroup, // Input group component
  Dropdown, // Dropdown component
  DropdownButton, // Dropdown button component
  Tab, // Tab component
  Tabs, // Tabs container
  OverlayTrigger, // Overlay trigger cho tooltip
  Tooltip, // Tooltip component
  Spinner, // Loading spinner
} from "react-bootstrap";

// Import các icon từ React Icons (Font Awesome)
import {
  FaSearch, // Icon tìm kiếm
  FaEdit, // Icon chỉnh sửa
  FaEye, // Icon xem
  FaUser, // Icon người dùng
  FaUsers, // Icon nhóm người dùng
  FaPhone, // Icon điện thoại
  FaIdCard, // Icon thẻ ID
  FaCalendarAlt, // Icon lịch
  FaHeart,
  FaUserMd,
  FaUserFriends,
  FaSync,
  FaInfoCircle,
} from "react-icons/fa";
import "../../styles/UserManagementBootstrap.css";
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
  getDonorProfileByUserId,
} from "../../services/userManagementApi";
import { donorApi } from "../../services/donorApi";
import { donationHistoryApi } from "../../services/donationHistoryApi";

const UserManagement = () => {
  const [allUsers, setAllUsers] = useState([]); // State lưu tất cả users cho thống kê
  const [users, setUsers] = useState([]); // State lưu users hiển thị trong bảng
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchType, setSearchType] = useState("fullName");
  const [filterRole, setFilterRole] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showAlert, setShowAlert] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [canEdit, setCanEdit] = useState(false);
  const [donationHistory, setDonationHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    const role = getCurrentUserRole();
    setCurrentUserRole(role);
    setCanEdit(role === "Admin" || role === "Staff");
  }, []);

  useEffect(() => {
    loadUsers();
  }, []); // Chỉ load một lần khi component mount

  useEffect(() => {
    const fetchHistory = async () => {
      if (!viewingUser || viewingUser.role !== "Member") {
        setDonationHistory([]);
        return;
      }
      setLoadingHistory(true);
      try {
        let history = [];
        if (viewingUser.donorID) {
          let raw = await donationHistoryApi.getDonationHistoryByDonor(
            viewingUser.donorID
          );
          history = (raw || []).filter(
            (d) =>
              d.donorId === viewingUser.donorID ||
              d.donorID === viewingUser.donorID ||
              d.userIdCard === viewingUser.userIdCard
          );
        } else if (viewingUser.userIdCard) {
          const all = (await donationHistoryApi.getAllDonationHistory)
            ? await donationHistoryApi.getAllDonationHistory()
            : [];
          history = all.filter(
            (d) =>
              d.userIdCard === viewingUser.userIdCard ||
              d.donorIdCard === viewingUser.userIdCard
          );
        }
        setDonationHistory(Array.isArray(history) ? history : []);
      } catch (e) {
        setDonationHistory([]);
      }
      setLoadingHistory(false);
    };
    fetchHistory();
  }, [viewingUser]);

  const showMessage = (message, type = "success") => {
    setShowAlert({ show: true, message, type });
    setTimeout(
      () => setShowAlert({ show: false, message: "", type: "success" }),
      3000
    );
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Luôn lấy tất cả users để tính thống kê
      const allUserData = await getAllUsers();
      let allUsersArray = [];
      if (Array.isArray(allUserData)) {
        allUsersArray = allUserData;
      } else if (
        allUserData &&
        allUserData.users &&
        Array.isArray(allUserData.users)
      ) {
        allUsersArray = allUserData.users;
      } else if (
        allUserData &&
        allUserData.data &&
        Array.isArray(allUserData.data)
      ) {
        allUsersArray = allUserData.data;
      } else if (allUserData && typeof allUserData === "object") {
        const possibleArrays = Object.values(allUserData).filter((val) =>
          Array.isArray(val)
        );
        if (possibleArrays.length > 0) {
          allUsersArray = possibleArrays[0];
        }
      }

      const formattedAllUsers = allUsersArray.map(formatUserData);
      const filteredAllUsers = formattedAllUsers.filter(
        (user) => user.role !== "Admin"
      );

      // Lưu tất cả users để tính thống kê
      setAllUsers(filteredAllUsers);

      // Filter users hiển thị theo role đã chọn
      let displayUsers = filteredAllUsers;
      if (filterRole && filterRole !== "all") {
        displayUsers = filteredAllUsers.filter(
          (user) => user.role === filterRole
        );
      }

      // Lưu users hiển thị trong bảng
      setUsers(displayUsers);
    } catch (error) {
      console.error("Error loading users:", error);
      showMessage(
        `Không thể tải danh sách người dùng: ${error.message}`,
        "danger"
      );
      setAllUsers([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async (searchValue) => {
    if (!searchValue.trim()) {
      // Khi không có search, hiển thị lại tất cả users (hoặc theo filter role)
      const filteredByRole =
        filterRole === "all"
          ? allUsers
          : allUsers.filter((user) => user.role === filterRole);
      setUsers(filteredByRole);
      return;
    }
    setLoading(true);
    try {
      let searchResults;
      if (searchType === "fullName") {
        searchResults = await searchUserByName(searchValue);
      } else {
        // Tìm kiếm trên allUsers thay vì gọi API lại
        searchResults = allUsers.filter((user) => {
          switch (searchType) {
            case "id":
              return user.id.toString().includes(searchValue);
            case "username":
              return (
                user.username &&
                user.username.toLowerCase().includes(searchValue.toLowerCase())
              );
            case "userIdCard":
              return user.userIdCard && user.userIdCard.includes(searchValue);
            default:
              return true;
          }
        });
      }

      let usersArray = [];
      if (Array.isArray(searchResults)) {
        usersArray = searchResults;
      } else if (
        searchResults &&
        searchResults.users &&
        Array.isArray(searchResults.users)
      ) {
        usersArray = searchResults.users;
      } else if (
        searchResults &&
        searchResults.data &&
        Array.isArray(searchResults.data)
      ) {
        usersArray = searchResults.data;
      } else if (searchResults && typeof searchResults === "object") {
        const possibleArrays = Object.values(searchResults).filter((val) =>
          Array.isArray(val)
        );
        if (possibleArrays.length > 0) {
          usersArray = possibleArrays[0];
        }
      }

      // Nếu searchType là fullName (gọi API), format lại data
      if (searchType === "fullName") {
        const formattedUsers = usersArray.map(formatUserData);
        usersArray = formattedUsers.filter((user) => user.role !== "Admin");
      }

      // Áp dụng filter role nếu có
      const filteredByRole =
        filterRole === "all"
          ? usersArray
          : usersArray.filter((user) => user.role === filterRole);
      setUsers(filteredByRole);
    } catch (error) {
      console.error("Error searching users:", error);
      showMessage(`Lỗi tìm kiếm: ${error.message}`, "danger");
      // Nếu có lỗi, hiển thị users đã filter theo role
      const filteredByRole =
        filterRole === "all"
          ? allUsers
          : allUsers.filter((user) => user.role === filterRole);
      setUsers(filteredByRole);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
    const timeoutId = setTimeout(() => {
      performSearch(value);
    }, 300);
    return () => clearTimeout(timeoutId);
  };

  const handleSearchTypeChange = (type) => {
    setSearchType(type);
    if (searchText) {
      setSearchText("");
      // Hiển thị lại users theo filter role hiện tại
      const filteredByRole =
        filterRole === "all"
          ? allUsers
          : allUsers.filter((user) => user.role === filterRole);
      setUsers(filteredByRole);
    }
  };

  const handleRoleFilter = (value) => {
    setFilterRole(value);
    // Reset search khi đổi filter role
    setSearchText("");

    // Filter users từ allUsers thay vì load lại từ API
    let displayUsers = allUsers;
    if (value && value !== "all") {
      displayUsers = allUsers.filter((user) => user.role === value);
    }
    setUsers(displayUsers);
  };

  // Không cần filter lại vì logic đã được xử lý trong performSearch và handleRoleFilter
  const filteredUsers = users;

  const showUserDetail = async (user) => {
    setLoadingDetail(true);
    try {
      const detailData = await getUserDetail(user.id);
      let formattedDetail = formatUserData(detailData);
      if (user.role === "Member") {
        try {
          const donorProfile = await donorApi.getDonorProfileByUserId(user.id);
          if (donorProfile) {
            formattedDetail = {
              ...formattedDetail,
              donorID:
                donorProfile.donorID ||
                donorProfile.donorId ||
                donorProfile.DonorID,
              bloodTypeID:
                donorProfile.bloodTypeID ||
                donorProfile.bloodTypeId ||
                donorProfile.BloodTypeID,
              isAvailable:
                donorProfile.isAvailable !== undefined
                  ? donorProfile.isAvailable
                  : donorProfile.IsAvailable !== undefined
                  ? donorProfile.IsAvailable
                  : true,
              lastDonationDate:
                donorProfile.lastDonationDate || donorProfile.LastDonationDate,
              nextEligibleDate:
                donorProfile.nextEligibleDate || donorProfile.NextEligibleDate,
              notes: donorProfile.notes || donorProfile.Notes,
              address: donorProfile.address || donorProfile.Address,
              hasDonorProfile: true,
            };
          } else {
            formattedDetail = {
              ...formattedDetail,
              donorID: null,
              isAvailable: false,
              hasDonorProfile: false,
            };
          }
        } catch (donorError) {
          try {
            const donorProfile = await getDonorProfileByUserId(user.id);
            if (
              donorProfile &&
              (donorProfile.donorID ||
                donorProfile.donorId ||
                donorProfile.DonorID)
            ) {
              formattedDetail = {
                ...formattedDetail,
                donorID:
                  donorProfile.donorID ||
                  donorProfile.donorId ||
                  donorProfile.DonorID,
                bloodTypeID:
                  donorProfile.bloodTypeID ||
                  donorProfile.bloodTypeId ||
                  donorProfile.BloodTypeID,
                isAvailable:
                  donorProfile.isAvailable !== undefined
                    ? donorProfile.isAvailable
                    : donorProfile.IsAvailable !== undefined
                    ? donorProfile.IsAvailable
                    : true,
                lastDonationDate:
                  donorProfile.lastDonationDate ||
                  donorProfile.LastDonationDate,
                nextEligibleDate:
                  donorProfile.nextEligibleDate ||
                  donorProfile.NextEligibleDate,
                notes: donorProfile.notes || donorProfile.Notes,
                hasDonorProfile: true,
              };
            } else {
              formattedDetail = {
                ...formattedDetail,
                donorID: null,
                isAvailable: false,
                hasDonorProfile: false,
              };
            }
          } catch (fallbackError) {
            formattedDetail = {
              ...formattedDetail,
              donorID: null,
              isAvailable: false,
              hasDonorProfile: false,
            };
          }
        }
      }
      setViewingUser(formattedDetail);
      setShowDetailModal(true);
    } catch (error) {
      console.error("Error fetching user detail:", error);
      showMessage(
        `Không thể tải chi tiết người dùng: ${error.message}`,
        "danger"
      );
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
    if (!canEdit) {
      showMessage(
        "Bạn không có quyền chỉnh sửa thông tin người dùng. Chỉ Admin và Staff mới có thể thực hiện thao tác này.",
        "danger"
      );
      return;
    }
    if (!hasValidToken()) {
      showMessage(
        "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
        "danger"
      );
      return;
    }
    if (user.role === "Staff") {
      if (currentUserRole === "Staff") {
        showMessage(
          "Staff không có quyền chỉnh sửa thông tin của Staff khác",
          "warning"
        );
        return;
      }
    }
    if (user.role === "Admin") {
      if (currentUserRole !== "Admin") {
        showMessage(
          "Bạn không có quyền chỉnh sửa thông tin của Admin",
          "warning"
        );
        return;
      }
    }
    setLoadingDetail(true);
    try {
      const detailData = await getUserDetail(user.id);
      let formattedDetail = formatUserData(detailData);
      setEditingUser(formattedDetail);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching user detail for edit:", error);
      showMessage(
        `Không thể tải thông tin chi tiết: ${error.message}`,
        "warning"
      );
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
    if (!canEdit) {
      showMessage(
        "Bạn không có quyền chỉnh sửa thông tin người dùng. Chỉ Admin và Staff mới có thể thực hiện thao tác này.",
        "danger"
      );
      return;
    }
    if (!hasValidToken()) {
      showMessage(
        "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
        "danger"
      );
      return;
    }
    setUpdating(true);
    const formData = new FormData(e.target);
    const values = Object.fromEntries(formData.entries());
    try {
      const processedValues = formatUserDataForApi(values);
      await updateUser(editingUser.id, processedValues);
      showMessage("Cập nhật thông tin người dùng thành công");
      await loadUsers();
      setShowModal(false);
      setEditingUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
      showMessage(`Lỗi cập nhật: ${error.message}`, "danger");
    } finally {
      setUpdating(false);
    }
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case "Admin":
        return "danger";
      case "Staff":
        return "primary";
      case "Member":
        return "success";
      default:
        return "secondary";
    }
  };

  const getBloodTypeName = (bloodTypeID) => {
    if (!bloodTypeID) {
      return "Chưa xác định";
    }
    const bloodTypeMap = {
      "44C1A0F7-92B9-4E1B-A628-03447F5B86D7": "O+ (Nhóm máu O Rh dương)",
      "55B618E3-25CE-45D8-B980-03D532EC2293": "B- (Nhóm máu B Rh âm)",
      "11111111-1111-1111-1111-111111111001": "A+ (Nhóm máu A Rh dương)",
      "11111111-1111-1111-1111-111111111002": "A- (Nhóm máu A Rh âm)",
      "11111111-1111-1111-1111-111111111003": "B+ (Nhóm máu B Rh dương)",
      "11111111-1111-1111-1111-111111111004": "B- (Nhóm máu B Rh âm)",
      "11111111-1111-1111-1111-111111111005": "AB+ (Nhóm máu AB Rh dương)",
      "11111111-1111-1111-1111-111111111006": "AB- (Nhóm máu AB Rh âm)",
      "11111111-1111-1111-1111-111111111007": "O+ (Nhóm máu O Rh dương)",
      "11111111-1111-1111-1111-111111111008": "O- (Nhóm máu O Rh âm)",
      "FE6B963D-65ED-4681-96FF-213E2B9D7E9B": "O- (Nhóm máu O Rh âm)",
      "B0B93608-6EA7-4F3E-8B2A-37B66BF0CC82": "A+ (Nhóm máu A Rh dương)",
      "C07C228E-DA24-4DD8-B2B5-64CE22B674A3": "B+ (Nhóm máu B Rh dương)",
      "5060875F-D7D5-40FD-8FCD-75F843A71A32": "AB- (Nhóm máu AB Rh âm)",
      "A12373C7-3BFC-496E-8021-C0031B9BC0D8": "A- (Nhóm máu A Rh âm)",
      "5AE0C996-2594-48D2-8023-FD80676E4BCC": "AB+ (Nhóm máu AB Rh dương)",
    };
    const normalizedID = String(bloodTypeID).toUpperCase();
    return bloodTypeMap[normalizedID] || "Chưa xác định";
  };

  // Tính thống kê dựa trên allUsers thay vì users để giữ nguyên số liệu
  const stats = {
    total: allUsers.length,
    staff: allUsers.filter((u) => u.role === "Staff").length,
    member: allUsers.filter((u) => u.role === "Member").length,
  };

  return (
    <Container fluid className="user-management-container">
      {showAlert.show && (
        <Alert
          variant={showAlert.type}
          className="mb-3"
          dismissible
          onClose={() =>
            setShowAlert({ show: false, message: "", type: "success" })
          }
        >
          {showAlert.message}
        </Alert>
      )}
      <div className="d-flex align-items-center justify-content-center mb-4">
        <FaUsers className="me-2 text-primary" size={28} />
        <h2 className="mb-0">Quản lý người dùng</h2>
      </div>
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
      </Row>
      <Card className="search-filter-section mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col lg={7} md={8} className="mb-3 mb-lg-0">
              <InputGroup>
                <DropdownButton
                  variant="outline-secondary"
                  title={
                    searchType === "id"
                      ? "ID"
                      : searchType === "fullName"
                      ? "Họ và tên"
                      : searchType === "username"
                      ? "Username"
                      : searchType === "userIdCard"
                      ? "CMND/CCCD"
                      : "Chọn loại tìm kiếm"
                  }
                  id="search-type-dropdown"
                >
                  <Dropdown.Item
                    onClick={() => handleSearchTypeChange("id")}
                    active={searchType === "id"}
                  >
                    ID
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => handleSearchTypeChange("fullName")}
                    active={searchType === "fullName"}
                  >
                    Họ và tên
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => handleSearchTypeChange("username")}
                    active={searchType === "username"}
                  >
                    Username
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => handleSearchTypeChange("userIdCard")}
                    active={searchType === "userIdCard"}
                  >
                    CMND/CCCD
                  </Dropdown.Item>
                </DropdownButton>
                <Form.Control
                  type="text"
                  placeholder={
                    searchType === "id"
                      ? "Nhập ID người dùng..."
                      : searchType === "fullName"
                      ? "Nhập họ và tên..."
                      : searchType === "username"
                      ? "Nhập username..."
                      : searchType === "userIdCard"
                      ? "Nhập số CMND/CCCD..."
                      : "Nhập từ khóa tìm kiếm..."
                  }
                  value={searchText}
                  onChange={(e) => handleSearch(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && handleSearch(e.target.value)
                  }
                />
                <Button
                  variant="primary"
                  onClick={() => handleSearch(searchText)}
                >
                  <FaSearch />
                </Button>
              </InputGroup>
            </Col>
            <Col
              lg={5}
              md={4}
              className="mb-3 mb-lg-0 d-flex gap-2 align-items-center"
            >
              <Button
                variant="outline-primary"
                onClick={loadUsers}
                disabled={loading}
                className="me-2"
                title="Refresh danh sách"
              >
                {loading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <FaSync />
                )}
              </Button>
              <Form.Select
                value={filterRole}
                onChange={(e) => handleRoleFilter(e.target.value)}
                style={{ minWidth: "150px" }}
              >
                <option value="all">Tất cả vai trò</option>
                <option value="Staff">Staff</option>
                <option value="Member">Member</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>
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
                  filteredUsers.map((user, index) => (
                    <tr key={user.id}>
                      <td>{index + 1}</td>
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
                          {(user.role === "Member" ||
                            (user.role === "Staff" &&
                              currentUserRole === "Admin") ||
                            (user.role === "Admin" &&
                              currentUserRole === "Admin")) && (
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip>
                                  {canEdit
                                    ? "Chỉnh sửa"
                                    : "Chỉ Admin và Staff có quyền chỉnh sửa"}
                                </Tooltip>
                              }
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
      <Modal show={showDetailModal} onHide={handleDetailCancel} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaUser className="me-2" />
            Chi tiết người dùng
            {loadingDetail && (
              <Spinner animation="border" size="sm" className="ms-2" />
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingDetail ? (
            <div className="text-center p-4">
              <Spinner animation="border" />
              <p className="mt-2">Đang tải thông tin chi tiết...</p>
            </div>
          ) : (
            viewingUser && (
              <Tabs defaultActiveKey="personal" id="user-detail-tabs">
                <Tab
                  eventKey="personal"
                  title={
                    <span>
                      <FaUser className="me-2" />
                      Thông tin cá nhân
                    </span>
                  }
                >
                  <div className="mt-3">
                    <Row>
                      <Col md={6}>
                        <div className="info-item">
                          <strong>Mã người dùng:</strong>
                          <span>
                            {viewingUser.role === "Member"
                              ? viewingUser.userID || viewingUser.id
                              : viewingUser.role === "Staff"
                              ? viewingUser.staffID || viewingUser.id
                              : viewingUser.id}
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
                          <span>{viewingUser.phone || "Chưa cập nhật"}</span>
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
                          <span>
                            {viewingUser.userIdCard || "Chưa cập nhật"}
                          </span>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="info-item">
                          <strong>Ngày sinh:</strong>
                          <span>
                            {viewingUser.dateOfBirth || "Chưa cập nhật"}
                          </span>
                        </div>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <div className="info-item">
                          <strong>Vai trò:</strong>
                          <Badge
                            bg={getRoleBadgeVariant(viewingUser.role)}
                            className="ms-2"
                          >
                            {viewingUser.role}
                          </Badge>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </Tab>
                {viewingUser.role === "Member" && (
                  <Tab
                    eventKey="medical"
                    title={
                      <span>
                        <FaHeart className="me-2" />
                        Hồ sơ hiến máu
                      </span>
                    }
                  >
                    <div className="mt-3">
                      {viewingUser.hasDonorProfile ? (
                        <>
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
                                    <strong>Mã hồ sơ hiến máu:</strong>
                                    <Badge bg="success" className="ms-2">
                                      {viewingUser.donorID}
                                    </Badge>
                                  </div>
                                  <div className="info-item mb-3">
                                    <strong>Nhóm máu (bloodType):</strong>
                                    <span className="ms-2">
                                      {viewingUser.bloodTypeID
                                        ? getBloodTypeName(
                                            viewingUser.bloodTypeID
                                          )
                                        : "Chưa xác định"}
                                    </span>
                                  </div>
                                </Card.Body>
                              </Card>
                            </Col>
                            <Col md={6}>
                              <Card className="h-100">
                                <Card.Header className="bg-light">
                                  <h6 className="mb-0 text-info">
                                    <FaCalendarAlt className="me-2" />
                                    Lịch sử hiến máu
                                  </h6>
                                </Card.Header>
                                <Card.Body>
                                  {loadingHistory ? (
                                    <div className="text-center">
                                      <Spinner animation="border" size="sm" />{" "}
                                      Đang tải...
                                    </div>
                                  ) : donationHistory.length > 0 ? (
                                    <Table striped bordered hover size="sm">
                                      <thead>
                                        <tr>
                                          <th>Ngày hiến</th>
                                          <th>Số lượng (ml)</th>
                                          <th>Địa điểm</th>
                                          <th>Ghi chú</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {donationHistory.map((item, idx) => (
                                          <tr
                                            key={
                                              item.id ||
                                              `${
                                                item.donationDate || "nodate"
                                              }-${
                                                item.quantity || "noqty"
                                              }-${idx}`
                                            }
                                          >
                                            <td>
                                              {item.donationDate
                                                ? new Date(
                                                    item.donationDate
                                                  ).toLocaleDateString()
                                                : ""}
                                            </td>
                                            <td>{item.quantity || ""}</td>
                                            <td>{item.location || ""}</td>
                                            <td>{item.notes || ""}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </Table>
                                  ) : (
                                    <div className="text-muted">
                                      Chưa có lịch sử hiến máu
                                    </div>
                                  )}
                                </Card.Body>
                              </Card>
                            </Col>
                          </Row>
                        </>
                      ) : (
                        <div className="text-center p-5">
                          <FaInfoCircle
                            className="text-warning mb-3"
                            size={48}
                          />
                          <h4 className="text-warning mb-3">
                            Người dùng chưa có hồ sơ hiến máu
                          </h4>
                        </div>
                      )}
                    </div>
                  </Tab>
                )}
              </Tabs>
            )
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleDetailCancel}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
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
                <Tab
                  eventKey="basic"
                  title={
                    <span>
                      <FaUser className="me-2" />
                      Thông tin cơ bản
                    </span>
                  }
                >
                  <div className="mt-3">
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Mã người dùng</Form.Label>
                          <Form.Control
                            type="text"
                            value={
                              editingUser.role === "Member"
                                ? editingUser.userID || editingUser.id
                                : editingUser.role === "Staff"
                                ? editingUser.staffID || editingUser.id
                                : editingUser.id
                            }
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
                            defaultValue={editingUser.phone || ""}
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
                            defaultValue={editingUser.userIdCard || ""}
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
                            defaultValue={editingUser.dateOfBirth || ""}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Vai trò</Form.Label>
                          <Form.Select
                            name="role"
                            defaultValue={editingUser.role}
                            disabled
                          >
                            <option value="Member">Member</option>
                            <option value="Staff">Staff</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>
                </Tab>
              </Tabs>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={handleCancel}
              disabled={updating}
            >
              Hủy
            </Button>
            <Button variant="primary" type="submit" disabled={updating}>
              {updating ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Đang cập nhật...
                </>
              ) : (
                "Lưu thay đổi"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default UserManagement;
