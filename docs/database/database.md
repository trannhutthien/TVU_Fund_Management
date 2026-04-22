CREATE TABLE VaiTro (

&#x20;   role\_id INT AUTO\_INCREMENT PRIMARY KEY,

&#x20;   ten\_vai\_tro NVARCHAR(100) NOT NULL UNIQUE,

&#x20;   mo\_ta NVARCHAR(255) NULL,

&#x20;   trang\_thai NVARCHAR(50) DEFAULT 'HOAT\_DONG'

);



CREATE TABLE NguoiDung (

&#x20;   user\_id INT AUTO\_INCREMENT PRIMARY KEY,



&#x20;   ma\_so\_dinh\_danh VARCHAR(20) NOT NULL UNIQUE,

&#x20;   ho\_ten NVARCHAR(150) NOT NULL,

&#x20;   email VARCHAR(150) NOT NULL UNIQUE,

&#x20;   mat\_khau VARCHAR(255) NOT NULL,



&#x20;   avatar NVARCHAR(500) NULL,

&#x20;   so\_tai\_khoan VARCHAR(50) NULL,

&#x20;   ten\_ngan\_hang NVARCHAR(150) NULL,

&#x20;   chu\_tai\_khoan NVARCHAR(150) NULL,



&#x20;   role\_id INT NOT NULL,

&#x20;   khoa\_phong NVARCHAR(100) NULL,

&#x20;   trang\_thai NVARCHAR(50) NOT NULL DEFAULT 'HOAT\_DONG',



&#x20;   FOREIGN KEY (role\_id) REFERENCES VaiTro(role\_id)

);



CREATE TABLE NhaTaiTro (

&#x20;   nha\_tai\_tro\_id INT AUTO\_INCREMENT PRIMARY KEY,



&#x20;   ten\_nha\_tai\_tro NVARCHAR(150) NOT NULL,           -- Tên bắt buộc phải có

&#x20;   loai NVARCHAR(50) NOT NULL DEFAULT 'Ca nhan',     -- Mặc định là cá nhân



&#x20;   email VARCHAR(150) UNIQUE,                        -- Email không trùng, có thể NULL

&#x20;   so\_dien\_thoai VARCHAR(20) UNIQUE,                 -- SĐT không trùng, có thể NULL



&#x20;   dia\_chi NVARCHAR(255),                            -- Địa chỉ không bắt buộc



&#x20;   created\_at DATETIME DEFAULT CURRENT\_TIMESTAMP     -- Tự động lưu ngày tạo

);



CREATE TABLE Quy (

&#x20;   quy\_id INT AUTO\_INCREMENT PRIMARY KEY,



&#x20;   ten\_quy NVARCHAR(150) NOT NULL,                         -- Tên quỹ bắt buộc

&#x20;   loai\_quy ENUM('Tu thien', 'Hoc bong', 'Y te', 

&#x20;                 'Moi truong', 'Khac') NOT NULL,           -- Giới hạn loại quỹ



&#x20;   mo\_ta NVARCHAR(255),                                    -- Mô tả không bắt buộc



&#x20;   so\_du DECIMAL(18, 2) NOT NULL DEFAULT 0.00,             -- Số dư quỹ, mặc định 0



&#x20;   ngay\_tao DATETIME DEFAULT CURRENT\_TIMESTAMP,            -- Tự động lấy ngày tạo

&#x20;   ngay\_cap\_nhat DATETIME DEFAULT CURRENT\_TIMESTAMP 

&#x20;                 ON UPDATE CURRENT\_TIMESTAMP,              -- Tự cập nhật khi sửa



&#x20;   trang\_thai ENUM('Dang hoat dong', 'Tam dung', 

&#x20;                   'Da dong') NOT NULL DEFAULT 'Dang hoat dong' -- Mặc định đang hoạt động

);



CREATE TABLE KhoanTaiTro (

&#x20;   khoan\_tai\_tro\_id INT AUTO\_INCREMENT PRIMARY KEY,



&#x20;   nha\_tai\_tro\_id INT NOT NULL,                        -- Bắt buộc phải có nhà tài trợ

&#x20;   quy\_id INT NOT NULL,                                -- Bắt buộc phải thuộc về 1 quỹ



&#x20;   so\_tien DECIMAL(18, 2) NOT NULL CHECK (so\_tien > 0), -- Bắt buộc, phải lớn hơn 0



&#x20;   hinh\_anh\_minh\_chung VARCHAR(500),                   -- Không bắt buộc (có thể chưa có)



&#x20;   ngay\_tai\_tro DATETIME DEFAULT CURRENT\_TIMESTAMP,    -- Tự động lấy ngày hiện tại



&#x20;   trang\_thai ENUM('Cho duyet', 'Da nhan', 

&#x20;                   'Tu choi') NOT NULL 

&#x20;                   DEFAULT 'Cho duyet',                -- Mặc định chờ duyệt



&#x20;   ghi\_chu NVARCHAR(255),                              -- Không bắt buộc



&#x20;   ngay\_cap\_nhat DATETIME DEFAULT CURRENT\_TIMESTAMP

&#x20;                 ON UPDATE CURRENT\_TIMESTAMP,          -- Tự cập nhật khi sửa



&#x20;   -- Khóa ngoại có ON DELETE \& ON UPDATE

&#x20;   FOREIGN KEY (nha\_tai\_tro\_id) 

&#x20;       REFERENCES NhaTaiTro(nha\_tai\_tro\_id)

&#x20;       ON DELETE RESTRICT                              -- Không cho xóa nhà tài trợ nếu còn khoản

&#x20;       ON UPDATE CASCADE,                              -- Cập nhật ID tự động theo



&#x20;   FOREIGN KEY (quy\_id) 

&#x20;       REFERENCES Quy(quy\_id)

&#x20;       ON DELETE RESTRICT                              -- Không cho xóa quỹ nếu còn khoản

&#x20;       ON UPDATE CASCADE

);





CREATE TABLE YeuCauHoTro (

&#x20;   request\_id INT AUTO\_INCREMENT PRIMARY KEY,



&#x20;   user\_id INT NOT NULL,                               -- Bắt buộc biết ai gửi yêu cầu

&#x20;   quy\_id INT NOT NULL,                                -- Bắt buộc biết yêu cầu từ quỹ nào



&#x20;   tieu\_de NVARCHAR(200) NOT NULL,                     -- Bắt buộc phải có tiêu đề

&#x20;   mo\_ta TEXT,                                         -- Mô tả chi tiết, không bắt buộc



&#x20;   so\_tien\_yeu\_cau DECIMAL(18, 2) NOT NULL 

&#x20;                   CHECK (so\_tien\_yeu\_cau > 0),        -- Bắt buộc, phải lớn hơn 0



&#x20;   file\_dinh\_kem VARCHAR(500),                         -- Không bắt buộc (có thể chưa có)



&#x20;   trang\_thai ENUM('Cho duyet', 'Dang xu ly',

&#x20;                   'Da duyet', 'Tu choi') NOT NULL

&#x20;                   DEFAULT 'Cho duyet',                -- Mặc định chờ duyệt



&#x20;   nguoi\_duyet\_id INT,                                 -- Ai duyệt (NULL nếu chưa duyệt)

&#x20;   ngay\_duyet DATETIME,                                -- Ngày duyệt (NULL nếu chưa duyệt)

&#x20;   ly\_do\_tu\_choi NVARCHAR(255),                        -- Lý do từ chối (NULL nếu được duyệt)



&#x20;   ngay\_tao DATETIME DEFAULT CURRENT\_TIMESTAMP,        -- Tự động lấy ngày tạo

&#x20;   ngay\_cap\_nhat DATETIME DEFAULT CURRENT\_TIMESTAMP

&#x20;                 ON UPDATE CURRENT\_TIMESTAMP,          -- Tự cập nhật khi sửa



&#x20;   -- Khóa ngoại

&#x20;   FOREIGN KEY (user\_id)

&#x20;       REFERENCES NguoiDung(user\_id)

&#x20;       ON DELETE RESTRICT                              -- Không cho xóa user nếu còn yêu cầu

&#x20;       ON UPDATE CASCADE,



&#x20;   FOREIGN KEY (quy\_id)

&#x20;       REFERENCES Quy(quy\_id)

&#x20;       ON DELETE RESTRICT                              -- Không cho xóa quỹ nếu còn yêu cầu

&#x20;       ON UPDATE CASCADE,



&#x20;   FOREIGN KEY (nguoi\_duyet\_id)

&#x20;       REFERENCES NguoiDung(user\_id)

&#x20;       ON DELETE SET NULL                              -- Nếu người duyệt bị xóa thì để NULL

&#x20;       ON UPDATE CASCADE

);





CREATE TABLE PheDuyet (

&#x20;   phe\_duyet\_id INT AUTO\_INCREMENT PRIMARY KEY,



&#x20;   request\_id INT NOT NULL,                            -- Bắt buộc phải thuộc yêu cầu nào

&#x20;   nguoi\_duyet\_id INT NOT NULL,                        -- Bắt buộc phải biết ai duyệt



&#x20;   cap\_do\_duyet INT NOT NULL 

&#x20;                CHECK (cap\_do\_duyet BETWEEN 1 AND 5), -- Cấp duyệt từ 1 đến 5



&#x20;   ket\_qua ENUM('Cho duyet', 'Da duyet', 

&#x20;                'Tu choi', 'Yeu cau bo sung') 

&#x20;           NOT NULL DEFAULT 'Cho duyet',              -- Mặc định chờ duyệt



&#x20;   ghi\_chu NVARCHAR(255),                             -- Không bắt buộc

&#x20;   ly\_do\_tu\_choi NVARCHAR(255),                       -- Chỉ có khi từ chối



&#x20;   ngay\_tao DATETIME DEFAULT CURRENT\_TIMESTAMP,       -- Tự động ghi ngày tạo bản ghi

&#x20;   ngay\_duyet DATETIME,                               -- NULL nếu chưa duyệt, cập nhật khi duyệt

&#x20;   ngay\_cap\_nhat DATETIME DEFAULT CURRENT\_TIMESTAMP

&#x20;                 ON UPDATE CURRENT\_TIMESTAMP,         -- Tự cập nhật khi sửa



&#x20;   -- Khóa ngoại

&#x20;   FOREIGN KEY (request\_id)

&#x20;       REFERENCES YeuCauHoTro(request\_id)

&#x20;       ON DELETE RESTRICT                             -- Không cho xóa yêu cầu nếu còn phê duyệt

&#x20;       ON UPDATE CASCADE,



&#x20;   FOREIGN KEY (nguoi\_duyet\_id)

&#x20;       REFERENCES NguoiDung(user\_id)

&#x20;       ON DELETE RESTRICT                             -- Không cho xóa người duyệt nếu còn bản ghi

&#x20;       ON UPDATE CASCADE

);





CREATE TABLE GiaoDich (

&#x20;   transaction\_id INT AUTO\_INCREMENT PRIMARY KEY,



&#x20;   quy\_id INT NOT NULL,                                    -- Bắt buộc biết tiền vào/ra quỹ nào

&#x20;   khoan\_tai\_tro\_id INT,                                   -- NULL nếu là giao dịch giải ngân

&#x20;   request\_id INT,                                         -- NULL nếu là giao dịch tài trợ



&#x20;   nguoi\_tao\_id INT,                                       -- Ai tạo giao dịch (NULL nếu tự động)



&#x20;   so\_tien DECIMAL(18, 2) NOT NULL 

&#x20;           CHECK (so\_tien > 0),                            -- Bắt buộc, phải lớn hơn 0



&#x20;   loai ENUM('Thu', 'Chi') NOT NULL,                       -- Chỉ có 2 loại: thu vào hoặc chi ra



&#x20;   trang\_thai ENUM('Cho xu ly', 'Thanh cong', 

&#x20;                   'That bai', 'Hoan tien') 

&#x20;              NOT NULL DEFAULT 'Cho xu ly',                -- Mặc định chờ xử lý



&#x20;   minh\_chung\_chuyen\_khoan VARCHAR(500),                   -- Không bắt buộc



&#x20;   ghi\_chu NVARCHAR(255),                                  -- Ghi chú thêm nếu cần



&#x20;   ngay\_giao\_dich DATETIME DEFAULT CURRENT\_TIMESTAMP,      -- Tự động lấy ngày giao dịch

&#x20;   ngay\_cap\_nhat DATETIME DEFAULT CURRENT\_TIMESTAMP

&#x20;                 ON UPDATE CURRENT\_TIMESTAMP,              -- Tự cập nhật khi sửa



&#x20;   -- Ràng buộc: phải có 1 trong 2 (tài trợ hoặc yêu cầu hỗ trợ)

&#x20;   CONSTRAINT chk\_nguon\_giao\_dich 

&#x20;       CHECK (khoan\_tai\_tro\_id IS NOT NULL 

&#x20;              OR request\_id IS NOT NULL),



&#x20;   -- Khóa ngoại

&#x20;   FOREIGN KEY (quy\_id)

&#x20;       REFERENCES Quy(quy\_id)

&#x20;       ON DELETE RESTRICT

&#x20;       ON UPDATE CASCADE,



&#x20;   FOREIGN KEY (khoan\_tai\_tro\_id)

&#x20;       REFERENCES KhoanTaiTro(khoan\_tai\_tro\_id)

&#x20;       ON DELETE RESTRICT

&#x20;       ON UPDATE CASCADE,



&#x20;   FOREIGN KEY (request\_id)

&#x20;       REFERENCES YeuCauHoTro(request\_id)

&#x20;       ON DELETE RESTRICT

&#x20;       ON UPDATE CASCADE,



&#x20;   FOREIGN KEY (nguoi\_tao\_id)

&#x20;       REFERENCES NguoiDung(user\_id)

&#x20;       ON DELETE SET NULL                                  -- Người tạo bị xóa thì để NULL

&#x20;       ON UPDATE CASCADE

);

