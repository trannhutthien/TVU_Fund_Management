import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@components/common/Button';
import api from '@services/api';
import { formatCurrency } from '@utils/formatters';
import styles from './ThongKeThuChiSection.module.scss';

const ThongKeThuChiSection = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [cashflow, setCashflow] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const now = new Date();
    const fetchData = async () => {
      try {
        const res = await api.get('/statistics/public/report', {
          params: {
            type: 'month',
            year: now.getFullYear(),
            month: now.getMonth() + 1,
          },
        });
        if (!mounted) return;
        const d = res.data?.data || {};
        setSummary(d.summaryData || null);
        setCashflow(d.cashflowData || []);
      } catch (err) {
        console.error('Lỗi tải thống kê thu chi:', err);
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
    {
      key: 'chenh',
      label: 'CHÊNH LỆCH',
      value: formatCurrency((summary?.tongThu ?? 0) - (summary?.tongChi ?? 0)),
    },
    { key: 'quy', label: 'SỐ QUỸ', value: `${summary?.soQuy ?? 0}` },
  ];

  const maxValue = cashflow.reduce(
    (max, m) => Math.max(max, m.thu || 0, m.chi || 0),
    1,
  );

  return (
    <section className={styles.statsSection}>
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.header}>
          <div className={styles.titleContainer}>
            <span className={styles.decoratorLine} />
            <h2 className={styles.title}>Thống kê thu – chi</h2>
          </div>
          <p className={styles.subtitle}>
            Tổng quan dòng tiền Thu – Chi của Quỹ Phát triển Đại học Trà Vinh theo
            từng thời kỳ, phục vụ công tác kiểm soát và công khai minh bạch.
          </p>
        </div>

        {loading ? (
          <div className={styles.loadingState}>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : summary ? (
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

            {/* Biểu đồ dòng tiền 6 tháng */}
            {cashflow.length > 0 && (
              <div className={styles.chartCard}>
                <div className={styles.chartTitle}>Dòng tiền 6 tháng gần nhất</div>
                <div className={styles.chart}>
                  {cashflow.map((m) => {
                    const thuH = ((m.thu || 0) / maxValue) * 100;
                    const chiH = ((m.chi || 0) / maxValue) * 100;
                    return (
                      <div key={m.thangKey} className={styles.chartCol}>
                        <div className={styles.bars}>
                          <div
                            className={styles.barThu}
                            style={{ height: `${Math.max(thuH, 3)}%` }}
                            title={`Thu ${formatCurrency(m.thu)}`}
                          />
                          <div
                            className={styles.barChi}
                            style={{ height: `${Math.max(chiH, 3)}%` }}
                            title={`Chi ${formatCurrency(m.chi)}`}
                          />
                        </div>
                        <div className={styles.chartLabel}>{m.thang}</div>
                      </div>
                    );
                  })}
                </div>
                <div className={styles.legend}>
                  <span className={styles.legendItem}>
                    <span className={`${styles.legendDot} ${styles.legendThu}`} />
                    Thu
                  </span>
                  <span className={styles.legendItem}>
                    <span className={`${styles.legendDot} ${styles.legendChi}`} />
                    Chi
                  </span>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className={styles.emptyState}>
            <p>Chưa có số liệu thống kê được công bố.</p>
          </div>
        )}

        {/* Footer Action */}
        <div className={styles.sectionFooter}>
          <Button
            variant="warning"
            size="md"
            onClick={() => navigate('/thong-ke-cong-khai')}
          >
            Xem báo cáo thu chi đầy đủ →
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ThongKeThuChiSection;