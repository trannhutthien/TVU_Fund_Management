import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import axios from 'axios';
import {
  HiOutlineUser,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineIdentification,
  HiOutlineMapPin,
  HiOutlineAcademicCap,
  HiOutlineInformationCircle,
  HiOutlinePencilSquare,
  HiOutlineCheck,
  HiOutlineXMark,
  HiOutlineKey,
  HiOutlineCalendarDays,
  HiOutlineUserCircle,
  HiOutlineBuildingOffice,
} from 'react-icons/hi2';
import Input from '@components/common/Input';
import Button from '@components/common/Button';
import useAuthStore from '@stores/authStore';
import { userService } from '@services/userService';
import ChangePasswordModal from '../../shared/ChangePasswordModal';
import styles from './PersonalInfoSection.module.scss';

/**
 * Helper function: Format ISO date to yyyy-MM-dd for HTML5 date input
 */
const formatDateForInput = (isoDate) => {
  if (!isoDate) return '';
  // Extract only the date part (yyyy-MM-dd) from ISO string
  return isoDate.split('T')[0];
};

/**
 * PersonalInfoSection - Thông tin cá nhân có hỗ trợ chỉnh sửa
 */
const PersonalInfoSection = ({ user, onSave }) => {
  const { updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [faculties, setFaculties] = useState([]);
  const [loadingFaculties, setLoadingFaculties] = useState(false);

  const [formData, setFormData] = useState({
    hoTen: '',
    email: '',
    soDienThoai: '',
    diaChi: '',
    khoaPhong: '',
    lop: '',
    ngaySinh: '',
    gioiTinh: '',
    tinhTrangCongTac: '',
    donViCongTac: '',
  });

  const userType = user?.loai_tai_khoan || user?.loaiTaiKhoan || user?.loaitaikhoan;
  const isSinhVien = userType === 'SINH_VIEN' || userType === 'sinhvien';
  const isCanBo = userType === 'CAN_BO' || userType === 'canbo' || userType === 'Can bo';
  const isNhaKhoaHoc = userType === 'NHA_KHOA_HOC' || userType === 'nhakhoahoc' || userType === 'Nha khoa hoc';
  const hasWorkplaceInfo = isCanBo || isNhaKhoaHoc; // Cả Cán bộ và Nhà khoa học đều có đơn vị công tác

  // Load danh sách khoa/đơn vị từ API
  useEffect(() => {
    const fetchFaculties = async () => {
      if (!isSinhVien) return; // Chỉ load cho sinh viên

      try {
        setLoadingFaculties(true);
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
        console.log('🔍 Fetching faculties from:', `${apiUrl}/api/users/faculties`);
        
        const response = await axios.get(`${apiUrl}/api/users/faculties`);
        
        console.log('📡 Faculties API response:', response.data);
        
        if (response.data.success && Array.isArray(response.data.data)) {
          setFaculties(response.data.data);
          console.log(`✅ Loaded ${response.data.data.length} faculties`);
        } else {
          console.warn('⚠️ API response không đúng format:', response.data);
          toast.warn('Không thể tải danh sách khoa/đơn vị');
        }
      } catch (error) {
        console.error('❌ Lỗi khi tải danh sách khoa/đơn vị:', error);
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        toast.error('Không thể tải danh sách khoa/đơn vị');
      } finally {
        setLoadingFaculties(false);
      }
    };

    fetchFaculties();
  }, [isSinhVien]);

  // Đồng bộ thông tin từ user prop
  useEffect(() => {
    if (user) {
      setFormData({
        hoTen: user.ho_ten || user.hoTen || '',
        email: user.email || '',
        soDienThoai: user.so_dien_thoai || user.soDienThoai || '',
        diaChi: user.dia_chi || user.diaChi || '',
        khoaPhong: user.khoa_phong || user.khoaPhong || '',
        lop: user.lop || '',
        ngaySinh: formatDateForInput(user.ngaysinh || user.ngaySinh || ''),
        gioiTinh: user.gioitinh || user.gioiTinh || '',
        tinhTrangCongTac: user.tinhtrangcongtac || user.tinhTrangCongTac || '',
        donViCongTac: user.donvicongtac || user.donViCongTac || '',
      });
    }
  }, [user, isEditing]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveClick = async () => {
    if (!formData.hoTen.trim()) {
      toast.error('Họ và tên không được để trống');
      return;
    }

    if (!formData.email.trim()) {
      toast.error('Email không được để trống');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast.error('Email không đúng định dạng');
      return;
    }

    setLoading(false);

    try {
      setLoading(true);
      const userId = user?.userId || user?.user_id || user?.id;

      const payload = {
        ho_ten: formData.hoTen.trim(),
        email: formData.email.trim(),
        so_dien_thoai: formData.soDienThoai.trim() || null,
        dia_chi: formData.diaChi.trim() || null,
        khoa_phong: isSinhVien ? formData.khoaPhong.trim() || null : null,
        lop: isSinhVien ? formData.lop.trim() || null : null,
        ngaysinh: formData.ngaySinh || null,
        gioitinh: formData.gioiTinh || null,
        tinhtrangcongtac: hasWorkplaceInfo ? formData.tinhTrangCongTac.trim() || null : null,
        donvicongtac: hasWorkplaceInfo ? formData.donViCongTac.trim() || null : null,
      };

      const response = await userService.update(userId, payload);

      if (response.success) {
        toast.success('Cập nhật thông tin thành công!');
        
        // Map dữ liệu từ backend trả về để cập nhật store (camelCase)
        const updatedUser = {
          ...user,
          hoTen: response.data.ho_ten,
          email: response.data.email,
          soDienThoai: response.data.so_dien_thoai,
          diaChi: response.data.dia_chi,
          khoaPhong: response.data.khoa_phong,
          lop: response.data.lop,
          avatar: response.data.avatar,
        };
        
        updateUser(updatedUser);
        
        if (onSave) {
          onSave(updatedUser);
        }
        
        setIsEditing(false);
      } else {
        toast.error(response.message || 'Cập nhật thông tin thất bại');
      }
    } catch (error) {
      console.error('Cập nhật thông tin lỗi:', error);
      const msg = error.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader} style={{ justifyContent: 'space-between', borderBottom: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <HiOutlineUser className={styles.headerIcon} />
          <h2 className={styles.headerTitle}>Thông tin cá nhân</h2>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {!isEditing && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsChangePasswordModalOpen(true)}
              leftIcon={<HiOutlineKey size={16} />}
            >
              {user?.hasPassword ? 'Đổi mật khẩu' : 'Thiết lập mật khẩu'}
            </Button>
          )}
          {!isEditing ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleEditClick}
              leftIcon={<HiOutlinePencilSquare size={16} />}
            >
              Chỉnh sửa
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelClick}
                disabled={loading}
                leftIcon={<HiOutlineXMark size={16} />}
              >
                Hủy
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveClick}
                loading={loading}
                leftIcon={<HiOutlineCheck size={16} />}
              >
                Lưu
              </Button>
            </>
          )}
        </div>
      </div>

      <div className={styles.formGrid}>
        <Input
          label="Họ và tên"
          type="text"
          value={isEditing ? formData.hoTen : (user?.hoTen || user?.ho_ten || '')}
          onChange={(e) => handleInputChange('hoTen', e.target.value)}
          leftIcon={<HiOutlineUser size={18} />}
          disabled={!isEditing || loading}
        />

        <Input
          label="Email"
          type="email"
          value={isEditing ? formData.email : (user?.email || '')}
          onChange={(e) => handleInputChange('email', e.target.value)}
          leftIcon={<HiOutlineEnvelope size={18} />}
          disabled={!isEditing || loading}
        />

        <Input
          label="Số điện thoại"
          type="tel"
          value={isEditing ? formData.soDienThoai : (user?.soDienThoai || user?.so_dien_thoai || '—')}
          onChange={(e) => handleInputChange('soDienThoai', e.target.value)}
          leftIcon={<HiOutlinePhone size={18} />}
          disabled={!isEditing || loading}
        />

        {isSinhVien && (
          <Input
            label="MSSV"
            type="text"
            value={user?.maSoDinhDanh || user?.ma_so_dinh_danh || ''}
            leftIcon={<HiOutlineIdentification size={18} />}
            disabled
          />
        )}

        <div className={styles.fullWidth}>
          <Input
            label="Địa chỉ liên hệ"
            type="text"
            value={isEditing ? formData.diaChi : (user?.diaChi || user?.dia_chi || '—')}
            onChange={(e) => handleInputChange('diaChi', e.target.value)}
            leftIcon={<HiOutlineMapPin size={18} />}
            disabled={!isEditing || loading}
          />
        </div>

        {isSinhVien && (
          <div className={styles.fullWidth}>
            <label className={styles.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <HiOutlineAcademicCap size={18} />
              Khoa/Đơn vị
            </label>
            {isEditing ? (
              <select
                value={formData.khoaPhong}
                onChange={(e) => handleInputChange('khoaPhong', e.target.value)}
                disabled={loading || loadingFaculties}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: '#fff',
                  color: '#111827',
                  outline: 'none',
                }}
              >
                <option value="">-- Chọn khoa/đơn vị --</option>
                {loadingFaculties ? (
                  <option disabled>Đang tải...</option>
                ) : faculties.length > 0 ? (
                  faculties.map((faculty, index) => (
                    <option key={index} value={faculty}>
                      {faculty}
                    </option>
                  ))
                ) : (
                  <option disabled>Không có khoa/đơn vị khả dụng</option>
                )}
              </select>
            ) : (
              <div style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: '#f9fafb',
                color: '#111827',
              }}>
                {user?.khoaPhong || user?.khoa_phong || '—'}
              </div>
            )}
          </div>
        )}

        {isSinhVien && (
          <div className={styles.fullWidth}>
            <Input
              label="Lớp"
              type="text"
              value={isEditing ? formData.lop : (user?.lop || '—')}
              onChange={(e) => handleInputChange('lop', e.target.value)}
              leftIcon={<HiOutlineAcademicCap size={18} />}
              disabled={!isEditing || loading}
            />
          </div>
        )}

        <div className={styles.field}>
          <label className={styles.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <HiOutlineCalendarDays size={18} />
            Ngày sinh
          </label>
          <input
            type="date"
            value={isEditing ? formData.ngaySinh : formatDateForInput(user?.ngaysinh || user?.ngaySinh || '')}
            onChange={(e) => setFormData({ ...formData, ngaySinh: e.target.value })}
            disabled={!isEditing || loading}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: isEditing ? '#fff' : '#f9fafb',
              color: '#111827',
              outline: 'none',
            }}
          />
        </div>

        <div>
          <label className={styles.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <HiOutlineUserCircle size={18} />
            Giới tính
          </label>
          <select
            value={isEditing ? formData.gioiTinh : (user?.gioiTinh || user?.gioitinh || '')}
            onChange={(e) => setFormData({ ...formData, gioiTinh: e.target.value })}
            disabled={!isEditing || loading}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: isEditing ? '#fff' : '#f9fafb',
              color: '#111827',
              outline: 'none',
            }}
          >
            <option value="">-- Chọn --</option>
            <option value="Nam">Nam</option>
            <option value="Nu">Nữ</option>
            <option value="Khac">Khác</option>
          </select>
        </div>

        {hasWorkplaceInfo && (
          <Input
            label="Đơn vị công tác"
            type="text"
            value={isEditing ? formData.donViCongTac : (user?.donViCongTac || user?.donvicongtac || '—')}
            onChange={(e) => setFormData({ ...formData, donViCongTac: e.target.value })}
            leftIcon={<HiOutlineBuildingOffice size={18} />}
            disabled={!isEditing || loading}
          />
        )}

        {hasWorkplaceInfo && (
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>
              <HiOutlineInformationCircle size={18} />
              Tình trạng công tác
            </label>
            {isEditing ? (
              <select
                className={styles.selectInput}
                value={formData.tinhTrangCongTac}
                onChange={(e) => setFormData({ ...formData, tinhTrangCongTac: e.target.value })}
                disabled={loading}
              >
                <option value="">-- Chọn tình trạng --</option>
                <option value="Dang cong tac">Đang công tác</option>
                <option value="Da nghi huu">Đã nghỉ hưu</option>
              </select>
            ) : (
              <div className={styles.inputValue}>
                {user?.tinhTrangCongTac === 'Dang cong tac' || user?.tinhtrangcongtac === 'Dang cong tac' 
                  ? 'Đang công tác' 
                  : user?.tinhTrangCongTac === 'Da nghi huu' || user?.tinhtrangcongtac === 'Da nghi huu'
                  ? 'Đã nghỉ hưu'
                  : '—'}
              </div>
            )}
          </div>
        )}
      </div>

      {!isEditing && (
        <div className={styles.note}>
          <HiOutlineInformationCircle className={styles.noteIcon} />
          <span>Thông tin được bảo mật và dùng cho việc xét duyệt hỗ trợ/quyên góp. Nhấn nút "Chỉnh sửa" để thay đổi thông tin.</span>
        </div>
      )}

      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        user={user}
      />
    </div>
  );
};

PersonalInfoSection.propTypes = {
  user: PropTypes.object,
  onSave: PropTypes.func,
};

export default PersonalInfoSection;
