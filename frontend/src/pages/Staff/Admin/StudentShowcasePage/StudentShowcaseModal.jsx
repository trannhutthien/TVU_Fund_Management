import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  HiOutlineXMark,
  HiOutlineUser,
} from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import Input from '@components/common/Input/Input';
import studentShowcaseService from '@services/studentShowcaseService';
import userService from '@services/userService';
import styles from './StudentShowcaseModal.module.scss';

const StudentShowcaseModal = ({ student, onClose, onSuccess }) => {
  const isEdit = !!student;
  
  const [formData, setFormData] = useState({
    nguoiDungId: '',
    namHoc: '',
    thanhTich: '',
    thuTu: 0,
    trangThai: 'Hien thi',
  });
  
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Tải danh sách tài khoản sinh viên
  useEffect(() => {
    const loadStudents = async () => {
      try {
        setLoadingStudents(true);
        const res = await userService.getAll({ tab: 'sinh_vien', page_size: 1000 });
        if (res?.success) {
          // Chỉ lấy sinh viên có trạng thái hoạt động để đưa vào danh sách nổi bật
          const activeStudents = (res.data || []).filter(s => s.trang_thai === 'HOAT_DONG');
          setStudents(activeStudents);
        }
      } catch (err) {
        console.error('Lỗi khi tải danh sách sinh viên:', err);
      } finally {
        setLoadingStudents(false);
      }
    };
    
    loadStudents();
  }, []);

  useEffect(() => {
    if (student) {
      setFormData({
        nguoiDungId: student.nguoiDungId || '',
        namHoc: student.namHoc || '',
        thanhTich: student.thanhTich || '',
        thuTu: student.thuTu || 0,
        trangThai: student.trangThai || 'Hien thi',
      });
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nguoiDungId) {
      alert('Vui lòng chọn một tài khoản sinh viên');
      return;
    }

    try {
      setSubmitting(true);
      
      const payload = {
        nguoiDungId: formData.nguoiDungId,
        namHoc: formData.namHoc,
        thanhTich: formData.thanhTich,
        thuTu: formData.thuTu,
        trangThai: formData.trangThai
      };

      if (isEdit) {
        await studentShowcaseService.updateStudentShowcase(student.id, payload);
        alert('Cập nhật thành công!');
      } else {
        await studentShowcaseService.createStudentShowcase(payload);
        alert('Thêm sinh viên thành công!');
      }
      
      onSuccess?.();
    } catch (error) {
      console.error('Lỗi lưu sinh viên nổi bật:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  // Xác định sinh viên được chọn để hiển thị xem trước
  const selectedStudent = isEdit
    ? {
        ho_ten: student.hoTen,
        ma_so_dinh_danh: student.maSoDinhDanh,
        khoa_phong: student.khoaPhong,
        avatar: student.hinhAnh
      }
    : students.find(s => String(s.user_id) === String(formData.nguoiDungId));

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
            
            {/* Chọn sinh viên */}
            <div className={styles.fullWidth}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Sinh viên nổi bật *</label>
                {isEdit ? (
                  <div className={styles.select} style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', cursor: 'not-allowed' }}>
                    {student.hoTen} ({student.maSoDinhDanh})
                  </div>
                ) : (
                  <select
                    name="nguoiDungId"
                    value={formData.nguoiDungId}
                    onChange={handleChange}
                    className={styles.select}
                    required
                    disabled={loadingStudents}
                  >
                    <option value="">-- Chọn sinh viên từ danh sách --</option>
                    {students.map(s => (
                      <option key={s.user_id} value={s.user_id}>
                        {s.ho_ten} ({s.ma_so_dinh_danh} - {s.khoa_phong || 'Chưa rõ khoa'})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Thông tin hồ sơ của sinh viên được chọn */}
              {selectedStudent && (
                <div className={styles.studentCard}>
                  <div className={styles.studentAvatarBox}>
                    {selectedStudent.avatar ? (
                      <img
                        src={selectedStudent.avatar}
                        alt={selectedStudent.ho_ten}
                        className={styles.studentAvatar}
                      />
                    ) : (
                      <HiOutlineUser size={30} style={{ color: '#cbd5e1' }} />
                    )}
                  </div>
                  <div className={styles.studentInfo}>
                    <div className={styles.studentName}>{selectedStudent.ho_ten}</div>
                    <div className={styles.studentMeta}>
                      <span><strong>MSSV:</strong> {selectedStudent.ma_so_dinh_danh}</span>
                      <span><strong>Khoa:</strong> {selectedStudent.khoa_phong || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Năm học */}
            <Input
              label="Năm học tiêu biểu"
              name="namHoc"
              value={formData.namHoc}
              onChange={handleChange}
              placeholder="Ví dụ: 2023-2024"
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
              <label className={styles.label}>Trạng thái hiển thị</label>
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

            {/* Thành tích */}
            <div className={styles.fullWidth}>
              <label className={styles.label}>Thành tích nổi bật *</label>
              <textarea
                name="thanhTich"
                value={formData.thanhTich}
                onChange={handleChange}
                placeholder="Ví dụ: Đạt giải Nhất nghiên cứu khoa học cấp Trường năm 2024, GPA đạt xuất sắc 3.8/4.0..."
                className={styles.textarea}
                rows={4}
                required
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
