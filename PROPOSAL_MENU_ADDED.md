# ✅ NAVIGATION MENU ADDED - PROPOSAL LIST PAGE

## 📍 Menu Configuration

### Menu Item Details

**Label**: "Duyệt đề xuất"  
**Icon**: `HiOutlineClipboardDocumentList`  
**Badge**: `duyetDeXuat` (số đề xuất cần xử lý theo role)  
**Roles**: Admin (1), Kế toán (2), Cán bộ (3)  
**Section**: NGHIỆP VỤ

---

## 🎯 Menu Placement

### Admin (role 1)
```
NGHIỆP VỤ
├── Xét duyệt hồ sơ
├── Lịch sử phê duyệt
├── Danh sách Quỹ
├── Trích lập Ngân sách
├── Dự toán hàng năm
├── Đề xuất chương trình
├── ✨ Duyệt đề xuất (NEW)      ← /admin/de-xuat
├── Nhà tài trợ
├── Khoản tài trợ
├── Lịch sử giao dịch
└── Đối soát chứng từ
```

### Kế toán (role 2)
```
NGHIỆP VỤ
├── Xét duyệt & giải ngân hồ sơ
├── Trích lập Ngân sách
├── Dự toán hàng năm
├── ✨ Duyệt đề xuất (NEW)      ← /ke-toan/de-xuat
├── Lịch sử giao dịch
└── Khoản tài trợ
```

### Cán bộ (role 3)
```
NGHIỆP VỤ
├── Xét duyệt hồ sơ
├── Danh sách Quỹ
├── Trích lập Ngân sách
├── Dự toán hàng năm
├── Đề xuất chương trình
├── ✨ Duyệt đề xuất (NEW)      ← /can-bo/de-xuat
└── Nhà tài trợ
```

---

## 🔔 Badge System

### Badge Key: `duyetDeXuat`

The menu item shows a badge with the count of pending proposals based on user role:

- **Admin (role 1)**: Shows count of proposals with status `'Da nhan tien'` (waiting for activity creation)
- **Kế toán (role 2)**: Shows count of proposals with status `'Can bo da duyet'` (waiting for money confirmation)
- **Cán bộ (role 3)**: Shows count of proposals with status `'Cho duyet'` (waiting for approval)

### Backend Integration

The badge count is fetched from:
```javascript
GET /api/statistics/pending-count
```

Expected response format:
```json
{
  "success": true,
  "data": {
    "pendingCount": 5,
    "nghiemThuCongNo": 3,
    "khoanTaiTro": 2,
    "doiSoatChungTu": 1,
    "duyetDeXuat": 7    // ← NEW: Count for proposal approval
  }
}
```

**Note**: Backend cần update endpoint `/api/statistics/pending-count` để return `duyetDeXuat` count.

---

## 🔐 Permissions

### Permission Key: `duyet_de_xuat`

Added to permission check system:
```javascript
if (key === 'de-xuat') key = 'duyet_de_xuat';
```

The page will be visible/hidden based on:
- System settings permissions configuration
- User role (1, 2, 3)
- Page-specific permissions

---

## 📝 Files Modified

### 1. StaffSidebar.jsx
**Path**: `frontend/src/components/layout/StaffSidebar/StaffSidebar.jsx`

**Changes**:
1. Added menu item to Admin NAV_CONFIG (NGHIỆP VỤ section):
   ```javascript
   { label: 'Duyệt đề xuất', path: '/admin/de-xuat', icon: HiOutlineClipboardDocumentList, roles: [1], badgeKey: 'duyetDeXuat' }
   ```

2. Added menu item to Kế toán NAV_CONFIG (NGHIỆP VỤ section):
   ```javascript
   { label: 'Duyệt đề xuất', path: '/ke-toan/de-xuat', icon: HiOutlineClipboardDocumentList, roles: [2], badgeKey: 'duyetDeXuat' }
   ```

3. Added menu item to Cán bộ NAV_CONFIG (NGHIỆP VỤ section):
   ```javascript
   { label: 'Duyệt đề xuất', path: '/can-bo/de-xuat', icon: HiOutlineClipboardDocumentList, roles: [3], badgeKey: 'duyetDeXuat' }
   ```

4. Updated badgeCounts state:
   ```javascript
   const [badgeCounts, setBadgeCounts] = useState({
     pendingCount: 0,
     nghiemThuCongNo: 0,
     khoanTaiTro: 0,
     doiSoatChungTu: 0,
     duyetDeXuat: 0,  // ← NEW
   });
   ```

5. Added permission check mapping:
   ```javascript
   if (key === 'de-xuat') key = 'duyet_de_xuat';
   ```

---

## 🧪 Testing Menu

### Test Menu Visibility
1. **Login as Cán bộ (role 3)**:
   - Open sidebar ✅
   - Find "NGHIỆP VỤ" section ✅
   - See "Duyệt đề xuất" menu item ✅
   - Badge shows count (if > 0) ✅

2. **Login as Kế toán (role 2)**:
   - Open sidebar ✅
   - Find "NGHIỆP VỤ" section ✅
   - See "Duyệt đề xuất" menu item ✅
   - Badge shows count (if > 0) ✅

3. **Login as Admin (role 1)**:
   - Open sidebar ✅
   - Find "NGHIỆP VỤ" section ✅
   - See "Duyệt đề xuất" menu item ✅
   - Badge shows count (if > 0) ✅

### Test Menu Navigation
1. Click "Duyệt đề xuất" menu item
2. Should navigate to:
   - Admin → `/admin/de-xuat`
   - Kế toán → `/ke-toan/de-xuat`
   - Cán bộ → `/can-bo/de-xuat`
3. ProposalListPage should load ✅
4. Page should show correct tab based on role ✅

### Test Badge Updates
1. Create a new proposal (as donor)
2. Badge on "Duyệt đề xuất" for Cán bộ should increase
3. Approve proposal (as Cán bộ)
4. Badge on "Duyệt đề xuất" for Kế toán should increase
5. Confirm money (as Kế toán)
6. Badge on "Duyệt đề xuất" for Admin should increase

---

## ⚠️ Backend TODO

### Update Pending Count Endpoint

**Endpoint**: `GET /api/statistics/pending-count`

**Controller**: `backend/controllers/reports/statisticsController.js` (hoặc tương tự)

**Required Change**: Add `duyetDeXuat` to response:

```javascript
// Example implementation
const getPendingCount = async (req, res) => {
  try {
    const userId = req.user.nguoidung_id;
    const userRole = req.user.vaitro;
    
    // ... existing counts ...
    
    // NEW: Get proposal approval count based on role
    let duyetDeXuat = 0;
    
    if (userRole === 3) {
      // Cán bộ: Count 'Cho duyet'
      const [countResult] = await pool.query(
        'SELECT COUNT(*) as count FROM dexuatchuongtrinh WHERE trangthai = ?',
        ['Cho duyet']
      );
      duyetDeXuat = countResult[0].count;
    } else if (userRole === 2) {
      // Kế toán: Count 'Can bo da duyet'
      const [countResult] = await pool.query(
        'SELECT COUNT(*) as count FROM dexuatchuongtrinh WHERE trangthai = ?',
        ['Can bo da duyet']
      );
      duyetDeXuat = countResult[0].count;
    } else if (userRole === 1) {
      // Admin: Count 'Da nhan tien'
      const [countResult] = await pool.query(
        'SELECT COUNT(*) as count FROM dexuatchuongtrinh WHERE trangthai = ?',
        ['Da nhan tien']
      );
      duyetDeXuat = countResult[0].count;
    }
    
    return res.json({
      success: true,
      data: {
        pendingCount: ...,
        nghiemThuCongNo: ...,
        khoanTaiTro: ...,
        doiSoatChungTu: ...,
        duyetDeXuat,  // ← NEW
      }
    });
  } catch (error) {
    // error handling
  }
};
```

---

## 🚀 Completion Status

### Phase 4 Progress

1. ✅ **Add Routes** - COMPLETED
2. ✅ **Add Navigation Menu** - COMPLETED
3. ⏳ **Backend Badge Count** - TODO (update `/api/statistics/pending-count`)
4. ⏳ **Testing** - TODO

---

## 📊 Summary

**Menu Items Added**: 3 (one for each role)  
**Badge Keys Added**: 1 (`duyetDeXuat`)  
**Permission Keys Added**: 1 (`duyet_de_xuat`)  
**Files Modified**: 1 (`StaffSidebar.jsx`)  
**Backend Updates Required**: 1 endpoint modification

Navigation menu is now complete. Users can access the Proposal List Page via sidebar navigation. Next step is to update the backend badge count and perform end-to-end testing! 🎉
