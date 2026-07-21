import React, { useState, useRef } from 'react';
import { UploadOutlined, CloseOutlined, FileImageOutlined, PaperClipOutlined } from '@ant-design/icons';
import { formatCurrency } from '@utils/formatters';
import { uploadService } from '@services/uploadService';
import styles from './index.module.scss';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

const NopMinhChungModal = ({ isOpen, kyData, onSubmit, onClose, submitting }) => {
  const [file, setFile] = useState(null);
  const [ghiChu, setGhiChu] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen || !kyData) return null;

  const handleFileSelect = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!ALLOWED_TYPES.includes(selected.type)) {
      setError('Chỉ chấp nhận file JPG, PNG hoặc PDF.');
      return;
    }
    if (selected.size > MAX_SIZE) {
      setError('File không được vượt quá 5MB.');
      return;
    }

    setFile(selected);
    setError(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (!dropped) return;

    if (!ALLOWED_TYPES.includes(dropped.type)) {
      setError('Chỉ chấp nhận file JPG, PNG hoặc PDF.');
      return;
    }
    if (dropped.size > MAX_SIZE) {
      setError('File không được vượt quá 5MB.');
      return;
    }

    setFile(dropped);
    setError(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Vui lòng chọn file minh chứng.');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const uploadRes = await uploadService.uploadFile(file);
      const fileUrl = uploadRes?.data?.filePath || uploadRes?.filePath || uploadRes?.data?.url || uploadRes?.url;

      await onSubmit(kyData.lichtranoId, { minhchungtrano: fileUrl, ghiChu: ghiChu || undefined });

      setFile(null);
      setGhiChu('');
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setGhiChu('');
    setError(null);
    onClose();
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <h3 className={styles.title}>Nộp minh chứng</h3>
          <button className={styles.closeBtn} onClick={handleClose}>
            <CloseOutlined />
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          <div className={styles.kyInfo}>
            <span className={styles.kyLabel}>Kỳ {kyData.kythu}</span>
            <span className={styles.kyAmount}>{formatCurrency(kyData.tongPhaiTra)}</span>
            <span className={styles.kyDate}>
              Ngày đến hạn: {kyData.ngaydenhan
                ? new Date(kyData.ngaydenhan).toLocaleDateString('vi-VN')
                : '—'}
            </span>
          </div>

          {/* Upload area */}
          <div
            className={`${styles.uploadArea} ${file ? styles.uploadAreaHasFile : ''} ${error ? styles.uploadAreaError : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />

            {file ? (
              <div className={styles.filePreview}>
                {file.type.startsWith('image/') ? (
                  <FileImageOutlined className={styles.fileIcon} />
                ) : (
                  <PaperClipOutlined className={styles.fileIcon} />
                )}
                <div className={styles.fileInfo}>
                  <span className={styles.fileName}>{file.name}</span>
                  <span className={styles.fileSize}>{formatFileSize(file.size)}</span>
                </div>
                <button
                  className={styles.removeFile}
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                >
                  <CloseOutlined />
                </button>
              </div>
            ) : (
              <>
                <UploadOutlined className={styles.uploadIcon} />
                <p className={styles.uploadText}>
                  Kéo thả file vào đây hoặc <span className={styles.uploadLink}>chọn file</span>
                </p>
                <p className={styles.uploadHint}>
                  JPG, PNG hoặc PDF · Tối đa 5MB
                </p>
              </>
            )}
          </div>

          {error && <p className={styles.errorText}>{error}</p>}

          {/* Ghi chú */}
          <div className={styles.fieldWrap}>
            <label className={styles.label}>Ghi chú (không bắt buộc)</label>
            <textarea
              className={styles.textarea}
              rows={3}
              placeholder="Thêm ghi chú cho kế toán..."
              value={ghiChu}
              onChange={(e) => setGhiChu(e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={handleClose} disabled={submitting || uploading}>
            Hủy
          </button>
          <button
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={submitting || uploading || !file}
          >
            {uploading ? 'Đang tải lên...' : submitting ? 'Đang gửi...' : 'Gửi xác nhận'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NopMinhChungModal;
