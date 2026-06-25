import { useState, useRef } from 'react';
import {
  HiArrowUpTray,
  HiCheckCircle,
  HiInformationCircle,
  HiDocumentText,
  HiTrash,
} from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import CloseButton from '@components/common/CloseButton';
import styles from './DSImportModal.module.scss';

// ═══════════════════════════════════════════════════════════════════════════════
// ─── DS IMPORT MODAL ───────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
// CÔNG DỤNG: Modal nhập sao kê ngân hàng với 3 bước stepper
// ═══════════════════════════════════════════════════════════════════════════════

const DSImportModal = ({ onClose, onImport }) => {
  // ─── STATE ─────────────────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(1); // 1, 2, 3
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const [options, setOptions] = useState({
    autoMarkMatched: true,
    autoFlagMismatch: true,
    ignoreFileOnly: false,
  });
  const fileInputRef = useRef(null);

  // ─── HANDLE FILE SELECT ────────────────────────────────────────────────────
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv',
      ];
      if (!validTypes.includes(file.type)) {
        alert('Chỉ hỗ trợ file .xlsx hoặc .csv');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File không được vượt quá 10MB');
        return;
      }

      setSelectedFile(file);
    }
  };

  // ─── HANDLE DRAG & DROP ────────────────────────────────────────────────────
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      // Create a fake event to reuse handleFileSelect
      handleFileSelect({ target: { files: [file] } });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // ─── HANDLE REMOVE FILE ────────────────────────────────────────────────────
  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ─── HANDLE PROCESS FILE ───────────────────────────────────────────────────
  const handleProcessFile = async () => {
    if (!selectedFile) return;

    try {
      setIsProcessing(true);

      // Call API to process file
      const result = await onImport(selectedFile);

      // Set match result
      setMatchResult(result);

      // Move to step 2
      setCurrentStep(2);
    } catch (error) {
      console.error('Lỗi xử lý file:', error);
      alert('Có lỗi xảy ra khi xử lý file');
    } finally {
      setIsProcessing(false);
    }
  };

  // ─── HANDLE APPLY RESULT ───────────────────────────────────────────────────
  const handleApplyResult = async () => {
    try {
      setIsSubmitting(true);
      alert('Đã áp dụng kết quả thành công');
      onClose();
    } catch (error) {
      console.error('Lỗi áp dụng kết quả:', error);
      alert('Có lỗi xảy ra khi áp dụng kết quả');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── HANDLE DOWNLOAD TEMPLATE ──────────────────────────────────────────────
  const handleDownloadTemplate = () => {
    // Chức năng tải template sẽ được tích hợp khi có API
  };

  // ─── FORMAT FILE SIZE ──────────────────────────────────────────────────────
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // ─── RENDER STEPPER ────────────────────────────────────────────────────────
  const renderStepper = () => {
    const steps = [
      { number: 1, label: 'Tải sao kê' },
      { number: 2, label: 'Kết quả đối chiếu' },
      { number: 3, label: 'Xác nhận' },
    ];

    return (
      <div className={styles.stepper}>
        {steps.map((step, index) => (
          <div key={step.number} className={styles.stepperItem}>
            {/* Step Circle */}
            <div
              className={`${styles.stepCircle} ${
                step.number < currentStep
                  ? styles.stepCircleDone
                  : step.number === currentStep
                  ? styles.stepCircleActive
                  : styles.stepCirclePending
              }`}
            >
              {step.number < currentStep ? (
                <HiCheckCircle size={20} />
              ) : (
                step.number
              )}
            </div>

            {/* Step Label */}
            <div className={styles.stepLabel}>{step.label}</div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={`${styles.stepConnector} ${
                  step.number < currentStep ? styles.stepConnectorDone : ''
                }`}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  // ─── RENDER STEP 1 ─────────────────────────────────────────────────────────
  const renderStep1 = () => (
    <div className={styles.stepContent}>
      {/* Upload Zone */}
      <div
        className={`${styles.uploadZone} ${
          selectedFile ? styles.uploadZoneHasFile : ''
        }`}
        onClick={() => !selectedFile && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.csv"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        {selectedFile ? (
          <div className={styles.fileInfo}>
            <HiDocumentText size={40} className={styles.fileIcon} />
            <div className={styles.fileDetails}>
              <p className={styles.fileName}>{selectedFile.name}</p>
              <p className={styles.fileSize}>{formatFileSize(selectedFile.size)}</p>
            </div>
            <button
              className={styles.removeFileBtn}
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveFile();
              }}
            >
              <HiTrash size={18} />
            </button>
          </div>
        ) : (
          <>
            <HiArrowUpTray size={40} className={styles.uploadIcon} />
            <p className={styles.uploadText}>
              Kéo thả hoặc click để tải sao kê ngân hàng
            </p>
            <p className={styles.uploadSubtext}>
              Hỗ trợ file .xlsx, .csv — tối đa 10MB
            </p>
          </>
        )}
      </div>

      {/* Format Guide */}
      <div className={styles.formatGuide}>
        <h4 className={styles.formatTitle}>Định dạng file cần có:</h4>
        <ul className={styles.formatList}>
          <li>Ngày GD (Ngày giao dịch)</li>
          <li>Số tiền (Số tiền giao dịch)</li>
          <li>Nội dung (Nội dung chuyển khoản)</li>
          <li>Số TK (Số tài khoản)</li>
        </ul>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDownloadTemplate}
          className={styles.templateBtn}
        >
          Tải file mẫu
        </Button>
      </div>
    </div>
  );

  // ─── RENDER STEP 2 ─────────────────────────────────────────────────────────
  const renderStep2 = () => {
    if (!matchResult) return null;

    const { matched = [], unmatched_in_file = [], unmatched_in_db = [] } = matchResult;

    return (
      <div className={styles.stepContent}>
        {/* Summary Badges */}
        <div className={styles.summaryBadges}>
          <div className={`${styles.summaryBadge} ${styles.summaryBadgeSuccess}`}>
            ✓ {matched.length} dòng khớp
          </div>
          <div className={`${styles.summaryBadge} ${styles.summaryBadgeWarning}`}>
            ⚠ {unmatched_in_file.length} dòng trong sao kê không tìm thấy trong hệ thống
          </div>
          <div className={`${styles.summaryBadge} ${styles.summaryBadgeDanger}`}>
            ✗ {unmatched_in_db.length} giao dịch trong hệ thống không có trong sao kê
          </div>
        </div>

        {/* Result Table */}
        <div className={styles.resultTable}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>NGÀY</th>
                <th>SỐ TIỀN SAO KÊ</th>
                <th>SỐ TIỀN HT</th>
                <th>TRẠNG THÁI</th>
                <th>MÃ GD</th>
              </tr>
            </thead>
            <tbody>
              {/* Matched rows */}
              {matched.map((row, index) => (
                <tr key={`matched-${index}`} className={styles.rowMatched}>
                  <td>{new Date(row.ngay_giao_dich).toLocaleDateString('vi-VN')}</td>
                  <td>{row.so_tien_sao_ke?.toLocaleString('vi-VN')} đ</td>
                  <td>{row.so_tien?.toLocaleString('vi-VN')} đ</td>
                  <td>
                    <span className={`${styles.badge} ${styles.badgeSuccess}`}>
                      Khớp
                    </span>
                  </td>
                  <td>{row.transaction_id}</td>
                </tr>
              ))}

              {/* Unmatched in file */}
              {unmatched_in_file.map((row, index) => (
                <tr key={`file-${index}`} className={styles.rowWarning}>
                  <td>{new Date(row.ngay_giao_dich).toLocaleDateString('vi-VN')}</td>
                  <td>{row.so_tien?.toLocaleString('vi-VN')} đ</td>
                  <td>—</td>
                  <td>
                    <span className={`${styles.badge} ${styles.badgeWarning}`}>
                      Chỉ trong sao kê
                    </span>
                  </td>
                  <td>—</td>
                </tr>
              ))}

              {/* Unmatched in DB */}
              {unmatched_in_db.map((row, index) => (
                <tr key={`db-${index}`} className={styles.rowDanger}>
                  <td>{new Date(row.ngay_giao_dich).toLocaleDateString('vi-VN')}</td>
                  <td>—</td>
                  <td>{row.so_tien?.toLocaleString('vi-VN')} đ</td>
                  <td>
                    <span className={`${styles.badge} ${styles.badgeDanger}`}>
                      Chỉ trong hệ thống
                    </span>
                  </td>
                  <td>{row.transaction_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Options */}
        <div className={styles.options}>
          <label className={styles.optionItem}>
            <input
              type="checkbox"
              checked={options.autoMarkMatched}
              onChange={(e) =>
                setOptions({ ...options, autoMarkMatched: e.target.checked })
              }
            />
            <span>Tự động đánh dấu "Đã đối soát" cho các dòng khớp hoàn toàn</span>
          </label>
          <label className={styles.optionItem}>
            <input
              type="checkbox"
              checked={options.autoFlagMismatch}
              onChange={(e) =>
                setOptions({ ...options, autoFlagMismatch: e.target.checked })
              }
            />
            <span>Tự động gắn cờ "Bất thường" cho các dòng lệch số tiền</span>
          </label>
          <label className={styles.optionItem}>
            <input
              type="checkbox"
              checked={options.ignoreFileOnly}
              onChange={(e) =>
                setOptions({ ...options, ignoreFileOnly: e.target.checked })
              }
            />
            <span>Bỏ qua các dòng chỉ có trong sao kê</span>
          </label>
        </div>
      </div>
    );
  };

  // ─── RENDER STEP 3 ─────────────────────────────────────────────────────────
  const renderStep3 = () => {
    if (!matchResult) return null;

    const { matched = [], unmatched_in_file = [], unmatched_in_db = [] } = matchResult;

    const willMarkMatched = options.autoMarkMatched ? matched.length : 0;
    const willFlagMismatch = options.autoFlagMismatch
      ? unmatched_in_file.length + unmatched_in_db.length
      : 0;
    const willNotChange =
      matched.length + unmatched_in_file.length + unmatched_in_db.length -
      willMarkMatched -
      willFlagMismatch;

    return (
      <div className={styles.stepContent}>
        {/* Summary Cards */}
        <div className={styles.summaryCards}>
          {willMarkMatched > 0 && (
            <div className={`${styles.summaryCard} ${styles.summaryCardSuccess}`}>
              <span className={styles.summaryCardNumber}>{willMarkMatched}</span>
              <span className={styles.summaryCardText}>
                giao dịch sẽ được đánh dấu Đã đối soát
              </span>
            </div>
          )}
          {willFlagMismatch > 0 && (
            <div className={`${styles.summaryCard} ${styles.summaryCardDanger}`}>
              <span className={styles.summaryCardNumber}>{willFlagMismatch}</span>
              <span className={styles.summaryCardText}>
                giao dịch sẽ bị gắn cờ Bất thường
              </span>
            </div>
          )}
          {willNotChange > 0 && (
            <div className={`${styles.summaryCard} ${styles.summaryCardGray}`}>
              <span className={styles.summaryCardNumber}>{willNotChange}</span>
              <span className={styles.summaryCardText}>giao dịch không thay đổi</span>
            </div>
          )}
        </div>

        {/* Warning */}
        <div className={styles.warning}>
          <HiInformationCircle size={20} className={styles.warningIcon} />
          <p className={styles.warningText}>
            Hành động này sẽ cập nhật trạng thái đối soát. Bạn vẫn có thể chỉnh sửa
            thủ công sau.
          </p>
        </div>
      </div>
    );
  };

  // ─── RENDER FOOTER ─────────────────────────────────────────────────────────
  const renderFooter = () => {
    if (currentStep === 1) {
      return (
        <>
          <Button variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleProcessFile}
            disabled={!selectedFile || isProcessing}
            loading={isProcessing}
          >
            Tiến hành đối chiếu
          </Button>
        </>
      );
    }

    if (currentStep === 2) {
      return (
        <>
          <Button variant="secondary" onClick={() => setCurrentStep(1)}>
            Quay lại
          </Button>
          <Button
            variant="primary"
            onClick={() => setCurrentStep(3)}
            className={styles.btnGold}
          >
            Xác nhận áp dụng
          </Button>
        </>
      );
    }

    if (currentStep === 3) {
      return (
        <>
          <Button variant="secondary" onClick={() => setCurrentStep(2)}>
            Quay lại
          </Button>
          <Button
            variant="primary"
            onClick={handleApplyResult}
            disabled={isSubmitting}
            loading={isSubmitting}
          >
            Áp dụng kết quả
          </Button>
        </>
      );
    }
  };

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <h3 className={styles.title}>Nhập sao kê ngân hàng</h3>
          <CloseButton
            onClick={onClose}
            variant="light"
            size="md"
            className={styles.closeButton}
          />
        </div>

        {/* Stepper */}
        {renderStepper()}

        {/* Body */}
        <div className={styles.body}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>

        {/* Footer */}
        <div className={styles.footer}>{renderFooter()}</div>
      </div>
    </div>
  );
};

export default DSImportModal;
