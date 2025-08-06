// Import React và ReactDOM cho việc render ứng dụng
import React from "react";
import ReactDOM from "react-dom/client";

// Import polyfills trước để đảm bảo tương thích trình duyệt cũ
import "./polyfills.js";

// Import component App chính
import App from "./App.jsx";

// Import Bootstrap CSS cho styling cơ bản
import "bootstrap/dist/css/bootstrap.min.css";

// Import Bootstrap JavaScript cho các component tương tác
import "bootstrap/dist/js/bootstrap.bundle.min.js";

// Import Bootstrap Icons cho các icon
import "bootstrap-icons/font/bootstrap-icons.css";

// Import Animate.css cho các hiệu ứng animation
import "animate.css";

// Import CSS styles chính của ứng dụng
import "./styles/index.css";

// Import cấu hình locale và ngôn ngữ tiếng Việt cho Ant Design
import { ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";

// Render ứng dụng React vào DOM element có id="root"
ReactDOM.createRoot(document.getElementById("root")).render(
  // Bọc App trong ConfigProvider để áp dụng locale tiếng Việt cho toàn bộ app
  <ConfigProvider locale={viVN}>
    <App />
  </ConfigProvider>
);
