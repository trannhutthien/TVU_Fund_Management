import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import {
  HiOutlineXMark,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlinePhoto,
  HiOutlineTrash,
} from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import { uploadService } from '@services/uploadService';
import { approveDonation, confirmDonation } from '@services/donationService';
import { formatCurrency } from '@utils/formatters';
import styles from './XacNhanModal.module.scss';

const formatDateTime = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const XacNhanModal = ({ item, onClose, onSuccess }) => {
  const [ghiChu, setGhiChu] = useState('');
  const [minhChung, setMinhChung] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (item) {
      setGhiChu('');
      setMinhChung(null);
      setPreview(null);
      setConfirmed(false);
      setSubmitting(false);
    }
  }, [item?.khoan_tai_tro_id]);

  if (!item) return null;

  const isChoDuyet = item.trang_thai === 'Cho duyet';
  const isDaDuyet = item.trang_thai === 'Da duyet';
  const titleText = isChoDuyet ? 'Duyệt khoản tài trợ' : 'Xác nhận khoản tài trợ';
  const warningText = isChoDuyet
    ? `Sau khi duyệt, hệ thống sẽ tự động cộng ${formatCurrency(item.so_tien)} vào quỹ ${item.ten_quy}, ghi nhận giao dịch Thu và cập nhật thống kê nhà tài trợ.`
    : `Xác nhận khoản tài trợ ${formatCurrency(item.so_tien)} từ ${item.ten_nha_tai_tro} đã hoàn tất.`;
  const buttonText = isChoDuyet ? 'Duyệt khoản tài trợ' : 'Xác nhận hoàn tất';

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File vượt quá 5MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Chỉ chấp nhận file ảnh');
      return;
    }

    setMinhChung(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const removeFile = () => {
    setMinhChung(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!confirmed || submitting) return;

    setSubmitting(true);
    try {
      const isChoDuyet = item.trang_thai === 'Cho duyet';
      const isDaDuyet = item.trang_thai === 'Da duyet';

      let urlMinhChung = null;
      if (minhChung) {
        const upRes = await uploadService.uploadFile(minhChung);
        urlMinhChung = upRes?.data?.filePath || null;
      }

      // Kế toán duyệt: Cho duyet → Da duyet (cộng tiền)
      if (isChoDuyet) {
        await approveDonation(item.khoan_tai_tro_id, {
          ghi_chu: ghiChu.trim() || null,
          minh_chung_ke_toan: urlMinhChung,
        });
        toast.success(
          `Đã duyệt! ${formatCurrency(item.so_tien)} đã được cộng vào ${item.ten_quy}`
        );
      }
      // Admin xác nhận: Da duyet → Da nhan (không cộng tiền)
      else if (isDaDuyet) {
        await confirmDonation(item.khoan_tai_tro_id, {
          ghi_chu: ghiChu.trim() || null,
        });
        toast.success(
          `Đã xác nhận khoản tài trợ ${formatCurrency(item.so_tien)} từ ${item.ten_nha_tai_tro}`
        );
      }

      onSuccess?.();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        'Có lỗi xảy ra khi xác nhận. Vui lòng thử lại.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <h2 className={styles.title}>
            <HiOutlineCheckCircle className={styles.titleIcon} />
            {titleText}
          </h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Đóng"
          >
            <HiOutlineXMark />
          </button>
        </header>

        <div className={styles.body}>
          {/* Tóm tắt khoản */}
          <div className={styles.summary}>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Nhà tài trợ</span>
              <span className={styles.summaryValue}>{item.ten_nha_tai_tro}</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Quỹ nhận</span>
              <span className={styles.summaryValue}>{item.ten_quy}</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Số tiền</span>
              <span className={styles.summaryAmount}>{formatCurrency(item.so_tien)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Ngày tài trợ</span>
              <span className={styles.summaryValue}>{formatDateTime(item.ngay_tai_tro)}</span>
            </div>
          </div>

          {/* Banner cảnh báo */}
          <div className={styles.warning}>
            <HiOutlineExclamationTriangle className={styles.warningIcon} />
            <div className={styles.warningText}>
              {warningText}{' '}
              <strong>Hành động này không thể hoàn tác.</strong>
            </div>
          </div>

          {/* Upload minh chứng kế toán - chỉ cho Kế toán */}
          {isChoDuyet && (
            <div className={styles.field}>
              <label className={styles.label}>
                Minh chứng xác nhận của kế toán{' '}
                <span className={styles.labelHint}>(nếu có, tối đa 5MB)</span>
              </label>
              {preview ? (
                <div className={styles.previewWrap}>
                  <img src={preview} alt="Xem trước" className={styles.previewImg} />
                  <div className={styles.previewInfo}>
                    <span className={styles.previewName}>{minhChung?.name}</span>
                    <button
                      type="button"
                      onClick={removeFile}
                      className={styles.removeBtn}
                    >
                      <HiOutlineTrash />
                      Xóa
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className={styles.dropzone}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <HiOutlinePhoto className={styles.dropzoneIcon} />
                  <span>Click để chọn ảnh minh chứng</span>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
          )}

          {/* Ghi chú */}
          <div className={styles.field}>
            <label className={styles.label}>Ghi chú xác nhận</label>
            <textarea
              className={styles.textarea}
              rows={3}
              placeholder="Số bút toán, ghi chú nội bộ..."
              value={ghiChu}
              onChange={(e) => setGhiChu(e.target.value)}
            />
          </div>

          {/* Checkbox xác nhận */}
          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className={styles.checkbox}
            />
            <span className={styles.checkboxLabel}>
              Tôi xác nhận đã kiểm tra và nhận được khoản tiền{' '}
              <strong>{formatCurrency(item.so_tien)}</strong> từ{' '}
              <strong>{item.ten_nha_tai_tro}</strong> vào quỹ{' '}
              <strong>{item.ten_quy}</strong>.
            </span>
          </label>
        </div>

        <footer className={styles.footer}>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Hủy
          </Button>
          <Button
            variant="primary"
            leftIcon={<HiOutlineCheckCircle />}
            disabled={!confirmed}
            loading={submitting}
            onClick={handleSubmit}
          >
            {buttonText}
          </Button>
        </footer>
      </div>
    </div>
  );
};

export default XacNhanModal;
