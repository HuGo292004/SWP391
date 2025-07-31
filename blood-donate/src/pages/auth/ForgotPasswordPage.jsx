// Import các thư viện React và hooks cần thiết
import React, { useState } from "react";

// Import các component từ Ant Design
import {
  Card, // Component card container
  Form, // Component form
  Input, // Component input
  Button, // Component button
  Typography, // Component typography
  message, // Service thông báo
  Space, // Component khoảng cách
  Result, // Component hiển thị kết quả
} from "antd";

// Import các icon từ Ant Design
import {
  MailOutlined, // Icon email
  ArrowLeftOutlined, // Icon mũi tên trái
  CheckCircleOutlined, // Icon check circle
  LockOutlined, // Icon khóa
} from "@ant-design/icons";

// Import routing utilities
import { Link, useNavigate } from "react-router-dom";

// Import CSS styles
import "../../styles/LoginPage.css";

// Destructure Typography components
const { Title, Text } = Typography;

/**
 * Trang Quên Mật Khẩu
 * Cho phép người dùng nhập email để nhận link reset mật khẩu
 */
const ForgotPasswordPage = () => {
  // Khởi tạo form instance
  const [form] = Form.useForm();

  // State quản lý trạng thái loading
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  // Xử lý gửi email đặt lại mật khẩu
  const handleSendResetEmail = async (values) => {
    setLoading(true);
    try {
      // Giả lập gọi API
      console.log("Sending reset email to:", values.email);

      // Giả lập thời gian xử lý
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setEmail(values.email);
      setEmailSent(true);
      message.success("Email đặt lại mật khẩu đã được gửi!");
    } catch (error) {
      console.error("Error sending reset email:", error);
      message.error("Có lỗi xảy ra. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-background">
        <div className="login-overlay"></div>
      </div>

      <div className="login-container">
        <Card
          className="login-card"
          style={{
            maxWidth: "400px",
            width: "100%",
            margin: "0 auto",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            borderRadius: "16px",
            border: "none",
          }}
        >
          {!emailSent ? (
            // Form nhập email
            <div>
              <div className="text-center mb-4">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "60px",
                    height: "60px",
                    background:
                      "linear-gradient(135deg, #1976D2 0%, #1565C0 100%)",
                    borderRadius: "50%",
                    margin: "0 auto 16px auto",
                  }}
                >
                  <MailOutlined style={{ fontSize: "28px", color: "white" }} />
                </div>
                <Title
                  level={3}
                  style={{ color: "#1976D2", marginBottom: "8px" }}
                >
                  Quên Mật Khẩu?
                </Title>
                <Text type="secondary">
                  Nhập email của bạn để nhận liên kết đặt lại mật khẩu
                </Text>
              </div>

              <Form
                form={form}
                name="forgot-password"
                onFinish={handleSendResetEmail}
                layout="vertical"
                size="large"
              >
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: "Vui lòng nhập email!" },
                    { type: "email", message: "Email không hợp lệ!" },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="Nhập địa chỉ email của bạn"
                    autoComplete="email"
                  />
                </Form.Item>

                <Form.Item style={{ marginBottom: "16px" }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                    style={{
                      background:
                        "linear-gradient(135deg, #1976D2 0%, #1565C0 100%)",
                      border: "none",
                      height: "44px",
                      fontSize: "16px",
                      fontWeight: "600",
                    }}
                  >
                    Gửi Email Đặt Lại
                  </Button>
                </Form.Item>

                <div className="text-center">
                  <Link to="/login">
                    <Button
                      type="link"
                      icon={<ArrowLeftOutlined />}
                      style={{ fontSize: "14px" }}
                    >
                      Quay lại đăng nhập
                    </Button>
                  </Link>
                </div>
              </Form>
            </div>
          ) : (
            // Thông báo thành công
            <Result
              icon={
                <CheckCircleOutlined
                  style={{ color: "#52c41a", fontSize: "48px" }}
                />
              }
              title="Email Đã Được Gửi!"
              subTitle={
                <div>
                  <p>Chúng tôi đã gửi email đặt lại mật khẩu đến:</p>
                  <strong style={{ color: "#1976D2" }}>{email}</strong>
                  <p
                    style={{
                      marginTop: "12px",
                      fontSize: "14px",
                      color: "#666",
                    }}
                  >
                    Vui lòng kiểm tra hộp thư và làm theo hướng dẫn để đặt lại
                    mật khẩu.
                  </p>
                </div>
              }
              extra={[
                <Space
                  key="actions"
                  direction="vertical"
                  style={{ width: "100%" }}
                >
                  <Button
                    type="primary"
                    onClick={() => navigate("/login")}
                    style={{
                      background:
                        "linear-gradient(135deg, #1976D2 0%, #1565C0 100%)",
                      border: "none",
                      width: "100%",
                    }}
                  >
                    Quay lại đăng nhập
                  </Button>
                  <Button
                    type="link"
                    onClick={() => {
                      setEmailSent(false);
                      form.resetFields();
                    }}
                    style={{ fontSize: "14px" }}
                  >
                    Gửi lại email
                  </Button>
                </Space>,
              ]}
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
