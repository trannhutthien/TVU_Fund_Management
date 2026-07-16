# Hướng dẫn Deploy Schema lên Aiven

## Tổng quan

Khi nào cần deploy?
- Tạo bảng mới (danhgia, chucvuquy)
- Thêm cột mới vào bảng cũ (donvicongtac, laidetac, sotienhotrotoida, quy_cha_id)
- Insert dữ liệu mới (loaiquy, quy mẹ)

File migration: `docs/database/deploy_aiven.sql`

**Lưu ý**: phpMyAdmin trên XAMPP chỉ quản lý MySQL local, không kết nối được Aiven. Phải dùng MySQL CLI hoặc MySQL Workbench để kết nối Aiven từ xa.

---

## Cách 1: Dùng MySQL CLI của XAMPP (Khuyến nghị - nhanh nhất)

### Bước 1: Mở PowerShell

Nhấn **Windows + R** → gõ `powershell` → Enter

### Bước 2: Chạy lệnh kết nối và import

Copy toàn bộ lệnh bên dưới, dán vào PowerShell, rồi nhấn Enter:

```powershell
& "C:\xampp\mysql\bin\mysql.exe" -h mysql-735ef23-trannhutthien012345-f859.b.aivencloud.com -P 23536 -u avnadmin -p --ssl=REQUIRED defaultdb < "D:\TotNghiep\TVUDevelopmentFundManager\TVU_Fund_Management\docs\database\deploy_aiven.sql"
```

### Bước 3: Nhập password

Sau khi nhấn Enter, terminal sẽ hỏi password. Gõ密码: `AVNS_aSpzodktBU9qxNVmx7o`

Lưu ý: Khi gõ password sẽ không hiện ký tự nào (đúng rồi, đó là bảo mật). Gõ xong nhấn Enter.

### Bước 4: Kiểm tra kết quả

Nếu thấy dòng cuối cùng là `Migration hoàn tất!` = Thành công.

Nếu có lỗi, đọc dòng lỗi để biết vấn đề.

### Bước 5: Verify (Kiểm tra)

Chạy lần lượt các lệnh bên dưới trong PowerShell để kiểm tra:

```powershell
& "C:\xampp\mysql\bin\mysql.exe" -h mysql-735ef23-trannhutthien012345-f859.b.aivencloud.com -P 23536 -u avnadmin -p --ssl=REQUIRED defaultdb -e "SHOW TABLES LIKE 'danhgia'; SHOW TABLES LIKE 'chucvuquy'; SELECT COUNT(*) AS so_loai_quy FROM loaiquy; SELECT * FROM quy WHERE quy_id = 1;"
```

Nhập password again: `AVNS_aSpzodktBU9qxNVmx7o`

Nếu thấy:
- Bảng `danhgia` tồn tại
- Bảng `chucvuquy` tồn tại
- `so_loai_quy` = 9
- Có dòng quỹ mẹ với tên "Quỹ phát triển Đại học Trà Vinh"
= Thành công.

---

## Cách 2: Dùng MySQL Workbench

### Bước 1: Tải và cài MySQL Workbench

Nếu chưa có, tải từ: https://dev.mysql.com/downloads/workbench/

### Bước 2: Kết nối Aiven

1. Mở MySQL Workbench
2. Nhấn nút **+** bên cạnh MySQL Connections
3. Điền thông tin:
   - Connection Name: `Aiven TVU`
   - Hostname: `mysql-735ef23-trannhutthien012345-f859.b.aivencloud.com`
   - Port: `23536`
   - Username: `avnadmin`
   - Password: Nhấn **Store in Vault...** → nhập `AVNS_aSpzodktBU9qxNVmx7o`
   - Default Schema: `defaultdb`
4. Nhấn **Test Connection**
5. Nếu thấy "Successfully made the MySQL connection" = OK
6. Nhấn **OK** để lưu

### Bước 3: Import migration

1. Kết nối vào Aiven (nhấp đôi vào connection vừa tạo)
2. Vào menu **File → Open SQL Script**
3. Chọn file: `D:\TotNghiep\TVUDevelopmentFundManager\TVU_Fund_Management\docs\database\deploy_aiven.sql`
4. Nhấn nút **闪电 bolt icon** (Execute) hoặc **Ctrl+Shift+Enter**
5. Chờ chạy xong, xem kết quả ở panel bên dưới

### Bước 4: Verify

Mở tab Query mới, chạy:

```sql
SHOW TABLES LIKE 'danhgia';
SHOW TABLES LIKE 'chucvuquy';
SELECT COUNT(*) AS so_loai_quy FROM loaiquy;
SELECT * FROM quy WHERE quy_id = 1;
```

---

## Lưu ý quan trọng

1. **Luôn backup trước** — Dù dùng cách nào
2. **Chạy trên Aiven, không chạy nhầm local** — Kiểm tra host trước khi Execute
3. **INSERT IGNORE an toàn** — Chạy lại không bị lỗi duplicate
4. **ALTER TABLE an toàn** — Thêm cột mới không mất dữ liệu cũ
5. **SSL bắt buộc** — Aiven yêu cầu SSL, phải bật khi kết nối
6. **UTF-8** — Đảm bảo file SQL và kết nối đều dùng utf8mb4
