import jwt from "jsonwebtoken";
import { logSystemActivity } from "../utils/helpers/loggerHelper.js";

const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

const SKIP_PATHS = [
  "/api/nhat-ky",
  "/api/auth/refresh-token",
  "/api/applications/ai-suggest",
  "/api/bao-cao/xuat"
];

const SENSITIVE_KEYS = new Set([
  "password",
  "matkhau",
  "matKhau",
  "mat_khau",
  "oldPassword",
  "newPassword",
  "confirmPassword",
  "accessToken",
  "refreshToken",
  "token",
  "authorization"
]);

const ACTION_BY_METHOD = {
  POST: "API_TAO_MOI",
  PUT: "API_CAP_NHAT",
  PATCH: "API_CAP_NHAT",
  DELETE: "API_XOA"
};

const RESOURCE_CONFIG = [
  { prefix: "/api/auth/register", target: "nguoidung", action: "DANG_KY_TAI_KHOAN" },
  { prefix: "/api/auth/update-password", target: "nguoidung", action: "CAP_NHAT_MAT_KHAU" },
  { prefix: "/api/news", target: "tintuc" },
  { prefix: "/api/danhgia", target: "danhgia" },
  { prefix: "/api/student-showcase", target: "sinhviennoibat" },
  { prefix: "/api/funds", target: "quy" },
  { prefix: "/api/quy", target: "quy" },
  { prefix: "/api/loai-quy", target: "loaiquy" },
  { prefix: "/api/bank-accounts", target: "taikhoannganhang" },
  { prefix: "/api/donors", target: "nhataitro" },
  { prefix: "/api/donations", target: "khoantaitro" },
  { prefix: "/api/transactions", target: "giaodich" },
  { prefix: "/api/applications", target: "yeucauhotro" },
  { prefix: "/api/pheduyet", target: "pheduyet" },
  { prefix: "/api/users", target: "nguoidung" },
  { prefix: "/api/roles", target: "vaitro" },
  { prefix: "/api/vaitro", target: "vaitro" },
  { prefix: "/api/nguoidung", target: "nguoidung" },
  { prefix: "/api/system/settings/permissions", target: "phanquyen", action: "CAP_NHAT_PHAN_QUYEN" },
  { prefix: "/api/system/settings", target: "caidathethong", action: "CAP_NHAT_CAI_DAT_HE_THONG" },
  { prefix: "/api/guest", target: "khach" },
  { prefix: "/api/upload", target: "tep" }
];

const getUserIdFromRequest = (req) => {
  if (req.user?.id) return req.user.id;
  if (req.user?.nguoidung_id) return req.user.nguoidung_id;
  if (req.user?.user_id) return req.user.user_id;

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ") || !process.env.JWT_SECRET) return null;

  try {
    const decoded = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET);
    return decoded.user_id || decoded.id || null;
  } catch {
    return null;
  }
};

const sanitizeValue = (value, seen = new WeakSet()) => {
  if (value === null || value === undefined) return value;
  if (value instanceof Date) return value.toISOString();
  if (Buffer.isBuffer(value)) return `[buffer:${value.length}]`;
  if (typeof value !== "object") return value;
  if (seen.has(value)) return "[circular]";

  seen.add(value);

  if (Array.isArray(value)) {
    return value.slice(0, 20).map((item) => sanitizeValue(item, seen));
  }

  return Object.entries(value).reduce((acc, [key, entryValue]) => {
    acc[key] = SENSITIVE_KEYS.has(key)
      ? "[hidden]"
      : sanitizeValue(entryValue, seen);
    return acc;
  }, {});
};

const truncateJson = (value, maxLength = 6000) => {
  if (!value) return value;
  const json = JSON.stringify(value);
  if (json.length <= maxLength) return value;

  return {
    truncated: true,
    length: json.length,
    preview: json.slice(0, maxLength)
  };
};

const getRouteParams = (req) => {
  const params = req.params && Object.keys(req.params).length > 0 ? req.params : {};
  const pathId = req.path.match(/\/(\d+)(?:\/|$)/)?.[1] || null;
  const id =
    params.id ||
    params.userId ||
    params.role_id ||
    params.quyId ||
    params.donationId ||
    params.transactionId ||
    params.applicationId ||
    params.yeuCauId ||
    params.danhgia_id ||
    params.showcaseId ||
    pathId ||
    null;

  return { params, id: id && !Number.isNaN(Number(id)) ? Number(id) : null };
};

const resolveResource = (path) => (
  RESOURCE_CONFIG.find((item) => path.startsWith(item.prefix)) || {
    target: path.split("/").filter(Boolean)[1] || "api"
  }
);

const shouldAudit = (req) => {
  if (!MUTATION_METHODS.has(req.method)) return false;
  if (!req.path.startsWith("/api/")) return false;
  return !SKIP_PATHS.some((path) => req.path.startsWith(path));
};

export const auditLogMiddleware = (req, res, next) => {
  if (!shouldAudit(req)) return next();

  const startedAt = Date.now();

  res.on("finish", () => {
    if (req._systemLogWritten) return;
    if (res.statusCode < 200 || res.statusCode >= 400) return;

    const writeLog = async () => {
      const routeInfo = getRouteParams(req);
      const resource = resolveResource(req.path);
      const body = sanitizeValue(req.body || {});
      const query = sanitizeValue(req.query || {});

      await logSystemActivity(req, {
        nguoidung_id: getUserIdFromRequest(req),
        hanh_dong: resource.action || ACTION_BY_METHOD[req.method] || "API_TAC_DONG_DU_LIEU",
        loai_doi_tuong: resource.target,
        doi_tuong_id: routeInfo.id,
        mo_ta: `${req.method} ${req.originalUrl} - tác động dữ liệu thành công (${res.statusCode})`,
        du_lieu_moi: truncateJson({
          method: req.method,
          path: req.originalUrl,
          statusCode: res.statusCode,
          durationMs: Date.now() - startedAt,
          params: routeInfo.params,
          query,
          body
        })
      });
    };

    writeLog().catch((error) => {
      console.error("Lỗi audit log tự động:", error);
    });
  });

  next();
};
