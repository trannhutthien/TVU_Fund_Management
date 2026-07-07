import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineBanknotes,
  HiOutlineArrowRight,
  HiCheck,
  HiCalendarDays,
  HiAcademicCap,
  HiDocumentCheck
} from 'react-icons/hi2';
import { getPublicFunds, getPublicDisbursementRounds } from '@services/fundService';
import Button from '@components/common/Button';
import styles from './FundProgressSection.module.scss';

// Static milestone labels for donation progress bar
const DONATION_MILESTONES = [
  { percent: 25, label: '25%' },
  { percent: 50, label: '50%' },
  { percent: 75, label: '75%' },
  { percent: 100, label: '100%' }
];

// Fixed milestone labels for disbursement timeline (always 4 steps)
const DISBURSEMENT_STEPS = [
  { key: 'mo_don', label: 'Mở đơn', desc: 'Bắt đầu nhận hồ sơ' },
  { key: 'dot_1', label: 'Đợt 1', desc: 'Giải ngân đợt 1' },
  { key: 'dot_2', label: 'Đợt 2', desc: 'Giải ngân đợt 2' },
  { key: 'hoan_thanh', label: 'Hoàn thành', desc: 'Kết thúc giải ngân' }
];

// Theme per fund category
const getCategoryTheme = (category) => {
  switch (category) {
    case 'Tu thien':
      return {
        name: 'Từ thiện',
        primaryColor: '#f59e0b',
        primaryHover: '#d97706',
        lightBg: '#fef3c7',
        darkText: '#78350f',
        gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
        shadow: 'rgba(245, 158, 11, 0.15)',
        badgeBg: 'rgba(245, 158, 11, 0.08)'
      };
    case 'Hoc bong':
      return {
        name: 'Học bổng',
        primaryColor: '#2563eb',
        primaryHover: '#1d4ed8',
        lightBg: '#dbeafe',
        darkText: '#1e3a8a',
        gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
        shadow: 'rgba(59, 130, 246, 0.15)',
        badgeBg: 'rgba(59, 130, 246, 0.08)'
      };
    case 'Y te':
      return {
        name: 'Y tế',
        primaryColor: '#10b981',
        primaryHover: '#059669',
        lightBg: '#d1fae5',
        darkText: '#064e3b',
        gradient: 'linear-gradient(135deg, #10b981, #059669)',
        shadow: 'rgba(16, 185, 129, 0.15)',
        badgeBg: 'rgba(16, 185, 129, 0.08)'
      };
    case 'Moi truong':
      return {
        name: 'Môi trường',
        primaryColor: '#06b6d4',
        primaryHover: '#0891b2',
        lightBg: '#ecfeff',
        darkText: '#164e63',
        gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)',
        shadow: 'rgba(6, 182, 212, 0.15)',
        badgeBg: 'rgba(6, 182, 212, 0.08)'
      };
    default:
      return {
        name: category || 'Khác',
        primaryColor: '#8b5cf6',
        primaryHover: '#7c3aed',
        lightBg: '#ede9fe',
        darkText: '#4c1d95',
        gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
        shadow: 'rgba(139, 92, 246, 0.15)',
        badgeBg: 'rgba(139, 92, 246, 0.08)'
      };
  }
};

const getFundTypeName = (fund) =>
  fund?.loaiquy?.tenLoai ||
  fund?.loaiquy?.tenloai ||
  fund?.tenloai ||
  fund?.tenLoai ||
  fund?.loaiQuy ||
  'Khác';

const getFundTypeCode = (fund) =>
  fund?.loaiquy?.maLoai ||
  fund?.maLoaiQuy ||
  fund?.maLoai ||
  fund?.loaiQuy ||
  getFundTypeName(fund);

const FundProgressSection = () => {
  const navigate = useNavigate();
  const [funds, setFunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFundId, setSelectedFundId] = useState(null);
  const [disbursementRounds, setDisbursementRounds] = useState([]);

  useEffect(() => {
    const fetchFunds = async () => {
      try {
        setLoading(true);
        const response = await getPublicFunds();
        if (response.success && response.funds) {
          const mappedFunds = response.funds.map(fund => {
            const currentBalance = Number(fund.soDu || 0);
            const goalAmount = Number(fund.soTienMucTieu || fund.soTienToiThieu || 0);
            const maxSupportAmount = Number(fund.soTienHoTroToiDa || fund.soTienToiDa || 0);
            const maxSupportCount = Number(fund.soLuongChiTieu || fund.soluonghotrotoida || 0);
            const progressPercent = goalAmount > 0
              ? Math.round((currentBalance / goalAmount) * 100)
              : 0;
            const fundId = fund.quyId ?? fund.quy_id;
            const typeName = getFundTypeName(fund);
            const typeCode = getFundTypeCode(fund);

            return {
              id: fundId,
              name: fund.tenQuy || fund.ten_quy || fund.tenquy,
              category: typeCode || 'Khác',
              typeName,
              typeCode,
              description: fund.moTa || 'Quỹ hỗ trợ sinh viên Trường Đại học Trà Vinh gặp khó khăn.',
              balance: currentBalance,
              goal: goalAmount,
              progress: progressPercent,
              image: fund.hinhAnh || null,
              soDonDaNop: fund.soDonDaNop || 0,
              hanNopDon: fund.hanNopDon || null,
              ngayBatDau: fund.ngayBatDau || fund.ngay_batdau || null,
              ngayKetThuc: fund.ngayKetThuc || fund.ngay_ketthuc || null,
              maxSupportAmount,
              maxSupportCount
            };
          });

          setFunds(mappedFunds);
          if (mappedFunds.length > 0) {
            setSelectedFundId(mappedFunds[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching funds for progress section:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFunds();
  }, []);

  // Fetch disbursement rounds when selectedFund changes
  useEffect(() => {
    if (!selectedFundId) {
      setDisbursementRounds([]);
      return;
    }

    const fetchRounds = async () => {
      try {
        const response = await getPublicDisbursementRounds(selectedFundId);
        if (response.success && response.data) {
          setDisbursementRounds(response.data);
        }
      } catch (error) {
        console.error('Error fetching disbursement rounds:', error);
        setDisbursementRounds([]);
      }
    };

    fetchRounds();
  }, [selectedFundId]);

  const selectedFund = funds.find(f => f.id === selectedFundId);

  const formatCurrency = (amount) => {
    const num = Math.round(Number(amount) || 0);
    return num.toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' đ';
  };

  const formatCompactCurrency = (amount) => {
    const num = Number(amount) || 0;
    if (num >= 1000000000) {
      return `${(num / 1000000000).toLocaleString('vi-VN', {
        maximumFractionDigits: 1
      })} tỷ`;
    }
    if (num >= 1000000) {
      return `${Math.round(num / 1000000).toLocaleString('vi-VN')} triệu`;
    }
    return formatCurrency(num);
  };

  const formatSupportCount = (count) => {
    const num = Number(count) || 0;
    return num > 0 ? `${num.toLocaleString('vi-VN')} suất` : 'Chưa đặt chỉ tiêu';
  };

  const formatSupportAmount = (amount) => {
    const num = Number(amount) || 0;
    return num > 0 ? formatCurrency(num) : 'Theo quy định';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Mở quanh năm';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Mở quanh năm';
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Build disbursement milestone data from rounds + fund dates
  const buildDisbursementMilestones = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = selectedFund?.ngayBatDau;
    const endDate = selectedFund?.ngayKetThuc;

    // If no rounds, return 4 default steps with fund dates
    if (!disbursementRounds || disbursementRounds.length === 0) {
      return DISBURSEMENT_STEPS.map((step, i) => {
        let date = null;
        let status = 'pending';
        if (i === 0 && startDate) {
          date = startDate;
          status = new Date(startDate) <= today ? 'completed' : 'upcoming';
        } else if (i === DISBURSEMENT_STEPS.length - 1 && endDate) {
          date = endDate;
          status = new Date(endDate) <= today ? 'completed' : 'pending';
        }
        return { ...step, status, date, expected: status !== 'completed' && !!date };
      });
    }

    // Sort rounds by thutu
    const sorted = [...disbursementRounds].sort((a, b) => (a.thutu || 0) - (b.thutu || 0));

    // Step 0: Mở đơn — use fund start date or earliest round date
    const moDonDate = startDate || sorted[0]?.ngayDuKien;
    const moDonStatus = moDonDate ? (new Date(moDonDate) <= today ? 'completed' : 'upcoming') : 'pending';

    // Step 1..n: Đợt 1, Đợt 2, ... from rounds
    const roundSteps = sorted.map((round, i) => {
      const hasActualDate = round.ngayThucTe && round.trangThai === 'hoanthanh';
      const isCompleted = hasActualDate;
      const isUpcoming = round.ngayDuKien && new Date(round.ngayDuKien) > today;

      return {
        key: round.dotId,
        label: round.tenDot || `Đợt ${i + 1}`,
        desc: round.moTa || round.tenDot || `Đợt giải ngân ${i + 1}`,
        status: isCompleted ? 'completed' : isUpcoming ? 'upcoming' : 'pending',
        date: isCompleted ? round.ngayThucTe : round.ngayDuKien,
        expected: !isCompleted
      };
    });

    // Last step: Hoàn thành — use fund end date or last round's ngayThucTe
    const lastRound = sorted[sorted.length - 1];
    const hoanThanhDate = endDate || lastRound?.ngayThucTe || lastRound?.ngayDuKien;
    const hoanThanhStatus = hoanThanhDate ? (new Date(hoanThanhDate) <= today ? 'completed' : 'pending') : 'pending';

    return [
      { key: 'mo_don', label: 'Mở đơn', desc: 'Bắt đầu nhận hồ sơ', status: moDonStatus, date: moDonDate, expected: moDonStatus !== 'completed' && !!moDonDate },
      ...roundSteps,
      { key: 'hoan_thanh', label: 'Hoàn thành', desc: 'Kết thúc giải ngân', status: hoanThanhStatus, date: hoanThanhDate, expected: hoanThanhStatus !== 'completed' && !!hoanThanhDate }
    ];
  };

  const disbursementMilestones = buildDisbursementMilestones();

  const handleDonateClick = (fund) => {
    if (!fund?.id) return;

    navigate(`/apply?role=donor&fundId=${fund.id}`, {
      state: {
        quy_id: fund.id,
        quyId: fund.id,
        fundId: fund.id,
        tenQuy: fund.name,
        loaiQuyLabel: fund.typeName,
        loaiQuy: fund.typeCode,
        role: 'donor',
        guestRole: 'donor',
      },
    });
  };

  if (loading) {
    return (
      <section className={styles.fundProgressSection}>
        <div className={styles.container}>
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <p>Đang tải dữ liệu tiến độ quỹ...</p>
          </div>
        </div>
      </section>
    );
  }

  if (funds.length === 0) {
    return null;
  }

  const theme = selectedFund ? getCategoryTheme(selectedFund.category) : getCategoryTheme('');
  const themeStyles = {
    '--theme-primary': theme.primaryColor,
    '--theme-primary-hover': theme.primaryHover,
    '--theme-bg': theme.badgeBg,
    '--theme-light-bg': theme.lightBg,
    '--theme-text': theme.darkText,
    '--theme-shadow': theme.shadow,
    '--theme-gradient': theme.gradient
  };

  return (
    <section className={styles.fundProgressSection}>
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.header}>
          <div className={styles.titleContainer}>
            <span className={styles.decoratorLine} />
            <h2 className={styles.title}>TIẾN TRÌNH GÂY QUỸ</h2>
          </div>
          <p className={styles.subtitle}>
            Theo dõi thời gian thực dòng tiền đóng góp từ các nhà hảo tâm và tiến độ giải ngân hỗ trợ sinh viên TVU.
          </p>
        </div>

        {/* 2-Column layout */}
        <div className={styles.layoutGrid}>

          {/* Left Column: Compact fund list */}
          <div className={styles.fundListPanel}>
            <div className={styles.fundListHeader}>
              <div>
                <span className={styles.fundListEyebrow}>Danh mục quỹ</span>
                <h3 className={styles.fundListTitle}>Tất cả quỹ đang mở</h3>
              </div>
              <span className={styles.fundCount}>{funds.length}</span>
            </div>

            <div className={styles.fundStack}>
              {funds.map((fund) => {
                const isSelected = fund.id === selectedFundId;
                const fundTheme = getCategoryTheme(fund.category);

                const itemStyles = {
                  '--item-primary': fundTheme.primaryColor,
                  '--item-bg': fundTheme.badgeBg,
                  '--item-light-bg': fundTheme.lightBg,
                  '--item-text': fundTheme.darkText,
                  '--item-shadow': fundTheme.shadow
                };

                return (
                  <button
                    key={fund.id}
                    type="button"
                    className={`${styles.fundItem} ${isSelected ? styles.activeItem : ''}`}
                    style={itemStyles}
                    onClick={() => setSelectedFundId(fund.id)}
                  >
                    <span className={styles.fundTopRow}>
                      <span className={styles.fundCategory}>{fundTheme.name}</span>
                      <span className={styles.fundPercent}>{fund.progress}%</span>
                    </span>

                    <span className={styles.fundMainRow}>
                      <span className={styles.fundName}>{fund.name}</span>
                      <span className={styles.fundAmount}>{formatCompactCurrency(fund.balance)}</span>
                    </span>

                    <span className={styles.progressTrack} aria-hidden="true">
                      <span
                        className={styles.progressBar}
                        style={{ width: `${Math.min(100, fund.progress)}%`, background: fundTheme.gradient }}
                      />
                    </span>

                    <span className={styles.fundBottomRow}>
                      <span>{formatCompactCurrency(fund.goal)} mục tiêu</span>
                      <span>{formatSupportCount(fund.maxSupportCount)}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Detailed selected fund */}
          {selectedFund && (
            <div className={styles.fundDetailCard} style={themeStyles}>
              <div className={styles.detailHeader}>
                <span className={styles.detailCategory}>{theme.name}</span>
                <h3 className={styles.detailTitle}>{selectedFund.name}</h3>
                <p className={styles.detailDesc}>{selectedFund.description}</p>
              </div>

              {/* ── Block 1: Tiến độ quyên góp ── */}
              <div className={styles.progressBox}>
                <div className={styles.progressLabelRow}>
                  <span>Tiến độ quyên góp</span>
                  <span className={styles.percentageText}>{selectedFund.progress}%</span>
                </div>

                {/* Large progress bar */}
                <div className={styles.largeProgressTrack}>
                  <div
                    className={styles.largeProgressBar}
                    style={{ width: `${Math.min(100, selectedFund.progress)}%` }}
                  />

                  {/* Milestone nodes on bar */}
                  <div className={styles.milestonesTrackNodes}>
                    {DONATION_MILESTONES.map((milestone) => {
                      const isReached = selectedFund.progress >= milestone.percent;
                      return (
                        <div
                          key={milestone.percent}
                          className={`${styles.milestoneNode} ${isReached ? styles.nodeReached : ''}`}
                          style={{ left: `${milestone.percent}%` }}
                        >
                          <div className={styles.nodeInner}>
                            {isReached ? <HiCheck className={styles.checkIcon} /> : <span className={styles.dotIndicator} />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Labels below bar */}
                <div className={styles.milestoneLabels}>
                  {DONATION_MILESTONES.map((milestone) => {
                    const isReached = selectedFund.progress >= milestone.percent;
                    return (
                      <span
                        key={milestone.percent}
                        className={`${styles.milestoneLabel} ${isReached ? styles.milestoneLabelReached : ''}`}
                        style={{ left: `${milestone.percent}%` }}
                      >
                        {milestone.label}
                      </span>
                    );
                  })}
                </div>

                {/* Values row */}
                <div className={styles.progressValuesRow}>
                  <div>
                    <span className={styles.valueLabel}>Đã tiếp nhận</span>
                    <h4 className={styles.currentVal}>{formatCurrency(selectedFund.balance)}</h4>
                  </div>
                  <div className={styles.alignRight}>
                    <span className={styles.valueLabel}>Mục tiêu quỹ</span>
                    <h4 className={styles.goalVal}>{formatCurrency(selectedFund.goal)}</h4>
                  </div>
                </div>
              </div>

              {/* ── Divider between two blocks ── */}
              <div className={styles.sectionDivider} />

              {/* ── Block 2: Tiến độ giải ngân ── */}
              <div className={styles.disbursementBox}>
                <div className={styles.disbursementTitleRow}>
                  <span>Tiến độ giải ngân</span>
                </div>

                {/* Timeline */}
                <div className={styles.disbursementTimeline}>
                  {disbursementMilestones.map((ms, index) => (
                    <div
                      key={ms.key}
                      className={`${styles.timelineStep} ${
                        ms.status === 'completed' ? styles.stepCompleted :
                        ms.status === 'upcoming' ? styles.stepUpcoming : styles.stepPending
                      }`}
                    >
                      {/* Connector line */}
                      {index < disbursementMilestones.length - 1 && (
                        <div className={`${styles.connectorLine} ${
                          ms.status === 'completed' ? styles.connectorCompleted : ''
                        }`} />
                      )}

                      {/* Step node */}
                      <div className={styles.stepNode}>
                        {ms.status === 'completed' ? (
                          <div className={styles.stepCheck}><HiCheck /></div>
                        ) : (
                          <div className={styles.stepDot} />
                        )}
                      </div>

                      {/* Step content */}
                      <div className={styles.stepContent}>
                        <span className={styles.stepLabel}>{ms.label}</span>
                        {ms.status === 'completed' && ms.date && (
                          <span className={styles.stepDate}>
                            {formatDateShort(ms.date)}
                          </span>
                        )}
                        {ms.expected && ms.date && (
                          <span className={styles.stepDate}>
                            ~{formatDateShort(ms.date)}
                          </span>
                        )}
                        {ms.status === 'pending' && !ms.date && (
                          <span className={styles.stepDatePending}>{ms.desc}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grid 4 thẻ thống kê */}
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statIconWrapper}>
                    <HiAcademicCap className={styles.statIcon} />
                  </div>
                  <div className={styles.statText}>
                    <span className={styles.statLabel}>Chỉ tiêu hỗ trợ</span>
                    <span className={styles.statValue}>{formatSupportCount(selectedFund.maxSupportCount)}</span>
                  </div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statIconWrapper}>
                    <HiOutlineBanknotes className={styles.statIcon} />
                  </div>
                  <div className={styles.statText}>
                    <span className={styles.statLabel}>Hỗ trợ tối đa/suất</span>
                    <span className={styles.statValue}>{formatSupportAmount(selectedFund.maxSupportAmount)}</span>
                  </div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statIconWrapper}>
                    <HiDocumentCheck className={styles.statIcon} />
                  </div>
                  <div className={styles.statText}>
                    <span className={styles.statLabel}>Hồ sơ đã ghi nhận</span>
                    <span className={styles.statValue}>{selectedFund.soDonDaNop} yêu cầu</span>
                  </div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statIconWrapper}>
                    <HiCalendarDays className={styles.statIcon} />
                  </div>
                  <div className={styles.statText}>
                    <span className={styles.statLabel}>Hạn nộp đơn</span>
                    <span className={styles.statValue}>
                      {formatDate(selectedFund.hanNopDon)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Banner */}
              <div className={styles.detailAction}>
                <Button
                  variant="primary"
                  size="lg"
                  className={styles.btnAction}
                  onClick={() => handleDonateClick(selectedFund)}
                >
                  Đóng góp ngay cho quỹ này
                  <HiOutlineArrowRight className={styles.arrowIcon} />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FundProgressSection;
