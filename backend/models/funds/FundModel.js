import pool from "../../config/db.js";

// Kiểm tra tên quỹ đã tồn tại chưa
const checkFundNameExists = async (tenQuy) => {
  const [rows] = await pool.query(
    `SELECT quy_id FROM quy WHERE tenquy = ? LIMIT 1`,
    [tenQuy]
  );
  return rows.length > 0;
};

// Tạo quỹ mới (Chạy trong Transaction để trích lập số dư khởi tạo từ quỹ mẹ)
const createFund = async (fundData) => {
  const {
    tenQuy,
    loaiQuy,
    moTa,
    hinhAnh,
    soTienMucTieu,
    soTienHoTroToiDa,
    soLuongChiTieu,
    dieuKienTomTat,
    hanNopDon,
    soDu,
    nguoiTao,
    trangThai,
    ngayBatDau,
    loaiDieuHanh,
    quyChaId,
    soDotGiaiNgan,
    dotGiaiNgan,
    loaiHoTro,
    tileThuHoi
  } = fundData;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const parseSoDu = soDu ? parseFloat(soDu) : 0.00;

    // 1. Nếu là quỹ con (cấp 2 hoặc 3), validate và trừ số dư từ quỹ cha
    if (loaiDieuHanh !== 'Tap trung - Be chung') {
      if (!quyChaId) {
        throw new Error('CHILD_FUND_PARENT_REQUIRED');
      }

      const [parentRows] = await connection.query(
        `SELECT sodu, tenquy, loaidieuhanh, capdo FROM quy WHERE quy_id = ? FOR UPDATE`,
        [quyChaId]
      );
      const parent = parentRows[0];
      if (!parent) {
        throw new Error('PARENT_FUND_NOT_FOUND');
      }
      
      // Validate cấp độ: Quỹ con phải có capdo = capdo_cha + 1
      const expectedCapdo = parent.capdo + 1;
      let actualCapdo;
      if (loaiDieuHanh === 'Tap trung - Thanh phan') {
        actualCapdo = 2;
      } else if (loaiDieuHanh === 'Tap trung - Muc chi') {
        actualCapdo = 3;
      } else {
        actualCapdo = 1; // Mặc định
      }
      
      if (actualCapdo !== expectedCapdo) {
        throw new Error(`INVALID_FUND_LEVEL: Quỹ cha cấp ${parent.capdo} chỉ có thể có quỹ con cấp ${expectedCapdo}`);
      }
      
      if (parseSoDu > 0 && parseFloat(parent.sodu) < parseSoDu) {
        throw new Error('INSUFFICIENT_PARENT_FUND_BALANCE');
      }

      if (parseSoDu > 0) {
        await connection.execute(
          `UPDATE quy SET sodu = sodu - ?, ngaycapnhat = CURRENT_TIMESTAMP WHERE quy_id = ?`,
          [parseSoDu, quyChaId]
        );
      }
    }

    // 2. Thêm mới Quỹ con
    const [result] = await connection.execute(
      `INSERT INTO quy (
        tenquy,
        loaiquy_id,
        mota,
        hinhanh,
        sotienmuctieu,
        sotienhotrotoida,
        soluonghotrotoida,
        dieukienhotro,
        ngaybatdau,
        ngayketthuc,
        sodu,
        nguoitao_id,
        trangthai,
        loaidieuhanh,
        quy_cha_id,
        loaihotro,
        tilethuhoi
      ) VALUES (
        ?,
        (SELECT loaiquy_id FROM loaiquy WHERE maloai = ? LIMIT 1),
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )`,
      [
        tenQuy,
        loaiQuy,
        moTa || null,
        hinhAnh || null,
        soTienMucTieu || null,
        soTienHoTroToiDa || null,
        soLuongChiTieu || null,
        dieuKienTomTat || null,
        ngayBatDau || null,
        hanNopDon || null,
        parseSoDu,
        nguoiTao || null,
        trangThai || 'Dang hoat dong',
        loaiDieuHanh || 'Tap trung - Be chung',
        quyChaId || null,
        loaiHoTro || 'Tai tro khong hoan lai',
        tileThuHoi || null
      ]
    );

    if (loaiDieuHanh === 'Tap trung - Muc chi' && parseSoDu > 0) {
      if (!nguoiTao) {
        throw new Error('ALLOCATION_ACTOR_REQUIRED');
      }

      await connection.execute(
        `INSERT INTO phanbongansach (
          quy_nguon_id,
          quy_dich_id,
          sotien,
          soquyetdinh,
          filequyetdinh,
          trangthai,
          nguoi_de_xuat_id,
          nguoi_duyet_id,
          ngayduyet,
          ghichu
        ) VALUES (?, ?, ?, ?, NULL, 'Da duyet', ?, ?, CURRENT_TIMESTAMP, ?)`,
        [
          quyChaId,
          result.insertId,
          parseSoDu,
          `AUTO-TAO-QUY-${result.insertId}`,
          nguoiTao,
          nguoiTao,
          `Tự động ghi nhận trích lập ngân sách khi tạo quỹ con "${tenQuy}".`
        ]
      );
    }

    // 3. Tự sinh đợt giải ngân nếu có yêu cầu
    const soDot = parseInt(soDotGiaiNgan) || 0;
    if (soDot > 0 && dotGiaiNgan && dotGiaiNgan.length > 0) {
      // Dùng chi tiết đợt giải ngân từ form
      for (const dot of dotGiaiNgan) {
        await connection.execute(
          `INSERT INTO dotgiaingan (quy_id, thutu, tendot, mota, ngaybatdau, ngayketthuc, sotiendukien, ngaydukien, trangthai)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'chuatoi')`,
          [
            result.insertId,
            dot.thutu,
            dot.tenDot || `Đợt ${dot.thutu}`,
            dot.mota || null,
            dot.ngaybatdau ? String(dot.ngaybatdau).slice(0, 10) : null,
            dot.ngayketthuc ? String(dot.ngayketthuc).slice(0, 10) : null,
            parseFloat(dot.sotiendukien) || 0,
            dot.ngaydukien ? String(dot.ngaydukien).slice(0, 10) : null
          ]
        );
      }
    } else if (soDot > 0 && ngayBatDau && hanNopDon) {
      // Fallback: Tự tính nếu không có chi tiết từ form
      const startDate = new Date(ngayBatDau);
      const endDate = new Date(hanNopDon);
      const totalTime = endDate - startDate;
      const targetAmount = parseFloat(soTienMucTieu) || 0;
      const amountPerRound = targetAmount / soDot;

      for (let i = 1; i <= soDot; i++) {
        const roundDate = new Date(startDate.getTime() + totalTime * (i / (soDot + 1)));
        await connection.execute(
          `INSERT INTO dotgiaingan (quy_id, thutu, tendot, mota, ngaybatdau, ngayketthuc, sotiendukien, ngaydukien, trangthai)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'chuatoi')`,
          [
            result.insertId,
            i,
            `Đợt ${i}`,
            `Đợt giải ngân thứ ${i} của quỹ "${tenQuy}"`,
            null,
            null,
            amountPerRound,
            roundDate.toISOString().split('T')[0]
          ]
        );
      }
    }

    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Lấy thông tin quỹ theo ID
const getFundById = async (quyId) => {
  const [rows] = await pool.query(
    `SELECT 
      q.quy_id,
      q.tenquy AS ten_quy,
      lq.loaiquy_id,
      lq.maloai AS loai_quy,
      lq.tenloai AS ten_loai_quy,
      q.mota AS mo_ta,
      q.hinhanh AS hinh_anh,
      q.sotienmuctieu AS so_tien_muc_tieu,
      q.sotienmuctieu AS so_tien_toi_thieu,
      q.sotienhotrotoida AS so_tien_ho_tro_toi_da,
      q.sotienhotrotoida AS so_tien_toi_da,
      q.soluonghotrotoida AS so_luong_chi_tieu,
      q.dieukienhotro AS dieu_kien_tom_tat,
      q.ngaybatdau,
      q.ngayketthuc AS han_nop_don,
      q.sodu AS so_du,
      q.nguoitao_id,
      q.ngaytao AS ngay_tao,
      q.ngaycapnhat AS ngay_cap_nhat,
      q.trangthai AS trang_thai,
      q.loaidieuhanh AS loai_dieu_hanh,
      q.capdo,
      q.quy_cha_id,
      q.loaihotro,
      q.tilethuhoi,
      qp.tenquy AS ten_quy_cha
     FROM quy q
     LEFT JOIN loaiquy lq ON q.loaiquy_id = lq.loaiquy_id
     LEFT JOIN quy qp ON q.quy_cha_id = qp.quy_id
     WHERE q.quy_id = ?
     LIMIT 1`,
    [quyId]
  );
  return rows[0] || null;
};

// Kiểm tra tên quỹ đã tồn tại cho quỹ khác chưa
const checkFundNameExistsForOther = async (tenQuy, quyId) => {
  const [rows] = await pool.query(
    `SELECT quy_id FROM quy WHERE tenquy = ? AND quy_id != ? LIMIT 1`,
    [tenQuy, quyId]
  );
  return rows.length > 0;
};

// Cập nhật thông tin quỹ
const updateFund = async (quyId, fundData) => {
  const {
    tenQuy,
    loaiQuy,
    moTa,
    hinhAnh,
    soTienMucTieu,
    soTienHoTroToiDa,
    soLuongChiTieu,
    dieuKienTomTat,
    hanNopDon,
    soDu,
    trangThai,
    loaiDieuHanh,
    quyChaId,
    loaiHoTro,
    tileThuHoi
  } = fundData;

  const [result] = await pool.execute(
    `UPDATE quy 
     SET tenquy = ?, 
         loaiquy_id = (SELECT loaiquy_id FROM loaiquy WHERE maloai = ? LIMIT 1), 
         mota = ?, 
         hinhanh = ?, 
         sotienmuctieu = ?, 
         sotienhotrotoida = ?, 
         soluonghotrotoida = ?, 
         dieukienhotro = ?, 
         ngayketthuc = ?, 
         sodu = ?, 
         trangthai = ?,
         loaidieuhanh = ?,
         quy_cha_id = ?,
         loaihotro = ?,
         tilethuhoi = ?,
         ngaycapnhat = CURRENT_TIMESTAMP
     WHERE quy_id = ?`,
    [
      tenQuy,
      loaiQuy,
      moTa || null,
      hinhAnh || null,
      soTienMucTieu || null,
      soTienHoTroToiDa || null,
      soLuongChiTieu || null,
      dieuKienTomTat || null,
      hanNopDon || null,
      soDu || 0.00,
      trangThai,
      loaiDieuHanh || 'Tap trung - Be chung',
      quyChaId || null,
      loaiHoTro || 'Tai tro khong hoan lai',
      tileThuHoi || null,
      quyId
    ]
  );
  return result;
};

// Lấy danh sách tất cả quỹ
const getAllFunds = async () => {
  const [rows] = await pool.query(
    `SELECT 
      q.quy_id,
      q.tenquy AS ten_quy,
      lq.loaiquy_id,
      lq.maloai AS loai_quy,
      lq.tenloai AS ten_loai_quy,
      q.mota AS mo_ta,
      q.hinhanh AS hinh_anh,
      q.sotienmuctieu AS so_tien_muc_tieu,
      q.sotienmuctieu AS so_tien_toi_thieu,
      q.sotienhotrotoida AS so_tien_ho_tro_toi_da,
      q.sotienhotrotoida AS so_tien_toi_da,
      q.soluonghotrotoida AS so_luong_chi_tieu,
      q.dieukienhotro AS dieu_kien_tom_tat,
      q.ngaybatdau,
      q.ngayketthuc AS han_nop_don,
      q.sodu AS so_du,
      q.nguoitao_id,
      q.ngaytao AS ngay_tao,
      q.ngaycapnhat AS ngay_cap_nhat,
      q.trangthai AS trang_thai,
      q.loaidieuhanh AS loai_dieu_hanh,
      q.capdo,
      q.quy_cha_id,
      q.loaihotro,
      q.tilethuhoi,
      qp.tenquy AS ten_quy_cha,
      COUNT(CASE WHEN yc.trangthai IN ('Da duyet cap 3', 'Cho giai ngan', 'Da giai ngan') THEN 1 END) as so_don_da_nop,
      CASE 
        WHEN q.soluonghotrotoida IS NOT NULL AND q.soluonghotrotoida > 0 
        THEN ROUND((COUNT(CASE WHEN yc.trangthai IN ('Da duyet cap 3', 'Cho giai ngan', 'Da giai ngan') THEN 1 END) / q.soluonghotrotoida) * 100, 0)
        ELSE 0
      END as phan_tram_da_nhan
     FROM quy q
     LEFT JOIN loaiquy lq ON q.loaiquy_id = lq.loaiquy_id
     LEFT JOIN quy qp ON q.quy_cha_id = qp.quy_id
     LEFT JOIN yeucauhotro yc ON q.quy_id = yc.quy_id
     GROUP BY q.quy_id, lq.loaiquy_id, lq.maloai, lq.tenloai, q.ngaytao, q.loaidieuhanh, q.capdo, q.quy_cha_id, q.loaihotro, q.tilethuhoi, qp.tenquy
     ORDER BY q.ngaytao DESC`
  );
  return rows;
};

// Lấy danh sách quỹ công khai (đang hoạt động)
const getPublicFunds = async () => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        q.quy_id,
        q.tenquy AS ten_quy,
        lq.loaiquy_id,
        lq.maloai AS loai_quy,
        lq.tenloai AS ten_loai_quy,
        q.mota AS mo_ta,
        q.hinhanh AS hinh_anh,
        q.sotienmuctieu AS so_tien_muc_tieu,
        q.sotienmuctieu AS so_tien_toi_thieu,
        q.sotienhotrotoida AS so_tien_ho_tro_toi_da,
        q.sotienhotrotoida AS so_tien_toi_da,
        q.soluonghotrotoida AS so_luong_chi_tieu,
        q.dieukienhotro AS dieu_kien_tom_tat,
        q.ngaybatdau AS ngay_bat_dau,
        q.ngayketthuc AS ngay_ket_thuc,
        q.ngayketthuc AS han_nop_don,
        q.sodu AS so_du,
        q.loaidieuhanh AS loai_dieu_hanh,
        q.capdo,
        q.quy_cha_id,
        q.loaihotro,
        q.tilethuhoi,
        qp.tenquy AS ten_quy_cha,
        -- Tính số dư thực tế (trừ đi các khoản đang chờ giải ngân)
        (q.sodu - COALESCE(SUM(CASE WHEN yc.trangthai = 'Cho giai ngan' THEN yc.sotiendenghi ELSE 0 END), 0)) as so_du_thuc_te,
        q.nguoitao_id,
        q.ngaytao AS ngay_tao,
        q.ngaycapnhat AS ngay_cap_nhat,
        q.trangthai AS trang_thai,
        -- Đếm số đơn đã được duyệt (bao gồm cả đang chờ giải ngân và đã giải ngân)
        COUNT(CASE WHEN yc.trangthai IN ('Da duyet cap 3', 'Cho giai ngan', 'Da giai ngan') THEN 1 END) as so_don_da_nop,
        -- Tính phần trăm dựa trên số đơn đã được duyệt
        CASE 
          WHEN q.soluonghotrotoida IS NOT NULL AND q.soluonghotrotoida > 0 
          THEN ROUND((COUNT(CASE WHEN yc.trangthai IN ('Da duyet cap 3', 'Cho giai ngan', 'Da giai ngan') THEN 1 END) / q.soluonghotrotoida) * 100, 0)
          ELSE 0
        END as phan_tram_da_nhan,
        -- Đếm số quỹ con đang hoạt động (cho quỹ mẹ/quỹ thành phần)
        -- Đếm tất cả quỹ con trực tiếp (bất kể loại điều hành)
        (SELECT COUNT(*) 
         FROM quy qc 
         WHERE qc.quy_cha_id = q.quy_id 
         AND qc.trangthai = 'Dang hoat dong') as so_quy_con_hoat_dong
       FROM quy q
       LEFT JOIN loaiquy lq ON q.loaiquy_id = lq.loaiquy_id
       LEFT JOIN quy qp ON q.quy_cha_id = qp.quy_id
       LEFT JOIN yeucauhotro yc ON q.quy_id = yc.quy_id
       WHERE q.trangthai IN ('Dang hoat dong', 'Tam dung')
       GROUP BY q.quy_id, lq.loaiquy_id, lq.maloai, lq.tenloai, q.ngaytao, q.loaidieuhanh, q.capdo, q.quy_cha_id, q.loaihotro, q.tilethuhoi, qp.tenquy
       ORDER BY q.ngaytao DESC`
    );
    return rows;
  } catch (error) {
    console.error('Error in getPublicFunds:', error);
    throw error;
  }
};

/**
 * Get public funds filtered by level (capdo) and status
 * For donation form: fetch funds by level with hierarchical organization
 * 
 * @param {number|null} capDo - Fund level: 1 (Quỹ Mẹ), 2 (Quỹ Thành phần), 3 (Chương trình)
 * @param {string} trangThai - Status filter (default: 'Dang hoat dong')
 * @returns {Object} { level1, level2, level3 } - Organized by level
 */
const getPublicFundsByLevel = async (capDo = null, trangThai = 'Dang hoat dong') => {
  try {
    let whereClause = `q.trangthai = ?`;
    const params = [trangThai];
    
    if (capDo !== null) {
      whereClause += ` AND q.capdo = ?`;
      params.push(capDo);
    }
    
    const [rows] = await pool.query(
      `SELECT 
        q.quy_id,
        q.tenquy,
        q.capdo,
        q.quy_cha_id,
        q.mota,
        q.sodu,
        q.trangthai,
        q.loaihotro,
        q.tilethuhoi,
        lq.loaiquy_id,
        lq.maloai,
        lq.tenloai,
        qp.tenquy AS ten_quy_cha
       FROM quy q
       LEFT JOIN loaiquy lq ON q.loaiquy_id = lq.loaiquy_id
       LEFT JOIN quy qp ON q.quy_cha_id = qp.quy_id
       WHERE ${whereClause}
       ORDER BY q.capdo, q.ngaytao DESC`,
      params
    );
    
    // Organize by level
    const level1 = rows.filter(f => f.capdo === 1);
    const level2 = rows.filter(f => f.capdo === 2);
    const level3 = rows.filter(f => f.capdo === 3);
    
    // Organize level 3 under level 2 hierarchically
    const level2WithPrograms = level2.map(fund => ({
      ...fund,
      programs: level3.filter(p => p.quy_cha_id === fund.quy_id)
    }));
    
    return {
      level1,
      level2: level2WithPrograms,
      level3,
      all: rows
    };
  } catch (error) {
    console.error('Error in getPublicFundsByLevel:', error);
    throw error;
  }
};

// Cập nhật trạng thái quỹ
const updateFundStatus = async (quyId, trangThai) => {
  const [result] = await pool.execute(
    `UPDATE quy 
     SET trangthai = ?, 
         ngaycapnhat = CURRENT_TIMESTAMP 
     WHERE quy_id = ?`,
    [trangThai, quyId]
  );
  return result;
};

// Lấy thống kê của quỹ (số khoản tài trợ + số đơn đã hỗ trợ)
const getFundStats = async (quyId) => {
  const [rows] = await pool.query(
    `SELECT 
      -- Số khoản tài trợ đã được xác nhận nhận tiền
      (SELECT COUNT(*) FROM khoantaitro WHERE quy_id = ? AND trangthai = 'Da nhan') as soKhoanTaiTro,
      -- Số đơn đã hỗ trợ công khai
      (SELECT COUNT(*) FROM yeucauhotro 
       WHERE quy_id = ? 
       AND trangthai = 'Da giai ngan') as soDonDaHoTro
    `,
    [quyId, quyId]
  );
  return rows[0] || { soKhoanTaiTro: 0, soDonDaHoTro: 0 };
};

// Lấy danh sách khoản tài trợ đã nhận của một quỹ để hiển thị công khai
const getReceivedDonationsByFundId = async (quyId) => {
  const [rows] = await pool.query(
    `SELECT
      kt.khoantaitro_id,
      kt.nhataitro_id,
      kt.quy_id,
      kt.sotien,
      kt.hinhthuc,
      kt.ngaytaitro,
      kt.trangthai,
      kt.ghichu,
      ntt.tennhataitro,
      ntt.loainhataitro,
      nd.avatar AS logo
     FROM khoantaitro kt
     INNER JOIN nhataitro ntt ON kt.nhataitro_id = ntt.nhataitro_id
     LEFT JOIN nguoidung nd ON ntt.nguoidung_id = nd.nguoidung_id
     WHERE kt.quy_id = ?
       AND kt.trangthai = 'Da nhan'
     ORDER BY kt.ngaytaitro DESC, kt.ngaytao DESC`,
    [quyId]
  );
  return rows;
};

// Lấy danh sách đơn đã giải ngân của một quỹ để hiển thị công khai
const getDisbursedApplicationsByFundId = async (quyId) => {
  const [rows] = await pool.query(
    `SELECT
      yc.yeucauhotro_id,
      yc.nguoidung_id,
      yc.quy_id,
      yc.sotiendenghi,
      yc.trangthai,
      yc.ngaynop,
      yc.ngaycapnhat,
      nd.hoten AS hoten_sinhvien,
      nd.masodinhdanh
     FROM yeucauhotro yc
     INNER JOIN nguoidung nd ON yc.nguoidung_id = nd.nguoidung_id
     WHERE yc.quy_id = ?
       AND yc.trangthai = 'Da giai ngan'
     ORDER BY yc.ngaycapnhat DESC, yc.ngaynop DESC`,
    [quyId]
  );
  return rows;
};

export default {
  checkFundNameExists,
  createFund,
  getFundById,
  getAllFunds,
  getPublicFunds,
  getPublicFundsByLevel, // New method for donation form
  updateFundStatus,
  checkFundNameExistsForOther,
  updateFund,
  getFundStats,
  getReceivedDonationsByFundId,
  getDisbursedApplicationsByFundId
};
