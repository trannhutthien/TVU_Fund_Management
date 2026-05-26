import { useEffect, useState } from 'react';
import {
  HiOutlineXMark,
  HiOutlinePencilSquare,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineMapPin,
  HiOutlineIdentification,
  HiOutlineShieldCheck,
  HiOutlineBuildingLibrary,
  HiOutlineBuildingOffice2,
  HiOutlineBanknotes,
  HiOutlineCalendarDays,
} from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import StatusBadge from '@components/common/StatusBadge/StatusBadge';
import api from '@services/api';
import styles from './UserDetailDrawer.module.scss';

const LOAI_NTT_LABEL = {
  'Ca nhan': 'Cá nhân',
  'Doanh nghiep': 'Doanh nghiệp',
  'To chuc phi loi nhuan': 'Tổ chức phi lợi nhuận',
};

const ROLE_BADGES = {
  1: { label: 'Admin', color: '#7c3aed', bg: 'rgba(124,58,237,0.12)' },
  2: { label: 'Kế toán', color: '#0891b2', bg: 'rgba(8,145,178,0.12)' },
  3: { label: 'Cán bộ Quỹ', color: 'var(--color-navy-blue, #1a2f5e)', bg: 'rgba(26,47,94,0.1)' },
  SINH_VIEN: { label: 'Sinh viên', color: '#b07500', bg: 'rgba(240,165,0,0.12)' },
  NHA_TAI_TRO: { label: 'Nhà tài trợ', color: '#047857', bg: 'rgba(16,185,129,0.12)' },
};

const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('vi-VN');
};

const formatDateTime = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const formatCurrency = (n) => {
  const v = Number(n) || 0;
  return v.toLocaleString('vi-VN') + 'đ';
};

const maskAccount = (acc) => {
  if (!acc) return '';
  if (acc.length <= 4) return acc;
  return '•••• ' + acc.slice(-4);
};

const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : '?');

const getRoleBadge = (user) => {
  if (Number(user.role_id) === 4) {
    return ROLE_BADGES[user.loai_tai_khoan] || ROLE_BADGES.SINH_VIEN;
  }
  return ROLE_BADGES[user.role_id] || { label: user.ten_vai_tro || '—', color: '#64748b', bg: '#f1f5f9' };
};

const UserDetailDrawer = ({ user, onClose, onEdit }) => {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [bankLoading, setBankLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const isStudent = user.loai_tai_khoan === 'SINH_VIEN';
    if (isStudent) {
      setBankLoading(true);
      api.get(`/bank-accounts/user/${user.user_id}`)
        .then((res) => setBankAccounts(res?.data?.data || []))
        .catch(() => setBankAccounts([]))
        .finally(() => setBankLoading(false));
    } else {
      setBankAccounts([]);
    }
  }, [user?.user_id, user?.loai_tai_khoan]);

  if (!user) return null;

  const isRoleUser = Number(user.role_id) === 4;
  const isStudent = isRoleUser && user.loai_tai_khoan === 'SINH_VIEN';
  const isDonor = isRoleUser && user.loai_tai_khoan === 'NHA_TAI_TRO';
  const isLocked = user.trang_thai === 'KHOA';
  const roleBadge = getRoleBadge(user);

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <aside className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <h2 className={styles.title}>Chi tiết người dùng</h2>
          <div className={styles.headerActions}>
            {isRoleUser && (
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<HiOutlinePencilSquare />}
                onClick={() => onEdit?.(user)}
              >
                Chỉnh sửa
              </Button>
            )}
            <button
              type="button"
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Đóng"
            >
              <HiOutlineXMark />
            </button>
          </div>
        </header>

        <div className={styles.body}>
          {/* Profile Card */}
          <section className={styles.profileCard}>
            <div className={styles.profileAvatar}>
              {user.avatar ? (
                <img src={user.avatar} alt={user.ho_ten} />
              ) : (
                <span>{getInitial(user.ho_ten)}</span>
              )}
            </div>
            <div className={styles.profileInfo}>
              <h3 className={styles.profileName}>{user.ho_ten}</h3>
              <div className={styles.profileMeta}>
                <span
                  className={styles.roleBadge}
                  style={{ background: roleBadge.bg, color: roleBadge.color }}
                >
                  {roleBadge.label}
                </span>
                <StatusBadge
                  status={isLocked ? 'rejected' : 'approved'}
                  label={isLocked ? 'Bị khóa' : 'Hoạt động'}
                  size="sm"
                />
              </div>
              <div className={styles.profileSince}>
                Thành viên từ {formatDate(user.created_at)}
              </div>
            </div>
          </section>

          {/* Thông tin cơ bản */}
          <section className={styles.card}>
            <h4 className={styles.cardTitle}>Thông tin cơ bản</h4>
            <div className={styles.fieldList}>
              <div className={styles.fieldItem}>
                <HiOutlineIdentification className={styles.fieldIcon} />
                <div>
                  <div className={styles.fieldLabel}>Mã định danh</div>
                  <div className={styles.fieldValue}>{user.ma_so_dinh_danh}</div>
                </div>
              </div>
              <div className={styles.fieldItem}>
                <HiOutlineEnvelope className={styles.fieldIcon} />
                <div>
                  <div className={styles.fieldLabel}>Email</div>
                  <div className={styles.fieldValue}>{user.email}</div>
                </div>
              </div>
              <div className={styles.fieldItem}>
                <HiOutlinePhone className={styles.fieldIcon} />
                <div>
                  <div className={styles.fieldLabel}>Số điện thoại</div>
                  <div className={styles.fieldValue}>{user.so_dien_thoai || '—'}</div>
                </div>
              </div>
              <div className={styles.fieldItem}>
                <HiOutlineMapPin className={styles.fieldIcon} />
                <div>
                  <div className={styles.fieldLabel}>Địa chỉ</div>
                  <div className={styles.fieldValue}>{user.dia_chi || '—'}</div>
                </div>
              </div>
            </div>
          </section>

          {/* SINH VIEN */}
          {isStudent && (
            <>
              <section className={styles.card}>
                <h4 className={styles.cardTitle}>Khoa / Ngành</h4>
                <div className={styles.bigText}>{user.khoa_phong || '—'}</div>
              </section>

              <section className={styles.card}>
                <h4 className={styles.cardTitle}>Tài khoản ngân hàng</h4>
                {bankLoading ? (
                  <p className={styles.empty}>Đang tải...</p>
                ) : bankAccounts.length === 0 ? (
                  <p className={styles.empty}>Sinh viên chưa đăng ký tài khoản ngân hàng</p>
                ) : (
                  <ul className={styles.bankList}>
                    {bankAccounts.map((acc) => (
                      <li key={acc.taiKhoanId} className={styles.bankItem}>
                        <HiOutlineBuildingLibrary className={styles.bankIcon} />
                        <div className={styles.bankText}>
                          <div className={styles.bankName}>{acc.tenNganHang}</div>
                          <div className={styles.bankAcc}>
                            {maskAccount(acc.soTaiKhoan)} · {acc.chuTaiKhoan}
                          </div>
                        </div>
                        {acc.laMacDinh ? (
                          <span className={styles.defaultBadge}>Mặc định</span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}

          {/* NHA TAI TRO */}
          {isDonor && (
            <section className={styles.card}>
              <h4 className={styles.cardTitle}>Thông tin nhà tài trợ</h4>
              <div className={styles.fieldList}>
                <div className={styles.fieldItem}>
                  <HiOutlineBuildingOffice2 className={styles.fieldIcon} />
                  <div>
                    <div className={styles.fieldLabel}>Tên tổ chức</div>
                    <div className={styles.fieldValue}>{user.ten_nha_tai_tro || '—'}</div>
                  </div>
                </div>
                <div className={styles.fieldItem}>
                  <HiOutlineIdentification className={styles.fieldIcon} />
                  <div>
                    <div className={styles.fieldLabel}>Loại</div>
                    <div className={styles.fieldValue}>
                      {LOAI_NTT_LABEL[user.loai_nha_tai_tro] || user.loai_nha_tai_tro || '—'}
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.donorStatsGrid}>
                <div className={styles.donorStat}>
                  <HiOutlineBanknotes className={styles.donorStatIcon} />
                  <div className={styles.donorStatValue}>
                    {formatCurrency(user.tong_so_tien_da_tai_tro)}
                  </div>
                  <div className={styles.donorStatLabel}>Tổng đóng góp</div>
                </div>
                <div className={styles.donorStat}>
                  <HiOutlineCalendarDays className={styles.donorStatIcon} />
                  <div className={styles.donorStatValue}>
                    {Number(user.so_lan_tai_tro) || 0}
                  </div>
                  <div className={styles.donorStatLabel}>Số lần tài trợ</div>
                </div>
              </div>
            </section>
          )}

          {/* NHAN VIEN */}
          {!isRoleUser && (
            <div className={styles.staffBanner}>
              <HiOutlineShieldCheck className={styles.staffBannerIcon} />
              <div>
                <div className={styles.staffBannerTitle}>Tài khoản hệ thống</div>
                <div className={styles.staffBannerText}>
                  Không thể chỉnh sửa thông tin từ trang này. Liên hệ Quản trị viên
                  nếu cần điều chỉnh.
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default UserDetailDrawer;
