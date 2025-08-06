// Import các thư viện React và hooks
import React, { useState } from "react";

// Import components từ Ant Design
import {
  Form,
  Input,
  Button,
  Typography,
  Alert,
  Row,
  Col,
  DatePicker,
} from "antd";

// Import icons từ Ant Design
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  IdcardOutlined,
  HeartFilled,
} from "@ant-design/icons";

// Import router hooks
import { useNavigate, Link } from "react-router-dom";

// Import API service
import { authAPI } from "../../services/authApi";

// Import CSS styles
import "../../styles/RegisterPage.css";

// Destructure Typography components
const { Title, Text, Paragraph } = Typography;

/**
 * Component trang đăng ký tài khoản
 * Cho phép người dùng tạo tài khoản mới trong hệ thống
 */
const RegisterPage = () => {
  // State quản lý trạng thái loading
  const [loading, setLoading] = useState(false);

  // State quản lý thông báo lỗi
  const [error, setError] = useState("");

  // State quản lý thông báo thành công
  const [success, setSuccess] = useState("");

  // Form instance
  const [form] = Form.useForm();

  // Hook để điều hướng
  const navigate = useNavigate();

  /**
   * Hàm xử lý khi form đăng ký được submit
   * @param {Object} values - Dữ liệu từ form
   */
  const onFinish = async (values) => {
    setLoading(true); // Bắt đầu loading
    setError(""); // Reset error message
    setSuccess(""); // Reset success message

    try {
      console.log("Form values:", values);

      // Chuẩn bị dữ liệu theo format API yêu cầu
      const userData = {
        email: values.email.trim().toLowerCase(), // Normalize email
        password: values.password,
        confirmPassword: values.confirmPassword,
        username: values.username.trim(), // Trim whitespace
        fullName: values.fullName.trim(),
        phone: values.phone.trim(),
        userIdCard: values.userIdCard.trim(),
        dateOfBirth: values.dateOfBirth
          ? values.dateOfBirth.format("YYYY-MM-DD")
          : null,
      };

      console.log("API request data:", userData);

      // Gọi API đăng ký
      const result = await authAPI.register(userData);

      if (result.success) {
        console.log("Registration successful:", result.data);
        setSuccess(
          "Đăng ký tài khoản thành công! Chào mừng bạn đến với cộng đồng hiến máu."
        );

        // Redirect to login after success
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        console.error("Registration failed:", result.error);
        setError(
          result.error || "Đăng ký tài khoản thất bại. Vui lòng thử lại."
        );
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("Đăng ký tài khoản thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
    setError("Vui lòng kiểm tra lại thông tin đăng ký tài khoản.");
  };

  return (
    <div className="modern-register-container">
      {/* Left Side - Registration Form */}
      <div className="register-left-panel">
        <div className="register-form-container">
          <div className="form-header">
            <Title level={2} className="form-title">
              Đăng ký tài khoản
            </Title>
            <Text className="form-subtitle">
              Tạo tài khoản để tham gia cộng đồng hiến máu
            </Text>
          </div>

          <Form
            form={form}
            name="register"
            className="modern-register-form"
            layout="vertical"
            size="large"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            {/* Thông tin tài khoản */}
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Tên đăng nhập"
                  name="username"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên đăng nhập!" },
                    {
                      min: 3,
                      message: "Tên đăng nhập phải có ít nhất 3 ký tự!",
                    },
                    {
                      pattern: /^[a-zA-Z0-9_]+$/,
                      message: "Chỉ được sử dụng chữ cái, số và dấu gạch dưới!",
                    },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Nhập tên đăng nhập"
                    className="modern-input"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: "Vui lòng nhập email!" },
                    { type: "email", message: "Email không hợp lệ!" },
                    {
                      pattern: /^[a-zA-Z0-9._%+-]+@gmail\.com$/,
                      message: "Email phải có đuôi @gmail.com!",
                    },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="Nhập địa chỉ email"
                    className="modern-input"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Mật khẩu"
                  name="password"
                  rules={[
                    { required: true, message: "Vui lòng nhập mật khẩu!" },
                    { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
                    {
                      pattern: /^(?=.*[A-Za-z])(?=.*\d)/,
                      message: "Mật khẩu phải chứa ít nhất 1 chữ cái và 1 số!",
                    },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Nhập mật khẩu"
                    className="modern-input"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Xác nhận mật khẩu"
                  name="confirmPassword"
                  dependencies={["password"]}
                  rules={[
                    { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error("Mật khẩu xác nhận không khớp!")
                        );
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Xác nhận mật khẩu"
                    className="modern-input"
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Thông tin cá nhân */}
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Họ và tên"
                  name="fullName"
                  rules={[
                    { required: true, message: "Vui lòng nhập họ và tên!" },
                    { min: 2, message: "Họ và tên phải có ít nhất 2 ký tự!" },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Nhập họ và tên đầy đủ"
                    className="modern-input"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Số điện thoại"
                  name="phone"
                  rules={[
                    { required: true, message: "Vui lòng nhập số điện thoại!" },
                    {
                      pattern: /^[0-9]{10,11}$/,
                      message: "Số điện thoại không hợp lệ!",
                    },
                  ]}
                >
                  <Input
                    prefix={<PhoneOutlined />}
                    placeholder="Nhập số điện thoại"
                    className="modern-input"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="CMND/CCCD"
                  name="userIdCard"
                  rules={[
                    { required: true, message: "Vui lòng nhập số CMND/CCCD!" },
                    {
                      pattern: /^[0-9]{9,12}$/,
                      message: "Số CMND/CCCD không hợp lệ!",
                    },
                  ]}
                >
                  <Input
                    prefix={<IdcardOutlined />}
                    placeholder="Nhập số CMND/CCCD"
                    className="modern-input"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Ngày sinh"
                  name="dateOfBirth"
                  rules={[
                    { required: true, message: "Vui lòng chọn ngày sinh!" },
                  ]}
                >
                  <DatePicker
                    placeholder="Chọn ngày sinh"
                    className="modern-input"
                    style={{ width: "100%" }}
                    format="DD/MM/YYYY"
                  />
                </Form.Item>
              </Col>
            </Row>

            {(error || success) && (
              <Alert
                message={error || success}
                type={error ? "error" : "success"}
                showIcon
                className="alert-message"
                style={{ marginBottom: 24 }}
              />
            )}

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="submit-btn"
                style={{ width: "100%", height: 50 }}
              >
                {loading ? "Đang xử lý..." : "Tạo tài khoản"}
              </Button>
            </Form.Item>
          </Form>

          <div className="form-footer">
            <Text type="secondary" className="footer-note">
              Đã có tài khoản?{" "}
              <Link to="/login" className="login-link">
                Đăng nhập ngay
              </Link>
            </Text>
          </div>
        </div>
      </div>

      {/* Right Side - Branding */}
      <div className="register-right-panel">
        <div className="brand-section">
          <div className="brand-logo">
            <HeartFilled className="brand-heart" />
          </div>
          <Title level={1} className="brand-title">
            Blood Donation
          </Title>
          <Paragraph className="brand-subtitle">
            Mỗi giọt máu - Một sự sống
          </Paragraph>

          <div className="features-list">
            <div className="feature-item">
              <HeartFilled className="feature-icon" />
              <div className="feature-content">
                <div className="feature-title">Cứu sống người khác</div>
                <div className="feature-description">
                  Mỗi lần hiến máu giúp cứu sống 3 người
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
