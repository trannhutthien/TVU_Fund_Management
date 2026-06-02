# Phân Quyền Xem Khoản Tài Trợ Theo Vai Trò

## Yêu cầu

Phân quyền xem khoản tài trợ trong tab "Cần xác nhận":
- **Kế toán (Role 2)**: Xem khoản có trạng thái `Cho duyet` (để duyệt)
- **Admin (Role 1)**: Xem khoản có trạng thái `Da duyet` (đã được duyệt)

## Thay đổi

### File: `frontend/src/pages/Staff/KeToan/KhoanTaiTroPage/KhoanTaiTroPage.jsx`

#### 1. Thêm import `useAuth`

```javascript
import { useAuth } from '@context/AuthContext';
```

#### 2. Lấy thông tin user và vai trò

```javascript
const KhoanTaiTroPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.vaiTro === 1;
  const isKeToan = user?.vaiTro === 2;
  // ...
};
```

#### 3. Sửa logic `fetchData` để phân quyền

```javascript
const fetchData = useCallback(async () => {
  setLoading(true);
  try {
    // ✅ Phân quyền theo vai trò:
    // - Kế toán (role 2): Tab "Cần xác nhận" lấy 'Cho duyet'
    // - Admin (role 1): Tab "Cần xác nhận" lấy 'Da duyet'
    let trangThaiQuery = filters.trang_thai;
    
    if (activeTab === 'can_xac_nhan') {
      if (isKeToan) {
        trangThaiQuery = 'Cho duyet'; // Kế toán duyệt khoản chờ duyệt
      } else if (isAdmin) {
        trangThaiQuery = 'Da duyet'; // Admin xem khoản đã duyệt
      }
    }

    const res = await getDonations({
      keyword: debouncedKeyword,
      quy_id: filters.quy_id,
      loai_ntt: filters.loai_ntt,
      trang_thai: trangThaiQuery,
      tu_ngay: filters.tu_ngay,
      den_ngay: filters.den_ngay,
      page,
      page_size: PAGE_SIZE,
    });
    setData(res?.data || []);
    setTotal(res?.pagination?.total || 0);
  } catch (e) {
    console.error('Lỗi tải danh sách khoản tài trợ:', e);
    setData([]);
    setTotal(0);
  } finally {
    setLoading(false);
  }
}, [activeTab, debouncedKeyword, filters, page, isKeToan, isAdmin]);
```

## Luồng hoạt động

### Kế toán (Role 2)

```
1. Đăng nhập với tài khoản Kế toán
   ↓
2. Vào trang "Khoản tài trợ"
   ↓
3. Tab "Cần xác nhận":
   - Hiển thị khoản có trang_thai = 'Cho duyet' ✅
   - Đây là khoản nhà tài trợ vừa tạo, chờ Kế toán duyệt
   ↓
4. Click "Duyệt" → Trạng thái đổi thành 'Da duyet'
   ↓
5. Khoản biến mất khỏi tab "Cần xác nhận" (vì đã duyệt)
```

### Admin (Role 1)

```
1. Đăng nhập với tài khoản Admin
   ↓
2. Vào trang "Khoản tài trợ"
   ↓
3. Tab "Cần xác nhận":
   - Hiển thị khoản có trang_thai = 'Da duyet' ✅
   - Đây là khoản Kế toán đã duyệt
   ↓
4. Admin xem để kiểm tra, theo dõi
```

## So sánh trước và sau

### Trước (SAI)

```javascript
// ❌ Tất cả vai trò đều xem 'Da duyet'
const trangThaiQuery = activeTab === 'can_xac_nhan' ? 'Da duyet' : filters.trang_thai;
```

**Vấn đề**:
- Kế toán không thấy khoản `Cho duyet` để duyệt
- Kế toán thấy khoản `Da duyet` (đã duyệt rồi, không cần duyệt nữa)

### Sau (ĐÚNG)

```javascript
// ✅ Phân quyền theo vai trò
let trangThaiQuery = filters.trang_thai;

if (activeTab === 'can_xac_nhan') {
  if (isKeToan) {
    trangThaiQuery = 'Cho duyet'; // Kế toán duyệt khoản chờ duyệt
  } else if (isAdmin) {
    trangThaiQuery = 'Da duyet'; // Admin xem khoản đã duyệt
  }
}
```

**Kết quả**:
- ✅ Kế toán thấy khoản `Cho duyet` (chờ duyệt)
- ✅ Admin thấy khoản `Da duyet` (đã duyệt)
- ✅ Mỗi vai trò thấy đúng khoản cần xử lý

## Tab "Tất cả khoản tài trợ"

Tab này **KHÔNG thay đổi** - vẫn hiển thị tất cả khoản tài trợ với filter tùy chọn.

```javascript
if (activeTab === 'tat_ca') {
  // Dùng filter.trang_thai do user chọn
  trangThaiQuery = filters.trang_thai;
}
```

## Testing

### Test Case 1: Kế toán xem tab "Cần xác nhận"

1. Đăng nhập với tài khoản Kế toán (role 2)
2. Vào trang "Khoản tài trợ"
3. Click tab "Cần xác nhận"
4. **Expected**: Chỉ hiển thị khoản có trạng thái `Cho duyet`

### Test Case 2: Admin xem tab "Cần xác nhận"

1. Đăng nhập với tài khoản Admin (role 1)
2. Vào trang "Khoản tài trợ"
3. Click tab "Cần xác nhận"
4. **Expected**: Chỉ hiển thị khoản có trạng thái `Da duyet`

### Test Case 3: Luồng đầy đủ

1. Nhà tài trợ tạo khoản tài trợ → Trạng thái `Cho duyet`
2. Kế toán vào tab "Cần xác nhận" → Thấy khoản này
3. Kế toán duyệt → Trạng thái đổi thành `Da duyet`
4. Khoản biến mất khỏi tab "Cần xác nhận" của Kế toán
5. Admin vào tab "Cần xác nhận" → Thấy khoản này (đã duyệt)

## Files Changed

- ✅ `frontend/src/pages/Staff/KeToan/KhoanTaiTroPage/KhoanTaiTroPage.jsx`

## Notes

- Trang này được dùng chung bởi cả Kế toán và Admin (theo App.jsx)
- Logic phân quyền dựa trên `user.vaiTro` từ AuthContext
- Tab "Tất cả khoản tài trợ" không bị ảnh hưởng - vẫn cho phép filter tùy ý
