import { memo, useCallback, useMemo, useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Typography, Card, Result, Button } from 'antd';
import { ClockCircleOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import PublicHeader from '@components/layout/PublicHeader/PublicHeader';
import PublicFooter from '@components/layout/PublicFooter/PublicFooter';
import BackgroundImage from '@components/common/BackgroundImage';
import LoginForm from '@components/forms/LoginForm';
import RegisterForm from '@components/forms/RegisterForm';
import FundTitleSection from '@components/sections/FundsPage/FundTitleSection/FundTitleSection';
import FundSelectSection from '@components/sections/AppliPage/AppliSectionLayout/AppliSectionForm/FundSelectSection/FundSelectSection';
import RequestContentSection from '@components/sections/AppliPage/AppliSectionLayout/AppliSectionForm/RequestContentSection/RequestContentSection';
import BankInfoSection from '@components/sections/AppliPage/AppliSectionLayout/AppliSectionForm/BankInfoSection/BankInfoSection';
import DonationAmountSection from '@components/sections/AppliPage/AppliSectionLayout/AppliSectionForm/DonationAmountSection/DonationAmountSection';
import DonorInfoSection from '@components/sections/DonationForm/DonorInfoSection';
import DocumentSection from '@components/sections/AppliPage/AppliSectionLayout/AppliSectionForm/DocumentSection/DocumentSection';
import ApplicationFooter from '@components/sections/AppliPage/AppliSectionLayout/AppliSectionForm/ApplicationFooter/ApplicationFooter';
import NewsSidebar from '@components/sections/AppliPage/AppliSectionLayout/NewsSidebar/NewsSidebar';
import AppliSectionLayout from '@components/sections/AppliPage/AppliSectionLayout/AppliSectionLayout';
import useAuthStore from '@stores/authStore';
import { LOAI_HO_TRO } from '@constants/loaiHoTro';
import { bankAccountService } from '@services/bankAccountService';
import { applicationService } from '@services/applicationService';
import { uploadService } from '@services/uploadService';
import { guestService } from '@services/guestService';
import {
  DEFAULT_PUBLIC_SETTINGS,
  systemSettingsService,
  toFundBankAccount,
} from '@services/systemSettingsService';
import api from '@services/api';
import Input from '@components/common/Input/Input';
import { formatCurrency } from '@utils/formatters';
import { 
  HiOutlineCreditCard, 
  HiOutlineBuildingLibrary, 
  HiOutlineBanknotes, 
  HiOutlineClipboardDocumentCheck,
  HiOutlineCheck,
  HiOutlineQrCode
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
  guestToChuc: '',
  guestDiaChi: '',
  hinhThuc: 'Khac',
  maGiaoDich: '',
  ghiChu: '',
};

const isDonorGuestInfoComplete = (fields) => !!(
  fields.guestHoTen?.trim() &&
  fields.guestEmail?.trim() &&
  fields.guestSoDienThoai?.trim()
);

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

const GuestDonorInfoSection = memo(({
  initialValues,
  onFieldsChange,
  onValidityChange,
  resetKey,
}) => {
  return (
    <DonorInfoSection
      initialValues={initialValues}
      onFieldsChange={onFieldsChange}
      onValidityChange={onValidityChange}
      resetKey={resetKey}
    />
  );
});

GuestDonorInfoSection.displayName = 'GuestDonorInfoSection';

GuestDonorInfoSection.propTypes = {
  initialValues: PropTypes.shape({
    guestHoTen: PropTypes.string,
    guestEmail: PropTypes.string,
    guestSoDienThoai: PropTypes.string,
    guestToChuc: PropTypes.string,
    guestDiaChi: PropTypes.string,
    ghiChu: PropTypes.string,
  }).isRequired,
  onFieldsChange: PropTypes.func.isRequired,
  onValidityChange: PropTypes.func.isRequired,
  resetKey: PropTypes.number.isRequired,
};

/**
 * ApplyPage Component
 *
 * Trang đa năng:
 * - Sinh viên (role 4 - SINH_VIEN): Nộp đơn yêu cầu hỗ trợ
 * - Nhà tài trợ (role 4 - NHA_TAI_TRO): Quyên góp cho quỹ
 * - Nếu chưa đăng nhập → hỗ trợ gửi đơn dưới vai trò khách vãng lai (Public Guest) và gửi OTP
 */
const ApplyPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();
  
  // Trạng thái phương thức đóng góp tài trợ mới
  const [paymentMethod, setPaymentMethod] = useState('Khac'); // 'Chuyen khoan' | 'Khac' | 'Tien mat'
  const [publicSettings, setPublicSettings] = useState(DEFAULT_PUBLIC_SETTINGS);
  const [isOnlinePaymentCompleted, setIsOnlinePaymentCompleted] = useState(false);
  const [onlineTxnId, setOnlineTxnId] = useState('');
  const [isOnlineModalOpen, setIsOnlineModalOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  
  // Trạng thái cho modal giả lập thanh toán online
  const [onlinePayState, setOnlinePayState] = useState('idle'); // 'idle' | 'processing' | 'success'
  const [selectedOnlineCard, setSelectedOnlineCard] = useState('vnpay'); // 'vnpay' | 'atm' | 'visa'

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

  // Trạng thái cho khách vãng lai (Public Guest)
  const [guestRole, setGuestRole] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get('role');
    if (roleParam === 'student' || roleParam === 'donor') {
      return roleParam;
    }
    return null;
  });

  // Đồng bộ guestRole từ query parameter (?role=student hoặc ?role=donor)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get('role') || location.state?.guestRole || location.state?.role;
    if (roleParam === 'student' || roleParam === 'donor') {
      setGuestRole(roleParam);
    } else if (roleParam === 'sponsor') {
      setGuestRole('donor');
    }
  }, [location.search, location.state]);

  // Reset active step khi thay đổi vai trò hoặc trạng thái đăng nhập
  useEffect(() => {
    setActiveStep(1);
  }, [guestRole, isAuthenticated]);

  const [guestFields, setGuestFields] = useState(INITIAL_GUEST_FIELDS);
  const guestDonorFieldsRef = useRef(INITIAL_GUEST_FIELDS);
  const [guestDonorInfoValid, setGuestDonorInfoValid] = useState(false);
  const [guestDonorResetKey, setGuestDonorResetKey] = useState(0);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [submittedGuestInfo, setSubmittedGuestInfo] = useState(null); // { email, trackingUuid, type }
  const [guestOtpCode, setGuestOtpCode] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null); // { email, tempPassword, trackingUuid }

  const [activeStep, setActiveStep] = useState(1);

  const handlePaymentMethodChange = useCallback((method) => {
    setPaymentMethod(method);
    setGuestFields(prev => (
      prev.hinhThuc === method ? prev : { ...prev, hinhThuc: method }
    ));
    guestDonorFieldsRef.current = {
      ...guestDonorFieldsRef.current,
      hinhThuc: method,
    };
    
    // Reset online payment state if switching tabs
    if (method !== 'Khac') {
      setIsOnlinePaymentCompleted(false);
      setOnlineTxnId('');
    }
    setActiveStep(1);
  }, []);

  // Xác định vai trò: Nhà tài trợ hoặc Sinh viên
  const userType = user?.loai_tai_khoan || user?.loaiTaiKhoan || user?.loai_nguoi_dung;
  const isStudent = userType === 'SINH_VIEN';
  const isDonorUser = userType === 'NHA_TAI_TRO';
  const isDonor = isDonorUser ? true : (isStudent ? false : (guestRole === 'donor'));
  
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedFund, setSelectedFund] = useState(null);
  const [donationAmount, setDonationAmount] = useState(''); // Số tiền quyên góp cho Nhà tài trợ
  const [schoolBankAccounts, setSchoolBankAccounts] = useState([]); // Danh sách TK nhà trường
  const [selectedBankAccountId, setSelectedBankAccountId] = useState(null); // TK nhà trường được chọn
  const [transactionId, setTransactionId] = useState(''); // Mã giao dịch để hiển thị trong nội dung CK
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
  const defaultSponsorBank = toFundBankAccount(publicSettings.tai_khoan_nhan_tai_tro);
  const hasDefaultSponsorBank = !!(
    defaultSponsorBank.nganHang &&
    defaultSponsorBank.soTaiKhoan &&
    defaultSponsorBank.chuTaiKhoan
  );
  const contactEmail = publicSettings.email_ho_tro || publicSettings.email_lien_he;
  const selectedFundId = selectedFund?.quyId ?? selectedFund?.quy_id ?? selectedFund?.id ?? null;

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

  // Fetch danh sách tài khoản ngân hàng nhà trường khi mount (cho cả guest và authenticated donor)
  useEffect(() => {
    let isMounted = true;

    const fetchSchoolBankAccounts = async () => {
      try {
        const response = await bankAccountService.getSchoolBankAccounts();
        if (isMounted && response.success) {
          setSchoolBankAccounts(response.data || []);
          // Auto-select first account if available
          if (response.data && response.data.length > 0 && !selectedBankAccountId) {
            setSelectedBankAccountId(response.data[0].taiKhoanId);
          }
        }
      } catch (error) {
        console.error('Error fetching school bank accounts:', error);
        toast.error('Không thể tải danh sách tài khoản ngân hàng');
      }
    };

    // Only fetch if user is donor (authenticated or guest)
    if (isDonor) {
      fetchSchoolBankAccounts();
      // Generate transaction ID once for this session
      if (!transactionId) {
        setTransactionId('TXN' + Math.floor(10000000 + Math.random() * 90000000));
      }
    }

    return () => {
      isMounted = false;
    };
  }, [isDonor, selectedBankAccountId, transactionId]);

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

  const handleBankAccountSelect = useCallback((bankAccountId) => {
    setSelectedBankAccountId(bankAccountId);
  }, []);

  const handleFilesChange = useCallback((files) => {
    setUploadedFiles(files);
  }, []);

  const handleGuestDonorFieldsChange = useCallback((fields) => {
    guestDonorFieldsRef.current = {
      ...guestDonorFieldsRef.current,
      ...fields,
    };
  }, []);

  const handleGuestDonorValidityChange = useCallback((isValid) => {
    setGuestDonorInfoValid((prev) => (prev === isValid ? prev : isValid));
  }, []);



  // Trạng thái hợp lệ của từng bước riêng lẻ
  const isStep1Valid = useMemo(() => {
    if (isDonor) {
      return (
        !!selectedFund && 
        !!donationAmount && 
        parseFloat(donationAmount) >= 10000 &&
        !!selectedBankAccountId // Phải chọn tài khoản ngân hàng
      );
    }
    return !!selectedFund;
  }, [isDonor, selectedFund, donationAmount, selectedBankAccountId]);

  const isStep2Valid = useMemo(() => {
    if (isDonor) {
      return hasUploadedProof;
    }
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

    // Validate tongkinhphidudan khi chọn "Tai tro co thu hoi"
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
  }, [isDonor, hasUploadedProof, contentValues, isAuthenticated, selectedFund]);

  const isStep3Valid = useMemo(() => {
    if (isDonor) {
      return guestDonorInfoValid;
    }
    return isAuthenticated
      ? !!(bankValues.selectedBankId && bankValues.soDienThoai?.length > 0)
      : isGuestStudentInfoValid(guestFields);
  }, [isDonor, guestDonorInfoValid, isAuthenticated, bankValues, guestFields]);

  const isStep4Valid = useMemo(() => {
    return hasUploadedProof;
  }, [hasUploadedProof]);

  // Xác định bước cuối cùng của biểu mẫu hiện tại
  const lastStepIndex = useMemo(() => {
    if (isDonor) {
      return isAuthenticated ? 2 : 3;
    }
    return 4;
  }, [isDonor, isAuthenticated]);

  // Tính toán tính hợp lệ của toàn bộ form dựa trên các bước
  const isFormValid = useMemo(() => {
    if (isAuthenticated) {
      if (isDonor) {
        return isStep1Valid && isStep2Valid;
      }
      return isStep1Valid && isStep2Valid && isStep3Valid && isStep4Valid;
    }
    if (isDonor) {
      return isStep1Valid && isStep2Valid && isStep3Valid && captchaVerified;
    }
    return isStep1Valid && isStep2Valid && isStep3Valid && isStep4Valid && captchaVerified;
  }, [isAuthenticated, isDonor, isStep1Valid, isStep2Valid, isStep3Valid, isStep4Valid, captchaVerified]);

  const handleReset = () => {
    // Reset tất cả state về giá trị ban đầu
    setSelectedFund(null);
    setPaymentMethod('Khac');
    setGuestFields(INITIAL_GUEST_FIELDS);
    guestDonorFieldsRef.current = INITIAL_GUEST_FIELDS;
    setGuestDonorInfoValid(false);
    setGuestDonorResetKey((prev) => prev + 1);
    setDonationAmount('');
    setContentValues({ 
      tieu_de: '', 
      mo_ta: '',
      so_tien_yeu_cau: ''
    });
    setBankValues({ selectedBankId: null, soDienThoai: '' });
    setUploadedFiles([]);
    setActiveStep(1);
    
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
    const requiresFileUpload = !isDonor || (isDonor && paymentMethod === 'Khac');
    if (requiresFileUpload && (!uploadedFiles || uploadedFiles.length === 0)) {
      toast.error('Vui lòng đính kèm file minh chứng');
      return;
    }

    try {
      setIsSubmitting(true);

      let fileUrl = '';
      if (requiresFileUpload && uploadedFiles?.length > 0) {
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

      // BƯỚC 2: Tạo đơn yêu cầu hỗ trợ hoặc khoản tài trợ
      let response;
      
      if (isAuthenticated) {
        // LUỒNG ĐÃ ĐĂNG NHẬP
        let applicationData;
        if (isDonor) {
          const txnId = onlineTxnId || 'VNPAY' + Math.floor(10000000 + Math.random() * 90000000);
          
          // Lấy thông tin bank account được chọn
          const selectedBankAccount = schoolBankAccounts.find(
            acc => acc.taiKhoanId === selectedBankAccountId
          );
          
          applicationData = {
            quy_id: selectedFund.quyId,
            so_tien: parseFloat(donationAmount),
            hinh_anh_minh_chung: fileUrl,
            hinh_thuc: paymentMethod,
            ma_giao_dich: txnId,
            ghi_chu: `Quyên góp trực tuyến từ ${user.ho_ten || user.email || 'Nhà tài trợ'}`,
            // Thêm thông tin tài khoản ngân hàng được chọn
            tai_khoan_ngan_hang_id: selectedBankAccountId,
            thong_tin_tai_khoan: selectedBankAccount ? {
              soTaiKhoan: selectedBankAccount.soTaiKhoan,
              nganHang: selectedBankAccount.tenNganHang,
              chiNhanh: selectedBankAccount.chiNhanh,
              chuTaiKhoan: selectedBankAccount.chuTaiKhoan
            } : null
          };
          
          if (!donationAmount || parseFloat(donationAmount) < 10000) {
            toast.error('Vui lòng nhập số tiền quyên góp hợp lệ (tối thiểu 10,000đ)');
            return;
          }
          
          if (!selectedBankAccountId) {
            toast.error('Vui lòng chọn tài khoản ngân hàng');
            return;
          }
          
          response = await api.post('/donations/authenticated', applicationData);
        } else {
          const soTienNum = parseFloat(contentValues.so_tien_yeu_cau);
          if (!contentValues.so_tien_yeu_cau || isNaN(soTienNum) || soTienNum <= 0) {
            toast.error('Vui lòng nhập số tiền yêu cầu hợp lệ');
            return;
          }
          
          applicationData = {
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
          };
          response = await applicationService.create(applicationData);
        }

        const responseData = response?.data || response;
        const isSuccess = response?.success === true || 
                          response?.success === 'true' || 
                          response?.data?.success === true || 
                          response?.data?.success === 'true';

        if (isSuccess) {
          const successMessage = isDonor 
            ? 'Quyên góp thành công! Cảm ơn bạn đã đồng hành cùng TVU Fund.'
            : 'Nộp đơn thành công! Đơn của bạn đang chờ xét duyệt.';
          toast.success(successMessage);
          
          setContentValues({ 
            tieu_de: '', mo_ta: '', so_tien_yeu_cau: '',
            loai_hotro: LOAI_HO_TRO.TAI_TRO_KHONG_HOAN_LAI,
            tong_kinh_phi_du_an: null,
            la_de_tai: false,
          });
          setDonationAmount('');
          setUploadedFiles([]);
          setIsOnlinePaymentCompleted(false);
          setOnlineTxnId('');
          setTimeout(() => navigate('/profile'), 1500);
        } else {
          toast.error(responseData?.message || 'Thao tác thất bại');
        }
      } else {
        // LUỒNG KHÁCH VÃNG LAI (GUEST)
        if (isDonor) {
          const txnId = onlineTxnId || 'VNPAY' + Math.floor(10000000 + Math.random() * 90000000);
          const currentGuestFields = guestDonorFieldsRef.current;
          
          // Lấy thông tin bank account được chọn
          const selectedBankAccount = schoolBankAccounts.find(
            acc => acc.taiKhoanId === selectedBankAccountId
          );
          
          const payload = {
            guestHoTen: currentGuestFields.guestHoTen,
            guestEmail: currentGuestFields.guestEmail,
            guestSoDienThoai: currentGuestFields.guestSoDienThoai,
            guestToChuc: currentGuestFields.guestToChuc,
            guestDiaChi: currentGuestFields.guestDiaChi,
            quyId: selectedFund.quyId,
            soTien: parseFloat(donationAmount),
            hinhThuc: paymentMethod,
            maGiaoDich: txnId,
            chungTu: fileUrl,
            ghiChu: currentGuestFields.ghiChu || 'Quyên góp trực tuyến vãng lai',
            formTimestamp,
            // Thêm thông tin tài khoản ngân hàng được chọn
            taiKhoanNganHangId: selectedBankAccountId,
            thongTinTaiKhoan: selectedBankAccount ? {
              soTaiKhoan: selectedBankAccount.soTaiKhoan,
              nganHang: selectedBankAccount.tenNganHang,
              chiNhanh: selectedBankAccount.chiNhanh,
              chuTaiKhoan: selectedBankAccount.chuTaiKhoan
            } : null
          };
          
          if (!selectedBankAccountId) {
            toast.error('Vui lòng chọn tài khoản ngân hàng');
            return;
          }
          
          response = await guestService.submitDonation(payload);
        } else {
          const payload = {
            guestHoTen: guestFields.guestHoTen,
            guestEmail: guestFields.guestEmail,
            guestSoDienThoai: guestFields.guestSoDienThoai,
            guestMssv: guestFields.guestMssv,
            guestKhoa: guestFields.guestKhoa,
            guestLop: guestFields.guestLop,
            guestSoTaiKhoan: guestFields.guestSoTaiKhoan,
            guestNganHang: guestFields.guestNganHang,
            guestChuTaiKhoan: guestFields.guestChuTaiKhoan,
            quyId: selectedFund.quyId,
            lyDo: `[${contentValues.tieu_de}] - ${contentValues.mo_ta}`,
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
        }

        if (response.success) {
          toast.info('Vui lòng kiểm tra email để nhận mã xác thực OTP');
          setSubmittedGuestInfo({
            email: response.data.email,
            trackingUuid: response.data.trackingUuid,
            otpToken: response.data.otpToken,
            type: isDonor ? 'donation' : 'application'
          });
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
                      setGuestRole(null);
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

  // ─── PHÂN NHÁNH GIAO DIỆN 3: CHƯA ĐÃ XÁC ĐỊNH VAI TRÒ (CHƯA CHỌN VAI TRÒ HOẶC LÀ ADMIN/CÁN BỘ CHƯA CHỌN)
  const isStrictUser = isAuthenticated && (isStudent || isDonorUser);
  if (!isStrictUser && !guestRole) {
    return (
      <div className={styles.applyPage}>
        <PublicHeader onLoginClick={openLoginModal} onRegisterClick={openRegisterModal} />
        <BackgroundImage overlayType="dark">
          <main className={styles.mainContent}>
            <div className={styles.roleSelectionWrapper}>
              <Title level={2} className={styles.roleTitle}>Chọn Vai Trò Nộp Đơn</Title>
              <Paragraph className={styles.roleSubtitle}>
                Hệ thống TVU Fund hỗ trợ nộp đơn công khai không cần tài khoản. Vui lòng chọn hành động của bạn:
              </Paragraph>
              <div className={styles.roleCards}>
                <Card 
                  hoverable 
                  className={styles.roleCard}
                  onClick={() => setGuestRole('student')}
                >
                  <Title level={4}>Tôi là Người nộp đơn</Title>
                  <Paragraph>Cần hỗ trợ tài chính, học bổng, vay vốn hoặc các chương trình tài trợ từ quỹ.</Paragraph>
                </Card>
                <Card 
                  hoverable 
                  className={styles.roleCard}
                  onClick={() => setGuestRole('donor')}
                >
                  <Title level={4}>Tôi là Nhà tài trợ</Title>
                  <Paragraph>Quyên góp, đầu tư tài chính để ủng hộ các quỹ phát triển giáo dục và cộng đồng.</Paragraph>
                </Card>
              </div>
              <div style={{ marginTop: 30 }}>
                <Text style={{ color: '#8b949e' }}>Bạn đã có tài khoản thành viên? </Text>
                <Button type="link" onClick={openLoginModal} style={{ padding: 0 }}>Đăng nhập</Button>
              </div>
            </div>
          </main>
        </BackgroundImage>
        <PublicFooter />
        
        {/* Render Modals */}
        {isLoginModalOpen && (
          <div className="login-modal-overlay" onClick={closeLoginModal}>
            <div className="login-modal-content" onClick={(e) => e.stopPropagation()}>
              <LoginForm onSuccess={closeLoginModal} onClose={closeLoginModal} onSwitchToRegister={switchToRegister} />
            </div>
          </div>
        )}
        {isRegisterModalOpen && (
          <div className="register-modal-overlay" onClick={closeRegisterModal}>
            <div className="register-modal-content" onClick={(e) => e.stopPropagation()}>
              <RegisterForm onSuccess={closeRegisterModal} onClose={closeRegisterModal} onSwitchToLogin={switchToLogin} />
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── PHÂN NHÁNH GIAO DIỆN 4: HIỂN THỊ FORM CHÍNH (Đã đăng nhập hoặc đã chọn vai trò)
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
              {isDonor ? 'Tạo khoản quyên góp' : 'Tạo hồ sơ đề nghị'}
            </span>
          </nav>

          <div className={styles.titleSection}>
            <FundTitleSection
              title={isDonor ? "Tạo khoản quyên góp" : "Tạo hồ sơ đề nghị"}
              highlight={isDonor ? (paymentMethod === 'Khac' ? "Quyên Góp Mới" : "Thông Tin Quyên Góp") : "Xin Hỗ Trợ Mới"}
              subtitle={
                isDonor
                  ? (paymentMethod === 'Chuyen khoan'
                      ? "Vui lòng chuyển khoản đóng góp theo thông tin tài khoản ngân hàng của Quỹ dưới đây."
                      : paymentMethod === 'Tien mat'
                        ? "Vui lòng xem thông tin văn phòng Quỹ dưới đây để nộp tiền mặt trực tiếp."
                        : "Cảm ơn bạn đã đồng hành cùng TVU Fund. Vui lòng điền thông tin quyên góp.")
                  : "Vui lòng điền đầy đủ thông tin để hệ thống và AI hỗ trợ xét duyệt nhanh nhất."
              }
              variant="transparent"
            />
          </div>



          <div className={styles.formSection}>
            <AppliSectionLayout
              leftContent={
                <>
                  {/* THANH TAB PHƯƠNG THỨC ĐÓNG GÓP - ĐƯA LÊN ĐẦU DƯỚI STEPPER */}
                  {isDonor && (
                    <div className={styles.guestFormCard}>
                      <h3 className={styles.sectionTitleText}>Phương thức đóng góp</h3>
                      <div className={styles.paymentTabs}>
                        <button
                          type="button"
                          className={`${styles.paymentTab} ${paymentMethod === 'Chuyen khoan' ? styles.paymentTabActive : ''}`}
                          onClick={() => handlePaymentMethodChange('Chuyen khoan')}
                        >
                          <HiOutlineBuildingLibrary className={styles.paymentTabIcon} />
                          <span>Qua ngân hàng</span>
                        </button>
                        <button
                          type="button"
                          className={`${styles.paymentTab} ${paymentMethod === 'Khac' ? styles.paymentTabActive : ''}`}
                          onClick={() => handlePaymentMethodChange('Khac')}
                        >
                          <HiOutlineCreditCard className={styles.paymentTabIcon} />
                          <span>Trực tuyến</span>
                        </button>
                        <button
                          type="button"
                          className={`${styles.paymentTab} ${paymentMethod === 'Tien mat' ? styles.paymentTabActive : ''}`}
                          onClick={() => handlePaymentMethodChange('Tien mat')}
                        >
                          <HiOutlineBanknotes className={styles.paymentTabIcon} />
                          <span>Bằng tiền mặt</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* BƯỚC 1: Chọn Quỹ và Số tiền */}
                  {(!isDonor || paymentMethod === 'Khac') && (
                    <div className={`${styles.stepSectionWrapper} ${activeStep < 1 ? styles.disabledSection : ''}`}>
                      <FundSelectSection
                        onFundSelect={handleFundSelect}
                        selectedFund={selectedFund}
                        isDonor={isDonor}
                        nextButton={
                          !isDonor && activeStep === 1 ? (
                            <div className={styles.nextButtonRow}>
                              <Button
                                type="primary"
                                onClick={() => setActiveStep(2)}
                                disabled={!isStep1Valid}
                                className={styles.nextStepBtn}
                              >
                                Tiếp theo
                              </Button>
                            </div>
                          ) : null
                        }
                      />
                      {isDonor && (
                        <DonationAmountSection
                          selectedFund={selectedFund}
                          donationAmount={donationAmount}
                          onAmountChange={setDonationAmount}
                          schoolBankAccounts={schoolBankAccounts}
                          selectedBankAccountId={selectedBankAccountId}
                          onBankAccountSelect={handleBankAccountSelect}
                          nextButton={
                            activeStep === 1 ? (
                              <div className={styles.nextButtonRow}>
                                <Button
                                  type="primary"
                                  onClick={() => setActiveStep(2)}
                                  disabled={!isStep1Valid}
                                  className={styles.nextStepBtn}
                                >
                                  Tiếp theo
                                </Button>
                              </div>
                            ) : null
                          }
                        />
                      )}
                    </div>
                  )}

                  {/* CHI TIẾT TỪNG PHƯƠNG THỨC ĐÓNG GÓP */}
                  {isDonor && (
                    <div className={styles.guestFormCard}>
                      <div className={styles.paymentMethodDetails}>
                        {paymentMethod === 'Chuyen khoan' && (
                          <div className={styles.bankTransferWrapper}>
                            <div className={styles.alertInfo}>
                              <p><strong>Hướng dẫn chuyển khoản:</strong> Quý nhà tài trợ vui lòng chuyển khoản theo thông tin tài khoản của Quỹ dưới đây. Sau khi nhận được tiền chuyển khoản, cán bộ quản lý quỹ sẽ kiểm tra và xác nhận đóng góp của quý vị trên hệ thống.</p>
                            </div>
                            
                            {hasDefaultSponsorBank ? (
                              <div className={styles.alertWarning}>
                                <p>Quý vị vui lòng chuyển khoản tới tài khoản chính của nhà trường:</p>
                                <div className={styles.bankAccountCard} style={{ marginTop: 15 }}>
                                  <div className={styles.bankCardHeader}>
                                    <HiOutlineBuildingLibrary className={styles.bankIcon} />
                                    <h4>{defaultSponsorBank.nganHang}</h4>
                                  </div>
                                  <div className={styles.bankCardBody}>
                                    <p><strong>Chủ tài khoản:</strong> {defaultSponsorBank.chuTaiKhoan}</p>
                                    <p className={styles.accountNumberRow}>
                                      <strong>Số tài khoản:</strong> 
                                      <span className={styles.accountNumber}>{defaultSponsorBank.soTaiKhoan}</span>
                                      <button
                                        type="button"
                                        className={styles.copyBtn}
                                        onClick={() => {
                                          navigator.clipboard.writeText(defaultSponsorBank.soTaiKhoan);
                                          setCopiedIndex('default');
                                          setTimeout(() => setCopiedIndex(null), 2000);
                                        }}
                                      >
                                        {copiedIndex === 'default' ? 'Đã chép' : 'Sao chép'}
                                      </button>
                                    </p>
                                    {defaultSponsorBank.chiNhanh && <p><strong>Chi nhánh:</strong> {defaultSponsorBank.chiNhanh}</p>}
                                    <p><strong>Nội dung chuyển khoản:</strong> (tên nhà tài trợ) (số điện thoại) (email) (mã giao dịch chuyển khoản)</p>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className={styles.alertWarning}>
                                <p>Quỹ chưa cấu hình tài khoản nhận chuyển khoản. Vui lòng liên hệ {contactEmail} hoặc {publicSettings.so_dien_thoai} để được hỗ trợ.</p>
                              </div>
                            )}
                          </div>
                        )}

                        {paymentMethod === 'Khac' && (
                          <div className={styles.onlinePaymentWrapper}>
                            <div className={styles.alertInfo}>
                              <p><strong>Thanh toán trực tuyến:</strong> Hỗ trợ quyên góp nhanh qua ATM nội địa, Thẻ quốc tế (Visa/Master) hoặc quét mã QR ứng dụng ngân hàng thông qua cổng thanh toán VNPay.</p>
                            </div>
                            <div className={styles.onlinePaymentDetails}>
                              <p style={{ color: '#334155', marginBottom: 10 }}>
                                Số tiền sẽ quyên góp trực tuyến: <strong style={{ color: '#1a2f5e', fontSize: 18 }}>{formatCurrency(donationAmount)}</strong>
                              </p>
                              <p style={{ fontSize: 13, color: '#4b5563', lineHeight: '1.6' }}>
                                Quý nhà tài trợ vui lòng hoàn tất thông tin liên hệ và bấm nút <strong>"Gửi đơn"</strong> ở chân trang để tiến hành đóng góp.
                              </p>
                            </div>
                          </div>
                        )}

                        {paymentMethod === 'Tien mat' && (
                          <div className={styles.cashPaymentWrapper}>
                            <div className={styles.alertInfo}>
                              <p><strong>Quyên góp tiền mặt trực tiếp:</strong> Cán bộ quản lý quỹ sẽ tiếp nhận đóng góp bằng tiền mặt trực tiếp của quý nhà tài trợ tại văn phòng hoặc tại địa điểm phù hợp.</p>
                            </div>
                            <div className={styles.cashInstructions}>
                              <h4>Địa điểm tiếp nhận nộp tiền mặt trực tiếp:</h4>
                              <ul style={{ paddingLeft: 20, margin: '8px 0', color: '#334155' }}>
                                <li><strong>Địa chỉ:</strong> {publicSettings.dia_chi_lien_he}</li>
                                <li><strong>Thời gian làm việc:</strong> {publicSettings.gio_lam_viec}</li>
                                <li><strong>Hotline ban quản lý Quỹ:</strong> {publicSettings.so_dien_thoai}</li>
                                <li><strong>Email hỗ trợ:</strong> {contactEmail}</li>
                              </ul>
                              <p style={{ color: '#ef4444', fontSize: 12, marginTop: 10 }}>
                                * Lưu ý: Cán bộ Quỹ sẽ lập biên lai thu tiền mặt và duyệt khoản tài trợ của bạn ngay sau khi nhận tiền.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {isDonor && paymentMethod === 'Khac' && (
                    <div className={`${styles.stepSectionWrapper} ${(activeStep < 2 || !isStep1Valid) ? styles.disabledSection : ''}`}>
                      <DocumentSection
                        files={uploadedFiles}
                        onFilesChange={handleFilesChange}
                        isDonor
                        nextButton={
                          activeStep === 2 && !isAuthenticated ? (
                            <div className={styles.nextButtonRow}>
                              <Button
                                type="primary"
                                onClick={() => setActiveStep(3)}
                                disabled={!isStep2Valid}
                                className={styles.nextStepBtn}
                              >
                                Tiếp theo
                              </Button>
                            </div>
                          ) : null
                        }
                      />
                    </div>
                  )}

                  {/* THÔNG TIN LIÊN HỆ CỦA NHÀ TÀI TRỢ (Chỉ hiển thị khi thanh toán trực tuyến và là khách vãng lai) */}
                  {isDonor && paymentMethod === 'Khac' && !isAuthenticated && (
                    <div className={`${styles.stepSectionWrapper} ${(activeStep < 3 || !isStep1Valid || !isStep2Valid) ? styles.disabledSection : ''}`}>
                      <GuestDonorInfoSection
                        initialValues={guestDonorFieldsRef.current}
                        onFieldsChange={handleGuestDonorFieldsChange}
                        onValidityChange={handleGuestDonorValidityChange}
                        resetKey={guestDonorResetKey}
                      />
                    </div>
                  )}

                  {/* BƯỚC 2: Nội dung yêu cầu hỗ trợ (chỉ cho sinh viên) */}
                  {!isDonor && (
                    <div className={`${styles.stepSectionWrapper} ${(activeStep < 2 || !isStep1Valid) ? styles.disabledSection : ''}`}>
                      <RequestContentSection
                        onChange={handleContentChange}
                        values={contentValues}
                        selectedFund={selectedFund}
                        onOpenAI={handleOpenAI}
                        isGuest={!isAuthenticated}
                        nextButton={
                          activeStep === 2 ? (
                            <div className={styles.nextButtonRow}>
                              <Button
                                type="primary"
                                onClick={() => setActiveStep(3)}
                                disabled={!isStep2Valid}
                                className={styles.nextStepBtn}
                              >
                                Tiếp theo
                              </Button>
                            </div>
                          ) : null
                        }
                      />
                    </div>
                  )}

                  {/* BƯỚC 3: Thông tin nhận giải ngân / Thông tin cá nhân sinh viên */}
                  {!isDonor && (
                    <div className={`${styles.stepSectionWrapper} ${(activeStep < 3 || !isStep1Valid || !isStep2Valid) ? styles.disabledSection : ''}`}>
                      {isAuthenticated ? (
                        <BankInfoSection
                          bankAccounts={bankAccounts}
                          defaultPhone={null}
                          onChange={handleBankChange}
                          values={bankValues}
                          loading={bankLoading}
                          nextButton={
                            activeStep === 3 ? (
                              <div className={styles.nextButtonRow}>
                                <Button
                                  type="primary"
                                  onClick={() => setActiveStep(4)}
                                  disabled={!isStep3Valid}
                                  className={styles.nextStepBtn}
                                >
                                  Tiếp theo
                                </Button>
                              </div>
                            ) : null
                          }
                        />
                      ) : (
                        <div className={styles.guestFormCard}>
                          <h3>Thông tin cá nhân & Ngân hàng</h3>
                          <div className={styles.guestFormRowThree}>
                            <div className={styles.inputGroup}>
                              <Input 
                                type="text" 
                                label="Họ và tên"
                                placeholder="Nhập họ và tên..."
                                value={guestFields.guestHoTen}
                                onChange={(e) => handleInputChange('guestHoTen', e.target.value)}
                                required
                              />
                            </div>
                            <div className={styles.inputGroup}>
                              <Input 
                                type="email" 
                                label="Email liên lạc"
                                placeholder="Nhập email..."
                                value={guestFields.guestEmail}
                                onChange={(e) => handleInputChange('guestEmail', e.target.value)}
                                required
                              />
                            </div>
                            <div className={styles.inputGroup}>
                              <Input 
                                type="tel" 
                                label="Số điện thoại"
                                placeholder="Nhập SĐT..."
                                value={guestFields.guestSoDienThoai}
                                onChange={(e) => handleInputChange('guestSoDienThoai', e.target.value)}
                                required
                              />
                            </div>
                          </div>
                          <div className={styles.guestFormRowThree}>
                            <div className={styles.inputGroup}>
                              <Input 
                                type="text" 
                                label="Mã số định danh (MSSV/MSNV)"
                                placeholder="Nhập MSSV hoặc MSNV..."
                                value={guestFields.guestMssv}
                                onChange={(e) => handleInputChange('guestMssv', e.target.value)}
                                required
                              />
                            </div>
                            <div className={styles.inputGroup}>
                              <Input 
                                type="text" 
                                label="Khoa / Phòng ban"
                                placeholder="Ví dụ: Công nghệ thông tin..."
                                value={guestFields.guestKhoa}
                                onChange={(e) => handleInputChange('guestKhoa', e.target.value)}
                                required
                              />
                            </div>
                            <div className={styles.inputGroup}>
                              <Input 
                                type="text" 
                                label="Lớp / Đơn vị"
                                placeholder="Ví dụ: DA20TTB..."
                                value={guestFields.guestLop}
                                onChange={(e) => handleInputChange('guestLop', e.target.value)}
                                required
                              />
                            </div>
                          </div>
                          <hr className={styles.divider} />
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
                          {activeStep === 3 && (
                            <div className={styles.nextButtonRow}>
                              <Button
                                type="primary"
                                onClick={() => setActiveStep(4)}
                                disabled={!isStep3Valid}
                                className={styles.nextStepBtn}
                              >
                                Tiếp theo
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* BƯỚC 4: Tài liệu đính kèm minh chứng (Chỉ dành cho sinh viên đề nghị hỗ trợ) */}
                  {!isDonor && (
                    <div className={`${styles.stepSectionWrapper} ${(activeStep < 4 || !isStep1Valid || !isStep2Valid || !isStep3Valid) ? styles.disabledSection : ''}`}>
                      <DocumentSection
                        files={uploadedFiles}
                        onFilesChange={handleFilesChange}
                        isDonor={isDonor}
                      />
                    </div>
                  )}

                  {/* Xác thực bảo mật Robot cho khách vãng lai (Chỉ hiển thị khi làm trực tuyến) */}
                  {!isAuthenticated && (!isDonor || paymentMethod === 'Khac') && (
                    <div className={`${styles.stepSectionWrapper} ${(activeStep < lastStepIndex || !isStep1Valid || !isStep2Valid || (lastStepIndex === 4 && !isStep3Valid)) ? styles.disabledSection : ''}`}>
                      <div className={styles.guestFormCard}>
                        <h3>Xác minh bảo mật chống spam</h3>
                        <label className={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={captchaVerified}
                            onChange={(e) => setCaptchaVerified(e.target.checked)}
                            className={styles.checkboxInput}
                          />
                          <span>Tôi xác nhận thông tin cung cấp là chính xác và đồng ý gửi đơn xét duyệt.</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Nút bấm Lưu nháp / Gửi đơn / Reset (Chỉ hiển thị khi làm trực tuyến và đạt bước cuối) */}
                  {(!isDonor || paymentMethod === 'Khac') && activeStep >= lastStepIndex && (
                    <ApplicationFooter
                      onSaveDraft={null}
                      onSubmit={handleSubmit}
                      onReset={handleReset}
                      isSubmitting={isSubmitting}
                      isSaving={false}
                      isFormValid={isFormValid}
                      isDonor={isDonor}
                    />
                  )}
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
