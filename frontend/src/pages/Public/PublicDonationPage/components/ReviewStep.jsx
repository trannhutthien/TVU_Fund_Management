import { memo } from 'react';
import PropTypes from 'prop-types';
import { DESTINATION_TYPES, PAYMENT_METHOD_LABELS } from '../constants';
import { formatCurrency, formatDate, formatNumberInput } from '../formatters';
import styles from './ReviewStep.module.scss';

const ReviewStep = memo(({ formData, destinationType, selectedFund, bankAccounts }) => {
  const isPropose = destinationType === DESTINATION_TYPES.PROPOSE_PROGRAM;

  const selectedBankAccount = formData.taiKhoanNganHangId
    ? (bankAccounts || []).find(acc => acc.taiKhoanId === formData.taiKhoanNganHangId)
    : null;

  return (
    <div className={styles.stepContent}>
      <div className={styles.sectionTitle}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a5276" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
        </svg>
        <h3>Xác nhận thông tin</h3>
      </div>

      <div className={styles.reviewGrid}>
        <div className={styles.reviewSection}>
          <h4>Thông tin nhà tài trợ</h4>
          <div className={styles.reviewItem}>
            <span className={styles.reviewLabel}>Họ và tên:</span>
            <span className={styles.reviewValue}>{formData.hoTen}</span>
          </div>
          <div className={styles.reviewItem}>
            <span className={styles.reviewLabel}>Email:</span>
            <span className={styles.reviewValue}>{formData.email}</span>
          </div>
          <div className={styles.reviewItem}>
            <span className={styles.reviewLabel}>Số điện thoại:</span>
            <span className={styles.reviewValue}>{formData.soDienThoai}</span>
          </div>
          {formData.loaiNhaTaiTro && formData.loaiNhaTaiTro !== 'Ca nhan' && (
            <div className={styles.reviewItem}>
              <span className={styles.reviewLabel}>Loại:</span>
              <span className={styles.reviewValue}>{formData.loaiNhaTaiTro}</span>
            </div>
          )}
          {formData.toChuc && (
            <div className={styles.reviewItem}>
              <span className={styles.reviewLabel}>Tổ chức:</span>
              <span className={styles.reviewValue}>{formData.toChuc}</span>
            </div>
          )}
          {formData.diaChi && (
            <div className={styles.reviewItem}>
              <span className={styles.reviewLabel}>Địa chỉ:</span>
              <span className={styles.reviewValue}>{formData.diaChi}</span>
            </div>
          )}
          {formData.ghiChu && (
            <div className={styles.reviewItem}>
              <span className={styles.reviewLabel}>Ghi chú:</span>
              <span className={styles.reviewValue}>{formData.ghiChu}</span>
            </div>
          )}
        </div>

        <div className={styles.reviewSection}>
          <h4>Chi tiết đóng góp</h4>
          <div className={styles.reviewItem}>
            <span className={styles.reviewLabel}>Hình thức:</span>
            <span className={styles.reviewValue}>
              {isPropose ? 'Đề xuất chương trình' : 'Tài trợ quỹ hiện có'}
            </span>
          </div>
          {!isPropose && selectedFund && (
            <div className={styles.reviewItem}>
              <span className={styles.reviewLabel}>Quỹ:</span>
              <span className={styles.reviewValue}>{selectedFund.tenQuy}</span>
            </div>
          )}
          {isPropose && (
            <>
              <div className={styles.reviewItem}>
                <span className={styles.reviewLabel}>Tên chương trình:</span>
                <span className={styles.reviewValue}>{formData.tenChuongTrinh}</span>
              </div>
              <div className={styles.reviewItem}>
                <span className={styles.reviewLabel}>Mô tả:</span>
                <span className={styles.reviewValue}>{formData.moTa}</span>
              </div>
              <div className={styles.reviewItem}>
                <span className={styles.reviewLabel}>Số lượng suất:</span>
                <span className={styles.reviewValue}>{formData.soLuongSuat}</span>
              </div>
              <div className={styles.reviewItem}>
                <span className={styles.reviewLabel}>Số tiền mỗi suất:</span>
                <span className={styles.reviewValue}>{formatCurrency(formData.soTienMoiSuat)}</span>
              </div>
              <div className={styles.reviewItem}>
                <span className={styles.reviewLabel}>Loại hình hỗ trợ:</span>
                <span className={styles.reviewValue}>{formData.loaiHoTro || 'Trao tang'}</span>
              </div>
              {formData.ngayBatDau && (
                <div className={styles.reviewItem}>
                  <span className={styles.reviewLabel}>Ngày bắt đầu:</span>
                  <span className={styles.reviewValue}>{formatDate(formData.ngayBatDau)}</span>
                </div>
              )}
              {formData.ngayKetThuc && (
                <div className={styles.reviewItem}>
                  <span className={styles.reviewLabel}>Ngày kết thúc:</span>
                  <span className={styles.reviewValue}>{formatDate(formData.ngayKetThuc)}</span>
                </div>
              )}
            </>
          )}
          <div className={styles.reviewItem}>
            <span className={styles.reviewLabel}>Số tiền:</span>
            <span className={`${styles.reviewValue} ${styles.amount}`}>{formatCurrency(formData.soTien)}</span>
          </div>
          <div className={styles.reviewItem}>
            <span className={styles.reviewLabel}>Hình thức đóng góp:</span>
            <span className={styles.reviewValue}>{PAYMENT_METHOD_LABELS[formData.hinhThuc]}</span>
          </div>
          {selectedBankAccount && (
            <>
              <div className={styles.reviewItem}>
                <span className={styles.reviewLabel}>Ngân hàng nhận:</span>
                <span className={styles.reviewValue}>{selectedBankAccount.tenNganHang}</span>
              </div>
              <div className={styles.reviewItem}>
                <span className={styles.reviewLabel}>Số tài khoản:</span>
                <span className={styles.reviewValue}>{selectedBankAccount.soTaiKhoan}</span>
              </div>
              <div className={styles.reviewItem}>
                <span className={styles.reviewLabel}>Chủ tài khoản:</span>
                <span className={styles.reviewValue}>{selectedBankAccount.chuTaiKhoan}</span>
              </div>
            </>
          )}
          <div className={styles.reviewItem}>
            <span className={styles.reviewLabel}>Ngày đăng ký:</span>
            <span className={styles.reviewValue}>{formatDate(new Date())}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

ReviewStep.displayName = 'ReviewStep';
ReviewStep.propTypes = {
  formData: PropTypes.object.isRequired,
  destinationType: PropTypes.string,
  selectedFund: PropTypes.object,
  bankAccounts: PropTypes.array,
};

export default ReviewStep;
