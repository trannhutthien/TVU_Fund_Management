import {
  HiOutlineUserPlus,
  HiOutlineDocumentPlus,
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
    icon: HiOutlineUserPlus,
    title: 'Đăng ký tài khoản',
    desc: 'Sử dụng email sinh viên TVU (@st.tvu.edu.vn) để đăng ký. Hệ thống tự động xác thực danh tính sinh viên.',
    time: '~2 phút',
    color: 'var(--color-primary)',
  },
  {
    step: 2,
    icon: HiOutlineDocumentPlus,
    title: 'Tạo hồ sơ đề nghị',
    desc: 'Chọn quỹ phù hợp, điền thông tin hoàn cảnh, tải lên giấy tờ minh chứng. AI hỗ trợ viết lý do thuyết phục.',
    time: '~10 phút',
    color: 'var(--color-gold)',
  },
  {
    step: 3,
    icon: HiOutlineClock,
    title: 'Chờ xét duyệt',
    desc: 'Hồ sơ được xét duyệt qua 2-3 cấp. Bạn nhận thông báo tự động sau mỗi cấp duyệt qua email và hệ thống.',
    time: '3-7 ngày',
    color: '#7c3aed',
  },
  {
    step: 4,
    icon: HiOutlineBanknotes,
    title: 'Nhận giải ngân',
    desc: 'Tiền được chuyển khoản trực tiếp vào tài khoản ngân hàng bạn đã đăng ký trong hệ thống.',
    time: '1-3 ngày',
    color: '#10b981',
  },
];

const TAI_LIEU = {
  batBuoc: [
    'Giấy xác nhận sinh viên (còn hiệu lực)',
    'Bảng điểm học kỳ gần nhất',
    'CMND/CCCD (chụp 2 mặt)',
    'Thông tin tài khoản ngân hàng',
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
    desc: 'Kiểm tra hạn nộp của từng quỹ. Hệ thống sẽ tự đóng nhận đơn sau deadline.',
  },
  {
    icon: HiOutlineShieldCheck,
    color: '#10b981',
    title: 'Bảo mật thông tin',
    desc: 'Thông tin cá nhân và hồ sơ chỉ được dùng cho mục đích xét duyệt nội bộ.',
  },
  {
    icon: HiOutlineArrowPath,
    color: 'var(--color-primary)',
    title: 'Theo dõi trạng thái',
    desc: 'Đăng nhập thường xuyên để kiểm tra trạng thái hồ sơ và nhận thông báo kịp thời.',
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

        {/* 4 Steps */}
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
