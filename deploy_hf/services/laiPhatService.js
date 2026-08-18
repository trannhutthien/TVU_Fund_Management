import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SETTINGS_PATH = path.join(__dirname, '../config/system_settings.json');

// ═══════════════════════════════════════════════════════════════════════════════
// LAI PHAT SERVICE — Tinh tien phat qua han (Dieu 19.3)
// Cong thuc: LaiPhat(i) = GocConLai(i) × (HeSoPhat × LaiSuatNHThamChieu) × SoNgayQuaHan / 365
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Doc he so phat toi da tu system_settings.json
 */
const getHeSoPhat = () => {
  try {
    const raw = fs.readFileSync(SETTINGS_PATH, 'utf-8');
    const settings = JSON.parse(raw);
    return settings.tyleLaiPhatToiDa ?? 2;
  } catch {
    return 2;
  }
};

/**
 * Doc lai suat ngan hang tham chieu tu system_settings.json
 */
const getLaiSuatNganHangThamChieu = () => {
  try {
    const raw = fs.readFileSync(SETTINGS_PATH, 'utf-8');
    const settings = JSON.parse(raw);
    return settings.laisuatnganhangthamchieu ?? 2.6;
  } catch {
    return 2.6;
  }
};

/**
 * Tinh lai suat phat (%/nam) = HeSoPhat × LaiSuatNganHangThamChieu
 * @returns {number} Lai suat phat (%/nam)
 */
const tinhLaiSuatPhat = () => {
  const heSoPhat = getHeSoPhat();
  const laiSuatThamChieu = getLaiSuatNganHangThamChieu();
  return Math.round(heSoPhat * laiSuatThamChieu * 100) / 100;
};

/**
 * Tinh tien lai phat qua han theo cong thuc chuan:
 *   LaiPhat(i) = SoTienGocConLai_i × (HeSoPhat × LaiSuatNHThamChieu) × SoNgayQuaHan / 365
 *
 * @param {number} soTienGocConLai - No goc con lai chua tra (sotiengocphaitra - sotiendadatra goc, hoac sotiengocphaitra neu chua tra gi)
 * @param {string} ngaydenhan - Ngay den han (YYYY-MM-DD)
 * @param {string} ngayHienTai - Ngay tinh phat (mac dinh: hom nay)
 * @returns {number} So tien lai phat (lam tron den 2 so thap phan)
 */
const tinhLaiPhat = (soTienGocConLai, ngaydenhan, ngayHienTai = null) => {
  if (!soTienGocConLai || !ngaydenhan) return 0;

  const ngayDenHan = new Date(ngaydenhan);
  const ngayTinh = ngayHienTai ? new Date(ngayHienTai) : new Date();

  // Neu chua qua han thi khong tinh phat
  if (ngayTinh <= ngayDenHan) return 0;

  // Tinh so ngay qua han
  const soNgayQuaHan = Math.floor((ngayTinh - ngayDenHan) / (1000 * 60 * 60 * 24));
  if (soNgayQuaHan <= 0) return 0;

  // Lai suat phat = HeSoPhat × LaiSuatNganHangThamChieu
  const heSoPhat = getHeSoPhat();
  const laiSuatThamChieu = getLaiSuatNganHangThamChieu();
  const laiSuatPhatNam = heSoPhat * laiSuatThamChieu; // VD: 2 × 2.6 = 5.2%/nam

  // Lai phat = GocConLai × (LaiSuatPhat / 100) × (SoNgayQuaHan / 365)
  const laiPhat = parseFloat(soTienGocConLai) * (laiSuatPhatNam / 100) * (soNgayQuaHan / 365);

  return Math.round(laiPhat * 100) / 100;
};

/**
 * Cap nhat trang thai qua han cho cac ky tra no qua han
 * Chay boi cron job moi ngay
 * @returns {object} { soKyQuaHanMoi, soHopDongQuaHan }
 */
const capNhatTrangThaiQuaHan = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Tim cac ky tra no chua den han nhung da qua ngay den han
    const [rows] = await connection.query(`
      SELECT
        lt.lichtrano_id,
        lt.hopdongvayvon_id,
        lt.kythu,
        lt.ngaydenhan,
        lt.sotiengocphaitra,
        lt.sotienlaiphaitra,
        lt.sotienthuctra,
        lt.sotienlaiphat,
        hd.laisuatphatphantram
      FROM lichtrano lt
      INNER JOIN hopdongvayvon hd ON lt.hopdongvayvon_id = hd.hopdongvayvon_id
      WHERE lt.trangthai = 'Chua den han'
        AND lt.ngaydenhan < CURDATE()
    `);

    if (rows.length === 0) {
      await connection.commit();
      return { soKyQuaHanMoi: 0, soHopDongQuaHan: 0 };
    }

    let soKyQuaHanMoi = 0;
    const hopDongIds = new Set();

    for (const ky of rows) {
      // Goc con lai = sotiengocphaitra - so tien goc da tra (neu co)
      const gocDaTra = Number(ky.sotienthuctra) > 0
        ? Math.min(Number(ky.sotienthuctra), Number(ky.sotiengocphaitra))
        : 0;
      const soTienGocConLai = Number(ky.sotiengocphaitra) - gocDaTra;

      // Tinh lai phat theo cong thuc chuan
      const laiPhat = tinhLaiPhat(soTienGocConLai, ky.ngaydenhan);

      // Cap nhat trang thai + tien phat
      await connection.query(`
        UPDATE lichtrano
        SET trangthai = 'Qua han',
            sotienlaiphat = ?
        WHERE lichtrano_id = ?
      `, [laiPhat, ky.lichtrano_id]);

      soKyQuaHanMoi++;
      hopDongIds.add(ky.hopdongvayvon_id);
    }

    // 2. Cap nhat hopdongvayvon neu co ky qua han
    for (const hdId of hopDongIds) {
      await connection.query(`
        UPDATE hopdongvayvon
        SET trangthai = 'Qua han'
        WHERE hopdongvayvon_id = ? AND trangthai = 'Dang thuc hien'
      `, [hdId]);
    }

    await connection.commit();

    return {
      soKyQuaHanMoi,
      soHopDongQuaHan: hopDongIds.size,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export default {
  getHeSoPhat,
  getLaiSuatNganHangThamChieu,
  tinhLaiPhat,
  tinhLaiSuatPhat,
  capNhatTrangThaiQuaHan,
};
