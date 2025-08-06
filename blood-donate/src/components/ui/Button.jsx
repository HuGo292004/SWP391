// Import React và Ant Design Button
import React from "react";
import { Button as AntButton } from "antd";

/**
 * Custom Button component wrapper cho Ant Design Button
 * Cung cấp các variant và props tùy chỉnh để dễ sử dụng
 *
 * @param {React.ReactNode} children - Nội dung bên trong button
 * @param {string} variant - Loại button (primary, secondary, outline, text, link)
 * @param {string} size - Kích thước button (small, middle, large)
 * @param {boolean} danger - Có phải button nguy hiểm không
 * @param {boolean} loading - Có hiển thị loading spinner không
 * @param {Object} props - Các props khác được truyền xuống AntButton
 */
const Button = ({
  children,
  variant = "primary", // Variant mặc định là primary
  size = "middle", // Size mặc định là middle
  danger = false, // Mặc định không phải danger button
  loading = false, // Mặc định không loading
  ...props // Spread các props khác
}) => {
  /**
   * Hàm tính toán props cho AntButton dựa trên variant
   * @returns {Object} Props object cho AntButton
   */
  const getButtonProps = () => {
    // Props cơ bản được truyền cho tất cả variants
    const baseProps = {
      size,
      loading,
      danger,
      ...props,
    };

    // Switch case để xác định type dựa trên variant
    switch (variant) {
      case "primary":
        return { ...baseProps, type: "primary" };
      case "secondary":
        return { ...baseProps, type: "default" };
      case "outline":
        return { ...baseProps, type: "primary", ghost: true };
      case "text":
        return { ...baseProps, type: "text" };
      case "link":
        return { ...baseProps, type: "link" };
      default:
        // Fallback về primary nếu variant không hợp lệ
        return { ...baseProps, type: "primary" };
    }
  };

  // Render AntButton với props đã được tính toán
  return <AntButton {...getButtonProps()}>{children}</AntButton>;
};

export default Button;
