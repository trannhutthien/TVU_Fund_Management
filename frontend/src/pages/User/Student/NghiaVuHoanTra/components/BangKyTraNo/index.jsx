import React from 'react';
import { UploadOutlined, CloseCircleOutlined, CheckCircleOutlined, ClockCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { formatCurrency } from '@utils/formatters';
import styles from './index.module.scss';

const isOverdue = (ngaydenhan) => {
  if (!ngaydenhan) return false;
  return new Date(ngaydenhan) < new Date();
};

const daysUntilDue = (ngaydenhan) => {
  if (!ngaydenhan) return null;
  const diff = new Date(ngaydenhan) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const isNearDue = (ngaydenhan) => {
  const days = daysUntilDue(ngaydenhan);
  return days !== null && days >= 0 && days <= 7;
};

const STATUS_CONFIG = {
  'Da tra': { label: 'Đã trả', icon: CheckCircleOutlined, className: styles.statusPaid, dotClass: styles.dotPaid },
  'Da xac nhan': { label: 'Đã xác nhận', icon: CheckCircleOutlined, className: styles.statusPaid, dotClass: styles.dotPaid },
  'Cho xac nhan': { label: 'Chờ xác nhận', icon: ClockCircleOutlined, className: styles.statusPending, dotClass: styles.dotPending },
  'Bi tu choi': { label: 'Bị từ chối', icon: WarningOutlined, className: styles.statusRejected, dotClass: styles.dotRejected },
  'Qua han': { label: 'Quá hạn', icon: WarningOutlined, className: styles.statusOverdue, dotClass: styles.dotOverdue },
  'Chua den han': { label: 'Chưa đến hạn', icon: ClockCircleOutlined, className: styles.statusUpcoming, dotClass: styles.dotUpcoming },
};

const BangKyTraNo = ({ kyTraNoList, loaiHotro, onSubmitProof, onRevokeProof }) => {
  if (!kyTraNoList || kyTraNoList.length === 0) return null;

  const getShowSubmit = (ky) => {
    const confirmable = ['Cho xac nhan', 'Bi tu choi', null, undefined];
    const showable = ['Qua han', 'Chua den han', 'Tra mot phan'];
    if (!confirmable.includes(ky.trangthaixacnhan)) return false;
    if (!showable.includes(ky.trangThaiKy)) return false;
    if (ky.trangThaiKy === 'Da tra') return false;
    if (isOverdue(ky.ngaydenhan)) return true;
    if (isNearDue(ky.ngaydenhan)) return true;
    return false;
  };

  const getShowRevoke = (ky) => {
    return ky.trangthaixacnhan === 'Cho xac nhan' && ky.minhchungtrano;
  };

  return (
    <div className={styles.tableWrap}>
      <h4 className={styles.tableTitle}>
        Bảng kỳ trả ({kyTraNoList.length} kỳ)
      </h4>
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thNarrow}>Kỳ</th>
              <th>Ngày đến hạn</th>
              <th>Số tiền phải trả</th>
              <th>Trạng thái</th>
              <th>Minh chứng</th>
              <th className={styles.thAction}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {kyTraNoList.map((ky) => {
              const statusKey = ky.trangthaixacnhan === 'Bi tu choi'
                ? 'Bi tu choi'
                : ky.trangThaiKy === 'Da tra' && ky.trangthaixacnhan === 'Da xac nhan'
                  ? 'Da xac nhan'
                  : ky.trangThaiKy;

              const statusCfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG['Chua den han'];
              const StatusIcon = statusCfg.icon;
              const showSubmit = getShowSubmit(ky);
              const showRevoke = getShowRevoke(ky);

              return (
                <tr key={ky.lichtranoId} className={ky.trangThaiKy === 'Qua han' ? styles.rowOverdue : ''}>
                  <td className={styles.tdNarrow}>
                    <span className={styles.kyBadge}>Kỳ {ky.kythu}</span>
                  </td>
                  <td>
                    <span className={styles.dateText}>
                      {ky.ngaydenhan
                        ? new Date(ky.ngaydenhan).toLocaleDateString('vi-VN')
                        : '—'}
                    </span>
                    {isOverdue(ky.ngaydenhan) && ky.trangThaiKy !== 'Da tra' && (
                      <span className={styles.overdueTag}>
                        Quá hạn {Math.abs(daysUntilDue(ky.ngaydenhan))} ngày
                      </span>
                    )}
                    {isNearDue(ky.ngaydenhan) && ky.trangThaiKy !== 'Da tra' && ky.trangThaiKy !== 'Qua han' && (
                      <span className={styles.nearDueTag}>
                        Còn {daysUntilDue(ky.ngaydenhan)} ngày
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={styles.amount}>
                      {formatCurrency(ky.tongPhaiTra)}
                    </span>
                  </td>
                  <td>
                    <div className={styles.statusCell}>
                      <span className={`${styles.statusDot} ${statusCfg.dotClass}`} />
                      <span className={`${styles.statusBadge} ${statusCfg.className}`}>
                        <StatusIcon /> {statusCfg.label}
                      </span>
                      {ky.trangthaixacnhan === 'Bi tu choi' && ky.ghichuxacnhan && (
                        <span className={styles.rejectReason}>
                          Lý do: {ky.ghichuxacnhan}
                        </span>
                      )}
                      {ky.ngaythuctra && (
                        <span className={styles.paidDate}>
                          Trả ngày {new Date(ky.ngaythuctra).toLocaleDateString('vi-VN')}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    {ky.minhchungtrano ? (
                      <a
                        href={ky.minhchungtrano}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.proofLink}
                      >
                        <UploadOutlined /> Xem minh chứng
                      </a>
                    ) : (
                      <span className={styles.noProof}>—</span>
                    )}
                  </td>
                  <td className={styles.tdAction}>
                    {showSubmit && (
                      <button
                        className={styles.submitBtn}
                        onClick={() => onSubmitProof(ky)}
                      >
                        <UploadOutlined /> Nộp minh chứng
                      </button>
                    )}
                    {showRevoke && (
                      <button
                        className={styles.revokeBtn}
                        onClick={() => onRevokeProof(ky.lichtranoId)}
                        title="Hủy minh chứng đã nộp"
                      >
                        <CloseCircleOutlined /> Hủy
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BangKyTraNo;
