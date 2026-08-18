import pool from "../../config/db.js";

// ── Helper: Tao donvihoc ─────────────────────────────────────────────────────
const ensureApplicationDonViHocId = async (connection, tenKhoa) => {
  if (!tenKhoa) return null;

  const [dvRows] = await connection.query(
    "SELECT donvihoc_id FROM donvihoc WHERE tenkhoa = ? LIMIT 1",
    [tenKhoa]
  );

  if (dvRows.length > 0) return dvRows[0].donvihoc_id;

  const madonvi = `TVU-${Date.now()}`;
  const [dvInsert] = await connection.query(
    "INSERT INTO donvihoc (madonvi, tenkhoa, trangthai) VALUES (?, ?, 'Hoat dong')",
    [madonvi, tenKhoa]
  );
  return dvInsert.insertId;
};

// ── Helper: Tao nguoi dung (ho tro) ──────────────────────────────────────────
const ROLE_TO_LOAITAIKHOAN = {
  'sinh_vien': 'Sinh vien',
  'can_bo_truong': 'Can bo',
  'can_bo_nghi_huu': 'Can bo',
  'nha_khoa_hoc': 'Nha khoa hoc',
};

const ensureApplicationUser = async (connection, app, email, plainPassword) => {
  const [users] = await connection.query(
    "SELECT nguoidung_id FROM nguoidung WHERE email = ? LIMIT 1",
    [email]
  );
  if (users.length > 0) return users[0].nguoidung_id;

  const bcrypt = await import("bcryptjs");
  const hashedPassword = await bcrypt.default.hash(plainPassword, 10);
  const maSoDinhDanh = app.guest_mssv || `SV${Date.now()}`;
  const donvihocId = await ensureApplicationDonViHocId(connection, app.guest_khoa);
  const loaitaikhoan = ROLE_TO_LOAITAIKHOAN[app.vaitro] || 'Sinh vien';

  const [userInsert] = await connection.query(
    `INSERT INTO nguoidung (
      email, matkhau, hoten, masodinhdanh, sodienthoai, vaitro_id, loaitaikhoan, donvihoc_id, lop, trangthai
    ) VALUES (?, ?, ?, ?, ?, 4, ?, ?, ?, 'Hoat dong')`,
    [email, hashedPassword, app.guest_hoten, maSoDinhDanh, app.guest_sodienthoai, loaitaikhoan, donvihocId, app.guest_lop || null]
  );
  return userInsert.insertId;
};

// ── Helper: Upsert tai khoan ngan hang ───────────────────────────────────────
const upsertApplicationBankAccount = async (connection, nguoiDungId, app) => {
  if (!app.guest_sotaikhoan || !app.guest_nganhang || !app.guest_chutaikhoan) return null;

  const soTaiKhoan = String(app.guest_sotaikhoan).trim();
  const nganHang = String(app.guest_nganhang).trim();
  const chuTaiKhoan = String(app.guest_chutaikhoan).trim().toUpperCase();

  const [userRows] = await connection.query(
    "SELECT taikhoannganhang_id FROM nguoidung WHERE nguoidung_id = ? LIMIT 1",
    [nguoiDungId]
  );
  const existingAccountId = userRows[0]?.taikhoannganhang_id;

  if (existingAccountId) {
    await connection.query(
      `UPDATE taikhoannganhang SET sotaikhoan = ?, nganhang = ?, chutaikhoan = ? WHERE taikhoannganhang_id = ?`,
      [soTaiKhoan, nganHang, chuTaiKhoan, existingAccountId]
    );
    return existingAccountId;
  }

  const [bankInsert] = await connection.query(
    `INSERT INTO taikhoannganhang (quy_id, sotaikhoan, nganhang, chutaikhoan, trangthai)
     VALUES (NULL, ?, ?, ?, 'Hoat dong')`,
    [soTaiKhoan, nganHang, chuTaiKhoan]
  );
  const bankAccountId = bankInsert.insertId;
  await connection.query(
    "UPDATE nguoidung SET taikhoannganhang_id = ? WHERE nguoidung_id = ?",
    [bankAccountId, nguoiDungId]
  );
  return bankAccountId;
};

// ── Helper: Tao yeucauhotro + pheduyet ───────────────────────────────────────
const createMainApplicationRecords = async (connection, app, nguoiDungId) => {
  const today = new Date().toISOString().split('T')[0];
  const [dotRows] = await connection.query(
    `SELECT dot_id FROM dotgiaingan 
     WHERE quy_id = ? 
       AND trangthai IN ('chuatoi', 'dangchodutien')
       AND (ngaybatdau IS NULL OR ngaybatdau <= ?)
       AND (ngayketthuc IS NULL OR ngayketthuc >= ?)
     ORDER BY thutu ASC LIMIT 1`,
    [app.quy_id, today, today]
  );
  const dotId = dotRows[0]?.dot_id || null;

  const tieuDe = app.tieu_de || (app.lydo ? app.lydo.substring(0, 200) : null);

  const [appInsert] = await connection.query(
    `INSERT INTO yeucauhotro (
      nguoidung_id, quy_id, tieu_de, dot_id, lydo, sotiendenghi, tailieudinhkem, trangthai, loaihotro, canghiemthu, tongkinhphidudan
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Cho duyet cap 1', ?, ?, ?)`,
    [
      nguoiDungId, app.quy_id, tieuDe, dotId, app.lydo, app.sotiendenghi, app.tailieudinhkem,
      app.loai_hotro || 'Tai tro khong hoan lai',
      (app.loai_hotro === 'Cho vay' || app.loai_hotro === 'Tai tro co thu hoi' || app.laDeTai === 1) ? 1 : 0,
      app.tong_kinh_phi_du_an || null
    ]
  );
  const yeucauhotroId = appInsert.insertId;

  for (const cap of [1, 2, 3]) {
    await connection.execute(
      `INSERT INTO pheduyet (yeucauhotro_id, nguoiduyet_id, capduyet, ketqua) VALUES (?, NULL, ?, 'Cho duyet')`,
      [yeucauhotroId, cap]
    );
  }
  return yeucauhotroId;
};

// ── Helper: Tao nguoi dung (tai tro) ─────────────────────────────────────────
const ensureDonationUser = async (connection, don, email, plainPassword, loaitaikhoan = 'Nha tai tro') => {
  const [users] = await connection.query(
    "SELECT nguoidung_id FROM nguoidung WHERE email = ? LIMIT 1",
    [email]
  );
  if (users.length > 0) return users[0].nguoidung_id;

  const bcrypt = await import("bcryptjs");
  const hashedPassword = await bcrypt.default.hash(plainPassword, 10);
  const maSoDinhDanh = `GG${Date.now()}`;

  const [userInsert] = await connection.query(
    `INSERT INTO nguoidung (
      email, matkhau, hoten, masodinhdanh, sodienthoai, vaitro_id, loaitaikhoan, trangthai, diachi
    ) VALUES (?, ?, ?, ?, ?, 4, ?, 'Hoat dong', ?)`,
    [email, hashedPassword, don.guest_hoten, maSoDinhDanh, don.guest_sodienthoai, loaitaikhoan, don.guest_diachi]
  );
  return userInsert.insertId;
};

// ── Helper: Tao nha tai tro ──────────────────────────────────────────────────
const ensureDonorRecord = async (connection, don, email, nguoiDungId) => {
  const [donors] = await connection.query(
    "SELECT nhataitro_id FROM nhataitro WHERE nguoidung_id = ? LIMIT 1",
    [nguoiDungId]
  );
  if (donors.length > 0) return donors[0].nhataitro_id;

  const loaiNhaTaiTro = don.loaiNhaTaiTro || (don.guest_tochuc ? "To chuc" : "Ca nhan");
  const tenNhaTaiTro = don.guest_tochuc || don.guest_hoten;
  const [donorInsert] = await connection.query(
    `INSERT INTO nhataitro (nguoidung_id, tennhataitro, loainhataitro, trangthai)
     VALUES (?, ?, ?, 'Hoat dong')`,
    [nguoiDungId, tenNhaTaiTro, loaiNhaTaiTro]
  );
  return donorInsert.insertId;
};

// ── Helper: Tao khoan tai tro ────────────────────────────────────────────────
const createMainDonationRecord = async (connection, don, nhaTaiTroId) => {
  const [donationInsert] = await connection.query(
    `INSERT INTO khoantaitro (
      nhataitro_id, quy_id, sotien, hinhthuc, magiaodich, ngaytaitro, chungtu, trangthai, ghichu
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Cho duyet', ?)`,
    [nhaTaiTroId, don.quy_id, don.sotien, don.hinhthuc, don.magiaodich, don.ngaytaitro, don.chungtu, don.ghichu]
  );
  return donationInsert.insertId;
};

// ═══════════════════════════════════════════════════════════════════════════════
// GUEST_TRACKING — Bang duy nhat thay the 2 bang cu
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Luu thong tin tracking khi khach nop don (truoc OTP).
 * @param {Object} data - { trackingUuid, hoten, email, loai, quyId, sotien, otpHash }
 * @returns {string} tracking_uuid
 */
const createTracking = async ({ trackingUuid, hoten, email, loai, quyId, sotien, otpHash }) => {
  await pool.execute(
    `INSERT INTO guest_tracking (tracking_uuid, hoten, email, loai, quy_id, sotien, otp_hash, trangthai)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'CHO_XAC_MINH')`,
    [trackingUuid, hoten, email, loai, quyId, sotien, otpHash || null]
  );
  return trackingUuid;
};

/**
 * Tim tracking theo UUID va otp_hash (dung cho TrackPage OTP verification).
 */
const findByTrackingUuidAndOtpHash = async (trackingUuid, otpHash) => {
  const [rows] = await pool.query(
    `SELECT * FROM guest_tracking 
     WHERE tracking_uuid = ? AND otp_hash = ? AND trangthai = 'CHO_XAC_MINH'
     LIMIT 1`,
    [trackingUuid, otpHash]
  );
  return rows[0] || null;
};

/**
 * Chuyen doi don ho tro: tao nguoidung + yeucauhotro + pheduyet, cap nhat guest_tracking.
 * Du lieu lay tu otpToken (stateless).
 */
const verifyAndMigrateApplication = async (applicationData, plainPassword) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const app = applicationData;
    const email = (app.guestEmail || '').trim().toLowerCase();

    // 1. Kiem tra tracking da duoc verify chua
    const [existing] = await connection.query(
      "SELECT tracking_uuid FROM guest_tracking WHERE tracking_uuid = ? AND trangthai != 'CHO_XAC_MINH' LIMIT 1",
      [app.trackingUuid]
    );
    if (existing.length > 0) throw new Error("OTP_ALREADY_VERIFIED");

    // 2. Tao nguoi dung
    const nguoiDungId = await ensureApplicationUser(connection, {
      guest_hoten: app.guestHoTen,
      guest_email: email,
      guest_sodienthoai: app.guestSoDienThoai,
      guest_mssv: app.guestMssv,
      guest_khoa: app.guestKhoa,
      guest_lop: app.guestLop,
      vaitro: app.vaitro,
    }, email, plainPassword);

    // 3. Tao tai khoan ngan hang
    await upsertApplicationBankAccount(connection, nguoiDungId, {
      guest_sotaikhoan: app.guestSoTaiKhoan,
      guest_nganhang: app.guestNganHang,
      guest_chutaikhoan: app.guestChuTaiKhoan,
    });

    // 4. Tao yeucauhotro + pheduyet
    const yeucauhotroId = await createMainApplicationRecords(connection, {
      quy_id: app.quyId,
      tieu_de: app.tieuDe,
      lydo: app.lyDo,
      sotiendenghi: app.soTienDeNghi,
      tailieudinhkem: app.taiLieuDinhKem,
      loai_hotro: app.loaiHoTro,
      laDeTai: app.laDeTai,
      tong_kinh_phi_du_an: app.tongKinhPhiDuAn,
    }, nguoiDungId);

    // 5. Cap nhat guest_tracking
    await connection.query(
      `UPDATE guest_tracking 
       SET trangthai = 'DA_CHUYEN', doituong_id = ?, nguoidung_id = ?
       WHERE tracking_uuid = ?`,
      [yeucauhotroId, nguoiDungId, app.trackingUuid]
    );

    await connection.commit();
    return { success: true, yeucauhotroId, nguoiDungId, trackingUuid: app.trackingUuid };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Chuyen doi don tai tro: tao nguoidung + nhataitro + khoantaitro, cap nhat guest_tracking.
 */
const verifyAndMigrateDonation = async (donationData, plainPassword) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const don = donationData;
    const email = (don.guestEmail || '').trim().toLowerCase();

    // 1. Kiem tra da verify chua
    const [existing] = await connection.query(
      "SELECT tracking_uuid FROM guest_tracking WHERE tracking_uuid = ? AND trangthai != 'CHO_XAC_MINH' LIMIT 1",
      [don.trackingUuid]
    );
    if (existing.length > 0) throw new Error("OTP_ALREADY_VERIFIED");

    // 2. Tao nguoi dung
    const nguoiDungId = await ensureDonationUser(connection, {
      guest_hoten: don.guestHoTen,
      guest_sodienthoai: don.guestSoDienThoai,
      guest_tochuc: don.guestToChuc,
      guest_diachi: don.guestDiaChi,
      loaiNhaTaiTro: don.loaiNhaTaiTro,
    }, email, plainPassword, 'Nha tai tro');

    // 3. Tao nha tai tro
    const nhaTaiTroId = await ensureDonorRecord(connection, {
      guest_hoten: don.guestHoTen,
      guest_tochuc: don.guestToChuc,
      guest_sodienthoai: don.guestSoDienThoai,
      guest_diachi: don.guestDiaChi,
      loaiNhaTaiTro: don.loaiNhaTaiTro,
    }, email, nguoiDungId);

    // 4. Tao khoan tai tro
    const khoanTaiTroId = await createMainDonationRecord(connection, {
      quy_id: don.quyId,
      sotien: don.soTien,
      hinhthuc: don.hinhThuc,
      magiaodich: don.maGiaoDich,
      ngaytaitro: don.ngayTaiTro,
      chungtu: don.chungTu,
      ghichu: don.ghiChu,
    }, nhaTaiTroId);

    // 5. Cap nhat guest_tracking
    await connection.query(
      `UPDATE guest_tracking 
       SET trangthai = 'DA_CHUYEN', doituong_id = ?, nguoidung_id = ?
       WHERE tracking_uuid = ?`,
      [khoanTaiTroId, nguoiDungId, don.trackingUuid]
    );

    await connection.commit();
    return { success: true, khoanTaiTroId, nhaTaiTroId, nguoiDungId, trackingUuid: don.trackingUuid };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Tra cuu trang thai don theo UUID.
 * Tra ve du lieu giong hieu ung truoc de khong pha frontend.
 */
const trackStatusByUuid = async (uuid) => {
  const [rows] = await pool.query(
    `SELECT 
      gt.tracking_uuid,
      gt.hoten,
      gt.email,
      gt.loai,
      gt.quy_id,
      gt.sotien,
      gt.doituong_id,
      gt.nguoidung_id,
      gt.trangthai,
      gt.ngaytao,
      q.tenquy,
      CASE 
        WHEN gt.loai = 'yeucauhotro' AND gt.doituong_id IS NOT NULL THEN yc.trangthai
        WHEN gt.loai = 'khoantaitro' AND gt.doituong_id IS NOT NULL THEN kt.trangthai
        ELSE NULL 
      END AS real_status,
      CASE 
        WHEN gt.loai = 'yeucauhotro' AND gt.doituong_id IS NOT NULL THEN yc.ghichu
        WHEN gt.loai = 'khoantaitro' AND gt.doituong_id IS NOT NULL THEN kt.ghichu
        ELSE NULL 
      END AS real_ghichu
     FROM guest_tracking gt
     INNER JOIN quy q ON gt.quy_id = q.quy_id
     LEFT JOIN yeucauhotro yc ON gt.loai = 'yeucauhotro' AND gt.doituong_id = yc.yeucauhotro_id
     LEFT JOIN khoantaitro kt ON gt.loai = 'khoantaitro' AND gt.doituong_id = kt.khoantaitro_id
     WHERE gt.tracking_uuid = ? LIMIT 1`,
    [uuid]
  );

  if (rows.length === 0) return null;

  const data = rows[0];
  return {
    type: data.loai === 'yeucauhotro' ? 'application' : 'donation',
    name: data.hoten,
    email: data.email,
    fundName: data.tenquy,
    amount: parseFloat(data.sotien),
    stagingStatus: data.trangthai,
    realStatus: data.real_status || "CHO_XAC_MINH",
    note: data.real_ghichu || "",
    createdAt: data.ngaytao,
  };
};

export default {
  createTracking,
  findByTrackingUuidAndOtpHash,
  verifyAndMigrateApplication,
  verifyAndMigrateDonation,
  trackStatusByUuid,
};
