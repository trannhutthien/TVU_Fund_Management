import { useState } from 'react';
import {
  HiOutlineCheckBadge,
  HiOutlineClipboardDocumentList,
  HiOutlineComputerDesktop,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineXMark,
} from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import styles from './NhatKyDetailModal.module.scss';

const ROLE_LABEL = {
  1: 'Admin',
  2: 'Kế toán',
  3: 'Cán bộ',
};

const RAW_FIELD_LABELS = {
  nhatkyhethong_id: 'Mã nhật ký',
  nguoidung_id: 'Mã người dùng',
  hanhdong: 'Hành động',
  loaidoituong: 'Loại đối tượng',
  doituong_id: 'Mã đối tượng',
  mota: 'Mô tả',
  dulieucu: 'Dữ liệu cũ',
  dulieumoi: 'Dữ liệu mới',
  ipaddress: 'Địa chỉ IP',
  createdat: 'Thời gian tạo',
};

const formatDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('vi-VN');
};

const parseJsonValue = (value) => {
  if (!value) return null;
  if (typeof value !== 'string') return value;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const formatRawValue = (key, value) => {
  if (value === null || value === undefined || value === '') return '—';
  if (key === 'createdat') return formatDateTime(value);
  if (key === 'dulieucu' || key === 'dulieumoi') {
    const parsed = parseJsonValue(value);
    return typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 2);
  }
  return String(value);
};

const JsonBlock = ({ title, data, emptyLabel }) => {
  const parsed = parseJsonValue(data);

  return (
    <div className={styles.jsonPanel}>
      <div className={styles.jsonTitle}>{title}</div>
      {parsed === null ? (
        <div className={styles.emptyJson}>{emptyLabel}</div>
      ) : (
        <pre className={styles.jsonPre}>
          {typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 2)}
        </pre>
      )}
    </div>
  );
};

const NhatKyDetailModal = ({
  log,
  actionConfig,
  loading = false,
  onClose,
}) => {
  const [showRawFields, setShowRawFields] = useState(false);

  if (!log && !loading) return null;

  const actionConf = actionConfig || {
    bg: 'rgba(100,116,139,0.08)',
    color: '#64748b',
    icon: HiOutlineCheckBadge,
    label: log?.hanh_dong || 'Khác',
  };
  const ActionIcon = actionConf.icon || HiOutlineCheckBadge;
  const rawEntries = Object.entries(log?.raw || {});

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <aside className={styles.drawer}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>
              <HiOutlineClipboardDocumentList />
            </div>
            <div>
              <h2 className={styles.headerTitle}>Chi tiết nhật ký</h2>
              <div className={styles.headerId}>
                {log?.log_id ? `LOG#${log.log_id}` : 'Đang tải'}
              </div>
            </div>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Đóng"
          >
            <HiOutlineXMark />
          </button>
        </div>

        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <span>Đang tải chi tiết nhật ký...</span>
          </div>
        ) : (
          <>
            <section className={styles.profile}>
              <div
                className={styles.actionAvatar}
                style={{ backgroundColor: actionConf.bg, color: actionConf.color }}
              >
                <ActionIcon />
              </div>
              <div className={styles.profileText}>
                <h3 className={styles.profileName}>{actionConf.label}</h3>
                <span
                  className={styles.actionBadge}
                  style={{ backgroundColor: actionConf.bg, color: actionConf.color }}
                >
                  {log.hanh_dong || 'KHAC'}
                </span>
                <div className={styles.profileMeta}>
                  <div>{formatDateTime(log.created_at)}</div>
                  <div>{log.ip_address || 'Không có địa chỉ IP'}</div>
                </div>
              </div>
            </section>

            <section className={styles.statsGrid}>
              <div className={styles.statBox}>
                <div className={styles.statValue}>{log.loai_doi_tuong || '—'}</div>
                <div className={styles.statLabel}>Loại đối tượng</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statValue}>{log.doi_tuong_id || '—'}</div>
                <div className={styles.statLabel}>Mã đối tượng</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statValue}>{log.nguoi_dung_id || 'SYS'}</div>
                <div className={styles.statLabel}>Người dùng</div>
              </div>
            </section>

            <div className={styles.divider} />

            <section className={styles.detailsSection}>
              <div className={styles.sectionTitle}>NGƯỜI THỰC HIỆN</div>
              {log.nguoi_thuc_hien ? (
                <div className={styles.userCard}>
                  <img
                    src={log.nguoi_thuc_hien.avatar}
                    alt={log.nguoi_thuc_hien.ho_ten}
                    className={styles.userAvatar}
                  />
                  <div>
                    <div className={styles.userName}>{log.nguoi_thuc_hien.ho_ten}</div>
                    <div className={styles.userMeta}>
                      {log.nguoi_thuc_hien.email || 'Không có email'}
                    </div>
                    <div className={styles.userRole}>
                      {log.nguoi_thuc_hien.ten_vai_tro ||
                        ROLE_LABEL[log.nguoi_thuc_hien.role_id] ||
                        'Nhân viên'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className={styles.systemUser}>
                  <HiOutlineComputerDesktop />
                  <span>Hệ thống</span>
                </div>
              )}
            </section>

            {log.mo_ta && (
              <>
                <div className={styles.divider} />
                <section className={styles.detailsSection}>
                  <div className={styles.sectionTitle}>MÔ TẢ</div>
                  <div className={styles.descriptionBox}>{log.mo_ta}</div>
                </section>
              </>
            )}

            <div className={styles.divider} />

            <section className={styles.detailsSection}>
              <div className={styles.collapsibleHeader}>
                <span className={styles.sectionTitle}>TẤT CẢ CỘT BẢNG NHATKYHETHONG</span>
                <button
                  type="button"
                  className={styles.toggleBtn}
                  onClick={() => setShowRawFields((prev) => !prev)}
                  aria-expanded={showRawFields}
                >
                  {showRawFields ? (
                    <>
                      <HiOutlineChevronUp />
                      <span>Thu nhỏ</span>
                    </>
                  ) : (
                    <>
                      <HiOutlineChevronDown />
                      <span>Mở rộng</span>
                    </>
                  )}
                </button>
              </div>

              {showRawFields ? (
                <div className={styles.detailsGrid}>
                  {rawEntries.map(([key, value]) => (
                    <div key={key} className={styles.detailRow}>
                      <span className={styles.detailLabel}>
                        {RAW_FIELD_LABELS[key] || key}
                      </span>
                      <span className={`${styles.detailValue} ${(key === 'dulieucu' || key === 'dulieumoi') ? styles.preValue : ''}`}>
                        {formatRawValue(key, value)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.collapsedSummary}>
                  Đang thu gọn {rawEntries.length} cột gốc của bảng nhatkyhethong.
                </div>
              )}
            </section>

            <div className={styles.divider} />

            <section className={styles.historySection}>
              <div className={styles.historyHead}>
                <span className={styles.historyTitle}>DỮ LIỆU THAY ĐỔI</span>
              </div>
              <div className={styles.diffGrid}>
                <JsonBlock
                  title="Trước thay đổi"
                  data={log.du_lieu_cu}
                  emptyLabel="Không có dữ liệu cũ"
                />
                <JsonBlock
                  title="Sau thay đổi"
                  data={log.du_lieu_moi}
                  emptyLabel="Không có dữ liệu mới"
                />
              </div>
            </section>

            <div className={styles.footer}>
              <Button variant="outline" fullWidth onClick={onClose}>
                Đóng
              </Button>
            </div>
          </>
        )}
      </aside>
    </>
  );
};

export default NhatKyDetailModal;
