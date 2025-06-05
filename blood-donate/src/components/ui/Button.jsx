import React from 'react';
import { Button as AntButton } from 'antd';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'middle',
  danger = false,
  loading = false,
  ...props 
}) => {
  const getButtonProps = () => {
    const baseProps = {
      size,
      loading,
      danger,
      ...props
    };

    switch (variant) {
      case 'primary':
        return { ...baseProps, type: 'primary' };
      case 'secondary':
        return { ...baseProps, type: 'default' };
      case 'outline':
        return { ...baseProps, type: 'primary', ghost: true };
      case 'text':
        return { ...baseProps, type: 'text' };
      case 'link':
        return { ...baseProps, type: 'link' };
      default:
        return { ...baseProps, type: 'primary' };
    }
  };

  return (
    <AntButton {...getButtonProps()}>
      {children}
    </AntButton>
  );
};

export default Button; 