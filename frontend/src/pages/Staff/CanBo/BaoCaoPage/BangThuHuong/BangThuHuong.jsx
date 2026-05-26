import { Link } from 'react-router-dom';
import { HiOutlineArrowRight } from 'react-icons/hi2';
import StatusBadge from '@components/common/StatusBadge/StatusBadge';
import { formatCurrency, formatDateShort } from '../utils';
import styles from './BangThuHuong.module.scss';

const STATUS_TO_BADGE = {
  'Da giai ngan': 'completed',
  'Da duyet': 'approved',
  'Dang xu ly': 'processing',
  'Cho duyet': 'pending',
  'Tu choi': 'rejected',
};

const BangThuHuong = ({ data, loading }) => (
  <div className={styles.card}>
    <div className={styles.head}>
      <div>
        <h2 className={styles.title}>Danh sách thụ hưởng gần nhất</h2>
        <p className={styles.subtitle}>
          {data.length > 0
            ? `${data.length} đơn được giải ngân gần nhất`
            : 'Chưa có đơn giải ngân trong kỳ này'}
        </p>
      </div>
      <Link to="/can-bo/xet-duyet" className={styles.viewAll}>
        Xem tất cả <HiOutlineArrowRight />
      </Link>
    </div>

    {loading ? (
      <div className={styles.skeleton} />
    ) : data.length === 0 ? (
      <div className={styles.empty}>
        Chưa có dữ liệu giải ngân trong kỳ này
      </div>
    ) : (
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Họ tên</th>
              <th>MSSV</th>
              <th>Quỹ</th>
              <th className={styles.alignRight}>Số tiền</th>
              <th>Ngày giải ngân</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id}>
                <td className={styles.cellName}>{row.hoTen}</td>
                <td className={styles.cellMuted}>{row.mssv}</td>
                <td className={styles.cellFund}>{row.tenQuy}</td>
                <td className={`${styles.alignRight} ${styles.cellAmount}`}>
                  {formatCurrency(row.soTien)}
                </td>
                <td className={styles.cellMuted}>
                  {formatDateShort(row.ngayGiaiNgan)}
                </td>
                <td>
                  <StatusBadge
                    status={STATUS_TO_BADGE[row.trangThai] || 'completed'}
                    size="sm"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

export default BangThuHuong;
