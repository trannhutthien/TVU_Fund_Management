# B. ĐẶC TẢ USE CASE: LUỒNG KIỂM SOÁT PHÊ DUYỆT ĐA CẤP

## B.1. THÔNG TIN USE CASE

| **Thuộc tính** | **Nội dung** |
|----------------|--------------|
| **Mã Use Case** | UC-MULTI-STAGE-APPROVAL |
| **Tên Use Case** | Phê duyệt đơn hỗ trợ đa cấp |
| **Tác nhân chính** | • Cán bộ quỹ (Duyệt Cấp 1)<br>• Admin (Duyệt Cấp 2)<br>• Kế toán (Duyệt Cấp 3 - Giải ngân) |
| **Tác nhân phụ** | Sinh viên (nhận thông báo kết quả) |
| **Mục đích** | Thẩm định tính pháp lý và thực trạng hoàn cảnh của sinh viên theo mô hình phân cấp nghiêm ngặt để đảm bảo tính khách quan, minh bạch và trách nhiệm giải trình |
| **Mức độ** | Chức năng cốt lõi (Core Feature) |
| **Tần suất sử dụng** | Cao (nhiều lần/ngày) |

### Tiền điều kiện (Preconditions)
1. Tác nhân đã đăng nhập với vai trò có quyền phê duyệt (`Giao vu`, `Admin`, `Ke toan`)
2. Đơn hỗ trợ tồn tại trong hệ thống với trạng thái tương ứng:
   - Cấp 1: `Cho duyet cap 1`
   - Cấp 2: `Cho duyet cap 2`
   - Cấp 3: `Cho giai ngan`
3. Đơn chưa bị từ chối hoặc đã giải ngân

### Hậu điều kiện (Postconditions - Success)
1. **Nếu PHÊ DUYỆT:**
   - Trạng thái đơn chuyển sang cấp tiếp theo hoặc `Da giai ngan` (cấp 3)
   - Bản ghi trong `lichsu_duyet` được cập nhật: `nguoi_duyet`, `ngay_duyet`, `nhan_xet`, `trang_thai = 'Da duyet'`
   - Audit Trail ghi nhận hành động `APPROVE` với JSON Diff
   - Thông báo được gửi đến sinh viên

2. **Nếu TỪ CHỐI:**
   - Trạng thái đơn chuyển thành `Tu choi`
   - Bản ghi trong `lichsu_duyet` ghi nhận lý do từ chối
   - Luồng phê duyệt bị ngắt hoàn toàn
   - Thông báo khẩn cấp gửi đến sinh viên

---

## B.2. KỊCH BẢN CHÍNH (MAIN FLOW)

### **Bước 1: Truy cập danh sách đơn cần duyệt**

**Cán bộ quỹ (Cấp 1):**
- Đăng nhập và chọn menu **"Phê duyệt" → "Đơn cấp 1"**
- Hệ thống hiển thị danh sách đơn có `trang_thai = 'Cho duyet cap 1'`
- Danh sách bao gồm các cột:
  - Mã đơn
  - Tên sinh viên
  - Quỹ
  - Số tiền đề xuất
  - Ngày nộp
  - Trạng thái
  - Hành động (Xem chi tiết)

**Admin (Cấp 2):**
- Chọn menu **"Phê duyệt" → "Đơn cấp 2"**
- Hiển thị danh sách đơn có `trang_thai = 'Cho duyet cap 2'`

**Kế toán (Cấp 3):**
- Chọn menu **"Phê duyệt" → "Đơn chờ giải ngân"**
- Hiển thị danh sách đơn có `trang_thai = 'Cho giai ngan'`

---

### **Bước 2: Xem chi tiết đơn hỗ trợ**

Tác nhân nhấn nút **"Xem chi tiết"** trên một đơn cụ thể.

Hệ thống hiển thị modal/trang chi tiết với các thông tin:

**2.1. Thông tin sinh viên:**
- Mã sinh viên
- Họ tên
- Khoa/Ngành
- Số điện thoại
- Email

**2.2. Thông tin đơn:**
- Tiêu đề
- Lý do hoàn cảnh (đã qua AI hoặc gốc)
- Số tiền đề xuất (VNĐ)
- Quỹ mục tiêu
- Ngày nộp
- File đính kèm (có thể tải về)

**2.3. Lịch sử phê duyệt:**
Bảng hiển thị 3 cấp duyệt:

| Cấp | Người duyệt | Ngày duyệt | Trạng thái | Nhận xét |
|-----|-------------|------------|------------|----------|
| 1 | Trống | - | Chờ duyệt | - |
| 2 | Trống | - | Chưa bắt đầu | - |
| 3 | Trống | - | Chưa bắt đầu | - |

**Lưu ý:** 
- **Cán bộ quỹ** chỉ thấy cấp 1
- **Admin** thấy được cấp 1 và cấp 2
- **Kế toán** thấy cả 3 cấp

---

### **Bước 3: Đánh giá và quyết định**

Tác nhân đọc kỹ thông tin và có 2 lựa chọn:

**3A. PHÊ DUYỆT:**
- Nhấn nút **"Phê duyệt"** (màu xanh)
- Hệ thống hiển thị textarea **"Nhận xét"** (tùy chọn)
- Tác nhân nhập nhận xét như:
  - Cấp 1: "Hồ sơ hợp lệ, hoàn cảnh xác thực"
  - Cấp 2: "Đã xác minh với phòng CTSV, đồng ý"
  - Cấp 3: "Đã chuyển khoản vào tài khoản sinh viên"
- Nhấn **"Xác nhận phê duyệt"**

**3B. TỪ CHỐI:**
- Nhấn nút **"Từ chối"** (màu đỏ)
- Hệ thống hiển thị textarea **"Lý do từ chối"** (BẮT BUỘC)
- Tác nhân PHẢI nhập lý do cụ thể (tối thiểu 20 ký tự):
  - VD: "Hồ sơ thiếu chứng từ minh chứng"
  - VD: "Số tiền đề xuất vượt mức quy định"
  - VD: "Sinh viên không đủ điều kiện hỗ trợ"
- Nhấn **"Xác nhận từ chối"**

---

### **Bước 4: Kiểm tra quyền hạn**

Hệ thống thực hiện kiểm tra:

```javascript
// Middleware: rolesMiddleware.js
function checkApprovalPermission(req, res, next) {
  const { capDuyet } = req.body;
  const userRole = req.user.vai_tro;
  
  // Quy tắc phân quyền
  const permissions = {
    'cap_1': ['Giao vu', 'Admin'],
    'cap_2': ['Admin'],
    'cap_3': ['Ke toan']
  };
  
  if (!permissions[capDuyet].includes(userRole)) {
    return res.status(403).json({
      success: false,
      message: "Bạn không có quyền duyệt cấp này"
    });
  }
  
  next();
}
```

**Nếu không có quyền:** Chuyển sang luồng ngoại lệ **B.3.2**

---

### **Bước 5: Cập nhật database (Transaction)**

Hệ thống thực thi transaction:

#### **5A. Nếu PHÊ DUYỆT:**

```sql
BEGIN TRANSACTION;

-- Bước 5A.1: Cập nhật lịch sử phê duyệt
UPDATE lichsu_duyet
SET 
  nguoi_duyet = @userId,
  ngay_duyet = NOW(),
  nhan_xet = @comment,
  trang_thai = 'Da duyet'
WHERE id_de_xuat = @applicationId 
  AND cap_duyet = @currentLevel;

-- Bước 5A.2: Chuyển trạng thái đơn
UPDATE de_xuat_ho_tro
SET 
  trang_thai = @nextStatus,  -- 'Cho duyet cap 2' hoặc 'Cho giai ngan'
  ngay_cap_nhat = NOW()
WHERE id = @applicationId;

-- Bước 5A.3: Cập nhật trạng thái cấp tiếp theo (nếu có)
UPDATE lichsu_duyet
SET trang_thai = 'Cho duyet'
WHERE id_de_xuat = @applicationId 
  AND cap_duyet = @nextLevel;

-- Bước 5A.4: Ghi Audit Trail
INSERT INTO nhat_ky_he_thong (
  action, table_name, record_id, user_id, changes, created_at
) VALUES (
  'APPROVE', 'de_xuat_ho_tro', @applicationId, @userId,
  JSON_OBJECT(
    'old_status', @oldStatus,
    'new_status', @nextStatus,
    'level', @currentLevel,
    'comment', @comment
  ),
  NOW()
);

COMMIT;
```

#### **5B. Nếu TỪ CHỐI:**

```sql
BEGIN TRANSACTION;

-- Bước 5B.1: Cập nhật lịch sử phê duyệt
UPDATE lichsu_duyet
SET 
  nguoi_duyet = @userId,
  ngay_duyet = NOW(),
  nhan_xet = @rejectReason,
  trang_thai = 'Tu choi'
WHERE id_de_xuat = @applicationId 
  AND cap_duyet = @currentLevel;

-- Bước 5B.2: Chuyển trạng thái đơn thành TỪ CHỐI
UPDATE de_xuat_ho_tro
SET 
  trang_thai = 'Tu choi',
  ngay_cap_nhat = NOW()
WHERE id = @applicationId;

-- Bước 5B.3: Đánh dấu các cấp sau thành "Đã hủy"
UPDATE lichsu_duyet
SET trang_thai = 'Da huy'
WHERE id_de_xuat = @applicationId 
  AND cap_duyet > @currentLevel;

-- Bước 5B.4: Ghi Audit Trail
INSERT INTO nhat_ky_he_thong (
  action, table_name, record_id, user_id, changes, created_at
) VALUES (
  'REJECT', 'de_xuat_ho_tro', @applicationId, @userId,
  JSON_OBJECT(
    'old_status', @oldStatus,
    'new_status', 'Tu choi',
    'level', @currentLevel,
    'reason', @rejectReason
  ),
  NOW()
);

COMMIT;
```

---

### **Bước 6: Gửi thông báo**

#### **6A. Nếu PHÊ DUYỆT:**

**Thông báo đến Sinh viên:**
> 📬 **Đơn của bạn đã được duyệt cấp [1/2]**
>
> Mã đơn: #DX20240001
> 
> Người duyệt: [Tên người duyệt]
> 
> Nhận xét: "[Nội dung nhận xét]"
> 
> Đơn của bạn đang chuyển sang cấp duyệt tiếp theo.

**Thông báo đến Người duyệt cấp tiếp theo:**
> 🔔 **Bạn có 1 đơn mới cần duyệt cấp [2/3]**
>
> Mã đơn: #DX20240001
> 
> Sinh viên: Nguyễn Văn A
> 
> Số tiền: 5.000.000 VNĐ
> 
> [Xem chi tiết]

#### **6B. Nếu TỪ CHỐI:**

**Thông báo khẩn cấp đến Sinh viên:**
> ⚠ **Đơn của bạn đã bị từ chối tại cấp [1/2/3]**
>
> Mã đơn: #DX20240001
> 
> Người từ chối: [Tên người duyệt]
> 
> Lý do: "[Nội dung lý do từ chối]"
> 
> Vui lòng liên hệ phòng CTSV để biết thêm chi tiết.

---

### **Bước 7: Hiển thị kết quả**

**Frontend hiển thị thông báo:**

- **Nếu phê duyệt:**
  > "✓ Đơn #DX20240001 đã được phê duyệt thành công!"
  
- **Nếu từ chối:**
  > "✓ Đơn #DX20240001 đã được từ chối. Sinh viên sẽ nhận được thông báo."

Hệ thống tự động:
- Làm mới danh sách đơn (đơn vừa duyệt biến mất khỏi danh sách)
- Cập nhật số lượng badge trên menu (VD: "Đơn cấp 1 (5)" → "Đơn cấp 1 (4)")

---

## B.3. LUỒNG NGOẠI LỆ (ALTERNATIVE FLOWS)

### **B.3.1. Từ chối đơn mà không nhập lý do**

**Điều kiện kích hoạt:**
- Tại **Bước 3B**, người duyệt nhấn "Xác nhận từ chối" nhưng textarea "Lý do từ chối" bị bỏ trống hoặc < 20 ký tự

**Kịch bản:**

1. Hệ thống phát hiện textarea lý do rỗng
2. Hiển thị thông báo validation màu đỏ:
   > "⚠ Bạn phải nhập lý do từ chối (tối thiểu 20 ký tự)"
3. Focus vào textarea, hiển thị character counter: "(0/20)"
4. Disable nút "Xác nhận từ chối" cho đến khi điều kiện thỏa mãn

**Hậu điều kiện:**
- Đơn không bị từ chối
- Người duyệt phải nhập lý do cụ thể trước khi tiếp tục

**Lý do quy tắc này:**
- Đảm bảo tính minh bạch và trách nhiệm giải trình
- Sinh viên có quyền biết lý do cụ thể để khắc phục

---

### **B.3.2. Quyền hạn không hợp lệ**

**Điều kiện kích hoạt:**
- Tại **Bước 4**, người dùng cố gắng duyệt đơn không thuộc thẩm quyền

**Các trường hợp cụ thể:**

| **Vai trò** | **Cấp được duyệt** | **Cấp KHÔNG được duyệt** |
|-------------|-------------------|--------------------------|
| Cán bộ quỹ | Cấp 1 | Cấp 2, Cấp 3 |
| Admin | Cấp 1, Cấp 2 | Cấp 3 |
| Kế toán | Cấp 3 | Cấp 1, Cấp 2 |

**Kịch bản:**

1. **VD:** Kế toán cố truy cập URL `/api/applications/approve/cap1`
2. Middleware `checkApprovalPermission` phát hiện vai trò không hợp lệ
3. Backend trả về HTTP 403:
   ```json
   {
     "success": false,
     "error": "PERMISSION_DENIED",
     "message": "Bạn không có quyền phê duyệt cấp này"
   }
   ```
4. Frontend hiển thị modal lỗi:
   > "🚫 Bạn không có quyền thực hiện hành động này."
5. Tự động chuyển về trang Dashboard sau 3 giây

**Hậu điều kiện:**
- Không có thay đổi nào trong database
- Hành động bị ghi log vào `nhat_ky_he_thong` với action `PERMISSION_DENIED`

---

### **B.3.3. Đơn đã được duyệt trước đó (Race Condition)**

**Điều kiện kích hoạt:**
- Hai người dùng cùng duyệt một đơn đồng thời
- VD: Admin A và Admin B cùng mở đơn #DX001 và cùng nhấn "Phê duyệt" cách nhau 1 giây

**Kịch bản:**

1. Admin A submit trước → Transaction thành công → Đơn chuyển sang cấp 2
2. Admin B submit sau 1 giây → Hệ thống kiểm tra trạng thái hiện tại
3. Backend phát hiện đơn không còn ở trạng thái `Cho duyet cap 2` nữa
4. Backend trả về HTTP 409 (Conflict):
   ```json
   {
     "success": false,
     "error": "ALREADY_PROCESSED",
     "message": "Đơn này đã được xử lý bởi người dùng khác"
   }
   ```
5. Frontend hiển thị thông báo:
   > "⚠ Đơn này đã được duyệt bởi [Tên Admin A] lúc 14:35:22. Danh sách sẽ được làm mới."
6. Tự động reload danh sách đơn

**Giải pháp kỹ thuật (Row-level Locking):**

```sql
BEGIN TRANSACTION;

-- SELECT FOR UPDATE để lock row
SELECT id, trang_thai 
FROM de_xuat_ho_tro 
WHERE id = @applicationId
FOR UPDATE;

-- Kiểm tra trạng thái
IF (trang_thai != @expectedStatus) THEN
  ROLLBACK;
  RETURN ERROR 'ALREADY_PROCESSED';
END IF;

-- Tiếp tục UPDATE...
COMMIT;
```

**Hậu điều kiện:**
- Chỉ một người duyệt thành công
- Người còn lại nhận thông báo conflict

---

### **B.3.4. Đơn đã bị từ chối ở cấp trước**

**Điều kiện kích hoạt:**
- Tại **Bước 2**, Admin hoặc Kế toán cố truy cập đơn đã bị từ chối ở cấp thấp hơn

**Kịch bản:**

1. Đơn #DX001 bị Cán bộ quỹ từ chối tại cấp 1 → Trạng thái: `Tu choi`
2. Admin cố truy cập URL `/api/applications/detail/DX001`
3. Backend kiểm tra trạng thái, phát hiện `trang_thai = 'Tu choi'`
4. Backend trả về HTTP 400:
   ```json
   {
     "success": false,
     "error": "APPLICATION_REJECTED",
     "message": "Đơn này đã bị từ chối tại cấp 1",
     "rejectedBy": "Nguyễn Thị B",
     "rejectedAt": "2024-06-10 14:20:00",
     "reason": "Hồ sơ thiếu chứng từ"
   }
   ```
5. Frontend hiển thị modal thông tin:
   > "ℹ Đơn này đã bị từ chối tại cấp 1
   >
   > Người từ chối: Nguyễn Thị B
   >
   > Lý do: Hồ sơ thiếu chứng từ
   >
   > [Đóng]"

**Hậu điều kiện:**
- Không thể thao tác gì với đơn đã bị từ chối
- Chỉ Admin có quyền "Khôi phục" đơn (nếu cần)

---

### **B.3.5. Lỗi Transaction Database**

**Điều kiện kích hoạt:**
- Tại **Bước 5**, một trong các câu lệnh UPDATE bị lỗi

**Kịch bản:**

1. Transaction bắt đầu, thực thi `UPDATE lichsu_duyet` thành công
2. Thực thi `UPDATE de_xuat_ho_tro` bị lỗi (VD: foreign key constraint)
3. Database tự động thực thi `ROLLBACK`
4. Backend ghi log chi tiết:
   ```
   [ERROR] Approval transaction failed
   User: admin_001, Application: DX20240001, Level: 2
   SQL Error: Foreign key constraint violation
   ```
5. Backend trả về HTTP 500:
   ```json
   {
     "success": false,
     "error": "DATABASE_ERROR",
     "message": "Lỗi hệ thống. Vui lòng thử lại sau."
   }
   ```
6. Frontend hiển thị thông báo:
   > "✗ Có lỗi xảy ra. Vui lòng thử lại hoặc liên hệ IT Support."

**Hậu điều kiện:**
- Không có dữ liệu nào thay đổi (nhờ ROLLBACK)
- Admin có thể thử lại ngay

---

### **B.3.6. Đơn không thuộc thẩm quyền của người duyệt**

**Điều kiện kích hoạt:**
- Cán bộ quỹ cố duyệt đơn không thuộc quỹ mình quản lý

**Quy tắc nghiệp vụ:**
- **Cán bộ quỹ A** chỉ duyệt đơn thuộc **Quỹ A**
- **Admin** và **Kế toán** duyệt được tất cả quỹ

**Kịch bản:**

1. Cán bộ quỹ "Học bổng" cố duyệt đơn thuộc quỹ "Trợ cấp"
2. Backend kiểm tra:
   ```javascript
   if (userRole === 'Giao vu') {
     const userFundId = req.user.id_quy_quan_ly;
     const applicationFundId = application.id_quy;
     
     if (userFundId !== applicationFundId) {
       return res.status(403).json({
         success: false,
         message: "Bạn chỉ được duyệt đơn thuộc quỹ mình quản lý"
       });
     }
   }
   ```
3. Frontend hiển thị:
   > "🚫 Đơn này không thuộc phạm vi quản lý của bạn."

**Hậu điều kiện:**
- Không có thay đổi nào
- Hành động bị log với `UNAUTHORIZED_ACCESS`

---

## B.4. QUY TẮC NGHIỆP VỤ (BUSINESS RULES)

**BR-01:** Đơn phải qua 3 cấp tuần tự: Cấp 1 → Cấp 2 → Cấp 3. Không được nhảy cấp.

**BR-02:** Cấp cao hơn có quyền xem lịch sử phê duyệt của cấp thấp hơn.

**BR-03:** Từ chối tại bất kỳ cấp nào sẽ dừng toàn bộ luồng. Các cấp sau chuyển thành `Da huy`.

**BR-04:** Người duyệt PHẢI ghi rõ lý do khi từ chối (tối thiểu 20 ký tự).

**BR-05:** Một người không thể tự duyệt đơn của chính mình (nếu là sinh viên겸cán bộ).

**BR-06:** Thời gian phê duyệt được ghi nhận chính xác đến giây để tránh tranh chấp.

**BR-07:** Cán bộ quỹ chỉ duyệt đơn thuộc quỹ mình quản lý. Admin và Kế toán duyệt tất cả.

---

## B.5. MA TRẬN PHÂN QUYỀN

| **Vai trò** | **Cấp 1** | **Cấp 2** | **Cấp 3** | **Từ chối** | **Xem lịch sử** |
|-------------|-----------|-----------|-----------|-------------|-----------------|
| **Sinh viên** | ✗ | ✗ | ✗ | ✗ | Chỉ đơn của mình |
| **Nhà tài trợ** | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Cán bộ quỹ** | ✓ | ✗ | ✗ | ✓ (Cấp 1) | Cấp 1 |
| **Kế toán** | ✗ | ✗ | ✓ | ✓ (Cấp 3) | Cấp 1, 2, 3 |
| **Admin** | ✓ | ✓ | ✗ | ✓ (Cấp 1, 2) | Cấp 1, 2 |

### Giải thích:
- ✓ = Có quyền thực hiện
- ✗ = Không có quyền
- **Lưu ý:** Admin có thể can thiệp vào cấp 1 trong trường hợp khẩn cấp

---

## B.6. YÊU CẦU PHI CHỨC NĂNG

### Hiệu năng
- Danh sách đơn load trong **< 1 giây** (100 records)
- Thao tác phê duyệt/từ chối hoàn tất trong **< 2 giây**

### Bảo mật
- Kiểm tra quyền hạn cả **client-side** và **server-side**
- Ghi log đầy đủ mọi hành động phê duyệt/từ chối vào Audit Trail
- Sử dụng JWT token có thời hạn 8 giờ, sau đó phải đăng nhập lại

### Khả dụng
- Hệ thống vẫn cho phép xem đơn ngay cả khi tính năng thông báo lỗi
- Hiển thị thông báo lỗi rõ ràng thay vì blank screen

### Truy xuất được
- Mọi quyết định phê duyệt/từ chối phải có người chịu trách nhiệm (user_id)
- Không cho phép xóa lịch sử phê duyệt (soft delete only)

---

## B.7. BIỂU ĐỒ MINH HỌA

- **Hình 3.4:** Activity Diagram - Phê duyệt cấp 1 (AD04)
- **Hình 3.5:** Activity Diagram - Phê duyệt cấp 2 (AD05)
- **Hình 3.6:** Activity Diagram - Phê duyệt cấp 3 & Giải ngân (AD06)
