import { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  HiOutlineGift,
  HiOutlineArrowPath,
  HiOutlineBanknotes,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineInformationCircle,
} from 'react-icons/hi2';
import { LOAI_HO_TRO_INFO } from '@constants/loaiHoTroInfo';
import styles from './LoanTypeInfoPanel.module.scss';

const iconMap = {
  gift: HiOutlineGift,
  arrowPath: HiOutlineArrowPath,
  banknotes: HiOutlineBanknotes,
};

const LoanTypeInfoPanel = ({ selectedType }) => {
  const info = useMemo(
    () => (selectedType ? LOAI_HO_TRO_INFO[selectedType] : null),
    [selectedType]
  );

  if (!info) return null;

  const IconComponent = iconMap[info.icon] || HiOutlineInformationCircle;

  return (
    <div className={styles.panel} style={{ '--info-color': info.color }}>
      <div className={styles.header}>
        <div className={styles.iconBadge} style={{ background: `${info.color}15`, color: info.color }}>
          <IconComponent />
        </div>
        <div className={styles.headerText}>
          <span className={styles.label}>{info.label}</span>
          <span className={styles.legalRef}>{info.legalRef}</span>
        </div>
      </div>

      <p className={styles.shortDesc}>{info.shortDesc}</p>

      <div className={styles.body}>
        <div className={styles.subSection}>
          <span className={styles.subLabel}>Mục đích hỗ trợ</span>
          <ul className={styles.list}>
            {info.purpose.map((item) => (
              <li key={item} className={styles.listItem}>
                <HiOutlineCheckCircle className={styles.checkIcon} style={{ color: info.color }} />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.subSection}>
          <span className={styles.subLabel}>Điều kiện</span>
          <ul className={styles.list}>
            {info.conditions.map((item) => (
              <li key={item} className={styles.listItem}>
                <HiOutlineCheckCircle className={styles.checkIcon} style={{ color: info.color }} />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.subSection}>
          <span className={styles.subLabel}>Ví dụ</span>
          <p className={styles.examples}>{info.examples}</p>
        </div>

        {info.note && (
          <div className={styles.note}>
            <HiOutlineExclamationTriangle className={styles.noteIcon} />
            <span>{info.note}</span>
          </div>
        )}
      </div>
    </div>
  );
};

LoanTypeInfoPanel.propTypes = {
  selectedType: PropTypes.string,
};

export default LoanTypeInfoPanel;
