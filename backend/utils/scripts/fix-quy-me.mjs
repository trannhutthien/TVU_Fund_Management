import mysql from 'mysql2/promise';

async function fix() {
  const conn = await mysql.createConnection({
    host: 'mysql-735ef23-trannhutthien012345-f859.b.aivencloud.com',
    user: 'avnadmin',
    password: 'AVNS_aSpzodktBU9qxNVmx7o',
    port: 23536,
    database: 'defaultdb',
    ssl: { rejectUnauthorized: false }
  });

  // 1. Them quy me: Quy phat trien DH Trà Vinh
  const [check] = await conn.query(
    `SELECT quy_id FROM quy WHERE tenquy = 'Quỹ phát triển Đại học Trà Vinh'`
  );
  
  if (check.length > 0) {
    console.log(`Quy me da ton tai: quy_id=${check[0].quy_id}`);
  } else {
    const [result] = await conn.query(
      `INSERT INTO quy (tenquy, loaiquy_id, mota, sotienmuctieu, sodu, trangthai, nguoitao_id)
       VALUES ('Quỹ phát triển Đại học Trà Vinh', 7, 'Quỹ mẹ tổng hợp的所有 nguồn đóng góp và tài trợ cho sự phát triển toàn diện của Đại học Trà Vinh', 5000000000, 0, 'Dang hoat dong', 1)`
    );
    console.log(`Da tao quy me: quy_id=${result.insertId}`);
  }

  // 2. Kiem tra ket qua
  const [rows] = await conn.query(
    `SELECT q.quy_id, q.tenquy, q.loaiquy_id, q.sodu, lq.tenloai 
     FROM quy q LEFT JOIN loaiquy lq ON q.loaiquy_id = lq.loaiquy_id
     ORDER BY q.quy_id`
  );
  console.log('\nDanh sach quy:');
  rows.forEach(r => console.log(`  [${r.quy_id}] ${r.tenquy} -> ${r.tenloai} (${Number(r.sodu).toLocaleString('vi-VN')}đ)`));

  // 3. Tong hop theo loai quy
  const [summary] = await conn.query(
    `SELECT lq.tenloai, COUNT(*) as so_luong, SUM(q.sodu) as tong_sodu
     FROM quy q JOIN loaiquy lq ON q.loaiquy_id = lq.loaiquy_id
     WHERE q.trangthai = 'Dang hoat dong'
     GROUP BY lq.tenloai ORDER BY tong_sodu DESC`
  );
  console.log('\nTong hop theo loai quy:');
  summary.forEach(r => console.log(`  ${r.tenloai}: ${r.so_luong} quy, ${Number(r.tong_sodu).toLocaleString('vi-VN')}đ`));

  await conn.end();
}
fix().catch(e => console.error('ERR:', e.message));
