import React, { useState, useEffect } from 'react';
import { Typography } from 'antd';

const { Title, Text } = Typography;

const MemberDashboard = () => {
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    // Get user info from localStorage
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('userRole');
    setUserInfo({ username, role });
  }, []);

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <Title level={2} style={{ margin: 0, color: '#1976D2' }}>
        ❤️ Member Dashboard
      </Title>
      <Text type="secondary">
        Chào mừng trở lại, {userInfo?.username || 'Member'} - Người hiến máu tình nguyện
      </Text>
      <div style={{ marginTop: '20px' }}>
        <Text>Trang Member Dashboard đang hoạt động!</Text>
      </div>
    </div>
  );
};

export default MemberDashboard; 