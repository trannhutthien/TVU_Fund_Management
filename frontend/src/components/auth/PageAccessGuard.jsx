import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import useAuthStore from '@stores/authStore';
import api from '@services/api';
import Button from '@components/common/Button/Button';
import styles from './PageAccessGuard.module.scss';

const getPageKey = (pathname) => {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return 'landing_page';
  
  // Nếu có segment tin-tuc hoặc tintuc, trả về tin_tuc luôn
  if (segments.some(seg => seg === 'tin-tuc' || seg === 'tintuc')) {
    return 'tin_tuc';
  }
  
  // Đi từ phải qua trái tìm segment hợp lệ
  for (let i = segments.length - 1; i >= 0; i--) {
    let segment = segments[i];
    // Bỏ qua các segment là số (ID) hoặc các hành động chung chung như 'tao', 'sua'
    if (!isNaN(segment) || segment === 'tao' || segment === 'sua' || segment === 'edit' || segment === 'create') {
      continue;
    }
    
    // Chuyển đổi các dạng gạch ngang sang gạch dưới
    let key = segment.replace(/-/g, '_');
    
    // Danh sách các key hợp lệ từ page_permissions.json
    const validKeys = [
      'landing_page', 'funds', 'guidelines', 'donors', 'profile', 'apply', 'track',
      'dashboard', 'users', 'xet_duyet', 'quy', 'nha_tai_tro', 'sinh_vien_noi_bat',
      'tin_tuc', 'bao_cao', 'khoan_tai_tro', 'giao_dich', 'lich_su_giao_dich', 'giai_ngan', 'chung_tu',
      'phe_duyet', 'roles', 'nhat_ky'
    ];
    
    if (validKeys.includes(key)) {
      return key;
    }
  }
  
  let key = segments[segments.length - 1];
  
  // Nếu segment cuối là một số (ví dụ ID của bản ghi xét duyệt /xet-duyet/15)
  if (!isNaN(key)) {
    if (segments.length >= 2) {
      key = segments[segments.length - 2];
    }
  }

  if (key === 'xet-duyet') return 'xet_duyet';
  if (key === 'nha-tai-tro') return 'nha_tai_tro';
  if (key === 'sinh-vien-noi-bat') return 'sinh_vien_noi_bat';
  if (key === 'tin-tuc') return 'tin_tuc';
  if (key === 'bao-cao') return 'bao_cao';
  if (key === 'khoan-tai-tro') return 'khoan_tai_tro';
  if (key === 'giao-dich') return 'giao_dich';
  if (key === 'lich-su-giao-dich') return 'lich_su_giao_dich';
  if (key === 'giai-ngan') return 'giai_ngan';
  if (key === 'chung-tu') return 'chung_tu';
  if (key === 'phe-duyet') return 'phe_duyet';
  return key;
};

const PageAccessGuard = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(true);

  useEffect(() => {
    const fetchPerms = async () => {
      try {
        setLoading(true);
        const res = await api.get('/system/settings/permissions');
        if (res.data?.success) {
          const perms = res.data.permissions;
          setPermissions(perms);
          
          const key = getPageKey(location.pathname);
          const perm = perms[key];
          
          if (perm) {
            let roleKey = 'sinhvien';
            if (isAuthenticated && user) {
              if (user.vaiTro === 1) roleKey = 'admin';
              else if (user.vaiTro === 2) roleKey = 'ketoan';
              else if (user.vaiTro === 3) roleKey = 'canbo';
              else if (user.vaiTro === 4) {
                roleKey = user.loaiTaiKhoan === 'NHA_TAI_TRO' ? 'nhataitro' : 'sinhvien';
              }
            } else {
              // Khách vãng lai chưa đăng nhập
              setHasAccess(!!perm.sinhvien || !!perm.nhataitro);
              setLoading(false);
              return;
            }
            setHasAccess(!!perm[roleKey]);
          } else {
            setHasAccess(true);
          }
        }
      } catch (err) {
        console.error('Error validation page permission:', err);
        setHasAccess(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPerms();
  }, [location.pathname, isAuthenticated, user?.vaiTro, user?.loaiTaiKhoan]);

  if (loading) {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.spinner}></div>
        <p>Đang kiểm tra quyền truy cập...</p>
      </div>
    );
  }

  if (!hasAccess) {
    // Determine redirect dashboard
    let homePath = '/';
    if (isAuthenticated && user) {
      if (user.vaiTro === 1) homePath = '/admin/dashboard';
      else if (user.vaiTro === 2) homePath = '/ke-toan/dashboard';
      else if (user.vaiTro === 3) homePath = '/can-bo/dashboard';
    }

    return (
      <div className={styles.deniedWrapper}>
        <div className={styles.deniedCard}>
          <div className={styles.lockIcon}>🛡️</div>
          <h1 className={styles.title}>Truy Cập Bị Từ Chối</h1>
          <p className={styles.message}>
            Tài khoản của bạn không có quyền truy cập trang này. Vui lòng liên hệ với quản trị viên để biết thêm thông tin.
          </p>
          <div className={styles.actions}>
            <Link to={homePath}>
              <Button variant="primary">Quay lại Trang chủ</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default PageAccessGuard;
