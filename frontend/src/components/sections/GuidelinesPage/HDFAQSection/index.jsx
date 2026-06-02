import { useState } from 'react';
import PropTypes from 'prop-types';
import { HiOutlineQuestionMarkCircle, HiOutlineChevronDown } from 'react-icons/hi2';
import styles from './HDFAQSection.module.scss';

const FAQ_TABS = ['Tất cả', 'Sinh viên', 'Nhà tài trợ', 'Tài khoản', 'Hồ sơ'];

const FAQ_DATA = [
  {
    group: 'Sinh viên',
    q: 'Tôi có thể nộp đơn cho nhiều quỹ cùng lúc không?',
    a: 'Có, bạn có thể nộp đơn cho nhiều quỹ khác nhau cùng lúc nếu đáp ứng điều kiện của từng quỹ. Tuy nhiên với cùng 1 quỹ, bạn chỉ được có 1 đơn đang xử lý tại một thời điểm.',
  },
  {
    group: 'Sinh viên',
    q: 'Hồ sơ bị từ chối thì có nộp lại được không?',
    a: 'Có, bạn có thể chỉnh sửa và nộp lại sau khi đơn bị từ chối. Hệ thống sẽ ghi rõ lý do từ chối để bạn biết cần bổ sung gì. Lưu ý: mỗi quỹ có deadline riêng.',
  },
  {
    group: 'Sinh viên',
    q: 'Tài khoản ngân hàng phải mang tên chính chủ không?',
    a: 'Bắt buộc. Tài khoản nhận giải ngân phải mang chính tên của sinh viên đăng ký. Không chấp nhận tài khoản người thân hoặc bên thứ ba.',
  },
  {
    group: 'Nhà tài trợ',
    q: 'Tôi có thể chỉ định quỹ cụ thể muốn hỗ trợ không?',
    a: 'Có, khi tạo khoản tài trợ bạn chọn trực tiếp quỹ muốn đóng góp. Tiền sẽ được ghi nhận vào đúng quỹ đó và chỉ dùng cho mục đích của quỹ.',
  },
  {
    group: 'Nhà tài trợ',
    q: 'Tôi nhận được giấy xác nhận đóng góp ở đâu?',
    a: 'Sau khi khoản tài trợ được xác nhận, bạn có thể tải giấy xác nhận có chữ ký điện tử trong phần Lịch sử tài trợ của tài khoản. Giấy xác nhận có chữ ký thủ công yêu cầu liên hệ trực tiếp Phòng CTSV.',
  },
  {
    group: 'Tài khoản',
    q: 'Quên mật khẩu phải làm thế nào?',
    a: 'Trên trang đăng nhập, nhấn "Quên mật khẩu", nhập email TVU của bạn. Hệ thống gửi link đặt lại mật khẩu qua email trong vòng 5 phút.',
  },
  {
    group: 'Hồ sơ',
    q: 'Hồ sơ đang xét duyệt có chỉnh sửa được không?',
    a: 'Không thể chỉnh sửa khi hồ sơ đang ở trạng thái "Đang xử lý" hoặc "Chờ giải ngân". Chỉ có thể chỉnh sửa khi hồ sơ ở trạng thái "Yêu cầu bổ sung" do cán bộ yêu cầu.',
  },
  {
    group: 'Hồ sơ',
    q: 'Mất bao lâu để nhận được tiền sau khi được duyệt?',
    a: 'Sau khi hồ sơ được phê duyệt toàn bộ (Chờ giải ngân), kế toán sẽ thực hiện chuyển khoản trong vòng 1-3 ngày làm việc. Bạn sẽ nhận thông báo khi tiền được chuyển.',
  },
];

const HDFAQSection = ({ activeFAQ, setActiveFAQ, searchKeyword }) => {
  const [activeGroup, setActiveGroup] = useState('Tất cả');

  // Filter FAQ
  const filteredFAQ = FAQ_DATA.filter(faq => {
    const matchKeyword = !searchKeyword || 
      faq.q.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchKeyword.toLowerCase());
    
    const matchGroup = activeGroup === 'Tất cả' || faq.group === activeGroup;
    
    return matchKeyword && matchGroup;
  });

  const toggleFAQ = (index) => {
    setActiveFAQ(activeFAQ === index ? null : index);
  };

  return (
    <section id="faq-section" className={styles.hdFaqSection}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Câu hỏi thường gặp</h2>
          <p className={styles.subtitle}>
            Những thắc mắc phổ biến nhất từ sinh viên và nhà tài trợ
          </p>
        </div>

        {/* Filter Tabs */}
        <div className={styles.filterTabs}>
          {FAQ_TABS.map((tab) => (
            <button
              key={tab}
              className={`${styles.filterTab} ${activeGroup === tab ? styles.filterTabActive : ''}`}
              onClick={() => setActiveGroup(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className={styles.faqList}>
          {filteredFAQ.length > 0 ? (
            filteredFAQ.map((faq, index) => {
              const isOpen = activeFAQ === index;

              return (
                <div key={index} className={styles.faqItem}>
                  <button
                    className={styles.faqHeader}
                    onClick={() => toggleFAQ(index)}
                  >
                    <HiOutlineQuestionMarkCircle className={styles.faqIcon} />
                    <span className={styles.faqQuestion}>{faq.q}</span>
                    <HiOutlineChevronDown 
                      className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
                    />
                  </button>

                  {isOpen && (
                    <div className={styles.faqContent}>
                      <p className={styles.faqAnswer}>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className={styles.emptyState}>
              <p>Không tìm thấy câu hỏi phù hợp với từ khóa "{searchKeyword}"</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

HDFAQSection.propTypes = {
  activeFAQ: PropTypes.number,
  setActiveFAQ: PropTypes.func.isRequired,
  searchKeyword: PropTypes.string.isRequired,
};

export default HDFAQSection;
