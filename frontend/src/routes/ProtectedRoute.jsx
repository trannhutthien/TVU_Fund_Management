import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '@stores/authStore';

/**
 * Protected Route Component
 * Bảo vệ routes yêu cầu authentication
 * Redirect về login nếu chưa đăng nhập hoặc token hết hạn
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, token } = useAuthStore();
  const location = useLocation();

  // Check token expiry on mount
  useEffect(() => {
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        useAuthStore.getState().forceLogout();
      }
    } catch (e) {
      // Invalid token format
      useAuthStore.getState().forceLogout();
    }
  }, [token]);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
