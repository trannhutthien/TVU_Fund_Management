# ⚠️ CẦN RESTART BACKEND SERVER

## 🔧 Đã fix backend để lưu đúng 3 cột tiền vào database

### Files đã sửa:
1. ✅ `backend/controllers/funds/fundController.js`
2. ✅ `backend/models/funds/FundModel.js`

### Thay đổi:

**Controller (`fundController.js`):**
```javascript
// ❌ Trước:
const { soTienToiThieu, soTienToiDa, ... } = req.body;

// ✅ Sau:
const { soTienMucTieu, soTienHoTroToiDa, nguoiTao, ... } = req.body;
```

**Model (`FundModel.js`):**
```javascript
// ❌ Trước:
INSERT INTO quy (tenquy, sotienmuctieu, sotienhotrotoida, nguoitao_id, ...)

// ✅ Sau:
INSERT INTO quy (ten_quy, so_tien_muc_tieu, so_tien_ho_tro_toi_da, nguoi_tao_id, ...)
```

### Mapping đúng:

| Frontend → Backend → Database |
|---|
| `soTienMucTieu` → `soTienMucTieu` → `so_tien_muc_tieu` |
| `soTienHoTroToiDa` → `soTienHoTroToiDa` → `so_tien_ho_tro_toi_da` |
| `soDu` → `soDu` → `so_du` |
| `nguoiTao` → `nguoiTao` → `nguoi_tao_id` |

---

## 🚀 HƯỚNG DẪN RESTART BACKEND:

### Cách 1: Dùng terminal hiện tại
```bash
# Vào thư mục backend
cd backend

# Dừng server cũ (Ctrl + C)
# Sau đó chạy lại:
npm run dev
```

### Cách 2: Dùng nodemon (tự restart)
Nếu backend đang dùng nodemon, chỉ cần save file `.js` là tự restart.

### Cách 3: Kill process và restart
```bash
# Windows PowerShell
Get-Process -Name node | Stop-Process -Force
cd backend
npm run dev
```

---

## ✅ Sau khi restart, test lại:

1. **Tạo quỹ mới** từ frontend
2. **Kiểm tra database:**
   ```sql
   SELECT 
     id,
     ten_quy,
     so_tien_muc_tieu,
     so_tien_ho_tro_toi_da,
     so_du,
     nguoi_tao_id
   FROM quy 
   ORDER BY id DESC 
   LIMIT 1;
   ```
3. **Kết quả mong đợi:**
   - ✅ `so_tien_muc_tieu` có giá trị (không NULL)
   - ✅ `so_tien_ho_tro_toi_da` có giá trị (không NULL)
   - ✅ `so_du` có giá trị
   - ✅ `nguoi_tao_id` có ID của user đang đăng nhập

---

## 📋 Tổng kết thay đổi:

### Frontend ✅ (Đã xong)
- Form inputs với labels mới
- Payload đúng: `soTienMucTieu`, `soTienHoTroToiDa`, `nguoiTao`

### Backend ✅ (Đã xong - CẦN RESTART)
- Controller nhận đúng fields từ frontend
- Model map đúng snake_case columns trong database

### Database ✅ (Không cần thay đổi)
- Schema đúng với 3 cột: `so_tien_muc_tieu`, `so_tien_ho_tro_toi_da`, `so_du`

---

**⚠️ QUAN TRỌNG: Phải restart backend server để áp dụng thay đổi!**
