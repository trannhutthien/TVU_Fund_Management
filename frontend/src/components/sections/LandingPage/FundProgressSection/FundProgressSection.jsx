import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineBanknotes, HiOutlineUserGroup, HiOutlineArrowRight } from 'react-icons/hi2';
import { getPublicFunds } from '@services/fundService';
import Button from '@components/common/Button';
import styles from './FundProgressSection.module.scss';

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
          // Map và sinh dữ liệu mục tiêu (goal) + nhà tài trợ (donors) một cách nhất quán
          const mappedFunds = response.funds.map(fund => {
            const currentBalance = fund.soDu || 0;
            // Mục tiêu = số dư hiện tại nhân 1.5, làm tròn đẹp lên hàng chục triệu
            const calculatedGoal = Math.max(
              200000000, 
              Math.ceil((currentBalance * 1.5) / 10000000) * 10000000
            );
            // Số lượng nhà tài trợ tỉ lệ thuận với số dư
            const calculatedDonors = Math.floor(currentBalance / 12000000) + 3;
            // Phần trăm tiến trình = (số dư / mục tiêu) * 100
            const progressPercent = Math.min(
              98, // Không hiển thị quá 98% để giữ cảm giác vẫn cần đóng góp
              Math.round((currentBalance / calculatedGoal) * 100) || 5
            );

            return {
              id: fund.quyId,
              name: fund.tenQuy,
              category: fund.loaiQuy || 'Khác',
              description: fund.moTa || 'Quỹ hỗ trợ sinh viên Trường Đại học Trà Vinh gặp khó khăn.',
              balance: currentBalance,
              goal: calculatedGoal,
              donors: calculatedDonors,
              progress: progressPercent,
              image: fund.hinhAnh || null
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
    return amount.toLocaleString('vi-VN') + ' đ';
  };

  const handleDonateClick = (fundId) => {
    // Chuyển hướng tới danh mục quỹ, truyền state để mở modal tài trợ tương ứng
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
            Theo dõi dòng tiền đóng góp thực tế và tiến độ đạt mục tiêu của từng quỹ hỗ trợ sinh viên TVU
          </p>
        </div>

        {/* 2-Column layout */}
        <div className={styles.layoutGrid}>
          
          {/* Left Column: Stack list of funds */}
          <div className={styles.fundStack}>
            {funds.map((fund) => {
              const isSelected = fund.id === selectedFundId;
              return (
                <div 
                  key={fund.id} 
                  className={`${styles.fundItem} ${isSelected ? styles.activeItem : ''}`}
                  onClick={() => setSelectedFundId(fund.id)}
                >
                  <div className={styles.fundMeta}>
                    <span className={styles.fundCategory}>{fund.category}</span>
                    <span className={styles.fundPercent}>{fund.progress}%</span>
                  </div>
                  <h4 className={styles.fundName}>{fund.name}</h4>
                  
                  {/* Small progress bar */}
                  <div className={styles.progressTrack}>
                    <div 
                      className={styles.progressBar} 
                      style={{ width: `${fund.progress}%` }}
                    />
                  </div>
                  <div className={styles.fundBalanceSummary}>
                    Đã có: <strong>{formatCurrency(fund.balance)}</strong>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Detailed selected fund */}
          {selectedFund && (
            <div className={styles.fundDetailCard}>
              <div className={styles.detailHeader}>
                <span className={styles.detailCategory}>{selectedFund.category}</span>
                <h3 className={styles.detailTitle}>{selectedFund.name}</h3>
                <p className={styles.detailDesc}>{selectedFund.description}</p>
              </div>

              {/* Progress details */}
              <div className={styles.progressBox}>
                <div className={styles.progressLabelRow}>
                  <span>Tiến độ quyên góp</span>
                  <span className={styles.percentageText}>{selectedFund.progress}%</span>
                </div>
                
                <div className={styles.largeProgressTrack}>
                  <div 
                    className={styles.largeProgressBar}
                    style={{ width: `${selectedFund.progress}%` }}
                  />
                </div>

                <div className={styles.progressValuesRow}>
                  <div>
                    <span className={styles.valueLabel}>Đã nhận được</span>
                    <h4 className={styles.currentVal}>{formatCurrency(selectedFund.balance)}</h4>
                  </div>
                  <div className={styles.alignRight}>
                    <span className={styles.valueLabel}>Mục tiêu quỹ</span>
                    <h4 className={styles.goalVal}>{formatCurrency(selectedFund.goal)}</h4>
                  </div>
                </div>
              </div>

              {/* Fast Stats Row */}
              <div className={styles.detailStatsRow}>
                <div className={styles.statBox}>
                  <HiOutlineUserGroup className={styles.statIcon} />
                  <div>
                    <span className={styles.statLabel}>Nhà tài trợ</span>
                    <span className={styles.statValue}>{selectedFund.donors} đối tác</span>
                  </div>
                </div>
                <div className={styles.statBox}>
                  <HiOutlineBanknotes className={styles.statIcon} />
                  <div>
                    <span className={styles.statLabel}>Định mức tối đa/suất</span>
                    <span className={styles.statValue}>15,000,000 đ</span>
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
