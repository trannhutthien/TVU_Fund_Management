import LoginForm from '@components/forms/LoginForm';

/**
 * LoginPage Component
 * 
 * Trang đăng nhập đơn giản, chỉ chứa LoginForm component
 * LoginForm tự quản lý modal quên mật khẩu bên trong
 */
const LoginPage = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a2f5e 0%, #2a4a8f 100%)',
      padding: '20px'
    }}>
      <LoginForm />
    </div>
  );
};

export default LoginPage;
