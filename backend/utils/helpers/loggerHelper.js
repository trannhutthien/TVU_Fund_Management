import pool from "../../config/db.js";

/**
 * Ghi nhật ký hoạt động hệ thống
 * @param {Object} req - Request object để lấy user_id và ip_address
 * @param {Object} logData - Dữ liệu nhật ký
 * @param {number|null} logData.nguoi_dung_id - ID người dùng thực hiện (nếu không truyền sẽ lấy từ req.user)
 * @param {string} logData.hanh_dong - Hành động thực hiện (VD: 'DUYET_DON', 'DANG_NHAP', ...)
 * @param {string} logData.loai_doi_tuong - Loại đối tượng bị tác động (VD: 'yeucauhotro', 'nguoidung', ...)
 * @param {number|null} logData.doi_tuong_id - ID của đối tượng bị tác động
 * @param {string|null} logData.mo_ta - Mô tả chi tiết hành động
 * @param {Object|null} logData.du_lieu_cu - Dữ liệu cũ trước khi sửa (sẽ tự chuyển sang JSON string)
 * @param {Object|null} logData.du_lieu_moi - Dữ liệu mới sau khi sửa (sẽ tự chuyển sang JSON string)
 */
export const logSystemActivity = async (req, logData) => {
  try {
    const nguoi_dung_id = logData.nguoidung_id || logData.nguoi_dung_id || (req && req.user && (req.user.nguoidung_id || req.user.user_id || req.user.id)) || null;
    const ip_address = req ? (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim() : null;

    let prefix = "";
    if (nguoi_dung_id) {
      const [userRows] = await pool.query(
        "SELECT vaitro_id, loaitaikhoan, hoten FROM nguoidung WHERE nguoidung_id = ?",
        [nguoi_dung_id]
      );
      if (userRows.length > 0) {
        const u = userRows[0];
        if ([1, 2, 3].includes(u.vaitro_id)) {
          prefix = `[Nhân viên hệ thống] ${u.hoten}: `;
        } else if (u.vaitro_id === 4) {
          if (u.loaitaikhoan === "Nha tai tro") {
            prefix = `[Nhà tài trợ] ${u.hoten}: `;
          } else {
            prefix = `[Sinh viên] ${u.hoten}: `;
          }
        }
      }
    }

    const rawMota = logData.mota || logData.mo_ta || null;
    const finalMota = rawMota ? (rawMota.startsWith("[") ? rawMota : prefix + rawMota) : null;

    const query = `
      INSERT INTO nhatkyhethong (
        nguoidung_id, 
        hanhdong, 
        loaidoituong, 
        doituong_id, 
        mota, 
        dulieucu, 
        dulieumoi, 
        ipaddress
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      nguoi_dung_id,
      logData.hanhdong || logData.hanh_dong || null,
      logData.loaidoituong || logData.loai_doi_tuong || null,
      logData.doituong_id || logData.doi_tuong_id || null,
      finalMota,
      logData.dulieucu || logData.du_lieu_cu ? JSON.stringify(logData.dulieucu || logData.du_lieu_cu) : null,
      logData.dulieumoi || logData.du_lieu_moi ? JSON.stringify(logData.dulieumoi || logData.du_lieu_moi) : null,
      ip_address
    ];

    await pool.query(query, values);
  } catch (error) {
    console.error("❌ Lỗi ghi nhật ký hệ thống:", error);
  }
};
