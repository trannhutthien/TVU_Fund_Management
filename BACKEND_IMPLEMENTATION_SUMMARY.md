# ✅ BACKEND IMPLEMENTATION SUMMARY - LUỒNG DUYỆT 3 CẤP

## 📦 Các File Đã Tạo/Sửa

### ✅ **1. Database Migration**
📁 `backend/database/migrations/add_proposal_approval_workflow.mjs`
- Thêm 9 cột mới vào bảng `dexuatchuongtrinh`
- Thêm foreign keys cho data integrity
- Sử dụng: `node backend/database/migrations/add_proposal_approval_workflow.mjs`

**Cột mới**:
```sql
-- Cán bộ duyệt (Bước 1)
canbo_duyet_id INT(11)
ngay_canbo_duyet DATETIME
ghi_chu_canbo TEXT

-- Kế toán xác nhận (Bước 2)
ketoan_xacnhan_id INT(11)
ngay_ketoan_xacnhan DATETIME
so_tien_thuc_te DECIMAL(15,2)

-- Admin tạo hoạt động (Bước 3)
admin_duyet_id INT(11)
ngay_admin_duyet DATETIME
ghi_chu_admin TEXT
```

---

### ✅ **2. Model Functions**
📁 `backend/models/donations/DeXuatChuongTrinhModel.js`

**Functions mới**:
```javascript
// Bước 1: Cán bộ duyệt
approveByCanBo(id, canBoDuyetId, ghiChu, quyThanhPhanIdMoi)
rejectByCanBo(id, canBoDuyetId, lyDoTuChoi, ghiChu)

// Bước 2: Kế toán xác nhận
confirmMoneyByKeToan(id, keToanId, soTienThucTe)

// Bước 3: Admin tạo hoạt động
createActivityByAdmin(id, adminId, ghiChu)
```

**Logic chính**:
- ✅ Kiểm tra trạng thái proposal trước khi xử lý
- ✅ Cộng tiền vào Quỹ Thành Phần (Bước 2)
- ✅ Trích tiền từ Quỹ Thành Phần → Quỹ Cấp 3 (Bước 3)
- ✅ Tạo bản ghi giao dịch và phân bổ ngân sách
- ✅ Transaction rollback nếu có lỗi

---

### ✅ **3. Controller**
📁 `backend/controllers/donations/proposalApprovalController.js`

**Endpoints**:
```javascript
// Bước 1
approveByCanBo      // POST /api/donations/propose-program/:id/approve-by-canbo
rejectByCanBo       // POST /api/donations/propose-program/:id/reject-by-canbo

// Bước 2
confirmMoneyByKeToan // POST /api/donations/propose-program/:id/confirm-money

// Bước 3
createActivityByAdmin // POST /api/donations/propose-program/:id/create-activity

// Helper
getProposalStatus    // GET /api/donations/propose-program/:id/status
```

**Features**:
- ✅ Authorization check (Cán bộ/Kế toán/Admin)
- ✅ Validation input
- ✅ Error handling với message rõ ràng
- ✅ Response format chuẩn

---

### ✅ **4. Routes**
📁 `backend/routes/donations/donationRoutes.js`

**Routes mới**:
```javascript
// Timeline status
GET    /api/donations/propose-program/:id/status

// Bước 1: Cán bộ (Role 3)
POST   /api/donations/propose-program/:id/approve-by-canbo
POST   /api/donations/propose-program/:id/reject-by-canbo

// Bước 2: Kế toán (Role 2)
POST   /api/donations/propose-program/:id/confirm-money

// Bước 3: Admin (Role 1)
POST   /api/donations/propose-program/:id/create-activity
```

**Backward Compatibility**:
- ✅ Routes cũ vẫn hoạt động (`/approve`, `/reject`)
- ✅ Không breaking changes

---

### ✅ **5. Documentation**
📁 `backend/docs/PROPOSAL_APPROVAL_WORKFLOW.md`
- Giải thích chi tiết luồng duyệt 3 cấp
- API documentation với examples
- Test cases
- Troubleshooting guide

---

## 🔄 LUỒNG HOẠT ĐỘNG

### **Luồng Duyệt Chi Tiết**

```
┌─────────────────────────────────────────────────────────────────┐
│  1️⃣  BƯỚC 1: CÁN BỘ DUYỆT NỘI DUNG                              │
├─────────────────────────────────────────────────────────────────┤
│  Role: Cán bộ (vaitro = 3)                                      │
│  API: POST /propose-program/:id/approve-by-canbo                │
│  Input:                                                          │
│    - ghiChu (optional)                                           │
│    - quyThanhPhanId (optional) - Sửa quỹ nếu nhà tài trợ sai   │
│  Output:                                                         │
│    - trangthai = 'Can bo da duyet'                              │
│    - canbo_duyet_id, ngay_canbo_duyet, ghi_chu_canbo            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  2️⃣  BƯỚC 2: KẾ TOÁN XÁC NHẬN TIỀN                              │
├─────────────────────────────────────────────────────────────────┤
│  Role: Kế toán (vaitro = 2)                                     │
│  API: POST /propose-program/:id/confirm-money                   │
│  Input:                                                          │
│    - soTienThucTe (optional) - Số tiền thực tế nếu khác đề xuất│
│  Logic:                                                          │
│    1. Cộng tiền vào Quỹ Thành Phần (Cấp 2)                     │
│       UPDATE quy SET sodu = sodu + [sotien]                     │
│    2. Tạo bản ghi giao dịch (audit trail)                       │
│       INSERT INTO giaodich (...)                                 │
│  Output:                                                         │
│    - trangthai = 'Da nhan tien'                                 │
│    - ketoan_xacnhan_id, ngay_ketoan_xacnhan, so_tien_thuc_te   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  3️⃣  BƯỚC 3: ADMIN TẠO HOẠT ĐỘNG                                │
├─────────────────────────────────────────────────────────────────┤
│  Role: Admin (vaitro = 1)                                       │
│  API: POST /propose-program/:id/create-activity                 │
│  Input:                                                          │
│    - ghiChu (optional)                                           │
│  Logic:                                                          │
│    1. Kiểm tra ngân sách Quỹ Thành Phần đủ không               │
│    2. Tạo Quỹ Cấp 3 mới (Hoạt động/Chương trình)               │
│       INSERT INTO quy (capdo=3, quy_cha_id=...)                 │
│    3. Trừ tiền từ Quỹ Thành Phần (Cấp 2)                       │
│       UPDATE quy SET sodu = sodu - [sotien] WHERE quy_id=[cap2]│
│    4. Cộng tiền vào Quỹ Hoạt động (Cấp 3)                      │
│       UPDATE quy SET sodu = sodu + [sotien] WHERE quy_id=[cap3]│
│    5. Tạo bản ghi phân bổ ngân sách                             │
│       INSERT INTO phanbongansach (...)                           │
│  Output:                                                         │
│    - trangthai = 'Da tao hoat dong'                             │
│    - admin_duyet_id, ngay_admin_duyet, quyketqua_id            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 💰 LUỒNG TIỀN CHI TIẾT

### **Ví Dụ Cụ Thể**

**Setup ban đầu**:
```
Quỹ Tổng (Cấp 1): 1 tỷ
  └─ Quỹ Học Bổng (Cấp 2): 100 triệu
      ├─ Học bổng A (Cấp 3): 30 triệu
      └─ Học bổng B (Cấp 3): 20 triệu
```

**Nhà tài trợ đề xuất**: Tạo "Học bổng C" với 50 triệu (10 suất x 5 triệu)

**Bước 1 - Cán bộ duyệt**: ✅ OK
```
Status: Cho duyet → Can bo da duyet
Tiền: Không thay đổi
```

**Bước 2 - Kế toán xác nhận tiền**: ✅ Đã nhận 50 triệu
```
Quỹ Học Bổng (Cấp 2): 100tr + 50tr = 150 triệu ⬆️
Status: Can bo da duyet → Da nhan tien
```

**Bước 3 - Admin tạo hoạt động**: ✅ Tạo Học bổng C
```
Tạo Quỹ mới:
  - Học bổng C (Cấp 3): 0 → 50 triệu ⬆️

Trích từ Quỹ Học Bổng:
  - Quỹ Học Bổng (Cấp 2): 150tr - 50tr = 100 triệu ⬇️

Status: Da nhan tien → Da tao hoat dong
```

**Kết quả cuối cùng**:
```
Quỹ Tổng (Cấp 1): 1 tỷ (không đổi)
  └─ Quỹ Học Bổng (Cấp 2): 100 triệu (về như cũ, vì +50tr rồi -50tr)
      ├─ Học bổng A (Cấp 3): 30 triệu
      ├─ Học bổng B (Cấp 3): 20 triệu
      └─ Học bổng C (Cấp 3): 50 triệu ⭐ MỚI
```

**Kết luận**:
- ✅ Tiền vào Quỹ Thành Phần trước → Minh bạch
- ✅ Sau đó mới trích ra tạo hoạt động → Kiểm soát
- ✅ Không thể tạo hoạt động nếu quỹ không đủ → An toàn

---

## 🔐 PHÂN QUYỀN

| Endpoint | Cán bộ (3) | Kế toán (2) | Admin (1) | Nhà TT (4) | BKS (5) |
|----------|:----------:|:-----------:|:---------:|:----------:|:-------:|
| `GET /status` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `POST /approve-by-canbo` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `POST /reject-by-canbo` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `POST /confirm-money` | ❌ | ✅ | ❌ | ❌ | ❌ |
| `POST /create-activity` | ❌ | ❌ | ✅ | ❌ | ❌ |

---

## 📊 TRẠNG THÁI PROPOSAL

```
Cho duyet             → Mới tạo, chờ cán bộ duyệt
    ↓
Can bo da duyet       → Cán bộ đã duyệt, chờ kế toán
    ↓
Da nhan tien          → Kế toán đã xác nhận, tiền đã vào quỹ, chờ admin
    ↓
Da tao hoat dong      → Admin đã tạo hoạt động, HOÀN TẤT ✅

Hoặc:

Cho duyet → Tu choi   → Cán bộ từ chối, KẾT THÚC ❌
```

---

## 🧪 TESTING

### **1. Test Với Postman**

**Collection cần tạo**:
```
Proposal Approval Workflow/
  ├─ 1. Approve by CanBo
  ├─ 2. Reject by CanBo
  ├─ 3. Confirm Money by KeToan
  ├─ 4. Create Activity by Admin
  └─ 5. Get Status
```

**Variables**:
```javascript
{
  "base_url": "http://localhost:5001/api",
  "canbo_token": "...",
  "ketoan_token": "...",
  "admin_token": "...",
  "proposal_id": "123"
}
```

### **2. Test Cases Quan Trọng**

✅ **TC01: Happy Path - Luồng thành công**
```
1. Cán bộ duyệt → 200 OK
2. Kế toán xác nhận → 200 OK  
3. Admin tạo hoạt động → 200 OK
4. Check status → trangthai = 'Da tao hoat dong'
5. Check DB: Quỹ Cấp 3 đã được tạo
```

✅ **TC02: Cán bộ từ chối**
```
1. Cán bộ từ chối → 200 OK
2. Check status → trangthai = 'Tu choi'
3. Kế toán không thể xác nhận → 400 Error
```

✅ **TC03: Sửa Quỹ Thành Phần**
```
1. Nhà tài trợ chọn Quỹ A (sai)
2. Cán bộ duyệt với quyThanhPhanId = B (đúng) → 200 OK
3. Check DB: quythanhphan_id = B
```

✅ **TC04: Ngân sách không đủ**
```
1. Quỹ Thành Phần chỉ có 30tr
2. Đề xuất cần 50tr
3. Admin tạo hoạt động → 400 "Ngân sách không đủ"
```

✅ **TC05: Wrong Order**
```
1. Kế toán xác nhận (skip cán bộ) → 400 "Chưa được cán bộ duyệt"
2. Admin tạo hoạt động (skip kế toán) → 400 "Chưa xác nhận tiền"
```

✅ **TC06: Authorization**
```
1. Kế toán gọi /approve-by-canbo → 403 Forbidden
2. Cán bộ gọi /confirm-money → 403 Forbidden
3. Nhà tài trợ gọi /create-activity → 403 Forbidden
```

---

## 🚀 DEPLOYMENT CHECKLIST

### **Pre-Deployment**

- [ ] Backup database
- [ ] Test migration trên dev environment
- [ ] Review tất cả API endpoints
- [ ] Test authorization với các roles

### **Deployment Steps**

```bash
# 1. Pull code mới
git pull origin main

# 2. Chạy migration
node backend/database/migrations/add_proposal_approval_workflow.mjs

# 3. Restart server
pm2 restart tvu-fund-backend

# 4. Test health check
curl http://localhost:5001/api/health

# 5. Test một proposal
curl http://localhost:5001/api/donations/propose-program/1/status \
  -H "Authorization: Bearer <token>"
```

### **Post-Deployment**

- [ ] Verify migration thành công (check cột mới trong DB)
- [ ] Test happy path với data thật
- [ ] Monitor error logs
- [ ] Notify team về API mới

---

## 📝 NOTES

### **Ưu Điểm Của Luồng Mới**

✅ **Kiểm soát chặt chẽ**: 3 cấp duyệt, mỗi cấp 1 trách nhiệm  
✅ **Minh bạch tài chính**: Tiền vào quỹ chung trước, phân bổ sau  
✅ **Audit trail**: Ghi lại ai làm gì, khi nào  
✅ **Flexible**: Cán bộ có thể sửa quỹ nếu nhà tài trợ chọn sai  
✅ **Safe**: Không thể tạo hoạt động nếu quỹ không đủ tiền  

### **Backward Compatibility**

✅ API cũ vẫn hoạt động (`/approve`, `/reject`)  
✅ Database schema tương thích ngược  
✅ Không breaking changes cho UI cũ  

### **Future Improvements**

🔔 **Notifications**:
- Email/SMS khi đổi trạng thái
- Push notification cho mobile app

📊 **Dashboard**:
- Số lượng proposal chờ duyệt theo từng bước
- Biểu đồ timeline trung bình

📄 **Export**:
- Export báo cáo PDF timeline
- Export danh sách proposal theo trạng thái

---

## ✅ HOÀN TẤT

**Backend đã sẵn sàng để test và deploy!**

**Next Steps**:
1. ✅ Backend hoàn tất
2. ⏭️ Implement UI (Page Khoản Tài Trợ)
3. ⏭️ Test tích hợp Frontend + Backend
4. ⏭️ Deploy lên production

---

**Created by**: Kiro AI Assistant  
**Date**: 2024-12-19  
**Status**: ✅ COMPLETED
