import DanhGiaModel from "../../models/testimonials/DanhGiaModel.js";
import { buildUserAvatarUrl } from "../../utils/helpers/imageHelper.js";

const VALID_STATUSES = ["Cho duyet", "Da duyet", "Tu choi"];

const trimOrNull = (value) => {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed || null;
};

const toBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    return ["1", "true", "yes", "on"].includes(value.toLowerCase());
  }
  return false;
};

const mapDanhGia = (row) => ({
  id: row.danhgia_id,
  danhGiaId: row.danhgia_id,
  nguoiDungId: row.nguoidung_id,
  hoTen: row.hoten,
  khoa: row.khoa,
  nienKhoa: row.nienkhoa,
  avatar: buildUserAvatarUrl(row.avatar),
  noiDung: row.noidung,
  trangThai: row.trangthai,
  lyDoTuChoi: row.lydotuchoi,
  nguoiDuyetId: row.nguoiduyet_id,
  nguoiDuyetHoTen: row.nguoiduyet_hoten,
  ngayDuyet: row.ngayduyet,
  noiBat: Boolean(row.noibat),
  noibat: Number(row.noibat || 0),
  thuTu: row.thutu || 0,
  ngayTao: row.ngaytao,
  ngayCapNhat: row.ngaycapnhat,
});

const getBodyField = (body, ...keys) => {
  for (const key of keys) {
    if (body[key] !== undefined) return body[key];
  }
  return undefined;
};

export const getLandingDanhGia = async (req, res) => {
  try {
    const rows = await DanhGiaModel.getLanding(6);

    return res.status(200).json({
      success: true,
      total: rows.length,
      danhgia: rows.map(mapDanhGia),
      testimonials: rows.map(mapDanhGia),
    });
  } catch (error) {
    console.error("Lỗi getLandingDanhGia:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

export const getPublicDanhGia = async (req, res) => {
  try {
    const { page, pageSize, page_size, khoa, keyword, search } = req.query;
    const result = await DanhGiaModel.getPublicList({
      page,
      pageSize: pageSize || page_size,
      khoa: trimOrNull(khoa) || "",
      keyword: trimOrNull(keyword || search) || "",
    });
    const khoaOptions = await DanhGiaModel.getKhoaOptions();

    return res.status(200).json({
      success: true,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: Math.ceil(result.total / result.pageSize) || 1,
      khoaOptions,
      danhgia: result.rows.map(mapDanhGia),
      testimonials: result.rows.map(mapDanhGia),
    });
  } catch (error) {
    console.error("Lỗi getPublicDanhGia:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

export const createDanhGia = async (req, res) => {
  try {
    const nguoiDungId = req.user?.id || null;
    const userProfile = nguoiDungId
      ? await DanhGiaModel.getUserProfile(nguoiDungId)
      : null;

    const hoTen = trimOrNull(
      getBodyField(req.body, "hoTen", "hoten", "ho_ten"),
    ) || trimOrNull(userProfile?.hoten);
    const khoa = trimOrNull(
      getBodyField(req.body, "khoa", "khoaPhong", "khoa_phong"),
    ) || trimOrNull(userProfile?.khoa);
    const nienKhoa = trimOrNull(
      getBodyField(req.body, "nienKhoa", "nienkhoa", "khoaHoc", "khoa_hoc"),
    );
    const avatar = trimOrNull(
      getBodyField(req.body, "avatar", "hinhAnh", "hinhanh"),
    ) || trimOrNull(userProfile?.avatar);
    const noiDung = trimOrNull(
      getBodyField(req.body, "noiDung", "noidung", "noi_dung"),
    );

    if (!hoTen) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập họ tên",
      });
    }

    if (hoTen.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Họ tên không được vượt quá 100 ký tự",
      });
    }

    if (!noiDung) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập nội dung cảm nhận",
      });
    }

    if (noiDung.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Nội dung cảm nhận không được vượt quá 500 ký tự",
      });
    }

    if (khoa && khoa.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Tên khoa không được vượt quá 100 ký tự",
      });
    }

    if (nienKhoa && nienKhoa.length > 20) {
      return res.status(400).json({
        success: false,
        message: "Niên khóa không được vượt quá 20 ký tự",
      });
    }

    const result = await DanhGiaModel.create({
      nguoiDungId,
      hoTen,
      khoa,
      nienKhoa,
      avatar,
      noiDung,
    });

    const created = await DanhGiaModel.getById(result.insertId);

    return res.status(201).json({
      success: true,
      message: "Cảm nhận của bạn đã được gửi và đang chờ kiểm duyệt. Xin cảm ơn!",
      danhGia: mapDanhGia(created),
    });
  } catch (error) {
    console.error("Lỗi createDanhGia:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

export const getQuanLyDanhGia = async (req, res) => {
  try {
    const { page, pageSize, page_size, trangThai, trangthai } = req.query;
    const filterStatus = trimOrNull(trangThai || trangthai) || "";

    if (filterStatus && !VALID_STATUSES.includes(filterStatus)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái không hợp lệ",
      });
    }

    const [result, counts] = await Promise.all([
      DanhGiaModel.getManagementList({
        page,
        pageSize: pageSize || page_size,
        trangThai: filterStatus,
      }),
      DanhGiaModel.getStatusCounts(),
    ]);

    return res.status(200).json({
      success: true,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: Math.ceil(result.total / result.pageSize) || 1,
      counts,
      danhgia: result.rows.map(mapDanhGia),
      testimonials: result.rows.map(mapDanhGia),
    });
  } catch (error) {
    console.error("Lỗi getQuanLyDanhGia:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

export const updateTrangThaiDanhGia = async (req, res) => {
  try {
    const { id } = req.params;
    const trangThai = trimOrNull(
      getBodyField(req.body, "trangThai", "trangthai", "trang_thai"),
    );
    const lyDoTuChoi = trimOrNull(
      getBodyField(req.body, "lyDoTuChoi", "lydotuchoi", "ly_do_tu_choi"),
    );

    if (!id || Number.isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: "ID đánh giá không hợp lệ",
      });
    }

    if (!VALID_STATUSES.includes(trangThai)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái không hợp lệ",
      });
    }

    if (trangThai === "Tu choi" && !lyDoTuChoi) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập lý do từ chối",
      });
    }

    const existing = await DanhGiaModel.getById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy cảm nhận",
      });
    }

    await DanhGiaModel.updateStatus(id, {
      trangThai,
      lyDoTuChoi,
      nguoiDuyetId: req.user?.id || null,
    });

    const updated = await DanhGiaModel.getById(id);

    return res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái cảm nhận thành công",
      danhGia: mapDanhGia(updated),
    });
  } catch (error) {
    console.error("Lỗi updateTrangThaiDanhGia:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

export const updateNoiBatDanhGia = async (req, res) => {
  try {
    const { id } = req.params;
    const noiBatValue = getBodyField(req.body, "noiBat", "noibat", "la_noi_bat");
    const thuTu = getBodyField(req.body, "thuTu", "thutu");
    const noiBat = toBoolean(noiBatValue);

    if (!id || Number.isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: "ID đánh giá không hợp lệ",
      });
    }

    const existing = await DanhGiaModel.getById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy cảm nhận",
      });
    }

    if (noiBat && existing.trangthai !== "Da duyet") {
      return res.status(400).json({
        success: false,
        message: "Chỉ cảm nhận đã duyệt mới được đặt nổi bật",
      });
    }

    await DanhGiaModel.updateNoiBat(id, {
      noiBat,
      thuTu,
    });

    const updated = await DanhGiaModel.getById(id);

    return res.status(200).json({
      success: true,
      message: "Cập nhật nổi bật thành công",
      danhGia: mapDanhGia(updated),
    });
  } catch (error) {
    console.error("Lỗi updateNoiBatDanhGia:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

export default {
  getLandingDanhGia,
  getPublicDanhGia,
  createDanhGia,
  getQuanLyDanhGia,
  updateTrangThaiDanhGia,
  updateNoiBatDanhGia,
};
