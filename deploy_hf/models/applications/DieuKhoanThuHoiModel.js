import pool from "../../config/db.js";
import LaiSuatHelper from "./LaiSuatHelper.js";

// ═══════════════════════════════════════════════════════════════════════════════
// ─── ĐIỀU KHOẢN THU HỒI MODEL ───────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: createDieuKhoan
// MỤC ĐÍCH: Tạo điều khoản thu hồi (phải nhận connection từ transaction cha)
// ─────────────────────────────────────────────────────────────────────────────
const createDieuKhoan = async (data, connection) => {
  const {
    yeucauhotroId,
    mucthuhoi,
    laisuat,
    thoihanhoantra,
    soQuyetDinh,
    fileHopdong,
    trangthai,
    ngaybatdauthuhoi,
  } = data;

  const executor = connection || pool;

  const [result] = await executor.execute(
    `INSERT INTO dieukhoanthuhoi (
      yeucauhotro_id,
      mucthuhoi,
      laisuat,
      thoihanhoantra_thang,
      soquyetdinh_hopdong,
      filehopdong,
      trangthai,
      ngaybatdauthuhoi
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      yeucauhotroId,
      mucthuhoi,
      laisuat || null,
      thoihanhoantra || null,
      soQuyetDinh || null,
      fileHopdong || null,
      trangthai || 'Chua thu',
      ngaybatdauthuhoi || null,
    ]
  );

  return { dieukhoanthuhoiId: result.insertId };
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getByApplicationId
// MỤC ĐÍCH: Lấy điều khoản thu hồi theo đơn xin hỗ trợ
// ─────────────────────────────────────────────────────────────────────────────
const getByApplicationId = async (yeucauhotroId) => {
  const [rows] = await pool.query(
    `SELECT 
      dkh.dieukhoanthuhoi_id,
      dkh.yeucauhotro_id,
      dkh.mucthuhoi,
      dkh.laisuat,
      dkh.thoihanhoantra_thang,
      dkh.soquyetdinh_hopdong,
      dkh.filehopdong,
      dkh.trangthai,
      dkh.sotiendadathu,
      dkh.ngaybatdauthuhoi,
      dkh.ngaytao,
      dkh.ngaycapnhat
     FROM dieukhoanthuhoi dkh
     WHERE dkh.yeucauhotro_id = ?
     LIMIT 1`,
    [yeucauhotroId]
  );

  return rows[0] || null;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: kiemTraRangBuoc30PhanTram
// MỤC ĐÍCH: Validate mức thu hồi ≤ 30% tổng kinh phí (Điều 15.1)
// ─────────────────────────────────────────────────────────────────────────────
const kiemTraRangBuoc30PhanTram = (mucthuhoi, tongkinhphidudan) => {
  if (!tongkinhphidudan || tongkinhphidudan <= 0) {
    return { hopLe: false, loi: 'THIEU_TONG_KINH_PHI' };
  }

  const mucToiDa = parseFloat(tongkinhphidudan) * 0.3;
  const phanTramThucTe = (parseFloat(mucthuhoi) / parseFloat(tongkinhphidudan)) * 100;

  return {
    hopLe: parseFloat(mucthuhoi) <= mucToiDa,
    phanTramThucTe: Math.round(phanTramThucTe * 100) / 100,
    mucToiDa: Math.round(mucToiDa),
    tongkinhphidudan: parseFloat(tongkinhphidudan)
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getById
// MỤC ĐÍCH: Lấy chi tiết dieukhoanthuhoi theo ID
// ─────────────────────────────────────────────────────────────────────────────
const getById = async (id) => {
  const [rows] = await pool.query(
    `SELECT dkh.*, yc.loaihotro, yc.trangthai AS trangthaiDon, yc.nguoidung_id,
       nguoidung.hoten AS nguoiNhanTen, nguoidung.email AS nguoiNhanEmail,
       q.tenquy, q.quy_id,
       hd.sotienvon, hd.sotien_dot1, hd.sotien_dot2,
       hd.ngay_giai_ngan_dot1, hd.ngay_giai_ngan_dot2
     FROM dieukhoanthuhoi dkh
     INNER JOIN yeucauhotro yc ON dkh.yeucauhotro_id = yc.yeucauhotro_id
     INNER JOIN nguoidung ON yc.nguoidung_id = nguoidung.nguoidung_id
     INNER JOIN quy q ON yc.quy_id = q.quy_id
     LEFT JOIN hopdongvayvon hd ON yc.yeucauhotro_id = hd.yeucauhotro_id
     WHERE dkh.dieukhoanthuhoi_id = ?`,
    [id]
  );
  return rows[0] || null;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getAllForAdmin
// MỤC ĐÍCH: Danh sach dieukhoanthuhoi cho ke toan quan ly
// ─────────────────────────────────────────────────────────────────────────────
const getAllForAdmin = async ({ trangthai, page = 1, limit = 20 } = {}) => {
  const conditions = [`(yc.loaihotro = 'Tai tro co thu hoi' OR (yc.loaihotro = 'Cho vay' AND yc.trangthai = 'Dang thu hoi no'))`];
  const params = [];

  if (trangthai) {
    conditions.push(`dkh.trangthai = ?`);
    params.push(trangthai);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (page - 1) * limit;

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM dieukhoanthuhoi dkh
    INNER JOIN yeucauhotro yc ON dkh.yeucauhotro_id = yc.yeucauhotro_id
    ${whereClause}
  `;
  const [[{ total }]] = await pool.query(countQuery, params);

  const dataQuery = `
    SELECT dkh.dieukhoanthuhoi_id, dkh.yeucauhotro_id, dkh.mucthuhoi, dkh.sotiendadathu,
       dkh.trangthai, dkh.ngaybatdauthuhoi, dkh.thoihanhoantra_thang,
       yc.trangthai AS trangthaiDon, yc.loaihotro,
       nguoidung.hoten AS nguoiNhanTen, nguoidung.email AS nguoiNhanEmail,
       q.tenquy, q.quy_id
    FROM dieukhoanthuhoi dkh
    INNER JOIN yeucauhotro yc ON dkh.yeucauhotro_id = yc.yeucauhotro_id
    INNER JOIN nguoidung ON yc.nguoidung_id = nguoidung.nguoidung_id
    INNER JOIN quy q ON yc.quy_id = q.quy_id
    ${whereClause}
    ORDER BY dkh.ngaytao DESC
    LIMIT ? OFFSET ?
  `;
  const [rows] = await pool.query(dataQuery, [...params, limit, offset]);

  return { data: rows, total, page, limit };
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: addPayment
// MỤC ĐÍCH: Sinh vien nop tien thu hoi (mot phan) — tao dong moi trong thuhoilannop
// ─────────────────────────────────────────────────────────────────────────────
const addPayment = async (id, { soTien, minhchung, ghiChu }, connection) => {
  const executor = connection || pool;

  const [[current]] = await executor.query(
    `SELECT sotiendadathu, mucthuhoi, trangthai FROM dieukhoanthuhoi WHERE dieukhoanthuhoi_id = ? FOR UPDATE`,
    [id]
  );

  if (!current) throw new Error('KHONG_TIM_THAY');
  if (parseFloat(soTien) <= 0) throw new Error('SO_TIEN_KHONG_HOP_LE');

  const conLai = parseFloat(current.mucthuhoi) - parseFloat(current.sotiendadathu);
  if (parseFloat(soTien) > conLai) throw new Error('VUOT_CON_LAI');

  // Tao dong moi trong thuhoilannop
  await executor.query(
    `INSERT INTO thuhoilannop (dieukhoanthuhoi_id, sotien, minhchungtrano, ghichu, trangthaixacnhan)
     VALUES (?, ?, ?, ?, 'Cho xac nhan')`,
    [id, soTien, minhchung || null, ghiChu || null]
  );

  // Cap nhat sotiendadathu tren dieukhoanthuhoi
  const newDaThu = parseFloat(current.sotiendadathu) + parseFloat(soTien);
  const daThuHet = Math.abs(newDaThu - parseFloat(current.mucthuhoi)) < 0.01;
  const newTrangthai = daThuHet ? 'Da thu het' : 'Dang thu';

  await executor.query(
    `UPDATE dieukhoanthuhoi
     SET sotiendadathu = ?,
         trangthai = ?,
         ngaycapnhat = NOW()
     WHERE dieukhoanthuhoi_id = ?`,
    [newDaThu, newTrangthai, id]
  );

  return { newTrangthai, daThuHet, conLai: parseFloat(current.mucthuhoi) - newDaThu };
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: confirmPayment
// MỤC ĐÍCH: Ke toan xac nhan tien thu hoi — cap nhat trong thuhoilannop
// ─────────────────────────────────────────────────────────────────────────────
const confirmPayment = async (lanNopId, { nguoiDuyetId, ghiChu }, connection) => {
  const executor = connection || pool;

  const [[current]] = await executor.query(
    `SELECT * FROM thuhoilannop WHERE lan_nop_id = ? FOR UPDATE`,
    [lanNopId]
  );
  if (!current) throw new Error('KHONG_TIM_THAY');
  if (current.trangthaixacnhan !== 'Cho xac nhan') throw new Error('KHONG_XAC_NHAN_DUOC');

  await executor.query(
    `UPDATE thuhoilannop
     SET trangthaixacnhan = 'Da xac nhan',
         ghichuxacnhan = ?,
         nguoiduyet_id = ?,
         ngayxacnhan = NOW()
     WHERE lan_nop_id = ?`,
    [ghiChu || null, nguoiDuyetId, lanNopId]
  );

  // Lay thong tin dieukhoanthuhoi tu dong nay
  const [[dkh]] = await executor.query(
    `SELECT dkh.dieukhoanthuhoi_id, dkh.yeucauhotro_id
     FROM thuhoilannop lnp
     INNER JOIN dieukhoanthuhoi dkh ON lnp.dieukhoanthuhoi_id = dkh.dieukhoanthuhoi_id
     WHERE lnp.lan_nop_id = ?`,
    [lanNopId]
  );

  return { soTien: current.sotien, yeucauhotroId: dkh?.yeucauhotro_id, dieukhoanthuhoiId: dkh?.dieukhoanthuhoi_id };
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: rejectPayment
// MỤC ĐÍCH: Ke toan tu choi tien thu hoi — cap nhat trong thuhoilannop
// ─────────────────────────────────────────────────────────────────────────────
const rejectPayment = async (lanNopId, { nguoiDuyetId, lyDo }, connection) => {
  const executor = connection || pool;

  const [[current]] = await executor.query(
    `SELECT * FROM thuhoilannop WHERE lan_nop_id = ? FOR UPDATE`,
    [lanNopId]
  );
  if (!current) throw new Error('KHONG_TIM_THAY');
  if (current.trangthaixacnhan !== 'Cho xac nhan') throw new Error('KHONG_XAC_NHAN_DUOC');

  await executor.query(
    `UPDATE thuhoilannop
     SET trangthaixacnhan = 'Bi tu choi',
         ghichuxacnhan = ?,
         nguoiduyet_id = ?,
         ngayxacnhan = NOW()
     WHERE lan_nop_id = ?`,
    [lyDo || null, nguoiDuyetId, lanNopId]
  );

  return { soTien: current.sotien, dieukhoanthuhoiId: current.dieukhoanthuhoi_id };
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getPaymentHistory
// MỤC ĐÍCH: Lay lich su nop tien cua mot dieukhoanthuhoi
// ─────────────────────────────────────────────────────────────────────────────
const getPaymentHistory = async (dieukhoanthuhoiId) => {
  const [rows] = await pool.query(
    `SELECT lnp.*, nguoidung.hoten AS nguoiDuyetTen
     FROM thuhoilannop lnp
     LEFT JOIN nguoidung ON lnp.nguoiduyet_id = nguoidung.nguoidung_id
     WHERE lnp.dieukhoanthuhoi_id = ?
     ORDER BY lnp.ngaytao ASC`,
    [dieukhoanthuhoiId]
  );
  return rows;
};
// MỤC ĐÍCH: Tim dieukhoanthuhoi theo yeucauhotro_id (dung cho ContractDetailPage)
// ─────────────────────────────────────────────────────────────────────────────
const getByYeuCauHoTroId = async (yeucauhotroId) => {
  const [rows] = await pool.query(
    `SELECT dkh.*, yc.loaihotro, yc.trangthai AS trangthaiDon, yc.nguoidung_id,
       nguoidung.hoten AS nguoiNhanTen, nguoidung.email AS nguoiNhanEmail,
       q.tenquy, q.quy_id,
       hd.sotienvon, hd.sotien_dot1, hd.sotien_dot2,
       hd.ngay_giai_ngan_dot1, hd.ngay_giai_ngan_dot2
     FROM dieukhoanthuhoi dkh
     INNER JOIN yeucauhotro yc ON dkh.yeucauhotro_id = yc.yeucauhotro_id
     INNER JOIN nguoidung ON yc.nguoidung_id = nguoidung.nguoidung_id
     INNER JOIN quy q ON yc.quy_id = q.quy_id
     LEFT JOIN hopdongvayvon hd ON yc.yeucauhotro_id = hd.yeucauhotro_id
     WHERE dkh.yeucauhotro_id = ?
     ORDER BY dkh.dieukhoanthuhoi_id DESC
     LIMIT 1`,
    [yeucauhotroId]
  );
  return rows[0] || null;
};
// HÀM: getLatestPendingPayment
// MỤC ĐÍCH: Lay dong nop tien dang cho xac nhan gan nhat
// ─────────────────────────────────────────────────────────────────────────────
const getLatestPendingPayment = async (dieukhoanthuhoiId, connection = null) => {
  const conn = connection || pool;
  const [rows] = await conn.query(
    `SELECT * FROM thuhoilannop
     WHERE dieukhoanthuhoi_id = ? AND trangthaixacnhan = 'Cho xac nhan'
     ORDER BY ngaytao DESC LIMIT 1`,
    [dieukhoanthuhoiId]
  );
  return rows[0] || null;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: cancelPayment
// MỤC ĐÍCH: Huy lan nop tien (chỉ khi trangthaixacnhan = 'Cho xac nhan')
// ─────────────────────────────────────────────────────────────────────────────
const cancelPayment = async (lanNopId, nguoidungId, connection = null) => {
  const conn = connection || pool;

  // Lay thong tin lan nop
  const [[lanNop]] = await conn.query(
    `SELECT * FROM thuhoilannop WHERE lan_nop_id = ?`,
    [lanNopId]
  );
  if (!lanNop) throw new Error('KHONG_TIM_THAY');
  if (lanNop.trangthaixacnhan !== 'Cho xac nhan') throw new Error('KHONG_THE_HUY');

  // Kiem tra nguoi dung chi duoc huy cua minh
  const [[dkh]] = await conn.query(
    `SELECT dkh.*, yc.nguoidung_id
     FROM dieukhoanthuhoi dkh
     INNER JOIN yeucauhotro yc ON dkh.yeucauhotro_id = yc.yeucauhotro_id
     WHERE dkh.dieukhoanthuhoi_id = ?`,
    [lanNop.dieukhoanthuhoi_id]
  );
  if (!dkh || dkh.nguoidung_id !== nguoidungId) throw new Error('KHONG_CO_QUYEN');

  // Xoa lan nop
  await conn.query(`DELETE FROM thuhoilannop WHERE lan_nop_id = ?`, [lanNopId]);

  // Giam sotiendadathu
  await conn.query(
    `UPDATE dieukhoanthuhoi
     SET sotiendadathu = sotiendadathu - ?,
         ngaycapnhat = NOW()
     WHERE dieukhoanthuhoi_id = ?`,
    [lanNop.sotien, lanNop.dieukhoanthuhoi_id]
  );

  // Cap nhat trangthai
  const [[dkhAfter]] = await conn.query(
    `SELECT sotiendadathu, mucthuhoi FROM dieukhoanthuhoi WHERE dieukhoanthuhoi_id = ?`,
    [lanNop.dieukhoanthuhoi_id]
  );
  const newTrangthai = dkhAfter.sotiendadathu <= 0 ? 'Chua thu' : 'Dang thu';
  await conn.query(
    `UPDATE dieukhoanthuhoi SET trangthai = ?, ngaycapnhat = NOW() WHERE dieukhoanthuhoi_id = ?`,
    [newTrangthai, lanNop.dieukhoanthuhoi_id]
  );

  return { dieukhoanthuhoiId: lanNop.dieukhoanthuhoi_id, soTien: lanNop.sotien };
};

export default {
  createDieuKhoan,
  getByApplicationId,
  getById,
  getByYeuCauHoTroId,
  getAllForAdmin,
  addPayment,
  confirmPayment,
  rejectPayment,
  getPaymentHistory,
  getLatestPendingPayment,
  cancelPayment,
  kiemTraRangBuoc30PhanTram,
  kiemTraRangBuocLaiSuat: LaiSuatHelper.kiemTraRangBuocLaiSuat
};
