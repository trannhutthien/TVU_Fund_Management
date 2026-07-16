import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Spin, Timeline, Alert, Result, Form, Typography, Space } from 'antd';
import { SearchOutlined, CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import Input from '@components/common/Input/Input';
import { toast } from 'react-toastify';
import PublicHeader from '@components/layout/PublicHeader/PublicHeader';
import PublicFooter from '@components/layout/PublicFooter/PublicFooter';
import BackgroundImage from '@components/common/BackgroundImage';
import ApplicationStatusStepper from '@components/common/ApplicationStatusStepper/ApplicationStatusStepper';
import { guestService } from '@services/guestService';
import { formatCurrency } from '@utils/formatters';
import LoginForm from '@components/forms/LoginForm';
import RegisterForm from '@components/forms/RegisterForm';
import styles from './TrackPage.module.scss';

const { Title, Text, Paragraph } = Typography;

const TrackPage = () => {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const [searchUuid, setSearchUuid] = useState(uuid || '');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  
  // OTP Verification state
  const [otpLoading, setOtpLoading] = useState(false);
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [tempCredentials, setTempCredentials] = useState(null);

  // Modal overlay state
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

  // Normalize status for support application
  const normalizeAppStatus = (status) => {
    const statusMap = {
      'Cho duyet cap 1': 'CHO_DUYET',
      'Da duyet cap 1': 'DANG_XU_LY',
      'Tu choi cap 1': 'TU_CHOI',
      'Cho duyet cap 2': 'DANG_XU_LY',
      'Da duyet cap 2': 'DANG_XU_LY',
      'Tu choi cap 2': 'TU_CHOI',
      'Cho duyet cap 3': 'DANG_XU_LY',
      'Da duyet cap 3': 'CHO_GIAI_NGAN',
      'Tu choi cap 3': 'TU_CHOI',
      'Cho giai ngan': 'CHO_GIAI_NGAN',
      'Da giai ngan': 'DA_GIAI_NGAN',
      'Tu choi': 'TU_CHOI',
      'Cho duyet': 'CHO_DUYET',
      'Dang xu ly': 'DANG_XU_LY',
    };
    return statusMap[status] || 'CHO_DUYET';
  };

  const handleFetchStatus = async (queryUuid) => {
    if (!queryUuid || queryUuid.trim() === '') return;
    setLoading(true);
    setError('');
    setData(null);
    setShowOtpForm(false);
    setTempCredentials(null);

    try {
      const response = await guestService.trackStatus(queryUuid.trim());
      if (response.success) {
        setData(response.data);
        if (response.data.stagingStatus === 'CHO_XAC_MINH') {
          setShowOtpForm(true);
        }
      } else {
        setError(response.message || 'Không tìm thấy thông tin mã tra cứu này.');
      }
    } catch (err) {
      console.error('Track error:', err);
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tra cứu. Vui lòng kiểm tra lại mã UUID.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (uuid) {
      handleFetchStatus(uuid);
    }
  }, [uuid]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (isLoginModalOpen) {
          closeLoginModal();
        }
        if (isRegisterModalOpen) {
          closeRegisterModal();
        }
      }
    };

    if (isLoginModalOpen || isRegisterModalOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isLoginModalOpen, isRegisterModalOpen]);

  const handleSearch = () => {
    if (!searchUuid || searchUuid.trim() === '') {
      toast.warning('Vui lòng nhập mã UUID tra cứu');
      return;
    }
    navigate(`/track/${searchUuid.trim()}`);
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.trim().length !== 6 || isNaN(otpCode)) {
      toast.error('Mã OTP phải gồm 6 chữ số');
      return;
    }

    try {
      setOtpLoading(true);
      const payload = {
        email: data.email,
        otpCode: otpCode.trim(),
        type: data.type
      };

      const response = await guestService.verifyOtp(payload);
      if (response.success) {
        toast.success('Xác thực OTP thành công!');
        setTempCredentials({
          email: response.data.email,
          tempPassword: response.data.tempPassword
        });
        setShowOtpForm(false);
        // Tải lại dữ liệu mới sau khi đã kích hoạt đơn
        handleFetchStatus(searchUuid);
      } else {
        toast.error(response.message || 'Mã OTP không chính xác hoặc đã hết hạn.');
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      toast.error(err.response?.data?.message || 'Lỗi xác minh mã OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  const getStagingStatusLabel = (status) => {
    switch (status) {
      case 'CHO_XAC_MINH':
        return <Alert message="Chưa xác minh" type="warning" showIcon />;
      case 'DA_CHUYEN':
        return <Alert message="Đã xác thực & Chuyển luồng chính" type="success" showIcon />;
      case 'HET_HAN':
        return <Alert message="OTP đã hết hạn xác thực" type="error" showIcon />;
      default:
        return null;
    }
  };

  const getDonationTimeline = (realStatus) => {
    // Map status 'Cho duyet', 'Da duyet', 'Da nhan', 'Tu choi'
    const steps = [
      { title: 'Nộp thông tin quyên góp', description: 'Thông tin tài trợ vãng lai đã gửi', status: 'finish' },
      { title: 'Chờ xác nhận giao dịch', description: 'Chờ bộ phận Kế toán kiểm tra số tiền chuyển khoản', status: realStatus === 'Cho duyet' ? 'process' : ['Da duyet', 'Da nhan'].includes(realStatus) ? 'finish' : realStatus === 'Tu choi' ? 'error' : 'wait' },
      { title: 'Kế toán đã duyệt', description: 'Đã xác nhận chuyển tiền thành công vào quỹ', status: realStatus === 'Da duyet' ? 'process' : realStatus === 'Da nhan' ? 'finish' : 'wait' },
      { title: 'Đã ghi nhận đóng góp', description: 'Admin xác nhận hoàn tất quy trình', status: realStatus === 'Da nhan' ? 'finish' : 'wait' },
    ];

    if (realStatus === 'Tu choi') {
      steps[1].title = 'Từ chối giao dịch';
      steps[1].description = 'Khoản đóng góp bị từ chối';
    }

    return (
      <Timeline mode="left">
        {steps.map((s, idx) => (
          <Timeline.Item 
            key={idx} 
            color={s.status === 'finish' ? 'green' : s.status === 'process' ? 'blue' : s.status === 'error' ? 'red' : 'gray'}
          >
            <strong>{s.title}</strong>
            <p style={{ margin: 0, color: '#666' }}>{s.description}</p>
          </Timeline.Item>
        ))}
      </Timeline>
    );
  };

  return (
    <div className={styles.trackPage}>
      <PublicHeader 
        onLoginClick={openLoginModal}
        onRegisterClick={openRegisterModal}
      />

      <BackgroundImage overlayType="dark">
        <main className={styles.mainContent}>
          <div className={styles.container}>
            <div className={styles.headerSection}>
              <Title level={1} className={styles.pageTitle}>Tra Cứu Tiến Độ Hồ Sơ</Title>
              <Paragraph className={styles.pageSubtitle}>
                Nhập mã UUID do hệ thống cung cấp khi gửi đơn public để kiểm tra trạng thái xét duyệt và tài khoản của bạn.
              </Paragraph>
            </div>

            {/* Thanh Tìm Kiếm */}
            <Card className={styles.searchCard}>
              <div className={styles.searchBarWrapper}>
                <div className={styles.searchInputContainer}>
                  <Input
                    size="lg"
                    placeholder="Nhập mã tra cứu UUID (ví dụ: e5a1d7f0-fc96-48fa-a7e8-...)"
                    leftIcon={<SearchOutlined style={{ fontSize: '18px', color: '#64748b' }} />}
                    value={searchUuid}
                    onChange={(e) => setSearchUuid(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button 
                  type="primary" 
                  size="large" 
                  onClick={handleSearch} 
                  loading={loading}
                  className={styles.searchBtn}
                >
                  Tra Cứu
                </Button>
              </div>
            </Card>

            {loading && (
              <div className={styles.loadingWrapper}>
                <Spin size="large" tip="Đang tải dữ liệu tra cứu..." />
              </div>
            )}

            {error && (
              <div className={styles.resultWrapper}>
                <Alert
                  message="Không tìm thấy thông tin"
                  description={error}
                  type="error"
                  showIcon
                  action={
                    <Button size="small" type="primary" onClick={() => navigate('/apply')}>
                      Nộp đơn mới
                    </Button>
                  }
                />
              </div>
            )}

            {/* Hiển thị chi tiết đơn tìm thấy */}
            {data && (
              <div className={styles.resultWrapper}>
                <Card className={styles.statusCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.titleInfo}>
                      <span className={styles.badge}>
                        {data.type === 'application' ? 'Đơn Xin Hỗ Trợ' : 'Khoản Quyên Góp'}
                      </span>
                      <Title level={3} style={{ margin: '10px 0 0 0' }}>{data.fundName}</Title>
                    </div>
                    <div className={styles.metaInfo}>
                      <Text type="secondary">Ngày gửi: </Text>
                      <Text strong>{new Date(data.createdAt).toLocaleDateString('vi-VN')}</Text>
                    </div>
                  </div>

                  <hr className={styles.divider} />

                  <div className={styles.cardBody}>
                    <div className={styles.infoSection}>
                      <Title level={4}>Thông tin liên hệ</Title>
                      <Paragraph>
                        <Space direction="vertical">
                          <Text><strong>Họ và tên:</strong> {data.name}</Text>
                          <Text><strong>Email:</strong> {data.email}</Text>
                          <Text><strong>Số tiền đăng ký:</strong> <span className={styles.amountText}>{formatCurrency(data.amount)}</span></Text>
                        </Space>
                      </Paragraph>
                    </div>

                    <div className={styles.statusSection}>
                      <Title level={4}>Trạng thái hiện tại</Title>
                      <div style={{ marginBottom: 20 }}>
                        {getStagingStatusLabel(data.stagingStatus)}
                      </div>

                      {/* Nút xác thực OTP trực tiếp trên trang nếu chưa xác thực */}
                      {showOtpForm && (
                        <Card className={styles.otpCard} size="small">
                          <Title level={5} style={{ color: '#d9534f' }}>
                            <ClockCircleOutlined /> Đơn đang chờ xác thực OTP
                          </Title>
                          <Paragraph>
                            Một mã OTP gồm 6 chữ số đã được gửi về email <strong>{data.email}</strong>. Vui lòng nhập mã để kích hoạt đơn.
                          </Paragraph>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '10px' }}>
                            <div style={{ width: 180 }}>
                              <Input
                                maxLength={6}
                                placeholder="Mã OTP 6 số"
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                style={{ textAlign: 'center', letterSpacing: '2px' }}
                              />
                            </div>
                            <Button 
                              type="primary" 
                              danger 
                              onClick={handleVerifyOtp} 
                              loading={otpLoading}
                              style={{ height: '44px', borderRadius: '8px' }}
                            >
                              Kích Hoạt Đơn
                            </Button>
                          </div>
                        </Card>
                      )}

                      {/* Giao diện thông tin tài khoản tự tạo sau khi kích hoạt thành công */}
                      {tempCredentials && (
                        <Alert
                          message="Tài khoản thành viên đã được tạo"
                          description={
                            <div>
                              <p>Chúc mừng! Đơn đã kích hoạt. Bạn có thể đăng nhập bằng thông tin sau:</p>
                              <p><strong>Tài khoản:</strong> {tempCredentials.email}</p>
                              <p><strong>Mật khẩu:</strong> <span style={{ fontFamily: 'monospace', fontSize: '15px', color: '#d9534f', fontWeight: 'bold' }}>{tempCredentials.tempPassword}</span></p>
                              <Button type="primary" size="small" onClick={openLoginModal}>Đăng Nhập Ngay</Button>
                            </div>
                          }
                          type="success"
                          showIcon
                          style={{ marginBottom: 20 }}
                        />
                      )}

                      {/* Tiến trình xét duyệt (Chỉ hiện khi đơn đã kích hoạt/verify thành công) */}
                      {data.stagingStatus === 'DA_CHUYEN' && (
                        <div className={styles.timelineWrapper}>
                          {data.type === 'application' ? (
                            <ApplicationStatusStepper 
                              currentStatus={normalizeAppStatus(data.realStatus)} 
                            />
                          ) : (
                            getDonationTimeline(data.realStatus)
                          )}
                          
                          {/* Note từ cán bộ */}
                          {data.note && (
                            <Alert
                              message="Ghi chú từ Hội đồng quản lý quỹ:"
                              description={data.note}
                              type="info"
                              showIcon
                              style={{ marginTop: 20 }}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </main>
      </BackgroundImage>

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

export default TrackPage;
