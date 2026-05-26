import { HiOutlineClipboardDocumentList, HiOutlineCheckCircle, HiOutlineInformationCircle } from 'react-icons/hi2';
import styles from './RulesPanel.module.scss';

const RULES = [
  { id: 1, text: 'Dung lượng tệp tối đa: 5MB mỗi tệp.' },
  { id: 2, text: 'Định dạng hỗ trợ: PDF, JPG, PNG.' },
  { id: 3, text: 'Văn bản phải rõ chữ, không bị mờ hoặc mất góc.' },
  { id: 4, text: 'Giấy tờ phải còn hiệu lực, không quá 6 tháng.' },
  { id: 5, text: 'Tối đa 5 tệp đính kèm cho một hồ sơ.' },
];

const RulesPanel = () => {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <HiOutlineClipboardDocumentList className={styles.headerIcon} />
        <span className={styles.headerText}>Quy định đính kèm</span>
      </div>

      <div className={styles.ruleList}>
        {RULES.map((rule) => (
          <div key={rule.id} className={styles.ruleItem}>
            <HiOutlineCheckCircle className={styles.ruleIcon} />
            <span className={styles.ruleText}>{rule.text}</span>
          </div>
        ))}
      </div>

      <div className={styles.divider} />

      <div className={styles.note}>
        <HiOutlineInformationCircle className={styles.noteIcon} />
        <span>Hồ sơ không đạt yêu cầu sẽ bị từ chối tự động.</span>
      </div>
    </div>
  );
};

export default RulesPanel;
