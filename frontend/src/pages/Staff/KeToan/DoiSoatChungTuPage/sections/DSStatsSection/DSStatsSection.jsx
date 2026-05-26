import styles from './DSStatsSection.module.scss';

// ═══════════════════════════════════════════════════════════════════════════════
// ─── DS STATS SECTION ──────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
// CÔNG DỤNG: 4 thẻ thống kê tiến độ đối soát
// ═══════════════════════════════════════════════════════════════════════════════

const DSStatsSection = ({ statsData }) => {
  return (
    <div className={styles.grid}>
      <div className={styles.card}>
        <div className={styles.label}>Chưa đối soát</div>
        <div className={styles.value}>{statsData.chuaDoiSoat}</div>
      </div>
      <div className={styles.card}>
        <div className={styles.label}>Đã đối soát</div>
        <div className={styles.value}>{statsData.daDoiSoat}</div>
      </div>
      <div className={styles.card}>
        <div className={styles.label}>Bất thường</div>
        <div className={styles.value}>{statsData.batThuong}</div>
      </div>
      <div className={styles.card}>
        <div className={styles.label}>Tỷ lệ hoàn thành</div>
        <div className={styles.value}>{statsData.tiLeHoanThanh}%</div>
      </div>
    </div>
  );
};

export default DSStatsSection;
