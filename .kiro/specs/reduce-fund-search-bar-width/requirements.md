# Requirements Document

## Introduction

Tính năng này nhằm thu nhỏ chiều rộng của thanh tìm kiếm trong trang danh mục quỹ công khai để cải thiện bố cục giao diện người dùng và tạo sự cân đối trực quan hơn giữa thanh tìm kiếm và các bộ lọc khác.

## Glossary

- **Search_Bar**: Thanh tìm kiếm (Input field) cho phép người dùng nhập từ khóa để tìm kiếm quỹ theo tên hoặc mô tả
- **FundSelectSection**: Component React chứa thanh tìm kiếm và các bộ lọc trong trang danh mục quỹ
- **Container**: Thành phần bao bọc chứa search bar và filters, hiện có max-width 1400px
- **Filters_Row**: Hàng chứa 4 bộ lọc (Sắp xếp, Loại quỹ, Cấp độ, Trạng thái) nằm dưới thanh tìm kiếm
- **Public_Funds_Page**: Trang danh mục quỹ công khai (`/funds` route) hiển thị danh sách các quỹ có thể xem mà không cần đăng nhập
- **Responsive_Breakpoint**: Điểm ngắt responsive để thay đổi layout trên các kích thước màn hình khác nhau

## Requirements

### Requirement 1: Thu nhỏ chiều rộng thanh tìm kiếm

**User Story:** Là một người dùng xem trang danh mục quỹ công khai, tôi muốn thanh tìm kiếm có chiều rộng vừa phải, để giao diện trông cân đối và dễ sử dụng hơn.

#### Acceptance Criteria

1. THE Search_Bar SHALL have a maximum width of 800 pixels on desktop screens
2. THE Search_Bar SHALL be horizontally centered within the Container
3. WHILE the viewport width is less than 800 pixels, THE Search_Bar SHALL use 100% of the available width
4. THE Search_Bar SHALL maintain its current height of 56 pixels on desktop
5. THE Search_Bar SHALL maintain all existing styling properties including border-radius, background color, shadows, and hover effects

### Requirement 2: Bảo toàn chức năng hiện có

**User Story:** Là một người dùng xem trang danh mục quỹ, tôi muốn thanh tìm kiếm tiếp tục hoạt động đúng như trước đây, để tôi vẫn có thể tìm kiếm quỹ bình thường.

#### Acceptance Criteria

1. WHEN a user types into the Search_Bar, THE FundSelectSection SHALL trigger the search callback with the entered keyword
2. THE Search_Bar SHALL display the magnifying glass icon on the left side
3. THE Search_Bar SHALL display the placeholder text "Tìm kiếm quỹ theo tên hoặc mô tả..."
4. THE Search_Bar SHALL apply focus styling when clicked
5. THE Search_Bar SHALL apply hover effects when the mouse hovers over it

### Requirement 3: Duy trì responsive behavior

**User Story:** Là một người dùng trên thiết bị di động, tôi muốn thanh tìm kiếm hiển thị và hoạt động tốt trên màn hình nhỏ, để tôi có thể tìm kiếm quỹ thuận tiện trên điện thoại.

#### Acceptance Criteria

1. WHILE the viewport width is 1024 pixels or less, THE Search_Bar SHALL have a height of 52 pixels
2. WHILE the viewport width is 640 pixels or less, THE Search_Bar SHALL have a height of 50 pixels
3. WHILE the viewport width is 640 pixels or less, THE Search_Bar SHALL adjust icon positioning to left 16 pixels
4. THE Search_Bar SHALL maintain smooth transitions between responsive breakpoints
5. WHILE the viewport width is less than the max-width value, THE Search_Bar SHALL use 100% width without creating horizontal overflow

### Requirement 4: Duy trì mối quan hệ với Filters Row

**User Story:** Là một người dùng xem trang danh mục quỹ, tôi muốn thanh tìm kiếm và các bộ lọc có bố cục rõ ràng, để tôi dễ dàng phân biệt và sử dụng từng thành phần.

#### Acceptance Criteria

1. THE Search_Bar SHALL remain positioned above the Filters_Row
2. THE Search_Bar SHALL maintain a vertical gap of 16 pixels (space-4) between itself and the Filters_Row
3. THE Filters_Row SHALL maintain its full width layout with 4 equal columns on desktop
4. THE Container SHALL maintain its maximum width of 1400 pixels
5. THE Search_Bar width change SHALL NOT affect the layout or styling of the Filters_Row

### Requirement 5: Đảm bảo animation và transitions

**User Story:** Là một người dùng xem trang danh mục quỹ, tôi muốn thanh tìm kiếm có hiệu ứng chuyển động mượt mà, để trải nghiệm sử dụng cảm thấy chuyên nghiệp và hiện đại.

#### Acceptance Criteria

1. THE Search_Bar SHALL maintain the slideUp animation on component mount
2. THE Search_Bar SHALL maintain transition effects with duration of 0.3 seconds for hover and focus states
3. THE Search_Bar SHALL apply translateY transform of -1 pixel on hover and focus
4. THE Search_Bar SHALL maintain box-shadow transitions on hover and focus
5. THE Search_Bar SHALL apply backdrop-filter blur effect of 10 pixels
