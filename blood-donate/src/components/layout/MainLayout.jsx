// Import các thư viện và component cần thiết
import React from "react";
import { Layout } from "antd";
import { Footer, Header } from "./";

// Destructure Content từ Layout của Ant Design
const { Content } = Layout;

/**
 * Component Layout chính của ứng dụng
 * Bao gồm Header, Content và Footer
 * @param {React.ReactNode} children - Nội dung trang được truyền vào
 */
const MainLayout = ({ children }) => {
  return (
    <Layout className="app-container" style={{ minHeight: "100vh" }}>
      {/* Header chứa logo, menu điều hướng và thông tin user */}
      <Header />

      {/* Content chính - nơi hiển thị nội dung từng trang */}
      <Content className="app-content">{children}</Content>

      {/* Footer chứa thông tin liên hệ và bản quyền */}
      <Footer />
    </Layout>
  );
};

export default MainLayout;
