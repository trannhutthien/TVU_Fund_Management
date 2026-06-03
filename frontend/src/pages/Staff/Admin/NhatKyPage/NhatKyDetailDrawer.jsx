import { useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  HiOutlineDocumentMagnifyingGlass,
  HiOutlineXMark,
  HiOutlineComputerDesktop,
  HiOutlineCheckBadge,
} from 'react-icons/hi2';
import Button from '@components/common/Button';
import { HANH_DONG_CONFIG } from './NhatKyTable';
import styles from './NhatKyDetailDrawer.module.scss';

const ROLE_LABEL = {
  1: 'Admin',
  2: 'Kế toán',
  3: 'Cán bộ',
};

const highlightJson = (jsonObj) => {
  if (!jsonObj) return '';
  let jsonStr = '';
  if (typeof jsonObj === 'string') {
    try {
      const parsed = JSON.parse(jsonObj);
      jsonStr = JSON.stringify(parsed, null, 2);
    } catch {
      jsonStr = jsonObj;
    }
  } else {
    jsonStr = JSON.stringify(jsonObj, null, 2);
  }

  // Escape HTML characters
  jsonStr = jsonStr
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Regex highlighting
  return jsonStr.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      let cls = styles.jsonNumber;
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = styles.jsonKey;
        } else {
          cls = styles.jsonString;
        }
      } else if (/true|false/.test(match)) {
        cls = styles.jsonBoolean;
      } else if (/null/.test(match)) {
        cls = styles.jsonNull;
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
};

const JsonViewer = ({ data }) => {
  if (!data) return <span className={styles.nullSpan}>null</span>;

  let highlighted = '';
  try {
    highlighted = highlightJson(data);
  } catch (e) {
    highlighted = String(data);
  }

  return (
    <pre
      className={styles.jsonPre}
      dangerouslySetInnerHTML={{ __html: highlighted }}
    />
  );
};

JsonViewer.propTypes = {
  data: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.array]),
};

const NhatKyDetailDrawer = ({ log, onClose }) => {
  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (log) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [log]);

  if (!log) return null;

  const actionConf = HANH_DONG_CONFIG[log.hanh_dong] || {
    icon: HiOutlineCheckBadge,
    color: '#64748b',
    bg: 'rgba(100,116,139,0.08)',
    label: log.hanh_dong || 'KHÁC',
  };

  const ActionIcon = actionConf.icon;

  const formatFullTime = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.toLocaleDateString('vi-VN')} lúc ${d.toLocaleTimeString('vi-VN')}`;
  };

  // Convert old/new data string/object safely
  const parseJsonData = (val) => {
    if (!val) return null;
    if (typeof val === 'object') return val;
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  };

  const dataCu = parseJsonData(log.du_lieu_cu);
  const dataMoi = parseJsonData(log.du_lieu_moi);
  const hasChanges = dataCu !== null || dataMoi !== null;

  return (
    <>
      {/* Backdrop */}
      <div className={styles.backdrop} onClick={onClose} />

      {/* Drawer Container */}
      <div className={styles.drawer}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <HiOutlineDocumentMagnifyingGlass size={22} className={styles.headerIcon} />
            <div>
              <h2 className={styles.headerTitle}>Chi tiết nhật ký</h2>
              <span className={styles.headerId}>ID: LOG#{log.log_id}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="small"
            onClick={onClose}
            className={styles.closeBtn}
            leftIcon={<HiOutlineXMark size={20} />}
          />
        </div>

        {/* Body */}
        <div className={styles.body}>
          {/* Khối A - Tổng quan */}
          <div
            className={styles.overviewCard}
            style={{
              background: `linear-gradient(135deg, white 0%, ${actionConf.bg} 100%)`,
              borderLeft: `4px solid ${actionConf.color}`,
            }}
          >
            <div className={styles.gridInfo}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>HÀNH ĐỘNG</span>
                <span
                  className={styles.actionBadge}
                  style={{ color: actionConf.color, backgroundColor: actionConf.bg }}
                >
                  <ActionIcon size={12} className={styles.actionIcon} />
                  <span>{actionConf.label.toUpperCase()}</span>
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>THỜI GIAN</span>
                <span className={styles.infoValue}>{formatFullTime(log.created_at)}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>LOẠI ĐỐI TƯỢNG</span>
                <span className={styles.infoValue}>{log.loai_doi_tuong || '—'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>ID ĐỐI TƯỢNG</span>
                <span className={`${styles.infoValue} ${styles.mono}`}>
                  {log.doi_tuong_id ? `#${log.doi_tuong_id}` : '—'}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>ĐỊA CHỈ IP</span>
                <span className={`${styles.infoValue} ${styles.mono}`}>{log.ip_address || '—'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>NGƯỜI THỰC HIỆN</span>
                <span className={styles.infoValue}>
                  {log.nguoi_thuc_hien ? (
                    <span className={styles.userText}>
                      <strong>{log.nguoi_thuc_hien.ho_ten}</strong>
                      <span className={styles.userRole}>
                        ({ROLE_LABEL[log.nguoi_thuc_hien.role_id] || 'Nhân viên'})
                      </span>
                    </span>
                  ) : (
                    <span className={styles.systemText}>
                      <HiOutlineComputerDesktop size={14} /> Hệ thống
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Khối B - Mô tả */}
          {log.mo_ta && (
            <div className={styles.section}>
              <span className={styles.sectionTitle}>MÔ TẢ CHI TIẾT</span>
              <div className={styles.descCard}>
                <p className={styles.descText}>{log.mo_ta}</p>
              </div>
            </div>
          )}

          {/* Khối C - Dữ liệu thay đổi */}
          {hasChanges && (
            <div className={styles.section}>
              <div className={styles.sectionHeaderRow}>
                <span className={styles.sectionTitle}>DỮ LIỆU THAY ĐỔI</span>
                <span className={styles.sectionSub}>Trước ➔ Sau khi thao tác</span>
              </div>

              {/* TH1: Chỉ có dữ liệu mới (Tạo mới) */}
              {dataMoi !== null && dataCu === null && (
                <div className={styles.dataDiffBox}>
                  <div className={`${styles.banner} ${styles.bannerSuccess}`}>
                    ✅ Bản ghi mới được tạo
                  </div>
                  <JsonViewer data={dataMoi} />
                </div>
              )}

              {/* TH2: Có cả cũ và mới (Cập nhật) */}
              {dataMoi !== null && dataCu !== null && (
                <div className={styles.diffGrid}>
                  <div className={styles.diffCol}>
                    <div className={`${styles.banner} ${styles.bannerDanger}`}>
                      Trước khi thay đổi
                    </div>
                    <JsonViewer data={dataCu} />
                  </div>
                  <div className={styles.diffCol}>
                    <div className={`${styles.banner} ${styles.bannerSuccess}`}>
                      Sau khi thay đổi
                    </div>
                    <JsonViewer data={dataMoi} />
                  </div>
                </div>
              )}

              {/* TH3: Chỉ có dữ liệu cũ (Xóa) */}
              {dataCu !== null && dataMoi === null && (
                <div className={styles.dataDiffBox}>
                  <div className={`${styles.banner} ${styles.bannerDanger}`}>
                    ❌ Bản ghi đã bị xóa
                  </div>
                  <JsonViewer data={dataCu} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <Button
            variant="outline"
            fullWidth
            onClick={onClose}
            leftIcon={<HiOutlineXMark size={16} />}
          >
            Đóng
          </Button>
        </div>
      </div>
    </>
  );
};

NhatKyDetailDrawer.propTypes = {
  log: PropTypes.shape({
    log_id: PropTypes.number.isRequired,
    hanh_dong: PropTypes.string,
    loai_doi_tuong: PropTypes.string,
    doi_tuong_id: PropTypes.number,
    mo_ta: PropTypes.string,
    ip_address: PropTypes.string,
    created_at: PropTypes.string.isRequired,
    du_lieu_cu: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    du_lieu_moi: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    nguoi_thuc_hien: PropTypes.shape({
      ho_ten: PropTypes.string.isRequired,
      email: PropTypes.string,
      role_id: PropTypes.number.isRequired,
    }),
  }),
  onClose: PropTypes.func.isRequired,
};

export default NhatKyDetailDrawer;
