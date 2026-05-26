import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineArrowsRightLeft,
  HiInboxArrowDown,
  HiArrowUp,
  HiArrowDown,
} from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import StatusBadge from '@components/common/StatusBadge/StatusBadge';
import styles from './RecentTransactionSection.module.scss';

const STATUS_TO_BADGE = {
  'Thanh cong': 'completed',
  'Cho xu ly': 'pending',
  'That bai': 'rejected',
  'Hoan tien': 'cancelled',
};

const formatCurrency = (n) => Number(n || 0).toLocaleString('vi-VN') + ' đ';
const formatDate = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('vi-VN');
};

const RecentTransactionSection = ({ data, isLoading }) => {
  const navigate = useNavigate();

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.titleBlock}>
          <HiOutlineArrowsRightLeft size={18} className={styles.titleIcon} />
          <h3 className={styles.title}>Giao dịch gần đây</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/ke-toan/giao-dich')}
          className={styles.viewAllBtn}
        >
          Xem tất cả →
        </Button>
      </div>

      {isLoading ? (
        <div className={styles.skeletonWrap}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={styles.skeletonRow} />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className={styles.empty}>
          <HiInboxArrowDown size={40} className={styles.emptyIcon} />
          <span>Chưa có giao dịch nào</span>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.colCode}>MÃ GD</th>
                <th className={styles.colType}>LOẠI</th>
                <th className={styles.colFund}>QUỸ LIÊN QUAN</th>
                <th className={styles.colAmount}>SỐ TIỀN</th>
                <th className={styles.colStatus}>TRẠNG THÁI</th>
                <th className={styles.colNote}>GHI CHÚ</th>
                <th className={styles.colDate}>NGÀY TẠO</th>
              </tr>
            </thead>
            <tbody>
              {data.map((tx) => {
                const isThu = tx.loai === 'Thu';
                return (
                  <tr key={tx.transactionId}>
                    <td className={styles.cellCode}>
                      #GD{tx.transactionId}
                    </td>
                    <td>
                      <span
                        className={`${styles.typeBadge} ${
                          isThu ? styles.typeBadgeThu : styles.typeBadgeChi
                        }`}
                      >
                        {isThu ? (
                          <HiArrowUp size={11} />
                        ) : (
                          <HiArrowDown size={11} />
                        )}
                        {tx.loai}
                      </span>
                    </td>
                    <td className={styles.cellFund} title={tx.tenQuy}>
                      {tx.tenQuy || '—'}
                    </td>
                    <td
                      className={`${styles.cellAmount} ${
                        isThu ? styles.amountThu : styles.amountChi
                      }`}
                    >
                      {formatCurrency(tx.soTien)}
                    </td>
                    <td>
                      <StatusBadge
                        status={STATUS_TO_BADGE[tx.trangThai] || 'pending'}
                        size="sm"
                      />
                    </td>
                    <td className={styles.cellNote} title={tx.ghiChu}>
                      {tx.ghiChu || '—'}
                    </td>
                    <td className={styles.cellDate}>
                      {formatDate(tx.ngayGiaoDich)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

RecentTransactionSection.propTypes = {
  data: PropTypes.array,
  isLoading: PropTypes.bool,
};

export default RecentTransactionSection;
