// Import các thư viện React và Ant Design cần thiết
import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Alert,
  Spin,
  Space,
  Row,
  Col,
  message,
} from "antd";

// Import các icon từ Ant Design
import {
  UserOutlined,
  LockOutlined,
  HeartFilled,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";

// Import router hooks và components
import { useNavigate, Link } from "react-router-dom";

// Import API service để xác thực
import { authAPI } from "../../services/authApi";

// Import CSS cho trang đăng nhập
import "../../styles/LoginPage.css";

// Destructure Typography components
const { Title, Text, Paragraph } = Typography;

/**
 * Component trang đăng nhập
 * Cho phép người dùng đăng nhập vào hệ thống với email và mật khẩu
 */
const LoginPage = () => {
  // State quản lý trạng thái loading khi đăng nhập
  const [loading, setLoading] = useState(false);

  // State quản lý thông báo lỗi
  const [error, setError] = useState("");

  // Form instance để quản lý form đăng nhập
  const [form] = Form.useForm();

  // Hook để điều hướng sau khi đăng nhập thành công
  const navigate = useNavigate();

  // Tài khoản demo cho testing (fallback khi API không khả dụng)
  const demoAccounts = {
    member: {
      email: "member@example.com",
      password: "member123",
      role: "Member",
    },
    staff: { email: "staff@gmail.com", password: "staff123", role: "Staff" }, // Thông tin API thật
    admin: { email: "admin01@gmail.com", password: "admin123", role: "Admin" }, // Thông tin API thật
  };

  // Hàm xử lý khi form được submit
  const onFinish = async (values) => {
    setLoading(true);
    setError("");

    try {
      // Gọi API đăng nhập với thông tin từ form
      console.log("LoginPage - Calling API with values:", values);
      const result = await authAPI.login({
        email: values.email,
        password: values.password,
      });

      if (result.success) {
        // API đăng nhập thành công
        const data = result.data;
        console.log("API Response data:", data);
        console.log("User email:", values.email);

        // Lưu token vào localStorage
        localStorage.setItem(
          "userToken",
          data.token || data.accessToken || "authenticated"
        );

        // Decode JWT token để lấy thông tin user
        let userRole = "";
        let userId = "";
        let username = "";

        try {
          if (data.token) {
            // Decode JWT token payload
            const base64Url = data.token.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split("")
                .map(function (c) {
                  return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
                })
                .join("")
            );

            const tokenPayload = JSON.parse(jsonPayload);
            console.log("JWT Token payload:", tokenPayload);

            // Lấy thông tin từ JWT claims
            userRole =
              tokenPayload[
                "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
              ] || "Member";
            userId =
              tokenPayload[
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
              ] || "";
            username =
              tokenPayload[
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
              ] || values.email;
          }
        } catch (error) {
          console.error("Error decoding JWT token:", error);
          // Fallback: determine role từ email pattern
          if (values.email.includes("staff@")) {
            userRole = "Staff";
          } else if (values.email.includes("admin@")) {
            userRole = "Admin";
          } else {
            userRole = "Member";
          }
          username = values.email;
        }

        localStorage.setItem("userRole", userRole);
        localStorage.setItem("username", username);
        localStorage.setItem("userId", userId);
        localStorage.setItem("userEmail", values.email);

        // Trigger storage event để update header
        window.dispatchEvent(new Event("storage"));

        // Show success message
        message.success({
          content: `Chào mừng ${
            data.username || data.email || values.email
          } đã quay trở lại!`,
          duration: 3,
          style: {
            marginTop: "2vh",
          },
        });

        // Navigate đến trang tương ứng với role
        const role = userRole.toLowerCase();
        console.log("Navigating to role:", role);
        navigate(`/${role}`);
      } else {
        // API trả về lỗi, thử fallback demo accounts
        throw new Error(result.error || "API login failed");
      }
    } catch (err) {
      console.error("Login error:", err);

      // Fallback: Thử demo accounts nếu API không available
      console.log("API không available, thử demo accounts...");

      const account = Object.values(demoAccounts).find(
        (acc) => acc.email === values.email && acc.password === values.password
      );

      if (account) {
        // Demo mode thành công
        localStorage.setItem("userToken", "demo-token");
        localStorage.setItem("userRole", account.role);
        localStorage.setItem("username", account.email);
        localStorage.setItem("userId", "demo-user-id");

        // Trigger storage event
        window.dispatchEvent(new Event("storage"));

        // Show success message với Demo Mode
        message.success({
          content: `Chào mừng ${account.email} đã quay trở lại! (Demo Mode)`,
          duration: 3,
          style: {
            marginTop: "2vh",
          },
        });

        // Navigate
        const role = account.role.toLowerCase();
        navigate(`/${role}`);
      } else {
        setError("Email hoặc mật khẩu không đúng!");
      }
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
    setError("Vui lòng kiểm tra lại email và mật khẩu.");
  };

  const fillDemoAccount = (accountType) => {
    const account = demoAccounts[accountType];
    form.setFieldsValue({
      email: account.email,
      password: account.password,
    });
  };

  return (
    <div className="modern-login-container">
      {/* Left Side - Login Form */}
      <div className="login-left-panel">
        <div className="login-form-container">
          <div className="form-header">
            <Title level={2} className="form-title">
              Đăng nhập
            </Title>
            <Text className="form-subtitle">
              Chào mừng bạn trở lại hệ thống Blood Donation
            </Text>
          </div>

          <Form
            name="login"
            form={form}
            className="modern-login-form"
            layout="vertical"
            size="large"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không hợp lệ!" },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Nhập địa chỉ email"
                className="modern-input"
              />
            </Form.Item>

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu!" },
                { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Nhập mật khẩu"
                className="modern-input"
              />
            </Form.Item>
            <div style={{ textAlign: "right", marginBottom: 16 }}>
              <Link to="/forgot-password" className="forgot-password-link">
                Quên mật khẩu?
              </Link>
            </div>

            {error && (
              <Alert
                message={error}
                type="error"
                showIcon
                className="error-alert"
              />
            )}

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                className="modern-submit-btn"
              >
                {loading ? "Đang xử lý..." : "Đăng nhập"}
              </Button>
            </Form.Item>
          </Form>

          <div className="form-footer">
            <div className="footer-register">
              <Text type="secondary" className="footer-note">
                Chưa có tài khoản?{" "}
                <Link to="/register" className="register-link">
                  Đăng ký ngay
                </Link>
              </Text>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Branding */}
      <div className="login-right-panel">
        <div className="brand-section">
          <div className="brand-logo">
            <HeartFilled className="brand-heart" />
          </div>
          <Title level={1} className="brand-title">
            Blood Donation
          </Title>
          <Paragraph className="brand-subtitle">
            Kết nối yêu thương - Cứu sống hy vọng
          </Paragraph>

          <div className="features-list">
            <div className="feature-item">
              <SafetyCertificateOutlined className="feature-icon" />
              <div className="feature-content">
                <div className="feature-title">Bảo mật tuyệt đối</div>
                <div className="feature-description">
                  Thông tin được mã hóa SSL 256-bit
                </div>
              </div>
            </div>
            <div className="feature-item">
              <ThunderboltOutlined className="feature-icon" />
              <div className="feature-content">
                <div className="feature-title">Xử lý nhanh chóng</div>
                <div className="feature-description">
                  Hệ thống phản hồi trong 0.5 giây
                </div>
              </div>
            </div>
            <div className="feature-item">
              <HeartFilled className="feature-icon" />
              <div className="feature-content">
                <div className="feature-title">Cứu sống con người</div>
                <div className="feature-description">
                  Mỗi lần hiến máu cứu được 3 người
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
