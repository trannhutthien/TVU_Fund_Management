import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { HiArrowRight } from 'react-icons/hi2';
import statisticsService from '@services/statisticsService';
import { formatCurrencyShort } from '@utils/formatters';
import styles from './FundBreakdownSection.module.scss';

// Màu sắc cho các loại quỹ - KHỚP CHÍNH XÁC với tenloai trong database
const FUND_COLORS_MAP = {
  'Từ thiện': '#f0a500',              // Gold
  'Học bổng': '#1a2f5e',              // Navy Blue
  'Y tế': '#10b981',                  // Green
  'Môi trường': '#3b82f6',            // Blue
  'Khác': '#94a3b8',                  // Gray
  'Quỷ thi đua': '#8b5cf6',          // Purple
  'Phát triển ĐH Trà Vinh': '#dc2626', // Red
};

// Màu mặc định cho các loại quỹ NULL, rỗng, hoặc không xác định
const DEFAULT_COLOR = '#94a3b8';  // Gray

// Màu dự phòng nếu cần nhiều màu hơn
const FALLBACK_COLORS = [
  '#1a2f5e',  // Navy Blue
  '#f0a500',  // Gold
  '#10b981',  // Green
  '#3b82f6',  // Blue
  '#8b5cf6',  // Purple
  '#ec4899',  // Pink
  '#f59e0b',  // Amber
  '#06b6d4',  // Cyan
  '#dc2626',  // Red
];

// Function để lấy màu cho loại quỹ - ĐƠN GIẢN
const getFundColor = (loaiQuy, index) => {
  // Nếu NULL, rỗng, undefined → Màu mặc định
  if (!loaiQuy || loaiQuy.trim() === '') {
    return DEFAULT_COLOR;
  }
  
  // Nếu có trong FUND_COLORS_MAP (khớp chính xác) → Dùng màu đó
  if (FUND_COLORS_MAP[loaiQuy]) {
    return FUND_COLORS_MAP[loaiQuy];
  }
  
  // Nếu không có → Dùng màu từ FALLBACK_COLORS theo index
  return FALLBACK_COLORS[index % FALLBACK_COLORS.length];
};

/**
 * FundBreakdownSection Component
 * 
 * Section giải thích cơ cấu phân bổ ngân sách quỹ
 * Hiển thị progress bars và donut chart với Recharts
 * Dữ liệu lấy từ API backend
 */
const FundBreakdownSection = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false); // ← State riêng cho animation
  const [loading, setLoading] = useState(true);
  const [fundData, setFundData] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const sectionRef = useRef(null);

  // Fetch fund breakdown data từ API
  useEffect(() => {
    const fetchFundBreakdown = async () => {
      try {
        setLoading(true);
        // Reset animation khi fetch data mới
        setShouldAnimate(false);
        
        const data = await statisticsService.getFundBreakdown();
        
        // Map data từ API sang format cho Recharts
        const mappedFunds = data.funds.map((fund, index) => {
          const color = getFundColor(fund.loaiQuy, index);
          
          return {
            name: fund.loaiQuy || 'Khác',
            value: fund.percentage,
            amount: fund.soDu,
            color: color,
            soLuongQuy: fund.soLuongQuy,
          };
        });

        setFundData(mappedFunds);
        setTotalAmount(data.totalAmount);
      } catch (error) {
        console.error('❌ Error:', error);
        setFundData([]);
        setTotalAmount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchFundBreakdown();
  }, []);

  // Trigger animation chỉ khi CÓ DATA + TRONG VIEWPORT + KHÔNG LOADING
  useEffect(() => {
    if (!loading && fundData.length > 0 && isVisible) {
      // Dùng setTimeout thay requestAnimationFrame để tránh bị cancel bởi StrictMode
      // Delay nhỏ để đảm bảo browser đã paint frame 0% trước
      const timer = setTimeout(() => {
        setShouldAnimate(true);
      }, 50); // 50ms đủ để browser paint frame đầu tiên

      // Cleanup: Clear timeout khi component unmount hoặc dependencies thay đổi
      return () => clearTimeout(timer);
    } else {
      setShouldAnimate(false);
    }
  }, [loading, fundData.length, isVisible]);

  // Intersection Observer để trigger animation khi scroll vào viewport
  // Reset animation khi scroll ra khỏi viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Khi vào viewport → Set isVisible
        if (entry.isIntersecting) {
          setIsVisible(true);
        } 
        // Khi ra khỏi viewport → Reset
        else {
          setIsVisible(false);
        }
      },
      { threshold: 0.2 }  // Trigger khi 20% section vào viewport
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // Custom label cho center của donut chart
  const renderCenterLabel = () => {
    return (
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
        <tspan x="50%" dy="-0.5em" fontSize="24" fontWeight="700" fill="#1a2f5e">
          {formatCurrencyShort(totalAmount)}
        </tspan>
        <tspan x="50%" dy="1.5em" fontSize="12" fill="#64748b">
          Tổng ngân sách
        </tspan>
      </text>
    );
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.customTooltip}>
          <p className={styles.tooltipLabel}>{payload[0].name}</p>
          <p className={styles.tooltipValue}>{payload[0].value}%</p>
          <p className={styles.tooltipAmount}>{formatCurrencyShort(payload[0].payload.amount)}</p>
        </div>
      );
    }
    return null;
  };

  // Custom legend
  const renderLegend = (props) => {
    const { payload } = props;
    return (
      <div className={styles.customLegend}>
        {payload.map((entry, index) => (
          <div key={`legend-${index}`} className={styles.legendItem}>
            <span
              className={styles.legendDot}
              style={{ backgroundColor: entry.color }}
            />
            <span className={styles.legendText}>{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <section className={styles.fundBreakdownSection} ref={sectionRef}>
        <div className={styles.container}>
          <div className={styles.card}>
            <div className={styles.loadingState}>
              <div className={styles.spinner} />
              <p>Đang tải dữ liệu...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (fundData.length === 0) {
    return (
      <section className={styles.fundBreakdownSection} ref={sectionRef}>
        <div className={styles.container}>
          <div className={styles.card}>
            <div className={styles.emptyState}>
              <p>Chưa có dữ liệu quỹ</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.fundBreakdownSection} ref={sectionRef}>
      <div className={styles.container}>
        <div className={styles.card}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.label}>MINH BẠCH TÀI CHÍNH</div>
            <h2 className={styles.title}>Ngân sách được phân bổ như thế nào?</h2>
            <p className={styles.description}>
              Hệ thống Quỹ học bổng TVU phân bổ nguồn ngân sách vào các hạng mục hỗ trợ chính dựa trên nhu cầu thực tế của sinh viên. 
              Toàn bộ dữ liệu tài chính được cập nhật và hiển thị công khai, minh bạch theo thời gian thực từ các nguồn đóng góp.
            </p>
          </div>

          {/* Content Grid */}
          <div className={styles.contentGrid}>
            {/* Left Column - Progress Bars */}
            <div className={styles.progressColumn}>
              {fundData.map((item, index) => {
                const barColor = item.color || DEFAULT_COLOR;
                const barWidth = item.value || 0;
                
                return (
                  <div key={`fund-${index}`} className={styles.progressItem}>
                    {/* Label Row */}
                    <div className={styles.progressHeader}>
                      <span className={styles.progressLabel}>{item.name}</span>
                      <span className={styles.progressPercent}>{barWidth}% ({formatCurrencyShort(item.amount)})</span>
                    </div>

                    {/* Progress Bar - Dùng shouldAnimate thay vì isVisible */}
                    <div style={{
                      height: '8px',
                      background: '#e2e8f0',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      position: 'relative',
                      marginBottom: '16px'
                    }}>
                      <div style={{
                        height: '100%',
                        width: shouldAnimate ? `${barWidth}%` : '0%',
                        backgroundColor: barColor,
                        borderRadius: '4px',
                        transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                        transitionDelay: `${index * 0.1}s`,
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column - Donut Chart */}
            <div className={styles.chartColumn}>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={fundData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={130}
                    paddingAngle={3}
                    isAnimationActive={true}
                    animationBegin={200}
                    animationDuration={800}
                  >
                    {fundData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend content={renderLegend} />
                  {renderCenterLabel()}
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <p className={styles.note}>
              * Dữ liệu tính đến thời điểm hiện tại. Cập nhật: Tháng 5/2025
            </p>
            <a 
              href="/funds" 
              onClick={(e) => { e.preventDefault(); navigate('/funds'); }} 
              className={styles.link}
            >
              Xem danh mục quỹ đầy đủ
              <HiArrowRight className={styles.linkIcon} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FundBreakdownSection;
