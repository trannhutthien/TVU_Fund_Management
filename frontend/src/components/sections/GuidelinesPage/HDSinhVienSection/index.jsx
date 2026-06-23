import {
  HiOutlineClipboardDocumentList,
  HiOutlineDocumentPlus,
  HiOutlineEnvelope,
  HiOutlineClock,
  HiOutlineBanknotes,
  HiOutlinePaperClip,
  HiOutlineCheckCircle,
  HiOutlinePlusCircle,
  HiOutlineExclamationTriangle,
  HiOutlineShieldCheck,
  HiOutlineArrowPath,
} from 'react-icons/hi2';
import styles from './HDSinhVienSection.module.scss';

const STEPS_SV = [
  {
    step: 1,
    icon: HiOutlineClipboardDocumentList,
    title: 'Chọn quỹ hỗ trợ',
    desc: 'Sinh viên có thể chọn quỹ phù hợp từ danh mục công khai và bắt đầu nộp đơn ngay, không bắt buộc đăng ký tài khoản trước.',
    time: '~3 phút',
    color: 'var(--color-primary)',
  },
  {
    step: 2,
    icon: HiOutlineDocumentPlus,
    title: 'Hoàn thiện hồ sơ',
    desc: 'Điền thông tin cá nhân, thông tin học tập, tài khoản nhận hỗ trợ, lý do đề nghị và tải tài liệu minh chứng theo yêu cầu.',
    time: '~10 phút',
    color: 'var(--color-gold)',
  },
  {
    step: 3,
    icon: HiOutlineEnvelope,
    title: 'Xác thực email OTP',
    desc: 'Sau khi gửi đơn, hệ thống gửi mã OTP đến email đã khai báo. Sinh viên nhập mã để kích hoạt hồ sơ và xác nhận email liên hệ.',
    time: '15 phút hiệu lực',
    color: '#7c3aed',
  },
  {
    step: 4,
    icon: HiOutlineClock,
    title: 'Theo dõi xét duyệt',
    desc: 'Sau khi OTP hợp lệ, đơn được chuyển vào quy trình duyệt. Hệ thống tạo tài khoản theo dõi và gửi thông tin đăng nhập tạm thời qua email.',
    time: '3-7 ngày',
    color: '#0891b2',
  },
  {
    step: 5,
    icon: HiOutlineBanknotes,
    title: 'Nhận kết quả hỗ trợ',
    desc: 'Khi hồ sơ được duyệt và đủ điều kiện giải ngân, khoản hỗ trợ được chuyển vào tài khoản ngân hàng sinh viên đã cung cấp.',
    time: '1-3 ngày',
    color: '#10b981',
  },
];

const TAI_LIEU = {
  batBuoc: [
    'Thông tin sinh viên: họ tên, MSSV, khoa, lớp và email đang sử dụng',
    'Giấy xác nhận sinh viên hoặc tài liệu chứng minh đang theo học',
    'Tài liệu minh chứng hoàn cảnh, nhu cầu hỗ trợ hoặc nội dung đề nghị',
    'CMND/CCCD (chụp 2 mặt)',
    'Thông tin tài khoản ngân hàng nhận hỗ trợ',
  ],
  boSung: [
    'Giấy xác nhận hoàn cảnh khó khăn (nếu có)',
    'Giấy khen, bằng khen thành tích (nếu có)',
    'Hóa đơn học phí (cho quỹ hỗ trợ học phí)',
    'Tài liệu bổ sung theo yêu cầu từng quỹ',
  ],
};

const LUU_Y = [
  {
    icon: HiOutlineExclamationTriangle,
    color: '#f59e0b',
    title: 'Deadline nộp đơn',
    desc: 'Kiểm tra ngày bắt đầu và ngày kết thúc của từng quỹ. Hồ sơ gửi sau hạn có thể không được tiếp nhận.',
  },
  {
    icon: HiOutlineShieldCheck,
    color: '#10b981',
    title: 'Email xác thực',
    desc: 'Sử dụng email thật và đang truy cập được để nhận OTP, mã tra cứu và thông tin tài khoản theo dõi hồ sơ.',
  },
  {
    icon: HiOutlineArrowPath,
    color: 'var(--color-primary)',
    title: 'Theo dõi trạng thái',
    desc: 'Sau khi xác thực OTP, sinh viên có thể tra cứu bằng mã UUID hoặc đăng nhập bằng tài khoản được hệ thống tạo tự động.',
  },
];

const HDSinhVienSection = () => {
  return (
    <section className={styles.hdSinhVienSection}>
      <div className={styles.container}>
        {/* Section Title */}
        <div className={styles.sectionHeader}>
          <div className={styles.sectionLine} />
          <h2 className={styles.sectionTitle}>Hướng dẫn dành cho Sinh viên</h2>
          <div className={styles.sectionLine} />
        </div>

        {/* Steps */}
        <div className={styles.stepsGrid}>
          {STEPS_SV.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.step} className={styles.stepCard}>
                <div 
                  className={styles.stepNumber}
                  style={{ 
                    background: `${step.color}20`,
                    color: step.color 
                  }}
                >
                  {step.step}
                </div>
                <Icon 
                  className={styles.stepIcon}
                  style={{ color: step.color }}
                />
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
                <div className={styles.stepTime}>
                  <HiOutlineClock size={12} />
                  <span>{step.time}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tài liệu cần chuẩn bị */}
        <div className={styles.documentsCard}>
          <div className={styles.documentsHeader}>
            <HiOutlinePaperClip className={styles.documentsIcon} />
            <h3 className={styles.documentsTitle}>Tài liệu cần chuẩn bị</h3>
          </div>
          
          <div className={styles.documentsGrid}>
            {/* Bắt buộc */}
            <div className={styles.documentColumn}>
              <div className={styles.documentLabel}>✅ BẮT BUỘC</div>
              <ul className={styles.documentList}>
                {TAI_LIEU.batBuoc.map((item, index) => (
                  <li key={index} className={styles.documentItem}>
                    <HiOutlineCheckCircle className={styles.documentItemIcon} style={{ color: '#ef4444' }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Bổ sung */}
            <div className={styles.documentColumn}>
              <div className={styles.documentLabel} style={{ color: '#94a3b8' }}>📎 BỔ SUNG</div>
              <ul className={styles.documentList}>
                {TAI_LIEU.boSung.map((item, index) => (
                  <li key={index} className={styles.documentItem}>
                    <HiOutlinePlusCircle className={styles.documentItemIcon} style={{ color: '#94a3b8' }} />
                    <span style={{ color: '#64748b' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Lưu ý quan trọng */}
        <div className={styles.notesGrid}>
          {LUU_Y.map((note, index) => {
            const Icon = note.icon;
            return (
              <div 
                key={index} 
                className={styles.noteCard}
                style={{ background: `${note.color}10` }}
              >
                <Icon 
                  className={styles.noteIcon}
                  style={{ color: note.color }}
                />
                <h4 className={styles.noteTitle}>{note.title}</h4>
                <p className={styles.noteDesc}>{note.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HDSinhVienSection;
