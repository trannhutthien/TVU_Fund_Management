import DisbursementRoundModel from "../../models/funds/DisbursementRoundModel.js";

// GET /api/disbursement-rounds/public/fund/:quyId — PUBLIC (không cần auth)
export const getPublicRoundsByFund = async (req, res) => {
  try {
    const { quyId } = req.params;
    const rounds = await DisbursementRoundModel.getByFundId(quyId);
    return res.status(200).json({
      success: true,
      data: rounds
    });
  } catch (error) {
    console.error("Lỗi getPublicRoundsByFund:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách đợt giải ngân",
      error: error.message
    });
  }
};

// GET /api/disbursement-rounds/fund/:quyId — PROTECTED
export const getRoundsByFund = async (req, res) => {
  try {
    const { quyId } = req.params;

    // Tự động cập nhật trạng thái đợt khi đến ngày
    await DisbursementRoundModel.autoUpdateRoundStatus(quyId);

    const rounds = await DisbursementRoundModel.getByFundId(quyId);
    return res.status(200).json({
      success: true,
      data: rounds
    });
  } catch (error) {
    console.error("Lỗi getRoundsByFund:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách đợt giải ngân",
      error: error.message
    });
  }
};

// GET /api/disbursement-rounds/:dotId
export const getRoundById = async (req, res) => {
  try {
    const { dotId } = req.params;
    const round = await DisbursementRoundModel.getById(dotId);
    if (!round) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đợt giải ngân"
      });
    }
    return res.status(200).json({
      success: true,
      data: round
    });
  } catch (error) {
    console.error("Lỗi getRoundById:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy thông tin đợt giải ngân",
      error: error.message
    });
  }
};

// PUT /api/disbursement-rounds/:dotId/complete
export const completeRound = async (req, res) => {
  try {
    const { dotId } = req.params;
    const round = await DisbursementRoundModel.getById(dotId);

    if (!round) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đợt giải ngân"
      });
    }

    if (round.trangthai === 'hoanthanh') {
      return res.status(400).json({
        success: false,
        message: "Đợt giải ngân đã hoàn tất trước đó"
      });
    }

    // Kiểm tra đủ tiền
    if (parseFloat(round.soDuQuy) < parseFloat(round.soTienDuKien)) {
      return res.status(400).json({
        success: false,
        message: `Chưa đủ tiền trong quỹ. Hiện có: ${Number(round.soDuQuy).toLocaleString('vi-VN')}đ, cần: ${Number(round.soTienDuKien).toLocaleString('vi-VN')}đ`
      });
    }

    await DisbursementRoundModel.updateStatus(dotId, 'hoanthanh', {
      ngayThucTe: new Date().toISOString().split('T')[0],
      soTienDaChi: round.soTienDaGiaiNgan || 0
    });

    // Kiểm tra nếu tất cả đợt đã hoàn tất → chuyển quỹ sang "Da dong"
    const allDone = await DisbursementRoundModel.allRoundsCompleted(round.quyId);
    if (allDone) {
      const { default: FundModel } = await import("../../models/funds/FundModel.js");
      await FundModel.updateFundStatus(round.quyId, 'Da dong');
    }

    return res.status(200).json({
      success: true,
      message: "Hoàn tất đợt giải ngân thành công",
      data: { allFundsCompleted: allDone }
    });
  } catch (error) {
    console.error("Lỗi completeRound:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi hoàn tất đợt giải ngân",
      error: error.message
    });
  }
};

export default {
  getRoundsByFund,
  getRoundById,
  completeRound
};
