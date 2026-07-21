import PropTypes from 'prop-types';
import {
  HiOutlineDocumentText,
  HiOutlinePaperClip,
  HiOutlineArrowDownTray,
  HiOutlineCurrencyDollar,
  HiOutlineTag,
  HiOutlineDocument,
  HiOutlineFolderOpen,
} from 'react-icons/hi2';
import { formatCurrency } from '@utils/formatters';
import { LOAI_HO_TRO_LABELS } from '@constants/loaiHoTro';
import styles from './RequestInfoCard.module.scss';

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|bmp|svg)$/i;
const PDF_EXT = /\.pdf$/i;

const getFileName = (url) => {
  if (!url) return 'file';
  try {
    const u = new URL(url, window.location.origin);
    const segments = u.pathname.split('/').filter(Boolean);
    return decodeURIComponent(segments[segments.length - 1] || 'file');
  } catch {
    const parts = String(url).split('/').filter(Boolean);
    return parts[parts.length - 1] || 'file';
  }
};

const LOAI_HO_TRO_STYLES = {
  'Tai tro khong hoan lai': { className: styles.badgeGreen, icon: '🎓', color: '#16a34a' },
  'Tai tro co thu hoi': { className: styles.badgeOrange, icon: '🔄', color: '#d97706' },
  'Cho vay': { className: styles.badgeRed, icon: '💰', color: '#dc2626' },
};

const RequestInfoCard = ({
  tieuDe,
  moTa,
  soTienYeuCau,
  loaiHoTro,
  tongKinhPhiDuAn,
  quy,
  files,
  onPreviewFile,
}) => {
  const tenQuy = quy?.tenQuy || '—';
  const loaiQuy = quy?.loaiQuy || '';
  const loaiHoTroLabel = LOAI_HO_TRO_LABELS[loaiHoTro] || loaiHoTro || '—';
  const loaiStyle = LOAI_HO_TRO_STYLES[loaiHoTro] || {};

  return (
    <section className={styles.card}>
      {/* ── Banner header ── */}
      <div className={styles.banner}>
        <div className={styles.bannerOverlay} />
        <div className={styles.bannerContent}>
          <div className={styles.bannerTop}>
            <div className={styles.bannerTitle}>
              <HiOutlineFolderOpen className={styles.bannerIcon} />
              <span>Nội dung đề nghị</span>
            </div>
            <div className={styles.bannerAmount}>
              <HiOutlineCurrencyDollar className={styles.amountIcon} />
              <span>{formatCurrency(soTienYeuCau)}</span>
            </div>
          </div>
          <div className={styles.bannerFundName}>{tenQuy}</div>
          {loaiQuy && <span className={styles.loaiQuyBadge}>{loaiQuy}</span>}
        </div>
      </div>

      <div className={styles.body}>
        {/* ── Meta row: Loại hỗ trợ + Tổng kinh phí ── */}
        <div className={styles.metaRow}>
          <div className={styles.metaItem}>
            <HiOutlineTag className={styles.metaIcon} />
            <div className={styles.metaInfo}>
              <span className={styles.metaLabel}>Loại hỗ trợ</span>
              <span className={`${styles.metaBadge} ${loaiStyle.className || ''}`}>
                {loaiHoTroLabel}
              </span>
            </div>
          </div>

          {tongKinhPhiDuAn > 0 && (
            <div className={styles.metaItem}>
              <HiOutlineCurrencyDollar className={styles.metaIcon} />
              <div className={styles.metaInfo}>
                <span className={styles.metaLabel}>Tổng kinh phí dự án</span>
                <span className={styles.metaValue}>{formatCurrency(tongKinhPhiDuAn)}</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Tiêu đề đơn ── */}
        <div className={styles.field}>
          <div className={styles.fieldLabel}>Tiêu đề đơn</div>
          <div className={styles.fieldTitle}>{tieuDe || '—'}</div>
        </div>

        {/* ── Lý do & Hoàn cảnh ── */}
        {moTa && (
          <div className={styles.field}>
            <div className={styles.fieldLabel}>Lý do &amp; Hoàn cảnh</div>
            <div className={styles.reasonBox}>{moTa}</div>
          </div>
        )}

        {/* ── Divider ── */}
        <div className={styles.divider} />

        {/* ── Hồ sơ đính kèm ── */}
        <div className={styles.attachHeader}>
          <HiOutlineDocumentText className={styles.attachIcon} />
          <span className={styles.attachTitle}>Hồ sơ đính kèm</span>
          {files.length > 0 && (
            <span className={styles.attachCount}>{files.length} file</span>
          )}
        </div>

        {files.length === 0 ? (
          <div className={styles.attachEmpty}>Không có file đính kèm</div>
        ) : (
          <div className={styles.fileGrid}>
            {files.map((url, idx) => {
              const name = getFileName(url);
              const isImage = IMAGE_EXT.test(name);
              const isPdf = PDF_EXT.test(name);
              const ext = name.split('.').pop()?.toUpperCase() || 'FILE';

              if (isImage) {
                return (
                  <div key={`${url}-${idx}`} className={styles.fileItemWrap}>
                    <button
                      type="button"
                      className={styles.fileItem}
                      onClick={() => onPreviewFile?.(url)}
                    >
                      <div className={styles.thumbWrap}>
                        <img src={url} alt={name} className={styles.thumb} />
                      </div>
                      <div className={styles.fileMeta}>
                        <div className={styles.fileName} title={name}>{name}</div>
                        <div className={styles.fileExt}>{ext}</div>
                      </div>
                    </button>
                    <a
                      href={url}
                      download={name}
                      className={styles.downloadBtn}
                      title="Tải xuống"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <HiOutlineArrowDownTray />
                    </a>
                  </div>
                );
              }

              return (
                <div key={`${url}-${idx}`} className={styles.fileItemWrap}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.fileItem}
                  >
                    <div className={`${styles.docBox} ${isPdf ? styles.docPdf : styles.docOther}`}>
                      {isPdf ? (
                        <HiOutlineDocumentText className={styles.docIcon} />
                      ) : (
                        <HiOutlinePaperClip className={styles.docIcon} />
                      )}
                      <span className={styles.docExt}>{isPdf ? 'PDF' : ext}</span>
                    </div>
                    <div className={styles.fileMeta}>
                      <div className={styles.fileName} title={name}>{name}</div>
                    </div>
                  </a>
                  <a
                    href={url}
                    download={name}
                    className={styles.downloadBtn}
                    title="Tải xuống"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <HiOutlineArrowDownTray />
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

RequestInfoCard.propTypes = {
  tieuDe: PropTypes.string,
  moTa: PropTypes.string,
  soTienYeuCau: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  loaiHoTro: PropTypes.string,
  tongKinhPhiDuAn: PropTypes.number,
  quy: PropTypes.shape({
    tenQuy: PropTypes.string,
    loaiQuy: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }),
  files: PropTypes.arrayOf(PropTypes.string),
  onPreviewFile: PropTypes.func,
};

RequestInfoCard.defaultProps = {
  files: [],
};

export default RequestInfoCard;
