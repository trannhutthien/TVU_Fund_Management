import { useState, useEffect, useCallback, useMemo } from 'react';
import PublicHeader from '@components/layout/PublicHeader/PublicHeader';
import PublicFooter from '@components/layout/PublicFooter/PublicFooter';
import BackgroundImage from '@components/common/BackgroundImage/BackgroundImage';
import AppliSectionLayout from '@components/sections/AppliPage/AppliSectionLayout/AppliSectionLayout';
import NewsSidebar from '@components/sections/AppliPage/AppliSectionLayout/NewsSidebar/NewsSidebar';
import { createPublicDonation, createPublicProposal, verifyProposalOtp as apiVerifyProposalOtp, resendProposalOtp as apiResendProposalOtp } from '@services/donationService';
import { guestService } from '@services/guestService';
import { uploadService } from '@services/uploadService';
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

const VALIDATION_ERROR_LABELS = {
  hoTen: 'Họ và tên',
  email: 'Email',
  soDienThoai: 'Số điện thoại',
  toChuc: 'Tổ chức/doanh nghiệp',
  destinationType: 'Hình thức tài trợ',
  quyId: 'Quỹ đóng góp',
  quythanhPhanId: 'Quỹ thành phần',
  tenChuongTrinh: 'Tên chương trình',
  moTa: 'Mô tả chương trình',
  soLuongSuat: 'Số lượng suất',
  soTienMoiSuat: 'Số tiền mỗi suất',
  soTien: 'Số tiền đóng góp',
  hinhThuc: 'Hình thức đóng góp',
  taiKhoanNganHangId: 'Tài khoản ngân hàng',
};

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
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [publicSettings, setPublicSettings] = useState(DEFAULT_PUBLIC_SETTINGS);

  // OTP flow states (guest only)
  const [submittedGuestInfo, setSubmittedGuestInfo] = useState(null);
  const [guestOtpCode, setGuestOtpCode] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);
  const [guestSuccessInfo, setGuestSuccessInfo] = useState(null);
  const [formTimestamp] = useState(() => new Date().toISOString());

  // OTP flow states (proposal)
  const [submittedProposalInfo, setSubmittedProposalInfo] = useState(null);
  const [proposalOtpCode, setProposalOtpCode] = useState('');
  const [verifyingProposalOtp, setVerifyingProposalOtp] = useState(false);
  const [resendingProposalOtp, setResendingProposalOtp] = useState(false);
  const [proposalSuccessInfo, setProposalSuccessInfo] = useState(null);

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
    loaiHoTro: 'Tai tro khong hoan lai',
    ngayBatDau: '',
    ngayKetThuc: '',
    soTien: 0,
    hinhThuc: 'Truc tuyen',
    taiKhoanNganHangId: null,
    proposalFiles: [],
  });
  const [chungTuFile, setChungTuFile] = useState(null);

  // Auto-fill user data when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        hoTen: user.hoTen || user.ten || '',
        email: user.email || '',
        soDienThoai: user.soDienThoai || '',
        diaChi: user.diaChi || '',
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
    setShowValidationErrors(false);
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
    setShowValidationErrors(false);
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
      setShowValidationErrors(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setShowValidationErrors(false);

    setSubmitting(true);
    try {
      const isPropose = destinationType === 'proposeProgram';

      // Upload minh chung file neu co
      let chungTuPath = null;
      if (chungTuFile) {
        try {
          const upRes = await uploadService.uploadFilePublic(chungTuFile);
          chungTuPath = upRes?.data?.filePath || null;
        } catch {
          // Neu upload that bai van tiep tuc gui
        }
      }

      if (isPropose) {
        const proposalPayload = {
          guest_ho_ten: formData.hoTen.trim(),
          guest_email: formData.email.trim().toLowerCase(),
          guest_so_dien_thoai: formData.soDienThoai.trim(),
          guest_dia_chi: formData.diaChi?.trim() || null,
          quy_thanh_phan_id: parseInt(formData.quythanhPhanId),
          ten_chuong_trinh: formData.tenChuongTrinh?.trim(),
          mo_ta: formData.moTa?.trim() || null,
          so_luong_suat: parseInt(formData.soLuongSuat) || 0,
          so_tien_moi_suat: parseFloat(formData.soTienMoiSuat) || 0,
          loai_ho_tro: formData.loaiHoTro || 'Tai tro khong hoan lai',
          ngay_bat_dau: formData.ngayBatDau || null,
          ngay_ket_thuc: formData.ngayKetThuc || null,
          chungTu: chungTuPath,
          taiKhoanNganHangId: formData.taiKhoanNganHangId || null,
          formTimestamp,
        };
        const result = await createPublicProposal(proposalPayload);
        if (result.success) {
          setSubmittedProposalInfo({
            email: result.data.email,
            trackingUuid: result.data.trackingUuid,
            otpToken: result.data.otpToken,
          });
          try {
            localStorage.setItem(`guest_otp_${result.data.trackingUuid}`, result.data.otpToken);
          } catch (e) { /* ignore */ }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          setErrors({ submit: result.message || 'Gửi đề xuất thất bại' });
        }
      } else if (isAuthenticated) {
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
          chungTu: chungTuPath,
          ghiChu: formData.ghiChu?.trim() || null,
        };
        const result = await createPublicDonation(payload);
        setSuccessResult(result?.donation || result?.data || result);
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
          chungTu: chungTuPath,
          ghiChu: formData.ghiChu?.trim() || null,
          taiKhoannganhangId: formData.taiKhoanNganHangId || null,
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
          window.scrollTo({ top: 0, behavior: 'smooth' });
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
  }, [formData, submitting, destinationType, isAuthenticated]);

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
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
        try {
          localStorage.setItem(`guest_otp_${response.data.trackingUuid}`, response.data.otpToken);
        } catch (e) { /* ignore */ }
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
    setDestinationType(null);
    setSuccessResult(null);
    setGuestSuccessInfo(null);
    setSubmittedGuestInfo(null);
    setGuestOtpCode('');
    setProposalSuccessInfo(null);
    setSubmittedProposalInfo(null);
    setProposalOtpCode('');
    setErrors({});
    setTouched({});
    setFormData({
      hoTen: '', email: '', soDienThoai: '',
      loaiNhaTaiTro: 'Ca nhan', toChuc: '', diaChi: '', ghiChu: '',
      quyId: null, quythanhPhanId: null, tenChuongTrinh: '', moTa: '',
      soLuongSuat: 0, soTienMoiSuat: 0, loaiHoTro: 'Tai tro khong hoan lai',
      ngayBatDau: '', ngayKetThuc: '',
      soTien: 0, hinhThuc: 'Truc tuyen', taiKhoanNganHangId: null, proposalFiles: [],
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const isSuccess = !!successResult;

  const handleVerifyProposalOtp = useCallback(async () => {
    if (!proposalOtpCode || proposalOtpCode.trim().length !== 6 || isNaN(proposalOtpCode)) {
      setErrors({ proposalOtp: 'Mã OTP phải gồm 6 chữ số' });
      return;
    }

    try {
      setVerifyingProposalOtp(true);
      setErrors({});
      const response = await apiVerifyProposalOtp({
        email: submittedProposalInfo.email,
        otpCode: proposalOtpCode.trim(),
        type: 'proposal',
        otpToken: submittedProposalInfo.otpToken,
      });

      if (response.success) {
        setProposalSuccessInfo({
          email: response.data.email,
          tempPassword: response.data.tempPassword,
          trackingUuid: response.data.trackingUuid,
        });
        setSubmittedProposalInfo(null);
        try {
          localStorage.removeItem(`guest_otp_${response.data.trackingUuid}`);
        } catch (e) { /* ignore */ }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrors({ proposalOtp: response.message || 'Mã OTP không chính xác' });
      }
    } catch (err) {
      setErrors({ proposalOtp: err?.response?.data?.message || 'Lỗi xác minh mã OTP' });
    } finally {
      setVerifyingProposalOtp(false);
    }
  }, [proposalOtpCode, submittedProposalInfo]);

  const handleResendProposalOtp = useCallback(async () => {
    if (!submittedProposalInfo?.otpToken) {
      setErrors({ proposalOtp: 'Phiên xác thực không hợp lệ, vui lòng gửi lại form' });
      return;
    }

    try {
      setResendingProposalOtp(true);
      setErrors({});
      const response = await apiResendProposalOtp({
        email: submittedProposalInfo.email,
        type: 'proposal',
        otpToken: submittedProposalInfo.otpToken,
      });

      if (response.success) {
        setSubmittedProposalInfo((prev) => ({
          ...prev,
          trackingUuid: response.data.trackingUuid,
          otpToken: response.data.otpToken,
        }));
        try {
          localStorage.setItem(`guest_otp_${response.data.trackingUuid}`, response.data.otpToken);
        } catch (e) { /* ignore */ }
        setProposalOtpCode('');
      } else {
        setErrors({ proposalOtp: response.message || 'Không thể gửi lại mã OTP' });
      }
    } catch (err) {
      setErrors({ proposalOtp: err?.response?.data?.message || 'Lỗi gửi lại mã OTP' });
    } finally {
      setResendingProposalOtp(false);
    }
  }, [submittedProposalInfo]);

  // ─── GUEST OTP VERIFICATION SCREEN ────────────────────────────
  if (submittedGuestInfo) {
    const leftContent = (
      <div className={styles.formContent}>
        <div className={styles.formTitle}>
          <h2>Xác thực email của bạn</h2>
          <p>Hệ thống đã gửi mã xác thực (OTP) 6 chữ số về email của bạn</p>
        </div>

        <div className={styles.otpCard}>
          <div className={styles.otpInfo}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>Kiểm tra hộp thư (hoặc Spam/Thư rác) tại <strong>{submittedGuestInfo.email}</strong></span>
          </div>

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

          {errors.otp && (
            <div className={styles.otpError}>{errors.otp}</div>
          )}

          <button
            type="button"
            className={styles.otpVerifyBtn}
            onClick={handleVerifyGuestOtp}
            disabled={verifyingOtp || guestOtpCode.length !== 6}
          >
            {verifyingOtp ? (
              <>
                <span className={styles.spinner} />
                Đang xác thực...
              </>
            ) : (
              'Xác nhận & Kích hoạt'
            )}
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
  }

  // ─── GUEST SUCCESS SCREEN (with temp credentials) ──────────────
  if (guestSuccessInfo) {
    const leftContent = (
      <div className={styles.formContent}>
        <div className={styles.formTitle}>
          <h2>Đăng ký đóng góp thành công!</h2>
          <p>Khoản tài trợ của bạn đã được ghi nhận và đang chờ xác nhận giao dịch</p>
        </div>

        <div className={styles.guestSuccessCard}>
          <div className={styles.guestSuccessIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#27ae60" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>

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
            Vui lòng đăng nhập và đổi mật khẩu ngay trong lần đầu tiên để bảo mật tài khoản.
          </p>

          <div className={styles.guestTrackingCode}>
            Mã tra cứu: <strong>{guestSuccessInfo.trackingUuid}</strong>
          </div>

          <button
            type="button"
            className={styles.submitBtn}
            onClick={handleNewDonation}
          >
            Đăng ký đóng góp mới
          </button>
        </div>
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
  }

  // ─── PROPOSAL OTP VERIFICATION SCREEN ────────────────────────
  if (submittedProposalInfo) {
    const leftContent = (
      <div className={styles.formContent}>
        <div className={styles.formTitle}>
          <h2>Xác thực email đề xuất chương trình</h2>
          <p>Hệ thống đã gửi mã xác thực (OTP) 6 chữ số về email của bạn</p>
        </div>

        <div className={styles.otpCard}>
          <div className={styles.otpInfo}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>Kiểm tra hộp thư (hoặc Spam/Thư rác) tại <strong>{submittedProposalInfo.email}</strong></span>
          </div>

          <div className={styles.otpTrackingCode}>
            Mã tra cứu: <strong>{submittedProposalInfo.trackingUuid}</strong>
          </div>

          <input
            type="text"
            maxLength={6}
            value={proposalOtpCode}
            onChange={(e) => {
              setProposalOtpCode(e.target.value.replace(/\D/g, ''));
              setErrors(prev => { const n = { ...prev }; delete n.proposalOtp; return n; });
            }}
            className={styles.otpInput}
            placeholder="000000"
            autoFocus
          />

          {errors.proposalOtp && (
            <div className={styles.otpError}>{errors.proposalOtp}</div>
          )}

          <button
            type="button"
            className={styles.otpVerifyBtn}
            onClick={handleVerifyProposalOtp}
            disabled={verifyingProposalOtp || proposalOtpCode.length !== 6}
          >
            {verifyingProposalOtp ? (
              <>
                <span className={styles.spinner} />
                Đang xác thực...
              </>
            ) : (
              'Xác nhận & Kích hoạt'
            )}
          </button>

          <button
            type="button"
            className={styles.otpResendBtn}
            onClick={handleResendProposalOtp}
            disabled={resendingProposalOtp || verifyingProposalOtp}
          >
            {resendingProposalOtp ? 'Đang gửi lại...' : 'Gửi lại mã OTP'}
          </button>
        </div>
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
  }

  // ─── PROPOSAL SUCCESS SCREEN ─────────────────────────────────
  if (proposalSuccessInfo) {
    const leftContent = (
      <div className={styles.formContent}>
        <div className={styles.formTitle}>
          <h2>Đăng ký đề xuất thành công!</h2>
          <p>Đề xuất chương trình của bạn đã được gửi và đang chờ xét duyệt</p>
        </div>

        <div className={styles.guestSuccessCard}>
          <div className={styles.guestSuccessIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#27ae60" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>

          <p className={styles.guestSuccessMsg}>
            Hệ thống đã tự động tạo tài khoản để bạn theo dõi đề xuất chương trình.
          </p>

          <div className={styles.guestCredentials}>
            <div className={styles.credentialRow}>
              <span className={styles.credentialLabel}>Email đăng nhập:</span>
              <span className={styles.credentialValue}>{proposalSuccessInfo.email}</span>
            </div>
            <div className={styles.credentialRow}>
              <span className={styles.credentialLabel}>Mật khẩu tạm:</span>
              <span className={`${styles.credentialValue} password`}>{proposalSuccessInfo.tempPassword}</span>
            </div>
          </div>

          <p className={styles.guestCredentialWarning}>
            Vui lòng đăng nhập và đổi mật khẩu ngay trong lần đầu tiên để bảo mật tài khoản.
          </p>

          <div className={styles.guestTrackingCode}>
            Mã tra cứu: <strong>{proposalSuccessInfo.trackingUuid}</strong>
          </div>

          <button
            type="button"
            className={styles.submitBtn}
            onClick={handleNewDonation}
          >
            Đăng ký đề xuất mới
          </button>
        </div>
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
  }

  // ─── MAIN FORM ─────────────────────────────────────────────────
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

      {showValidationErrors && Object.keys(errors).length > 0 && (
        <div className={styles.validationErrorBanner}>
          <div className={styles.validationErrorHeader}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span>Vui lòng kiểm tra lại các thông tin sau:</span>
          </div>
          <ul className={styles.validationErrorList}>
            {Object.entries(errors).map(([key, msg]) => (
              <li key={key} className={styles.validationErrorItem}>
                <span className={styles.validationErrorField}>{VALIDATION_ERROR_LABELS[key] || key}:</span>
                {' '}{msg}
              </li>
            ))}
          </ul>
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
          {!isAuthenticated && (
            <div className={styles.guestNotice}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>Bạn chưa đăng nhập. Hệ thống sẽ gửi mã OTP qua email để xác thực trước khi lưu dữ liệu.</span>
            </div>
          )}

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
                  chungTuFile={chungTuFile}
                  onChungTuChange={setChungTuFile}
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
