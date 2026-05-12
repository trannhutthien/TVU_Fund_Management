# 🚀 BẮT ĐẦU NGAY - 3 BƯỚC ĐƠN GIẢN

## ⚡ Bước 1: Cài Đặt (2 phút)

Mở terminal và chạy:

```bash
cd frontend
npm install
npm install zustand
```

Đợi cài đặt xong...

---

## ⚙️ Bước 2: Cấu Hình (1 phút)

### Tạo file .env:
```bash
cp .env.example .env
```

### Mở file `.env` và chỉnh sửa:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

**Lưu ý:** Đảm bảo URL trỏ đúng địa chỉ backend của bạn!

---

## 🎮 Bước 3: Chạy (30 giây)

```bash
npm run dev
```

Mở browser tại: **http://localhost:3000**

---

## ✅ Kiểm Tra Nhanh

### 1. Terminal không có lỗi?
✅ Thấy: `Local: http://localhost:3000`

### 2. Browser mở được?
✅ Thấy trang React

### 3. Console không có lỗi?
✅ Mở DevTools (F12) → Console → Không có lỗi đỏ

---

## 🎯 Xong! Bây Giờ Làm Gì?

### Option 1: Xem Roadmap Chi Tiết
👉 Đọc: **[NEXT_STEPS.md](./NEXT_STEPS.md)**

Bắt đầu xây dựng:
1. Layout (Header, Sidebar, Footer)
2. Login page
3. Dashboard

### Option 2: Hiểu Tại Sao Chọn Tools Này
👉 Đọc: **[TOOLS_EXPLANATION.md](./TOOLS_EXPLANATION.md)**

Tìm hiểu:
- Tại sao dùng Vite thay vì Create React App?
- Tại sao dùng Zustand thay vì Redux?
- Tại sao dùng React Query?

### Option 3: Xem Cấu Trúc Dự Án
👉 Đọc: **[FRONTEND_STRUCTURE.md](./FRONTEND_STRUCTURE.md)**

### Option 4: Follow Checklist
👉 Đọc: **[CHECKLIST.md](./CHECKLIST.md)**

---

## 📁 Cấu Trúc Quan Trọng

```
frontend/src/
├── components/      ← Tạo components ở đây
├── pages/           ← Tạo pages ở đây
├── services/        ← API calls ở đây
├── stores/          ← Zustand stores (auth, UI)
├── hooks/           ← Custom hooks
├── routes/          ← Route config
├── styles/          ← SCSS files
└── config/          ← App config
```

---

## 🛠️ Commands Hay Dùng

```bash
# Chạy dev server
npm run dev

# Build production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

---

## 🐛 Gặp Lỗi?

### Lỗi: "Cannot find module '@components/...'"
```bash
# Restart lại dev server
Ctrl + C
npm run dev
```

### Lỗi: "Port 3000 đã được sử dụng"
Sửa file `vite.config.js`:
```js
server: {
  port: 3001, // Đổi port khác
}
```

### Lỗi: "API connection failed"
1. Kiểm tra backend có đang chạy không?
2. Kiểm tra file `.env` có đúng URL không?

---

## 💡 Tips Quan Trọng

### 1. Sử dụng Path Aliases
Thay vì:
```js
import Button from '../../../components/common/Button';
```

Dùng:
```js
import Button from '@components/common/Button';
```

### 2. Sử dụng React Query cho API calls
Thay vì:
```js
const [data, setData] = useState(null);
useEffect(() => {
  fetch('/api/users').then(res => setData(res));
}, []);
```

Dùng:
```js
const { data } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
});
```

### 3. Sử dụng Zustand cho Global State
```js
import useAuthStore from '@stores/authStore';

const { user, login, logout } = useAuthStore();
```

### 4. Sử dụng React Hook Form cho Forms
```js
const { register, handleSubmit } = useForm();
```

---

## 📚 Tài Liệu Đầy Đủ

Tất cả tài liệu đã được tạo sẵn:

1. **[QUICK_START.md](./QUICK_START.md)** - Cài đặt nhanh
2. **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Hướng dẫn chi tiết
3. **[NEXT_STEPS.md](./NEXT_STEPS.md)** - Các bước tiếp theo
4. **[FRONTEND_STRUCTURE.md](./FRONTEND_STRUCTURE.md)** - Cấu trúc
5. **[TOOLS_EXPLANATION.md](./TOOLS_EXPLANATION.md)** - Giải thích tools
6. **[CHECKLIST.md](./CHECKLIST.md)** - Checklist
7. **[INDEX.md](./INDEX.md)** - Tổng hợp
8. **[SUMMARY.md](./SUMMARY.md)** - Tóm tắt

---

## 🎯 Mục Tiêu Tuần Này

- [x] Setup project ✅
- [ ] Tạo Layout components
- [ ] Tạo Login page
- [ ] Setup routing
- [ ] Tạo 1 dashboard

---

## 🎓 Học Gì Trước?

### Nếu chưa biết React:
1. [React Tutorial](https://react.dev/learn)
2. Học về: Components, Props, State, Hooks

### Nếu đã biết React:
1. Đọc docs của các libraries:
   - [Zustand](https://zustand-demo.pmnd.rs/)
   - [React Query](https://tanstack.com/query/latest)
   - [React Hook Form](https://react-hook-form.com/)
   - [Ant Design](https://ant.design/)

---

## 🚀 Bắt Đầu Code!

**Bước tiếp theo:**
1. Mở VS Code
2. Mở thư mục `frontend/src`
3. Bắt đầu với `components/layout/Header.jsx`
4. Follow [NEXT_STEPS.md](./NEXT_STEPS.md)

---

## 💬 Cần Giúp Đỡ?

1. Đọc error message kỹ
2. Google error message
3. Kiểm tra docs của library
4. Hỏi AI assistant
5. Kiểm tra [SETUP_GUIDE.md#troubleshooting](./SETUP_GUIDE.md#troubleshooting)

---

**Chúc bạn code vui vẻ! 🎉**

*P/S: Nhớ commit code thường xuyên với Git!*

```bash
git add .
git commit -m "Setup frontend structure"
git push
```
