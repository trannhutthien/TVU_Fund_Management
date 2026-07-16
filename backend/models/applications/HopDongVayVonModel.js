import pool from "../../config/db.js";

// ═══════════════════════════════════════════════════════════════════════════════
// ─── HỢP ĐỒNG VAY VỐN MODEL ──────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: createHopDong
// MỤC ĐÍCH: Tạo hợp đồng vay vốn (phải nhận connection từ transaction cha)
// NHẬN: { yeucauhotroId, sotienvon, laisuatphantram, ngaykyhopdong,
//         kyhandothang, ngaydaohan, filehopdong, nguoiduyetId, ghichu }
// ─────────────────────────────────────────────────────────────────────────────
const createHopDong = async (data, connection) => {
  const {
    yeucauhotroId,
    sotienvon,
    laisuatphantram,
    ngaykyhopdong,
    kyhandothang,
    ngaydaohan,
    filehopdong,
    nguoiduyetId,
    ghichu
  } = data;

  const executor = connection || pool;

  const [result] = await executor.execute(
    `INSERT INTO hopdongvayvon (
      yeucauhotro_id,
      sotienvon,
      laisuatphantram,
      ngaykyhopdong,
      kyhandothang,
      ngaydaohan,
      trangthai,
      filehopdong,
      nguoiduyet_id,
      ghichu
    ) VALUES (?, ?, ?, ?, ?, ?, 'Dang thuc hien', ?, ?, ?)`,
    [
      yeucauhotroId,
      sotienvon,
      laisuatphantram,
      ngaykyhopdong,
      kyhandothang,
      ngaydaohan,
      filehopdong || null,
      nguoiduyetId || null,
      ghichu || null
    ]
  );

  return { hopdongvayvonId: result.insertId };
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: createLichTraNo
// MỤC ĐÍCH: Sinh lịch trả nợ — 1 kỳ duy nhất (Phương án A)
// NHẬN: { hopdongvayvonId, sotienvon, laisuatphantram, kyhandothang, ngaydaohan }
// ─────────────────────────────────────────────────────────────────────────────
const createLichTraNo = async (data, connection) => {
  const {
    hopdongvayvonId,
    sotienvon,
    laisuatphantram,
    kyhandothang,
    ngaydaohan
  } = data;

  const executor = connection || pool;

  // Tính số tiền lãi phải trả
  const sotienlai = parseFloat(sotienvon) *
    (parseFloat(laisuatphantram) / 100) *
    (parseInt(kyhandothang) / 12);

  const sotienlaiphaitra = Math.round(sotienlai * 100) / 100;

  const [result] = await executor.execute(
    `INSERT INTO lichtrano (
      hopdongvayvon_id,
      kythu,
      ngaydenhan,
      sotiengocphaitra,
      sotienlaiphaitra,
      trangthai
    ) VALUES (?, 1, ?, ?, ?, 'Chua den han')`,
    [
      hopdongvayvonId,
      ngaydaohan,
      sotienvon,
      sotienlaiphaitra
    ]
  );

  return {
    lichtranoId: result.insertId,
    kythu: 1,
    ngaydenhan: ngaydaohan,
    sotiengocphaitra: parseFloat(sotienvon),
    sotienlaiphaitra,
    trangthai: 'Chua den han'
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getByApplicationId
// MỤC ĐÍCH: Lấy hợp đồng + lịch trả nợ theo yeucauhotro_id
// ─────────────────────────────────────────────────────────────────────────────
const getByApplicationId = async (yeucauhotroId) => {
  const [hopDong] = await pool.query(
    `SELECT 
      hd.hopdongvayvon_id,
      hd.yeucauhotro_id,
      hd.sotienvon,
      hd.laisuatphantram,
      hd.ngaykyhopdong,
      hd.kyhandothang,
      hd.ngaydaohan,
      hd.trangthai,
      hd.filehopdong,
      hd.nguoiduyet_id,
      hd.ghichu,
      hd.ngaytao,
      hd.ngaycapnhat
     FROM hopdongvayvon hd
     WHERE hd.yeucauhotro_id = ?
     LIMIT 1`,
    [yeucauhotroId]
  );

  if (!hopDong[0]) return null;

  const [lichTraNo] = await pool.query(
    `SELECT 
      lt.lichtrano_id,
      lt.hopdongvayvon_id,
      lt.kythu,
      lt.ngaydenhan,
      lt.sotiengocphaitra,
      lt.sotienlaiphaitra,
      lt.ngaythuctra,
      lt.sotienthuctra,
      lt.trangthai,
      lt.ngaytao
     FROM lichtrano lt
     WHERE lt.hopdongvayvon_id = ?
     ORDER BY lt.kythu ASC`,
    [hopDong[0].hopdongvayvon_id]
  );

  return {
    hopdong: hopDong[0],
    lichTraNo
  };
};

export default {
  createHopDong,
  createLichTraNo,
  getByApplicationId
};
