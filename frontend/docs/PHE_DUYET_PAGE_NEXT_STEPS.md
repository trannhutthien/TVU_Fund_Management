# Phê Duyệt Page - Next Steps

## ✅ Đã hoàn thành

### Backend
- ✅ `backend/controllers/pheDuyetController.js` - 4 API endpoints
- ✅ `backend/routes/pheDuyetRoutes.js` - Routes configuration
- ✅ `backend/server.js` - Registered routes

### API Endpoints Available
1. `GET /api/pheduyet/stats` - Thống kê 4 cards
2. `GET /api/pheduyet/approvers` - Danh sách người duyệt
3. `GET /api/pheduyet` - Danh sách phê duyệt với filters
4. `GET /api/pheduyet/timeline/:type/:id` - Chuỗi phê duyệt chi tiết

## 🔄 Cần làm tiếp - Frontend

### 1. Restart Backend Server
```bash
cd backend
# Stop server (Ctrl+C)
npm start
```

### 2. Test API với Postman
Test tất cả 4 endpoints để đảm bảo backend hoạt động đúng.

### 3. Tạo Frontend Components

#### Cấu trúc thư mục cần tạo:
```
frontend/src/pages/Staff/Admin/PheDuyetPage/
├── PheDuyetPage.jsx                    # Main container
├── PheDuyetPage.module.scss
├── sections/
│   ├── PheDuyetStats/
│   │   ├── index.jsx                   # 4 stats cards
│   │   └── PheDuyetStats.module.scss
│   ├── PheDuyetFilter/
│   │   ├── index.jsx                   # Multi-dimension filters
│   │   └── PheDuyetFilter.module.scss
│   ├── PheDuyetTable/
│   │   ├── index.jsx                   # Data table
│   │   └── PheDuyetTable.module.scss
│   └── PheDuyetDetailDrawer/
│       ├── index.jsx                   # Drawer container
│       ├── PheDuyetDetailDrawer.module.scss
│       └── ApprovalTimeline/
│           ├── index.jsx               # Timeline component
│           └── ApprovalTimeline.module.scss
```

#### Thứ tự implement:
1. **PheDuyetStats** (đơn giản nhất - 4 cards)
2. **PheDuyetFilter** (form với nhiều filters)
3. **PheDuyetTable** (table hiển thị data)
4. **ApprovalTimeline** (timeline component)
5. **PheDuyetDetailDrawer** (drawer container)
6. **PheDuyetPage** (main container kết hợp tất cả)

### 4. Add Route và Menu

#### Add route trong `App.jsx`:
```jsx
import PheDuyetPage from '@pages/Staff/Admin/PheDuyetPage/PheDuyetPage';

// Inside Routes
<Route path="/admin/phe-duyet" element={<PheDuyetPage />} />
```

#### Add menu item trong `StaffSidebar.jsx`:
```jsx
{
  label: 'Lịch sử phê duyệt',
  path: '/admin/phe-duyet',
  icon: HiOutlineClipboardDocumentCheck,
  roles: [1], // Admin only
}
```

## 📝 Component Details

### PheDuyetStats Props
```typescript
{
  stats: {
    tongBanGhi: number;
    daDuyet: number;
    tuChoi: number;
    yeuCauBoSung: number;
  } | null;
  loading: boolean;
}
```

### PheDuyetFilter Props
```typescript
{
  filters: {
    keyword: string;
    loai_nguon: '' | 'yeucau' | 'taitro';
    cap_do_duyet: '' | '1' | '2' | '3';
    ket_qua: '' | 'Da duyet' | 'Tu choi' | 'Yeu cau bo sung' | 'Cho duyet';
    nguoi_duyet_id: string;
    tu_ngay: string;
    den_ngay: string;
  };
  approverOptions: Array<{
    value: number;
    label: string;
  }>;
  onChange: (filters: Filters) => void;
}
```

### PheDuyetTable Props
```typescript
{
  data: Array<PheDuyetRecord>;
  loading: boolean;
  onViewDetail: (record: PheDuyetRecord) => void;
}
```

### PheDuyetDetailDrawer Props
```typescript
{
  record: PheDuyetRecord | null;
  onClose: () => void;
}
```

## 🎨 Design Tokens

### Colors
```scss
// Status
$approved: #10b981;
$rejected: #ef4444;
$pending: #94a3b8;
$processing: #f59e0b;

// Levels
$level1: var(--color-primary);
$level2: #7c3aed;
$level3: #0891b2;

// Roles
$admin: #9333ea;
$giaovu: var(--color-primary);
$ketoan: #b45309;
```

### Typography
```scss
$font-size-xs: 11px;
$font-size-sm: 12px;
$font-size-base: 13px;
$font-size-md: 14px;
$font-size-lg: 15px;
```

## 🧪 Testing Checklist

- [ ] Backend API hoạt động (test với Postman)
- [ ] Stats cards hiển thị đúng số liệu
- [ ] Filters hoạt động (từng filter và kết hợp)
- [ ] Keyword search hoạt động
- [ ] Date range filter hoạt động
- [ ] Table hiển thị đúng data
- [ ] Pagination hoạt động
- [ ] Click "Xem chuỗi duyệt" mở drawer
- [ ] Timeline hiển thị đúng các bước phê duyệt
- [ ] Loading states hoạt động
- [ ] Empty states hiển thị đúng
- [ ] Responsive trên mobile

## 📚 Reference Documents

- Full implementation guide: `PHE_DUYET_PAGE_IMPLEMENTATION_GUIDE.md`
- API documentation: See backend controller comments
- Design mockup: See implementation guide

## 🚀 Quick Start

1. Restart backend server
2. Test API với Postman
3. Tạo folder structure
4. Implement components theo thứ tự
5. Test từng component
6. Integration testing
7. UI/UX polish

---

**Status**: Backend Complete ✅ | Frontend Pending ⏳
**Next**: Implement PheDuyetStats component
**Priority**: Medium
**Estimated Time**: 6-8 hours for all frontend components
