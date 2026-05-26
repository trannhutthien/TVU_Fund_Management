import {
  HiOutlineChatBubbleLeftRight,
  HiOutlinePhone,
  HiOutlineEnvelope,
  HiOutlineClock,
  HiOutlineMapPin,
  HiOutlineChatBubbleOvalLeftEllipsis,
  HiOutlineGlobeAlt,
  HiOutlineArrowTopRightOnSquare,
} from 'react-icons/hi2';
import styles from './HelpPanel.module.scss';

const CONTACT_INFO = {
  phone: '(0294) 3855 246',
  email: 'phongctsv@tvu.edu.vn',
  address: 'Phòng Công tác sinh viên — Đại học Trà Vinh',
  officeHours: 'Thứ 2 – Thứ 6: 7:30 – 17:00',
  zaloLink: 'https://zalo.me/phongctsv',
  facebookLink: 'https://facebook.com/tvu',
};

const CONTACT_ITEMS = [
  { icon: HiOutlinePhone, text: CONTACT_INFO.phone, href: `tel:${CONTACT_INFO.phone}` },
  { icon: HiOutlineEnvelope, text: CONTACT_INFO.email, href: `mailto:${CONTACT_INFO.email}` },
  { icon: HiOutlineClock, text: CONTACT_INFO.officeHours, href: null },
  { icon: HiOutlineMapPin, text: CONTACT_INFO.address, href: null },
];

const HelpPanel = () => {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <HiOutlineChatBubbleLeftRight className={styles.headerIcon} />
        <span className={styles.headerText}>Cần giúp đỡ?</span>
      </div>

      <div className={styles.contactList}>
        {CONTACT_ITEMS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className={styles.contactItem}>
              <Icon className={styles.contactIcon} />
              {item.href ? (
                <a href={item.href} className={styles.contactLink}>
                  {item.text}
                </a>
              ) : (
                <span className={styles.contactText}>{item.text}</span>
              )}
            </div>
          );
        })}
      </div>

      <div className={styles.divider} />

      <div className={styles.socialLabel}>Liên hệ nhanh qua:</div>
      <div className={styles.socialRow}>
        <a href={CONTACT_INFO.zaloLink} target="_blank" rel="noopener noreferrer" className={styles.socialBtnZalo}>
          <HiOutlineChatBubbleOvalLeftEllipsis className={styles.socialBtnIcon} />
          Zalo
        </a>
        <a href={CONTACT_INFO.facebookLink} target="_blank" rel="noopener noreferrer" className={styles.socialBtnFacebook}>
          <HiOutlineGlobeAlt className={styles.socialBtnIcon} />
          Facebook
        </a>
      </div>

      <div className={styles.footerLink}>
        <a href="/lien-he" className={styles.ctsvLink}>
          <HiOutlineArrowTopRightOnSquare className={styles.ctsvIcon} />
          Xem thông tin Phòng CTSV
        </a>
      </div>
    </div>
  );
};

export default HelpPanel;
