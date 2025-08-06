// Import React và Ant Design Typography
import React from "react";
import { Typography } from "antd";

// Destructure Typography components
const { Title, Paragraph } = Typography;

/**
 * Component PageHeader tái sử dụng
 * Hiển thị header cho từng trang với title, subtitle, icon và extra content
 *
 * @param {string} title - Tiêu đề chính của trang
 * @param {string} subtitle - Mô tả phụ (optional)
 * @param {React.ReactNode} icon - Icon hiển thị bên cạnh title (optional)
 * @param {React.ReactNode} extra - Nội dung extra như buttons, actions (optional)
 * @param {Object} style - Custom styles cho container (optional)
 */
const PageHeader = ({ title, subtitle, icon, extra, style = {} }) => {
  return (
    <div
      style={{
        textAlign: "center", // Căn giữa nội dung
        marginBottom: "32px", // Margin bottom cho spacing
        ...style, // Merge với custom styles
      }}
    >
      {/* Title với icon */}
      <Title
        level={2}
        style={{
          color: "#1976D2", // Màu xanh dương chủ đạo
          margin: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px", // Khoảng cách giữa icon và text
        }}
      >
        {icon && <span style={{ color: "#E91E63" }}>{icon}</span>}
        {title}
      </Title>

      {/* Subtitle (nếu có) */}
      {subtitle && (
        <Paragraph
          style={{
            color: "#666", // Màu xám cho subtitle
            fontSize: "16px",
            marginTop: "8px",
            marginBottom: 0,
          }}
        >
          {subtitle}
        </Paragraph>
      )}

      {/* Extra content như buttons, actions (nếu có) */}
      {extra && <div style={{ marginTop: "16px" }}>{extra}</div>}
    </div>
  );
};

export default PageHeader;
