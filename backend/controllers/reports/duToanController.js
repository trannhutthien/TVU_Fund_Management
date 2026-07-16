import DuToanModel from "../../models/reports/DuToanModel.js";

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/du-toan
// MỤC ĐÍCH: Kế toán đề xuất dự toán chi bộ máy hoạt động hàng năm
// ─────────────────────────────────────────────────────────────────────────────
export const proposeDuToan = async (req, res) => {
  try {
    const { namtaichinh, sotiendutoan, ghichu } = req.body;
    const nguoiDeXuatId = req.user.id;

    // Validation
    const yearNum = parseInt(namtaichinh, 10);
    const amountNum = parseFloat(sotiendutoan);

    if (Number.isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
      return res.status(400).json({
        success: false,
        message: "Năm tài chính không hợp lệ. Vui lòng nhập năm từ 2000 đến 2100."
      });
    }

    if (Number.isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({
        success: false,
        message: "Số tiền dự toán phải lớn hơn 0."
      });
    }

    const result = await DuToanModel.createRequest({
      namTaiChinh: yearNum,
      soTienDuToan: amountNum,
      ghiChu: ghichu,
      nguoiDeXuatId
    });

    return res.status(201).json({
      success: true,
      message: `Đề xuất dự toán năm ${yearNum} thành công`,
      data: {
        id: result.insertId,
        namtaichinh: yearNum,
        sotiendutoan: amountNum,
        trangthai: 'Cho duyet'
      }
    });

  } catch (error) {
    if (error.message === 'DUPLICATE_YEAR_BUDGET') {
      return res.status(400).json({
        success: false,
        message: `Năm ${req.body.namtaichinh} đã có dự toán, không thể tạo mới. Vui lòng sửa/hủy dự toán cũ trước.`
      });
    }
    console.error("Lỗi proposeDuToan:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau"
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/du-toan/:id
// MỤC ĐÍCH: Admin phê duyệt/từ chối dự toán chi bộ máy hoạt động hàng năm
// ─────────────────────────────────────────────────────────────────────────────
export const approveDuToan = async (req, res) => {
  try {
    const { id } = req.params;
    const { ketqua, lydotuchoi } = req.body;
    const nguoiDuyetId = req.user.id;

    if (!['Da duyet', 'Tu choi'].includes(ketqua)) {
      return res.status(400).json({
        success: false,
        message: "Kết quả phê duyệt không hợp lệ (chỉ chấp nhận 'Da duyet' hoặc 'Tu choi')"
      });
    }

    const budget = await DuToanModel.getRequestById(id);
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đề xuất dự toán yêu cầu"
      });
    }

    if (budget.trangthai !== 'Cho duyet') {
      return res.status(400).json({
        success: false,
        message: "Đề xuất dự toán này đã được xử lý trước đó, không thể thay đổi"
      });
    }

    let success = false;
    if (ketqua === 'Da duyet') {
      success = await DuToanModel.approveRequest(id, nguoiDuyetId);
    } else {
      success = await DuToanModel.rejectRequest(id, nguoiDuyetId, lydotuchoi);
    }

    if (!success) {
      return res.status(400).json({
        success: false,
        message: "Cập nhật trạng thái phê duyệt thất bại"
      });
    }

    return res.status(200).json({
      success: true,
      message: `Đã ${ketqua === 'Da duyet' ? 'phê duyệt' : 'từ chối'} đề xuất dự toán thành công`,
      data: {
        id: parseInt(id, 10),
        trangthai: ketqua
      }
    });

  } catch (error) {
    console.error("Lỗi approveDuToan:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau"
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/du-toan/:namtaichinh
// MỤC ĐÍCH: Xem dự toán theo năm tài chính + số đã chi lũy kế + số còn lại
// ─────────────────────────────────────────────────────────────────────────────
export const getDuToanByYear = async (req, res) => {
  try {
    const { namtaichinh } = req.params;
    const yearNum = parseInt(namtaichinh, 10);

    if (Number.isNaN(yearNum)) {
      return res.status(400).json({
        success: false,
        message: "Năm tài chính không hợp lệ"
      });
    }

    const budget = await DuToanModel.getByYear(yearNum);
    if (!budget) {
      return res.status(200).json({
        success: true,
        message: `Không tìm thấy dự toán cho năm ${yearNum}`,
        data: null
      });
    }

    const daChi = await DuToanModel.getAccumulatedExpense(yearNum);
    const soTienDuToan = parseFloat(budget.sotiendutoan || 0);
    const conLai = Math.max(0, soTienDuToan - daChi);

    return res.status(200).json({
      success: true,
      message: "Lấy thông tin dự toán thành công",
      data: {
        ...budget,
        daChi,
        conLai
      }
    });

  } catch (error) {
    console.error("Lỗi getDuToanByYear:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau"
    });
  }
};
