import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import Logo from '@components/common/Logo/Logo';
import Button from '@components/common/Button/Button';
import HeaderActions from '@components/common/HeaderActions';
import useAuthStore from '@stores/authStore';
import { authService } from '@services/authService';
import styles from './PublicHeader.module.scss';

/**
 * PublicHeader Component
 * 
 * Header cho trang public của hệ thống TVU Fund Management
 * Gồm: Logo, Navigation Menu, Action Buttons (Đăng ký, Đăng nhập)
 * Responsive với hamburger menu trên mobile
 * 
 * @param {string} activeMenu - Menu đang active (optional, NavLink tự động detect)
 * @param {function} onLoginClick - Callback khi click nút Đăng nhập
 * @param {function} onRegisterClick - Callback khi click nút Đăng ký
 */
const PublicHeader = ({ onLoginClick, onRegisterClick }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user, token, logout: logoutStore } = useAuthStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      if (token) {
        await authService.logout();
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      logoutStore();
      localStorage.removeItem('refreshToken');
      toast.success('Đăng xuất thành công!');
      // Redirect về LandingPage
      window.location.href = '/';
    }
  };

  // Detect scroll để thêm shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu khi resize về desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu khi click link
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Navigation items
  const navItems = [
    { label: 'DANH MỤC QUỸ', path: '/funds' },
    { label: 'HƯỚNG DẪN & QUY ĐỊNH', path: '/guidelines' },
    { label: 'VINH DANH', path: '/donors' },
    // Menu "CÁ NHÂN" và "TẠO ĐƠN" chỉ hiện khi đã đăng nhập
    ...(isAuthenticated
      ? [
          { label: 'CÁ NHÂN', path: '/profile' },
          { label: 'TẠO ĐƠN', path: '/apply', highlight: true },
        ]
      : []),
  ];

  // Handle button clicks
  const handleRegisterClick = () => {
    // Nếu có onRegisterClick callback (từ LandingPage), dùng nó để mở modal
    if (onRegisterClick) {
      onRegisterClick();
    } else {
      // Nếu không, navigate to /register page
      navigate('/register');
    }
    closeMobileMenu();
  };

  const handleLoginClick = () => {
    // Nếu có onLoginClick callback (từ LandingPage), dùng nó để mở modal
    if (onLoginClick) {
      onLoginClick();
    } else {
      // Nếu không, navigate to /login page
      navigate('/login');
    }
    closeMobileMenu();
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <>
      <header className={`${styles.header} ${isScrolled ? styles.headerScrolled : ''}`}>
        <div className={styles.container}>
          {/* Logo Section (Left) */}
          <div className={styles.logoSection}>
            <div onClick={handleLogoClick} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Logo 
                size="sm" 
                variant="icon-only" 
                theme="dark"
              />
              <span className={styles.logoText}>TVU Fund Management</span>
            </div>
          </div>

          {/* Navigation Menu (Center) - Desktop only */}
          <nav className={styles.nav}>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  item.highlight
                    ? `${styles.navLinkHighlight} ${isActive ? styles.activeHighlight : ''}`
                    : `${styles.navLink} ${isActive ? styles.active : ''}`
                }
              >
                {item.highlight && <span className={styles.highlightIcon}>✦</span>}
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Action Buttons (Right) */}
          <div className={styles.actions}>
            {isAuthenticated ? (
              <>
                <HeaderActions
                  user={user}
                  onLogout={handleLogout}
                  size="sm"
                  showNotifications={true}
                />
              </>
            ) : (
              <>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={handleRegisterClick}
                  className={styles.btnRegister}
                >
                  Đăng ký
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleLoginClick}
                  className={styles.btnLogin}
                >
                  Đăng nhập
                </Button>
              </>
            )}

            {/* Hamburger Menu (Mobile only) */}
            <button
              className={`${styles.hamburger} ${isMobileMenuOpen ? styles.hamburgerOpen : ''}`}
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              <span className={styles.hamburgerLine}></span>
              <span className={styles.hamburgerLine}></span>
              <span className={styles.hamburgerLine}></span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
        {/* Navigation Links */}
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              item.highlight
                ? `${styles.mobileNavLinkHighlight} ${isActive ? styles.activeHighlight : ''}`
                : `${styles.mobileNavLink} ${isActive ? styles.active : ''}`
            }
            onClick={closeMobileMenu}
          >
            {item.highlight && <span className={styles.highlightIcon}>✦</span>}
            {item.label}
          </NavLink>
        ))}

        {/* Divider */}
        <div className={styles.mobileDivider}></div>

        {/* Mobile Action Buttons */}
        <div className={styles.mobileActions}>
          {isAuthenticated ? (
            <>
              <HeaderActions
                user={user}
                onLogout={handleLogout}
                size="sm"
                showNotifications={true}
              />
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                size="md"
                onClick={handleRegisterClick}
                className={styles.btnRegister}
              >
                Đăng ký
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleLoginClick}
                className={styles.btnLogin}
              >
                Đăng nhập
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

PublicHeader.propTypes = {
  onLoginClick: PropTypes.func,
  onRegisterClick: PropTypes.func,
};

export default PublicHeader;
