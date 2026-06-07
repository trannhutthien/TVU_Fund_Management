# 📚 TÀI LIỆU DỰ ÁN - TVU FUND MANAGEMENT SYSTEM

## 📋 Mục lục

Thư mục này chứa **TẤT CẢ tài liệu thiết kế và phân tích** cho dự án Hệ thống Quản lý Quỹ Hỗ trợ Sinh viên Trường Đại học Trà Vinh (TVU).

---

## 📂 Cấu trúc thư mục

```
docs/
├── activity-diagrams/     ⭐ [MỚI] Activity Diagrams (PlantUML)
├── use-cases/            ⭐ [MỚI] Use Cases chi tiết
├── database/             📊 Thiết kế database & ERD
├── docs/                 📄 Báo cáo & tài liệu Word
└── img/                  🖼️ Hình ảnh & sơ đồ cũ
```

---

## ⭐ 1. ACTIVITY DIAGRAMS (MỚI - 07/06/2026)

**Thư mục**: `activity-diagrams/`

### 📊 Tổng quan
- **Tổng số**: 12 Activity Diagrams (cập nhật 07/06/2026)
- **Format**: PlantUML (`.puml`)
- **Trạng thái**: ✅ HOÀN THÀNH
- **Độ ưu tiên**: 3 diagrams cao (⭐⭐⭐), 6 diagrams trung bình (⭐⭐), 3 diagrams thấp (⭐)

### 📁 Files quan trọng
1. **README.md** - Tài liệu đầy đủ về tất cả Activity Diagrams
2. **QUICK_REFERENCE.md** - Tham khảo nhanh

### 📝 Danh sách 12 Activity Diagrams

#### 🔐 Nhóm 1: Xác thực & Phân loại
- `AD01_Dang_Ky_Tai_Khoan.puml` - Đăng ký tài khoản
- `AD02_Dang_Nhap_Phan_Luong.puml` - Đăng nhập & phân luồng

#### 🎓 Nhóm 2: Chức năng Sinh viên
- `AD03_Sinh_Vien_Nop_Don.puml` - Sinh viên nộp đơn xin hỗ trợ

#### 👔 Nhóm 3: Phê duyệt 3 cấp (TÁCH RIÊNG)
- `AD04_Phe_Duyet_Cap_1.puml` - Phê duyệt cấp 1 (Cán bộ)
- `AD05_Phe_Duyet_Cap_2.puml` - Phê duyệt cấp 2 (Cán bộ)
- `AD06_Phe_Duyet_Cap_3_Giai_Ngan.puml` - Phê duyệt cấp 3 & Giải ngân (Kế toán) ⭐⭐⭐

#### 💰 Nhóm 4: Tài trợ & Xác nhận
- `AD07_Tai_Tro_Cong_Khai.puml` - Nhà tài trợ tạo khoản tài trợ ⭐⭐⭐
- `AD08_Xac_Nhan_Khoan_Tai_Tro.puml` - Kế toán xác nhận tài trợ ⭐⭐⭐

#### 🏦 Nhóm 5: Quản lý & Báo cáo
- `AD09_Quan_Ly_Quy.puml` - Quản lý quỹ
- `AD10_Xuat_Bao_Cao.puml` - Xuất báo cáo tài chính

### 🎯 Top 3 Diagrams cho báo cáo
1. **AD06** - Phê duyệt cấp 3 & Giải ngân (Quan trọng nhất)
2. **AD07** - Tạo khoản tài trợ công khai
3. **AD08** - Xác nhận khoản tài trợ
4. **AD11** - Xem nhật ký hệ thống 🆕 (Audit trail)
5. **AD12** - Xem lịch sử phê duyệt 🆕 (Timeline trực quan)

### 🔗 Xem chi tiết
👉 [activity-diagrams/README.md](./activity-diagrams/README.md)  
👉 [activity-diagrams/QUICK_REFERENCE.md](./activity-diagrams/QUICK_REFERENCE.md)

---

## ⭐ 2. USE CASES (MỚI - 28/05/2026)

**Thư mục**: `use-cases/`

### 📊 Tổng quan
- **Tổng số**: 38 Use Cases
- **Actors**: 5 actors (Admin, Kế toán, Cán bộ Quỹ, Sinh viên, Nhà tài trợ)
- **Trạng thái**: ✅ HOÀN THÀNH

### 📁 Files
1. **USE_CASES_SUMMARY.md** - ⭐ Tổng hợp tất cả Use Cases với ma trận Actor-UseCase
2. **ACTOR_1_SINH_VIEN.md** - 12 Use Cases của Sinh viên (chi tiết)
3. **ACTOR_2_NHA_TAI_TRO.md** - 15 Use Cases của Nhà tài trợ (chi tiết)
4. **ACTOR_3_CAN_BO_QUY.md** - 19 Use Cases của Cán bộ Quỹ (ngắn gọn)
5. **ACTOR_4_KE_TOAN.md** - 17 Use Cases của Kế toán (ngắn gọn)
6. **ACTOR_5_ADMIN.md** - 25+ Use Cases của Admin (ngắn gọn)

### 📊 Phân loại Use Cases
- **Nhóm 1**: Quản lý tài khoản & Xác thực (4 UCs)
- **Nhóm 2**: Chức năng Sinh viên (4 UCs)
- **Nhóm 3**: Chức năng Nhà tài trợ (2 UCs)
- **Nhóm 4**: Chức năng Cán bộ Quỹ (5 UCs)
- **Nhóm 5**: Chức năng Kế toán (4 UCs)
- **Nhóm 6**: Chức năng Admin (3 UCs)

### 🔗 Xem chi tiết
👉 [use-cases/USE_CASES_SUMMARY.md](./use-cases/USE_CASES_SUMMARY.md)

---

## 📊 3. DATABASE DESIGN

**Thư mục**: `database/`

### 📁 Files quan trọng
1. **ERD.puml** - Entity Relationship Diagram (PlantUML)
2. **tvu_fund_management.sql** - SQL Schema đầy đủ
3. **database.md** - Tài liệu thiết kế database
4. **api.md** - Tài liệu API endpoints

### 📊 Thống kê Database
- **Tổng số bảng**: 15 tables
- **Bảng chính**: 
  - `nguoidung` - Người dùng
  - `quy` - Quỹ hỗ trợ
  - `yeucauhotro` - Đơn xin hỗ trợ
  - `pheduyet` - Phê duyệt 3 cấp
  - `khoantaitro` - Khoản tài trợ
  - `giaodich` - Giao dịch thu chi
  - `nhataitro` - Nhà tài trợ
  - `sinh_vien_noi_bat` - Sinh viên nổi bật

### 🔗 Xem chi tiết
👉 [Tài liệu Database trong backend](../backend/database/docs/)

---

## 📄 4. BÁO CÁO & TÀI LIỆU

**Thư mục**: `docs/`

### 📁 Files
1. **110122162_TranNhutThien_KLTN.docx** - Báo cáo khóa luận tốt nghiệp
2. **cau_truc_bao_cao_TVU_updated_v2.docx** - Cấu trúc báo cáo TVU
3. **HUONG_DAN_TEST_TOAN_BO_API.md** - Hướng dẫn test API
4. **Huong_Dan_Tich_Hop_AI.md** - Hướng dẫn tích hợp AI
5. **tài liệu biến css cho giao diện.css** - CSS variables

---

## 🖼️ 5. HÌNH ẢNH & SƠ ĐỒ CŨ

**Thư mục**: `img/`

### 📊 Nội dung
- ERD images (`.jpg`, `.png`)
- Activity Diagrams cũ (`.png`)
- Use Case Diagrams cũ (`.png`)
- Logo & ảnh dự án

### ⚠️ Lưu ý
Thư mục này chứa các hình ảnh cũ từ giai đoạn đầu dự án. 

**Ưu tiên sử dụng**:
- ✅ Activity Diagrams mới (PlantUML) trong `activity-diagrams/`
- ✅ Use Cases mới trong `use-cases/`

---

## 🎯 MỨC ĐỘ ƯU TIÊN KHI LÀM BÁO CÁO

### ⭐⭐⭐ BẮT BUỘC (MUST HAVE)
1. **Activity Diagrams** (activity-diagrams/)
   - AD06 - Phê duyệt cấp 3 & Giải ngân
   - AD07 - Tạo khoản tài trợ
   - AD08 - Xác nhận tài trợ
   - AD11 - Xem nhật ký hệ thống 🆕
   - AD12 - Xem lịch sử phê duyệt 🆕
2. **Use Case Diagram** (use-cases/USE_CASES_SUMMARY.md)
3. **ERD** (database/ERD.puml)

### ⭐⭐ NÊN CÓ (SHOULD HAVE)
4. **Activity Diagrams bổ sung**:
   - AD03 - Sinh viên nộp đơn
   - AD04, AD05 - Phê duyệt cấp 1, 2
   - AD10 - Xuất báo cáo
5. **Use Cases chi tiết** (use-cases/)
6. **Database Schema** (database/)

### ⭐ TÙY CHỌN (NICE TO HAVE)
7. **Activity Diagrams cơ bản**:
   - AD01 - Đăng ký
   - AD02 - Đăng nhập
   - AD09 - Quản lý quỹ
8. **Hình ảnh minh họa** (img/)

---

## 📊 TỔNG KẾT THỐNG KÊ

| Loại tài liệu | Số lượng | Trạng thái | Ngày tạo |
|---------------|----------|------------|----------|
| Activity Diagrams | 12 🆕 | ✅ Hoàn thành | 07/06/2026 |
| Use Cases | 38 | ✅ Hoàn thành | 28/05/2026 |
| Actors | 5 | ✅ Hoàn thành | 28/05/2026 |
| Database Tables | 15 | ✅ Hoàn thành | 05/2026 |
| API Endpoints | 50+ | ✅ Hoàn thành | 05/2026 |

---

## 🛠️ CÔNG CỤ SỬ DỤNG

### PlantUML
- **Online**: http://www.plantuml.com/plantuml/uml/
- **VS Code Extension**: PlantUML (jebbs.plantuml)
- **CLI**: `npm install -g node-plantuml`

### Render Activity Diagrams
```bash
# Render 1 file
puml generate AD01_Dang_Ky_Tai_Khoan.puml -o output.png

# Render tất cả
puml generate activity-diagrams/*.puml -o output/
```

---

## 📚 HƯỚNG DẪN SỬ DỤNG TÀI LIỆU

### 1. Cho người viết báo cáo
```
1. Đọc: activity-diagrams/README.md
2. Chọn 3-5 Activity Diagrams quan trọng
3. Tham khảo: use-cases/USE_CASES_SUMMARY.md
4. Xem: database/ERD.puml
5. Tham khảo: QUICK_REFERENCE.md
```

### 2. Cho developer
```
1. Đọc: database/database.md
2. Xem: database/api.md
3. Tham khảo: use-cases/ (để hiểu requirements)
4. Tham khảo: activity-diagrams/ (để hiểu flows)
```

### 3. Cho tester
```
1. Đọc: docs/HUONG_DAN_TEST_TOAN_BO_API.md
2. Tham khảo: use-cases/ (test cases)
3. Tham khảo: activity-diagrams/ (test flows)
```

---

## 🔄 LỊCH SỬ CẬP NHẬT

| Ngày | Nội dung | Người thực hiện |
|------|----------|-----------------|
| 07/06/2026 | Thêm AD11 (Nhật ký) & AD12 (Lịch sử) | Kiro AI |
| 07/06/2026 | Tạo 10 Activity Diagrams (PlantUML) | Kiro AI |
| 07/06/2026 | Tạo file INDEX.md tổng hợp | Kiro AI |
| 28/05/2026 | Tạo 6 files Use Cases chi tiết | Kiro AI |
| 28/05/2026 | Cập nhật logic nghiệp vụ | Kiro AI |
| 05/2026 | Thiết kế database hoàn chỉnh | Team |
| 04/2026 | Tạo ERD & database schema | Team |

---

## 📞 LIÊN HỆ & HỖ TRỢ

Nếu có thắc mắc về tài liệu, vui lòng liên hệ:
- **Email**: [email của bạn]
- **GitHub**: [repository link]

---

## 📝 GHI CHÚ

### ✅ Tài liệu đã hoàn thành
- [x] Activity Diagrams (12 diagrams) 🆕
- [x] Use Cases (38 use cases, 5 actors)
- [x] Database Schema (15 tables)
- [x] ERD (PlantUML)
- [x] API Documentation
- [x] Nhật ký hệ thống (AD11) 🆕
- [x] Lịch sử phê duyệt (AD12) 🆕

### 🚧 Cần cập nhật
- [ ] Sequence Diagrams (nếu cần)
- [ ] Class Diagrams (nếu cần)
- [ ] Deployment Diagram (nếu cần)
- [ ] Hình ảnh minh họa UI/UX

---

**Tạo bởi**: Kiro AI Assistant  
**Ngày tạo**: 07/06/2026  
**Cập nhật lần cuối**: 07/06/2026 (Thêm AD11, AD12)  
**Phiên bản**: 1.1 🆕  
**Trạng thái**: ✅ HOÀN THÀNH
