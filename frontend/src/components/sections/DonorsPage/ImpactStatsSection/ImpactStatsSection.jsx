import { useState, useEffect } from 'react';
import { 
  HiOutlineAcademicCap, 
  HiOutlineBanknotes, 
  HiOutlineBuildingOffice2 
} from 'react-icons/hi2';
import statisticsService from '@services/statisticsService';
import styles from './ImpactStatsSection.module.scss';

/**
 * Custom hook để animate đếm số từ 0 lên giá trị target
 * @param {number} targetValue - Giá trị đích cần đếm đến
 * @param {number} duration - Thời gian animation (ms)
 * @returns {number} - Giá trị hiện tại đang đếm
 */
const useCountUp = (targetValue, duration = 1500) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const steps = 60;
    const interval = duration / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += targetValue / steps;
      
      if (current >= targetValue) {
        current = targetValue;
        clearInterval(timer);
      }

      setDisplayValue(
        Number.isInteger(targetValue)
          ? Math.floor(current)
          : parseFloat(current.toFixed(1))
      );
    }, interval);

    return () => clearInterval(timer);
  }, [targetValue, duration]);

  return displayValue;
};

/**
 * StatItem Component - Hiển thị một stat với icon, số liệu và label
 */
const StatItem = ({ icon: Icon, value, suffix, label }) => {
  const animatedValue = useCountUp(value);

  return (
    <div className={styles.statItem}>
      <Icon className={styles.statIcon} />
      <div className={styles.statValue}>
        {animatedValue}
        <span className={styles.statSuffix}>{suffix}</span>
      </div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
};

/**
 * ImpactStatsSection Component
 * 
 * Section hiển thị thống kê tác động của quỹ
 * Hiển thị 3 chỉ số chính: Sinh viên, Giải ngân, Đối tác
 * Dữ liệu lấy từ API backend
 */
const ImpactStatsSection = ({ totalDonors }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);

  useEffect(() => {
    const fetchImpactStats = async () => {
      try {
        setLoading(true);
        const data = await statisticsService.getImpactStats();
        
        // Convert số tiền từ VNĐ sang Tỷ VNĐ
        const totalDisbursedInBillion = data.totalDisbursed / 1000000000;

        // Map data từ API sang format của stats
        const statsData = [
          {
            icon: HiOutlineAcademicCap,
            value: data.totalStudents || 0,
            suffix: '+',
            label: 'SINH VIÊN ĐƯỢC HỖ TRỢ',
          },
          {
            icon: HiOutlineBanknotes,
            value: parseFloat(totalDisbursedInBillion.toFixed(1)),
            suffix: ' VNĐ',
            label: 'ĐÃ NHẬN TÀI TRỢ', // Tổng số tiền từ các khoản tài trợ có trạng thái "Da nhan"
          },
          {
            icon: HiOutlineBuildingOffice2,
            value: typeof totalDonors === 'number' ? totalDonors : (data.totalDonors || 0),
            suffix: '+',
            label: 'ĐỐI TÁC DOANH NGHIỆP',
          },
        ];

        setStats(statsData);
      } catch (error) {
        console.error('Error fetching impact stats:', error);
        // Fallback to default values on error
        setStats([
          {
            icon: HiOutlineAcademicCap,
            value: 0,
            suffix: '+',
            label: 'SINH VIÊN ĐƯỢC HỖ TRỢ',
          },
          {
            icon: HiOutlineBanknotes,
            value: 0,
            suffix: 'VNĐ',
            label: 'ĐÃ GIẢI NGÂN',
          },
          {
            icon: HiOutlineBuildingOffice2,
            value: typeof totalDonors === 'number' ? totalDonors : 0,
            suffix: '+',
            label: 'ĐỐI TÁC DOANH NGHIỆP',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchImpactStats();
  }, [totalDonors]);

  if (loading) {
    return (
      <section className={styles.impactStatsSection}>
        <div className={styles.container}>
          <div className={styles.statsCard}>
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <div className={styles.statLabel}>Đang tải...</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.impactStatsSection}>
      <div className={styles.container}>
        <div className={styles.statsCard}>
          <div className={styles.statsGrid}>
            {stats.map((stat, index) => (
              <div key={index} className={styles.statWrapper}>
                <StatItem
                  icon={stat.icon}
                  value={stat.value}
                  suffix={stat.suffix}
                  label={stat.label}
                />
                {index < stats.length - 1 && (
                  <div className={styles.divider} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImpactStatsSection;
