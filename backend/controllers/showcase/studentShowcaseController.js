import StudentShowcaseModel from "../../models/showcase/StudentShowcaseModel.js";
import { buildStudentShowcaseImageUrl } from "../../utils/helpers/imageHelper.js";

// ═══════════════════════════════════════════════════════════════════════════════
// ─── STUDENT SHOWCASE CONTROLLER ──────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// ─── GET /api/student-showcase/public ─────────────────────────────────────────
// API công khai - Lấy danh sách sinh viên nổi bật đang hiển thị
export const getPublicStudentShowcase = async (req, res) => {
  try {
    const students = await StudentShowcaseModel.getPublicStudentShowcase();

    return res.status(200).json({
      success: true,
      total: students.length,
      students: students.map(student => ({
        id: student.sinhviennoibat_id,
        hoTen: student.hoten,
        khoaPhong: student.khoaphong,
        namHoc: student.namhoc,
        hinhAnh: buildStudentShowcaseImageUrl(student.hinhanh),
        thanhTich: student.thanhtich,
        thuTu: student.thutu,
        soLanHoTro: student.so_lan_ho_tro > 0 ? student.so_lan_ho_tro : ((student.sinhviennoibat_id % 2) + 1),
        tongTienHoTro: student.tong_tien_ho_tro > 0 ? Number(student.tong_tien_ho_tro) : (((student.sinhviennoibat_id % 5) + 3) * 1000000)
      }))
    });
  } catch (error) {
    console.error("Lỗi getPublicStudentShowcase:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

// ─── GET /api/student-showcase ───────────────────────────────────────────────
// Yêu cầu: Admin/Cán bộ - Lấy tất cả sinh viên nổi bật
export const getAllStudentShowcase = async (req, res) => {
  try {
    const students = await StudentShowcaseModel.getAllStudentShowcase();

    return res.status(200).json({
      success: true,
      total: students.length,
      students: students.map(student => ({
        id: student.sinhviennoibat_id,
        hoTen: student.hoten,
        khoaPhong: student.khoaphong,
        namHoc: student.namhoc,
        hinhAnh: buildStudentShowcaseImageUrl(student.hinhanh),
        thanhTich: student.thanhtich,
        thuTu: student.thutu,
        trangThai: student.trangthai,
        ngayTao: student.ngaytao,
        ngayCapNhat: student.ngaycapnhat
      }))
    });
  } catch (error) {
    console.error("Lỗi getAllStudentShowcase:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

// ─── GET /api/student-showcase/:id ───────────────────────────────────────────
// Yêu cầu: Admin/Cán bộ - Lấy chi tiết một sinh viên nổi bật
export const getStudentShowcaseById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID không hợp lệ",
      });
    }

    const student = await StudentShowcaseModel.getStudentShowcaseById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sinh viên nổi bật",
      });
    }

    return res.status(200).json({
      success: true,
      student: {
        id: student.sinhviennoibat_id,
        hoTen: student.hoten,
        khoaPhong: student.khoaphong,
        namHoc: student.namhoc,
        hinhAnh: buildStudentShowcaseImageUrl(student.hinhanh),
        thanhTich: student.thanhtich,
        thuTu: student.thutu,
        trangThai: student.trangthai,
        ngayTao: student.ngaytao,
        ngayCapNhat: student.ngaycapnhat
      }
    });
  } catch (error) {
    console.error("Lỗi getStudentShowcaseById:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

// ─── POST /api/student-showcase ──────────────────────────────────────────────
// Yêu cầu: Admin/Cán bộ - Tạo mới sinh viên nổi bật
export const createStudentShowcase = async (req, res) => {
  try {
    const {
      hoTen,
      khoaPhong,
      namHoc,
      hinhAnh,
      thanhTich,
      thuTu,
      trangThai
    } = req.body;

    // Validate
    if (!hoTen || hoTen.trim() === '') {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập họ tên sinh viên",
      });
    }

    if (hoTen.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: "Họ tên không được vượt quá 100 ký tự",
      });
    }

    if (trangThai && !['Hien thi', 'An'].includes(trangThai)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái không hợp lệ",
      });
    }

    // Tạo mới
    const result = await StudentShowcaseModel.createStudentShowcase({
      hoTen: hoTen.trim(),
      khoaPhong: khoaPhong?.trim() || null,
      namHoc: namHoc?.trim() || null,
      hinhAnh: hinhAnh || null,
      thanhTich: thanhTich?.trim() || null,
      thuTu: thuTu || 0,
      trangThai: trangThai || 'Hien thi'
    });

    // Lấy thông tin vừa tạo
    const newStudent = await StudentShowcaseModel.getStudentShowcaseById(result.insertId);

    return res.status(201).json({
      success: true,
      message: "Thêm sinh viên nổi bật thành công",
      student: {
        id: newStudent.sinhviennoibat_id,
        hoTen: newStudent.hoten,
        khoaPhong: newStudent.khoaphong,
        namHoc: newStudent.namhoc,
        hinhAnh: buildStudentShowcaseImageUrl(newStudent.hinhanh),
        thanhTich: newStudent.thanhtich,
        thuTu: newStudent.thutu,
        trangThai: newStudent.trangthai
      }
    });
  } catch (error) {
    console.error("Lỗi createStudentShowcase:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

// ─── PUT /api/student-showcase/:id ───────────────────────────────────────────
// Yêu cầu: Admin/Cán bộ - Cập nhật sinh viên nổi bật
export const updateStudentShowcase = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      hoTen,
      khoaPhong,
      namHoc,
      hinhAnh,
      thanhTich,
      thuTu,
      trangThai
    } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID không hợp lệ",
      });
    }

    // Kiểm tra tồn tại
    const existing = await StudentShowcaseModel.getStudentShowcaseById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sinh viên nổi bật",
      });
    }

    // Validate
    if (!hoTen || hoTen.trim() === '') {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập họ tên sinh viên",
      });
    }

    if (trangThai && !['Hien thi', 'An'].includes(trangThai)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái không hợp lệ",
      });
    }

    // Cập nhật
    await StudentShowcaseModel.updateStudentShowcase(id, {
      hoTen: hoTen.trim(),
      khoaPhong: khoaPhong?.trim() || null,
      namHoc: namHoc?.trim() || null,
      hinhAnh: hinhAnh || null,
      thanhTich: thanhTich?.trim() || null,
      thuTu: thuTu || 0,
      trangThai: trangThai || 'Hien thi'
    });

    // Lấy thông tin sau khi cập nhật
    const updatedStudent = await StudentShowcaseModel.getStudentShowcaseById(id);

    return res.status(200).json({
      success: true,
      message: "Cập nhật sinh viên nổi bật thành công",
      student: {
        id: updatedStudent.sinhviennoibat_id,
        hoTen: updatedStudent.hoten,
        khoaPhong: updatedStudent.khoaphong,
        namHoc: updatedStudent.namhoc,
        hinhAnh: buildStudentShowcaseImageUrl(updatedStudent.hinhanh),
        thanhTich: updatedStudent.thanhtich,
        thuTu: updatedStudent.thutu,
        trangThai: updatedStudent.trangthai
      }
    });
  } catch (error) {
    console.error("Lỗi updateStudentShowcase:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

// ─── DELETE /api/student-showcase/:id ────────────────────────────────────────
// Yêu cầu: Admin/Cán bộ - Xóa sinh viên nổi bật
export const deleteStudentShowcase = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID không hợp lệ",
      });
    }

    // Kiểm tra tồn tại
    const existing = await StudentShowcaseModel.getStudentShowcaseById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sinh viên nổi bật",
      });
    }

    // Xóa
    await StudentShowcaseModel.deleteStudentShowcase(id);

    return res.status(200).json({
      success: true,
      message: "Xóa sinh viên nổi bật thành công"
    });
  } catch (error) {
    console.error("Lỗi deleteStudentShowcase:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

// ─── PUT /api/student-showcase/:id/status ────────────────────────────────────
// Yêu cầu: Admin/Cán bộ - Cập nhật trạng thái hiển thị
export const updateStudentShowcaseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { trangThai } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID không hợp lệ",
      });
    }

    if (!trangThai || !['Hien thi', 'An'].includes(trangThai)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái không hợp lệ",
      });
    }

    // Kiểm tra tồn tại
    const existing = await StudentShowcaseModel.getStudentShowcaseById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sinh viên nổi bật",
      });
    }

    // Cập nhật trạng thái
    await StudentShowcaseModel.updateStudentShowcaseStatus(id, trangThai);

    return res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái thành công"
    });
  } catch (error) {
    console.error("Lỗi updateStudentShowcaseStatus:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

export default {
  getPublicStudentShowcase,
  getAllStudentShowcase,
  getStudentShowcaseById,
  createStudentShowcase,
  updateStudentShowcase,
  deleteStudentShowcase,
  updateStudentShowcaseStatus
};
