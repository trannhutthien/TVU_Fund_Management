# KẾ HOẠCH CHỈNH SỬA CUỐI CÙNG — TVU Fund Management

> **Ngày kiểm tra:** 2026-07-14
> **Phạm vi:** Toàn bộ hệ thống (Backend, Frontend, Database)
> **Tổng số vấn đề:** 55+ issues (5 Critical, 11 High, 19 Medium, 12 Low)

---

## TỔNG QUAN VẤN ĐỀ THEO MỨC ĐỘ

| Mức Độ | Số Lượng | Mô Tả |
|--------|---------|-------|
| **CRITICAL** | 5 | Lỗ hổng bảo mật nghiêm trọng, có thể bị lợi dụng ngay |
| **HIGH** | 11 | Logic sai, thiếu auth, có thể gây mất dữ liệu |
| **MEDIUM** | 19 | Code quality, UX issues, performance |
| **LOW** | 12 | Minor improvements, code cleanup |

---

## PHASE 1: CRITICAL FIXES (Sửa ngay)

### C1. SQL Injection — `DonorModel.js`
- **Vấn đề:** Dòng 214 dùng template literal cho ORDER BY: `` `ORDER BY ${sortField} ${sortDirection}` ``
- **File:** `backend/models/donations/DonorModel.js:214`
- **Sửa:** Validate `sortField` và `sortDirection` bằng whitelist trước khi dùng trong query
```js
const allowedFields = ['hoten', 'ngaytao', 'tongdonggop'];
const allowedDirections = ['ASC', 'DESC'];
if (!allowedFields.includes(sortField)) sortField = 'hoten';
if (!allowedDirections.includes(sortDirection)) sortDirection = 'ASC';
```

### C2. XSS — News Content `dangerouslySetInnerHTML`
- **Vấn đề:** `NewsDetailPage.jsx:300` render HTML từ server không sanitize
- **File:** `frontend/src/pages/Public/NewsDetailPage/NewsDetailPage.jsx:300`
- **Sửa:** Cài DOMPurify, sanitize trước khi render
```js
import DOMPurify from 'dompurify';
// ...
dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(news.content) }}
```

### C3. XSS — Admin Activity Log
- **Vấn đề:** `AdminActivitySection/index.jsx:135` build HTML từ `log.mo_ta` không sanitize
- **File:** `frontend/src/pages/Staff/Admin/AdminDashboard/sections/AdminActivitySection/index.jsx:135`
- **Sửa:** Sanitize `mo_ta` trước khi dùng trong HTML string, hoặc dùng DOMPurify

### C4. Password Leaked in API Response — Guest Controller
- **Vấn đề:** `guestController.js` lines 608, 674 trả về mật khẩu trong response
- **File:** `backend/controllers/guest/guestController.js:608,674`
- **Sửa:** Không trả về `matkhau` trong response object, chỉ trả về `password_temp` (mật khẩu tạm thời shown 1 lần)

### C5. Báo cáo không cần Auth — `baoCaoRoutes.js`
- **Vấn đề:** `POST /api/bao-cao/xuat` không có `protect` middleware
- **File:** `backend/routes/reports/baoCaoRoutes.js:21`
- **Sửa:** Thêm `protect` middleware
```js
router.post('/xuat', protect, xuatBaoCao);
```

---

## PHASE 2: HIGH PRIORITY FIXES (Sửa trong tuần)

### H1. Frontend Không Có Route Guard Theo Vai Trò
- **Vấn đề:** `ProtectedRoute` chỉ check `isAuthenticated`, không check role. Sinh viên có thể truy cập `/admin/dashboard`
- **File:** `frontend/src/App.jsx:118-172`
- **Sửa:** Wrap staff routes với `RoleBasedRoute`:
```jsx
<Route element={<RoleBasedRoute allowedRoles={[1]} />}>
  <Route path="/admin/*" element={<AdminLayout />} />
</Route>
```

### H2. Role Constants Mismatch — Frontend
- **Vấn đề:** `usePermission.js` dùng string `'Admin'`, `'Student'` nhưng backend trả numeric `1`, `4`
- **File:** `frontend/src/hooks/usePermission.js:28-77`
- **Sửa:** Đồng bộ — thêm mapping:
```js
const ROLE_IDS = { ADMIN: 1, KE_TOAN: 2, CAN_BO: 3, SINH_VIEN: 4, BKS: 5 };
```

### H3. AI-Suggest Endpoint Không Có Auth
- **Vấn đề:** `POST /api/applications/ai-suggest` không có `protect` middleware
- **File:** `backend/routes/applications/applicationRoutes.js:21`
- **Sửa:** Thêm `protect` hoặc `optionalProtect` nếu muốn guest dùng được

### H4. Fake CAPTCHA — Client-Side Only
- **Vấn đề:** CAPTCHA chỉ là checkbox client-side, bot có thể bypass
- **File:** `frontend/src/pages/Public/ApplyPage/ApplyPage.jsx:1429-1445`
- **Sửa:** Tích hợp reCAPTCHA v3 hoặc最少也要 thêm server-side validation

### H5. Refresh Token Lưu trong localStorage
- **Vấn đề:** Refresh token lưu localStorage, XSS có thể đánh cắp
- **File:** `frontend/src/services/api.js:67`
- **Sửa:** Chuyển sang httpOnly cookie hoặc sessionStorage

### H6. React Hooks Violation — StaffSidebar
- **Vấn đề:** `useState`/`useEffect` được gọi SAU conditional return (line 213)
- **File:** `frontend/src/components/layout/StaffSidebar/StaffSidebar.jsx:213-217`
- **Sửa:** Move hooks lên TRƯỚC conditional return, hoặc tách thành child component

### H7. Unvalidated Enum — NghiemThuModel
- **Vấn đề:** `loaikiemtra` và `ketqua` không validate trước khi INSERT
- **File:** `backend/models/applications/NghiemThuModel.js`
- **Sửa:** Thêm validation:
```js
const validLoaiKiemTra = ['Kiem tra tien do', 'Nghiem thu cuoi cung'];
const validKetQua = ['Cho danh gia', 'Dat', 'Dat co dieu chinh', 'Khong dat'];
```

### H8. Sai Role ID — Application Routes
- **Vấn đề:** `authorizeRoles(2,3,4)` cho `POST /api/applications` — role 2 (Kế toán) không nên tạo đơn
- **File:** `backend/routes/applications/applicationRoutes.js:35`
- **Sửa:** `authorizeRoles(3,4)` hoặc `authorizeRoles(4)` tùy policy

### H9. Duplicate Auth State — AuthContext + Zustand
- **Vấn đề:** 2 hệ thống auth state song song (AuthContext + Zustand)
- **File:** `frontend/src/context/AuthContext.jsx` + `frontend/src/stores/authStore.js`
- **Sửa:** Loại bỏ AuthContext, chỉ dùng Zustand

### H10. Duplicate INSERT — SQL Dump
- **Vấn đề:** `tvu_fund_management.sql` có duplicate INSERT statements cho `nguoidung`
- **File:** `docs/database/tvu_fund_management.sql`
- **Sửa:** Loại bỏ duplicate rows, chạy lại dump sạch

### H11. `giaodich.loaigiaodich` Enum 'Thu hoi no' Not Handled
- **Vấn đề:** TransactionModel không xử lý enum value `'Thu hoi no'`
- **File:** `backend/models/transactions/TransactionModel.js`
- **Sửa:** Thêm handling cho 'Thu hoi no' trong mapping functions

---

## PHASE 3: MEDIUM PRIORITY FIXES (Sửa trong tháng)

### M1. Duplicate `useAuth` Hook
- **Vấn đề:** 2 file `useAuth.js` và `AuthContext.jsx` export cùng tên
- **Sửa:** Loại bỏ `hooks/useAuth.js`, dùng từ `context/AuthContext` hoặc zustand

### M2. Inconsistent Role Field Naming
- **Vấn đề:** `vaiTro` vs `VaiTro` vs `role_id` vs `roleId` — 4 cách viết khác nhau
- **Sửa:** Backend luôn trả `vaiTro` (camelCase), frontend dùng `user.vaiTro` everywhere

### M3. No CSRF Protection
- **Vấn đề:** Axios không gửi CSRF token header
- **Sửa:** Thêm CSRF token header nếu backend dùng cookie-based sessions

### M4. File Upload No Client-Side Validation
- **Vấn đề:** `uploadService.js` không validate file size/type trước khi upload
- **Sửa:** Thêm validation trong service methods

### M5. Google OAuth Tokens in URL Query
- **Vấn đề:** Access/refresh tokens nằm trong URL query params
- **Sửa:** Chuyển sang fragment (#) hoặc POST-based flow

### M6. Admin Dashboard useEffect Cleanup
- **Vấn đề:** Không có cleanup function, có thể gây memory leak
- **Sửa:** Thêm `let mounted = true` pattern

### M7. ProtectedRoute Không Check Token Expiry
- **Vấn đề:** Token hết hạn vẫn truy cập được cho đến khi interval 60s check
- **Sửa:** Gọi `checkTokenExpiry()` trong ProtectedRoute

### M8. Refresh Token Race Condition
- **Vấn đề:** Nhiều API call 401 cùng lúc đều cố refresh token
- **Sửa:** Implement token refresh mutex/queue

### M9. Missing Indexes
- **Vấn đề:** `nguoidung.email`, `yeucauhotro.trangthai`, `phanbongansach.trangthai` thiếu index
- **Sửa:** Thêm indexes cho các cột query thường xuyên

### M10. Unused `pheduyet` Enum 'Duyet'
- **Vấn đề:** Enum có 'Duyet' nhưng code chỉ dùng 'Da duyet'
- **Sửa:** Xác nhận và loại bỏ giá trị không dùng

### M11. `danhgia` Table Corrupt
- **Vấn đề:** Bảng corrupt, không thể query
- **Sửa:** Repair table hoặc recreate từ scratch

### M12. Hardcoded API URL Fallback
- **Vấn đề:** Fallback `http://localhost:5001/api` khi thiếu env var
- **Sửa:** Throw error nếu env var missing trong production

### M13. Console.error Leaking to Production
- **Vấn đề:** 182+ console.error/log statements
- **Sửa:** Strip console statements trong production builds

### M14. handleSaveDraft No-Op
- **Vấn đề:** Button "Lưu nháp" không làm gì
- **Sửa:** Implement API hoặc ẩn button

### M15. OTP Input Not Sanitized
- **Vấn đề:** TrackPage OTP không filter non-digits
- **Sửa:** Thêm `.replace(/\D/g, '')`

### M16. `page_permissions.json` cho BKS
- **Vấn đề:** BKS có quyền xem `nhat_ky`, `phe_duyet`, `phu_hop` chưa?
- **Sửa:** Review và cập nhật permissions cho role 5

### M17. Missing Foreign Keys
- **Vấn đề:** Một số bảng thiếu FK constraints
- **Sửa:** Thêm FK cho `phanbongansach`, `nghiemthu`, `chucvuquy`

### M18. User Object Inconsistency
- **Vấn đề:** `XetDuyetDetail.jsx` dùng 4 fallback paths cho role field
- **Sửa:** Standardize user object shape từ backend

### M19. Duplicate User Models
- **Vấn đề:** `UserModel.js` và `NguoiDungModel.js` có chức năng trùng lặp
- **Sửa:** Gộp hoặc tách rõ ràng responsibility

---

## PHASE 4: LOW PRIORITY FIXES (Khi có thời gian)

### L1. Full Page Reload on Logout
- **Sửa:** Dùng `navigate('/')` thay vì `window.location.href`

### L2. Missing `ngaycapnhat` on `donvihoc`
- **Sửa:** ALTER TABLE thêm cột `ngaycapnhat`

### L3. Unused Enum Values
- **Sửa:** Review và clean up unused enum values trong DB

### L4. Code Deduplication
- **Sửa:** Gộp các helper functions trùng lặp (toDbAccountType ở nhiều models)

### L5. Performance — Lazy Loading
- **Sửa:** Thêm React.lazy() cho các route lớn

### L6. Error Response Format Consistency
- **Sửa:** Standardize error response format `{ success, message, data }`

### L7. Missing `hopdongvayvon`/`lichtrano` Data
- **Sửa:** Tạo sample data cho loan workflow

### L8. Audit Log Middleware — Skip Routes
- **Sửa:** Review skip list, thêm các route cần skip

### L9. Rate Limiter — Per-User
- **Sửa:** Nâng cấp từ per-IP sang per-user rate limiting

### L10. Mobile Responsive
- **Sửa:** Review và tối ưu UI cho mobile

### L11. PWA Support
- **Sửa:** Thêm service worker cho trải nghiệm app-like

### L12. Documentation Updates
- **Sửa:** Cập nhật TongQuan.md sau khi sửa xong

---

## THỨ TỰ THỰC HIỆN

```
Tuần 1:  Phase 1 (C1-C5) — Critical fixes
Tuần 2:  Phase 2 (H1-H8) — High priority
Tuần 3:  Phase 2 (H9-H11) + Phase 3 (M1-M8)
Tuần 4:  Phase 3 (M9-M19)
Khi cóTG: Phase 4 (L1-L12)
```

---

## KIỂM TRA SAU MỖI PHASE

```bash
# Backend load test
cd backend && node -e "
  const modules = [
    './controllers/reports/statisticsController',
    './controllers/applications/applicationController',
    './controllers/funds/fundController',
    './controllers/donations/donationController',
    './controllers/transactions/transactionController',
    './controllers/system/chucVuController',
    './controllers/guest/guestController',
    './models/donations/DonorModel',
    './models/applications/NghiemThuModel'
  ];
  modules.forEach(m => { try { require(m); } catch(e) { console.error('FAIL:', m, e.message); } });
  console.log('Module load check complete');
"

# Frontend build test
cd frontend && npm run build

# Database consistency check
cd docs/database && C:\xampp\mysql\bin\mysql.exe -u root tvu_fund_management -e "SHOW TABLES; SELECT COUNT(*) FROM vaitro; SELECT COUNT(*) FROM nguoidung;"
```

---

*Cập nhật: 2026-07-14*
