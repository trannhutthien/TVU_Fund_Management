import DonationModel from "../models/DonationModel.js";
import FundModel from "../models/FundModel.js";

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
