import NewsModel from "../../models/news/NewsModel.js";
import fs from "fs";
import path from "path";

const buildNewsImageUrl = (imagePath) => {
  if (!imagePath) return null;

  let cleanPath = String(imagePath).trim();
  if (!cleanPath) return null;

  try {
    const parsed = new URL(cleanPath);
    if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
      cleanPath = parsed.pathname.replace(/^\/+/, "");
    } else {
      return imagePath;
    }
  } catch {
    cleanPath = cleanPath.replace(/^\/+/, "");
  }

  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
    return imagePath;
  }
  const BASE_URL = process.env.BASE_URL || 'http://localhost:5001';
  if (cleanPath.startsWith('uploads/')) {
    if (!fs.existsSync(path.join(process.cwd(), cleanPath))) return null;
    return `${BASE_URL}/${cleanPath}`;
  }
  const relativePath = `uploads/avatars/news/${cleanPath}`;
  if (!fs.existsSync(path.join(process.cwd(), relativePath))) return null;
  return `${BASE_URL}/${relativePath}`;
};

const PHANLOAI_VALUES = ['Tin moi', 'Tin noi bat'];
const normalizePhanloai = (value) => (
  PHANLOAI_VALUES.includes(value) ? value : 'Tin moi'
);

// ═══════════════════════════════════════════════════════════════
// API MỚI: GET /api/news/landing - Lấy tin tức cho Landing Page
// ═══════════════════════════════════════════════════════════════
export const getLandingNews = async (req, res) => {
  try {
    const data = await NewsModel.getLandingNews();

    // Map dữ liệu để trả về frontend
    const mapNewsItem = (news) => {
      if (!news) return null;
      return {
        id: news.tintuc_id,
        title: news.tieude,
        summary: news.motangan,
        avatar: buildNewsImageUrl(news.avatar),
        category: news.danhmuc,
        phanloai: normalizePhanloai(news.phanloai),
        publishDate: news.ngayxuatban
      };
    };

    return res.status(200).json({
      success: true,
      data: {
        moi: {
          featured: mapNewsItem(data.moi.featured),
          featuredSmall: data.moi.featuredSmall.map(mapNewsItem),
          sidebar: data.moi.sidebar.map(mapNewsItem),
          recent: data.moi.recent.map(mapNewsItem)
        },
        noibat: {
          featured: mapNewsItem(data.noibat.featured),
          featuredSmall: data.noibat.featuredSmall.map(mapNewsItem),
          sidebar: data.noibat.sidebar.map(mapNewsItem),
          recent: data.noibat.recent.map(mapNewsItem)
        }
      }
    });
  } catch (error) {
    console.error("Lỗi getLandingNews:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau"
    });
  }
};

// ═══════════════════════════════════════════════════════════════
// API CŨ: Giữ lại để tương thích ngược
// ═══════════════════════════════════════════════════════════════

// GET /api/news/public - Lấy danh sách tin tức công khai có phân trang
export const getPublicNews = async (req, res) => {
  try {
    const { limit, page, category, excludeId, phanloai } = req.query;

    const parsedLimit = limit ? parseInt(limit) : 10;
    const parsedPage = page ? parseInt(page) : 1;

    const { news, total } = await NewsModel.getPublicNews({
      limit: parsedLimit,
      page: parsedPage,
      category: category || null,
      excludeId: excludeId ? parseInt(excludeId) : null,
      phanloai: phanloai ? normalizePhanloai(phanloai) : null
    });

    const totalPages = Math.ceil(total / parsedLimit);

    return res.status(200).json({
      success: true,
      total,
      page: parsedPage,
      totalPages,
      news: news.map(item => ({
        id: item.tintuc_id,
        title: item.tieude,
        summary: item.motangan,
        avatar: buildNewsImageUrl(item.avatar),
        category: item.danhmuc,
        phanloai: normalizePhanloai(item.phanloai),
        lanoibat: item.lanoibat,
        isFeatured: item.lanoibat === 1,
        publishDate: item.ngayxuatban,
        createdAt: item.ngaytao
      }))
    });
  } catch (error) {
    console.error("Lỗi getPublicNews:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau"
    });
  }
};

// GET /api/news/count-by-category - Lấy số lượng tin của từng danh mục
export const getNewsCountByCategory = async (req, res) => {
  try {
    const { phanloai } = req.query;
    const counts = await NewsModel.getNewsCountByCategory({
      phanloai: phanloai ? normalizePhanloai(phanloai) : null
    });
    return res.status(200).json({
      success: true,
      data: counts
    });
  } catch (error) {
    console.error("Lỗi getNewsCountByCategory:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau"
    });
  }
};

// GET /api/news - Admin/Cán bộ lấy toàn bộ danh sách tin tức
export const getAllNews = async (req, res) => {
  try {
    const newsList = await NewsModel.getAllNews();

    return res.status(200).json({
      success: true,
      total: newsList.length,
      news: newsList.map(news => ({
        id: news.tintuc_id,
        title: news.tieude,
        summary: news.motangan,
        avatar: buildNewsImageUrl(news.avatar),
        category: news.danhmuc,
        phanloai: normalizePhanloai(news.phanloai),
        lanoibat: news.lanoibat,
        isFeatured: news.lanoibat === 1,
        status: news.trangthai,
        publishDate: news.ngayxuatban,
        createdAt: news.ngaytao,
        updatedAt: news.ngaycapnhat,
        creatorName: news.nguoi_tao
      }))
    });
  } catch (error) {
    console.error("Lỗi getAllNews:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau"
    });
  }
};

// GET /api/news/:id - Lấy chi tiết tin tức (công khai để người dùng đọc)
export const getNewsById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID không hợp lệ"
      });
    }

    const news = await NewsModel.getNewsById(id);
    if (!news) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tin tức"
      });
    }

    // Chỉ cho phép xem nếu tin tức đã được xuất bản
    if (news.trangthai !== 'Da xuat ban') {
      return res.status(404).json({
        success: false,
        message: "Tin tức chưa được xuất bản hoặc không tồn tại"
      });
    }

    return res.status(200).json({
      success: true,
      news: {
        id: news.tintuc_id,
        title: news.tieude,
        summary: news.motangan,
        content: news.noidung,
        avatar: buildNewsImageUrl(news.avatar),
        category: news.danhmuc,
        phanloai: normalizePhanloai(news.phanloai),
        lanoibat: news.lanoibat,
        isFeatured: news.lanoibat === 1,
        status: news.trangthai,
        publishDate: news.ngayxuatban,
        createdAt: news.ngaytao,
        updatedAt: news.ngaycapnhat,
        creatorName: news.nguoi_tao,
        editorName: news.nguoi_sua
      }
    });
  } catch (error) {
    console.error("Lỗi getNewsById:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau"
    });
  }
};

// GET /api/news/admin/:id - Admin/Cán bộ lấy chi tiết bài viết (kể cả Draft/Hidden) dùng cho trang edit
export const getNewsAdminById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ success: false, message: "ID không hợp lệ" });
    }

    const news = await NewsModel.getNewsById(id);
    if (!news) {
      return res.status(404).json({ success: false, message: "Không tìm thấy tin tức" });
    }

    return res.status(200).json({
      success: true,
      news: {
        id: news.tintuc_id,
        title: news.tieude,
        summary: news.motangan,
        content: news.noidung,
        avatar: news.avatar ? buildNewsImageUrl(news.avatar) : null,
        avatarPath: news.avatar || null,
        category: news.danhmuc,
        phanloai: normalizePhanloai(news.phanloai),
        lanoibat: news.lanoibat,
        isFeatured: news.lanoibat === 1,
        status: news.trangthai,
        publishDate: news.ngayxuatban,
        createdAt: news.ngaytao,
        updatedAt: news.ngaycapnhat,
        creatorName: news.nguoi_tao,
        editorName: news.nguoi_sua
      }
    });
  } catch (error) {
    console.error("Lỗi getNewsAdminById:", error);
    return res.status(500).json({ success: false, message: "Lỗi server, vui lòng thử lại sau" });
  }
};

// POST /api/news - Admin/Cán bộ tạo mới tin tức
export const createNews = async (req, res) => {
  try {
    const {
      title,
      summary,
      content,
      avatar,
      category,
      isFeatured,
      status,
      publishDate,
      lanoibat,
      phanloai
    } = req.body;

    // Validate bắt buộc
    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập tiêu đề tin tức"
      });
    }
    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập nội dung tin tức"
      });
    }

    // Xác định ngày xuất bản nếu status là 'Da xuat ban'
    let finalPublishDate = publishDate || null;
    if (status === 'Da xuat ban' && !finalPublishDate) {
      finalPublishDate = new Date();
    }

    // Lấy ID người tạo từ token (req.user)
    const creatorId = req.user.id;

    const result = await NewsModel.createNews({
      tieude: title.trim(),
      motangan: summary ? summary.trim() : null,
      noidung: content,
      avatar: avatar || null,
      danhmuc: category || 'Thong bao',
      lanoibat: lanoibat !== undefined ? Number(lanoibat) : (isFeatured ? 1 : 0),
      phanloai: normalizePhanloai(phanloai),
      trangthai: status || 'Ban nhap',
      ngayxuatban: finalPublishDate,
      nguoitao_id: creatorId
    });

    const newNews = await NewsModel.getNewsById(result.insertId);

    return res.status(201).json({
      success: true,
      message: "Tạo tin tức thành công",
      news: {
        id: newNews.tintuc_id,
        title: newNews.tieude,
        summary: newNews.motangan,
        avatar: buildNewsImageUrl(newNews.avatar),
        category: newNews.danhmuc,
        phanloai: normalizePhanloai(newNews.phanloai),
        lanoibat: newNews.lanoibat,
        isFeatured: newNews.lanoibat === 1,
        status: newNews.trangthai,
        publishDate: newNews.ngayxuatban
      }
    });
  } catch (error) {
    console.error("Lỗi createNews:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau"
    });
  }
};

// PUT /api/news/:id - Admin/Cán bộ cập nhật tin tức
export const updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      summary,
      content,
      avatar,
      category,
      isFeatured,
      status,
      publishDate,
      lanoibat,
      phanloai
    } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID không hợp lệ"
      });
    }

    // Kiểm tra tin tức tồn tại
    const existing = await NewsModel.getNewsById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tin tức"
      });
    }

    // Validate
    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập tiêu đề tin tức"
      });
    }
    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập nội dung tin tức"
      });
    }

    // Cập nhật ngày xuất bản nếu đổi trạng thái sang Da xuat ban
    let finalPublishDate = publishDate || existing.ngayxuatban;
    if (status === 'Da xuat ban' && !existing.ngayxuatban) {
      finalPublishDate = new Date();
    } else if (status === 'Ban nhap') {
      finalPublishDate = null;
    }

    const editorId = req.user.id;

    await NewsModel.updateNews(id, {
      tieude: title.trim(),
      motangan: summary ? summary.trim() : null,
      noidung: content,
      avatar: avatar || null,
      danhmuc: category || 'Thong bao',
      lanoibat: lanoibat !== undefined ? Number(lanoibat) : (isFeatured ? 1 : 0),
      phanloai: normalizePhanloai(phanloai),
      trangthai: status || 'Ban nhap',
      ngayxuatban: finalPublishDate,
      nguoisua_id: editorId
    });

    const updatedNews = await NewsModel.getNewsById(id);

    return res.status(200).json({
      success: true,
      message: "Cập nhật tin tức thành công",
      news: {
        id: updatedNews.tintuc_id,
        title: updatedNews.tieude,
        summary: updatedNews.motangan,
        avatar: buildNewsImageUrl(updatedNews.avatar),
        category: updatedNews.danhmuc,
        phanloai: normalizePhanloai(updatedNews.phanloai),
        lanoibat: updatedNews.lanoibat,
        isFeatured: updatedNews.lanoibat === 1,
        status: updatedNews.trangthai,
        publishDate: updatedNews.ngayxuatban
      }
    });
  } catch (error) {
    console.error("Lỗi updateNews:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau"
    });
  }
};

// DELETE /api/news/:id - Admin/Cán bộ xóa tin tức
export const deleteNews = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID không hợp lệ"
      });
    }

    const existing = await NewsModel.getNewsById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tin tức"
      });
    }

    await NewsModel.deleteNews(id);

    return res.status(200).json({
      success: true,
      message: "Xóa tin tức thành công"
    });
  } catch (error) {
    console.error("Lỗi deleteNews:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau"
    });
  }
};

// PUT /api/news/:id/status - Admin/Cán bộ cập nhật nhanh trạng thái
export const updateNewsStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID không hợp lệ"
      });
    }

    if (!status || !['Ban nhap', 'Da xuat ban', 'Da an'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái không hợp lệ"
      });
    }

    const existing = await NewsModel.getNewsById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tin tức"
      });
    }

    let publishDate = existing.ngayxuatban;
    if (status === 'Da xuat ban' && !existing.ngayxuatban) {
      publishDate = new Date();
    } else if (status === 'Ban nhap') {
      publishDate = null;
    }

    await NewsModel.updateNewsStatus(id, status, publishDate);

    return res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái tin tức thành công"
    });
  } catch (error) {
    console.error("Lỗi updateNewsStatus:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau"
    });
  }
};

export default {
  getLandingNews,    // API mới
  getPublicNews,
  getNewsCountByCategory,
  getAllNews,
  getNewsById,
  getNewsAdminById,
  createNews,
  updateNews,
  deleteNews,
  updateNewsStatus
};
