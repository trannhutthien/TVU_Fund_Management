# Design Document: Categorized Fund Display

## 1. Overview

This document provides the technical design for implementing categorized fund display on the FundsPage. The feature organizes funds into groups (Fund_Groups) based on the `nhom` field from the `loaiquy` table, displaying maximum 6 fund cards per group with independent pagination for each group.

**Reference Implementation:** NewsPage (`frontend/src/pages/Public/NewsPage/NewsPage.jsx`) uses a similar pattern for category-based display with independent pagination.

## 2. Architecture

### 2.1 System Components

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
├─────────────────────────────────────────────────────────────┤
│  FundsPage                                                   │
│    ├── FundTitleSection (unchanged)                         │
│    ├── FundSelectSection (modified: hide Loại quỹ filter)  │
│    └── FundCategorySection (NEW)                            │
│          ├── CategoryHeader                                  │
│          ├── FundGrid (6 cards per page)                    │
│          └── CategoryPagination                             │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ HTTP GET
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend API                             │
├─────────────────────────────────────────────────────────────┤
│  GET /api/funds/count-by-group                              │
│    → Returns: { "Hoc bong": 15, "Y te": 8, ... }           │
│                                                              │
│  GET /api/funds/public?nhom=X&page=Y&limit=Z               │
│    → Returns: { funds: [...], total: N, page: Y }          │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ SQL Query
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                       Database                               │
├─────────────────────────────────────────────────────────────┤
│  Table: loaiquy                                              │
│    - loaiquy_id                                              │
│    - maloai                                                  │
│    - tenloai                                                 │
│    - nhom (VARCHAR(100), NEW)                               │
│                                                              │
│  Table: quy                                                  │
│    - quy_id                                                  │
│    - tenquy                                                  │
│    - loaiquy_id (FK → loaiquy.loaiquy_id)                  │
│    - trangthai                                               │
│    - ...                                                     │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

**Initial Page Load:**
```
1. User visits /funds
2. FundsPage calls GET /api/funds/count-by-group
   → Returns: { "Hoc bong": 15, "Y te": 8, "Khan cap": 3 }
3. For each group with count > 0:
   FundsPage calls GET /api/funds/public?nhom=X&page=1&limit=6
4. Render category sections vertically with 6 cards each
```

**Pagination Interaction:**
```
1. User clicks "Tiếp" on "Hoc bong" category
2. FundsPage calls GET /api/funds/public?nhom=Hoc bong&page=2&limit=6
3. Update only "Hoc bong" section data
4. Scroll "Hoc bong" section header into view
```

**Filter Interaction:**
```
1. User changes Cấp độ filter to "2"
2. Reset all page states to 1
3. Call GET /api/funds/count-by-group?capDo=2
4. For each group with count > 0:
   Call GET /api/funds/public?nhom=X&capDo=2&page=1&limit=6
5. Re-render all category sections
```

## 3. Database Schema Changes

### 3.1 Migration: Add `nhom` Column to `loaiquy`

**File:** `backend/database/migrations/add_nhom_to_loaiquy.mjs`

```javascript
import pool from '../../config/db.js';

async function addNhomColumnToLoaiQuy() {
  const connection = await pool.getConnection();
  try {
    console.log('🔄 Checking if nhom column exists in loaiquy table...');
    
    // Check if column already exists
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'loaiquy'
        AND COLUMN_NAME = 'nhom'
    `);
    
    if (columns.length > 0) {
      console.log('✅ Column nhom already exists in loaiquy table');
      return;
    }
    
    // Add column
    console.log('➕ Adding nhom column to loaiquy table...');
    await connection.execute(`
      ALTER TABLE loaiquy 
      ADD COLUMN nhom VARCHAR(100) NULL 
      COMMENT 'Nhóm phân loại quỹ (Học bổng, Y tế, Khẩn cấp, ...)'
      AFTER tenloai
    `);
    
    console.log('✅ Successfully added nhom column to loaiquy table');
    
    // Optional: Set default values for existing records
    console.log('🔄 Setting default nhom values for existing loaiquy records...');
    await connection.execute(`
      UPDATE loaiquy 
      SET nhom = 'Khac' 
      WHERE nhom IS NULL
    `);
    
    console.log('✅ Migration completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

// Run migration
addNhomColumnToLoaiQuy()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
```

**Execution:**
```bash
node backend/database/migrations/add_nhom_to_loaiquy.mjs
```

### 3.2 Schema After Migration

```sql
Table: loaiquy
+--------------+--------------+------+-----+
| Field        | Type         | Null | Key |
+--------------+--------------+------+-----+
| loaiquy_id   | INT          | NO   | PRI |
| maloai       | VARCHAR(50)  | NO   | UNI |
| tenloai      | VARCHAR(100) | NO   |     |
| nhom         | VARCHAR(100) | YES  |     | ← NEW
| ngaytao      | TIMESTAMP    | NO   |     |
+--------------+--------------+------+-----+
```

## 4. Backend Implementation

### 4.1 New API Endpoint: Count Funds by Group

**File:** `backend/controllers/funds/fundController.js`

**Function:** `getFundCountByGroup`

```javascript
export const getFundCountByGroup = async (req, res) => {
  try {
    const { capDo, trangThai } = req.query;
    
    // Build WHERE clause for filters
    let whereConditions = ["q.trangthai IN ('Dang hoat dong', 'Tam dung')"];
    const params = [];
    
    if (capDo) {
      whereConditions.push('q.capdo = ?');
      params.push(parseInt(capDo));
    }
    
    if (trangThai) {
      whereConditions.push('q.trangthai = ?');
      params.push(trangThai);
    }
    
    const whereClause = whereConditions.join(' AND ');
    
    // Query to count funds grouped by nhom
    const query = `
      SELECT 
        COALESCE(lq.nhom, 'Khac') AS nhom,
        COUNT(q.quy_id) AS count
      FROM quy q
      INNER JOIN loaiquy lq ON q.loaiquy_id = lq.loaiquy_id
      WHERE ${whereClause}
      GROUP BY COALESCE(lq.nhom, 'Khac')
      HAVING count > 0
    `;
    
    const [rows] = await pool.query(query, params);
    
    // Transform to object format: { "Hoc bong": 15, "Y te": 8, ... }
    const countByGroup = {};
    rows.forEach(row => {
      countByGroup[row.nhom] = row.count;
    });
    
    return res.status(200).json({
      success: true,
      data: countByGroup
    });
  } catch (error) {
    console.error('Error in getFundCountByGroup:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server, vui lòng thử lại sau'
    });
  }
};
```

**Route Registration:** `backend/routes/fundRoutes.js`

```javascript
router.get('/funds/count-by-group', getFundCountByGroup); // Public endpoint
```

### 4.2 Update Existing API: Add `nhom` Filter to `getPublicFunds`

**File:** `backend/controllers/funds/fundController.js`

**Function:** `getPublicFunds` (UPDATE)

```javascript
export const getPublicFunds = async (req, res) => {
  try {
    const { nhom, page, limit, capDo, trangThai, search } = req.query;
    
    // Parse pagination parameters
    const currentPage = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 6;
    const offset = (currentPage - 1) * pageSize;
    
    // Build WHERE clause
    let whereConditions = ["q.trangthai IN ('Dang hoat dong', 'Tam dung')"];
    const params = [];
    
    // Filter by nhom (group)
    if (nhom) {
      whereConditions.push('COALESCE(lq.nhom, ?) = ?');
      params.push('Khac', nhom);
    }
    
    // Filter by capDo (level)
    if (capDo) {
      whereConditions.push('q.capdo = ?');
      params.push(parseInt(capDo));
    }
    
    // Filter by trangThai (status)
    if (trangThai) {
      whereConditions.push('q.trangthai = ?');
      params.push(trangThai);
    }
    
    // Search by fund name or description
    if (search) {
      whereConditions.push('(q.tenquy LIKE ? OR q.mota LIKE ?)');
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern);
    }
    
    const whereClause = whereConditions.join(' AND ');
    
    // Count total funds matching filters
    const countQuery = `
      SELECT COUNT(q.quy_id) AS total
      FROM quy q
      INNER JOIN loaiquy lq ON q.loaiquy_id = lq.loaiquy_id
      WHERE ${whereClause}
    `;
    
    const [[{ total }]] = await pool.query(countQuery, params);
    
    // Fetch paginated funds
    const fundsQuery = `
      SELECT 
        q.quy_id,
        q.tenquy AS ten_quy,
        lq.loaiquy_id,
        lq.maloai AS loai_quy,
        lq.tenloai AS ten_loai_quy,
        lq.nhom AS nhom_loai_quy,
        q.mota AS mo_ta,
        q.hinhanh AS hinh_anh,
        q.sotienmuctieu AS so_tien_muc_tieu,
        q.sotienhotrotoida AS so_tien_ho_tro_toi_da,
        q.soluonghotrotoida AS so_luong_chi_tieu,
        q.dieukienhotro AS dieu_kien_tom_tat,
        q.ngaybatdau AS ngay_bat_dau,
        q.ngayketthuc AS han_nop_don,
        q.sodu AS so_du,
        q.loaidieuhanh AS loai_dieu_hanh,
        q.capdo,
        q.quy_cha_id,
        qp.tenquy AS ten_quy_cha,
        (q.sodu - COALESCE(SUM(CASE WHEN yc.trangthai = 'Cho giai ngan' THEN yc.sotiendenghi ELSE 0 END), 0)) AS so_du_thuc_te,
        q.nguoitao_id,
        q.ngaytao AS ngay_tao,
        q.ngaycapnhat AS ngay_cap_nhat,
        q.trangthai AS trang_thai,
        COUNT(CASE WHEN yc.trangthai IN ('Da duyet cap 3', 'Cho giai ngan', 'Da giai ngan') THEN 1 END) AS so_don_da_nop,
        CASE 
          WHEN q.soluonghotrotoida IS NOT NULL AND q.soluonghotrotoida > 0 
          THEN ROUND((COUNT(CASE WHEN yc.trangthai IN ('Da duyet cap 3', 'Cho giai ngan', 'Da giai ngan') THEN 1 END) / q.soluonghotrotoida) * 100, 0)
          ELSE 0
        END AS phan_tram_da_nhan,
        (SELECT COUNT(*) 
         FROM quy qc 
         WHERE qc.quy_cha_id = q.quy_id 
         AND qc.trangthai = 'Dang hoat dong') AS so_quy_con_hoat_dong
      FROM quy q
      INNER JOIN loaiquy lq ON q.loaiquy_id = lq.loaiquy_id
      LEFT JOIN quy qp ON q.quy_cha_id = qp.quy_id
      LEFT JOIN yeucauhotro yc ON q.quy_id = yc.quy_id
      WHERE ${whereClause}
      GROUP BY q.quy_id, lq.loaiquy_id, lq.maloai, lq.tenloai, lq.nhom, q.ngaytao, q.loaidieuhanh, q.capdo, q.quy_cha_id, qp.tenquy
      ORDER BY q.ngaytao DESC
      LIMIT ? OFFSET ?
    `;
    
    const fundsParams = [...params, pageSize, offset];
    const [funds] = await pool.query(fundsQuery, fundsParams);
    
    return res.status(200).json({
      success: true,
      total: total,
      page: currentPage,
      limit: pageSize,
      funds: funds.map(fund => ({
        quyId: fund.quy_id,
        tenQuy: fund.ten_quy,
        loaiQuy: fund.loai_quy,
        loaiquy: {
          loaiQuyId: fund.loaiquy_id,
          maLoai: fund.loai_quy,
          tenLoai: fund.ten_loai_quy,
          nhom: fund.nhom_loai_quy,
        },
        moTa: fund.mo_ta,
        hinhAnh: buildFundImageUrl(fund.hinh_anh),
        soTienMucTieu: fund.so_tien_muc_tieu,
        soTienHoTroToiDa: fund.so_tien_ho_tro_toi_da,
        soLuongChiTieu: fund.so_luong_chi_tieu,
        hanNopDon: fund.han_nop_don,
        ngayBatDau: fund.ngay_bat_dau,
        ngayKetThuc: fund.han_nop_don,
        dieuKienTomTat: fund.dieu_kien_tom_tat,
        soDu: fund.so_du,
        soDuThucTe: fund.so_du_thuc_te,
        nguoiTao: fund.nguoitao_id,
        ngayTao: fund.ngay_tao,
        ngayCapNhat: fund.ngay_cap_nhat,
        trangThai: fund.trang_thai,
        soDonDaNop: fund.so_don_da_nop,
        phanTramDaNhan: fund.phan_tram_da_nhan,
        soQuyConHoatDong: fund.so_quy_con_hoat_dong,
        loaiDieuHanh: fund.loai_dieu_hanh,
        capDo: fund.capdo,
        quyChaId: fund.quy_cha_id,
        tenQuyCha: fund.ten_quy_cha
      }))
    });
  } catch (error) {
    console.error('Error in getPublicFunds:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server, vui lòng thử lại sau'
    });
  }
};
```

### 4.3 Update LoaiQuyModel

**File:** `backend/models/funds/LoaiQuyModel.js`

**Function:** `getLoaiQuyGroups` (UPDATE)

```javascript
// Get distinct nhom values (fund groups)
const getLoaiQuyGroups = async () => {
  const [rows] = await pool.query(
    `SELECT DISTINCT COALESCE(nhom, 'Khac') AS nhom 
     FROM loaiquy 
     WHERE nhom IS NOT NULL
     ORDER BY nhom`
  );
  return rows.map(row => row.nhom);
};
```

## 5. Frontend Implementation

### 5.1 Service Layer: Add API Calls

**File:** `frontend/src/services/fundService.js`

```javascript
// New: Get fund count by group
export const getFundCountByGroup = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.capDo) params.append('capDo', filters.capDo);
    if (filters.trangThai) params.append('trangThai', filters.trangThai);
    
    const response = await fetch(
      `${API_BASE_URL}/funds/count-by-group?${params.toString()}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch fund count by group');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error in getFundCountByGroup:', error);
    throw error;
  }
};

// Update: Add pagination and nhom filter to getPublicFunds
export const getPublicFunds = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.nhom) params.append('nhom', filters.nhom);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.capDo) params.append('capDo', filters.capDo);
    if (filters.trangThai) params.append('trangThai', filters.trangThai);
    if (filters.search) params.append('search', filters.search);
    
    const response = await fetch(
      `${API_BASE_URL}/funds/public?${params.toString()}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch public funds');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error in getPublicFunds:', error);
    throw error;
  }
};
```

### 5.2 FundsPage Component Updates

**File:** `frontend/src/pages/Public/FundsPage/FundsPage.jsx`

**Pattern:** Follow NewsPage implementation pattern

**Key Changes:**

1. **State Management:**
```javascript
// Categories configuration (similar to NewsPage CATEGORIES_CONFIG)
const CATEGORIES_CONFIG = [
  { key: 'Hoc bong', label: 'Học bổng', class: 'scholarship' },
  { key: 'Y te', label: 'Y tế', class: 'healthcare' },
  { key: 'Khan cap', label: 'Khẩn cấp', class: 'emergency' },
  { key: 'Khac', label: 'Khác', class: 'other' }
];

const ITEMS_PER_PAGE = 6;

// Helper to create state object for all categories
const createCategoryState = (valueFactory) => 
  CATEGORIES_CONFIG.reduce((acc, cat) => {
    acc[cat.key] = typeof valueFactory === 'function' 
      ? valueFactory(cat) 
      : valueFactory;
    return acc;
  }, {});

// State declarations
const [categoryCounts, setCategoryCounts] = useState(createCategoryState(0));
const [categoryPages, setCategoryPages] = useState(createCategoryState(1));
const [categoryData, setCategoryData] = useState(createCategoryState(() => []));
const [categoryTotals, setCategoryTotals] = useState(createCategoryState(0));
const [categoryLoading, setCategoryLoading] = useState(createCategoryState(false));
const [initLoading, setInitLoading] = useState(true);
const filterRequestIdRef = useRef(0);
```

2. **Data Fetching Logic:**
```javascript
// Fetch counts when filters change
useEffect(() => {
  const fetchCounts = async () => {
    const requestId = filterRequestIdRef.current + 1;
    filterRequestIdRef.current = requestId;
    
    try {
      setInitLoading(true);
      // Reset all states
      setCategoryCounts(createCategoryState(0));
      setCategoryTotals(createCategoryState(0));
      setCategoryData(createCategoryState(() => []));
      setCategoryPages(createCategoryState(1));
      
      const response = await getFundCountByGroup({
        capDo: activeCapDo,
        trangThai: activeTrangThai
      });
      
      if (requestId !== filterRequestIdRef.current) return;
      
      if (response.success) {
        const counts = { ...createCategoryState(0), ...response.data };
        setCategoryCounts(counts);
        setCategoryTotals(counts);
        
        // Fetch funds for categories with count > 0
        CATEGORIES_CONFIG.forEach(cat => {
          if (counts[cat.key] > 0) {
            fetchCategoryFunds(cat.key, 1, requestId);
          }
        });
      }
    } catch (error) {
      console.error('Error fetching counts:', error);
    } finally {
      if (requestId === filterRequestIdRef.current) {
        setInitLoading(false);
      }
    }
  };
  
  fetchCounts();
}, [activeCapDo, activeTrangThai]);

// Fetch funds for a specific category
const fetchCategoryFunds = async (categoryKey, page, requestId) => {
  try {
    setCategoryLoading(prev => ({ ...prev, [categoryKey]: true }));
    
    const response = await getPublicFunds({
      nhom: categoryKey,
      page,
      limit: ITEMS_PER_PAGE,
      capDo: activeCapDo,
      trangThai: activeTrangThai,
      search: searchKeyword
    });
    
    if (requestId !== filterRequestIdRef.current) return;
    
    if (response.success) {
      setCategoryData(prev => ({ ...prev, [categoryKey]: response.funds }));
      setCategoryTotals(prev => ({ ...prev, [categoryKey]: response.total }));
    }
  } catch (error) {
    console.error(`Error fetching funds for ${categoryKey}:`, error);
  } finally {
    if (requestId === filterRequestIdRef.current) {
      setCategoryLoading(prev => ({ ...prev, [categoryKey]: false }));
    }
  }
};

// Handle pagination
const handlePageChange = (categoryKey, newPage) => {
  setCategoryPages(prev => ({ ...prev, [categoryKey]: newPage }));
  fetchCategoryFunds(categoryKey, newPage, filterRequestIdRef.current);
  
  // Scroll to category section
  const sectionElement = document.getElementById(`section-${categoryKey}`);
  if (sectionElement) {
    sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};
```

3. **Rendering Logic:**
```javascript
const renderCategorySection = (cat) => {
  const data = categoryData[cat.key] || [];
  const loading = categoryLoading[cat.key];
  const total = categoryTotals[cat.key] || 0;
  const currentPage = categoryPages[cat.key] || 1;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  
  if (total === 0) return null;
  
  return (
    <section 
      key={cat.key} 
      id={`section-${cat.key}`} 
      className={styles.categorySection}
    >
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>
          <span className={`${styles.titleDot} ${styles[cat.class]}`} />
          {cat.label}
        </h2>
        <span className={styles.sectionCount}>({total} quỹ)</span>
      </div>
      
      {loading ? (
        renderSkeletons()
      ) : (
        <>
          <div className={styles.grid}>
            {data.map(fund => (
              <FundCard key={fund.quy_id} fund={fund} />
            ))}
          </div>
          
          {totalPages > 1 && (
            <CategoryPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => handlePageChange(cat.key, page)}
            />
          )}
        </>
      )}
    </section>
  );
};

// Main render
return (
  <div className={styles.fundsPage}>
    {/* ... header, filters ... */}
    
    {initLoading ? (
      <LoadingState />
    ) : totalFundsCount === 0 ? (
      <EmptyState />
    ) : (
      <div className={styles.sectionsWrapper}>
        {CATEGORIES_CONFIG.map(cat => renderCategorySection(cat))}
      </div>
    )}
  </div>
);
```

### 5.3 New Components

**Component: FundCategorySection**
- Props: category config, funds data, pagination state, loading state
- Responsibilities: Render category header, fund grid, pagination controls
- Reuses existing FundCard component from FundGridSection

**Component: CategoryPagination**
- Props: currentPage, totalPages, onPageChange
- UI: Previous button, page numbers, Next button
- Disabled states for first/last page

### 5.4 FundSelectSection Updates

**File:** `frontend/src/components/sections/FundsPage/FundSelectSection.jsx`

**Change:** Hide or disable "Loại quỹ" dropdown filter

```javascript
// Option 1: Conditionally hide
{!useCategoryMode && (
  <div className={styles.filterItem}>
    <label>Loại quỹ</label>
    <select value={activeMaLoai} onChange={handleMaLoaiChange}>
      {/* ... options ... */}
    </select>
  </div>
)}

// Option 2: Show but disabled with tooltip
<div className={styles.filterItem}>
  <label>Loại quỹ</label>
  <select disabled title="Đã được thay thế bằng phân nhóm">
    <option>Tất cả</option>
  </select>
</div>
```

## 6. Responsive Design

### 6.1 Breakpoints

```scss
// FundsPage.module.scss

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  
  @media (max-width: 968px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 32px;
  
  @media (max-width: 640px) {
    gap: 8px;
    margin-top: 24px;
    
    button {
      font-size: 14px;
      padding: 8px 12px;
    }
  }
}
```

## 7. Performance Optimization

### 7.1 Strategies

1. **Parallel API Calls:**
```javascript
// Fetch all category funds in parallel
const categoryKeys = CATEGORIES_CONFIG
  .filter(cat => categoryCounts[cat.key] > 0)
  .map(cat => cat.key);

await Promise.all(
  categoryKeys.map(key => fetchCategoryFunds(key, 1, requestId))
);
```

2. **Request Limiting:**
```javascript
// Limit concurrent requests to 6
const chunks = chunkArray(categoryKeys, 6);
for (const chunk of chunks) {
  await Promise.all(chunk.map(key => fetchCategoryFunds(key, 1, requestId)));
}
```

3. **Debounced Search:**
```javascript
const [searchKeyword, setSearchKeyword] = useState('');
const debouncedSearch = useDebounce(searchKeyword, 300);

useEffect(() => {
  // Trigger refetch when debouncedSearch changes
}, [debouncedSearch]);
```

4. **Request Cancellation:**
```javascript
const filterRequestIdRef = useRef(0);

// Increment request ID on new filter
filterRequestIdRef.current++;

// Check if request is stale before updating state
if (requestId !== filterRequestIdRef.current) return;
```

### 7.2 Caching Strategy

- Count data cached until filter change
- Independent category data states prevent full page re-renders
- Skeleton loaders for individual categories during fetch

## 8. Error Handling

### 8.1 API Error Scenarios

**Count API Fails:**
```javascript
try {
  const response = await getFundCountByGroup(filters);
  // ... success
} catch (error) {
  setError('Không thể tải danh mục quỹ. Vui lòng thử lại.');
  // Show retry button
}
```

**Category Funds API Fails:**
```javascript
// Show inline error for specific category
<div className={styles.categoryError}>
  <p>Không thể tải quỹ trong nhóm này</p>
  <button onClick={() => fetchCategoryFunds(cat.key, currentPage)}>
    Thử lại
  </button>
</div>
```

### 8.2 Edge Cases

1. **No funds in system:** Display empty state message
2. **All categories filtered out:** Display "Không tìm thấy quỹ phù hợp"
3. **NULL nhom values:** Grouped into "Khác" category
4. **Network timeout:** Show timeout message with retry option

## 9. Analytics & Tracking

### 9.1 Event Tracking Structure

```javascript
const logAnalyticsEvent = (eventName, eventData) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', eventName, eventData);
  } else {
    // Send to analytics service (Google Analytics, etc.)
    // window.gtag('event', eventName, eventData);
  }
};

// Track category pagination
const handlePageChange = (categoryKey, newPage) => {
  logAnalyticsEvent('fund_category_page_change', {
    group_name: categoryKey,
    from_page: categoryPages[categoryKey],
    to_page: newPage
  });
  
  // ... rest of pagination logic
};

// Track fund card click
const handleFundClick = (fund, categoryKey, page) => {
  logAnalyticsEvent('fund_card_click', {
    fund_id: fund.quy_id,
    group_name: categoryKey,
    page_number: page
  });
  
  navigate(`/funds/${fund.quy_id}`);
};

// Track filter application
const handleFilterChange = (filterType, filterValue) => {
  logAnalyticsEvent('fund_filter_applied', {
    filter_type: filterType,
    filter_value: filterValue
  });
};

// Track category impression (using Intersection Observer)
useEffect(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const categoryKey = entry.target.id.replace('section-', '');
        logAnalyticsEvent('fund_category_impression', {
          group_name: categoryKey
        });
      }
    });
  }, { threshold: 0.5 });
  
  // Observe all category sections
  CATEGORIES_CONFIG.forEach(cat => {
    const element = document.getElementById(`section-${cat.key}`);
    if (element) observer.observe(element);
  });
  
  return () => observer.disconnect();
}, [categoryData]);
```

## 10. Testing Considerations

### 10.1 Unit Tests

- Test `createCategoryState` helper function
- Test pagination calculation logic
- Test filter combination logic
- Test request ID cancellation logic

### 10.2 Integration Tests

- Test full data flow from API to UI
- Test pagination updates correct category only
- Test filter resets all page states
- Test parallel API calls complete successfully

### 10.3 E2E Tests

- Navigate to FundsPage, verify categories render
- Click pagination, verify correct funds load
- Apply filters, verify counts update correctly
- Test responsive behavior on mobile viewport

## 11. Migration Path

### 11.1 Rollout Plan

**Phase 1: Database Migration**
1. Run migration script to add `nhom` column
2. Update existing loaiquy records with default nhom values
3. Verify data integrity

**Phase 2: Backend Deployment**
1. Deploy updated API endpoints
2. Test API responses in staging environment
3. Monitor API performance

**Phase 3: Frontend Deployment**
1. Deploy frontend changes with feature flag (optional)
2. Monitor user behavior and error rates
3. Collect feedback

**Phase 4: Cleanup**
1. Remove old loaiQuy filter dropdown
2. Archive legacy code
3. Update documentation

### 11.2 Rollback Strategy

- Keep old API behavior intact (getPublicFunds without pagination)
- Feature flag to toggle between old/new UI
- Database migration is non-destructive (adding column, not removing)

## 12. Summary

This design implements a category-based fund display system inspired by the NewsPage pattern. Key technical decisions:

1. **Database:** Non-destructive migration adds `nhom` column to `loaiquy`
2. **Backend:** New count endpoint + pagination parameters on existing endpoint
3. **Frontend:** Independent state management per category using helper functions
4. **Performance:** Parallel API calls, request cancellation, debounced search
5. **UX:** Independent pagination, smooth scrolling, skeleton loaders, inline errors

The design prioritizes:
- **Maintainability:** Reuses proven NewsPage patterns
- **Performance:** Parallel fetching, intelligent caching
- **User Experience:** Independent pagination, responsive design, clear error handling
- **Extensibility:** Easy to add new categories, analytics integration ready
