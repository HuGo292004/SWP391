import React, { useState, useEffect } from 'react';
import '../../styles/AdminDashboard.css';
import { UserOutlined, HeartFilled, TeamOutlined, MedicineBoxOutlined } from '@ant-design/icons';

const AdminDashboard = () => {
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const username = localStorage.getItem('username') || 'Admin';
    const role = localStorage.getItem('userRole') || 'admin';
    setUserInfo({ username, role });
  }, []);

  // Mock data giữ nguyên
  const systemStats = [
    {
      title: "Tổng người dùng",
      value: 12847,
      icon: <UserOutlined />,
      suffix: "người"
    },
    {
      title: "Đơn vị máu thu được",
      value: 45623,
      icon: <HeartFilled style={{color:'#e63946'}} />,
      suffix: "đơn vị"
    },
    {
      title: "Số ca cấp cứu",
      value: 234,
      icon: <MedicineBoxOutlined style={{color:'#fbbf24'}} />,
      suffix: "ca"
    },
    {
      title: "Nhân viên hoạt động",
      value: 156,
      icon: <TeamOutlined style={{color:'#3b82f6'}} />,
      suffix: "người"
    }
  ];

  const recentActivities = [
    { id: 1, action: "Người dùng mới đăng ký", user: "Nguyễn Văn A", time: "5 phút trước", type: "success" },
    { id: 2, action: "Hiến máu thành công", user: "Trần Thị B", time: "15 phút trước", type: "info" },
    { id: 3, action: "Yêu cầu máu khẩn cấp", user: "Bệnh viện C", time: "30 phút trước", type: "error" },
    { id: 4, action: "Cập nhật hồ sơ", user: "Lê Văn D", time: "1 giờ trước", type: "warning" }
  ];

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-title">Dashboard</div>
        <ul>
          <li className="active"><span className="sidebar-icon"><UserOutlined /></span>Dashboard</li>
        </ul>
      </aside>

      {/* Main content */}
      <div style={{flex:1, display:'flex', flexDirection:'column'}}>
        {/* Header */}
        <header className="admin-header">
          <div className="header-user">
            <div className="header-avatar">{userInfo?.username?.[0] || 'A'}</div>
            <span>{userInfo?.username || 'Admin'}</span>
          </div>
        </header>

        <main className="admin-main">
          {/* Cards */}
          <div className="admin-cards">
            {systemStats.map((stat, idx) => (
              <div className="admin-card" key={idx}>
                <div className="card-icon">{stat.icon}</div>
                <div className="card-title">{stat.title}</div>
                <div className="card-value">{stat.value}</div>
                <div className="card-suffix">{stat.suffix}</div>
              </div>
            ))}
          </div>

          {/* Chart + Activities row */}
          <div className="admin-charts-row">
            {/* Chart placeholder */}
            <div className="admin-chart">
              <div className="admin-chart-title">Thống kê tổng quan (Demo)</div>
              <img src="https://www.chartjs.org/media/logo-title.svg" alt="Chart demo" style={{width:'100%', maxWidth:320, opacity:0.3}} />
              <div style={{color:'#888', fontSize:'0.95rem', marginTop:12}}>Biểu đồ sẽ được tích hợp sau</div>
            </div>
            {/* Activities */}
            <div className="admin-activities">
              <div className="admin-chart-title">Hoạt động gần đây</div>
              <ul className="admin-activities-list">
                {recentActivities.map(act => (
                  <li key={act.id}>
                    <span className={`admin-activity-type ${act.type}`}>●</span>
                    <span><b>{act.user}</b> - {act.action}</span>
                    <span style={{marginLeft:'auto', color:'#aaa', fontSize:'0.95em'}}>{act.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard; 