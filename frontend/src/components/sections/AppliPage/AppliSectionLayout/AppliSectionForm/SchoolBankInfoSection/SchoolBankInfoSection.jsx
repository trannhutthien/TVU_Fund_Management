import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import {
  HiOutlineBuildingLibrary,
  HiOutlineCreditCard,
  HiOutlineClipboardDocument,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
} from 'react-icons/hi2';
import { getFundBankAccounts } from '@services/donationService';
import styles from './SchoolBankInfoSection.module.scss';

/**
 * SchoolBankInfoSection Component (Display Only)
 *
 * Hiển thị thông tin tài khoản ngân hàng của quỹ cho Nhà tài trợ
 * - Lấy thông tin tài khoản ngân hàng từ API theo quỹ được chọn
 * - Số tài khoản, tên ngân hàng, chủ tài khoản
 * - Nội dung chuyển khoản động (DONATE - Tên quỹ - Tên NTT)
 * - Copy button cho các field
 * - Hướng dẫn và lưu ý
 */
const SchoolBankInfoSection = ({ selectedFund, donorName }) => {
  const [copiedField, setCopiedField] = useState(null);
  const [bankAccount, setBankAccount] = useState(null);
  const [loading, setLoading] = useState(false);

  // Lấy thông tin tài khoản ngân hàng khi có quỹ được chọn
  useEffect(() => {
    if (!selectedFund?.quyId) {
      setBankAccount(null);
      return;
    }

    const fetchBankAccount = async () => {
      try {
        setLoading(true);
        const response = await getFundBankAccounts(selectedFund.quyId);
        if (response.success && response.bankAccounts?.length > 0) {
          // Lấy tài khoản đầu tiên (tài khoản chính)
          setBankAccount(response.bankAccounts[0]);
        } else {
          setBankAccount(null);
        }
      } catch (error) {
        console.error('Lỗi tải thông tin tài khoản ngân hàng:', error);
        setBankAccount(null);
        toast.error('Không thể tải thông tin tài khoản ngân hàng');
      } finally {
        setLoading(false);
      }
    };

    fetchBankAccount();
  }, [selectedFund?.quyId]);

  // Tạo nội dung chuyển khoản
  const transferContent = selectedFund?.tenQuy && donorName
    ? `DONATE ${selectedFund.tenQuy} ${donorName}`
    : '';

  const handleCopy = async (text, fieldName) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast.success(`Đã sao chép ${fieldName}`);

      setTimeout(() => {
        setCopiedField(null);
      }, 2000);
    } catch (error) {
      console.error('Copy failed:', error);
      toast.error('Không thể sao chép');
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.sectionTitle}>
        <HiOutlineBuildingLibrary className={styles.titleIcon} />
        <span>Thông tin chuyển khoản</span>
      </div>

      {selectedFund && (
        <div className={styles.fundInfo}>
          <div className={styles.fundLabel}>Quỹ nhận quyên góp:</div>
          <div className={styles.fundName}>{selectedFund.tenQuy}</div>
        </div>
      )}

      {loading && (
        <div className={styles.loadingState}>
          Đang tải thông tin tài khoản ngân hàng...
        </div>
      )}

      {!loading && !bankAccount && selectedFund && (
        <div className={styles.noBank}>
          <HiOutlineExclamationTriangle className={styles.warningIcon} />
          <p>Quỹ này chưa có thông tin tài khoản ngân hàng</p>
          <p className={styles.subText}>Vui lòng liên hệ quản trị viên</p>
        </div>
      )}

      {!loading && bankAccount && (
        <>
          {/* Số tài khoản */}
          <div className={styles.fieldGroup}>
            <div className={styles.fieldLabel}>
              <HiOutlineCreditCard className={styles.fieldIcon} />
              Số tài khoản
            </div>
            <div className={styles.copyField}>
              <input
                type="text"
                value={bankAccount.soTaiKhoan}
                readOnly
                className={styles.copyInput}
              />
              <button
                type="button"
                className={styles.copyBtn}
                onClick={() => handleCopy(bankAccount.soTaiKhoan, 'số tài khoản')}
              >
                {copiedField === 'số tài khoản' ? (
                  <>
                    <HiOutlineCheckCircle className={styles.checkIcon} />
                    Đã sao chép
                  </>
                ) : (
                  <>
                    <HiOutlineClipboardDocument />
                    Sao chép
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Ngân hàng */}
          <div className={styles.fieldGroup}>
            <div className={styles.fieldLabel}>
              <HiOutlineBuildingLibrary className={styles.fieldIcon} />
              Ngân hàng
            </div>
            <div className={styles.staticField}>
              {bankAccount.nganHang}
              {bankAccount.chiNhanh && ` - ${bankAccount.chiNhanh}`}
            </div>
          </div>

          {/* Chủ tài khoản */}
          <div className={styles.fieldGroup}>
            <div className={styles.fieldLabel}>
              <HiOutlineCreditCard className={styles.fieldIcon} />
              Chủ tài khoản
            </div>
            <div className={styles.staticField}>
              {bankAccount.chuTaiKhoan}
            </div>
          </div>

          {/* Nội dung chuyển khoản */}
          <div className={styles.fieldGroup}>
            <div className={styles.fieldLabel}>
              <HiOutlineClipboardDocument className={styles.fieldIcon} />
              Nội dung chuyển khoản
            </div>
            <div className={styles.copyField}>
              <input
                type="text"
                value={transferContent}
                readOnly
                className={styles.copyInput}
                placeholder="Vui lòng chọn quỹ để tạo nội dung"
              />
              <button
                type="button"
                className={styles.copyBtn}
                onClick={() => handleCopy(transferContent, 'nội dung chuyển khoản')}
                disabled={!transferContent}
              >
                {copiedField === 'nội dung chuyển khoản' ? (
                  <>
                    <HiOutlineCheckCircle className={styles.checkIcon} />
                    Đã sao chép
                  </>
                ) : (
                  <>
                    <HiOutlineClipboardDocument />
                    Sao chép
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Lưu ý */}
          <div className={styles.instructionBox}>
            <div className={styles.instructionHeader}>
              <HiOutlineExclamationTriangle className={styles.warningIcon} />
              <span className={styles.instructionTitle}>Lưu ý quan trọng</span>
            </div>
            <ul className={styles.instructionList}>
              <li>Vui lòng ghi <strong>đúng nội dung chuyển khoản</strong> như trên để hệ thống đối soát</li>
              <li>Sau khi chuyển khoản, vui lòng <strong>chụp màn hình</strong> hoặc <strong>lưu biên lai</strong></li>
              <li>Upload ảnh minh chứng ở bước tiếp theo</li>
              <li>Hệ thống sẽ xác nhận sau khi đối soát thành công</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

SchoolBankInfoSection.propTypes = {
  selectedFund: PropTypes.shape({
    quyId: PropTypes.number,
    tenQuy: PropTypes.string,
  }),
  donorName: PropTypes.string,
};

export default SchoolBankInfoSection;
