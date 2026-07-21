import { useState, useEffect } from 'react';
import { HiOutlineXMark } from 'react-icons/hi2';
import chucVuService from '@services/chucVuService';
import styles from './ChucVuModal.module.scss';

const NHOM_OPTIONS = [
  { id: 'Hoi dong quy', label: 'Hội đồng Quỹ' },
  { id: 'Ban dieu hanh', label: 'Ban điều hành' },
  { id: 'Ban kiem soat', label: 'Ban kiểm soát' },
  { id: 'Van phong thuong truc', label: 'Văn phòng thường trực' },
];

const ChucVuModal = ({ isOpen, editingItem, onClose, onSuccess, defaultNhom }) => {
  const [form, setForm] = useState({
    chucDanh: '',
    nhom: defaultNhom || 'Hoi dong quy',
    moTa: '',
    ngayBatDauNhiemKy: '',
    ngayKetThucNhiemKy: '',
    thuTu: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingItem) {
      setForm({
        chucDanh: editingItem.chucDanh || '',
        nhom: editingItem.nhom || 'Hoi dong quy',
        moTa: editingItem.moTa || '',
        ngayBatDauNhiemKy: editingItem.ngayBatDauNhiemKy ? editingItem.ngayBatDauNhiemKy.split('T')[0] : '',
        ngayKetThucNhiemKy: editingItem.ngayKetThucNhiemKy ? editingItem.ngayKetThucNhiemKy.split('T')[0] : '',
        thuTu: editingItem.thuTu || 0,
      });
    } else {
      setForm({
        chucDanh: '',
        nhom: defaultNhom || 'Hoi dong quy',
        moTa: '',
        ngayBatDauNhiemKy: '',
        ngayKetThucNhiemKy: '',
        thuTu: 0,
      });
    }
  }, [editingItem, defaultNhom]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.chucDanh.trim()) {
      setError('Vui lòng nhập chức danh');
      return;
    }

    try {
      setLoading(true);
      const data = {
        chucDanh: form.chucDanh.trim(),
        nhom: form.nhom,
        moTa: form.moTa.trim() || null,
        ngayBatDauNhiemKy: form.ngayBatDauNhiemKy || null,
        ngayKetThucNhiemKy: form.ngayKetThucNhiemKy || null,
        thuTu: Number(form.thuTu) || 0,
      };

      if (editingItem) {
        await chucVuService.updateChucVu(editingItem.id, data);
      } else {
        await chucVuService.createChucVu(data);
      }

      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3>{editingItem ? 'Sửa chức vụ' : 'Thêm chức vụ mới'}</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <HiOutlineXMark size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.field}>
            <label>Nhóm <span>*</span></label>
            <select name="nhom" value={form.nhom} onChange={handleChange}>
              {NHOM_OPTIONS.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label>Chức danh <span>*</span></label>
            <input
              type="text"
              name="chucDanh"
              value={form.chucDanh}
              onChange={handleChange}
              placeholder="VD: Giám đốc Quỹ, Ủy viên..."
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label>Ngày bắt đầu nhiệm kỳ</label>
              <input
                type="date"
                name="ngayBatDauNhiemKy"
                value={form.ngayBatDauNhiemKy}
                onChange={handleChange}
              />
            </div>
            <div className={styles.field}>
              <label>Ngày kết thúc nhiệm kỳ</label>
              <input
                type="date"
                name="ngayKetThucNhiemKy"
                value={form.ngayKetThucNhiemKy}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label>Thứ tự hiển thị</label>
            <input
              type="number"
              name="thuTu"
              value={form.thuTu}
              onChange={handleChange}
              min="0"
            />
          </div>

          <div className={styles.field}>
            <label>Mô tả</label>
            <textarea
              name="moTa"
              value={form.moTa}
              onChange={handleChange}
              rows={3}
              placeholder="Mô tả thêm về chức vụ..."
            />
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Đang lưu...' : editingItem ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChucVuModal;
