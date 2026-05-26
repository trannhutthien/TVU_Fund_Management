import { useState } from 'react';
import PropTypes from 'prop-types';
import { HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import Button from '@components/common/Button';
import Input from '@components/common/Input';
import Dropdown from '@components/common/Dropdown';
import styles from './FundSelectSection.module.scss';

/**
 * FundSelectSection Component
 * 
 * Section tìm kiếm, sắp xếp và lọc quỹ
 * Bao gồm: Input search, Dropdown sort, Filter buttons
 */
const FundSelectSection = ({
  onSearch,
  onSortChange,
  onFilterChange,
  activeFilter = 'Tất cả',
}) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortValue, setSortValue] = useState('newest');

  // Danh sách các danh mục lọc
  const filterCategories = [
    'Tất cả',
    'Hỗ trợ học phí',
    'Hoàn cảnh khó khăn',
    'Khuyến tài',
    'Hỗ trợ đột xuất',
  ];

  // Options cho dropdown sắp xếp
  const sortOptions = [
    { value: 'newest', label: 'Mới nhất' },
    { value: 'oldest', label: 'Cũ nhất' },
    { value: 'highest', label: 'Số dư cao nhất' },
    { value: 'name', label: 'Tên A→Z' },
  ];

  // Handle search input change
  const handleSearchChange = (e) => {
    const keyword = e.target.value;
    setSearchKeyword(keyword);
    onSearch?.(keyword);
  };

  // Handle sort change
  const handleSortChange = (value) => {
    setSortValue(value);
    onSortChange?.(value);
  };

  // Handle filter category click
  const handleFilterClick = (category) => {
    onFilterChange?.(category);
  };

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

        {/* Bộ lọc danh mục */}
        <div className={styles.filterRow}>
          {filterCategories.map((category) => {
            const isActive = activeFilter === category;
            
            return (
              <Button
                key={category}
                variant={isActive ? 'primary' : 'ghost'}
                size="md"
                onClick={() => handleFilterClick(category)}
                className={`${styles.filterButton} ${
                  isActive ? styles.active : styles.inactive
                }`}
              >
                {category}
              </Button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

FundSelectSection.propTypes = {
  onSearch: PropTypes.func,
  onSortChange: PropTypes.func,
  onFilterChange: PropTypes.func,
  activeFilter: PropTypes.string,
};

export default FundSelectSection;
