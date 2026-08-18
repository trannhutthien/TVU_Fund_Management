import LoaiQuyModel from "../../models/funds/LoaiQuyModel.js";

// GET /api/loai-quy
export const getLoaiQuy = async (req, res) => {
  try {
    const list = await LoaiQuyModel.getAllLoaiQuy();
    return res.status(200).json({
      success: true,
      total: list.length,
      data: list.map(item => ({
        id: item.id,
        maLoai: item.ma_loai,
        tenLoai: item.ten_loai,
        nhom: item.nhom,
        ngayTao: item.ngay_tao
      }))
    });
  } catch (error) {
    console.error("Lỗi getLoaiQuy:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ khi lấy danh sách loại quỹ"
    });
  }
};

// GET /api/loai-quy/groups
export const getLoaiQuyGroups = async (req, res) => {
  try {
    const groups = await LoaiQuyModel.getLoaiQuyGroups();
    return res.status(200).json({
      success: true,
      data: groups
    });
  } catch (error) {
    console.error("Lỗi getLoaiQuyGroups:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ khi lấy danh sách nhóm quỹ"
    });
  }
};

// POST /api/loai-quy
export const createLoaiQuy = async (req, res) => {
  try {
    const { maLoai, tenLoai } = req.body;

    if (!maLoai || maLoai.trim() === '') {
      return res.status(400).json({
        success: false,
        message: "Mã loại quỹ không được để trống"
      });
    }

    if (!tenLoai || tenLoai.trim() === '') {
      return res.status(400).json({
        success: false,
        message: "Tên loại quỹ không được để trống"
      });
    }

    const cleanMaLoai = maLoai.trim();
    const cleanTenLoai = tenLoai.trim();

    // Check unique maLoai
    const exists = await LoaiQuyModel.checkMaLoaiExists(cleanMaLoai);
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Mã loại quỹ này đã tồn tại"
      });
    }

    const result = await LoaiQuyModel.createLoaiQuy(cleanMaLoai, cleanTenLoai);

    return res.status(201).json({
      success: true,
      message: "Tạo loại quỹ mới thành công",
      data: {
        id: result.insertId,
        maLoai: cleanMaLoai,
        tenLoai: cleanTenLoai
      }
    });
  } catch (error) {
    console.error("Lỗi createLoaiQuy:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ khi tạo loại quỹ mới"
    });
  }
};
