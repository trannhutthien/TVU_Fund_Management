import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '@stores/authStore';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

/**
 * Role-Based Route Component
 * Bảo vệ routes dựa trên vai trò người dùng
 * 
 * @param {Array|String} allowedRoles - Vai trò được phép truy cập
 * @param {ReactNode} children - Component con
 * @param {String} redirectTo - Đường dẫn redirect nếu không có quyền (optional)
 */
const RoleBasedRoute = ({ 
  children, 
  allowedRoles = [], 
  redirectTo = null 
}) => {
  const { user, hasRole } = useAuthStore();
  const navigate = useNavigate();

  // Kiểm tra user có role được phép không
  const hasAccess = hasRole(allowedRoles);

  if (!hasAccess) {
    // Nếu có redirectTo, redirect đến đó
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }

    // Nếu không, hiển thị trang 403 Forbidden
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        padding: '24px'
      }}>
        <Result
          status="403"
          title="403"
          subTitle="Xin lỗi, bạn không có quyền truy cập trang này."
          extra={
            <Button type="primary" onClick={() => navigate(-1)}>
              Quay lại
            </Button>
          }
        />
      </div>
    );
  }

  return children;
};

export default RoleBasedRoute;
