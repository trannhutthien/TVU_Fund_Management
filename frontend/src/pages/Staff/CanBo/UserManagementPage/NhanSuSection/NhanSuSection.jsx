import { useState, useEffect } from 'react';
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
} from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import chucVuService from '@services/chucVuService';
import ChucVuModal from './ChucVuModal';
import styles from './NhanSuSection.module.scss';

const NHOM_OPTIONS = [
  { id: 'Hoi dong quy', label: 'Hội đồng Quỹ' },
  { id: 'Ban dieu hanh', label: 'Ban điều hành' },
  { id: 'Ban kiem soat', label: 'Ban kiểm soát' },
  { id: 'Van phong thuong truc', label: 'Văn phòng thường trực' },
];

const NhanSuSection = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeNhom, setActiveNhom] = useState('Hoi dong quy');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await chucVuService.getAllChucVu({ trangthai: 'Dang nhiem' });
      if (response.success) {
        setData(response.data);
      }
    } catch (error) {
      console.error('Error fetching chuc vu:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = data.filter(item => item.nhom === activeNhom);

  const handleCreate = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id, hoTen) => {
    if (!window.confirm(`Bạn có chắc muốn xóa chức vụ "${hoTen}"?`)) return;
    try {
      await chucVuService.deleteChucVu(id);
      fetchData();
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Có lỗi khi xóa');
    }
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    fetchData();
  };

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <h3>Chức vụ tổ chức</h3>
        <Button onClick={handleCreate} icon={HiOutlinePlus}>
          Thêm chức vụ
        </Button>
      </div>

      <div className={styles.nhomTabs}>
        {NHOM_OPTIONS.map(nhom => (
          <button
            key={nhom.id}
            className={`${styles.nhomTab} ${activeNhom === nhom.id ? styles.active : ''}`}
            onClick={() => setActiveNhom(nhom.id)}
          >
            {nhom.label}
            <span className={styles.count}>
              {data.filter(item => item.nhom === nhom.id).length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.loading}>Đang tải...</div>
      ) : filteredData.length === 0 ? (
        <div className={styles.empty}>Chưa có chức vụ nào trong nhóm này</div>
      ) : (
        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <span className={styles.colSTT}>#</span>
            <span className={styles.colName}>Họ tên</span>
            <span className={styles.colChucDanh}>Chức danh</span>
            <span className={styles.colNhiemKy}>Nhiệm kỳ</span>
            <span className={styles.colActions}>Thao tác</span>
          </div>
          {filteredData.map((item, idx) => (
            <div key={item.id} className={styles.tableRow}>
              <span className={styles.colSTT}>{idx + 1}</span>
              <span className={styles.colName}>
                <div className={styles.nameCell}>
                  {item.anh ? (
                    <img
                      src={item.anh.startsWith('http') ? item.anh : `${import.meta.env?.VITE_API_BASE_URL?.replace(/\/api\/?$/, '') || 'http://localhost:5001'}${item.anh}`}
                      alt=""
                      className={styles.miniAvatar}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className={styles.miniAvatarFallback}>
                      {item.hoTen?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  )}
                  {item.hoTen || '(Chưa liên kết)'}
                </div>
              </span>
              <span className={styles.colChucDanh}>{item.chucDanh}</span>
              <span className={styles.colNhiemKy}>
                {item.ngayBatDauNhiemKy
                  ? `${new Date(item.ngayBatDauNhiemKy).getFullYear()}${item.ngayKetThucNhiemKy ? ` - ${new Date(item.ngayKetThucNhiemKy).getFullYear()}` : ' - nay'}`
                  : '—'}
              </span>
              <span className={styles.colActions}>
                <button className={styles.editBtn} onClick={() => handleEdit(item)} title="Sửa">
                  <HiOutlinePencil size={16} />
                </button>
                <button className={styles.deleteBtn} onClick={() => handleDelete(item.id, item.hoTen)} title="Xóa">
                  <HiOutlineTrash size={16} />
                </button>
              </span>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <ChucVuModal
          isOpen={isModalOpen}
          editingItem={editingItem}
          onClose={() => { setIsModalOpen(false); setEditingItem(null); }}
          onSuccess={handleModalSuccess}
          defaultNhom={activeNhom}
        />
      )}
    </div>
  );
};

export default NhanSuSection;
