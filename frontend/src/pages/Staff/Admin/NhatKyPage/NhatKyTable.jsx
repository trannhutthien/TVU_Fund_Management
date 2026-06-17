import PropTypes from 'prop-types';
import {
  HiOutlineComputerDesktop,
  HiOutlineEye,
  HiOutlineArrowRightOnRectangle,
  HiOutlineArrowLeftOnRectangle,
  HiOutlineDocumentPlus,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineBanknotes,
  HiOutlineHandRaised,
  HiOutlineCheckBadge,
  HiOutlineUserPlus,
  HiOutlinePencilSquare,
  HiOutlineLockClosed,
  HiOutlineLockOpen,
  HiOutlineBuildingLibrary,
  HiOutlineClipboardDocumentList,
} from 'react-icons/hi2';
import Button from '@components/common/Button';
import styles from './NhatKyTable.module.scss';

const ROLE_BADGE = {
  1: { label: 'Admin', color: '#7c3aed', bg: 'rgba(124,58,237,0.10)' },
  2: { label: 'Kế toán', color: '#0891b2', bg: 'rgba(8,145,178,0.10)' },
  3: { label: 'Cán bộ', color: 'var(--color-primary, #1a2f5e)', bg: 'rgba(26,47,94,0.08)' },
};

const HANH_DONG_CONFIG = {
  'DANG_NHAP': { icon: HiOutlineArrowRightOnRectangle, color: '#7c3aed', bg: 'rgba(124,58,237,0.10)', label: 'Đăng nhập' },
  'DANG_XUAT': { icon: HiOutlineArrowLeftOnRectangle, color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', label: 'Đăng xuất' },
  
  'TAO_DON': { icon: HiOutlineDocumentPlus, color: 'var(--color-primary, #1a2f5e)', bg: 'rgba(26,47,94,0.08)', label: 'Tạo đơn' },
  'THEM_MOI_YEU_CAU': { icon: HiOutlineDocumentPlus, color: 'var(--color-primary, #1a2f5e)', bg: 'rgba(26,47,94,0.08)', label: 'Tạo đơn' },
  'NOP_YEU_CAU_HO_TRO': { icon: HiOutlineDocumentPlus, color: 'var(--color-primary, #1a2f5e)', bg: 'rgba(26,47,94,0.08)', label: 'Tạo đơn' },
  
  'DUYET_DON': { icon: HiOutlineCheckCircle, color: '#10b981', bg: 'rgba(16,185,129,0.10)', label: 'Duyệt đơn' },
  'DUYET_YEU_CAU_HO_TRO_CAP_1': { icon: HiOutlineCheckCircle, color: '#10b981', bg: 'rgba(16,185,129,0.10)', label: 'Duyệt cấp 1' },
  'DUYET_YEU_CAU_HO_TRO_CAP_2': { icon: HiOutlineCheckCircle, color: '#10b981', bg: 'rgba(16,185,129,0.10)', label: 'Duyệt cấp 2' },
  'DUYET_YEU_CAU_HO_TRO_CAP_3': { icon: HiOutlineCheckCircle, color: '#10b981', bg: 'rgba(16,185,129,0.10)', label: 'Duyệt cấp 3' },
  
  'TU_CHOI_DON': { icon: HiOutlineXCircle, color: '#ef4444', bg: 'rgba(239,68,68,0.10)', label: 'Từ chối' },
  'TU_CHOI_YEU_CAU_HO_TRO': { icon: HiOutlineXCircle, color: '#ef4444', bg: 'rgba(239,68,68,0.10)', label: 'Từ chối' },
  
  'GIAI_NGAN': { icon: HiOutlineBanknotes, color: '#b45309', bg: 'rgba(240,165,0,0.12)', label: 'Giải ngân' },
  'CAP_NHAT_YEU_CAU_HO_TRO': { icon: HiOutlineBanknotes, color: '#b45309', bg: 'rgba(240,165,0,0.12)', label: 'Phê duyệt & Giải ngân' },
  
  'TAO_TAI_TRO': { icon: HiOutlineHandRaised, color: 'var(--color-gold, #f0a500)', bg: 'rgba(240,165,0,0.10)', label: 'Tạo tài trợ' },
  'THEM_MOI_KHOAN_TAI_TRO': { icon: HiOutlineHandRaised, color: 'var(--color-gold, #f0a500)', bg: 'rgba(240,165,0,0.10)', label: 'Ghi nhận tài trợ' },
  
  'DUYET_KHOAN_TAI_TRO': { icon: HiOutlineCheckCircle, color: '#10b981', bg: 'rgba(16,185,129,0.10)', label: 'Duyệt tài trợ' },
  'XAC_NHAN_TAI_TRO': { icon: HiOutlineCheckBadge, color: '#10b981', bg: 'rgba(16,185,129,0.10)', label: 'Xác nhận' },
  
  'TAO_NGUOI_DUNG': { icon: HiOutlineUserPlus, color: '#0891b2', bg: 'rgba(8,145,178,0.10)', label: 'Tạo user' },
  'THEM_MOI_NGUOI_DUNG': { icon: HiOutlineUserPlus, color: '#0891b2', bg: 'rgba(8,145,178,0.10)', label: 'Tạo user' },
  
  'SUA_NGUOI_DUNG': { icon: HiOutlinePencilSquare, color: '#f97316', bg: 'rgba(249,115,22,0.10)', label: 'Sửa user' },
  'CAP_NHAT_THONG_TIN_NGUOI_DUNG': { icon: HiOutlinePencilSquare, color: '#f97316', bg: 'rgba(249,115,22,0.10)', label: 'Sửa user' },
  
  'KHOA_TAI_KHOAN': { icon: HiOutlineLockClosed, color: '#ef4444', bg: 'rgba(239,68,68,0.10)', label: 'Khóa acc' },
  'MO_KHOA_TAI_KHOAN': { icon: HiOutlineLockOpen, color: '#10b981', bg: 'rgba(16,185,129,0.10)', label: 'Mở acc' },
  'CAP_NHAT_TRANG_THAI_NGUOI_DUNG': { icon: HiOutlineLockClosed, color: '#f97316', bg: 'rgba(249,115,22,0.10)', label: 'Trạng thái user' },
  
  'SUA_QUY': { icon: HiOutlinePencilSquare, color: 'var(--color-primary, #1a2f5e)', bg: 'rgba(26,47,94,0.08)', label: 'Sửa quỹ' },
  'CAP_NHAT_QUY': { icon: HiOutlinePencilSquare, color: 'var(--color-primary, #1a2f5e)', bg: 'rgba(26,47,94,0.08)', label: 'Sửa quỹ' },
  
  'TAO_QUY': { icon: HiOutlineBuildingLibrary, color: 'var(--color-primary, #1a2f5e)', bg: 'rgba(26,47,94,0.08)', label: 'Tạo quỹ' },
  'THEM_MOI_QUY': { icon: HiOutlineBuildingLibrary, color: 'var(--color-primary, #1a2f5e)', bg: 'rgba(26,47,94,0.08)', label: 'Tạo quỹ' },

  'API_TAO_MOI': { icon: HiOutlineDocumentPlus, color: '#0891b2', bg: 'rgba(8,145,178,0.10)', label: 'API tạo mới' },
  'API_CAP_NHAT': { icon: HiOutlinePencilSquare, color: '#f97316', bg: 'rgba(249,115,22,0.10)', label: 'API cập nhật' },
  'API_XOA': { icon: HiOutlineXCircle, color: '#ef4444', bg: 'rgba(239,68,68,0.10)', label: 'API xóa' },
  'DANG_KY_TAI_KHOAN': { icon: HiOutlineUserPlus, color: '#0891b2', bg: 'rgba(8,145,178,0.10)', label: 'Đăng ký' },
  'CAP_NHAT_MAT_KHAU': { icon: HiOutlineLockClosed, color: '#f97316', bg: 'rgba(249,115,22,0.10)', label: 'Đổi mật khẩu' },
  'CAP_NHAT_VAI_TRO': { icon: HiOutlineLockOpen, color: '#7c3aed', bg: 'rgba(124,58,237,0.10)', label: 'Vai trò' },
  'CAP_NHAT_CAI_DAT_HE_THONG': { icon: HiOutlinePencilSquare, color: '#7c3aed', bg: 'rgba(124,58,237,0.10)', label: 'Cài đặt' },
  'CAP_NHAT_PHAN_QUYEN': { icon: HiOutlineLockOpen, color: '#7c3aed', bg: 'rgba(124,58,237,0.10)', label: 'Phân quyền' },
};

const NhatKyTable = ({ logs, loading, onViewDetail }) => {
  const getInitials = (name) => {
    if (!name) return '?';
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return words[words.length - 2][0] + words[words.length - 1][0];
    }
    return name[0];
  };

  const renderActionBadge = (hanhDong) => {
    const config = HANH_DONG_CONFIG[hanhDong] || {
      icon: HiOutlineCheckBadge,
      color: '#64748b',
      bg: 'rgba(100,116,139,0.08)',
      label: hanhDong || 'KHÁC',
    };

    const Icon = config.icon;
    return (
      <span
        className={styles.actionBadge}
        style={{ color: config.color, backgroundColor: config.bg }}
      >
        <Icon size={13} className={styles.actionIcon} />
        <span>{config.label.toUpperCase()}</span>
      </span>
    );
  };

  if (loading) {
    return (
      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <div className={styles.colTime}>Thời gian</div>
          <div className={styles.colUser}>Người thực hiện</div>
          <div className={styles.colAction}>Hành động</div>
          <div className={styles.colTarget}>Đối tượng</div>
          <div className={styles.colDesc}>Mô tả</div>
          <div className={styles.colIp}>IP</div>
          <div className={styles.colOps}>Thao tác</div>
        </div>
        {[...Array(10)].map((_, i) => (
          <div key={i} className={`${styles.row} ${styles.skeleton}`}>
            <div className={styles.colTime}><div className={styles.skeletonBar} /></div>
            <div className={styles.colUser}><div className={styles.skeletonBar} /></div>
            <div className={styles.colAction}><div className={styles.skeletonBar} /></div>
            <div className={styles.colTarget}><div className={styles.skeletonBar} /></div>
            <div className={styles.colDesc}><div className={styles.skeletonBar} /></div>
            <div className={styles.colIp}><div className={styles.skeletonBar} /></div>
            <div className={styles.colOps}><div className={styles.skeletonBar} /></div>
          </div>
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className={styles.emptyState}>
        <HiOutlineClipboardDocumentList size={56} className={styles.emptyIcon} />
        <h3 className={styles.emptyTitle}>Không tìm thấy bản ghi nào</h3>
        <p className={styles.emptySub}>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableHeader}>
        <div className={styles.colTime}>Thời gian</div>
        <div className={styles.colUser}>Người thực hiện</div>
        <div className={styles.colAction}>Hành động</div>
        <div className={styles.colTarget}>Đối tượng</div>
        <div className={styles.colDesc}>Mô tả</div>
        <div className={styles.colIp}>IP</div>
        <div className={styles.colOps}>Thao tác</div>
      </div>
      <div className={styles.tableBody}>
        {logs.map((log) => {
          const createdDate = new Date(log.created_at);
          const dateStr = createdDate.toLocaleDateString('vi-VN');
          const timeStr = createdDate.toLocaleTimeString('vi-VN');

          return (
            <div
              key={log.log_id}
              className={styles.row}
              onClick={() => onViewDetail(log)}
            >
              {/* Cột THỜI GIAN */}
              <div className={styles.colTime}>
                <div className={styles.dateStr}>{dateStr}</div>
                <div className={styles.timeStr}>{timeStr}</div>
              </div>

              {/* Cột NGƯỜI THỰC HIỆN */}
              <div className={styles.colUser}>
                {log.nguoi_thuc_hien ? (
                  <div className={styles.userInfo}>
                    <div className={styles.avatar}>
                      {log.nguoi_thuc_hien.avatar ? (
                        <img
                          src={log.nguoi_thuc_hien.avatar}
                          alt="Avatar"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
                          }}
                        />
                      ) : (
                        <span className={styles.avatarText}>
                          {getInitials(log.nguoi_thuc_hien.ho_ten)}
                        </span>
                      )}
                    </div>
                    <div className={styles.userText}>
                      <span className={styles.userName}>{log.nguoi_thuc_hien.ho_ten}</span>
                      {ROLE_BADGE[log.nguoi_thuc_hien.role_id] && (
                        <span
                          className={styles.roleBadge}
                          style={{
                            color: ROLE_BADGE[log.nguoi_thuc_hien.role_id].color,
                            backgroundColor: ROLE_BADGE[log.nguoi_thuc_hien.role_id].bg,
                          }}
                        >
                          {ROLE_BADGE[log.nguoi_thuc_hien.role_id].label}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className={styles.systemUser}>
                    <HiOutlineComputerDesktop size={20} className={styles.systemIcon} />
                    <span className={styles.systemText}>Hệ thống</span>
                  </div>
                )}
              </div>

              {/* Cột HÀNH ĐỘNG */}
              <div className={styles.colAction}>
                {renderActionBadge(log.hanh_dong)}
              </div>

              {/* Cột ĐỐI TƯỢNG */}
              <div className={styles.colTarget}>
                {log.loai_doi_tuong ? (
                  <div className={styles.targetWrapper}>
                    <span className={styles.targetTypeBadge}>{log.loai_doi_tuong}</span>
                    <span className={styles.targetId}>ID: {log.doi_tuong_id ?? 'N/A'}</span>
                  </div>
                ) : (
                  <span className={styles.nullText}>—</span>
                )}
              </div>

              {/* Cột MÔ TẢ */}
              <div className={styles.colDesc}>
                <span className={styles.descText} title={log.mo_ta}>
                  {log.mo_ta ?? <span className={styles.nullText}>—</span>}
                </span>
              </div>

              {/* Cột IP */}
              <div className={styles.colIp}>
                <span className={styles.ipText}>{log.ip_address ?? '—'}</span>
              </div>

              {/* Cột THAO TÁC */}
              <div className={styles.colOps} onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="small"
                  leftIcon={<HiOutlineEye size={14} />}
                  onClick={() => onViewDetail(log)}
                  className={styles.viewBtn}
                >
                  Xem
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

NhatKyTable.propTypes = {
  logs: PropTypes.arrayOf(
    PropTypes.shape({
      log_id: PropTypes.number.isRequired,
      hanh_dong: PropTypes.string,
      loai_doi_tuong: PropTypes.string,
      doi_tuong_id: PropTypes.number,
      mo_ta: PropTypes.string,
      ip_address: PropTypes.string,
      created_at: PropTypes.string.isRequired,
      nguoi_thuc_hien: PropTypes.shape({
        ho_ten: PropTypes.string.isRequired,
        email: PropTypes.string,
        avatar: PropTypes.string,
        role_id: PropTypes.number.isRequired,
      }),
    })
  ).isRequired,
  loading: PropTypes.bool,
  onViewDetail: PropTypes.func.isRequired,
};

export default NhatKyTable;
export { HANH_DONG_CONFIG };
