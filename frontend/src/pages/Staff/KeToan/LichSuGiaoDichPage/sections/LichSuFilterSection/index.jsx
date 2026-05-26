import PropTypes from 'prop-types';
import {
  HiOutlineMagnifyingGlass,
  HiOutlineXMark,
} from 'react-icons/hi2';
import styles from './LichSuFilterSection.module.scss';

const QUICK_CHIPS = [
  { id: 'today', label: 'Hôm nay' },
  { id: 'week', label: 'Tuần này' },
  { id: 'month', label: 'Tháng này' },
  { id: '', label: 'Tất cả' },
];

const LOAI_OPTIONS = [
  { value: '', label: 'Tất cả loại' },
  { value: 'Thu', label: '↑ Thu' },
  { value: 'Chi', label: '↓ Chi' },
];

const TRANG_THAI_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'Thanh cong', label: 'Thành công' },
  { value: 'Cho xu ly', label: 'Chờ xử lý' },
  { value: 'That bai', label: 'Thất bại' },
  { value: 'Hoan tien', label: 'Hoàn tiền' },
];

const LichSuFilterSection = ({
  searchKeyword,
  onSearchChange,
  filterLoai,
  onLoaiChange,
  filterTrangThai,
  onTrangThaiChange,
  filterQuy,
  onQuyChange,
  filterDateRange,
  onDateRangeChange,
  quickDateFilter,
  onQuickDateChange,
  quyOptions,
  hasFilter,
  onClearFilter,
}) => (
  <div className={styles.card}>
    {/* Tầng 1 — Quick chips */}
    <div className={styles.quickFilters}>
      <span className={styles.quickLabel}>Xem nhanh:</span>
      {QUICK_CHIPS.map((chip) => (
        <button
          key={chip.id || 'all'}
          type="button"
          className={`${styles.chip} ${
            quickDateFilter === chip.id ? styles.chipActive : ''
          }`}
          onClick={() => onQuickDateChange(chip.id)}
        >
          {chip.label}
        </button>
      ))}
    </div>

    {/* Tầng 2 — Filter chi tiết */}
    <div className={styles.filterRow}>
      <div className={styles.searchBox}>
        <HiOutlineMagnifyingGlass className={styles.searchIcon} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Tìm mã GD, tên sinh viên, nhà tài trợ..."
          value={searchKeyword}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <select
        className={styles.select}
        value={filterLoai}
        onChange={(e) => onLoaiChange(e.target.value)}
        aria-label="Loại giao dịch"
      >
        {LOAI_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <select
        className={styles.select}
        value={filterTrangThai}
        onChange={(e) => onTrangThaiChange(e.target.value)}
        aria-label="Trạng thái"
      >
        {TRANG_THAI_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <select
        className={styles.select}
        value={filterQuy}
        onChange={(e) => onQuyChange(e.target.value)}
        aria-label="Quỹ"
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

LichSuFilterSection.propTypes = {
  searchKeyword: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  filterLoai: PropTypes.string.isRequired,
  onLoaiChange: PropTypes.func.isRequired,
  filterTrangThai: PropTypes.string.isRequired,
  onTrangThaiChange: PropTypes.func.isRequired,
  filterQuy: PropTypes.string.isRequired,
  onQuyChange: PropTypes.func.isRequired,
  filterDateRange: PropTypes.shape({
    from: PropTypes.string,
    to: PropTypes.string,
  }).isRequired,
  onDateRangeChange: PropTypes.func.isRequired,
  quickDateFilter: PropTypes.string.isRequired,
  onQuickDateChange: PropTypes.func.isRequired,
  quyOptions: PropTypes.array,
  hasFilter: PropTypes.bool,
  onClearFilter: PropTypes.func.isRequired,
};

export default LichSuFilterSection;
