import pool from "../config/db.js";

// ═══════════════════════════════════════════════════════════════════════════════
// ─── PHÊ DUYỆT MODEL ───────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: createPheDuyet
// CÔNG DỤNG: Tạo 3 dòng phê duyệt khi tạo đơn mới
// ─────────────────────────────────────────────────────────────────────────────
const createPheDuyet = async (requestId, connection = null) => {
  const executor = connection || pool;

  // Tạo 3 cấp phê duyệt
  // Lưu ý: nguoi_duyet_id NOT NULL trong schema, nên tạm set = 0 hoặc cần sửa schema
  // Tốt nhất là sửa schema: ALTER TABLE pheduyet MODIFY nguoi_duyet_id INT(11) NULL;
  const capDoDuyet = [1, 2, 3];
  
  for (const cap of capDoDuyet) {
    await executor.execute(
      `INSERT INTO PheDuyet (
        request_id,
        nguoi_duyet_id,
        cap_do_duyet,
        ket_qua
      ) VALUES (?, 0, ?, 'Cho duyet')`,
      [requestId, cap]
    );
  }

  return true;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getPheDuyetByRequestId
// CÔNG DỤNG: Lấy danh sách phê duyệt của 1 đơn
// ─────────────────────────────────────────────────────────────────────────────
const getPheDuyetByRequestId = async (requestId) => {
  const [rows] = await pool.query(
    `SELECT 
      pd.phe_duyet_id,
      pd.request_id,
      pd.nguoi_duyet_id,
      pd.cap_do_duyet,
      pd.ket_qua,
      pd.ghi_chu,
      pd.ly_do_tu_choi,
      pd.ngay_tao,
      pd.ngay_duyet,
      pd.ngay_cap_nhat,
      nd.ho_ten as nguoi_duyet_ho_ten,
      nd.email as nguoi_duyet_email,
      r.ten_vai_tro as nguoi_duyet_vai_tro
     FROM PheDuyet pd
     LEFT JOIN NguoiDung nd ON pd.nguoi_duyet_id = nd.user_id
     LEFT JOIN VaiTro r ON nd.role_id = r.role_id
     WHERE pd.request_id = ?
     ORDER BY pd.cap_do_duyet ASC`,
    [requestId]
  );

  return rows;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: updatePheDuyet
// CÔNG DỤNG: Cập nhật kết quả phê duyệt của 1 cấp
// ─────────────────────────────────────────────────────────────────────────────
const updatePheDuyet = async (requestId, capDoDuyet, nguoiDuyetId, ketQua, ghiChu = null, lyDoTuChoi = null, connection = null) => {
  const executor = connection || pool;

  await executor.execute(
    `UPDATE PheDuyet 
     SET nguoi_duyet_id = ?,
         ket_qua = ?,
         ghi_chu = ?,
         ly_do_tu_choi = ?,
         ngay_duyet = NOW(),
         ngay_cap_nhat = NOW()
     WHERE request_id = ? AND cap_do_duyet = ?`,
    [nguoiDuyetId, ketQua, ghiChu, lyDoTuChoi, requestId, capDoDuyet]
  );

  return true;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getCapDoDuyetHienTai
// CÔNG DỤNG: Lấy cấp độ duyệt hiện tại (cấp đang chờ duyệt)
// ─────────────────────────────────────────────────────────────────────────────
const getCapDoDuyetHienTai = async (requestId) => {
  const [rows] = await pool.query(
    `SELECT cap_do_duyet, ket_qua
     FROM PheDuyet
     WHERE request_id = ? AND ket_qua = 'Cho duyet'
     ORDER BY cap_do_duyet ASC
     LIMIT 1`,
    [requestId]
  );

  return rows[0] || null;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: kiemTraDaDuyetDuCap
// CÔNG DỤNG: Kiểm tra đã duyệt đủ 3 cấp chưa
// ─────────────────────────────────────────────────────────────────────────────
const kiemTraDaDuyetDuCap = async (requestId) => {
  const [rows] = await pool.query(
    `SELECT COUNT(*) as so_cap_da_duyet
     FROM PheDuyet
     WHERE request_id = ? AND ket_qua = 'Da duyet'`,
    [requestId]
  );

  return rows[0].so_cap_da_duyet === 3;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: kiemTraCoCapNaoBiTuChoi
// CÔNG DỤNG: Kiểm tra có cấp nào bị từ chối không
// ─────────────────────────────────────────────────────────────────────────────
const kiemTraCoCapNaoBiTuChoi = async (requestId) => {
  const [rows] = await pool.query(
    `SELECT COUNT(*) as so_cap_tu_choi
     FROM PheDuyet
     WHERE request_id = ? AND ket_qua = 'Tu choi'`,
    [requestId]
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
