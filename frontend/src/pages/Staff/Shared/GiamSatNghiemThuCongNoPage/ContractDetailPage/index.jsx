import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  HiOutlineArrowLeft,
  HiOutlineCurrencyDollar,
  HiOutlineCheckCircle,
  HiOutlineXMark,
  HiOutlineBellAlert,
} from 'react-icons/hi2';
import { useAuth } from '@context/AuthContext';
import congNoService from '@services/congNoService';
import { formatCurrency } from '@utils/formatters';
import DuyetXacNhanModal from '../tabs/CongNoTab/DuyetXacNhanModal/index.jsx';
import styles from './ContractDetailPage.module.scss';

const TRANG_THAI_BADGES = {
  'Chua den han': { label: 'Chua den han', color: '#64748b', bg: '#f1f5f9' },
  'Qua han': { label: 'Qua han', color: '#dc2626', bg: 'rgba(220, 38, 38, 0.08)' },
  'Tra mot phan': { label: 'Tra mot phan', color: '#d97706', bg: 'rgba(217, 119, 6, 0.08)' },
  'Da tra': { label: 'Da tra', color: '#16a34a', bg: 'rgba(22, 163, 74, 0.08)' },
};

const XAC_NHAN_BADGES = {
  'Cho xac nhan': { label: 'Cho xac nhan', color: '#7c3aed', bg: 'rgba(124, 58, 237, 0.08)' },
  'Da xac nhan': { label: 'Da xac nhan', color: '#16a34a', bg: 'rgba(22, 163, 74, 0.08)' },
  'Bi tu choi': { label: 'Tu choi', color: '#dc2626', bg: 'rgba(220, 38, 38, 0.08)' },
};

const ContractDetailPage = () => {
  const { yeucauhotroId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [contractData, setContractData] = useState(null);
  const [lichTraNo, setLichTraNo] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedRow, setSelectedRow] = useState(null);
  const [showDuyetModal, setShowDuyetModal] = useState(false);

  const userRole = user?.roleId || user?.role_id || user?.vaiTro || user?.role?.id;
  const isKeToan = userRole === 2;

  const hopdongId = location.state?.hopdongId;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (hopdongId) {
        const res = await congNoService.getDanhSachKyTraNo(hopdongId);
        setLichTraNo(res.data?.data || []);
      } else if (yeucauhotroId) {
        // Fallback: use getChiTiet which returns both hopdong and lichTraNo
        const res = await congNoService.getChiTiet(yeucauhotroId);
        const data = res.data?.data || null;
        if (data) {
          setContractData(data);
          setLichTraNo(data.lichTraNo || []);
        }
      }
    } catch {
      toast.error('Khong tai duoc lich tra no');
    } finally {
      setLoading(false);
    }
  }, [hopdongId, yeucauhotroId]);

  const fetchContractInfo = useCallback(async () => {
    if (!yeucauhotroId) return;
    try {
      const res = await congNoService.getChiTiet(yeucauhotroId);
      setContractData(res.data?.data || null);
    } catch {
      // Silent fail
    }
  }, [yeucauhotroId]);

  useEffect(() => {
    fetchData();
    fetchContractInfo();
  }, [fetchData, fetchContractInfo]);

  const handleBack = () => {
    navigate('/giam-sat');
  };

  const handleDuyet = (row) => {
    setSelectedRow(row);
    setShowDuyetModal(true);
  };

  const handleReminder = async (row) => {
    try {
      await congNoService.sendReminder(row.lichtrano_id);
      toast.success('Da gui nhac no');
    } catch {
      toast.error('Khong gui duoc nhac no');
    }
  };

  const handleDuyetSuccess = () => {
    setShowDuyetModal(false);
    setSelectedRow(null);
    fetchData();
  };

  // Calculate summary from lichTraNo
  const tongSoKy = lichTraNo.length;
  const kyDaTra = lichTraNo.filter((k) => k.trangthai === 'Da tra').length;
  const kyQuaHan = lichTraNo.filter((k) => k.trangthai === 'Qua han').length;
  const kyChoXacNhan = lichTraNo.filter((k) => k.trangthaixacnhan === 'Cho xac nhan' && k.trangthai !== 'Da tra').length;
  const tongNo = lichTraNo.reduce((acc, k) => {
    if (k.trangthai === 'Da tra') return acc;
    return acc + (Number(k.sotiengocphaitra) + Number(k.sotienlaiphaitra)) - Number(k.sotienthuctra || 0);
  }, 0);

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        {/* Header */}
        <header className={styles.header}>
          <button type="button" className={styles.backBtn} onClick={handleBack}>
            <HiOutlineArrowLeft size={18} />
            <span>Quay lai</span>
          </button>
          <div className={styles.headerTitleRow}>
            <div className={styles.headerTitle}>
              <HiOutlineCurrencyDollar size={22} className={styles.headerIcon} />
              <div>
                <h1 className={styles.title}>Hop dong vay von #{hopdongId}</h1>
                <span className={styles.subtitle}>Chi tiet cong no va lich tra</span>
              </div>
            </div>
          </div>
        </header>

        {/* Loading */}
        {loading && (
          <div className={styles.loadingBox}>Dang tai du lieu...</div>
        )}

        {/* Content */}
        {!loading && (
          <>
            {/* Contract Info Card */}
            {contractData && contractData.hopdong && (
              <div className={styles.infoCard}>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Nguoi vay</span>
                    <span className={styles.infoValue}>{contractData.hopdong.nguoi_nhan_ten}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Email</span>
                    <span className={styles.infoValue}>{contractData.hopdong.nguoi_nhan_email}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Quy</span>
                    <span className={styles.infoValue}>{contractData.hopdong.tenquy}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>So tien vay</span>
                    <span className={styles.infoValue}>{formatCurrency(contractData.hopdong.sotienvon)}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Lai suat</span>
                    <span className={styles.infoValue}>{contractData.hopdong.laisuatphantram}%/nam</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Ky han</span>
                    <span className={styles.infoValue}>{contractData.hopdong.kyhandothang} thang</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Ngay den han</span>
                    <span className={styles.infoValue}>
                      {new Date(contractData.hopdong.ngaydaohan).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Trang thai</span>
                    <span className={styles.infoValue}>{contractData.hopdong.hd_trangthai || contractData.hopdong.trangthai}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Summary Cards */}
            <div className={styles.summaryRow}>
              <div className={styles.summaryCard}>
                <span className={styles.summaryLabel}>Tong no</span>
                <span className={`${styles.summaryValue} ${styles.textRed}`}>{formatCurrency(tongNo)}</span>
              </div>
              <div className={styles.summaryCard}>
                <span className={styles.summaryLabel}>Ky qua han</span>
                <span className={`${styles.summaryValue} ${kyQuaHan > 0 ? styles.textRed : ''}`}>
                  {kyQuaHan}/{tongSoKy}
                </span>
              </div>
              <div className={styles.summaryCard}>
                <span className={styles.summaryLabel}>Cho xac nhan</span>
                <span className={`${styles.summaryValue} ${kyChoXacNhan > 0 ? styles.textPurple : ''}`}>
                  {kyChoXacNhan}/{tongSoKy}
                </span>
              </div>
              <div className={styles.summaryCard}>
                <span className={styles.summaryLabel}>Da tra</span>
                <span className={`${styles.summaryValue} ${styles.textGreen}`}>{kyDaTra}/{tongSoKy}</span>
              </div>
            </div>

            {/* Lich tra no table */}
            <div className={styles.tableWrap}>
              <h3 className={styles.tableTitle}>Lich tra no</h3>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Ky</th>
                    <th>Ngay den han</th>
                    <th>Goc phai tra</th>
                    <th>Lai phai tra</th>
                    <th>Thuc tra</th>
                    <th>Con lai</th>
                    <th>Trang thai</th>
                    <th>Minh chung</th>
                    {isKeToan && <th>Hanh dong</th>}
                  </tr>
                </thead>
                <tbody>
                  {lichTraNo.length === 0 ? (
                    <tr>
                      <td colSpan={isKeToan ? 9 : 8} className={styles.emptyCell}>
                        Khong co ky tra nao
                      </td>
                    </tr>
                  ) : lichTraNo.map((row) => {
                    const ttBadge = TRANG_THAI_BADGES[row.trangthai] || TRANG_THAI_BADGES['Chua den han'];
                    const xnBadge = XAC_NHAN_BADGES[row.trangthaixacnhan] || XAC_NHAN_BADGES['Cho xac nhan'];
                    const soPhaiTra = Number(row.sotiengocphaitra) + Number(row.sotienlaiphaitra);
                    const thucTra = Number(row.sotienthuctra || 0);
                    const conLai = soPhaiTra - thucTra;
                    const isOverdue = row.trangthai === 'Qua han';

                    return (
                      <tr key={row.lichtrano_id} className={isOverdue ? styles.rowOverdue : ''}>
                        <td className={styles.cellCenter}>
                          <span className={styles.kyText}>{row.kythu}</span>
                        </td>
                        <td className={styles.cellDate}>
                          <span className={isOverdue ? styles.textRed : ''}>
                            {new Date(row.ngaydenhan).toLocaleDateString('vi-VN')}
                          </span>
                        </td>
                        <td className={styles.cellAmount}>{formatCurrency(row.sotiengocphaitra)}</td>
                        <td className={styles.cellAmount}>{formatCurrency(row.sotienlaiphaitra)}</td>
                        <td className={styles.cellAmount}>
                          {thucTra > 0 ? formatCurrency(thucTra) : '--'}
                        </td>
                        <td className={styles.cellAmount}>
                          <span style={{ color: conLai > 0 ? '#dc2626' : '#16a34a' }}>
                            {formatCurrency(conLai > 0 ? conLai : 0)}
                          </span>
                        </td>
                        <td>
                          <div className={styles.badgeCol}>
                            <span className={styles.ttBadge} style={{ color: ttBadge.color, background: ttBadge.bg }}>
                              {ttBadge.label}
                            </span>
                            <span className={styles.xnBadge} style={{ color: xnBadge.color, background: xnBadge.bg }}>
                              {xnBadge.label}
                            </span>
                          </div>
                        </td>
                        <td className={styles.cellCenter}>
                          {row.minhchungtrano ? (
                            <a href={row.minhchungtrano} target="_blank" rel="noopener noreferrer" className={styles.fileLink}>
                              Xem
                            </a>
                          ) : (
                            <span className={styles.noFile}>Chua nop</span>
                          )}
                        </td>
                        {isKeToan && (
                          <td>
                            <div className={styles.actionCol}>
                              {row.trangthaixacnhan === 'Cho xac nhan' && row.minhchungtrano && (
                                <button
                                  type="button"
                                  className={styles.duyetBtn}
                                  onClick={() => handleDuyet(row)}
                                >
                                  <HiOutlineCheckCircle size={13} />
                                  <span>Duyet</span>
                                </button>
                              )}
                              {row.trangthaixacnhan === 'Cho xac nhan' && !row.minhchungtrano && isOverdue && (
                                <button
                                  type="button"
                                  className={styles.nhacBtn}
                                  onClick={() => handleReminder(row)}
                                >
                                  <HiOutlineBellAlert size={13} />
                                  <span>Nhac</span>
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Empty state */}
        {!loading && !hopdongId && (
          <div className={styles.emptyBox}>
            <p>Khong tim thay hop dong. Vui long quay lai trang truoc.</p>
          </div>
        )}
      </div>

      {/* Duyet modal */}
      {showDuyetModal && selectedRow && (
        <DuyetXacNhanModal
          data={selectedRow}
          onConfirm={handleDuyetSuccess}
          onClose={() => { setShowDuyetModal(false); setSelectedRow(null); }}
        />
      )}
    </div>
  );
};

export default ContractDetailPage;
