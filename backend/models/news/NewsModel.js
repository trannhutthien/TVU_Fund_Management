import pool from "../../config/db.js";

// ═══════════════════════════════════════════════════════════════
// API MỚI: Lấy tin tức cho Landing Page (1 lần gọi duy nhất)
// ═══════════════════════════════════════════════════════════════
const getLandingNews = async () => {
  const [featured] = await pool.query(
    `SELECT 
      tintuc_id, tieude, motangan, avatar, danhmuc, ngayxuatban
    FROM tintuc
    WHERE trangthai = 'Da xuat ban' AND lanoibat = 1
    ORDER BY ngayxuatban DESC, ngaytao DESC
    LIMIT 1`
  );

  const [featuredSmall] = await pool.query(
    `SELECT 
      tintuc_id, tieude, motangan, avatar, danhmuc, ngayxuatban
    FROM tintuc
    WHERE trangthai = 'Da xuat ban' AND lanoibat = 2
    ORDER BY ngayxuatban DESC, ngaytao DESC
    LIMIT 2`
  );

  const [sidebar] = await pool.query(
    `SELECT 
      tintuc_id, tieude, motangan, avatar, danhmuc, ngayxuatban
    FROM tintuc
    WHERE trangthai = 'Da xuat ban' AND lanoibat = 3
    ORDER BY ngayxuatban DESC, ngaytao DESC
    LIMIT 5`
  );

  const [recent] = await pool.query(
    `SELECT 
      tintuc_id, tieude, motangan, avatar, danhmuc, ngayxuatban
    FROM tintuc
    WHERE trangthai = 'Da xuat ban' AND lanoibat = 0
    ORDER BY ngayxuatban DESC, ngaytao DESC
    LIMIT 6`
  );

  // Fallback: Nếu không có featured lớn, lấy bài mới nhất
  let featuredFinal = featured[0];
  if (!featuredFinal) {
    const [fallback] = await pool.query(
      `SELECT 
        tintuc_id, tieude, motangan, avatar, danhmuc, ngayxuatban
      FROM tintuc
      WHERE trangthai = 'Da xuat ban'
      ORDER BY ngayxuatban DESC, ngaytao DESC
      LIMIT 1`
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

// ═══════════════════════════════════════════════════════════════
// API CŨ: Giữ lại để tương thích ngược
// ═══════════════════════════════════════════════════════════════

// Lấy tin tức đã xuất bản công khai với bộ lọc
const getPublicNews = async (filters = {}) => {
  const { limit = 10, category, excludeId } = filters;
  
  let query = `
    SELECT 
      tintuc_id,
      tieude,
      motangan,
      avatar,
      danhmuc,
      lanoibat,
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

  if (excludeId) {
    query += " AND tintuc_id != ?";
    params.push(Number(excludeId));
  }

  query += ` ORDER BY lanoibat DESC, ngayxuatban DESC, ngaytao DESC LIMIT ?`;
  params.push(Number(limit));

  const [rows] = await pool.query(query, params);
  return rows;
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
      trangthai,
      ngayxuatban,
      nguoitao_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      tieude,
      motangan || null,
      noidung,
      avatar || null,
      danhmuc || 'Thong bao',
      lanoibat || 0,
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
  getAllNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  updateNewsStatus
};
