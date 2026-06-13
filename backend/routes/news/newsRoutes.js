import express from "express";
import {
  getLandingNews,    // API mới
  getPublicNews,
  getNewsCountByCategory,
  getAllNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  updateNewsStatus
} from "../../controllers/news/newsController.js";
import { protect } from "../../middleware/authMiddleware.js";
import { authorizeRoles } from "../../middleware/rolesMiddleware.js";

const router = express.Router();

// ═══════════════════════════════════════════════════════════════
// API MỚI: GET /api/news/landing - Lấy tin tức cho Landing Page
// Trả về 4 nhóm trong 1 lần gọi: featured, featuredSmall, sidebar, recent
// ═══════════════════════════════════════════════════════════════
router.get("/landing", getLandingNews);

// ═══════════════════════════════════════════════════════════════
// API CŨ: Giữ lại để tương thích ngược
// ═══════════════════════════════════════════════════════════════

// GET /api/news/public - Lấy danh sách tin tức hiển thị công khai (Landing Page)
router.get("/public", getPublicNews);

// GET /api/news/count-by-category - Lấy số lượng tin của từng danh mục
router.get("/count-by-category", getNewsCountByCategory);

// GET /api/news/:id - Xem chi tiết bài viết (Công khai cho mọi người)
router.get("/:id", getNewsById);

// GET /api/news - Lấy toàn bộ tin tức (Cán bộ: 3, Admin: 1)
router.get("/", protect, authorizeRoles(1, 3), getAllNews);

// POST /api/news - Tạo mới tin tức (Cán bộ: 3, Admin: 1)
router.post("/", protect, authorizeRoles(1, 3), createNews);

// PUT /api/news/:id - Cập nhật tin tức (Cán bộ: 3, Admin: 1)
router.put("/:id", protect, authorizeRoles(1, 3), updateNews);

// DELETE /api/news/:id - Xóa tin tức (Cán bộ: 3, Admin: 1)
router.delete("/:id", protect, authorizeRoles(1, 3), deleteNews);

// PUT /api/news/:id/status - Cập nhật trạng thái hiển thị (Cán bộ: 3, Admin: 1)
router.put("/:id/status", protect, authorizeRoles(1, 3), updateNewsStatus);

export default router;
