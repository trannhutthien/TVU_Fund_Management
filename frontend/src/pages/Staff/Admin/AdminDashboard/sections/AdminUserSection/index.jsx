import PropTypes from 'prop-types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import {
  HiUsers,
  HiAcademicCap,
  HiBuildingOffice2,
  HiIdentification,
} from 'react-icons/hi2';
import styles from './AdminUserSection.module.scss';

// ═══════════════════════════════════════════════════════════════════════════════
// ─── ADMIN USER SECTION ────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
// CÔNG DỤNG: Hiển thị thống kê người dùng + donut chart cơ cấu
// ═══════════════════════════════════════════════════════════════════════════════

const COLORS = {
  sinhVien: '#f0a500',
  nhaTaiTro: '#3b82f6',
  nhanVien: '#a855f7',
};

const AdminUserSection = ({ userData }) => {
  if (!userData) return null;

  const { tongNguoiDung, sinhVien, nhaTaiTro, nhanVien, newThisMonth } = userData;

  // ─── CALCULATE PERCENTAGES ─────────────────────────────────────────────────
  const sinhVienPercent =
    tongNguoiDung > 0 ? ((sinhVien / tongNguoiDung) * 100).toFixed(1) : 0;
  const nhaTaiTroPercent =
    tongNguoiDung > 0 ? ((nhaTaiTro / tongNguoiDung) * 100).toFixed(1) : 0;
  const nhanVienPercent =
    tongNguoiDung > 0 ? ((nhanVien / tongNguoiDung) * 100).toFixed(1) : 0;

  // ─── PREPARE CHART DATA ────────────────────────────────────────────────────
  const chartData = [
    { name: 'Sinh viên', value: sinhVien, color: COLORS.sinhVien },
    { name: 'Nhà tài trợ', value: nhaTaiTro, color: COLORS.nhaTaiTro },
    { name: 'Nhân viên', value: nhanVien, color: COLORS.nhanVien },
  ];

  // ─── RENDER CENTER LABEL ───────────────────────────────────────────────────
  const renderCenterLabel = () => (
    <text
      x="50%"
      y="50%"
      textAnchor="middle"
      dominantBaseline="middle"
      className={styles.centerLabel}
    >
      <tspan x="50%" dy="-8" className={styles.centerValue}>
        {tongNguoiDung.toLocaleString('vi-VN')}
      </tspan>
      <tspan x="50%" dy="20" className={styles.centerText}>
        Người dùng
      </tspan>
    </text>
  );

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className={styles.section}>
      {/* Section Title */}
      <div className={styles.sectionTitle}>
        <div className={styles.titleBar} />
        <h2>Con người trong hệ thống</h2>
      </div>

      {/* Wrapper */}
      <div className={styles.wrapper}>
        {/* Left - Stats Cards */}
        <div className={styles.statsGrid}>
          {/* Card 1 - Tổng người dùng */}
          <div className={styles.statCard}>
            <div className={`${styles.iconBox} ${styles.iconBoxNavy}`}>
              <HiUsers size={20} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{tongNguoiDung.toLocaleString('vi-VN')}</div>
              <div className={styles.statLabel}>Tổng người dùng</div>
              {newThisMonth > 0 && (
                <div className={styles.newBadge}>+{newThisMonth} tháng này</div>
              )}
            </div>
          </div>

          {/* Card 2 - Sinh viên */}
          <div className={styles.statCard}>
            <div className={`${styles.iconBox} ${styles.iconBoxGold}`}>
              <HiAcademicCap size={20} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{sinhVien.toLocaleString('vi-VN')}</div>
              <div className={styles.statLabel}>Sinh viên đăng ký</div>
              <div className={styles.statSub}>{sinhVienPercent}% tổng người dùng</div>
            </div>
          </div>

          {/* Card 3 - Nhà tài trợ */}
          <div className={styles.statCard}>
            <div className={`${styles.iconBox} ${styles.iconBoxBlue}`}>
              <HiBuildingOffice2 size={20} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{nhaTaiTro.toLocaleString('vi-VN')}</div>
              <div className={styles.statLabel}>Nhà tài trợ</div>
              <div className={styles.statSub}>{nhaTaiTroPercent}% tổng người dùng</div>
            </div>
          </div>

          {/* Card 4 - Nhân viên */}
          <div className={styles.statCard}>
            <div className={`${styles.iconBox} ${styles.iconBoxPurple}`}>
              <HiIdentification size={20} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{nhanVien.toLocaleString('vi-VN')}</div>
              <div className={styles.statLabel}>Nhân viên hệ thống</div>
              <div className={styles.statSub}>Admin + Cán bộ + Kế toán</div>
            </div>
          </div>
        </div>

        {/* Right - Donut Chart */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Cơ cấu người dùng</h3>
          
          {/* Chart */}
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                {renderCenterLabel()}
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className={styles.legend}>
            {chartData.map((item) => {
              const percent =
                tongNguoiDung > 0
                  ? ((item.value / tongNguoiDung) * 100).toFixed(1)
                  : 0;
              return (
                <div key={item.name} className={styles.legendItem}>
                  <div
                    className={styles.legendDot}
                    style={{ background: item.color }}
                  />
                  <span className={styles.legendName}>{item.name}</span>
                  <span className={styles.legendValue}>
                    {item.value.toLocaleString('vi-VN')}
                  </span>
                  <span className={styles.legendPercent}>{percent}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

AdminUserSection.propTypes = {
  userData: PropTypes.shape({
    tongNguoiDung: PropTypes.number,
    sinhVien: PropTypes.number,
    nhaTaiTro: PropTypes.number,
    nhanVien: PropTypes.number,
    newThisMonth: PropTypes.number,
  }),
};

export default AdminUserSection;
