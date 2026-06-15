import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { HiDocumentArrowDown } from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import CloseButton from '@components/common/CloseButton';
import Dropdown from '@components/common/Dropdown/Dropdown';
import useAuthStore from '@stores/authStore';
import styles from './DSExportModal.module.scss';

// ═══════════════════════════════════════════════════════════════════════════════
// ─── DS EXPORT MODAL ───────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
// CÔNG DỤNG: Modal xuất biên bản đối soát với tùy chọn
// ═══════════════════════════════════════════════════════════════════════════════

const DSExportModal = ({ onClose, activeTab, filterLoai, filterDateRange, filterQuy }) => {
  const { user } = useAuthStore();

  // ─── STATE ─────────────────────────────────────────────────────────────────
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [exportOptions, setExportOptions] = useState({
    daDoisoat: true,
    batThuong: true,
    chuaDoisoat: false,
    tomTat: false,
  });
  const [nguoiLap, setNguoiLap] = useState('');
  const [ngayLap, setNgayLap] = useState('');
  const [ghiChu, setGhiChu] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // ─── INIT DATA ─────────────────────────────────────────────────────────────
  useEffect(() => {
    // Set người lập biên bản
    setNguoiLap(user?.hoTen || user?.ho_ten || 'Kế toán');

    // Set ngày lập
    const today = new Date();
    setNgayLap(today.toLocaleDateString('vi-VN'));
  }, [user]);

  // ─── GENERATE OPTIONS ──────────────────────────────────────────────────────
  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: `Tháng ${i + 1}`,
  }));

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => ({
    value: currentYear - i,
    label: `Năm ${currentYear - i}`,
  }));

  // ─── HANDLE CHECKBOX CHANGE ────────────────────────────────────────────────
  const handleCheckboxChange = (key) => {
    setExportOptions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // ─── HANDLE EXPORT ─────────────────────────────────────────────────────────
  const handleExport = async (format) => {
    try {
      setIsExporting(true);
      // Chức năng xuất file sẽ được tích hợp khi có API
      alert(`Xuất ${format === 'excel' ? 'Excel' : 'PDF'} thành công`);
      onClose();
    } catch (error) {
      console.error('Lỗi xuất biên bản:', error);
      alert('Có lỗi xảy ra khi xuất biên bản');
    } finally {
      setIsExporting(false);
    }
  };

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Overlay */}
      <div className={styles.overlay} onClick={onClose} />

      {/* Modal */}
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <HiDocumentArrowDown size={24} className={styles.headerIcon} />
            <h3 className={styles.title}>Xuất biên bản đối soát</h3>
          </div>
          <CloseButton
            onClick={onClose}
            variant="light"
            size="md"
            className={styles.closeButton}
          />
        </div>

        {/* Body */}
        <div className={styles.body}>
          {/* Chọn kỳ đối soát */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Chọn kỳ đối soát</h4>
            <div className={styles.periodRow}>
              <Dropdown
                options={monthOptions}
                value={selectedMonth}
                onChange={setSelectedMonth}
                placeholder="Chọn tháng"
                size="medium"
              />
              <Dropdown
                options={yearOptions}
                value={selectedYear}
                onChange={setSelectedYear}
                placeholder="Chọn năm"
                size="medium"
              />
            </div>
          </div>

          {/* Chọn nội dung xuất */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Chọn nội dung xuất</h4>
            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxItem}>
                <input
                  type="checkbox"
                  checked={exportOptions.daDoisoat}
                  onChange={() => handleCheckboxChange('daDoisoat')}
                />
                <span>Danh sách đã đối soát</span>
              </label>
              <label className={styles.checkboxItem}>
                <input
                  type="checkbox"
                  checked={exportOptions.batThuong}
                  onChange={() => handleCheckboxChange('batThuong')}
                />
                <span>Danh sách bất thường</span>
              </label>
              <label className={styles.checkboxItem}>
                <input
                  type="checkbox"
                  checked={exportOptions.chuaDoisoat}
                  onChange={() => handleCheckboxChange('chuaDoisoat')}
                />
                <span>Danh sách chưa đối soát</span>
              </label>
              <label className={styles.checkboxItem}>
                <input
                  type="checkbox"
                  checked={exportOptions.tomTat}
                  onChange={() => handleCheckboxChange('tomTat')}
                />
                <span>Tóm tắt thống kê</span>
              </label>
            </div>
          </div>

          {/* Thông tin biên bản */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Thông tin biên bản</h4>
            <div className={styles.infoGroup}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Người lập biên bản</label>
                <input
                  type="text"
                  className={styles.input}
                  value={nguoiLap}
                  readOnly
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Ngày lập</label>
                <input
                  type="text"
                  className={styles.input}
                  value={ngayLap}
                  readOnly
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Ghi chú/nhận xét</label>
                <textarea
                  className={styles.textarea}
                  rows={3}
                  value={ghiChu}
                  onChange={(e) => setGhiChu(e.target.value)}
                  placeholder="VD: Kỳ đối soát tháng 5/2025 hoàn thành..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <Button variant="secondary" onClick={onClose} disabled={isExporting}>
            Hủy
          </Button>
          <Button
            variant="success"
            onClick={() => handleExport('excel')}
            disabled={isExporting}
            loading={isExporting}
          >
            Xuất Excel
          </Button>
          <Button
            variant="danger"
            onClick={() => handleExport('pdf')}
            disabled={isExporting}
            loading={isExporting}
          >
            Xuất PDF
          </Button>
        </div>
      </div>
    </>
  );
};

DSExportModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  activeTab: PropTypes.string,
  filterLoai: PropTypes.string,
  filterDateRange: PropTypes.shape({
    from: PropTypes.string,
    to: PropTypes.string,
  }),
  filterQuy: PropTypes.string,
};

export default DSExportModal;
