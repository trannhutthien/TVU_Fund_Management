import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SETTINGS_PATH = path.join(__dirname, "../../config/system_settings.json");

// ═══════════════════════════════════════════════════════════════════════════════
// ─── LAI SUAT HELPER — DÙNG CHUNG CHO "TÀI TRỢ CÓ THU HỒI" VÀ "CHO VAY" ──
// ═══════════════════════════════════════════════════════════════════════════════

const getLaiSuatNganHangThamChieu = () => {
  try {
    const raw = fs.readFileSync(SETTINGS_PATH, "utf-8");
    const settings = JSON.parse(raw);
    return settings.laisuatnganhangthamchieu ?? null;
  } catch {
    return null;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: kiemTraRangBuocLaiSuat
// MỤC ĐÍCH: Validate lãi suất ≤ 70% lãi suất ngân hàng tham chiếu (Điều 15.3)
// DÙNG CHO: "Tài trợ có thu hồi" (C2) + "Cho vay" (Bước 2 mới)
// ─────────────────────────────────────────────────────────────────────────────
const kiemTraRangBuocLaiSuat = (laisuat) => {
  const laisuatThamChieu = getLaiSuatNganHangThamChieu();

  if (laisuatThamChieu === null || laisuatThamChieu === undefined) {
    return { hopLe: false, loi: 'CHUA_CAU_HINH' };
  }

  const mucToiDa = parseFloat(laisuatThamChieu) * 0.7;

  return {
    hopLe: parseFloat(laisuat) <= mucToiDa,
    laisuatThamChieu: parseFloat(laisuatThamChieu),
    mucToiDa: Math.round(mucToiDa * 100) / 100
  };
};

export default { getLaiSuatNganHangThamChieu, kiemTraRangBuocLaiSuat };
