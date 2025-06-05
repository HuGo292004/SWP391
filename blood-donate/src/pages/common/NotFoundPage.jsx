import React from 'react';
import { Result, Button } from 'antd';
import { Link } from 'react-router-dom';

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
      style={{ padding: '100px 0' }}
    />
  );
};

export default NotFoundPage; 
