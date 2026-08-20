import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import {
  HiOutlineXMark,
  HiOutlineCheckCircle,
  HiOutlineBuildingOffice2,
  HiOutlinePhoto,
  HiOutlineTrash,
  HiOutlineTag,
} from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import Input from '@components/common/Input/Input';
import { uploadService } from '@services/uploadService';
import { createDonor } from '@services/donorService';
import styles from './CreateDonorModal.module.scss';

const LOAI_OPTIONS = [
  { value: 'Ca nhan', label: 'Cá nhân' },
  { value: 'To chuc', label: 'Tổ chức' },
  { value: 'Doanh nghiep', label: 'Doanh nghiệp' },
  { value: 'Doi tac', label: 'Đối tác' },
];

const CreateDonorModal = ({ isOpen, onClose, onSuccess }) => {
  const [tenNhaTaiTro, setTenNhaTaiTro] = useState('');
  const [loaiNhaTaiTro, setLoaiNhaTaiTro] = useState('Doi tac');
  const [logoFile, setLogoFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTenNhaTaiTro('');
      setLoaiNhaTaiTro('Doi tac');
      setLogoFile(null);
      setPreview(null);
      setErrors({});
      setSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

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

    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const removeFile = () => {
    setLogoFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    const errs = {};
    if (!tenNhaTaiTro.trim()) {
      errs.tenNhaTaiTro = 'Bắt buộc nhập tên nhà tài trợ';
    }
    if (!LOAI_OPTIONS.some((o) => o.value === loaiNhaTaiTro)) {
      errs.loaiNhaTaiTro = 'Loại nhà tài trợ không hợp lệ';
    }
    setErrors(errs);
    if (Object.keys(errs).length > 0 || submitting) return;

    setSubmitting(true);
    try {
      let logoPath = null;
      if (logoFile) {
        const upRes = await uploadService.uploadDonorLogo(logoFile);
        logoPath = upRes?.data?.filePath || null;
      }

      await createDonor({
        tenNhaTaiTro: tenNhaTaiTro.trim(),
        loaiNhaTaiTro,
        logo: logoPath,
      });

      toast.success('Tạo nhà tài trợ thành công');
      onSuccess?.();
      onClose();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        'Không thể tạo nhà tài trợ. Vui lòng thử lại.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const formValid =
    !!tenNhaTaiTro.trim() &&
    LOAI_OPTIONS.some((o) => o.value === loaiNhaTaiTro);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <h2 className={styles.title}>
            <HiOutlineBuildingOffice2 className={styles.titleIcon} />
            Tạo nhà tài trợ mới
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
          <div className={styles.field}>
            <label className={styles.label}>
              Tên tổ chức / nhà tài trợ <span className={styles.required}>*Bắt buộc</span>
            </label>
            <input
              className={`${styles.input} ${errors.tenNhaTaiTro ? styles.inputError : ''}`}
              value={tenNhaTaiTro}
              onChange={(e) => {
                setTenNhaTaiTro(e.target.value);
                if (errors.tenNhaTaiTro) setErrors((er) => ({ ...er, tenNhaTaiTro: '' }));
              }}
              placeholder="VD: Công ty ABC, Quỹ Thịnh Vượng..."
            />
            {errors.tenNhaTaiTro && (
              <div className={styles.errorText}>{errors.tenNhaTaiTro}</div>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Loại nhà tài trợ</label>
            <div className={styles.selectWrap}>
              <select
                className={styles.select}
                value={loaiNhaTaiTro}
                onChange={(e) => setLoaiNhaTaiTro(e.target.value)}
              >
                {LOAI_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            {errors.loaiNhaTaiTro && (
              <div className={styles.errorText}>{errors.loaiNhaTaiTro}</div>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              Logo <span className={styles.labelHint}>(không bắt buộc — tối đa 5MB)</span>
            </label>

            {preview ? (
              <div className={styles.previewWrap}>
                <img src={preview} alt="Xem trước logo" className={styles.previewImg} />
                <div className={styles.previewInfo}>
                  <span className={styles.previewName}>{logoFile?.name}</span>
                  <button type="button" onClick={removeFile} className={styles.removeBtn}>
                    <HiOutlineTrash />
                    Xóa
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.dropzone} onClick={() => fileInputRef.current?.click()}>
                <HiOutlinePhoto className={styles.dropzoneIcon} />
                <span>Kéo thả hoặc click để chọn logo</span>
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
        </div>

        <footer className={styles.footer}>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Hủy
          </Button>
          <Button
            variant="primary"
            leftIcon={<HiOutlineTag />}
            disabled={!formValid}
            loading={submitting}
            onClick={handleSubmit}
          >
            Tạo nhà tài trợ
          </Button>
        </footer>
      </div>
    </div>
  );
};

export default CreateDonorModal;