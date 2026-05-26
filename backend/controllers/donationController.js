import DonationModel from "../models/DonationModel.js";
import FundModel from "../models/FundModel.js";
import DonorModel from "../models/DonorModel.js";
import { buildDonorAvatarUrl } from "../utils/imageHelper.js";

// ═══════════════════════════════════════════════════════════════════════════════
// ─── GET /api/donations (CHO KẾ TOÁN/ADMIN/CÁN BỘ) ─────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
// Query: keyword, quy_id, loai_ntt, trang_thai, tu_ngay, den_ngay, page, page_size
export const listDonations = async (req, res) => {
  try {
    const {
      keyword = '',
      quy_id = '',
      loai_ntt = '',
      trang_thai = '',
      tu_ngay = '',
      den_ngay = '',
      page = 1,
      page_size = 15,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(page_size, 10) || 15));

    const { rows, total } = await DonationModel.listDonations({
      keyword: String(keyword).trim(),
      quy_id: String(quy_id).trim(),
      loai_ntt: String(loai_ntt).trim(),
      trang_thai: String(trang_thai).trim(),
      tu_ngay: String(tu_ngay).trim(),
      den_ngay: String(den_ngay).trim(),
      page: pageNum,
      page_size: pageSize,
    });

    const data = rows.map((r) => ({
      khoan_tai_tro_id: r.khoan_tai_tro_id,
      nha_tai_tro_id: r.nha_tai_tro_id,
      quy_id: r.quy_id,
      ten_nha_tai_tro: r.ten_nha_tai_tro,
      loai_ntt: r.loai_ntt,
      ho_ten: r.ho_ten,
      email: r.email,
      so_dien_thoai: r.so_dien_thoai,
      avatar: buildDonorAvatarUrl(r.avatar),
      ten_quy: r.ten_quy,
      loai_quy: r.loai_quy,
      so_tien: Number(r.so_tien) || 0,
      hinh_anh_minh_chung: r.hinh_anh_minh_chung,
      ngay_tai_tro: r.ngay_tai_tro,
      trang_thai: r.trang_thai,
      ghi_chu: r.ghi_chu,
      ngay_cap_nhat: r.ngay_cap_nhat,
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
    console.error("Lỗi listDonations:", error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── GET /api/donations/stats (CHO KẾ TOÁN) ────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export const getDonationStats = async (_req, res) => {
  try {
    const stats = await DonationModel.getDonationStatsForKeToan();
    return res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error("Lỗi getDonationStats:", error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── GET /api/donations/:id (CHI TIẾT + LỊCH SỬ PHÊ DUYỆT) ─────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export const getDonationDetail = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ success: false, message: "ID không hợp lệ" });
    }

    const donation = await DonationModel.getDonationById(id);
    if (!donation) {
      return res.status(404).json({ success: false, message: "Không tìm thấy khoản tài trợ" });
    }

    const lichSu = await DonationModel.getPheDuyetByKhoanTaiTro(id);

    return res.status(200).json({
      success: true,
      data: {
        khoan_tai_tro_id: donation.khoan_tai_tro_id,
        nha_tai_tro_id: donation.nha_tai_tro_id,
        quy_id: donation.quy_id,
        ten_nha_tai_tro: donation.ten_nha_tai_tro,
        loai_ntt: donation.loai_ntt,
        ho_ten: donation.ho_ten,
        email: donation.email,
        so_dien_thoai: donation.so_dien_thoai,
        avatar: buildDonorAvatarUrl(donation.avatar),
        ten_quy: donation.ten_quy,
        loai_quy: donation.loai_quy,
        quy_so_du: Number(donation.quy_so_du) || 0,
        so_tien: Number(donation.so_tien) || 0,
        hinh_anh_minh_chung: donation.hinh_anh_minh_chung,
        ngay_tai_tro: donation.ngay_tai_tro,
        trang_thai: donation.trang_thai,
        ghi_chu: donation.ghi_chu,
        ngay_cap_nhat: donation.ngay_cap_nhat,
        lich_su_phe_duyet: lichSu.map((h) => ({
          phe_duyet_id: h.phe_duyet_id,
          cap_do_duyet: h.cap_do_duyet,
          ket_qua: h.ket_qua,
          ghi_chu: h.ghi_chu,
          ly_do_tu_choi: h.ly_do_tu_choi,
          ngay_tao: h.ngay_tao,
          ngay_duyet: h.ngay_duyet,
          nguoi_duyet_id: h.nguoi_duyet_id,
          nguoi_duyet_ten: h.nguoi_duyet_ten,
          nguoi_duyet_avatar: buildDonorAvatarUrl(h.nguoi_duyet_avatar),
          nguoi_duyet_vai_tro: h.nguoi_duyet_vai_tro,
        })),
      },
    });
  } catch (error) {
    console.error("Lỗi getDonationDetail:", error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── POST /api/donations (CHO CÁN BỘ QUỸ - YÊU CẦU TOKEN) ─────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
//
// MỤC ĐÍCH: Cán bộ Quỹ ghi nhận 1 khoản tài trợ mới từ nhà tài trợ đã có
//   - Khác với /public ở chỗ: có auth, nha_tai_tro_id đã biết, hỗ trợ minh chứng
//   - Trạng thái mặc định = 'Cho duyet' (chờ Kế toán/Admin duyệt)
//
// BODY:
//   nha_tai_tro_id, quy_id, so_tien (>0), ghi_chu?, hinh_anh_minh_chung?
//
export const createStaffDonation = async (req, res) => {
  try {
    const { nha_tai_tro_id, quy_id, so_tien, ghi_chu, hinh_anh_minh_chung } = req.body;

    if (!nha_tai_tro_id || isNaN(nha_tai_tro_id)) {
      return res.status(400).json({ success: false, message: "Thiếu hoặc sai nha_tai_tro_id" });
    }
    if (!quy_id || isNaN(quy_id)) {
      return res.status(400).json({ success: false, message: "Thiếu hoặc sai quy_id" });
    }
    const amount = Number(so_tien);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: "Số tiền phải lớn hơn 0" });
    }

    const donor = await DonorModel.getDonorById(nha_tai_tro_id);
    if (!donor) {
      return res.status(404).json({ success: false, message: "Nhà tài trợ không tồn tại" });
    }

    const fund = await FundModel.getFundById(quy_id);
    if (!fund) {
      return res.status(404).json({ success: false, message: "Quỹ không tồn tại" });
    }
    if (fund.trang_thai !== 'Dang hoat dong') {
      return res.status(400).json({ success: false, message: "Quỹ hiện không nhận đóng góp" });
    }

    const result = await DonationModel.createStaffDonation({
      nhaTaiTroId: nha_tai_tro_id,
      quyId: quy_id,
      soTien: amount,
      ghiChu: ghi_chu ? String(ghi_chu).trim() : null,
      hinhAnhMinhChung: hinh_anh_minh_chung || null,
      nguoiDuyetId: req.user?.id || null,
    });

    return res.status(201).json({
      success: true,
      message: "Ghi nhận khoản tài trợ thành công. Chờ duyệt.",
      data: {
        khoan_tai_tro_id: result.khoanTaiTroId,
        nha_tai_tro_id,
        quy_id,
        so_tien: amount,
        trang_thai: 'Cho duyet',
      },
    });
  } catch (error) {
    console.error("Lỗi createStaffDonation:", error);
    return res.status(500).json({ success: false, message: "Lỗi server, vui lòng thử lại sau" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── POST /api/donations/public (API PUBLIC - KHÔNG CẦN TOKEN) ─────────────────
// ═══════════════════════════════════════════════════════════════════════════════
// 
// MỤC ĐÍCH: Người dùng bên ngoài (không cần đăng nhập) quyên góp vào quỹ
// 
// PHÂN BIỆT VỚI API ADMIN:
// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ API này (POST /api/donations/public):                                      │
// │ ✅ KHÔNG CẦN TOKEN: Ai cũng có thể truy cập                                │
// │ ✅ TỰ ĐỘNG TẠO NHÀ TÀI TRỢ: Nếu email chưa tồn tại trong hệ thống         │
// │ ✅ DÙNG LẠI NHÀ TÀI TRỢ CŨ: Nếu email đã tồn tại                           │
// │ ✅ TẠO KHOẢN TÀI TRỢ: Với trạng thái "Chờ duyệt"                           │
// │ ✅ TRẢ VỀ THÔNG TIN NGÂN HÀNG: Để người dùng chuyển khoản                  │
// │                                                                             │
// │ API Admin (POST /api/donors):                                              │
// │ ✅ YÊU CẦU TOKEN + QUYỀN: Chỉ Admin/Giáo vụ                                │
// │ ✅ CHỈ TẠO NHÀ TÀI TRỢ: Không tạo khoản tài trợ                            │
// │ ✅ KHÔNG CHO PHÉP TRÙNG: Email và SĐT phải unique                          │
// └─────────────────────────────────────────────────────────────────────────────┘
//
// LUỒNG HOẠT ĐỘNG (SỬ DỤNG DATABASE TRANSACTION):
// 1. Validate dữ liệu đầu vào (tên, email, SĐT, số tiền, quỹ)
// 2. Kiểm tra quỹ có tồn tại và đang hoạt động không
// 3. BEGIN TRANSACTION
//    ├─ Kiểm tra email trong bảng NhaTaiTro
//    ├─ Nếu CHƯA TỒN TẠI → INSERT nhà tài trợ mới
//    ├─ Nếu ĐÃ TỒN TẠI → Lấy nha_tai_tro_id hiện có
//    ├─ INSERT vào bảng KhoanTaiTro với trang_thai = "Chờ duyệt"
//    └─ COMMIT
// 4. Trả về thông tin donation + thông tin ngân hàng
//
export const createPublicDonation = async (req, res) => {
  try {
    const {
      ten,
      email,
      soDienThoai,
      soTien,
      quyId,
      ghiChu
    } = req.body;

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 1: VALIDATE DỮ LIỆU ĐẦU VÀO
    // ─────────────────────────────────────────────────────────────────────────
    
    // 1.1. Kiểm tra các trường bắt buộc
    if (!ten || !email || !soDienThoai || !soTien || !quyId) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin: tên, email, số điện thoại, số tiền, quỹ",
      });
    }

    // 1.2. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Email không đúng định dạng",
      });
    }

    // 1.3. Validate số điện thoại format (10-11 số)
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(soDienThoai.trim())) {
      return res.status(400).json({
        success: false,
        message: "Số điện thoại không đúng định dạng (10-11 số)",
      });
    }

    // 1.4. Validate số tiền (phải > 0)
    if (isNaN(soTien) || soTien <= 0) {
      return res.status(400).json({
        success: false,
        message: "Số tiền phải lớn hơn 0",
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 2: KIỂM TRA QUỸ CÓ TỒN TẠI VÀ ĐANG HOẠT ĐỘNG
    // ─────────────────────────────────────────────────────────────────────────
    
    // 2.1. Kiểm tra quỹ có tồn tại không
    const fund = await FundModel.getFundById(quyId);
    if (!fund) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy quỹ",
      });
    }

    // 2.2. Kiểm tra quỹ có đang hoạt động không
    // Chỉ cho phép quyên góp vào quỹ đang hoạt động
    // LƯU Ý: Giá trị thực tế trong DB là 'Dang hoat dong' (chữ thường, có dấu cách)
    if (fund.trang_thai !== 'Dang hoat dong') {
      return res.status(400).json({
        success: false,
        message: "Quỹ hiện không nhận đóng góp",
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 3: TẠO DONATION VỚI DATABASE TRANSACTION
    // ─────────────────────────────────────────────────────────────────────────
    // LƯU Ý: Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu
    // - Nếu tạo nhà tài trợ thành công nhưng tạo khoản tài trợ thất bại
    //   → Rollback, không lưu nhà tài trợ
    // - Nếu cả 2 thành công → Commit
    
    // 3.1. Chuẩn bị dữ liệu
    const donationData = {
      ten: ten.trim(),
      email: email.trim().toLowerCase(),
      soDienThoai: soDienThoai.trim(),
      soTien: parseFloat(soTien),
      quyId: quyId,
      ghiChu: ghiChu ? ghiChu.trim() : null
    };

    // 3.2. Gọi Model để xử lý transaction
    // Bên trong Model sẽ:
    // - Kiểm tra email trong NhaTaiTro
    // - Tạo mới hoặc dùng lại nhà tài trợ
    // - Tạo khoản tài trợ với trạng thái "Chờ duyệt"
    const result = await DonationModel.createPublicDonation(donationData);

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 4: TRẢ VỀ THÔNG TIN DONATION VÀ THÔNG TIN NGÂN HÀNG
    // ─────────────────────────────────────────────────────────────────────────
    // Người dùng sẽ nhận được:
    // - Thông tin donation vừa tạo (ID, trạng thái, số tiền...)
    // - Thông tin tài khoản ngân hàng để chuyển khoản
    // - Nội dung chuyển khoản (để hệ thống tự động đối soát)
    
    return res.status(201).json({
      success: true,
      message: "Đăng ký đóng góp thành công. Vui lòng chuyển khoản theo thông tin bên dưới.",
      donation: {
        khoanTaiTroId: result.khoanTaiTroId,
        nhaTaiTro: {
          id: result.nhaTaiTroId,
          ten: donationData.ten,
          email: donationData.email,
          soDienThoai: donationData.soDienThoai
        },
        quy: {
          id: fund.quy_id,
          tenQuy: fund.ten_quy
        },
        soTien: donationData.soTien,
        ghiChu: donationData.ghiChu,
        trangThai: 'Cho duyet',
        ngayTaiTro: new Date()
      },
      bankInfo: {
        tenNganHang: "Ngân hàng TMCP Á Châu (ACB)",
        soTaiKhoan: "123456789",
        chuTaiKhoan: "Trường Đại học ABC",
        noiDung: `DONATE ${result.khoanTaiTroId} ${donationData.ten}`,
        soTien: donationData.soTien,
        ghiChu: "Vui lòng chuyển khoản đúng nội dung để hệ thống tự động xác nhận"
      }
    });
  } catch (error) {
    console.error("Lỗi createPublicDonation:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── PUT /api/donations/:id/approve (CHO KẾ TOÁN/ADMIN) ───────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
// 
// MỤC ĐÍCH: Kế toán/Admin duyệt khoản tài trợ sau khi xác nhận đã nhận tiền
// 
// LUỒNG HOẠT ĐỘNG (SỬ DỤNG DATABASE TRANSACTION):
// 1. Kiểm tra token và quyền (Kế toán hoặc Admin)
// 2. Kiểm tra khoản tài trợ có tồn tại không
// 3. Kiểm tra trạng thái hiện tại (phải là "Chờ duyệt")
// 4. BEGIN TRANSACTION
//    ├─ Cập nhật trang_thai từ "Chờ duyệt" → "Đã nhận"
//    ├─ Cộng so_tien vào so_du của bảng Quy
//    └─ Tạo bản ghi trong GiaoDich với loai_giao_dich = "Thu"
// 5. COMMIT
// 6. Trả về thông tin khoản tài trợ đã duyệt
//
export const approveDonation = async (req, res) => {
  try {
    const { id } = req.params;
    const { ghi_chu, minh_chung_ke_toan } = req.body || {};
    const nguoiDuyetId = req.user.id; // Lấy từ middleware protect

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 1: VALIDATE ID
    // ─────────────────────────────────────────────────────────────────────────
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID khoản tài trợ không hợp lệ",
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 2: KIỂM TRA KHOẢN TÀI TRỢ CÓ TỒN TẠI KHÔNG
    // ─────────────────────────────────────────────────────────────────────────
    const donation = await DonationModel.getDonationById(id);
    
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy khoản tài trợ",
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 3: KIỂM TRA TRẠNG THÁI HIỆN TẠI
    // ─────────────────────────────────────────────────────────────────────────
    // Cho phép duyệt khoản tài trợ đang ở 'Cho duyet' (public) hoặc 'Da duyet' (staff đã ghi nhận)
    if (donation.trang_thai === 'Da nhan') {
      return res.status(400).json({
        success: false,
        message: "Khoản tài trợ này đã được duyệt trước đó",
      });
    }

    if (donation.trang_thai === 'Tu choi') {
      return res.status(400).json({
        success: false,
        message: "Không thể duyệt khoản tài trợ đã bị từ chối",
      });
    }

    if (donation.trang_thai !== 'Cho duyet' && donation.trang_thai !== 'Da duyet') {
      return res.status(400).json({
        success: false,
        message: "Chỉ có thể duyệt khoản tài trợ đang ở trạng thái 'Chờ duyệt'",
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 4: THỰC HIỆN DUYỆT VỚI TRANSACTION
    // ─────────────────────────────────────────────────────────────────────────
    // Model sẽ xử lý:
    // - Cập nhật trạng thái khoản tài trợ
    // - Cộng tiền vào quỹ
    // - Tạo giao dịch
    const result = await DonationModel.approveDonation(id, nguoiDuyetId, {
      ghiChu: ghi_chu ? String(ghi_chu).trim() : null,
      minhChungKeToan: minh_chung_ke_toan || null,
    });

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 5: TRẢ VỀ KẾT QUẢ
    // ─────────────────────────────────────────────────────────────────────────
    return res.status(200).json({
      success: true,
      message: "Duyệt khoản tài trợ thành công",
      donation: {
        khoanTaiTroId: donation.khoan_tai_tro_id,
        nhaTaiTro: {
          id: donation.nha_tai_tro_id,
          ten: donation.ten_nha_tai_tro,
          email: donation.email,
          soDienThoai: donation.so_dien_thoai
        },
        quy: {
          id: donation.quy_id,
          tenQuy: donation.ten_quy,
          loaiQuy: donation.loai_quy
        },
        soTien: donation.so_tien,
        trangThaiCu: donation.trang_thai,
        trangThaiMoi: 'Da nhan',
        ngayTaiTro: donation.ngay_tai_tro,
        ngayDuyet: new Date(),
        nguoiDuyet: nguoiDuyetId,
        ghiChu: donation.ghi_chu
      }
    });
  } catch (error) {
    console.error("Lỗi approveDonation:", error);
    
    // Xử lý lỗi đặc biệt
    if (error.message === 'DONATION_NOT_FOUND_OR_ALREADY_APPROVED') {
      return res.status(400).json({
        success: false,
        message: "Khoản tài trợ không tồn tại hoặc đã được duyệt",
      });
    }
    
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── PUT /api/donations/:id/reject (CHO KẾ TOÁN/ADMIN) ────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
// 
// MỤC ĐÍCH: Kế toán/Admin từ chối khoản tài trợ
// 
// LUỒNG HOẠT ĐỘNG:
// 1. Kiểm tra token và quyền (Kế toán hoặc Admin)
// 2. Kiểm tra khoản tài trợ có tồn tại không
// 3. Kiểm tra trạng thái hiện tại (phải là "Chờ duyệt")
// 4. Cập nhật trạng thái từ "Chờ duyệt" → "Từ chối"
// 5. Lưu lý do từ chối
// 6. KHÔNG cộng tiền vào quỹ
// 7. KHÔNG tạo giao dịch
//
export const rejectDonation = async (req, res) => {
  try {
    const { id } = req.params;
    const { lyDoTuChoi } = req.body;
    const nguoiTuChoiId = req.user.id;

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 1: VALIDATE
    // ─────────────────────────────────────────────────────────────────────────
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID khoản tài trợ không hợp lệ",
      });
    }

    if (!lyDoTuChoi || lyDoTuChoi.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập lý do từ chối",
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 2: KIỂM TRA KHOẢN TÀI TRỢ
    // ─────────────────────────────────────────────────────────────────────────
    const donation = await DonationModel.getDonationById(id);
    
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy khoản tài trợ",
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 3: KIỂM TRA TRẠNG THÁI
    // ─────────────────────────────────────────────────────────────────────────
    if (donation.trang_thai === 'Da nhan') {
      return res.status(400).json({
        success: false,
        message: "Không thể từ chối khoản tài trợ đã được duyệt",
      });
    }

    if (donation.trang_thai === 'Tu choi') {
      return res.status(400).json({
        success: false,
        message: "Khoản tài trợ này đã bị từ chối trước đó",
      });
    }

    if (donation.trang_thai !== 'Cho duyet' && donation.trang_thai !== 'Da duyet') {
      return res.status(400).json({
        success: false,
        message: "Chỉ có thể từ chối khoản tài trợ đang ở trạng thái 'Chờ duyệt' hoặc 'Đã duyệt'",
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 4: TỪ CHỐI KHOẢN TÀI TRỢ
    // ─────────────────────────────────────────────────────────────────────────
    await DonationModel.rejectDonation(id, lyDoTuChoi.trim(), nguoiTuChoiId);

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 5: TRẢ VỀ KẾT QUẢ
    // ─────────────────────────────────────────────────────────────────────────
    return res.status(200).json({
      success: true,
      message: "Từ chối khoản tài trợ thành công",
      donation: {
        khoanTaiTroId: donation.khoan_tai_tro_id,
        nhaTaiTro: {
          id: donation.nha_tai_tro_id,
          ten: donation.ten_nha_tai_tro,
          email: donation.email,
          soDienThoai: donation.so_dien_thoai
        },
        quy: {
          id: donation.quy_id,
          tenQuy: donation.ten_quy
        },
        soTien: donation.so_tien,
        trangThaiCu: donation.trang_thai,
        trangThaiMoi: 'Tu choi',
        lyDoTuChoi: lyDoTuChoi.trim(),
        ngayTuChoi: new Date(),
        nguoiTuChoi: nguoiTuChoiId
      }
    });
  } catch (error) {
    console.error("Lỗi rejectDonation:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};
