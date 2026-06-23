import pool from "../../config/db.js";

const toApplicationRow = (data) => ({
  guest_hoten: data.guest_hoten ?? data.guestHoTen,
  guest_email: data.guest_email ?? data.guestEmail,
  guest_sodienthoai: data.guest_sodienthoai ?? data.guestSoDienThoai ?? null,
  guest_mssv: data.guest_mssv ?? data.guestMssv ?? null,
  guest_khoa: data.guest_khoa ?? data.guestKhoa ?? null,
  guest_lop: data.guest_lop ?? data.guestLop ?? null,
  guest_sotaikhoan: data.guest_sotaikhoan ?? data.guestSoTaiKhoan ?? null,
  guest_nganhang: data.guest_nganhang ?? data.guestNganHang ?? null,
  guest_chutaikhoan: data.guest_chutaikhoan ?? data.guestChuTaiKhoan ?? null,
  quy_id: data.quy_id ?? data.quyId,
  lydo: data.lydo ?? data.lyDo,
  sotiendenghi: data.sotiendenghi ?? data.soTienDeNghi,
  tailieudinhkem: data.tailieudinhkem ?? data.taiLieuDinhKem ?? null,
  tracking_uuid: data.tracking_uuid ?? data.trackingUuid,
});

const toDonationRow = (data) => ({
  guest_hoten: data.guest_hoten ?? data.guestHoTen,
  guest_email: data.guest_email ?? data.guestEmail,
  guest_sodienthoai: data.guest_sodienthoai ?? data.guestSoDienThoai ?? null,
  guest_tochuc: data.guest_tochuc ?? data.guestToChuc ?? null,
  guest_diachi: data.guest_diachi ?? data.guestDiaChi ?? null,
  quy_id: data.quy_id ?? data.quyId,
  sotien: data.sotien ?? data.soTien,
  hinhthuc: data.hinhthuc ?? data.hinhThuc ?? "Chuyen khoan",
  magiaodich: data.magiaodich ?? data.maGiaoDich ?? null,
  ngaytaitro: data.ngaytaitro ?? data.ngayTaiTro ?? new Date(),
  chungtu: data.chungtu ?? data.chungTu ?? null,
  ghichu: data.ghichu ?? data.ghiChu ?? null,
  tracking_uuid: data.tracking_uuid ?? data.trackingUuid,
});

const ensureApplicationDonViHocId = async (connection, tenKhoa) => {
  if (!tenKhoa) return null;

  const [dvRows] = await connection.query(
    "SELECT donvihoc_id FROM donvihoc WHERE tenkhoa = ? LIMIT 1",
    [tenKhoa]
  );

  if (dvRows.length > 0) {
    return dvRows[0].donvihoc_id;
  }

  const madonvi = `DV${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const [dvInsert] = await connection.query(
    "INSERT INTO donvihoc (madonvi, tenkhoa, trangthai) VALUES (?, ?, 'Hoat dong')",
    [madonvi, tenKhoa]
  );

  return dvInsert.insertId;
};

const ensureApplicationUser = async (connection, app, email, plainPassword) => {
  const [users] = await connection.query(
    "SELECT nguoidung_id FROM nguoidung WHERE email = ? LIMIT 1",
    [email]
  );

  if (users.length > 0) {
    return users[0].nguoidung_id;
  }

  const bcrypt = await import("bcryptjs");
  const hashedPassword = await bcrypt.default.hash(plainPassword, 10);
  const maSoDinhDanh = app.guest_mssv || `SV${Date.now()}`;
  const donvihocId = await ensureApplicationDonViHocId(connection, app.guest_khoa);

  const [userInsert] = await connection.query(
    `INSERT INTO nguoidung (
      email, matkhau, hoten, masodinhdanh, sodienthoai, vaitro_id, loaitaikhoan, donvihoc_id, trangthai
    ) VALUES (?, ?, ?, ?, ?, 4, 'Sinh vien', ?, 'Hoat dong')`,
    [email, hashedPassword, app.guest_hoten, maSoDinhDanh, app.guest_sodienthoai, donvihocId]
  );

  return userInsert.insertId;
};

const upsertApplicationBankAccount = async (connection, nguoiDungId, app) => {
  if (!app.guest_sotaikhoan || !app.guest_nganhang || !app.guest_chutaikhoan) {
    return null;
  }

  const soTaiKhoan = String(app.guest_sotaikhoan).trim();
  const nganHang = String(app.guest_nganhang).trim();
  const chuTaiKhoan = String(app.guest_chutaikhoan).trim().toUpperCase();

  const [userRows] = await connection.query(
    "SELECT taikhoannganhang_id FROM nguoidung WHERE nguoidung_id = ? LIMIT 1",
    [nguoiDungId]
  );
  const existingAccountId = userRows[0]?.taikhoannganhang_id;

  if (existingAccountId) {
    await connection.query(
      `UPDATE taikhoannganhang
       SET sotaikhoan = ?, nganhang = ?, chutaikhoan = ?
       WHERE taikhoannganhang_id = ?`,
      [soTaiKhoan, nganHang, chuTaiKhoan, existingAccountId]
    );
    return existingAccountId;
  }

  const [bankInsert] = await connection.query(
    `INSERT INTO taikhoannganhang (quy_id, sotaikhoan, nganhang, chutaikhoan, trangthai)
     VALUES (NULL, ?, ?, ?, 'Hoat dong')`,
    [soTaiKhoan, nganHang, chuTaiKhoan]
  );
  const bankAccountId = bankInsert.insertId;

  await connection.query(
    "UPDATE nguoidung SET taikhoannganhang_id = ? WHERE nguoidung_id = ?",
    [bankAccountId, nguoiDungId]
  );

  return bankAccountId;
};

const createMainApplicationRecords = async (connection, app, nguoiDungId) => {
  const [appInsert] = await connection.query(
    `INSERT INTO yeucauhotro (
      nguoidung_id, quy_id, lydo, sotiendenghi, tailieudinhkem, trangthai
    ) VALUES (?, ?, ?, ?, ?, 'Cho duyet cap 1')`,
    [nguoiDungId, app.quy_id, app.lydo, app.sotiendenghi, app.tailieudinhkem]
  );
  const yeucauhotroId = appInsert.insertId;

  for (const cap of [1, 2, 3]) {
    await connection.execute(
      `INSERT INTO pheduyet (
        yeucauhotro_id, nguoiduyet_id, capduyet, ketqua
      ) VALUES (?, NULL, ?, 'Cho duyet')`,
      [yeucauhotroId, cap]
    );
  }

  return yeucauhotroId;
};

const ensureDonationUser = async (connection, don, email, plainPassword) => {
  const [users] = await connection.query(
    "SELECT nguoidung_id FROM nguoidung WHERE email = ? LIMIT 1",
    [email]
  );

  if (users.length > 0) {
    return users[0].nguoidung_id;
  }

  const bcrypt = await import("bcryptjs");
  const hashedPassword = await bcrypt.default.hash(plainPassword, 10);
  const maSoDinhDanh = `GG${Date.now()}`;

  const [userInsert] = await connection.query(
    `INSERT INTO nguoidung (
      email, matkhau, hoten, masodinhdanh, sodienthoai, vaitro_id, loaitaikhoan, trangthai, diachi
    ) VALUES (?, ?, ?, ?, ?, 4, 'Nha tai tro', 'Hoat dong', ?)`,
    [email, hashedPassword, don.guest_hoten, maSoDinhDanh, don.guest_sodienthoai, don.guest_diachi]
  );

  return userInsert.insertId;
};

const ensureDonorRecord = async (connection, don, email, nguoiDungId) => {
  const [donors] = await connection.query(
    "SELECT nhataitro_id FROM nhataitro WHERE nguoidung_id = ? LIMIT 1",
    [nguoiDungId]
  );

  if (donors.length > 0) {
    return donors[0].nhataitro_id;
  }

  const loaiNhaTaiTro = don.guest_tochuc ? "To chuc" : "Ca nhan";
  const tenNhaTaiTro = don.guest_tochuc || don.guest_hoten;
  const [donorInsert] = await connection.query(
    `INSERT INTO nhataitro (nguoidung_id, tennhataitro, loainhataitro, email, sodienthoai, diachi, trangthai)
     VALUES (?, ?, ?, ?, ?, ?, 'Hoat dong')`,
    [nguoiDungId, tenNhaTaiTro, loaiNhaTaiTro, email, don.guest_sodienthoai, don.guest_diachi]
  );

  return donorInsert.insertId;
};

const createMainDonationRecord = async (connection, don, nhaTaiTroId) => {
  const [donationInsert] = await connection.query(
    `INSERT INTO khoantaitro (
      nhataitro_id, quy_id, sotien, hinhthuc, magiaodich, ngaytaitro, chungtu, trangthai, ghichu
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Cho duyet', ?)`,
    [nhaTaiTroId, don.quy_id, don.sotien, don.hinhthuc, don.magiaodich, don.ngaytaitro, don.chungtu, don.ghichu]
  );

  return donationInsert.insertId;
};

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
    await upsertApplicationBankAccount(connection, nguoiDungId, app);

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
const verifyOTPAndCreateApplication = async (applicationData, plainPassword) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const app = toApplicationRow(applicationData);
    const email = app.guest_email;

    const [existingRows] = await connection.query(
      "SELECT guest_yeucauhotro_id FROM guest_yeucauhotro WHERE tracking_uuid = ? LIMIT 1 FOR UPDATE",
      [app.tracking_uuid]
    );

    if (existingRows.length > 0) {
      throw new Error("OTP_ALREADY_VERIFIED");
    }

    const [guestInsert] = await connection.query(
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
        trang_thai_staging,
        is_email_verified
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?, 'DA_CHUYEN', 1)`,
      [
        app.guest_hoten,
        app.guest_email,
        app.guest_sodienthoai,
        app.guest_mssv,
        app.guest_khoa,
        app.guest_lop,
        app.guest_sotaikhoan,
        app.guest_nganhang,
        app.guest_chutaikhoan,
        app.quy_id,
        app.lydo,
        app.sotiendenghi,
        app.tailieudinhkem,
        app.tracking_uuid,
      ]
    );

    const nguoiDungId = await ensureApplicationUser(connection, app, email, plainPassword);
    await upsertApplicationBankAccount(connection, nguoiDungId, app);
    const yeucauhotroId = await createMainApplicationRecords(connection, app, nguoiDungId);

    await connection.query(
      `UPDATE guest_yeucauhotro
       SET yeucauhotro_id_ref = ?,
           nguoidung_id_ref = ?
       WHERE guest_yeucauhotro_id = ?`,
      [yeucauhotroId, nguoiDungId, guestInsert.insertId]
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

const verifyOTPAndCreateDonation = async (donationData, plainPassword) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const don = toDonationRow(donationData);
    const email = don.guest_email;

    const [existingRows] = await connection.query(
      "SELECT guest_khoantaitro_id FROM guest_khoantaitro WHERE tracking_uuid = ? LIMIT 1 FOR UPDATE",
      [don.tracking_uuid]
    );

    if (existingRows.length > 0) {
      throw new Error("OTP_ALREADY_VERIFIED");
    }

    const [guestInsert] = await connection.query(
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
        trang_thai_staging,
        is_email_verified
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?, 'DA_CHUYEN', 1)`,
      [
        don.guest_hoten,
        don.guest_email,
        don.guest_sodienthoai,
        don.guest_tochuc,
        don.guest_diachi,
        don.quy_id,
        don.sotien,
        don.hinhthuc,
        don.magiaodich,
        don.ngaytaitro,
        don.chungtu,
        don.ghichu,
        don.tracking_uuid,
      ]
    );

    const nguoiDungId = await ensureDonationUser(connection, don, email, plainPassword);
    const nhaTaiTroId = await ensureDonorRecord(connection, don, email, nguoiDungId);
    const khoanTaiTroId = await createMainDonationRecord(connection, don, nhaTaiTroId);

    await connection.query(
      `UPDATE guest_khoantaitro
       SET khoantaitro_id_ref = ?,
           nhataitro_id_ref = ?
       WHERE guest_khoantaitro_id = ?`,
      [khoanTaiTroId, nhaTaiTroId, guestInsert.insertId]
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
  verifyOTPAndCreateApplication,
  verifyOTPAndCreateDonation,
  verifyOTPAndMigrateApplication,
  verifyOTPAndMigrateDonation,
  trackStatusByUuid,
};
