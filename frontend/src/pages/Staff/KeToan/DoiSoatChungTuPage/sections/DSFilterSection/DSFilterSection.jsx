import {
  HiClock,
  HiCheckCircle,
  HiExclamationTriangle,
  HiXMark,
} from 'react-icons/hi2';
import styles from './DSFilterSection.module.scss';
import Button from '@components/common/Button/Button';

const DSFilterSection = ({
  activeTab,
  setActiveTab,
  filterLoai,
  setFilterLoai,
  filterDateRange,
  setFilterDateRange,
  filterQuy,
  setFilterQuy,
  searchKeyword,
  setSearchKeyword,
  quyOptions,
  statsData,
}) => {
  // ─── CHECK HAS FILTER ──────────────────────────────────────────────────────
  const hasFilter =
    filterLoai ||
    filterQuy ||
    filterDateRange.from ||
    filterDateRange.to ||
    searchKeyword;

  // ─── HANDLE CLEAR FILTER ───────────────────────────────────────────────────
  const handleClearFilter = () => {
    setFilterLoai('');
    setFilterQuy('');
    setFilterDateRange({ from: '', to: '' });
    setSearchKeyword('');
  };

  return (
    <div className={styles.card}>
      {/* Tab Row */}
      <div className={styles.tabRow}>
        <Button
          variant={activeTab === 'can_doi_soat' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('can_doi_soat')}
          leftIcon={<HiClock size={15} />}
          className={
            activeTab === 'can_doi_soat' ? styles.tabActive : styles.tab
          }
        >
          Chưa đối soát
          <span
            className={
              activeTab === 'can_doi_soat'
                ? styles.tabBadgeActive
                : styles.tabBadge
            }
          >
            {statsData.chuaDoiSoat}
          </span>
        </Button>

        <Button
          variant={activeTab === 'da_doi_soat' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('da_doi_soat')}
          leftIcon={<HiCheckCircle size={15} />}
          className={
            activeTab === 'da_doi_soat' ? styles.tabActive : styles.tab
          }
        >
          Đã đối soát
          <span
            className={
              activeTab === 'da_doi_soat'
                ? styles.tabBadgeActive
                : styles.tabBadge
            }
          >
            {statsData.daDoiSoat}
          </span>
        </Button>

        <Button
          variant={activeTab === 'bat_thuong' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('bat_thuong')}
          leftIcon={<HiExclamationTriangle size={15} />}
          className={
            activeTab === 'bat_thuong' ? styles.tabActive : styles.tab
          }
        >
          Bất thường
          <span
            className={
              activeTab === 'bat_thuong'
                ? styles.tabBadgeActive
                : styles.tabBadgeRed
            }
          >
            {statsData.batThuong}
          </span>
        </Button>
      </div>

      {/* Filter Row */}
      <div className={styles.filterRow}>
        {/* Search Input */}
        <input
          type="text"
          placeholder="Tìm kiếm theo mã GD, người liên quan..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          className={styles.searchInput}
        />

        {/* Loại Dropdown */}
        <select
          value={filterLoai}
          onChange={(e) => setFilterLoai(e.target.value)}
          className={styles.select}
        >
          <option value="">Tất cả loại</option>
          <option value="Thu">Thu</option>
          <option value="Chi">Chi</option>
        </select>

        {/* Quỹ Dropdown */}
        <select
          value={filterQuy}
          onChange={(e) => setFilterQuy(e.target.value)}
          className={styles.select}
        >
          <option value="">Tất cả quỹ</option>
          {quyOptions.map((quy) => (
            <option key={quy.quy_id} value={quy.quy_id}>
              {quy.ten_quy}
            </option>
          ))}
        </select>

        {/* Date From */}
        <input
          type="date"
          value={filterDateRange.from}
          onChange={(e) =>
            setFilterDateRange({ ...filterDateRange, from: e.target.value })
          }
          className={styles.dateInput}
          placeholder="Từ ngày"
        />

        {/* Arrow */}
        <span className={styles.dateArrow}>→</span>

        {/* Date To */}
        <input
          type="date"
          value={filterDateRange.to}
          onChange={(e) =>
            setFilterDateRange({ ...filterDateRange, to: e.target.value })
          }
          className={styles.dateInput}
          placeholder="Đến ngày"
        />

        {/* Clear Button */}
        {hasFilter && (
          <button className={styles.clearButton} onClick={handleClearFilter}>
            <HiXMark size={16} />
            Xóa bộ lọc
          </button>
        )}
      </div>
    </div>
  );
};

export default DSFilterSection;
