\-- ========================================================

\-- DATABASE: TVU FUND MANAGEMENT SYSTEM

\-- ========================================================



\-- 1. Bảng Vai Trò (Roles)

CREATE TABLE VaiTro (

&#x20;   role\_id INT AUTO\_INCREMENT PRIMARY KEY,

&#x20;   ten\_vai\_tro NVARCHAR(100) NOT NULL UNIQUE,

&#x20;   mo\_ta NVARCHAR(255) NULL,

&#x20;   trang\_thai NVARCHAR(50) DEFAULT 'HOAT\_DONG'

);



\-- 2. Bảng Người Dùng (Users)

CREATE TABLE NguoiDung (

&#x20;   user\_id INT AUTO\_INCREMENT PRIMARY KEY,

&#x20;   ma\_so\_dinh\_danh VARCHAR(20) NOT NULL UNIQUE, -- MSSV hoặc Mã cán bộ

&#x20;   ho\_ten NVARCHAR(150) NOT NULL,

&#x20;   email VARCHAR(150) NOT NULL UNIQUE,

&#x20;   mat\_khau VARCHAR(255) NOT NULL,

&#x20;   avatar NVARCHAR(500) NULL,

&#x20;   so\_tai\_khoan VARCHAR(50) NULL,

&#x20;   ten\_ngan\_hang NVARCHAR(150) NULL,

&#x20;   chu\_tai\_khoan NVARCHAR(150) NULL,

&#x20;   role\_id INT NOT NULL,

&#x20;   khoa\_phong NVARCHAR(100) NULL,

&#x20;   trang\_thai NVARCHAR(50) DEFAULT 'HOAT\_DONG',

&#x20;   created\_at DATETIME DEFAULT CURRENT\_TIMESTAMP,

&#x20;   updated\_at DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,

&#x20;   FOREIGN KEY (role\_id) REFERENCES VaiTro(role\_id)

);



\-- 3. Bảng Quỹ (Funds)

CREATE TABLE Quy (

&#x20;   quy\_id INT AUTO\_INCREMENT PRIMARY KEY,

&#x20;   ten\_quy NVARCHAR(200) NOT NULL,

&#x20;   mo\_ta NVARCHAR(500) NULL,

&#x20;   so\_du DECIMAL(18, 2) DEFAULT 0.00,

&#x20;   loai\_quy NVARCHAR(100) NOT NULL, -- Ví dụ: Học bổng, Hỗ trợ khẩn cấp...

&#x20;   trang\_thai NVARCHAR(50) DEFAULT 'DANG\_HOAT\_DONG',

&#x20;   ngay\_tao DATETIME DEFAULT CURRENT\_TIMESTAMP,

&#x20;   ngay\_cap\_nhat DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP

);



\-- 4. Bảng Nhà Tài Trợ (Donors)

CREATE TABLE NhaTaiTro (

&#x20;   nha\_tai\_tro\_id INT AUTO\_INCREMENT PRIMARY KEY,

&#x20;   ten\_nha\_tai\_tro NVARCHAR(200) NOT NULL,

&#x20;   loai NVARCHAR(50) DEFAULT 'CA\_NHAN', -- Ca nhan hoặc To chuc

&#x20;   email VARCHAR(150) NULL,

&#x20;   so\_dien\_thoai VARCHAR(20) NULL,

&#x20;   dia\_chi NVARCHAR(255) NULL,

&#x20;   ghi\_chu NVARCHAR(500) NULL,

&#x20;   ngay\_tao DATETIME DEFAULT CURRENT\_TIMESTAMP

);



\-- 5. Bảng Khoản Tài Trợ (Donations)

CREATE TABLE KhoanTaiTro (

&#x20;   khoan\_tai\_tro\_id INT AUTO\_INCREMENT PRIMARY KEY,

&#x20;   nha\_tai\_tro\_id INT NOT NULL,

&#x20;   quy\_id INT NOT NULL,

&#x20;   so\_tien DECIMAL(18, 2) NOT NULL,

&#x20;   hinh\_thuc\_thanh\_toan NVARCHAR(100) DEFAULT 'Chuyen khoan',

&#x20;   trang\_thai NVARCHAR(50) DEFAULT 'Cho duyet', -- Cho duyet, Da nhan, Tu choi

&#x20;   ngay\_tai\_tro DATETIME DEFAULT CURRENT\_TIMESTAMP,

&#x20;   minh\_chung\_anh VARCHAR(500) NULL,

&#x20;   FOREIGN KEY (nha\_tai\_tro\_id) REFERENCES NhaTaiTro(nha\_tai\_tro\_id),

&#x20;   FOREIGN KEY (quy\_id) REFERENCES Quy(quy\_id)

);



\-- 6. Bảng Yêu Cầu Hỗ Trợ (Applications/Requests)

CREATE TABLE YeuCauHoTro (

&#x20;   request\_id INT AUTO\_INCREMENT PRIMARY KEY,

&#x20;   user\_id INT NOT NULL, -- Người nộp đơn (Sinh viên)

&#x20;   quy\_id INT NOT NULL,

&#x20;   tieu\_de NVARCHAR(255) NOT NULL,

&#x20;   noi\_dung\_chi\_tiet TEXT NOT NULL,

&#x20;   so\_tien\_de\_xuat DECIMAL(18, 2) NOT NULL,

&#x20;   trang\_thai NVARCHAR(50) DEFAULT 'Cho xet duyet', -- Cho xet duyet, Da duyet, Tu choi, Da giai ngan

&#x20;   minh\_chung\_dinh\_kem VARCHAR(500) NULL,

&#x20;   ngay\_nop DATETIME DEFAULT CURRENT\_TIMESTAMP,

&#x20;   ngay\_cap\_nhat DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,

&#x20;   FOREIGN KEY (user\_id) REFERENCES NguoiDung(user\_id),

&#x20;   FOREIGN KEY (quy\_id) REFERENCES Quy(quy\_id)

);



\-- 7. Bảng Phê Duyệt (Approvals) - Lưu lịch sử duyệt nhiều cấp

CREATE TABLE PheDuyet (

&#x20;   phe\_duyet\_id INT AUTO\_INCREMENT PRIMARY KEY,

&#x20;   request\_id INT NOT NULL,

&#x20;   nguoi\_duyet\_id INT NOT NULL,

&#x20;   cap\_do\_duyet INT DEFAULT 1,

&#x20;   trang\_thai\_duyet NVARCHAR(50),

&#x20;   y\_kien\_phand\_hoi NVARCHAR(500),

&#x20;   ngay\_duyet DATETIME DEFAULT CURRENT\_TIMESTAMP,

&#x20;   FOREIGN KEY (request\_id) REFERENCES YeuCauHoTro(request\_id),

&#x20;   FOREIGN KEY (nguoi\_duyet\_id) REFERENCES NguoiDung(user\_id)

);



\-- 8. Bảng Giao Dịch (Transactions) - Lưu vết dòng tiền Thu/Chi thực tế

CREATE TABLE GiaoDich (

&#x20;   giao\_dich\_id INT AUTO\_INCREMENT PRIMARY KEY,

&#x20;   quy\_id INT NOT NULL,

&#x20;   khoan\_tai\_tro\_id INT NULL, -- Nếu là giao dịch Thu từ nhà tài trợ

&#x20;   request\_id INT NULL,        -- Nếu là giao dịch Chi cho sinh viên

&#x20;   loai\_giao\_dich NVARCHAR(50) NOT NULL, -- 'Thu' hoặc 'Chi'

&#x20;   so\_tien DECIMAL(18, 2) NOT NULL,

&#x20;   trang\_thai\_giao\_dich NVARCHAR(50) DEFAULT 'Cho xu ly',

&#x20;   minh\_chung\_chuyen\_khoan VARCHAR(500) NULL,

&#x20;   ghi\_chu NVARCHAR(255) NULL,

&#x20;   ngay\_giao\_dich DATETIME DEFAULT CURRENT\_TIMESTAMP,

&#x20;   ngay\_cap\_nhat DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,

&#x20;   

&#x20;   -- Ràng buộc logic: Phải liên kết với tài trợ hoặc yêu cầu hỗ trợ

&#x20;   CONSTRAINT chk\_nguon\_giao\_dich 

&#x20;       CHECK (khoan\_tai\_tro\_id IS NOT NULL OR request\_id IS NOT NULL),

&#x20;   

&#x20;   FOREIGN KEY (quy\_id) REFERENCES Quy(quy\_id) ON DELETE RESTRICT ON UPDATE CASCADE,

&#x20;   FOREIGN KEY (khoan\_tai\_tro\_id) REFERENCES KhoanTaiTro(khoan\_tai\_tro\_id),

&#x20;   FOREIGN KEY (request\_id) REFERENCES YeuCauHoTro(request\_id)

);

