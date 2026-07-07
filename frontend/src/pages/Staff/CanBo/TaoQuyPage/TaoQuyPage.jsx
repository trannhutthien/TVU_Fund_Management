import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
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
import useAuthStore from '@stores/authStore';
import { createFund, getFundById, updateFund, getAllLoaiQuy } from '@services/fundService';
import { uploadService } from '@services/uploadService';
import api from '@services/api';
import styles from './TaoQuyPage.module.scss';

const API_BASE = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'
).replace(/\/api\/?$/, '');



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
  so_tien_muc_tieu: '', // Số tiền mục tiêu (target amount)
  so_tien_ho_tro_toi_da: '', // Số tiền hỗ trợ tối đa/sinh viên
  so_luong_chi_tieu: '',
  han_nop_don: '',
  dieu_kien_tom_tat: '',
  so_du: '0',
  trang_thai: 'Dang hoat dong',
  loai_dieuhanh: 'Tap trung - Be chung',
  quy_cha_id: '',
  so_dot_giai_ngan: '', // Số đợt giải ngân (1-4)
};

const buildImageUrl = (path) => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE}/${path.replace(/^\//, '')}`;
};

const TaoQuyPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuthStore(); // Lấy thông tin user hiện tại
  const isEditMode = !!id;
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loaiQuyList, setLoaiQuyList] = useState([]);
  const [beChungList, setBeChungList] = useState([]);
  const [dotGiaiNgan, setDotGiaiNgan] = useState([]); // Chi tiết các đợt giải ngân

  // Load loai quy tu API
  useEffect(() => {
    getAllLoaiQuy()
      .then((res) => {
        if (res?.success && Array.isArray(res.data)) {
          setLoaiQuyList(res.data);
        }
      })
      .catch((err) => {
        console.error('Error fetching loai-quy in TaoQuyPage:', err);
      });
  }, []);

  // Fetch danh sách bể tiền chung nguồn
  useEffect(() => {
    api.get('/funds')
      .then((res) => {
        if (res?.data?.funds && Array.isArray(res.data.funds)) {
          const filtered = res.data.funds.filter(
            (f) => f.loaiDieuHanh === 'Tap trung - Be chung' && String(f.quyId) !== String(id)
          );
          setBeChungList(filtered);
        }
      })
      .catch((err) => {
        console.error('Error fetching parent funds:', err);
      });
  }, [id]);

  // Load fund details in edit mode
  useEffect(() => {
    if (!isEditMode) return;

    let mounted = true;
    const fetchFund = async () => {
      try {
        const res = await getFundById(id);
        if (res?.success && res?.fund && mounted) {
          const fund = res.fund;
          setForm({
            ten_quy: fund.tenQuy || '',
            loai_quy: fund.loaiQuy || '',
            mo_ta: fund.moTa || '',
            hinh_anh: fund.hinhAnh ? fund.hinhAnh.replace(`${API_BASE}/`, '').replace(/^\//, '') : '',
            so_tien_muc_tieu: fund.soTienMucTieu !== null ? String(fund.soTienMucTieu) : '',
            so_tien_ho_tro_toi_da: fund.soTienHoTroToiDa !== null ? String(fund.soTienHoTroToiDa) : '',
            so_luong_chi_tieu: fund.soLuongChiTieu !== null ? String(fund.soLuongChiTieu) : '',
            han_nop_don: fund.hanNopDon ? fund.hanNopDon.split('T')[0] : '',
            dieu_kien_tom_tat: fund.dieuKienTomTat || '',
            so_du: String(fund.soDu || 0),
            trang_thai: fund.trangThai || 'Dang hoat dong',
            loai_dieuhanh: fund.loaiDieuHanh === 'Tap trung - Muc chi'
              ? 'Tap trung - Muc chi'
              : 'Tap trung - Be chung',
            quy_cha_id: fund.quyChaId !== null ? String(fund.quyChaId) : '',
          });
        }
      } catch (err) {
        console.error('Error fetching fund detail:', err);
        toast.error('Lỗi khi tải thông tin quỹ');
      }
    };
    fetchFund();

    return () => {
      mounted = false;
    };
  }, [id, isEditMode]);

  // Auto-calculate default values for disbursement rounds when number changes
  useEffect(() => {
    const soDot = parseInt(form.so_dot_giai_ngan) || 0;
    const mucTieu = parseFloat(form.so_tien_muc_tieu) || 0;

    if (soDot > 0) {
      const today = new Date();
      const endDate = form.han_nop_don ? new Date(form.han_nop_don) : new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000); // mặc định 3 tháng
      const tongThoiGian = endDate - today;
      const tienMoiDot = mucTieu > 0 ? mucTieu / soDot : 0;

      const newDots = [];
      for (let i = 1; i <= soDot; i++) {
        const ngayDuKien = new Date(today.getTime() + tongThoiGian * (i / (soDot + 1)));
        newDots.push({
          thutu: i,
          tenDot: `Đợt ${i}`,
          mota: `Đợt giải ngân thứ ${i}`,
          sotiendukien: Math.round(tienMoiDot),
          ngaydukien: ngayDuKien.toISOString().split('T')[0]
        });
      }
      setDotGiaiNgan(newDots);
    } else {
      setDotGiaiNgan([]);
    }
  }, [form.so_dot_giai_ngan, form.so_tien_muc_tieu, form.han_nop_don]);

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

  // Handler for updating individual disbursement round fields
  const handleDotChange = (index, field) => (e) => {
    const value = e.target.value;
    setDotGiaiNgan((prev) => {
      const newDots = [...prev];
      newDots[index] = { ...newDots[index], [field]: value };
      return newDots;
    });
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
      const res = await uploadService.uploadFundImage(file);
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

    if (form.loai_dieuhanh === 'Tap trung - Muc chi' && !form.quy_cha_id) {
      next.quy_cha_id = 'Vui lòng chọn Quỹ phát triển chung (Bể lớn)';
    }

    if (form.mo_ta && form.mo_ta.length > 255) {
      next.mo_ta = 'Mô tả tối đa 255 ký tự';
    }

    if (form.dieu_kien_tom_tat && form.dieu_kien_tom_tat.length > 100000) {
      next.dieu_kien_tom_tat = 'Điều kiện tối đa 100000 ký tự';
    }

    const soDu = form.so_du === '' ? 0 : Number(form.so_du);
    if (Number.isNaN(soDu) || soDu < 0) {
      next.so_du = 'Số dư phải là số ≥ 0';
    } else if (!isEditMode && form.loai_dieuhanh === 'Tap trung - Muc chi' && form.quy_cha_id) {
      const parentFund = beChungList.find((b) => String(b.quyId) === String(form.quy_cha_id));
      if (parentFund && soDu > parseFloat(parentFund.soDu || 0)) {
        next.so_du = `Số dư khởi tạo không được vượt quá số dư hiện tại của Quỹ mẹ (${parseFloat(parentFund.soDu || 0).toLocaleString('vi-VN')}đ)`;
      }
    }

    const mucTieu = form.so_tien_muc_tieu === '' ? null : Number(form.so_tien_muc_tieu);
    const hoTroToiDa = form.so_tien_ho_tro_toi_da === '' ? null : Number(form.so_tien_ho_tro_toi_da);
    const soLuongChiTieu = form.so_luong_chi_tieu === '' ? null : Number(form.so_luong_chi_tieu);
    
    if (mucTieu !== null && (Number.isNaN(mucTieu) || mucTieu < 0)) {
      next.so_tien_muc_tieu = 'Số tiền mục tiêu phải ≥ 0';
    }
    if (hoTroToiDa !== null && (Number.isNaN(hoTroToiDa) || hoTroToiDa < 0)) {
      next.so_tien_ho_tro_toi_da = 'Số tiền hỗ trợ tối đa phải ≥ 0';
    }

    if (soLuongChiTieu !== null) {
      if (Number.isNaN(soLuongChiTieu) || soLuongChiTieu <= 0 || !Number.isInteger(soLuongChiTieu)) {
        next.so_luong_chi_tieu = 'Số suất phải là số nguyên > 0';
      }
    }

    if (
      mucTieu !== null &&
      mucTieu > 0 &&
      hoTroToiDa !== null &&
      hoTroToiDa > 0 &&
      !next.so_tien_muc_tieu &&
      !next.so_tien_ho_tro_toi_da
    ) {
      const expectedSeats = mucTieu / hoTroToiDa;
      if (!Number.isInteger(expectedSeats)) {
        next.so_luong_chi_tieu = 'Số tiền mục tiêu phải chia hết cho số tiền hỗ trợ mỗi suất';
      } else if (soLuongChiTieu === null) {
        next.so_luong_chi_tieu = `Vui lòng nhập số suất bằng ${expectedSeats}`;
      } else if (!next.so_luong_chi_tieu && soLuongChiTieu !== expectedSeats) {
        next.so_luong_chi_tieu = `Số suất phải bằng Số tiền mục tiêu / Số tiền hỗ trợ mỗi suất: ${expectedSeats} suất`;
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
      soTienMucTieu:
        form.so_tien_muc_tieu === '' ? null : Number(form.so_tien_muc_tieu),
      soTienHoTroToiDa:
        form.so_tien_ho_tro_toi_da === '' ? null : Number(form.so_tien_ho_tro_toi_da),
      soLuongChiTieu:
        form.so_luong_chi_tieu === '' ? null : Number(form.so_luong_chi_tieu),
      hanNopDon: form.han_nop_don || null,
      dieuKienTomTat: form.dieu_kien_tom_tat?.trim() || null,
      soDu: form.so_du === '' ? 0 : Number(form.so_du),
      trangThai: form.trang_thai,
      nguoiTao: user?.id || null, // Thêm ID người tạo từ user hiện tại
      loaiDieuHanh: form.loai_dieuhanh,
      quyChaId: form.loai_dieuhanh === 'Tap trung - Muc chi' ? Number(form.quy_cha_id) : null,
      soDotGiaiNgan: form.so_dot_giai_ngan ? Number(form.so_dot_giai_ngan) : 0,
      dotGiaiNgan: dotGiaiNgan // Chi tiết các đợt giải ngân
    };

    try {
      setSubmitting(true);
      const res = isEditMode ? await updateFund(id, payload) : await createFund(payload);
      if (res?.success) {
        toast.success(isEditMode ? 'Cập nhật quỹ thành công' : 'Tạo quỹ thành công');
        const parentPath = window.location.pathname.startsWith('/admin') ? '/admin/quy' : '/can-bo/quy';
        navigate(parentPath);
      } else {
        toast.error(res?.message || (isEditMode ? 'Không thể cập nhật quỹ' : 'Không thể tạo quỹ'));
      }
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const previewUrl = form.hinh_anh ? buildImageUrl(form.hinh_anh) : '';

  const parentUrl = window.location.pathname.startsWith('/admin') ? '/admin/quy' : '/can-bo/quy';

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <Link to="/" className={styles.crumbLink}>
            Trang chủ
          </Link>
          <span className={styles.crumbSep}>/</span>
          <Link to={parentUrl} className={styles.crumbLink}>
            Danh sách Quỹ
          </Link>
          <span className={styles.crumbSep}>/</span>
          <span>{isEditMode ? 'Cập nhật quỹ' : 'Tạo quỹ mới'}</span>
        </div>

        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerText}>
            <h1 className={styles.title}>
              {isEditMode ? 'Cập nhật thông tin quỹ' : 'Tạo quỹ mới'}
            </h1>
            <p className={styles.subtitle}>
              {isEditMode
                ? 'Chỉnh sửa thông tin chi tiết của quỹ hỗ trợ'
                : 'Thiết lập thông tin chi tiết cho một quỹ hỗ trợ mới'}
            </p>
          </div>
          <Button
            variant="ghost"
            leftIcon={<HiOutlineArrowLeft />}
            onClick={() => navigate(parentUrl)}
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
                  {loaiQuyList.map((item) => (
                    <option key={item.maLoai} value={item.maLoai}>
                      {item.tenLoai}
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

              <div className={styles.col}>
                <label className={styles.label}>
                  Hình thức vận hành <span className={styles.required}>*</span>
                </label>
                <select
                  className={styles.select}
                  value={form.loai_dieuhanh}
                  onChange={handleChange('loai_dieuhanh')}
                >
                  <option value="Tap trung - Be chung">Quỹ chung (Bể lớn)</option>
                  <option value="Tap trung - Muc chi">Mục chi con (Trích từ bể lớn)</option>
                </select>
              </div>

              {form.loai_dieuhanh === 'Tap trung - Muc chi' && (
                <div className={styles.col}>
                  <label className={styles.label}>
                    Chọn Quỹ phát triển chung (Bể lớn) <span className={styles.required}>*</span>
                  </label>
                  <select
                    className={`${styles.select} ${
                      errors.quy_cha_id ? styles.selectError : ''
                    }`}
                    value={form.quy_cha_id}
                    onChange={handleChange('quy_cha_id')}
                  >
                    <option value="">-- Chọn Bể tiền lớn --</option>
                    {beChungList.map((item) => (
                      <option key={item.quyId} value={item.quyId}>
                        {item.tenQuy} (Số dư: {parseFloat(item.soDu || 0).toLocaleString('vi-VN')}đ)
                      </option>
                    ))}
                  </select>
                  {errors.quy_cha_id && (
                    <span className={styles.errorMsg}>{errors.quy_cha_id}</span>
                  )}
                </div>
              )}

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
                  disabled={isEditMode}
                />
              </div>

              <div className={styles.col}>
                <label className={styles.label}>
                  Số tiền mục tiêu (đ)
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 400, marginLeft: '4px' }}>
                    (Tổng số tiền cần quyên góp)
                  </span>
                </label>
                <Input
                  type="number"
                  min="0"
                  placeholder="Để trống nếu không quy định"
                  value={form.so_tien_muc_tieu}
                  onChange={handleChange('so_tien_muc_tieu')}
                  error={!!errors.so_tien_muc_tieu}
                  errorMessage={errors.so_tien_muc_tieu}
                />
              </div>

              <div className={styles.col}>
                <label className={styles.label}>
                  Số tiền hỗ trợ tối đa/sinh viên (đ)
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 400, marginLeft: '4px' }}>
                    (Mức hỗ trợ tối đa cho mỗi SV)
                  </span>
                </label>
                <Input
                  type="number"
                  min="0"
                  placeholder="Để trống nếu không quy định"
                  value={form.so_tien_ho_tro_toi_da}
                  onChange={handleChange('so_tien_ho_tro_toi_da')}
                  error={!!errors.so_tien_ho_tro_toi_da}
                  errorMessage={errors.so_tien_ho_tro_toi_da}
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

              <div className={styles.col}>
                <label className={styles.label}>Số đợt giải ngân</label>
                <select
                  className={styles.select}
                  value={form.so_dot_giai_ngan}
                  onChange={handleChange('so_dot_giai_ngan')}
                >
                  <option value="">Không chia đợt</option>
                  <option value="1">1 đợt</option>
                  <option value="2">2 đợt</option>
                  <option value="3">3 đợt</option>
                  <option value="4">4 đợt</option>
                </select>
              </div>

              {/* Chi tiết các đợt giải ngân */}
              {dotGiaiNgan.length > 0 && (
                <div className={styles.colFull}>
                  <label className={styles.label}>Chi tiết đợt giải ngân</label>
                  <div className={styles.dotsContainer}>
                    {dotGiaiNgan.map((dot, index) => (
                      <div key={index} className={styles.dotCard}>
                        <div className={styles.dotHeader}>
                          <span className={styles.dotBadge}>Đợt {dot.thutu}</span>
                        </div>
                        <div className={styles.dotGrid}>
                          <div className={styles.dotField}>
                            <label className={styles.dotLabel}>Tên đợt</label>
                            <input
                              type="text"
                              className={styles.dotInput}
                              value={dot.tenDot}
                              onChange={handleDotChange(index, 'tenDot')}
                              placeholder={`Đợt ${dot.thutu}`}
                            />
                          </div>
                          <div className={styles.dotField}>
                            <label className={styles.dotLabel}>Số tiền dự kiến (VNĐ)</label>
                            <input
                              type="number"
                              className={styles.dotInput}
                              value={dot.sotiendukien}
                              onChange={handleDotChange(index, 'sotiendukien')}
                              min="0"
                            />
                          </div>
                          <div className={styles.dotField}>
                            <label className={styles.dotLabel}>Ngày dự kiến</label>
                            <input
                              type="date"
                              className={styles.dotInput}
                              value={dot.ngaydukien}
                              onChange={handleDotChange(index, 'ngaydukien')}
                            />
                          </div>
                          <div className={styles.dotField}>
                            <label className={styles.dotLabel}>Mô tả</label>
                            <input
                              type="text"
                              className={styles.dotInput}
                              value={dot.mota}
                              onChange={handleDotChange(index, 'mota')}
                              placeholder="Mô tả đợt giải ngân"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.colFull}>
                <label className={styles.label}>Điều kiện tóm tắt</label>
                <textarea
                  className={`${styles.textarea} ${
                    errors.dieu_kien_tom_tat ? styles.textareaError : ''
                  }`}
                  placeholder="Điều kiện hiển thị trên thẻ (tối đa 100000 ký tự)"
                  value={form.dieu_kien_tom_tat}
                  onChange={handleChange('dieu_kien_tom_tat')}
                  rows={6}
                  maxLength={100000}
                />
                <div className={styles.fieldFoot}>
                  {errors.dieu_kien_tom_tat && (
                    <span className={styles.errorMsg}>
                      {errors.dieu_kien_tom_tat}
                    </span>
                  )}
                  <span className={styles.counter}>
                    {form.dieu_kien_tom_tat.length}/100000
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* ── Footer ───────────────────────────── */}
          <div className={styles.footer}>
            {!isEditMode && (
              <Button
                variant="ghost"
                type="button"
                leftIcon={<HiOutlineXMark />}
                onClick={handleReset}
                disabled={submitting}
              >
                Đặt lại
              </Button>
            )}
            <div className={styles.footerRight} style={{ marginLeft: isEditMode ? 'auto' : undefined }}>
              <Button
                variant="secondary"
                type="button"
                onClick={() => navigate(parentUrl)}
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
                {isEditMode ? 'Lưu thay đổi' : 'Tạo quỹ'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaoQuyPage;
