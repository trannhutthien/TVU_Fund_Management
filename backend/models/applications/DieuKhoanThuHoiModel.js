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
    fileHopdong
  } = data;

  const executor = connection || pool;

  const [result] = await executor.execute(
    `INSERT INTO dieukhoanthuhoi (
      yeucauhotro_id,
      mucthuhoi,
      laisuat,
      thoihanhoantra_thang,
      soquyetdinh_hopdong,
      filehopdong
    ) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      yeucauhotroId,
      mucthuhoi,
      laisuat || null,
      thoihanhoantra || null,
      soQuyetDinh || null,
      fileHopdong || null
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

export default {
  createDieuKhoan,
  getByApplicationId,
  kiemTraRangBuoc30PhanTram,
  kiemTraRangBuocLaiSuat: LaiSuatHelper.kiemTraRangBuocLaiSuat
};
