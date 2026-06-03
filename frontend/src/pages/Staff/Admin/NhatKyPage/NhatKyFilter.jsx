import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { HiOutlineMagnifyingGlass, HiOutlineXMark } from 'react-icons/hi2';
import Input from '@components/common/Input';
import Button from '@components/common/Button';
import styles from './NhatKyFilter.module.scss';

const HANH_DONG_OPTIONS = [
  { value: '', label: '-- Tất cả hành động --' },
  { value: 'DANG_NHAP', label: '🔑 Đăng nhập' },
  { value: 'DANG_XUAT', label: '🚪 Đăng xuất' },
  { value: 'THEM_MOI_YEU_CAU', label: '📝 Tạo đơn hỗ trợ' },
  { value: 'DUYET_YEU_CAU_HO_TRO_CAP_1', label: '✅ Duyệt đơn Cấp 1' },
  { value: 'DUYET_YEU_CAU_HO_TRO_CAP_2', label: '✅ Duyệt đơn Cấp 2' },
  { value: 'DUYET_YEU_CAU_HO_TRO_CAP_3', label: '✅ Duyệt đơn Cấp 3' },
  { value: 'TU_CHOI_YEU_CAU_HO_TRO', label: '❌ Từ chối đơn hỗ trợ' },
  { value: 'CAP_NHAT_YEU_CAU_HO_TRO', label: '💰 Phê duyệt & Giải ngân' },
  { value: 'THEM_MOI_KHOAN_TAI_TRO', label: '🤝 Ghi nhận tài trợ' },
  { value: 'DUYET_KHOAN_TAI_TRO', label: '✅ Duyệt tài trợ' },
  { value: 'XAC_NHAN_TAI_TRO', label: '✅ Xác nhận tài trợ' },
  { value: 'THEM_MOI_NGUOI_DUNG', label: '👤 Tạo người dùng' },
  { value: 'CAP_NHAT_THONG_TIN_NGUOI_DUNG', label: '✏️ Sửa người dùng' },
  { value: 'CAP_NHAT_TRANG_THAI_NGUOI_DUNG', label: '🔒 Khóa/Mở tài khoản' },
  { value: 'CAP_NHAT_QUY', label: '🏦 Cập nhật quỹ' },
  { value: 'THEM_MOI_QUY', label: '🏦 Tạo quỹ mới' },
];

const LOAI_DT_OPTIONS = [
  { value: '', label: '-- Tất cả --' },
  { value: 'yeucauhotro', label: 'Đơn hỗ trợ' },
  { value: 'khoantaitro', label: 'Khoản tài trợ' },
  { value: 'nguoidung', label: 'Người dùng' },
  { value: 'quy', label: 'Quỹ' },
  { value: 'giaodich', label: 'Giao dịch' },
  { value: 'auth', label: 'Xác thực' },
];

const NhatKyFilter = ({ filters, staffOptions, onChange }) => {
  const [keywordInput, setKeywordInput] = useState(filters.keyword);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Debounce keyword input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (keywordInput !== filters.keyword) {
        onChange({ ...filters, keyword: keywordInput });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [keywordInput, onChange, filters]);

  // Sync keyword input if filters are reset
  useEffect(() => {
    setKeywordInput(filters.keyword);
  }, [filters.keyword]);

  const handleSelectChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  const handleClearFilters = () => {
    setKeywordInput('');
    onChange({
      keyword: '',
      hanh_dong: '',
      loai_doi_tuong: '',
      nguoi_dung_id: '',
      tu_ngay: '',
      den_ngay: '',
    });
  };

  const isFilterActive =
    filters.keyword !== '' ||
    filters.hanh_dong !== '' ||
    filters.loai_doi_tuong !== '' ||
    filters.nguoi_dung_id !== '' ||
    filters.tu_ngay !== '' ||
    filters.den_ngay !== '';

  return (
    <div className={styles.filterCard}>
      {/* Row 1 */}
      <div className={styles.row1}>
        <div className={styles.keywordField}>
          <Input
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            placeholder="Tìm theo mô tả, hành động, địa chỉ IP..."
            prefixIcon={<HiOutlineMagnifyingGlass size={16} />}
            className={styles.customInput}
          />
        </div>

        <div className={styles.selectField}>
          <select
            value={filters.hanh_dong}
            onChange={(e) => handleSelectChange('hanh_dong', e.target.value)}
            className={styles.customSelect}
          >
            {HANH_DONG_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.selectField}>
          <select
            value={filters.loai_doi_tuong}
            onChange={(e) => handleSelectChange('loai_doi_tuong', e.target.value)}
            className={styles.customSelect}
          >
            {LOAI_DT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.selectField}>
          <select
            value={filters.nguoi_dung_id}
            onChange={(e) => handleSelectChange('nguoi_dung_id', e.target.value)}
            className={styles.customSelect}
          >
            <option value="">-- Tất cả nhân viên --</option>
            {staffOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 2 (Advanced Filter Row) */}
      {showAdvanced && (
        <div className={styles.row2}>
          <div className={styles.dateGroup}>
            <div className={styles.dateInputWrapper}>
              <span className={styles.dateLabel}>Từ ngày:</span>
              <input
                type="date"
                value={filters.tu_ngay}
                onChange={(e) => handleSelectChange('tu_ngay', e.target.value)}
                className={styles.customDate}
              />
            </div>
            <div className={styles.dateInputWrapper}>
              <span className={styles.dateLabel}>Đến ngày:</span>
              <input
                type="date"
                value={filters.den_ngay}
                onChange={(e) => handleSelectChange('den_ngay', e.target.value)}
                className={styles.customDate}
              />
            </div>
          </div>
        </div>
      )}

      {/* Control Actions Row */}
      <div className={styles.controlRow}>
        <Button
          variant="ghost"
          size="small"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={styles.toggleBtn}
        >
          {showAdvanced ? 'Ẩn bớt ▲' : 'Bộ lọc nâng cao ▼'}
        </Button>

        {isFilterActive && (
          <Button
            variant="ghost"
            size="small"
            leftIcon={<HiOutlineXMark size={14} />}
            onClick={handleClearFilters}
            className={styles.clearBtn}
          >
            Xóa bộ lọc
          </Button>
        )}
      </div>
    </div>
  );
};

NhatKyFilter.propTypes = {
  filters: PropTypes.shape({
    keyword: PropTypes.string,
    hanh_dong: PropTypes.string,
    loai_doi_tuong: PropTypes.string,
    nguoi_dung_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    tu_ngay: PropTypes.string,
    den_ngay: PropTypes.string,
  }).isRequired,
  staffOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default NhatKyFilter;
