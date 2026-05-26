import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { HiOutlineCreditCard } from 'react-icons/hi2';
import { bankAccountService } from '@services/bankAccountService';
import styles from './BankInfoCard.module.scss';

const formatAccountNumber = (num) => {
  if (!num) return '';
  return String(num).replace(/(.{4})/g, '$1 ').trim();
};

const pickAccount = (list) => {
  if (!Array.isArray(list) || list.length === 0) return null;
  const def = list.find((a) => a.laMacDinh === 1 || a.laMacDinh === true);
  return def || list[0];
};

const BankInfoCard = ({ userId }) => {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!userId) return undefined;
    let mounted = true;
    setLoading(true);
    setHasError(false);
    bankAccountService
      .getByUserId(userId)
      .then((res) => {
        if (!mounted) return;
        setAccount(pickAccount(res?.data));
      })
      .catch(() => {
        if (mounted) setHasError(true);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [userId]);

  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <HiOutlineCreditCard className={styles.headerIcon} />
        <h2 className={styles.cardTitle}>Thông tin tài khoản giải ngân</h2>
      </div>

      {loading ? (
        <div className={styles.placeholder}>Đang tải...</div>
      ) : hasError ? (
        <div className={styles.placeholder}>Không tải được thông tin tài khoản</div>
      ) : !account ? (
        <div className={styles.placeholder}>
          Sinh viên chưa thêm tài khoản ngân hàng nào
        </div>
      ) : (
        <div className={styles.body}>
          <div className={styles.row}>
            <div className={styles.label}>Ngân hàng</div>
            <div className={styles.value}>{account.tenNganHang || '—'}</div>
          </div>

          <div className={styles.row}>
            <div className={styles.label}>Số tài khoản</div>
            <div className={`${styles.value} ${styles.account}`}>
              {account.soTaiKhoan ? formatAccountNumber(account.soTaiKhoan) : '—'}
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.label}>Chủ tài khoản</div>
            <div className={styles.value}>{account.chuTaiKhoan || '—'}</div>
          </div>

          {(account.laMacDinh === 1 || account.laMacDinh === true) && (
            <div className={styles.defaultTag}>Tài khoản mặc định</div>
          )}
        </div>
      )}
    </section>
  );
};

BankInfoCard.propTypes = {
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default BankInfoCard;
