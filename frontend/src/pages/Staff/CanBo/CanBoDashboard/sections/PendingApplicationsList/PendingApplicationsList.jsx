import { useNavigate } from 'react-router-dom';
import {
  HiOutlineArrowRight,
  HiOutlineCheckCircle,
} from 'react-icons/hi2';
import { formatCurrency, formatDateShort, getInitial } from '../../utils';
import styles from './PendingApplicationsList.module.scss';

const PendingApplicationsList = ({ items }) => {
  const navigate = useNavigate();

  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <h2 className={styles.title}>Đơn cần xử lý ngay</h2>
        <button
          type="button"
          className={styles.viewAllLink}
          onClick={() => navigate('/can-bo/xet-duyet')}
        >
          Xem tất cả
          <HiOutlineArrowRight />
        </button>
      </div>

      {items.length === 0 ? (
        <div className={styles.empty}>
          <HiOutlineCheckCircle className={styles.emptyIcon} />
          <span>Không có đơn nào đang chờ</span>
        </div>
      ) : (
        <div className={styles.list}>
          {items.map((item) => (
            <div
              key={item.requestId}
              className={styles.item}
              onClick={() => navigate(`/xet-duyet/${item.requestId}`)}
              role="button"
              tabIndex={0}
            >
              <div className={styles.avatar}>
                {getInitial(item.nguoiNop?.hoTen)}
              </div>
              <div className={styles.info}>
                <div className={styles.name}>
                  {item.nguoiNop?.hoTen || '—'}
                </div>
                <div className={styles.mssv}>
                  {item.nguoiNop?.maSoDinhDanh || '—'}
                </div>
              </div>
              <div className={styles.right}>
                <div className={styles.amount}>
                  {formatCurrency(item.soTienYeuCau)}
                </div>
                <div className={styles.date}>
                  {formatDateShort(item.ngayNop)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingApplicationsList;
