import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '@stores/authStore';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

/**
 * Role-Based Route Component (Layout Route)
 * Bảo vệ routes dựa trên vai trò người dùng
 * 
 * @param {Array} allowedRoles - Vai trò được phép truy cập
 * @param {String} redirectTo - Đường dẫn redirect nếu không có quyền (optional)
 */
const RoleBasedRoute = ({ 
  allowedRoles = [], 
  redirectTo = null 
}) => {
  const { user, hasRole } = useAuthStore();
  const navigate = useNavigate();

  const hasAccess = hasRole(allowedRoles);

  if (!hasAccess) {
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }

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

  return <Outlet />;
};

export default RoleBasedRoute;
