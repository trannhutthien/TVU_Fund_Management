import pool from "../config/db.js";

// Lấy tất cả vai trò
const getAllRoles = async () => {
  const [rows] = await pool.query(
    `SELECT role_id, ten_vai_tro, mo_ta 
     FROM vaitro 
     ORDER BY role_id`
  );
  return rows;
};

// Lấy thông tin chi tiết một vai trò theo ID
const getRoleById = async (roleId) => {
  const [rows] = await pool.query(
    `SELECT role_id, ten_vai_tro, mo_ta, trang_thai
     FROM vaitro 
     WHERE role_id = ?
     LIMIT 1`,
    [roleId]
  );
  return rows[0] || null;
};

// Cập nhật thông tin vai trò (partial update - chỉ update các field được gửi lên)
const updateRole = async (roleId, data) => {
  // Tạo dynamic query dựa trên các field có trong data
  const fields = [];
  const values = [];

  if (data.tenVaiTro !== undefined) {
    fields.push("ten_vai_tro = ?");
    values.push(data.tenVaiTro);
  }

  if (data.moTa !== undefined) {
    fields.push("mo_ta = ?");
    values.push(data.moTa);
  }

  if (data.trangThai !== undefined) {
    fields.push("trang_thai = ?");
    values.push(data.trangThai);
  }

  // Thêm roleId vào cuối mảng values
  values.push(roleId);
  
  //Nếu fields rỗng lỗi SQL UPDATE vaitro SET  WHERE role_id = ?
  if (fields.length === 0) {
  throw new Error("Không có dữ liệu để cập nhật");
}

  // Tạo câu query động
  const query = `UPDATE vaitro SET ${fields.join(", ")} WHERE role_id = ?`;

  const [result] = await pool.query(query, values);
  
  return result;
};

// Lấy danh sách người dùng theo vai trò
const getUsersByRoleId = async (roleId) => {
  const [rows] = await pool.query(
    `SELECT 
      ma_so_dinh_danh,
      ho_ten,
      email,
      role_id,
      trang_thai,
      created_at
     FROM nguoidung 
     WHERE role_id = ?
     ORDER BY ho_ten ASC`,
    [roleId]
  );
  return rows;
};

export default { getAllRoles, getRoleById, updateRole, getUsersByRoleId };
