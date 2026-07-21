import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiOutlineAcademicCap, 
  HiOutlineDocumentArrowDown, 
  HiOutlineUserGroup, 
  HiOutlineInformationCircle,
  HiOutlineChevronRight,
  HiOutlineChevronLeft,
  HiOutlineTrophy,
  HiOutlineSparkles,
  HiOutlineShieldCheck,
  HiOutlineBookOpen,
  HiOutlineFolderOpen,
  HiOutlineCalendarDays,
  HiOutlineCheckCircle,
  HiOutlineCurrencyDollar,
  HiOutlineBriefcase,
  HiOutlineDocumentCheck,
  HiOutlineBuildingLibrary,
  HiOutlineHeart,
  HiOutlineExclamationTriangle,
} from 'react-icons/hi2';
import PublicHeader from '@components/layout/PublicHeader/PublicHeader';
import PublicFooter from '@components/layout/PublicFooter/PublicFooter';
import Button from '@components/common/Button';
import LoginForm from '@components/forms/LoginForm';
import RegisterForm from '@components/forms/RegisterForm';
import newsService from '@services/newsService';
import chucVuService from '@services/chucVuService';
import khuonVienImage from '@assets/images/khuonVienTruong.png';
import styles from './AboutFundPage.module.scss';

const TABS = {
  THONG_TIN: 'thong_tin',
  NHAN_SU: 'nhan_su',
  BAO_CAO: 'bao_cao',
  CHUONG_TRINH: 'chuong_trinh'
};

const AboutFundPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(TABS.THONG_TIN);
  const [chucVuData, setChucVuData] = useState({});
  const [chucVuLoading, setChucVuLoading] = useState(true);

  // Fetch chuc vu data
  useEffect(() => {
    const fetchChucVu = async () => {
      try {
        setChucVuLoading(true);
        const response = await chucVuService.getPublicChucVu();
        if (response.success) {
          setChucVuData(response.data);
        }
      } catch (error) {
        console.error('Error fetching chuc vu:', error);
      } finally {
        setChucVuLoading(false);
      }
    };
    fetchChucVu();
  }, []);

  // Modals state
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);
  const openRegisterModal = () => setIsRegisterModalOpen(true);
  const closeRegisterModal = () => setIsRegisterModalOpen(false);

  // Switch between modals
  const switchToRegister = () => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(true);
  };

  const switchToLogin = () => {
    setIsRegisterModalOpen(false);
    setIsLoginModalOpen(true);
  };

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (isLoginModalOpen) closeLoginModal();
        if (isRegisterModalOpen) closeRegisterModal();
      }
    };
    if (isLoginModalOpen || isRegisterModalOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isLoginModalOpen, isRegisterModalOpen]);

  // States for Báo cáo hoạt động
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [reportsPage, setReportsPage] = useState(1);
  const [totalReports, setTotalReports] = useState(0);
  const reportsLimit = 6;

  // States for Các chương trình
  const [programs, setPrograms] = useState([]);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [programsPage, setProgramsPage] = useState(1);
  const [totalPrograms, setTotalPrograms] = useState(0);
  const programsLimit = 6;

  // Scroll to top when page mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch activity reports
  useEffect(() => {
    if (activeTab !== TABS.BAO_CAO) return;

    const fetchReports = async () => {
      try {
        setLoadingReports(true);
        const response = await newsService.getPublicNews({
          phanloai: 'baocaohoatdong',
          page: reportsPage,
          limit: reportsLimit
        });
        if (response.success) {
          setReports(response.news || []);
          setTotalReports(response.total || 0);
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setLoadingReports(false);
      }
    };

    fetchReports();
  }, [activeTab, reportsPage]);

  // Fetch program articles
  useEffect(() => {
    if (activeTab !== TABS.CHUONG_TRINH) return;

    const fetchPrograms = async () => {
      try {
        setLoadingPrograms(true);
        const response = await newsService.getPublicNews({
          phanloai: 'chuongtrinh',
          page: programsPage,
          limit: programsLimit
        });
        if (response.success) {
          setPrograms(response.news || []);
          setTotalPrograms(response.total || 0);
        }
      } catch (error) {
        console.error('Error fetching programs:', error);
      } finally {
        setLoadingPrograms(false);
      }
    };

    fetchPrograms();
  }, [activeTab, programsPage]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className={styles.page}>
      <PublicHeader 
        onLoginClick={openLoginModal}
        onRegisterClick={openRegisterModal}
      />
      
      {/* Hero Banner Section */}
      <section className={styles.heroBanner}>
        <div className={styles.backgroundImage}>
          <img src={khuonVienImage} alt="Khuôn viên Đại học Trà Vinh" />
          <div className={styles.bannerOverlay} />
        </div>
        <div className={styles.bannerContainer}>
          <div className={styles.bannerContent}>
            <span className={styles.badge}>🎓 ĐỒNG HÀNH CÙNG TRI THỨC</span>
            <h1 className={styles.title}>Về Quỹ Phát Triển</h1>
            <p className={styles.subtitle}>
              Nơi tổng hợp những tin tức, sự kiện của Quỹ Phát Triển ĐHTV
            </p>
            <div className={styles.heroActions}>
              <Button 
                variant="primary" 
                onClick={() => navigate('/apply')}
                className={styles.heroBtn}
              >
                Tiếp nhận tài trợ
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Sub Navigation Bar */}
      <div className={styles.subNavBar}>
        <div className={styles.navContainer}>
          <button 
            type="button"
            className={`${styles.navTab} ${activeTab === TABS.THONG_TIN ? styles.active : ''}`}
            onClick={() => setActiveTab(TABS.THONG_TIN)}
          >
            <HiOutlineInformationCircle size={18} />
            <span>Thông tin chung</span>
          </button>
          <button 
            type="button"
            className={`${styles.navTab} ${activeTab === TABS.NHAN_SU ? styles.active : ''}`}
            onClick={() => setActiveTab(TABS.NHAN_SU)}
          >
            <HiOutlineUserGroup size={18} />
            <span>Tổ chức nhân sự</span>
          </button>
          <button 
            type="button"
            className={`${styles.navTab} ${activeTab === TABS.BAO_CAO ? styles.active : ''}`}
            onClick={() => {
              setActiveTab(TABS.BAO_CAO);
              setReportsPage(1);
            }}
          >
            <HiOutlineDocumentArrowDown size={18} />
            <span>Báo cáo hoạt động</span>
          </button>
          <button 
            type="button"
            className={`${styles.navTab} ${activeTab === TABS.CHUONG_TRINH ? styles.active : ''}`}
            onClick={() => {
              setActiveTab(TABS.CHUONG_TRINH);
              setProgramsPage(1);
            }}
          >
            <HiOutlineAcademicCap size={18} />
            <span>Các chương trình</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <main className={styles.mainContent}>
        <div className={styles.container}>
          
          {/* TAB 1: THÔNG TIN CHUNG */}
          {activeTab === TABS.THONG_TIN && (
            <div className={styles.tabContent}>
              {/* Giới thiệu tổng quan */}
              <div className={styles.introSection}>
                <div className={styles.introText}>
                  <h3>Lịch sử & Sứ mệnh của Quỹ</h3>
                  <p>
                    Quỹ Phát triển Đại học Trà Vinh (TVU Development Fund) được thành lập với mục tiêu huy động các nguồn lực hợp pháp trong và ngoài nước nhằm hỗ trợ sự nghiệp giáo dục, nghiên cứu khoa học và phát triển công nghệ của trường Đại học Trà Vinh.
                  </p>
                  <p>
                    Quỹ hoạt động không vì lợi nhuận, tuân thủ nguyên tắc tự nguyện, tự chủ tài chính và cam kết công khai, minh bạch 100% tất cả các nguồn vốn tiếp nhận và giải ngân trên cổng thông tin số của hệ thống.
                  </p>
                </div>
                <div className={styles.valueGrid}>
                  <div className={styles.valueCard}>
                    <div className={styles.valueIcon}><HiOutlineSparkles size={24} /></div>
                    <h4>Sứ mệnh</h4>
                    <p>Đồng hành cùng học viên, sinh viên vượt khó, tạo dựng tương lai vững chắc thông qua tri thức.</p>
                  </div>
                  <div className={styles.valueCard}>
                    <div className={styles.valueIcon}><HiOutlineTrophy size={24} /></div>
                    <h4>Tầm nhìn</h4>
                    <p>Trở thành quỹ hỗ trợ giáo dục có tầm ảnh hưởng lớn nhất khu vực Đồng bằng Sông Cửu Long.</p>
                  </div>
                  <div className={styles.valueCard}>
                    <div className={styles.valueIcon}><HiOutlineShieldCheck size={24} /></div>
                    <h4>Giá trị cốt lõi</h4>
                    <p>Minh bạch hàng đầu, hỗ trợ kịp thời, kết nối nhân văn bền vững giữa nhà hảo tâm và học sinh.</p>
                  </div>
                </div>
              </div>

              {/* ─── Điều lệ Quỹ ─── */}
              <div className={styles.dieuLeSection}>
                <div className={styles.dieuLeHeader}>
                  <HiOutlineBookOpen size={28} />
                  <div>
                    <h2>Điều lệ Quỹ Phát triển Đại học Trà Vinh</h2>
                    <p>Các quy định chính thức về hoạt động, quản lý và sử dụng nguồn vốn của Quỹ</p>
                  </div>
                </div>

                {/* 1. Mục đích */}
                <div className={styles.dieuLeCard}>
                  <div className={styles.dieuLeCardHeader}>
                    <span className={styles.dieuLeNumber}>01</span>
                    <div className={styles.dieuLeCardTitle}>
                      <HiOutlineBuildingLibrary size={20} />
                      <h4>Mục đích của Quỹ</h4>
                    </div>
                  </div>
                  <div className={styles.dieuLeCardBody}>
                    <p>
                      Quỹ Phát triển Đại học Trà Vinh là quỹ xã hội hoạt động <strong>không vì lợi nhuận</strong>, được thành lập trên cơ sở tuân thủ pháp luật của Nhà nước. Quỹ tự tạo vốn từ các nguồn đóng góp, tài trợ và đầu tư hợp pháp nhằm hỗ trợ các hoạt động giảng dạy, học tập, nghiên cứu khoa học, chuyển giao công nghệ và phát triển bền vững của Đại học Trà Vinh.
                    </p>
                  </div>
                </div>

                {/* 2. Nguyên tắc hoạt động */}
                <div className={styles.dieuLeCard}>
                  <div className={styles.dieuLeCardHeader}>
                    <span className={styles.dieuLeNumber}>02</span>
                    <div className={styles.dieuLeCardTitle}>
                      <HiOutlineCheckCircle size={20} />
                      <h4>Nguyên tắc hoạt động</h4>
                    </div>
                  </div>
                  <div className={styles.dieuLeCardBody}>
                    <ul className={styles.dieuLeList}>
                      <li>Hoạt động không vì mục đích lợi nhuận.</li>
                      <li>Tiếp nhận nguồn tài trợ, đóng góp hoàn toàn tự nguyện từ các tổ chức, cá nhân trong và ngoài nước.</li>
                      <li>Không sử dụng nguồn vốn ngân sách Nhà nước.</li>
                      <li>Thực hiện công khai, minh bạch, tự chủ tài chính và chịu trách nhiệm trước pháp luật về mọi hoạt động của Quỹ.</li>
                      <li>Quản lý, sử dụng nguồn vốn đúng mục đích và phát triển bền vững nguồn vốn của Quỹ.</li>
                    </ul>
                  </div>
                </div>

                {/* 3. Nhiệm vụ */}
                <div className={styles.dieuLeCard}>
                  <div className={styles.dieuLeCardHeader}>
                    <span className={styles.dieuLeNumber}>03</span>
                    <div className={styles.dieuLeCardTitle}>
                      <HiOutlineBriefcase size={20} />
                      <h4>Nhiệm vụ của Quỹ</h4>
                    </div>
                  </div>
                  <div className={styles.dieuLeCardBody}>
                    <ul className={styles.dieuLeList}>
                      <li>Vận động, tiếp nhận và quản lý các nguồn tài trợ hợp pháp.</li>
                      <li>Quản lý, sử dụng hiệu quả các nguồn vốn.</li>
                      <li>Triển khai các hoạt động nhằm duy trì và phát triển nguồn vốn.</li>
                      <li>Tiếp nhận hồ sơ xin tài trợ, vay vốn; tổ chức thẩm định và quyết định hỗ trợ theo quy định.</li>
                      <li>Kiểm tra, giám sát, nghiệm thu các dự án được tài trợ.</li>
                      <li>Thu hồi vốn đối với các khoản vay hoặc tài trợ có thu hồi.</li>
                      <li>Đình chỉ hoặc thu hồi kinh phí khi phát hiện sử dụng vốn sai mục đích hoặc vi phạm quy định.</li>
                    </ul>
                  </div>
                </div>

                {/* 4. Nguồn vốn */}
                <div className={styles.dieuLeCard}>
                  <div className={styles.dieuLeCardHeader}>
                    <span className={styles.dieuLeNumber}>04</span>
                    <div className={styles.dieuLeCardTitle}>
                      <HiOutlineCurrencyDollar size={20} />
                      <h4>Nguồn vốn hoạt động</h4>
                    </div>
                  </div>
                  <div className={styles.dieuLeCardBody}>
                      <div className={styles.nguonVangGrid}>
                      <div className={styles.nguonVangItem}>
                        <span className={styles.nguonVangIcon}>🤝</span>
                        <div>
                          <strong>Đóng góp ban đầu</strong>
                          <p>Của các sáng lập viên</p>
                        </div>
                      </div>
                      <div className={styles.nguonVangItem}>
                        <span className={styles.nguonVangIcon}>🎁</span>
                        <div>
                          <strong>Tài trợ, hiến tặng</strong>
                          <p>Từ tổ chức, doanh nghiệp và cá nhân trong và ngoài nước</p>
                        </div>
                      </div>
                      <div className={styles.nguonVangItem}>
                        <span className={styles.nguonVangIcon}>🏦</span>
                        <div>
                          <strong>Lãi tiền gửi</strong>
                          <p>Và các hoạt động phát triển vốn hợp pháp</p>
                        </div>
                      </div>
                      <div className={styles.nguonVangItem}>
                        <span className={styles.nguonVangIcon}>♻️</span>
                        <div>
                          <strong>Nguồn thu hồi</strong>
                          <p>Từ các dự án được hỗ trợ</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. Đối tượng hỗ trợ */}
                <div className={styles.dieuLeCard}>
                  <div className={styles.dieuLeCardHeader}>
                    <span className={styles.dieuLeNumber}>05</span>
                    <div className={styles.dieuLeCardTitle}>
                      <HiOutlineUserGroup size={20} />
                      <h4>Đối tượng được hỗ trợ</h4>
                    </div>
                  </div>
                  <div className={styles.dieuLeCardBody}>
                    <div className={styles.doiTuongGrid}>
                      <div className={styles.doiTuongItem}>
                        <span className={styles.doiTuongEmoji}>🎓</span>
                        <span>Học sinh, sinh viên, học viên</span>
                      </div>
                      <div className={styles.doiTuongItem}>
                        <span className={styles.doiTuongEmoji}>👨‍🏫</span>
                        <span>Cán bộ, giảng viên, viên chức</span>
                      </div>
                      <div className={styles.doiTuongItem}>
                        <span className={styles.doiTuongEmoji}>🏫</span>
                        <span>Các đơn vị trực thuộc ĐH Trà Vinh</span>
                      </div>
                      <div className={styles.doiTuongItem}>
                        <span className={styles.doiTuongEmoji}>🔬</span>
                        <span>Nhà khoa học phục vụ chiến lược phát triển</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 6. Hình thức hỗ trợ */}
                <div className={styles.dieuLeCard}>
                  <div className={styles.dieuLeCardHeader}>
                    <span className={styles.dieuLeNumber}>06</span>
                    <div className={styles.dieuLeCardTitle}>
                      <HiOutlineHeart size={20} />
                      <h4>Hình thức hỗ trợ</h4>
                    </div>
                  </div>
                  <div className={styles.dieuLeCardBody}>
                    <div className={styles.hinhThucGrid}>
                      <div className={`${styles.hinhThucItem} ${styles.hinhThucKhongHoan}`}>
                        <div className={styles.hinhThucBadge}>🎁</div>
                        <h5>Tài trợ không hoàn lại</h5>
                        <p>Áp dụng đối với các hoạt động giáo dục, đào tạo, nghiên cứu khoa học, phát triển cơ sở vật chất, tổ chức hội nghị, hội thảo và các nhiệm vụ phục vụ sự phát triển của Đại học Trà Vinh.</p>
                      </div>
                      <div className={`${styles.hinhThucItem} ${styles.hinhThucCoThuHoi}`}>
                        <div className={styles.hinhThucBadge}>🔄</div>
                        <h5>Tài trợ có thu hồi một phần</h5>
                        <p>Áp dụng đối với các dự án nghiên cứu, chuyển giao công nghệ, thương mại hóa kết quả nghiên cứu và các dự án có khả năng tạo nguồn thu để hoàn trả một phần kinh phí.</p>
                      </div>
                      <div className={`${styles.hinhThucItem} ${styles.hinhThucChoVay}`}>
                        <div className={styles.hinhThucBadge}>💰</div>
                        <h5>Cho vay vốn</h5>
                        <p>Quỹ xem xét cho vay vốn không lãi hoặc với mức lãi suất ưu đãi để hoàn thiện công nghệ, sản phẩm, ứng dụng kết quả nghiên cứu, chuyển giao công nghệ, thương mại hóa sản phẩm khoa học công nghệ.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 7. Điều kiện xét hỗ trợ */}
                <div className={styles.dieuLeCard}>
                  <div className={styles.dieuLeCardHeader}>
                    <span className={styles.dieuLeNumber}>07</span>
                    <div className={styles.dieuLeCardTitle}>
                      <HiOutlineDocumentCheck size={20} />
                      <h4>Điều kiện xét hỗ trợ</h4>
                    </div>
                  </div>
                  <div className={styles.dieuLeCardBody}>
                    <ul className={styles.dieuLeList}>
                      <li>Có đơn đề nghị theo mẫu.</li>
                      <li>Cung cấp đầy đủ hồ sơ, tài liệu và minh chứng theo yêu cầu.</li>
                      <li>Được Hội đồng chuyên môn thẩm định và Hội đồng Quỹ xem xét trước khi quyết định hỗ trợ.</li>
                      <li>Thực hiện đúng nội dung đã cam kết trong hồ sơ và hợp đồng với Quỹ.</li>
                    </ul>
                  </div>
                </div>

                {/* 8. Trách nhiệm */}
                <div className={styles.dieuLeCard}>
                  <div className={styles.dieuLeCardHeader}>
                    <span className={styles.dieuLeNumber}>08</span>
                    <div className={styles.dieuLeCardTitle}>
                      <HiOutlineExclamationTriangle size={20} />
                      <h4>Trách nhiệm của đơn vị, cá nhân được hỗ trợ</h4>
                    </div>
                  </div>
                  <div className={styles.dieuLeCardBody}>
                    <ul className={styles.dieuLeList}>
                      <li>Sử dụng kinh phí đúng mục đích.</li>
                      <li>Thực hiện đầy đủ nghĩa vụ báo cáo và nghiệm thu theo quy định.</li>
                      <li>Hoàn trả kinh phí đối với các khoản vay hoặc tài trợ có thu hồi theo đúng hợp đồng đã ký.</li>
                      <li>Trường hợp vi phạm nghĩa vụ hoàn trả sẽ phải chịu các chế tài theo quy định của pháp luật và Điều lệ Quỹ.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TỔ CHỨC NHÂN SỰ */}
          {activeTab === TABS.NHAN_SU && (
            <div className={styles.tabContent}>
              <div className={styles.sectionHeader}>
                <h3>Tổ chức nhân sự Quỹ Phát triển Đại học Trà Vinh</h3>
                <p>Những con người cống hiến hết mình vì sự phát triển của thế hệ trẻ</p>
              </div>
              {chucVuLoading ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>Đang tải...</div>
              ) : Object.keys(chucVuData).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>Chưa có thông tin nhân sự</div>
              ) : (
                Object.entries(chucVuData).map(([nhom, members]) => (
                  <div key={nhom} style={{ marginBottom: '2rem' }}>
                    <h4 style={{ color: '#1a237e', marginBottom: '1rem', borderBottom: '2px solid #e8eaf6', paddingBottom: '0.5rem' }}>
                      {nhom === 'Hoi dong quy' ? 'Hội đồng Quỹ' :
                       nhom === 'Ban dieu hanh' ? 'Ban Điều hành' :
                       nhom === 'Ban kiem soat' ? 'Ban Kiểm soát' :
                       'Văn phòng Thường trực'}
                    </h4>
                    <div className={styles.tableWrapper}>
                      <table className={styles.staffTable}>
                        <thead>
                          <tr>
                            <th>Họ tên</th>
                            <th>Chức danh</th>
                            <th>Nhiệm kỳ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {members.map((member) => (
                            <tr key={member.id}>
                              <td className={styles.staffName}>{member.hoTen}</td>
                              <td className={styles.staffRoleCell}>{member.chucDanh}</td>
                              <td>
                                {member.ngayBatDauNhiemKy
                                  ? `${new Date(member.ngayBatDauNhiemKy).getFullYear()}${member.ngayKetThucNhiemKy ? ` - ${new Date(member.ngayKetThucNhiemKy).getFullYear()}` : ' - nay'}`
                                  : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: BÁO CÁO HOẠT ĐỘNG */}
          {activeTab === TABS.BAO_CAO && (
            <div className={styles.tabContent}>
              <div className={styles.sectionHeader}>
                <h3>Báo Cáo Tài Chính & Hoạt Động Thường Niên</h3>
                <p>Minh bạch số liệu và kết quả đạt được của Quỹ qua các năm</p>
              </div>

              {loadingReports ? (
                <div className={styles.grid}>
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div key={`skeleton-${idx}`} className={styles.skeletonCard}>
                      <div className={styles.skeletonImage} />
                      <div className={styles.skeletonBody}>
                        <div className={styles.skeletonTag} />
                        <div className={styles.skeletonTitle} />
                        <div className={styles.skeletonDesc} />
                        <div className={styles.skeletonMeta} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : reports.length === 0 ? (
                <div className={styles.emptyState}>
                  <HiOutlineFolderOpen className={styles.emptyIcon} />
                  <p>Không có bài báo cáo nào được tìm thấy.</p>
                </div>
              ) : (
                <>
                  <div className={styles.grid}>
                    {reports.map((item) => (
                      <article 
                        key={item.id} 
                        className={styles.card} 
                        onClick={() => navigate(`/news/${item.id}`)}
                      >
                        <div className={styles.cardImageWrapper}>
                          {item.avatar ? (
                            <img 
                              src={item.avatar} 
                              alt={item.title} 
                              className={styles.cardImage}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=800&auto=format&fit=crop';
                              }}
                            />
                          ) : (
                            <div className={styles.imagePlaceholder}>
                              <HiOutlineBookOpen className={styles.placeholderIcon} />
                            </div>
                          )}
                          <span className={styles.cardBadge}>
                            Báo cáo
                          </span>
                        </div>

                        <div className={styles.cardContent}>
                          <h4 className={styles.cardTitle} title={item.title}>
                            {item.title}
                          </h4>
                          <p className={styles.cardDesc}>
                            {item.summary || 'Nhấp vào để xem chi tiết bài viết này.'}
                          </p>
                          <div className={styles.cardMeta}>
                            <span className={styles.metaItem}>
                              <HiOutlineCalendarDays className={styles.metaIcon} size={14} />
                              {formatDate(item.publishDate || item.createdAt)}
                            </span>
                            <span className={styles.readMore}>
                              Chi tiết <HiOutlineChevronRight className={styles.readMoreIcon} size={14} />
                            </span>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>

                  {/* Phân trang */}
                  {Math.ceil(totalReports / reportsLimit) > 1 && (
                    <div className={styles.pagination}>
                      <button
                        className={styles.pagBtn}
                        disabled={reportsPage <= 1}
                        onClick={() => {
                          setReportsPage(prev => prev - 1);
                          window.scrollTo({ top: 400, behavior: 'smooth' });
                        }}
                        aria-label="Trang trước"
                      >
                        <HiOutlineChevronLeft size={16} />
                        <span>Trước</span>
                      </button>
                      <div className={styles.pagPages}>
                        {Array.from({ length: Math.ceil(totalReports / reportsLimit) }).map((_, i) => {
                          const pageNum = i + 1;
                          return (
                            <button
                              key={pageNum}
                              className={`${styles.pagNumBtn} ${reportsPage === pageNum ? styles.active : ''}`}
                              onClick={() => {
                                setReportsPage(pageNum);
                                window.scrollTo({ top: 400, behavior: 'smooth' });
                              }}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      <button
                        className={styles.pagBtn}
                        disabled={reportsPage >= Math.ceil(totalReports / reportsLimit)}
                        onClick={() => {
                          setReportsPage(prev => prev + 1);
                          window.scrollTo({ top: 400, behavior: 'smooth' });
                        }}
                        aria-label="Trang sau"
                      >
                        <span>Tiếp</span>
                        <HiOutlineChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* TAB 4: CÁC CHƯƠNG TRÌNH TRIỂN KHAI */}
          {activeTab === TABS.CHUONG_TRINH && (
            <div className={styles.tabContent}>
              <div className={styles.sectionHeader}>
                <h3>Các Chương Trình Đang Triển Khai</h3>
                <p>Khám phá các học bổng và quỹ hỗ trợ đang mở tiếp nhận đơn xét duyệt</p>
              </div>

              {loadingPrograms ? (
                <div className={styles.grid}>
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div key={`skeleton-${idx}`} className={styles.skeletonCard}>
                      <div className={styles.skeletonImage} />
                      <div className={styles.skeletonBody}>
                        <div className={styles.skeletonTag} />
                        <div className={styles.skeletonTitle} />
                        <div className={styles.skeletonDesc} />
                        <div className={styles.skeletonMeta} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : programs.length === 0 ? (
                <div className={styles.emptyState}>
                  <HiOutlineFolderOpen className={styles.emptyIcon} />
                  <p>Không có chương trình nào được tìm thấy.</p>
                </div>
              ) : (
                <>
                  <div className={styles.grid}>
                    {programs.map((item) => (
                      <article 
                        key={item.id} 
                        className={styles.card} 
                        onClick={() => navigate(`/news/${item.id}`)}
                      >
                        <div className={styles.cardImageWrapper}>
                          {item.avatar ? (
                            <img 
                              src={item.avatar} 
                              alt={item.title} 
                              className={styles.cardImage}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=800&auto=format&fit=crop';
                              }}
                            />
                          ) : (
                            <div className={styles.imagePlaceholder}>
                              <HiOutlineBookOpen className={styles.placeholderIcon} />
                            </div>
                          )}
                          <span className={styles.cardBadge}>
                            Chương trình
                          </span>
                        </div>

                        <div className={styles.cardContent}>
                          <h4 className={styles.cardTitle} title={item.title}>
                            {item.title}
                          </h4>
                          <p className={styles.cardDesc}>
                            {item.summary || 'Nhấp vào để xem chi tiết bài viết này.'}
                          </p>
                          <div className={styles.cardMeta}>
                            <span className={styles.metaItem}>
                              <HiOutlineCalendarDays className={styles.metaIcon} size={14} />
                              {formatDate(item.publishDate || item.createdAt)}
                            </span>
                            <span className={styles.readMore}>
                              Chi tiết <HiOutlineChevronRight className={styles.readMoreIcon} size={14} />
                            </span>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>

                  {/* Phân trang */}
                  {Math.ceil(totalPrograms / programsLimit) > 1 && (
                    <div className={styles.pagination}>
                      <button
                        className={styles.pagBtn}
                        disabled={programsPage <= 1}
                        onClick={() => {
                          setProgramsPage(prev => prev - 1);
                          window.scrollTo({ top: 400, behavior: 'smooth' });
                        }}
                        aria-label="Trang trước"
                      >
                        <HiOutlineChevronLeft size={16} />
                        <span>Trước</span>
                      </button>
                      <div className={styles.pagPages}>
                        {Array.from({ length: Math.ceil(totalPrograms / programsLimit) }).map((_, i) => {
                          const pageNum = i + 1;
                          return (
                            <button
                              key={pageNum}
                              className={`${styles.pagNumBtn} ${programsPage === pageNum ? styles.active : ''}`}
                              onClick={() => {
                                setProgramsPage(pageNum);
                                window.scrollTo({ top: 400, behavior: 'smooth' });
                              }}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      <button
                        className={styles.pagBtn}
                        disabled={programsPage >= Math.ceil(totalPrograms / programsLimit)}
                        onClick={() => {
                          setProgramsPage(prev => prev + 1);
                          window.scrollTo({ top: 400, behavior: 'smooth' });
                        }}
                        aria-label="Trang sau"
                      >
                        <span>Tiếp</span>
                        <HiOutlineChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

        </div>
      </main>

      <PublicFooter />

      {/* Login Modal */}
      {isLoginModalOpen && (
        <div className="login-modal-overlay" onClick={closeLoginModal}>
          <div className="login-modal-content" onClick={(e) => e.stopPropagation()}>
            <LoginForm 
              onSuccess={closeLoginModal}
              onClose={closeLoginModal}
              onSwitchToRegister={switchToRegister}
            />
          </div>
        </div>
      )}

      {/* Register Modal */}
      {isRegisterModalOpen && (
        <div className="register-modal-overlay" onClick={closeRegisterModal}>
          <div className="register-modal-content" onClick={(e) => e.stopPropagation()}>
            <RegisterForm 
              onSuccess={closeRegisterModal}
              onClose={closeRegisterModal}
              onSwitchToLogin={switchToLogin}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AboutFundPage;
