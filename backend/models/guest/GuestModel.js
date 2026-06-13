import pool from "../../config/db.js";

/**
 * Tạo đơn yêu cầu hỗ trợ vãng lai (lưu vào bảng tạm)
 */
const createGuestApplication = async (data) => {
  const {
    guestHoTen,
    guestEmail,
    guestSoDienThoai,
    guestMssv,
    guestKhoa,
    guestLop,
    guestSoTaiKhoan,
    guestNganHang,
    guestChuTaiKhoan,
    quyId,
    lyDo,
    soTienDeNghi,
    taiLieuDinhKem,
    otpCode,
    otpExpiresAt,
    trackingUuid,
  } = data;

  const [result] = await pool.execute(
    `INSERT INTO guest_yeucauhotro (
      guest_hoten,
      guest_email,
      guest_sodienthoai,
      guest_mssv,
      guest_khoa,
      guest_lop,
      guest_sotaikhoan,
      guest_nganhang,
      guest_chutaikhoan,
      quy_id,
      lydo,
      sotiendenghi,
      tailieudinhkem,
      otp_code,
      otp_expires_at,
      tracking_uuid,
      trang_thai_staging
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CHO_XAC_MINH')`,
    [
      guestHoTen,
      guestEmail,
      guestSoDienThoai || null,
      guestMssv || null,
      guestKhoa || null,
      guestLop || null,
      guestSoTaiKhoan || null,
      guestNganHang || null,
      guestChuTaiKhoan || null,
      quyId,
      lyDo,
      soTienDeNghi,
      taiLieuDinhKem || null,
      otpCode,
      otpExpiresAt,
      trackingUuid,
    ]
  );

  return result.insertId;
};

/**
 * Tạo khoản quyên góp vãng lai (lưu vào bảng tạm)
 */
const createGuestDonation = async (data) => {
  const {
    guestHoTen,
    guestEmail,
    guestSoDienThoai,
    guestToChuc,
    guestDiaChi,
    quyId,
    soTien,
    hinhThuc,
    maGiaoDich,
    ngayTaiTro,
    chungTu,
    ghiChu,
    otpCode,
    otpExpiresAt,
    trackingUuid,
  } = data;

  const [result] = await pool.execute(
    `INSERT INTO guest_khoantaitro (
      guest_hoten,
      guest_email,
      guest_sodienthoai,
      guest_tochuc,
      guest_diachi,
      quy_id,
      sotien,
      hinhthuc,
      magiaodich,
      ngaytaitro,
      chungtu,
      ghichu,
      otp_code,
      otp_expires_at,
      tracking_uuid,
      trang_thai_staging
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CHO_XAC_MINH')`,
    [
      guestHoTen,
      guestEmail,
      guestSoDienThoai || null,
      guestToChuc || null,
      guestDiaChi || null,
      quyId,
      soTien,
      hinhThuc || "Chuyen khoan",
      maGiaoDich || null,
      ngayTaiTro || new Date(),
      chungTu || null,
      ghiChu || null,
      otpCode,
      otpExpiresAt,
      trackingUuid,
    ]
  );

  return result.insertId;
};

/**
 * Tìm đơn yêu cầu hỗ trợ theo email và mã OTP đang chờ xác minh
 */
const findApplicationByEmailAndOtp = async (email, otpCode) => {
  const [rows] = await pool.query(
    `SELECT * FROM guest_yeucauhotro 
     WHERE guest_email = ? AND otp_code = ? AND trang_thai_staging = 'CHO_XAC_MINH'
     ORDER BY ngaytao DESC LIMIT 1`,
    [email, otpCode]
  );
  return rows[0] || null;
};

/**
 * Tìm đơn tài trợ theo email và mã OTP đang chờ xác minh
 */
const findDonationByEmailAndOtp = async (email, otpCode) => {
  const [rows] = await pool.query(
    `SELECT * FROM guest_khoantaitro 
     WHERE guest_email = ? AND otp_code = ? AND trang_thai_staging = 'CHO_XAC_MINH'
     ORDER BY ngaytao DESC LIMIT 1`,
    [email, otpCode]
  );
  return rows[0] || null;
};

/**
 * Xác minh OTP và di chuyển đơn xin hỗ trợ sang bảng chính (Sử dụng Transaction)
 */
const verifyOTPAndMigrateApplication = async (email, otpCode, plainPassword) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Tìm bản ghi ở guest_yeucauhotro
    const [apps] = await connection.query(
      `SELECT * FROM guest_yeucauhotro 
       WHERE guest_email = ? AND otp_code = ? AND trang_thai_staging = 'CHO_XAC_MINH'
       LIMIT 1 FOR UPDATE`,
      [email, otpCode]
    );

    if (apps.length === 0) {
      throw new Error("OTP_INVALID_OR_NOT_FOUND");
    }

    const app = apps[0];

    // Kiểm tra OTP hết hạn
    if (new Date() > new Date(app.otp_expires_at)) {
      await connection.query(
        `UPDATE guest_yeucauhotro SET trang_thai_staging = 'HET_HAN' WHERE guest_yeucauhotro_id = ?`,
        [app.guest_yeucauhotro_id]
      );
      await connection.commit();
      throw new Error("OTP_EXPIRED");
    }

    // 2. Tìm hoặc tạo tài khoản nguoidung
    const [users] = await connection.query(
      `SELECT nguoidung_id FROM nguoidung WHERE email = ? LIMIT 1`,
      [email]
    );

    let nguoiDungId;

    if (users.length > 0) {
      nguoiDungId = users[0].nguoidung_id;
    } else {
      // Hash mật khẩu
      const bcrypt = await import("bcryptjs");
      const hashedPassword = await bcrypt.default.hash(plainPassword, 10);
      const maSoDinhDanh = app.guest_mssv || `SV${Date.now()}`;

      // Tìm hoặc tạo donvihoc_id (Khoa)
      let donvihoc_id = null;
      if (app.guest_khoa) {
        const [dvRows] = await connection.query(
          "SELECT donvihoc_id FROM donvihoc WHERE tenkhoa = ? LIMIT 1",
          [app.guest_khoa]
        );
        if (dvRows.length > 0) {
          donvihoc_id = dvRows[0].donvihoc_id;
        } else {
          const madonvi = `DV${Date.now()}${Math.floor(Math.random() * 1000)}`;
          const [dvInsert] = await connection.query(
            "INSERT INTO donvihoc (madonvi, tenkhoa, trangthai) VALUES (?, ?, 'Hoat dong')",
            [madonvi, app.guest_khoa]
          );
          donvihoc_id = dvInsert.insertId;
        }
      }

      // Tạo người dùng vai trò Sinh viên (vaitro_id = 4)
      const [userInsert] = await connection.query(
        `INSERT INTO nguoidung (
          email, matkhau, hoten, masodinhdanh, sodienthoai, vaitro_id, loaitaikhoan, donvihoc_id, trangthai
        ) VALUES (?, ?, ?, ?, ?, 4, 'Sinh vien', ?, 'Hoat dong')`,
        [email, hashedPassword, app.guest_hoten, maSoDinhDanh, app.guest_sodienthoai, donvihoc_id]
      );
      nguoiDungId = userInsert.insertId;

      // Lưu tài khoản ngân hàng nhận tiền
      if (app.guest_sotaikhoan && app.guest_nganhang && app.guest_chutaikhoan) {
        const [bankInsert] = await connection.query(
          `INSERT INTO taikhoannganhang (sotaikhoan, nganhang, chutaikhoan, trangthai) 
           VALUES (?, ?, ?, 'Hoat dong')`,
          [app.guest_sotaikhoan, app.guest_nganhang, app.guest_chutaikhoan]
        );
        const bankAccountId = bankInsert.insertId;

        // Cập nhật tài khoản ngân hàng liên kết vào user
        await connection.query(
          `UPDATE nguoidung SET taikhoannganhang_id = ? WHERE nguoidung_id = ?`,
          [bankAccountId, nguoiDungId]
        );
      }
    }

    // 3. Migrate đơn sang yeucauhotro chính
    const [appInsert] = await connection.query(
      `INSERT INTO yeucauhotro (
        nguoidung_id, quy_id, lydo, sotiendenghi, tailieudinhkem, trangthai
      ) VALUES (?, ?, ?, ?, ?, 'Cho duyet cap 1')`,
      [nguoiDungId, app.quy_id, app.lydo, app.sotiendenghi, app.tailieudinhkem]
    );
    const yeucauhotroId = appInsert.insertId;

    // 4. Tạo lịch sử phê duyệt 3 cấp
    const capDoDuyet = [1, 2, 3];
    for (const cap of capDoDuyet) {
      await connection.execute(
        `INSERT INTO pheduyet (
          yeucauhotro_id, nguoiduyet_id, capduyet, ketqua
        ) VALUES (?, NULL, ?, 'Cho duyet')`,
        [yeucauhotroId, cap]
      );
    }

    // 5. Cập nhật trạng thái bảng tạm
    await connection.query(
      `UPDATE guest_yeucauhotro 
       SET trang_thai_staging = 'DA_CHUYEN',
           is_email_verified = 1,
           yeucauhotro_id_ref = ?,
           nguoidung_id_ref = ?
       WHERE guest_yeucauhotro_id = ?`,
      [yeucauhotroId, nguoiDungId, app.guest_yeucauhotro_id]
    );

    await connection.commit();

    return {
      success: true,
      yeucauhotroId,
      nguoiDungId,
      trackingUuid: app.tracking_uuid,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Xác minh OTP và di chuyển đơn quyên góp sang bảng chính (Sử dụng Transaction)
 */
const verifyOTPAndMigrateDonation = async (email, otpCode, plainPassword) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Tìm bản ghi ở guest_khoantaitro
    const [donations] = await connection.query(
      `SELECT * FROM guest_khoantaitro 
       WHERE guest_email = ? AND otp_code = ? AND trang_thai_staging = 'CHO_XAC_MINH'
       LIMIT 1 FOR UPDATE`,
      [email, otpCode]
    );

    if (donations.length === 0) {
      throw new Error("OTP_INVALID_OR_NOT_FOUND");
    }

    const don = donations[0];

    // Kiểm tra OTP hết hạn
    if (new Date() > new Date(don.otp_expires_at)) {
      await connection.query(
        `UPDATE guest_khoantaitro SET trang_thai_staging = 'HET_HAN' WHERE guest_khoantaitro_id = ?`,
        [don.guest_khoantaitro_id]
      );
      await connection.commit();
      throw new Error("OTP_EXPIRED");
    }

    // 2. Tìm hoặc tạo tài khoản nguoidung
    const [users] = await connection.query(
      `SELECT nguoidung_id FROM nguoidung WHERE email = ? LIMIT 1`,
      [email]
    );

    let nguoiDungId;

    if (users.length > 0) {
      nguoiDungId = users[0].nguoidung_id;
    } else {
      // Hash mật khẩu
      const bcrypt = await import("bcryptjs");
      const hashedPassword = await bcrypt.default.hash(plainPassword, 10);
      const maSoDinhDanh = `GG${Date.now()}`;

      // Tạo người dùng vai trò Nhà tài trợ / Thường (vaitro_id = 4)
      const [userInsert] = await connection.query(
        `INSERT INTO nguoidung (
          email, matkhau, hoten, masodinhdanh, sodienthoai, vaitro_id, loaitaikhoan, trangthai, diachi
        ) VALUES (?, ?, ?, ?, ?, 4, 'Nha tai tro', 'Hoat dong', ?)`,
        [email, hashedPassword, don.guest_hoten, maSoDinhDanh, don.guest_sodienthoai, don.guest_diachi]
      );
      nguoiDungId = userInsert.insertId;
    }

    // 3. Tìm hoặc tạo record nhataitro tương ứng
    const [donors] = await connection.query(
      `SELECT nhataitro_id FROM nhataitro WHERE nguoidung_id = ? LIMIT 1`,
      [nguoiDungId]
    );

    let nhaTaiTroId;

    if (donors.length > 0) {
      nhaTaiTroId = donors[0].nhataitro_id;
    } else {
      const loaiNhaTaiTro = don.guest_tochuc ? "To chuc" : "Ca nhan";
      const [donorInsert] = await connection.query(
        `INSERT INTO nhataitro (nguoidung_id, tennhataitro, loainhataitro, email, sodienthoai, diachi, trangthai) 
         VALUES (?, ?, ?, ?, ?, ?, 'Hoat dong')`,
        [nguoiDungId, don.guest_hoten, loaiNhaTaiTro, email, don.guest_sodienthoai, don.guest_diachi]
      );
      nhaTaiTroId = donorInsert.insertId;
    }

    // 4. Migrate khoản tài trợ sang khoantaitro chính
    const [donationInsert] = await connection.query(
      `INSERT INTO khoantaitro (
        nhataitro_id, quy_id, sotien, hinhthuc, magiaodich, ngaytaitro, chungtu, trangthai, ghichu
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Cho duyet', ?)`,
      [nhaTaiTroId, don.quy_id, don.sotien, don.hinhthuc, don.magiaodich, don.ngaytaitro, don.chungtu, don.ghichu]
    );
    const khoanTaiTroId = donationInsert.insertId;

    // 5. Cập nhật trạng thái bảng tạm guest_khoantaitro
    await connection.query(
      `UPDATE guest_khoantaitro 
       SET trang_thai_staging = 'DA_CHUYEN',
           is_email_verified = 1,
           khoantaitro_id_ref = ?,
           nhataitro_id_ref = ?
       WHERE guest_khoantaitro_id = ?`,
      [khoanTaiTroId, nhaTaiTroId, don.guest_khoantaitro_id]
    );

    await connection.commit();

    return {
      success: true,
      khoanTaiTroId,
      nhaTaiTroId,
      nguoiDungId,
      trackingUuid: don.tracking_uuid,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Tra cứu trạng thái đơn theo UUID
 */
const trackStatusByUuid = async (uuid) => {
  // Thử tìm trong bảng guest_yeucauhotro trước
  const [appRows] = await pool.query(
    `SELECT 
      g.guest_yeucauhotro_id,
      g.guest_hoten,
      g.guest_email,
      g.quy_id,
      g.sotiendenghi,
      g.trang_thai_staging,
      g.yeucauhotro_id_ref,
      g.ngaytao,
      q.tenquy,
      yc.trangthai as real_status,
      yc.ghichu as real_ghichu
     FROM guest_yeucauhotro g
     INNER JOIN quy q ON g.quy_id = q.quy_id
     LEFT JOIN yeucauhotro yc ON g.yeucauhotro_id_ref = yc.yeucauhotro_id
     WHERE g.tracking_uuid = ? LIMIT 1`,
    [uuid]
  );

  if (appRows.length > 0) {
    const data = appRows[0];
    return {
      type: "application",
      name: data.guest_hoten,
      email: data.guest_email,
      fundName: data.tenquy,
      amount: parseFloat(data.sotiendenghi),
      stagingStatus: data.trang_thai_staging,
      realStatus: data.real_status || "CHO_XAC_MINH",
      note: data.real_ghichu || "",
      createdAt: data.ngaytao,
    };
  }

  // Thử tìm trong bảng guest_khoantaitro
  const [donorRows] = await pool.query(
    `SELECT 
      g.guest_khoantaitro_id,
      g.guest_hoten,
      g.guest_email,
      g.quy_id,
      g.sotien,
      g.trang_thai_staging,
      g.khoantaitro_id_ref,
      g.ngaytao,
      q.tenquy,
      kt.trangthai as real_status,
      kt.ghichu as real_ghichu
     FROM guest_khoantaitro g
     INNER JOIN quy q ON g.quy_id = q.quy_id
     LEFT JOIN khoantaitro kt ON g.khoantaitro_id_ref = kt.khoantaitro_id
     WHERE g.tracking_uuid = ? LIMIT 1`,
    [uuid]
  );

  if (donorRows.length > 0) {
    const data = donorRows[0];
    return {
      type: "donation",
      name: data.guest_hoten,
      email: data.guest_email,
      fundName: data.tenquy,
      amount: parseFloat(data.sotien),
      stagingStatus: data.trang_thai_staging,
      realStatus: data.real_status || "CHO_XAC_MINH",
      note: data.real_ghichu || "",
      createdAt: data.ngaytao,
    };
  }

  return null;
};

export default {
  createGuestApplication,
  createGuestDonation,
  findApplicationByEmailAndOtp,
  findDonationByEmailAndOtp,
  verifyOTPAndMigrateApplication,
  verifyOTPAndMigrateDonation,
  trackStatusByUuid,
};
