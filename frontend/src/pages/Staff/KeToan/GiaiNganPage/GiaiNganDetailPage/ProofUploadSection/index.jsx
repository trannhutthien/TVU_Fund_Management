import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import {
  HiOutlineArrowUpTray,
  HiOutlineDocumentText,
  HiOutlineXMark,
  HiOutlineCheckCircle,
} from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import { uploadService } from '@services/uploadService';
import styles from './ProofUploadSection.module.scss';

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

const ProofUploadSection = ({ giaoDich, onUploaded }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  if (!giaoDich) return null;

  const hasProof = !!giaoDich.chungtu;

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > MAX_SIZE) {
      toast.error('File tối đa 5MB');
      return;
    }
    if (!ALLOWED_TYPES.includes(f.type)) {
      toast.error('Chỉ chấp nhận PDF, JPG, PNG');
      return;
    }
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const uploadRes = await uploadService.uploadFile(file);
      const filePath = uploadRes?.data?.filePath || uploadRes?.filePath;

      await import('@services/api').then(({ default: api }) =>
        api.patch(`/transactions/${giaoDich.giaodich_id}/upload-proof`, {
          minhChung: filePath,
        })
      );

      toast.success('Upload minh chứng thành công');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onUploaded?.();
    } catch (err) {
      console.error('Upload proof error:', err);
      toast.error(err?.response?.data?.message || 'Lỗi upload, vui lòng thử lại');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (hasProof) {
    return (
      <section className={styles.card}>
        <div className={styles.headerDone}>
          <HiOutlineCheckCircle className={styles.doneIcon} />
          <span className={styles.doneTitle}>Minh chứng chuyển khoản</span>
        </div>
        <div className={styles.body}>
          <a
            href={giaoDich.chungtu}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.proofLink}
          >
            <HiOutlineDocumentText /> Xem minh chứng
          </a>
          <div className={styles.replaceWrap}>
            <span className={styles.replaceText}>Thay thế minh chứng mới:</span>
            <div className={styles.uploadRow}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className={styles.fileInput}
              />
              <Button
                variant="ghost"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                size="sm"
              >
                Chọn file
              </Button>
              {file && (
                <span className={styles.fileName}>{file.name}</span>
              )}
              <Button
                variant="primary"
                onClick={handleUpload}
                disabled={!file || uploading}
                loading={uploading}
                size="sm"
              >
                Upload
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <HiOutlineArrowUpTray className={styles.headerIcon} />
        <span className={styles.headerTitle}>Minh chứng chuyển khoản</span>
      </div>
      <div className={styles.body}>
        <p className={styles.hint}>
          Tải lên minh chứng xác nhận đã chuyển khoản (sao kê ngân hàng, biên lai...)
        </p>

        <div
          className={`${styles.uploadArea} ${file ? styles.uploadAreaHasFile : ''}`}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            className={styles.hiddenInput}
          />
          {file ? (
            <div className={styles.filePreview}>
              <HiOutlineDocumentText className={styles.fileIcon} />
              <div className={styles.fileInfo}>
                <span className={styles.fileName}>{file.name}</span>
                <span className={styles.fileSize}>{(file.size / 1024).toFixed(0)} KB</span>
              </div>
              <button
                type="button"
                className={styles.fileRemove}
                onClick={(e) => { e.stopPropagation(); handleRemoveFile(); }}
              >
                <HiOutlineXMark size={14} />
              </button>
            </div>
          ) : (
            <>
              <HiOutlineArrowUpTray className={styles.uploadIcon} />
              <span className={styles.uploadText}>
                Nhấn để tải file (PDF, JPG, PNG, tối đa 5MB)
              </span>
            </>
          )}
        </div>

        <div className={styles.actions}>
          <Button
            variant="primary"
            onClick={handleUpload}
            disabled={!file || uploading}
            loading={uploading}
          >
            Upload minh chứng
          </Button>
        </div>
      </div>
    </section>
  );
};

ProofUploadSection.propTypes = {
  giaoDich: PropTypes.shape({
    giaodich_id: PropTypes.number,
    chungtu: PropTypes.string,
  }),
  onUploaded: PropTypes.func,
};

export default ProofUploadSection;
