import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ConfigProvider, App as AntdApp } from "antd";
import { useState, useEffect } from "react";
import "./styles/App.css";

// Pages - using new structure


// Components
import { MainLayout } from "./components/layout";


// Context

import { HomePage, NotFoundPage, FAQPage, NewsPage, SupportPage, Profile, AppointmentPage } from "./pages/common";
import { LoginPage, RegisterPage } from "./pages/auth";
import { AdminDashboard } from "./pages/admin";
import { UserManagement, ApproveDonationRequests, CreateEmergencyRequest, ApproveHealthForms, CreateHealthForms, BloodInventory, BloodDonorManagement } from "./pages/staff";
import { MemberDashboard, BloodDonationRegistration } from "./pages/member";

// Y tế theme colors
const healthTheme = {
  token: {
    colorPrimary: "#1976D2", // Xanh dương y tế
    colorInfo: "#1976D2",
    colorSuccess: "#4CAF50", // Xanh lá
    colorWarning: "#FF9800", // Cam
    colorError: "#F44336", // Đỏ
    colorTextBase: "#37474F",
    fontFamily:
      "Roboto, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif",
    borderRadius: 6,
    fontSize: 16,
  },
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

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

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
  return(
    <ConfigProvider theme={healthTheme}>
      <Router>
        {/* <AuthProvider> - TODO: Import and setup authentication provider */}
          <AntdApp>
            <MainLayout>
              <Routes>
                {/* Public routes - Guest có thể truy cập không cần đăng nhập */}
                <Route path="/" element={<HomePage />} />
                <Route path="/appointments" element={<AppointmentPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/news" element={<NewsPage />} />
                <Route path="/support" element={<SupportPage />} />
                <Route path="/profile" element={<Profile />} />

                {/* Auth routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                {/* Blood donation registration route - Public access */}
                <Route path="/blood-donation-register" element={<BloodDonationRegistration />} />                {/* Admin routes */}
                <Route path="/admin" element={<HomePage />} />
                <Route path="/admin/appointments" element={<AppointmentPage />} />
                <Route path="/admin/faq" element={<FAQPage />} />
                <Route path="/admin/news" element={<NewsPage />} />
                <Route path="/admin/support" element={<SupportPage />} />
                <Route path="/admin/profile" element={<Profile />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/user-management" element={<UserManagement />} />
                <Route path="/admin/approve-donation-requests" element={<ApproveDonationRequests />} />
                <Route path="/admin/create-emergency-request" element={<CreateEmergencyRequest />} />
                <Route path="/admin/approve-health-forms" element={<ApproveHealthForms />} />
                <Route path="/admin/create-health-forms" element={<CreateHealthForms />} />
                <Route path="/admin/blood-inventory" element={<BloodInventory />} />

                {/* Staff routes */}
                <Route path="/staff" element={<HomePage />} />
                <Route path="/staff/appointments" element={<AppointmentPage />} />
                <Route path="/staff/faq" element={<FAQPage />} />
                <Route path="/staff/news" element={<NewsPage />} />
                <Route path="/staff/support" element={<SupportPage />} />
                <Route path="/staff/profile" element={<Profile />} />
                <Route path="/staff/user-management" element={<UserManagement />} />
                <Route path="/staff/donor-management" element={<BloodDonorManagement />} />
                <Route path="/staff/approve-donation-requests" element={<ApproveDonationRequests />} />
                <Route path="/staff/create-emergency-request" element={<CreateEmergencyRequest />} />
                <Route path="/staff/approve-health-forms" element={<ApproveHealthForms />} />
                <Route path="/staff/create-health-forms" element={<CreateHealthForms />} />
                <Route path="/staff/blood-inventory" element={<BloodInventory />} />

                {/* Member routes */}
                <Route path="/member" element={<HomePage />} />
                <Route path="/member/appointments" element={<AppointmentPage />} />
                <Route path="/member/faq" element={<FAQPage />} />
                <Route path="/member/news" element={<NewsPage />} />
                <Route path="/member/support" element={<SupportPage />} />
                <Route path="/member/profile" element={<Profile />} />
                <Route path="/member/blood-donation-register" element={<BloodDonationRegistration />} />
                <Route path="/member/dashboard" element={<MemberDashboard />} />

                {/* 404 route */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </MainLayout>
          </AntdApp>
        {/* </AuthProvider> */}
      </Router>
    </ConfigProvider>
  )

}
export default App;