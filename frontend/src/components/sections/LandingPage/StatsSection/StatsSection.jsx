import { useState, useEffect } from 'react';
import { 
  HiOutlineCheckCircle, 
  HiOutlineBanknotes, 
  HiOutlineHeart,
  HiOutlineArchiveBox 
} from 'react-icons/hi2';
import StatCard from '@components/common/Card/StatCard';
import statisticsService from '@services/statisticsService';
import { formatCurrencyShort } from '@utils/formatters';
import styles from './StatsSection.module.scss';

/**
 * StatsSection Component
 * 
 * Section hiển thị 4 thống kê chính của hệ thống:
 * 1. Số yêu cầu đã hỗ trợ (trạng thái "Đã giải ngân")
 * 2. Tổng số tiền tất cả các quỹ
 * 3. Tổng số nhà hỗ trợ
 * 4. Tổng số quỹ hiện tại
 */
const StatsSection = () => {
  const [stats, setStats] = useState({
    supportedRequests: 0,
    totalFundAmount: 0,
    totalDonors: 0,
    totalFunds: 0,
  });
  const [loading, setLoading] = useState(true);

  // Fetch statistics from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch from backend API
        const data = await statisticsService.getPublicStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching statistics:', error);
        // Giữ nguyên giá trị mặc định {0,0,0,0} khi API lỗi
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Format number with thousand separators
  const formatNumber = (num) => {
    if (!num && num !== 0) return '0'; // Handle undefined/null
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
    <section className={styles.statsSection}>
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Thống kê tổng quan</h2>
          <p className={styles.subtitle}>
            Những con số ấn tượng về hoạt động hỗ trợ sinh viên tại TVU
          </p>
        </div>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          {/* Card 1: Yêu cầu đã hỗ trợ */}
          <StatCard
            title="Yêu cầu đã hỗ trợ"
            value={formatNumber(stats.supportedRequests)}
            icon={<HiOutlineCheckCircle />}
            iconBgColor="green"
            subtitle="So với năm trước"
            loading={loading}
          />

          {/* Card 2: Tổng số tiền */}
          <StatCard
            title="Tổng giá trị hỗ trợ"
            value={`${formatCurrencyShort(stats.totalFundAmount)} đ`}
            icon={<HiOutlineBanknotes />}
            iconBgColor="blue"
            subtitle="Tích lũy từ các quỹ"
            loading={loading}
          />

          {/* Card 3: Nhà hỗ trợ */}
          <StatCard
            title="Nhà hảo tâm"
            value={formatNumber(stats.totalDonors)}
            icon={<HiOutlineHeart />}
            iconBgColor="red"
            subtitle="Đối tác đồng hành"
            loading={loading}
          />

          {/* Card 4: Tổng số quỹ */}
          <StatCard
            title="Quỹ đang hoạt động"
            value={formatNumber(stats.totalFunds)}
            icon={<HiOutlineArchiveBox />}
            iconBgColor="purple"
            trend="neutral"
            subtitle="Đa dạng hình thức"
            loading={loading}
          />
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
