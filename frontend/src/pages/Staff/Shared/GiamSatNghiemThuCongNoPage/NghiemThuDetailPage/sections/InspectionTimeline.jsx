import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  HiOutlineClipboardDocumentCheck,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineXCircle,
  HiOutlineExclamationTriangle,
  HiOutlineUser,
  HiOutlineChevronDown,
  HiOutlineDocumentText,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineCheck,
} from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import styles from './InspectionTimeline.module.scss';

const KET_QUA_MAP = {
  'Cho danh gia': { label: 'Chờ đánh giá', icon: HiOutlineClock, color: '#94a3b8' },
  'Dat': { label: 'Đạt', icon: HiOutlineCheckCircle, color: '#16a34a' },
  'Dat co dieu chinh': { label: 'Đạt có điều chỉnh', icon: HiOutlineExclamationTriangle, color: '#d97706' },
  'Khong dat': { label: 'Không đạt', icon: HiOutlineXCircle, color: '#dc2626' },
};

const LOAI_KIEM_TRA_LABEL = {
  'Kiem tra tien do': 'Kiểm tra tiến độ',
  'Nghiem thu cuoi cung': 'Nghiệm thu cuối cùng',
};

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.toLocaleDateString('vi-VN')} lúc ${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
};

const InspectionTimeline = ({ history, userRole, userId, onApprove, onEdit, onDelete }) => {
  const [expandedId, setExpandedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  if (!history || history.length === 0) {
    return (
      <div className={styles.empty}>
        <HiOutlineClipboardDocumentCheck size={40} className={styles.emptyIcon} />
        <p className={styles.emptyTitle}>Chưa có lần nghiệm thu nào</p>
        <p className={styles.emptySub}>Bấm "Tạo đợt nghiệm thu" để bắt đầu.</p>
      </div>
    );
  }

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleDeleteClick = (item) => {
    setDeletingId(item.nghiemthuId);
  };

  const handleDeleteConfirm = (item) => {
    onDelete?.(item);
    setDeletingId(null);
  };

  const handleDeleteCancel = () => {
    setDeletingId(null);
  };

  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>
        Lịch sử nghiệm thu
        <span className={styles.countBadge}>{history.length} lần</span>
      </h3>

      <div className={styles.timeline}>
        {history.map((item, idx) => {
          const kq = KET_QUA_MAP[item.ketqua] || KET_QUA_MAP['Cho danh gia'];
          const Icon = kq.icon;
          const isLast = idx === history.length - 1;
          const isFinal = item.loaiKiemTra === 'Nghiem thu cuoi cung';
          const isExpanded = expandedId === (item.nghiemthuId || idx);
          const isPending = item.ketqua === 'Cho danh gia';
          const isCreator = userId && item.nguoiNghiemThuId === userId;
          const canEdit = isPending && (userRole === 1 || isCreator);
          const canDelete = isPending && (userRole === 1 || isCreator);
          const canApprove = isPending && userRole === 1;

          return (
            <div key={item.nghiemthuId || idx} className={`${styles.item} ${isLast ? styles.itemLast : ''} ${isPending ? styles.itemPending : ''}`}>
              <div className={styles.dotCol}>
                <div
                  className={`${styles.dot} ${isFinal ? styles.dotFinal : ''}`}
                  style={{ background: kq.color }}
                >
                  <Icon size={14} className={styles.dotIcon} />
                </div>
                {idx < history.length - 1 && <div className={styles.line} />}
              </div>

              <div className={styles.content}>
                <button
                  type="button"
                  className={styles.titleRow}
                  onClick={() => toggleExpand(item.nghiemthuId || idx)}
                >
                  <span className={styles.lanLabel}>Lần {item.lanthu}</span>
                  {item.dotgiaingan > 1 && (
                    <span className={styles.loaiTag} style={{ background: '#dbeafe', color: '#1d4ed8' }}>
                      Đợt {item.dotgiaingan}
                    </span>
                  )}
                  <span className={`${styles.loaiTag} ${isFinal ? styles.loaiTagFinal : ''}`}>
                    {LOAI_KIEM_TRA_LABEL[item.loaiKiemTra] || item.loaiKiemTra}
                  </span>
                  <span className={styles.ketquaTag} style={{ color: kq.color, background: `${kq.color}12` }}>
                    {kq.label}
                  </span>
                  <HiOutlineChevronDown
                    size={16}
                    className={`${styles.chevron} ${isExpanded ? styles.chevronOpen : ''}`}
                  />
                </button>

                {item.nhanXet && (
                  <div className={styles.nhanxet}>{item.nhanXet}</div>
                )}

                <div className={styles.meta}>
                  {item.tenNguoiNghiemThu && (
                    <span className={styles.metaItem}>
                      <HiOutlineUser size={13} />
                      {item.tenNguoiNghiemThu}
                    </span>
                  )}
                  {item.ngayNghiemThu && (
                    <span className={styles.metaItem}>
                      {formatDate(item.ngayNghiemThu)}
                    </span>
                  )}
                  {item.soQuyetDinh && (
                    <span className={styles.metaItem}>QĐ: {item.soQuyetDinh}</span>
                  )}
                  {item.fileBienBan && (
                    <span className={styles.metaItem}>
                      <a
                        href={item.fileBienBan}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.fileLink}
                      >
                        Tải biên bản
                      </a>
                    </span>
                  )}
                </div>

                {/* Hàng nút hành động — chỉ hiện khi chưa duyệt */}
                {isPending && (canEdit || canDelete || canApprove) && (
                  <div className={styles.actionsRow}>
                    {canApprove && (
                      <button
                        type="button"
                        className={`${styles.actionBtn} ${styles.actionBtnApprove}`}
                        onClick={() => onApprove?.(item)}
                      >
                        <HiOutlineCheck size={13} />
                        Duyệt
                      </button>
                    )}
                    {canEdit && (
                      <button
                        type="button"
                        className={`${styles.actionBtn} ${styles.actionBtnEdit}`}
                        onClick={() => onEdit?.(item)}
                      >
                        <HiOutlinePencilSquare size={13} />
                        Sửa
                      </button>
                    )}
                    {canDelete && (
                      <button
                        type="button"
                        className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                        onClick={() => handleDeleteClick(item)}
                      >
                        <HiOutlineTrash size={13} />
                        Xóa
                      </button>
                    )}
                  </div>
                )}

                {/* Confirm xóa */}
                {deletingId === item.nghiemthuId && (
                  <div className={styles.deleteConfirm}>
                    <span>Xóa nghiệm thu lần {item.lanthu}?</span>
                    <div className={styles.deleteConfirmActions}>
                      <Button variant="ghost" onClick={handleDeleteCancel}>
                        Huỷ
                      </Button>
                      <Button variant="danger" onClick={() => handleDeleteConfirm(item)}>
                        Xóa
                      </Button>
                    </div>
                  </div>
                )}

                {/* Chi tiết mở rộng */}
                {isExpanded && (
                  <div className={styles.detailSection}>
                    <div className={styles.detailGrid}>
                      <div className={styles.detailField}>
                        <span className={styles.detailLabel}>Lần thứ</span>
                        <span className={styles.detailValue}>{item.lanthu}</span>
                      </div>
                      <div className={styles.detailField}>
                        <span className={styles.detailLabel}>Loại kiểm tra</span>
                        <span className={styles.detailValue}>{LOAI_KIEM_TRA_LABEL[item.loaiKiemTra] || item.loaiKiemTra}</span>
                      </div>
                      <div className={styles.detailField}>
                        <span className={styles.detailLabel}>Kết quả</span>
                        <span className={styles.detailValue} style={{ color: kq.color }}>{kq.label}</span>
                      </div>
                      <div className={styles.detailField}>
                        <span className={styles.detailLabel}>Người nghiệm thu</span>
                        <span className={styles.detailValue}>{item.tenNguoiNghiemThu || '—'}</span>
                      </div>
                      <div className={styles.detailField}>
                        <span className={styles.detailLabel}>Ngày tạo</span>
                        <span className={styles.detailValue}>{formatDate(item.ngayTao) || '—'}</span>
                      </div>
                      <div className={styles.detailField}>
                        <span className={styles.detailLabel}>Ngày nghiệm thu</span>
                        <span className={styles.detailValue}>{formatDate(item.ngayNghiemThu) || '—'}</span>
                      </div>
                      {item.soQuyetDinh && (
                        <div className={styles.detailField}>
                          <span className={styles.detailLabel}>Số quyết định</span>
                          <span className={styles.detailValue}>{item.soQuyetDinh}</span>
                        </div>
                      )}
                    </div>
                    {item.nhanXet && (
                      <div className={styles.detailNhanxet}>
                        <span className={styles.detailLabel}>Nhận xét</span>
                        <p>{item.nhanXet}</p>
                      </div>
                    )}
                    {item.fileBienBan && (
                      <div className={styles.detailFile}>
                        <HiOutlineDocumentText size={15} />
                        <a href={item.fileBienBan} target="_blank" rel="noopener noreferrer">
                          Xem tài liệu đính kèm
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

InspectionTimeline.propTypes = {
  history: PropTypes.arrayOf(
    PropTypes.shape({
      nghiemthuId: PropTypes.number,
      lanthu: PropTypes.number,
      loaiKiemTra: PropTypes.string,
      ketqua: PropTypes.string,
      nhanXet: PropTypes.string,
      nguoiNghiemThuId: PropTypes.number,
      tenNguoiNghiemThu: PropTypes.string,
      ngayNghiemThu: PropTypes.string,
      ngayTao: PropTypes.string,
      soQuyetDinh: PropTypes.string,
      fileBienBan: PropTypes.string,
    }),
  ),
  userRole: PropTypes.number,
  userId: PropTypes.number,
  onApprove: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

export default InspectionTimeline;
