import pool from "../../config/db.js";

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: createRequest
// MỤC ĐÍCH: Kế toán đề xuất dự toán → INSERT 2 records + chi tiết khoản chi
// ─────────────────────────────────────────────────────────────────────────────
const createRequest = async ({ namTaiChinh, soTienDuToan, ghiChu, nguoiDeXuatId, lyDoDeXuat, fileMinhChung, chiTiet }) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Insert record cha (cap 1: Hội đồng Quỹ)
    const [parentResult] = await connection.execute(
      `INSERT INTO dutoanhangnam (namtaichinh, sotiendutoan, ghichu, nguoidexuat_id, trangthai, capduyet, parent_id, lydodeXuat, fileMinhChung)
       VALUES (?, ?, ?, ?, 'Cho duyet', 1, NULL, ?, ?)`,
      [namTaiChinh, soTienDuToan, ghiChu || null, nguoiDeXuatId, lyDoDeXuat || null, fileMinhChung || null]
    );
    const parentId = parentResult.insertId;

    // Insert record con (cap 2: Hiệu trưởng)
    await connection.execute(
      `INSERT INTO dutoanhangnam (namtaichinh, sotiendutoan, ghichu, nguoidexuat_id, trangthai, capduyet, parent_id, lydodeXuat, fileMinhChung)
       VALUES (?, ?, ?, ?, 'Cho duyet', 2, ?, ?, ?)`,
      [namTaiChinh, soTienDuToan, ghiChu || null, nguoiDeXuatId, parentId, lyDoDeXuat || null, fileMinhChung || null]
    );

    // Insert chi tiet khoan chi (neu co)
    if (chiTiet && Array.isArray(chiTiet) && chiTiet.length > 0) {
      for (const item of chiTiet) {
        await connection.execute(
          `INSERT INTO chitiet_dutoan (dutoanhangnam_id, khoanchi, sotiendutoan, ghichu)
           VALUES (?, ?, ?, ?)`,
          [parentId, item.khoanchi, item.sotiendutoan, item.ghichu || null]
        );
      }
    }

    await connection.commit();
    return { insertId: parentId };
  } catch (error) {
    await connection.rollback();
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('DUPLICATE_YEAR_BUDGET');
    }
    throw error;
  } finally {
    connection.release();
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getApprovalDetail
// MỤC ĐÍCH: Lấy chi tiết 2 cấp duyệt + chi tiet + thong ke nam truoc
// ─────────────────────────────────────────────────────────────────────────────
const getApprovalDetail = async (namTaiChinh) => {
  const [rows] = await pool.query(
    `SELECT
      parent.dutoanhangnam_id,
      parent.namtaichinh,
      parent.sotiendutoan,
      parent.ghichu,
      parent.nguoidexuat_id,
      parent.ngaydexuat,
      parent.lydodeXuat,
      parent.fileMinhChung,

      parent.trangthai        AS hoidong_trangthai,
      parent.nguoiduyet_id    AS hoidong_nguoiduyet_id,
      parent.ngayduyet        AS hoidong_ngayduyet,
      parent.lydotuchoi       AS hoidong_lydotuchoi,
      nd_hd.hoten             AS hoidong_nguoiduyet_ten,

      child.trangthai         AS hieutruong_trangthai,
      child.nguoiduyet_id     AS hieutruong_nguoiduyet_id,
      child.ngayduyet         AS hieutruong_ngayduyet,
      child.lydotuchoi        AS hieutruong_lydotuchoi,
      nd_ht.hoten             AS hieutruong_nguoiduyet_ten,

      nd_dx.hoten             AS nguoi_de_xuat_ten,

      CASE
        WHEN child.trangthai = 'Tu choi' OR parent.trangthai = 'Tu choi' THEN 'Tu choi'
        WHEN parent.trangthai = 'Da duyet' AND child.trangthai = 'Da duyet' THEN 'Da duyet'
        ELSE 'Cho duyet'
      END AS trangthai_tong

     FROM dutoanhangnam parent
     LEFT JOIN dutoanhangnam child ON child.parent_id = parent.dutoanhangnam_id
     LEFT JOIN nguoidung nd_dx ON parent.nguoidexuat_id = nd_dx.nguoidung_id
     LEFT JOIN nguoidung nd_hd ON parent.nguoiduyet_id = nd_hd.nguoidung_id
     LEFT JOIN nguoidung nd_ht ON child.nguoiduyet_id = nd_ht.nguoidung_id
     WHERE parent.parent_id IS NULL
       AND parent.namtaichinh = ?
     LIMIT 1`,
    [namTaiChinh]
  );
  return rows[0] || null;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getRequestById
// MỤC ĐÍCH: Lấy chi tiết dự toán theo ID (parent record)
// ─────────────────────────────────────────────────────────────────────────────
const getRequestById = async (id) => {
  const [rows] = await pool.query(
    `SELECT
      parent.dutoanhangnam_id,
      parent.namtaichinh,
      parent.sotiendutoan,
      parent.ghichu,
      parent.nguoidexuat_id,
      parent.ngaydexuat,
      parent.lydodeXuat,
      parent.fileMinhChung,

      parent.trangthai        AS hoidong_trangthai,
      parent.nguoiduyet_id    AS hoidong_nguoiduyet_id,
      parent.ngayduyet        AS hoidong_ngayduyet,
      parent.lydotuchoi       AS hoidong_lydotuchoi,
      nd_hd.hoten             AS hoidong_nguoiduyet_ten,

      child.dutoanhangnam_id  AS child_id,
      child.trangthai         AS hieutruong_trangthai,
      child.nguoiduyet_id     AS hieutruong_nguoiduyet_id,
      child.ngayduyet         AS hieutruong_ngayduyet,
      child.lydotuchoi        AS hieutruong_lydotuchoi,
      nd_ht.hoten             AS hieutruong_nguoiduyet_ten,

      nd_dx.hoten             AS nguoi_de_xuat_ten,

      CASE
        WHEN child.trangthai = 'Tu choi' OR parent.trangthai = 'Tu choi' THEN 'Tu choi'
        WHEN parent.trangthai = 'Da duyet' AND child.trangthai = 'Da duyet' THEN 'Da duyet'
        ELSE 'Cho duyet'
      END AS trangthai_tong

     FROM dutoanhangnam parent
     LEFT JOIN dutoanhangnam child ON child.parent_id = parent.dutoanhangnam_id
     LEFT JOIN nguoidung nd_dx ON parent.nguoidexuat_id = nd_dx.nguoidung_id
     LEFT JOIN nguoidung nd_hd ON parent.nguoiduyet_id = nd_hd.nguoidung_id
     LEFT JOIN nguoidung nd_ht ON child.nguoiduyet_id = nd_ht.nguoidung_id
     WHERE parent.parent_id IS NULL
       AND parent.dutoanhangnam_id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getChiTiet
// MỤC ĐÍCH: Lay chi tiet khoan chi cua 1 du toan
// ─────────────────────────────────────────────────────────────────────────────
const getChiTiet = async (parentId) => {
  const [rows] = await pool.query(
    `SELECT chitiet_dutoan_id, khoanchi, sotiendutoan, ghichu
     FROM chitiet_dutoan
     WHERE dutoanhangnam_id = ?
     ORDER BY chitiet_dutoan_id ASC`,
    [parentId]
  );
  return rows;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: approveLevel
// MỤC ĐÍCH: Duyệt ở 1 cấp (1=HĐ Quỹ, 2=Hiệu trưởng)
// ─────────────────────────────────────────────────────────────────────────────
const approveLevel = async (parentId, capDuyet, nguoiDuyetId) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    let targetId;
    if (capDuyet === 1) {
      targetId = parentId;
    } else {
      const [childRows] = await connection.query(
        `SELECT dutoanhangnam_id FROM dutoanhangnam WHERE parent_id = ? AND capduyet = 2 LIMIT 1`,
        [parentId]
      );
      if (!childRows[0]) {
        await connection.rollback();
        return false;
      }
      targetId = childRows[0].dutoanhangnam_id;
    }

    const [result] = await connection.execute(
      `UPDATE dutoanhangnam
       SET trangthai = 'Da duyet',
           nguoiduyet_id = ?,
           ngayduyet = CURRENT_TIMESTAMP
       WHERE dutoanhangnam_id = ? AND trangthai = 'Cho duyet'`,
      [nguoiDuyetId, targetId]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return false;
    }

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: rejectLevel
// MỤC ĐÍCH: Từ chối ở 1 cấp → cả dự toán bị từ chối
// ─────────────────────────────────────────────────────────────────────────────
const rejectLevel = async (parentId, capDuyet, nguoiDuyetId, lyDo) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    let targetId;
    if (capDuyet === 1) {
      targetId = parentId;
    } else {
      const [childRows] = await connection.query(
        `SELECT dutoanhangnam_id FROM dutoanhangnam WHERE parent_id = ? AND capduyet = 2 LIMIT 1`,
        [parentId]
      );
      if (!childRows[0]) {
        await connection.rollback();
        return false;
      }
      targetId = childRows[0].dutoanhangnam_id;
    }

    const [result] = await connection.execute(
      `UPDATE dutoanhangnam
       SET trangthai = 'Tu choi',
           nguoiduyet_id = ?,
           lydotuchoi = ?,
           ngayduyet = CURRENT_TIMESTAMP
       WHERE dutoanhangnam_id = ? AND trangthai = 'Cho duyet'`,
      [nguoiDuyetId, lyDo || null, targetId]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return false;
    }

    if (capDuyet === 1) {
      await connection.execute(
        `UPDATE dutoanhangnam
         SET trangthai = 'Tu choi'
         WHERE parent_id = ? AND capduyet = 2 AND trangthai = 'Cho duyet'`,
        [parentId]
      );
    } else {
      await connection.execute(
        `UPDATE dutoanhangnam
         SET trangthai = 'Tu choi'
         WHERE dutoanhangnam_id = ? AND trangthai = 'Cho duyet'`,
        [parentId]
      );
    }

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getByYear
// MỤC ĐÍCH: Lấy dự toán theo năm
// ─────────────────────────────────────────────────────────────────────────────
const getByYear = async (namTaiChinh) => {
  return getApprovalDetail(namTaiChinh);
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getAll
// MỤC ĐÍCH: Lấy danh sách tất cả dự toán
// ─────────────────────────────────────────────────────────────────────────────
const getAll = async () => {
  const [rows] = await pool.query(
    `SELECT
      parent.dutoanhangnam_id,
      parent.namtaichinh,
      parent.sotiendutoan,
      parent.ghichu,
      parent.nguoidexuat_id,
      parent.ngaydexuat,
      parent.lydodeXuat,
      parent.fileMinhChung,
      nd_dx.hoten AS nguoi_de_xuat_ten,

      parent.trangthai        AS hoidong_trangthai,
      parent.nguoiduyet_id    AS hoidong_nguoiduyet_id,
      parent.ngayduyet        AS hoidong_ngayduyet,
      parent.lydotuchoi       AS hoidong_lydotuchoi,
      nd_hd.hoten             AS hoidong_nguoiduyet_ten,

      child.trangthai         AS hieutruong_trangthai,
      child.nguoiduyet_id     AS hieutruong_nguoiduyet_id,
      child.ngayduyet         AS hieutruong_ngayduyet,
      child.lydotuchoi        AS hieutruong_lydotuchoi,
      nd_ht.hoten             AS hieutruong_nguoiduyet_ten,

      CASE
        WHEN child.trangthai = 'Tu choi' OR parent.trangthai = 'Tu choi' THEN 'Tu choi'
        WHEN parent.trangthai = 'Da duyet' AND child.trangthai = 'Da duyet' THEN 'Da duyet'
        ELSE 'Cho duyet'
      END AS trangthai_tong

     FROM dutoanhangnam parent
     LEFT JOIN dutoanhangnam child ON child.parent_id = parent.dutoanhangnam_id
     LEFT JOIN nguoidung nd_dx ON parent.nguoidexuat_id = nd_dx.nguoidung_id
     LEFT JOIN nguoidung nd_hd ON parent.nguoiduyet_id = nd_hd.nguoidung_id
     LEFT JOIN nguoidung nd_ht ON child.nguoiduyet_id = nd_ht.nguoidung_id
     WHERE parent.parent_id IS NULL
     ORDER BY parent.namtaichinh DESC`
  );
  return rows;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getAccumulatedExpense
// MỤC ĐÍCH: Tính tổng chi bo may hoat dong trong nam
// ─────────────────────────────────────────────────────────────────────────────
const getAccumulatedExpense = async (namTaiChinh) => {
  const [rows] = await pool.query(
    `SELECT COALESCE(SUM(sotien), 0) AS total
     FROM giaodich
     WHERE loaigiaodich = 'Chi'
       AND hangmucchi = 'Bo_may_hoat_dong'
       AND trangthai = 'Thanh cong'
       AND YEAR(ngaygiaodich) = ?`,
    [namTaiChinh]
  );
  return parseFloat(rows[0]?.total || 0);
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getPreviousYearStats
// MỤC ĐÍCH: Lay thong ke nam truoc de hien thi khi tao du toan moi
// ─────────────────────────────────────────────────────────────────────────────
const getPreviousYearStats = async (namHienTai) => {
  const namTruoc = namHienTai - 1;

  // 1. Du toan duoc duyet nam truoc
  const [[duToanRow]] = await pool.query(
    `SELECT COALESCE(sotiendutoan, 0) AS sotiendutoan, trangthai
     FROM dutoanhangnam
     WHERE namtaichinh = ? AND capduyet = 1
     LIMIT 1`,
    [namTruoc]
  );

  // 2. Tong thu nam truoc
  const [[thuRow]] = await pool.query(
    `SELECT COALESCE(SUM(sotien), 0) AS total
     FROM giaodich
     WHERE loaigiaodich = 'Thu'
       AND trangthai = 'Thanh cong'
       AND YEAR(ngaygiaodich) = ?`,
    [namTruoc]
  );

  // 3. Tong chi nam truoc (tat ca cac hang muc)
  const [[chiRow]] = await pool.query(
    `SELECT COALESCE(SUM(sotien), 0) AS total
     FROM giaodich
     WHERE loaigiaodich = 'Chi'
       AND trangthai = 'Thanh cong'
       AND YEAR(ngaygiaodich) = ?`,
    [namTruoc]
  );

  // 4. Chi bo may hoat dong nam truoc
  const [[chiBoMayRow]] = await pool.query(
    `SELECT COALESCE(SUM(sotien), 0) AS total
     FROM giaodich
     WHERE loaigiaodich = 'Chi'
       AND hangmucchi = 'Bo_may_hoat_dong'
       AND trangthai = 'Thanh cong'
       AND YEAR(ngaygiaodich) = ?`,
    [namTruoc]
  );

  // 5. Thu hoi no nam truoc
  const [[thuNoRow]] = await pool.query(
    `SELECT COALESCE(SUM(sotien), 0) AS total
     FROM giaodich
     WHERE loaigiaodich = 'Thu hoi no'
       AND trangthai = 'Thanh cong'
       AND YEAR(ngaygiaodich) = ?`,
    [namTruoc]
  );

  // 6. So ho so duoc duyet nam truoc
  const [[duyetRow]] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM yeucauhotro
     WHERE trangthai IN ('Da giai ngan', 'Da duyet')
       AND YEAR(ngaytao) = ?`,
    [namTruoc]
  );

  // 7. So ho so tu choi nam truoc
  const [[tuChoiRow]] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM yeucauhotro
     WHERE trangthai = 'Tu choi'
       AND YEAR(ngaytao) = ?`,
    [namTruoc]
  );

  return {
    namTruoc,
    duToan: duToanRow ? {
      sotiendutoan: parseFloat(duToanRow.sotiendutoan),
      trangthai: duToanRow.trangthai
    } : null,
    tongThu: parseFloat(thuRow.total),
    tongChi: parseFloat(chiRow.total),
    chiBoMay: parseFloat(chiBoMayRow.total),
    thuHoiNo: parseFloat(thuNoRow.total),
    soHoSoDuyet: parseInt(duyetRow.total),
    soHoSoTuChoi: parseInt(tuChoiRow.total)
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: checkLimit
// MỤC ĐÍCH: Kiểm tra hạn mức chi bộ máy còn lại
// ─────────────────────────────────────────────────────────────────────────────
const checkLimit = async (namTaiChinh, soTienDeXuatChi) => {
  const budget = await getByYear(namTaiChinh);
  if (!budget) {
    return {
      exists: false,
      approved: false,
      conLai: 0,
      luyKeDaChi: 0,
      soTienDuToan: 0,
      vuotDuToan: true
    };
  }

  const trangThaiTong = budget.trangthai_tong;
  if (trangThaiTong !== 'Da duyet') {
    return {
      exists: true,
      approved: false,
      conLai: 0,
      luyKeDaChi: 0,
      soTienDuToan: parseFloat(budget.sotiendutoan),
      vuotDuToan: true
    };
  }

  const luyKeDaChi = await getAccumulatedExpense(namTaiChinh);
  const soTienDuToan = parseFloat(budget.sotiendutoan);
  const conLai = Math.max(0, soTienDuToan - luyKeDaChi);
  const vuotDuToan = soTienDeXuatChi > conLai;

  return {
    exists: true,
    approved: true,
    conLai,
    luyKeDaChi,
    soTienDuToan,
    vuotDuToan
  };
};

export default {
  createRequest,
  getRequestById,
  getApprovalDetail,
  getChiTiet,
  approveLevel,
  rejectLevel,
  getByYear,
  getAll,
  getAccumulatedExpense,
  getPreviousYearStats,
  checkLimit
};
