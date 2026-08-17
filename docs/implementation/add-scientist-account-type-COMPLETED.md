# THÊM TAB "NHÀ KHOA HỌC" VÀO FORM ĐĂNG KÝ

## Ngày thực hiện: 05/01/2027

---

## 📋 TÓM TẮT

Đã thêm thành công loại tài khoản **"Nhà khoa học"** (`nhakhoahoc`) vào hệ thống đăng ký, bao gồm cả backend API và frontend UI.

---

## 🎯 YÊU CẦU

1. ✅ Thêm tab "Nhà khoa học" vào form đăng ký
2. ✅ Vai trò mặc định: `vaitro_id = 4` (giống Cán bộ)
3. ✅ Số điện thoại: BẮT BUỘC
4. ✅ Icon: `HiOutlineBeaker` (bình thí nghiệm)
5. ✅ Backend hỗ trợ `loaiTaiKhoan: 'nhakhoahoc'`

---

## 📝 CÁC THAY ĐỔI

### **1. BACKEND - authController.js**

**File:** `backend/controllers/auth/authController.js`

#### **A. Thêm validation cho loại tài khoản mới (Line ~66)**
```javascript
// Trước:
if (!loaiTaiKhoan || !['sinhvien', 'nhataitro', 'canbo'].includes(loaiTaiKhoan))

// Sau:
if (!loaiTaiKhoan || !['sinhvien', 'nhataitro', 'canbo', 'nhakhoahoc'].includes(loaiTaiKhoan))
```

#### **B. Thêm validation dữ liệu cho nhà khoa học (Line ~73)**
```javascript
} else if (loaiTaiKhoan === 'canbo' || loaiTaiKhoan === 'nhakhoahoc') {
  if (!hoTen || !email || !password || !soDienThoai) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng nhập đầy đủ thông tin: họ tên, email, số điện thoại, mật khẩu",
    });
  }
}
```

#### **C. Cập nhật logic chuẩn bị userData (Line ~127)**
```javascript
const userData = {
  hoTen: loaiTaiKhoan === 'sinhvien' ? hoTen.trim() : 
         (loaiTaiKhoan === 'canbo' || loaiTaiKhoan === 'nhakhoahoc' ? hoTen.trim() : tenToChuc.trim()),
  
  maSoDinhDanh: loaiTaiKhoan === 'sinhvien' ? mssv.trim() : 
                (loaiTaiKhoan === 'canbo' ? `CB${Date.now()}` : 
                (loaiTaiKhoan === 'nhakhoahoc' ? `NKH${Date.now()}` : `NTT${Date.now()}`)),
  
  loaiTaiKhoan: loaiTaiKhoan === 'sinhvien' ? 'SINH_VIEN' : 
                (loaiTaiKhoan === 'canbo' ? 'CAN_BO' : 
                (loaiTaiKhoan === 'nhakhoahoc' ? 'NHA_KHOA_HOC' : 'NHA_TAI_TRO')),
  
  tinhTrangCongTac: (loaiTaiKhoan === 'canbo' || loaiTaiKhoan === 'nhakhoahoc') ? 
                    (tinhTrangCongTac || 'Dang cong tac') : null,
  
  donViCongTac: (loaiTaiKhoan === 'canbo' || loaiTaiKhoan === 'nhakhoahoc') ? 
                (donViCongTac || null) : null,
  
  roleId: 4, // Vai trò 4 cho tất cả (theo yêu cầu)
  // ... các fields khác
};
```

#### **D. Cập nhật log message (Line ~180)**
```javascript
mo_ta: `Đăng ký tài khoản ${
  loaiTaiKhoan === "nhataitro" ? "nhà tài trợ" : 
  (loaiTaiKhoan === "nhakhoahoc" ? "nhà khoa học" : 
  (loaiTaiKhoan === "canbo" ? "cán bộ" : "sinh viên"))
} thành công`
```

---

### **2. FRONTEND - RegisterForm.jsx**

**File:** `frontend/src/components/forms/RegisterForm/RegisterForm.jsx`

#### **A. Import icon mới (Line ~13)**
```javascript
import { 
  HiOutlineUser, 
  HiOutlineIdentification, 
  HiOutlineAcademicCap,
  HiOutlineEnvelope,
  HiOutlineLockClosed,
  HiOutlineBuildingOffice,
  HiOutlinePhone,
  HiOutlineChevronDown,
  HiOutlineBriefcase,
  HiOutlineBeaker  // ← Icon mới
} from 'react-icons/hi2';
```

#### **B. Thêm state cho Nhà khoa học (Line ~54)**
```javascript
// Form state cho Nhà khoa học
const [scientistForm, setScientistForm] = useState({
  hoTen: '',
  email: '',
  soDienThoai: '',      // BẮT BUỘC
  donViCongTac: '',
  tinhTrangCongTac: 'Dang cong tac',
  password: ''
});
```

#### **C. Thêm handler (Line ~119)**
```javascript
// Handle input change - Nhà khoa học
const handleScientistChange = (field) => (e) => {
  setScientistForm(prev => ({ ...prev, [field]: e.target.value }));
  if (errors[field]) {
    setErrors(prev => ({ ...prev, [field]: '' }));
  }
};
```

#### **D. Thêm validation function (Line ~220)**
```javascript
// Validate Nhà khoa học form
const validateScientistForm = () => {
  const newErrors = {};

  if (!scientistForm.hoTen.trim()) {
    newErrors.hoTen = 'Vui lòng nhập họ và tên';
  }

  if (!scientistForm.email.trim()) {
    newErrors.email = 'Vui lòng nhập email';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(scientistForm.email)) {
    newErrors.email = 'Email không hợp lệ';
  }

  if (!scientistForm.soDienThoai.trim()) {
    newErrors.soDienThoai = 'Vui lòng nhập số điện thoại';
  } else if (!/^[0-9]{10,11}$/.test(scientistForm.soDienThoai)) {
    newErrors.soDienThoai = 'Số điện thoại không hợp lệ';
  }

  if (!scientistForm.donViCongTac.trim()) {
    newErrors.donViCongTac = 'Vui lòng nhập đơn vị công tác';
  }

  if (!scientistForm.password) {
    newErrors.password = 'Vui lòng nhập mật khẩu';
  } else if (scientistForm.password.length < 8) {
    newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

#### **E. Update handleSubmit (Line ~261)**
```javascript
// Validate based on active tab
let isValid;
if (activeTab === 'sinhvien') {
  isValid = validateStudentForm();
} else if (activeTab === 'nhataitro') {
  isValid = validateSponsorForm();
} else if (activeTab === 'nhakhoahoc') {
  isValid = validateScientistForm();  // ← Thêm dòng này
} else {
  isValid = validateStaffForm();
}

// ... trong phần prepare data:
} else if (activeTab === 'nhakhoahoc') {
  data = {
    hoTen: scientistForm.hoTen,
    email: scientistForm.email,
    soDienThoai: scientistForm.soDienThoai,
    password: scientistForm.password,
    donViCongTac: scientistForm.donViCongTac,
    tinhTrangCongTac: scientistForm.tinhTrangCongTac,
    loaiTaiKhoan: 'nhakhoahoc'
  };
}
```

#### **F. Thêm tab button (Line ~398)**
```javascript
<button
  type="button"
  className={`register-form-tab ${activeTab === 'nhakhoahoc' ? 'register-form-tab-active' : ''}`}
  onClick={() => handleTabChange('nhakhoahoc')}
>
  Nhà khoa học
</button>
```

#### **G. Thêm form section (Line ~765)**
```javascript
{/* Form Nhà khoa học */}
{activeTab === 'nhakhoahoc' && (
  <div className="register-form">
    {/* Họ và tên */}
    <div className="register-form-field">
      <label className="register-form-label">HỌ VÀ TÊN</label>
      <div className={`register-form-input-wrapper ${errors.hoTen ? 'register-form-input-error' : ''}`}>
        <HiOutlineUser className="register-form-icon-left" />
        <input
          type="text"
          className="register-form-input"
          placeholder="Nhập đầy đủ họ và tên..."
          value={scientistForm.hoTen}
          onChange={handleScientistChange('hoTen')}
        />
      </div>
      {errors.hoTen && <span className="register-form-error-text">{errors.hoTen}</span>}
    </div>

    {/* Email */}
    <div className="register-form-field">
      <label className="register-form-label">EMAIL</label>
      <div className={`register-form-input-wrapper ${errors.email ? 'register-form-input-error' : ''}`}>
        <HiOutlineEnvelope className="register-form-icon-left" />
        <input
          type="email"
          className="register-form-input"
          placeholder="Email công việc hoặc email cá nhân..."
          value={scientistForm.email}
          onChange={handleScientistChange('email')}
        />
      </div>
      {errors.email && <span className="register-form-error-text">{errors.email}</span>}
      {!errors.email && scientistForm.email && !validateTVUEmail(scientistForm.email) && (
        <span className="register-form-hint-text">💡 Khuyến nghị dùng email TVU để xác thực nhanh hơn</span>
      )}
    </div>

    {/* Số điện thoại - BẮT BUỘC */}
    <div className="register-form-field">
      <label className="register-form-label">SỐ ĐIỆN THOẠI</label>
      <div className={`register-form-input-wrapper ${errors.soDienThoai ? 'register-form-input-error' : ''}`}>
        <HiOutlinePhone className="register-form-icon-left" />
        <input
          type="tel"
          className="register-form-input"
          placeholder="Số điện thoại liên hệ..."
          value={scientistForm.soDienThoai}
          onChange={handleScientistChange('soDienThoai')}
        />
      </div>
      {errors.soDienThoai && <span className="register-form-error-text">{errors.soDienThoai}</span>}
    </div>

    {/* Đơn vị công tác */}
    <div className="register-form-field">
      <label className="register-form-label">ĐƠN VỊ CÔNG TÁC / NGHIÊN CỨU</label>
      <div className={`register-form-input-wrapper ${errors.donViCongTac ? 'register-form-input-error' : ''}`}>
        <HiOutlineBeaker className="register-form-icon-left" />
        <input
          type="text"
          className="register-form-input"
          placeholder="Viện/Trung tâm nghiên cứu/Phòng thí nghiệm..."
          value={scientistForm.donViCongTac}
          onChange={handleScientistChange('donViCongTac')}
        />
      </div>
      {errors.donViCongTac && <span className="register-form-error-text">{errors.donViCongTac}</span>}
    </div>

    {/* Tình trạng công tác */}
    <div className="register-form-field">
      <label className="register-form-label">TÌNH TRẠNG CÔNG TÁC</label>
      <div className="register-form-input-wrapper register-form-select-wrapper">
        <select
          className="register-form-select"
          value={scientistForm.tinhTrangCongTac}
          onChange={handleScientistChange('tinhTrangCongTac')}
        >
          <option value="Dang cong tac">Đang công tác</option>
          <option value="Da nghi huu">Đã nghỉ hưu</option>
        </select>
        <HiOutlineChevronDown className="register-form-select-icon" />
      </div>
    </div>

    {/* Mật khẩu */}
    <div className="register-form-field">
      <label className="register-form-label">MẬT KHẨU</label>
      <div className={`register-form-input-wrapper ${errors.password ? 'register-form-input-error' : ''}`}>
        <HiOutlineLockClosed className="register-form-icon-left" />
        <input
          type={showPassword ? 'text' : 'password'}
          className="register-form-input register-form-input-password"
          placeholder="Tối thiểu 8 ký tự..."
          value={scientistForm.password}
          onChange={handleScientistChange('password')}
        />
        <button
          type="button"
          className="register-form-password-toggle"
          onClick={() => setShowPassword(!showPassword)}
        >
          {/* Show/hide password icons */}
        </button>
      </div>
      {errors.password && <span className="register-form-error-text">{errors.password}</span>}
    </div>
  </div>
)}
```

---

## 📊 CẤU TRÚC DỮ LIỆU

### **API Request Payload (POST /api/auth/register)**

```javascript
{
  loaiTaiKhoan: 'nhakhoahoc',
  hoTen: 'Nguyễn Văn A',
  email: 'nguyenvana@tvu.edu.vn',
  soDienThoai: '0901234567',          // BẮT BUỘC
  donViCongTac: 'Viện Nghiên cứu AI',
  tinhTrangCongTac: 'Dang cong tac',  // 'Dang cong tac' | 'Da nghi huu'
  password: '12345678'
}
```

### **Database Record**

```sql
INSERT INTO nguoidung (
  hoten,
  masodinhdanh,
  email,
  matkhau,
  sodienthoai,
  donvicongtac,
  tinhtrangcongtac,
  vaitro_id,
  loaitaikhoan,
  trangthai
) VALUES (
  'Nguyễn Văn A',
  'NKH1736070123456',              -- Prefix: NKH + timestamp
  'nguyenvana@tvu.edu.vn',
  '$2b$10$...hashed...',
  '0901234567',
  'Viện Nghiên cứu AI',
  'Dang cong tac',
  4,                                -- Vai trò 4
  'Nha khoa hoc',                   -- Enum value trong DB
  'Hoat dong'
);
```

---

## ✅ CHECKLIST HOÀN THÀNH

- [x] Backend hỗ trợ `loaiTaiKhoan: 'nhakhoahoc'`
- [x] Backend validation đầy đủ
- [x] Backend map đúng sang `loaitaikhoan = 'NHA_KHOA_HOC'`
- [x] Backend tạo `maSoDinhDanh` với prefix `NKH`
- [x] Backend gán đúng `vaitro_id = 4`
- [x] Frontend thêm tab "Nhà khoa học"
- [x] Frontend thêm scientistForm state
- [x] Frontend thêm validation function
- [x] Frontend thêm form UI với đầy đủ fields
- [x] Frontend sử dụng icon HiOutlineBeaker
- [x] Số điện thoại là BẮT BUỘC
- [x] Tình trạng công tác: Đang công tác / Đã nghỉ hưu
- [x] Password toggle show/hide
- [x] Email TVU hint (optional)
- [x] Error handling đầy đủ

---

## 🧪 TESTING MANUAL

### **Test Case 1: Đăng ký thành công**
1. Mở trang đăng ký
2. Click tab "Nhà khoa học"
3. Nhập đầy đủ thông tin:
   - Họ tên: Nguyễn Văn A
   - Email: test@tvu.edu.vn
   - SĐT: 0901234567
   - Đơn vị: Viện AI
   - Tình trạng: Đang công tác
   - Mật khẩu: 12345678
4. Click "ĐĂNG KÝ NGAY"
5. ✅ Kỳ vọng: Toast success, redirect to /profile

### **Test Case 2: Validation errors**
1. Click tab "Nhà khoa học"
2. Bỏ trống các fields
3. Click "ĐĂNG KÝ NGAY"
4. ✅ Kỳ vọng: Hiển thị errors cho tất cả fields bắt buộc

### **Test Case 3: Email đã tồn tại**
1. Nhập email đã được đăng ký
2. ✅ Kỳ vọng: Backend trả về error 409, toast "Email đã được sử dụng"

### **Test Case 4: SĐT không hợp lệ**
1. Nhập SĐT < 10 số hoặc > 11 số
2. ✅ Kỳ vọng: Error "Số điện thoại không hợp lệ"

---

## 📌 LƯU Ý

1. **Database enum value**: `'Nha khoa hoc'` (có dấu cách, viết thường)
2. **Backend constant**: `'NHA_KHOA_HOC'` (underscore, in hoa)
3. **Frontend loaiTaiKhoan**: `'nhakhoahoc'` (lowercase, không dấu cách)
4. **Prefix mã định danh**: `NKH` (Nhà Khoa Học)
5. **Vai trò mặc định**: `4` (không phải vai trò riêng)
6. **Số điện thoại**: BẮT BUỘC (khác với Cán bộ là optional)

---

## 🔗 FILES LIÊN QUAN

- `backend/controllers/auth/authController.js` - API register logic
- `frontend/src/components/forms/RegisterForm/RegisterForm.jsx` - Form UI
- `docs/database/backup_from_aiven.sql` - Database schema (enum values)

---

**Trạng thái: ✅ HOÀN THÀNH**  
**Người thực hiện: Kiro AI**  
**Ngày: 05/01/2027**
