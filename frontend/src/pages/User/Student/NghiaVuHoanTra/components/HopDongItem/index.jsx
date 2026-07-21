import React, { useState } from 'react';
import { DownOutlined, UpOutlined, BankOutlined, FileTextOutlined } from '@ant-design/icons';
import { formatCurrency } from '@utils/formatters';
import BangKyTraNo from '../BangKyTraNo';
import styles from './index.module.scss';

const LOAI_HO_TRO_LABELS = {
  'Cho vay': { label: 'Cho vay', color: '#1d4ed8', bg: '#eff6ff' },
  'Tai tro co thu hoi': { label: 'Tài trợ thu hồi', color: '#c2410c', bg: '#fff7ed' },
};

const HopDongItem = ({ don, onSubmitProof, onRevokeProof }) => {
  const [expanded, setExpanded] = useState(false);

  const isVay = don.loaihotro === 'Cho vay';
  const loaiInfo = LOAI_HO_TRO_LABELS[don.loaihotro] || { label: don.loaihotro, color: '#64748b', bg: '#f1f5f9' };

  // Tính progress
  let totalPaid = 0;
  let totalDue = 0;
  let overdueCount = 0;
  const kyList = isVay ? (don.lichTra || []) : [];

  if (isVay) {
    for (const ky of kyList) {
      totalDue += ky.tongPhaiTra;
      if (ky.trangThaiKy === 'Da tra') {
        totalPaid += ky.sotienthuctra || ky.tongPhaiTra;
      } else if (ky.trangThaiKy === 'Tra mot phan') {
        totalPaid += ky.sotienthuctra || 0;
      }
      if (ky.trangThaiKy === 'Qua han') overdueCount++;
    }
  } else {
    // Tài trợ thu hồi
    totalDue = don.dieuKhoan?.mucthuhoi || 0;
    totalPaid = don.dieuKhoan?.sotiendadathu || 0;
  }

  const progress = totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0;

  return (
    <div className={`${styles.card} ${expanded ? styles.cardExpanded : ''}`}>
      {/* Header */}
      <button className={styles.header} onClick={() => setExpanded(!expanded)}>
        <div className={styles.headerLeft}>
          <span className={styles.fundIcon}>
            <BankOutlined />
          </span>
          <div className={styles.headerInfo}>
            <div className={styles.headerTitle}>
              <span className={styles.fundName}>{don.tenquy}</span>
              <span className={styles.loaiBadge} style={{ color: loaiInfo.color, background: loaiInfo.bg }}>
                {loaiInfo.label}
              </span>
              {overdueCount > 0 && (
                <span className={styles.overdueBadge}>
                  ⚠ {overdueCount} kỳ quá hạn
                </span>
              )}
            </div>
            <div className={styles.headerSub}>
              <span>{don.tieuDe || '—'}</span>
              <span className={styles.dot}>·</span>
              <span>{isVay ? `${kyList.length} kỳ trả` : `Thu hồi ${formatCurrency(totalDue)}`}</span>
              {!isVay && don.dieuKhoan?.conLai > 0 && (
                <>
                  <span className={styles.dot}>·</span>
                  <span className={styles.conLaiText}>Còn nợ {formatCurrency(don.dieuKhoan.conLai)}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className={styles.headerRight}>
          {isVay && (
            <div className={styles.progressWrap}>
              <div className={styles.progressText}>{progress}%</div>
              <div className={styles.progressTrack}>
                <div className={styles.progressFill} style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
          <span className={styles.expandIcon}>
            {expanded ? <UpOutlined /> : <DownOutlined />}
          </span>
        </div>
      </button>

      {/* Expand content */}
      {expanded && (
        <div className={styles.body}>
          {/* Contract info */}
          {isVay && don.hopDong && (
            <div className={styles.contractInfo}>
              <h4 className={styles.sectionTitle}>
                <FileTextOutlined /> Thông tin hợp đồng vay
              </h4>
              <div className={styles.fieldGrid}>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Số tiền vay</span>
                  <span className={styles.fieldValue}>{formatCurrency(don.hopDong.sotienvon)}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Lãi suất</span>
                  <span className={styles.fieldValue}>{don.hopDong.laisuatphantram}%/năm</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Kỳ hạn</span>
                  <span className={styles.fieldValue}>{don.hopDong.kyhandothang} tháng</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Ngày đáo hạn</span>
                  <span className={styles.fieldValue}>
                    {don.hopDong.ngaydaohan ? new Date(don.hopDong.ngaydaohan).toLocaleDateString('vi-VN') : '—'}
                  </span>
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Trạng thái</span>
                  <span className={`${styles.fieldValue} ${styles[`status_${don.hopDong.trangThaiHopDong?.replace(/\s/g, '')}`] || ''}`}>
                    {don.hopDong.trangThaiHopDong || '—'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tài trợ thu hồi info */}
          {!isVay && don.dieuKhoan && (
            <div className={styles.contractInfo}>
              <h4 className={styles.sectionTitle}>
                <FileTextOutlined /> Thông tin tài trợ thu hồi
              </h4>
              <div className={styles.fieldGrid}>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Mức thu hồi</span>
                  <span className={styles.fieldValue}>{formatCurrency(don.dieuKhoan.mucthuhoi)}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Thời hạn hoàn trả</span>
                  <span className={styles.fieldValue}>{don.dieuKhoan.thoihanhoantra_thang} tháng</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Số quyết định</span>
                  <span className={styles.fieldValue}>{don.dieuKhoan.soquyetdinh_hopdong || '—'}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Đã thu</span>
                  <span className={styles.fieldValue}>{formatCurrency(don.dieuKhoan.sotiendadathu)}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Còn lại</span>
                  <span className={`${styles.fieldValue} ${don.dieuKhoan.conLai > 0 ? styles.conLaiRed : styles.status_Da_hoan_tat}`}>
                    {formatCurrency(don.dieuKhoan.conLai)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Bảng kỳ trả (chỉ cho vay) */}
          {isVay && kyList.length > 0 && (
            <BangKyTraNo
              kyTraNoList={kyList}
              loaiHotro={don.loaihotro}
              onSubmitProof={onSubmitProof}
              onRevokeProof={onRevokeProof}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default HopDongItem;
