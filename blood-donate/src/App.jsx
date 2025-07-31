// Import các thư viện cần thiết
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ConfigProvider, App as AntdApp } from "antd";
import { useState, useEffect } from "react";
import "./styles/App.css";

// Import các trang và component theo cấu trúc mới

// Import các component layout và UI
import { MainLayout } from "./components/layout";
import { AIChatbot } from "./components/ui";

// Import các trang chung (common pages)
import {
  HomePage,
  NotFoundPage,
  FAQPage,
  NewsPage,
  SupportPage,
  Profile,
} from "./pages/common";

// Import các trang xác thực (authentication pages)
import { LoginPage, RegisterPage, ForgotPasswordPage } from "./pages/auth";

// Import các trang dành cho admin
import { AdminDashboard } from "./pages/admin";

// Import các trang dành cho nhân viên (staff)
import {
  UserManagement,
  CreateEmergencyRequest,
  CreateHealthForms,
  BloodInventory,
  BloodDonorManagement,
  BloodDonationManagement,
  EmergencyRequestManagement,
} from "./pages/staff";

// Import các trang dành cho thành viên (member)
import {
  BloodDonationRegistration,
  BloodDonationProfile,
  Certificate,
} from "./pages/member";

// Cấu hình theme y tế cho toàn bộ ứng dụng
const healthTheme = {
  token: {
    colorPrimary: "#1976D2", // Màu xanh dương chủ đạo của y tế
    colorInfo: "#1976D2",
    colorSuccess: "#4CAF50", // Màu xanh lá cho thành công
    colorWarning: "#FF9800", // Màu cam cho cảnh báo
    colorError: "#F44336", // Màu đỏ cho lỗi
    colorTextBase: "#37474F", // Màu chữ cơ bản
    fontFamily:
      "Roboto, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif",
    borderRadius: 6,
    fontSize: 16,
  },
  // Cấu hình riêng cho từng component
  components: {
    Button: {
      colorPrimary: "#1976D2",
      algorithm: true,
    },
    Card: {
      colorBgContainer: "#ffffff",
      borderRadius: 8,
    },
  },
};

// Component chính của ứng dụng
function App() {
  // State để quản lý trạng thái loading
  const [loading, setLoading] = useState(true);

  // Effect để simulate thời gian loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Hiển thị màn hình loading khi ứng dụng đang tải
  if (loading) {
    return (
      <ConfigProvider theme={healthTheme}>
        <AntdApp>
          <div className="loading-screen">
            <div className="loading-content">
              <div className="loading-logo">
                <span className="heart-icon">❤</span>
              </div>
              <div className="loading-text">BloodDonate</div>
              <div className="loading-spinner"></div>
            </div>
          </div>
        </AntdApp>
      </ConfigProvider>
    );
  }

  // Render chính của ứng dụng
  return (
    <ConfigProvider theme={healthTheme}>
      <Router>
        {/* TODO: Thêm AuthProvider để quản lý xác thực */}
        <AntdApp>
          <MainLayout>
            <Routes>
              {/* ==================== ROUTES CÔNG KHAI ==================== */}
              {/* Các route này không cần đăng nhập, ai cũng có thể truy cập */}
              <Route path="/" element={<HomePage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/news" element={<NewsPage />} />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/profile" element={<Profile />} />

              {/* ==================== ROUTES XÁC THỰC ==================== */}
              {/* Các trang đăng nhập, đăng ký, quên mật khẩu */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              {/* ==================== ROUTES ĐĂNG KÝ HIẾN MÁU ==================== */}
              {/* Route công khai cho đăng ký hiến máu */}
              <Route
                path="/blood-donation-register"
                element={<BloodDonationRegistration />}
              />

              {/* ==================== ROUTES DÀNH CHO ADMIN ==================== */}
              {/* Các route chỉ dành cho quản trị viên */}
              <Route path="/admin" element={<HomePage />} />
              <Route path="/admin/faq" element={<FAQPage />} />
              <Route path="/admin/news" element={<NewsPage />} />
              <Route path="/admin/support" element={<SupportPage />} />
              <Route path="/admin/profile" element={<Profile />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route
                path="/admin/user-management"
                element={<UserManagement />}
              />
              <Route
                path="/admin/create-emergency-request"
                element={<CreateEmergencyRequest />}
              />
              <Route
                path="/admin/create-health-forms"
                element={<CreateHealthForms />}
              />
              <Route
                path="/admin/blood-inventory"
                element={<BloodInventory />}
              />
              <Route
                path="/admin/blood-donation-management"
                element={<BloodDonationManagement />}
              />

              {/* ==================== ROUTES DÀNH CHO NHÂN VIÊN ==================== */}
              {/* Các route chỉ dành cho nhân viên y tế */}
              <Route path="/staff" element={<HomePage />} />
              <Route path="/staff/faq" element={<FAQPage />} />
              <Route path="/staff/news" element={<NewsPage />} />
              <Route path="/staff/support" element={<SupportPage />} />
              <Route path="/staff/profile" element={<Profile />} />
              <Route
                path="/staff/user-management"
                element={<UserManagement />}
              />
              <Route
                path="/staff/donor-management"
                element={<BloodDonorManagement />}
              />
              <Route
                path="/staff/create-emergency-request"
                element={<CreateEmergencyRequest />}
              />
              <Route
                path="/staff/create-health-forms"
                element={<CreateHealthForms />}
              />
              <Route
                path="/staff/emergency-request-management"
                element={<EmergencyRequestManagement />}
              />
              <Route
                path="/staff/blood-inventory"
                element={<BloodInventory />}
              />
              <Route
                path="/staff/blood-donation-management"
                element={<BloodDonationManagement />}
              />

              {/* ==================== ROUTES DÀNH CHO THÀNH VIÊN ==================== */}
              {/* Các route chỉ dành cho thành viên đã đăng ký */}
              <Route path="/member" element={<HomePage />} />
              <Route path="/member/faq" element={<FAQPage />} />
              <Route path="/member/news" element={<NewsPage />} />
              <Route path="/member/support" element={<SupportPage />} />
              <Route path="/member/profile" element={<Profile />} />
              <Route
                path="/member/blood-donation-register"
                element={<BloodDonationRegistration />}
              />
              <Route
                path="/member/blood-donation-registration"
                element={<BloodDonationRegistration />}
              />
              <Route
                path="/member/blood-donation-profile"
                element={<BloodDonationProfile />}
              />
              <Route path="/member/certificate" element={<Certificate />} />

              {/* ==================== ROUTE 404 ==================== */}
              {/* Trang không tìm thấy - hiển thị khi không có route nào khớp */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </MainLayout>

          {/* AI Chatbot - Có sẵn trên tất cả các trang */}
          <AIChatbot />
        </AntdApp>
        {/* </AuthProvider> */}
      </Router>
    </ConfigProvider>
  );
}
export default App;
