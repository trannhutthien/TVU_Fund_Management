import PropTypes from 'prop-types';
import {
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineEye,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineCheckBadge,
  HiOutlineInboxArrowDown,
} from 'react-icons/hi2';
import { formatCurrency } from '@utils/formatters';
import Button from '@components/common/Button/Button';
import StatusBadge from '@components/common/StatusBadge/StatusBadge';
import { getInitial } from '@utils/formatters';
import styles from './GiaiNganTableSection.module.scss';

const STATUS_TO_BADGE = {
  'Da giai ngan': 'completed',
  'Tu choi': 'rejected',
  'Cho giai ngan': 'pending',
  'Dang xu ly': 'processing',
};

const formatDate = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('vi-VN');
};

const GiaiNganTableSection = ({
  data,
  isLoading,
  tab,
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  onViewDetail,
}) => {
  const startIdx = (currentPage - 1) * pageSize + 1;
  const endIdx = Math.min(currentPage * pageSize, totalCount);

  if (isLoading) {
    return (
      <div className={styles.card}>
        <div className={styles.skeletonHeader} />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={styles.skeletonRow} />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={styles.card}>
        <div className={styles.empty}>
          {tab === 'cho_giai_ngan' ? (
            <>
              <HiOutlineCheckBadge size={48} className={styles.emptyIconOk} />
              <p className={styles.emptyTitle}>
                Không có hồ sơ nào chờ giải ngân
              </p>
              <p className={styles.emptySub}>Tất cả đã được xử lý</p>
            </>
          ) : (
            <>
              <HiOutlineInboxArrowDown
                size={48}
                className={styles.emptyIconNeutral}
              />
              <p className={styles.emptyTitle}>Chưa có lịch sử giải ngân</p>
            </>
          )}
        </div>
      </div>
    );
  }

  const isWaitingTab = tab === 'cho_giai_ngan';

  return (
    <div className={styles.card}>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.colStt}>STT</th>
              <th className={styles.colStudent}>SINH VIÊN</th>
              <th className={styles.colFund}>QUỸ</th>
              <th className={styles.colAmount}>SỐ TIỀN YÊU CẦU</th>
              <th className={styles.colDate}>
                {isWaitingTab ? 'NGÀY NỘP ĐƠN' : 'NGÀY XỬ LÝ'}
              </th>
              {isWaitingTab ? (
                <th className={styles.colBalance}>SỐ DƯ QUỸ</th>
              ) : (
                <th className={styles.colStatus}>TRẠNG THÁI</th>
              )}
              <th className={styles.colAction}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => {
              const fundBalance =
                row.quy?.soDu ?? row.quy?.so_du ?? row.quySoDu ?? null;
              const isEnough =
                fundBalance !== null &&
                Number(fundBalance) >= Number(row.soTienYeuCau);

              return (
                <tr
                  key={row.requestId}
                  className={
                    isWaitingTab && fundBalance !== null && !isEnough
                      ? styles.rowWarning
                      : ''
                  }
                  onClick={() => onViewDetail(row)}
                >
                  <td className={styles.cellStt}>
                    {startIdx + idx}
                  </td>
                  <td>
                    <div className={styles.studentCell}>
                      <div className={styles.avatar}>
                        {row.nguoiNop?.avatar ? (
                          <img
                            src={row.nguoiNop.avatar}
                            alt={row.nguoiNop?.hoTen || ''}
                          />
                        ) : (
                          <span>{getInitial(row.nguoiNop?.hoTen)}</span>
                        )}
                      </div>
                      <div className={styles.studentInfo}>
                        <div className={styles.studentName}>
                          {row.nguoiNop?.hoTen || '—'}
                        </div>
                        <div className={styles.studentCode}>
                          {row.nguoiNop?.maSoDinhDanh || '—'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className={styles.cellFund} title={row.quy?.tenQuy}>
                    {row.quy?.tenQuy || '—'}
                  </td>
                  <td className={styles.cellAmount}>
                    {formatCurrency(row.soTienYeuCau)}
                  </td>
                  <td className={styles.cellDate}>
                    {formatDate(isWaitingTab ? row.ngayNop : row.ngayCapNhat)}
                  </td>
                  {isWaitingTab ? (
                    <td>
                      {fundBalance !== null ? (
                        <span
                          className={`${styles.balance} ${
                            isEnough ? styles.balanceOk : styles.balanceLow
                          }`}
                          title={
                            isEnough
                              ? 'Quỹ đủ số dư'
                              : 'Quỹ không đủ số dư'
                          }
                        >
                          {isEnough ? (
                            <HiOutlineCheckCircle size={14} />
                          ) : (
                            <HiOutlineExclamationTriangle size={14} />
                          )}
                          {formatCurrency(fundBalance)}
                        </span>
                      ) : (
                        <span className={styles.balanceUnknown}>—</span>
                      )}
                    </td>
                  ) : (
                    <td>
                      <StatusBadge
                        status={STATUS_TO_BADGE[row.trangThai] || 'pending'}
                        size="sm"
                      />
                    </td>
                  )}
                  <td onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<HiOutlineEye size={14} />}
                      onClick={() => onViewDetail(row)}
                      className={styles.detailBtn}
                    >
                      Xem chi tiết
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <div className={styles.paginationInfo}>
            Hiển thị <strong>{startIdx}</strong>–
            <strong>{endIdx}</strong> trong tổng{' '}
            <strong>{totalCount}</strong> đơn
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
      )}
    </div>
  );
};

GiaiNganTableSection.propTypes = {
  data: PropTypes.array.isRequired,
  isLoading: PropTypes.bool,
  tab: PropTypes.oneOf(['cho_giai_ngan', 'da_xu_ly']).isRequired,
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onViewDetail: PropTypes.func.isRequired,
};

export default GiaiNganTableSection;
