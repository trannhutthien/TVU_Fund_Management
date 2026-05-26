import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import {
  HiOutlinePaperClip,
  HiOutlineCloudArrowUp,
  HiOutlineDocumentText,
  HiOutlineDocumentCheck,
  HiOutlineXMark,
} from 'react-icons/hi2';
import styles from './DocumentSection.module.scss';

const REQUIRED_DOCS = ['Giấy xác nhận sinh viên', 'Bảng điểm học kỳ gần nhất', 'CMND/CCCD (2 mặt)'];
const OPTIONAL_DOCS = ['Giấy xác nhận hoàn cảnh khó khăn', 'Giấy khen / Bằng khen (nếu có)', 'Tài liệu bổ sung khác'];

const MAX_SIZE_MB = 5;
const MAX_FILES = 5;
const TOTAL_MAX_MB = 25;

const formatSize = (bytes) => (bytes / 1024 / 1024).toFixed(2) + 'MB';

const DocumentSection = ({ files = [], onFilesChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    return () => {
      files.forEach((f) => {
        if (f.preview) URL.revokeObjectURL(f.preview);
      });
    };
  }, []);

  const handleFiles = (fileList) => {
    const newFiles = Array.from(fileList);

    if (files.length + newFiles.length > MAX_FILES) {
      toast.error(`Tối đa ${MAX_FILES} tệp`);
      return;
    }

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];

    const processed = newFiles
      .filter((file) => {
        if (!validTypes.includes(file.type)) {
          toast.error(`${file.name}: Định dạng không hỗ trợ`);
          return false;
        }
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
          toast.error(`${file.name}: Vượt quá ${MAX_SIZE_MB}MB`);
          return false;
        }
        return true;
      })
      .map((file) => ({
        id: `${Date.now()}-${Math.random()}`,
        name: file.name,
        size: file.size,
        type: file.type,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        file,
      }));

    onFilesChange([...files, ...processed]);
  };

  const handleRemove = (id) => {
    const target = files.find((f) => f.id === id);
    if (target?.preview) URL.revokeObjectURL(target.preview);
    onFilesChange(files.filter((f) => f.id !== id));
  };

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  const totalPercent = Math.min((totalSize / (TOTAL_MAX_MB * 1024 * 1024)) * 100, 100);
  const isNearLimit = totalPercent >= 80;

  return (
    <div className={styles.card}>
      <div className={styles.sectionTitle}>
        <HiOutlinePaperClip className={styles.titleIcon} />
        <span>Phần 4: Hồ sơ minh chứng</span>
      </div>

      <div className={styles.docList}>
        <div className={styles.docCol}>
          <div className={styles.docColLabel}>📋 Tài liệu bắt buộc</div>
          {REQUIRED_DOCS.map((doc) => (
            <div key={doc} className={styles.docItem}>
              <HiOutlineDocumentCheck className={styles.docIconRequired} />
              <span>{doc}</span>
            </div>
          ))}
        </div>
        <div className={styles.docCol}>
          <div className={styles.docColLabelOptional}>📎 Tài liệu bổ sung</div>
          {OPTIONAL_DOCS.map((doc) => (
            <div key={doc} className={styles.docItem}>
              <HiOutlineDocumentCheck className={styles.docIconOptional} />
              <span>{doc}</span>
            </div>
          ))}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className={styles.hiddenInput}
      />

      <div
        className={`${styles.dropZone} ${isDragging ? styles.dragging : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
      >
        <HiOutlineCloudArrowUp className={styles.uploadIcon} />
        <p className={styles.uploadText}>Kéo và thả tệp tại đây</p>
        <p className={styles.uploadSubtext}>
          Hoặc{' '}
          <span className={styles.uploadLink}>chọn tệp từ máy tính</span>
        </p>
        <div className={styles.formatBadges}>
          <span className={styles.formatBadge}>PDF</span>
          <span className={styles.formatBadge}>JPG</span>
          <span className={styles.formatBadge}>PNG</span>
        </div>
      </div>

      {files.length > 0 && (
        <div className={styles.fileList}>
          <div className={styles.fileListHeader}>
            <span className={styles.fileListTitle}>Tệp đã chọn</span>
            <span className={styles.fileListCount}>
              {files.length}/{MAX_FILES} tệp
            </span>
          </div>

          {files.map((f) => (
            <div key={f.id} className={styles.fileItem}>
              <div className={styles.fileThumb}>
                {f.preview ? (
                  <img src={f.preview} alt="" className={styles.fileImage} />
                ) : (
                  <div className={styles.pdfThumb}>
                    <HiOutlineDocumentText className={styles.pdfIcon} />
                  </div>
                )}
              </div>
              <div className={styles.fileInfo}>
                <span className={styles.fileName}>{f.name}</span>
                <span className={styles.fileSize}>{formatSize(f.size)}</span>
              </div>
              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => handleRemove(f.id)}
              >
                <HiOutlineXMark />
              </button>
            </div>
          ))}

          <div className={styles.totalBar}>
            <div className={styles.totalLabel}>
              <span>Tổng dung lượng: {formatSize(totalSize)}</span>
              <span className={styles.totalMax}>/{TOTAL_MAX_MB}MB</span>
            </div>
            <div className={styles.totalTrack}>
              <div
                className={styles.totalFill}
                style={{
                  width: `${totalPercent}%`,
                  backgroundColor: isNearLimit ? '#f59e0b' : 'var(--color-primary, #1a2f5e)',
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

DocumentSection.propTypes = {
  files: PropTypes.array,
  onFilesChange: PropTypes.func,
};

export default DocumentSection;
