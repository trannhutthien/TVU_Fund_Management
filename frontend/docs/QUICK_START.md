# ⚡ Quick Start - Frontend Setup

## 🚀 Cài Đặt Nhanh (5 phút)

### Bước 1: Cài Dependencies
```bash
cd frontend
npm install
npm install zustand
```

### Bước 2: Tạo File .env
```bash
cp .env.example .env
```

Chỉnh sửa `.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Bước 3: Chạy Dev Server
```bash
npm run dev
```

Mở browser: **http://localhost:3000**

---

## ✅ Kiểm Tra Setup

### 1. Dev server chạy thành công?
- ✅ Không có lỗi trong terminal
- ✅ Browser mở tự động
- ✅ Không có lỗi trong console

### 2. Path aliases hoạt động?
Tạo file test: `src/test.js`
```js
import useAuthStore from '@stores/authStore';
console.log('Path aliases working!', useAuthStore);
```

Import trong `App.jsx`:
```js
import './test.js';
```

Kiểm tra console → Nếu thấy log → ✅ Path aliases OK

### 3. SCSS hoạt động?
Tạo file: `src/test.scss`
```scss
@import '@styles/_variables.scss';

.test {
  color: var(--color-primary);
}
```

Import trong `App.jsx`:
```js
import './test.scss';
```

Thêm vào JSX:
```jsx
<div className="test">Test SCSS</div>
```

Kiểm tra → Nếu text có màu → ✅ SCSS OK

---

## 📁 Cấu Trúc Đã Có

```
frontend/
├── src/
│   ├── assets/          ✅ Static files
│   ├── components/      ✅ Components
│   ├── pages/           ✅ Pages
│   ├── services/        ✅ API services
│   ├── stores/          ✅ Zustand stores (NEW)
│   ├── hooks/           ✅ Custom hooks
│   ├── routes/          ✅ Routes (NEW)
│   ├── constants/       ✅ Constants
│   ├── utils/           ✅ Utils
│   ├── styles/          ✅ SCSS
│   ├── config/          ✅ Config (NEW)
│   ├── App.jsx
│   └── main.jsx
├── .env                 ✅ Environment variables
├── vite.config.js       ✅ Vite config
└── package.json         ✅ Dependencies
```

---

## 🎯 Bước Tiếp Theo

### Option 1: Xây dựng từng bước (Recommended)
Đọc: **[NEXT_STEPS.md](./NEXT_STEPS.md)**

Bắt đầu với:
1. Layout components (Header, Sidebar, Footer)
2. Login page
3. Routing
4. Dashboard

### Option 2: Hiểu rõ tools
Đọc: **[TOOLS_EXPLANATION.md](./TOOLS_EXPLANATION.md)**

Tìm hiểu tại sao chọn:
- React + Vite
- Zustand + React Query
- React Hook Form + Yup
- Ant Design + SCSS

### Option 3: Xem cấu trúc chi tiết
Đọc: **[FRONTEND_STRUCTURE.md](./FRONTEND_STRUCTURE.md)**

### Option 4: Follow checklist
Đọc: **[CHECKLIST.md](./CHECKLIST.md)**

---

## 🛠️ Commands Hữu Ích

```bash
# Development
npm run dev              # Start dev server

# Production
npm run build            # Build for production
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint

# Dependencies
npm install <package>    # Install package
npm update               # Update packages
npm outdated             # Check outdated packages
```

---

## 🐛 Troubleshooting

### Lỗi: "Cannot find module '@components/...'"
```bash
# Restart dev server
Ctrl + C
npm run dev
```

### Lỗi: "Port 3000 already in use"
Chỉnh sửa `vite.config.js`:
```js
server: {
  port: 3001, // Đổi port
}
```

### Lỗi: "SCSS variables not found"
Kiểm tra `vite.config.js` có config SCSS:
```js
css: {
  preprocessorOptions: {
    scss: {
      additionalData: `
        @import "@styles/_variables.scss";
        @import "@styles/_mixins.scss";
      `,
    },
  },
},
```

### Lỗi: "API connection failed"
1. Kiểm tra backend đang chạy
2. Kiểm tra `.env` có đúng URL không
3. Kiểm tra proxy trong `vite.config.js`

---

## 📚 Tài Liệu

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Hướng dẫn chi tiết
- **[NEXT_STEPS.md](./NEXT_STEPS.md)** - Các bước tiếp theo
- **[TOOLS_EXPLANATION.md](./TOOLS_EXPLANATION.md)** - Giải thích tools
- **[FRONTEND_STRUCTURE.md](./FRONTEND_STRUCTURE.md)** - Cấu trúc dự án
- **[CHECKLIST.md](./CHECKLIST.md)** - Checklist phát triển

---

## 💡 Tips

1. **Đọc docs** của các libraries khi cần
2. **Commit thường xuyên** với Git
3. **Test với backend** sớm
4. **Làm từng module** một lần
5. **Tái sử dụng components** càng nhiều càng tốt

---

## 🎓 Learning Resources

### React
- [React Docs](https://react.dev/)
- [React Tutorial](https://react.dev/learn)

### Vite
- [Vite Guide](https://vitejs.dev/guide/)

### Zustand
- [Zustand Docs](https://zustand-demo.pmnd.rs/)

### React Query
- [React Query Tutorial](https://tanstack.com/query/latest/docs/react/overview)

### React Hook Form
- [React Hook Form Docs](https://react-hook-form.com/get-started)

### Ant Design
- [Ant Design Components](https://ant.design/components/overview/)

---

## 🎯 Mục Tiêu Tuần Này

- [ ] Setup hoàn tất
- [ ] Tạo Layout components
- [ ] Tạo Login page
- [ ] Setup routing
- [ ] Tạo 1 dashboard đơn giản

---

**Bắt đầu code ngay! 🚀**

Nếu gặp vấn đề, hãy:
1. Đọc error message kỹ
2. Google error message
3. Kiểm tra docs
4. Hỏi AI assistant 😊
