import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineBuildingLibrary,
  HiOutlineXMark,
  HiOutlineClipboardDocumentCheck,
  HiOutlinePauseCircle,
  HiOutlineXCircle,
  HiOutlinePlayCircle,
  HiOutlinePencilSquare,
} from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import StatusBadge from '@components/common/StatusBadge/StatusBadge';
import { updateFundStatus } from '@services/fundService';
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

const QuyDetailDrawer = ({ fund, onClose, onStatusUpdated, loaiQuyList = [] }) => {
  const navigate = useNavigate();
  const isOpen = !!fund;
  const [updating, setUpdating] = useState(false);

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

  const handleEditFund = () => {
    const parentPath = window.location.pathname.startsWith('/admin') ? '/admin/quy' : '/can-bo/quy';
    navigate(`${parentPath}/sua/${fund.quyId}`);
    onClose?.();
  };

  // Handler cập nhật trạng thái quỹ
  const handleUpdateStatus = async (newStatus) => {
    const confirmMessages = {
      'Tam dung': 'Bạn có chắc muốn TẠM DỪNG quỹ này? Quỹ sẽ không hiển thị trên trang công khai nhưng vẫn có thể kích hoạt lại.',
      'Da dong': 'Bạn có chắc muốn ĐÓNG quỹ này? Quỹ sẽ không hiển thị trên trang công khai và không thể kích hoạt lại.',
      'Dang hoat dong': 'Bạn có chắc muốn KÍCH HOẠT LẠI quỹ này? Quỹ sẽ hiển thị trên trang công khai.',
    };

    if (!window.confirm(confirmMessages[newStatus])) {
      return;
    }

    try {
      setUpdating(true);
      await updateFundStatus(fund.quyId, newStatus);
      
      // Thông báo thành công
      alert('Cập nhật trạng thái quỹ thành công!');
      
      // Callback để refresh danh sách
      onStatusUpdated?.();
      
      // Đóng drawer
      onClose?.();
    } catch (error) {
      console.error('Error updating fund status:', error);
      alert('Có lỗi xảy ra khi cập nhật trạng thái quỹ. Vui lòng thử lại.');
    } finally {
      setUpdating(false);
    }
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
                {(() => {
                  const found = loaiQuyList.find((item) => item.maLoai === fund.loaiQuy);
                  return found ? found.tenLoai : LOAI_QUY_LABEL[fund.loaiQuy] || fund.loaiQuy;
                })()}
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
              <div className={styles.infoLabel}>Hình thức vận hành</div>
              <div className={styles.infoValue}>
                {fund.loaiDieuHanh === 'Tap trung - Muc chi'
                  ? 'Mục chi con'
                  : 'Quỹ chung (Bể lớn)'}
              </div>
            </div>

            {fund.loaiDieuHanh === 'Tap trung - Muc chi' && fund.tenQuyCha && (
              <div className={styles.infoItem}>
                <div className={styles.infoLabel}>Thuộc bể tiền chung</div>
                <div className={styles.infoValue} style={{ color: '#2563eb', fontWeight: 600 }}>
                  {fund.tenQuyCha}
                </div>
              </div>
            )}

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
          {/* Buttons quản lý trạng thái */}
          <div className={styles.statusActions}>
            {fund.trangThai === 'Dang hoat dong' && (
              <>
                <Button
                  variant="warning"
                  size="md"
                  leftIcon={<HiOutlinePauseCircle />}
                  onClick={() => handleUpdateStatus('Tam dung')}
                  disabled={updating}
                  className={styles.statusBtn}
                >
                  {updating ? 'Đang xử lý...' : 'Tạm dừng'}
                </Button>
                <Button
                  variant="danger"
                  size="md"
                  leftIcon={<HiOutlineXCircle />}
                  onClick={() => handleUpdateStatus('Da dong')}
                  disabled={updating}
                  className={styles.statusBtn}
                >
                  {updating ? 'Đang xử lý...' : 'Đóng quỹ'}
                </Button>
              </>
            )}
            
            {fund.trangThai === 'Tam dung' && (
              <>
                <Button
                  variant="success"
                  size="md"
                  leftIcon={<HiOutlinePlayCircle />}
                  onClick={() => handleUpdateStatus('Dang hoat dong')}
                  disabled={updating}
                  className={styles.statusBtn}
                >
                  {updating ? 'Đang xử lý...' : 'Kích hoạt lại'}
                </Button>
                <Button
                  variant="danger"
                  size="md"
                  leftIcon={<HiOutlineXCircle />}
                  onClick={() => handleUpdateStatus('Da dong')}
                  disabled={updating}
                  className={styles.statusBtn}
                >
                  {updating ? 'Đang xử lý...' : 'Đóng quỹ'}
                </Button>
              </>
            )}
            
            {fund.trangThai === 'Da dong' && (
              <div className={styles.closedNote}>
                Quỹ đã đóng. Không thể thay đổi trạng thái.
              </div>
            )}
          </div>
          
          {fund.trangThai !== 'Da dong' && (
            <Button
              variant="secondary"
              size="md"
              leftIcon={<HiOutlinePencilSquare />}
              onClick={handleEditFund}
              className={styles.actionBtn}
              disabled={updating}
            >
              Chỉnh sửa thông tin
            </Button>
          )}
          
          <Button
            variant="primary"
            size="md"
            leftIcon={<HiOutlineClipboardDocumentCheck />}
            onClick={handleGoToXetDuyet}
            className={styles.actionBtn}
            disabled={updating}
          >
            Xem đơn đang xử lý của quỹ này
          </Button>
        </div>
      </aside>
    </>
  );
};

export default QuyDetailDrawer;
