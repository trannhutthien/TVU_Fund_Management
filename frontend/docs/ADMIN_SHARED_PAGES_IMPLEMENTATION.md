# Admin Shared Pages Implementation Guide

## Tổng quan
Admin (role 1) dùng lại các pages của Cán bộ (role 3) với một số tính năng mở rộng thông qua prop `isAdmin={true}`.

---

## 1. XetDuyetPage - Xét duyệt hồ sơ

**Route:**
- Admin: `/admin/xet-duyet`
- Cán bộ: `/can-bo/xet-duyet`

**Khác biệt:**
- **Cán bộ**: Duyệt cấp 1 (`cap_do_duyet = 1`), tab "Chờ xử lý" hiển thị hồ sơ `trang_thai = 'Cho duyet'`
- **Admin**: Duyệt cấp 2 (`cap_do_duyet = 2`), tab "Chờ Admin duyệt" hiển thị hồ sơ `trang_thai = 'Dang xu ly'` (đã qua cán bộ)

**Thay đổi cần thực hiện:**

### XetDuyetPage.jsx
```jsx
import PropTypes from 'prop-types';

const XetDuyetPage = ({ isAdmin = false }) => {
  // Thay đổi TABS dựa trên isAdmin
  const TABS = isAdmin 
    ? [
        { key: 'pending', label: 'Chờ Admin duyệt', icon: HiOutlineClock },
        { key: 'processed', label: 'Đã xử lý', icon: HiOutlineCheckCircle },
      ]
    : [
        { key: 'pending', label: 'Chờ xử lý', icon: HiOutlineClock },
        { key: 'processed', label: 'Đã xử lý', icon: HiOutlineCheckCircle },
      ];

  // Thay đổi trangThaiParam
  const trangThaiParam = useMemo(() => {
    if (activeTab === 'pending') {
      return isAdmin ? 'Dang xu ly' : 'Cho duyet';
    }
    return filterResult || PROCESSED_STATUSES;
  }, [activeTab, filterResult, isAdmin]);

  // Thêm filter cap_do_duyet khi fetch
  const params = {
    page: isSearching ? 1 : page,
    limit: isSearching ? SEARCH_WINDOW : PAGE_SIZE,
    trangThai: trangThaiParam,
    quyId: filters.quy_id || undefined,
    cap_do_duyet: isAdmin ? 2 : 1, // ← THÊM DÒNG NÀY
  };
};

XetDuyetPage.propTypes = {
  isAdmin: PropTypes.bool,
};
```

---

## 2. QuyListPage - Danh sách Quỹ

**Route:**
- Admin: `/admin/quy`
- Cán bộ: `/can-bo/quy`

**Khác biệt:**
- **Cán bộ**: Chỉ xem + sửa thông tin quỹ
- **Admin**: Thêm quyền Tạo mới, Xóa, Đổi trạng thái (Tạm dừng / Đóng)

**Thay đổi cần thực hiện:**

### QuyListPage.jsx
```jsx
import PropTypes from 'prop-types';

const QuyListPage = ({ isAdmin = false }) => {
  // Hiển thị nút "Tạo quỹ mới" chỉ khi isAdmin
  {isAdmin && (
    <Button
      variant="primary"
      leftIcon={<HiPlus />}
      onClick={() => navigate('/admin/quy/tao')}
    >
      Tạo quỹ mới
    </Button>
  )}

  // Trong QuyCard component, truyền isAdmin
  <QuyCard
    quy={quy}
    onEdit={handleEdit}
    onDelete={isAdmin ? handleDelete : undefined} // ← Chỉ admin có nút xóa
    onChangeStatus={isAdmin ? handleChangeStatus : undefined} // ← Chỉ admin đổi trạng thái
    isAdmin={isAdmin}
  />
};

QuyListPage.propTypes = {
  isAdmin: PropTypes.bool,
};
```

### QuyCard.jsx (hoặc component tương tự)
```jsx
const QuyCard = ({ quy, onEdit, onDelete, onChangeStatus, isAdmin }) => {
  return (
    <div className={styles.card}>
      {/* ... nội dung card ... */}
      
      <div className={styles.actions}>
        <Button onClick={() => onEdit(quy)}>Sửa</Button>
        
        {isAdmin && onDelete && (
          <Button variant="danger" onClick={() => onDelete(quy)}>
            Xóa
          </Button>
        )}
        
        {isAdmin && onChangeStatus && (
          <Dropdown
            options={[
              { value: 'Dang hoat dong', label: 'Đang hoạt động' },
              { value: 'Tam dung', label: 'Tạm dừng' },
              { value: 'Dong', label: 'Đóng' },
            ]}
            value={quy.trangThai}
            onChange={(val) => onChangeStatus(quy, val)}
          />
        )}
      </div>
    </div>
  );
};
```

---

## 3. NhaTaiTroPage - Nhà tài trợ

**Route:**
- Admin: `/admin/nha-tai-tro`
- Cán bộ: `/can-bo/nha-tai-tro`

**Khác biệt:**
- **Cán bộ**: Xem + ghi nhận tài trợ
- **Admin**: Thêm quyền Xóa nhà tài trợ, Export danh sách

**Thay đổi cần thực hiện:**

### NhaTaiTroPage.jsx
```jsx
import PropTypes from 'prop-types';
import { HiArrowDownTray, HiTrash } from 'react-icons/hi2';

const NhaTaiTroPage = ({ isAdmin = false }) => {
  // Thêm nút Export chỉ khi isAdmin
  {isAdmin && (
    <Button
      variant="secondary"
      leftIcon={<HiArrowDownTray />}
      onClick={handleExport}
    >
      Xuất danh sách
    </Button>
  )}

  // Trong bảng, thêm cột action với nút xóa
  {isAdmin && (
    <button
      className={styles.btnDelete}
      onClick={() => handleDelete(item)}
      title="Xóa nhà tài trợ"
    >
      <HiTrash size={16} />
    </button>
  )}

  const handleExport = async () => {
    try {
      // TODO: Call API export
      // const response = await api.get('/api/nha-tai-tro/export', {
      //   responseType: 'blob',
      // });
      // Download file...
    } catch (error) {
      console.error('Lỗi xuất danh sách:', error);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Xác nhận xóa nhà tài trợ "${item.ten_nha_tai_tro}"?`)) {
      return;
    }
    try {
      // TODO: Call API delete
      // await api.delete(`/api/nha-tai-tro/${item.nha_tai_tro_id}`);
      // Refresh list...
    } catch (error) {
      console.error('Lỗi xóa nhà tài trợ:', error);
    }
  };
};

NhaTaiTroPage.propTypes = {
  isAdmin: PropTypes.bool,
};
```

---

## 4. UserManagementPage - Quản lý người dùng

**Route:**
- Admin: `/admin/users`
- Cán bộ: `/can-bo/users`

**Khác biệt:**
- **Cán bộ**: Chỉ quản lý `role_id = 4` (sinh viên + nhà tài trợ)
- **Admin**: Quản lý tất cả role (1, 2, 3, 4), thấy cột Role, filter theo role, đổi role user

**Thay đổi cần thực hiện:**

### UserManagementPage.jsx
```jsx
import PropTypes from 'prop-types';

const UserManagementPage = ({ isAdmin = false }) => {
  // Thêm filter role chỉ khi isAdmin
  {isAdmin && (
    <Dropdown
      options={[
        { value: '', label: 'Tất cả vai trò' },
        { value: '1', label: 'Admin' },
        { value: '2', label: 'Kế toán' },
        { value: '3', label: 'Cán bộ Quỹ' },
        { value: '4', label: 'Người dùng' },
      ]}
      value={filterRole}
      onChange={setFilterRole}
      placeholder="Lọc theo vai trò"
    />
  )}

  // Fetch data với filter role
  const params = {
    page,
    limit: PAGE_SIZE,
    keyword: debouncedKeyword,
    role_id: isAdmin ? filterRole : '4', // ← Cán bộ chỉ xem role 4
  };

  // Thêm cột ROLE trong bảng chỉ khi isAdmin
  <thead>
    <tr>
      <th>STT</th>
      <th>HỌ TÊN</th>
      <th>MÃ SỐ</th>
      <th>EMAIL</th>
      {isAdmin && <th>VAI TRÒ</th>} {/* ← THÊM CỘT */}
      <th>TRẠNG THÁI</th>
      <th>THAO TÁC</th>
    </tr>
  </thead>

  // Trong tbody
  {isAdmin && (
    <td>
      <span className={styles.roleBadge}>
        {getRoleLabel(user.role_id)}
      </span>
    </td>
  )}

  // Thêm nút đổi role trong action column
  {isAdmin && (
    <button
      className={styles.btnChangeRole}
      onClick={() => handleChangeRole(user)}
      title="Đổi vai trò"
    >
      <HiUserGroup size={16} />
    </button>
  )}

  const handleChangeRole = async (user) => {
    // TODO: Show modal chọn role mới
    // TODO: Call API update role
  };

  const getRoleLabel = (roleId) => {
    const labels = {
      1: 'Admin',
      2: 'Kế toán',
      3: 'Cán bộ Quỹ',
      4: 'Người dùng',
    };
    return labels[roleId] || 'Không xác định';
  };
};

UserManagementPage.propTypes = {
  isAdmin: PropTypes.bool,
};
```

---

## Tóm tắt thay đổi App.jsx

```jsx
// Admin Routes (role_id = 1)
<Route path="/admin/xet-duyet" element={<XetDuyetPage isAdmin={true} />} />
<Route path="/admin/quy" element={<CanBoQuyListPage isAdmin={true} />} />
<Route path="/admin/quy/tao" element={<CanBoTaoQuyPage />} />
<Route path="/admin/nha-tai-tro" element={<CanBoNhaTaiTroPage isAdmin={true} />} />
<Route path="/admin/users" element={<CanBoUserManagementPage isAdmin={true} />} />
<Route path="/admin/khoan-tai-tro" element={<KeToanKhoanTaiTroPage />} />
<Route path="/admin/giao-dich" element={<KeToanLichSuGiaoDichPage />} />

// Cán bộ Routes (role_id = 3) - không truyền isAdmin
<Route path="/can-bo/xet-duyet" element={<XetDuyetPage />} />
<Route path="/can-bo/quy" element={<CanBoQuyListPage />} />
<Route path="/can-bo/nha-tai-tro" element={<CanBoNhaTaiTroPage />} />
<Route path="/can-bo/users" element={<CanBoUserManagementPage />} />
```

---

## Checklist Implementation

### XetDuyetPage
- [ ] Thêm PropTypes `isAdmin`
- [ ] Thay đổi TABS label dựa trên `isAdmin`
- [ ] Thay đổi `trangThaiParam` (Cho duyet vs Dang xu ly)
- [ ] Thêm filter `cap_do_duyet` trong API params

### QuyListPage
- [ ] Thêm PropTypes `isAdmin`
- [ ] Hiển thị nút "Tạo quỹ mới" chỉ khi `isAdmin`
- [ ] Truyền `isAdmin` vào QuyCard
- [ ] Thêm nút Xóa trong card chỉ khi `isAdmin`
- [ ] Thêm dropdown Đổi trạng thái chỉ khi `isAdmin`

### NhaTaiTroPage
- [ ] Thêm PropTypes `isAdmin`
- [ ] Thêm nút "Xuất danh sách" chỉ khi `isAdmin`
- [ ] Thêm nút Xóa trong action column chỉ khi `isAdmin`
- [ ] Implement `handleExport`
- [ ] Implement `handleDelete`

### UserManagementPage
- [ ] Thêm PropTypes `isAdmin`
- [ ] Thêm filter Role chỉ khi `isAdmin`
- [ ] Filter API theo `role_id` (4 cho cán bộ, all cho admin)
- [ ] Thêm cột VAI TRÒ chỉ khi `isAdmin`
- [ ] Thêm nút Đổi vai trò chỉ khi `isAdmin`
- [ ] Implement `handleChangeRole`

---

## Lưu ý quan trọng

1. **PropTypes**: Tất cả pages phải có PropTypes cho `isAdmin` với default = false
2. **Backward compatibility**: Khi không truyền `isAdmin`, page hoạt động như cũ (Cán bộ)
3. **API params**: Thêm filter params phù hợp để backend trả đúng data
4. **UI consistency**: Giữ nguyên design, chỉ thêm/ẩn elements dựa trên `isAdmin`
5. **Navigation**: Admin navigate đến `/admin/*`, Cán bộ navigate đến `/can-bo/*`
