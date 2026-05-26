import { useState } from 'react';
import useDashboardData from './useDashboardData';
import WelcomeHeader from './sections/WelcomeHeader/WelcomeHeader';
import QuickStats from './sections/QuickStats/QuickStats';
import MonthlyApplicationsChart from './sections/MonthlyApplicationsChart/MonthlyApplicationsChart';
import FundTypeChart from './sections/FundTypeChart/FundTypeChart';
import AmountTrendChart from './sections/AmountTrendChart/AmountTrendChart';
import PendingApplicationsList from './sections/PendingApplicationsList/PendingApplicationsList';
import TopFundsChart from './sections/TopFundsChart/TopFundsChart';
import SystemAlertsPanel from './sections/SystemAlertsPanel/SystemAlertsPanel';
import DashboardSkeleton from './sections/DashboardSkeleton/DashboardSkeleton';
import styles from './CanBoDashboard.module.scss';

const CanBoDashboard = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { loading, stats, recentPending, warnings, charts } =
    useDashboardData(selectedYear);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <WelcomeHeader pendingCount={stats.choDuyet} />

        <QuickStats stats={stats} />

        <div className={styles.row2}>
          <MonthlyApplicationsChart data={charts.donTheoThang} />
          <FundTypeChart data={charts.phanBoLoaiQuy} />
        </div>

        <div className={styles.row3}>
          <AmountTrendChart
            data={charts.tienYeuCau}
            year={selectedYear}
            onChangeYear={setSelectedYear}
          />
          <PendingApplicationsList items={recentPending} />
        </div>

        <div className={styles.row4}>
          <TopFundsChart data={charts.topQuy} />
          <SystemAlertsPanel warnings={warnings} />
        </div>
      </div>
    </div>
  );
};

export default CanBoDashboard;
