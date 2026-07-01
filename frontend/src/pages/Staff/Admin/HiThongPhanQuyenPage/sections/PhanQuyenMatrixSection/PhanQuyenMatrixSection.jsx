import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { HiOutlineShieldCheck, HiOutlineCheck } from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import api from '@services/api';
import styles from './PhanQuyenMatrixSection.module.scss';

const ROLES_HEADER = [
  { key: 'admin', label: 'Admin (1)', color: '#7c3aed', bg: 'rgba(124,58,237,0.10)' },
  { key: 'canbo', label: 'Cán bộ (3)', color: 'var(--color-primary, #1a2f5e)', bg: 'rgba(26,47,94,0.08)' },
  { key: 'ketoan', label: 'Kế toán (2)', color: '#0891b2', bg: 'rgba(8,145,178,0.10)' },
  { key: 'sinhvien', label: 'Sinh viên (4-SV)', color: 'var(--color-gold, #f0a500)', bg: 'rgba(240,165,0,0.10)' },
  { key: 'nhataitro', label: 'Nhà tài trợ (4-NTT)', color: '#10b981', bg: 'rgba(16,185,129,0.10)' },
];

const PAGE_GROUPS = [
  {
    nhom: 'TRANG CHỦ & PUBLIC HEADER',
    items: [
      { key: 'landing_page', label: 'Trang chủ (Landing Page)', path: '/' },
      { key: 'funds', label: 'Danh mục quỹ', path: '/funds' },
      { key: 'guidelines', label: 'Hướng dẫn & Quy định', path: '/guidelines' },
      { key: 'donors', label: 'Đối tác & Nhà tài trợ', path: '/donors' },
      { key: 'profile', label: 'Cá nhân (Profile)', path: '/profile' },
      { key: 'apply', label: 'Tạo đơn hỗ trợ', path: '/apply' },
      { key: 'lich_su_giao_dich', label: 'Lịch sử giao dịch công khai', path: '/lich-su-giao-dich' },
      { key: 've_quy_phat_trien', label: 'Về Quỹ Phát Triển ĐHTV', path: '/ve-quy-phat-trien' },
    ]
  },
  {
    nhom: 'BẢNG ĐIỀU KHIỂN & CHUNG (STAFF)',
    items: [
      { key: 'dashboard', label: 'Trang tổng quan (Dashboard)', path: '/dashboard' },
      { key: 'users', label: 'Quản lý người dùng', path: '/users' },
      { key: 'xet_duyet', label: 'Xét duyệt hồ sơ', path: '/xet-duyet' },
      { key: 'quy', label: 'Danh sách Quỹ', path: '/quy' },
      { key: 'nha_tai_tro', label: 'Danh sách Nhà tài trợ', path: '/nha-tai-tro' },
      { key: 'sinh_vien_noi_bat', label: 'Sinh viên nổi bật', path: '/sinh-vien-noi-bat' },
      { key: 'tin_tuc', label: 'Tin tức & Sự kiện', path: '/tin-tuc' },
      { key: 'bao_cao', label: 'Thống kê & Báo cáo', path: '/bao-cao' },
    ]
  },
  {
    nhom: 'KẾ TOÁN & TÀI CHÍNH',
    items: [
      { key: 'khoan_tai_tro', label: 'Quản lý Khoản tài trợ', path: '/khoan-tai-tro' },
      { key: 'giao_dich', label: 'Lịch sử giao dịch', path: '/giao-dich' },
      { key: 'giai_ngan', label: 'Giải ngân hồ sơ', path: '/giai-ngan' },
      { key: 'chung_tu', label: 'Đối soát chứng từ', path: '/chung-tu' },
    ]
  },
  {
    nhom: 'ADMIN & HỆ THỐNG',
    items: [
      { key: 'phe_duyet', label: 'Lịch sử phê duyệt', path: '/phe-duyet' },
      { key: 'roles', label: 'Hệ thống & Phân quyền', path: '/roles' },
    ]
  }
];

const PhanQuyenMatrixSection = () => {
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/system/settings/permissions');
      if (response.data?.success) {
        setPermissions(response.data.permissions);
      }
    } catch (err) {
      console.error('Error fetching permissions map:', err);
      toast.error('Lỗi khi tải ma trận phân quyền');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const handleCheckboxChange = (pageKey, roleKey) => {
    setPermissions((prev) => {
      const current = prev[pageKey] || {
        label: '',
        path: '',
        admin: false,
        canbo: false,
        ketoan: false,
        sinhvien: false,
        nhataitro: false,
      };
      return {
        ...prev,
        [pageKey]: {
          ...current,
          [roleKey]: !current[roleKey],
        },
      };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await api.patch('/system/settings/permissions', permissions);
      if (response.data?.success) {
        toast.success('Cập nhật ma trận phân quyền thành công! Trang chủ và sidebar sẽ hiển thị dựa theo ma trận mới.');
        // Refresh local cache / state
        fetchPermissions();
      } else {
        toast.error('Lưu thất bại');
      }
    } catch (err) {
      console.error('Error saving permissions map:', err);
      toast.error('Lỗi khi lưu ma trận phân quyền');
    } finally {
      setSaving(false);
    }
  };

  if (loading && Object.keys(permissions).length === 0) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner}></div>
        <p>Đang tải cấu hình phân quyền...</p>
      </div>
    );
  }

  return (
    <div className={styles.section}>
      <header className={styles.sectionHeader}>
        <div className={styles.headerLeft}>
          <h2 className={styles.sectionTitle}>Ma trận phân quyền</h2>
          <p className={styles.sectionSub}>
            Tùy chọn hiển thị các trang lớn trên Public Header và Sidebar cho từng vai trò
          </p>
        </div>
        <Button
          variant="primary"
          size="small"
          onClick={handleSave}
          disabled={saving}
          className={styles.saveBtn}
        >
          <HiOutlineShieldCheck size={16} />
          <span>{saving ? 'Đang lưu...' : 'Lưu ma trận'}</span>
        </Button>
      </header>

      {/* Warning banner */}
      <div className={styles.infoAlert}>
        <span>⚠️ Nhấp chọn để cấp quyền truy cập trang cho vai trò tương ứng. Các menu tiêu đề không được chọn sẽ tự động ẩn khỏi Public Header và Sidebar.</span>
      </div>

      <div className={styles.card}>
        <div className={styles.tableWrapper}>
          <table className={styles.matrixTable}>
            <thead>
              <tr>
                <th className={styles.funcHeader}>Trang chức năng (Đường dẫn)</th>
                {ROLES_HEADER.map((role) => (
                  <th
                    key={role.key}
                    className={styles.roleHeader}
                    style={{ backgroundColor: role.bg }}
                  >
                    <span className={styles.roleBadge} style={{ color: role.color }}>
                      {role.label}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PAGE_GROUPS.map((group, groupIdx) => (
                <div key={groupIdx} style={{ display: 'contents' }}>
                  {/* Group category row */}
                  <tr className={styles.groupRow}>
                    <td colSpan={6} className={styles.groupName}>
                      {group.nhom}
                    </td>
                  </tr>

                  {/* Group items */}
                  {group.items.map((item) => {
                    const itemPerms = permissions[item.key] || {
                      admin: false,
                      canbo: false,
                      ketoan: false,
                      sinhvien: false,
                      nhataitro: false,
                    };

                    return (
                      <tr key={item.key} className={styles.itemRow}>
                        <td className={styles.itemLabel}>
                          <div>
                            <span className={styles.itemTitle}>{item.label}</span>
                            <span className={styles.itemPath}>{item.path}</span>
                          </div>
                        </td>
                        {ROLES_HEADER.map((role) => {
                          const isChecked = !!itemPerms[role.key];
                          return (
                            <td key={role.key} className={styles.itemPermission}>
                              <label className={styles.checkboxContainer}>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleCheckboxChange(item.key, role.key)}
                                  disabled={saving}
                                  className={styles.checkboxInput}
                                />
                                <span className={`${styles.customCheckbox} ${isChecked ? styles.checked : ''}`}>
                                  {isChecked && <HiOutlineCheck className={styles.checkIcon} />}
                                </span>
                              </label>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </div>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PhanQuyenMatrixSection;
