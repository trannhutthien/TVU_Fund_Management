import pool from '../../config/db.js';

const CongNoModel = {
  async getTongQuan() {
    // 1. Tong du no — SUM mucthuhoi tu dieukhoanthuhoi chua thu het
    const [[duNo]] = await pool.query(`
      SELECT COALESCE(SUM(dkh.mucthuhoi - dkh.sotiendadathu), 0) AS tongDuNo
      FROM dieukhoanthuhoi dkh
      INNER JOIN yeucauhotro yc ON dkh.yeucauhotro_id = yc.yeucauhotro_id
      WHERE dkh.trangthai != 'Da thu het'
        AND yc.trangthai IN ('Da giai ngan', 'Da nghiem thu')
    `);

    // Cong no cho vay — SUM con lai tu lichtrano chua tra het
    const [[duNoVay]] = await pool.query(`
      SELECT COALESCE(SUM(
        CASE 
          WHEN lt.trangthai = 'Da tra' THEN 0
          WHEN lt.trangthai = 'Tra mot phan' THEN (lt.sotiengocphaitra + lt.sotienlaiphaitra) - COALESCE(lt.sotienthuctra, 0)
          ELSE lt.sotiengocphaitra + lt.sotienlaiphaitra
        END
      ), 0) AS tongDuNoVay
      FROM lichtrano lt
      INNER JOIN hopdongvayvon hd ON lt.hopdongvayvon_id = hd.hopdongvayvon_id
      INNER JOIN yeucauhotro yc ON hd.yeucauhotro_id = yc.yeucauhotro_id
      WHERE hd.trangthai = 'Dang thuc hien'
        AND yc.trangthai IN ('Da giai ngan', 'Da nghiem thu')
    `);

    // 2. Da thu hoi luy ke — SUM giaodich loai 'Thu hoi no'
    const [[daThu]] = await pool.query(`
      SELECT COALESCE(SUM(gd.sotien), 0) AS daThuHoi
      FROM giaodich gd
      WHERE gd.loaigiaodich = 'Thu hoi no'
        AND gd.trangthai = 'Thanh cong'
    `);

    // 3. Dang qua han — SUM tien cac ky qua han (cho vay)
    const [[quaHanVay]] = await pool.query(`
      SELECT COALESCE(SUM(lt.sotiengocphaitra + lt.sotienlaiphaitra - COALESCE(lt.sotienthuctra, 0)), 0) AS tienQuaHan
      FROM lichtrano lt
      INNER JOIN hopdongvayvon hd ON lt.hopdongvayvon_id = hd.hopdongvayvon_id
      WHERE lt.trangthai = 'Qua han'
    `);

    // 4. So ho so qua han (cho vay)
    const [[soHSQuaHan]] = await pool.query(`
      SELECT COUNT(DISTINCT hd.yeucauhotro_id) AS soHoSo
      FROM lichtrano lt
      INNER JOIN hopdongvayvon hd ON lt.hopdongvayvon_id = hd.hopdongvayvon_id
      WHERE lt.trangthai = 'Qua han'
    `);

    // 5. Cho xac nhan — COUNT ky co trangthaixacnhan = 'Cho xac nhan'
    const [[choXacNhan]] = await pool.query(`
      SELECT COUNT(*) AS soKy
      FROM lichtrano lt
      WHERE lt.trangthaixacnhan = 'Cho xac nhan'
        AND lt.trangthai IN ('Qua han', 'Tra mot phan')
    `);

    return {
      tongDuNo: Number(duNo.tongDuNo) + Number(duNoVay.tongDuNoVay),
      daThuHoi: Number(daThu.daThuHoi),
      dangQuaHan: Number(quaHanVay.tienQuaHan),
      soHoSoQuaHan: Number(soHSQuaHan.soHoSo),
      choXacNhan: Number(choXacNhan.soKy),
    };
  },

  async getDanhSach({ trangthaiKy = '', loaiHotro = '', quyId = '', tuNgay = '', denNgay = '', search = '', page = 1, limit = 20 }) {
    const conditions = [];
    const params = [];

    // Only active contracts
    conditions.push("hd.trangthai = 'Dang thuc hien'");
    conditions.push("yc.trangthai IN ('Da giai ngan', 'Da nghiem thu')");

    if (trangthaiKy) {
      conditions.push('lt.trangthai = ?');
      params.push(trangthaiKy);
    }
    if (loaiHotro) {
      conditions.push('yc.loaihotro = ?');
      params.push(loaiHotro);
    }
    if (quyId) {
      conditions.push('yc.quy_id = ?');
      params.push(parseInt(quyId));
    }
    if (tuNgay) {
      conditions.push('lt.ngaydenhan >= ?');
      params.push(tuNgay);
    }
    if (denNgay) {
      conditions.push('lt.ngaydenhan <= ?');
      params.push(denNgay);
    }
    if (search) {
      conditions.push('(nd.hoten LIKE ? OR nd.email LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    // Count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM lichtrano lt
      INNER JOIN hopdongvayvon hd ON lt.hopdongvayvon_id = hd.hopdongvayvon_id
      INNER JOIN yeucauhotro yc ON hd.yeucauhotro_id = yc.yeucauhotro_id
      INNER JOIN nguoidung nd ON yc.nguoidung_id = nd.nguoidung_id
      INNER JOIN quy q ON yc.quy_id = q.quy_id
      ${whereClause}
    `;
    const [[{ total }]] = await pool.query(countQuery, params);

    // Data
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const dataQuery = `
      SELECT
        lt.lichtrano_id,
        lt.kythu,
        lt.ngaydenhan,
        lt.sotiengocphaitra,
        lt.sotienlaiphaitra,
        lt.ngaythuctra,
        lt.sotienthuctra,
        lt.trangthai,
        lt.trangthaixacnhan,
        lt.minhchungtrano,
        lt.ghichuxacnhan,
        lt.ngayxacnhan,
        hd.hopdongvayvon_id,
        hd.sotienvon,
        hd.laisuatphantram,
        hd.kyhandothang,
        hd.ngaydaohan,
        yc.yeucauhotro_id,
        yc.loaihotro,
        yc.lydo AS tieuDe,
        yc.tongkinhphidudan,
        nd.hoten AS nguoi_nhan_ten,
        nd.email AS nguoi_nhan_email,
        nd.sodienthoai AS nguoi_nhan_sdt,
        q.quy_id,
        q.tenquy,
        q.sodu AS quy_sodu
      FROM lichtrano lt
      INNER JOIN hopdongvayvon hd ON lt.hopdongvayvon_id = hd.hopdongvayvon_id
      INNER JOIN yeucauhotro yc ON hd.yeucauhotro_id = yc.yeucauhotro_id
      INNER JOIN nguoidung nd ON yc.nguoidung_id = nd.nguoidung_id
      INNER JOIN quy q ON yc.quy_id = q.quy_id
      ${whereClause}
      ORDER BY
        CASE lt.trangthaixacnhan
          WHEN 'Cho xac nhan' THEN 0
          WHEN 'Bi tu choi' THEN 1
          ELSE 2
        END,
        CASE lt.trangthai
          WHEN 'Qua han' THEN 0
          WHEN 'Tra mot phan' THEN 1
          WHEN 'Chua den han' THEN 2
          WHEN 'Da tra' THEN 3
          ELSE 4
        END,
        lt.ngaydenhan ASC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(dataQuery, [...params, limitNum, offset]);

    return {
      data: rows,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalRecords: total,
        limit: limitNum,
      },
    };
  },

  async getChiTietHopDong(yeucauhotroId) {
    // Get hopdongvayvon + lichtrano
    const [[hopdong]] = await pool.query(`
      SELECT
        hd.*,
        yc.loaihotro,
        yc.lydo AS tieuDe,
        yc.tongkinhphidudan,
        nd.hoten AS nguoi_nhan_ten,
        nd.email AS nguoi_nhan_email,
        q.quy_id,
        q.tenquy,
        q.sodu AS quy_sodu
      FROM hopdongvayvon hd
      INNER JOIN yeucauhotro yc ON hd.yeucauhotro_id = yc.yeucauhotro_id
      INNER JOIN nguoidung nd ON yc.nguoidung_id = nd.nguoidung_id
      INNER JOIN quy q ON yc.quy_id = q.quy_id
      WHERE hd.yeucauhotro_id = ?
      LIMIT 1
    `, [yeucauhotroId]);

    if (!hopdong) return null;

    const [lichTraNo] = await pool.query(`
      SELECT lt.*
      FROM lichtrano lt
      WHERE lt.hopdongvayvon_id = ?
      ORDER BY lt.kythu ASC
    `, [hopdong.hopdongvayvon_id]);

    return { hopdong, lichTraNo };
  },

  async getNghiemThuList({ trangthaiNT = '', loaiKiemTra = '', quyId = '', page = 1, limit = 20 }) {
    const conditions = [];
    const params = [];

    conditions.push('yc.canghiemthu = 1');
    conditions.push("yc.trangthai IN ('Da giai ngan', 'Cho nghiem thu', 'Da nghiem thu', 'Nghiem thu khong dat')");

    if (trangthaiNT) {
      conditions.push('yc.trangthai = ?');
      params.push(trangthaiNT);
    }
    if (quyId) {
      conditions.push('yc.quy_id = ?');
      params.push(parseInt(quyId));
    }

    const whereClause = 'WHERE ' + conditions.join(' AND ');

    const countQuery = `
      SELECT COUNT(DISTINCT yc.yeucauhotro_id) as total
      FROM yeucauhotro yc
      ${whereClause}
    `;
    const [[{ total }]] = await pool.query(countQuery, params);

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const dataQuery = `
      SELECT
        yc.yeucauhotro_id,
        yc.lydo AS tieuDe,
        yc.trangthai,
        yc.loaihotro,
        yc.ngaynop,
        nd.hoten AS nguoi_nhan_ten,
        nd.email AS nguoi_nhan_email,
        q.tenquy,
        q.quy_id,
        nt.nghiemthu_id AS lan_gan_nhat_id,
        nt.lanthu AS lan_gan_nhat,
        nt.loaikiemtra AS loai_kiem_tra_gan_nhat,
        nt.ketqua AS ket_qua_gan_nhat,
        nt.ngaynghiemthu AS ngay_nghiem_thu_gan_nhat,
        nt.nhanxet AS nhan_xet_gan_nhat,
        (SELECT COUNT(*) FROM nghiemthu nt2 WHERE nt2.yeucauhotro_id = yc.yeucauhotro_id) AS tong_lan_nghiem_thu
      FROM yeucauhotro yc
      INNER JOIN nguoidung nd ON yc.nguoidung_id = nd.nguoidung_id
      INNER JOIN quy q ON yc.quy_id = q.quy_id
      LEFT JOIN nghiemthu nt ON nt.yeucauhotro_id = yc.yeucauhotro_id
        AND nt.ngaynghiemthu = (
          SELECT MAX(nt2.ngaynghiemthu) FROM nghiemthu nt2 
          WHERE nt2.yeucauhotro_id = yc.yeucauhotro_id
        )
      ${whereClause}
      ORDER BY
        CASE yc.trangthai
          WHEN 'Cho nghiem thu' THEN 0
          WHEN 'Da giai ngan' THEN 1
          WHEN 'Nghiem thu khong dat' THEN 2
          WHEN 'Da nghiem thu' THEN 3
          ELSE 4
        END,
        yc.ngaynop DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(dataQuery, [...params, limitNum, offset]);

    return {
      data: rows,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalRecords: total,
        limit: limitNum,
      },
    };
  },
};

export default CongNoModel;
