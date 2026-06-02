import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { HiDocumentText, HiCircleStack } from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import styles from './AdminOperationSection.module.scss';

// ═══════════════════════════════════════════════════════════════════════════════
// ─── ADMIN OPERATION SECTION ───────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
// CÔNG DỤNG: Hiển thị tình trạng hồ sơ hỗ trợ + tình trạng quỹ
// ═══════════════════════════════════════════════════════════════════════════════

const AdminOperationSection = ({ operationData }) => {
  const navigate = useNavigate();

  if (!operationData) return null;

  const {
    tongDon,
    choDuyet, // Thêm field mới
    choGiaiNgan,
    dangXuLy,
    daHoanThanh,
    tuChoi,
    tongQuy,
    quyHoatDong,
    funds = [],
  } = operationData;

  // ─── CALCULATE PERCENTAGES ─────────────────────────────────────────────────
  const choDuyetPercent = tongDon > 0 ? (choDuyet / tongDon) * 100 : 0;
  const dangXuLyPercent = tongDon > 0 ? (dangXuLy / tongDon) * 100 : 0;
  const choGiaiNganPercent = tongDon > 0 ? (choGiaiNgan / tongDon) * 100 : 0;
  const daHoanThanhPercent = tongDon > 0 ? (daHoanThanh / tongDon) * 100 : 0;
  const tuChoiPercent = tongDon > 0 ? (tuChoi / tongDon) * 100 : 0;
  const successRate = tongDon > 0 ? ((daHoanThanh / tongDon) * 100).toFixed(1) : 0;

  // ─── FUNNEL DATA ───────────────────────────────────────────────────────────
  const funnelData = [
    {
      label: 'Chờ xử lý',
      value: choDuyet,
      percent: choDuyetPercent,
      color: '#94a3b8', // Màu xám
    },
    {
      label: 'Đang xử lý',
      value: dangXuLy,
      percent: dangXuLyPercent,
      color: '#f97316',
    },
    {
      label: 'Chờ giải ngân',
      value: choGiaiNgan,
      percent: choGiaiNganPercent,
      color: '#ef4444',
    },
    {
      label: 'Đã hoàn thành',
      value: daHoanThanh,
      percent: daHoanThanhPercent,
      color: '#16a34a',
    },
    {
      label: 'Từ chối',
      value: tuChoi,
      percent: tuChoiPercent,
      color: '#64748b',
    },
  ];

  // ─── GET FUND HEALTH COLOR ─────────────────────────────────────────────────
  const getFundHealthColor = (fund) => {
    if (!fund.so_tien_toi_da || fund.so_tien_toi_da === 0) return '#94a3b8';
    const percent = ((fund.so_du || 0) / fund.so_tien_toi_da) * 100;
    if (percent >= 50) return '#f0a500';
    if (percent >= 20) return '#f97316';
    return '#ef4444';
  };

  const getFundHealthPercent = (fund) => {
    if (!fund.so_tien_toi_da || fund.so_tien_toi_da === 0) return 0;
    return Math.min(((fund.so_du || 0) / fund.so_tien_toi_da) * 100, 100);
  };

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className={styles.section}>
      {/* Section Title */}
      <div className={styles.sectionTitle}>
        <div className={styles.titleBar} />
        <h2>Hoạt động nghiệp vụ</h2>
      </div>

      {/* Grid */}
      <div className={styles.grid}>
        {/* Left - Hồ sơ hỗ trợ */}
        <div className={styles.card}>
          {/* Header */}
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderLeft}>
              <HiDocumentText size={18} />
              <span className={styles.cardTitle}>Hồ sơ hỗ trợ</span>
            </div>
            <div className={styles.cardBadge}>{tongDon} đơn</div>
          </div>

          {/* Funnel */}
          <div className={styles.funnel}>
            {funnelData.map((item, index) => (
              <div key={index} className={styles.funnelItem}>
                <div
                  className={styles.funnelDot}
                  style={{ background: item.color }}
                />
                <span className={styles.funnelLabel}>{item.label}</span>
                <span className={styles.funnelValue}>
                  {item.value.toLocaleString('vi-VN')}
                </span>
                <div className={styles.funnelBar}>
                  <div
                    className={styles.funnelBarFill}
                    style={{
                      width: `${item.percent}%`,
                      background: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className={styles.cardFooter}>
            <span className={styles.successRate}>
              Tỷ lệ thành công: {successRate}%
            </span>
          </div>
        </div>

        {/* Right - Tình trạng quỹ */}
        <div className={styles.card}>
          {/* Header */}
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderLeft}>
              <HiCircleStack size={18} />
              <span className={styles.cardTitle}>Danh sách Quỹ</span>
            </div>
            <div className={`${styles.cardBadge} ${styles.cardBadgeGreen}`}>
              {quyHoatDong}/{tongQuy} đang hoạt động
            </div>
          </div>

          {/* Fund List */}
          <div className={styles.fundList}>
            {funds.slice(0, 5).map((fund, index) => {
              const healthPercent = getFundHealthPercent(fund);
              const healthColor = getFundHealthColor(fund);

              return (
                <div key={index} className={styles.fundItem}>
                  <div className={styles.fundRow1}>
                    <span className={styles.fundName}>{fund.ten_quy}</span>
                    <span
                      className={`${styles.fundStatus} ${
                        fund.trang_thai === 'Dang hoat dong'
                          ? styles.fundStatusActive
                          : styles.fundStatusInactive
                      }`}
                    >
                      {fund.trang_thai === 'Dang hoat dong'
                        ? 'Hoạt động'
                        : 'Tạm dừng'}
                    </span>
                  </div>
                  <div className={styles.fundProgressBar}>
                    <div
                      className={styles.fundProgressFill}
                      style={{
                        width: `${healthPercent}%`,
                        background: healthColor,
                      }}
                    />
                  </div>
                  <div className={styles.fundRow3}>
                    {(fund.so_du || 0).toLocaleString('vi-VN')}đ /{' '}
                    {(fund.so_tien_toi_da || 0).toLocaleString('vi-VN')}đ
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className={styles.cardFooter}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/quy')}
              className={styles.viewAllButton}
            >
              Xem tất cả quỹ →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

AdminOperationSection.propTypes = {
  operationData: PropTypes.shape({
    tongDon: PropTypes.number,
    choDuyet: PropTypes.number, // Thêm field mới
    choGiaiNgan: PropTypes.number,
    dangXuLy: PropTypes.number,
    daHoanThanh: PropTypes.number,
    tuChoi: PropTypes.number,
    tongQuy: PropTypes.number,
    quyHoatDong: PropTypes.number,
    funds: PropTypes.array,
  }),
};

export default AdminOperationSection;
