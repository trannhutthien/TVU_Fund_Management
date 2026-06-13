# C. ĐẶC TẢ USE CASE: XÁC NHẬN KHOẢN TÀI TRỢ VÀO QUỸ

## C.1. THÔNG TIN USE CASE

| **Thuộc tính** | **Nội dung** |
|----------------|--------------|
| **Mã Use Case** | UC-FINANCIAL-CONTROL |
| **Tên Use Case** | Xác nhận khoản tài trợ và kiểm soát dòng tiền vào quỹ |
| **Tác nhân chính** | Kế toán (Accountant) |
| **Tác nhân phụ** | Admin (giám sát), Nhà tài trợ (Donor) |
| **Mục đích** | Xác nhận các khoản tài trợ từ nhà tài trợ chuyển vào quỹ, đối soát sao kê ngân hàng, cập nhật số dư quỹ và ghi nhận giao dịch THU để đảm bảo tính minh bạch và truy xuất nguồn gốc |
| **Mức độ** | Chức năng cốt lõi - Quan trọng |
| **Tần suất sử dụng** | Trung bình (3-7 lần/ngày) |

### Tiền điều kiện (Preconditions)
1. Kế toán hoặc Admin đã đăng nhập với vai trò hợp lệ
2. Nhà tài trợ đã thực hiện quyên góp trên hệ thống (tạo bản ghi `donation` với trạng thái `Cho xac nhan`)
3. Nhà tài trợ đã chuyển khoản thực tế vào tài khoản ngân hàng của quỹ
4. Có sao kê ngân hàng hoặc chứng từ xác nhận giao dịch

### Hậu điều kiện (Postconditions - Success)
1. **Số dư quỹ** được cộng thêm số tiền tài trợ
2. **Giao dịch THU** được tạo với đầy đủ thông tin: mã GD, số tiền, ngày, chứng từ
3. Trạng thái donation chuyển thành `Da xac nhan`
4. **Audit Trail** ghi nhận JSON Diff của số dư quỹ (before/after)
5. Nhà tài trợ nhận thông báo "Khoản tài trợ đã được xác nhận. Cảm ơn bạn!"
6. Hệ thống tự động cập nhật thống kê tổng đóng góp của nhà tài trợ

---

## C.2. KỊCH BẢN CHÍNH (MAIN FLOW)

### **Bước 1: Truy cập phân hệ xác nhận tài trợ**

**Kế toán:**
- Đăng nhập và chọn menu **"Tài chính" → "Xác nhận tài trợ"**
- Hệ thống hiển thị danh sách các khoản quyên góp có `trang_thai = 'Cho xac nhan'`

**Bảng danh sách bao gồm các cột:**

| Mã quyên góp | Nhà tài trợ | Quỹ | Số tiền | Ngày quyên góp | Phương thức | Trạng thái |
|--------------|-------------|-----|---------|----------------|-------------|------------|
| #QG001 | Vinamilk | Học bổng | 50.000.000 | 10/06/2024 | Chuyển khoản | Chờ xác nhận |
| #QG002 | Nguyễn Văn A | Trợ cấp | 5.000.000 | 11/06/2024 | Tiền mặt | Chờ xác nhận |
| #QG003 | TH True Milk | Học bổng | 100.000.000 | 09/06/2024 | Chuyển khoản | Đã xác nhận ✓ |

**Chú thích màu sắc:**
- **Vàng:** Chờ xác nhận - Cần kế toán xử lý
- **Xanh lá:** Đã xác nhận - Đã cộng vào số dư quỹ

---

### **Bước 2: Xem chi tiết khoản quyên góp**

Kế toán chọn khoản quyên góp #QG001, hệ thống hiển thị modal chi tiết:

**Thông tin nhà tài trợ:**
- Tên: Vinamilk
- Mã NTT: DONOR001
- Email: csr@vinamilk.com.vn
- Số điện thoại: 028 5413 6666
- Tổng đóng góp trước đó: 500.000.000 VNĐ

**Thông tin khoản quyên góp:**
- Mã quyên góp: #QG001
- Quỹ: Học bổng
- Số tiền: 50.000.000 VNĐ
- Ngày quyên góp: 10/06/2024 14:30:00
- Phương thức: Chuyển khoản ngân hàng
- Lời nhắn: "Ủng hộ sinh viên nghèo vượt khó"

**Thông tin tài khoản nhận (của quỹ):**
- Ngân hàng: Vietcombank
- Số TK: 0123456789
- Chủ TK: Quỹ Học Bổng TVU

---

### **Bước 3: Kế toán đối soát sao kê ngân hàng**

**Kế toán thực hiện đối soát:**

1. **Mở sao kê ngân hàng** (Internet Banking hoặc file PDF từ ngân hàng)
2. **Tìm giao dịch tương ứng:**
   - Số tiền: 50.000.000 VNĐ
   - Ngày: 10/06/2024
   - Nội dung: "VINAMILK UNG HO QUY HOC BONG TVU"
   - Số TK gửi: 0987654321 (TK của Vinamilk)
   
3. **Xác nhận khớp thông tin:**
   - ✓ Số tiền khớp
   - ✓ Nhà tài trợ đúng
   - ✓ Quỹ đúng
   - ✓ Có trong sao kê ngân hàng

**Lưu ý:** Nếu thông tin không khớp → Chuyển sang luồng ngoại lệ C.3.2

---

### **Bước 4: Upload chứng từ xác nhận**

**Kế toán upload chứng từ:**
- Nhấn nút **"Upload chứng từ"** trên modal
- Chọn file ảnh chụp màn hình sao kê hoặc file PDF ngân hàng
- Hệ thống validate:
  - Định dạng: JPG, PNG, PDF
  - Kích thước: ≤ 5MB
  - File name tự động: `donation_QG001_timestamp.jpg`
- File được lưu vào: `uploads/documents/donations/`

**Lưu ý:** Upload chứng từ là **BẮT BUỘC** để đảm bảo tính minh bạch và truy xuất nguồn gốc.

---

### **Bước 5: Xác nhận khoản tài trợ**

Kế toán nhấn nút **"Xác nhận tài trợ"**.

Hệ thống hiển thị popup xác nhận:
> "⚠ Bạn xác nhận đã nhận được 50.000.000 VNĐ từ Vinamilk? Số dư quỹ sẽ được cộng thêm. Hành động này không thể hoàn tác."

Kế toán nhấn **"Tôi xác nhận"**.

---

### **Bước 6: Hệ thống thực thi Database Transaction**

Đây là bước **QUAN TRỌNG NHẤT** - đảm bảo tính ACID:

```sql
BEGIN TRANSACTION;

-- ════════════════════════════════════════════
-- Bước 6.1: LOCK row quỹ để tránh race condition
-- ════════════════════════════════════════════
SELECT id, so_du 
FROM quy 
WHERE id = @fundId
FOR UPDATE;  -- Row-level lock

SET @currentBalance = (SELECT so_du FROM quy WHERE id = @fundId);

-- ════════════════════════════════════════════
-- Bước 6.2: CỘNG số dư quỹ (dòng tiền VÀO)
-- ════════════════════════════════════════════
UPDATE quy
SET 
  so_du = so_du + @donationAmount,  -- CỘNG thêm
  ngay_cap_nhat = NOW()
WHERE id = @fundId;

-- ════════════════════════════════════════════
-- Bước 6.3: Tạo giao dịch THU (dòng tiền VÀO)
-- ════════════════════════════════════════════
INSERT INTO giao_dich (
  id_quy, loai_giao_dich, so_tien, 
  nguoi_thuc_hien, ngay_giao_dich, 
  mo_ta, file_chung_tu
) VALUES (
  @fundId, 'THU', @donationAmount,
  @userId, NOW(),
  CONCAT('Nhận tài trợ từ ', @donorName, ' - Mã QG: #', @donationCode),
  @receiptFile
);
SET @transactionId = LAST_INSERT_ID();

-- ════════════════════════════════════════════
-- Bước 6.4: Cập nhật trạng thái donation
-- ════════════════════════════════════════════
UPDATE donation
SET 
  trang_thai = 'Da xac nhan',
  id_giao_dich = @transactionId,
  nguoi_xac_nhan = @userId,
  ngay_xac_nhan = NOW(),
  ngay_cap_nhat = NOW()
WHERE id = @donationId;

-- ════════════════════════════════════════════
-- Bước 6.5: Cập nhật tổng đóng góp của nhà tài trợ
-- ════════════════════════════════════════════
UPDATE donor
SET 
  tong_dong_gop = tong_dong_gop + @donationAmount,
  so_lan_dong_gop = so_lan_dong_gop + 1,
  ngay_cap_nhat = NOW()
WHERE id = @donorId;

-- ════════════════════════════════════════════
-- Bước 6.6: Ghi Audit Trail với JSON Diff
-- ════════════════════════════════════════════
INSERT INTO nhat_ky_he_thong (
  action, table_name, record_id, user_id, changes, created_at
) VALUES (
  'CONFIRM_DONATION', 'quy', @fundId, @userId,
  JSON_OBJECT(
    'old', JSON_OBJECT('so_du', @currentBalance),
    'new', JSON_OBJECT('so_du', @currentBalance + @donationAmount),
    'amount', @donationAmount,
    'donation_id', @donationId,
    'donor_name', @donorName,
    'transaction_id', @transactionId
  ),
  NOW()
);

COMMIT;
```

**Thời gian thực thi:** < 500ms

---

### **Bước 7: Gửi thông báo**

**Thông báo đến Nhà tài trợ (Priority: HIGH):**
```
� Khoản tài trợ của bạn đã được xác nhận

Cảm ơn Vinamilk đã đồng hành cùng TVU!

Mã quyên góp: #QG001
Số tiền: 50.000.000 VNĐ
Quỹ: Học bổng
Ngày xác nhận: 11/06/2024 14:35:22

Tổng đóng góp của bạn: 550.000.000 VNĐ

Chúng tôi sẽ gửi giấy chứng nhận tài trợ 
và báo cáo sử dụng quỹ định kỳ hàng quý.

[Xem chi tiết] [Tải giấy xác nhận]
```

**Thông báo đến Admin (để giám sát):**
```
💰 Khoản tài trợ mới được xác nhận

Nhà tài trợ: Vinamilk
Số tiền: 50.000.000 VNĐ
Quỹ: Học bổng (Số dư mới: 150.000.000 VNĐ)
Người xác nhận: Nguyễn Thị C (Kế toán)
```

---

### **Bước 8: Hiển thị kết quả**

Frontend hiển thị thông báo thành công:
> "✓ Xác nhận tài trợ thành công! Mã giao dịch: #GD20240001"

Hệ thống tự động:
- Làm mới danh sách quyên góp (khoản vừa xác nhận chuyển sang tab "Đã xác nhận")
- Cập nhật số dư quỹ trên Dashboard (50.000.000 → 150.000.000)
- Cập nhật thống kê nhà tài trợ (Vinamilk: 500 triệu → 550 triệu)
- Ghi log: `[INFO] Donation confirmed: QG001 → +50.000.000 VNĐ`

---

## C.3. LUỒNG NGOẠI LỆ (ALTERNATIVE FLOWS)

### **C.3.1. Khoản tài trợ không có trong sao kê ngân hàng**

**Điều kiện kích hoạt:**
- Tại **Bước 3**, kế toán không tìm thấy giao dịch tương ứng trong sao kê ngân hàng

**Kịch bản:**

1. Nhà tài trợ tạo donation trên hệ thống: 10.000.000 VNĐ
2. Kế toán kiểm tra sao kê ngân hàng → Không thấy giao dịch nào khớp
3. Kế toán **KHÔNG ĐƯỢC** xác nhận donation này

**Nguyên nhân có thể:**
- Nhà tài trợ chưa chuyển khoản thực tế
- Nhà tài trợ nhập sai số tiền trên hệ thống
- Giao dịch đang pending ở ngân hàng
- Chuyển nhầm tài khoản khác

**Hành động:**
1. Kế toán nhấn nút **"Báo lỗi"** → Chọn lý do: "Không thấy trong sao kê"
2. Hệ thống gửi email đến nhà tài trợ:
   > "⚠ Khoản quyên góp #QG002 chưa thể xác nhận
   > 
   > Lý do: Chưa thấy giao dịch trong sao kê ngân hàng
   > 
   > Vui lòng kiểm tra:
   > - Đã chuyển khoản chưa?
   > - Số tiền có đúng không?
   > - Chuyển đúng số TK: 0123456789 - VCB?
   > 
   > Hoặc liên hệ: 0123456789"

3. Donation chuyển trạng thái sang `Loi` (tạm giữ, chưa xóa)
4. Admin có thể can thiệp kiểm tra và xử lý

**Hậu điều kiện:**
- Không có thay đổi gì trong số dư quỹ
- Donation chưa được xác nhận

---

### **C.3.2. Số tiền không khớp giữa donation và sao kê**

**Điều kiện kích hoạt:**
- Tại **Bước 3**, số tiền trong donation khác với số tiền trong sao kê ngân hàng

**Kịch bản:**

1. Nhà tài trợ tạo donation: **10.000.000 VNĐ**
2. Kế toán kiểm tra sao kê → Thấy giao dịch nhưng số tiền là: **8.000.000 VNĐ**
3. Kế toán **KHÔNG ĐƯỢC** xác nhận với số tiền gốc

**Hành động:**

Kế toán có 2 lựa chọn:

**Lựa chọn 1: Sửa số tiền donation (nếu nhà tài trợ nhập nhầm)**
- Nhấn nút **"Chỉnh sửa số tiền"**
- Thay đổi 10.000.000 → 8.000.000
- Ghi chú: "Điều chỉnh theo sao kê thực tế"
- Xác nhận với số tiền mới

**Lựa chọn 2: Liên hệ nhà tài trợ (nếu chuyển thiếu)**
- Nhấn **"Yêu cầu bổ sung"**
- Hệ thống gửi email: 
  > "Khoản quyên góp #QG002: Đã nhận 8.000.000 VNĐ, còn thiếu 2.000.000 VNĐ so với cam kết"

**Audit Trail ghi nhận:**
```json
{
  "action": "ADJUST_DONATION_AMOUNT",
  "old_amount": 10000000,
  "new_amount": 8000000,
  "reason": "Điều chỉnh theo sao kê",
  "user": "ketoan_001"
}
```

**Hậu điều kiện:**
- Chỉ xác nhận với số tiền THỰC TẾ nhận được
- Tránh sai lệch giữa hệ thống và thực tế

---

### **C.3.3. Chứng từ không hợp lệ**

**Điều kiện kích hoạt:**
- Tại **Bước 4**, kế toán upload file không đúng định dạng hoặc quá lớn

**Các lỗi phổ biến:**

| **Lỗi** | **Thông báo** | **Xử lý** |
|---------|---------------|-----------|
| File > 5MB | "Chứng từ không được vượt quá 5MB" | Yêu cầu nén file |
| Định dạng không hợp lệ | "Chỉ chấp nhận JPG, PNG, PDF" | Yêu cầu đổi định dạng |
| File bị hỏng | "Không thể đọc file. Upload lại" | Upload file mới |
| Không upload | "Phải upload chứng từ trước khi xác nhận" | Disable nút xác nhận |

**Kịch bản:**
1. Kế toán cố nhấn "Xác nhận tài trợ" mà chưa upload chứng từ
2. Frontend validation phát hiện, hiển thị:
   > "⚠ Bạn phải upload chứng từ sao kê ngân hàng trước khi xác nhận"
3. Focus vào ô upload, highlight viền đỏ
4. Nút "Xác nhận tài trợ" bị disable

**Hậu điều kiện:**
- Không thể xác nhận nếu không có chứng từ
- Đảm bảo tính minh bạch và truy xuất nguồn gốc

---

### **C.3.4. Race Condition (2 kế toán cùng xác nhận một donation)**

**Điều kiện kích hoạt:**
- Hai kế toán A và B cùng lúc xác nhận cùng một khoản quyên góp #QG001

**Kịch bản:**

1. Kế toán A mở donation #QG001 (14:35:00)
2. Kế toán B cũng mở donation #QG001 (14:35:05)
3. Kế toán A nhấn "Xác nhận" trước (14:35:10)
4. Kế toán B nhấn "Xác nhận" sau 2 giây (14:35:12)

**Với Row-level Locking:**
```
14:35:10 | KT-A: SELECT FOR UPDATE → LOCK row donation ✓
14:35:12 | KT-B: SELECT FOR UPDATE → Chờ KT-A COMMIT...
14:35:11 | KT-A: UPDATE donation → 'Da xac nhan' → COMMIT ✓
14:35:13 | KT-B: Đọc trạng thái mới: 'Da xac nhan'
14:35:14 | KT-B: Kiểm tra trạng thái != 'Cho xac nhan' → ROLLBACK ✗
```

**Thông báo cho Kế toán B:**
> "⚠ Khoản quyên góp này đã được xác nhận bởi Nguyễn Thị C lúc 14:35:10. Danh sách sẽ được làm mới."

**Hậu điều kiện:**
- **Chỉ KT-A thành công**, KT-B nhận thông báo conflict
- **Không bao giờ** xác nhận trùng một donation

---

### **C.3.5. Nhà tài trợ hủy khoản quyên góp sau khi đã tạo**

**Điều kiện kích hoạt:**
- Nhà tài trợ tạo donation nhưng chưa chuyển tiền, muốn hủy bỏ

**Kịch bản:**

1. Nhà tài trợ tạo donation #QG005: 20.000.000 VNĐ
2. Sau 1 ngày, nhà tài trợ thay đổi ý định, muốn hủy
3. Nhà tài trợ truy cập **"Lịch sử quyên góp"** → Nhấn **"Hủy quyên góp"**
4. Hệ thống kiểm tra trạng thái:
   - Nếu `Cho xac nhan` → Cho phép hủy ✓
   - Nếu `Da xac nhan` → KHÔNG cho phép hủy ✗

**Nếu chưa xác nhận:**
- Hệ thống hiển thị popup:
  > "Bạn có chắc muốn hủy khoản quyên góp này? Hành động không thể hoàn tác."
- Nhà tài trợ xác nhận → Trạng thái chuyển thành `Da huy`
- Kế toán không thấy donation này trong danh sách "Chờ xác nhận"

**Nếu đã xác nhận:**
- Hệ thống hiển thị:
  > "❌ Khoản quyên góp đã được xác nhận và cộng vào số dư quỹ. Không thể hủy. Vui lòng liên hệ Admin nếu có sai sót."

**Hậu điều kiện:**
- Chỉ donation chưa xác nhận mới có thể hủy
- Đã xác nhận thì phải qua Admin xử lý (hoàn tiền)

---

### **C.3.6. Lỗi Transaction Rollback**

**Điều kiện kích hoạt:**
- Tại **Bước 6**, một trong các câu lệnh SQL bị lỗi (deadlock, constraint violation)

**Kịch bản:**

1. Transaction bắt đầu, UPDATE quỹ thành công (cộng 50 triệu)
2. INSERT giao dịch bị lỗi: `Duplicate entry 'GD20240001'`
3. Database tự động **ROLLBACK** toàn bộ transaction
4. Backend ghi log lỗi:
   ```
   [ERROR] Donation confirmation transaction failed
   Donation: QG001, User: ketoan_001
   Error: Duplicate entry for key 'ma_giao_dich'
   ```
5. Backend trả về HTTP 500:
   ```json
   {
     "success": false,
     "error": "TRANSACTION_FAILED",
     "message": "Lỗi hệ thống. Vui lòng thử lại."
   }
   ```
6. Frontend hiển thị:
   > "✗ Có lỗi xảy ra khi xử lý giao dịch. Số dư quỹ không bị thay đổi. Vui lòng thử lại."

**Hậu điều kiện:**
- **Dữ liệu KHÔNG thay đổi** (nhờ ROLLBACK)
- Số dư quỹ vẫn nguyên
- Kế toán có thể thử lại ngay
- Donation vẫn ở trạng thái `Cho xac nhan`

---

## C.4. QUY TẮC NGHIỆP VỤ (BUSINESS RULES)

**BR-05:** Công thức cập nhật số dư quỹ khi xác nhận tài trợ:
```
Số dư mới = Số dư hiện tại + Số tiền tài trợ

VD: Số dư quỹ: 100.000.000 VNĐ
    Tài trợ vào: +50.000.000 VNĐ
    Số dư mới: 150.000.000 VNĐ
```

**BR-06:** Xác nhận tài trợ PHẢI đính kèm chứng từ (ảnh sao kê ngân hàng hoặc biên nhận tiền mặt)

**BR-07:** Chỉ được xác nhận khoản tài trợ khi:
- Có trong sao kê ngân hàng (chuyển khoản) HOẶC
- Có biên nhận thu tiền mặt hợp lệ (kế toán ký)

**BR-08:** Số tiền xác nhận PHẢI KHỚP với số tiền thực tế nhận được (không làm tròn, không ước lượng)

**BR-09:** Mọi thay đổi số dư quỹ phải ghi **Audit Trail** với JSON Diff (before/after)

**BR-10:** Một khoản tài trợ chỉ được xác nhận **MỘT LẦN** (không được xác nhận trùng)

**BR-11:** Donation đã xác nhận **KHÔNG THỂ HỦY** (chỉ Admin mới có quyền rollback trong trường hợp đặc biệt)

**BR-12:** Sau khi xác nhận, hệ thống tự động cập nhật:
- `donor.tong_dong_gop` (tổng đóng góp của nhà tài trợ)
- `donor.so_lan_dong_gop` (số lần quyên góp)
- Thống kê quỹ (tổng thu, số lượng tài trợ)

---

## C.5. CƠ CHẾ AN TOÀN TÀI CHÍNH (SAFETY MECHANISMS)

### 1. Database Transaction (ACID)
```sql
BEGIN TRANSACTION;
-- Các câu lệnh SQL: UPDATE quỹ + INSERT giao dịch + UPDATE donation
COMMIT;  -- Hoặc ROLLBACK nếu có lỗi
```
→ Đảm bảo tất cả thay đổi xảy ra đồng thời hoặc không xảy ra gì

### 2. Row-level Locking
```sql
SELECT * FROM quy WHERE id = @fundId FOR UPDATE;
SELECT * FROM donation WHERE id = @donationId FOR UPDATE;
```
→ Ngăn 2 kế toán cùng xác nhận 1 donation hoặc cùng cập nhật 1 quỹ

### 3. Kiểm tra trạng thái trước khi xác nhận
```sql
IF (donation.trang_thai != 'Cho xac nhan') THEN
  ROLLBACK;
  RETURN ERROR 'Donation đã được xử lý';
END IF;
```
→ Tránh xác nhận trùng lặp

### 4. Audit Trail tự động
- Mọi thay đổi số dư quỹ đều ghi log với JSON Diff
- Ghi rõ: số dư cũ, số dư mới, số tiền thay đổi, người thực hiện, thời gian
- Không thể xóa log (chỉ soft delete)

### 5. Validation đa lớp
- **Client-side:** Kiểm tra file chứng từ trước khi submit
- **Server-side:** Kiểm tra trạng thái donation, validate số tiền
- **Database:** Transaction đảm bảo tính toàn vẹn

### 6. Đối soát định kỳ
- Hàng ngày: Kế toán đối soát số dư hệ thống vs sao kê ngân hàng
- Hàng tháng: Admin kiểm tra tổng THU vs tổng CHI
- Hàng quý: Báo cáo tài chính cho nhà tài trợ

---

## C.6. YÊU CẦU PHI CHỨC NĂNG

### Hiệu năng (Performance)
- Transaction xác nhận tài trợ hoàn tất trong **< 500ms**
- Danh sách donation load trong **< 1 giây** (100 records)
- Upload chứng từ 5MB hoàn tất trong **< 10 giây** (mạng 4G)

### Bảo mật (Security)
- **Chỉ Kế toán và Admin** có quyền xác nhận tài trợ
- Mã hóa thông tin tài khoản ngân hàng trong database (AES-256)
- Ghi log đầy đủ mọi thao tác tài chính vào Audit Trail
- Validate dữ liệu cả client-side và server-side để chống XSS, SQL Injection

### Tin cậy (Reliability)
- Đảm bảo **KHÔNG BAO GIỜ** xác nhận trùng lặp một donation
- Sử dụng Row-level Locking để tránh race condition
- Tự động ROLLBACK nếu có bất kỳ lỗi nào trong transaction
- Số dư quỹ luôn khớp với tổng THU - CHI

### Khả dụng (Availability)
- Hệ thống vẫn hoạt động nếu tính năng thông báo lỗi
- Hiển thị thông báo lỗi rõ ràng, không để blank screen
- Cho phép xác nhận offline (upload chứng từ trước, xác nhận sau)

### Truy xuất được (Traceability)
- Mọi khoản tài trợ đều có người xác nhận (user_id)
- Không cho phép xóa donation đã xác nhận (chỉ đánh dấu lỗi)
- Audit Trail ghi nhận đầy đủ before/after của mọi thay đổi số dư
- Có thể truy xuất nguồn gốc từ donation → giao dịch → quỹ

### Tính toán chính xác (Accuracy)
- Số dư quỹ phải chính xác đến đồng
- Không làm tròn, không ước lượng
- Công thức: `Số dư = Số dư đầu kỳ + Tổng THU - Tổng CHI`

---

## C.7. PHÂN BIỆT VỚI USE CASE B (PHÊ DUYỆT CẤP 3 - GIẢI NGÂN)

| **Tiêu chí** | **Use Case B - Cấp 3 (Giải ngân)** | **Use Case C (Xác nhận tài trợ)** |
|--------------|-------------------------------------|-----------------------------------|
| **Mục đích** | Chi tiền RA cho sinh viên | Nhận tiền VÀO từ nhà tài trợ |
| **Dòng tiền** | CHI (Outflow) ⬇ | THU (Inflow) ⬆ |
| **Tác nhân** | Kế toán (phê duyệt cấp 3) | Kế toán + Admin (xác nhận) |
| **Đối tượng** | Đơn hỗ trợ (de_xuat_ho_tro) | Quyên góp (donation) |
| **Điều kiện** | Số dư khả dụng ≥ Số tiền giải ngân | Có trong sao kê ngân hàng |
| **Tác động số dư** | Số dư quỹ **TRỪ** đi | Số dư quỹ **CỘNG** thêm |
| **Loại giao dịch** | Giao dịch CHI | Giao dịch THU |
| **Chứng từ** | Biên lai chuyển khoản cho SV | Sao kê ngân hàng nhận tiền |
| **Thông báo** | Gửi sinh viên | Gửi nhà tài trợ |
| **Rủi ro** | Số dư âm nếu không kiểm soát | Xác nhận trùng lặp |

**Ví dụ minh họa:**

```
Ban đầu: Quỹ có 100 triệu

Use Case C: Vinamilk tài trợ 50 triệu
→ Số dư: 100 + 50 = 150 triệu ⬆

Use Case B: Giải ngân cho sinh viên A: 10 triệu
→ Số dư: 150 - 10 = 140 triệu ⬇

Use Case C: TH True Milk tài trợ 30 triệu
→ Số dư: 140 + 30 = 170 triệu ⬆

Use Case B: Giải ngân cho sinh viên B: 15 triệu
→ Số dư: 170 - 15 = 155 triệu ⬇
```

---

## C.8. BIỂU ĐỒ MINH HỌA

- **Hình 3.7:** Activity Diagram - Kế toán xác nhận tài trợ (AD08a)
- **Hình 3.8:** Activity Diagram - Admin kiểm soát tài trợ (AD08b)
- **Hình 3.9:** Sequence Diagram - Xác nhận donation và cập nhật quỹ (SD_NEW)
- **Hình 3.10:** Sequence Diagram - Đối soát sao kê ngân hàng (SD_NEW)
- **Hình 3.11:** Sequence Diagram - Middleware Audit Trail (SD11)

