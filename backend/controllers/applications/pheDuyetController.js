import pool from "../../config/db.js";
import DonationModel from "../../models/donations/DonationModel.js";

// ═══════════════════════════════════════════════════════════════════════════════
// ─── PHÊ DUYỆT CONTROLLER ──────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/pheduyet/stats
// CÔNG DỤNG: Thống kê tổng quan phê duyệt (4 cards)
// ─────────────────────────────────────────────────────────────────────────────
export const getPheDuyetStats = async (req, res) => {
  try {
    const [[{ tongBanGhi }]] = await pool.query(
      `SELECT COUNT(*) AS tongBanGhi FROM pheduyet`
    );
    
    const [[{ daDuyet }]] = await pool.query(
      `SELECT COUNT(*) AS daDuyet FROM pheduyet WHERE ketqua = 'Da duyet'`
    );
    
    const [[{ tuChoi }]] = await pool.query(
      `SELECT COUNT(*) AS tuChoi FROM pheduyet WHERE ketqua = 'Tu choi'`
    );
    
    const [[{ yeuCauBoSung }]] = await pool.query(
      `SELECT COUNT(*) AS yeuCauBoSung FROM pheduyet WHERE ketqua = 'Yeu cau bo sung'`
    );

    return res.status(200).json({
      success: true,
      data: {
        tongBanGhi: Number(tongBanGhi) || 0,
        daDuyet: Number(daDuyet) || 0,
        tuChoi: Number(tuChoi) || 0,
        yeuCauBoSung: Number(yeuCauBoSung) || 0,
      }
    });
  } catch (error) {
    console.error("Lỗi getPheDuyetStats:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server"
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/pheduyet
// CÔNG DỤNG: Lấy danh sách tất cả phê duyệt với filters
// ─────────────────────────────────────────────────────────────────────────────
export const getAllPheDuyet = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 15,
      keyword = '',
      loai_nguon = '',      // 'yeucau' | 'taitro'
      cap_do_duyet = '',    // '1' | '2' | '3'
      ket_qua = '',         // 'Da duyet' | 'Tu choi' | 'Yeu cau bo sung' | 'Cho duyet'
      nguoi_duyet_id = '',
      tu_ngay = '',
      den_ngay = '',
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Build WHERE conditions
    const conditions = [];
    const params = [];

    // Filter by loai_nguon
    if (loai_nguon === 'yeucau') {
      conditions.push('pd.yeucauhotro_id IS NOT NULL');
    } else if (loai_nguon === 'taitro') {
      conditions.push('1 = 0');
    }

    // Filter by cap_do_duyet
    if (cap_do_duyet) {
      conditions.push('pd.capduyet = ?');
      params.push(parseInt(cap_do_duyet));
    }

    // Filter by ket_qua
    if (ket_qua) {
      conditions.push('pd.ketqua = ?');
      params.push(ket_qua);
    }

    // Filter by nguoi_duyet_id
    if (nguoi_duyet_id) {
      conditions.push('pd.nguoiduyet_id = ?');
      params.push(parseInt(nguoi_duyet_id));
    }

    // Filter by date range
    if (tu_ngay) {
      conditions.push('DATE(pd.ngayduyet) >= ?');
      params.push(tu_ngay);
    }
    if (den_ngay) {
      conditions.push('DATE(pd.ngayduyet) <= ?');
      params.push(den_ngay);
    }

    // Filter by keyword (search in multiple fields)
    if (keyword) {
      conditions.push(`(
        nd.hoten LIKE ? OR
        sv.hoten LIKE ?
      )`);
      const keywordPattern = `%${keyword}%`;
      params.push(keywordPattern, keywordPattern);
    }

    const whereClause = conditions.length > 0 
      ? 'WHERE ' + conditions.join(' AND ')
      : '';

    // Count total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM pheduyet pd
      LEFT JOIN nguoidung nd ON nd.nguoidung_id = pd.nguoiduyet_id
      LEFT JOIN yeucauhotro yc ON yc.yeucauhotro_id = pd.yeucauhotro_id
      LEFT JOIN nguoidung sv ON sv.nguoidung_id = yc.nguoidung_id
      ${whereClause}
    `;
    const [[{ total }]] = await pool.query(countQuery, params);

    // Get data
    const dataQuery = `
      SELECT 
        pd.pheduyet_id AS phe_duyet_id,
        pd.yeucauhotro_id AS request_id,
        pd.capduyet AS cap_do_duyet,
        pd.nguoiduyet_id,
        pd.ketqua AS ket_qua,
        pd.lydo,
        pd.ghichu,
        pd.ngayduyet AS ngay_duyet,
        -- Người duyệt
        nd.hoten AS ho_ten,
        nd.email,
        nd.avatar,
        nd.vaitro_id,
        vt.tenvaitro AS ten_vai_tro,
        -- Nếu là đơn hỗ trợ
        yc.sotiendenghi AS so_tien_de_nghi,
        yc.trangthai AS trang_thai_don,
        yc.lydo AS lydo_don,
        yc.ngaynop AS ngay_nop_don,
        sv.hoten AS ten_sinh_vien,
        sv.masodinhdanh AS ma_so_dinh_danh,
        -- Quỹ
        q.tenquy AS ten_quy
      FROM pheduyet pd
      LEFT JOIN nguoidung nd ON nd.nguoidung_id = pd.nguoiduyet_id
      LEFT JOIN vaitro vt ON vt.vaitro_id = nd.vaitro_id
      LEFT JOIN yeucauhotro yc ON yc.yeucauhotro_id = pd.yeucauhotro_id
      LEFT JOIN nguoidung sv ON sv.nguoidung_id = yc.nguoidung_id
      LEFT JOIN quy q ON q.quy_id = yc.quy_id
      ${whereClause}
      ORDER BY pd.capduyet ASC, pd.ngayduyet DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(dataQuery, [...params, limitNum, offset]);

    // Map role names to display format expected by frontend
    const roleNameMap = {
      'admin': 'Quan tri vien',
      'ketoan': 'Ke toan',
      'canboquy': 'Giao vu',
      'sinhvien': 'Sinh vien',
      'canbo': 'Can bo',
      'nhakhoahoc': 'Nha khoa hoc'
    };

    const mappedRows = rows.map(row => ({
      ...row,
      ten_vai_tro: roleNameMap[row.ten_vai_tro] || row.ten_vai_tro
    }));

    const totalPages = Math.ceil(total / limitNum);

    return res.status(200).json({
      success: true,
      data: mappedRows,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalRecords: total,
        limit: limitNum
      }
    });
  } catch (error) {
    console.error("Lỗi getAllPheDuyet:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server"
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/pheduyet/approvers
// CÔNG DỤNG: Lấy danh sách người có quyền duyệt (role 1,2,3) cho dropdown filter
// ─────────────────────────────────────────────────────────────────────────────
export const getApprovers = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        nd.nguoidung_id AS user_id,
        nd.hoten AS ho_ten,
        vt.tenvaitro AS ten_vai_tro
      FROM nguoidung nd
      INNER JOIN vaitro vt ON vt.vaitro_id = nd.vaitro_id
      WHERE nd.vaitro_id IN (1, 2, 3)
      ORDER BY nd.vaitro_id ASC, nd.hoten ASC
    `);

    return res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error("Lỗi getApprovers:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server"
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/pheduyet/timeline/:type/:id
// CÔNG DỤNG: Lấy chuỗi phê duyệt đầy đủ của 1 đơn/khoản tài trợ
// type: 'yeucau' | 'taitro'
// id: request_id | khoan_tai_tro_id
// ─────────────────────────────────────────────────────────────────────────────
export const getApprovalTimeline = async (req, res) => {
  try {
    const { type, id } = req.params;

    if (!['yeucau', 'taitro'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Type phải là 'yeucau' hoặc 'taitro'"
      });
    }

    if (type === 'taitro') {
      const rows = await DonationModel.getPheDuyetByKhoanTaiTro(id);
      return res.status(200).json({
        success: true,
        data: rows
      });
    }

    const [rows] = await pool.query(`
      SELECT 
        pd.pheduyet_id AS phe_duyet_id,
        pd.yeucauhotro_id AS request_id,
        pd.capduyet AS cap_do_duyet,
        pd.nguoiduyet_id AS nguoi_duyet_id,
        pd.ketqua AS ket_qua,
        pd.lydo AS ly_do_tu_choi,
        pd.ghichu AS ghi_chu,
        pd.ngayduyet AS ngay_duyet,
        nd.hoten AS ho_ten,
        nd.email,
        nd.avatar,
        nd.vaitro_id,
        vt.tenvaitro AS ten_vai_tro
      FROM pheduyet pd
      LEFT JOIN nguoidung nd ON nd.nguoidung_id = pd.nguoiduyet_id
      LEFT JOIN vaitro vt ON vt.vaitro_id = nd.vaitro_id
      WHERE pd.yeucauhotro_id = ?
      ORDER BY pd.capduyet ASC
    `, [id]);

    const roleNameMap = {
      'admin': 'Quản trị viên',
      'ketoan': 'Kế toán',
      'canboquy': 'Giáo vụ',
      'sinhvien': 'Sinh viên',
      'canbo': 'Cán bộ',
      'nhakhoahoc': 'Nhà khoa học'
    };

    const mappedRows = rows.map(row => ({
      ...row,
      ten_vai_tro: roleNameMap[row.ten_vai_tro] || row.ten_vai_tro
    }));

    return res.status(200).json({
      success: true,
      data: mappedRows
    });
  } catch (error) {
    console.error("Lỗi getApprovalTimeline:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server"
    });
  }
};

export default {
  getPheDuyetStats,
  getAllPheDuyet,
  getApprovers,
  getApprovalTimeline,
};
