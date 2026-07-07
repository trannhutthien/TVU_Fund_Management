import FundModel from "../../models/funds/FundModel.js";
import LoaiQuyModel from "../../models/funds/LoaiQuyModel.js";
import BankAccountModel from "../../models/funds/BankAccountModel.js";
import { buildFundImageUrl } from "../../utils/helpers/imageHelper.js";
import { logSystemActivity } from "../../utils/helpers/loggerHelper.js";

const DEFAULT_LOAI_DIEU_HANH = 'Tap trung - Be chung';
const VALID_LOAI_DIEU_HANH = [DEFAULT_LOAI_DIEU_HANH, 'Tap trung - Muc chi'];

const parseOptionalNumber = (value) => (
  value !== undefined && value !== '' && value !== null ? Number(value) : null
);

const parseOptionalInteger = (value) => (
  value !== undefined && value !== '' && value !== null ? Number(value) : null
);

const validateFundingPlan = ({ soTienMucTieu, soTienHoTroToiDa, soLuongChiTieu }) => {
  const mucTieu = parseOptionalNumber(soTienMucTieu);
  const hoTroToiDa = parseOptionalNumber(soTienHoTroToiDa);
  const soSuat = parseOptionalInteger(soLuongChiTieu);

  if (mucTieu !== null && (Number.isNaN(mucTieu) || mucTieu < 0)) {
    return { field: 'soTienMucTieu', message: 'Số tiền mục tiêu phải là số và lớn hơn hoặc bằng 0' };
  }

  if (hoTroToiDa !== null && (Number.isNaN(hoTroToiDa) || hoTroToiDa < 0)) {
    return { field: 'soTienHoTroToiDa', message: 'Số tiền hỗ trợ tối đa phải là số và lớn hơn hoặc bằng 0' };
  }

  if (soSuat !== null && (!Number.isInteger(soSuat) || soSuat <= 0)) {
    return { field: 'soLuongChiTieu', message: 'Số suất phải là số nguyên lớn hơn 0' };
  }

  if (mucTieu !== null && mucTieu > 0 && hoTroToiDa !== null && hoTroToiDa > 0) {
    const expectedSeats = mucTieu / hoTroToiDa;
    if (!Number.isInteger(expectedSeats)) {
      return {
        field: 'soLuongChiTieu',
        message: 'Số tiền mục tiêu phải chia hết cho số tiền hỗ trợ mỗi suất để xác định chính xác số suất',
      };
    }

    if (soSuat === null) {
      return {
        field: 'soLuongChiTieu',
        message: `Vui lòng nhập số suất bằng ${expectedSeats}`,
      };
    }

    if (soSuat !== expectedSeats) {
      return {
        field: 'soLuongChiTieu',
        message: `Số suất phải bằng Số tiền mục tiêu / Số tiền hỗ trợ mỗi suất: ${expectedSeats} suất`,
      };
    }
  }

  return null;
};

const normalizeFundOperationData = (body, currentFund = null) => {
  const loaiDieuHanh = body.loaiDieuHanh || currentFund?.loai_dieu_hanh || DEFAULT_LOAI_DIEU_HANH;
  const rawQuyChaId = body.quyChaId !== undefined ? body.quyChaId : currentFund?.quy_cha_id;
  const normalizedLoaiDieuHanh = VALID_LOAI_DIEU_HANH.includes(loaiDieuHanh)
    ? loaiDieuHanh
    : loaiDieuHanh;

  return {
    loaiDieuHanh: normalizedLoaiDieuHanh,
    quyChaId: normalizedLoaiDieuHanh === 'Tap trung - Muc chi'
      ? (rawQuyChaId !== undefined && rawQuyChaId !== '' && rawQuyChaId !== null ? Number(rawQuyChaId) : null)
      : null,
    soTienMucTieu: parseOptionalNumber(body.soTienMucTieu),
    soTienHoTroToiDa: parseOptionalNumber(body.soTienHoTroToiDa),
    soLuongChiTieu: parseOptionalInteger(body.soLuongChiTieu),
    soDu: parseOptionalNumber(body.soDu) ?? 0,
  };
};

const validateParentFundForChild = async ({ loaiDieuHanh, quyChaId, childFundId = null, soDu = 0, checkBalance = false }) => {
  if (!VALID_LOAI_DIEU_HANH.includes(loaiDieuHanh)) {
    return 'Hình thức vận hành quỹ không hợp lệ';
  }

  if (loaiDieuHanh !== 'Tap trung - Muc chi') {
    return null;
  }

  if (!quyChaId || Number.isNaN(quyChaId)) {
    return 'Vui lòng chọn Quỹ mẹ cho Quỹ con mục chi';
  }

  if (childFundId && Number(quyChaId) === Number(childFundId)) {
    return 'Quỹ con không thể chọn chính nó làm Quỹ mẹ';
  }

  const parentFund = await FundModel.getFundById(quyChaId);
  if (!parentFund) {
    return 'Không tìm thấy Quỹ mẹ đã chọn';
  }

  if (parentFund.loai_dieu_hanh !== 'Tap trung - Be chung') {
    return 'Quỹ mẹ phải là Quỹ chung (Bể lớn)';
  }

  if (checkBalance && Number(soDu || 0) > Number(parentFund.so_du || 0)) {
    return `Số dư khởi tạo không được vượt quá số dư hiện tại của Quỹ mẹ (${Number(parentFund.so_du || 0).toLocaleString('vi-VN')}đ)`;
  }

  return null;
};

// ─── POST /api/funds ──────────────────────────────────────────────────────────
// Yêu cầu: phải có access token hợp lệ và quyền admin/giáo vụ (role_id: 1 hoặc 3)
// Tạo quỹ mới trong hệ thống
export const createFund = async (req, res) => {
  try {
    const {
      tenQuy,
      loaiQuy,
      moTa,
      hinhAnh,
      soTienMucTieu,
      soTienHoTroToiDa,
      soLuongChiTieu,
      hanNopDon,
      dieuKienTomTat,
      soDu,
      trangThai,
      nguoiTao,
      soDotGiaiNgan,
      dotGiaiNgan
    } = req.body;
    const normalizedFundData = normalizeFundOperationData(req.body);

    // 1. Validate dữ liệu đầu vào
    if (!tenQuy || !loaiQuy) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin: tên quỹ và loại quỹ",
      });
    }

    // 2. Validate loại quỹ
    const loaiQuyExists = await LoaiQuyModel.checkMaLoaiExists(loaiQuy);
    if (!loaiQuyExists) {
      return res.status(400).json({
        success: false,
        message: "Loại quỹ không hợp lệ hoặc không tồn tại trong hệ thống",
      });
    }

    // 3. Validate số dư (nếu có)
    if (soDu !== undefined && (isNaN(soDu) || soDu < 0)) {
      return res.status(400).json({
        success: false,
        message: "Số dư phải là số và lớn hơn hoặc bằng 0",
      });
    }

    const fundingPlanError = validateFundingPlan({
      soTienMucTieu,
      soTienHoTroToiDa,
      soLuongChiTieu,
    });
    if (fundingPlanError) {
      return res.status(400).json({
        success: false,
        message: fundingPlanError.message,
        field: fundingPlanError.field,
      });
    }

    const parentFundError = await validateParentFundForChild({
      loaiDieuHanh: normalizedFundData.loaiDieuHanh,
      quyChaId: normalizedFundData.quyChaId,
      soDu: normalizedFundData.soDu,
      checkBalance: true,
    });
    if (parentFundError) {
      return res.status(400).json({
        success: false,
        message: parentFundError,
      });
    }

    // 4. Validate trạng thái (nếu có)
    if (trangThai) {
      const validStatuses = ['Dang hoat dong', 'Tam dung', 'Da dong'];
      if (!validStatuses.includes(trangThai)) {
        return res.status(400).json({
          success: false,
          message: "Trạng thái không hợp lệ. Chỉ chấp nhận: Dang hoat dong, Tam dung, Da dong",
        });
      }
    }

    // 5. Validate độ dài tên quỹ
    if (tenQuy.trim().length > 150) {
      return res.status(400).json({
        success: false,
        message: "Tên quỹ không được vượt quá 150 ký tự",
      });
    }

    // 6. Validate độ dài mô tả (nếu có)
    if (moTa && moTa.trim().length > 255) {
      return res.status(400).json({
        success: false,
        message: "Mô tả không được vượt quá 255 ký tự",
      });
    }

    // 7. Kiểm tra tên quỹ đã tồn tại chưa
    const nameExists = await FundModel.checkFundNameExists(tenQuy.trim());
    if (nameExists) {
      return res.status(409).json({
        success: false,
        message: "Tên quỹ đã tồn tại",
      });
    }

    // 8. Tạo quỹ mới trong database
    const fundData = {
      tenQuy: tenQuy.trim(),
      loaiQuy: loaiQuy,
      moTa: moTa ? moTa.trim() : null,
      hinhAnh: hinhAnh || null,
      soTienMucTieu: normalizedFundData.soTienMucTieu,
      soTienHoTroToiDa: normalizedFundData.soTienHoTroToiDa,
      soLuongChiTieu: normalizedFundData.soLuongChiTieu,
      hanNopDon: hanNopDon || null,
      dieuKienTomTat: dieuKienTomTat ? dieuKienTomTat.trim() : null,
      soDu: normalizedFundData.soDu,
      trangThai: trangThai || 'Dang hoat dong',
      nguoiTao: nguoiTao || req.user?.id || null,
      ngayBatDau: new Date().toISOString().split('T')[0], // Tự động set ngày hôm nay (YYYY-MM-DD)
      loaiDieuHanh: normalizedFundData.loaiDieuHanh,
      quyChaId: normalizedFundData.quyChaId,
      soDotGiaiNgan: soDotGiaiNgan ? parseInt(soDotGiaiNgan) : 0,
      dotGiaiNgan: dotGiaiNgan || [] // Chi tiết các đợt giải ngân
    };

    const result = await FundModel.createFund(fundData);

    // Ghi nhật ký hệ thống
    await logSystemActivity(req, {
      hanhdong: "THEM_MOI_QUY",
      loaidoituong: "quy",
      doituong_id: result.insertId,
      mota: `Thêm mới quỹ hỗ trợ: ${fundData.tenQuy}`,
      dulieumoi: fundData
    });

    // 9. Lấy thông tin quỹ vừa tạo
    const newFund = await FundModel.getFundById(result.insertId);

    return res.status(201).json({
      success: true,
      message: "Tạo quỹ thành công",
      fund: {
        quyId: newFund.quy_id,
        tenQuy: newFund.ten_quy,
        loaiQuy: newFund.loai_quy,
        moTa: newFund.mo_ta,
        hinhAnh: buildFundImageUrl(newFund.hinh_anh),
        soTienMucTieu: newFund.so_tien_muc_tieu,
        soTienHoTroToiDa: newFund.so_tien_ho_tro_toi_da,
        soTienToiThieu: null,
        soTienToiDa: newFund.so_tien_ho_tro_toi_da,
        soLuongChiTieu: newFund.so_luong_chi_tieu,
        hanNopDon: newFund.han_nop_don,
        dieuKienTomTat: newFund.dieu_kien_tom_tat,
        soDu: newFund.so_du,
        nguoiTao: newFund.nguoitao_id,
        ngayTao: newFund.ngay_tao,
        ngayCapNhat: newFund.ngay_cap_nhat,
        trangThai: newFund.trang_thai,
        loaiDieuHanh: newFund.loai_dieu_hanh,
        quyChaId: newFund.quy_cha_id,
        tenQuyCha: newFund.ten_quy_cha
      }
    });
  } catch (error) {
    console.error("Lỗi createFund:", error);
    if (error.message === 'PARENT_FUND_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy Quỹ mẹ đã chọn"
      });
    }
    if (error.message === 'CHILD_FUND_PARENT_REQUIRED') {
      return res.status(400).json({
        success: false,
        message: "Vui lòng chọn Quỹ mẹ cho Quỹ con mục chi"
      });
    }
    if (error.message === 'INVALID_PARENT_FUND_TYPE') {
      return res.status(400).json({
        success: false,
        message: "Quỹ mẹ phải là Quỹ chung (Bể lớn)"
      });
    }
    if (error.message === 'INSUFFICIENT_PARENT_FUND_BALANCE') {
      return res.status(400).json({
        success: false,
        message: "Số dư Quỹ mẹ không đủ để trích lập số dư khởi tạo cho Quỹ con"
      });
    }
    if (error.message === 'ALLOCATION_ACTOR_REQUIRED') {
      return res.status(400).json({
        success: false,
        message: "Không xác định được người tạo để ghi nhận trích lập ngân sách"
      });
    }
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};


// ─── GET /api/funds ───────────────────────────────────────────────────────────
// Yêu cầu: phải có access token hợp lệ và quyền admin/giáo vụ (role_id: 1 hoặc 3)
// Trả về danh sách tất cả quỹ trong hệ thống
export const getFunds = async (req, res) => {
  try {
    // Lấy danh sách quỹ từ database
    const funds = await FundModel.getAllFunds();

    return res.status(200).json({
      success: true,
      total: funds.length,
      funds: funds.map(fund => ({
        quyId: fund.quy_id,
        tenQuy: fund.ten_quy,
        loaiQuy: fund.loai_quy,
        loaiquy: {
          loaiQuyId: fund.loaiquy_id,
          maLoai: fund.loai_quy,
          tenLoai: fund.ten_loai_quy || fund.loai_quy,
        },
        moTa: fund.mo_ta,
        hinhAnh: buildFundImageUrl(fund.hinh_anh), // Build full URL
        soTienMucTieu: fund.so_tien_muc_tieu,
        soTienHoTroToiDa: fund.so_tien_ho_tro_toi_da,
        soTienToiThieu: null,
        soTienToiDa: fund.so_tien_ho_tro_toi_da,
        soLuongChiTieu: fund.so_luong_chi_tieu,
        hanNopDon: fund.han_nop_don,
        ngayBatDau: fund.ngay_bat_dau || fund.ngaybatdau,
        ngayKetThuc: fund.ngay_ket_thuc || fund.han_nop_don,
        dieuKienTomTat: fund.dieu_kien_tom_tat,
        soDu: fund.so_du,
        nguoiTao: fund.nguoitao_id,
        ngayTao: fund.ngay_tao,
        ngayCapNhat: fund.ngay_cap_nhat,
        trangThai: fund.trang_thai,
        soDonDaNop: fund.so_don_da_nop,
        phanTramDaNhan: fund.phan_tram_da_nhan,
        soQuyConHoatDong: fund.so_quy_con_hoat_dong, // Số quỹ con đang hoạt động (cho quỹ mẹ)
        loaiDieuHanh: fund.loai_dieu_hanh,
        quyChaId: fund.quy_cha_id,
        tenQuyCha: fund.ten_quy_cha
      }))
    });
  } catch (error) {
    console.error("Lỗi getFunds:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

// ─── GET /api/funds/public ────────────────────────────────────────────────────
// API công khai - KHÔNG CẦN AUTHENTICATION
// Trả về danh sách quỹ đang hoạt động hoặc tạm dừng (để hiển thị trên trang công khai)
export const getPublicFunds = async (req, res) => {
  try {
    // Lấy danh sách quỹ công khai từ database
    const funds = await FundModel.getPublicFunds();

    return res.status(200).json({
      success: true,
      total: funds.length,
      funds: funds.map(fund => ({
        quyId: fund.quy_id,
        tenQuy: fund.ten_quy,
        loaiQuy: fund.loai_quy,
        loaiquy: {
          loaiQuyId: fund.loaiquy_id,
          maLoai: fund.loai_quy,
          tenLoai: fund.ten_loai_quy || fund.loai_quy,
        },
        moTa: fund.mo_ta,
        hinhAnh: buildFundImageUrl(fund.hinh_anh), // Build full URL
        soTienMucTieu: fund.so_tien_muc_tieu,
        soTienHoTroToiDa: fund.so_tien_ho_tro_toi_da,
        soTienToiThieu: null,
        soTienToiDa: fund.so_tien_ho_tro_toi_da,
        soLuongChiTieu: fund.so_luong_chi_tieu,
        hanNopDon: fund.han_nop_don,
        ngayBatDau: fund.ngay_bat_dau || fund.ngaybatdau,
        ngayKetThuc: fund.ngay_ket_thuc || fund.han_nop_don,
        dieuKienTomTat: fund.dieu_kien_tom_tat,
        soDu: fund.so_du,
        soDuThucTe: fund.so_du_thuc_te, // Số dư thực tế sau khi trừ các khoản chờ giải ngân
        nguoiTao: fund.nguoitao_id,
        ngayTao: fund.ngay_tao,
        ngayCapNhat: fund.ngay_cap_nhat,
        trangThai: fund.trang_thai,
        soDonDaNop: fund.so_don_da_nop,
        phanTramDaNhan: fund.phan_tram_da_nhan,
        soQuyConHoatDong: fund.so_quy_con_hoat_dong, // Số quỹ con đang hoạt động (cho quỹ mẹ)
        loaiDieuHanh: fund.loai_dieu_hanh,
        quyChaId: fund.quy_cha_id,
        tenQuyCha: fund.ten_quy_cha
      }))
    });
  } catch (error) {
    console.error("Lỗi getPublicFunds:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

// ─── PUT /api/funds/:id/status ────────────────────────────────────────────────
// Yêu cầu: phải có access token hợp lệ và quyền admin/giáo vụ (role_id: 1 hoặc 3)
// Cập nhật trạng thái quỹ (Dang hoat dong, Tam dung, Da dong)
export const updateFundStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { trangThai } = req.body;

    // 1. Validate ID
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID quỹ không hợp lệ",
      });
    }

    // 2. Validate trạng thái
    const validStatuses = ['Dang hoat dong', 'Tam dung', 'Da dong'];
    if (!trangThai || !validStatuses.includes(trangThai)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái không hợp lệ. Chỉ chấp nhận: Dang hoat dong, Tam dung, Da dong",
      });
    }

    // 3. Kiểm tra quỹ có tồn tại không
    const fund = await FundModel.getFundById(id);
    if (!fund) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy quỹ",
      });
    }

    // 4. Kiểm tra nếu quỹ đã đóng thì không cho phép thay đổi
    if (fund.trang_thai === 'Da dong' && trangThai !== 'Da dong') {
      return res.status(400).json({
        success: false,
        message: "Không thể thay đổi trạng thái của quỹ đã đóng",
      });
    }

    // 5. Cập nhật trạng thái
    await FundModel.updateFundStatus(id, trangThai);

    // Ghi nhật ký hệ thống
    await logSystemActivity(req, {
      hanhdong: "CAP_NHAT_TRANG_THAI_QUY",
      loaidoituong: "quy",
      doituong_id: id,
      mota: `Thay đổi trạng thái quỹ ${fund.ten_quy} từ '${fund.trang_thai}' sang '${trangThai}'`,
      dulieucu: { trangThai: fund.trang_thai },
      dulieumoi: { trangThai: trangThai }
    });

    // 6. Lấy thông tin quỹ sau khi cập nhật
    const updatedFund = await FundModel.getFundById(id);

    return res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái quỹ thành công",
      fund: {
        quyId: updatedFund.quy_id,
        tenQuy: updatedFund.ten_quy,
        trangThai: updatedFund.trang_thai,
        ngayCapNhat: updatedFund.ngay_cap_nhat
      }
    });
  } catch (error) {
    console.error("Lỗi updateFundStatus:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

// ─── GET /api/funds/:id ───────────────────────────────────────────────────────
export const getFundDetail = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID quỹ không hợp lệ",
      });
    }

    const fund = await FundModel.getFundById(id);
    if (!fund) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy quỹ",
      });
    }

    // Dữ liệu công khai đi kèm trang chi tiết quỹ
    const [stats, khoanTaiTro, yeuCauHoTro] = await Promise.all([
      FundModel.getFundStats(id),
      FundModel.getReceivedDonationsByFundId(id),
      FundModel.getDisbursedApplicationsByFundId(id),
    ]);

    return res.status(200).json({
      success: true,
      fund: {
        quyId: fund.quy_id,
        tenQuy: fund.ten_quy,
        loaiQuy: fund.loai_quy,
        loaiquy: {
          loaiQuyId: fund.loaiquy_id,
          maLoai: fund.loai_quy,
          tenLoai: fund.ten_loai_quy || fund.loai_quy,
        },
        moTa: fund.mo_ta,
        hinhAnh: buildFundImageUrl(fund.hinh_anh),
        soTienMucTieu: fund.so_tien_muc_tieu,
        soTienHoTroToiDa: fund.so_tien_ho_tro_toi_da,
        soTienToiThieu: null,
        soTienToiDa: fund.so_tien_ho_tro_toi_da,
        soLuongChiTieu: fund.so_luong_chi_tieu,
        hanNopDon: fund.han_nop_don,
        ngayKetThuc: fund.han_nop_don,
        dieuKienTomTat: fund.dieu_kien_tom_tat,
        soDu: fund.so_du,
        nguoiTao: fund.nguoitao_id,
        ngayBatDau: fund.ngaybatdau,
        ngayTao: fund.ngay_tao,
        ngayCapNhat: fund.ngay_cap_nhat,
        trangThai: fund.trang_thai,
        loaiDieuHanh: fund.loai_dieu_hanh,
        quyChaId: fund.quy_cha_id,
        tenQuyCha: fund.ten_quy_cha,
        // Thêm thống kê
        soKhoanTaiTro: stats.soKhoanTaiTro || 0,
        soDonDaHoTro: stats.soDonDaHoTro || 0,
        khoantaitro: khoanTaiTro.map(item => ({
          khoanTaiTroId: item.khoantaitro_id,
          nhaTaiTroId: item.nhataitro_id,
          quyId: item.quy_id,
          tenNhaTaiTro: item.tennhataitro,
          loaiNhaTaiTro: item.loainhataitro,
          logo: item.logo,
          soTien: item.sotien,
          hinhThuc: item.hinhthuc,
          ngayTaiTro: item.ngaytaitro,
          trangThai: item.trangthai,
          ghiChu: item.ghichu,
        })),
        yeucauhotro: yeuCauHoTro.map(item => ({
          yeuCauHoTroId: item.yeucauhotro_id,
          nguoiDungId: item.nguoidung_id,
          quyId: item.quy_id,
          hoTenSinhVien: item.hoten_sinhvien,
          maSoDinhDanh: item.masodinhdanh,
          soTienDeNghi: item.sotiendenghi,
          trangThai: item.trangthai,
          ngayNop: item.ngaynop,
          ngayCapNhat: item.ngaycapnhat,
        })),
      }
    });
  } catch (error) {
    console.error("Lỗi getFundDetail:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

// ─── PUT /api/funds/:id ───────────────────────────────────────────────────────
export const updateFund = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      tenQuy,
      loaiQuy,
      moTa,
      hinhAnh,
      soTienMucTieu,
      soTienHoTroToiDa,
      soLuongChiTieu,
      hanNopDon,
      dieuKienTomTat,
      soDu,
      trangThai
    } = req.body;

    // 1. Validate ID
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID quỹ không hợp lệ",
      });
    }

    // 2. Kiểm tra quỹ tồn tại
    const fund = await FundModel.getFundById(id);
    if (!fund) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy quỹ",
      });
    }
    const normalizedFundData = normalizeFundOperationData(req.body, fund);

    // 3. Validate tên và loại
    if (!tenQuy || !loaiQuy) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin: tên quỹ và loại quỹ",
      });
    }

    // 4. Validate loại quỹ
    const loaiQuyExists = await LoaiQuyModel.checkMaLoaiExists(loaiQuy);
    if (!loaiQuyExists) {
      return res.status(400).json({
        success: false,
        message: "Loại quỹ không hợp lệ hoặc không tồn tại trong hệ thống",
      });
    }

    // 5. Validate số dư
    if (soDu !== undefined && (isNaN(soDu) || soDu < 0)) {
      return res.status(400).json({
        success: false,
        message: "Số dư phải là số và lớn hơn hoặc bằng 0",
      });
    }

    const fundingPlanError = validateFundingPlan({
      soTienMucTieu,
      soTienHoTroToiDa,
      soLuongChiTieu,
    });
    if (fundingPlanError) {
      return res.status(400).json({
        success: false,
        message: fundingPlanError.message,
        field: fundingPlanError.field,
      });
    }

    const parentFundError = await validateParentFundForChild({
      loaiDieuHanh: normalizedFundData.loaiDieuHanh,
      quyChaId: normalizedFundData.quyChaId,
      childFundId: id,
      checkBalance: false,
    });
    if (parentFundError) {
      return res.status(400).json({
        success: false,
        message: parentFundError,
      });
    }

    // 6. Kiểm tra trùng tên với quỹ khác
    const nameExists = await FundModel.checkFundNameExistsForOther(tenQuy.trim(), id);
    if (nameExists) {
      return res.status(409).json({
        success: false,
        message: "Tên quỹ đã tồn tại ở quỹ khác",
      });
    }

    // 7. Cập nhật quỹ
    const fundData = {
      tenQuy: tenQuy.trim(),
      loaiQuy: loaiQuy,
      moTa: moTa ? moTa.trim() : null,
      hinhAnh: hinhAnh || null,
      soTienMucTieu: normalizedFundData.soTienMucTieu,
      soTienHoTroToiDa: normalizedFundData.soTienHoTroToiDa,
      soLuongChiTieu: normalizedFundData.soLuongChiTieu,
      hanNopDon: hanNopDon || null,
      dieuKienTomTat: dieuKienTomTat ? dieuKienTomTat.trim() : null,
      soDu: fund.so_du, // Luôn luôn giữ nguyên số dư hiện tại của quỹ khi cập nhật thông tin qua Form
      trangThai: trangThai || fund.trang_thai,
      loaiDieuHanh: normalizedFundData.loaiDieuHanh,
      quyChaId: normalizedFundData.quyChaId
    };

    await FundModel.updateFund(id, fundData);

    // Ghi nhật ký hệ thống
    await logSystemActivity(req, {
      hanhdong: "CAP_NHAT_QUY",
      loaidoituong: "quy",
      doituong_id: id,
      mota: `Cập nhật thông tin quỹ: ${fundData.tenQuy}`,
      dulieucu: fund,
      dulieumoi: fundData
    });

    // 8. Lấy thông tin sau khi cập nhật
    const updatedFund = await FundModel.getFundById(id);

    return res.status(200).json({
      success: true,
      message: "Cập nhật quỹ thành công",
      fund: {
        quyId: updatedFund.quy_id,
        tenQuy: updatedFund.ten_quy,
        loaiQuy: updatedFund.loai_quy,
        moTa: updatedFund.mo_ta,
        hinhAnh: buildFundImageUrl(updatedFund.hinh_path || updatedFund.hinh_anh),
        soTienMucTieu: updatedFund.so_tien_muc_tieu,
        soTienHoTroToiDa: updatedFund.so_tien_ho_tro_toi_da,
        soTienToiThieu: null,
        soTienToiDa: updatedFund.so_tien_ho_tro_toi_da,
        soLuongChiTieu: updatedFund.so_luong_chi_tieu,
        hanNopDon: updatedFund.han_nop_don,
        dieuKienTomTat: updatedFund.dieu_kien_tom_tat,
        soDu: updatedFund.so_du,
        nguoiTao: updatedFund.nguoitao_id,
        ngayTao: updatedFund.ngay_tao,
        ngayCapNhat: updatedFund.ngay_cap_nhat,
        trangThai: updatedFund.trang_thai,
        loaiDieuHanh: updatedFund.loai_dieu_hanh,
        quyChaId: updatedFund.quy_cha_id,
        tenQuyCha: updatedFund.ten_quy_cha
      }
    });
  } catch (error) {
    console.error("Lỗi updateFund:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

// ─── GET /api/funds/:id/bank-accounts ─────────────────────────────────────────
// API công khai - KHÔNG CẦN AUTHENTICATION (cho trang donation)
// LƯU Ý: Endpoint này đã DEPRECATED. Client nên dùng GET /api/bank-accounts/school thay thế
// để lấy danh sách tài khoản nhà trường (không còn liên kết với quỹ cụ thể)
export const getFundBankAccounts = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Validate ID
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID quỹ không hợp lệ",
      });
    }

    // 2. Kiểm tra quỹ có tồn tại không
    const fund = await FundModel.getFundById(id);
    if (!fund) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy quỹ",
      });
    }

    // 3. Lấy danh sách tài khoản nhà trường (thay vì tài khoản của quỹ)
    const schoolAccounts = await BankAccountModel.getSchoolBankAccounts();

    // 4. Trả về danh sách tài khoản nhà trường
    return res.status(200).json({
      success: true,
      message: "Lấy danh sách tài khoản ngân hàng thành công",
      fund: {
        quyId: fund.quy_id,
        tenQuy: fund.ten_quy,
      },
      bankAccounts: schoolAccounts.map(acc => ({
        taiKhoanNganHangId: acc.taikhoannganhang_id,
        soTaiKhoan: acc.sotaikhoan,
        nganHang: acc.nganhang,
        chiNhanh: acc.chinhanh,
        chuTaiKhoan: acc.chutaikhoan,
        trangThai: acc.trangthai,
      })),
      total: schoolAccounts.length,
      deprecationNotice: "Endpoint này sẽ bị loại bỏ trong phiên bản tương lai. Vui lòng dùng GET /api/bank-accounts/school"
    });
  } catch (error) {
    console.error("Lỗi getFundBankAccounts:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};
