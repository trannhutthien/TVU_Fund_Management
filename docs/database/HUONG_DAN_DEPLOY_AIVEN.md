# Hướng dẫn Deploy Schema lên Aiven

## Tổng quan

Khi nào cần deploy?
- Tạo bảng mới (danhgia, chucvuquy)
- Thêm cột mới vào bảng cũ (donvicongtac, laidetac, sotienhotrotoida, quy_cha_id)
- Insert dữ liệu mới (loaiquy, quy mẹ)

File migration: `docs/database/deploy_aiven.sql`

---

## Bước 1: Backup Aiven (QUAN TRỌNG)

Trước khi làm gì, phải backup trước.

1. Mở **MySQL Workbench**
2. Kết nối tới Aiven:
   - Host: `mysql-735ef23-trannhutthien012345-f859.b.aivencloud.com`
   - Port: `23536`
   - User: `avnadmin`
   - Password: `AVNS_aSpzodktBU9qxNVmx7o`
   - Database: `defaultdb`
   - SSL: Required (bật trong Advanced → Use SSL: REQUIRED)
3. Sau khi kết nối thành công, vào menu **Server → Data Export**
4. Chọn toàn bộ schema → Export to Self-Contained File
5. Lưu file backup (VD: `backup_aiven_2026-07-15.sql`)

---

## Bước 2: Mở file migration

1. Mở **MySQL Workbench**
2. Kết nối tới Aiven (như bước 1)
3. Vào menu **File → Open SQL Script**
4. Chọn file: `D:\TotNghiep\TVUDevelopmentFundManager\TVU_Fund_Management\docs\database\deploy_aiven.sql`
5. File sẽ mở trong tab mới, hiển thị toàn bộ câu lệnh SQL

---

## Bước 3: Kiểm tra trước khi chạy

Đọc kỹ nội dung file `deploy_aiven.sql`, kiểm tra:

**Các lệnh CREATE TABLE** (tạo bảng mới):
- `danhgia` — Bảng đánh giá / phản hồi
- `chucvuquy` — Bảng chức vụ tổ chức trong quỹ

**Các lệnh ALTER TABLE** (thêm cột vào bảng cũ):
- `nguoidung` thêm cột `donvicongtac` — Để lưu đơn vị công tác của cán bộ
- `yeucauhotro` thêm cột `laidetac` — Đánh dấu đơn nào là đề tài/dự án
- `quy` thêm cột `sotienhotrotoida` — Số tiền hỗ trợ tối đa của quỹ
- `quy` thêm cột `quy_cha_id` — Mối quan hệ quỹ cha - quỹ con

**Các lệnh INSERT** (thêm dữ liệu mới):
- 9 loại quỹ (học bổng, nghiên cứu, vay vốn, khởi nghiệp...)
- Quỹ mẹ "Quỹ phát triển Đại học Trà Vinh" với số dư 2 tỷ

**Lưu ý**: Tất cả lệnh đều dùng `IF NOT EXISTS` và `INSERT IGNORE` nên an toàn, chạy lại也不会 lỗi nếu dữ liệu đã tồn tại.

---

## Bước 4: Chạy migration

1. Trong MySQL Workbench, kiểm tra kết nối đang chọn đúng database: `defaultdb`
2. Nhấn nút **闪电 bolt icon** (Execute) hoặc nhấn **Ctrl+Shift+Enter**
3. Chờ chạy xong, xem kết quả ở panel bên dưới:
   - Nếu thấy "Migration hoàn tất!" = Thành công
   - Nếu có lỗi, đọc dòng lỗi và sửa

**Nếu gặp lỗi**:
- Lỗi "Table already exists" → Bình thường, dùng IF NOT EXISTS rồi
- Lỗi "Duplicate entry" → Bình thường, dùng INSERT IGNORE rồi
- Lỗi kết nối → Kiểm tra SSL, host, port, password

---

## Bước 5: Verify (Kiểm tra)

Sau khi chạy xong, mở tab Query mới và chạy từng lệnh để kiểm tra:

```sql
-- Kiểm tra bảng mới đã tạo
SHOW TABLES LIKE 'danhgia';
SHOW TABLES LIKE 'chucvuquy';

-- Kiểm tra cột mới đã thêm
SHOW COLUMNS FROM nguoidung LIKE 'donvicongtac';
SHOW COLUMNS FROM yeucauhotro LIKE 'laidetac';
SHOW COLUMNS FROM quy LIKE 'sotienhotrotoida';
SHOW COLUMNS FROM quy LIKE 'quy_cha_id';

-- Kiểm tra dữ liệu mới
SELECT * FROM loaiquy;
SELECT * FROM quy WHERE quy_id = 1;
```

Nếu tất cả đều có kết quả = Thành công.

---

## Bước 6: Test ứng dụng

1. Mở trình duyệt → vào trang web
2. Kiểm tra các tính năng mới:
   - Trang Landing: TestimonialsSection hiển thị đánh giá
   - Trang Admin: Quản lý đánh giá
   - Form đăng ký: Kiểm tra các trường mới
   - Trang quỹ: Hiển thị quỹ mẹ

---

## Nếu cần Rollback (Quay lại)

Nếu deploy bị lỗi hoặc muốn quay lại schema cũ:

```sql
-- 1. Xóa bảng mới
DROP TABLE IF EXISTS danhgia;
DROP TABLE IF EXISTS chucvuquy;

-- 2. Xóa cột mới (chỉ chạy nếu chắc chắn)
ALTER TABLE nguoidung DROP COLUMN IF EXISTS donvicongtac;
ALTER TABLE yeucauhotro DROP COLUMN IF EXISTS laidetac;
ALTER TABLE quy DROP COLUMN IF EXISTS sotienhotrotoida;
ALTER TABLE quy DROP COLUMN IF EXISTS quy_cha_id;

-- 3. Xóa dữ liệu seed
DELETE FROM loaiquy WHERE loaiquy_id BETWEEN 1 AND 9;
DELETE FROM quy WHERE quy_id = 1;
```

---

## Cách khác: Dùng dòng lệnh (nếu không có MySQL Workbench)

Mở PowerShell, chạy:

```powershell
# Kết nối và chạy file migration
mysql -h mysql-735ef23-trannhutthien012345-f859.b.aivencloud.com `
      -P 23536 `
      -u avnadmin `
      -p `
      --ssl=REQUIRED `
      defaultdb < "D:\TotNghiep\TVUDevelopmentFundManager\TVU_Fund_Management\docs\database\deploy_aiven.sql"
```

Nhập password khi hỏi: `AVNS_aSpzodktBU9qxNVmx7o`

---

## Lưu ý quan trọng

1. **Luôn backup trước** — Dù dùng cách nào
2. **Chạy trên Aiven, không chạy nhầm local** — Kiểm tra host trước khi Execute
3. **INSERT IGNORE an toàn** — Chạy lại không bị lỗi duplicate
4. **ALTER TABLE an toàn** — Thêm cột mới không mất dữ liệu cũ
5. **SSL bắt buộc** — Aiven yêu cầu SSL, phải bật khi kết nối
6. **UTF-8** — Đảm bảo file SQL và kết nối đều dùng utf8mb4
