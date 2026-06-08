# 📊 SEQUENCE DIAGRAMS - TVU FUND MANAGEMENT

## 📝 Tổng quan

Thư mục này chứa **11 Sequence Diagrams** mô tả chi tiết tương tác giữa các thành phần hệ thống quản lý quỹ hỗ trợ sinh viên TVU.

Tất cả các diagrams được viết bằng **PlantUML** với format **rút gọn, diễn giải bằng lời**, dễ hiểu cho người không chuyên.

---

## 🎯 Mục đích

**Sequence Diagrams** mô tả **luồng tương tác kỹ thuật** giữa các thành phần:
- Client (Trình duyệt)
- API Hệ thống
- Cơ sở dữ liệu
- Các dịch vụ bên ngoài (Email, Template Engine...)

**Khác biệt với Activity Diagrams:**
- **Activity Diagram**: Mô tả luồng nghiệp vụ (business process)
- **Sequence Diagram**: Mô tả luồng kỹ thuật (technical implementation)

---

## 📂 Danh sách Sequence Diagrams

### 🔐 NHÓM 1: XÁC THỰC (1 diagram)

#### ✅ SD01: Đăng nhập hệ thống
- **File**: `SD01_Dang_Nhap.puml`
- **Mô tả**: Xác thực người dùng và phân quyền truy cập
- **Actors**: Người dùng
- **Components**: Browser, API, Database
- **Luồng chính**:
  - Nhập email và mật khẩu
  - Xác thực thông tin
  - Tạo token (15 phút + 7 ngày)
  - Phân luồng theo vai trò
- **API**: `POST /api/auth/login`
- **Độ ưu tiên**: ⭐⭐⭐ (QUAN TRỌNG NHẤT)

---

### 🎓 NHÓM 2: QUẢN LÝ ĐƠN (5 diagrams)

#### ✅ SD02: Sinh viên nộp đơn xin hỗ trợ
- **File**: `SD02_Sinh_Vien_Nop_Don.puml`
- **Mô tả**: Sinh viên tạo đơn xin hỗ trợ từ quỹ
- **Actors**: Sinh viên (role 4)
- **Đặc điểm nổi bật**:
  - ✓ Xem danh sách quỹ đang hoạt động
  - ✓ Tạo đơn với trạng thái "Chờ duyệt cấp 1"
  - ✓ Tự động tạo 3 bản ghi phê duyệt (cấp 1, 2, 3)
  - ✓ Sử dụng giao dịch database
- **API**: `POST /api/applications`
- **Độ ưu tiên**: ⭐⭐⭐ (QUAN TRỌNG NHẤT)

---

#### ✅ SD03: Phê duyệt đơn cấp 1
- **File**: `SD03_Phe_Duyet_Cap_1.puml`
- **Mô tả**: Cán bộ Quỹ phê duyệt hoặc từ chối đơn cấp 1
- **Actors**: Cán bộ Quỹ (role 3), Admin (role 1)
- **Đặc điểm**:
  - ✓ Xem danh sách đơn chờ duyệt cấp 1
  - ✓ Bắt buộc nhập lý do khi từ chối
  - ✓ Chuyển sang "Chờ duyệt cấp 2" khi duyệt
  - ✓ Sử dụng giao dịch database
- **API**: `PUT /api/applications/:id/staff-approve`
- **Độ ưu tiên**: ⭐⭐ (QUAN TRỌNG)

---

#### ✅ SD04: Phê duyệt đơn cấp 2
- **File**: `SD04_Phe_Duyet_Cap_2.puml`
- **Mô tả**: Admin phê duyệt hoặc từ chối đơn cấp 2
- **Actors**: Admin (role 1)
- **Đặc điểm**:
  - ✓ Xem lịch sử phê duyệt cấp 1
  - ✓ Kiểm tra cấp 1 đã duyệt chưa
  - ✓ Chuyển sang Kế toán (cấp 3) khi duyệt
  - ✓ Sử dụng giao dịch database
- **API**: `PUT /api/applications/:id/admin-approve`
- **Độ ưu tiên**: ⭐⭐ (QUAN TRỌNG)

---

#### ✅ SD05a: Giải ngân (Quỹ đủ tiền) ⭐⭐⭐
- **File**: `SD05a_Giai_Ngan_Du_Tien.puml`
- **Mô tả**: Kế toán giải ngân khi quỹ đủ tiền
- **Actors**: Kế toán (role 2), Admin (role 1)
- **Đặc điểm nổi bật**:
  - ⭐ Kiểm tra số dư quỹ thời gian thực
  - ⭐ Trừ tiền tự động từ quỹ
  - ⭐ Tạo giao dịch CHI để ghi nhận
  - ⭐ Đổi trạng thái "Đã giải ngân"
- **Điều kiện**: Số dư quỹ ≥ Số tiền đơn
- **API**: `POST /api/applications/:id/disburse`
- **Độ ưu tiên**: ⭐⭐⭐ (QUAN TRỌNG NHẤT)

---

#### ✅ SD05b: Chờ giải ngân (Quỹ thiếu tiền) ⭐⭐⭐
- **File**: `SD05b_Cho_Giai_Ngan_Thieu_Tien.puml`
- **Mô tả**: Xử lý đơn khi quỹ thiếu tiền
- **Actors**: Kế toán (role 2), Admin (role 1)
- **Đặc điểm nổi bật**:
  - ⭐ Kiểm tra số dư quỹ
  - ⭐ Đổi trạng thái "Chờ giải ngân"
  - ⭐ KHÔNG trừ tiền, KHÔNG tạo giao dịch
  - ⭐ Kêu gọi thêm tài trợ
- **Điều kiện**: Số dư quỹ < Số tiền đơn
- **API**: `POST /api/applications/:id/disburse`
- **Độ ưu tiên**: ⭐⭐⭐ (QUAN TRỌNG NHẤT)

---

### 💰 NHÓM 3: TÀI TRỢ (3 diagrams)

#### ✅ SD06: Tạo khoản tài trợ công khai ⭐⭐⭐
- **File**: `SD06_Tai_Tro_Cong_Khai.puml`
- **Mô tả**: Người dùng quyên góp không cần đăng nhập
- **Actors**: Người tài trợ (không cần đăng nhập)
- **Đặc điểm nổi bật**:
  - ⭐ API công khai, không cần token
  - ⭐ Tự động tạo hồ sơ nhà tài trợ lần đầu
  - ⭐ Trạng thái "Chờ xác nhận"
  - ⭐ Trả về thông tin ngân hàng để chuyển khoản
- **API**: `POST /api/donations/public`
- **Độ ưu tiên**: ⭐⭐⭐ (QUAN TRỌNG NHẤT)

---

#### ✅ SD07a: Xác nhận tài trợ (Duyệt) ⭐⭐⭐
- **File**: `SD07a_Xac_Nhan_Tai_Tro_Duyet.puml`
- **Mô tả**: Kế toán xác nhận đã nhận tiền và cộng vào quỹ
- **Actors**: Kế toán (role 2), Admin (role 1)
- **Đặc điểm nổi bật**:
  - ⭐ Kiểm tra sao kê ngân hàng
  - ⭐ Cộng tiền TỰ ĐỘNG vào quỹ
  - ⭐ Tạo giao dịch THU để ghi nhận
  - ⭐ Gửi email cảm ơn nhà tài trợ
- **Kết quả**: Tăng số dư quỹ (nguồn thu chính)
- **API**: `PUT /api/donations/:id/approve`
- **Độ ưu tiên**: ⭐⭐⭐ (QUAN TRỌNG NHẤT)

---

#### ✅ SD07b: Từ chối tài trợ
- **File**: `SD07b_Tu_Choi_Tai_Tro.puml`
- **Mô tả**: Kế toán từ chối khoản tài trợ không hợp lệ
- **Actors**: Kế toán (role 2), Admin (role 1)
- **Đặc điểm**:
  - ✓ Kiểm tra thông tin không khớp
  - ✓ Bắt buộc nhập lý do từ chối
  - ✓ KHÔNG cộng tiền, KHÔNG tạo giao dịch
  - ✓ Lưu lý do để kiểm tra lại
- **Lý do từ chối**: Không tìm thấy giao dịch, số tiền không khớp, chứng từ giả...
- **API**: `PUT /api/donations/:id/reject`
- **Độ ưu tiên**: ⭐⭐ (QUAN TRỌNG)

---

### 🏦 NHÓM 4: TRÍ TUỆ NHÂN TẠO (1 diagram)

#### ✅ SD09: AI hỗ trợ viết đơn ⭐⭐⭐
- **File**: `SD09_AI_Ho_Tro_Viet_Don.puml`
- **Mô tả**: Sử dụng Google Gemini AI để hỗ trợ sinh viên viết đơn
- **Actors**: Sinh viên (role 4)
- **Đặc điểm nổi bật**:
  - ⭐ **Phân tích đơn**: AI đánh giá điểm mạnh, điểm yếu, gợi ý cải thiện
  - ⭐ **Tối ưu đơn**: Viết lại cho lịch sự, chân thành, sửa lỗi chính tả
  - ⭐ **Soạn đơn mẫu**: Tạo lá đơn hoàn chỉnh từ vài ý chính
  - ⭐ Tích hợp Google Gemini 1.5 Flash
- **3 chức năng**:
  - `analyze` - Phân tích và đánh giá
  - `optimize` - Viết lại tốt hơn
  - `draft` - Soạn đơn hoàn chỉnh
- **API**: `POST /api/applications/ai-suggest`
- **Độ ưu tiên**: ⭐⭐⭐ (QUAN TRỌNG NHẤT)

---

### 📊 NHÓM 5: BÁO CÁO (1 diagram)

#### ✅ SD10: Xuất báo cáo tài chính
- **File**: `SD10_Xuat_Bao_Cao.puml`
- **Mô tả**: Kế toán xuất báo cáo Word theo nhiều loại
- **Actors**: Kế toán (role 2), Admin (role 1)
- **Loại báo cáo**:
  1. Thu chi tổng hợp
  2. Danh sách nhà tài trợ
  3. Danh sách thủ hưởng
  4. Báo cáo quỹ chi tiết
  5. Báo cáo đề xuất
- **Đặc điểm**:
  - ✓ Xuất file Word có thể chỉnh sửa
  - ✓ Sử dụng template engine (docxtemplater)
  - ✓ Bộ lọc linh hoạt (quỹ, ngày, loại)
  - ✓ Tự động tính toán thống kê
- **API**: `GET /api/reports/revenue-expense`
- **Độ ưu tiên**: ⭐⭐ (QUAN TRỌNG)

---

## 📊 Bảng tổng hợp

| # | Tên Sequence Diagram | File | Actor chính | Độ ưu tiên |
|---|---------------------|------|-------------|------------|
| SD01 | Đăng nhập | SD01_Dang_Nhap.puml | Client | ⭐⭐⭐ |
| SD02 | Sinh viên nộp đơn | SD02_Sinh_Vien_Nop_Don.puml | Sinh viên | ⭐⭐⭐ |
| SD03 | Phê duyệt cấp 1 | SD03_Phe_Duyet_Cap_1.puml | Cán bộ | ⭐⭐ |
| SD04 | Phê duyệt cấp 2 | SD04_Phe_Duyet_Cap_2.puml | Admin | ⭐⭐ |
| SD05a | Giải ngân (đủ tiền) | SD05a_Giai_Ngan_Du_Tien.puml | Kế toán | ⭐⭐⭐ |
| SD05b | Chờ giải ngân (thiếu tiền) | SD05b_Cho_Giai_Ngan_Thieu_Tien.puml | Kế toán | ⭐⭐⭐ |
| SD06 | Tài trợ công khai | SD06_Tai_Tro_Cong_Khai.puml | Công khai | ⭐⭐⭐ |
| SD07a | Xác nhận tài trợ (duyệt) | SD07a_Xac_Nhan_Tai_Tro_Duyet.puml | Kế toán | ⭐⭐⭐ |
| SD07b | Từ chối tài trợ | SD07b_Tu_Choi_Tai_Tro.puml | Kế toán | ⭐⭐ |
| SD09 | AI hỗ trợ viết đơn | SD09_AI_Ho_Tro_Viet_Don.puml | Sinh viên | ⭐⭐⭐ |
| SD10 | Xuất báo cáo | SD10_Xuat_Bao_Cao.puml | Kế toán | ⭐⭐ |

---

## 🎯 Mức độ ưu tiên

### ⭐⭐⭐ QUAN TRỌNG NHẤT (8 diagrams)
1. **SD01 - Đăng nhập**: Điểm vào hệ thống, xác thực phân quyền
2. **SD02 - Sinh viên nộp đơn**: Bắt đầu quy trình, tạo 3 cấp phê duyệt
3. **SD05a - Giải ngân đủ tiền**: Trừ tiền quỹ, tạo giao dịch CHI
4. **SD05b - Chờ giải ngân thiếu tiền**: Quản lý ngân sách, xử lý edge case
5. **SD06 - Tài trợ công khai**: Thu hút tài trợ, tự động tạo donor
6. **SD07a - Xác nhận tài trợ**: Cộng tiền vào quỹ, nguồn thu chính
7. **SD09 - AI hỗ trợ viết đơn**: Tích hợp AI Gemini, đổi mới sáng tạo

### ⭐⭐ QUAN TRỌNG (3 diagrams)
8. **SD03 - Phê duyệt cấp 1**: Thể hiện phê duyệt đa cấp
9. **SD04 - Phê duyệt cấp 2**: Tiếp tục phê duyệt đa cấp
10. **SD07b - Từ chối tài trợ**: Kiểm soát chất lượng tài trợ
11. **SD10 - Xuất báo cáo**: Chức năng báo cáo, xuất file

---

## 🔄 Mối quan hệ với Activity Diagrams

| Sequence Diagram | Activity Diagram tương ứng | Ghi chú |
|-----------------|---------------------------|---------|
| SD01 - Đăng nhập | AD02 - Đăng nhập & Phân luồng | Kỹ thuật vs Nghiệp vụ |
| SD02 - Sinh viên nộp đơn | AD03 - Sinh viên nộp đơn | Tương ứng 1-1 |
| SD03 - Phê duyệt cấp 1 | AD04 - Phê duyệt cấp 1 | Tương ứng 1-1 |
| SD04 - Phê duyệt cấp 2 | AD05 - Phê duyệt cấp 2 | Tương ứng 1-1 |
| SD05a - Giải ngân (đủ) | AD06 - Giải ngân | Tách luồng thành công |
| SD05b - Chờ giải ngân (thiếu) | AD06 - Giải ngân | Tách luồng chờ |
| SD06 - Tài trợ công khai | AD07 - Tài trợ công khai | Tương ứng 1-1 |
| SD07a - Xác nhận (duyệt) | AD08a - Xác nhận tài trợ | Tách luồng duyệt |
| SD07b - Từ chối | AD08a - Xác nhận tài trợ | Tách luồng từ chối |
| SD09 - AI hỗ trợ viết đơn | (Chức năng mới - không có AD) | Tích hợp AI Gemini |
| SD10 - Xuất báo cáo | AD10 - Xuất báo cáo | Tương ứng 1-1 |

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
puml generate SD01_Dang_Nhap.puml -o output.png

# Xuất tất cả
puml generate *.puml -o output/
```

---

## 📝 Đặc điểm chung

### ✅ Điểm mạnh của các Sequence Diagrams này:
1. **Rút gọn**: Chỉ giữ ý chính, loại bỏ chi tiết kỹ thuật
2. **Diễn giải bằng lời**: Không có code, SQL, hay thuật ngữ kỹ thuật
3. **Dễ hiểu**: Người không chuyên IT vẫn có thể hiểu
4. **Tách luồng rõ ràng**: Mỗi diagram tập trung 1 luồng cụ thể
5. **Highlight giao dịch**: Thể hiện rõ BEGIN TRANSACTION và COMMIT
6. **Error handling**: Có xử lý các trường hợp lỗi (alt/else blocks)

### 🎯 Components chính:
- **Actor**: Người dùng (Admin, Kế toán, Cán bộ, Sinh viên, Nhà tài trợ)
- **Browser**: Trình duyệt web
- **API**: Hệ thống API backend (Express.js)
- **Database**: Cơ sở dữ liệu MySQL
- **Email/Template**: Các dịch vụ bổ trợ

---

## 💡 Lưu ý khi đọc Sequence Diagrams

### Ký hiệu arrows:
- `->`: Gửi request/message
- `-->`: Trả về response/kết quả
- `activate/deactivate`: Bắt đầu/kết thúc xử lý

### Alt blocks:
- `alt ... else ... end`: Xử lý điều kiện (if-then-else)
- Thể hiện các luồng khác nhau dựa trên điều kiện

### Notes:
- Giải thích thêm logic hoặc lưu ý quan trọng
- Thường đặt bên phải hoặc giữa các components

---

## 📊 Thống kê

| Tiêu chí | Số lượng |
|----------|----------|
| Tổng số Sequence Diagrams | **10** |
| Diagrams ưu tiên cao (⭐⭐⭐) | **7** |
| Diagrams ưu tiên trung bình (⭐⭐) | **3** |
| Actors | **5** (Admin, Kế toán, Cán bộ, Sinh viên, Nhà tài trợ) |
| Components | **5** (Browser, API, Database, Email, Template) |
| Luồng có giao dịch database | **8** |
| Luồng có xử lý lỗi (alt blocks) | **10** (100%) |

---

## 📚 Tài liệu tham khảo

- [PlantUML Sequence Diagram Syntax](https://plantuml.com/sequence-diagram)
- [Activity Diagrams](../activity-diagrams/README.md)
- [API Documentation](../../backend/docs/api/API_VA_HAM_DOCUMENTATION.md)
- [Database Schema](../../backend/database/schemas/COMPLETE_DATABASE_SCHEMA.sql)

---

**Ngày tạo**: 08/06/2026  
**Người thực hiện**: Kiro AI Assistant  
**Version**: 1.0  
**Trạng thái**: ✅ HOÀN THÀNH

