import { useState } from 'react';
import { toast } from 'react-toastify';
import {
  HiDocumentArrowDown,
  HiTableCells,
  HiDocumentText,
} from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import api from '@services/api';
import styles from './TKExportSection.module.scss';

// ═══════════════════════════════════════════════════════════════════════════════
// ─── TK EXPORT SECTION ─────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
// CÔNG DỤNG: Xuất báo cáo Excel/PDF với tùy chọn nội dung
// ═══════════════════════════════════════════════════════════════════════════════

const TKExportSection = ({ period, compareMode }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    summary: true, // Mặc định check, không thể bỏ
    transactions: false,
    funds: false,
    breakdownThu: false,
    breakdownChi: false,
    compare: false,
  });

  // ─── GET PERIOD LABEL ──────────────────────────────────────────────────────
  const getPeriodLabel = () => {
    if (period.type === 'month') {
      return `Tháng ${period.month}/${period.year}`;
    }
    if (period.type === 'quarter') {
      return `Quý ${period.quarter}/${period.year}`;
    }
    if (period.type === 'year') {
      return `Năm ${period.year}`;
    }
    return '';
  };

  // ─── HANDLE CHECKBOX CHANGE ────────────────────────────────────────────────
  const handleCheckboxChange = (key) => {
    if (key === 'summary') return; // Không cho bỏ check summary
    setExportOptions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // ─── HANDLE EXPORT ─────────────────────────────────────────────────────────
  const handleExport = async (format) => {
    try {
      setIsExporting(true);

      // Build sections param từ checkbox đã chọn
      const sections = Object.keys(exportOptions)
        .filter((key) => exportOptions[key])
        .join(',');

      // Convert period to date range
      let tu_ngay, den_ngay;
      
      if (period.type === 'month') {
        // Tháng: từ ngày 1 đến ngày cuối tháng
        const firstDay = new Date(period.year, period.month - 1, 1);
        const lastDay = new Date(period.year, period.month, 0);
        tu_ngay = firstDay.toISOString().split('T')[0];
        den_ngay = lastDay.toISOString().split('T')[0];
      } else if (period.type === 'quarter') {
        // Quý: từ tháng đầu đến tháng cuối quý
        const firstMonth = (period.quarter - 1) * 3;
        const lastMonth = firstMonth + 2;
        const firstDay = new Date(period.year, firstMonth, 1);
        const lastDay = new Date(period.year, lastMonth + 1, 0);
        tu_ngay = firstDay.toISOString().split('T')[0];
        den_ngay = lastDay.toISOString().split('T')[0];
      } else if (period.type === 'year') {
        // Năm: từ 1/1 đến 31/12
        const firstDay = new Date(period.year, 0, 1);
        const lastDay = new Date(period.year, 11, 31);
        tu_ngay = firstDay.toISOString().split('T')[0];
        den_ngay = lastDay.toISOString().split('T')[0];
      }

      // Build payload theo format backend yêu cầu
      const payload = {
        loai_bao_cao: 'thu_chi_tong_hop', // Loại báo cáo mặc định
        quy_id: null, // Tất cả quỹ
        tu_ngay,
        den_ngay,
        dinh_dang: format === 'excel' ? 'xlsx' : 'docx', // Backend chỉ hỗ trợ docx, không có pdf
      };

      // Gọi API backend
      const response = await api.post('/bao-cao/xuat', payload, {
        responseType: 'blob',
      });

      // Xác định MIME type
      const mime =
        format === 'excel'
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

      // Tạo blob và download
      const blob = new Blob([response.data], { type: mime });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Tạo tên file
      const periodLabel = getPeriodLabel().replace(/\s/g, '_').replace(/\//g, '-');
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const extension = format === 'excel' ? 'xlsx' : 'docx';
      link.setAttribute(
        'download',
        `BaoCao_ThuChi_${periodLabel}_${timestamp}.${extension}`,
      );
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`Xuất ${format === 'excel' ? 'Excel' : 'Word'} thành công!`);
    } catch (error) {
      console.error('Lỗi xuất báo cáo:', error);
      const message =
        error?.response?.status === 404
          ? 'API xuất báo cáo chưa được cấu hình ở backend'
          : error?.response?.data?.message || 'Có lỗi khi xuất báo cáo, vui lòng thử lại';
      toast.error(message);
    } finally {
      setIsExporting(false);
    }
  };

  // ─── CHECKBOX OPTIONS ──────────────────────────────────────────────────────
  const checkboxOptions = [
    { key: 'summary', label: 'Tổng hợp thu chi', disabled: true },
    { key: 'transactions', label: 'Chi tiết từng giao dịch', disabled: false },
    { key: 'funds', label: 'Thống kê theo quỹ', disabled: false },
    { key: 'breakdownThu', label: 'Cơ cấu nguồn thu', disabled: false },
    { key: 'breakdownChi', label: 'Cơ cấu chi phí', disabled: false },
    { key: 'compare', label: 'So sánh kỳ trước', disabled: !compareMode },
  ];

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className={styles.card}>
      {/* Card Header */}
      <div className={styles.cardHeader}>
        <div className={styles.titleBlock}>
          <HiDocumentArrowDown className={styles.titleIcon} />
          <div>
            <h3 className={styles.title}>Xuất báo cáo</h3>
            <p className={styles.subtitle}>Xuất báo cáo kỳ: {getPeriodLabel()}</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className={styles.body}>
        {/* Checkbox Options */}
        <div className={styles.options}>
          {checkboxOptions.map((option) => (
            <label
              key={option.key}
              className={`${styles.checkboxItem} ${
                exportOptions[option.key] ? styles.checked : ''
              } ${option.disabled ? styles.disabled : ''}`}
            >
              <div className={styles.checkboxBox}>
                {exportOptions[option.key] && (
                  <svg
                    className={styles.checkIcon}
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13.3334 4L6.00002 11.3333L2.66669 8"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <span className={styles.checkboxLabel}>{option.label}</span>
              <input
                type="checkbox"
                checked={exportOptions[option.key]}
                onChange={() => handleCheckboxChange(option.key)}
                disabled={option.disabled}
                className={styles.hiddenCheckbox}
              />
            </label>
          ))}
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <Button
            variant="success"
            leftIcon={<HiTableCells />}
            onClick={() => handleExport('excel')}
            loading={isExporting}
            disabled={isExporting}
          >
            Xuất Excel
          </Button>

          <Button
            variant="primary"
            leftIcon={<HiDocumentText />}
            onClick={() => handleExport('word')}
            loading={isExporting}
            disabled={isExporting}
          >
            Xuất Word
          </Button>

          <p className={styles.note}>
            * Báo cáo sẽ bao gồm header logo TVU và chữ ký kế toán
          </p>
        </div>
      </div>
    </div>
  );
};

export default TKExportSection;
