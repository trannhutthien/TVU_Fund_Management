# Hướng dẫn trang Giải ngân hồ sơ

> Tài liệu mô tả chi tiết trang **Giải ngân hồ sơ** (`/ke-toan/giai-ngan`) — dành cho Kế toán (role_id = 2) xử lý các đơn xin hỗ trợ đã được Giáo vụ + Admin phê duyệt.

---

## Mục lục

1. [Tổng quan nghiệp vụ](#1-tổng-quan-nghiệp-vụ)
2. [Luồng dữ liệu](#2-luồng-dữ-liệu)
3. [Cấu trúc file](#3-cấu-trúc-file)
4. [Backend API](#4-backend-api)
5. [State management](#5-state-management)
6. [Mô tả 4 Section](#6-mô-tả-4-section)
7. [Drawer chi tiết](#7-drawer-chi-tiết)
8. [Modal Giải ngân / Từ chối](#8-modal-giải-ngân--từ-chối)
9. [Validation & Edge cases](#9-validation--edge-cases)
10. [Routing & Sidebar](#10-routing--sidebar)
11. [Troubleshooting](#11-troubleshooting)
12. [Mở rộng](#12-mở-rộng)

---

## 1. Tổng quan nghiệp vụ

### Luồng phê duyệt 3 cấp

```
Sinh viên nộp đơn
     │
     ▼
[trang_thai = Cho duyet]
     │
     │  Giáo vụ duyệt cấp 1
     ▼
[trang_thai = Dang xu ly]
     │
     │  Admin duyệt cấp 2
     ▼
[trang_thai = Dang xu ly]    ← vẫn ở trạng thái này, chờ kế toán
     │
     │  Kế toán giải ngân (TRANG NÀY)
     ▼
[trang_thai = Da giai ngan]  ← đủ tiền, đã chuyển khoản
       hoặc
[trang_thai = Cho giai ngan] ← thiếu tiền tạm thời, chờ quỹ có lại
```

### Trang này làm gì?

- **Tab "Chờ giải ngân"**: hiển thị đơn ở trạng thái `Dang xu ly` hoặc `Cho giai ngan`
- **Tab "Đã xử lý"**: lịch sử các đơn `Da giai ngan` và `Tu choi`

### Khi click "Xác nhận giải ngân", hệ thống thực hiện:

1. Trừ `quy.so_du -= so_tien_yeu_cau`
2. INSERT `giaodich (loai='Chi', trang_thai='Thanh cong', minh_chung_chuyen_khoan)`
3. UPDATE `pheduyet` cấp 3 = `Da duyet` (nếu giải ngân lần đầu)
4. UPDATE `yeucauhotro.trang_thai = 'Da giai ngan'`

### Khi click "Từ chối":

1. UPDATE `yeucauhotro.trang_thai = 'Tu choi'`, `ly_do_tu_choi`
2. UPDATE `pheduyet` cấp hiện tại = `Tu choi`, lưu lý do

---

## 2. Luồng dữ liệu

```
┌────────────────────────────────────┐
│  GiaiNganPage (state)              │
│  - activeTab                       │
│  - searchKeyword + debounce 500ms  │
│  - filterQuy, filterDateRange      │
│  - list, totalCount, currentPage   │
│  - selectedRequest, selectedDetail │
│  - bankAccount, pheDuyetList       │
│  - modalType                       │
└─────────┬──────────────────────────┘
          │
          │ fetch khi mount + khi filter thay đổi
          ▼
┌────────────────────────────────────┐
│  GET /api/applications             │
│    ?trangThai=Dang xu ly,Cho...    │
│    &quyId=...                      │
│                                    │
│  Tab "Đã xử lý":                   │
│    ?trangThai=Da giai ngan,Tu choi │
└────────────────────────────────────┘
          │
          ▼ (user click "Xem chi tiết")
┌────────────────────────────────────┐
│  GET /api/applications/:id         │
│  GET /api/bank-accounts/user/:uid  │
│  GET /api/applications/:id/        │
│    phe-duyet  (optional)           │
└────────────────────────────────────┘
          │
          ▼ (user click "Xác nhận giải ngân")
┌────────────────────────────────────┐
│  1. uploadService.uploadFile(file) │
│  2. POST /api/applications/:id/    │
│        disburse                    │
│     body: { ghiChu,                │
│             minhChungChuyenKhoan } │
└────────────────────────────────────┘
          │
          ▼ (hoặc user click "Từ chối")
┌────────────────────────────────────┐
│  PUT /api/applications/:id/reject  │
│  body: { lyDoTuChoi }              │
└────────────────────────────────────┘
```

---

## 3. Cấu trúc file

### Frontend

```
frontend/src/pages/Staff/KeToan/GiaiNganPage/
├── GiaiNganPage.jsx                     ⭐ Page chính
├── GiaiNganPage.module.scss
├── index.js                             (re-export)
└── sections/
    ├── GiaiNganFilterSection/
    │   ├── index.jsx                    Search + filter quỹ + date range
    │   └── GiaiNganFilterSection.module.scss
    ├── GiaiNganTableSection/
    │   ├── index.jsx                    Bảng (2 mode), cảnh báo quỹ thiếu, pagination
    │   └── GiaiNganTableSection.module.scss
    ├── GiaiNganDetailDrawer/
    │   ├── index.jsx                    Drawer 6 khối: SV, Bank, Request, Amount, Files, Timeline
    │   └── GiaiNganDetailDrawer.module.scss
    └── GiaiNganModal/
        ├── index.jsx                    2 mode: giai_ngan + tu_choi
        └── GiaiNganModal.module.scss
```

### Backend (cập nhật)

```
backend/
├── routes/
│   ├── applicationRoutes.js             ← mở quyền role 2
│   └── bankAccountRoutes.js             ← mở quyền role 2
└── controllers/
    └── applicationController.js         ← disburseApplication chấp nhận
                                            cả 'Dang xu ly' và 'Cho giai ngan'
```

---

## 4. Backend API

### 4.1. `GET /api/applications`

Quyền: role 1, 2, 3 (`authorizeRoles(1, 2, 3)`)

**Query params:**
- `trangThai`: string hoặc CSV (`"Dang xu ly,Cho giai ngan"`)
- `quyId`: number
- `page`, `limit`

**Response:**
```json
{
  "data": [
    {
      "requestId": 12,
      "tieuDe": "Xin hỗ trợ học phí HK1",
      "soTienYeuCau": 5000000,
      "trangThai": "Dang xu ly",
      "nguoiNop": {
        "id": 42,
        "hoTen": "Nguyễn Văn A",
        "maSoDinhDanh": "DH52123456",
        "email": "..."
      },
      "quy": {
        "id": 1,
        "tenQuy": "Quỹ học bổng TVU"
      },
      "ngayNop": "2026-05-10T..."
    }
  ],
  "pagination": { "currentPage": 1, "totalPages": 3, "totalRecords": 27 }
}
```

### 4.2. `GET /api/applications/:id`

Quyền: role 1, 2, 3, 4

Trả về chi tiết đầy đủ: thông tin SV, quỹ (có `soDu`), file đính kèm, người duyệt, lý do từ chối (nếu có).

### 4.3. `GET /api/bank-accounts/user/:userId`

Quyền: role 1, 2, 3

Trả về danh sách TK ngân hàng của sinh viên. Frontend pick TK có `la_mac_dinh=true` hoặc TK đầu tiên.

```json
{
  "data": [
    {
      "tai_khoan_id": 5,
      "user_id": 42,
      "so_tai_khoan": "1234567890",
      "ten_ngan_hang": "Vietcombank",
      "chu_tai_khoan": "NGUYEN VAN A",
      "la_mac_dinh": true
    }
  ]
}
```

### 4.4. `POST /api/applications/:id/disburse` (chỉ role 2)

**Body:**
```json
{
  "ghiChu": "Đã chuyển khoản qua VCB lúc 10:30",
  "minhChungChuyenKhoan": "/uploads/proof_1234.png"
}
```

**Behavior:**
- Nếu `currentStatus === 'Dang xu ly'`: kiểm tra cấp 1+2 đã duyệt → duyệt cấp 3 + giải ngân
- Nếu `currentStatus === 'Cho giai ngan'`: bypass kiểm tra cấp 3 (đã duyệt rồi) → giải ngân thẳng

Nếu `quy.so_du < so_tien_yeu_cau`:
- Không trừ tiền
- Set `yeucauhotro.trang_thai = 'Cho giai ngan'`
- Trả về `isDisbursed: false` (đơn vẫn nằm tab "Chờ giải ngân")

### 4.5. `PUT /api/applications/:id/reject` (role 1, 2, 3)

**Body:**
```json
{
  "lyDoTuChoi": "Sinh viên không liên lạc được, đã thử 3 lần..."
}
```

Tự xác định cấp đang chờ duyệt → ghi pheduyet đó là `Tu choi`. Nếu đơn đã qua hết 3 cấp mà vẫn cần từ chối (edge case), lấy cấp cao nhất đã duyệt.

---

## 5. State management

```js
const [activeTab, setActiveTab]               = useState('cho_giai_ngan');
const [searchKeyword, setSearchKeyword]       = useState('');
const [debouncedKeyword, setDebouncedKeyword] = useState('');  // sau 500ms
const [filterQuy, setFilterQuy]               = useState('');
const [filterDateRange, setFilterDateRange]   = useState({ from: '', to: '' });
const [list, setList]                         = useState([]);
const [totalCount, setTotalCount]             = useState(0);
const [currentPage, setCurrentPage]           = useState(1);
const [isLoading, setIsLoading]               = useState(true);

const [quyOptions, setQuyOptions]             = useState([]);
const [counts, setCounts]                     = useState({ choXuLy: 0, daXuLyHomNay: 0 });

const [selectedRequest, setSelectedRequest]   = useState(null);
const [selectedDetail, setSelectedDetail]     = useState(null);
const [bankAccount, setBankAccount]           = useState(null);
const [pheDuyetList, setPheDuyetList]         = useState([]);
const [detailLoading, setDetailLoading]       = useState(false);

const [modalType, setModalType]               = useState(null);  // 'giai_ngan' | 'tu_choi' | null
const [isSubmitting, setIsSubmitting]         = useState(false);
```

### Debounce search

```js
useEffect(() => {
  const t = setTimeout(() => setDebouncedKeyword(searchKeyword.trim()), 500);
  return () => clearTimeout(t);
}, [searchKeyword]);
```

### Reset page khi filter/tab đổi

```js
useEffect(() => {
  setCurrentPage(1);
}, [activeTab, debouncedKeyword, filterQuy, filterDateRange.from, filterDateRange.to]);
```

### Frontend filter (search & date range)

Backend chưa hỗ trợ `keyword` và `from/to` cho applications, nên frontend tự lọc:

```js
let items = res.data || [];
if (debouncedKeyword) {
  const kw = debouncedKeyword.toLowerCase();
  items = items.filter(a =>
    (a.nguoiNop?.hoTen || '').toLowerCase().includes(kw) ||
    (a.nguoiNop?.maSoDinhDanh || '').toLowerCase().includes(kw) ||
    (a.tieuDe || '').toLowerCase().includes(kw)
  );
}
```

**Hạn chế**: chỉ filter trong page hiện tại, không cross-page. Để fix, cần thêm `keyword` param ở backend `getAllApplications`.

---

## 6. Mô tả 4 Section

### 6.1. `GiaiNganFilterSection`

| Field | Cách hoạt động |
|---|---|
| Search input | Icon kính lúp, debounce 500ms qua `useEffect` |
| Dropdown quỹ | Native `<select>` với custom chevron, options từ `GET /api/funds` |
| Date range (2 input) | `<input type="date">` style theo theme |
| Nút "Xóa lọc" | Chỉ hiện khi `hasFilter` truthy, hover đổi sang đỏ |

**Responsive**: trên mobile, các phần tử tự xuống dòng và stretch 100% width.

### 6.2. `GiaiNganTableSection`

**2 mode dựa trên prop `tab`:**

**Tab "Chờ giải ngân":**

| Cột | Width | Nội dung |
|---|---|---|
| STT | 5% | Số thứ tự theo page |
| SINH VIÊN | 22% | Avatar (36px) + tên + MSSV |
| QUỸ | 18% | Tên quỹ, truncate nếu dài |
| SỐ TIỀN YÊU CẦU | 15% | Đỏ `#dc2626`, format `vi-VN + đ` |
| NGÀY NỘP ĐƠN | 12% | `toLocaleDateString('vi-VN')` |
| SỐ DƯ QUỸ | 13% | Icon ✓/⚠ + số dư, xanh nếu đủ, đỏ nếu thiếu |
| THAO TÁC | 15% | Nút "Xem chi tiết" |

**Tab "Đã xử lý":**

| Cột thay đổi | Nội dung |
|---|---|
| NGÀY XỬ LÝ | `ngayCapNhat` |
| TRẠNG THÁI | `<StatusBadge>` với map `Da giai ngan → completed`, `Tu choi → rejected` |

**Hành vi đặc biệt:**

- Row **hover** background `#f8f9ff`, cursor pointer (click vào row = mở drawer)
- Row khi **quỹ thiếu tiền** thêm `background: #fff5f5` (cảnh báo)
- Cell "Thao tác" có `onClick={(e) => e.stopPropagation()}` để click nút không trigger row click

**Empty state:**

- Tab "Chờ giải ngân": icon ✓ xanh + "Không có hồ sơ nào chờ giải ngân"
- Tab "Đã xử lý": icon inbox xám + "Chưa có lịch sử giải ngân"

**Pagination:**

- "Hiển thị X–Y trong tổng Z đơn" bên trái
- Nút "Trước" / "X / Y" / "Tiếp" bên phải

---

## 7. Drawer chi tiết

Slide từ phải, width `520px`, animation `translateX(100%) → 0` 0.28s `cubic-bezier(0.4, 0, 0.2, 1)`.

### 6 Khối thông tin

**Khối A — Thông tin sinh viên** (`#f8f9ff`)

```
[Avatar 48px] [Họ tên]
              [MSSV]
              [Khoa/Phòng]
─────────────────────────
✉ email          📞 sdt
```

**Khối B — Tài khoản ngân hàng** (highlight gold)

```
┌─────────────────────────────┐
│ Ngân hàng:   Vietcombank    │
├─────────────────────────────┤
│ Số tài khoản: 1234567890 📋 │  ← copy được, monospace 16px
├─────────────────────────────┤
│ Chủ tài khoản: NGUYEN VAN A │
└─────────────────────────────┘
```

Nếu sinh viên chưa cập nhật TK → cảnh báo đỏ + disable nút giải ngân.

**Khối C — Nội dung yêu cầu**

- Tiêu đề đơn (bold)
- Mô tả (scroll nếu dài, max-height 100px)
- Footer: tên quỹ + ngày nộp

**Khối D — Số tiền & kiểm tra quỹ** ⭐ (card navy nổi bật)

```
┌─────────────────────────────┐
│ Số tiền yêu cầu             │ ← label xám
│ 5,000,000 đ                 │ ← gold to đậm 28px
│ ─────────────────────────── │
│ Số dư quỹ:   45,500,000 đ  │ ← xanh nếu đủ, đỏ nếu thiếu
│ ✓ Đủ điều kiện — còn lại    │
│   40,500,000 đ              │
└─────────────────────────────┘
```

**Khối E — Hồ sơ đính kèm**

Mỗi file là 1 chip có icon `📎`, tên file (truncate 140px), icon tải xuống `↓`. Click → mở tab mới.

URL được resolve: nếu bắt đầu bằng `http` thì giữ nguyên, không thì prepend `VITE_API_BASE_URL`.

**Khối F — Timeline phê duyệt**

Dot vertical line:

```
●  Cấp 1 — Da duyet              ← gold dot
│  Người duyệt: GV Trần Văn B
│  10:30 15/05/2026
│  Ghi chú: ...
│
●  Cấp 2 — Da duyet              ← gold dot
│  Người duyệt: Admin Nguyễn Thị C
│  14:00 16/05/2026
│
○  Cấp 3 — Cho duyet             ← gray dot (chờ kế toán)
```

Màu dot: `Da duyet → gold`, `Tu choi → red`, `Cho duyet → gray`.

### Footer Drawer

**Tab "Chờ giải ngân"**:
- Nút **"Từ chối"** (outline đỏ)
- Nút **"Xác nhận giải ngân"** (primary navy)
  - Disable + tooltip nếu: chưa có bank account / quỹ không đủ tiền

**Tab "Đã xử lý"**:
- Chỉ có nút "Đóng" outline

---

## 8. Modal Giải ngân / Từ chối

### Modal `giai_ngan`

Header navy với icon `HiOutlineBanknotes` gold.

**Body:**

1. **Tóm tắt readonly** (`#f8f9ff` card)
   - Sinh viên / Quỹ / Số tiền (gold 18px) / Tài khoản nhận / Số dư còn lại sau khi giải ngân

2. **Ghi chú** (textarea, không bắt buộc)

3. **Upload minh chứng** (BẮT BUỘC):
   - Dropzone `border: 2px dashed`, hover navy, drag-over gold
   - Validate: PNG/JPG/PDF, max 5MB
   - Khi đã chọn: hiển thị file name + size + nút xóa
   - Drag & drop được

**Footer:**
- "Hủy" (ghost) / "Xác nhận giải ngân" (primary, disable khi chưa có file)

### Modal `tu_choi`

Header đỏ với icon `HiOutlineXCircle`.

**Body:**

1. **Warning box** đỏ: "Hành động này không thể hoàn tác..."

2. **Lý do từ chối** (BẮT BUỘC, min 20 ký tự):
   - Textarea rows=4, maxLength=500
   - Counter ký tự góc phải: `15/20` (đỏ nếu chưa đủ)
   - Placeholder gợi ý nội dung

**Footer:**
- "Hủy" / "Xác nhận từ chối" (đỏ, disable khi chưa đủ 20 ký tự)

### Animation chung

- Overlay: fadeIn 0.2s
- Modal: scaleIn 0.25s `cubic-bezier(0.34, 1.56, 0.64, 1)` (spring bounce)

---

## 9. Validation & Edge cases

### Validation phía Frontend

| Action | Rule |
|---|---|
| Giải ngân | Phải có file minh chứng |
| Giải ngân | File size ≤ 5MB |
| Giải ngân | File type ∈ {PNG, JPG, PDF} |
| Từ chối | Lý do tối thiểu 20 ký tự (sau trim) |
| Mở modal giải ngân | Phải có bank account (disable nếu không) |
| Mở modal giải ngân | Quỹ phải đủ số dư (disable nếu không) |

### Validation phía Backend

| Endpoint | Rule |
|---|---|
| `/disburse` | `trang_thai` ∈ {`Dang xu ly`, `Cho giai ngan`} |
| `/disburse` | Nếu `Dang xu ly`: cấp 1 + 2 phải đã `Da duyet` |
| `/disburse` | Nếu `Dang xu ly`: cấp đang chờ phải là 3 |
| `/reject` | `lyDoTuChoi` không rỗng và ≥ 10 ký tự |
| `/reject` | `trang_thai` không phải `Da giai ngan` (không thể từ chối đơn đã giải ngân) |
| `/reject` | `trang_thai` không phải `Tu choi` (không từ chối 2 lần) |

### Edge cases được xử lý

1. **Quỹ tạm thời không đủ tiền** → đơn chuyển sang `Cho giai ngan`, vẫn xuất hiện tab "Chờ giải ngân". Khi quỹ có tiền lại, kế toán giải ngân lại → backend bypass kiểm tra pheduyet.

2. **Sinh viên không có bank account** → cảnh báo đỏ trong Drawer, disable nút "Xác nhận giải ngân".

3. **Upload file thất bại** → toast lỗi, không gọi disburse, không trừ tiền quỹ.

4. **Disburse fail sau khi upload file** → file đã upload nhưng không link được với giao dịch. Cần cleanup script ở backend (TODO).

5. **Click vào nút "Xem chi tiết" trong cell hành động** → có `onClick={(e) => e.stopPropagation()}` để không trigger row click.

6. **Đơn đã xử lý xem lại** → tab "Đã xử lý" → Drawer chỉ hiện nút "Đóng".

---

## 10. Routing & Sidebar

### Route đã có sẵn

```jsx
// App.jsx
import KeToanGiaiNganPage from './pages/Staff/KeToan/GiaiNganPage'
...
<Route path="/ke-toan/giai-ngan" element={<KeToanGiaiNganPage />} />
```

### Sidebar

Đã có sẵn cho role 2 trong `StaffSidebar.jsx`:

```js
{
  group: 'NGHIỆP VỤ',
  roles: [2],
  items: [
    { label: 'Giải ngân hồ sơ', path: '/ke-toan/giai-ngan',
      icon: HiOutlineBanknotes, roles: [2], badgeKey: 'pendingCount' },
    ...
  ]
}
```

Item có hỗ trợ badge số đơn chờ (cần wire `pendingCount` từ context hoặc API).

---

## 11. Troubleshooting

### Lỗi 1: HTTP 403 khi gọi `/applications`

**Nguyên nhân:** Trước đây route chỉ cho role 1, 3.

**Fix:** Đã update `applicationRoutes.js` thành `authorizeRoles(1, 2, 3)`. Restart backend.

### Lỗi 2: HTTP 400 "Không thể duyệt đơn ở trạng thái Cho giai ngan"

**Nguyên nhân:** Controller cũ chỉ chấp nhận `Dang xu ly`.

**Fix:** Đã update `disburseApplication` chấp nhận cả `Cho giai ngan` + bypass pheduyet check khi retry. Restart backend.

### Lỗi 3: Drawer hiển thị nhưng bank account null

**Nguyên nhân:**
- API `/bank-accounts/user/:userId` trả 403 (chưa mở quyền role 2) — đã fix
- Hoặc sinh viên thực sự chưa cập nhật TK

**Cách check:** DevTools → Network → xem response endpoint bank-accounts.

### Lỗi 4: Timeline trống mặc dù đơn đã có lịch sử

**Nguyên nhân:** Endpoint `/api/applications/:id/phe-duyet` chưa được tạo.

**Fix tạm:** Code đã `catch` về `[]` nên không crash. Để có timeline đầy đủ, cần tạo endpoint:

```js
// applicationController.js
export const getPheDuyetByRequest = async (req, res) => {
  const { id } = req.params;
  const list = await PheDuyetModel.getPheDuyetByRequestId(id);
  return res.json({ success: true, data: list });
};

// applicationRoutes.js
router.get('/:id/phe-duyet', protect, authorizeRoles(1, 2, 3),
  getPheDuyetByRequest);
```

### Lỗi 5: Search không tìm thấy đơn ở page khác

**Nguyên nhân:** Frontend chỉ filter trong page hiện tại.

**Fix:** Sửa `ApplicationModel.getAllApplications` thêm support `filters.keyword`:

```js
if (filters.keyword) {
  whereConditions.push(`(nd.ho_ten LIKE ? OR nd.ma_so_dinh_danh LIKE ? OR yc.tieu_de LIKE ?)`);
  const kw = `%${filters.keyword}%`;
  queryParams.push(kw, kw, kw);
}
```

### Lỗi 6: Upload file lỗi 413 Payload Too Large

**Nguyên nhân:** Multer config max size thấp hoặc nginx limit.

**Fix:** Check `uploadController.js` config `multer({ limits: { fileSize: 5 * 1024 * 1024 } })`.

### Lỗi 7: File minh chứng tải về 404

**Nguyên nhân:** Path lưu trong DB là relative (`/uploads/xxx.png`) nhưng frontend không prepend backend URL.

**Fix:** Trong Drawer, đã có logic:
```js
const url = f.startsWith('http') ? f : `${BASE_URL}${f.startsWith('/') ? '' : '/'}${f}`;
```

Nhưng `VITE_API_BASE_URL` là `http://localhost:5001/api` — nếu file path là `/uploads/x.png` thì URL sẽ bị sai. Cần dùng `VITE_API_URL` riêng (không có `/api`).

### Lỗi 8: Số dư quỹ sau khi giải ngân không cập nhật trong list

**Nguyên nhân:** Frontend không re-fetch list sau khi disburse.

**Fix:** Đã có `fetchList()` + `fetchCounts()` trong callback `handleGiaiNgan`. Nếu vẫn không cập nhật, kiểm tra cache axios.

---

## 12. Mở rộng

### Thêm export báo cáo giải ngân

Trong tab "Đã xử lý", thêm nút "Xuất Excel" gọi:

```js
GET /api/applications/export?trangThai=Da giai ngan&from=...&to=...
```

Backend dùng `exceljs` (đã cài) để tạo file. Frontend dùng pattern download blob trong `XuatBaoCaoPanel.jsx`.

### Bulk action — Giải ngân hàng loạt

Thêm checkbox column, state `selectedIds`, nút "Giải ngân X đơn được chọn". Backend tạo endpoint `POST /api/applications/bulk-disburse` xử lý transaction nhiều đơn.

Lưu ý: kiểm tra **tổng số tiền các đơn được chọn ≤ số dư quỹ** trước khi giải ngân.

### Print phiếu chi

Thêm nút "In phiếu chi" trong Drawer (chỉ ở đơn `Da giai ngan`). Tạo template `phieu_chi.docx` với placeholder `{ten_sv}`, `{so_tien}`, `{ten_quy}`, `{ngay_chi}`, dùng `docxtemplater` (xem `HUONG_DAN_XUAT_BAO_CAO_WORD.md`).

### Auto-disburse khi quỹ có tiền

Hiện tại, đơn `Cho giai ngan` (thiếu tiền) phải kế toán giải ngân thủ công lại. Có thể tự động:

1. Tạo job định kỳ (5 phút/lần) check `SELECT * FROM yeucauhotro WHERE trang_thai='Cho giai ngan'`
2. Với mỗi đơn, check quỹ có đủ tiền không
3. Nếu đủ → tự động trừ tiền + tạo giao dịch + chuyển sang `Da giai ngan`
4. Gửi notification cho kế toán: "Đã tự động giải ngân X đơn"

Cần thêm `node-cron` ở backend.

### Notification cho sinh viên

Khi đơn được giải ngân hoặc từ chối, gửi email/in-app cho sinh viên. Thêm sau khi disburse/reject success:

```js
await notificationService.sendToUser(application.user_id, {
  title: 'Đơn xin hỗ trợ đã được giải ngân',
  body: `${formatVND(soTien)} đã chuyển vào TK ${bankAccount.so_tai_khoan}`,
  link: `/applications/${id}`,
});
```

### Lịch sử thao tác (audit log)

Lưu mỗi lần kế toán giải ngân/từ chối vào bảng `audit_log`:

```sql
CREATE TABLE audit_log (
  log_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  action VARCHAR(50),         -- 'disburse', 'reject'
  resource_type VARCHAR(50),  -- 'application'
  resource_id INT,
  payload JSON,
  ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## Tips nâng cao

### Hiển thị real-time số dư quỹ

Mỗi 30 giây re-fetch quỹ đang xem để cảnh báo kế toán nếu quỹ bị trừ tiền ở phiên khác:

```js
useEffect(() => {
  if (!selectedDetail?.quy?.id) return;
  const interval = setInterval(async () => {
    const res = await api.get(`/funds/${selectedDetail.quy.id}`);
    setSelectedDetail(prev => ({
      ...prev,
      quy: { ...prev.quy, soDu: res.data.so_du }
    }));
  }, 30000);
  return () => clearInterval(interval);
}, [selectedDetail?.quy?.id]);
```

### Optimistic UI khi disburse

Update state ngay khi click nút, không đợi response:

```js
const handleGiaiNgan = async (data) => {
  // 1. Update UI ngay
  setList(prev => prev.filter(a => a.requestId !== selectedRequest.requestId));
  // 2. Gọi API
  try {
    await api.post(`/applications/${id}/disburse`, payload);
  } catch (err) {
    // 3. Rollback nếu fail
    fetchList();
    toast.error('...');
  }
};
```

### Confirm dialog trước khi từ chối

Thêm bước xác nhận double-check vì hành động không hoàn tác:

```js
if (!window.confirm(`Xác nhận từ chối đơn của ${tenSV}?`)) return;
```

---

## Schema database tham chiếu

| Bảng | Cột quan trọng cho trang này |
|---|---|
| `yeucauhotro` | `request_id`, `user_id`, `quy_id`, `tieu_de`, `mo_ta`, `so_tien_yeu_cau`, `file_dinh_kem`, `trang_thai`, `ly_do_tu_choi`, `ngay_tao`, `ngay_cap_nhat` |
| `nguoidung` | `user_id`, `ho_ten`, `ma_so_dinh_danh`, `email`, `so_dien_thoai`, `khoa_phong`, `avatar` |
| `Quy` | `quy_id`, `ten_quy`, `so_du`, `trang_thai` |
| `pheduyet` | `request_id`, `cap_do_duyet`, `nguoi_duyet_id`, `ket_qua`, `ghi_chu`, `ly_do_tu_choi`, `ngay_duyet` |
| `taikhoannganhang` | `tai_khoan_id`, `user_id`, `so_tai_khoan`, `ten_ngan_hang`, `chu_tai_khoan`, `la_mac_dinh` |
| `giaodich` | `transaction_id`, `quy_id`, `request_id`, `nguoi_tao_id`, `loai`, `so_tien`, `trang_thai`, `minh_chung_chuyen_khoan`, `ngay_giao_dich` |

### Trạng thái quan trọng

**`yeucauhotro.trang_thai`:**
- `Cho duyet` — vừa nộp
- `Dang xu ly` — đã qua cấp 1 (Giáo vụ) hoặc cả cấp 1 + 2 (chờ kế toán)
- `Cho giai ngan` — kế toán đã duyệt cấp 3 nhưng quỹ thiếu tiền
- `Da giai ngan` — đã chuyển tiền cho sinh viên ✓
- `Tu choi` — bị từ chối tại 1 trong 3 cấp

**`giaodich.trang_thai`:**
- `Cho xu ly`, `Thanh cong`, `That bai`, `Hoan tien`

**`giaodich.loai`:** `Thu` | `Chi`

---

> **Status: ✅ ĐÃ TRIỂN KHAI VÀ BUILD THÀNH CÔNG**
>
> Truy cập `/ke-toan/giai-ngan` với tài khoản role Kế toán (role_id = 2) → click "Giải ngân hồ sơ" ở sidebar.
