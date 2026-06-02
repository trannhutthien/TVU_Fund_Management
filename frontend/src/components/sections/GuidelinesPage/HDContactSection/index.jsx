import { HiOutlinePhone, HiOutlineEnvelope, HiOutlineMapPin } from 'react-icons/hi2';
import Button from '@components/common/Button';
import styles from './HDContactSection.module.scss';

const LIEN_HE = [
  {
    icon: HiOutlinePhone,
    title: 'Gọi điện trực tiếp',
    info: '(0294) 3855 246',
    sub: 'Thứ 2 – Thứ 6: 7:30 – 17:00',
    href: 'tel:02943855246',
    btnLabel: 'Gọi ngay',
  },
  {
    icon: HiOutlineEnvelope,
    title: 'Gửi email',
    info: 'phongctsv@tvu.edu.vn',
    sub: 'Phản hồi trong vòng 24h làm việc',
    href: 'mailto:phongctsv@tvu.edu.vn',
    btnLabel: 'Gửi email',
  },
  {
    icon: HiOutlineMapPin,
    title: 'Đến trực tiếp',
    info: 'Phòng Công tác sinh viên',
    sub: '126 Nguyễn Thiện Thành, TP. Trà Vinh',
    href: 'https://maps.google.com/?q=Trường Đại học Trà Vinh',
    btnLabel: 'Xem bản đồ',
  },
];

const HDContactSection = () => {
  const handleContactClick = (href) => {
    if (href.startsWith('http')) {
      window.open(href, '_blank');
    } else {
      window.location.href = href;
    }
  };

  return (
    <section className={styles.hdContactSection}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Vẫn còn thắc mắc?</h2>
          <p className={styles.subtitle}>
            Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn
          </p>
        </div>

        {/* Contact Cards */}
        <div className={styles.contactGrid}>
          {LIEN_HE.map((contact, index) => {
            const Icon = contact.icon;

            return (
              <div key={index} className={styles.contactCard}>
                <Icon className={styles.contactIcon} />
                <h3 className={styles.contactTitle}>{contact.title}</h3>
                <p className={styles.contactInfo}>{contact.info}</p>
                <p className={styles.contactSub}>{contact.sub}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleContactClick(contact.href)}
                  className={styles.contactButton}
                >
                  {contact.btnLabel}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HDContactSection;
