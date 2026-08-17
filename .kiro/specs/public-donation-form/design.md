# Tài liệu Thiết kế - Trang Tạo Đơn Tài Trợ Công Khai

## 1. Tổng quan Kiến trúc

### 1.1. Kiến trúc Tổng thể

```
┌─────────────────────────────────────────────────────────────┐
│                    NGƯỜI DÙNG (Browser)                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              FRONTEND - React Application                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  PublicDonationPage Component                        │   │
│  │  ├─ DonorInfoSection                                 │   │
│  │  ├─ DestinationSelector                              │   │
│  │  │   ├─ FundLevelSelector                            │   │
│  │  │   └─ ProgramProposalForm                          │   │
│  │  ├─ DonationDetailsSection                           │   │
│  │  ├─ BankTransferInfo                                 │   │
│  │  └─ SuccessModal                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Services Layer                                      │   │
│  │  ├─ donationService.js                               │   │
│  │  ├─ proposalService.js                               │   │
│  │  ├─ fundService.js                                   │   │
│  │  ├─ uploadService.js                                 │   │
│  │  └─ validationService.js                             │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND - Node.js/Express API                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Routes                                              │   │
│  │  ├─ /api/donations/public                            │   │
│  │  ├─ /api/donations/propose-program                   │   │
│  │  ├─ /api/funds/public                                │   │
│  │  ├─ /api/funds/programs                              │   │
│  │  └─ /api/upload                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Controllers                                         │   │
│  │  ├─ donationController.js                            │   │
│  │  ├─ proposalController.js                            │   │
│  │  └─ fundController.js                                │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Models                                              │   │
│  │  ├─ DonationModel.js                                 │   │
│  │  ├─ ProposalModel.js                                 │   │
│  │  └─ FundModel.js                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Middleware                                          │   │
│  │  ├─ rateLimiter.js                                   │   │
│  │  ├─ csrfProtection.js                                │   │
│  │  ├─ fileValidator.js                                 │   │
│  │  └─ inputSanitizer.js                                │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE - MySQL                          │
│  ├─ quy (Bảng quỹ - 3 cấp)                                  │
│  ├─ khoantaitro (Bảng khoản tài trợ)                        │
│  ├─ dexuatchuongtrinh (Bảng đề xuất chương trình)           │
│  ├─ nhataitro (Bảng nhà tài trợ)                            │
│  └─ nguoidung (Bảng người dùng)                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.2. Luồng Dữ liệu Tổng quát

```
[User Input] 
    → [Frontend Validation] 
    → [File Upload (nếu có)]
    → [API Call with CSRF Token]
    → [Backend Validation + Sanitization]
    → [Rate Limiting Check]
    → [Database Transaction]
    → [Email Service]
    → [Response to Frontend]
    → [Success Modal]
```

---

## 2. Thiết kế Frontend

### 2.1. Cấu trúc Component

```
PublicDonationPage/
├── PublicDonationPage.jsx (Container chính)
├── PublicDonationPage.module.scss
├── components/
│   ├── DonorInfoSection/
│   │   ├── DonorInfoSection.jsx
│   │   └── DonorInfoSection.module.scss
│   ├── DestinationSelector/
│   │   ├── DestinationSelector.jsx
│   │   ├── DestinationSelector.module.scss
│   │   ├── FundLevelRadio.jsx
│   │   └── ProgramSelector.jsx
│   ├── ProgramProposalForm/
│   │   ├── ProgramProposalForm.jsx
│   │   ├── ProgramProposalForm.module.scss
│   │   ├── ProposalBasicInfo.jsx
│   │   ├── ProposalFinancialInfo.jsx
│   │   └── ProposalRequirements.jsx
│   ├── DonationDetailsSection/
│   │   ├── DonationDetailsSection.jsx
│   │   ├── DonationDetailsSection.module.scss
│   │   ├── AmountInput.jsx
│   │   ├── QuickAmountButtons.jsx
│   │   └── PaymentMethodSelector.jsx
│   ├── BankTransferInfo/
│   │   ├── BankTransferInfo.jsx
│   │   └── BankTransferInfo.module.scss
│   ├── SuccessModal/
│   │   ├── SuccessModal.jsx
│   │   └── SuccessModal.module.scss
│   └── FileUpload/
│       ├── FileUpload.jsx
│       └── FileUpload.module.scss
├── hooks/
│   ├── useDonationForm.js
│   ├── useDestinationSelector.js
│   ├── useFileUpload.js
│   └── useFormValidation.js
└── utils/
    ├── validationRules.js
    ├── formatters.js
    └── constants.js
```

### 2.2. State Management

Sử dụng **React Hook Form** + **Custom Hooks**:

```javascript
// useDonationForm.js - Main form state
const useDonationForm = () => {
  const [formState, setFormState] = useState({
    // Donor Info
    donorType: 'Ca nhan',
    fullName: '',
    email: '',
    phone: '',
    
    // Destination
    destinationType: null, // 'quy-me' | 'quy-thanh-phan' | 'chuong-trinh' | 'de-xuat'
    selectedFundId: null,
    selectedProgramId: null,
    
    // Proposal (chỉ khi destinationType === 'de-xuat')
    proposal: {
      tenChuongTrinh: '',
      moTa: '',
      loaiHinh: 'Trao tang',
      thoiGianBatDau: null,
      thoiGianKetThuc: null,
      soLuongSuat: null,
      soTienMoiSuat: null,
      doiTuongNhan: '',
      yeuCauHocLuc: '',
      dieuKienHoanTra: '',
      taiLieu: []
    },
    
    // Donation Details
    soTien: null,
    hinhThuc: 'Chuyen khoan',
    maGiaoDich: '',
    chungTu: null,
    ghiChu: '',
    
    // UI State
    isSubmitting: false,
    showBankInfo: false,
    showProposalForm: false
  });
  
  const [errors, setErrors] = useState({});
  const [bankInfo, setBankInfo] = useState(null);
  
  return {
    formState,
    setFormState,
    errors,
    setErrors,
    bankInfo,
    setBankInfo
  };
};
```

### 2.3. Component Chi tiết

#### 2.3.1. PublicDonationPage (Container)

```jsx
const PublicDonationPage = () => {
  const {
    formState,
    setFormState,
    errors,
    setErrors,
    bankInfo,
    setBankInfo
  } = useDonationForm();
  
  const { funds, loadingFunds } = useFundData();
  const { handleFileUpload } = useFileUpload();
  const { validateForm } = useFormValidation();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Validate
    const validationErrors = validateForm(formState);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    // 2. Upload files
    setFormState(prev => ({ ...prev, isSubmitting: true }));
    try {
      const uploadedFiles = await uploadFiles(formState);
      
      // 3. Call API
      if (formState.destinationType === 'de-xuat') {
        await proposalService.createProposal({
          ...formState,
          ...uploadedFiles
        });
      } else {
        await donationService.createPublicDonation({
          ...formState,
          ...uploadedFiles
        });
      }
      
      // 4. Show success
      setShowSuccessModal(true);
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setFormState(prev => ({ ...prev, isSubmitting: false }));
    }
  };
  
  return (
    <div className={styles.page}>
      <PublicHeader />
      <BackgroundImage overlayType="dark">
        <main className={styles.content}>
          <FundTitleSection title="Tạo đơn tài trợ" />
          
          <form onSubmit={handleSubmit} className={styles.form}>
            <DonorInfoSection 
              formState={formState}
              setFormState={setFormState}
              errors={errors}
            />
            
            <DestinationSelector
              formState={formState}
              setFormState={setFormState}
              funds={funds}
              errors={errors}
            />
            
            {formState.destinationType === 'de-xuat' && (
              <ProgramProposalForm
                formState={formState}
                setFormState={setFormState}
                errors={errors}
              />
            )}
            
            <DonationDetailsSection
              formState={formState}
              setFormState={setFormState}
              errors={errors}
            />
            
            {formState.selectedFundId && (
              <BankTransferInfo
                bankInfo={bankInfo}
                fundCode={getFundCode(formState.selectedFundId)}
                donorName={formState.fullName}
              />
            )}
            
            <div className={styles.actions}>
              <button type="button" onClick={handleReset}>
                Làm mới
              </button>
              <button 
                type="submit" 
                disabled={formState.isSubmitting}
              >
                {formState.isSubmitting ? 'Đang gửi...' : 'Gửi đơn tài trợ'}
              </button>
            </div>
          </form>
        </main>
      </BackgroundImage>
      <PublicFooter />
      
      {showSuccessModal && (
        <SuccessModal
          donationType={formState.destinationType}
          email={formState.email}
          onClose={() => setShowSuccessModal(false)}
        />
      )}
    </div>
  );
};
```

#### 2.3.2. DestinationSelector

```jsx
const DestinationSelector = ({ formState, setFormState, funds, errors }) => {
  const handleDestinationChange = (type) => {
    setFormState(prev => ({
      ...prev,
      destinationType: type,
      selectedFundId: null,
      selectedProgramId: null,
      showProposalForm: type === 'de-xuat'
    }));
  };
  
  return (
    <section className={styles.section}>
      <h2>Chọn đích đến tài trợ</h2>
      
      {/* Radio: Quỹ Mẹ */}
      <label className={styles.radioOption}>
        <input
          type="radio"
          name="destination"
          value="quy-me"
          checked={formState.destinationType === 'quy-me'}
          onChange={() => handleDestinationChange('quy-me')}
        />
        <div className={styles.optionContent}>
          <strong>Quỹ Phát triển ĐH Trà Vinh (Quỹ Mẹ)</strong>
          <p>Tài trợ chung, nhà trường sẽ điều phối sử dụng</p>
        </div>
      </label>
      
      {/* Radio: Quỹ Thành phần */}
      <label className={styles.radioOption}>
        <input
          type="radio"
          name="destination"
          value="quy-thanh-phan"
          checked={formState.destinationType === 'quy-thanh-phan'}
          onChange={() => handleDestinationChange('quy-thanh-phan')}
        />
        <div className={styles.optionContent}>
          <strong>Quỹ Thành phần</strong>
          <p>Chọn lĩnh vực cụ thể (Học bổng, Y tế, Từ thiện...)</p>
        </div>
      </label>
      
      {formState.destinationType === 'quy-thanh-phan' && (
        <select 
          value={formState.selectedFundId || ''}
          onChange={(e) => setFormState(prev => ({
            ...prev,
            selectedFundId: e.target.value
          }))}
        >
          <option value="">-- Chọn quỹ thành phần --</option>
          {funds.level2.map(fund => (
            <option key={fund.quy_id} value={fund.quy_id}>
              {fund.tenquy}
            </option>
          ))}
        </select>
      )}
      
      {/* Radio: Chương trình có sẵn */}
      <label className={styles.radioOption}>
        <input
          type="radio"
          name="destination"
          value="chuong-trinh"
          checked={formState.destinationType === 'chuong-trinh'}
          onChange={() => handleDestinationChange('chuong-trinh')}
        />
        <div className={styles.optionContent}>
          <strong>Chương trình có sẵn</strong>
          <p>Chọn chương trình cụ thể đã được thiết lập</p>
        </div>
      </label>
      
      {formState.destinationType === 'chuong-trinh' && (
        <ProgramSelector 
          funds={funds}
          selectedProgramId={formState.selectedProgramId}
          onChange={(programId) => setFormState(prev => ({
            ...prev,
            selectedProgramId: programId
          }))}
        />
      )}
      
      {/* Radio: Đề xuất chương trình mới */}
      <label className={styles.radioOption}>
        <input
          type="radio"
          name="destination"
          value="de-xuat"
          checked={formState.destinationType === 'de-xuat'}
          onChange={() => handleDestinationChange('de-xuat')}
        />
        <div className={styles.optionContent}>
          <strong>Đề xuất chương trình mới ⭐</strong>
          <p>Tạo chương trình riêng với mục tiêu và điều kiện của bạn</p>
        </div>
      </label>
      
      {errors.destination && (
        <p className={styles.error}>{errors.destination}</p>
      )}
    </section>
  );
};
```

---

## 3. Thiết kế Backend

### 3.1. API Endpoints

#### 3.1.1. POST /api/donations/public (Đã có)

**Request:**
```json
{
  "ten": "Nguyễn Văn A",
  "email": "a@example.com",
  "soDienThoai": "0123456789",
  "quyId": 5,
  "soTien": 1000000,
  "hinhThuc": "Chuyen khoan",
  "maGiaoDich": "FT123456",
  "chungTu": "https://cdn.example.com/files/proof.jpg",
  "ghiChu": "Tài trợ học bổng"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tạo khoản tài trợ thành công",
  "data": {
    "khoanTaiTroId": 123,
    "nhaTaiTroId": 45,
    "bankInfo": {
      "nganHang": "VIETCOMBANK",
      "soTaiKhoan": "0123456789",
      "chuTaiKhoan": "ĐH Trà Vinh",
      "noiDung": "TAITRO-HB01-NGUYENVANA"
    }
  }
}
```

#### 3.1.2. POST /api/donations/propose-program (Cần tạo mới)

**Request:**
```json
{
  "ten": "Nguyễn Văn A",
  "email": "a@example.com",
  "soDienThoai": "0123456789",
  "quyThanhPhanId": 3,
  "tenChuongTrinh": "Trao quà Trung thu 2026",
  "moTa": "Trao quà cho 50 sinh viên khó khăn",
  "loaiHinh": "Trao tang",
  "thoiGianBatDau": "2026-09-01",
  "thoiGianKetThuc": "2026-09-15",
  "soLuongSuat": 50,
  "soTienMoiSuat": 500000,
  "doiTuongNhan": "Sinh viên hộ nghèo, cận nghèo",
  "yeuCauHocLuc": "Không yêu cầu",
  "dieuKienHoanTra": null,
  "taiLieuDinhKem": ["https://cdn.example.com/files/doc1.pdf"],
  "soTien": 25000000,
  "hinhThuc": "Chuyen khoan",
  "maGiaoDich": "FT789012",
  "chungTu": "https://cdn.example.com/files/proof2.jpg",
  "ghiChu": "Muốn tạo chương trình riêng"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đề xuất chương trình đã được gửi. Chúng tôi sẽ xét duyệt trong 3-5 ngày.",
  "data": {
    "deXuatId": 10,
    "khoanTaiTroId": 124,
    "nhaTaiTroId": 45,
    "trangThai": "Cho duyet"
  }
}
```

#### 3.1.3. GET /api/funds/public (Đã có - cần filter)

**Query Parameters:**
- `capDo`: 1 | 2 | 3
- `trangThai`: "Dang hoat dong" | "Tam dung"

**Response:**
```json
{
  "success": true,
  "total": 15,
  "funds": [
    {
      "quyId": 1,
      "tenQuy": "Quỹ Phát triển ĐH Trà Vinh",
      "capDo": 1,
      "quyChaId": null,
      "loaiQuy": "PT",
      "trangThai": "Dang hoat dong"
    },
    {
      "quyId": 2,
      "tenQuy": "Quỹ Học bổng",
      "capDo": 2,
      "quyChaId": 1,
      "loaiQuy": "HB",
      "trangThai": "Dang hoat dong"
    }
  ]
}
```

#### 3.1.4. POST /api/upload (Cần tạo mới)

**Request:** `multipart/form-data`
```
file: [File]
type: "chungtu" | "tailieu"
```

**Response:**
```json
{
  "success": true,
  "fileUrl": "https://cdn.example.com/files/abc123.jpg",
  "fileName": "proof_abc123.jpg",
  "fileSize": 245678
}
```

### 3.2. Controllers

#### 3.2.1. proposalController.js (Mới)

```javascript
// backend/controllers/donations/proposalController.js

import ProposalModel from '../../models/donations/ProposalModel.js';
import DonationModel from '../../models/donations/DonationModel.js';
import { sendProposalNotificationEmail } from '../../services/emailService.js';

export const createProposal = async (req, res) => {
  try {
    const {
      // Donor info
      ten, email, soDienThoai,
      // Proposal info
      quyThanhPhanId, tenChuongTrinh, moTa, loaiHinh,
      thoiGianBatDau, thoiGianKetThuc, soLuongSuat, soTienMoiSuat,
      doiTuongNhan, yeuCauHocLuc, dieuKienHoanTra, taiLieuDinhKem,
      // Donation info
      soTien, hinhThuc, maGiaoDich, chungTu, ghiChu
    } = req.body;
    
    // 1. Validate
    if (!ten || !email || !quyThanhPhanId || !tenChuongTrinh) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc'
      });
    }
    
    // 2. Tạo đề xuất + donation trong transaction
    const result = await ProposalModel.createProposalWithDonation({
      donorInfo: { ten, email, soDienThoai },
      proposalInfo: {
        quyThanhPhanId,
        tenChuongTrinh,
        moTa,
        loaiHinh,
        thoiGianBatDau,
        thoiGianKetThuc,
        soLuongSuat,
        soTienMoiSuat,
        doiTuongNhan,
        yeuCauHocLuc,
        dieuKienHoanTra,
        taiLieuDinhKem
      },
      donationInfo: {
        soTien,
        hinhThuc,
        maGiaoDich,
        chungTu,
        ghiChu
      }
    });
    
    // 3. Send email
    await sendProposalNotificationEmail({
      to: email,
      donorName: ten,
      programName: tenChuongTrinh,
      amount: soTien
    });
    
    return res.status(201).json({
      success: true,
      message: 'Đề xuất chương trình đã được gửi',
      data: result
    });
  } catch (error) {
    console.error('Error in createProposal:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};
```

### 3.3. Models

#### 3.3.1. ProposalModel.js (Mới)

```javascript
// backend/models/donations/ProposalModel.js

import pool from '../../config/db.js';
import DonationModel from './DonationModel.js';

const createProposalWithDonation = async ({
  donorInfo,
  proposalInfo,
  donationInfo
}) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // 1. Tạo/lấy nhà tài trợ (giống logic createPublicDonation)
    const { nhaTaiTroId } = await DonationModel.createOrGetDonor(
      connection,
      donorInfo
    );
    
    // 2. Tạo đề xuất chương trình
    const [proposalResult] = await connection.execute(
      `INSERT INTO dexuatchuongtrinh (
        nhataitro_id, quy_thanh_phan_id, ten_chuong_trinh, mo_ta,
        loai_hinh, thoi_gian_bat_dau, thoi_gian_ket_thuc,
        so_luong_suat, so_tien_moi_suat, tong_tien_muc_tieu,
        doi_tuong_nhan, yeu_cau_hoc_luc, dieu_kien_hoan_tra,
        tai_lieu_dinh_kem, trang_thai
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Cho duyet')`,
      [
        nhaTaiTroId,
        proposalInfo.quyThanhPhanId,
        proposalInfo.tenChuongTrinh,
        proposalInfo.moTa,
        proposalInfo.loaiHinh,
        proposalInfo.thoiGianBatDau,
        proposalInfo.thoiGianKetThuc,
        proposalInfo.soLuongSuat,
        proposalInfo.soTienMoiSuat,
        proposalInfo.soLuongSuat * proposalInfo.soTienMoiSuat,
        proposalInfo.doiTuongNhan,
        proposalInfo.yeuCauHocLuc,
        proposalInfo.dieuKienHoanTra,
        JSON.stringify(proposalInfo.taiLieuDinhKem)
      ]
    );
    
    const deXuatId = proposalResult.insertId;
    
    // 3. Tạo khoản tài trợ liên kết với đề xuất
    const [donationResult] = await connection.execute(
      `INSERT INTO khoantaitro (
        nhataitro_id, quy_id, dexuat_id, sotien, hinhthuc,
        magiaodich, ngaytaitro, trangthai, ghichu, chungtu
      ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_DATE, 'Cho duyet', ?, ?)`,
      [
        nhaTaiTroId,
        proposalInfo.quyThanhPhanId, // Tạm thời gán vào quỹ thành phần
        deXuatId,
        donationInfo.soTien,
        donationInfo.hinhThuc,
        donationInfo.maGiaoDich,
        donationInfo.ghiChu,
        donationInfo.chungTu
      ]
    );
    
    const khoanTaiTroId = donationResult.insertId;
    
    await connection.commit();
    
    return {
      deXuatId,
      khoanTaiTroId,
      nhaTaiTroId,
      trangThai: 'Cho duyet'
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export default {
  createProposalWithDonation
};
```

---

## 4. Luồng Dữ liệu Chi tiết

### 4.1. Trường hợp 1: Tài trợ vào Quỹ Mẹ

```
[User chọn "Quỹ Mẹ"]
    ↓
[Điền thông tin donor + donation]
    ↓
[Upload file chứng từ (nếu có)]
    ↓  
[Submit form]
    ↓
[Frontend validate]
    ↓
[Call: POST /api/donations/public]
    {
      quyId: 1 (Quỹ mẹ),
      ...donorInfo,
      ...donationInfo
    }
    ↓
[Backend: createPublicDonation]
    ├─ Tạo/lấy nhà tài trợ
    ├─ Tạo khoản tài trợ (trangthai = "Cho duyet")
    └─ Return {khoanTaiTroId, nhaTaiTroId}
    ↓
[Hiển thị thông tin chuyển khoản]
    ↓
[Gửi email xác nhận]
    ↓
[Show SuccessModal]
```

### 4.2. Trường hợp 2: Tài trợ vào Quỹ Thành phần

```
[User chọn "Quỹ Thành phần"]
    ↓
[Chọn quỹ từ dropdown (VD: Học bổng)]
    ↓
[selectedFundId = 2 (capdo = 2)]
    ↓
[Điền thông tin + Submit]
    ↓
[Call: POST /api/donations/public với quyId = 2]
    ↓
[Backend xử lý như TC1]
    ↓
[Success]
```

### 4.3. Trường hợp 3: Tài trợ vào Chương trình có sẵn

```
[User chọn "Chương trình có sẵn"]
    ↓
[Hiển thị danh sách chương trình (capdo = 3)]
    ↓
[User chọn chương trình cụ thể]
    ↓
[selectedProgramId = 15 (capdo = 3)]
    ↓
[Điền thông tin + Submit]
    ↓
[Call: POST /api/donations/public với quyId = 15]
    ↓
[Backend xử lý như TC1]
    ↓
[Success]
```

### 4.4. Trường hợp 4: Đề xuất Chương trình mới

```
[User chọn "Đề xuất chương trình mới"]
    ↓
[Hiển thị ProgramProposalForm]
    ↓
[User điền đầy đủ thông tin chương trình]
    ↓
[Upload tài liệu đính kèm (nếu có)]
    ↓
[Điền thông tin donor + donation]
    ↓
[Submit form]
    ↓
[Frontend validate proposal fields]
    ↓
[Call: POST /api/donations/propose-program]
    {
      ...donorInfo,
      ...proposalInfo,
      ...donationInfo
    }
    ↓
[Backend: ProposalModel.createProposalWithDonation]
    ├─ BEGIN TRANSACTION
    ├─ Tạo/lấy nhà tài trợ
    ├─ Tạo record `dexuatchuongtrinh` (trangthai = "Cho duyet")
    ├─ Tạo record `khoantaitro` (trangthai = "Cho duyet", link đến đề xuất)
    ├─ COMMIT
    └─ Return {deXuatId, khoanTaiTroId, nhaTaiTroId}
    ↓
[Gửi email thông báo đề xuất chờ duyệt]
    ↓
[Show SuccessModal với message khác]
    ↓
[Admin vào dashboard duyệt đề xuất]
    ↓
[Nếu duyệt: Tạo quỹ mới (capdo = 3), update khoantaitro.quy_id]
    ↓
[Gửi email thông báo kết quả cho nhà tài trợ]
```

---

## 5. Database Schema

### 5.1. Bảng `khoantaitro` - Thêm cột

```sql
ALTER TABLE khoantaitro 
ADD COLUMN dexuat_id INT NULL,
ADD FOREIGN KEY (dexuat_id) REFERENCES dexuatchuongtrinh(dexuat_id);
```

**Ý nghĩa:**
- `dexuat_id = NULL`: Tài trợ thông thường (TC1, TC2, TC3)
- `dexuat_id != NULL`: Tài trợ kèm đề xuất chương trình mới (TC4)

### 5.2. Bảng `dexuatchuongtrinh` (Đã có)

```sql
CREATE TABLE dexuatchuongtrinh (
  dexuat_id INT PRIMARY KEY AUTO_INCREMENT,
  nhataitro_id INT NOT NULL,
  quy_thanh_phan_id INT NOT NULL,
  ten_chuong_trinh VARCHAR(200) NOT NULL,
  mo_ta TEXT,
  loai_hinh ENUM('Trao tang', 'Cho vay', 'Ho tro mot phan'),
  thoi_gian_bat_dau DATE,
  thoi_gian_ket_thuc DATE,
  so_luong_suat INT,
  so_tien_moi_suat DECIMAL(15,2),
  tong_tien_muc_tieu DECIMAL(15,2),
  doi_tuong_nhan TEXT,
  yeu_cau_hoc_luc VARCHAR(200),
  dieu_kien_hoan_tra TEXT,
  tai_lieu_dinh_kem VARCHAR(500),
  trang_thai ENUM('Cho duyet', 'Da duyet', 'Tu choi') DEFAULT 'Cho duyet',
  ly_do_tu_choi TEXT,
  nguoi_duyet_id INT,
  ngay_duyet DATETIME,
  ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (nhataitro_id) REFERENCES nhataitro(nhataitro_id),
  FOREIGN KEY (quy_thanh_phan_id) REFERENCES quy(quy_id),
  FOREIGN KEY (nguoi_duyet_id) REFERENCES nguoidung(nguoidung_id)
);
```

---

## 6. Security Implementation

### 6.1. Rate Limiting

```javascript
// backend/middleware/rateLimiter.js

import rateLimit from 'express-rate-limit';

export const donationRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 phút
  max: 5, // Tối đa 5 requests
  message: {
    success: false,
    message: 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau 10 phút'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Keygenerator: dùng IP
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress;
  }
});
```

### 6.2. File Validation

```javascript
// backend/middleware/fileValidator.js

import path from 'path';
import fs from 'fs/promises';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];

export const validateFile = async (req, res, next) => {
  try {
    if (!req.file) return next();
    
    const file = req.file;
    const ext = path.extname(file.originalname).toLowerCase();
    
    // 1. Check extension
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return res.status(400).json({
        success: false,
        message: 'File không được hỗ trợ'
      });
    }
    
    // 2. Check MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'File không hợp lệ'
      });
    }
    
    // 3. Check file signature (magic bytes)
    const buffer = await fs.readFile(file.path);
    const signature = buffer.toString('hex', 0, 4);
    
    const isValid = validateFileSignature(signature, ext);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'File bị lỗi hoặc giả mạo'
      });
    }
    
    next();
  } catch (error) {
    console.error('File validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi kiểm tra file'
    });
  }
};

const validateFileSignature = (signature, ext) => {
  const signatures = {
    '.pdf': ['25504446'],
    '.jpg': ['ffd8ffe0', 'ffd8ffe1'],
    '.jpeg': ['ffd8ffe0', 'ffd8ffe1'],
    '.png': ['89504e47']
  };
  
  const validSignatures = signatures[ext];
  if (!validSignatures) return true; // Skip for .doc, .docx
  
  return validSignatures.some(sig => signature.startsWith(sig));
};
```

### 6.3. Input Sanitization

```javascript
// backend/middleware/inputSanitizer.js

import validator from 'validator';

export const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        // Escape HTML
        obj[key] = validator.escape(obj[key]);
        
        // Trim whitespace
        obj[key] = obj[key].trim();
        
        // Check for script tags
        if (/<script|javascript:/i.test(obj[key])) {
          return res.status(400).json({
            success: false,
            message: 'Dữ liệu không hợp lệ'
          });
        }
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
  };
  
  sanitize(req.body);
  next();
};
```

### 6.4. CSRF Protection

```javascript
// backend/middleware/csrfProtection.js

import csrf from 'csurf';

export const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

// Route to get CSRF token
export const getCsrfToken = (req, res) => {
  res.json({
    success: true,
    csrfToken: req.csrfToken()
  });
};
```

---

## 7. Error Handling Strategy

### 7.1. Frontend Error Handling

```javascript
// frontend/src/utils/errorHandler.js

export const handleApiError = (error, setErrors) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        setErrors({ 
          submit: data.message || 'Dữ liệu không hợp lệ' 
        });
        break;
      case 403:
        setErrors({ 
          submit: 'Phiên làm việc đã hết hạn. Vui lòng tải lại trang' 
        });
        break;
      case 429:
        setErrors({ 
          submit: 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau' 
        });
        break;
      case 500:
        setErrors({ 
          submit: 'Lỗi server. Vui lòng thử lại sau' 
        });
        break;
      default:
        setErrors({ 
          submit: data.message || 'Có lỗi xảy ra' 
        });
    }
  } else if (error.request) {
    // Request made but no response
    setErrors({ 
      submit: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng' 
    });
  } else {
    // Something else happened
    setErrors({ 
      submit: error.message || 'Có lỗi xảy ra' 
    });
  }
};
```

### 7.2. Backend Error Handling

```javascript
// backend/middleware/errorHandler.js

export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // CSRF error
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({
      success: false,
      message: 'Token bảo mật không hợp lệ'
    });
  }
  
  // Validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  // Database error
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      message: 'Dữ liệu đã tồn tại'
    });
  }
  
  // Default error
  return res.status(500).json({
    success: false,
    message: 'Lỗi server. Vui lòng thử lại sau'
  });
};
```

---

## 8. Testing Strategy

### 8.1. Unit Tests

**Frontend:**
- Validation functions
- Formatters (số tiền, phone, email)
- Custom hooks logic

**Backend:**
- Model methods
- Validation middleware
- Sanitization functions

### 8.2. Integration Tests

**API Tests:**
- POST /api/donations/public (4 scenarios)
- POST /api/donations/propose-program
- File upload flow

**Database Tests:**
- Transaction rollback on error
- Foreign key constraints
- Data integrity

### 8.3. E2E Tests

**User Flows:**
- TC1: Complete donation to Quỹ Mẹ
- TC2: Complete donation to Quỹ Thành phần
- TC3: Complete donation to Program
- TC4: Complete proposal submission
- Error scenarios (invalid input, network error)

---

## 9. Deployment Considerations

### 9.1. Environment Variables

```env
# Backend .env
NODE_ENV=production
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=secret
DB_NAME=tvu_fund

# File upload
UPLOAD_DIR=/var/www/uploads
MAX_FILE_SIZE=10485760

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@tvu.edu.vn
SMTP_PASS=secret

# Security
CSRF_SECRET=random_secret_key
RATE_LIMIT_WINDOW_MS=600000
RATE_LIMIT_MAX=5
```

### 9.2. Performance Optimization

**Frontend:**
- Code splitting by route
- Lazy load ProgramProposalForm
- Memoize expensive computations
- Debounce form validation

**Backend:**
- Database connection pooling
- Redis cache for funds list
- CDN for static files
- Gzip compression

---

## 10. Maintenance & Monitoring

### 10.1. Logging

```javascript
// Log all donation/proposal creations
logger.info('Donation created', {
  khoanTaiTroId,
  nhaTaiTroId,
  amount: soTien,
  fundId: quyId,
  timestamp: new Date()
});

// Log errors
logger.error('Donation creation failed', {
  error: err.message,
  stack: err.stack,
  requestBody: req.body
});
```

### 10.2. Monitoring Metrics

- Số lượng đơn tài trợ/ngày
- Tỷ lệ đề xuất chương trình
- Success rate của API calls
- Average response time
- File upload errors
- Rate limit violations

---

**Tài liệu này cung cấp blueprint đầy đủ để implement feature. Tiếp theo sẽ là tasks.md với danh sách công việc cụ thể.**
