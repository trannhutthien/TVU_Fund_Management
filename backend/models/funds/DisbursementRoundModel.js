import pool from "../../config/db.js";

// Lấy tất cả đợt giải ngân của một quỹ
const getByFundId = async (quyId) => {
  const [rows] = await pool.query(
    `SELECT 
      d.dot_id AS dotId,
      d.quy_id AS quyId,
      d.thutu AS thutu,
      d.tendot AS tenDot,
      d.mota AS moTa,
      d.sotiendukien AS soTienDuKien,
      d.sotiendachi AS soTienDaChi,
      d.ngaydukien AS ngayDuKien,
      d.ngaythucte AS ngayThucTe,
      d.trangthai AS trangThai,
      d.ngaytao AS ngayTao,
      COUNT(yc.yeucauhotro_id) AS soDonNop,
      COALESCE(SUM(CASE WHEN yc.trangthai = 'Da giai ngan' THEN yc.sotiendenghi ELSE 0 END), 0) AS soTienDaGiaiNgan
     FROM dotgiaingan d
     LEFT JOIN yeucauhotro yc ON d.dot_id = yc.dot_id
     WHERE d.quy_id = ?
     GROUP BY d.dot_id
     ORDER BY d.thutu ASC`,
    [quyId]
  );
  return rows;
};

// Lấy một đợt theo ID
const getById = async (dotId) => {
  const [rows] = await pool.query(
    `SELECT 
      d.*,
      q.tenquy AS tenQuy,
      q.sodu AS soDuQuy,
      COUNT(yc.yeucauhotro_id) AS soDonNop,
      COALESCE(SUM(CASE WHEN yc.trangthai = 'Da giai ngan' THEN yc.sotiendenghi ELSE 0 END), 0) AS soTienDaGiaiNgan
     FROM dotgiaingan d
     JOIN quy q ON d.quy_id = q.quy_id
     LEFT JOIN yeucauhotro yc ON d.dot_id = yc.dot_id
     WHERE d.dot_id = ?
     GROUP BY d.dot_id`,
    [dotId]
  );
  return rows[0] || null;
};

// Tạo nhiều đợt giải ngân (transaction)
const createRounds = async (quyId, rounds) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    for (const round of rounds) {
      await connection.execute(
        `INSERT INTO dotgiaingan (quy_id, thutu, tendot, mota, sotiendukien, ngaydukien, trangthai)
         VALUES (?, ?, ?, ?, ?, ?, 'chuatoi')`,
        [
          quyId,
          round.thutu,
          round.tenDot || `Đợt ${round.thutu}`,
          round.moTa || null,
          round.soTienDuKien,
          round.ngayDuKien || null
        ]
      );
    }

    await connection.commit();
    return { success: true };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Cập nhật trạng thái đợt
const updateStatus = async (dotId, trangThai, extraData = {}) => {
  const fields = ['trangthai = ?'];
  const values = [trangThai];

  if (extraData.ngayThucTe !== undefined) {
    fields.push('ngaythucte = ?');
    values.push(extraData.ngayThucTe);
  }
  if (extraData.soTienDaChi !== undefined) {
    fields.push('sotiendachi = ?');
    values.push(extraData.soTienDaChi);
  }

  values.push(dotId);
  const [result] = await pool.query(
    `UPDATE dotgiaingan SET ${fields.join(', ')} WHERE dot_id = ?`,
    values
  );
  return result;
};

// Tự động kiểm tra và cập nhật trạng thái đợt khi đến ngày
const autoUpdateRoundStatus = async (quyId) => {
  const today = new Date().toISOString().split('T')[0];

  // Tìm các đợt 'chuatoi' đã đến ngày && đủ tiền
  const [readyRounds] = await pool.query(
    `SELECT d.dot_id, d.sotiendukien, q.sodu
     FROM dotgiaingan d
     JOIN quy q ON d.quy_id = q.quy_id
     WHERE d.quy_id = ?
       AND d.trangthai = 'chuatoi'
       AND d.ngaydukien <= ?`,
    [quyId, today]
  );

  for (const round of readyRounds) {
    if (parseFloat(round.sodu) >= parseFloat(round.sotiendukien)) {
      await updateStatus(round.dot_id, 'dangchodutien');
    }
  }

  return readyRounds.length;
};

// Tự gán dot_id cho yeucauhotro dựa trên ngày nộp đơn
const assignDotToApplication = async (quyId, ngayNop) => {
  const [rows] = await pool.query(
    `SELECT dot_id FROM dotgiaingan 
     WHERE quy_id = ? 
       AND ngaydukien <= ?
       AND trangthai IN ('chuatoi', 'dangchodutien')
     ORDER BY thutu DESC LIMIT 1`,
    [quyId, ngayNop]
  );
  return rows[0]?.dot_id || null;
};

// Kiểm tra tất cả đợt đã hoàn tất chưa
const allRoundsCompleted = async (quyId) => {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total,
            SUM(CASE WHEN trangthai = 'hoanthanh' THEN 1 ELSE 0 END) AS completed
     FROM dotgiaingan
     WHERE quy_id = ?`,
    [quyId]
  );
  const { total, completed } = rows[0];
  return total > 0 && total === completed;
};

// Xóa tất cả đợt giải ngân của một quỹ (dùng khi tạo lại)
const deleteByFundId = async (quyId) => {
  const [result] = await pool.query(
    `DELETE FROM dotgiaingan WHERE quy_id = ?`,
    [quyId]
  );
  return result;
};

export default {
  getByFundId,
  getById,
  createRounds,
  updateStatus,
  autoUpdateRoundStatus,
  assignDotToApplication,
  allRoundsCompleted,
  deleteByFundId
};
