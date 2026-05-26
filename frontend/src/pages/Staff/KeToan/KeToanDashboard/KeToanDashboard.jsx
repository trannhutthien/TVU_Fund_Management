import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import statisticsService from '@services/statisticsService';
import XacNhanModal from '@pages/Staff/KeToan/KhoanTaiTroPage/XacNhanModal/XacNhanModal';
import KeToanStatsSection from './sections/KeToanStatsSection';
import CashFlowChartSection from './sections/CashFlowChartSection';
import TransactionStatusSection from './sections/TransactionStatusSection';
import RecentTransactionSection from './sections/RecentTransactionSection';
import FundHealthSection from './sections/FundHealthSection';
import PendingDonationSection from './sections/PendingDonationSection';
import styles from './KeToanDashboard.module.scss';

const formatLastUpdate = () => {
  const d = new Date();
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const KeToanDashboard = () => {
  const [summaryData, setSummaryData] = useState(null);
  const [cashflowData, setCashflowData] = useState([]);
  const [transactionStatusData, setTransactionStatusData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [fundHealthData, setFundHealthData] = useState([]);
  const [pendingDonations, setPendingDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(formatLastUpdate());

  const [selectedDonation, setSelectedDonation] = useState(null);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [summary, cashflow, txStatus, recentTx, fundHealth, pending] =
        await Promise.all([
          statisticsService.getKeToanSummary().catch(() => null),
          statisticsService.getKeToanCashflow(6).catch(() => []),
          statisticsService.getKeToanTransactionStatus().catch(() => []),
          statisticsService.getKeToanRecentTransactions(10).catch(() => []),
          statisticsService.getKeToanFundHealth().catch(() => []),
          statisticsService.getKeToanPendingDonations(5).catch(() => []),
        ]);

      setSummaryData(summary);
      setCashflowData(cashflow || []);
      setTransactionStatusData(txStatus || []);
      setRecentTransactions(recentTx || []);
      setFundHealthData(fundHealth || []);
      setPendingDonations(pending || []);
      setLastUpdate(formatLastUpdate());
    } catch (err) {
      console.error('Lỗi load Kế toán Dashboard:', err);
      toast.error('Không tải được dữ liệu Dashboard');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleConfirmDonation = (donation) => {
    setSelectedDonation({
      khoan_tai_tro_id: donation.khoan_tai_tro_id,
      ten_nha_tai_tro: donation.ten_nha_tai_tro,
      ten_quy: donation.ten_quy,
      so_tien: donation.so_tien,
      ngay_tai_tro: donation.ngay_tai_tro,
    });
  };

  const handleConfirmSuccess = () => {
    setSelectedDonation(null);
    fetchAll();
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Tổng quan Kế toán</h1>
        <p className={styles.lastUpdate}>Cập nhật lần cuối: {lastUpdate}</p>
      </div>

      <div className={styles.content}>
        <KeToanStatsSection data={summaryData} isLoading={isLoading} />

        <div className={styles.chartRow}>
          <CashFlowChartSection data={cashflowData} isLoading={isLoading} />
          <TransactionStatusSection
            data={transactionStatusData}
            isLoading={isLoading}
          />
        </div>

        <RecentTransactionSection
          data={recentTransactions}
          isLoading={isLoading}
        />

        <div className={styles.bottomRow}>
          <FundHealthSection data={fundHealthData} isLoading={isLoading} />
          <PendingDonationSection
            data={pendingDonations}
            isLoading={isLoading}
            onConfirm={handleConfirmDonation}
          />
        </div>
      </div>

      {selectedDonation && (
        <XacNhanModal
          item={selectedDonation}
          onClose={() => setSelectedDonation(null)}
          onSuccess={handleConfirmSuccess}
        />
      )}
    </div>
  );
};

export default KeToanDashboard;
