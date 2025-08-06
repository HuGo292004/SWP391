// Import các thư viện React cần thiết
import React from "react";

// Import các component từ Ant Design
import { Result, Button } from "antd";

// Import routing utilities
import { Link } from "react-router-dom";

/**
 * Trang Lỗi 404 - Không Tìm Thấy Trang
 * Hiển thị khi người dùng truy cập vào đường dẫn không tồn tại
 */
const NotFoundPage = () => {
  return (
    <Result
      status="404"
      title="404"
      subTitle="Xin lỗi, trang bạn đang tìm kiếm không tồn tại."
      extra={
        <Link to="/">
          <Button type="primary">Quay về trang chủ</Button>
        </Link>
      }
      style={{ padding: "100px 0" }}
    />
  );
};

export default NotFoundPage;
