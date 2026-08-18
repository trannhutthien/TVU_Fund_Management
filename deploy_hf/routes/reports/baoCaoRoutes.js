import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import { xuatBaoCao } from "../../controllers/reports/baoCaoController.js";

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════════════════
// ─── BAO CAO ROUTES (XUẤT BÁO CÁO WORD/EXCEL) ─────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/bao-cao/xuat
// Xuất báo cáo dạng Word (.docx) hoặc Excel (.xlsx) theo bộ lọc
//
// Body:
//   - loai_bao_cao: 'thu_chi_tong_hop' | 'danh_sach_tai_tro' | 'danh_sach_thu_huong' | 'bao_cao_quy'
//   - quy_id: number | null (null = tất cả quỹ)
//   - tu_ngay: 'YYYY-MM-DD'
//   - den_ngay: 'YYYY-MM-DD'
//   - dinh_dang: 'docx' | 'xlsx'
//
// Response: file binary (Blob)
router.post("/xuat", protect, xuatBaoCao);

export default router;
