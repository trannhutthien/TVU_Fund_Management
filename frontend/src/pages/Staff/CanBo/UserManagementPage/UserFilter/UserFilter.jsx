import { HiOutlineMagnifyingGlass, HiOutlineXMark } from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import Input from '@components/common/Input/Input';
import { KHOA_OPTIONS } from '@constants/departments';
import styles from './UserFilter.module.scss';

const TRANG_THAI_OPTIONS = [
  { value: '', label: '-- Tất cả trạng thái --' },
  { value: 'HOAT_DONG', label: 'Hoạt động' },
  { value: 'KHOA', label: 'Bị khóa' },
];

const LOAI_NTT_OPTIONS = [
  { value: '', label: '-- Tất cả loại --' },
  { value: 'SINH_VIEN', label: 'Sinh viên' },
  { value: 'NHA_TAI_TRO', label: 'Nhà tài trợ' },
];

const SEARCH_PLACEHOLDER = {
  sinh_vien: 'Tìm tên, MSSV, email...',
  nha_tai_tro: 'Tìm tên tổ chức, email, SĐT...',
  nhan_vien: 'Tìm tên, email, mã định danh...',
  giam_sat_doc_lap: 'Tìm tên, email, mã định danh...',
  tat_ca: 'Tìm tên, email, MSSV...',
};

const UserFilter = ({ activeTab, filters, onChange }) => {
  const hasFilter =
    filters.keyword ||
    filters.trang_thai ||
    (activeTab === 'sinh_vien' && filters.khoa_phong) ||
    (activeTab !== 'sinh_vien' && activeTab !== 'nhan_vien' && filters.loai_ntt);

  const clearFilters = () => {
    onChange({
      keyword: '',
      trang_thai: '',
      khoa_phong: '',
      loai_ntt: '',
    });
  };

  return (
    <div className={styles.filterBar}>
      <div className={styles.searchWrap}>
        <Input
          placeholder={SEARCH_PLACEHOLDER[activeTab] || SEARCH_PLACEHOLDER.tat_ca}
          value={filters.keyword}
          onChange={(e) => onChange({ ...filters, keyword: e.target.value })}
          leftIcon={<HiOutlineMagnifyingGlass />}
        />
      </div>

      <select
        className={styles.select}
        value={filters.trang_thai}
        onChange={(e) => onChange({ ...filters, trang_thai: e.target.value })}
      >
        {TRANG_THAI_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {activeTab === 'sinh_vien' && (
        <select
          className={styles.select}
          value={filters.khoa_phong}
          onChange={(e) => onChange({ ...filters, khoa_phong: e.target.value })}
        >
          <option value="">-- Tất cả khoa --</option>
          {KHOA_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      )}

      {activeTab === 'tat_ca' && (
        <select
          className={styles.select}
          value={filters.loai_ntt}
          onChange={(e) => onChange({ ...filters, loai_ntt: e.target.value })}
        >
          {LOAI_NTT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      )}

      {hasFilter && (
        <Button
          variant="ghost"
          leftIcon={<HiOutlineXMark />}
          onClick={clearFilters}
        >
          Xóa bộ lọc
        </Button>
      )}
    </div>
  );
};

export default UserFilter;
