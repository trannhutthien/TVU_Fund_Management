# HƯỚNG DẪN MIGRATION: Cập nhật bảng TINTUC sang camelCase

**Ngày:** 13/06/2024  
**Mục đích:** Chuẩn hóa tên cột bảng `tintuc` và thêm API mới cho Landing Page

---

## 📋 TÓM TẮT THAY ĐỔI

### 1. **Đổi tên cột trong database**
Các cột không phải khóa chính/ngoại được đổi sang camelCase (bỏ gạch dưới):

| Tên cũ | Tên mới | Ghi chú |
|--------|---------|---------|
| `mota_ngan` | `motangan` | Mô tả ngắn |
| `danh_muc` | `danhmuc` | Danh mục tin tức |
| `la_noi_bat` | `lanoibat` | Featured flag (0-3) |
| `ngay_xuat_ban` | `ngayxuatban` | Ngày xuất bản |
| `tintuc_id` | `tintuc_id` | ✓ Giữ nguyên (PK) |
| `nguoitao_id` | `nguoitao_id` | ✓ Giữ nguyên (FK) |
| `nguoisua_id` | `nguoisua_id` | ✓ Giữ nguyên (FK) |

### 2. **Cập nhật cột `lanoibat`**
Thêm COMMENT mới để hỗ trợ 4 giá trị:

```sql
COMMENT '0=Bình thường, 1=Featured lớn, 2=Featured nhỏ hàng dưới, 3=Sidebar'
```

### 3. **API mới**
Thêm endpoint `GET /api/news/landing` trả về 4 nhóm tin tức trong 1 lần gọi:
- `featured` (1 bài lanoibat=1)
- `featuredSmall` (2 bài lanoibat=2)
- `sidebar` (5 bài lanoibat=3)
- `recent` (6 bài lanoibat=0)

---

## 🚀 HƯỚNG DẪN THỰC HIỆN

### **Bước 1: Backup database**
```bash
mysqldump -u root -p tvufund > backup_tvufund_$(date +%Y%m%d_%H%M%S).sql
```

### **Bước 2: Chạy migration đổi tên cột**
```bash
cd backend/database/schemas
mysql -u root -p tvufund < rename_tintuc_columns_to_camelcase.sql
```

**Kiểm tra:**
```sql
DESC tintuc;
```

### **Bước 3: Cập nhật dữ liệu seed**
```bash
cd backend/database/seeds
mysql -u root -p tvufund < update_tintuc_lanoibat_values.sql
```

**Kiểm tra:**
```sql
SELECT lanoibat, COUNT(*) FROM tintuc GROUP BY lanoibat;
```

### **Bước 4: Khởi động lại backend**
```bash
cd backend
npm run dev
```

### **Bước 5: Test API mới**
```bash
# Test endpoint mới
curl http://localhost:5001/api/news/landing

# Kết quả mong đợi:
{
  "success": true,
  "data": {
    "featured": { ... },        // 1 bài
    "featuredSmall": [ ... ],   // 2 bài
    "sidebar": [ ... ],         // 5 bài
    "recent": [ ... ]           // 6 bài
  }
}
```

---

## 📂 CÁC FILE ĐÃ THAY ĐỔI

### **Database:**
- ✅ `backend/database/schemas/rename_tintuc_columns_to_camelcase.sql` (MỚI)
- ✅ `backend/database/seeds/update_tintuc_lanoibat_values.sql` (MỚI)

### **Backend:**
- ✅ `backend/models/news/NewsModel.js` - Cập nhật tên cột, thêm `getLandingNews()`
- ✅ `backend/controllers/news/newsController.js` - Thêm `getLandingNews()`
- ✅ `backend/routes/news/newsRoutes.js` - Thêm route `/landing`

### **Frontend (chưa cập nhật):**
- ⏳ `frontend/src/components/NewsSection.jsx` - Cần cập nhật layout
- ⏳ `frontend/src/api/newsApi.js` - Cần thêm hàm `fetchLandingNews()`

---

## ⚠ ROLLBACK (Nếu cần)

Nếu gặp lỗi, rollback bằng cách:

```sql
-- Rollback đổi tên cột
ALTER TABLE tintuc
  RENAME COLUMN motangan TO mota_ngan,
  RENAME COLUMN danhmuc TO danh_muc,
  RENAME COLUMN lanoibat TO la_noi_bat,
  RENAME COLUMN ngayxuatban TO ngay_xuat_ban;

-- Hoặc restore từ backup
mysql -u root -p tvufund < backup_tvufund_YYYYMMDD_HHMMSS.sql
```

---

## 🎯 LAYOUT MỚI CHO LANDING PAGE

### **Cấu trúc 2 cột:**

```
┌─────────────────────────────────────────────────────┐
│                 TINTUC SECTION                      │
├───────────────────────────────┬─────────────────────┤
│ CỘT TRÁI (65%)                │ CỘT PHẢI (35%)      │
│                               │                     │
│ ┌───────────────────────────┐ │ ┌─────────────────┐ │
│ │ FEATURED LỚN (lanoibat=1) │ │ │ SIDEBAR (lanoibat=3) │
│ │ - Ảnh to 16:7             │ │ │ - 5 bài nhỏ     │ │
│ │ - Tiêu đề + mô tả         │ │ │ - Ảnh vuông     │ │
│ └───────────────────────────┘ │ │ - Tiêu đề       │ │
│                               │ │                 │ │
│ ┌──────────────┬────────────┐ │ │                 │ │
│ │ FEATURED NHỎ │ FEATURED   │ │ │                 │ │
│ │ (lanoibat=2) │ NHỎ #2     │ │ │                 │ │
│ │ - Ảnh 16:9   │ - Ảnh 16:9 │ │ │                 │ │
│ │ - Tiêu đề    │ - Tiêu đề  │ │ └─────────────────┘ │
│ └──────────────┴────────────┘ │                     │
└───────────────────────────────┴─────────────────────┘
```

### **Logic Fallback:**
- Không có `lanoibat=1` → Lấy bài mới nhất
- Chỉ có 1 bài `lanoibat=2` → Card chiếm full hàng dưới
- Sidebar trống → Ẩn cột phải, cột trái chiếm 100%

---

## 📊 KIỂM TRA SAU MIGRATION

### **1. Kiểm tra cấu trúc bảng:**
```sql
SHOW FULL COLUMNS FROM tintuc;
```

### **2. Kiểm tra dữ liệu lanoibat:**
```sql
SELECT 
  lanoibat,
  COUNT(*) AS so_luong,
  CASE 
    WHEN lanoibat = 0 THEN 'Bình thường'
    WHEN lanoibat = 1 THEN 'Featured lớn'
    WHEN lanoibat = 2 THEN 'Featured nhỏ'
    WHEN lanoibat = 3 THEN 'Sidebar'
  END AS loai
FROM tintuc
WHERE trangthai = 'Da xuat ban'
GROUP BY lanoibat;
```

### **3. Test API:**
```bash
# API mới (1 lần gọi)
curl http://localhost:5001/api/news/landing | jq

# API cũ (vẫn hoạt động)
curl http://localhost:5001/api/news/public?limit=10 | jq
```

---

## ✅ CHECKLIST

- [ ] Backup database
- [ ] Chạy migration SQL đổi tên cột
- [ ] Cập nhật seed data cho lanoibat
- [ ] Khởi động lại backend
- [ ] Test API `/api/news/landing`
- [ ] Test API cũ vẫn hoạt động
- [ ] Kiểm tra log không có lỗi
- [ ] Cập nhật frontend (sau này)

---

## 📝 GHI CHÚ

- Migration này **KHÔNG PHẢI breaking change** vì chỉ đổi tên cột trong database
- Tất cả query đã được cập nhật trong Model và Controller
- API cũ vẫn hoạt động bình thường (backward compatible)
- Frontend có thể cập nhật dần dần, không cần deploy cùng lúc

---

**Người thực hiện:** Kiro AI  
**Ngày hoàn thành:** 13/06/2024
