import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const databaseUrl = process.env.DATABASE_URL;
const url = new URL(databaseUrl);
const pool = mysql.createPool({
  host: url.hostname,
  user: url.username,
  password: url.password,
  database: url.pathname.replace('/', ''),
  port: parseInt(url.port) || 3306,
  ssl: { rejectUnauthorized: false },
  waitForConnections: true,
  connectionLimit: 5,
  connectTimeout: 30000,
});

async function safeQuery(conn, sql, params) {
  try {
    const [result] = await conn.query(sql, params);
    return result;
  } catch (err) {
    if (err.message.includes("doesn't exist")) {
      console.log(`  Bang khong ton tai, bo qua.`);
      return null;
    }
    throw err;
  }
}

async function deleteStudent(conn, id) {
  console.log(`\nXoa sinh vien id=${id}...`);

  // 1. Deep dependencies qua yeucauhotro
  await safeQuery(conn, 'DELETE FROM thuhoilannop WHERE dieukhoanthuhoi_id IN (SELECT dieukhoanthuhoi_id FROM dieukhoanthuhoi WHERE yeucauhotro_id IN (SELECT yeucauhotro_id FROM yeucauhotro WHERE nguoidung_id = ?))', [id]);
  await safeQuery(conn, 'DELETE FROM dieukhoanthuhoi WHERE yeucauhotro_id IN (SELECT yeucauhotro_id FROM yeucauhotro WHERE nguoidung_id = ?)', [id]);
  await safeQuery(conn, 'DELETE FROM lichtrano WHERE hopdongvayvon_id IN (SELECT hopdongvayvon_id FROM hopdongvayvon WHERE yeucauhotro_id IN (SELECT yeucauhotro_id FROM yeucauhotro WHERE nguoidung_id = ?))', [id]);
  await safeQuery(conn, 'DELETE FROM hopdongvayvon WHERE yeucauhotro_id IN (SELECT yeucauhotro_id FROM yeucauhotro WHERE nguoidung_id = ?)', [id]);
  await safeQuery(conn, 'DELETE FROM nghiemthu WHERE yeucauhotro_id IN (SELECT yeucauhotro_id FROM yeucauhotro WHERE nguoidung_id = ?)', [id]);
  await safeQuery(conn, 'DELETE FROM pheduyet WHERE yeucauhotro_id IN (SELECT yeucauhotro_id FROM yeucauhotro WHERE nguoidung_id = ?)', [id]);
  await safeQuery(conn, 'DELETE FROM giaodich WHERE yeucauhotro_id IN (SELECT yeucauhotro_id FROM yeucauhotro WHERE nguoidung_id = ?)', [id]);
  await safeQuery(conn, 'DELETE FROM yeucauhotro WHERE nguoidung_id = ?', [id]);

  // 2. Direct references to nguoidung_id
  await safeQuery(conn, 'DELETE FROM chucvuquy WHERE nguoidung_id = ?', [id]);
  await safeQuery(conn, 'DELETE FROM danhgia WHERE nguoidung_id = ?', [id]);
  await safeQuery(conn, 'DELETE FROM nhatkyhethong WHERE nguoidung_id = ?', [id]);
  await safeQuery(conn, 'DELETE FROM thong_bao WHERE nguoidung_id = ?', [id]);
  await safeQuery(conn, 'DELETE FROM sinhviennoibat WHERE nguoidung_id = ?', [id]);
  await safeQuery(conn, 'DELETE FROM dutoanhangnam WHERE nguoidexuat_id = ? OR nguoiduyet_id = ?', [id, id]);
  await safeQuery(conn, 'DELETE FROM tintuc WHERE nguoitao_id = ? OR nguoisua_id = ?', [id, id]);
  await safeQuery(conn, 'DELETE FROM phanbongansach WHERE nguoi_de_xuat_id = ? OR nguoi_duyet_id = ?', [id, id]);

  // 3. Qua nhataitro
  await safeQuery(conn, 'DELETE FROM khoantaitro WHERE nhataitro_id IN (SELECT nhataitro_id FROM nhataitro WHERE nguoidung_id = ?)', [id]);
  await safeQuery(conn, 'DELETE FROM khoantaitro WHERE nguoixacnhan_id = ?', [id]);
  // Chi xoa nhataitro neu la sinh vien tao (sinh vien thuong khong la nha tai tro)
  await safeQuery(conn, 'DELETE FROM nhataitro WHERE nguoidung_id = ?', [id]);

  // 4. giaodich thuc hien boi sinh vien
  await safeQuery(conn, 'DELETE FROM giaodich WHERE nguoithuchien_id = ?', [id]);
  await safeQuery(conn, 'DELETE FROM giaodich WHERE nguoinhan_id = ?', [id]);

  // 5. Xoa record khac tham chieu
  await safeQuery(conn, 'DELETE FROM pheduyet WHERE nguoiduyet_id = ?', [id]);
  await safeQuery(conn, 'DELETE FROM danhgia WHERE nguoiduyet_id = ?', [id]);
  await safeQuery(conn, 'DELETE FROM hopdongvayvon WHERE nguoiduyet_id = ?', [id]);
  await safeQuery(conn, 'DELETE FROM lichtrano WHERE nguoiduyet_id = ?', [id]);
  await safeQuery(conn, 'DELETE FROM nghiemthu WHERE nguoinghiemthu_id = ?', [id]);
  await safeQuery(conn, 'DELETE FROM giaodich WHERE doisoatboiid = ?', [id]);

  // 6. guest_tracking tham chieu nguoidung_id
  await safeQuery(conn, 'UPDATE guest_tracking SET nguoidung_id = NULL WHERE nguoidung_id = ?', [id]);

  // 7. Xoa nguoidung (sau khi xoa taikhoannganhang cua sinh vien neu la SV)
  await safeQuery(conn, 'UPDATE nguoidung SET taikhoannganhang_id = NULL WHERE nguoidung_id = ?', [id]);

  const [rows] = await pool.query('SELECT taikhoannganhang_id FROM nguoidung WHERE nguoidung_id = ?', [id]);
  const tkIds = rows.map(r => r.taikhoannganhang_id).filter(Boolean);
  await safeQuery(conn, 'DELETE FROM nguoidung WHERE nguoidung_id = ?', [id]);
  for (const tkId of tkIds) {
    await safeQuery(conn, 'DELETE FROM taikhoannganhang WHERE taikhoannganhang_id = ? AND loaitaikhoan = ?', [tkId, 'Sinh vien']);
  }

  console.log(`  Da xoa sinh vien id=${id}.`);
}

async function deleteAllStudents() {
  const connection = await pool.getConnection();
  try {
    const [students] = await connection.query(
      `SELECT nguoidung_id, hoten, email FROM nguoidung WHERE loaitaikhoan = 'Sinh vien'`
    );

    if (students.length === 0) {
      console.log('Khong co sinh vien nao de xoa.');
      return;
    }

    console.log(`Tim thay ${students.length} sinh vien:`);
    for (const s of students) {
      console.log(`  - id=${s.nguoidung_id} | ${s.hoten} | ${s.email}`);
    }

    await connection.beginTransaction();
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    for (const s of students) {
      await deleteStudent(connection, s.nguoidung_id);
    }

    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    await connection.commit();
    console.log(`\nHoan thanh! Da xoa ${students.length} sinh vien va du lieu lien quan.`);
  } catch (error) {
    await connection.rollback();
    console.error('Loi:', error.message);
  } finally {
    connection.release();
    pool.end();
  }
}

deleteAllStudents();