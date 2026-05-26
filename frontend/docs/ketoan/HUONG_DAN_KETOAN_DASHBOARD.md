# Hướng dẫn KeToanDashboard

> Tài liệu mô tả chi tiết kiến trúc trang **Tổng quan Kế toán** (`/ke-toan/dashboard`) — cho vai trò Kế toán (role_id = 2) và Admin (role_id = 1).

---

## Mục lục

1. [Tổng quan](#1-tổng-quan)
2. [Cấu trúc file](#2-cấu-trúc-file)
3. [Luồng dữ liệu](#3-luồng-dữ-liệu)
4. [Backend API](#4-backend-api)
5. [Mô tả 6 Section](#5-mô-tả-6-section)
6. [Modal Xác nhận thu tiền](#6-modal-xác-nhận-thu-tiền)
7. [Routing & Sidebar](#7-routing--sidebar)
8. [Thêm Section mới](#8-thêm-section-mới)
9. [Thay đổi màu / style chung](#9-thay-đổi-màu--style-chung)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Tổng quan

Trang Dashboard giúp Kế toán nắm nhanh toàn cảnh tài chính trong ngày:

- **4 thẻ KPI**: Tổng thu / Tổng chi tháng này, Khoản chờ xác nhận thu, Đơn chờ giải ngân
- **Biểu đồ dòng tiền 6 tháng** (Bar thu + Line chi)
- **Donut cơ cấu trạng thái giao dịch**
- **Bảng 10 giao dịch gần nhất** (Thu/Chi với badge phân biệt)
- **Sức khỏe các quỹ** (progress bar theo số dư / hạn mức)
- **Danh sách khoản tài trợ chờ xác nhận** → mở modal xác nhận thu

**Stack:**

| Thành phần | Công nghệ |
|---|---|
| Page | React + SCSS Module |
| Biểu đồ | Recharts (đã có sẵn) |
| Icon | `react-icons/hi2` |
| State | useState/useEffect — không dùng store |
| Fetch | `axios` (qua `services/api.js`) |
| Modal xác nhận | Tái sử dụng `XacNhanModal` từ `KhoanTaiTroPage` |

---

## 2. Cấu trúc file

```
frontend/src/pages/Staff/KeToan/KeToanDashboard/
├── index.jsx                                  ← Page chính
├── KeToanDashboard.module.scss
└── sections/
    ├── KeToanStatsSection/
    │   ├── index.jsx                          ← 4 thẻ KPI
    │   └── KeToanStatsSection.module.scss
    ├── CashFlowChartSection/
    │   ├── index.jsx                          ← Biểu đồ thu/chi 6 tháng
    │   └── CashFlowChartSection.module.scss
    ├── TransactionStatusSection/
    │   ├── index.jsx                          ← Donut cơ cấu trạng thái
    │   └── TransactionStatusSection.module.scss
    ├── RecentTransactionSection/
    │   ├── index.jsx                          ← Bảng giao dịch gần nhất
    │   └── RecentTransactionSection.module.scss
    ├── FundHealthSection/
    │   ├── index.jsx                          ← Sức khỏe các quỹ
    │   └── FundHealthSection.module.scss
    └── PendingDonationSection/
        ├── index.jsx                          ← Danh sách chờ xác nhận
        └── PendingDonationSection.module.scss
```

**Backend tương ứng:**

```
backend/
├── controllers/statisticsController.js        ← thêm 6 hàm getKeToan*
└── routes/statisticsRoutes.js                 ← thêm 6 route /ketoan/*
```

**Service mới:**

```
frontend/src/services/statisticsService.js     ← thêm 6 method getKeToan*
```

---

## 3. Luồng dữ liệu

```
┌──────────────────────────┐
│ KeToanDashboard/index.jsx│
│                          │
│ useEffect(fetchAll)      │
│   ↓ Promise.all          │
│   - getKeToanSummary     │
│   - getKeToanCashflow    │
│   - getKeToanTxStatus    │
│   - getKeToanRecentTx    │
│   - getKeToanFundHealth  │
│   - getKeToanPending     │
│                          │
│ State:                   │
│   - summaryData          │
│   - cashflowData         │
│   - transactionStatusData│
│   - recentTransactions   │
│   - fundHealthData       │
│   - pendingDonations     │
│   - isLoading            │
│   - selectedDonation     │
└──────┬───────────────────┘
       │ (props)
       ▼
┌──────────────────────────────────────┐
│ 6 Section components (stateless)     │
│   nhận data + isLoading              │
│   tự render skeleton khi loading     │
│   tự render empty state khi rỗng     │
└──────────────────────────────────────┘
```

Khi user click **Xác nhận** ở `PendingDonationSection`:
1. `setSelectedDonation(item)` → mở `XacNhanModal`
2. User submit → modal gọi `approveDonation(id, ...)` (API có sẵn)
3. `onSuccess` callback → `fetchAll()` lại toàn bộ dashboard

---

## 4. Backend API

Tất cả endpoint dưới đây nằm trong `statisticsController.js`, bảo vệ bằng `protect + authorizeRoles(1, 2)`.

### 4.1. `GET /api/statistics/ketoan/summary`

**Response:**

```json
{
  "success": true,
  "data": {
    "tongThu": 45000000,
    "tongChi": 30000000,
    "choXacNhanThu": 3,
    "choGiaiNgan": 5,
    "thang": 5,
    "nam": 2026
  }
}
```

**Truy vấn:**

- `tongThu`: `SUM(so_tien) FROM giaodich WHERE loai='Thu' AND trang_thai='Thanh cong' AND tháng=hiện tại`
- `tongChi`: tương tự với `loai='Chi'`
- `choXacNhanThu`: `COUNT(*) FROM khoantaitro WHERE trang_thai='Da duyet'`
- `choGiaiNgan`: `COUNT(*) FROM yeucauhotro WHERE trang_thai='Cho giai ngan'`

### 4.2. `GET /api/statistics/ketoan/cashflow?months=6`

**Response:**

```json
{
  "data": [
    { "thang": "T12", "thangKey": "2025-12", "thu": 0, "chi": 0 },
    { "thang": "T1",  "thangKey": "2026-01", "thu": 12000000, "chi": 8000000 },
    ...
  ]
}
```

**Truy vấn:** `GROUP BY YEAR(ngay_giao_dich), MONTH(ngay_giao_dich)` 6 tháng gần nhất, kèm fill-in các tháng không có giao dịch (`thu=0, chi=0`).

### 4.3. `GET /api/statistics/ketoan/transaction-status`

**Response:**

```json
{
  "data": [
    { "key": "Thanh cong", "name": "Thành công", "value": 25, "color": "#f0a500" },
    { "key": "Cho xu ly",  "name": "Chờ xử lý",   "value": 3,  "color": "#93c5fd" },
    { "key": "That bai",   "name": "Thất bại",    "value": 1,  "color": "#fca5a5" },
    { "key": "Hoan tien",  "name": "Hoàn tiền",   "value": 0,  "color": "#d1d5db" }
  ]
}
```

**Truy vấn:** `GROUP BY trang_thai FROM giaodich`. Bản đồ `key → name + color` được hardcode trong controller.

### 4.4. `GET /api/statistics/ketoan/recent-transactions?limit=10`

**Response:**

```json
{
  "data": [
    {
      "transactionId": 42,
      "loai": "Thu",
      "soTien": 5000000,
      "trangThai": "Thanh cong",
      "ghiChu": "...",
      "ngayGiaoDich": "2026-05-20T...",
      "tenQuy": "Quỹ học bổng TVU"
    },
    ...
  ]
}
```

### 4.5. `GET /api/statistics/ketoan/fund-health`

**Response:**

```json
{
  "data": [
    {
      "quyId": 1,
      "tenQuy": "Quỹ học bổng TVU",
      "loaiQuy": "Hoc bong",
      "soDu": 50000000,
      "soTienToiDa": 100000000,
      "trangThai": "Dang hoat dong"
    },
    ...
  ]
}
```

Chỉ trả về quỹ `trang_thai='Dang hoat dong'`, sắp xếp theo `so_du ASC` để quỹ ít tiền nhất hiển thị trước.

### 4.6. `GET /api/statistics/ketoan/pending-donations?limit=5`

**Response:**

```json
{
  "data": [
    {
      "khoan_tai_tro_id": 12,
      "so_tien": 5000000,
      "ngay_tai_tro": "2026-05-20T...",
      "trang_thai": "Da duyet",
      "ten_nha_tai_tro": "Công ty ABC",
      "ten_quy": "Quỹ học bổng TVU",
      "quy_id": 1
    },
    ...
  ]
}
```

**Lưu ý:** Trả về **snake_case** để khớp với props của `XacNhanModal` đã có sẵn.

---

## 5. Mô tả 6 Section

### 5.1. `KeToanStatsSection` — 4 thẻ KPI

| Thẻ | Icon | Màu | Nguồn |
|---|---|---|---|
| Tổng thu tháng này | `HiBanknotes` | Gold `#f0a500` | `data.tongThu` |
| Tổng chi tháng này | `HiArrowTrendingDown` | Đỏ `#ef4444` | `data.tongChi` |
| Khoản chờ xác nhận thu | `HiClock` | Cam `#f97316` | `data.choXacNhanThu` |
| Đơn chờ giải ngân | `HiExclamationCircle` | Đỏ `#ef4444` | `data.choGiaiNgan` |

**Urgent border đỏ**: khi `card.urgent === true && Number(card.value) > 0` (chỉ áp dụng cho thẻ "Đơn chờ giải ngân").

### 5.2. `CashFlowChartSection` — Biểu đồ thu/chi

`ComposedChart` từ Recharts:

- **Bar** `dataKey="thu"` — fill gold, radius `[6,6,0,0]`, maxBarSize 36
- **Line** `dataKey="chi"` — stroke navy, strokeWidth 2.5, dot r=4

**Custom Tooltip**: render JSX có dot + tên + số tiền format `vi-VN`.

**Y-axis** rút gọn: `1.500.000 → "1.5tr"`, `200.000 → "200k"`.

### 5.3. `TransactionStatusSection` — Donut

`PieChart` với `innerRadius=65, outerRadius=95, paddingAngle=3, cornerRadius=4`.

Center của donut hiển thị **tổng số giao dịch** bằng absolute positioning.

Legend bên dưới là danh sách dọc, mỗi dòng:
- Dot màu • Tên trạng thái (flex: 1) • Số lượng • Badge `%`

### 5.4. `RecentTransactionSection` — Bảng giao dịch

Bảng HTML thuần (không dùng `<Table>` chung vì layout đặc biệt — có badge Thu/Chi tùy chỉnh).

**7 cột:** MÃ GD (10%) | LOẠI (10%) | QUỸ (25%) | SỐ TIỀN (20%) | TRẠNG THÁI (15%) | GHI CHÚ (12%) | NGÀY (8%)

**Badge Thu/Chi:**
- Thu → `↑ Thu`, nền vàng nhạt, viền vàng, text `#b45309`
- Chi → `↓ Chi`, nền đỏ nhạt, viền đỏ, text `#dc2626`

**Trạng thái** dùng `<StatusBadge>` common với map:
```js
'Thanh cong' → 'completed'
'Cho xu ly'  → 'pending'
'That bai'   → 'rejected'
'Hoan tien'  → 'cancelled'
```

**Empty state:** icon `HiInboxArrowDown` 40px xám + text "Chưa có giao dịch nào".

### 5.5. `FundHealthSection` — Sức khỏe quỹ

Mỗi item gồm 3 dòng:

1. Tên quỹ + Badge sức khỏe (Tốt / Trung bình / Cần bổ sung)
2. Progress bar — width = `(so_du / so_tien_toi_da) * 100%`
3. Số dư hiện tại + Số tiền tối đa

**Ngưỡng màu:**
- `≥ 50%` → Gold + badge "Tốt"
- `20% - 49%` → Cam + badge "Trung bình"
- `< 20%` → Đỏ + badge "Cần bổ sung"

Nếu `so_tien_toi_da = 0` hoặc null → dùng `so_du` làm max (luôn 100%).

### 5.6. `PendingDonationSection` — Chờ xác nhận

Mỗi item gồm:
- **Avatar box** 40×40 nền gold nhạt + icon `HiBuildingOffice2`
- **Khối text**: tên nhà tài trợ + tên quỹ + số tiền (gold đậm `#b45309`)
- **Nút "Xác nhận"** outline navy, hover → fill navy + text trắng

Click "Xác nhận" → gọi `onConfirm(item)` của parent → parent set `selectedDonation` → mở modal.

**Count badge** ở header: đỏ với số lượng items (chỉ hiện khi > 0).

**Empty state:** icon check xanh lá + "Không có khoản nào chờ xác nhận" + "Tất cả đã được xử lý".

---

## 6. Modal Xác nhận thu tiền

**Tái sử dụng** `XacNhanModal` từ `KhoanTaiTroPage`:

```js
import XacNhanModal from '@pages/Staff/KeToan/KhoanTaiTroPage/XacNhanModal/XacNhanModal';
```

Modal nhận prop `item` với shape:

```js
{
  khoan_tai_tro_id: number,
  ten_nha_tai_tro: string,
  ten_quy: string,
  so_tien: number,
  ngay_tai_tro: string  // ISO date
}
```

Modal sẽ:
1. Hiển thị tóm tắt khoản
2. Cho phép upload ảnh minh chứng (tối đa 5MB) qua `uploadService.uploadFile`
3. Cho phép ghi chú
4. Yêu cầu tick checkbox xác nhận
5. Submit → gọi `approveDonation(id, { ghi_chu, minh_chung_ke_toan })`

Sau khi submit thành công → callback `onSuccess` được trigger → dashboard `fetchAll()` lại.

---

## 7. Routing & Sidebar

### Route

Đã có sẵn trong `App.jsx`:

```jsx
<Route path="/ke-toan/dashboard" element={<KeToanDashboard />} />
```

Import:

```jsx
import KeToanDashboard from './pages/Staff/KeToan/KeToanDashboard'
```

Vite resolve folder → `KeToanDashboard/index.jsx`.

### Sidebar

Đã có sẵn trong `StaffSidebar.jsx`:

```js
{
  group: null,
  roles: [2],
  items: [
    { label: 'Tổng quan', path: '/ke-toan/dashboard', icon: HiOutlineChartBarSquare, roles: [2] },
  ]
}
```

Người dùng đăng nhập với role 2 (Kế toán) sẽ thấy "Tổng quan" là item đầu tiên trong sidebar.

---

## 8. Thêm Section mới

Ví dụ: thêm `TopDonorsSection` (top 5 nhà tài trợ tháng này).

### Bước 1: Tạo backend endpoint

Trong `backend/controllers/statisticsController.js`:

```js
export const getKeToanTopDonors = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT ntt.ten_nha_tai_tro, SUM(kt.so_tien) AS tong_tien
      FROM khoantaitro kt
      INNER JOIN nhataitro ntt ON kt.nha_tai_tro_id = ntt.nha_tai_tro_id
      WHERE kt.trang_thai = 'Da nhan'
        AND YEAR(kt.ngay_tai_tro) = YEAR(CURDATE())
        AND MONTH(kt.ngay_tai_tro) = MONTH(CURDATE())
      GROUP BY kt.nha_tai_tro_id, ntt.ten_nha_tai_tro
      ORDER BY tong_tien DESC
      LIMIT 5
    `);
    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
```

### Bước 2: Đăng ký route

Trong `backend/routes/statisticsRoutes.js`:

```js
router.get('/ketoan/top-donors', protect, authorizeRoles(1, 2), getKeToanTopDonors);
```

### Bước 3: Thêm service

Trong `frontend/src/services/statisticsService.js`:

```js
getKeToanTopDonors: async () => {
  const res = await api.get('/statistics/ketoan/top-donors');
  return res.data.data;
},
```

### Bước 4: Tạo Section

Tạo thư mục `sections/TopDonorsSection/` với `index.jsx` và `TopDonorsSection.module.scss`.

### Bước 5: Mount vào page

Trong `KeToanDashboard/index.jsx`:

```js
// Thêm state
const [topDonors, setTopDonors] = useState([]);

// Thêm vào Promise.all
const [..., donors] = await Promise.all([
  ...,
  statisticsService.getKeToanTopDonors().catch(() => []),
]);
setTopDonors(donors || []);

// Render
<TopDonorsSection data={topDonors} isLoading={isLoading} />
```

---

## 9. Thay đổi màu / style chung

### CSS Variables hệ thống

Định nghĩa trong `frontend/src/styles/_variables.scss`:

```scss
:root {
  --color-navy-blue: #1a2f5e;   // Navy chính
  --color-gold: #f0a500;         // Vàng phụ
  --color-white: #ffffff;
}
```

Dashboard tuân thủ:
- **Tiêu đề / số liệu**: `var(--color-navy-blue)` + font `Be Vietnam Pro`
- **Highlight / accent**: `var(--color-gold)`
- **Background trang**: `#f0f4ff` (xanh nhạt — đồng bộ với các trang staff khác)
- **Background card**: `var(--color-white)`

### Màu phụ trợ (literal)

| Mục đích | Mã |
|---|---|
| Text mô tả | `#64748b` |
| Text label nhỏ | `#94a3b8` |
| Border / divider | `#f1f5f9` |
| Cảnh báo / đỏ | `#ef4444`, `#dc2626` |
| Cam | `#f97316`, `#c2410c` |
| Xanh OK | `#10b981`, `#86efac` |

### Thay đổi font

Tất cả section dùng:
- `font-family: 'Be Vietnam Pro'` cho tiêu đề và giá trị số
- `font-family: 'Inter'` cho text mô tả, label, nội dung bảng

Đảm bảo 2 font đã được khai báo trong `frontend/index.html` hoặc `_variables.scss`.

---

## 10. Troubleshooting

### Lỗi 1: `Cannot find module '@pages/Staff/KeToan/KhoanTaiTroPage/XacNhanModal/XacNhanModal'`

**Nguyên nhân:** Alias `@pages` chưa được khai báo trong `vite.config.js`.

**Fix:** Kiểm tra `vite.config.js` có:

```js
alias: {
  '@pages': path.resolve(__dirname, './src/pages'),
}
```

### Lỗi 2: Dashboard hiển thị trống / `data is null`

**Nguyên nhân:** Một trong các API trả về lỗi → đã catch về `null` hoặc `[]`.

**Fix:** Mở DevTools → Network tab → kiểm tra response từng endpoint `/api/statistics/ketoan/*`. Xem console backend để biết SQL error.

### Lỗi 3: HTTP 401 khi gọi API

**Nguyên nhân:** Token đã hết hạn hoặc user không có role 1/2.

**Fix:** Logout rồi login lại với tài khoản role Kế toán (role_id = 2). Token được tự inject qua `axios.interceptors` trong `services/api.js`.

### Lỗi 4: HTTP 403 khi gọi API

**Nguyên nhân:** User có token hợp lệ nhưng role không nằm trong `[1, 2]`.

**Fix:** Kiểm tra `req.user.roleId` ở backend, hoặc cấp lại tài khoản đúng role.

### Lỗi 5: Modal `XacNhanModal` không hiển thị khi click "Xác nhận"

**Nguyên nhân:** `selectedDonation` không có đủ field. Modal yêu cầu `khoan_tai_tro_id`, `ten_nha_tai_tro`, `ten_quy`, `so_tien`, `ngay_tai_tro` (snake_case).

**Fix:** Kiểm tra response từ `/api/statistics/ketoan/pending-donations` đúng shape — đặc biệt là **snake_case** không phải camelCase.

### Lỗi 6: Recharts báo lỗi `dataKey is undefined`

**Nguyên nhân:** Field trong data không khớp `dataKey` trong `<Bar>` / `<Line>`.

**Fix:** Đảm bảo cashflow data có đủ `thu`, `chi`, `thang`. Donut data có `value` và `name`.

### Lỗi 7: Build báo `'darken()' is deprecated`

**Nguyên nhân:** SCSS Dart Sass 3.0 deprecated function `darken()` của file cũ khác — không liên quan code mới.

**Fix:** Bỏ qua, hoặc nếu muốn fix: thay `darken($color, $amount)` bằng `color.adjust($color, $lightness: -$amount)`.

### Lỗi 8: Số liệu hiển thị `NaN đ`

**Nguyên nhân:** Backend trả về string nhưng `Number(value)` parse fail.

**Fix:** Trong controller, ép kiểu `parseFloat()` trước khi trả về:

```js
return { tongThu: parseFloat(row.total) }
```

---

## Tips nâng cao

### Auto-refresh mỗi 60s

Trong `KeToanDashboard/index.jsx`, thêm interval:

```js
useEffect(() => {
  fetchAll();
  const interval = setInterval(fetchAll, 60000);
  return () => clearInterval(interval);
}, [fetchAll]);
```

### Hiển thị "Đang đồng bộ..." khi refetch

Tách riêng state `isRefetching` (khác `isLoading`) để không hiện skeleton mỗi lần refetch — chỉ hiện text nhỏ "Đang cập nhật..." ở `pageHeader`.

### Bật real-time với WebSocket

Khi có giao dịch mới ở backend → emit event → frontend subscribe và `fetchAll()`. Cần thêm `socket.io` ở cả 2 phía.

### Cache với React Query

Đổi từ `useState + Promise.all` sang `useQueries`:

```js
const queries = useQueries({
  queries: [
    { queryKey: ['ketoan', 'summary'], queryFn: getKeToanSummary, staleTime: 60000 },
    { queryKey: ['ketoan', 'cashflow'], queryFn: () => getKeToanCashflow(6), staleTime: 5*60000 },
    ...
  ]
});
```

`react-query` đã có trong `package.json` — chỉ cần import và dùng.

---

> **Status: ✅ ĐÃ TRIỂN KHAI VÀ BUILD THÀNH CÔNG**
>
> Trang `/ke-toan/dashboard` đã sẵn sàng. Đăng nhập role Kế toán (role_id = 2) → click "Tổng quan" ở sidebar để xem.
