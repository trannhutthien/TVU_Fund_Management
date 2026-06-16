import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  HiOutlineXMark,
  HiOutlinePhoto,
  HiOutlineArrowUpTray,
  HiOutlineTrash,
} from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import Input from '@components/common/Input/Input';
import studentShowcaseService from '@services/studentShowcaseService';
import { uploadService } from '@services/uploadService';
import styles from './StudentShowcaseModal.module.scss';

const API_BASE = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'
).replace(/\/api\/?$/, '');

const buildImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_BASE}/${path.replace(/^\//, '')}`;
};

const StudentShowcaseModal = ({ student, onClose, onSuccess }) => {
  const isEdit = !!student;
  
  const [formData, setFormData] = useState({
    hoTen: '',
    khoaPhong: '',
    namHoc: '',
    hinhAnh: '',
    thanhTich: '',
    thuTu: 0,
    trangThai: 'Hien thi',
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (student) {
      setFormData({
        hoTen: student.hoTen || '',
        khoaPhong: student.khoaPhong || '',
        namHoc: student.namHoc || '',
        hinhAnh: student.hinhAnh || '',
        thanhTich: student.thanhTich || '',
        thuTu: student.thuTu || 0,
        trangThai: student.trangThai || 'Hien thi',
      });
      setImagePreview(student.hinhAnh || '');
    }
  }, [student]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      alert('Chỉ chấp nhận file ảnh định dạng JPG, JPEG hoặc PNG');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước ảnh tối đa là 5MB');
      return;
    }

    try {
      setUploading(true);
      const res = await uploadService.uploadStudentImage(file);
      if (res?.success && res?.data?.filePath) {
        setFormData(prev => ({ ...prev, hinhAnh: res.data.filePath }));
        setImagePreview(res.data.filePath);
      } else {
        alert('Không thể tải ảnh lên máy chủ');
      }
    } catch (err) {
      console.error('Lỗi upload ảnh sinh viên nổi bật:', err);
      alert('Lỗi hệ thống khi tải ảnh lên');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, hinhAnh: '' }));
    setImagePreview('');
  };

  const previewUrl = imagePreview ? buildImageUrl(imagePreview) : '';

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    if (!formData.hoTen.trim()) {
      alert('Vui lòng nhập họ tên sinh viên');
      return;
    }

    try {
      setSubmitting(true);
      
      if (isEdit) {
        await studentShowcaseService.updateStudentShowcase(student.id, formData);
        alert('Cập nhật thành công!');
      } else {
        await studentShowcaseService.createStudentShowcase(formData);
        alert('Thêm sinh viên thành công!');
      }
      
      onSuccess?.();
    } catch (error) {
      console.error('Error saving student:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {isEdit ? 'Cập nhật sinh viên' : 'Thêm sinh viên nổi bật'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<HiOutlineXMark />}
            onClick={onClose}
          >
            Đóng
          </Button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            {/* Họ tên */}
            <div className={styles.fullWidth}>
              <Input
                label="Họ và tên *"
                name="hoTen"
                value={formData.hoTen}
                onChange={handleChange}
                placeholder="Nguyễn Văn A"
                required
              />
            </div>

            {/* Khoa/Ngành */}
            <Input
              label="Khoa/Ngành"
              name="khoaPhong"
              value={formData.khoaPhong}
              onChange={handleChange}
              placeholder="Công nghệ Thông tin"
            />

            {/* Năm học */}
            <Input
              label="Năm học"
              name="namHoc"
              value={formData.namHoc}
              onChange={handleChange}
              placeholder="2023-2024"
            />

            {/* Thứ tự */}
            <Input
              label="Thứ tự hiển thị"
              name="thuTu"
              type="number"
              value={formData.thuTu}
              onChange={handleChange}
              placeholder="0"
            />

            {/* Trạng thái */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Trạng thái</label>
              <select
                name="trangThai"
                value={formData.trangThai}
                onChange={handleChange}
                className={styles.select}
              >
                <option value="Hien thi">Hiển thị</option>
                <option value="An">Ẩn</option>
              </select>
            </div>

            {/* Hình ảnh */}
            <div className={styles.fullWidth}>
              <label className={styles.label}>Hình ảnh sinh viên</label>
              
              <div className={styles.imageUploadWrapper}>
                <div className={styles.imagePreviewBox}>
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Xem trước"
                      className={styles.previewImg}
                    />
                  ) : (
                    <div className={styles.previewPlaceholder}>
                      <HiOutlinePhoto className={styles.placeholderIcon} size={28} />
                      <span>Chưa có ảnh</span>
                    </div>
                  )}
                </div>

                <div className={styles.uploadActions}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<HiOutlineArrowUpTray />}
                    onClick={() => fileInputRef.current?.click()}
                    loading={uploading}
                    type="button"
                  >
                    {previewUrl ? 'Đổi ảnh khác' : 'Tải ảnh lên'}
                  </Button>
                  {previewUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<HiOutlineTrash />}
                      onClick={handleRemoveImage}
                      type="button"
                    >
                      Xóa ảnh
                    </Button>
                  )}
                </div>
              </div>
              
              <p className={styles.hint}>
                Chấp nhận file JPG, JPEG, PNG dung lượng dưới 5MB. Ảnh lưu tại backend/uploads/avatars/students/
              </p>
            </div>

            {/* Thành tích */}
            <div className={styles.fullWidth}>
              <label className={styles.label}>Thành tích</label>
              <textarea
                name="thanhTich"
                value={formData.thanhTich}
                onChange={handleChange}
                placeholder="Mô tả thành tích nổi bật của sinh viên..."
                className={styles.textarea}
                rows={4}
              />
            </div>
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={submitting}
              loading={submitting}
            >
              {isEdit ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

StudentShowcaseModal.propTypes = {
  student: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

export default StudentShowcaseModal;
