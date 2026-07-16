import pool from "../../config/db.js";

const APPROVED_STATUS = "Da duyet";

const normalizeLimit = (value, fallback = 12, max = 50) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, max);
};

const normalizePage = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
};

const SELECT_WITH_PROFILE = `
  dg.danhgia_id,
  dg.nguoidung_id,
  n.hoten,
  dv.tenkhoa AS khoa,
  n.avatar,
  dg.noidung,
  dg.trangthai,
  dg.lydotuchoi,
  dg.nguoiduyet_id,
  dg.ngayduyet,
  dg.noibat,
  dg.thutu,
  dg.ngaytao,
  dg.ngaycapnhat,
  nd.hoten AS nguoiduyet_hoten`;

const FROM_WITH_PROFILE = `
  danhgia dg
  LEFT JOIN nguoidung n ON dg.nguoidung_id = n.nguoidung_id
  LEFT JOIN donvihoc dv ON n.donvihoc_id = dv.donvihoc_id
  LEFT JOIN nguoidung nd ON dg.nguoiduyet_id = nd.nguoidung_id`;

const getById = async (danhGiaId) => {
  const [rows] = await pool.query(
    `SELECT ${SELECT_WITH_PROFILE}
     FROM ${FROM_WITH_PROFILE}
     WHERE dg.danhgia_id = ?
     LIMIT 1`,
    [danhGiaId],
  );
  return rows[0] || null;
};

const getLanding = async (limit = 6) => {
  const safeLimit = normalizeLimit(limit, 6, 6);
  const [rows] = await pool.query(
    `SELECT ${SELECT_WITH_PROFILE}
     FROM ${FROM_WITH_PROFILE}
     WHERE dg.trangthai = ?
     ORDER BY dg.noibat DESC, dg.thutu ASC, dg.ngaytao DESC
     LIMIT ${safeLimit}`,
    [APPROVED_STATUS],
  );
  return rows;
};

const getPublicList = async ({ page = 1, pageSize = 12, khoa = "", keyword = "" } = {}) => {
  const safePage = normalizePage(page);
  const safePageSize = normalizeLimit(pageSize, 12, 50);
  const offset = (safePage - 1) * safePageSize;

  const conditions = ["dg.trangthai = ?"];
  const params = [APPROVED_STATUS];

  if (khoa) {
    conditions.push("dv.tenkhoa = ?");
    params.push(khoa);
  }

  if (keyword) {
    conditions.push("(n.hoten LIKE ? OR dg.noidung LIKE ?)");
    const likeKeyword = `%${keyword}%`;
    params.push(likeKeyword, likeKeyword);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM ${FROM_WITH_PROFILE}
     ${whereClause}`,
    params,
  );

  const [rows] = await pool.query(
    `SELECT ${SELECT_WITH_PROFILE}
     FROM ${FROM_WITH_PROFILE}
     ${whereClause}
     ORDER BY dg.noibat DESC, dg.thutu ASC, dg.ngaytao DESC
     LIMIT ${safePageSize} OFFSET ${offset}`,
    params,
  );

  return {
    rows,
    total: Number(countRows[0]?.total || 0),
    page: safePage,
    pageSize: safePageSize,
  };
};

const getKhoaOptions = async () => {
  const [rows] = await pool.query(
    `SELECT DISTINCT dv.tenkhoa
     FROM danhgia dg
     LEFT JOIN nguoidung n ON dg.nguoidung_id = n.nguoidung_id
     LEFT JOIN donvihoc dv ON n.donvihoc_id = dv.donvihoc_id
     WHERE dg.trangthai = ? AND dv.tenkhoa IS NOT NULL AND TRIM(dv.tenkhoa) <> ''
     ORDER BY dv.tenkhoa ASC`,
    [APPROVED_STATUS],
  );
  return rows.map((row) => row.tenkhoa);
};

const create = async ({ nguoiDungId, noiDung }) => {
  const [result] = await pool.execute(
    `INSERT INTO danhgia (nguoidung_id, noidung) VALUES (?, ?)`,
    [nguoiDungId, noiDung],
  );
  return result;
};

const getManagementList = async ({ page = 1, pageSize = 10, trangThai = "" } = {}) => {
  const safePage = normalizePage(page);
  const safePageSize = normalizeLimit(pageSize, 10, 100);
  const offset = (safePage - 1) * safePageSize;

  const conditions = [];
  const params = [];

  if (trangThai) {
    conditions.push("dg.trangthai = ?");
    params.push(trangThai);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM danhgia dg ${whereClause}`,
    params,
  );

  const [rows] = await pool.query(
    `SELECT ${SELECT_WITH_PROFILE}
     FROM ${FROM_WITH_PROFILE}
     ${whereClause}
     ORDER BY
       CASE dg.trangthai
         WHEN 'Cho duyet' THEN 1
         WHEN 'Da duyet' THEN 2
         ELSE 3
       END,
       dg.ngaytao DESC
     LIMIT ${safePageSize} OFFSET ${offset}`,
    params,
  );

  return {
    rows,
    total: Number(countRows[0]?.total || 0),
    page: safePage,
    pageSize: safePageSize,
  };
};

const getStatusCounts = async () => {
  const [rows] = await pool.query(
    `SELECT trangthai, COUNT(*) AS count FROM danhgia GROUP BY trangthai`,
  );

  return rows.reduce(
    (acc, row) => ({
      ...acc,
      [row.trangthai]: Number(row.count || 0),
    }),
    { "Cho duyet": 0, "Da duyet": 0, "Tu choi": 0 },
  );
};

const updateStatus = async (danhGiaId, { trangThai, lyDoTuChoi = null, nguoiDuyetId = null }) => {
  const isPending = trangThai === "Cho duyet";
  const isRejected = trangThai === "Tu choi";

  const [result] = await pool.execute(
    `UPDATE danhgia
     SET trangthai = ?,
         lydotuchoi = ?,
         nguoiduyet_id = ?,
         ngayduyet = ${isPending ? "NULL" : "CURRENT_TIMESTAMP"},
         noibat = CASE WHEN ? = 'Tu choi' THEN 0 ELSE noibat END,
         ngaycapnhat = CURRENT_TIMESTAMP
     WHERE danhgia_id = ?`,
    [trangThai, isRejected ? lyDoTuChoi : null, isPending ? null : nguoiDuyetId, trangThai, danhGiaId],
  );

  return result;
};

const updateNoiBat = async (danhGiaId, { noiBat, thuTu = 0 }) => {
  const [result] = await pool.execute(
    `UPDATE danhgia
     SET noibat = ?,
         thutu = ?,
         ngaycapnhat = CURRENT_TIMESTAMP
     WHERE danhgia_id = ?`,
    [noiBat ? 1 : 0, Number.parseInt(thuTu, 10) || 0, danhGiaId],
  );

  return result;
};

export default {
  getById,
  getLanding,
  getPublicList,
  getKhoaOptions,
  create,
  getManagementList,
  getStatusCounts,
  updateStatus,
  updateNoiBat,
};
