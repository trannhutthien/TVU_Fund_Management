import {
  HiOutlineEye,
  HiOutlinePencilSquare,
  HiOutlineLockClosed,
  HiOutlineLockOpen,
  HiOutlineUsers,
  HiOutlineAcademicCap,
  HiOutlineHandRaised,
  HiOutlineShieldCheck,
  HiOutlineTrash,
} from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import StatusBadge from '@components/common/StatusBadge/StatusBadge';
import useAuthStore from '@stores/authStore';
import styles from './UserTable.module.scss';

const ROLE_BADGES = {
  1: { label: 'Admin', color: '#7c3aed', bg: 'rgba(124,58,237,0.12)' },
  2: { label: 'Kế toán', color: '#0891b2', bg: 'rgba(8,145,178,0.12)' },
  3: { label: 'Cán bộ Quỹ', color: 'var(--color-navy-blue, #1a2f5e)', bg: 'rgba(26,47,94,0.1)' },
  SINH_VIEN: { label: 'Sinh viên', color: 'var(--color-gold, #b07500)', bg: 'rgba(240,165,0,0.12)' },
  NHA_TAI_TRO: { label: 'Nhà tài trợ', color: '#047857', bg: 'rgba(16,185,129,0.12)' },
};

const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('vi-VN');
};

const formatCurrency = (n) => {
  const v = Number(n) || 0;
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)} tỷ`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)} triệu`;
  return v.toLocaleString('vi-VN') + 'đ';
};

const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : '?');

const getRoleBadge = (user) => {
  if (Number(user.role_id) === 4) {
    return ROLE_BADGES[user.loai_tai_khoan] || ROLE_BADGES.SINH_VIEN;
  }
  return ROLE_BADGES[user.role_id] || { label: user.ten_vai_tro || '—', color: '#64748b', bg: '#f1f5f9' };
};

const UserTable = ({ data, loading, activeTab, onViewDetail, onEdit, onToggleStatus, isAdmin = false, onDelete }) => {
  const { user: currentUser } = useAuthStore();
  const showStudentCols = activeTab === 'sinh_vien';
  const showDonorCols = activeTab === 'nha_tai_tro';

  const renderHeader = () => (
    <div className={styles.headerRow}>
      <div className={styles.colUser}>Người dùng</div>
      <div className={styles.colEmail}>Email</div>
      {showStudentCols && <div className={styles.colMssv}>MSSV</div>}
      {showStudentCols && <div className={styles.colKhoa}>Khoa/Ngành</div>}
      {showDonorCols && <div className={styles.colLoai}>Loại</div>}
      {showDonorCols && <div className={styles.colTong}>Tổng tài trợ</div>}
      <div className={styles.colRole}>Vai trò</div>
      <div className={styles.colStatus}>Trạng thái</div>
      <div className={styles.colDate}>Ngày tạo</div>
      <div className={styles.colActions}>Thao tác</div>
    </div>
  );

  if (loading) {
    return (
      <div className={styles.table}>
        {renderHeader()}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={styles.skeletonRow} />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    const emptyIcons = {
      tat_ca: HiOutlineUsers,
      sinh_vien: HiOutlineAcademicCap,
      nha_tai_tro: HiOutlineHandRaised,
      nhan_vien: HiOutlineShieldCheck,
    };
    const Icon = emptyIcons[activeTab] || HiOutlineUsers;
    const emptyText = {
      tat_ca: 'Chưa có người dùng nào',
      sinh_vien: 'Chưa có sinh viên nào',
      nha_tai_tro: 'Chưa có nhà tài trợ nào',
      nhan_vien: 'Chưa có nhân viên hệ thống',
    };
    return (
      <div className={styles.empty}>
        <Icon className={styles.emptyIcon} />
        <p>{emptyText[activeTab] || 'Không có dữ liệu'}</p>
      </div>
    );
  }

  return (
    <div className={styles.table}>
      {renderHeader()}

      {data.map((u) => {
        const isUser = Number(u.role_id) === 4;
        const roleBadge = getRoleBadge(u);
        const isLocked = u.trang_thai === 'KHOA';

        return (
          <div
            key={u.user_id}
            className={`${styles.row} ${(!isUser && !isAdmin) ? styles.rowReadonly : ''}`}
          >
            <div className={styles.colUser}>
              <div className={styles.userCell}>
                <div className={styles.avatar}>
                  {u.avatar ? (
                    <img src={u.avatar} alt={u.ho_ten} />
                  ) : (
                    <span>{getInitial(u.ho_ten)}</span>
                  )}
                </div>
                <div className={styles.userText}>
                  <div className={styles.userName}>{u.ho_ten}</div>
                  <div className={styles.userId}>{u.ma_so_dinh_danh}</div>
                </div>
              </div>
            </div>

            <div className={styles.colEmail}>
              <span className={styles.emailText}>{u.email}</span>
            </div>

            {showStudentCols && (
              <div className={styles.colMssv}>{u.ma_so_dinh_danh}</div>
            )}
            {showStudentCols && (
              <div className={styles.colKhoa}>
                <span className={styles.khoaText}>{u.khoa_phong || '—'}</span>
              </div>
            )}

            {showDonorCols && (
              <div className={styles.colLoai}>
                <span className={styles.loaiText}>
                  {u.loai_nha_tai_tro === 'Doanh nghiep'
                    ? 'Doanh nghiệp'
                    : u.loai_nha_tai_tro === 'To chuc'
                      ? 'Tổ chức'
                      : u.loai_nha_tai_tro === 'Doi tac'
                        ? 'Đối tác'
                      : 'Cá nhân'}
                </span>
              </div>
            )}
            {showDonorCols && (
              <div className={styles.colTong}>
                <span className={styles.tongText}>
                  {formatCurrency(u.tong_so_tien_da_tai_tro)}
                </span>
              </div>
            )}

            <div className={styles.colRole}>
              <span
                className={styles.roleBadge}
                style={{ background: roleBadge.bg, color: roleBadge.color }}
              >
                {roleBadge.label}
              </span>
            </div>

            <div className={styles.colStatus}>
              <StatusBadge
                status={isLocked ? 'rejected' : 'approved'}
                label={isLocked ? 'Bị khóa' : 'Hoạt động'}
                size="sm"
              />
            </div>

            <div className={styles.colDate}>{formatDate(u.created_at)}</div>

            <div className={`${styles.colActions} ${styles.actionsCell}`}>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<HiOutlineEye />}
                onClick={() => onViewDetail?.(u)}
              >
                Xem
              </Button>

              {(isUser || (isAdmin && currentUser?.id !== u.user_id)) && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<HiOutlinePencilSquare />}
                    onClick={() => onEdit?.(u)}
                    className={styles.editBtn}
                  >
                    Sửa
                  </Button>
                  <button
                    type="button"
                    className={`${styles.toggleBtn} ${isLocked ? styles.unlockBtn : styles.lockBtn}`}
                    onClick={() => onToggleStatus?.(u)}
                    title={isLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                  >
                    {isLocked ? <HiOutlineLockOpen /> : <HiOutlineLockClosed />}
                    <span>{isLocked ? 'Mở khóa' : 'Khóa'}</span>
                  </button>
                </>
              )}

              {isAdmin && currentUser?.id !== u.user_id && (
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<HiOutlineTrash />}
                  onClick={() => onDelete?.(u)}
                  className={styles.deleteBtn}
                >
                  Xóa
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UserTable;
