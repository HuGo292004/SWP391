import React from 'react';
import { Typography } from 'antd';

const { Title, Paragraph } = Typography;

const PageHeader = ({ 
  title, 
  subtitle, 
  icon, 
  extra,
  style = {} 
}) => {
  return (
    <div style={{ 
      textAlign: 'center', 
      marginBottom: '32px',
      ...style 
    }}>
      <Title level={2} style={{ 
        color: '#1976D2', 
        margin: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
      }}>
        {icon && <span style={{ color: '#E91E63' }}>{icon}</span>}
        {title}
      </Title>
      
      {subtitle && (
        <Paragraph style={{ 
          color: '#666', 
          fontSize: '16px',
          marginTop: '8px',
          marginBottom: 0
        }}>
          {subtitle}
        </Paragraph>
      )}
      
      {extra && (
        <div style={{ marginTop: '16px' }}>
          {extra}
        </div>
      )}
    </div>
  );
};

export default PageHeader; 