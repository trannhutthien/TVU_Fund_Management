import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { HiOutlineFunnel, HiOutlineXMark } from 'react-icons/hi2';
import Input from '@components/common/Input/Input';
import api from '@services/api';
import styles from './ProposalFilter.module.scss';

const TRANG_THAI_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'Cho duyet', label: 'Chờ duyệt' },
  { value: 'Can bo da duyet', label: 'Chờ xác nhận tiền' },
  { value: 'Da nhan tien', label: 'Chờ tạo hoạt động' },
  { value: 'Da tao hoat dong', label: 'Đã tạo hoạt động' },
  { value: 'Da duyet', label: 'Đã duyệt (cũ)' },
  { value: 'Tu choi', label: 'Từ chối' },
];

const ProposalFilter = ({ filters, activeTab, onChange }) => {
  const [quyList, setQuyList] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchQuyThanhPhan();
  }, []);

  const fetchQuyThanhPhan = async () => {
    try {
      // Lấy danh sách quỹ cấp 2 (Quỹ Thành Phần)
      const res = await api.get('/api/funds', {
        params: { cap_do: 2, trang_thai: 'Dang hoat dong' },
      });
      if (res.data?.success) {
        setQuyList(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching funds:', err);
    }
  };

  const handleChange = (field, value) => {
    onChange({ ...filters, [field]: value });
  };

  const handleReset = () => {
    onChange({
      keyword: '',
      quy_thanh_phan_id: '',
      trang_thai: '',
      tu_ngay: '',
      den_ngay: '',
    });
  };

  const hasActiveFilters =
    filters.keyword ||
    filters.quy_thanh_phan_id ||
    (activeTab === 'tat_ca' && filters.trang_thai) ||
    filters.tu_ngay ||
    filters.den_ngay;

  return (
    <div className={styles.filterContainer}>
      {/* Header */}
      <div className={styles.filterHeader}>
        <button
          type="button"
          className={styles.toggleBtn}
          onClick={() => setShowFilters(!showFilters)}
        >
          <HiOutlineFunnel className={styles.toggleIcon} />
          <span>Bộ lọc</span>
          {hasActiveFilters && (
            <span className={styles.filterBadge}>●</span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            className={styles.resetBtn}
            onClick={handleReset}
          >
            <HiOutlineXMark className={styles.resetIcon} />
            <span>Xóa bộ lọc</span>
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className={styles.filterPanel}>
          <div className={styles.filterGrid}>
            {/* Keyword */}
            <div className={styles.filterField}>
              <Input
                label="Tìm kiếm"
                placeholder="Tên chương trình, mô tả..."
                value={filters.keyword}
                onChange={(e) => handleChange('keyword', e.target.value)}
              />
            </div>

            {/* Quỹ thành phần */}
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>Quỹ thành phần</label>
              <select
                className={styles.filterSelect}
                value={filters.quy_thanh_phan_id}
                onChange={(e) =>
                  handleChange('quy_thanh_phan_id', e.target.value)
                }
              >
                <option value="">Tất cả quỹ</option>
                {quyList.map((quy) => (
                  <option key={quy.quy_id} value={quy.quy_id}>
                    {quy.tenquy}
                  </option>
                ))}
              </select>
            </div>

            {/* Trạng thái (chỉ hiện ở tab "Tất cả") */}
            {activeTab === 'tat_ca' && (
              <div className={styles.filterField}>
                <label className={styles.filterLabel}>Trạng thái</label>
                <select
                  className={styles.filterSelect}
                  value={filters.trang_thai}
                  onChange={(e) => handleChange('trang_thai', e.target.value)}
                >
                  {TRANG_THAI_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Từ ngày */}
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>Từ ngày</label>
              <input
                type="date"
                className={styles.filterSelect}
                value={filters.tu_ngay}
                onChange={(e) => handleChange('tu_ngay', e.target.value)}
              />
            </div>

            {/* Đến ngày */}
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>Đến ngày</label>
              <input
                type="date"
                className={styles.filterSelect}
                value={filters.den_ngay}
                onChange={(e) => handleChange('den_ngay', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

ProposalFilter.propTypes = {
  filters: PropTypes.shape({
    keyword: PropTypes.string,
    quy_thanh_phan_id: PropTypes.string,
    trang_thai: PropTypes.string,
    tu_ngay: PropTypes.string,
    den_ngay: PropTypes.string,
  }).isRequired,
  activeTab: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default ProposalFilter;
