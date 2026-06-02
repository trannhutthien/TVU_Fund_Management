# Hướng dẫn Implementation: Trang Lịch sử Phê duyệt (Admin)

## 📋 Tổng quan

Trang **Lịch sử Phê duyệt** cho phép Admin tra cứu toàn bộ lịch sử phê duyệt của hệ thống, bao gồm:
- Đơn xin hỗ trợ (yeucauhotro)
- Khoản tài trợ (khoantaitro)

## 🎯 Mục đích

Admin cần biết:
- **Ai** đã duyệt/từ chối/yêu cầu bổ sung
- **Cấp mấy** (Cán bộ cấp 1, Admin cấp 2, Kế toán cấp 3)
- **Khi nào** - ngày giờ cụ thể
- **Ghi chú gì** - lý do từ chối, ghi chú xét duyệt
- **Thông tin người duyệt** - tên, vai trò, avatar, email

## 📊 Database Schema

### Bảng `pheduyet`
```sql
CREATE TABLE pheduyet (
  phe_duyet_id INT PRIMARY KEY AUTO_INCREMENT,
  request_id INT NULL,              -- FK → yeucauhotro
  khoan_tai_tro_id INT NULL,        -- FK → khoantaitro
  nguoi_duyet_id INT NULL,          -- FK → nguoidung
  cap_do_duyet TINYINT NOT NULL,    -- 1, 2, 3
  ket_qua ENUM('Cho duyet', 'Da duyet', 'Tu choi', 'Yeu cau bo sung'),
  ghi_chu TEXT NULL,
  ly_do_tu_choi TEXT NULL,
  ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ngay_duyet TIMESTAMP NULL
);
```

## 🔧 Backend Implementation

### Step 1: Tạo PheDuyetController

File: `backend/controllers/pheDuyetController.js`

```javascript
import pool from "../config/db.js";

// ═══════════════════════════════════════════════════════════════════════════════
// ─── GET /api/pheduyet/stats ───────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export const getPheDuyetStats = async (req, res) => {
  try {
    const [[{ tongBanGhi }]] = await pool.query(
      `SELECT COUNT(*) AS tongBanGhi FROM pheduyet`
    );
    
    const [[{ daDuyet }]] = await pool.query(
      `SELECT COUNT(*) AS daDuyet FROM pheduyet WHERE ket_qua = 'Da duyet'`
    );
    
    const [[{ tuChoi }]] = await pool.query(
      `SELECT COUNT(*) AS tuChoi FROM pheduyet WHERE ket_qua = 'Tu choi'`
    );
    
    const [[{ yeuCauBoSung }]] = await pool.query(
      `SELECT COUNT(*) AS yeuCauBoSung FROM pheduyet WHERE ket_qua = 'Yeu cau bo sung'`
    );

    return res.status(200).json({
      success: true,
      data: {
        tongBanGhi: Number(tongBanGhi) || 0,
        daDuyet: Number(daDuyet) || 0,
        tuChoi: Number(tuChoi) || 0,
        yeuCauBoSung: Number(yeuCauBoSung) || 0,
      }
    });
  } catch (error) {
    console.error("Lỗi getPheDuyetStats:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server"
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── GET /api/pheduyet ─────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export const getAllPheDuyet = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 15,
      keyword = '',
      loai_nguon = '',      // 'yeucau' | 'taitro'
      cap_do_duyet = '',    // '1' | '2' | '3'
      ket_qua = '',         // 'Da duyet' | 'Tu choi' | 'Yeu cau bo sung' | 'Cho duyet'
      nguoi_duyet_id = '',
      tu_ngay = '',
      den_ngay = '',
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Build WHERE conditions
    const conditions = [];
    const params = [];

    // Filter by loai_nguon
    if (loai_nguon === 'yeucau') {
      conditions.push('pd.request_id IS NOT NULL');
    } else if (loai_nguon === 'taitro') {
      conditions.push('pd.khoan_tai_tro_id IS NOT NULL');
    }

    // Filter by cap_do_duyet
    if (cap_do_duyet) {
      conditions.push('pd.cap_do_duyet = ?');
      params.push(parseInt(cap_do_duyet));
    }

    // Filter by ket_qua
    if (ket_qua) {
      conditions.push('pd.ket_qua = ?');
      params.push(ket_qua);
    }

    // Filter by nguoi_duyet_id
    if (nguoi_duyet_id) {
      conditions.push('pd.nguoi_duyet_id = ?');
      params.push(parseInt(nguoi_duyet_id));
    }

    // Filter by date range
    if (tu_ngay) {
      conditions.push('DATE(pd.ngay_duyet) >= ?');
      params.push(tu_ngay);
    }
    if (den_ngay) {
      conditions.push('DATE(pd.ngay_duyet) <= ?');
      params.push(den_ngay);
    }

    // Filter by keyword (search in multiple fields)
    if (keyword) {
      conditions.push(`(
        nd.ho_ten LIKE ? OR
        yc.tieu_de LIKE ? OR
        ntt.ten_nha_tai_tro LIKE ? OR
        sv.ho_ten LIKE ?
      )`);
      const keywordPattern = `%${keyword}%`;
      params.push(keywordPattern, keywordPattern, keywordPattern, keywordPattern);
    }

    const whereClause = conditions.length > 0 
      ? 'WHERE ' + conditions.join(' AND ')
      : '';

    // Count total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM pheduyet pd
      LEFT JOIN nguoidung nd ON nd.user_id = pd.nguoi_duyet_id
      LEFT JOIN yeucauhotro yc ON yc.request_id = pd.request_id
      LEFT JOIN nguoidung sv ON sv.user_id = yc.user_id
      LEFT JOIN khoantaitro ktt ON ktt.khoan_tai_tro_id = pd.khoan_tai_tro_id
      LEFT JOIN nhataitro ntt ON ntt.nha_tai_tro_id = ktt.nha_tai_tro_id
      ${whereClause}
    `;
    const [[{ total }]] = await pool.query(countQuery, params);

    // Get data
    const dataQuery = `
      SELECT 
        pd.*,
        -- Người duyệt
        nd.ho_ten, nd.email, nd.avatar, nd.role_id,
        vt.ten_vai_tro,
        -- Nếu là đơn hỗ trợ
        yc.tieu_de, yc.so_tien_yeu_cau, yc.trang_thai AS trang_thai_don,
        sv.ho_ten AS ten_sinh_vien, sv.ma_so_dinh_danh,
        -- Nếu là khoản tài trợ
        ktt.so_tien AS so_tien_tai_tro, ktt.trang_thai AS trang_thai_ktt,
        ntt.ten_nha_tai_tro,
        -- Quỹ
        q.ten_quy
      FROM pheduyet pd
      LEFT JOIN nguoidung nd ON nd.user_id = pd.nguoi_duyet_id
      LEFT JOIN vaitro vt ON vt.role_id = nd.role_id
      LEFT JOIN yeucauhotro yc ON yc.request_id = pd.request_id
      LEFT JOIN nguoidung sv ON sv.user_id = yc.user_id
      LEFT JOIN khoantaitro ktt ON ktt.khoan_tai_tro_id = pd.khoan_tai_tro_id
      LEFT JOIN nhataitro ntt ON ntt.nha_tai_tro_id = ktt.nha_tai_tro_id
      LEFT JOIN quy q ON q.quy_id = COALESCE(yc.quy_id, ktt.quy_id)
      ${whereClause}
      ORDER BY pd.ngay_tao DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(dataQuery, [...params, limitNum, offset]);

    const totalPages = Math.ceil(total / limitNum);

    return res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalRecords: total,
        limit: limitNum
      }
    });
  } catch (error) {
    console.error("Lỗi getAllPheDuyet:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server"
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── GET /api/pheduyet/approvers ──────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export const getApprovers = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        nd.user_id,
        nd.ho_ten,
        vt.ten_vai_tro
      FROM nguoidung nd
      INNER JOIN vaitro vt ON vt.role_id = nd.role_id
      WHERE nd.role_id IN (1, 2, 3)
      ORDER BY nd.role_id ASC, nd.ho_ten ASC
    `);

    return res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error("Lỗi getApprovers:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server"
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── GET /api/pheduyet/timeline/:type/:id ─────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
// type: 'yeucau' | 'taitro'
// id: request_id | khoan_tai_tro_id
export const getApprovalTimeline = async (req, res) => {
  try {
    const { type, id } = req.params;

    if (!['yeucau', 'taitro'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Type phải là 'yeucau' hoặc 'taitro'"
      });
    }

    const field = type === 'yeucau' ? 'request_id' : 'khoan_tai_tro_id';

    const [rows] = await pool.query(`
      SELECT 
        pd.*,
        nd.ho_ten,
        nd.email,
        nd.avatar,
        nd.role_id,
        vt.ten_vai_tro
      FROM pheduyet pd
      LEFT JOIN nguoidung nd ON nd.user_id = pd.nguoi_duyet_id
      LEFT JOIN vaitro vt ON vt.role_id = nd.role_id
      WHERE pd.${field} = ?
      ORDER BY pd.cap_do_duyet ASC
    `, [id]);

    return res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error("Lỗi getApprovalTimeline:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server"
    });
  }
};

export default {
  getPheDuyetStats,
  getAllPheDuyet,
  getApprovers,
  getApprovalTimeline,
};
```

### Step 2: Tạo Routes

File: `backend/routes/pheDuyetRoutes.js`

```javascript
import express from 'express';
import {
  getPheDuyetStats,
  getAllPheDuyet,
  getApprovers,
  getApprovalTimeline,
} from '../controllers/pheDuyetController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/rolesMiddleware.js';

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════════════════
// ─── PHÊ DUYỆT ROUTES (CHỈ ADMIN) ─────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/pheduyet/stats — Thống kê tổng quan
router.get('/stats', protect, authorizeRoles(1), getPheDuyetStats);

// GET /api/pheduyet/approvers — Danh sách người có quyền duyệt
router.get('/approvers', protect, authorizeRoles(1), getApprovers);

// GET /api/pheduyet/timeline/:type/:id — Chuỗi phê duyệt của 1 đơn/khoản
router.get('/timeline/:type/:id', protect, authorizeRoles(1), getApprovalTimeline);

// GET /api/pheduyet — Danh sách tất cả phê duyệt với filters
router.get('/', protect, authorizeRoles(1), getAllPheDuyet);

export default router;
```

### Step 3: Register Routes trong server.js

File: `backend/server.js`

```javascript
import pheDuyetRoutes from './routes/pheDuyetRoutes.js';

// ... existing code ...

app.use('/api/pheduyet', pheDuyetRoutes);
```

## 🎨 Frontend Implementation

### Cấu trúc thư mục

```
src/pages/Staff/Admin/PheDuyetPage/
├── PheDuyetPage.jsx
├── PheDuyetPage.module.scss
├── sections/
│   ├── PheDuyetStats/
│   │   ├── index.jsx
│   │   └── PheDuyetStats.module.scss
│   ├── PheDuyetFilter/
│   │   ├── index.jsx
│   │   └── PheDuyetFilter.module.scss
│   ├── PheDuyetTable/
│   │   ├── index.jsx
│   │   └── PheDuyetTable.module.scss
│   └── PheDuyetDetailDrawer/
│       ├── index.jsx
│       ├── PheDuyetDetailDrawer.module.scss
│       └── ApprovalTimeline/
│           ├── index.jsx
│           └── ApprovalTimeline.module.scss
```

### Component Breakdown

#### 1. PheDuyetPage.jsx (Main Container)

**State Management:**
```javascript
const [stats, setStats] = useState(null);
const [data, setData] = useState([]);
const [loading, setLoading] = useState(false);
const [page, setPage] = useState(1);
const [total, setTotal] = useState(0);
const [filters, setFilters] = useState({
  keyword: '',
  loai_nguon: '',
  cap_do_duyet: '',
  ket_qua: '',
  nguoi_duyet_id: '',
  tu_ngay: '',
  den_ngay: '',
});
const [selectedRecord, setSelectedRecord] = useState(null);
const [approverOptions, setApproverOptions] = useState([]);
```

**API Calls:**
```javascript
// Fetch stats
const fetchStats = async () => {
  const res = await api.get('/pheduyet/stats');
  setStats(res.data.data);
};

// Fetch approvers for filter dropdown
const fetchApprovers = async () => {
  const res = await api.get('/pheduyet/approvers');
  setApproverOptions(res.data.data.map(a => ({
    value: a.user_id,
    label: `${a.ho_ten} — ${a.ten_vai_tro}`
  })));
};

// Fetch data with filters
const fetchData = async () => {
  setLoading(true);
  try {
    const res = await api.get('/pheduyet', {
      params: { ...filters, page, limit: 15 }
    });
    setData(res.data.data);
    setTotal(res.data.pagination.totalRecords);
  } finally {
    setLoading(false);
  }
};
```

**Layout:**
```jsx
<div className={styles.page}>
  {/* Breadcrumb */}
  <div className={styles.breadcrumb}>
    Trang chủ / Lịch sử phê duyệt
  </div>

  {/* Page Header */}
  <div className={styles.pageHeader}>
    <div>
      <h1>Lịch sử phê duyệt</h1>
      <p>Tra cứu toàn bộ chuỗi xét duyệt của hệ thống</p>
    </div>
    <div className={styles.badge}>{total} bản ghi</div>
  </div>

  {/* Stats Cards */}
  <PheDuyetStats stats={stats} loading={loading} />

  {/* Filters */}
  <PheDuyetFilter 
    filters={filters}
    approverOptions={approverOptions}
    onChange={setFilters}
  />

  {/* Table */}
  <PheDuyetTable 
    data={data}
    loading={loading}
    onViewDetail={setSelectedRecord}
  />

  {/* Pagination */}
  <Pagination 
    currentPage={page}
    totalPages={Math.ceil(total / 15)}
    onPageChange={setPage}
  />

  {/* Detail Drawer */}
  {selectedRecord && (
    <PheDuyetDetailDrawer 
      record={selectedRecord}
      onClose={() => setSelectedRecord(null)}
    />
  )}
</div>
```

#### 2. PheDuyetStats (4 Stats Cards)

```jsx
const STATS = [
  { 
    label: 'Tổng lượt phê duyệt', 
    value: stats?.tongBanGhi,
    icon: HiOutlineClipboardDocumentCheck,
    color: 'var(--color-primary)',
    bg: 'rgba(26,47,94,0.08)'
  },
  { 
    label: 'Đã duyệt', 
    value: stats?.daDuyet,
    icon: HiOutlineCheckBadge,
    color: '#10b981',
    bg: 'rgba(16,185,129,0.08)'
  },
  { 
    label: 'Từ chối', 
    value: stats?.tuChoi,
    icon: HiOutlineXCircle,
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.08)',
    urgent: true
  },
  { 
    label: 'Yêu cầu bổ sung', 
    value: stats?.yeuCauBoSung,
    icon: HiOutlineExclamationCircle,
    color: 'var(--color-gold)',
    bg: 'rgba(240,165,0,0.08)'
  },
];
```

#### 3. PheDuyetFilter (Multi-dimension Filters)

**Filter Fields:**
- Keyword search (Input)
- Loại nguồn (Select: Tất cả / Đơn yêu cầu / Khoản tài trợ)
- Cấp độ duyệt (Select: Tất cả / Cấp 1 / Cấp 2 / Cấp 3)
- Kết quả (Select: Tất cả / Đã duyệt / Từ chối / Yêu cầu bổ sung / Chờ duyệt)
- Người duyệt (Select from approverOptions)
- Từ ngày / Đến ngày (Date inputs)
- Clear filters button

#### 4. PheDuyetTable (Data Table)

**Columns:**
1. Người duyệt (Avatar + Name + Role badge)
2. Loại nguồn (Badge: Đơn hỗ trợ / Khoản tài trợ)
3. Tên đơn / Khoản (Title + subtitle)
4. Cấp duyệt (Badge with level + description)
5. Kết quả (StatusBadge)
6. Ngày duyệt (Date + time)
7. Thao tác (View detail button)

**Row Styling:**
- Từ chối: light red background
- Yêu cầu bổ sung: light yellow background

#### 5. PheDuyetDetailDrawer + ApprovalTimeline

**Drawer Structure:**
- Header (Title + Close button)
- Summary section (Đơn/Khoản info)
- ApprovalTimeline component

**Timeline Features:**
- Vertical timeline with dots and connecting lines
- Each approval step shows:
  - Dot (colored by status)
  - Card with:
    - Level badge + Status badge
    - Date/time
    - Approver info (avatar, name, role, email)
    - Notes (if any)
    - Rejection reason (if rejected)
- Pending steps shown with dashed border
- Completed steps have green connecting line

## 🎨 Color Scheme

```scss
// Status Colors
$approved: #10b981;
$rejected: #ef4444;
$pending: #94a3b8;
$processing: #f59e0b;

// Level Colors
$level1: var(--color-primary);  // Navy
$level2: #7c3aed;               // Purple
$level3: #0891b2;               // Cyan

// Role Colors
$admin: #9333ea;
$giaovu: var(--color-primary);
$ketoan: #b45309;
```

## 📝 Implementation Checklist

### Backend
- [ ] Create `pheDuyetController.js`
- [ ] Create `pheDuyetRoutes.js`
- [ ] Register routes in `server.js`
- [ ] Test all API endpoints with Postman

### Frontend
- [ ] Create folder structure
- [ ] Implement `PheDuyetPage.jsx`
- [ ] Implement `PheDuyetStats`
- [ ] Implement `PheDuyetFilter`
- [ ] Implement `PheDuyetTable`
- [ ] Implement `PheDuyetDetailDrawer`
- [ ] Implement `ApprovalTimeline`
- [ ] Add route to `App.jsx`
- [ ] Add menu item to Admin sidebar
- [ ] Test all features

## 🧪 Testing Scenarios

1. **Stats Display**: Verify all 4 stats cards show correct numbers
2. **Filters**: Test each filter individually and in combination
3. **Keyword Search**: Search by approver name, application title, donor name
4. **Date Range**: Filter by date range
5. **Pagination**: Navigate through pages
6. **Detail View**: Click to view full approval timeline
7. **Timeline**: Verify timeline shows all approval steps correctly
8. **Empty States**: Test with no data
9. **Loading States**: Verify skeleton loaders work
10. **Responsive**: Test on different screen sizes

## 🚀 Next Steps

1. Implement backend API first
2. Test API with Postman
3. Implement frontend components one by one
4. Test each component individually
5. Integration testing
6. UI/UX refinement

---

**Status**: 📝 Documentation Complete - Ready for Implementation
**Priority**: Medium
**Estimated Time**: 8-10 hours
**Dependencies**: None (all required APIs and models exist)
