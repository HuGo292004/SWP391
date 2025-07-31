# Cấu Trúc Dự Án Blood Donation

## 📁 Tổng Quan Cấu Trúc

```
src/
├── App.jsx                    # Component chính của ứng dụng
├── main.jsx                   # Entry point, khởi tạo React app
├── polyfills.js              # Polyfills cho các trình duyệt cũ
├── assets/                   # Tài nguyên tĩnh
│   └── react.svg
├── components/               # Các component tái sử dụng
│   ├── layout/              # Components layout chính
│   │   ├── Header.jsx       # Header với navigation và user menu
│   │   ├── Footer.jsx       # Footer với thông tin liên hệ
│   │   ├── MainLayout.jsx   # Layout chính bọc toàn bộ app
│   │   └── index.js         # Export tất cả layout components
│   └── ui/                  # UI components nhỏ
│       ├── AIChatbot.jsx    # Chatbot AI hỗ trợ người dùng
│       ├── Button.jsx       # Custom button components
│       ├── PageHeader.jsx   # Header cho từng trang
│       └── index.js         # Export tất cả UI components
├── pages/                   # Các trang của ứng dụng
│   ├── admin/              # Trang dành cho Admin
│   │   ├── AdminDashboard.jsx  # Dashboard tổng quan cho admin
│   │   └── index.js
│   ├── auth/               # Trang xác thực
│   │   ├── LoginPage.jsx   # Trang đăng nhập
│   │   ├── RegisterPage.jsx # Trang đăng ký
│   │   ├── ForgotPasswordPage.jsx # Trang quên mật khẩu
│   │   └── index.js
│   ├── common/             # Trang chung cho tất cả roles
│   │   ├── HomePage.jsx    # Trang chủ
│   │   ├── FAQPage.jsx     # Trang câu hỏi thường gặp
│   │   ├── NewsPage.jsx    # Trang tin tức
│   │   ├── NotFoundPage.jsx # Trang 404
│   │   ├── Profile.jsx     # Trang hồ sơ cá nhân
│   │   ├── SupportPage.jsx # Trang hỗ trợ
│   │   └── index.js
│   ├── member/             # Trang dành cho Member
│   │   ├── BloodDonationProfile.jsx # Hồ sơ hiến máu
│   │   ├── BloodDonationRegistration.jsx # Đăng ký hiến máu
│   │   ├── Certificate.jsx # Chứng chỉ hiến máu
│   │   └── index.js
│   └── staff/              # Trang dành cho Staff
│       ├── BloodDonationManagement.jsx # Quản lý hiến máu
│       ├── BloodDonorManagement.jsx # Quản lý người hiến máu
│       ├── BloodInventory.jsx # Quản lý kho máu
│       ├── CreateEmergencyRequest.jsx # Tạo yêu cầu khẩn cấp
│       ├── CreateHealthForms.jsx # Tạo form sức khỏe
│       ├── EmergencyRequestManagement.jsx # Quản lý yêu cầu khẩn cấp
│       ├── UserManagement.jsx # Quản lý người dùng
│       └── index.js
├── services/               # API services và logic nghiệp vụ
│   ├── authApi.js         # API xác thực
│   ├── userApi.js         # API người dùng
│   ├── bloodDonationApi.js # API hiến máu
│   ├── emergencyRequestApi.js # API yêu cầu khẩn cấp
│   └── ...               # Các API khác
├── styles/               # CSS và styling
│   ├── App.css          # Style chính của app
│   ├── components.css   # Style cho components
│   ├── pages.css        # Style cho pages
│   └── ...             # Các file CSS khác
└── utils/              # Utilities và helpers
    ├── authDebug.js    # Debug utilities cho auth
    ├── roleUtils.js    # Utilities cho role management
    └── ...            # Các utility khác
```

## 🎭 Phân Quyền (Role-Based Access)

### 🔑 Các Loại Người Dùng

1. **Guest (Khách)**: Không cần đăng nhập

   - Xem trang chủ, tin tức, FAQ
   - Đăng ký tài khoản
   - Đăng ký hiến máu

2. **Member (Thành viên)**: Đã đăng ký tài khoản

   - Tất cả quyền của Guest
   - Quản lý hồ sơ hiến máu cá nhân
   - Xem chứng chỉ hiến máu
   - Cập nhật thông tin cá nhân

3. **Staff (Nhân viên)**: Nhân viên y tế

   - Tất cả quyền của Member
   - Quản lý người hiến máu
   - Quản lý yêu cầu hiến máu
   - Tạo yêu cầu khẩn cấp
   - Quản lý kho máu
   - Tạo form sức khỏe

4. **Admin (Quản trị viên)**: Quyền cao nhất
   - Tất cả quyền của Staff
   - Quản lý người dùng hệ thống
   - Xem dashboard tổng quan
   - Cấu hình hệ thống

## 🛣️ Routing Strategy

### URL Pattern

```
/ (guest routes)
/admin/* (admin routes)
/staff/* (staff routes)
/member/* (member routes)
```

### Ví dụ Routes

```
- / → HomePage (for guests)
- /admin → HomePage (for admin)
- /admin/dashboard → AdminDashboard
- /staff/user-management → UserManagement
- /member/blood-donation-profile → BloodDonationProfile
```

## 🎨 Theme và Styling

### Health Theme Colors

```javascript
const healthTheme = {
  colorPrimary: "#1976D2", // Xanh dương y tế
  colorSuccess: "#4CAF50", // Xanh lá cho thành công
  colorWarning: "#FF9800", // Cam cho cảnh báo
  colorError: "#F44336", // Đỏ cho lỗi
  colorTextBase: "#37474F", // Màu chữ cơ bản
};
```

## 🔧 Technical Stack

- **Frontend**: React 18 + Vite
- **UI Library**: Ant Design (antd)
- **Routing**: React Router v6
- **State Management**: React Hooks (useState, useEffect)
- **Styling**: CSS Modules + Ant Design Theme

## 📦 Component Architecture

### Layout Components

- `MainLayout`: Layout chính bọc toàn app
- `Header`: Navigation, logo, user menu
- `Footer`: Thông tin liên hệ, links

### UI Components

- `AIChatbot`: Chatbot hỗ trợ người dùng
- `Button`: Custom button với theme
- `PageHeader`: Header cho từng trang

### Page Components

- Được tổ chức theo role (admin, staff, member)
- Mỗi page component độc lập
- Sử dụng chung layout và UI components

## 🔄 Data Flow

1. **Authentication**: localStorage để lưu thông tin user
2. **Role Detection**: Từ localStorage và URL path
3. **Conditional Rendering**: Dựa trên role hiện tại
4. **API Calls**: Qua services layer
5. **Error Handling**: Message notification từ antd

## 🚀 Getting Started

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Start development server**:

   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

## 📝 Naming Conventions

- **Components**: PascalCase (VD: `AdminDashboard`)
- **Files**: PascalCase cho components, camelCase cho utilities
- **CSS Classes**: kebab-case (VD: `user-dropdown-menu`)
- **Variables**: camelCase (VD: `isAuthenticated`)
- **Constants**: UPPER_SNAKE_CASE (VD: `HEALTH_THEME_COLORS`)

## 🔍 Code Comments

Tất cả code đã được comment bằng tiếng Việt để dễ hiểu:

- Function descriptions
- Component purposes
- Route explanations
- State management logic
- Business logic explanations
