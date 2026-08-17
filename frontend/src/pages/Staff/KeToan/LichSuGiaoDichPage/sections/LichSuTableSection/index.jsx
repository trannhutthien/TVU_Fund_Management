import PropTypes from 'prop-types';
import {
  HiArrowUp,
  HiArrowDown,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineInboxArrowDown,
} from 'react-icons/hi2';
import StatusBadge from '@components/common/StatusBadge/StatusBadge';
import { formatCurrency } from '@utils/formatters';
import styles from './LichSuTableSection.module.scss';

const STATUS_TO_BADGE = {
  'Thanh cong': 'approved',
  'That bai': 'rejected',
  'Hoan tien': 'warning',
  'Cho xu ly': 'pending',
  'Da giai ngan': 'completed',
  'Da giai ngan dot 1': 'completed',
  'Da nghiem thu': 'completed',
  'Hoan thanh': 'completed',
  'Tu choi': 'rejected',
  'Tu choi cap 3': 'rejected',
  'Cho giai ngan': 'pending',
  'Cho giai ngan dot 1': 'pending',
  'Cho giai ngan dot 2': 'pending',
  'Cho duyet': 'pending',
  'Cho duyet cap 1': 'pending',
  'Dang xu ly': 'processing',
  'Dang thuc hien': 'processing',
  'Qua han': 'rejected',
  'Nghiem thu khong dat': 'rejected',
};

const STATUS_LABEL = {
  'Thanh cong': 'Thành công',
  'That bai': 'Thất bại',
  'Hoan tien': 'Hoàn tiền',
  'Cho xu ly': 'Chờ xử lý',
  'Dang xu ly': 'Đang xử lý',
  'Dang thuc hien': 'Đang thực hiện',
  'Da giai ngan': 'Đã giải ngân',
  'Da giai ngan dot 1': 'Đã giải ngân đợt 1',
  'Da nghiem thu': 'Đã nghiệm thu',
  'Hoan thanh': 'Hoàn thành',
  'Tu choi': 'Từ chối',
  'Tu choi cap 3': 'Từ chối cấp 3',
  'Cho giai ngan': 'Chờ giải ngân',
  'Cho giai ngan dot 1': 'Chờ giải ngân đợt 1',
  'Cho giai ngan dot 2': 'Chờ giải ngân đợt 2',
  'Cho duyet': 'Chờ duyệt',
  'Cho duyet cap 1': 'Chờ duyệt cấp 1',
  'Qua han': 'Quá hạn',
  'Nghiem thu khong dat': 'Nghiệm thu không đạt',
};

const formatDate = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('vi-VN');
};

const getDoiTuong = (tx) => {
  if (tx.loai === 'Thu') {
    const ntt = tx.khoanTaiTro?.nhaTaiTro;
    return {
      name: ntt?.ten || 'Nhà tài trợ',
      sub: ntt?.loai || 'Tài trợ',
    };
  }
  // Chi
  const sv = tx.sinhVien;
  return {
    name: sv?.hoTen || 'Sinh viên',
    sub: sv?.maSoDinhDanh || '—',
  };
};

const LichSuTableSection = ({
  data,
  isLoading,
  totalCount,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onViewDetail,
}) => {
  const startIdx = (currentPage - 1) * pageSize + 1;
  const endIdx = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.countText}>
          Tìm thấy <strong>{totalCount}</strong> giao dịch
        </span>
      </div>

      {isLoading ? (
        <div className={styles.skeletonWrap}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={styles.skeletonRow} />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className={styles.empty}>
          <HiOutlineInboxArrowDown size={52} className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>Không tìm thấy giao dịch nào</p>
          <p className={styles.emptySub}>
            Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
          </p>
        </div>
      ) : (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.colCode}>MÃ GD</th>
                  <th className={styles.colType}>LOẠI</th>
                  <th className={styles.colTarget}>ĐỐI TƯỢNG</th>
                  <th className={styles.colFund}>QUỸ</th>
                  <th className={styles.colAmount}>SỐ TIỀN</th>
                  <th className={styles.colStatus}>TRẠNG THÁI</th>
                  <th className={styles.colCreator}>NGƯỜI DUYỆT</th>
                  <th className={styles.colDate}>NGÀY DUYỆT</th>
                </tr>
              </thead>
              <tbody>
                {data.map((tx) => {
                  const isThu = tx.loai === 'Thu';
                  const isBatThuong =
                    tx.trangThai === 'That bai' ||
                    tx.trangThai === 'Hoan tien';
                  const doiTuong = getDoiTuong(tx);

                  return (
                    <tr
                      key={tx.transactionId}
                      className={isBatThuong ? styles.rowWarning : ''}
                      onClick={() => onViewDetail(tx)}
                    >
                      <td className={styles.cellCode}>
                        #GD{tx.transactionId}
                      </td>
                      <td>
                        <span
                          className={`${styles.typeBadge} ${isThu
                              ? styles.typeBadgeThu
                              : styles.typeBadgeChi
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
                      <td>
                        <div className={styles.targetCell}>
                          <div className={styles.targetName}>
                            {doiTuong.name}
                          </div>
                          <div className={styles.targetSub}>
                            {doiTuong.sub}
                          </div>
                        </div>
                      </td>
                      <td className={styles.cellFund} title={tx.quy?.tenQuy}>
                        {tx.quy?.tenQuy || '—'}
                      </td>
                      <td
                        className={`${styles.cellAmount} ${isThu ? styles.amountThu : styles.amountChi
                          }`}
                      >
                        {isThu ? '+' : '-'}
                        {formatCurrency(tx.soTien)}
                      </td>
                      <td>
<StatusBadge
  status={STATUS_TO_BADGE[tx.trangThai] || 'pending'}
  label={STATUS_LABEL[tx.trangThai]}
  size="sm"
/>
                      </td>
                      <td className={styles.cellCreator}>
                        {tx.nguoiTao?.hoTen || '—'}
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

          <div className={styles.pagination}>
            <div className={styles.paginationInfo}>
              Hiển thị <strong>{startIdx}</strong>–
              <strong>{endIdx}</strong> trong{' '}
              <strong>{totalCount}</strong> giao dịch
            </div>
            <div className={styles.paginationControls}>
              <button
                type="button"
                className={styles.pageBtn}
                disabled={currentPage <= 1}
                onClick={() => onPageChange(currentPage - 1)}
              >
                <HiOutlineChevronLeft />
                Trước
              </button>
              <span className={styles.pageNum}>
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                className={styles.pageBtn}
                disabled={currentPage >= totalPages}
                onClick={() => onPageChange(currentPage + 1)}
              >
                Tiếp
                <HiOutlineChevronRight />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

LichSuTableSection.propTypes = {
  data: PropTypes.array.isRequired,
  isLoading: PropTypes.bool,
  totalCount: PropTypes.number.isRequired,
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onViewDetail: PropTypes.func.isRequired,
};

export default LichSuTableSection;
