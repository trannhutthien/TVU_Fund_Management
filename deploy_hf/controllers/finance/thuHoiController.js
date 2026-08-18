import pool from '../../config/db.js';
import DieuKhoanThuHoiModel from '../../models/applications/DieuKhoanThuHoiModel.js';
import { sendPaymentConfirmedEmail } from '../../services/emailService.js';
import { logSystemActivity } from '../../utils/helpers/loggerHelper.js';

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: submitRecoveryProof
// MỤC ĐÍCH: Sinh vien nop tien thu hoi
// ─────────────────────────────────────────────────────────────────────────────
export const submitRecoveryProof = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { soTien, minhchungtrano, ghiChu } = req.body;
    const nguoidungId = req.user.id;

    // 1. Kiem tra dieukhoanthuhoi ton tai va thu ve nguoi dung hien tai
    const dkh = await DieuKhoanThuHoiModel.getById(parseInt(id));
    if (!dkh) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Khong tim thay dieu khoan thu hoi' });
    }
    if (dkh.nguoidung_id !== nguoidungId) {
      await connection.rollback();
      return res.status(403).json({ success: false, message: 'Khong co quyen' });
    }

    // 2. Kiem tra khong con lan nop dang cho xac nhan
    const pendingPayment = await DieuKhoanThuHoiModel.getLatestPendingPayment(parseInt(id), connection);
    if (pendingPayment) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Co lan nop dang cho xac nhan, vui long cho hoac huy truoc' });
    }

    // 3. Validate so tien
    const soTienNum = parseFloat(soTien);
    if (isNaN(soTienNum) || soTienNum <= 0) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'So tien khong hop le' });
    }

    const conLai = parseFloat(dkh.mucthuhoi) - parseFloat(dkh.sotiendadathu);
    if (soTienNum > conLai) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Vuot qua so tien con lai' });
    }

    // 4. Tao dong nop tien trong thuhoilannop + cap nhat dieukhoanthuhoi
    const result = await DieuKhoanThuHoiModel.addPayment(
      parseInt(id),
      { soTien: soTienNum, minhchung: minhchungtrano, ghiChu },
      connection
    );

    // 5. Cap nhat yeucauhotro.trangthai
    // Chi set 'Dang thu hoi no' cho loai 'Cho vay'; 'Tai tro co thu hoi' giu nguyen trang thai
    if (dkh.loaihotro === 'Cho vay') {
      await connection.query(
        `UPDATE yeucauhotro SET trangthai = 'Dang thu hoi no', ngaycapnhat = NOW() WHERE yeucauhotro_id = ?`,
        [dkh.yeucauhotro_id]
      );
    }

    // 6. Cap nhat lichtrano neu don co hop dong vay
    const [[hopDong]] = await connection.query(
      `SELECT hopdongvayvon_id FROM hopdongvayvon WHERE yeucauhotro_id = ? LIMIT 1`,
      [dkh.yeucauhotro_id]
    );
    if (hopDong) {
      const [[kyChuaTra]] = await connection.query(
        `SELECT lichtrano_id, sotiengocphaitra, sotienlaiphaitra
         FROM lichtrano
         WHERE hopdongvayvon_id = ? AND trangthai != 'Da tra'
         ORDER BY kythu ASC LIMIT 1`,
        [hopDong.hopdongvayvon_id]
      );
      if (kyChuaTra) {
        const soPhaiTra = Number(kyChuaTra.sotiengocphaitra || 0) + Number(kyChuaTra.sotienlaiphaitra || 0);
        const tongDaTra = parseFloat(dkh.sotiendadathu);
        const trangthaiMoi = tongDaTra >= soPhaiTra ? 'Da tra' : 'Tra mot phan';
        await connection.query(
          `UPDATE lichtrano
           SET sotienthuctra = ?,
               ngaythuctra = CURDATE(),
               trangthaixacnhan = 'Cho xac nhan',
               trangthai = ?,
               ngaycapnhat = NOW()
           WHERE lichtrano_id = ?`,
          [tongDaTra, trangthaiMoi, kyChuaTra.lichtrano_id]
        );
      }
    }

    await connection.commit();

    logSystemActivity(req, {
      nguoidung_id: nguoidungId,
      hanhdong: 'NOP_TIEN_THU_HOI',
      mota: `Nop ${soTienNum} VND cho dieukhoanthuhoi #${id}`
    }).catch(() => {});

    return res.status(200).json({
      success: true,
      message: result.daThuHet ? 'Da thu het tien' : 'Nop tien thanh cong',
      data: { trangthai: result.newTrangthai, conLai: result.conLai }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Loi submitRecoveryProof:', error);
    if (error.message === 'VUOT_CON_LAI') {
      return res.status(400).json({ success: false, message: 'Vuot qua so tien con lai' });
    }
    return res.status(500).json({ success: false, message: 'Loi server' });
  } finally {
    connection.release();
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: confirmRecoveryPayment
// MỤC ĐÍCH: Ke toan xac nhan tien thu hoi (theo lan nop)
// ─────────────────────────────────────────────────────────────────────────────
export const confirmRecoveryPayment = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { lanNopId } = req.params;
    const { ghiChu } = req.body;
    const nguoiDuyetId = req.user.id;

    // 1. Xac nhan trong thuhoilannop
    const result = await DieuKhoanThuHoiModel.confirmPayment(
      parseInt(lanNopId),
      { nguoiDuyetId, ghiChu },
      connection
    );

    // 2. Lay thong tin user + quy_id truoc khi tao giaodich
    const [[dkhInfo]] = await connection.query(
      `SELECT dkh.yeucauhotro_id, dkh.mucthuhoi, dkh.sotiendadathu, yc.quy_id,
              nd.hoten AS nguoiNhanTen, nd.email AS nguoiNhanEmail
       FROM thuhoilannop lnp
       INNER JOIN dieukhoanthuhoi dkh ON lnp.dieukhoanthuhoi_id = dkh.dieukhoanthuhoi_id
       INNER JOIN yeucauhotro yc ON dkh.yeucauhotro_id = yc.yeucauhotro_id
       INNER JOIN nguoidung nd ON yc.nguoidung_id = nd.nguoidung_id
       WHERE lnp.lan_nop_id = ?`,
      [lanNopId]
    );

    // 3. Tao giaodich 'Thu hoi von'
    await connection.query(
      `INSERT INTO giaodich (yeucauhotro_id, quy_id, loaigiaodich, sotien, hinhthuc, trangthai, ghichu, nguoithuchien_id, ngaygiaodich)
       VALUES (?, ?, 'Thu hoi von', ?, 'Chuyen khoan', 'Thanh cong', ?, ?, NOW())`,
      [result.yeucauhotroId, dkhInfo?.quy_id, result.soTien, ghiChu || `Xac nhan thu hoi lan nop #${lanNopId}`, nguoiDuyetId]
    );

    // 4. Cap nhat quy.sodu
    if (dkhInfo?.quy_id) {
      await connection.query(
        `UPDATE quy SET sodu = sodu + ?, ngaycapnhat = NOW() WHERE quy_id = ?`,
        [result.soTien, dkhInfo.quy_id]
      );
    }

    // 5. Cap nhat lichtrano tuong ung (neu don co hop dong vay)
    if (dkhInfo?.yeucauhotro_id) {
      const [[hopDong]] = await connection.query(
        `SELECT hopdongvayvon_id FROM hopdongvayvon WHERE yeucauhotro_id = ? LIMIT 1`,
        [dkhInfo.yeucauhotro_id]
      );
      if (hopDong) {
        const [[kyChoXacNhan]] = await connection.query(
          `SELECT lichtrano_id, sotiengocphaitra, sotienlaiphaitra
           FROM lichtrano
           WHERE hopdongvayvon_id = ? AND trangthaixacnhan = 'Cho xac nhan'
           ORDER BY kythu ASC LIMIT 1`,
          [hopDong.hopdongvayvon_id]
        );
        if (kyChoXacNhan) {
          const soPhaiTra = Number(kyChoXacNhan.sotiengocphaitra || 0) + Number(kyChoXacNhan.sotienlaiphaitra || 0);
          const tongDaTra = parseFloat(dkhInfo.sotiendadathu);
          const trangthaiMoi = tongDaTra >= soPhaiTra ? 'Da tra' : 'Tra mot phan';
          await connection.query(
            `UPDATE lichtrano
             SET sotienthuctra = ?,
                 ngaythuctra = CURDATE(),
                 nguoiduyet_id = ?,
                 trangthaixacnhan = 'Da xac nhan',
                 trangthai = ?,
                 ngayxacnhan = NOW()
             WHERE lichtrano_id = ?`,
            [tongDaTra, nguoiDuyetId, trangthaiMoi, kyChoXacNhan.lichtrano_id]
          );
        }
      }
    }

    await connection.commit();

    // 6. Gui email thong bao cho sinh vien
    if (dkhInfo?.nguoiNhanEmail) {
      sendPaymentConfirmedEmail(dkhInfo.nguoiNhanEmail, dkhInfo.nguoiNhanTen, `thu hoi lan nop #${lanNopId}`, result.soTien).catch(() => {});
    }

    // 7. Kiem tra da thu het → cap nhat terminal status
    if (dkhInfo && parseFloat(dkhInfo.sotiendadathu) >= parseFloat(dkhInfo.mucthuhoi)) {
      await pool.query(
        `UPDATE yeucauhotro SET trangthai = 'Hoan thanh', ngaycapnhat = NOW() WHERE yeucauhotro_id = ?`,
        [dkhInfo.yeucauhotro_id]
      ).catch(() => {});
    }

    logSystemActivity(req, {
      nguoidung_id: nguoiDuyetId,
      hanhdong: 'XAC_NHAN_THU_HOI',
      mota: `Xac nhan ${result.soTien} VND thu hoi lan nop #${lanNopId}`
    }).catch(() => {});

    return res.status(200).json({
      success: true,
      message: 'Xac nhan thanh cong',
      data: { soTien: result.soTien }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Loi confirmRecoveryPayment:', error);
    if (error.message === 'KHONG_XAC_NHAN_DUOC') {
      return res.status(400).json({ success: false, message: 'Khong the xac nhan (da xac nhan hoac chua nop)' });
    }
    return res.status(500).json({ success: false, message: 'Loi server' });
  } finally {
    connection.release();
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: rejectRecoveryPayment
// MỤC ĐÍCH: Ke toan tu choi tien thu hoi (theo lan nop)
// ─────────────────────────────────────────────────────────────────────────────
export const rejectRecoveryPayment = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { lanNopId } = req.params;
    const { lyDoTuChoi } = req.body;
    const nguoiDuyetId = req.user.id;

    if (!lyDoTuChoi || lyDoTuChoi.trim().length < 10) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Ly do tu choi toi thieu 10 ky tu' });
    }

    const result = await DieuKhoanThuHoiModel.rejectPayment(
      parseInt(lanNopId),
      { nguoiDuyetId, lyDo: lyDoTuChoi },
      connection
    );

    // Giam sotiendadathu tren dieukhoanthuhoi (vi lan nop bi tu choi)
    await connection.query(
      `UPDATE dieukhoanthuhoi
       SET sotiendadathu = sotiendadathu - ?,
           ngaycapnhat = NOW()
       WHERE dieukhoanthuhoi_id = ?`,
      [result.soTien, result.dieukhoanthuhoiId]
    );

    // Cap nhat trangthai tren dieukhoanthuhoi sau khi giam
    const [[dkhAfter]] = await connection.query(
      `SELECT sotiendadathu, mucthuhoi FROM dieukhoanthuhoi WHERE dieukhoanthuhoi_id = ?`,
      [result.dieukhoanthuhoiId]
    );
    const newTrangthai = dkhAfter.sotiendadathu <= 0 ? 'Chua thu' : 'Dang thu';
    await connection.query(
      `UPDATE dieukhoanthuhoi SET trangthai = ?, ngaycapnhat = NOW() WHERE dieukhoanthuhoi_id = ?`,
      [newTrangthai, result.dieukhoanthuhoiId]
    );

    // Neu sotiendadathu = 0 va la 'Cho vay' → revert yeucauhotro.trangthai ve 'Da giai ngan'
    if (dkhAfter.sotiendadathu <= 0) {
      const [[ycInfo]] = await connection.query(
        `SELECT yc.loaihotro FROM yeucauhotro yc
         INNER JOIN dieukhoanthuhoi dkh ON dkh.yeucauhotro_id = yc.yeucauhotro_id
         WHERE dkh.dieukhoanthuhoi_id = ?`,
        [result.dieukhoanthuhoiId]
      );
      if (ycInfo && ycInfo.loaihotro === 'Cho vay') {
        await connection.query(
          `UPDATE yeucauhotro SET trangthai = 'Da giai ngan', ngaycapnhat = NOW() WHERE yeucauhotro_id = (
            SELECT yeucauhotro_id FROM dieukhoanthuhoi WHERE dieukhoanthuhoi_id = ?
          )`,
          [result.dieukhoanthuhoiId]
        );
      }
    }

    await connection.commit();

    logSystemActivity(req, {
      nguoidung_id: nguoiDuyetId,
      hanhdong: 'TU_CHOI_THU_HOI',
      mota: `Tu choi thu hoi lan nop #${lanNopId}: ${lyDoTuChoi}`
    }).catch(() => {});

    return res.status(200).json({
      success: true,
      message: 'Da tu choi',
      data: { soTien: result.soTien }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Loi rejectRecoveryPayment:', error);
    if (error.message === 'KHONG_XAC_NHAN_DUOC') {
      return res.status(400).json({ success: false, message: 'Khong the tu choi (da xac nhan hoac chua nop)' });
    }
    return res.status(500).json({ success: false, message: 'Loi server' });
  } finally {
    connection.release();
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getPaymentHistory
// MỤC ĐÍCH: Lay lich su nop tien cua mot dieukhoanthuhoi
// ─────────────────────────────────────────────────────────────────────────────
export const getPaymentHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await DieuKhoanThuHoiModel.getPaymentHistory(parseInt(id));
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Loi getPaymentHistory:', error);
    return res.status(500).json({ success: false, message: 'Loi server' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getRecoveryList
// MỤC ĐÍCH: Danh sach dieukhoanthuhoi cho ke toan
// ─────────────────────────────────────────────────────────────────────────────
export const getRecoveryList = async (req, res) => {
  try {
    const { trangthai, page, limit } = req.query;
    const result = await DieuKhoanThuHoiModel.getAllForAdmin({ trangthai, page, limit });
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('Loi getRecoveryList:', error);
    return res.status(500).json({ success: false, message: 'Loi server' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getRecoveryDetail
// MỤC ĐÍCH: Chi tiet dieukhoanthuhoi + lich su nop tien
// ─────────────────────────────────────────────────────────────────────────────
export const getRecoveryDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const dkh = await DieuKhoanThuHoiModel.getById(parseInt(id));
    if (!dkh) {
      return res.status(404).json({ success: false, message: 'Khong tim thay' });
    }
    const lichSuNopTien = await DieuKhoanThuHoiModel.getPaymentHistory(parseInt(id));
    return res.status(200).json({ success: true, data: { ...dkh, lichSuNopTien } });
  } catch (error) {
    console.error('Loi getRecoveryDetail:', error);
    return res.status(500).json({ success: false, message: 'Loi server' });
  }
};

// HÀM: getRecoveryDetailByYeuCauHoTro
// MỤC ĐÍCH: Chi tiet dieukhoanthuhoi theo yeucauhotro_id (dung cho ContractDetailPage)
// ─────────────────────────────────────────────────────────────────────────────
export const getRecoveryDetailByYeuCauHoTro = async (req, res) => {
  try {
    const { yeucauhotroId } = req.params;
    const dkh = await DieuKhoanThuHoiModel.getByYeuCauHoTroId(parseInt(yeucauhotroId));
    if (!dkh) {
      return res.status(404).json({ success: false, message: 'Khong tim thay dieu khoan thu hoi' });
    }
    const lichSuNopTien = await DieuKhoanThuHoiModel.getPaymentHistory(dkh.dieukhoanthuhoi_id);
    return res.status(200).json({ success: true, data: { ...dkh, lichSuNopTien } });
  } catch (error) {
    console.error('Loi getRecoveryDetailByYeuCauHoTro:', error);
    return res.status(500).json({ success: false, message: 'Loi server' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: cancelRecoveryPayment
// MỤC ĐÍCH: Sinh vien huy lan nop tien (chi khi dang cho xac nhan)
// ─────────────────────────────────────────────────────────────────────────────
export const cancelRecoveryPayment = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { lanNopId } = req.params;
    const nguoidungId = req.user.id;

    const result = await DieuKhoanThuHoiModel.cancelPayment(
      parseInt(lanNopId),
      nguoidungId,
      connection
    );

    // Neu sotiendadathu = 0 sau khi huy → revert yeucauhotro.trangthai
    const [[dkhAfter]] = await connection.query(
      `SELECT sotiendadathu FROM dieukhoanthuhoi WHERE dieukhoanthuhoi_id = ?`,
      [result.dieukhoanthuhoiId]
    );
    if (dkhAfter && dkhAfter.sotiendadathu <= 0) {
      const [[ycInfo]] = await connection.query(
        `SELECT yc.loaihotro FROM yeucauhotro yc
         INNER JOIN dieukhoanthuhoi dkh ON dkh.yeucauhotro_id = yc.yeucauhotro_id
         WHERE dkh.dieukhoanthuhoi_id = ?`,
        [result.dieukhoanthuhoiId]
      );
      if (ycInfo && ycInfo.loaihotro === 'Cho vay') {
        await connection.query(
          `UPDATE yeucauhotro SET trangthai = 'Da giai ngan', ngaycapnhat = NOW() WHERE yeucauhotro_id = (
            SELECT yeucauhotro_id FROM dieukhoanthuhoi WHERE dieukhoanthuhoi_id = ?
          )`,
          [result.dieukhoanthuhoiId]
        );
      }
    }

    await connection.commit();

    logSystemActivity(req, {
      nguoidung_id: nguoidungId,
      hanhdong: 'HUY_TIEN_THU_HOI',
      mota: `Huy lan nop tien #${lanNopId} cua dieukhoanthuhoi #${result.dieukhoanthuhoiId}`
    }).catch(() => {});

    return res.status(200).json({
      success: true,
      message: 'Da huy thanh cong',
      data: { soTien: result.soTien }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Loi cancelRecoveryPayment:', error);
    if (error.message === 'KHONG_TIM_THAY') {
      return res.status(404).json({ success: false, message: 'Khong tim thay lan nop tien' });
    }
    if (error.message === 'KHONG_THE_HUY') {
      return res.status(400).json({ success: false, message: 'Chi duoc huy khi dang cho xac nhan' });
    }
    if (error.message === 'KHONG_CO_QUYEN') {
      return res.status(403).json({ success: false, message: 'Khong co quyen huy' });
    }
    return res.status(500).json({ success: false, message: 'Loi server' });
  } finally {
    connection.release();
  }
};
