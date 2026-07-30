import PropTypes from 'prop-types';
import {
  HiOutlineUser,
  HiOutlineBuildingLibrary,
  HiOutlineCurrencyDollar,
  HiOutlineDocumentText,
} from 'react-icons/hi2';
import { formatCurrency } from '@utils/formatters';
import styles from './ApplicationInfoCard.module.scss';

const TRANG_THAI_MAP = {
  'Da giai ngan': { label: 'Đã giải ngân', className: 'badgeBlue' },
  'Cho nghiem thu': { label: 'Chờ nghiệm thu', className: 'badgeYellow' },
  'Da nghiem thu': { label: 'Đã nghiệm thu', className: 'badgeGreen' },
  'Nghiem thu khong dat': { label: 'Không đạt', className: 'badgeRed' },
};

const LOAI_HO_TRO_MAP = {
  'Tai tro khong hoan lai': 'Tài trợ không hoàn lại',
  'Tai tro co thu hoi': 'Tài trợ có thu hồi',
  'Cho vay': 'Cho vay',
};

const formatDate = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('vi-VN');
};

const ApplicationInfoCard = ({ data }) => {
  if (!data) return null;

  const st = TRANG_THAI_MAP[data.trangthai] || { label: data.trangthai, className: 'badgeGray' };

  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>Thông tin đơn xin hỗ trợ</h3>

      <div className={styles.grid}>
        <div className={styles.field}>
          <div className={styles.fieldIcon}><HiOutlineUser size={16} /></div>
          <div className={styles.fieldContent}>
            <span className={styles.fieldLabel}>Người nộp đơn</span>
            <span className={styles.fieldValue}>{data.nguoiNhan?.ten}</span>
            <span className={styles.fieldSub}>{data.nguoiNhan?.email}</span>
            {data.nguoiNhan?.masodinhdanh && (
              <span className={styles.fieldSub}>Mã: {data.nguoiNhan?.masodinhdanh}</span>
            )}
          </div>
        </div>

        <div className={styles.field}>
          <div className={styles.fieldIcon}><HiOutlineBuildingLibrary size={16} /></div>
          <div className={styles.fieldContent}>
            <span className={styles.fieldLabel}>Quỹ</span>
            <span className={styles.fieldValue}>{data.quy?.tenquy}</span>
            <span className={styles.fieldSub}>Số dư: {formatCurrency(data.quy?.sodu)}</span>
          </div>
        </div>

        <div className={styles.field}>
          <div className={styles.fieldIcon}><HiOutlineCurrencyDollar size={16} /></div>
          <div className={styles.fieldContent}>
            <span className={styles.fieldLabel}>Số tiền giải ngân</span>
            <span className={styles.fieldValueHighlight}>{formatCurrency(data.sotiendenghi)}</span>
            {data.tongkinhphidudan > 0 && (
              <span className={styles.fieldSub}>Tổng kinh phí dự án: {formatCurrency(data.tongkinhphidudan)}</span>
            )}
          </div>
        </div>

        <div className={styles.field}>
          <div className={styles.fieldIcon}><HiOutlineDocumentText size={16} /></div>
          <div className={styles.fieldContent}>
            <span className={styles.fieldLabel}>Trạng thái & Loại hình</span>
            <div className={styles.badgeRow}>
              <span className={`${styles.badge} ${styles[st.className]}`}>{st.label}</span>
              <span className={`${styles.badge} ${styles.badgePurple}`}>
                {LOAI_HO_TRO_MAP[data.loaihotro] || data.loaihotro}
              </span>
            </div>
            <span className={styles.fieldSub}>Ngày nộp: {formatDate(data.ngaynop)}</span>
          </div>
        </div>
      </div>

      {data.lydo && (
        <div className={styles.reasonBlock}>
          <span className={styles.fieldLabel}>Lý do xin hỗ trợ</span>
          <p className={styles.reasonText}>{data.lydo}</p>
        </div>
      )}
    </div>
  );
};

ApplicationInfoCard.propTypes = {
  data: PropTypes.shape({
    yeucauhotroId: PropTypes.number,
    trangthai: PropTypes.string,
    loaihotro: PropTypes.string,
    lydo: PropTypes.string,
    sotiendenghi: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    tongkinhphidudan: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    ngaynop: PropTypes.string,
    nguoiNhan: PropTypes.object,
    quy: PropTypes.object,
  }),
};

export default ApplicationInfoCard;
