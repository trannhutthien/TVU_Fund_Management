import pool from "../../config/db.js";
import fs from "fs/promises";
import path from "path";
import ExcelJS from "exceljs";
import { logSystemActivity } from "../../utils/helpers/loggerHelper.js";
import { buildUserAvatarUrl } from "../../utils/helpers/imageHelper.js";

const settingsPath = path.join(process.cwd(), "config/system_settings.json");

const DEFAULT_SETTINGS = {
  ten_he_thong: "TVU Fund Management",
  don_vi_quan_ly: "Phòng Công tác Sinh viên - Trường Đại học Trà Vinh",
  email_lien_he: "TVU@tvu.edu.vn",
  email_ho_tro: "phongctsv@tvu.edu.vn",
  so_dien_thoai: "0294.3855246",
  dia_chi_lien_he: "126 Nguyễn Thiện Thành, Khóm 4, Phường 5, TP. Trà Vinh",
  gio_lam_viec: "Thứ 2 - Thứ 6: 7:30 - 17:00",
  facebook_url: "https://www.facebook.com/dhtravinh",
  youtube_url: "https://www.youtube.com/@dhtravinh",
  linkedin_url: "https://www.linkedin.com/school/tra-vinh-university",
  tai_khoan_nhan_tai_tro: {
    ngan_hang: "VIETCOMBANK",
    chi_nhanh: "",
    so_tai_khoan: "1018899889",
    chu_tai_khoan: "TRUONG DAI HOC TRA VINH"
  },
  thoi_han_xu_ly_ngay: 5,
  so_cap_duyet: 2,
  ky_tu_ly_do_toi_thieu: 10,
  kich_thuoc_toi_da_mb: 5,
  so_file_toi_da: 5,
  dinh_dang_cho_phep: ["PDF", "JPG", "PNG", "DOC"],
  maintenanceMode: false,
  laisuatnganhangthamchieu: null,

  // ─── HERO BANNER ─────────────────────────────────────────────
  hero_badge: "Hỗ trợ sinh viên TVU",
  hero_title: "Quỹ phát triển Đại học Trà Vinh",
  hero_description: "Hệ thống quản lý quỹ học bổng hiện đại, minh bạch và hiệu quả. Kết nối sinh viên với các cơ hội hỗ trợ tài chính, giúp các em yên tâm theo đuổi ước mơ học tập.",
  hero_stat_sinhvien: "Sinh viên được hỗ trợ",
  hero_stat_sinhvien_sub: "So với năm trước",
  hero_stat_giatri: "Tổng giá trị hỗ trợ",
  hero_stat_giatri_sub: "Tích lũy từ các quỹ",
  hero_stat_nhahaotam: "Nhà hảo tâm",
  hero_stat_nhahaotam_sub: "Đối tác đồng hành",
  hero_stat_quy: "Quỹ đang hoạt động",
  hero_stat_quy_sub: "Đa dạng hình thức",

  // ─── COMBINED PROCESS SECTION ────────────────────────────────
  process_label: "QUY TRÌNH ĐƠN GIẢN",
  process_title: "Hai hành trình, một sứ mệnh chung",
  process_subtitle: "Dù bạn là sinh viên cần hỗ trợ hay nhà tài trợ muốn đóng góp, chúng tôi đều có quy trình rõ ràng và minh bạch",
  process_student_title: "Dành cho Sinh viên",
  process_student_desc: "Quy trình nhận hỗ trợ 4 bước",
  process_student_steps: [
    { title: "Đăng nhập", duration: "~1 phút", desc: "Sử dụng tài khoản Email sinh viên TVU để bắt đầu hành trình." },
    { title: "Tạo hồ sơ", duration: "~5 phút", desc: "Tải lên minh chứng và sử dụng AI để hoàn thiện hồ sơ." },
    { title: "Nhận phản hồi", duration: "3–5 ngày", desc: "Theo dõi trạng thái xét duyệt và nhận kết quả." },
    { title: "Theo dõi", duration: "Thời gian thực", desc: "Xem lịch sử hỗ trợ và số tiền đã nhận." }
  ],
  process_donor_title: "Dành cho Nhà tài trợ",
  process_donor_desc: "Quy trình tài trợ 4 bước",
  process_donor_steps: [
    { title: "Đăng ký tài trợ", duration: "~3 phút", desc: "Đăng ký thông tin và lựa chọn quỹ muốn đóng góp." },
    { title: "Chọn quỹ", duration: "~2 phút", desc: "Học bổng, Hỗ trợ khẩn cấp, Nghiên cứu khoa học." },
    { title: "Chuyển khoản", duration: "1–2 ngày", desc: "Hệ thống tự động xác nhận khi nhận được tiền." },
    { title: "Báo cáo", duration: "Định kỳ", desc: "Nhận báo cáo minh bạch về việc sử dụng kinh phí." }
  ],

  // ─── DONOR WALL ──────────────────────────────────────────────
  donor_wall_label: "GHI NHẬN ĐÓNG GÓP",
  donor_wall_title: "Bảng Vàng Nhà Tài Trợ",
  donor_wall_description: "Tri ân những cá nhân và tổ chức đã đồng hành cùng TVU Fund trong hành trình hỗ trợ sinh viên.",
  donor_wall_cta_title: "Trở thành Nhà Tài Trợ",
  donor_wall_cta_desc: "Đồng hành cùng chúng tôi trong việc hỗ trợ sinh viên TVU",

  // ─── AI SUPPORT SECTION ──────────────────────────────────────
  ai_label: "CÔNG NGHỆ TIÊN PHONG",
  ai_title: "Hỗ trợ thông minh với công nghệ AI",
  ai_features: [
    { title: "Viết thư ngỏ thông minh", description: "Hỗ trợ sinh viên viết thư ngỏ, trình bày hoàn cảnh một cách thuyết phục và chuyên nghiệp thông qua gợi ý ngôn ngữ tối ưu." },
    { title: "Kiểm tra hồ sơ tự động", description: "Hệ thống tự động quét và kiểm tra tính hợp lệ của hồ sơ, thông báo ngay lập tức các thiếu sót cần bổ sung để tăng tỷ lệ duyệt." },
    { title: "Theo dõi thời gian thực", description: "Theo dõi tiến độ duyệt hồ sơ minh bạch từng bước. Bạn sẽ luôn biết hồ sơ của mình đang ở giai đoạn nào trong quy trình." }
  ],

  // ─── TESTIMONIALS ────────────────────────────────────────────
  testimonials_title: "SINH VIÊN NÓI GÌ VỀ TVU FUND",
  testimonials_subtitle: "Những chia sẻ chân thành từ sinh viên đã nhận được sự đồng hành của TVU Fund",

  // ─── FUND PROGRESS ───────────────────────────────────────────
  progress_title: "TIẾN TRÌNH GÂY QUỸ",
  progress_subtitle: "Theo dõi thời gian thực dòng tiền đóng góp từ các nhà hảo tâm và tiến độ giải ngân hỗ trợ sinh viên TVU.",

  // ─── FOOTER ──────────────────────────────────────────────────
  footer_about_title: "VỀ CHÚNG TÔI",
  footer_social_title: "KẾT NỐI VỚI CHÚNG TÔI",
  footer_social_desc: "Theo dõi chúng tôi để cập nhật thông tin học bổng và hỗ trợ sinh viên mới nhất.",

  // ─── GUIDELINES / CONTACT ────────────────────────────────────
  guidelines_contact_phone: "(0294) 3855 246",
  guidelines_contact_email: "phongctsv@tvu.edu.vn",
  guidelines_contact_address: "126 Nguyễn Thiện Thành, Khóm 4, Phường 5, TP. Trà Vinh, Trà Vinh"
};

const mergeSettingsWithDefaults = (settings = {}) => ({
  ...DEFAULT_SETTINGS,
  ...settings,
  tai_khoan_nhan_tai_tro: {
    ...DEFAULT_SETTINGS.tai_khoan_nhan_tai_tro,
    ...(settings?.tai_khoan_nhan_tai_tro || {})
  }
});

const getPublicSettingsPayload = (settings = {}) => {
  const cfg = mergeSettingsWithDefaults(settings);

  return {
    ten_he_thong: cfg.ten_he_thong,
    don_vi_quan_ly: cfg.don_vi_quan_ly,
    email_lien_he: cfg.email_lien_he,
    email_ho_tro: cfg.email_ho_tro,
    so_dien_thoai: cfg.so_dien_thoai,
    dia_chi_lien_he: cfg.dia_chi_lien_he,
    gio_lam_viec: cfg.gio_lam_viec,
    facebook_url: cfg.facebook_url,
    youtube_url: cfg.youtube_url,
    linkedin_url: cfg.linkedin_url,
    tai_khoan_nhan_tai_tro: cfg.tai_khoan_nhan_tai_tro,
    // Hero
    hero_badge: cfg.hero_badge,
    hero_title: cfg.hero_title,
    hero_description: cfg.hero_description,
    hero_stat_sinhvien: cfg.hero_stat_sinhvien,
    hero_stat_sinhvien_sub: cfg.hero_stat_sinhvien_sub,
    hero_stat_giatri: cfg.hero_stat_giatri,
    hero_stat_giatri_sub: cfg.hero_stat_giatri_sub,
    hero_stat_nhahaotam: cfg.hero_stat_nhahaotam,
    hero_stat_nhahaotam_sub: cfg.hero_stat_nhahaotam_sub,
    hero_stat_quy: cfg.hero_stat_quy,
    hero_stat_quy_sub: cfg.hero_stat_quy_sub,
    // Process
    process_label: cfg.process_label,
    process_title: cfg.process_title,
    process_subtitle: cfg.process_subtitle,
    process_student_title: cfg.process_student_title,
    process_student_desc: cfg.process_student_desc,
    process_student_steps: cfg.process_student_steps,
    process_donor_title: cfg.process_donor_title,
    process_donor_desc: cfg.process_donor_desc,
    process_donor_steps: cfg.process_donor_steps,
    // Donor Wall
    donor_wall_label: cfg.donor_wall_label,
    donor_wall_title: cfg.donor_wall_title,
    donor_wall_description: cfg.donor_wall_description,
    donor_wall_cta_title: cfg.donor_wall_cta_title,
    donor_wall_cta_desc: cfg.donor_wall_cta_desc,
    // AI
    ai_label: cfg.ai_label,
    ai_title: cfg.ai_title,
    ai_features: cfg.ai_features,
    // Testimonials
    testimonials_title: cfg.testimonials_title,
    testimonials_subtitle: cfg.testimonials_subtitle,
    // Progress
    progress_title: cfg.progress_title,
    progress_subtitle: cfg.progress_subtitle,
    // Footer
    footer_about_title: cfg.footer_about_title,
    footer_social_title: cfg.footer_social_title,
    footer_social_desc: cfg.footer_social_desc,
    // Guidelines
    guidelines_contact_phone: cfg.guidelines_contact_phone,
    guidelines_contact_email: cfg.guidelines_contact_email,
    guidelines_contact_address: cfg.guidelines_contact_address,
  };
};

// Utility to read settings
const readSettingsFile = async () => {
  try {
    const rawData = await fs.readFile(settingsPath, "utf8");
    return mergeSettingsWithDefaults(JSON.parse(rawData));
  } catch (error) {
    // If doesn't exist, return default settings
    return mergeSettingsWithDefaults();
  }
};

const NHAT_KY_JOIN_FIELDS = new Set(["hoten", "email", "avatar", "vaitro_id", "tenvaitro"]);

const getRawNhatKyColumns = (log) => (
  Object.fromEntries(
    Object.entries(log).filter(([key]) => !NHAT_KY_JOIN_FIELDS.has(key))
  )
);

const mapNhatKyLog = (log, includeRaw = false) => ({
  log_id: log.nhatkyhethong_id,
  nguoi_dung_id: log.nguoidung_id,
  hanh_dong: log.hanhdong,
  loai_doi_tuong: log.loaidoituong,
  doi_tuong_id: log.doituong_id,
  mo_ta: log.mota,
  du_lieu_cu: log.dulieucu,
  du_lieu_moi: log.dulieumoi,
  ip_address: log.ipaddress,
  created_at: log.createdat,
  raw: includeRaw ? getRawNhatKyColumns(log) : undefined,
  nguoi_thuc_hien: log.hoten ? {
    ho_ten: log.hoten,
    email: log.email,
    avatar: buildUserAvatarUrl(log.avatar),
    role_id: log.vaitro_id,
    ten_vai_tro: log.tenvaitro
  } : null
});

// ─── GET /api/vaitro ─────────────────────────────────────────────────────────
export const getVaiTro = async (req, res) => {
  try {
    const includeUserCount = req.query.include_user_count === "true";

    let query;
    if (includeUserCount) {
      query = `
        SELECT 
          v.vaitro_id, 
          v.tenvaitro, 
          v.mota, 
          v.trangthai,
          (SELECT COUNT(*) FROM nguoidung n WHERE n.vaitro_id = v.vaitro_id) AS so_nguoi_dung,
          (SELECT COUNT(*) FROM nguoidung n WHERE n.vaitro_id = v.vaitro_id AND UPPER(n.trangthai) = 'HOAT DONG') AS so_hoat_dong
        FROM vaitro v
        ORDER BY v.vaitro_id
      `;
    } else {
      query = `
        SELECT vaitro_id, tenvaitro, mota, trangthai
        FROM vaitro
        ORDER BY vaitro_id
      `;
    }

    const [roles] = await pool.query(query);

    return res.status(200).json({
      success: true,
      roles: roles.map(role => ({
        role_id: role.vaitro_id,
        ten_vai_tro: role.tenvaitro,
        mo_ta: role.mota,
        trang_thai: role.trangthai || "Hoat dong",
        so_nguoi_dung: Number(role.so_nguoi_dung) || 0,
        so_hoat_dong: Number(role.so_hoat_dong) || 0
      }))
    });
  } catch (error) {
    console.error("Lỗi getVaiTro:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, không thể tải danh sách vai trò"
    });
  }
};

// ─── PATCH /api/vaitro/:role_id ──────────────────────────────────────────────
export const updateVaiTro = async (req, res) => {
  try {
    const { role_id } = req.params;
    const { mo_ta, trang_thai } = req.body;

    if (!role_id) {
      return res.status(400).json({ success: false, message: "ID vai trò không hợp lệ" });
    }

    // 1. Check if role exists
    const [existing] = await pool.query("SELECT * FROM vaitro WHERE vaitro_id = ?", [role_id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy vai trò" });
    }

    const role = existing[0];

    // 2. Prevent modifying Admin (role_id = 1) or User (role_id = 4) if it's restricted
    if (Number(role_id) === 1 || Number(role_id) === 4) {
      return res.status(403).json({
        success: false,
        message: "Không được phép chỉnh sửa vai trò Admin hoặc Người dùng thường"
      });
    }

    // 3. Update database
    const fields = [];
    const values = [];

    if (mo_ta !== undefined) {
      fields.push("mota = ?");
      values.push(mo_ta.trim());
    }

    if (trang_thai !== undefined) {
      if (!["Hoat dong", "Tam dung"].includes(trang_thai)) {
        return res.status(400).json({
          success: false,
          message: "Trạng thái không hợp lệ (Chỉ nhận 'Hoat dong' hoặc 'Tam dung')"
        });
      }
      fields.push("trangthai = ?");
      values.push(trang_thai);
    }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: "Không có thông tin thay đổi" });
    }

    values.push(role_id);
    const updateQuery = `UPDATE vaitro SET ${fields.join(", ")} WHERE vaitro_id = ?`;
    await pool.query(updateQuery, values);

    // 4. Log the action
    await logSystemActivity(req, {
      hanh_dong: "CAP_NHAT_VAI_TRO",
      loai_doi_tuong: "vaitro",
      doi_tuong_id: role_id,
      mo_ta: `Cập nhật vai trò: ${role.tenvaitro} (${trang_thai || role.trangthai})`,
      du_lieu_cu: { mo_ta: role.mota, trang_thai: role.trangthai },
      du_lieu_moi: { mo_ta, trang_thai }
    });

    return res.status(200).json({
      success: true,
      message: "Cập nhật vai trò thành công"
    });
  } catch (error) {
    console.error("Lỗi updateVaiTro:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, không thể cập nhật vai trò"
    });
  }
};

// ─── GET /api/nguoidung ──────────────────────────────────────────────────────
export const getNguoiDung = async (req, res) => {
  try {
    const { role_id } = req.query;

    let query = `
      SELECT 
        n.nguoidung_id,
        n.masodinhdanh,
        n.hoten,
        n.email,
        n.avatar,
        n.vaitro_id,
        n.trangthai,
        n.ngaytao,
        v.tenvaitro
      FROM nguoidung n
      LEFT JOIN vaitro v ON n.vaitro_id = v.vaitro_id
    `;

    const params = [];
    if (role_id) {
      const roles = role_id.split(",").map(r => parseInt(r.trim())).filter(r => !isNaN(r));
      if (roles.length > 0) {
        query += ` WHERE n.vaitro_id IN (${roles.map(() => "?").join(",")})`;
        params.push(...roles);
      }
    }

    query += " ORDER BY n.hoten ASC";

    const [users] = await pool.query(query, params);

    return res.status(200).json({
      success: true,
      data: users.map(u => ({
        user_id: u.nguoidung_id,
        ma_so_dinh_danh: u.masodinhdanh,
        ho_ten: u.hoten,
        email: u.email,
        avatar: buildUserAvatarUrl(u.avatar),
        role_id: u.vaitro_id,
        trang_thai: u.trangthai,
        created_at: u.ngaytao,
        ten_vai_tro: u.tenvaitro
      }))
    });
  } catch (error) {
    console.error("Lỗi getNguoiDung:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, không thể lấy danh sách người dùng"
    });
  }
};

// ─── GET /api/nhat-ky ────────────────────────────────────────────────────────
export const getNhatKy = async (req, res) => {
  try {
    const {
      keyword = "",
      hanh_dong = "",
      loai_doi_tuong = "",
      nguoi_dung_id = "",
      tu_ngay = "",
      den_ngay = "",
      page = 1,
      page_size = 20
    } = req.query;

    const limit = parseInt(page_size) || 20;
    const offset = (Math.max(1, parseInt(page) || 1) - 1) * limit;

    const conds = [];
    const params = [];

    if (keyword) {
      conds.push("(nk.mota LIKE ? OR n.hoten LIKE ? OR n.email LIKE ?)");
      const like = `%${keyword}%`;
      params.push(like, like, like);
    }

    if (hanh_dong) {
      conds.push("nk.hanhdong = ?");
      params.push(hanh_dong);
    }

    if (loai_doi_tuong) {
      conds.push("nk.loaidoituong = ?");
      params.push(loai_doi_tuong);
    }

    if (nguoi_dung_id) {
      conds.push("nk.nguoidung_id = ?");
      params.push(parseInt(nguoi_dung_id));
    }

    if (tu_ngay) {
      conds.push("nk.createdat >= ?");
      params.push(`${tu_ngay} 00:00:00`);
    }

    if (den_ngay) {
      conds.push("nk.createdat <= ?");
      params.push(`${den_ngay} 23:59:59`);
    }

    const whereClause = conds.length > 0 ? `WHERE ${conds.join(" AND ")}` : "";

    // Count total records
    const countQuery = `
      SELECT COUNT(*) AS total 
      FROM nhatkyhethong nk
      LEFT JOIN nguoidung n ON nk.nguoidung_id = n.nguoidung_id
      ${whereClause}
    `;
    const [[{ total }]] = await pool.query(countQuery, params);

    // Fetch records
    const selectQuery = `
      SELECT 
        nk.nhatkyhethong_id,
        nk.nguoidung_id,
        nk.hanhdong,
        nk.loaidoituong,
        nk.doituong_id,
        nk.mota,
        nk.dulieucu,
        nk.dulieumoi,
        nk.ipaddress,
        nk.createdat,
        n.hoten,
        n.email,
        n.avatar,
        n.vaitro_id,
        v.tenvaitro
      FROM nhatkyhethong nk
      LEFT JOIN nguoidung n ON nk.nguoidung_id = n.nguoidung_id
      LEFT JOIN vaitro v ON n.vaitro_id = v.vaitro_id
      ${whereClause}
      ORDER BY nk.createdat DESC
      LIMIT ? OFFSET ?
    `;

    const [logs] = await pool.query(selectQuery, [...params, limit, offset]);

    return res.status(200).json({
      success: true,
      logs: logs.map((log) => mapNhatKyLog(log)),
      pagination: {
        page: Math.max(1, parseInt(page) || 1),
        page_size: limit,
        total: Number(total) || 0,
        total_pages: Math.ceil((Number(total) || 0) / limit)
      }
    });
  } catch (error) {
    console.error("Lỗi getNhatKy:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, không thể tải nhật ký hệ thống"
    });
  }
};

// ─── GET /api/nhat-ky/:log_id ────────────────────────────────────────────────
export const getNhatKyDetail = async (req, res) => {
  try {
    const logId = parseInt(req.params.log_id, 10);

    if (!Number.isInteger(logId) || logId <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID nhật ký không hợp lệ"
      });
    }

    const [rows] = await pool.query(
      `
        SELECT
          nk.*,
          n.hoten,
          n.email,
          n.avatar,
          n.vaitro_id,
          v.tenvaitro
        FROM nhatkyhethong nk
        LEFT JOIN nguoidung n ON nk.nguoidung_id = n.nguoidung_id
        LEFT JOIN vaitro v ON n.vaitro_id = v.vaitro_id
        WHERE nk.nhatkyhethong_id = ?
        LIMIT 1
      `,
      [logId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nhật ký hoạt động"
      });
    }

    return res.status(200).json({
      success: true,
      log: mapNhatKyLog(rows[0], true)
    });
  } catch (error) {
    console.error("Lỗi getNhatKyDetail:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, không thể tải chi tiết nhật ký"
    });
  }
};

// ─── GET /api/system/settings ────────────────────────────────────────────────
export const getSystemSettings = async (req, res) => {
  try {
    const settings = await readSettingsFile();
    return res.status(200).json({
      success: true,
      settings
    });
  } catch (error) {
    console.error("Lỗi getSystemSettings:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, không thể lấy cấu hình hệ thống"
    });
  }
};

// ─── PATCH /api/system/settings ──────────────────────────────────────────────
export const getPublicSystemSettings = async (req, res) => {
  try {
    const settings = await readSettingsFile();
    return res.status(200).json({
      success: true,
      settings: getPublicSettingsPayload(settings)
    });
  } catch (error) {
    console.error("Lỗi getPublicSystemSettings:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, không thể lấy cấu hình công khai"
    });
  }
};

export const updateSystemSettings = async (req, res) => {
  try {
    const updates = req.body;
    const currentSettings = await readSettingsFile();

    // Validate values if necessary
    if (updates.so_cap_duyet !== undefined) {
      const capDuyet = parseInt(updates.so_cap_duyet);
      if (isNaN(capDuyet) || capDuyet < 1 || capDuyet > 5) {
        return res.status(400).json({ success: false, message: "Số cấp phê duyệt phải từ 1 đến 5" });
      }
    }

    const updatedSettings = {
      ...currentSettings,
      ...updates,
      tai_khoan_nhan_tai_tro: {
        ...currentSettings.tai_khoan_nhan_tai_tro,
        ...(updates?.tai_khoan_nhan_tai_tro || {})
      }
    };

    // Save to file
    await fs.writeFile(settingsPath, JSON.stringify(updatedSettings, null, 2), "utf8");

    // Log the change
    await logSystemActivity(req, {
      hanh_dong: "CAP_NHAT_CAI_DAT_HE_THONG",
      loai_doi_tuong: "caidathethong",
      doi_tuong_id: null,
      mo_ta: `Cập nhật cấu hình hệ thống`,
      du_lieu_cu: currentSettings,
      du_lieu_moi: updatedSettings
    });

    return res.status(200).json({
      success: true,
      message: "Cập nhật cài đặt hệ thống thành công",
      settings: updatedSettings
    });
  } catch (error) {
    console.error("Lỗi updateSystemSettings:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, không thể cập nhật cấu hình hệ thống"
    });
  }
};

const permissionsPath = path.join(process.cwd(), "config/page_permissions.json");

const readPermissionsFile = async () => {
  try {
    const rawData = await fs.readFile(permissionsPath, "utf8");
    return JSON.parse(rawData);
  } catch (error) {
    return {};
  }
};

// ─── GET /api/system/permissions ─────────────────────────────────────────────
// Endpoint công khai — trả về ma trận quyền hiển thị cho frontend nav
// Chỉ trả về visibility flags + label/path (không曝pose cấu trúc nội bộ)
export const getPagePermissions = async (req, res) => {
  try {
    const raw = await readPermissionsFile();

    // Transform: giữ label, path, visibility flags — bỏ mọi field khác nếu có
    const sanitized = {};
    for (const [key, value] of Object.entries(raw)) {
      sanitized[key] = {
        label: value.label || '',
        path: value.path || '',
        admin: !!value.admin,
        canbo: !!value.canbo,
        ketoan: !!value.ketoan,
        sinhvien: !!value.sinhvien,
        nhataitro: !!value.nhataitro,
      };
    }

    return res.status(200).json({
      success: true,
      permissions: sanitized
    });
  } catch (error) {
    console.error("Lỗi getPagePermissions:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, không thể lấy ma trận phân quyền"
    });
  }
};

// ─── PATCH /api/system/permissions ───────────────────────────────────────────
export const updatePagePermissions = async (req, res) => {
  try {
    const updates = req.body;
    const currentPermissions = await readPermissionsFile();

    const updatedPermissions = {
      ...currentPermissions,
      ...updates
    };

    // Save to file
    await fs.writeFile(permissionsPath, JSON.stringify(updatedPermissions, null, 2), "utf8");

    req._systemLogWritten = true;

    res.status(200).json({
      success: true,
      message: "Cập nhật ma trận phân quyền thành công",
      permissions: updatedPermissions
    });

    // Log after responding so logging latency/failure does not affect saving.
    logSystemActivity(req, {
      hanh_dong: "CAP_NHAT_PHAN_QUYEN",
      loai_doi_tuong: "phanquyen",
      doi_tuong_id: null,
      mo_ta: `Cập nhật ma trận phân quyền truy cập trang`,
      du_lieu_cu: currentPermissions,
      du_lieu_moi: updatedPermissions
    }).catch((logError) => {
      console.error("Lỗi log updatePagePermissions:", logError);
    });

    return;
  } catch (error) {
    console.error("Lỗi updatePagePermissions:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, không thể cập nhật ma trận phân quyền"
    });
  }
};

// ─── GET /api/nhat-ky/stats ──────────────────────────────────────────────────
export const getNhatKyStats = async (req, res) => {
  try {
    // 1. Tổng bản ghi
    const [[{ total }]] = await pool.query("SELECT COUNT(*) AS total FROM nhatkyhethong");

    // 2. Hôm nay
    const [[{ todayCount }]] = await pool.query(
      "SELECT COUNT(*) AS todayCount FROM nhatkyhethong WHERE DATE(createdat) = CURDATE()"
    );

    // 3. Tuần này (7 ngày gần nhất)
    const [[{ weekCount }]] = await pool.query(
      "SELECT COUNT(*) AS weekCount FROM nhatkyhethong WHERE createdat >= DATE_SUB(NOW(), INTERVAL 7 DAY)"
    );

    // 4. Người dùng độc nhất hôm nay
    const [[{ uniqueUsers }]] = await pool.query(
      "SELECT COUNT(DISTINCT nguoidung_id) AS uniqueUsers FROM nhatkyhethong WHERE DATE(createdat) = CURDATE() AND nguoidung_id IS NOT NULL"
    );

    return res.status(200).json({
      success: true,
      stats: {
        tongBanGhi: total || 0,
        homNay: todayCount || 0,
        tuanNay: weekCount || 0,
        nguoiDungDoc: uniqueUsers || 0,
      }
    });
  } catch (error) {
    console.error("Lỗi getNhatKyStats:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, không thể lấy thống kê nhật ký"
    });
  }
};

// ─── GET /api/nhat-ky/export ─────────────────────────────────────────────────
export const exportNhatKy = async (req, res) => {
  try {
    const {
      keyword = "",
      hanh_dong = "",
      loai_doi_tuong = "",
      nguoi_dung_id = "",
      tu_ngay = "",
      den_ngay = ""
    } = req.query;

    const conds = [];
    const params = [];

    if (keyword) {
      conds.push("(nk.mota LIKE ? OR n.hoten LIKE ? OR n.email LIKE ? OR nk.ipaddress LIKE ?)");
      const like = `%${keyword}%`;
      params.push(like, like, like, like);
    }

    if (hanh_dong) {
      conds.push("nk.hanhdong = ?");
      params.push(hanh_dong);
    }

    if (loai_doi_tuong) {
      conds.push("nk.loaidoituong = ?");
      params.push(loai_doi_tuong);
    }

    if (nguoi_dung_id) {
      conds.push("nk.nguoidung_id = ?");
      params.push(parseInt(nguoi_dung_id));
    }

    if (tu_ngay) {
      conds.push("nk.createdat >= ?");
      params.push(`${tu_ngay} 00:00:00`);
    }

    if (den_ngay) {
      conds.push("nk.createdat <= ?");
      params.push(`${den_ngay} 23:59:59`);
    }

    const whereClause = conds.length > 0 ? `WHERE ${conds.join(" AND ")}` : "";

    const selectQuery = `
      SELECT 
        nk.nhatkyhethong_id,
        nk.nguoidung_id,
        nk.hanhdong,
        nk.loaidoituong,
        nk.doituong_id,
        nk.mota,
        nk.ipaddress,
        nk.createdat,
        n.hoten,
        n.email,
        v.tenvaitro
      FROM nhatkyhethong nk
      LEFT JOIN nguoidung n ON nk.nguoidung_id = n.nguoidung_id
      LEFT JOIN vaitro v ON n.vaitro_id = v.vaitro_id
      ${whereClause}
      ORDER BY nk.createdat DESC
      LIMIT 100000
    `;

    const [logs] = await pool.query(selectQuery, params);

    // Create Excel Workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "TVU Fund Management";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet("Nhật ký hệ thống");

    // Title
    sheet.mergeCells("A1:G1");
    const titleCell = sheet.getCell("A1");
    titleCell.value = "NHẬT KÝ HOẠT ĐỘNG HỆ THỐNG";
    titleCell.font = { size: 16, bold: true, color: { argb: "FF1A2F5E" } };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    sheet.getRow(1).height = 30;

    sheet.getCell("A3").value = "Ngày xuất:";
    sheet.getCell("A3").font = { bold: true };
    sheet.getCell("B3").value = new Date().toLocaleString("vi-VN");

    sheet.getCell("A4").value = "Tổng số bản ghi:";
    sheet.getCell("A4").font = { bold: true };
    sheet.getCell("B4").value = logs.length;

    // Table headers
    const headers = [
      "Mã Log",
      "Thời gian",
      "Người thực hiện",
      "Vai trò",
      "Hành động",
      "Mô tả chi tiết",
      "Địa chỉ IP"
    ];

    const headerRow = sheet.getRow(6);
    headerRow.values = headers;
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.height = 24;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1A2F5E" }
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" }
      };
    });

    // Populate data
    logs.forEach((log, idx) => {
      const row = sheet.getRow(7 + idx);
      row.values = [
        `LOG${log.nhatkyhethong_id}`,
        new Date(log.createdat).toLocaleString("vi-VN"),
        log.hoten ? `${log.hoten} (${log.email || ""})` : "Hệ thống",
        log.tenvaitro || "Hệ thống",
        log.hanhdong || "—",
        log.mota || "—",
        log.ipaddress || "—"
      ];

      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin", color: { argb: "FFE2E8F0" } },
          left: { style: "thin", color: { argb: "FFE2E8F0" } },
          bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
          right: { style: "thin", color: { argb: "FFE2E8F0" } }
        };
      });
    });

    // Auto fit columns
    sheet.columns.forEach((col, idx) => {
      let maxLength = headers[idx]?.length || 10;
      col.eachCell?.({ includeEmpty: false }, (cell) => {
        const v = String(cell.value ?? "");
        if (v.length > maxLength) maxLength = v.length;
      });
      col.width = Math.min(maxLength + 4, 60);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const fileName = `NhatKyHeThong_${Date.now()}.xlsx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName}"`
    );
    res.setHeader("Content-Length", buffer.length);
    return res.send(buffer);
  } catch (error) {
    console.error("Lỗi exportNhatKy:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi xuất Excel nhật ký",
      error: error.message
    });
  }
};
