import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  HiOutlineInformationCircle,
  HiOutlineDocumentText,
  HiOutlinePaperClip,
  HiOutlineWrench,
  HiOutlineChartBarSquare,
  HiOutlineBuildingLibrary,
  HiOutlineGlobeAlt,
} from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import Input from '@components/common/Input/Input';
import api from '@services/api';
import styles from './CaiDatSection.module.scss';

const FILE_FORMATS = ['PDF', 'JPG', 'PNG', 'DOC'];

const CaiDatSection = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({
    tongNguoiDung: 0,
    tongNguoiDungHoatDong: 0,
    version: 'v1.0.0',
    lastUpdate: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN'),
  });

  // Settings State
  const [tenHeThong, setTenHeThong] = useState('TVU Fund Management');
  const [emailLienHe, setEmailLienHe] = useState('contact@tvu.edu.vn');
  const [soDienThoai, setSoDienThoai] = useState('0294.3855246');
  const [publicInfo, setPublicInfo] = useState({
    don_vi_quan_ly: '',
    email_ho_tro: '',
    dia_chi_lien_he: '',
    gio_lam_viec: '',
    facebook_url: '',
    youtube_url: '',
    linkedin_url: '',
  });
  const [sponsorBank, setSponsorBank] = useState({
    ngan_hang: '',
    chi_nhanh: '',
    so_tai_khoan: '',
    chu_tai_khoan: '',
  });
  
  const [thoiHanXuLyNgay, setThoiHanXuLyNgay] = useState(5);
  const [soCapDuyet, setSoCapDuyet] = useState(2);
  const [kyTuLyDoToiThieu, setKyTuLyDoToiThieu] = useState(10);
  
  const [kichThuocToiDaMb, setKichThuocToiDaMb] = useState(5);
  const [soFileToiDa, setSoFileToiDa] = useState(5);
  const [dinhDangChoPhep, setDinhDangChoPhep] = useState(['PDF', 'JPG', 'PNG', 'DOC']);
  
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Fetch settings & stats on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch Settings
        const settingsRes = await api.get('/system/settings');
        if (settingsRes.data?.success) {
          const cfg = settingsRes.data.settings;
          setTenHeThong(cfg.ten_he_thong || 'TVU Fund Management');
          setEmailLienHe(cfg.email_lien_he || '');
          setSoDienThoai(cfg.so_dien_thoai || '');
          setPublicInfo({
            don_vi_quan_ly: cfg.don_vi_quan_ly || '',
            email_ho_tro: cfg.email_ho_tro || '',
            dia_chi_lien_he: cfg.dia_chi_lien_he || '',
            gio_lam_viec: cfg.gio_lam_viec || '',
            facebook_url: cfg.facebook_url || '',
            youtube_url: cfg.youtube_url || '',
            linkedin_url: cfg.linkedin_url || '',
          });
          setSponsorBank({
            ngan_hang: cfg.tai_khoan_nhan_tai_tro?.ngan_hang || '',
            chi_nhanh: cfg.tai_khoan_nhan_tai_tro?.chi_nhanh || '',
            so_tai_khoan: cfg.tai_khoan_nhan_tai_tro?.so_tai_khoan || '',
            chu_tai_khoan: cfg.tai_khoan_nhan_tai_tro?.chu_tai_khoan || '',
          });
          setThoiHanXuLyNgay(cfg.thoi_han_xu_ly_ngay || 5);
          setSoCapDuyet(cfg.so_cap_duyet || 2);
          setKyTuLyDoToiThieu(cfg.ky_tu_ly_do_toi_thieu || 10);
          setKichThuocToiDaMb(cfg.kich_thuoc_toi_da_mb || 5);
          setSoFileToiDa(cfg.so_file_toi_da || 5);
          setDinhDangChoPhep(cfg.dinh_dang_cho_phep || ['PDF', 'JPG', 'PNG', 'DOC']);
          setMaintenanceMode(cfg.maintenanceMode || false);
        }

        // Fetch User Statistics
        const statsRes = await api.get('/users/stats');
        if (statsRes.data?.success) {
          setStats((prev) => ({
            ...prev,
            tongNguoiDung: statsRes.data.data.tongNguoiDung,
            tongNguoiDungHoatDong: statsRes.data.data.tongNguoiDungHoatDong,
          }));
        }
      } catch (error) {
        console.error('Error fetching system configs:', error);
        toast.error('Lỗi tải cấu hình hệ thống');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Save specific settings category
  const handleSaveSettings = async (updates) => {
    setSaving(true);
    try {
      const response = await api.patch('/system/settings', updates);
      if (response.data?.success) {
        toast.success('Cập nhật cấu hình thành công!');
        setStats((prev) => ({
          ...prev,
          lastUpdate: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN'),
        }));
      } else {
        toast.error(response.data?.message || 'Không thể lưu cấu hình');
      }
    } catch (error) {
      console.error('Error saving configs:', error);
      toast.error('Lỗi khi lưu cấu hình');
    } finally {
      setSaving(false);
    }
  };

  // Toggle Maintenance Mode
  const handleToggleMaintenance = async () => {
    const targetState = !maintenanceMode;
    
    if (targetState) {
      const confirm = window.confirm('⚠️ Bạn chắc chắn muốn bật chế độ bảo trì? Toàn bộ người dùng thường sẽ không thể truy cập hệ thống.');
      if (!confirm) return;
    }

    setMaintenanceMode(targetState);
    await handleSaveSettings({ maintenanceMode: targetState });
  };

  // Handle format checkbox change
  const handleFormatChange = (format) => {
    let newFormats = [...dinhDangChoPhep];
    if (newFormats.includes(format)) {
      newFormats = newFormats.filter((f) => f !== format);
    } else {
      newFormats.push(format);
    }
    setDinhDangChoPhep(newFormats);
  };

  const updatePublicInfo = (field, value) => {
    setPublicInfo((prev) => ({ ...prev, [field]: value }));
  };

  const updateSponsorBank = (field, value) => {
    setSponsorBank((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner}></div>
        <p>Đang tải cấu hình hệ thống...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Cài đặt hệ thống</h2>
          <p className={styles.sectionSub}>
            Cấu hình các quy định chung của hệ thống, quy định duyệt đơn, tài liệu đính kèm và chế độ hoạt động
          </p>
        </div>
      </header>

      <div className={styles.layoutGrid}>
        {/* Left Column (60%) */}
        <div className={styles.leftCol}>
          {/* Card 1: System info */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <HiOutlineInformationCircle className={styles.cardIcon} />
              <h3 className={styles.cardTitle}>Thông tin chung</h3>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.formGrid}>
                <Input
                  label="Tên hệ thống"
                  value={tenHeThong}
                  onChange={(e) => setTenHeThong(e.target.value)}
                  disabled={saving}
                />
                <Input
                  label="Email liên hệ hệ thống"
                  value={emailLienHe}
                  onChange={(e) => setEmailLienHe(e.target.value)}
                  disabled={saving}
                />
                <Input
                  label="Hotline hỗ trợ"
                  value={soDienThoai}
                  onChange={(e) => setSoDienThoai(e.target.value)}
                  disabled={saving}
                />
              </div>
              <div className={styles.formActions}>
                <Button
                  variant="primary"
                  size="small"
                  disabled={saving}
                  onClick={() =>
                    handleSaveSettings({
                      ten_he_thong: tenHeThong,
                      email_lien_he: emailLienHe,
                      so_dien_thoai: soDienThoai,
                    })
                  }
                >
                  Lưu thay đổi
                </Button>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <HiOutlineGlobeAlt className={styles.cardIcon} />
              <h3 className={styles.cardTitle}>Thông tin hiển thị công khai</h3>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.formGrid}>
                <Input
                  label="Đơn vị quản lý"
                  value={publicInfo.don_vi_quan_ly}
                  onChange={(e) => updatePublicInfo('don_vi_quan_ly', e.target.value)}
                  disabled={saving}
                />
                <Input
                  label="Email hỗ trợ"
                  type="email"
                  value={publicInfo.email_ho_tro}
                  onChange={(e) => updatePublicInfo('email_ho_tro', e.target.value)}
                  disabled={saving}
                />
                <Input
                  label="Giờ làm việc"
                  value={publicInfo.gio_lam_viec}
                  onChange={(e) => updatePublicInfo('gio_lam_viec', e.target.value)}
                  disabled={saving}
                />
                <div className={styles.formGroup}>
                  <label className={styles.tagLabel}>Địa chỉ liên hệ / tiếp nhận tài trợ</label>
                  <textarea
                    className={styles.textarea}
                    value={publicInfo.dia_chi_lien_he}
                    onChange={(e) => updatePublicInfo('dia_chi_lien_he', e.target.value)}
                    rows={3}
                    disabled={saving}
                  />
                </div>
                <Input
                  label="Facebook URL"
                  type="url"
                  value={publicInfo.facebook_url}
                  onChange={(e) => updatePublicInfo('facebook_url', e.target.value)}
                  disabled={saving}
                />
                <Input
                  label="YouTube URL"
                  type="url"
                  value={publicInfo.youtube_url}
                  onChange={(e) => updatePublicInfo('youtube_url', e.target.value)}
                  disabled={saving}
                />
                <Input
                  label="LinkedIn URL"
                  type="url"
                  value={publicInfo.linkedin_url}
                  onChange={(e) => updatePublicInfo('linkedin_url', e.target.value)}
                  disabled={saving}
                />
              </div>
              <p className={styles.helperNote}>
                Các thông tin này được dùng cho footer, header và hướng dẫn liên hệ công khai.
              </p>
              <div className={styles.formActions}>
                <Button
                  variant="primary"
                  size="small"
                  disabled={saving}
                  onClick={() =>
                    handleSaveSettings({
                      ...publicInfo,
                    })
                  }
                >
                  LÆ°u thay Ä‘á»•i
                </Button>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <HiOutlineBuildingLibrary className={styles.cardIcon} />
              <h3 className={styles.cardTitle}>Tài khoản nhận tài trợ mặc định</h3>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.formGrid}>
                <Input
                  label="Ngân hàng"
                  value={sponsorBank.ngan_hang}
                  onChange={(e) => updateSponsorBank('ngan_hang', e.target.value)}
                  disabled={saving}
                />
                <Input
                  label="Chi nhánh"
                  value={sponsorBank.chi_nhanh}
                  onChange={(e) => updateSponsorBank('chi_nhanh', e.target.value)}
                  disabled={saving}
                />
                <Input
                  label="Số tài khoản"
                  value={sponsorBank.so_tai_khoan}
                  onChange={(e) => updateSponsorBank('so_tai_khoan', e.target.value)}
                  disabled={saving}
                />
                <Input
                  label="Chủ tài khoản"
                  value={sponsorBank.chu_tai_khoan}
                  onChange={(e) => updateSponsorBank('chu_tai_khoan', e.target.value)}
                  disabled={saving}
                />
              </div>
              <p className={styles.helperNote}>
                Nếu quỹ chưa có tài khoản riêng, trang tài trợ sẽ hiện tài khoản mặc định này.
              </p>
              <div className={styles.formActions}>
                <Button
                  variant="primary"
                  size="small"
                  disabled={saving}
                  onClick={() =>
                    handleSaveSettings({
                      tai_khoan_nhan_tai_tro: sponsorBank,
                    })
                  }
                >
                  LÆ°u thay Ä‘á»•i
                </Button>
              </div>
            </div>
          </div>

          {/* Card 2: Request settings */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <HiOutlineDocumentText className={styles.cardIcon} />
              <h3 className={styles.cardTitle}>Quy định xét duyệt</h3>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.formGrid}>
                <Input
                  label="Thời hạn xử lý (ngày làm việc)"
                  type="number"
                  value={thoiHanXuLyNgay}
                  onChange={(e) => setThoiHanXuLyNgay(parseInt(e.target.value) || 0)}
                  disabled={saving}
                />
                <Input
                  label="Số cấp phê duyệt"
                  type="number"
                  min={1}
                  max={5}
                  value={soCapDuyet}
                  onChange={(e) => setSoCapDuyet(parseInt(e.target.value) || 1)}
                  disabled={saving}
                />
                <Input
                  label="Ký tự tối thiểu lý do từ chối"
                  type="number"
                  value={kyTuLyDoToiThieu}
                  onChange={(e) => setKyTuLyDoToiThieu(parseInt(e.target.value) || 0)}
                  disabled={saving}
                />
              </div>
              <div className={styles.formActions}>
                <Button
                  variant="primary"
                  size="small"
                  disabled={saving}
                  onClick={() =>
                    handleSaveSettings({
                      thoi_han_xu_ly_ngay: thoiHanXuLyNgay,
                      so_cap_duyet: soCapDuyet,
                      ky_tu_ly_do_toi_thieu: kyTuLyDoToiThieu,
                    })
                  }
                >
                  Lưu thay đổi
                </Button>
              </div>
            </div>
          </div>

          {/* Card 3: File rules */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <HiOutlinePaperClip className={styles.cardIcon} />
              <h3 className={styles.cardTitle}>Quy định file đính kèm</h3>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.formGrid}>
                <Input
                  label="Dung lượng tối đa (MB)"
                  type="number"
                  value={kichThuocToiDaMb}
                  onChange={(e) => setKichThuocToiDaMb(parseInt(e.target.value) || 0)}
                  disabled={saving}
                />
                <Input
                  label="Số file tối đa mỗi hồ sơ"
                  type="number"
                  value={soFileToiDa}
                  onChange={(e) => setSoFileToiDa(parseInt(e.target.value) || 0)}
                  disabled={saving}
                />
                
                <div className={styles.formGroup}>
                  <label className={styles.tagLabel}>Định dạng cho phép</label>
                  <div className={styles.tagGroup}>
                    {FILE_FORMATS.map((fmt) => {
                      const isChecked = dinhDangChoPhep.includes(fmt);
                      return (
                        <button
                          key={fmt}
                          type="button"
                          className={`${styles.tagBtn} ${isChecked ? styles.tagChecked : ''}`}
                          onClick={() => handleFormatChange(fmt)}
                          disabled={saving}
                        >
                          {fmt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className={styles.formActions}>
                <Button
                  variant="primary"
                  size="small"
                  disabled={saving}
                  onClick={() =>
                    handleSaveSettings({
                      kich_thuoc_toi_da_mb: kichThuocToiDaMb,
                      so_file_toi_da: soFileToiDa,
                      dinh_dang_cho_phep: dinhDangChoPhep,
                    })
                  }
                >
                  Lưu thay đổi
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (40%) */}
        <div className={styles.rightCol}>
          {/* Card 4: Maintenance Mode */}
          <div className={styles.maintenanceCard}>
            <div className={styles.maintenanceHeader}>
              <HiOutlineWrench className={styles.wrenchIcon} />
              <h3 className={styles.maintenanceTitle}>Chế độ bảo trì</h3>
            </div>
            <p className={styles.maintenanceDesc}>
              Khi bật, chỉ Admin đăng nhập được. Người dùng và các vai trò khác sẽ nhận được thông báo bảo trì hệ thống.
            </p>

            {/* Custom Toggle Switch */}
            <div className={styles.toggleContainer}>
              <button
                type="button"
                className={`${styles.toggleTrack} ${maintenanceMode ? styles.toggleOn : ''}`}
                onClick={handleToggleMaintenance}
                disabled={saving}
              >
                <div className={styles.toggleThumb}></div>
              </button>
              <span className={maintenanceMode ? styles.labelMaintenance : styles.labelNormal}>
                {maintenanceMode ? 'Đang bảo trì' : 'Đang hoạt động bình thường'}
              </span>
            </div>

            {/* Warning Banner */}
            {maintenanceMode && (
              <div className={styles.warningBanner}>
                <span>⚠️ Toàn bộ người dùng sẽ không thể truy cập hệ thống!</span>
              </div>
            )}
          </div>

          {/* Card 5: Statistics */}
          <div className={styles.statsCard}>
            <div className={styles.cardHeader}>
              <HiOutlineChartBarSquare className={styles.statsIcon} />
              <h3 className={styles.cardTitle}>Thống kê hiện tại</h3>
            </div>
            
            <div className={styles.statsContainer}>
              <div className={styles.statRow}>
                <span className={styles.statLabel}>Tổng người dùng</span>
                <span className={styles.statValue}>{stats.tongNguoiDung}</span>
              </div>
              <div className={styles.statRow}>
                <span className={styles.statLabel}>Đang hoạt động hôm nay</span>
                <span className={styles.statValue}>{stats.tongNguoiDungHoatDong}</span>
              </div>
              <div className={styles.statRow}>
                <span className={styles.statLabel}>Phiên bản</span>
                <span className={styles.statValue}>{stats.version}</span>
              </div>
              <div className={styles.statRow}>
                <span className={styles.statLabel}>Lần cập nhật cuối</span>
                <span className={styles.statValue}>{stats.lastUpdate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaiDatSection;
