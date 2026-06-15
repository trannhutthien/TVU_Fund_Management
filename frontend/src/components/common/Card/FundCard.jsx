import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineBuildingLibrary,
  HiOutlineUserCircle,
  HiOutlineCalendar,
} from 'react-icons/hi2';
import Button from '@components/common/Button';
import StatusBadge from '@components/common/StatusBadge';
import Logo from '@components/common/Logo';
import styles from './FundCard.module.scss';

/**
 * FundCard Component
 * 
 * Card hiển thị thông tin quỹ học bổng
 * Sử dụng các components có sẵn: Button, StatusBadge, Logo
 */
const FundCard = ({ fund }) => {
  const navigate = useNavigate();

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return null;
    const num = Math.round(Number(amount) || 0);
    return num.toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' đ';
  };

  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const isNearDeadline = (date) => {
    if (!date) return false;
    const diff = new Date(date) - new Date();
    return diff > 0 && diff <= 7 * 24 * 60 * 60 * 1000;
  };

  // Render support amount
  const renderSupportAmount = () => {
    const { so_tien_toi_thieu, so_tien_toi_da } = fund;

    if (so_tien_toi_thieu && so_tien_toi_da) {
      return `${formatCurrency(so_tien_toi_thieu)} – ${formatCurrency(so_tien_toi_da)}`;
    }
    if (so_tien_toi_da) {
      return `Lên đến ${formatCurrency(so_tien_toi_da)}`;
    }
    return 'Liên hệ để biết thêm';
  };

  // Check states
  const isPaused = fund.trang_thai === 'Tam dung';
  const isFull = fund.phan_tram_da_nhan >= 100;
  const nearDeadline = isNearDeadline(fund.han_nop_don);

  // Handlers
  const handleViewDetail = () => {
    navigate(`/quy/${fund.quy_id}`);
  };

  const handleRegister = () => {
    navigate(`/quy/${fund.quy_id}/dang-ky`);
  };

  return (
    <div className={`${styles.fundCard} ${isPaused ? styles.paused : ''}`}>
      {/* Fund Image/Logo */}
      <div className={styles.cardImage}>
        {fund.hinh_anh ? (
          <Logo
            size="custom"
            variant="image-only"
            imageVariant="rectangular"
            imageSrc={fund.hinh_anh}
            imageAlt={fund.ten_quy}
            className={styles.fundLogo}
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            <HiOutlineBuildingLibrary className={styles.placeholderIcon} />
          </div>
        )}
        <StatusBadge
          status="info"
          text={fund.loai_quy || 'HỌC BỔNG'}
          className={styles.fundTypeBadge}
        />
      </div>

      {/* Card Content */}
      <div className={styles.cardContent}>
        {/* Fund Name */}
        <h3 className={styles.fundName}>{fund.ten_quy}</h3>

        {/* Support Amount */}
        <div className={styles.supportAmount}>
          <div className={styles.supportLabel}>GIÁ TRỊ HỖ TRỢ</div>
          <div className={styles.supportValue}>{renderSupportAmount()}</div>
        </div>

        {/* Info Row */}
        {(fund.dieu_kien_tom_tat || fund.han_nop_don) && (
          <div className={styles.infoRow}>
            {fund.dieu_kien_tom_tat && (
              <div className={styles.infoItem}>
                <HiOutlineUserCircle className={styles.infoIcon} />
                <span className={styles.infoText}>{fund.dieu_kien_tom_tat}</span>
              </div>
            )}
            {fund.han_nop_don && (
              <div className={`${styles.infoItem} ${nearDeadline ? styles.deadline : ''}`}>
                <HiOutlineCalendar className={styles.infoIcon} />
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

        {/* Progress Section */}
        <div className={styles.progressSection}>
          {fund.so_luong_chi_tieu !== null ? (
            <>
              <div className={styles.progressHeader}>
                <div className={styles.balanceInfo}>
                  <span className={styles.balanceLabel}>Còn lại: </span>
                  <span className={styles.balanceValue}>
                    {formatCurrency(fund.so_du_thuc_te ?? fund.so_du)}
                  </span>
                </div>
                <div className={styles.percentValue}>{fund.phan_tram_da_nhan}%</div>
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
            <div className={styles.unlimitedText}>Không giới hạn suất</div>
          )}
        </div>

        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          <Button variant="ghost" size="md" onClick={handleViewDetail}>
            Xem chi tiết
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleRegister}
            disabled={isFull || isPaused}
          >
            {isFull ? 'Đã đủ suất' : isPaused ? 'Tạm dừng' : 'Đăng ký ngay'}
          </Button>
        </div>
      </div>

      {/* Paused Overlay */}
      {isPaused && (
        <div className={styles.pausedOverlay}>
          <StatusBadge status="processing" label="Tạm dừng" />
        </div>
      )}
    </div>
  );
};

FundCard.propTypes = {
  fund: PropTypes.shape({
    quy_id: PropTypes.number.isRequired,
    ten_quy: PropTypes.string.isRequired,
    loai_quy: PropTypes.string,
    hinh_anh: PropTypes.string,
    so_du: PropTypes.number,
    so_du_thuc_te: PropTypes.number, // Số dư thực tế sau khi trừ các khoản chờ giải ngân
    trang_thai: PropTypes.string,
    so_tien_toi_thieu: PropTypes.number,
    so_tien_toi_da: PropTypes.number,
    so_luong_chi_tieu: PropTypes.number,
    han_nop_don: PropTypes.string,
    dieu_kien_tom_tat: PropTypes.string,
    so_don_da_nop: PropTypes.number,
    phan_tram_da_nhan: PropTypes.number,
  }).isRequired,
};

export default FundCard;
