import pool from "../../config/db.js";
import LaiSuatHelper from "../applications/LaiSuatHelper.js";

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
    nguoiTaoId,
    tuDongDuyetCap1,
    tenChuongTrinh,
    moTa,
    soLuongSuat,
    soTienMoiSuat,
    loaiHoTro,
    tileThuHoi,
    kyHanTraNo,
    ngayBatDau,
    ngayKetThuc,
    mucThuHoi
  } = proposalData;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Nếu do cán bộ tạo: cấp 1 (Cán bộ) tự động duyệt → gửi thẳng cho Kế toán
    const trangThaiDau = tuDongDuyetCap1 ? 'Can bo da duyet' : 'Cho duyet';

    const [result] = await connection.execute(
      `INSERT INTO dexuatchuongtrinh (
        quythanhphan_id,
        khoantaitro_id,
        nhataitro_id,
        tenchuongtrinh,
        mota,
        soluongsuat,
        sotienmoisuat,
        sotientaitro,
        loaihotro,
        tilethuhoi,
        kyhantrano,
        ngaybatdau,
        ngayketthuc,
        mucthuhoi,
        trangthai
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        quyThanhPhanId,
        khoanTaiTroId || null,
        nhaTaiTroId || null,
        tenChuongTrinh,
        moTa || null,
        soLuongSuat,
        soTienMoiSuat,
        parseFloat(soLuongSuat) * parseFloat(soTienMoiSuat),
        loaiHoTro || 'Tai tro khong hoan lai',
        tileThuHoi || null,
        kyHanTraNo || null,
        ngayBatDau || null,
        ngayKetThuc || null,
        mucThuHoi || null,
        trangThaiDau
      ]
    );

    const proposalId = result.insertId;

    // Tạo 3 dòng phê duyệt: Cap 1 = Cán bộ, Cap 2 = Kế toán, Cap 3 = Admin
    // Nếu do cán bộ tạo, dòng Cap 1 được ghi nhận "Đã duyệt" ngay (người duyệt = cán bộ tạo)
    for (const cap of [1, 2, 3]) {
      if (cap === 1 && tuDongDuyetCap1) {
        await connection.execute(
          `INSERT INTO pheduyet (
            dexuatchuongtrinh_id, nguoiduyet_id, capduyet, ketqua, ghichu, ngayduyet
          ) VALUES (?, ?, ?, 'Da duyet', ?, NOW())`,
          [proposalId, nguoiTaoId, cap, 'Cán bộ tạo đề xuất - tự động duyệt cấp 1']
        );
      } else {
        await connection.execute(
          `INSERT INTO pheduyet (
            dexuatchuongtrinh_id, nguoiduyet_id, capduyet, ketqua
          ) VALUES (?, NULL, ?, 'Cho duyet')`,
          [proposalId, cap]
        );
      }
    }

    await connection.commit();
    return { ...result, trangThai: trangThaiDau };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
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
      otpHash,
      tileThuHoi,
      mucThuHoi
    } = proposalData;

    // Bước 1: Tạo proposal
    const [proposalResult] = await connection.execute(
      `INSERT INTO dexuatchuongtrinh (
        quythanhphan_id, khoantaitro_id, nhataitro_id,
        tenchuongtrinh, mota, soluongsuat, sotienmoisuat, sotientaitro,
        loaihotro, tilethuhoi, ngaybatdau, ngayketthuc, mucthuhoi, trangthai
      ) VALUES (?, NULL, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Cho duyet')`,
      [
        quyThanhPhanId,
        tenChuongTrinh,
        moTa || null,
        soLuongSuat,
        soTienMoiSuat,
        parseFloat(soLuongSuat) * parseFloat(soTienMoiSuat),
        loaiHoTro || 'Tai tro khong hoan lai',
        tileThuHoi || null,
        ngayBatDau || null,
        ngayKetThuc || null,
        mucThuHoi || null
      ]
    );

    const proposalId = proposalResult.insertId;

    // Bước 1b: Tạo 3 dòng phê duyệt (Cap 1 = Cán bộ, Cap 2 = Kế toán, Cap 3 = Admin)
    for (const cap of [1, 2, 3]) {
      await connection.execute(
        `INSERT INTO pheduyet (
          dexuatchuongtrinh_id, nguoiduyet_id, capduyet, ketqua
        ) VALUES (?, NULL, ?, 'Cho duyet')`,
        [proposalId, cap]
      );
    }

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
      dx.tilethuhoi,
      dx.kyhantrano,
      dx.mucthuhoi,
      dx.ngaybatdau,
      dx.ngayketthuc,
      dx.trangthai,
      dx.lydotuchoi,
      dx.quyketqua_id,
      dx.ngaytao,
      pd1.nguoiduyet_id AS nguoiduyet_id,
      pd1.ngayduyet AS ngayduyet,
      pd1.ketqua AS pheduyet_cap1_ketqua,
      qtp.tenquy AS ten_quy_thanh_phan,
      qtp.sodu AS so_du_quy_thanh_phan,
      qtp.loaiquy_id,
      ntt.tennhataitro,
      ntt.loainhataitro,
      nd_ntt.email AS nhataitro_email,
      nd_ntt.sodienthoai AS nhataitro_sodienthoai,
      nd_ntt.diachi AS nhataitro_diachi,
      nd_duyet.hoten AS nguoi_duyet_ten,
      qkq.tenquy AS ten_quy_ket_qua,
      kt.sotien AS so_tien_tai_tro,
      kt.hinhthuc AS hinh_thuc_tai_tro,
      kt.magiaodich AS ma_giao_dich,
      kt.ngaytaitro AS ngay_tai_tro
     FROM dexuatchuongtrinh dx
     INNER JOIN quy qtp ON dx.quythanhphan_id = qtp.quy_id
     LEFT JOIN pheduyet pd1 ON pd1.dexuatchuongtrinh_id = dx.dexuatchuongtrinh_id AND pd1.capduyet = 1
     LEFT JOIN nhataitro ntt ON dx.nhataitro_id = ntt.nhataitro_id
     LEFT JOIN nguoidung nd_ntt ON ntt.nguoidung_id = nd_ntt.nguoidung_id
     LEFT JOIN nguoidung nd_duyet ON pd1.nguoiduyet_id = nd_duyet.nguoidung_id
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
    // Hỗ trợ nhiều trạng thái phân cách bằng dấu phẩy (VD: "Da nhan tien,Duyet hop dong vay")
    const statuses = trang_thai.split(',').map(s => s.trim()).filter(Boolean);
    if (statuses.length === 1) {
      conds.push(`dx.trangthai = ?`);
      params.push(statuses[0]);
    } else if (statuses.length > 1) {
      const placeholders = statuses.map(() => '?').join(', ');
      conds.push(`dx.trangthai IN (${placeholders})`);
      params.push(...statuses);
    }
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
      dx.tilethuhoi,
      dx.mucthuhoi,
      dx.kyhantrano,
      dx.ngaybatdau,
      dx.ngayketthuc,
      dx.trangthai,
      dx.lydotuchoi,
      dx.quyketqua_id,
      dx.ngaytao,
      pd1.nguoiduyet_id AS nguoiduyet_id,
      pd1.ngayduyet AS ngayduyet,
      qtp.tenquy AS ten_quy_thanh_phan,
      ntt.tennhataitro,
      ntt.loainhataitro,
      nd_duyet.hoten AS nguoi_duyet_ten,
      qkq.tenquy AS ten_quy_ket_qua,
      kt.sotien AS so_tien_tai_tro
     FROM dexuatchuongtrinh dx
     INNER JOIN quy qtp ON dx.quythanhphan_id = qtp.quy_id
     LEFT JOIN pheduyet pd1 ON pd1.dexuatchuongtrinh_id = dx.dexuatchuongtrinh_id AND pd1.capduyet = 1
     LEFT JOIN nhataitro ntt ON dx.nhataitro_id = ntt.nhataitro_id
     LEFT JOIN nguoidung nd_duyet ON pd1.nguoiduyet_id = nd_duyet.nguoidung_id
     LEFT JOIN quy qkq ON dx.quyketqua_id = qkq.quy_id
     LEFT JOIN khoantaitro kt ON dx.khoantaitro_id = kt.khoantaitro_id
     ${where}
      ORDER BY 
        CASE dx.trangthai
          WHEN 'Cho duyet' THEN 1
          WHEN 'Can bo da duyet' THEN 2
          WHEN 'Da nhan tien' THEN 3
          WHEN 'Duyet hop dong vay' THEN 4
          WHEN 'Da tao hoat dong' THEN 5
          WHEN 'Tu choi' THEN 6
          ELSE 7
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

    // 3. Ghi nhận phê duyệt cấp 1 (Cán bộ) vào bảng pheduyet
    await connection.execute(
      `UPDATE pheduyet 
       SET nguoiduyet_id = ?,
           ketqua = 'Da duyet',
           ghichu = ?,
           lydo = NULL,
           ngayduyet = NOW()
       WHERE dexuatchuongtrinh_id = ? AND capduyet = 1`,
      [canBoDuyetId, ghiChu, id]
    );

    // 4. Cập nhật trạng thái: Cán bộ đã duyệt
    await connection.execute(
      `UPDATE dexuatchuongtrinh 
       SET trangthai = 'Can bo da duyet',
           quythanhphan_id = ?
       WHERE dexuatchuongtrinh_id = ?`,
      [quyThanhPhanId, id]
    );

    // 5. Nếu đề xuất có khoản tài trợ đi kèm, cập nhật trạng thái khoản tài trợ
    // Cán bộ đã duyệt nội dung → khoản tài trợ cũng được duyệt nội dung
    if (dx.khoantaitro_id) {
      await connection.execute(
        `UPDATE khoantaitro
         SET trangthai = 'Da duyet',
             ghichu = CONCAT(COALESCE(ghichu, ''), ' [Tự động duyệt khi cán bộ duyệt đề xuất chương trình]'),
             ngaycapnhat = NOW()
         WHERE khoantaitro_id = ?
         AND trangthai = 'Cho duyet'`,
        [dx.khoantaitro_id]
      );
    }

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
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Ghi nhận từ chối cấp 1 (Cán bộ) vào bảng pheduyet
    await connection.execute(
      `UPDATE pheduyet 
       SET nguoiduyet_id = ?,
           ketqua = 'Tu choi',
           lydo = ?,
           ghichu = ?,
           ngayduyet = NOW()
       WHERE dexuatchuongtrinh_id = ? AND capduyet = 1`,
      [canBoDuyetId, lyDoTuChoi, ghiChu, id]
    );

    // 2. Cập nhật trạng thái đề xuất
    const [result] = await connection.execute(
      `UPDATE dexuatchuongtrinh 
       SET trangthai = 'Tu choi',
           lydotuchoi = ?
       WHERE dexuatchuongtrinh_id = ? AND trangthai = 'Cho duyet'`,
      [lyDoTuChoi, id]
    );

    await connection.commit();
    return result.affectedRows > 0;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
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

    // 5. Ghi nhận phê duyệt cấp 2 (Kế toán) vào bảng pheduyet
    await connection.execute(
      `UPDATE pheduyet 
       SET nguoiduyet_id = ?,
           ketqua = 'Da duyet',
           ghichu = ?,
           lydo = NULL,
           ngayduyet = NOW()
       WHERE dexuatchuongtrinh_id = ? AND capduyet = 2`,
      [keToanId, `Đã xác nhận nhận tiền: ${tongTien.toLocaleString('vi-VN')} đ`, id]
    );

    // 6. Cập nhật trạng thái proposal
    await connection.execute(
      `UPDATE dexuatchuongtrinh 
       SET trangthai = 'Da nhan tien',
           so_tien_thuc_te = ?
       WHERE dexuatchuongtrinh_id = ?`,
      [tongTien, id]
    );

    // 7. Nếu đề xuất có khoản tài trợ đi kèm, cập nhật trạng thái khoản tài trợ sang "Đã nhận"
    if (dx.khoantaitro_id) {
      await connection.execute(
        `UPDATE khoantaitro
         SET trangthai = 'Da nhan',
             nguoixacnhan_id = ?,
             ngayxacnhan = NOW(),
             ghichu = CONCAT(COALESCE(ghichu, ''), ' [Tự động xác nhận khi kế toán xác nhận tiền đề xuất chương trình]'),
             ngaycapnhat = NOW()
         WHERE khoantaitro_id = ?
         AND trangthai = 'Da duyet'`,
        [keToanId, dx.khoantaitro_id]
      );
    }

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
// HÀM: approveLoanContract (BƯỚC 3b — CHỈ CHO "CHO VAY")
// MỤC ĐÍCH: Admin duyệt hợp đồng vay (xác nhận lãi suất + ngày ký)
//           Sau bước Kế toán xác nhận tiền, trước khi tạo hoạt động
// ─────────────────────────────────────────────────────────────────────────────
const approveLoanContract = async (id, adminId, ghiChu = null) => {
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
      throw new Error('PROPOSAL_MUST_BE_MONEY_CONFIRMED');
    }
    if (dx.loaihotro !== 'Cho vay') {
      throw new Error('ONLY_LOAN_REQUIRES_CONTRACT_APPROVAL');
    }

    // 2. Validate lãi suất qua LaiSuatHelper
    const laisuatThamChieu = LaiSuatHelper.getLaiSuatNganHangThamChieu();
    if (laisuatThamChieu === null) {
      throw new Error('INTEREST_RATE_NOT_CONFIGURED');
    }
    const laisuatChoVay = Math.round(parseFloat(laisuatThamChieu) * 0.7 * 100) / 100;
    const validation = LaiSuatHelper.kiemTraRangBuocLaiSuat(laisuatChoVay);
    if (!validation.hopLe) {
      throw new Error('INTEREST_RATE_EXCEEDS_LIMIT');
    }

    // 3. Lưu thông tin hợp đồng vào pheduyet cap 3 (ghichu)
    const hopDongInfo = JSON.stringify({
      laisuatphantram: laisuatChoVay,
      ngaykyhopdong: new Date().toISOString().split('T')[0],
      ghichuAdmin: ghiChu || null
    });

    await connection.execute(
      `UPDATE pheduyet
       SET nguoiduyet_id = ?,
           ketqua = 'Da duyet',
           ghichu = ?,
           lydo = NULL,
           ngayduyet = NOW()
       WHERE dexuatchuongtrinh_id = ? AND capduyet = 3`,
      [adminId, hopDongInfo, id]
    );

    // 4. Cập nhật trạng thái đề xuất
    await connection.execute(
      `UPDATE dexuatchuongtrinh
       SET trangthai = 'Duyet hop dong vay'
       WHERE dexuatchuongtrinh_id = ?`,
      [id]
    );

    await connection.commit();

    return {
      success: true,
      proposalId: id,
      trangthai: 'Duyet hop dong vay',
      laisuatphantram: laisuatChoVay,
      laisuatThamChieu: parseFloat(laisuatThamChieu),
      mucToiDa: validation.mucToiDa
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: createActivityByAdmin (BƯỚC 3c)
// MỤC ĐÍCH: Admin duyệt và tạo hoạt động/chương trình (Quỹ Cấp 3)
//           Trích tiền từ Quỹ Thành Phần → Hoạt động mới
//           Với "Cho vay": chỉ chạy sau khi đã duyệt hợp đồng (trangthai='Duyet hop dong vay')
//           Với loại khác: chạy sau khi Kế toán xác nhận tiền (trangthai='Da nhan tien')
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
    // Cho vay: phải qua bước duyệt hợp đồng trước
    // Loại khác: chạy ngay sau khi Kế toán xác nhận tiền
    const isLoan = dx.loaihotro === 'Cho vay';
    if (isLoan) {
      if (dx.trangthai !== 'Duyet hop dong vay') {
        throw new Error('PROPOSAL_LOAN_NOT_APPROVED_CONTRACT');
      }
    } else {
      if (dx.trangthai !== 'Da nhan tien') {
        throw new Error('PROPOSAL_MONEY_NOT_CONFIRMED');
      }
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
      tilethuhoi,
      kyhantrano,
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
        dieukienhotro,
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
        tilethuhoi,
        capdo
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, 
        ?, ?, 'Dang hoat dong', 'Tap trung - Muc chi', ?, ?, ?, 3
      )`,
      [
        tenchuongtrinh,
        quyThanhPhan.loaiquy_id,
        mota || null,
        mota || null,
        soTienPhanBo,
        sotienmoisuat,
        soluongsuat,
        ngaybatdau || null,
        ngayketthuc || null,
        soTienPhanBo,
        adminId,
        quythanhphan_id,
        loaihotro,
        tilethuhoi || null
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

    // 5b. Nếu "Cho vay": tạo hopdongvayvon + lichtrano (1 kỳ)
    let hopDongVayVonId = null;
    if (isLoan && kyhantrano) {
      // Đọc thông tin hợp đồng từ pheduyet cap 3 (đã lưu ở bước duyệt hợp đồng)
      let laisuatChoVay = 0;
      let ngayKyHopDong = new Date();
      try {
        const [pheduyetRows] = await connection.query(
          `SELECT ghichu FROM pheduyet WHERE dexuatchuongtrinh_id = ? AND capduyet = 3`,
          [id]
        );
        if (pheduyetRows[0]?.ghichu) {
          const hopDongInfo = JSON.parse(pheduyetRows[0].ghichu);
          laisuatChoVay = parseFloat(hopDongInfo.laisuatphantram) || 0;
          if (hopDongInfo.ngaykyhopdong) {
            ngayKyHopDong = new Date(hopDongInfo.ngaykyhopdong);
          }
        }
      } catch { /* fallback to default */ }

      // Nếu không đọc được từ pheduyet, tính fallback từ settings
      if (laisuatChoVay === 0) {
        const laisuatThamChieu = LaiSuatHelper.getLaiSuatNganHangThamChieu() || 0;
        laisuatChoVay = Math.round(laisuatThamChieu * 0.7 * 100) / 100;
      }

      const kyHanThang = parseInt(kyhantrano);

      // Tính ngày đáo hạn
      const ngayDaoHan = new Date(ngayKyHopDong);
      ngayDaoHan.setMonth(ngayDaoHan.getMonth() + kyHanThang);

      // Tạo hợp đồng vay vốn
      const [hdResult] = await connection.execute(
        `INSERT INTO hopdongvayvon (
          dexuatchuongtrinh_id, sotienvon, laisuatphantram, ngaykyhopdong, kyhandothang, ngaydaohan,
          trangthai, nguoiduyet_id, ghichu
        ) VALUES (?, ?, ?, ?, ?, ?, 'Dang thuc hien', ?, ?)`,
        [
          id,
          soTienPhanBo,
          laisuatChoVay,
          ngayKyHopDong,
          kyHanThang,
          ngayDaoHan,
          adminId,
          `Tu dong tao tu de xuat chuong trinh "${tenchuongtrinh}"`,
        ]
      );
      hopDongVayVonId = hdResult.insertId;

      // Tạo lịch trả nợ 1 kỳ: toàn bộ gốc + lãi, đến hạn = kỳ hạn tháng
      // (Quỹ trả cho Nhà tài trợ —不同于 sinh viên trả cho quỹ)
      const tongLai = Math.round(soTienPhanBo * (laisuatChoVay / 100) * (kyHanThang / 12) * 100) / 100;

      await connection.execute(
        `INSERT INTO lichtrano (
          hopdongvayvon_id, kythu, ngaydenhan, sotiengocphaitra, sotienlaiphaitra, trangthai
        ) VALUES (?, 1, ?, ?, ?, 'Chua den han')`,
        [hopDongVayVonId, ngayDaoHan, soTienPhanBo, tongLai]
      );
    }

    // 6. Ghi nhận phê duyệt cấp 3 (Admin) vào bảng pheduyet
    await connection.execute(
      `UPDATE pheduyet 
       SET nguoiduyet_id = ?,
           ketqua = 'Da duyet',
           ghichu = ?,
           lydo = NULL,
           ngayduyet = NOW()
       WHERE dexuatchuongtrinh_id = ? AND capduyet = 3`,
      [adminId, ghiChu, id]
    );

    // 7. Cập nhật trạng thái đề xuất
    await connection.execute(
      `UPDATE dexuatchuongtrinh 
       SET trangthai = 'Da tao hoat dong',
           quyketqua_id = ?
       WHERE dexuatchuongtrinh_id = ?`,
      [quyMoiId, id]
    );

    await connection.commit();

    return {
      success: true,
      proposalId: id,
      activityId: quyMoiId,
      phanBoId: insertPhanBoResult.insertId,
      soTienPhanBo,
      hopDongVayVonId,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getProposalStats
// MỤC ĐÍCH: Thống kê đề xuất chương trình (cho Dashboard)
// ─────────────────────────────────────────────────────────────────────────────
const getProposalStats = async () => {
  const [[{ choDuyet }]] = await pool.query(
    `SELECT COUNT(*) AS choDuyet FROM dexuatchuongtrinh WHERE trangthai = 'Cho duyet'`
  );
  const [[{ canBoPheDuyet }]] = await pool.query(
    `SELECT COUNT(*) AS canBoPheDuyet FROM dexuatchuongtrinh WHERE trangthai = 'Can bo da duyet'`
  );
  // Admin pending: đếm cả "Da nhan tien" (loại khác) + "Duyet hop dong vay" (cho vay)
  const [[{ daNhanTien }]] = await pool.query(
    `SELECT COUNT(*) AS daNhanTien FROM dexuatchuongtrinh WHERE trangthai IN ('Da nhan tien', 'Duyet hop dong vay')`
  );
  const [[{ daTaoHoatDong }]] = await pool.query(
    `SELECT COUNT(*) AS daTaoHoatDong FROM dexuatchuongtrinh WHERE trangthai = 'Da tao hoat dong'`
  );
  const [[{ tuChoi }]] = await pool.query(
    `SELECT COUNT(*) AS tuChoi FROM dexuatchuongtrinh WHERE trangthai = 'Tu choi'`
  );
  return {
    choDuyet: Number(choDuyet) || 0,
    canBoPheDuyet: Number(canBoPheDuyet) || 0,
    daNhanTien: Number(daNhanTien) || 0,
    daTaoHoatDong: Number(daTaoHoatDong) || 0,
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
  approveLoanContract,
  createActivityByAdmin
};
