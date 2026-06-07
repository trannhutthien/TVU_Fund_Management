# Hướng Dẫn Tích Hợp Trợ Lý AI Gợi Ý Viết Đơn Hỗ Trợ (Gemini API)

Tài liệu này hướng dẫn cách cấu hình, vận hành và mô tả chi tiết luồng hoạt động của tính năng trợ lý AI hỗ trợ sinh viên viết đơn đề nghị từ các Quỹ hỗ trợ của trường Đại học Trà Vinh (TVU).

---

## 1. Sơ Đồ Luồng Hoạt Động Hoàn Chỉnh

Dưới đây là sơ đồ tuần tự thể hiện sự tương tác giữa Sinh viên (Frontend), Máy chủ ứng dụng (Backend), Cơ sở dữ liệu (MySQL) và Google Gemini API:

```mermaid
sequenceDiagram
    autonumber
    actor SV as Sinh viên
    participant FE as React Frontend
    participant BE as Express Backend
    database DB as MySQL Database
    participant AI as Google Gemini API

    Note over SV, FE: Kịch bản 1: Sinh viên đang viết và cần AI Phân tích/Tối ưu
    SV->>FE: Gõ nội dung lý do (> 10 ký tự)
    Note over FE: Chờ người dùng dừng gõ 1.5s (Debounce)
    FE->>BE: POST /api/applications/ai-suggest<br/>{ quyId, action: "analyze", moTa, tieuDe }
    BE->>DB: Lấy thông tin Quỹ (FundModel.getFundById)<br/>sử dụng đúng tên cột: ten_quy, mo_ta, dieu_kien_tom_tat
    DB-->>BE: Trả về thông tin Quỹ
    BE->>AI: Gửi Prompt phân tích (Context: Tên quỹ & Tiêu chí)
    AI-->>BE: Trả về đánh giá JSON dạng:<br/>{ danhGia, diemManh, diemYeu, goiY }
    BE-->>FE: Phản hồi JSON kết quả phân tích
    FE-->>SV: Hiển thị Đánh giá chung, Ưu/Nhược điểm và Gợi ý cải thiện

    Note over SV, FE: Kịch bản 2: Sinh viên muốn tối ưu hóa hoặc tự soạn đơn
    SV->>FE: Nhấn nút "Tối ưu đơn với AI"<br/>hoặc viết ý chính và nhấn "Tự soạn đơn bằng AI"
    FE->>BE: POST /api/applications/ai-suggest<br/>{ quyId, action: "optimize" | "draft", moTa, tieuDe }
    BE->>DB: Lấy thông tin Quỹ
    DB-->>BE: Trả về thông tin Quỹ
    BE->>AI: Gửi Prompt tối ưu/soạn thảo tương ứng
    AI-->>BE: Trả về nội dung đơn đã được chau chuốt
    BE-->>FE: Trả về văn bản đơn đề nghị hoàn chỉnh
    FE-->>SV: Hiển thị Modal xem trước đơn do AI viết
    SV->>FE: Click "Sử dụng nội dung này"
    FE->>FE: Tự động ghi đè nội dung đơn vào ô nhập chính
```

---

## 2. Hướng Dẫn Cấu Hình Hệ Thống

Để tính năng AI hoạt động, bạn cần cấu hình khóa API cho Google Gemini theo các bước sau:

### Bước 2.1: Đăng ký lấy API Key miễn phí
1. Truy cập vào **[Google AI Studio](https://aistudio.google.com/)**.
2. Đăng nhập bằng tài khoản Google bất kỳ.
3. Nhấn vào nút **"Get API key"** ở góc trên cùng bên trái.
4. Chọn **"Create API key"** -> Tạo khóa mới (chọn dự án có sẵn hoặc tạo mới).
5. Copy khóa API vừa tạo (có dạng `AIzaSy...`).

### Bước 2.2: Cấu hình biến môi trường trên Backend
Mở file [backend/.env](file:///d:/TotNghiep/TVUDevelopmentFundManager/TVU_Fund_Management/backend/.env) và dán khóa API vừa copy vào dòng cuối cùng:

```env
# Google Gemini AI Config
GEMINI_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxx
```

> [!NOTE]
> Mặc định, nếu bạn không cấu hình khóa này, hệ thống sẽ trả về mã lỗi `500` kèm thông báo: *"Chưa cấu hình GEMINI_API_KEY trong file .env hoặc đang sử dụng giá trị mặc định."* để lập trình viên dễ dàng nhận biết.

---

## 3. Các Endpoint API Chi Tiết

Tất cả các tính năng AI đều sử dụng chung một endpoint duy nhất với các phương thức truyền tải dữ liệu linh hoạt:

- **Endpoint**: `POST /api/applications/ai-suggest`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_Token>`
- **Phân quyền**: Chỉ tài khoản thuộc vai trò **Sinh viên (role_id = 4)** mới có quyền truy cập.

### Chi tiết các Action:

#### 1. Phân tích văn bản (`action: "analyze"`)
- **Yêu cầu (Body)**:
  ```json
  {
    "quyId": 1,
    "action": "analyze",
    "moTa": "Em muốn xin tiền đóng học phí vì hoàn cảnh khó khăn.",
    "tieuDe": "Đơn đề xuất hỗ trợ học phí"
  }
  ```
- **Phản hồi (Response)**:
  ```json
  {
    "success": true,
    "data": {
      "danhGia": "Đoạn văn ngắn gọn, trực diện nhưng thiếu tính thuyết phục.",
      "diemManh": "Nêu rõ được mục tiêu xin hỗ trợ.",
      "diemYeu": "Chưa mô tả rõ hoàn cảnh gia đình cụ thể.",
      "goiY": "Nên bổ sung thêm thông tin về nghề nghiệp của bố mẹ và số tiền học phí cụ thể."
    }
  }
  ```

#### 2. Tối ưu văn phong (`action: "optimize"`)
- **Yêu cầu (Body)**:
  ```json
  {
    "quyId": 1,
    "action": "optimize",
    "moTa": "Em xin chào ban quản lý quỹ ạ, em viết đơn này xin hỗ trợ đóng tiền học vì nhà em nghèo lắm bố mẹ làm ruộng không đủ đóng tiền..."
  }
  ```
- **Phản hồi (Response)**:
  ```json
  {
    "success": true,
    "data": "Kính gửi Ban Quản lý Quỹ hỗ trợ sinh viên TVU. Em tên là..., hiện đang học lớp... Em viết đơn này kính mong Quý Ban xem xét hỗ trợ kinh phí học tập cho em. Hoàn cảnh gia đình em hiện tại vô cùng khó khăn, bố mẹ làm nông nghiệp thu nhập không ổn định..."
  }
  ```

#### 3. Tự động soạn đơn từ ý chính (`action: "draft"`)
- **Yêu cầu (Body)**:
  ```json
  {
    "quyId": 1,
    "action": "draft",
    "moTa": "nhà nghèo, ba mẹ làm ruộng bị hạn mặn mất mùa, cần tiền đóng học phí học kỳ 2"
  }
  ```
- **Phản hồi (Response)**: Trả về một mẫu đơn đầy đủ với đầy đủ phần Kính gửi, Giới thiệu (để trống thông tin để điền), Lý do chi tiết, Lời cam đoan và Lời cảm ơn.

---

## 4. Chi Tiết Các File Thay Đổi Trong Dự Án

Chúng ta đã thực hiện sửa đổi các cấu phần sau để tạo nên tính năng hoàn chỉnh:

### A. Backend (Express.js)
1. **[.env](file:///d:/TotNghiep/TVUDevelopmentFundManager/TVU_Fund_Management/backend/.env)**: Cấu hình khóa `GEMINI_API_KEY`.
2. **[geminiHelper.js](file:///d:/TotNghiep/TVUDevelopmentFundManager/TVU_Fund_Management/backend/utils/helpers/geminiHelper.js)**: Chứa logic gọi API Gemini chính thức bằng phương thức HTTP Fetch native, giúp bảo mật, không cần cài đặt thêm gói npm nặng nề, tránh xung đột phiên bản Node.
3. **[aiController.js](file:///d:/TotNghiep/TVUDevelopmentFundManager/TVU_Fund_Management/backend/controllers/applications/aiController.js)**: Controller xử lý 3 nghiệp vụ chính (`analyze`, `optimize`, `draft`). **Đặc biệt:** Hàm này lấy thông tin Quỹ từ database (`ten_quy`, `mo_ta`, `dieu_kien_tom_tat`) để huấn luyện AI sinh nội dung bám sát tiêu chí của quỹ đó.
4. **[applicationRoutes.js](file:///d:/TotNghiep/TVUDevelopmentFundManager/TVU_Fund_Management/backend/routes/applications/applicationRoutes.js)**: Đăng ký route và bảo vệ bằng middleware `protect`, chỉ cho phép tài khoản sinh viên truy cập.
5. **[applicationController.js](file:///d:/TotNghiep/TVUDevelopmentFundManager/TVU_Fund_Management/backend/controllers/applications/applicationController.js)**: Đã sửa một số lỗi tên cột cơ sở dữ liệu (`fund.tenquy` -> `fund.ten_quy` và `fund.loaiquy_id` -> `fund.loai_quy`) giúp hệ thống lưu nhật ký và duyệt đơn không bị lỗi `undefined`.

### B. Frontend (React)
1. **[constants/index.js](file:///d:/TotNghiep/TVUDevelopmentFundManager/TVU_Fund_Management/frontend/src/constants/index.js)**: Thêm hằng số định nghĩa endpoint `AI_SUGGEST`.
2. **[applicationService.js](file:///d:/TotNghiep/TVUDevelopmentFundManager/TVU_Fund_Management/frontend/src/services/applicationService.js)**: Khai báo hàm `getAiSuggestion` để gửi request Axios lên backend.
3. **[ApplyPage.jsx](file:///d:/TotNghiep/TVUDevelopmentFundManager/TVU_Fund_Management/frontend/src/pages/User/Student/ApplyPage/ApplyPage.jsx)**: Bổ sung việc truyền đối tượng quỹ đang chọn (`selectedFund`) sang Sidebar để làm ngữ cảnh phân tích.
4. **[AppliSidebar.jsx](file:///d:/TotNghiep/TVUDevelopmentFundManager/TVU_Fund_Management/frontend/src/components/sections/AppliPage/AppliSectionLayout/AppliSidebar/AppliSidebar.jsx)**: Cầu nối truyền `selectedFund` từ trang chính vào Panel AI.
5. **[AIAssistantPanel.jsx](file:///d:/TotNghiep/TVUDevelopmentFundManager/TVU_Fund_Management/frontend/src/components/sections/AppliPage/AppliSectionLayout/AppliSidebar/AIAssistantPanel/AIAssistantPanel.jsx)**: 
   - Thay thế việc gọi trực tiếp API của bên thứ ba ở Client bằng việc gọi backend ứng dụng an toàn.
   - Thêm tab chuyển đổi trực quan.
   - Tối ưu UX: Hiển thị thông báo yêu cầu chọn Quỹ ở Bước 1 nếu sinh viên chưa chọn quỹ.
6. **[AIAssistantPanel.module.scss](file:///d:/TotNghiep/TVUDevelopmentFundManager/TVU_Fund_Management/frontend/src/components/sections/AppliPage/AppliSectionLayout/AppliSidebar/AIAssistantPanel/AIAssistantPanel.module.scss)**: Bổ sung CSS đẹp mắt cho các nút bấm chuyển tab, ô nhập liệu ý chính sinh đơn mới phù hợp với ngôn ngữ thiết kế chung.

---

## 5. Hướng Dẫn Kiểm Tra và Sử Dụng Thực Tế

1. **Khởi chạy hệ thống**:
   - Chạy lệnh khởi động máy chủ API backend (`npm run dev` trong thư mục `backend`).
   - Chạy lệnh khởi động giao diện frontend (`npm run dev` trong thư mục `frontend`).
2. **Đăng nhập**: Đăng nhập bằng tài khoản Sinh viên (ví dụ: các tài khoản sinh viên mẫu trong hệ thống).
3. **Mở Trang nộp đơn**:
   - Ở bước 1, **chọn một quỹ hỗ trợ bất kỳ** (ví dụ: Quỹ Học bổng Vượt khó, Quỹ Đào tạo...). Xác nhận rằng thông báo yêu cầu chọn quỹ bên sidebar phải biến mất và hiển thị giao diện AI Assistant.
   - Ở bước 2 (Nhập mô tả), viết một lý do sơ sài: *"Em nhà nghèo, muốn xin tiền đóng tiền học kỳ này ạ."*
   - Chờ 1.5 giây, AI sẽ tự động phân tích và chỉ ra các điểm yếu cũng như gợi ý cách chỉnh sửa.
   - Nhấn nút **"Tối ưu đơn với AI"** -> Xác nhận Modal xem trước hiện ra với nội dung chỉnh sửa lịch sự, thuyết phục.
   - Click **"Sử dụng nội dung này"** -> Xác nhận nội dung form Mô tả tự động được điền và điểm số của form được đáp ứng.
   - Hoặc chuyển qua tab **"Soạn mới bằng AI"**, nhập một vài gạch đầu dòng hoàn cảnh của bạn -> Nhấn **"Tự soạn đơn bằng AI"** -> Nhận kết quả và áp dụng vào đơn.

---

## 6. Hướng Dẫn Sử Dụng Chi Tiết Trên Giao Diện Cho Sinh Viên

Giao diện Trợ lý AI (nằm ở thanh bên phải của màn hình nộp đơn) cung cấp hai chế độ hỗ trợ thiết thực:

### Chế độ 1: Phân tích & Tối ưu đơn đã viết (Tab "Gợi ý & Tối ưu")
Chế độ này phù hợp khi sinh viên đã tự viết một bản thảo nháp nhưng muốn kiểm tra xem đơn đã đủ thuyết phục chưa:
1. **Gõ nội dung nháp** của bạn vào ô **"Mô tả lý do đề nghị hỗ trợ"** ở cột bên trái.
2. **Hệ thống tự động kích hoạt**: Khi bạn ngừng gõ khoảng 1.5 giây, vòng tròn xoay sẽ hiển thị báo hiệu AI đang phân tích.
3. **Đọc đánh giá phản hồi từ AI**:
   - **Đánh giá chung**: Nhận xét nhanh về mức độ rõ ràng, chân thành và đầy đủ của văn bản.
   - **Ưu điểm**: Những điểm tốt cần phát huy (Ví dụ: lễ phép, rõ mục đích).
   - **Cần cải thiện**: Những điểm còn thiếu (Ví dụ: chưa nêu rõ nghề nghiệp bố mẹ, chưa nêu số tiền cụ thể cần hỗ trợ).
   - **Gợi ý**: Lời khuyên cụ thể để sửa đổi.
4. **Viết lại bằng AI**: Nếu muốn AI tự sửa đổi và chau chuốt, click nút **"Tối ưu đơn với AI"**.
5. **Cửa sổ Xem trước (Modal)** sẽ hiển thị đoạn đơn hoàn hảo đã được sửa lỗi chính tả và chuyển đổi sang văn phong trang trọng, thuyết phục.
6. Click **"Sử dụng nội dung này"** để tự động điền văn bản mới vào form chính.

### Chế độ 2: Tự động soạn thảo từ gạch đầu dòng ý chính (Tab "Soạn mới bằng AI")
Chế độ này cực kỳ hữu ích khi sinh viên không biết bắt đầu viết từ đâu hoặc gặp khó khăn khi diễn đạt hoàn cảnh của mình:
1. Click chuyển sang tab **"Soạn mới bằng AI"** trên bảng trợ lý.
2. Nhập các **gạch đầu dòng ý chính** về gia cảnh hoặc lý do xin hỗ trợ của bạn (Ví dụ: *nhà nghèo, ba mẹ làm ruộng bị hạn mặn mất mùa, cần tiền đóng học phí học kỳ 2*). Bạn chỉ cần nhập văn bản thô, không cần trau chuốt câu từ.
3. Click nút **"Tự soạn đơn bằng AI"**.
4. AI sẽ đọc tiêu chí của Quỹ mà bạn đang chọn và lồng ghép các ý chính của bạn để tạo ra một lá đơn đề nghị hỗ trợ chuẩn chỉnh, đầy đủ bố cục (Kính gửi, Giới thiệu thông tin trống, Trình bày hoàn cảnh chi tiết, Lời hứa cam kết và Lời cảm ơn).
5. Kiểm tra lại nội dung trong cửa sổ xem trước và click **"Sử dụng nội dung này"** để áp dụng vào form chính. Sinh viên chỉ cần điền thêm các thông tin cá nhân còn trống (như Họ tên, Lớp, MSSV) để hoàn thành đơn.

