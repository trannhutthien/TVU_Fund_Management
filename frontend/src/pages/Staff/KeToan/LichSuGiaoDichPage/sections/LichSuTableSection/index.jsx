import PropTypes from 'prop-types';
import {
  HiArrowUp,
  HiArrowDown,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineInboxArrowDown,
} from 'react-icons/hi2';
import StatusBadge from '@components/common/StatusBadge/StatusBadge';
import styles from './LichSuTableSection.module.scss';

const STATUS_TO_BADGE = {
  // Khoản tài trợ (Thu)
  'Cho duyet': 'pending',
  'Da duyet': 'approved',
  'Da nhan': 'completed',
  'Tu choi': 'rejected',

  // Giao dịch (Chi)
  'Dang xu ly': 'processing',
  'Thanh cong': 'completed',
  'That bai': 'rejected',

  // Fallback cũ
  'Cho xu ly': 'pending',
  'Hoan tien': 'cancelled',
};

const formatCurrency = (n) => Number(n || 0).toLocaleString('vi-VN') + ' đ';
const formatDate = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('vi-VN');
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
                  <th className={styles.colApprover}>NGƯỜI DUYỆT</th>
                  <th className={styles.colCreator}>NGƯỜI TẠO</th>
                  <th className={styles.colDate}>NGÀY TẠO</th>
                </tr>
              </thead>
              <tbody>
                {data.map((tx) => {
                  const isThu = tx.loai === 'Thu';
                  const isBatThuong =
                    tx.trangThai === 'That bai' ||
                    tx.trangThai === 'Hoan tien';
                  const doiTuongVaiTro =
                    tx.doiTuong?.tenVaiTro ||
                    tx.nguoiTao?.tenVaiTro ||
                    tx.nguoiDuyet?.tenVaiTro ||
                    '—';

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
                          className={`${styles.typeBadge} ${
                            isThu
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
                            {doiTuongVaiTro}
                          </div>
                        </div>
                      </td>
                      <td className={styles.cellFund} title={tx.quy?.tenQuy}>
                        {tx.quy?.tenQuy || '—'}
                      </td>
                      <td
                        className={`${styles.cellAmount} ${
                          isThu ? styles.amountThu : styles.amountChi
                        }`}
                      >
                        {isThu ? '+' : '-'}
                        {formatCurrency(tx.soTien)}
                      </td>
                      <td>
                        <StatusBadge
                          status={STATUS_TO_BADGE[tx.trangThai] || 'pending'}
                          size="sm"
                        />
                      </td>
                      <td className={styles.cellCreator}>
                        {tx.nguoiDuyet?.hoTen || '—'}
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
