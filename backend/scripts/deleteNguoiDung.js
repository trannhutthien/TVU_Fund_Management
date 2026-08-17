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

const IDS_TO_DELETE = [11, 17];

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

async function deleteNguoiDung() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    for (const id of IDS_TO_DELETE) {
      console.log(`\nXoa nguoi dung id=${id}...`);

      await safeQuery(connection, 'DELETE FROM thuhoilannop WHERE dieukhoanthuhoi_id IN (SELECT dieukhoanthuhoi_id FROM dieukhoanthuhoi WHERE yeucauhotro_id IN (SELECT yeucauhotro_id FROM yeucauhotro WHERE nguoidung_id = ?))', [id]);
      await safeQuery(connection, 'DELETE FROM dieukhoanthuhoi WHERE yeucauhotro_id IN (SELECT yeucauhotro_id FROM yeucauhotro WHERE nguoidung_id = ?)', [id]);
      await safeQuery(connection, 'DELETE FROM lichtrano WHERE hopdongvayvon_id IN (SELECT hopdongvayvon_id FROM hopdongvayvon WHERE yeucauhotro_id IN (SELECT yeucauhotro_id FROM yeucauhotro WHERE nguoidung_id = ?))', [id]);
      await safeQuery(connection, 'DELETE FROM hopdongvayvon WHERE yeucauhotro_id IN (SELECT yeucauhotro_id FROM yeucauhotro WHERE nguoidung_id = ?)', [id]);
      await safeQuery(connection, 'DELETE FROM nghiemthu WHERE yeucauhotro_id IN (SELECT yeucauhotro_id FROM yeucauhotro WHERE nguoidung_id = ?)', [id]);
      await safeQuery(connection, 'DELETE FROM pheduyet WHERE yeucauhotro_id IN (SELECT yeucauhotro_id FROM yeucauhotro WHERE nguoidung_id = ?)', [id]);
      await safeQuery(connection, 'DELETE FROM giaodich WHERE yeucauhotro_id IN (SELECT yeucauhotro_id FROM yeucauhotro WHERE nguoidung_id = ?)', [id]);
      await safeQuery(connection, 'DELETE FROM yeucauhotro WHERE nguoidung_id = ?', [id]);

      await safeQuery(connection, 'DELETE FROM chucvuquy WHERE nguoidung_id = ?', [id]);
      await safeQuery(connection, 'DELETE FROM danhgia WHERE nguoidung_id = ?', [id]);
      await safeQuery(connection, 'DELETE FROM nhatkyhethong WHERE nguoidung_id = ?', [id]);
      await safeQuery(connection, 'DELETE FROM thong_bao WHERE nguoidung_id = ?', [id]);
      await safeQuery(connection, 'DELETE FROM nhataitro WHERE nguoidung_id = ?', [id]);
      await safeQuery(connection, 'DELETE FROM sinhviennoibat WHERE nguoidung_id = ?', [id]);
      await safeQuery(connection, 'DELETE FROM dutoanhangnam WHERE nguoidexuat_id = ? OR nguoiduyet_id = ?', [id, id]);
      await safeQuery(connection, 'DELETE FROM tintuc WHERE nguoitao_id = ? OR nguoisua_id = ?', [id, id]);
      await safeQuery(connection, 'DELETE FROM phanbongansach WHERE nguoi_de_xuat_id = ? OR nguoi_duyet_id = ?', [id, id]);

      await safeQuery(connection, 'DELETE FROM khoantaitro WHERE nhataitro_id IN (SELECT nhataitro_id FROM nhataitro WHERE nguoidung_id = ?)', [id]);
      await safeQuery(connection, 'DELETE FROM quy WHERE nguoitao_id = ?', [id]);
      await safeQuery(connection, 'DELETE FROM giaodich WHERE nguoithuchien_id = ?', [id]);
      await safeQuery(connection, 'DELETE FROM danhgia WHERE nguoiduyet_id = ?', [id]);

      await safeQuery(connection, 'DELETE FROM nguoidung WHERE nguoidung_id = ?', [id]);

      console.log(`  Da xoa nguoi dung id=${id}.`);
    }

    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    await connection.commit();
    console.log('\nHoan thanh! Da xoa nguoi dung id=11 va id=17.');
  } catch (error) {
    await connection.rollback();
    console.error('Loi:', error.message);
  } finally {
    connection.release();
    pool.end();
  }
}

deleteNguoiDung();
