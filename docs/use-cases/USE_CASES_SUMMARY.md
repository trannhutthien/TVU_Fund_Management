# 📋 TỔNG HỢP USE CASES - TVU FUND MANAGEMENT

> **Tổng số Use Cases duy nhất**: 38  
> **Tổng số Use Cases (có trùng lặp)**: 88

---

## 📊 TỔNG QUAN 5 ACTORS

| # | Actor | Role ID | Số Use Cases | File chi tiết |
|---|-------|---------|--------------|---------------|
| 1 | 🎓 **Sinh viên** | 4 | 12 | `ACTOR_1_SINH_VIEN.md` |
| 2 | 💰 **Nhà tài trợ** | Public/4 | 15 | `ACTOR_2_NHA_TAI_TRO.md` |
| 3 | 👔 **Cán bộ Quỹ** | 3 | 19 | `ACTOR_3_CAN_BO_QUY.md` |
| 4 | 💼 **Kế toán** | 2 | 17 | `ACTOR_4_KE_TOAN.md` |
| 5 | 👑 **Admin** | 1 | 25+ | `ACTOR_5_ADMIN.md` |

---

## 📋 DANH SÁCH 38 USE CASES DUY NHẤT

### **NHÓM 1: XÁC THỰC & TÀI KHOẢN** (6 UCs)
| UC | Tên | Actors |
|----|-----|--------|
| UC01 | Đăng ký tài khoản | Tất cả |
| UC02 | Đăng nhập | Tất cả |
| UC03 | Đổi mật khẩu | Tất cả |
| UC04 | Xem thông tin cá nhân | Tất cả |
| UC05 | Cập nhật thông tin cá nhân | Tất cả |
| UC06 | Đăng xuất | Tất cả |

### **NHÓM 2: QUẢN LÝ QUỸ CÔNG KHAI** (2 UCs)
| UC | Tên | Actors |
|----|-----|--------|
| UC07 | Xem danh sách quỹ công khai | Sinh viên, Nhà tài trợ (Public) |
| UC08 | Xem thông tin ngân hàng quỹ | Sinh viên, Nhà tài trợ (Public) |

### **NHÓM 3: CHỨC NĂNG SINH VIÊN** (4 UCs)
| UC | Tên | Actors |
|----|-----|--------|
| UC09 | Nộp đơn xin hỗ trợ | Sinh viên |
| UC10 | Xem danh sách đơn đã nộp | Sinh viên |
| UC11 | Xem chi tiết đơn & trạng thái phê duyệt | Sinh viên, Admin |
| UC12 | Xem lịch sử nhận hỗ trợ | Sinh viên |

### **NHÓM 4: CHỨC NĂNG NHÀ TÀI TRỢ** (3 UCs)
| UC | Tên | Actors |
|----|-----|--------|
| UC13 | Tạo khoản tài trợ công khai | Nhà tài trợ (Public) |
| UC14 | Tạo khoản tài trợ (đã đăng nhập) | Nhà tài trợ |
| UC15 | Xem lịch sử tài trợ | Nhà tài trợ |

### **NHÓM 5: QUẢN LÝ QUỸ** (3 UCs)
| UC | Tên | Actors |
|----|-----|--------|
| UC16 | Quản lý quỹ (CRUD) | Cán bộ, Admin |
| UC17 | Thay đổi trạng thái quỹ | Cán bộ, Admin |
| UC38 | Quản lý loại quỹ | Cán bộ, Admin |

### **NHÓM 6: PHÊ DUYỆT ĐƠN** (3 UCs)
| UC | Tên | Actors |
|----|-----|--------|
| UC18 | Xem danh sách tất cả đơn | Cán bộ, Kế toán, Admin |
| UC19 | Phê duyệt đơn cấp 1 | Cán bộ |
| UC20 | Phê duyệt đơn cấp 2 | Cán bộ |

### **NHÓM 7: QUẢN LÝ NHÀ TÀI TRỢ** (3 UCs)
| UC | Tên | Actors |
|----|-----|--------|
| UC21 | Quản lý nhà tài trợ | Cán bộ, Admin |
| UC22 | Quản lý sinh viên nổi bật | Cán bộ, Admin |
| UC23 | Ghi nhận khoản tài trợ offline | Cán bộ, Admin |

### **NHÓM 8: XÁC NHẬN TÀI TRỢ** (2 UCs)
| UC | Tên | Actors |
|----|-----|--------|
| UC24 | Xem danh sách khoản tài trợ | Cán bộ, Kế toán, Admin |
| UC25 | Xác nhận khoản tài trợ | Kế toán, Admin |

### **NHÓM 9: GIẢI NGÂN** (1 UC)
| UC | Tên | Actors |
|----|-----|--------|
| UC26 | Phê duyệt cấp 3 & Giải ngân | Kế toán |

### **NHÓM 10: QUẢN LÝ GIAO DỊCH** (6 UCs)
| UC | Tên | Actors |
|----|-----|--------|
| UC27 | Xem lịch sử giao dịch | Kế toán, Admin |
| UC28 | Đối soát chứng từ | Kế toán |
| UC31 | Xem giao dịch bất thường | Kế toán, Admin |
| UC32 | Xuất Excel giao dịch | Kế toán, Admin |
| UC40 | Xem tổng hợp giao dịch | Kế toán, Admin |
| UC43 | Quản lý tài khoản ngân hàng quỹ | Admin |

### **NHÓM 11: BÁO CÁO & THỐNG KÊ** (3 UCs)
| UC | Tên | Actors |
|----|-----|--------|
| UC29 | Xem thống kê tài chính | Kế toán, Admin |
| UC30 | Xuất báo cáo tài chính | Kế toán, Admin |
| UC35 | Xem thống kê tổng quan | Cán bộ, Kế toán, Admin |

### **NHÓM 12: QUẢN LÝ NGƯỜI DÙNG** (3 UCs)
| UC | Tên | Actors |
|----|-----|--------|
| UC33 | Quản lý người dùng | Cán bộ, Admin |
| UC34 | Quản lý vai trò | Cán bộ, Admin |
| UC41 | Cấp quyền người dùng | Admin (chỉ Admin) |

### **NHÓM 13: HỆ THỐNG** (3 UCs - Chỉ Admin)
| UC | Tên | Actors |
|----|-----|--------|
| UC36 | Xem nhật ký hệ thống | Admin |
| UC37 | Cài đặt hệ thống | Admin |
| UC42 | Xuất nhật ký | Admin |

---

## 🔄 MA TRẬN ACTOR - USE CASE

| Use Case | 🎓 SV | 💰 NTT | 👔 CB | 💼 KT | 👑 Admin |
|----------|-------|--------|-------|-------|----------|
| UC01-UC06 (Auth) | ✓ | ✓ | ✓ | ✓ | ✓ |
| UC07-UC08 (Xem quỹ) | ✓ | ✓ | - | - | - |
| UC09-UC12 (Đơn SV) | ✓ | - | - | - | (✓) |
| UC13-UC15 (Tài trợ) | - | ✓ | - | - | - |
| UC16-UC17 (Quản lý quỹ) | - | - | ✓ | - | ✓ |
| UC18 (Xem đơn) | - | - | ✓ | ✓ | ✓ |
| UC19-UC20 (Duyệt 1,2) | - | - | ✓ | - | (✓) |
| UC21-UC23 (NTT) | - | - | ✓ | - | ✓ |
| UC24-UC25 (Xác nhận) | - | - | (✓) | ✓ | ✓ |
| UC26 (Giải ngân) | - | - | - | ✓ | (✓) |
| UC27-UC32 (Giao dịch) | - | - | - | ✓ | ✓ |
| UC33-UC35 (User/Stats) | - | - | ✓ | ✓ | ✓ |
| UC36-UC37 (System) | - | - | - | - | ✓ |
| UC38 (Loại quỹ) | - | - | ✓ | - | ✓ |
| UC40-UC43 | - | - | - | ✓ | ✓ |

**Ghi chú**: 
- ✓ = Có quyền chính thức
- (✓) = Có thể thực hiện nhưng không phải trách nhiệm chính
- \- = Không có quyền

---

## 🎯 PHÂN LOẠI THEO TÍNH NĂNG

### **1. Tính năng Công khai** (không cần đăng nhập)
- Xem quỹ (UC07)
- Xem STK ngân hàng (UC08)
- Tài trợ công khai (UC13)
- Đăng ký, đăng nhập (UC01, UC02)

### **2. Tính năng Sinh viên**
- Nộp đơn xin hỗ trợ (UC09)
- Xem/theo dõi đơn của mình (UC10, UC11)
- Xem lịch sử nhận hỗ trợ (UC12)

### **3. Tính năng Nhà tài trợ**
- Tài trợ qua tài khoản (UC14)
- Xem lịch sử tài trợ (UC15)

### **4. Tính năng Cán bộ**
- Quản lý quỹ (UC16, UC17, UC38)
- Phê duyệt đơn cấp 1, 2 (UC19, UC20)
- Quản lý nhà tài trợ (UC21, UC22)
- Quản lý người dùng (UC33)

### **5. Tính năng Kế toán**
- Xác nhận khoản tài trợ (UC25)
- Phê duyệt cấp 3 & giải ngân (UC26)
- Quản lý giao dịch (UC27, UC28, UC31, UC32)
- Xuất báo cáo tài chính (UC29, UC30)

### **6. Tính năng Admin**
- Quản lý người dùng & vai trò (UC33, UC34, UC41)
- Xem nhật ký hệ thống (UC36)
- Cài đặt hệ thống (UC37)
- Xuất nhật ký (UC42)

---

## 📁 CẤU TRÚC THƯ MỤC

```
docs/use-cases/
├── USE_CASES_SUMMARY.md          ← File này (tổng hợp)
├── ACTOR_1_SINH_VIEN.md           ← Chi tiết 12 UCs
├── ACTOR_2_NHA_TAI_TRO.md         ← Chi tiết 15 UCs
├── ACTOR_3_CAN_BO_QUY.md          ← Chi tiết 19 UCs
├── ACTOR_4_KE_TOAN.md             ← Chi tiết 17 UCs
└── ACTOR_5_ADMIN.md               ← Chi tiết 25+ UCs
```

---

## 🔗 QUAN HỆ USE CASE

### **<<include>>** (Bắt buộc)
- UC09 (Nộp đơn) **include** UC07 (Xem quỹ)
- UC13 (Tài trợ công khai) **include** UC07 (Xem quỹ)
- UC14 (Tài trợ đã login) **include** UC07 (Xem quỹ)
- UC08 (Xem STK) **include** UC07 (Xem quỹ)

### **<<extend>>** (Mở rộng)
- UC03 (Đổi MK) **extend** UC02 (Đăng nhập)
- UC20 (Duyệt cấp 2) **extend** UC19 (Duyệt cấp 1)
- UC26 (Duyệt cấp 3) **extend** UC20 (Duyệt cấp 2)
- UC17 (Đổi trạng thái) **extend** UC16 (Quản lý quỹ)

---

## ✅ KẾT LUẬN

Use Case Diagram này bao phủ **ĐẦY ĐỦ** các chức năng của hệ thống TVU Fund Management:

✅ **Xác thực**: 6 UCs  
✅ **Quỹ công khai**: 2 UCs  
✅ **Sinh viên**: 4 UCs  
✅ **Nhà tài trợ**: 3 UCs  
✅ **Cán bộ Quỹ**: 8 UCs (riêng)  
✅ **Kế toán**: 9 UCs (riêng)  
✅ **Admin**: 6 UCs (riêng) + toàn quyền  

**Tổng cộng**: **38 Use Cases duy nhất** phục vụ **5 Actors** khác nhau.
