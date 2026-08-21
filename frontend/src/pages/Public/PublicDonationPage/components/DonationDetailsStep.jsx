import { memo, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import Input from '@components/common/Input/Input';
import CurrencyInput from '@components/common/CurrencyInput';
import TransferContentSection from './TransferContentSection';
import { DESTINATION_TYPES, LOAI_HO_TRO } from '../constants';
import { formatCurrency } from '../formatters';
import styles from './DonationDetailsStep.module.scss';

const ALL_VALUE = '__all__';

const DonationDetailsStep = memo(({
  formData, errors, touched, onFieldChange, onFieldBlur,
  destinationType, onDestinationChange, funds, fundsLoading,
  bankAccounts = [],
  chungTuFile,
  onChungTuChange,
}) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedFundCategory, setSelectedFundCategory] = useState(ALL_VALUE);
  const [sortValue, setSortValue] = useState('newest');

  const loaiQuyOptions = useMemo(() => {
    const groups = {};
    (funds || []).forEach(f => {
      const nhom = f.loaiquy?.tenLoai || 'Khác';
      if (!groups[nhom]) groups[nhom] = nhom;
    });
    return [
      { value: ALL_VALUE, label: 'Tất cả loại quỹ' },
      ...Object.values(groups).map(g => ({ value: g, label: g }))
    ];
  }, [funds]);

  const sortOptions = [
    { value: 'newest', label: 'Mới nhất' },
    { value: 'oldest', label: 'Cũ nhất' },
    { value: 'highest', label: 'Số dư cao nhất' },
    { value: 'name', label: 'Tên A→Z' },
  ];

  const filteredFunds = useMemo(() => {
    let result = [...(funds || [])];
    if (selectedFundCategory !== ALL_VALUE) {
      result = result.filter(f => f.loaiquy?.tenLoai === selectedFundCategory);
    }
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase().trim();
      result = result.filter(f => {
        const name = (f.tenQuy || '').toLowerCase();
        const desc = (f.moTa || '').toLowerCase();
        return name.includes(keyword) || desc.includes(keyword);
      });
    }
    result.sort((a, b) => {
      if (sortValue === 'newest') return (b.ngayTao || '').localeCompare(a.ngayTao || '');
      if (sortValue === 'oldest') return (a.ngayTao || '').localeCompare(b.ngayTao || '');
      if (sortValue === 'highest') return (b.soDu || 0) - (a.soDu || 0);
      if (sortValue === 'name') return (a.tenQuy || '').localeCompare(b.tenQuy || '');
      return 0;
    });
    return result;
  }, [funds, selectedFundCategory, searchKeyword, sortValue]);

  const slotInfo = useMemo(() => {
    const total = Number(formData.soTien) || 0;
    const perSlot = Number(formData.soTienMoiSuat) || 0;
    if (total <= 0 || perSlot <= 0) return null;
    const count = Math.floor(total / perSlot);
    const remainder = total % perSlot;
    if (count <= 0) return null;
    return { count, remainder, total, perSlot };
  }, [formData.soTien, formData.soTienMoiSuat]);

  const selectedBankAccount = useMemo(() => {
    if (!formData.taiKhoanNganHangId) return null;
    return bankAccounts.find(a => a.taiKhoanId === formData.taiKhoanNganHangId) || null;
  }, [bankAccounts, formData.taiKhoanNganHangId]);

  const selectedFund = useMemo(() => {
    if (!formData.quyId) return null;
    return funds.find(f => f.quyId === formData.quyId) || null;
  }, [funds, formData.quyId]);

  return (
    <div className={styles.stepContent}>
      <div className={styles.sectionTitle}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a5276" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
        <h3>Chi tiết đóng góp</h3>
      </div>

      {/* CHỌN QUỸ / ĐỀ XUẤT */}
      <div className={styles.destinationSelector}>
        <label className={styles.label}>Bạn muốn tài trợ cho <span className={styles.required}>*</span></label>
        <div className={styles.destinationCards}>
          <button
            type="button"
            className={`${styles.destinationCard} ${destinationType === DESTINATION_TYPES.EXISTING_FUND ? styles.selected : ''}`}
            onClick={() => onDestinationChange(DESTINATION_TYPES.EXISTING_FUND)}
          >
            <div className={styles.cardIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <div className={styles.cardInfo}>
              <strong>Quỹ hiện có</strong>
              <span>Chọn từ các quỹ đang hoạt động</span>
            </div>
          </button>
          <button
            type="button"
            className={`${styles.destinationCard} ${destinationType === DESTINATION_TYPES.PROPOSE_PROGRAM ? styles.selected : ''}`}
            onClick={() => onDestinationChange(DESTINATION_TYPES.PROPOSE_PROGRAM)}
          >
            <div className={styles.cardIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className={styles.cardInfo}>
              <strong>Đề xuất chương trình</strong>
              <span>Gửi đề xuất chương trình mới</span>
            </div>
          </button>
        </div>
      </div>

      {/* CHỌN QUỸ - EXISTING FUND */}
      {destinationType === DESTINATION_TYPES.EXISTING_FUND && (
        <div className={styles.fundSelector}>
          <label className={styles.label}>Chọn quỹ <span className={styles.required}>*</span></label>

          <div className={styles.filterSection}>
            <div className={styles.searchWrapper}>
              <div className={styles.searchInputWrapper}>
                <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder="Tìm theo tên quỹ, mô tả..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.filtersRow}>
              <div className={styles.filterItem}>
                <label className={styles.filterLabel}>Loại quỹ</label>
                <select
                  className={styles.filterSelect}
                  value={selectedFundCategory}
                  onChange={(e) => setSelectedFundCategory(e.target.value)}
                >
                  {loaiQuyOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className={styles.filterItem}>
                <label className={styles.filterLabel}>Sắp xếp</label>
                <select
                  className={styles.filterSelect}
                  value={sortValue}
                  onChange={(e) => setSortValue(e.target.value)}
                >
                  {sortOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {fundsLoading ? (
            <div className={styles.loadingFunds}>Đang tải danh sách quỹ...</div>
          ) : (
            <div className={styles.fundGrid}>
              {filteredFunds.map((fund) => (
                <button
                  key={fund.quyId}
                  type="button"
                  className={`${styles.fundCard} ${formData.quyId === fund.quyId ? styles.selectedFund : ''}`}
                  onClick={() => onFieldChange('quyId', fund.quyId)}
                >
                  {fund.hinhAnh && (
                    <div className={styles.fundThumb}>
                      <img src={fund.hinhAnh} alt={fund.tenQuy} />
                    </div>
                  )}
                  <div className={styles.fundInfo}>
                    <div className={styles.fundInfoHeader}>
                      <strong>{fund.tenQuy}</strong>
                      {formData.quyId === fund.quyId && (
                        <svg className={styles.fundCheckIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    {fund.moTa && <span className={styles.fundDesc}>{fund.moTa}</span>}
                    <span className={styles.fundBalance}>
                      Số dư: {formatCurrency(fund.soDu || 0)}
                    </span>
                  </div>
                </button>
              ))}
              {filteredFunds.length === 0 && (
                <div className={styles.emptyFunds}>Không có quỹ nào phù hợp</div>
              )}
            </div>
          )}
          {touched.quyId && errors.quyId && (
            <span className={styles.errorText}>{errors.quyId}</span>
          )}
        </div>
      )}

      {/* ĐỀ XUẤT CHƯƠNG TRÌNH */}
      {destinationType === DESTINATION_TYPES.PROPOSE_PROGRAM && (
        <div className={styles.proposalFields}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Chọn quỹ thành phần <span className={styles.required}>*</span></label>
            <select
              className={styles.select}
              value={formData.quythanhPhanId || ''}
              onChange={(e) => onFieldChange('quythanhPhanId', e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">-- Chọn quỹ thành phần --</option>
              {(funds || []).filter(f => f.capDo === 2).map((fund) => (
                <option key={fund.quyId} value={fund.quyId}>{fund.tenQuy}</option>
              ))}
            </select>
            {touched.quythanhPhanId && errors.quythanhPhanId && (
              <span className={styles.errorText}>{errors.quythanhPhanId}</span>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Tên chương trình <span className={styles.required}>*</span></label>
            <Input
              type="text"
              placeholder="VD: Chương trình học bổng năm 2026"
              value={formData.tenChuongTrinh || ''}
              onChange={(e) => onFieldChange('tenChuongTrinh', e.target.value)}
              onBlur={() => onFieldBlur('tenChuongTrinh')}
              error={touched.tenChuongTrinh && !!errors.tenChuongTrinh}
              errorMessage={errors.tenChuongTrinh}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Mô tả chương trình <span className={styles.required}>*</span></label>
            <textarea
              className={styles.textarea}
              rows={3}
              placeholder="Mô tả ngắn gọn về chương trình..."
              value={formData.moTa || ''}
              onChange={(e) => onFieldChange('moTa', e.target.value)}
              onBlur={() => onFieldBlur('moTa')}
            />
            {touched.moTa && errors.moTa && (
              <span className={styles.errorText}>{errors.moTa}</span>
            )}
          </div>

          <div className={styles.formGrid}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Số lượng suất <span className={styles.required}>*</span></label>
              <Input
                type="number"
                placeholder="VD: 10"
                value={formData.soLuongSuat || ''}
                onChange={(e) => onFieldChange('soLuongSuat', parseInt(e.target.value, 10) || 0)}
                onBlur={() => onFieldBlur('soLuongSuat')}
                error={touched.soLuongSuat && !!errors.soLuongSuat}
                errorMessage={errors.soLuongSuat}
                required
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Số tiền mỗi suất <span className={styles.required}>*</span></label>
              <div className={styles.currencyFieldWrapper}>
                <CurrencyInput
                  value={formData.soTienMoiSuat ? String(formData.soTienMoiSuat) : ''}
                  onChange={(raw) => onFieldChange('soTienMoiSuat', Number(raw) || 0)}
                  placeholder="VD: 500000"
                  className={`${styles.currencyInput} ${touched.soTienMoiSuat && errors.soTienMoiSuat ? styles.inputError : ''}`}
                />
                <span className={styles.currency}>VNĐ</span>
              </div>
            </div>
          </div>

          {slotInfo && (
            <div className={slotInfo.remainder === 0 ? styles.slotHintOk : styles.slotHintWarn}>
              {slotInfo.remainder === 0 ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              )}
              <span>
                Phù hợp cho <strong>{slotInfo.count}</strong> suất
                {slotInfo.remainder === 0
                  ? ` (${formatCurrency(slotInfo.perSlot)} × ${slotInfo.count})`
                  : ` (còn dư ${formatCurrency(slotInfo.remainder)})`
                }
              </span>
            </div>
          )}

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Loại hình hỗ trợ</label>
            <select
              className={styles.select}
              value={formData.loaiHoTro || 'Tai tro khong hoan lai'}
              onChange={(e) => onFieldChange('loaiHoTro', e.target.value)}
            >
              {LOAI_HO_TRO.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Ngày bắt đầu</label>
              <input
                type="date"
                className={styles.dateInput}
                value={formData.ngayBatDau || ''}
                onChange={(e) => onFieldChange('ngayBatDau', e.target.value)}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Ngày kết thúc</label>
              <input
                type="date"
                className={styles.dateInput}
                value={formData.ngayKetThuc || ''}
                onChange={(e) => onFieldChange('ngayKetThuc', e.target.value)}
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Tài liệu đính kèm</label>
            <p className={styles.helperText}>Đính kèm đề xuất chương trình (PDF, DOC, JPG - tối đa 5MB, tối đa 3 file)</p>
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={(e) => onFieldChange('proposalFiles', Array.from(e.target.files))}
              className={styles.fileInput}
            />
          </div>
        </div>
      )}

      {/* SỐ TIỀN ĐÓNG GÓP */}
      <div className={styles.amountSection}>
        <label className={styles.label}>Số tiền đóng góp <span className={styles.required}>*</span></label>
        <div className={styles.quickAmounts}>
          {[100000, 200000, 500000, 1000000, 2000000, 5000000].map((amount) => (
            <button
              key={amount}
              type="button"
              className={`${styles.quickAmountBtn} ${formData.soTien === amount ? styles.selectedAmount : ''}`}
              onClick={() => onFieldChange('soTien', amount)}
            >
              {formatCurrency(amount)}
            </button>
          ))}
        </div>
        <div className={styles.customAmount}>
          <CurrencyInput
            value={formData.soTien ? String(formData.soTien) : ''}
            onChange={(raw) => onFieldChange('soTien', Number(raw) || 0)}
            placeholder="0"
            className={`${styles.currencyInput} ${touched.soTien && errors.soTien ? styles.inputError : ''}`}
          />
          <span className={styles.currency}>VNĐ</span>
          {touched.soTien && errors.soTien && (
            <span className={styles.errorText}>{errors.soTien}</span>
          )}
        </div>
      </div>

      {/* TÀI KHOẢN NGÂN HÀNG NHÀ TRƯỜNG */}
      {destinationType === DESTINATION_TYPES.EXISTING_FUND && bankAccounts.length > 0 && (
        <div className={styles.bankAccountSection}>
          <label className={styles.label}>Tài khoản nhận chuyển khoản <span className={styles.required}>*</span></label>
          <div className={styles.bankAccountList}>
            {bankAccounts.map((account) => (
              <div
                key={account.taiKhoanId}
                className={`${styles.bankAccountCard} ${formData.taiKhoanNganHangId === account.taiKhoanId ? styles.selectedBank : ''}`}
                onClick={() => onFieldChange('taiKhoanNganHangId', account.taiKhoanId)}
              >
                <div className={styles.bankIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 21h18" />
                    <path d="M3 10h18" />
                    <path d="M5 6l7-3 7 3" />
                    <path d="M4 10v11" />
                    <path d="M20 10v11" />
                    <path d="M8 10v11" />
                    <path d="M12 10v11" />
                    <path d="M16 10v11" />
                  </svg>
                </div>
                <div className={styles.bankInfo}>
                  <span className={styles.bankName}>{account.tenNganHang}</span>
                  <span className={styles.accountNumber}>{account.soTaiKhoan}</span>
                  <span className={styles.accountHolder}>{account.chuTaiKhoan}</span>
                  {account.chiNhanh && <span className={styles.branch}>{account.chiNhanh}</span>}
                </div>
                {formData.taiKhoanNganHangId === account.taiKhoanId && (
                  <svg className={styles.bankCheckIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
            ))}
          </div>
          {touched.taiKhoanNganHangId && errors.taiKhoanNganHangId && (
            <span className={styles.errorText}>{errors.taiKhoanNganHangId}</span>
          )}
        </div>
      )}

      {/* HIỂN THỊ NỘI DUNG CHUYỂN KHOAN + MINH CHỨNG - EXISTING FUND */}
      {destinationType === DESTINATION_TYPES.EXISTING_FUND && formData.taiKhoanNganHangId && (
        <TransferContentSection
          bankAccount={selectedBankAccount}
          chungTuFile={chungTuFile}
          onChungTuChange={onChungTuChange}
        />
      )}

      {/* ĐỀ XUẤT CHƯƠNG TRÌNH - THÊM CHỌN NGÂN HÀNG + NỘI DUNG CK */}
      {destinationType === DESTINATION_TYPES.PROPOSE_PROGRAM && bankAccounts.length > 0 && (
        <div className={styles.bankAccountSection}>
          <label className={styles.label}>Tài khoản nhận chuyển khoản <span className={styles.required}>*</span></label>
          <div className={styles.bankAccountList}>
            {bankAccounts.map((account) => (
              <div
                key={account.taiKhoanId}
                className={`${styles.bankAccountCard} ${formData.taiKhoanNganHangId === account.taiKhoanId ? styles.selectedBank : ''}`}
                onClick={() => onFieldChange('taiKhoanNganHangId', account.taiKhoanId)}
              >
                <div className={styles.bankIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 21h18" />
                    <path d="M3 10h18" />
                    <path d="M5 6l7-3 7 3" />
                    <path d="M4 10v11" />
                    <path d="M20 10v11" />
                    <path d="M8 10v11" />
                    <path d="M12 10v11" />
                    <path d="M16 10v11" />
                  </svg>
                </div>
                <div className={styles.bankInfo}>
                  <span className={styles.bankName}>{account.tenNganHang}</span>
                  <span className={styles.accountNumber}>{account.soTaiKhoan}</span>
                  <span className={styles.accountHolder}>{account.chuTaiKhoan}</span>
                  {account.chiNhanh && <span className={styles.branch}>{account.chiNhanh}</span>}
                </div>
                {formData.taiKhoanNganHangId === account.taiKhoanId && (
                  <svg className={styles.bankCheckIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
            ))}
          </div>
          {touched.taiKhoanNganHangId && errors.taiKhoanNganHangId && (
            <span className={styles.errorText}>{errors.taiKhoanNganHangId}</span>
          )}
        </div>
      )}

      {/* HIỂN THỊ NỘI DUNG CHUYỂN KHOAN + MINH CHỨNG - ĐỀ XUẤT */}
      {destinationType === DESTINATION_TYPES.PROPOSE_PROGRAM && formData.taiKhoanNganHangId && (
        <TransferContentSection
          bankAccount={selectedBankAccount}
          chungTuFile={chungTuFile}
          onChungTuChange={onChungTuChange}
        />
      )}
    </div>
  );
});

DonationDetailsStep.displayName = 'DonationDetailsStep';
DonationDetailsStep.propTypes = {
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object,
  touched: PropTypes.object,
  onFieldChange: PropTypes.func.isRequired,
  onFieldBlur: PropTypes.func.isRequired,
  destinationType: PropTypes.string,
  onDestinationChange: PropTypes.func.isRequired,
  funds: PropTypes.array,
  fundsLoading: PropTypes.bool,
  bankAccounts: PropTypes.array,
  chungTuFile: PropTypes.object,
  onChungTuChange: PropTypes.func,
};

export default DonationDetailsStep;
