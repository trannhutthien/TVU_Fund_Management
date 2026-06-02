import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { 
  HiOutlineDocumentText,
  HiOutlineCurrencyDollar,
  HiOutlineExclamationCircle,
} from 'react-icons/hi2';
import styles from './RequestContentSection.module.scss';

const suggestTitle = (fund) => {
  const hocKy = new Date().getMonth() < 6 ? 'I' : 'II';
  const namHoc = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;
  return `Đơn xin ${fund.ten_quy} học kỳ ${hocKy} năm học ${namHoc}`;
};

const getQuality = (length) => {
  if (length < 100) return { label: 'Yếu', percent: 25, color: '#ef4444' };
  if (length <= 300) return { label: 'Trung bình', percent: 60, color: '#f59e0b' };
  return { label: 'Tốt', percent: 100, color: '#10b981' };
};

const RequestContentSection = ({ onChange, values, selectedFund, onOpenAI }) => {
  const [touched, setTouched] = useState({ 
    tieu_de: false, 
    mo_ta: false,
    so_tien_yeu_cau: false 
  });

  const tieu_de = values?.tieu_de || '';
  const mo_ta = values?.mo_ta || '';
  const so_tien_yeu_cau = values?.so_tien_yeu_cau || '';

  const tieu_deError =
    touched.tieu_de && tieu_de.length > 0 && tieu_de.length < 10;
  const tieu_deRequired = touched.tieu_de && tieu_de.length === 0;
  const mo_taError =
    touched.mo_ta && mo_ta.length > 0 && mo_ta.length < 50;
  const mo_taRequired = touched.mo_ta && mo_ta.length === 0;

  // Validation số tiền
  const soTienNum = parseFloat(so_tien_yeu_cau) || 0;
  const soTienMin = selectedFund?.soTienToiThieu || 0;
  const soTienMax = selectedFund?.soTienToiDa || 0;
  
  const soTienRequired = touched.so_tien_yeu_cau && !so_tien_yeu_cau;
  const soTienTooLow = touched.so_tien_yeu_cau && soTienNum > 0 && soTienNum < soTienMin;
  const soTienTooHigh = touched.so_tien_yeu_cau && soTienNum > soTienMax;
  const soTienError = soTienRequired || soTienTooLow || soTienTooHigh;

  const handleChange = useCallback(
    (field, value) => {
      onChange?.((prev) => ({
        ...prev,
        [field]: value
      }));
    },
    [onChange]
  );

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Format số tiền hiển thị
  const formatCurrency = (value) => {
    if (!value) return '';
    // Nếu value là string, loại bỏ dấu phẩy trước khi parse
    const cleanValue = typeof value === 'string' ? value.replace(/,/g, '') : value;
    const num = parseFloat(cleanValue);
    if (isNaN(num)) return '';
    return num.toLocaleString('vi-VN');
  };

  // Handle input số tiền (chỉ cho phép số)
  const handleAmountChange = (e) => {
    // Loại bỏ tất cả ký tự không phải số
    const value = e.target.value.replace(/[^\d]/g, '');
    // Lưu giá trị dạng string số thuần (không có dấu phẩy)
    handleChange('so_tien_yeu_cau', value);
  };

  const showSuggestion = selectedFund && tieu_de === '';

  const mo_taLength = mo_ta.length;
  const charCountColor =
    mo_taLength > 1000 ? '#ef4444' : mo_taLength > 800 ? '#f59e0b' : '#94a3b8';

  const quality = mo_taLength > 0 ? getQuality(mo_taLength) : null;

  return (
    <div className={styles.card}>
      <div className={styles.sectionTitle}>
        <HiOutlineDocumentText className={styles.titleIcon} />
        <span>Phần 2: Nội dung đề nghị</span>
      </div>

      <div className={styles.fieldGroup}>
        <div className={styles.fieldLabel}>Tiêu đề đơn</div>
        <input
          type="text"
          className={`${styles.textInput} ${tieu_deError || tieu_deRequired ? styles.inputError : ''}`}
          placeholder="Ví dụ: Đơn xin hỗ trợ học phí học kỳ II năm học 2023-2024"
          value={tieu_de}
          maxLength={200}
          onChange={(e) => handleChange('tieu_de', e.target.value)}
          onBlur={() => handleBlur('tieu_de')}
        />
        {showSuggestion && (
          <div
            className={styles.suggestion}
            onClick={() => handleChange('tieu_de', suggestTitle(selectedFund))}
          >
            <span className={styles.suggestionIcon}>💡</span>
            <span className={styles.suggestionLabel}>Gợi ý:</span>{' '}
            <span className={styles.suggestionText}>
              {suggestTitle(selectedFund)}
            </span>
          </div>
        )}
        {tieu_deRequired && (
          <div className={styles.errorText}>Vui lòng nhập tiêu đề đơn</div>
        )}
        {tieu_deError && (
          <div className={styles.errorText}>
            Tiêu đề phải có ít nhất 10 ký tự
          </div>
        )}
      </div>

      {/* Số tiền yêu cầu */}
      <div className={styles.fieldGroup}>
        <div className={styles.fieldLabelRow}>
          <div className={styles.fieldLabelLeft}>
            <span className={styles.fieldLabel}>Số tiền yêu cầu hỗ trợ</span>
            <span className={styles.requiredBadge}>*Bắt buộc</span>
          </div>
        </div>
        
        <div className={styles.amountInputWrapper}>
          <HiOutlineCurrencyDollar className={styles.amountIcon} />
          <input
            type="text"
            inputMode="numeric"
            className={`${styles.amountInput} ${soTienError ? styles.inputError : ''}`}
            placeholder="Nhập số tiền (VD: 1000000)"
            value={so_tien_yeu_cau}
            onChange={handleAmountChange}
            onBlur={() => handleBlur('so_tien_yeu_cau')}
          />
          <span className={styles.amountUnit}>VNĐ</span>
        </div>

        {/* Preview số tiền đã format */}
        {so_tien_yeu_cau && !soTienError && (
          <div className={styles.amountPreview}>
            {formatCurrency(so_tien_yeu_cau)}đ
          </div>
        )}

        {/* Hiển thị range cho phép */}
        {selectedFund && (soTienMin > 0 || soTienMax > 0) && (
          <div className={styles.amountRange}>
            <HiOutlineExclamationCircle className={styles.rangeIcon} />
            <span className={styles.rangeText}>
              Mức hỗ trợ: {formatCurrency(soTienMin)} - {formatCurrency(soTienMax)} VNĐ
            </span>
          </div>
        )}

        {/* Error messages */}
        {soTienRequired && (
          <div className={styles.errorText}>Vui lòng nhập số tiền yêu cầu</div>
        )}
        {soTienTooLow && (
          <div className={styles.errorText}>
            Số tiền tối thiểu là {formatCurrency(soTienMin)} VNĐ
          </div>
        )}
        {soTienTooHigh && (
          <div className={styles.errorText}>
            Số tiền tối đa là {formatCurrency(soTienMax)} VNĐ
          </div>
        )}
        {!soTienError && so_tien_yeu_cau && (
          <div className={styles.successMessage}>
            ✓ Số tiền hợp lệ
          </div>
        )}
      </div>

      <div className={styles.fieldGroup}>
        <div className={styles.fieldLabelRow}>
          <div className={styles.fieldLabelLeft}>
            <span className={styles.fieldLabel}>Lý do & Hoàn cảnh</span>
            <span className={styles.requiredBadge}>*Bắt buộc</span>
          </div>
          <span className={styles.charCount} style={{ color: charCountColor }}>
            {mo_taLength} / 1000
          </span>
        </div>
        <div className={styles.textareaWrapper}>
          <textarea
            className={`${styles.textarea} ${mo_taError || mo_taRequired ? styles.inputError : ''}`}
            placeholder="Trình bày chi tiết hoàn cảnh cá nhân và lý do bạn cần sự hỗ trợ này..."
            value={mo_ta}
            maxLength={1000}
            onChange={(e) => handleChange('mo_ta', e.target.value)}
            onBlur={() => handleBlur('mo_ta')}
          />
          <button
            type="button"
            className={styles.aiBadge}
            onClick={onOpenAI}
          >
            ✦ AI CONNECTED
          </button>
        </div>
        {mo_taRequired && (
          <div className={styles.errorText}>Vui lòng nhập lý do & hoàn cảnh</div>
        )}
        {mo_taError && (
          <div className={styles.errorText}>
            Lý do phải có ít nhất 50 ký tự
          </div>
        )}

        {quality && (
          <div className={styles.qualityBar}>
            <span className={styles.qualityLabel}>Chất lượng nội dung:</span>
            <div className={styles.qualityTrack}>
              <div
                className={styles.qualityFill}
                style={{
                  width: `${quality.percent}%`,
                  backgroundColor: quality.color,
                }}
              />
            </div>
            <span
              className={styles.qualityStatus}
              style={{ color: quality.color }}
            >
              {quality.label}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

RequestContentSection.propTypes = {
  onChange: PropTypes.func,
  values: PropTypes.shape({
    tieu_de: PropTypes.string,
    mo_ta: PropTypes.string,
    so_tien_yeu_cau: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  selectedFund: PropTypes.object,
  onOpenAI: PropTypes.func,
};

export default RequestContentSection;
