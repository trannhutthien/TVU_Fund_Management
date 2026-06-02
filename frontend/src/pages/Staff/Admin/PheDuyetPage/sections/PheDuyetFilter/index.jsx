import PropTypes from 'prop-types';
import { HiOutlineMagnifyingGlass, HiOutlineXMark } from 'react-icons/hi2';
import Input from '@components/common/Input/Input';
import Button from '@components/common/Button/Button';
import styles from './PheDuyetFilter.module.scss';

const PheDuyetFilter = ({ filters, approverOptions, onChange }) => {
  const handleChange = (field, value) => {
    onChange({ ...filters, [field]: value });
  };

  const handleClear = () => {
    onChange({
      keyword: '',
      loai_nguon: '',
      cap_do_duyet: '',
      ket_qua: '',
      nguoi_duyet_id: '',
      tu_ngay: '',
      den_ngay: '',
    });
  };

  const hasFilters =
    filters.keyword ||
    filters.loai_nguon ||
    filters.cap_do_duyet ||
    filters.ket_qua ||
    filters.nguoi_duyet_id ||
    filters.tu_ngay ||
    filters.den_ngay;

  return (
    <div className={styles.filter}>
      {/* Keyword Search */}
      <div className={styles.searchBox}>
        <Input
          icon={HiOutlineMagnifyingGlass}
          placeholder="Tìm tên người duyệt, tên đơn, tên nhà tài trợ..."
          value={filters.keyword}
          onChange={(e) => handleChange('keyword', e.target.value)}
        />
      </div>

      {/* Loại nguồn */}
      <select
        className={styles.select}
        value={filters.loai_nguon}
        onChange={(e) => handleChange('loai_nguon', e.target.value)}
      >
        <option value="">-- Tất cả loại --</option>
        <option value="yeucau">📋 Đơn yêu cầu hỗ trợ</option>
        <option value="taitro">💰 Khoản tài trợ</option>
      </select>

      {/* Cấp độ duyệt */}
      <select
        className={styles.select}
        value={filters.cap_do_duyet}
        onChange={(e) => handleChange('cap_do_duyet', e.target.value)}
      >
        <option value="">-- Tất cả cấp --</option>
        <option value="1">Cấp 1 — Cán bộ / Giáo vụ</option>
        <option value="2">Cấp 2 — Trưởng phòng / Admin</option>
        <option value="3">Cấp 3 — Kế toán / Hiệu trưởng</option>
      </select>

      {/* Kết quả */}
      <select
        className={styles.select}
        value={filters.ket_qua}
        onChange={(e) => handleChange('ket_qua', e.target.value)}
      >
        <option value="">-- Tất cả kết quả --</option>
        <option value="Da duyet">✅ Đã duyệt</option>
        <option value="Tu choi">❌ Từ chối</option>
        <option value="Yeu cau bo sung">⚠️ Yêu cầu bổ sung</option>
        <option value="Cho duyet">⏳ Chờ duyệt</option>
      </select>

      {/* Người duyệt */}
      <select
        className={styles.select}
        value={filters.nguoi_duyet_id}
        onChange={(e) => handleChange('nguoi_duyet_id', e.target.value)}
      >
        <option value="">-- Tất cả nhân viên --</option>
        {approverOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Từ ngày */}
      <input
        type="date"
        className={styles.dateInput}
        value={filters.tu_ngay}
        onChange={(e) => handleChange('tu_ngay', e.target.value)}
        placeholder="Từ ngày"
      />

      {/* Đến ngày */}
      <input
        type="date"
        className={styles.dateInput}
        value={filters.den_ngay}
        onChange={(e) => handleChange('den_ngay', e.target.value)}
        placeholder="Đến ngày"
      />

      {/* Clear button */}
      {hasFilters && (
        <Button
          variant="ghost"
          leftIcon={<HiOutlineXMark />}
          onClick={handleClear}
          className={styles.clearBtn}
        >
          Xóa bộ lọc
        </Button>
      )}
    </div>
  );
};

PheDuyetFilter.propTypes = {
  filters: PropTypes.shape({
    keyword: PropTypes.string,
    loai_nguon: PropTypes.string,
    cap_do_duyet: PropTypes.string,
    ket_qua: PropTypes.string,
    nguoi_duyet_id: PropTypes.string,
    tu_ngay: PropTypes.string,
    den_ngay: PropTypes.string,
  }).isRequired,
  approverOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.number,
      label: PropTypes.string,
    })
  ).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default PheDuyetFilter;
