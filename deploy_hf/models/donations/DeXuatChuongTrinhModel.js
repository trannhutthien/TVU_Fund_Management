import pool from "../../config/db.js";

// ═══════════════════════════════════════════════════════════════════════════════
// ─── ĐỀ XUẤT CHƯƠNG TRÌNH MODEL ───────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
// Xử lý Case 4: Nhà tài trợ tài trợ vào quỹ thành phần (cấp 2) + đề xuất chương trình mới

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: createProposal
// MỤC ĐÍCH: Tạo đề xuất chương trình mới (kèm theo khoản tài trợ)
// ─────────────────────────────────────────────────────────────────────────────
const createProposal = async (proposalData) => {
  const {
    quyThanhPhanId,
    khoanTaiTroId,
    nhaTaiTroId,
    tenChuongTrinh,
    moTa,
    soLuongSuat,
    soTienMoiSuat,
    loaiHoTro,
    ngayBatDau,
    ngayKetThuc
  } = proposalData;

  const [result] = await pool.execute(
    `INSERT INTO dexuatchuongtrinh (
      quythanhphan_id,
      khoantaitro_id,
      nhataitro_id,
      tenchuongtrinh,
      mota,
      soluongsuat,
      sotienmoisuat,
      loaihotro,
      ngaybatdau,
      ngayketthuc,
      trangthai
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Cho duyet')`,
    [
      quyThanhPhanId,
      khoanTaiTroId || null,
      nhaTaiTroId || null,
      tenChuongTrinh,
      moTa || null,
      soLuongSuat,
      soTienMoiSuat,
      loaiHoTro || 'Tai tro khong hoan lai',
      ngayBatDau || null,
      ngayKetThuc || null
    ]
  );

  return result;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: createPublicProposal
// MỤC ĐÍCH: Khách vãng lai tạo đề xuất chương trình (KHÔNG CẦN TOKEN)
//   1. Tạo proposal trong dexuatchuongtrinh (khoanTaiTroId = null, nhaTaiTroId = null)
//   2. Tạo guest_tracking record link tới proposal
// ─────────────────────────────────────────────────────────────────────────────
const createPublicProposal = async (proposalData) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const {
      quyThanhPhanId,
      tenChuongTrinh,
      moTa,
      soLuongSuat,
      soTienMoiSuat,
      loaiHoTro,
      ngayBatDau,
      ngayKetThuc,
      guestHoTen,
      guestEmail,
      guestSoDienThoai,
      trackingUuid,
      otpHash
    } = proposalData;

    // Bước 1: Tạo proposal
    const [proposalResult] = await connection.execute(
      `INSERT INTO dexuatchuongtrinh (
        quythanhphan_id, khoantaitro_id, nhataitro_id,
        tenchuongtrinh, mota, soluongsuat, sotienmoisuat,
        loaihotro, ngaybatdau, ngayketthuc, trangthai
      ) VALUES (?, NULL, NULL, ?, ?, ?, ?, ?, ?, ?, 'Cho duyet')`,
      [
        quyThanhPhanId,
        tenChuongTrinh,
        moTa || null,
        soLuongSuat,
        soTienMoiSuat,
        loaiHoTro || 'Tai tro khong hoan lai',
        ngayBatDau || null,
        ngayKetThuc || null
      ]
    );

    const proposalId = proposalResult.insertId;

    // Bước 2: Tạo guest_tracking link tới proposal
    await connection.execute(
      `INSERT INTO guest_tracking (tracking_uuid, hoten, email, loai, quy_id, sotien, otp_hash, trangthai, dexuatchuongtrinh_id)
       VALUES (?, ?, ?, 'dexuatchuongtrinh', ?, ?, ?, 'CHO_XAC_MINH', ?)`,
      [
        trackingUuid,
        guestHoTen,
        guestEmail,
        quyThanhPhanId,
        soLuongSuat * soTienMoiSuat,
        otpHash || null,
        proposalId
      ]
    );

    await connection.commit();
    return { insertId: proposalId };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getProposalById
// MỤC ĐÍCH: Lấy chi tiết đề xuất chương trình theo ID
// ─────────────────────────────────────────────────────────────────────────────
const getProposalById = async (id) => {
  const [rows] = await pool.query(
    `SELECT 
      dx.dexuatchuongtrinh_id,
      dx.quythanhphan_id,
      dx.khoantaitro_id,
      dx.nhataitro_id,
      dx.tenchuongtrinh,
      dx.mota,
      dx.soluongsuat,
      dx.sotienmoisuat,
      dx.loaihotro,
      dx.ngaybatdau,
      dx.ngayketthuc,
      dx.trangthai,
      dx.lydotuchoi,
      dx.nguoiduyet_id,
      dx.ngayduyet,
      dx.quyketqua_id,
      dx.ngaytao,
      qtp.tenquy AS ten_quy_thanh_phan,
      qtp.sodu AS so_du_quy_thanh_phan,
      qtp.loaiquy_id,
      ntt.tennhataitro,
      ntt.loainhataitro,
      nd_ntt.email AS nhataitro_email,
      nd_ntt.sodienthoai AS nhataitro_sodienthoai,
      nd_duyet.hoten AS nguoi_duyet_ten,
      qkq.tenquy AS ten_quy_ket_qua,
      kt.sotien AS so_tien_tai_tro
     FROM dexuatchuongtrinh dx
     INNER JOIN quy qtp ON dx.quythanhphan_id = qtp.quy_id
     LEFT JOIN nhataitro ntt ON dx.nhataitro_id = ntt.nhataitro_id
     LEFT JOIN nguoidung nd_ntt ON ntt.nguoidung_id = nd_ntt.nguoidung_id
     LEFT JOIN nguoidung nd_duyet ON dx.nguoiduyet_id = nd_duyet.nguoidung_id
     LEFT JOIN quy qkq ON dx.quyketqua_id = qkq.quy_id
     LEFT JOIN khoantaitro kt ON dx.khoantaitro_id = kt.khoantaitro_id
     WHERE dx.dexuatchuongtrinh_id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: listProposals
// MỤC ĐÍCH: Liệt kê danh sách đề xuất chương trình (phân trang + filters)
// ─────────────────────────────────────────────────────────────────────────────
const listProposals = async ({
  quy_thanh_phan_id = '',
  trang_thai = '',
  keyword = '',
  page = 1,
  page_size = 15
}) => {
  const conds = [];
  const params = [];

  if (quy_thanh_phan_id) {
    conds.push(`dx.quythanhphan_id = ?`);
    params.push(quy_thanh_phan_id);
  }
  if (trang_thai) {
    conds.push(`dx.trangthai = ?`);
    params.push(trang_thai);
  }
  if (keyword) {
    conds.push(`(dx.tenchuongtrinh LIKE ? OR dx.mota LIKE ? OR ntt.tennhataitro LIKE ?)`);
    const like = `%${keyword}%`;
    params.push(like, like, like);
  }

  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
  const offset = (page - 1) * page_size;

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total 
     FROM dexuatchuongtrinh dx
     LEFT JOIN nhataitro ntt ON dx.nhataitro_id = ntt.nhataitro_id
     ${where}`,
    params
  );

  const [rows] = await pool.query(
    `SELECT 
      dx.dexuatchuongtrinh_id,
      dx.quythanhphan_id,
      dx.khoantaitro_id,
      dx.nhataitro_id,
      dx.tenchuongtrinh,
      dx.mota,
      dx.soluongsuat,
      dx.sotienmoisuat,
      dx.loaihotro,
      dx.ngaybatdau,
      dx.ngayketthuc,
      dx.trangthai,
      dx.nguoiduyet_id,
      dx.ngayduyet,
      dx.quyketqua_id,
      dx.ngaytao,
      qtp.tenquy AS ten_quy_thanh_phan,
      ntt.tennhataitro,
      ntt.loainhataitro,
      nd_duyet.hoten AS nguoi_duyet_ten,
      qkq.tenquy AS ten_quy_ket_qua,
      kt.sotien AS so_tien_tai_tro
     FROM dexuatchuongtrinh dx
     INNER JOIN quy qtp ON dx.quythanhphan_id = qtp.quy_id
     LEFT JOIN nhataitro ntt ON dx.nhataitro_id = ntt.nhataitro_id
     LEFT JOIN nguoidung nd_duyet ON dx.nguoiduyet_id = nd_duyet.nguoidung_id
     LEFT JOIN quy qkq ON dx.quyketqua_id = qkq.quy_id
     LEFT JOIN khoantaitro kt ON dx.khoantaitro_id = kt.khoantaitro_id
     ${where}
     ORDER BY 
       CASE dx.trangthai
         WHEN 'Cho duyet' THEN 1
         WHEN 'Da duyet' THEN 2
         WHEN 'Tu choi' THEN 3
       END,
       dx.ngaytao DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(page_size), offset]
  );

  return { rows, total: Number(total) || 0 };
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: approveByCanBo (BƯỚC 1)
// MỤC ĐÍCH: Cán bộ duyệt nội dung đề xuất
// ─────────────────────────────────────────────────────────────────────────────
const approveByCanBo = async (id, canBoDuyetId, ghiChu = null, quyThanhPhanIdMoi = null) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // 1. Kiểm tra proposal tồn tại và có thể duyệt
    const [dxRows] = await connection.query(
      `SELECT * FROM dexuatchuongtrinh WHERE dexuatchuongtrinh_id = ? FOR UPDATE`,
      [id]
    );
    const dx = dxRows[0];
    if (!dx) {
      throw new Error('PROPOSAL_NOT_FOUND');
    }
    if (dx.trangthai !== 'Cho duyet') {
      throw new Error('PROPOSAL_ALREADY_PROCESSED');
    }

    // 2. Cập nhật quỹ thành phần nếu cán bộ sửa
    const quyThanhPhanId = quyThanhPhanIdMoi || dx.quythanhphan_id;

    // 3. Cập nhật trạng thái: Cán bộ đã duyệt
    await connection.execute(
      `UPDATE dexuatchuongtrinh 
       SET trangthai = 'Can bo da duyet',
           canbo_duyet_id = ?,
           ngay_canbo_duyet = CURRENT_TIMESTAMP,
           ghi_chu_canbo = ?,
           quythanhphan_id = ?
       WHERE dexuatchuongtrinh_id = ?`,
      [canBoDuyetId, ghiChu, quyThanhPhanId, id]
    );

    await connection.commit();
    return { success: true, proposalId: id };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: rejectByCanBo (BƯỚC 1 - Từ chối)
// MỤC ĐÍCH: Cán bộ từ chối đề xuất
// ─────────────────────────────────────────────────────────────────────────────
const rejectByCanBo = async (id, canBoDuyetId, lyDoTuChoi, ghiChu = null) => {
  const [result] = await pool.execute(
    `UPDATE dexuatchuongtrinh 
     SET trangthai = 'Tu choi',
         canbo_duyet_id = ?,
         ngay_canbo_duyet = CURRENT_TIMESTAMP,
         lydotuchoi = ?,
         ghi_chu_canbo = ?
     WHERE dexuatchuongtrinh_id = ? AND trangthai = 'Cho duyet'`,
    [canBoDuyetId, lyDoTuChoi, ghiChu, id]
  );
  return result.affectedRows > 0;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: confirmMoneyByKeToan (BƯỚC 2)
// MỤC ĐÍCH: Kế toán xác nhận đã nhận tiền + cộng vào Quỹ Thành Phần
// ─────────────────────────────────────────────────────────────────────────────
const confirmMoneyByKeToan = async (id, keToanId, soTienThucTe = null) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // 1. Kiểm tra proposal
    const [dxRows] = await connection.query(
      `SELECT * FROM dexuatchuongtrinh WHERE dexuatchuongtrinh_id = ? FOR UPDATE`,
      [id]
    );
    const dx = dxRows[0];
    if (!dx) {
      throw new Error('PROPOSAL_NOT_FOUND');
    }
    if (dx.trangthai !== 'Can bo da duyet') {
      throw new Error('PROPOSAL_NOT_APPROVED_BY_CANBO');
    }

    // 2. Tính tổng tiền (dùng số tiền thực tế nếu có, không thì dùng số lượng x giá)
    const tongTien = soTienThucTe || (parseFloat(dx.soluongsuat) * parseFloat(dx.sotienmoisuat));

    // 3. Cộng tiền vào Quỹ Thành Phần (cấp 2)
    const [quyRows] = await connection.query(
      `SELECT * FROM quy WHERE quy_id = ? FOR UPDATE`,
      [dx.quythanhphan_id]
    );
    const quy = quyRows[0];
    if (!quy) {
      throw new Error('FUND_NOT_FOUND');
    }
    if (quy.capdo !== 2) {
      throw new Error('FUND_MUST_BE_LEVEL_2');
    }

    await connection.execute(
      `UPDATE quy 
       SET sodu = sodu + ?, 
           ngaycapnhat = CURRENT_TIMESTAMP 
       WHERE quy_id = ?`,
      [tongTien, dx.quythanhphan_id]
    );

    // 4. Tạo bản ghi giao dịch (audit trail)
    await connection.execute(
      `INSERT INTO giaodich (
        quy_id,
        loaigiaodich,
        sotien,
        ghichu,
        nguoithuchien_id,
        trangthai,
        ngaygiaodich
      ) VALUES (?, 'Thu', ?, ?, ?, 'Thanh cong', CURRENT_TIMESTAMP)`,
      [
        dx.quythanhphan_id,
        tongTien,
        `Nhận tiền tài trợ cho đề xuất chương trình: ${dx.tenchuongtrinh}`,
        keToanId
      ]
    );

    // 5. Cập nhật trạng thái proposal
    await connection.execute(
      `UPDATE dexuatchuongtrinh 
       SET trangthai = 'Da nhan tien',
           ketoan_xacnhan_id = ?,
           ngay_ketoan_xacnhan = CURRENT_TIMESTAMP,
           so_tien_thuc_te = ?
       WHERE dexuatchuongtrinh_id = ?`,
      [keToanId, tongTien, id]
    );

    await connection.commit();
    return { 
      success: true, 
      proposalId: id,
      soTienDaCong: tongTien,
      quyThanhPhanId: dx.quythanhphan_id
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: createActivityByAdmin (BƯỚC 3)
// MỤC ĐÍCH: Admin duyệt và tạo hoạt động/chương trình (Quỹ Cấp 3)
//           Trích tiền từ Quỹ Thành Phần → Hoạt động mới
// ─────────────────────────────────────────────────────────────────────────────
const createActivityByAdmin = async (id, adminId, ghiChu = null) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // 1. Kiểm tra proposal
    const [dxRows] = await connection.query(
      `SELECT * FROM dexuatchuongtrinh WHERE dexuatchuongtrinh_id = ? FOR UPDATE`,
      [id]
    );
    const dx = dxRows[0];
    if (!dx) {
      throw new Error('PROPOSAL_NOT_FOUND');
    }
    if (dx.trangthai !== 'Da nhan tien') {
      throw new Error('PROPOSAL_MONEY_NOT_CONFIRMED');
    }
    if (dx.quyketqua_id) {
      throw new Error('ACTIVITY_ALREADY_CREATED');
    }

    const {
      quythanhphan_id,
      tenchuongtrinh,
      mota,
      soluongsuat,
      sotienmoisuat,
      loaihotro,
      ngaybatdau,
      ngayketthuc,
      so_tien_thuc_te
    } = dx;

    const soTienPhanBo = so_tien_thuc_te || (parseFloat(soluongsuat) * parseFloat(sotienmoisuat));

    // 2. Lấy thông tin quỹ thành phần
    const [quyThanhPhanRows] = await connection.query(
      `SELECT loaiquy_id, sodu, capdo FROM quy WHERE quy_id = ? FOR UPDATE`,
      [quythanhphan_id]
    );
    const quyThanhPhan = quyThanhPhanRows[0];
    if (!quyThanhPhan) {
      throw new Error('PARENT_FUND_NOT_FOUND');
    }
    if (quyThanhPhan.capdo !== 2) {
      throw new Error('PARENT_FUND_MUST_BE_LEVEL_2');
    }
    if (parseFloat(quyThanhPhan.sodu) < soTienPhanBo) {
      throw new Error('INSUFFICIENT_PARENT_FUND_BALANCE');
    }

    // 3. Tạo quỹ cấp 3 mới (hoạt động/chương trình)
    const [insertQuyResult] = await connection.execute(
      `INSERT INTO quy (
        tenquy,
        loaiquy_id,
        mota,
        sotienmuctieu,
        sotienhotrotoida,
        soluonghotrotoida,
        ngaybatdau,
        ngayketthuc,
        sodu,
        nguoitao_id,
        trangthai,
        loaidieuhanh,
        quy_cha_id,
        loaihotro,
        capdo
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, 
        0, ?, 'Dang hoat dong', 'Tap trung - Muc chi', ?, ?, 3
      )`,
      [
        tenchuongtrinh,
        quyThanhPhan.loaiquy_id,
        mota || null,
        soTienPhanBo,
        sotienmoisuat,
        soluongsuat,
        ngaybatdau || null,
        ngayketthuc || null,
        adminId,
        quythanhphan_id,
        loaihotro
      ]
    );

    const quyMoiId = insertQuyResult.insertId;

    // 4. Tạo bản ghi phân bổ ngân sách
    const [insertPhanBoResult] = await connection.execute(
      `INSERT INTO phanbongansach (
        quy_nguon_id,
        quy_dich_id,
        sotien,
        soquyetdinh,
        trangthai,
        nguoi_de_xuat_id,
        nguoi_duyet_id,
        ngayduyet,
        ghichu,
        namtaichinh
      ) VALUES (?, ?, ?, ?, 'Da duyet', ?, ?, CURRENT_TIMESTAMP, ?, ?)`,
      [
        quythanhphan_id,
        quyMoiId,
        soTienPhanBo,
        `AUTO-DEXUAT-${id}`,
        adminId,
        adminId,
        `Phân bổ ngân sách cho chương trình "${tenchuongtrinh}" từ đề xuất #${id}`,
        new Date().getFullYear()
      ]
    );

    // 5. Trừ tiền ở quỹ thành phần
    await connection.execute(
      `UPDATE quy 
       SET sodu = sodu - ?, 
           ngaycapnhat = CURRENT_TIMESTAMP 
       WHERE quy_id = ?`,
      [soTienPhanBo, quythanhphan_id]
    );

    // 6. Cộng tiền vào quỹ hoạt động vừa tạo
    await connection.execute(
      `UPDATE quy 
       SET sodu = sodu + ?, 
           ngaycapnhat = CURRENT_TIMESTAMP 
       WHERE quy_id = ?`,
      [soTienPhanBo, quyMoiId]
    );

    // 7. Cập nhật trạng thái đề xuất
    await connection.execute(
      `UPDATE dexuatchuongtrinh 
       SET trangthai = 'Da tao hoat dong',
           admin_duyet_id = ?,
           ngay_admin_duyet = CURRENT_TIMESTAMP,
           ghi_chu_admin = ?,
           quyketqua_id = ?
       WHERE dexuatchuongtrinh_id = ?`,
      [adminId, ghiChu, quyMoiId, id]
    );

    await connection.commit();

    return {
      success: true,
      proposalId: id,
      activityId: quyMoiId,
      phanBoId: insertPhanBoResult.insertId,
      soTienPhanBo
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: rejectProposal
// MỤC ĐÍCH: Từ chối đề xuất chương trình (tiền vẫn nằm ở quỹ thành phần)
// ─────────────────────────────────────────────────────────────────────────────
const rejectProposal = async (id, nguoiDuyetId, lyDoTuChoi) => {
  const [result] = await pool.execute(
    `UPDATE dexuatchuongtrinh 
     SET trangthai = 'Tu choi',
         nguoiduyet_id = ?,
         lydotuchoi = ?,
         ngayduyet = CURRENT_TIMESTAMP
     WHERE dexuatchuongtrinh_id = ? AND trangthai = 'Cho duyet'`,
    [nguoiDuyetId, lyDoTuChoi || null, id]
  );
  return result.affectedRows > 0;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getProposalStats
// MỤC ĐÍCH: Thống kê đề xuất chương trình (cho Dashboard)
// ─────────────────────────────────────────────────────────────────────────────
const getProposalStats = async () => {
  const [[{ choDuyet }]] = await pool.query(
    `SELECT COUNT(*) AS choDuyet FROM dexuatchuongtrinh WHERE trangthai = 'Cho duyet'`
  );
  const [[{ daDuyet }]] = await pool.query(
    `SELECT COUNT(*) AS daDuyet FROM dexuatchuongtrinh WHERE trangthai = 'Da duyet'`
  );
  const [[{ tuChoi }]] = await pool.query(
    `SELECT COUNT(*) AS tuChoi FROM dexuatchuongtrinh WHERE trangthai = 'Tu choi'`
  );
  return {
    choDuyet: Number(choDuyet) || 0,
    daDuyet: Number(daDuyet) || 0,
    tuChoi: Number(tuChoi) || 0
  };
};

export default {
  createProposal,
  createPublicProposal,
  getProposalById,
  listProposals,
  getProposalStats,
  // New 3-step approval workflow functions
  approveByCanBo,
  rejectByCanBo,
  confirmMoneyByKeToan,
  createActivityByAdmin
};
