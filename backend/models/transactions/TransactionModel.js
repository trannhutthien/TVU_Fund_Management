import pool from "../../config/db.js";

const normalizeFilterValues = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => String(item || '').trim()).filter(Boolean);
  }
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const addInFilter = (whereConditions, queryParams, column, value) => {
  const values = normalizeFilterValues(value);
  if (values.length === 0) return;

  if (values.length === 1) {
    whereConditions.push(`${column} = ?`);
    queryParams.push(values[0]);
    return;
  }

  whereConditions.push(`${column} IN (${values.map(() => '?').join(', ')})`);
  queryParams.push(...values);
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── TRANSACTION MODEL ─────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: createTransaction
// MỤC ĐÍCH: Tạo giao dịch mới (giải ngân cho sinh viên)
// ─────────────────────────────────────────────────────────────────────────────
const createTransaction = async (transactionData, connection = null) => {
  const {
    yeucauhotroId,
    quyId,
    loaiGiaoDich,
    hangMucChi,
    nguoiNhanId,
    soTien,
    hinhThuc,
    maGiaoDich,
    chungTu,
    trangThai,
    ghiChu,
    nguoiThucHienId
  } = transactionData;

  const executor = connection || pool;
  const loai = loaiGiaoDich || 'Chi';
  const hangMuc = hangMucChi || (yeucauhotroId ? 'Tai_tro_cho_vay' : null);

  const [result] = await executor.execute(
    `INSERT INTO giaodich (
      yeucauhotro_id,
      quy_id,
      loaigiaodich,
      hangmucchi,
      nguoinhan_id,
      sotien,
      hinhthuc,
      magiaodich,
      chungtu,
      trangthai,
      ghichu,
      nguoithuchien_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      yeucauhotroId,
      quyId,
      loai,
      hangMuc,
      nguoiNhanId,
      soTien,
      hinhThuc || 'Chuyen khoan',
      maGiaoDich || null,
      chungTu || null,
      trangThai || 'Dang xu ly',
      ghiChu || null,
      nguoiThucHienId
    ]
  );

  return result;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getTransactionById
// MỤC ĐÍCH: Lấy thông tin giao dịch cơ bản theo ID
// ─────────────────────────────────────────────────────────────────────────────
const getTransactionById = async (giaoDichId) => {
  const [rows] = await pool.query(
    `SELECT 
      gd.giaodich_id,
      gd.yeucauhotro_id,
      gd.quy_id,
      gd.loaigiaodich,
      gd.hangmucchi,
      gd.nguoinhan_id,
      gd.sotien,
      gd.hinhthuc,
      gd.magiaodich,
      gd.chungtu,
      gd.trangthai,
      gd.ghichu,
      gd.nguoithuchien_id,
      gd.ngaygiaodich,
      gd.ngaycapnhat,
      gd.doisoattrangthai,
      gd.sotienthucte,
      gd.doisoatboiid,
      gd.doisoatluc,
      gd.doisoatghichu,
      nd_doisoat.hoten as doisoat_boi_ten,
      q.tenquy,
      q.loaiquy_id,
      nd.hoten as nguoinhan_hoten,
      nd.email as nguoinhan_email,
      nd.masodinhdanh as nguoinhan_mssv
     FROM giaodich gd
     INNER JOIN quy q ON gd.quy_id = q.quy_id
     LEFT JOIN nguoidung nd ON gd.nguoinhan_id = nd.nguoidung_id
     LEFT JOIN nguoidung nd_doisoat ON gd.doisoatboiid = nd_doisoat.nguoidung_id
     WHERE gd.giaodich_id = ?
     LIMIT 1`,
    [giaoDichId]
  );
  return rows[0] || null;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getTransactionByIdDetailed
// MỤC ĐÍCH: Lấy chi tiết 1 giao dịch với đầy đủ thông tin để đối soát
// ─────────────────────────────────────────────────────────────────────────────
const getTransactionByIdDetailed = async (giaoDichId) => {
  const [rows] = await pool.query(
    `SELECT 
      gd.giaodich_id,
      gd.yeucauhotro_id,
      gd.quy_id,
      gd.loaigiaodich,
      gd.hangmucchi,
      gd.nguoinhan_id,
      gd.sotien,
      gd.hinhthuc,
      gd.magiaodich,
      gd.chungtu,
      gd.trangthai,
      gd.ghichu,
      gd.nguoithuchien_id,
      gd.ngaygiaodich,
      gd.ngaycapnhat,
      gd.doisoattrangthai,
      gd.sotienthucte,
      gd.doisoatboiid,
      gd.doisoatluc,
      gd.doisoatghichu,
      nd_doisoat.hoten as doisoat_boi_ten,
      q.tenquy,
      q.loaiquy_id,
      nd.hoten as nguoinhan_hoten,
      nd.email as nguoinhan_email,
      nd.masodinhdanh as nguoinhan_mssv,
      dv.tenkhoa as nguoinhan_khoaphong,
      yc.sotiendenghi as yeucau_sotien,
      nd_thuchien.hoten as nguoithuchien_hoten,
      kt.khoantaitro_id as khoantaitro_id,
      ntt.tennhataitro as ntt_ten,
      ntt.loainhataitro as ntt_loai
     FROM giaodich gd
     INNER JOIN quy q ON gd.quy_id = q.quy_id
     LEFT JOIN nguoidung nd ON gd.nguoinhan_id = nd.nguoidung_id
     LEFT JOIN donvihoc dv ON nd.donvihoc_id = dv.donvihoc_id
     LEFT JOIN yeucauhotro yc ON gd.yeucauhotro_id = yc.yeucauhotro_id
     LEFT JOIN nguoidung nd_thuchien ON gd.nguoithuchien_id = nd_thuchien.nguoidung_id
     LEFT JOIN nguoidung nd_doisoat ON gd.doisoatboiid = nd_doisoat.nguoidung_id
     LEFT JOIN khoantaitro kt ON (
       gd.loaigiaodich = 'Thu'
       AND (
         (gd.magiaodich IS NOT NULL AND gd.magiaodich = kt.magiaodich)
         OR (gd.ghichu LIKE CONCAT('%Duyệt khoản tài trợ #', kt.khoantaitro_id, '%'))
       )
     )
     LEFT JOIN nhataitro ntt ON kt.nhataitro_id = ntt.nhataitro_id
     WHERE gd.giaodich_id = ?
     LIMIT 1`,
    [giaoDichId]
  );
  return rows[0] || null;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getTransactionsByFund
// MỤC ĐÍCH: Lấy danh sách giao dịch theo quỹ
// ─────────────────────────────────────────────────────────────────────────────
const getTransactionsByFund = async (quyId, limit = 50, offset = 0) => {
  const [rows] = await pool.query(
    `SELECT 
      gd.giaodich_id,
      gd.yeucauhotro_id,
      gd.quy_id,
      gd.loaigiaodich,
      gd.hangmucchi,
      gd.nguoinhan_id,
      gd.sotien,
      gd.hinhthuc,
      gd.trangthai,
      gd.ghichu,
      gd.ngaygiaodich,
      nd.hoten as nguoinhan_hoten
     FROM giaodich gd
     LEFT JOIN nguoidung nd ON gd.nguoinhan_id = nd.nguoidung_id
     WHERE gd.quy_id = ?
     ORDER BY gd.ngaygiaodich DESC
     LIMIT ? OFFSET ?`,
    [quyId, limit, offset]
  );
  return rows;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getTransactionsByApplication
// MỤC ĐÍCH: Lấy giao dịch theo yêu cầu hỗ trợ
// ─────────────────────────────────────────────────────────────────────────────
const getTransactionsByApplication = async (yeucauhotroId) => {
  const [rows] = await pool.query(
    `SELECT 
      gd.giaodich_id,
      gd.yeucauhotro_id,
      gd.quy_id,
      gd.loaigiaodich,
      gd.hangmucchi,
      gd.nguoinhan_id,
      gd.sotien,
      gd.hinhthuc,
      gd.magiaodich,
      gd.chungtu,
      gd.trangthai,
      gd.ghichu,
      gd.nguoithuchien_id,
      gd.ngaygiaodich,
      gd.ngaycapnhat,
      q.tenquy,
      nd.hoten as nguoinhan_hoten
     FROM giaodich gd
     INNER JOIN quy q ON gd.quy_id = q.quy_id
     INNER JOIN nguoidung nd ON gd.nguoinhan_id = nd.nguoidung_id
     WHERE gd.yeucauhotro_id = ?
     ORDER BY gd.ngaygiaodich DESC`,
    [yeucauhotroId]
  );
  return rows;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getAllTransactions
// MỤC ĐÍCH: Lấy tất cả giao dịch với filters và pagination
// ─────────────────────────────────────────────────────────────────────────────
const getAllTransactions = async (filters, limit, offset) => {
  let whereConditions = [];
  let queryParams = [];

  // Filter theo loại giao dịch
  if (filters.loai === 'Thu') {
    whereConditions.push("gd.loaigiaodich = 'Thu'");
  } else if (filters.loai === 'Chi') {
    whereConditions.push("gd.loaigiaodich = 'Chi'");
  }

  // Filter theo quỹ
  if (filters.quyId) {
    whereConditions.push('gd.quy_id = ?');
    queryParams.push(filters.quyId);
  }

  // Filter theo mã giao dịch cụ thể
  if (filters.transactionId) {
    whereConditions.push('gd.giaodich_id = ?');
    queryParams.push(filters.transactionId);
  }

  // Filter theo trạng thái giao dịch
  if (filters.trangThai) {
    whereConditions.push('gd.trangthai = ?');
    queryParams.push(filters.trangThai);
  }

  // Filter theo trạng thái đối soát
  if (filters.doiSoatTrangThai) {
    addInFilter(whereConditions, queryParams, 'gd.doisoattrangthai', filters.doiSoatTrangThai);
  }

  // Filter theo hình thức chuyển khoản
  if (filters.hinhThuc) {
    whereConditions.push('gd.hinhthuc = ?');
    queryParams.push(filters.hinhThuc);
  }

  // Filter theo khoảng thời gian
  if (filters.tuNgay) {
    whereConditions.push('DATE(gd.ngaygiaodich) >= ?');
    queryParams.push(filters.tuNgay);
  }
  if (filters.denNgay) {
    whereConditions.push('DATE(gd.ngaygiaodich) <= ?');
    queryParams.push(filters.denNgay);
  }

  // Filter theo keyword
  if (filters.keyword) {
    whereConditions.push(`(
      CAST(gd.giaodich_id AS CHAR) LIKE ?
      OR nd.hoten LIKE ?
      OR nd.masodinhdanh LIKE ?
      OR gd.ghichu LIKE ?
      OR gd.magiaodich LIKE ?
      OR ntt.tennhataitro LIKE ?
    )`);
    const kw = `%${filters.keyword}%`;
    queryParams.push(kw, kw, kw, kw, kw, kw);
  }

  const whereClause = whereConditions.length > 0
    ? 'WHERE ' + whereConditions.join(' AND ')
    : '';

  // Đếm tổng số bản ghi
  const countQuery = `
    SELECT COUNT(*) as total
    FROM giaodich gd
    LEFT JOIN nguoidung nd ON gd.nguoinhan_id = nd.nguoidung_id
    LEFT JOIN khoantaitro kt ON (
      gd.loaigiaodich = 'Thu'
      AND (
        (gd.magiaodich IS NOT NULL AND gd.magiaodich = kt.magiaodich)
        OR (gd.ghichu LIKE CONCAT('%Duyệt khoản tài trợ #', kt.khoantaitro_id, '%'))
      )
    )
    LEFT JOIN nhataitro ntt ON kt.nhataitro_id = ntt.nhataitro_id
    ${whereClause}
  `;

  const [countResult] = await pool.query(countQuery, queryParams);
  const total = countResult[0].total;

  // Lấy danh sách giao dịch
  const dataQuery = `
    SELECT
      gd.giaodich_id,
      gd.yeucauhotro_id,
      gd.quy_id,
      gd.loaigiaodich,
      gd.hangmucchi,
      gd.nguoinhan_id,
      gd.sotien,
      gd.hinhthuc,
      gd.magiaodich,
      gd.chungtu,
      gd.trangthai,
      gd.ghichu,
      gd.nguoithuchien_id,
      gd.ngaygiaodich,
      gd.ngaycapnhat,
      gd.doisoattrangthai,
      gd.sotienthucte,
      gd.doisoatboiid,
      gd.doisoatluc,
      gd.doisoatghichu,
      nd_doisoat.hoten as doisoat_boi_ten,
      q.tenquy,
      q.loaiquy_id,
      nd.hoten as nguoinhan_hoten,
      nd.email as nguoinhan_email,
      nd.masodinhdanh as nguoinhan_mssv,
      dv.tenkhoa as nguoinhan_khoaphong,
      yc.sotiendenghi as yeucau_sotien,
      nd_thuchien.hoten as nguoithuchien_hoten,
      kt.khoantaitro_id as khoantaitro_id,
      ntt.tennhataitro as ntt_ten,
      ntt.loainhataitro as ntt_loai
    FROM giaodich gd
    INNER JOIN quy q ON gd.quy_id = q.quy_id
    LEFT JOIN nguoidung nd ON gd.nguoinhan_id = nd.nguoidung_id
    LEFT JOIN donvihoc dv ON nd.donvihoc_id = dv.donvihoc_id
    LEFT JOIN yeucauhotro yc ON gd.yeucauhotro_id = yc.yeucauhotro_id
    LEFT JOIN nguoidung nd_thuchien ON gd.nguoithuchien_id = nd_thuchien.nguoidung_id
    LEFT JOIN nguoidung nd_doisoat ON gd.doisoatboiid = nd_doisoat.nguoidung_id
    LEFT JOIN khoantaitro kt ON (
      gd.loaigiaodich = 'Thu'
      AND (
        (gd.magiaodich IS NOT NULL AND gd.magiaodich = kt.magiaodich)
        OR (gd.ghichu LIKE CONCAT('%Duyệt khoản tài trợ #', kt.khoantaitro_id, '%'))
      )
    )
    LEFT JOIN nhataitro ntt ON kt.nhataitro_id = ntt.nhataitro_id
    ${whereClause}
    ORDER BY gd.ngaygiaodich DESC
    LIMIT ? OFFSET ?
  `;

  const [transactions] = await pool.query(
    dataQuery,
    [...queryParams, limit, offset]
  );

  return {
    transactions,
    total
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getTransactionsSummary
// MỤC ĐÍCH: Tính tổng chi và đối soát thống kê theo filter
// ─────────────────────────────────────────────────────────────────────────────
const getTransactionsSummary = async (filters) => {
  let whereConditions = [];
  let queryParams = [];

  // Filter theo loại giao dịch
  if (filters.loai === 'Thu') {
    whereConditions.push("gd.loaigiaodich = 'Thu'");
  } else if (filters.loai === 'Chi') {
    whereConditions.push("gd.loaigiaodich = 'Chi'");
  }

  if (filters.quyId) {
    whereConditions.push('gd.quy_id = ?');
    queryParams.push(filters.quyId);
  }
  if (filters.transactionId) {
    whereConditions.push('gd.giaodich_id = ?');
    queryParams.push(filters.transactionId);
  }
  if (filters.trangThai) {
    whereConditions.push('gd.trangthai = ?');
    queryParams.push(filters.trangThai);
  }
  if (filters.doiSoatTrangThai) {
    addInFilter(whereConditions, queryParams, 'gd.doisoattrangthai', filters.doiSoatTrangThai);
  }
  if (filters.hinhThuc) {
    whereConditions.push('gd.hinhthuc = ?');
    queryParams.push(filters.hinhThuc);
  }
  if (filters.tuNgay) {
    whereConditions.push('DATE(gd.ngaygiaodich) >= ?');
    queryParams.push(filters.tuNgay);
  }
  if (filters.denNgay) {
    whereConditions.push('DATE(gd.ngaygiaodich) <= ?');
    queryParams.push(filters.denNgay);
  }
  if (filters.keyword) {
    whereConditions.push(`(
      CAST(gd.giaodich_id AS CHAR) LIKE ?
      OR nd.hoten LIKE ?
      OR nd.masodinhdanh LIKE ?
      OR gd.ghichu LIKE ?
      OR gd.magiaodich LIKE ?
      OR ntt.tennhataitro LIKE ?
    )`);
    const kw = `%${filters.keyword}%`;
    queryParams.push(kw, kw, kw, kw, kw, kw);
  }

  const whereClause = whereConditions.length > 0
    ? 'WHERE ' + whereConditions.join(' AND ')
    : '';

  const [rows] = await pool.query(
    `SELECT
       COUNT(*) AS total,
       COALESCE(SUM(CASE WHEN gd.loaigiaodich = 'Thu' THEN gd.sotien ELSE 0 END), 0) AS tong_thu,
       COALESCE(SUM(CASE WHEN gd.loaigiaodich = 'Chi' THEN gd.sotien ELSE 0 END), 0) AS tong_chi,
       COUNT(CASE WHEN gd.doisoattrangthai = 'Chua_doi_soat' THEN 1 END) AS chua_doi_soat,
       COUNT(CASE WHEN gd.doisoattrangthai = 'Da_doi_soat' THEN 1 END) AS da_doi_soat,
       COUNT(CASE WHEN gd.doisoattrangthai = 'Bat_thuong' THEN 1 END) AS bat_thuong
     FROM giaodich gd
     LEFT JOIN nguoidung nd ON gd.nguoinhan_id = nd.nguoidung_id
     LEFT JOIN khoantaitro kt ON (
       gd.loaigiaodich = 'Thu'
       AND (
         (gd.magiaodich IS NOT NULL AND gd.magiaodich = kt.magiaodich)
         OR (gd.ghichu LIKE CONCAT('%Duyệt khoản tài trợ #', kt.khoantaitro_id, '%'))
       )
     )
     LEFT JOIN nhataitro ntt ON kt.nhataitro_id = ntt.nhataitro_id
     ${whereClause}`,
    queryParams
  );

  const r = rows[0];
  const total = Number(r.total) || 0;
  const daDoiSoat = Number(r.da_doi_soat) || 0;
  const tongThu = Number(r.tong_thu) || 0;
  const tongChi = Number(r.tong_chi) || 0;

  return {
    tongThu,
    tongChi,
    soRong: tongThu - tongChi,
    soGiaoDich: total,
    soGiaoDichBatThuong: Number(r.bat_thuong) || 0,
    chuaDoiSoat: Number(r.chua_doi_soat) || 0,
    daDoiSoat,
    batThuong: Number(r.bat_thuong) || 0,
    tiLeHoanThanh: total > 0 ? Math.round((daDoiSoat / total) * 100) : 0
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: updateDoiSoatStatus
// MỤC ĐÍCH: Cập nhật trạng thái đối soát giao dịch
// ─────────────────────────────────────────────────────────────────────────────
const updateDoiSoatStatus = async (giaoDichId, doiSoatTrangThai, soTienThucTe = null, doiSoatBoiId = null, ghiChu = null) => {
  const [result] = await pool.execute(
    `UPDATE giaodich 
     SET doisoattrangthai = ?,
         sotienthucte = ?,
         doisoatboiid = ?,
         doisoatghichu = ?,
         doisoatluc = CURRENT_TIMESTAMP
     WHERE giaodich_id = ?`,
    [doiSoatTrangThai, soTienThucTe, doiSoatBoiId, ghiChu, giaoDichId]
  );
  return result;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getYearlyRevenue
// MỤC ĐÍCH: Tính tổng Thu thực tế của năm tài chính
// ─────────────────────────────────────────────────────────────────────────────
const getYearlyRevenue = async (year) => {
  const [rows] = await pool.query(
    `SELECT COALESCE(SUM(sotien), 0) AS total
     FROM giaodich
     WHERE loaigiaodich = 'Thu'
       AND trangthai = 'Thanh cong'
       AND YEAR(ngaygiaodich) = ?`,
    [year]
  );
  return parseFloat(rows[0]?.total || 0);
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getYearlyExpensesByCategory
// MỤC ĐÍCH: Tổng hợp chi theo hạng mục chi cho một năm tài chính
// ─────────────────────────────────────────────────────────────────────────────
const getYearlyExpensesByCategory = async (year) => {
  const [rows] = await pool.query(
    `SELECT 
       hangmucchi,
       COALESCE(SUM(sotien), 0) AS total
     FROM giaodich
     WHERE loaigiaodich = 'Chi'
       AND trangthai = 'Thanh cong'
       AND YEAR(ngaygiaodich) = ?
     GROUP BY hangmucchi`,
    [year]
  );
  
  // Ánh xạ thành object cho dễ dùng
  const expenses = {
    Tai_tro_cho_vay: 0,
    Tham_dinh_du_an: 0,
    Bo_may_hoat_dong: 0,
    Nhiem_vu_khac: 0
  };
  
  rows.forEach(r => {
    if (r.hangmucchi in expenses) {
      expenses[r.hangmucchi] = parseFloat(r.total || 0);
    }
  });
  
  return expenses;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: updateTransactionStatus
// MỤC ĐÍCH: Cập nhật trạng thái giao dịch
// ─────────────────────────────────────────────────────────────────────────────
const updateTransactionStatus = async (giaoDichId, trangThai, ghiChu = null) => {
  const [result] = await pool.execute(
    `UPDATE giaodich 
     SET trangthai = ?,
         ghichu = COALESCE(?, ghichu),
         ngaycapnhat = CURRENT_TIMESTAMP
     WHERE giaodich_id = ?`,
    [trangThai, ghiChu, giaoDichId]
  );
  return result;
};

export default {
  createTransaction,
  getTransactionById,
  getTransactionByIdDetailed,
  getTransactionsByFund,
  getTransactionsByApplication,
  getAllTransactions,
  getTransactionsSummary,
  updateDoiSoatStatus,
  updateTransactionStatus,
  getYearlyRevenue,
  getYearlyExpensesByCategory
};
