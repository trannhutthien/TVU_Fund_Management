import { useState } from 'react';
import PropTypes from 'prop-types';
import { HiOutlineMagnifyingGlass, HiOutlineBuildingLibrary, HiOutlineSquare3Stack3D, HiOutlineRocketLaunch } from 'react-icons/hi2';
import Input from '@components/common/Input';
import Dropdown from '@components/common/Dropdown';
import styles from './FundSelectSection.module.scss';

const ALL_VALUE = '__all__';

const FundSelectSection = ({
  onSearch,
  onSortChange,
  loaiQuyData = [],
  activeMaLoai,
  onMaLoaiChange,
  onCapDoChange,
  onTrangThaiChange,
  activeCapDo,
  activeTrangThai,
  hideLoaiQuyFilter = false, // Prop mới để ẩn filter loại quỹ
}) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortValue, setSortValue] = useState('newest');

  const sortOptions = [
    { value: 'newest', label: 'Mới nhất' },
    { value: 'oldest', label: 'Cũ nhất' },
    { value: 'highest', label: 'Số dư cao nhất' },
    { value: 'name', label: 'Tên A→Z' },
  ];

  // Options cho cấp độ quỹ với icon React và tên mới
  const capDoOptions = [
    { value: ALL_VALUE, label: 'Tất cả cấp độ' },
    { 
      value: '1', 
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HiOutlineBuildingLibrary size={18} />
          <span>Quỹ Phát triển ĐH Trà Vinh</span>
        </span>
      ),
      searchLabel: 'Quỹ Phát triển ĐH Trà Vinh'
    },
    { 
      value: '2', 
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HiOutlineSquare3Stack3D size={18} />
          <span>Quỹ thành phần</span>
        </span>
      ),
      searchLabel: 'Quỹ thành phần'
    },
    { 
      value: '3', 
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HiOutlineRocketLaunch size={18} />
          <span>Quỹ hoạt động</span>
        </span>
      ),
      searchLabel: 'Quỹ hoạt động'
    },
  ];

  // Options cho trạng thái
  const trangThaiOptions = [
    { value: ALL_VALUE, label: 'Tất cả trạng thái' },
    { value: 'Dang hoat dong', label: '✅ Đang hoạt động' },
    { value: 'Tam dung', label: '⏸️ Tạm dừng' },
  ];

  // Options cho loại quỹ (từ loaiQuyData)
  const loaiQuyOptions = [
    { value: ALL_VALUE, label: 'Tất cả loại quỹ' },
    ...loaiQuyData.map((item) => ({
      value: item.maLoai || item.ma_loai,
      label: item.tenLoai || item.ten_loai,
    })),
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

  const handleLoaiQuyChange = (value) => {
    if (value === ALL_VALUE) {
      onMaLoaiChange?.(null);
    } else {
      onMaLoaiChange?.(value);
    }
  };

  const handleCapDoChange = (value) => {
    if (value === ALL_VALUE) {
      onCapDoChange?.(null);
    } else {
      onCapDoChange?.(value);
    }
  };

  const handleTrangThaiChange = (value) => {
    if (value === ALL_VALUE) {
      onTrangThaiChange?.(null);
    } else {
      onTrangThaiChange?.(value);
    }
  };

  return (
    <section className={styles.fundSelectSection}>
      <div className={styles.container}>
        <div className={styles.searchRow}>
          {/* Search Bar - Full Width, Prominent */}
          <div className={styles.searchWrapper}>
            <Input
              type="text"
              placeholder="Tìm kiếm quỹ theo tên hoặc mô tả..."
              value={searchKeyword}
              onChange={handleSearchChange}
              leftIcon={<HiOutlineMagnifyingGlass size={24} />}
              className={styles.searchInput}
            />
          </div>

          {/* Filters Row - 3 or 4 Equal Columns */}
          <div className={styles.filtersRow}>
            {/* Filter: Sắp xếp */}
            <div className={styles.filterItem}>
              <label className={styles.filterLabel}>Sắp xếp</label>
              <Dropdown
                options={sortOptions}
                value={sortValue}
                onChange={handleSortChange}
                placeholder="Chọn cách sắp xếp"
                size="medium"
                className={styles.sortDropdown}
              />
            </div>

            {/* Filter: Loại quỹ - Ẩn nếu hideLoaiQuyFilter = true */}
            {!hideLoaiQuyFilter && (
              <div className={styles.filterItem}>
                <label className={styles.filterLabel}>Loại quỹ</label>
                <Dropdown
                  options={loaiQuyOptions}
                  value={activeMaLoai || ALL_VALUE}
                  onChange={handleLoaiQuyChange}
                  placeholder="Tất cả loại quỹ"
                  size="medium"
                  className={styles.filterDropdown}
                />
              </div>
            )}

            {/* Filter: Cấp độ */}
            <div className={styles.filterItem}>
              <label className={styles.filterLabel}>Cấp độ</label>
              <Dropdown
                options={capDoOptions}
                value={activeCapDo || ALL_VALUE}
                onChange={handleCapDoChange}
                placeholder="Tất cả cấp độ"
                size="medium"
                className={styles.filterDropdown}
              />
            </div>

            {/* Filter: Trạng thái */}
            <div className={styles.filterItem}>
              <label className={styles.filterLabel}>Trạng thái</label>
              <Dropdown
                options={trangThaiOptions}
                value={activeTrangThai || ALL_VALUE}
                onChange={handleTrangThaiChange}
                placeholder="Tất cả trạng thái"
                size="medium"
                className={styles.filterDropdown}
              />
            </div>
          </div>
        </div>
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
  })),
  activeMaLoai: PropTypes.string,
  onMaLoaiChange: PropTypes.func,
  onCapDoChange: PropTypes.func,
  onTrangThaiChange: PropTypes.func,
  activeCapDo: PropTypes.string,
  activeTrangThai: PropTypes.string,
  hideLoaiQuyFilter: PropTypes.bool,
};

export default FundSelectSection;
