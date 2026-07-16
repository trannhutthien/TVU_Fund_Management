import { useState, useEffect } from 'react';
import { HiPaperClip, HiArrowDownTray, HiDocumentArrowDown } from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import CloseButton from '@components/common/CloseButton';
import CurrencyInput from '@components/common/CurrencyInput';
import { formatCurrency, formatDateTime } from '@utils/formatters';
import styles from './DSDetailDrawer.module.scss';

// ═══════════════════════════════════════════════════════════════════════════════
// ─── DS DETAIL DRAWER ──────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
// CÔNG DỤNG: Drawer chi tiết giao dịch với panel hành động đối soát
// ═══════════════════════════════════════════════════════════════════════════════

const DSDetailDrawer = ({
  giaoDich,
  onClose,
  onDoiSoat,
  onGanCo,
  isSubmitting,
  activeTab,
  onExportSingle,
}) => {
  const [soTienThucTe, setSoTienThucTe] = useState('');
  const [ghiChu, setGhiChu] = useState('');
  const [chenhLech, setChenhLech] = useState(null);

  // ─── INIT DATA ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (giaoDich.so_tien_thuc_te) {
      setSoTienThucTe(giaoDich.so_tien_thuc_te.toString());
    }
    if (giaoDich.doi_soat_ghi_chu) {
      setGhiChu(giaoDich.doi_soat_ghi_chu);
    }
  }, [giaoDich]);

  // ─── CALCULATE CHENH LECH ──────────────────────────────────────────────────
  useEffect(() => {
    if (soTienThucTe && !isNaN(soTienThucTe)) {
      const thucTe = parseFloat(soTienThucTe);
      const heTh = giaoDich.so_tien;
      setChenhLech(thucTe - heTh);
    } else {
      setChenhLech(null);
    }
  }, [soTienThucTe, giaoDich.so_tien]);

  // ─── HANDLERS ──────────────────────────────────────────────────────────────
  const handleXacNhanDoiSoat = () => {
    onDoiSoat({
      transaction_id: giaoDich.transaction_id,
      so_tien_thuc_te: parseFloat(soTienThucTe) || null,
      ghi_chu: ghiChu,
    });
  };

  const handleGanCoBatThuong = () => {
    const lyDo = prompt('Nhập lý do bất thường:');
    if (lyDo) {
      onGanCo({
        transaction_id: giaoDich.transaction_id,
        ghi_chu: lyDo,
      });
    }
  };

  // ─── CHECK CAN SUBMIT ──────────────────────────────────────────────────────
  const canSubmit =
    (soTienThucTe && !isNaN(soTienThucTe)) || giaoDich.minh_chung_url;

  const isDaDoiSoat = giaoDich.doi_soat_trang_thai === 'Da_doi_soat';
  const isBatThuong = giaoDich.doi_soat_trang_thai === 'Bat_thuong';
  const canEditDoiSoat = activeTab === 'can_doi_soat';

  // ─── RENDER BANNER ─────────────────────────────────────────────────────────
  const renderBanner = () => {
    if (isDaDoiSoat) {
      return (
        <div className={`${styles.banner} ${styles.bannerSuccess}`}>
          <span className={styles.bannerIcon}>✓</span>
          <span className={styles.bannerText}>
            Đã đối soát bởi {giaoDich.doi_soat_boi_ten || 'Kế toán'} lúc{' '}
            {giaoDich.doi_soat_luc
              ? formatDateTime(giaoDich.doi_soat_luc)
              : '—'}
          </span>
        </div>
      );
    }

    if (isBatThuong) {
      return (
        <div className={`${styles.banner} ${styles.bannerDanger}`}>
          <span className={styles.bannerIcon}>⚠</span>
          <span className={styles.bannerText}>
            Phát hiện bất thường — {giaoDich.doi_soat_ghi_chu || 'Không có ghi chú'}
          </span>
        </div>
      );
    }

    return (
      <div className={`${styles.banner} ${styles.bannerWarning}`}>
        <span className={styles.bannerIcon}>⏳</span>
        <span className={styles.bannerText}>Chưa được đối soát</span>
      </div>
    );
  };

  // ─── RENDER CHENH LECH ─────────────────────────────────────────────────────
  const renderChenhLech = () => {
    if (chenhLech === null) return null;

    if (chenhLech === 0) {
      return (
        <div className={styles.chenhLechSuccess}>
          ✓ Khớp
        </div>
      );
    }

    return (
      <div className={styles.chenhLechDanger}>
        ⚠ Lệch {formatCurrency(Math.abs(chenhLech))}
      </div>
    );
  };

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Overlay */}
      <div className={styles.overlay} onClick={onClose} />

      {/* Drawer */}
      <div className={styles.drawer}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h3 className={styles.title}>Đối soát giao dịch</h3>
            <p className={styles.subtitle}>Mã GD: {giaoDich.transaction_id}</p>
          </div>
          <CloseButton
            onClick={onClose}
            variant="light"
            size="md"
            className={styles.closeButton}
          />
        </div>

        {/* Body */}
        <div className={styles.body}>
          {/* Banner */}
          {renderBanner()}

          {/* Thông tin giao dịch */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>THÔNG TIN GIAO DỊCH</h4>
            <div className={styles.infoCard}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Loại:</span>
                <span className={styles.infoValue}>{giaoDich.loai}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Số tiền:</span>
                <span className={styles.infoValue}>
                  {formatCurrency(giaoDich.so_tien)}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Quỹ:</span>
                <span className={styles.infoValue}>{giaoDich.ten_quy}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Đối tượng:</span>
                <span className={styles.infoValue}>
                  {giaoDich.ho_ten || giaoDich.ten_nha_tai_tro || '—'}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Ngày giao dịch:</span>
                <span className={styles.infoValue}>
                  {new Date(giaoDich.ngay_giao_dich).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
          </div>

          {/* Minh chứng */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>MINH CHỨNG</h4>
            {giaoDich.minh_chung_url ? (
              <div className={styles.proofCard}>
                <HiPaperClip size={20} />
                <span>Có chứng từ đính kèm</span>
                <a
                  href={giaoDich.minh_chung_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.proofLink}
                >
                  <HiArrowDownTray size={16} />
                  Tải xuống
                </a>
              </div>
            ) : (
              <div className={styles.proofMissing}>
                <span className={styles.proofMissingIcon}>⚠</span>
                <span className={styles.proofMissingText}>
                  Chứng từ bị thiếu — Click để tải lên
                </span>
              </div>
            )}
          </div>

          {/* Kiểm tra số tiền */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>KIỂM TRA SỐ TIỀN</h4>
            <div className={styles.checkCard}>
              <div className={styles.checkRow}>
                <span className={styles.checkLabel}>Số tiền hệ thống:</span>
                <span className={styles.checkValue}>
                  {formatCurrency(giaoDich.so_tien)}
                </span>
              </div>
              <div className={styles.checkRow}>
                <span className={styles.checkLabel}>Số tiền thực tế:</span>
                <CurrencyInput
                  value={soTienThucTe}
                  onChange={(raw) => setSoTienThucTe(raw)}
                  className={styles.checkInput}
                  placeholder="Nhập số tiền thực tế trên sao kê"
                  disabled={!canEditDoiSoat}
                />
              </div>
              {renderChenhLech()}
            </div>
          </div>

          {/* Ghi chú */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>GHI CHÚ ĐỐI SOÁT</h4>
            <textarea
              className={styles.textarea}
              rows={3}
              value={ghiChu}
              onChange={(e) => setGhiChu(e.target.value)}
              placeholder="Ghi chú xác nhận hoặc mô tả bất thường..."
              disabled={!canEditDoiSoat}
            />
          </div>

          {/* Lịch sử audit */}
          {giaoDich.doi_soat_luc && (
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>LỊCH SỬ XỬ LÝ</h4>
              <div className={styles.timeline}>
                <div className={styles.timelineItem}>
                  <div className={styles.timelineDot} />
                  <div className={styles.timelineContent}>
                    {giaoDich.doi_soat_boi_ten || 'Kế toán'} — Đánh dấu đã đối soát —{' '}
                    {formatDateTime(giaoDich.doi_soat_luc)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          {!canEditDoiSoat ? (
            <div className={styles.footerInfo}>
              <span className={styles.footerInfoText}>
                {isDaDoiSoat
                  ? `Đã đối soát bởi ${giaoDich.doi_soat_boi_ten || 'Kế toán'} — ${
                      giaoDich.doi_soat_luc
                        ? new Date(giaoDich.doi_soat_luc).toLocaleDateString('vi-VN')
                        : '—'
                    }`
                  : 'Đang xem chi tiết chứng từ bất thường'}
              </span>
              <div className={styles.footerInfoActions}>
                <Button
                  variant="secondary"
                  onClick={() => onExportSingle?.(giaoDich)}
                  leftIcon={<HiDocumentArrowDown />}
                >
                  Xuất Excel
                </Button>
                <Button variant="ghost" onClick={onClose}>
                  Đóng
                </Button>
              </div>
            </div>
          ) : (
            <div className={styles.footerActions}>
              <Button
                variant="secondary"
                onClick={() => onExportSingle?.(giaoDich)}
                leftIcon={<HiDocumentArrowDown />}
                disabled={isSubmitting}
              >
                Xuất Excel
              </Button>
              <Button
                variant="outline-danger"
                onClick={handleGanCoBatThuong}
                disabled={isSubmitting}
              >
                Gắn cờ bất thường
              </Button>
              <Button
                variant="success"
                onClick={handleXacNhanDoiSoat}
                disabled={!canSubmit || isSubmitting}
                loading={isSubmitting}
              >
                Xác nhận đã đối soát
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DSDetailDrawer;
