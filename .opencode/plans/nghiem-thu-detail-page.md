# Kế hoạch: Tạo trang Nghiệm thu chi tiết trong Giám sát Nghiệm thu & Công nợ

## Mục tiêu
Khi nhấn "Xem" trong tab Nghiệm thu (NghiemThuTab), thay vì mở modal → navigate sang trang chi tiết nghiệm thu của đơn đó. Trang sẽ hiển thị: thông tin đơn đầy đủ + tổng quan các lần nghiệm thu + timeline chi tiết + form tạo đợt nghiệm thu mới.

---

## Kiến trúc tổng thể

```
/giam-sat                          → GiamSatNghiemThuCongNoPage (giữ nguyên)
/giam-sat/nghiem-thu/:yeucauhotroId → NghiemThuDetailPage (MỚI)
```

---

## Cấu trúc file mới

```
frontend/src/pages/Staff/Shared/GiamSatNghiemThuCongNoPage/
├── tabs/
│   └── NghiemThuTab/
│       └── index.jsx                     ← SỬA: navigate thay vì modal
└── NghiemThuDetailPage/
    ├── NghiemThuDetailPage.jsx           ← MỚI: trang chính
    ├── NghiemThuDetailPage.module.scss   ← MỚI: styles trang
    └── sections/
        ├── ApplicationInfoCard.jsx       ← MỚI: thông tin đơn
        ├── ApplicationInfoCard.module.scss
        ├── InspectionSummary.jsx         ← MỚI: tổng quan các lần NT
        ├── InspectionSummary.module.scss
        ├── InspectionTimeline.jsx        ← MỚI: timeline chi tiết
        ├── InspectionTimeline.module.scss
        ├── CreateInspectionForm.jsx      ← MỚI: form tạo đợt NT mới
        └── CreateInspectionForm.module.scss
```

---

## Backend: Endpoint mới

### `GET /api/nghiem-thu/application/:yeucauhotroId/detail`

Trả về đầy đủ thông tin đơn + lịch sử nghiệm thu + tổng quan.

**Response:**
```json
{
  "success": true,
  "data": {
    "yeucauhotroId": 1,
    "trangthai": "Da giai ngan",
    "loaihotro": "Cho vay",
    "canghiemthu": 1,
    "lydo": "...",
    "sotiendenghi": 5000000,
    "tongkinhphidudan": 10000000,
    "ngaynop": "2026-07-01",
    "nguoiNhan": {
      "ten": "...",
      "email": "...",
      "sodienthoai": "...",
      "masodinhdanh": "..."
    },
    "quy": {
      "tenquy": "...",
      "sodu": 2000000
    },
    "tongQuan": {
      "tongLanNghiemThu": 3,
      "lanGanNhat": 2,
      "ketQuaGanNhat": "Dat",
      "ngayGanNhat": "2026-07-15",
      "coTheTaoMoi": true
    },
    "lichSuNghiemThu": [
      {
        "nghiemthuId": 1,
        "lanthu": 1,
        "loaiKiemTra": "Kiem tra tien do",
        "ketqua": "Dat",
        "nhanXet": "...",
        "soQuyetDinh": "QD-001",
        "fileBienBan": "...",
        "tenNguoiNghiemThu": "...",
        "ngayNghiemThu": "2026-07-10"
      }
    ]
  }
}
```

**Controller logic:**
1. Query `yeucauhotro` + JOIN `nguoidung`, `quy` để lấy thông tin đơn
2. Query `nghiemthu` với `ORDER BY lanthu ASC` để lấy lịch sử
3. Tính `tongQuan` từ kết quả lịch sử
4. Kiểm tra `coTheTaoMoi`: trạng thái phải là 'Da giai ngan' hoặc 'Cho nghiem thu'

---

## Chi tiết từng component

### 1. NghiemThuDetailPage.jsx (Trang chính)

- Nhận `yeucauhotroId` từ URL params (`useParams`)
- Gọi `GET /api/nghiem-thu/application/:id/detail` khi mount
- Render 3 section theo layout:
  ```
  ┌─────────────────────────────────────────┐
  │ ← Quay lại    Nghiệm thu đơn #1        │  ← Header với nút back
  ├─────────────────────────────────────────┤
  │ ApplicationInfoCard                     │  ← Thông tin đơn
  ├──────────────────────┬──────────────────┤
  │ InspectionSummary    │ CreateInspection │  ← Tổng quan + Form tạo mới
  │ (4 thẻ thống kê)    │ Form             │
  ├──────────────────────┴──────────────────┤
  │ InspectionTimeline                      │  ← Timeline chi tiết
  │ (danh sách các lần nghiệm thu)          │
  └─────────────────────────────────────────┘
  ```

### 2. ApplicationInfoCard.jsx

Hiển thị thông tin đơn đọc được:
- **Dòng 1**: Tên người nộp + mã số định danh + email
- **Dòng 2**: Quỹ + số dư hiện tại + loại hỗ trợ (badge)
- **Dòng 3**: Số tiền giải ngân + tổng kinh phí dự án
- **Dòng 4**: Lý do xin hỗ trợ (text block)
- **Dòng 5**: Trạng thái hiện tại (badge màu)

### 3. InspectionSummary.jsx

4 thẻ thống kê nhỏ:
| Thẻ | Giá trị | Ý nghĩa |
|-----|---------|---------|
| Tổng lần NT | `tongLanNghiemThu` | Số lần đã thực hiện |
| Lần gần nhất | `lanGanNhat` | Lần thứ mấy |
| Kết quả gần nhất | Badge màu | Đạt / Không đạt / Chờ đánh giá |
| Có thể tạo mới | Badge xanh/đỏ | true nếu trạng thái cho phép |

### 4. InspectionTimeline.jsx

Hiển thị danh sách `lichSuNghiemThu` theo dạng timeline:
- Mỗi item: DOT (màu kết quả) + DÒNG KÉO + nội dung
- Nội dung: "Lần X" + loại kiểm tra (tag) + kết quả (tag màu) + nhận xét + người thực hiện + ngày + số quyết định + link file biên bản
- Nếu `lichSuNghiemThu.length === 0`: hiện empty state "Chưa có lần nghiệm thu nào"

### 5. CreateInspectionForm.jsx

Form bên phải trang (sidebar-like):
- **Chọn loại kiểm tra**: 2 radio cards (Kiểm tra tiến độ / Nghiệm thu cuối cùng)
- **Nút "Tạo đợt nghiệm thu"**: Gọi `POST /api/nghiem-thu` → refresh lại data trang
- Nếu `coTheTaoMoi === false`: Disable form + hiện lý do (trạng thái không cho phép)
- Hiển thị xác nhận trước khi tạo (giống ConfirmDialog)

### 6. NghiemThuTab/index.jsx (SỬA)

Thay đổi duy nhất:
```diff
- const handleViewDetail = async (item) => {
-   setSelectedApp(item);
-   try {
-     const res = await nghiemThuService.getInspectionHistory(item.yeucauhotro_id);
-     setHistory(res?.data?.lichSuNghiemThu || []);
-   } catch {
-     setHistory([]);
-   }
-   setShowModal(true);
- };

+ const handleViewDetail = (item) => {
+   navigate(`/giam-sat/nghiem-thu/${item.yeucauhotro_id}`);
+ };
```

Xóa state `showModal`, `selectedApp`, `history` + xóa render `NghiemThuFormModal`.

---

## Route mới trong App.jsx

```jsx
{/* Shared Routes - Admin, Ke toan, Can bo, Ban kiem soat */}
<Route element={<RoleBasedRoute allowedRoles={[1, 2, 3, 5]} redirectTo="/" />}>
  <Route path="/giam-sat" element={<GiamSatNghiemThuCongNoPage />} />
  <Route path="/giam-sat/nghiem-thu/:yeucauhotroId" element={<NghiemThuDetailPage />} />
</Route>
```

---

## Backend: NghiemThuModel bổ sung

### `getDetailByApplicationId(yeucauhotroId)`

```sql
SELECT
  yc.yeucauhotro_id, yc.trangthai, yc.loaihotro, yc.canghiemthu,
  yc.lydo, yc.sotiendenghi, yc.tongkinhphidudan, yc.ngaynop,
  nd.hoten AS nguoi_nhan_ten, nd.email AS nguoi_nhan_email,
  nd.sodienthoai, nd.masodinhdanh,
  q.tenquy, q.sodu AS quy_sodu
FROM yeucauhotro yc
INNER JOIN nguoidung nd ON yc.nguoidung_id = nd.nguoidung_id
INNER JOIN quy q ON yc.quy_id = q.quy_id
WHERE yc.yeucauhotro_id = ?
```

### `getByApplicationId` (đã có)

Trả về danh sách `nghiemthu` ORDER BY `lanthu ASC`.

---

## Sửa đổi file hiện có

| File | Thay đổi |
|------|----------|
| `NghiemThuTab/index.jsx` | `handleViewDetail` → `navigate()`, xóa modal state + render |
| `App.jsx` | Thêm import `NghiemThuDetailPage` + route `/giam-sat/nghiem-thu/:yeucauhotroId` |
| `NghiemThuModel.js` | Thêm `getDetailByApplicationId()` |
| `nghiemThuController.js` | Thêm `getDetail()` endpoint |
| `nghiemThuRoutes.js` | Thêm `GET /application/:id/detail` |
| `nghiemThuService.js` | Thêm `getDetail(yeucauhotroId)` |

---

## Quyền truy cập

- **Xem trang**: roles [1, 2, 3, 5] (giống trang list)
- **Tạo đợt NT mới**: roles [1, 3] (Admin + Cán bộ Quỹ)
- **Cập nhật kết quả**: roles [1, 3] (giữ nguyên logic cũ)

---

## Flow hoạt động

```
1. User mở /giam-sat → tab Nghiệm thu hiển thị danh sách
2. User nhấn "Xem" trên 1 dòng
3. → navigate("/giam-sat/nghiem-thu/123")
4. → NghiemThuDetailPage mount
5. → Gọi GET /api/nghiem-thu/application/123/detail
6. → Hiển thị: ApplicationInfoCard + InspectionSummary + InspectionTimeline + CreateInspectionForm
7. User nhấn "Tạo đợt nghiệm thu" → POST /api/nghiem-thu → refresh data
8. User nhấn "Quay lại" → navigate("/giam-sat")
```

---

## Các bước thực hiện

1. **Backend**: Thêm `getDetailByApplicationId` vào NghiemThuModel
2. **Backend**: Thêm `getDetail` controller + route
3. **Frontend**: Thêm `getDetail` vào nghiemThuService
4. **Frontend**: Tạo `NghiemThuDetailPage` + các section con
5. **Frontend**: Thêm route vào App.jsx
6. **Frontend**: Sửa `NghiemThuTab` — navigate thay modal
7. **Test**: Kiểm tra toàn bộ flow
