# KẾ HOẠCH: SỬA ĐIỀU KIỆN HIỂN THỊ SECTIONS TRONG PROFILE PAGE

## Ngày lập: 05/01/2027

---

## 🎯 MỤC TIÊU

Thay đổi điều kiện hiển thị các sections trong profile page từ kiểm tra `loaitaikhoan` sang kiểm tra `vaitro_id = 4` để đảm bảo:
- ✅ Sinh viên (loaitaikhoan = 'SINH_VIEN') → Thấy sections
- ✅ Cán bộ (loaitaikhoan = 'CAN_BO') → Thấy sections
- ✅ **Nhà khoa học (loaitaikhoan = 'NHA_KHOA_HOC')** → Thấy sections (FIX)
- ❌ Nhà tài trợ (loaitaikhoan = 'NHA_TAI_TRO') → KHÔNG thấy sections

---

## 🔍 PHÂN TÍCH VẤN ĐỀ

### **Điều kiện hiện tại (SAI):**

**File:** `frontend/src/pages/User/Student/ProfilePage/student/StudentProfile.jsx`

**Line 36-37:**
```javascript
const userType = user?.loai_tai_khoan || user?.loaiTaiKhoan || user?.loai_nguoi_dung;
const isSinhVien = userType === 'SINH_VIEN' || userType === 'CAN_BO';
```

**Line 40-44:**
```javascript
useEffect(() => {
  if (isSinhVien) {
    fetchBankAccounts();
    fetchApplicationOverview();
  }
}, [isSinhVien]);
```

**Line 162-179:**
```jsx
{isSinhVien && (
  <>
    <BankAccountSection
      bankAccounts={bankAccounts}
      onAdd={handleAddBankAccount}
      onDelete={handleDeleteBankAccount}
      onSetDefault={handleSetDefaultBankAccount}
      loading={bankAccountsLoading}
    />

    <StudentOverviewSection
      soHoSoDaNop={profileOverview.soHoSoDaNop}
      soTaiKhoanNH={profileOverview.soTaiKhoanNH}
      diemTinNhiem={profileOverview.diemTinNhiem}
    />

    <ApplicationHistorySection />
  </>
)}
```

### **Vấn đề:**
1. ❌ Điều kiện `userType === 'SINH_VIEN' || userType === 'CAN_BO'` không bao gồm `'NHA_KHOA_HOC'`
2. ❌ Nhà khoa học (vaitro_id = 4) không thấy được các sections:
   - BankAccountSection (tài khoản ngân hàng)
   - StudentOverviewSection (tổng quan hồ sơ)
   - ApplicationHistorySection (lịch sử yêu cầu)

### **Giải pháp:**
Thay đổi điều kiện từ kiểm tra `loaitaikhoan` sang kiểm tra `vaitro_id = 4`

---

## 📋 MAPPING VAI TRÒ VÀ LOẠI TÀI KHOẢN

| vaitro_id | Loại tài khoản | Có thấy sections? | Ghi chú |
|-----------|----------------|-------------------|---------|
| 1 | CAN_BO (Admin) | ❌ Không | Vai trò quản trị |
| 2 | CAN_BO (Kế toán) | ❌ Không | Vai trò quản lý tài chính |
| 3 | CAN_BO (Giáo vụ) | ❌ Không | Vai trò quản lý sinh viên |
| 4 | SINH_VIEN | ✅ Có | Sinh viên nộp hồ sơ |
| 4 | CAN_BO | ✅ Có | Cán bộ nộp hồ sơ |
| 4 | NHA_KHOA_HOC | ✅ Có | Nhà khoa học nộp hồ sơ (FIX) |
| 4 | NHA_TAI_TRO | ❌ Không | Nhà tài trợ không nộp hồ sơ |

**Lưu ý quan trọng:**
- `vaitro_id = 4` bao gồm 4 loại: SINH_VIEN, CAN_BO, NHA_KHOA_HOC, NHA_TAI_TRO
- Chỉ có NHA_TAI_TRO là không cần thấy sections (họ dùng DonorProfile)
- 3 loại còn lại (SINH_VIEN, CAN_BO, NHA_KHOA_HOC) đều cần thấy sections

---

## 🛠️ GIẢI PHÁP ĐỀ XUẤT

### **Option 1: Kiểm tra vaitro_id = 4 VÀ loaitaikhoan ≠ NHA_TAI_TRO (KHUYẾN NGHỊ)**

**Ưu điểm:**
- ✅ An toàn, tránh nhầm lẫn với các vai trò khác (1, 2, 3)
- ✅ Rõ ràng: "Là vai trò 4 NHƯNG không phải nhà tài trợ"
- ✅ Dễ maintain: Nếu thêm loại tài khoản mới với vaitro_id = 4, tự động thấy sections

**Nhược điểm:**
- ⚠️ Phải kiểm tra 2 điều kiện

**Code:**
```javascript
const vaitro = user?.vaiTro || user?.vai_tro || user?.vaitro_id;
const userType = user?.loai_tai_khoan || user?.loaiTaiKhoan;

const canViewSections = vaitro === 4 && userType !== 'NHA_TAI_TRO';
```

---

### **Option 2: Kiểm tra loaitaikhoan IN ['SINH_VIEN', 'CAN_BO', 'NHA_KHOA_HOC']**

**Ưu điểm:**
- ✅ Rõ ràng, liệt kê từng loại
- ✅ Không phụ thuộc vào vaitro_id

**Nhược điểm:**
- ❌ Phải cập nhật list mỗi khi thêm loại tài khoản mới
- ❌ Dễ quên (như hiện tại đã quên NHA_KHOA_HOC)

**Code:**
```javascript
const userType = user?.loai_tai_khoan || user?.loaiTaiKhoan;
const canViewSections = ['SINH_VIEN', 'CAN_BO', 'NHA_KHOA_HOC'].includes(userType);
```

---

### **Option 3: Kiểm tra vaitro_id = 4 (KHÔNG KHUYẾN NGHỊ)**

**Ưu điểm:**
- ✅ Ngắn gọn nhất
- ✅ Tự động cover tất cả loại tài khoản mới với vaitro_id = 4

**Nhược điểm:**
- ❌ NHA_TAI_TRO cũng có vaitro_id = 4 → Sẽ thấy sections (SAI)
- ❌ Phải handle riêng cho NHA_TAI_TRO

**Code:**
```javascript
const vaitro = user?.vaiTro || user?.vai_tro || user?.vaitro_id;
const canViewSections = vaitro === 4;
```

---

## ✅ QUYẾT ĐỊNH: SỬ DỤNG OPTION 1

**Lý do:**
1. An toàn và rõ ràng nhất
2. Tránh nhầm lẫn với NHA_TAI_TRO
3. Dễ hiểu cho developer khác
4. Tự động support loại tài khoản mới trong tương lai

---

## 📝 DANH SÁCH THAY ĐỔI

### **File cần sửa:**

#### **1. StudentProfile.jsx**
**Path:** `frontend/src/pages/User/Student/ProfilePage/student/StudentProfile.jsx`

**Thay đổi 1: Cập nhật điều kiện (Line 36-37)**
```javascript
// TRƯỚC:
const userType = user?.loai_tai_khoan || user?.loaiTaiKhoan || user?.loai_nguoi_dung;
const isSinhVien = userType === 'SINH_VIEN' || userType === 'CAN_BO';

// SAU:
const vaitro = user?.vaiTro || user?.vai_tro || user?.vaitro_id;
const userType = user?.loai_tai_khoan || user?.loaiTaiKhoan || user?.loai_nguoi_dung;
const canViewSections = vaitro === 4 && userType !== 'NHA_TAI_TRO';
```

**Thay đổi 2: Update useEffect dependency (Line 40)**
```javascript
// TRƯỚC:
useEffect(() => {
  if (isSinhVien) {
    fetchBankAccounts();
    fetchApplicationOverview();
  }
}, [isSinhVien]);

// SAU:
useEffect(() => {
  if (canViewSections) {
    fetchBankAccounts();
    fetchApplicationOverview();
  }
}, [canViewSections]);
```

**Thay đổi 3: Update JSX condition (Line 162)**
```javascript
// TRƯỚC:
{isSinhVien && (
  <>
    <BankAccountSection ... />
    <StudentOverviewSection ... />
    <ApplicationHistorySection />
  </>
)}

// SAU:
{canViewSections && (
  <>
    <BankAccountSection ... />
    <StudentOverviewSection ... />
    <ApplicationHistorySection />
  </>
)}
```

---

## 🧪 TEST CASES

### **Test Case 1: Sinh viên (vaitro_id = 4, loaitaikhoan = 'SINH_VIEN')**
- **Kỳ vọng:** ✅ Thấy 3 sections (Bank, Overview, History)
- **Cách test:**
  1. Đăng nhập bằng tài khoản sinh viên
  2. Vào trang Profile
  3. Verify: Hiển thị đầy đủ 3 sections

### **Test Case 2: Cán bộ (vaitro_id = 4, loaitaikhoan = 'CAN_BO')**
- **Kỳ vọng:** ✅ Thấy 3 sections
- **Cách test:**
  1. Đăng nhập bằng tài khoản cán bộ (vai trò 4)
  2. Vào trang Profile
  3. Verify: Hiển thị đầy đủ 3 sections

### **Test Case 3: Nhà khoa học (vaitro_id = 4, loaitaikhoan = 'NHA_KHOA_HOC') - FIX**
- **Kỳ vọng:** ✅ Thấy 3 sections (HIỆN TẠI BỊ THIẾU)
- **Cách test:**
  1. Đăng ký tài khoản nhà khoa học mới
  2. Đăng nhập
  3. Vào trang Profile
  4. Verify: Hiển thị đầy đủ 3 sections

### **Test Case 4: Nhà tài trợ (vaitro_id = 4, loaitaikhoan = 'NHA_TAI_TRO')**
- **Kỳ vọng:** ❌ KHÔNG thấy 3 sections (dùng DonorProfile)
- **Cách test:**
  1. Đăng nhập bằng tài khoản nhà tài trợ
  2. Vào trang Profile
  3. Verify: Hiển thị DonorProfile, KHÔNG có Bank/Overview/History sections

### **Test Case 5: Admin (vaitro_id = 1)**
- **Kỳ vọng:** ❌ KHÔNG thấy sections (vai trò quản trị)
- **Cách test:**
  1. Đăng nhập admin
  2. Vào trang Profile
  3. Verify: KHÔNG hiển thị 3 sections

### **Test Case 6: Kế toán (vaitro_id = 2)**
- **Kỳ vọng:** ❌ KHÔNG thấy sections
- **Cách test:** Tương tự Test Case 5

### **Test Case 7: Giáo vụ (vaitro_id = 3)**
- **Kỳ vọng:** ❌ KHÔNG thấy sections
- **Cách test:** Tương tự Test Case 5

---

## 📊 IMPACT ANALYSIS

### **Files bị ảnh hưởng:**
1. ✅ `StudentProfile.jsx` - Thay đổi điều kiện hiển thị

### **Components bị ảnh hưởng:**
1. ✅ `BankAccountSection` - Chỉ hiển thị khi `canViewSections = true`
2. ✅ `StudentOverviewSection` - Chỉ hiển thị khi `canViewSections = true`
3. ✅ `ApplicationHistorySection` - Chỉ hiển thị khi `canViewSections = true`

### **API calls bị ảnh hưởng:**
1. ✅ `bankAccountService.getAll()` - Chỉ gọi khi `canViewSections = true`
2. ✅ `applicationService.getMyApplications()` - Chỉ gọi khi `canViewSections = true`

### **User experience:**
- ✅ Nhà khoa học giờ có thể:
  - Thêm/xóa tài khoản ngân hàng
  - Xem tổng quan hồ sơ (số hồ sơ đã nộp, số tài khoản NH)
  - Xem lịch sử yêu cầu hỗ trợ của mình

---

## ⚠️ RỦI RO & GIẢI PHÁP

### **Rủi ro 1: User object không có vaitro_id**
- **Khả năng:** Thấp (đã có trong user object từ API)
- **Giải pháp:** Fallback đến các tên khác: `user?.vaiTro || user?.vai_tro || user?.vaitro_id`
- **Test:** Log user object để verify

### **Rủi ro 2: User object không có loaitaikhoan**
- **Khả năng:** Thấp
- **Giải pháp:** Fallback: `user?.loai_tai_khoan || user?.loaiTaiKhoan`
- **Test:** Log user object để verify

### **Rủi ro 3: NHA_TAI_TRO vẫn thấy sections**
- **Khả năng:** Thấp (đã có check `userType !== 'NHA_TAI_TRO'`)
- **Giải pháp:** Test kỹ với tài khoản nhà tài trợ
- **Test:** Test Case 4

---

## 📌 LƯU Ý QUAN TRỌNG

1. **Tên biến:** Đổi từ `isSinhVien` sang `canViewSections` để rõ nghĩa hơn
2. **Comment:** Thêm comment giải thích logic mới
3. **Backward compatible:** Không làm thay đổi behavior của SINH_VIEN và CAN_BO
4. **Forward compatible:** Nếu thêm loại tài khoản mới với vaitro_id = 4 (không phải NHA_TAI_TRO), tự động thấy sections

---

## 🚀 BƯỚC THỰC HIỆN

1. ✅ Đọc và hiểu file StudentProfile.jsx
2. ✅ Backup code cũ (Git)
3. ⏳ Thay đổi điều kiện từ `isSinhVien` sang `canViewSections`
4. ⏳ Thêm comment giải thích
5. ⏳ Test với 7 test cases ở trên
6. ⏳ Verify không có regression
7. ⏳ Commit changes với message rõ ràng

---

## 📄 COMMIT MESSAGE ĐỀ XUẤT

```
fix: Update profile sections visibility to use vaitro_id instead of loaitaikhoan

- Change condition from loaitaikhoan check to vaitro_id = 4
- Include NHA_KHOA_HOC (scientist) in sections visibility
- Exclude NHA_TAI_TRO (donor) from sections visibility
- Rename isSinhVien to canViewSections for clarity
- Affected sections: BankAccount, StudentOverview, ApplicationHistory

Fixes: Nhà khoa học không thấy được sections trong profile page
```

---

**Trạng thái: ⏳ CHỜ PHÊ DUYỆT**  
**Người lập kế hoạch: Kiro AI**  
**Ngày: 05/01/2027**
