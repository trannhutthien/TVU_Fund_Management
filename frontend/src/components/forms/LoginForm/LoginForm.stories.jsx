import React from 'react';
import LoginForm from './LoginForm';

/**
 * LoginForm Demo Page
 * 
 * Demo trang đăng nhập với đầy đủ chức năng
 */
const LoginFormDemo = () => {
  const handleSubmit = (formData) => {
    console.log('Login submitted:', formData);
    alert(`Đăng nhập với:\nIdentifier: ${formData.identifier}\nPassword: ${formData.password}\nGhi nhớ: ${formData.remember}`);
  };

  const handleGoogleLogin = () => {
    console.log('Google login clicked');
    alert('Đăng nhập bằng Google (chức năng sẽ được tích hợp sau)');
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <LoginForm
        onSubmit={handleSubmit}
        onGoogleLogin={handleGoogleLogin}
        loading={false}
      />
    </div>
  );
};

export default LoginFormDemo;
