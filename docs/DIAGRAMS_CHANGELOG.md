# 📊 CHANGELOG - PLANTUML DIAGRAMS

> **Dự án:** TVU Fund Management System  
> **Mục đích:** Ghi nhận thay đổi, bổ sung các sơ đồ PlantUML

---

## 🎯 Tổng quan hiện tại

| Loại Diagram | Số lượng | Files |
|-------------|----------|-------|
| **Activity Diagrams** | 14 | AD01-AD12 + AD08a/b + AD13 |
| **Sequence Diagrams** | 12 | SD01-SD11 (không có SD08) |
| **Tổng cộng** | 26 | PlantUML files |

---

## 📅 Lịch sử cập nhật

### 🆕 [08/06/2026] - Thêm Middleware Audit Trail

**Thêm mới:**

1. **SD11_Middleware_Audit_Trail.puml** ⭐⭐⭐
   - **Mô tả**: Sequence Diagram mô phỏng Middleware Audit Trail với JSON Diff
   - **Nội dung**:
     - Luồng Request → Auth → Audit (Before) → Update → Audit (After) → Log
     - Snapshot dữ liệu cũ (Old Data)
     - Snapshot dữ liệu mới (New Data)
     - JSON Diff Engine: So sánh changed/unchanged/added/removed
     - Ghi log chi tiết vào bảng `nhatky`
   - **Highlight**:
     - Thể hiện cách Middleware tự động ghi log
     - JSON Diff Algorithm visualization
     - Non-blocking logging
     - Traceability (who, what, when, what changed)
   - **Kết hợp**: AD11 (Nhật ký hệ thống)

2. **AD13_JSON_Diff_Flow.puml** ⭐⭐⭐
   - **Mô tả**: Activity Diagram chi tiết luồng hoạt động JSON Diff
   - **Nội dung**:
     - Auth Middleware validation
     - Audit Middleware Before Update
     - Controller update data
     - Audit Middleware After Update
     - JSON Diff Engine: Deep comparison
     - Log entry preparation
     - Database INSERT log
   - **Đặc điểm**:
     - Thể hiện các trường hợp đặc biệt (Nested Object, Array, Null/Undefined, Type Change)
     - Performance tips (Cache, Async, Index)
     - Error handling (Log fail không chặn request)
   - **Use cases**: Audit compliance, Security investigation, Data recovery, Debug

**Cập nhật:**

3. **docs/sequence-diagrams/README.md**
   - Thêm NHÓM 5: AUDIT TRAIL & LOGGING
   - Cập nhật tổng số: 11 → 12 diagrams
   - Cập nhật thống kê: 9 diagrams ưu tiên cao
   - Thêm components: Middleware, JSON Diff Engine
   - Cập nhật actors: Thêm System (automated)

4. **docs/activity-diagrams/README.md**
   - Thêm NHÓM 6: KỸ THUẬT HỆ THỐNG
   - Cập nhật tổng số: 13 → 14 diagrams
   - Cập nhật độ ưu tiên: AD13 là ⭐⭐⭐
   - Thêm mô tả chi tiết JSON Diff output

**Lý do thêm:**
- Thể hiện kỹ thuật cao: Middleware pattern, Interceptor, Observer
- Minh họa cơ chế Audit Trail tự động
- Tăng tính chuyên nghiệp cho đồ án
- Giải thích rõ cách hệ thống ghi log mà không cần code thủ công

---

### 🔄 [08/06/2026] - Rút gọn SD09 AI Assistant

**Chỉnh sửa:**

1. **SD09_AI_Ho_Tro_Viet_Don.puml**
   - **Trước**: ~120 dòng (chi tiết kỹ thuật)
   - **Sau**: ~50 dòng (rút gọn 58%)
   - **Thay đổi**:
     - Loại bỏ activate/deactivate
     - Loại bỏ các bước trung gian (xác thực token, tạo prompt...)
     - Loại bỏ database participant
     - Đơn giản hóa tên actors
     - Gộp các bước tương tự
   - **Giữ nguyên**:
     - 3 chức năng chính (Analyze, Optimize, Draft)
     - Luồng xử lý cơ bản
     - Thông tin API và quyền hạn

**Lý do rút gọn:**
- Dễ đọc, dễ hiểu hơn
- Tập trung vào ý chính
- Phù hợp cho presentation
- Giảm độ phức tạp

---

### ✅ [07/06/2026] - Tạo Activity Diagrams ban đầu

**Thêm mới:**

1. **13 Activity Diagrams** (AD01-AD12 + AD08a/b)
   - AD01: Đăng ký tài khoản
   - AD02: Đăng nhập & Phân luồng
   - AD03: Sinh viên nộp đơn
   - AD04: Phê duyệt cấp 1
   - AD05: Phê duyệt cấp 2
   - AD06: Phê duyệt cấp 3 & Giải ngân
   - AD07: Tài trợ công khai
   - AD08a: Kế toán xác nhận tài trợ
   - AD08b: Admin kiểm soát tài trợ
   - AD09: Quản lý quỹ
   - AD10: Xuất báo cáo
   - AD11: Xem nhật ký hệ thống
   - AD12: Xem lịch sử phê duyệt

2. **11 Sequence Diagrams** (SD01-SD10 + SD09)
   - SD01: Đăng nhập
   - SD02: Sinh viên nộp đơn
   - SD03: Phê duyệt cấp 1
   - SD04: Phê duyệt cấp 2
   - SD05a: Giải ngân (đủ tiền)
   - SD05b: Chờ giải ngân (thiếu tiền)
   - SD06: Tài trợ công khai
   - SD07a: Xác nhận tài trợ (duyệt)
   - SD07b: Từ chối tài trợ
   - SD09: AI hỗ trợ viết đơn
   - SD10: Xuất báo cáo

3. **README files**
   - docs/activity-diagrams/README.md
   - docs/sequence-diagrams/README.md
   - docs/activity-diagrams/CHANGELOG.md
   - docs/activity-diagrams/QUICK_REFERENCE.md
   - docs/sequence-diagrams/SEQUENCE_DIAGRAMS_PROPOSAL.md

**Đặc điểm chung:**
- Format rút gọn, dễ hiểu
- Diễn giải bằng lời, không code
- Tách luồng rõ ràng
- Highlight giao dịch database
- Error handling đầy đủ

---

## 📊 So sánh phiên bản

| Thời điểm | Activity Diagrams | Sequence Diagrams | Tổng |
|-----------|------------------|------------------|------|
| **07/06/2026** | 13 | 11 | 24 |
| **08/06/2026** | 14 (+1) | 12 (+1) | 26 (+2) |

**Thêm mới:**
- ✅ AD13: JSON Diff Flow (Activity)
- ✅ SD11: Middleware Audit Trail (Sequence)

**Chỉnh sửa:**
- 🔄 SD09: Rút gọn từ 120 → 50 dòng

---

## 🎯 Kế hoạch tương lai

### 📋 Đang xem xét

1. **AD14: Luồng xử lý lỗi tập trung** (Error Handling Flow)
   - Mô tả cách hệ thống xử lý exceptions
   - Try-catch, error middleware
   - Error logging & reporting

2. **SD12: WebSocket Real-time Notifications** (nếu implement)
   - Thông báo real-time cho user
   - Khi đơn được duyệt/từ chối
   - Khi tài trợ được xác nhận

3. **AD15: Backup & Recovery Process**
   - Quy trình backup database
   - Disaster recovery plan
   - Data restoration

### ❌ Không cần thiết

- Class Diagrams: Không phù hợp với kiến trúc hiện tại (REST API)
- Use Case Diagrams: Đã được thể hiện qua Activity Diagrams
- Component Diagrams: Quá kỹ thuật, không cần cho đồ án
- Deployment Diagrams: Deployment đơn giản, không cần diagram

---

## 📝 Nguyên tắc tạo Diagrams

### ✅ Nên làm

1. **Rút gọn, dễ hiểu**
   - Diễn giải bằng lời tự nhiên
   - Không đưa code, SQL vào diagram
   - Tập trung ý chính

2. **Tách luồng rõ ràng**
   - Mỗi diagram = 1 chức năng cụ thể
   - Tách luồng thành công/thất bại
   - Highlight các điểm quyết định

3. **Thể hiện giao dịch**
   - BEGIN TRANSACTION / COMMIT
   - Error handling (alt/else)
   - Rollback khi lỗi

4. **Metadata đầy đủ**
   - Title, legend
   - API endpoints
   - Actors, components
   - Priority level

### ❌ Không nên làm

1. Quá chi tiết kỹ thuật
2. Đưa code/SQL vào diagram
3. Một diagram quá dài (>100 dòng)
4. Thiếu error handling
5. Không có title/legend

---

## 🔗 Tài liệu tham khảo

### PlantUML Documentation
- [Activity Diagram Syntax](https://plantuml.com/activity-diagram-beta)
- [Sequence Diagram Syntax](https://plantuml.com/sequence-diagram)
- [PlantUML Online Server](http://www.plantuml.com/plantuml/uml/)

### Project Documentation
- [API Documentation](../backend/docs/api/API_VA_HAM_DOCUMENTATION.md)
- [Database Schema](../backend/database/schemas/COMPLETE_DATABASE_SCHEMA.sql)
- [Business Logic](../backend/database/docs/BUSINESS_LOGIC_UPDATES.md)

### Related Files
- [Activity Diagrams README](./activity-diagrams/README.md)
- [Sequence Diagrams README](./sequence-diagrams/README.md)
- [Quick Reference](./activity-diagrams/QUICK_REFERENCE.md)

---

## 📞 Liên hệ

**Người thực hiện:** Kiro AI Assistant  
**Email:** [Thay bằng email của bạn]  
**Dự án:** TVU Fund Management System  
**Ngày cập nhật:** 08/06/2026

---

**Note:** File này sẽ được cập nhật liên tục khi có thay đổi về diagrams.
