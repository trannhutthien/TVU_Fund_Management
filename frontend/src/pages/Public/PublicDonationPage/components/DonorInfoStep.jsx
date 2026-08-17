import { memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import Input from '@components/common/Input/Input';
import { LOAI_NHA_TAI_TRO } from '../constants';
import { normalizePhone } from '../formatters';
import styles from './DonorInfoStep.module.scss';

const DonorInfoStep = memo(({ formData, errors, touched, onFieldChange, onFieldBlur }) => {
  const handleInputChange = useCallback((field, value) => {
    const processed = field === 'soDienThoai' ? normalizePhone(value) : value;
    onFieldChange(field, processed);
  }, [onFieldChange]);

  const handleBlur = useCallback((field) => {
    onFieldBlur(field);
  }, [onFieldBlur]);

  const isOrg = ['To chuc', 'Doanh nghiep', 'Doi tac'].includes(formData.loaiNhaTaiTro);

  return (
    <div className={styles.stepContent}>
      <div className={styles.sectionTitle}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a5276" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <h3>Thông tin nhà tài trợ</h3>
      </div>

      <div className={styles.formGrid}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Họ và tên <span className={styles.required}>*</span></label>
          <Input
            type="text"
            placeholder="Nguyễn Văn A"
            value={formData.hoTen || ''}
            onChange={(e) => handleInputChange('hoTen', e.target.value)}
            onBlur={() => handleBlur('hoTen')}
            error={touched.hoTen && !!errors.hoTen}
            errorMessage={errors.hoTen}
            required
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Email <span className={styles.required}>*</span></label>
          <Input
            type="email"
            placeholder="email@example.com"
            value={formData.email || ''}
            onChange={(e) => handleInputChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            error={touched.email && !!errors.email}
            errorMessage={errors.email}
            required
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Số điện thoại <span className={styles.required}>*</span></label>
          <Input
            type="tel"
            placeholder="0912345678"
            value={formData.soDienThoai || ''}
            onChange={(e) => handleInputChange('soDienThoai', e.target.value)}
            onBlur={() => handleBlur('soDienThoai')}
            maxLength={11}
            error={touched.soDienThoai && !!errors.soDienThoai}
            errorMessage={errors.soDienThoai}
            required
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Loại nhà tài trợ</label>
          <select
            className={styles.select}
            value={formData.loaiNhaTaiTro || 'Ca nhan'}
            onChange={(e) => handleInputChange('loaiNhaTaiTro', e.target.value)}
          >
            {LOAI_NHA_TAI_TRO.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </div>

        {isOrg && (
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Tên tổ chức / Doanh nghiệp <span className={styles.required}>*</span></label>
            <Input
              type="text"
              placeholder="Công ty ABC, Viện XYZ..."
              value={formData.toChuc || ''}
              onChange={(e) => handleInputChange('toChuc', e.target.value)}
              onBlur={() => handleBlur('toChuc')}
              error={touched.toChuc && !!errors.toChuc}
              errorMessage={errors.toChuc}
              required
            />
          </div>
        )}

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Địa chỉ</label>
          <Input
            type="text"
            placeholder="Địa chỉ (không bắt buộc)"
            value={formData.diaChi || ''}
            onChange={(e) => handleInputChange('diaChi', e.target.value)}
          />
        </div>
      </div>

      <div className={styles.fieldGroup} style={{ marginTop: '16px' }}>
        <label className={styles.label}>Ghi chú</label>
        <textarea
          className={styles.textarea}
          rows={3}
          placeholder="Lời nhắn gửi tới quỹ (không bắt buộc)..."
          value={formData.ghiChu || ''}
          onChange={(e) => handleInputChange('ghiChu', e.target.value)}
        />
      </div>
    </div>
  );
});

DonorInfoStep.displayName = 'DonorInfoStep';
DonorInfoStep.propTypes = {
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object,
  touched: PropTypes.object,
  onFieldChange: PropTypes.func.isRequired,
  onFieldBlur: PropTypes.func.isRequired,
};

export default DonorInfoStep;
