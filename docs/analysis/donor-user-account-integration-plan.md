# Phân Tích & Kế Hoạch: Tích Hợp Tài Khoản Người Dùng Cho Nhà Tài Trợ Mới

## 📋 Tóm Tắt Executive Summary

**Vấn đề hiện tại:** Khi cán bộ quỹ tạo khoản tài trợ mới với nhà tài trợ mới (donorMode='new'), hệ thống chỉ tạo record trong bảng `nhataitro` với `nguoi_dung_id = NULL`, không tạo tài khoản trong bảng `nguoidung`.

**Hậu quả:** 
- Nhà tài trợ không thể đăng nhập hệ thống
- Không có email/password để truy cập profile
- Không thể xem lịch sử đóng góp của mình
- Dữ liệu không nhất quán (có donor nhưng không có user)

**Giải pháp đề xuất:** Tự động tạo tài khoản `nguoidung` khi tạo nhà tài trợ mới, tương tự như luồng guest donor trong `createPublicDonation`.

---

## 🔍 1. Phân Tích Luồng Hiện Tại

### 1.1. Luồng Tạo Khoản Tài Trợ Từ Staff (createStaffDonation)

**File:** `backend/controllers/donations/donationController.js` (dòng 159-298)

```javascript
// LUỒNG HIỆN TẠI
if (donorMode === 'new') {
  // ✅ Check duplicate by email
  // ✅ Insert vào bảng nhataitro
  // ❌ KHÔNG tạo record trong bảng nguoidung
  
  const [donorInsert] = await connection.query(
    `INSERT INTO nhataitro (
      nguoidung_id,        // ⚠️ SET NULL
      tennhataitro,
      loainhataitro,
      email,
      sodienthoai,
      diachi,
      trangthai
    ) VALUES (NULL, ?, ?, ?, ?, ?, 'Hoat dong')`,
    [...]
  );
}
```

**Kết quả:**
- Bảng `nhataitro`: ✅ Có record mới
- Bảng `nguoidung`: ❌ Không có record
- `nhataitro.nguoi_dung_id`: `NULL`

---

### 1.2. Luồng Tạo Guest Donor (Tham Khảo - Đã Đúng)

**File:** `backend/models/guest/GuestModel.js` (dòng 158-183)

```javascript
// LUỒNG GUEST DONOR (MẪU CHUẨN)

// BƯỚC 1: Tạo nguoidung
const [userInsert] = await connection.query(
  `INSERT INTO nguoidung (
    email, matkhau, hoten, masodinhdanh, sodienthoai, 
    vaitro_id, loaitaikhoan, trangthai, diachi
  ) VALUES (?, ?, ?, ?, ?, 4, 'Nha tai tro', 'Hoat dong', ?)`,
  [email, tempPassword, hoTen, maSoDinhDanh, soDienThoai, diaChi]
);
const nguoiDungId = userInsert.insertId;

// BƯỚC 2: Tạo nhataitro (liên kết với nguoidung)
const [donorInsert] = await connection.query(
  `INSERT INTO nhataitro (
    nguoidung_id,  // ✅ LINK VỚI USER
    tennhataitro, loainhataitro, email, sodienthoai, 
    diachi, trangthai
  ) VALUES (?, ?, ?, ?, ?, ?, 'Hoat dong')`,
  [nguoiDungId, tenNhaTaiTro, loaiNhaTaiTro, email, soDienThoai, diaChi]
);
```

**Kết quả:**
- Bảng `nguoidung`: ✅ Có record với email, password
- Bảng `nhataitro`: ✅ Có record
- `nhataitro.nguoi_dung_id`: ✅ Linked đúng

---

### 1.3. So Sánh Hai Luồng

| Tiêu Chí | createStaffDonation (Hiện tại) | Guest Donor (Mẫu chuẩn) |
|----------|--------------------------------|-------------------------|
| Tạo `nguoidung` | ❌ Không | ✅ Có |
| Tạo `nhataitro` | ✅ Có | ✅ Có |
| Link `nguoi_dung_id` | ❌ NULL | ✅ Có ID |
| Generate password | ❌ Không | ✅ Có (temp) |
| Email welcome | ❌ Không | ✅ Có (option) |
| Donor có thể login | ❌ Không | ✅ Có |

---

## 🎯 2. Kế Hoạch Cập Nhật

### 2.1. Mục Tiêu

1. ✅ Tự động tạo tài khoản `nguoidung` khi tạo nhà tài trợ mới
2. ✅ Link `nhataitro.nguoi_dung_id` với `nguoidung.id`
3. ✅ Generate mật khẩu tạm thời
4. ✅ (Optional) Gửi email thông báo tài khoản

### 2.2. Các Trường Hợp Cần Xử Lý

**Case 1: Email chưa tồn tại**
- Tạo mới cả `nguoidung` và `nhataitro`
- Link hai bảng với nhau

**Case 2: Email đã tồn tại trong `nguoidung`**
- Kiểm tra xem đã có record `nhataitro` chưa
- Nếu chưa: Tạo `nhataitro` và link
- Nếu có rồi: Sử dụng donor hiện có

**Case 3: Email đã tồn tại trong `nhataitro` (nhưng `nguoi_dung_id = NULL`)**
- Tạo `nguoidung` mới
- Cập nhật `nhataitro.nguoi_dung_id`

---

### 2.3. Chi Tiết Thay Đổi Code

#### File: `backend/controllers/donations/donationController.js`

**Vị trí:** Function `createStaffDonation`, dòng 205-245

**Thay đổi:**

```javascript
// ========== CŨ (Chỉ tạo nhataitro) ==========
if (donorMode === 'new') {
  if (!donor_info || !donor_info.tenNhaTaiTro?.trim()) {
    // ... validation
  }

  // Check duplicate by email
  if (donor_info.email?.trim()) {
    const [existingDonors] = await connection.query(
      "SELECT nhataitro_id FROM nhataitro WHERE email = ? LIMIT 1",
      [donor_info.email.trim()]
    );
    if (existingDonors.length > 0) {
      resolvedNhaTaiTroId = existingDonors[0].nhataitro_id;
    }
  }

  if (!resolvedNhaTaiTroId) {
    // ❌ Chỉ INSERT vào nhataitro, nguoi_dung_id = NULL
    const [donorInsert] = await connection.query(
      `INSERT INTO nhataitro (
        nguoidung_id, tennhataitro, loainhataitro, 
        email, sodienthoai, diachi, trangthai
      ) VALUES (NULL, ?, ?, ?, ?, ?, 'Hoat dong')`,
      [...]
    );
    resolvedNhaTaiTroId = donorInsert.insertId;
  }
}
```

**Sửa thành:**

```javascript
// ========== MỚI (Tạo cả nguoidung và nhataitro) ==========
if (donorMode === 'new') {
  if (!donor_info || !donor_info.tenNhaTaiTro?.trim()) {
    // ... validation
  }

  const email = donor_info.email?.trim() || null;
  const tenNhaTaiTro = donor_info.tenNhaTaiTro.trim();
  const loaiNhaTaiTro = donor_info.loaiNhaTaiTro || 'Ca nhan';
  const soDienThoai = donor_info.soDienThoai?.trim() || null;
  const diaChi = donor_info.diaChi?.trim() || null;

  let nguoiDungId = null;
  let isNewUser = false;

  // BƯỚC 1: Check xem email đã có trong nguoidung chưa
  if (email) {
    const [existingUsers] = await connection.query(
      `SELECT id, loaitaikhoan FROM nguoidung WHERE email = ? LIMIT 1`,
      [email]
    );

    if (existingUsers.length > 0) {
      nguoiDungId = existingUsers[0].id;
      
      // Check xem user này đã có nhataitro chưa
      const [existingDonors] = await connection.query(
        `SELECT nhataitro_id FROM nhataitro WHERE nguoidung_id = ? LIMIT 1`,
        [nguoiDungId]
      );
      
      if (existingDonors.length > 0) {
        // User đã có donor record → Sử dụng luôn
        resolvedNhaTaiTroId = existingDonors[0].nhataitro_id;
      }
      // Nếu chưa có donor record → Sẽ tạo ở BƯỚC 3
    }
  }

  // BƯỚC 2: Nếu chưa có nguoidung → Tạo mới
  if (!nguoiDungId && email) {
    // Generate temporary password
    const bcrypt = require('bcryptjs');
    const tempPassword = Math.random().toString(36).slice(-8); // 8 ký tự random
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    
    // Tạo mã số định danh (optional, có thể để NULL)
    const maSoDinhDanh = `NTT${Date.now().toString().slice(-6)}`;

    const [userInsert] = await connection.query(
      `INSERT INTO nguoidung (
        email, matkhau, hoten, masodinhdanh, sodienthoai, 
        vaitro_id, loaitaikhoan, trangthai, diachi
      ) VALUES (?, ?, ?, ?, ?, 4, 'Nha tai tro', 'Hoat dong', ?)`,
      [email, hashedPassword, tenNhaTaiTro, maSoDinhDanh, soDienThoai, diaChi]
    );
    
    nguoiDungId = userInsert.insertId;
    isNewUser = true;

    // TODO: (Optional) Gửi email thông báo tài khoản với tempPassword
    // await emailService.sendWelcomeEmail(email, tenNhaTaiTro, tempPassword);
  }

  // BƯỚC 3: Tạo hoặc update nhataitro
  if (!resolvedNhaTaiTroId) {
    // Tạo mới nhataitro
    const [donorInsert] = await connection.query(
      `INSERT INTO nhataitro (
        nguoidung_id, tennhataitro, loainhataitro, 
        email, sodienthoai, diachi, trangthai
      ) VALUES (?, ?, ?, ?, ?, ?, 'Hoat dong')`,
      [nguoiDungId, tenNhaTaiTro, loaiNhaTaiTro, email, soDienThoai, diaChi]
    );
    resolvedNhaTaiTroId = donorInsert.insertId;
  }
}
```

---

### 2.4. Xử Lý Edge Cases

#### Edge Case 1: Email không được cung cấp

**Hiện tại:** Vẫn tạo được donor với email = NULL

**Đề xuất:** 
- **Option A (Recommended):** Bắt buộc phải có email để tạo tài khoản
- **Option B:** Cho phép tạo donor không có email (nguoi_dung_id = NULL như hiện tại)

**Code (Option A):**
```javascript
if (donorMode === 'new') {
  if (!donor_info.email?.trim()) {
    return res.status(400).json({ 
      success: false, 
      message: "Email là bắt buộc để tạo nhà tài trợ mới" 
    });
  }
  // ... continue
}
```

#### Edge Case 2: Email đã tồn tại nhưng loaitaikhoan khác

**Scenario:** Email đã có trong `nguoidung` với `loaitaikhoan = 'Sinh vien'`

**Giải pháp:**
- Không tạo user mới
- Tạo donor record và link với user hiện có
- User này có thể có nhiều vai trò (sinh viên + nhà tài trợ)

```javascript
if (existingUsers.length > 0) {
  nguoiDungId = existingUsers[0].id;
  const currentType = existingUsers[0].loaitaikhoan;
  
  // Log cảnh báo nếu type khác
  if (currentType !== 'Nha tai tro') {
    console.warn(`User ${email} hiện là ${currentType}, sẽ thêm vai trò Nhà tài trợ`);
  }
  // ... continue to create donor record
}
```

#### Edge Case 3: Donor đã tồn tại với email nhưng nguoi_dung_id = NULL

**Scenario:** Donor cũ được tạo trước khi có update này

**Giải pháp:** Tạo user và update donor

```javascript
// Check existing donor with NULL nguoi_dung_id
const [orphanDonors] = await connection.query(
  `SELECT nhataitro_id FROM nhataitro 
   WHERE email = ? AND nguoidung_id IS NULL LIMIT 1`,
  [email]
);

if (orphanDonors.length > 0) {
  // Tạo user mới
  const [userInsert] = await connection.query(/* ... */);
  nguoiDungId = userInsert.insertId;
  
  // Update donor hiện có
  await connection.query(
    `UPDATE nhataitro SET nguoidung_id = ? WHERE nhataitro_id = ?`,
    [nguoiDungId, orphanDonors[0].nhataitro_id]
  );
  
  resolvedNhaTaiTroId = orphanDonors[0].nhataitro_id;
}
```

---

## 📦 3. Implementation Checklist

### Phase 1: Core Changes (Bắt buộc)

- [ ] **Task 1.1:** Update `createStaffDonation` controller
  - [ ] Add nguoidung creation logic
  - [ ] Add password generation (bcrypt)
  - [ ] Link nhataitro.nguoi_dung_id
  
- [ ] **Task 1.2:** Add validation
  - [ ] Require email for new donors
  - [ ] Validate email format
  - [ ] Check email duplicates properly
  
- [ ] **Task 1.3:** Handle existing records
  - [ ] Check existing nguoidung
  - [ ] Check existing nhataitro
  - [ ] Update orphan donors (optional)

### Phase 2: Email Notification (Optional)

- [ ] **Task 2.1:** Create email template
  - [ ] Welcome email cho nhà tài trợ mới
  - [ ] Include login credentials
  - [ ] Include password reset link
  
- [ ] **Task 2.2:** Integrate emailService
  - [ ] Call sendWelcomeEmail after user creation
  - [ ] Handle email failures gracefully

### Phase 3: Data Migration (Recommended)

- [ ] **Task 3.1:** Create migration script
  - [ ] Find all donors with nguoi_dung_id = NULL and email != NULL
  - [ ] Create nguoidung for them
  - [ ] Update nguoi_dung_id

- [ ] **Task 3.2:** Run migration
  - [ ] Backup database
  - [ ] Run migration script
  - [ ] Verify results

### Phase 4: Testing

- [ ] **Task 4.1:** Unit tests
  - [ ] Test new donor creation
  - [ ] Test duplicate email handling
  - [ ] Test edge cases
  
- [ ] **Task 4.2:** Integration tests
  - [ ] Test full donation flow
  - [ ] Test login with new donor account
  - [ ] Test profile access

### Phase 5: Documentation

- [ ] **Task 5.1:** Update API docs
  - [ ] Document new behavior
  - [ ] Update request/response examples
  
- [ ] **Task 5.2:** Update README
  - [ ] Add notes về user account creation
  - [ ] Add migration instructions

---

## 🔧 4. Migration Script (Data Fix)

**File:** `backend/database/migrations/fix_orphan_donors.js`

```javascript
/**
 * Migration: Create nguoidung for existing nhataitro with NULL nguoi_dung_id
 * 
 * Tìm tất cả donors có email nhưng chưa có tài khoản người dùng,
 * tạo tài khoản cho họ và link lại.
 */

import pool from '../../config/db.js';
import bcrypt from 'bcryptjs';

const fixOrphanDonors = async () => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Tìm tất cả orphan donors (có email, nhưng nguoi_dung_id = NULL)
    const [orphanDonors] = await connection.query(`
      SELECT 
        nhataitro_id,
        tennhataitro,
        loainhataitro,
        email,
        sodienthoai,
        diachi
      FROM nhataitro
      WHERE nguoidung_id IS NULL 
        AND email IS NOT NULL
        AND email != ''
    `);
    
    console.log(`Found ${orphanDonors.length} orphan donors to fix`);
    
    let fixed = 0;
    let skipped = 0;
    
    for (const donor of orphanDonors) {
      // Check xem email đã tồn tại trong nguoidung chưa
      const [existingUsers] = await connection.query(
        `SELECT id FROM nguoidung WHERE email = ? LIMIT 1`,
        [donor.email]
      );
      
      let nguoiDungId;
      
      if (existingUsers.length > 0) {
        // Email đã có user → Link luôn
        nguoiDungId = existingUsers[0].id;
        console.log(`  Linking donor ${donor.nhataitro_id} to existing user ${nguoiDungId}`);
      } else {
        // Tạo user mới
        const tempPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(tempPassword, 10);
        const maSoDinhDanh = `NTT${Date.now().toString().slice(-6)}`;
        
        const [userInsert] = await connection.query(`
          INSERT INTO nguoidung (
            email, matkhau, hoten, masodinhdanh, sodienthoai,
            vaitro_id, loaitaikhoan, trangthai, diachi
          ) VALUES (?, ?, ?, ?, ?, 4, 'Nha tai tro', 'Hoat dong', ?)
        `, [
          donor.email,
          hashedPassword,
          donor.tennhataitro,
          maSoDinhDanh,
          donor.sodienthoai,
          donor.diachi
        ]);
        
        nguoiDungId = userInsert.insertId;
        console.log(`  Created user ${nguoiDungId} for donor ${donor.nhataitro_id} (temp password: ${tempPassword})`);
      }
      
      // Update nhataitro
      await connection.query(
        `UPDATE nhataitro SET nguoidung_id = ? WHERE nhataitro_id = ?`,
        [nguoiDungId, donor.nhataitro_id]
      );
      
      fixed++;
    }
    
    await connection.commit();
    console.log(`\n✅ Migration completed:`);
    console.log(`   - Fixed: ${fixed} donors`);
    console.log(`   - Skipped: ${skipped} donors`);
    
  } catch (error) {
    await connection.rollback();
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    connection.release();
  }
};

// Run migration
fixOrphanDonors()
  .then(() => {
    console.log('\n✅ Migration script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration script failed:', error);
    process.exit(1);
  });
```

**Chạy migration:**
```bash
cd backend/database/migrations
node fix_orphan_donors.js
```

---

## 📊 5. Impact Analysis

### 5.1. Database Changes

**Bảng `nguoidung`:**
- Số lượng records tăng lên (mỗi donor mới = 1 user mới)
- Thêm constraint: Email phải unique (đã có sẵn)

**Bảng `nhataitro`:**
- `nguoi_dung_id` sẽ không còn NULL (đối với donors có email)
- Foreign key relationship được duy trì đúng

### 5.2. API Changes

**Breaking Changes:** ❌ Không có

**New Behavior:**
- Khi tạo donor mới, tự động tạo user account
- Response vẫn giữ nguyên structure

### 5.3. User Experience

**Trước:**
- Donor không thể login
- Không xem được lịch sử đóng góp

**Sau:**
- ✅ Donor có thể login ngay
- ✅ Xem được profile và lịch sử
- ✅ Có thể đổi password
- ✅ Nhận email thông báo (nếu có)

---

## ⚠️ 6. Risks & Mitigation

### Risk 1: Email Duplicates

**Risk:** Email đã tồn tại với loại tài khoản khác

**Mitigation:**
- Check email trước khi tạo
- Cho phép user có nhiều vai trò
- Log warning khi detect duplicate

### Risk 2: Password Security

**Risk:** Temporary password có thể bị lộ

**Mitigation:**
- Hash password ngay lập tức
- Gửi qua email (encrypted connection)
- Yêu cầu đổi password lần đầu login

### Risk 3: Data Migration Failure

**Risk:** Migration script có thể fail giữa chừng

**Mitigation:**
- Use transaction
- Backup database trước
- Log chi tiết từng bước
- Có rollback plan

---

## 🎯 7. Success Criteria

### Functionality
- [x] Tạo donor mới → Tự động tạo user account
- [x] Email duplicate được handle đúng
- [x] Donor có thể login thành công
- [x] Donor có thể xem profile và lịch sử

### Data Integrity
- [x] `nhataitro.nguoi_dung_id` luôn link đúng (không NULL khi có email)
- [x] Không có email duplicate trong `nguoidung`
- [x] Foreign key constraints được maintain

### Performance
- [x] Thời gian tạo donor < 2s
- [x] Migration script chạy thành công trong < 5 phút (với 1000 records)

---

## 📅 8. Timeline Estimate

| Phase | Tasks | Effort | Priority |
|-------|-------|--------|----------|
| Phase 1 | Core changes (Task 1.1 - 1.3) | 4-6 hours | 🔴 High |
| Phase 2 | Email notification | 2-3 hours | 🟡 Medium |
| Phase 3 | Data migration | 2-3 hours | 🟢 Low |
| Phase 4 | Testing | 3-4 hours | 🔴 High |
| Phase 5 | Documentation | 1-2 hours | 🟡 Medium |
| **Total** | | **12-18 hours** | |

---

## 📝 9. Conclusion

### Recommended Approach

1. **Implement Phase 1** (Core changes) - Bắt buộc
2. **Implement Phase 4** (Testing) - Bắt buộc
3. **Implement Phase 3** (Migration) - Strongly recommended
4. **Implement Phase 2** (Email) - Nice to have
5. **Implement Phase 5** (Docs) - Recommended

### Quick Start

Nếu muốn bắt đầu ngay:
1. Backup database
2. Apply code changes từ section 2.3
3. Test với donor mới
4. Run migration script cho data cũ

---

## 📚 10. References

### Related Files
- `backend/controllers/donations/donationController.js` - Main controller
- `backend/models/guest/GuestModel.js` - Reference implementation
- `backend/models/donations/DonorModel.js` - Donor model
- `backend/database/schemas/COMPLETE_DATABASE_SCHEMA.sql` - DB schema

### Related Issues
- Donor không thể login sau khi được tạo
- Data inconsistency: nhataitro.nguoi_dung_id = NULL

---

**Document Version:** 1.0  
**Created:** 2026-07-05  
**Author:** TVU Fund Management Team  
**Status:** 📋 Draft - Ready for Review
