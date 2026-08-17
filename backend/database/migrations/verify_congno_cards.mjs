import mysql from 'mysql2/promise';
const conn = await mysql.createConnection({
  host: 'mysql-735ef23-trannhutthien012345-f859.b.aivencloud.com', port: 23536,
  user: 'avnadmin', password: 'AVNS_aSpzodktBU9qxNVmx7o', database: 'defaultdb',
  ssl: { rejectUnauthorized: false }
});

console.log('=== CARD 1: Tong du no (toan he thong) ===');

// 1a. Cong no cho vay — SUM con lai tu lichtrano
const [[duNoVay]] = await conn.query(`
  SELECT COALESCE(SUM(
    CASE 
      WHEN lt.trangthai = 'Da tra' THEN 0
      WHEN lt.trangthai = 'Tra mot phan' THEN (lt.sotiengocphaitra + lt.sotienlaiphaitra + lt.sotienlaiphat) - COALESCE(lt.sotienthuctra, 0)
      ELSE lt.sotiengocphaitra + lt.sotienlaiphaitra + lt.sotienlaiphat
    END
  ), 0) AS tongDuNoVay
  FROM lichtrano lt
  INNER JOIN hopdongvayvon hd ON lt.hopdongvayvon_id = hd.hopdongvayvon_id
  INNER JOIN yeucauhotro yc ON hd.yeucauhotro_id = yc.yeucauhotro_id
  WHERE hd.trangthai IN ('Dang thuc hien', 'Qua han')
    AND yc.trangthai IN ('Da giai ngan', 'Da nghiem thu')
`);
console.log('Tong du no vay:', duNoVay.tongDuNoVay);

// 1b. Cong no thu hoi — SUM mucthuhoi chua thu het
const [[duNoThuHoi]] = await conn.query(`
  SELECT COALESCE(SUM(dkh.mucthuhoi - dkh.sotiendadathu), 0) AS tongDuNoThuHoi
  FROM dieukhoanthuhoi dkh
  INNER JOIN yeucauhotro yc ON dkh.yeucauhotro_id = yc.yeucauhotro_id
  WHERE dkh.trangthai != 'Da thu het'
    AND yc.trangthai IN ('Da giai ngan', 'Da nghiem thu')
`);
console.log('Tong du no thu hoi:', duNoThuHoi.tongDuNoThuHoi);
console.log('TONG DU NO (vay + thu hoi):', Number(duNoVay.tongDuNoVay) + Number(duNoThuHoi.tongDuNoThuHoi));

console.log('\n=== CARD 2: Da thu hoi luy ke ===');
const [[daThu]] = await conn.query(`
  SELECT COALESCE(SUM(gd.sotien), 0) AS daThuHoi
  FROM giaodich gd
  WHERE gd.loaigiaodich = 'Thu hoi no'
    AND gd.trangthai = 'Thanh cong'
`);
console.log('Da thu hoi luy ke:', daThu.daThuHoi);

console.log('\n=== CARD 3: Gia tri dang qua han ===');
const [[quaHan]] = await conn.query(`
  SELECT COALESCE(SUM(lt.sotiengocphaitra + lt.sotienlaiphaitra + lt.sotienlaiphat - COALESCE(lt.sotienthuctra, 0)), 0) AS tienQuaHan
  FROM lichtrano lt
  INNER JOIN hopdongvayvon hd ON lt.hopdongvayvon_id = hd.hopdongvayvon_id
  WHERE lt.trangthai = 'Qua han'
`);
console.log('Gia tri qua han:', quaHan.tienQuaHan);

console.log('\n=== CARD 4: So ho so qua han ===');
const [[soHS]] = await conn.query(`
  SELECT COUNT(DISTINCT hd.yeucauhotro_id) AS soHoSo
  FROM lichtrano lt
  INNER JOIN hopdongvayvon hd ON lt.hopdongvayvon_id = hd.hopdongvayvon_id
  WHERE lt.trangthai = 'Qua han'
`);
console.log('So ho so qua han:', soHS.soHoSo);

console.log('\n=== CARD 5: Cho xac nhan ===');
const [[choXN]] = await conn.query(`
  SELECT COUNT(*) AS soKy
  FROM lichtrano lt
  WHERE lt.trangthaixacnhan = 'Cho xac nhan'
    AND lt.trangthai IN ('Qua han', 'Tra mot phan')
`);
console.log('So ky cho xac nhan:', choXN.soKy);

console.log('\n=== CARD 6: Lai phat chua thu ===');
const [[laiPhat]] = await conn.query(`
  SELECT COALESCE(SUM(
    CASE
      WHEN lt.trangthai = 'Da tra' THEN 0
      ELSE lt.sotienlaiphat
    END
  ), 0) AS tongLaiPhat
  FROM lichtrano lt
  WHERE lt.sotienlaiphat > 0
`);
console.log('Tong lai phat chua thu:', laiPhat.tongLaiPhat);

// Also check individual period details for verification
console.log('\n=== CHI TIET LICH TRA NO (verify penalty calc) ===');
const [periods] = await conn.query(`
  SELECT lt.kythu, lt.sotiengocphaitra, lt.sotienlaiphaitra, lt.sotienlaiphat, lt.sotienthuctra, lt.trangthai, lt.ngaydenhan
  FROM lichtrano lt
  INNER JOIN hopdongvayvon hd ON lt.hopdongvayvon_id = hd.hopdongvayvon_id
  WHERE lt.sotienlaiphat > 0
  ORDER BY lt.ngaydenhan
`);
periods.forEach(p => {
  const conLai = Number(p.sotiengocphaitra) + Number(p.sotienlaiphaitra) + Number(p.sotienlaiphat) - Number(p.sotienthuctra || 0);
  console.log(`Ky ${p.kythu}: goc=${p.sotiengocphaitra}, lai=${p.sotienlaiphaitra}, phat=${p.sotienlaiphat}, da tra=${p.sotienthuctra || 0}, con lai=${conLai}, trang thai=${p.trangthai}, den han=${p.ngaydenhan}`);
});

await conn.end();
