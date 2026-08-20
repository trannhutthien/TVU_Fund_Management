import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  HiOutlineXMark,
  HiOutlineCheckCircle,
  HiOutlineUser,
  HiOutlineIdentification,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineMapPin,
  HiOutlineAcademicCap,
  HiOutlineHandRaised,
  HiOutlineBuildingOffice2,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeSlash,
} from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import Input from '@components/common/Input/Input';
import { KHOA_OPTIONS } from '@constants/departments';
import { userService } from '@services/userService';
import { ROLE_TO_NHOM, DEFAULT_NHOM_OPTIONS } from '../NhanSuSection/nhomOptions';
import styles from './CreateEditUserModal.module.scss';

const LOAI_NTT_OPTIONS = [
  { value: 'Ca nhan', label: 'Cá nhân' },
  { value: 'To chuc', label: 'Tổ chức' },
  { value: 'Doanh nghiep', label: 'Doanh nghiệp' },
  { value: 'Doi tac', label: 'Đối tác' },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9]{10,11}$/;

const passwordStrength = (pwd) => {
  let score = 0;
  if (!pwd) return 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
};

const initialForm = (user) => ({
  ho_ten: user?.ho_ten || '',
  ma_so_dinh_danh: user?.ma_so_dinh_danh || '',
  email: user?.email || '',
  so_dien_thoai: user?.so_dien_thoai || '',
  dia_chi: user?.dia_chi || '',
  khoa_phong: user?.khoa_phong || '',
  ten_nha_tai_tro: user?.ten_nha_tai_tro || '',
  loai_ntt: user?.loai_nha_tai_tro || 'Ca nhan',
  mat_khau: '',
});

const CreateEditUserModal = ({ isOpen, user, onClose, onSuccess, isAdmin = false, defaultTab = 'tat_ca', availableRoles }) => {
  const isEdit = !!user;
  const isStaff = user && Number(user.role_id) !== 4;
  const staffOnly = Array.isArray(availableRoles) && availableRoles.length > 0;
  const canChooseRole = !isEdit && (isAdmin || staffOnly);
  const chucVuMode = !isEdit && staffOnly;
  
const [selectedRole, setSelectedRole] = useState(4);
const [loaiTaiKhoan, setLoaiTaiKhoan] = useState('SINH_VIEN');
const [chucDanh, setChucDanh] = useState('');
const [nhom, setNhom] = useState('Hoi dong quy');
const [form, setForm] = useState(initialForm(user));
const [errors, setErrors] = useState({});
const [submitting, setSubmitting] = useState(false);
const [showPassword, setShowPassword] = useState(false);

useEffect(() => {
    if (isOpen) {
      const staffCheck = user && Number(user.role_id) !== 4;
      let initialRole = 4;

      if (isEdit) {
        initialRole = Number(user.role_id);
      } else if (staffOnly) {
        // Chế độ tạo tài khoản nhân viên: mặc định Cán bộ Quỹ nếu được phép
        initialRole = availableRoles.includes(3) ? 3 : availableRoles[0];
      } else if (isAdmin && defaultTab === 'nhan_vien') {
        initialRole = 2;
      }

      setSelectedRole(initialRole);
      setLoaiTaiKhoan(staffCheck ? 'NHAN_VIEN' : (user?.loai_tai_khoan || 'SINH_VIEN'));
      setChucDanh('');
      setNhom(ROLE_TO_NHOM[initialRole] || 'Hoi dong quy');
      setForm(initialForm(user));
      setErrors({});
      setShowPassword(false);
      setSubmitting(false);
    }
  }, [isOpen, user?.user_id, isAdmin, defaultTab, staffOnly]);

  if (!isOpen) return null;

  const setField = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target?.value ?? e }));
  };

  const validate = () => {
    const errs = {};
    if (!form.ho_ten.trim()) errs.ho_ten = 'Bắt buộc nhập họ tên';
    if (!form.ma_so_dinh_danh.trim()) errs.ma_so_dinh_danh = 'Bắt buộc nhập mã định danh';
    if (!isEdit) {
      if (!form.email.trim()) errs.email = 'Bắt buộc nhập email';
      else if (!EMAIL_REGEX.test(form.email.trim())) errs.email = 'Email không hợp lệ';
      if (!form.mat_khau) errs.mat_khau = 'Bắt buộc nhập mật khẩu';
      else if (form.mat_khau.length < 8) errs.mat_khau = 'Mật khẩu tối thiểu 8 ký tự';
    }
    if (form.so_dien_thoai && !PHONE_REGEX.test(form.so_dien_thoai.trim())) {
      errs.so_dien_thoai = 'SĐT phải có 10-11 chữ số';
    }
    // Chỉ validate tên nhà tài trợ khi role = 4 và loại = NHA_TAI_TRO
    if (selectedRole === 4 && loaiTaiKhoan === 'NHA_TAI_TRO' && !form.ten_nha_tai_tro.trim()) {
      errs.ten_nha_tai_tro = 'Bắt buộc nhập tên tổ chức / nhà tài trợ';
    }
    // Validate chức danh khi tạo người dùng kèm chức vụ tổ chức
    if (chucVuMode && !chucDanh.trim()) {
      errs.chucDanh = 'Bắt buộc nhập chức danh';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || submitting) return;
    
    setSubmitting(true);
    
    try {
      if (isEdit) {
        await userService.update(user.user_id, {
          ho_ten: form.ho_ten.trim(),
          so_dien_thoai: form.so_dien_thoai.trim() || null,
          dia_chi: form.dia_chi.trim() || null,
          khoa_phong: loaiTaiKhoan === 'SINH_VIEN' ? form.khoa_phong : null,
          ten_nha_tai_tro: loaiTaiKhoan === 'NHA_TAI_TRO' ? form.ten_nha_tai_tro.trim() : undefined,
          loai_ntt: loaiTaiKhoan === 'NHA_TAI_TRO' ? form.loai_ntt : undefined,
        });
        toast.success('Cập nhật người dùng thành công');
      } else {
        const payload = {
          maSoDinhDanh: form.ma_so_dinh_danh.trim(),
          hoTen: form.ho_ten.trim(),
          email: form.email.trim().toLowerCase(),
          matKhau: form.mat_khau,
          roleId: selectedRole,
          soDienThoai: form.so_dien_thoai.trim() || null,
          diaChi: form.dia_chi.trim() || null,
        };

        // Chỉ thêm các field liên quan đến người dùng (role 4)
        if (selectedRole === 4) {
          payload.loaiTaiKhoan = loaiTaiKhoan;
          payload.khoaphong = loaiTaiKhoan === 'SINH_VIEN' ? form.khoa_phong || null : null;
          payload.tenNhaTaiTro = loaiTaiKhoan === 'NHA_TAI_TRO' ? form.ten_nha_tai_tro.trim() : null;
          payload.loaiNhaTaiTro = loaiTaiKhoan === 'NHA_TAI_TRO' ? form.loai_ntt : null;
        }

        // Thêm chức danh + nhóm khi tạo người dùng kèm chức vụ tổ chức
        if (chucVuMode) {
          payload.chucDanh = chucDanh.trim();
          payload.nhom = nhom;
        }

        await userService.create(payload);
        toast.success('Tạo tài khoản thành công');
      }
      onSuccess?.();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại';
      toast.error(msg);
      setSubmitting(false); // ← Chỉ reset khi lỗi
    }
    // Không reset submitting ở đây - để modal close trước
  };

  const strength = passwordStrength(form.mat_khau);
  const strengthLabel = ['Yếu', 'Yếu', 'Trung bình', 'Khá', 'Mạnh'][strength] || 'Yếu';
  const strengthColor = ['#cbd5e1', '#ef4444', '#f59e0b', '#3b82f6', '#10b981'][strength] || '#cbd5e1';

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <h2 className={styles.title}>
            {isEdit ? 'Chỉnh sửa tài khoản' : 'Tạo tài khoản mới'}
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
          {/* Role selector — chỉ hiện khi tạo mới và có quyền chọn vai trò */}
          {canChooseRole && (
            <div className={styles.field}>
              <label className={styles.label}>
                Vai trò <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                className={styles.select}
                value={selectedRole}
                onChange={(e) => {
                  const newRole = Number(e.target.value);
                  setSelectedRole(newRole);
                  // Reset loaiTaiKhoan khi đổi vai trò
                  if (newRole !== 4) {
                    setLoaiTaiKhoan('NHAN_VIEN');
                  } else {
                    setLoaiTaiKhoan('SINH_VIEN');
                  }
                  // Mặc định nhóm theo vai trò mới (chỉ ở chế độ tạo user kèm chức vụ)
                  if (chucVuMode) {
                    setNhom(ROLE_TO_NHOM[newRole] || nhom);
                  }
                }}
              >
                {(staffOnly ? [1, 2, 3, 5] : [4, 2, 3, 5]).map(id => (
                  <option key={id} value={id}>
                    {({ 1: 'Quản trị viên', 2: 'Kế toán', 3: 'Cán bộ Quỹ', 4: 'Người dùng (Sinh viên / Nhà tài trợ)', 5: 'Ban Kiểm soát' }[id])}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Chức danh + Nhóm — chỉ khi tạo người dùng kèm chức vụ tổ chức */}
          {chucVuMode && (
            <div className={styles.chucVuRow}>
              <div className={styles.field}>
                <label className={styles.label}>
                  Chức danh <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  className={styles.select}
                  type="text"
                  value={chucDanh}
                  onChange={(e) => setChucDanh(e.target.value)}
                  placeholder="VD: Uỷ viên Hội đồng Quỹ..."
                />
                {errors.chucDanh && <div className={styles.errorText}>{errors.chucDanh}</div>}
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Nhóm</label>
                <select
                  className={styles.select}
                  value={nhom}
                  onChange={(e) => setNhom(e.target.value)}
                >
                  {DEFAULT_NHOM_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Type selector — chỉ khi tạo mới và role = 4 */}
          {!isEdit && selectedRole === 4 && (
            <div className={styles.typeSelector}>
              <button
                type="button"
                className={`${styles.typeCard} ${loaiTaiKhoan === 'SINH_VIEN' ? styles.typeActive : ''}`}
                onClick={() => setLoaiTaiKhoan('SINH_VIEN')}
              >
                <HiOutlineAcademicCap className={styles.typeIcon} />
                <div className={styles.typeText}>
                  <div className={styles.typeName}>Sinh viên</div>
                  <div className={styles.typeDesc}>Tài khoản nhận hỗ trợ từ Quỹ</div>
                </div>
              </button>
              <button
                type="button"
                className={`${styles.typeCard} ${loaiTaiKhoan === 'NHA_TAI_TRO' ? styles.typeActive : ''}`}
                onClick={() => setLoaiTaiKhoan('NHA_TAI_TRO')}
              >
                <HiOutlineHandRaised className={styles.typeIcon} />
                <div className={styles.typeText}>
                  <div className={styles.typeName}>Nhà tài trợ</div>
                  <div className={styles.typeDesc}>Cá nhân / tổ chức tài trợ Quỹ</div>
                </div>
              </button>
            </div>
          )}

          {/* Common fields */}
          <Input
            label="Họ và tên"
            required
            value={form.ho_ten}
            onChange={setField('ho_ten')}
            leftIcon={<HiOutlineUser />}
            error={!!errors.ho_ten}
            errorMessage={errors.ho_ten}
          />

          <Input
            label={
              selectedRole === 4 && loaiTaiKhoan === 'SINH_VIEN'
                ? 'MSSV'
                : selectedRole !== 4
                ? 'Mã nhân viên'
                : 'Mã số định danh'
            }
            required
            value={form.ma_so_dinh_danh}
            onChange={setField('ma_so_dinh_danh')}
            leftIcon={<HiOutlineIdentification />}
            error={!!errors.ma_so_dinh_danh}
            errorMessage={errors.ma_so_dinh_danh}
            disabled={isEdit}
          />

          <Input
            label="Email"
            type="email"
            required={!isEdit}
            value={form.email}
            onChange={setField('email')}
            leftIcon={<HiOutlineEnvelope />}
            error={!!errors.email}
            errorMessage={errors.email}
            disabled={isEdit}
          />

          <Input
            label="Số điện thoại"
            value={form.so_dien_thoai}
            onChange={setField('so_dien_thoai')}
            leftIcon={<HiOutlinePhone />}
            error={!!errors.so_dien_thoai}
            errorMessage={errors.so_dien_thoai}
            inputMode="numeric"
            maxLength={11}
          />

          <Input
            label="Địa chỉ"
            value={form.dia_chi}
            onChange={setField('dia_chi')}
            leftIcon={<HiOutlineMapPin />}
          />

          {/* SINH_VIEN field — chỉ hiện khi role = 4 và loại = SINH_VIEN */}
          {selectedRole === 4 && loaiTaiKhoan === 'SINH_VIEN' && (
            <div className={styles.field}>
              <label className={styles.label}>Khoa / Ngành</label>
              <select
                className={styles.select}
                value={form.khoa_phong}
                onChange={(e) => setForm((f) => ({ ...f, khoa_phong: e.target.value }))}
              >
                <option value="">-- Chọn khoa --</option>
                {KHOA_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* NHA_TAI_TRO fields — chỉ hiện khi role = 4 và loại = NHA_TAI_TRO */}
          {selectedRole === 4 && loaiTaiKhoan === 'NHA_TAI_TRO' && (
            <>
              <Input
                label="Tên tổ chức / nhà tài trợ"
                required
                value={form.ten_nha_tai_tro}
                onChange={setField('ten_nha_tai_tro')}
                leftIcon={<HiOutlineBuildingOffice2 />}
                error={!!errors.ten_nha_tai_tro}
                errorMessage={errors.ten_nha_tai_tro}
              />
              <div className={styles.field}>
                <label className={styles.label}>Loại nhà tài trợ</label>
                <select
                  className={styles.select}
                  value={form.loai_ntt}
                  onChange={(e) => setForm((f) => ({ ...f, loai_ntt: e.target.value }))}
                >
                  {LOAI_NTT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Password — chỉ khi tạo mới */}
          {!isEdit && (
            <div className={styles.field}>
              <div className={styles.passwordWrap}>
                <Input
                  label="Mật khẩu"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.mat_khau}
                  onChange={setField('mat_khau')}
                  leftIcon={<HiOutlineLockClosed />}
                  error={!!errors.mat_khau}
                  errorMessage={errors.mat_khau}
                  maxLength={64}
                />
                <button
                  type="button"
                  className={styles.toggleEye}
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
                </button>
              </div>
              {form.mat_khau && (
                <div className={styles.strengthRow}>
                  <div className={styles.strengthBars}>
                    {[1, 2, 3, 4].map((i) => (
                      <span
                        key={i}
                        className={styles.strengthBar}
                        style={{ background: i <= strength ? strengthColor : '#e2e8f0' }}
                      />
                    ))}
                  </div>
                  <span className={styles.strengthLabel} style={{ color: strengthColor }}>
                    {strengthLabel}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <footer className={styles.footer}>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Hủy
          </Button>
          <Button
            variant="primary"
            leftIcon={<HiOutlineCheckCircle />}
            loading={submitting}
            onClick={handleSubmit}
          >
            {isEdit ? 'Lưu thay đổi' : 'Tạo tài khoản'}
          </Button>
        </footer>
      </div>
    </div>
  );
};

export default CreateEditUserModal;
