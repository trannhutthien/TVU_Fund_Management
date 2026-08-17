# Requirements Document

## Introduction

Tính năng này cải thiện trang danh mục quỹ (FundsPage) bằng cách tổ chức và hiển thị các quỹ theo nhóm/loại quỹ. Thay vì hiển thị tất cả quỹ trong một danh sách dài, hệ thống sẽ phân loại quỹ theo nhóm (ví dụ: Quỹ học bổng, Quỹ y tế, Quỹ khẩn cấp...), mỗi nhóm hiển thị tối đa 6 card quỹ với tùy chọn xem tất cả khi có nhiều hơn 6 quỹ. Cơ chế này tương tự như trang tin tức sự kiện (NewsPage) đã triển khai thành công.

Mục tiêu chính là cải thiện trải nghiệm người dùng bằng cách:
- Giảm tải thông tin hiển thị ban đầu
- Tổ chức quỹ theo ngữ cảnh rõ ràng (nhóm/loại)
- Cung cấp navigation dễ dàng giữa các nhóm quỹ khác nhau
- Cho phép xem chi tiết từng nhóm khi cần thiết

## Glossary

- **System**: Hệ thống quản lý quỹ phát triển TVU
- **FundsPage**: Trang danh mục quỹ công khai
- **Fund**: Quỹ hỗ trợ (bản ghi trong bảng `quy`)
- **Fund_Group**: Nhóm loại quỹ (giá trị trong trường `nhom` của bảng `loaiquy`)
- **Fund_Card**: Component hiển thị thông tin tóm tắt một quỹ
- **Category_Section**: Phần hiển thị một nhóm quỹ với header và grid cards
- **Pagination_Controls**: Các nút điều khiển phân trang (Trước, Tiếp, số trang)
- **View_All_Button**: Nút "Xem tất cả" để xem toàn bộ quỹ trong nhóm
- **Filter_Bar**: Thanh lọc quỹ (loại quỹ, cấp độ, trạng thái, tìm kiếm)
- **Database**: Cơ sở dữ liệu MySQL
- **API**: Backend API endpoint
- **Grid_Layout**: Bố cục lưới 3 cột hiển thị cards

## Requirements

### Requirement 1: Cấu trúc dữ liệu nhóm loại quỹ

**User Story:** Là một quản trị viên hệ thống, tôi muốn phân loại các loại quỹ vào nhóm (Fund_Group), để có thể tổ chức hiển thị quỹ theo ngữ cảnh rõ ràng trên giao diện người dùng.

#### Acceptance Criteria

1. THE Database SHALL có trường `nhom` (VARCHAR(100), nullable) trong bảng `loaiquy`
2. WHEN cập nhật schema, THE System SHALL giữ nguyên dữ liệu hiện có của bảng `loaiquy`
3. THE System SHALL cho phép một loại quỹ có giá trị `nhom` là NULL (chưa phân nhóm)
4. THE Database SHALL lưu trữ giá trị `nhom` dưới dạng chuỗi văn bản UTF-8
5. WHEN truy vấn loại quỹ, THE API SHALL trả về trường `nhom` trong response

### Requirement 2: API lấy số lượng quỹ theo nhóm

**User Story:** Là một developer frontend, tôi cần API endpoint để lấy số lượng quỹ trong mỗi nhóm, để hiển thị badge số lượng và xác định nhóm nào có quỹ.

#### Acceptance Criteria

1. THE API SHALL cung cấp endpoint `GET /api/funds/count-by-group` (public, không cần authentication)
2. WHEN gọi endpoint, THE API SHALL trả về object với key là tên nhóm và value là số lượng quỹ
3. THE API SHALL chỉ đếm quỹ có trạng thái 'Dang hoat dong' hoặc 'Tam dung'
4. WHEN có filter `capDo`, THE API SHALL lọc quỹ theo cấp độ trước khi đếm
5. WHEN có filter `trangThai`, THE API SHALL lọc quỹ theo trạng thái trước khi đếm
6. THE API SHALL trả về status code 200 khi thành công
7. THE API SHALL trả về format response như sau:
   ```json
   {
     "success": true,
     "data": {
       "Hoc bong": 15,
       "Y te": 8,
       "Khan cap": 3
     }
   }
   ```

### Requirement 3: API lấy danh sách quỹ theo nhóm có phân trang

**User Story:** Là một developer frontend, tôi cần API endpoint để lấy danh sách quỹ của một nhóm cụ thể có phân trang, để hiển thị từng trang quỹ theo yêu cầu người dùng.

#### Acceptance Criteria

1. THE API SHALL mở rộng endpoint hiện tại `GET /api/funds/public` để hỗ trợ query parameters mới
2. WHEN có parameter `nhom`, THE API SHALL lọc quỹ theo nhóm loại quỹ
3. WHEN có parameter `page` (số nguyên dương), THE API SHALL trả về trang tương ứng
4. WHEN có parameter `limit` (số nguyên dương), THE API SHALL giới hạn số quỹ trả về mỗi trang
5. THE API SHALL sử dụng giá trị mặc định `page=1` và `limit=6` nếu không được cung cấp
6. THE API SHALL trả về tổng số quỹ trong nhóm (field `total`) cùng với danh sách quỹ
7. WHEN tham số không hợp lệ, THE API SHALL trả về status code 400 với message lỗi mô tả
8. THE API SHALL trả về format response như sau:
   ```json
   {
     "success": true,
     "total": 15,
     "page": 1,
     "limit": 6,
     "funds": [...]
   }
   ```

### Requirement 4: Hiển thị quỹ theo nhóm với giới hạn 6 cards

**User Story:** Là người dùng, tôi muốn xem quỹ được phân loại theo nhóm và mỗi nhóm chỉ hiển thị 6 quỹ đầu tiên, để dễ dàng tìm kiếm quỹ phù hợp mà không bị quá tải thông tin.

#### Acceptance Criteria

1. THE FundsPage SHALL hiển thị các Category_Section xếp chồng từ trên xuống dưới
2. WHEN tải trang lần đầu, THE FundsPage SHALL gọi API `/api/funds/count-by-group` để lấy số lượng quỹ mỗi nhóm
3. FOR ALL Fund_Group có số lượng quỹ lớn hơn 0, THE FundsPage SHALL tạo một Category_Section
4. WHEN có ít nhất 1 Fund_Group có quỹ, THE FundsPage SHALL sắp xếp Category_Section theo thứ tự cấu hình trong code
5. THE Category_Section SHALL hiển thị header với tên nhóm và tổng số quỹ trong nhóm
6. THE Category_Section SHALL hiển thị tối đa 6 Fund_Card trong Grid_Layout 3 cột
7. WHEN nhóm có nhiều hơn 6 quỹ, THE Category_Section SHALL hiển thị Pagination_Controls
8. WHEN không có quỹ nào trong hệ thống, THE FundsPage SHALL hiển thị empty state message
9. THE FundsPage SHALL hiển thị skeleton loader trong khi chờ API response

### Requirement 5: Phân trang độc lập cho mỗi nhóm quỹ

**User Story:** Là người dùng, tôi muốn phân trang cho từng nhóm quỹ riêng biệt, để có thể xem thêm quỹ trong nhóm quan tâm mà không ảnh hưởng đến các nhóm khác.

#### Acceptance Criteria

1. THE Category_Section SHALL duy trì trạng thái trang hiện tại độc lập với các Category_Section khác
2. WHEN người dùng thay đổi trang của một nhóm, THE System SHALL chỉ tải lại dữ liệu của nhóm đó
3. WHEN người dùng click nút "Tiếp", THE System SHALL tăng số trang hiện tại lên 1 và gọi API
4. WHEN người dùng click nút "Trước", THE System SHALL giảm số trang hiện tại xuống 1 và gọi API
5. WHEN người dùng click số trang cụ thể, THE System SHALL chuyển đến trang đó và gọi API
6. THE Pagination_Controls SHALL disable nút "Trước" khi đang ở trang 1
7. THE Pagination_Controls SHALL disable nút "Tiếp" khi đang ở trang cuối cùng
8. WHEN thay đổi trang, THE System SHALL scroll Category_Section header vào viewport với smooth animation
9. THE System SHALL hiển thị loading state cho Category_Section đang tải dữ liệu
10. THE System SHALL tính tổng số trang dựa trên công thức: `Math.ceil(total / limit)`

### Requirement 6: Tích hợp với Filter Bar hiện tại

**User Story:** Là người dùng, tôi muốn filter theo cấp độ và trạng thái quỹ vẫn hoạt động với cơ chế phân nhóm mới, để có thể lọc quỹ theo nhiều tiêu chí kết hợp.

#### Acceptance Criteria

1. THE FundsPage SHALL giữ nguyên Filter_Bar với các dropdown: Sắp xếp, Loại quỹ, Cấp độ, Trạng thái
2. WHEN người dùng thay đổi filter Cấp độ hoặc Trạng thái, THE System SHALL reset tất cả trang về 1
3. WHEN người dùng thay đổi filter Cấp độ hoặc Trạng thái, THE System SHALL gọi lại API count-by-group với filter mới
4. WHEN người dùng thay đổi filter Cấp độ hoặc Trạng thái, THE System SHALL gọi lại API lấy quỹ cho tất cả nhóm với filter mới
5. THE Filter_Bar SHALL disable hoặc ẩn dropdown "Loại quỹ" vì đã được thay thế bằng phân nhóm
6. THE Search input SHALL filter quỹ theo tên hoặc mô tả trên toàn bộ nhóm
7. WHEN người dùng nhập từ khóa tìm kiếm, THE System SHALL gọi API với parameter `search` cho tất cả nhóm
8. THE Sort dropdown (Sắp xếp) SHALL áp dụng cho tất cả nhóm quỹ

### Requirement 7: Responsive Design cho phân loại nhóm

**User Story:** Là người dùng mobile, tôi muốn trang danh mục quỹ phân nhóm hiển thị tốt trên thiết bị di động, để có trải nghiệm tương tự như trên desktop.

#### Acceptance Criteria

1. WHEN viewport width nhỏ hơn 968px, THE Grid_Layout SHALL chuyển từ 3 cột thành 2 cột
2. WHEN viewport width nhỏ hơn 640px, THE Grid_Layout SHALL chuyển thành 1 cột
3. THE Category_Section header SHALL giữ nguyên định dạng trên mọi kích thước màn hình
4. THE Pagination_Controls SHALL thu gọn spacing và font size trên mobile
5. THE Filter_Bar SHALL chuyển thành layout dọc trên mobile (đã có trong thiết kế hiện tại)
6. THE Fund_Card SHALL giữ nguyên tỷ lệ hình ảnh và nội dung trên mọi breakpoint

### Requirement 8: Performance Optimization cho nhiều nhóm

**User Story:** Là người dùng, tôi muốn trang tải nhanh và mượt mà ngay cả khi có nhiều nhóm quỹ, để có trải nghiệm duyệt web tốt.

#### Acceptance Criteria

1. WHEN tải trang lần đầu, THE System SHALL chỉ gọi API lấy quỹ cho các nhóm có số lượng lớn hơn 0
2. THE System SHALL gọi API lấy quỹ cho tất cả nhóm song song (Promise.all) thay vì tuần tự
3. WHEN có lỗi API cho một nhóm, THE System SHALL vẫn hiển thị các nhóm khác thành công
4. THE System SHALL cache số lượng quỹ mỗi nhóm trong state và chỉ refetch khi filter thay đổi
5. THE System SHALL debounce search input với delay 300ms để giảm số lượng API calls
6. THE System SHALL hiển thị skeleton loader riêng cho từng Category_Section đang tải
7. THE System SHALL limit số lượng request đồng thời tối đa 6 requests (một request cho mỗi nhóm)

### Requirement 9: Xử lý trường hợp edge cases

**User Story:** Là người dùng, tôi muốn hệ thống xử lý mượt mà các trường hợp đặc biệt như không có quỹ, lỗi API, để luôn có phản hồi rõ ràng.

#### Acceptance Criteria

1. WHEN không có nhóm nào có quỹ, THE FundsPage SHALL hiển thị message "Chưa có quỹ nào trong hệ thống"
2. WHEN API count-by-group trả về lỗi, THE System SHALL hiển thị error message và nút "Thử lại"
3. WHEN API lấy quỹ của một nhóm trả về lỗi, THE Category_Section SHALL hiển thị error message inline
4. WHEN một nhóm có 0 quỹ sau khi áp dụng filter, THE Category_Section SHALL bị ẩn khỏi trang
5. WHEN tất cả nhóm có 0 quỹ sau filter, THE FundsPage SHALL hiển thị empty state "Không tìm thấy quỹ phù hợp"
6. WHEN API response timeout, THE System SHALL hiển thị error message và cho phép retry
7. IF một loại quỹ có `nhom` là NULL, THE System SHALL nhóm nó vào category "Khác"

### Requirement 10: Analytics và Tracking

**User Story:** Là product manager, tôi muốn theo dõi hành vi người dùng với tính năng phân nhóm quỹ, để đánh giá hiệu quả của tính năng và cải thiện UX.

#### Acceptance Criteria

1. WHEN người dùng click vào một Fund_Card, THE System SHALL log event với thông tin: fund_id, group_name, page_number
2. WHEN người dùng thay đổi trang của một nhóm, THE System SHALL log event với thông tin: group_name, from_page, to_page
3. WHEN người dùng áp dụng filter, THE System SHALL log event với filter values
4. WHEN người dùng scroll đến một Category_Section, THE System SHALL track impression event cho nhóm đó
5. THE System SHALL gửi analytics events đến console.log trong môi trường development
6. THE System SHALL chuẩn bị infrastructure để tích hợp Google Analytics hoặc tracking service khác trong tương lai

## Implementation Notes

### Database Migration
- Cần tạo migration script để thêm cột `nhom` vào bảng `loaiquy`
- Migration phải an toàn và không ảnh hưởng đến dữ liệu hiện có
- Cần cập nhật seed data hoặc admin interface để cấu hình giá trị `nhom` cho các loại quỹ hiện tại

### Reference Implementation
- Tham khảo NewsPage implementation tại: `frontend/src/pages/Public/NewsPage/NewsPage.jsx`
- Pattern: Category sections với pagination độc lập
- State management: Sử dụng objects với category keys để lưu page/data/loading state

### API Considerations
- Backend controller: `backend/controllers/funds/fundController.js`
- Cần thêm 2 methods mới: `getFundCountByGroup` và update `getPublicFunds` để hỗ trợ filter `nhom`
- Model: `backend/models/funds/FundModel.js` cần thêm query methods tương ứng

### Component Structure Proposal
```
FundsPage/
├── FundTitleSection (giữ nguyên)
├── FundSelectSection (cập nhật: ẩn Loại quỹ dropdown)
└── FundCategorySection (mới)
    ├── CategoryHeader (tên nhóm, số lượng)
    ├── FundGrid (6 cards)
    └── CategoryPagination (nút phân trang)
```
