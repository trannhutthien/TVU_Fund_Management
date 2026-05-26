import { useState, useEffect } from 'react';
import { 
  HiOutlineCheckCircle, 
  HiOutlineBanknotes, 
  HiOutlineHeart,
  HiOutlineArchiveBox 
} from 'react-icons/hi2';
import StatCard from '@components/common/Card/StatCard';
import statisticsService from '@services/statisticsService';
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
        
        // Fallback to mock data if API fails
        const mockData = {
          supportedRequests: 1,      
          totalFundAmount: 1, 
          totalDonors: 1,              
          totalFunds: 1,               
        };
        setStats(mockData);
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

  // Format currency (VNĐ)
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '0'; // Handle undefined/null
    
    if (amount >= 1000000000) {
      // Tỷ
      return `${(amount / 1000000000).toFixed(1)} tỷ`;
    } else if (amount >= 1000000) {
      // Triệu
      return `${(amount / 1000000).toFixed(1)} triệu`;
    }
    return formatNumber(amount);
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
            trend="up"
            trendValue="+12.5%"
            subtitle="So với năm trước"
            loading={loading}
          />

          {/* Card 2: Tổng số tiền */}
          <StatCard
            title="Tổng giá trị hỗ trợ"
            value={`${formatCurrency(stats.totalFundAmount)} đ`}
            icon={<HiOutlineBanknotes />}
            iconBgColor="blue"
            trend="up"
            trendValue="+8.3%"
            subtitle="Tích lũy từ các quỹ"
            loading={loading}
          />

          {/* Card 3: Nhà hỗ trợ */}
          <StatCard
            title="Nhà hảo tâm"
            value={formatNumber(stats.totalDonors)}
            icon={<HiOutlineHeart />}
            iconBgColor="red"
            trend="up"
            trendValue="+5"
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
