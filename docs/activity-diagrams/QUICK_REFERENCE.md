# ⚡ QUICK REFERENCE - ACTIVITY DIAGRAMS

## 📋 Danh sách nhanh 13 Activity Diagrams

| # | File | Tên | Actor chính | Độ ưu tiên |
|---|------|-----|-------------|------------|
| 1 | `AD01_Dang_Ky_Tai_Khoan.puml` | Đăng ký tài khoản | Người dùng mới | ⭐ |
| 2 | `AD02_Dang_Nhap_Phan_Luong.puml` | Đăng nhập & phân luồng | Tất cả | ⭐ |
| 3 | `AD03_Sinh_Vien_Nop_Don.puml` | Sinh viên nộp đơn | Sinh viên | ⭐⭐ |
| 4 | `AD04_Phe_Duyet_Cap_1.puml` | Phê duyệt cấp 1 | Cán bộ Quỹ | ⭐⭐ |
| 5 | `AD05_Phe_Duyet_Cap_2.puml` | Phê duyệt cấp 2 | Cán bộ Quỹ | ⭐⭐ |
| 6 | `AD06_Phe_Duyet_Cap_3_Giai_Ngan.puml` | Phê duyệt cấp 3 & Giải ngân | Kế toán | ⭐⭐⭐ |
| 7 | `AD07_Tai_Tro_Cong_Khai.puml` | Tạo khoản tài trợ | Nhà tài trợ | ⭐⭐⭐ |
| 8a | `AD08a_Ke_Toan_Xac_Nhan_Tai_Tro.puml` | Xác nhận tài trợ (Kế toán) | Kế toán | ⭐⭐⭐ |
| 8b | `AD08b_Admin_Kiem_Soat_Tai_Tro.puml` | Kiểm soát tài trợ (Admin) | Admin | ⭐⭐ |
| 9 | `AD09_Quan_Ly_Quy.puml` | Quản lý quỹ | Cán bộ Quỹ | ⭐ |
| 10 | `AD10_Xuat_Bao_Cao.puml` | Xuất báo cáo | Kế toán | ⭐⭐ |
| 11 | `AD11_Xem_Nhat_Ky_He_Thong.puml` | Xem nhật ký hệ thống | Admin | ⭐⭐ |
| 12 | `AD12_Xem_Lich_Su_Phe_Duyet.puml` | Xem lịch sử phê duyệt | Tất cả | ⭐⭐ |

---

## 🎯 Top 4 Diagrams quan trọng nhất cho báo cáo

### 🥇 AD06 - Phê duyệt cấp 3 & Giải ngân
**Tại sao quan trọng?**
- Luồng phức tạp nhất, nhiều validation
- Liên quan trực tiếp đến tiền (trừ tiền quỹ)
- Tạo giao dịch CHI
- Kiểm tra số dư thời gian thực

### 🥈 AD07 - Tạo khoản tài trợ công khai
**Tại sao quan trọng?**
- Luồng chính cho nhà tài trợ
- Tự động tạo hồ sơ nhà tài trợ
- Upload chứng từ
- Chờ xác nhận trước khi cộng tiền

### 🥉 AD08a - Xác nhận khoản tài trợ (Kế toán)
**Tại sao quan trọng?**
- Kiểm soát nguồn thu
- Cộng tiền TỰ ĐỘNG vào quỹ
- Tạo giao dịch THU
- Đối chiếu chứng từ

### 🏅 AD08b - Kiểm soát tài trợ (Admin)
**Tại sao quan trọng?**
- Giám sát toàn diện quy trình
- Thống kê và báo cáo
- Phát hiện bất thường
- Kiểm soát và audit

---

## 🆕 Top 2 Diagrams mới thêm (Nhật ký & Lịch sử)

### 🏅 AD11 - Xem nhật ký hệ thống
**Tại sao quan trọng?**
- Audit trail đầy đủ
- Ghi lại mọi thay đổi quan trọng
- Lưu dữ liệu cũ/mới (before/after)
- Bảo mật và kiểm soát

### 🏅 AD12 - Xem lịch sử phê duyệt
**Tại sao quan trọng?**
- Timeline trực quan 3 cấp
- Minh bạch quy trình phê duyệt
- Hiển thị đầy đủ người duyệt
- Phân quyền xem rõ ràng

---

## 🔄 Luồng liên kết

### Luồng đầy đủ từ Sinh viên đến Giải ngân:
```
AD03 → AD04 → AD05 → AD06
(Nộp đơn → Duyệt cấp 1 → Duyệt cấp 2 → Duyệt cấp 3 & Giải ngân)
```

### Luồng đầy đủ từ Nhà tài trợ đến Cộng tiền:
```
AD07 → AD08a
(Tạo tài trợ → Kế toán xác nhận → Cộng tiền vào quỹ)

AD08b: Admin giám sát toàn bộ quy trình
```

### Luồng xem lịch sử và audit:
```
AD11: Admin xem nhật ký hệ thống (tất cả hành động)
AD12: Xem lịch sử phê duyệt 3 cấp (timeline chi tiết)
```

---

## 📊 Bảng dữ liệu chính

| Activity Diagram | Bảng chính | Bảng phụ | Transaction? |
|------------------|------------|----------|--------------|
| AD01 | `nguoidung`, `nhataitro` | - | ✅ |
| AD02 | `nguoidung` | `vaitro` | ❌ |
| AD03 | `yeucauhotro`, `pheduyet` | `quy` | ✅ |
| AD04 | `pheduyet`, `yeucauhotro` | - | ✅ |
| AD05 | `pheduyet`, `yeucauhotro` | - | ✅ |
| AD06 | `yeucauhotro`, `pheduyet`, `quy`, `giaodich` | - | ✅ |
| AD07 | `khoantaitro`, `nhataitro` | `quy` | ✅ |
| AD08 | `khoantaitro`, `quy`, `giaodich` | - | ✅ |
| AD09 | `quy` | - | ✅ |
| AD10 | `giaodich`, `khoantaitro`, `yeucauhotro` | `quy`, `nhataitro`, `nguoidung` | ❌ |
| AD11 | `nhat_ky_he_thong` | `nguoidung`, `vaitro` | ❌ |
| AD12 | `pheduyet`, `yeucauhotro` | `nguoidung`, `vaitro`, `giaodich` | ❌ |

**Lưu ý:** AD08 đã được tách thành AD08a (Kế toán) và AD08b (Admin)

---

## 🎨 Màu sắc Swimlanes

| Actor | Màu | Hex Code |
|-------|-----|----------|
| Người dùng | Xanh dương nhạt | `#E3F2FD` |
| Sinh viên | Xanh dương | `#B3E5FC` |
| Nhà tài trợ | Xanh lá | `#C8E6C9` |
| Cán bộ Quỹ | Tím | `#E1BEE7` |
| Kế toán | Cam | `#FFCCBC` |
| Admin | Đỏ | `#FFCDD2` |
| Hệ thống | Xám | `#F5F5F5` |

---

## 🔑 API Endpoints theo Diagram

### AD03 - Sinh viên nộp đơn
- `GET /api/funds` (xem quỹ)
- `POST /api/applications` (nộp đơn)

### AD04, AD05, AD06 - Phê duyệt
- `GET /api/applications?status=...`
- `PUT /api/applications/:id/approve-level-1`
- `PUT /api/applications/:id/approve-level-2`
- `PUT /api/applications/:id/approve-level-3`
- `PUT /api/applications/:id/disburse`
- `PUT /api/applications/:id/reject-level-X`

### AD07, AD08a, AD08b - Tài trợ
- `GET /api/funds` (public)
- `POST /api/donations`
- `GET /api/donations?status=Cho xac nhan`
- `PUT /api/donations/:id/confirm`
- `PUT /api/donations/:id/reject`
- `GET /api/donations/statistics` (Admin)
- `GET /api/donations/export` (Admin)

### AD09 - Quản lý quỹ
- `GET /api/funds`
- `POST /api/funds`
- `PUT /api/funds/:id`
- `PUT /api/funds/:id/status`

### AD10 - Báo cáo
- `GET /api/reports/revenue-expense`
- `GET /api/reports/donors`
- `GET /api/reports/beneficiaries`
- `GET /api/reports/fund/:id`

### AD11 - Nhật ký hệ thống
- `GET /api/system/logs`
- `GET /api/system/logs/:id`
- `GET /api/system/logs/export`

### AD12 - Lịch sử phê duyệt
- `GET /api/applications/:id/approval-history`
- `GET /api/applications/:id/transaction`
- `GET /api/applications/:id/export-pdf`

---

## ✅ Checklist cho báo cáo

Khi trình bày Activity Diagram trong báo cáo, đảm bảo:

- [ ] Chọn 4-7 diagrams quan trọng nhất (không đưa tất cả 13)
- [ ] Bắt buộc có: AD06, AD07, AD08a, AD08b (Top 4)
- [ ] Nên có: AD11 (Nhật ký), AD12 (Lịch sử phê duyệt)
- [ ] Giải thích rõ sự khác biệt AD08a (Kế toán) vs AD08b (Admin)
- [ ] Giải thích rõ swimlanes (ai làm gì)
- [ ] Highlight các decision points (if-then-else)
- [ ] Đề cập validation quan trọng
- [ ] Nêu rõ trạng thái chuyển đổi
- [ ] Giải thích Transaction (nếu có)
- [ ] Đề cập API endpoints
- [ ] Thêm chú thích cho các bước phức tạp
- [ ] Nêu rõ quyền hạn của từng actor

---

**Cập nhật lần cuối**: 07/06/2026 (Tách AD08 → AD08a & AD08b)
