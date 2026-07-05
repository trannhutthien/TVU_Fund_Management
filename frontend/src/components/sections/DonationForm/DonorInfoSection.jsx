import { memo, useCallback, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Input from '@components/common/Input/Input';
import styles from './DonorInfoSection.module.scss';

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((value || '').trim());
const isValidPhone = (value) => /^[0-9]{10,11}$/.test((value || '').trim());
const normalizePhoneInput = (value) => (value || '').replace(/\D/g, '').slice(0, 11);

const isDonorInfoComplete = (fields, showTypeSelector = false) => {
  const isBaseComplete = !!(
    fields.guestHoTen?.trim() &&
    isValidEmail(fields.guestEmail) &&
    isValidPhone(fields.guestSoDienThoai)
  );
  if (showTypeSelector) {
    return isBaseComplete && !!fields.loaiNhaTaiTro;
  }
  return isBaseComplete;
};

const DonorInfoSection = memo(({
  initialValues,
  onFieldsChange,
  onValidityChange,
  resetKey,
  showTypeSelector = false,
  showGhiChu = true,
}) => {
  const [fields, setFields] = useState({
    guestHoTen: '',
    guestEmail: '',
    guestSoDienThoai: '',
    guestToChuc: '',
    guestDiaChi: '',
    ghiChu: '',
    loaiNhaTaiTro: 'Ca nhan',
    ...initialValues
  });
  const [touchedFields, setTouchedFields] = useState({});

  const emailTouched = touchedFields.guestEmail;
  const phoneTouched = touchedFields.guestSoDienThoai;
  const emailInvalid = emailTouched && !isValidEmail(fields.guestEmail);
  const phoneInvalid = phoneTouched && !isValidPhone(fields.guestSoDienThoai);

  useEffect(() => {
    const nextValues = {
      guestHoTen: '',
      guestEmail: '',
      guestSoDienThoai: '',
      guestToChuc: '',
      guestDiaChi: '',
      ghiChu: '',
      loaiNhaTaiTro: 'Ca nhan',
      ...initialValues
    };
    setFields(nextValues);
    setTouchedFields({});
    onFieldsChange(nextValues);
    onValidityChange(isDonorInfoComplete(nextValues, showTypeSelector));
  }, [initialValues, onFieldsChange, onValidityChange, resetKey, showTypeSelector]);

  const handleLocalInputChange = useCallback((field, value) => {
    setFields((prev) => {
      const nextValue = field === 'guestSoDienThoai' ? normalizePhoneInput(value) : value;
      if (prev[field] === nextValue) return prev;

      const next = { ...prev, [field]: nextValue };
      onFieldsChange(next);
      onValidityChange(isDonorInfoComplete(next, showTypeSelector));
      return next;
    });
  }, [onFieldsChange, onValidityChange, showTypeSelector]);

  const handleLocalInputBlur = useCallback((field) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
  }, []);

  return (
    <div className={styles.guestFormCard}>
      <h3 className={styles.sectionHeader}>Thông tin nhà tài trợ</h3>
      
      {showTypeSelector && (
        <div className={styles.guestFormRow} style={{ marginBottom: '20px' }}>
          <div className={styles.inputGroup}>
            <label className={styles.selectLabel}>Loại nhà tài trợ *</label>
            <select
              className={styles.selectInput}
              value={fields.loaiNhaTaiTro}
              onChange={(e) => handleLocalInputChange('loaiNhaTaiTro', e.target.value)}
            >
              <option value="Ca nhan">Cá nhân</option>
              <option value="To chuc">Tổ chức</option>
              <option value="Doanh nghiep">Doanh nghiệp</option>
              <option value="Doi tac">Đối tác</option>
            </select>
          </div>
        </div>
      )}

      <div className={styles.guestFormRow}>
        <div className={styles.inputGroup}>
          <Input
            type="text"
            label="Họ và tên"
            placeholder="Nhập họ và tên..."
            value={fields.guestHoTen}
            onChange={(e) => handleLocalInputChange('guestHoTen', e.target.value)}
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <Input
            type="email"
            label="Email liên lạc"
            placeholder="Nhập email..."
            value={fields.guestEmail}
            onChange={(e) => handleLocalInputChange('guestEmail', e.target.value)}
            onBlur={() => handleLocalInputBlur('guestEmail')}
            error={emailInvalid}
            errorMessage="Email không đúng định dạng"
            success={emailTouched && isValidEmail(fields.guestEmail)}
            required
          />
        </div>
      </div>
      
      <div className={styles.guestFormRowThree}>
        <div className={styles.inputGroup}>
          <Input
            type="tel"
            label="Số điện thoại"
            placeholder="Nhập SĐT..."
            value={fields.guestSoDienThoai}
            onChange={(e) => handleLocalInputChange('guestSoDienThoai', e.target.value)}
            onBlur={() => handleLocalInputBlur('guestSoDienThoai')}
            maxLength={11}
            error={phoneInvalid}
            errorMessage="Số điện thoại phải gồm 10-11 chữ số"
            success={phoneTouched && isValidPhone(fields.guestSoDienThoai)}
            helperText="Chỉ nhập chữ số, độ dài 10-11 số"
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <Input
            type="text"
            label="Tên tổ chức (nếu có)"
            placeholder="Doanh nghiệp/Tổ chức..."
            value={fields.guestToChuc}
            onChange={(e) => handleLocalInputChange('guestToChuc', e.target.value)}
          />
        </div>
        <div className={styles.inputGroup}>
          <Input
            type="text"
            label="Địa chỉ"
            placeholder="Nhập địa chỉ..."
            value={fields.guestDiaChi}
            onChange={(e) => handleLocalInputChange('guestDiaChi', e.target.value)}
          />
        </div>
      </div>

      {showGhiChu && (
        <div className={styles.inputGroup} style={{ marginTop: '20px' }}>
          <label className={styles.selectLabel}>Ghi chú đóng góp</label>
          <textarea
            rows={3}
            placeholder="Lời nhắn gửi tới quỹ..."
            value={fields.ghiChu}
            onChange={(e) => handleLocalInputChange('ghiChu', e.target.value)}
            className={styles.textareaInput}
          />
        </div>
      )}
    </div>
  );
});

DonorInfoSection.displayName = 'DonorInfoSection';

DonorInfoSection.propTypes = {
  initialValues: PropTypes.shape({
    guestHoTen: PropTypes.string,
    guestEmail: PropTypes.string,
    guestSoDienThoai: PropTypes.string,
    guestToChuc: PropTypes.string,
    guestDiaChi: PropTypes.string,
    ghiChu: PropTypes.string,
    loaiNhaTaiTro: PropTypes.string,
  }).isRequired,
  onFieldsChange: PropTypes.func.isRequired,
  onValidityChange: PropTypes.func.isRequired,
  resetKey: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  showTypeSelector: PropTypes.bool,
  showGhiChu: PropTypes.bool,
};

export default DonorInfoSection;
