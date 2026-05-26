import pool from "../config/db.js";
import { buildDonorAvatarUrl } from "../utils/imageHelper.js";
import DonorModel from "../models/DonorModel.js";

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
        nt.nha_tai_tro_id,
        nt.ten_nha_tai_tro,
        nt.loai,
        nd.avatar,
        nd.email,
        nd.so_dien_thoai,
        COALESCE(SUM(CASE 
          WHEN kt.trang_thai = 'Da nhan' 
          THEN kt.so_tien 
          ELSE 0 
        END), 0) as tong_dong_gop,
        COUNT(DISTINCT kt.quy_id) as so_quy_ho_tro
       FROM nhataitro nt
       INNER JOIN nguoidung nd ON nt.user_id = nd.user_id
       LEFT JOIN khoantaitro kt ON nt.nha_tai_tro_id = kt.nha_tai_tro_id
       GROUP BY nt.nha_tai_tro_id, nt.ten_nha_tai_tro, nt.loai, nd.avatar, nd.email, nd.so_dien_thoai
       HAVING tong_dong_gop > 0
       ORDER BY tong_dong_gop DESC`
    );

    // Lấy thông tin các quỹ đã hỗ trợ cho từng nhà tài trợ
    const [fundsInfo] = await pool.query(
      `SELECT 
        kt.nha_tai_tro_id,
        q.loai_quy,
        COUNT(DISTINCT q.quy_id) as so_luong
       FROM khoantaitro kt
       INNER JOIN quy q ON kt.quy_id = q.quy_id
       WHERE kt.trang_thai = 'Da nhan'
       GROUP BY kt.nha_tai_tro_id, q.loai_quy`
    );

    // Map funds info theo donor
    const fundsMap = {};
    fundsInfo.forEach(fund => {
      if (!fundsMap[fund.nha_tai_tro_id]) {
        fundsMap[fund.nha_tai_tro_id] = [];
      }
      fundsMap[fund.nha_tai_tro_id].push({
        loaiQuy: fund.loai_quy,
        soLuong: fund.so_luong
      });
    });

    const DIAMOND_THRESHOLD = 100000000; // 100M
    const GOLD_THRESHOLD = 50000000;     // 50M
    
    const diamond = [];
    const gold = [];
    const silver = [];

    donors.forEach(donor => {
      const donorData = {
        id: donor.nha_tai_tro_id,
        ten: donor.ten_nha_tai_tro,
        tenHienThi: '',
        loai: donor.loai,
        moTa: null, // Bảng nhataitro không có cột mo_ta
        email: donor.email,
        phone: donor.so_dien_thoai,
        totalAmount: parseFloat(donor.tong_dong_gop),
        soQuyHoTro: donor.so_quy_ho_tro,
        cacQuyHoTro: fundsMap[donor.nha_tai_tro_id] || [],
        logo: buildDonorAvatarUrl(donor.avatar),
        quote: null
      };

      if (donorData.totalAmount >= DIAMOND_THRESHOLD) {
        donorData.tenHienThi = 'Đối tác Kim cương';
        diamond.push(donorData);
      } else if (donorData.totalAmount >= GOLD_THRESHOLD) {
        donorData.tenHienThi = 'Nhà tài trợ Vàng';
        gold.push(donorData);
      } else {
        donorData.tenHienThi = 'Nhà tài trợ Bạc';
        silver.push(donorData);
      }
    });

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách nhà tài trợ thành công",
      data: {
        diamond,
        gold,
        silver,
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

export default {
  getDonorWall,
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
      nha_tai_tro_id: r.nha_tai_tro_id,
      ten_nha_tai_tro: r.ten_nha_tai_tro,
      loai: r.loai,
      created_at: r.created_at,
      ho_ten: r.ho_ten,
      email: r.email,
      so_dien_thoai: r.so_dien_thoai,
      dia_chi: r.dia_chi,
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
        nha_tai_tro_id: donor.nha_tai_tro_id,
        ten_nha_tai_tro: donor.ten_nha_tai_tro,
        loai: donor.loai,
        created_at: donor.created_at,
        ho_ten: donor.ho_ten,
        email: donor.email,
        so_dien_thoai: donor.so_dien_thoai,
        dia_chi: donor.dia_chi,
        avatar: buildDonorAvatarUrl(donor.avatar),
        tong_da_dong_gop: Number(donor.tong_da_dong_gop) || 0,
        so_khoan: Number(donor.so_khoan) || 0,
        lan_cuoi: donor.lan_cuoi,
        lich_su: history.map((h) => ({
          khoan_tai_tro_id: h.khoan_tai_tro_id,
          so_tien: Number(h.so_tien) || 0,
          trang_thai: h.trang_thai,
          ngay_tai_tro: h.ngay_tai_tro,
          ghi_chu: h.ghi_chu,
          hinh_anh_minh_chung: h.hinh_anh_minh_chung,
          quy_id: h.quy_id,
          ten_quy: h.ten_quy,
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
