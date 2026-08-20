import pool from "../../config/db.js";

// Tao thong bao moi
const create = async ({ nguoidungId, loai, tieude, noidung, duongdan }) => {
  const [result] = await pool.execute(
    `INSERT INTO thong_bao (nguoidung_id, loaithongbao, tieude, noidung, daDoc, duongdan)
     VALUES (?, ?, ?, ?, 0, ?)`,
    [nguoidungId, loai || 'hethong', tieude, noidung, duongdan || null]
  );
  return result.insertId;
};

// Lay thong bao cua 1 nguoi dung
const getByUserId = async (nguoidungId, limit = 50) => {
  const [rows] = await pool.query(
    `SELECT thong_bao_id, loaithongbao, tieude, noidung, daDoc, duongdan, ngaytao
     FROM thong_bao
     WHERE nguoidung_id = ?
     ORDER BY ngaytao DESC
     LIMIT ?`,
    [nguoidungId, limit]
  );
  return rows;
};

// Dem so thong bao chua doc
const getUnreadCount = async (nguoidungId) => {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM thong_bao
     WHERE nguoidung_id = ? AND daDoc = 0`,
    [nguoidungId]
  );
  return parseInt(rows[0]?.total || 0);
};

// Danh dau da doc 1 thong bao
const markAsRead = async (thongBaoId, nguoidungId) => {
  const [result] = await pool.execute(
    `UPDATE thong_bao SET daDoc = 1
     WHERE thong_bao_id = ? AND nguoidung_id = ?`,
    [thongBaoId, nguoidungId]
  );
  return result.affectedRows > 0;
};

// Danh dau tat ca da doc
const markAllAsRead = async (nguoidungId) => {
  const [result] = await pool.execute(
    `UPDATE thong_bao SET daDoc = 1
     WHERE nguoidung_id = ? AND daDoc = 0`,
    [nguoidungId]
  );
  return result.affectedRows;
};

// Xoa 1 thong bao cua user (chi nguoi so huu moi xoa duoc)
const deleteById = async (thongBaoId, nguoidungId) => {
  const [result] = await pool.execute(
    `DELETE FROM thong_bao
     WHERE thong_bao_id = ? AND nguoidung_id = ?`,
    [thongBaoId, nguoidungId]
  );
  return result.affectedRows > 0;
};

// Kiem tra da gui thong bao cho 1 ky tra no cu the chua (tranh gui nhieu lan)
const checkExistsByLichTrano = async (lichtranoId, loai) => {
  const [rows] = await pool.query(
    `SELECT thong_bao_id
     FROM thong_bao
     WHERE duongdan LIKE ? AND loaithongbao = ?
     LIMIT 1`,
    [`%lichtrano_id=${lichtranoId}%`, loai]
  );
  return rows.length > 0;
};

export default {
  create,
  getByUserId,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteById,
  checkExistsByLichTrano
};
