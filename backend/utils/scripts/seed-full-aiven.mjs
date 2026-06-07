import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

async function seedFull() {
  const conn = await mysql.createConnection({
    host: 'mysql-735ef23-trannhutthien012345-f859.b.aivencloud.com',
    user: 'avnadmin',
    password: 'AVNS_aSpzodktBU9qxNVmx7o',
    port: 23536,
    database: 'defaultdb',
    ssl: { rejectUnauthorized: false },
    multipleStatements: true
  });
  console.log('Connected to Aiven MySQL');

  // === LOAI QUY ===
  const loaiQuy = [
    ['DT', 'Dao tao'],
    ['NC', 'Nghien cuu'],
    ['CTXH', 'Cong dong xa hoi'],
    ['KHQT', 'Hop tac quoc te'],
    ['KHC', 'Khac']
  ];
  for (const [maloai, tenloai] of loaiQuy) {
    await conn.query('INSERT IGNORE INTO loaiquy (maloai, tenloai) VALUES (?, ?)', [maloai, tenloai]);
  }
  console.log('Seeded: loaiquy');

  // === DON VI HOC ===
  const donViHoc = [
    ['DV001', 'Khoa Cong nghe Thong tin'],
    ['DV002', 'Khoa Kinh te'],
    ['DV003', 'Khoa Ky thuat'],
    ['DV004', 'Khoa Ngoai ngu'],
    ['DV005', 'Khoa Luat']
  ];
  for (const [madonvi, tenkhoa] of donViHoc) {
    await conn.query('INSERT IGNORE INTO donvihoc (madonvi, tenkhoa) VALUES (?, ?)', [madonvi, tenkhoa]);
  }
  console.log('Seeded: donvihoc');

  // === USERS (them sinh vien + nhan vien) ===
  const hash = await bcrypt.hash('123456', 10);
  const extraUsers = [
    ['sinhvien1@tvu.edu.vn', hash, 'Nguyen Van An', 4, 'Sinh vien', 'Hoat dong', 'Khoa Cong nghe Thong tin', 'CNTT', '20CNTT01', '2020-2024'],
    ['sinhvien2@tvu.edu.vn', hash, 'Tran Thi Binh', 4, 'Sinh vien', 'Hoat dong', 'Khoa Kinh te', 'Kinh te', '20KTE01', '2020-2024'],
    ['sinhvien3@tvu.edu.vn', hash, 'Le Minh Chau', 4, 'Sinh vien', 'Hoat dong', 'Khoa Ky thuat', 'Ky thuat', '20KT001', '2022-2023'],
    ['sinhvien4@tvu.edu.vn', hash, 'Pham Thi Dung', 4, 'Sinh vien', 'Hoat dong', 'Khoa Ngoai ngu', 'Ngoai ngu', '20NN001', '2023-2024'],
    ['sinhvien5@tvu.edu.vn', hash, 'Hoang Van Em', 4, 'Sinh vien', 'Hoat dong', 'Khoa Luat', 'Luat', '20LUAT01', '2021-2025'],
    ['nhataitro1@tvu.edu.vn', hash, 'Vingroup', 4, 'Nha tai tro', 'Hoat dong', null, null, null, null],
    ['nhataitro2@tvu.edu.vn', hash, 'Vinamilk', 4, 'Nha tai tro', 'Hoat dong', null, null, null, null],
    ['nhataitro3@tvu.edu.vn', hash, 'Masan Group', 4, 'Nha tai tro', 'Hoat dong', null, null, null, null],
    ['nhataitro4@tvu.edu.vn', hash, 'TH True Milk', 4, 'Nha tai tro', 'Hoat dong', null, null, null, null],
  ];
  for (const u of extraUsers) {
    await conn.query(
      'INSERT IGNORE INTO nguoidung (email, matkhau, hoten, vaitro_id, loaitaikhoan, trangthai, khoaphong, nganhhoc, lop, khoahoc) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      u
    );
  }
  console.log('Seeded: extra users');

  // === NHATAITRO ===
  const nhaTaiTro = [
    ['Vingroup', 'Doanh nghiep', 'contact@vingroup.net', '024-12345678', 'Ha Noi', 'https://vingroup.net', 'Tap doan Cong nghe', null, 6, 'Hoat dong'],
    ['Vinamilk', 'Doanh nghiep', 'info@vinamilk.com.vn', '028-87654321', 'TP HCM', 'https://vinamilk.com.vn', 'Cong ty CP Sua Vietnam', null, 7, 'Hoat dong'],
    ['Masan Group', 'Doanh nghiep', 'contact@masan.com.vn', '028-11223344', 'TP HCM', 'https://masan.com.vn', 'Tap doan Masan', null, 8, 'Hoat dong'],
    ['TH True Milk', 'Doanh nghiep', 'info@thmilk.vn', '024-55667788', 'Ha Noi', 'https://thmilk.vn', 'Cong ty TH True Milk', null, 9, 'Hoat dong'],
  ];
  for (const n of nhaTaiTro) {
    await conn.query(
      'INSERT IGNORE INTO nhataitro (tennhataitro, loainhataitro, email, sodienthoai, diachi, website, mota, logo, nguoidung_id, trangthai) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      n
    );
  }
  console.log('Seeded: nhataitro');

  // === QUY ===
  const quy = [
    ['Quy Hoc Bong SV xuat sac', 1, 'Ho tro hoc bong cho sinh vien hoc gioi', 500000000, 150000000, 10000000, 50, 'GPA >= 3.5', '2024-01-01', '2024-12-31', 'Dang hoat dong', 1],
    ['Quy Ho tro SV khoang khan', 1, 'Ho tro sinh vien co hoan canh kho khan', 300000000, 80000000, 5000000, 100, 'Co giay xac nhan kho khan', '2024-01-01', '2024-12-31', 'Dang hoat dong', 1],
    ['Quy Nghien cuu Khoa hoc', 2, 'Tai tro nghien cua khoa hoc sinh vien', 200000000, 45000000, 20000000, 10, 'De xuat nghien cuu duoc phe duyet', '2024-03-01', '2024-11-30', 'Dang hoat dong', 1],
    ['Quy Cong dong Xa hoi', 3, 'Ho tro cac hoat dong tinh nguyen', 100000000, 35000000, 3000000, 30, 'Tham gia hoat dong tinh nguyen', '2024-06-01', '2024-09-30', 'Dang hoat dong', 1],
    ['Quy Hop tac Quoc te', 4, 'Ho tro sinh vien du hoc ngan han', 400000000, 60000000, 50000000, 5, 'IELTS >= 6.5, GPA >= 3.0', '2024-02-01', '2024-10-31', 'Dang hoat dong', 1],
  ];
  for (const q of quy) {
    await conn.query(
      'INSERT IGNORE INTO quy (tenquy, loaiquy_id, mota, sotienduongmuctieu, sodu, sotienhotrotoida, soluonghotrotoida, dieukienhotro, ngaybatdau, ngayketthuc, trangthai, nguoitao_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      q
    );
  }
  console.log('Seeded: quy (5 funds)');

  // === YEU CAU HO TRO ===
  const yeuCau = [
    [2, 1, 'Can ho tro hoc phi ky 2 nam 2024, GPA 3.7', 8000000, 'Cho duyet cap 1'],
    [3, 1, 'Ho tro hoc phi, gia canh kho khan', 7000000, 'Cho duyet cap 1'],
    [4, 2, 'Bi mat nguoi than, can ho tro cuoc song', 5000000, 'Da duyet cap 1'],
    [5, 1, 'Ho tro hoc bong, hoc xuat sac', 10000000, 'Cho duyet cap 2'],
    [2, 3, 'De xuat nghien cuu AI trong giao duc', 20000000, 'Da duyet cap 1'],
    [3, 4, 'Tham gia tinh nguyen mua he xanh', 2000000, 'Da giai ngan'],
    [4, 5, 'Xin hoc bong du hoc Anh', 50000000, 'Cho duyet cap 1'],
    [5, 2, 'Ho tro hoc phi, hoan canh kho khan', 6000000, 'Tu choi cap 1'],
    [2, 4, 'Tham gia hoat dong tinh nguyen', 1500000, 'Da giai ngan'],
    [3, 1, 'Ho tro hoc bong ky 1', 9000000, 'Da duyet cap 3'],
  ];
  for (const y of yeuCau) {
    await conn.query(
      'INSERT IGNORE INTO yeucauhotro (nguoidung_id, quy_id, lydo, sotiendenghi, trangthai) VALUES (?, ?, ?, ?, ?)',
      y
    );
  }
  console.log('Seeded: yeucauhotro (10 applications)');

  // === SINH VIEN NOI BAT ===
  const svnb = [
    [2, 'Nguyen Van An', 'Khoa Cong nghe Thong tin', '2023-2024', 'Sinh vien xuat sac, GPA 3.8/4.0. Dat giai Nhat cuoi thi Lap trinh cap Quoc gia.', 2, 20000000, 1, 'Hien thi'],
    [3, 'Tran Thi Binh', 'Khoa Kinh te', '2033-2024', 'Thu kho khoa 2020. Tham gia nhieu hoat dong tinh nguyen va dat hoc bong toan phan.', 1, 10000000, 2, 'Hien thi'],
    [4, 'Le Minh Chau', 'Khoa Ky thuat', '2022-2023', 'Dat giai Ba Olympic Toan hoc sinh vien toan quoc. Nghien cuu khoa hoc xuat sac.', 1, 5000000, 3, 'Hien thi'],
    [5, 'Pham Thi Dung', 'Khoa Ngoai ngu', '2023-2024', 'IELTS 8.0. Tham gia chuong trinh trao doi sinh vien quoc te tai Uc.', 0, 0, 4, 'Hien thi'],
  ];
  for (const s of svnb) {
    await conn.query(
      'INSERT IGNORE INTO sinhviennoibat (nguoidung_id, hoten, khoa, khoahoc, thanhtich, solanhotro, tongtienhotro, thutu, trangthai) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      s
    );
  }
  console.log('Seeded: sinhviennoibat');

  // === TAIKHOAN NGAN HANG ===
  const tknh = [
    [1, '1234567890', 'Vietcombank', 'CN Ha Noi', 'Quy Phat trien DH TVU', 'Hoat dong'],
    [2, '0987654321', 'Techcombank', 'CN TP HCM', 'Quy Ho tro SV', 'Hoat dong'],
  ];
  for (const t of tknh) {
    await conn.query(
      'INSERT IGNORE INTO taikhoannganhang (quy_id, sotaikhoan, nganhang, chinhanh, chutaikhoan, trangthai) VALUES (?, ?, ?, ?, ?, ?)',
      t
    );
  }
  console.log('Seeded: taikhoannganhang');

  // Verify
  const tables = ['vaitro', 'nguoidung', 'donvihoc', 'nhataitro', 'loaiquy', 'quy', 'yeucauhotro', 'sinhviennoibat', 'taikhoannganhang'];
  for (const t of tables) {
    const [rows] = await conn.query(`SELECT COUNT(*) as cnt FROM ${t}`);
    console.log(`  ${t}: ${rows[0].cnt} rows`);
  }

  await conn.end();
  console.log('DONE!');
}

seedFull().catch(e => console.error('FATAL:', e.message));
