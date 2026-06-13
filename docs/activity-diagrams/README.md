# 📊 ACTIVITY DIAGRAMS - TVU FUND MANAGEMENT SYSTEM

## 📝 Tổng quan

Thư mục này chứa **14 Activity Diagrams** mô tả các luồng hoạt động quan trọng của hệ thống quản lý quỹ hỗ trợ sinh viên TVU.

Tất cả các diagrams được viết bằng **PlantUML** và có thể render thành ảnh bằng các công cụ hỗ trợ PlantUML.

---

## 📂 Danh sách Activity Diagrams

Thư mục này chứa **14 Activity Diagrams** (bao gồm AD08a/AD08b và AD13 mới).

### 🔐 NHÓM 1: XÁC THỰC & PHÂN LOẠI

#### ✅ AD01: Đăng ký tài khoản & Phân loại
- **File**: `AD01_Dang_Ky_Tai_Khoan.puml`
- **Mô tả**: Người dùng đăng ký tài khoản và chọn loại (Sinh viên/Nhà tài trợ)
- **Actors**: Người dùng mới
- **Đặc điểm nổi bật**:
  - ✓ Phân loại ngay từ khi đăng ký
  - ✓ Tự động tạo hồ sơ nhà tài trợ
  - ✓ Hash mật khẩu với bcrypt
  - ✓ Sử dụng Transaction
- **API**: `POST /api/auth/register`

#### ✅ AD02: Đăng nhập & Phân luồng giao diện
- **File**: `AD02_Dang_Nhap_Phan_Luong.puml`
- **Mô tả**: Xác thực và điều hướng người dùng đến dashboard tương ứng
- **Actors**: Tất cả người dùng
- **Đặc điểm nổi bật**:
  - ✓ Xác thực JWT (Access + Refresh Token)
  - ✓ Phân luồng theo role_id (1-4)
  - ✓ Phân biệt Sinh viên/Nhà tài trợ
  - ✓ Token rotation (15 phút + 7 ngày)
- **API**: `POST /api/auth/login`

---

### 🎓 NHÓM 2: CHỨC NĂNG SINH VIÊN

#### ✅ AD03: Sinh viên nộp đơn xin hỗ trợ
- **File**: `AD03_Sinh_Vien_Nop_Don.puml`
- **Mô tả**: Sinh viên xem quỹ và nộp đơn xin hỗ trợ
- **Actors**: Sinh viên (role 4, loại SINH_VIEN)
- **Đặc điểm nổi bật**:
  - ✓ Xem danh sách quỹ đang hoạt động
  - ✓ Validation: Quỹ hoạt động, số tiền hợp lệ
  - ✓ Tạo 3 bản ghi phê duyệt (cấp 1, 2, 3)
  - ✓ Trạng thái ban đầu: "Chờ duyệt cấp 1"
- **API**: `POST /api/applications`

---

### 👔 NHÓM 3: PHÊ DUYỆT 3 CẤP (TÁCH RIÊNG)

> **Lưu ý**: Quy trình phê duyệt được **tách thành 3 diagrams riêng biệt** để dễ hiểu và trình bày trong báo cáo.

#### ✅ AD04: Phê duyệt đơn cấp 1
- **File**: `AD04_Phe_Duyet_Cap_1.puml`
- **Mô tả**: Cán bộ Quỹ phê duyệt hoặc từ chối đơn ở cấp 1
- **Actors**: Cán bộ Quỹ (role 3), Admin (role 1)
- **Đặc điểm**:
  - ✓ Xem đơn có trạng thái "Chờ duyệt cấp 1"
  - ✓ Bắt buộc nhập lý do khi từ chối
  - ✓ Chuyển sang "Chờ duyệt cấp 2" khi duyệt
  - ✓ Ghi lại người duyệt và thời gian
- **Trạng thái**: `Cho duyet cap 1` → `Da duyet cap 1` → `Cho duyet cap 2`
- **API**: 
  - `GET /api/applications?status=Cho duyet cap 1`
  - `PUT /api/applications/:id/approve-level-1`
  - `PUT /api/applications/:id/reject-level-1`

#### ✅ AD05: Phê duyệt đơn cấp 2
- **File**: `AD05_Phe_Duyet_Cap_2.puml`
- **Mô tả**: Cán bộ Quỹ phê duyệt hoặc từ chối đơn ở cấp 2
- **Actors**: Cán bộ Quỹ (role 3), Admin (role 1)
- **Đặc điểm**:
  - ✓ Xem lịch sử phê duyệt cấp 1
  - ✓ Hiển thị ý kiến người duyệt cấp 1
  - ✓ Chuyển sang Kế toán (cấp 3) khi duyệt
  - ✓ Có thể từ chối dù đã qua cấp 1
- **Trạng thái**: `Cho duyet cap 2` → `Da duyet cap 2` → `Cho duyet cap 3`
- **API**: 
  - `GET /api/applications?status=Cho duyet cap 2`
  - `PUT /api/applications/:id/approve-level-2`
  - `PUT /api/applications/:id/reject-level-2`

#### ✅ AD06: Phê duyệt cấp 3 & Giải ngân ⭐⭐⭐
- **File**: `AD06_Phe_Duyet_Cap_3_Giai_Ngan.puml`
- **Mô tả**: Kế toán phê duyệt cấp 3 và thực hiện giải ngân
- **Actors**: Kế toán (role 2), Admin (role 1)
- **Đặc điểm nổi bật**:
  - ⭐ Kiểm tra số dư quỹ thời gian thực
  - ⭐ Trừ tiền tự động khi giải ngân
  - ⭐ Tạo giao dịch CHI để ghi nhận
  - ⭐ Gửi thông báo đến sinh viên
  - ⭐ Xem lịch sử phê duyệt cấp 1, 2
- **Trạng thái**: `Cho duyet cap 3` → `Da duyet cap 3` → `Cho giai ngan` → `Da giai ngan`
- **API**: 
  - `GET /api/applications?status=Cho duyet cap 3`
  - `PUT /api/applications/:id/approve-level-3`
  - `PUT /api/applications/:id/disburse`
  - `PUT /api/applications/:id/reject-level-3`

---

### 💰 NHÓM 4: TÀI TRỢ & XÁC NHẬN

#### ✅ AD07: Nhà tài trợ tạo khoản tài trợ công khai ⭐⭐⭐
- **File**: `AD07_Tai_Tro_Cong_Khai.puml`
- **Mô tả**: Nhà tài trợ xem quỹ và tạo khoản tài trợ
- **Actors**: Nhà tài trợ (role 4, loại NHA_TAI_TRO)
- **Đặc điểm nổi bật**:
  - ⭐ Tự động tạo hồ sơ nhà tài trợ lần đầu
  - ⭐ Chờ xác nhận trước khi cộng tiền vào quỹ
  - ⭐ Upload chứng từ (biên lai, screenshot)
  - ⭐ Trạng thái ban đầu: "Chờ xác nhận"
- **API**: 
  - `GET /api/funds` (public)
  - `POST /api/donations`
  - `GET /api/donations/my-donations`

#### ✅ AD08a: Kế toán xác nhận khoản tài trợ ⭐⭐⭐
- **File**: `AD08a_Ke_Toan_Xac_Nhan_Tai_Tro.puml`
- **Mô tả**: Kế toán kiểm tra chứng từ và xác nhận khoản tài trợ (LUỒNG CHÍNH)
- **Actors**: Kế toán (role 2)
- **Đặc điểm nổi bật**:
  - ⭐ Cộng tiền TỰ ĐỘNG khi xác nhận
  - ⭐ Tạo giao dịch THU để ghi nhận
  - ⭐ Gửi email cảm ơn nhà tài trợ
  - ⭐ Có thể từ chối nếu không khớp
  - ⭐ Đối chiếu với sao kê ngân hàng
- **Trạng thái**: `Cho xac nhan` → `Da nhan` (+ cộng tiền) hoặc `Tu choi`
- **API**: 
  - `GET /api/donations?status=Cho xac nhan`
  - `PUT /api/donations/:id/confirm`
  - `PUT /api/donations/:id/reject`

#### ✅ AD08b: Admin kiểm soát & quản lý tài trợ ⭐⭐
- **File**: `AD08b_Admin_Kiem_Soat_Tai_Tro.puml`
- **Mô tả**: Admin xem tổng quan, thống kê và kiểm soát quy trình tài trợ (GIÁM SÁT)
- **Actors**: Admin (role 1)
- **Đặc điểm nổi bật**:
  - ⭐ Dashboard quản trị toàn diện
  - ⭐ Thống kê và biểu đồ trực quan
  - ⭐ Bộ lọc nâng cao nhiều tiêu chí
  - ⭐ Xuất báo cáo chi tiết
  - ⭐ Giám sát quy trình tài trợ
  - ⭐ Phát hiện bất thường
- **Chức năng**: Xem chi tiết, Thống kê, Xuất báo cáo, Xem lịch sử giao dịch
- **API**: 
  - `GET /api/donations` (với nhiều filters)
  - `GET /api/donations/statistics`
  - `GET /api/donations/export`
  - `GET /api/transactions?type=Thu`

---

### 🏦 NHÓM 5: QUẢN LÝ & BÁO CÁO

#### ✅ AD09: Quản lý quỹ
- **File**: `AD09_Quan_Ly_Quy.puml`
- **Mô tả**: Cán bộ Quỹ tạo, sửa, và thay đổi trạng thái quỹ
- **Actors**: Cán bộ Quỹ (role 3), Admin (role 1)
- **Đặc điểm**:
  - ✓ Tạo quỹ mới
  - ✓ Sửa thông tin quỹ (không cho phép sửa số dư)
  - ✓ Thay đổi trạng thái (Hoạt động/Tạm dừng/Đã đóng)
  - ✓ Cảnh báo khi đóng quỹ (không thể hoàn tác)
  - ✓ Hiển thị số dư thực tế (trừ tiền chờ giải ngân)
- **Trạng thái**: `Dang hoat dong`, `Tam dung`, `Da dong`
- **API**: 
  - `GET /api/funds`
  - `POST /api/funds`
  - `PUT /api/funds/:id`
  - `PUT /api/funds/:id/status`

#### ✅ AD10: Xuất báo cáo tài chính
- **File**: `AD10_Xuat_Bao_Cao.puml`
- **Mô tả**: Kế toán xuất báo cáo Word theo nhiều loại
- **Actors**: Kế toán (role 2), Admin (role 1), Cán bộ (role 3 - một số báo cáo)
- **Loại báo cáo**:
  1. Thu chi tổng hợp
  2. Danh sách nhà tài trợ
  3. Danh sách thủ hưởng
  4. Báo cáo quỹ chi tiết
  5. Báo cáo đề xuất
  6. Báo cáo người dùng
- **Đặc điểm**:
  - ✓ Xuất file Word có thể chỉnh sửa
  - ✓ Sử dụng template chuẩn (docxtemplater)
  - ✓ Bộ lọc linh hoạt (quỹ, ngày, loại)
  - ✓ Tự động tính toán thống kê
- **API**: 
  - `GET /api/reports/revenue-expense`
  - `GET /api/reports/donors`
  - `GET /api/reports/beneficiaries`
  - `GET /api/reports/fund/:id`

---

### 📊 NHÓM 6: NHẬT KÝ & LỊCH SỬ

#### ✅ AD11: Xem nhật ký hệ thống ⭐⭐
- **File**: `AD11_Xem_Nhat_Ky_He_Thong.puml`
- **Mô tả**: Admin xem nhật ký hoạt động của hệ thống
- **Actors**: Admin (role 1)
- **Đặc điểm nổi bật**:
  - ⭐ Ghi lại TẤT CẢ hành động quan trọng
  - ⭐ Lưu dữ liệu cũ/mới (audit trail)
  - ⭐ Ghi IP Address để kiểm soát
  - ⭐ Bộ lọc linh hoạt (user, action, object, time)
  - ⭐ Xuất báo cáo Excel/CSV
- **Loại hành động**: CREATE, UPDATE, DELETE, APPROVE, REJECT, LOGIN, LOGOUT, DISBURSE, CONFIRM
- **API**: 
  - `GET /api/system/logs`
  - `GET /api/system/logs/:id`
  - `GET /api/system/logs/export`

#### ✅ AD12: Xem lịch sử phê duyệt ⭐⭐
- **File**: `AD12_Xem_Lich_Su_Phe_Duyet.puml`
- **Mô tả**: Xem timeline phê duyệt 3 cấp của đơn xin hỗ trợ
- **Actors**: Tất cả (phân quyền xem khác nhau)
- **Đặc điểm nổi bật**:
  - ⭐ Timeline trực quan, dễ hiểu
  - ⭐ Hiển thị đầy đủ thông tin người duyệt
  - ⭐ Ghi rõ lý do từ chối (nếu có)
  - ⭐ Liên kết với giao dịch giải ngân
  - ⭐ Xuất PDF để lưu trữ
  - ⭐ Phân quyền xem rõ ràng
- **Quyền xem**: 
  - Sinh viên: Chỉ xem đơn của mình
  - Cán bộ/Kế toán/Admin: Xem tất cả
- **API**: 
  - `GET /api/applications/:id/approval-history`
  - `GET /api/applications/:id/transaction`
  - `GET /api/applications/:id/export-pdf`

---

### 🔍 NHÓM 6: KỸ THUẬT HỆ THỐNG

#### ✅ AD13: Luồng hoạt động JSON Diff trong Audit Trail ⭐⭐⭐
- **File**: `AD13_JSON_Diff_Flow.puml`
- **Mô tả**: Chi tiết cách hệ thống tự động ghi log thay đổi dữ liệu với JSON Diff
- **Actors**: System (tự động, không có user)
- **Components**:
  - Auth Middleware
  - Audit Middleware (Before & After)
  - JSON Diff Engine
  - Database
  - Log Table
- **Đặc điểm nổi bật**:
  - ⭐ **Tự động hoàn toàn**: Không cần code thủ công
  - ⭐ **Before Snapshot**: Lưu dữ liệu cũ trước khi update
  - ⭐ **After Snapshot**: Lấy dữ liệu mới sau khi update
  - ⭐ **JSON Diff Algorithm**: So sánh chi tiết từng field
  - ⭐ **Changelog JSON**: Ghi rõ changed/unchanged/added/removed
  - ⭐ **Non-blocking**: Log fail không làm request fail
- **JSON Diff Output**:
  ```json
  {
    "changed": {
      "hoten": { "old": "Nguyễn Văn A", "new": "Nguyễn Văn B" },
      "email": { "old": "nva@...", "new": "nvb@..." }
    },
    "unchanged": ["sodienthoai", "diachi"],
    "added": [],
    "removed": [],
    "summary": { "changedCount": 2 }
  }
  ```
- **Use Cases**:
  - Audit compliance (tuân thủ)
  - Security investigation (điều tra)
  - Data recovery (rollback)
  - Debug & troubleshooting
- **Performance Tips**:
  - Cache snapshot trong Redis
  - Async logging (không chặn request)
  - Index log table đúng cách
- **Kết hợp với**: AD11 (Nhật ký hệ thống), SD11 (Sequence Diagram tương ứng)
- **Độ ưu tiên**: ⭐⭐⭐ (QUAN TRỌNG - Thể hiện kỹ thuật cao)

---

## 🎯 Mức độ ưu tiên và tầm quan trọng

### ⭐⭐⭐ QUAN TRỌNG NHẤT (Bắt buộc đưa vào báo cáo)

1. **AD06 - Phê duyệt cấp 3 & Giải ngân**: Luồng quan trọng nhất, liên quan đến tiền
2. **AD07 - Tài trợ công khai**: Luồng chính cho nhà tài trợ
3. **AD08a - Xác nhận tài trợ (Kế toán)**: Kiểm soát nguồn thu quan trọng
4. **AD08b - Kiểm soát tài trợ (Admin)**: Giám sát và thống kê tài trợ
5. **AD13 - JSON Diff trong Audit Trail**: Thể hiện kỹ thuật cao, tự động hóa

### ⭐⭐ QUAN TRỌNG (Nên đưa vào báo cáo)

6. **AD03 - Sinh viên nộp đơn**: Điểm bắt đầu của quy trình
7. **AD04 - Phê duyệt cấp 1**: Phê duyệt đầu tiên
8. **AD05 - Phê duyệt cấp 2**: Phê duyệt thứ hai
9. **AD10 - Xuất báo cáo**: Chức năng báo cáo quan trọng
10. **AD11 - Nhật ký hệ thống**: Audit trail, bảo mật
11. **AD12 - Lịch sử phê duyệt**: Timeline trực quan

### ⭐ BỔ TRỢ (Có thể đưa vào nếu cần)

12. **AD01 - Đăng ký tài khoản**: Chức năng cơ bản
13. **AD02 - Đăng nhập**: Chức năng cơ bản
14. **AD09 - Quản lý quỹ**: Quản trị hệ thống

---

## 🔄 Mối quan hệ giữa các Activity Diagrams

```
┌─────────────────────────────────────────────────────────────┐
│                    LUỒNG CHÍNH HỆ THỐNG                     │
└─────────────────────────────────────────────────────────────┘

1️⃣ ĐĂNG KÝ & ĐĂNG NHẬP
   AD01 (Đăng ký) → AD02 (Đăng nhập) → Phân luồng theo Role

2️⃣ LUỒNG SINH VIÊN (Role 4 - SINH_VIEN)
   AD02 → AD03 (Nộp đơn) 
       → AD04 (Duyệt cấp 1) 
       → AD05 (Duyệt cấp 2) 
       → AD06 (Duyệt cấp 3 & Giải ngân) ✅

3️⃣ LUỒNG NHÀ TÀI TRỢ (Role 4 - NHA_TAI_TRO)
   AD02 → AD07 (Tạo tài trợ) 
       → AD08 (Xác nhận tài trợ) 
       → Cộng tiền vào quỹ ✅

4️⃣ LUỒNG CÁN BỘ QUỸ (Role 3)
   AD02 → AD09 (Quản lý quỹ)
       → AD04 (Duyệt cấp 1)
       → AD05 (Duyệt cấp 2)

5️⃣ LUỒNG KẾ TOÁN (Role 2)
   AD02 → AD08 (Xác nhận tài trợ)
       → AD06 (Giải ngân)
       → AD10 (Xuất báo cáo)

6️⃣ LUỒNG ADMIN (Role 1)
   AD02 → Tất cả các chức năng (Full quyền)
       → AD11 (Xem nhật ký hệ thống)

7️⃣ LUỒNG XEM LỊCH SỬ (Tất cả roles)
   AD03/AD04/AD05/AD06 → AD12 (Xem lịch sử phê duyệt)
   • Sinh viên: Chỉ xem đơn của mình
   • Cán bộ/Kế toán/Admin: Xem tất cả đơn
```

---

## 🛠️ Cách sử dụng PlantUML

### 1. Online Render
- Truy cập: [http://www.plantuml.com/plantuml/uml/](http://www.plantuml.com/plantuml/uml/)
- Copy nội dung file `.puml` và paste vào
- Click "Submit" để xem diagram

### 2. VS Code Extension
```bash
# Cài đặt extension
PlantUML (jebbs.plantuml)

# Xem diagram:
- Mở file .puml
- Nhấn Alt+D (Preview)
```

### 3. CLI Export
```bash
# Cài đặt PlantUML
npm install -g node-plantuml

# Xuất ảnh PNG
puml generate AD01_Dang_Ky_Tai_Khoan.puml -o output.png

# Xuất tất cả
puml generate *.puml -o output/
```

---

## 📊 Thống kê

| Tiêu chí | Số lượng |
|----------|----------|
| Tổng số Activity Diagrams | **13** ⬆️ |
| Diagrams ưu tiên cao (⭐⭐⭐) | **4** ⬆️ |
| Diagrams ưu tiên trung bình (⭐⭐) | **6** |
| Diagrams bổ trợ (⭐) | **3** |
| Actors | **5** (Admin, Kế toán, Cán bộ, Sinh viên, Nhà tài trợ) |
| Use Cases đã cover | **38/38** (100%) |
| Bảng database liên quan | **15** tables |

---

## 📝 Lưu ý khi trình bày trong báo cáo

### ✅ NÊN:
- Trình bày theo thứ tự ưu tiên (⭐⭐⭐ trước)
- Giải thích rõ swimlanes (các actor)
- Highlight các decision points (if-then-else)
- Nhấn mạnh validation và transaction
- Đề cập đến API endpoints

### ❌ KHÔNG NÊN:
- Đưa tất cả 10 diagrams vào báo cáo (quá dài)
- Bỏ qua giải thích các bước quan trọng
- Quên ghi rõ actors và quyền hạn
- Bỏ qua SQL queries trong diagrams

---

## 📚 Tài liệu tham khảo

- [PlantUML Activity Diagram Syntax](https://plantuml.com/activity-diagram-beta)
- [Use Cases Summary](../use-cases/USE_CASES_SUMMARY.md)
- [Database Schema](../../backend/database/schemas/COMPLETE_DATABASE_SCHEMA.sql)
- [Business Logic Updates](../../backend/database/docs/BUSINESS_LOGIC_UPDATES.md)

---

**Ngày tạo**: 07/06/2026  
**Cập nhật lần cuối**: 07/06/2026  
**Người thực hiện**: Kiro AI Assistant  
**Version**: 1.2 (Tách AD08 → AD08a & AD08b)  
**Trạng thái**: ✅ HOÀN THÀNH
