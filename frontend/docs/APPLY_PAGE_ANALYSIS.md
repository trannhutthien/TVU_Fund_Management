# ApplyPage Analysis & Recommendations

## Tổng quan hiện tại

ApplyPage hiện tại hỗ trợ **2 luồng**:
1. **Sinh viên** (SINH_VIEN): Nộp đơn xin hỗ trợ - 4 bước
2. **Nhà tài trợ** (NHA_TAI_TRO): Quyên góp cho quỹ - 2 bước

## Cấu trúc Sections hiện tại

### Sinh viên (4 bước):

```
Step 1: FundSelectSection
├── Chọn quỹ muốn xin hỗ trợ
└── Hiển thị thông tin quỹ (số tiền min/max, mô tả)

Step 2: RequestContentSection
├── Tiêu đề đơn (min 10 ký tự)
├── Mô tả lý do (min 50 ký tự)
├── Số tiền yêu cầu (trong khoảng min/max của quỹ)
└── AI Sidebar (gợi ý nội dung)

Step 3: BankInfoSection
├── Chọn tài khoản ngân hàng (từ danh sách đã lưu)
├── Số điện thoại liên hệ
└── Link đến ProfilePage để thêm tài khoản mới

Step 4: DocumentSection
├── Upload file minh chứng (PDF, JPG, PNG)
├── Preview file
└── Xóa file

Footer: ApplicationFooter
├── Lưu nháp
├── Làm mới
└── Nộp đơn
```

### Nhà tài trợ (2 bước):

```
Step 1: FundSelectSection
├── Chọn quỹ muốn quyên góp
└── Hiển thị thông tin quỹ

Step 2: DocumentSection
├── Upload minh chứng chuyển khoản
└── Preview file

Footer: ApplicationFooter
├── Làm mới
└── Quyên góp
```

## Vấn đề: Thiếu thông tin tài khoản nhà trường

### Hiện tại:
- ❌ Nhà tài trợ **KHÔNG biết** chuyển tiền vào tài khoản nào
- ❌ Không có thông tin: Số TK, Tên ngân hàng, Chủ TK, Nội dung CK
- ❌ Nhà tài trợ phải tự tìm hoặc liên hệ

### Cần có:
```
Thông tin tài khoản nhận quyên góp:
├── Số tài khoản: 1234567890
├── Tên ngân hàng: Vietcombank - Chi nhánh Trà Vinh
├── Chủ tài khoản: TRƯỜNG ĐẠI HỌC TRÀ VINH
├── Nội dung chuyển khoản: [Tên quỹ] - [Họ tên NTT]
└── QR Code (optional): Quét để chuyển nhanh
```

## Đề xuất: Thêm SchoolBankInfoSection

### Vị trí:
- **Nhà tài trợ**: Giữa Step 1 (FundSelectSection) và Step 2 (DocumentSection)
- **Sinh viên**: Không cần (sinh viên không chuyển tiền)

### Nội dung:

```jsx
<SchoolBankInfoSection
  selectedFund={selectedFund}
  donorName={user?.hoTen}
/>
```

**Hiển thị:**
```
┌─────────────────────────────────────────────┐
│ 🏦 THÔNG TIN CHUYỂN KHOẢN                   │
├─────────────────────────────────────────────┤
│                                             │
│ Quỹ: [Tên quỹ đã chọn]                     │
│                                             │
│ Số tài khoản:                               │
│ ┌─────────────────────────────────────┐    │
│ │ 1234567890                    [Copy]│    │
│ └─────────────────────────────────────┘    │
│                                             │
│ Ngân hàng: Vietcombank - CN Trà Vinh       │
│ Chủ tài khoản: TRƯỜNG ĐẠI HỌC TRÀ VINH     │
│                                             │
│ Nội dung chuyển khoản:                      │
│ ┌─────────────────────────────────────┐    │
│ │ QUY HOC BONG - NGUYEN VAN A   [Copy]│    │
│ └─────────────────────────────────────┘    │
│                                             │
│ ⚠️ Lưu ý:                                   │
│ • Vui lòng ghi đúng nội dung chuyển khoản   │
│ • Sau khi chuyển, upload ảnh minh chứng     │
│                                             │
│        [QR Code]                            │
│     Quét để chuyển                          │
└─────────────────────────────────────────────┘
```

## Câu hỏi: Lưu cứng hay lưu database?

### Phương án 1: Lưu cứng (Hardcode)

**Ưu điểm:**
- ✅ Đơn giản, không cần API
- ✅ Nhanh, không cần fetch
- ✅ Phù hợp nếu thông tin **ít thay đổi**

**Nhược điểm:**
- ❌ Khó thay đổi (phải deploy lại code)
- ❌ Không linh hoạt
- ❌ Không thể quản lý từ Admin

**Code:**
```javascript
// constants/schoolBankInfo.js
export const SCHOOL_BANK_INFO = {
  soTaiKhoan: '1234567890',
  tenNganHang: 'Vietcombank - Chi nhánh Trà Vinh',
  chuTaiKhoan: 'TRƯỜNG ĐẠI HỌC TRÀ VINH',
  qrCode: '/assets/qr-code-bank.png', // Static file
};

// Sử dụng
import { SCHOOL_BANK_INFO } from '@constants/schoolBankInfo';
```

**Khi nào dùng:**
- Thông tin ngân hàng **ít khi thay đổi** (1-2 năm/lần)
- Không cần quản lý từ Admin
- Muốn đơn giản, nhanh

### Phương án 2: Lưu database (Recommended ⭐)

**Ưu điểm:**
- ✅ Linh hoạt, dễ thay đổi
- ✅ Admin có thể cập nhật từ UI
- ✅ Có thể có nhiều tài khoản cho các quỹ khác nhau
- ✅ Có thể bật/tắt tài khoản
- ✅ Lưu lịch sử thay đổi

**Nhược điểm:**
- ❌ Phức tạp hơn (cần API, database)
- ❌ Cần thêm trang quản lý cho Admin

**Database Schema:**
```sql
CREATE TABLE tai_khoan_nhan_quyen_gop (
  tai_khoan_id INT PRIMARY KEY AUTO_INCREMENT,
  quy_id INT NULL, -- NULL = dùng chung cho tất cả quỹ
  so_tai_khoan VARCHAR(50) NOT NULL,
  ten_ngan_hang VARCHAR(255) NOT NULL,
  chu_tai_khoan VARCHAR(255) NOT NULL,
  qr_code_url VARCHAR(500) NULL,
  trang_thai ENUM('HOAT_DONG', 'TAM_NGUNG') DEFAULT 'HOAT_DONG',
  la_mac_dinh TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**API:**
```javascript
// GET /api/school-bank-accounts?quy_id=1
// Response:
{
  success: true,
  data: {
    soTaiKhoan: '1234567890',
    tenNganHang: 'Vietcombank - CN Trà Vinh',
    chuTaiKhoan: 'TRƯỜNG ĐẠI HỌC TRÀ VINH',
    qrCodeUrl: '/uploads/qr-codes/quy-hoc-bong.png',
    noiDungMau: 'QUY HOC BONG - {TEN_NHA_TAI_TRO}'
  }
}
```

**Khi nào dùng:**
- Thông tin ngân hàng **có thể thay đổi**
- Cần quản lý từ Admin
- Có nhiều quỹ, mỗi quỹ có tài khoản riêng
- Muốn linh hoạt, mở rộng sau này

### Phương án 3: Hybrid (Khuyến nghị cho giai đoạn đầu)

**Cách làm:**
1. **Hiện tại**: Lưu cứng trong constants
2. **Sau này**: Migrate sang database khi cần

**Code:**
```javascript
// services/schoolBankService.js
import { SCHOOL_BANK_INFO } from '@constants/schoolBankInfo';

export const schoolBankService = {
  // Hiện tại: return hardcoded data
  getByFund: async (quyId) => {
    return {
      success: true,
      data: SCHOOL_BANK_INFO
    };
  },
  
  // Sau này: uncomment để dùng API
  // getByFund: async (quyId) => {
  //   const response = await api.get(`/school-bank-accounts?quy_id=${quyId}`);
  //   return response.data;
  // },
};
```

**Lợi ích:**
- ✅ Bắt đầu nhanh với hardcode
- ✅ Dễ migrate sang database sau
- ✅ Code không cần thay đổi nhiều

## Sections có thể tái sử dụng

### 1. FundSelectSection ✅
- **Dùng cho**: Sinh viên + Nhà tài trợ
- **Tái sử dụng**: 100%
- **Điều chỉnh**: Label động (isDonor prop)

### 2. RequestContentSection ❌
- **Dùng cho**: Chỉ Sinh viên
- **Tái sử dụng**: Không
- **Lý do**: Nhà tài trợ không cần viết đơn

### 3. BankInfoSection ❌
- **Dùng cho**: Chỉ Sinh viên
- **Tái sử dụng**: Không
- **Lý do**: Nhà tài trợ không cần cung cấp TK nhận tiền

### 4. DocumentSection ✅
- **Dùng cho**: Sinh viên + Nhà tài trợ
- **Tái sử dụng**: 100%
- **Điều chỉnh**: Label động (isDonor prop)

### 5. ApplicationFooter ✅
- **Dùng cho**: Sinh viên + Nhà tài trợ
- **Tái sử dụng**: 100%
- **Điều chỉnh**: Button text động (isDonor prop)

### 6. AppliSidebar (AI) ❌
- **Dùng cho**: Chỉ Sinh viên
- **Tái sử dụng**: Không
- **Lý do**: Nhà tài trợ không cần AI gợi ý

### 7. SchoolBankInfoSection (NEW) 🆕
- **Dùng cho**: Chỉ Nhà tài trợ
- **Tái sử dụng**: Không
- **Mục đích**: Hiển thị thông tin TK nhà trường

## Luồng mới cho Nhà tài trợ (với SchoolBankInfoSection)

```
Step 1: FundSelectSection
   ↓
Step 1.5: SchoolBankInfoSection (NEW) 🆕
   ├── Hiển thị thông tin TK nhà trường
   ├── Copy số TK, nội dung CK
   ├── QR Code (optional)
   └── Hướng dẫn chuyển khoản
   ↓
Step 2: DocumentSection
   ├── Upload ảnh minh chứng chuyển khoản
   └── Preview
   ↓
Footer: ApplicationFooter
   └── Quyên góp
```

## Khuyến nghị

### Ngắn hạn (MVP):
1. ✅ **Lưu cứng** thông tin TK trong constants
2. ✅ Tạo **SchoolBankInfoSection** component
3. ✅ Thêm vào ApplyPage cho Nhà tài trợ
4. ✅ Copy button cho số TK và nội dung CK
5. ⏳ QR Code (optional - có thể bỏ qua)

### Dài hạn (Scale):
1. ⏳ Tạo bảng `tai_khoan_nhan_quyen_gop` trong database
2. ⏳ API CRUD cho Admin quản lý
3. ⏳ Trang Admin để cập nhật thông tin TK
4. ⏳ Hỗ trợ nhiều TK cho các quỹ khác nhau
5. ⏳ Generate QR Code động

## Implementation Plan

### Phase 1: Hardcode (1-2 giờ)
```javascript
// 1. Tạo constants/schoolBankInfo.js
// 2. Tạo SchoolBankInfoSection component
// 3. Thêm vào ApplyPage (chỉ cho isDonor)
// 4. Test với Nhà tài trợ
```

### Phase 2: Database (1-2 ngày)
```javascript
// 1. Tạo migration + model
// 2. API endpoints (GET, POST, PUT, DELETE)
// 3. Admin page để quản lý
// 4. Migrate từ constants sang API
// 5. Test end-to-end
```

## Kết luận

**Câu trả lời:**
- ✅ **Lưu cứng ổn** cho giai đoạn đầu (MVP)
- ✅ **Nên migrate sang database** sau khi ổn định
- ✅ **Dùng Hybrid approach** để dễ migrate

**Sections tái sử dụng:**
- ✅ FundSelectSection
- ✅ DocumentSection
- ✅ ApplicationFooter
- ❌ RequestContentSection (chỉ sinh viên)
- ❌ BankInfoSection (chỉ sinh viên)
- ❌ AppliSidebar (chỉ sinh viên)

**Cần tạo mới:**
- 🆕 SchoolBankInfoSection (chỉ nhà tài trợ)
