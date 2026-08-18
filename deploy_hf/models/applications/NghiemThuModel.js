import pool from "../../config/db.js";

// ═══════════════════════════════════════════════════════════════════════════════
// ─── NGHIỆM THU MODEL ────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const VALID_LOAI_KIEM_TRA = ['Kiem tra tien do', 'Nghiem thu cuoi cung'];
const VALID_KET_QUA = ['Cho danh gia', 'Dat', 'Dat co dieu chinh', 'Khong dat'];

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: createInspection
// MỤC ĐÍCH: Tạo mới một lượt kiểm tra / nghiệm thu (ho tro dotgiaingan)
// ─────────────────────────────────────────────────────────────────────────────
const createInspection = async (data, connection = null) => {
  const { yeucauhotroId, loaiKiemTra, nguoiNghiemThuId, dotgiaingan = 1, soQuyetDinh, fileBienBan, nhanXet } = data;
  const executor = connection || pool;

  if (!VALID_LOAI_KIEM_TRA.includes(loaiKiemTra)) {
    throw new Error(`Loai kiem tra khong hop le. Chi chap nhan: ${VALID_LOAI_KIEM_TRA.join(', ')}`);
  }

  // Tinh lanthu — chi dem trong cung 1 dot giai ngan
  const [[{ maxLan }]] = await executor.query(
    `SELECT COALESCE(MAX(lanthu), 0) AS maxLan FROM nghiemthu WHERE yeucauhotro_id = ? AND dotgiaingan = ?`,
    [yeucauhotroId, dotgiaingan]
  );
  const lanthu = maxLan + 1;

  const [result] = await executor.execute(
    `INSERT INTO nghiemthu (
      yeucauhotro_id, lanthu, loaikiemtra, ketqua, nguoinghiemthu_id, dotgiaingan,
      soquyetdinh, filebienban, nhanxet, ngaytao
    ) VALUES (?, ?, ?, 'Cho danh gia', ?, ?, ?, ?, ?, NOW())`,
    [
      yeucauhotroId, lanthu, loaiKiemTra, nguoiNghiemThuId, dotgiaingan,
      soQuyetDinh || null, fileBienBan || null, nhanXet || null
    ]
  );

  return {
    nghiemthuId: result.insertId,
    yeucauhotroId,
    lanthu,
    loaiKiemTra,
    dotgiaingan,
    ketqua: 'Cho danh gia',
    soQuyetDinh: soQuyetDinh || null,
    fileBienBan: fileBienBan || null,
    nhanXet: nhanXet || null,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: updateResult
// MỤC ĐÍCH: Cập nhật kết quả nghiệm thu
// ─────────────────────────────────────────────────────────────────────────────
const updateResult = async (nghiemthuId, data, connection = null) => {
  const executor = connection || pool;
  const { ketqua, nhanXet, soQuyetDinh, fileBienBan, ngayNghiemThu } = data;

  if (ketqua && !VALID_KET_QUA.includes(ketqua)) {
    throw new Error(`Ket qua nghiem thu khong hop le. Chi chap nhan: ${VALID_KET_QUA.join(', ')}`);
  }

  await executor.execute(
    `UPDATE nghiemthu 
     SET ketqua = ?,
         nhanxet = ?,
         soquyetdinh = ?,
         filebienban = ?,
         ngaynghiemthu = ?
     WHERE nghiemthu_id = ?`,
    [
      ketqua,
      nhanXet || null,
      soQuyetDinh || null,
      fileBienBan || null,
      ngayNghiemThu || new Date().toISOString().slice(0, 10),
      nghiemthuId
    ]
  );

  return true;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getById
// MỤC ĐÍCH: Lấy chi tiết 1 lượt nghiệm thu
// ─────────────────────────────────────────────────────────────────────────────
const getById = async (nghiemthuId) => {
  const [rows] = await pool.query(
    `SELECT 
      nt.nghiemthu_id,
      nt.yeucauhotro_id,
      nt.lanthu,
      nt.loaikiemtra,
      nt.ketqua,
      nt.soquyetdinh,
      nt.filebienban,
      nt.nguoinghiemthu_id,
      nt.nhanxet,
      nt.ngaynghiemthu,
      nt.dotgiaingan,
      nt.ngaytao,
      nd.hoten AS nguoi_nghiem_thu_ten
     FROM nghiemthu nt
     LEFT JOIN nguoidung nd ON nt.nguoinghiemthu_id = nd.nguoidung_id
     WHERE nt.nghiemthu_id = ?
     LIMIT 1`,
    [nghiemthuId]
  );

  return rows[0] || null;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getByApplicationId
// MỤC ĐÍCH: Lấy tất cả lượt nghiệm thu của 1 đơn xin hỗ trợ
// ─────────────────────────────────────────────────────────────────────────────
const getByApplicationId = async (yeucauhotroId, connection = null) => {
  const executor = connection || pool;
  const [rows] = await executor.query(
    `SELECT 
      nt.nghiemthu_id,
      nt.yeucauhotro_id,
      nt.lanthu,
      nt.loaikiemtra,
      nt.ketqua,
      nt.soquyetdinh,
      nt.filebienban,
      nt.nguoinghiemthu_id,
      nt.nhanxet,
      nt.ngaynghiemthu,
      nt.dotgiaingan,
      nt.ngaytao,
      nd.hoten AS nguoi_nghiem_thu_ten
     FROM nghiemthu nt
     LEFT JOIN nguoidung nd ON nt.nguoinghiemthu_id = nd.nguoidung_id
     WHERE nt.yeucauhotro_id = ?
     ORDER BY nt.dotgiaingan ASC, nt.lanthu ASC`,
    [yeucauhotroId]
  );

  return rows;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: checkEligibility
// MỤC ĐÍCH: Kiểm tra đơn có đủ điều kiện để nghiệm thu không
// ─────────────────────────────────────────────────────────────────────────────
const checkEligibility = async (yeucauhotroId) => {
  const [rows] = await pool.query(
    `SELECT yc.trangthai, yc.canghiemthu, yc.loaihotro,
            hd.lan_nghiem_thu_dat
     FROM yeucauhotro yc
     LEFT JOIN hopdongvayvon hd ON yc.yeucauhotro_id = hd.yeucauhotro_id
     WHERE yc.yeucauhotro_id = ?
     LIMIT 1`,
    [yeucauhotroId]
  );

  return rows[0] || null;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getDetailByApplicationId
// MỤC ĐÍCH: Lấy đầy đủ thông tin đơn + lịch sử nghiệm thu + tổng quan
// ─────────────────────────────────────────────────────────────────────────────
const getDetailByApplicationId = async (yeucauhotroId) => {
  const [[don]] = await pool.query(
    `SELECT
      yc.yeucauhotro_id,
      yc.trangthai,
      yc.loaihotro,
      yc.canghiemthu,
      yc.tieu_de,
      yc.lydo,
      yc.sotiendenghi,
      yc.tongkinhphidudan,
      yc.ngaynop,
      nd.hoten AS nguoi_nhan_ten,
      nd.email AS nguoi_nhan_email,
      nd.sodienthoai AS nguoi_nhan_sdt,
      nd.masodinhdanh,
      q.tenquy,
      q.sodu AS quy_sodu
    FROM yeucauhotro yc
    LEFT JOIN nguoidung nd ON yc.nguoidung_id = nd.nguoidung_id
    LEFT JOIN quy q ON yc.quy_id = q.quy_id
    WHERE yc.yeucauhotro_id = ?
    LIMIT 1`,
    [yeucauhotroId]
  );

  if (!don) return null;

  const lichSu = await getByApplicationId(yeucauhotroId);

  const tongLan = lichSu.length;
  const lanGanNhat = tongLan > 0 ? lichSu[tongLan - 1] : null;

  // Trang thai cho phep tao nghiem thu — ke ca 2 pha
  const trangThaiChoPhep = [
    'Da giai ngan', 'Cho nghiem thu',
    'Da giai ngan dot 1', 'Cho nghiem thu dot 1',
    'Cho giai ngan dot 2'
  ];

  // Xac dinh dot giai ngan hien tai
  // Khoan vay da giai ngan dot 2 (status 'Da giai ngan') → dang o dot 2
  let dotHienTai = 1;
  if (don.trangthai === 'Cho nghiem thu dot 1' || don.trangthai === 'Da giai ngan dot 1') {
    dotHienTai = 1;
  } else if (don.trangthai === 'Cho giai ngan dot 2') {
    dotHienTai = 2;
  } else if (don.trangthai === 'Da giai ngan' && don.loaihotro === 'Cho vay') {
    dotHienTai = 2;
  }

  // Dem so luot nghiem thu dat trong dot hien tai (chi dem nghiem thu cuoi cung)
  const lanTrongDot = lichSu.filter(nt => (nt.dotgiaingan || 1) === dotHienTai);
  const lanCuoiCungTrongDot = lanTrongDot.filter(nt => nt.loaikiemtra === 'Nghiem thu cuoi cung');
  const soDat = lanCuoiCungTrongDot.filter(nt => nt.ketqua === 'Dat' || nt.ketqua === 'Dat co dieu chinh').length;
  // Dot 1 can toi thieu 2/3 lan "Nghiem thu cuoi cung" dat; dot 2 chi can 1 lan
  const soDatToiThieu = dotHienTai === 2 ? 1 : 2;
  const canTiepTuc = soDat < soDatToiThieu && lanCuoiCungTrongDot.length < 3 && don.trangthai !== 'Cho giai ngan dot 2';

  return {
    yeucauhotroId: don.yeucauhotro_id,
    trangthai: don.trangthai,
    loaihotro: don.loaihotro,
    canghiemthu: don.canghiemthu,
    tieu_de: don.tieu_de || don.lydo || '',
    lydo: don.lydo,
    sotiendenghi: don.sotiendenghi,
    tongkinhphidudan: don.tongkinhphidudan,
    ngaynop: don.ngaynop,
    nguoiNhan: {
      ten: don.nguoi_nhan_ten,
      email: don.nguoi_nhan_email,
      sodienthoai: don.nguoi_nhan_sdt,
      masodinhdanh: don.masodinhdanh,
    },
    quy: {
      tenquy: don.tenquy,
      sodu: don.quy_sodu,
    },
    tongQuan: {
      tongLanNghiemThu: tongLan,
      lanGanNhat: lanGanNhat?.lanthu || null,
      ketQuaGanNhat: lanGanNhat?.ketqua || null,
      ngayGanNhat: lanGanNhat?.ngaynghiemthu || null,
      dotgiaingan: dotHienTai,
      soLanDat: soDat,
      canTiepTuc,
      coTheTaoMoi: don.canghiemthu === 1 && trangThaiChoPhep.includes(don.trangthai) && canTiepTuc,
    },
    lichSuNghiemThu: lichSu.map(nt => ({
      nghiemthuId: nt.nghiemthu_id,
      lanthu: nt.lanthu,
      loaiKiemTra: nt.loaikiemtra,
      ketqua: nt.ketqua,
      soQuyetDinh: nt.soquyetdinh,
      fileBienBan: nt.filebienban,
      nguoiNghiemThuId: nt.nguoinghiemthu_id,
      tenNguoiNghiemThu: nt.nguoi_nghiem_thu_ten,
      nhanXet: nt.nhanxet,
      ngayNghiemThu: nt.ngaynghiemthu,
      dotgiaingan: nt.dotgiaingan || 1,
      ngayTao: nt.ngaytao,
    })),
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: countApprovedByDot
// MỤC ĐÍCH: Dem so luot nghiem thu cuoi cung dat trong 1 dot giai ngan
// ─────────────────────────────────────────────────────────────────────────────
const countApprovedByDot = async (yeucauhotroId, dotgiaingan = 1, connection = null) => {
  const executor = connection || pool;
  const [[{ soLuot }]] = await executor.query(
    `SELECT COUNT(*) AS soLuot FROM nghiemthu
     WHERE yeucauhotro_id = ? AND dotgiaingan = ?
     AND loaikiemtra = 'Nghiem thu cuoi cung'
     AND ketqua IN ('Dat', 'Dat co dieu chinh')`,
    [yeucauhotroId, dotgiaingan]
  );
  return soLuot;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: deleteById
// MỤC ĐÍCH: Xóa 1 lượt nghiệm thu (chỉ khi chưa duyệt)
// ─────────────────────────────────────────────────────────────────────────────
const deleteById = async (nghiemthuId) => {
  await pool.execute(
    `DELETE FROM nghiemthu WHERE nghiemthu_id = ?`,
    [nghiemthuId]
  );
  return true;
};

export default {
  createInspection,
  updateResult,
  getById,
  getByApplicationId,
  checkEligibility,
  getDetailByApplicationId,
  countApprovedByDot,
  deleteById,
};
