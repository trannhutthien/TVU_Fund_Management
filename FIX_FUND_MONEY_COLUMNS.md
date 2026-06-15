# Fix: Fund Creation - Money Columns & Creator ID Saving as NULL

## Problem 1: Money Columns NULL ✅ FIXED
When creating a fund, two columns were saving as NULL:
- `sotienmuctieu` (Số tiền mục tiêu)
- `sotienhotrotoida` (Số tiền hỗ trợ tối đa/sinh viên)

**Root Cause:** Column names in INSERT query didn't match actual database columns.

**Solution:** Updated all SQL queries to use correct lowercase column names without underscores.

---

## Problem 2: Creator ID NULL ✅ FIXED
The column `nguoi_tao_id` was saving as NULL even though frontend sent `nguoiTao: 1`.

### Root Cause
**Typo in column name!** The INSERT query used:
- ❌ `nguoitao_id` (no underscore between nguoi and tao)

But the actual database column is:
- ✅ `nguoi_tao_id` (WITH underscore: `nguoi_tao_id`)

### Solution Applied
Fixed column name in `backend/models/funds/FundModel.js`:

```sql
-- BEFORE (WRONG)
INSERT INTO quy (
  ...,
  nguoitao_id,  -- ❌ Missing underscore
  ...
)

-- AFTER (CORRECT)
INSERT INTO quy (
  ...,
  nguoi_tao_id,  -- ✅ Correct!
  ...
)
```

Also updated all SELECT queries to use correct alias:
```sql
SELECT q.nguoi_tao_id AS nguoitao_id
```

---

## Database Column Names - FINAL REFERENCE

| Purpose | Database Column | Notes |
|---------|----------------|-------|
| Fund ID | `quy_id` | Has underscore |
| Fund Name | `tenquy` | No underscore |
| Fund Type | `loaiquy_id` | Has underscore |
| Description | `mota` | No underscore |
| Image | `hinhanh` | No underscore |
| Target Amount | `sotienmuctieu` | No underscore |
| Max Support | `sotienhotrotoida` | No underscore |
| Max Quota | `soluonghotrotoida` | No underscore |
| Conditions | `dieukienhotro` | No underscore |
| Deadline | `ngayketthuc` | No underscore |
| Balance | `sodu` | No underscore |
| **Creator ID** | **`nguoi_tao_id`** | **Has underscores!** ⚠️ |
| Status | `trangthai` | No underscore |
| Created Date | `ngaytao` | No underscore |
| Updated Date | `ngaycapnhat` | No underscore |

**Important Pattern:**
- Most columns: lowercase without underscores
- ID columns (PKs, FKs): have underscores (`quy_id`, `loaiquy_id`, `nguoi_tao_id`)

---

## Files Modified

### 1. `backend/models/funds/FundModel.js`
- Fixed `createFund()`: `nguoitao_id` → `nguoi_tao_id`
- Fixed `getFundById()`: Added alias `AS nguoitao_id`
- Fixed `getAllFunds()`: Added alias `AS nguoitao_id`
- Fixed `getPublicFunds()`: Added alias `AS nguoitao_id`
- All other column names also fixed to match database

### 2. `frontend/src/pages/Staff/CanBo/TaoQuyPage/TaoQuyPage.jsx`
- Added debug console.logs (can be removed after testing)
- Already sending `nguoiTao: user?.id` correctly ✅

### 3. `backend/controllers/funds/fundController.js`
- Already has debug logs ✅
- Response fields already correct ✅

---

## Testing Steps

1. **Restart backend server**
2. **Clear browser cache** or hard refresh (Ctrl + F5)
3. **Create a new fund** with:
   - Số tiền mục tiêu: `100000000`
   - Số tiền hỗ trợ tối đa: `5000000`
4. **Check database:**
   ```sql
   SELECT quy_id, tenquy, sotienmuctieu, sotienhotrotoida, nguoi_tao_id, sodu
   FROM quy 
   ORDER BY ngaytao DESC 
   LIMIT 1;
   ```

**Expected Result:**
- `sotienmuctieu` = 100000000 ✅
- `sotienhotrotoida` = 5000000 ✅
- `nguoi_tao_id` = 1 (or your user ID) ✅
- `sodu` = (your value) ✅

---

## Status
✅ **FIXED** - All column name mismatches resolved:
- Money columns: `sotienmuctieu`, `sotienhotrotoida`
- Creator ID: `nguoi_tao_id` (note the underscores!)

The data flow is now correct: Frontend → Controller → Model → Database

