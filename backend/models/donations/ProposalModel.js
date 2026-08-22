import pool from "../../config/db.js";

// ═══════════════════════════════════════════════════════════════════════════════
// ─── PROPOSAL MODEL ────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════────════════════════════════
// Handles program proposal creation with donation (Case 4)
// Links dexuatchuongtrinh with khoantaitro through dexuat_id foreign key

/**
 * Create or get donor (nhà tài trợ) based on email
 * Reused logic from DonationModel for consistency
 * 
 * @param {Object} connection - MySQL connection (for transaction)
 * @param {Object} donorInfo - { ten, email, soDienThoai }
 * @returns {Object} { nhaTaiTroId }
 */
const createOrGetDonor = async (connection, donorInfo) => {
  const { ten, email, soDienThoai } = donorInfo;
  
  // Check if email exists in nguoidung
  const [existingUsers] = await connection.query(
    `SELECT nguoidung_id FROM nguoidung WHERE email = ? LIMIT 1`,
    [email]
  );
  
  let nhaTaiTroId;
  
  if (existingUsers.length > 0) {
    const nguoiDungId = existingUsers[0].nguoidung_id;
    
    // Check if nhataitro record exists
    const [existingDonors] = await connection.query(
      `SELECT nhataitro_id FROM nhataitro WHERE nguoidung_id = ? LIMIT 1`,
      [nguoiDungId]
    );
    
    if (existingDonors.length > 0) {
      nhaTaiTroId = existingDonors[0].nhataitro_id;
    } else {
      // Create nhataitro record if doesn't exist
      const [insertDonorResult] = await connection.query(
        `INSERT INTO nhataitro (nguoidung_id, tennhataitro, loainhataitro, trangthai) 
         VALUES (?, ?, 'Ca nhan', 'Hoat dong')`,
        [nguoiDungId, ten]
      );
      nhaTaiTroId = insertDonorResult.insertId;
    }
  } else {
    // Create new user in nguoidung
    const maSoDinhDanh = `PUB_${Date.now()}`;
    const defaultHash = "$2a$10$wK1Gv5vM2.H4xN.9dZc.4O1.Ule12Lg0eL2iU3aE8cO8dGz1vN3j.";
    
    const [insertUserResult] = await connection.query(
      `INSERT INTO nguoidung (
        masodinhdanh, 
        hoten, 
        email, 
        matkhau, 
        sodienthoai,
        vaitro_id, 
        trangthai
      ) VALUES (?, ?, ?, ?, ?, 4, 'Hoat dong')`,
      [maSoDinhDanh, ten, email, defaultHash, soDienThoai]
    );
    
    const newNguoiDungId = insertUserResult.insertId;
    
    // Create nhataitro record
    const [insertDonorResult] = await connection.query(
      `INSERT INTO nhataitro (nguoidung_id, tennhataitro, loainhataitro, trangthai) 
       VALUES (?, ?, 'Ca nhan', 'Hoat dong')`,
      [newNguoiDungId, ten]
    );
    
    nhaTaiTroId = insertDonorResult.insertId;
  }
  
  return { nhaTaiTroId };
};

/**
 * Create program proposal with donation in a transaction
 * Case 4: User proposes a new program and makes a donation
 * 
 * @param {Object} data - Proposal and donation data
 * @returns {Object} { deXuatId, khoanTaiTroId, nhaTaiTroId, trangThai }
 */
const createProposalWithDonation = async (data) => {
  const { donorInfo, proposalInfo, donationInfo } = data;
  
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // 1. Create or get donor
    const { nhaTaiTroId } = await createOrGetDonor(connection, donorInfo);
    
    // 2. Create program proposal in dexuatchuongtrinh
    const [proposalResult] = await connection.execute(
      `INSERT INTO dexuatchuongtrinh (
        nhataitro_id,
        quythanhphan_id,
        tenchuongtrinh,
        mota,
        soluongsuat,
        sotienmoisuat,
        sotientaitro,
        loaihotro,
        tilethuhoi,
        ngaybatdau,
        ngayketthuc,
        mucthuhoi,
        trangthai
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Cho duyet')`,
      [
        nhaTaiTroId,
        proposalInfo.quyThanhPhanId,
        proposalInfo.tenChuongTrinh,
        proposalInfo.moTa || null,
        proposalInfo.soLuongSuat || null,
        proposalInfo.soTienMoiSuat || null,
        parseFloat(proposalInfo.soLuongSuat || 0) * parseFloat(proposalInfo.soTienMoiSuat || 0),
        proposalInfo.loaiHinh || 'Tai tro khong hoan lai',
        proposalInfo.tileThuHoi || null,
        proposalInfo.thoiGianBatDau || null,
        proposalInfo.thoiGianKetThuc || null,
        proposalInfo.mucThuHoi || null
      ]
    );
    
    const deXuatId = proposalResult.insertId;
    
    // 3. Create donation record linked to proposal via dexuat_id
    const [donationResult] = await connection.execute(
      `INSERT INTO khoantaitro (
        nhataitro_id,
        quy_id,
        dexuat_id,
        sotien,
        hinhthuc,
        magiaodich,
        ngaytaitro,
        trangthai,
        ghichu,
        chungtu
      ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_DATE, 'Cho duyet', ?, ?)`,
      [
        nhaTaiTroId,
        proposalInfo.quyThanhPhanId, // Temporarily assign to component fund
        deXuatId,                     // Link to proposal
        donationInfo.soTien,
        donationInfo.hinhThuc || 'Chuyen khoan',
        donationInfo.maGiaoDich || null,
        donationInfo.ghiChu || null,
        donationInfo.chungTu || null
      ]
    );
    
    const khoanTaiTroId = donationResult.insertId;
    
    // 4. Update dexuatchuongtrinh with khoantaitro_id for reference
    await connection.execute(
      `UPDATE dexuatchuongtrinh 
       SET khoantaitro_id = ?
       WHERE dexuatchuongtrinh_id = ?`,
      [khoanTaiTroId, deXuatId]
    );
    
    await connection.commit();
    
    return {
      deXuatId,
      khoanTaiTroId,
      nhaTaiTroId,
      trangThai: 'Cho duyet'
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Get proposal by ID with full details
 * 
 * @param {number} id - Proposal ID (dexuatchuongtrinh_id)
 * @returns {Object|null} Proposal details or null if not found
 */
const getProposalById = async (id) => {
  const [rows] = await pool.query(
    `SELECT 
      dx.dexuatchuongtrinh_id,
      dx.nhataitro_id,
      dx.quythanhphan_id,
      dx.khoantaitro_id,
      dx.tenchuongtrinh,
      dx.mota,
      dx.soluongsuat,
      dx.sotienmoisuat,
      dx.loaihotro,
      dx.ngaybatdau,
      dx.ngayketthuc,
      dx.trangthai,
      dx.lydotuchoi,
      dx.quyketqua_id,
      dx.ngaytao,
      qtp.tenquy AS ten_quy_thanh_phan,
      ntt.tennhataitro,
      ntt.loainhataitro,
      nd_ntt.email AS nhataitro_email,
      nd_ntt.sodienthoai AS nhataitro_sodienthoai,
      kt.sotien AS so_tien_tai_tro,
      kt.hinhthuc AS hinh_thuc_tai_tro,
      kt.magiaodich AS ma_giao_dich,
      kt.chungtu AS chung_tu
     FROM dexuatchuongtrinh dx
     INNER JOIN quy qtp ON dx.quythanhphan_id = qtp.quy_id
     LEFT JOIN nhataitro ntt ON dx.nhataitro_id = ntt.nhataitro_id
     LEFT JOIN nguoidung nd_ntt ON ntt.nguoidung_id = nd_ntt.nguoidung_id
     LEFT JOIN khoantaitro kt ON dx.khoantaitro_id = kt.khoantaitro_id
     WHERE dx.dexuatchuongtrinh_id = ?
     LIMIT 1`,
    [id]
  );
  
  return rows.length > 0 ? rows[0] : null;
};

/**
 * Get proposal by donation ID (khoantaitro_id)
 * 
 * @param {number} khoanTaiTroId - Donation ID
 * @returns {Object|null} Proposal details or null if not found
 */
const getProposalByDonationId = async (khoanTaiTroId) => {
  const [rows] = await pool.query(
    `SELECT 
      dx.dexuatchuongtrinh_id,
      dx.nhataitro_id,
      dx.quythanhphan_id,
      dx.tenchuongtrinh,
      dx.mota,
      dx.trangthai,
      dx.ngaytao
     FROM khoantaitro kt
     INNER JOIN dexuatchuongtrinh dx ON kt.dexuat_id = dx.dexuatchuongtrinh_id
     WHERE kt.khoantaitro_id = ?
     LIMIT 1`,
    [khoanTaiTroId]
  );
  
  return rows.length > 0 ? rows[0] : null;
};

export default {
  createProposalWithDonation,
  getProposalById,
  getProposalByDonationId,
  createOrGetDonor // Export for reuse
};
