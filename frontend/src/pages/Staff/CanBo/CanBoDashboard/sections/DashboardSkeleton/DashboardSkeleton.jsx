import styles from './DashboardSkeleton.module.scss';

const DashboardSkeleton = () => (
  <div className={styles.wrap}>
    <div className={styles.statsRow}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className={styles.skeletonStat} />
      ))}
    </div>
    <div className={styles.row}>
      <div className={styles.skeletonChart} />
      <div className={styles.skeletonChart} />
    </div>
    <div className={styles.row}>
      <div className={styles.skeletonChart} />
      <div className={styles.skeletonChart} />
    </div>
  </div>
);

export default DashboardSkeleton;
