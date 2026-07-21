import pool from '../../config/db.js';
import CongNoModel from '../../models/finance/CongNoModel.js';
import { logSystemActivity } from '../../utils/helpers/loggerHelper.js';

export const getTongQuan = async (req, res) => {
  try {
    const data = await CongNoModel.getTongQuan();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Loi getTongQuan cong no:', error);
    return res.status(500).json({ success: false, message: 'Loi server' });
  }
};

export const getDanhSach = async (req, res) => {
  try {
    const { trangthaiKy, loaiHotro, quyId, tuNgay, denNgay, search, page, limit } = req.query;
    const result = await CongNoModel.getDanhSach({
      trangthaiKy, loaiHotro, quyId, tuNgay, denNgay, search, page, limit,
    });
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('Loi getDanhSach cong no:', error);
    return res.status(500).json({ success: false, message: 'Loi server' });
  }
};

export const getChiTiet = async (req, res) => {
  try {
    const { yeucauhotroId } = req.params;
    const data = await CongNoModel.getChiTietHopDong(parseInt(yeucauhotroId));
    if (!data) {
      return res.status(404).json({ success: false, message: 'Khong tim thay hop dong' });
    }
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Loi getChiTiet cong no:', error);
    return res.status(500).json({ success: false, message: 'Loi server' });
  }
};

export const confirmPayment = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { lichtranoId } = req.params;
    const { soTienThucNhan, ghiChu } = req.body;
    const nguoiDuyetId = req.user.id;

    // 1. Validate lichtrano exists
    const [[lichtrano]] = await connection.query(
      'SELECT lt.*, hd.yeucauhotro_id, hd.sotienvon FROM lichtrano lt INNER JOIN hopdongvayvon hd ON lt.hopdongvayvon_id = hd.hopdongvayvon_id WHERE lt.lichtrano_id = ?',
      [lichtranoId]
    );
    if (!lichtrano) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Khong tim thay ky tra no' });
    }

    // 2. Check trangthaixacnhan
    if (lichtrano.trangthaixacnhan === 'Da xac nhan') {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Ky nay da duoc xac nhan roi' });
    }

    // 3. Validate so tien
    const soPhaiTra = Number(lichtrano.sotiengocphaitra) + Number(lichtrano.sotienlaiphaitra);
    const soThucNhan = parseFloat(soTienThucNhan) || 0;
    if (soThucNhan <= 0) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'So tien thuc nhan phai lon hon 0' });
    }

    // 4. Determine trangthai
    let trangthaiMoi;
    if (soThucNhan >= soPhaiTra) {
      trangthaiMoi = 'Da tra';
    } else {
      trangthaiMoi = 'Tra mot phan';
    }

    // 5. Update lichtrano
    await connection.query(`
      UPDATE lichtrano 
      SET trangthai = ?,
          trangthaixacnhan = 'Da xac nhan',
          ngaythuctra = CURDATE(),
          sotienthuctra = ?,
          ngayxacnhan = NOW(),
          nguoiduyet_id = ?,
          ghichuxacnhan = ?
      WHERE lichtrano_id = ?
    `, [trangthaiMoi, soThucNhan, nguoiDuyetId, ghiChu || null, lichtranoId]);

    // 6. Create giao dich Thu hoi no
    const [gdResult] = await connection.query(`
      INSERT INTO giaodich (
        giaodich_id, yeucauhotro_id, lichtrano_id, quy_id,
        loaigiaodich, sotien, hinhthuc, trangthai,
        ghichu, nguoithuchien_id, ngaygiaodich
      ) VALUES (
        NULL, ?, ?, ?,
        'Thu hoi no', ?, 'Chuyen khoan', 'Thanh cong',
        ?, ?, NOW()
      )
    `, [
      lichtrano.yeucauhotro_id,
      lichtranoId,
      lichtrano.quy_id,
      soThucNhan,
      ghiChu || `Thu hoi no ky ${lichtrano.kythu} - hop dong vay von ${lichtrano.hopdongvayvon_id}`,
      nguoiDuyetId,
    ]);

    // 7. Update quy sodu
    await connection.query(
      'UPDATE quy SET sodu = sodu + ?, ngaycapnhat = NOW() WHERE quy_id = ?',
      [soThucNhan, lichtrano.quy_id]
    );

    // 8. Check if all periods paid -> update hopdongvayvon
    const [[{ chuaTra }]] = await connection.query(`
      SELECT COUNT(*) AS chuaTra
      FROM lichtrano
      WHERE hopdongvayvon_id = ? AND trangthai != 'Da tra'
    `, [lichtrano.hopdongvayvon_id]);

    if (chuaTra === 0) {
      await connection.query(
        "UPDATE hopdongvayvon SET trangthai = 'Da tat toan', ngaycapnhat = NOW() WHERE hopdongvayvon_id = ?",
        [lichtrano.hopdongvayvon_id]
      );
    }

    // 9. Log activity
    await logSystemActivity(req, {
      hanhdong: 'XAC_NHAN_THU_NO',
      loaidoituong: 'lichtrano',
      doituong_id: lichtranoId,
      mota: `Xac nhan thu no ky ${lichtrano.kythu}, so tien ${soThucNhan.toLocaleString('vi-VN')} VND`,
      dulieucu: { trangthaixacnhan: 'Cho xac nhan' },
      dulieumoi: { trangthai: trangthaiMoi, trangthaixacnhan: 'Da xac nhan', sotienthuctra: soThucNhan },
    });

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: trangthaiMoi === 'Da tra'
        ? `Da xac nhan thu thanh cong ky ${lichtrano.kythu}`
        : `Da xac nhan tra mot phan ky ${lichtrano.kythu}`,
      data: {
        lichtranoId: parseInt(lichtranoId),
        kythu: lichtrano.kythu,
        trangthaiCu: lichtrano.trangthai,
        trangthaiMoi,
        soPhaiTra,
        soThucNhan,
        giaoDichId: gdResult.insertId,
        hopDongDaTatToan: chuaTra === 0,
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error('Loi confirmPayment:', error);
    return res.status(500).json({ success: false, message: 'Loi server' });
  } finally {
    connection.release();
  }
};

export const rejectPayment = async (req, res) => {
  try {
    const { lichtranoId } = req.params;
    const { lyDoTuChoi } = req.body;

    if (!lyDoTuChoi || lyDoTuChoi.trim().length < 10) {
      return res.status(400).json({ success: false, message: 'Ly do tu choi phai it nhat 10 ky tu' });
    }

    const [[lichtrano]] = await pool.query('SELECT * FROM lichtrano WHERE lichtrano_id = ?', [lichtranoId]);
    if (!lichtrano) {
      return res.status(404).json({ success: false, message: 'Khong tim thay ky tra no' });
    }
    if (lichtrano.trangthaixacnhan === 'Da xac nhan') {
      return res.status(400).json({ success: false, message: 'Ky nay da duoc xac nhan roi' });
    }

    await pool.query(`
      UPDATE lichtrano 
      SET trangthaixacnhan = 'Bi tu choi',
          ghichuxacnhan = ?,
          ngayxacnhan = NOW(),
          nguoiduyet_id = ?
      WHERE lichtrano_id = ?
    `, [lyDoTuChoi.trim(), req.user.id, lichtranoId]);

    return res.status(200).json({
      success: true,
      message: `Da tu choi minh chung ky ${lichtrano.kythu}`,
    });
  } catch (error) {
    console.error('Loi rejectPayment:', error);
    return res.status(500).json({ success: false, message: 'Loi server' });
  }
};

export const sendReminder = async (req, res) => {
  try {
    const { lichtranoId } = req.params;

    const [[lichtrano]] = await pool.query(`
      SELECT lt.*, nd.hoten, nd.email, hd.yeucauhotro_id
      FROM lichtrano lt
      INNER JOIN hopdongvayvon hd ON lt.hopdongvayvon_id = hd.hopdongvayvon_id
      INNER JOIN yeucauhotro yc ON hd.yeucauhotro_id = yc.yeucauhotro_id
      INNER JOIN nguoidung nd ON yc.nguoidung_id = nd.nguoidung_id
      WHERE lt.lichtrano_id = ?
    `, [lichtranoId]);

    if (!lichtrano) {
      return res.status(404).json({ success: false, message: 'Khong tim thay ky tra no' });
    }

    // Log reminder (email system TBD)
    await logSystemActivity(req, {
      hanhdong: 'NHAC_NO',
      loaidoituong: 'lichtrano',
      doituong_id: lichtranoId,
      mota: `Nhac no ky ${lichtrano.kythu} toi ${lichtrano.hoten} (${lichtrano.email}), so phai tra: ${(Number(lichtrano.sotiengocphaitra) + Number(lichtrano.sotienlaiphaitra)).toLocaleString('vi-VN')} VND`,
    });

    return res.status(200).json({
      success: true,
      message: `Da gui nhac no toi ${lichtrano.hoten}`,
      data: {
        nguoiNhan: lichtrano.hoten,
        email: lichtrano.email,
        kythu: lichtrano.kythu,
        ngayDenHan: lichtrano.ngaydenhan,
      },
    });
  } catch (error) {
    console.error('Loi sendReminder:', error);
    return res.status(500).json({ success: false, message: 'Loi server' });
  }
};

export const getNghiemThuList = async (req, res) => {
  try {
    const { trangthaiNT, loaiKiemTra, quyId, page, limit } = req.query;
    const result = await CongNoModel.getNghiemThuList({
      trangthaiNT, loaiKiemTra, quyId, page, limit,
    });
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('Loi getNghiemThuList:', error);
    return res.status(500).json({ success: false, message: 'Loi server' });
  }
};
