import pool from "../../config/db.js";

// ═══════════════════════════════════════════════════════════════════════════════
// ─── HỢP ĐỒNG VAY VỐN MODEL ──────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: createHopDong
// MỤC ĐÍCH: Tạo hợp đồng vay vốn — luong giai ngan 2 pha
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
  const sotienNum = parseFloat(sotienvon);
  const sotienDot1 = Math.round(sotienNum * 0.5 * 100) / 100;
  const sotienDot2 = sotienNum - sotienDot1;

  const [result] = await executor.execute(
    `INSERT INTO hopdongvayvon (
      yeucauhotro_id,
      sotienvon,
      sotien_dot1,
      sotien_dot2,
      laisuatphantram,
      ngaykyhopdong,
      kyhandothang,
      ngaydaohan,
      trangthai,
      filehopdong,
      nguoiduyet_id,
      ghichu
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Dang thuc hien', ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      sotienvon = VALUES(sotienvon),
      sotien_dot1 = VALUES(sotien_dot1),
      sotien_dot2 = VALUES(sotien_dot2),
      laisuatphantram = VALUES(laisuatphantram),
      ngaykyhopdong = VALUES(ngaykyhopdong),
      kyhandothang = VALUES(kyhandothang),
      ngaydaohan = VALUES(ngaydaohan),
      filehopdong = VALUES(filehopdong),
      nguoiduyet_id = VALUES(nguoiduyet_id),
      ghichu = VALUES(ghichu)`,
    [
      yeucauhotroId,
      sotienNum,
      sotienDot1,
      sotienDot2,
      laisuatphantram,
      ngaykyhopdong,
      kyhandothang,
      ngaydaohan,
      filehopdong || null,
      nguoiduyetId || null,
      ghichu || null
    ]
  );

  if (result.insertId > 0) {
    return { hopdongvayvonId: result.insertId };
  }
  const [existing] = await executor.execute(
    'SELECT hopdongvayvon_id FROM hopdongvayvon WHERE yeucauhotro_id = ?', [yeucauhotroId]
  );
  return { hopdongvayvonId: existing[0]?.hopdongvayvon_id || 0 };
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: createLichTraNo
// MỤC ĐÍCH: Sinh lịch trả nợ — 2 ky (50% goc + toan bo lai / 50% goc)
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

  // Check if lichtrano already exists — dem so ky de phat hien thieu ky
  const [existingCheck] = await executor.execute(
    'SELECT COUNT(*) AS soKy FROM lichtrano WHERE hopdongvayvon_id = ?', [hopdongvayvonId]
  );
  const soKyHienCo = existingCheck[0].soKy;

  // Tinh lai suat — tinh 1 lan cho toan bo sotienvon
  const sotienlai = parseFloat(sotienvon) *
    (parseFloat(laisuatphantram) / 100) *
    (parseInt(kyhandothang) / 12);
  const sotienlaiphaitra = Math.round(sotienlai * 100) / 100;

  // Tach goc thanh 2 ky
  const sotienDot1 = Math.round(parseFloat(sotienvon) * 0.5 * 100) / 100;
  const sotienDot2 = parseFloat(sotienvon) - sotienDot1;

  if (soKyHienCo >= 2) {
    // Da du 2 ky → lay ky 1 tra ve
    const [[ky1]] = await executor.execute(
      'SELECT lichtrano_id, kythu, ngaydenhan, sotiengocphaitra, sotienlaiphaitra, trangthai FROM lichtrano WHERE hopdongvayvon_id = ? AND kythu = 1 LIMIT 1',
      [hopdongvayvonId]
    );
    return ky1 || { lichtranoId: null, kythu: 1, ngaydenhan: ngaydaohan, sotiengocphaitra: sotienDot1, sotienlaiphaitra, trangthai: 'Chua den han' };
  }

  if (soKyHienCo === 1) {
    // Chi co ky 1 → chi tao ky 2
    const [[ky1]] = await executor.execute(
      'SELECT lichtrano_id, kythu, ngaydenhan, sotiengocphaitra, sotienlaiphaitra, trangthai FROM lichtrano WHERE hopdongvayvon_id = ? AND kythu = 1 LIMIT 1',
      [hopdongvayvonId]
    );
    await executor.execute(
      `INSERT INTO lichtrano (
        hopdongvayvon_id, kythu, ngaydenhan,
        sotiengocphaitra, sotienlaiphaitra, trangthai
      ) VALUES (?, 2, ?, ?, 0, 'Chua den han')`,
      [hopdongvayvonId, ngaydaohan, sotienDot2]
    );
    return ky1;
  }

  // Chua co ky nao → tao ca 2
  const [result1] = await executor.execute(
    `INSERT INTO lichtrano (
      hopdongvayvon_id, kythu, ngaydenhan,
      sotiengocphaitra, sotienlaiphaitra, trangthai
    ) VALUES (?, 1, ?, ?, ?, 'Chua den han')`,
    [hopdongvayvonId, ngaydaohan, sotienDot1, sotienlaiphaitra]
  );

  await executor.execute(
    `INSERT INTO lichtrano (
      hopdongvayvon_id, kythu, ngaydenhan,
      sotiengocphaitra, sotienlaiphaitra, trangthai
    ) VALUES (?, 2, ?, ?, 0, 'Chua den han')`,
    [hopdongvayvonId, ngaydaohan, sotienDot2]
  );

  return {
    lichtranoId: result1.insertId,
    kythu: 1,
    ngaydenhan: ngaydaohan,
    sotiengocphaitra: sotienDot1,
    sotienlaiphaitra,
    trangthai: 'Chua den han'
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: capNhatNgayGiaiNganDot1
// MỤC ĐÍCH: Cap nhat ngay giai ngan dot 1
// ─────────────────────────────────────────────────────────────────────────────
const capNhatNgayGiaiNganDot1 = async (hopdongvayvonId, connection = null) => {
  const executor = connection || pool;
  await executor.execute(
    `UPDATE hopdongvayvon SET ngay_giai_ngan_dot1 = NOW(), ngaycapnhat = NOW() WHERE hopdongvayvon_id = ?`,
    [hopdongvayvonId]
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: capNhatNgayGiaiNganDot2
// MỤC ĐÍCH: Cap nhat ngay giai ngan dot 2
// ─────────────────────────────────────────────────────────────────────────────
const capNhatNgayGiaiNganDot2 = async (hopdongvayvonId, connection = null) => {
  const executor = connection || pool;
  await executor.execute(
    `UPDATE hopdongvayvon SET ngay_giai_ngan_dot2 = NOW(), ngaycapnhat = NOW() WHERE hopdongvayvon_id = ?`,
    [hopdongvayvonId]
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: tangLanNghiemThuDat
// MỤC ĐÍCH: Tang so luot nghiem thu dat va tra ve so luot hien tai
// ─────────────────────────────────────────────────────────────────────────────
const tangLanNghiemThuDat = async (hopdongvayvonId, connection = null) => {
  const executor = connection || pool;
  await executor.execute(
    `UPDATE hopdongvayvon SET lan_nghiem_thu_dat = lan_nghiem_thu_dat + 1, ngaycapnhat = NOW() WHERE hopdongvayvon_id = ?`,
    [hopdongvayvonId]
  );
  const [[{ soLuot }]] = await executor.execute(
    `SELECT lan_nghiem_thu_dat AS soLuot FROM hopdongvayvon WHERE hopdongvayvon_id = ?`,
    [hopdongvayvonId]
  );
  return soLuot;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getByHopDongId
// MỤC ĐÍCH: Lay hop dong theo hopdongvayvon_id
// ─────────────────────────────────────────────────────────────────────────────
const getByHopDongId = async (hopdongvayvonId) => {
  const [[hopDong]] = await pool.query(
    `SELECT * FROM hopdongvayvon WHERE hopdongvayvon_id = ? LIMIT 1`,
    [hopdongvayvonId]
  );
  return hopDong || null;
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
      hd.sotien_dot1,
      hd.sotien_dot2,
      hd.ngay_giai_ngan_dot1,
      hd.ngay_giai_ngan_dot2,
      hd.lan_nghiem_thu_dat,
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

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: capNhatLichTraNoKhiKhongDat
// MỤC ĐÍCH: Cập nhật lichtrano khi nghiệm thu không đạt
//           - Xóa ky 2 (nếu có)
//           - Ky 1: ngaydenhan = ngayDuyet + thoiHan thang, lai = 0 (dot 1)
//                  hoac lai tinh theo laisuatphantram (dot 2)
// NHẬN: { hopdongvayvonId, ngayDuyet, thoiHanThang, dotgiaingan, laisuatphantram, sotienvon }
// ─────────────────────────────────────────────────────────────────────────────
const capNhatLichTraNoKhiKhongDat = async (data, connection = null) => {
  const {
    hopdongvayvonId,
    ngayDuyet,
    thoiHanThang = 3,
    dotgiaingan = 1,
    laisuatphantram = 0,
    sotienvon = 0,
  } = data;

  const executor = connection || pool;

  // Tinh ngay den han moi
  const ngayDenHan = new Date(ngayDuyet);
  ngayDenHan.setMonth(ngayDenHan.getMonth() + thoiHanThang);
  const ngayDenHanStr = ngayDenHan.toISOString().split('T')[0];

  // Tinh lai suat (chi dot 2 moi co lai)
  let sotienlaiphaitra = 0;
  if (dotgiaingan === 2 && laisuatphantram > 0) {
    // Lai tinh tren toan bo sotienvon * laisuat * thoihan/12
    const lai = parseFloat(sotienvon) * (parseFloat(laisuatphantram) / 100) * (parseInt(thoiHanThang) / 12);
    sotienlaiphaitra = Math.round(lai * 100) / 100;
  }

  // Xoa ky 2 (neu co)
  await executor.execute(
    'DELETE FROM lichtrano WHERE hopdongvayvon_id = ? AND kythu = 2',
    [hopdongvayvonId]
  );

  // Cap nhat ky 1
  const [result] = await executor.execute(
    'UPDATE lichtrano SET ngaydenhan = ?, sotienlaiphaitra = ? WHERE hopdongvayvon_id = ? AND kythu = 1',
    [ngayDenHanStr, sotienlaiphaitra, hopdongvayvonId]
  );

  // Neu khong co ky 1 thi tao moi
  if (result.affectedRows === 0) {
    // Lay sotiengoc tu ky cu hoac tinh moi
    const [[existing]] = await executor.execute(
      'SELECT sotiengocphaitra FROM lichtrano WHERE hopdongvayvon_id = ? ORDER BY kythu LIMIT 1',
      [hopdongvayvonId]
    );
    const goc = existing?.sotiengocphaitra || parseFloat(sotienvon);

    await executor.execute(
      `INSERT INTO lichtrano (hopdongvayvon_id, kythu, ngaydenhan, sotiengocphaitra, sotienlaiphaitra, trangthai)
       VALUES (?, 1, ?, ?, ?, 'Chua den han')`,
      [hopdongvayvonId, ngayDenHanStr, goc, sotienlaiphaitra]
    );
  }

  return { ngayDenHan: ngayDenHanStr, sotienlaiphaitra };
};

export default {
  createHopDong,
  createLichTraNo,
  capNhatNgayGiaiNganDot1,
  capNhatNgayGiaiNganDot2,
  tangLanNghiemThuDat,
  capNhatLichTraNoKhiKhongDat,
  getByHopDongId,
  getByApplicationId
};
