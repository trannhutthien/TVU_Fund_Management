import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  HiOutlineArrowsRightLeft,
  HiOutlineXMark,
  HiOutlineBuildingOffice2,
  HiOutlinePhoto,
  HiOutlineDocumentText,
  HiOutlineArrowDownTray,
  HiOutlineMagnifyingGlassPlus,
} from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import styles from './GiaoDichDetailDrawer.module.scss';

const formatCurrency = (n) => Number(n || 0).toLocaleString('vi-VN') + ' đ';
const formatDateTime = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const STATUS_LABEL = {
  'Thanh cong': 'Thành công',
  'Cho xu ly': 'Chờ xử lý',
  'That bai': 'Thất bại',
  'Hoan tien': 'Hoàn tiền',
};

const isImage = (url) => /\.(jpe?g|png|gif|webp)$/i.test(url || '');
const isPdf = (url) => /\.pdf$/i.test(url || '');

const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : '?');

const resolveUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const base =
    import.meta.env.VITE_BACKEND_URL ||
    (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace(
      /\/api\/?$/,
      '',
    );
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
};

const GiaoDichDetailDrawer = ({ giaoDich, onClose }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Đóng drawer khi nhấn ESC
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        if (lightboxOpen) setLightboxOpen(false);
        else onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, lightboxOpen]);

  const tx = giaoDich;
  const isThu = tx.loai === 'Thu';
  const minhChungUrl = tx.minhChung ? resolveUrl(tx.minhChung) : null;
  const minhChungIsImg = isImage(tx.minhChung);
  const minhChungIsPdf = isPdf(tx.minhChung);

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <aside
        className={styles.drawer}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Chi tiết giao dịch"
      >
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerTitle}>
              <HiOutlineArrowsRightLeft
                size={18}
                className={styles.headerIcon}
              />
              <h2>Chi tiết giao dịch</h2>
            </div>
            <div className={styles.headerCode}>#GD{tx.transactionId}</div>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Đóng"
          >
            <HiOutlineXMark size={22} />
          </button>
        </header>

        {/* Body */}
        <div className={styles.body}>
          {/* Khối A — Tổng quan */}
          <div
            className={`${styles.overviewCard} ${
              isThu ? styles.overviewThu : styles.overviewChi
            }`}
          >
            <div className={styles.overviewBadges}>
              <span className={styles.overviewBadge}>
                {isThu ? '↑ Thu vào' : '↓ Chi ra'}
              </span>
              <span className={styles.overviewBadge}>
                {STATUS_LABEL[tx.trangThai] || tx.trangThai}
              </span>
            </div>
            <div className={styles.overviewAmount}>
              {formatCurrency(tx.soTien)}
            </div>
            <div className={styles.overviewFund}>
              {tx.quy?.tenQuy || '—'}
            </div>
            <div className={styles.overviewDate}>
              {formatDateTime(tx.ngayGiaoDich)}
            </div>
          </div>

          {/* Khối B — Đối tượng giao dịch */}
          <section className={styles.block}>
            <div className={styles.blockLabel}>ĐỐI TƯỢNG GIAO DỊCH</div>

            {isThu ? (
              tx.khoanTaiTro?.nhaTaiTro ? (
                <div className={styles.donorCard}>
                  <div className={styles.donorIcon}>
                    <HiOutlineBuildingOffice2 size={22} />
                  </div>
                  <div className={styles.donorInfo}>
                    <div className={styles.donorName}>
                      {tx.khoanTaiTro.nhaTaiTro.ten}
                    </div>
                    <div className={styles.donorSub}>
                      {tx.khoanTaiTro.nhaTaiTro.loai || 'Nhà tài trợ'}
                    </div>
                    {tx.khoanTaiTro?.id && (
                      <div className={styles.donorMeta}>
                        Mã khoản tài trợ: #{tx.khoanTaiTro.id}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className={styles.emptyTarget}>
                  Không có thông tin nhà tài trợ
                </div>
              )
            ) : tx.sinhVien ? (
              <div className={styles.studentCard}>
                <div className={styles.studentAvatar}>
                  <span>{getInitial(tx.sinhVien.hoTen)}</span>
                </div>
                <div className={styles.studentInfo}>
                  <div className={styles.studentName}>
                    {tx.sinhVien.hoTen}
                  </div>
                  <div className={styles.studentMeta}>
                    {tx.sinhVien.maSoDinhDanh || '—'}
                    {tx.sinhVien.khoaPhong &&
                      ` · ${tx.sinhVien.khoaPhong}`}
                  </div>
                  {tx.sinhVien.tieuDeDon && (
                    <div className={styles.studentRequest}>
                      Đơn: {tx.sinhVien.tieuDeDon}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className={styles.emptyTarget}>
                Không có thông tin sinh viên
              </div>
            )}
          </section>

          {/* Khối C — Chi tiết kỹ thuật */}
          <section className={styles.block}>
            <div className={styles.blockLabel}>CHI TIẾT GIAO DỊCH</div>
            <div className={styles.metaGrid}>
              <div className={styles.metaItem}>
                <div className={styles.metaLabel}>Mã giao dịch</div>
                <div className={styles.metaValue}>#GD{tx.transactionId}</div>
              </div>
              <div className={styles.metaItem}>
                <div className={styles.metaLabel}>Loại</div>
                <div className={styles.metaValue}>
                  {isThu ? 'Thu vào' : 'Chi ra'}
                </div>
              </div>
              <div className={styles.metaItem}>
                <div className={styles.metaLabel}>Quỹ liên quan</div>
                <div className={styles.metaValue}>
                  {tx.quy?.tenQuy || '—'}
                </div>
              </div>
              <div className={styles.metaItem}>
                <div className={styles.metaLabel}>Trạng thái</div>
                <div className={styles.metaValue}>
                  {STATUS_LABEL[tx.trangThai] || tx.trangThai}
                </div>
              </div>
              <div className={styles.metaItem}>
                <div className={styles.metaLabel}>Người tạo</div>
                <div className={styles.metaValue}>
                  {tx.nguoiTao?.hoTen || '—'}
                </div>
              </div>
              <div className={styles.metaItem}>
                <div className={styles.metaLabel}>Ngày tạo</div>
                <div className={styles.metaValue}>
                  {formatDateTime(tx.ngayGiaoDich)}
                </div>
              </div>
              {tx.ghiChu && (
                <div className={`${styles.metaItem} ${styles.metaItemFull}`}>
                  <div className={styles.metaLabel}>Ghi chú</div>
                  <div className={styles.metaValue}>{tx.ghiChu}</div>
                </div>
              )}
            </div>
          </section>

          {/* Khối D — Minh chứng */}
          <section className={styles.block}>
            <div className={styles.blockLabel}>MINH CHỨNG CHUYỂN KHOẢN</div>

            {!minhChungUrl ? (
              <div className={styles.proofEmpty}>
                <HiOutlinePhoto size={28} className={styles.proofEmptyIcon} />
                <span>Không có minh chứng</span>
              </div>
            ) : minhChungIsImg ? (
              <div className={styles.proofImageWrap}>
                <img
                  src={minhChungUrl}
                  alt="Minh chứng chuyển khoản"
                  className={styles.proofImage}
                  onClick={() => setLightboxOpen(true)}
                />
                <button
                  type="button"
                  className={styles.proofZoomBtn}
                  onClick={() => setLightboxOpen(true)}
                >
                  <HiOutlineMagnifyingGlassPlus size={14} />
                  Xem toàn màn hình
                </button>
              </div>
            ) : minhChungIsPdf ? (
              <a
                href={minhChungUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.proofPdf}
              >
                <HiOutlineDocumentText size={20} />
                <span className={styles.proofPdfName}>
                  {tx.minhChung.split('/').pop()}
                </span>
                <HiOutlineArrowDownTray size={16} />
              </a>
            ) : (
              <a
                href={minhChungUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.proofPdf}
              >
                <HiOutlineDocumentText size={20} />
                <span className={styles.proofPdfName}>
                  Tải xuống minh chứng
                </span>
                <HiOutlineArrowDownTray size={16} />
              </a>
            )}
          </section>
        </div>

        {/* Footer */}
        <footer className={styles.footer}>
          <Button variant="ghost" onClick={onClose} className={styles.closeBtnFooter}>
            Đóng
          </Button>
        </footer>
      </aside>

      {/* Lightbox */}
      {lightboxOpen && minhChungIsImg && (
        <div
          className={styles.lightbox}
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            className={styles.lightboxClose}
            onClick={() => setLightboxOpen(false)}
            aria-label="Đóng"
          >
            <HiOutlineXMark size={28} />
          </button>
          <img
            src={minhChungUrl}
            alt="Minh chứng phóng to"
            className={styles.lightboxImage}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

GiaoDichDetailDrawer.propTypes = {
  giaoDich: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default GiaoDichDetailDrawer;
