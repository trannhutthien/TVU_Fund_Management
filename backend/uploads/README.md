# Uploads Folder Structure

## Cấu trúc thư mục

```
uploads/
├── avatars/
│   ├── donor/          # Avatar của nhà tài trợ
│   │   ├── vingroup.jpg
│   │   ├── vinamilk.jpg
│   │   └── ...
│   ├── fund/           # Ảnh banner/cover của quỹ
│   │   └── (fund images)
│   └── (user avatars)  # Avatar của người dùng (user, admin, sinh viên)
├── documents/          # Tài liệu đính kèm
└── proofs/             # Minh chứng (proof of donation, etc.)
```

## Quy tắc đặt tên file

### Donor Avatars (`avatars/donor/`)
- Format: `{donor_name}.jpg|png|jpeg`
- Ví dụ: `vingroup.jpg`, `vinamilk.png`
- Lưu trong database: `vingroup.jpg` (chỉ tên file)
- URL trả về: `http://localhost:5001/uploads/avatars/donor/vingroup.jpg`

### Fund Images (`avatars/fund/`)
- Format: `{fund_id}_{timestamp}.jpg|png|jpeg`
- Ví dụ: `1_1705123456789.jpg`, `2_scholarship.png`
- Lưu trong database: `1_1705123456789.jpg` (chỉ tên file)
- URL trả về: `http://localhost:5001/uploads/avatars/fund/1_1705123456789.jpg`

### User Avatars (`avatars/`)
- Format: `{user_id}_{timestamp}.jpg|png|jpeg`
- Ví dụ: `123_1705123456789.jpg`
- Lưu trong database: `123_1705123456789.jpg` (chỉ tên file)
- URL trả về: `http://localhost:5001/uploads/avatars/123_1705123456789.jpg`

## Sử dụng Image Helper

### Backend

```javascript
import { 
  buildDonorAvatarUrl, 
  buildFundImageUrl, 
  buildUserAvatarUrl 
} from '../utils/imageHelper.js';

// Donor avatar
const donorAvatar = buildDonorAvatarUrl('vingroup.jpg');
// → http://localhost:5001/uploads/avatars/donor/vingroup.jpg

// Fund image
const fundImage = buildFundImageUrl('1_scholarship.jpg');
// → http://localhost:5001/uploads/avatars/fund/1_scholarship.jpg

// User avatar
const userAvatar = buildUserAvatarUrl('123_avatar.jpg');
// → http://localhost:5001/uploads/avatars/123_avatar.jpg
```

### Database

Trong database, chỉ lưu **tên file**, không lưu full path:

```sql
-- Bảng NhaTaiTro
UPDATE NhaTaiTro SET avatar = 'vingroup.jpg' WHERE nha_tai_tro_id = 1;

-- Bảng Quy
UPDATE Quy SET hinh_anh = '1_scholarship.jpg' WHERE quy_id = 1;

-- Bảng NguoiDung
UPDATE NguoiDung SET avatar = '123_avatar.jpg' WHERE user_id = 123;
```

### Frontend

Frontend nhận full URL từ API, sử dụng trực tiếp:

```jsx
// Fund card
<img src={fund.hinhAnh} alt={fund.tenQuy} />
// hinhAnh = "http://localhost:5001/uploads/avatars/fund/1_scholarship.jpg"

// Donor avatar
<img src={donor.avatar} alt={donor.name} />
// avatar = "http://localhost:5001/uploads/avatars/donor/vingroup.jpg"
```

## Upload File Mới

### 1. Upload Donor Avatar

```javascript
// Multer config
const donorStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/avatars/donor/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.body.name}${ext}`);
  }
});
```

### 2. Upload Fund Image

```javascript
const fundStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/avatars/fund/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${req.params.fundId}_${Date.now()}${ext}`;
    cb(null, filename);
  }
});
```

### 3. Upload User Avatar

```javascript
const userStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/avatars/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${req.user.userId}_${Date.now()}${ext}`;
    cb(null, filename);
  }
});
```

## Serve Static Files

Trong `server.js`:

```javascript
// Serve static files từ thư mục uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
```

Điều này cho phép truy cập:
- `http://localhost:5001/uploads/avatars/donor/vingroup.jpg`
- `http://localhost:5001/uploads/avatars/fund/1_scholarship.jpg`
- `http://localhost:5001/uploads/avatars/123_avatar.jpg`

## Migration từ cấu trúc cũ

Nếu database có path cũ dạng `uploads/avatars/vingroup.jpg`, helper sẽ tự động xử lý:

```javascript
buildDonorAvatarUrl('uploads/avatars/vingroup.jpg')
// → http://localhost:5001/uploads/avatars/vingroup.jpg (giữ nguyên)

buildDonorAvatarUrl('vingroup.jpg')
// → http://localhost:5001/uploads/avatars/donor/vingroup.jpg (thêm /donor/)
```

## Checklist

- [x] Tạo thư mục `uploads/avatars/donor/`
- [x] Tạo thư mục `uploads/avatars/fund/`
- [x] Di chuyển donor avatars vào `donor/`
- [x] Tạo `imageHelper.js` với các helper functions
- [x] Cập nhật `fundController.js` để dùng `buildFundImageUrl()`
- [x] Cập nhật `donorController.js` để dùng `buildDonorAvatarUrl()`
- [x] Cập nhật `userController.js` để dùng `buildUserAvatarUrl()`
- [x] Cập nhật `authController.js` để dùng `buildUserAvatarUrl()`
- [ ] Test API `/api/funds/public` trả về đúng URL
- [ ] Test API `/api/donors` trả về đúng URL
- [ ] Frontend hiển thị ảnh đúng
