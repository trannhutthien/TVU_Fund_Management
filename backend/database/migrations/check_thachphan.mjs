import mysql from 'mysql2/promise';
const conn = await mysql.createConnection({
  host: 'mysql-735ef23-trannhutthien012345-f859.b.aivencloud.com', port: 23536,
  user: 'avnadmin', password: 'AVNS_aSpzodktBU9qxNVmx7o', database: 'defaultdb',
  ssl: { rejectUnauthorized: false }
});

// 1. Find user
const [users] = await conn.query("SELECT nguoidung_id, hoten, email FROM nguoidung WHERE hoten LIKE '%Thach%' OR hoten LIKE '%thach%'");
console.log('=== USERS ===');
users.forEach(u => console.log(u));

// 2. Find contracts
const [contracts] = await conn.query(`
  SELECT hd.hopdongvayvon_id, hd.trangthai as hd_trangthai, hd.sotienvon, hd.laisuatphantram, yc.yeucauhotro_id, yc.loaihotro, yc.lydo, nd.hoten
  FROM hopdongvayvon hd
  INNER JOIN yeucauhotro yc ON hd.yeucauhotro_id = yc.yeucauhotro_id
  INNER JOIN nguoidung nd ON yc.nguoidung_id = nd.nguoidung_id
  WHERE nd.hoten LIKE '%Thach%' OR nd.hoten LIKE '%thach%'
`);
console.log('\n=== CONTRACTS ===');
contracts.forEach(c => console.log(c));

// 3. Find periods
if (contracts.length > 0) {
  const hdIds = contracts.map(c => c.hopdongvayvon_id);
  const [periods] = await conn.query(`SELECT lt.* FROM lichtrano lt WHERE lt.hopdongvayvon_id IN (${hdIds.join(',')})`);
  console.log('\n=== PERIODS ===');
  periods.forEach(p => console.log('Ky', p.kythu, '| Trang thai:', p.trangthai, '| Phat:', p.sotienlaiphat));
}

// 4. Also check what getDanhSach query would return
const [check] = await conn.query(`
  SELECT hd.hopdongvayvon_id, hd.trangthai, nd.hoten
  FROM hopdongvayvon hd
  INNER JOIN yeucauhotro yc ON hd.yeucauhotro_id = yc.yeucauhotro_id
  INNER JOIN nguoidung nd ON yc.nguoidung_id = nd.nguoidung_id
  WHERE hd.trangthai = 'Dang thuc hien'
    AND yc.trangthai IN ('Da giai ngan', 'Da nghiem thu')
    AND (nd.hoten LIKE '%Thach%' OR nd.hoten LIKE '%thach%')
`);
console.log('\n=== getDanhSach filter check (Dang thuc hien) ===');
check.forEach(c => console.log(c));

// 5. Check WITHOUT the trangthai filter
const [checkAll] = await conn.query(`
  SELECT hd.hopdongvayvon_id, hd.trangthai, nd.hoten
  FROM hopdongvayvon hd
  INNER JOIN yeucauhotro yc ON hd.yeucauhotro_id = yc.yeucauhotro_id
  INNER JOIN nguoidung nd ON yc.nguoidung_id = nd.nguoidung_id
  WHERE yc.trangthai IN ('Da giai ngan', 'Da nghiem thu')
    AND (nd.hoten LIKE '%Thach%' OR nd.hoten LIKE '%thach%')
`);
console.log('\n=== WITHOUT trangthai filter ===');
checkAll.forEach(c => console.log(c));

await conn.end();
