import { useState, useEffect, useCallback, useMemo } from 'react';
import PublicHeader from '@components/layout/PublicHeader/PublicHeader';
import PublicFooter from '@components/layout/PublicFooter/PublicFooter';
import BackgroundImage from '@components/common/BackgroundImage/BackgroundImage';
import AppliSectionLayout from '@components/sections/AppliPage/AppliSectionLayout/AppliSectionLayout';
import NewsSidebar from '@components/sections/AppliPage/AppliSectionLayout/NewsSidebar/NewsSidebar';
import { createPublicDonation, createPublicProposal } from '@services/donationService';
import fundService from '@services/fundService';
import { bankAccountService } from '@services/bankAccountService';
import { systemSettingsService, DEFAULT_PUBLIC_SETTINGS, toFundBankAccount } from '@services/systemSettingsService';
import useAuthStore from '@stores/authStore';
import DonorInfoStep from './components/DonorInfoStep';
import DonationDetailsStep from './components/DonationDetailsStep';
import PaymentMethodSection from './components/PaymentMethodSection';
import ReviewStep from './components/ReviewStep';
import SuccessStep from './components/SuccessStep';
import { DESTINATION_TYPES } from './constants';
import { validateDonorInfo, validateDonationDetails } from './validation';
import styles from './PublicDonationPage.module.scss';

const PublicDonationPage = () => {
  const { isAuthenticated, user } = useAuthStore();
  const [destinationType, setDestinationType] = useState(null);
  const [funds, setFunds] = useState([]);
  const [fundsLoading, setFundsLoading] = useState(true);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [publicSettings, setPublicSettings] = useState(DEFAULT_PUBLIC_SETTINGS);

  const [formData, setFormData] = useState({
    hoTen: '',
    email: '',
    soDienThoai: '',
    loaiNhaTaiTro: 'Ca nhan',
    toChuc: '',
    diaChi: '',
    ghiChu: '',
    quyId: null,
    quythanhPhanId: null,
    tenChuongTrinh: '',
    moTa: '',
    soLuongSuat: 0,
    soTienMoiSuat: 0,
    loaiHoTro: 'Trao tang',
    ngayBatDau: '',
    ngayKetThuc: '',
    soTien: 0,
    hinhThuc: 'Truc tuyen',
    taiKhoanNganHangId: null,
    proposalFiles: [],
  });

  // Auto-fill user data when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        hoTen: user.hoTen || user.ten || '',
        email: user.email || '',
        soDienThoai: user.soDienThoai || '',
        diaChi: user.diaChi || '',
        // Determine loaiNhaTaiTro based on user's loaiTaiKhoan
        loaiNhaTaiTro: user.loaiTaiKhoan === 'NHA_TAI_TRO' ? 'Ca nhan' : 'Ca nhan',
      }));
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setFundsLoading(true);
        const [fundsRes, bankRes, settingsRes] = await Promise.allSettled([
          fundService.getPublicFunds({ trangThai: 'Dang hoat dong', limit: 100 }),
          bankAccountService.getSchoolBankAccounts(),
          systemSettingsService.getPublicSettings(),
        ]);
        if (fundsRes.status === 'fulfilled') {
          const res = fundsRes.value;
          setFunds(res?.funds || (Array.isArray(res?.data) ? res.data : []));
        }
        if (bankRes.status === 'fulfilled') {
          const res = bankRes.value;
          setBankAccounts(res?.data || (Array.isArray(res) ? res : []));
        }
        if (settingsRes.status === 'fulfilled') {
          setPublicSettings(settingsRes.value);
        }
      } catch {
        // silent
      } finally {
        setFundsLoading(false);
      }
    };
    loadData();
  }, []);

  const selectedFund = useMemo(() => {
    return funds.find(f => f.quyId === formData.quyId) || null;
  }, [funds, formData.quyId]);

  const handleFieldChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const handleFieldBlur = useCallback((field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    let fieldErrors = {};
    if (['hoTen', 'email', 'soDienThoai', 'toChuc'].includes(field)) {
      fieldErrors = validateDonorInfo(formData);
    } else if (['quyId', 'quythanhPhanId', 'tenChuongTrinh', 'moTa', 'soLuongSuat', 'soTienMoiSuat', 'soTien', 'hinhThuc'].includes(field)) {
      fieldErrors = validateDonationDetails(formData, destinationType);
    }
    if (fieldErrors[field]) {
      setErrors(prev => ({ ...prev, [field]: fieldErrors[field] }));
    }
  }, [formData, destinationType]);

  const handleDestinationChange = useCallback((type) => {
    setDestinationType(type);
    setErrors(prev => {
      const next = { ...prev };
      delete next.destinationType;
      delete next.quyId;
      delete next.quythanhPhanId;
      delete next.tenChuongTrinh;
      delete next.moTa;
      delete next.soLuongSuat;
      delete next.soTienMoiSuat;
      return next;
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;

    const donorErrors = validateDonorInfo(formData);
    const detailErrors = validateDonationDetails(formData, destinationType);
    const allErrors = { ...donorErrors, ...detailErrors };
    setErrors(allErrors);
    const allTouched = {};
    Object.keys(formData).forEach(k => { allTouched[k] = true; });
    setTouched(allTouched);

    if (Object.keys(allErrors).length > 0) {
      const firstError = document.querySelector('[class*="errorText"]');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setSubmitting(true);
    try {
      const isPropose = destinationType === 'proposeProgram';
      let result;

      if (isPropose) {
        const proposalPayload = {
          guest_ho_ten: formData.hoTen.trim(),
          guest_email: formData.email.trim().toLowerCase(),
          guest_so_dien_thoai: formData.soDienThoai.trim(),
          quy_thanh_phan_id: parseInt(formData.quythanhPhanId),
          ten_chuong_trinh: formData.tenChuongTrinh?.trim(),
          mo_ta: formData.moTa?.trim() || null,
          so_luong_suat: parseInt(formData.soLuongSuat) || 0,
          so_tien_moi_suat: parseFloat(formData.soTienMoiSuat) || 0,
          loai_ho_tro: formData.loaiHoTro || 'Tai tro khong hoan lai',
          ngay_bat_dau: formData.ngayBatDau || null,
          ngay_ket_thuc: formData.ngayKetThuc || null
        };
        result = await createPublicProposal(proposalPayload);
      } else {
        const payload = {
          ten: formData.hoTen.trim(),
          email: formData.email.trim().toLowerCase(),
          soDienThoai: formData.soDienThoai.trim(),
          soTien: parseFloat(formData.soTien),
          quyId: formData.quyId,
          hinhThuc: formData.hinhThuc,
          loaiNhaTaiTro: formData.loaiNhaTaiTro,
          toChuc: formData.toChuc,
          diaChi: formData.diaChi,
          taiKhoanNganHangId: formData.taiKhoanNganHangId,
          ghiChu: formData.ghiChu?.trim() || null,
        };
        result = await createPublicDonation(payload);
      }

      setSuccessResult(result?.donation || result?.data || result);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const msg = err?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
      setErrors({ submit: msg });
    } finally {
      setSubmitting(false);
    }
  }, [formData, submitting, destinationType]);

  const handleNewDonation = useCallback(() => {
    setDestinationType(null);
    setSuccessResult(null);
    setErrors({});
    setTouched({});
    setFormData({
      hoTen: '', email: '', soDienThoai: '',
      loaiNhaTaiTro: 'Ca nhan', toChuc: '', diaChi: '', ghiChu: '',
      quyId: null, quythanhPhanId: null, tenChuongTrinh: '', moTa: '',
      soLuongSuat: 0, soTienMoiSuat: 0, loaiHoTro: 'Trao tang',
      ngayBatDau: '', ngayKetThuc: '',
      soTien: 0, hinhThuc: 'Truc tuyen', taiKhoanNganHangId: null, proposalFiles: [],
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const isSuccess = !!successResult;

  const leftContent = (
    <div className={styles.formContent}>
      <div className={styles.formTitle}>
        <h2>Đăng ký đóng góp</h2>
        <p>Mỗi đóng góp của bạn là nguồn động viên lớn lao cho sự phát triển của quỹ</p>
      </div>

      {errors.submit && (
        <div className={styles.submitError}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          {errors.submit}
        </div>
      )}

      {isSuccess ? (
        <SuccessStep
          donationResult={successResult}
          bankAccounts={bankAccounts}
          onNewDonation={handleNewDonation}
        />
      ) : (
        <>
          <div className={styles.formSection}>
            <PaymentMethodSection
              hinhThuc={formData.hinhThuc}
              onHinhThucChange={(val) => handleFieldChange('hinhThuc', val)}
              publicSettings={publicSettings}
            />
          </div>

          {formData.hinhThuc === 'Truc tuyen' && (
            <>
              {isAuthenticated && user && (
                <div className={styles.autoFillNotice}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  <span>Thông tin của bạn đã được tự động điền từ tài khoản. Bạn có thể chỉnh sửa nếu cần.</span>
                </div>
              )}

              <div className={styles.formSection}>
                <DonorInfoStep
                  formData={formData}
                  errors={errors}
                  touched={touched}
                  onFieldChange={handleFieldChange}
                  onFieldBlur={handleFieldBlur}
                />
              </div>

              <div className={styles.formSection}>
                <DonationDetailsStep
                  formData={formData}
                  errors={errors}
                  touched={touched}
                  onFieldChange={handleFieldChange}
                  onFieldBlur={handleFieldBlur}
                  destinationType={destinationType}
                  onDestinationChange={handleDestinationChange}
                  funds={funds}
                  fundsLoading={fundsLoading}
                  bankAccounts={bankAccounts}
                />
              </div>

              <div className={styles.formSection}>
                <ReviewStep
                  formData={formData}
                  destinationType={destinationType}
                  selectedFund={selectedFund}
                  bankAccounts={bankAccounts}
                />
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.submitBtn}
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className={styles.spinner} />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 2L11 13" />
                        <path d="M22 2L15 22l-4-9-9-4L22 2z" />
                      </svg>
                      Đăng ký đóng góp
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className={styles.pageWrapper}>
      <PublicHeader />
      <BackgroundImage overlayType="dark">
        <AppliSectionLayout
          leftContent={leftContent}
          rightContent={<NewsSidebar />}
        />
      </BackgroundImage>
      <PublicFooter />
    </div>
  );
};

export default PublicDonationPage;
