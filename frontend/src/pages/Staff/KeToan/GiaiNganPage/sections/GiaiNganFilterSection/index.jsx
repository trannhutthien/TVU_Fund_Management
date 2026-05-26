import PropTypes from 'prop-types';
import {
  HiOutlineMagnifyingGlass,
  HiOutlineXMark,
} from 'react-icons/hi2';
import styles from './GiaiNganFilterSection.module.scss';

const GiaiNganFilterSection = ({
  searchKeyword,
  onSearchChange,
  filterQuy,
  onQuyChange,
  filterDateRange,
  onDateRangeChange,
  quyOptions,
  hasFilter,
  onClearFilter,
}) => (
  <div className={styles.card}>
    <div className={styles.left}>
      <div className={styles.searchBox}>
        <HiOutlineMagnifyingGlass className={styles.searchIcon} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Tìm tên sinh viên, mã số, tiêu đề..."
          value={searchKeyword}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>

    <div className={styles.right}>
      <select
        className={styles.select}
        value={filterQuy}
        onChange={(e) => onQuyChange(e.target.value)}
      >
        <option value="">Tất cả quỹ</option>
        {quyOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <input
        type="date"
        className={styles.dateInput}
        value={filterDateRange.from}
        onChange={(e) =>
          onDateRangeChange({ ...filterDateRange, from: e.target.value })
        }
        aria-label="Từ ngày"
      />
      <span className={styles.dateSeparator}>→</span>
      <input
        type="date"
        className={styles.dateInput}
        value={filterDateRange.to}
        onChange={(e) =>
          onDateRangeChange({ ...filterDateRange, to: e.target.value })
        }
        aria-label="Đến ngày"
      />

      {hasFilter && (
        <button
          type="button"
          className={styles.clearBtn}
          onClick={onClearFilter}
        >
          <HiOutlineXMark size={14} />
          Xóa lọc
        </button>
      )}
    </div>
  </div>
);

GiaiNganFilterSection.propTypes = {
  searchKeyword: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  filterQuy: PropTypes.string.isRequired,
  onQuyChange: PropTypes.func.isRequired,
  filterDateRange: PropTypes.shape({
    from: PropTypes.string,
    to: PropTypes.string,
  }).isRequired,
  onDateRangeChange: PropTypes.func.isRequired,
  quyOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      label: PropTypes.string,
    }),
  ),
  hasFilter: PropTypes.bool,
  onClearFilter: PropTypes.func.isRequired,
};

export default GiaiNganFilterSection;
