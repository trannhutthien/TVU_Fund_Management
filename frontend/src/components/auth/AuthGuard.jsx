import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuthStore from '@stores/authStore';

/**
 * AuthGuard Component
 * 
 * Kiểm tra token expiry khi app load hoặc route change
 * Nếu token hết hạn, logout và redirect về LandingPage
 */
const AuthGuard = ({ children }) => {
  const navigate = useNavigate();
  const { checkTokenExpiry, logout, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Check token expiry khi component mount
    if (isAuthenticated) {
      const isExpired = checkTokenExpiry();
      if (isExpired) {
        logout();
        localStorage.removeItem('refreshToken');
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        navigate('/');
      }
    }
  }, [isAuthenticated, checkTokenExpiry, logout, navigate]);

  // Check token expiry mỗi 60 giây
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      const isExpired = checkTokenExpiry();
      if (isExpired) {
        logout();
        localStorage.removeItem('refreshToken');
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        navigate('/');
      }
    }, 60000); // Check mỗi 60 giây

    return () => clearInterval(interval);
  }, [isAuthenticated, checkTokenExpiry, logout, navigate]);

  return children;
};

export default AuthGuard;
