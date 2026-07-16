import PropTypes from 'prop-types';
import {
  HiOutlineEye,
  HiOutlineDocumentText,
  HiOutlineBanknotes,
  HiOutlineClipboardDocumentList,
} from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import StatusBadge from '@components/common/StatusBadge/StatusBadge';
import { getInitial } from '@utils/formatters';
import styles from './PheDuyetTable.module.scss';

const PheDuyetTable = ({ data, loading, onViewDetail }) => {
  const ROLE_COLORS = {
    'Quan tri vien': { bg: 'rgba(168,85,247,0.12)', color: '#9333ea' },
    'Giao vu': { bg: 'rgba(26,47,94,0.10)', color: 'var(--color-primary)' },
    'Ke toan': { bg: 'rgba(240,165,0,0.12)', color: '#b45309' },
  };

  const CAP_DO_LABEL = {
    1: {
      label: 'Cấp 1',
      sub: 'Cán bộ / Giáo vụ',
      color: 'var(--color-primary)',
      bg: 'rgba(26,47,94,0.08)',
    },
    2: {
      label: 'Cấp 2',
      sub: 'Trưởng phòng / Admin',
      color: '#7c3aed',
      bg: 'rgba(124,58,237,0.10)',
    },
    3: {
      label: 'Cấp 3',
      sub: 'Kế toán / Ban GH',
      color: '#0891b2',
      bg: 'rgba(8,145,178,0.10)',
    },
  };

  const KET_QUA_MAP = {
    'Da duyet': { status: 'approved', label: 'Đã duyệt' },
    'Tu choi': { status: 'rejected', label: 'Từ chối' },
    'Yeu cau bo sung': { status: 'processing', label: 'Yêu cầu bổ sung' },
    'Cho duyet': { status: 'pending', label: 'Chờ duyệt' },
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Chưa xử lý';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN');
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Người duyệt</th>
              <th>Loại nguồn</th>
              <th>Tên đơn / Khoản</th>
              <th>Cấp duyệt</th>
              <th>Kết quả</th>
              <th>Ngày duyệt</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                <td colSpan={7}>
                  <div className={styles.skeleton} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={styles.empty}>
        <HiOutlineClipboardDocumentList size={56} />
        <p>Không tìm thấy bản ghi phê duyệt</p>
      </div>
    );
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Người duyệt</th>
            <th>Loại nguồn</th>
            <th>Tên đơn / Khoản</th>
            <th>Cấp duyệt</th>
            <th>Kết quả</th>
            <th>Ngày duyệt</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => {
            const isRejected = row.ket_qua === 'Tu choi';
            const isProcessing = row.ket_qua === 'Yeu cau bo sung';
            const roleColor = ROLE_COLORS[row.ten_vai_tro] || {};
            const capInfo = CAP_DO_LABEL[row.cap_do_duyet] || {};
            const ketQuaInfo = KET_QUA_MAP[row.ket_qua] || {};

            return (
              <tr
                key={row.phe_duyet_id}
                className={`${isRejected ? styles.rowRejected : ''} ${
                  isProcessing ? styles.rowProcessing : ''
                }`}
              >
                {/* Người duyệt */}
                <td>
                  <div className={styles.approver}>
                    <div className={styles.avatar}>
                      {row.avatar ? (
                        <img src={row.avatar} alt={row.ho_ten} />
                      ) : (
                        <span>{getInitial(row.ho_ten)}</span>
                      )}
                    </div>
                    <div className={styles.approverInfo}>
                      <div className={styles.approverName}>{row.ho_ten || 'Chưa có'}</div>
                      <div className={styles.approverRole}>
                        {row.ten_vai_tro && (
                          <span
                            className={styles.roleBadge}
                            style={{
                              background: roleColor.bg,
                              color: roleColor.color,
                            }}
                          >
                            {row.ten_vai_tro}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Loại nguồn */}
                <td>
                  {row.request_id ? (
                    <div className={`${styles.sourceBadge} ${styles.sourceBadgeYeucau}`}>
                      <HiOutlineDocumentText size={14} />
                      <span>Đơn hỗ trợ</span>
                    </div>
                  ) : (
                    <div className={`${styles.sourceBadge} ${styles.sourceBadgeTaitro}`}>
                      <HiOutlineBanknotes size={14} />
                      <span>Khoản tài trợ</span>
                    </div>
                  )}
                </td>

                {/* Tên đơn / Khoản */}
                <td>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemTitle}>
                      {row.tieu_de || row.ten_nha_tai_tro || '—'}
                    </div>
                    <div className={styles.itemSub}>
                      {row.ten_sinh_vien || row.ten_quy || '—'}
                    </div>
                  </div>
                </td>

                {/* Cấp duyệt */}
                <td>
                  <div
                    className={styles.capBadge}
                    style={{
                      background: capInfo.bg,
                      color: capInfo.color,
                    }}
                  >
                    <div className={styles.capLabel}>{capInfo.label}</div>
                    <div className={styles.capSub}>{capInfo.sub}</div>
                  </div>
                </td>

                {/* Kết quả */}
                <td>
                  <StatusBadge status={ketQuaInfo.status}>
                    {ketQuaInfo.label}
                  </StatusBadge>
                </td>

                {/* Ngày duyệt */}
                <td>
                  {row.ngay_duyet ? (
                    <div className={styles.dateInfo}>
                      <div className={styles.date}>{formatDate(row.ngay_duyet)}</div>
                      <div className={styles.time}>{formatTime(row.ngay_duyet)}</div>
                    </div>
                  ) : (
                    <span className={styles.notProcessed}>Chưa xử lý</span>
                  )}
                </td>

                {/* Thao tác */}
                <td>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<HiOutlineEye />}
                    onClick={() => onViewDetail(row)}
                  >
                    Xem chuỗi duyệt
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

PheDuyetTable.propTypes = {
  data: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  onViewDetail: PropTypes.func.isRequired,
};

export default PheDuyetTable;
