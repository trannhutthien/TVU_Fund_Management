import DonationModel from "../../models/donations/DonationModel.js";
import pool from "../../config/db.js";
import FundModel from "../../models/funds/FundModel.js";
import DonorModel from "../../models/donations/DonorModel.js";
import BankAccountModel from "../../models/funds/BankAccountModel.js";
import { buildDonorAvatarUrl } from "../../utils/helpers/imageHelper.js";
import { logSystemActivity } from "../../utils/helpers/loggerHelper.js";

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
      khoan_tai_tro_id: r.khoantaitro_id,
      nha_tai_tro_id: r.nhataitro_id,
      quy_id: r.quy_id,
      ten_nha_tai_tro: r.tennhataitro,
      loai_ntt: r.loainhataitro,
      ho_ten: r.tennhataitro,
      email: r.email,
      so_dien_thoai: r.sodienthoai,
      avatar: buildDonorAvatarUrl(r.logo),
      ten_quy: r.tenquy,
      loai_quy: r.loaiquy_id,
      so_tien: Number(r.sotien) || 0,
      hinh_anh_minh_chung: r.chungtu,
      ngay_tai_tro: r.ngaytaitro,
      trang_thai: r.trangthai,
      ghi_chu: r.ghichu,
      ngay_cap_nhat: r.ngaycapnhat,
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
        khoan_tai_tro_id: donation.khoantaitro_id,
        nha_tai_tro_id: donation.nhataitro_id,
        quy_id: donation.quy_id,
        ten_nha_tai_tro: donation.tennhataitro,
        loai_ntt: donation.loainhataitro,
        ho_ten: donation.tennhataitro,
        email: donation.ntt_email,
        so_dien_thoai: donation.ntt_sodienthoai,
        avatar: buildDonorAvatarUrl(donation.logo),
        ten_quy: donation.tenquy,
        loai_quy: donation.loaiquy_id,
        quy_so_du: Number(donation.quy_so_du) || 0,
        so_tien: Number(donation.sotien) || 0,
        hinh_anh_minh_chung: donation.chungtu,
        ngay_tai_tro: donation.ngaytaitro,
        trang_thai: donation.trangthai,
        ghi_chu: donation.ghichu,
        ngay_cap_nhat: donation.ngaycapnhat,
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
      hinhThuc: 'Chuyen khoan', // Cán bộ ghi nhận thường là chuyển khoản
      chungTu: hinh_anh_minh_chung || null,
      hinhAnhMinhChung: hinh_anh_minh_chung || null,
      creatorId: req.user?.id || null,
      isStaff: true,
    });

    // Ghi nhật ký hệ thống
    await logSystemActivity(req, {
      hanhdong: "THEM_MOI_KHOAN_TAI_TRO",
      loaidoituong: "khoantaitro",
      doituong_id: result.khoanTaiTroId,
      mota: `Ghi nhận khoản tài trợ số tiền ${amount.toLocaleString('vi-VN')} VNĐ vào quỹ '${fund.tenquy}'`,
      dulieumoi: { nhaTaiTroId: nha_tai_tro_id, quyId: quy_id, soTien: amount }
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
    // BƯỚC 4: LẤY THÔNG TIN TÀI KHOẢN NGÂN HÀNG CỦA QUỸ
    // ─────────────────────────────────────────────────────────────────────────
    // Lấy danh sách tài khoản ngân hàng thuộc quỹ này
    const bankAccounts = await BankAccountModel.getBankAccountsByFundId(quyId);
    
    // Lấy tài khoản chính (tài khoản đầu tiên đang hoạt động)
    const primaryAccount = bankAccounts.find(acc => acc.trangthai === 'Hoat dong') || bankAccounts[0];
    
    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 5: TRẢ VỀ THÔNG TIN DONATION VÀ THÔNG TIN NGÂN HÀNG
    // ─────────────────────────────────────────────────────────────────────────
    // Người dùng sẽ nhận được:
    // - Thông tin donation vừa tạo (ID, trạng thái, số tiền...)
    // - Thông tin tài khoản ngân hàng của quỹ để chuyển khoản
    // - Nội dung chuyển khoản (để hệ thống tự động đối soát)
    
    const responseData = {
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
          tenQuy: fund.tenquy
        },
        soTien: donationData.soTien,
        ghiChu: donationData.ghiChu,
        trangThai: 'Cho duyet',
        ngayTaiTro: new Date()
      }
    };

    // Nếu có tài khoản ngân hàng, thêm vào response
    if (primaryAccount) {
      responseData.bankInfo = {
        tenNganHang: primaryAccount.nganhang,
        chiNhanh: primaryAccount.chinhanh || null,
        soTaiKhoan: primaryAccount.sotaikhoan,
        chuTaiKhoan: primaryAccount.chutaikhoan,
        noiDung: `DONATE ${result.khoanTaiTroId} ${donationData.ten}`,
        soTien: donationData.soTien,
        ghiChu: "Vui lòng chuyển khoản đúng nội dung để hệ thống tự động xác nhận"
      };
    } else {
      // Nếu quỹ chưa có tài khoản ngân hàng, thông báo
      responseData.message = "Đăng ký đóng góp thành công. Quỹ chưa có thông tin tài khoản ngân hàng. Vui lòng liên hệ quản trị viên.";
      responseData.bankInfo = null;
    }

    return res.status(201).json(responseData);
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
    // Chỉ cho phép duyệt khoản tài trợ đang ở 'Cho duyet'
    if (donation.trangthai === 'Da duyet') {
      return res.status(400).json({
        success: false,
        message: "Khoản tài trợ này đã được duyệt trước đó",
      });
    }

    if (donation.trangthai === 'Tu choi') {
      return res.status(400).json({
        success: false,
        message: "Không thể duyệt khoản tài trợ đã bị từ chối",
      });
    }

    if (donation.trangthai !== 'Cho duyet') {
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
      chungTu: minh_chung_ke_toan || null,
    });

    // Ghi nhật ký hệ thống
    await logSystemActivity(req, {
      hanhdong: "DUYET_KHOAN_TAI_TRO",
      loaidoituong: "khoantaitro",
      doituong_id: id,
      mota: `Duyệt khoản tài trợ ID ${id} số tiền ${donation.sotien.toLocaleString('vi-VN')} VNĐ của nhà tài trợ '${donation.tennhataitro}' vào quỹ '${donation.tenquy}'`,
      dulieucu: { trangthai: donation.trangthai },
      dulieumoi: { trangthai: 'Da duyet' }
    });

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 5: TRẢ VỀ KẾT QUẢ
    // ─────────────────────────────────────────────────────────────────────────
    return res.status(200).json({
      success: true,
      message: "Duyệt khoản tài trợ thành công",
      donation: {
        khoanTaiTroId: donation.khoantaitro_id,
        nhaTaiTro: {
          id: donation.nhataitro_id,
          ten: donation.tennhataitro,
          email: donation.ntt_email,
          soDienThoai: donation.ntt_sodienthoai
        },
        quy: {
          id: donation.quy_id,
          tenQuy: donation.tenquy,
          loaiQuy: donation.loaiquy_id
        },
        soTien: donation.sotien,
        trangThaiCu: donation.trangthai,
        trangThaiMoi: 'Da duyet', // ✅ Sửa từ 'Da nhan' → 'Da duyet'
        ngayTaiTro: donation.ngaytaitro,
        ngayDuyet: new Date(),
        nguoiDuyet: nguoiDuyetId,
        ghiChu: donation.ghichu
      }
    });
  } catch (error) {
    console.error("Lỗi approveDonation:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
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
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
    if (donation.trangthai === 'Da duyet') {
      return res.status(400).json({
        success: false,
        message: "Không thể từ chối khoản tài trợ đã được duyệt",
      });
    }

    if (donation.trangthai === 'Tu choi') {
      return res.status(400).json({
        success: false,
        message: "Khoản tài trợ này đã bị từ chối trước đó",
      });
    }

    if (donation.trangthai !== 'Cho duyet') {
      return res.status(400).json({
        success: false,
        message: "Chỉ có thể từ chối khoản tài trợ đang ở trạng thái 'Chờ duyệt'",
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 4: TỪ CHỐI KHOẢN TÀI TRỢ
    // ─────────────────────────────────────────────────────────────────────────
    await DonationModel.rejectDonation(id, lyDoTuChoi.trim(), nguoiTuChoiId);

    // Ghi nhật ký hệ thống
    await logSystemActivity(req, {
      hanhdong: "TU_CHOI_KHOAN_TAI_TRO",
      loaidoituong: "khoantaitro",
      doituong_id: id,
      mota: `Từ chối khoản tài trợ ID ${id} số tiền ${donation.sotien.toLocaleString('vi-VN')} VNĐ của nhà tài trợ '${donation.tennhataitro}'. Lý do: ${lyDoTuChoi.trim()}`,
      dulieucu: { trangthai: donation.trangthai },
      dulieumoi: { trangthai: 'Tu choi', lydotuchoi: lyDoTuChoi.trim() }
    });

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 5: TRẢ VỀ KẾT QUẢ
    // ─────────────────────────────────────────────────────────────────────────
    return res.status(200).json({
      success: true,
      message: "Từ chối khoản tài trợ thành công",
      donation: {
        khoanTaiTroId: donation.khoantaitro_id,
        nhaTaiTro: {
          id: donation.nhataitro_id,
          ten: donation.tennhataitro,
          email: donation.ntt_email,
          soDienThoai: donation.ntt_sodienthoai
        },
        quy: {
          id: donation.quy_id,
          tenQuy: donation.tenquy
        },
        soTien: donation.sotien,
        trangThaiCu: donation.trangthai,
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

// ═══════════════════════════════════════════════════════════════════════════════
// ─── PUT /api/donations/:id/confirm (CHO ADMIN) ───────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
// 
// MỤC ĐÍCH: Admin xác nhận cuối cùng (đổi trạng thái Da duyet → Da nhan)
// LƯU Ý: KHÔNG cộng tiền vào quỹ (đã cộng ở bước Kế toán duyệt)
//
export const confirmDonation = async (req, res) => {
  try {
    const { id } = req.params;
    const { ghi_chu } = req.body || {};
    const nguoiXacNhanId = req.user.id;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID khoản tài trợ không hợp lệ",
      });
    }

    const donation = await DonationModel.getDonationById(id);
    
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy khoản tài trợ",
      });
    }

    // Chỉ cho phép xác nhận khoản đang ở 'Da duyet'
    if (donation.trangthai === 'Da nhan') {
      return res.status(400).json({
        success: false,
        message: "Khoản tài trợ này đã được xác nhận trước đó",
      });
    }

    if (donation.trangthai !== 'Da duyet') {
      return res.status(400).json({
        success: false,
        message: "Chỉ có thể xác nhận khoản tài trợ đang ở trạng thái 'Đã duyệt'",
      });
    }

    // Gọi Model để đổi trạng thái
    await DonationModel.confirmDonation(id, nguoiXacNhanId, {
      ghiChu: ghi_chu ? String(ghi_chu).trim() : null,
    });

    // Ghi nhật ký hệ thống
    await logSystemActivity(req, {
      hanhdong: "XAC_NHAN_KHOAN_TAI_TRO",
      loaidoituong: "khoantaitro",
      doituong_id: id,
      mota: `Xác nhận đã nhận tiền đóng góp số tiền ${donation.sotien.toLocaleString('vi-VN')} VNĐ cho khoản tài trợ ID ${id}`,
      dulieucu: { trangthai: donation.trangthai },
      dulieumoi: { trangthai: 'Da nhan' }
    });

    return res.status(200).json({
      success: true,
      message: "Xác nhận khoản tài trợ thành công",
      donation: {
        khoanTaiTroId: donation.khoantaitro_id,
        trangThaiCu: donation.trangthai,
        trangThaiMoi: 'Da nhan',
      }
    });
  } catch (error) {
    console.error("Lỗi confirmDonation:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── POST /api/donations/authenticated (CHO NHÀ TÀI TRỢ ĐÃ ĐĂNG NHẬP) ─────────
// ═══════════════════════════════════════════════════════════════════════════════
// Body: quy_id, so_tien, hinh_anh_minh_chung
// Tự động lấy thông tin từ req.user (đã đăng nhập)
export const createAuthenticatedDonation = async (req, res) => {
  try {
    const { quy_id, so_tien, hinh_anh_minh_chung, hinh_thuc, ghi_chu } = req.body;
    const userId = req.user?.id; // ✅ Sửa từ user_id → id (theo middleware protect)

    console.log('🔍 DEBUG createAuthenticatedDonation:', {
      userId,
      quy_id,
      so_tien,
      hinh_thuc,
      req_user: req.user
    });

    // Validation
    const isCash = hinh_thuc === 'Tien mat';
    if (!quy_id || !so_tien || (!isCash && !hinh_anh_minh_chung)) {
      return res.status(400).json({
        success: false,
        message: isCash 
          ? "Vui lòng nhập đầy đủ thông tin: quỹ, số tiền" 
          : "Vui lòng nhập đầy đủ thông tin: quỹ, số tiền, minh chứng",
      });
    }

    if (isNaN(so_tien) || Number(so_tien) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Số tiền phải lớn hơn 0",
      });
    }

    // Kiểm tra quỹ tồn tại
    const fund = await FundModel.getFundById(quy_id);
    if (!fund) {
      return res.status(404).json({
        success: false,
        message: "Quỹ không tồn tại",
      });
    }

    if (fund.trang_thai !== "Dang hoat dong") {
      return res.status(400).json({
        success: false,
        message: "Quỹ hiện không hoạt động",
      });
    }

    // Lấy thông tin nhà tài trợ từ user_id
    const donors = await DonorModel.getAllDonors();
    
    console.log('🔍 DEBUG getAllDonors:', {
      totalDonors: donors.length,
      sampleDonors: donors.slice(0, 3).map(d => ({ 
        nha_tai_tro_id: d.nhataitro_id, 
        user_id: d.nguoidung_id, 
        ten: d.tennhataitro 
      }))
    });
    
    let donor = donors.find(d => d.nguoidung_id === userId);

    console.log('🔍 DEBUG tìm donor:', {
      userId,
      userIdType: typeof userId,
      totalDonors: donors.length,
      donorFound: !!donor,
      donorDetails: donor ? { 
        id: donor.nhataitro_id, 
        user_id: donor.nguoidung_id, 
        user_id_type: typeof donor.nguoidung_id,
        ten: donor.tennhataitro 
      } : null
    });

    // Nếu chưa có record trong NhaTaiTro, tự động tạo
    if (!donor) {
      console.log(`User ${userId} chưa có trong NhaTaiTro, tự động tạo...`);
      
      // Lấy thông tin user từ database (do req.user từ middleware protect không chứa ho_ten)
      const [[userRow]] = await pool.query(
        `SELECT hoten FROM nguoidung WHERE nguoidung_id = ?`,
        [userId]
      );
      const userName = userRow?.hoten || req.user?.ho_ten || req.user?.hoTen || 'Nhà tài trợ';
      
      // Tạo nhà tài trợ mới
      const newDonorData = {
        nguoiDungId: userId,
        tenNhaTaiTro: userName,
        loaiNhaTaiTro: 'Ca nhan', // Mặc định là cá nhân
      };
      
      const result = await DonorModel.createDonor(newDonorData);
      const newDonorId = result.insertId;
      
      // Lấy lại thông tin donor vừa tạo
      donor = await DonorModel.getDonorById(newDonorId);
      
      if (!donor) {
        return res.status(500).json({
          success: false,
          message: "Không thể tạo thông tin nhà tài trợ. Vui lòng thử lại.",
        });
      }
      
      console.log(`Đã tạo nhà tài trợ mới: ID ${newDonorId}`);
    }

    // Tạo khoản tài trợ với trạng thái "Chờ duyệt"
    const result = await DonationModel.createStaffDonation({
      nhaTaiTroId: donor.nhataitro_id,
      quyId: quy_id,
      soTien: Number(so_tien),
      ghiChu: ghi_chu || `Quyên góp từ ${donor.hoten || donor.tennhataitro}`,
      hinhThuc: hinh_thuc || 'Chuyen khoan',
      chungTu: hinh_anh_minh_chung || null,
      hinhAnhMinhChung: hinh_anh_minh_chung || null,
      creatorId: userId,
      isStaff: false,
    });

    // Lấy thông tin tài khoản ngân hàng của quỹ
    const bankAccounts = await BankAccountModel.getBankAccountsByFundId(quy_id);
    const primaryAccount = bankAccounts.find(acc => acc.trangthai === 'Hoat dong') || bankAccounts[0];

    const responseData = {
      success: true,
      message: "Quyên góp thành công! Cảm ơn bạn đã đồng hành cùng TVU Fund.",
      data: {
        khoan_tai_tro_id: result.khoanTaiTroId,
        nha_tai_tro_id: donor.nhataitro_id,
        quy_id: quy_id,
        so_tien: Number(so_tien),
        trang_thai: "Cho duyet",
      }
    };

    // Thêm thông tin ngân hàng nếu có
    if (primaryAccount) {
      responseData.bankInfo = {
        tenNganHang: primaryAccount.nganhang,
        chiNhanh: primaryAccount.chinhanh || null,
        soTaiKhoan: primaryAccount.sotaikhoan,
        chuTaiKhoan: primaryAccount.chutaikhoan,
        noiDung: `DONATE ${result.khoanTaiTroId} ${donor.tennhataitro}`,
        soTien: Number(so_tien),
        ghiChu: "Vui lòng chuyển khoản đúng nội dung để hệ thống tự động xác nhận"
      };
    }

    return res.status(201).json(responseData);
  } catch (error) {
    console.error("Lỗi createAuthenticatedDonation:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── GET /api/donations/my-donations (LẤY LỊCH SỬ CỦA TÀI KHOẢN ĐANG ĐĂNG NHẬP) 
// ═══════════════════════════════════════════════════════════════════════════════
export const getMyDonations = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Không có quyền truy cập, vui lòng đăng nhập",
      });
    }

    // Lấy thông tin nhà tài trợ từ user_id
    const donors = await DonorModel.getAllDonors();
    let donor = donors.find(d => d.nguoidung_id === userId);

    if (!donor) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    // Lấy lịch sử quyên góp từ DonorModel
    const rows = await DonorModel.getDonationHistory(donor.nhataitro_id);

    // Ánh xạ sang các trường mà frontend mong đợi
    const data = rows.map((r) => ({
      id: r.khoantaitro_id,
      soTien: Number(r.sotien) || 0,
      hinhThuc: r.hinhthuc,
      trangThai: r.trangthai,
      ngayQuyenGop: r.ngaytaitro,
      ghiChu: r.ghichu,
      phuongThuc: r.hinhthuc,
      tenQuy: r.tenquy,
    }));

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Lỗi getMyDonations:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, không thể lấy lịch sử quyên góp",
    });
  }
};

