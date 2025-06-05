import React from "react";
import { Layout } from "antd";
import { Footer, Header } from "./";

const { Content } = Layout;

const MainLayout = ({ children }) => {
  return (
    <Layout className="app-container" style={{ minHeight: "100vh" }}>
      <Header />
      <Content className="app-content">{children}</Content>
      <Footer />
    </Layout>
  );
};

export default MainLayout;
