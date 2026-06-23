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
import { getPublicFunds } from '@services/fundService';
import Button from '@components/common/Button';
import styles from './FundProgressSection.module.scss';

// Cột mốc gây quỹ cố định để biểu diễn tiến trình
const MILESTONES = [
  { percent: 25, label: 'Khởi động', desc: 'Mở đơn & Nhận đóng góp' },
  { percent: 50, label: 'Giải ngân đợt 1', desc: 'Hỗ trợ các ca khẩn cấp' },
  { percent: 75, label: 'Giải ngân đợt 2', desc: 'Hỗ trợ mở rộng diện học bổng' },
  { percent: 100, label: 'Hoàn thành', desc: 'Đạt chỉ tiêu ngân sách năm' }
];

// Định nghĩa mã màu và thuộc tính CSS động theo từng loại quỹ
const getCategoryTheme = (category) => {
  switch (category) {
    case 'Tu thien':
      return {
        name: 'Từ thiện',
        primaryColor: '#f59e0b', // Amber 500
        primaryHover: '#d97706',
        lightBg: '#fef3c7', // Amber 100
        darkText: '#78350f',
        gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
        shadow: 'rgba(245, 158, 11, 0.15)',
        badgeBg: 'rgba(245, 158, 11, 0.08)'
      };
    case 'Hoc bong':
      return {
        name: 'Học bổng',
        primaryColor: '#2563eb', // Blue 600
        primaryHover: '#1d4ed8',
        lightBg: '#dbeafe', // Blue 100
        darkText: '#1e3a8a',
        gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
        shadow: 'rgba(59, 130, 246, 0.15)',
        badgeBg: 'rgba(59, 130, 246, 0.08)'
      };
    case 'Y te':
      return {
        name: 'Y tế',
        primaryColor: '#10b981', // Emerald 500
        primaryHover: '#059669',
        lightBg: '#d1fae5', // Emerald 100
        darkText: '#064e3b',
        gradient: 'linear-gradient(135deg, #10b981, #059669)',
        shadow: 'rgba(16, 185, 129, 0.15)',
        badgeBg: 'rgba(16, 185, 129, 0.08)'
      };
    case 'Moi truong':
      return {
        name: 'Môi trường',
        primaryColor: '#06b6d4', // Cyan 500
        primaryHover: '#0891b2',
        lightBg: '#ecfeff', // Cyan 50
        darkText: '#164e63',
        gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)',
        shadow: 'rgba(6, 182, 212, 0.15)',
        badgeBg: 'rgba(6, 182, 212, 0.08)'
      };
    default:
      return {
        name: category || 'Khác',
        primaryColor: '#8b5cf6', // Violet 500
        primaryHover: '#7c3aed',
        lightBg: '#ede9fe', // Violet 100
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
  fund?.tenLoaiQuy ||
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

  const handleDonateClick = (fund) => {
    if (!fund?.id) return;

    navigate(`/apply?role=donor&fundId=${fund.id}`, {
      state: {
        quy_id: fund.id,
        quyId: fund.id,
        fundId: fund.id,
        tenQuy: fund.name,
        tenLoaiQuy: fund.typeName,
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

  // Lấy các biến style theo chủ đề của quỹ được chọn
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
            Theo dõi thời gian thực dòng tiền đóng góp từ các nhà hảo tâm và tiến độ đạt cột mốc giải ngân hỗ trợ sinh viên TVU.
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

          {/* Right Column: Detailed selected fund with dynamic styles */}
          {selectedFund && (
            <div className={styles.fundDetailCard} style={themeStyles}>
              <div className={styles.detailHeader}>
                <span className={styles.detailCategory}>{theme.name}</span>
                <h3 className={styles.detailTitle}>{selectedFund.name}</h3>
                <p className={styles.detailDesc}>{selectedFund.description}</p>
              </div>

              {/* Progress details & Milestones */}
              <div className={styles.progressBox}>
                <div className={styles.progressLabelRow}>
                  <span>Hành trình tích lũy & Giải ngân</span>
                  <span className={styles.percentageText}>{selectedFund.progress}%</span>
                </div>
                
                {/* Thanh tiến trình lớn */}
                <div className={styles.largeProgressTrack}>
                  <div 
                    className={styles.largeProgressBar}
                    style={{ width: `${Math.min(100, selectedFund.progress)}%` }}
                  />
                  
                  {/* Vẽ các điểm mốc trên thanh tiến trình */}
                  <div className={styles.milestonesTrackNodes}>
                    {MILESTONES.map((milestone) => {
                      const isReached = selectedFund.progress >= milestone.percent;
                      return (
                        <div 
                          key={milestone.percent} 
                          className={`${styles.milestoneNode} ${isReached ? styles.nodeReached : ''}`}
                          style={{ left: `${milestone.percent}%` }}
                          title={`${milestone.label}: ${milestone.desc}`}
                        >
                          <div className={styles.nodeInner}>
                            {isReached ? <HiCheck className={styles.checkIcon} /> : <span className={styles.dotIndicator} />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Nhãn nhãn cho các cột mốc bên dưới thanh tiến trình */}
                <div className={styles.milestonesLabels}>
                  {MILESTONES.map((milestone) => {
                    const isReached = selectedFund.progress >= milestone.percent;
                    return (
                      <div 
                        key={milestone.percent} 
                        className={`${styles.milestoneLabelCol} ${isReached ? styles.labelColReached : ''}`}
                        style={{ left: `${milestone.percent}%` }}
                      >
                        <span className={styles.milestoneLabelName}>{milestone.label}</span>
                        <span className={styles.milestoneLabelDesc}>{milestone.desc}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Số dư hiện tại vs Mục tiêu */}
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

              {/* Grid 4 thẻ thống kê từ dữ liệu quỹ */}
              <div className={styles.statsGrid}>
                {/* 1. Số lượng hỗ trợ tối đa */}
                <div className={styles.statCard}>
                  <div className={styles.statIconWrapper}>
                    <HiAcademicCap className={styles.statIcon} />
                  </div>
                  <div className={styles.statText}>
                    <span className={styles.statLabel}>Chỉ tiêu hỗ trợ</span>
                    <span className={styles.statValue}>{formatSupportCount(selectedFund.maxSupportCount)}</span>
                  </div>
                </div>

                {/* 2. Mức hỗ trợ tối đa mỗi suất */}
                <div className={styles.statCard}>
                  <div className={styles.statIconWrapper}>
                    <HiOutlineBanknotes className={styles.statIcon} />
                  </div>
                  <div className={styles.statText}>
                    <span className={styles.statLabel}>Hỗ trợ tối đa/suất</span>
                    <span className={styles.statValue}>{formatSupportAmount(selectedFund.maxSupportAmount)}</span>
                  </div>
                </div>

                {/* 3. Số hồ sơ đã ghi nhận */}
                <div className={styles.statCard}>
                  <div className={styles.statIconWrapper}>
                    <HiDocumentCheck className={styles.statIcon} />
                  </div>
                  <div className={styles.statText}>
                    <span className={styles.statLabel}>Hồ sơ đã ghi nhận</span>
                    <span className={styles.statValue}>{selectedFund.soDonDaNop} yêu cầu</span>
                  </div>
                </div>

                {/* 4. Hạn nộp đơn */}
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
