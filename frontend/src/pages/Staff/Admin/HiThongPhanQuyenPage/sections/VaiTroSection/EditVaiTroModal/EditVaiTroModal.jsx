import { useState } from 'react';
import { toast } from 'react-toastify';
import { HiOutlineXMark, HiOutlineExclamationTriangle } from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import Input from '@components/common/Input/Input';
import api from '@services/api';
import styles from './EditVaiTroModal.module.scss';

const EditVaiTroModal = ({ role, onClose, onSuccess }) => {
  const [moTa, setMoTa] = useState(role.mo_ta || '');
  const [trangThai, setTrangThai] = useState(role.trang_thai || 'HOAT_DONG');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!moTa.trim()) {
      toast.error('Vui lòng nhập mô tả vai trò');
      return;
    }

    setSaving(true);
    try {
      const response = await api.patch(`/vaitro/${role.role_id}`, {
        mo_ta: moTa.trim(),
        trang_thai: trangThai,
      });

      if (response.data?.success) {
        toast.success('Cập nhật vai trò thành công');
        onSuccess();
      } else {
        toast.error(response.data?.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật vai trò');
    } finally {
      setSaving(false);
    }
  };

  const showWarning = trangThai === 'TAM_DUNG' && role.so_hoat_dong > 0;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Chỉnh sửa vai trò</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <HiOutlineXMark />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalBody}>
          <div className={styles.roleHeaderInfo}>
            <span className={styles.technicalLabel}>Tên vai trò kỹ thuật:</span>
            <span className={styles.technicalVal}>{role.ten_vai_tro}</span>
          </div>

          {/* Description field */}
          <div className={styles.formGroup}>
            <Input
              label="Mô tả vai trò"
              value={moTa}
              onChange={(e) => setMoTa(e.target.value)}
              placeholder="Mô tả ngắn về quyền hạn của vai trò này"
              disabled={saving}
              required
            />
          </div>

          {/* Status field (custom radios) */}
          <div className={styles.formGroup}>
            <label className={styles.fieldLabel}>Trạng thái vai trò</label>
            <div className={styles.radioGroup}>
              <button
                type="button"
                className={`${styles.radioBtn} ${styles.radioActive} ${
                  trangThai === 'HOAT_DONG' ? styles.checkedActive : ''
                }`}
                onClick={() => setTrangThai('HOAT_DONG')}
                disabled={saving}
              >
                <div className={styles.bullet}></div>
                <span>Hoạt động</span>
              </button>

              <button
                type="button"
                className={`${styles.radioBtn} ${styles.radioSuspended} ${
                  trangThai === 'TAM_DUNG' ? styles.checkedSuspended : ''
                }`}
                onClick={() => setTrangThai('TAM_DUNG')}
                disabled={saving}
              >
                <div className={styles.bullet}></div>
                <span>Tạm dừng</span>
              </button>
            </div>
          </div>

          {/* Warning Message */}
          {showWarning && (
            <div className={styles.warningAlert}>
              <HiOutlineExclamationTriangle className={styles.warnIcon} />
              <div className={styles.warnText}>
                ⚠️ Vai trò này đang có <strong>{role.so_hoat_dong}</strong> người dùng hoạt động.
                Tạm dừng vai trò sẽ <strong>VÔ HIỆU HÓA</strong> quyền đăng nhập và gọi API của tất cả người dùng thuộc vai trò này ngay lập tức.
              </div>
            </div>
          )}

          {/* Actions */}
          <div className={styles.modalFooter}>
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={saving}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={saving}
            >
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditVaiTroModal;
