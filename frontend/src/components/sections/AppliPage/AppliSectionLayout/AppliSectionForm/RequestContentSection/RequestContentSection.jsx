import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { 
  HiOutlineDocumentText,
  HiOutlineCurrencyDollar,
  HiOutlineExclamationCircle,
  HiOutlineCheckCircle,
  HiOutlineInformationCircle,
  HiOutlineArrowsRightLeft,
} from 'react-icons/hi2';
import CurrencyInput from '@components/common/CurrencyInput';
import { LOAI_HO_TRO, LOAI_HO_TRO_OPTIONS } from '@constants/loaiHoTro';
import LoanTypeInfoPanel from '@components/common/LoanType/LoanTypeInfoPanel';
import LoanTypeCompareModal from '@components/common/LoanType/LoanTypeCompareModal';
import AIAssistantPanel from '../../AppliSidebar/AIAssistantPanel/AIAssistantPanel';
import styles from './RequestContentSection.module.scss';

const suggestTitle = (fund) => {
  const hocKy = new Date().getMonth() < 6 ? 'I' : 'II';
  const namHoc = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;
  const fundName = fund?.tenQuy || fund?.ten_quy || 'hỗ trợ';
  return `Đơn xin ${fundName} học kỳ ${hocKy} năm học ${namHoc}`;
};

const getQuality = (length) => {
  if (length < 100) return { label: 'Yếu', percent: 25, color: '#ef4444' };
  if (length <= 300) return { label: 'Trung bình', percent: 60, color: '#f59e0b' };
  return { label: 'Tốt', percent: 100, color: '#10b981' };
};

const RequestContentSection = ({ onChange, values, selectedFund, onOpenAI, nextButton, isGuest }) => {
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [touched, setTouched] = useState({ 
    tieu_de: false, 
    mo_ta: false,
    so_tien_yeu_cau: false,
    tong_kinh_phi_du_an: false,
  });

  const tieu_de = values?.tieu_de || '';
  const mo_ta = values?.mo_ta || '';
  const so_tien_yeu_cau = values?.so_tien_yeu_cau || '';
  const loai_hotro = values?.loai_hotro || LOAI_HO_TRO.TAI_TRO_KHONG_HOAN_LAI;
  const tong_kinh_phi_du_an = values?.tong_kinh_phi_du_an || '';

  const tieu_deError =
    touched.tieu_de && tieu_de.length > 0 && tieu_de.length < 10;
  const tieu_deRequired = touched.tieu_de && tieu_de.length === 0;
  const mo_taError =
    touched.mo_ta && mo_ta.length > 0 && mo_ta.length < 50;
  const mo_taRequired = touched.mo_ta && mo_ta.length === 0;

  // Validation số tiền (dựa trên trần quỹ `sotienhotrotoida`)
  const soTienNum = parseFloat(so_tien_yeu_cau) || 0;
  const soTienMin = selectedFund?.soTienToiThieu || 0;
  const soTienMax = selectedFund?.soTienToiDa || selectedFund?.soTienHoTroToiDa || 0;
  const hasMaxLimit = soTienMax > 0;

  const soTienRequired = touched.so_tien_yeu_cau && !so_tien_yeu_cau;
  const soTienTooLow = touched.so_tien_yeu_cau && soTienNum > 0 && soTienMin > 0 && soTienNum < soTienMin;
  const soTienTooHigh = touched.so_tien_yeu_cau && hasMaxLimit && soTienNum > soTienMax;
  const soTienError = soTienRequired || soTienTooLow || soTienTooHigh;

  // Validation tổng kinh phí dự án
  const tongKinhPhiNum = parseFloat(tong_kinh_phi_du_an) || 0;
  const tongKinhPhiRequired = touched.tong_kinh_phi_du_an && !tong_kinh_phi_du_an;
  const tongKinhPhiTooLow = touched.tong_kinh_phi_du_an && tongKinhPhiNum > 0 && tongKinhPhiNum < soTienNum;
  const tongKinhPhiError = tongKinhPhiRequired || tongKinhPhiTooLow;
  const showTongKinhPhi = loai_hotro === LOAI_HO_TRO.TAI_TRO_CO_THU_HOI;
  const showChoVayAlert = loai_hotro === LOAI_HO_TRO.CHO_VAY;

  // Tỷ lệ phần trăm
  const percentRatio = (soTienNum > 0 && tongKinhPhiNum > 0)
    ? ((soTienNum / tongKinhPhiNum) * 100).toFixed(1)
    : null;
  const isOver30 = percentRatio && parseFloat(percentRatio) > 30;

  const handleChange = useCallback(
    (field, value) => {
      onChange?.((prev) => ({
        ...prev,
        [field]: value
      }));
    },
    [onChange]
  );

  const handleLoaiHoTroChange = useCallback((value) => {
    handleChange('loai_hotro', value);
    if (value === LOAI_HO_TRO.TAI_TRO_CO_THU_HOI) {
      handleChange('la_de_tai', true);
    } else {
      handleChange('tong_kinh_phi_du_an', null);
      if (value === LOAI_HO_TRO.CHO_VAY) {
        handleChange('la_de_tai', false);
      }
    }
  }, [handleChange]);

  const handleApplyAISuggestion = useCallback((newText) => {
    handleChange('mo_ta', newText);
  }, [handleChange]);

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Format số tiền hiển thị — dùng shared utility
  const formatCurrencyPlain = (value) => {
    if (value === null || value === undefined || value === '') return '';
    const cleanValue = typeof value === 'string' ? value.replace(/[^0-9]/g, '') : value;
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
          <CurrencyInput
            value={so_tien_yeu_cau}
            onChange={(raw) => handleChange('so_tien_yeu_cau', raw)}
            className={`${styles.amountInput} ${soTienError ? styles.inputError : ''}`}
            placeholder="Nhập số tiền (VD: 1000000)"
          />
          <span className={styles.amountUnit}>VNĐ</span>
        </div>

        {/* Preview số tiền đã format */}
        {so_tien_yeu_cau && !soTienError && (
          <div className={styles.amountPreview}>
            {formatCurrencyPlain(so_tien_yeu_cau)}đ
          </div>
        )}

        {/* Hiển thị range cho phép */}
        {selectedFund && (soTienMin > 0 || hasMaxLimit) && (
          <div className={styles.amountRange}>
            <HiOutlineExclamationCircle className={styles.rangeIcon} />
            <span className={styles.rangeText}>
              {hasMaxLimit
                ? `Mức hỗ trợ tối đa: ${formatCurrencyPlain(soTienMax)} VNĐ`
                : `Mức hỗ trợ tối thiểu: ${formatCurrencyPlain(soTienMin)} VNĐ`}
            </span>
          </div>
        )}

        {/* Error messages */}
        {soTienRequired && (
          <div className={styles.errorText}>Vui lòng nhập số tiền yêu cầu</div>
        )}
        {soTienTooLow && (
          <div className={styles.errorText}>
            Số tiền tối thiểu là {formatCurrencyPlain(soTienMin)} VNĐ
          </div>
        )}
        {soTienTooHigh && (
          <div className={styles.errorText}>
            Số tiền tối đa là {formatCurrencyPlain(soTienMax)} VNĐ
          </div>
        )}
        {!soTienError && so_tien_yeu_cau && (
          <div className={styles.successMessage}>
            ✓ Số tiền hợp lệ
          </div>
        )}
      </div>

      {/* ── LOẠI HÌNH HỖ TRỢ ─────────────────────────────────────────────── */}
      <div className={styles.fieldGroup}>
        <div className={styles.fieldLabelRow}>
          <div className={styles.fieldLabelLeft}>
            <span className={styles.fieldLabel}>Loại hình hỗ trợ</span>
            <span className={styles.requiredBadge}>*Bắt buộc</span>
          </div>
        </div>

        <div className={styles.loaiHoTroGroup}>
          {LOAI_HO_TRO_OPTIONS.map((option) => (
            <div
              key={option.value}
              className={`${styles.loaiHoTroCard} ${loai_hotro === option.value ? styles.loaiHoTroSelected : ''}`}
              onClick={() => handleLoaiHoTroChange(option.value)}
              role="radio"
              aria-checked={loai_hotro === option.value}
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') handleLoaiHoTroChange(option.value); }}
            >
              <div className={styles.loaiHoTroRadio}>
                <div className={`${styles.radioDot} ${loai_hotro === option.value ? styles.radioDotActive : ''}`} />
              </div>
              <div className={styles.loaiHoTroContent}>
                <div className={styles.loaiHoTroLabel}>{option.label}</div>
                <div className={styles.loaiHoTroDesc}>{option.description}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Panel mô tả động theo loại hình được chọn */}
        <LoanTypeInfoPanel selectedType={loai_hotro} />

        {/* Link so sánh 3 loại hình */}
        <button
          type="button"
          className={styles.compareLink}
          onClick={() => setShowCompareModal(true)}
        >
          <HiOutlineArrowsRightLeft className={styles.compareLinkIcon} />
          So sánh 3 loại hình hỗ trợ
        </button>

        <LoanTypeCompareModal
          open={showCompareModal}
          onClose={() => setShowCompareModal(false)}
        />

        {/* ── CHECKBOX ĐỀ TÀI/DỰ ÁN ─────────────────────────────────────── */}
        <label className={`${styles.checkboxRow} ${loai_hotro === LOAI_HO_TRO.TAI_TRO_CO_THU_HOI ? styles.checkboxDisabled : ''}`}>
          <input
            type="checkbox"
            checked={loai_hotro === LOAI_HO_TRO.TAI_TRO_CO_THU_HOI ? true : !!values?.la_de_tai}
            disabled={loai_hotro === LOAI_HO_TRO.TAI_TRO_CO_THU_HOI}
            onChange={(e) => handleChange('la_de_tai', e.target.checked)}
            className={styles.checkboxInput}
          />
          <span className={styles.checkboxLabel}>
            Đơn này là đề tài/dự án nghiên cứu
          </span>
          <span className={styles.checkboxHint}>
            {loai_hotro === LOAI_HO_TRO.TAI_TRO_CO_THU_HOI 
              ? '(Bắt buộc nghiệm thu đối với tài trợ có thu hồi)' 
              : '(Cần nghiệm thu sau giải ngân theo Điều 15 Điều lệ)'}
          </span>
        </label>
      </div>

      {/* ── TỔNG KINH PHÍ DỰ ÁN (chỉ hiện khi "Có thu hồi") ────────────── */}
      {showTongKinhPhi && (
        <div className={`${styles.fieldGroup} ${styles.tongKinhPhiWrapper}`}>
          <div className={styles.fieldLabelRow}>
            <div className={styles.fieldLabelLeft}>
              <span className={styles.fieldLabel}>
                Tổng kinh phí thực hiện dự án/đề tài
              </span>
              <span className={styles.requiredBadge}>*Bắt buộc</span>
            </div>
            <span
              className={styles.tooltipIcon}
              title="Căn cứ tính mức tài trợ tối đa Quỹ có thể hỗ trợ — không quá 30% con số này (Điều 15.1)"
            >
              <HiOutlineInformationCircle />
            </span>
          </div>

          <div className={styles.amountInputWrapper}>
            <HiOutlineCurrencyDollar className={styles.amountIcon} />
            <CurrencyInput
              value={tong_kinh_phi_du_an}
              onChange={(raw) => handleChange('tong_kinh_phi_du_an', raw)}
              className={`${styles.amountInput} ${tongKinhPhiError ? styles.inputError : ''}`}
              placeholder="Nhập tổng kinh phí dự kiến (bao gồm cả nguồn ngoài Quỹ)"
            />
            <span className={styles.amountUnit}>VNĐ</span>
          </div>

          {tong_kinh_phi_du_an && !tongKinhPhiError && (
            <div className={styles.amountPreview}>
              {formatCurrencyPlain(tong_kinh_phi_du_an)}đ
            </div>
          )}

          {tongKinhPhiRequired && (
            <div className={styles.errorText}>Vui lòng nhập tổng kinh phí dự án</div>
          )}
          {tongKinhPhiTooLow && (
            <div className={styles.errorText}>
              Tổng kinh phí dự án phải lớn hơn hoặc bằng số tiền đề nghị ({formatCurrencyPlain(soTienNum)} VNĐ)
            </div>
          )}

          {/* Gợi ý tỷ lệ phần trăm */}
          {percentRatio && !tongKinhPhiError && (
            <div className={`${styles.percentHint} ${isOver30 ? styles.percentHintWarning : ''}`}>
              Số tiền đề nghị chiếm <strong>{percentRatio}%</strong> tổng kinh phí dự án
              {isOver30 && (
                <span className={styles.percentWarning}> — Vượt quá 30%, Quỹ sẽ xem xét mức hỗ trợ tối đa</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── ALERT CHO "VAY VỐN" ──────────────────────────────────────────── */}
      {showChoVayAlert && (
        <div className={styles.fieldGroup}>
          <div className={styles.choVayAlert}>
            <HiOutlineInformationCircle className={styles.choVayAlertIcon} />
            <span>Sau khi hồ sơ được duyệt, Quỹ sẽ liên hệ để ký hợp đồng vay vốn với lãi suất và kỳ hạn cụ thể theo quy định.</span>
          </div>
        </div>
      )}

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
            className={`${styles.aiBadge} ${showAiPanel ? styles.aiBadgeActive : ''}`}
            onClick={() => setShowAiPanel(!showAiPanel)}
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

        {showAiPanel && (
          <div className={styles.aiPanelWrapper} style={{ marginTop: 20 }}>
            <AIAssistantPanel
              moTa={mo_ta}
              tieuDe={tieu_de}
              onApplySuggestion={handleApplyAISuggestion}
              selectedFund={selectedFund}
              isGuest={isGuest}
            />
          </div>
        )}
      </div>
      {nextButton}
    </div>
  );
};

RequestContentSection.propTypes = {
  onChange: PropTypes.func,
  values: PropTypes.shape({
    tieu_de: PropTypes.string,
    mo_ta: PropTypes.string,
    so_tien_yeu_cau: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    loai_hotro: PropTypes.string,
    tong_kinh_phi_du_an: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  selectedFund: PropTypes.object,
  onOpenAI: PropTypes.func,
  nextButton: PropTypes.node,
  isGuest: PropTypes.bool,
};

export default RequestContentSection;
