import {
  HiOutlineArrowTrendingUp,
  HiOutlineArrowTrendingDown,
  HiOutlineBanknotes,
  HiOutlineAcademicCap,
} from 'react-icons/hi2';
import { formatCurrency } from '../utils';
import styles from './BaoCaoKPIBar.module.scss';

const BaoCaoKPIBar = ({ kpi, loading }) => {
  const cards = [
    {
      key: 'tongThu',
      label: 'Tổng thu kỳ này',
      value: formatCurrency(kpi?.tongThu),
      icon: HiOutlineArrowTrendingUp,
      color: '#10b981',
      bg: 'rgba(16,185,129,0.08)',
      sub: `${kpi?.soKhoanThu || 0} khoản tài trợ`,
    },
    {
      key: 'tongChi',
      label: 'Tổng chi kỳ này',
      value: formatCurrency(kpi?.tongChi),
      icon: HiOutlineArrowTrendingDown,
      color: '#ef4444',
      bg: 'rgba(239,68,68,0.08)',
      sub: `${kpi?.soDonGiaiNgan || 0} đơn giải ngân`,
    },
    {
      key: 'soDuCuoiKy',
      label: 'Số dư cuối kỳ',
      value: formatCurrency(kpi?.soDuCuoiKy),
      icon: HiOutlineBanknotes,
      color: 'var(--color-navy-blue, #1a2f5e)',
      bg: 'rgba(26,47,94,0.08)',
      sub: `Đầu kỳ: ${formatCurrency(kpi?.soDuDauKy)}`,
    },
    {
      key: 'sinhVien',
      label: 'Sinh viên được hỗ trợ',
      value: kpi?.sinhVienDuocHoTro || 0,
      icon: HiOutlineAcademicCap,
      color: 'var(--color-gold, #f0a500)',
      bg: 'rgba(240,165,0,0.08)',
      sub: `Tỷ lệ duyệt: ${kpi?.tyLeDuyet || 0}%`,
    },
  ];

  if (loading) {
    return (
      <div className={styles.statsRow}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={styles.skeleton} />
        ))}
      </div>
    );
  }

  return (
    <div className={styles.statsRow}>
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.key} className={styles.statCard}>
            <div
              className={styles.statIconWrap}
              style={{ background: card.bg, color: card.color }}
            >
              <Icon className={styles.statIcon} />
            </div>
            <div className={styles.statText}>
              <div className={styles.statValue}>{card.value}</div>
              <div className={styles.statLabel}>{card.label}</div>
              <div className={styles.statSub}>{card.sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BaoCaoKPIBar;
