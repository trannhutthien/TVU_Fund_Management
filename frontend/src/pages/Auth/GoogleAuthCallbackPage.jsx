import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuthStore from '@stores/authStore';

/**
 * GoogleAuthCallbackPage
 * 
 * Trang xử lý redirect từ backend sau khi Google OAuth hoàn tất.
 * Backend sẽ redirect về: /auth/google/callback?accessToken=...&refreshToken=...&user=...
 * 
 * Trang này:
 * 1. Đọc token và user từ URL query params
 * 2. Lưu vào Zustand store + localStorage
 * 3. Xoá token khỏi URL (bảo mật)
 * 4. Redirect về trang chủ
 */
const GoogleAuthCallbackPage = () => {
  const navigate = useNavigate();
  const { login: loginStore } = useAuthStore();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const processCallback = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get('accessToken');
        const refreshToken = params.get('refreshToken');
        const encodedUser = params.get('user');

        // Xoá query params khỏi URL ngay lập tức để token không lộ trên URL bar
        window.history.replaceState({}, document.title, window.location.pathname);

        if (!accessToken || !refreshToken || !encodedUser) {
          setStatus('error');
          setErrorMsg('Không nhận được thông tin đăng nhập từ Google.');
          return;
        }

        // Parse thông tin user
        const user = JSON.parse(decodeURIComponent(encodedUser));

        // Lưu vào Zustand store và localStorage
        loginStore(user, accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        setStatus('success');
        toast.success(`Chào mừng ${user.hoTen || 'bạn'}! Đăng nhập bằng Google thành công.`);

        // Redirect về trang chủ sau 500ms
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 500);
      } catch (err) {
        console.error('Lỗi xử lý Google callback:', err);
        setStatus('error');
        setErrorMsg('Đăng nhập thất bại. Vui lòng thử lại.');
      }
    };

    processCallback();
  }, [loginStore, navigate]);

  // ─── Styles inline (không cần file scss riêng) ───────────────────────────
  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1a2f5e 0%, #2a4a8f 100%)',
    fontFamily: "'Inter', sans-serif",
  };

  const cardStyle = {
    background: 'rgba(255,255,255,0.08)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '20px',
    padding: '48px 40px',
    textAlign: 'center',
    color: '#fff',
    maxWidth: '400px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  };

  const spinnerStyle = {
    width: '48px',
    height: '48px',
    border: '4px solid rgba(255,255,255,0.2)',
    borderTop: '4px solid #fff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    margin: '0 auto 24px',
  };

  return (
    <div style={containerStyle}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={cardStyle}>
        {status === 'loading' && (
          <>
            <div style={spinnerStyle} />
            <h2 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 600 }}>
              Đang xử lý đăng nhập...
            </h2>
            <p style={{ margin: 0, opacity: 0.7, fontSize: '14px' }}>
              Vui lòng chờ trong giây lát
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
            <h2 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 600 }}>
              Đăng nhập thành công!
            </h2>
            <p style={{ margin: 0, opacity: 0.7, fontSize: '14px' }}>
              Đang chuyển hướng về trang chủ...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
            <h2 style={{ margin: '0 0 12px', fontSize: '20px', fontWeight: 600 }}>
              Đăng nhập thất bại
            </h2>
            <p style={{ margin: '0 0 24px', opacity: 0.7, fontSize: '14px' }}>
              {errorMsg}
            </p>
            <button
              onClick={() => navigate('/login', { replace: true })}
              style={{
                background: '#4285F4',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 28px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'opacity 0.2s',
              }}
              onMouseOver={e => (e.target.style.opacity = 0.85)}
              onMouseOut={e => (e.target.style.opacity = 1)}
            >
              Quay lại đăng nhập
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default GoogleAuthCallbackPage;
