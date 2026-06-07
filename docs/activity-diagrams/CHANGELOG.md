# 📝 CHANGELOG - ACTIVITY DIAGRAMS

## 🆕 Version 1.2 - 07/06/2026 (Tách AD08)

### 🔄 Tách diagram (1 → 2)

#### Tách AD08 thành AD08a và AD08b
**Lý do tách:**
- AD08 ban đầu quá dài (gộp cả Kế toán và Admin)
- Khó trình bày trong báo cáo
- Cần phân biệt rõ vai trò: Thao tác (Kế toán) vs Giám sát (Admin)

**AD08a - Kế toán xác nhận tài trợ**
- **File**: `AD08a_Ke_Toan_Xac_Nhan_Tai_Tro.puml`
- **Actor**: Kế toán (role 2) - PRIMARY
- **Mức độ**: ⭐⭐⭐ (QUAN TRỌNG NHẤT)
- **Tính năng**:
  - ✅ Xem danh sách khoản chờ xác nhận
  - ✅ Xem chi tiết và chứng từ
  - ✅ Đối chiếu với sao kê ngân hàng
  - ✅ Xác nhận → Cộng tiền + Tạo giao dịch THU
  - ✅ Từ chối → Không cộng tiền + Nhập lý do
- **Focus**: THAO TÁC xác nhận/từ chối

**AD08b - Admin kiểm soát tài trợ**
- **File**: `AD08b_Admin_Kiem_Soat_Tai_Tro.puml`
- **Actor**: Admin (role 1) - SUPERVISOR
- **Mức độ**: ⭐⭐ (QUAN TRỌNG)
- **Tính năng**:
  - ✅ Xem tất cả khoản tài trợ (mọi trạng thái)
  - ✅ Bộ lọc nâng cao nhiều tiêu chí
  - ✅ Xem thống kê tổng hợp
  - ✅ Biểu đồ và phân tích xu hướng
  - ✅ Xuất báo cáo Excel/PDF
  - ✅ Xem lịch sử giao dịch THU
  - ✅ Kiểm soát và phát hiện bất thường
- **Focus**: GIÁM SÁT và kiểm soát

### 📝 Cập nhật tài liệu
- ✅ Xóa file AD08_Xac_Nhan_Khoan_Tai_Tro.puml (cũ)
- ✅ Cập nhật README.md (Nhóm 4 có 3 files, thống kê 13 diagrams)
- ✅ Cập nhật QUICK_REFERENCE.md (bảng danh sách, top 4)
- ✅ Cập nhật CHANGELOG.md (file này)

### 📊 Thống kê sau tách
- **Tổng số diagrams**: 12 → 13 (+1)
- **Diagrams ưu tiên cao (⭐⭐⭐)**: 3 → 4 (+1: AD08a)
- **Diagrams ưu tiên trung bình (⭐⭐)**: 6 → 7 (+1: AD08b)
- **Diagrams bổ trợ (⭐)**: 3 (không đổi)

---

## 🆕 Version 1.1 - 07/06/2026 (Cập nhật)

### ➕ Thêm mới (2 diagrams)

#### AD11 - Xem nhật ký hệ thống
- **File**: `AD11_Xem_Nhat_Ky_He_Thong.puml`
- **Actor**: Admin (role 1)
- **Mức độ**: ⭐⭐ (QUAN TRỌNG)
- **Mô tả**: Admin xem nhật ký hoạt động của hệ thống
- **Tính năng**:
  - ✅ Ghi lại TẤT CẢ hành động quan trọng
  - ✅ Lưu dữ liệu cũ/mới (audit trail)
  - ✅ Ghi IP Address
  - ✅ Bộ lọc linh hoạt (user, action, object, time)
  - ✅ Xuất báo cáo Excel/CSV
  - ✅ Tìm kiếm full-text
- **Loại hành động**: CREATE, UPDATE, DELETE, APPROVE, REJECT, LOGIN, LOGOUT, DISBURSE, CONFIRM
- **Loại đối tượng**: quy, yeucauhotro, khoantaitro, nguoidung, nhataitro, giaodich
- **Bảng**: `nhat_ky_he_thong`, `nguoidung`, `vaitro`
- **API**: 
  - GET /api/system/logs
  - GET /api/system/logs/:id
  - GET /api/system/logs/export

#### AD12 - Xem lịch sử phê duyệt
- **File**: `AD12_Xem_Lich_Su_Phe_Duyet.puml`
- **Actor**: Tất cả (phân quyền xem khác nhau)
- **Mức độ**: ⭐⭐ (QUAN TRỌNG)
- **Mô tả**: Xem timeline phê duyệt 3 cấp của đơn xin hỗ trợ
- **Tính năng**:
  - ✅ Timeline trực quan với 3 bước
  - ✅ Hiển thị đầy đủ thông tin người duyệt
  - ✅ Ghi rõ lý do từ chối (nếu có)
  - ✅ Liên kết với giao dịch giải ngân
  - ✅ Xuất PDF để lưu trữ
  - ✅ Phân quyền xem rõ ràng
- **Quyền xem**: 
  - Sinh viên: Chỉ xem đơn của mình
  - Cán bộ/Kế toán/Admin: Xem tất cả
- **Trạng thái**: ⏳ Chờ xử lý, ✅ Đã duyệt, ❌ Từ chối
- **Bảng**: `pheduyet`, `yeucauhotro`, `nguoidung`, `vaitro`, `giaodich`
- **API**: 
  - GET /api/applications/:id/approval-history
  - GET /api/applications/:id/transaction
  - GET /api/applications/:id/export-pdf

### 📝 Cập nhật tài liệu
- ✅ Cập nhật README.md (thêm Nhóm 6, cập nhật thống kê)
- ✅ Cập nhật QUICK_REFERENCE.md (thêm AD11, AD12 vào bảng)
- ✅ Cập nhật docs/INDEX.md (cập nhật tổng số diagrams)
- ✅ Tạo CHANGELOG.md (file này)

### 📊 Thống kê sau cập nhật
- **Tổng số diagrams**: 10 → 12 (+2)
- **Diagrams ưu tiên cao (⭐⭐⭐)**: 3 (không đổi)
- **Diagrams ưu tiên trung bình (⭐⭐)**: 4 → 6 (+2)
- **Diagrams bổ trợ (⭐)**: 3 (không đổi)
- **Tổng số nhóm**: 5 → 6 (+1 nhóm mới: Nhật ký & Lịch sử)

---

## ✅ Version 1.0 - 07/06/2026 (Phiên bản đầu tiên)

### 📝 Tạo mới (10 diagrams)

#### Nhóm 1: Xác thực & Phân loại (2 diagrams)
1. ✅ AD01 - Đăng ký tài khoản & Phân loại
2. ✅ AD02 - Đăng nhập & Phân luồng giao diện

#### Nhóm 2: Chức năng Sinh viên (1 diagram)
3. ✅ AD03 - Sinh viên nộp đơn xin hỗ trợ

#### Nhóm 3: Phê duyệt 3 cấp - TÁCH RIÊNG (3 diagrams)
4. ✅ AD04 - Phê duyệt đơn cấp 1 (Cán bộ)
5. ✅ AD05 - Phê duyệt đơn cấp 2 (Cán bộ)
6. ✅ AD06 - Phê duyệt cấp 3 & Giải ngân (Kế toán) ⭐⭐⭐

#### Nhóm 4: Tài trợ & Xác nhận (2 diagrams)
7. ✅ AD07 - Nhà tài trợ tạo khoản tài trợ công khai ⭐⭐⭐
8. ✅ AD08 - Kế toán xác nhận khoản tài trợ ⭐⭐⭐

#### Nhóm 5: Quản lý & Báo cáo (2 diagrams)
9. ✅ AD09 - Quản lý quỹ
10. ✅ AD10 - Xuất báo cáo tài chính

### 📚 Tài liệu
- ✅ Tạo README.md (tài liệu đầy đủ)
- ✅ Tạo QUICK_REFERENCE.md (tham khảo nhanh)
- ✅ Cập nhật docs/INDEX.md

### ✨ Đặc điểm chung
- Format: PlantUML (.puml)
- Có swimlanes với màu sắc rõ ràng
- Có decision points (if-then-else)
- Hiển thị SQL queries (INSERT, UPDATE, SELECT)
- Có Legend giải thích đầy đủ
- Có Footer với version
- Tách nhỏ quy trình phê duyệt 3 cấp thành 3 files riêng

---

## 📌 Ghi chú

### Lý do tạo AD11 & AD12
1. **AD11 - Nhật ký hệ thống**: 
   - Yêu cầu từ người dùng
   - Quan trọng cho audit trail và bảo mật
   - Ghi lại mọi thay đổi quan trọng trong hệ thống
   - Hỗ trợ Admin quản lý và giám sát

2. **AD12 - Lịch sử phê duyệt**:
   - Yêu cầu từ người dùng
   - Tăng tính minh bạch của quy trình
   - Timeline trực quan dễ hiểu
   - Phân quyền xem phù hợp với từng role

### Top 4 Diagrams cho báo cáo (Cập nhật sau tách)
1. **AD06** - Phê duyệt cấp 3 & Giải ngân ⭐⭐⭐
2. **AD07** - Tạo khoản tài trợ công khai ⭐⭐⭐
3. **AD08a** - Kế toán xác nhận tài trợ ⭐⭐⭐ 🆕
4. **AD08b** - Admin kiểm soát tài trợ ⭐⭐ 🆕

---

**Người thực hiện**: Kiro AI Assistant  
**Ngày tạo**: 07/06/2026  
**Cập nhật lần cuối**: 07/06/2026
