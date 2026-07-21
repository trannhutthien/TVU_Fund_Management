import pool from '../../config/db.js';
import { logSystemActivity } from '../../utils/helpers/loggerHelper.js';

// ═══════════════════════════════════════════════════════════════════════════════
// LICH TRA NO USER CONTROLLER — Dành cho người dùng (role 4)
// ═══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/lich-tra-no/cua-toi
// Lấy toàn bộ nghĩa vụ hoàn trả của user đang đăng nhập
// Bao gồm: Cho vay (lichtrano) + Tài trợ có thu hồi (dieukhoanthuhoi)
// ─────────────────────────────────────────────────────────────────────────────
export const getMyRepayments = async (req, res) => {
  try {
    const nguoidungId = req.user.id;

    // ── 1. Lấy danh sách đơn cho vay ─────────────────────────────────────────
    const [vayRows] = await pool.query(
      `SELECT
        yc.yeucauhotro_id,
        yc.loaihotro,
        yc.lydo          AS tieuDe,
        yc.trangthai     AS trangThaiDon,
        (SELECT g.ngaygiaodich FROM giaodich g WHERE g.yeucauhotro_id = yc.yeucauhotro_id AND g.loaigiaodich = 'Chi' LIMIT 1) AS ngayGiaiNgan,
        q.tenquy,
        q.quy_id,
        hd.hopdongvayvon_id,
        hd.sotienvon,
        hd.laisuatphantram,
        hd.kyhandothang,
        hd.ngaydaohan,
        hd.trangthai      AS trangThaiHopDong,
        lt.lichtrano_id,
        lt.kythu,
        lt.ngaydenhan,
        lt.sotiengocphaitra,
        lt.sotienlaiphaitra,
        lt.ngaythuctra,
        lt.sotienthuctra,
        lt.trangthai      AS trangThaiKy,
        lt.trangthaixacnhan,
        lt.minhchungtrano,
        lt.ghichuxacnhan,
        lt.ngayxacnhan
      FROM yeucauhotro yc
      INNER JOIN quy q ON yc.quy_id = q.quy_id
      INNER JOIN hopdongvayvon hd ON hd.yeucauhotro_id = yc.yeucauhotro_id
      INNER JOIN lichtrano lt ON lt.hopdongvayvon_id = hd.hopdongvayvon_id
      WHERE yc.nguoidung_id = ?
        AND yc.loaihotro = 'Cho vay'
        AND yc.trangthai IN ('Da giai ngan', 'Da nghiem thu')
      ORDER BY yc.yeucauhotro_id DESC, lt.kythu ASC`,
      [nguoidungId]
    );

    // ── 2. Lấy danh sách đơn tài trợ có thu hồi ──────────────────────────────
    const [thuHoiRows] = await pool.query(
      `SELECT
        yc.yeucauhotro_id,
        yc.loaihotro,
        yc.lydo          AS tieuDe,
        yc.trangthai     AS trangThaiDon,
        (SELECT g.ngaygiaodich FROM giaodich g WHERE g.yeucauhotro_id = yc.yeucauhotro_id AND g.loaigiaodich = 'Chi' LIMIT 1) AS ngayGiaiNgan,
        q.tenquy,
        q.quy_id,
        dkh.dieukhoanthuhoi_id,
        dkh.mucthuhoi,
        dkh.laisuat,
        dkh.thoihanhoantra_thang,
        dkh.soquyetdinh_hopdong,
        dkh.trangthai    AS trangThaiThuHoi,
        dkh.ngaybatdauthuhoi,
        dkh.sotiendadathu
      FROM yeucauhotro yc
      INNER JOIN quy q ON yc.quy_id = q.quy_id
      INNER JOIN dieukhoanthuhoi dkh ON dkh.yeucauhotro_id = yc.yeucauhotro_id
      WHERE yc.nguoidung_id = ?
        AND yc.loaihotro = 'Tai tro co thu hoi'
        AND yc.trangthai IN ('Da giai ngan', 'Da nghiem thu')
      ORDER BY yc.yeucauhotro_id DESC`,
      [nguoidungId]
    );

    // ── 3. Gom nhóm đơn cho vay theo yeucauhotro_id ──────────────────────────
    const vayMap = {};
    for (const row of vayRows) {
      const id = row.yeucauhotro_id;
      if (!vayMap[id]) {
        vayMap[id] = {
          yeucauhotroId: id,
          loaihotro: row.loaihotro,
          tieuDe: row.tieuDe,
          trangThaiDon: row.trangThaiDon,
          ngayGiaiNgan: row.ngayGiaiNgan,
          tenquy: row.tenquy,
          quyId: row.quy_id,
          hopDong: {
            hopdongvayvonId: row.hopdongvayvon_id,
            sotienvon: Number(row.sotienvon),
            laisuatphantram: Number(row.laisuatphantram || 0),
            kyhandothang: row.kyhandothang,
            ngaydaohan: row.ngaydaohan,
            trangThaiHopDong: row.trangThaiHopDong,
          },
          lichTra: [],
        };
      }
      vayMap[id].lichTra.push({
        lichtranoId: row.lichtrano_id,
        kythu: row.kythu,
        ngaydenhan: row.ngaydenhan,
        sotiengocphaitra: Number(row.sotiengocphaitra),
        sotienlaiphaitra: Number(row.sotienlaiphaitra),
        tongPhaiTra: Number(row.sotiengocphaitra) + Number(row.sotienlaiphaitra),
        ngaythuctra: row.ngaythuctra,
        sotienthuctra: row.sotienthuctra ? Number(row.sotienthuctra) : null,
        trangThaiKy: row.trangThaiKy,
        trangthaixacnhan: row.trangthaixacnhan,
        minhchungtrano: row.minhchungtrano,
        ghichuxacnhan: row.ghichuxacnhan,
        ngayxacnhan: row.ngayxacnhan,
      });
    }

    // ── 4. Map đơn tài trợ thu hồi ────────────────────────────────────────────
    const thuHoiList = thuHoiRows.map(row => ({
      yeucauhotroId: row.yeucauhotro_id,
      loaihotro: row.loaihotro,
      tieuDe: row.tieuDe,
      trangThaiDon: row.trangThaiDon,
      ngayGiaiNgan: row.ngayGiaiNgan,
      tenquy: row.tenquy,
      quyId: row.quy_id,
      dieuKhoan: {
        dieukhoanthuhoiId: row.dieukhoanthuhoi_id,
        mucthuhoi: Number(row.mucthuhoi),
        laisuat: row.laisuat ? Number(row.laisuat) : null,
        thoihanhoantra_thang: row.thoihanhoantra_thang,
        soquyetdinh_hopdong: row.soquyetdinh_hopdong,
        trangThaiThuHoi: row.trangThaiThuHoi,
        ngaybatdauthuhoi: row.ngaybatdauthuhoi,
        sotiendadathu: Number(row.sotiendadathu || 0),
        conLai: Number(row.mucthuhoi) - Number(row.sotiendadathu || 0),
      },
    }));

    // ── 5. Tính tổng quan ─────────────────────────────────────────────────────
    let tongNhan = 0;
    let daHoanTra = 0;
    let conLai = 0;
    let dangQuaHan = 0;

    // Cho vay
    for (const don of Object.values(vayMap)) {
      tongNhan += don.hopDong.sotienvon;
      for (const ky of don.lichTra) {
        if (ky.trangThaiKy === 'Da tra') {
          daHoanTra += ky.sotienthuctra || ky.tongPhaiTra;
        } else if (ky.trangThaiKy === 'Tra mot phan') {
          daHoanTra += ky.sotienthuctra || 0;
          conLai += ky.tongPhaiTra - (ky.sotienthuctra || 0);
        } else if (ky.trangThaiKy === 'Qua han') {
          conLai += ky.tongPhaiTra;
          dangQuaHan += ky.tongPhaiTra;
        } else {
          conLai += ky.tongPhaiTra;
        }
      }
    }

    // Tài trợ thu hồi
    for (const don of thuHoiList) {
      tongNhan += don.dieuKhoan.mucthuhoi;
      daHoanTra += don.dieuKhoan.sotiendadathu;
      conLai += don.dieuKhoan.conLai;
    }

    // ── 6. Trả kết quả ────────────────────────────────────────────────────────
    return res.status(200).json({
      success: true,
      data: {
        tongQuan: {
          tongNhan,
          daHoanTra,
          conLai,
          dangQuaHan,
        },
        danhSach: [
          ...Object.values(vayMap),
          ...thuHoiList,
        ],
      },
    });
  } catch (error) {
    console.error('Loi getMyRepayments:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/lich-tra-no/:lichtranoId/nop-minh-chung
// Nộp minh chứng thanh toán cho 1 kỳ trả nợ
// ─────────────────────────────────────────────────────────────────────────────
export const submitProof = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { lichtranoId } = req.params;
    const nguoidungId = req.user.id;
    const { minhchungtrano, ghiChu } = req.body;

    if (!minhchungtrano) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp file minh chứng.' });
    }

    // Kiểm tra kỳ trả thuộc đúng user
    const [[lichtrano]] = await connection.query(
      `SELECT lt.*, hd.yeucauhotro_id, yc.nguoidung_id
       FROM lichtrano lt
       INNER JOIN hopdongvayvon hd ON lt.hopdongvayvon_id = hd.hopdongvayvon_id
       INNER JOIN yeucauhotro yc ON hd.yeucauhotro_id = yc.yeucauhotro_id
       WHERE lt.lichtrano_id = ?`,
      [lichtranoId]
    );

    if (!lichtrano) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Không tìm thấy kỳ trả nợ.' });
    }

    if (lichtrano.nguoidung_id !== nguoidungId) {
      await connection.rollback();
      return res.status(403).json({ success: false, message: 'Bạn không có quyền thao tác kỳ trả này.' });
    }

    if (lichtrano.trangthaixacnhan === 'Da xac nhan') {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Kỳ trả này đã được xác nhận, không thể sửa.' });
    }

    if (lichtrano.trangthai === 'Da tra') {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Kỳ trả này đã hoàn tất, không cần nộp thêm.' });
    }

    // Cập nhật minh chứng
    await connection.execute(
      `UPDATE lichtrano
       SET minhchungtrano = ?,
           ghichuxacnhan = ?,
           trangthaixacnhan = 'Cho xac nhan',
           ngaycapnhat = NOW()
       WHERE lichtrano_id = ?`,
      [minhchungtrano, ghiChu || null, lichtranoId]
    );

    await logSystemActivity({
      nguoidungId,
      hanhDong: 'NOP_MINH_CHUNG_TRA_NO',
      loaiDoiTuong: 'lichtrano',
      doiTuongId: parseInt(lichtranoId),
      dulieucu: { trangthaixacnhan: lichtrano.trangthaixacnhan, minhchungtrano: lichtrano.minhchungtrano },
      dulieumoi: { trangthaixacnhan: 'Cho xac nhan', minhchungtrano },
    }, connection);

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: 'Đã nộp minh chứng. Kế toán sẽ xác nhận trong thời gian sớm nhất.',
      data: { lichtranoId: parseInt(lichtranoId), trangthaixacnhan: 'Cho xac nhan' },
    });
  } catch (error) {
    await connection.rollback();
    console.error('Loi submitProof:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  } finally {
    connection.release();
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/lich-tra-no/:lichtranoId/huy-minh-chung
// Huỷ minh chứng đã nộp (chỉ khi chưa được kế toán xử lý)
// ─────────────────────────────────────────────────────────────────────────────
export const revokeProof = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { lichtranoId } = req.params;
    const nguoidungId = req.user.id;

    // Kiểm tra kỳ trả thuộc đúng user
    const [[lichtrano]] = await connection.query(
      `SELECT lt.*, hd.yeucauhotro_id, yc.nguoidung_id
       FROM lichtrano lt
       INNER JOIN hopdongvayvon hd ON lt.hopdongvayvon_id = hd.hopdongvayvon_id
       INNER JOIN yeucauhotro yc ON hd.yeucauhotro_id = yc.yeucauhotro_id
       WHERE lt.lichtrano_id = ?`,
      [lichtranoId]
    );

    if (!lichtrano) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Không tìm thấy kỳ trả nợ.' });
    }

    if (lichtrano.nguoidung_id !== nguoidungId) {
      await connection.rollback();
      return res.status(403).json({ success: false, message: 'Bạn không có quyền thao tác kỳ trả này.' });
    }

    if (lichtrano.trangthaixacnhan === 'Da xac nhan') {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Kỳ trả đã được kế toán xác nhận, không thể huỷ.' });
    }

    if (!lichtrano.minhchungtrano) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Chưa có minh chứng để huỷ.' });
    }

    // Reset minh chứng
    await connection.execute(
      `UPDATE lichtrano
       SET minhchungtrano = NULL,
           ghichuxacnhan = NULL,
           trangthaixacnhan = 'Cho xac nhan',
           ngaycapnhat = NOW()
       WHERE lichtrano_id = ?`,
      [lichtranoId]
    );

    await logSystemActivity({
      nguoidungId,
      hanhDong: 'HUY_MINH_CHUNG_TRA_NO',
      loaiDoiTuong: 'lichtrano',
      doiTuongId: parseInt(lichtranoId),
      dulieucu: { minhchungtrano: lichtrano.minhchungtrano },
      dulieumoi: { minhchungtrano: null },
    }, connection);

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: 'Đã huỷ minh chứng thành công.',
      data: { lichtranoId: parseInt(lichtranoId), trangthaixacnhan: 'Cho xac nhan', minhchungtrano: null },
    });
  } catch (error) {
    await connection.rollback();
    console.error('Loi revokeProof:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  } finally {
    connection.release();
  }
};
