import PropTypes from 'prop-types';
import { HiOutlineDocumentText, HiOutlinePaperClip } from 'react-icons/hi2';
import styles from './RequestInfoCard.module.scss';

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|bmp|svg)$/i;
const PDF_EXT = /\.pdf$/i;

const formatCurrency = (value) => {
  const n = Number(value || 0);
  return `${n.toLocaleString('vi-VN')}đ`;
};

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

const RequestInfoCard = ({
  tieuDe,
  moTa,
  soTienYeuCau,
  quy,
  files,
  onPreviewFile,
}) => {
  const tenQuy = quy?.tenQuy || '—';
  const loaiQuy = quy?.loaiQuy || '';

  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <HiOutlineDocumentText className={styles.headerIcon} />
        <h2 className={styles.cardTitle}>Nội dung đề nghị</h2>
      </div>

      <div className={styles.body}>
        <div className={styles.fundRow}>
          <div className={styles.fundLeft}>
            <div className={styles.fundName}>{tenQuy}</div>
            {loaiQuy && <span className={styles.fundBadge}>{loaiQuy}</span>}
          </div>
          <div className={styles.amount}>{formatCurrency(soTienYeuCau)}</div>
        </div>

        <div className={styles.divider} />

        <div className={styles.field}>
          <div className={styles.label}>Tiêu đề đơn</div>
          <div className={styles.valueStrong}>{tieuDe || '—'}</div>
        </div>

        <div className={styles.field}>
          <div className={styles.label}>Lý do &amp; Hoàn cảnh</div>
          <div className={styles.reasonBox}>{moTa || 'Không có nội dung'}</div>
        </div>

        <div className={styles.divider} />

        <div className={styles.attachLabel}>HỒ SƠ ĐÍNH KÈM</div>

        {files.length === 0 ? (
          <div className={styles.attachEmpty}>Không có file đính kèm</div>
        ) : (
          <div className={styles.fileGrid}>
            {files.map((url, idx) => {
              const name = getFileName(url);
              const isImage = IMAGE_EXT.test(name);
              const isPdf = PDF_EXT.test(name);

              if (isImage) {
                return (
                  <button
                    key={`${url}-${idx}`}
                    type="button"
                    className={styles.fileItem}
                    onClick={() => onPreviewFile?.(url)}
                  >
                    <div className={styles.thumbWrap}>
                      <img src={url} alt={name} className={styles.thumb} />
                    </div>
                    <div className={styles.fileName} title={name}>
                      {name}
                    </div>
                  </button>
                );
              }

              return (
                <a
                  key={`${url}-${idx}`}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.fileItem}
                >
                  <div
                    className={`${styles.docBox} ${isPdf ? styles.docPdf : ''}`}
                  >
                    {isPdf ? (
                      <HiOutlineDocumentText className={styles.docIcon} />
                    ) : (
                      <HiOutlinePaperClip className={styles.docIcon} />
                    )}
                    <span className={styles.docExt}>
                      {isPdf ? 'PDF' : 'FILE'}
                    </span>
                  </div>
                  <div className={styles.fileName} title={name}>
                    {name}
                  </div>
                </a>
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
  quy: PropTypes.shape({
    tenQuy: PropTypes.string,
    loaiQuy: PropTypes.string,
  }),
  files: PropTypes.arrayOf(PropTypes.string),
  onPreviewFile: PropTypes.func,
};

RequestInfoCard.defaultProps = {
  files: [],
};

export default RequestInfoCard;
