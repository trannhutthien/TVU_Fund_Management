import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineCalendar,
  HiOutlineBanknotes,
  HiOutlineCurrencyDollar,
  HiOutlineShieldCheck,
  HiOutlineClock,
} from 'react-icons/hi2';
import { formatCurrency } from '@utils/formatters';
import styles from './FundInfoSection.module.scss';

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

const FundInfoSection = ({ fund }) => {
  const [expanded, setExpanded] = useState(true);

  if (!fund) return null;

  const {
    tenQuy,
    loaiQuy,
    moTa,
    dieuKienTomTat,
    soTienMucTieu,
    soDu,
    soTienHoTroToiDa,
    ngayBatDau,
    hanNopDon,
    trangThai,
  } = fund;

  const is_active = trangThai === 'Hoat dong';
  const hasMucTieu = soTienMucTieu > 0;
  const hasSoDu = soDu > 0;
  const hasHoTroToiDa = soTienHoTroToiDa > 0;
  const hasDates = ngayBatDau || hanNopDon;

  return (
    <section className={styles.card}>
      {/* ── Banner header ── */}
      <button
        type="button"
        className={styles.banner}
        onClick={() => setExpanded((p) => !p)}
      >
        <div className={styles.bannerOverlay} />
        <div className={styles.bannerContent}>
          <div className={styles.bannerTop}>
            <div className={styles.bannerTitle}>
              <HiOutlineBanknotes className={styles.bannerIcon} />
              <span>Thông tin quỹ</span>
            </div>
            {is_active !== undefined && (
              <span className={`${styles.statusPill} ${is_active ? styles.statusActive : styles.statusInactive}`}>
                <span className={styles.statusDot} />
                {is_active ? 'Đang hoạt động' : trangThai}
              </span>
            )}
          </div>
          <div className={styles.bannerFundName}>{tenQuy || '—'}</div>
          {loaiQuy && <span className={styles.loaiBadge}>{loaiQuy}</span>}
        </div>
        <div className={styles.chevronWrap}>
          {expanded ? <HiOutlineChevronUp /> : <HiOutlineChevronDown />}
        </div>
      </button>

      {/* ── Body ── */}
      {expanded && (
        <div className={styles.body}>
          {/* Stats row */}
          <div className={styles.statsRow}>
            {hasMucTieu && (
              <div className={styles.statBox}>
                <div className={`${styles.statIconWrap} ${styles.statIconBlue}`}>
                  <HiOutlineCurrencyDollar />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statLabel}>Mục tiêu</span>
                  <span className={styles.statValue}>{formatCurrency(soTienMucTieu)}</span>
                </div>
              </div>
            )}

            {hasSoDu && (
              <div className={styles.statBox}>
                <div className={`${styles.statIconWrap} ${styles.statIconGreen}`}>
                  <HiOutlineBanknotes />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statLabel}>Số dư</span>
                  <span className={styles.statValue}>{formatCurrency(soDu)}</span>
                </div>
              </div>
            )}

            {hasHoTroToiDa && (
              <div className={styles.statBox}>
                <div className={`${styles.statIconWrap} ${styles.statIconAmber}`}>
                  <HiOutlineShieldCheck />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statLabel}>Hỗ trợ tối đa</span>
                  <span className={styles.statValue}>{formatCurrency(soTienHoTroToiDa)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Dates */}
          {hasDates && (
            <div className={styles.dateBar}>
              <HiOutlineClock className={styles.dateBarIcon} />
              {ngayBatDau && (
                <span className={styles.dateItem}>
                  <span className={styles.dateLabel}>Bắt đầu</span>
                  <span className={styles.dateValue}>{formatDate(ngayBatDau)}</span>
                </span>
              )}
              {ngayBatDau && hanNopDon && <span className={styles.dateSep}>—</span>}
              {hanNopDon && (
                <span className={styles.dateItem}>
                  <span className={styles.dateLabel}>Hạn nộp</span>
                  <span className={styles.dateValue}>{formatDate(hanNopDon)}</span>
                </span>
              )}
            </div>
          )}

          {/* Divider */}
          {(moTa || dieuKienTomTat) && <div className={styles.divider} />}

          {/* Description */}
          {moTa && (
            <div className={styles.field}>
              <div className={styles.fieldLabel}>Mô tả quỹ</div>
              <div className={styles.fieldText}>{moTa}</div>
            </div>
          )}

          {/* Conditions */}
          {dieuKienTomTat && (
            <div className={styles.field}>
              <div className={styles.fieldLabel}>Điều kiện hỗ trợ</div>
              <div className={styles.conditionBox}>
                <HiOutlineShieldCheck className={styles.conditionIcon} />
                <div className={styles.conditionText}>{dieuKienTomTat}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

FundInfoSection.propTypes = {
  fund: PropTypes.shape({
    tenQuy: PropTypes.string,
    loaiQuy: PropTypes.string,
    moTa: PropTypes.string,
    dieuKienTomTat: PropTypes.string,
    soTienMucTieu: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    soDu: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    soTienHoTroToiDa: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    ngayBatDau: PropTypes.string,
    hanNopDon: PropTypes.string,
    trangThai: PropTypes.string,
  }),
};

export default FundInfoSection;
