import pool from "../../config/db.js";

// ═══════════════════════════════════════════════════════════════════════════════
// ─── PHÊ DUYỆT MODEL ───────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: createPheDuyet
// CÔNG DỤNG: Tạo 3 dòng phê duyệt khi tạo đơn mới
// ─────────────────────────────────────────────────────────────────────────────
const createPheDuyet = async (yeucauhotroId, connection = null) => {
  const executor = connection || pool;

  // Tạo 3 cấp phê duyệt với nguoiduyet_id = NULL (chưa có người duyệt)
  // Khi cấp tương ứng được duyệt/từ chối, updatePheDuyet sẽ set nguoiduyet_id thực tế.
  const capDoDuyet = [1, 2, 3];

  for (const cap of capDoDuyet) {
    await executor.execute(
      `INSERT INTO pheduyet (
        yeucauhotro_id,
        nguoiduyet_id,
        capduyet,
        ketqua
      ) VALUES (?, NULL, ?, 'Cho duyet')`,
      [yeucauhotroId, cap]
    );
  }

  return true;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getPheDuyetByRequestId
// CÔNG DỤNG: Lấy danh sách phê duyệt của 1 đơn
// ─────────────────────────────────────────────────────────────────────────────
const getPheDuyetByRequestId = async (yeucauhotroId) => {
  const [rows] = await pool.query(
    `SELECT 
      pd.pheduyet_id,
      pd.yeucauhotro_id,
      pd.nguoiduyet_id,
      pd.capduyet,
      pd.ketqua,
      pd.ghichu,
      pd.lydo,
      pd.ngayduyet,
      nd.hoten as nguoi_duyet_ho_ten,
      nd.email as nguoi_duyet_email,
      r.tenvaitro as nguoi_duyet_vai_tro
     FROM pheduyet pd
     LEFT JOIN nguoidung nd ON pd.nguoiduyet_id = nd.nguoidung_id
     LEFT JOIN vaitro r ON nd.vaitro_id = r.vaitro_id
     WHERE pd.yeucauhotro_id = ?
     ORDER BY pd.capduyet ASC`,
    [yeucauhotroId]
  );

  return rows;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: updatePheDuyet
// CÔNG DỤNG: Cập nhật kết quả phê duyệt của 1 cấp
// ─────────────────────────────────────────────────────────────────────────────
const updatePheDuyet = async (yeucauhotroId, capDuyet, nguoiDuyetId, ketQua, ghiChu = null, lyDo = null, connection = null) => {
  const executor = connection || pool;

  await executor.execute(
    `UPDATE pheduyet 
     SET nguoiduyet_id = ?,
         ketqua = ?,
         ghichu = ?,
         lydo = ?,
         ngayduyet = NOW()
     WHERE yeucauhotro_id = ? AND capduyet = ?`,
    [nguoiDuyetId, ketQua, ghiChu, lyDo, yeucauhotroId, capDuyet]
  );

  return true;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getCapDoDuyetHienTai
// CÔNG DỤNG: Lấy cấp độ duyệt hiện tại (cấp đang chờ duyệt)
// ─────────────────────────────────────────────────────────────────────────────
const getCapDoDuyetHienTai = async (yeucauhotroId) => {
  const [rows] = await pool.query(
    `SELECT capduyet, ketqua
     FROM pheduyet
     WHERE yeucauhotro_id = ? AND ketqua = 'Cho duyet'
     ORDER BY capduyet ASC
     LIMIT 1`,
    [yeucauhotroId]
  );

  return rows[0] || null;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: kiemTraDaDuyetDuCap
// CÔNG DỤNG: Kiểm tra đã duyệt đủ 3 cấp chưa
// ─────────────────────────────────────────────────────────────────────────────
const kiemTraDaDuyetDuCap = async (yeucauhotroId) => {
  const [rows] = await pool.query(
    `SELECT COUNT(*) as so_cap_da_duyet
     FROM pheduyet
     WHERE yeucauhotro_id = ? AND ketqua = 'Da duyet'`,
    [yeucauhotroId]
  );

  return rows[0].so_cap_da_duyet === 3;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: kiemTraCoCapNaoBiTuChoi
// CÔNG DỤNG: Kiểm tra có cấp nào bị từ chối không
// ─────────────────────────────────────────────────────────────────────────────
const kiemTraCoCapNaoBiTuChoi = async (yeucauhotroId) => {
  const [rows] = await pool.query(
    `SELECT COUNT(*) as so_cap_tu_choi
     FROM pheduyet
     WHERE yeucauhotro_id = ? AND ketqua = 'Tu choi'`,
    [yeucauhotroId]
  );

  return rows[0].so_cap_tu_choi > 0;
};

export default {
  createPheDuyet,
  getPheDuyetByRequestId,
  updatePheDuyet,
  getCapDoDuyetHienTai,
  kiemTraDaDuyetDuCap,
  kiemTraCoCapNaoBiTuChoi
};
