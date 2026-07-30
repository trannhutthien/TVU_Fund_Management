import { useState, useEffect } from 'react';
import {
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineExclamationTriangle,
  HiOutlineBanknotes,
  HiOutlineDocumentCheck,
  HiOutlineUserGroup,
} from 'react-icons/hi2';
import { formatCurrency } from '@utils/formatters';
import api from '@services/api';
import styles from './FundLimitCheck.module.scss';

const FundLimitCheck = ({
  fundId,
  userId,
  requestedAmount,
  currentApplicationId,
  onBalanceCheck,
}) => {
  const [checks, setChecks] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!fundId) return;
    let mounted = true;
    setLoading(true);

    const params = new URLSearchParams();
    if (userId) params.set('userId', userId);
    if (requestedAmount) params.set('requestedAmount', requestedAmount);
    if (currentApplicationId) params.set('excludeApplicationId', currentApplicationId);

    api.get(`/funds/${fundId}/available-balance?${params.toString()}`)
      .then((res) => {
        if (mounted) {
          const d = res.data?.data;
          setChecks(d);
          onBalanceCheck?.(d);
        }
      })
      .catch(() => {
        if (mounted) setChecks(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, [fundId, userId, requestedAmount, currentApplicationId]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Đang kiểm tra hạn mức...</div>
      </div>
    );
  }

  if (!checks) return null;

  const items = [];

  // 1. Mức hỗ trợ tối đa
  if (checks.mucHoTroToiDa !== null) {
    const ok = !checks.vuotMucTieuDaNhan;
    items.push({
      icon: ok ? HiOutlineCheckCircle : HiOutlineExclamationTriangle,
      label: `Mức hỗ trợ tối đa: ${formatCurrency(checks.mucHoTroToiDa)}`,
      status: ok ? 'ok' : 'warn',
    });
  }

  // 2. Số lượt đã nhận
  items.push({
    icon: HiOutlineUserGroup,
    label: `Số lượt đã nhận năm nay: ${checks.soLuotDaNhan}`,
    status: 'info',
  });

  // 3. Số dư khả dụng
  const balanceOk = !checks.khongDuSoDu;
  items.push({
    icon: balanceOk ? HiOutlineCheckCircle : HiOutlineXCircle,
    label: `Số dư khả dụng: ${formatCurrency(checks.soDuKhaDung)}`,
    sub: `Tổng dư ${formatCurrency(checks.tongSoDu)} − Chờ giải ngân ${formatCurrency(checks.soTienChoGiaiNgan)}`,
    status: balanceOk ? 'ok' : 'danger',
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <HiOutlineDocumentCheck size={16} />
        <span>Kiểm tra hạn mức</span>
      </div>
      <div className={styles.checkList}>
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className={`${styles.checkItem} ${styles[item.status]}`}>
              <Icon size={16} className={styles.checkIcon} />
              <div className={styles.checkContent}>
                <span className={styles.checkLabel}>{item.label}</span>
                {item.sub && <span className={styles.checkSub}>{item.sub}</span>}
              </div>
            </div>
          );
        })}
      </div>
      {!balanceOk && (
        <div className={styles.blockedMessage}>
          <HiOutlineXCircle size={14} />
          <span>Không đủ số dư khả dụng để duyệt đơn này</span>
        </div>
      )}
    </div>
  );
};

export default FundLimitCheck;
