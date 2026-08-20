import { useState, useEffect, useCallback, useMemo } from 'react';
import { createPublicDonation } from '@services/donationService';
import { guestService } from '@services/guestService';
import useAuthStore from '@stores/authStore';
import fundService from '@services/fundService';
import { bankAccountService } from '@services/bankAccountService';
import DonationStepper from '@pages/Public/PublicDonationPage/components/DonationStepper';
import DonorInfoStep from '@pages/Public/PublicDonationPage/components/DonorInfoStep';
import DonationDetailsStep from '@pages/Public/PublicDonationPage/components/DonationDetailsStep';
import ReviewStep from '@pages/Public/PublicDonationPage/components/ReviewStep';
import SuccessStep from '@pages/Public/PublicDonationPage/components/SuccessStep';
import { DONATION_STEPS, DESTINATION_TYPES } from '@pages/Public/PublicDonationPage/constants';
import { validateDonorInfo, validateDonationDetails } from '@pages/Public/PublicDonationPage/validation';
import styles from './DonationFormSection.module.scss';

const DonationFormSection = () => {
  const { isAuthenticated } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [destinationType, setDestinationType] = useState(null);
  const [funds, setFunds] = useState([]);
  const [fundsLoading, setFundsLoading] = useState(true);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // OTP flow states (guest only)
  const [submittedGuestInfo, setSubmittedGuestInfo] = useState(null);
  const [guestOtpCode, setGuestOtpCode] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);
  const [guestSuccessInfo, setGuestSuccessInfo] = useState(null);
  const [formTimestamp] = useState(() => new Date().toISOString());

  const [formData, setFormData] = useState({
    hoTen: '',
    email: '',
    soDienThoai: '',
    loaiNhaTaiTro: 'Ca nhan',
    toChuc: '',
    diaChi: '',
    ghiChu: '',
    quyId: null,
    tenChuongTrinh: '',
    moTa: '',
    mucDich: '',
    soTien: 0,
    hinhThuc: 'Chuyen khoan',
    proposalFiles: [],
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setFundsLoading(true);
        const [fundsRes, bankRes] = await Promise.allSettled([
          fundService.getPublicFunds({ trangThai: 'Dang hoat dong', limit: 100 }),
          bankAccountService.getSchoolBankAccounts(),
        ]);
        if (fundsRes.status === 'fulfilled') {
          const res = fundsRes.value;
          setFunds(res?.funds || (Array.isArray(res?.data) ? res.data : []));
        }
        if (bankRes.status === 'fulfilled') {
          const res = bankRes.value;
          setBankAccounts(res?.data || (Array.isArray(res) ? res : []));
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
    } else if (['quyId', 'tenChuongTrinh', 'moTa', 'mucDich', 'soTien', 'hinhThuc'].includes(field)) {
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
      delete next.tenChuongTrinh;
      delete next.moTa;
      delete next.mucDich;
      return next;
    });
  }, []);

  const handleValidateStep = useCallback((step) => {
    let stepErrors = {};
    if (step === 1) {
      stepErrors = validateDonorInfo(formData);
    } else if (step === 2) {
      stepErrors = validateDonationDetails(formData, destinationType);
    }
    setErrors(stepErrors);
    const allTouched = {};
    Object.keys(formData).forEach(k => { allTouched[k] = true; });
    setTouched(allTouched);
    return Object.keys(stepErrors).length === 0;
  }, [formData, destinationType]);

  const handleNext = useCallback(() => {
    if (!handleValidateStep(currentStep)) return;
    setCompletedSteps(prev => [...new Set([...prev, currentStep])]);
    setCurrentStep(prev => Math.min(prev + 1, DONATION_STEPS.length));
  }, [currentStep, handleValidateStep]);

  const handlePrev = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      if (isAuthenticated) {
        const payload = {
          ten: formData.hoTen.trim(),
          email: formData.email.trim().toLowerCase(),
          soDienThoai: formData.soDienThoai.trim(),
          soTien: parseFloat(formData.soTien),
          quyId: formData.quyId,
          ghiChu: formData.ghiChu?.trim() || null,
        };
        const result = await createPublicDonation(payload);
        setSuccessResult(result?.donation || result);
        setCompletedSteps(prev => [...new Set([...prev, currentStep])]);
        setCurrentStep(DONATION_STEPS.length + 1);
      } else {
        const guestPayload = {
          guestHoTen: formData.hoTen.trim(),
          guestEmail: formData.email.trim().toLowerCase(),
          guestSoDienThoai: formData.soDienThoai.trim(),
          guestToChuc: formData.toChuc?.trim() || null,
          guestDiaChi: formData.diaChi?.trim() || null,
          quyId: formData.quyId,
          soTien: parseFloat(formData.soTien),
          hinhThuc: formData.hinhThuc,
          loaiNhaTaiTro: formData.loaiNhaTaiTro,
          ghiChu: formData.ghiChu?.trim() || null,
          formTimestamp,
        };
        const result = await guestService.submitDonation(guestPayload);
        if (result.success) {
          setSubmittedGuestInfo({
            email: result.data.email,
            trackingUuid: result.data.trackingUuid,
            otpToken: result.data.otpToken,
          });
          try {
            localStorage.setItem(`guest_otp_${result.data.trackingUuid}`, result.data.otpToken);
          } catch (e) { /* ignore */ }
        } else {
          setErrors({ submit: result.message || 'Gửi đăng ký thất bại' });
        }
      }
    } catch (err) {
      const msg = err?.message || err?.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
      setErrors({ submit: msg });
    } finally {
      setSubmitting(false);
    }
  }, [formData, submitting, currentStep, isAuthenticated]);

  const handleVerifyGuestOtp = useCallback(async () => {
    if (!guestOtpCode || guestOtpCode.trim().length !== 6 || isNaN(guestOtpCode)) {
      setErrors({ otp: 'Mã OTP phải gồm 6 chữ số' });
      return;
    }

    try {
      setVerifyingOtp(true);
      setErrors({});
      const response = await guestService.verifyOtp({
        email: submittedGuestInfo.email,
        otpCode: guestOtpCode.trim(),
        type: 'donation',
        otpToken: submittedGuestInfo.otpToken,
      });

      if (response.success) {
        setGuestSuccessInfo({
          email: response.data.email,
          tempPassword: response.data.tempPassword,
          trackingUuid: response.data.trackingUuid,
        });
        setSubmittedGuestInfo(null);
      } else {
        setErrors({ otp: response.message || 'Mã OTP không chính xác' });
      }
    } catch (err) {
      setErrors({ otp: err?.response?.data?.message || 'Lỗi xác minh mã OTP' });
    } finally {
      setVerifyingOtp(false);
    }
  }, [guestOtpCode, submittedGuestInfo]);

  const handleResendGuestOtp = useCallback(async () => {
    if (!submittedGuestInfo?.otpToken) {
      setErrors({ otp: 'Phiên xác thực không hợp lệ, vui lòng gửi lại form' });
      return;
    }

    try {
      setResendingOtp(true);
      setErrors({});
      const response = await guestService.resendOtp({
        email: submittedGuestInfo.email,
        type: 'donation',
        otpToken: submittedGuestInfo.otpToken,
      });

      if (response.success) {
        setSubmittedGuestInfo((prev) => ({
          ...prev,
          trackingUuid: response.data.trackingUuid,
          otpToken: response.data.otpToken,
        }));
        setGuestOtpCode('');
      } else {
        setErrors({ otp: response.message || 'Không thể gửi lại mã OTP' });
      }
    } catch (err) {
      setErrors({ otp: err?.response?.data?.message || 'Lỗi gửi lại mã OTP' });
    } finally {
      setResendingOtp(false);
    }
  }, [submittedGuestInfo]);

  const handleNewDonation = useCallback(() => {
    setCurrentStep(1);
    setCompletedSteps([]);
    setDestinationType(null);
    setSuccessResult(null);
    setSubmittedGuestInfo(null);
    setGuestSuccessInfo(null);
    setGuestOtpCode('');
    setErrors({});
    setTouched({});
    setFormData({
      hoTen: '', email: '', soDienThoai: '',
      loaiNhaTaiTro: 'Ca nhan', toChuc: '', diaChi: '', ghiChu: '',
      quyId: null, tenChuongTrinh: '', moTa: '', mucDich: '',
      soTien: 0, hinhThuc: 'Chuyen khoan', proposalFiles: [],
    });
  }, []);

  const isLastStep = currentStep === DONATION_STEPS.length;
  const isSuccess = currentStep > DONATION_STEPS.length;

  // ─── GUEST OTP VERIFICATION SCREEN ────────────────────────────
  if (submittedGuestInfo) {
    return (
      <section className={styles.donationFormSection} id="donation-form">
        <div className={styles.container}>
          <div className={styles.formCard}>
            <div className={styles.otpCard}>
              <div className={styles.otpTitle}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <h3>Xác thực email của bạn</h3>
              </div>
              <p className={styles.otpDesc}>
                Hệ thống đã gửi mã xác thực (OTP) 6 chữ số về email <strong>{submittedGuestInfo.email}</strong>.
                Vui lòng kiểm tra hộp thư (hoặc Spam/Thư rác).
              </p>
              <div className={styles.otpTrackingCode}>
                Mã tra cứu: <strong>{submittedGuestInfo.trackingUuid}</strong>
              </div>
              <input
                type="text"
                maxLength={6}
                value={guestOtpCode}
                onChange={(e) => {
                  setGuestOtpCode(e.target.value.replace(/\D/g, ''));
                  setErrors(prev => { const n = { ...prev }; delete n.otp; return n; });
                }}
                className={styles.otpInput}
                placeholder="000000"
                autoFocus
              />
              {errors.otp && <div className={styles.otpError}>{errors.otp}</div>}
              <button
                type="button"
                className={styles.submitBtn}
                onClick={handleVerifyGuestOtp}
                disabled={verifyingOtp || guestOtpCode.length !== 6}
              >
                {verifyingOtp ? 'Đang xác thực...' : 'Xác nhận & Kích hoạt'}
              </button>
              <button
                type="button"
                className={styles.otpResendBtn}
                onClick={handleResendGuestOtp}
                disabled={resendingOtp || verifyingOtp}
              >
                {resendingOtp ? 'Đang gửi lại...' : 'Gửi lại mã OTP'}
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ─── GUEST SUCCESS SCREEN (with temp credentials) ──────────────
  if (guestSuccessInfo) {
    return (
      <section className={styles.donationFormSection} id="donation-form">
        <div className={styles.container}>
          <div className={styles.formCard}>
            <div className={styles.guestSuccessCard}>
              <div className={styles.guestSuccessIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#27ae60" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h3>Đăng ký đóng góp thành công!</h3>
              <p className={styles.guestSuccessMsg}>
                Hệ thống đã tự động tạo tài khoản để bạn theo dõi khoản tài trợ.
              </p>
              <div className={styles.guestCredentials}>
                <div className={styles.credentialRow}>
                  <span className={styles.credentialLabel}>Email đăng nhập:</span>
                  <span className={styles.credentialValue}>{guestSuccessInfo.email}</span>
                </div>
                <div className={styles.credentialRow}>
                  <span className={styles.credentialLabel}>Mật khẩu tạm:</span>
                  <span className={`${styles.credentialValue} password`}>{guestSuccessInfo.tempPassword}</span>
                </div>
              </div>
              <p className={styles.guestCredentialWarning}>
                Vui lòng đăng nhập và đổi mật khẩu ngay để bảo mật tài khoản.
              </p>
              <div className={styles.guestTrackingCode}>
                Mã tra cứu: <strong>{guestSuccessInfo.trackingUuid}</strong>
              </div>
              <button type="button" className={styles.submitBtn} onClick={handleNewDonation}>
                Đăng ký đóng góp mới
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ─── MAIN FORM ─────────────────────────────────────────────────
  return (
    <section className={styles.donationFormSection} id="donation-form">
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.label}>ĐĂNG KÝ ĐÓNG GÓP</div>
          <h2 className={styles.title}>Mỗi đóng góp của bạn là nguồn động viên lớn lao</h2>
          <p className={styles.subtitle}>
            Hãy cùng chung tay xây dựng quỹ phát triển Đại học Trà Vinh
          </p>
        </div>

        <div className={styles.formCard}>
          {!isSuccess && (
            <DonationStepper
              steps={DONATION_STEPS}
              currentStep={currentStep}
              completedSteps={completedSteps}
            />
          )}

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

          <div className={styles.stepContainer}>
            {currentStep === 1 && (
              <DonorInfoStep
                formData={formData}
                errors={errors}
                touched={touched}
                onFieldChange={handleFieldChange}
                onFieldBlur={handleFieldBlur}
              />
            )}
            {currentStep === 2 && (
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
              />
            )}
            {currentStep === 3 && (
              <ReviewStep
                formData={formData}
                destinationType={destinationType}
                selectedFund={selectedFund}
                bankAccounts={bankAccounts}
              />
            )}
            {isSuccess && (
              <SuccessStep
                donationResult={successResult}
                bankAccounts={bankAccounts}
                onNewDonation={handleNewDonation}
              />
            )}
          </div>

          {!isSuccess && (
            <div className={styles.formActions}>
              {currentStep > 1 && (
                <button type="button" className={styles.prevBtn} onClick={handlePrev}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                  Quay lại
                </button>
              )}
              <div className={styles.actionsRight}>
                {isLastStep ? (
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
                ) : (
                  <button type="button" className={styles.nextBtn} onClick={handleNext}>
                    Tiếp theo
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default DonationFormSection;
