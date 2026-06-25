import pool from "../../config/db.js";

// Lấy tất cả vai trò
const getAllRoles = async () => {
  const [rows] = await pool.query(
    `SELECT vaitro_id, tenvaitro, mota 
     FROM vaitro 
     ORDER BY vaitro_id`
  );
  return rows;
};

// Lấy thông tin chi tiết một vai trò theo ID
const getRoleById = async (roleId) => {
  const [rows] = await pool.query(
    `SELECT vaitro_id, tenvaitro, mota
     FROM vaitro 
     WHERE vaitro_id = ?
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
    fields.push("tenvaitro = ?");
    values.push(data.tenVaiTro);
  }

  if (data.moTa !== undefined) {
    fields.push("mota = ?");
    values.push(data.moTa);
  }

  // Thêm roleId vào cuối mảng values
  values.push(roleId);
  
  //Nếu fields rỗng lỗi SQL UPDATE vaitro SET  WHERE vaitro_id = ?
  if (fields.length === 0) {
    throw new Error("Không có dữ liệu để cập nhật");
  }

  // Tạo câu query động
  const query = `UPDATE vaitro SET ${fields.join(", ")} WHERE vaitro_id = ?`;

  const [result] = await pool.query(query, values);
  
  return result;
};

// Lấy danh sách người dùng theo vai trò
const getUsersByRoleId = async (roleId) => {
  const [rows] = await pool.query(
    `SELECT 
      nguoidung_id,
      masodinhdanh,
      hoten,
      email,
      vaitro_id,
      trangthai,
      ngaytao
     FROM nguoidung 
     WHERE vaitro_id = ?
     ORDER BY hoten ASC`,
    [roleId]
  );
  return rows;
};

export default { getAllRoles, getRoleById, updateRole, getUsersByRoleId };
