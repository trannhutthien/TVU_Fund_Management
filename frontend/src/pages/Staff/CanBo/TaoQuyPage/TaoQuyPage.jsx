import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  HiOutlineArrowLeft,
  HiOutlineBuildingLibrary,
  HiOutlinePhoto,
  HiOutlineBanknotes,
  HiOutlineCalendarDays,
  HiOutlineCheckCircle,
  HiOutlineXMark,
  HiOutlineArrowUpTray,
  HiOutlineTrash,
  HiOutlineDocumentText,
} from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import Input from '@components/common/Input/Input';
import { createFund } from '@services/fundService';
import { uploadService } from '@services/uploadService';
import styles from './TaoQuyPage.module.scss';

const API_BASE = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'
).replace(/\/api\/?$/, '');

const LOAI_QUY_OPTIONS = [
  { value: 'Tu thien', label: 'Từ thiện' },
  { value: 'Hoc bong', label: 'Học bổng' },
  { value: 'Y te', label: 'Y tế' },
  { value: 'Moi truong', label: 'Môi trường' },
  { value: 'Khac', label: 'Khác' },
];

const TRANG_THAI_OPTIONS = [
  { value: 'Dang hoat dong', label: 'Đang hoạt động' },
  { value: 'Tam dung', label: 'Tạm dừng' },
  { value: 'Da dong', label: 'Đã đóng' },
];

const INITIAL_FORM = {
  ten_quy: '',
  loai_quy: '',
  mo_ta: '',
  hinh_anh: '',
  so_tien_toi_thieu: '',
  so_tien_toi_da: '',
  so_luong_chi_tieu: '',
  han_nop_don: '',
  dieu_kien_tom_tat: '',
  so_du: '0',
  trang_thai: 'Dang hoat dong',
};

const buildImageUrl = (path) => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE}/${path.replace(/^\//, '')}`;
};

const TaoQuyPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  // ─── Handlers ─────────────────────────────────────
  const handleChange = (key) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      toast.error('Chỉ chấp nhận file JPG, JPEG, PNG');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    try {
      setUploading(true);
      const res = await uploadService.uploadFile(file);
      if (res?.success && res?.data?.filePath) {
        setForm((prev) => ({ ...prev, hinh_anh: res.data.filePath }));
        toast.success('Tải ảnh lên thành công');
      } else {
        toast.error('Không thể tải ảnh lên');
      }
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Lỗi khi tải ảnh lên');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    setForm((prev) => ({ ...prev, hinh_anh: '' }));
  };

  // ─── Validation ───────────────────────────────────
  const validate = () => {
    const next = {};

    if (!form.ten_quy.trim()) {
      next.ten_quy = 'Vui lòng nhập tên quỹ';
    } else if (form.ten_quy.trim().length > 150) {
      next.ten_quy = 'Tên quỹ tối đa 150 ký tự';
    }

    if (!form.loai_quy) {
      next.loai_quy = 'Vui lòng chọn loại quỹ';
    }

    if (form.mo_ta && form.mo_ta.length > 255) {
      next.mo_ta = 'Mô tả tối đa 255 ký tự';
    }

    if (form.dieu_kien_tom_tat && form.dieu_kien_tom_tat.length > 200) {
      next.dieu_kien_tom_tat = 'Điều kiện tối đa 200 ký tự';
    }

    const soDu = form.so_du === '' ? 0 : Number(form.so_du);
    if (Number.isNaN(soDu) || soDu < 0) {
      next.so_du = 'Số dư phải là số ≥ 0';
    }

    const min = form.so_tien_toi_thieu === '' ? null : Number(form.so_tien_toi_thieu);
    const max = form.so_tien_toi_da === '' ? null : Number(form.so_tien_toi_da);
    if (min !== null && (Number.isNaN(min) || min < 0)) {
      next.so_tien_toi_thieu = 'Số tiền tối thiểu phải ≥ 0';
    }
    if (max !== null && (Number.isNaN(max) || max < 0)) {
      next.so_tien_toi_da = 'Số tiền tối đa phải ≥ 0';
    }
    if (min !== null && max !== null && max < min) {
      next.so_tien_toi_da = 'Số tiền tối đa phải ≥ số tiền tối thiểu';
    }

    if (form.so_luong_chi_tieu !== '') {
      const sl = Number(form.so_luong_chi_tieu);
      if (Number.isNaN(sl) || sl <= 0 || !Number.isInteger(sl)) {
        next.so_luong_chi_tieu = 'Số suất phải là số nguyên > 0';
      }
    }

    return next;
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.warn('Vui lòng kiểm tra lại các trường nhập');
      return;
    }

    const payload = {
      tenQuy: form.ten_quy.trim(),
      loaiQuy: form.loai_quy,
      moTa: form.mo_ta?.trim() || null,
      hinhAnh: form.hinh_anh || null,
      soTienToiThieu:
        form.so_tien_toi_thieu === '' ? null : Number(form.so_tien_toi_thieu),
      soTienToiDa:
        form.so_tien_toi_da === '' ? null : Number(form.so_tien_toi_da),
      soLuongChiTieu:
        form.so_luong_chi_tieu === '' ? null : Number(form.so_luong_chi_tieu),
      hanNopDon: form.han_nop_don || null,
      dieuKienTomTat: form.dieu_kien_tom_tat?.trim() || null,
      soDu: form.so_du === '' ? 0 : Number(form.so_du),
      trangThai: form.trang_thai,
    };

    try {
      setSubmitting(true);
      const res = await createFund(payload);
      if (res?.success) {
        toast.success('Tạo quỹ thành công');
        navigate('/can-bo/quy');
      } else {
        toast.error(res?.message || 'Không thể tạo quỹ');
      }
    } catch (err) {
      console.error('Create fund error:', err);
      // Toast lỗi đã được hiển thị qua interceptor của api.js
    } finally {
      setSubmitting(false);
    }
  };

  const previewUrl = form.hinh_anh ? buildImageUrl(form.hinh_anh) : '';

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <Link to="/" className={styles.crumbLink}>
            Trang chủ
          </Link>
          <span className={styles.crumbSep}>/</span>
          <Link to="/can-bo/quy" className={styles.crumbLink}>
            Danh sách Quỹ
          </Link>
          <span className={styles.crumbSep}>/</span>
          <span>Tạo quỹ mới</span>
        </div>

        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerText}>
            <h1 className={styles.title}>Tạo quỹ mới</h1>
            <p className={styles.subtitle}>
              Thiết lập thông tin chi tiết cho một quỹ hỗ trợ mới
            </p>
          </div>
          <Button
            variant="ghost"
            leftIcon={<HiOutlineArrowLeft />}
            onClick={() => navigate('/can-bo/quy')}
          >
            Quay lại
          </Button>
        </header>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {/* ── Section: Thông tin cơ bản ─────────── */}
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <HiOutlineBuildingLibrary className={styles.sectionIcon} />
              <div>
                <h2 className={styles.sectionTitle}>Thông tin cơ bản</h2>
                <p className={styles.sectionDesc}>
                  Tên, loại và mô tả của quỹ
                </p>
              </div>
            </div>

            <div className={styles.grid}>
              <div className={styles.colFull}>
                <label className={styles.label}>
                  Tên quỹ <span className={styles.required}>*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Ví dụ: Quỹ học bổng vượt khó 2026"
                  value={form.ten_quy}
                  onChange={handleChange('ten_quy')}
                  error={!!errors.ten_quy}
                  errorMessage={errors.ten_quy}
                  maxLength={150}
                  showCounter
                />
              </div>

              <div className={styles.col}>
                <label className={styles.label}>
                  Loại quỹ <span className={styles.required}>*</span>
                </label>
                <select
                  className={`${styles.select} ${
                    errors.loai_quy ? styles.selectError : ''
                  }`}
                  value={form.loai_quy}
                  onChange={handleChange('loai_quy')}
                >
                  <option value="">-- Chọn loại quỹ --</option>
                  {LOAI_QUY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {errors.loai_quy && (
                  <span className={styles.errorMsg}>{errors.loai_quy}</span>
                )}
              </div>

              <div className={styles.col}>
                <label className={styles.label}>Trạng thái</label>
                <select
                  className={styles.select}
                  value={form.trang_thai}
                  onChange={handleChange('trang_thai')}
                >
                  {TRANG_THAI_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.colFull}>
                <label className={styles.label}>Mô tả ngắn</label>
                <textarea
                  className={`${styles.textarea} ${
                    errors.mo_ta ? styles.textareaError : ''
                  }`}
                  placeholder="Mô tả ngắn gọn về quỹ (tối đa 255 ký tự)"
                  value={form.mo_ta}
                  onChange={handleChange('mo_ta')}
                  rows={3}
                  maxLength={255}
                />
                <div className={styles.fieldFoot}>
                  {errors.mo_ta && (
                    <span className={styles.errorMsg}>{errors.mo_ta}</span>
                  )}
                  <span className={styles.counter}>
                    {form.mo_ta.length}/255
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* ── Section: Hình ảnh ────────────────── */}
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <HiOutlinePhoto className={styles.sectionIcon} />
              <div>
                <h2 className={styles.sectionTitle}>Hình ảnh đại diện</h2>
                <p className={styles.sectionDesc}>
                  Ảnh banner hiển thị trên thẻ quỹ (JPG, PNG, ≤ 5MB)
                </p>
              </div>
            </div>

            <div className={styles.imageBlock}>
              <div className={styles.imagePreview}>
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Xem trước"
                    className={styles.previewImg}
                  />
                ) : (
                  <div className={styles.previewPlaceholder}>
                    <HiOutlinePhoto className={styles.previewIcon} />
                    <span>Chưa có ảnh</span>
                  </div>
                )}
              </div>

              <div className={styles.imageActions}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleFileChange}
                  className={styles.hiddenFile}
                  id="hinh-anh-input"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<HiOutlineArrowUpTray />}
                  onClick={() => fileInputRef.current?.click()}
                  loading={uploading}
                  type="button"
                >
                  {previewUrl ? 'Đổi ảnh' : 'Tải ảnh lên'}
                </Button>
                {previewUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<HiOutlineTrash />}
                    onClick={handleRemoveImage}
                    type="button"
                  >
                    Xóa ảnh
                  </Button>
                )}
              </div>
            </div>
          </section>

          {/* ── Section: Tài chính ───────────────── */}
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <HiOutlineBanknotes className={styles.sectionIcon} />
              <div>
                <h2 className={styles.sectionTitle}>Thông tin tài chính</h2>
                <p className={styles.sectionDesc}>
                  Số dư khởi tạo và khoảng giá trị hỗ trợ
                </p>
              </div>
            </div>

            <div className={styles.grid}>
              <div className={styles.col}>
                <label className={styles.label}>Số dư khởi tạo (đ)</label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.so_du}
                  onChange={handleChange('so_du')}
                  error={!!errors.so_du}
                  errorMessage={errors.so_du}
                />
              </div>

              <div className={styles.col}>
                <label className={styles.label}>
                  Số tiền tối thiểu/suất (đ)
                </label>
                <Input
                  type="number"
                  min="0"
                  placeholder="Để trống nếu không quy định"
                  value={form.so_tien_toi_thieu}
                  onChange={handleChange('so_tien_toi_thieu')}
                  error={!!errors.so_tien_toi_thieu}
                  errorMessage={errors.so_tien_toi_thieu}
                />
              </div>

              <div className={styles.col}>
                <label className={styles.label}>
                  Số tiền tối đa/suất (đ)
                </label>
                <Input
                  type="number"
                  min="0"
                  placeholder="Để trống nếu không quy định"
                  value={form.so_tien_toi_da}
                  onChange={handleChange('so_tien_toi_da')}
                  error={!!errors.so_tien_toi_da}
                  errorMessage={errors.so_tien_toi_da}
                />
              </div>
            </div>
          </section>

          {/* ── Section: Suất & Hạn nộp ──────────── */}
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <HiOutlineCalendarDays className={styles.sectionIcon} />
              <div>
                <h2 className={styles.sectionTitle}>Suất hỗ trợ & Hạn nộp</h2>
                <p className={styles.sectionDesc}>
                  Số lượng chỉ tiêu và thời hạn tiếp nhận đơn
                </p>
              </div>
            </div>

            <div className={styles.grid}>
              <div className={styles.col}>
                <label className={styles.label}>Số lượng chỉ tiêu</label>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Để trống nếu không giới hạn"
                  value={form.so_luong_chi_tieu}
                  onChange={handleChange('so_luong_chi_tieu')}
                  error={!!errors.so_luong_chi_tieu}
                  errorMessage={errors.so_luong_chi_tieu}
                />
              </div>

              <div className={styles.col}>
                <label className={styles.label}>Hạn nộp đơn</label>
                <input
                  type="date"
                  className={styles.dateInput}
                  value={form.han_nop_don}
                  onChange={handleChange('han_nop_don')}
                />
              </div>

              <div className={styles.colFull}>
                <label className={styles.label}>Điều kiện tóm tắt</label>
                <textarea
                  className={`${styles.textarea} ${
                    errors.dieu_kien_tom_tat ? styles.textareaError : ''
                  }`}
                  placeholder="Điều kiện ngắn hiển thị trên thẻ (tối đa 200 ký tự)"
                  value={form.dieu_kien_tom_tat}
                  onChange={handleChange('dieu_kien_tom_tat')}
                  rows={2}
                  maxLength={200}
                />
                <div className={styles.fieldFoot}>
                  {errors.dieu_kien_tom_tat && (
                    <span className={styles.errorMsg}>
                      {errors.dieu_kien_tom_tat}
                    </span>
                  )}
                  <span className={styles.counter}>
                    {form.dieu_kien_tom_tat.length}/200
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* ── Footer ───────────────────────────── */}
          <div className={styles.footer}>
            <Button
              variant="ghost"
              type="button"
              leftIcon={<HiOutlineXMark />}
              onClick={handleReset}
              disabled={submitting}
            >
              Đặt lại
            </Button>
            <div className={styles.footerRight}>
              <Button
                variant="secondary"
                type="button"
                onClick={() => navigate('/can-bo/quy')}
                disabled={submitting}
              >
                Hủy
              </Button>
              <Button
                variant="primary"
                type="submit"
                leftIcon={<HiOutlineCheckCircle />}
                loading={submitting}
              >
                Tạo quỹ
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaoQuyPage;
