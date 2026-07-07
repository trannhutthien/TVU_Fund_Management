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

  // 1. Thêm loaiquy mới: Phát triển ĐH Trà Vinh
  const [check] = await conn.query(
    `SELECT loaiquy_id FROM loaiquy WHERE maloai = 'Phat trien'`
  );
  
  let newLoaiQuyId;
  if (check.length > 0) {
    newLoaiQuyId = check[0].loaiquy_id;
    console.log(`Loaiquy 'Phat trien' da ton tai (id=${newLoaiQuyId})`);
  } else {
    const [result] = await conn.query(
      `INSERT INTO loaiquy (maloai, tenloai) VALUES ('Phat trien', 'Phát triển ĐH Trà Vinh')`
    );
    newLoaiQuyId = result.insertId;
    console.log(`Da them loaiquy moi: id=${newLoaiQuyId}, maloai='Phat trien', tenloai='Phát triển ĐH Trà Vinh'`);
  }

  // 2. Cap nhat quy_id=1 (Quy phat trien DH Trà Vinh) -> loaiquy_id moi
  const [updateResult] = await conn.query(
    `UPDATE quy SET loaiquy_id = ? WHERE quy_id = 1`,
    [newLoaiQuyId]
  );
  console.log(`Da cap nhat quy_id=1 -> loaiquy_id=${newLoaiQuyId} (${updateResult.affectedRows} row affected)`);

  // 3. Kiem tra ket qua
  const [rows] = await conn.query(
    `SELECT q.quy_id, q.tenquy, q.loaiquy_id, lq.tenloai 
     FROM quy q LEFT JOIN loaiquy lq ON q.loaiquy_id = lq.loaiquy_id`
  );
  console.log('\nKet qua quy:');
  rows.forEach(r => console.log(`  [${r.quy_id}] ${r.tenquy} -> loaiquy_id=${r.loaiquy_id} (${r.tenloai})`));

  await conn.end();
}
fix().catch(e => console.error('ERR:', e.message));
