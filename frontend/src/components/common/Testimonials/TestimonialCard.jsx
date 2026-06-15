import PropTypes from 'prop-types';
import styles from './Testimonials.module.scss';

const getInitial = (name) => (name ? name.trim().charAt(0).toUpperCase() : '?');

const TestimonialCard = ({
  testimonial,
  compact = false,
  fixedHeight = false,
  onReadMore,
}) => {
  const content = testimonial?.noiDung || testimonial?.noidung || '';
  const name = testimonial?.hoTen || testimonial?.hoten || 'Sinh viên TVU';
  const khoa = testimonial?.khoa || testimonial?.khoaPhong || 'Sinh viên TVU';
  const nienKhoa = testimonial?.nienKhoa || testimonial?.nienkhoa || '';
  const avatar = testimonial?.avatar;
  const isLong = content.length > 155;
  const previewContent = isLong ? content.slice(0, 155).trimEnd() : content;

  return (
    <article
      className={[
        styles.card,
        compact && styles.cardCompact,
        fixedHeight && styles.cardFixedHeight,
      ].filter(Boolean).join(' ')}
    >
      <div className={styles.quoteIcon}>“</div>

      <p className={styles.message}>
        {previewContent}
        {isLong && onReadMore && (
          <button
            type="button"
            className={styles.readMore}
            onClick={() => onReadMore(testimonial)}
          >
            ...Xem thêm
          </button>
        )}
      </p>

      <div className={styles.divider} />

      <div className={styles.profile}>
        <div className={styles.avatarWrapper}>
          {avatar ? (
            <img src={avatar} alt={name} className={styles.avatar} />
          ) : (
            <div className={styles.avatarPlaceholder}>{getInitial(name)}</div>
          )}
        </div>

        <div className={styles.meta}>
          <h3 className={styles.name}>{name}</h3>
          <p className={styles.major}>
            {khoa}
            {nienKhoa ? <span> • {nienKhoa}</span> : null}
          </p>
        </div>
      </div>
    </article>
  );
};

TestimonialCard.propTypes = {
  testimonial: PropTypes.shape({
    hoTen: PropTypes.string,
    hoten: PropTypes.string,
    khoa: PropTypes.string,
    khoaPhong: PropTypes.string,
    nienKhoa: PropTypes.string,
    nienkhoa: PropTypes.string,
    avatar: PropTypes.string,
    noiDung: PropTypes.string,
    noidung: PropTypes.string,
  }).isRequired,
  compact: PropTypes.bool,
  fixedHeight: PropTypes.bool,
  onReadMore: PropTypes.func,
};

export default TestimonialCard;
