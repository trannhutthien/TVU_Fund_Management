import PropTypes from 'prop-types';
import {
  HiOutlineDocumentText,
  HiOutlinePaperClip,
  HiOutlineArrowDownTray,
  HiOutlineCurrencyDollar,
  HiOutlineTag,
  HiOutlineDocument,
  HiOutlineFolderOpen,
  HiOutlineClipboardDocumentList,
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
  'Tai tro khong hoan lai': { className: styles.badgeGreen, label: 'Không hoàn lại', color: '#16a34a' },
  'Tai tro co thu hoi': { className: styles.badgeOrange, label: 'Có thu hồi', color: '#d97706' },
  'Cho vay': { className: styles.badgeRed, label: 'Cho vay', color: '#dc2626' },
};

const RequestInfoCard = ({
  tieuDe,
  moTa,
  soTienYeuCau,
  loaiHoTro,
  tongKinhPhiDuAn,
  dotDuyet,
  files = [],
  onPreviewFile,
}) => {
  const loaiStyle = LOAI_HO_TRO_STYLES[loaiHoTro] || {};
  const ratio = tongKinhPhiDuAn > 0 && soTienYeuCau > 0
    ? Math.min((soTienYeuCau / tongKinhPhiDuAn) * 100, 100)
    : 0;

  return (
    <>
      {/* ═══ Block 3: Nội dung đơn xin hỗ trợ ═══ */}
      <section className={styles.card}>
        <div className={styles.header}>
          <HiOutlineClipboardDocumentList size={18} className={styles.headerIcon} />
          <h3 className={styles.headerTitle}>Nội dung đơn xin hỗ trợ</h3>
        </div>

        <div className={styles.body}>
          {/* Tiêu đề */}
          <div className={styles.title}>{tieuDe || '—'}</div>

          {/* Badge loại hỗ trợ + Đợt giải ngân */}
          {(loaiHoTro || dotDuyet) && (
            <div className={styles.typeRow}>
              {loaiHoTro && (
                <span className={`${styles.typeBadge} ${loaiStyle.className || ''}`}>
                  {loaiStyle.label || loaiHoTro}
                </span>
              )}
              {dotDuyet && (
                <span className={styles.dotBadge}>
                  <HiOutlineFolderOpen size={13} />
                  Đợt: {dotDuyet}
                </span>
              )}
            </div>
          )}

          {/* Lý do */}
          {moTa && (
            <div className={styles.reasonBox}>{moTa}</div>
          )}

          {/* Amount cards */}
          <div className={styles.amountCards}>
            <div className={styles.amountCard}>
              <span className={styles.amountLabel}>Số tiền đề nghị</span>
              <span className={styles.amountValue}>{formatCurrency(soTienYeuCau)}</span>
            </div>
            {tongKinhPhiDuAn > 0 && (
              <div className={styles.amountCard}>
                <span className={styles.amountLabel}>Tổng kinh phí dự án</span>
                <span className={styles.amountValue}>{formatCurrency(tongKinhPhiDuAn)}</span>
              </div>
            )}
          </div>

          {/* Ratio bar */}
          {tongKinhPhiDuAn > 0 && (
            <div className={styles.ratioSection}>
              <div className={styles.ratioHeader}>
                <span>Tỷ lệ đề nghị / kinh phí</span>
                <span className={styles.ratioPercent}>{ratio.toFixed(1)}%</span>
              </div>
              <div className={styles.ratioBar}>
                <div
                  className={styles.ratioFill}
                  style={{ width: `${ratio}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ═══ Block 4: Tài liệu đính kèm ═══ */}
      <section className={styles.card}>
        <div className={styles.header}>
          <HiOutlineDocumentText size={18} className={styles.headerIcon} />
          <h3 className={styles.headerTitle}>Tài liệu đính kèm</h3>
          {files.length > 0 && (
            <span className={styles.countBadge}>{files.length} file</span>
          )}
        </div>

        {files.length === 0 ? (
          <div className={styles.empty}>Không có file đính kèm</div>
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
      </section>
    </>
  );
};

RequestInfoCard.propTypes = {
  tieuDe: PropTypes.string,
  moTa: PropTypes.string,
  soTienYeuCau: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  loaiHoTro: PropTypes.string,
  tongKinhPhiDuAn: PropTypes.number,
  dotDuyet: PropTypes.string,
  files: PropTypes.arrayOf(PropTypes.string),
  onPreviewFile: PropTypes.func,
};

export default RequestInfoCard;
