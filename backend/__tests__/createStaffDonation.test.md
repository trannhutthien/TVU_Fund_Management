# Test Cases: createStaffDonation with User Account Creation

## Test Scenarios

### Scenario 1: Create New Donor with Email (Happy Path)

**Given:**
- donorMode = 'new'
- donor_info.email = 'newdonor@gmail.com' (chưa tồn tại)
- donor_info.tenNhaTaiTro = 'Nguyen Van A'

**Expected:**
1. ✅ Tạo record trong `nguoidung` với email, hashed password
2. ✅ Tạo record trong `nhataitro` với `nguoi_dung_id` linked
3. ✅ Tạo record trong `khoantaitro`
4. ✅ Console log hiển thị temp password
5. ✅ Return success response

**SQL Verification:**
```sql
SELECT 
  u.id as user_id,
  u.email,
  u.hoten,
  u.loaitaikhoan,
  n.nhataitro_id,
  n.tennhataitro,
  n.nguoidung_id
FROM nguoidung u
JOIN nhataitro n ON u.id = n.nguoidung_id
WHERE u.email = 'newdonor@gmail.com';
```

**Expected Result:**
- user_id: (new ID)
- nguoidung_id: (same as user_id) ✅

---

### Scenario 2: Email Already Exists (Existing User)

**Given:**
- donorMode = 'new'
- donor_info.email = 'existing@gmail.com' (đã có trong `nguoidung`)
- User chưa có donor record

**Expected:**
1. ❌ KHÔNG tạo user mới
2. ✅ Tạo donor record mới và link với user hiện có
3. ✅ Tạo khoản tài trợ
4. ✅ Console log: "Linking donor to existing user"

**SQL Verification:**
```sql
SELECT COUNT(*) as user_count FROM nguoidung WHERE email = 'existing@gmail.com';
-- Should be 1 (not 2)

SELECT * FROM nhataitro WHERE email = 'existing@gmail.com';
-- Should have nguoidung_id linked
```

---

### Scenario 3: Email Exists with Donor Already

**Given:**
- donorMode = 'new'
- donor_info.email = 'hasdonor@gmail.com'
- User đã có donor record rồi

**Expected:**
1. ❌ KHÔNG tạo user mới
2. ❌ KHÔNG tạo donor mới
3. ✅ Sử dụng donor hiện có
4. ✅ Tạo khoản tài trợ
5. ✅ Console log: "Sử dụng nhà tài trợ hiện có"

---

### Scenario 4: Orphan Donor (Donor cũ không có user)

**Given:**
- donorMode = 'new'
- donor_info.email = 'orphan@gmail.com'
- Email này có trong `nhataitro` nhưng `nguoi_dung_id = NULL`
- Email này KHÔNG có trong `nguoidung`

**Expected:**
1. ✅ Tạo user mới
2. ✅ Update donor cũ với `nguoi_dung_id`
3. ✅ Tạo khoản tài trợ
4. ✅ Console log: "Phát hiện orphan donor, sẽ tạo user và link"

**SQL Before:**
```sql
SELECT nhataitro_id, email, nguoidung_id FROM nhataitro WHERE email = 'orphan@gmail.com';
-- nguoidung_id: NULL
```

**SQL After:**
```sql
SELECT nhataitro_id, email, nguoidung_id FROM nhataitro WHERE email = 'orphan@gmail.com';
-- nguoidung_id: (new user ID) ✅
```

---

### Scenario 5: No Email Provided

**Given:**
- donorMode = 'new'
- donor_info.email = null or ''

**Expected:**
1. ❌ Return 400 error
2. ❌ KHÔNG tạo user
3. ❌ KHÔNG tạo donor
4. ✅ Error message: "Email là bắt buộc để tạo nhà tài trợ mới"

---

### Scenario 6: Email Exists with Different Account Type

**Given:**
- donorMode = 'new'
- donor_info.email = 'student@tvu.edu.vn'
- Email này có trong `nguoidung` với `loaitaikhoan = 'Sinh vien'`

**Expected:**
1. ❌ KHÔNG tạo user mới
2. ✅ Tạo donor record và link với user hiện có
3. ✅ Console warning: "User hiện là Sinh vien, sẽ thêm vai trò Nhà tài trợ"
4. ✅ User này có thể có 2 vai trò (sinh viên + nhà tài trợ)

---

### Scenario 7: Existing Donor Mode (donorMode = 'existing')

**Given:**
- donorMode = 'existing'
- nha_tai_tro_id = 5

**Expected:**
1. ❌ KHÔNG chạy logic tạo user/donor
2. ✅ Chỉ validate donor_id tồn tại
3. ✅ Tạo khoản tài trợ với donor hiện có

---

## Manual Testing Steps

### Setup Test Data

```sql
-- 1. Create existing user (for Scenario 2)
INSERT INTO nguoidung (email, matkhau, hoten, masodinhdanh, vaitro_id, loaitaikhoan, trangthai)
VALUES ('existing@gmail.com', '$2a$10$abcd...', 'Existing User', 'USR001', 4, 'NHA_TAI_TRO', 'Hoat dong');

-- 2. Create user with donor (for Scenario 3)
INSERT INTO nguoidung (email, matkhau, hoten, masodinhdanh, vaitro_id, loaitaikhoan, trangthai)
VALUES ('hasdonor@gmail.com', '$2a$10$efgh...', 'Has Donor', 'USR002', 4, 'NHA_TAI_TRO', 'Hoat dong');

INSERT INTO nhataitro (nguoidung_id, tennhataitro, loainhataitro, email, trangthai)
VALUES (LAST_INSERT_ID(), 'Has Donor', 'Ca nhan', 'hasdonor@gmail.com', 'Hoat dong');

-- 3. Create orphan donor (for Scenario 4)
INSERT INTO nhataitro (nguoidung_id, tennhataitro, loainhataitro, email, trangthai)
VALUES (NULL, 'Orphan Donor', 'Ca nhan', 'orphan@gmail.com', 'Hoat dong');

-- 4. Create student user (for Scenario 6)
INSERT INTO nguoidung (email, matkhau, hoten, masodinhdanh, vaitro_id, loaitaikhoan, trangthai)
VALUES ('student@tvu.edu.vn', '$2a$10$ijkl...', 'Student User', 'SV001', 4, 'Sinh vien', 'Hoat dong');

-- 5. Create active fund for testing
INSERT INTO quy (ten_quy, so_tien_muc_tieu, so_du, trang_thai)
VALUES ('Test Fund', 10000000, 5000000, 'Dang hoat dong');
```

### Test Requests (Postman/curl)

#### Test Scenario 1: New Donor
```bash
curl -X POST http://localhost:5000/api/donations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "donorMode": "new",
    "donor_info": {
      "tenNhaTaiTro": "Nguyen Van A",
      "email": "newdonor@gmail.com",
      "soDienThoai": "0901234567",
      "loaiNhaTaiTro": "Ca nhan"
    },
    "quy_id": 1,
    "so_tien": 500000,
    "hinh_thuc": "Chuyen khoan"
  }'
```

**Check console for:**
```
✓ Tạo tài khoản người dùng mới ID: 123
  Email: newdonor@gmail.com
  Mật khẩu tạm thời: abc12345
  ⚠️ Lưu ý: Gửi email thông báo cho nhà tài trợ!
✓ Tạo nhà tài trợ mới ID: 45, linked với user 123
```

#### Test Scenario 5: No Email
```bash
curl -X POST http://localhost:5000/api/donations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "donorMode": "new",
    "donor_info": {
      "tenNhaTaiTro": "No Email Donor"
    },
    "quy_id": 1,
    "so_tien": 500000
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Email là bắt buộc để tạo nhà tài trợ mới"
}
```

---

## Automated Test Cases (Jest/Mocha)

```javascript
describe('createStaffDonation - User Account Creation', () => {
  
  it('should create both user and donor for new email', async () => {
    // Arrange
    const request = {
      donorMode: 'new',
      donor_info: {
        tenNhaTaiTro: 'Test Donor',
        email: 'test@example.com',
        soDienThoai: '0901234567'
      },
      quy_id: 1,
      so_tien: 100000,
      hinh_thuc: 'Chuyen khoan'
    };
    
    // Act
    const response = await createStaffDonation(request);
    
    // Assert
    expect(response.success).toBe(true);
    
    // Verify user created
    const user = await getUserByEmail('test@example.com');
    expect(user).toBeDefined();
    expect(user.loaitaikhoan).toBe('NHA_TAI_TRO');
    
    // Verify donor created and linked
    const donor = await getDonorById(response.data.nha_tai_tro_id);
    expect(donor.nguoidung_id).toBe(user.id);
  });
  
  it('should return error when email is missing', async () => {
    const request = {
      donorMode: 'new',
      donor_info: {
        tenNhaTaiTro: 'Test Donor'
        // email missing
      },
      quy_id: 1,
      so_tien: 100000
    };
    
    const response = await createStaffDonation(request);
    
    expect(response.success).toBe(false);
    expect(response.message).toContain('Email là bắt buộc');
  });
  
  it('should link to existing user when email exists', async () => {
    // Arrange: Create existing user
    const existingUser = await createTestUser('existing@test.com');
    
    const request = {
      donorMode: 'new',
      donor_info: {
        tenNhaTaiTro: 'Test Donor',
        email: 'existing@test.com'
      },
      quy_id: 1,
      so_tien: 100000
    };
    
    // Act
    const response = await createStaffDonation(request);
    
    // Assert
    const donor = await getDonorById(response.data.nha_tai_tro_id);
    expect(donor.nguoidung_id).toBe(existingUser.id);
    
    // Should not create duplicate user
    const userCount = await countUsersByEmail('existing@test.com');
    expect(userCount).toBe(1);
  });
});
```

---

## Verification Queries

### Check all donors have user accounts
```sql
SELECT 
  COUNT(*) as total_donors,
  SUM(CASE WHEN nguoidung_id IS NULL THEN 1 ELSE 0 END) as orphan_donors,
  SUM(CASE WHEN nguoidung_id IS NOT NULL THEN 1 ELSE 0 END) as linked_donors
FROM nhataitro
WHERE email IS NOT NULL;
```

**Expected:** orphan_donors = 0 (after migration)

### Check data integrity
```sql
-- All linked nguoidung_id should be valid
SELECT n.nhataitro_id, n.nguoidung_id, u.id as user_id
FROM nhataitro n
LEFT JOIN nguoidung u ON n.nguoidung_id = u.id
WHERE n.nguoidung_id IS NOT NULL AND u.id IS NULL;
```

**Expected:** 0 rows (no broken links)

### Check for duplicate emails
```sql
SELECT email, COUNT(*) as count
FROM nguoidung
GROUP BY email
HAVING count > 1;
```

**Expected:** 0 rows (no duplicates)

---

## Rollback Plan

If issues occur, rollback steps:

1. **Stop new donations immediately**
2. **Identify affected records:**
   ```sql
   SELECT * FROM nguoidung 
   WHERE loaitaikhoan = 'NHA_TAI_TRO' 
   AND ngay_tao > '2026-07-05 00:00:00';
   ```
3. **Restore from backup** (safest option)
4. **Or manual cleanup:**
   ```sql
   -- Reset donor links
   UPDATE nhataitro 
   SET nguoidung_id = NULL 
   WHERE nguoidung_id IN (SELECT id FROM nguoidung WHERE masodinhdanh LIKE 'NTT%');
   
   -- Delete created users
   DELETE FROM nguoidung WHERE masodinhdanh LIKE 'NTT%';
   ```

---

## Success Metrics

After deployment, monitor:
- ✅ No 400 errors for "Email required"
- ✅ All new donors have `nguoidung_id` populated
- ✅ Donors can login successfully
- ✅ Donors can view their donation history
- ✅ No duplicate user accounts
- ✅ No broken foreign key relationships
