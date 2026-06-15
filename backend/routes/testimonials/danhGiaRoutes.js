import express from "express";
import {
  createDanhGia,
  getLandingDanhGia,
  getPublicDanhGia,
  getQuanLyDanhGia,
  updateNoiBatDanhGia,
  updateTrangThaiDanhGia,
} from "../../controllers/testimonials/danhGiaController.js";
import { optionalProtect, protect } from "../../middleware/authMiddleware.js";
import { authorizeRoles } from "../../middleware/rolesMiddleware.js";

const router = express.Router();

router.get("/landing", getLandingDanhGia);
router.get("/quan-ly", protect, authorizeRoles(1, 3), getQuanLyDanhGia);
router.get("/", getPublicDanhGia);
router.post("/", optionalProtect, createDanhGia);
router.patch("/:id/trangthai", protect, authorizeRoles(1, 3), updateTrangThaiDanhGia);
router.patch("/:id/noi-bat", protect, authorizeRoles(1, 3), updateNoiBatDanhGia);

export default router;
