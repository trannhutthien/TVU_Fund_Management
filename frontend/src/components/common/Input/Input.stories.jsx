import React, { useState } from 'react';
import Input from './Input';

/**
 * Input Examples / Stories
 * Demo Validation States của Input component
 */

// Icon examples
const EmailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const DollarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const InputExamples = () => {
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    amount: '',
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState({});

  // Handle change
  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
    // Clear error when typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: false });
    }
    // Clear success when typing
    if (success[field]) {
      setSuccess({ ...success, [field]: false });
    }
  };

  // Validate email
  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      setErrors({ ...errors, email: true });
      setSuccess({ ...success, email: false });
    } else if (!emailRegex.test(formData.email)) {
      setErrors({ ...errors, email: true });
      setSuccess({ ...success, email: false });
    } else {
      setErrors({ ...errors, email: false });
      setSuccess({ ...success, email: true });
    }
  };

  // Validate password
  const validatePassword = () => {
    if (!formData.password) {
      setErrors({ ...errors, password: true });
      setSuccess({ ...success, password: false });
    } else if (formData.password.length < 8) {
      setErrors({ ...errors, password: true });
      setSuccess({ ...success, password: false });
    } else {
      setErrors({ ...errors, password: false });
      setSuccess({ ...success, password: true });
    }
  };

  return (
    <div style={{ padding: '40px', background: '#EEF0F5', minHeight: '100vh' }}>
      <h1 style={{ marginBottom: '32px', fontFamily: 'Plus Jakarta Sans', color: '#0F172A' }}>
        Input Component - Validation States
      </h1>

      {/* Validation States */}
      <section style={{ marginBottom: '48px', maxWidth: '600px' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '18px', color: '#334155' }}>
          Validation States Demo
        </h2>
        <div style={{ background: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)' }}>
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange('email')}
            onBlur={validateEmail}
            leftIcon={<EmailIcon />}
            error={errors.email}
            errorMessage="Email không hợp lệ"
            success={success.email}
            successMessage="Email hợp lệ"
            helperText="Nhập email của bạn"
          />

          <Input
            label="Mật khẩu"
            type="password"
            value={formData.password}
            onChange={handleChange('password')}
            onBlur={validatePassword}
            leftIcon={<LockIcon />}
            showPasswordToggle
            error={errors.password}
            errorMessage="Mật khẩu phải có ít nhất 8 ký tự"
            success={success.password}
            successMessage="Mật khẩu mạnh"
            helperText="Tối thiểu 8 ký tự"
          />

          <Input
            label="Số tiền"
            type="number"
            value={formData.amount}
            onChange={handleChange('amount')}
            leftIcon={<DollarIcon />}
            helperText="Nhập số tiền cần hỗ trợ"
          />
        </div>
      </section>

      {/* Instructions */}
      <section style={{ maxWidth: '600px' }}>
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '16px', color: '#0F172A', fontWeight: 600 }}>
            Hướng dẫn test:
          </h3>
          <ul style={{ marginLeft: '20px', color: '#334155', lineHeight: '1.8' }}>
            <li><strong>Email:</strong> Nhập email không hợp lệ → Blur → Thấy error (đỏ)</li>
            <li><strong>Email:</strong> Nhập email hợp lệ → Blur → Thấy success (xanh lá)</li>
            <li><strong>Mật khẩu:</strong> Nhập &lt; 8 ký tự → Blur → Thấy error</li>
            <li><strong>Mật khẩu:</strong> Nhập ≥ 8 ký tự → Blur → Thấy success</li>
            <li><strong>Số tiền:</strong> Chỉ có helper text (không validation)</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default InputExamples;
