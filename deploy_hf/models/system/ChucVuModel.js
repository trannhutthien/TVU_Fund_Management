import pool from "../../config/db.js";

// ═══════════════════════════════════════════════════════════════════════════════
// ─── CHUC VU QUY MODEL ─────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const SELECT_WITH_COALESCE = `
  SELECT cv.*,
    COALESCE(cv.anh, nd.avatar) AS anh_hienthi,
    nd.hoten AS ten_hienthi
  FROM chucvuquy cv
  LEFT JOIN nguoidung nd ON cv.nguoidung_id = nd.nguoidung_id
`;

const getAll = async (filter = {}) => {
  let where = [];
  let params = [];

  if (filter.nhom) {
    where.push("cv.nhom = ?");
    params.push(filter.nhom);
  }
  if (filter.trangthai) {
    where.push("cv.trangthai = ?");
    params.push(filter.trangthai);
  } else {
    where.push("cv.trangthai = 'Dang nhiem'");
  }

  const whereClause = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

  const [rows] = await pool.query(
    `${SELECT_WITH_COALESCE} ${whereClause} ORDER BY FIELD(cv.nhom, 'Hoi dong quy', 'Ban dieu hanh', 'Ban kiem soat', 'Van phong thuong truc'), cv.thutu ASC, cv.ngaytao ASC`,
    params
  );
  return rows;
};

const getByGroup = async (nhom) => {
  const [rows] = await pool.query(
    `${SELECT_WITH_COALESCE} WHERE cv.nhom = ? AND cv.trangthai = 'Dang nhiem' ORDER BY cv.thutu ASC, cv.ngaytao ASC`,
    [nhom]
  );
  return rows;
};

const getById = async (chucVuId) => {
  const [rows] = await pool.query(
    `${SELECT_WITH_COALESCE} WHERE cv.chucvu_id = ? LIMIT 1`,
    [chucVuId]
  );
  return rows[0] || null;
};

const create = async (data) => {
  const {
    nguoidungId,
    chucdanh,
    nhom,
    ngayBatDauNhiemKy,
    ngayKetThucNhiemKy,
    anh,
    mota,
    thutu
  } = data;

  const [result] = await pool.execute(
    `INSERT INTO chucvuquy (
      nguoidung_id, chucdanh, nhom,
      ngaybatdaunhiemky, ngayketthucnhiemky,
      anh, mota, thutu
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      nguoidungId || null,
      chucdanh,
      nhom,
      ngayBatDauNhiemKy || null,
      ngayKetThucNhiemKy || null,
      anh || null,
      mota || null,
      thutu || 0
    ]
  );

  return { chucVuId: result.insertId, ...data };
};

const update = async (chucVuId, data) => {
  const fields = [];
  const values = [];

  const allowedFields = [
    'nguoidung_id', 'chucdanh', 'nhom',
    'ngaybatdaunhiemky', 'ngayketthucnhiemky',
    'anh', 'mota', 'thutu', 'trangthai'
  ];

  for (const [key, value] of Object.entries(data)) {
    if (allowedFields.includes(key)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (fields.length === 0) return null;

  values.push(chucVuId);
  const [result] = await pool.query(
    `UPDATE chucvuquy SET ${fields.join(", ")} WHERE chucvu_id = ?`,
    values
  );
  return result.affectedRows > 0;
};

const softDelete = async (chucVuId) => {
  const [result] = await pool.query(
    `UPDATE chucvuquy SET trangthai = 'Het nhiem ky' WHERE chucvu_id = ? AND trangthai = 'Dang nhiem'`,
    [chucVuId]
  );
  return result.affectedRows > 0;
};

const updateThuTu = async (list) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    for (const item of list) {
      await connection.query(
        `UPDATE chucvuquy SET thutu = ? WHERE chucvu_id = ?`,
        [item.thutu, item.chucvu_id]
      );
    }
    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const getPublic = async () => {
  const [rows] = await pool.query(
    `${SELECT_WITH_COALESCE}
     WHERE cv.trangthai = 'Dang nhiem'
     ORDER BY FIELD(cv.nhom, 'Hoi dong quy', 'Ban dieu hanh', 'Ban kiem soat', 'Van phong thuong truc'), cv.thutu ASC, cv.ngaytao ASC`
  );
  return rows;
};

export default {
  getAll,
  getByGroup,
  getById,
  create,
  update,
  softDelete,
  updateThuTu,
  getPublic
};
