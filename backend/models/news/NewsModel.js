import pool from "../../config/db.js";

// ═══════════════════════════════════════════════════════════════
// API MỚI: Lấy tin tức cho Landing Page (1 lần gọi duy nhất)
// ═══════════════════════════════════════════════════════════════
const getLandingNews = async () => {
  const getGroup = async (phanLoai) => {
    const [featured] = await pool.query(
      `SELECT 
        tintuc_id, tieude, motangan, avatar, danhmuc, ngayxuatban, phanloai
      FROM tintuc
      WHERE trangthai = 'Da xuat ban' AND lanoibat = 1 AND phanloai = ?
      ORDER BY ngayxuatban DESC, ngaytao DESC
      LIMIT 1`,
      [phanLoai]
    );

    const [featuredSmall] = await pool.query(
      `SELECT 
        tintuc_id, tieude, motangan, avatar, danhmuc, ngayxuatban, phanloai
      FROM tintuc
      WHERE trangthai = 'Da xuat ban' AND lanoibat = 2 AND phanloai = ?
      ORDER BY ngayxuatban DESC, ngaytao DESC
      LIMIT 2`,
      [phanLoai]
    );

    const [sidebar] = await pool.query(
      `SELECT 
        tintuc_id, tieude, motangan, avatar, danhmuc, ngayxuatban, phanloai
      FROM tintuc
      WHERE trangthai = 'Da xuat ban' AND lanoibat = 3 AND phanloai = ?
      ORDER BY ngayxuatban DESC, ngaytao DESC
      LIMIT 5`,
      [phanLoai]
    );

    const [recent] = await pool.query(
      `SELECT 
        tintuc_id, tieude, motangan, avatar, danhmuc, ngayxuatban, phanloai
      FROM tintuc
      WHERE trangthai = 'Da xuat ban' AND lanoibat = 0 AND phanloai = ?
      ORDER BY ngayxuatban DESC, ngaytao DESC
      LIMIT 6`,
      [phanLoai]
    );

    // Fallback: Nếu không có featured lớn, lấy bài mới nhất của phân loại đó
    let featuredFinal = featured[0];
    if (!featuredFinal) {
      const [fallback] = await pool.query(
        `SELECT 
          tintuc_id, tieude, motangan, avatar, danhmuc, ngayxuatban, phanloai
        FROM tintuc
        WHERE trangthai = 'Da xuat ban' AND phanloai = ?
        ORDER BY ngayxuatban DESC, ngaytao DESC
        LIMIT 1`,
        [phanLoai]
      );
      featuredFinal = fallback[0] || null;
    }

    return {
      featured: featuredFinal,
      featuredSmall: featuredSmall || [],
      sidebar: sidebar || [],
      recent: recent || []
    };
  };

  const moi = await getGroup('Tin moi');
  const noibat = await getGroup('Tin noi bat');

  return { moi, noibat };
};

// ═══════════════════════════════════════════════════════════════
// API CŨ: Giữ lại để tương thích ngược
// ═══════════════════════════════════════════════════════════════

// Lấy tin tức đã xuất bản công khai với bộ lọc
const getPublicNews = async (filters = {}) => {
  const { limit = 10, page = 1, category, excludeId, phanloai } = filters;
  const offset = (page - 1) * limit;

  // 1. Đếm tổng số bài viết
  let countQuery = "SELECT COUNT(*) as total FROM tintuc WHERE trangthai = 'Da xuat ban'";
  const countParams = [];

  if (category) {
    countQuery += " AND danhmuc = ?";
    countParams.push(category);
  }

  if (phanloai) {
    countQuery += " AND phanloai = ?";
    countParams.push(phanloai);
  }

  if (excludeId) {
    countQuery += " AND tintuc_id != ?";
    countParams.push(Number(excludeId));
  }

  const [countResult] = await pool.query(countQuery, countParams);
  const total = countResult[0].total;

  // 2. Lấy dữ liệu phân trang
  let query = `
    SELECT 
      tintuc_id,
      tieude,
      motangan,
      avatar,
      danhmuc,
      lanoibat,
      phanloai,
      ngayxuatban,
      ngaytao
    FROM tintuc
    WHERE trangthai = 'Da xuat ban'
  `;
  const params = [];

  if (category) {
    query += " AND danhmuc = ?";
    params.push(category);
  }

  if (phanloai) {
    query += " AND phanloai = ?";
    params.push(phanloai);
  }

  if (excludeId) {
    query += " AND tintuc_id != ?";
    params.push(Number(excludeId));
  }

  query += ` ORDER BY lanoibat DESC, ngayxuatban DESC, ngaytao DESC LIMIT ? OFFSET ?`;
  params.push(Number(limit));
  params.push(Number(offset));

  const [rows] = await pool.query(query, params);
  return { news: rows, total };
};

// Lấy số lượng bài viết của từng danh mục
const getNewsCountByCategory = async (filters = {}) => {
  const { phanloai } = filters;
  let query = `SELECT danhmuc, COUNT(*) as total 
     FROM tintuc 
     WHERE trangthai = 'Da xuat ban'`;
  const params = [];

  if (phanloai) {
    query += " AND phanloai = ?";
    params.push(phanloai);
  }

  query += " GROUP BY danhmuc";

  const [rows] = await pool.query(query, params);

  const result = {
    'Tin hoc bong': 0,
    'Tin giao duc': 0,
    'Su kien': 0,
    'Thong bao': 0,
    'Bao cao hoat dong': 0,
    'Khac': 0
  };

  rows.forEach(row => {
    if (row.danhmuc in result) {
      result[row.danhmuc] = row.total;
    }
  });

  return result;
};

// Lấy tất cả tin tức (dành cho Admin/Cán bộ)
const getAllNews = async () => {
  const [rows] = await pool.query(
    `SELECT 
      t.tintuc_id,
      t.tieude,
      t.motangan,
      t.avatar,
      t.danhmuc,
      t.lanoibat,
      t.phanloai,
      t.trangthai,
      t.ngayxuatban,
      t.ngaytao,
      t.ngaycapnhat,
      u.hoten AS nguoi_tao
     FROM tintuc t
     LEFT JOIN nguoidung u ON t.nguoitao_id = u.nguoidung_id
     ORDER BY t.ngaytao DESC`
  );
  return rows;
};

// Lấy chi tiết tin tức theo ID
const getNewsById = async (newsId) => {
  const [rows] = await pool.query(
    `SELECT 
      t.tintuc_id,
      t.tieude,
      t.motangan,
      t.noidung,
      t.avatar,
      t.danhmuc,
      t.lanoibat,
      t.phanloai,
      t.trangthai,
      t.ngayxuatban,
      t.nguoitao_id,
      t.nguoisua_id,
      t.ngaytao,
      t.ngaycapnhat,
      u1.hoten AS nguoi_tao,
      u2.hoten AS nguoi_sua
     FROM tintuc t
     LEFT JOIN nguoidung u1 ON t.nguoitao_id = u1.nguoidung_id
     LEFT JOIN nguoidung u2 ON t.nguoisua_id = u2.nguoidung_id
     WHERE t.tintuc_id = ?
     LIMIT 1`,
    [newsId]
  );
  return rows[0] || null;
};

// Tạo mới tin tức
const createNews = async (data) => {
  const {
    tieude,
    motangan,
    noidung,
    avatar,
    danhmuc,
    lanoibat,
    phanloai,
    trangthai,
    ngayxuatban,
    nguoitao_id
  } = data;

  const [result] = await pool.execute(
    `INSERT INTO tintuc (
      tieude,
      motangan,
      noidung,
      avatar,
      danhmuc,
      lanoibat,
      phanloai,
      trangthai,
      ngayxuatban,
      nguoitao_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      tieude,
      motangan || null,
      noidung,
      avatar || null,
      danhmuc || 'Thong bao',
      lanoibat || 0,
      phanloai || 'Tin moi',
      trangthai || 'Ban nhap',
      ngayxuatban || null,
      nguoitao_id
    ]
  );

  return result;
};

// Cập nhật tin tức
const updateNews = async (newsId, data) => {
  const {
    tieude,
    motangan,
    noidung,
    avatar,
    danhmuc,
    lanoibat,
    phanloai,
    trangthai,
    ngayxuatban,
    nguoisua_id
  } = data;

  const [result] = await pool.execute(
    `UPDATE tintuc
     SET tieude = ?,
         motangan = ?,
         noidung = ?,
         avatar = ?,
         danhmuc = ?,
         lanoibat = ?,
         phanloai = ?,
         trangthai = ?,
         ngayxuatban = ?,
         nguoisua_id = ?,
         ngaycapnhat = CURRENT_TIMESTAMP
     WHERE tintuc_id = ?`,
    [
      tieude,
      motangan || null,
      noidung,
      avatar || null,
      danhmuc || 'Thong bao',
      lanoibat || 0,
      phanloai || 'Tin moi',
      trangthai || 'Ban nhap',
      ngayxuatban || null,
      nguoisua_id,
      newsId
    ]
  );

  return result;
};

// Xóa tin tức
const deleteNews = async (newsId) => {
  const [result] = await pool.execute(
    `DELETE FROM tintuc WHERE tintuc_id = ?`,
    [newsId]
  );
  return result;
};

// Cập nhật trạng thái hiển thị của tin tức
const updateNewsStatus = async (newsId, trangThai, ngayXuatBan = null) => {
  const [result] = await pool.execute(
    `UPDATE tintuc
     SET trangthai = ?,
         ngayxuatban = ?,
         ngaycapnhat = CURRENT_TIMESTAMP
     WHERE tintuc_id = ?`,
    [trangThai, ngayXuatBan, newsId]
  );
  return result;
};

export default {
  getLandingNews,      // API mới
  getPublicNews,
  getNewsCountByCategory,
  getAllNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  updateNewsStatus
};
