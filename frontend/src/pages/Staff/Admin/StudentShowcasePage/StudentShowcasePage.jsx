import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineAcademicCap,
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineEyeSlash,
} from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import StatusBadge from '@components/common/StatusBadge/StatusBadge';
import studentShowcaseService from '@services/studentShowcaseService';
import StudentShowcaseModal from './StudentShowcaseModal';
import styles from './StudentShowcasePage.module.scss';

const StudentShowcasePage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  // Fetch danh sách sinh viên
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await studentShowcaseService.getAllStudentShowcase();
      if (response.success) {
        setStudents(response.students);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      alert('Có lỗi khi tải danh sách sinh viên');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Handlers
  const handleCreate = () => {
    setEditingStudent(null);
    setIsModalOpen(true);
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  const handleDelete = async (id, hoTen) => {
    if (!window.confirm(`Bạn có chắc muốn xóa sinh viên "${hoTen}"?`)) {
      return;
    }

    try {
      await studentShowcaseService.deleteStudentShowcase(id);
      alert('Xóa thành công!');
      fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('Có lỗi khi xóa sinh viên');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Hien thi' ? 'An' : 'Hien thi';
    
    try {
      await studentShowcaseService.updateStudentShowcaseStatus(id, newStatus);
      fetchStudents();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Có lỗi khi cập nhật trạng thái');
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
  };

  const handleModalSuccess = () => {
    fetchStudents();
    handleModalClose();
  };

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <Link to="/" className={styles.crumbLink}>
            Trang chủ
          </Link>
          <span className={styles.crumbSep}>/</span>
          <span>Sinh viên nổi bật</span>
        </div>

        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerText}>
            <h1 className={styles.title}>Quản lý Sinh viên nổi bật</h1>
            <p className={styles.subtitle}>
              Quản lý danh sách sinh viên hiển thị trên trang chủ
            </p>
          </div>
          <Button
            variant="primary"
            leftIcon={<HiOutlinePlus />}
            onClick={handleCreate}
          >
            Thêm sinh viên
          </Button>
        </header>

        {/* Table */}
        {loading ? (
          <div className={styles.loading}>Đang tải...</div>
        ) : students.length === 0 ? (
          <div className={styles.empty}>
            <HiOutlineAcademicCap className={styles.emptyIcon} />
            <p>Chưa có sinh viên nổi bật nào</p>
            <Button variant="primary" onClick={handleCreate}>
              Thêm sinh viên đầu tiên
            </Button>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Thứ tự</th>
                  <th>Hình ảnh</th>
                  <th>Họ tên</th>
                  <th>Khoa/Ngành</th>
                  <th>Năm học</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td className={styles.thuTu}>{student.thuTu}</td>
                    <td>
                      {student.hinhAnh ? (
                        <img
                          src={student.hinhAnh}
                          alt={student.hoTen}
                          className={styles.avatar}
                        />
                      ) : (
                        <div className={styles.avatarPlaceholder}>
                          <HiOutlineAcademicCap />
                        </div>
                      )}
                    </td>
                    <td className={styles.hoTen}>{student.hoTen}</td>
                    <td>{student.khoaPhong || '—'}</td>
                    <td>{student.namHoc || '—'}</td>
                    <td>
                      <StatusBadge
                        status={student.trangThai === 'Hien thi' ? 'approved' : 'cancelled'}
                        text={student.trangThai === 'Hien thi' ? 'Hiển thị' : 'Ẩn'}
                        size="sm"
                      />
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={
                            student.trangThai === 'Hien thi' ? (
                              <HiOutlineEyeSlash />
                            ) : (
                              <HiOutlineEye />
                            )
                          }
                          onClick={() => handleToggleStatus(student.id, student.trangThai)}
                          title={student.trangThai === 'Hien thi' ? 'Ẩn' : 'Hiển thị'}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<HiOutlinePencil />}
                          onClick={() => handleEdit(student)}
                          title="Sửa"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<HiOutlineTrash />}
                          onClick={() => handleDelete(student.id, student.hoTen)}
                          title="Xóa"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <StudentShowcaseModal
          student={editingStudent}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
};

export default StudentShowcasePage;
