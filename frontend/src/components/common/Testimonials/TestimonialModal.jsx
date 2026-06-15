import PropTypes from 'prop-types';
import { HiOutlineXMark } from 'react-icons/hi2';
import TestimonialForm from './TestimonialForm';
import styles from './Testimonials.module.scss';

const TestimonialModal = ({
  mode = 'submit',
  testimonial = null,
  open,
  onClose,
  onSuccess,
}) => {
  if (!open) return null;

  const isDetail = mode === 'detail';

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h2>{isDetail ? 'Cảm nhận của sinh viên' : 'Chia sẻ cảm nhận của bạn'}</h2>
            {!isDetail && <p>Cảm nhận sẽ được hiển thị sau khi được kiểm duyệt.</p>}
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Đóng"
          >
            <HiOutlineXMark />
          </button>
        </div>

        {isDetail ? (
          <div className={styles.detailBody}>
            <p>{testimonial?.noiDung || testimonial?.noidung || ''}</p>
            <div className={styles.detailProfile}>
              <strong>{testimonial?.hoTen || testimonial?.hoten || 'Sinh viên TVU'}</strong>
              <span>
                {testimonial?.khoa || 'Sinh viên TVU'}
                {testimonial?.nienKhoa ? ` • ${testimonial.nienKhoa}` : ''}
              </span>
            </div>
          </div>
        ) : (
          <TestimonialForm
            onCancel={onClose}
            onSuccess={() => {
              onSuccess?.();
              onClose?.();
            }}
          />
        )}
      </div>
    </div>
  );
};

TestimonialModal.propTypes = {
  mode: PropTypes.oneOf(['submit', 'detail']),
  testimonial: PropTypes.object,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};

export default TestimonialModal;
