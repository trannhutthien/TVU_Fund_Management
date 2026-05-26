import { useEffect, useState } from 'react';
import {
  HiOutlineMagnifyingGlass,
  HiOutlineXMark,
} from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import Input from '@components/common/Input/Input';
import api from '@services/api';
import styles from './KhoanTaiTroFilter.module.scss';

const LOAI_NTT_OPTIONS = [
  { value: '', label: '-- Tất cả loại NTT --' },
  { value: 'Ca nhan', label: 'Cá nhân' },
  { value: 'Doanh nghiep', label: 'Doanh nghiệp' },
  { value: 'To chuc phi loi nhuan', label: 'Tổ chức phi lợi nhuận' },
];

const TRANG_THAI_OPTIONS = [
  { value: '', label: '-- Tất cả trạng thái --' },
  { value: 'Cho duyet', label: 'Chờ cán bộ' },
  { value: 'Da duyet', label: 'Chờ kế toán' },
  { value: 'Da nhan', label: 'Đã xác nhận' },
  { value: 'Tu choi', label: 'Từ chối' },
];

const KhoanTaiTroFilter = ({ filters, activeTab, onChange }) => {
  const [quyList, setQuyList] = useState([]);

  useEffect(() => {
    api.get('/funds')
      .then((res) => {
        const funds = res?.data?.funds || res?.data?.data || res?.data || [];
        setQuyList(Array.isArray(funds) ? funds : []);
      })
      .catch(() => setQuyList([]));
  }, []);

  const hasFilter =
    filters.keyword || filters.quy_id || filters.loai_ntt ||
    filters.tu_ngay || filters.den_ngay ||
    (activeTab === 'tat_ca' && filters.trang_thai);

  const clearFilters = () => {
    onChange({
      keyword: '',
      quy_id: '',
      loai_ntt: '',
      tu_ngay: '',
      den_ngay: '',
      trang_thai: '',
    });
  };

  return (
    <div className={styles.filterBar}>
      <div className={styles.searchWrap}>
        <Input
          placeholder="Tìm nhà tài trợ, quỹ, ghi chú..."
          value={filters.keyword}
          onChange={(e) => onChange({ ...filters, keyword: e.target.value })}
          leftIcon={<HiOutlineMagnifyingGlass />}
        />
      </div>

      <select
        className={styles.select}
        value={filters.quy_id}
        onChange={(e) => onChange({ ...filters, quy_id: e.target.value })}
      >
        <option value="">-- Tất cả quỹ --</option>
        {quyList.map((q) => (
          <option key={q.quyId || q.quy_id} value={q.quyId || q.quy_id}>
            {q.tenQuy || q.ten_quy}
          </option>
        ))}
      </select>

      <select
        className={styles.select}
        value={filters.loai_ntt}
        onChange={(e) => onChange({ ...filters, loai_ntt: e.target.value })}
      >
        {LOAI_NTT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {activeTab === 'tat_ca' && (
        <select
          className={styles.select}
          value={filters.trang_thai}
          onChange={(e) => onChange({ ...filters, trang_thai: e.target.value })}
        >
          {TRANG_THAI_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      )}

      <div className={styles.dateGroup}>
        <input
          type="date"
          className={styles.dateInput}
          value={filters.tu_ngay}
          onChange={(e) => onChange({ ...filters, tu_ngay: e.target.value })}
          placeholder="Từ ngày"
        />
        <span className={styles.dateSep}>→</span>
        <input
          type="date"
          className={styles.dateInput}
          value={filters.den_ngay}
          onChange={(e) => onChange({ ...filters, den_ngay: e.target.value })}
          placeholder="Đến ngày"
        />
      </div>

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

export default KhoanTaiTroFilter;
