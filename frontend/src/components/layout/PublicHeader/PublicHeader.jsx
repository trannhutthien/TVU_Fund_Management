import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import Logo from '@components/common/Logo/Logo';
import Button from '@components/common/Button/Button';
import HeaderActions from '@components/common/HeaderActions';
import useAuthStore from '@stores/authStore';
import { authService } from '@services/authService';
import api from '@services/api';
import { DEFAULT_PUBLIC_SETTINGS, systemSettingsService } from '@services/systemSettingsService';
import { HiChevronDown, HiChevronRight, HiMagnifyingGlass, HiXMark } from 'react-icons/hi2';
import styles from './PublicHeader.module.scss';

const SEARCHABLE_ITEMS = [
  { label: 'Trang chủ', path: '/' },
  { label: 'Tin tức & Sự kiện', path: '/news' },
  { label: 'Hướng dẫn & Quy định', path: '/guidelines' },
  { label: 'Cựu sinh viên', path: '/alumni' },
  { label: 'Sinh viên nói gì', path: '/testimonials' },
  { label: 'Danh mục quỹ', path: '/funds' },
  { label: 'Lịch sử giao dịch', path: '/lich-su-giao-dich' },
  { label: 'Đối tác & Nhà tài trợ', path: '/donors' },
  { label: 'Tra cứu đơn', path: '/track' },
  { label: 'Tạo đơn đăng ký', path: '/apply' },
  { label: 'Về Quỹ phát triển', path: '/ve-quy-phat-trien' },
  { label: 'Hồ sơ cá nhân', path: '/profile' },
];

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
const PublicHeader = ({ onLoginClick, onRegisterClick, onToggleSidebar }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user, token, logout: logoutStore } = useAuthStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [publicSettings, setPublicSettings] = useState(DEFAULT_PUBLIC_SETTINGS);
  const navRef = useRef(null);
  const searchRef = useRef(null);
  const isStaffUser = isAuthenticated && [1, 2, 3].includes(Number(user?.vaiTro));

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = (value) => {
    setSearchQuery(value);
    if (value.trim().length === 0) {
      setSearchResults([]);
      setShowSearch(false);
      return;
    }
    const q = value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const results = SEARCHABLE_ITEMS.filter((item) => {
      const normalized = item.label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return normalized.includes(q);
    });
    setSearchResults(results);
    setShowSearch(results.length > 0);
  };

  const handleSearchSelect = (path) => {
    setShowSearch(false);
    setSearchQuery('');
    navigate(path);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowSearch(false);
    } else if (e.key === 'Enter' && searchResults.length > 0) {
      handleSearchSelect(searchResults[0].path);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearch(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      navigate('/');
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const toggleStaffSidebar = () => {
    setIsMobileMenuOpen(false);
    if (onToggleSidebar) {
      onToggleSidebar();
    } else {
      window.dispatchEvent(new CustomEvent('tvu:toggle-staff-sidebar'));
    }
  };

  // Toggle mobile header menu.
  const toggleMobileMenu = () => {
    if (!isMobileMenuOpen) {
      window.dispatchEvent(new CustomEvent('tvu:close-staff-sidebar'));
    }
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu khi click link
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
  };

  const toggleDropdown = (label) => {
    setOpenDropdown(prev => (prev === label ? null : label));
  };

  // Navigation items
  const navItems = [
    { label: 'VỀ QUỸ PHÁT TRIỂN ĐHTV', path: '/ve-quy-phat-trien' },
    {
      label: 'TIN TỨC & HƯỚNG DẪN',
      isDropdown: true,
      children: [
        { label: 'Tin tức & Sự kiện', path: '/news' },
        { label: 'Hướng dẫn & Quy định', path: '/guidelines' },
        { label: 'Cựu sinh viên', path: '/alumni' },
        { label: 'Sinh viên nói gì về TVU Fund', path: '/testimonials' },
      ],
    },
    {
      label: 'TÀI CHÍNH & QUỸ',
      isDropdown: true,
      children: [
        { label: 'Danh mục quỹ', path: '/funds' },
        { label: 'Lịch sử giao dịch công khai', path: '/lich-su-giao-dich' },
        { label: 'Đối tác & Nhà tài trợ', path: '/donors' },
      ],
    },
    {
      label: 'TÀI KHOẢN',
      isDropdown: true,
      children: [
        { label: 'Tra cứu đơn', path: '/track' },
        ...(isAuthenticated
          ? [
              { label: 'Cá nhân', path: '/profile' },
              ...(Number(user?.vaiTro) === 4
                ? [{ label: 'Nghĩa vụ hoàn trả', path: '/nghia-vu-hoan-tra' }]
                : []),
            ]
          : []),
      ],
    },
    { label: 'TẠO ĐƠN', path: '/apply', highlight: true },
  ];

  const [permissions, setPermissions] = useState({});

  useEffect(() => {
    const fetchPerms = async () => {
      try {
        const res = await api.get('/system/settings/permissions');
        if (res.data?.success) {
          setPermissions(res.data.permissions);
        }
      } catch (err) {
        console.error('Error fetching permissions in PublicHeader:', err);
      }
    };
    fetchPerms();
  }, []);

  useEffect(() => {
    let isMounted = true;

    systemSettingsService.getPublicSettings()
      .then((settings) => {
        if (isMounted) setPublicSettings(settings);
      })
      .catch((error) => {
        console.error('Error fetching public header settings:', error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const checkPageAccess = (pageKey) => {
    if (!permissions || Object.keys(permissions).length === 0) return true;
    const perm = permissions[pageKey];
    if (!perm) return true;

    if (isAuthenticated && user) {
      let roleKey = 'sinhvien';
      if (user.vaiTro === 1) roleKey = 'admin';
      else if (user.vaiTro === 2) roleKey = 'ketoan';
      else if (user.vaiTro === 3) roleKey = 'canbo';
      else if (user.vaiTro === 4) {
        roleKey = user.loaiTaiKhoan === 'NHA_TAI_TRO' ? 'nhataitro' : 'sinhvien';
      }
      return !!perm[roleKey];
    } else {
      return !!perm.sinhvien || !!perm.nhataitro;
    }
  };

  const PATH_KEYS = {
    '/': 'landing_page',
    '/news': 'news',
    '/funds': 'funds',
    '/guidelines': 'guidelines',
    '/testimonials': 'landing_page',
    '/donors': 'donors',
    '/profile': 'profile',
    '/track': 'track',
    '/lich-su-giao-dich': 'lich_su_giao_dich',
    '/ve-quy-phat-trien': 've_quy_phat_trien',
    '/alumni': 'cuu_sinh_vien',
  };

  const filteredNavItems = navItems.map((item) => {
    const getCleanKey = (path) => {
      if (!path) return '';
      const cleanPath = path.split('?')[0];
      return PATH_KEYS[cleanPath];
    };

    if (item.isDropdown) {
      const filteredChildren = item.children.filter((child) => {
        const key = getCleanKey(child.path);
        return checkPageAccess(key);
      });
      return filteredChildren.length > 0 ? { ...item, children: filteredChildren } : null;
    } else {
      const key = getCleanKey(item.path);
      return checkPageAccess(key) ? item : null;
    }
  }).filter(Boolean);

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
    if (checkPageAccess('landing_page')) {
      navigate('/');
    } else {
      toast.warning('Bạn không có quyền truy cập Trang chủ.');
    }
  };

  return (
    <>
      <header className={`${styles.header} ${isScrolled ? styles.headerScrolled : ''}`}>
        <div className={styles.gridContainer}>
          {/* COL 1 — Logo + System Name (spans 2 rows) */}
          <div className={styles.logoSection} onClick={handleLogoClick}>
            <Logo size="md" variant="icon-only" theme="dark" />
            {checkPageAccess('landing_page') && (
              <span className={styles.logoText}>{publicSettings.ten_he_thong || 'TVU Funds'}</span>
            )}
          </div>

          {/* COL 2 ROW 1 — Search bar */}
          <div className={styles.searchRow}>
            <div className={styles.searchSection} ref={searchRef}>
              <div className={styles.searchBox}>
                <HiMagnifyingGlass className={styles.searchIcon} />
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder="Tìm kiếm..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => searchQuery && searchResults.length > 0 && setShowSearch(true)}
                  onKeyDown={handleSearchKeyDown}
                />
                {searchQuery && (
                  <button type="button" className={styles.searchClear} onClick={() => { setSearchQuery(''); setShowSearch(false); }}>
                    <HiXMark />
                  </button>
                )}
              </div>
              {showSearch && searchResults.length > 0 && (
                <div className={styles.searchDropdown}>
                  {searchResults.map((item) => (
                    <button key={item.path} type="button" className={styles.searchResultItem} onClick={() => handleSearchSelect(item.path)}>
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* COL 2 ROW 2 — Nav menu + Actions */}
          <div className={styles.navRow}>
            <div className={styles.navInner}>
              <nav className={styles.nav} ref={navRef}>
                {filteredNavItems.map((item) => {
                  if (item.isDropdown) {
                    const isOpen = openDropdown === item.label;
                    return (
                      <div className={`${styles.dropdown} ${isOpen ? styles.dropdownOpen : ''}`} key={item.label}>
                        <button type="button" className={styles.dropdownToggle} onClick={() => toggleDropdown(item.label)} aria-expanded={isOpen} aria-haspopup="menu">
                          {item.label} <HiChevronDown className={styles.arrowIcon} />
                        </button>
                        <div className={styles.dropdownMenu}>
                          {item.children.map((child) => (
                            <NavLink key={child.path} to={child.path} className={({ isActive }) => `${styles.dropdownItem} ${isActive ? styles.dropdownItemActive : ''}`} onClick={() => setOpenDropdown(null)}>
                              {child.label}
                            </NavLink>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return (
                    <NavLink key={item.path} to={item.path} className={({ isActive }) => item.highlight ? `${styles.navLinkHighlight} ${isActive ? styles.activeHighlight : ''}` : `${styles.navLink} ${isActive ? styles.active : ''}`}>
                      {item.highlight && <span className={styles.highlightIcon}>✦</span>}
                      {item.label}
                    </NavLink>
                  );
                })}
              </nav>

              <div className={styles.actions}>
                {isStaffUser && (
                  <button type="button" className={styles.sidebarToggle} onClick={toggleStaffSidebar} aria-label="Mở sidebar quản trị" title="Mở sidebar quản trị">
                    <HiChevronRight />
                  </button>
                )}

                {isAuthenticated ? (
                  <HeaderActions user={user} onLogout={handleLogout} size="sm" showNotifications={true} />
                ) : (
                  <Button variant="primary" size="md" onClick={handleLoginClick} className={styles.btnLogin}>Đăng nhập</Button>
                )}

                <button className={`${styles.hamburger} ${isMobileMenuOpen ? styles.hamburgerOpen : ''}`} onClick={toggleMobileMenu} aria-label="Toggle menu">
                  <span className={styles.hamburgerLine}></span>
                  <span className={styles.hamburgerLine}></span>
                  <span className={styles.hamburgerLine}></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
          <div className={styles.mobileSearchBox}>
            <HiMagnifyingGlass className={styles.mobileSearchIcon} />
            <input
              type="text"
              className={styles.mobileSearchInput}
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchResults.length > 0) {
                  handleSearchSelect(searchResults[0].path);
                  closeMobileMenu();
                }
              }}
            />
          </div>
          {showSearch && searchResults.length > 0 && (
            <div className={styles.mobileSearchResults}>
              {searchResults.map((item) => (
                <button key={item.path} type="button" className={styles.mobileSearchResultItem} onClick={() => { handleSearchSelect(item.path); closeMobileMenu(); }}>
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {filteredNavItems.map((item) => {
            if (item.isDropdown) {
              return (
                <div key={item.label} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span className={styles.statusLabel} style={{ paddingLeft: '16px', fontSize: '13px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', fontWeight: 600 }}>
                    {item.label}
                  </span>
                  {item.children.map((child) => (
                    <NavLink key={child.path} to={child.path} className={({ isActive }) => `${styles.mobileNavLink} ${styles.mobileSubNavLink} ${isActive ? styles.active : ''}`} onClick={closeMobileMenu}>
                      <span className={styles.subLinkPrefix}>↳</span> {child.label}
                    </NavLink>
                  ))}
                </div>
              );
            }
            return (
              <NavLink key={item.path} to={item.path} className={({ isActive }) => item.highlight ? `${styles.mobileNavLinkHighlight} ${isActive ? styles.activeHighlight : ''}` : `${styles.mobileNavLink} ${isActive ? styles.active : ''}`} onClick={closeMobileMenu}>
                {item.highlight && <span className={styles.highlightIcon}>✦</span>}
                {item.label}
              </NavLink>
            );
          })}

          <div className={styles.mobileDivider}></div>

          <div className={styles.mobileActions}>
            {isAuthenticated ? (
              <HeaderActions user={user} onLogout={handleLogout} size="sm" showNotifications={true} />
            ) : (
              <Button variant="primary" size="md" onClick={handleLoginClick} className={styles.btnLogin}>Đăng nhập</Button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

PublicHeader.propTypes = {
  onLoginClick: PropTypes.func,
  onRegisterClick: PropTypes.func,
  onToggleSidebar: PropTypes.func,
};

export default PublicHeader;
