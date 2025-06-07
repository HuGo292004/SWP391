import {
    AlertOutlined,
    BellOutlined,
    CheckCircleFilled,
    ClockCircleFilled,
    DashboardOutlined,
    HeartOutlined,
    LogoutOutlined,
    MedicineBoxOutlined,
    MenuOutlined,
    SearchOutlined,
    UserOutlined,
    CloseOutlined,
  } from "@ant-design/icons";
  import {
    Avatar,
    Badge,
    Button,
    Divider,
    Drawer,
    Dropdown,
    Layout,
    Menu,
    Space,
    Typography,
  } from "antd";  
  import { useEffect, useState } from "react";
  import { Link, useLocation, useNavigate } from "react-router-dom";
  import '../../styles/components.css';

  
  const { Header } = Layout;
  const { Text } = Typography;
  
  // Y tế theme colors - Cải thiện bảng màu
  const healthThemeColors = {
    primary: "#1565C0", // Xanh dương y tế chuyên nghiệp hơn
    secondary: "#42A5F5", // Xanh dương nhạt
    accent: "#E91E63", // Hồng accent
    light: "#F8FAFC", // Xám rất nhạt
    white: "#FFFFFF",
    textDark: "#263238",
    success: "#2E7D32", // Xanh lá đậm hơn
    warning: "#F57C00", // Cam
    error: "#C62828", // Đỏ đậm
    navBlue: "#0D47A1", // Xanh navbar đậm hơn
    navLightBlue: "#1976D2", // Xanh active state
    shadow: "rgba(13, 71, 161, 0.15)", // Shadow với màu xanh
    gradient: "linear-gradient(135deg, #1565C0 0%, #1976D2 50%, #42A5F5 100%)",
  };
  
  const AppHeader = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [visible, setVisible] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [notificationVisible, setNotificationVisible] = useState(false);
    
    // TODO: Replace with actual authentication context/hook
    // For now, using fallbacks to prevent crashes
    const user = null; // This should come from authentication context
    const isAuthenticated = false; // This should come from authentication context
    const logout = async () => { 
      console.log('Logout function not implemented'); 
      // This should come from authentication context
    };
    
    const [notifications, setNotifications] = useState([
      {
        id: 1,
        type: "info",
        title: "Chiến dịch hiến máu mới",
        message: 'Chiến dịch "Giọt máu tình người" sẽ diễn ra vào cuối tuần này',
        time: "10 phút trước",
        read: false,
        icon: "💉",
      },
      {
        id: 2,
        type: "urgent",
        title: "Cần máu khẩn cấp",
        message: "Bệnh viện Chợ Rẫy cần gấp 5 đơn vị máu nhóm O+",
        time: "30 phút trước",
        read: false,
        icon: "🚨",
      },
      {
        id: 3,
        type: "success",
        title: "Hiến máu thành công",
        message: "Cảm ơn bạn đã tham gia hiến máu tại trung tâm y tế",
        time: "2 giờ trước",
        read: true,
        icon: "✅",
      },
      {
        id: 4,
        type: "reminder",
        title: "Nhắc nhở lịch hẹn",
        message: "Bạn có lịch hẹn hiến máu vào ngày mai lúc 9:00 AM",
        time: "1 ngày trước",
        read: false,
        icon: "⏰",
      },
    ]);
  

  
    // Effect để theo dõi scroll và thay đổi header style
    useEffect(() => {
      const handleScroll = () => {
        const isScrolled = window.scrollY > 10;
        if (isScrolled !== scrolled) {
          setScrolled(isScrolled);
        }
      };
  
      window.addEventListener("scroll", handleScroll);
      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    }, [scrolled]);
  
    // Effect để đóng notification khi click ra ngoài
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (notificationVisible) {
          const notificationElement = event.target.closest(
            ".notification-container"
          );
          const bellElement = event.target.closest(".modern-bell-button");
  
          if (!notificationElement && !bellElement) {
            setNotificationVisible(false);
          }
        }
      };
  
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [notificationVisible]);
  
    const showDrawer = () => {
      setVisible(true);
    };
  
    const onClose = () => {
      setVisible(false);
    };
  
    const handleLogout = async () => {
      await logout();
      onClose(); // Đóng menu drawer
      navigate("/"); // Chuyển hướng về homepage
    };
  
    // Notification handlers
    const toggleNotification = () => {
      setNotificationVisible(!notificationVisible);
    };
  
    const markAsRead = (id) => {
      setNotifications((prev) =>
        prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
      );
    };
  
    const markAllAsRead = () => {
      setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
    };
  
    const removeNotification = (id) => {
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    };
  
    const getUnreadCount = () => {
      return notifications.filter((notif) => !notif.read).length;
    };
  
    const getNotificationColor = (type) => {
      switch (type) {
        case "urgent":
          return "#FF4D4F";
        case "success":
          return "#52C41A";
        case "info":
          return "#1890FF";
        case "reminder":
          return "#FA8C16";
        default:
          return "#1890FF";
      }
    };
  
    // Navigation items cho thanh màu xanh đậm - hiển thị dựa vào vai trò
    const navItems = [
      { key: "/", label: "TRANG CHỦ", path: "/" },
      { key: "/faq", label: "HỎI - ĐÁP", path: "/faq" },
      { key: "/news", label: "TIN TỨC", path: "/news" },
      { key: "/support", label: "LIÊN HỆ", path: "/support" },
    ];
  
    // Thêm submenu cho các chức năng - hiển thị tất cả chức năng cho cả guest
    const menuItems = [
      // Ẩn "Hiến máu" cho role staff và admin
      ...(user?.role !== "staff" && user?.role !== "admin"
        ? [
            {
              key: "donation",
              icon: <HeartOutlined />,
              label: "Hiến máu",
              children: [
                {
                  key: "/register-donor",
                  label: <Link to="/register-donor">Đăng ký hiến máu</Link>,
                },
                {
                  key: "/donor-guide",
                  label: <Link to="/donor-guide">Hướng dẫn hiến máu</Link>,
                },
                {
                  key: "/donor-benefits",
                  label: (
                    <Link to="/donor-benefits">Quyền lợi người hiến máu</Link>
                  ),
                },
              ],
            },
          ]
        : []),
      // Ẩn "Nhận máu" cho role staff và admin
      ...(user?.role !== "staff" && user?.role !== "admin"
        ? [
            {
              key: "recipient",
              icon: <MedicineBoxOutlined />,
              label: "Nhận máu",
              children: [
                {
                  key: "/request-blood",
                  label: <Link to="/request-blood">Đăng ký nhận máu</Link>,
                },
                {
                  key: "/recipient-guide",
                  label: <Link to="/recipient-guide">Hướng dẫn nhận máu</Link>,
                },
              ],
            },
          ]
        : []),
      // Ẩn "Tìm kiếm" cho role member và admin
      ...(user?.role !== "member" && user?.role !== "admin"
        ? [
            {
              key: "search",
              icon: <SearchOutlined />,
              label: "Tìm kiếm",
              children: [
                {
                  key: "/search-blood",
                  label: <Link to="/search-blood">Tìm nhóm máu</Link>,
                },
                {
                  key: "/blood-banks",
                  label: <Link to="/blood-banks">Ngân hàng máu</Link>,
                },
              ],
            },
          ]
        : []),
      // Ẩn "Yêu cầu khẩn cấp" cho role member và admin
      ...(user?.role !== "member" && user?.role !== "admin"
        ? [
            {
              key: "/emergency-request",
              icon: <AlertOutlined />,
              label: <Link to="/emergency-request">Yêu cầu khẩn cấp</Link>,
            },
          ]
        : []),
      // Chỉ hiển thị dashboard cho người đã đăng nhập
      ...(isAuthenticated
        ? [
            {
              key: "/dashboard",
              icon: <DashboardOutlined />,
              label: (
                <Link to={user?.role ? `/${user.role}/dashboard` : "/dashboard"}>
                  Dashboard
                </Link>
              ),
            },
          ]
        : []),
    ];
  
    // Modern Notification Component
    const NotificationDropdown = () => (
      <div
        className="notification-container"
        style={{
          position: "absolute",
          top: "100%",
          right: 0,
          width: "400px",
          maxHeight: "500px",
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
          border: "1px solid #f0f0f0",
          zIndex: 10000,
          overflow: "hidden",
          marginTop: "8px",
          animation: "slideInDown 0.3s ease-out",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#fafafa",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <BellOutlined
              style={{ fontSize: "18px", color: healthThemeColors.primary }}
            />
            <Text strong style={{ fontSize: "16px" }}>
              Thông báo
            </Text>
            {getUnreadCount() > 0 && (
              <Badge
                count={getUnreadCount()}
                style={{ backgroundColor: healthThemeColors.accent }}
              />
            )}
          </div>
          <Button
            type="link"
            size="small"
            onClick={markAllAsRead}
            style={{ fontSize: "12px", padding: "0" }}
          >
            Đánh dấu tất cả đã đọc
          </Button>
        </div>
  
        {/* Notifications List */}
        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          {notifications.length === 0 ? (
            <div
              style={{
                padding: "40px 20px",
                textAlign: "center",
                color: "#999",
              }}
            >
              <BellOutlined style={{ fontSize: "32px", marginBottom: "8px" }} />
              <div>Không có thông báo nào</div>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid #f5f5f5",
                  backgroundColor: notification.read ? "white" : "#f6f8ff",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = notification.read
                    ? "#fafafa"
                    : "#e6f0ff";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = notification.read
                    ? "white"
                    : "#f6f8ff";
                }}
                onClick={() => markAsRead(notification.id)}
              >
                <div style={{ display: "flex", gap: "12px" }}>
                  <div
                    style={{
                      fontSize: "20px",
                      marginTop: "2px",
                    }}
                  >
                    {notification.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <Text
                        strong
                        style={{
                          fontSize: "14px",
                          color: getNotificationColor(notification.type),
                          marginBottom: "4px",
                          display: "block",
                        }}
                      >
                        {notification.title}
                      </Text>
                      <Button
                        type="text"
                        size="small"
                        icon={<CloseOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(notification.id);
                        }}
                        style={{
                          width: "20px",
                          height: "20px",
                          minWidth: "unset",
                          padding: 0,
                          fontSize: "10px",
                          color: "#999",
                        }}
                      />
                    </div>
                    <Text
                      style={{
                        fontSize: "13px",
                        color: "#666",
                        lineHeight: "1.4",
                        display: "block",
                        marginBottom: "6px",
                      }}
                    >
                      {notification.message}
                    </Text>
                    <Text type="secondary" style={{ fontSize: "11px" }}>
                      {notification.time}
                    </Text>
                  </div>
                </div>
                {!notification.read && (
                  <div
                    style={{
                      position: "absolute",
                      right: "8px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor: healthThemeColors.accent,
                    }}
                  />
                )}
              </div>
            ))
          )}
        </div>
  
        {/* Footer */}
        <div
          style={{
            padding: "12px 20px",
            borderTop: "1px solid #f0f0f0",
            textAlign: "center",
            backgroundColor: "#fafafa",
          }}
        >
          <Button
            type="link"
            onClick={() => {
              setNotificationVisible(false);
              navigate("/notifications");
            }}
            style={{
              color: healthThemeColors.primary,
              fontWeight: "bold",
              fontSize: "13px",
            }}
          >
            Xem tất cả thông báo →
          </Button>
        </div>
      </div>
    );
  
    return (
      <>
        {/* Header trên cùng */}
        <Header
          style={{
            background: healthThemeColors.gradient,
            height: "80px",
            padding: "0 60px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: scrolled
              ? `0 8px 32px ${healthThemeColors.shadow}`
              : `0 4px 16px ${healthThemeColors.shadow}`,
            position: "sticky",
            top: 0,
            zIndex: 1000,
            width: "100%",
            backdropFilter: scrolled ? "blur(12px)" : "none",
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            borderBottom: `1px solid rgba(255, 255, 255, 0.1)`,
          }}
          className={scrolled ? "header-scrolled" : ""}
        >
          <div
            className="logo"
            style={{
              fontSize: "28px",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              color: "#FFFFFF",
              cursor: "pointer",
              letterSpacing: "-0.5px",
            }}
          >
            <Link
              to="/"
              style={{
                color: "inherit",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "14px",
                  background: "rgba(255, 255, 255, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  transition: "all 0.3s ease",
                }}
              >
                <HeartOutlined
                  style={{ fontSize: "24px", color: healthThemeColors.accent }}
                />
              </div>
              <span
                style={{
                  fontFamily: "'Inter', 'Roboto', sans-serif",
                  fontWeight: "700",
                }}
              >
                BloodDonate
              </span>
            </Link>
          </div>
  
          <Space size="large" style={{ alignItems: "center" }}>
            {/* Desktop Menu - Ẩn đi */}
            {/* <div className="desktop-menu">
              <Menu
                theme="dark"
                mode="horizontal"
                selectedKeys={[location.pathname]}
                items={menuItems}
                className="desktop-menu"
                style={{ 
                  minWidth: 650, 
                  backgroundColor: 'transparent', 
                  borderBottom: 'none',
                  fontSize: '15px',
                  fontWeight: '500',
                  letterSpacing: '0.3px'
                }}
              />
            </div> */}
  
            {isAuthenticated ? (
              <>
                {/* Modern Notification Bell */}
                <div style={{ position: "relative" }}>
                  <Badge
                    count={getUnreadCount()}
                    size="small"
                    style={{ backgroundColor: healthThemeColors.accent }}
                    offset={[-2, 2]}
                  >
                    <Button
                      type="text"
                      icon={
                        <BellOutlined
                          style={{ fontSize: "20px", color: "#FFFFFF" }}
                        />
                      }
                      onClick={toggleNotification}
                      style={{
                        border: "none",
                        background: "rgba(255, 255, 255, 0.1)",
                        padding: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.3s ease",
                        borderRadius: "12px",
                        backdropFilter: "blur(10px)",
                        width: "44px",
                        height: "44px",
                      }}
                      className="modern-bell-button"
                    />
                  </Badge>
  
                  {/* Notification Dropdown */}
                  {notificationVisible && <NotificationDropdown />}
                </div>
  
                {/* User Info Display - Desktop - Now Clickable */}
                <div
                  className="user-info-desktop"
                  onClick={showDrawer}
                  style={{
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    padding: "8px 12px",
                    borderRadius: "12px",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "rgba(255, 255, 255, 0.15)";
                    e.target.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                    e.target.style.transform = "translateY(0)";
                  }}
                >
                  <Avatar
                    size={36}
                    icon={<UserOutlined />}
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      color: "white",
                      border: "2px solid rgba(255, 255, 255, 0.3)",
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      lineHeight: "1.2",
                    }}
                  >
                    <Text
                      strong
                      style={{
                        color: "white",
                        fontSize: "14px",
                        marginBottom: "2px",
                        display: "block",
                      }}
                    >
                      {user?.fullName || "Người dùng"}
                    </Text>
                    <Text
                      style={{
                        color: "rgba(255, 255, 255, 0.8)",
                        fontSize: "12px",
                        display: "block",
                      }}
                    >
                      {user?.email || "user@example.com"}
                    </Text>
                  </div>
                  {/* <MenuOutlined style={{ 
                    fontSize: '16px', 
                    color: 'rgba(255, 255, 255, 0.9)',
                    marginLeft: '8px'
                  }} /> */}
                </div>
              </>
            ) : (
              <Space size="middle">
                <Link to="/login">
                  <Button
                    type="default"
                    icon={<UserOutlined />}
                    className="login-btn"
                    style={{
                      borderRadius: "10px",
                      borderColor: "rgba(255, 255, 255, 0.3)",
                      color: "white",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      backdropFilter: "blur(10px)",
                      fontWeight: "500",
                      height: "40px",
                      paddingLeft: "16px",
                      paddingRight: "16px",
                    }}
                  >
                    Đăng nhập
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    type="primary"
                    className="register-btn"
                    style={{
                      borderRadius: "10px",
                      backgroundColor: healthThemeColors.accent,
                      borderColor: healthThemeColors.accent,
                      fontWeight: "600",
                      height: "40px",
                      paddingLeft: "20px",
                      paddingRight: "20px",
                      boxShadow: "0 4px 12px rgba(233, 30, 99, 0.3)",
                    }}
                  >
                    Đăng ký
                  </Button>
                </Link>
              </Space>
            )}
          </Space>
        </Header>
  
        {/* Blue Navigation Bar */}
        <div
          style={{
            background: `linear-gradient(90deg, ${healthThemeColors.navBlue} 0%, #1565C0 100%)`,
            borderBottom: "1px solid rgba(255,255,255,0.15)",
            display: "flex",
            justifyContent: "center",
            height: "48px",
            overflowX: "auto",
            boxShadow: `0 2px 8px ${healthThemeColors.shadow}`,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "1200px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            {navItems.map((item, index) => (
              <Link
                key={item.key}
                to={item.path}
                className="nav-item"
                style={{
                  color: "white",
                  padding: "0 20px",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor:
                    location.pathname === item.path
                      ? healthThemeColors.navLightBlue
                      : "transparent",
                  borderRight:
                    index !== navItems.length - 1
                      ? "1px solid rgba(255,255,255,0.15)"
                      : "none",
                  fontWeight: "600",
                  fontSize: "13px",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  flex: `1 1 ${100 / navItems.length}%`,
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  textDecoration: "none",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  position: "relative",
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
  
        {/* Mobile Drawer Menu */}
        <Drawer
          title={
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <HeartOutlined
                style={{ fontSize: "28px", color: healthThemeColors.accent }}
              />
              <span
                style={{
                  color: healthThemeColors.primary,
                  fontWeight: "bold",
                  fontSize: "18px",
                }}
              >
                BloodDonate
              </span>
            </div>
          }
          placement="right"
          onClose={onClose}
          open={visible}
          width={300}
          styles={{
            header: { borderBottom: `2px solid ${healthThemeColors.primary}` },
            body: { padding: 0 },
          }}
        >
          {isAuthenticated ? (
            <>
              <div style={{ backgroundColor: healthThemeColors.light }}>
                {/* <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <Avatar size={50} icon={<UserOutlined />} style={{ backgroundColor: healthThemeColors.primary }} />
                  <div>
                    <Text strong style={{ display: 'block', fontSize: '16px' }}>{user?.fullName || 'Người dùng'}</Text>
                    <Text type="secondary">{user?.email || 'user@example.com'}</Text>
                  </div>
                </div> */}
              </div>
  
              <Menu
                mode="vertical"
                selectedKeys={[location.pathname]}
                items={[
                  ...menuItems,
                  { type: "divider" },
                  {
                    key: "profile",
                    icon: (
                      <UserOutlined
                        style={{ fontSize: "16px", color: "#1976D2" }}
                      />
                    ),
                    label: <Link to="/profile">Hồ sơ cá nhân</Link>,
                  },
                  {
                    key: "logout",
                    icon: (
                      <LogoutOutlined
                        style={{ fontSize: "16px", color: "#F44336" }}
                      />
                    ),
                    label: <span onClick={handleLogout}>Đăng xuất</span>,
                  },
                ]}
                onClick={(e) => {
                  if (e.key !== "logout") {
                    onClose();
                  }
                }}
                style={{ borderRight: "none", fontSize: "16px" }}
              />
            </>
          ) : (
            <>
              <div style={{ padding: "20px" }}>
                <Space
                  direction="vertical"
                  style={{ width: "100%" }}
                  size="middle"
                >
                  <Link to="/login" style={{ width: "100%" }}>
                    <Button
                      type="primary"
                      block
                      size="large"
                      icon={<UserOutlined />}
                    >
                      Đăng nhập
                    </Button>
                  </Link>
                  <Link to="/register" style={{ width: "100%" }}>
                    <Button
                      block
                      size="large"
                      style={{
                        backgroundColor: healthThemeColors.accent,
                        borderColor: healthThemeColors.accent,
                        color: "white",
                      }}
                    >
                      Đăng ký
                    </Button>
                  </Link>
                </Space>
              </div>
  
              <Divider style={{ margin: "10px 0" }} />
  
              <Menu
                mode="vertical"
                selectedKeys={[location.pathname]}
                items={[
                  ...navItems.map((item) => ({
                    key: item.key,
                    label: <Link to={item.path}>{item.label}</Link>,
                  })),
                  { type: "divider" },
                  ...menuItems,
                ]}
                onClick={onClose}
                style={{ borderRight: "none", fontSize: "16px" }}
              />
            </>
          )}
        </Drawer>
      </>
    );
  };
  
  export default AppHeader;
