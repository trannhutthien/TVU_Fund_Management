1\. Authentication

**POST/api/auth/loginĐăng nhập, trả về JWT tokenAll**

**POST/api/auth/logout Đăng xuất, invalidate tokenAl**

**lPOST/api/auth/refresh-token Làm mới access tokenAll**

**GET/api/auth/me Lấy thông tin user đang đăng nhậpAll**

**PUT/api/auth/change-password Đổi mật khẩuAll**



**2. Roles Management (Quản lý Vai trò)**

**GET/api/rolesLấy danh sách tất cả vai trò trong hệ thống.Admin (1),**  **Giao vụ (3)**

**GET/api/roles/:idXem thông tin chi tiết (tên, mô tả, trạng thái) của một vai trò.Admin (1),Giao vụ (3)**

**PATCH/api/roles/:idCập nhật một phần thông tin (mô tả hoặc trạng thái khóa/mở). Admin (1)**

**GET/api/roles/:id/usersLiệt kê danh sách tất cả người dùng thuộc một vai trò cụ thể.Admin (1), Giao vụ (3)**



2\. User Management

**GET/api/users Danh sách tất cả user Admin**

**POST/api/users Tạo user mới Admin**

**GET/api/users/:idChi tiết một userAdmin**

PUT/api/users/:idCập nhật thông tin userAdmin

DELETE/api/users/:idXóa userAdmin 

PUT/api/users/:id/roleGán / thay đổi roleAdmin

**PUT/api/users/:id/statusKích hoạt / khóa tài khoảnAdmin**



&#x20;3. Sinh viên (Student)

GET/api/studentsDanh sách sinh viênAdmin, Giáo vụ

POST/api/studentsThêm sinh viên mớiAdmin, Giáo vụ

GET/api/students/:idChi tiết một sinh viênAdmin, Giáo vụ

PUT/api/students/:idCập nhật thông tin sinh viênAdmin, Giáo vụ

DELETE/api/students/:idXóa sinh viênAdmin

GET/api/students/:id/applicationsLịch sử đơn đã nộp của sinh viênAdmin, Giáo vụ

GET/api/students/searchTìm kiếm sinh viên (MSSV, tên, khoa)Admin, Giáo vụ





4\. Đơn đăng ký (Application)

GET/api/applicationsDanh sách tất cả đơn đăng kýAdmin, Giáo vụ

POST/api/applicationsNộp đơn mới (sinh viên / cổng đăng ký)Public/Student

GET/api/applications/:idChi tiết một đơnAdmin, Giáo vụ

PUT/api/applications/:idCập nhật thông tin đơnAdmin, Giáo vụ

DELETE/api/applications/:idXóa đơnAdmin

PUT/api/applications/:id/statusDuyệt / từ chối / yêu cầu bổ sungAdmin, Giáo vụ

GET/api/applications/filterLọc đơn theo trạng thái, loại, kỳAdmin, Giáo vụ

POST/api/applications/:id/documentsUpload hồ sơ đính kèmStudent, Giáo vụ

GET/api/applications/:id/documentsLấy danh sách hồ sơ đính kèmAdmin, Giáo vụ







&#x20;5. Học bổng / Chương trình hỗ trợ (Fund Program)

GET/api/programsDanh sách tất cả chương trìnhAll

POST/api/programsTạo chương trình mớiAdmin

GET/api/programs/:idChi tiết chương trìnhAll

PUT/api/programs/:idCập nhật chương trìnhAdmin

DELETE/api/programs/:idXóa chương trìnhAdmin

PUT/api/programs/:id/statusMở / đóng đăng kýAdmin

GET/api/programs/:id/applicantsDanh sách sinh viên đã đăng kýAdmin, Giáo vụ





&#x20;6. Quỹ \& Tài chính (Fund / Finance)

GET/api/fundsTổng quan tất cả quỹAdmin, Kế toán

**POST/api/funds Tạo quỹ mới Admin**

GET/api/funds/:idChi tiết một quỹAdmin, Kế toán

PUT/api/funds/:idCập nhật thông tin quỹAdmin, Kế toán

GET/api/funds/:id/transactionsLịch sử giao dịch của quỹAdmin, Kế toán

POST/api/funds/:id/allocatePhân bổ quỹ cho chương trìnhAdmin, Kế toán

GET/api/funds/summaryTổng hợp số dư, đã chi, còn lạiAdmin, Kế toán





7\. Giao dịch (Transaction)

GET/api/transactionsDanh sách tất cả giao dịchAdmin, Kế toán

POST/api/transactionsTạo giao dịch mới (thu/chi)Admin, Kế toán

GET/api/transactions/:idChi tiết giao dịchAdmin, Kế toán

PUT/api/transactions/:idChỉnh sửa giao dịchAdmin, Kế toán

DELETE/api/transactions/:idXóa giao dịchAdmin

GET/api/transactions/filterLọc theo thời gian, loại, trạng tháiAdmin, Kế toán

POST/api/transactions/:id/confirmXác nhận đã thanh toánKế toán





&#x20;8. Dashboard \& Thống kê (Analytics)

GET/api/dashboard/overviewKPI tổng quan (tổng quỹ, đơn, SV)Admin

GET/api/dashboard/fund-allocationDữ liệu Donut chart phân bổ quỹAdmin, Kế toán

GET/api/dashboard/cashflowDữ liệu Area chart dòng tiềnAdmin, Kế toán

GET/api/dashboard/applications-statsThống kê đơn theo trạng thái / kỳAdmin, Giáo vụ

GET/api/dashboard/recent-activitiesHoạt động gần đâyAdmin





&#x20;9. AI Assistant (Cổng đăng ký sinh viên)

POST/api/ai/chatGửi tin nhắn đến AI assistantPublic

GET/api/ai/suggested-programsGợi ý chương trình phù hợp với SVPublic

POST/api/ai/validate-applicationAI kiểm tra đơn trước khi nộpPublic





10\. Thông báo (Notification)

GET/api/notificationsDanh sách thông báo của userAll

PUT/api/notifications/:id/readĐánh dấu đã đọcAll

PUT/api/notifications/read-allĐánh dấu tất cả đã đọcAll

DELETE/api/notifications/:idXóa thông báoAll

POST/api/notifications/sendGửi thông báo thủ côngAdmin





11\. File / Upload

POST/api/uploadsUpload file (ảnh, PDF hồ sơ)All

DELETE/api/uploads/:idXóa file đã uploadAdmin





&#x20;12. Audit Log

GET/api/audit-logsLịch sử thao tác toàn hệ thốngAdmin

GET/api/audit-logs/filterLọc theo user, action, thời gianAdmin

