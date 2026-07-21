import PropTypes from 'prop-types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import {
  HiUsers,
  HiAcademicCap,
  HiBuildingOffice2,
  HiIdentification,
  HiShieldCheck,
  HiDocumentText,
} from 'react-icons/hi2';
import { StatCard } from '@components/common/Card';
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
  banKiemSoat: '#14b8a6',
};

const AdminUserSection = ({ userData }) => {
  if (!userData) return null;

  const { tongNguoiDung, sinhVien, nhaTaiTro, nhanVien, banKiemSoat, hopDongVayVon, newThisMonth } = userData;

  // ─── CALCULATE PERCENTAGES ─────────────────────────────────────────────────
  const sinhVienPercent =
    tongNguoiDung > 0 ? ((sinhVien / tongNguoiDung) * 100).toFixed(1) : 0;
  const nhaTaiTroPercent =
    tongNguoiDung > 0 ? ((nhaTaiTro / tongNguoiDung) * 100).toFixed(1) : 0;
  const nhanVienPercent =
    tongNguoiDung > 0 ? ((nhanVien / tongNguoiDung) * 100).toFixed(1) : 0;
  const banKiemSoatPercent =
    tongNguoiDung > 0 ? ((banKiemSoat / tongNguoiDung) * 100).toFixed(1) : 0;

  // ─── PREPARE CHART DATA ────────────────────────────────────────────────────
  const chartData = [
    { name: 'Sinh viên', value: sinhVien, color: COLORS.sinhVien },
    { name: 'Nhà tài trợ', value: nhaTaiTro, color: COLORS.nhaTaiTro },
    { name: 'Nhân viên', value: nhanVien, color: COLORS.nhanVien },
  ];

  if (banKiemSoat > 0) {
    chartData.push({ name: 'Ban Kiểm Soát', value: banKiemSoat, color: COLORS.banKiemSoat });
  }

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
          <StatCard
            title="Tổng người dùng"
            value={tongNguoiDung.toLocaleString('vi-VN')}
            subtitle={newThisMonth > 0 ? `+${newThisMonth} tháng này` : undefined}
            icon={<HiUsers size={20} />}
            iconBgColor="blue"
            trend={newThisMonth > 0 ? 'up' : 'neutral'}
          />

          {/* Card 2 - Sinh viên */}
          <StatCard
            title="Sinh viên đăng ký"
            value={sinhVien.toLocaleString('vi-VN')}
            subtitle={`${sinhVienPercent}% tổng người dùng`}
            icon={<HiAcademicCap size={20} />}
            iconBgColor="yellow"
          />

          {/* Card 3 - Nhà tài trợ */}
          <StatCard
            title="Nhà tài trợ"
            value={nhaTaiTro.toLocaleString('vi-VN')}
            subtitle={`${nhaTaiTroPercent}% tổng người dùng`}
            icon={<HiBuildingOffice2 size={20} />}
            iconBgColor="teal"
          />

          {/* Card 4 - Nhân viên */}
          <StatCard
            title="Nhân viên hệ thống"
            value={nhanVien.toLocaleString('vi-VN')}
            subtitle="Admin + Cán bộ + Kế toán"
            icon={<HiIdentification size={20} />}
            iconBgColor="purple"
          />

          {/* Card 5 - Ban Kiểm Soát */}
          {banKiemSoat > 0 && (
            <StatCard
              title="Ban Kiểm Soát"
              value={banKiemSoat.toLocaleString('vi-VN')}
              subtitle={`${banKiemSoatPercent}% tổng người dùng`}
              icon={<HiShieldCheck size={20} />}
              iconBgColor="teal"
            />
          )}

          {/* Card 6 - Hợp đồng vay vốn */}
          {hopDongVayVon > 0 && (
            <StatCard
              title="Hợp đồng vay vốn"
              value={hopDongVayVon.toLocaleString('vi-VN')}
              subtitle="Đang thực hiện"
              icon={<HiDocumentText size={20} />}
              iconBgColor="red"
            />
          )}
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
    banKiemSoat: PropTypes.number,
    hopDongVayVon: PropTypes.number,
    newThisMonth: PropTypes.number,
  }),
};

export default AdminUserSection;
