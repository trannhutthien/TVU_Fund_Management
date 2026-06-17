import api from './api';

export const DEFAULT_PUBLIC_SETTINGS = {
  ten_he_thong: 'TVU Fund Management',
  don_vi_quan_ly: 'Phòng Công tác Sinh viên - Trường Đại học Trà Vinh',
  email_lien_he: 'TVU@tvu.edu.vn',
  email_ho_tro: 'phongctsv@tvu.edu.vn',
  so_dien_thoai: '0294.3855246',
  dia_chi_lien_he: '126 Nguyễn Thiện Thành, Khóm 4, Phường 5, TP. Trà Vinh',
  gio_lam_viec: 'Thứ 2 - Thứ 6: 7:30 - 17:00',
  facebook_url: 'https://www.facebook.com/dhtravinh',
  youtube_url: 'https://www.youtube.com/@dhtravinh',
  linkedin_url: 'https://www.linkedin.com/school/tra-vinh-university',
  tai_khoan_nhan_tai_tro: {
    ngan_hang: 'VIETCOMBANK',
    chi_nhanh: '',
    so_tai_khoan: '1018899889',
    chu_tai_khoan: 'TRUONG DAI HOC TRA VINH',
  },
};

export const normalizePublicSettings = (settings = {}) => ({
  ...DEFAULT_PUBLIC_SETTINGS,
  ...settings,
  tai_khoan_nhan_tai_tro: {
    ...DEFAULT_PUBLIC_SETTINGS.tai_khoan_nhan_tai_tro,
    ...(settings?.tai_khoan_nhan_tai_tro || {}),
  },
});

export const toFundBankAccount = (bank = {}) => ({
  nganHang: bank.ngan_hang || bank.nganHang || '',
  chiNhanh: bank.chi_nhanh || bank.chiNhanh || '',
  soTaiKhoan: bank.so_tai_khoan || bank.soTaiKhoan || '',
  chuTaiKhoan: bank.chu_tai_khoan || bank.chuTaiKhoan || '',
});

export const systemSettingsService = {
  async getPublicSettings() {
    const response = await api.get('/system/settings/public');
    return normalizePublicSettings(response.data?.settings || {});
  },
};

export default systemSettingsService;
