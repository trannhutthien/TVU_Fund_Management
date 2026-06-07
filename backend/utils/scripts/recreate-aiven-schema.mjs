import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

async function recreate() {
  const conn = await mysql.createConnection({
    host: 'mysql-735ef23-trannhutthien012345-f859.b.aivencloud.com',
    user: 'avnadmin',
    password: 'AVNS_aSpzodktBU9qxNVmx7o',
    port: 23536,
    database: 'defaultdb',
    ssl: { rejectUnauthorized: false },
    multipleStatements: true
  });
  console.log('Connected');

  await conn.query('SET FOREIGN_KEY_CHECKS = 0');
  const [tables] = await conn.query('SHOW TABLES');
  for (const t of tables) {
    const name = Object.values(t)[0];
    await conn.query('DROP TABLE IF EXISTS ' + name);
  }
  await conn.query('SET FOREIGN_KEY_CHECKS = 1');
  console.log('Dropped all tables');

  const schemas = [
    `CREATE TABLE vaitro (
      vaitro_id INT AUTO_INCREMENT PRIMARY KEY,
      tenvaitro VARCHAR(50) NOT NULL,
      mota TEXT NULL,
      trangthai ENUM('Hoat dong', 'Tam dung') DEFAULT 'Hoat dong',
      ngaytao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ngaycapnhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uk_tenvaitro (tenvaitro)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE nguoidung (
      nguoidung_id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(100) NOT NULL,
      matkhau VARCHAR(255) NOT NULL,
      hoten VARCHAR(100) NOT NULL,
      masodinhdanh VARCHAR(20) NULL,
      ngaysinh DATE NULL,
      gioitinh ENUM('Nam', 'Nu', 'Khac') NULL,
      sodienthoai VARCHAR(15) NULL,
      diachi TEXT NULL,
      khoaphong VARCHAR(100) NULL,
      nganhhoc VARCHAR(100) NULL,
      lop VARCHAR(50) NULL,
      khoahoc VARCHAR(20) NULL,
      taikhoannganhang_id INT NULL,
      avatar VARCHAR(255) NULL,
      vaitro_id INT NOT NULL DEFAULT 4,
      loaitaikhoan VARCHAR(50) NULL,
      donvihoc_id INT NULL,
      trangthai ENUM('Hoat dong', 'Khoa', 'Cho duyet') DEFAULT 'Hoat dong',
      ngaytao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ngaycapnhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uk_email (email),
      INDEX idx_vaitro_id (vaitro_id),
      INDEX idx_trangthai (trangthai)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE donvihoc (
      donvihoc_id INT AUTO_INCREMENT PRIMARY KEY,
      madonvi VARCHAR(50) NOT NULL,
      tenkhoa VARCHAR(100) NOT NULL,
      trangthai ENUM('Hoat dong', 'Khong hoat dong') DEFAULT 'Hoat dong',
      ngaytao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uk_madonvi (madonvi)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE nhataitro (
      nhataitro_id INT AUTO_INCREMENT PRIMARY KEY,
      tennhataitro VARCHAR(200) NOT NULL,
      loainhataitro ENUM('Ca nhan', 'To chuc', 'Doanh nghiep') NOT NULL,
      email VARCHAR(100) NULL,
      sodienthoai VARCHAR(15) NULL,
      diachi TEXT NULL,
      website VARCHAR(255) NULL,
      mota TEXT NULL,
      logo VARCHAR(255) NULL,
      nguoidung_id INT NULL,
      trangthai ENUM('Hoat dong', 'Ngung hoat dong') DEFAULT 'Hoat dong',
      ngaytao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ngaycapnhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_trangthai (trangthai),
      FOREIGN KEY (nguoidung_id) REFERENCES nguoidung(nguoidung_id) ON DELETE SET NULL ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE loaiquy (
      loaiquy_id INT AUTO_INCREMENT PRIMARY KEY,
      maloai VARCHAR(50) NOT NULL,
      tenloai VARCHAR(100) NOT NULL,
      ngaytao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uk_maloai (maloai)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE quy (
      quy_id INT AUTO_INCREMENT PRIMARY KEY,
      tenquy VARCHAR(200) NOT NULL,
      loaiquy_id INT NULL,
      mota TEXT NULL,
      hinhanh VARCHAR(255) NULL,
      sotienduongmuctieu DECIMAL(15,2) NOT NULL DEFAULT 0,
      sodu DECIMAL(15,2) NOT NULL DEFAULT 0,
      sotienhotrotoida DECIMAL(15,2) NULL,
      soluonghotrotoida INT NULL,
      dieukienhotro TEXT NULL,
      ngaybatdau DATE NULL,
      ngayketthuc DATE NULL,
      trangthai ENUM('Dang hoat dong', 'Tam dung', 'Da dong') DEFAULT 'Dang hoat dong',
      nguoitao_id INT NULL,
      ngaytao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ngaycapnhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_trangthai (trangthai),
      FOREIGN KEY (loaiquy_id) REFERENCES loaiquy(loaiquy_id) ON DELETE SET NULL ON UPDATE CASCADE,
      FOREIGN KEY (nguoitao_id) REFERENCES nguoidung(nguoidung_id) ON DELETE SET NULL ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE yeucauhotro (
      yeucauhotro_id INT AUTO_INCREMENT PRIMARY KEY,
      nguoidung_id INT NOT NULL,
      quy_id INT NOT NULL,
      lydo TEXT NOT NULL,
      sotiendenghi DECIMAL(15,2) NOT NULL,
      tailieudinhkem TEXT NULL,
      trangthai ENUM('Cho duyet cap 1','Da duyet cap 1','Tu choi cap 1','Cho duyet cap 2','Da duyet cap 2','Tu choi cap 2','Cho duyet cap 3','Da duyet cap 3','Tu choi cap 3','Cho giai ngan','Da giai ngan','Tu choi') DEFAULT 'Cho duyet cap 1',
      ghichu TEXT NULL,
      ngaynop TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ngaycapnhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (nguoidung_id) REFERENCES nguoidung(nguoidung_id) ON DELETE CASCADE ON UPDATE CASCADE,
      FOREIGN KEY (quy_id) REFERENCES quy(quy_id) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE pheduyet (
      pheduyet_id INT AUTO_INCREMENT PRIMARY KEY,
      yeucauhotro_id INT NOT NULL,
      capduyet TINYINT NOT NULL,
      nguoiduyet_id INT NOT NULL,
      ketqua ENUM('Duyet', 'Tu choi') NOT NULL,
      lydo TEXT NULL,
      ghichu TEXT NULL,
      ngayduyet TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (yeucauhotro_id) REFERENCES yeucauhotro(yeucauhotro_id) ON DELETE CASCADE ON UPDATE CASCADE,
      FOREIGN KEY (nguoiduyet_id) REFERENCES nguoidung(nguoidung_id) ON DELETE RESTRICT ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE khoantaitro (
      khoantaitro_id INT AUTO_INCREMENT PRIMARY KEY,
      nhataitro_id INT NOT NULL,
      quy_id INT NOT NULL,
      sotien DECIMAL(15,2) NOT NULL,
      hinhthuc ENUM('Tien mat', 'Chuyen khoan', 'Khac') NOT NULL,
      magiaodich VARCHAR(100) NULL,
      ngaytaitro DATE NOT NULL,
      chungtu VARCHAR(255) NULL,
      trangthai ENUM('Cho xac nhan', 'Da nhan', 'Tu choi') DEFAULT 'Cho xac nhan',
      ghichu TEXT NULL,
      nguoixacnhan_id INT NULL,
      ngayxacnhan TIMESTAMP NULL,
      ngaytao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ngaycapnhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (nhataitro_id) REFERENCES nhataitro(nhataitro_id) ON DELETE RESTRICT ON UPDATE CASCADE,
      FOREIGN KEY (quy_id) REFERENCES quy(quy_id) ON DELETE RESTRICT ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE giaodich (
      giaodich_id INT AUTO_INCREMENT PRIMARY KEY,
      yeucauhotro_id INT NOT NULL,
      quy_id INT NOT NULL,
      nguoinhan_id INT NOT NULL,
      sotien DECIMAL(15,2) NOT NULL,
      hinhthuc ENUM('Tien mat', 'Chuyen khoan') NOT NULL,
      magiaodich VARCHAR(100) NULL,
      chungtu VARCHAR(255) NULL,
      trangthai ENUM('Thanh cong', 'That bai', 'Dang xu ly') DEFAULT 'Dang xu ly',
      ghichu TEXT NULL,
      nguoithuchien_id INT NOT NULL,
      ngaygiaodich TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ngaycapnhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (yeucauhotro_id) REFERENCES yeucauhotro(yeucauhotro_id) ON DELETE RESTRICT ON UPDATE CASCADE,
      FOREIGN KEY (quy_id) REFERENCES quy(quy_id) ON DELETE RESTRICT ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE taikhoannganhang (
      taikhoannganhang_id INT AUTO_INCREMENT PRIMARY KEY,
      quy_id INT NULL,
      sotaikhoan VARCHAR(50) NOT NULL,
      nganhang VARCHAR(100) NOT NULL,
      chinhanh VARCHAR(100) NULL,
      chutaikhoan VARCHAR(100) NOT NULL,
      trangthai ENUM('Hoat dong', 'Khoa') DEFAULT 'Hoat dong',
      ngaytao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ngaycapnhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (quy_id) REFERENCES quy(quy_id) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE sinhviennoibat (
      sinhviennoibat_id INT AUTO_INCREMENT PRIMARY KEY,
      nguoidung_id INT NULL,
      hoten VARCHAR(100) NOT NULL,
      khoa VARCHAR(100) NULL,
      khoahoc VARCHAR(20) NULL,
      hinhanh VARCHAR(255) NULL,
      thanhtich TEXT NULL,
      solanhotro INT DEFAULT 0,
      tongtienhotro DECIMAL(15,2) DEFAULT 0,
      thutu INT DEFAULT 0,
      trangthai ENUM('Hien thi', 'An') DEFAULT 'Hien thi',
      ngaytao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ngaycapnhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (nguoidung_id) REFERENCES nguoidung(nguoidung_id) ON DELETE SET NULL ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE nhatkyhethong (
      nhatkyhethong_id INT AUTO_INCREMENT PRIMARY KEY,
      nguoidung_id INT NULL,
      hanhdong VARCHAR(100) NOT NULL,
      loaidoituong VARCHAR(50) NULL,
      doituong_id INT NULL,
      mota TEXT NULL,
      dulieucu JSON NULL,
      dulieumoi JSON NULL,
      ipaddress VARCHAR(45) NULL,
      ngaytao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (nguoidung_id) REFERENCES nguoidung(nguoidung_id) ON DELETE SET NULL ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
  ];

  for (const sql of schemas) {
    await conn.query(sql);
    const match = sql.match(/CREATE TABLE (\w+)/);
    console.log('Created:', match[1]);
  }

  // Seed
  await conn.query('INSERT INTO vaitro (vaitro_id, tenvaitro, mota) VALUES (1, ?, ?)', ['Admin', 'Quan tri vien']);
  await conn.query('INSERT INTO vaitro (vaitro_id, tenvaitro, mota) VALUES (2, ?, ?)', ['KeToan', 'Ke toan']);
  await conn.query('INSERT INTO vaitro (vaitro_id, tenvaitro, mota) VALUES (3, ?, ?)', ['CanBoQuy', 'Can bo quy']);
  await conn.query('INSERT INTO vaitro (vaitro_id, tenvaitro, mota) VALUES (4, ?, ?)', ['NguoiDung', 'Nguoi dung']);
  console.log('Seeded: vaitro');

  const hash = await bcrypt.hash('123456', 10);
  const users = [
    ['admin@tvu.edu.vn', hash, 'Admin TVU', 1, null, 'Hoat dong'],
    ['ketoan@tvu.edu.vn', hash, 'Ke toan TVU', 2, null, 'Hoat dong'],
    ['canboquy@tvu.edu.vn', hash, 'Can bo quy TVU', 3, null, 'Hoat dong'],
    ['sinhvien@tvu.edu.vn', hash, 'Sinh vien Test', 4, 'Sinh vien', 'Hoat dong'],
    ['nhataitro@tvu.edu.vn', hash, 'Nha tai tro Test', 4, 'Nha tai tro', 'Hoat dong']
  ];
  for (const u of users) {
    await conn.query('INSERT INTO nguoidung (email, matkhau, hoten, vaitro_id, loaitaikhoan, trangthai) VALUES (?, ?, ?, ?, ?, ?)', u);
  }
  console.log('Seeded: 5 users');

  const [count] = await conn.query('SELECT COUNT(*) as cnt FROM nguoidung');
  console.log('Total users:', count[0].cnt);
  await conn.end();
  console.log('DONE!');
}

recreate().catch(e => console.error('FATAL:', e.message));
