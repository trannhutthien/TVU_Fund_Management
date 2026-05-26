import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  HiOutlineFolderOpen,
  HiOutlineBuildingLibrary,
  HiOutlineUserCircle,
  HiOutlineCalendarDays,
} from 'react-icons/hi2';
import Button from '@components/common/Button';
import StatusBadge from '@components/common/StatusBadge';
import styles from './FundGridSection.module.scss';

// Helper functions
const formatCurrency = (amount) => {
  if (!amount) return null;
  return amount.toLocaleString('vi-VN') + 'đ';
};

const isNearDeadline = (date) => {
  if (!date) return false;
  const diff = new Date(date) - new Date();
  return diff > 0 && diff <= 7 * 24 * 60 * 60 * 1000;
};

const formatDate = (date) => {
  if (!date) return null;
  return new Date(date).toLocaleDateString('vi-VN');
};

/**
 * FundGridSection Component
 * 
 * Hiển thị danh sách quỹ dưới dạng grid
 * Bao gồm: Fund cards, loading state, empty state
 */
const FundGridSection = ({
  funds = [],
  loading = false,
}) => {
  const navigate = useNavigate();

  // Render giá trị hỗ trợ
  const renderSupportAmount = (fund) => {
    const { so_tien_toi_thieu, so_tien_toi_da } = fund;

    if (so_tien_toi_thieu && so_tien_toi_da) {
      return `${formatCurrency(so_tien_toi_thieu)} – ${formatCurrency(so_tien_toi_da)}`;
    }
    if (so_tien_toi_da) {
      return `Lên đến ${formatCurrency(so_tien_toi_da)}`;
    }
    return 'Liên hệ để biết thêm';
  };

  // Check if fund is full
  const isFundFull = (fund) => {
    return fund.phan_tram_da_nhan >= 100;
  };

  // Check if fund is paused
  const isFundPaused = (fund) => {
    return fund.trang_thai === 'Tam dung';
  };

  // Handle view detail
  const handleViewDetail = (quyId) => {
    navigate(`/quy/${quyId}`);
  };

  // Handle register
  const handleRegister = (quyId) => {
    navigate(`/quy/${quyId}/dang-ky`);
  };

  // Loading state - Skeleton cards
  if (loading) {
    return (
      <section className={styles.fundGridSection}>
        <div className={styles.container}>
          <div className={styles.grid}>
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className={styles.skeletonCard}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={styles.skeletonImage} />
                <div className={styles.skeletonContent}>
                  <div className={styles.skeletonTitle} />
                  <div className={styles.skeletonAmount} />
                  <div className={styles.skeletonText} />
                  <div className={styles.skeletonDivider} />
                  <div className={styles.skeletonProgress} />
                  <div className={styles.skeletonButtons}>
                    <div className={styles.skeletonButton} />
                    <div className={styles.skeletonButton} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (!funds || funds.length === 0) {
    return (
      <section className={styles.fundGridSection}>
        <div className={styles.container}>
          <div className={styles.emptyState}>
            <HiOutlineFolderOpen className={styles.emptyIcon} />
            <h3 className={styles.emptyTitle}>Không tìm thấy quỹ phù hợp</h3>
            <p className={styles.emptyText}>
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Fund cards
  return (
    <section className={styles.fundGridSection}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {funds.map((fund) => {
            const isPaused = isFundPaused(fund);
            const isFull = isFundFull(fund);
            const nearDeadline = isNearDeadline(fund.han_nop_don);

            return (
              <div
                key={fund.quy_id}
                className={`${styles.fundCard} ${isPaused ? styles.paused : ''}`}
              >
                {/* Khối 1: Ảnh bìa */}
                <div className={styles.cardImage}>
                  {fund.hinh_anh ? (
                    <img src={fund.hinh_anh} alt={fund.ten_quy} />
                  ) : (
                    <div className={styles.imagePlaceholder}>
                      <HiOutlineBuildingLibrary className={styles.placeholderIcon} />
                    </div>
                  )}
                  <span className={styles.fundTypeBadge}>
                    {fund.loai_quy || 'HỌC BỔNG'}
                  </span>
                </div>

                {/* Khối 2: Nội dung */}
                <div className={styles.cardContent}>
                  {/* Tên quỹ */}
                  <h3 className={styles.fundName}>{fund.ten_quy}</h3>

                  {/* Giá trị hỗ trợ */}
                  <div className={styles.supportAmount}>
                    <div className={styles.supportLabel}>GIÁ TRỊ HỖ TRỢ</div>
                    <div className={styles.supportValue}>
                      {renderSupportAmount(fund)}
                    </div>
                  </div>

                  {/* Điều kiện + Hạn nộp */}
                  {(fund.dieu_kien_tom_tat || fund.han_nop_don) && (
                    <div className={styles.infoRow}>
                      {fund.dieu_kien_tom_tat && (
                        <div className={styles.infoItem}>
                          <HiOutlineUserCircle className={styles.infoIcon} />
                          <span className={styles.infoText}>
                            {fund.dieu_kien_tom_tat}
                          </span>
                        </div>
                      )}
                      {fund.han_nop_don && (
                        <div
                          className={`${styles.infoItem} ${
                            nearDeadline ? styles.deadline : ''
                          }`}
                        >
                          <HiOutlineCalendarDays className={styles.infoIcon} />
                          <span className={styles.infoText}>
                            {nearDeadline && '⚠️ '}
                            {formatDate(fund.han_nop_don)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Divider */}
                  <div className={styles.divider} />

                  {/* Số dư + Tiến độ */}
                  <div className={styles.progressSection}>
                    {fund.so_luong_chi_tieu !== null ? (
                      <>
                        <div className={styles.progressHeader}>
                          <div className={styles.balanceInfo}>
                            <span className={styles.balanceLabel}>Còn lại: </span>
                            <span className={styles.balanceValue}>
                              {formatCurrency(fund.so_du)}
                            </span>
                          </div>
                          <div className={styles.percentValue}>
                            {fund.phan_tram_da_nhan}%
                          </div>
                        </div>
                        <div className={styles.progressBar}>
                          <div
                            className={`${styles.progressFill} ${
                              fund.phan_tram_da_nhan >= 80 ? styles.warning : ''
                            }`}
                            style={{ width: `${fund.phan_tram_da_nhan}%` }}
                          />
                        </div>
                        <div className={styles.progressText}>
                          {fund.so_don_da_nop} / {fund.so_luong_chi_tieu} suất đã nhận
                        </div>
                      </>
                    ) : (
                      <div className={styles.unlimitedText}>
                        Không giới hạn suất
                      </div>
                    )}
                  </div>

                  {/* 2 Buttons */}
                  <div className={styles.actionButtons}>
                    <Button
                      variant="ghost"
                      size="md"
                      onClick={() => handleViewDetail(fund.quy_id)}
                      className={styles.detailButton}
                    >
                      Xem chi tiết
                    </Button>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => handleRegister(fund.quy_id)}
                      disabled={isFull || isPaused}
                      className={styles.registerButton}
                    >
                      {isFull
                        ? 'Đã đủ suất'
                        : isPaused
                        ? 'Tạm dừng nhận đơn'
                        : 'Đăng ký ngay'}
                    </Button>
                  </div>
                </div>

                {/* Overlay cho trạng thái tạm dừng */}
                {isPaused && (
                  <div className={styles.pausedOverlay}>
                    <StatusBadge status="processing" label="Tạm dừng" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

FundGridSection.propTypes = {
  funds: PropTypes.arrayOf(
    PropTypes.shape({
      quy_id: PropTypes.number.isRequired,
      ten_quy: PropTypes.string.isRequired,
      loai_quy: PropTypes.string,
      hinh_anh: PropTypes.string,
      mo_ta: PropTypes.string,
      so_du: PropTypes.number,
      trang_thai: PropTypes.string,
      so_tien_toi_thieu: PropTypes.number,
      so_tien_toi_da: PropTypes.number,
      so_luong_chi_tieu: PropTypes.number,
      han_nop_don: PropTypes.string,
      dieu_kien_tom_tat: PropTypes.string,
      so_don_da_nop: PropTypes.number,
      phan_tram_da_nhan: PropTypes.number,
    })
  ),
  loading: PropTypes.bool,
};

export default FundGridSection;
