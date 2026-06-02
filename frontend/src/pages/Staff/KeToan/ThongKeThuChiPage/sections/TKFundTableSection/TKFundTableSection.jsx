import { HiCircleStack } from 'react-icons/hi2';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import styles from './TKFundTableSection.module.scss';

// ═══════════════════════════════════════════════════════════════════════════════
// ─── TK FUND TABLE SECTION ─────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
// CÔNG DỤNG: Bảng thống kê từng quỹ trong kỳ
// ═══════════════════════════════════════════════════════════════════════════════

const TKFundTableSection = ({ fundTableData, period }) => {
  // ─── GET PERIOD LABEL ──────────────────────────────────────────────────────
  const getPeriodLabel = () => {
    if (period.type === 'month') {
      return `Tháng ${period.month}/${period.year}`;
    }
    if (period.type === 'quarter') {
      return `Quý ${period.quarter}/${period.year}`;
    }
    if (period.type === 'year') {
      return `Năm ${period.year}`;
    }
    return '';
  };

  // ─── CALCULATE BALANCE COLOR ──────────────────────────────────────────────
  const getBalanceColor = (soDu, soTienToiDa) => {
    if (!soTienToiDa || soTienToiDa === 0) return '#16a34a';
    const percent = (soDu / soTienToiDa) * 100;
    if (percent >= 50) return '#16a34a'; // Xanh lá
    if (percent >= 20) return '#f97316'; // Cam
    return '#dc2626'; // Đỏ
  };

  const getBalancePercent = (soDu, soTienToiDa) => {
    if (!soTienToiDa || soTienToiDa === 0) return 100;
    return Math.min((soDu / soTienToiDa) * 100, 100);
  };

  // ─── RENDER EMPTY STATE ────────────────────────────────────────────────────
  if (!fundTableData || fundTableData.length === 0) {
    return (
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.titleBlock}>
            <HiCircleStack className={styles.titleIcon} />
            <h3 className={styles.title}>Thống kê theo Quỹ</h3>
          </div>
          <div className={styles.periodLabel}>Kỳ: {getPeriodLabel()}</div>
        </div>
        <div className={styles.emptyState}>
          <HiCircleStack className={styles.emptyIcon} />
          <p className={styles.emptyText}>Không có dữ liệu quỹ trong kỳ này</p>
        </div>
      </div>
    );
  }

  // ─── CALCULATE TOTALS ──────────────────────────────────────────────────────
  const totals = fundTableData.reduce(
    (acc, item) => ({
      thu: acc.thu + (item.thu || 0),
      chi: acc.chi + (item.chi || 0),
      soDu: acc.soDu + (item.soDu || 0),
      soGiaoDich: acc.soGiaoDich + (item.soGiaoDich || 0),
    }),
    { thu: 0, chi: 0, soDu: 0, soGiaoDich: 0 }
  );

  // ─── RENDER SPARKLINE ──────────────────────────────────────────────────────
  const renderSparkline = (trendData) => {
    if (!trendData || trendData.length < 2) {
      return <span className={styles.noData}>Chưa đủ dữ liệu</span>;
    }

    return (
      <ResponsiveContainer width={120} height={36}>
        <LineChart data={trendData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--color-gold)"
            strokeWidth={3}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className={styles.card}>
      {/* Card Header */}
      <div className={styles.cardHeader}>
        <div className={styles.titleBlock}>
          <HiCircleStack className={styles.titleIcon} />
          <h3 className={styles.title}>Thống kê theo Quỹ</h3>
        </div>
        <div className={styles.periodLabel}>Kỳ: {getPeriodLabel()}</div>
      </div>

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          {/* Table Header */}
          <thead>
            <tr>
              <th style={{ width: '25%' }}>QUỸ</th>
              <th style={{ width: '15%' }}>THU KỲ NÀY</th>
              <th style={{ width: '15%' }}>CHI KỲ NÀY</th>
              <th style={{ width: '15%' }}>SỐ DƯ HIỆN TẠI</th>
              <th style={{ width: '10%' }}>SỐ GD</th>
              <th style={{ width: '20%' }}>BIẾN ĐỘNG</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {fundTableData.map((fund, index) => {
              const balanceColor = getBalanceColor(fund.soDu, fund.soTienToiDa);
              const balancePercent = getBalancePercent(fund.soDu, fund.soTienToiDa);

              return (
                <tr key={index}>
                  {/* Quỹ */}
                  <td>
                    <div className={styles.fundName}>{fund.tenQuy}</div>
                    <span className={styles.fundBadge}>
                      {fund.trangThai || 'Đang hoạt động'}
                    </span>
                  </td>

                  {/* Thu */}
                  <td>
                    {fund.thu > 0 ? (
                      <span className={styles.amountThu}>
                        {fund.thu.toLocaleString('vi-VN')} đ
                      </span>
                    ) : (
                      <span className={styles.emptyValue}>—</span>
                    )}
                  </td>

                  {/* Chi */}
                  <td>
                    {fund.chi > 0 ? (
                      <span className={styles.amountChi}>
                        {fund.chi.toLocaleString('vi-VN')} đ
                      </span>
                    ) : (
                      <span className={styles.emptyValue}>—</span>
                    )}
                  </td>

                  {/* Số dư */}
                  <td>
                    <div className={styles.balanceCell}>
                      <span
                        className={styles.balanceAmount}
                        style={{ color: balanceColor }}
                      >
                        {fund.soDu.toLocaleString('vi-VN')} đ
                      </span>
                      <div className={styles.progressTrack}>
                        <div
                          className={styles.progressBar}
                          style={{
                            width: `${balancePercent}%`,
                            backgroundColor: balanceColor,
                          }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Số giao dịch */}
                  <td className={styles.centerCell}>
                    {fund.soGiaoDich || 0}
                  </td>

                  {/* Biến động */}
                  <td className={styles.sparklineCell}>
                    {renderSparkline(fund.trendData)}
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* Table Footer */}
          <tfoot>
            <tr>
              <td className={styles.footerLabel}>Tổng cộng</td>
              <td>
                <span className={styles.amountThu}>
                  {totals.thu.toLocaleString('vi-VN')} đ
                </span>
              </td>
              <td>
                <span className={styles.amountChi}>
                  {totals.chi.toLocaleString('vi-VN')} đ
                </span>
              </td>
              <td>
                <span className={styles.balanceAmount}>
                  {totals.soDu.toLocaleString('vi-VN')} đ
                </span>
              </td>
              <td className={styles.centerCell}>{totals.soGiaoDich}</td>
              <td>—</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default TKFundTableSection;
