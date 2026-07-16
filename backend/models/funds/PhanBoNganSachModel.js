import pool from "../../config/db.js";

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: createRequest
// MỤC ĐÍCH: Cán bộ đề xuất trích lập ngân sách
// ─────────────────────────────────────────────────────────────────────────────
const createRequest = async ({ quyNguonId, quyDichId, soTien, soQuyetDinh, fileQuyetDinh, nguoiDeXuatId, ghiChu, namTaiChinh }) => {
  const [result] = await pool.execute(
    `INSERT INTO phanbongansach (
      quy_nguon_id,
      quy_dich_id,
      sotien,
      soquyetdinh,
      filequyetdinh,
      nguoi_de_xuat_id,
      trangthai,
      ghichu,
      namtaichinh
    ) VALUES (?, ?, ?, ?, ?, ?, 'Cho duyet', ?, ?)`,
    [quyNguonId, quyDichId, soTien, soQuyetDinh, fileQuyetDinh || null, nguoiDeXuatId, ghiChu || null, namTaiChinh || new Date().getFullYear()]
  );
  return result;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getRequestById
// MỤC ĐÍCH: Lấy chi tiết đề xuất trích lập
// ─────────────────────────────────────────────────────────────────────────────
const getRequestById = async (id) => {
  const [rows] = await pool.query(
    `SELECT 
      pb.phanbongansach_id,
      pb.quy_nguon_id,
      pb.quy_dich_id,
      pb.sotien,
      pb.soquyetdinh,
      pb.filequyetdinh,
      pb.trangthai,
      pb.lydotuchoi,
      pb.nguoi_de_xuat_id,
      pb.nguoi_duyet_id,
      pb.ngaydexuat,
      pb.ngayduyet,
      pb.ghichu,
      pb.namtaichinh,
      qn.tenquy AS ten_quy_nguon,
      qn.sodu AS so_du_quy_nguon,
      qd.tenquy AS ten_quy_dich,
      qd.sodu AS so_du_quy_dich,
      nd_dx.hoten AS nguoi_de_xuat_ten,
      nd_dy.hoten AS nguoi_duyet_ten
     FROM phanbongansach pb
     INNER JOIN quy qn ON pb.quy_nguon_id = qn.quy_id
     INNER JOIN quy qd ON pb.quy_dich_id = qd.quy_id
     INNER JOIN nguoidung nd_dx ON pb.nguoi_de_xuat_id = nd_dx.nguoidung_id
     LEFT JOIN nguoidung nd_dy ON pb.nguoi_duyet_id = nd_dy.nguoidung_id
     WHERE pb.phanbongansach_id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: approveRequest
// MỤC ĐÍCH: Phê duyệt trích lập ngân sách (Chạy trong Transaction & Lock dòng)
// ─────────────────────────────────────────────────────────────────────────────
const approveRequest = async (id, nguoiDuyetId) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Lấy và khóa dòng đề xuất
    const [pbRows] = await connection.query(
      `SELECT * FROM phanbongansach WHERE phanbongansach_id = ? FOR UPDATE`,
      [id]
    );
    const pb = pbRows[0];
    if (!pb) {
      throw new Error('ALLOCATION_REQUEST_NOT_FOUND');
    }
    if (pb.trangthai !== 'Cho duyet') {
      throw new Error('ALLOCATION_REQUEST_ALREADY_PROCESSED');
    }

    const { quy_nguon_id, quy_dich_id, sotien } = pb;

    // 2. Khóa dòng và kiểm tra số dư quỹ nguồn (Bể chung)
    const [qnRows] = await connection.query(
      `SELECT sodu, tenquy FROM quy WHERE quy_id = ? FOR UPDATE`,
      [quy_nguon_id]
    );
    const qn = qnRows[0];
    if (!qn) {
      throw new Error('SOURCE_FUND_NOT_FOUND');
    }
    if (parseFloat(qn.sodu) < parseFloat(sotien)) {
      throw new Error('INSUFFICIENT_SOURCE_FUND_BALANCE');
    }

    // 3. Khóa dòng quỹ đích (Mục chi)
    const [qdRows] = await connection.query(
      `SELECT sodu, tenquy FROM quy WHERE quy_id = ? FOR UPDATE`,
      [quy_dich_id]
    );
    const qd = qdRows[0];
    if (!qd) {
      throw new Error('DESTINATION_FUND_NOT_FOUND');
    }

    // 4. Trừ tiền quỹ nguồn
    await connection.execute(
      `UPDATE quy SET sodu = sodu - ?, ngaycapnhat = CURRENT_TIMESTAMP WHERE quy_id = ?`,
      [sotien, quy_nguon_id]
    );

    // 5. Cộng tiền quỹ đích
    await connection.execute(
      `UPDATE quy SET sodu = sodu + ?, ngaycapnhat = CURRENT_TIMESTAMP WHERE quy_id = ?`,
      [sotien, quy_dich_id]
    );

    // 6. Cập nhật trạng thái đề xuất trích lập
    await connection.execute(
      `UPDATE phanbongansach 
       SET trangthai = 'Da duyet',
           nguoi_duyet_id = ?,
           ngayduyet = CURRENT_TIMESTAMP
       WHERE phanbongansach_id = ?`,
      [nguoiDuyetId, id]
    );

    await connection.commit();
    return {
      success: true,
      quyNguonId: quy_nguon_id,
      quyDichId: quy_dich_id,
      soTien: sotien
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: rejectRequest
// MỤC ĐÍCH: Từ chối trích lập ngân sách
// ─────────────────────────────────────────────────────────────────────────────
const rejectRequest = async (id, nguoiDuyetId, lyDoTuChoi) => {
  const [result] = await pool.execute(
    `UPDATE phanbongansach 
     SET trangthai = 'Tu choi',
         nguoi_duyet_id = ?,
         lydotuchoi = ?,
         ngayduyet = CURRENT_TIMESTAMP
     WHERE phanbongansach_id = ? AND trangthai = 'Cho duyet'`,
    [nguoiDuyetId, lyDoTuChoi || null, id]
  );
  return result.affectedRows > 0;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: rollbackRequest
// MỤC ĐÍCH: Thu hồi ngân sách trích lập nhầm (Chạy trong Transaction & Lock dòng)
// ─────────────────────────────────────────────────────────────────────────────
const rollbackRequest = async (id, nguoiDuyetId) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Lấy và khóa dòng đề xuất trích lập
    const [pbRows] = await connection.query(
      `SELECT * FROM phanbongansach WHERE phanbongansach_id = ? FOR UPDATE`,
      [id]
    );
    const pb = pbRows[0];
    if (!pb) {
      throw new Error('ALLOCATION_REQUEST_NOT_FOUND');
    }
    if (pb.trangthai !== 'Da duyet') {
      throw new Error('ALLOCATION_REQUEST_CANNOT_BE_ROLLED_BACK');
    }

    const { quy_nguon_id, quy_dich_id, sotien } = pb;

    // 2. Khóa dòng và kiểm tra số dư quỹ đích (Mục chi con) xem còn đủ tiền để hoàn lại không
    const [qdRows] = await connection.query(
      `SELECT sodu, tenquy FROM quy WHERE quy_id = ? FOR UPDATE`,
      [quy_dich_id]
    );
    const qd = qdRows[0];
    if (!qd) {
      throw new Error('DESTINATION_FUND_NOT_FOUND');
    }
    if (parseFloat(qd.sodu) < parseFloat(sotien)) {
      throw new Error('INSUFFICIENT_DESTINATION_FUND_BALANCE_FOR_ROLLBACK');
    }

    // 3. Khóa dòng quỹ nguồn (Bể chung)
    const [qnRows] = await connection.query(
      `SELECT sodu, tenquy FROM quy WHERE quy_id = ? FOR UPDATE`,
      [quy_nguon_id]
    );
    const qn = qnRows[0];
    if (!qn) {
      throw new Error('SOURCE_FUND_NOT_FOUND');
    }

    // 4. Trừ tiền ở quỹ đích (Mục chi)
    await connection.execute(
      `UPDATE quy SET sodu = sodu - ?, ngaycapnhat = CURRENT_TIMESTAMP WHERE quy_id = ?`,
      [sotien, quy_dich_id]
    );

    // 5. Cộng trả lại tiền cho quỹ nguồn (Bể chung)
    await connection.execute(
      `UPDATE quy SET sodu = sodu + ?, ngaycapnhat = CURRENT_TIMESTAMP WHERE quy_id = ?`,
      [sotien, quy_nguon_id]
    );

    // 6. Cập nhật trạng thái phân bổ thành 'Da thu hoi'
    await connection.execute(
      `UPDATE phanbongansach 
       SET trangthai = 'Da thu hoi',
           nguoi_duyet_id = ?,
           ngayduyet = CURRENT_TIMESTAMP
       WHERE phanbongansach_id = ?`,
      [nguoiDuyetId, id]
    );

    await connection.commit();
    return {
      success: true,
      quyNguonId: quy_nguon_id,
      quyDichId: quy_dich_id,
      soTien: sotien
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: listRequests
// MỤC ĐÍCH: Liệt kê danh sách các đợt trích lập ngân sách (phân trang + filters)
// ─────────────────────────────────────────────────────────────────────────────
const listRequests = async ({
  quy_nguon_id = '',
  quy_dich_id = '',
  trang_thai = '',
  namtaichinh = '',
  page = 1,
  page_size = 15
}) => {
  const conds = [];
  const params = [];

  if (quy_nguon_id) { conds.push(`pb.quy_nguon_id = ?`); params.push(quy_nguon_id); }
  if (quy_dich_id) { conds.push(`pb.quy_dich_id = ?`); params.push(quy_dich_id); }
  if (trang_thai) { conds.push(`pb.trangthai = ?`); params.push(trang_thai); }
  if (namtaichinh) { conds.push(`pb.namtaichinh = ?`); params.push(namtaichinh); }

  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
  const offset = (page - 1) * page_size;

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM phanbongansach pb ${where}`,
    params
  );

  const [rows] = await pool.query(
    `SELECT 
      pb.phanbongansach_id,
      pb.quy_nguon_id,
      pb.quy_dich_id,
      pb.sotien,
      pb.soquyetdinh,
      pb.filequyetdinh,
      pb.trangthai,
      pb.lydotuchoi,
      pb.nguoi_de_xuat_id,
      pb.nguoi_duyet_id,
      pb.ngaydexuat,
      pb.ngayduyet,
      pb.ghichu,
      pb.namtaichinh,
      qn.tenquy AS ten_quy_nguon,
      qd.tenquy AS ten_quy_dich,
      nd_dx.hoten AS nguoi_de_xuat_ten,
      nd_dy.hoten AS nguoi_duyet_ten
     FROM phanbongansach pb
     INNER JOIN quy qn ON pb.quy_nguon_id = qn.quy_id
     INNER JOIN quy qd ON pb.quy_dich_id = qd.quy_id
     INNER JOIN nguoidung nd_dx ON pb.nguoi_de_xuat_id = nd_dx.nguoidung_id
     LEFT JOIN nguoidung nd_dy ON pb.nguoi_duyet_id = nd_dy.nguoidung_id
     ${where}
     ORDER BY pb.ngaydexuat DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(page_size), offset]
  );

  return { rows, total: Number(total) || 0 };
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getAllocationStatsByYear
// MỤC ĐÍCH: Thống kê tổng phân bổ theo năm tài chính và quỹ nguồn
// ─────────────────────────────────────────────────────────────────────────────
const getAllocationStatsByYear = async () => {
  const [rows] = await pool.query(
    `SELECT 
      pb.namtaichinh,
      pb.quy_nguon_id,
      qn.tenquy AS ten_quy_nguon,
      SUM(pb.sotien) AS tong_tien,
      COUNT(*) AS so_luong_phan_bo
     FROM phanbongansach pb
     INNER JOIN quy qn ON pb.quy_nguon_id = qn.quy_id
     WHERE pb.trangthai = 'Da duyet'
     GROUP BY pb.namtaichinh, pb.quy_nguon_id, qn.tenquy
     ORDER BY pb.namtaichinh DESC, pb.quy_nguon_id`
  );
  return rows;
};

export default {
  createRequest,
  getRequestById,
  approveRequest,
  rejectRequest,
  rollbackRequest,
  listRequests,
  getAllocationStatsByYear
};
