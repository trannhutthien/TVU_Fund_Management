import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
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
import api from '@services/api';
import styles from './ApplyPage.module.scss';

/**
 * ApplyPage Component
 *
 * Trang đa năng:
 * - Sinh viên (role 4 - SINH_VIEN): Nộp đơn yêu cầu hỗ trợ
 * - Nhà tài trợ (role 4 - NHA_TAI_TRO): Quyên góp cho quỹ
 * - Nếu chưa đăng nhập → tự động mở modal đăng nhập
 */
const ApplyPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  
  // Xác định loại người dùng dựa trên loai_tai_khoan hoặc loai_nguoi_dung
  // SINH_VIEN: Nộp đơn xin hỗ trợ
  // NHA_TAI_TRO: Quyên góp cho quỹ
  const userType = user?.loai_tai_khoan || user?.loaiTaiKhoan || user?.loai_nguoi_dung;
  const isDonor = userType === 'NHA_TAI_TRO';
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
  const validationStatus = isDonor
    ? {
        // Nhà tài trợ cần: Chọn quỹ + Nhập số tiền + Upload minh chứng
        step1: !!selectedFund && !!donationAmount && parseFloat(donationAmount) >= 10000,
        step2: !!(uploadedFiles?.length > 0), // Upload minh chứng chuyển khoản
        step3: false,
        step4: false,
      }
    : {
        // Sinh viên cần đủ 4 bước
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
      };

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
    if (!uploadedFiles || uploadedFiles.length === 0) {
      toast.error('Vui lòng đính kèm file minh chứng');
      return;
    }

    try {
      setIsSubmitting(true);

      // BƯỚC 1: Upload file lên server trước
      toast.info('Đang upload file...');
      
      const fileToUpload = uploadedFiles[0].file; // Lấy File object thực
      console.log('=== FILE UPLOAD DEBUG ===');
      console.log('File to upload:', fileToUpload);
      console.log('File name:', fileToUpload?.name);
      console.log('File type:', fileToUpload?.type);
      
      const uploadResponse = await uploadService.uploadFile(fileToUpload);
      console.log('Upload response:', uploadResponse);

      if (!uploadResponse.success) {
        toast.error(uploadResponse.message || 'Upload file thất bại');
        return;
      }

      const fileUrl = uploadResponse.data.filePath; // Đường dẫn file từ server
      console.log('File uploaded successfully:', fileUrl);
      
      if (!fileUrl || fileUrl.trim() === '') {
        toast.error('Không nhận được đường dẫn file từ server');
        return;
      }

      // BƯỚC 2: Tạo đơn yêu cầu hỗ trợ hoặc khoản tài trợ
      let applicationData;
      let response;
      
      if (isDonor) {
        // Nhà tài trợ: Tạo khoản tài trợ qua endpoint /donations/authenticated
        // Backend tự động lấy thông tin từ token
        applicationData = {
          quy_id: selectedFund.quyId,
          so_tien: parseFloat(donationAmount),
          hinh_anh_minh_chung: fileUrl,
        };
        
        console.log('=== DONOR DATA DEBUG ===');
        console.log('Donation amount:', donationAmount);
        console.log('Fund ID:', selectedFund.quyId);
        console.log('File URL:', fileUrl);
        console.log('Final payload:', applicationData);
        
        // Validate trước khi gửi
        if (!donationAmount || parseFloat(donationAmount) < 10000) {
          toast.error('Vui lòng nhập số tiền quyên góp hợp lệ (tối thiểu 10,000đ)');
          return;
        }
        
        // Gọi API donations/authenticated (backend tự lấy thông tin từ token)
        response = await api.post('/donations/authenticated', applicationData);
      } else {
        // Sinh viên: Tạo đơn yêu cầu hỗ trợ
        
        // Validate số tiền trước khi gửi
        const soTienNum = parseFloat(contentValues.so_tien_yeu_cau);
        if (!contentValues.so_tien_yeu_cau || isNaN(soTienNum) || soTienNum <= 0) {
          toast.error('Vui lòng nhập số tiền yêu cầu hợp lệ');
          return;
        }
        
        const soTienMin = selectedFund?.soTienToiThieu || 0;
        const soTienMax = selectedFund?.soTienToiDa || Infinity;
        
        if (soTienNum < soTienMin) {
          toast.error(`Số tiền tối thiểu là ${soTienMin.toLocaleString('vi-VN')} VNĐ`);
          return;
        }
        
        if (soTienNum > soTienMax) {
          toast.error(`Số tiền tối đa là ${soTienMax.toLocaleString('vi-VN')} VNĐ`);
          return;
        }
        
        applicationData = {
          quyId: selectedFund.quyId,
          tieuDe: contentValues.tieu_de,
          moTa: contentValues.mo_ta,
          soTienYeuCau: soTienNum,
          fileDinhKem: fileUrl,
        };
        console.log('Creating application with data:', applicationData);
        
        response = await applicationService.create(applicationData);
      }

      console.log('=== API RESPONSE DEBUG ===');
      console.log('Full response:', response);
      console.log('response.data:', response.data);

      // Check linh hoạt hơn cho cả 2 loại response (đã bọc Axios và đã unwrap)
      const responseData = response?.data || response;
      const isSuccess = response?.success === true || 
                        response?.success === 'true' || 
                        response?.data?.success === true || 
                        response?.data?.success === 'true' ||
                        (!responseData?.success && !responseData?.error && responseData?.data);

      if (isSuccess) {
        const successMessage = isDonor 
          ? 'Quyên góp thành công! Cảm ơn bạn đã đồng hành cùng TVU Fund.'
          : 'Nộp đơn thành công! Đơn của bạn đang chờ xét duyệt.';
        toast.success(successMessage);
        
        // Reset form data states upon successful submission
        setContentValues({
          tieu_de: '',
          mo_ta: '',
          so_tien_yeu_cau: '',
        });
        setDonationAmount('');
        setUploadedFiles([]);
        
        // Chuyển đến trang profile sau 1.5s
        setTimeout(() => {
          navigate('/profile');
        }, 1500);
      } else {
        const errorMessage = isDonor ? 'Quyên góp thất bại' : 'Nộp đơn thất bại';
        toast.error(responseData?.message || errorMessage);
      }
    } catch (error) {
      console.error('Submit error:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.message || 
        (isDonor ? 'Đã xảy ra lỗi khi quyên góp' : 'Đã xảy ra lỗi khi nộp đơn');
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

  // Nếu chưa đăng nhập → tự động mở modal đăng nhập
  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
    }
  }, [isAuthenticated]);

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
              highlight={isDonor ? "Quyên Góp Mới" : "Xin Hỗ Trợ Mới"}
              subtitle={
                isDonor
                  ? "Cảm ơn bạn đã đồng hành cùng TVU Fund. Vui lòng điền thông tin quyên góp."
                  : "Vui lòng điền đầy đủ thông tin để hệ thống và AI hỗ trợ xét duyệt nhanh nhất."
              }
              variant="transparent"
            />
          </div>

          <div className={styles.stepperSection}>
            <FormStepper
              validationStatus={validationStatus}
              isDonor={isDonor}
            />
          </div>

          <div className={styles.formSection}>
            <AppliSectionLayout
              leftContent={
                <>
                  <FundSelectSection
                    onFundSelect={handleFundSelect}
                    selectedFund={selectedFund}
                    isDonor={isDonor}
                  />
                  {isDonor && (
                    <DonationAmountSection
                      selectedFund={selectedFund}
                      donationAmount={donationAmount}
                      onAmountChange={setDonationAmount}
                    />
                  )}
                  {!isDonor && (
                    <RequestContentSection
                      onChange={handleContentChange}
                      values={contentValues}
                      selectedFund={selectedFund}
                      onOpenAI={handleOpenAI}
                    />
                  )}
                  {!isDonor && (
                    <BankInfoSection
                      bankAccounts={bankAccounts}
                      defaultPhone={null}
                      onChange={handleBankChange}
                      values={bankValues}
                      loading={bankLoading}
                    />
                  )}
                  <DocumentSection
                    files={uploadedFiles}
                    onFilesChange={handleFilesChange}
                    isDonor={isDonor}
                  />
                  <ApplicationFooter
                    onSaveDraft={handleSaveDraft}
                    onSubmit={handleSubmit}
                    onReset={handleReset}
                    isSubmitting={isSubmitting}
                    isSaving={isSaving}
                    isFormValid={isFormValid}
                    isDonor={isDonor}
                  />
                </>
              }
              rightContent={
                !isDonor ? (
                  <AppliSidebar
                    moTa={contentValues.mo_ta}
                    tieuDe={contentValues.tieu_de}
                    onApplySuggestion={handleApplyAISuggestion}
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
