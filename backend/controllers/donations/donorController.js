import pool from "../../config/db.js";
import { buildDonorAvatarUrl } from "../../utils/helpers/imageHelper.js";
import DonorModel from "../../models/donations/DonorModel.js";

// ═══════════════════════════════════════════════════════════════════════════════
// ─── DONOR CONTROLLER (NHÀ TÀI TRỢ) ───────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/donors/wall
// CÔNG DỤNG: Lấy danh sách nhà tài trợ cho DonorWallSection với thông tin chi tiết
// Phân tier: Diamond (≥100M), Gold (50M-100M), Silver (<50M)
// ─────────────────────────────────────────────────────────────────────────────
export const getDonorWall = async (req, res) => {
  try {
    // Lấy danh sách nhà tài trợ với tổng đóng góp
    const [donors] = await pool.query(
      `SELECT 
        nt.nhataitro_id,
        nt.tennhataitro,
        nt.loainhataitro,
        COALESCE(nt.logo, nd.avatar) AS avatar,
        nd.email,
        nd.sodienthoai,
        COALESCE(SUM(CASE 
          WHEN kt.trangthai = 'Da nhan' 
          THEN kt.sotien 
          ELSE 0 
        END), 0) as tong_dong_gop,
        COUNT(DISTINCT CASE WHEN kt.trangthai = 'Da nhan' THEN kt.quy_id END) as so_quy_ho_tro
       FROM nhataitro nt
       LEFT JOIN nguoidung nd ON nt.nguoidung_id = nd.nguoidung_id
       LEFT JOIN khoantaitro kt ON nt.nhataitro_id = kt.nhataitro_id
       WHERE nt.trangthai = 'Hoat dong'
       GROUP BY nt.nhataitro_id, nt.tennhataitro, nt.loainhataitro, nt.logo, nd.avatar, nd.email, nd.sodienthoai
       HAVING tong_dong_gop > 0
       ORDER BY tong_dong_gop DESC`
    );

    // Lấy thông tin tên quỹ đã hỗ trợ cho từng nhà tài trợ
    const [fundsInfo] = await pool.query(
      `SELECT 
        kt.nhataitro_id,
        q.tenquy AS ten_quy,
        COUNT(DISTINCT kt.khoantaitro_id) as so_luong
       FROM khoantaitro kt
       INNER JOIN quy q ON kt.quy_id = q.quy_id
       WHERE kt.trangthai = 'Da nhan'
       GROUP BY kt.nhataitro_id, q.tenquy`
    );

    // Map funds info theo donor
    const fundsMap = {};
    fundsInfo.forEach(fund => {
      if (!fundsMap[fund.nhataitro_id]) {
        fundsMap[fund.nhataitro_id] = [];
      }
      fundsMap[fund.nhataitro_id].push({
        tenQuy: fund.ten_quy,
        soLuong: fund.so_luong
      });
    });

    // Trả về flat list, sắp xếp theo tổng đóng góp giảm dần
    const donorsList = donors.map(donor => ({
      id: donor.nhataitro_id,
      ten: donor.tennhataitro,
      loai: donor.loainhataitro,
      email: donor.email,
      phone: donor.sodienthoai,
      totalAmount: parseFloat(donor.tong_dong_gop),
      soQuyHoTro: donor.so_quy_ho_tro,
      cacQuyHoTro: fundsMap[donor.nhataitro_id] || [],
      logo: buildDonorAvatarUrl(donor.avatar),
    }));

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách nhà tài trợ thành công",
      data: {
        donors: donorsList,
        total: donors.length
      }
    });

  } catch (error) {
    console.error("Lỗi getDonorWall:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách nhà tài trợ",
      error: error.message
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── GET /api/donors (CHO CÁN BỘ QUỸ - YÊU CẦU TOKEN) ─────────────────────────
// CÔNG DỤNG: Danh sách nhà tài trợ + thống kê đóng góp + phân trang/lọc/sort
// QUERY: ?keyword=&loai=&sort_by=&page=&page_size=
// ═══════════════════════════════════════════════════════════════════════════════
export const getStaffDonors = async (req, res) => {
  try {
    const {
      keyword = '',
      loai = '',
      sort_by = 'tong_tai_tro_desc',
      page = 1,
      page_size = 12,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(page_size, 10) || 12));

    const { rows, total } = await DonorModel.getStaffList({
      keyword: String(keyword).trim(),
      loai: String(loai).trim(),
      sortBy: String(sort_by).trim(),
      page: pageNum,
      pageSize,
    });

    const data = rows.map((r) => ({
      nha_tai_tro_id: r.nhataitro_id,
      ten_nha_tai_tro: r.tennhataitro,
      loai: r.loainhataitro,
      created_at: r.ngaytao,
      ho_ten: r.hoten,
      email: r.email,
      so_dien_thoai: r.sodienthoai,
      dia_chi: r.diachi,
      website: r.website,
      mota: r.mota,
      trangthai: r.trangthai,
      nguoidung_id: r.nguoidung_id,
      avatar: buildDonorAvatarUrl(r.avatar),
      tong_da_dong_gop: Number(r.tong_da_dong_gop) || 0,
      so_khoan: Number(r.so_khoan) || 0,
      lan_cuoi: r.lan_cuoi,
    }));

    return res.status(200).json({
      success: true,
      data,
      pagination: {
        page: pageNum,
        page_size: pageSize,
        total,
        total_pages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Lỗi getStaffDonors:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách nhà tài trợ",
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── GET /api/donors/stats (CHO CÁN BỘ QUỸ) ───────────────────────────────────
// CÔNG DỤNG: 4 thẻ thống kê (tổng NTT, tổng đã đóng góp, tháng này, chờ duyệt)
// ═══════════════════════════════════════════════════════════════════════════════
export const getDonorStats = async (_req, res) => {
  try {
    const stats = await DonorModel.getStats();
    return res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error("Lỗi getDonorStats:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy thống kê nhà tài trợ",
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── GET /api/donors/:id (CHO CÁN BỘ QUỸ) ─────────────────────────────────────
// CÔNG DỤNG: Chi tiết 1 nhà tài trợ + lịch sử các khoản tài trợ
// ═══════════════════════════════════════════════════════════════════════════════
export const getDonorDetail = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ success: false, message: "ID không hợp lệ" });
    }

    const donor = await DonorModel.getDonorWithStats(id);
    if (!donor) {
      return res.status(404).json({ success: false, message: "Không tìm thấy nhà tài trợ" });
    }
    const history = await DonorModel.getDonationHistory(id);

    return res.status(200).json({
      success: true,
      data: {
        nha_tai_tro_id: donor.nhataitro_id,
        ten_nha_tai_tro: donor.tennhataitro,
        loai: donor.loainhataitro,
        created_at: donor.ngaytao,
        ho_ten: donor.hoten,
        email: donor.email,
        so_dien_thoai: donor.sodienthoai,
        dia_chi: donor.diachi,
        website: donor.website,
        mota: donor.mota,
        trangthai: donor.trangthai,
        nguoidung_id: donor.nguoidung_id,
        avatar: buildDonorAvatarUrl(donor.avatar),
        tong_da_dong_gop: Number(donor.tong_da_dong_gop) || 0,
        so_khoan: Number(donor.so_khoan) || 0,
        lan_cuoi: donor.lan_cuoi,
        lich_su: history.map((h) => ({
          khoan_tai_tro_id: h.khoantaitro_id,
          so_tien: Number(h.sotien) || 0,
          trang_thai: h.trangthai,
          ngay_tai_tro: h.ngaytaitro,
          ghi_chu: h.ghichu,
          hinh_anh_minh_chung: h.chungtu,
          quy_id: h.quy_id,
          ten_quy: h.tenquy,
        })),
      },
    });
  } catch (error) {
    console.error("Lỗi getDonorDetail:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy chi tiết nhà tài trợ",
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── GET /api/donors/public/:id (PUBLIC - KHÔNG CẦN TOKEN) ────────────────────
// CÔNG DỤNG: Chi tiết 1 nhà tài trợ public (đã lọc bỏ thông tin nhạy cảm) + lịch sử đóng góp đã duyệt
// ═══════════════════════════════════════════════════════════════════════════════
export const getPublicDonorDetail = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ success: false, message: "ID không hợp lệ" });
    }

    const donor = await DonorModel.getDonorWithStats(id);
    if (!donor) {
      return res.status(404).json({ success: false, message: "Không tìm thấy nhà tài trợ" });
    }
    const history = await DonorModel.getDonationHistory(id);

    // Lọc lịch sử đóng góp: chỉ lấy các khoản đã được phê duyệt thành công ("Da nhan")
    const publicHistory = history.filter((h) => h.trangthai === 'Da nhan');

    return res.status(200).json({
      success: true,
      data: {
        nha_tai_tro_id: donor.nhataitro_id,
        ten_nha_tai_tro: donor.tennhataitro,
        loai: donor.loainhataitro,
        created_at: donor.ngaytao,
        website: donor.website,
        mota: donor.mota,
        avatar: buildDonorAvatarUrl(donor.avatar),
        trangthai: donor.trangthai,
        tong_da_dong_gop: Number(donor.tong_da_dong_gop) || 0,
        so_khoan: publicHistory.length,
        lan_cuoi: donor.lan_cuoi,
        lich_su: publicHistory.map((h) => ({
          khoan_tai_tro_id: h.khoantaitro_id,
          so_tien: Number(h.sotien) || 0,
          trang_thai: h.trangthai,
          ngay_tai_tro: h.ngaytaitro,
          ghi_chu: h.ghichu,
          quy_id: h.quy_id,
          ten_quy: h.tenquy,
        })),
      },
    });
  } catch (error) {
    console.error("Lỗi getPublicDonorDetail:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy chi tiết nhà tài trợ công khai",
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── DONOR USER APIs (NHÀ TÀI TRỢ XEM PROFILE CỦA MÌNH) ───────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/donors/my-stats
// CÔNG DỤNG: Lấy thống kê tổng quan của nhà tài trợ hiện tại (dùng cho DonorProfile)
// YÊU CẦU: Token hợp lệ, user có role NHA_TAI_TRO
// ─────────────────────────────────────────────────────────────────────────────
export const getMyDonorStats = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Chưa đăng nhập" });
    }

    // Lấy thông tin donor từ nguoidung_id
    const donor = await DonorModel.getDonorByNguoiDungId(userId);
    if (!donor) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin nhà tài trợ"
      });
    }

    // Lấy thống kê
    const stats = await DonorModel.getMyStats(donor.nhataitro_id);

    return res.status(200).json({
      success: true,
      data: {
        tongSoTien: stats.tongSoTien,
        soLanQuyenGop: stats.soLanQuyenGop,
        soQuyDaHoTro: stats.soQuyDaHoTro,
        khoanTaiTroGanNhat: stats.khoanTaiTroGanNhat ? {
          khoanTaiTroId: stats.khoanTaiTroGanNhat.khoantaitro_id,
          soTien: Number(stats.khoanTaiTroGanNhat.sotien) || 0,
          ngayTaiTro: stats.khoanTaiTroGanNhat.ngaytaitro,
          trangThai: stats.khoanTaiTroGanNhat.trangthai,
          quyId: stats.khoanTaiTroGanNhat.quy_id,
          tenQuy: stats.khoanTaiTroGanNhat.tenquy
        } : null
      }
    });
  } catch (error) {
    console.error("Lỗi getMyDonorStats:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy thống kê nhà tài trợ"
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/donors/my-donations
// CÔNG DỤNG: Lấy danh sách các khoản quyên góp của nhà tài trợ hiện tại
// YÊU CẦU: Token hợp lệ, user có role NHA_TAI_TRO
// QUERY: ?page=1&page_size=10
// ─────────────────────────────────────────────────────────────────────────────
export const getMyDonations = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Chưa đăng nhập" });
    }

    // Lấy thông tin donor từ nguoidung_id
    const donor = await DonorModel.getDonorByNguoiDungId(userId);
    if (!donor) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin nhà tài trợ"
      });
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(req.query.page_size, 10) || 10));

    const { rows, total } = await DonorModel.getMyDonations(donor.nhataitro_id, {
      page,
      pageSize
    });

    const data = rows.map(r => ({
      khoanTaiTroId: r.khoantaitro_id,
      soTien: Number(r.sotien) || 0,
      hinhThuc: r.hinhthuc,
      trangThai: r.trangthai,
      ngayTaiTro: r.ngaytaitro,
      ghiChu: r.ghichu,
      chungTu: r.chungtu,
      nguoiXacNhanId: r.nguoixacnhan_id,
      quyId: r.quy_id,
      tenQuy: r.tenquy,
      loaiQuy: r.loai_quy
    }));

    return res.status(200).json({
      success: true,
      data,
      pagination: {
        page,
        page_size: pageSize,
        total,
        total_pages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    console.error("Lỗi getMyDonations:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách quyên góp"
    });
  }
};

export default {
  getDonorWall,
  getStaffDonors,
  getDonorStats,
  getDonorDetail,
  // Thêm APIs mới cho donor user
  getMyDonorStats,
  getMyDonations,
};
