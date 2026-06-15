# Fix: Tự động set ngaybatdau khi tạo quỹ

## Vấn đề
Cột `ngaybatdau` trong bảng `quy` luôn NULL vì:
- Form tạo quỹ không có input để nhập ngày bắt đầu
- Backend không tự động set giá trị

## Yêu cầu
Khi tạo quỹ, cột `ngaybatdau` tự động được set = ngày hiện tại (ngày tạo quỹ)

## Giải pháp

### 1. Backend Controller (`fundController.js`)
Thêm field `ngayBatDau` vào `fundData` với giá trị = ngày hiện tại:

```javascript
const fundData = {
  // ... các field khác
  ngayBatDau: new Date().toISOString().split('T')[0] // Format: YYYY-MM-DD
};
```

**Giải thích:**
- `new Date()` - Tạo đối tượng Date hiện tại
- `.toISOString()` - Chuyển sang format ISO: "2026-06-15T10:30:00.000Z"
- `.split('T')[0]` - Lấy phần ngày: "2026-06-15"

### 2. Backend Model (`FundModel.js`)
Thêm cột `ngaybatdau` vào INSERT query:

```sql
INSERT INTO quy (
  tenquy,
  loaiquy_id,
  mota, 
  hinhanh,
  sotienmuctieu,
  sotienhotrotoida,
  soluonghotrotoida,
  dieukienhotro,
  ngaybatdau,        -- ✅ Thêm cột này
  ngayketthuc,
  sodu, 
  nguoitao_id,
  trangthai
) VALUES (
  ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
)
```

Thêm `ngayBatDau` vào mảng values (vị trí thứ 9):

```javascript
[
  tenQuy,
  loaiQuy,
  moTa || null,
  hinhAnh || null,
  soTienMucTieu || null,
  soTienHoTroToiDa || null,
  soLuongChiTieu || null,
  dieuKienTomTat || null,
  ngayBatDau || null,      // ✅ Thêm vào đây
  hanNopDon || null,
  soDu || 0.00,
  nguoiTao || null,
  trangThai || 'Dang hoat dong'
]
```

## Files Modified

1. **`backend/controllers/funds/fundController.js`**
   - Hàm `createFund()` - thêm `ngayBatDau: new Date().toISOString().split('T')[0]`

2. **`backend/models/funds/FundModel.js`**
   - Hàm `createFund()` - destructure `ngayBatDau` từ `fundData`
   - INSERT query - thêm cột `ngaybatdau` và giá trị tương ứng

## Testing

1. **Khởi động lại backend**
2. **Tạo quỹ mới**
3. **Kiểm tra database:**
   ```sql
   SELECT quy_id, tenquy, ngaybatdau, ngayketthuc, ngaytao
   FROM quy 
   ORDER BY ngaytao DESC 
   LIMIT 1;
   ```

**Kết quả mong đợi:**
- `ngaybatdau` = ngày hiện tại (ví dụ: 2026-06-15)
- `ngayketthuc` = ngày hạn nộp đơn (nếu có nhập) hoặc NULL
- `ngaytao` = timestamp khi tạo record

## Lưu ý

- `ngaybatdau` có kiểu DATE - format: YYYY-MM-DD
- `ngaytao` có kiểu TIMESTAMP - format: YYYY-MM-DD HH:MM:SS
- Nếu muốn thay đổi ngày bắt đầu sau khi tạo, có thể thêm field vào form Update

## Status
✅ **FIXED** - Ngày bắt đầu tự động được set = ngày tạo quỹ
