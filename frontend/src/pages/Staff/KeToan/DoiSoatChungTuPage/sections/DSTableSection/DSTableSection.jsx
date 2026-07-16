import {
  HiEye,
  HiCheckCircle,
  HiFlag,
  HiPaperClip,
  HiExclamationCircle,
  HiTrash,
  HiCheckBadge,
  HiClipboardDocumentCheck,
  HiShieldCheck,
} from 'react-icons/hi2';
import { formatCurrency } from '@utils/formatters';
import styles from './DSTableSection.module.scss';

// ═══════════════════════════════════════════════════════════════════════════════
// ─── DS TABLE SECTION ──────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
// CÔNG DỤNG: Bảng giao dịch động theo tab
// ═══════════════════════════════════════════════════════════════════════════════

const DSTableSection = ({
  list,
  isLoading,
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  onViewDetail,
  activeTab,
  onDoiSoat,
  onGanCo,
  onResolve,
  onRemoveFlag,
}) => {
  // ─── LOADING SKELETON ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className={styles.card}>
        <div className={styles.skeletonWrapper}>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className={styles.skeletonRow} />
          ))}
        </div>
      </div>
    );
  }

  // ─── EMPTY STATE ───────────────────────────────────────────────────────────
  if (list.length === 0) {
    const emptyConfig = {
      can_doi_soat: {
        icon: HiCheckBadge,
        color: '#86efac',
        title: 'Tất cả đã được đối soát!',
        subtitle: 'Không có giao dịch nào chờ kiểm tra',
      },
      da_doi_soat: {
        icon: HiClipboardDocumentCheck,
        color: '#cbd5e1',
        title: 'Chưa có giao dịch đã đối soát',
        subtitle: '',
      },
      bat_thuong: {
        icon: HiShieldCheck,
        color: '#86efac',
        title: 'Không phát hiện bất thường',
        subtitle: 'Hệ thống đang hoạt động bình thường',
      },
    };

    const config = emptyConfig[activeTab];
    const Icon = config.icon;

    return (
      <div className={styles.card}>
        <div className={styles.emptyState}>
          <Icon className={styles.emptyIcon} style={{ color: config.color }} />
          <p className={styles.emptyTitle}>{config.title}</p>
          {config.subtitle && (
            <p className={styles.emptySubtitle}>{config.subtitle}</p>
          )}
        </div>
      </div>
    );
  }

  // ─── CALCULATE CHENH LECH ──────────────────────────────────────────────────
  const calculateChenhLech = (soTienThucTe, soTien) => {
    if (!soTienThucTe) return null;
    return soTienThucTe - soTien;
  };

  // ─── RENDER CHENH LECH BADGE ───────────────────────────────────────────────
  const renderChenhLechBadge = (chenhLech) => {
    if (chenhLech === null || chenhLech === 0) {
      return (
        <span className={`${styles.badge} ${styles.badgeSuccess}`}>
          <HiCheckCircle size={13} />
          Khớp
        </span>
      );
    }

    if (chenhLech > 0) {
      return (
        <span className={`${styles.badge} ${styles.badgeWarning}`}>
          +{formatCurrency(chenhLech)}
        </span>
      );
    }

    return (
      <span className={`${styles.badge} ${styles.badgeDanger}`}>
        {formatCurrency(chenhLech)}
      </span>
    );
  };

  // ─── RENDER TABLE ──────────────────────────────────────────────────────────
  return (
    <div className={styles.card}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          {/* HEADER - Tab "Chưa đối soát" */}
          {activeTab === 'can_doi_soat' && (
            <thead>
              <tr>
                <th style={{ width: '4%' }}>STT</th>
                <th style={{ width: '10%' }}>MÃ GD</th>
                <th style={{ width: '8%' }}>LOẠI</th>
                <th style={{ width: '20%' }}>ĐỐI TƯỢNG</th>
                <th style={{ width: '15%' }}>QUỸ</th>
                <th style={{ width: '13%' }}>SỐ TIỀN</th>
                <th style={{ width: '12%' }}>MINH CHỨNG</th>
                <th style={{ width: '10%' }}>NGÀY TẠO</th>
                <th style={{ width: '8%' }}>THAO TÁC</th>
              </tr>
            </thead>
          )}

          {/* HEADER - Tab "Đã đối soát" */}
          {activeTab === 'da_doi_soat' && (
            <thead>
              <tr>
                <th style={{ width: '4%' }}>STT</th>
                <th style={{ width: '8%' }}>MÃ GD</th>
                <th style={{ width: '7%' }}>LOẠI</th>
                <th style={{ width: '18%' }}>ĐỐI TƯỢNG</th>
                <th style={{ width: '13%' }}>QUỸ</th>
                <th style={{ width: '11%' }}>SỐ TIỀN HT</th>
                <th style={{ width: '11%' }}>SỐ TIỀN THỰC TẾ</th>
                <th style={{ width: '10%' }}>CHÊNH LỆCH</th>
                <th style={{ width: '10%' }}>NGƯỜI ĐỐI SOÁT</th>
                <th style={{ width: '8%' }}>NGÀY ĐỐI SOÁT</th>
              </tr>
            </thead>
          )}

          {/* HEADER - Tab "Bất thường" */}
          {activeTab === 'bat_thuong' && (
            <thead>
              <tr>
                <th style={{ width: '4%' }}>STT</th>
                <th style={{ width: '8%' }}>MÃ GD</th>
                <th style={{ width: '7%' }}>LOẠI</th>
                <th style={{ width: '18%' }}>ĐỐI TƯỢNG</th>
                <th style={{ width: '12%' }}>SỐ TIỀN</th>
                <th style={{ width: '28%' }}>LÝ DO BẤT THƯỜNG</th>
                <th style={{ width: '10%' }}>NGÀY GẮN CỜ</th>
                <th style={{ width: '13%' }}>THAO TÁC</th>
              </tr>
            </thead>
          )}

          {/* BODY */}
          <tbody>
            {list.map((item, index) => {
              const stt = (currentPage - 1) * pageSize + index + 1;
              const hasMinChung = !!item.minh_chung_url;
              const chenhLech = calculateChenhLech(
                item.so_tien_thuc_te,
                item.so_tien
              );

              return (
                <tr
                  key={item.transaction_id}
                  className={
                    activeTab === 'can_doi_soat' && !hasMinChung
                      ? styles.rowMissingProof
                      : activeTab === 'bat_thuong'
                      ? styles.rowAbnormal
                      : ''
                  }
                  onClick={
                    activeTab === 'da_doi_soat'
                      ? () => onViewDetail(item)
                      : undefined
                  }
                  style={
                    activeTab === 'da_doi_soat'
                      ? { cursor: 'pointer' }
                      : undefined
                  }
                >
                  <td>{stt}</td>
                  <td className={styles.cellMaGD}>{item.transaction_id}</td>
                  <td>
                    <span
                      className={
                        item.loai === 'Thu'
                          ? styles.badgeLoaiThu
                          : styles.badgeLoaiChi
                      }
                    >
                      {item.loai}
                    </span>
                  </td>
                  <td className={styles.cellDoiTuong}>
                    {item.ho_ten || item.ten_nha_tai_tro || '—'}
                    {item.ma_so_dinh_danh && (
                      <span className={styles.cellMaSo}>
                        {item.ma_so_dinh_danh}
                      </span>
                    )}
                  </td>

                  {/* Tab "Chưa đối soát" */}
                  {activeTab === 'can_doi_soat' && (
                    <>
                      <td>{item.ten_quy}</td>
                      <td className={styles.cellSoTien}>
                        {formatCurrency(item.so_tien)}
                      </td>
                      <td>
                        {hasMinChung ? (
                          <span
                            className={`${styles.badge} ${styles.badgeProofYes}`}
                          >
                            <HiPaperClip size={13} />
                            Có chứng từ
                          </span>
                        ) : (
                          <span
                            className={`${styles.badge} ${styles.badgeProofNo}`}
                          >
                            <HiExclamationCircle size={13} />
                            Thiếu chứng từ
                          </span>
                        )}
                      </td>
                      <td className={styles.cellDate}>
                        {new Date(item.ngay_giao_dich).toLocaleDateString(
                          'vi-VN'
                        )}
                      </td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button
                            className={styles.btnView}
                            onClick={() => onViewDetail(item)}
                            title="Xem chi tiết"
                          >
                            <HiEye size={16} />
                          </button>
                          <button
                            className={styles.btnCheck}
                            onClick={() => onDoiSoat(item)}
                            title="Đánh dấu đã đối soát"
                          >
                            <HiCheckCircle size={16} />
                          </button>
                          <button
                            className={styles.btnFlag}
                            onClick={() => onGanCo(item)}
                            title="Gắn cờ bất thường"
                          >
                            <HiFlag size={16} />
                          </button>
                        </div>
                      </td>
                    </>
                  )}

                  {/* Tab "Đã đối soát" */}
                  {activeTab === 'da_doi_soat' && (
                    <>
                      <td>{item.ten_quy}</td>
                      <td className={styles.cellSoTien}>
                        {formatCurrency(item.so_tien)}
                      </td>
                      <td className={styles.cellSoTien}>
                        {item.so_tien_thuc_te
                          ? formatCurrency(item.so_tien_thuc_te)
                          : '—'}
                      </td>
                      <td>{renderChenhLechBadge(chenhLech)}</td>
                      <td className={styles.cellNguoiDoiSoat}>
                        {item.doi_soat_boi_ten || '—'}
                      </td>
                      <td className={styles.cellDate}>
                        {item.doi_soat_luc
                          ? new Date(item.doi_soat_luc).toLocaleDateString(
                              'vi-VN'
                            )
                          : '—'}
                      </td>
                    </>
                  )}

                  {/* Tab "Bất thường" */}
                  {activeTab === 'bat_thuong' && (
                    <>
                      <td className={styles.cellSoTien}>
                        {formatCurrency(item.so_tien)}
                      </td>
                      <td>
                        <div className={styles.cellLyDo}>
                          {item.doi_soat_ghi_chu || 'Không có ghi chú'}
                        </div>
                      </td>
                      <td className={styles.cellDate}>
                        {item.doi_soat_luc
                          ? new Date(item.doi_soat_luc).toLocaleDateString(
                              'vi-VN'
                            )
                          : '—'}
                      </td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button
                            className={styles.btnView}
                            onClick={() => onViewDetail(item)}
                            title="Xem chi tiết"
                          >
                            <HiEye size={16} />
                          </button>
                          <button
                            className={styles.btnCheck}
                            onClick={() => onResolve(item)}
                            title="Đã xử lý, chuyển sang Đã đối soát"
                          >
                            <HiCheckCircle size={16} />
                          </button>
                          <button
                            className={styles.btnTrash}
                            onClick={() => onRemoveFlag(item)}
                            title="Xóa flag bất thường"
                          >
                            <HiTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className={styles.pagination}>
        <span className={styles.paginationInfo}>
          Hiển thị {(currentPage - 1) * pageSize + 1} –{' '}
          {Math.min(currentPage * pageSize, totalCount)} trong {totalCount}{' '}
          giao dịch
        </span>
        <div className={styles.paginationButtons}>
          <button
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            Trước
          </button>
          <span className={styles.paginationCurrent}>{currentPage}</span>
          <button
            disabled={currentPage * pageSize >= totalCount}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Tiếp
          </button>
        </div>
      </div>
    </div>
  );
};

export default DSTableSection;
