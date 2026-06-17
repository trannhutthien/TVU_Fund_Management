import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  HiOutlineArrowLeft,
  HiOutlineArrowRight,
  HiOutlineBanknotes,
  HiOutlineCalendar,
  HiOutlineClipboardDocumentList,
  HiOutlineCurrencyDollar,
  HiOutlineDocumentText,
  HiOutlineExclamationCircle,
  HiOutlineInformationCircle,
  HiOutlineShare,
  HiOutlineUsers,
} from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import { StatCard } from '@components/common/Card';
import BackgroundImage from '@components/common/BackgroundImage/BackgroundImage';
import FundBankInfo from '@components/common/FundBankInfo';
import SocialLinks from '@components/common/SocialLinks';
import StatusBadge from '@components/common/StatusBadge/StatusBadge';
import Table from '@components/common/Table';
import { getFundById } from '@services/fundService';
import {
  DEFAULT_PUBLIC_SETTINGS,
  systemSettingsService,
  toFundBankAccount,
} from '@services/systemSettingsService';
import styles from './FundDetailPage.module.scss';

const API_BASE = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'
).replace(/\/api\/?$/, '');

const normalizeNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const buildImageUrl = (path) => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE}/${path.replace(/^\//, '')}`;
};

const formatMoney = (value, emptyText = 'Không giới hạn') => {
  if (value === null || value === undefined || value === '') return emptyText;
  return `${normalizeNumber(value).toLocaleString('vi-VN')} đồng`;
};

const formatCompactMoney = (value) => {
  if (value === null || value === undefined || value === '') return 'Không giới hạn';

  const amount = normalizeNumber(value);
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(amount % 1000000000 === 0 ? 0 : 1)} tỷ đồng`;
  }
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(amount % 1000000 === 0 ? 0 : 1)} triệu đồng`;
  }

  return formatMoney(amount);
};

const formatDate = (dateString) => {
  if (!dateString) return 'Không xác định';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'Không xác định';
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const getStatusInfo = (status) => {
  const statusMap = {
    'Dang hoat dong': { variant: 'success', label: 'Đang hoạt động' },
    'Tam dung': { variant: 'warning', label: 'Tạm dừng' },
    'Da dong': { variant: 'danger', label: 'Đã đóng' },
    'Cho duyet': { variant: 'warning', label: 'Chờ duyệt' },
    'Da duyet': { variant: 'info', label: 'Đã duyệt' },
    'Da nhan': { variant: 'success', label: 'Đã nhận' },
    'Tu choi': { variant: 'danger', label: 'Từ chối' },
    'Da giai ngan': { variant: 'success', label: 'Đã giải ngân' },
  };

  return statusMap[status] || { variant: 'default', label: status || 'Chưa xác định' };
};

const pickArray = (fund, keys) => {
  for (const key of keys) {
    if (Array.isArray(fund?.[key])) return fund[key];
  }
  return [];
};

const getFundTypeName = (fund) => (
  fund?.loaiquy?.tenLoai ||
  fund?.loaiquy?.tenloai ||
  fund?.loaiQuyTen ||
  fund?.tenLoaiQuy ||
  fund?.loaiQuy ||
  'Loại quỹ'
);

const getDonationName = (donation) => (
  donation.tenNhaTaiTro ||
  donation.ten_nha_tai_tro ||
  donation.tennhataitro ||
  donation.hoTen ||
  donation.ho_ten ||
  'Nhà tài trợ'
);

const getDonationAmount = (donation) => (
  donation.soTien ?? donation.so_tien ?? donation.sotien
);

const getDonationDate = (donation) => (
  donation.ngayTaiTro || donation.ngay_tai_tro || donation.ngaytaitro || donation.ngayTao || donation.ngaytao
);

const getDonationStatus = (donation) => (
  donation.trangThai || donation.trang_thai || donation.trangthai
);

const getApplicationStudentName = (application) => (
  application.hoTenSinhVien ||
  application.hotenSinhVien ||
  application.nguoiNopHoTen ||
  application.nguoi_nop_ho_ten ||
  application.hoten_sinhvien ||
  application.hoten ||
  'Sinh viên'
);

const getApplicationAmount = (application) => (
  application.soTienDeNghi ?? application.so_tien_de_nghi ?? application.sotiendenghi
);

const getApplicationStatus = (application) => (
  application.trangThai || application.trang_thai || application.trangthai
);

const getApplicationDate = (application) => (
  application.ngayNop || application.ngay_nop || application.ngaynop
);

const SectionCard = ({ title, icon, children, className = '' }) => (
  <section className={`${styles.card} ${className}`}>
    <h2 className={styles.cardTitle}>
      {icon}
      <span>{title}</span>
    </h2>
    {children}
  </section>
);

const FundDetailSkeleton = () => (
  <div className={styles.page}>
    <div className={styles.skeletonBanner}>
      <div className={styles.container}>
        <div className={`${styles.skeletonLine} ${styles.skeletonBreadcrumb}`} />
        <div className={`${styles.skeletonLine} ${styles.skeletonBadge}`} />
        <div className={`${styles.skeletonLine} ${styles.skeletonTitle}`} />
      </div>
    </div>

    <div className={styles.container}>
      <div className={styles.skeletonStats}>
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className={styles.skeletonStatCard}>
            <div className={styles.skeletonIcon} />
            <div className={styles.skeletonTextGroup}>
              <div className={styles.skeletonLine} />
              <div className={`${styles.skeletonLine} ${styles.skeletonShort}`} />
            </div>
          </div>
        ))}
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.leftColumn}>
          {[1, 2, 3].map((item) => (
            <div key={item} className={styles.card}>
              <div className={`${styles.skeletonLine} ${styles.skeletonHeading}`} />
              <div className={styles.skeletonParagraph} />
              <div className={styles.skeletonParagraphShort} />
            </div>
          ))}
        </div>
        <div className={styles.rightColumn}>
          {[1, 2, 3].map((item) => (
            <div key={item} className={styles.card}>
              <div className={`${styles.skeletonLine} ${styles.skeletonHeading}`} />
              <div className={styles.skeletonParagraphShort} />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const FundDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fund, setFund] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [publicSettings, setPublicSettings] = useState(DEFAULT_PUBLIC_SETTINGS);

  useEffect(() => {
    let isMounted = true;

    const fetchFundDetail = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await getFundById(id);
        if (!isMounted) return;

        if (response?.success && response?.fund) {
          setFund(response.fund);
        } else {
          setFund(null);
          setError(response?.message || 'Không tìm thấy thông tin quỹ.');
        }
      } catch (fetchError) {
        if (!isMounted) return;
        console.error('Error fetching fund detail:', fetchError);
        setFund(null);
        setError(
          fetchError?.response?.data?.message ||
          fetchError?.message ||
          'Không thể tải thông tin quỹ. Vui lòng thử lại sau.'
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (id) {
      fetchFundDetail();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    let isMounted = true;

    systemSettingsService.getPublicSettings()
      .then((settings) => {
        if (isMounted) setPublicSettings(settings);
      })
      .catch((settingsError) => {
        console.error('Error fetching public system settings:', settingsError);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const normalized = useMemo(() => {
    if (!fund) return null;

    const donations = pickArray(fund, ['khoantaitro', 'khoanTaiTro', 'donations']);
    const applications = pickArray(fund, ['yeucauhotro', 'yeuCauHoTro', 'applications']);
    const bankAccounts = pickArray(fund, ['bankAccounts', 'taiKhoanNganHang', 'taikhoannganhang']);
    const goalAmount = normalizeNumber(fund.soTienMucTieu ?? fund.sotienmuctieu);
    const currentBalance = normalizeNumber(fund.soDu ?? fund.sodu);
    const progressPercent = goalAmount > 0
      ? Math.min(Math.round((currentBalance / goalAmount) * 100), 100)
      : 0;
    const disbursedApplications = applications
      .filter((application) => getApplicationStatus(application) === 'Da giai ngan')
      .sort((a, b) => new Date(getApplicationDate(b) || 0) - new Date(getApplicationDate(a) || 0));

    return {
      id: fund.quyId ?? fund.quy_id ?? id,
      name: fund.tenQuy ?? fund.tenquy ?? 'Quỹ hỗ trợ',
      typeName: getFundTypeName(fund),
      status: fund.trangThai ?? fund.trangthai,
      imageUrl: buildImageUrl(fund.hinhAnh ?? fund.hinhanh),
      description: fund.moTa ?? fund.mota,
      supportConditions: fund.dieuKienTomTat ?? fund.dieukienhotro,
      goalAmount,
      currentBalance,
      progressPercent,
      maxSupportAmount: fund.soTienHoTroToiDa ?? fund.sotienhotrotoida,
      maxSupportCount: fund.soLuongChiTieu ?? fund.soluonghotrotoida,
      startDate: fund.ngayBatDau ?? fund.ngaybatdau,
      endDate: fund.ngayKetThuc ?? fund.ngayketthuc ?? fund.hanNopDon,
      donations,
      applications,
      recentDonations: donations
        .slice()
        .sort((a, b) => new Date(getDonationDate(b) || 0) - new Date(getDonationDate(a) || 0))
        .slice(0, 6),
      disbursedApplications: disbursedApplications.slice(0, 5),
      bankAccount: bankAccounts[0] || null,
    };
  }, [fund, id]);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const fallbackBankAccount = toFundBankAccount(publicSettings.tai_khoan_nhan_tai_tro);
  const hasFallbackBankAccount = !!(
    fallbackBankAccount.nganHang &&
    fallbackBankAccount.soTaiKhoan &&
    fallbackBankAccount.chuTaiKhoan
  );
  const contactEmail = publicSettings.email_ho_tro || publicSettings.email_lien_he;

  const handleApplyClick = () => {
    if (!normalized) return;
    navigate('/apply?role=student', {
      state: {
        quy_id: normalized.id,
        quyId: normalized.id,
        fundId: normalized.id,
        role: 'student',
      },
    });
  };

  const handleSponsorClick = () => {
    if (!normalized) return;
    navigate('/apply?role=sponsor', {
      state: {
        quy_id: normalized.id,
        quyId: normalized.id,
        fundId: normalized.id,
        role: 'sponsor',
        guestRole: 'donor',
      },
    });
  };

  const applicationColumns = [
    {
      key: 'studentName',
      label: 'Họ tên sinh viên',
      render: (_, row) => row.studentName,
    },
    {
      key: 'amount',
      label: 'Số tiền đề nghị',
      render: (_, row) => formatMoney(row.amount, '0 đồng'),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (_, row) => {
        const statusInfo = getStatusInfo(row.status);
        return (
          <StatusBadge
            variant={statusInfo.variant}
            label={statusInfo.label}
            showIcon={false}
            size="sm"
          />
        );
      },
    },
    {
      key: 'submittedAt',
      label: 'Ngày nộp',
      render: (_, row) => formatDate(row.submittedAt),
    },
  ];

  if (loading) {
    return <FundDetailSkeleton />;
  }

  if (error || !normalized) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <section className={styles.errorState}>
            <StatusBadge variant="danger" label="Không tìm thấy hoặc lỗi" showIcon={false} />
            <HiOutlineExclamationCircle className={styles.errorIcon} />
            <h1>Không thể hiển thị chi tiết quỹ</h1>
            <p>{error || 'Không tìm thấy thông tin quỹ phù hợp.'}</p>
            <Button variant="secondary" size="lg" onClick={() => navigate('/funds')}>
              Về trang danh sách quỹ
            </Button>
          </section>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(normalized.status);
  const isActive = normalized.status === 'Dang hoat dong';
  const applicationRows = normalized.disbursedApplications.map((application) => ({
    id: application.yeuCauHoTroId || application.yeucauhotro_id,
    studentName: getApplicationStudentName(application),
    amount: getApplicationAmount(application),
    status: getApplicationStatus(application),
    submittedAt: getApplicationDate(application),
  }));
  const shareLinks = [
    {
      type: 'facebook',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
      label: 'Facebook',
    },
    {
      type: 'copy',
      url: currentUrl,
      label: 'Copy link',
    },
  ];

  return (
    <div className={styles.page}>
      <BackgroundImage
        className={styles.banner}
        overlayType="dark"
        imageUrl={normalized.imageUrl}
      >
        <div className={styles.bannerContent}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link to="/" className={styles.breadcrumbLink}>Trang chủ</Link>
            <span className={styles.breadcrumbSep}>→</span>
            <Link to="/funds" className={styles.breadcrumbLink}>Danh mục quỹ</Link>
            <span className={styles.breadcrumbSep}>→</span>
            <span className={styles.breadcrumbCurrent}>{normalized.name}</span>
          </nav>

          <div className={styles.bannerInfo}>
            <StatusBadge
              variant="info"
              label={normalized.typeName}
              showIcon={false}
              size="md"
              className={styles.typeBadge}
            />
            <h1 className={styles.bannerTitle}>{normalized.name}</h1>
            <StatusBadge
              variant={statusInfo.variant}
              label={statusInfo.label}
              showIcon
              size="lg"
              glow={isActive}
            />
          </div>
        </div>
      </BackgroundImage>

      <section className={styles.statsBar}>
        <div className={styles.container}>
          <div className={styles.statsGrid}>
            <StatCard
              title="Số tiền mục tiêu"
              value={formatCompactMoney(normalized.goalAmount)}
              icon={<HiOutlineBanknotes />}
              iconBgColor="blue"
              className={styles.statsCard}
            />
            <StatCard
              title="Số dư hiện tại"
              value={formatCompactMoney(normalized.currentBalance)}
              icon={<HiOutlineCurrencyDollar />}
              iconBgColor="green"
              className={styles.statsCard}
            />
            <StatCard
              title="Khoản tài trợ đã nhận"
              value={normalized.donations.length || fund.soKhoanTaiTro || 0}
              icon={<HiOutlineUsers />}
              iconBgColor="purple"
              className={styles.statsCard}
            />
            <StatCard
              title="Đơn đã hỗ trợ"
              value={normalized.applications.length || fund.soDonDaHoTro || 0}
              icon={<HiOutlineDocumentText />}
              iconBgColor="teal"
              className={styles.statsCard}
            />
          </div>
        </div>
      </section>

      <main className={styles.container}>
        <div className={styles.mainGrid}>
          <div className={styles.leftColumn}>
            <SectionCard title="Tiến trình quyên góp" icon={<HiOutlineCurrencyDollar />}>
              <div className={styles.progressHeader}>
                <span>{normalized.progressPercent}%</span>
                <span>mục tiêu</span>
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${normalized.progressPercent}%` }}
                />
              </div>
              <div className={styles.progressMeta}>
                <span>Đã đạt: {formatMoney(normalized.currentBalance, '0 đồng')}</span>
                <span>Mục tiêu: {formatMoney(normalized.goalAmount)}</span>
              </div>
            </SectionCard>

            <SectionCard title="Giới thiệu về quỹ" icon={<HiOutlineInformationCircle />}>
              <p className={styles.richText}>
                {normalized.description || 'Quỹ chưa cập nhật mô tả chi tiết.'}
              </p>
            </SectionCard>

            <SectionCard title="Điều kiện xét duyệt" icon={<HiOutlineClipboardDocumentList />}>
              <p className={styles.richText}>
                {normalized.supportConditions || 'Quỹ chưa cập nhật điều kiện xét duyệt.'}
              </p>
              <div className={styles.supportFacts}>
                <div>
                  <span>Hỗ trợ tối đa</span>
                  <strong>{formatMoney(normalized.maxSupportAmount)}</strong>
                </div>
                <div>
                  <span>Số lượng tối đa</span>
                  <strong>
                    {normalized.maxSupportCount ? `${normalized.maxSupportCount} suất` : 'Không giới hạn'}
                  </strong>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Thời gian" icon={<HiOutlineCalendar />}>
              <div className={styles.timeline}>
                <div>
                  <span>Ngày bắt đầu</span>
                  <strong>{formatDate(normalized.startDate)}</strong>
                </div>
                <div>
                  <span>Ngày kết thúc</span>
                  <strong>{formatDate(normalized.endDate)}</strong>
                </div>
              </div>
            </SectionCard>
          </div>

          <aside className={styles.rightColumn}>
            <section className={`${styles.card} ${styles.ctaCard} ${isActive ? styles.ctaActive : ''}`}>
              {isActive ? (
                <>
                  <h2>Bạn muốn nhận hỗ trợ?</h2>
                  <p>Hoàn thiện hồ sơ đề nghị hỗ trợ để cán bộ quỹ xét duyệt theo điều kiện của quỹ.</p>
                  <div className={styles.ctaActions}>
                    <Button variant="primary" size="md" className={styles.navyButton} onClick={handleApplyClick}>
                      Nộp đơn ngay
                    </Button>
                    <Button variant="secondary" size="md" onClick={() => navigate('/guidelines')}>
                      Xem hướng dẫn
                    </Button>
                  </div>
                </>
              ) : (
                <div className={styles.closedNotice}>
                  <StatusBadge variant={statusInfo.variant} label={statusInfo.label} showIcon={false} />
                  <p>Quỹ hiện không nhận đơn.</p>
                </div>
              )}
            </section>

            <section className={`${styles.card} ${styles.ctaCard}`}>
              <h2>Bạn muốn đồng hành?</h2>
              <p>Đóng góp cho quỹ để hỗ trợ thêm sinh viên có hoàn cảnh cần được tiếp sức.</p>
              <div className={styles.ctaActions}>
                <Button variant="primary" size="md" className={styles.navyButton} onClick={handleSponsorClick}>
                  Đóng góp ngay
                </Button>
                <Button variant="secondary" size="md" onClick={() => navigate('/guidelines')}>
                  Xem hướng dẫn
                </Button>
              </div>
            </section>

            <section className={`${styles.card} ${styles.bankCard}`}>
              {normalized.bankAccount || hasFallbackBankAccount ? (
                <FundBankInfo
                  bankAccount={normalized.bankAccount || fallbackBankAccount}
                  fundName={normalized.name}
                />
              ) : (
                <div className={styles.contactFallback}>
                  <HiOutlineBanknotes className={styles.contactIcon} />
                  <h2>Thông tin liên hệ</h2>
                  <p>Quỹ chưa cập nhật tài khoản ngân hàng nhận tài trợ.</p>
                  <dl>
                    <div>
                      <dt>Đơn vị</dt>
                      <dd>{publicSettings.don_vi_quan_ly}</dd>
                    </div>
                    <div>
                      <dt>Điện thoại</dt>
                      <dd>{publicSettings.so_dien_thoai}</dd>
                    </div>
                    <div>
                      <dt>Email</dt>
                      <dd>{contactEmail}</dd>
                    </div>
                    <div>
                      <dt>Địa chỉ</dt>
                      <dd>{publicSettings.dia_chi_lien_he}</dd>
                    </div>
                  </dl>
                </div>
              )}
            </section>

            <SectionCard title="Chia sẻ quỹ này" icon={<HiOutlineShare />}>
              <SocialLinks
                links={shareLinks}
                size="md"
                variant="rounded"
                color="brand"
                showLabel
                className={styles.shareLinks}
              />
            </SectionCard>
          </aside>
        </div>

        <section className={styles.fullWidthSection}>
          <div className={styles.sectionHeader}>
            <h2>Nhà tài trợ đồng hành</h2>
            <span>Tối đa 6 khoản gần nhất</span>
          </div>

          {normalized.recentDonations.length > 0 ? (
            <div className={styles.donorGrid}>
              {normalized.recentDonations.map((donation, index) => {
                const donationStatus = getStatusInfo(getDonationStatus(donation));
                return (
                  <article
                    key={donation.khoanTaiTroId || donation.khoantaitro_id || index}
                    className={styles.donorCard}
                  >
                    <div>
                      <h3>{getDonationName(donation)}</h3>
                      <p>{formatDate(getDonationDate(donation))}</p>
                    </div>
                    <strong>{formatMoney(getDonationAmount(donation), '0 đồng')}</strong>
                    <StatusBadge
                      variant={donationStatus.variant}
                      label={donationStatus.label}
                      showIcon={false}
                      size="sm"
                    />
                  </article>
                );
              })}
            </div>
          ) : (
            <div className={styles.emptyState}>
              Chưa có nhà tài trợ - Hãy là người đầu tiên đồng hành!
            </div>
          )}
        </section>

        <section className={styles.fullWidthSection}>
          <div className={styles.sectionHeader}>
            <h2>Sinh viên được hỗ trợ gần đây</h2>
            <span>Chỉ hiển thị đơn đã giải ngân</span>
          </div>

          <Table
            columns={applicationColumns}
            data={applicationRows}
            pagination={false}
            size="md"
            emptyText="Chưa có sinh viên được hỗ trợ công khai."
          />
        </section>

        <div className={styles.bottomActions}>
          <Button
            variant="secondary"
            size="lg"
            leftIcon={<HiOutlineArrowLeft />}
            onClick={() => navigate('/funds')}
          >
            Quay lại danh sách quỹ
          </Button>
          <Button
            variant="primary"
            size="lg"
            rightIcon={<HiOutlineArrowRight />}
            className={styles.navyButton}
            disabled={!isActive}
            onClick={handleApplyClick}
          >
            Nộp đơn ngay
          </Button>
        </div>
      </main>
    </div>
  );
};

export default FundDetailPage;
