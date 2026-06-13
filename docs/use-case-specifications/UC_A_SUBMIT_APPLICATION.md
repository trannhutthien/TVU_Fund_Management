# A. ĐẶC TẢ USE CASE: NỘP ĐƠN HỖ TRỢ VÀ TƯƠNG TÁC AI ASSISTANT

## A.1. THÔNG TIN USE CASE

| **Thuộc tính** | **Nội dung** |
|----------------|--------------|
| **Mã Use Case** | UC-SUBMIT-APPLICATION |
| **Tên Use Case** | Nộp đơn hỗ trợ và AI hỗ trợ viết đơn |
| **Tác nhân chính** | Sinh viên (Student) |
| **Tác nhân phụ** | Hệ thống AI (Gemini API) |
| **Mục đích** | Cho phép sinh viên tạo lập hồ sơ đề xuất hỗ trợ kinh phí trực tuyến, tích hợp trí tuệ nhân tạo để tối ưu nội dung và tự động sinh cấu trúc luồng phê duyệt tương ứng |
| **Mức độ** | Chức năng cốt lõi (Core Feature) |
| **Tần suất sử dụng** | Cao (nhiều lần/ngày) |

### Tiền điều kiện (Preconditions)
1. Sinh viên đã đăng nhập thành công với vai trò `Student`
2. Hệ thống có ít nhất 1 quỹ đang ở trạng thái `Đang hoạt động`
3. Hệ thống AI (Gemini API) đang hoạt động và có kết nối internet

### Hậu điều kiện (Postconditions - Success)
1. Đơn hỗ trợ được lưu vào database với trạng thái `Cho duyet cap 1`
2. 3 bản ghi phê duyệt rỗng (cấp 1, cấp 2, cấp 3) được tạo tự động trong bảng `lichsu_duyet`
3. Sinh viên nhận thông báo xác nhận "Đơn đã được gửi thành công"
4. File đính kèm được lưu vào thư mục `uploads/documents/`
5. Audit Trail ghi nhận hành động `CREATE` với JSON mới

---

## A.2. KỊCH BẢN CHÍNH (MAIN FLOW)

### **Bước 1: Truy cập form nộp đơn**
- Sinh viên đăng nhập vào hệ thống và chọn menu **"Đơn xin hỗ trợ" → "Nộp đơn mới"**
- Hệ thống hiển thị form với các trường:
  - Dropdown **"Chọn quỹ"** (danh sách các quỹ đang hoạt động)
  - Textbox **"Tiêu đề đơn"** (bắt buộc)
  - Textarea **"Lý do hoàn cảnh"** (bắt buộc, tối thiểu 50 ký tự)
  - Input Number **"Số tiền đề xuất"** (bắt buộc, > 0)
  - Upload File **"Minh chứng"** (tùy chọn, tối đa 5MB, định dạng: PDF, JPG, PNG, DOCX)

### **Bước 2: Nhập dữ liệu thô**
- Sinh viên nhập đầy đủ thông tin vào các trường
- Sinh viên đính kèm file minh chứng (nếu có)
- Hệ thống validate ngay lập tức:
  - Kiểm tra độ dài tiêu đề (3-200 ký tự)
  - Kiểm tra nội dung lý do (tối thiểu 50 ký tự)
  - Kiểm tra số tiền > 0 và < giới hạn quỹ
  - Kiểm tra kích thước và định dạng file

### **Bước 3: Lựa chọn tính năng AI (tùy chọn)**
- Sinh viên nhấn nút **"Trợ lý AI"** bên cạnh textarea "Lý do hoàn cảnh"
- Hệ thống hiển thị dropdown với 3 tùy chọn:
  - **"Phân tích hoàn cảnh"** (Analyze): Phân tích điểm mạnh/yếu của nội dung hiện tại
  - **"Tối ưu nội dung"** (Optimize): Sửa lỗi chính tả, chuẩn hóa văn phong khoa học
  - **"Viết lại toàn bộ"** (Draft): Tạo bản hoàn chỉnh dựa trên thông tin cơ bản
- Sinh viên chọn một trong 3 tùy chọn

### **Bước 4: Xử lý AI và hiển thị kết quả**
- Hệ thống hiển thị loading spinner với text "Đang xử lý..."
- Backend gọi API `POST /api/applications/ai-assist` với payload:
  ```json
  {
    "action": "optimize",
    "rawContent": "Nội dung sinh viên nhập...",
    "fundType": "Học bổng",
    "requestedAmount": 5000000
  }
  ```
- Gemini API xử lý và trả về kết quả qua Server-Sent Events (streaming)
- Frontend hiển thị kết quả dần dần (typewriter effect) vào ô **"Nội dung đã tối ưu"**
- Sinh viên xem xét kết quả và có thể:
  - **"Áp dụng"**: Thay thế nội dung cũ bằng nội dung AI
  - **"Chỉnh sửa"**: Giữ lại kết quả AI nhưng tự chỉnh sửa thêm
  - **"Hủy"**: Giữ nguyên nội dung cũ

### **Bước 5: Xác nhận và gửi đơn**
- Sinh viên kiểm tra lại toàn bộ thông tin
- Sinh viên nhấn nút **"Gửi đơn"**
- Hệ thống hiển thị popup xác nhận: 
  > "Bạn có chắc chắn muốn gửi đơn này? Sau khi gửi, bạn không thể chỉnh sửa."
- Sinh viên nhấn **"Xác nhận"**

### **Bước 6: Hệ thống xử lý Transaction**
Backend thực hiện transaction cơ sở dữ liệu theo thứ tự:

```sql
BEGIN TRANSACTION;

-- Bước 6.1: Lưu đơn hỗ trợ
INSERT INTO de_xuat_ho_tro (
  id_sinh_vien, id_quy, tieu_de, ly_do, 
  so_tien_de_xuat, trang_thai, ngay_nop, file_dinh_kem
) VALUES (
  @userId, @fundId, @title, @optimizedContent, 
  @amount, 'Cho duyet cap 1', NOW(), @filePath
);
SET @applicationId = LAST_INSERT_ID();

-- Bước 6.2: Tạo 3 bản ghi phê duyệt rỗng
INSERT INTO lichsu_duyet (id_de_xuat, cap_duyet, trang_thai, ngay_tao) VALUES
  (@applicationId, 1, 'Cho duyet', NOW()),
  (@applicationId, 2, 'Chua bat dau', NOW()),
  (@applicationId, 3, 'Chua bat dau', NOW());

-- Bước 6.3: Ghi Audit Trail
INSERT INTO nhat_ky_he_thong (
  action, table_name, record_id, user_id, 
  changes, created_at
) VALUES (
  'CREATE', 'de_xuat_ho_tro', @applicationId, @userId,
  JSON_OBJECT('new', @applicationData), NOW()
);

COMMIT;
```

### **Bước 7: Thông báo thành công**
- Hệ thống hiển thị thông báo success:
  > "✓ Đơn hỗ trợ đã được gửi thành công! Mã đơn: #DX20240001"
- Hệ thống tự động chuyển hướng về trang **"Danh sách đơn của tôi"** sau 2 giây
- Sinh viên nhận email thông báo xác nhận nộp đơn (background job)

---

## A.3. LUỒNG NGOẠI LỆ (ALTERNATIVE FLOWS)

### **A.3.1. Lỗi Validation dữ liệu đầu vào**

**Điều kiện kích hoạt:** 
- Tại **Bước 2** hoặc **Bước 5**, dữ liệu không hợp lệ

**Các trường hợp cụ thể:**

| **Lỗi** | **Thông báo hiển thị** | **Xử lý** |
|---------|------------------------|-----------|
| Tiêu đề < 3 ký tự | "⚠ Tiêu đề phải có ít nhất 3 ký tự" | Disable nút "Gửi đơn", focus vào textbox |
| Lý do < 50 ký tự | "⚠ Lý do phải có ít nhất 50 ký tự (hiện tại: 23)" | Hiển thị counter động |
| Số tiền ≤ 0 | "⚠ Số tiền phải lớn hơn 0" | Reset về 0, focus vào input |
| Số tiền > giới hạn quỹ | "⚠ Quỹ này chỉ hỗ trợ tối đa 10.000.000 VNĐ" | Hiển thị giới hạn |
| File > 5MB | "⚠ File không được vượt quá 5MB (hiện tại: 7.2MB)" | Xóa file, cho phép upload lại |
| Định dạng file không hợp lệ | "⚠ Chỉ chấp nhận PDF, JPG, PNG, DOCX" | Xóa file, hiển thị định dạng hợp lệ |

**Hậu điều kiện:**
- Đơn không được lưu
- Người dùng ở lại trang form để sửa lỗi

---

### **A.3.2. Lỗi kết nối API AI**

**Điều kiện kích hoạt:**
- Tại **Bước 4**, API Gemini không phản hồi sau 10 giây hoặc trả về lỗi 500/503

**Kịch bản:**

1. Hệ thống phát hiện timeout hoặc lỗi từ Gemini API
2. Hệ thống ghi log lỗi vào `error.log`:
   ```
   [ERROR] 2024-06-11 14:35:22 - Gemini API timeout
   User: SV2024001, Action: optimize, Error: ETIMEDOUT
   ```
3. Frontend hiển thị thông báo lỗi màu vàng (warning):
   > "⚠ Không thể kết nối với AI Assistant. Bạn có thể tiếp tục nộp đơn với nội dung hiện tại."
4. Hệ thống ẩn ô "Nội dung đã tối ưu"
5. Sinh viên có 2 lựa chọn:
   - **"Thử lại"**: Gọi lại API AI
   - **"Tiếp tục không dùng AI"**: Giữ nguyên nội dung thô và tiếp tục bước 5

**Hậu điều kiện:**
- Đơn vẫn có thể được gửi thành công với nội dung không qua AI
- Hệ thống vẫn hoạt động bình thường (Graceful Degradation)

---

### **A.3.3. Sinh viên hủy bỏ giữa chừng**

**Điều kiện kích hoạt:**
- Tại bất kỳ bước nào từ **Bước 1-5**, sinh viên nhấn nút **"Hủy"** hoặc đóng trình duyệt

**Kịch bản:**

1. **Nếu chưa nhập gì**: Hệ thống đóng form ngay lập tức
2. **Nếu đã nhập một phần dữ liệu**: Hệ thống hiển thị popup xác nhận:
   > "⚠ Bạn có dữ liệu chưa lưu. Bạn có chắc muốn rời khỏi trang?"
   - **"Rời khỏi"**: Đóng form, dữ liệu bị mất
   - **"Ở lại"**: Tiếp tục chỉnh sửa

3. **Tính năng "Lưu nháp" (nếu triển khai sau này)**:
   - Sinh viên nhấn **"Lưu nháp"**
   - Hệ thống lưu tạm vào `localStorage` hoặc database với trạng thái `Nhap`
   - Lần sau đăng nhập, sinh viên thấy nút **"Tiếp tục đơn đang soạn"**

**Hậu điều kiện:**
- Đơn không được tạo trong database
- Không có record nào trong `de_xuat_ho_tro` và `lichsu_duyet`

---

### **A.3.4. Lỗi Transaction Database**

**Điều kiện kích hoạt:**
- Tại **Bước 6**, một trong các câu lệnh SQL bị lỗi (VD: duplicate key, foreign key constraint)

**Kịch bản:**

1. Database phát hiện lỗi khi thực thi `INSERT` hoặc `COMMIT`
2. Hệ thống tự động thực thi `ROLLBACK` để đảm bảo tính toàn vẹn dữ liệu
3. Backend ghi log chi tiết:
   ```
   [ERROR] Transaction failed at Step 6.2
   SQL: INSERT INTO lichsu_duyet...
   Error: Duplicate entry '123-1' for key 'PRIMARY'
   ```
4. Backend trả về HTTP 500 với message:
   ```json
   {
     "success": false,
     "error": "DATABASE_ERROR",
     "message": "Lỗi hệ thống. Vui lòng thử lại sau."
   }
   ```
5. Frontend hiển thị thông báo lỗi màu đỏ:
   > "✗ Có lỗi xảy ra khi lưu đơn. Vui lòng thử lại sau hoặc liên hệ quản trị viên."
6. Sinh viên nhấn **"Thử lại"** để submit lại

**Hậu điều kiện:**
- Không có dữ liệu nào được ghi vào database (nhờ ROLLBACK)
- Dữ liệu trên form vẫn còn, sinh viên không mất công nhập lại

---

### **A.3.5. Upload file thất bại**

**Điều kiện kích hoạt:**
- Tại **Bước 2**, quá trình upload file bị gián đoạn hoặc lỗi Multer

**Các lỗi phổ biến:**

| **Lỗi** | **Nguyên nhân** | **Xử lý** |
|---------|-----------------|-----------|
| `LIMIT_FILE_SIZE` | File > 5MB | Hiển thị: "File quá lớn. Tối đa 5MB" |
| `INVALID_MIME_TYPE` | Định dạng không hợp lệ | Hiển thị: "Chỉ chấp nhận PDF, JPG, PNG, DOCX" |
| `UPLOAD_INTERRUPTED` | Mất kết nối giữa chừng | Hiển thị: "Upload bị gián đoạn. Thử lại" |
| `DISK_FULL` | Server hết dung lượng | Hiển thị: "Lỗi hệ thống. Liên hệ admin" |

**Kịch bản:**

1. File upload thất bại, Multer trả về error
2. Backend không lưu file, trả về HTTP 400:
   ```json
   {
     "success": false,
     "error": "UPLOAD_ERROR",
     "code": "LIMIT_FILE_SIZE",
     "message": "File vượt quá 5MB"
   }
   ```
3. Frontend hiển thị thông báo lỗi dưới input file
4. Sinh viên có thể:
   - Nén file lại và upload lại
   - Hoặc tiếp tục nộp đơn mà không đính kèm file (nếu file là tùy chọn)

**Hậu điều kiện:**
- Đơn vẫn có thể được gửi mà không có file đính kèm (nếu file là tùy chọn)

---

## A.4. YÊU CẦU PHI CHỨC NĂNG

### Hiệu năng (Performance)
- API AI phản hồi trong vòng **5 giây** (95th percentile)
- Form submit hoàn tất trong **< 2 giây**
- Upload file 5MB hoàn tất trong **< 10 giây** (mạng 4G)

### Bảo mật (Security)
- Mã hóa dữ liệu nhạy cảm (số tiền, lý do) bằng AES-256 trước khi gửi lên server
- Validate dữ liệu cả **client-side** và **server-side** để chống XSS, SQL Injection
- File upload được scan virus bằng ClamAV trước khi lưu

### Khả dụng (Availability)
- Hệ thống vẫn hoạt động bình thường nếu AI lỗi (Graceful Degradation)
- Hiển thị thông báo lỗi rõ ràng, không để blank screen

### Khả năng sử dụng (Usability)
- Giao diện responsive, hoạt động tốt trên mobile
- Hiển thị realtime character counter cho textarea
- Auto-save mỗi 30 giây (nếu có tính năng Lưu nháp)

---

## A.5. QUY TẮC NGHIỆP VỤ

**BR-01:** Sinh viên chỉ được nộp đơn cho các quỹ có `trang_thai = 'Hoat dong'`

**BR-02:** Một sinh viên có thể có **nhiều đơn** đang xử lý cùng lúc (không giới hạn số lượng)

**BR-03:** Số tiền đề xuất phải **≤ giới hạn tối đa** của quỹ (nếu quỹ có giới hạn)

**BR-04:** File đính kèm là **tùy chọn**, nhưng khuyến khích để tăng tỷ lệ duyệt

**BR-05:** Sau khi gửi, sinh viên **không thể chỉnh sửa** đơn. Muốn sửa phải liên hệ Admin để chuyển về trạng thái "Nháp"

**BR-06:** Nội dung AI tạo ra chỉ là **gợi ý**, sinh viên có toàn quyền chỉnh sửa hoặc không sử dụng

---

## A.6. BIỂU ĐỒ MINH HỌA

- **Hình 3.1:** Activity Diagram - Sinh viên nộp đơn (AD03)
- **Hình 3.2:** Sequence Diagram - AI hỗ trợ viết đơn (SD09)
- **Hình 3.3:** Sequence Diagram - Lưu đơn và khởi tạo phê duyệt (SD_NEW)
