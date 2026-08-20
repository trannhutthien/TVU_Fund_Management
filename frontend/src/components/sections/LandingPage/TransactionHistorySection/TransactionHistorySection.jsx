import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@components/common/Button';
import api from '@services/api';
import { formatCurrency, formatDate } from '@utils/formatters';
import styles from './TransactionHistorySection.module.scss';

const TransactionHistorySection = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const [listRes, summaryRes] = await Promise.all([
          api.get('/transactions/public', { params: { limit: 4 } }),
          api.get('/transactions/public/summary'),
        ]);
        if (!mounted) return;
        setTransactions(listRes.data?.data || []);
        setSummary(summaryRes.data?.data || null);
      } catch (err) {
        console.error('Lỗi tải giao dịch công khai:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    return () => {
      mounted = false;
    };
  }, []);

  const stats = [
    { key: 'thu', label: 'TỔNG THU', value: formatCurrency(summary?.tongThu) },
    { key: 'chi', label: 'TỔNG CHI', value: formatCurrency(summary?.tongChi) },
    { key: 'so', label: 'SỐ GIAO DỊCH', value: `${summary?.soGiaoDich ?? 0}` },
  ];

  return (
    <section className={styles.transactionSection}>
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.header}>
          <div className={styles.titleContainer}>
            <span className={styles.decoratorLine} />
            <h2 className={styles.title}>Lịch sử giao dịch công khai</h2>
          </div>
          <p className={styles.subtitle}>
            Minh bạch toàn bộ dòng tiền Thu – Chi của Quỹ Phát triển Đại học Trà Vinh.
            Theo dõi các giao dịch mới nhất và truy xuất thông tin chi tiết từng khoản.
          </p>
        </div>

        {loading ? (
          <div className={styles.loadingState}>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : transactions.length > 0 ? (
          <>
            {/* Tổng quan nhanh */}
            <div className={styles.statsRow}>
              {stats.map((s) => (
                <div key={s.key} className={styles.statCard}>
                  <div className={styles.statLabel}>{s.label}</div>
                  <div className={`${styles.statValue} ${styles[`stat_${s.key}`]}`}>
                    {s.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Danh sách giao dịch gần nhất */}
            <div className={styles.txList}>
              {transactions.map((tx) => (
                <div key={tx.transactionId} className={styles.txRow}>
                  <span
                    className={`${styles.loaiBadge} ${
                      tx.loai === 'Thu' ? styles.badgeThu : styles.badgeChi
                    }`}
                  >
                    {tx.loai}
                  </span>
                  <div className={styles.txInfo}>
                    <div className={styles.txFund}>
                      {tx.quy?.tenQuy || 'TVU Fund'}
                    </div>
                    <div className={styles.txNote}>
                      {tx.ghiChu || 'Giao dịch quỹ'}
                    </div>
                  </div>
                  <div className={styles.txMeta}>
                    <div
                      className={`${styles.txAmount} ${
                        tx.loai === 'Thu' ? styles.amountUp : styles.amountDown
                      }`}
                    >
                      {tx.loai === 'Thu' ? '+' : '−'}
                      {formatCurrency(Math.abs(tx.soTien))}
                    </div>
                    <div className={styles.txDate}>{formatDate(tx.ngayGiaoDich)}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className={styles.emptyState}>
            <p>Chưa có giao dịch nào được công bố.</p>
          </div>
        )}

        {/* Footer Action */}
        <div className={styles.sectionFooter}>
          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate('/lich-su-giao-dich')}
          >
            Xem toàn bộ lịch sử giao dịch →
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TransactionHistorySection;