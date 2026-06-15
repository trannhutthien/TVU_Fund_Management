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

const getUserProfile = async (nguoiDungId) => {
  const [rows] = await pool.query(
    `SELECT
       n.nguoidung_id,
       n.hoten,
       n.avatar,
       dv.tenkhoa AS khoa
     FROM nguoidung n
     LEFT JOIN donvihoc dv ON n.donvihoc_id = dv.donvihoc_id
     WHERE n.nguoidung_id = ?
     LIMIT 1`,
    [nguoiDungId],
  );
  return rows[0] || null;
};

const getById = async (danhGiaId) => {
  const [rows] = await pool.query(
    `SELECT
       dg.danhgia_id,
       dg.nguoidung_id,
       dg.hoten,
       dg.khoa,
       dg.nienkhoa,
       dg.avatar,
       dg.noidung,
       dg.trangthai,
       dg.lydotuchoi,
       dg.nguoiduyet_id,
       dg.ngayduyet,
       dg.noibat,
       dg.thutu,
       dg.ngaytao,
       dg.ngaycapnhat,
       nd.hoten AS nguoiduyet_hoten
     FROM danhgia dg
     LEFT JOIN nguoidung nd ON dg.nguoiduyet_id = nd.nguoidung_id
     WHERE dg.danhgia_id = ?
     LIMIT 1`,
    [danhGiaId],
  );
  return rows[0] || null;
};

const getLanding = async (limit = 6) => {
  const safeLimit = normalizeLimit(limit, 6, 6);
  const [rows] = await pool.query(
    `SELECT
       danhgia_id,
       nguoidung_id,
       hoten,
       khoa,
       nienkhoa,
       avatar,
       noidung,
       trangthai,
       noibat,
       thutu,
       ngaytao,
       ngaycapnhat
     FROM danhgia
     WHERE trangthai = ?
     ORDER BY noibat DESC, thutu ASC, ngaytao DESC
     LIMIT ${safeLimit}`,
    [APPROVED_STATUS],
  );
  return rows;
};

const getPublicList = async ({ page = 1, pageSize = 12, khoa = "", keyword = "" } = {}) => {
  const safePage = normalizePage(page);
  const safePageSize = normalizeLimit(pageSize, 12, 50);
  const offset = (safePage - 1) * safePageSize;

  const conditions = ["trangthai = ?"];
  const params = [APPROVED_STATUS];

  if (khoa) {
    conditions.push("khoa = ?");
    params.push(khoa);
  }

  if (keyword) {
    conditions.push("(hoten LIKE ? OR noidung LIKE ?)");
    const likeKeyword = `%${keyword}%`;
    params.push(likeKeyword, likeKeyword);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM danhgia ${whereClause}`,
    params,
  );

  const [rows] = await pool.query(
    `SELECT
       danhgia_id,
       nguoidung_id,
       hoten,
       khoa,
       nienkhoa,
       avatar,
       noidung,
       trangthai,
       noibat,
       thutu,
       ngaytao,
       ngaycapnhat
     FROM danhgia
     ${whereClause}
     ORDER BY noibat DESC, thutu ASC, ngaytao DESC
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
    `SELECT DISTINCT khoa
     FROM danhgia
     WHERE trangthai = ? AND khoa IS NOT NULL AND TRIM(khoa) <> ''
     ORDER BY khoa ASC`,
    [APPROVED_STATUS],
  );
  return rows.map((row) => row.khoa);
};

const create = async ({
  nguoiDungId = null,
  hoTen,
  khoa = null,
  nienKhoa = null,
  avatar = null,
  noiDung,
}) => {
  const [result] = await pool.execute(
    `INSERT INTO danhgia (
       nguoidung_id,
       hoten,
       khoa,
       nienkhoa,
       avatar,
       noidung
     ) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      nguoiDungId,
      hoTen,
      khoa,
      nienKhoa,
      avatar,
      noiDung,
    ],
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
    `SELECT COUNT(*) AS total
     FROM danhgia dg
     ${whereClause}`,
    params,
  );

  const [rows] = await pool.query(
    `SELECT
       dg.danhgia_id,
       dg.nguoidung_id,
       dg.hoten,
       dg.khoa,
       dg.nienkhoa,
       dg.avatar,
       dg.noidung,
       dg.trangthai,
       dg.lydotuchoi,
       dg.nguoiduyet_id,
       dg.ngayduyet,
       dg.noibat,
       dg.thutu,
       dg.ngaytao,
       dg.ngaycapnhat,
       nd.hoten AS nguoiduyet_hoten
     FROM danhgia dg
     LEFT JOIN nguoidung nd ON dg.nguoiduyet_id = nd.nguoidung_id
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
    `SELECT trangthai, COUNT(*) AS count
     FROM danhgia
     GROUP BY trangthai`,
  );

  return rows.reduce(
    (acc, row) => ({
      ...acc,
      [row.trangthai]: Number(row.count || 0),
    }),
    {
      "Cho duyet": 0,
      "Da duyet": 0,
      "Tu choi": 0,
    },
  );
};

const updateStatus = async (danhGiaId, {
  trangThai,
  lyDoTuChoi = null,
  nguoiDuyetId = null,
}) => {
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
    [
      trangThai,
      isRejected ? lyDoTuChoi : null,
      isPending ? null : nguoiDuyetId,
      trangThai,
      danhGiaId,
    ],
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
    [
      noiBat ? 1 : 0,
      Number.parseInt(thuTu, 10) || 0,
      danhGiaId,
    ],
  );

  return result;
};

export default {
  getUserProfile,
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
