import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import Button from '@components/common/Button/Button';
import Input from '@components/common/Input/Input';
import useAuthStore from '@stores/authStore';
import danhGiaService from '@services/danhGiaService';
import styles from './Testimonials.module.scss';

const MAX_CONTENT_LENGTH = 500;

const getUserName = (user) => user?.hoTen || user?.ho_ten || user?.hoten || '';
const getUserKhoa = (user) => user?.khoaPhong || user?.khoa_phong || user?.khoa || '';

const INITIAL_FORM = {
  hoTen: '',
  khoa: '',
  nienKhoa: '',
  noiDung: '',
};

const TestimonialForm = ({
  inline = false,
  onCancel,
  onSuccess,
}) => {
  const user = useAuthStore((state) => state.user);
  const isLoggedIn = !!user;

  const prefilled = useMemo(() => ({
    hoTen: getUserName(user),
    khoa: getUserKhoa(user),
    avatar: user?.avatar || '',
  }), [user]);

  const [form, setForm] = useState({
    ...INITIAL_FORM,
    hoTen: prefilled.hoTen,
    khoa: prefilled.khoa,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      hoTen: prefilled.hoTen || prev.hoTen,
      khoa: prefilled.khoa || prev.khoa,
    }));
  }, [prefilled.hoTen, prefilled.khoa]);

  const updateField = (field) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm({
      ...INITIAL_FORM,
      hoTen: prefilled.hoTen,
      khoa: prefilled.khoa,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      hoTen: isLoggedIn ? prefilled.hoTen : form.hoTen.trim(),
      khoa: isLoggedIn ? prefilled.khoa : form.khoa.trim(),
      nienKhoa: form.nienKhoa.trim(),
      avatar: prefilled.avatar,
      noiDung: form.noiDung.trim(),
    };

    if (!payload.hoTen) {
      toast.warning('Vui lòng nhập họ tên');
      return;
    }

    if (!payload.noiDung) {
      toast.warning('Vui lòng nhập nội dung cảm nhận');
      return;
    }

    if (payload.noiDung.length > MAX_CONTENT_LENGTH) {
      toast.warning(`Nội dung tối đa ${MAX_CONTENT_LENGTH} ký tự`);
      return;
    }

    try {
      setSubmitting(true);
      const response = await danhGiaService.create(payload);
      if (response?.success) {
        toast.success(response.message || 'Cảm nhận của bạn đã được gửi và đang chờ kiểm duyệt. Xin cảm ơn!');
        resetForm();
        onSuccess?.();
      }
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể gửi cảm nhận. Vui lòng thử lại sau.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className={`${styles.form} ${inline ? styles.formInline : ''}`} onSubmit={handleSubmit}>
      {isLoggedIn ? (
        <div className={styles.prefillBox}>
          <div className={styles.prefillAvatar}>
            {prefilled.avatar ? (
              <img src={prefilled.avatar} alt={prefilled.hoTen} />
            ) : (
              <span>{prefilled.hoTen ? prefilled.hoTen.charAt(0).toUpperCase() : '?'}</span>
            )}
          </div>
          <div>
            <strong>{prefilled.hoTen || 'Tài khoản của bạn'}</strong>
            <p>{prefilled.khoa || 'Thông tin khoa sẽ được cập nhật nếu có trong tài khoản'}</p>
          </div>
        </div>
      ) : (
        <div className={styles.formGrid}>
          <Input
            label="Họ tên"
            value={form.hoTen}
            onChange={updateField('hoTen')}
            required
          />
          <Input
            label="Khoa"
            value={form.khoa}
            onChange={updateField('khoa')}
          />
          <Input
            label="Niên khóa"
            placeholder="Ví dụ: Khóa 2022-2026"
            value={form.nienKhoa}
            onChange={updateField('nienKhoa')}
          />
        </div>
      )}

      {isLoggedIn && (
        <Input
          label="Niên khóa"
          placeholder="Ví dụ: Khóa 2022-2026"
          value={form.nienKhoa}
          onChange={updateField('nienKhoa')}
        />
      )}

      <div className={styles.textareaGroup}>
        <label className={styles.textareaLabel} htmlFor="testimonial-content">
          Nội dung chia sẻ <span>*</span>
        </label>
        <textarea
          id="testimonial-content"
          className={styles.textarea}
          value={form.noiDung}
          onChange={updateField('noiDung')}
          maxLength={MAX_CONTENT_LENGTH}
          rows={inline ? 5 : 6}
          required
        />
        <span className={styles.counter}>
          {form.noiDung.length}/{MAX_CONTENT_LENGTH}
        </span>
      </div>

      <div className={styles.formActions}>
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={submitting}
          >
            Hủy
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          loading={submitting}
          className={styles.navyButton}
        >
          Gửi cảm nhận
        </Button>
      </div>
    </form>
  );
};

TestimonialForm.propTypes = {
  inline: PropTypes.bool,
  onCancel: PropTypes.func,
  onSuccess: PropTypes.func,
};

export default TestimonialForm;
