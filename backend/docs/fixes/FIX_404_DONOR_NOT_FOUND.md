# Fix lỗi 404 "Không tìm thấy thông tin nhà tài trợ"

## Tóm tắt vấn đề

Khi nhà tài trợ đã đăng nhập submit quyên góp:
- ❌ Lỗi 404: "Không tìm thấy thông tin nhà tài trợ"
- ❌ Backend không tìm thấy donor record trong bảng `nhataitro`

## Root Causes đã tìm thấy

### 1. Missing Import (ĐÃ FIX ✅)
**File**: `backend/controllers/authController.js`

**Vấn đề**: Thiếu import `DonorModel`

**Fix**:
```javascript
import DonorModel from "../models/DonorModel.js";
```

### 2. Wrong Field Name (ĐÃ FIX ✅)
**File**: `backend/controllers/donationController.js`

**Vấn đề**: 
```javascript
const userId = req.user?.user_id; // ❌ SAI - middleware không gán vào field này
```

**Middleware `protect` gán vào**:
```javascript
req.user = {
  id: decoded.user_id,  // ✅ Gán vào "id", không phải "user_id"
  vai_tro: decoded.vai_tro,
  roleId: decoded.vai_tro
};
```

**Fix**:
```javascript
const userId = req.user?.id; // ✅ ĐÚNG
```

### 3. Wrong Parameters in createDonor (ĐÃ FIX ✅)
**File**: `backend/controllers/authController.js` và `donationController.js`

**Vấn đề**: Gọi `createDonor()` với tham số snake_case thay vì camelCase

**Fix**:
```javascript
// ❌ SAI
const donorData = {
  user_id: userId,
  ten_nha_tai_tro: tenToChuc,
  loai_ntt: loaiNhaTaiTro
};

// ✅ ĐÚNG
const donorData = {
  userId: userId,           // camelCase
  tenNhaTaiTro: tenToChuc,  // camelCase
  loai: loaiNhaTaiTro       // camelCase
};
```

### 4. Backend Server chưa restart (CHƯA FIX ⚠️)
**Vấn đề**: Code đã sửa nhưng server đang chạy code CŨ

**Fix**: **PHẢI RESTART BACKEND SERVER**

## Các thay đổi đã thực hiện

### File 1: `backend/controllers/authController.js`

```javascript
// ✅ Thêm import
import DonorModel from "../models/DonorModel.js";

// ✅ Sửa logic trong register()
if (loaiTaiKhoan === 'nhataitro') {
  try {
    const donorData = {
      userId: userId,                              // ✅ camelCase
      tenNhaTaiTro: tenToChuc.trim(),             // ✅ camelCase
      loai: loaiNhaTaiTro || 'Ca nhan',           // ✅ camelCase
    };
    
    const result = await DonorModel.createDonor(donorData);
    console.log(`Đã tạo nhà tài trợ ID ${result.insertId} cho user ID ${userId}`);
  } catch (donorError) {
    console.error("Lỗi tạo nhà tài trợ:", donorError);
  }
}
```

### File 2: `backend/controllers/donationController.js`

```javascript
export const createAuthenticatedDonation = async (req, res) => {
  try {
    const { quy_id, so_tien, hinh_anh_minh_chung } = req.body;
    const userId = req.user?.id; // ✅ Sửa từ user_id → id

    console.log('🔍 DEBUG createAuthenticatedDonation:', {
      userId,
      quy_id,
      so_tien,
      req_user: req.user
    });

    // ... validation ...

    // Lấy thông tin nhà tài trợ từ user_id
    const donors = await DonorModel.getAllDonors();
    
    console.log('🔍 DEBUG getAllDonors:', {
      totalDonors: donors.length,
      sampleDonors: donors.slice(0, 3).map(d => ({ 
        nha_tai_tro_id: d.nha_tai_tro_id, 
        user_id: d.user_id, 
        ten: d.ten_nha_tai_tro 
      }))
    });
    
    let donor = donors.find(d => d.user_id === userId);

    console.log('🔍 DEBUG tìm donor:', {
      userId,
      userIdType: typeof userId,
      totalDonors: donors.length,
      donorFound: !!donor,
      donorDetails: donor ? { 
        id: donor.nha_tai_tro_id, 
        user_id: donor.user_id, 
        user_id_type: typeof donor.user_id,
        ten: donor.ten_nha_tai_tro 
      } : null
    });

    // Nếu chưa có record trong NhaTaiTro, tự động tạo
    if (!donor) {
      console.log(`User ${userId} chưa có trong NhaTaiTro, tự động tạo...`);
      
      const userName = req.user?.ho_ten || req.user?.hoTen || 'Nhà tài trợ';
      
      const newDonorData = {
        userId: userId,                    // ✅ camelCase
        tenNhaTaiTro: userName,           // ✅ camelCase
        loai: 'Ca nhan',                  // ✅ camelCase
      };
      
      const result = await DonorModel.createDonor(newDonorData);
      const newDonorId = result.insertId; // ✅ Lấy từ result.insertId
      
      donor = await DonorModel.getDonorById(newDonorId);
      
      if (!donor) {
        return res.status(500).json({
          success: false,
          message: "Không thể tạo thông tin nhà tài trợ. Vui lòng thử lại.",
        });
      }
      
      console.log(`Đã tạo nhà tài trợ mới: ID ${newDonorId}`);
    }

    // Tạo khoản tài trợ
    const result = await DonationModel.createStaffDonation({
      nhaTaiTroId: donor.nha_tai_tro_id,
      quyId: quy_id,
      soTien: Number(so_tien),
      ghiChu: `Quyên góp từ ${donor.ho_ten || donor.ten_nha_tai_tro}`,
      hinhAnhMinhChung: hinh_anh_minh_chung,
      nguoiDuyetId: null,
    });

    return res.status(201).json({
      success: true,
      message: "Quyên góp thành công! Cảm ơn bạn đã đồng hành cùng TVU Fund.",
      data: {
        khoan_tai_tro_id: result.khoanTaiTroId,
        nha_tai_tro_id: donor.nha_tai_tro_id,
        quy_id: quy_id,
        so_tien: Number(so_tien),
        trang_thai: "Cho duyet",
      },
    });
  } catch (error) {
    console.error("Lỗi createAuthenticatedDonation:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};
```

## Bước tiếp theo - QUAN TRỌNG!

### 1. ⚠️ RESTART BACKEND SERVER (BẮT BUỘC)

```bash
# Cách 1: Nếu đang chạy trong terminal
Ctrl + C
npm start

# Cách 2: Kill và start lại
taskkill /F /IM node.exe
cd backend
npm start
```

### 2. Fix user đã tồn tại (nếu cần)

Nếu user đã đăng ký TRƯỚC KHI fix code, chạy SQL:

```bash
mysql -u root -p tvu_fund < backend/database/fix_existing_donors.sql
```

### 3. Test lại

1. Đăng nhập với tài khoản NHA_TAI_TRO
2. Vào trang quyên góp
3. Chọn quỹ, nhập số tiền, upload minh chứng
4. Submit
5. **Expected**: 201 Created

### 4. Xem console log để debug

Sau khi restart, bạn sẽ thấy:

```
🔍 DEBUG createAuthenticatedDonation: { userId: 123, quy_id: 1, so_tien: 5000000, ... }
🔍 DEBUG getAllDonors: { totalDonors: 5, sampleDonors: [...] }
🔍 DEBUG tìm donor: { userId: 123, userIdType: 'number', donorFound: true, donorDetails: {...} }
```

**Nếu `donorFound: false`**:
- Kiểm tra `userId` có đúng không
- Kiểm tra database: `SELECT * FROM nhataitro WHERE user_id = 123;`
- Nếu không có → Chạy SQL script fix

**Nếu `donorFound: true` nhưng vẫn lỗi**:
- Xem error message chi tiết trong console
- Có thể lỗi ở `createStaffDonation()` (foreign key constraint)

## Kiểm tra database

```sql
-- 1. Xem user hiện tại
SELECT user_id, ho_ten, email, loai_tai_khoan 
FROM nguoidung 
WHERE email = 'your-email@example.com';

-- 2. Xem donor tương ứng (thay USER_ID)
SELECT * FROM nhataitro WHERE user_id = USER_ID;

-- 3. Nếu không có donor, tạo thủ công
INSERT INTO nhataitro (user_id, ten_nha_tai_tro, loai)
VALUES (USER_ID, 'Tên nhà tài trợ', 'Ca nhan');
```

## Files đã thay đổi

- ✅ `backend/controllers/authController.js`
- ✅ `backend/controllers/donationController.js`
- ✅ `backend/docs/DONOR_AUTO_CREATE_FIX.md` (documentation)
- ✅ `backend/database/fix_existing_donors.sql` (SQL script)
- ✅ `backend/docs/FIX_404_DONOR_NOT_FOUND.md` (this file)

## Tóm tắt

1. ✅ Đã fix code (3 lỗi)
2. ⚠️ **PHẢI RESTART BACKEND SERVER**
3. ✅ Đã thêm debug logs
4. ✅ Đã tạo SQL script fix user cũ
5. 🧪 Test lại sau khi restart

**Lỗi sẽ được fix sau khi restart server!**
