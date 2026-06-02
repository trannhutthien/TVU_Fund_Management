import { useState } from 'react';
import {
  HiOutlineUserCircle,
  HiOutlineClipboardDocumentList,
  HiOutlineCalendar,
  HiOutlineShieldCheck,
  HiOutlineExclamationTriangle,
  HiOutlineChevronDown,
  HiOutlineChevronRight,
} from 'react-icons/hi2';
import styles from './HDQuyDinhSection.module.scss';

const QUY_DINH = [
  {
    id: 'dieu_kien',
    icon: HiOutlineUserCircle,
    title: 'Điều kiện xét duyệt hỗ trợ',
    color: 'var(--color-primary)',
    content: [
      { 
        sub: 'Đối tượng được hỗ trợ', 
        items: [
          'Sinh viên hệ chính quy đang theo học tại TVU',
          'Có hoàn cảnh khó khăn được xác nhận bởi địa phương',
          'GPA tối thiểu theo quy định từng quỹ (thường ≥ 2.0)',
          'Không vi phạm kỷ luật trong năm học hiện tại'
        ] 
      },
      { 
        sub: 'Mức hỗ trợ', 
        items: [
          'Tùy theo từng quỹ, dao động từ 1 – 20 triệu đồng/suất',
          'Mỗi sinh viên chỉ được nhận 1 suất/kỳ từ cùng 1 quỹ',
          'Có thể nhận đồng thời từ nhiều quỹ khác nhau nếu đủ điều kiện'
        ] 
      },
    ]
  },
  {
    id: 'ho_so',
    icon: HiOutlineClipboardDocumentList,
    title: 'Quy định về hồ sơ',
    color: 'var(--color-gold)',
    content: [
      { 
        sub: 'Tính hợp lệ', 
        items: [
          'Giấy tờ phải còn hiệu lực, không quá 6 tháng',
          'Ảnh chụp rõ nét, không bị mờ hoặc mất góc',
          'Định dạng PDF, JPG, PNG — mỗi file tối đa 5MB',
          'Tối đa 5 tệp đính kèm cho một hồ sơ'
        ] 
      },
      { 
        sub: 'Thông tin bắt buộc', 
        items: [
          'Họ tên, MSSV khớp với dữ liệu hệ thống',
          'Tài khoản ngân hàng chính chủ, đúng tên',
          'Lý do đề nghị tối thiểu 100 ký tự, rõ ràng, trung thực'
        ] 
      },
    ]
  },
  {
    id: 'thoi_gian',
    icon: HiOutlineCalendar,
    title: 'Thời hạn xử lý',
    color: '#7c3aed',
    content: [
      { 
        sub: 'Quy trình xét duyệt', 
        items: [
          'Cán bộ xét duyệt ban đầu: trong vòng 5 ngày làm việc',
          'Trưởng phòng/Admin phê duyệt: trong vòng 3 ngày làm việc',
          'Kế toán thực hiện giải ngân: trong vòng 2 ngày làm việc sau phê duyệt',
          'Tổng thời gian tối đa từ nộp đến nhận: 15 ngày làm việc'
        ] 
      },
      { 
        sub: 'Lưu ý thời hạn', 
        items: [
          'Hạn nộp đơn do từng quỹ quy định riêng',
          'Hồ sơ thiếu sót sẽ bị trả về để bổ sung — thời gian bổ sung không tính vào quy trình',
          'Sau deadline, hệ thống tự động đóng nhận đơn'
        ] 
      },
    ]
  },
  {
    id: 'chinh_sach',
    icon: HiOutlineShieldCheck,
    title: 'Chính sách bảo mật & Sử dụng dữ liệu',
    color: '#10b981',
    content: [
      { 
        sub: 'Thu thập dữ liệu', 
        items: [
          'Chỉ thu thập thông tin cần thiết cho mục đích xét duyệt hỗ trợ',
          'Thông tin tài khoản ngân hàng được mã hóa và bảo mật',
          'Không chia sẻ dữ liệu cá nhân cho bên thứ ba'
        ] 
      },
      { 
        sub: 'Quyền của người dùng', 
        items: [
          'Quyền truy cập và chỉnh sửa thông tin cá nhân',
          'Quyền yêu cầu xóa tài khoản (khi không còn nhu cầu)',
          'Quyền khiếu nại kết quả xét duyệt trong vòng 7 ngày'
        ] 
      },
    ]
  },
  {
    id: 'vi_pham',
    icon: HiOutlineExclamationTriangle,
    title: 'Xử lý vi phạm',
    color: '#ef4444',
    content: [
      { 
        sub: 'Hành vi vi phạm', 
        items: [
          'Cung cấp thông tin sai lệch, giả mạo giấy tờ',
          'Sử dụng kinh phí hỗ trợ không đúng mục đích',
          'Can thiệp, tác động vào quá trình xét duyệt'
        ] 
      },
      { 
        sub: 'Hình thức xử lý', 
        items: [
          'Hủy hồ sơ và từ chối xét duyệt trong 2 năm tiếp theo',
          'Yêu cầu hoàn trả toàn bộ kinh phí đã nhận',
          'Thông báo đến Phòng Công tác sinh viên xử lý kỷ luật'
        ] 
      },
    ]
  },
];

const HDQuyDinhSection = () => {
  const [openAccordion, setOpenAccordion] = useState(null);

  const toggleAccordion = (id) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  return (
    <section className={styles.hdQuyDinhSection}>
      <div className={styles.container}>
        {/* Section Title */}
        <div className={styles.sectionHeader}>
          <div className={styles.sectionLine} />
          <h2 className={styles.sectionTitle}>Quy định & Chính sách</h2>
          <div className={styles.sectionLine} />
        </div>

        {/* Accordion Items */}
        <div className={styles.accordionList}>
          {QUY_DINH.map((item) => {
            const Icon = item.icon;
            const isOpen = openAccordion === item.id;

            return (
              <div key={item.id} className={styles.accordionItem}>
                <button
                  className={styles.accordionHeader}
                  onClick={() => toggleAccordion(item.id)}
                >
                  <div 
                    className={styles.iconBox}
                    style={{ background: `${item.color}20` }}
                  >
                    <Icon style={{ color: item.color }} />
                  </div>
                  <span className={styles.accordionTitle}>{item.title}</span>
                  <HiOutlineChevronDown 
                    className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
                  />
                </button>

                {isOpen && (
                  <div className={styles.accordionContent}>
                    {item.content.map((section, idx) => (
                      <div key={idx} className={styles.contentSection}>
                        <h4 className={styles.contentSubtitle}>{section.sub}</h4>
                        <ul className={styles.contentList}>
                          {section.items.map((text, i) => (
                            <li key={i} className={styles.contentItem}>
                              <HiOutlineChevronRight 
                                className={styles.bulletIcon}
                                style={{ color: item.color }}
                              />
                              <span>{text}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HDQuyDinhSection;
