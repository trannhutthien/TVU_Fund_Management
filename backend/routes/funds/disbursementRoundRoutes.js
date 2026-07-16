import express from "express";
import { getPublicRoundsByFund, getRoundsByFund, getRoundById, completeRound } from "../../controllers/funds/disbursementRoundController.js";
import { protect } from "../../middleware/authMiddleware.js";
import { authorizeRoles } from "../../middleware/rolesMiddleware.js";

const router = express.Router();

// GET /api/disbursement-rounds/public/fund/:quyId — PUBLIC (landing page)
router.get("/public/fund/:quyId", getPublicRoundsByFund);

// GET /api/disbursement-rounds/fund/:quyId — PROTECTED
router.get("/fund/:quyId", protect, authorizeRoles(1, 2, 3, 5), getRoundsByFund);

router.get("/:dotId", protect, authorizeRoles(1, 2, 3, 5), getRoundById);

// PUT /api/disbursement-rounds/:dotId/complete — Hoàn tất đợt
router.put("/:dotId/complete", protect, authorizeRoles(1), completeRound);

export default router;
