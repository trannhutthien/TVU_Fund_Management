import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineCheckCircle,
  HiOutlineBanknotes,
  HiOutlineHeart,
} from 'react-icons/hi2';
import StatCard from '@components/common/Card/StatCard';
import statisticsService from '@services/statisticsService';
import { formatCurrencyShort } from '@utils/formatters';
import styles from './index.module.scss';

/**
 * StatsCTASection Component
 *
 * Section gọn: 3 card thống kê (Sinh viên được hỗ trợ, Tổng giá trị hỗ trợ,
 * Nhà tài trợ) kết hợp 2 đường dẫn hành động "Đăng nhập ngay" và "Tra cứu đơn ngay".
 */
const StatsCTASection = ({ onLoginClick }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    supportedRequests: 0,
    totalFundAmount: 0,
    totalDonors: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await statisticsService.getPublicStats();
        if (isMounted) {
          setStats({
            supportedRequests: data.supportedRequests,
            totalFundAmount: data.totalFundAmount,
            totalDonors: data.totalDonors,
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchStats();
    return () => { isMounted = false; };
  }, []);

  const formatNumber = (num) => {
    if (!num && num !== 0) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.statsRow}>
          <StatCard
            title="Sinh viên được hỗ trợ"
            value={formatNumber(stats.supportedRequests)}
            icon={<HiOutlineCheckCircle />}
            iconBgColor="green"
            subtitle="Đã giải ngân hỗ trợ"
            loading={loading}
            className={styles.statCard}
          />
          <StatCard
            title="Tổng giá trị hỗ trợ"
            value={`${formatCurrencyShort(stats.totalFundAmount)} đ`}
            icon={<HiOutlineBanknotes />}
            iconBgColor="blue"
            subtitle="Tích lũy từ các quỹ"
            loading={loading}
            className={styles.statCard}
          />
          <StatCard
            title="Nhà tài trợ"
            value={formatNumber(stats.totalDonors)}
            icon={<HiOutlineHeart />}
            iconBgColor="red"
            subtitle="Đối tác đồng hành"
            loading={loading}
            className={styles.statCard}
          />
        </div>

        <div className={styles.ctaRow}>
          {onLoginClick && (
            <>
              <button
                type="button"
                className={styles.ctaLink}
                onClick={onLoginClick}
                aria-label="Mở form đăng nhập"
              >
                Đã có tài khoản?{' '}
                <span className={styles.ctaHighlight}>Đăng nhập ngay →</span>
              </button>
              <span className={styles.ctaDivider} />
            </>
          )}
          <button
            type="button"
            className={styles.ctaLink}
            onClick={() => navigate('/track')}
            aria-label="Tra cứu đơn"
          >
            Đã nộp đơn?{' '}
            <span className={styles.ctaHighlight}>Tra cứu ngay →</span>
          </button>
        </div>
      </div>
    </section>
  );
};

StatsCTASection.propTypes = {
  onLoginClick: PropTypes.func,
};

export default StatsCTASection;