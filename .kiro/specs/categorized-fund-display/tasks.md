# Kế Hoạch Triển Khai: Hiển Thị Quỹ Theo Loại

## Tổng Quan

Kế hoạch này triển khai chức năng hiển thị quỹ được phân loại trên trang FundsPage, tổ chức các quỹ theo loại quỹ (dựa vào `maloai` và `tenloai` từ bảng `loaiquy`) với phân trang độc lập cho mỗi loại (tối đa 6 thẻ quỹ mỗi trang). Triển khai theo mẫu đã được chứng minh từ NewsPage và bao gồm hai giai đoạn: cập nhật backend API và phát triển component frontend.

## Các Nhiệm Vụ

- [x] 1. Migration cơ sở dữ liệu: Bỏ qua
  - Không cần thêm cột `nhom` mới
  - Sử dụng trường `maloai` và `tenloai` từ bảng `loaiquy` để phân loại
  - Mỗi loại quỹ (`maloai`) sẽ là một nhóm/danh mục riêng biệt
  - _Yêu cầu: 1.1, 1.2, 1.3, 1.4_

- [ ] 2. Triển khai endpoint API backend: Đếm số quỹ theo loại
  - [x] 2.1 Tạo hàm `getFundCountByGroup` trong `backend/controllers/funds/fundController.js`
    - Nhận tham số truy vấn: `capDo`, `trangThai`
    - Xây dựng mệnh đề WHERE với điều kiện cơ bản cho quỹ đang hoạt động/tạm dừng
    - Truy vấn cơ sở dữ liệu sử dụng GROUP BY trên `lq.maloai`
    - Chuyển đổi kết quả thành định dạng object `{ "maloai1": { tenLoai: "Học bổng", soLuong: 15 }, "maloai2": { tenLoai: "Y tế", soLuong: 8 } }`
    - Trả về JSON response với trường `success` và `data`
    - Bao gồm xử lý lỗi với status code 500
    - _Yêu cầu: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_
  
  - [ ]* 2.2 Viết unit test cho `getFundCountByGroup`
    - Test định dạng response khớp với đặc tả
    - Test lọc theo tham số `capDo`
    - Test lọc theo tham số `trangThai`
    - Test xử lý lỗi khi database thất bại
    - _Yêu cầu: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 3. Đăng ký route API mới cho endpoint đếm quỹ
  - Thêm route `GET /api/funds/count-by-group` trong `backend/routes/fundRoutes.js`
  - Đánh dấu là endpoint công khai (không cần authentication)
  - Ánh xạ đến hàm controller `getFundCountByGroup`
  - _Yêu cầu: 2.1_

- [ ] 4. Cập nhật API `getPublicFunds` hiện tại để hỗ trợ lọc theo loại và phân trang
  - [x] 4.1 Thêm tham số truy vấn mới vào `getPublicFunds` trong `backend/controllers/funds/fundController.js`
    - Thêm tham số `maloai` để lọc theo loại quỹ
    - Thêm tham số `page` (mặc định: 1)
    - Thêm tham số `limit` (mặc định: 6)
    - Parse tham số phân trang và tính `offset`
    - Thêm điều kiện WHERE cho `maloai` (lq.maloai = ?)
    - Cập nhật câu truy vấn đếm để tôn trọng tất cả bộ lọc bao gồm `maloai`
    - Cập nhật câu truy vấn funds với mệnh đề `LIMIT ? OFFSET ?`
    - Bao gồm trường `maloai` và `tenloai` trong mệnh đề SELECT
    - Trả về response với `total`, `page`, `limit`, và mảng `funds`
    - Map `maloai` và `ten_loai_quy` trong phần chuyển đổi response
    - _Yêu cầu: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_
  
  - [ ]* 4.2 Viết unit test cho `getPublicFunds` đã cập nhật
    - Test phân trang với các giá trị `page` và `limit` khác nhau
    - Test lọc theo tham số `maloai`
    - Test kết hợp các bộ lọc `maloai` + `capDo` + `trangThai`
    - Test giá trị mặc định cho `page` và `limit`
    - Test số lượng `total` khớp với kết quả đã lọc
    - Test tính toán offset cho các số trang khác nhau
    - _Yêu cầu: 3.2, 3.3, 3.4, 3.5, 3.6_

- [ ] 5. Checkpoint - Chạy và test các API backend
  - Test endpoint `GET /api/funds/count-by-group` thủ công hoặc với Postman
  - Test endpoint `GET /api/funds/public?maloai=X&page=1&limit=6`
  - Đảm bảo tất cả test pass, hỏi người dùng nếu có thắc mắc

- [ ] 6. Cập nhật tầng service frontend với các API call mới
  - [x] 6.1 Thêm hàm `getFundCountByGroup` trong `frontend/src/services/fundService.js`
    - Nhận object `filters` với thuộc tính `capDo` và `trangThai`
    - Xây dựng URLSearchParams từ filters
    - Fetch từ endpoint `/funds/count-by-group`
    - Xử lý parse response và throw error
    - _Yêu cầu: 2.1, 2.4, 2.5_
  
  - [x] 6.2 Cập nhật hàm `getPublicFunds` trong `frontend/src/services/fundService.js`
    - Thêm hỗ trợ cho tham số `maloai`, `page`, `limit`
    - Cập nhật logic xây dựng URLSearchParams
    - Duy trì khả năng tương thích ngược với các filter hiện có
    - _Yêu cầu: 3.1, 3.2, 3.3, 3.4_

- [ ] 7. Tạo cấu hình danh mục và quản lý state trong FundsPage
  - [x] 7.1 Thêm cấu hình danh mục vào `frontend/src/pages/Public/FundsPage/FundsPage.jsx`
    - Định nghĩa mảng `CATEGORIES_CONFIG` với keys (maloai), labels (tenLoai), và CSS classes
    - Ví dụ: `[{ key: 'HB', label: 'Học bổng', class: 'scholarship' }, ...]`
    - Định nghĩa hằng số `ITEMS_PER_PAGE` (giá trị: 6)
    - Tạo hàm helper `createCategoryState` để khởi tạo states theo danh mục
    - _Yêu cầu: 4.1, 4.3, 4.4, 4.6_
  
  - [x] 7.2 Triển khai quản lý state sử dụng objects dựa trên danh mục
    - Thêm state `categoryCounts` (lưu số lượng mỗi danh mục)
    - Thêm state `categoryPages` (lưu trang hiện tại mỗi danh mục)
    - Thêm state `categoryData` (lưu mảng funds mỗi danh mục)
    - Thêm state `categoryTotals` (lưu tổng số lượng mỗi danh mục)
    - Thêm state `categoryLoading` (lưu trạng thái loading mỗi danh mục)
    - Thêm state `initLoading` cho việc tải trang ban đầu
    - Thêm ref `filterRequestIdRef` để hủy request
    - _Yêu cầu: 4.2, 4.9, 5.1, 8.4_
  
  - [ ]* 7.3 Viết unit test cho quản lý state danh mục
    - Test helper `createCategoryState` với các value factories khác nhau
    - Test khởi tạo state với giá trị mặc định đúng
    - Test cập nhật state cho từng danh mục riêng lẻ
    - _Yêu cầu: 4.2, 5.1_

- [ ] 8. Triển khai logic fetch dữ liệu cho quỹ theo danh mục
  - [ ] 8.1 Tạo effect `fetchCounts` trong FundsPage
    - Kích hoạt khi thay đổi bộ lọc `activeCapDo` hoặc `activeTrangThai`
    - Tăng `filterRequestIdRef` để hủy request
    - Reset tất cả states danh mục về giá trị ban đầu
    - Gọi API `getFundCountByGroup` với các filter hiện tại
    - Kiểm tra xem request có cũ không trước khi cập nhật state
    - Cập nhật states `categoryCounts` và `categoryTotals`
    - Kích hoạt `fetchCategoryFunds` cho các danh mục có count > 0
    - Xử lý trạng thái loading với `initLoading`
    - _Yêu cầu: 4.2, 4.3, 6.2, 6.3, 6.4, 8.2, 8.4_
  
  - [x] 8.2 Tạo hàm `fetchCategoryFunds` trong FundsPage
    - Nhận tham số: `categoryKey`, `page`, `requestId`
    - Set trạng thái loading của danh mục thành true
    - Gọi API `getPublicFunds` với `maloai`, `page`, `limit`, và các tham số filter
    - Kiểm tra xem request có cũ không trước khi cập nhật state
    - Cập nhật `categoryData` và `categoryTotals` cho danh mục cụ thể
    - Set trạng thái loading của danh mục thành false
    - Bao gồm xử lý lỗi với console logging
    - _Yêu cầu: 4.6, 5.2, 5.9, 8.2, 8.3_
  
  - [ ]* 8.3 Viết integration test cho luồng fetch dữ liệu
    - Test tải ban đầu fetch counts và funds cho tất cả danh mục
    - Test thay đổi filter reset pages và refetch dữ liệu
    - Test hủy request khi thay đổi filter nhanh
    - Test xử lý lỗi cho API calls thất bại
    - _Yêu cầu: 4.2, 6.2, 6.3, 8.2_

- [x] 9. Triển khai xử lý phân trang cho các danh mục
  - Tạo hàm `handlePageChange` trong FundsPage
  - Cập nhật state `categoryPages` cho danh mục cụ thể
  - Gọi `fetchCategoryFunds` với số trang mới và requestId hiện tại
  - Triển khai smooth scroll đến header section danh mục
  - Sử dụng `document.getElementById` với pattern `section-${categoryKey}`
  - Áp dụng `scrollIntoView` với options `{ behavior: 'smooth', block: 'start' }`
  - _Yêu cầu: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10_

- [ ] 10. Tạo component CategoryPagination
  - [ ] 10.1 Tạo file `frontend/src/components/sections/FundsPage/CategoryPagination.jsx`
    - Nhận props: `currentPage`, `totalPages`, `onPageChange`
    - Render nút "Trước" (disabled khi `currentPage === 1`)
    - Render các nút số trang (hiển thị tối đa 5 trang với dấu ba chấm)
    - Render nút "Tiếp" (disabled khi `currentPage === totalPages`)
    - Áp dụng styling active cho nút trang hiện tại
    - Gọi callback `onPageChange` với số trang mới
    - _Yêu cầu: 5.1, 5.3, 5.4, 5.5, 5.6, 5.7_
  
  - [ ] 10.2 Tạo styles `frontend/src/components/sections/FundsPage/CategoryPagination.module.scss`
    - Style container phân trang với flexbox căn giữa
    - Style các nút phân trang với trạng thái hover và disabled
    - Thêm styling cho nút trang active
    - Bao gồm styles responsive cho mobile (font nhỏ hơn, khoảng cách giảm)
    - _Yêu cầu: 5.7, 7.4_
  
  - [ ]* 10.3 Viết unit test cho component CategoryPagination
    - Test các nút render đúng cho số trang khác nhau
    - Test nút "Trước" disabled ở trang 1
    - Test nút "Tiếp" disabled ở trang cuối
    - Test callback `onPageChange` fire với số trang đúng
    - _Yêu cầu: 5.6, 5.7_

- [ ] 11. Triển khai render section danh mục trong FundsPage
  - [x] 11.1 Tạo hàm `renderCategorySection`
    - Trích xuất data, loading, total, currentPage từ states theo `categoryKey`
    - Tính `totalPages` sử dụng `Math.ceil(total / ITEMS_PER_PAGE)`
    - Trả về `null` nếu `total === 0` (ẩn danh mục trống)
    - Render section với `id="section-${categoryKey}"` để scroll targeting
    - Render header danh mục với title, dấu chấm màu, và badge số lượng
    - Hiển thị skeleton loaders khi `loading === true`
    - Render grid quỹ với layout 3 cột
    - Map dữ liệu quỹ thành các component FundCard
    - Render CategoryPagination khi `totalPages > 1`
    - _Yêu cầu: 4.1, 4.3, 4.4, 4.5, 4.6, 4.7, 4.9, 5.7, 5.10, 9.4_
  
  - [x] 11.2 Cập nhật phương thức render chính của FundsPage
    - Render trạng thái loading khi `initLoading === true`
    - Tính tổng số quỹ trên tất cả danh mục
    - Render empty state khi `totalFundsCount === 0`
    - Render sections wrapper chứa tất cả các sections danh mục
    - Map `CATEGORIES_CONFIG` thành các lời gọi `renderCategorySection`
    - Lọc các danh mục trả về `null` (không có quỹ)
    - _Yêu cầu: 4.1, 4.8, 4.9, 9.1, 9.5_

- [x] 12. Thêm responsive grid styles cho danh mục quỹ
  - Cập nhật `frontend/src/pages/Public/FundsPage/FundsPage.module.scss`
  - Định nghĩa class `.grid` với `display: grid` và `grid-template-columns: repeat(3, 1fr)`
  - Thêm media query cho viewport < 968px: chuyển sang 2 cột
  - Thêm media query cho viewport < 640px: chuyển sang 1 cột
  - Định nghĩa `.categorySection` với khoảng cách phù hợp
  - Định nghĩa `.sectionHeader` với flexbox layout cho title và count
  - Thêm styles `.titleDot` với màu theo danh mục (scholarship, healthcare, emergency, other)
  - _Yêu cầu: 7.1, 7.2, 7.3, 7.6_

- [x] 13. Cập nhật FundSelectSection để ẩn/vô hiệu hóa bộ lọc "Loại quỹ"
  - Mở `frontend/src/components/sections/FundsPage/FundSelectSection.jsx`
  - Thêm render có điều kiện hoặc trạng thái disabled cho dropdown "Loại quỹ"
  - Tùy chọn 1: Ẩn hoàn toàn với `display: none` hoặc render có điều kiện
  - Tùy chọn 2: Hiển thị dưới dạng disabled với tooltip "Đã được thay thế bằng phân nhóm"
  - Giữ nguyên các filter khác: Sắp xếp, Cấp độ, Trạng thái, Search
  - _Yêu cầu: 6.1, 6.5_

- [ ] 14. Tích hợp các bộ lọc với hiển thị phân danh mục
  - [x] 14.1 Kết nối bộ lọc Cấp độ với refetch danh mục
    - Đảm bảo thay đổi state `activeCapDo` kích hoạt effect `fetchCounts`
    - Xác minh tất cả trang danh mục reset về 1
    - Xác minh counts cập nhật đúng
    - _Yêu cầu: 6.2, 6.3, 6.4_
  
  - [x] 14.2 Kết nối bộ lọc Trạng thái với refetch danh mục
    - Đảm bảo thay đổi state `activeTrangThai` kích hoạt effect `fetchCounts`
    - Xác minh tất cả trang danh mục reset về 1
    - Xác minh counts cập nhật đúng
    - _Yêu cầu: 6.2, 6.3, 6.4_
  
  - [x] 14.3 Triển khai chức năng tìm kiếm debounced
    - Cài đặt hoặc import tiện ích debounce (hoặc tạo custom hook)
    - Áp dụng debounce 300ms cho giá trị search input
    - Truyền giá trị search đã debounce đến các lời gọi `fetchCategoryFunds`
    - Đảm bảo search lọc trên tất cả danh mục
    - _Yêu cầu: 6.6, 6.7, 8.5_
  
  - [x] 14.4 Đảm bảo dropdown Sắp xếp áp dụng cho tất cả danh mục
    - Xác minh tham số sort được truyền đến tất cả lời gọi `getPublicFunds`
    - Test sắp xếp hoạt động nhất quán trên các danh mục
    - _Yêu cầu: 6.8_

- [x] 15. Checkpoint - Test hiển thị và bộ lọc phân danh mục
  - Tải FundsPage và xác minh các danh mục render đúng
  - Test phân trang cho từng danh mục độc lập
  - Test bộ lọc Cấp độ cập nhật counts và reset pages
  - Test bộ lọc Trạng thái cập nhật counts và reset pages
  - Test search input lọc quỹ trên tất cả danh mục
  - Test hành vi responsive trên các kích thước màn hình khác nhau
  - Đảm bảo tất cả test pass, hỏi người dùng nếu có thắc mắc

- [ ] 16. Triển khai xử lý lỗi và các trường hợp đặc biệt
  - [x] 16.1 Thêm state lỗi và chức năng retry
    - Thêm state `countError` cho lỗi count API
    - Render thông báo lỗi với nút "Thử lại" khi count thất bại
    - Thêm states lỗi theo danh mục trong `categoryLoading` hoặc state riêng
    - Render thông báo lỗi inline cho fetch danh mục thất bại
    - Bao gồm nút retry gọi lại `fetchCategoryFunds`
    - _Yêu cầu: 9.2, 9.3, 9.6_
  
  - [x] 16.2 Xử lý empty states
    - Hiển thị "Chưa có quỹ nào trong hệ thống" khi không có danh mục nào có quỹ
    - Hiển thị "Không tìm thấy quỹ phù hợp" khi tất cả danh mục lọc về 0
    - Ẩn các danh mục có 0 quỹ sau khi áp dụng filter
    - _Yêu cầu: 4.8, 9.1, 9.4, 9.5_
  
  - [x] 16.3 Xử lý giá trị NULL (không áp dụng vì dùng maloai)
    - Không cần xử lý NULL vì maloai luôn có giá trị
    - _Yêu cầu: 9.7_
  
  - [ ]* 16.4 Viết integration test cho xử lý lỗi
    - Test lỗi count API hiển thị lỗi và nút retry
    - Test lỗi category API hiển thị lỗi inline
    - Test empty state khi không có quỹ nào
    - Test empty state khi filter cho ra 0 quỹ
    - _Yêu cầu: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 17. Triển khai tối ưu hóa hiệu năng
  - [x] 17.1 Triển khai parallel API calls cho tải ban đầu
    - Sử dụng `Promise.all` để fetch funds cho tất cả danh mục đồng thời
    - Đảm bảo tối đa 6 requests đồng thời (một cho mỗi danh mục tiềm năng)
    - _Yêu cầu: 8.2, 8.7_
  
  - [x] 17.2 Triển khai error isolation cho parallel fetches
    - Wrap mỗi category fetch trong try-catch
    - Cho phép các danh mục thành công hiển thị ngay cả khi một danh mục thất bại
    - _Yêu cầu: 8.3_
  
  - [x] 17.3 Tối ưu hóa count caching
    - Cache kết quả count trong state cho đến khi filters thay đổi
    - Tránh các lời gọi count API dư thừa trong quá trình phân trang
    - _Yêu cầu: 8.4_
  
  - [x] 17.4 Triển khai cơ chế hủy request
    - Sử dụng `filterRequestIdRef` để theo dõi request mới nhất
    - Kiểm tra requestId trước khi cập nhật state từ async responses
    - Ngăn dữ liệu cũ ghi đè kết quả mới hơn
    - _Yêu cầu: 8.2, 8.4_
  
  - [ ]* 17.5 Viết performance tests
    - Test parallel fetches hoàn thành nhanh hơn tuần tự
    - Test hủy request ngăn cập nhật cũ
    - Test debounced search giảm số lượng API call
    - _Yêu cầu: 8.2, 8.3, 8.4, 8.5_

- [ ] 18. Thêm cơ sở hạ tầng theo dõi analytics
  - [ ] 18.1 Tạo hàm helper analytics
    - Tạo hàm `logAnalyticsEvent` trong FundsPage hoặc tiện ích riêng
    - Log ra console trong môi trường development
    - Thêm placeholder cho tích hợp analytics production (Google Analytics)
    - _Yêu cầu: 10.5, 10.6_
  
  - [ ] 18.2 Theo dõi sự kiện phân trang
    - Gọi `logAnalyticsEvent` trong `handlePageChange` với group, from_page, to_page
    - _Yêu cầu: 10.2_
  
  - [ ] 18.3 Theo dõi sự kiện filter
    - Gọi `logAnalyticsEvent` khi filters thay đổi với loại và giá trị filter
    - _Yêu cầu: 10.3_
  
  - [ ] 18.4 Theo dõi clicks vào fund card
    - Truyền callback analytics đến component FundCard
    - Log fund_id, group_name, page_number khi click
    - _Yêu cầu: 10.1_
  
  - [ ] 18.5 Theo dõi category impressions sử dụng Intersection Observer
    - Tạo Intersection Observer cho các sections danh mục
    - Theo dõi sự kiện impression khi section vào viewport (threshold 0.5)
    - Dọn dẹp observer khi component unmount
    - _Yêu cầu: 10.4_
  
  - [ ]* 18.6 Viết test cho theo dõi analytics
    - Test console.log calls trong development mode
    - Test dữ liệu event đúng được log cho mỗi action
    - _Yêu cầu: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 19. Checkpoint cuối - Test E2E và validation
  - Chạy bộ test đầy đủ cho backend và frontend
  - Thực hiện test E2E thủ công trên môi trường development
  - Test tất cả user flows: tải ban đầu, phân trang, lọc, search
  - Validate responsive design trên mobile, tablet, và desktop
  - Xác minh các sự kiện analytics fire đúng
  - Kiểm tra xử lý lỗi và các trường hợp đặc biệt
  - Review chất lượng code và thêm comments tài liệu
  - Đảm bảo tất cả test pass, hỏi người dùng nếu có thắc mắc

- [ ] 20. Tích hợp và chuẩn bị triển khai
  - [x] 20.1 Cập nhật tài liệu API
    - Tài liệu hóa endpoint mới `/api/funds/count-by-group`
    - Tài liệu hóa tham số `/api/funds/public` đã cập nhật
    - _Yêu cầu: 2.1, 3.1_
  
  - [x] 20.2 Tạo checklist triển khai
    - Chuẩn bị kế hoạch rollback (không cần migration database)
    - Tài liệu hóa các bước test thủ công cho team QA
  
  - [x] 20.3 Code review và dọn dẹp
    - Xóa console.logs và code debug
    - Đảm bảo code style và formatting nhất quán
    - Thêm comments JSDoc cho các hàm phức tạp
    - Xóa imports không dùng và dead code

## Ghi Chú

- Tasks đánh dấu `*` là tùy chọn và có thể bỏ qua để giao MVP nhanh hơn
- Mỗi task tham chiếu các yêu cầu cụ thể để truy vết (xem tài liệu Requirements)
- Các checkpoints đảm bảo validation từng bước tại các điểm tích hợp quan trọng
- Triển khai theo mẫu đã được chứng minh từ NewsPage cho hiển thị dựa trên danh mục
- Không cần migration database - sử dụng trường `maloai` và `tenloai` có sẵn
- Quản lý state frontend sử dụng objects keyed theo danh mục cho phân trang độc lập
- Tối ưu hóa hiệu năng bao gồm parallel fetching, hủy request, và debounced search
- Cơ sở hạ tầng analytics đã được chuẩn bị cho tích hợp với các dịch vụ theo dõi
- Breakpoints responsive design: 968px (tablet), 640px (mobile)
