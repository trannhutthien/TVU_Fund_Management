import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Typography, Card, Result, Button } from 'antd';
import { ClockCircleOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import PublicHeader from '@components/layout/PublicHeader/PublicHeader';
import PublicFooter from '@components/layout/PublicFooter/PublicFooter';
import BackgroundImage from '@components/common/BackgroundImage';
import LoginForm from '@components/forms/LoginForm';
import RegisterForm from '@components/forms/RegisterForm';
import FundTitleSection from '@components/sections/FundsPage/FundTitleSection/FundTitleSection';
import FormStepper from '@components/sections/AppliPage/AppliSectionLayout/AppliSectionForm/FormStepper/FormStepper';
import FundSelectSection from '@components/sections/AppliPage/AppliSectionLayout/AppliSectionForm/FundSelectSection/FundSelectSection';
import RequestContentSection from '@components/sections/AppliPage/AppliSectionLayout/AppliSectionForm/RequestContentSection/RequestContentSection';
import BankInfoSection from '@components/sections/AppliPage/AppliSectionLayout/AppliSectionForm/BankInfoSection/BankInfoSection';
import DonationAmountSection from '@components/sections/AppliPage/AppliSectionLayout/AppliSectionForm/DonationAmountSection/DonationAmountSection';
import DocumentSection from '@components/sections/AppliPage/AppliSectionLayout/AppliSectionForm/DocumentSection/DocumentSection';
import ApplicationFooter from '@components/sections/AppliPage/AppliSectionLayout/AppliSectionForm/ApplicationFooter/ApplicationFooter';
import AppliSidebar from '@components/sections/AppliPage/AppliSectionLayout/AppliSidebar/AppliSidebar';
import AppliSectionLayout from '@components/sections/AppliPage/AppliSectionLayout/AppliSectionLayout';
import useAuthStore from '@stores/authStore';
import { bankAccountService } from '@services/bankAccountService';
import { applicationService } from '@services/applicationService';
import { uploadService } from '@services/uploadService';
import { guestService } from '@services/guestService';
import api from '@services/api';
import Input from '@components/common/Input/Input';
import { 
  HiOutlineCreditCard, 
  HiOutlineBuildingLibrary, 
  HiOutlineBanknotes, 
  HiOutlineClipboardDocumentCheck,
  HiOutlineCheck,
  HiOutlineQrCode,
  HiOutlineArrowPath
} from 'react-icons/hi2';
import styles from './ApplyPage.module.scss';

const { Title, Paragraph, Text } = Typography;

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
  const [paymentMethod, setPaymentMethod] = useState('Chuyen khoan'); // 'Chuyen khoan' | 'Khac' | 'Tien mat'
  const [fundBankAccounts, setFundBankAccounts] = useState([]);
  const [fundBankLoading, setFundBankLoading] = useState(false);
  const [isOnlinePaymentCompleted, setIsOnlinePaymentCompleted] = useState(false);
  const [onlineTxnId, setOnlineTxnId] = useState('');
  const [isOnlineModalOpen, setIsOnlineModalOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  
  // Trạng thái cho modal giả lập thanh toán online
  const [onlinePayState, setOnlinePayState] = useState('idle'); // 'idle' | 'processing' | 'success'
  const [selectedOnlineCard, setSelectedOnlineCard] = useState('vnpay'); // 'vnpay' | 'atm' | 'visa'

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
  const [guestFields, setGuestFields] = useState({
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
    hinhThuc: 'Chuyen khoan',
    maGiaoDich: '',
    ghiChu: '',
  });
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [submittedGuestInfo, setSubmittedGuestInfo] = useState(null); // { email, trackingUuid, type }
  const [guestOtpCode, setGuestOtpCode] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null); // { email, tempPassword, trackingUuid }

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    setGuestFields(prev => ({ ...prev, hinhThuc: method }));
    
    // Reset online payment state if switching tabs
    if (method !== 'Khac') {
      setIsOnlinePaymentCompleted(false);
      setOnlineTxnId('');
    }
  };

  // Xác định vai trò: Nhà tài trợ hoặc Sinh viên
  const userType = user?.loai_tai_khoan || user?.loaiTaiKhoan || user?.loai_nguoi_dung;
  const isDonor = isAuthenticated ? (userType === 'NHA_TAI_TRO') : (guestRole === 'donor');
  
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedFund, setSelectedFund] = useState(null);
  const [donationAmount, setDonationAmount] = useState(''); // Số tiền quyên góp cho Nhà tài trợ
  const [contentValues, setContentValues] = useState({ 
    tieu_de: '', 
    mo_ta: '',
    so_tien_yeu_cau: ''
  });
  const [bankValues, setBankValues] = useState({ selectedBankId: null, soDienThoai: '' });
  const [bankAccounts, setBankAccounts] = useState([]);
  const [bankLoading, setBankLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

    setSelectedFund((prev) => {
      if (prev?.quyId === fundId) return prev;
      return { quyId: fundId };
    });
  }, [location.search, location.state]);

  const handleFundSelect = (fund) => {
    setSelectedFund(fund);
  };

  const handleContentChange = (valuesOrUpdater) => {
    if (typeof valuesOrUpdater === 'function') {
      setContentValues(valuesOrUpdater);
    } else {
      setContentValues(valuesOrUpdater);
    }
  };

  const handleBankChange = (values) => {
    setBankValues(values);
  };

  const handleOpenAI = () => {
    // AI panel luôn hiển thị ở sidebar, không cần mở riêng
  };

  const handleApplyAISuggestion = (newText) => {
    setContentValues((prev) => ({ ...prev, mo_ta: newText }));
  };

  const handleFilesChange = (files) => {
    setUploadedFiles(files);
  };

  // Tính toán validation status cho từng bước
  const validationStatus = isAuthenticated
    ? (isDonor
        ? {
            // Nhà tài trợ đăng nhập chỉ cần: Chọn quỹ + Nhập số tiền >= 10,000đ
            step1: !!selectedFund && !!donationAmount && parseFloat(donationAmount) >= 10000,
            step2: true, 
            step3: false,
            step4: false,
          }
        : {
            // Sinh viên đăng nhập cần đủ 4 bước
            step1: !!selectedFund,
            step2: !!(
              contentValues.tieu_de?.length >= 10 &&
              contentValues.mo_ta?.length >= 50 &&
              contentValues.so_tien_yeu_cau &&
              parseFloat(contentValues.so_tien_yeu_cau) >= (selectedFund?.soTienToiThieu || 0) &&
              parseFloat(contentValues.so_tien_yeu_cau) <= (selectedFund?.soTienToiDa || Infinity)
            ),
            step3: !!(
              bankValues.selectedBankId &&
              bankValues.soDienThoai?.length > 0
            ),
            step4: !!(uploadedFiles?.length > 0),
          })
    : (isDonor
        ? {
            // Nhà tài trợ vãng lai cần: Chọn quỹ + Nhập số tiền >= 10,000đ + Điền thông tin cá nhân
            step1: !!selectedFund && !!donationAmount && parseFloat(donationAmount) >= 10000 && 
                   !!(guestFields.guestHoTen?.trim() && guestFields.guestEmail?.trim() && guestFields.guestSoDienThoai?.trim()),
            step2: captchaVerified, // Chỉ cần check captcha ở bước này
            step3: false,
            step4: false,
          }
        : {
            // Sinh viên vãng lai
            step1: !!selectedFund,
            step2: !!(
              contentValues.tieu_de?.length >= 10 &&
              contentValues.mo_ta?.length >= 50 &&
              contentValues.so_tien_yeu_cau &&
              parseFloat(contentValues.so_tien_yeu_cau) > 0
            ),
            step3: !!(
              guestFields.guestHoTen?.trim() &&
              guestFields.guestEmail?.trim() &&
              guestFields.guestSoDienThoai?.trim() &&
              guestFields.guestMssv?.trim() &&
              guestFields.guestKhoa?.trim() &&
              guestFields.guestLop?.trim() &&
              guestFields.guestSoTaiKhoan?.trim() &&
              guestFields.guestNganHang?.trim() &&
              guestFields.guestChuTaiKhoan?.trim()
            ),
            step4: !!(uploadedFiles?.length > 0) && captchaVerified,
          });

  const isFormValid = isDonor
    ? validationStatus.step1 && validationStatus.step2
    : validationStatus.step1 && 
      validationStatus.step2 && 
      validationStatus.step3 && 
      validationStatus.step4;

  const handleReset = () => {
    // Reset tất cả state về giá trị ban đầu
    setSelectedFund(null);
    setDonationAmount('');
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
    setIsSaving(true);
    // TODO: gọi API lưu nháp
    setTimeout(() => setIsSaving(false), 1500);
  };

  const handleSubmit = async () => {
    // Validate lại một lần nữa
    if (!isFormValid) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    // Kiểm tra file đính kèm
    const requiresFileUpload = !isDonor;
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
        console.log('=== FILE UPLOAD DEBUG ===');
        console.log('File to upload:', fileToUpload);
        console.log('File name:', fileToUpload?.name);
        
        // Khách vãng lai dùng uploadFilePublic, user đăng nhập dùng uploadFile
        const uploadResponse = isAuthenticated
          ? await uploadService.uploadFile(fileToUpload)
          : await uploadService.uploadFilePublic(fileToUpload);
          
        console.log('Upload response:', uploadResponse);

        if (!uploadResponse.success) {
          toast.error(uploadResponse.message || 'Upload file thất bại');
          return;
        }

        fileUrl = uploadResponse.data.filePath; // Đường dẫn file từ server
        console.log('File uploaded successfully:', fileUrl);
        
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
          applicationData = {
            quy_id: selectedFund.quyId,
            so_tien: parseFloat(donationAmount),
            hinh_anh_minh_chung: null,
            hinh_thuc: paymentMethod,
            ma_giao_dich: txnId,
            ghi_chu: `Quyên góp trực tuyến từ ${user.ho_ten || user.email || 'Nhà tài trợ'}`
          };
          
          if (!donationAmount || parseFloat(donationAmount) < 10000) {
            toast.error('Vui lòng nhập số tiền quyên góp hợp lệ (tối thiểu 10,000đ)');
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
          
          setContentValues({ tieu_de: '', mo_ta: '', so_tien_yeu_cau: '' });
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
          const payload = {
            guestHoTen: guestFields.guestHoTen,
            guestEmail: guestFields.guestEmail,
            guestSoDienThoai: guestFields.guestSoDienThoai,
            guestToChuc: guestFields.guestToChuc,
            guestDiaChi: guestFields.guestDiaChi,
            quyId: selectedFund.quyId,
            soTien: parseFloat(donationAmount),
            hinhThuc: paymentMethod,
            maGiaoDich: txnId,
            chungTu: null,
            ghiChu: guestFields.ghiChu || 'Quyên góp trực tuyến vãng lai'
          };
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
            taiLieuDinhKem: fileUrl
          };
          response = await guestService.submitApplication(payload);
        }

        if (response.success) {
          toast.info('Vui lòng kiểm tra email để nhận mã xác thực OTP');
          setSubmittedGuestInfo({
            email: response.data.email,
            trackingUuid: response.data.trackingUuid,
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

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const openRegisterModal = () => setIsRegisterModalOpen(true);
  const closeRegisterModal = () => setIsRegisterModalOpen(false);

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
  }, [isLoginModalOpen, isRegisterModalOpen]);

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
        type: submittedGuestInfo.type
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

  const handleInputChange = (field, value) => {
    setGuestFields(prev => ({ ...prev, [field]: value }));
  };

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
              <input
                type="text"
                maxLength={6}
                value={guestOtpCode}
                onChange={(e) => setGuestOtpCode(e.target.value)}
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

  // ─── PHÂN NHÁNH GIAO DIỆN 3: CHƯA ĐĂNG NHẬP & CHƯA CHỌN VAI TRÒ
  if (!isAuthenticated && !guestRole) {
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
                  <Title level={4}>Tôi là Sinh viên</Title>
                  <Paragraph>Cần hỗ trợ học phí, học bổng hoặc sinh hoạt phí từ các quỹ.</Paragraph>
                </Card>
                <Card 
                  hoverable 
                  className={styles.roleCard}
                  onClick={() => setGuestRole('donor')}
                >
                  <Title level={4}>Tôi là Nhà tài trợ</Title>
                  <Paragraph>Quyên góp tài chính, chuyển khoản ủng hộ các quỹ phát triển sinh viên.</Paragraph>
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
              <LoginForm onSuccess={closeLoginModal} onClose={closeLoginModal} />
            </div>
          </div>
        )}
        {isRegisterModalOpen && (
          <div className="register-modal-overlay" onClick={closeRegisterModal}>
            <div className="register-modal-content" onClick={(e) => e.stopPropagation()}>
              <RegisterForm onSuccess={closeRegisterModal} onClose={closeRegisterModal} />
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

          {(!isDonor || paymentMethod === 'Khac') && (
            <div className={styles.stepperSection}>
              <FormStepper
                validationStatus={validationStatus}
                isDonor={isDonor}
              />
            </div>
          )}

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

                  {/* BƯỚC 1: Chọn Quỹ */}
                  {(!isDonor || paymentMethod === 'Khac') && (
                    <FundSelectSection
                      onFundSelect={handleFundSelect}
                      selectedFund={selectedFund}
                      isDonor={isDonor}
                    />
                  )}

                  {/* Phần Nhập số tiền cho Nhà tài trợ */}
                  {isDonor && paymentMethod === 'Khac' && (
                    <DonationAmountSection
                      selectedFund={selectedFund}
                      donationAmount={donationAmount}
                      onAmountChange={setDonationAmount}
                    />
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
                            
                            {fundBankLoading ? (
                              <div className={styles.loadingSpinner}>
                                <HiOutlineArrowPath className={styles.spinIcon} />
                                <span>Đang tải thông tin tài khoản của Quỹ...</span>
                              </div>
                            ) : fundBankAccounts.length > 0 ? (
                              <div className={styles.bankCardsGrid}>
                                {fundBankAccounts.map((acc, index) => (
                                  <div key={acc.taiKhoanNganHangId || index} className={styles.bankAccountCard}>
                                    <div className={styles.bankCardHeader}>
                                      <HiOutlineBuildingLibrary className={styles.bankIcon} />
                                      <h4>{acc.nganHang}</h4>
                                    </div>
                                    <div className={styles.bankCardBody}>
                                      <p><strong>Chủ tài khoản:</strong> {acc.chuTaiKhoan}</p>
                                      <p className={styles.accountNumberRow}>
                                        <strong>Số tài khoản:</strong> 
                                        <span className={styles.accountNumber}>{acc.soTaiKhoan}</span>
                                        <button
                                          type="button"
                                          className={styles.copyBtn}
                                          onClick={() => {
                                            navigator.clipboard.writeText(acc.soTaiKhoan);
                                            setCopiedIndex(index);
                                            setTimeout(() => setCopiedIndex(null), 2000);
                                          }}
                                        >
                                          {copiedIndex === index ? 'Đã chép' : 'Sao chép'}
                                        </button>
                                      </p>
                                      {acc.chiNhanh && <p><strong>Chi nhánh:</strong> {acc.chiNhanh}</p>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className={styles.alertWarning}>
                                <p>Hiện tại Quỹ chưa cấu hình tài khoản nhận chuyển khoản ngân hàng riêng trên hệ thống. Quý vị vui lòng chuyển khoản tới tài khoản chính của nhà trường:</p>
                                <div className={styles.bankAccountCard} style={{ marginTop: 15 }}>
                                  <div className={styles.bankCardHeader}>
                                    <HiOutlineBuildingLibrary className={styles.bankIcon} />
                                    <h4>VIETCOMBANK (Trường Đại học Trà Vinh)</h4>
                                  </div>
                                  <div className={styles.bankCardBody}>
                                    <p><strong>Chủ tài khoản:</strong> TRUONG DAI HOC TRA VINH</p>
                                    <p className={styles.accountNumberRow}>
                                      <strong>Số tài khoản:</strong> 
                                      <span className={styles.accountNumber}>1018899889</span>
                                      <button
                                        type="button"
                                        className={styles.copyBtn}
                                        onClick={() => {
                                          navigator.clipboard.writeText('1018899889');
                                          setCopiedIndex('default');
                                          setTimeout(() => setCopiedIndex(null), 2000);
                                        }}
                                      >
                                        {copiedIndex === 'default' ? 'Đã chép' : 'Sao chép'}
                                      </button>
                                    </p>
                                    <p><strong>Nội dung chuyển khoản gợi ý:</strong> {guestFields.guestHoTen || user?.ho_ten || 'Nha tai tro'} ung ho {selectedFund?.tenQuy || 'Quy phat trien'}</p>
                                  </div>
                                </div>
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
                                Số tiền sẽ quyên góp trực tuyến: <strong style={{ color: '#1a2f5e', fontSize: 18 }}>{donationAmount ? parseFloat(donationAmount).toLocaleString('vi-VN') + 'đ' : '0đ'}</strong>
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
                                <li><strong>Địa chỉ:</strong> Văn phòng Ban quản lý Quỹ Phát triển TVU - Phòng 101, Tòa nhà A1, Đại học Trà Vinh (126 Nguyễn Thiện Thành, Khóm 4, Phường 5, TP. Trà Vinh).</li>
                                <li><strong>Thời gian làm việc:</strong> Thứ Hai đến Thứ Sáu (Sáng: 7h00 - 11h00, Chiều: 13h00 - 17h00).</li>
                                <li><strong>Hotline ban quản lý Quỹ:</strong> 0294 3855 246</li>
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

                  {/* THÔNG TIN LIÊN HỆ CỦA NHÀ TÀI TRỢ (Chỉ hiển thị khi thanh toán trực tuyến và là khách vãng lai) */}
                  {isDonor && paymentMethod === 'Khac' && !isAuthenticated && (
                    <div className={styles.guestFormCard}>
                      <h3>Thông tin nhà tài trợ vãng lai</h3>
                      <div className={styles.guestFormRow}>
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
                      </div>
                      <div className={styles.guestFormRowThree}>
                        <div className={styles.inputGroup}>
                          <Input 
                            type="tel" 
                            label="Số điện thoại"
                            placeholder="Nhập SĐT..."
                            value={guestFields.guestSoDienThoai}
                            onChange={(e) => handleInputChange('guestSoDienThoai', e.target.value)}
                          />
                        </div>
                        <div className={styles.inputGroup}>
                          <Input 
                            type="text" 
                            label="Tên tổ chức (nếu có)"
                            placeholder="Doanh nghiệp/Tổ chức..."
                            value={guestFields.guestToChuc}
                            onChange={(e) => handleInputChange('guestToChuc', e.target.value)}
                          />
                        </div>
                        <div className={styles.inputGroup}>
                          <Input 
                            type="text" 
                            label="Địa chỉ"
                            placeholder="Nhập địa chỉ..."
                            value={guestFields.guestDiaChi}
                            onChange={(e) => handleInputChange('guestDiaChi', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className={styles.inputGroup} style={{ marginTop: 20 }}>
                        <label className={styles.selectLabel}>Ghi chú đóng góp</label>
                        <textarea 
                          rows={3} 
                          placeholder="Lời nhắn gửi tới quỹ..."
                          value={guestFields.ghiChu}
                          onChange={(e) => handleInputChange('ghiChu', e.target.value)}
                          className={styles.textareaInput}
                        />
                      </div>
                    </div>
                  )}

                  {/* BƯỚC 2: Nội dung yêu cầu hỗ trợ (chỉ cho sinh viên) */}
                  {!isDonor && (
                    <RequestContentSection
                      onChange={handleContentChange}
                      values={contentValues}
                      selectedFund={selectedFund}
                      onOpenAI={handleOpenAI}
                    />
                  )}

                  {/* BƯỚC 3: Thông tin nhận giải ngân / Thông tin cá nhân sinh viên */}
                  {!isDonor && (
                    isAuthenticated ? (
                      <BankInfoSection
                        bankAccounts={bankAccounts}
                        defaultPhone={null}
                        onChange={handleBankChange}
                        values={bankValues}
                        loading={bankLoading}
                      />
                    ) : (
                      <div className={styles.guestFormCard}>
                        <h3>Thông tin cá nhân & Ngân hàng Sinh viên vãng lai</h3>
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
                              label="Mã số sinh viên (MSSV)"
                              placeholder="Nhập MSSV..."
                              value={guestFields.guestMssv}
                              onChange={(e) => handleInputChange('guestMssv', e.target.value)}
                              required
                            />
                          </div>
                          <div className={styles.inputGroup}>
                            <Input 
                              type="text" 
                              label="Khoa / Phòng học"
                              placeholder="Ví dụ: Công nghệ thông tin..."
                              value={guestFields.guestKhoa}
                              onChange={(e) => handleInputChange('guestKhoa', e.target.value)}
                              required
                            />
                          </div>
                          <div className={styles.inputGroup}>
                            <Input 
                              type="text" 
                              label="Lớp học"
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
                      </div>
                    )
                  )}

                  {/* BƯỚC 4: Tài liệu đính kèm minh chứng (Chỉ dành cho sinh viên đề nghị hỗ trợ) */}
                  {!isDonor && (
                    <DocumentSection
                      files={uploadedFiles}
                      onFilesChange={handleFilesChange}
                      isDonor={isDonor}
                    />
                  )}

                  {/* Xác thực bảo mật Robot cho khách vãng lai (Chỉ hiển thị khi làm trực tuyến) */}
                  {!isAuthenticated && (!isDonor || paymentMethod === 'Khac') && (
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
                  )}

                  {/* Nút bấm Lưu nháp / Gửi đơn / Reset (Chỉ hiển thị khi làm trực tuyến) */}
                  {(!isDonor || paymentMethod === 'Khac') && (
                    <ApplicationFooter
                      onSaveDraft={handleSaveDraft}
                      onSubmit={handleSubmit}
                      onReset={handleReset}
                      isSubmitting={isSubmitting}
                      isSaving={isSaving}
                      isFormValid={isFormValid}
                      isDonor={isDonor}
                    />
                  )}
                </>
              }
              rightContent={
                !isDonor ? (
                  <AppliSidebar
                    moTa={contentValues.mo_ta}
                    tieuDe={contentValues.tieu_de}
                    onApplySuggestion={handleApplyAISuggestion}
                    selectedFund={selectedFund}
                  />
                ) : null
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
            />
          </div>
        </div>
      )}


    </div>
  );
};

export default ApplyPage;
