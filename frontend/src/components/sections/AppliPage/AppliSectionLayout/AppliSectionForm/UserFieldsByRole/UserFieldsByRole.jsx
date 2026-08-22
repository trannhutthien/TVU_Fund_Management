import { memo, useCallback, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  HiOutlineUser,
  HiOutlineBuildingOffice2,
  HiOutlineCalendarDays,
  HiOutlineAcademicCap,
  HiOutlineBriefcase,
  HiOutlinePhone,
  HiOutlineEnvelope,
} from 'react-icons/hi2';
import Input from '@components/common/Input/Input';
import useAuthStore from '@stores/authStore';
import api from '@services/api';
import styles from './UserFieldsByRole.module.scss';

const ROLE_LABELS = {
  sinh_vien: 'Sinh viên',
  can_bo_truong: 'Cán bộ trong trường',
  can_bo_nghi_huu: 'Cán bộ về hưu',
  nha_khoa_hoc: 'Nhà khoa học',
};

const UserFieldsByRole = ({ role, values, onChange, isGuest = false }) => {
  const user = useAuthStore((s) => s.user);
  const [khoaOptions, setKhoaOptions] = useState([]);

  // Debug: Log user object to check data
  useEffect(() => {
    if (user && role === 'sinh_vien') {
      console.log('🔍 UserFieldsByRole - User object:', user);
      console.log('📋 Khoa/Lớp data:', {
        khoaPhong: user?.khoaPhong,
        khoa_phong: user?.khoa_phong,
        lop: user?.lop,
        class: user?.class
      });
    }
  }, [user, role]);

  useEffect(() => {
    if (role === 'sinh_vien') {
      api.get('/users/faculties')
        .then((res) => {
          if (res.data?.success && Array.isArray(res.data.data)) {
            setKhoaOptions(res.data.data);
          }
        })
        .catch(() => {});
    }
  }, [role]);

  const handleFieldChange = useCallback(
    (field, value) => {
      onChange?.((prev) => ({ ...prev, [field]: value }));
    },
    [onChange]
  );

  if (!role) return null;

  const isSinhVien = role === 'sinh_vien';
  const isCanBo = role === 'can_bo_truong';
  const isNghiHuu = role === 'can_bo_nghi_huu';
  const isNhaKhoaHoc = role === 'nha_khoa_hoc';
  const isCanBoAny = isCanBo || isNghiHuu;

  return (
    <div className={styles.card}>
      <div className={styles.sectionTitle}>
        <span>Thông tin cá nhân — {ROLE_LABELS[role]}</span>
      </div>

      <div className={styles.infoBanner}>
        <HiOutlineUser className={styles.infoIcon} />
        <span>
          {isGuest
            ? 'Vui lòng điền thông tin bên dưới để chúng tôi xác minh hồ sơ.'
            : 'Hệ thống tự động lấy thông tin từ tài khoản. Vui lòng kiểm tra và bổ sung phía dưới.'}
        </span>
      </div>

      {/* ── Họ và tên ───────────────────────────── */}
      <div className={styles.fieldGroup}>
        <Input
          type="text"
          label="Họ và tên"
          placeholder={isGuest ? 'Nhập họ và tên...' : undefined}
          value={isGuest ? (values?.hoTen || '') : (user?.hoTen || user?.hoten || '')}
          readOnly={!isGuest}
          className={isGuest ? '' : styles.readonlyInput}
          onChange={isGuest ? (e) => handleFieldChange('hoTen', e.target.value) : undefined}
          leftIcon={<HiOutlineUser style={{ color: '#94a3b8' }} />}
          required={isGuest}
        />
      </div>

      {/* ── Mã số (MSSV / MSNV) ───────────────────────────── */}
      <div className={styles.fieldGroup}>
        <Input
          type="text"
          label={isSinhVien ? 'Mã số sinh viên (MSSV)' : 'Mã số nhân viên (MSNV)'}
          placeholder={isGuest ? (isSinhVien ? 'Nhập MSSV...' : 'Nhập MSNV...') : undefined}
          value={isGuest ? (values?.maSoDinhDanh || '') : (user?.maSoDinhDanh || user?.masodinhdanh || '')}
          readOnly={!isGuest}
          className={isGuest ? '' : styles.readonlyInput}
          onChange={isGuest ? (e) => handleFieldChange('maSoDinhDanh', e.target.value) : undefined}
          leftIcon={<HiOutlineAcademicCap style={{ color: '#94a3b8' }} />}
          required={isGuest}
        />
      </div>

      {/* ── Email ──────────────────────────────── */}
      <div className={styles.fieldGroup}>
        <Input
          type="email"
          label="Email"
          placeholder={isGuest ? 'Nhập email...' : undefined}
          value={isGuest ? (values?.email || '') : (user?.email || '')}
          readOnly={!isGuest}
          className={isGuest ? '' : styles.readonlyInput}
          onChange={isGuest ? (e) => handleFieldChange('email', e.target.value) : undefined}
          leftIcon={<HiOutlineEnvelope style={{ color: '#94a3b8' }} />}
          required={isGuest}
        />
      </div>

      {/* ── Số điện thoại (chỉ guest) ────────────────────── */}
      {isGuest && (
        <div className={styles.fieldGroup}>
          <Input
            type="tel"
            label="Số điện thoại"
            placeholder="Nhập số điện thoại..."
            value={values?.soDienThoai || ''}
            onChange={(e) => handleFieldChange('soDienThoai', e.target.value)}
            leftIcon={<HiOutlinePhone style={{ color: '#94a3b8' }} />}
            required
          />
        </div>
      )}

      {/* ── Sinh viên: Khoa + Lớp ─────────────────────────── */}
      {isSinhVien && (
        <div className={styles.fieldRow}>
          <div className={styles.fieldGroup}>
            {isGuest ? (
              // Guest: dropdown để chọn
              <>
                <label className={styles.fieldLabel}>
                  <HiOutlineBuildingOffice2 className={styles.fieldLabelIcon} />
                  Khoa / Phòng ban
                </label>
                <select
                  className={styles.select}
                  value={values?.khoa || ''}
                  onChange={(e) => handleFieldChange('khoa', e.target.value)}
                >
                  <option value="">-- Chọn khoa/phòng --</option>
                  {khoaOptions.map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </>
            ) : (
              // Authenticated user: readonly với giá trị từ user
              <Input
                type="text"
                label="Khoa / Phòng ban"
                value={user?.khoaPhong || user?.khoa_phong || ''}
                readOnly
                className={styles.readonlyInput}
                leftIcon={<HiOutlineBuildingOffice2 style={{ color: '#94a3b8' }} />}
              />
            )}
          </div>
          <div className={styles.fieldGroup}>
            {isGuest ? (
              // Guest: text input để nhập
              <Input
                type="text"
                label="Lớp"
                placeholder="VD: DA20TTB..."
                value={values?.lop || ''}
                onChange={(e) => handleFieldChange('lop', e.target.value)}
                leftIcon={<HiOutlineAcademicCap style={{ color: '#94a3b8' }} />}
              />
            ) : (
              // Authenticated user: readonly với giá trị từ user
              <Input
                type="text"
                label="Lớp"
                value={user?.lop || ''}
                readOnly
                className={styles.readonlyInput}
                leftIcon={<HiOutlineAcademicCap style={{ color: '#94a3b8' }} />}
              />
            )}
          </div>
        </div>
      )}

      {/* ── Cán bộ: Đơn vị công tác ───────────────────────── */}
      {isCanBoAny && (
        <>
          <div className={styles.fieldGroup}>
            <Input
              type="text"
              label="Đơn vị công tác"
              placeholder="VD: Khoa Công nghệ thông tin..."
              value={values?.donViCongTac || (isGuest ? '' : (user?.donViCongTac || user?.donvicongtac || ''))}
              onChange={(e) => handleFieldChange('donViCongTac', e.target.value)}
              leftIcon={<HiOutlineBriefcase style={{ color: '#94a3b8' }} />}
              readOnly={!isGuest}
              className={isGuest ? '' : styles.readonlyInput}
            />
          </div>

          <div className={styles.fieldGroup}>
            <div className={styles.statusBadge}>
              {isCanBo ? (
                <>
                  <span className={styles.statusDot} />
                  Đang công tác
                </>
              ) : (
                <>
                  <span className={`${styles.statusDot} ${styles.statusRetired}`} />
                  Đã nghỉ hưu
                </>
              )}
            </div>
          </div>

          {isNghiHuu && (
            <div className={styles.fieldGroup}>
              <Input
                type="number"
                label="Số năm công tác (ước tính)"
                placeholder="VD: 25..."
                value={values?.soNamCongTac || ''}
                onChange={(e) => handleFieldChange('soNamCongTac', e.target.value)}
                leftIcon={<HiOutlineCalendarDays style={{ color: '#94a3b8' }} />}
              />
            </div>
          )}
        </>
      )}

      {/* ── Nhà khoa học: Đơn vị + Chuyên môn ─────────────── */}
      {isNhaKhoaHoc && (
        <>
          <div className={styles.fieldGroup}>
            <Input
              type="text"
              label="Đơn vị công tác / Nghiên cứu"
              placeholder="VD: Viện Nghiên cứu phát triển..."
              value={values?.donViCongTac || (isGuest ? '' : (user?.donViCongTac || user?.donvicongtac || ''))}
              onChange={(e) => handleFieldChange('donViCongTac', e.target.value)}
              leftIcon={<HiOutlineBriefcase style={{ color: '#94a3b8' }} />}
              readOnly={!isGuest}
              className={isGuest ? '' : styles.readonlyInput}
            />
          </div>
          <div className={styles.fieldGroup}>
            <Input
              type="text"
              label="Lĩnh vực chuyên môn"
              placeholder="VD: Công nghệ thông tin, Nông nghiệp..."
              value={values?.chuyenMon || ''}
              onChange={(e) => handleFieldChange('chuyenMon', e.target.value)}
              leftIcon={<HiOutlineBuildingOffice2 style={{ color: '#94a3b8' }} />}
            />
          </div>
        </>
      )}
    </div>
  );
};

UserFieldsByRole.propTypes = {
  role: PropTypes.string,
  values: PropTypes.object,
  onChange: PropTypes.func,
  isGuest: PropTypes.bool,
};

export default memo(UserFieldsByRole);
