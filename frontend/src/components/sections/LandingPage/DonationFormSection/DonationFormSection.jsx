import { useState, useEffect, useCallback, useMemo } from 'react';
import { createPublicDonation } from '@services/donationService';
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
    } catch (err) {
      const msg = err?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
      setErrors({ submit: msg });
    } finally {
      setSubmitting(false);
    }
  }, [formData, submitting, currentStep]);

  const handleNewDonation = useCallback(() => {
    setCurrentStep(1);
    setCompletedSteps([]);
    setDestinationType(null);
    setSuccessResult(null);
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
