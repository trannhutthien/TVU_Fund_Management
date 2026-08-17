import { useCallback, useMemo, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Typography, Result, Button } from 'antd';
import { ClockCircleOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import PublicHeader from '@components/layout/PublicHeader/PublicHeader';
import PublicFooter from '@components/layout/PublicFooter/PublicFooter';
import BackgroundImage from '@components/common/BackgroundImage';
import LoginForm from '@components/forms/LoginForm';
import RegisterForm from '@components/forms/RegisterForm';
import FundTitleSection from '@components/sections/FundsPage/FundTitleSection/FundTitleSection';
import FundSelectSection from '@components/sections/AppliPage/AppliSectionLayout/AppliSectionForm/FundSelectSection/FundSelectSection';
import UserFieldsByRole from '@components/sections/AppliPage/AppliSectionLayout/AppliSectionForm/UserFieldsByRole/UserFieldsByRole';
import RequestContentSection from '@components/sections/AppliPage/AppliSectionLayout/AppliSectionForm/RequestContentSection/RequestContentSection';
import BankInfoSection from '@components/sections/AppliPage/AppliSectionLayout/AppliSectionForm/BankInfoSection/BankInfoSection';
import DocumentSection from '@components/sections/AppliPage/AppliSectionLayout/AppliSectionForm/DocumentSection/DocumentSection';
import ApplicationFooter from '@components/sections/AppliPage/AppliSectionLayout/AppliSectionForm/ApplicationFooter/ApplicationFooter';
import NewsSidebar from '@components/sections/AppliPage/AppliSectionLayout/NewsSidebar/NewsSidebar';
import AppliSectionLayout from '@components/sections/AppliPage/AppliSectionLayout/AppliSectionLayout';
import useAuthStore from '@stores/authStore';
import { LOAI_HO_TRO } from '@constants/loaiHoTro';

import { applicationService } from '@services/applicationService';
import { bankAccountService } from '@services/bankAccountService';
import { uploadService } from '@services/uploadService';
import { guestService } from '@services/guestService';
import {
  DEFAULT_PUBLIC_SETTINGS,
  systemSettingsService,
} from '@services/systemSettingsService';
import Input from '@components/common/Input/Input';
import { 
  HiOutlineClipboardDocumentCheck,
  HiOutlineCheck,
} from 'react-icons/hi2';
import styles from './ApplyPage.module.scss';

const { Title, Paragraph, Text } = Typography;

const INITIAL_GUEST_FIELDS = {
  guestHoTen: '',
  guestEmail: '',
  guestSoDienThoai: '',
  guestMssv: '',
  guestKhoa: '',
  guestLop: '',
  guestSoTaiKhoan: '',
  guestNganHang: '',
  guestChuTaiKhoan: '',
  ghiChu: '',
};

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((value || '').trim());
const isValidPhone = (value) => /^[0-9]{10,11}$/.test((value || '').trim());
const isValidBankAccountNumber = (value) => /^[0-9]{6,20}$/.test((value || '').trim());

const isGuestStudentInfoValid = (fields) => !!(
  fields.guestHoTen?.trim() &&
  isValidEmail(fields.guestEmail) &&
  isValidPhone(fields.guestSoDienThoai) &&
  fields.guestMssv?.trim() &&
  fields.guestKhoa?.trim() &&
  fields.guestLop?.trim() &&
  isValidBankAccountNumber(fields.guestSoTaiKhoan) &&
  fields.guestNganHang?.trim() &&
  fields.guestChuTaiKhoan?.trim()
);

/**
 * ApplyPage Component
 *
 * Trang nộp đơn xin hỗ trợ:
 * - Sinh viên / Cán bộ / Nhà khoa học: Nộp đơn yêu cầu hỗ trợ
 * - Nếu chưa đăng nhập → hỗ trợ gửi đơn dưới vai trò khách vãng lai (Public Guest) và gửi OTP
 */
const ApplyPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();
  
  // Trạng thái công khai
  const [publicSettings, setPublicSettings] = useState(DEFAULT_PUBLIC_SETTINGS);

  useEffect(() => {
    let isMounted = true;

    systemSettingsService.getPublicSettings()
      .then((settings) => {
        if (isMounted) setPublicSettings(settings);
      })
      .catch((error) => {
        console.error('Error fetching public system settings:', error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const [guestFields, setGuestFields] = useState(INITIAL_GUEST_FIELDS);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [submittedGuestInfo, setSubmittedGuestInfo] = useState(null); // { email, trackingUuid, type }
  const [guestOtpCode, setGuestOtpCode] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null); // { email, tempPassword, trackingUuid }

  const [userRole, setUserRole] = useState('sinh_vien');
  const [userFields, setUserFields] = useState({}); // Extra fields by role (khoa, lop, donViCongTac, etc.)

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedFund, setSelectedFund] = useState(null);
  const [contentValues, setContentValues] = useState({ 
    tieu_de: '', 
    mo_ta: '',
    so_tien_yeu_cau: '',
    loai_hotro: LOAI_HO_TRO.TAI_TRO_KHONG_HOAN_LAI,
    tong_kinh_phi_du_an: null,
    la_de_tai: false,
  });
  const [bankValues, setBankValues] = useState({ selectedBankId: null, soDienThoai: '' });
  const [bankAccounts, setBankAccounts] = useState([]);
  const [bankLoading, setBankLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formTimestamp] = useState(() => new Date().toISOString());
  const hasUploadedProof = uploadedFiles?.length > 0;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const fundIdFromNavigation =
      location.state?.quy_id ||
      location.state?.quyId ||
      location.state?.fundId ||
      params.get('quy_id') ||
      params.get('quyId') ||
      params.get('fundId');

    if (!fundIdFromNavigation) return;

    const fundId = Number(fundIdFromNavigation);
    if (!Number.isFinite(fundId)) return;

    const fundFromNavigation = {
      quyId: fundId,
      quy_id: fundId,
      id: fundId,
      tenQuy: location.state?.tenQuy || location.state?.ten_quy || null,
      ten_quy: location.state?.ten_quy || location.state?.tenQuy || null,
      loaiQuy: location.state?.loaiQuy || location.state?.loai_quy || null,
      loai_quy: location.state?.loai_quy || location.state?.loaiQuy || null,
    };

    setSelectedFund((prev) => {
      if (prev?.quyId === fundId) return prev;
      return fundFromNavigation;
    });
  }, [location.search, location.state]);

  const handleFundSelect = useCallback((fund) => {
    setSelectedFund((prev) => (prev === fund ? prev : fund));
  }, []);

  const handleContentChange = useCallback((valuesOrUpdater) => {
    setContentValues((prev) => {
      const next = typeof valuesOrUpdater === 'function'
        ? valuesOrUpdater(prev)
        : valuesOrUpdater;

      // Reset tong_kinh_phi_du_an khi chuyển loại hỗ trợ sang loại không cần
      if (prev.loai_hotro !== next.loai_hotro &&
          next.loai_hotro !== LOAI_HO_TRO.TAI_TRO_CO_THU_HOI) {
        return { ...next, tong_kinh_phi_du_an: null };
      }

      return next;
    });
  }, []);

  const handleBankChange = useCallback((values) => {
    setBankValues(values);
  }, []);

  const handleOpenAI = useCallback(() => {
    // AI panel luôn hiển thị ở sidebar, không cần mở riêng
  }, []);

  const handleApplyAISuggestion = useCallback((newText) => {
    setContentValues((prev) => ({ ...prev, mo_ta: newText }));
  }, []);

  const handleFilesChange = useCallback((files) => {
    setUploadedFiles(files);
  }, []);



  // Trạng thái hợp lệ của từng bước riêng lẻ
  const isStep1Valid = useMemo(() => {
    // Must select fund AND user role
    return !!selectedFund && !!userRole;
  }, [selectedFund, userRole]);

  const isStep2Valid = useMemo(() => {
    // Validate user fields by role
    const isUserInfoValid = (() => {
      if (!userRole) return true; // No role selected yet
      if (userRole === 'sinh_vien') {
        if (isAuthenticated) {
          // Authenticated user: check data from user object
          return !!(user?.khoaPhong && user?.lop);
        }
        // Guest: require all fields from userFields
        return !!(userFields.hoTen && userFields.maSoDinhDanh && userFields.email && userFields.soDienThoai && userFields.khoa && userFields.lop);
      }
      if (userRole === 'can_bo_truong' || userRole === 'can_bo_nghi_huu') {
        if (isAuthenticated) return !!(userFields.donViCongTac || user?.donViCongTac || user?.donvicongtac);
        return !!(userFields.hoTen && userFields.maSoDinhDanh && userFields.email && userFields.soDienThoai);
      }
      if (userRole === 'nha_khoa_hoc') {
        if (isAuthenticated) return !!(userFields.donViCongTac || user?.donViCongTac || user?.donvicongtac);
        return !!(userFields.hoTen && userFields.maSoDinhDanh && userFields.email && userFields.soDienThoai);
      }
      return true;
    })();
    if (!isUserInfoValid) return false;

    const baseValid = !!(
      contentValues.tieu_de?.length >= 10 &&
      contentValues.mo_ta?.length >= 50 &&
      contentValues.so_tien_yeu_cau &&
      (isAuthenticated
        ? parseFloat(contentValues.so_tien_yeu_cau) >= (selectedFund?.soTienToiThieu || 0) &&
          parseFloat(contentValues.so_tien_yeu_cau) <= (selectedFund?.soTienToiDa || Infinity)
        : parseFloat(contentValues.so_tien_yeu_cau) > 0)
    );
    if (!baseValid) return false;

    if (contentValues.loai_hotro === LOAI_HO_TRO.TAI_TRO_CO_THU_HOI) {
      const tongKinhPhi = parseFloat(contentValues.tong_kinh_phi_du_an);
      const soTien = parseFloat(contentValues.so_tien_yeu_cau);
      return !!(
        contentValues.tong_kinh_phi_du_an &&
        !isNaN(tongKinhPhi) &&
        tongKinhPhi > 0 &&
        tongKinhPhi >= soTien
      );
    }

    return true;
  }, [contentValues, isAuthenticated, selectedFund, userRole, userFields, user]);

  const isStep3Valid = useMemo(() => {
    return isAuthenticated
      ? !!(bankValues.selectedBankId && bankValues.soDienThoai?.length > 0)
      // Khách vãng lai: chỉ cần validate thông tin ngân hàng (bước 1,2 đã validate ở bước tương ứng)
      : !!(guestFields.guestNganHang?.trim() && isValidBankAccountNumber(guestFields.guestSoTaiKhoan) && guestFields.guestChuTaiKhoan?.trim());
  }, [isAuthenticated, bankValues, guestFields]);

  const isStep4Valid = useMemo(() => {
    return hasUploadedProof;
  }, [hasUploadedProof]);

  // Xác định bước cuối cùng của biểu mẫu hiện tại
  const lastStepIndex = 4;

  // Tính toán tính hợp lệ của toàn bộ form dựa trên các bước
  const isFormValid = useMemo(() => {
    if (isAuthenticated) {
      return isStep1Valid && isStep2Valid && isStep3Valid && isStep4Valid;
    }
    return isStep1Valid && isStep2Valid && isStep3Valid && isStep4Valid && captchaVerified;
  }, [isAuthenticated, isStep1Valid, isStep2Valid, isStep3Valid, isStep4Valid, captchaVerified]);

  const handleReset = () => {
    // Reset tất cả state về giá trị ban đầu
    setSelectedFund(null);
    setGuestFields(INITIAL_GUEST_FIELDS);
    setContentValues({ 
      tieu_de: '', 
      mo_ta: '',
      so_tien_yeu_cau: ''
    });
    setBankValues({ selectedBankId: null, soDienThoai: '' });
    setUploadedFiles([]);
    
    // Hiển thị toast thông báo
    toast.info('Đã làm mới toàn bộ form');
  };

  const handleSaveDraft = () => {
    toast.info('Tính năng lưu nháp đang được phát triển. Vui lòng hoàn thành đơn trong một lượt.');
  };

  const handleSubmit = async () => {
    // Validate lại một lần nữa
    if (!isFormValid) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    // Kiểm tra file đính kèm
    if (!uploadedFiles || uploadedFiles.length === 0) {
      toast.error('Vui lòng đính kèm file minh chứng');
      return;
    }

    try {
      setIsSubmitting(true);

      let fileUrl = '';
      if (uploadedFiles?.length > 0) {
        toast.info('Đang upload file...');
        
        const fileToUpload = uploadedFiles[0].file; // Lấy File object thực
        
        // Khách vãng lai dùng uploadFilePublic, user đăng nhập dùng uploadFile
        const uploadResponse = isAuthenticated
          ? await uploadService.uploadFile(fileToUpload)
          : await uploadService.uploadFilePublic(fileToUpload);

        if (!uploadResponse.success) {
          toast.error(uploadResponse.message || 'Upload file thất bại');
          return;
        }

        fileUrl = uploadResponse.data.filePath; // Đường dẫn file từ server
        
        if (!fileUrl || fileUrl.trim() === '') {
          toast.error('Không nhận được đường dẫn file từ server');
          return;
        }
      }

      // BƯỚC 2: Tạo đơn yêu cầu hỗ trợ
      let response;
      
      if (isAuthenticated) {
        // LUỒNG ĐÃ ĐĂNG NHẬP
        const soTienNum = parseFloat(contentValues.so_tien_yeu_cau);
        if (!contentValues.so_tien_yeu_cau || isNaN(soTienNum) || soTienNum <= 0) {
          toast.error('Vui lòng nhập số tiền yêu cầu hợp lệ');
          return;
        }
        
        const applicationData = {
          quyId: selectedFund.quyId,
          tieuDe: contentValues.tieu_de,
          moTa: contentValues.mo_ta,
          soTienYeuCau: soTienNum,
          fileDinhKem: fileUrl,
          loaiHoTro: contentValues.loai_hotro,
          tongKinhPhiDuAn: contentValues.tong_kinh_phi_du_an
            ? parseFloat(contentValues.tong_kinh_phi_du_an)
            : null,
          laDeTai: (contentValues.loai_hotro === LOAI_HO_TRO.TAI_TRO_CO_THU_HOI || contentValues.la_de_tai) ? 1 : 0,
          // Thông tin vai trò người nộp
          vaiTroNguoiNop: userRole || undefined,
          chiTietVaiTro: userRole ? { ...userFields } : undefined,
        };
        response = await applicationService.create(applicationData);

        const responseData = response?.data || response;
        const isSuccess = response?.success === true || 
                          response?.success === 'true' || 
                          response?.data?.success === true || 
                          response?.data?.success === 'true';

        if (isSuccess) {
          toast.success('Nộp đơn thành công! Đơn của bạn đang chờ xét duyệt.');
          
          setContentValues({ 
            tieu_de: '', mo_ta: '', so_tien_yeu_cau: '',
            loai_hotro: LOAI_HO_TRO.TAI_TRO_KHONG_HOAN_LAI,
            tong_kinh_phi_du_an: null,
            la_de_tai: false,
          });
          setUploadedFiles([]);
          setUserRole(null);
          setUserFields({});
          setTimeout(() => navigate('/profile'), 1500);
        } else {
          toast.error(responseData?.message || 'Thao tác thất bại');
        }
      } else {
        // LUỒNG KHÁCH VÃNG LAI (GUEST)
        const payload = {
          guestHoTen: userFields.hoTen || guestFields.guestHoTen,
          guestEmail: userFields.email || guestFields.guestEmail,
          guestSoDienThoai: userFields.soDienThoai || guestFields.guestSoDienThoai,
          userRole,
          guestMssv: userFields.maSoDinhDanh || guestFields.guestMssv,
          guestKhoa: userRole === 'sinh_vien'
            ? (userFields.khoa || guestFields.guestKhoa)
            : (userFields.donViCongTac || guestFields.guestKhoa),
          guestLop: userRole === 'sinh_vien'
            ? (userFields.lop || guestFields.guestLop)
            : (userRole === 'can_bo_nghi_huu' ? userFields.soNamCongTac : null),
          donViCongTac: userFields.donViCongTac || null,
          soNamCongTac: userFields.soNamCongTac || null,
          chuyenMon: userFields.chuyenMon || null,
          guestSoTaiKhoan: guestFields.guestSoTaiKhoan,
          guestNganHang: guestFields.guestNganHang,
          guestChuTaiKhoan: guestFields.guestChuTaiKhoan,
          quyId: selectedFund.quyId,
          tieuDe: contentValues.tieu_de,
          lyDo: contentValues.mo_ta,
          soTienDeNghi: parseFloat(contentValues.so_tien_yeu_cau),
          taiLieuDinhKem: fileUrl,
          loaiHoTro: contentValues.loai_hotro,
          tongKinhPhiDuAn: contentValues.tong_kinh_phi_du_an
            ? parseFloat(contentValues.tong_kinh_phi_du_an)
            : null,
          laDeTai: (contentValues.loai_hotro === LOAI_HO_TRO.TAI_TRO_CO_THU_HOI || contentValues.la_de_tai) ? 1 : 0,
          formTimestamp,
        };
        response = await guestService.submitApplication(payload);

        if (response.success) {
          toast.info('Vui lòng kiểm tra email để nhận mã xác thực OTP');
          const guestInfo = {
            email: response.data.email,
            trackingUuid: response.data.trackingUuid,
            otpToken: response.data.otpToken,
            type: 'application'
          };
          setSubmittedGuestInfo(guestInfo);
          // Luu vao localStorage de TrackPage co the truy cap
          try {
            localStorage.setItem(`guest_otp_${response.data.trackingUuid}`, response.data.otpToken);
          } catch (e) { /* ignore */ }
        } else {
          toast.error(response.message || 'Gửi yêu cầu thất bại');
        }
      }
    } catch (error) {
      console.error('Submit error:', error);
      const errorMessage = error.response?.data?.message || 'Đã xảy ra lỗi khi xử lý yêu cầu';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    
    const fetchBankAccounts = async () => {
      setBankLoading(true);
      try {
        const response = await bankAccountService.getAll();
        
        if (response.success) {
          // Transform camelCase to snake_case for component compatibility
          const accounts = response.data.map(acc => ({
            tai_khoan_id: acc.taiKhoanId,
            so_tai_khoan: acc.soTaiKhoan,
            ten_ngan_hang: acc.tenNganHang,
            chu_tai_khoan: acc.chuTaiKhoan,
            la_mac_dinh: acc.laMacDinh,
          }));
          setBankAccounts(accounts);
          
          // Auto-select default account if exists
          const defaultAccount = accounts.find(acc => acc.la_mac_dinh === 1);
          if (defaultAccount && !bankValues.selectedBankId) {
            setBankValues(prev => ({
              ...prev,
              selectedBankId: defaultAccount.tai_khoan_id
            }));
          }
        } else {
          setBankAccounts([]);
        }
      } catch (error) {
        console.error('Fetch bank accounts error:', error);
        toast.error('Không thể tải danh sách tài khoản ngân hàng');
        setBankAccounts([]);
      } finally {
        setBankLoading(false);
      }
    };
    
    fetchBankAccounts();
  }, [isAuthenticated]);

  const openLoginModal = useCallback(() => setIsLoginModalOpen(true), []);
  const closeLoginModal = useCallback(() => setIsLoginModalOpen(false), []);

  const openRegisterModal = useCallback(() => setIsRegisterModalOpen(true), []);
  const closeRegisterModal = useCallback(() => setIsRegisterModalOpen(false), []);

  // Switch between modals
  const switchToRegister = () => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(true);
  };

  const switchToLogin = () => {
    setIsRegisterModalOpen(false);
    setIsLoginModalOpen(true);
  };

  // Handle ESC key để đóng modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (isLoginModalOpen) closeLoginModal();
        if (isRegisterModalOpen) closeRegisterModal();
      }
    };

    if (isLoginModalOpen || isRegisterModalOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [closeLoginModal, closeRegisterModal, isLoginModalOpen, isRegisterModalOpen]);

  // Xử lý xác thực OTP từ khách vãng lai
  const handleVerifyGuestOtp = async () => {
    if (!guestOtpCode || guestOtpCode.trim().length !== 6 || isNaN(guestOtpCode)) {
      toast.error('Mã OTP phải gồm 6 chữ số');
      return;
    }

    try {
      setVerifyingOtp(true);
      const response = await guestService.verifyOtp({
        email: submittedGuestInfo.email,
        otpCode: guestOtpCode.trim(),
        type: submittedGuestInfo.type,
        otpToken: submittedGuestInfo.otpToken
      });

      if (response.success) {
        toast.success('Xác thực OTP thành công!');
        setSuccessInfo({
          email: response.data.email,
          tempPassword: response.data.tempPassword,
          trackingUuid: response.data.trackingUuid
        });
        setSubmittedGuestInfo(null);
      } else {
        toast.error(response.message || 'Mã OTP không chính xác');
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      toast.error(err.response?.data?.message || 'Lỗi xác minh mã OTP');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleResendGuestOtp = async () => {
    if (!submittedGuestInfo?.otpToken) {
      toast.error('Phiên xác thực không hợp lệ, vui lòng gửi lại form');
      return;
    }

    try {
      setResendingOtp(true);
      const response = await guestService.resendOtp({
        email: submittedGuestInfo.email,
        type: submittedGuestInfo.type,
        otpToken: submittedGuestInfo.otpToken
      });

      if (response.success) {
        setSubmittedGuestInfo((prev) => ({
          ...prev,
          trackingUuid: response.data.trackingUuid,
          otpToken: response.data.otpToken
        }));
        setGuestOtpCode('');
        toast.success('Đã gửi lại mã OTP mới. Vui lòng dùng email mới nhất.');
      } else {
        toast.error(response.message || 'Không thể gửi lại mã OTP');
      }
    } catch (err) {
      console.error('Resend OTP error:', err);
      toast.error(err.response?.data?.message || 'Lỗi gửi lại mã OTP');
    } finally {
      setResendingOtp(false);
    }
  };

  const handleInputChange = useCallback((field, value) => {
    setGuestFields(prev => (
      prev[field] === value ? prev : { ...prev, [field]: value }
    ));
  }, []);

  // ─── PHÂN NHÁNH GIAO DIỆN 1: MÀN HÌNH NHẬP OTP
  if (submittedGuestInfo) {
    return (
      <div className={styles.applyPage}>
        <PublicHeader onLoginClick={openLoginModal} onRegisterClick={openRegisterModal} />
        <BackgroundImage overlayType="dark">
          <main className={styles.mainContent}>
            <div className={styles.otpWrapper}>
              <Title level={3} className={styles.otpTitle}>
                <ClockCircleOutlined style={{ color: '#faad14', marginRight: 10 }} />
                Xác Thực Email Của Bạn
              </Title>
              <Paragraph style={{ color: '#8b949e' }}>
                Hệ thống đã gửi một mã xác thực (OTP) 6 chữ số về địa chỉ email <strong>{submittedGuestInfo.email}</strong>. 
                Vui lòng kiểm tra hộp thư (hoặc mục Spam/Thư rác) và nhập mã vào ô bên dưới:
              </Paragraph>
              <Text className={styles.otpTrackingCode}>
                Mã tra cứu: {submittedGuestInfo.trackingUuid}
              </Text>
              <input
                type="text"
                maxLength={6}
                value={guestOtpCode}
                onChange={(e) => setGuestOtpCode(e.target.value.replace(/\D/g, ''))}
                className={styles.otpInput}
                placeholder="000000"
              />
              <div style={{ marginTop: 20 }}>
                <Button 
                  type="primary" 
                  size="large" 
                  onClick={handleVerifyGuestOtp} 
                  loading={verifyingOtp}
                  style={{ width: '100%', background: '#4f46e5', borderColor: '#4f46e5' }}
                >
                  Xác Nhận & Kích Hoạt
                </Button>
                <Button
                  type="link"
                  onClick={handleResendGuestOtp}
                  loading={resendingOtp}
                  disabled={verifyingOtp}
                  style={{ marginTop: 12 }}
                >
                  Gửi lại mã OTP
                </Button>
              </div>
            </div>
          </main>
        </BackgroundImage>
        <PublicFooter />
      </div>
    );
  }

  // ─── PHÂN NHÁNH GIAO DIỆN 2: THÔNG BÁO THÀNH CÔNG KÈM TÀI KHOẢN TỰ SINH
  if (successInfo) {
    return (
      <div className={styles.applyPage}>
        <PublicHeader onLoginClick={openLoginModal} onRegisterClick={openRegisterModal} />
        <BackgroundImage overlayType="dark">
          <main className={styles.mainContent}>
            <div className={styles.successWrapper}>
              <Result
                status="success"
                title={<span style={{ color: '#fff' }}>Gửi Yêu Cầu Thành Công!</span>}
                subTitle={
                  <span style={{ color: '#8b949e' }}>
                    Yêu cầu của bạn đã được lưu vào hệ thống chính và đang chờ phê duyệt.
                  </span>
                }
                extra={[
                  <Button 
                    type="primary" 
                    key="login" 
                      onClick={() => {
                        openLoginModal();
                        setSuccessInfo(null);
                      }}
                    style={{ background: '#4f46e5', borderColor: '#4f46e5' }}
                  >
                    Đăng Nhập Ngay
                  </Button>,
                  <Button key="track" onClick={() => navigate(`/track/${successInfo.trackingUuid}`)}>
                    Xem Tiến Độ Đơn
                  </Button>
                ]}
              >
                <div className={styles.credentialBox}>
                  <Title level={5} style={{ color: '#fff', marginTop: 0 }}>
                    <SafetyCertificateOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                    Tài khoản theo dõi hồ sơ tự động
                  </Title>
                  <Paragraph>
                    Hệ thống đã tự động tạo tài khoản thành viên để bạn đăng nhập theo dõi tiến trình duyệt đơn sau này:
                  </Paragraph>
                  <p><strong>Email đăng nhập:</strong> {successInfo.email}</p>
                  <p><strong>Mật khẩu tạm thời:</strong> <span className={styles.pwdText}>{successInfo.tempPassword}</span></p>
                  <p style={{ color: '#ff4d4f', fontSize: '12px', marginTop: 10 }}>
                    * Vui lòng lưu lại mật khẩu này và đổi ngay sau khi đăng nhập lần đầu.
                  </p>
                  <p><strong>Mã tra cứu nhanh UUID:</strong> <Text copyable style={{ color: '#a5b4fc' }}>{successInfo.trackingUuid}</Text></p>
                </div>
              </Result>
            </div>
          </main>
        </BackgroundImage>
        <PublicFooter />
      </div>
    );
  }

  // ─── HIỂN THỊ FORM CHÍNH
  return (
    <div className={styles.applyPage}>
      <PublicHeader
        onLoginClick={openLoginModal}
        onRegisterClick={openRegisterModal}
      />

      <BackgroundImage overlayType="dark">
        <main className={styles.mainContent}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link to="/" className={styles.breadcrumbLink}>Trang chủ</Link>
            <span className={styles.breadcrumbSep}>→</span>
            <Link to="/funds" className={styles.breadcrumbLink}>Danh mục quỹ</Link>
            <span className={styles.breadcrumbSep}>→</span>
            <span className={styles.breadcrumbCurrent}>
              Gửi yêu cầu hỗ trợ
            </span>
          </nav>

          <div className={styles.titleSection}>
            <FundTitleSection
              title="Gửi yêu cầu hỗ trợ"
              highlight="Yêu cầu hỗ trợ mới"
              subtitle="Vui lòng điền đầy đủ thông tin để chúng tôi xử lý nhanh nhất."
              variant="transparent"
            />
          </div>

          {/* Login Prompt for Guest Users */}
          {!isAuthenticated && (
            <div className={styles.loginPrompt}>
              <div className={styles.loginAlertBox}>
                <div className={styles.loginAlertIcon}>ℹ️</div>
                <div className={styles.loginAlertContent}>
                  <p className={styles.loginAlertText}>
                    Bạn đã có tài khoản?{' '}
                    <button
                      type="button"
                      className={styles.loginPromptLink}
                      onClick={openLoginModal}
                      aria-label="Mở form đăng nhập"
                    >
                      Đăng nhập
                    </button>
                    {' '}để tự động điền thông tin và quản lý đơn của bạn.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className={styles.formSection}>
            <AppliSectionLayout
              leftContent={
                <>
                  {/* PHẦN 1A2: Thông tin cá nhân theo vai trò */}
                  {userRole && (
                    <div className={styles.stepSectionWrapper}>
                      <UserFieldsByRole
                        role={userRole}
                        values={userFields}
                        onChange={setUserFields}
                        isGuest={!isAuthenticated}
                      />
                    </div>
                  )}

                  {/* BƯỚC 1: Chọn Quỹ */}
                  <div className={styles.stepSectionWrapper}>
                    <FundSelectSection
                      onFundSelect={handleFundSelect}
                      selectedFund={selectedFund}
                    />
                  </div>

                  {/* BƯỚC 2: Nội dung yêu cầu hỗ trợ */}
                  <div className={styles.stepSectionWrapper}>
                    <RequestContentSection
                      onChange={handleContentChange}
                      values={contentValues}
                      selectedFund={selectedFund}
                      onOpenAI={handleOpenAI}
                      isGuest={!isAuthenticated}
                    />
                  </div>

                  {/* BƯỚC 3: Thông tin nhận giải ngân / Thông tin cá nhân sinh viên */}
                  <div className={styles.stepSectionWrapper}>
                    {isAuthenticated ? (
                      <BankInfoSection
                        bankAccounts={bankAccounts}
                        defaultPhone={null}
                        onChange={handleBankChange}
                        values={bankValues}
                        loading={bankLoading}
                      />
                    ) : (
                      <div className={styles.guestFormCard}>
                        <h3>Thông tin ngân hàng nhận giải ngân</h3>
                        <div className={styles.guestFormRowThree}>
                          <div className={styles.inputGroup}>
                            <Input 
                              type="text" 
                              label="Tên ngân hàng"
                              placeholder="Ví dụ: Vietcombank..."
                              value={guestFields.guestNganHang}
                              onChange={(e) => handleInputChange('guestNganHang', e.target.value)}
                              required
                            />
                          </div>
                          <div className={styles.inputGroup}>
                            <Input 
                              type="text" 
                              label="Số tài khoản"
                              placeholder="Số tài khoản ngân hàng..."
                              value={guestFields.guestSoTaiKhoan}
                              onChange={(e) => handleInputChange('guestSoTaiKhoan', e.target.value)}
                              required
                            />
                          </div>
                          <div className={styles.inputGroup}>
                            <Input 
                              type="text" 
                              label="Chủ tài khoản"
                              placeholder="Tên viết hoa không dấu..."
                              value={guestFields.guestChuTaiKhoan}
                              onChange={(e) => handleInputChange('guestChuTaiKhoan', e.target.value)}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Tài liệu đính kèm minh chứng */}
                  <div className={styles.stepSectionWrapper}>
                    <DocumentSection
                      files={uploadedFiles}
                      onFilesChange={handleFilesChange}
                    />
                  </div>

                  {/* Xác nhận thông tin cho khách vãng lai */}
                  {!isAuthenticated && (
                    <div className={styles.stepSectionWrapper}>
                      <div className={styles.guestFormCard}>
                        <h3>Xác nhận thông tin</h3>
                        <label className={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={captchaVerified}
                            onChange={(e) => setCaptchaVerified(e.target.checked)}
                            className={styles.checkboxInput}
                          />
                          <span>Tôi xác nhận thông tin cung cấp chính xác và đồng ý gửi yêu cầu.</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Nút bấm Lưu nháp / Gửi đơn / Reset */}
                  <ApplicationFooter
                    onSaveDraft={null}
                    onSubmit={handleSubmit}
                    onReset={handleReset}
                    isSubmitting={isSubmitting}
                    isSaving={false}
                    isFormValid={isFormValid}
                  />
                </>
              }
              rightContent={
                <NewsSidebar />
              }
            />
          </div>
        </main>
      </BackgroundImage>

      <PublicFooter />

      {/* Login Modal */}
      {isLoginModalOpen && (
        <div className="login-modal-overlay" onClick={closeLoginModal}>
          <div className="login-modal-content" onClick={(e) => e.stopPropagation()}>
            <LoginForm
              onSuccess={closeLoginModal}
              onClose={closeLoginModal}
              onSwitchToRegister={switchToRegister}
            />
          </div>
        </div>
      )}

      {/* Register Modal */}
      {isRegisterModalOpen && (
        <div className="register-modal-overlay" onClick={closeRegisterModal}>
          <div className="register-modal-content" onClick={(e) => e.stopPropagation()}>
            <RegisterForm
              onSuccess={closeRegisterModal}
              onClose={closeRegisterModal}
              onSwitchToLogin={switchToLogin}
            />
          </div>
        </div>
      )}


    </div>
  );
};

export default ApplyPage;
