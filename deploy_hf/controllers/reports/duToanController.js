import DuToanModel from "../../models/reports/DuToanModel.js";

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/du-toan
// MỤC ĐÍCH: Kế toán đề xuất dự toán
// ─────────────────────────────────────────────────────────────────────────────
export const proposeDuToan = async (req, res) => {
  try {
    const { namtaichinh, sotiendutoan, ghichu, lyDoDeXuat, fileMinhChung, chiTiet } = req.body;
    const nguoiDeXuatId = req.body.nguoiDeXuatId || req.user?.id;

    const yearNum = parseInt(namtaichinh, 10);
    const amountNum = parseFloat(sotiendutoan);

    if (Number.isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
      return res.status(400).json({
        success: false,
        message: "Nam tai chinh khong hop le. Vui long nhap nam tu 2000 den 2100."
      });
    }

    if (Number.isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({
        success: false,
        message: "So tien du toan phai lon hon 0."
      });
    }

    // Neu co chi tiet, tinh tong tu chi tiet
    let finalAmount = amountNum;
    if (chiTiet && Array.isArray(chiTiet) && chiTiet.length > 0) {
      finalAmount = chiTiet.reduce((sum, item) => sum + parseFloat(item.sotiendutoan || 0), 0);
      if (finalAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Tong tien chi tiet phai lon hon 0."
        });
      }
    }

    const result = await DuToanModel.createRequest({
      namTaiChinh: yearNum,
      soTienDuToan: finalAmount,
      ghiChu: ghichu,
      nguoiDeXuatId,
      lyDoDeXuat,
      fileMinhChung,
      chiTiet
    });

    return res.status(201).json({
      success: true,
      message: `De xuat du toan nam ${yearNum} thanh cong`,
      data: {
        id: result.insertId,
        namtaichinh: yearNum,
        sotiendutoan: finalAmount,
        trangthai_tong: 'Cho duyet'
      }
    });

  } catch (error) {
    if (error.message === 'DUPLICATE_YEAR_BUDGET') {
      return res.status(400).json({
        success: false,
        message: `Nam ${req.body.namtaichinh} da co du toan, khong the tao moi. Vui long sua/huy du toan cu truoc.`
      });
    }
    console.error("Loi proposeDuToan:", error);
    return res.status(500).json({
      success: false,
      message: "Loi server, vui long thu lai sau"
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/du-toan/:id/approve
// MỤC ĐÍCH: Duyệt/từ chối dự toán ở 1 cấp
// ─────────────────────────────────────────────────────────────────────────────
export const approveLevel = async (req, res) => {
  try {
    const { id } = req.params;
    const { capduyet, ketqua, lydotuchoi } = req.body;
    const nguoiDuyetId = req.user?.id || req.body.nguoiDuyetId;

    const capNum = parseInt(capduyet, 10);
    if (![1, 2].includes(capNum)) {
      return res.status(400).json({
        success: false,
        message: "Cap duyet khong hop le (chi chap nhan 1 hoac 2)"
      });
    }

    if (!['Da duyet', 'Tu choi'].includes(ketqua)) {
      return res.status(400).json({
        success: false,
        message: "Ket qua phe duyet khong hop le"
      });
    }

    // Kiem tra quyen theo cap duyet
    const vaiTro = req.user?.vaiTro || req.body.vaiTro;
    if (capNum === 1 && ![1, 5].includes(vaiTro)) {
      return res.status(403).json({
        success: false,
        message: "Chi Admin hoac Ban Kiem soat moi co quyen duyet cap Hoi dong Quy"
      });
    }
    if (capNum === 2 && vaiTro !== 1) {
      return res.status(403).json({
        success: false,
        message: "Chi Admin moi co quyen duyet cap Hieu truong"
      });
    }

    // Kiem tra du toan ton tai
    const budget = await DuToanModel.getRequestById(id);
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Khong tim thay de xuat du toan"
      });
    }

    const currentStatus = capNum === 1 ? budget.hoidong_trangthai : budget.hieutruong_trangthai;
    if (currentStatus !== 'Cho duyet') {
      return res.status(400).json({
        success: false,
        message: `Cap duyet ${capNum === 1 ? 'Hoi dong Quy' : 'Hieu truong'} da duoc xu ly truoc do`
      });
    }

    let success = false;
    if (ketqua === 'Da duyet') {
      success = await DuToanModel.approveLevel(id, capNum, nguoiDuyetId);
    } else {
      success = await DuToanModel.rejectLevel(id, capNum, nguoiDuyetId, lydotuchoi);
    }

    if (!success) {
      return res.status(400).json({
        success: false,
        message: "Cap nhat trang thai phe duyet that bai"
      });
    }

    return res.status(200).json({
      success: true,
      message: `Da ${ketqua === 'Da duyet' ? 'phe duyet' : 'tu choi'} cap ${capNum === 1 ? 'Hoi dong Quy' : 'Hieu truong'} thanh cong`,
      data: {
        id: parseInt(id, 10),
        capduyet: capNum,
        ketqua
      }
    });

  } catch (error) {
    console.error("Loi approveLevel:", error);
    return res.status(500).json({
      success: false,
      message: "Loi server, vui long thu lai sau"
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/du-toan/thong-ke-nam-truoc/:nam
// MỤC ĐÍCH: Lay thong ke nam truoc de hien thi khi tao du toan moi
// ─────────────────────────────────────────────────────────────────────────────
export const getPreviousYearStats = async (req, res) => {
  try {
    const { nam } = req.params;
    const yearNum = parseInt(nam, 10);

    if (Number.isNaN(yearNum) || yearNum < 2001 || yearNum > 2100) {
      return res.status(400).json({
        success: false,
        message: "Nam khong hop le"
      });
    }

    const stats = await DuToanModel.getPreviousYearStats(yearNum);
    return res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error("Loi getPreviousYearStats:", error);
    return res.status(500).json({
      success: false,
      message: "Loi server, vui long thu lai sau"
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/du-toan/chi-tiet/:id
// MỤC ĐÍCH: Lay chi tiet khoan chi cua 1 du toan
// ─────────────────────────────────────────────────────────────────────────────
export const getChiTiet = async (req, res) => {
  try {
    const { id } = req.params;
    const chiTiet = await DuToanModel.getChiTiet(id);
    return res.status(200).json({
      success: true,
      data: chiTiet
    });

  } catch (error) {
    console.error("Loi getChiTiet:", error);
    return res.status(500).json({
      success: false,
      message: "Loi server, vui long thu lai sau"
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/du-toan
// MỤC ĐÍCH: Lấy danh sách tất cả dự toán
// ─────────────────────────────────────────────────────────────────────────────
export const getAllDuToan = async (req, res) => {
  try {
    const list = await DuToanModel.getAll();
    return res.status(200).json({
      success: true,
      data: list
    });
  } catch (error) {
    console.error("Loi getAllDuToan:", error);
    return res.status(500).json({
      success: false,
      message: "Loi server, vui long thu lai sau"
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/du-toan/:namtaichinh
// MỤC ĐÍCH: Xem dự toán theo năm
// ─────────────────────────────────────────────────────────────────────────────
export const getDuToanByYear = async (req, res) => {
  try {
    const { namtaichinh } = req.params;
    const yearNum = parseInt(namtaichinh, 10);

    if (Number.isNaN(yearNum)) {
      return res.status(400).json({
        success: false,
        message: "Nam tai chinh khong hop le"
      });
    }

    const budget = await DuToanModel.getByYear(yearNum);
    if (!budget) {
      return res.status(200).json({
        success: true,
        message: `Khong tim thay du toan cho nam ${yearNum}`,
        data: null
      });
    }

    const chiTiet = await DuToanModel.getChiTiet(budget.dutoanhangnam_id);
    const daChi = await DuToanModel.getAccumulatedExpense(yearNum);
    const soTienDuToan = parseFloat(budget.sotiendutoan || 0);
    const conLai = Math.max(0, soTienDuToan - daChi);

    return res.status(200).json({
      success: true,
      message: "Lay thong tin du toan thanh cong",
      data: {
        ...budget,
        chiTiet,
        daChi,
        conLai
      }
    });

  } catch (error) {
    console.error("Loi getDuToanByYear:", error);
    return res.status(500).json({
      success: false,
      message: "Loi server, vui long thu lai sau"
    });
  }
};
