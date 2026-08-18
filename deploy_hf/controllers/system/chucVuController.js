import ChucVuModel from "../../models/system/ChucVuModel.js";

// ═══════════════════════════════════════════════════════════════════════════════
// ─── CHUC VU QUY CONTROLLER ────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// ─── GET /api/chuc-vu/public ───────────────────────────────────────────────────
// API công khai - Lấy danh sách chức vụ đang hiển thị
export const getPublicChucVu = async (req, res) => {
  try {
    const chucVuList = await ChucVuModel.getPublic();

    const grouped = {};
    for (const cv of chucVuList) {
      if (!grouped[cv.nhom]) {
        grouped[cv.nhom] = [];
      }
      grouped[cv.nhom].push({
        id: cv.chucvu_id,
        hoTen: cv.ten_hienthi,
        chucDanh: cv.chucdanh,
        nhom: cv.nhom,
        anh: cv.anh_hienthi,
        ngayBatDauNhiemKy: cv.ngaybatdaunhiemky,
        ngayKetThucNhiemKy: cv.ngayketthucnhiemky,
        moTa: cv.mota,
        thuTu: cv.thutu
      });
    }

    return res.status(200).json({
      success: true,
      data: grouped
    });
  } catch (error) {
    console.error("Lỗi getPublicChucVu:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

// ─── GET /api/chuc-vu ──────────────────────────────────────────────────────────
// Admin - Lấy tất cả chức vụ (có filter)
export const getAllChucVu = async (req, res) => {
  try {
    const { nhom, trangthai } = req.query;
    const filter = {};
    if (nhom) filter.nhom = nhom;
    if (trangthai) filter.trangthai = trangthai;

    const chucVuList = await ChucVuModel.getAll(filter);

    return res.status(200).json({
      success: true,
      total: chucVuList.length,
      data: chucVuList.map(cv => ({
        id: cv.chucvu_id,
        nguoiDungId: cv.nguoidung_id,
        hoTen: cv.ten_hienthi,
        chucDanh: cv.chucdanh,
        nhom: cv.nhom,
        anh: cv.anh_hienthi,
        ngayBatDauNhiemKy: cv.ngaybatdaunhiemky,
        ngayKetThucNhiemKy: cv.ngayketthucnhiemky,
        moTa: cv.mota,
        thuTu: cv.thutu,
        trangThai: cv.trangthai,
        ngayTao: cv.ngaytao,
        ngayCapNhat: cv.ngaycapnhat
      }))
    });
  } catch (error) {
    console.error("Lỗi getAllChucVu:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

// ─── GET /api/chuc-vu/:id ──────────────────────────────────────────────────────
// Admin - Lấy chi tiết 1 chức vụ
export const getChucVuById = async (req, res) => {
  try {
    const { id } = req.params;
    const chucVu = await ChucVuModel.getById(id);

    if (!chucVu) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy chức vụ",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: chucVu.chucvu_id,
        nguoiDungId: chucVu.nguoidung_id,
        hoTen: chucVu.ten_hienthi,
        chucDanh: chucVu.chucdanh,
        nhom: chucVu.nhom,
        anh: chucVu.anh_hienthi,
        ngayBatDauNhiemKy: chucVu.ngaybatdaunhiemky,
        ngayKetThucNhiemKy: chucVu.ngayketthucnhiemky,
        moTa: chucVu.mota,
        thuTu: chucVu.thutu,
        trangThai: chucVu.trangthai,
        ngayTao: chucVu.ngaytao,
        ngayCapNhat: chucVu.ngaycapnhat
      }
    });
  } catch (error) {
    console.error("Lỗi getChucVuById:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

// ─── POST /api/chuc-vu ─────────────────────────────────────────────────────────
// Admin - Thêm chức vụ mới
export const createChucVu = async (req, res) => {
  try {
    const {
      nguoiDungId,
      hoTen,
      chucDanh,
      nhom,
      ngayBatDauNhiemKy,
      ngayKetThucNhiemKy,
      anh,
      moTa,
      thuTu
    } = req.body;

    if (!chucDanh || !nhom) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin: chức danh, nhóm",
      });
    }

    const validNhom = ['Hoi dong quy', 'Ban dieu hanh', 'Ban kiem soat', 'Van phong thuong truc'];
    if (!validNhom.includes(nhom)) {
      return res.status(400).json({
        success: false,
        message: "Nhóm không hợp lệ. Chỉ chấp nhận: Hội đồng Quỹ, Ban điều hành, Ban kiểm soát, Văn phòng thường trực",
      });
    }

    const result = await ChucVuModel.create({
      nguoidungId: nguoiDungId || null,
      hoten: hoTen || null,
      chucdanh: chucDanh.trim(),
      nhom,
      ngayBatDauNhiemKy: ngayBatDauNhiemKy || null,
      ngayKetThucNhiemKy: ngayKetThucNhiemKy || null,
      anh: anh || null,
      mota: moTa || null,
      thutu: thuTu || 0
    });

    return res.status(201).json({
      success: true,
      message: "Thêm chức vụ thành công",
      data: { id: result.chucVuId }
    });
  } catch (error) {
    console.error("Lỗi createChucVu:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

// ─── PUT /api/chuc-vu/:id ──────────────────────────────────────────────────────
// Admin - Cập nhật chức vụ
export const updateChucVu = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await ChucVuModel.getById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy chức vụ",
      });
    }

    const {
      nguoiDungId,
      hoTen,
      chucDanh,
      nhom,
      ngayBatDauNhiemKy,
      ngayKetThucNhiemKy,
      anh,
      moTa,
      thuTu,
      trangThai
    } = req.body;

    if (nhom) {
      const validNhom = ['Hoi dong quy', 'Ban dieu hanh', 'Ban kiem soat', 'Van phong thuong truc'];
      if (!validNhom.includes(nhom)) {
        return res.status(400).json({
          success: false,
          message: "Nhóm không hợp lệ",
        });
      }
    }

    if (trangThai) {
      const validStatus = ['Dang nhiem', 'Het nhiem ky'];
      if (!validStatus.includes(trangThai)) {
        return res.status(400).json({
          success: false,
          message: "Trạng thái không hợp lệ",
        });
      }
    }

    const updateData = {};
    if (nguoiDungId !== undefined) updateData.nguoidung_id = nguoiDungId || null;
    if (hoTen !== undefined) updateData.hoten = hoTen || null;
    if (chucDanh !== undefined) updateData.chucdanh = chucDanh.trim();
    if (nhom !== undefined) updateData.nhom = nhom;
    if (ngayBatDauNhiemKy !== undefined) updateData.ngaybatdaunhiemky = ngayBatDauNhiemKy || null;
    if (ngayKetThucNhiemKy !== undefined) updateData.ngayketthucnhiemky = ngayKetThucNhiemKy || null;
    if (anh !== undefined) updateData.anh = anh || null;
    if (moTa !== undefined) updateData.mota = moTa || null;
    if (thuTu !== undefined) updateData.thutu = thuTu;
    if (trangThai !== undefined) updateData.trangthai = trangThai;

    const updated = await ChucVuModel.update(id, updateData);

    return res.status(200).json({
      success: true,
      message: "Cập nhật chức vụ thành công",
    });
  } catch (error) {
    console.error("Lỗi updateChucVu:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

// ─── DELETE /api/chuc-vu/:id ───────────────────────────────────────────────────
// Admin - Xóa mềm (chuyển trạng thái 'Het nhiem ky')
export const softDeleteChucVu = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await ChucVuModel.getById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy chức vụ",
      });
    }

    if (existing.trangthai === 'Het nhiem ky') {
      return res.status(400).json({
        success: false,
        message: "Chức vụ đã hết nhiệm kỳ",
      });
    }

    const deleted = await ChucVuModel.softDelete(id);

    return res.status(200).json({
      success: true,
      message: "Đã chuyển trạng thái chức vụ thành 'Hết nhiệm kỳ'",
    });
  } catch (error) {
    console.error("Lỗi softDeleteChucVu:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

// ─── PUT /api/chuc-vu/reorder ──────────────────────────────────────────────────
// Admin - Cập nhật thứ tự hàng loạt
export const updateThuTu = async (req, res) => {
  try {
    const { list } = req.body;

    if (!Array.isArray(list) || list.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Danh sách thứ tự không hợp lệ",
      });
    }

    for (const item of list) {
      if (!item.chucvu_id || item.thutu === undefined) {
        return res.status(400).json({
          success: false,
          message: "Mỗi phần tử phải có chucvu_id và thutu",
        });
      }
    }

    await ChucVuModel.updateThuTu(list);

    return res.status(200).json({
      success: true,
      message: "Cập nhật thứ tự thành công",
    });
  } catch (error) {
    console.error("Lỗi updateThuTu:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

export default {
  getPublicChucVu,
  getAllChucVu,
  getChucVuById,
  createChucVu,
  updateChucVu,
  softDeleteChucVu,
  updateThuTu
};
