# CanBoDashboard — Tài liệu thiết kế

Tài liệu mô tả cấu trúc thư mục, công dụng từng file và luồng hoạt động của trang **Dashboard Cán bộ Quỹ** (`/can-bo/dashboard`).

---

## 1. Mục đích trang

Trang tổng quan dành cho vai trò **Giáo vụ / Cán bộ Quỹ**. Khi giáo vụ đăng nhập và mở dashboard, họ cần trả lời được 5 câu hỏi ngay lập tức:

1. Hôm nay tôi cần xử lý bao nhiêu đơn?
2. Xu hướng đơn nộp tháng này thế nào?
3. Quỹ nào đang có nhiều đơn chờ nhất?
4. Tỷ lệ duyệt/từ chối của tôi ra sao?
5. Quỹ nào sắp hết hạn / sắp cạn tiền?

Trang được chia thành 4 hàng (rows), mỗi hàng giải quyết 1 nhóm câu hỏi.

---

## 2. Cấu trúc thư mục

```
CanBoDashboard/
├── index.js                              ← Re-export default
├── CanBoDashboard.jsx                    ← Container: gọi hook + ráp section
├── CanBoDashboard.module.scss            ← Layout grid chung (page + 3 rows)
│
├── constants.js                          ← Bảng màu, label loại quỹ
├── utils.js                              ← Helpers: format, greeting, daysUntil
├── useDashboardData.js                   ← Custom hook: fetch + tính toán dữ liệu
│
└── sections/
    ├── WelcomeHeader/                    ← Khối chào hỏi đầu trang
    ├── QuickStats/                       ← Hàng 1 — 4 thẻ thống kê
    ├── MonthlyApplicationsChart/         ← Hàng 2 trái — Biểu đồ cột đơn/tháng
    ├── FundTypeChart/                    ← Hàng 2 phải — Donut loại quỹ
    ├── AmountTrendChart/                 ← Hàng 3 trái — Line xu hướng tiền
    ├── PendingApplicationsList/          ← Hàng 3 phải — 5 đơn chờ gần nhất
    ├── TopFundsChart/                    ← Hàng 4 trái — Bar ngang top 5 quỹ
    ├── SystemAlertsPanel/                ← Hàng 4 phải — Cảnh báo hệ thống
    └── DashboardSkeleton/                ← Khung loading placeholder
```

**Quy ước đặt tên:**
- Thư mục section = vai trò trên trang (đọc tên là biết nằm đâu).
- File `.jsx` cùng tên thư mục → component chính.
- File `.module.scss` cùng tên → CSS Module cô lập.

---

## 3. Công dụng từng file

### 3.1. File ở cấp gốc

| File | Công dụng |
|---|---|
| `index.js` | Re-export `default` từ `CanBoDashboard.jsx` để import gọn: `import X from '.../CanBoDashboard'`. |
| `CanBoDashboard.jsx` | **Container** ~60 dòng. Gọi `useDashboardData(year)`, render `<DashboardSkeleton/>` khi loading, ngược lại ráp các section theo grid. Quản lý state `selectedYear` cho biểu đồ xu hướng. |
| `CanBoDashboard.module.scss` | Layout cấp trang: `.page`, `.inner`, `.row2 (65/35)`, `.row3 (60/40)`, `.row4 (50/50)` + breakpoint responsive. Không chứa style của card. |
| `constants.js` | `CHART_COLORS` (primary/gold/green/red/orange/gray), `LOAI_QUY_COLORS` (map loại quỹ → màu hex), `LOAI_QUY_LABEL` (map mã → tên hiển thị). |
| `utils.js` | `formatCurrency`, `formatDateShort`, `getGreeting`, `getInitial`, `daysUntil`, `monthLabel`. Pure functions, không phụ thuộc state. |
| `useDashboardData.js` | **Custom hook** — toàn bộ logic data tập trung ở đây. Xem chi tiết ở [§4 Luồng dữ liệu](#4-luồng-dữ-liệu). |

### 3.2. Sections

| Section | Props nhận | Vai trò |
|---|---|---|
| `WelcomeHeader` | `pendingCount` | Chào theo giờ ("Chào buổi sáng/chiều/tối") + tên người dùng từ `useAuthStore` + ngày hôm nay. Nút "Đi đến Xét duyệt" có badge số đơn chờ. |
| `QuickStats` | `stats` | Render 4 `<StatCard>` trong grid 4 cột. |
| `QuickStats/StatCard` | `card` | 1 thẻ thống kê: icon + value + label + subText. Hỗ trợ `urgent` (border đỏ khi value > 0) và `link` (click → navigate). |
| `MonthlyApplicationsChart` | `data` | `BarChart` 4 nhóm cột (Chờ duyệt / Đang xử lý / Từ chối / Đã duyệt) theo 6 tháng gần nhất. |
| `FundTypeChart` | `data` | `PieChart` donut innerRadius 55 + text "Tổng đơn" ở giữa + legend dưới. |
| `AmountTrendChart` | `data`, `year`, `onChangeYear` | `LineChart` 2 đường (Tổng yêu cầu vs Đã được duyệt) theo 12 tháng. Có dropdown chọn năm. |
| `PendingApplicationsList` | `items` | List 5 đơn chờ: avatar chữ cái đầu + tên + MSSV + số tiền + ngày nộp. Click → navigate. Empty state khi không có đơn. |
| `TopFundsChart` | `data` | `BarChart layout="vertical"` top 5 quỹ. Tooltip kèm số dư quỹ. |
| `SystemAlertsPanel` | `warnings` | List cảnh báo (high/medium severity). Mỗi warning có icon + message + nút "Xem ngay". Empty state khi không có cảnh báo. |
| `DashboardSkeleton` | – | Placeholder pulse animation hiển thị khi `loading=true`. |

---

## 4. Luồng dữ liệu

```
┌──────────────────────────────────────────────────────────────────┐
│  CanBoDashboard.jsx (container)                                 │
│                                                                  │
│  const [year, setYear] = useState(currentYear)                  │
│  const { loading, stats, recentPending, warnings, charts }      │
│      = useDashboardData(year)                                   │
│                                                                  │
│  if (loading) → <DashboardSkeleton/>                            │
│                                                                  │
│  └─→ <WelcomeHeader pendingCount={stats.choDuyet}/>             │
│  └─→ <QuickStats stats={stats}/>                                │
│  └─→ Row 2: <MonthlyApplicationsChart data={charts.donTheoThang}/> │
│             <FundTypeChart data={charts.phanBoLoaiQuy}/>        │
│  └─→ Row 3: <AmountTrendChart data={charts.tienYeuCau}          │
│                               year={year} onChangeYear={setYear}/>│
│             <PendingApplicationsList items={recentPending}/>    │
│  └─→ Row 4: <TopFundsChart data={charts.topQuy}/>               │
│             <SystemAlertsPanel warnings={warnings}/>            │
└──────────────────────────────────────────────────────────────────┘
                              ↑
                              │ trả về { loading, stats, ... }
                              │
┌──────────────────────────────────────────────────────────────────┐
│  useDashboardData(selectedYear)                                 │
│                                                                  │
│  ── Bước 1: Fetch song song (useEffect, mount 1 lần) ──────────│
│     Promise.all([                                                │
│       api.get('/funds'),                                        │
│       applicationService.getAll({ limit: 500 }),                │
│       applicationService.getAll({ limit: 5,                     │
│                                   trangThai: 'Cho duyet' })     │
│     ])                                                           │
│     → setFunds, setApplications, setRecentPending               │
│                                                                  │
│  ── Bước 2: Tính toán bằng useMemo ───────────────────────────│
│     • stats         ← đếm choDuyet/dangXuLy/tongSoDu/...        │
│     • donTheoThang  ← group applications theo 6 tháng × 4 trạng thái │
│     • phanBoLoaiQuy ← join app↔fund, đếm theo loaiQuy           │
│     • tienYeuCau    ← sum soTienYeuCau theo 12 tháng × tổng/duyệt │
│     • topQuy        ← đếm app theo quyId, sort desc, lấy top 5  │
│     • warnings      ← scan funds (hết hạn ≤7d, số dư <1tr)      │
│                       + scan applications (chờ >7 ngày)         │
└──────────────────────────────────────────────────────────────────┘
                              ↑
                              │ HTTP
                              │
┌──────────────────────────────────────────────────────────────────┐
│  Backend API                                                     │
│     GET /funds              → danh sách quỹ                     │
│     GET /applications       → danh sách đơn yêu cầu             │
└──────────────────────────────────────────────────────────────────┘
```

### Vì sao tách `useDashboardData.js`?

- **Tách concerns:** Container không biết về API hay logic tính toán, chỉ truyền dữ liệu xuống section.
- **Dễ test:** Có thể test hook độc lập với UI.
- **Tái sử dụng:** Nếu cần dashboard tương tự cho vai trò khác, copy hook và sửa logic.
- **Tránh re-render thừa:** Tất cả các phép tính nặng được bọc `useMemo`, chỉ chạy lại khi `applications`/`funds`/`selectedYear` đổi.

### Vì sao mỗi section nhận props thay vì tự fetch?

- **Tránh waterfall:** Container fetch 1 lần, các section render đồng thời.
- **Đồng bộ dữ liệu:** Tất cả biểu đồ luôn cùng 1 snapshot dữ liệu.
- **Dễ thay nguồn:** Đổi API endpoint → chỉ sửa hook, không đụng section.

---

## 5. Quy tắc khi sửa / mở rộng

### Thêm 1 stat card mới
Sửa mảng `cards` trong `sections/QuickStats/QuickStats.jsx` — không cần đụng SCSS hay container.

### Thêm 1 biểu đồ mới
1. Tạo thư mục `sections/TenBieuDoMoi/` với 2 file `.jsx` + `.module.scss`.
2. Thêm logic tính data trong `useDashboardData.js` (thêm `useMemo` mới, thêm vào object trả về).
3. Import + render trong `CanBoDashboard.jsx` ở row phù hợp.

### Đổi màu chung
Sửa `constants.js` → tất cả biểu đồ tự cập nhật.

### Đổi format tiền tệ
Sửa `utils.js → formatCurrency` → ảnh hưởng toàn bộ trang.

### Đổi layout (rộng/hẹp các cột)
Chỉ sửa `CanBoDashboard.module.scss` — `.row2`, `.row3`, `.row4`. Không đụng section.

### Đổi style trong 1 card
Sửa file `.module.scss` cô lập của section đó. Không lan sang section khác vì dùng CSS Module.

---

## 6. Quy ước style

- **Card:** nền trắng, `border-radius: 12px`, `padding: 20px`, `box-shadow: 0 2px 8px rgba(26,47,94,0.06)`.
- **Tiêu đề card:** font 15px, weight 700, màu Navy `#1a2f5e`.
- **Spacing giữa rows:** 20px.
- **Spacing trong row:** 16px.
- **Màu UI:** dùng CSS variable `var(--color-navy-blue)`, `var(--color-gold)`, `var(--color-primary)`.
- **Màu trong Recharts:** dùng hex literal từ `CHART_COLORS` (Recharts không đọc CSS variable).

---

## 7. Trạng thái loading & empty

| Trạng thái | Hiển thị |
|---|---|
| `loading=true` | `<DashboardSkeleton/>` — 4 skeleton stat + 4 skeleton chart, pulse animation. |
| API fail | Hook catch lỗi, set state về mảng rỗng → các section hiển thị empty state riêng. |
| `recentPending.length=0` | Icon `HiOutlineCheckCircle` xanh + "Không có đơn nào đang chờ". |
| `warnings.length=0` | Icon `HiOutlineShieldCheck` xanh + "Không có cảnh báo nào". |
| `phanBoLoaiQuy.length=0` | Text "Chưa có dữ liệu" giữa chart. |
| `topQuy.length=0` | Text "Chưa có dữ liệu" giữa chart. |

---

## 8. Responsive

| Breakpoint | Layout |
|---|---|
| `> 1024px` | 4 cột stat, các row chia tỷ lệ thiết kế (65/35, 60/40, 50/50). |
| `≤ 1024px` | 2 cột stat, các row xếp dọc 1 cột. |
| `≤ 640px` | 1 cột stat, padding card giảm còn 16px, padding page còn 16px. |

---

## 9. Phụ thuộc bên ngoài

| Package / Module | Dùng ở đâu |
|---|---|
| `recharts` | Tất cả biểu đồ (BarChart, LineChart, PieChart). |
| `react-icons/hi2` | Tất cả icon (HiOutline...). |
| `react-router-dom` | `useNavigate` trong sections có link. |
| `@components/common/Button/Button` | Nút "Đi đến Xét duyệt" trong WelcomeHeader. |
| `@stores/authStore` | Lấy `user.hoTen` trong WelcomeHeader. |
| `@services/api` | Fetch `/funds` trong hook. |
| `@services/applicationService` | Fetch đơn yêu cầu trong hook. |

---

## 10. Điểm cần lưu ý

- File `frontend/src/pages/Staff/CanBo/CanBoDashboard.jsx` (cùng cấp với thư mục) là **shim re-export** chỉ trỏ về `./CanBoDashboard/CanBoDashboard` — không chứa logic. Tồn tại để giữ tương thích với `import` cũ trong `App.jsx`. Đừng xóa.
- Khi Recharts cần màu, **bắt buộc dùng hex literal** (`#1a2f5e`), không dùng `var(--color-...)` — vì Recharts xử lý màu ở runtime SVG, không qua CSS engine.
- Hook chỉ fetch **1 lần khi mount**. Nếu cần auto-refresh, thêm interval hoặc nút "Tải lại" trong container — không đặt trong section.
