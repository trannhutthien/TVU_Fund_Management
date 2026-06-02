import PropTypes from 'prop-types';
import { HiOutlineFolderOpen } from 'react-icons/hi2';
import { FundCard } from '@components/common/Card';
import styles from './FundGridSection.module.scss';

/**
 * FundGridSection Component
 * 
 * Hiển thị danh sách quỹ dưới dạng grid
 * Sử dụng FundCard component để hiển thị từng quỹ
 */
const FundGridSection = ({
  funds = [],
  loading = false,
}) => {

  // Loading state - Skeleton cards
  if (loading) {
    return (
      <section className={styles.fundGridSection}>
        <div className={styles.container}>
          <div className={styles.grid}>
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className={styles.skeletonCard}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={styles.skeletonImage} />
                <div className={styles.skeletonContent}>
                  <div className={styles.skeletonTitle} />
                  <div className={styles.skeletonAmount} />
                  <div className={styles.skeletonText} />
                  <div className={styles.skeletonDivider} />
                  <div className={styles.skeletonProgress} />
                  <div className={styles.skeletonButtons}>
                    <div className={styles.skeletonButton} />
                    <div className={styles.skeletonButton} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (!funds || funds.length === 0) {
    return (
      <section className={styles.fundGridSection}>
        <div className={styles.container}>
          <div className={styles.emptyState}>
            <HiOutlineFolderOpen className={styles.emptyIcon} />
            <h3 className={styles.emptyTitle}>Không tìm thấy quỹ phù hợp</h3>
            <p className={styles.emptyText}>
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Fund cards
  return (
    <section className={styles.fundGridSection}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {funds.map((fund) => (
            <FundCard key={fund.quy_id} fund={fund} />
          ))}
        </div>
      </div>
    </section>
  );
};

FundGridSection.propTypes = {
  funds: PropTypes.arrayOf(
    PropTypes.shape({
      quy_id: PropTypes.number.isRequired,
      ten_quy: PropTypes.string.isRequired,
      loai_quy: PropTypes.string,
      hinh_anh: PropTypes.string,
      mo_ta: PropTypes.string,
      so_du: PropTypes.number,
      trang_thai: PropTypes.string,
      so_tien_toi_thieu: PropTypes.number,
      so_tien_toi_da: PropTypes.number,
      so_luong_chi_tieu: PropTypes.number,
      han_nop_don: PropTypes.string,
      dieu_kien_tom_tat: PropTypes.string,
      so_don_da_nop: PropTypes.number,
      phan_tram_da_nhan: PropTypes.number,
    })
  ),
  loading: PropTypes.bool,
};

export default FundGridSection;
