import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineBuildingLibrary,
  HiOutlineXMark,
  HiOutlineClipboardDocumentCheck,
} from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import StatusBadge from '@components/common/StatusBadge/StatusBadge';
import styles from './QuyDetailDrawer.module.scss';

const LOAI_QUY_LABEL = {
  'Tu thien': 'Từ thiện',
  'Hoc bong': 'Học bổng',
  'Y te': 'Y tế',
  'Moi truong': 'Môi trường',
  'Khac': 'Khác',
};

const formatCurrency = (value) => {
  const n = Number(value || 0);
  return `${n.toLocaleString('vi-VN')}đ`;
};

const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('vi-VN');
};

const formatDateTime = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return `${d.toLocaleDateString('vi-VN')} ${d.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
};

const daysUntil = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const diff = d.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const mapStatusToBadge = (trangThai) => {
  if (trangThai === 'Dang hoat dong') return 'approved';
  if (trangThai === 'Tam dung') return 'processing';
  if (trangThai === 'Da dong') return 'cancelled';
  return 'pending';
};

const formatGiaTriHoTro = (fund) => {
  const min = fund?.soTienToiThieu;
  const max = fund?.soTienToiDa;
  if (min && max) {
    return `${formatCurrency(min)} – ${formatCurrency(max)}`;
  }
  if (max) return `Lên đến ${formatCurrency(max)}`;
  if (min) return `Từ ${formatCurrency(min)}`;
  return 'Không quy định';
};

const QuyDetailDrawer = ({ fund, onClose }) => {
  const navigate = useNavigate();
  const isOpen = !!fund;

  // Lock body scroll khi mở Drawer + đóng bằng ESC
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handleEsc);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const daysLeft = daysUntil(fund.hanNopDon);
  const isUrgent = daysLeft !== null && daysLeft >= 0 && daysLeft <= 7;

  const handleGoToXetDuyet = () => {
    navigate(`/can-bo/xet-duyet?quy_id=${fund.quyId}`);
    onClose?.();
  };

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <aside className={styles.drawer} role="dialog" aria-label="Chi tiết quỹ">
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>Chi tiết Quỹ</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            leftIcon={<HiOutlineXMark />}
            aria-label="Đóng"
          >
            Đóng
          </Button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {/* Cover */}
          <div className={styles.cover}>
            {fund.hinhAnh ? (
              <img
                src={fund.hinhAnh}
                alt={fund.tenQuy}
                className={styles.coverImg}
              />
            ) : (
              <div className={styles.coverPlaceholder}>
                <HiOutlineBuildingLibrary className={styles.coverIcon} />
              </div>
            )}
          </div>

          {/* Name + badges */}
          <div className={styles.titleRow}>
            <h3 className={styles.fundName}>{fund.tenQuy}</h3>
            <div className={styles.badgeRow}>
              <span className={styles.loaiBadge}>
                {LOAI_QUY_LABEL[fund.loaiQuy] || fund.loaiQuy}
              </span>
              <StatusBadge
                status={mapStatusToBadge(fund.trangThai)}
                size="sm"
              />
            </div>
          </div>

          {/* Grid info */}
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>Số dư hiện tại</div>
              <div className={`${styles.infoValue} ${styles.balanceValue}`}>
                {formatCurrency(fund.soDu)}
              </div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>Hạn nộp đơn</div>
              <div
                className={`${styles.infoValue} ${
                  isUrgent ? styles.urgent : ''
                }`}
              >
                {fund.hanNopDon ? (
                  isUrgent ? (
                    <>⚠️ Còn {daysLeft} ngày</>
                  ) : (
                    formatDate(fund.hanNopDon)
                  )
                ) : (
                  'Không giới hạn'
                )}
              </div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>Giá trị hỗ trợ</div>
              <div className={styles.infoValue}>{formatGiaTriHoTro(fund)}</div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>Số suất</div>
              <div className={styles.infoValue}>
                {fund.soLuongChiTieu != null
                  ? `${fund.soLuongChiTieu} suất`
                  : 'Không giới hạn'}
              </div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>Ngày tạo</div>
              <div className={styles.infoValue}>
                {formatDate(fund.ngayTao)}
              </div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>Cập nhật lần cuối</div>
              <div className={styles.infoValue}>
                {formatDateTime(fund.ngayCapNhat)}
              </div>
            </div>
          </div>

          {/* Điều kiện tóm tắt */}
          {fund.dieuKienTomTat && (
            <div className={styles.dieuKienBox}>
              <div className={styles.dieuKienLabel}>ĐIỀU KIỆN</div>
              <div className={styles.dieuKienText}>{fund.dieuKienTomTat}</div>
            </div>
          )}

          {/* Mô tả */}
          {fund.moTa && (
            <div className={styles.moTaBlock}>
              <div className={styles.moTaLabel}>MÔ TẢ</div>
              <p className={styles.moTaText}>{fund.moTa}</p>
            </div>
          )}
        </div>

        {/* Footer action */}
        <div className={styles.footer}>
          <Button
            variant="primary"
            size="md"
            leftIcon={<HiOutlineClipboardDocumentCheck />}
            onClick={handleGoToXetDuyet}
            className={styles.actionBtn}
          >
            Xem đơn đang xử lý của quỹ này
          </Button>
        </div>
      </aside>
    </>
  );
};

export default QuyDetailDrawer;
