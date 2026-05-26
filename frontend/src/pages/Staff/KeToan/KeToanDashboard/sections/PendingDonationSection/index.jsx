import PropTypes from 'prop-types';
import {
  HiBanknotes,
  HiBuildingOffice2,
  HiCheckCircle,
} from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import styles from './PendingDonationSection.module.scss';

const formatCurrency = (n) => Number(n || 0).toLocaleString('vi-VN') + ' đ';

const PendingDonationSection = ({ data, isLoading, onConfirm }) => {
  const count = data.length;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <HiBanknotes size={18} className={styles.titleIcon} />
        <h3 className={styles.title}>Khoản tài trợ chờ xác nhận</h3>
        {count > 0 && <span className={styles.countBadge}>{count}</span>}
      </div>

      {isLoading ? (
        <div className={styles.skeletonWrap}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.skeletonItem} />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className={styles.empty}>
          <HiCheckCircle size={36} className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>Không có khoản nào chờ xác nhận</p>
          <p className={styles.emptySub}>Tất cả đã được xử lý</p>
        </div>
      ) : (
        <div className={styles.list}>
          {data.map((item) => (
            <div key={item.khoan_tai_tro_id} className={styles.item}>
              <div className={styles.avatarBox}>
                <HiBuildingOffice2 size={18} />
              </div>

              <div className={styles.itemContent}>
                <div className={styles.donorName} title={item.ten_nha_tai_tro}>
                  {item.ten_nha_tai_tro}
                </div>
                <div className={styles.fundName} title={item.ten_quy}>
                  {item.ten_quy}
                </div>
                <div className={styles.amount}>
                  {formatCurrency(item.so_tien)}
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onConfirm?.(item)}
                className={styles.confirmBtn}
              >
                Xác nhận
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

PendingDonationSection.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      khoan_tai_tro_id: PropTypes.number,
      ten_nha_tai_tro: PropTypes.string,
      ten_quy: PropTypes.string,
      so_tien: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    })
  ),
  isLoading: PropTypes.bool,
  onConfirm: PropTypes.func,
};

export default PendingDonationSection;
