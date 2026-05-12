import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '@stores/authStore';

/**
 * Protected Route Component
 * Bảo vệ routes yêu cầu authentication
 * Redirect về login nếu chưa đăng nhập
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect về login, lưu location hiện tại để redirect lại sau khi login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
