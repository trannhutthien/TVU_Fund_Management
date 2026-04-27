import DonorModel from "../models/DonorModel.js";

// ═══════════════════════════════════════════════════════════════════════════════
// ─── POST /api/donors (API CHO ADMIN/GIÁO VỤ) ─────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
// 
// MỤC ĐÍCH: Admin/Giáo vụ tạo nhà tài trợ THỦ CÔNG trong hệ thống
// 
// PHÂN BIỆT VỚI API PUBLIC:
// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ API này (POST /api/donors):                                                 │
// │ ✅ YÊU CẦU: Token + Quyền Admin/Giáo vụ (role_id: 1 hoặc 3)                │
// │ ✅ MỤC ĐÍCH: Nhân viên tạo nhà tài trợ trước (VD: đối tác, doanh nghiệp)   │
// │ ✅ KHÔNG TẠO KHOẢN TÀI TRỢ: Chỉ tạo thông tin nhà tài trợ                  │
// │                                                                             │
// │ API Public (POST /api/donations/public):                                   │
// │ ✅ KHÔNG CẦN TOKEN: Người dùng bên ngoài truy cập                          │
// │ ✅ MỤC ĐÍCH: Người dùng muốn quyên góp ngay                                │
// │ ✅ TỰ ĐỘNG TẠO NHÀ TÀI TRỢ: Nếu email chưa tồn tại                         │
// │ ✅ TẠO KHOẢN TÀI TRỢ: Với trạng thái "Chờ duyệt"                           │
// └─────────────────────────────────────────────────────────────────────────────┘
//
// LUỒNG HOẠT ĐỘNG:
// 1. Kiểm tra token hợp lệ (middleware protect)
// 2. Kiểm tra quyền Admin/Giáo vụ (middleware authorizeRoles)
// 3. Validate dữ liệu đầu vào
// 4. Kiểm tra email và số điện thoại đã tồn tại chưa
// 5. INSERT vào bảng NhaTaiTro
// 6. Trả về thông tin nhà tài trợ vừa tạo
//
export const createDonor = async (req, res) => {
  try {
    const {
      tenNhaTaiTro,
      loai,
      email,
      soDienThoai,
      diaChi
    } = req.body;

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 1: VALIDATE DỮ LIỆU ĐẦU VÀO
    // ─────────────────────────────────────────────────────────────────────────
    
    // 1.1. Kiểm tra tên nhà tài trợ (BẮT BUỘC)
    if (!tenNhaTaiTro || tenNhaTaiTro.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập tên nhà tài trợ",
      });
    }

    // 1.2. Validate độ dài tên nhà tài trợ (tối đa 150 ký tự)
    if (tenNhaTaiTro.trim().length > 150) {
      return res.status(400).json({
        success: false,
        message: "Tên nhà tài trợ không được vượt quá 150 ký tự",
      });
    }

    // 1.3. Validate loại nhà tài trợ (không bắt buộc, mặc định "Ca nhan")
    if (loai && loai.trim().length > 50) {
      return res.status(400).json({
        success: false,
        message: "Loại không được vượt quá 50 ký tự",
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 2: VALIDATE VÀ KIỂM TRA TRÙNG LẶP EMAIL
    // ─────────────────────────────────────────────────────────────────────────
    
    // 2.1. Validate email format (nếu có)
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Email không đúng định dạng",
        });
      }

      // Validate độ dài email
      if (email.length > 150) {
        return res.status(400).json({
          success: false,
          message: "Email không được vượt quá 150 ký tự",
        });
      }

      // 2.2. Kiểm tra email đã tồn tại chưa (UNIQUE constraint)
      // LƯU Ý: API này không cho phép tạo nhà tài trợ trùng email
      // Khác với API public - API public sẽ dùng lại nhà tài trợ cũ nếu email trùng
      const emailExists = await DonorModel.checkEmailExists(email.trim());
      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: "Email đã được sử dụng",
        });
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 3: VALIDATE VÀ KIỂM TRA TRÙNG LẶP SỐ ĐIỆN THOẠI
    // ─────────────────────────────────────────────────────────────────────────
    
    // 3.1. Validate số điện thoại (nếu có)
    if (soDienThoai) {
      // Validate format số điện thoại Việt Nam (10-11 số)
      const phoneRegex = /^[0-9]{10,11}$/;
      if (!phoneRegex.test(soDienThoai.trim())) {
        return res.status(400).json({
          success: false,
          message: "Số điện thoại không đúng định dạng (10-11 số)",
        });
      }

      // Validate độ dài
      if (soDienThoai.length > 20) {
        return res.status(400).json({
          success: false,
          message: "Số điện thoại không được vượt quá 20 ký tự",
        });
      }

      // 3.2. Kiểm tra số điện thoại đã tồn tại chưa (UNIQUE constraint)
      const phoneExists = await DonorModel.checkPhoneExists(soDienThoai.trim());
      if (phoneExists) {
        return res.status(409).json({
          success: false,
          message: "Số điện thoại đã được sử dụng",
        });
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 4: VALIDATE ĐỊA CHỈ
    // ─────────────────────────────────────────────────────────────────────────
    
    // 4.1. Validate địa chỉ (nếu có, tối đa 255 ký tự)
    if (diaChi && diaChi.trim().length > 255) {
      return res.status(400).json({
        success: false,
        message: "Địa chỉ không được vượt quá 255 ký tự",
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 5: TẠO NHÀ TÀI TRỢ MỚI TRONG DATABASE
    // ─────────────────────────────────────────────────────────────────────────
    
    // 5.1. Chuẩn bị dữ liệu để insert
    const donorData = {
      tenNhaTaiTro: tenNhaTaiTro.trim(),
      loai: loai ? loai.trim() : 'Ca nhan',
      email: email ? email.trim() : null,
      soDienThoai: soDienThoai ? soDienThoai.trim() : null,
      diaChi: diaChi ? diaChi.trim() : null
    };

    // 5.2. Thực hiện INSERT vào bảng NhaTaiTro
    const result = await DonorModel.createDonor(donorData);

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 6: LẤY THÔNG TIN NHÀ TÀI TRỢ VỪA TẠO VÀ TRẢ VỀ
    // ─────────────────────────────────────────────────────────────────────────
    
    // 6.1. Query lại thông tin nhà tài trợ vừa tạo
    const newDonor = await DonorModel.getDonorById(result.insertId);

    // 6.2. Trả về response thành công
    return res.status(201).json({
      success: true,
      message: "Tạo nhà tài trợ thành công",
      donor: {
        nhaTaiTroId: newDonor.nha_tai_tro_id,
        tenNhaTaiTro: newDonor.ten_nha_tai_tro,
        loai: newDonor.loai,
        email: newDonor.email,
        soDienThoai: newDonor.so_dien_thoai,
        diaChi: newDonor.dia_chi,
        createdAt: newDonor.created_at
      }
    });
  } catch (error) {
    console.error("Lỗi createDonor:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};
