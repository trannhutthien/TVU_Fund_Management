# 💼 ACTOR 4: KẾ TOÁN (Role 2)

## 📊 TỔNG QUAN
- **Role ID**: 2
- **Số lượng Use Cases**: 17

---

## 📋 DANH SÁCH USE CASES (17)

### **NHÓM 1: XÁC THỰC & TÀI KHOẢN** (6 Use Cases)
- **UC01**: Đăng ký tài khoản
- **UC02**: Đăng nhập
- **UC03**: Đổi mật khẩu
- **UC04**: Xem thông tin cá nhân
- **UC05**: Cập nhật thông tin cá nhân
- **UC06**: Đăng xuất

### **NHÓM 2: XEM ĐƠN XIN HỖ TRỢ** (1 Use Case)
- **UC18**: Xem danh sách tất cả đơn xin hỗ trợ

### **NHÓM 3: XÁC NHẬN KHOẢN TÀI TRỢ** (2 Use Cases)
- **UC24**: Xem danh sách khoản tài trợ (Lọc theo trạng thái, quỹ, thời gian)
- **UC25**: Xác nhận khoản tài trợ (Duyệt = cộng tiền vào quỹ + tạo giao dịch THU, hoặc Từ chối)

### **NHÓM 4: PHÊ DUYỆT CÂP 3 & GIẢI NGÂN** (1 Use Case)
- **UC26**: Phê duyệt cấp 3 & Giải ngân
  - Kiểm tra đã duyệt cấp 1 & 2
  - Nếu quỹ đủ tiền: Trừ tiền quỹ + Tạo giao dịch CHI + Trạng thái "Đã giải ngân"
  - Nếu thiếu tiền: Trạng thái "Chờ giải ngân" (chờ có tiền)

### **NHÓM 5: QUẢN LÝ GIAO DỊCH** (5 Use Cases)
- **UC27**: Xem lịch sử giao dịch (Tất cả giao dịch THU/CHI với filter)
- **UC28**: Đối soát chứng từ (Cập nhật trạng thái: Đã đối soát / Chưa đối soát / Sai lệch)
- **UC31**: Xem giao dịch bất thường (Giao dịch số tiền lớn, thất bại, chờ xử lý lâu)
- **UC32**: Xuất Excel giao dịch (Xuất file Excel tất cả giao dịch đang filter)
- **UC40**: Xem tổng hợp giao dịch (Summary: Tổng thu, tổng chi, ròng, bất thường)

### **NHÓM 6: THỐNG KÊ & BÁO CÁO** (2 Use Cases)
- **UC29**: Xem thống kê tài chính (Dashboard kế toán: Dòng tiền, thu/chi, tình trạng quỹ)
- **UC30**: Xuất báo cáo tài chính (Word/Excel: Thu chi tổng hợp, lịch sử giao dịch, báo cáo quỹ)

### **NHÓM 7: XEM THỐNG KÊ TỔNG QUAN** (1 Use Case)
- **UC35**: Xem thống kê tổng quan (Dashboard chung)

---

## 📊 BẢNG API ENDPOINTS

| # | Use Case | API Endpoint | Method | Role |
|---|----------|--------------|--------|------|
| UC18 | Xem danh sách đơn | `/api/applications` | GET | 1, 2, 3 |
| UC24 | Xem khoản tài trợ | `/api/donations` | GET | 1, 2, 3 |
| UC25 | Xác nhận tài trợ | `/api/donations/:id/approve` hoặc `/reject` | PUT | 1, 2 |
| UC26 | Phê duyệt cấp 3 & Giải ngân | `/api/applications/:id/disburse` | POST | 2 |
| UC27 | Xem lịch sử giao dịch | `/api/transactions` | GET | 1, 2 |
| UC28 | Đối soát chứng từ | `/api/transactions/:id/doi-soat` | PATCH | 2 |
| UC29 | Thống kê tài chính | `/api/statistics/ketoan/summary` | GET | 1, 2 |
| UC30 | Xuất báo cáo | `/api/bao-cao/xuat` | POST | 1, 2 |
| UC31 | Giao dịch bất thường | `/api/transactions?filter=bat-thuong` | GET | 1, 2 |
| UC32 | Xuất Excel giao dịch | `/api/transactions/export` | GET | 1, 2 |
| UC35 | Thống kê tổng quan | `/api/statistics/public` | GET | 1, 2, 3 |
| UC40 | Tổng hợp giao dịch | `/api/transactions/summary` | GET | 1, 2 |

---

## 🎯 TRÁCH NHIỆM CHÍNH

✅ **Xác nhận khoản tài trợ** - Kiểm tra chứng từ, duyệt/từ chối, cộng tiền vào quỹ  
✅ **Phê duyệt cấp 3 cuối cùng** - Quyết định giải ngân cho sinh viên  
✅ **Giải ngân** - Trừ tiền quỹ, tạo giao dịch CHI, xác nhận đã chuyển tiền  
✅ **Quản lý giao dịch** - Xem tất cả giao dịch THU/CHI, đối soát chứng từ  
✅ **Xuất báo cáo tài chính** - Báo cáo Word/Excel về thu chi, giao dịch  
✅ **Theo dõi tình trạng quỹ** - Dashboard tài chính, dòng tiền, sức khỏe quỹ  

❌ **KHÔNG thể** - Phê duyệt cấp 1, 2 (chỉ Cán bộ), Quản lý quỹ (chỉ Admin/Cán bộ)

---

## 🔄 LUỒNG CÔNG VIỆC CHÍNH

### **Luồng 1: Xác nhận khoản tài trợ**
```
1. Xem danh sách khoản tài trợ (UC24)
2. Filter: Trạng thái = "Chờ xác nhận"
3. Click vào khoản cần xác nhận
4. Kiểm tra chứng từ (ảnh chuyển khoản)
5. Quyết định:
   - Duyệt (UC25) → Cộng tiền vào quỹ + Tạo giao dịch THU
   - Từ chối (UC25) → Ghi lý do từ chối
```

### **Luồng 2: Giải ngân cho sinh viên**
```
1. Xem danh sách đơn (UC18)
2. Filter: Trạng thái = "Chờ duyệt cấp 3"
3. Kiểm tra:
   - Đã duyệt cấp 1? ✓
   - Đã duyệt cấp 2? ✓
   - Quỹ đủ tiền? ✓
4. Phê duyệt cấp 3 & Giải ngân (UC26)
   → Trừ tiền quỹ
   → Tạo giao dịch CHI
   → Đổi trạng thái "Đã giải ngân"
```

### **Luồng 3: Đối soát cuối tháng**
```
1. Xem lịch sử giao dịch (UC27)
2. Filter: Tháng hiện tại
3. Đối soát từng giao dịch (UC28)
4. Xem tổng hợp (UC40)
5. Xuất báo cáo (UC30)
```
