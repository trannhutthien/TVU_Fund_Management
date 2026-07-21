import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import Input from '@components/common/Input';
import Dropdown from '@components/common/Dropdown';
import styles from './FundSelectSection.module.scss';

const NHOM_ICONS = {
  'Tai tro khong hoan lai': '🎁',
  'Tai tro co thu hoi': '🔄',
  'Cho vay': '💰',
};

const ALL_VALUE = '__all__';

const FundSelectSection = ({
  onSearch,
  onSortChange,
  loaiQuyData = [],
  activeMaLoai,
  onMaLoaiChange,
}) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortValue, setSortValue] = useState('newest');

  const sortOptions = [
    { value: 'newest', label: 'Mới nhất' },
    { value: 'oldest', label: 'Cũ nhất' },
    { value: 'highest', label: 'Số dư cao nhất' },
    { value: 'name', label: 'Tên A→Z' },
  ];

  const handleSearchChange = (e) => {
    const keyword = e.target.value;
    setSearchKeyword(keyword);
    onSearch?.(keyword);
  };

  const handleSortChange = (value) => {
    setSortValue(value);
    onSortChange?.(value);
  };

  const handleNhomChange = (nhomKey, value) => {
    if (value === ALL_VALUE) {
      onMaLoaiChange?.(null);
    } else {
      onMaLoaiChange?.(value);
    }
  };

  // Group loaiquy by nhom
  const nhomGroups = useMemo(() => {
    const map = new Map();
    for (const item of loaiQuyData) {
      const nhom = item.nhom;
      if (!nhom) continue;
      if (!map.has(nhom)) {
        map.set(nhom, { nhom, items: [] });
      }
      map.get(nhom).items.push(item);
    }
    return Array.from(map.values());
  }, [loaiQuyData]);

  return (
    <section className={styles.fundSelectSection}>
      <div className={styles.container}>
        {/* Thanh tìm kiếm + Sắp xếp */}
        <div className={styles.searchRow}>
          <div className={styles.searchWrapper}>
            <Input
              type="text"
              placeholder="Nhập tên quỹ bạn quan tâm..."
              value={searchKeyword}
              onChange={handleSearchChange}
              leftIcon={<HiOutlineMagnifyingGlass size={20} />}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.sortWrapper}>
            <Dropdown
              options={sortOptions}
              value={sortValue}
              onChange={handleSortChange}
              placeholder="Sắp xếp"
              size="medium"
              className={styles.sortDropdown}
            />
          </div>
        </div>

        {/* 3 Dropdown lọc theo nhóm */}
        {nhomGroups.length > 0 && (
          <div className={styles.nhomRow}>
            {nhomGroups.map((group) => {
              const icon = NHOM_ICONS[group.nhom] || '📂';
              const dropdownOptions = [
                { value: ALL_VALUE, label: `Tất cả (${group.nhom})` },
                ...group.items.map((item) => ({
                  value: item.maLoai,
                  label: item.tenLoai,
                })),
              ];

              // Find current value: if activeMaLoai belongs to this group, show it
              const currentValue = group.items.some(
                (item) => item.maLoai === activeMaLoai
              )
                ? activeMaLoai
                : ALL_VALUE;

              return (
                <div key={group.nhom} className={styles.nhomDropdownWrapper}>
                  <span className={styles.nhomIcon}>{icon}</span>
                  <Dropdown
                    options={dropdownOptions}
                    value={currentValue}
                    onChange={(val) => handleNhomChange(group.nhom, val)}
                    placeholder={group.nhom}
                    size="medium"
                    className={styles.nhomDropdown}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

FundSelectSection.propTypes = {
  onSearch: PropTypes.func,
  onSortChange: PropTypes.func,
  loaiQuyData: PropTypes.arrayOf(PropTypes.shape({
    maLoai: PropTypes.string,
    tenLoai: PropTypes.string,
    nhom: PropTypes.string,
  })),
  activeMaLoai: PropTypes.string,
  onMaLoaiChange: PropTypes.func,
};

export default FundSelectSection;
