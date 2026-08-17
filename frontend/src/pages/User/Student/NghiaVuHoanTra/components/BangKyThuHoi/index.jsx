import React from 'react';
import { CloseCircleOutlined, CheckCircleOutlined, ClockCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { formatCurrency } from '@utils/formatters';
import styles from './index.module.scss';

const STATUS_CONFIG = {
  'Da xac nhan': { label: 'Đã xác nhận', icon: CheckCircleOutlined, className: styles.statusPaid, dotClass: styles.dotPaid },
  'Cho xac nhan': { label: 'Chờ xác nhận', icon: ClockCircleOutlined, className: styles.statusPending, dotClass: styles.dotPending },
  'Bi tu choi': { label: 'Bị từ chối', icon: WarningOutlined, className: styles.statusRejected, dotClass: styles.dotRejected },
};

const BangKyThuHoi = ({ lichSuNopTien, onHuy }) => {
  if (!lichSuNopTien || lichSuNopTien.length === 0) return null;

  return (
    <div className={styles.tableWrap}>
      <h4 className={styles.tableTitle}>
        Lịch sử nộp tiền thu hồi ({lichSuNopTien.length} lần)
      </h4>
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thNarrow}>Lần</th>
              <th>Ngày nộp</th>
              <th>Số tiền nộp</th>
              <th>Trạng thái</th>
              <th className={styles.thAction}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {lichSuNopTien.map((lan, index) => {
              const statusCfg = STATUS_CONFIG[lan.trangthaixacnhan] || STATUS_CONFIG['Cho xac nhan'];
              const StatusIcon = statusCfg.icon;
              const showHuy = lan.trangthaixacnhan === 'Cho xac nhan';

              return (
                <tr key={lan.lan_nop_id || index}>
                  <td className={styles.tdNarrow}>
                    <span className={styles.kyBadge}>{index + 1}</span>
                  </td>
                  <td>
                    <span className={styles.dateText}>
                      {lan.ngaytao
                        ? new Date(lan.ngaytao).toLocaleDateString('vi-VN')
                        : '—'}
                    </span>
                  </td>
                  <td>
                    <span className={styles.amount}>
                      {formatCurrency(lan.sotien)}
                    </span>
                  </td>
                  <td>
                    <div className={styles.statusCell}>
                      <span className={`${styles.statusDot} ${statusCfg.dotClass}`} />
                      <span className={`${styles.statusBadge} ${statusCfg.className}`}>
                        <StatusIcon /> {statusCfg.label}
                      </span>
                      {lan.trangthaixacnhan === 'Bi tu choi' && lan.ghichuxacnhan && (
                        <span className={styles.rejectReason}>
                          Lý do: {lan.ghichuxacnhan}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className={styles.tdAction}>
                    {showHuy && (
                      <button
                        className={styles.revokeBtn}
                        onClick={() => onHuy?.(lan.lan_nop_id)}
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

export default BangKyThuHoi;
