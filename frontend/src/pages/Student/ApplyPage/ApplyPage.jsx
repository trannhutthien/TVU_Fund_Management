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
import DocumentSection from '@components/sections/AppliPage/AppliSectionLayout/AppliSectionForm/DocumentSection/DocumentSection';
import ApplicationFooter from '@components/sections/AppliPage/AppliSectionLayout/AppliSectionForm/ApplicationFooter/ApplicationFooter';
import AppliSidebar from '@components/sections/AppliPage/AppliSectionLayout/AppliSidebar/AppliSidebar';
import AppliSectionLayout from '@components/sections/AppliPage/AppliSectionLayout/AppliSectionLayout';
import useAuthStore from '@stores/authStore';
import { bankAccountService } from '@services/bankAccountService';
import { applicationService } from '@services/applicationService';
import { uploadService } from '@services/uploadService';
import styles from './ApplyPage.module.scss';

/**
 * ApplyPage Component
 *
 * Trang nộp đơn yêu cầu hỗ trợ từ quỹ TVU.
 * - Nếu chưa đăng nhập → tự động mở modal đăng nhập
 */
const ApplyPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedFund, setSelectedFund] = useState(null);
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
  const validationStatus = {
    // Bước 1: Thông tin quỹ - Đã chọn quỹ
    step1: !!selectedFund,
    
    // Bước 2: Soạn nội dung - Tiêu đề, mô tả, số tiền hợp lệ
    step2: !!(
      contentValues.tieu_de?.length >= 10 &&
      contentValues.mo_ta?.length >= 50 &&
      contentValues.so_tien_yeu_cau &&
      parseFloat(contentValues.so_tien_yeu_cau) >= (selectedFund?.soTienToiThieu || 0) &&
      parseFloat(contentValues.so_tien_yeu_cau) <= (selectedFund?.soTienToiDa || Infinity)
    ),
    
    // Bước 3: Tài khoản ngân hàng - Đã chọn TK và nhập SĐT
    step3: !!(
      bankValues.selectedBankId &&
      bankValues.soDienThoai?.length > 0
    ),
    
    // Bước 4: Minh chứng - Đã upload file
    step4: !!(uploadedFiles?.length > 0),
  };

  const isFormValid = validationStatus.step1 && 
                      validationStatus.step2 && 
                      validationStatus.step3 && 
                      validationStatus.step4;

  const handleReset = () => {
    // Reset tất cả state về giá trị ban đầu
    setSelectedFund(null);
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
      const uploadResponse = await uploadService.uploadFile(fileToUpload);

      if (!uploadResponse.success) {
        toast.error('Upload file thất bại');
        return;
      }

      const fileUrl = uploadResponse.data.filePath; // Đường dẫn file từ server
      console.log('File uploaded successfully:', fileUrl);

      // BƯỚC 2: Tạo đơn yêu cầu hỗ trợ với URL file thực
      const applicationData = {
        quyId: selectedFund.quyId, // ✅ Sửa từ quy_id sang quyId
        tieuDe: contentValues.tieu_de,
        moTa: contentValues.mo_ta,
        soTienYeuCau: parseFloat(contentValues.so_tien_yeu_cau),
        fileDinhKem: fileUrl,
      };

      console.log('Creating application with data:', applicationData);

      const response = await applicationService.create(applicationData);

      console.log('=== API RESPONSE DEBUG ===');
      console.log('Full response:', response);
      console.log('response.success:', response.success);
      console.log('response.message:', response.message);
      console.log('response.data:', response.data);

      // Check linh hoạt hơn
      const isSuccess = response?.success === true || 
                        response?.success === 'true' || 
                        (!response?.success && !response?.error && response?.data);

      if (isSuccess) {
        toast.success('Nộp đơn thành công! Đơn của bạn đang chờ xét duyệt.');
        
        // Chuyển đến trang profile sau 1.5s
        setTimeout(() => {
          navigate('/profile');
        }, 1500);
      } else {
        toast.error(response?.message || 'Nộp đơn thất bại');
      }
    } catch (error) {
      console.error('Submit application error:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.message || 'Đã xảy ra lỗi khi nộp đơn';
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
              title="Tạo hồ sơ đề nghị"
              highlight="Xin Hỗ Trợ Mới"
              subtitle="Vui lòng điền đầy đủ thông tin để hệ thống và AI hỗ trợ xét duyệt nhanh nhất."
              variant="transparent"
            />
          </div>

          <div className={styles.stepperSection}>
            <FormStepper
              validationStatus={validationStatus}
            />
          </div>

          <div className={styles.formSection}>
            <AppliSectionLayout
              leftContent={
                <>
                  <FundSelectSection
                    onFundSelect={handleFundSelect}
                    selectedFund={selectedFund}
                  />
                  <RequestContentSection
                    onChange={handleContentChange}
                    values={contentValues}
                    selectedFund={selectedFund}
                    onOpenAI={handleOpenAI}
                  />
                  <BankInfoSection
                    bankAccounts={bankAccounts}
                    defaultPhone={null}
                    onChange={handleBankChange}
                    values={bankValues}
                    loading={bankLoading}
                  />
                  <DocumentSection
                    files={uploadedFiles}
                    onFilesChange={handleFilesChange}
                  />
                  <ApplicationFooter
                    onSaveDraft={handleSaveDraft}
                    onSubmit={handleSubmit}
                    onReset={handleReset}
                    isSubmitting={isSubmitting}
                    isSaving={isSaving}
                    isFormValid={isFormValid}
                  />
                </>
              }
              rightContent={
                <AppliSidebar
                  moTa={contentValues.mo_ta}
                  tieuDe={contentValues.tieu_de}
                  onApplySuggestion={handleApplyAISuggestion}
                />
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
