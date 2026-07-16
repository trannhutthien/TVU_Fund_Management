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
  HiOutlineCalendarDays
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
