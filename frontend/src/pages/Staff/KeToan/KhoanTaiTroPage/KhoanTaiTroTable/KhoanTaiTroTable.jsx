import {
  HiOutlineEye,
  HiOutlineCheckCircle,
  HiOutlinePaperClip,
  HiOutlineCheckBadge,
  HiOutlineBanknotes,
} from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import StatusBadge from '@components/common/StatusBadge/StatusBadge';
import { useAuth } from '@context/AuthContext';
import { formatCurrency, getInitial } from '@utils/formatters';
import styles from './KhoanTaiTroTable.module.scss';

const LOAI_LABEL = {
  'Ca nhan': 'Cá nhân',
  'To chuc': 'Tổ chức',
  'Doanh nghiep': 'Doanh nghiệp',
  'Doi tac': 'Đối tác',
};

const STATUS_CONFIG = {
  'Cho duyet': { status: 'pending', label: 'Chờ duyệt' },
  'Da duyet': { status: 'processing', label: 'Chờ xác nhận' },
  'Da nhan': { status: 'approved', label: 'Đã xác nhận' },
  'Tu choi': { status: 'rejected', label: 'Từ chối' },
};

const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('vi-VN');
};

const formatTime = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

const apiOrigin = () => {
  const base = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5001/api';
  return base.replace(/\/api\/?$/, '');
};

const KhoanTaiTroTable = ({ data, loading, activeTab, onViewDetail, onConfirm }) => {
  const { user } = useAuth();
  const isAdmin = user?.vaiTro === 1;
  const isKeToan = user?.vaiTro === 2;
  if (loading) {
    return (
      <div className={styles.table}>
        <div className={styles.headerRow}>
          <div className={styles.colSponsor}>Nhà tài trợ</div>
          <div className={styles.colFund}>Quỹ nhận</div>
          <div className={styles.colAmount}>Số tiền</div>
          <div className={styles.colDate}>Ngày tài trợ</div>
          <div className={styles.colStatus}>Trạng thái</div>
          <div className={styles.colProof}>Minh chứng</div>
          <div className={styles.colActions}>Thao tác</div>
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={styles.skeletonRow} />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    const isCanXacNhan = activeTab === 'can_xac_nhan';
    const Icon = isCanXacNhan ? HiOutlineCheckBadge : HiOutlineBanknotes;
    const message = isCanXacNhan
      ? 'Không có khoản nào cần xác nhận'
      : 'Chưa có khoản tài trợ nào';
    return (
      <div className={styles.empty}>
        <Icon className={`${styles.emptyIcon} ${isCanXacNhan ? styles.emptyIconGreen : ''}`} />
        <p>{message}</p>
      </div>
    );
  }

  return (
    <div className={styles.table}>
      <div className={styles.headerRow}>
        <div className={styles.colSponsor}>Nhà tài trợ</div>
        <div className={styles.colFund}>Quỹ nhận</div>
        <div className={styles.colAmount}>Số tiền</div>
        <div className={styles.colDate}>Ngày tài trợ</div>
        <div className={styles.colStatus}>Trạng thái</div>
        <div className={styles.colProof}>Minh chứng</div>
        <div className={styles.colActions}>Thao tác</div>
      </div>

      {data.map((item) => {
        const statusCfg = STATUS_CONFIG[item.trang_thai] || { status: 'pending', label: item.trang_thai };
        const isChoDuyet = item.trang_thai === 'Cho duyet'; // Kế toán duyệt
        const isDaDuyet = item.trang_thai === 'Da duyet'; // Admin xác nhận
        const showHighlight = (isKeToan && isChoDuyet) || (isAdmin && isDaDuyet);
        const minhChungUrl = item.hinh_anh_minh_chung
          ? (item.hinh_anh_minh_chung.startsWith('http')
              ? item.hinh_anh_minh_chung
              : `${apiOrigin()}${item.hinh_anh_minh_chung}`)
          : null;

        return (
          <div
            key={item.khoan_tai_tro_id}
            className={`${styles.row} ${showHighlight ? styles.rowHighlight : ''}`}
          >
            <div className={styles.colSponsor}>
              <div className={styles.sponsorCell}>
                <div className={styles.avatar}>
                  {item.avatar ? (
                    <img src={item.avatar} alt={item.ten_nha_tai_tro} />
                  ) : (
                    <span>{getInitial(item.ten_nha_tai_tro)}</span>
                  )}
                </div>
                <div className={styles.sponsorText}>
                  <div className={styles.sponsorName}>{item.ten_nha_tai_tro}</div>
                  <div className={styles.sponsorLoai}>
                    {LOAI_LABEL[item.loai_ntt] || item.loai_ntt}
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.colFund}>
              <div className={styles.fundName}>{item.ten_quy}</div>
              {item.loai_quy && (
                <span className={styles.fundLoai}>{item.loai_quy}</span>
              )}
            </div>

            <div className={`${styles.colAmount} ${styles.amountCell}`}>
              {formatCurrency(item.so_tien)}
            </div>

            <div className={styles.colDate}>
              <div className={styles.dateMain}>{formatDate(item.ngay_tai_tro)}</div>
              <div className={styles.dateSub}>{formatTime(item.ngay_tai_tro)}</div>
            </div>

            <div className={styles.colStatus}>
              <StatusBadge status={statusCfg.status} label={statusCfg.label} size="sm" />
            </div>

            <div className={`${styles.colProof} ${styles.proofCell}`}>
              {minhChungUrl ? (
                <a
                  href={minhChungUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.proofLink}
                  title="Xem minh chứng"
                >
                  <HiOutlinePaperClip />
                </a>
              ) : (
                <span className={styles.proofEmpty}>—</span>
              )}
            </div>

            <div className={`${styles.colActions} ${styles.actionsCell}`}>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<HiOutlineEye />}
                onClick={() => onViewDetail?.(item)}
              >
                Xem
              </Button>
              {isChoDuyet && isKeToan && (
                <Button
                  variant="success"
                  size="sm"
                  leftIcon={<HiOutlineCheckCircle />}
                  onClick={() => onConfirm?.(item)}
                >
                  Duyệt
                </Button>
              )}
              {isDaDuyet && isAdmin && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<HiOutlineCheckCircle />}
                  onClick={() => onConfirm?.(item)}
                >
                  Xác nhận
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KhoanTaiTroTable;
