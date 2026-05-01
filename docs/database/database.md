CREATE TABLE `nguoidung` (

&#x20; `user\_id` int(11) NOT NULL AUTO\_INCREMENT,

&#x20; `ma\_so\_dinh\_danh` varchar(20) NOT NULL,

&#x20; `ho\_ten` varchar(150) CHARACTER SET utf8 COLLATE utf8\_general\_ci NOT NULL,

&#x20; `email` varchar(150) NOT NULL,

&#x20; `mat\_khau` varchar(255) NOT NULL,

&#x20; `avatar` varchar(500) CHARACTER SET utf8 COLLATE utf8\_general\_ci DEFAULT NULL,

&#x20; `so\_tai\_khoan` varchar(50) DEFAULT NULL,

&#x20; `ten\_ngan\_hang` varchar(150) CHARACTER SET utf8 COLLATE utf8\_general\_ci DEFAULT NULL,

&#x20; `chu\_tai\_khoan` varchar(150) CHARACTER SET utf8 COLLATE utf8\_general\_ci DEFAULT NULL,

&#x20; `role\_id` int(11) NOT NULL,

&#x20; `khoa\_phong` varchar(100) CHARACTER SET utf8 COLLATE utf8\_general\_ci DEFAULT NULL,

&#x20; `trang\_thai` varchar(50) CHARACTER SET utf8 COLLATE utf8\_general\_ci NOT NULL DEFAULT 'HOAT\_DONG',

&#x20; `created\_at` datetime DEFAULT current\_timestamp(),

&#x20; PRIMARY KEY (`user\_id`),

&#x20; UNIQUE KEY `ma\_so\_dinh\_danh` (`ma\_so\_dinh\_danh`),

&#x20; UNIQUE KEY `email` (`email`),

&#x20; KEY `role\_id` (`role\_id`),

&#x20; CONSTRAINT `nguoidung\_ibfk\_1` FOREIGN KEY (`role\_id`) REFERENCES `vaitro` (`role\_id`)

) ENGINE=InnoDB AUTO\_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4\_general\_ci









CREATE TABLE `vaitro` (

&#x20; `role\_id` int(11) NOT NULL AUTO\_INCREMENT,

&#x20; `ten\_vai\_tro` varchar(100) CHARACTER SET utf8 COLLATE utf8\_general\_ci NOT NULL,

&#x20; `mo\_ta` varchar(255) CHARACTER SET utf8 COLLATE utf8\_general\_ci DEFAULT NULL,

&#x20; `trang\_thai` varchar(50) CHARACTER SET utf8 COLLATE utf8\_general\_ci DEFAULT 'HOAT\_DONG',

&#x20; PRIMARY KEY (`role\_id`),

&#x20; UNIQUE KEY `ten\_vai\_tro` (`ten\_vai\_tro`)

) ENGINE=InnoDB AUTO\_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4\_general\_ci









CREATE TABLE `quy` (

&#x20; `quy\_id` int(11) NOT NULL AUTO\_INCREMENT,

&#x20; `ten\_quy` varchar(150) CHARACTER SET utf8 COLLATE utf8\_general\_ci NOT NULL,

&#x20; `loai\_quy` enum('Tu thien','Hoc bong','Y te','Moi truong','Khac') NOT NULL,

&#x20; `mo\_ta` varchar(255) CHARACTER SET utf8 COLLATE utf8\_general\_ci DEFAULT NULL,

&#x20; `so\_du` decimal(18,2) NOT NULL DEFAULT 0.00,

&#x20; `ngay\_tao` datetime DEFAULT current\_timestamp(),

&#x20; `ngay\_cap\_nhat` datetime DEFAULT current\_timestamp() ON UPDATE current\_timestamp(),

&#x20; `trang\_thai` enum('Dang hoat dong','Tam dung','Da dong') NOT NULL DEFAULT 'Dang hoat dong',

&#x20; PRIMARY KEY (`quy\_id`)

) ENGINE=InnoDB AUTO\_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4\_general\_ci









CREATE TABLE `khoantaitro` (

&#x20; `khoan\_tai\_tro\_id` int(11) NOT NULL AUTO\_INCREMENT,

&#x20; `nha\_tai\_tro\_id` int(11) NOT NULL,

&#x20; `quy\_id` int(11) NOT NULL,

&#x20; `so\_tien` decimal(18,2) NOT NULL CHECK (`so\_tien` > 0),

&#x20; `hinh\_anh\_minh\_chung` varchar(500) DEFAULT NULL,

&#x20; `ngay\_tai\_tro` datetime DEFAULT current\_timestamp(),

&#x20; `trang\_thai` enum('Cho duyet','Da nhan','Tu choi') NOT NULL DEFAULT 'Cho duyet',

&#x20; `ghi\_chu` varchar(255) CHARACTER SET utf8 COLLATE utf8\_general\_ci DEFAULT NULL,

&#x20; `ngay\_cap\_nhat` datetime DEFAULT current\_timestamp() ON UPDATE current\_timestamp(),

&#x20; PRIMARY KEY (`khoan\_tai\_tro\_id`),

&#x20; KEY `nha\_tai\_tro\_id` (`nha\_tai\_tro\_id`),

&#x20; KEY `quy\_id` (`quy\_id`),

&#x20; CONSTRAINT `khoantaitro\_ibfk\_1` FOREIGN KEY (`nha\_tai\_tro\_id`) REFERENCES `nhataitro` (`nha\_tai\_tro\_id`) ON UPDATE CASCADE,

&#x20; CONSTRAINT `khoantaitro\_ibfk\_2` FOREIGN KEY (`quy\_id`) REFERENCES `quy` (`quy\_id`) ON UPDATE CASCADE

) ENGINE=InnoDB AUTO\_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4\_general\_ci






CREATE TABLE `yeucauhotro` (
  `request_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `quy_id` int(11) NOT NULL,
  `tieu_de` varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `mo_ta` text DEFAULT NULL,
  `so_tien_yeu_cau` decimal(18,2) NOT NULL CHECK (`so_tien_yeu_cau` > 0),
  `file_dinh_kem` varchar(500) DEFAULT NULL,
  `trang_thai` enum('Cho duyet','Dang xu ly','Cho giai ngan','Da giai ngan','Tu choi') NOT NULL DEFAULT 'Cho duyet',
  `ly_do_tu_choi` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `ngay_tao` datetime DEFAULT current_timestamp(),
  `ngay_cap_nhat` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`request_id`),
  KEY `user_id` (`user_id`),
  KEY `quy_id` (`quy_id`),
  CONSTRAINT `yeucauhotro_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `nguoidung` (`user_id`) ON UPDATE CASCADE,
  CONSTRAINT `yeucauhotro_ibfk_2` FOREIGN KEY (`quy_id`) REFERENCES `quy` (`quy_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci









CREATE TABLE `nhataitro` (

&#x20; `nha\_tai\_tro\_id` int(11) NOT NULL AUTO\_INCREMENT,

&#x20; `ten\_nha\_tai\_tro` varchar(150) CHARACTER SET utf8 COLLATE utf8\_general\_ci NOT NULL,

&#x20; `loai` varchar(50) CHARACTER SET utf8 COLLATE utf8\_general\_ci NOT NULL DEFAULT 'Ca nhan',

&#x20; `email` varchar(150) DEFAULT NULL,

&#x20; `so\_dien\_thoai` varchar(20) DEFAULT NULL,

&#x20; `dia\_chi` varchar(255) CHARACTER SET utf8 COLLATE utf8\_general\_ci DEFAULT NULL,

&#x20; `created\_at` datetime DEFAULT current\_timestamp(),

&#x20; PRIMARY KEY (`nha\_tai\_tro\_id`),

&#x20; UNIQUE KEY `email` (`email`),

&#x20; UNIQUE KEY `so\_dien\_thoai` (`so\_dien\_thoai`)

) ENGINE=InnoDB AUTO\_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4\_general\_ci











CREATE TABLE `giaodich` (

&#x20; `transaction\_id` int(11) NOT NULL AUTO\_INCREMENT,

&#x20; `quy\_id` int(11) NOT NULL,

&#x20; `khoan\_tai\_tro\_id` int(11) DEFAULT NULL,

&#x20; `request\_id` int(11) DEFAULT NULL,

&#x20; `nguoi\_tao\_id` int(11) DEFAULT NULL,

&#x20; `so\_tien` decimal(18,2) NOT NULL CHECK (`so\_tien` > 0),

&#x20; `loai` enum('Thu','Chi') NOT NULL,

&#x20; `trang\_thai` enum('Cho xu ly','Thanh cong','That bai','Hoan tien') NOT NULL DEFAULT 'Cho xu ly',

&#x20; `minh\_chung\_chuyen\_khoan` varchar(500) DEFAULT NULL,

&#x20; `ghi\_chu` varchar(255) CHARACTER SET utf8 COLLATE utf8\_general\_ci DEFAULT NULL,

&#x20; `ngay\_giao\_dich` datetime DEFAULT current\_timestamp(),

&#x20; `ngay\_cap\_nhat` datetime DEFAULT current\_timestamp() ON UPDATE current\_timestamp(),

&#x20; PRIMARY KEY (`transaction\_id`),

&#x20; KEY `quy\_id` (`quy\_id`),

&#x20; KEY `khoan\_tai\_tro\_id` (`khoan\_tai\_tro\_id`),

&#x20; KEY `request\_id` (`request\_id`),

&#x20; KEY `nguoi\_tao\_id` (`nguoi\_tao\_id`),

&#x20; CONSTRAINT `giaodich\_ibfk\_1` FOREIGN KEY (`quy\_id`) REFERENCES `quy` (`quy\_id`) ON UPDATE CASCADE,

&#x20; CONSTRAINT `giaodich\_ibfk\_2` FOREIGN KEY (`khoan\_tai\_tro\_id`) REFERENCES `khoantaitro` (`khoan\_tai\_tro\_id`) ON UPDATE CASCADE,

&#x20; CONSTRAINT `giaodich\_ibfk\_3` FOREIGN KEY (`request\_id`) REFERENCES `yeucauhotro` (`request\_id`) ON UPDATE CASCADE,

&#x20; CONSTRAINT `giaodich\_ibfk\_4` FOREIGN KEY (`nguoi\_tao\_id`) REFERENCES `nguoidung` (`user\_id`) ON DELETE SET NULL ON UPDATE CASCADE,

&#x20; CONSTRAINT `chk\_nguon\_giao\_dich` CHECK (`khoan\_tai\_tro\_id` is not null or `request\_id` is not null)

) ENGINE=InnoDB AUTO\_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4\_general\_ci











CREATE TABLE `pheduyet` (

&#x20; `phe\_duyet\_id` int(11) NOT NULL AUTO\_INCREMENT,

&#x20; `request\_id` int(11) NOT NULL,

&#x20; `nguoi\_duyet\_id` int(11) NOT NULL,

&#x20; `cap\_do\_duyet` int(11) NOT NULL CHECK (`cap\_do\_duyet` between 1 and 5),

&#x20; `ket\_qua` enum('Cho duyet','Da duyet','Tu choi','Yeu cau bo sung') NOT NULL DEFAULT 'Cho duyet',

&#x20; `ghi\_chu` varchar(255) CHARACTER SET utf8 COLLATE utf8\_general\_ci DEFAULT NULL,

&#x20; `ly\_do\_tu\_choi` varchar(255) CHARACTER SET utf8 COLLATE utf8\_general\_ci DEFAULT NULL,

&#x20; `ngay\_tao` datetime DEFAULT current\_timestamp(),

&#x20; `ngay\_duyet` datetime DEFAULT NULL,

&#x20; `ngay\_cap\_nhat` datetime DEFAULT current\_timestamp() ON UPDATE current\_timestamp(),

&#x20; PRIMARY KEY (`phe\_duyet\_id`),

&#x20; KEY `request\_id` (`request\_id`),

&#x20; KEY `nguoi\_duyet\_id` (`nguoi\_duyet\_id`),

&#x20; CONSTRAINT `pheduyet\_ibfk\_1` FOREIGN KEY (`request\_id`) REFERENCES `yeucauhotro` (`request\_id`) ON UPDATE CASCADE,

&#x20; CONSTRAINT `pheduyet\_ibfk\_2` FOREIGN KEY (`nguoi\_duyet\_id`) REFERENCES `nguoidung` (`user\_id`) ON UPDATE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4\_general\_ci













