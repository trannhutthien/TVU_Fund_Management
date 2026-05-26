import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import {
  HiOutlineXMark,
  HiOutlineCheckCircle,
  HiOutlineCurrencyDollar,
  HiOutlinePhoto,
  HiOutlineTrash,
} from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import Input from '@components/common/Input/Input';
import api from '@services/api';
import { uploadService } from '@services/uploadService';
import { getStaffDonors } from '@services/donorService';
import { createStaffDonation } from '@services/donationService';
import styles from './KhoanTaiTroModal.module.scss';

const LOAI_LABEL = {
  'Ca nhan': 'Cá nhân',
  'Doanh nghiep': 'Doanh nghiệp',
  'To chuc phi loi nhuan': 'Tổ chức phi lợi nhuận',
};

const formatNumber = (val) => {
  if (val === '' || val === null || val === undefined) return '';
  const n = Number(String(val).replace(/[^0-9]/g, ''));
  if (Number.isNaN(n)) return '';
  return n.toLocaleString('vi-VN');
};

const parseNumber = (val) => {
  if (!val) return 0;
  return Number(String(val).replace(/[^0-9]/g, '')) || 0;
};

const formatCurrency = (n) => {
  const v = Number(n) || 0;
  return v.toLocaleString('vi-VN') + 'đ';
};

const initialForm = (preselected) => ({
  nha_tai_tro_id: preselected?.nha_tai_tro_id || '',
  quy_id: '',
  so_tien: '',
  ghi_chu: '',
  hinh_anh_minh_chung: null,
});

const KhoanTaiTroModal = ({
  isOpen,
  onClose,
  preselectedSponsor,
  onSuccess,
}) => {
  const [form, setForm] = useState(initialForm(preselectedSponsor));
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [sponsorList, setSponsorList] = useState([]);
  const [quyList, setQuyList] = useState([]);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Reset form mỗi lần mở
  useEffect(() => {
    if (isOpen) {
      setForm(initialForm(preselectedSponsor));
      setErrors({});
      setPreview(null);
    }
  }, [isOpen, preselectedSponsor]);

  // Fetch danh sách sponsor (nếu chưa có preselected) + danh sách quỹ
  useEffect(() => {
    if (!isOpen) return;

    if (!preselectedSponsor) {
      getStaffDonors({ page: 1, page_size: 100 })
        .then((res) => setSponsorList(res?.data || []))
        .catch(() => setSponsorList([]));
    }

    api
      .get('/funds')
      .then((res) => {
        const funds = res?.data?.funds || res?.data?.data || res?.data || [];
        setQuyList(
          (Array.isArray(funds) ? funds : []).filter(
            (f) => f.trangThai === 'Dang hoat dong' || f.trang_thai === 'Dang hoat dong',
          ),
        );
      })
      .catch(() => setQuyList([]));
  }, [isOpen, preselectedSponsor]);

  if (!isOpen) return null;

  const selectedQuy = quyList.find(
    (q) => String(q.quyId || q.quy_id) === String(form.quy_id),
  );

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

    setForm((f) => ({ ...f, hinh_anh_minh_chung: file }));
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const removeFile = () => {
    setForm((f) => ({ ...f, hinh_anh_minh_chung: null }));
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validate = () => {
    const errs = {};
    if (!form.nha_tai_tro_id) errs.nha_tai_tro_id = 'Bắt buộc chọn nhà tài trợ';
    if (!form.quy_id) errs.quy_id = 'Bắt buộc chọn quỹ';
    const amount = parseNumber(form.so_tien);
    if (!amount || amount <= 0) errs.so_tien = 'Số tiền phải lớn hơn 0';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    try {
      let urlMinhChung = null;
      if (form.hinh_anh_minh_chung) {
        const upRes = await uploadService.uploadFile(form.hinh_anh_minh_chung);
        urlMinhChung = upRes?.data?.filePath || null;
      }

      await createStaffDonation({
        nha_tai_tro_id: Number(form.nha_tai_tro_id),
        quy_id: Number(form.quy_id),
        so_tien: parseNumber(form.so_tien),
        ghi_chu: form.ghi_chu?.trim() || null,
        hinh_anh_minh_chung: urlMinhChung,
      });

      toast.success('Đã ghi nhận khoản tài trợ. Chờ duyệt.');
      onSuccess?.();
      onClose();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        'Không thể ghi nhận khoản tài trợ. Vui lòng thử lại.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const formValid =
    !!form.nha_tai_tro_id &&
    !!form.quy_id &&
    parseNumber(form.so_tien) > 0;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>
            <HiOutlineCurrencyDollar className={styles.titleIcon} />
            Ghi nhận khoản tài trợ mới
          </h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Đóng"
          >
            <HiOutlineXMark />
          </button>
        </div>

        {/* Form */}
        <div className={styles.body}>
          {/* Field 1: Nhà tài trợ */}
          <div className={styles.field}>
            <label className={styles.label}>
              Nhà tài trợ <span className={styles.required}>*Bắt buộc</span>
            </label>
            {preselectedSponsor ? (
              <div className={styles.sponsorCard}>
                <div className={styles.sponsorAvatar}>
                  {preselectedSponsor.avatar ? (
                    <img
                      src={preselectedSponsor.avatar}
                      alt={preselectedSponsor.ten_nha_tai_tro}
                    />
                  ) : (
                    <span>
                      {preselectedSponsor.ten_nha_tai_tro
                        ?.charAt(0)
                        .toUpperCase() || '?'}
                    </span>
                  )}
                </div>
                <div className={styles.sponsorInfo}>
                  <div className={styles.sponsorName}>
                    {preselectedSponsor.ten_nha_tai_tro}
                  </div>
                  <span className={styles.sponsorLoai}>
                    {LOAI_LABEL[preselectedSponsor.loai] ||
                      preselectedSponsor.loai}
                  </span>
                </div>
              </div>
            ) : (
              <select
                className={`${styles.select} ${
                  errors.nha_tai_tro_id ? styles.selectError : ''
                }`}
                value={form.nha_tai_tro_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, nha_tai_tro_id: e.target.value }))
                }
              >
                <option value="">-- Chọn nhà tài trợ --</option>
                {sponsorList.map((s) => (
                  <option key={s.nha_tai_tro_id} value={s.nha_tai_tro_id}>
                    {s.ten_nha_tai_tro}
                    {s.email ? ` (${s.email})` : ''}
                  </option>
                ))}
              </select>
            )}
            {errors.nha_tai_tro_id && (
              <div className={styles.errorText}>{errors.nha_tai_tro_id}</div>
            )}
          </div>

          {/* Field 2: Quỹ nhận */}
          <div className={styles.field}>
            <label className={styles.label}>
              Quỹ nhận tài trợ{' '}
              <span className={styles.required}>*Bắt buộc</span>
            </label>
            <select
              className={`${styles.select} ${
                errors.quy_id ? styles.selectError : ''
              }`}
              value={form.quy_id}
              onChange={(e) =>
                setForm((f) => ({ ...f, quy_id: e.target.value }))
              }
            >
              <option value="">-- Chọn quỹ --</option>
              {quyList.map((q) => (
                <option
                  key={q.quyId || q.quy_id}
                  value={q.quyId || q.quy_id}
                >
                  {q.tenQuy || q.ten_quy}
                </option>
              ))}
            </select>
            {errors.quy_id && (
              <div className={styles.errorText}>{errors.quy_id}</div>
            )}
            {selectedQuy && (
              <div className={styles.fundInfo}>
                <span>{selectedQuy.tenQuy || selectedQuy.ten_quy}</span>
                <span className={styles.fundBalance}>
                  Số dư:{' '}
                  {formatCurrency(selectedQuy.soDu || selectedQuy.so_du)}
                </span>
              </div>
            )}
          </div>

          {/* Field 3: Số tiền */}
          <div className={styles.field}>
            <Input
              label="Số tiền (VNĐ)"
              required
              value={form.so_tien}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  so_tien: e.target.value.replace(/[^0-9]/g, ''),
                }))
              }
              onBlur={() =>
                setForm((f) => ({ ...f, so_tien: formatNumber(f.so_tien) }))
              }
              inputMode="numeric"
              leftIcon={<HiOutlineCurrencyDollar />}
              error={!!errors.so_tien}
              errorMessage={errors.so_tien}
            />
          </div>

          {/* Field 4: Ghi chú */}
          <div className={styles.field}>
            <label className={styles.label}>Ghi chú</label>
            <textarea
              className={styles.textarea}
              rows={3}
              placeholder="Ghi chú về khoản tài trợ này (nếu có)..."
              value={form.ghi_chu}
              onChange={(e) =>
                setForm((f) => ({ ...f, ghi_chu: e.target.value }))
              }
            />
          </div>

          {/* Field 5: Minh chứng */}
          <div className={styles.field}>
            <label className={styles.label}>
              Ảnh minh chứng{' '}
              <span className={styles.labelHint}>
                (ảnh chụp màn hình, biên lai chuyển khoản — tối đa 5MB)
              </span>
            </label>

            {preview ? (
              <div className={styles.previewWrap}>
                <img
                  src={preview}
                  alt="Xem trước"
                  className={styles.previewImg}
                />
                <div className={styles.previewInfo}>
                  <span className={styles.previewName}>
                    {form.hinh_anh_minh_chung?.name}
                  </span>
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
                <span>Kéo thả hoặc click để chọn ảnh</span>
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

        {/* Footer */}
        <div className={styles.footer}>
          <Button variant="ghost" onClick={onClose}>
            Hủy
          </Button>
          <Button
            variant="primary"
            leftIcon={<HiOutlineCheckCircle />}
            disabled={!formValid}
            loading={submitting}
            onClick={handleSubmit}
          >
            Lưu khoản tài trợ
          </Button>
        </div>
      </div>
    </div>
  );
};

export default KhoanTaiTroModal;
