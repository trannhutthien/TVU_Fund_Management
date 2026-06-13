import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiOutlineBanknotes, 
  HiOutlineUserGroup, 
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
            const currentBalance = fund.soDu || 0;
            // Lấy số tiền mục tiêu thực tế (sotienmuctieu) từ DB
            const dbGoal = fund.soTienToiThieu ? parseFloat(fund.soTienToiThieu) : 0;
            const calculatedGoal = dbGoal > 0 ? dbGoal : Math.max(
              200000000, 
              Math.ceil((currentBalance * 1.5) / 10000000) * 10000000
            );
            // Số lượng nhà tài trợ tỉ lệ thuận với số dư
            const calculatedDonors = Math.floor(currentBalance / 10000000) + 5;
            // Phần trăm tiến trình = (số dư / mục tiêu) * 100
            const progressPercent = calculatedGoal > 0
              ? Math.min(100, Math.round((currentBalance / calculatedGoal) * 100))
              : 0;

            return {
              id: fund.quyId,
              name: fund.tenQuy,
              category: fund.loaiQuy || 'Khác',
              description: fund.moTa || 'Quỹ hỗ trợ sinh viên Trường Đại học Trà Vinh gặp khó khăn.',
              balance: currentBalance,
              goal: calculatedGoal,
              donors: calculatedDonors,
              progress: progressPercent,
              image: fund.hinhAnh || null,
              soDonDaNop: fund.soDonDaNop || 0,
              hanNopDon: fund.hanNopDon || null,
              soTienToiThieu: fund.soTienToiThieu || null,
              soTienToiDa: fund.soTienToiDa || null
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

  const formatRange = (min, max) => {
    if (!min && !max) return '5.000.000 đ - 15.000.000 đ';
    if (min && !max) return `Từ ${formatCurrency(min)}`;
    if (!min && max) return `Lên tới ${formatCurrency(max)}`;
    return `${formatCurrency(min)} - ${formatCurrency(max)}`;
  };

  const handleDonateClick = (fundId) => {
    navigate('/funds', { state: { autoDonateFundId: fundId } });
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
          
          {/* Left Column: Stack list of funds */}
          <div className={styles.fundStack}>
            {funds.map((fund) => {
              const isSelected = fund.id === selectedFundId;
              const fundTheme = getCategoryTheme(fund.category);
              
              // Gán các thuộc tính CSS tùy chỉnh riêng cho từng thẻ quỹ
              const itemStyles = {
                '--item-primary': fundTheme.primaryColor,
                '--item-bg': fundTheme.badgeBg,
                '--item-light-bg': fundTheme.lightBg,
                '--item-text': fundTheme.darkText,
                '--item-shadow': fundTheme.shadow
              };

              return (
                <div 
                  key={fund.id} 
                  className={`${styles.fundItem} ${isSelected ? styles.activeItem : ''}`}
                  style={itemStyles}
                  onClick={() => setSelectedFundId(fund.id)}
                >
                  <div className={styles.fundMeta}>
                    <span className={styles.fundCategory}>{fundTheme.name}</span>
                    <span className={styles.fundPercent}>{fund.progress}%</span>
                  </div>
                  <h4 className={styles.fundName}>{fund.name}</h4>
                  
                  {/* Small progress bar */}
                  <div className={styles.progressTrack}>
                    <div 
                      className={styles.progressBar} 
                      style={{ width: `${fund.progress}%`, background: fundTheme.gradient }}
                    />
                  </div>
                  <div className={styles.fundBalanceSummary}>
                    Đã có: <strong>{formatCurrency(fund.balance)}</strong>
                  </div>
                </div>
              );
            })}
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
                    style={{ width: `${selectedFund.progress}%` }}
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

              {/* Grid 4 thẻ thống kê tác động thực tế (Impact Stats Grid) */}
              <div className={styles.statsGrid}>
                {/* 1. Số nhà tài trợ */}
                <div className={styles.statCard}>
                  <div className={styles.statIconWrapper}>
                    <HiOutlineUserGroup className={styles.statIcon} />
                  </div>
                  <div className={styles.statText}>
                    <span className={styles.statLabel}>Nhà tài trợ</span>
                    <span className={styles.statValue}>{selectedFund.donors} đối tác</span>
                  </div>
                </div>

                {/* 2. Số sinh viên ước tính được hỗ trợ */}
                <div className={styles.statCard}>
                  <div className={styles.statIconWrapper}>
                    <HiAcademicCap className={styles.statIcon} />
                  </div>
                  <div className={styles.statText}>
                    <span className={styles.statLabel}>Tác động thực tế</span>
                    <span className={styles.statValue}>
                      {Math.floor(selectedFund.balance / 5000000) > 0 
                        ? `~${Math.floor(selectedFund.balance / 5000000)} sinh viên` 
                        : 'Đang tích lũy suất'}
                    </span>
                  </div>
                </div>

                {/* 3. Số hồ sơ đang chờ xét duyệt */}
                <div className={styles.statCard}>
                  <div className={styles.statIconWrapper}>
                    <HiDocumentCheck className={styles.statIcon} />
                  </div>
                  <div className={styles.statText}>
                    <span className={styles.statLabel}>Hồ sơ đang nộp</span>
                    <span className={styles.statValue}>{selectedFund.soDonDaNop} yêu cầu</span>
                  </div>
                </div>

                {/* 4. Hạn nộp đơn và định mức */}
                <div className={styles.statCard}>
                  <div className={styles.statIconWrapper}>
                    <HiCalendarDays className={styles.statIcon} />
                  </div>
                  <div className={styles.statText}>
                    <span className={styles.statLabel}>Hạn nộp đơn / Định mức</span>
                    <span className={styles.statValue} title={formatRange(selectedFund.soTienToiThieu, selectedFund.soTienToiDa)}>
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
                  onClick={() => handleDonateClick(selectedFund.id)}
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
