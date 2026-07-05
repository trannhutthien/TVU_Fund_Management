import { useEffect, useState } from 'react';
import {
  HiOutlineAcademicCap,
  HiOutlineBanknotes,
  HiOutlineBuildingLibrary,
  HiOutlineBuildingOffice2,
  HiOutlineUsers,
} from 'react-icons/hi2';
import statisticsService from '@services/statisticsService';
import styles from './ImpactStatsSection.module.scss';

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

const StatItem = ({ icon: Icon, value, suffix, label, formatter }) => {
  const animatedValue = useCountUp(value);
  const displayValue = formatter
    ? formatter(animatedValue)
    : `${animatedValue.toLocaleString('vi-VN')}${suffix}`;

  return (
    <div className={styles.statItem}>
      <Icon className={styles.statIcon} />
      <div className={styles.statValue}>
        {displayValue}
      </div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
};

const formatCompactCurrency = (amount) => {
  const value = Number(amount) || 0;

  if (value >= 1000000000) {
    const billions = value / 1000000000;
    const display = billions >= 10 ? Math.round(billions) : parseFloat(billions.toFixed(1));
    return `${display.toLocaleString('vi-VN')} tỷ đồng`;
  }

  if (value >= 1000000) {
    const millions = value / 1000000;
    const display = millions >= 10 ? Math.round(millions) : parseFloat(millions.toFixed(1));
    return `${display.toLocaleString('vi-VN')} triệu đồng`;
  }

  if (value >= 1000) {
    return `${Math.round(value / 1000).toLocaleString('vi-VN')} nghìn đồng`;
  }

  return `${Math.round(value).toLocaleString('vi-VN')} đồng`;
};

const buildStats = (data = {}) => [
  {
    icon: HiOutlineAcademicCap,
    value: Number(data.totalStudents) || 0,
    suffix: '+',
    label: 'SINH VIÊN ĐƯỢC HỖ TRỢ',
  },
  {
    icon: HiOutlineBanknotes,
    value: Number(data.totalChildFundReceived) || 0,
    suffix: '',
    formatter: formatCompactCurrency,
    label: 'TÀI TRỢ CHO HOẠT ĐỘNG',
  },
  {
    icon: HiOutlineBuildingLibrary,
    value: Number(data.totalParentFundReceived) || 0,
    suffix: '',
    formatter: formatCompactCurrency,
    label: 'TÀI TRỢ VÀO QUỸ TVU',
  },
  {
    icon: HiOutlineBuildingOffice2,
    value: Number(data.totalPartners) || 0,
    suffix: '+',
    label: 'ĐỐI TÁC',
  },
  {
    icon: HiOutlineUsers,
    value: Number(data.totalSponsors) || 0,
    suffix: '+',
    label: 'NHÀ TÀI TRỢ',
  },
];

const ImpactStatsSection = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);

  useEffect(() => {
    const fetchImpactStats = async () => {
      try {
        setLoading(true);
        const data = await statisticsService.getImpactStats();
        setStats(buildStats(data));
      } catch (error) {
        console.error('Error fetching impact stats:', error);
        setStats(buildStats());
      } finally {
        setLoading(false);
      }
    };

    fetchImpactStats();
  }, []);

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
              <div key={stat.label} className={styles.statWrapper}>
                <StatItem
                  icon={stat.icon}
                  value={stat.value}
                  suffix={stat.suffix}
                  formatter={stat.formatter}
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
