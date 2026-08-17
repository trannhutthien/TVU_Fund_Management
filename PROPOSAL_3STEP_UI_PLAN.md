# KẾ HOẠCH IMPLEMENT UI - LUỒNG DUYỆT ĐỀ XUẤT 3 CẤP

## 📊 TỔNG QUAN

Luồng đề xuất chương trình mới (proposal) khác với khoản tài trợ trực tiếp (direct donation):
- **Khoản tài trợ trực tiếp**: Kế toán → Admin (2 bước)
- **Đề xuất chương trình**: Cán bộ → Kế toán → Admin (3 bước)

## 🗂️ CẤU TRÚC DATABASE & API

### Bảng: `dexuatchuongtrinh`

#### Cột hiện có (cũ):
```sql
- dexuatchuongtrinh_id
- quythanhphan_id        -- Quỹ thành phần (cấp 2)
- khoantaitro_id         -- NULL nếu chưa có khoản tài trợ
- nhataitro_id           -- NULL nếu guest
- tenchuongtrinh
- mota
- soluongsuat
- sotienmoisuat
- loaihotro
- ngaybatdau
- ngayketthuc
- trangthai              -- ENUM đã cập nhật (xem bên dưới)
- lydotuchoi
- nguoiduyet_id          -- (Cũ - giữ để backward compat)
- ngayduyet              -- (Cũ - giữ để backward compat)
- quyketqua_id           -- ID quỹ cấp 3 (hoạt động) sau khi tạo
- ngaytao
```

#### Cột mới (3-step workflow):
```sql
-- BƯỚC 1: Cán bộ duyệt
- canbo_duyet_id         -- ID cán bộ duyệt
- ngay_canbo_duyet       -- Ngày cán bộ duyệt
- ghi_chu_canbo          -- Ghi chú cán bộ

-- BƯỚC 2: Kế toán xác nhận
- ketoan_xacnhan_id      -- ID kế toán xác nhận
- ngay_ketoan_xacnhan    -- Ngày kế toán xác nhận
- so_tien_thuc_te        -- Số tiền thực tế nhận được

-- BƯỚC 3: Admin tạo hoạt động
- admin_duyet_id         -- ID admin duyệt
- ngay_admin_duyet       -- Ngày admin duyệt
- ghi_chu_admin          -- Ghi chú admin
```

#### ENUM `trangthai` (đã cập nhật):
```sql
ENUM(
  'Cho duyet',          -- Trạng thái ban đầu
  'Can bo da duyet',    -- ✨ MỚI - Sau bước 1
  'Da nhan tien',       -- ✨ MỚI - Sau bước 2
  'Da tao hoat dong',   -- ✨ MỚI - Sau bước 3
  'Da duyet',           -- Cũ (backward compat)
  'Tu choi'             -- Từ chối
)
```

### API Endpoints (đã implement):

#### 1. Lấy danh sách đề xuất:
```javascript
GET /api/donations/propose-program
Query params: {
  quy_thanh_phan_id?: number,
  trang_thai?: string,
  keyword?: string,
  page?: number,
  page_size?: number
}
Response: {
  success: true,
  data: [{
    dexuatchuongtrinh_id,
    quythanhphan_id,
    ten_quy_thanh_phan,
    tenchuongtrinh,
    mota,
    soluongsuat,
    sotienmoisuat,
    loaihotro,
    ngaybatdau,
    ngayketthuc,
    trangthai,
    nguoi_duyet_ten,
    ten_quy_ket_qua,
    so_tien_tai_tro,
    ngaytao,
    // NEW FIELDS:
    canbo_duyet_id,
    ngay_canbo_duyet,
    ghi_chu_canbo,
    ketoan_xacnhan_id,
    ngay_ketoan_xacnhan,
    so_tien_thuc_te,
    admin_duyet_id,
    ngay_admin_duyet,
    ghi_chu_admin
  }],
  pagination: { total, page, page_size }
}
```

#### 2. Lấy chi tiết đề xuất:
```javascript
GET /api/donations/propose-program/:id
Response: {
  success: true,
  data: { ...same fields as list + tenant_details }
}
```

#### 3. Lấy timeline (trạng thái từng bước):
```javascript
GET /api/donations/propose-program/:id/status
Response: {
  success: true,
  data: {
    proposalId,
    currentStatus: 'Can bo da duyet',
    timeline: [
      {
        step: 1,
        title: 'Cán bộ duyệt',
        status: 'completed',
        date: '2024-01-15T10:30:00',
        user: 'Nguyễn Văn A',
        note: 'Đã kiểm tra và phê duyệt'
      },
      {
        step: 2,
        title: 'Chờ kế toán xác nhận tiền',
        status: 'pending',
        date: null,
        user: null,
        note: null
      },
      ...
    ],
    proposal: { ...full proposal data }
  }
}
```

#### 4. BƯỚC 1 - Cán bộ duyệt:
```javascript
POST /api/donations/propose-program/:id/approve-by-canbo
Headers: { Authorization: 'Bearer <token>' }
Body: {
  ghiChu?: string,
  quyThanhPhanId?: number  // Sửa quỹ nếu nhà tài trợ chọn sai
}
Role: 3 (Cán bộ)
```

#### 5. BƯỚC 1 - Cán bộ từ chối:
```javascript
POST /api/donations/propose-program/:id/reject-by-canbo
Body: {
  lyDoTuChoi: string (required),
  ghiChu?: string
}
Role: 3 (Cán bộ)
```

#### 6. BƯỚC 2 - Kế toán xác nhận tiền:
```javascript
POST /api/donations/propose-program/:id/confirm-money
Body: {
  soTienThucTe?: number  // Số tiền thực tế (nếu khác đề xuất)
}
Role: 2 (Kế toán)
```

#### 7. BƯỚC 3 - Admin tạo hoạt động:
```javascript
POST /api/donations/propose-program/:id/create-activity
Body: {
  ghiChu?: string
}
Role: 1 (Admin)
```

---

## 🎨 UI COMPONENTS CẦN TẠO

### 1. **ProposalListPage** (Danh sách đề xuất)

**Path**: `frontend/src/pages/Staff/CanBo/ProposalListPage/`

**Vai trò truy cập**: Cán bộ (3), Kế toán (2), Admin (1)

**Components**:
```
ProposalListPage/
├── ProposalListPage.jsx
├── ProposalListPage.module.scss
├── ProposalStats/
│   ├── ProposalStats.jsx
│   └── ProposalStats.module.scss
├── ProposalFilter/
│   ├── ProposalFilter.jsx
│   └── ProposalFilter.module.scss
├── ProposalTable/
│   ├── ProposalTable.jsx
│   └── ProposalTable.module.scss
└── ProposalDetailDrawer/
    ├── ProposalDetailDrawer.jsx
    └── ProposalDetailDrawer.module.scss
```

**Tabs theo vai trò**:
- **Cán bộ**: "Chờ duyệt" (Cho duyet), "Tất cả"
- **Kế toán**: "Chờ xác nhận" (Can bo da duyet), "Tất cả"
- **Admin**: "Chờ tạo hoạt động" (Da nhan tien), "Tất cả"

**Stats**:
```javascript
{
  choDuyet: number,        // Tổng chờ cán bộ duyệt
  canBoPheDuyet: number,   // Tổng cán bộ đã duyệt (chờ kế toán)
  daNhanTien: number,      // Tổng đã nhận tiền (chờ admin)
  daTaoHoatDong: number,   // Tổng đã tạo hoạt động
  tuChoi: number           // Tổng bị từ chối
}
```

**Table columns**:
```javascript
[
  { key: 'id', label: 'Mã ĐX' },
  { key: 'tenchuongtrinh', label: 'Tên chương trình' },
  { key: 'ten_quy_thanh_phan', label: 'Quỹ thành phần' },
  { key: 'so_tien', label: 'Số tiền' },        // soluongsuat * sotienmoisuat
  { key: 'trangthai', label: 'Trạng thái' },
  { key: 'ngaytao', label: 'Ngày tạo' },
  { key: 'actions', label: '' }
]
```

**Actions theo vai trò và trạng thái**:
```javascript
// Cán bộ + trangthai = 'Cho duyet':
- "Duyệt" button → Open ApproveModal
- "Từ chối" button → Open RejectModal

// Kế toán + trangthai = 'Can bo da duyet':
- "Xác nhận tiền" button → Open ConfirmMoneyModal

// Admin + trangthai = 'Da nhan tien':
- "Tạo hoạt động" button → Open CreateActivityModal
```

---

### 2. **ApproveByCanBoModal** (Cán bộ duyệt)

**Path**: `frontend/src/pages/Staff/CanBo/ProposalListPage/ApproveByCanBoModal/`

**Inputs**:
```javascript
{
  ghiChu: string (textarea, optional),
  quyThanhPhanId: select (optional, danh sách quỹ cấp 2)
}
```

**Logic**:
- Hiển thị thông tin đề xuất (tên, số tiền, mô tả)
- Hiển thị quỹ hiện tại mà nhà tài trợ chọn
- Cho phép cán bộ sửa quỹ nếu sai (dropdown chọn quỹ cấp 2)
- Textarea ghi chú (optional)
- Buttons: "Xác nhận duyệt", "Hủy"

**API Call**:
```javascript
POST /api/donations/propose-program/:id/approve-by-canbo
Body: { ghiChu?, quyThanhPhanId? }
```

---

### 3. **RejectByCanBoModal** (Cán bộ từ chối)

**Path**: `frontend/src/pages/Staff/CanBo/ProposalListPage/RejectByCanBoModal/`

**Inputs**:
```javascript
{
  lyDoTuChoi: string (textarea, required),
  ghiChu: string (textarea, optional)
}
```

**Validation**:
- `lyDoTuChoi` không được để trống

**API Call**:
```javascript
POST /api/donations/propose-program/:id/reject-by-canbo
Body: { lyDoTuChoi, ghiChu? }
```

---

### 4. **ConfirmMoneyModal** (Kế toán xác nhận tiền)

**Path**: `frontend/src/pages/Staff/KeToan/ProposalListPage/ConfirmMoneyModal/`

**Inputs**:
```javascript
{
  soTienThucTe: number (optional)
}
```

**Logic**:
- Hiển thị số tiền đề xuất: `soluongsuat * sotienmoisuat`
- Input số tiền thực tế (nếu khác với đề xuất)
- Nếu không nhập → dùng số tiền đề xuất
- Hiển thị cảnh báo nếu số tiền khác với đề xuất
- Buttons: "Xác nhận đã nhận tiền", "Hủy"

**API Call**:
```javascript
POST /api/donations/propose-program/:id/confirm-money
Body: { soTienThucTe? }
```

**Note**: API sẽ tự động CỘNG tiền vào Quỹ Thành Phần (cấp 2)

---

### 5. **CreateActivityModal** (Admin tạo hoạt động)

**Path**: `frontend/src/pages/Staff/Admin/ProposalListPage/CreateActivityModal/`

**Inputs**:
```javascript
{
  ghiChu: string (textarea, optional)
}
```

**Logic**:
- Hiển thị thông tin quỹ thành phần (cấp 2):
  - Tên quỹ
  - Số dư hiện tại
  - Số tiền sẽ trích ra
- Hiển thị thông tin hoạt động sẽ tạo:
  - Tên chương trình
  - Số tiền
  - Số lượng suất
  - Loại hỗ trợ
- Textarea ghi chú (optional)
- **Validation**: Kiểm tra số dư quỹ thành phần >= số tiền cần trích
- Buttons: "Tạo hoạt động", "Hủy"

**API Call**:
```javascript
POST /api/donations/propose-program/:id/create-activity
Body: { ghiChu? }
```

**Note**: API sẽ tự động:
1. TRỪ tiền từ Quỹ Thành Phần (cấp 2)
2. TẠO quỹ mới (cấp 3)
3. CỘNG tiền vào quỹ mới
4. TẠO bản ghi phân bổ ngân sách

---

### 6. **ProposalTimelineComponent** (Timeline hiển thị tiến trình)

**Path**: `frontend/src/components/proposal/ProposalTimeline/`

**Usage**: Dùng trong ProposalDetailDrawer

**Props**:
```javascript
{
  proposalId: number,
  currentStatus: string,
  onRefresh?: () => void
}
```

**Logic**:
- Gọi API `/api/donations/propose-program/:id/status`
- Hiển thị timeline 3 bước với:
  - Icon trạng thái (✓ completed, ⏱ pending, ✗ rejected)
  - Tiêu đề bước
  - Người thực hiện (nếu có)
  - Ngày thực hiện (nếu có)
  - Ghi chú (nếu có)
- Highlight bước hiện tại
- Responsive design

**UI Example**:
```
┌─────────────────────────────────────────────────────────┐
│  ✓ Bước 1: Cán bộ duyệt                                 │
│    Người duyệt: Nguyễn Văn A                            │
│    Ngày: 15/01/2024 10:30                               │
│    Ghi chú: Đã kiểm tra, thông tin hợp lệ              │
├─────────────────────────────────────────────────────────┤
│  ⏱ Bước 2: Chờ kế toán xác nhận tiền                   │
│    (Đang chờ xử lý)                                     │
├─────────────────────────────────────────────────────────┤
│  ⏳ Bước 3: Chờ admin tạo hoạt động                     │
│    (Chưa đến bước này)                                  │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 FILE STRUCTURE TỔNG HỢP

```
frontend/src/
├── pages/
│   └── Staff/
│       ├── CanBo/
│       │   └── ProposalListPage/          ← MỚI
│       │       ├── ProposalListPage.jsx
│       │       ├── ProposalListPage.module.scss
│       │       ├── ProposalStats/
│       │       ├── ProposalFilter/
│       │       ├── ProposalTable/
│       │       ├── ProposalDetailDrawer/
│       │       ├── ApproveByCanBoModal/   ← MỚI
│       │       └── RejectByCanBoModal/    ← MỚI
│       │
│       ├── KeToan/
│       │   ├── KhoanTaiTroPage/           ← Giữ nguyên
│       │   └── ProposalListPage/          ← MỚI (hoặc share với CanBo)
│       │       └── ConfirmMoneyModal/     ← MỚI
│       │
│       └── Admin/
│           └── ProposalListPage/          ← MỚI (hoặc share với CanBo)
│               └── CreateActivityModal/   ← MỚI
│
├── components/
│   └── proposal/                          ← MỚI
│       ├── ProposalTimeline/              ← MỚI
│       │   ├── ProposalTimeline.jsx
│       │   └── ProposalTimeline.module.scss
│       └── ProposalStatusBadge/           ← MỚI
│           ├── ProposalStatusBadge.jsx
│           └── ProposalStatusBadge.module.scss
│
└── services/
    └── proposalService.js                 ← MỚI
```

---

## 🔄 SERVICE LAYER

**File**: `frontend/src/services/proposalService.js`

```javascript
import api from './api';

// List proposals
export const getProposals = async (params) => {
  const res = await api.get('/api/donations/propose-program', { params });
  return res.data;
};

// Get proposal detail
export const getProposalById = async (id) => {
  const res = await api.get(`/api/donations/propose-program/${id}`);
  return res.data;
};

// Get proposal status timeline
export const getProposalStatus = async (id) => {
  const res = await api.get(`/api/donations/propose-program/${id}/status`);
  return res.data;
};

// STEP 1: Approve by Can Bo
export const approveByCanBo = async (id, data) => {
  const res = await api.post(`/api/donations/propose-program/${id}/approve-by-canbo`, data);
  return res.data;
};

// STEP 1: Reject by Can Bo
export const rejectByCanBo = async (id, data) => {
  const res = await api.post(`/api/donations/propose-program/${id}/reject-by-canbo`, data);
  return res.data;
};

// STEP 2: Confirm money by Ke Toan
export const confirmMoneyByKeToan = async (id, data) => {
  const res = await api.post(`/api/donations/propose-program/${id}/confirm-money`, data);
  return res.data;
};

// STEP 3: Create activity by Admin
export const createActivityByAdmin = async (id, data) => {
  const res = await api.post(`/api/donations/propose-program/${id}/create-activity`, data);
  return res.data;
};

// Get stats
export const getProposalStats = async () => {
  const res = await api.get('/api/donations/propose-program/stats');
  return res.data;
};
```

---

## 🎯 THỨ TỰ IMPLEMENT

### Phase 1: Foundation (1-2 giờ)
1. ✅ Tạo `proposalService.js`
2. ✅ Tạo `ProposalStatusBadge` component
3. ✅ Tạo `ProposalTimeline` component

### Phase 2: Main Page (2-3 giờ)
4. ✅ Tạo `ProposalListPage` structure
5. ✅ Tạo `ProposalStats` component
6. ✅ Tạo `ProposalFilter` component
7. ✅ Tạo `ProposalTable` component
8. ✅ Tạo `ProposalDetailDrawer` component

### Phase 3: Action Modals (2-3 giờ)
9. ✅ Tạo `ApproveByCanBoModal`
10. ✅ Tạo `RejectByCanBoModal`
11. ✅ Tạo `ConfirmMoneyModal`
12. ✅ Tạo `CreateActivityModal`

### Phase 4: Integration & Testing (1-2 giờ)
13. ✅ Add routes
14. ✅ Add navigation menu
15. ✅ Test từng vai trò (Cán bộ, Kế toán, Admin)
16. ✅ Test end-to-end workflow

---

## ⚠️ LƯU Ý QUAN TRỌNG

### 1. Phân quyền (Authorization):
```javascript
// Cán bộ (vaitro_id = 3): Chỉ thấy tab "Chờ duyệt" + action Duyệt/Từ chối
// Kế toán (vaitro_id = 2): Chỉ thấy tab "Chờ xác nhận" + action Xác nhận tiền
// Admin (vaitro_id = 1): Chỉ thấy tab "Chờ tạo hoạt động" + action Tạo hoạt động
```

### 2. Validation Client-side:
- Số tiền phải > 0
- Lý do từ chối không được rỗng
- Quỹ thành phần phải có đủ số dư (khi admin tạo hoạt động)

### 3. Error Handling:
- Hiển thị lỗi từ API (toast notification)
- Hiển thị loading state khi gọi API
- Disable buttons khi đang xử lý

### 4. Refresh Data:
- Sau mỗi action thành công → refresh danh sách + stats
- Đóng modal sau khi thành công

### 5. Responsive Design:
- Mobile-first approach
- Table responsive (horizontal scroll on mobile)
- Modal full-screen on mobile

---

## 🧪 TEST CASES

### Test Case 1: Luồng hoàn chỉnh
1. Cán bộ login → Thấy đề xuất "Cho duyet"
2. Cán bộ duyệt → Trạng thái chuyển "Can bo da duyet"
3. Kế toán login → Thấy đề xuất "Can bo da duyet"
4. Kế toán xác nhận tiền → Trạng thái chuyển "Da nhan tien" + tiền cộng vào quỹ cấp 2
5. Admin login → Thấy đề xuất "Da nhan tien"
6. Admin tạo hoạt động → Trạng thái chuyển "Da tao hoat dong" + quỹ cấp 3 được tạo

### Test Case 2: Từ chối
1. Cán bộ login → Thấy đề xuất "Cho duyet"
2. Cán bộ từ chối (với lý do) → Trạng thái chuyển "Tu choi"
3. Đề xuất không xuất hiện trong tab "Chờ duyệt" nữa

### Test Case 3: Sửa quỹ thành phần
1. Nhà tài trợ chọn sai quỹ khi tạo đề xuất
2. Cán bộ duyệt + sửa quỹ thành phần → Quỹ được cập nhật
3. Kế toán xác nhận → Tiền cộng vào quỹ đúng (đã sửa)

### Test Case 4: Số tiền thực tế khác đề xuất
1. Đề xuất: 100,000,000 đ
2. Kế toán nhập số tiền thực tế: 95,000,000 đ
3. Hệ thống lưu cả hai giá trị
4. Admin tạo hoạt động → Dùng số tiền thực tế (95M)

---

## 📊 MAPPING DỮ LIỆU

### Frontend → Backend Field Mapping:

| Frontend Field | Backend Column | Type | Note |
|---|---|---|---|
| `id` | `dexuatchuongtrinh_id` | number | ID đề xuất |
| `tenChuongTrinh` | `tenchuongtrinh` | string | Tên chương trình |
| `moTa` | `mota` | string | Mô tả |
| `soLuongSuat` | `soluongsuat` | number | Số lượng suất |
| `soTienMoiSuat` | `sotienmoisuat` | number | Số tiền mỗi suất |
| `tongSoTien` | `soluongsuat * sotienmoisuat` | number | Tính toán |
| `loaiHoTro` | `loaihotro` | string | Loại hỗ trợ |
| `ngayBatDau` | `ngaybatdau` | date | Ngày bắt đầu |
| `ngayKetThuc` | `ngayketthuc` | date | Ngày kết thúc |
| `trangThai` | `trangthai` | enum | Trạng thái |
| `lyDoTuChoi` | `lydotuchoi` | string | Lý do từ chối |
| `quyThanhPhanId` | `quythanhphan_id` | number | ID quỹ thành phần |
| `tenQuyThanhPhan` | `ten_quy_thanh_phan` | string | Tên quỹ thành phần |
| `quyKetQuaId` | `quyketqua_id` | number | ID quỹ kết quả (cấp 3) |
| `tenQuyKetQua` | `ten_quy_ket_qua` | string | Tên quỹ kết quả |
| `canBoDuyetId` | `canbo_duyet_id` | number | ID cán bộ duyệt |
| `ngayCanBoDuyet` | `ngay_canbo_duyet` | datetime | Ngày cán bộ duyệt |
| `ghiChuCanBo` | `ghi_chu_canbo` | string | Ghi chú cán bộ |
| `keToanXacNhanId` | `ketoan_xacnhan_id` | number | ID kế toán |
| `ngayKeToanXacNhan` | `ngay_ketoan_xacnhan` | datetime | Ngày kế toán xác nhận |
| `soTienThucTe` | `so_tien_thuc_te` | decimal | Số tiền thực tế |
| `adminDuyetId` | `admin_duyet_id` | number | ID admin |
| `ngayAdminDuyet` | `ngay_admin_duyet` | datetime | Ngày admin duyệt |
| `ghiChuAdmin` | `ghi_chu_admin` | string | Ghi chú admin |
| `ngayTao` | `ngaytao` | timestamp | Ngày tạo |

---

## ✅ CHECKLIST HOÀN THÀNH

### Backend:
- [x] Migration schema
- [x] Model functions
- [x] Controller endpoints
- [x] Routes
- [x] Documentation

### Frontend Phase 1: Foundation
- [ ] proposalService.js
- [ ] ProposalStatusBadge component
- [ ] ProposalTimeline component

### Frontend Phase 2: Main Page
- [ ] ProposalListPage structure
- [ ] ProposalStats component
- [ ] ProposalFilter component
- [ ] ProposalTable component
- [ ] ProposalDetailDrawer component

### Frontend Phase 3: Action Modals
- [ ] ApproveByCanBoModal
- [ ] RejectByCanBoModal
- [ ] ConfirmMoneyModal
- [ ] CreateActivityModal

### Frontend Phase 4: Integration
- [ ] Add routes
- [ ] Add navigation menu
- [ ] Test với từng vai trò
- [ ] Test end-to-end workflow

---

## 🚀 SẴN SÀNG BẮT ĐẦU!

Kế hoạch đã sẵn sàng. Bạn có muốn bắt đầu implement từ Phase 1 không?
